// TradingEndpoints.ts
import { EndpointCategoryConfig, EndpointConfig } from '@/app/config/EndpointConfig';

export interface TradingEndpoints extends EndpointCategoryConfig {
  // Trading platform endpoints
  getMarketData: EndpointConfig;
  getPortfolioSummary: EndpointConfig;
  getTopGainers: EndpointConfig;
  getTopLosers: EndpointConfig;
  getExchangeListings: EndpointConfig;
  getMarketTrends: EndpointConfig;
  getTransactionHistory: EndpointConfig;
  getWalletBalance: EndpointConfig;
  getAlertSettings: EndpointConfig;
  getInsights: EndpointConfig;
  getStakingRewards: EndpointConfig;
  getLiquidityPools: EndpointConfig;
  getNFTMarketplace: EndpointConfig;
  getGovernanceProposals: EndpointConfig;
  getChainAnalysis: EndpointConfig;
  getDEXTransactions: EndpointConfig;
  getRegulatoryCompliance: EndpointConfig;
  getDeveloperDocumentation: EndpointConfig;
  getIntegrationGuides: EndpointConfig;
  getDeveloperTools: EndpointConfig;
  getDeveloperResources: EndpointConfig;
  getDeveloperEcosystem: EndpointConfig;
  getDeveloperCommunity: EndpointConfig;
  
  // Trading operations
  placeOrder: EndpointConfig;
  cancelOrder: (orderId: string) => EndpointConfig;
  getOrderStatus: (orderId: string) => EndpointConfig;
  getOpenOrders: EndpointConfig;
  getOrderHistory: EndpointConfig;
  getTradeHistory: EndpointConfig;
  
  // Account management
  getAccountBalance: EndpointConfig;
  getAccountInfo: EndpointConfig;
  updateAccountSettings: EndpointConfig;
  getDepositAddress: EndpointConfig;
  withdrawFunds: EndpointConfig;
  getWithdrawalHistory: EndpointConfig;
  
  // Market analysis
  getMarketDepth: (symbol: string) => EndpointConfig;
  getTicker: (symbol: string) => EndpointConfig;
  getCandlestickData: (symbol: string, interval: string) => EndpointConfig;
  getMarketStatistics: EndpointConfig;
  
  // Risk management
  setStopLoss: EndpointConfig;
  setTakeProfit: EndpointConfig;
  getRiskMetrics: EndpointConfig;
  updateRiskSettings: EndpointConfig;
  
  // Portfolio management
  getPortfolioAllocation: EndpointConfig;
  rebalancePortfolio: EndpointConfig;
  getPerformanceMetrics: EndpointConfig;
  
  // Trading bots and automation
  createTradingBot: EndpointConfig;
  updateTradingBot: (botId: string) => EndpointConfig;
  deleteTradingBot: (botId: string) => EndpointConfig;
  getTradingBots: EndpointConfig;
  startTradingBot: (botId: string) => EndpointConfig;
  stopTradingBot: (botId: string) => EndpointConfig;
  
  // Alerts and notifications
  createPriceAlert: EndpointConfig;
  updatePriceAlert: (alertId: string) => EndpointConfig;
  deletePriceAlert: (alertId: string) => EndpointConfig;
  getPriceAlerts: EndpointConfig;
  
  // Social trading
  followTrader: (traderId: string) => EndpointConfig;
  unfollowTrader: (traderId: string) => EndpointConfig;
  getFollowedTraders: EndpointConfig;
  copyTrade: (tradeId: string) => EndpointConfig;
  
  // Analytics and reporting
  getTradingAnalytics: EndpointConfig;
  generateTradingReport: EndpointConfig;
  getTaxReport: EndpointConfig;
}