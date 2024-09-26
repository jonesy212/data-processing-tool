import { createSnapshot, getSnapshotId } from "@/app/api/SnapshotApi";
import { Subscriber } from '@/app/components/users/Subscriber';
import { CategoryProperties } from "@/app/pages/personas/ScenarioBuilder";
import { useContext } from "react";
import { CombinedEvents, SnapshotManager } from "../hooks/useSnapshotManager";
import { Category } from "../libraries/categories/generateCategoryProperties";
import { BaseData, Data } from "../models/data/Data";
import { StatusType } from "../models/data/StatusType";
import { RealtimeDataItem } from "../models/realtime/RealtimeData";
import { DataStoreMethods, DataStoreWithSnapshotMethods } from "../projects/DataAnalysisPhase/DataProcessing/ DataStoreMethods";
import { DataStore, InitializedState } from "../projects/DataAnalysisPhase/DataProcessing/DataStore";
import { SnapshotContainer, SnapshotData, SnapshotStoreConfig } from '../snapshots';
import { Snapshot, Snapshots, SnapshotsArray } from "../snapshots/LocalStorageSnapshotStore";
import { retrieveSnapshotData } from "../snapshots/RetrieveSnapshotData";
import { ConfigureSnapshotStorePayload, K } from "../snapshots/SnapshotConfig";
import { default as defaultCategory, default as SnapshotStore } from "../snapshots/SnapshotStore";
import { createSnapshotStoreOptions } from '../snapshots/createSnapshotStoreOptions';

import { delegate, initSnapshot, subscribeToSnapshots } from "../snapshots/snapshotHandlers";
import {
  Callback
} from "../snapshots/subscribeToSnapshotsImplementation";
import { generateSnapshotId } from "../utils/snapshotUtils";
import CalendarManagerStoreClass, { CalendarEvent } from "./../state/stores/CalendarEvent";
import { SnapshotContent } from "../snapshots/SnapshotContent";
import { SnapshotContext } from "@/app/context/SnapshotContext";
import { snapshotStoreDelegate } from "../snapshots/SnapshotStoreDelegate";



