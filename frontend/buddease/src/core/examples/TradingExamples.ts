TradingExamples.ts
import {
  fetchNewsAPI,
  fetchMarketNewsAPI,
  fetchEconomicCalendarAPI,
  fetchTradingSignalsAPI,
  fetchMarketSentimentAPI,
  fetchTechnicalAnalysisAPI,
  fetchTopGainersAPI,
  fetchTopLosersAPI,
  fetchTopPerformingAssetsAPI,
  fetchExchangeRatesAPI,
  fetchMarketOverviewAPI,
  fetchCryptoFearGreedAPI,
  fetchTradingTipsAPI,
  fetchEducationalContentAPI
} from './ApiTradingInfo';

Example usage:
const news = await fetchNewsAPI('crypto');
const marketNews = await fetchMarketNewsAPI('stocks');
const calendar = await fetchEconomicCalendarAPI('2024-01-01', '2024-01-31', 'US');
const signals = await fetchTradingSignalsAPI('BTC', '1h');
const sentiment = await fetchMarketSentimentAPI('ETH');
const analysis = await fetchTechnicalAnalysisAPI('AAPL', ['RSI', 'MACD', 'BollingerBands']);
const gainers = await fetchTopGainersAPI('24h');
const losers = await fetchTopLosersAPI('7d');
const topAssets = await fetchTopPerformingAssetsAPI('24h', 20);
const exchangeRates = await fetchExchangeRatesAPI('EUR');
const overview = await fetchMarketOverviewAPI();
const fearGreed = await fetchCryptoFearGreedAPI();
const tips = await fetchTradingTipsAPI('risk-management');
const education = await fetchEducationalContentAPI('technical-analysis', 'intermediate');