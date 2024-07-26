import { convertedData } from "./../state/stores/CalendarEvent";
import { CategoryProperties } from "@/app/pages/personas/ScenarioBuilder";
import { SnapshotStoreOptions, options } from "../hooks/useSnapshotManager";
import { BaseData } from "../models/data/Data";
import { DataStoreWithSnapshotMethods } from "../projects/DataAnalysisPhase/DataProcessing/ DataStoreMethods";
import { Snapshot, Snapshots } from "../snapshots/LocalStorageSnapshotStore";
import { SnapshotStoreConfig } from "../snapshots/SnapshotConfig";
import { SnapshotStoreMethod } from "../snapshots/SnapshotStorMethods";
import SnapshotStore, { defaultCategory, handleSnapshotOperation } from "../snapshots/SnapshotStore";
import { Subscriber } from "../users/Subscriber";
import { addToSnapshotList, generateSnapshotId } from "../utils/snapshotUtils";
import {
  Callback,
  subscribeToSnapshotsImpl,
  subscribeToSnapshotImpl,
} from "../snapshots/subscribeToSnapshotsImplementation";
import { userId } from "../users/ApiUser";
import { fetchSnapshotById, getSnapshotId } from "@/app/api/SnapshotApi";
import { displayToast } from "../models/display/ShowToast";

type T = Snapshot<BaseData>; // BaseData is a base type shared by all data entities
type K = T; // K could be the same as T or a different specialized type

type ChosenSnapshotState =
  | SnapshotStoreConfig<BaseData, BaseData>
  | SnapshotStore<BaseData, BaseData>
  | Snapshot<BaseData, BaseData>
  | null
  | undefined;
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
specificSnapshot.setData(
  new Map([
    ["updatedKey", { id: "updatedId", name: "Updated Data" } as BaseData],
  ])
);
console.log(specificSnapshot.data); // Output: 'updated snapshot data'

