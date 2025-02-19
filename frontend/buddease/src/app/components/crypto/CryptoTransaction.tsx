import React from "react";

// CryptoTransaction.tsx
interface CryptoTransaction {
  id: string;
  timestamp: Date | undefined;
  fromAddress: string;
  toAddress: string;
  amount: number;
  currency: string;
  type: "SEND" | "RECEIVE" | "TRANSFER" | "MINT" | "BURN" | "BUY" | "SELL";
  valuePerUnit: number; // Value per unit at the time of transaction
  status: "PENDING" | "COMPLETED" | "FAILED";
}
const CryptoTransaction: React.FC<{ transaction: CryptoTransaction }> = ({
  transaction,
}) => {
  return (
    <div>
      <p>
        Sent {transaction.amount} {transaction.currency} from{" "}
        {transaction.fromAddress} to {transaction.toAddress} on{" "}
        {transaction.timestamp?.toLocaleString()}
      </p>
      <p>Status: {transaction.status}</p>
    </div>
  );
};

export default CryptoTransaction;