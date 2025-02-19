import { NotificationTypeEnum, useNotification } from '@/app/components/support/NotificationContext';
import { AxiosError } from 'axios';
import { DocumentData } from '../components/documents/DocumentBuilder';
import { WritableDraft } from '../components/state/redux/ReducerGenerator';
import { endpoints } from './ApiEndpoints';
import { handleApiError } from './ApiLogs';
import axiosInstance from './axiosInstance';
import headersConfig from './headers/HeadersConfig';

// Define the API base URL for trading operations
const TRADING_API_BASE_URL = endpoints.trading;

// Define trading-specific notification messages
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
  FETCH_HISTORICAL_DATA_ERROR: string
  CONFIRM_TRADE_CREATION_ERROR: string
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

  // Define API notification messages for trading
  
// Function to handle API errors and notify for trading
const handleTradingApiErrorAndNotify = (
  error: AxiosError<unknown>,
  errorMessage: string,
  errorMessageId: TradingNotificationMessages
) => {
  handleApiError(error, errorMessage);
  if (errorMessageId) {
    useNotification().notify(
      errorMessageId,
      tradingNotificationMessages[errorMessageId] || errorMessage,
      null,
      new Date(),
      "TradingError" as NotificationTypeEnum
    );
  }
};

// Trading API functions
export const fetchTradingDataAPI = async (
  tradingId: number,
  dataCallback: (data: WritableDraft<DocumentData>) => void
): Promise<any> => {
  try {
    const fetchTradingEndpoint = `${TRADING_API_BASE_URL}/trading/${tradingId}`;
    const response = await axiosInstance.get(fetchTradingEndpoint, {
      headers: headersConfig,
    });

    // Call the provided data callback with the fetched trading data
    dataCallback(response.data);

    // Return the fetched trading data if needed
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

// Add more trading API functions as needed
// Example:

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




export const fetchMarketDataAPI = async (
    asset: string,
  ): Promise<any> => {
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
  
  export const fetchNewsAPI = async (
    category: string,
  ): Promise<any> => {
    try {
      const fetchNewsEndpoint = `${TRADING_API_BASE_URL}/news?category=${category}`;
      const response = await axiosInstance.get(fetchNewsEndpoint, {
        headers: headersConfig,
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching news:', error);
      const errorMessage = 'Failed to fetch news';
      handleTradingApiErrorAndNotify(
        error as AxiosError<unknown>,
        errorMessage,
        'FETCH_NEWS_ERROR'
      );
      throw error;
    }
  };
  
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

  export const confirmTradeCreation = async (tradeData: any) => {
    try {
      // Execute the trade
      const tradeResult = await executeTradeAPI(tradeData);
  
      // Fetch portfolio summary
      const portfolioSummary = await fetchPortfolioSummaryAPI();
  
      // Fetch asset details
      const assetDetails = await fetchAssetDetailsAPI(tradeData.assetId);
  
      // Fetch market news
      const marketNews = await fetchMarketNewsAPI();
  
      // Fetch economic calendar
      const economicCalendar = await fetchEconomicCalendarAPI();
  
      // Fetch trading signals
      const tradingSignals = await fetchTradingSignalsAPI();
  
      // Fetch top performing assets
      const topPerformingAssets = await fetchTopPerformingAssetsAPI();
  
      // Fetch asset price history
      const assetPriceHistory = await fetchAssetPriceHistoryAPI(tradeData.assetId);
  
      // Return the trade result and fetched data
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
      // Handle errors
      console.error('Error confirming trade creation:', error);
      throw error;
    }
  };

export const executeTradeAPI = async (
  tradeData: any,
): Promise<any> => {
  try {
    const executeTradeEndpoint = `${TRADING_API_BASE_URL}/execute-trade`;
    const response = await axiosInstance.post(executeTradeEndpoint, tradeData, {
      headers: headersConfig,
    });
    return response.data;
  } catch (error) {
    console.error('Error executing trade:', error);
    // Handle errors specific to confirmTradeCreationnc
    const errorMessage = 'Failed to confirm trade creation';
    handleTradingApiErrorAndNotify(
      error as AxiosError<unknown>,
      errorMessage,
      'CONFIRM_TRADE_CREATION_ERROR'
    );
    throw error;
  }
}
  
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
  
  export const fetchAssetDetailsAPI = async (
    assetId: string,
  ): Promise<any> => {
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
  
  export const fetchAssetPriceHistoryAPI = async (
    assetId: string,
  ): Promise<any> => {
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
  

// Add more trading API functions as needed
