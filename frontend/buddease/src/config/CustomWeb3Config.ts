// CustomWeb3Config.ts
import Web3ConfigEvent from "web3-eth-contract";
import  { Web3 } from "web3";

// Define a class that implements the Web3Config interface
class CustomWeb3Config extends Web3Config {
    on(CONFIG_CHANGE: any, arg1: (event: any) => void) {
    
    }
  config: any;

  // Implement the abstract method _triggerConfigChange
  protected _triggerConfigChange() {
    // Trigger the CONFIG_CHANGE event with the updated config
    this.emit("CONFIG_CHANGE", {
      name: "CONFIG_CHANGE",
      oldValue: this.config,
      newValue: this.config,
    });
  }

  emit(CONFIG_CHANGE: any, arg1: { name: any; oldValue: any; newValue: any }) {
    throw new Error("Method not implemented.");
  }
}

// Usage example
// Instantiate the custom Web3Config class with appropriate properties
const timeout = 1000; // Example value for timeout
const defaultAccount = "0x..."; // Example value for default account
const defaultBlock = "latest";
const web3Config = new CustomWeb3Config(timeout, defaultAccount, defaultBlock);

// Set up a listener for the CONFIG_CHANGE event
web3Config.on("CONFIG_CHANGE", (event) => {
  console.log(`Config changed:`, event);
});



//todo add abi

// Assuming 'abi' is defined elsewhere in your code with the correct ABI for your contract

const web3 = new Web3('https://127.0.0.1:4545');
const abi = [...] as const; // your contract ABI

let contract = new web3.eth.Contract(abi,'0xdAC17F958D2ee523a2206206994597C13D831ec7');
await contract.methods.balanceOf('0xdAC17F958D2ee523a2206206994597C13D831ec7').call();


// Modify the config
contract.setConfig({
  defaultBlock: "pending",
  transactionPollingInterval: 2000,
});

// Output:
// Config changed: { name: 'CONFIG_CHANGE', oldValue: { defaultBlock: 'latest', ... }, newValue: { defaultBlock: 'pending', ... } }
// (assuming other config properties remain the same)
