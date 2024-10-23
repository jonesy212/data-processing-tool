import { ExchangeData } from '@/app/components/models/data/ExchangeData';

interface PriceComparisonResult {
  pair: string;
  highestPrice: number;
  lowestPrice: number;
  averagePrice: number;
}

export const comparePrices = (exchangeData: ExchangeData[]): PriceComparisonResult[] => {
  if (!exchangeData || exchangeData.length === 0) {
    throw new Error('No exchange data provided.');
  }

  const priceMap: Map<string, number[]> = new Map();

  // Iterate through exchangeData and populate the priceMap with prices for each pair
  exchangeData.forEach((exchange: ExchangeData) => {
    const { pair, price } = exchange;
    if (!priceMap.has(pair)) {
      priceMap.set(pair, [price]);
    } else {
      priceMap.get(pair)!.push(price);
    }
  });

  // Initialize an array to store the comparison results
  const comparisonResults: PriceComparisonResult[] = [];

  // Iterate through priceMap to calculate comparison results for each pair
  priceMap.forEach((prices: number[], pair: string) => {
    const highestPrice = Math.max(...prices);
    const lowestPrice = Math.min(...prices);
    const averagePrice = prices.reduce((acc, curr) => acc + curr, 0) / prices.length;

    comparisonResults.push({ pair, highestPrice, lowestPrice, averagePrice });
  });

  return comparisonResults;
};
