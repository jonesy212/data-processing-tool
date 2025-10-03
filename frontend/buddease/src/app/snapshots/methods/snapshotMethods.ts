// snapshotMethods.ts
import { RealtimeDataItem } from '/Users/dixiejones/data_analysis/frontend/buddease/src/app/components/models/realtime/RealtimeData';
import { SnapshotData } from '.';
import { Subscriber } from '@/app/users/Subscriber';
import { Snapshot } from "./Snapshot";
import { isSnapshot } from '@/app/utils/snapshotUtils';
import { SubscriberCollection } from '@/app/users/SubscriberCollection';
import SnapshotStore from "@/app/snapshotstore";
import { SnapshotConfig, SnapshotContainer, SnapshotStoreConfig, SnapshotStoreProps } from '..';
import { Category } from '@/app/components/libraries/categories/generateCategoryProperties';
import { BaseData } from '@/app/components/models/data/Data';
import { SnapshotsArray, SnapshotUnion } from '../LocalStorageSnapshotStore';
import { SnapshotContainerType } from '../SnapshotContainer';
import { SnapshotEvents } from '../SnapshotEvents';
import { BaseDataEntity, DefaultMeta, DefaultExcludedFields } from '../@/configs/BaseConfig';
import { DataStoreMethods } from '@/app/components/projects/DataAnalysisPhase/DataProcessing/ DataStoreMethods';
import { DataStore } from '@/app/projects/DataAnalysisPhase/DataProcessing/DataStore';
import { Subscription } from '@/app/subscriptions/Subscription';
import { UnifiedMetadata } from '../@/configs/database/MetaDataOptions';
import { CategoryProperties } from '@/app/pages/personas/ScenarioBuilder';
import { createSnapshot } from '../createSnapshot';
import { T, K, Meta } from '@/app/components/models/data/dataStoreMethods';
import { ExcludedFields } from '@/app/components/routing/Fields';
import { CriteriaType } from '@/app/pages/searchs/CriteriaType';

