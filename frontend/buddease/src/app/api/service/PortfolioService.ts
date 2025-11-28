// PortfolioService.ts

import { AxiosError, AxiosResponse } from 'axios';
import axiosInstance from '@/app/api/csrfToken';
import { getMarketPrice, priceService } from '@/app/api/service/PriceApiService'
import { TradeLogger } from '@/libraries/logging/TradeLogger'
// Types
export interface PortfolioAsset {
  symbol: string;
  amount: number;
  averageBuyPrice: number;
  currentPrice?: number;
  valueUSD?: number;
  profitLoss?: number;
  profitLossPercentage?: number;
  allocationPercentage?: number;
  lastUpdated: Date;
}

export interface UserPortfolio {
  userId: string;
  assets: Map<string, PortfolioAsset>; // symbol -> asset details
  totalValueUSD: number;
  cashBalance: number;
  performance24h?: number;
  performance7d?: number;
  performance30d?: number;
  createdAt: Date;
  lastUpdated: Date;
}

export interface TradeActivity {
  id: string;
  userId: string;
  asset: string;
  action: 'buy' | 'sell';
  amount: number;
  price: number;
  totalValue: number;
  fee?: number;
  executedAt: Date;
  status: 'completed' | 'pending' | 'failed';
  exchange?: string;
  notes?: string;
}

export interface PortfolioPerformance {
  timestamp: Date;
  totalValue: number;
  dailyChange: number;
  dailyChangePercentage: number;
}

export interface RebalanceRecommendation {
  symbol: string;
  currentAllocation: number;
  targetAllocation: number;
  recommendedAction: 'buy' | 'sell';
  recommendedAmount: number;
  reason: string;
}

// Cache for portfolio data
const portfolioCache = new Map<string, { portfolio: UserPortfolio; timestamp: number }>();
const CACHE_DURATION = 60000; // 1 minute cache

class PortfolioService {
  private static instance: PortfolioService;
  private baseUrl = '/api/portfolio'; // Your backend API base URL

  private constructor() {}

  public static getInstance(): PortfolioService {
    if (!PortfolioService.instance) {
      PortfolioService.instance = new PortfolioService();
    }
    return PortfolioService.instance;
  }

  /**
   * Update user portfolio after a trade
   */
  async updateUserPortfolio(
    userId: string, 
    trade: {
      asset: string;
      amount: number;
      action: 'buy' | 'sell';
      price: number;
      timestamp: number;
      fee?: number;
    }
  ): Promise<UserPortfolio> {
    try {
      TradeLogger.logTradeInitiation({
        userId: userId,
        asset: trade.asset,
        amount: trade.amount,
        action: trade.action,
        price: trade.price,
        timestamp: trade.timestamp
      });

      // Validate trade
      const validation = await this.validateTrade(userId, trade);
      if (!validation.isValid) {
        TradeLogger.logTradeValidation(
          { userId, ...trade },
          false,
          validation.message
        );
        throw new Error(validation.message);
      }

      TradeLogger.logTradeValidation(
        { userId, ...trade },
        true,
        'Trade validated successfully'
      );

      // Get current portfolio
      let portfolio = await this.getUserPortfolio(userId);
      
      const { asset, amount, action, price, fee = 0 } = trade;
      const totalCost = price * amount + fee;

      // Update portfolio based on trade action
      if (action === 'buy') {
        portfolio = await this.handleBuyTrade(portfolio, asset, amount, price, totalCost, fee);
      } else {
        portfolio = await this.handleSellTrade(portfolio, asset, amount, price, totalCost, fee);
      }

      // Update cash balance
      if (action === 'buy') {
        portfolio.cashBalance -= totalCost;
      } else {
        portfolio.cashBalance += totalCost - fee;
      }

      // Recalculate total value and allocations
      portfolio = await this.calculatePortfolioValue(portfolio);
      portfolio.lastUpdated = new Date();

      // Save updated portfolio
      await this.savePortfolio(portfolio);

      // Log portfolio update
      const assetBalance = portfolio.assets.get(asset)?.amount || 0;
      TradeLogger.logPortfolioUpdate(
        userId,
        asset,
        action,
        amount,
        assetBalance,
        portfolio.totalValueUSD
      );

      // Log trade execution success
      TradeLogger.logTradeExecution(
        { userId, ...trade },
        price,
        totalCost,
        'success'
      );

      // Clear cache for this user
      portfolioCache.delete(userId);

      return portfolio;
    } catch (error) {
      // Log trade execution failure
      TradeLogger.logTradeExecution(
        { userId, ...trade },
        trade.price,
        trade.price * trade.amount,
        'failed'
      );

      TradeLogger.logTradeError(
        { userId, ...trade },
        error as Error,
        'portfolio update'
      );

      console.error(`Error updating portfolio for user ${userId}:`, error);
      throw new Error(`Failed to update portfolio`);
    }
  }

