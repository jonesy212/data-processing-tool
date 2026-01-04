tradingConfig.ts
import { BASE_URL } from '@/core/api/baseUrl';
import { TradingEndpoints } from '@/core/typings/categories/TradingEndpoints';

export const tradingConfig: TradingEndpoints = {
  // Trading platform endpoints
  getMarketData: { path: `${BASE_URL}/api/trading/market-data`, method: "GET" },
  getPortfolioSummary: { path: `${BASE_URL}/api/trading/portfolio-summary`, method: "GET" },
  getTopGainers: { path: `${BASE_URL}/api/trading/top-gainers`, method: "GET" },
  getTopLosers: { path: `${BASE_URL}/api/trading/top-losers`, method: "GET" },
  getExchangeListings: { path: `${BASE_URL}/api/trading/exchange-listings`, method: "GET" },
  getMarketTrends: { path: `${BASE_URL}/api/trading/market-trends`, method: "GET" },
  getTransactionHistory: { path: `${BASE_URL}/api/trading/transaction-history`, method: "GET" },
  getWalletBalance: { path: `${BASE_URL}/api/trading/wallet-balance`, method: "GET" },
  getAlertSettings: { path: `${BASE_URL}/api/trading/alert-settings`, method: "GET" },
  getPriceAlerts: { path: `${BASE_URL}/api/trading/price-alerts`, method: "GET" },
  getInsights: { path: `${BASE_URL}/api/trading/insights`, method: "GET" },
  getStakingRewards: { path: `${BASE_URL}/api/trading/staking-rewards`, method: "GET" },
  getLiquidityPools: { path: `${BASE_URL}/api/trading/liquidity-pools`, method: "GET" },
  getNFTMarketplace: { path: `${BASE_URL}/api/trading/nft-marketplace`, method: "GET" },
  getGovernanceProposals: { path: `${BASE_URL}/api/trading/governance-proposals`, method: "GET" },
  getChainAnalysis: { path: `${BASE_URL}/api/trading/chain-analysis`, method: "GET" },
  getDEXTransactions: { path: `${BASE_URL}/api/trading/dex-transactions`, method: "GET" },
  getRegulatoryCompliance: { path: `${BASE_URL}/api/trading/regulatory-compliance`, method: "GET" },
  getDeveloperDocumentation: { path: `${BASE_URL}/api/trading/developer-docs`, method: "GET" },
  getIntegrationGuides: { path: `${BASE_URL}/api/trading/integration-guides`, method: "GET" },
  getDeveloperTools: { path: `${BASE_URL}/api/trading/developer-tools`, method: "GET" },
  getDeveloperResources: { path: `${BASE_URL}/api/trading/developer-resources`, method: "GET" },
  getDeveloperEcosystem: { path: `${BASE_URL}/api/trading/developer-ecosystem`, method: "GET" },
  getDeveloperCommunity: { path: `${BASE_URL}/api/trading/developer-community`, method: "GET" },
  
  // Trading operations
  placeOrder: { path: `${BASE_URL}/api/trading/place-order`, method: "POST" },
  cancelOrder: (orderId: string) => ({ path: `${BASE_URL}/api/trading/cancel-order/${orderId}`, method: "DELETE" }),
  getOrderStatus: (orderId: string) => ({ path: `${BASE_URL}/api/trading/order-status/${orderId}`, method: "GET" }),
  getOpenOrders: { path: `${BASE_URL}/api/trading/open-orders`, method: "GET" },
  getOrderHistory: { path: `${BASE_URL}/api/trading/order-history`, method: "GET" },
  getTradeHistory: { path: `${BASE_URL}/api/trading/trade-history`, method: "GET" },
  
  // Account management
  getAccountBalance: { path: `${BASE_URL}/api/trading/account-balance`, method: "GET" },
  getAccountInfo: { path: `${BASE_URL}/api/trading/account-info`, method: "GET" },
  updateAccountSettings: { path: `${BASE_URL}/api/trading/account-settings`, method: "PUT" },
  getDepositAddress: { path: `${BASE_URL}/api/trading/deposit-address`, method: "GET" },
  withdrawFunds: { path: `${BASE_URL}/api/trading/withdraw`, method: "POST" },
  getWithdrawalHistory: { path: `${BASE_URL}/api/trading/withdrawal-history`, method: "GET" },
  
  // Market analysis
  getMarketDepth: (symbol: string) => ({ path: `${BASE_URL}/api/trading/market-depth/${symbol}`, method: "GET" }),
  getTicker: (symbol: string) => ({ path: `${BASE_URL}/api/trading/ticker/${symbol}`, method: "GET" }),
  getCandlestickData: (symbol: string, interval: string) => ({ path: `${BASE_URL}/api/trading/candlestick/${symbol}/${interval}`, method: "GET" }),
  getMarketStatistics: { path: `${BASE_URL}/api/trading/market-statistics`, method: "GET" },
  
  // Risk management
  setStopLoss: { path: `${BASE_URL}/api/trading/stop-loss`, method: "POST" },
  setTakeProfit: { path: `${BASE_URL}/api/trading/take-profit`, method: "POST" },
  getRiskMetrics: { path: `${BASE_URL}/api/trading/risk-metrics`, method: "GET" },
  updateRiskSettings: { path: `${BASE_URL}/api/trading/risk-settings`, method: "PUT" },
  
  // Portfolio management
  getPortfolioAllocation: { path: `${BASE_URL}/api/trading/portfolio-allocation`, method: "GET" },
  rebalancePortfolio: { path: `${BASE_URL}/api/trading/rebalance-portfolio`, method: "POST" },
  getPerformanceMetrics: { path: `${BASE_URL}/api/trading/performance-metrics`, method: "GET" },
  
  // Trading bots and automation
  createTradingBot: { path: `${BASE_URL}/api/trading/trading-bot`, method: "POST" },
  updateTradingBot: (botId: string) => ({ path: `${BASE_URL}/api/trading/trading-bot/${botId}`, method: "PUT" }),
  deleteTradingBot: (botId: string) => ({ path: `${BASE_URL}/api/trading/trading-bot/${botId}`, method: "DELETE" }),
  getTradingBots: { path: `${BASE_URL}/api/trading/trading-bots`, method: "GET" },
  startTradingBot: (botId: string) => ({ path: `${BASE_URL}/api/trading/trading-bot/${botId}/start`, method: "POST" }),
  stopTradingBot: (botId: string) => ({ path: `${BASE_URL}/api/trading/trading-bot/${botId}/stop`, method: "POST" }),
  
  // Alerts and notifications
  createPriceAlert: { path: `${BASE_URL}/api/trading/price-alert`, method: "POST" },
  updatePriceAlert: (alertId: string) => ({ path: `${BASE_URL}/api/trading/price-alert/${alertId}`, method: "PUT" }),
  deletePriceAlert: (alertId: string) => ({ path: `${BASE_URL}/api/trading/price-alert/${alertId}`, method: "DELETE" }),
  
  // Social trading
  followTrader: (traderId: string) => ({ path: `${BASE_URL}/api/trading/follow-trader/${traderId}`, method: "POST" }),
  unfollowTrader: (traderId: string) => ({ path: `${BASE_URL}/api/trading/unfollow-trader/${traderId}`, method: "DELETE" }),
  getFollowedTraders: { path: `${BASE_URL}/api/trading/followed-traders`, method: "GET" },
  copyTrade: (tradeId: string) => ({ path: `${BASE_URL}/api/trading/copy-trade/${tradeId}`, method: "POST" }),
  
  // Analytics and reporting
  getTradingAnalytics: { path: `${BASE_URL}/api/trading/analytics`, method: "GET" },
  generateTradingReport: { path: `${BASE_URL}/api/trading/generate-report`, method: "POST" },
  getTaxReport: { path: `${BASE_URL}/api/trading/tax-report`, method: "GET" },
};