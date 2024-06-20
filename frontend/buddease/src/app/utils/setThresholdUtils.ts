// setThresholdUtils.ts
export const setThreshold = <T>(
  parsedData: T[],
  threshold: number
): boolean => {
  // Iterate through the parsed data to identify any item that meets the threshold criteria
  for (const data of parsedData) {
    // Ensure that data is not inferred as 'never' type
    if (typeof data !== "undefined" && typeof (data as any).data !== "undefined") {
      // Check if the data contains 'priceDisparity' property
      if ("priceDisparity" in (data as any).data) {
        // Check if the price disparity is not undefined and exceeds the defined threshold
        if (
          typeof (data as any).data.priceDisparity === "number" &&
          (data as any).data.priceDisparity > threshold
        ) {
          // If the disparity exceeds the threshold, return true
          return true;
        }
      }
      if (
        "prices" in (data as any).data &&
        Array.isArray((data as any).data.prices) &&
        (data as any).data.prices.length > 1
      ) {
        // Check if prices array exists and has length greater than 1
        // Compare prices from different sources to identify potential arbitrage opportunities
        for (let i = 0; i < (data as any).data.prices.length - 1; i++) {
          for (let j = i + 1; j < (data as any).data.prices.length; j++) {
            const priceDifference = Math.abs(
              (data as any).data.prices[i].price - (data as any).data.prices[j].price
            );
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
