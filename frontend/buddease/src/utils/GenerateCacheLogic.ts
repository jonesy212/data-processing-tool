// GenerateCacheLogic.ts
// utils/GenerateCacheLogic.ts
import { CacheConfig } from '@/core/config/CacheConfig';
import { CacheManager, synchronizeCacheWithServer, writeClientCache } from '@/core/libraries/cache/client/CacheManager';
import axios from 'axios';

export interface GenerateCacheOptions {
  data: any;
  cacheKey: string;
  config?: Partial<CacheConfig>;
  metadata?: {
    source?: string;
    timestamp?: number;
    ttl?: number;
    tags?: string[];
  };
  forceRefresh?: boolean;
}

export interface CacheGenerationResult {
  success: boolean;
  cacheKey: string;
  timestamp: number;
  size?: number;
  metadata?: Record<string, any>;
  error?: string;
}

// Default cache configuration
const defaultCacheConfig: CacheConfig = {
  enabled: true,
  maxAge: 3600, // 1 hour in seconds
  staleWhileRevalidate: 300, // 5 minutes
  cacheKey: '',
  strategy: 'hybrid',
  ttl: 3600,
  versioning: {
    enabled: true,
    key: 'v1'
  },
  invalidation: {
    onUpdate: true,
    onDelete: true
  },
  persistence: {
    enabled: true,
    storageKey: 'cache-store',
    autoRehydrate: true
  }
};

/**
 * Main function to generate and manage cache
 */