function convertToSnapshotStoreConfig<T extends BaseData, K extends BaseData>(
  snapshotStore: SnapshotStore<T, K>
): SnapshotStoreConfig<BaseData, any> {
  const mappedSnapshots: SnapshotStore<BaseData, any>[] =
    snapshotStore.snapshots.map((s) => ({
      ...s,
      configOption: s.configOption
        ? {
          ...s.configOption,
          // Explicitly cast or handle nested properties if needed
        }
        : null,
      initialState: s.initializedState
        ? {
          ...s.initializedState,
          // Explicitly cast or handle nested properties if needed
        }
        : null,
    }));

  const mappedState: Snapshot<BaseData>[] | null = snapshotStore.state
    ? snapshotStore.state.map((snapshot) => ({
      ...snapshot,
      store: snapshot.store
        ? convertToSnapshotStoreConfig(snapshot.store)
        : undefined,
    }))
    : null;

  function isSnapshot<T extends BaseData, K extends BaseData>(
    obj: any
  ): obj is Snapshot<T, K> {
    return obj && typeof obj === "object" && "id" in obj && "data" in obj;
  }

  function isSubscriber<T extends BaseData, K extends BaseData>(
    obj: any
  ): obj is Subscriber<T, K> {
    return (
      obj &&
      typeof obj === "object" &&
      "getId" in obj &&
      "_id" in obj &&
      "name" in obj &&
      "subscription" in obj
    );
  }

  //createa a mappedSubscribers:


  const mappedSubscribers: Subscriber<BaseData, any>[] =
    snapshotStore.subscribers.map((s) => {
      if (isSubscriber<BaseData, any>(s)) {
        return {
          ...s,
          getId: s.getId,
          // _id: s.getId(),
          name: s.getName(),
          subscriberId: s.getSubscriberId(),
          subscription: s.getSubscription(),
          subscribers: s.getSubscribers(userId!, snapshotId) || [],
          onSnapshotCallbacks: s.getOnSnapshotCallbacks || [],
          onErrorCallbacks: s.getOnErrorCallbacks || [],
          onUnsubscribeCallbacks: s.getOnUnsubscribeCallbacks || [],
          notifyEventSystem: s.getNotifyEventSystem() || (() => { }),
          updateProjectState: s.getUpdateProjectState() || (() => { }),
          logActivity: s.getLogActivity() || (() => { }),
          triggerIncentives: s.getTriggerIncentives() || (() => { }),
          newData: s.getNewData() || null,
          defaultSubscribeToSnapshots: s.getDefaultSubscribeToSnapshots() || (() => { }),
          subscribeToSnapshots: s.getSubscribeToSnapshots() || (() => { }),
          transformSubscriber: s.getTransformSubscriber() || (() => { }),
          optionalData: s.getOptionalData() || null,
          email: s.getEmail() || '',
          snapshotIds: s.getSnapshotIds() || [],
          payload: s.getPayload() || {},
          fetchSnapshotIds: s.getFetchSnapshotIds() || (() => Promise.resolve([])),
          id: s.id || '',
          getEmail: s.getEmail || (() => ''),
          getOptionalData: s.getOptionalData || (() => null),
          getFetchSnapshotIds: s.getFetchSnapshotIds || (() => Promise.resolve([])),
          getSnapshotIds: s.getSnapshotIds || (() => []),
          getNotifyEventSystem: s.getNotifyEventSystem || (() => { }),
          getUpdateProjectState: s.getUpdateProjectState || (() => { }),
          getLogActivity: s.getLogActivity || (() => { }),
          getTriggerIncentives: s.getTriggerIncentives || (() => { }),
          getName: s.getName || (() => ''),
          snapshots: s.snapshots || [],
          determineCategory: s.getDetermineCategory(data) || (() => ''),
          getSubscriberId: s.getSubscriberId || (() => ''),
          subscribersById: s.getSubscribersById(),
          getSubscribers: s.getSubscribers,
          setSubscribers: s.setSubscribers,
          getOnSnapshotCallbacks: s.getOnSnapshotCallbacks,
          setOnSnapshotCallbacks: s.setOnSnapshotCallbacks,
          getOnErrorCallbacks: s.getOnErrorCallbacks,
          setOnErrorCallbacks: s.setOnErrorCallbacks,
          getOnUnsubscribeCallbacks: s.getOnUnsubscribeCallbacks,
          setOnUnsubscribeCallbacks: s.setOnUnsubscribeCallbacks,
          setNotifyEventSystem: s.setNotifyEventSystem,
          setUpdateProjectState: s.setUpdateProjectState,
          setLogActivity: s.setLogActivity,
          setTriggerIncentives: s.setTriggerIncentives,
          setOptionalData: s.setOptionalData,
          setEmail: s.setEmail,
          setSnapshotIds: s.setSnapshotIds,
          getPayload: s.getPayload,
          handleCallback: s.handleCallback,
          snapshotCallback: s.snapshotCallback,
          subscribe: s.subscribe,
          unsubscribe: s.unsubscribe,
          getData: s.getData,
          getDetermineCategory: s.getDetermineCategory,
          initialData: s.initialData,
          fetchSnapshotById: s.fetchSnapshotById,
          toSnapshotStore: s.toSnapshotStore,
          getDeterminedCategory: s.getDeterminedCategory,
          processNotification: s.processNotification,
          receiveSnapshot: s.receiveSnapshot,
          getState: s.getState,
          onError: s.onError,
          getSubscribersById: s.getSubscribersById,
          getSubscribersWithSubscriptionPlan: s.getSubscribersWithSubscriptionPlan,
          getSubscription: s.getSubscription,
          onUnsubscribe: s.onUnsubscribe,
          onSnapshot: s.onSnapshot,
          onSnapshotError: s.onSnapshotError,
          triggerOnSnapshot: s.triggerOnSnapshot,
          onSnapshotUnsubscribe: s.onSnapshotUnsubscribe,

          // Add other required properties here
        };
      } else {
        // Handle the case where `s` is not a `Subscriber<BaseData, any>`
        throw new Error("Invalid subscriber type");
      }
    }).filter((s): s is Subscriber<BaseData, any> => s !== null); // Filter out `null` values
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
    subscribers: mappedSubscribers,
    subscription: snapshotStore.subscription
      ? {
        unsubscribe: snapshotStore.subscription.unsubscribe ?? (() => { }),
        portfolioUpdates:
          snapshotStore.subscription.portfolioUpdates ?? (() => { }),
        tradeExecutions:
          snapshotStore.subscription.tradeExecutions ?? (() => { }),
        marketUpdates: snapshotStore.subscription.marketUpdates ?? (() => { }),
        triggerIncentives:
          snapshotStore.subscription.triggerIncentives ?? (() => { }),
        communityEngagement:
          snapshotStore.subscription.communityEngagement ?? (() => { }),
        portfolioUpdatesLastUpdated:
          snapshotStore.subscription.portfolioUpdatesLastUpdated ?? 0,
        determineCategory:
          snapshotStore.subscription.determineCategory ?? (() => { }),
      }
      : null,
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

function convertSnapshotToStore<T extends BaseData, K extends BaseData>(
  snapshot: Snapshot<T, K>
): SnapshotStore<T, K> {
  // Manually convert snapshot to snapshot store
  return {
    snapshotId: snapshot.id,
    conifigOption: {}, // Populate appropriately
    set: new Set(), // Initialize or populate
    snapshots: [], // Initialize or populate
    state: [], // Initialize or populate
    id: "", // Add placeholder values for required properties
    key: "",
    topic: "",
    date: new Date(),
    configOption,
    config,
    title,
    category,
    message,
    timestamp,
    createdBy,
    type,
    subscribers,
    data,
    store,
    snapshotConfig,
    dataStore,
    initialState,
    dataStoreMethods,
    delegate,
    subscriberId, length, content, value,
    todoSnapshotId, events, snapshotStore, dataItems,
    newData, defaultSubscribeToSnapshots, subscribeToSnapshots, transformSubscriber,
    transformDelegate, initializedState, getAllKeys, getAllItems,
    addData, addDataStatus, removeData, updateData,
    updateDataTitle, updateDataDescription, updateDataStatus, addDataSuccess,
    getDataVersions, updateDataVersions, getBackendVersion, getFrontendVersion,
    fetchData, defaultSubscribeToSnapshot, handleSubscribeToSnapshot, snapshot,
    removeItem, getSnapshot, getSnapshotSuccess, getSnapshotId,
    getItem, setItem, addSnapshotFailure, getDataStore,
    addSnapshotSuccess, compareSnapshotState, deepCompare, shallowCompare,
    getDataStoreMethods, getDelegate, determineCategory, determinePrefix,
    updateSnapshot, updateSnapshotSuccess, updateSnapshotFailure, removeSnapshot,
    snapshotItems, nestedStores, addSnapshotItem, addNestedStore,

    // other properties from SnapshotStore<T, K>
  } as SnapshotStore<T, K>;
}

// Conversion function
const convertSnapshotStoreToSnapshot = (
  store: SnapshotStore<BaseData, K>
): Snapshot<BaseData> => {
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
    store: store as SnapshotStore<BaseData, BaseData>,
    state: store.state,
    todoSnapshotId: store.todoSnapshotId,
    initialState: store.initializedState,
  } as Snapshot<BaseData>;
};
// Export the specific snapshot type if needed
export { YourSpecificSnapshotType };

