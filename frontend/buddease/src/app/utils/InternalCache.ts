// InternalCache.ts
import { T , K, Meta } from "@/app/components/models/data/dataStoreMethods";
import { Snapshot } from "@/app/components/snapshots/LocalStorageSnapshotStore";
import { ExcludedFields } from "../components/routing/Fields";
import { StructuredMetadata } from "../configs/StructuredMetadata";

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
// 1. First define your cache with proper generic parameters
export const internalCache = new InternalCache<
  Snapshot<T, K<T>, StructuredMetadata<T, K<T>>, keyof T>
>();


// Option 1: For direct Snapshot storage (recommended for most cases)
export const snapshotCache = new InternalCache<
  Snapshot<T, K<T>, StructuredMetadata<T, K<T>>, keyof T>
>();

// Option 2: For Promise storage (if you need async cache operations)
export const promiseSnapshotCache = new InternalCache<
  Promise<Snapshot<T, K<T>, StructuredMetadata<T, K<T>>, keyof T>>
>();


// Example methods using the cache instance
const cacheOperations = {
  // For direct Snapshot storage
  getSnapshot: (id: string): Snapshot<T, K<T>, StructuredMetadata<T, K<T>>, keyof T> | undefined => {
    return snapshotCache.get(id);
  },

  addSnapshot: (id: string, snapshot: Snapshot<T, K<T>, StructuredMetadata<T, K<T>>, keyof T>): void => {
    snapshotCache.set(id, snapshot);
  },

  // For Promise storage
  getPromiseSnapshot: (id: string): Promise<Snapshot<T, K<T>, StructuredMetadata<T, K<T>>, keyof T> | undefined> => {
    const cachedPromise = promiseSnapshotCache.get(id);
    if (!cachedPromise) {
      return Promise.resolve(undefined);
    }
    return cachedPromise;
  },

  addPromiseSnapshot: (id: string, promise: Promise<Snapshot<T, K<T>, StructuredMetadata<T, K<T>>, keyof T>>): void => {
    promiseSnapshotCache.set(id, promise);
  },

  // Common operations
  remove: (id: string): void => {
    snapshotCache.remove(id);
    promiseSnapshotCache.remove(id);
  },

  clear: (): void => {
    snapshotCache.clear();
    promiseSnapshotCache.clear();
  }
};
