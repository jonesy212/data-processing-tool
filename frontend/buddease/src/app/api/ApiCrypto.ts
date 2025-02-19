// ApiCrypto.ts

import { AxiosError } from "axios";
import { headersConfig } from "../components/shared/SharedHeaders";
import {
  NotificationType,
  NotificationTypeEnum,
  useNotification,
} from "../components/support/NotificationContext";
import { endpoints } from "./ApiEndpoints";
import axiosInstance from "./axiosInstance";

const API_BASE_URL = endpoints.crypto;

// Define API notification messages
interface CryptoNotificationMessages {
  FETCH_CRYPTO_DETAILS_SUCCESS: string;
  FETCH_CRYPTO_DETAILS_ERROR: string;
  ADD_CRYPTO_SUCCESS: string;
  ADD_CRYPTO_ERROR: string;
  REMOVE_CRYPTO_SUCCESS: string;
  UPDATE_CRYPTO_SUCCESS: string;
  FETCH_CRYPTO_DATA_ERROR: string;
  REMOVE_CRYPTO_ERROR: string;
  UPDATE_CRYPTO_ERROR: string;
  // Add more keys as needed
}

const cryptoNotificationMessages: CryptoNotificationMessages = {
  FETCH_CRYPTO_DETAILS_SUCCESS: "Crypto details fetched successfully",
  FETCH_CRYPTO_DETAILS_ERROR: "Failed to fetch crypto details",
  ADD_CRYPTO_SUCCESS: "Crypto added successfully",
  ADD_CRYPTO_ERROR: "Failed to add crypto",
  REMOVE_CRYPTO_SUCCESS: "Crypto removed successfully",
  UPDATE_CRYPTO_SUCCESS: "Crypto updated successfully",
  FETCH_CRYPTO_DATA_ERROR: "Failed to fetch crypto data",
  REMOVE_CRYPTO_ERROR: "Failed to remove crypto",
  UPDATE_CRYPTO_ERROR: "Failed to update crypto",
  // Add more messages as needed
};
const handleCryptoApiErrorAndNotify = (
  error: AxiosError<unknown>,
  errorMessage: string,
  errorMessageId: keyof CryptoNotificationMessages
) => {
  // Handle API error
  console.error(errorMessage, error);

  // Notify error message
  if (errorMessageId) {
    const errorMessageText = cryptoNotificationMessages[errorMessageId];
    useNotification().notify(
      errorMessageId,
      errorMessageText,
      null,
      new Date(),
      "ApiClientError" as NotificationType
    );
  }
};

export const fetchCryptoData = async (): Promise<any> => {
  try {
    const fetchCryptoDataEndpoint = `${API_BASE_URL}/fetchCryptoData`;
    const response = await axiosInstance.get(fetchCryptoDataEndpoint, {
      headers: headersConfig,
    });
    return response.data;
  } catch (error) {
    const errorMessage = "Failed to fetch crypto data";
    handleCryptoApiErrorAndNotify(
      error as AxiosError<unknown>,
      errorMessage,
      "FETCH_CRYPTO_DATA_ERROR"
    );
    throw error;
  }
};

export const addCrypto = async (newCrypto: any): Promise<void> => {
  try {
    const addCryptoEndpoint = `${API_BASE_URL}/api/crypto`;
    await axiosInstance.post(addCryptoEndpoint, newCrypto);
    // Notify success message
    const successMessage = cryptoNotificationMessages.ADD_CRYPTO_SUCCESS;
    useNotification().notify(
      "AddCryptoSuccessId",
      successMessage,
      null,
      new Date(),
      NotificationTypeEnum.Success
    );
  } catch (error) {
    const errorMessage = "Failed to add crypto";
    handleCryptoApiErrorAndNotify(
      error as AxiosError<unknown>,
      errorMessage,
      "ADD_CRYPTO_ERROR"
    );
    throw error;
  }
};

// Function to remove crypto by ID
export const removeCrypto = async (cryptoId: string): Promise<void> => {
  try {
    // Send a request to the server to remove the crypto with the specified ID
    await axiosInstance.delete(`${API_BASE_URL}/api/crypto/${cryptoId}`);

    // Notify success message
    const successMessage = cryptoNotificationMessages.REMOVE_CRYPTO_SUCCESS;
    useNotification().notify(
      "RemoveCryptoSuccessId",
      successMessage,
      null,
      new Date(),
      NotificationTypeEnum.Success
    );
  } catch (error) {
    // Handle errors
    const errorMessage = "Failed to remove crypto";
    handleCryptoApiErrorAndNotify(
      error as AxiosError<unknown>,
      errorMessage,
      "REMOVE_CRYPTO_ERROR"
    );
    throw error;
  }
};

