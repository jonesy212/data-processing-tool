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
