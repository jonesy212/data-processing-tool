// PaymentGateways.ts

// Import necessary functions
import { handleCryptoPaymentSelect } from '../documents/screenFunctionality/ShortcutKeys';
import { addMessage } from '../state/redux/slices/ChatSlice';
import { initiateBitcoinPayment, initiateEthereumPayment } from './initCryptoPayments';

// Function to handle payment selection and initiate payment process
export const handlePaymentSelection = (cryptoOption: string) => {
  switch (cryptoOption) {
    case 'Bitcoin':
      initiateBitcoinPayment();
      break;
    case 'Ethereum':
      initiateEthereumPayment();
      break;
    default:
      // Handle other payment options here
      break;
  }
};

// Function to handle crypto payment selection from payments component
export const handleCryptoPaymentSelection = (cryptoOption: string) => {
  handleCryptoPaymentSelect(cryptoOption);
};

// Function to add payment-related message to chat
export const addPaymentMessageToChat = () => {
  addMessage({ text: "Payment initiated", isUserMessage: false });
};
