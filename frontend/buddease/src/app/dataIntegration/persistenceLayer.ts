// persistenceLayer.ts
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { Attachment } from '@/app/documents/attachment/Attachment';
import type {  Snapshot } from '@/app/snapshots/Snapshot';
import { CacheProxyConfig, PersistenceAdapter, PersistenceConfig } from '@/app/typings/persistenceTypes';


// Adapters
export class LocalStorageAdapter implements PersistenceAdapter {
  private namespace: string;

  constructor(namespace: string = 'snapshot-store') {
    this.namespace = namespace;
  }

  async initialize(): Promise<void> {
    // Local storage is always available in browser
  }

  async save<T>(key: string, data: T): Promise<void> {
    const storageKey = `${this.namespace}:${key}`;
    localStorage.setItem(storageKey, JSON.stringify(data));
  }

  async load<T>(key: string): Promise<T | null> {
    const storageKey = `${this.namespace}:${key}`;
    const data = localStorage.getItem(storageKey);
    return data ? JSON.parse(data) : null;
  }

  async remove(key: string): Promise<void> {
    const storageKey = `${this.namespace}:${key}`;
    localStorage.removeItem(storageKey);
  }

  async clear(): Promise<void> {
    const keys = Object.keys(localStorage).filter(key => 
      key.startsWith(`${this.namespace}:`)
    );
    keys.forEach(key => localStorage.removeItem(key));
  }

  async getAllKeys(): Promise<string[]> {
    return Object.keys(localStorage).filter(key => 
      key.startsWith(`${this.namespace}:`)
    ).map(key => key.replace(`${this.namespace}:`, ''));
  }
}

export class MemoryAdapter implements PersistenceAdapter {
  private storage = new Map<string, any>();

  async initialize(): Promise<void> {
    // Memory storage is always ready
  }

  async save<T>(key: string, data: T): Promise<void> {
    this.storage.set(key, data);
  }

  async load<T>(key: string): Promise<T | null> {
    return this.storage.get(key) || null;
  }

  async remove(key: string): Promise<void> {
    this.storage.delete(key);
  }

  async clear(): Promise<void> {
    this.storage.clear();
  }

  async getAllKeys(): Promise<string[]> {
    return Array.from(this.storage.keys());
  }
}

// Cache Management
export const createCacheProxy = <T>(
  data: T, 
  config: CacheProxyConfig
): T => {
  const cache = new Map<string, { value: any; timestamp: number }>();
  
  return new Proxy(data as any, {
    get(target, prop) {
      const key = String(prop);
      const cached = cache.get(key);
      
      if (cached && Date.now() - cached.timestamp < config.maxAge) {
        return cached.value;
      }
      
      const value = target[prop];
      cache.set(key, { value, timestamp: Date.now() });
      return value;
    }
  });
};

export const createImmutableProxy = <T>(data: T): T => {
  return new Proxy(data as any, {
    set() {
      throw new Error('Cannot modify immutable data');
    },
    deleteProperty() {
      throw new Error('Cannot delete from immutable data');
    }
  });
};

// Data Transformation
export const transformDataForStorage = <T>(data: T): string => {
  // Add any data transformation logic here (encryption, compression, etc.)
  return JSON.stringify(data);
};

export const transformDataFromStorage = <T>(data: string): T => {
  // Reverse transformation logic
  return JSON.parse(data);
};

// Main Persistence Service
export class PersistenceLayer<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {
  private adapter: PersistenceAdapter;
  private cache = new Map<string, { data: any; timestamp: number }>();
  private cacheConfig: CacheProxyConfig;

  constructor(adapter: PersistenceAdapter, cacheConfig: CacheProxyConfig = { maxAge: 300000, strategy: 'lazy' }) {
    this.adapter = adapter;
    this.cacheConfig = cacheConfig;
  }

  async initialize(): Promise<void> {
    await this.adapter.initialize();
  }

  async saveSnapshot(snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): Promise<void> {
    const key = `snapshot:${snapshot.id}`;
    const transformedData = transformDataForStorage(snapshot);
    
    await this.adapter.save(key, transformedData);
    
    // Update cache
    this.cache.set(key, { 
      data: createCacheProxy(snapshot, this.cacheConfig), 
      timestamp: Date.now() 
    });
  }

  async loadSnapshot(snapshotId: string): Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null> {
    const key = `snapshot:${snapshotId}`;
    
    // Check cache first
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheConfig.maxAge) {
      return cached.data;
    }
    
    // Load from persistence
    const data = await this.adapter.load(key);
    if (!data) return null;
    
    const snapshot = transformDataFromStorage(data);
    const cachedSnapshot = createCacheProxy(snapshot, this.cacheConfig);
    
    // Update cache
    this.cache.set(key, { data: cachedSnapshot, timestamp: Date.now() });
    
    return cachedSnapshot;
  }

  async removeSnapshot(snapshotId: string): Promise<void> {
    const key = `snapshot:${snapshotId}`;
    await this.adapter.remove(key);
    this.cache.delete(key);
  }

  async clearSnapshots(): Promise<void> {
    const keys = await this.adapter.getAllKeys();
    const snapshotKeys = keys.filter(key => key.startsWith('snapshot:'));
    
    await Promise.all(snapshotKeys.map(key => this.adapter.remove(key)));
    snapshotKeys.forEach(key => this.cache.delete(key));
  }

  async getAllSnapshotIds(): Promise<string[]> {
    const keys = await this.adapter.getAllKeys();
    return keys
      .filter(key => key.startsWith('snapshot:'))
      .map(key => key.replace('snapshot:', ''));
  }

  async resetPersistence(): Promise<void> {
    await this.adapter.clear();
    this.cache.clear();
  }

  // Memory management
  clearCache(): void {
    this.cache.clear();
  }

  getCacheStats(): { size: number; hits: number } {
    return {
      size: this.cache.size,
      hits: 0 // You could implement hit tracking if needed
    };
  }
}

// Factory function
export const createPersistenceAdapter = (strategy: string, config?: PersistenceConfig): PersistenceAdapter => {
  switch (strategy) {
    case 'localStorage':
      return new LocalStorageAdapter(config?.namespace);
    case 'memory':
      return new MemoryAdapter();
    case 'indexedDB':
      // You could implement IndexedDB adapter here
      throw new Error('IndexedDB adapter not implemented');
    default:
      throw new Error(`Unknown persistence strategy: ${strategy}`);
  }
};

// Hook for React components
export const usePersistenceLayer = <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(adapter: PersistenceAdapter, cacheConfig?: CacheProxyConfig) => {
  const persistenceLayer = new PersistenceLayer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>(
    adapter, 
    cacheConfig
  );

  return {
    persistenceLayer,
    saveSnapshot: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => 
      persistenceLayer.saveSnapshot(snapshot),
    loadSnapshot: (snapshotId: string) => persistenceLayer.loadSnapshot(snapshotId),
    removeSnapshot: (snapshotId: string) => persistenceLayer.removeSnapshot(snapshotId),
    clearSnapshots: () => persistenceLayer.clearSnapshots(),
    resetPersistence: () => persistenceLayer.resetPersistence(),
    clearCache: () => persistenceLayer.clearCache(),
    getCacheStats: () => persistenceLayer.getCacheStats(),
  };
};

export type PersistenceLayerHook = ReturnType<typeof usePersistenceLayer>;