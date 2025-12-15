// TradeLogger.ts
import { endpoints } from '@/app/api/endpointConfigurations';
import Logger from '@/app/components/crypto/CryptoPortfolio'
import { TradeAction } from '@/app/models/cypto/Exchange';
import { NotificationTypeEnum } from '@/app/features/support/UnifiedNotificationTypes'
import { useNotification } from "@/app/state/context/NotificationContext";
import { payload } from "@/app/server/database/Payload";
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
    
    Logger.logWithOptions(
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
    Logger.logWithOptions(
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
    
    Logger.logWithOptions(
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
    Logger.logWithOptions(
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
    
    // Original logging (kept as is)
    Logger.logWithOptions(
      "Trade Error",
      `Trade error${contextMessage}: ${trade.action.toUpperCase()} ${trade.amount} ${trade.asset} - ${error.message}`,
      trade.userId
    );

    // Enhanced error categorization
    let userMessage = "Failed to execute trade";
    let errorType = "TRADE_EXECUTION_ERROR";
    let severity: 'low' | 'medium' | 'high' | 'critical' = 'medium';
    
    // Categorize trade errors
    if (error.message.includes('insufficient funds') || error.message.includes('balance')) {
      userMessage = "Insufficient funds for trade";
      errorType = "INSUFFICIENT_FUNDS_ERROR";
      severity = 'high';
    } else if (error.message.includes('market closed') || error.message.includes('trading hours')) {
      userMessage = "Market is closed for trading";
      errorType = "MARKET_CLOSED_ERROR";
      severity = 'medium';
    } else if (error.message.includes('price invalid') || error.message.includes('spread')) {
      userMessage = "Invalid trade price";
      errorType = "INVALID_PRICE_ERROR";
      severity = 'medium';
    } else if (error.message.includes('permission') || error.message.includes('authorization')) {
      userMessage = "Trading permission denied";
      errorType = "TRADING_PERMISSION_ERROR";
      severity = 'critical';
    } else if (error.message.includes('network') || error.message.includes('connection')) {
      userMessage = "Network error during trade execution";
      errorType = "TRADE_NETWORK_ERROR";
      severity = 'high';
    } else if (error.message.includes('timeout')) {
      userMessage = "Trade execution timed out";
      errorType = "TRADE_TIMEOUT_ERROR";
      severity = 'high';
    } else if (error.message.includes('rate limit') || error.message.includes('too many requests')) {
      userMessage = "Trading rate limit exceeded";
      errorType = "TRADE_RATE_LIMIT_ERROR";
      severity = 'medium';
    }

    // Send notification for trade errors using consistent object format
    const notificationData = {
      id: `trade_error_${trade.userId}_${trade.asset}_${Date.now()}`,
      message: userMessage,
      data: {
        entityType: 'trade',
        entityId: trade.tradeId || `trade_${Date.now()}`,
        action: 'trade_execution',
        tradeInfo: {
          userId: trade.userId,
          asset: trade.asset,
          action: trade.action,
          amount: trade.amount,
          price: trade.price,
          orderType: trade.orderType,
          side: trade.side
        },
        errorDetails: {
          originalError: error.message,
          errorType: errorType,
          stack: error.stack,
          context: context,
          severity: severity
        },
        timestamp: new Date().toISOString()
      },
      timestamp: new Date(),
      type: NotificationTypeEnum.OPERATION_ERROR,
      level: 'error' as const,
      metadata: {
        isTradingError: true,
        requiresManualReview: severity === 'critical' || severity === 'high',
        tradingSession: this.getTradingSession(),
        errorSeverity: severity
      }
    };

    // Send the notification
    notify(notificationData);

    // For critical errors, send an additional alert notification
    if (severity === 'critical') {
      const alertNotification = {
        id: `trade_critical_alert_${trade.userId}_${Date.now()}`,
        message: "CRITICAL: Trading error requires immediate attention",
        data: {
          entityType: 'trade',
          entityId: trade.tradeId,
          action: 'critical_alert',
          tradeInfo: {
            asset: trade.asset,
            action: trade.action,
            amount: trade.amount
          },
          error: error.message,
          requiresImmediateAction: true
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.ALERT,
        level: 'critical' as const,
        autoDismiss: false, // Don't auto-dismiss critical alerts
        action: {
          label: "Review Trade",
          onClick: () => this.navigateToTradeReview(trade)
        }
      };
      
      notify(alertNotification);
    }

    // Log to external service
    this.logTradeEventToService({
      type: 'trade_error',
      userId: trade.userId,
      asset: trade.asset,
      action: trade.action,
      amount: trade.amount,
      price: trade.price,
      orderType: trade.orderType,
      side: trade.side,
      error: {
        message: error.message,
        type: errorType,
        severity: severity,
        stack: error.stack
      },
      context: context,
      timestamp: new Date(),
      notificationSent: true,
      notificationData: notificationData
    });

    // Optional: Send to monitoring service
    this.sendToTradingMonitor({
      event: 'trade_error',
      trade: trade,
      error: error,
      context: context,
      severity: severity,
      timestamp: new Date()
    });
  }

  /**
   * Get current trading session
   */
  private static getTradingSession(): string {
    const now = new Date();
    const hour = now.getHours();
    
    if (hour >= 9 && hour < 12) return 'morning_session';
    if (hour >= 12 && hour < 16) return 'afternoon_session';
    if (hour >= 16 && hour < 20) return 'evening_session';
    return 'overnight_session';
  }

  // #TODO
  /**
   * Navigate to trade review (placeholder implementation)
   */
  private static navigateToTradeReview(trade: TradeAction): void {
    console.log(`Navigating to trade review for trade: ${trade.tradeId}`);
    // Implement actual navigation logic here
    // window.location.href = `/trades/review/${trade.tradeId}`;
  }

  /**
   * Send to trading monitor service (placeholder)
   */
  private static sendToTradingMonitor(data: any): void {
    // Implement actual monitoring service integration
    console.log('Sending to trading monitor:', data);
    // tradingMonitorService.trackError(data);
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
    Logger.logWithOptions(
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
    Logger.logWithOptions(
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

    Logger.logWithOptions(
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
    Logger.logWithOptions(
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
    Logger.logWithOptions(
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
    Logger.logWithOptions(
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
    
    Logger.logWithOptions(
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
    Logger.logWithOptions(
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
   * Log trade simulation (for testing/development)
   */
  static logTradeSimulation(
    trade: TradeAction,
    simulatedPrice: number
  ): void {
    Logger.logWithOptions(
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