// Define YourSpecificSnapshotTywpe implementing Snapshot<T, K>
class YourSpecificSnapshotType<T extends BaseData, K extends BaseData>
  implements Snapshot<T, K> {
  id: string;
  data: Map<string, Snapshot<T, K>>;
  meta: Map<string, Snapshot<T, K>>;
  events: CombinedEvents<T, K>
  
  constructor(
    id: string,
    data: Map<string, Snapshot<T, K>>,
    meta: Map<string, Snapshot<T, K>>,
    events?: CombinedEvents<T, K>) {
    this.id = id;
    this.data = data;
    this.meta = meta;
    this.events = {
      callbacks: events?.callbacks ?? ((snapshot: Snapshot<T, K>) => {
        console.log("callback called");
        return { snapshots: [snapshot] }
      }),
      eventRecords: events?.eventRecords ?? {},
      subscribers: events?.subscribers ?? [],
      eventIds: events?.eventIds ?? [],
      on: events?.on ?? (() => { }),
      off: events?.off ?? (() => { }),
      eventsDetails: events?.eventsDetails
    };
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



function flatMapImplementation<T extends Data, K extends Data, U extends Iterable<any>>(
  array: SnapshotStoreConfig<T, K>[],
  callback: (value: SnapshotStoreConfig<T, K>, index: number, array: SnapshotStoreConfig<T, K>[]) => U
): U extends Iterable<infer I> ? I[] : never {
  const result: any[] = [];
  array.forEach((value, index) => {
    const callbackResult = callback(value, index, array);
    for (const item of callbackResult as any) {
      result.push(item);
    }
  });
  return result as U extends Iterable<infer I> ? I[] : never;
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




// Example function to map SnapshotStoreConfig to DataStore
const convertToDataStore = <T extends Data, K extends Data>(
  config: SnapshotStoreConfig<T, K>[]
): DataStore<T, K>[] => {
  return config.map(c => ({
    mapSnapshot: (snapshot: Snapshot<T, K>) => snapshot,
    mapSnapshots: (snapshots: Snapshot<T, K>[]) => snapshots,
    mapSnapshotStore: (store: SnapshotStore<T, K>) => store,
    id: c.id,
    data: c.data,
    snapshots: c.snapshots,
    state: c.state,
    snapshotId: c.snapshotId,
    set: c.set,
    snapshotItems: c.snapshotItems,
    configOption: c.configOption,
    initialState: c.initialState,
    nestedStores: c.nestedStores,
    events: c.events,
    snapshotStore: c.snapshotStore,
    dataItems: c.dataItems,
    newData: c.newData,
    stores: c.stores,
    snapshotStoreConfig: c.snapshotStoreConfig,
    getSnapshotItems: c.getSnapshotItems,
    snapshotIds: c.snapshotIds,
    dataStoreMethods: c.dataStoreMethods,
    transformSubscriber: c.transformSubscriber,
    transformDelegate: c.transformDelegate,
    addSnapshotItem: c.addSnapshotItem,
    delegate: c.delegate,
    getData: c.getData,
    dataStore: c.dataStore,
    metadata: {},
    addData: () => { },
    getStoreData: () => null,
    getItem: () => null,
    setItem: () => { },
    removeItem: () => { },
    clear: () => { },
    keys: () => [],
    values: () => [],
    entries: () => [],
    forEach: () => { },
    size: 0,
    has: () => false,
    delete: () => false,
    get: () => null,
    set: () => ({} as DataStore<T, K>),
    getAll: () => [],
    setAll: () => { },
    removeAll: () => { },
    clearAll: () => { },
    keysAll: () => [],
    valuesAll: () => [],
    entriesAll: () => [],
    forEachAll: () => { },
    sizeAll: 0,
    hasAll: () => false,
    deleteAll: () => false,
    getDataStore: () => ({} as DataStore<T, K>),
    setDataStore: () => { },

    removeData, updateData, updateStoreData, updateDataTitle,
    removeData, updateData, updateStoreData, updateDataTitle,
    updateDataDescription, addDataStatus, updateDataStatus, addDataSuccess,
    getDataVersions, updateDataVersions, getBackendVersion, getFrontendVersion,
  }));
};


function isSnapshot<T extends BaseData, K extends BaseData>(
  obj: any
): obj is Snapshot<T, K> {
  return obj && typeof obj === "object" && "id" in obj && "data" in obj;
}


function convertToSnapshotStoreConfig<T extends BaseData, K extends BaseData>(
  snapshotStore: SnapshotStore<T, K>
): SnapshotStoreConfig<T, any> {
  const mappedSnapshots: Snapshots<T> =
    snapshotStore.snapshots.map((s: Snapshot<T, any>) => ({
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
      newData: s.newData,
      stores: s.stores || [],
      snapshotStoreConfig: s.snapshotStoreConfig || null,
      getSnapshotItems: s.getSnapshotItems || [],
      snapshotIds: s.snapshotIds || [],
      dataStoreMethods: s.dataStoreMethods || null,
      transformSubscriber: s.transformSubscriber || null,
      transformDelegate: s.transformDelegate || null,
      addSnapshotItem: s.addSnapshotItem || null,
      delegate: s.delegate || [],
      getData: s.getData || (() => null),
      dataStore: s.dataStore,
      set: s.set,
      // Add other required properties here
    }));

  const mappedState: Snapshot<T, K>[] | null = snapshotStore.state
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
          notifyEventSystem: s.getNotifyEventSystem ? s.getNotifyEventSystem() : () => { },
          updateProjectState: s.getUpdateProjectState ? s.getUpdateProjectState() : () => { },
          logActivity: s.getLogActivity ? s.getLogActivity() : () => { },
          triggerIncentives: s.getTriggerIncentives ? s.getTriggerIncentives() : () => { },
          newData: s.getNewData ? s.getNewData() : null,
          defaultSubscribeToSnapshots: s.getDefaultSubscribeToSnapshots ? s.getDefaultSubscribeToSnapshots : () => { },
          subscribeToSnapshots: s.getSubscribeToSnapshots ? s.getSubscribeToSnapshots() : () => { },
          transformSubscriber: s.getTransformSubscriber ? s.getTransformSubscriber() : () => { },
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
          getNotifyEventSystem: s.getNotifyEventSystem || (() => { }),
          getUpdateProjectState: s.getUpdateProjectState || (() => { }),
          getLogActivity: s.getLogActivity || (() => { }),
          getTriggerIncentives: s.getTriggerIncentives || (() => { }),
          getName: s.getName || (() => ''),
          snapshots: s.snapshots || [],
          determineCategory: s.getDetermineCategory ? s.getDetermineCategory : () => '',
          getSubscriberId: s.getSubscriberId || (() => ''),
          subscribersById: s.getSubscribersById ? s.getSubscribersById() : {},
          getSubscribers: s.getSubscribers || (() => []),
          setSubscribers: s.setSubscribers || (() => { }),
          getOnSnapshotCallbacks: s.getOnSnapshotCallbacks || (() => []),
          setOnSnapshotCallbacks: s.setOnSnapshotCallbacks || (() => { }),
          getOnErrorCallbacks: s.getOnErrorCallbacks || (() => []),
          setOnErrorCallbacks: s.setOnErrorCallbacks || (() => { }),
          getOnUnsubscribeCallbacks: s.getOnUnsubscribeCallbacks || (() => []),
          setOnUnsubscribeCallbacks: s.setOnUnsubscribeCallbacks || (() => { }),
          setNotifyEventSystem: s.setNotifyEventSystem || (() => { }),
          setUpdateProjectState: s.setUpdateProjectState || (() => { }),
          setLogActivity: s.setLogActivity || (() => { }),
          setTriggerIncentives: s.setTriggerIncentives || (() => { }),
          setOptionalData: s.setOptionalData || (() => { }),
          setEmail: s.setEmail || (() => { }),
          setSnapshotIds: s.setSnapshotIds || (() => { }),
          getPayload: s.getPayload || (() => ({})),
          handleCallback: s.handleCallback || (() => { }),
          snapshotCallback: s.snapshotCallback || (() => { }),
          subscribe: s.subscribe || (() => { }),
          unsubscribe: s.unsubscribe || (() => { }),
          getData: s.getData || (() => null),
          getDetermineCategory: s.getDetermineCategory || (() => ''),
          initialData: s.initialData || null,
          fetchSnapshotById: s.fetchSnapshotById || (() => Promise.resolve(null)),
          toSnapshotStore: s.toSnapshotStore || (() => null),
          getDeterminedCategory: s.getDeterminedCategory || (() => ''),
          processNotification: s.processNotification || (() => { }),
          receiveSnapshot: s.receiveSnapshot || (() => { }),
          getState: s.getState || (() => null),
          onError: s.onError || (() => { }),
          getSubscribersById: s.getSubscribersById || (() => ({})),
          getSubscribersWithSubscriptionPlan: s.getSubscribersWithSubscriptionPlan || (() => []),
          getSubscription: s.getSubscription || (() => null),
          onUnsubscribe: s.onUnsubscribe || (() => { }),
          onSnapshot: s.onSnapshot || (() => { }),
          onSnapshotError: s.onSnapshotError || (() => { }),
          triggerOnSnapshot: s.triggerOnSnapshot || (() => { }),
          onSnapshotUnsubscribe: s.onSnapshotUnsubscribe || (() => { }),
          getNewData: s.getNewData || (() => null),
          enabled: s.getEnabled || false,
          tags: s.getTags || [],
          transformSubscribers: s.getTransformSubscribers ? s.getTransformSubscribers() : null,
          getTransformSubscribers: s.getTransformSubscribers || (() => null),
          setEvent: s.setEvent,
          getUniqueId: s.getUniqueId || (() => null),
          getEnabled: s.getEnabled || false,
          getTags: s.getTags || null,
          fetchTransformSubscribers: s.fetchTransformSubscribers || (() => null),
        };
      } else {
        throw new Error("Invalid subscriber type");
      }
    }).filter((s): s is Subscriber<T, any> => s !== null);

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
    subscribers: snapshot.subscribers,
    snapshotConfig: snapshot.snapshotConfig,
    store: snapshot.store,
    dataStore: snapshot.dataStore,
    initialState: snapshot.initialState,
    dataStoreMethods: snapshot.dataStoreMethods,
    delegate: snapshot.delegate,
    subscriberId: snapshot.subscriberId,
    length: snapshot.length,
    content: snapshot.content,
    value: snapshot.value,

    todoSnapshotId: snapshot.todoSnapshotId,
    events: snapshot.events,
    snapshotStore: snapshot.snapshotStore,
    dataItems: snapshot.dataItems,

    newData: snapshot.newData,
    defaultSubscribeToSnapshots: snapshot.defaultSubscribeToSnapshots,
    subscribeToSnapshots: snapshot.subscribeToSnapshots,
    transformSubscriber: snapshot.transformSubscriber,

    transformDelegate: snapshot.transformDelegate,
    initializedState: snapshot.initializedState,
    getAllKeys: snapshot.getAllKeys,
    getAllItems: snapshot.getAllItems,

    addData: snapshot.addData,
    addDataStatus: snapshot.addDataStatus,
    removeData: snapshot.removeData,
    updateData: snapshot.updateData,

    updateDataTitle: snapshot.updateDataTitle,
    updateDataDescription: snapshot.updateDataDescription,
    updateDataStatus: snapshot.updateDataStatus,
    addDataSuccess: snapshot.addDataSuccess,

    getDataVersions: snapshot.getDataVersions,
    updateDataVersions: snapshot.updateDataVersions,
    getBackendVersion: snapshot.getBackendVersion,
    getFrontendVersion: snapshot.getFrontendVersion,

    fetchData: snapshot.fetchData,
    defaultSubscribeToSnapshot: snapshot.defaultSubscribeToSnapshot,
    handleSubscribeToSnapshot: snapshot.handleSubscribeToSnapshot,


    removeItem: snapshot.removeItem,
    getSnapshot: snapshot.getSnapshot,
    getSnapshotSuccess: snapshot.getSnapshotSuccess,
    getSnapshotId: snapshot.getSnapshotId,

    getItem: snapshot.getItem,
    setItem: snapshot.setItem,
    addSnapshotFailure: snapshot.addSnapshotFailure,
    getDataStore: snapshot.getDataStore,

    addSnapshotSuccess: snapshot.addSnapshotSuccess,
    compareSnapshotState: snapshot.compareSnapshotState,
    deepCompare: snapshot.deepCompare,
    shallowCompare: snapshot.shallowCompare,

    getDataStoreMethods: snapshot.getDataStoreMethods,
    getDelegate: snapshot.getDelegate,
    determineCategory: snapshot.determineCategory,
    determinePrefix: snapshot.determinePrefix,

    updateSnapshot: snapshot.updateSnapshot,
    updateSnapshotSuccess: snapshot.updateSnapshotSuccess,
    updateSnapshotFailure: snapshot.updateSnapshotFailure,
    removeSnapshot: snapshot.removeSnapshot,

    snapshotItems: snapshot.snapshotItems,
    snapshotItems: snapshot.snapshotItems,: snapshot.nestedStores,
    nestedStores: snapshot.nestedStores,: snapshot.addSnapshotItem,
    addSnapshotItem: snapshot.addSnapshotItem,: snapshot.addNestedStore,
    addNestedStore: snapshot.addNestedStore,
    getData: snapshot.getData,
    getData: snapshot.getData,: snapshot.clearSnapshots,
    clearSnapshots: snapshot.clearSnapshots,: snapshot.addSnapshot,
    addSnapshot: snapshot.addSnapshot,: snapshot.createSnapshot,
    createSnapshot: snapshot.createSnapshot,
    snapshotStoreConfig: snapshot.snapshotStoreConfig,
    meta: snapshot.meta,
    getSnapshotItems: snapshot.getSnapshotItems,
    createInitSnapshot: snapshot.createInitSnapshot,

    createSnapshotSuccess: snapshot.createSnapshotSuccess,
    setSnapshotSuccess: snapshot.setSnapshotSuccess,
    setSnapshotFailure: snapshot.setSnapshotFailure,
    createSnapshotFailure: snapshot.createSnapshotFailure,

    updateSnapshots: snapshot.updateSnapshots,
    updateSnapshotsSuccess: snapshot.updateSnapshotsSuccess,
    updateSnapshotsFailure: snapshot.updateSnapshotsFailure,
    initSnapshot: snapshot.initSnapshot,

    takeSnapshot: snapshot.takeSnapshot,
    takeSnapshotSuccess: snapshot.takeSnapshotSuccess,
    takeSnapshotsSuccess: snapshot.takeSnapshotsSuccess,
    configureSnapshotStore: snapshot.configureSnapshotStore,

    flatMap: snapshot.flatMap,
    setData: snapshot.setData,
    getState: snapshot.getState,
    setState: snapshot.setState,

    validateSnapshot: snapshot.validateSnapshot,
    handleSnapshot: snapshot.handleSnapshot,
    handleActions: snapshot.handleActions,
    setSnapshot: snapshot.setSnapshot,

    transformSnapshotConfig: snapshot.transformSnapshotConfig,
    setSnapshotData: snapshot.setSnapshotData,
    setSnapshots: snapshot.setSnapshots,
    clearSnapshot: snapshot.clearSnapshot,

    mergeSnapshots: snapshot.mergeSnapshots,
    reduceSnapshots: snapshot.reduceSnapshots,
    sortSnapshots: snapshot.sortSnapshots,
    filterSnapshots: snapshot.filterSnapshots,

    mapSnapshots: snapshot.mapSnapshots,
    findSnapshot: snapshot.findSnapshot,
    getSubscribers: snapshot.getSubscribers,
    notify: snapshot.notify,

    notifySubscribers: snapshot.notifySubscribers,
    subscribe: snapshot.subscribe,
    unsubscribe: snapshot.unsubscribe,
    fetchSnapshot: snapshot.fetchSnapshot,

    fetchSnapshotSuccess: snapshot.fetchSnapshotSuccess,
    fetchSnapshotFailure: snapshot.fetchSnapshotFailure,
    getSnapshots: snapshot.getSnapshots,
    getAllSnapshots: snapshot.getAllSnapshots,

    generateId: snapshot.generateId,
    batchFetchSnapshots: snapshot.batchFetchSnapshots,
    batchTakeSnapshotsRequest: snapshot.batchTakeSnapshotsRequest,
    batchUpdateSnapshotsRequest: snapshot.batchUpdateSnapshotsRequest,

    filterSnapshotsByStatus: snapshot.filterSnapshotsByStatus,
    filterSnapshotsByCategory: snapshot.filterSnapshotsByCategory,
    filterSnapshotsByTag: snapshot.filterSnapshotsByTag,

    batchFetchSnapshotsSuccess: snapshot.batchFetchSnapshotsSuccess,
    batchFetchSnapshotsFailure: snapshot.batchFetchSnapshotsFailure,
    batchUpdateSnapshotsSuccess: snapshot.batchUpdateSnapshotsSuccess,
    batchUpdateSnapshotsFailure: snapshot.batchUpdateSnapshotsFailure,

    batchTakeSnapshot: snapshot.batchTakeSnapshot,
    handleSnapshotSuccess: snapshot.handleSnapshotSuccess,

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
    delegate: store.getDelegate({
      useSimulatedDataSource: false,
      simulatedDataSource: []
    }),
    store: store,
    state: store.state,
    todoSnapshotId: store.todoSnapshotId,
    // initialState: store.initializedState,
    meta: store.meta,
    configOption: store.configOption,
    getSnapshotId,
    getParentId: () =>  store.id ? store.id.toString(): undefined, // Convert to string
    getChildIds: () => [], // Example implementation
    addChild: () => { }, // Example implementation
    removeChild: () => { }, // Example implementation
    getChildren: (id: string, childSnapshot: Snapshot<T, K>) => { 
      return []
    },
    hasChildren: () => false,
    isDescendantOf: (childId: string, 
      parentId: string, 
      parentSnapshot: Snapshot<T, K>, 
      childSnapshot: Snapshot<T, K>) => false,
    dataItems: [],
    compareSnapshotState: store.compareSnapshotState,
    eventRecords: store.eventRecords,
    snapshotStore: store.snapshotStore,
    newData: store.newData,
    stores: store.stores,
    getStore: store.getStore,
    addStore: store.addStore,
    mapSnapshot: store.mapSnapshot,
    removeStore: store.removeStore,
    unsubscribe: store.unsubscribe,
    fetchSnapshot: store.fetchSnapshot,
    addSnapshotFailure: store.addSnapshotFailure,
    configureSnapshotStore: store.configureSnapshotStore,
    updateSnapshotSuccess: store.updateSnapshotSuccess,
    createSnapshotFailure: store.createSnapshotFailure,
    createSnapshotSuccess: store.createSnapshotSuccess,
    updateSnapshotFailure: store.updateSnapshotFailure,
    createSnapshot: store.createSnapshot,
    onSnapshot: store.onSnapshot,
    onSnapshots: store.onSnapshots,
    events: store.events,
    handleSnapshot: store.handleSnapshot,
    updateSnapshot: store.updateSnapshot,
    setSnapshot: store.setSnapshot,
    setSnapshotData: store.setSnapshotData,
    setSnapshotSuccess: store.setSnapshotSuccess,
    setSnapshotFailure: store.setSnapshotFailure,
    createSnapshotFailure: store.createSnapshotFailure,
    createSnapshotSuccess: store.createSnapshotSuccess,
    updateSnapshotFailure: store.updateSnapshotFailure,
    updateSnapshotSuccess: store.updateSnapshotSuccess,
    fetchSnapshotSuccess: store.fetchSnapshotSuccess,
    fetchSnapshotFailure: store.fetchSnapshotFailure,
    getSnapshot: store.getSnapshot,
    getSnapshotData: store.getSnapshotData,
    getSnapshotState: store.getSnapshotState,
    getSnapshotStatus: store.getSnapshotStatus,
    getSnapshotMetadata: store.getSnapshotMetadata,
    getSnapshotDelegate: store.getSnapshotDelegate,
    getSnapshotStore: store.getSnapshotStore,
    getSnapshotStoreConfig: store.getSnapshotStoreConfig,
    getSnapshotStoreConfigData: store.getSnapshotStoreConfigData,

  }
};

