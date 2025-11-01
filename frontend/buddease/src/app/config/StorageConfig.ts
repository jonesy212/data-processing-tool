
export interface StorageConfig {
  type: 'localStorage' | 'sessionStorage' | 'indexedDB' | 'custom';
  prefix: string;
  encryption: {
    enabled: boolean;
    algorithm?: string;
    key?: string;
  };
  quota: {
    maxSize: number;
    warningThreshold: number;
  };
  migration: {
    autoMigrate: boolean;
    version: string;
  };
  backup: {
    enabled: boolean;
    interval: number;
  };
}

export interface CacheConfig {
  strategy: 'memory' | 'persistent' | 'hybrid';
  ttl: number;
  maxSize: number;
  staleWhileRevalidate: boolean;
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

export interface LoggingConfig {
  level: 'error' | 'warn' | 'info' | 'debug' | 'trace';
  transport: 'console' | 'remote' | 'both';
  remote?: {
    endpoint: string;
    batchSize: number;
    flushInterval: number;
  };
  context: {
    includeUser: boolean;
    includeSession: boolean;
    includeEnvironment: boolean;
  };
  retention: {
    maxAge: number;
    maxEntries: number;
  };
  filters?: {
    excludePatterns: string[];
    includeOnly: string[];
  };
}
