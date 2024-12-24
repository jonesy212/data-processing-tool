// InternalCache.ts
import { T , K, Meta } from "@/app/components/models/data/dataStoreMethods";
import { Snapshot } from "@/app/components/snapshots/LocalStorageSnapshotStore";

class InternalCache<T> {
  private cache: Map<string, T>;

  constructor() {
    this.cache = new Map<string, T>();
  }

  // Fetch an item from the internal cache based on an ID
  get(id: string): T | undefined {
    return this.cache.get(id);
  }

  // Add or update an item in the internal cache
  set(id: string, value: T): void {
    this.cache.set(id, value);
  }

  // Remove an item from the internal cache by ID
  remove(id: string): void {
    this.cache.delete(id);
  }

  // Clear all items from the internal cache
  clear(): void {
    this.cache.clear();
  }
}


// Create a cache instance for your data type (e.g., BaseData)
export const internalCache = new InternalCache<Promise<Snapshot<T, K<T>>>>();

// Example methods using the cache instance
const cacheOperations = {
  // Fetch an item from internal cache based on an ID
  getFromInternalCache: (id: string): Promise<Snapshot<T, K<T>>> | undefined => {
    return internalCache.get(id);
  },

  // Add an item to the internal cache
  addToInternalCache: (id: string, item: Promise<Snapshot<T, K<T>>>): void => {
    internalCache.set(id, item);
  },

  // Remove an item from internal cache by ID
  removeFromInternalCache: (id: string): void => {
    internalCache.remove(id);
  },

  // Clear all items from internal cache
  clearInternalCache: (): void => {
    internalCache.clear();
  },
};
