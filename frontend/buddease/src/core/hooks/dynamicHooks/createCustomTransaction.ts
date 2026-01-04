createCustomTransaction.ts
import { createCustomTransaction } from "@/core/config/factory/TransactionFactory";

Example usage
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

const customTransaction = createCustomTransaction(transactionData);

export { createCustomTransaction, customTransaction, transactionData };
