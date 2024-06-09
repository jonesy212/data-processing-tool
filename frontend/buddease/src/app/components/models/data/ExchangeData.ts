import { ExchangeDataTypeEnum } from "../../crypto/exchangeIntegration";

// ExchangeData.ts
export interface ExchangeData {
    id: string;
  name: string;
  pair: string;
  price: number;
  volume: number;
  type: ExchangeDataTypeEnum; // Type of exchange data
  data: any
  }
  
