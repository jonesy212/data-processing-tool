
// ApiTradingInfo.ts - News and information trading APIs
import { handleApiError } from '@/app/api/ApiLogs';
import axiosInstance from '@/app/api/csrfToken';
import { endpoints } from '@/app/api/endpointConfigurations';
import headersConfig from '@/app/api/headers/HeadersConfig';
import { NotificationType } from '@/app/features/support/UnifiedNotificationTypes';
import { useNotification } from '@/app/state/context/NotificationContext';

import { AxiosError } from 'axios';

// Define the API base URL for trading operations
const TRADING_API_BASE_URL = endpoints.trading;

// Define trading info notification messages
interface TradingInfoNotificationMessages {
  FETCH_NEWS_SUCCESS: string;
  FETCH_NEWS_ERROR: string;
  FETCH_MARKET_NEWS_SUCCESS: string;
  FETCH_MARKET_NEWS_ERROR: string;
  FETCH_ECONOMIC_CALENDAR_SUCCESS: string;
  FETCH_ECONOMIC_CALENDAR_ERROR: string;
  FETCH_TRADING_SIGNALS_SUCCESS: string;
  FETCH_TRADING_SIGNALS_ERROR: string;
  FETCH_MARKET_SENTIMENT_SUCCESS: string;
  FETCH_MARKET_SENTIMENT_ERROR: string;
  FETCH_TECHNICAL_ANALYSIS_SUCCESS: string;
  FETCH_TECHNICAL_ANALYSIS_ERROR: string;
  FETCH_TOP_GAINERS_SUCCESS: string;
  FETCH_TOP_GAINERS_ERROR: string;
  FETCH_TOP_LOSERS_SUCCESS: string;
  FETCH_TOP_LOSERS_ERROR: string;
  FETCH_TOP_PERFORMING_ASSETS_SUCCESS: string;
  FETCH_TOP_PERFORMING_ASSETS_ERROR: string;
  FETCH_EXCHANGE_RATES_SUCCESS: string;
  FETCH_EXCHANGE_RATES_ERROR: string;
  FETCH_ASSET_CORRELATION_SUCCESS: string;
  FETCH_ASSET_CORRELATION_ERROR: string;
  FETCH_MARKET_OVERVIEW_SUCCESS: string;
  FETCH_MARKET_OVERVIEW_ERROR: string;
  FETCH_CRYPTO_FEAR_GREED_SUCCESS: string;
  FETCH_CRYPTO_FEAR_GREED_ERROR: string;
  FETCH_TRADING_TIPS_SUCCESS: string;
  FETCH_TRADING_TIPS_ERROR: string;
  FETCH_EDUCATIONAL_CONTENT_SUCCESS: string;
  FETCH_EDUCATIONAL_CONTENT_ERROR: string;
}

