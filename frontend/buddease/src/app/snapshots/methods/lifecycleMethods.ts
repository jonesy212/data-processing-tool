// lifecycleMethods.ts
// snapshotStore/methods/LifecycleMethods.ts
import { createSnapshot } from '@//createSnapshot';
import { Content } from '@/app/components/models/content/AddContent';
import { T } from '@/app/components/models/data/dataStoreMethods';
import { NotificationType } from "@/app/context/NotificationContext";
import { Snapshots } from '@/app/snapshots/LocalStorageSnapshotStore';
import { SnapshotStoreConfig } from '@/app/snapshots/SnapshotStoreConfig';
import type {
  Category,
  CategoryProperties,
  CreateSnapshotsPayload,
  Snapshot,
  SnapshotManager,
  SnapshotStoreProps,
  SnapshotUnion,
  Subscriber,
  Subscription,
} from "@/app/types";
import { SnapshotEvent } from '@/app/typings/eventTypes';
import { isSnapshot } from '@/app/utils/snapshotUtils';
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/config/BaseConfig';
import { SnapshotConfig } from '@/SnapshotConfig';
import SnapshotStore from '@/SnapshotStore';
import { convertToSnapshotUnion } from "./ConvertSnapshotUnion";
import { SnapshotStoreReference } from "./SnapshotStoreReference";


