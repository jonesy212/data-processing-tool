// TransactionFactory.ts
import { Transaction } from "@/core/payment/Transaction";
import { CustomTransaction } from "@/core/typings/cryptoTypes/SmartContractInteraction";
import { AccessList } from "ethers";

// Factory for CustomTransaction (extends Transaction)
export function createCustomTransaction(
  data: Partial<CustomTransaction & Transaction> = {}
): Transaction & CustomTransaction {
  const baseTransaction = createTransaction(data);
  const now = new Date();
  
  const recentActivity: [{ action: string; timestamp: Date; }, { action: string; timestamp: Date; }] = 
  data.recentActivity && Array.isArray(data.recentActivity) && data.recentActivity.length >= 2
    ? [
        { 
          action: data.recentActivity[0]?.action || 'created', 
          timestamp: data.recentActivity[0]?.timestamp || now 
        },
        { 
          action: data.recentActivity[1]?.action || 'pending', 
          timestamp: data.recentActivity[1]?.timestamp || now 
        }
      ]
    : [
        { action: 'created', timestamp: now },
        { action: 'pending', timestamp: now }
      ];
  
  // Use proper AccessList type from ethers
  const accessList: AccessList = data.accessList || [];
  
  return {
    ...baseTransaction,
    // CustomTransaction properties
    id: data.id || '',
    amount: data.amount || 0,
    date: data.date || now,
    description: data.description || '',
    type: data.type || null,
    typeName: data.typeName || null,
    to: data.to || null,
    nonce: data.nonce || 0,
    gasLimit: data.gasLimit || BigInt(0),
    gasPrice: data.gasPrice || null,
    maxPriorityFeePerGas: data.maxPriorityFeePerGas || null,
    maxFeePerGas: data.maxFeePerGas || null,
    data: data.data || '',
    value: data.value || BigInt(0),
    chainId: data.chainId || BigInt(0),
    signature: data.signature || null,
    accessList, // Type-safe AccessList
    maxFeePerBlobGas: data.maxFeePerBlobGas || null,
    blobVersionedHashes: data.blobVersionedHashes || null,
    hash: data.hash || null,
    unsignedHash: data.unsignedHash || '',
    from: data.from || null,
    fromPublicKey: data.fromPublicKey || null,
    
    notificationsEnabled: data.notificationsEnabled || false, 
    title: data.title || null, 
    startDate: data.startDate, 
    endDate: data.endDate || undefined,
    
    serialized: data.serialized, 
    unsignedSerialized: data.unsignedSerialized, 
    recentActivity
  };
}

// Fix your CustomTransaction interface to use proper types
export type FixedCustomTransaction = Omit<CustomTransaction, 'accessList'> & {
  accessList?: AccessList;
};

// Then use it in your factory:
export function createCustomTransactionFixed(
  data: Partial<FixedCustomTransaction & Transaction> = {}
): Transaction & FixedCustomTransaction {
  // Implementation similar to above but with FixedCustomTransaction
}