const convertSnapshotData = <T extends BaseData, K extends BaseData>(
  snapshotStoreConfigData: SnapshotStoreConfig<any, T>
): SnapshotStoreConfig<any, K> => {
  return snapshotStoreConfigData as unknown as SnapshotStoreConfig<any, K>;
};

const snapshotType = <T extends BaseData>(
  snapshot: Snapshot<T>
): Snapshot<T> => {
  const newSnapshot = { ...snapshot } as Snapshot<T>;
  newSnapshot.id = snapshot.id || generateSnapshotId;
  newSnapshot.title = snapshot.title || "";
  newSnapshot.timestamp = snapshot.timestamp
    ? new Date(snapshot.timestamp)
    : new Date();
  newSnapshot.subscriberId = snapshot.subscriberId || "";
  newSnapshot.category =
    typeof snapshot.category === "string"
      ? defaultCategory
      : snapshot.category || defaultCategory;
  newSnapshot.length = snapshot.length || 0;
  newSnapshot.content = snapshot.content || "";
  newSnapshot.data = snapshot.data as Map<string, Snapshot<T>>;
  newSnapshot.value = snapshot.value || 0;
  newSnapshot.key = snapshot.key || "";
  newSnapshot.subscription = snapshot.subscription || null;
  newSnapshot.config = snapshot.config || null;
  newSnapshot.status = snapshot.status || "";
  newSnapshot.metadata = snapshot.metadata || {};
  newSnapshot.delegate = snapshot.delegate
    ? snapshot.delegate.map((delegateConfig) => ({
      ...delegateConfig,
      data: delegateConfig.data as T,
      snapshotStore: delegateConfig.snapshotStore as SnapshotStore<T, T>,
    }))
    : [];
  newSnapshot.store = snapshot.store as SnapshotStore<T, T>;
  newSnapshot.state = snapshot.state as Snapshot<T>;
  newSnapshot.todoSnapshotId = snapshot.todoSnapshotId || "";
  newSnapshot.initialState = snapshot.initialState;
  return newSnapshot;
};

