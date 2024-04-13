// setThresholdUtils.ts
import { ParsedData } from "../components/crypto/parseData";

// Function to set a threshold for price disparities indicating potential arbitrage opportunities
export const setThreshold = (parsedData: ParsedData[], threshold: number): void => {
  // Iterate through the parsed data to identify price disparities exceeding the threshold
  parsedData.forEach((dataItem: ParsedData) => {
    // Check if the price disparity exceeds the defined threshold
    if (dataItem.priceDisparity > threshold) {
      // If the disparity exceeds the threshold, log the potential arbitrage opportunity
      console.log(`Potential arbitrage opportunity detected for ${dataItem.cryptocurrencyPair}`);
      console.log(`Price disparity: ${dataItem.priceDisparity}`);
      console.log('Consider further analysis and action.');
    } else {
      // If the disparity does not exceed the threshold, continue to the next data item
      console.log(`No significant price disparity detected for ${dataItem.cryptocurrencyPair}`);
    }
  });
};
