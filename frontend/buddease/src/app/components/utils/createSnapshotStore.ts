import { getSnapshotId } from "@/app/api/SnapshotApi";
import { SnapshotData } from '@/app/components/snapshots';
import CalendarManagerStoreClass from "@/app/components/state/stores/CalendarManagerStore";
import { StructuredMetadata } from "@/app/configs/StructuredMetadata";
import { Category } from "../libraries/categories/generateCategoryProperties";
import { BaseData } from "../models/data/Data";
import { RealtimeDataItem } from "../models/realtime/RealtimeData";
import { Snapshot, SnapshotsArray, SnapshotUnion } from "../snapshots/LocalStorageSnapshotStore";
import { SnapshotEvents } from "../snapshots/SnapshotEvents";
import SnapshotStore from "../snapshots/SnapshotStore";
import { SnapshotStoreConfig } from "../snapshots/SnapshotStoreConfig";
import { Subscriber } from "../users/Subscriber";
import { SubscriberCollection } from "../users/SubscriberCollection";
import { CategoryProperties } from "./../../pages/personas/ScenarioBuilder";

// createSnapshotStore.ts
function createSnapshotStore <
  T extends BaseData<any>,
  K extends T = T,  
  Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>
>(
  id: string,
  snapshotData: SnapshotData<T, K>,
  category?: string | symbol | Category,
  callback?: (snapshotStore: SnapshotStore<T, K>) => void,
  snapshotDataConfig?: SnapshotStoreConfig<T, K> 
): Snapshot<T, K> | null {
  // Validate inputs
  if (!id || !snapshotData) {
    console.error('Invalid arguments provided to createSnapshotStore');
    return null;
  }

  // Create a new SnapshotStore instance
  const snapshotStore: SnapshotStore<T, K> = {
    id: id,
    data: snapshotData.getInitialState() || new Map<string, T>(),
    category: category ?? 'default-category',
    // Initialize other properties if needed
    // Provide implementation for methods if necessary
    // ...
    getSnapshotId: async () => id,
    compareSnapshotState: () => false, // Implement comparison logic
    snapshot: async () => ({
      snapshot: {
        id,
        data: new Map(snapshotStore.data),
        category: snapshotStore.category,

      }
    }),
    getSnapshotData: () => new Map(snapshotStore.data),
    getSnapshotCategory: () => snapshotStore.category,
    setSnapshotData: (
      data: Map<string, Snapshot<T, K>>,
      subscribers: Subscriber<any, any>[],
      snapshotData: Partial<SnapshotStoreConfig<T, K>>) => {
      snapshotStore.data = new Map(data);
    },
    setSnapshotCategory: (newCategory: string | CategoryProperties) => { snapshotStore.category = newCategory; },
    deleteSnapshot: () => { /* Implement deletion logic */ },
    
    restoreSnapshot: (
      id: string,
      snapshot: Snapshot<T, K>,
      snapshotId: string,
      snapshotData: SnapshotData<T, K, Meta>,
      category: Category | undefined,
      callback: (snapshot: T) => void,
      snapshots: SnapshotsArray<T, K>,
      type: string,
      event: string | SnapshotEvents<T, K>,
      subscribers: SubscriberCollection<T, K>,
      snapshotContainer?: T,
      snapshotStoreConfig?: SnapshotStoreConfig<SnapshotUnion<BaseData, Meta>, Meta, T> | undefined
        ) => {
          // Step 1: Handle `this.id` being potentially undefined
          if (!snapshot.id) {
            throw new Error('SnapshotStore ID is undefined');
          }

          // Step 2: Ensure `this.id` is a number if required by `updateData`
          const idAsNumber = typeof snapshot.id === 'string' ? parseInt(snapshot.id, 10) : snapshot.id;

          if (isNaN(idAsNumber)) {
            throw new Error('SnapshotStore ID could not be converted to a number');
          }

          snapshot.updateData(idAsNumber, snapshotData as unknown as T);

          // Step 3: If a category is provided, assign the snapshot to that category
          if (category) {
            snapshot.setCategory(category);
          }

          // Step 4: Perform an action based on the type (e.g., "restore", "revert")
          switch (type) {
            case 'restore':
              if (!snapshots.includes(snapshotData as unknown as Snapshot<T, K, Meta>)) {
                snapshots.push(snapshotData as unknown as Snapshot<T, K, Meta>);
              }
              break;
            case 'revert':
              const index = snapshots.indexOf(snapshotData as unknown as Snapshot<T, K, Meta>);
              if (index !== -1) {
                snapshots.splice(index, 1);
              }
              break;
            default:
              console.warn(`Unknown type: ${type}`);
          }

          // Step 5: If a snapshotContainer is provided, update its data with the snapshotData
          if (snapshotContainer) {
            Object.assign(snapshotContainer, snapshotData);
          }

          // Step 6: If a snapshotStoreConfig is provided, use it to configure the snapshot
          if (snapshotStoreConfig) {
            // Update the snapshot store configuration with the provided config
            snapshot.applyStoreConfig(snapshotStoreConfig);
          }

          // Step 7: Invoke the callback function with the updated snapshotData

          callback(snapshotData as unknown as T);

          // Step 8: Trigger any necessary event actions
          if (event && typeof event.trigger === 'function') {
            event.trigger(type, snapshotData);
          }
    },
    createSnapshot: () => ({ id, data: new Map<string, Snapshot<T, K>>(Object.entries(snapshotStore.data)), category: snapshotStore.category }),
    
        updateSnapshot: async (
          snapshotId: string,
          data: Map<string, Snapshot<T, K>>,
          events: Record<string, CalendarManagerStoreClass<T, K>[]>,
          snapshotStore: SnapshotStore<T, K>,
          dataItems: RealtimeDataItem[],
          newData: Snapshot<T, K>,
          payload: UpdateSnapshotPayload<T>,
          store: SnapshotStore<any, K>
        ): Promise<{ snapshot: Snapshot<T, K> }> => {
          
          // Step 1: Check if the snapshotId exists in the data map
          if (!data.has(snapshotId)) {
            throw new Error(`Snapshot with id ${snapshotId} does not exist.`);
          }
          
          // Step 2: Retrieve the existing snapshot
          const existingSnapshot = data.get(snapshotId);
          
          // Step 3: Merge new data into the existing snapshot
          const updatedSnapshot: Snapshot<T, K> = {
            ...existingSnapshot,
            ...newData, // Assuming newData contains properties to be updated
            // You may want to update specific properties instead of a shallow merge
            updatedAt: new Date(), // Example of adding an updated timestamp
            // Add any other merging logic necessary
          };
          
          // Step 4: Update the data map with the updated snapshot
          data.set(snapshotId, updatedSnapshot);
          
          // Step 5: Optionally handle events (if applicable)
          if (events[snapshotId]) {
            // Implement any event handling logic, e.g., notifying listeners
            // This is context-dependent on how you want to handle events
            events[snapshotId].forEach(event => {
              // Handle each event (pseudo-code, replace with actual logic)
              // event.notify(updatedSnapshot);
            });
          }
          
          // Step 6: Return the updated snapshot
          return { snapshot: updatedSnapshot };
        },
  };

  // Call the provided callback if it exists
  if (callback) {
    callback(snapshotStore);
  }

  // Return the Snapshot instance
  return {
    id,
    data: new Map(snapshotStore.data),
    category,
    store: snapshotStore,
    getSnapshotId: getSnapshotId,
    compareSnapshotState: snapshotStore.compareSnapshotState,
    snapshot: snapshotStore.snapshot,
    snapshotStore: snapshotStore,
    getSnapshotData: snapshotStore.getSnapshotData,
    getSnapshotCategory: snapshotStore.getSnapshotCategory,
    setSnapshotData: snapshotStore.setSnapshotData,
    setSnapshotCategory: snapshotStore.setSnapshotCategory,
    deleteSnapshot: snapshotStore.deleteSnapshot,
    restoreSnapshot: snapshotStore.restoreSnapshot,
    createSnapshot: snapshotStore.createSnapshot,
    updateSnapshot: snapshotStore.updateSnapshot,
    initialConfig: snapshotStore.initialConfig, 
    removeSubscriber: snapshotStore.removeSubscriber,
    onInitialize: snapshotStore.onInitialize, 
    onError: snapshotStore.onError,
    setCategory: snapshotStore.setCategory,
    applyStoreConfig: snapshotStore.applyStoreConfig,
    generateId: snapshotStore.generateId,
    snapshotData: snapshotStore.snapshotData,
    getSnapshotItems: snapshotStore.getSnapshotItems,
    defaultSubscribeToSnapshots: snapshotStore.defaultSubscribeToSnapshots,
    notify: snapshotStore.notify,
    notifySubscribers: snapshotStore.notifySubscribers,
   
    getAllSnapshots: snapshotStore.getAllSnapshots,
    getSubscribers: snapshotStore.getSubscribers,
    versionInfo: snapshotStore.versionInfo,
    transformSubscriber: snapshotStore.transformSubscriber,
    transformDelegate: snapshotStore.transformDelegate,
    initializedState: snapshotStore.initializedState,
    getAllKeys: snapshotStore.getAllKeys,
    getAllValues: snapshotStore.getAllValues,
   
    getAllItems: snapshotStore.getAllItems,
    getSnapshotEntries: snapshotStore.getSnapshotEntries,
    getAllSnapshotEntries: snapshotStore.getAllSnapshotEntries,
    addDataStatus: snapshotStore.addDataStatus,
   
    removeData: snapshotStore.removeData,
    updateData: snapshotStore.updateData,
    updateDataTitle: snapshotStore.updateDataTitle,
    updateDataDescription: snapshotStore.updateDataDescription,
    
    updateDataStatus: snapshotStore.updateDataStatus,
    addDataSuccess: snapshotStore.addDataSuccess,
    getDataVersions: snapshotStore.getDataVersions,
    updateDataVersions: snapshotStore.updateDataVersions,
   
    getBackendVersion: snapshotStore.getBackendVersion,
    getFrontendVersion: snapshotStore.getFrontendVersion,
    fetchData: snapshotStore.fetchData,
    defaultSubscribeToSnapshot: snapshotStore.defaultSubscribeToSnapshot,
   
  };
}
