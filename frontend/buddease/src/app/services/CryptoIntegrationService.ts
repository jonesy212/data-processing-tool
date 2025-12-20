// CryptoIntegrationService.ts
// src/services/CryptoIntegrationService.ts
import { environmentAwareEndpointManager } from '@/config/endpoints/EnvironmentAwareEndpointManager';
import internalApiService from '@/app/api/ApiClient';
import { executeTrade, TradeAction } from '@/app/api/PortfolioService';
import { getMarketPrice } from '@/app/api/service/PriceApiService';
import { TradeLogger } from "@/app/logging/TradeLogger";
import { CryptoPortfolio } from '@/app/components/crypto/CryptoPortfolio'

export interface TradeRequest {
  symbol: string;
  amount: number;
  type: 'buy' | 'sell';
  limitPrice?: number;
  userId: string; // Added to match your TradeAction interface
}

export class CryptoIntegrationService {
  async getPortfolio(userId: number): Promise<CryptoPortfolio> {
    if (!environmentAwareEndpointManager.isFeatureEnabled('advancedCrypto')) {
      throw new Error('Crypto portfolio features are not available in your current environment');
    }

    const endpoint = environmentAwareEndpointManager.getCryptoEndpoint('getPortfolio', userId);
    const response = await internalApiService.get(endpoint);
    return response.data;
  }

  async executeTrade(userId: number, trade: TradeRequest): Promise<any> {
    const transactionLimit = environmentAwareEndpointManager.getLimit('cryptoTransactionLimit');
    
    if (trade.amount > transactionLimit) {
      throw new Error(`Transaction amount exceeds the limit of $${transactionLimit} for this environment`);
    }

    // Convert to your TradeAction format and use your existing executeTrade function
    const tradeAction: TradeAction = {
      userId: trade.userId || userId.toString(),
      asset: trade.symbol,
      amount: trade.amount,
      action: trade.type,
      price: trade.limitPrice
    };

    // Use your existing trade execution system
    await executeTrade(tradeAction);

    // Log the trade execution through environment-aware system
    const endpoint = environmentAwareEndpointManager.getCryptoEndpoint('logTrade', userId);
    await internalApiService.post(endpoint, {
      trade: tradeAction,
      environment: environmentAwareEndpointManager.getCurrentEnvironment().name,
      timestamp: new Date().toISOString()
    });

    return { success: true, trade: tradeAction };
  }

  async getMarketData(symbols: string[]): Promise<any> {
    // Use your existing getMarketPrice function for each symbol
    const marketDataPromises = symbols.map(async (symbol) => {
      const price = await getMarketPrice(symbol);
      return {
        symbol,
        price,
        timestamp: new Date().toISOString()
      };
    });

    const marketData = await Promise.all(marketDataPromises);
    
    // Also log market data fetch for analytics
    TradeLogger.logWithOptions(
      "Market Data",
      `Market data fetched for symbols: ${symbols.join(', ')}`,
      'system'
    );

    return marketData;
  }

  // Enhanced portfolio rebalancing with your trade execution
  async rebalancePortfolioForProject(
    userId: number, 
    projectId: number, 
    targetAllocation: Record<string, number>
  ): Promise<any> {
    try {
      // Get current portfolio
      const portfolio = await this.getPortfolio(userId);
      
      // Calculate required trades using your existing logic
      const trades = this.calculateRebalancingTrades(portfolio, targetAllocation);
      
      // Execute trades within environment limits using your executeTrade function
      const results = [];
      for (const trade of trades) {
        if (trade.amount > 0) {
          const tradeRequest: TradeRequest = {
            symbol: trade.symbol,
            amount: trade.amount,
            type: trade.type,
            userId: userId.toString()
          };

          const result = await this.executeTrade(userId, tradeRequest);
          results.push(result);
          
          // Log trade for project funding using your existing system
          await this.logTradeForProject(projectId, tradeRequest, result);
        }
      }
      
      // Log rebalancing completion
      TradeLogger.logWithOptions(
        "Portfolio Rebalancing",
        `Portfolio rebalanced for project ${projectId} with ${trades.length} trades`,
        userId.toString()
      );
      
      return results;
    } catch (error) {
      console.error('Portfolio rebalancing failed:', error);
      
      // Log rebalancing failure
      TradeLogger.logWithOptions(
        "Portfolio Rebalancing Error",
        `Rebalancing failed for project ${projectId}: ${error}`,
        userId.toString(),
        "error"
      );
      
      throw error;
    }
  }