// Type guard to check if input is SnapshotStore<BaseData>
const isSnapshotStore = (store: any): store is SnapshotStore<BaseData, K> => {
  return store && store instanceof SnapshotStore;
};


const convertSnapshotData = <T extends BaseData, K extends BaseData>(
  snapshot: Snapshot<T, K>
): Snapshot<T, T> => {
  return {
    ...snapshot,
    data: snapshot.data as unknown as T, // Adjust if necessary based on your data structure
  };
};


// Conversion function to convert SnapshotStore to T
const convertSnapshotStoreItemToT = <T extends BaseData>(
  item: Snapshot<T, T>
): T => {
  // Convert Snapshot item to T, assuming T and Snapshot<T, T> share compatible structure
  return {
    id: item.data.keys().next().value 
    // Copy other properties if needed
  } as T;
};

// Function to convert SnapshotStore<BaseData> to Map<string, T>
const convertSnapshotStoreToMap = <T extends BaseData, K extends BaseData>(
  store: SnapshotStore<T, K>
): Map<string, T> => {
  const dataMap = new Map<string, T>();

  // Assuming 'data' is an array or iterable within SnapshotStore<BaseData>
  store.data.forEach((item: Snapshot<T, K>, key: string) => {
    // Type assertion to ensure item is compatible with Snapshot<T, T>
    const typedItem = item as unknown as Snapshot<T, T>;
    // Use the conversion function to convert item to T
    const convertedItem = convertSnapshotStoreItemToT(typedItem);
    dataMap.set(key, convertedItem);
  });

  return dataMap;
};

function convertMapToSnapshotStore<T extends BaseData, K extends BaseData = T>(
  map: Map<string, T>
): SnapshotStore<T, K> {
  const snapshotStoreOptions = options<T, K>({
    initialState: null,
    snapshotId: "defaultId",
    category: {} as CategoryProperties, // Adjust as needed
    dataStoreMethods: {} as Partial<DataStoreWithSnapshotMethods<T, K>>, // Provide actual methods if needed
  });

  const snapshotStore = new SnapshotStore<T, K>(snapshotStoreOptions); // Initialize SnapshotStore

  // Populate snapshotStore with map data
  map.forEach((value, key) => {
    const snapshot: Snapshot<T, K> = {
      id: key,
      data: new Map<string, Snapshot<T>>().set(key, value),
      initialState: null, // Set initialState as needed
      timestamp: new Date(), // Set timestamp or other properties
    };
    snapshotStore.addData(snapshot); // Example method to add data to SnapshotStore
  });

  return snapshotStore;
}

