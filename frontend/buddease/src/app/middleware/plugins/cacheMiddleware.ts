import { MiddlewareFunction, MiddlewareContext } from '../types';

import { MiddlewareFunction, MiddlewareContext } from '../types';
import { ConfigurationService, type CacheConfig as AppCacheConfig } from '@/app/configs/ConfigurationService';

export interface CacheMiddlewareConfig {
  enabled: boolean;
  ttl?: number; // Time to live in milliseconds
  maxSize?: number;
  strategy?: 'lru' | 'fifo' | 'ttl';
  cacheStore?: {
    get: (key: string) => Promise<any>;
    set: (key: string, value: any, ttl?: number) => Promise<void>;
    delete: (key: string) => Promise<void>;
    clear: () => Promise<void>;
  };
  // Integration with your existing CacheConfig
  useAppConfig?: boolean;
  configService?: ConfigurationService;
}

export interface CacheEntry {
  value: any;
  timestamp: number;
  ttl?: number;
  metadata?: {
    operation: string;
    storeId?: string;
    userId?: string;
  };
}

export const createCacheMiddleware = (config: CacheMiddlewareConfig = {
  enabled: true,
  ttl: 5 * 60 * 1000, // 5 minutes default
  strategy: 'ttl',
  useAppConfig: true // Default to using app configuration
}): MiddlewareFunction => {
  // Get configuration service instance
  const configService = config.configService || ConfigurationService.getInstance();
  
  // Simple in-memory cache store with enhanced capabilities
  const cache = new Map<string, CacheEntry>();
  let cacheHits = 0;
  let cacheMisses = 0;

  // Enhanced cache store that integrates with your app's cache config
  const createCacheStore = () => {
    // Get app-level cache configuration
    const appCacheConfig = config.useAppConfig 
      ? configService.getApiConfig().cache 
      : undefined;

    const baseCacheStore = {
      get: async (key: string): Promise<any> => {
        const entry = cache.get(key);
        if (!entry) {
          cacheMisses++;
          return undefined;
        }

        // Check TTL - use app config TTL if available, otherwise use middleware config
        const ttl = appCacheConfig?.maxAge || entry.ttl || config.ttl;
        if (ttl && Date.now() - entry.timestamp > ttl) {
          cache.delete(key);
          cacheMisses++;
          return undefined;
        }

        cacheHits++;
        return entry.value;
      },

      set: async (key: string, value: any, ttl?: number): Promise<void> => {
        // Apply cache size limits
        const maxSize = config.maxSize || 1000; // Default max size
        if (cache.size >= maxSize) {
          await evictCache();
        }

        // Use TTL from app config if available, otherwise use provided TTL or config default
        const effectiveTtl = appCacheConfig?.maxAge || ttl || config.ttl;

        cache.set(key, {
          value,
          timestamp: Date.now(),
          ttl: effectiveTtl,
          metadata: {
            operation: key.split(':')[1], // Extract operation from cache key
            storeId: key.split(':')[2], // Extract store ID if available
          }
        });
      },

      delete: async (key: string): Promise<void> => {
        cache.delete(key);
      },

      clear: async (): Promise<void> => {
        cache.clear();
        cacheHits = 0;
        cacheMisses = 0;
      },

      // Additional cache metrics and management
      getStats: () => ({
        size: cache.size,
        hits: cacheHits,
        misses: cacheMisses,
        hitRate: cacheHits + cacheMisses > 0 ? (cacheHits / (cacheHits + cacheMisses)) : 0,
        maxSize: config.maxSize
      }),

      // Batch operations for efficiency
      getMultiple: async (keys: string[]): Promise<Map<string, any>> => {
        const results = new Map<string, any>();
        for (const key of keys) {
          const value = await baseCacheStore.get(key);
          if (value !== undefined) {
            results.set(key, value);
          }
        }
        return results;
      },

      setMultiple: async (entries: Map<string, any>, ttl?: number): Promise<void> => {
        for (const [key, value] of entries) {
          await baseCacheStore.set(key, value, ttl);
        }
      }
    };

    return baseCacheStore;
  };

  const cacheStore = config.cacheStore || createCacheStore();

  const evictCache = async (): Promise<void> => {
    const stats = cacheStore.getStats?.();
    
    if (config.strategy === 'lru') {
      // LRU eviction - find least recently used (simplified implementation)
      let oldestKey: string | null = null;
      let oldestTime = Date.now();
      
      for (const [key, entry] of cache.entries()) {
        if (entry.timestamp < oldestTime) {
          oldestTime = entry.timestamp;
          oldestKey = key;
        }
      }
      
      if (oldestKey) {
        await cacheStore.delete(oldestKey);
      }
    } else if (config.strategy === 'fifo') {
      // FIFO eviction - remove first inserted
      const firstKey = cache.keys().next().value;
      if (firstKey) {
        await cacheStore.delete(firstKey);
      }
    } else {
      // TTL-based eviction - remove expired entries
      const now = Date.now();
      for (const [key, entry] of cache.entries()) {
        const ttl = entry.ttl || config.ttl;
        if (ttl && now - entry.timestamp > ttl) {
          await cacheStore.delete(key);
        }
      }
    }
  };

  const generateCacheKey = (operation: string, payload: any, context: MiddlewareContext<any, any, any, any, any, any>): string => {
    const storeId = context.store?.storeId || 'global';
    const userId = context.userId || 'anonymous';
    
    // Create a stable cache key that considers the operation, payload, and context
    let payloadKey = 'null';
    if (payload) {
      try {
        // Sort object keys to ensure consistent serialization
        const sortedPayload = JSON.stringify(payload, Object.keys(payload).sort());
        payloadKey = Buffer.from(sortedPayload).toString('base64').substring(0, 50); // Limit length
      } catch {
        payloadKey = 'serialization_error';
      }
    }
    
    return `snapshot:${operation}:${storeId}:${userId}:${payloadKey}`;
  };

  // Determine if an operation should be cached
  const shouldCacheOperation = (operation: string): boolean => {
    const cacheableOperations = [
      'findSnapshot', 
      'getSnapshot', 
      'filterSnapshots', 
      'getSubscribers',
      'batchFetchSnapshots'
    ];
    
    // Check if caching is enabled at both middleware and app levels
    const appCacheConfig = config.useAppConfig 
      ? configService.getApiConfig().cache 
      : { enabled: true }; // Default to enabled if not using app config
    
    return cacheableOperations.includes(operation) && 
           config.enabled && 
           appCacheConfig.enabled !== false;
  };

  // Determine which operations should invalidate cache
  const getInvalidationPatterns = (operation: string): string[] => {
    const patterns: string[] = [];
    const basePattern = `snapshot:${operation.split('Snapshot')[0]}*`;
    
    patterns.push(basePattern);
    
    // Add specific invalidation patterns based on operation type
    if (operation.includes('add') || operation.includes('update') || operation.includes('remove')) {
      patterns.push('snapshot:findSnapshot*');
      patterns.push('snapshot:getSnapshot*');
      patterns.push('snapshot:filterSnapshots*');
    }
    
    return patterns;
  };

  return async (context, next) => {
    const { operation, payload } = context;

    if (!shouldCacheOperation(operation)) {
      return await next(context);
    }

    const cacheKey = generateCacheKey(operation, payload, context);
    
    try {
      // For read operations, try cache first
      if (operation.includes('get') || operation.includes('find') || operation.includes('filter')) {
        const cachedResult = await cacheStore.get(cacheKey);
        if (cachedResult !== undefined) {
          console.log(`[Cache Middleware] Cache hit for: ${operation}`, { 
            cacheKey,
            hitRate: cacheStore.getStats?.().hitRate 
          });
          
          context.metadata = {
            ...context.metadata,
            cache: {
              hit: true,
              key: cacheKey,
              source: 'cache',
              stats: cacheStore.getStats?.()
            }
          };
          
          return cachedResult;
        }

        console.log(`[Cache Middleware] Cache miss for: ${operation}`, { 
          cacheKey,
          hitRate: cacheStore.getStats?.().hitRate 
        });
      }

      // Execute operation
      const result = await next(context);
      
      // Cache the result for read operations
      if ((operation.includes('get') || operation.includes('find') || operation.includes('filter')) && 
          result !== undefined && result !== null) {
        
        // Get TTL from app config or use default
        const appCacheConfig = config.useAppConfig 
          ? configService.getApiConfig().cache 
          : undefined;
        
        const ttl = appCacheConfig?.maxAge || config.ttl;
        
        await cacheStore.set(cacheKey, result, ttl);
        
        context.metadata = {
          ...context.metadata,
          cache: {
            hit: false,
            key: cacheKey,
            stored: true,
            ttl: ttl,
            stats: cacheStore.getStats?.()
          }
        };
      }

      // For write operations, invalidate cache
      if (operation.includes('add') || operation.includes('update') || operation.includes('remove')) {
        const invalidationPatterns = getInvalidationPatterns(operation);
        
        for (const pattern of invalidationPatterns) {
          for (const key of cache.keys()) {
            if (key.startsWith(pattern)) {
              await cacheStore.delete(key);
              console.log(`[Cache Middleware] Invalidated cache key: ${key}`);
            }
          }
        }
        
        context.metadata = {
          ...context.metadata,
          cache: {
            invalidated: invalidationPatterns.length,
            patterns: invalidationPatterns,
            stats: cacheStore.getStats?.()
          }
        };
      }

      return result;

    } catch (error) {
      console.error(`[Cache Middleware] Cache error for ${operation}:`, error);
      
      // On cache error, proceed without cache but log the issue
      context.metadata = {
        ...context.metadata,
        cache: {
          error: error instanceof Error ? error.message : 'Cache error',
          fallback: 'direct_execution'
        }
      };
      
      return await next(context);
    }
  };
};

// Enhanced default cache middleware that integrates with your ConfigurationService
export const cacheMiddleware: MiddlewareFunction = createCacheMiddleware({
  enabled: true,
  ttl: 300000, // 5 minutes default
  maxSize: 1000,
  strategy: 'ttl',
  useAppConfig: true // Integrate with your app's cache configuration
});

// Specialized cache middleware for different scenarios
export const createPerformanceCacheMiddleware = (): MiddlewareFunction => {
  return createCacheMiddleware({
    enabled: true,
    ttl: 60000, // 1 minute for performance-critical operations
    maxSize: 500,
    strategy: 'lru',
    useAppConfig: true
  });
};

export const createPersistentCacheMiddleware = (): MiddlewareFunction => {
  return createCacheMiddleware({
    enabled: true,
    ttl: 30 * 60 * 1000, // 30 minutes for persistent caching
    maxSize: 2000,
    strategy: 'ttl',
    useAppConfig: true
  });
};