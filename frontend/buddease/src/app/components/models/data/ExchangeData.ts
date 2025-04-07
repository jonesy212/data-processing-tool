// ExchangeData.ts
import { ExchangeDataTypeEnum } from "../../crypto/exchangeIntegration";
import { T, K, Meta } from "@/app/components/models/data/dataStoreMethods";
import { Snapshot } from "@/app/components/snapshots/LocalStorageSnapshotStore";

export interface ExchangeData {
  id: string;
  name: string;
  pair: string;
  price: number;
  volume: number;
  type: ExchangeDataTypeEnum;
  data: Snapshot<T, K<T>>;
  createdAt: Date;
  updatedAt: Date;
  liquidity: number;
  tokens: string[];
}
