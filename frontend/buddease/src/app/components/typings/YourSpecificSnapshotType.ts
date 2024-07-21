import { initialState } from './../state/redux/slices/RealtimeDataSlice';
import { CategoryProperties } from "@/app/pages/personas/ScenarioBuilder";
import { BaseData } from "../models/data/Data";
import { Snapshot } from "../snapshots/LocalStorageSnapshotStore";
import { SnapshotStoreConfig } from "../snapshots/SnapshotConfig";
import SnapshotStore, { defaultCategory } from "../snapshots/SnapshotStore";
import { generateSnapshotId } from "../utils/snapshotUtils";
import { options } from "../hooks/useSnapshotManager";

type T = BaseData; // BaseData is a base type shared by all data entities
type K = T;        // K could be the same as T or a different specialized type

type ChosenSnapshotState = SnapshotStoreConfig<BaseData, K>  | SnapshotStore<T, K> | Snapshot<T, K> | null | undefined
// Define YourSpecificSnapshotType implementing Snapshot<T>
class YourSpecificSnapshotType<T> implements Snapshot<BaseData> {
  id: string;
  data: Map<string, BaseData>;

  constructor(id: string, data: Map<string, BaseData>) {
    this.id = id;
    this.data = data;
    // Additional initialization if necessary
  }

  // Implement methods required by Snapshot<T>
  getId(): string {
    return this.id;
  }

  setData(data: Map<string, BaseData>): void {
    this.data = data;
    // Additional logic if necessary
  }
}

// Example usage:
const specificSnapshot = new YourSpecificSnapshotType<string>(
  "123",
  new Map([["key", { id: "keyId", name: "Example Data" } as BaseData]])
);
console.log(specificSnapshot.getId()); // Output: '123'
specificSnapshot.setData(new Map([["updatedKey", { id: "updatedId", name: "Updated Data" } as BaseData]]));console.log(specificSnapshot.data); // Output: 'updated snapshot data'





function convertToSnapshotStoreConfig<T extends BaseData, K extends BaseData>(snapshotStore: SnapshotStore<T, K>): SnapshotStoreConfig<BaseData, any> {
  
  const mappedSnapshots: SnapshotStore<BaseData, any>[] = snapshotStore.snapshots.map(s => ({
    ...s,
    configOption: s.configOption ? {
      ...s.configOption,
      // Explicitly cast or handle nested properties if needed
    } : null,
    initialState: s.initializedState ? {
     ...s.initializedState,
      // Explicitly cast or handle nested properties if needed
    } : null


  }));
  
  const mappedState: Snapshot<BaseData>[] | null = snapshotStore.state ? snapshotStore.state.map(snapshot => ({
    ...snapshot,
    store: snapshot.store ? convertToSnapshotStoreConfig(snapshot.store) : undefined
  })) : null;

  // Example mapping, adjust as per your actual properties and requirements
  return {
    id: snapshotStore.id,
    snapshotId: snapshotStore.snapshotId,
    key: snapshotStore.key,
    priority: snapshotStore.priority,
    topic: snapshotStore.topic,
    status: snapshotStore.status,
    category: snapshotStore.category,
    timestamp: snapshotStore.date, // Assuming date is timestamp in SnapshotStoreConfig
    state: mappedState,
    snapshots: mappedSnapshots,
    subscribers: snapshotStore.subscribers,
    subscription: snapshotStore.subscription ? {
      unsubscribe: snapshotStore.subscription.unsubscribe ? snapshotStore.subscription.unsubscribe : () => {},
      portfolioUpdates: snapshotStore.subscription.portfolioUpdates ? snapshotStore.subscription.portfolioUpdates : () => {},
      tradeExecutions: snapshotStore.subscription.tradeExecutions ? snapshotStore.subscription.tradeExecutions : () => {},
      marketUpdates: snapshotStore.subscription.marketUpdates ? snapshotStore.subscription.marketUpdates : () => {},
      triggerIncentives: snapshotStore.subscription.triggerIncentives ? snapshotStore.subscription.triggerIncentives : () => {},
      communityEngagement: snapshotStore.subscription.communityEngagement ? snapshotStore.subscription.communityEngagement : () => {},
      portfolioUpdatesLastUpdated: snapshotStore.subscription.portfolioUpdatesLastUpdated ? snapshotStore.subscription.portfolioUpdatesLastUpdated : 0,
      determineCategory: snapshotStore.subscription.determineCategory ? snapshotStore.subscription.determineCategory : () => {},
            // Map other subscription properties as needed
    } : null,
    initialState: snapshotStore.initializedState,
    clearSnapshots: snapshotStore.clearSnapshots,
    isCompressed: snapshotStore.isCompressed,
    expirationDate: snapshotStore.expirationDate,
    tags: snapshotStore.tags,
    metadata: snapshotStore.metadata,
    configOption: snapshotStore.configOption,
    // Map other properties
    setSnapshotData: snapshotStore.setSnapshotData,
    // Ensure all required properties are mapped
  };
}



