// TradingPlatform.ts

// Define a type for trading platforms
export type TradingPlatform = {
  name: string; // Name of the trading platform
  apiUrl: string; // API URL for the trading platform
  supportedFeatures: string[]; // List of supported features
  apiIntegration: boolean; // Indicates if there's API integration available
  // Add more properties as needed
};
// Create a list of trading platforms
const tradingPlatforms: TradingPlatform[] = [
  {
    name: "Binance",
    apiUrl: "https://api.binance.com",
    supportedFeatures: ["Feature 1", "Feature 2"], // Add supported features
    apiIntegration: true, // Add API integration status
  },
  {
    name: "KuCoin",
    apiUrl: "https://api.kucoin.com",
    supportedFeatures: ["Feature 3", "Feature 4"], // Add supported features
    apiIntegration: true, // Add API integration status
  },
  // Add more trading platforms as needed
];

export { tradingPlatforms }; // Export the tradingPlatforms array
