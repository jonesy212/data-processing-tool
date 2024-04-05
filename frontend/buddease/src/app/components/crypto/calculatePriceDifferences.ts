// calculatePriceDifferences.ts

import { ExchangeData } from "../models/data/ExchangeData";

interface PriceDifference {
  pair: string;
  priceDifferences: number[];
}

export const calculatePriceDifferences = (exchangeData: ExchangeData[]): PriceDifference[] => {
  if (!exchangeData || exchangeData.length === 0) {
    throw new Error('No exchange data provided.');
  }

  const priceDifferencesMap: Map<string, number[]> = new Map();

  // Iterate through the exchangeData to calculate price differences
  exchangeData.forEach((exchange: ExchangeData) => {
    const { pair, price } = exchange;
    if (!priceDifferencesMap.has(pair)) {
      priceDifferencesMap.set(pair, [price]);
    } else {
      priceDifferencesMap.get(pair)!.push(price);
    }
  });

  // Initialize an array to store the price differences for each pair
  const priceDifferences: PriceDifference[] = [];

  // Iterate through the priceDifferencesMap to calculate price differences
  priceDifferencesMap.forEach((prices: number[], pair: string) => {
    if (prices.length > 1) {
      const priceDiffs = prices.slice(1).map((price, index) => price - prices[index]);
      priceDifferences.push({ pair, priceDifferences: priceDiffs });
    }
  });

  return priceDifferences;
};
