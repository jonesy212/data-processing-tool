// Payments.tsx
import { handleCryptoPaymentSelect } from '@/app/documents/screenFunctionality/ShortcutKeys';
import React from 'react';

const Payments: React.FC = () => {
  // Function to handle crypto payment selection
  const handlePaymentSelection = (cryptoOption: string) => {
    handleCryptoPaymentSelect(cryptoOption); // Call the handleCryptoPaymentSelect function
  };

  return (
    <div>
      <h1>Payments</h1>
      {/* Add payment-related components and functionality here */}
      <button onClick={() => handlePaymentSelection('Bitcoin')}>Pay with Bitcoin</button>
      <button onClick={() => handlePaymentSelection('Ethereum')}>Pay with Ethereum</button>
      {/* Add more payment options as needed */}
    </div>
  );
};

export default Payments;
