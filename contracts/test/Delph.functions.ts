import { expect } from "chai";
import hre from "hardhat";
import { ethers } from "ethers"; // Import ethers

describe("DelphAir Functions", function () {
  it("Should mint initial supply to owner during contract deployment", async function () {
    const [owner] = await hre.ethers.getSigners();
    const DelphAir = await hre.ethers.getContractFactory("DelphAir");
    const delphAir = await DelphAir.deploy(owner.address);


    const initialSupply = ethers.parseUnits("21000000", 18); // Ensure correct decimal handling

    // Check owner's balance
    const ownerBalance = await delphAir.balanceOf(owner.address);
    expect(ownerBalance).to.equal(initialSupply, "Owner balance should match initial supply");

    // Check total supply
    const totalSupply = await delphAir.totalSupply();
    expect(totalSupply).to.equal(initialSupply, "Total supply should match initial supply");
});

it("Should allow the owner to mint new tokens up to the MAX_SUPPLY limit", async function () {
  const [owner, user] = await hre.ethers.getSigners();
  const DelphAir = await hre.ethers.getContractFactory("DelphAir");
  const delphAir = await DelphAir.deploy(owner.address);

  const initialSupply = ethers.parseUnits("21000000", 18);
  const maxSupply = ethers.parseUnits("21000000", 18);

  // Attempt to mint the maximum allowed amount
  const mintAmount = maxSupply - initialSupply;
  await delphAir.connect(owner).mint(user.address, mintAmount);

  // Check the total supply after minting
  const totalSupply = await delphAir.totalSupply();
  expect(totalSupply).to.equal(maxSupply, "Total supply should equal MAX_SUPPLY after minting");

  // Attempt to mint more tokens (should fail)
  await expect(delphAir.connect(owner).mint(user.address, 1))
    .to.be.revertedWith("DelphAir: mint amount exceeds maximum supply");
});it("Should prevent minting tokens beyond the MAX_SUPPLY limit", async function () {
  const [owner, user] = await hre.ethers.getSigners();
  const DelphAir = await hre.ethers.getContractFactory("DelphAir");
  const delphAir = await DelphAir.deploy(owner.address);

  const initialSupply = ethers.parseUnits("21000000", 18);
  const maxSupply = ethers.parseUnits("21000000", 18);

  // Attempt to mint more than the remaining allowed amount
  const excessAmount = ethers.parseUnits("1", 18); // 1 token more than allowed
  await expect(delphAir.connect(owner).mint(user.address, excessAmount))
    .to.be.revertedWith("DelphAir: mint amount exceeds maximum supply");

  // Verify that the total supply hasn't changed
  const totalSupply = await delphAir.totalSupply();
  expect(totalSupply).to.equal(initialSupply, "Total supply should remain unchanged");
});

it("Should burn a random percentage (1-10%) of user's balance during crashAndBurn", async function () {
  const [owner, user] = await hre.ethers.getSigners();
  const DelphAir = await hre.ethers.getContractFactory("DelphAir");
  const delphAir = await DelphAir.deploy(owner.address);

  // Transfer some tokens to the user
  const initialBalance = ethers.parseUnits("1000", 18);
  await delphAir.connect(owner).transfer(user.address, initialBalance);

  // Decode the CrashAndBurn event from logs
  const iface = DelphAir.interface; // Get the contract interface
  const tx = await delphAir.connect(user).crashAndBurn();
  const receipt = await tx.wait();

  expect(receipt).not.to.be.null;
  if (!receipt) {
    throw new Error("Transaction receipt is null");
  }

  const crashAndBurnEvent = iface.getEvent("CrashAndBurn");
  expect(crashAndBurnEvent).not.to.be.null;
  if (!crashAndBurnEvent) {
    throw new Error("CrashAndBurn event definition not found in the interface");
  }

  const topicHash = crashAndBurnEvent.topicHash;

  // Chercher le log correspondant
  const log = receipt.logs.find((log) => log.topics[0] === topicHash);
  expect(log).not.to.be.undefined;
  if (!log) {
    throw new Error("CrashAndBurn event not found in transaction logs");
  }

  // Décoder le log
  const decodedEvent = iface.parseLog(log);
  expect(decodedEvent).not.to.be.null;
  if (!decodedEvent) {
    throw new Error("Transaction decodedEvent is null");
  }

  const burnedAmount = BigInt(decodedEvent.args[1].toString()); // Convertir en BigInt

  // Vérifier le solde final de l'utilisateur
  const finalBalance = await delphAir.balanceOf(user.address);
  expect(finalBalance).to.equal(initialBalance - burnedAmount); // 

  // Calculer le pourcentage brûlé
  const burnPercentage = (burnedAmount * 100n) / initialBalance; // 
  expect(Number(burnPercentage)).to.be.greaterThanOrEqual(1);
  expect(Number(burnPercentage)).to.be.lessThanOrEqual(10);
});

it("Should allow the owner to withdraw collected fees", async function () {
  const [owner, user] = await hre.ethers.getSigners();
  const DelphAir = await hre.ethers.getContractFactory("DelphAir");
  const delphAir = await DelphAir.deploy(owner.address);

  // User pays turbulence fee
  const fee = ethers.parseEther("0.01");
  await delphAir.connect(user).payTurbulenceFee({ value: fee });

  // Verify the contract balance
  const contractBalanceBefore = await hre.ethers.provider.getBalance(delphAir.getAddress());
  expect(contractBalanceBefore).to.equal(fee);

  // Owner withdraws the fees
  const ownerBalanceBefore = await hre.ethers.provider.getBalance(owner.address);
  const tx = await delphAir.connect(owner).withdrawFees();
  const receipt = await tx.wait();
  expect(receipt).not.to.be.null;
  if (!receipt) {
    throw new Error("Transaction receipt is null");
  }

  // Calculate gas cost
  const gasUsed = BigInt(receipt.gasUsed);
  const gasPrice = BigInt(receipt.gasPrice || 0); // Use 0 as fallback if gasPrice is undefined
  const gasCost = gasUsed * gasPrice;

  // Verify the contract balance is now zero
  const contractBalanceAfter = await hre.ethers.provider.getBalance(delphAir.getAddress());
  expect(contractBalanceAfter).to.equal(0);

  // Verify the owner's balance increased by the fee minus gas cost
  const ownerBalanceAfter = await hre.ethers.provider.getBalance(owner.address);
  expect(ownerBalanceAfter).to.equal(ownerBalanceBefore + fee - gasCost);
});

it("Should prevent non-owners from withdrawing fees", async function () {
  const [owner, user] = await hre.ethers.getSigners();
  const DelphAir = await hre.ethers.getContractFactory("DelphAir");
  const delphAir = await DelphAir.deploy(owner.address);

  // User pays turbulence fee
  const fee = ethers.parseEther("0.01");
  await delphAir.connect(user).payTurbulenceFee({ value: fee });

  // Verify the contract balance
  const contractBalance = await hre.ethers.provider.getBalance(delphAir.getAddress());
  expect(contractBalance).to.equal(fee);

  // Attempt to withdraw fees as non-owner (user)
  await expect(delphAir.connect(user).withdrawFees())
    .to.be.revertedWithCustomError(delphAir, "OwnableUnauthorizedAccount")
    .withArgs(user.address);

  // Verify the contract balance remains unchanged
  const contractBalanceAfter = await hre.ethers.provider.getBalance(delphAir.getAddress());
  expect(contractBalanceAfter).to.equal(fee);
});

it("Should fail if owner tries to withdraw with zero contract balance", async function () {
  const [owner] = await hre.ethers.getSigners();
  const DelphAir = await hre.ethers.getContractFactory("DelphAir");
  const delphAir = await DelphAir.deploy(owner.address);

  // Attempt to withdraw fees without any funds
  await expect(delphAir.connect(owner).withdrawFees())
    .to.be.revertedWith("DelphAir: no fees to withdraw");
});

it("Should reject payments with incorrect turbulence fee", async function () {
  const [_, user] = await hre.ethers.getSigners();
  const DelphAir = await hre.ethers.getContractFactory("DelphAir");
  const delphAir = await DelphAir.deploy(user.address);

  // Attempt to pay an incorrect turbulence fee
  await expect(
    delphAir.connect(user).payTurbulenceFee({ value: ethers.parseEther("0.005") })
  ).to.be.revertedWith("DelphAir: exact fee of 0.01 required");
});

it("Should emit an event when the owner withdraws fees", async function () {
  const [owner, user] = await hre.ethers.getSigners();
  const DelphAir = await hre.ethers.getContractFactory("DelphAir");
  const delphAir = await DelphAir.deploy(owner.address);

  // User pays turbulence fee
  const fee = ethers.parseEther("0.01");
  await delphAir.connect(user).payTurbulenceFee({ value: fee });

  // Owner withdraws the fees
  await expect(delphAir.connect(owner).withdrawFees())
    .to.emit(delphAir, "FeesWithdrawn")
    .withArgs(owner.address, fee);
});


});
