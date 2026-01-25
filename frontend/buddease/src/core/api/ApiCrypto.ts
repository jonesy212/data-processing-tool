// ApiCrypto.ts

import internalApiService from '@/core/api/ApiClient'; // Import the internal service
import { endpoints } from "@/core/api/endpointConfigurations";
import { headersConfig } from "@/core/components/shared/SharedHeaders";
import { NotificationTypeEnum } from '@/core/features/support/UnifiedNotificationTypes';
import type { NotificationType } from '@/core/features/support/UnifiedNotificationTypes';
import { useNotification } from '@/core/state/context/NotificationContext';
import { AxiosError } from "axios";

const API_BASE_URL = endpoints.crypto;

// Define API notification messages
interface CryptoNotificationMessages {
   // Existing crypto messages
   FETCH_CRYPTO_DETAILS_SUCCESS: string;
   FETCH_CRYPTO_DETAILS_ERROR: string;
   ADD_CRYPTO_SUCCESS: string;
   ADD_CRYPTO_ERROR: string;
   REMOVE_CRYPTO_SUCCESS: string;
   UPDATE_CRYPTO_SUCCESS: string;
   FETCH_CRYPTO_DATA_ERROR: string;
   REMOVE_CRYPTO_ERROR: string;
   UPDATE_CRYPTO_ERROR: string;
   
   // Trade-specific messages
   TRADE_EXECUTION_SUCCESS: string;
   TRADE_EXECUTION_ERROR: string;
   PORTFOLIO_UPDATE_SUCCESS: string;
   PORTFOLIO_UPDATE_ERROR: string;
   TRADE_ACTIVITY_LOG_SUCCESS: string;
   TRADE_ACTIVITY_LOG_ERROR: string;
   GET_MARKET_PRICE_SUCCESS: string;
   GET_MARKET_PRICE_ERROR: string;

   // New messages for additional endpoints
   FETCH_HISTORICAL_DATA_ERROR: string;
   FETCH_CRYPTO_NEWS_ERROR: string;
   GET_PRICE_PREDICTION_ERROR: string;
   FETCH_CRYPTO_TRANSACTIONS_ERROR: string;
   FETCH_EXCHANGE_RATES_ERROR: string;
   FETCH_PRICING_DATA_ERROR: string;
   FETCH_MARKET_CAP_ERROR: string;
   FETCH_SOCIAL_SENTIMENT_ERROR: string;
   FETCH_COMMUNITY_DISCUSSIONS_ERROR: string;
   FETCH_TECHNICAL_ANALYSIS_ERROR: string;
   FETCH_MARKET_TREND_ERROR: string;
   FETCH_TRADING_VOLUME_ERROR: string;
   FETCH_COMMUNITY_SENTIMENT_ERROR: string;
   FETCH_SOCIAL_IMPACT_ANALYSIS_ERROR: string;
   FETCH_GLOBAL_ADOPTION_TRENDS_ERROR: string;
   FETCH_USER_CONTRIBUTION_REWARDS_ERROR: string;
   FETCH_MARKET_DATA_ERROR: string;
   FETCH_PORTFOLIO_SUMMARY_ERROR: string;
   FETCH_TOP_GAINERS_ERROR: string;
   FETCH_TOP_LOSERS_ERROR: string;
   FETCH_EXCHANGE_LISTINGS_ERROR: string;
}

