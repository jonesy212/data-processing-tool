// Transaction.ts
import type { CustomTransactionProps } from '@/core/typings/cryptoTypes/SmartContractInteraction';
import {  Signature } from "ethers";
import type { AccessList } from "ethers";

interface BaseTransaction {
  _id?: string;
  id: string | null;
  type: 'buy' | 'sell' | 'transfer' | 'exchange' | null;
  transactionType: number | null;
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
  value: bigint | null;
}

// `Transaction` extends `BaseTransaction` with specific fields
interface Transaction extends BaseTransaction {
  amount?: number | null;
  transactionType: number | null;
  currency: string;
  timestamp: Date;
  status: 'pending' | 'completed' | 'failed';
  fee?: number;
  exchangeRate?: number;
  notes?: string;
}

// Additional type for `TransactionData` to unify both types
type TransactionData = Transaction & CustomTransactionProps;

class TransactionProcessor implements Transaction {
  // BaseTransaction properties
  _id: string | undefined = undefined;
  id: string | null = null;
  type: 'buy' | 'sell' | 'transfer' | 'exchange' | null = null;
  transactionType: number = 0;
  typeName: string | null = null;
  from: string | null = null;
  signature: Signature | null = null;
  maxFeePerGas: bigint | null = null;
  maxFeePerBlobGas: bigint | null = null;
  blobVersionedHashes: string | null = null;
  maxPriorityFeePerGas: bigint | null = null;
  gasPrice: bigint | null = null;
  date: Date | undefined = undefined;
  description: string | null = null;
  value: bigint = BigInt(0);

  // Transaction properties
  currency: string = "";
  timestamp: Date = new Date();
  status: 'pending' | 'completed' | 'failed' = 'pending';
  amount: number | null = null;
  fee?: number;
  exchangeRate?: number;
  notes?: string;

  // Additional properties
  accessList: AccessList | null = null;

  constructor(data: Partial<Transaction>) {
    Object.assign(this, data);
  }

  isSigned(): boolean {
    return !!(this.type && this.typeName && this.from && this.signature);
  }

  inferType(): number {
    // Fixed: this.type is string literal, not number
    if (this.type !== null) {
      // Map string type to numeric type
      const typeMap = {
        'buy': 1,
        'sell': 2,
        'transfer': 3,
        'exchange': 4
      };
      return typeMap[this.type] || 0;
    }
    return 0; // default type
  }

  inferTypes(): number[] {
    const types: number[] = [];
    if (this.type !== null) {
      const numericType = this.inferType();
      types.push(numericType);
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
    type: 'buy' | 'sell' | 'transfer' | 'exchange' | null;
    gasPrice: bigint;
  } {
    // Fixed: type is string literal, not number
    return this.gasPrice !== null;
  }

  isBerlin(): this is Transaction & {
    type: 'buy' | 'sell' | 'transfer' | 'exchange' | null;
    gasPrice: bigint;
    accessList: AccessList | null;
  } {
    // Fixed: type is string literal, not number
    return (
      this.gasPrice !== null && this.accessList !== null
    );
  }

  clone(): Transaction {
    const clonedTransaction: Transaction = {
      // BaseTransaction properties
      _id: this._id,
      id: this.id,
      type: this.type,
      transactionType: this.transactionType,
      typeName: this.typeName,
      from: this.from,
      signature: this.signature,
      maxFeePerGas: this.maxFeePerGas,
      maxFeePerBlobGas: this.maxFeePerBlobGas,
      blobVersionedHashes: this.blobVersionedHashes,
      maxPriorityFeePerGas: this.maxPriorityFeePerGas,
      gasPrice: this.gasPrice,
      date: this.date ? new Date(this.date) : undefined,
      description: this.description,
      value: this.value,

      // Transaction properties
      currency: this.currency,
      timestamp: new Date(this.timestamp),
      status: this.status,
      amount: this.amount,
      fee: this.fee,
      exchangeRate: this.exchangeRate,
      notes: this.notes
    };
    return clonedTransaction;
  }

  toJSON(): string {
    const transactionObj = {
      // BaseTransaction properties
      _id: this._id,
      id: this.id,
      type: this.type,
      transactionType: this.transactionType,
      typeName: this.typeName,
      from: this.from,
      signature: this.signature,
      maxFeePerGas: this.maxFeePerGas?.toString(),
      maxFeePerBlobGas: this.maxFeePerBlobGas?.toString(),
      blobVersionedHashes: this.blobVersionedHashes,
      maxPriorityFeePerGas: this.maxPriorityFeePerGas?.toString(),
      gasPrice: this.gasPrice?.toString(),
      date: this.date?.toISOString(),
      description: this.description,
      value: this.value.toString(),

      // Transaction properties
      currency: this.currency,
      timestamp: this.timestamp.toISOString(),
      status: this.status,
      amount: this.amount,
      fee: this.fee,
      exchangeRate: this.exchangeRate,
      notes: this.notes
    };
    
    return JSON.stringify(transactionObj);
  }
  // Add other methods and properties...
}

export default TransactionProcessor;
export type { BaseTransaction, CustomTransactionProps, Transaction, TransactionData };
