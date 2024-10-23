// BlockchainAsset.ts
export interface BlockchainAsset {
    id: string; // Unique identifier for the asset
    name: string; // Name of the asset
    symbol: string; // Symbol or ticker of the asset
    balance: number; // Current balance of the asset
    contractAddress: string; // Address of the smart contract managing the asset
  decimals: number; // Number of decimals for the asset
  value: number
    // Add more properties as needed
  }
  