// Export the specific snapshot type if needed
export { YourSpecificSnapshotType };

const convertSnapshotData = <T extends BaseData, K extends BaseData>(
  snapshotConfigData: Snapshot<T, K> 
): Snapshot<T, K> => {
  return snapshotConfigData
};


function convertToDataSnapshot<T extends BaseData, K extends BaseData>(
  snapshot: Snapshot<T, K>
): Snapshot<Data, Data> {
  return {
    ...snapshot,
    data: snapshot.data as unknown as Map<string, Snapshot<Data, Data>>,
    content: snapshot.content as unknown as SnapshotContent<T, Data>,
    mappedSnapshotData: new Map(Object.entries(snapshot.mappedSnapshotData).map(([key, value]) => [key, value as Snapshot<Data, Data>])),
    snapshot: (
      id: string | number | undefined,
      snapshotId: number,
      snapshotData: SnapshotData<T, K>,
      category: string | Category,
      categoryProperties: CategoryProperties | undefined,
      dataStoreMethods: DataStoreMethods<T, K>[]
    ) => {
      return new Promise<Snapshot<Data, Data>>(async (resolve, reject) => {
        try {
          const result = await snapshot.snapshot(
            id,
            snapshotId,
            snapshotData,
            category,
            categoryProperties,
            dataStoreMethods
          );
          resolve(result as unknown as Snapshot<Data, Data>);
        } catch (error) {
          reject(error);
        }
      });
    }
  } as unknown as Snapshot<Data, Data>;
}





