// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract DelphAir is
    ERC20,
    ERC20Permit,
    ERC20Burnable,
    Ownable,
    ReentrancyGuard
{
    uint256 public constant MAX_SUPPLY = 21000000 * 10 ** 18; // 21M tokens
    uint256 public constant TURBULENCE_FEE = 100 * 10 ** 18; // Fee for turbulence simulation

    event SuccessfulLanding(address indexed user, uint256 reward);
    event CrashAndBurn(address indexed user, uint256 burnedAmount);

    event FeesWithdrawn(address indexed owner, uint256 amount);



    constructor(
        address initialOwner
    ) ERC20("DelphAir", "DLPH") Ownable(initialOwner) ERC20Permit("DelphAir") {
        _mint(msg.sender, 21000000 * 10 ** decimals()); // Mint initial supply to owner
    }

    // Custom mint function with MAX_SUPPLY check
    function mint(address to, uint256 amount) public onlyOwner {
        require(
            totalSupply() + amount <= MAX_SUPPLY,
            "DelphAir: mint amount exceeds maximum supply"
        );
        _mint(to, amount);
    }

    function crashAndBurn() external nonReentrant {
        uint256 userBalance = balanceOf(msg.sender);
        require(
            userBalance >= TURBULENCE_FEE,
            "DelphAir: insufficient balance for turbulence fee"
        );

        uint256 burnAmount = (userBalance * ((block.timestamp % 10) + 1)) / 100; // Random 1-10% burn
        _burn(msg.sender, burnAmount);

        emit CrashAndBurn(msg.sender, burnAmount); // Assurez-vous que cet événement est correctement émis
    }

    // Simulate a "successful landing" by rewarding users who hold tokens
    function successfulLanding() external nonReentrant {
        uint256 reward = 50 * 10 ** 18; // Fixed reward
        require(
            totalSupply() + reward <= MAX_SUPPLY,
            "DelphAir: reward exceeds maximum supply"
        );

        _mint(msg.sender, reward);
        emit SuccessfulLanding(msg.sender, reward);
    }

    // Fun function to simulate turbulence fee payment
    function payTurbulenceFee() external payable {
        require(
            msg.value == 0.01 ether,
            "DelphAir: exact fee of 0.01 required"
        );
        // Funds can be collected by the owner later
    }

    function withdrawFees() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "DelphAir: no fees to withdraw");
        emit FeesWithdrawn(msg.sender, balance); // Émettre l'événement
        payable(owner()).transfer(balance);
    }
    
}