  private calculateRebalancingTrades(
    portfolio: CryptoPortfolio, 
    targetAllocation: Record<string, number>
  ): Array<{ symbol: string; amount: number; type: 'buy' | 'sell' }> {
    const trades: Array<{ symbol: string; amount: number; type: 'buy' | 'sell' }> = [];
    const totalValue = portfolio.totalValue;

    // Calculate current allocation
    const currentAllocation: Record<string, number> = {};
    portfolio.assets.forEach(asset => {
      currentAllocation[asset.symbol] = (asset.value / totalValue) * 100;
    });

    // Calculate required trades to reach target allocation
    Object.keys(targetAllocation).forEach(symbol => {
      const targetPercent = targetAllocation[symbol];
      const currentPercent = currentAllocation[symbol] || 0;
      const targetValue = (targetPercent / 100) * totalValue;
      const currentValue = (currentPercent / 100) * totalValue;
      
      const valueDifference = targetValue - currentValue;
      
      if (Math.abs(valueDifference) > 1) { // Only trade if difference is significant (> $1)
        const currentAsset = portfolio.assets.find(a => a.symbol === symbol);
        const currentPrice = currentAsset ? currentAsset.value / currentAsset.amount : await getMarketPrice(symbol);
        
        if (currentPrice > 0) {
          const amount = valueDifference / currentPrice;
          
          trades.push({
            symbol,
            amount: Math.abs(amount),
            type: valueDifference > 0 ? 'buy' : 'sell'
          });
        }
      }
    });

    return trades;
  }

  private async logTradeForProject(projectId: number, trade: TradeRequest, result: any) {
    const endpoint = environmentAwareEndpointManager.getEndpoint('projects', 'logCryptoTransaction', projectId);
    await internalApiService.post(endpoint, {
      trade,
      result,
      environment: environmentAwareEndpointManager.getCurrentEnvironment().name,
      timestamp: new Date().toISOString()
    });
  }

  // New method: Execute trade with project context
  async executeTradeForProject(
    userId: number,
    projectId: number,
    trade: TradeRequest,
    phase?: string
  ): Promise<any> {
    const env = environmentAwareEndpointManager.getCurrentEnvironment();
    
    // Check if crypto features are enabled in this environment
    if (!env.features.advancedCrypto) {
      throw new Error('Crypto trading is not available in the current environment');
    }

    // Execute the trade using your existing system
    const result = await this.executeTrade(userId, trade);

    // Log the project-specific trade
    const projectEndpoint = environmentAwareEndpointManager.getEndpoint(
      'projects', 
      'logProjectTrade', 
      projectId
    );
    
    await internalApiService.post(projectEndpoint, {
      trade,
      result,
      phase,
      environment: env.name,
      userId,
      timestamp: new Date().toISOString()
    });

    return result;
  }

  // New method: Get portfolio with project context
  async getProjectPortfolio(userId: number, projectId: number): Promise<CryptoPortfolio & { projectAllocation?: number }> {
    const portfolio = await this.getPortfolio(userId);
    
    // Get project-specific portfolio data if available
    try {
      const projectEndpoint = environmentAwareEndpointManager.getEndpoint(
        'projects',
        'getProjectPortfolio',
        projectId
      );
      
      const projectResponse = await internalApiService.get(projectEndpoint);
      return {
        ...portfolio,
        projectAllocation: projectResponse.data.allocation
      };
    } catch (error) {
      // If project-specific data isn't available, return basic portfolio
      return portfolio;
    }
  }
}

export const cryptoIntegrationService = new CryptoIntegrationService();