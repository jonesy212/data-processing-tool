// lifecycleMethods.ts
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import { Attachment } from '@/core/documents/attachment/Attachment';
import { NotificationType } from '@/core/features/support/UnifiedNotificationTypes';
import { SnapshotManager } from '@/core/hooks/useSnapshotManager';
import { Category } from "@/core/libraries/categories/generateCategoryProperties";
import { Content } from '@/core/models/content/AddContent';
import { CategoryProperties } from "@/core/pages/personas/ScenarioBuilder";
import { convertToSnapshotUnion } from "@/core/snapshots/ConvertSnapshotUnion";
import { createSnapshot } from '@/core/snapshots/createSnapshot';
import { Snapshots } from '@/core/snapshots/LocalStorageSnapshotStore';
import type { Snapshot } from '@/core/snapshots/Snapshot';
import { SnapshotConfig } from '@/core/snapshots/SnapshotConfig';
import SnapshotStore from '@/core/snapshots/SnapshotStore';
import { SnapshotStoreConfig } from '@/core/snapshots/SnapshotStoreConfig';
import { SnapshotStoreReference } from "@/core/snapshots/SnapshotStoreReference";
import { Subscriber } from "@/core/subscribers/Subscriber";
import { SnapshotEvent } from '@/core/typings/snapshotTypes';
import { isSnapshot } from '@/utils/snapshotUtils';
;

// Add these imports that were missing
import { snapshotApi } from '@/core/api/SnapshotApi';
import UniqueIDGenerator from '@/core/generators/GenerateUniqueIds';
import { CreateSnapshotsPayload } from '@/core/interfaces/payload/payloadTypes';
import { Data } from '@/core/models/data/Data';
import { SnapshotData } from '@/core/snapshots/SnapshotData';
import { SnapshotWithCriteriaAsBase } from '@/core/snapshots/SnapshotStoreOptions';

// -------------------------------
// Lifecycle Methods
// -------------------------------