const cryptoNotificationMessages: CryptoNotificationMessages = {
  // Existing crypto messages
  FETCH_CRYPTO_DETAILS_SUCCESS: "Crypto details fetched successfully",
  FETCH_CRYPTO_DETAILS_ERROR: "Failed to fetch crypto details",
  ADD_CRYPTO_SUCCESS: "Crypto added successfully",
  ADD_CRYPTO_ERROR: "Failed to add crypto",
  REMOVE_CRYPTO_SUCCESS: "Crypto removed successfully",
  UPDATE_CRYPTO_SUCCESS: "Crypto updated successfully",
  FETCH_CRYPTO_DATA_ERROR: "Failed to fetch crypto data",
  REMOVE_CRYPTO_ERROR: "Failed to remove crypto",
  UPDATE_CRYPTO_ERROR: "Failed to update crypto",
  
  // Trade-specific messages
  TRADE_EXECUTION_SUCCESS: "Trade executed successfully",
  TRADE_EXECUTION_ERROR: "Failed to execute trade",
  PORTFOLIO_UPDATE_SUCCESS: "Portfolio updated successfully",
  PORTFOLIO_UPDATE_ERROR: "Failed to update portfolio",
  TRADE_ACTIVITY_LOG_SUCCESS: "Trade activity logged successfully",
  TRADE_ACTIVITY_LOG_ERROR: "Failed to log trade activity",
  GET_MARKET_PRICE_SUCCESS: "Market price fetched successfully",
  GET_MARKET_PRICE_ERROR: "Failed to fetch market price",

  // New messages for additional endpoints
  FETCH_HISTORICAL_DATA_ERROR: "Failed to fetch historical data",
  FETCH_CRYPTO_NEWS_ERROR: "Failed to fetch crypto news",
  GET_PRICE_PREDICTION_ERROR: "Failed to get price prediction",
  FETCH_CRYPTO_TRANSACTIONS_ERROR: "Failed to fetch crypto transactions",
  FETCH_EXCHANGE_RATES_ERROR: "Failed to fetch exchange rates",
  FETCH_PRICING_DATA_ERROR: "Failed to fetch pricing data",
  FETCH_MARKET_CAP_ERROR: "Failed to fetch market cap",
  FETCH_SOCIAL_SENTIMENT_ERROR: "Failed to fetch social sentiment",
  FETCH_COMMUNITY_DISCUSSIONS_ERROR: "Failed to fetch community discussions",
  FETCH_TECHNICAL_ANALYSIS_ERROR: "Failed to fetch technical analysis",
  FETCH_MARKET_TREND_ERROR: "Failed to fetch market trend",
  FETCH_TRADING_VOLUME_ERROR: "Failed to fetch trading volume",
  FETCH_COMMUNITY_SENTIMENT_ERROR: "Failed to fetch community sentiment",
  FETCH_SOCIAL_IMPACT_ANALYSIS_ERROR: "Failed to fetch social impact analysis",
  FETCH_GLOBAL_ADOPTION_TRENDS_ERROR: "Failed to fetch global adoption trends",
  FETCH_USER_CONTRIBUTION_REWARDS_ERROR: "Failed to fetch user contribution rewards",
  FETCH_MARKET_DATA_ERROR: "Failed to fetch market data",
  FETCH_PORTFOLIO_SUMMARY_ERROR: "Failed to fetch portfolio summary",
  FETCH_TOP_GAINERS_ERROR: "Failed to fetch top gainers",
  FETCH_TOP_LOSERS_ERROR: "Failed to fetch top losers",
  FETCH_EXCHANGE_LISTINGS_ERROR: "Failed to fetch exchange listings",
};

// Helper functions for notifications
const notifyCryptoSuccess = (
  id: string, 
  message: string, 
  data: any = null
) => {
  useNotification().notify({
    id,
    message,
    data,
    timestamp: new Date(),
    type: NotificationTypeEnum.SUCCESS
  });
};

const handleCryptoApiErrorAndNotify = (
  error: AxiosError<unknown>,
  errorMessage: string,
  errorMessageId: keyof CryptoNotificationMessages
) => {
  console.error(errorMessage, error);

  if (errorMessageId) {
    const errorMessageText = cryptoNotificationMessages[errorMessageId];
    useNotification().notify({
      id: `crypto-${String(errorMessageId)}`,
      message: errorMessageText,
      data: { originalError: errorMessage },
      timestamp: new Date(),
      type: "error" as NotificationType
    });
  }
};

// STRATEGY: Use internalApiService for CRUD operations with notifications
// Use direct internalApiService for simple data fetching without notifications

export const fetchCryptoData = async (): Promise<any> => {
  try {
    // Using internalApiService for consistent error handling
    const response = await internalApiService.get(
      `${API_BASE_URL}/fetchCryptoData`,
      {
        config: { headers: headersConfig },
        successMessageId: "FETCH_CRYPTO_DETAILS_SUCCESS" as keyof CryptoNotificationMessages,
        errorMessageId: "FETCH_CRYPTO_DATA_ERROR" as keyof CryptoNotificationMessages
      }
    );
    return response.data;
  } catch (error) {
    // Fallback to manual error handling if internalApiService fails
    handleCryptoApiErrorAndNotify(
      error as AxiosError<unknown>,
      "Failed to fetch crypto data",
      "FETCH_CRYPTO_DATA_ERROR"
    );
    throw error;
  }
};

