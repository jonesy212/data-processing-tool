// setThresholdUtils.ts

interface DataWithPrices {
  prices: { price: number }[];
}

interface DataWithPriceDisparity {
  priceDisparity: number;
}

export const setThreshold = <T extends DataWithPrices | DataWithPriceDisparity>(
  parsedData: T[],
  threshold: number
): boolean => {
  // Iterate through the parsed data to identify any item that meets the threshold criteria
  for (const data of parsedData) {
    if ("priceDisparity" in data) {
      // Check if the data contains 'priceDisparity' property
      if (typeof data.priceDisparity === "number" && data.priceDisparity > threshold) {
        // If the disparity exceeds the threshold, return true
        return true;
      }
    } else if ("prices" in data) {
      // Check if prices array exists and has length greater than 1
      if (Array.isArray(data.prices) && data.prices.length > 1) {
        // Compare prices from different sources to identify potential arbitrage opportunities
        for (let i = 0; i < data.prices.length - 1; i++) {
          for (let j = i + 1; j < data.prices.length; j++) {
            const priceDifference = Math.abs(data.prices[i].price - data.prices[j].price);
            // If the price difference exceeds the threshold, return true
            if (priceDifference >= threshold) {
              return true;
            }
          }
        }
      }
    }
  }
  // If no item meets the threshold criteria, return false
  return false;
};
