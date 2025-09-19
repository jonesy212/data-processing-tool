// Exchange.ts

import { ExchangeData } from "../models/data/ExchangeData";

export interface Exchange<
  T extends BaseDataEntity, 
  K extends T = T
> extends ExchangeData<T, K> {
    name: string;
    apiUrl: string;
    // Add any other properties as needed
  }
  