  /**
   * Log trade activity for audit and history
   */
  async logTradeActivity(userId: string, trade: {
    asset: string;
    amount: number;
    action: 'buy' | 'sell';
    price: number;
    executedAt: string;
    fee?: number;
    exchange?: string;
    notes?: string;
  }): Promise<TradeActivity> {
    try {
      const tradeActivity: TradeActivity = {
        id: `trade-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        userId,
        asset: trade.asset,
        action: trade.action,
        amount: trade.amount,
        price: trade.price,
        totalValue: trade.amount * trade.price,
        fee: trade.fee || 0,
        executedAt: new Date(trade.executedAt),
        status: 'completed',
        exchange: trade.exchange,
        notes: trade.notes
      };

      // Log trade activity
      TradeLogger.logTradeExecution(
        {
          userId: userId,
          asset: trade.asset,
          amount: trade.amount,
          action: trade.action,
          price: trade.price
        },
        trade.price,
        trade.amount * trade.price,
        'success'
      );

      // Save trade activity to backend
      const response = await axiosInstance.post(`${this.baseUrl}/${userId}/trades`, tradeActivity);

      // Also update local storage for quick access
      this.storeTradeActivityLocally(tradeActivity);

      return tradeActivity;
    } catch (error) {
      TradeLogger.logTradeError(
        {
          userId: userId,
          asset: trade.asset,
          amount: trade.amount,
          action: trade.action,
          price: trade.price
        },
        error as Error,
        'trade activity logging'
      );

      console.error(`Error logging trade activity for user ${userId}:`, error);
      throw new Error(`Failed to log trade activity`);
    }
  }

  /**
   * Get portfolio performance history
   */
  async getPortfolioPerformance(
    userId: string, 
    days: number = 30
  ): Promise<PortfolioPerformance[]> {
    try {
      const response = await axiosInstance.get(
        `${this.baseUrl}/${userId}/performance`,
        { params: { days } }
      );

      // Log performance metrics
      const performanceData = response.data;
      if (performanceData.length > 0) {
        const latest = performanceData[performanceData.length - 1];
        TradeLogger.logTradePerformance(userId, {
          totalTrades: performanceData.length,
          successfulTrades: performanceData.filter((p: any) => p.dailyChange > 0).length,
          totalVolume: performanceData.reduce((sum: number, p: any) => sum + p.totalValue, 0),
          averageTradeSize: performanceData.reduce((sum: number, p: any) => sum + p.totalValue, 0) / performanceData.length,
          winRate: (performanceData.filter((p: any) => p.dailyChange > 0).length / performanceData.length) * 100
        });
      }

      return performanceData;
    } catch (error) {
      console.error(`Error fetching portfolio performance for user ${userId}:`, error);
      throw new Error(`Failed to get portfolio performance`);
    }
  }

  /**
   * Get user portfolio with current market values
   */
  async getUserPortfolio(userId: string, forceRefresh: boolean = false): Promise<UserPortfolio> {
    try {
      // Check cache first
      const cached = portfolioCache.get(userId);
      if (cached && !forceRefresh && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.portfolio;
      }

      // Fetch portfolio from backend or create default
      let portfolio: UserPortfolio;
      try {
        const response = await axiosInstance.get(`${this.baseUrl}/${userId}`);
        portfolio = this.mapResponseToPortfolio(response.data);
      } catch (error) {
        // If portfolio doesn't exist, create a default one
        if ((error as AxiosError).response?.status === 404) {
          portfolio = this.createDefaultPortfolio(userId);
        } else {
          throw error;
        }
      }

      // Calculate current values with latest prices
      portfolio = await this.calculatePortfolioValue(portfolio);
      portfolio.lastUpdated = new Date();

      // Cache the portfolio
      portfolioCache.set(userId, {
        portfolio,
        timestamp: Date.now()
      });

      return portfolio;
    } catch (error) {
      console.error(`Error fetching portfolio for user ${userId}:`, error);
      throw new Error(`Failed to get user portfolio`);
    }
  }


  /**
   * Get trade history for a user
   */
  async getTradeHistory(userId: string, limit: number = 50): Promise<TradeActivity[]> {
    try {
      // Try to get from backend first
      try {
        const response = await axiosInstance.get(
          `${this.baseUrl}/${userId}/trades`,
          { params: { limit } }
        );
        return response.data;
      } catch (error) {
        // Fallback to local storage
        return this.getLocalTradeHistory(userId, limit);
      }
    } catch (error) {
      console.error(`Error fetching trade history for user ${userId}:`, error);
      return [];
    }
  }

  /**
   * Get rebalancing recommendations
   */
  async getRebalanceRecommendations(
    userId: string, 
    targetAllocations: Map<string, number> // symbol -> target percentage
  ): Promise<RebalanceRecommendation[]> {
    try {
      const portfolio = await this.getUserPortfolio(userId);
      const recommendations: RebalanceRecommendation[] = [];

      // Calculate current allocations
      const currentAllocations = new Map<string, number>();
      portfolio.assets.forEach((asset, symbol) => {
        if (asset.allocationPercentage) {
          currentAllocations.set(symbol, asset.allocationPercentage);
        }
      });

      // Generate recommendations
      targetAllocations.forEach((targetAllocation, symbol) => {
        const currentAllocation = currentAllocations.get(symbol) || 0;
        const difference = targetAllocation - currentAllocation;
        const tolerance = 0.01; // 1% tolerance

        if (Math.abs(difference) > tolerance) {
          const totalValue = portfolio.totalValueUSD;
          const targetValue = totalValue * targetAllocation;
          const currentValue = totalValue * currentAllocation;
          const valueDifference = targetValue - currentValue;

          let recommendedAction: 'buy' | 'sell';
          let recommendedAmount: number;

          if (valueDifference > 0) {
            recommendedAction = 'buy';
            const asset = portfolio.assets.get(symbol);
            recommendedAmount = valueDifference / (asset?.currentPrice || 1);
          } else {
            recommendedAction = 'sell';
            const asset = portfolio.assets.get(symbol);
            recommendedAmount = Math.abs(valueDifference) / (asset?.currentPrice || 1);
          }

          recommendations.push({
            symbol,
            currentAllocation,
            targetAllocation,
            recommendedAction,
            recommendedAmount,
            reason: `Allocation deviation: ${(difference * 100).toFixed(2)}% from target`
          });
        }
      });

      // Log rebalancing recommendations
      TradeLogger.logPortfolioRebalancing(userId, recommendations.map(rec => ({
        symbol: rec.symbol,
        action: rec.recommendedAction,
        amount: rec.recommendedAmount,
        reason: rec.reason
      })));

      return recommendations;
    } catch (error) {
      console.error(`Error generating rebalance recommendations for user ${userId}:`, error);
      throw new Error(`Failed to get rebalance recommendations`);
    }
  }


  /**
   * Calculate portfolio diversification metrics
   */
  async getDiversificationMetrics(userId: string): Promise<{
    assetCount: number;
    concentrationRatio: number; // Herfindahl index
    topHoldings: Array<{ symbol: string; allocation: number }>;
    riskScore: number;
  }> {
    try {
      const portfolio = await this.getUserPortfolio(userId);
      
      let concentrationRatio = 0;
      const allocations: number[] = [];

      portfolio.assets.forEach(asset => {
        if (asset.allocationPercentage) {
          allocations.push(asset.allocationPercentage);
          concentrationRatio += Math.pow(asset.allocationPercentage, 2);
        }
      });

      // Get top 5 holdings
      const topHoldings = Array.from(portfolio.assets.entries())
        .map(([symbol, asset]) => ({
          symbol,
          allocation: asset.allocationPercentage || 0
        }))
        .sort((a, b) => b.allocation - a.allocation)
        .slice(0, 5);

      // Simple risk score based on concentration
      const riskScore = Math.min(concentrationRatio * 100, 100);

      return {
        assetCount: portfolio.assets.size,
        concentrationRatio,
        topHoldings,
        riskScore
      };
    } catch (error) {
      console.error(`Error calculating diversification metrics for user ${userId}:`, error);
      throw new Error(`Failed to get diversification metrics`);
    }
  }

  

  /**
   * Clear portfolio cache
   */
  clearCache(userId?: string): void {
    if (userId) {
      portfolioCache.delete(userId);
    } else {
      portfolioCache.clear();
    }
  }



  /**
   * Validate trade before execution
   */
  private async validateTrade(
    userId: string,
    trade: {
      asset: string;
      amount: number;
      action: 'buy' | 'sell';
      price: number;
    }
  ): Promise<{ isValid: boolean; message?: string }> {
    try {
      const portfolio = await this.getUserPortfolio(userId);

      // Check if user has sufficient funds for buy
      if (trade.action === 'buy') {
        const totalCost = trade.price * trade.amount;
        if (portfolio.cashBalance < totalCost) {
          return {
            isValid: false,
            message: `Insufficient funds. Required: $${totalCost}, Available: $${portfolio.cashBalance}`
          };
        }
      }

      // Check if user has sufficient assets for sell
      if (trade.action === 'sell') {
        const currentAsset = portfolio.assets.get(trade.asset);
        if (!currentAsset || currentAsset.amount < trade.amount) {
          return {
            isValid: false,
            message: `Insufficient ${trade.asset} to sell. Available: ${currentAsset?.amount || 0}, Requested: ${trade.amount}`
          };
        }
      }

      // Validate amount is positive
      if (trade.amount <= 0) {
        return {
          isValid: false,
          message: 'Trade amount must be positive'
        };
      }

      // Validate price is positive
      if (trade.price <= 0) {
        return {
          isValid: false,
          message: 'Trade price must be positive'
        };
      }

      return { isValid: true, message: 'Trade validation passed' };
    } catch (error) {
      return {
        isValid: false,
        message: `Trade validation error: ${(error as Error).message}`
      };
    }
  }

  // Private methods
  private async handleBuyTrade(
    portfolio: UserPortfolio,
    asset: string,
    amount: number,
    price: number,
    totalCost: number,
    fee: number
  ): Promise<UserPortfolio> {
    const existingAsset = portfolio.assets.get(asset);

    if (existingAsset) {
      // Update existing asset
      const newTotalAmount = existingAsset.amount + amount;
      const newAveragePrice = (
        (existingAsset.amount * existingAsset.averageBuyPrice) + 
        (amount * price)
      ) / newTotalAmount;

      existingAsset.amount = newTotalAmount;
      existingAsset.averageBuyPrice = newAveragePrice;
    } else {
      // Add new asset
      portfolio.assets.set(asset, {
        symbol: asset,
        amount,
        averageBuyPrice: price,
        lastUpdated: new Date()
      });
    }

    return portfolio;
  }

  private async handleSellTrade(
    portfolio: UserPortfolio,
    asset: string,
    amount: number,
    price: number,
    totalValue: number,
    fee: number
  ): Promise<UserPortfolio> {
    const existingAsset = portfolio.assets.get(asset);

    if (!existingAsset || existingAsset.amount < amount) {
      throw new Error(`Insufficient ${asset} to sell`);
    }

    // Update asset amount (FIFO method for simplicity)
    existingAsset.amount -= amount;

    // Remove asset if amount becomes zero
    if (existingAsset.amount === 0) {
      portfolio.assets.delete(asset);
    }

    return portfolio;
  }

  private async calculatePortfolioValue(portfolio: UserPortfolio): Promise<UserPortfolio> {
    let totalValue = portfolio.cashBalance;

    // Update current prices and calculate values for all assets
    const symbols = Array.from(portfolio.assets.keys());
    if (symbols.length > 0) {
      const currentPrices = await priceService.getMultiplePrices(symbols);

      portfolio.assets.forEach(asset => {
        const currentPrice = currentPrices.get(asset.symbol) || 0;
        asset.currentPrice = currentPrice;
        asset.valueUSD = asset.amount * currentPrice;
        asset.profitLoss = asset.valueUSD - (asset.amount * asset.averageBuyPrice);
        asset.profitLossPercentage = asset.averageBuyPrice > 0 ? 
          (asset.profitLoss / (asset.amount * asset.averageBuyPrice)) * 100 : 0;

        totalValue += asset.valueUSD || 0;
      });

      // Calculate allocation percentages
      portfolio.assets.forEach(asset => {
        if (asset.valueUSD && totalValue > 0) {
          asset.allocationPercentage = (asset.valueUSD / totalValue) * 100;
        }
      });
    }

    portfolio.totalValueUSD = totalValue;
    return portfolio;
  }

  private createDefaultPortfolio(userId: string): UserPortfolio {
    return {
      userId,
      assets: new Map(),
      totalValueUSD: 0,
      cashBalance: 10000, // Default starting cash
      createdAt: new Date(),
      lastUpdated: new Date()
    };
  }

  private mapResponseToPortfolio(data: any): UserPortfolio {
    const assets = new Map<string, PortfolioAsset>();
    
    if (data.assets && Array.isArray(data.assets)) {
      data.assets.forEach((asset: any) => {
        assets.set(asset.symbol, {
          ...asset,
          lastUpdated: new Date(asset.lastUpdated)
        });
      });
    }

    return {
      userId: data.userId,
      assets,
      totalValueUSD: data.totalValueUSD || 0,
      cashBalance: data.cashBalance || 0,
      performance24h: data.performance24h,
      performance7d: data.performance7d,
      performance30d: data.performance30d,
      createdAt: new Date(data.createdAt),
      lastUpdated: new Date(data.lastUpdated)
    };
  }

  private async savePortfolio(portfolio: UserPortfolio): Promise<void> {
    try {
      await axiosInstance.put(`${this.baseUrl}/${portfolio.userId}`, portfolio);
    } catch (error) {
      console.error('Error saving portfolio to backend:', error);
      // In a real app, you might want to implement offline storage fallback
    }
  }

  private storeTradeActivityLocally(trade: TradeActivity): void {
    try {
      const key = `trades_${trade.userId}`;
      const existingTrades = this.getLocalTradeHistory(trade.userId);
      existingTrades.unshift(trade);
      
      // Keep only last 100 trades locally
      const limitedTrades = existingTrades.slice(0, 100);
      localStorage.setItem(key, JSON.stringify(limitedTrades));
    } catch (error) {
      console.error('Error storing trade activity locally:', error);
    }
  }

  private getLocalTradeHistory(userId: string, limit: number = 50): TradeActivity[] {
    try {
      const key = `trades_${userId}`;
      const stored = localStorage.getItem(key);
      if (stored) {
        const trades: TradeActivity[] = JSON.parse(stored);
        return trades
          .map(trade => ({
            ...trade,
            executedAt: new Date(trade.executedAt)
          }))
          .slice(0, limit);
      }
    } catch (error) {
      console.error('Error reading local trade history:', error);
    }
    return [];
  }
}

// Export singleton instance
export const portfolioService = PortfolioService.getInstance();

// Export individual functions for convenience
export { PortfolioService };

// Create singleton instance
const portfolioServiceInstance = PortfolioService.getInstance();

// Export bound instance methods as named functions
export const updateUserPortfolio = portfolioServiceInstance.updateUserPortfolio.bind(portfolioServiceInstance);
export const logTradeActivity = portfolioServiceInstance.logTradeActivity.bind(portfolioServiceInstance);
