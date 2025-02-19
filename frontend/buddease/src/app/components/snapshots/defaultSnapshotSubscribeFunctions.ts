// defaultSnapshotSubscribeFunctions.ts
import * as snapshotApi from '@/app/api/SnapshotApi';
import { StructuredMetadata } from "@/app/configs/StructuredMetadata";
import { BaseData } from "../models/data/Data";
import { CoreSnapshot } from "./CoreSnapshot";
import { Snapshot } from "./LocalStorageSnapshotStore";
import { Callback } from "./subscribeToSnapshotsImplementation";

// Function to unsubscribe from snapshots
export const defaultUnsubscribeFromSnapshots = <T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(
  snapshotId: string,
  callback: Callback<Snapshot<T, K>>,
  snapshot: Snapshot<T, K> // Ensure this matches the expected type
): void => {
  console.warn('Default unsubscription from snapshots is being used.');
  console.log(`Unsubscribed from snapshot with ID: ${snapshotId}`);

  // Ensure `snapshot` is of type `Snapshot<T, K>`
  callback(snapshot);

  // Simulate a delay before receiving the update
  setTimeout(() => {
    callback(snapshot);
  }, 1000);
};


function convertCoreToSnapshot<T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(
  coreSnapshot: CoreSnapshot<T, K>
): Snapshot<T, K> {
  return {
    ...coreSnapshot, // Spread existing properties from CoreSnapshot
    deleted: false, // Default or calculated value
    initialConfig: {}, // Initialize as appropriate for your app
    onInitialize: () => {}, // Default callback or custom logic
    onError: (error: Error) => console.error(error), // Default error handler
    // Add any other required properties with defaults or computed values
  };
}

export const fetchAndCreateSnapshot = async <T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(
  snapshotId: string,
  storeId: number,
  additionalHeaders?: Record<string, string>
): Promise<CoreSnapshot<T, K>> => {
  try {
    // Fetch the snapshot from the API
    const snapshot =  snapshotApi.getSnapshot(String(snapshotId), Number(storeId), additionalHeaders);
    
    // Create CoreSnapshot using fetched data
    const coreSnapshot: CoreSnapshot<T, K> = {
      subscribers: snapshot.subscribers,
      snapshotSubscriberId: snapshot.snapshotSubscriberId,
      isSubscribed: snapshot.isSubscribed,
      getSubscribers: snapshot.getSubscribers,
     
      mappedSnapshot: snapshot.mappedSnapshot,
      notifySubscribers: snapshot.notifySubscribers,
      notify: snapshot.notify,
      subscribe: snapshot.subscribe,
      
      
      id: snapshot.id,  // Assuming snapshot has an id
      isCore: true,
      config: Promise.resolve(null),  // Placeholder promise for config
      configs: null,  // Assuming no configs are provided
      data: snapshot.data || null,  // Defaulting to null if no data provided
      parentId: null,  // Placeholder, can be set as needed
      operation: undefined,  // Assuming no operation is set initially
      description: snapshot.description || null,  // Defaulting to null if no description
      name: snapshot.name || "Default Snapshot Name",
      currentCategory: snapshot.currentCategory || "Default Category",  // Default category value
      timestamp: snapshot.timestamp || new Date(),  // Using current date if no timestamp
      orders: snapshot.orders || [],  // Using provided orders or empty array
      createdBy: snapshot.createdBy || "Unknown User",  // Default user if not provided
      eventRecords: null,  // Placeholder for event records
      subscriberId: snapshot.subscriberId || "defaultSubscriber",  // Default subscriber ID
      length: snapshot.length || 0,  // Defaulting to 0 if no length provided
      task: snapshot.task || null,  // Placeholder for task
      category: snapshot.category || undefined,  // Defaulting to undefined
      categoryProperties: undefined,  // Placeholder for category properties
      date: snapshot.date || new Date(),  // Defaulting to current date
      status: snapshot.status || undefined,  // Defaulting to undefined
      content: snapshot.content || undefined,  // Defaulting to undefined
      contentItem: snapshot.contentItem || undefined,  // Defaulting to undefined
      label: snapshot.label || undefined,  // Defaulting to undefined
      message: snapshot.message || undefined,  // Defaulting to undefined
      user: snapshot.user || undefined,  // Defaulting to undefined
      type: snapshot.type || undefined,  // Defaulting to undefined
      phases: snapshot.phases || undefined,  // Defaulting to undefined
      phase: snapshot.phase || null,  // Defaulting to null
      ownerId: snapshot.ownerId || undefined,  // Defaulting to undefined
      store: snapshot.store || null,  // Defaulting to null
      state: snapshot.state || null,  // Defaulting to null
      dataStore: snapshot.dataStore || null,  // Defaulting to null
      snapshotId: snapshot.snapshotId || null,  // Defaulting to null
      configOption: snapshot.configOption || null,  // Defaulting to null
      snapshotItems: snapshot.snapshotItems || [],  // Defaulting to empty array
      snapshots: snapshot.snapshots || undefined,  // Defaulting to undefined
      initialState: snapshot.initialState || {},  // Defaulting to empty object
      nestedStores: snapshot.nestedStores || [],  // Defaulting to empty array
      events: snapshot.events || undefined,  // Defaulting to undefined
      tags: snapshot.tags || undefined,  // Defaulting to undefined
      setSnapshotData: snapshot.setSnapshotData || undefined,  // Defaulting to undefined
      event: snapshot.event || undefined,  // Defaulting to undefined
      snapshotConfig: snapshot.snapshotConfig || undefined,  // Defaulting to undefined
      snapshotStoreConfig: snapshot.snapshotStoreConfig || null,  // Defaulting to null
      snapshotStoreConfigSearch: snapshot.snapshotStoreConfigSearch || null,  // Defaulting to null
      set: snapshot.set || undefined,  // Defaulting to undefined
      setStore: snapshot.setStore || null,  // Defaulting to null
      restoreSnapshot: snapshot.restoreSnapshot || (() => Promise.resolve()),  // Defaulting to a no-op function
      handleSnapshot: snapshot.handleSnapshot || (() => Promise.resolve(null)),  // Defaulting to a no-op function
      getItem: snapshot.getItem || (async (key: T) => undefined),  // Defaulting to an async function that returns undefined
      meta: snapshot.meta || new Map(),  // Defaulting to an empty map
      snapshotMethods: snapshot.snapshotMethods || [],  // Defaulting to an empty array
      getSnapshotsBySubscriber: snapshot.getSnapshotsBySubscriber || ((subscriber: string) => Promise.resolve([]))  // Defaulting to an async function returning an empty array
    };
    
    return coreSnapshot;
  } catch (error) {
    console.error('Error fetching snapshot:', error);
    throw new Error('Failed to create snapshot');
  }
}


export const defaultSubscribeToSnapshot = async <T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(
  snapshotId: string,
  storeId: number, // Added storeId parameter
  callback: (snapshot: Snapshot<T, K>) => void,
  additionalHeaders?: Record<string, string> // Optional headers
): Promise<void> => {
  console.log(`Subscribed to single snapshot with ID: ${snapshotId}`);

  // Fetch the snapshot and create CoreSnapshot
  const coreSnapshot = await fetchAndCreateSnapshot<T, K>(snapshotId, storeId, additionalHeaders);

   // Convert CoreSnapshot to Snapshot
   const fullSnapshot = convertCoreToSnapshot(coreSnapshot);

   // Simulate receiving a snapshot update
   setTimeout(() => {
     // Call the callback with the fully converted Snapshot
     callback(fullSnapshot);
   }, 1000); // Simulate a delay for receiving an update
};