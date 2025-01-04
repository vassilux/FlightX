# Variables
HARDHAT := npx hardhat
NETWORK := bscTestnet
DEPLOY_MODULE_DLPH := ./ignition/modules/Delph.ts
DEPLOY_MODULE_FLIGHT := ./ignition/modules/FlightControlModule.ts
CONTRACT_DLPH_ADDRESS := 0x9C749F61414dF9E26F3C4be3F65FdC02F3EF27C3
CONTRACT_FLIGHT_ADDRESS := 0xYourFlightControlAddress # Remplace par l'adresse après déploiement
CONSTRUCTOR_DLPH_ARGUMENTS := 0xC88B67d9575039b3cB613d95190d02893a0d9415

# Cibles
.PHONY: all compile clean test deploy-dlph-bcs-test deploy-flight-bcs-test verify-dlph-bcs-test verify-flight-bcs-test help

# Compile les contrats
compile:
	$(HARDHAT) compile

# Supprime les fichiers générés
clean:
	$(HARDHAT) clean
	rm -rf cache artifacts dist

# Exécute les tests
test:
	$(HARDHAT) test

# Déploie le contrat DelphAir sur BSC Testnet avec Ignition
deploy-dlph-bcs-test:
	$(HARDHAT) ignition deploy $(DEPLOY_MODULE_DLPH) --network $(NETWORK)

# Déploie le contrat FlightControl sur BSC Testnet avec Ignition
deploy-flight-bcs-test:
	$(HARDHAT) ignition deploy $(DEPLOY_MODULE_FLIGHT) --network $(NETWORK)

# Vérifie le contrat DelphAir sur BSCScan
verify-dlph-bcs-test:
	$(HARDHAT) verify --network $(NETWORK) $(CONTRACT_DLPH_ADDRESS) $(CONSTRUCTOR_DLPH_ARGUMENTS)

# Vérifie le contrat FlightControl sur BSCScan
verify-flight-bcs-test:
	$(HARDHAT) verify --network $(NETWORK) $(CONTRACT_FLIGHT_ADDRESS)

# Affiche les options d'utilisation
help:
	@echo "Usage: make <target>"
	@echo "Available targets:"
	@echo "  compile               Compile the smart contracts"
	@echo "  clean                 Remove generated files"
	@echo "  test                  Run all tests"
	@echo "  deploy-dlph-bcs-test  Deploy DelphAir contract to BSC Testnet with Ignition"
	@echo "  deploy-flight-bcs-test Deploy FlightControl contract to BSC Testnet with Ignition"
	@echo "  verify-dlph-bcs-test  Verify DelphAir contract on BSCScan"
	@echo "  verify-flight-bcs-test Verify FlightControl contract on BSCScan"
