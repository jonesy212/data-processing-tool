// DEXData.ts


// Define the interface for DEX data
interface DEXData  {
    name: string; // Name of the decentralized exchange
    volume: number; // Daily trading volume
    liquidity: number; // Liquidity provided
    tokens: string[]; // Supported tokens
    // Add more properties as needed
  }
  
  export default DEXData;
  