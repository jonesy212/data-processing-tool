
import { Message } from "@/app/generators/GenerateChatInterfaces";
import DynamicEventHandlerService from "../event/DynamicEventHandlerExample";
import { WritableDraft } from "../state/redux/ReducerGenerator";
import { addMessage } from "../state/redux/slices/ChatSlice";


const handleEvent =  DynamicEventHandlerService
  // Function to initiate Bitcoin payment
export const initiateBitcoinPayment = () => {
  const message = {
    content: "Initiating Bitcoin payment...",
    receiver: "BitcoinWalletAddress",
    sender: "MyBitcoinWalletAddress",
    amount: "0.005", // Amount in BTC
    transactionFee: "0.0001", // Transaction fee
    transactionId: "1234abcd" // Transaction ID
    
    }
    // Implement logic to initiate Bitcoin payment
    console.log("Initiating Bitcoin payment...");
      addMessage(message as WritableDraft<Message>);
  };


  

  // Function to initiate Ethereum payment
  export const initiateEthereumPayment = () => {
    // Implement logic to initiate Ethereum payment
    console.log("Initiating Ethereum payment...");
    addMessage("Initiating Ethereum payment...");
  };


