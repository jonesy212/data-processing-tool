// Exchange.ts

import { ExchangeData } from "../models/data/ExchangeData";

export interface Exchange extends ExchangeData {
    name: string;
    apiUrl: string;
    // Add any other properties as needed
  }
  