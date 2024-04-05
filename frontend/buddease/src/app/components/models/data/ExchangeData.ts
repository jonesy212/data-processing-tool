import { ExchangeDataType } from "../../crypto/exchangeIntegration";

// ExchangeData.ts
export interface ExchangeData {
    id: string;
  name: string;
  pair: string;
  price: number;
  volume: number;
  type: ExchangeDataType; // Type of exchange data
  data: any
  }
  
