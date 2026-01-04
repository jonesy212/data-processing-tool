PriceApiService.ts
PriceApiService.ts// priceService.ts
import axiosInstance from '@/core/api/csrfToken';

Types
export interface MarketPrice {
  symbol: string;
  price: number;
  currency: string;
  timestamp: Date;
  change24h?: number;
  changePercentage24h?: number;
  volume24h?: number;
  marketCap?: number;
  high24h?: number;
  low24h?: number;
}

export interface PriceHistory {
  symbol: string;
  prices: Array<{
    timestamp: Date;
    price: number;
    volume?: number;
  }>;
  timeframe: '1h' | '24h' | '7d' | '30d' | '1y';
}

export interface PriceAlert {
  id: string;
  symbol: string;
  targetPrice: number;
  condition: 'above' | 'below';
  isActive: boolean;
  createdAt: Date;
  triggeredAt?: Date;
}

export interface ExchangeRate {
  from: string;
  to: string;
  rate: number;
  timestamp: Date;
}

Cache for prices to avoid excessive API calls
const priceCache = new Map<string, { price: MarketPrice; timestamp: number }>();
const CACHE_DURATION = 30000; // 30 seconds cache

class PriceService {
  private static instance: PriceService;
  private baseUrl = 'https://api.coingecko.com/api/v3'; // Using CoinGecko as example
  private fallbackUrls = [
    'https://api.coinbase.com/v2',
    'https://api.binance.com/api/v3'
  ];

  private constructor() {}

  public static getInstance(): PriceService {
    if (!PriceService.instance) {
      PriceService.instance = new PriceService();
    }
    return PriceService.instance;
  }

