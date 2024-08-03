import { CalendarEvent, convertedData } from "./../state/stores/CalendarEvent";
import { CategoryProperties } from "@/app/pages/personas/ScenarioBuilder";
import { CombinedEvents, SnapshotStoreOptions, options } from "../hooks/useSnapshotManager";
import { BaseData, Data } from "../models/data/Data";
import { DataStoreWithSnapshotMethods } from "../projects/DataAnalysisPhase/DataProcessing/ DataStoreMethods";
import { getCurrentSnapshotConfigOptions, Snapshot, Snapshots } from "../snapshots/LocalStorageSnapshotStore";
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

// Define YourSpecificSnapshotTywpe implementing Snapshot<T, K>
class YourSpecificSnapshotType<T extends BaseData, K extends BaseData> implements Snapshot<T, K> {
  id: string;
  data: Map<string, Snapshot<T, K>>;
  meta:Map<string, Snapshot<T, K>>;
  events: CombinedEvents<T, K>; 

  constructor(id: string,
    data: Map<string, Snapshot<T, K>>,
    meta: Map<string, Snapshot<T, K>>,
    events?: CombinedEvents<T, K>) {
    this.id = id;
    this.data = data;
    this.meta = meta;
    this.events = events ?? {
      eventRecords: {},
      eventIds: [],
       callbacks: (snapshot: Snapshot<T, K>) => {
         console.log("callback called");
         // 
         return;
       },
      subscribers: [],
       
    }; // Initialize with default if not provided
  }


  // Implement methods required by Snapshot<T, K>
  getId(): string {
    return this.id;
  }

  setData(data: Map<string, Snapshot<T, K>>): void {
    this.data = data;
    // Additional logic if necessary
  }
}

// Create specific snapshot with SampleSnapshot
const specificSnapshot = new YourSpecificSnapshotType<string, BaseData>(
  "123",
  new Map([
    ["key", new SampleSnapshot("keyId", new Map(), new Map(), {})],
  ]),
  new Map()
);

// Update data
specificSnapshot.setData(
  new Map([
    ["updatedKey", new SampleSnapshot("updatedId", new Map(), new Map(), {})],
  ])
);

console.log(specificSnapshot.getId()); // Output: '123'
console.log(specificSnapshot.data); // Output: 'updated snapshot data'







