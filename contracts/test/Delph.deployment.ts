import { expect } from "chai";
import hre from "hardhat";

describe("DelphAir Deployment", function () {
  it("Should deploy the contract with the correct name and symbol", async function () {
    const [owner] = await hre.ethers.getSigners();
    const Delph = await hre.ethers.getContractFactory("DelphAir");
    const delph = await Delph.deploy(owner.address);

    expect(await delph.name()).to.equal("DelphAir");
    expect(await delph.symbol()).to.equal("DLPH");
  });

  it("Should set the initial owner correctly", async function () {
    const [owner] = await hre.ethers.getSigners();
    const Delph = await hre.ethers.getContractFactory("DelphAir");
    const delph = await Delph.deploy(owner.address);

    expect(await delph.owner()).to.equal(owner.address);
  });
});
