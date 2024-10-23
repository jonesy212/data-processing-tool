// thresholdIdentification.ts
import { ParsedData } from "./parseData";

// Function to identify potential arbitrage opportunities based on price disparities exceeding a threshold
export const thresholdIdentification = (parsedData: ParsedData[], threshold: number): void => {
  // Iterate through the parsed data to identify potential arbitrage opportunities
  parsedData.forEach((data) => {
    const { cryptocurrencyPair, priceDisparity } = data;
    
    // Check if the price disparity exceeds the threshold
    if (priceDisparity > threshold) {
      console.log(`Potential arbitrage opportunity detected for ${cryptocurrencyPair}`);
      console.log(`Price disparity: ${priceDisparity}%`);
      // Additional logic or actions can be performed here for arbitrage opportunities
    } else {
      console.log(`No potential arbitrage opportunity for ${cryptocurrencyPair}`);
    }
  });
};