export const LifecycleMethods = {

  // ---------- Initialization Methods ----------

  initSnapshot: function <
    T extends BaseDataEntity,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T
  >(
    this: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshot: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null,
    snapshotId: string,
    snapshotData: SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    categoryProperties: CategoryProperties | undefined,
    snapshotConfig: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    callback: (snapshotStore: SnapshotStore<any, any>) => void,
    category?: Category
  ): void {
    this.executeDelegateMethod(
      'initSnapshot',
      snapshot,
      snapshotId,
      snapshotData,
      category,
      snapshotConfig,
      callback
    );
  },

  createInitSnapshot: function <
    T extends BaseDataEntity,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T
  >(
    this: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    id: string,
    initialData: T,
    snapshotData: SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    category: symbol | string | Category | undefined
  ): Promise<SnapshotWithCriteriaAsBase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> {
    return new Promise(async (resolve, reject) => {
      try {
        if (!snapshotData) {
          return reject(new Error("snapshotData is null or undefined"));
        }

        let data: Data<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
        if ("data" in snapshotData && snapshotData.data) {
          data = snapshotData.data as Data<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
        } else if (snapshotData.data && "data" in snapshotData.data) {
          data = (snapshotData.data as any).data;
        } else {
          return reject(new Error("snapshotData does not have a valid 'data' property"));
        }

        const snapshotId = typeof data.id === "string"
          ? data.id
          : String(
              UniqueIDGenerator.generateID(
                "SNAP",
                "defaultID",
                NotificationTypeEnum.GENERATED_ID
              )
            );

        const snapshot: SnapshotWithCriteriaAsBase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = {
          id: snapshotId,
          data,
          timestamp: snapshotData.timestamp || new Date(),
          category: this.category,
          topic: this.topic,
          initializedState: {},
          criteria: {},
          unsubscribe: function () {
            throw new Error("Function not implemented.");
          },
          fetchSnapshot: async () => {
            throw new Error("Function not implemented.");
          },
          handleSnapshot: async () => {
            throw new Error("Function not implemented.");
          },
          events: undefined,
          meta: {},
        } as SnapshotWithCriteriaAsBase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;

        const storeId = snapshotApi.getSnapshotStoreId(String(this.snapshotId));
        const snapshotManager = useSnapshotManager<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>(await storeId, storeProps);

        this.snapshots.push(snapshot as any);

        // FIX: Use this.delegate instead of this.executeDelegateMethodAsync
        if (this.delegate && this.delegate.length > 0) {
          for (const delegateConfig of this.delegate) {
            if (delegateConfig && typeof delegateConfig.createSnapshotSuccess === "function") {
              await delegateConfig.createSnapshotSuccess(
                id,
                snapshotManager,
                snapshot,
                initialData
              );
              return resolve(snapshot);
            }
          }
          return reject(new Error("No valid delegate found for createSnapshotSuccess")); // Fixed error message
        } else {
          return reject(new Error("Delegate is undefined or empty"));
        }
      } catch (error) {
        reject(error);
      }
    });
  },

  // ---------- CRUD Operations ----------

  deleteSnapshot: function <
    T extends BaseDataEntity,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T
  >(
    this: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshotId: string,
    permanent: boolean = false
  ): Promise<boolean> {
    return new Promise((resolve, reject) => {
      try {
        if (!snapshotId) {
          throw new Error('Snapshot ID is required');
        }

        // Find the snapshot in storage
        const snapshot = this.snapshots.find(s => s.id === snapshotId);
        if (!snapshot) {
          resolve(false);
          return;
        }

        if (permanent) {
          // Permanent deletion
          this.snapshots = this.snapshots.filter(s => s.id !== snapshotId);
          this.deletedSnapshots.delete(snapshotId);
          
          // Notify subscribers
          this.notifySubscribers({
            type: 'delete',
            snapshotId,
            permanent: true
          } as any);

          resolve(true);
        } else {
          // Soft deletion
          (snapshot as any).deleted = true;
          (snapshot as any).updatedAt = new Date();
          this.deletedSnapshots.add(snapshotId);

          // Mark versions as deleted
          if ((snapshot as any).versions) {
            (snapshot as any).versions.forEach((version: any) => {
              version.deleted = true;
            });
          }

          // Notify subscribers
          this.notifySubscribers({
            type: 'delete',
            snapshotId,
            permanent: false
          } as any);

          resolve(true);
        }
      } catch (error) {
        console.error(`Error deleting snapshot ${snapshotId}:`, error);
        reject(error);
      }
    });
  },

  createSnapshots: async function <
    T extends BaseDataEntity,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T
  >(
    this: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    id: string,
    snapshotId: string | number | null,
    snapshots: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
    snapshotManager: SnapshotManager<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    payload: CreateSnapshotsPayload<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    callback: (snapshots: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]) => void | null,
    snapshotDataConfig?: SnapshotConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
    category?: Category,
    categoryProperties?: CategoryProperties
  ): Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]> {
    const snapshotsArray = Array.isArray(snapshots) ? snapshots : [snapshots];

    // Use Promise.all to wait for all async createSnapshot calls
    const createdSnapshotsPromises = snapshotsArray.map(
      async (snapshot) => {
        const completeSnapshot = await createSnapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>(
          snapshot.data, // baseData
          new Map(), // baseMeta
          snapshotId ? String(snapshotId) : null, // snapshotId
          this, // snapshotStore
          snapshotManager, // snapshotManager
          snapshotDataConfig ? snapshotDataConfig[0] || null : null, // snapshotStoreConfig
          false, // isSubscribed
          category, // category
          this.getStoreProps(), // storeProps
          this.storeOptions, // storeOptions
          categoryProperties, // categoryProperties
          undefined, // dataStore (optional)
          undefined, // dataStoreMethods (optional)
          undefined, // metadata (optional)
          undefined, // subscriberId (optional)
          undefined, // endpointCategory (optional)
          undefined, // subscription (optional)
          undefined, // snapshotConfigData (optional)
          undefined // snapshotContainer (optional)
        );

        return completeSnapshot;
      }
    );

    // Wait for all promises to resolve
    const createdSnapshots = await Promise.all(createdSnapshotsPromises);

    if (callback) callback(createdSnapshots);

    return createdSnapshots;
  },
  
  // ---------- State Management ----------

  set: function <
    T extends BaseDataEntity,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T
  >(
    this: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    data: any | Map<string, any>,
    type: string,
    event: Event
  ): void | null {
    if (data instanceof Map) {
      data.forEach((value, key) => {
        this.setData(key, value);
      });
    } else {
      this.setData('default', data);
    }
    return null;
  },

  addNestedStore: function <
    T extends BaseDataEntity,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T
  >(
    this: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    key: string,
    store: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ): void {
    // Implementation of addNestedStore
    if (!this.getNestedStores) {
      this.getNestedStores = [];
    }
    
    // Check if store already exists
    const existingIndex = this.getNestedStores.findIndex(s => 
      s.storeId === store.storeId || s.id === store.id
    );
    
    if (existingIndex >= 0) {
      // Update existing store
      this.getNestedStores[existingIndex] = store;
    } else {
      // Add new store
      this.getNestedStores.push(store);
    }
    
    // Update the store's parent reference if it exists
    if (store && typeof store === 'object') {
      (store as any).parentSnapshotStore = this;
    }
    
    console.log(`Added nested store with key: ${key}, storeId: ${store.storeId}`);
  },

  setStore: function <
    T extends BaseDataEntity,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T
  >(
    this: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    data: any | Map<string, SnapshotStore<any, any, any, any>>,
    type: string,
    event: Event
  ): void | null {
    if (data instanceof Map) {
      data.forEach((store, key) => {
        this.addNestedStore(key, store);
      });
    } else if (typeof data === 'object' && data !== null) {
      this.addNestedStore('default', data);
    }
    return null;
  },

  updateState: function <
    T extends BaseDataEntity,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T
  >(
    this: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    newState: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> & {
      isInitialized: true;
      initializedAt: Date;
      version?: string;
      initializedFrom?: "api" | "cache" | "local";
      initializationContext?: Record<string, unknown>;
    }
  ): void {
    if (!this.states) {
      this.states = [];
    }
    this.states.push(newState);
    this.currentState = newState;
  },

  getCurrentState: function <
    T extends BaseDataEntity,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T
  >(
    this: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ): Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null {
    return this.currentState || null;
  },

  getStates: function <
    T extends BaseDataEntity,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T
  >(
    this: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ): Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] {
    return this.states || [];
  },

  getInitialState: function <
    T extends BaseDataEntity,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T
  >(
    this: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ): Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
    return this.states && this.states.length > 0 
      ? this.states[0] 
      : {} as Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  },

  // ---------- Store Management ----------

  initializeStores: function <
    T extends BaseDataEntity,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T
  >(
    this: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    stores: Map<number, SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>
  ): void {
    this.snapshotStores = stores;
  },

  addStore: function <
    T extends BaseDataEntity,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T
  >(
    this: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    storeId: number,
    snapshotId: string | null,
    snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    type: string,
    event: SnapshotEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ): SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null {
    try {
      if (!storeId || !snapshotStore || !snapshot) {
        console.warn("Invalid parameters provided to addStore");
        return null;
      }

      if (!this.snapshotStores) {
        this.snapshotStores = new Map();
      }

      this.snapshotStores.set(storeId, snapshotStore);

      if (snapshotId && snapshot) {
        if (!(snapshot as any).associatedStores) {
          (snapshot as any).associatedStores = new Map();
        }
        (snapshot as any).associatedStores.set(storeId, snapshotStore);
      }

      this.lastUpdated = new Date();

      if (event && typeof (event as any).trigger === 'function') {
        try {
          (event as any).trigger('store_added', {
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

      if (this.executeDelegateMethodAsync && typeof (this.executeDelegateMethodAsync as any).onStoreAdded === 'function') {
        try {
          (this.executeDelegateMethodAsync as any).onStoreAdded(storeId, snapshotStore, snapshotId);
        } catch (delegateError) {
          console.warn('Delegate onStoreAdded failed:', delegateError);
        }
      }

      return snapshotStore;
    } catch (error) {
      console.error(`Failed to add store ${storeId}:`, error);
      return null;
    }
  },

  removeStore: function <
    T extends BaseDataEntity,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T
  >(
    this: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    storeId: number,
    store: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshotId: string,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    type: string,
    event: Event
  ): boolean {
    try {
      if (!storeId) {
        console.warn("Store ID is required for removal");
        return false;
      }

      if (!this.snapshotStores || !this.snapshotStores.has(storeId)) {
        console.warn(`Store with ID ${storeId} not found`);
        return false;
      }

      const removed = this.snapshotStores.delete(storeId);

      if (removed) {
        if (snapshotId && snapshot && (snapshot as any).associatedStores) {
          (snapshot as any).associatedStores.delete(storeId);
          
          if ((snapshot as any).associatedStores.size === 0) {
            delete (snapshot as any).associatedStores;
          }
        }

        this.lastUpdated = new Date();

        if (event && typeof (event as any).trigger === 'function') {
          try {
            (event as any).trigger('store_removed', {
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

        if (this.executeDelegateMethodAsync && typeof (this.executeDelegateMethodAsync as any).onStoreRemoved === 'function') {
          try {
            (this.executeDelegateMethodAsync as any).onStoreRemoved(storeId, snapshotId);
          } catch (delegateError) {
            console.warn('Delegate onStoreRemoved failed:', delegateError);
          }
        }

        return true;
      }

      return false;
    } catch (error) {
      console.error(`Failed to remove store ${storeId}:`, error);
      return false;
    }
  },

  getStore: function <    
    T extends BaseDataEntity,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T
  >(
    this: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    storeId: number,
    snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null,
    snapshotId: string | null,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null,
    snapshotStoreConfig?: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    type?: string,
    event?: Event
  ): SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null {
    if (snapshotId) {
      const existingSnapshot = this.snapshots.find((s: any) => s.id === snapshotId);

      if (existingSnapshot) {
        if (snapshot) {
          existingSnapshot.data = snapshot.data;
          (existingSnapshot as any).metadata = (snapshot as any).metadata;
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
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T
  >(
    this: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    storeId: number,
    snapshotStores?: SnapshotStoreReference<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] | Map<number, SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
    snapshotStoreConfigs?: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]
  ): Array<SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> {
    const results: Array<SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> = [];

    const processReference = (ref: SnapshotStoreReference<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null => {
      try {
        if (ref instanceof SnapshotStore) return ref;
        if (typeof ref === 'string' || typeof ref === 'number') return this.snapshotStores.get(Number(ref)) || null;
        if ((ref as any)?.storeId) return this.snapshotStores.get(Number((ref as any).storeId)) || null;
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
          // Convert storeId to number before using with Map.get()
          const storeIdNumber = Number(config.storeId);
          const store = this.snapshotStores.get(storeIdNumber);
          if (store) results.push(store);
        }
      }
    }

    if (!snapshotStores && !snapshotStoreConfigs) {
      if (storeId) {
        const store = this.snapshotStores.get(storeId);
        if (store) results.push(store);
      } else {
        for (const [, store] of this.snapshotStores) {
          results.push(store);
        }
      }
    }

    return results.filter(
      (store, index, self) => index === self.findIndex(s => s.storeId === store.storeId)
    );
  },

  // ---------- Data Operations ----------

  getData: async function <
    T extends BaseDataEntity,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T
  >(
    this: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    id: string | number,
    snapshot?: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ): Promise<SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] | undefined> {
    const snapshotStores = this.snapshotStores;
    
    if (!snapshotStores) {
      throw new Error("No snapshot stores are initialized.");
    }

    if (snapshot) {
      const result: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] = [];
      for (const [, store] of snapshotStores) {
        if (store.snapshots.some((s: any) => s.id === snapshot.id)) {
          result.push(store);
        }
      }
      return result.length ? result : undefined;
    }

    if (typeof id === "number") {
      const store = snapshotStores.get(id);
      return store ? [store] : undefined;
    }

    const matchedStores: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] = [];
    for (const store of snapshotStores.values()) {
      if (store.snapshots.some((s: any) => s.id === id)) {
        matchedStores.push(store);
      }
    }

    return matchedStores.length ? matchedStores : undefined;
  },

  // ---------- Configuration ----------

  getConfigOption: function <
    T extends BaseDataEntity,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T
  >(
    this: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    optionKey: string
  ): Record<string, any> {
    return { key: optionKey, value: null };
  },

  setConfigfunction: async function <
    T extends BaseDataEntity,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T
  >(
    this: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    config: Promise<any>
  ): Promise<void> {
    this.config = config;
    await this.initializeOptions();
  },

  initializeDefaultConfig: function <
    T extends BaseDataEntity,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T
  >(
    this: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ): any[] {
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

  // ---------- Utility Methods ----------

  hasSnapshots: function <
    T extends BaseDataEntity,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T
  >(
    this: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ): Promise<boolean> {
    return Promise.resolve(this.snapshots.length > 0);
  },

  equals: function <
    T extends BaseDataEntity,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T
  >(
    this: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    otherStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ): Promise<boolean> {
    return Promise.resolve(JSON.stringify(this.snapshots) === JSON.stringify(otherStore.snapshots));
  },

  getTimestamp: function <
    T extends BaseDataEntity,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T
  >(
    this: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ): Date {
    return new Date();
  },

  ensureDelegate: function <
    T extends BaseDataEntity,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T
  >(
    this: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ): any {
    if (!this.executeDelegateMethodAsync || this.executeDelegateMethodAsync.length === 0) {
      throw new Error("Delegate is not defined or is empty.");
    }
    return this.executeDelegateMethodAsync[0];
  },

  /**
   * Default subscription handler for snapshots
   */
  defaultSubscribeToSnapshots: function <
    T extends BaseDataEntity,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T
  >(
    this: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshotId: string,
    callback: (snaps: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null
  ): void {
    try {
      // Validate input
      if (!snapshotId) {
        throw new Error('Snapshot ID is required');
      }

      // Get snapshots for this ID
      const relevantSnapshots = this.snapshots.filter(s => s.id === snapshotId);
      
      if (relevantSnapshots.length === 0) {
        console.warn(`No snapshots found for ID: ${snapshotId}`);
        callback([] as unknown as Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>);
        return;
      }

      // Call the callback with the snapshots
      const result = callback(relevantSnapshots as unknown as Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>);
      
      // If callback returns a subscriber, register it
      if (result) {
        this.addSubscriber(result, snapshotId);
      }

      // If snapshot provided, notify about subscription
      if (snapshot) {
        this.onSnapshot(snapshotId, snapshot, 'subscribe', { type: 'subscription', timestamp: new Date() } as SnapshotEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, 
          (subscribedSnapshot) => {
            console.log(`Subscribed to snapshot: ${subscribedSnapshot.id}`);
          });
      }

    } catch (error) {
      console.error('Error in defaultSubscribeToSnapshots:', error);
      throw error;
    }
  },

  /**
   * Notify lifecycle event to store or external subscribers
   */
  notify: function <
    T extends BaseDataEntity,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T
  >(
    this: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    id: string,
    message: string,
    content: Content<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    data: any,
    date: Date,
    type: NotificationType
  ): void {
    try {
      // Create notification payload
      const notificationPayload = {
        id,
        message,
        content,
        data,
        date,
        type,
        source: 'SnapshotStore',
        storeId: this.storeId,
        timestamp: new Date()
      };

      // Store the notification
      if (!this.notifications) {
        this.notifications = [];
      }
      this.notifications.push(notificationPayload);

      // Notify internal subscribers
      this.notifySubscribers({
        type: 'notification',
        id,
        message,
        content,
        data,
        date,
        notificationType: type,
        storeId: this.storeId
      } as any);

      // If there's a delegate, forward notification
      if (this.executeDelegateMethodAsync && this.executeDelegateMethodAsync.length > 0) {
        for (const delegate of this.executeDelegateMethodAsync) {
          if (delegate && typeof (delegate as any).handleNotification === 'function') {
            try {
              (delegate as any).handleNotification(notificationPayload);
            } catch (delegateError) {
              console.warn('Delegate notification handler failed:', delegateError);
            }
          }
        }
      }

      // Log the notification (if logging is enabled)
      const config = this.config as any;
      if (config?.logging?.notifications) {
        console.log(`[Notification] ${type}: ${message}`, notificationPayload);
      }

    } catch (error) {
      console.error('Error in notify method:', error);
      // Don't throw - notifications should not break the application
    }
  },

  /**
   * Get subscribers tied to a snapshot set
   */
  getSubscribers: async function <
    T extends BaseDataEntity,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T
  >(
    this: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    subscribers: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
    snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ): Promise<{ subscribers: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]; snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> }> {
    try {
      // Filter subscribers based on snapshot criteria
      const filteredSubscribers = subscribers.filter(subscriber => {
        // Check if subscriber is interested in any of these snapshots
        if (!subscriber.criteria) return true; // No criteria means interested in all
        
        // Convert snapshots to array if needed
        const snapshotsArray = Array.isArray(snapshots) ? snapshots : [];
        
        // Check each snapshot against subscriber criteria
        return snapshotsArray.some(snapshot => {
          // Apply subscriber criteria to snapshot
          if (typeof subscriber.criteria === 'function') {
            return subscriber.criteria(snapshot);
          }
          
          // If criteria is an object with specific fields
          if (typeof subscriber.criteria === 'object') {
            return Object.entries(subscriber.criteria).every(([key, value]) => {
              return (snapshot as any)[key] === value;
            });
          }
          
          return true;
        });
      });

      // Return both subscribers and snapshots for convenience
      return {
        subscribers: filteredSubscribers,
        snapshots: Array.isArray(snapshots) ? snapshots : []
      };

    } catch (error) {
      console.error('Error in getSubscribers:', error);
      
      // Return empty/default values on error
      return {
        subscribers: [],
        snapshots: Array.isArray(snapshots) ? snapshots : []
      };
    }
  },

  // Helper method to notify subscribers
  notifySubscribers: function <
    T extends BaseDataEntity,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T
  >(
    this: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    event: any
  ): void {
    try {
      // Ensure subscribers collection exists
      if (!this.subscribers) {
        this.subscribers = [];
      }

      // Notify each subscriber
      this.subscribers.forEach(subscriber => {
        try {
          if (typeof subscriber.update === 'function') {
            subscriber.update(event);
          }
        } catch (subscriberError) {
          console.warn(`Failed to notify subscriber ${subscriber.id}:`, subscriberError);
        }
      });

      // Also check if there are snapshot-specific subscribers
      if (this.snapshotSubscribers && event.snapshotId) {
        const snapshotSubscribers = this.snapshotSubscribers.get(event.snapshotId);
        if (snapshotSubscribers) {
          snapshotSubscribers.forEach(callback => {
            try {
              callback(event.snapshot);
            } catch (callbackError) {
              console.warn(`Failed to execute snapshot subscriber callback:`, callbackError);
            }
          });
        }
      }

    } catch (error) {
      console.error('Error in notifySubscribers:', error);
    }
  },

  // Helper method to add a subscriber
  addSubscriber: function <
    T extends BaseDataEntity,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T
  >(
    this: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    subscriber: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshotId?: string
  ): void {
    try {
      // Ensure subscribers collection exists
      if (!this.subscribers) {
        this.subscribers = [];
      }

      // Add to general subscribers
      this.subscribers.push(subscriber);

      // If snapshotId provided, add to snapshot-specific subscribers
      if (snapshotId) {
        if (!this.snapshotSubscribers) {
          this.snapshotSubscribers = new Map();
        }

        if (!this.snapshotSubscribers.has(snapshotId)) {
          this.snapshotSubscribers.set(snapshotId, []);
        }

        this.snapshotSubscribers.get(snapshotId)!.push(
          (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => {
            if (typeof subscriber.update === 'function') {
              subscriber.update({ snapshot, snapshotId, type: 'snapshot_update' });
            }
          }
        );
      }

      // Notify subscriber of current state
      if (typeof subscriber.update === 'function') {
        subscriber.update({
          type: 'initial_state',
          storeId: this.storeId,
          snapshotCount: this.snapshots.length,
          timestamp: new Date()
        });
      }

    } catch (error) {
      console.error('Error adding subscriber:', error);
    }
  },
};