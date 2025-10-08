// TradeLogger.ts
// TradeLogger.ts
import { Logger } from './Logger';
import { endpoints } from '@/app/api/endpointConfigurations';
import { NotificationTypeEnum, useNotification } from "@/app/context/NotificationContext";
import NOTIFICATION_MESSAGES from "@/app/features/support/NotificationMessages";
import { TradeAction } from './Exchange';
import { CryptoPortfolio } from './portfolioService';

const { notify } = useNotification() || { notify: () => {} };

class TradeLogger extends Logger {
  /**
   * Log trade execution
   */
  static logTradeExecution(
    trade: TradeAction,
    marketPrice: number,
    tradeValue: number,
    status: 'success' | 'failed'
  ): void {
    const message = `Trade ${status}: ${trade.action.toUpperCase()} ${trade.amount} ${trade.asset} at $${marketPrice} (Total: $${tradeValue})`;
    
    this.logWithOptions(
      "Trade Execution",
      message,
      trade.userId
    );

    // Log to backend service
    this.logTradeEventToService({
      type: 'trade_execution',
      userId: trade.userId,
      asset: trade.asset,
      action: trade.action,
      amount: trade.amount,
      price: marketPrice,
      totalValue: tradeValue,
      status: status,
      timestamp: new Date()
    });
  }

  /**
   * Log trade initiation
   */
  static logTradeInitiation(trade: TradeAction): void {
    this.logWithOptions(
      "Trade Initiation",
      `Trade initiated: ${trade.action.toUpperCase()} ${trade.amount} ${trade.asset}`,
      trade.userId
    );

    this.logTradeEventToService({
      type: 'trade_initiation',
      userId: trade.userId,
      asset: trade.asset,
      action: trade.action,
      amount: trade.amount,
      timestamp: new Date()
    });
  }

  /**
   * Log trade validation
   */
  static logTradeValidation(
    trade: TradeAction,
    isValid: boolean,
    validationMessage?: string
  ): void {
    const status = isValid ? 'valid' : 'invalid';
    
    this.logWithOptions(
      "Trade Validation",
      `Trade validation ${status}: ${trade.action.toUpperCase()} ${trade.amount} ${trade.asset} - ${validationMessage || 'No issues'}`,
      trade.userId
    );

    this.logTradeEventToService({
      type: 'trade_validation',
      userId: trade.userId,
      asset: trade.asset,
      action: trade.action,
      amount: trade.amount,
      isValid: isValid,
      validationMessage: validationMessage,
      timestamp: new Date()
    });
  }

  /**
   * Log portfolio update after trade
   */
  static logPortfolioUpdate(
    userId: string,
    asset: string,
    action: 'buy' | 'sell',
    amount: number,
    newBalance: number,
    portfolioValue: number
  ): void {
    this.logWithOptions(
      "Portfolio Update",
      `Portfolio updated: ${action.toUpperCase()} ${amount} ${asset} | New balance: ${newBalance} | Portfolio value: $${portfolioValue}`,
      userId
    );

    this.logTradeEventToService({
      type: 'portfolio_update',
      userId: userId,
      asset: asset,
      action: action,
      amount: amount,
      newBalance: newBalance,
      portfolioValue: portfolioValue,
      timestamp: new Date()
    });
  }

  /**
   * Log trade error
   */
  static logTradeError(
    trade: TradeAction,
    error: Error,
    context?: string
  ): void {
    const contextMessage = context ? ` in ${context}` : '';
    
    this.logWithOptions(
      "Trade Error",
      `Trade error${contextMessage}: ${trade.action.toUpperCase()} ${trade.amount} ${trade.asset} - ${error.message}`,
      trade.userId
    );

    // Send notification for critical trade errors
    notify(
      "Trade Error",
      `Failed to execute trade: ${error.message}`,
      { trade, error: error.message },
      new Date(),
      NotificationTypeEnum.ERROR
    );

    this.logTradeEventToService({
      type: 'trade_error',
      userId: trade.userId,
      asset: trade.asset,
      action: trade.action,
      amount: trade.amount,
      error: error.message,
      context: context,
      timestamp: new Date()
    });
  }

  /**
   * Log market data fetch
   */
  static logMarketDataFetch(
    asset: string,
    price: number,
    source: string,
    userId?: string
  ): void {
    this.logWithOptions(
      "Market Data",
      `Market data fetched: ${asset} = $${price} from ${source}`,
      userId || 'system'
    );

    this.logTradeEventToService({
      type: 'market_data_fetch',
      asset: asset,
      price: price,
      source: source,
      userId: userId,
      timestamp: new Date()
    });
  }

  /**
   * Log trade fee calculation
   */
  static logTradeFee(
    userId: string,
    asset: string,
    amount: number,
    feeAmount: number,
    feePercentage: number
  ): void {
    this.logWithOptions(
      "Trade Fee",
      `Trade fee calculated: ${asset} - Amount: ${amount} | Fee: $${feeAmount} (${feePercentage}%)`,
      userId
    );

    this.logTradeEventToService({
      type: 'trade_fee',
      userId: userId,
      asset: asset,
      amount: amount,
      feeAmount: feeAmount,
      feePercentage: feePercentage,
      timestamp: new Date()
    });
  }