  /**
   * Get current market price for a cryptocurrency
   */
  async getMarketPrice(symbol: string, currency: string = 'usd'): Promise<number> {
    try {
      const cacheKey = `${symbol.toLowerCase()}-${currency}`;
      const cached = priceCache.get(cacheKey);
      
      // Return cached price if it's still valid
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.price.price;
      }

      // Try primary API first
      let priceData: MarketPrice | null = null;
      
      try {
        priceData = await this.fetchFromCoinGecko(symbol, currency);
      } catch (error) {
        console.warn(`CoinGecko API failed for ${symbol}, trying fallback...`);
        priceData = await this.tryFallbackApis(symbol, currency);
      }

      if (!priceData) {
        throw new Error(`Unable to fetch price for ${symbol}`);
      }

      // Cache the price
      priceCache.set(cacheKey, {
        price: priceData,
        timestamp: Date.now()
      });

      return priceData.price;
    } catch (error) {
      console.error(`Error fetching market price for ${symbol}:`, error);
      throw new Error(`Failed to get market price for ${symbol}`);
    }
  }

  /**
   * Get detailed market data for a cryptocurrency
   */
  async getMarketData(symbol: string, currency: string = 'usd'): Promise<MarketPrice> {
    try {
      const cacheKey = `detailed-${symbol.toLowerCase()}-${currency}`;
      const cached = priceCache.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.price;
      }

      let marketData: MarketPrice | null = null;
      
      try {
        marketData = await this.fetchFromCoinGecko(symbol, currency);
      } catch (error) {
        marketData = await this.tryFallbackApis(symbol, currency);
      }

      if (!marketData) {
        throw new Error(`Unable to fetch market data for ${symbol}`);
      }

      priceCache.set(cacheKey, {
        price: marketData,
        timestamp: Date.now()
      });

      return marketData;
    } catch (error) {
      console.error(`Error fetching market data for ${symbol}:`, error);
      throw new Error(`Failed to get market data for ${symbol}`);
    }
  }

  /**
   * Get price history for a cryptocurrency
   */
  async getPriceHistory(
    symbol: string, 
    timeframe: '1h' | '24h' | '7d' | '30d' | '1y' = '24h',
    currency: string = 'usd'
  ): Promise<PriceHistory> {
    try {
      const days = this.timeframeToDays(timeframe);
      const response = await axiosInstance.get(
        `${this.baseUrl}/coins/${symbol.toLowerCase()}/market_chart`,
        {
          params: {
            vs_currency: currency,
            days: days,
            interval: this.getIntervalForTimeframe(timeframe)
          }
        }
      );

      const prices = response.data.prices.map(([timestamp, price]: [number, number]) => ({
        timestamp: new Date(timestamp),
        price: price
      }));

      return {
        symbol,
        prices,
        timeframe
      };
    } catch (error) {
      console.error(`Error fetching price history for ${symbol}:`, error);
      throw new Error(`Failed to get price history for ${symbol}`);
    }
  }

  /**
   * Get multiple prices at once (batch request)
   */
  async getMultiplePrices(
    symbols: string[], 
    currency: string = 'usd'
  ): Promise<Map<string, number>> {
    try {
      const symbolString = symbols.map(s => s.toLowerCase()).join(',');
      const response = await axiosInstance.get(
        `${this.baseUrl}/simple/price`,
        {
          params: {
            ids: symbolString,
            vs_currencies: currency
          }
        }
      );

      const prices = new Map<string, number>();
      symbols.forEach(symbol => {
        const price = response.data[symbol.toLowerCase()]?.[currency];
        if (price) {
          prices.set(symbol, price);
        }
      });

      return prices;
    } catch (error) {
      console.error('Error fetching multiple prices:', error);
      throw new Error('Failed to get multiple prices');
    }
  }

  /**
   * Get exchange rate between two currencies
   */
  async getExchangeRate(from: string, to: string): Promise<ExchangeRate> {
    try {
      // For crypto to fiat or fiat to fiat
      if (from.toLowerCase() === 'usd' && to.toLowerCase() !== 'usd') {
        const response = await axiosInstance.get(
          `https://api.exchangerate-api.com/v4/latest/${from}`
        );
        const rate = response.data.rates[to.toUpperCase()];
        
        return {
          from,
          to,
          rate,
          timestamp: new Date()
        };
      }

      // For crypto to crypto, get both in USD and calculate
      const fromPrice = await this.getMarketPrice(from, 'usd');
      const toPrice = await this.getMarketPrice(to, 'usd');
      const rate = fromPrice / toPrice;

      return {
        from,
        to,
        rate,
        timestamp: new Date()
      };
    } catch (error) {
      console.error(`Error fetching exchange rate from ${from} to ${to}:`, error);
      throw new Error(`Failed to get exchange rate from ${from} to ${to}`);
    }
  }

  /**
   * Set up a price alert
   */
  createPriceAlert(
    symbol: string, 
    targetPrice: number, 
    condition: 'above' | 'below'
  ): PriceAlert {
    const alert: PriceAlert = {
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      symbol,
      targetPrice,
      condition,
      isActive: true,
      createdAt: new Date()
    };

    // Store alert (in a real app, this would be in a database)
    this.storeAlert(alert);
    
    // Start monitoring (in a real app, this would be a background job)
    this.monitorAlert(alert);

    return alert;
  }

  /**
   * Clear price cache (useful for testing or manual refresh)
   */
  clearCache(): void {
    priceCache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: priceCache.size,
      keys: Array.from(priceCache.keys())
    };
  }

  // Private methods
  private async fetchFromCoinGecko(symbol: string, currency: string): Promise<MarketPrice> {
    const response = await axiosInstance.get(
      `${this.baseUrl}/simple/price`,
      {
        params: {
          ids: symbol.toLowerCase(),
          vs_currencies: currency,
          include_24hr_change: true,
          include_24hr_vol: true,
          include_market_cap: true
        }
      }
    );

    const data = response.data[symbol.toLowerCase()];
    if (!data) {
      throw new Error(`Symbol ${symbol} not found`);
    }

    return {
      symbol: symbol.toUpperCase(),
      price: data[currency],
      currency: currency.toUpperCase(),
      timestamp: new Date(),
      change24h: data[`${currency}_24h_change`],
      changePercentage24h: data[`${currency}_24h_change`],
      volume24h: data[`${currency}_24h_vol`],
      marketCap: data[`${currency}_market_cap`]
    };
  }

  private async tryFallbackApis(symbol: string, currency: string): Promise<MarketPrice> {
    // Try Binance
    try {
      const response = await axiosInstance.get(
        `https://api.binance.com/api/v3/ticker/price`,
        {
          params: { symbol: `${symbol.toUpperCase()}${currency.toUpperCase()}` }
        }
      );

      return {
        symbol: symbol.toUpperCase(),
        price: parseFloat(response.data.price),
        currency: currency.toUpperCase(),
        timestamp: new Date()
      };
    } catch (error) {
      // Try CoinBase as last resort
      try {
        const response = await axiosInstance.get(
          `https://api.coinbase.com/v2/prices/${symbol.toUpperCase()}-${currency.toUpperCase()}/spot`
        );
        
        return {
          symbol: symbol.toUpperCase(),
          price: parseFloat(response.data.data.amount),
          currency: currency.toUpperCase(),
          timestamp: new Date()
        };
      } catch (finalError) {
        throw new Error(`All price APIs failed for ${symbol}`);
      }
    }
  }

  private timeframeToDays(timeframe: string): number {
    const mapping: { [key: string]: number } = {
      '1h': 1,
      '24h': 1,
      '7d': 7,
      '30d': 30,
      '1y': 365
    };
    return mapping[timeframe] || 1;
  }

  private getIntervalForTimeframe(timeframe: string): string {
    const mapping: { [key: string]: string } = {
      '1h': 'hourly',
      '24h': 'hourly',
      '7d': 'daily',
      '30d': 'daily',
      '1y': 'daily'
    };
    return mapping[timeframe] || 'daily';
  }

  private storeAlert(alert: PriceAlert): void {
    // In a real application, store in database
    const alerts = this.getStoredAlerts();
    alerts.push(alert);
    localStorage.setItem('priceAlerts', JSON.stringify(alerts));
  }

  private getStoredAlerts(): PriceAlert[] {
    const stored = localStorage.getItem('priceAlerts');
    return stored ? JSON.parse(stored) : [];
  }

  private async monitorAlert(alert: PriceAlert): Promise<void> {
    // Simple monitoring - in production, this would be a proper background job
    const checkAlert = async () => {
      if (!alert.isActive) return;

      try {
        const currentPrice = await this.getMarketPrice(alert.symbol);
        const shouldTrigger = 
          (alert.condition === 'above' && currentPrice >= alert.targetPrice) ||
          (alert.condition === 'below' && currentPrice <= alert.targetPrice);

        if (shouldTrigger) {
          this.triggerAlert(alert, currentPrice);
        }
      } catch (error) {
        console.error(`Error monitoring alert ${alert.id}:`, error);
      }
    };

    // Check every minute
    setInterval(checkAlert, 60000);
  }

  private triggerAlert(alert: PriceAlert, currentPrice: number): void {
    alert.isActive = false;
    alert.triggeredAt = new Date();

    // Update stored alert
    const alerts = this.getStoredAlerts();
    const index = alerts.findIndex(a => a.id === alert.id);
    if (index !== -1) {
      alerts[index] = alert;
      localStorage.setItem('priceAlerts', JSON.stringify(alerts));
    }

    // Notify user (in a real app, this could be push notification, email, etc.)
    console.log(`🚨 Price Alert: ${alert.symbol} is ${alert.condition} ${alert.targetPrice}. Current price: ${currentPrice}`);
    
    // Dispatch notification event
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('priceAlert', { 
        detail: { alert, currentPrice } 
      }));
    }
  }
}

Export singleton instance
export const priceService = PriceService.getInstance();

Export individual functions for convenience
export {
    getMarketPrice, PriceService
};

Convenience function that matches your original import
async function getMarketPrice(symbol: string): Promise<number> {
  return priceService.getMarketPrice(symbol);
}