export async function generateCacheLogic(options: GenerateCacheOptions): Promise<CacheGenerationResult> {
  const {
    data,
    cacheKey,
    config: userConfig = {},
    metadata = {},
    forceRefresh = false
  } = options;

  try {
    // Merge user config with defaults
    const finalConfig: CacheConfig = {
      ...defaultCacheConfig,
      ...userConfig,
      cacheKey: cacheKey, // Ensure cacheKey is properly set
      versioning: {
        ...defaultCacheConfig.versioning,
        ...userConfig.versioning
      },
      invalidation: {
        ...defaultCacheConfig.invalidation,
        ...userConfig.invalidation
      },
      persistence: {
        ...defaultCacheConfig.persistence,
        ...userConfig.persistence
      }
    };

    // Validate cache configuration
    if (!finalConfig.enabled) {
      return {
        success: false,
        cacheKey,
        timestamp: Date.now(),
        error: 'Cache is disabled in configuration'
      };
    }

    // Check if we should force refresh
    if (!forceRefresh) {
      const existingCache = await checkExistingCache(cacheKey, finalConfig);
      if (existingCache.shouldUseCache) {
        return {
          success: true,
          cacheKey,
          timestamp: existingCache.timestamp,
          size: existingCache.size,
          metadata: existingCache.metadata
        };
      }
    }

    // Prepare cache data with metadata
    const cacheData = prepareCacheData(data, finalConfig, metadata);

    // Generate cache based on strategy
    const result = await generateCacheByStrategy(cacheData, cacheKey, finalConfig);

    // Handle persistence if enabled
    if (finalConfig.persistence?.enabled) {
      await persistCache(cacheData, cacheKey, finalConfig);
    }

    // Synchronize with server if needed
    if (finalConfig.strategy === 'hybrid' || finalConfig.strategy === 'persistent') {
      await synchronizeCacheWithServer(cacheKey, cacheData);
    }

    // Set up auto-invalidation if configured
    if (finalConfig.invalidation.onUpdate || finalConfig.invalidation.onDelete) {
      setupCacheInvalidation(cacheKey, finalConfig);
    }

    return {
      success: true,
      cacheKey,
      timestamp: Date.now(),
      size: JSON.stringify(cacheData).length,
      metadata: {
        strategy: finalConfig.strategy,
        version: finalConfig.versioning.key,
        ...metadata
      }
    };

  } catch (error) {
    console.error('Error in generateCacheLogic:', error);
    return {
      success: false,
      cacheKey,
      timestamp: Date.now(),
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Check if valid cache exists and should be used
 */
async function checkExistingCache(
  cacheKey: string, 
  config: CacheConfig
): Promise<{
  shouldUseCache: boolean;
  timestamp: number;
  size?: number;
  metadata?: any;
}> {
  try {
    // Try to read from client cache first
    const clientCache = await CacheManager.read(cacheKey);
    
    if (!clientCache) {
      return { shouldUseCache: false, timestamp: Date.now() };
    }

    const now = Date.now();
    const cacheAge = now - (clientCache.timestamp || now);
    const maxAgeMs = config.maxAge * 1000;
    const staleWindowMs = config.staleWhileRevalidate * 1000;

    // Check if cache is fresh
    if (cacheAge <= maxAgeMs) {
      return {
        shouldUseCache: true,
        timestamp: clientCache.timestamp,
        size: clientCache.size,
        metadata: clientCache.metadata
      };
    }

    // Check if cache is stale but still usable while revalidating
    if (cacheAge <= maxAgeMs + staleWindowMs) {
      // Trigger background revalidation
      void revalidateCacheInBackground(cacheKey, config);
      
      return {
        shouldUseCache: true,
        timestamp: clientCache.timestamp,
        size: clientCache.size,
        metadata: clientCache.metadata
      };
    }

    // Cache is expired
    return { shouldUseCache: false, timestamp: Date.now() };

  } catch (error) {
    console.warn('Error checking existing cache:', error);
    return { shouldUseCache: false, timestamp: Date.now() };
  }
}

/**
 * Prepare cache data with proper structure and metadata
 */
function prepareCacheData(
  data: any, 
  config: CacheConfig, 
  metadata: Record<string, any>
): any {
  const timestamp = Date.now();
  const expiresAt = timestamp + (config.ttl * 1000);

  return {
    data,
    metadata: {
      ...metadata,
      timestamp,
      expiresAt,
      version: config.versioning.key,
      strategy: config.strategy,
      maxAge: config.maxAge,
      staleWhileRevalidate: config.staleWhileRevalidate
    },
    timestamp,
    expiresAt
  };
}

/**
 * Generate cache based on selected strategy
 */
async function generateCacheByStrategy(
  cacheData: any,
  cacheKey: string,
  config: CacheConfig
): Promise<void> {
  switch (config.strategy) {
    case 'memory':
      await generateMemoryCache(cacheData, cacheKey);
      break;
    
    case 'persistent':
      await generatePersistentCache(cacheData, cacheKey, config);
      break;
    
    case 'hybrid':
      await generateHybridCache(cacheData, cacheKey, config);
      break;
    
    default:
      throw new Error(`Unknown cache strategy: ${config.strategy}`);
  }
}

/**
 * Generate in-memory cache
 */
async function generateMemoryCache(cacheData: any, cacheKey: string): Promise<void> {
  // Use CacheManager for memory cache (it handles both client and server)
  await CacheManager.write(cacheKey, cacheData, {
    persistToServer: false
  });
}

/**
 * Generate persistent cache
 */
async function generatePersistentCache(
  cacheData: any,
  cacheKey: string,
  config: CacheConfig
): Promise<void> {
  // Write to client localStorage
  await writeClientCache(cacheKey, cacheData);

  // Also write to server via API
  try {
    await axios.post('/api/cache', {
      key: cacheKey,
      data: cacheData,
      config: {
        ttl: config.ttl,
        version: config.versioning.key
      }
    });
  } catch (error) {
    console.warn('Failed to write persistent cache to server:', error);
  }
}

/**
 * Generate hybrid cache (memory + persistent)
 */
async function generateHybridCache(
  cacheData: any,
  cacheKey: string,
  config: CacheConfig
): Promise<void> {
  // Write to memory cache
  await generateMemoryCache(cacheData, cacheKey);
  
  // Write to persistent storage
  await generatePersistentCache(cacheData, cacheKey, config);
}

/**
 * Persist cache data if persistence is enabled
 */
async function persistCache(
  cacheData: any,
  cacheKey: string,
  config: CacheConfig
): Promise<void> {
  if (!config.persistence?.enabled) return;

  const persistenceKey = config.persistence.storageKey || 'cache-store';
  const persistedData = {
    [cacheKey]: {
      ...cacheData,
      persistedAt: Date.now()
    }
  };

  await writeClientCache(persistenceKey, persistedData);
}

/**
 * Set up cache invalidation triggers
 */
function setupCacheInvalidation(cacheKey: string, config: CacheConfig): void {
  // Set up invalidation based on patterns
  if (config.invalidation.pattern) {
    // You can implement pattern-based invalidation here
    // For example, using EventSource or WebSockets
    console.log(`Cache invalidation pattern set for: ${config.invalidation.pattern}`);
  }

  // Set up automatic TTL-based invalidation
  if (config.ttl > 0) {
    setTimeout(async () => {
      await invalidateCache(cacheKey, 'ttl_expired');
    }, config.ttl * 1000);
  }
}

/**
 * Invalidate cache
 */
export async function invalidateCache(
  cacheKey: string, 
  reason: string = 'manual'
): Promise<void> {
  try {
    // Clear from client cache
    localStorage.removeItem(cacheKey);
    
    // Notify server about invalidation
    await axios.delete(`/api/cache/${cacheKey}`, {
      data: { reason }
    });

    console.log(`Cache invalidated for ${cacheKey}: ${reason}`);
  } catch (error) {
    console.error('Error invalidating cache:', error);
  }
}

/**
 * Background revalidation for stale cache
 */
async function revalidateCacheInBackground(
  cacheKey: string,
  config: CacheConfig
): Promise<void> {
  try {
    // This would typically fetch fresh data and update cache
    // For now, we'll just log it
    console.log(`Background revalidation triggered for: ${cacheKey}`);
    
    // You could implement:
    // 1. Fetch fresh data
    // 2. Update cache with new data
    // 3. Notify subscribers of update
  } catch (error) {
    console.warn('Background revalidation failed:', error);
  }
}

/**
 * Batch cache generation for multiple items
 */
export async function generateBatchCache(
  items: Array<{ key: string; data: any; config?: Partial<CacheConfig> }>,
  options?: { parallel?: boolean }
): Promise<Array<CacheGenerationResult>> {
  const results: Array<CacheGenerationResult> = [];
  const parallel = options?.parallel ?? true;

  if (parallel) {
    const promises = items.map(item =>
      generateCacheLogic({
        data: item.data,
        cacheKey: item.key,
        config: item.config
      })
    );
    
    results.push(...await Promise.all(promises));
  } else {
    for (const item of items) {
      const result = await generateCacheLogic({
        data: item.data,
        cacheKey: item.key,
        config: item.config
      });
      results.push(result);
    }
  }

  return results;
}

/**
 * Utility to clear all generated cache
 */
export async function clearAllGeneratedCache(): Promise<void> {
  try {
    // Clear all cache keys that match our pattern
    const keysToRemove: string[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('cache_') || key?.includes('generated')) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    // Clear server cache via API
    await axios.delete('/api/cache/clear-all');
    
    console.log('All generated cache cleared');
  } catch (error) {
    console.error('Error clearing all cache:', error);
  }
}