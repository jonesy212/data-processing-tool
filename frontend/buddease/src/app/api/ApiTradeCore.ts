// ApiTradeCore.ts
// ApiTradeCore.ts
import { handleApiError } from '@/app/api/ApiLogs';
import axiosInstance from '@/app/api/csrfToken';
import { endpoints } from '@/app/api/endpointConfigurations';
import { headersConfig } from '@/app/components/shared/SharedHeaders'
import { BaseDataEntity, DefaultMeta } from '@/app/config/BaseConfig';
import { DocumentData } from '@/app/documents/editing/DocumentBuilder';
import { useNotification } from '@/app/state/context/NotificationContext';
import { NotificationTypeEnum } from '@/app/features/support/UnifiedNotificationTypes';
import { WritableDraft } from '@/app/state/redux/ReducerGenerator';
import { AxiosError } from 'axios';

import { Attachment } from '@/app/documents/attachment/Attachment';

// Define the API base URL for trading operations
const TRADING_API_BASE_URL = endpoints.trading;

// Define trading-specific notification messages
interface TradingNotificationMessages {
    FETCH_TRADING_SUCCESS: string;
    FETCH_TRADING_ERROR: string;
    UPDATE_TRADING_ERROR: string;
    FETCH_MARKET_NEWS_SUCCESS: string;
    FETCH_MARKET_NEWS_ERROR: string;
    FETCH_ECONOMIC_CALENDAR_SUCCESS: string;
    FETCH_ECONOMIC_CALENDAR_ERROR: string;
    FETCH_TRADING_SIGNALS_SUCCESS: string;
    FETCH_TRADING_SIGNALS_ERROR: string;
    FETCH_TOP_PERFORMING_ASSETS_SUCCESS: string;
    FETCH_TOP_PERFORMING_ASSETS_ERROR: string;
    FETCH_ASSET_PRICE_HISTORY_SUCCESS: string;
    FETCH_ASSET_PRICE_HISTORY_ERROR: string;
    FETCH_ASSET_DETAILS_ERROR: string;
    FETCH_ASSET_PERFORMANCE_ERROR: string;
    FETCH_MARKET_SENTIMENT_ERROR: string;
    FETCH_ASSET_CORRELATION_ERROR: string;
    FETCH_TRADING_ORDERS_ERROR: string;
    FETCH_TOP_GAINERS_ERROR: string;
    FETCH_TOP_LOSERS_ERROR: string;
    FETCH_EXCHANGE_RATES_ERROR: string;
    FETCH_ORDER_BOOK_ERROR: string;
    FETCH_TRADE_HISTORY_ERROR: string;
    EXECUTE_TRADE_ERROR: string;
    FETCH_PORTFOLIO_SUMMARY_ERROR: string;
    FETCH_MARKET_DATA_ERROR: string;
    FETCH_TECHNICAL_ANALYSIS_ERROR: string;
    FETCH_NEWS_ERROR: string;
    FETCH_HISTORICAL_DATA_ERROR: string;
    CONFIRM_TRADE_CREATION_ERROR: string;
}

