// CryptoPortfolio.ts
import { default as ExtendedCryptoNotificationMessages, default as internalApiService } from '@/app/api/ApiClient';
import { getMarketPrice } from '@/app/api/service/PriceApiService';
import { BaseDataEntity, BaseDataRoot, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { Attachment } from '@/app/documents/attachment/Attachment';
import { Category } from "@/app/libraries/categories/generateCategoryProperties";
import { TradeLogger } from "@/app/libraries/logging/TradeLogger";
import { CategoryProperties } from '@/app/pages/personas/ScenarioBuilder';
import { Snapshot } from '@/app/snapshots/Snapshot';
import { SnapshotData } from '@/app/snapshots/SnapshotData';
import SnapshotStore from '@/app/snapshots/SnapshotStore';


import {
  cryptoNotificationMessages
} from '@/app/api/ApiCrypto';

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




// Extend CryptoNotificationMessages to include trade-specific messages
interface ExtendedCryptoNotificationMessages {

}

// Create extended notification messages
const extendedCryptoNotificationMessages: ExtendedCryptoNotificationMessages = {
  ...cryptoNotificationMessages,
  TRADE_EXECUTION_SUCCESS: "Trade executed successfully",
  TRADE_EXECUTION_ERROR: "Failed to execute trade",
  PORTFOLIO_UPDATE_SUCCESS: "Portfolio updated successfully",
  PORTFOLIO_UPDATE_ERROR: "Failed to update portfolio",
  TRADE_ACTIVITY_LOG_SUCCESS: "Trade activity logged successfully",
  TRADE_ACTIVITY_LOG_ERROR: "Failed to log trade activity",
  GET_MARKET_PRICE_SUCCESS: "Market price retrieved successfully",
  GET_MARKET_PRICE_ERROR: "Failed to retrieve market price",
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

    // 2. Use internalApiService for the external trading API call
    const tradeResponse = await internalApiService.post(
      'https://api.yourexchange.com/trade',
      {
        userId,
        asset,
        amount,
        action,
        price: marketPrice
      },
      undefined, // config (optional)
      'TRADE_EXECUTION_SUCCESS' as keyof ExtendedCryptoNotificationMessages, // success message
      'TRADE_EXECUTION_ERROR' as keyof ExtendedCryptoNotificationMessages // error message
    );

    // Log external API call
    TradeLogger.logWithOptions(
      "External API",
      `External trade API call prepared for ${action} ${amount} ${asset} at $${marketPrice}`,
      userId
    );

    if (tradeResponse.status !== 200) {
      const errorMsg = 'Trade execution failed with the exchange';
      TradeLogger.logTradeError(trade, new Error(errorMsg), 'external exchange API');
      throw new Error(errorMsg);
    }

    // Log successful external API response
    TradeLogger.logWithOptions(
      "External API",
      `External trade API response: ${tradeResponse.status} for ${action} ${amount} ${asset}`,
      userId
    );

    // 3. Update user portfolio locally using internalApiService
    await internalApiService.post(
      `/api/users/${userId}/portfolio/update`,
      {
        asset,
        amount,
        action,
        price: marketPrice,
        timestamp: Date.now()
      },
      undefined,
      'PORTFOLIO_UPDATE_SUCCESS' as keyof ExtendedCryptoNotificationMessages,
      'PORTFOLIO_UPDATE_ERROR' as keyof ExtendedCryptoNotificationMessages
    );

    // Log portfolio update completion
    TradeLogger.logPortfolioUpdate(
      userId,
      asset,
      action,
      amount,
      amount, // This would be the new balance
      tradeValue // This would be the portfolio value
    );

    // 4. Log the trade activity using internalApiService
    await internalApiService.post(
      `/api/users/${userId}/trade-activity`,
      {
        asset,
        amount,
        action,
        price: marketPrice,
        executedAt: new Date().toISOString()
      },
      undefined,
      'TRADE_ACTIVITY_LOG_SUCCESS' as keyof ExtendedCryptoNotificationMessages,
      'TRADE_ACTIVITY_LOG_ERROR' as keyof ExtendedCryptoNotificationMessages
    );

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
    throw error;
  }
};