const convertSnapshoStoretData = <T extends BaseData, K extends BaseData>(
  snapshotStoreConfigData: SnapshotStoreConfig<any, K>
): SnapshotStoreConfig<any, K> => {
  return snapshotStoreConfigData
};


const snapshotType = <T extends BaseData, K extends BaseData>(
  snapshot: Snapshot<T, K>
): Snapshot<T, K> => {
  const defaultCategory: Category = "defaultCategory";
  const newSnapshot = { ...snapshot }
  newSnapshot.id = snapshot.id || generateSnapshotId;
  newSnapshot.title = snapshot.title || "";
  newSnapshot.timestamp = snapshot.timestamp
    ? new Date(snapshot.timestamp)
    : new Date();
  newSnapshot.subscriberId = snapshot.subscriberId || "";
   // Handle category assignment
   if (typeof snapshot.category === "string" || typeof snapshot.category === "symbol") {
    newSnapshot.category = snapshot.category as Category;
  } else if (snapshot.category && typeof snapshot.category === "object") {
    // Ensure snapshot.category matches CategoryProperties type if it's an object
    newSnapshot.category = snapshot.category as Category;
  } else {
    // Ensure defaultCategory is a valid Category
    newSnapshot.category = defaultCategory as Category;
  }
  newSnapshot.length = snapshot.length || 0;
  newSnapshot.content = snapshot.content || "";
  newSnapshot.data = snapshot.data;
  newSnapshot.value = snapshot.value || 0;
  newSnapshot.key = snapshot.key || "";
  newSnapshot.subscription = snapshot.subscription || null;
  newSnapshot.config = snapshot.config || null;
  newSnapshot.status = snapshot.status || undefined;
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

const snapshotStoreType = <T extends BaseData, K extends BaseData>(  snapshotStore: SnapshotStore<T, K>
): SnapshotStore<T, K> => {
  const defaultCategory: Category = "defaultCategory";
  const context = useContext(SnapshotContext);
  const newSnapshotStore = { ...snapshotStore }
  newSnapshotStore.id = snapshotStore.id || generateSnapshotId;
  newSnapshotStore.title = snapshotStore.title || "";
  newSnapshotStore.timestamp = snapshotStore.timestamp
    ? new Date(snapshotStore.timestamp)
    : new Date();
  newSnapshotStore.subscriberId = snapshotStore.subscriberId || "";
  newSnapshotStore.category =
    typeof snapshotStore.category === "string"
      ? defaultCategory
      : snapshotStore.category || defaultCategory;
  newSnapshotStore.length = snapshotStore.length || 0;
  newSnapshotStore.content = snapshotStore.content || "";
  newSnapshotStore.data = snapshotStore.data;
  newSnapshotStore.value = snapshotStore.value || 0;
  newSnapshotStore.key = snapshotStore.key || "";
  newSnapshotStore.subscription = snapshotStore.subscription || null;
  newSnapshotStore.config = snapshotStore.getConfig() || null;
  newSnapshotStore.status = snapshotStore.status || undefined;
  newSnapshotStore.metadata = snapshotStore.metadata || {
    metadataEntries: {}
  };

  newSnapshotStore.delegate = (await snapshotStore.getDelegate(context))
    ? snapshotStore.getDelegate(snapshotStoreDelegate).map((delegateConfig: any) => ({
      ...delegateConfig,
      data: delegateConfig.data as T,
      snapshotStore: delegateConfig.snapshotStore as SnapshotStore<T, K>
    }))    : [];
  newSnapshotStore.store = snapshotStore.store
  newSnapshotStore.state = snapshotStore.state
  newSnapshotStore.todoSnapshotId = snapshotStore.todoSnapshotId || "";
  newSnapshotStore.initialState = snapshotStore.initialState;
  newSnapshotStore.safeCastSnapshotStore = snapshotStore.safeCastSnapshotStore(snapshotStore),
  newSnapshotStore.getFirstDelegate = snapshotStore.getFirstDelegate(),
  newSnapshotStore.getInitialDelegate = snapshotStore.getInitialDelegate(),
  newSnapshotStore.transformInitialState = snapshotStore.transformInitialState(),
 




  return newSnapshotStore;
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


function createSnapshotStoreConfig<T extends BaseData, K extends BaseData>(
  options: SnapshotStoreConfig<T, K>
): SnapshotStoreConfig<T, K> {
  return { ...options };
}

function convertMapToSnapshotStore<T extends Data, K extends Data>(
  map: Map<string, Snapshot<T, K>>,
  timestamp: string | number | Date | undefined
): SnapshotStore<T, K> {
  const snapshotStoreOptions = createSnapshotStoreOptions<T, K>({
    initialState: null,
    snapshotId: "defaultId",
    category: {} as CategoryProperties, // Adjust as needed
    dataStoreMethods: {} as Partial<DataStoreWithSnapshotMethods<T, K>>, // Provide actual methods if needed
  });
  const config = createSnapshotStoreConfig<T, K>(snapshotStoreOptions);

  const snapshotStore = new SnapshotStore<T, K>(snapshotStoreOptions, config, operation); // Initialize SnapshotStore

  // Populate snapshotStore with map data
  map.forEach((value, key) => {
    const snapshot: Snapshot<T, K> = {
      id: key,
      data: new Map<string, Snapshot<T, K>>().set(key, {

        id: key,
        data: typeof value === "object" ? new Map(Object.entries(value)) : value,
        initialState: null,
        timestamp: new Date(),
        configOption: null,
        getSnapshotId: () => key,
        compareSnapshotState: () => false,
        snapshot: {} as any,
        snapshotStore: snapshotStore,
        store: {} as any,
        getInitialState: () => null,
        getTimestamp: () => new Date(),
        getData: () => new Map<string, T>().set(key, value),
        setData: (data: Map<string, Snapshot<T, K>>) => { },
        addData: () => { },
        eventRecords: {},
        getParentId: () => null,
        getChildIds: (childSnapshot: Snapshot<BaseData, K>) => null,
        addChild: (snapshot: Snapshot<T, K>) => { },
        removeChild: (snapshot: Snapshot<T, K>) => { },
        getChildren: () => { },
        hasChildren: () => false,
        isDescendantOf: () => false,
        dataItems: [],
        newData: {} as Snapshot<T, K>,
        stores: [],
        getConfigOption: () => getCurrentSnapshotConfigOptions,
        getStore: (
          storeId: number,
          snapshotStore: SnapshotStore<T, K>,
          snapshotId: string,
          snapshot: Snapshot<T, K>,
          type: string,
          event: Event
        ) => null,
        addStore: (
          storeId: number,
          snapshotStore: SnapshotStore<T, K>,
          snapshotId: string,
          snapshot: Snapshot<T, K>,
          type: string,
          event: Event
        ) => null,
        mapSnapshot: (
          storeId: number,
          snapshotStore: SnapshotStore<T, K>,
          snapshotId: string,
          snapshot: Snapshot<T, K>,
          type: string,
          event: Event
        ) => null,
        removeStore: (
          storeId: number,
          store: SnapshotStore<T, K>,
          snapshotId: string,
          snapshot: Snapshot<T, K>,
          type: string,
          event: Event
        ) => null,
        unsubscribe: (
          callback: Callback<Snapshot<T, K>>) => null,
        fetchSnapshot: (
          callback: (
            snapshotId: string,
            snapshot: Snapshot<T, K> | undefined
          ) => void
        ) => null,
        addSnapshotFailure: (
          snapshotManager: SnapshotManager<T, K>,
          snapshot: Snapshot<T, K>,
          payload: { error: Error; }
        ) => null,
        configureSnapshotStore: (
          snapshotStore: SnapshotStore<T, K>,
          snapshotId: string,
          data: Map<string, Snapshot<T, K>>,
          events: Record<string, CalendarEvent[]>,
          dataItems: RealtimeDataItem[],
          newData: Snapshot<T, K>,
          payload: ConfigureSnapshotStorePayload<T>,
          store: SnapshotStore<any, K>,
          callback: (snapshotStore: SnapshotStore<T, K>) => void
        ) => null,
        updateSnapshotSuccess: (
          snapshotId: string,
          snapshotManager: SnapshotManager<T, K>,
          snapshot: Snapshot<T, K>,
          payload: { error: Error; }
        ) => null,
        createSnapshotFailure: async (
          snapshotId: string,
          snapshotManager: SnapshotManager<T, K>,
          snapshot: Snapshot<T, K>,
          payload: { error: Error; }
        ) => { },
        createSnapshotSuccess: (
          snapshotId: string,
          snapshotManager: SnapshotManager<T, K>,
          snapshot: Snapshot<T, K>,
          payload: { error: Error; }) => null,
        createSnapshots: (
          id: string,
          snapshotId: string,
          snapshot: Snapshot<T, K>,
          snapshotManager: SnapshotManager<T, K>,
          payload: CreateSnapshotsPayload<T, K>,
          callback: (snapshots: Snapshot<T, K>[]) => void | null,
          snapshotDataConfig?: SnapshotConfig<T, K>[],
          category?: string | CategoryProperties
        ) => [],
        onSnapshot: (
          snapshotId: string,
          snapshot: Snapshot<T, K>,
          type: string,
          event: Event,
          callback: (
            snapshot: Snapshot<T, K>
          ) => void
        ) => null,
        onSnapshots: (
          snapshotId: string,
          snapshots: Snapshots<T>,
          type: string,
          event: Event,
          callback: (snapshots: Snapshots<T>
          ) => void) => { },
        events: {
          callbacks: [],
          eventRecords: {}
        },
        handleSnapshot: (snapshotId: string,
          snapshot: Snapshot<T, K> | null,
          snapshots: Snapshots<T>,
          type: string,
          event: Event
        ) => null,
        mapSnapshots: (
          snapshotId: string,
          snapshot: Snapshot<T, K>,
          snapshots: Snapshots<T>,
          type: string,
          event: Event
        ) => null,
        meta: undefined,
        snapshotStoreConfig: config,

      } as Snapshot<T, K>

      ),
      dataItems: [],
      initialState: null,
      timestamp: new Date(),
      configOption: null,
      getSnapshotId: () => key,
      compareSnapshotState: () => false,
      snapshot: {} as any,
      snapshotStore: snapshotStore,
      store: {} as any,
      getInitialState: () => null,
      getConfigOption: (): SnapshotStoreConfig<T, K> | null => getCurrentSnapshotConfigOptions(
        snapshot,
        category,
        initSnapshot,
        subscribeToSnapshots,
        createSnapshot,
        createSnapshotStore,
        configureSnapshot,
        delegate,
        snapshotData

      ),
      getTimestamp: () => new Date(),
      getData: () => new Map<string, Snapshot<T, K>>().set(key, {} as Snapshot<T, K>),
      setData: (data: Map<string, Snapshot<T, K>>) => { },
      addData: () => { },
      eventRecords: null,
      getParentId: function (snapshot: Snapshot<T, K>): string | null {
        throw new Error("Function not implemented.");
      },
      getChildIds: function (childSnapshot: Snapshot<BaseData, T>): void {
        throw new Error("Function not implemented.");
      },
      addChild: function (snapshot: Snapshot<T, K>): void {
        throw new Error("Function not implemented.");
      },
      removeChild: function (snapshot: Snapshot<T, K>): void {
        throw new Error("Function not implemented.");
      },
      getChildren: function (): void {
        throw new Error("Function not implemented.");
      },
      hasChildren: function (): boolean {
        throw new Error("Function not implemented.");
      },
      isDescendantOf: function (snapshot: Snapshot<T, K>, childSnapshot: Snapshot<T, K>): boolean {
        throw new Error("Function not implemented.");
      },
      newData: undefined,
      stores: null,
      getStore: function (storeId: number, snapshotId: string, snapshot: Snapshot<T, K>, type: string, event: Event): SnapshotStore<T, K> | null {
        throw new Error("Function not implemented.");
      },
      addStore: function (storeId: number, snapshotId: string, snapshotStore: SnapshotStore<T, K>, snapshotId: string, snapshot: Snapshot<T, K>, type: string, event: Event): void | null {
        throw new Error("Function not implemented.");
      },
      mapSnapshot: function (storeId: number, snapshotId: string, snapshot: Snapshot<T, K>, type: string, event: Event): void | null {
        throw new Error("Function not implemented.");
      },
      mapSnapshots: function (storeIds: number[], snapshotId: string, snapshot: Snapshot<T, K>, type: string, event: Event): void | null {
        throw new Error("Function not implemented.");
      },
      removeStore: function (storeId: number, store: SnapshotStore<T, K>, snapshotId: string, snapshot: Snapshot<T, K>, type: string, event: Event): void | null {
        throw new Error("Function not implemented.");
      },
      unsubscribe: function (callback: Callback<Snapshot<T, K>>): void {
        throw new Error("Function not implemented.");
      },
      fetchSnapshot: function (callback: (snapshotId: string, snapshot: Snapshot<T, K> | undefined) => void): void {
        throw new Error("Function not implemented.");
      },
      addSnapshotFailure: function (snapshotManager: SnapshotManager<T, K>, snapshot: Snapshot<T, K>, payload: { error: Error; }): void {
        throw new Error("Function not implemented.");
      },
      configureSnapshotStore: function (snapshotStore: SnapshotStore<T, K>, snapshotId: string, data: Map<string, Snapshot<T, K>>, events: Record<string, CalendarEvent[]>, dataItems: RealtimeDataItem[], newData: Snapshot<T, K>, payload: ConfigureSnapshotStorePayload<T>, store: SnapshotStore<any, T>, callback: (snapshotStore: SnapshotStore<T, K>) => void): void | null {
        throw new Error("Function not implemented.");
      },
      updateSnapshotSuccess: function (snapshotId: string, snapshotManager: SnapshotManager<T, K>, snapshot: Snapshot<T, K>, payload: { error: Error; }): void | null {
        throw new Error("Function not implemented.");
      },
      createSnapshotFailure: function (snapshotId: string, snapshotManager: SnapshotManager<T, K>, snapshot: Snapshot<T, K>, payload: { error: Error; }): Promise<void> {
        throw new Error("Function not implemented.");
      },
      createSnapshotSuccess: function (snapshotId: string, snapshotManager: SnapshotManager<T, K>, snapshot: Snapshot<T, K>, payload: { error: Error; }): void | null {
        throw new Error("Function not implemented.");
      },
      createSnapshots: function (id: string, snapshotId: string, snapshot: Snapshot<T, K>, snapshotManager: SnapshotManager<T, K>, payload: CreateSnapshotsPayload<T, K>, callback: (snapshots: Snapshot<T, K>[]) => void | null, snapshotDataConfig?: SnapshotConfig<T, K>[] | undefined, category?: string | CategoryProperties): Snapshot<T, K>[] | null {
        throw new Error("Function not implemented.");
      },
      onSnapshot: function (snapshotId: string, snapshot: Snapshot<T, K>, type: string, event: Event, callback: (snapshot: Snapshot<T, K>) => void): void {
        throw new Error("Function not implemented.");
      },
      onSnapshots: function (snapshotId: string, snapshots: Snapshots<T>, type: string, event: Event, callback: (snapshots: Snapshots<T>) => void): void {
        throw new Error("Function not implemented.");
      },
      events: {
        callbacks: [],
        eventRecords: undefined
      },
      handleSnapshot: retrieveSnapshotData,
      meta: undefined
    };
    snapshotStore.addData(snapshot);
  });

  return snapshotStore;
}





// Convert Map<string, T> to Snapshot<BaseData, BaseData>

// Convert Map<string, T> to Snapshot<BaseData, BaseData>
function convertMapToSnapshot<T extends BaseData, K extends BaseData>(
  map: Map<string, Snapshot<T, K>>,
  timestamp: string | number | Date | undefined
): Snapshot<T, K> {
  const snapshotMap = new Map<string, Snapshot<T, K>>();

  map.forEach((value, key) => {
    const snapshot: Snapshot<T, K> = {
      id: key,
      title: "Snapshot Title",
      timestamp: new Date(),
      subscriberId: "some-subscriber-id",
      category: "some-category",
      length: 1,
      content: value.data ? value.data.toString() : '',
      data: value.data as T,
      value: 0,
      // Populate with other properties of Snapshot<T, K> as needed
    };

    snapshotMap.set(key, snapshot);
  });

  return {
    id: "some-id",
    title: "Snapshot Title",
    timestamp: new Date(),
    subscriberId: "some-subscriber-id",
    category: "some-category",
    length: snapshotMap.size,
    content: snapshotMap.toString(),
    data: snapshotMap, // Ensure the type matches Snapshot<T, K>
    value: 0,
    key: "some-key",
    subscription: null,
    config: null,
    status: StatusType.Active,
    metadata: {},
    delegate: [],
    store: null,
    state: null,
    todoSnapshotId: "some-todo-id",
    initialState: null,
    snapshotStoreConfig: {} as SnapshotStoreConfig<T, K>,

    getSnapshotItems: [],
    defaultSubscribeToSnapshots: () => Promise.resolve(),
    transformSubscriber: (sub: Subscriber<T, K>): Subscriber<T, K> => {
      return {
        name: sub.getName(),
        _id: sub.getUniqueId,
        subscription: sub.getSubscription(),
        subscriberId: sub.getSubscriberId(),
        subscribersById: sub.getSubscribersById(),
        getUniqueId: sub.getUniqueId,
        subscribers: sub.getSubscribers,
        onSnapshotCallbacks: sub.getOnSnapshotCallbacks,
        onErrorCallbacks: sub.getOnErrorCallbacks,
        onUnsubscribeCallbacks: sub.getOnSnapshotCallbacks,
        notifyEventSystem: sub.notifyEventSystem,
        updateProjectState: sub.updateProjectState,
        logActivity: sub.getLogActivity,
        triggerIncentives: sub.getTriggerIncentives,
        optionalData: sub.getOptionalData,
        data: sub.data,
        email: "",
        enabled: false,
        tags: [],
        snapshotIds: [],
        payload: sub.getPayload,
        getTransformSubscriber: sub.getTransformSubscriber,
        fetchSnapshotIds: sub.getFetchSnapshotIds,
        getId: sub.getId,
        get_Id: sub.getUniqueId,
        id: sub.id,
        getEnabled: sub.getEnabled,
        getTags: sub.getTags,
        defaultSubscribeToSnapshots: sub.defaultSubscribeToSnapshots,
        subscribeToSnapshots: sub.subscribeToSnapshots,
        getSubscribers: sub.getSubscribers,
        transformSubscribers: sub.transformSubscribers,
        setSubscribers: sub.setSubscribers,
        getOnSnapshotCallbacks: sub.getOnSnapshotCallbacks,
        setOnSnapshotCallbacks: sub.setOnSnapshotCallbacks,
        getOnErrorCallbacks: sub.getOnErrorCallbacks,
        setOnErrorCallbacks: sub.setOnErrorCallbacks,
        getOnUnsubscribeCallbacks: sub.getOnUnsubscribeCallbacks,
        setOnUnsubscribeCallbacks: sub.setOnUnsubscribeCallbacks,
        setNotifyEventSystem: sub.setNotifyEventSystem,
        setUpdateProjectState: sub.setUpdateProjectState,
        setLogActivity: sub.setLogActivity,
        setTriggerIncentives: sub.setTriggerIncentives,
        setOptionalData: sub.setOptionalData,
        setEmail: sub.setEmail,
        setSnapshotIds: sub.setSnapshotIds,
        getPayload: sub.getPayload,
        handleCallback: sub.handleCallback,
        snapshotCallback: sub.snapshotCallback,
        getEmail: sub.getEmail,
        subscribe: sub.subscribe,
        unsubscribe: sub.unsubscribe,
        getOptionalData: sub.getOptionalData,
        getFetchSnapshotIds: sub.getFetchSnapshotIds,
        getSnapshotIds: sub.getSnapshotIds,
        getData: sub.getData,
        getInitialData: sub.getInitialData,
        getNewData: sub.getNewData,
        getDefaultSubscribeToSnapshots: sub.getDefaultSubscribeToSnapshots,
        getSubscribeToSnapshots: sub.getSubscribeToSnapshots,
        fetchTransformSubscribers: sub.fetchTransformSubscribers,
        getTransformSubscribers: sub.getTransformSubscribers,
        setTransformSubscribers: sub.setTransformSubscribers,
        getNotifyEventSystem: sub.getNotifyEventSystem,
        getUpdateProjectState: sub.getUpdateProjectState,
        getLogActivity: sub.getLogActivity,
        getTriggerIncentives: sub.getTriggerIncentives,
        initialData: sub.initialData,
        getName: sub.getName,
        getDetermineCategory: sub.getDetermineCategory,
        fetchSnapshotById: sub.fetchSnapshotById,
        snapshots: sub.snapshots,
        toSnapshotStore: sub.toSnapshotStore,
        determineCategory: sub.determineCategory,
        getDeterminedCategory: sub.getDeterminedCategory,
        processNotification: sub.processNotification,
        receiveSnapshot: sub.receiveSnapshot,
        getState: sub.getState,
        setEvent: sub.setEvent,
        onError: sub.onError,
        getSubscriberId: sub.getSubscriberId,
        getSubscribersById: sub.getSubscribersById,
        getSubscribersWithSubscriptionPlan: sub.getSubscribersWithSubscriptionPlan,
        getSubscription: sub.getSubscription,
        onUnsubscribe: sub.onUnsubscribe,
        onSnapshot: sub.onSnapshot,
        onSnapshotError: sub.onSnapshotError,
        onSnapshotUnsubscribe: sub.onSnapshotUnsubscribe,
        triggerOnSnapshot: sub.triggerOnSnapshot,
      };
    },
    transformDelegate: (): SnapshotStoreConfig<T, K>[] => {
      return [
        {
          // Add properties of SnapshotStoreConfig
        }
      ];
    },

    initializedState: null,
    getAllKeys: () => [],
    getAllItems: () => [],

    addData: () => { },
    addDataStatus: () => { },
    removeData: () => { },
    updateData: () => { },

    updateDataTitle: () => { },
    updateDataDescription: () => { },
    updateDataStatus: () => { },
    addDataSuccess: () => { },

    getDataVersions: () => [],
    updateDataVersions: () => { },
    getBackendVersion: () => '',
    getFrontendVersion: () => '',

    fetchData: () => Promise.resolve(),
    defaultSubscribeToSnapshot: () => Promise.resolve(),
    handleSubscribeToSnapshot: () => Promise.resolve(),

    removeItem: () => { },
    getSnapshot: () => ({}) as Snapshot<T, K>,
    getSnapshotSuccess: () => { },
    getSnapshotId: () => '',

    getItem: () => ({} as T),
    setItem: () => { },
    addSnapshotFailure: () => { },
    getDataStore: () => ({}),

    addSnapshotSuccess: () => { },
    compareSnapshotState: () => false,
    deepCompare: () => false,
    shallowCompare: () => false,

    getDataStoreMethods: () => ({}),
    getDelegate: () => ({}),
    determineCategory: () => '',
    determinePrefix: () => '',

    updateSnapshot: () => { },
    updateSnapshotSuccess: () => { },
    updateSnapshotFailure: () => { },
    removeSnapshot: () => { },

    snapshotItems: [],
    nestedStores: [],
    addSnapshotItem: () => { },
    addNestedStore: () => { },
    getData: () => null,
    clearSnapshots: () => { },
    addSnapshot: () => { },
    createSnapshot: () => { },
    snapshotStoreConfig: {} as SnapshotStoreConfig<T, K>,
    meta: {},
    getSnapshotItems: () => [],
    createInitSnapshot: () => { },

    createSnapshotSuccess: () => { },
    setSnapshotSuccess: () => { },
    setSnapshotFailure: () => { },
    createSnapshotFailure: () => { },

    updateSnapshots: () => { },
    updateSnapshotsSuccess: () => { },
    updateSnapshotsFailure: () => { },
    initSnapshot: () => { },

    takeSnapshot: () => { },
    takeSnapshotSuccess: () => { },
    takeSnapshotsSuccess: () => { },
    configureSnapshotStore: () => { },
    flatMap: function <U extends Iterable<any>>(
      callback: (value: SnapshotStoreConfig<T, K>, index: number, array: SnapshotStoreConfig<T, K>[]) => U
    ) {
      // Assume we have an array of SnapshotStoreConfig<T, K>
      const snapshotStoreConfigArray: SnapshotStoreConfig<T, K>[] = []; // Populate this as necessary
      return flatMapImplementation(snapshotStoreConfigArray, callback);
    },
    setData: (data: Map<string, Snapshot<T, K>>) => { },
    getState: () => ({}),
    setState: () => { },

    validateSnapshot: () => false,
    handleSnapshot: (
      id: string,
      snapshotId: number,
      snapshot: T | null,
      snapshotData: T,
      category: Category | undefined,
      callback: (snapshot: T) => void,
      snapshots: SnapshotsArray<T>,
      type: string,
      event: Event,
      snapshotContainer?: T,
      snapshotStoreConfig?: SnapshotStoreConfig<T, any> | null,
    ): Promise<Snapshot<T, K> | null> => { 
      return new Promise<Snapshot<T, K> | null>(async (resolve, reject) => {
        try {
          // Validate input parameters
          if (!id || !snapshotId || !snapshotData) {
            throw new Error('Missing required parameters.');
          }
    
          // Initialize snapshot
          let currentSnapshot: T;
    
          if (snapshot) {
            // Use existing snapshot
            currentSnapshot = snapshot;
          } else {
            // Create a new snapshot if not provided
            currentSnapshot = snapshotData;
          }
    
          // Apply snapshot data
          if (snapshotContainer) {
            // Update the container with new snapshot data
            Object.assign(snapshotContainer, snapshotData);
          }
    
          // Update snapshots array based on type
          switch (type) {
            case 'create':
              snapshots.push(currentSnapshot);
              break;
            case 'update':
              const index = snapshots.findIndex(s => s.id === snapshotId);
              if (index !== -1) {
                snapshots[index] = currentSnapshot;
              } else {
                throw new Error('Snapshot not found for update.');
              }
              break;
            case 'delete':
              const deleteIndex = snapshots.findIndex(s => s.id === snapshotId);
              if (deleteIndex !== -1) {
                snapshots.splice(deleteIndex, 1);
              } else {
                throw new Error('Snapshot not found for deletion.');
              }
              break;
            default:
              throw new Error('Unsupported snapshot type.');
          }
    
          // Apply snapshot store configuration if provided
          if (snapshotStoreConfig) {
            // Update snapshot store based on configuration
            // Implementation depends on specific configuration details
          }
    
          // Execute callback with updated snapshot
          callback(currentSnapshot);
    
          // Handle event
          // Implement event handling logic as needed
    
          // Return the updated snapshot
          resolve({
            id,
            data: new Map<string, T>(), // Replace with actual snapshot data if needed
            category,
            store: {} as SnapshotStore<T, K>, // Replace with actual SnapshotStore instance if needed
            getSnapshotId: async () => id,
            compareSnapshotState: () => false, // Implement comparison logic
            snapshot: async () => ({
              snapshot: {
                id,
                data: new Map<string, T>(), // Replace with actual snapshot data if needed
                category,
              }
            }),
            getSnapshotData: () => new Map<string, Snapshot<T, K>>(), // Replace with actual snapshot data if needed
            getSnapshotCategory: () => category,
            setSnapshotData: () => {}, // Implement logic to set snapshot data
            setSnapshotCategory: () => {}, // Implement logic to set snapshot category
            deleteSnapshot: () => {}, // Implement deletion logic
            restoreSnapshot: () => {}, // Implement restoration logic
            createSnapshot: () => ({
              id,
              data: new Map<string, T>(), // Replace with actual snapshot data if needed
              category,
            }),
            updateSnapshot: async () => ({
              snapshotId,
              data: new Map<string, T>(), // Replace with actual snapshot data if needed
              // Include other return values as needed
            }),
            // Add additional properties and methods if needed
          });
        } catch (error) {
          console.error('Error handling snapshot:', error);
          // Handle error as needed, e.g., notify user or log error
          resolve(null); // Resolve with null on error
        }
      });
    },
    handleActions: () => { },
    setSnapshot: () => { },

    transformSnapshotConfig: (config: SnapshotStoreConfig<any, T>
    ): SnapshotStoreConfig<any, T> => {
      // Transform the provided config as needed
      // This example assumes you might want to modify or return the config directly
  
      // Example implementation: Returning the config unchanged
      return config;
    },
    setSnapshotData: (
      snapshotStore: SnapshotStore<T, K>,
      data: Map<string, Snapshot<T, K>>,
      subscribers: Subscriber<T, K>[],
      snapshotData: Partial<
        SnapshotStoreConfig<T, K>
      >
    ) => { },
    setSnapshots: () => { },
    clearSnapshot: () => { },

    mergeSnapshots: () => [],
    reduceSnapshots: () => [],
    sortSnapshots: () => [],
    filterSnapshots: () => [],

    mapSnapshots: () => { },
    findSnapshot: () => ({} as Snapshot<T, K>),
    getSubscribers: () => [],
    notify: () => { },

    notifySubscribers: (
      subscribers: Subscriber<T, K>[],
      data: Partial<SnapshotStoreConfig<BaseData, any>>
    ): Subscriber<BaseData, K>[] => {
      // Implement the logic to notify subscribers
      return subscribers;
    },
    subscribe: () => { },
    unsubscribe: () => { },
    fetchSnapshot: () => Promise.resolve(),

    fetchSnapshotSuccess: () => { },
    fetchSnapshotFailure: () => { },
    getSnapshots: () => [],
    getAllSnapshots: () => [],

    generateId: () => '',
    batchFetchSnapshots: () => [],
    batchTakeSnapshotsRequest: () => [],
    batchUpdateSnapshotsRequest: () => [],

    filterSnapshotsByStatus: () => [],
    filterSnapshotsByCategory: () => [],
    filterSnapshotsByTag: () => [],

    batchFetchSnapshotsSuccess: () => { },
    batchFetchSnapshotsFailure: () => { },
    batchUpdateSnapshotsSuccess: () => { },
    batchUpdateSnapshotsFailure: () => { },

    batchTakeSnapshot: (
      snapshotStore: SnapshotStore<T, K>,
      snapshots: Snapshots<T>
    ): Promise<{ snapshots: Snapshots<T>; }> => {
      // Implement the logic to batch take snapshots
      return Promise.resolve({ snapshots });
    },

    handleSnapshotSuccess: () => { },
    handleSnapshotFailure: () => { },
    eventRecords: {},

    getBackendVersion: async () => "",
    snapshotStore: {} as SnapshotStore<T, K>,
    getParentId: () => '',
    getChildIds: () => [],

    addChild: () => { },
    removeChild: () => { },
    getChildren: () => [],
    hasChildren: () => false,

    isDescendantOf: () => false,
    dataItems: [],
    newData: null,
    getInitialState: () => null,

    getConfigOption: () => ({} as SnapshotStoreConfig<T, K>),
    getTimestamp: () => new Date(),
    stores: [],
    getStore: () => ({} as SnapshotStore<T, K>),

    addStore: () => { },
    mapSnapshot: () => ({} as Snapshot<T, K>),
    removeStore: () => { },
    createSnapshots: () => [],

    onSnapshot: () => { },
    onSnapshots: () => { },
    events: {
      callbacks: {} as Callback<Snapshots<T>>,
      eventRecords: {} as Record<string, CalendarEvent[]>
    },

    defaultActionHandler: () => { },
    handleActionSuccess: () => { },
    handleActionFailure: () => { },
    configureSnapshot: () => { },

    sortStores: () => [],
    mapStores: () => [],
    filterStores: () => [],
    mapNestedStores: () => [],

    getStoreKeys: () => [],
    getStoreItems: () => [],
    mergeStore: () => { },
    setStoreData: () => { },

    handleTransformSnapshotConfig: () => ({}),
    handleTransformSnapshot: () => ({}),
    addSnapshotStore: () => { },
    handleTransformStores: () => [],

    sortData: () => [],
    mapData: () => [],
    filterData: () => [],
    reduceData: () => [],

    findData: () => null,
    getStoreData: () => { },
    getStoreSnapshot: () => ({} as Snapshot<T, K>),
    fetchStoreSnapshots: () => [],

    transformSnapshot: () => ({} as Snapshot<T, K>),
    flattenSnapshot: () => { },
    batchSnapshots: [],
    batchStores: [],

    getAllSnapshotStores: () => [],
    getAllSnapshotItems: () => [],
    getSnapshotConfig: () => ({} as SnapshotStoreConfig<T, K>),
    eventStore: [],

    getEventStore: () => [],
    filterStoreEvents: () => [],
    mapStoreEvents: () => [],
    reduceStoreEvents: () => [],

    findStoreEvent: () => null,
    snapshotState: {},
    storeState: {},
    initialStoreState: {},

    configureStore: () => { },
    configureState: () => { },
    getStateStore: () => { },
    getStateData: () => { },

    getSnapshotEvent: () => null,
    getEvent: () => null,
    notifyStore: () => { },
    notifyStoreEvents: () => { },

    getSubscriptionId: () => '',
    getSnapshotEventStore: () => [],
    addSnapshotEvent: () => { },
    updateSnapshotEvent: () => { },

    removeSnapshotEvent: () => { },
    filterSnapshotEvents: () => [],
    mapSnapshotEvents: () => [],
    reduceSnapshotEvents: () => [],

    findSnapshotEvent: () => null,
    eventState: {},
    getInitialState: (): T => {
      return {} as T
    },
    getStoreItem: () => ({}),

    setStoreItem: () => { },
    removeStoreItem: () => { },
    addStoreItem: () => { },
    updateStoreItem: () => { },

    getStoreKeys: () => [],
    getStoreValues: () => [],
    getStoreItems: () => [],
    createStoreItem: () => ({}),

    batchFetchStoreItems: () => [],
    batchTakeStoreItems: () => [],
    batchUpdateStoreItems: () => [],
    addStoreEvent: () => { },

    updateStoreEvent: () => { },
    removeStoreEvent: () => { },
    notifyStoreEvent: () => { },
    fetchStoreEvent: () => Promise.resolve(),

    fetchStoreEventSuccess: () => { },
    fetchStoreEventFailure: () => { },
    fetchStoreEvents: () => [],
    fetchStoreEventsSuccess: () => { },

    fetchStoreEventsFailure: () => { },
    getStoreEvent: () => null,
    findStoreEvent: () => null,
    notifyAllStoreEvents: () => { },

    fetchStoreEventList: () => [],
    batchFetchStoreEventList: () => [],
    batchTakeStoreEventList: () => [],
    batchUpdateStoreEventList: () => [],
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

function convertSnapshotToMap<T extends Data, K extends Data>(
  snapshot: Snapshot<T, K>
): Map<string, any> {
  const map = new Map<string, any>();

  if (snapshot && snapshot.data) {
    // Check if snapshot.data is an object and not a Map
    if (typeof snapshot.data === 'object' && !(snapshot.data instanceof Map)) {
      Object.keys(snapshot.data as T).forEach(key => {
        // Ensure the key exists on the data object
        if (snapshot.data && key in snapshot.data) {
          map.set(key, (snapshot.data as T)[key]);
        }
      });
    } else if (snapshot.data instanceof Map) {
      // If snapshot.data is a Map, merge it directly into the new map
      snapshot.data.forEach((value, key) => {
        map.set(key, value);
      });
    }
  }

  return map;
}


const convertSnapshotContainerToStore = <T extends Data, K extends Data>(
  snapshotContainer: SnapshotContainer<T, K>
): SnapshotStore<Data, BaseData> => {
  return {
    storeId: snapshotContainer.storeId || '', // Or use a default/fallback value
    name: snapshotContainer.name || '',
    version: snapshotContainer.version || new Version('0.0.0'),
    schema: snapshotContainer.schema || {},
    options: snapshotContainer.options || {},
    category: snapshotContainer.category || '',
    config: snapshotContainer.config || {},
    operation: snapshotContainer.operation || 'defaultOperation',
    id, key, keys, topic,
    date, title, categoryProperties, message,
    timestamp, createdBy, eventRecords, type,
    subscribers, createdAt, store, stores,
    snapshots, snapshotConfig, meta, snapshotMethods,
    getSnapshotsBySubscriber, getSnapshotsBySubscriberSuccess, getSnapshotsByTopic, getSnapshotsByTopicSuccess,
    getSnapshotsByCategory, getSnapshotsByCategorySuccess, getSnapshotsByKey, getSnapshotsByKeySuccess,
    getSnapshotsByPriority, getSnapshotsByPrioritySuccess, getStoreData, updateStoreData,
    updateDelegate, getSnapshotContainer, getSnapshotVersions, createSnapshot,
    
    // Map other propertiwes as needed
  } as SnapshotStore<Data, BaseData>;
};



export {
  convertMapToSnapshot, convertMapToSnapshotStore, convertSnapshoStoretData,
  convertSnapshotContent,
  convertSnapshotData,
  convertSnapshotStoreConfig,
  convertSnapshotStoreItemToT,
  convertSnapshotStoreToMap,
  convertSnapshotStoreToSnapshot, convertSnapshotToMap, convertSnapshotToStore, convertToDataSnapshot, convertToDataStore,
  convertToSnapshotStoreConfig,
  createSnapshotStoreConfig,
  createSnapshotStoreOptions,
  isSnapshot,
  isSnapshotStore, snapshotType,
  convertSnapshotContainerToStore 
};

