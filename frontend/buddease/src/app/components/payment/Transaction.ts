// import { AccessList, Signature } from './path-to-types'; // Adjust import path
import  { CustomTransactionProps } from '@/app/components/crypto/SmartContractInteraction'
import { AccessList, Signature } from "ethers";


interface BaseTransaction {
  _id?: string;
  id: string | null;
  type: number | null;
  typeName: string | null;
  from: string | null;
  signature: Signature | null;
  maxFeePerGas: bigint | null;
  maxFeePerBlobGas: bigint | null;
  blobVersionedHashes: string | null;
  maxPriorityFeePerGas: bigint | null;
  gasPrice: bigint | null;
  date: Date | undefined;
  description: string | null;
  value: bigint;
}

// `Transaction` extends `BaseTransaction` with specific fields
interface Transaction extends BaseTransaction {
  amount?: number | null;
}


// Additional type for `TransactionData` to unify both types
type TransactionData = Transaction & CustomTransactionProps;


class TransactionProcessor implements Transaction {
  _id: string | undefined = undefined;
  id: string| null = null;
  amount: number | null = null;
  description: string | null = null;
  date: Date | undefined = undefined
  type: number | null = null;
  typeName: string | null = null;
  from: string | null = null;
  signature: Signature | null = null;
  gasPrice: bigint | null = null;
  maxFeePerGas: bigint | null = null;
  blobVersionedHashes: string | null = null;
  maxPriorityFeePerGas: bigint | null = null;
  accessList: AccessList | null = null;
  value: bigint = BigInt(0);
  
  constructor(data: Partial<Transaction>) {
    Object.assign(this, data);
  }
  maxFeePerBlobGas: bigint | null = null;

  isSigned(): boolean {
    return !!(this.type && this.typeName && this.from && this.signature);
  }

  inferType(): number {
    if (this.type !== null) {
      return this.type;
    }
    // Add other type inference logic here
    return 0; // default type
  }

  inferTypes(): number[] {
    const types: number[] = [];
    if (this.type !== null) {
      types.push(this.type);
    }
    if (this.maxFeePerGas !== null && this.maxPriorityFeePerGas !== null) {
      types.push(2); // Example for London type transaction
    }
    if (types.length === 0) {
      types.push(0); // Default to legacy type if no other type inferred
    }
    return types;
  }

  isLegacy(): this is Transaction & {
    type: 0;
    gasPrice: bigint;
  } {
    return this.type === 0 && this.gasPrice !== null;
  }

  isBerlin(): this is Transaction & {
    type: 1;
    gasPrice: bigint;
    accessList: AccessList;
  } {
    return (
      this.type === 1 && this.gasPrice !== null && this.accessList !== null
    );
  }

  clone(this: TransactionProcessor): Transaction {
    // Implement logic to clone the transaction
    const clonedTransaction: Transaction = {
      id: null,
      type: null,
      typeName: null,
      from: null,
      signature: null,
      maxFeePerGas: null,
      maxPriorityFeePerGas: null,
      gasPrice: null,
      maxFeePerBlobGas: null,
      blobVersionedHashes: null,
      date: undefined,
      description: null,
      value: BigInt(0),
      
    };
    return clonedTransaction;
  }

  toJSON(this: TransactionProcessor) {
    // Implement logic to convert the transaction to JSON format
   // Implement logic to convert the transaction to JSON format
   const transactionJSON: string = JSON.stringify({
    id: this.id,
    amount: this.amount,
    date: this.date?.toISOString(), // Convert Date to ISO string
    description: this.description,
    // Include other properties as needed
});
    return transactionJSON;
  }
  // Add other methods and properties...
}

export default TransactionProcessor;
export type { Transaction, TransactionData, CustomTransactionProps, BaseTransaction };
