BackendConfig.ts
import { ApiConfig } from '@/core/api/ApiConfigService';
import { CacheConfig } from "@/core/config/CacheConfig";
import { RetryConfig } from "@/core/services/ConfigurationService";



const normalizeCacheKey = (
  cacheKey: string | ((...args: any[]) => string),
  ...args: any[]
): string => {
  if (typeof cacheKey === 'function') {
    return cacheKey(...args);
  }
  return cacheKey;
};
// Helper constants for cache timing (in milliseconds)
const CACHE_TIMING = {
  FIVE_MINUTES: 5 * 60 * 1000,    // 300000
  TEN_MINUTES: 10 * 60 * 1000,    // 600000
  FIFTEEN_MINUTES: 15 * 60 * 1000, // 900000
  THIRTY_MINUTES: 30 * 60 * 1000,  // 1800000
  ONE_HOUR: 60 * 60 * 1000,        // 3600000
} as const;

// Default cache configurations for different use cases
const DEFAULT_CACHE_CONFIGS = {
  API: {
    enabled: true,
    maxAge: CACHE_TIMING.FIVE_MINUTES,        // 5 minutes
    staleWhileRevalidate: 60000,              // 1 minute
    strategy: 'memory' as const,
    ttl: CACHE_TIMING.TEN_MINUTES,            // 10 minutes (fixed from 0)
    versioning: { 
      enabled: true, 
      key: 'api:v1',                         // Fixed: added meaningful key
    },
    invalidation: { 
      onUpdate: true,                         // Fixed: true for better cache management
      onDelete: true,                         // Fixed: true for better cache management
      pattern: 'api:*',                       // Fixed: added pattern
    },
    persistence: {                            // Added: missing from original
      enabled: false,
      storageKey: 'api_cache',
      autoRehydrate: false,
    },
  },
  BACKEND: {
    enabled: true,
    maxAge: CACHE_TIMING.FIFTEEN_MINUTES,     // 15 minutes
    staleWhileRevalidate: CACHE_TIMING.FIVE_MINUTES, // 5 minutes
    strategy: 'hybrid' as const,              // Changed: 'hybrid' for backend
    ttl: CACHE_TIMING.THIRTY_MINUTES,         // 30 minutes (fixed from 0)
    versioning: { 
      enabled: true, 
      key: 'backend:v1',                      // Fixed: added meaningful key
    },
    invalidation: { 
      onUpdate: true,                         // Fixed: true
      onDelete: true,                         // Fixed: true
      pattern: 'backend:*',                   // Fixed: added pattern
    },
    persistence: {                            // Added: missing from original
      enabled: true,                          // Backend cache should persist
      storageKey: 'backend_cache',
      autoRehydrate: true,
    },
  },
} as const;

export interface BackendConfig {
  appName: string;
  appVersion: string;
  versionNumber: string; 
  apiConfig: ApiConfig;
  retryConfig: RetryConfig;
  cacheConfig: CacheConfig;
  backendSpecificProperty: string;
}

const defaultApiConfig: ApiConfig = {
  baseURL: "https://api.example.com",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    Authorization: "Bearer your-access-token",
  },
  retry: {
    enabled: true,
    maxRetries: 3,
    retryDelay: 1000,
  },
  cache: {
    enabled: DEFAULT_CACHE_CONFIGS.API.enabled,
    maxAge: DEFAULT_CACHE_CONFIGS.API.maxAge,
    staleWhileRevalidate: DEFAULT_CACHE_CONFIGS.API.staleWhileRevalidate,
    strategy: DEFAULT_CACHE_CONFIGS.API.strategy,
    ttl: DEFAULT_CACHE_CONFIGS.API.ttl,
    versioning: DEFAULT_CACHE_CONFIGS.API.versioning,
    invalidation: DEFAULT_CACHE_CONFIGS.API.invalidation,
    persistence: DEFAULT_CACHE_CONFIGS.API.persistence,
    cacheKey: (endpoint: string, params?: any) => 
      `api:${endpoint}:${JSON.stringify(params || {})}`, // Dynamic cache key
  },
  responseType: { contentType: "json", encoding: "string" },
  withCredentials: true,
  onLoad: (response) => console.log("Script loaded successfully", response)
};

const backendConfig: BackendConfig = {
  appName: process.env.BACKEND_APP_NAME || "YourBackendAppName",
  appVersion: "1.0.0",
  apiConfig: defaultApiConfig,
  versionNumber: "1",
  retryConfig: {
    enabled: true,
    maxRetries: parseInt(process.env.BACKEND_RETRY_MAX_RETRIES ?? "3"),
    retryDelay: parseInt(process.env.BACKEND_RETRY_DELAY ?? "1000"),
  },
  cacheConfig: {
    enabled: DEFAULT_CACHE_CONFIGS.BACKEND.enabled,
    maxAge: DEFAULT_CACHE_CONFIGS.BACKEND.maxAge,
    staleWhileRevalidate: parseInt(
      process.env.BACKEND_CACHE_STALE_WHILE_REVALIDATE ?? 
      DEFAULT_CACHE_CONFIGS.BACKEND.staleWhileRevalidate.toString()
    ),
    strategy: DEFAULT_CACHE_CONFIGS.BACKEND.strategy,
    ttl: DEFAULT_CACHE_CONFIGS.BACKEND.ttl,
    versioning: DEFAULT_CACHE_CONFIGS.BACKEND.versioning,
    invalidation: DEFAULT_CACHE_CONFIGS.BACKEND.invalidation,
    persistence: DEFAULT_CACHE_CONFIGS.BACKEND.persistence,
    cacheKey: (operation: string, params?: any) => 
      `backend:${operation}:${JSON.stringify(params || {})}`, // Dynamic cache key
  },
  backendSpecificProperty: "YourBackendSpecificValue",
};

export { backendConfig };

// Optional: Export the cache constants for reuse elsewhere
    export { CACHE_TIMING, DEFAULT_CACHE_CONFIGS, normalizeCacheKey };
