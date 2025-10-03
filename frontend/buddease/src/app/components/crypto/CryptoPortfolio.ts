import { BaseData } from '@/app/components/models/data/Data';
import { Snapshot } from "@/app/snapshots";
import SnapshotStore from '@/app/snapshots/SnapshotStore';
import { StructuredMetadata } from "@/config/StructuredMetadata";
import { logTradeActivity, updateUserPortfolio } from './portfolioService';
import { getMarketPrice } from './priceService';

// Portfolio management in crypto
export interface CryptoPortfolio {
    assetId: string;
    symbol: string;
    amount: number;
    valueUSD: number;
    lastUpdated: Date;
    assets: { [symbol: string]: number }; // e.g., BTC: 1.5, ETH: 2.0
    allocationPercentage?: number;
    performance24h?: number;
  }
  
  export interface ProjectActivity {
    id: string;
    type: 'task' | 'message' | 'file' | 'status-change';
    action: string;
    timestamp: Date;
    projectId: string;
    userId: string;
    metadata?: Record<string, unknown>;
  }



// Crypto trade action
export type TradeAction = {
    userId: string;
    asset: string; // e.g. 'BTC'
    amount: number; // e.g. 0.5
    action: 'buy' | 'sell';
    price?: number; // optional: market price can be fetched if not provided
    timestamp?: number;
  };

export const executeTrade = async (trade: TradeAction): Promise<void> => {
  const { userId, asset, amount, action, price } = trade;

  try {
    // 1. Get the current market price if not provided
    const marketPrice = price ?? await getMarketPrice(asset);

    if (!marketPrice) {
      throw new Error(`Failed to retrieve market price for ${asset}`);
    }

    const tradeValue = marketPrice * amount;

    // 2. Optional: Call external trading API
    // Example pseudo-request
    /*
    const response = await axios.post('https://api.yourexchange.com/trade', {
      userId,
      asset,
      amount,
      action,
      price: marketPrice
    });
    */

    // Simulate successful response
    const response = { status: 200 };

    if (response.status !== 200) {
      throw new Error('Trade execution failed with the exchange');
    }

    // 3. Update user portfolio locally
    await updateUserPortfolio(userId, {
      asset,
      amount,
      action,
      price: marketPrice,
      timestamp: Date.now()
    });

    // 4. Log the trade activity
    await logTradeActivity(userId, {
      asset,
      amount,
      action,
      price: marketPrice,
      executedAt: new Date().toISOString()
    });

    console.log(`[✔] ${action.toUpperCase()} ${amount} ${asset} at ${marketPrice} executed for user ${userId}`);
  } catch (error) {
    console.error(`[✖] Failed to execute trade:`, error);
    throw error; // Re-throw to handle in caller if needed
  }
};


  

  
  // Example function to fetch snapshot and crypto data
export const fetchSnapshotAndCryptoData = async <
    T extends BaseData<any>,
    K extends T = T,
    Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>
>(
    snapshotContainer: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshotId: string,
    cryptoPortfolio: CryptoPortfolio
  ): Promise<{ snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>; portfolio: CryptoPortfolio }> => {
    // Fetch snapshot and portfolio data
    const snapshot = snapshotContainer[snapshotId];
    return { snapshot, portfolio: cryptoPortfolio };
  };