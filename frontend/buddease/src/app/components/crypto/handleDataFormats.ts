// handleDataFormats.ts

import { ExchangeData } from "../models/data/ExchangeData";

// Function to handle data formats from various exchanges
export const handleDataFormats = (exchangeData: ExchangeData[]): void => {
  // Iterate through the exchange data and apply format handling
  exchangeData.forEach((exchange: ExchangeData) => {
    // Apply any necessary transformations or standardizations to the data format
    exchange.price = parseFloat(exchange.price.toFixed(2)); // Round price to 2 decimal places
    exchange.volume = Math.round(exchange.volume); // Round volume to the nearest integer
    // You can add more transformations as needed
  });
};
