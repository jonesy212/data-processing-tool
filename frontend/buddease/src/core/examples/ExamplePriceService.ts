ExamplePriceService.ts
// Example usage in your trade execution
import { getMarketPrice, priceService } from '@/core/api/service/PriceApiService';

// In your executeTrade function
const marketPrice = await getMarketPrice('BTC');

// Or get detailed market data
const btcData = await priceService.getMarketData('BTC');

// Get price history
const btcHistory = await priceService.getPriceHistory('BTC', '7d');

// Set up a price alert
const alert = priceService.createPriceAlert('BTC', 50000, 'above');

// Get multiple prices at once
const prices = await priceService.getMultiplePrices(['BTC', 'ETH', 'ADA']);