import { createAction } from "@reduxjs/toolkit";

export const CryptoActions = {
  // General Crypto Actions
  fetchCryptoData: createAction<{ cryptoId: string }>("fetchCryptoData"),
  cryptoChangeAction: createAction<{ cryptoData: string[] }>(
    "cryptoChangeAction"
  ),
  fetchCryptoDetails: createAction<{ cryptoId: string }>("fetchCryptoDetails"),
  addCrypto: createAction("addCrypto"),
  removeCrypto: createAction<{ cryptoId: string }>("removeCrypto"),
  updateCrypto: createAction<{ cryptoId: string }>("updateCrypto"),

  // Action: Buy cryptocurrency
  buyCrypto: createAction<{ currency: string; amount: number }>("buyCrypto"),

  // Action: Sell cryptocurrency
  sellCrypto: createAction<{ currency: string; amount: number }>("sellCrypto"),

  // Action: Monitor crypto market trends
  monitorMarketTrends: createAction("monitorMarketTrends"),

  // Action: Join a crypto community forum
  joinCryptoCommunity: createAction<{ communityId: string }>(
    "joinCryptoCommunity"
  ),

  getHistoricalData: createAction<{ cryptoId: string }>("getHistoricalData"),
  getNews: createAction<{ cryptoId: string }>("getNews"),
  getPricePrediction: createAction<{ cryptoId: string }>("getPricePrediction"),
  getTransactions: createAction<{ cryptoId: string }>("getTransactions"),
  getExchangeRates: createAction("getExchangeRates"),
  getMarketCap: createAction<{ cryptoId: string }>("getMarketCap"),
  getSocialSentiment: createAction<{ cryptoId: string }>("getSocialSentiment"),
  getCommunityDiscussions: createAction<{ cryptoId: string }>(
    "getCommunityDiscussions"
  ),
  getTechnicalAnalysis: createAction<{ cryptoId: string }>(
    "getTechnicalAnalysis"
  ),
  getMarketTrend: createAction<{ cryptoId: string }>("getMarketTrend"),
  getTradingVolume: createAction<{ cryptoId: string }>("getTradingVolume"),

  // Additional Crypto Actions
  // Community-related actions
  getCommunitySentiment: createAction<{ cryptoId: string }>(
    "getCommunitySentiment"
  ),
  getSocialImpactAnalysis: createAction<{ cryptoId: string }>(
    "getSocialImpactAnalysis"
  ),
  getGlobalAdoptionTrends: createAction<{ cryptoId: string }>(
    "getGlobalAdoptionTrends"
  ),
  getUserContributionRewards: createAction<{ userId: string }>(
    "getUserContributionRewards"
  ),
  getCommunityProjects: createAction("getCommunityProjects"),
  // Additional actions based on the type of app
  getCommunityEngagementMetrics: createAction<{ cryptoId: string }>(
    "getCommunityEngagementMetrics"
  ),
  getDeveloperSupportChannels: createAction("getDeveloperSupportChannels"),
  getFeedbackFromUsers: createAction<{ cryptoId: string }>(
    "getFeedbackFromUsers"
  ),

  // Developer-related actions
  getDeveloperCompensation: createAction("getDeveloperCompensation"),
  getGlobalCollaborationTools: createAction("getGlobalCollaborationTools"),
  getMonetizationOpportunities: createAction("getMonetizationOpportunities"),
  getRevenueDistribution: createAction("getRevenueDistribution"),
  getImpactAssessment: createAction("getImpactAssessment"),
  // Market-related actions
  getMarketData: createAction("getMarketData"),
  getPortfolioSummary: createAction("getPortfolioSummary"),
  getTopGainers: createAction("getTopGainers"),
  getTopLosers: createAction("getTopLosers"),
  getExchangeListings: createAction("getExchangeListings"),
  getMarketTrends: createAction("getMarketTrends"),
  getTransactionHistory: createAction("getTransactionHistory"),
  // Wallet-related actions
  getWalletBalance: createAction("getWalletBalance"),
  getAlertSettings: createAction("getAlertSettings"),
  getPriceAlerts: createAction("getPriceAlerts"),
  // Insights and analytics actions
  getInsights: createAction("getInsights"),
  // Staking-related actions
  getStakingRewards: createAction("getStakingRewards"),
  // Liquidity-related actions
  getLiquidityPools: createAction("getLiquidityPools"),
  // NFT-related actions
  getNFTMarketplace: createAction("getNFTMarketplace"),
  // Governance-related actions
  getGovernanceProposals: createAction("getGovernanceProposals"),
  // Chain-related actions
  getChainAnalysis: createAction("getChainAnalysis"),
  // DEX-related actions
  getDEXTransactions: createAction("getDEXTransactions"),
  // Regulatory-related actions
  getRegulatoryCompliance: createAction("getRegulatoryCompliance"),
  // Developer resources/actions
  getDeveloperDocumentation: createAction("getDeveloperDocumentation"),
  getIntegrationGuides: createAction("getIntegrationGuides"),
  getDeveloperTools: createAction("getDeveloperTools"),
  getDeveloperResources: createAction("getDeveloperResources"),
  getDeveloperEcosystem: createAction("getDeveloperEcosystem"),
  getDeveloperCommunity: createAction("getDeveloperCommunity"),
};
