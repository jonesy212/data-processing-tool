// createCustomTransaction

import { Transaction } from "ethers";
import { CustomTransaction } from "../../crypto/SmartContractInteraction";

function createCustomTransaction(
  data: Partial<CustomTransaction>
): Transaction & CustomTransaction {
  const transaction = new Transaction();

  // Assigning provided properties to the transaction
  Object.assign(transaction, data);

  // Adding custom properties
  return {
    ...transaction,
    id: data.id || "",
    amount: data.amount || 0,
    date: data.date || new Date(),
    description: data.description || "",
  } as Transaction & CustomTransaction;
}

// Example usage
const transactionData = {
    id: "tx1",
    amount: 100,
    date: new Date(),
    description: "Sample transaction",
    type: null,
    typeName: null,
    to: null,
    nonce: 0,
    gasLimit: BigInt(0),
    gasPrice: null,
    maxPriorityFeePerGas: null,
    maxFeePerGas: null,
    data: "",
    value: BigInt(0),
    chainId: BigInt(0),
    signature: null,
    accessList: [],
    maxFeePerBlobGas: null,
    blobVersionedHashes: null,
    hash: null,
    unsignedHash: "",
    from: null,
    fromPublicKey: null,
};

const customTransaction = createCustomTransaction({
  id: "tx1",
  amount: 100,
  date: new Date(),
  description: "Sample transaction",
  type: null,
  typeName: null,
  to: null,
  nonce: 0,
  gasLimit: BigInt(0),
  gasPrice: null,
  maxPriorityFeePerGas: null,
  maxFeePerGas: null,
  data: "",
  value: BigInt(0),
  chainId: BigInt(0),
  signature: null,
  accessList: [],
  maxFeePerBlobGas: null,
  blobVersionedHashes: null,
  hash: null,
  unsignedHash: "",
  from: null,
  fromPublicKey: null,
});
export {createCustomTransaction, customTransaction, transactionData}