export const addCrypto = async (newCrypto: any): Promise<void> => {
  try {
    // Using internalApiService for consistent success/error handling
    await internalApiService.post(
      `${API_BASE_URL}/api/crypto`,
      newCrypto,
      {
        successMessageId: "ADD_CRYPTO_SUCCESS" as keyof CryptoNotificationMessages,
        errorMessageId: "ADD_CRYPTO_ERROR" as keyof CryptoNotificationMessages,
        notificationData: { crypto: newCrypto }
      }
    );
  } catch (error) {
    handleCryptoApiErrorAndNotify(
      error as AxiosError<unknown>,
      "Failed to add crypto",
      "ADD_CRYPTO_ERROR"
    );
    throw error;
  }
};

export const removeCrypto = async (cryptoId: string): Promise<void> => {
  try {
    await internalApiService.delete(
      `${API_BASE_URL}/api/crypto/${cryptoId}`,
      {
        successMessageId: "REMOVE_CRYPTO_SUCCESS" as keyof CryptoNotificationMessages,
        errorMessageId: "REMOVE_CRYPTO_ERROR" as keyof CryptoNotificationMessages,
        notificationData: { cryptoId }
      }
    );
  } catch (error) {
    handleCryptoApiErrorAndNotify(
      error as AxiosError<unknown>,
      "Failed to remove crypto",
      "REMOVE_CRYPTO_ERROR"
    );
    throw error;
  }
};

export const updateCrypto = async (
  cryptoId: string,
  updatedCryptoData: any
): Promise<void> => {
  try {
    await internalApiService.put(
      `${API_BASE_URL}/api/crypto/${cryptoId}`,
      updatedCryptoData,
      {
        successMessageId: "UPDATE_CRYPTO_SUCCESS" as keyof CryptoNotificationMessages,
        errorMessageId: "UPDATE_CRYPTO_ERROR" as keyof CryptoNotificationMessages,
        notificationData: { cryptoId, updatedData: updatedCryptoData }
      }
    );
  } catch (error) {
    handleCryptoApiErrorAndNotify(
      error as AxiosError<unknown>,
      "Failed to update crypto",
      "UPDATE_CRYPTO_ERROR"
    );
    throw error;
  }
};

// STRATEGY: Use direct internalApiService for data fetching where you don't want notifications
// or for external API calls

export const fetchHistoricalData = async (cryptoId: string): Promise<any> => {
  try {
    const response = await internalApiService.get(
      `${API_BASE_URL}/api/crypto/${cryptoId}/historical-data`
    );
    return response.data;
  } catch (error) {
    handleCryptoApiErrorAndNotify(
      error as AxiosError<unknown>,
      "Failed to fetch historical data for crypto",
      "FETCH_HISTORICAL_DATA_ERROR"
    );
    throw error;
  }
};

export const fetchCryptoNews = async (cryptoId: string): Promise<any> => {
  try {
    const response = await internalApiService.get(
      `${API_BASE_URL}/api/crypto/${cryptoId}/news`
    );
    return response.data;
  } catch (error) {
    handleCryptoApiErrorAndNotify(
      error as AxiosError<unknown>,
      "Failed to fetch news for crypto",
      "FETCH_CRYPTO_NEWS_ERROR"
    );
    throw error;
  }
};

export const getPricePrediction = async (cryptoId: string): Promise<any> => {
  try {
    const response = await internalApiService.get(
      `${API_BASE_URL}/api/crypto/${cryptoId}/price-prediction`
    );
    return response.data;
  } catch (error) {
    handleCryptoApiErrorAndNotify(
      error as AxiosError<unknown>,
      "Failed to get price prediction for crypto",
      "GET_PRICE_PREDICTION_ERROR"
    );
    throw error;
  }
};

export const fetchCryptoTransactions = async (cryptoId: string): Promise<any> => {
  try {
    const response = await internalApiService.get(
      `${API_BASE_URL}/api/crypto/${cryptoId}/transactions`
    );
    return response.data;
  } catch (error) {
    handleCryptoApiErrorAndNotify(
      error as AxiosError<unknown>,
      "Failed to fetch crypto transactions",
      "FETCH_CRYPTO_TRANSACTIONS_ERROR"
    );
    throw error;
  }
};

export const fetchExchangeRates = async (): Promise<any> => {
  try {
    const response = await internalApiService.get(
      `${API_BASE_URL}/api/crypto/exchange-rates`
    );
    return response.data;
  } catch (error) {
    handleCryptoApiErrorAndNotify(
      error as AxiosError<unknown>,
      "Failed to fetch exchange rates",
      "FETCH_EXCHANGE_RATES_ERROR"
    );
    throw error;
  }
};