  /**
   * Log portfolio rebalancing
   */
  static logPortfolioRebalancing(
    userId: string,
    recommendations: Array<{
      symbol: string;
      action: 'buy' | 'sell';
      amount: number;
      reason: string;
    }>
  ): void {
    const actions = recommendations.map(rec => 
      `${rec.action.toUpperCase()} ${rec.amount} ${rec.symbol}`
    ).join(', ');

    this.logWithOptions(
      "Portfolio Rebalancing",
      `Rebalancing recommendations: ${actions}`,
      userId
    );

    this.logTradeEventToService({
      type: 'portfolio_rebalancing',
      userId: userId,
      recommendations: recommendations,
      timestamp: new Date()
    });
  }

  /**
   * Log trade performance metrics
   */
  static logTradePerformance(
    userId: string,
    metrics: {
      totalTrades: number;
      successfulTrades: number;
      totalVolume: number;
      averageTradeSize: number;
      winRate: number;
    }
  ): void {
    this.logWithOptions(
      "Trade Performance",
      `Performance metrics: ${metrics.successfulTrades}/${metrics.totalTrades} successful trades | Volume: $${metrics.totalVolume} | Win rate: ${metrics.winRate}%`,
      userId
    );

    this.logTradeEventToService({
      type: 'trade_performance',
      userId: userId,
      metrics: metrics,
      timestamp: new Date()
    });
  }

  /**
   * Log trade cancellation
   */
  static logTradeCancellation(
    userId: string,
    tradeId: string,
    reason: string
  ): void {
    this.logWithOptions(
      "Trade Cancellation",
      `Trade cancelled: ${tradeId} - Reason: ${reason}`,
      userId
    );

    this.logTradeEventToService({
      type: 'trade_cancellation',
      userId: userId,
      tradeId: tradeId,
      reason: reason,
      timestamp: new Date()
    });
  }

  /**
   * Private method to log trade events to backend service
   */
  private static async logTradeEventToService(eventData: any): Promise<void> {
    try {
      const logUrl = this.getTradeLogUrl();
      
      await fetch(logUrl, {
        method: "POST",
        body: JSON.stringify(eventData),
        headers: {
          "Content-Type": "application/json",
        },
      });
    } catch (error) {
      console.error("Error logging trade event to service:", error);
      // Don't throw here to avoid breaking the main trade flow
    }
  }

    /**
   * Log external API call preparation
   */
  static logExternalAPICall(
    userId: string,
    endpoint: string,
    payload: any
  ): void {
    this.logWithOptions(
      "External API",
      `Preparing external API call to ${endpoint}`,
      userId
    );

     // Log sensitive data carefully (you might want to redact certain fields)
    const safePayload = { ...payload };
    if (safePayload.apiKey) {
      safePayload.apiKey = '***REDACTED***';
    }

    
    this.logTradeEventToService({
      type: 'external_api_call',
      userId: userId,
      endpoint: endpoint,
      payload: safePayload,
      timestamp: new Date()
    });
  }

  /**
   * Log external API response
   */
  static logExternalAPIResponse(
    userId: string,
    endpoint: string,
    status: number,
    response: any
  ): void {
    const statusType = status >= 200 && status < 300 ? 'success' : 'error';
    
    this.logWithOptions(
      "External API",
      `External API ${statusType}: ${status} from ${endpoint}`,
      userId
    );

    this.logTradeEventToService({
      type: 'external_api_response',
      userId: userId,
      endpoint: endpoint,
      status: status,
      response: response,
      timestamp: new Date()
    });
  }

  /**
   * Log external API error
   */
  static logExternalAPIError(
    userId: string,
    endpoint: string,
    error: Error,
    context?: string
  ): void {
    this.logWithOptions(
      "External API Error",
      `External API error at ${endpoint}: ${error.message}${context ? ` (${context})` : ''}`,
      userId
    );

    this.logTradeEventToService({
      type: 'external_api_error',
      userId: userId,
      endpoint: endpoint,
      error: error.message,
      context: context,
      timestamp: new Date()
    });

    this.logTradeEventToService({
      type: 'external_api_call',
      userId: userId,
      endpoint: endpoint,
      payload: payload,
      timestamp: new Date()
    });
  }

  /**
   * Log external API response
   */
  static logExternalAPIResponse(
    userId: string,
    endpoint: string,
    status: number,
    response: any
  ): void {
    this.logWithOptions(
      "External API",
      `External API response: ${status} from ${endpoint}`,
      userId
    );

    this.logTradeEventToService({
      type: 'external_api_response',
      userId: userId,
      endpoint: endpoint,
      status: status,
      response: response,
      timestamp: new Date()
    });
  }

  /**
   * Log trade simulation (for testing/development)
   */
  static logTradeSimulation(
    trade: TradeAction,
    simulatedPrice: number
  ): void {
    this.logWithOptions(
      "Trade Simulation",
      `Trade simulated: ${trade.action} ${trade.amount} ${trade.asset} at simulated price $${simulatedPrice}`,
      trade.userId
    );

    this.logTradeEventToService({
      type: 'trade_simulation',
      userId: trade.userId,
      asset: trade.asset,
      action: trade.action,
      amount: trade.amount,
      simulatedPrice: simulatedPrice,
      timestamp: new Date()
    });
  }

  /**
   * Get the trade logging endpoint URL
   */
  private static getTradeLogUrl(): string {
    let logUrl = "";

    if (typeof endpoints.logs.logTradeEvent === "string") {
      logUrl = endpoints.logs.logTradeEvent;
    } else if (typeof endpoints.logs.logTradeEvent === "function") {
      logUrl = endpoints.logs.logTradeEvent();
    } else {
      // Fallback to general log endpoint
      logUrl = endpoints.logging || "/api/logs/trades";
    }

    return logUrl;
  }
}

export { TradeLogger };