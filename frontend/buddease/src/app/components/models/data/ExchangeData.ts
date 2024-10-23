import { ExchangeDataTypeEnum } from "../../crypto/exchangeIntegration";

// ExchangeData.ts
export interface ExchangeData {
  id: string;
  name: string;
  pair: string;
  price: number;
  volume: number;
  type: ExchangeDataTypeEnum;
  data: any;
  createdAt: Date;
  updatedAt: Date;
  liquidity: number;
  tokens: string[];
}
