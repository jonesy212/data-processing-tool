// ExchangeData.ts
import { K, T } from "@/app/components/models/data/dataStoreMethods";
import { Snapshot } from "@/app/components/snapshots";
import { ExchangeDataTypeEnum } from "../../crypto/exchangeIntegration";

export interface ExchangeData {
  id: string;
  name: string;
  pair: string;
  price: number;
  volume: number;
  type: ExchangeDataTypeEnum;
  data: Snapshot<T, K>;
  createdAt: Date;
  updatedAt: Date;
  liquidity: number;
  tokens: string[];
}
