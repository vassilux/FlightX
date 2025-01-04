// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const FlightControlModule = buildModule("FlightControlModule", (m) => {
  // Adresse du contrat DelphAir (si nécessaire pour les interactions)
  const delphAirAddress = m.getParameter(
    "delphAirAddress",
    "0xYourDelphAirContractAddress" // Remplace par l'adresse réelle
  );

  // Déployer le contrat FlightControl avec l'adresse de DelphAir
  const flightControl = m.contract("FlightControl", [delphAirAddress]);

  return { flightControl };
});

export default FlightControlModule;
