// debugMethods.ts

import { Config } from '@/app/api/ConfigManager'

interface DebugEntry {
  id: string;
  timestamp: string;
  message: string;
  operation: string;
  configId: string;
}

interface TempDataEntry<T> {
  id: string;
  data: T;
  storedAt: string;
}

interface TempDataStorage<T> {
  items: TempDataEntry<T>[];
  createdAt: string;
  ttl: number;
}


export const DebugMethods = {
  /**
   * Adds debug information to the configuration
   */
  addDebugInfo<T>(
    configs: Config[],
    configId: string,
    message: string,
    operation?: string
  ): void {
    try {
      const timestamp = new Date().toISOString();
      const debugEntry: DebugEntry = {
        id: `${configId}_${Date.now()}`,
        timestamp,
        message,
        operation: operation || 'unknown',
        configId
      };

      // Find the config and add debug info
      const config = configs.find(c => c.id === configId);
      if (config) {
        if (!config.debugInfo) {
          config.debugInfo = [];
        }
        config.debugInfo.push(debugEntry);
        
        // Keep only last 100 debug entries to prevent memory bloat
        if (config.debugInfo.length > 100) {
          config.debugInfo = config.debugInfo.slice(-100);
        }
        
        console.log(`🔍 [DEBUG] ${operation || 'Operation'}: ${message}`, {
          configId,
          timestamp
        });
      } else {
        console.warn(`⚠️ Config not found for debug info: ${configId}`);
      }
    } catch (error) {
      console.error('❌ Error adding debug info:', error);
    }
  },

  /**
   * Stores temporary data for a configuration
   */
  storeTempData<T>(
    configs: Config[],
    configId: string,
    tempResults: T[],
    options: {
      ttl?: number; // Time to live in milliseconds
      maxSize?: number; // Maximum number of items to store
    } = {}
  ): void {
    try {
      const { ttl = 300000, maxSize = 1000 } = options; // Default 5 minutes, max 1000 items
      
      const config = configs.find(c => c.id === configId);
      if (config) {
        if (!config.tempData) {
          config.tempData = {
            items: [],
            createdAt: new Date().toISOString(),
            ttl
          };
        }

        // Add new items with timestamp
        const newItems: TempDataEntry<T>[] = tempResults.map(item => ({
          data: item,
          storedAt: new Date().toISOString(),
          id: `${configId}_temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        }));

        config.tempData.items.push(...newItems);
        
        // Enforce max size limit
        if (config.tempData.items.length > maxSize) {
          config.tempData.items = config.tempData.items.slice(-maxSize);
        }

        // Schedule cleanup if TTL is provided
        if (ttl > 0) {
          setTimeout(() => {
            this.cleanupExpiredTempData(configs, configId);
          }, ttl);
        }

        console.log(`💾 Stored ${tempResults.length} temporary items for config: ${configId}`);
      } else {
        console.warn(`⚠️ Config not found for storing temp data: ${configId}`);
      }
    } catch (error) {
      console.error('❌ Error storing temporary data:', error);
    }
  },

  /**
   * Retrieves temporary data for a configuration
   */
  getTempData<T>(
    configs: Config[],
    configId: string,
    options: {
      filter?: (item: T) => boolean;
      limit?: number;
      skipExpired?: boolean;
    } = {}
  ): T[] | undefined {
    try {
      const { filter, limit, skipExpired = true } = options;
      
      const config = configs.find(c => c.id === configId);
      if (!config || !config.tempData) {
        return undefined;
      }

      // Clean up expired data before retrieval
      if (skipExpired) {
        this.cleanupExpiredTempData(configs, configId);
      }

      let items = config.tempData.items.map(entry => entry.data);

      // Apply filter if provided
      if (filter) {
        items = items.filter(filter);
      }

      // Apply limit if provided
      if (limit && limit > 0) {
        items = items.slice(0, limit);
      }

      console.log(`📥 Retrieved ${items.length} temporary items for config: ${configId}`);
      return items;
    } catch (error) {
      console.error('❌ Error retrieving temporary data:', error);
      return undefined;
    }
  },

  /**
   * Cleans up expired temporary data
   */
  cleanupExpiredTempData(configs: Config[], configId: string): void {
    try {
      const config = configs.find(c => c.id === configId);
      if (!config || !config.tempData) return;

      const now = new Date().getTime();
      const ttl = config.tempData.ttl || 300000;

      const originalLength = config.tempData.items.length;
      
      config.tempData.items = config.tempData.items.filter(entry => {
        const entryTime = new Date(entry.storedAt).getTime();
        return (now - entryTime) < ttl;
      });

      const removedCount = originalLength - config.tempData.items.length;
      if (removedCount > 0) {
        console.log(`🧹 Cleaned up ${removedCount} expired temporary items for config: ${configId}`);
      }
    } catch (error) {
      console.error('❌ Error cleaning up expired temp data:', error);
    }
  },

  /**
   * Gets debug history for a configuration
   */
  getDebugHistory(configs: Config[], configId: string, limit: number = 50): DebugEntry[] {
    try {
      const config = configs.find(c => c.id === configId);
      if (!config || !config.debugInfo) {
        return [];
      }

      return config.debugInfo
        .slice(-limit)
        .sort((a: DebugEntry, b: DebugEntry) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
    } catch (error) {
      console.error('❌ Error getting debug history:', error);
      return [];
    }
  },

  /**
   * Clears all debug info for a configuration
   */
  clearDebugInfo(configs: Config[], configId: string): void {
    try {
      const config = configs.find(c => c.id === configId);
      if (config) {
        const clearedCount = config.debugInfo?.length || 0;
        config.debugInfo = [];
        console.log(`🗑️ Cleared ${clearedCount} debug entries for config: ${configId}`);
      }
    } catch (error) {
      console.error('❌ Error clearing debug info:', error);
    }
  },

  /**
   * Clears all temporary data for a configuration
   */
  clearTempData(configs: Config[], configId: string): void {
    try {
      const config = configs.find(c => c.id === configId);
      if (config && config.tempData) {
        const clearedCount = config.tempData.items.length;
        config.tempData.items = [];
        console.log(`🗑️ Cleared ${clearedCount} temporary items for config: ${configId}`);
      }
    } catch (error) {
      console.error('❌ Error clearing temporary data:', error);
    }
  },

  /**
   * Gets statistics about debug and temp data
   */
  getDebugStats(configs: Config[], configId: string): {
    debugEntries: number;
    tempItems: number;
    lastDebugTime: string | null;
    lastTempStoreTime: string | null;
  } {
    try {
      const config = configs.find(c => c.id === configId);
      if (!config) {
        return { debugEntries: 0, tempItems: 0, lastDebugTime: null, lastTempStoreTime: null };
      }

      const debugEntries = config.debugInfo?.length || 0;
      const tempItems = config.tempData?.items.length || 0;
      
      const lastDebugTime = debugEntries > 0 
        ? config.debugInfo[config.debugInfo.length - 1].timestamp 
        : null;
        
      const lastTempStoreTime = tempItems > 0 
        ? config.tempData.items[config.tempData.items.length - 1].storedAt 
        : null;

      return {
        debugEntries,
        tempItems,
        lastDebugTime,
        lastTempStoreTime
      };
    } catch (error) {
      console.error('❌ Error getting debug stats:', error);
      return { debugEntries: 0, tempItems: 0, lastDebugTime: null, lastTempStoreTime: null };
    }
  }
};

export  type { DebugEntry, TempDataStorage}