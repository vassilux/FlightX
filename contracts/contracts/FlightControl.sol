// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IDelphAir {
    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) external returns (bool);

    function transfer(
        address recipient,
        uint256 amount
    ) external returns (bool);

    function balanceOf(address account) external view returns (uint256);
}

contract FlightControl {
    struct Flight {
        uint id;
        address operator; // Adresse de l'utilisateur ayant créé le vol
        string origin; // Lieu de départ
        string destination; // Destination du vol
        uint duration; // Durée du vol en secondes
        string status; // "Grounded", "In Flight", "Landed", "Crashed"
        uint createdAt; // Timestamp de création
        uint turbulenceFeesCollected; // Total des frais collectés pour le vol
        uint securityDeposit; // Montant réservé pour sécuriser le vol
        mapping(address => uint) contributors; // Contributions des utilisateurs
        address[] contributorAddresses; // Liste des adresses des contributeurs
    }

    struct FlightView {
        uint id;
        address operator;
        string origin;
        string destination;
        uint duration;
        string status;
        uint createdAt;
        uint turbulenceFeesCollected;
        uint securityDeposit;
    }

    uint public nextFlightId;
    mapping(uint => Flight) public flights;

    uint[] public activeFlights; // Liste des ID des vols actifs

    IDelphAir public delphAirToken;
    uint public flightCreationFee = 20 * 10 ** 18; // Frais en DLPH pour créer un vol
    uint public turbulenceFee = 10 * 10 ** 18; // Frais en DLPH pour générer une turbulence

    constructor(address _delphAirAddress) {
        delphAirToken = IDelphAir(_delphAirAddress);
    }

    event FlightCreated(
        uint flightId,
        address indexed operator,
        string origin,
        string destination,
        uint duration
    );
    event TurbulenceCreated(uint flightId, address indexed creator);
    event FlightLanded(uint flightId, address indexed operator, uint reward);
    event FlightCrashed(uint flightId, address indexed operator);

    function createFlight(
        string memory origin,
        string memory destination,
        uint duration,
        uint securityDeposit
    ) public {
        require(
            delphAirToken.transferFrom(
                msg.sender,
                address(this),
                flightCreationFee + securityDeposit
            ),
            "Token transfer failed"
        );

        flights[nextFlightId].id = nextFlightId;
        flights[nextFlightId].operator = msg.sender;
        flights[nextFlightId].origin = origin;
        flights[nextFlightId].destination = destination;
        flights[nextFlightId].duration = duration;
        flights[nextFlightId].status = "Grounded";
        flights[nextFlightId].createdAt = block.timestamp;
        flights[nextFlightId].securityDeposit = securityDeposit;

        emit FlightCreated(
            nextFlightId,
            msg.sender,
            origin,
            destination,
            duration
        );
        nextFlightId++;
    }

    // Fonction pour déclencher une turbulence
    function createTurbulence(uint flightId) public {
        require(flightId < nextFlightId, "Flight does not exist");

        Flight storage flight = flights[flightId];

        // Vérifier que le vol est en vol
        require(
            keccak256(bytes(flight.status)) == keccak256(bytes("In Flight")),
            "Flight must be in flight"
        );

        // Vérifier que le vol n'a pas dépassé sa durée
        require(
            block.timestamp <= flight.createdAt + flight.duration,
            "Flight duration has ended"
        );

        // Transférer les tokens pour générer une turbulence
        require(
            delphAirToken.transferFrom(
                msg.sender,
                address(this),
                turbulenceFee
            ),
            "Token transfer failed"
        );

        flight.turbulenceFeesCollected += turbulenceFee;

        // Ajouter le contributeur s'il n'existe pas
        if (flight.contributors[msg.sender] == 0) {
            flight.contributorAddresses.push(msg.sender);
        }

        flight.contributors[msg.sender] += turbulenceFee;

        emit TurbulenceCreated(flightId, msg.sender);
    }

    // Fonction pour décoller un vol
    function takeOff(uint flightId) public {
        require(flightId < nextFlightId, "Flight does not exist");
        require(
            msg.sender == flights[flightId].operator,
            "Only the operator can take off the flight"
        );
        require(
            keccak256(bytes(flights[flightId].status)) ==
                keccak256(bytes("Grounded")),
            "Flight must be grounded"
        );

        flights[flightId].status = "In Flight";
        activeFlights.push(flightId); // Ajouter à la liste des vols actifs
    }

    function removeActiveFlight(uint flightId) internal {
        for (uint i = 0; i < activeFlights.length; i++) {
            if (activeFlights[i] == flightId) {
                activeFlights[i] = activeFlights[activeFlights.length - 1];
                activeFlights.pop();
                break;
            }
        }
    }

    // Fonction pour atterrir un vol et redistribuer les frais collectés
    function landFlight(uint flightId) public {
        require(flightId < nextFlightId, "Flight does not exist");
        require(
            keccak256(bytes(flights[flightId].status)) ==
                keccak256(bytes("In Flight")),
            "Flight must be in flight"
        );
        require(
            block.timestamp >=
                flights[flightId].createdAt + flights[flightId].duration ||
                msg.sender == flights[flightId].operator,
            "Flight duration has not ended or caller is not the operator"
        );

        flights[flightId].status = "Landed";
        removeActiveFlight(flightId); // Retirer de la liste active

        uint reward = flights[flightId].turbulenceFeesCollected;
        flights[flightId].turbulenceFeesCollected = 0;

        if (reward > 0) {
            delphAirToken.transfer(flights[flightId].operator, reward);
        }

        emit FlightLanded(flightId, flights[flightId].operator, reward);
    }

    // Vérifie que la durée du vol n’est pas écoulée avant d’autoriser la création de turbulences.
    function checkFlightStatus(uint flightId) public {
        require(flightId < nextFlightId, "Flight does not exist");

        Flight storage flight = flights[flightId];

        // Si la durée est écoulée et le vol est encore en vol, force l'atterrissage
        if (
            keccak256(bytes(flight.status)) == keccak256(bytes("In Flight")) &&
            block.timestamp >= flight.createdAt + flight.duration
        ) {
            landFlight(flightId);
        }
    }

    // Fonction pour faire crasher un vol
    function crashFlight(uint flightId) public {
        require(flightId < nextFlightId, "Flight does not exist");
        require(
            keccak256(bytes(flights[flightId].status)) ==
                keccak256(bytes("In Flight")),
            "Flight must be in flight"
        );

        Flight storage flight = flights[flightId];

        uint totalContribution = flight.turbulenceFeesCollected;
        require(
            totalContribution > flight.securityDeposit,
            "Flight is not crashed"
        );

        // Redistribuer le dépôt de sécurité aux contributeurs
        for (uint i = 0; i < flight.contributorAddresses.length; i++) {
            address contributor = flight.contributorAddresses[i];
            uint contribution = flight.contributors[contributor];
            uint share = (contribution * flight.securityDeposit) /
                totalContribution;

            if (share > 0) {
                delphAirToken.transfer(contributor, share);
            }
        }

        flight.status = "Crashed";
        emit FlightCrashed(flightId, flight.operator);
    }

    function getFlightsByStatus(
        string memory status
    ) public view returns (FlightView[] memory) {
        uint count = 0;

        // Compter les vols correspondant au statut
        for (uint i = 0; i < nextFlightId; i++) {
            if (
                keccak256(bytes(flights[i].status)) == keccak256(bytes(status))
            ) {
                count++;
            }
        }

        // Créer un tableau des vols correspondant
        FlightView[] memory result = new FlightView[](count);
        uint index = 0;

        for (uint i = 0; i < nextFlightId; i++) {
            if (
                keccak256(bytes(flights[i].status)) == keccak256(bytes(status))
            ) {
                Flight storage flight = flights[i];
                result[index] = FlightView({
                    id: flight.id,
                    operator: flight.operator,
                    origin: flight.origin,
                    destination: flight.destination,
                    duration: flight.duration,
                    status: flight.status,
                    createdAt: flight.createdAt,
                    turbulenceFeesCollected: flight.turbulenceFeesCollected,
                    securityDeposit: flight.securityDeposit
                });
                index++;
            }
        }

        return result;
    }
}
