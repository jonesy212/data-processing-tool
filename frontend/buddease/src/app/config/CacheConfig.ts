// CacheConfig.ts

interface BaseCacheConfig {
  maxAge?: string | number;
  staleWhileRevalidate?: number;
}

export interface CacheConfig extends BaseCacheConfig {
  enabled: boolean;
  maxAge: number; // Required and specific type
  staleWhileRevalidate: number; // Required and specific type
  cacheKey: string;
  strategy: 'memory' | 'persistent' | 'hybrid';
  ttl: number;
  versioning: {
    enabled: boolean;
    key: string;
  };
  invalidation: {
    onUpdate: boolean;
    onDelete: boolean;
    pattern?: string;
  };
  persistence?: {
    enabled: boolean;
    storageKey: string;
    autoRehydrate: boolean;
  };
}
