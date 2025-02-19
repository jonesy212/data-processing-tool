// CryptoHolding.tsx
interface CryptoHolding {
    id: string;
    currency: string;
    amount: number;
  value: number;
  name:  string;
  ticker: string;
  valuePerUnit: number; // This could represent the value per unit of the holding

  category: string;
  }
  

  export type { CryptoHolding };
