// InternalCache.ts
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { Attachment } from '@/app/documents/attachment/Attachment';
import type {  Snapshot } from '@/app/snapshots/Snapshot';
import { AppAttachment, AppEntity, AppExcludedFields, AppIncludedFields, AppK, AppMeta } from '@/app/typings/entities/AppEntity';
class InternalCache<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {
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
  Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>
>();


// Option 1: For direct Snapshot storage (recommended for most cases)
export const snapshotCache = new InternalCache<
  Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>
>();

// Option 2: For Promise storage (if you need async cache operations)
export const promiseSnapshotCache = new InternalCache<
  Promise<Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>>
>();


// Example methods using the cache instance
const cacheOperations = {
  // For direct Snapshot storage
  getSnapshot: (id: string): Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields> | undefined => {
    return snapshotCache.get(id);
  },

  addSnapshot: (id: string, snapshot: Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>): void => {
    snapshotCache.set(id, snapshot);
  },

  // For Promise storage
  getPromiseSnapshot: (id: string): Promise<Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields> | undefined> => {
    const cachedPromise = promiseSnapshotCache.get(id);
    if (!cachedPromise) {
      return Promise.resolve(undefined);
    }
    return cachedPromise;
  },

  addPromiseSnapshot: (id: string, promise: Promise<Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>>): void => {
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
