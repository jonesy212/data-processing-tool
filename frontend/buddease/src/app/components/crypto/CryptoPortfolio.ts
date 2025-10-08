import { BaseData } from '@/app/models/data/Data';
import { Snapshot } from '@/app/snapshots/Snapshot';
import SnapshotStore from '@/app/snapshots/SnapshotStore';
import { StructuredMetadata } from "@/config/StructuredMetadata";
import { logTradeActivity, updateUserPortfolio } from '@/app/api/PortfolioService';
import { getMarketPrice } from '@/app/api/PriceApiService';
import { Attachment } from '@/app/documents/attachment/Attachment';

import { BaseDataEntity, BaseDataRoot, DefaultExcludedFields, DefaultMeta } from '@/config/BaseConfig';

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
    // Log trade initiation
    TradeLogger.logTradeInitiation(trade);

    // 1. Get the current market price if not provided
    const marketPrice = price ?? await getMarketPrice(asset);
    TradeLogger.logMarketDataFetch(asset, marketPrice, 'priceService', userId);

    if (!marketPrice) {
      throw new Error(`Failed to retrieve market price for ${asset}`);
    }

    const tradeValue = marketPrice * amount;

    // 2. Optional: Call external trading API
    // Example pseudo-request
    
    const response = await axios.post('https://api.yourexchange.com/trade', {
      userId,
      asset,
      amount,
      action,
      price: marketPrice
    });
  

    // Log external API call (commented out but logged for future implementation)
    TradeLogger.logWithOptions(
      "External API",
      `External trade API call prepared for ${action} ${amount} ${asset} at $${marketPrice}`,
      userId
    );

    // Simulate successful response
    const response = { status: 200 };

    if (response.status !== 200) {
      const errorMsg = 'Trade execution failed with the exchange';
      TradeLogger.logTradeError(trade, new Error(errorMsg), 'external exchange API');
      throw new Error(errorMsg);
    }

    // Log successful external API response
    TradeLogger.logWithOptions(
      "External API",
      `External trade API response: ${response.status} for ${action} ${amount} ${asset}`,
      userId
    );

    // 3. Update user portfolio locally
    await updateUserPortfolio(userId, {
      asset,
      amount,
      action,
      price: marketPrice,
      timestamp: Date.now()
    });

    // Log portfolio update completion
    TradeLogger.logPortfolioUpdate(
      userId,
      asset,
      action,
      amount,
      amount, // This would be the new balance - you might want to get the actual new balance
      tradeValue // This would be the portfolio value - you might want to get the actual portfolio value
    );

    // 4. Log the trade activity
    await logTradeActivity(userId, {
      asset,
      amount,
      action,
      price: marketPrice,
      executedAt: new Date().toISOString()
    });

    // Log trade activity completion
    TradeLogger.logWithOptions(
      "Trade Activity",
      `Trade activity logged for ${action} ${amount} ${asset}`,
      userId
    );

    // Log successful trade execution
    TradeLogger.logTradeExecution(trade, marketPrice, tradeValue, 'success');

    console.log(`[✔] ${action.toUpperCase()} ${amount} ${asset} at ${marketPrice} executed for user ${userId}`);
  } catch (error) {
    // Log trade execution failure with detailed context
    TradeLogger.logTradeError(trade, error as Error, 'trade execution');
    
    console.error(`[✖] Failed to execute trade:`, error);
    throw error; // Re-throw to handle in caller if needed
  }
};


// Example function to fetch snapshot and crypto data
export const fetchSnapshotAndCryptoData = async <
  T extends BaseDataEntity = BaseDataRoot,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  snapshotContainer: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  snapshotId: string,
  cryptoPortfolio: CryptoPortfolio
): Promise<{ snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined; portfolio: CryptoPortfolio }> => {
  
  // Use a type-safe method to get the snapshot
  const snapshot = getSnapshotFromStore(snapshotContainer, snapshotId);
  
  return { snapshot, portfolio: cryptoPortfolio };
};

// Helper function for type-safe snapshot access
function getSnapshotFromStore<
  T extends BaseDataEntity,
  K extends T,
  Meta extends DefaultMeta<T, K>,
  AttachmentType extends Attachment,
  ExcludedFields extends keyof T,
  IncludedFields extends keyof T
>(
  store: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  snapshotId: string
): Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined {
  // Implement your actual logic here based on how snapshots are stored
  // For example:
  if ('getSnapshot' in store && typeof store.getSnapshot === 'function') {
    return store.getSnapshot(snapshotId);
  }
  
  // Or if it's a Map-like structure:
  if (store instanceof Map) {
    return store.get(snapshotId);
  }
  
  // Fallback to type assertion if you're sure about the structure
  return (store as any)[snapshotId];
}