SmartContractInteraction.ts
import { SubscriptionTypeEnum } from "@/core/models/data/StatusType";
import { BaseTransaction, Transaction } from "@/core/payment/Transaction";
import { AccessList, Signature } from "ethers";

interface SmartContractInteraction {
  id: string | null;
  amount: number | undefined;
  date: Date | undefined;
  description: string | null;
}

interface CustomTransactionProps extends SmartContractInteraction,  BaseTransaction {
  _id: string | undefined;
  date: Date | undefined;
  title: string | null
  startDate: Date | undefined;
  endDate: Date | undefined;
  serialized: string | undefined;
  unsignedSerialized: string | undefined;
  accessList: AccessList | null;
  to?: string | null | undefined;
  nonce?: number | null;
  gasLimit?: bigint | null;
  gasPrice: bigint | null;
  maxPriorityFeePerGas: bigint | null;
  maxFeePerGas: bigint | null;
  data: "";
  value: bigint;
  chainId?: bigint;
  signature: Signature | null;
  maxFeePerBlobGas: bigint | null;
  blobVersionedHashes: string | null;
  hash: null;
  unsignedHash: "";
  from: string | null;
  fromPublicKey: null;
  isSigned: boolean | (() => boolean);
  inferType?: () => number;
  inferTypes?: () => number[];
  isLegacy?: () => boolean;
  isBerlin?: () => boolean;
  isLondon?: () => boolean;
  isCancun?: () => boolean;
  subscriptionLevel: string;
  recentActivity: [
    {
      action: string;
      timestamp: Date;
    },
    {
      action: string;
      timestamp: Date;
    }
  ];
  getSubscriptionLevel?: () => string;
  getRecentActivity?: () => [
    {
      action: string;
      timestamp: Date;
    },
    {
      action: string;
      timestamp: Date;
    }
  ];
  notificationsEnabled: boolean;
}


type CustomTransaction = Transaction & {
  isLegacy?: (() => boolean) | undefined;
  isBerlin?: (() => boolean) | undefined;
  isLondon?: (() => boolean) | undefined;
  isCancun?: (() => boolean) | undefined;
  clone?: (() => CustomTransaction) | undefined;
  toJSON?: (() => CustomTransaction) | undefined;
  equals?: (other: CustomTransaction) => boolean;
  to?: string | null | undefined;
  nonce?: number | null;
  gasLimit?: bigint | null;
  data: ""; // Added data here
  value: bigint;
  chainId?: bigint | null;
  hash?: null | undefined; // Added hash here
  unsignedHash: "" | null; // Added unsignedHash here
  fromPublicKey?: null | undefined;
  isSigned?: boolean | (() => boolean) | undefined;
  inferType?: () => number | undefined;
  inferTypes?: () => number[] | undefined;
  accessList: AccessList; 
  getSubscriptionLevel?: () => string; // Added getSubscriptionLevel here
  getRecentActivity?: () => [
    {
      action: string;
      timestamp: Date;
    },
    {
      action: string;
      timestamp: Date;
    }
  ]; // Added getRecentActivity here
  notificationsEnabled: boolean;
  amount: number | undefined;
  date: Date | undefined;
  title: string | null;
  startDate: Date | undefined;
  endDate: Date | undefined;
  serialized: string | undefined;
  unsignedSerialized: string | undefined;
  recentActivity: [
    {
      action: string;
      timestamp: Date;
    },
    {
      action: string;
      timestamp: Date;
    }
  ];
  subscriptionType?: SubscriptionTypeEnum;
};

// Helper function for null-safe transaction type checking
function isTransactionType(transaction: { transactionType: number | null }, type: number): boolean {
  return transaction.transactionType !== null && transaction.transactionType === type;
}

function createCustomTransaction(
  transaction: Transaction,
  props: CustomTransactionProps
): CustomTransaction {
  // Create the base object with proper typing
  const customTx: CustomTransaction = {
    ...transaction,
    ...props,
    // Ensure transactionType is properly typed
    transactionType: transaction.transactionType,
    title: props.title ?? null, // Add the missing title property
    isLegacy() {
      return isTransactionType(this, 0) && this.gasPrice !== null;
    },
    isBerlin() {
      return (
        isTransactionType(this, 1) && 
        this.gasPrice !== null && 
        this.accessList !== null
      );
    },
    isLondon() {
      return (
        isTransactionType(this, 2) &&
        this.accessList !== null &&
        this.maxFeePerGas !== null &&
        this.maxPriorityFeePerGas !== null
      );
    },
    isCancun() {
      return (
        isTransactionType(this, 3) &&
        this.to !== null &&
        this.accessList !== null &&
        this.maxFeePerGas !== null &&
        this.maxPriorityFeePerGas !== null &&
        this.maxFeePerBlobGas !== null &&
        this.blobVersionedHashes !== null
      );
    },
    clone() {
      return createCustomTransaction(transaction, {
        ...this,
        date: this.date ? new Date(this.date.getTime()) : undefined,
        _id: undefined,
        subscriptionLevel: "",
        recentActivity: [
          { action: "", timestamp: new Date() },
          { action: "", timestamp: new Date() },
        ],
        id: this.id,
        hash: this.hash ?? null,
        fromPublicKey: this.fromPublicKey ?? null,
        isSigned: this.isSigned ?? false,
        inferType: () => 0,
        inferTypes: () => [0],
        accessList: this.accessList, 
        value: this.value !== null && this.value !== undefined ? BigInt(this.value) : BigInt(0),
        chainId: this.chainId !== null && this.chainId !== undefined ? BigInt(this.chainId) : BigInt(0),
        getSubscriptionLevel: () => "",
        unsignedHash: this.unsignedHash ?? "",
        type: this.type,
        transactionType: this.transactionType // This now matches the interface
      });
    },
    equals(other) {
      return (
        this.id === other.id &&
        this.amount === other.amount &&
        this.date?.getTime() === other.date?.getTime() &&
        this.description === other.description &&
        this.startDate?.getTime() === other.startDate?.getTime() &&
        this.endDate?.getTime() === other.endDate?.getTime() &&
        this.serialized === other.serialized &&
        this.unsignedSerialized === other.unsignedSerialized &&
        this.accessList === other.accessList &&
        this.to === other.to &&
        this.nonce === other.nonce &&
        this.gasLimit === other.gasLimit &&
        this.gasPrice === other.gasPrice &&
        this.maxPriorityFeePerGas === other.maxPriorityFeePerGas &&
        this.maxFeePerGas === other.maxFeePerGas &&
        this.type === other.type &&
        this.data === other.data &&
        this.value === other.value &&
        this.chainId === other.chainId &&
        this.signature === other.signature &&
        this.maxFeePerBlobGas === other.maxFeePerBlobGas &&
        this.blobVersionedHashes === other.blobVersionedHashes &&
        this.hash === other.hash &&
        this.unsignedHash === other.unsignedHash &&
        this.from === other.from &&
        this.fromPublicKey === other.fromPublicKey &&
        this.isSigned === other.isSigned &&
        this.inferType === other.inferType &&
        this.inferTypes === other.inferTypes &&
        this.isLegacy === other.isLegacy &&
        this.isBerlin === other.isBerlin &&
        this.isLondon === other.isLondon &&
        this.isCancun === other.isCancun &&
        this.getSubscriptionLevel === other.getSubscriptionLevel &&
        this.getRecentActivity === other.getRecentActivity &&
        this.notificationsEnabled === other.notificationsEnabled
      );
    },
  };

  return customTx;
}

export { createCustomTransaction };
export type { CustomTransaction, CustomTransactionProps, SmartContractInteraction };
