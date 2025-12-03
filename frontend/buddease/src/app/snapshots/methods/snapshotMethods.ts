// snapshotMethods.ts
import { RealtimeDataItem } from '@/app/typings/realtimeTypes';
import { SnapshotData } from '@/app/snapshots/SnapshotData';
import { Subscriber } from '@/app/subscribers/Subscriber';
import { Snapshot } from "@/app/snapshots/Snapshot";
import { isSnapshot } from '@/utils/snapshotUtils';
import { SubscriberCollection } from '@/app/subscribers/SubscriberCollection';
import SnapshotStore from "@/app/snapshots/SnapshotStore";
import { Attachment } from "@/app/documents/attachment/Attachment";
import { SnapshotStoreConfig } from '@/app/snapshots/SnapshotStoreConfig';

import { SnapshotContainer } from '@/app/snapshots/SnapshotContainer';
import { SnapshotStoreProps } from '@/app/snapshots/SnapshotStoreProps';
import { SnapshotConfig } from '@/app/snapshots/SnapshotConfig';

import { Category } from '@/app/libraries/categories/generateCategoryProperties';
import { BaseData } from '@/app/models/data/Data';
import { SnapshotsArray, SnapshotUnion } from '@/app/snapshots/LocalStorageSnapshotStore';
import { SnapshotContainerType } from '@/app/snapshots/SnapshotContainer';
import { SnapshotEvents } from '@/app/typings/snapshotTypes';
import { BaseDataEntity, DefaultMeta, DefaultExcludedFields } from '@/app/config/BaseConfig';
import { DataStoreMethods } from '@/app/projects/DataAnalysisPhase/DataProcessing/DataStoreMethods';
import { DataStore } from '@/app/state/stores/DataStore';
import { Subscription } from '@/app/subscriptions/Subscription';
import { UnifiedMetadata } from '@/app/config/MetaDataOptions';
import { CategoryProperties } from '@/app/pages/personas/ScenarioBuilder';
import { createSnapshot } from '@/app/snapshots/createSnapshot';
import { CriteriaType } from '@/app/pages/searches/CriteriaType';