export const LifecycleMethods = {

  // New lifecycle-specific props/methods
  set: function <
    T extends BaseDataEntity,
    K extends T = T,
    Meta = DefaultMeta<T, K>,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>
  >(
    this: SnapshotStore<T, K, Meta, ExcludedFields>,
    data: any | Map<string, any>,
    type: string,
    event: Event
  ): void | null {
    // Implementation example:
    if (data instanceof Map) {
      // Handle Map data
      data.forEach((value, key) => {
        this.setData(key, value);
      });
    } else {
      // Handle single data item
      this.setData('default', data);
    }
    return null;
  },

  setStore: function <
    T extends BaseDataEntity,
    K extends T = T,
    Meta = DefaultMeta<T, K>,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>
  >(
    this: SnapshotStore<T, K, Meta, ExcludedFields>,
    data: any | Map<string, SnapshotStore<any, any, any, any>>,
    type: string,
    event: Event
  ): void | null {
    // Implementation example:
    if (data instanceof Map) {
      // Handle multiple stores
      data.forEach((store, key) => {
        this.addNestedStore(key, store);
      });
    } else if (typeof data === 'object' && data !== null) {
      // Handle single store
      this.addNestedStore('default', data);
    }
    return null;
  },


  onSnapshot: function <T extends BaseDataEntity, K extends T = T, Meta = DefaultMeta<T, K>, ExcludedFields extends keyof T = DefaultExcludedFields<T>>(
    snapshotId: string,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    type: string,
    event: SnapshotEvent<T, K, Meta, ExcludedFields>,
    callback: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void
  ): void {
    
  },
  
  
  createSnapshots: function <
    T extends BaseDataEntity,
    K extends T = T,
    Meta = DefaultMeta<T, K>,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>
  >(
    this: SnapshotStore<T, K, Meta, ExcludedFields>,
    id: string,
    snapshotId: string | number | null,
    snapshots: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
    snapshotManager: SnapshotManager<T, K, Meta, ExcludedFields>,
    payload: CreateSnapshotsPayload<T, K, Meta, ExcludedFields>,
    callback: (snapshots: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]) => void | null,
    snapshotDataConfig?: SnapshotConfig<T, K, Meta, ExcludedFields>[],
    category?: Category,
    categoryProperties?: string | CategoryProperties
  ): Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] {
    const snapshotsArray = Array.isArray(snapshots) ? snapshots : [snapshots];

    const createdSnapshots: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] = snapshotsArray.map(
      (snapshot) => {
        // Use createSnapshotInstance to build a full snapshot
        const completeSnapshot = createSnapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>({
          baseData: snapshot.data,
          baseMeta: new Map(), // you can pass existing snapshot map if needed
          snapshotId: snapshotId ? String(snapshotId) : null,
          category,
          snapshotStore: this,
          snapshotManager,
          snapshotStoreConfig: snapshotDataConfig ? snapshotDataConfig[0] || null : null,
          isSubscribed: false,
          storeProps: this.storeProps,
          storeOptions: this.storeOptions,
        });

        return completeSnapshot;
      }
    );

    if (callback) callback(createdSnapshots);

    return createdSnapshots;
  },
  
    // INITIALIZATION & CONFIG TYPE DECLARATIONS
  initializeStores: function <
    T extends BaseDataEntity,
    K extends T = T,
    Meta = DefaultMeta<T, K>,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>
  >(
    this: SnapshotStore<T, K, Meta, ExcludedFields>,
    stores: Map<number, SnapshotStore<T, K, Meta, ExcludedFields>>
  ): void {
    // Type assertion to access protected method
    const protectedThis = this as unknown as {
      setSnapshotStores: (stores: Map<number, SnapshotStore<T, K, Meta, ExcludedFields>>) => void;
    };
    
    protectedThis.setSnapshotStores(stores);
  },

  updateState: function <
    T extends BaseDataEntity,
    K extends T = T,
    Meta = DefaultMeta<T, K>,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>
  >(
    this: SnapshotStore<T, K, Meta, ExcludedFields>,
    newState: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> & {
      isInitialized: true;
      initializedAt: Date;
      version?: string;
      initializedFrom?: "api" | "cache" | "local";
      initializationContext?: Record<string, unknown>;
    }
  ): void {
    this.states.push(newState);
    this.currentState = newState;
  },

  getCurrentState: function <
    T extends BaseDataEntity,
    K extends T = T,
    Meta = DefaultMeta<T, K>,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>
  >(this: SnapshotStore<T, K, Meta, ExcludedFields>): Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null {
    return this.currentState;
  },

  getStates: function <
    T extends BaseDataEntity,
    K extends T = T,
    Meta = DefaultMeta<T, K>,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>
  >(this: SnapshotStore<T, K, Meta, ExcludedFields>): Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] {
    return this.states;
  },

  hasSnapshots: function <
    T extends BaseDataEntity,
    K extends T = T,
    Meta = DefaultMeta<T, K>,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>
  >(this: SnapshotStore<T, K, Meta, ExcludedFields>): Promise<boolean> {
    return Promise.resolve(this.snapshots.length > 0);
  },

  equals: function <
    T extends BaseDataEntity,
    K extends T = T,
    Meta = DefaultMeta<T, K>,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>
  >(this: SnapshotStore<T, K, Meta, ExcludedFields>, otherStore: SnapshotStore<T, K, Meta, ExcludedFields>): Promise<boolean> {
    return Promise.resolve(JSON.stringify(this.snapshots) === JSON.stringify(otherStore.snapshots));
  },

  initializeWithData: function <
    T extends BaseDataEntity,
    K extends T = T,
    Meta = DefaultMeta<T, K>,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>
  >(
    this: SnapshotStore<T, K, Meta, ExcludedFields>,
    data: SnapshotUnion<T, K, Meta>[]
  ): void {
    this.snapshots = data; // initialize snapshots
  },

  addToSnapshotList: async function <
    T extends BaseDataEntity,
    K extends T = T,
    Meta = DefaultMeta<T, K>,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>
  >(
    this: SnapshotStore<T, K, Meta, ExcludedFields>,
    snapshots: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
    subscribers: Subscriber<T, K, Meta, ExcludedFields>[]
  ): Promise<Subscription<T, K, Meta, ExcludedFields>[]> {
    const results: Subscription<T, K, Meta, ExcludedFields>[] = [];
    for (const snapshot of snapshots) {
      const storeProps: SnapshotStoreProps<T, K, Meta, ExcludedFields> = {
        storeId: 123,
        name: "MyStore",
        version: "1.0.0",
        schema: {},
        options: {} as any,
        category: "example",
        config: Promise.resolve(null),
        operation: {} as any,
        expirationDate: new Date(),
        payload: { error: "", meta: {} as any },
        callback: () => {},
        storeProps: {},
        endpointCategory: "default",
        metadata: {} as any,
      };
      const result = await this.addToSnapshotList(snapshot, subscribers, storeProps);
      if (result) results.push(result);
    }
    return results;
  },

  getSnapshotsBySubscriber: async function <
    T extends BaseDataEntity,
    K extends T = T,
    Meta = DefaultMeta<T, K>,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>
  >(
    this: SnapshotStore<T, K, Meta, ExcludedFields>,
    subscriber: string
  ): Promise<any[]> {
    const snapshots = await this.getAllSnapshots?.(
      this.storeId,
      this.event,
      this.getSnapshotOptions(),
      (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => snapshot?.subscribers?.includes(subscriber)
    );
    return snapshots?.map(s => s.data) ?? [];
  },

  emit: function <
    T extends BaseDataEntity,
    K extends T = T,
    Meta = DefaultMeta<T, K>,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>
  >(
    this: SnapshotStore<T, K, Meta, ExcludedFields>,
    event: string,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshotId: string,
    subscribers: any,
    type: string,
    snapshotStore: SnapshotStore<T, K, Meta, ExcludedFields>,
    dataItems: any[],
    criteria: any,
    category?: string | symbol | Category
  ) {
    // Implementation placeholder
  },

  removeChild: function <
    T extends BaseDataEntity,
    K extends T = T,
    Meta = DefaultMeta<T, K>,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>
  >(
    this: SnapshotStore<T, K, Meta, ExcludedFields>,
    childId: string,
    parentId: string,
    parentSnapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    childSnapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ) {
    // Implementation placeholder
  },

  getChildren: function <
    T extends BaseDataEntity,
    K extends T = T,
    Meta = DefaultMeta<T, K>,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>
  >(
    this: SnapshotStore<T, K, Meta, ExcludedFields>,
    id: string,
    childSnapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ): Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] {
    return [];
  },

  hasChildren: function <
    T extends BaseDataEntity,
    K extends T = T,
    Meta = DefaultMeta<T, K>,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>
  >(this: SnapshotStore<T, K, Meta, ExcludedFields>, id: string): boolean {
    return false;
  },

  isDescendantOf: function <
    T extends BaseDataEntity,
    K extends T = T,
    Meta = DefaultMeta<T, K>,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>
  >(
    this: SnapshotStore<T, K, Meta, ExcludedFields>,
    childId: string,
    parentId: string,
    parentSnapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    childSnapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ): boolean {
    return false;
  },

  getInitialState: function <
    T extends BaseDataEntity,
    K extends T = T,
    Meta = DefaultMeta<T, K>,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>
  >(this: SnapshotStore<T, K, Meta, ExcludedFields>): Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
    return {} as Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  },

  /**
   * Get a config option by key
   */
  getConfigOption: function <
    T extends BaseDataEntity,
    K extends T = T,
    Meta = DefaultMeta<T, K>,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>
  >(this: SnapshotStore<T, K, Meta, ExcludedFields>, optionKey: string): Record<string, any> {
    return { key: optionKey, value: null }; // Placeholder logic
  },


  /**
   * Return current timestamp
   */
  getTimestamp: function <
    T extends BaseDataEntity,
    K extends T = T,
    Meta = DefaultMeta<T, K>,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>
  >(this: SnapshotStore<T, K, Meta, ExcludedFields>): Date {
    return new Date();
  },

  /**
 * Get snapshot stores by id or snapshot
 */
  getData: async function <
    T extends BaseDataEntity,
    K extends T = T,
    Meta = DefaultMeta<T, K>,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>
  >(
    this: SnapshotStore<T, K, Meta, ExcludedFields>,
    id: string | number,
    snapshot?: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ): Promise<SnapshotStore<T, K, Meta, ExcludedFields>[] | undefined> {
    const snapshotStores = this.snapshotStores;
    
    if (!snapshotStores) {
      throw new Error("No snapshot stores are initialized.");
    }

    if (snapshot) {
      const result: SnapshotStore<T, K, Meta, ExcludedFields>[] = [];
      for (const [, store] of snapshotStores) {
        if (store.snapshots.some((s: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => s.id === snapshot.id)) {
          result.push(store);
        }
      }
      return result.length ? result : undefined;
    }

    if (typeof id === "number") {
      const store = snapshotStores.get(id);
      return store ? [store] : undefined;
    }

    const matchedStores: SnapshotStore<T, K, Meta, ExcludedFields>[] = [];
    for (const store of snapshotStores.values()) {
      if (store.snapshots.some((s: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => s.id === id)) {
        matchedStores.push(store);
      }
    }

    return matchedStores.length ? matchedStores : undefined;
  },

  getStore: function <    
    T extends BaseDataEntity,
    K extends T = T,
    Meta = DefaultMeta<T, K>,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>
  >(
    this: SnapshotStore<T, K, Meta, ExcludedFields>,
    storeId: number,
    snapshotStore: SnapshotStore<T, K, Meta> | null,
    snapshotId: string | null,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null,
    snapshotStoreConfig?: SnapshotStoreConfig<T, K, Meta>,
    type?: string,
    event?: Event
  ): SnapshotStore<T, K, Meta> | null {
    if (snapshotId) {
      const existingSnapshot = this.snapshots.find((s: SnapshotUnion<T, K, Meta>) => {
        return isSnapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>(s) && s.id === snapshotId;
      });

      if (existingSnapshot) {
        if (snapshot) {
          existingSnapshot.data = snapshot.data;
          existingSnapshot.metadata = snapshot.metadata;
          existingSnapshot.category = snapshot.category;
        }

        if (snapshotStoreConfig) {
          this.config = Promise.resolve(snapshotStoreConfig);
        }

        return this;
      } else {
        if (snapshot && isSnapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>(snapshot)) {
          this.snapshots.push(convertToSnapshotUnion(snapshot));

          if (snapshotStoreConfig) {
            this.config = Promise.resolve(snapshotStoreConfig);
          }

          return this;
        }
      }
    } else {
      if (snapshotStoreConfig) {
        this.config = Promise.resolve(snapshotStoreConfig);
      }
      return this;
    }

    return null;
  },
 
  getStores: function <
  
    T extends BaseDataEntity,
    K extends T = T,
    Meta = DefaultMeta<T, K>,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>
  >(
    this: SnapshotStore<T, K, Meta>,
    storeId: number,
    snapshotStores?: SnapshotStoreReference<T, K, Meta>[] | Map<number, SnapshotStore<T, K, Meta>>,
    snapshotStoreConfigs?: SnapshotStoreConfig<T, K, Meta>[]
  ): Array<SnapshotStore<T, K, Meta>> {
    const results: Array<SnapshotStore<T, K, Meta>> = [];

    const processReference = (ref: SnapshotStoreReference<T, K, Meta>): SnapshotStore<T, K, Meta> | null => {
      try {
        if (ref instanceof SnapshotStore) return ref;
        if (typeof ref === 'string' || typeof ref === 'number') return this.#snapshotStores.get(Number(ref)) || null;
        if (ref?.storeId) return this.#snapshotStores.get(ref.storeId) || null;
        return null;
      } catch (error) {
        console.error('Error processing store reference:', error);
        return null;
      }
    };

    if (snapshotStores) {
      if (Array.isArray(snapshotStores)) {
        for (const ref of snapshotStores) {
          const store = processReference(ref);
          if (store) results.push(store);
        }
      } else if (snapshotStores instanceof Map) {
        for (const [, store] of snapshotStores) {
          if (store instanceof SnapshotStore) results.push(store);
        }
      }
    }

    if (snapshotStoreConfigs?.length) {
      for (const config of snapshotStoreConfigs) {
        if (config.storeId) {
          const store = this.#snapshotStores.get(config.storeId);
          if (store) results.push(store);
        }
      }
    }

    if (!snapshotStores && !snapshotStoreConfigs) {
      if (storeId) {
        const store = this.#snapshotStores.get(storeId);
        if (store) results.push(store);
      } else {
        for (const [, store] of this.#snapshotStores) {
          results.push(store);
        }
      }
    }

    // Deduplicate
    return results.filter(
      (store, index, self) => index === self.findIndex(s => s.storeId === store.storeId)
    );
  },

  findSnapshots: async function <
    T extends BaseDataEntity, 
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>
  >(
    this: SnapshotStore<T, K, Meta, ExcludedFields>,
    criteria?: {
      ids?: (string | number)[];
      categories?: string[];
      tags?: string[];
      status?: string[];
      createdAfter?: Date;
      createdBefore?: Date;
      updatedAfter?: Date;
      updatedBefore?: Date;
      limit?: number;
      offset?: number;
      sortBy?: 'createdAt' | 'updatedAt' | 'id' | 'category';
      sortOrder?: 'asc' | 'desc';
      // Custom filter function for complex queries
      filter?: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => boolean;
    }
  ): Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]> {
    try {
      // Validate snapshots array exists
      if (!this.snapshots || !Array.isArray(this.snapshots)) {
        return [];
      }

      let results = [...this.snapshots];

      // Apply ID filter
      if (criteria?.ids && criteria.ids.length > 0) {
        const idSet = new Set(criteria.ids.map(id => id.toString()));
        results = results.filter(snapshot => idSet.has(snapshot.id));
      }

      // Apply category filter
      if (criteria?.categories && criteria.categories.length > 0) {
        const categorySet = new Set(criteria.categories);
        results = results.filter(snapshot => 
          snapshot.category && categorySet.has(snapshot.category)
        );
      }

      // Apply tag filter
      if (criteria?.tags && criteria.tags.length > 0) {
        const tagSet = new Set(criteria.tags);
        results = results.filter(snapshot => 
          snapshot.tags && snapshot.tags.some(tag => tagSet.has(tag))
        );
      }

      // Apply status filter
      if (criteria?.status && criteria.status.length > 0) {
        const statusSet = new Set(criteria.status);
        results = results.filter(snapshot => 
          snapshot.status && statusSet.has(snapshot.status)
        );
      }

      // Apply date filters
      if (criteria?.createdAfter) {
        results = results.filter(snapshot => 
          snapshot.createdAt && new Date(snapshot.createdAt) >= criteria.createdAfter!
        );
      }

      if (criteria?.createdBefore) {
        results = results.filter(snapshot => 
          snapshot.createdAt && new Date(snapshot.createdAt) <= criteria.createdBefore!
        );
      }

      if (criteria?.updatedAfter) {
        results = results.filter(snapshot => 
          snapshot.updatedAt && new Date(snapshot.updatedAt) >= criteria.updatedAfter!
        );
      }

      if (criteria?.updatedBefore) {
        results = results.filter(snapshot => 
          snapshot.updatedAt && new Date(snapshot.updatedAt) <= criteria.updatedBefore!
        );
      }

      // Apply custom filter function
      if (criteria?.filter) {
        results = results.filter(criteria.filter);
      }

      // Apply sorting
      if (criteria?.sortBy) {
        results.sort((a, b) => {
          const order = criteria.sortOrder === 'desc' ? -1 : 1;
          
          switch (criteria.sortBy) {
            case 'createdAt':
              return order * (new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime());
            case 'updatedAt':
              return order * (new Date(a.updatedAt || 0).getTime() - new Date(b.updatedAt || 0).getTime());
            case 'id':
              return order * a.id.localeCompare(b.id);
            case 'category':
              return order * (a.category || '').localeCompare(b.category || '');
            default:
              return 0;
          }
        });
      }

      // Apply pagination
      if (criteria?.offset !== undefined) {
        results = results.slice(criteria.offset);
      }

      if (criteria?.limit !== undefined && criteria.limit > 0) {
        results = results.slice(0, criteria.limit);
      }

      return results;

    } catch (error) {
      console.error('Error finding snapshots:', error);
      throw new Error(`Failed to find snapshots: ${error instanceof Error ? error.message : String(error)}`);
    }
  },
  addStore: function <
    T extends BaseDataEntity,
    K extends T = T,
    Meta = DefaultMeta<T, K>,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>
  >(
    this: SnapshotStore<T, K, Meta, ExcludedFields>,
    storeId: number,
    snapshotId: string | null,
    snapshotStore: SnapshotStore<T, K, Meta, ExcludedFields>,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    type: string,
    event: SnapshotEvent<T, K, Meta, ExcludedFields>
  ): SnapshotStore<T, K, Meta, ExcludedFields> | null {
    try {
      // Validate input parameters
      if (!storeId || !snapshotStore || !snapshot) {
        console.warn("Invalid parameters provided to addStore");
        return null;
      }

      // Ensure stores collection exists
      if (!this.stores) {
        this.stores = new Map();
      }

      // Check if store already exists
      if (this.stores.has(storeId)) {
        console.warn(`Store with ID ${storeId} already exists. Updating instead.`);
        // Optionally update existing store or return null
        // return null; // Or update existing
      }

      // Validate the snapshot store has the required properties
      if (!snapshotStore.id || !snapshotStore.snapshotStore) {
        throw new Error("Invalid snapshot store provided");
      }

      // Add the store to the collection
      this.stores.set(storeId, snapshotStore);

      // Link snapshot to store if snapshotId provided
      if (snapshotId && snapshot) {
        if (!snapshot.associatedStores) {
          snapshot.associatedStores = new Map();
        }
        snapshot.associatedStores.set(storeId, snapshotStore);
      }

      // Update timestamps
      this.lastUpdated = new Date();
      snapshotStore.lastUpdated = this.lastUpdated;

      // Trigger event if provided
      if (event && typeof event.trigger === 'function') {
        try {
          event.trigger('store_added', {
            storeId,
            snapshotId,
            store: snapshotStore,
            snapshot,
            type,
            timestamp: this.lastUpdated
          });
        } catch (eventError) {
          console.warn('Failed to trigger store added event:', eventError);
        }
      }

      // Handle delegate if exists
      if (this.delegate && typeof this.delegate.onStoreAdded === 'function') {
        try {
          this.delegate.onStoreAdded(storeId, snapshotStore, snapshotId);
        } catch (delegateError) {
          console.warn('Delegate onStoreAdded failed:', delegateError);
        }
      }

      console.log(`Successfully added store ${storeId}`);
      return snapshotStore;

    } catch (error) {
      console.error(`Failed to add store ${storeId}:`, error);
      return null;
    }
  },

  removeStore: function <
    T extends BaseDataEntity,
    K extends T = T,
    Meta = DefaultMeta<T, K>,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>
  >(
    this: SnapshotStore<T, K, Meta, ExcludedFields>,
    storeId: number,
    store: SnapshotStore<T, K, Meta, ExcludedFields>,
    snapshotId: string,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    type: string,
    event: Event
  ): boolean {
    try {
      // Validate input parameters
      if (!storeId) {
        console.warn("Store ID is required for removal");
        return false;
      }

      // Check if stores collection exists and has the store
      if (!this.stores || !this.stores.has(storeId)) {
        console.warn(`Store with ID ${storeId} not found`);
        return false;
      }

      // Remove the store from collection
      const removed = this.stores.delete(storeId);

      if (removed) {
        // Remove store reference from snapshot if provided
        if (snapshotId && snapshot && snapshot.associatedStores) {
          snapshot.associatedStores.delete(storeId);
          
          // Clean up empty associatedStores map
          if (snapshot.associatedStores.size === 0) {
            delete snapshot.associatedStores;
          }
        }

        // Update timestamp
        this.lastUpdated = new Date();

        // Trigger event if provided
        if (event && typeof event.trigger === 'function') {
          try {
            event.trigger('store_removed', {
              storeId,
              snapshotId,
              store,
              snapshot,
              type,
              timestamp: this.lastUpdated
            });
          } catch (eventError) {
            console.warn('Failed to trigger store removed event:', eventError);
          }
        }

        // Handle delegate if exists
        if (this.delegate && typeof this.delegate.onStoreRemoved === 'function') {
          try {
            this.delegate.onStoreRemoved(storeId, snapshotId);
          } catch (delegateError) {
            console.warn('Delegate onStoreRemoved failed:', delegateError);
          }
        }

        console.log(`Successfully removed store ${storeId}`);
        return true;
      }

      return false;

    } catch (error) {
      console.error(`Failed to remove store ${storeId}:`, error);
      return false;
    }
  },

  /**
   * Subscribe to snapshot updates
   */
  onSnapshot: function <
    T extends BaseDataEntity,
    K extends T = T,
    Meta = DefaultMeta<T, K>,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>
  >(
    this: SnapshotStore<T, K, Meta, ExcludedFields>,
    snapshotId: string,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    type: string,
    event: SnapshotEvent<T, K, Meta, ExcludedFields>,
    callback: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void
  ): void {
    if (!(this as any).snapshotSubscribers) {
      (this as any).snapshotSubscribers = new Map<
        string,
        Array<(snap: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void>
      >();
    }

    if (!(this as any).snapshotSubscribers.has(snapshotId)) {
      (this as any).snapshotSubscribers.set(snapshotId, []);
    }

    (this as any).snapshotSubscribers.get(snapshotId)!.push(callback);

    callback(snapshot);

    if (event && typeof event === "object" && (event as any).type === type) {
      const subscribers = (this as any).snapshotSubscribers.get(snapshotId);
      subscribers?.forEach(cb => cb(snapshot));
    }
  },



  initializeStore: function < Tfunction extends BaseDataEntity, K extends T = T, Meta = DefaultMeta<T, K>, ExcludedFields extends keyof T = DefaultExcludedFields<T>>(
    this: SnapshotStore<T, K, Meta, ExcludedFields>,
    stores: Map<number, SnapshotStore<T, K, Meta, ExcludedFields>>
  ): void {
    // Type assertion to access protected method
    const protectedThis = this as unknown as {
      setSnapshotStores: (stores: Map<number, SnapshotStore<T, K, Meta, ExcludedFields>>) => void;
    };
    
    protectedThis.setSnapshotStores(stores);
  },

  initializeOptions: async function<
    T extends BaseDataEntity, 
    K extends T = T, 
    Meta = DefaultMeta<T, K>, 
    ExcludedFields extends keyof T = DefaultExcludedFields<T>
  >(
    this: SnapshotStore<T, K, Meta, ExcludedFields>
  ): Promise<void> {
    const config = await this.config;
    if (config?.logging) console.log('Logging is enabled for this SnapshotStore.');
    if (config?.autoSync) this.autoSyncData();
  },

  setConfigfunction: async function <T extends BaseDataEntity, K extends T = T, Meta = DefaultMeta<T, K>, ExcludedFields extends keyof T = DefaultExcludedFields<T>>(this: SnapshotStore<T, K, Meta, ExcludedFields>, config: Promise<any>): Promise<void> {
    this.config = config;
    await this.initializeOptions();
  },

  initializeDefaultConfig< Tfunction extends BaseDataEntity, K extends T = T, Meta = DefaultMeta<T, K>, ExcludedFields extends keyof T = DefaultExcludedFields<T>>(this: SnapshotStore<T, K, Meta, ExcludedFields>): any[] {
    return [
      {
        id: "default",
        autoSave: true,
        syncInterval: 300000,
        snapshotLimit: 100,
        additionalSetting: "default-setting",
        find: this.find,
        storeId: this.storeId,
        operation: this.operation,
        data: this.data ?? undefined,
        createdAt: this.createdAt,
        initialState: this.initialState,
        timestamp: this.timestamp,
        snapshotId: this.snapshotId,
        snapshotStore: this.snapshotStore ?? null,
        dataStoreMethods: this.dataStoreMethods || null,
        category: this.category,
        criteria: this.criteria,
        content: this.content,
        config: this.config,
        snapshotCategory: this.snapshotCategory,
        snapshotSubscriberId: this.snapshotSubscriberId,
      },
    ];
  },

  ensureDelegate: function < Tfunction extends BaseDataEntity, K extends T = T, Meta = DefaultMeta<T, K>, ExcludedFields extends keyof T = DefaultExcludedFields<T>>(this: SnapshotStore<T, K, Meta, ExcludedFields>): any {
    if (!this.delegate || this.delegate.length === 0) {
      throw new Error("Delegate is not defined or is empty.");
    }
    return this.delegate[0];
  },


  /**
   * Default subscription handler for snapshots
   */
  defaultSubscribeToSnapshots: function <U, K, Meta>(
    snapshotId: string,
    callback: (snaps: Snapshots<U, K, Meta>) => Subscriber<U, K> | null,
    snapshot: Snapshot<U, K> | null
  ): void {
    throw new Error("defaultSubscribeToSnapshots is not implemented.");
  },

  /**
   * Notify lifecycle event to store or external subscribers
   */
  notify: function <U, K>(
    id: string,
    message: string,
    content: Content<U, K>,
    data: any,
    date: Date,
    type: NotificationType
  ): void {
    throw new Error("notify is not implemented.");
  },


  /**
   * Get subscribers tied to a snapshot set
   */
  getSubscribers: async function <U, K, Meta>(
    subscribers: Subscriber<U, K>[],
    snapshots: Snapshots<U, K, Meta>
  ): Promise<{ subscribers: Subscriber<U, K>[]; snapshots: Snapshots<U, K, Meta> }> {
    throw new Error("getSubscribers is not implemented.");
  },
};