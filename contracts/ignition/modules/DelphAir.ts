// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const DelphAirModule = buildModule("DelphAirModule", (m) => {
  // Adresse du propriétaire initial
  const initialOwner = m.getParameter("initialOwner", "0xC88B67d9575039b3cB613d95190d02893a0d9415");

  // Déployer le contrat Dlph
  const delph = m.contract("DelphAir", [initialOwner]);

  return { delph };
});

export default DelphAirModule;