// Function to update crypto by ID
export const updateCrypto = async (
  cryptoId: string,
  updatedCryptoData: any
): Promise<void> => {
  try {
    // Send a PUT request to the server to update the crypto with the specified ID
    await axiosInstance.put(
      `${API_BASE_URL}/api/crypto/${cryptoId}`,
      updatedCryptoData
    );

    // Notify success message
    const successMessage = cryptoNotificationMessages.UPDATE_CRYPTO_SUCCESS;
    useNotification().notify(
      "UpdateCryptoSuccessId",
      successMessage,
      null,
      new Date(),
      NotificationTypeEnum.Success
    );
  } catch (error) {
    // Handle errors
    const errorMessage = "Failed to update crypto";
    handleCryptoApiErrorAndNotify(
      error as AxiosError<unknown>,
      errorMessage,
      "UPDATE_CRYPTO_ERROR"
    );
    throw error;
  }
};

// Function to fetch historical data for a crypto
export const fetchHistoricalData = async (cryptoId: string): Promise<any> => {
  try {
    const response = await axiosInstance.get(
      `${API_BASE_URL}/api/crypto/${cryptoId}/historical-data`
    );
    return response.data;
  } catch (error) {
    handleCryptoApiErrorAndNotify(
      error as AxiosError<unknown>,
      "Failed to fetch historical data for crypto",
      "FetchHistoricalDataErrorId"  as keyof CryptoNotificationMessages 
    );
    throw error;
  }
};

// Function to fetch news for a crypto
export const fetchCryptoNews = async (cryptoId: string): Promise<any> => {
  try {
    const response = await axiosInstance.get(
      `${API_BASE_URL}/api/crypto/${cryptoId}/news`
    );
    return response.data;
  } catch (error) {
    handleCryptoApiErrorAndNotify(
      error as AxiosError<unknown>,
      "Failed to fetch news for crypto",
      "FetchCryptoNewsErrorId"  as keyof CryptoNotificationMessages 
    );
    throw error;
  }
};

// Function to get price prediction for a crypto
export const getPricePrediction = async (cryptoId: string): Promise<any> => {
  try {
    const response = await axiosInstance.get(
      `${API_BASE_URL}/api/crypto/${cryptoId}/price-prediction`
    );
    return response.data;
  } catch (error) {
    handleCryptoApiErrorAndNotify(
      error as AxiosError<unknown>,
      "Failed to get price prediction for crypto",
      "GetPricePredictionErrorId"  as keyof CryptoNotificationMessages 
    );
    throw error;
  }
};

// Function to fetch transactions for a crypto
export const fetchCryptoTransactions = async (
  cryptoId: string
): Promise<any> => {
  try {
    const response = await axiosInstance.get(
      `${API_BASE_URL}/api/crypto/${cryptoId}/transactions`
    );
    return response.data;
  } catch (error) {
    handleCryptoApiErrorAndNotify(
      error as AxiosError<unknown>,
      "Failed to fetch crypto transactions",
      "FetchCryptoTransactionsErrorId"  as keyof CryptoNotificationMessages 
    );
    throw error;
  }
};

// Function to fetch exchange rates for cryptocurrencies
export const fetchExchangeRates = async (): Promise<any> => {
  try {
    const response = await axiosInstance.get(
      `${API_BASE_URL}/api/crypto/exchange-rates`
    );
    return response.data;
  } catch (error) {
    handleCryptoApiErrorAndNotify(
      error as AxiosError<unknown>,
      "Failed to fetch exchange rates",
      "FetchExchangeRatesErrorId"  as keyof CryptoNotificationMessages 
    );
    throw error;
  }
};

export const fetchPricingData = async (): Promise<any> => {
  try {
    const fetchPricingDataEndpoint = `${API_BASE_URL}/pricing-data`;
    const response = await axiosInstance.get(fetchPricingDataEndpoint);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch pricing data", error);
    handleCryptoApiErrorAndNotify(
      error as AxiosError<unknown>,
      "Failed to fetch pricing data",
      "FetchPricingDataErrorId"  as keyof CryptoNotificationMessages 
    );
  }
};