// Conversion function
const convertSnapshotStoreToSnapshot = (store: SnapshotStore<T,K>): Snapshot<BaseData> => {
  // Implement the logic to convert SnapshotStore<BaseData> to Snapshot<BaseData>
  return {
    id: store.id,
    title: store.title,
    timestamp: store.timestamp,
    subscriberId: store.subscriberId,
    category: store.category,
    length: store.length,
    content: store.content,
    data: store.data,
    value: store.value,
    key: store.key,
    subscription: store.subscription,
    config: store.config,
    status: store.status,
    metadata: store.metadata,
    delegate: store.getDelegate(),
    store: store as SnapshotStore<T, K>,
    state: store.state,
    todoSnapshotId: store.todoSnapshotId,
    initialState: store.initializedState
  } as Snapshot<BaseData>;
}
// Export the specific snapshot type if needed
export { YourSpecificSnapshotType };
  
  
const snapshotType = <T extends BaseData>(snapshot: Snapshot<T>): Snapshot<T> => {
  const newSnapshot = { ...snapshot } as Snapshot<T>;
  newSnapshot.id = snapshot.id || generateSnapshotId
  newSnapshot.title = snapshot.title || "";
  newSnapshot.timestamp = snapshot.timestamp ? new Date(snapshot.timestamp) : new Date();
  newSnapshot.subscriberId = snapshot.subscriberId || "";
  newSnapshot.category = typeof snapshot.category === "string" ? defaultCategory : snapshot.category || defaultCategory;
  newSnapshot.length = snapshot.length || 0;
  newSnapshot.content = snapshot.content || "";
  newSnapshot.data = snapshot.data as Map<string, T>;
  newSnapshot.value = snapshot.value || 0;
  newSnapshot.key = snapshot.key || "";
  newSnapshot.subscription = snapshot.subscription || null;
  newSnapshot.config = snapshot.config || null;
  newSnapshot.status = snapshot.status || "";
  newSnapshot.metadata = snapshot.metadata || {};
  newSnapshot.delegate = snapshot.delegate ? snapshot.delegate.map(delegateConfig => ({
    ...delegateConfig,
    data: delegateConfig.data as T,
    snapshotStore: delegateConfig.snapshotStore as SnapshotStore<T, T>
  })) : [];
  newSnapshot.store = snapshot.store as SnapshotStore<T, T>;
  newSnapshot.state = snapshot.state as Snapshot<T>;
  newSnapshot.todoSnapshotId = snapshot.todoSnapshotId || "";
  newSnapshot.initialState = snapshot.initialState as ChosenSnapshotState
  return newSnapshot;
};




// Type guard to check if input is SnapshotStore<BaseData>

// Type guard to check if input is SnapshotStore<BaseData>
const isSnapshotStore = (store: any): store is SnapshotStore<BaseData, K> => {
  return store && store instanceof SnapshotStore;
};

// Function to convert SnapshotStore<BaseData> to Map<string, T>
const convertSnapshotStoreToMap = <T extends BaseData>(store: SnapshotStore<BaseData, K>): Map<string, T> => {
  const dataMap = new Map<string, T>();
  
  // Assuming 'data' is an array or iterable within SnapshotStore<BaseData>
  store.data.forEach((item: BaseData) => {
    // Type assertion to T if you're confident item can be cast to T
    if (item.id !== undefined) {
      dataMap.set(item.id.toString(), item as T);
    }
  });
  
  return dataMap;
}



function convertMapToSnapshotStore<T extends BaseData>(map: Map<string, T>): SnapshotStore<T, T> {
  const snapshotStore: SnapshotStore<T, K> = new SnapshotStore<T, K>(options); // Initialize SnapshotStore

  // Populate snapshotStore with map data
  map.forEach((value, key) => {
    const snapshot: Snapshot<T> = {
      id: key,
      data: new Map<string, T>().set(key, value),
      initialState: null, // Set initialState as needed
      timestamp: new Date(), // Set timestamp or other properties
    };
    snapshotStore.addData(snapshot); // Example method to add data to SnapshotStore
  });

  return snapshotStore;
}

export { convertSnapshotStoreToMap, convertSnapshotStoreToSnapshot, isSnapshotStore, snapshotType, convertToSnapshotStoreConfig, convertMapToSnapshotStore };
export type { ChosenSnapshotState };

