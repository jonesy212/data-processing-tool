// setThresholdUtils.ts

import { CryptoData, ParsedData } from "../components/crypto/parseData";

// Function to set a threshold for identifying potential arbitrage opportunities
export const setThreshold = <T extends CryptoData>(
  parsedData: ParsedData<T>[],
  threshold: number
): void => {
  // Iterate through the parsed data to identify price disparities
  for (const data of parsedData) {
    // Ensure that data is not inferred as 'never' type
    if (typeof data !== "undefined" && typeof data.data !== "undefined") {
      // Check if the data contains 'priceDisparity' property
      if ("priceDisparity" in data.data) {
        // Check if the price disparity is not undefined and exceeds the defined threshold
        if (
          typeof data.data.priceDisparity === "number" &&
          data.data.priceDisparity > threshold
        ) {
          // If the disparity exceeds the threshold, log the potential arbitrage opportunity
          console.log(
            `Potential arbitrage opportunity detected for ${data.data.cryptocurrencyPair}`
          );
          console.log(`Price disparity: ${data.data.priceDisparity}`);
          console.log("Consider further analysis and action.");
        } else {
          // If the disparity does not exceed the threshold, continue to the next data item
          console.log(
            `No significant price disparity detected for ${data.data.cryptocurrencyPair}`
          );
        }
      }
      if (
        "prices" in data.data &&
        Array.isArray(data.data.prices) &&
        data.data.prices.length > 1
      ) {
        // Check if prices array exists and has length greater than 1
        // Compare prices from different sources to identify potential arbitrage opportunities
        for (let i = 0; i < data.data.prices.length - 1; i++) {
          for (let j = i + 1; j < data.data.prices.length; j++) {
            const priceDifference = Math.abs(
              data.data.prices[i].price - data.data.prices[j].price
            );
            // If the price difference exceeds the threshold, notify about the arbitrage opportunity
            if (priceDifference >= threshold) {
              console.log(
                `Arbitrage opportunity detected: Buy from ${data.data.prices[i].date} and sell on ${data.data.prices[j].date}`
              );
            }
          }
        }
      }
    }
  }
};