// Function to fetch the current price from an external API
export const getCurrentPrice = async (): Promise<number> => {
  try {
    // Make a request to the API endpoint to fetch the current price
    const response = await axiosInstance.get("URL_TO_YOUR_API_ENDPOINT_HERE");

    // Extract the current price from the response data
    const currentPrice = response.data.currentPrice; // Adjust this according to the structure of the API response

    // Return the current price
    return currentPrice;
  } catch (error) {
    // Handle errors, such as network issues or invalid response format
    console.error("Failed to fetch current price:", error);
    throw error;
  }
};

// Function to fetch market cap for a crypto
export const fetchMarketCap = async (cryptoId: string): Promise<any> => {
  try {
    const response = await axiosInstance.get(
      `${API_BASE_URL}/api/crypto/${cryptoId}/market-cap`
    );
    return response.data;
  } catch (error) {
    handleCryptoApiErrorAndNotify(
      error as AxiosError<unknown>,
      "Failed to fetch market cap",
      "FetchMarketCapErrorId"  as keyof CryptoNotificationMessages 
    );
    throw error;
  }
};

// Function to fetch social sentiment for a crypto
export const fetchSocialSentiment = async (cryptoId: string): Promise<any> => {
  try {
    const response = await axiosInstance.get(
      `${API_BASE_URL}/api/crypto/${cryptoId}/social-sentiment`
    );
    return response.data;
  } catch (error) {
    handleCryptoApiErrorAndNotify(
      error as AxiosError<unknown>,
      "Failed to fetch social sentiment",
      "FetchSocialSentimentErrorId"  as keyof CryptoNotificationMessages 
    );
    throw error;
  }
};

// Function to fetch community discussions for a crypto
export const fetchCommunityDiscussions = async (
  cryptoId: string
): Promise<any> => {
  try {
    const response = await axiosInstance.get(
      `${API_BASE_URL}/api/crypto/${cryptoId}/community-discussions`
    );
    return response.data;
  } catch (error) {
    handleCryptoApiErrorAndNotify(
      error as AxiosError<unknown>,
      "Failed to fetch community discussions",
      "FetchCommunityDiscussionsErrorId"  as keyof CryptoNotificationMessages 
    );
    throw error;
  }
};

// Function to fetch technical analysis for a crypto
export const fetchTechnicalAnalysis = async (
  cryptoId: string
): Promise<any> => {
  try {
    const response = await axiosInstance.get(
      `${API_BASE_URL}/api/crypto/${cryptoId}/technical-analysis`
    );
    return response.data;
  } catch (error) {
    handleCryptoApiErrorAndNotify(
      error as AxiosError<unknown>,
      "Failed to fetch technical analysis",
      "FetchTechnicalAnalysisErrorId"  as keyof CryptoNotificationMessages 
    );
    throw error;
  }
};

// Function to fetch market trend for a crypto
export const fetchMarketTrend = async (cryptoId: string): Promise<any> => {
  try {
    const response = await axiosInstance.get(
      `${API_BASE_URL}/api/crypto/${cryptoId}/market-trend`
    );
    return response.data;
  } catch (error) {
    handleCryptoApiErrorAndNotify(
      error as AxiosError<unknown>,
      "Failed to fetch market trend",
      "FetchMarketTrendErrorId"  as keyof CryptoNotificationMessages   as keyof CryptoNotificationMessages 
    );
    throw error;
  }
};

// Function to fetch trading volume for a crypto
export const fetchTradingVolume = async (cryptoId: string): Promise<any> => {
  try {
    const response = await axiosInstance.get(
      `${API_BASE_URL}/api/crypto/${cryptoId}/trading-volume`
    );
    return response.data;
  } catch (error) {
    handleCryptoApiErrorAndNotify(
      error as AxiosError<unknown>,
      "Failed to fetch trading volume",
      "FetchTradingVolumeError" as keyof CryptoNotificationMessages
    );
    throw error;
  }
};

// Function to fetch community sentiment for a crypto
export const fetchCommunitySentiment = async (
  cryptoId: string
): Promise<any> => {
  try {
    const response = await axiosInstance.get(
      `${API_BASE_URL}/api/crypto/${cryptoId}/community-sentiment`
    );
    return response.data;
  } catch (error) {
    handleCryptoApiErrorAndNotify(
      error as AxiosError<unknown>,
      "Failed to fetch community sentiment",
      "FetchCommunitySentimentErrorId"  as keyof CryptoNotificationMessages 
    );
    throw error;
  }
};

