import { ExchangeData } from "../models/data/ExchangeData";
import { YourResponseType } from "../typings/types";
import safeParseData from "./SafeParseData";
// Define the type for parsed data
export interface ParsedData {
  cryptocurrencyPair: string;
  price: number;
  tradingVolume: number;
  priceDisparity: number; // New field to store the price disparity
  prices: number[]; // Array to store prices for calculating disparity
  sources: string[]; // Array to store sources for prices
  // Define additional fields as needed
}

// Function to parse and process the received data
export const parseData = (
  data: YourResponseType[],
  threshold: number
): ParsedData[] => {
  // Initialize an empty array to store parsed data
  const parsedData: ParsedData[] = [];

  // Iterate through the received data and extract relevant information
  data.forEach((item: YourResponseType) => {
    // Extract relevant information such as cryptocurrency pairs, prices, and trading volumes
    item.data.exchangeData.forEach((exchange: ExchangeData) => {
      const cryptocurrencyPair: string = exchange.pair;
      const price: number = exchange.price;
      const tradingVolume: number = exchange.volume;
      // Calculate the price disparity for the cryptocurrency pair (example logic)
      // You can customize this logic based on your specific requirements
      const priceDisparity: number = calculatePriceDisparity(
        exchange.price,
        item.data.averagePrice,
        threshold
      );


        
      // Create an array to store the price from the current exchange
      const prices: number[] = [exchange.price];

      // Create an array to store the source (exchange name) for the price
      const sources: string[] = [exchange.name]; // Access the name property of the Exchange object

      // Create a parsed data object
      const parsedItem: ParsedData = {
        cryptocurrencyPair,
        price,
        tradingVolume,
        priceDisparity,
        prices,
        sources,
        // Add more extracted fields as needed
      };

      // Push the parsed item to the parsed data array
      parsedData.push(parsedItem);
    });
  });

  // Return the parsed data
  return safeParseData(data, threshold);
};

// Function to calculate the price disparity
const calculatePriceDisparity = (
  currentPrice: number,
  averagePrice: number,
  threshold: number
): number => {
  // Calculate the absolute difference between the current price and the average price
  const priceDifference = Math.abs(currentPrice - averagePrice);

  // Check if the price difference exceeds the threshold
  if (priceDifference > threshold) {
    // If the price difference exceeds the threshold, it indicates a significant disparity
    // Return a value indicating the magnitude of the disparity, such as the percentage difference
    return (priceDifference / averagePrice) * 100; // Return percentage difference
  } else {
    // If the price difference does not exceed the threshold, it may not be significant
    // Return 0 or any other value to indicate no significant disparity
    return 0;
  }
};

// Example usage:
const currentPrice = 100; // Current price of the cryptocurrency pair
const averagePrice = 95; // Average price of the cryptocurrency pair
const threshold = 5; // Threshold value to consider a significant disparity (in currency units)

// Calculate the price disparity
const priceDisparity = calculatePriceDisparity(
  currentPrice,
  averagePrice,
  threshold
);
console.log("Price Disparity:", priceDisparity);