// Example function to fetch snapshot and crypto data
// Alternative implementation using SnapshotApi directly
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
  
  try {
    let snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined;
    
    // Try multiple approaches to get the snapshot
    if ('getSnapshot' in snapshotContainer && typeof snapshotContainer.getSnapshot === 'function') {
      // Approach 1: Use the store's getSnapshot method with SnapshotApi
      const storeId = getStoreIdFromStore(snapshotContainer);
      const { snapshotApi } = await import('@/app/api/SnapshotApi');
      
      snapshot = await snapshotApi.fetchById(
        snapshotId,
        storeId
      );
    } else if (snapshotContainer instanceof Map) {
      // Approach 2: Direct Map access
      snapshot = snapshotContainer.get(snapshotId);
    } else if ('snapshots' in snapshotContainer && typeof snapshotContainer.snapshots === 'object') {
      // Approach 3: Access via snapshots property
      snapshot = (snapshotContainer as any).snapshots?.[snapshotId];
    } else {
      // Approach 4: Use the generic getSnapshot function
      snapshot = await getSnapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>(
        snapshotId,
        getStoreIdFromStore(snapshotContainer),
        snapshotContainer,
        getStoreIdFromStore(snapshotContainer),
        'fetch',
        {} as SnapshotEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
        {} as SnapshotConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
      );
    }
    
    return { snapshot, portfolio: cryptoPortfolio };
  } catch (error) {
    console.error('Error fetching snapshot and crypto data:', error);
    return { snapshot: undefined, portfolio: cryptoPortfolio };
  }
};
// Helper function for type-safe snapshot access
async function getSnapshotFromStore<
  T extends BaseDataEntity,
  K extends T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  store: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  snapshotId: string
): Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined> {
  
  try {
    if ('getSnapshot' in store && typeof store.getSnapshot === 'function') {
      // Create a properly typed snapshot getter function
      const snapshotGetter = async (id: string): Promise<{
        snapshotId: number;
        snapshotData: SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
        category: symbol | string | Category | undefined;
        categoryProperties: CategoryProperties | undefined;
        dataStoreMethods: DataStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null;
        timestamp: string | number | Date | undefined;
        id: string | number | undefined;
        snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
        snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
        data: T;
      }> => {
        // Use the SnapshotApi to get the snapshot data
        const snapshotData = await snapshotApi.fetchById<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>(
          id,
          // You'll need to provide the storeId - this might come from the store or context
          getStoreIdFromStore(store),
          undefined // additional headers
        );
        
        // Transform the response to match the expected format
        return {
          snapshotId: Number(id),
          snapshotData: snapshotData.snapshotData, // Adjust based on actual response structure
          category: snapshotData.category,
          categoryProperties: snapshotData.categoryProperties,
          dataStoreMethods: null, // You might need to get this from somewhere
          timestamp: snapshotData.timestamp,
          id: snapshotData.id,
          snapshot: snapshotData,
          snapshotStore: store,
          data: snapshotData.data as T
        };
      };

      const result = await store.getSnapshot(snapshotGetter);
      return result as Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
    }
    
    // Alternative access patterns for other store types
    if (store instanceof Map) {
      return store.get(snapshotId);
    }
    
    // Fallback to direct property access
    return (store as any).snapshots?.[snapshotId] || (store as any)[snapshotId];
  } catch (error) {
    console.error(`Error getting snapshot ${snapshotId} from store:`, error);
    return undefined;
  }
}

// Helper function to extract storeId from store
function getStoreIdFromStore<
  T extends BaseDataEntity,
  K extends T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(store: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): number {
  // Try different ways to get storeId from the store
  if ('storeId' in store && typeof store.storeId === 'number') {
    return store.storeId;
  }
  if ('id' in store && typeof store.id === 'number') {
    return store.id;
  }
  if ('config' in store && store.getConfig() && 'storeId' in store.getConfig()) {
    return (store.getConfig() as any).storeId;
  }
  
  // Default fallback - you might want to handle this differently
  console.warn('Could not determine storeId from store, using default value 0');
  return 0;
}

// You'll need this helper function to actually get the snapshot data
async function getSnapshotById<
  T extends BaseDataEntity,
  K extends T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(id: string): Promise<{
  snapshotId: number;
  snapshotData: SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  categoryProperties: CategoryProperties | undefined;
  dataStoreMethods: DataStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null;
  timestamp: string | number | Date | undefined;
  id: string | number | undefined;
  snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  data: T;
  category?: Category;
}> {
  // Implement your actual snapshot retrieval logic here
  // This could be from a database, API, or local storage
  throw new Error("getSnapshotById not implemented");
}