import { CryptoData, ParsedData } from "./parseData";
// Function to detect arbitrage opportunities based on price disparities and other factors


// Function to detect arbitrage opportunities based on price disparities and other factors
export const detectArbitrage = <T extends CryptoData>(
  parsedData: ParsedData<T>[],
  threshold: number
): { cryptocurrencyPair: string; priceDisparity: any }[] => {
  // Apply additional analysis logic here, such as factoring in transaction fees and liquidity
  // Call existing function to identify opportunities exceeding the threshold
  setThreshold(parsedData, threshold);
  // Filter parsed data to only opportunities exceeding threshold
  const opportunities = parsedData.filter(
    (data) => (data.data as any).priceDisparity > threshold // Type assertion here
  );
  // For simplicity, this example assumes a straightforward comparison based on price disparities
  // Return the filtered opportunities
  const transactions = opportunities.map((opportunity) => {
    return {
      cryptocurrencyPair: opportunity.data.cryptocurrencyPair,
      priceDisparity: (opportunity.data as any).priceDisparity, // Type assertion here
    };
  });

  // Return the filtered opportunities exceeding the threshold
  return transactions;
};


// Function to set a threshold for identifying potential arbitrage opportunities
const setThreshold = <T extends CryptoData>(
  parsedData: ParsedData<T>[],
  threshold: number
): void => {
  // Iterate through the parsed data to identify price disparities
  for (const data of parsedData) {
    // Check if prices array exists and has length greater than 1
    if (data.data.prices?.length && data.data.prices.length > 1) {
      for (let i = 0; i < data.data.prices.length - 1; i++) {
        for (let j = i + 1; j < data.data.prices.length; j++) {
          const priceDifference = Math.abs(data.data.prices[i].price - data.data.prices[j].price);
          // If the price difference exceeds the threshold, notify about the arbitrage opportunity
          if (priceDifference >= threshold) {
            console.log(`Arbitrage opportunity detected: Buy from ${data.data.prices[i].date} and sell on ${data.data.prices[j].date}`);
          }
        }
      }
    }
  }
};
