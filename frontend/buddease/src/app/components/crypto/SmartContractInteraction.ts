import { Signature } from "ethers";
import { Transaction } from "../payment/Transaction";

// SmartContractInteraction.tsx
interface CustomTransaction extends Transaction {
  _id: string | undefined;
  id: string | undefined;
  title: string;
  amount: number | undefined;
  date: Date | undefined;
  description: string | null 
  startDate: Date | undefined;
  endDate: Date | undefined;
  isSigned: boolean | (() => boolean) | undefined;
  serialized: string;
  unsignedSerialized: string;
  accessList: [];
  to: string | null;
  nonce: number;
  gasLimit: bigint;
  gasPrice: bigint | null;
  maxPriorityFeePerGas: bigint | null;
  maxFeePerGas: bigint | null;
  data: "";
  value: bigint;
  chainId: bigint;
  signature: Signature | null;
  maxFeePerBlobGas: bigint | null;
  blobVersionedHashes: string | null;
  hash: null;
  unsignedHash: "";
  from: null;
  fromPublicKey: null;
  inferType?: () => number | undefined;
  inferTypes?: () => number[] | undefined;
  isLegacy?: () => boolean | undefined;
  isBerlin?: () => boolean | undefined;
  isLondon?: () => boolean | undefined;
  isCancun?: () => boolean | undefined;
  clone?: () => CustomTransaction | undefined;
  toJSON?: () => string | undefined;
}

interface SmartContractInteraction {
  id: string;
  amount: number;
  date: Date;
  description: string;
}

export type { CustomTransaction, SmartContractInteraction };