// Define API notification messages for trading info
const tradingInfoNotificationMessages: TradingInfoNotificationMessages = {
  FETCH_NEWS_SUCCESS: 'News fetched successfully',
  FETCH_NEWS_ERROR: 'Failed to fetch news',
  FETCH_MARKET_NEWS_SUCCESS: 'Market news fetched successfully',
  FETCH_MARKET_NEWS_ERROR: 'Failed to fetch market news',
  FETCH_ECONOMIC_CALENDAR_SUCCESS: 'Economic calendar fetched successfully',
  FETCH_ECONOMIC_CALENDAR_ERROR: 'Failed to fetch economic calendar',
  FETCH_TRADING_SIGNALS_SUCCESS: 'Trading signals fetched successfully',
  FETCH_TRADING_SIGNALS_ERROR: 'Failed to fetch trading signals',
  FETCH_MARKET_SENTIMENT_SUCCESS: 'Market sentiment fetched successfully',
  FETCH_MARKET_SENTIMENT_ERROR: 'Failed to fetch market sentiment',
  FETCH_TECHNICAL_ANALYSIS_SUCCESS: 'Technical analysis fetched successfully',
  FETCH_TECHNICAL_ANALYSIS_ERROR: 'Failed to fetch technical analysis',
  FETCH_TOP_GAINERS_SUCCESS: 'Top gainers fetched successfully',
  FETCH_TOP_GAINERS_ERROR: 'Failed to fetch top gainers',
  FETCH_TOP_LOSERS_SUCCESS: 'Top losers fetched successfully',
  FETCH_TOP_LOSERS_ERROR: 'Failed to fetch top losers',
  FETCH_TOP_PERFORMING_ASSETS_SUCCESS: 'Top performing assets fetched successfully',
  FETCH_TOP_PERFORMING_ASSETS_ERROR: 'Failed to fetch top performing assets',
  FETCH_EXCHANGE_RATES_SUCCESS: 'Exchange rates fetched successfully',
  FETCH_EXCHANGE_RATES_ERROR: 'Failed to fetch exchange rates',
  FETCH_ASSET_CORRELATION_SUCCESS: 'Asset correlation fetched successfully',
  FETCH_ASSET_CORRELATION_ERROR: 'Failed to fetch asset correlation',
  FETCH_MARKET_OVERVIEW_SUCCESS: 'Market overview fetched successfully',
  FETCH_MARKET_OVERVIEW_ERROR: 'Failed to fetch market overview',
  FETCH_CRYPTO_FEAR_GREED_SUCCESS: 'Crypto fear & greed index fetched successfully',
  FETCH_CRYPTO_FEAR_GREED_ERROR: 'Failed to fetch crypto fear & greed index',
  FETCH_TRADING_TIPS_SUCCESS: 'Trading tips fetched successfully',
  FETCH_TRADING_TIPS_ERROR: 'Failed to fetch trading tips',
  FETCH_EDUCATIONAL_CONTENT_SUCCESS: 'Educational content fetched successfully',
  FETCH_EDUCATIONAL_CONTENT_ERROR: 'Failed to fetch educational content',
};
const handleTradingInfoApiErrorAndNotify = (
  error: AxiosError<unknown>,
  errorMessage: string,
  errorMessageId: keyof TradingInfoNotificationMessages,
  additionalData?: any
) => {
  const { notify } = useNotification();
  
  // Get the error message text from notification messages
  const errorMessageText = tradingInfoNotificationMessages[errorMessageId] || errorMessage;
  
  // Create more detailed error message based on HTTP status and trading context
  let userFriendlyMessage = errorMessageText;
  const axiosError = error as AxiosError;
  
  if (axiosError.response) {
    const status = axiosError.response.status;
    
    // Trading info-specific error messages
    switch (status) {
      case 400:
        userFriendlyMessage = "Invalid trading information request";
        break;
      case 401:
        userFriendlyMessage = "Authentication required for trading data";
        break;
      case 403:
        userFriendlyMessage = "Permission denied for trading information";
        break;
      case 404:
        userFriendlyMessage = "Trading information not found";
        break;
      case 429:
        userFriendlyMessage = "Too many trading data requests - rate limited";
        break;
      case 500:
        userFriendlyMessage = "Trading data server error";
        break;
      case 503:
        userFriendlyMessage = "Trading data service temporarily unavailable";
        break;
      default:
        if (status >= 500) {
          userFriendlyMessage = "Trading information server error";
        } else if (status >= 400) {
          userFriendlyMessage = "Trading data request failed";
        }
    }
  } else if (axiosError.request) {
    userFriendlyMessage = "Network error: Unable to fetch trading information";
  } else {
    userFriendlyMessage = "Trading data error: " + (axiosError.message || errorMessage);
  }
  
  // Log the error for debugging
  console.error("Trading Info API Error:", {
    messageId: errorMessageId,
    message: userFriendlyMessage,
    originalError: axiosError.message,
    statusCode: axiosError.response?.status,
    url: axiosError.config?.url,
    method: axiosError.config?.method,
    additionalData,
    timestamp: new Date().toISOString()
  });
  
  // Send notification using consistent object format
  notify({
    id: `trading_info_error_${String(errorMessageId)}_${Date.now()}`,
    message: userFriendlyMessage,
    data: {
      entityType: 'trading_info',
      entityId: additionalData?.symbol || additionalData?.instrumentId || 'unknown',
      action: additionalData?.action || errorMessageId.toString().toLowerCase().replace('_error', ''),
      errorCode: axiosError.response?.status,
      errorType: errorMessageId.toString(),
      originalError: axiosError.message,
      url: axiosError.config?.url,
      method: axiosError.config?.method,
      tradingContext: {
        symbol: additionalData?.symbol,
        instrumentType: additionalData?.instrumentType,
        market: additionalData?.market,
        timeframe: additionalData?.timeframe,
        dataType: additionalData?.dataType
      },
      extra: additionalData || {},
      timestamp: new Date().toISOString()
    },
    timestamp: new Date(),
    type: NotificationTypeEnum.OPERATION_ERROR,
    level: 'error' as const,
    metadata: {
      isTradingError: true,
      errorCategory: 'trading_info',
      severity: getTradingInfoErrorSeverity(axiosError.response?.status),
      dataFreshness: additionalData?.dataFreshness || 'unknown'
    }
  });
  
  // Call the original error handler
  handleApiError(error, userFriendlyMessage);
  
  // Optional: Log to trading analytics service
  logTradingInfoError({
    errorMessageId,
    error: axiosError,
    userMessage: userFriendlyMessage,
    additionalData,
    timestamp: new Date().toISOString()
  });
};