function convertToSnapshotStoreConfig<T extends BaseData, K extends BaseData>(
  snapshotStore: SnapshotStore<T, K>
): SnapshotStoreConfig<BaseData, any> {
  const mappedSnapshots: SnapshotStore<BaseData, any>[] =
    snapshotStore.snapshots.map((s) => ({
      ...s,
      ...snapshotStore,
      snapshotId: s.snapshotId || '',
      set: s.set || new Set(),
      snapshots: s.snapshots || [],
      snapshotItems: s.snapshotItems || [],
      configOption: s.configOption || {},
      initialState: s.initialState || null,
      nestedStores: s.nestedStores || [],
      events: s.events || [],
      snapshotStore: s.snapshotStore || null,
      dataItems: s.dataItems || [],
      newData: s.newData || [],
      stores: s.stores || [],
      snapshotStoreConfig: s.snapshotStoreConfig || null,
      getSnapshotItems: s.getSnapshotItems || [],
      dataStoreMethods, delegate, getData, addSnapshotItem,
      dataStoreMethods, delegate, getData, addSnapshotItem,
      // Add other required properties here
    }));

  const mappedState: Snapshot<BaseData, K>[] | null = snapshotStore.state
    ? snapshotStore.state.map((
      snapshot: Snapshot<T, K>
    ) => ({
      ...snapshot,
      store: snapshot.store
        ? convertToSnapshotStoreConfig(snapshot.store)
        : undefined,
      set: snapshot.set || new Set(),
      snapshots: snapshot.snapshots || [],
      snapshotItems: snapshot.snapshotItems || [],
      configOption: snapshot.configOption || {},
      date: snapshot.date || null,
      message: snapshot.message || '',
      createdBy: snapshot.createdBy || '',
      type: snapshot.type || '',
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

  const mappedSubscribers: Subscriber<BaseData, any>[] =
    snapshotStore.subscribers.map((s) => {
      if (isSubscriber<BaseData, any>(s)) {
        return {
          ...s,
          getId: s.getId,
          name: s.getName(),
          _id: s.getId(),
          subscriberId: s.getSubscriberId(),
          subscription: s.getSubscription(),
          subscribers: s.getSubscribers ? s.getSubscribers : [],
          onSnapshotCallbacks: s.getOnSnapshotCallbacks ? s.getOnSnapshotCallbacks : [],
          onErrorCallbacks: s.getOnErrorCallbacks ? s.getOnErrorCallbacks : [],
          onUnsubscribeCallbacks: s.getOnUnsubscribeCallbacks ? s.getOnUnsubscribeCallbacks : [],
          notifyEventSystem: s.getNotifyEventSystem ? s.getNotifyEventSystem() : () => {},
          updateProjectState: s.getUpdateProjectState ? s.getUpdateProjectState() : () => {},
          logActivity: s.getLogActivity ? s.getLogActivity() : () => {},
          triggerIncentives: s.getTriggerIncentives ? s.getTriggerIncentives() : () => {},
          newData: s.getNewData ? s.getNewData() : null,
          defaultSubscribeToSnapshots: s.getDefaultSubscribeToSnapshots ? s.getDefaultSubscribeToSnapshots : () => {},
          subscribeToSnapshots: s.getSubscribeToSnapshots ? s.getSubscribeToSnapshots() : () => {},
          transformSubscriber: s.getTransformSubscriber ? s.getTransformSubscriber() : () => {},
          optionalData: s.getOptionalData ? s.getOptionalData() : null,
          email: s.getEmail ? s.getEmail() : '',
          snapshotIds: s.getSnapshotIds ? s.getSnapshotIds() : [],
          payload: s.getPayload ? s.getPayload : {},
          fetchSnapshotIds: s.getFetchSnapshotIds ? s.getFetchSnapshotIds() : () => Promise.resolve([]),
          id: s.id || '',
          getEmail: s.getEmail || (() => ''),
          getOptionalData: s.getOptionalData || (() => null),
          getFetchSnapshotIds: s.getFetchSnapshotIds || (() => Promise.resolve([])),
          getSnapshotIds: s.getSnapshotIds || (() => []),
          getNotifyEventSystem: s.getNotifyEventSystem || (() => {}),
          getUpdateProjectState: s.getUpdateProjectState || (() => {}),
          getLogActivity: s.getLogActivity || (() => {}),
          getTriggerIncentives: s.getTriggerIncentives || (() => {}),
          getName: s.getName || (() => ''),
          snapshots: s.snapshots || [],
          determineCategory: s.getDetermineCategory ? s.getDetermineCategory(data) : () => '',
          getSubscriberId: s.getSubscriberId || (() => ''),
          subscribersById: s.getSubscribersById ? s.getSubscribersById() : {},
          getSubscribers: s.getSubscribers || (() => []),
          setSubscribers: s.setSubscribers || (() => {}),
          getOnSnapshotCallbacks: s.getOnSnapshotCallbacks || (() => []),
          setOnSnapshotCallbacks: s.setOnSnapshotCallbacks || (() => {}),
          getOnErrorCallbacks: s.getOnErrorCallbacks || (() => []),
          setOnErrorCallbacks: s.setOnErrorCallbacks || (() => {}),
          getOnUnsubscribeCallbacks: s.getOnUnsubscribeCallbacks || (() => []),
          setOnUnsubscribeCallbacks: s.setOnUnsubscribeCallbacks || (() => {}),
          setNotifyEventSystem: s.setNotifyEventSystem || (() => {}),
          setUpdateProjectState: s.setUpdateProjectState || (() => {}),
          setLogActivity: s.setLogActivity || (() => {}),
          setTriggerIncentives: s.setTriggerIncentives || (() => {}),
          setOptionalData: s.setOptionalData || (() => {}),
          setEmail: s.setEmail || (() => {}),
          setSnapshotIds: s.setSnapshotIds || (() => {}),
          getPayload: s.getPayload || (() => ({})),
          handleCallback: s.handleCallback || (() => {}),
          snapshotCallback: s.snapshotCallback || (() => {}),
          subscribe: s.subscribe || (() => {}),
          unsubscribe: s.unsubscribe || (() => {}),
          getData: s.getData || (() => null),
          getDetermineCategory: s.getDetermineCategory || (() => ''),
          initialData: s.initialData || null,
          fetchSnapshotById: s.fetchSnapshotById || (() => Promise.resolve(null)),
          toSnapshotStore: s.toSnapshotStore || (() => null),
          getDeterminedCategory: s.getDeterminedCategory || (() => ''),
          processNotification: s.processNotification || (() => {}),
          receiveSnapshot: s.receiveSnapshot || (() => {}),
          getState: s.getState || (() => null),
          onError: s.onError || (() => {}),
          getSubscribersById: s.getSubscribersById || (() => ({})),
          getSubscribersWithSubscriptionPlan: s.getSubscribersWithSubscriptionPlan || (() => []),
          getSubscription: s.getSubscription || (() => null),
          onUnsubscribe: s.onUnsubscribe || (() => {}),
          onSnapshot: s.onSnapshot || (() => {}),
          onSnapshotError: s.onSnapshotError || (() => {}),
          triggerOnSnapshot: s.triggerOnSnapshot || (() => {}),
          onSnapshotUnsubscribe: s.onSnapshotUnsubscribe || (() => {}),
          getNewData: s.getNewData || (() => null),
          enabled: s.getEnabled || false,
          tags: s.tags || [],
          transformSubscribers: s.getTransformSubscribers ? s.getTransformSubscribers() : null,
          getTransformSubscribers: s.getTransformSubscribers || (() => null),
          setEvent: s.setEvent,
        };
      } else {
        throw new Error("Invalid subscriber type");
      }
    }).filter((s): s is Subscriber<BaseData, any> => s !== null);

  return {
    id: snapshotStore.id,
    snapshotId: snapshotStore.snapshotId,
    key: snapshotStore.key,
    priority: snapshotStore.priority,
    topic: snapshotStore.topic,
    status: snapshotStore.status,
    category: snapshotStore.category,
    timestamp: snapshotStore.date,
    state: mappedState,
    snapshots: mappedSnapshots,
    subscribers: mappedSubscribers,
    subscription: snapshotStore.subscription
      ? {
        unsubscribe: snapshotStore.subscription.unsubscribe ?? (() => {}),
        portfolioUpdates:
          snapshotStore.subscription.portfolioUpdates ?? (() => {}),
        tradeExecutions:
          snapshotStore.subscription.tradeExecutions ?? (() => {}),
        marketUpdates: snapshotStore.subscription.marketUpdates ?? (() => {}),
        triggerIncentives:
          snapshotStore.subscription.triggerIncentives ?? (() => {}),
        communityEngagement:
          snapshotStore.subscription.communityEngagement ?? (() => {}),
        portfolioUpdatesLastUpdated:
          snapshotStore.subscription.portfolioUpdatesLastUpdated ?? 0,
        determineCategory:
          snapshotStore.subscription.determineCategory ?? (() => {}),
      }
      : null,
    initialState: snapshotStore.initializedState,
    clearSnapshots: snapshotStore.clearSnapshots,
    isCompressed: snapshotStore.isCompressed,
    expirationDate: snapshotStore.expirationDate,
    tags: snapshotStore.tags,
    metadata: snapshotStore.metadata,
    configOption: snapshotStore.configOption,
    setSnapshotData: snapshotStore.setSnapshotData,
  };
}

function convertSnapshotStoreConfig<T extends Data, K extends Data>(config: SnapshotStoreConfig<any, any>): SnapshotStoreConfig<T, K> {
  // Implement conversion logic for SnapshotStoreConfig
  // This is a placeholder; adjust according to your actual conversion logic
  return config as SnapshotStoreConfig<T, K>;
}

function convertSnapshotToStore<T extends BaseData, K extends BaseData>(
  snapshot: Snapshot<T, K>
): SnapshotStore<T, K> {
  // Manually convert snapshot to snapshot store
  return {
    snapshotId: snapshot.id,
    conifigOption: {}, // Populate appropriately
    set: snapshot.set,
    snapshots: [], // Initialize or populate
    state: [], // Initialize or populate
    id: "", // Add placeholder values for required properties
    key: "",
    topic: "",
    date: new Date(),
    configOption: snapshot.configOption,
    config: snapshot.config,
    title: snapshot.title || "",
    category: snapshot.category,
    message: snapshot.message,
    timestamp: snapshot.timestamp,
    createdBy: snapshot.createdBy || "",
    type: snapshot.type,
    data: snapshot.data || null,
    subscribers: snapshot.subscribers || [],
    snapshotConfig: snapshot.snapshotConfig,
    store: snapshot.store,
    dataStore: snapshot.dataStore,
    initialState: snapshot.initialState,
    dataStoreMethods: snapshot.dataStoreMethods,
    delegate: snapshot.delegate,
    subscriberId: snapshot.subscriberId,
     length:snapshot.length,
     content:snapshot.content,
     value:snapshot.value,
    
    todoSnapshotId:snapshot.todoSnapshotId,
     events:snapshot.events,
     snapshotStore:snapshot.snapshotStore,
     dataItems:snapshot.dataItems,
    
    newData:snapshot.newData,
     defaultSubscribeToSnapshots:snapshot.defaultSubscribeToSnapshots,
     subscribeToSnapshots:snapshot.subscribeToSnapshots,
     transformSubscriber:snapshot.transformSubscriber,
    
    transformDelegate:snapshot.transformDelegate,
     initializedState:snapshot.initializedState,
     getAllKeys:snapshot.getAllKeys,
     getAllItems:snapshot.getAllItems,
    
    addData:snapshot.addData,
     addDataStatus:snapshot.addDataStatus,
     removeData:snapshot.removeData,
     updateData:snapshot.updateData,
    
    updateDataTitle:snapshot.updateDataTitle,
     updateDataDescription:snapshot.updateDataDescription,
     updateDataStatus:snapshot.updateDataStatus,
     addDataSuccess:snapshot.addDataSuccess,
    
    getDataVersions:snapshot.getDataVersions,
     updateDataVersions:snapshot.updateDataVersions,
     getBackendVersion:snapshot.getBackendVersionget,
     getFrontendVersion:snapshot.getFrontendVersion,
    
    fetchData:snapshot.fetchDatafetchData,
     defaultSubscribeToSnapshot:snapshot.defaultSubscribeToSnapshot,
     handleSubscribeToSnapshot:snapshot.handleSubscribeToSnapshot,
     snapshot:snapshot.snapshot,
    
    removeItem:snapshot.removeItem,
     getSnapshot:snapshot.getSnapshot,
     getSnapshotSuccess:snapshot.getSnapshotSuccess,
     getSnapshotId:snapshot.getSnapshotId,
    
    getItem:snapshot.getItem,
     setItem:snapshot.setItem,
     addSnapshotFailure:snapshot.addSnapshotFailure,
     getDataStore:snapshot.getDataStore,
    
    addSnapshotSuccess:snapshot.addSnapshotSuccess,
     compareSnapshotState:snapshot.compareSnapshotState,
     deepCompare:snapshot.deepCompare,
     shallowCompare:snapshot.shallowCompareshallowCompare,
    
    getDataStoreMethods:snapshot.getDataStoreMethods,
     getDelegate:snapshot.getDelegate,
     determineCategory:snapshot.determineCategory,
     determinePrefix:snapshot.determinePrefix,
    
    updateSnapshot:snapshot.updateSnapshot,
     updateSnapshotSuccess:snapshot.updateSnapshotSuccess,
     updateSnapshotFailure:snapshot.updateSnapshotFailure,
     removeSnapshot:snapshot.removeSnapshot,
    
    snapshotItems:snapshot.snapshotItems,
    snapshotItems:snapshot.snapshotItems,:snapshot.nestedStores,
     nestedStores:snapshot.nestedStores,:snapshot.addSnapshotItem,
     addSnapshotItem:snapshot.addSnapshotItem,:snapshot.addNestedStore,
     addNestedStore:snapshot.addNestedStore,
    getData:snapshot.getData,
    getData:snapshot.getData,:snapshot.clearSnapshots,
     clearSnapshots:snapshot.clearSnapshots,:snapshot.addSnapshot,
     addSnapshot:snapshot.addSnapshot,:snapshot.createSnapshot,
     createSnapshot:snapshot.createSnapshot,
    snapshotStoreConfig:snapshot.snapshotStoreConfig,
     meta:snapshot.meta,
     getSnapshotItems:snapshot.getSnapshotItems,
     createInitSnapshot:snapshot.createInitSnapshot,
    
    createSnapshotSuccess:snapshot.createSnapshotSuccess,
     setSnapshotSuccess:snapshot.setSnapshotSuccess,
     setSnapshotFailure:snapshot.setSnapshotFailure,
     createSnapshotFailure:snapshot.createSnapshotFailure,
    
    updateSnapshots:snapshot.updateSnapshots,
     updateSnapshotsSuccess:snapshot.updateSnapshotsSuccess,
     updateSnapshotsFailure:snapshot.updateSnapshotsFailure,
     initSnapshot:snapshot.initSnapshot,
    
    takeSnapshot:snapshot.takeSnapshot,
     takeSnapshotSuccess:snapshot.takeSnapshotSuccess,
     takeSnapshotsSuccess:snapshot.takeSnapshotsSuccess,
     configureSnapshotStore:snapshot.configureSnapshotStore,
    
    flatMap:snapshot.flatMap,
     setData:snapshot.setData,
     getState:snapshot.getState,
     setState:snapshot.setState,
    
    validateSnapshot:snapshot.validateSnapshot,
     handleSnapshot:snapshot.handleSnapshot,
     handleActions:snapshot.handleActions,
     setSnapshot:snapshot.setSnapshot,
    
    transformSnapshotConfig:snapshot.transformSnapshotConfig,
     setSnapshotData:snapshot.setSnapshotData,
     setSnapshots:snapshot.setSnapshots,
     clearSnapshot:snapshot.clearSnapshot,
    
    mergeSnapshots:snapshot.mergeSnapshots,
     reduceSnapshots:snapshot.reduceSnapshots,
     sortSnapshots:snapshot.sortSnapshots,
     filterSnapshots:snapshot.filterSnapshots,
    
    mapSnapshots:snapshot.mapSnapshots,
     findSnapshot:snapshot.findSnapshot,
     getSubscribers:snapshot.getSubscribers,
     notify:snapshot.notify,
    
    notifySubscribers:snapshot.notifySubscribers,
     subscribe:snapshot.subscribe,
     unsubscribe:snapshot.unsubscribe,
     fetchSnapshot:snapshot.fetchSnapshot,
    
    fetchSnapshotSuccess:snapshot.fetchSnapshotSuccess,
     fetchSnapshotFailure:snapshot.fetchSnapshotFailure,
     getSnapshots:snapshot.getSnapshots,
     getAllSnapshots:snapshot.getAllSnapshots,
    
    generateId:snapshot.generateId,
     batchFetchSnapshots:snapshot.batchFetchSnapshots,
     batchTakeSnapshotsRequest:snapshot.batchTakeSnapshotsRequest,
     batchUpdateSnapshotsRequest:snapshot.batchUpdateSnapshotsRequest,
    
    filterSnapshotsByStatus:snapshot.filterSnapshotsByStatus,
     filterSnapshotsByCategory:snapshot.filterSnapshotsByCategory,
     filterSnapshotsByTag:snapshot.filterSnapshotsByTag,
    
    batchFetchSnapshotsSuccess:snapshot.batchFetchSnapshotsSuccess,
     batchFetchSnapshotsFailure:snapshot.batchFetchSnapshotsFailure,
     batchUpdateSnapshotsSuccess:snapshot.batchUpdateSnapshotsSuccess,
     batchUpdateSnapshotsFailure:snapshot.batchUpdateSnapshotsFailure,
    
    batchTakeSnapshot:snapshot.batchTakeSnapshot,
     handleSnapshotSuccess:snapshot.handleSnapshotSuccess,
    
    [Symbol.iterator]: () => {
      return {
        next: () => {
          return {
            value: snapshot,
            done: false,
          };
        },
      };
      // other properties from SnapshotStore<T, K>
    }
  }
}
const convertSnapshotStoreToSnapshot = <T extends Data, K extends Data>(
  store: SnapshotStore<T, K>
): Snapshot<T, K> => {
  const snapshotStoreConfig = store.config;

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
    delegate: store.getDelegate(snapshotStoreConfig || []),
    store: store,
    state: store.state,
    todoSnapshotId: store.todoSnapshotId,
    initialState: store.initializedState,
    meta: store.meta,
    configOption: store.configOption,
    getSnapshotId, 
    getParentId: () => store.id.toString(), // Convert to string
    getChildIds: () => [], // Example implementation
    addChild: () => {}, // Example implementation
    removeChild: () => { }, // Example implementation
    getChildren: () => {},
    hasChildren: () => false,
    isDescendantOf: (snapshot: Snapshot<T, K>) => false,
    dataItems: [],
    compareSnapshotState:,
    eventRecords:,
    snapshotStore:,
    newData:,
    stores:,
    getStore:,
    addStore:,
    mapSnapshot:,
    removeStore:,
    unsubscribe:,
    fetchSnapshot:,
    addSnapshotFailure:,
    configureSnapshotStore:,
    updateSnapshotSuccess:,
    createSnapshotFailure:,
    createSnapshotSuccess:,
    updateSnapshotFailure:,
    createSnapshot:,
    onSnapshot, onSnapshots, events, handleSnapshot
    // updateSnapshot:,
    // setSnapshot:,
    // setSnapshotData:,
    // setSnapshotSuccess:,
    // setSnapshotFailure:,
    // createSnapshotFailure:,
    // createSnapshotSuccess:,
    // updateSnapshotFailure:,
    // updateSnapshotSuccess:,
    // fetchSnapshotSuccess:,
    // fetchSnapshotFailure:,
    // getSnapshot:,
    // getSnapshotData:,
    // getSnapshotState:,
    // getSnapshotStatus:,
    // getSnapshotMetadata:,
    // getSnapshotDelegate:,
    // getSnapshotStore:,
    // getSnapshotStoreConfig:,
    // getSnapshotStoreConfigData:,
    
  }
};

// Export the specific snapshot type if needed
export { YourSpecificSnapshotType };

const convertSnapshotData = <T extends BaseData, K extends BaseData>(
  snapshotStoreConfigData: SnapshotStoreConfig<any, K>
): SnapshotStoreConfig<any, K> => {
  return snapshotStoreConfigData as unknown as SnapshotStoreConfig<any, K>;
};

const snapshotType = <T extends BaseData, K extends BaseData>(
  snapshot: Snapshot<T, K>
): Snapshot<T, K> => {
  const newSnapshot = { ...snapshot }
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
  newSnapshot.data = snapshot.data;
  newSnapshot.value = snapshot.value || 0;
  newSnapshot.key = snapshot.key || "";
  newSnapshot.subscription = snapshot.subscription || null;
  newSnapshot.config = snapshot.config || null;
  newSnapshot.status = snapshot.status || "";
  newSnapshot.metadata = snapshot.metadata || {};
  newSnapshot.delegate = snapshot.delegate
    ? snapshot.delegate.map((delegateConfig) => ({
      ...delegateConfig,
      data: delegateConfig.data,
      snapshotStore: delegateConfig.snapshotStore
    }))
    : [];
  newSnapshot.store = snapshot.store
  newSnapshot.state = snapshot.state
  newSnapshot.todoSnapshotId = snapshot.todoSnapshotId || "";
  newSnapshot.initialState = snapshot.initialState;
  return newSnapshot;
};

// Type guard to check if input is SnapshotStore<BaseData>
const isSnapshotStore = (store: any): store is SnapshotStore<BaseData, K> => {
  return store && store instanceof SnapshotStore;
};



const convertSnapshotStoreItemToT = <T extends BaseData, K extends BaseData>(
  item: Snapshot<T, K>
): T => {
  if (item.data) {
    const keysIterator = item.data.keys();
    const firstKey = keysIterator.next().value;
    return {
      id: firstKey,
      // Copy other properties if needed
    } as T;
  } else {
    throw new Error('Item data is null or undefined');
  }
};


const convertSnapshotStoreItemToSnapshot = <T extends BaseData, K extends BaseData>(
  item: Snapshot<T, K>
): Snapshot<T, K> => {
  return item;
};

// Function to convert SnapshotStore<BaseData> to Map<string, T>
const convertSnapshotStoreToMap = <T extends BaseData, K extends BaseData>(
    store: SnapshotStore<T, K>
  ): Map<string, Snapshot<T, K>> => {
    const dataMap = new Map<string, Snapshot<T, K>>();
  
    // Assuming 'data' is an array or iterable within SnapshotStore<BaseData>
    store.data?.forEach((item: Snapshot<T, K>, key: string) => {
      // Use the conversion function to ensure item is compatible with Snapshot<T, K>
      const convertedItem = convertSnapshotStoreItemToSnapshot(item);
      dataMap.set(key, convertedItem);
    });
  
    return dataMap;
  };

function convertMapToSnapshotStore<T extends BaseData, K extends BaseData = T>(
  map: Map<string, T>
): SnapshotStore<T, K> {

  const snapshotStoreOptions = createSnapshotStoreOptions<T, K>({
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
      data: new Map<string, Snapshot<T, K>>().set(key, {
        id: key,
        data: typeof value === "object" ? new Map(Object.entries(value)) : value,
        initialState: null,
        timestamp: new Date(),
        configOption: getCurrentSnapshotConfigOptions,
        getSnapshotId: () => key,
        compareSnapshotState: () => false,
        snapshot: {} as any,
        snapshotStore: snapshotStore,
        store: {} as any,
        getInitialState: () => null,
        getConfigOption: () => getCurrentSnapshotConfigOptions,
        getTimestamp: () => new Date(),
        getData: () => new Map<string, T>().set(key, value),
        setData: () => {},
        addData: () => {}
      } as Snapshot<T, K>),
      dataItems: [],
      initialState: null,
      timestamp: new Date(),
      configOption: getCurrentSnapshotConfigOptions,
      getSnapshotId: () => key,
      compareSnapshotState: () => false,
      snapshot: {} as any,
      snapshotStore: snapshotStore,
      store: {} as any,
      getInitialState: () => null,
      getConfigOption: () => getCurrentSnapshotConfigOptions,
      getTimestamp: () => new Date(),
      getData: () => new Map<string, Snapshot<T, K>>().set(key, {} as Snapshot<T, K>),
      setData: () => {},
      addData: () => {}
    };

    snapshotStore.addData(snapshot);
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
    callback: (snapshots: Snapshots<T>) => Subscriber<T, K> | null,
    snapshot: Snapshot<T, K>
  ) => {
    const convertedSnapshot = convertSnapshot(snapshot);
    subscribeToSnapshotsImpl(snapshotId, callback, convertedSnapshot);
  },
  subscribeToSnapshot: (
    snapshotId: string,
    callback: Callback<Snapshot<T, K>>,
    snapshot: Snapshot<T, K>
  ) => {
    const convertedSnapshot = convertSnapshot(snapshot);
    subscribeToSnapshotImpl(snapshotId, callback, convertedSnapshot);
  },
  getDelegate: (snapshotStoreConfig: SnapshotStoreConfig<T, K>[] | undefined) => {
    return snapshotStoreConfig ?? [];
  },
  getSnapshotId: () => snapshotId,
  getCategory: () => category,
  getSnapshotConfig: () => [],
  getSnapshot: (snapshotId: string) => {
    return null; // Adjust as needed
  },
  getDataStoreMethods: () => dataStoreMethods as DataStoreWithSnapshotMethods<T, K>,
  snapshotMethods: [],
  delegate: [], // Adjust as needed
  dataStoreMethods: dataStoreMethods as DataStoreWithSnapshotMethods<T, K>,
  handleSnapshotOperation: handleSnapshotOperation,
  displayToast: displayToast,
  addToSnapshotList: addToSnapshotList
});

function convertSnapshot<T extends BaseData, K extends BaseData>(
  snapshot: Snapshot<T, K>
): Snapshot<T, K> {
  if (!snapshot.store) {
    throw new Error("Snapshot store is undefined");
  }

  // Convert dataStoreMethods
  const dataStoreMethods = snapshot.store.getDataStoreMethods() as DataStoreWithSnapshotMethods<T, K>;

  // Convert snapshot methods
  const convertedSnapshotMethods = dataStoreMethods.snapshotMethods?.map(
    (method: SnapshotStoreMethod<T, K>) => ({
      ...method,
      snapshot: (
        id: string,
        snapshotData: SnapshotStoreConfig<any, K>,
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
  ) as SnapshotStoreMethod<T, K>[] || [];

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
              snapshotData: SnapshotStoreConfig<any, K>,
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
        ) as SnapshotStoreMethod<T, K>[],
      },
    })
  ) as unknown as SnapshotStoreConfig<T, K>[];

  // Convert dataStoreMethods to ensure compatibility with DataStoreWithSnapshotMethods<T, T>
  const convertedDataStoreMethods: DataStoreWithSnapshotMethods<T, K> = {
    ...dataStoreMethods,
    snapshotMethods: dataStoreMethods.snapshotMethods?.map(
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
            convertSnapshotData(snapshotData) ,
            category,
            callback
          ),
      })
    ) as SnapshotStoreMethod<T, K>[] || [], // Type assertion to ensure compatibility
    
    getDelegate: dataStoreMethods.getDelegate as (context: {
      useSimulatedDataSource: boolean;
      simulatedDataSource: SnapshotStoreConfig<T, K>[]
    }) => Promise<SnapshotStoreConfig<T, K>[]>

    // Map other properties accordingly
  };
  // Create newStore
  const newStore = new SnapshotStore<T, K>({
    ...snapshot.store.config,
    snapshotId: snapshot.store.id,
    category: snapshot.store.category,
    date: snapshot.store.timestamp,
    type: snapshot.store.type,
    snapshotConfig: convertedSnapshotConfig,
    delegate: snapshot.store.getDelegate().map((delegateConfig) => ({
      ...delegateConfig,
      data: delegateConfig.data as T,
      snapshotStore: delegateConfig.snapshotStore,
    })),
    getDataStoreMethods: () => convertedDataStoreMethods,
    getDelegate: snapshot.store.getDelegate(),
    dataStoreMethods: convertedDataStoreMethods,
    snapshotMethods: convertedSnapshotMethods,
    handleSnapshotOperation: handleSnapshotOperation,
    displayToast: displayToast,
    addToSnapshotList: addToSnapshotList,
    data: {} as Partial<SnapshotStore<T, K>>, // Adjust as needed
  });

  return {
    ...snapshot,
    store: newStore,
    initialState: snapshot.initialState as
      | Snapshot<T, K>
      | SnapshotStore<T, K>
      | null
      | undefined,
  };
}


// Convert Map<string, T> to Snapshot<BaseData, BaseData>
function convertMapToSnapshot<T extends BaseData, K extends BaseData>(
  map: Map<string, Snapshot<T, K>>
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
  convertSnapshotData,
  convertSnapshotStoreConfig
};
export type { ChosenSnapshotState };