export const fetchPricingData = async (): Promise<any> => {
  try {
    const response = await internalApiService.get(`${API_BASE_URL}/pricing-data`);
    return response.data;
  } catch (error) {
    handleCryptoApiErrorAndNotify(
      error as AxiosError<unknown>,
      "Failed to fetch pricing data",
      "FETCH_PRICING_DATA_ERROR"
    );
    throw error;
  }
};

export const getCurrentPrice = async (): Promise<number> => {
  try {
    // Using direct internalApiService for external API calls
    const response = await internalApiService.get("URL_TO_YOUR_API_ENDPOINT_HERE");
    const currentPrice = response.data.currentPrice;
    return currentPrice;
  } catch (error) {
    console.error("Failed to fetch current price:", error);
    throw error; // No notification for external API failures
  }
};

// Additional data fetching functions using direct internalApiService
export const fetchMarketCap = async (cryptoId: string): Promise<any> => {
  try {
    const response = await internalApiService.get(
      `${API_BASE_URL}/api/crypto/${cryptoId}/market-cap`
    );
    return response.data;
  } catch (error) {
    handleCryptoApiErrorAndNotify(
      error as AxiosError<unknown>,
      "Failed to fetch market cap",
      "FETCH_MARKET_CAP_ERROR"
    );
    throw error;
  }
};

export const fetchSocialSentiment = async (cryptoId: string): Promise<any> => {
  try {
    const response = await internalApiService.get(
      `${API_BASE_URL}/api/crypto/${cryptoId}/social-sentiment`
    );
    return response.data;
  } catch (error) {
    handleCryptoApiErrorAndNotify(
      error as AxiosError<unknown>,
      "Failed to fetch social sentiment",
      "FETCH_SOCIAL_SENTIMENT_ERROR"
    );
    throw error;
  }
};

// ... continue with other data fetching functions using the same pattern

export const fetchCommunityDiscussions = async (cryptoId: string): Promise<any> => {
  try {
    const response = await internalApiService.get(
      `${API_BASE_URL}/api/crypto/${cryptoId}/community-discussions`
    );
    return response.data;
  } catch (error) {
    handleCryptoApiErrorAndNotify(
      error as AxiosError<unknown>,
      "Failed to fetch community discussions",
      "FETCH_COMMUNITY_DISCUSSIONS_ERROR"
    );
    throw error;
  }
};

export const fetchTechnicalAnalysis = async (cryptoId: string): Promise<any> => {
  try {
    const response = await internalApiService.get(
      `${API_BASE_URL}/api/crypto/${cryptoId}/technical-analysis`
    );
    return response.data;
  } catch (error) {
    handleCryptoApiErrorAndNotify(
      error as AxiosError<unknown>,
      "Failed to fetch technical analysis",
      "FETCH_TECHNICAL_ANALYSIS_ERROR"
    );
    throw error;
  }
};

// Function to fetch market trend for a crypto
export const fetchMarketTrend = async (cryptoId: string): Promise<any> => {
  try {
    const response = await internalApiService.get(
      `${API_BASE_URL}/api/crypto/${cryptoId}/market-trend`
    );
    return response.data;
  } catch (error) {
    handleCryptoApiErrorAndNotify(
      error as AxiosError<unknown>,
      "Failed to fetch market trend",
      "FETCH_MARKET_TREND_ERROR"
    );
    throw error;
  }
};

// Function to fetch trading volume for a crypto
export const fetchTradingVolume = async (cryptoId: string): Promise<any> => {
  try {
    const response = await internalApiService.get(
      `${API_BASE_URL}/api/crypto/${cryptoId}/trading-volume`
    );
    return response.data;
  } catch (error) {
    handleCryptoApiErrorAndNotify(
      error as AxiosError<unknown>,
      "Failed to fetch trading volume",
      "FETCH_TRADING_VOLUME_ERROR"
    );
    throw error;
  }
};

// Function to fetch community sentiment for a crypto
export const fetchCommunitySentiment = async (
  cryptoId: string
): Promise<any> => {
  try {
    const response = await internalApiService.get(
      `${API_BASE_URL}/api/crypto/${cryptoId}/community-sentiment`
    );
    return response.data;
  } catch (error) {
    handleCryptoApiErrorAndNotify(
      error as AxiosError<unknown>,
      "Failed to fetch community sentiment",
      "FETCH_COMMUNITY_SENTIMENT_ERROR"
    );
    throw error;
  }
};