const createSnapshotStoreOptions = <T extends BaseData, K extends BaseData>({
  initialState,
  snapshotId,
  category,
  dataStoreMethods,
}: {
  initialState: SnapshotStore<T, K> | Snapshot<T, K> | null;
  snapshotId: string;
  category: CategoryProperties;
  dataStoreMethods: Partial<DataStoreWithSnapshotMethods<T, K>>;
}): SnapshotStoreOptions<T, K> => ({
  data: {} as Partial<SnapshotStore<T, K>>, // Adjust as per your actual data requirement
  initialState,
  snapshotId,
  category,
  date: new Date(),
  type: "default-type",
  snapshotConfig: [], // Adjust as needed
  subscribeToSnapshots: (
    snapshotId: string,
    callback: (snapshots: Snapshots<T>) => Subscriber<T, T> | null,
    snapshot: Snapshot<T, K>
  ) => {
    const convertedSnapshot = convertSnapshot(snapshot);
    subscribeToSnapshotsImpl(snapshotId, callback, convertedSnapshot);
  },
  subscribeToSnapshot: (
    snapshotId: string,
    callback: Callback<Snapshot<T, T>>,
    snapshot: Snapshot<T, K>
  ) => {
    const convertedSnapshot = convertSnapshot(snapshot);
    subscribeToSnapshotImpl(snapshotId, callback, convertedSnapshot);
  },
  getDelegate: {} as SnapshotStoreConfig<T, K>[],
  getDataStoreMethods: () => dataStoreMethods as DataStoreWithSnapshotMethods<T, K>[],
  snapshotMethods: [],
  delegate: [], // Adjust as needed
  dataStoreMethods: dataStoreMethods as DataStoreWithSnapshotMethods<T, K>,
  handleSnapshotOperation: handleSnapshotOperation,
  displayToast: displayToast,
  addToSnapshotList: addToSnapshotList
});

function convertSnapshot<T extends BaseData, K extends BaseData>(
  snapshot: Snapshot<T, K>
): Snapshot<T, T> {
  if (!snapshot.store) {
    throw new Error("Snapshot store is undefined");
  }

  // Convert dataStoreMethods
  const dataStoreMethods = snapshot.store.getDataStoreMethods() as DataStoreWithSnapshotMethods<T, K>;

  // Convert snapshot methods
  const convertedSnapshotMethods = dataStoreMethods.snapshotMethods.map(
    (method: SnapshotStoreMethod<T, K>) => ({
      ...method,
      snapshot: (
        id: string,
        snapshotData: SnapshotStoreConfig<any, T>,
        category: string | CategoryProperties | undefined,
        callback: (snapshots: Snapshots<T>) => void
      ) =>
        method.snapshot(
          id,
          convertSnapshotData<T, K>(snapshotData),
          category,
          callback
        ),
    })
  ) as SnapshotStoreMethod<T, T>[];

  // Convert snapshotConfig
  const convertedSnapshotConfig = snapshot.store.snapshotConfig.map(
    (config) => ({
      ...config,
      dataStoreMethods: {
        ...config.dataStoreMethods,
        snapshotMethods: config.dataStoreMethods?.snapshotMethods?.map(
          (method: SnapshotStoreMethod<T, K>) => ({
            ...method,
            snapshot: (
              id: string,
              snapshotData: SnapshotStoreConfig<any, T>,
              category: string | CategoryProperties | undefined,
              callback: (snapshots: Snapshots<T>) => void
            ) =>
              method.snapshot(
                id,
                convertSnapshotData<T, K>(snapshotData),
                category,
                callback
              ),
          })
        ) as SnapshotStoreMethod<T, T>[],
      },
    })
  ) as unknown as SnapshotStoreConfig<T, T>[];

  // Convert dataStoreMethods to ensure compatibility with DataStoreWithSnapshotMethods<T, T>
  const convertedDataStoreMethods: DataStoreWithSnapshotMethods<T, T> = {
    ...dataStoreMethods,
    snapshotMethods: dataStoreMethods.snapshotMethods.map(
      (method) => ({
        ...method,
        snapshot: (
          id: string,
          snapshotData,
          category,
          callback
        ) =>
          method.snapshot(
            id,
            convertSnapshotData(snapshotData as SnapshotStoreConfig<any, T>),
            category,
            callback
          ),
      })
    ) as SnapshotStoreMethod<T, T>[], // Type assertion to ensure compatibility
    getDelegate: dataStoreMethods.getDelegate as (id: string) => SnapshotStoreConfig<T, T>[], // Type assertion
    // Map other properties accordingly
  };
  // Create newStore
  const newStore = new SnapshotStore<T, T>({
    ...snapshot.store.config,
    snapshotId: snapshot.store.id,
    category: snapshot.store.category,
    date: snapshot.store.timestamp,
    type: snapshot.store.type,
    snapshotConfig: convertedSnapshotConfig,
    delegate: snapshot.store.getDelegate().map((delegateConfig) => ({
      ...delegateConfig,
      data: delegateConfig.data as T,
      snapshotStore: delegateConfig.snapshotStore as SnapshotStore<T, T>,
    })),
    getDataStoreMethods: () => [convertedDataStoreMethods],
    getDelegate: snapshot.store.getDelegate(),
    dataStoreMethods: convertedDataStoreMethods,
    snapshotMethods: convertedSnapshotMethods,
    handleSnapshotOperation: handleSnapshotOperation,
    displayToast: displayToast,
    addToSnapshotList: addToSnapshotList,
    data: {} as Partial<SnapshotStore<T, T>>, // Adjust as needed
  });

  return {
    ...snapshot,
    store: newStore,
    initialState: snapshot.initialState as
      | Snapshot<T, T>
      | SnapshotStore<T, T>
      | null
      | undefined,
  };
}