// Function to fetch social impact analysis for a crypto
export const fetchSocialImpactAnalysis = async (
  cryptoId: string
): Promise<any> => {
  try {
    const response = await axiosInstance.get(
      `${API_BASE_URL}/api/crypto/${cryptoId}/social-impact-analysis`
    );
    return response.data;
  } catch (error) {
    handleCryptoApiErrorAndNotify(
      error as AxiosError<unknown>,
      "Failed to fetch social impact analysis",
      "FetchSocialImpactAnalysisErrorId"  as keyof CryptoNotificationMessages 
    );
    throw error;
  }
};

// Function to fetch global adoption trends for a crypto
export const fetchGlobalAdoptionTrends = async (
  cryptoId: string
): Promise<any> => {
  try {
    const response = await axiosInstance.get(
      `${API_BASE_URL}/api/crypto/${cryptoId}/global-adoption-trends`
    );
    return response.data;
  } catch (error) {
    handleCryptoApiErrorAndNotify(
      error as AxiosError<unknown>,
      "Failed to fetch global adoption trends",
      "FetchGlobalAdoptionTrendsErrorId"  as keyof CryptoNotificationMessages 
    );
    throw error;
  }
};

// Function to fetch user contribution rewards
export const fetchUserContributionRewards = async (
  userId: string
): Promise<any> => {
  try {
    const response = await axiosInstance.get(
      `${API_BASE_URL}/api/crypto/users/${userId}/contribution-rewards`
    );
    return response.data;
  } catch (error) {
    handleCryptoApiErrorAndNotify(
      error as AxiosError<unknown>,
      "Failed to fetch user contribution rewards",
      "FetchUserContributionRewardsErrorId"  as keyof CryptoNotificationMessages 
    );
    throw error;
  }
};

// Function to fetch market data related to cryptocurrencies
export const fetchMarketData = async (): Promise<any> => {
  try {
    const response = await axiosInstance.get(
      `${API_BASE_URL}/api/crypto/market-data`
    );
    return response.data;
  } catch (error) {
    handleCryptoApiErrorAndNotify(
      error as AxiosError<unknown>,
      "Failed to fetch market data",
      "FetchMarketDataErrorId"  as keyof CryptoNotificationMessages 
    );
    throw error;
  }
};

// Function to fetch portfolio summary
export const fetchPortfolioSummary = async (): Promise<any> => {
  try {
    const response = await axiosInstance.get(
      `${API_BASE_URL}/api/crypto/portfolio-summary`
    );
    return response.data;
  } catch (error) {
    handleCryptoApiErrorAndNotify(
      error as AxiosError<unknown>,
      "Failed to fetch portfolio summary",
      "FetchPortfolioSummaryErrorId"  as keyof CryptoNotificationMessages 
    );
    throw error;
  }
};

// Function to fetch top gaining cryptocurrencies
export const fetchTopGainers = async (): Promise<any> => {
  try {
    const response = await axiosInstance.get(
      `${API_BASE_URL}/api/crypto/top-gainers`
    );
    return response.data;
  } catch (error) {
    handleCryptoApiErrorAndNotify(
      error as AxiosError<unknown>,
      "Failed to fetch top gainers",
      "FetchTopGainersErrorId"  as keyof CryptoNotificationMessages 
    );
    throw error;
  }
};

// Function to fetch top losing cryptocurrencies
export const fetchTopLosers = async (): Promise<any> => {
  try {
    const response = await axiosInstance.get(
      `${API_BASE_URL}/api/crypto/top-losers`
    );
    return response.data;
  } catch (error) {
    handleCryptoApiErrorAndNotify(
      error as AxiosError<unknown>,
      "Failed to fetch top losers",
      "FetchTopLosersErrorId"  as keyof CryptoNotificationMessages 
    );
    throw error;
  }
};

// Function to fetch listings of cryptocurrency exchanges
export const fetchExchangeListings = async (): Promise<any> => {
  try {
    const response = await axiosInstance.get(
      `${API_BASE_URL}/api/crypto/exchange-listings`
    );
    return response.data;
  } catch (error) {
    handleCryptoApiErrorAndNotify(
      error as AxiosError<unknown>,
      "Failed to fetch exchange listings",
      "FetchExchangeListingsErrorId"  as keyof CryptoNotificationMessages 
    );
    throw error;
  }
};
// Define and implement other CRUD operations for crypto entities similarly