// Helper functions for trading info error handling
const getTradingInfoErrorSeverity = (statusCode?: number): string => {
  if (!statusCode) return 'medium';
  
  if (statusCode >= 500) return 'high';
  if (statusCode === 429) return 'high'; // Rate limiting is critical for trading data
  if (statusCode === 403) return 'high'; // Permission issues are critical
  if (statusCode === 401) return 'medium';
  if (statusCode === 404) return 'low'; // Not found is usually less critical for info
  return 'medium';
};

const logTradingInfoError = (errorInfo: any): void => {
  // Could send to trading analytics service
  console.log('[Trading Info Error Logged]:', {
    ...errorInfo,
    loggedAt: new Date().toISOString()
  });
  
  // Example: Send to external monitoring
  // tradingAnalyticsService.trackError(errorInfo);
  // sentry.captureException(errorInfo.error, { 
  //   extra: { tradingInfoContext: errorInfo.additionalData }
  // });
};

// News and Information API Functions

/**
 * Fetch general news by category
 */
export const fetchNewsAPI = async (category?: string): Promise<any> => {
  try {
    const params = category ? `?category=${category}` : '';
    const fetchNewsEndpoint = `${TRADING_API_BASE_URL}/news${params}`;
    const response = await axiosInstance.get(fetchNewsEndpoint, {
      headers: headersConfig,
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching news:', error);
    const errorMessage = 'Failed to fetch news';
    handleTradingInfoApiErrorAndNotify(
      error as AxiosError<unknown>,
      errorMessage,
      'FETCH_NEWS_ERROR'
    );
    throw error;
  }
};

/**
 * Fetch market-specific news
 */
export const fetchMarketNewsAPI = async (market?: string): Promise<any> => {
  try {
    const params = market ? `?market=${market}` : '';
    const fetchMarketNewsEndpoint = `${TRADING_API_BASE_URL}/market-news${params}`;
    const response = await axiosInstance.get(fetchMarketNewsEndpoint, {
      headers: headersConfig,
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching market news:', error);
    const errorMessage = 'Failed to fetch market news';
    handleTradingInfoApiErrorAndNotify(
      error as AxiosError<unknown>,
      errorMessage,
      'FETCH_MARKET_NEWS_ERROR'
    );
    throw error;
  }
};

/**
 * Fetch economic calendar events
 */
export const fetchEconomicCalendarAPI = async (
  startDate?: string,
  endDate?: string,
  country?: string
): Promise<any> => {
  try {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (country) params.append('country', country);
    
    const queryString = params.toString();
    const fetchEconomicCalendarEndpoint = `${TRADING_API_BASE_URL}/economic-calendar${queryString ? `?${queryString}` : ''}`;
    
    const response = await axiosInstance.get(fetchEconomicCalendarEndpoint, {
      headers: headersConfig,
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching economic calendar:', error);
    const errorMessage = 'Failed to fetch economic calendar';
    handleTradingInfoApiErrorAndNotify(
      error as AxiosError<unknown>,
      errorMessage,
      'FETCH_ECONOMIC_CALENDAR_ERROR'
    );
    throw error;
  }
};

/**
 * Fetch trading signals and analysis
 */
export const fetchTradingSignalsAPI = async (
  asset?: string,
  timeframe?: string
): Promise<any> => {
  try {
    const params = new URLSearchParams();
    if (asset) params.append('asset', asset);
    if (timeframe) params.append('timeframe', timeframe);
    
    const queryString = params.toString();
    const fetchTradingSignalsEndpoint = `${TRADING_API_BASE_URL}/trading-signals${queryString ? `?${queryString}` : ''}`;
    
    const response = await axiosInstance.get(fetchTradingSignalsEndpoint, {
      headers: headersConfig,
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching trading signals:', error);
    const errorMessage = 'Failed to fetch trading signals';
    handleTradingInfoApiErrorAndNotify(
      error as AxiosError<unknown>,
      errorMessage,
      'FETCH_TRADING_SIGNALS_ERROR'
    );
    throw error;
  }
};

/**
 * Fetch market sentiment data
 */
export const fetchMarketSentimentAPI = async (asset?: string): Promise<any> => {
  try {
    const params = asset ? `?asset=${asset}` : '';
    const fetchMarketSentimentEndpoint = `${TRADING_API_BASE_URL}/market-sentiment${params}`;
    const response = await axiosInstance.get(fetchMarketSentimentEndpoint, {
      headers: headersConfig,
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching market sentiment data:', error);
    const errorMessage = 'Failed to fetch market sentiment data';
    handleTradingInfoApiErrorAndNotify(
      error as AxiosError<unknown>,
      errorMessage,
      'FETCH_MARKET_SENTIMENT_ERROR'
    );
    throw error;
  }
};

/**
 * Fetch technical analysis data
 */
export const fetchTechnicalAnalysisAPI = async (
  asset: string,
  indicators?: string[]
): Promise<any> => {
  try {
    const params = new URLSearchParams();
    params.append('asset', asset);
    if (indicators && indicators.length > 0) {
      indicators.forEach(indicator => params.append('indicators', indicator));
    }
    
    const fetchTechnicalAnalysisEndpoint = `${TRADING_API_BASE_URL}/technical-analysis?${params.toString()}`;
    const response = await axiosInstance.get(fetchTechnicalAnalysisEndpoint, {
      headers: headersConfig,
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching technical analysis data:', error);
    const errorMessage = 'Failed to fetch technical analysis data';
    handleTradingInfoApiErrorAndNotify(
      error as AxiosError<unknown>,
      errorMessage,
      'FETCH_TECHNICAL_ANALYSIS_ERROR'
    );
    throw error;
  }
};

/**
 * Fetch top gainers
 */
export const fetchTopGainersAPI = async (timeframe: string = '24h'): Promise<any> => {
  try {
    const fetchTopGainersEndpoint = `${TRADING_API_BASE_URL}/top-gainers?timeframe=${timeframe}`;
    const response = await axiosInstance.get(fetchTopGainersEndpoint, {
      headers: headersConfig,
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching top gainers:', error);
    const errorMessage = 'Failed to fetch top gainers';
    handleTradingInfoApiErrorAndNotify(
      error as AxiosError<unknown>,
      errorMessage,
      'FETCH_TOP_GAINERS_ERROR'
    );
    throw error;
  }
};

/**
 * Fetch top losers
 */
export const fetchTopLosersAPI = async (timeframe: string = '24h'): Promise<any> => {
  try {
    const fetchTopLosersEndpoint = `${TRADING_API_BASE_URL}/top-losers?timeframe=${timeframe}`;
    const response = await axiosInstance.get(fetchTopLosersEndpoint, {
      headers: headersConfig,
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching top losers:', error);
    const errorMessage = 'Failed to fetch top losers';
    handleTradingInfoApiErrorAndNotify(
      error as AxiosError<unknown>,
      errorMessage,
      'FETCH_TOP_LOSERS_ERROR'
    );
    throw error;
  }
};

/**
 * Fetch top performing assets
 */
export const fetchTopPerformingAssetsAPI = async (
  timeframe: string = '24h',
  limit: number = 10
): Promise<any> => {
  try {
    const fetchTopPerformingAssetsEndpoint = `${TRADING_API_BASE_URL}/top-performing-assets?timeframe=${timeframe}&limit=${limit}`;
    const response = await axiosInstance.get(fetchTopPerformingAssetsEndpoint, {
      headers: headersConfig,
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching top performing assets:', error);
    const errorMessage = 'Failed to fetch top performing assets';
    handleTradingInfoApiErrorAndNotify(
      error as AxiosError<unknown>,
      errorMessage,
      'FETCH_TOP_PERFORMING_ASSETS_ERROR'
    );
    throw error;
  }
};

/**
 * Fetch exchange rates
 */
export const fetchExchangeRatesAPI = async (baseCurrency: string = 'USD'): Promise<any> => {
  try {
    const fetchExchangeRatesEndpoint = `${TRADING_API_BASE_URL}/exchange-rates?base=${baseCurrency}`;
    const response = await axiosInstance.get(fetchExchangeRatesEndpoint, {
      headers: headersConfig,
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    const errorMessage = 'Failed to fetch exchange rates';
    handleTradingInfoApiErrorAndNotify(
      error as AxiosError<unknown>,
      errorMessage,
      'FETCH_EXCHANGE_RATES_ERROR'
    );
    throw error;
  }
};

/**
 * Fetch asset correlation matrix
 */
export const fetchAssetCorrelationAPI = async (
  assets: string[],
  timeframe: string = '30d'
): Promise<any> => {
  try {
    const assetsParam = assets.join(',');
    const fetchAssetCorrelationEndpoint = `${TRADING_API_BASE_URL}/asset-correlation?assets=${assetsParam}&timeframe=${timeframe}`;
    const response = await axiosInstance.get(fetchAssetCorrelationEndpoint, {
      headers: headersConfig,
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching asset correlation:', error);
    const errorMessage = 'Failed to fetch asset correlation';
    handleTradingInfoApiErrorAndNotify(
      error as AxiosError<unknown>,
      errorMessage,
      'FETCH_ASSET_CORRELATION_ERROR'
    );
    throw error;
  }
};

/**
 * Fetch comprehensive market overview
 */
export const fetchMarketOverviewAPI = async (): Promise<any> => {
  try {
    const fetchMarketOverviewEndpoint = `${TRADING_API_BASE_URL}/market-overview`;
    const response = await axiosInstance.get(fetchMarketOverviewEndpoint, {
      headers: headersConfig,
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching market overview:', error);
    const errorMessage = 'Failed to fetch market overview';
    handleTradingInfoApiErrorAndNotify(
      error as AxiosError<unknown>,
      errorMessage,
      'FETCH_MARKET_OVERVIEW_ERROR'
    );
    throw error;
  }
};

/**
 * Fetch crypto fear and greed index
 */
export const fetchCryptoFearGreedAPI = async (): Promise<any> => {
  try {
    const fetchCryptoFearGreedEndpoint = `${TRADING_API_BASE_URL}/crypto-fear-greed`;
    const response = await axiosInstance.get(fetchCryptoFearGreedEndpoint, {
      headers: headersConfig,
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching crypto fear & greed index:', error);
    const errorMessage = 'Failed to fetch crypto fear & greed index';
    handleTradingInfoApiErrorAndNotify(
      error as AxiosError<unknown>,
      errorMessage,
      'FETCH_CRYPTO_FEAR_GREED_ERROR'
    );
    throw error;
  }
};

/**
 * Fetch trading tips and strategies
 */
export const fetchTradingTipsAPI = async (category?: string): Promise<any> => {
  try {
    const params = category ? `?category=${category}` : '';
    const fetchTradingTipsEndpoint = `${TRADING_API_BASE_URL}/trading-tips${params}`;
    const response = await axiosInstance.get(fetchTradingTipsEndpoint, {
      headers: headersConfig,
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching trading tips:', error);
    const errorMessage = 'Failed to fetch trading tips';
    handleTradingInfoApiErrorAndNotify(
      error as AxiosError<unknown>,
      errorMessage,
      'FETCH_TRADING_TIPS_ERROR'
    );
    throw error;
  }
};

/**
 * Fetch educational content for traders
 */
export const fetchEducationalContentAPI = async (
  topic?: string,
  level?: 'beginner' | 'intermediate' | 'advanced'
): Promise<any> => {
  try {
    const params = new URLSearchParams();
    if (topic) params.append('topic', topic);
    if (level) params.append('level', level);
    
    const queryString = params.toString();
    const fetchEducationalContentEndpoint = `${TRADING_API_BASE_URL}/educational-content${queryString ? `?${queryString}` : ''}`;
    
    const response = await axiosInstance.get(fetchEducationalContentEndpoint, {
      headers: headersConfig,
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching educational content:', error);
    const errorMessage = 'Failed to fetch educational content';
    handleTradingInfoApiErrorAndNotify(
      error as AxiosError<unknown>,
      errorMessage,
      'FETCH_EDUCATIONAL_CONTENT_ERROR'
    );
    throw error;
  }
};

/**
 * Fetch trending trading topics
 */
export const fetchTrendingTopicsAPI = async (): Promise<any> => {
  try {
    const fetchTrendingTopicsEndpoint = `${TRADING_API_BASE_URL}/trending-topics`;
    const response = await axiosInstance.get(fetchTrendingTopicsEndpoint, {
      headers: headersConfig,
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching trending topics:', error);
    const errorMessage = 'Failed to fetch trending topics';
    handleTradingInfoApiErrorAndNotify(
      error as AxiosError<unknown>,
      errorMessage,
      'FETCH_NEWS_ERROR' // Reuse existing error type
    );
    throw error;
  }
};

/**
 * Fetch market volatility index
 */
export const fetchVolatilityIndexAPI = async (asset?: string): Promise<any> => {
  try {
    const params = asset ? `?asset=${asset}` : '';
    const fetchVolatilityIndexEndpoint = `${TRADING_API_BASE_URL}/volatility-index${params}`;
    const response = await axiosInstance.get(fetchVolatilityIndexEndpoint, {
      headers: headersConfig,
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching volatility index:', error);
    const errorMessage = 'Failed to fetch volatility index';
    handleTradingInfoApiErrorAndNotify(
      error as AxiosError<unknown>,
      errorMessage,
      'FETCH_MARKET_SENTIMENT_ERROR' // Reuse existing error type
    );
    throw error;
  }
};

export {
    handleTradingInfoApiErrorAndNotify, tradingInfoNotificationMessages
};