// Function to fetch social impact analysis for a crypto
export const fetchSocialImpactAnalysis = async (
  cryptoId: string
): Promise<any> => {
  try {
    const response = await internalApiService.get(
      `${API_BASE_URL}/api/crypto/${cryptoId}/social-impact-analysis`
    );
    return response.data;
  } catch (error) {
    handleCryptoApiErrorAndNotify(
      error as AxiosError<unknown>,
      "Failed to fetch social impact analysis",
      "FETCH_SOCIAL_IMPACT_ANALYSIS_ERROR"
    );
    throw error;
  }
};

// Function to fetch global adoption trends for a crypto
export const fetchGlobalAdoptionTrends = async (
  cryptoId: string
): Promise<any> => {
  try {
    const response = await internalApiService.get(
      `${API_BASE_URL}/api/crypto/${cryptoId}/global-adoption-trends`
    );
    return response.data;
  } catch (error) {
    handleCryptoApiErrorAndNotify(
      error as AxiosError<unknown>,
      "Failed to fetch global adoption trends",
      "FETCH_GLOBAL_ADOPTION_TRENDS_ERROR"
    );
    throw error;
  }
};

// Function to fetch user contribution rewards
export const fetchUserContributionRewards = async (
  userId: string
): Promise<any> => {
  try {
    const response = await internalApiService.get(
      `${API_BASE_URL}/api/crypto/users/${userId}/contribution-rewards`
    );
    return response.data;
  } catch (error) {
    handleCryptoApiErrorAndNotify(
      error as AxiosError<unknown>,
      "Failed to fetch user contribution rewards",
      "FETCH_USER_CONTRIBUTION_REWARDS_ERROR"
    );
    throw error;
  }
};

// Function to fetch market data related to cryptocurrencies
export const fetchMarketData = async (): Promise<any> => {
  try {
    const response = await internalApiService.get(
      `${API_BASE_URL}/api/crypto/market-data`
    );
    return response.data;
  } catch (error) {
    handleCryptoApiErrorAndNotify(
      error as AxiosError<unknown>,
      "Failed to fetch market data",
      "FETCH_MARKET_DATA_ERROR"
    );
    throw error;
  }
};

// Function to fetch portfolio summary
export const fetchPortfolioSummary = async (): Promise<any> => {
  try {
    const response = await internalApiService.get(
      `${API_BASE_URL}/api/crypto/portfolio-summary`
    );
    return response.data;
  } catch (error) {
    handleCryptoApiErrorAndNotify(
      error as AxiosError<unknown>,
      "Failed to fetch portfolio summary",
      "FETCH_PORTFOLIO_SUMMARY_ERROR"
    );
    throw error;
  }
};

// Function to fetch top gaining cryptocurrencies
export const fetchTopGainers = async (): Promise<any> => {
  try {
    const response = await internalApiService.get(
      `${API_BASE_URL}/api/crypto/top-gainers`
    );
    return response.data;
  } catch (error) {
    handleCryptoApiErrorAndNotify(
      error as AxiosError<unknown>,
      "Failed to fetch top gainers",
      "FETCH_TOP_GAINERS_ERROR"
    );
    throw error;
  }
};

// Function to fetch top losing cryptocurrencies
export const fetchTopLosers = async (): Promise<any> => {
  try {
    const response = await internalApiService.get(
      `${API_BASE_URL}/api/crypto/top-losers`
    );
    return response.data;
  } catch (error) {
    handleCryptoApiErrorAndNotify(
      error as AxiosError<unknown>,
      "Failed to fetch top losers",
      "FETCH_TOP_LOSERS_ERROR"
    );
    throw error;
  }
};

// Function to fetch listings of cryptocurrency exchanges
export const fetchExchangeListings = async (): Promise<any> => {
  try {
    const response = await internalApiService.get(
      `${API_BASE_URL}/api/crypto/exchange-listings`
    );
    return response.data;
  } catch (error) {
    handleCryptoApiErrorAndNotify(
      error as AxiosError<unknown>,
      "Failed to fetch exchange listings",
      "FETCH_EXCHANGE_LISTINGS_ERROR"
    );
    throw error;
  }
};
// Define and implement other CRUD operations for crypto entities similarly

export { cryptoNotificationMessages };
