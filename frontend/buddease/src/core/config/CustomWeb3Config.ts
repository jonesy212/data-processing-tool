CustomWeb3Config.ts
erc20Balance.ts

import { Web3 } from "web3";
import type { AbiItem } from "web3-utils";

/* ---------- Web3 Instance ---------- */

const web3 = new Web3("http://127.0.0.1:4545");

/* ---------- Minimal ERC-20 ABI ---------- */
/* Only what is required for balanceOf */

const erc20Abi = [
  {
    constant: true,
    inputs: [
      {
        name: "account",
        type: "address"
      }
    ],
    name: "balanceOf",
    outputs: [
      {
        name: "",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  }
] as const satisfies readonly AbiItem[];

/* ---------- Addresses ---------- */

const tokenAddress = "0xdAC17F958D2ee523a2206206994597C13D831ec7";
const walletAddress = "0xdAC17F958D2ee523a2206206994597C13D831ec7";

/* ---------- Contract Instance ---------- */

const contract = new web3.eth.Contract(erc20Abi, tokenAddress);

/* ---------- Execution Wrapper ---------- */

async function run(): Promise<void> {
  try {
    const balance = await contract.methods
      .balanceOf(walletAddress)
      .call();

    console.log("Token balance:", balance);
  } catch (error) {
    console.error("Failed to fetch balance:", error);
  }
}

/* ---------- Start ---------- */

run();
