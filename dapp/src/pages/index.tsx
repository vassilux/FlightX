import { useState, useCallback } from "react";
import Image from "next/image";
import { Inter } from "next/font/google";
import { Header } from "@/components/header";
import { ethers } from "ethers";

import DelphAirABI from "@/utils/DelphAirABI.json";

const contractAddress = "0xYourContractAddress"; 

const inter = Inter({ subsets: ["latin"] });

export interface AccountType {
  address?: string;
  balance?: string;
  chainId?: string;
  network?: string;
}

export default function Home() {
  const [accountData, setAccountData] = useState<AccountType>({});
  const [message, setMessage] = useState<string>("");

  const _connectToMetaMask = useCallback(async () => {
    const ethereum = window.ethereum;
    // Check if MetaMask is installed
    if (typeof ethereum !== "undefined") {
      try {
        // Request access to the user's MetaMask accounts
        const accounts = await ethereum.request({
          method: "eth_requestAccounts",
        });
        // Get the connected Ethereum address
        const address = accounts[0];
        // Create an ethers.js provider using the injected provider from MetaMask
        const provider = new ethers.BrowserProvider(ethereum);
        // Get the account balance
        const balance = await provider.getBalance(address);
        // Get the network ID from MetaMask
        const network = await provider.getNetwork();
        // Update state with the results
        setAccountData({
          address,
          balance: ethers.formatEther(balance),
          // The chainId property is a bigint, change to a string
          chainId: network.chainId.toString(),
          network: network.name,
        });
      } catch (error: Error | any) {
        alert(`Error connecting to MetaMask: ${error?.message ?? error}`);
      }
    } else {
      alert("MetaMask not installed");
    }
  }, []);

  const _sendMessageToMetaMask = useCallback(async () => {
    const ethereum = await window.ethereum;
    // Create an ethers.js provider using the injected provider from MetaMask
    // And get the signer (account) from the provider
    const signer = await new ethers.BrowserProvider(ethereum).getSigner();
    try {
      // Sign the message
      await signer.signMessage(message);
    } catch (error) {
      alert("User denied message signature.");
    }
  }, [message]);

  const _onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
  };

  const _payTurbulenceFee = useCallback(async () => {
    const ethereum = window.ethereum;
    if (!ethereum) return alert("MetaMask not installed");
  
    const signer = await new ethers.BrowserProvider(ethereum).getSigner();
    const contract = new ethers.Contract(contractAddress, DelphAirABI, signer);
  
    try {
      const tx = await contract.payTurbulenceFee({ value: ethers.parseEther("0.01") });
      await tx.wait();
      alert("Turbulence fee paid successfully!");
    } catch (error) {
      alert(`Error paying turbulence fee: ${error.message}`);
    }
  }, []);
  

  const _crashAndBurn = useCallback(async () => {
    const ethereum = window.ethereum;
    if (!ethereum) return alert("MetaMask not installed");
  
    const signer = await new ethers.BrowserProvider(ethereum).getSigner();
    const contract = new ethers.Contract(contractAddress, DelphAirABI, signer);
  
    try {
      const tx = await contract.crashAndBurn();
      await tx.wait();
      alert("Crash and burn simulated successfully!");
    } catch (error) {
      alert(`Error simulating crash and burn: ${error.message}`);
    }
  }, []);
  
  const _successfulLanding = useCallback(async () => {
    const ethereum = window.ethereum;
    if (!ethereum) return alert("MetaMask not installed");
  
    const signer = await new ethers.BrowserProvider(ethereum).getSigner();
    const contract = new ethers.Contract(contractAddress, DelphAirABI, signer);
  
    try {
      const tx = await contract.successfulLanding();
      await tx.wait();
      alert("Successful landing completed!");
    } catch (error) {
      alert(`Error completing successful landing: ${error.message}`);
    }
  }, []);

  const _disconnectWallet = useCallback(() => {
    setAccountData({}); // Réinitialise les données du wallet
  }, []);

  return (
    <div
      className={`h-full flex flex-col before:from-white after:from-sky-200 py-2 ${inter.className}`}
    >
      <Header {...accountData} onDisconnect={_disconnectWallet} />
      <div className="flex flex-col flex-1 justify-center items-center">
        <div className="grid gap-4">
        <Image
  src="/assets/flight_together.png" // 
  alt="DelphAir Logo"
  width={320}
  height={140}
  priority
/>
          {accountData?.address ? (
  <>
    <input
      type="text"
      onChange={_onChange}
      className="border-black border-2 rounded-lg p-2"
    />
    <button
      onClick={_sendMessageToMetaMask}
      className="bg-black text-white p-4 rounded-lg"
    >
      Send Message
    </button>
    <button
      onClick={_payTurbulenceFee}
      className="bg-blue-500 text-white p-4 rounded-lg"
    >
      Pay Turbulence Fee
    </button>
    <button
      onClick={_crashAndBurn}
      className="bg-red-500 text-white p-4 rounded-lg"
    >
      Simulate Crash
    </button>
    <button
      onClick={_successfulLanding}
      className="bg-green-500 text-white p-4 rounded-lg"
    >
      Successful Landing
    </button>
  </>
) : (
  <button
    onClick={_connectToMetaMask}
    className="bg-black text-white p-4 rounded-lg"
  >
    Connect to Wallet
  </button>
)}

        </div>
      </div>
    </div>
  );
}
