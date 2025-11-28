// ApiTrade.ts
// ApiTrade.ts - MobX Observable Trade API
import { AxiosResponse } from "axios";
import { observable } from "mobx";
import internalApiService from '@/app/api/ApiClient'; // Use the service
import { endpoints } from "@/app/api/endpointConfigurations";
import { TradeLogger } from '@/app/logging/TradeLogger'

const TRADING_API_BASE_URL = endpoints.trading;

export const tradeApi = observable({
  /**
   * Get recent trades using the internal API service
   */
  getRecentTrades: async (): Promise<any> => {
    try {
      TradeLogger.logWithOptions("Trade API", "Fetching recent trades", "system");
      
      const response = await internalApiService.get(
        `${TRADING_API_BASE_URL}/trades/recent`,
        undefined, // config
        "FETCH_TRADING_SUCCESS", // success message ID
        "FETCH_TRADING_ERROR" // error message ID
      );
      
      return response.data;
    } catch (error) {
      TradeLogger.logTradeError(
        { userId: "system", asset: "multiple", amount: 0, action: "fetch" },
        error as Error,
        "fetch recent trades"
      );
      throw error;
    }
  },

  /**
   * Execute a trade using the internal API service
   */
  executeTrade: async (tradeData: any): Promise<any> => {
    try {
      TradeLogger.logTradeInitiation({
        userId: tradeData.userId,
        asset: tradeData.asset,
        amount: tradeData.amount,
        action: tradeData.action,
        price: tradeData.price
      });

      const response = await internalApiService.post(
        `${TRADING_API_BASE_URL}/execute-trade`,
        tradeData,
        undefined, // config
        "EXECUTE_TRADE_SUCCESS", // success message ID  
        "EXECUTE_TRADE_ERROR" // error message ID
      );

      TradeLogger.logTradeExecution(
        {
          userId: tradeData.userId,
          asset: tradeData.asset,
          amount: tradeData.amount,
          action: tradeData.action,
          price: tradeData.price
        },
        tradeData.price,
        tradeData.amount * tradeData.price,
        'success'
      );

      return response.data;
    } catch (error) {
      TradeLogger.logTradeError(
        {
          userId: tradeData.userId,
          asset: tradeData.asset,
          amount: tradeData.amount,
          action: tradeData.action,
          price: tradeData.price
        },
        error as Error,
        "trade execution"
      );
      throw error;
    }
  },

  /**
   * Get trade history for a user
   */
  getTradeHistory: async (userId: string, limit: number = 50): Promise<any> => {
    try {
      TradeLogger.logWithOptions("Trade API", `Fetching trade history for user ${userId}`, userId);

      const response = await internalApiService.get(
        `${TRADING_API_BASE_URL}/trade-history?userId=${userId}&limit=${limit}`,
        undefined,
        "FETCH_TRADE_HISTORY_SUCCESS",
        "FETCH_TRADE_HISTORY_ERROR"
      );

      return response.data;
    } catch (error) {
      TradeLogger.logTradeError(
        { userId, asset: "history", amount: 0, action: "fetch" },
        error as Error,
        "fetch trade history"
      );
      throw error;
    }
  },

  /**
   * Get portfolio summary for a user
   */
  getPortfolioSummary: async (userId: string): Promise<any> => {
    try {
      TradeLogger.logWithOptions("Trade API", `Fetching portfolio summary for user ${userId}`, userId);

      const response = await internalApiService.get(
        `${TRADING_API_BASE_URL}/portfolio-summary?userId=${userId}`,
        undefined,
        "FETCH_PORTFOLIO_SUMMARY_SUCCESS", 
        "FETCH_PORTFOLIO_SUMMARY_ERROR"
      );

      return response.data;
    } catch (error) {
      TradeLogger.logTradeError(
        { userId, asset: "portfolio", amount: 0, action: "fetch" },
        error as Error,
        "fetch portfolio summary"
      );
      throw error;
    }
  },

  /**
   * Cancel a pending trade
   */
  cancelTrade: async (tradeId: string, userId: string): Promise<any> => {
    try {
      TradeLogger.logWithOptions("Trade API", `Cancelling trade ${tradeId} for user ${userId}`, userId);

      const response = await internalApiService.delete(
        `${TRADING_API_BASE_URL}/trades/${tradeId}?userId=${userId}`,
        undefined,
        undefined, // no success message for delete
        "CANCEL_TRADE_ERROR"
      );

      TradeLogger.logTradeCancellation(userId, tradeId, "user requested");
      return response.data;
    } catch (error) {
      TradeLogger.logTradeError(
        { userId, asset: "multiple", amount: 0, action: "cancel" },
        error as Error,
        "cancel trade"
      );
      throw error;
    }
  },

  // Add more MobX observable trade methods as needed
});