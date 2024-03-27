// TradingPlatform.ts

// Define a type for trading platforms
export type TradingPlatform = {
    name: string; // Name of the trading platform
    apiUrl: string; // API URL for the trading platform
    supportedFeatures: string[]; // List of supported features
    apiIntegration: boolean; // Indicates if there's API integration available
    // Add more properties as needed
  };
  
  
  // Example usage:
  const tradingPlatform: TradingPlatform = {
    name: "KuCoin", 
    apiUrl: "https://api.kucoin.com", 
    supportedFeatures: ["Real-time market data", "Trading", "Account management"], 
    apiIntegration: true
  };
  