// IndexedDBRepository.ts
app/repositories/IndexedDBRepository.ts
import { DomainObject } from '@/core/typings/DomainObject';

export class IndexedDBRepository {
  private dbName: string;
  private version: number;
  private db: IDBDatabase | null = null;

  constructor(databaseName: string = 'local_sync_db', version: number = 1) {
    this.dbName = databaseName;
    this.version = version;
  }

  private async initDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      if (this.db) {
        resolve(this.db);
        return;
      }

      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create object stores
        if (!db.objectStoreNames.contains('domain_objects')) {
          const store = db.createObjectStore('domain_objects', { keyPath: 'id' });
          store.createIndex('type', 'type', { unique: false });
          store.createIndex('queuedForSync', 'metadata.queuedForSync', { unique: false });
          store.createIndex('synced', 'metadata.synced', { unique: false });
          store.createIndex('createdAt', 'createdAt', { unique: false });
          store.createIndex('updatedAt', 'updatedAt', { unique: false });
        }
      };
    });
  }

  async save(entity: DomainObject): Promise<void> {
    const db = await this.initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['domain_objects'], 'readwrite');
      const store = transaction.objectStore('domain_objects');
      
      const enrichedEntity = {
        ...entity,
        metadata: {
          ...entity.metadata,
          lastUpdated: new Date().toISOString(),
          synced: entity.metadata?.synced || false
        }
      };

      const request = store.put(enrichedEntity);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async get(id: string): Promise<DomainObject | null> {
    const db = await this.initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['domain_objects'], 'readonly');
      const store = transaction.objectStore('domain_objects');
      
      const request = store.get(id);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        resolve(request.result || null);
      };
    });
  }

  async getAll(filter?: { type?: string; synced?: boolean }): Promise<DomainObject[]> {
    const db = await this.initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['domain_objects'], 'readonly');
      const store = transaction.objectStore('domain_objects');
      
      let index: IDBIndex;
      if (filter?.type) {
        index = store.index('type');
      } else if (filter?.synced !== undefined) {
        index = store.index('synced');
      } else {
        index = store.index('createdAt');
      }

      const request = index.getAll();
      let results: DomainObject[] = [];
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        results = request.result;
        
        // Apply additional filters
        if (filter?.type) {
          results = results.filter(entity => entity.type === filter.type);
        }
        if (filter?.synced !== undefined) {
          results = results.filter(entity => entity.metadata?.synced === filter.synced);
        }
        
        // Sort by updatedAt desc
        results.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        
        resolve(results);
      };
    });
  }

  async markSynced(id: string): Promise<void> {
    const entity = await this.get(id);
    if (!entity) throw new Error(`Entity ${id} not found`);
    
    await this.save({
      ...entity,
      metadata: {
        ...entity.metadata,
        synced: true,
        queuedForSync: false,
        syncError: undefined,
        lastSyncAttempt: new Date()
      }
    });
  }

  async queueForSync(entity: DomainObject): Promise<void> {
    await this.save({
      ...entity,
      metadata: {
        ...entity.metadata,
        queuedForSync: true,
        synced: false,
        lastSyncAttempt: new Date()
      }
    });
  }

  async getQueuedChanges(): Promise<DomainObject[]> {
    return this.getAll({ synced: false });
  }

  async delete(id: string): Promise<void> {
    const db = await this.initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['domain_objects'], 'readwrite');
      const store = transaction.objectStore('domain_objects');
      
      const request = store.delete(id);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async clear(): Promise<void> {
    const db = await this.initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['domain_objects'], 'readwrite');
      const store = transaction.objectStore('domain_objects');
      
      const request = store.clear();
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async close(): Promise<void> {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }

  async count(filter?: { type?: string }): Promise<number> {
    const allData = await this.getAll(filter);
    return allData.length;
  }
}