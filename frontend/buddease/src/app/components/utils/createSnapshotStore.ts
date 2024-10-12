import { getSnapshotId } from "@/app/api/SnapshotApi";
import { Category } from "../libraries/categories/generateCategoryProperties";
import { BaseData } from "../models/data/Data";
import { RealtimeDataItem } from "../models/realtime/RealtimeData";
import { SnapshotStoreConfig, SubscriberCollection } from "../snapshots";
import { Snapshot, SnapshotsArray, SnapshotUnion, UpdateSnapshotPayload } from "../snapshots/LocalStorageSnapshotStore";
import { SnapshotEvents } from "../snapshots/SnapshotEvents";
import SnapshotStore from "../snapshots/SnapshotStore";
import CalendarManagerStoreClass from "../state/stores/CalendarEvent";
import { Subscriber } from "../users/Subscriber";
import { CategoryProperties } from "./../../pages/personas/ScenarioBuilder";

// createSnapshotStore.ts
function createSnapshotStore<T extends BaseData, K extends BaseData>(
  id: string,
  snapshotData: SnapshotStoreConfig<T, K>,
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
    data: snapshotData.initialState || new Map<string, T>(),
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
      snapshotData: SnapshotUnion<T>,
      category: Category | undefined,
      callback: (snapshot: T) => void,
      snapshots: SnapshotsArray<T>,
      type: string,
      event: string | SnapshotEvents<T, K>,
      subscribers: SubscriberCollection<T, K>,
      snapshotContainer?: T,
      snapshotStoreConfig?: SnapshotStoreConfig<SnapshotUnion<BaseData>, T> | undefined
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

          snapshot.updateData(idAsNumber, snapshotData);

          // Step 3: If a category is provided, assign the snapshot to that category
          if (category) {
            snapshot.setCategory(category);
          }

          // Step 4: Perform an action based on the type (e.g., "restore", "revert")
          switch (type) {
            case 'restore':
              // Add the snapshot to the snapshots array if not already present
              if (!snapshots.includes(snapshotData)) {
                snapshots.push(snapshotData);
              }
              break;
            case 'revert':
              // Remove the snapshot from the snapshots array if present
              const index = snapshots.indexOf(snapshotData);
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
          callback(snapshotData);

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
      // Implement update logic
      return { snapshotId, data, events, snapshotStore, dataItems, newData, payload, store };
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
    transformDelegate, initializedState, getAllKeys, getAllValues,
    getAllItems, getSnapshotEntries, getAllSnapshotEntries, addDataStatus,
    removeData, updateData, updateDataTitle, updateDataDescription, 
    updateDataStatus, addDataSuccess, getDataVersions, updateDataVersions,
    getBackendVersion, getFrontendVersion, fetchData, defaultSubscribeToSnapshot,
  };
}