// Define API notification messages for trading
const tradingNotificationMessages: TradingNotificationMessages = {
    FETCH_TRADING_SUCCESS: 'Trading data fetched successfully',
    FETCH_TRADING_ERROR: 'Failed to fetch trading data',
    UPDATE_TRADING_ERROR: 'Failed to update trading data',
    FETCH_MARKET_NEWS_SUCCESS: 'Market news fetched successfully',
    FETCH_MARKET_NEWS_ERROR: 'Failed to fetch market news',
    FETCH_ECONOMIC_CALENDAR_SUCCESS: 'Economic calendar fetched successfully',
    FETCH_ECONOMIC_CALENDAR_ERROR: 'Failed to fetch economic calendar',
    FETCH_TRADING_SIGNALS_SUCCESS: 'Trading signals fetched successfully',
    FETCH_TRADING_SIGNALS_ERROR: 'Failed to fetch trading signals',
    FETCH_TOP_PERFORMING_ASSETS_SUCCESS: 'Top performing assets fetched successfully',
    FETCH_TOP_PERFORMING_ASSETS_ERROR: 'Failed to fetch top performing assets',
    FETCH_ASSET_PRICE_HISTORY_SUCCESS: 'Asset price history fetched successfully',
    FETCH_ASSET_PRICE_HISTORY_ERROR: 'Failed to fetch asset price history',
    FETCH_ASSET_DETAILS_ERROR: 'Failed to fetch asset details',
    FETCH_ASSET_PERFORMANCE_ERROR: 'Failed to fetch asset performance',
    FETCH_MARKET_SENTIMENT_ERROR: 'Failed to fetch market sentiment',
    FETCH_ASSET_CORRELATION_ERROR: 'Failed to fetch asset correlation',
    FETCH_TRADING_ORDERS_ERROR: 'Failed to fetch trading orders',
    FETCH_TOP_GAINERS_ERROR: 'Failed to fetch top gainers',
    FETCH_TOP_LOSERS_ERROR: 'Failed to fetch top losers',
    FETCH_EXCHANGE_RATES_ERROR: 'Failed to fetch exchange rates',
    FETCH_ORDER_BOOK_ERROR: 'Failed to fetch order book',
    FETCH_TRADE_HISTORY_ERROR: 'Failed to fetch trade history',
    EXECUTE_TRADE_ERROR: 'Failed to execute trade',
    FETCH_PORTFOLIO_SUMMARY_ERROR: 'Failed to fetch portfolio summary',
    FETCH_MARKET_DATA_ERROR: 'Failed to fetch market data',
    FETCH_TECHNICAL_ANALYSIS_ERROR: 'Failed to fetch technical analysis data',
    FETCH_NEWS_ERROR: 'Failed to fetch news',
    FETCH_HISTORICAL_DATA_ERROR: 'Failed to fetch historical data',
    CONFIRM_TRADE_CREATION_ERROR: 'Failed to create trade',
};

