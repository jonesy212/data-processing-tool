// ethereumUtils.ts

import {
  ContractInterface,
  ContractTransaction,
  TransactionRequest, Wallet, ethers,
} from "ethers";
import { ContractAbi, default as Web3 } from "web3";
import { Contract, EventLog } from "web3-eth-contract";

interface EventData {
  eventId: string; // Event ID from the args
  args?: any[];     // Define the structure of your event data's arguments (you may want to specify the types here)
  timestamp?: string | number | Date | undefined; // Optional timestamp for the event
  blockNumber: string | number | bigint | undefined;    // Block number in which the event was emitted
  transactionHash: string | undefined; // Transaction hash of the event
  event: string;          // Name of the event
  signature: string | undefined; // Signature of the event (can be null)
  
  // Add other properties you may expect in your events
  [key: string]: any; // Catch-all for additional dynamic properties
}

// web3 is a global variable that is initialized in the index.html file
const initializeWeb3 = (): Web3 => {
  // Implement Web3 initialization logic
  const web3 = new Web3("your-provider-url");
  return web3;
};

const deployContract = async (
  web3: Web3,
  contractData: any
): Promise<string | undefined> => {
  // Implement logic to deploy smart contract
  const accounts = await web3.eth.getAccounts();
  const deployedContract = await new web3.eth.Contract(contractData.abi)
    .deploy({ data: contractData.bytecode })
    .send({ from: accounts[0] });

  if (!deployedContract) {
    return undefined;
  }

  return deployedContract.options.address;
};


const callContractMethod = async <Abi extends ContractAbi>(
  contract: Contract<Abi>,
  methodName: string,
  params: any[]
): Promise<any> => {
  // Implement logic to call contract method
  const result = await contract.methods[methodName](...params).call();
  return result;
};



// Function to listen for events emitted by a smart contract using Web3
const listenForContractEvents = <Abi extends ContractAbi>(
  contract: Contract<Abi>,
  eventName: string,
  callback: (eventData: EventData) => void
): void => {
  try {
    contract.events[eventName]().on("data", (eventLog: EventLog) => {
      // Check if 'eventLog' has 'args' and required properties
      if ('args' in eventLog) {
        const eventLogArgs = eventLog.args as Record<string, unknown>; // Ensure type-safety here
        
        // Manually construct the EventData by extracting required fields from 'eventLog' and 'eventLogArgs'
        const eventData: EventData = {
          eventId: eventLogArgs['eventId'] as string, // Extract 'eventId' from 'args'
          // Add other required properties here from 'eventLogArgs' as needed
          ...eventLogArgs, // Spread the remaining args if necessary
          blockNumber: eventLog.blockNumber,
          transactionHash: eventLog.transactionHash,
          event: eventLog.event,
          signature: eventLog.signature,
        };
        
        callback(eventData); // Call the provided callback function with event data
      } else {
        console.error("EventLog does not contain 'args' property.");
      }
    });
  } catch (error: any) {
    console.error("Error listening for contract events:", error.message);
    throw error; // Throw the error for handling elsewhere
  }
};



// Function to interact with a smart contract using ethers.js
const interactWithContract = async (
  contract: Contract<ContractAbi>,
  methodName: string,
  ...args: any[]
): Promise<ContractTransaction> => {
  try {
    // Get the contract interface
    const contractInterface: ContractInterface = (contract as any).interface;

    // Verify if the method exists on the contract interface
    const methodAbi =
      contractInterface.functions[
        methodName as keyof ContractInterface["functions"]
      ];
    if (!methodAbi) {
      throw new Error(`Method '${methodName}' not found in contract ABI.`);
    }

    // Call the specified method on the smart contract
    const result = await contract.methods[methodName](...args).send();
    return result as unknown as ContractTransaction;
  } catch (error: any) {
    console.error("Error interacting with contract:", error.message);
    throw error; // Throw the error for handling elsewhere
  }
};



const createWallet = (): ethers.Wallet => {
  // Implement logic to create a new wallet
  const wallet = ethers.Wallet.createRandom() as unknown as ethers.Wallet;

  return wallet;
};

const getWalletAddress = (wallet: Wallet): string => {
  // Implement logic to retrieve wallet address
  return wallet.address;
};

const getWalletPrivateKey = (wallet: Wallet): string => {
  // Implement logic to retrieve wallet private key
  return wallet.privateKey;
};

const getWalletBalance = async (
  web3: Web3,
  wallet: Wallet
): Promise<string> => {
  // Implement logic to retrieve wallet balance
  const balance = await web3.eth.getBalance(wallet.address);
  return web3.utils.fromWei(balance, "ether");
};

const getAccountBalance = async (
  web3: Web3,
  address: string
): Promise<string> => {
  // Implement logic to retrieve account balance
  const balance = await web3.eth.getBalance(address);
  return web3.utils.fromWei(balance, "ether");
};

const signTransaction = async (
  wallet: Wallet,
  transaction: TransactionRequest
): Promise<string> => {
  // Ensure the wallet provider is set
  if (!wallet.provider) {
    throw new Error("Wallet provider is not set");
  }

  // Sign the transaction using the wallet
  if (!wallet.provider.sendTransaction) {
    return wallet.signTransaction(transaction);
  }
  const signedTx = await wallet.provider.sendTransaction(transaction);
  return signedTx.hash;
};


// Function to send a transaction using ethers.js
const sendTransaction = async (
  wallet: Wallet,
  to: string,
  value: ethers.BigNumberish
): Promise<string> => {
  try {
    const transaction = await wallet.sendTransaction({
      to,
      value,
    });
    await transaction.wait(); // Wait for the transaction to be mined
    return transaction.hash; // Return the transaction hash
  } catch (error: any) {
    console.error("Error sending transaction:", error.message);
    throw error; // Throw the error for handling elsewhere
  }
};




// Function to check if an Ethereum wallet address is valid
const isValidEthereumAddress = (walletAddress: string): boolean => {
  // Regular expression pattern for Ethereum wallet address validation
  const ethereumAddressPattern = /^(0x)?[0-9a-fA-F]{40}$/;

  // Check if the wallet address matches the Ethereum address pattern
  return ethereumAddressPattern.test(walletAddress);
};

// Example usage:
const walletAddress = "0x1234567890123456789012345678901234567890";
console.log(
  "Is valid Ethereum address:",
  isValidEthereumAddress(walletAddress)
);




export {initializeWeb3,
  deployContract,
  callContractMethod,
  listenForContractEvents,
  interactWithContract,
  createWallet,
  getWalletAddress,
  getWalletPrivateKey,
  getWalletBalance,
  getAccountBalance,
  signTransaction,
  sendTransaction,
  isValidEthereumAddress,
}


export type {EventData}