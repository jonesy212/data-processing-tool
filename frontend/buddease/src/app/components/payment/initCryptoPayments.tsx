
import DynamicEventHandlerExample from "../documents/screenFunctionality/ShortcutKeys";
import { addMessage } from "../state/redux/slices/ChatSlice";


const handleEvent =  DynamicEventHandlerExample
  // Function to initiate Bitcoin payment
  export const initiateBitcoinPayment = () => {
    // Implement logic to initiate Bitcoin payment
    console.log("Initiating Bitcoin payment...");
      addMessage();
  };


  

  // Function to initiate Ethereum payment
  export const initiateEthereumPayment = () => {
    // Implement logic to initiate Ethereum payment
    console.log("Initiating Ethereum payment...");
    addMessage("Initiating Ethereum payment...");
  };


