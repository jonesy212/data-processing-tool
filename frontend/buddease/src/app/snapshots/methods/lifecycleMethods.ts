// lifecycleMethods.ts
// snapshotStore/methods/LifecycleMethods.ts
import { createSnapshot } from '@/app/snapshots/createSnapshot';
import { Attachment } from "@/app/documents/attachment/Attachment";
import { Content } from '@/app/models/content/AddContent';
import { NotificationType } from '@/app/features/support/UnifiedNotificationTypes'
import { T } from '@/app/models/data/dataStoreMethods';
import { Snapshots } from '@/app/snapshots/LocalStorageSnapshotStore';
import { SnapshotConfig } from '@/app/snapshots/SnapshotConfig';
import SnapshotStore from '@/app/snapshots/SnapshotStore';
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
} from "@/app/types";
import { Subscription } from '@/app/subscriptions/Subscription';
import { SnapshotEvent } from '@/app/typings/snapshotTypes';
import { isSnapshot } from '@/utils/snapshotUtils';
import { BaseDataEntity, DefaultExcludedFields, DefaultIncludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { convertToSnapshotUnion } from "@/app/snapshots/ConvertSnapshotUnion";
import { SnapshotStoreReference } from "@/app/snapshots/SnapshotStoreReference";


export const LifecycleMethods = {



    initSnapshot(
      snapshot: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null,
      snapshotId: string,
      snapshotData: SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      category?: Category,    categoryProperties: CategoryProperties | undefined,
      snapshotConfig: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      callback: (snapshotStore: SnapshotStore<any, any>) => void
    ): void {
      this.handleDelegate(
        (delegate) => delegate.initSnapshot.bind(delegate),
        snapshot,
        snapshotId,
        snapshotData,
        category,
        snapshotConfig,
        callback
      );
    },
  

/**
 * Deletes a snapshot from the store with proper type safety
 * 
 * @template T - Base data type
 * @template K - Extended data type (defaults to T)
 * @template Meta - Metadata type
 * @template ExcludedFields - Fields to exclude
 * @param {string} snapshotId - ID of snapshot to delete
 * @param {boolean} [permanent=false] - Whether to permanently delete
 * @returns {Promise<boolean>} - True if deletion was successful
 */
  deleteSnapshot(
    snapshotId: string,
    permanent: boolean = false
  ): Promise<boolean> {
    return new Promise((resolve, reject) => {
      try {
        // Validate input
        if (!snapshotId) {
          throw new Error('Snapshot ID is required');
        }

        // Find the snapshot in storage
        const snapshot = this.snapshots.get(snapshotId);
        if (!snapshot) {
          resolve(false); // Not found = considered successful
          return;
        }

        // Handle deletion based on type
        if (permanent) {
          // Permanent deletion
          this.snapshots.delete(snapshotId);
          this.deletedSnapshots.delete(snapshotId); // Remove from deleted set
          
          // Notify subscribers
          this.notifySubscribers({
            type: 'delete',
            snapshotId,
            permanent: true
          });

          resolve(true);
        } else {
          // Soft deletion
          snapshot.deleted = true;
          snapshot.updatedAt = new Date();
          this.deletedSnapshots.add(snapshotId);

          // Mark versions as deleted
          if (snapshot.versions) {
            snapshot.versions.forEach(version => {
              version.deleted = true;
            });
          }

          // Notify subscribers
          this.notifySubscribers({
            type: 'delete',
            snapshotId,
            permanent: false
          });

          resolve(true);
        }
      } catch (error) {
        console.error(`Error deleting snapshot ${snapshotId}:`, error);
        reject(error);
      }
    });
  }




  createInitSnapshot(
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

        let data: Data;
        if ("data" in snapshotData && snapshotData.data) {
          data = snapshotData.data;
        } else if (snapshotData.data && "data" in snapshotData.data) {
          data = snapshotData.data.data;
        } else {
          return reject(new Error("snapshotData does not have a valid 'data' property"));
        }

        id =
          typeof data.id === "string"
            ? data.id
            : String(
                UniqueIDGenerator.generateID(
                  "SNAP",
                  "defaultID",
                  NotificationTypeEnum.GeneratedID
                )
              );

        const snapshot: SnapshotWithCriteriaAsBase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = {
          id,
          data,
          timestamp: snapshotData.timestamp || new Date(),
          category: this.category,
          topic: this.topic,
          initializedState: {},
          criteria: {}, // Example placeholder for search criteria
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
        };

        const storeId = snapshotApi.getSnapshotStoreId(String(this.snapshotId));
        const snapshotManager = await useSnapshotManager<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>(await storeId);

        this.snapshots.push(snapshot);

        if (this.delegate && this.delegate.length > 0) {
          for (const delegateConfig of this.delegate) {
            if (
              delegateConfig &&
              typeof delegateConfig.createSnapshotSuccess === "function"
            ) {
              await delegateConfig.createSnapshotSuccess(
                id,
                snapshotManager,
                snapshot,
                initialData
              );
              return resolve(snapshot); // Correctly resolve the promise with the snapshot
            }
          }
          return reject(new Error("No valid delegate found for createSnapshotFailure"));
        } else {
          return reject(new Error("Delegate is undefined or empty"));
        }
      } catch (error) {
        reject(error); // Handle unexpected errors
      }
    });
  },






  // New lifecycle-specific props/methods
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


  onSnapshot: function <
    T extends BaseDataEntity,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T
  >(
    snapshotId: string,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    type: string,
    event: SnapshotEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    callback: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void
  ): void {
    
  },
  
  
  createSnapshots: function <
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
     categoryProperties?: CategoryProperties;
  ): Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] {
    const snapshotsArray = Array.isArray(snapshots) ? snapshots : [snapshots];

    const createdSnapshots: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] = snapshotsArray.map(
      (snapshot) => {
        // Use createSnapshot to build a full snapshot
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
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T
  >(
    this: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    stores: Map<number, SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>
  ): void {
    // Type assertion to access protected method
    const protectedThis = this as unknown as {
      setSnapshotStores: (stores: Map<number, SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>) => void;
    };
    
    protectedThis.setSnapshotStores(stores);
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
  >(this: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null {
    return this.currentState;
  },

  getStates: function <
    T extends BaseDataEntity,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T
  >(this: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] {
    return this.states;
  },

  hasSnapshots: function <
    T extends BaseDataEntity,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T
  >(this: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): Promise<boolean> {
    return Promise.resolve(this.snapshots.length > 0);
  },

  equals: function <
    T extends BaseDataEntity,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T
  >(this: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, otherStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): Promise<boolean> {
    return Promise.resolve(JSON.stringify(this.snapshots) === JSON.stringify(otherStore.snapshots));
  },

  initializeWithData: function <
    T extends BaseDataEntity,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T
  >(
    this: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    data: SnapshotUnion<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;[]
  ): void {
    this.snapshots = data; // initialize snapshots
  },

  addToSnapshotList: async function <
    T extends BaseDataEntity,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T
  >(
    this: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshots: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
    subscribers: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
    storeProps?: SnapshotStoreProps<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ): Promise<Subscription<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]> {
    const results: Subscription<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] = [];
    for (const snapshot of snapshots) {

      const storeProps: SnapshotStoreProps<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = {
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
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T
  >(
    this: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
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
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T
  >(
    this: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    event: string,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshotId: string,
    subscribers: any,
    type: string,
    snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    dataItems: any[],
    criteria: any,
    category?: string | symbol | Category
  ) {
    // Implementation placeholder
  },

  removeChild: function <
    T extends BaseDataEntity,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T
  >(
    this: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
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
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T
  >(
    this: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    id: string,
    childSnapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ): Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] {
    return [];
  },

  hasChildren: function <
    T extends BaseDataEntity,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T
  >(this: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, id: string): boolean {
    return false;
  },

  isDescendantOf: function <
    T extends BaseDataEntity,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T
  >(
    this: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
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
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T
  >(this: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
    return {} as Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  },

  /**
   * Get a config option by key
   */
  getConfigOption: function <
    T extends BaseDataEntity,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T
  >(this: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, optionKey: string): Record<string, any> {
    return { key: optionKey, value: null }; // Placeholder logic
  },


  /**
   * Return current timestamp
   */
  getTimestamp: function <
    T extends BaseDataEntity,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T
  >(this: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): Date {
    return new Date();
  },

  /**
 * Get snapshot stores by id or snapshot
 */
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

    const matchedStores: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] = [];
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
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T
  >(
    this: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    storeId: number,
    snapshotStore: SnapshotStore<T, K, Meta> | null,
    snapshotId: string | null,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null,
    snapshotStoreConfig?: SnapshotStoreConfig<T, K, Meta>,
    type?: string,
    event?: Event
  ): SnapshotStore<T, K, Meta> | null {
    if (snapshotId) {
      const existingSnapshot = this.snapshots.find((s: SnapshotUnion<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => {
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
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T
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
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = never,
    IncludedFields extends keyof T = keyof T
  >(
    this: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
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
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T
  >(
    this: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshotId: string,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    type: string,
    event: SnapshotEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
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



  initializeStore: function <
    T extends BaseDataEntity,
    K extends T = T,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = never,
    IncludedFields extends keyof T = keyof T
  >(
    this: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    stores: Map<number, SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>
  ): void {
    // Type assertion to access protected method
    const protectedThis = this as unknown as {
      setSnapshotStores: (stores: Map<number, SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>) => void;
    };
    
    protectedThis.setSnapshotStores(stores);
  },

  initializeOptions: async function<
    T extends BaseDataEntity,
    K extends T = T,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = never,
    IncludedFields extends keyof T = keyof T
  >(
    this: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ): Promise<void> {
    const config = await this.config;
    if (config?.logging) console.log('Logging is enabled for this SnapshotStore.');
    if (config?.autoSync) this.autoSyncData();
  },

  setConfigfunction: async function <T extends BaseDataEntity, K extends T = T, Meta = DefaultMeta<T, K>, ExcludedFields extends keyof T = DefaultExcludedFields<T>>(this: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, config: Promise<any>): Promise<void> {
    this.config = config;
    await this.initializeOptions();
  },

  initializeDefaultConfig<
    T extends BaseDataEntity,
    K extends T = T,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = never,
    IncludedFields extends keyof T = keyof T
  >(this: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): any[] {
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

ensureDelegate: function <
  T extends BaseDataEntity,
  K extends T = T,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = never,
  IncludedFields extends keyof T = keyof T
>(this: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): any {
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