// Function to handle API errors and notify for trading
const handleTradingApiErrorAndNotify = (
  error: AxiosError<unknown>,
  errorMessage: string,
  errorMessageId: keyof TradingNotificationMessages,
  additionalData?: any
) => {
  const { notify } = useNotification();
  
  // Get the error message text from the notification messages
  const errorMessageText = tradingNotificationMessages[errorMessageId] || errorMessage;
  
  // Create more detailed error message based on HTTP status and trading context
  let userFriendlyMessage = errorMessageText;
  const axiosError = error as AxiosError;
  
  if (axiosError.response) {
    const status = axiosError.response.status;
    
    // Trading-specific error messages
    switch (status) {
      case 400:
        userFriendlyMessage = "Invalid trading request data";
        break;
      case 401:
        userFriendlyMessage = "Authentication required for trading operations";
        break;
      case 403:
        userFriendlyMessage = "Trading permission denied";
        break;
      case 404:
        userFriendlyMessage = "Trading resource not found";
        break;
      case 409:
        userFriendlyMessage = "Trading conflict - resource already exists";
        break;
      case 422:
        userFriendlyMessage = "Trading validation failed";
        break;
      case 429:
        userFriendlyMessage = "Trading rate limit exceeded";
        break;
      case 500:
        userFriendlyMessage = "Trading server error";
        break;
      case 503:
        userFriendlyMessage = "Trading service unavailable";
        break;
      default:
        if (status >= 500) {
          userFriendlyMessage = "Trading server error occurred";
        } else if (status >= 400) {
          userFriendlyMessage = "Trading request failed";
        }
    }
  } else if (axiosError.request) {
    userFriendlyMessage = "Network error: Unable to connect to trading service";
  } else {
    userFriendlyMessage = "Trading operation failed: " + (axiosError.message || errorMessage);
  }
  
  // Log the error for debugging (consider logging to monitoring service)
  console.error("Trading API Error:", {
    messageId: errorMessageId,
    message: userFriendlyMessage,
    originalError: axiosError.message,
    statusCode: axiosError.response?.status,
    url: axiosError.config?.url,
    method: axiosError.config?.method,
    additionalData,
    timestamp: new Date().toISOString()
  });
  
  // Optional: Log to trading-specific monitoring service
  logTradingError({
    errorMessageId,
    error: axiosError,
    userMessage: userFriendlyMessage,
    additionalData
  });
  
  // Show notification using consistent object format
  notify({
    id: `trading_error_${String(errorMessageId)}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    message: userFriendlyMessage,
    data: {
      entityType: 'trading',
      entityId: additionalData?.tradingId || additionalData?.orderId || additionalData?.tradeId || 'unknown',
      action: additionalData?.action || errorMessageId.toString().toLowerCase().replace('_error', ''),
      statusCode: axiosError.response?.status,
      errorType: errorMessageId.toString(),
      originalError: axiosError.message,
      url: axiosError.config?.url,
      method: axiosError.config?.method,
      tradingContext: getTradingContext(additionalData),
      extra: additionalData || {},
      timestamp: new Date().toISOString()
    },
    timestamp: new Date(),
    type: NotificationTypeEnum.OPERATION_ERROR,
    level: 'error' as const,
    // Optional: Add trading-specific metadata
    metadata: {
      isTradingError: true,
      severity: getTradingErrorSeverity(axiosError.response?.status),
      requiresAttention: shouldTradingErrorRequireAttention(axiosError.response?.status, errorMessageId)
    }
  });
  
  // Call the original error handler
  handleApiError(error, userFriendlyMessage);
};

// Helper functions for trading error handling
const getTradingContext = (additionalData: any): any => {
  return {
    instrument: additionalData?.instrument,
    orderType: additionalData?.orderType,
    side: additionalData?.side,
    quantity: additionalData?.quantity,
    price: additionalData?.price,
    accountId: additionalData?.accountId,
    portfolioId: additionalData?.portfolioId,
    ...additionalData?.tradingContext
  };
};

const getTradingErrorSeverity = (statusCode?: number): string => {
  if (!statusCode) return 'medium';
  
  if (statusCode >= 500) return 'high';
  if (statusCode === 429) return 'high'; // Rate limiting is critical for trading
  if (statusCode === 403) return 'high'; // Permission issues are critical
  if (statusCode === 401) return 'medium';
  if (statusCode === 400) return 'medium';
  return 'low';
};

const shouldTradingErrorRequireAttention = (statusCode?: number, errorMessageId?: any): boolean => {
  const criticalStatuses = [429, 403, 500, 503];
  const criticalErrorTypes = ['INSUFFICIENT_FUNDS', 'MARKET_CLOSED', 'ORDER_REJECTED'];
  
  if (statusCode && criticalStatuses.includes(statusCode)) return true;
  if (errorMessageId && criticalErrorTypes.includes(errorMessageId.toString())) return true;
  
  return false;
};

const logTradingError = (errorInfo: any): void => {
  // Could send to trading-specific monitoring service
  console.log('[Trading Error Logged]:', {
    ...errorInfo,
    loggedAt: new Date().toISOString()
  });
  
  // Example: Send to external monitoring
  // tradingMonitorService.trackError(errorInfo);
  // sentry.captureException(errorInfo.error, { 
  //   extra: { tradingContext: errorInfo.additionalData }
  // });
};

// Core Trading API Functions
export const fetchTradingDataAPI = async <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = never,
  IncludedFields extends keyof T = keyof T
>(
  tradingId: number,
  dataCallback: (data: WritableDraft<DocumentData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>) => void
): Promise<any> => {
  try {
    const fetchTradingEndpoint = `${TRADING_API_BASE_URL}/trading/${tradingId}`;
    const response = await axiosInstance.get(fetchTradingEndpoint, {
      headers: headersConfig,
    });

    dataCallback(response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching trading data:', error);
    const errorMessage = 'Failed to fetch trading data';
    handleTradingApiErrorAndNotify(
      error as AxiosError<unknown>,
      errorMessage,
      'FETCH_TRADING_ERROR'
    );
    throw error;
  }
};

export const updateTradingDataAPI = async (
  tradingId: number,
  updatedData: any
): Promise<any> => {
  try {
    const updateTradingEndpoint = `${TRADING_API_BASE_URL}/trading/${tradingId}`;
    const response = await axiosInstance.put(updateTradingEndpoint, updatedData, {
      headers: headersConfig,
    });
    return response.data;
  } catch (error) {
    console.error('Error updating trading data:', error);
    const errorMessage = 'Failed to update trading data';
    handleTradingApiErrorAndNotify(
      error as AxiosError<unknown>,
      errorMessage,
      'UPDATE_TRADING_ERROR'
    );
    throw error;
  }
};

export const executeTradeAPI = async (tradeData: any): Promise<any> => {
  try {
    const executeTradeEndpoint = `${TRADING_API_BASE_URL}/execute-trade`;
    const response = await axiosInstance.post(executeTradeEndpoint, tradeData, {
      headers: headersConfig,
    });
    return response.data;
  } catch (error) {
    console.error('Error executing trade:', error);
    const errorMessage = 'Failed to confirm trade creation';
    handleTradingApiErrorAndNotify(
      error as AxiosError<unknown>,
      errorMessage,
      'CONFIRM_TRADE_CREATION_ERROR'
    );
    throw error;
  }
};

export const confirmTradeCreation = async (tradeData: any) => {
  try {
    const tradeResult = await executeTradeAPI(tradeData);
    const portfolioSummary = await fetchPortfolioSummaryAPI();
    const assetDetails = await fetchAssetDetailsAPI(tradeData.assetId);
    const marketNews = await fetchMarketNewsAPI();
    const economicCalendar = await fetchEconomicCalendarAPI();
    const tradingSignals = await fetchTradingSignalsAPI();
    const topPerformingAssets = await fetchTopPerformingAssetsAPI();
    const assetPriceHistory = await fetchAssetPriceHistoryAPI(tradeData.assetId);

    return {
      tradeResult,
      portfolioSummary,
      assetDetails,
      marketNews,
      economicCalendar,
      tradingSignals,
      topPerformingAssets,
      assetPriceHistory,
    };
  } catch (error) {
    console.error('Error confirming trade creation:', error);
    throw error;
  }
};

// Market Data Functions
export const fetchMarketDataAPI = async (asset: string): Promise<any> => {
  try {
    const fetchMarketDataEndpoint = `${TRADING_API_BASE_URL}/market-data?asset=${asset}`;
    const response = await axiosInstance.get(fetchMarketDataEndpoint, {
      headers: headersConfig,
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching market data:', error);
    const errorMessage = 'Failed to fetch market data';
    handleTradingApiErrorAndNotify(
      error as AxiosError<unknown>,
      errorMessage,
      'FETCH_MARKET_DATA_ERROR'
    );
    throw error;
  }
};

export const fetchHistoricalDataAPI = async (
  asset: string,
  timeframe: string,
): Promise<any> => {
  try {
    const fetchHistoricalDataEndpoint = `${TRADING_API_BASE_URL}/historical-data?asset=${asset}&timeframe=${timeframe}`;
    const response = await axiosInstance.get(fetchHistoricalDataEndpoint, {
      headers: headersConfig,
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching historical data:', error);
    const errorMessage = 'Failed to fetch historical data';
    handleTradingApiErrorAndNotify(
      error as AxiosError<unknown>,
      errorMessage,
      'FETCH_HISTORICAL_DATA_ERROR'
    );
    throw error;
  }
};

// Portfolio Functions
export const fetchPortfolioSummaryAPI = async (): Promise<any> => {
  try {
    const fetchPortfolioSummaryEndpoint = `${TRADING_API_BASE_URL}/portfolio-summary`;
    const response = await axiosInstance.get(fetchPortfolioSummaryEndpoint, {
      headers: headersConfig,
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching portfolio summary:', error);
    const errorMessage = 'Failed to fetch portfolio summary';
    handleTradingApiErrorAndNotify(
      error as AxiosError<unknown>,
      errorMessage,
      'FETCH_PORTFOLIO_SUMMARY_ERROR'
    );
    throw error;
  }
};

// Asset Functions
export const fetchAssetDetailsAPI = async (assetId: string): Promise<any> => {
  try {
    const fetchAssetDetailsEndpoint = `${TRADING_API_BASE_URL}/asset-details/${assetId}`;
    const response = await axiosInstance.get(fetchAssetDetailsEndpoint, {
      headers: headersConfig,
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching asset details:', error);
    const errorMessage = 'Failed to fetch asset details';
    handleTradingApiErrorAndNotify(
      error as AxiosError<unknown>,
      errorMessage,
      'FETCH_ASSET_DETAILS_ERROR'
    );
    throw error;
  }
};

export const fetchAssetPriceHistoryAPI = async (assetId: string): Promise<any> => {
  try {
    const fetchAssetPriceHistoryEndpoint = `${TRADING_API_BASE_URL}/asset-price-history/${assetId}`;
    const response = await axiosInstance.get(fetchAssetPriceHistoryEndpoint, {
      headers: headersConfig,
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching asset price history:', error);
    const errorMessage = 'Failed to fetch asset price history';
    handleTradingApiErrorAndNotify(
      error as AxiosError<unknown>,
      errorMessage,
      'FETCH_ASSET_PRICE_HISTORY_ERROR'
    );
    throw error;
  }
};

// Market Info Functions
export const fetchMarketNewsAPI = async (): Promise<any> => {
  try {
    const fetchMarketNewsEndpoint = `${TRADING_API_BASE_URL}/market-news`;
    const response = await axiosInstance.get(fetchMarketNewsEndpoint, {
      headers: headersConfig,
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching market news:', error);
    const errorMessage = 'Failed to fetch market news';
    handleTradingApiErrorAndNotify(
      error as AxiosError<unknown>,
      errorMessage,
      'FETCH_MARKET_NEWS_ERROR'
    );
    throw error;
  }
};

export const fetchEconomicCalendarAPI = async (): Promise<any> => {
  try {
    const fetchEconomicCalendarEndpoint = `${TRADING_API_BASE_URL}/economic-calendar`;
    const response = await axiosInstance.get(fetchEconomicCalendarEndpoint, {
      headers: headersConfig,
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching economic calendar:', error);
    const errorMessage = 'Failed to fetch economic calendar';
    handleTradingApiErrorAndNotify(
      error as AxiosError<unknown>,
      errorMessage,
      'FETCH_ECONOMIC_CALENDAR_ERROR'
    );
    throw error;
  }
};

export const fetchTradingSignalsAPI = async (): Promise<any> => {
  try {
    const fetchTradingSignalsEndpoint = `${TRADING_API_BASE_URL}/trading-signals`;
    const response = await axiosInstance.get(fetchTradingSignalsEndpoint, {
      headers: headersConfig,
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching trading signals:', error);
    const errorMessage = 'Failed to fetch trading signals';
    handleTradingApiErrorAndNotify(
      error as AxiosError<unknown>,
      errorMessage,
      'FETCH_TRADING_SIGNALS_ERROR'
    );
    throw error;
  }
};

export const fetchTopPerformingAssetsAPI = async (): Promise<any> => {
  try {
    const fetchTopPerformingAssetsEndpoint = `${TRADING_API_BASE_URL}/top-performing-assets`;
    const response = await axiosInstance.get(fetchTopPerformingAssetsEndpoint, {
      headers: headersConfig,
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching top performing assets:', error);
    const errorMessage = 'Failed to fetch top performing assets';
    handleTradingApiErrorAndNotify(
      error as AxiosError<unknown>,
      errorMessage,
      'FETCH_TOP_PERFORMING_ASSETS_ERROR'
    );
    throw error;
  }
};

// Additional trading functions (keep the rest of your functions here)

  export const fetchTechnicalAnalysisAPI = async (
    asset: string,
  ): Promise<any> => {
    try {
      const fetchTechnicalAnalysisEndpoint = `${TRADING_API_BASE_URL}/technical-analysis?asset=${asset}`;
      const response = await axiosInstance.get(fetchTechnicalAnalysisEndpoint, {
        headers: headersConfig,
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching technical analysis data:', error);
      const errorMessage = 'Failed to fetch technical analysis data';
      handleTradingApiErrorAndNotify(
        error as AxiosError<unknown>,
        errorMessage,
        'FETCH_TECHNICAL_ANALYSIS_ERROR'
      );
      throw error;
    }
  };
  
  

  export const fetchMarketSentimentAPI = async (
    asset: string,
  ): Promise<any> => {
    try {
      const fetchMarketSentimentEndpoint = `${TRADING_API_BASE_URL}/market-sentiment?asset=${asset}`;
      const response = await axiosInstance.get(fetchMarketSentimentEndpoint, {
        headers: headersConfig,
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching market sentiment data:', error);
      const errorMessage = 'Failed to fetch market sentiment data';
      handleTradingApiErrorAndNotify(
        error as AxiosError<unknown>,
        errorMessage,
        'FETCH_MARKET_SENTIMENT_ERROR'
      );
      throw error;
    }
  };


  
  export const fetchTopGainersAPI = async (): Promise<any> => {
    try {
      const fetchTopGainersEndpoint = `${TRADING_API_BASE_URL}/top-gainers`;
      const response = await axiosInstance.get(fetchTopGainersEndpoint, {
        headers: headersConfig,
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching top gainers:', error);
      const errorMessage = 'Failed to fetch top gainers';
      handleTradingApiErrorAndNotify(
        error as AxiosError<unknown>,
        errorMessage,
        'FETCH_TOP_GAINERS_ERROR'
      );
      throw error;
    }
  };
  

  export const fetchTopLosersAPI = async (): Promise<any> => {
    try {
      const fetchTopLosersEndpoint = `${TRADING_API_BASE_URL}/top-losers`;
      const response = await axiosInstance.get(fetchTopLosersEndpoint, {
        headers: headersConfig,
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching top losers:', error);
      const errorMessage = 'Failed to fetch top losers';
      handleTradingApiErrorAndNotify(
        error as AxiosError<unknown>,
        errorMessage,
        'FETCH_TOP_LOSERS_ERROR'
      );
      throw error;
    }
  };
  
  

  export const fetchExchangeRatesAPI = async (): Promise<any> => {
    try {
      const fetchExchangeRatesEndpoint = `${TRADING_API_BASE_URL}/exchange-rates`;
      const response = await axiosInstance.get(fetchExchangeRatesEndpoint, {
        headers: headersConfig,
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching exchange rates:', error);
      const errorMessage = 'Failed to fetch exchange rates';
      handleTradingApiErrorAndNotify(
        error as AxiosError<unknown>,
        errorMessage,
        'FETCH_EXCHANGE_RATES_ERROR'
      );
      throw error;
    }
  };
  
  
  

  export const fetchOrderBookAPI = async (
    assetPair: string,
  ): Promise<any> => {
    try {
      const fetchOrderBookEndpoint = `${TRADING_API_BASE_URL}/order-book?assetPair=${assetPair}`;
      const response = await axiosInstance.get(fetchOrderBookEndpoint, {
        headers: headersConfig,
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching order book:', error);
      const errorMessage = 'Failed to fetch order book';
      handleTradingApiErrorAndNotify(
        error as AxiosError<unknown>,
        errorMessage,
        'FETCH_ORDER_BOOK_ERROR'
      );
      throw error;
    }
  };
  
  
  
  export const fetchTradeHistoryAPI = async (
    assetPair: string,
  ): Promise<any> => {
    try {
      const fetchTradeHistoryEndpoint = `${TRADING_API_BASE_URL}/trade-history?assetPair=${assetPair}`;
      const response = await axiosInstance.get(fetchTradeHistoryEndpoint, {
        headers: headersConfig,
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching trade history:', error);
      const errorMessage = 'Failed to fetch trade history';
      handleTradingApiErrorAndNotify(
        error as AxiosError<unknown>,
        errorMessage,
        'FETCH_TRADE_HISTORY_ERROR'
      );
      throw error;
    }
  };