export const SnapshotMethodsImplementation = {

snapshot: async function<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  this: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  id: string | number | undefined,
  snapshotId: string | null,
  snapshotData: SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  category?: Category,
  categoryProperties: CategoryProperties | undefined,
  callback: (snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void,
  dataStore: DataStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  dataStoreMethods: DataStoreMethods<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  metadata: UnifiedMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  subscriberId: string,
  endpointCategory: string | number,
  storeProps: SnapshotStoreProps<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  subscription?: Subscription<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  snapshotConfigData?: SnapshotConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  snapshotStoreConfigData?: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  snapshotContainer?: SnapshotContainerType<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
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
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
  >(
    this: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshotId: string,
    subscribers?: SubscriberCollection<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
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
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
  >(
    this: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
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
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
  >(
    this: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
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
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
  >(
    this: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    subscribers?: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]
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
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
  >(
    this: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    id: string,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshotId: string,
    snapshotData: SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    savedState: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    category?: Category,
    callback: (snapshot: T) => void,
    snapshots: SnapshotsArray<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    type: string,
    event: string | SnapshotEvents<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    realtimeData?: RealtimeDataItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
    subscribers?: SubscriberCollection<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshotContainer?: SnapshotContainerType<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
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
        // Ensure snapshotData is compatible with SnapshotsArray<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
        if (!snapshots.includes(snapshotData as unknown as SnapshotUnion<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>)) {
          snapshots.push(snapshotData as unknown as SnapshotUnion<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>);
        }
        break;
      case "revert":
        const index = snapshots.indexOf(
          snapshotData as unknown as SnapshotUnion<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
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
    snapshotData?: SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ): SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined {
    const container = snapshotContainers.get(snapshotId);
    
    // If criteria or other filters are provided, ensure the container matches
    if (container) {
      if (criteria && container.criteria !== criteria) return undefined;
      if (category && container.category !== category) return undefined;
      if (categoryProperties && container.categoryProperties !== categoryProperties) return undefined;
      if (delegate && container.delegate !== delegate) return undefined;
      if (snapshotData && container.snapshotData !== snapshotData) return undefined;
    }
    
    return container;
  },
  /**
   * Sets or updates the snapshot container
   */
  setSnapshotContainer: function (
    container: SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshotId?: string
  ): void {
    const id = snapshotId || container.id || container.snapshotId;
    if (!id) {
      throw new Error('Snapshot ID is required');
    }
    snapshotContainers.set(String(id), container);
  },
    
  /**
   * Removes a snapshot container
   */
  removeSnapshotContainer: function (snapshotId: string): boolean {
    return snapshotContainers.delete(snapshotId);
  },  

  /**
   * Gets all snapshot containers
   */
    getAllSnapshotContainers: function (): Map<string, SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> {
      return new Map(snapshotContainers);
  },
    
  /**
   * Finds snapshot containers by criteria
   */

  findSnapshotContainers: function (
    predicate: (container: SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => boolean
  ): SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] {
    const results: SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] = [];
    snapshotContainers.forEach(container => {
      if (predicate(container)) {
        results.push(container);
      }
    });
    return results;
  },

  /**
   * Creates a new snapshot container
   */
  createSnapshotContainer: function (
    snapshotId: string,
    snapshotData: SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    criteria?: CriteriaType,
    category?: Category,
    categoryProperties?: CategoryProperties,
    delegate?: any
  ): SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
    const container: SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = {
      id: snapshotId,
      snapshotId,
      snapshots: snapshotData,
      criteria,
      category,
      categoryProperties,
      delegate,
      metadata: {} as Meta,
      createdAt: new Date(),
      updatedAt: new Date(),
      subscribers: [],
      // Add other required properties based on your SnapshotContainer interface
    };
    
    snapshotContainers.set(snapshotId, container);
    return container;
  },
  
  /**
   * Updates an existing snapshot container
   */
  updateSnapshotContainer: function (
    snapshotId: string,
    updates: Partial<SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>
  ): SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined {
    const existing = snapshotContainers.get(snapshotId);
    if (!existing) return undefined;
    
    const updated = {
      ...existing,
      ...updates,
      updatedAt: new Date()
    };
    
    snapshotContainers.set(snapshotId, updated);
    return updated;
  },
  
  /**
   * Clears all snapshot containers
   */
  clearAllSnapshotContainers: function (): void {
    snapshotContainers.clear();
  },
  
  /**
   * Checks if a snapshot container exists
   */
  hasSnapshotContainer: function (snapshotId: string): boolean {
    return snapshotContainers.has(snapshotId);
  },
  
  /**
   * Gets the count of snapshot containers
   */
  getSnapshotContainerCount: function (): number {
    return snapshotContainers.size;
  },
  
  /**
   * Gets snapshot containers by category
   */
  getSnapshotContainersByCategory: function (
    category: Category
  ): SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] {
    return this.findSnapshotContainers(container => container.category === category);
  },
  
  /**
   * Gets snapshot containers by criteria
   */
  getSnapshotContainersByCriteria: function (
    criteria: CriteriaType
  ): SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] {
    return this.findSnapshotContainers(container => container.criteria === criteria);
  },
  
  /**
   * Merges multiple snapshot containers
   */
  mergeSnapshotContainers: function (
    containers: SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]
  ): SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
    // Combine all snapshots from all containers
    const allSnapshots: SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = [];
    let mergedCriteria: CriteriaType | undefined;
    let mergedCategory: Category | undefined;
    
    containers.forEach(container => {
      if (Array.isArray(container.snapshots)) {
        allSnapshots.push(...container.snapshots);
      }
      // Use criteria/category from first container or create combined logic
      if (!mergedCriteria && container.criteria) {
        mergedCriteria = container.criteria;
      }
      if (!mergedCategory && container.category) {
        mergedCategory = container.category;
      }
    });
    
    const mergedId = `merged-${Date.now()}`;
    return this.createSnapshotContainer(
      mergedId,
      allSnapshots,
      mergedCriteria,
      mergedCategory,
      undefined, // categoryProperties
      undefined  // delegate
    );
  },
  
  /**
   * Filters snapshot containers
   */
  filterSnapshotContainers: function (
    filterFn: (container: SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => boolean
  ): SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] {
    return Array.from(snapshotContainers.values()).filter(filterFn);
  },
  
  /**
   * Gets snapshot container IDs
   */
  getSnapshotContainerIds: function (): string[] {
    return Array.from(snapshotContainers.keys());
  },
  
  /**
   * Backs up snapshot containers
   */
  backupSnapshotContainers: function (): Record<string, SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> {
    return Object.fromEntries(snapshotContainers);
  },
  
  /**
   * Restores snapshot containers from backup
   */
  restoreSnapshotContainers: function (
    backup: Record<string, SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>
  ): void {
    snapshotContainers.clear();
    Object.entries(backup).forEach(([id, container]) => {
      snapshotContainers.set(id, container);
    });
  }
  // ... implement ALL the methods from your list
};