// Convert Map<string, T> to Snapshot<BaseData, BaseData>
function convertMapToSnapshot<T extends BaseData>(
  map: Map<string, T>
): Snapshot<BaseData, BaseData> {
  const dataMap = new Map<string, BaseData>();

  map.forEach((value, key) => {
    dataMap.set(key, value as BaseData); // Ensure that T can be cast to BaseData
  });

  return {
    id: "some-id", // Set appropriate ID or generate one
    title: "Snapshot Title", // Set appropriate title
    timestamp: new Date(), // Set appropriate timestamp
    subscriberId: "some-subscriber-id", // Set appropriate subscriber ID
    category: "some-category", // Set appropriate category
    length: dataMap.size, // Set appropriate length
    content: dataMap.toString(), // Set appropriate content
    data: dataMap,
    value: 0, // Set appropriate value
    key: "some-key", // Set appropriate key
    subscription: null, // Set appropriate subscription
    config: null, // Set appropriate config
    status: "active", // Set appropriate status
    metadata: {}, // Set appropriate metadata
    delegate: [], // Set appropriate delegate
    store: null, // Set appropriate store
    state: null, // Set appropriate state
    todoSnapshotId: "some-todo-id", // Set appropriate todo snapshot ID
    initialState: null, // Set appropriate initial state if needed
  };
}

function convertSnapshotContent<T extends BaseData>(
  snapshotContent: Map<string, T>
): Map<string, BaseData> {
  const content = new Map<string, BaseData>();

  snapshotContent.forEach((value, key) => {
    content.set(key, value as BaseData); // Assuming T can be safely cast to BaseData
  });

  return content;
}

export {
  convertMapToSnapshot,
  convertMapToSnapshotStore,
  convertSnapshot,
  convertSnapshotStoreToMap,
  convertSnapshotStoreToSnapshot,
  convertSnapshotToStore,
  convertToSnapshotStoreConfig,
  isSnapshotStore,
  snapshotType,
  createSnapshotStoreOptions,
  convertSnapshotContent,
  convertSnapshotData
};
export type { ChosenSnapshotState };