export const SnapshotMethodsImplementation = {

  snapshot: async function<    
    T extends BaseDataEntity,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>
  >(
    this: SnapshotStore<T, K, Meta, ExcludedFields>,
    id: string | number | undefined,
    snapshotId: string | null,
    snapshotData: SnapshotData<T, K, Meta, ExcludedFields>,
    category: Category | undefined,
    categoryProperties: CategoryProperties | undefined,
    callback: (snapshotStore: SnapshotStore<T, K, Meta, ExcludedFields>) => void,
    dataStore: DataStore<T, K, Meta, ExcludedFields>,
    dataStoreMethods: DataStoreMethods<T, K, Meta, ExcludedFields>,
    metadata: UnifiedMetadata<T, K, Meta, ExcludedFields>,
    subscriberId: string,
    endpointCategory: string | number,
    storeProps: SnapshotStoreProps<T, K, Meta, ExcludedFields>,
    subscription?: Subscription<T, K, Meta, ExcludedFields>,
    snapshotConfigData?: SnapshotConfig<T, K, Meta, ExcludedFields>,
    snapshotStoreConfigData?: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshotContainer?: SnapshotContainerType<T, K, Meta, ExcludedFields>,
  ): Promise<{snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>}> {
    try {
      // Use the createSnapshot function to create the snapshot instance
      const snapshotInstance = await createSnapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>(
        snapshotData.data, // baseData
        new Map(), // baseMeta (empty map or use provided metadata)
        snapshotId,
        category,
        this, // snapshotStore (current instance)
        null, // snapshotManager (optional)
        snapshotStoreConfigData || null, // snapshotStoreConfig
        false, // isSubscribed
        storeProps,
        {
          // Build SnapshotStoreOptions from available data
          initialState: snapshotData.data,
          metadata: metadata,
          config: snapshotConfigData,
          subscriberId,
          endpointCategory,
          subscription
        },
        undefined, // criteria (optional)
        undefined  // delegate (optional)
      );

      // Execute callback with current snapshot store instance
      if (callback) {
        try {
          callback(this);
        } catch (callbackError) {
          console.warn('Callback execution failed:', callbackError);
        }
      }

      // Store the snapshot in the current store's snapshots array
      if (!this.snapshots) {
        this.snapshots = [];
      }
      this.snapshots.push(snapshotInstance);

      // Update current snapshot if this is a new one
      if (!this.currentSnapshot || snapshotId) {
        this.currentSnapshot = snapshotInstance;
      }

      // Update timestamps
      this.lastUpdated = new Date();

      // Handle snapshot container if provided
      if (snapshotContainer) {
        try {
          await snapshotContainer.addSnapshot(snapshotInstance);
        } catch (containerError) {
          console.warn('Failed to add snapshot to container:', containerError);
        }
      }

      // Return the created snapshot
      return { snapshot: snapshotInstance };

    } catch (error) {
      console.error('Failed to create snapshot:', error);
      
      // Provide better error message
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Snapshot creation failed: ${errorMessage}`);
    }
  },

  addSnapshot: async function <
    T extends BaseDataEntity,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>
  >(
    this: SnapshotStore<T, K, Meta, ExcludedFields>,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshotId: string,
    subscribers?: SubscriberCollection<T, K, Meta, ExcludedFields>
  ): Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined> {
    try {
      // Validate input
      if (!snapshot || !snapshotId) {
        throw new Error("Snapshot and snapshotId are required");
      }

      // Ensure snapshots array exists
      if (!this.snapshots) {
        this.snapshots = [];
      }

      // Check for existing snapshot with same ID
      const existingIndex = this.snapshots.findIndex(s => s.id === snapshotId);
      
      if (existingIndex !== -1) {
        // Update existing snapshot
        this.snapshots[existingIndex] = snapshot;
        console.log(`Updated existing snapshot: ${snapshotId}`);
      } else {
        // Add new snapshot
        this.snapshots.push(snapshot);
        console.log(`Added new snapshot: ${snapshotId}`);
      }

      // Update current snapshot reference
      this.currentSnapshot = snapshot;

      // Update timestamps
      this.lastUpdated = new Date();
      if (!snapshot.timestamp) {
        snapshot.timestamp = this.lastUpdated.toISOString();
      }

      // Notify subscribers if provided
      if (subscribers && subscribers.length > 0) {
        subscribers.forEach(subscriber => {
          if (subscriber.onSnapshotAdded) {
            try {
              subscriber.onSnapshotAdded(snapshot, snapshotId);
            } catch (error) {
              console.error('Error notifying subscriber:', error);
            }
          }
        });
      }

      // Handle delegate if exists
      if (this.delegate && typeof this.delegate.addSnapshot === 'function') {
        try {
          await this.delegate.addSnapshot(snapshot, snapshotId, subscribers);
        } catch (delegateError) {
          console.warn('Delegate addSnapshot failed:', delegateError);
          // Continue execution even if delegate fails
        }
      }

      return snapshot;

    } catch (error) {
      console.error(`Failed to add snapshot ${snapshotId}:`, error);
      
      // Notify subscribers of error
      if (subscribers && subscribers.length > 0) {
        subscribers.forEach(subscriber => {
          if (subscriber.onError) {
            try {
              subscriber.onError({
                type: 'add_snapshot_error',
                error: error instanceof Error ? error : new Error(String(error)),
                snapshotId,
                operation: 'addSnapshot'
              });
            } catch (notificationError) {
              console.error('Failed to notify subscriber of error:', notificationError);
            }
          }
        });
      }
      
      throw error;
    }
  },

  removeSnapshot: function <
    T extends BaseDataEntity,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>
  >(
    this: SnapshotStore<T, K, Meta, ExcludedFields>,
    snapshotToRemove: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ): void {
    try {
      // Validate input
      if (!snapshotToRemove || !snapshotToRemove.id) {
        throw new Error("Valid snapshot is required for removal");
      }

      // Ensure snapshots array exists
      if (!this.snapshots || !Array.isArray(this.snapshots)) {
        console.warn("No snapshots available to remove");
        return;
      }

      // Find and remove the snapshot
      const initialLength = this.snapshots.length;
      this.snapshots = this.snapshots.filter(s => s.id !== snapshotToRemove.id);
      
      const removed = initialLength !== this.snapshots.length;

      if (removed) {
        console.log(`Removed snapshot: ${snapshotToRemove.id}`);

        // Update current snapshot if it was the one removed
        if (this.currentSnapshot?.id === snapshotToRemove.id) {
          this.currentSnapshot = this.snapshots[this.snapshots.length - 1] || null;
        }

        // Update timestamp
        this.lastUpdated = new Date();

        // Handle delegate if exists
        if (this.delegate && typeof this.delegate.removeSnapshot === 'function') {
          try {
            this.delegate.removeSnapshot(snapshotToRemove);
          } catch (delegateError) {
            console.warn('Delegate removeSnapshot failed:', delegateError);
          }
        }

      } else {
        console.warn(`Snapshot ${snapshotToRemove.id} not found for removal`);
      }

    } catch (error) {
      console.error(`Failed to remove snapshot ${snapshotToRemove?.id}:`, error);
      // For void methods, we log but don't re-throw to avoid breaking callers
    }
  },


  updateSnapshot: function <
    T extends BaseDataEntity,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>
  >(
    this: SnapshotStore<T, K, Meta, ExcludedFields>,
    snapshotId: string,
    newData: Partial<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>
  ): Promise<{ snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> }> {
    return new Promise(async (resolve, reject) => {
      try {
        // Validate snapshots array exists
        if (!this.snapshots || !Array.isArray(this.snapshots)) {
          throw new Error("Snapshots collection is undefined or not an array.");
        }

        // Find the snapshot to update
        const snapshotIndex = this.snapshots.findIndex(
          (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => snapshot.id === snapshotId
        );

        if (snapshotIndex === -1) {
          throw new Error(`Snapshot ${snapshotId} not found.`);
        }

        // Update the snapshot with new data
        const updatedSnapshot = {
          ...this.snapshots[snapshotIndex],
          ...newData,
          lastModified: new Date()
        };

        // Replace the snapshot in the array
        this.snapshots[snapshotIndex] = updatedSnapshot;

        // Update currentSnapshot if this was the current one
        if (this.currentSnapshot?.id === snapshotId) {
          this.currentSnapshot = updatedSnapshot;
        }

        // Update last modified timestamp
        this.lastUpdated = new Date();

        // Handle delegate update if exists
        if (this.delegate && typeof this.delegate.updateSnapshot === 'function') {
          try {
            await this.delegate.updateSnapshot(snapshotId, updatedSnapshot);
          } catch (delegateError) {
            console.warn('Delegate update failed:', delegateError);
            // Continue with local operation even if delegate fails
          }
        }

        resolve({ snapshot: updatedSnapshot });

      } catch (error) {
        console.error(`Failed to update snapshot ${snapshotId}:`, error);
        reject(error);
      }
    });
  },

  takeSnapshot: async function <
    T extends BaseDataEntity,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>
  >(
    this: SnapshotStore<T, K, Meta, ExcludedFields>,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    subscribers?: Subscriber<T, K, Meta, ExcludedFields>[]
  ): Promise<{ snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> }> {
    try {
      // Validate snapshot
      if (!snapshot || !snapshot.id) {
        throw new Error("Invalid snapshot: missing ID or data");
      }

      // Ensure snapshots array exists
      if (!this.snapshots) {
        this.snapshots = [];
      }

      // Check if snapshot already exists
      const existingIndex = this.snapshots.findIndex(s => s.id === snapshot.id);
      if (existingIndex !== -1) {
        // Update existing snapshot
        this.snapshots[existingIndex] = snapshot;
        this.currentSnapshot = snapshot;
      } else {
        // Add new snapshot
        this.snapshots.push(snapshot);
        this.currentSnapshot = snapshot;
      }

      // Update timestamps
      this.lastUpdated = new Date();
      if (!snapshot.timestamp) {
        snapshot.timestamp = this.lastUpdated.toISOString();
      }

      // Notify subscribers if provided
      if (subscribers && subscribers.length > 0) {
        subscribers.forEach(subscriber => {
          if (subscriber.onSnapshot) {
            try {
              subscriber.onSnapshot({
                type: 'snapshot',
                snapshotId: snapshot.id,
                timestamp: this.lastUpdated,
                action: existingIndex !== -1 ? 'updated' : 'created'
              });
            } catch (error) {
              console.error('Error notifying subscriber:', error);
            }
          }
        });
      }

      // Handle delegate if exists
      if (this.delegate && typeof this.delegate.takeSnapshot === 'function') {
        try {
          await this.delegate.takeSnapshot(snapshot, subscribers);
        } catch (delegateError) {
          console.warn('Delegate snapshot failed:', delegateError);
          // Continue with local operation even if delegate fails
        }
      }

      // Return the successful snapshot
      return { snapshot };

    } catch (error) {
      console.error('Failed to take snapshot:', error);

      // Notify subscribers of failure
      if (subscribers && subscribers.length > 0) {
        subscribers.forEach(subscriber => {
          if (subscriber.onError) {
            try {
              subscriber.onError({
                type: 'snapshot_error',
                error: error instanceof Error ? error : new Error(String(error)),
                snapshotId: snapshot?.id,
                operation: 'takeSnapshot'
              });
            } catch (notificationError) {
              console.error('Failed to notify subscriber of error:', notificationError);
            }
          }
        });
      }

      throw error;
    }
  },

  restoreSnapshot: function <
    T extends BaseDataEntity,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>
  >(
    this: SnapshotStore<T, K, Meta, ExcludedFields>,
    id: string,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshotId: string,
    snapshotData: SnapshotData<T, K, Meta, ExcludedFields>,
    savedState: SnapshotStore<T, K, Meta, ExcludedFields>,
    category: Category | undefined,
    callback: (snapshot: T) => void,
    snapshots: SnapshotsArray<T, K, Meta, ExcludedFields>,
    type: string,
    event: string | SnapshotEvents<T, K, Meta, ExcludedFields>,
    realtimeData?: RealtimeDataItem<T, K, Meta, ExcludedFields>[],
    subscribers?: SubscriberCollection<T, K, Meta, ExcludedFields>,
    snapshotContainer?: SnapshotContainerType<T, K, Meta, ExcludedFields>,
    snapshotStoreConfig?: SnapshotStoreConfig<SnapshotUnion<BaseData, Meta>, K> | undefined
  ): void {
    if (!this.id) {
      throw new Error("SnapshotStore ID is undefined");
    }

    const idAsNumber = typeof this.id === "string" ? parseInt(this.id, 10) : this.id;

    if (isNaN(idAsNumber)) {
      throw new Error("SnapshotStore ID could not be converted to a number");
    }

    // Use the type guard to check if snapshotData is of type Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
    if (isSnapshot(snapshotData)) {
      snapshot.updateData(idAsNumber, snapshotData);
    } else {
      throw new Error("snapshotData is not of type Snapshot");
    }

    if (category) {
      snapshot.setCategory(category);
    }

    switch (type) {
      case "restore":
        // Ensure snapshotData is compatible with SnapshotsArray<T, K, Meta>
        if (!snapshots.includes(snapshotData as unknown as SnapshotUnion<T, K, Meta, ExcludedFields>)) {
          snapshots.push(snapshotData as unknown as SnapshotUnion<T, K, Meta, ExcludedFields>);
        }
        break;
      case "revert":
        const index = snapshots.indexOf(
          snapshotData as unknown as SnapshotUnion<T, K, Meta, ExcludedFields>
        );
        if (index !== -1) {
          snapshots.splice(index, 1);
        }
        break;
      default:
        console.warn(`Unknown type: ${type}`);
    }

    if (snapshotContainer) {
      Object.assign(snapshotContainer, snapshotData.getInitialState());
    }

    if (snapshotStoreConfig) {
      snapshot.applyStoreConfig(snapshotStoreConfig);
    }

    // Assuming callback expects T (not a Snapshot type)
    if (isSnapshot(snapshotData)) {
      callback(snapshotData.initialState as T); // Ensure proper conversion to T
    } else {
      throw new Error("snapshotData is not a valid Snapshot");
    }

    if (!this.id) {
      throw new Error("SnapshotStore ID is undefined");
    }

    if (typeof event === "object" && "trigger" in event) {
      event.trigger(
        event,
        snapshot,
        snapshotId,
        new Date(),
        subscribers,
        realtimeData, 
        type,
        snapshotData
      );
    } else {
      // Handle the case where event is a string, if needed
      console.warn("Event is a string and does not have a trigger method.");
    }
  },



  /**
   * Gets the snapshot container for a given snapshot
   */
  getSnapshotContainer: function (
    snapshotId: string,
    criteria?: CriteriaType,
    category?: Category,
    categoryProperties?: CategoryProperties,
    delegate?: any,
    snapshotData?: SnapshotData<T, K, Meta, ExcludedFields>
  ): SnapshotContainer<T, K, Meta, ExcludedFields> | undefined;
  
  /**
   * Sets or updates the snapshot container
   */
  setSnapshotContainer: function (
    container: SnapshotContainer<T, K, Meta, ExcludedFields>,
    snapshotId?: string
  ): void;
  
  /**
   * Removes a snapshot container
   */
  removeSnapshotContainer: function (snapshotId: string) => boolean;
  
  /**
   * Gets all snapshot containers
   */
  getAllSnapshotContainers: function (): Map<string, SnapshotContainer<T, K, Meta, ExcludedFields>>;
  
  /**
   * Finds snapshot containers by criteria
   */
  findSnapshotContainers: function (
    predicate: (container: SnapshotContainer<T, K, Meta, ExcludedFields>) => boolean
  ): SnapshotContainer<T, K, Meta, ExcludedFields>[];



  // ... implement ALL the methods from your list
};