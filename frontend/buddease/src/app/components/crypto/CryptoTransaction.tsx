// CryptoTransaction.tsx
interface CryptoTransaction {
  id: string;
  timestamp: Date;
  fromAddress: string;
  toAddress: string;
  amount: number;
  currency: string;
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
        {transaction.timestamp.toLocaleString()}
      </p>
      <p>Status: {transaction.status}</p>
    </div>
  );
};

export default CryptoTransaction;