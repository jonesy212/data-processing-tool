import { Snapshot } from "../snapshots/LocalStorageSnapshotStore";
import { generateSnapshotId } from "../utils/snapshotUtils";
import SnapshotStore, { defaultCategory } from "../snapshots/SnapshotStore";
import { CategoryProperties } from "@/app/pages/personas/ScenarioBuilder";
import {
  CommunicationType,
  CollaborationOption,
  CreationPhase,
  CryptoFeature,
  CryptoAction,
  CryptoInformation,
  CryptoCommunity,
  BlockchainCapability,
} from "@/app/typings/appTypes";
import { BaseData } from "../models/data/Data";
import { SnapshotStoreConfig } from "../snapshots/SnapshotConfig";
import { DataStore } from "../projects/DataAnalysisPhase/DataProcessing/DataStore";



type ChosenSnapshotState = Snapshot<BaseData> | SnapshotStore<BaseData> | null | undefined
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





// Conversion function
const convertSnapshotStoreToSnapshot = (store: SnapshotStore<BaseData>): Snapshot<BaseData> => {
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
    delegate: store.delegate,
    store: store as SnapshotStore<BaseData>,
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
    data: delegateConfig.data as T | SnapshotStoreConfig<BaseData, T> | null | undefined,
    snapshot: delegateConfig.snapshot as (
      id: string,
      snapshotData: SnapshotStoreConfig<any, T>,
      category: string | CategoryProperties | undefined,
      callback: (snapshot: Snapshot<Data>) => void
    ) => Promise<void>
  })) : [];
  newSnapshot.store = snapshot.store as SnapshotStore<T>;
  newSnapshot.state = snapshot.state as Snapshot<T>;
  newSnapshot.todoSnapshotId = snapshot.todoSnapshotId || "";
  newSnapshot.initialState = snapshot.initialState as ChosenSnapshotState
  return newSnapshot;
};


export { snapshotType, convertSnapshotStoreToSnapshot };
