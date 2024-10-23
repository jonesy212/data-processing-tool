import { createSnapshot, getSnapshotContainer, getSnapshotId } from "@/app/api/SnapshotApi";
import { Subscriber } from '@/app/components/users/Subscriber';
import { categoryProperties, CategoryProperties } from "@/app/pages/personas/ScenarioBuilder";
import { useContext } from "react";
import { CombinedEvents, SnapshotManager } from "../hooks/useSnapshotManager";
import { Category } from "../libraries/categories/generateCategoryProperties";
import { BaseData, Data } from "../models/data/Data";
import { StatusType } from "../models/data/StatusType";
import { RealtimeDataItem } from "../models/realtime/RealtimeData";
import { DataStoreMethods, DataStoreWithSnapshotMethods } from "../projects/DataAnalysisPhase/DataProcessing/ DataStoreMethods";
import { DataStore } from "../projects/DataAnalysisPhase/DataProcessing/DataStore";
import { SnapshotContainer, SnapshotData, SnapshotDataType, snapshotStoreConfig, SnapshotStoreConfig, SnapshotStoreProps } from '../snapshots';
import { CoreSnapshot, Snapshot, snapshots, Snapshots, SnapshotsArray, SnapshotUnion } from "../snapshots/LocalStorageSnapshotStore";
import { retrieveSnapshotData } from "../snapshots/RetrieveSnapshotData";
import { ConfigureSnapshotStorePayload, SnapshotConfig } from "../snapshots/SnapshotConfig";
import { default as SnapshotStore } from "../snapshots/SnapshotStore";
import { createSnapshotStoreOptions } from '../snapshots/createSnapshotStoreOptions';

import { SnapshotContext } from "@/app/context/SnapshotContext";
import { SnapshotContent } from "../snapshots/SnapshotContent";
import { convertBaseDataToK } from "../snapshots/convertSnapshot";
import { createSnapshotStore, delegate, initSnapshot, subscribeToSnapshots } from "../snapshots/snapshotHandlers";
import {
    Callback
} from "../snapshots/subscribeToSnapshotsImplementation";
import { generateSnapshotId } from "../utils/snapshotUtils";
import { CalendarEvent, eventRecords } from "./../state/stores/CalendarEvent";

import { UnifiedMetaDataOptions } from "@/app/configs/database/MetaDataOptions";
import { getCurrentSnapshotConfigOptions } from "../snapshots/getCurrentSnapshotConfigOptions";
import { configureSnapshot } from "../snapshots/snapshotOperations";
import { store } from "../state/stores/useAppDispatch";

import { CreateSnapshotsPayload } from "../database/Payload";
import { K, Meta, T } from "../models/data/dataStoreMethods";

import { Subscription } from "react-redux";



// Define YourSpecificSnapshotTywpe implementing Snapshot<T, Meta, K>
class YourSpecificSnapshotType <T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T>
  implements Snapshot<T, Meta, K> {
  id: string;
  data: Map<string, Snapshot<T, Meta, K>>;
  meta: Map<string, Snapshot<T, Meta, K>>;
  events: CombinedEvents<T, Meta, K>
  
  constructor(
    id: string,
    data: Map<string, Snapshot<T, Meta, K>>,
    meta: Map<string, Snapshot<T, Meta, K>>,
    events?: CombinedEvents<T, Meta, K>) {
    this.id = id;
    this.data = data;
    this.meta = meta;
    this.events = {
      callbacks: events?.callbacks ?? ((snapshot: Snapshot<T, Meta, K>) => {
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

  // Implement methods required by Snapshot<T, Meta, K>
  getId(): string {
    return this.id;
  }

  setData(data: Map<string, Snapshot<T, Meta, K>>): void {
    this.data = data;
    // Additional logic if necessary
  }
}



function flatMapImplementation<T extends Data, K extends Data, U extends Iterable<any>>(
  array: SnapshotStoreConfig<T, Meta, K>[],
  callback: (value: SnapshotStoreConfig<T, Meta, K>, index: number, array: SnapshotStoreConfig<T, Meta, K>[]) => U
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
const specificSnapshot = new YourSpecificSnapshotType<T, Meta, BaseData>(
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
const convertToDataStore = <T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T>(
  config: SnapshotStoreConfig<T, Meta, K>[]
): Promise<DataStore<T, Meta, K>[]> => {
  return Promise.resolve(
    config.map(c => ({
    // Snapshot mapping methods
    mapSnapshot: (snapshot: Snapshot<T, Meta, K>) => snapshot,
    mapSnapshots: (snapshots: Snapshot<T, Meta, K>[]) => snapshots,
    mapSnapshotStore: (store: SnapshotStore<T, Meta, K>) => store,

    // Core properties
    id: c.id ?? undefined,
    data: c.data,
    snapshots: c.snapshots,
    state: c.state,
    snapshotId: c.snapshotId,
    set: c.set,
    configOption: c.configOption,
    initialState: c.initialState,
    snapshotStore: c.snapshotStore,
    snapshotItems: c.getSnapshotItems,
    nestedStores: c.getNestedStores,
    events: c.events,
    dataItems: c.dataItems,
    newData: c.newData,
    stores: c.stores,
    snapshotStoreConfig: c.snapshotStoreConfig,
    snapshotIds: c.snapshotIds,

    // Methods for handling data
    getSnapshotItems: c.getSnapshotItems,
    dataStoreMethods: c.dataStoreMethods,
    transformSubscriber: c.transformSubscriber,
    transformDelegate: c.transformDelegate,

    // Data manipulation methods
    addSnapshotItem: c.addSnapshotItem,
    delegate: c.delegate,
    getData: c.getData,
    dataStore: c.dataStore,

    // Metadata and default methods
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
    set: () => ({} as DataStore<T, Meta, K>),
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
    getDataStore: () => ({} as DataStore<T, Meta, K>),
    setDataStore: () => { },

    // Data update and management methods
    removeData: () => {},
    updateData: () => {},
    updateStoreData: () => {},
    updateDataTitle: () => {},
    updateDataDescription: () => {},
    addDataStatus: () => {},
    updateDataStatus: () => {},
    addDataSuccess: () => {},
    getDataVersions: () => {},
    updateDataVersions: () => {},
    getBackendVersion: () => {},
    getFrontendVersion: () => {},

    // Snapshot management methods
    determineSnapshotStoreCategory: c.determineSnapshotStoreCategory,
    getDataWithSearchCriteria: c.getDataWithSearchCriteria,
    initializedState: c.initializedState,
    getAllData: c.getAllData,
    getAllKeys: c.getAllKeys,
    fetchData: c.fetchData,
    defaultSubscribeToSnapshot: c.defaultSubscribeToSnapshot,
    handleSubscribeToSnapshot: c.handleSubscribeToSnapshot,
    getAllItems: c.getAllItems,
    getDelegate: c.getDelegate,
    updateDelegate: c.updateDelegate,
    getSnapshot: c.getSnapshot,
    getSnapshotWithCriteria: c.getSnapshotWithCriteria,
    getSnapshotContainer: c.getSnapshotContainer,
    getSnapshotVersions: c.getSnapshotVersions,
    getSnapshotWithCriteriaVersions: c.getSnapshotWithCriteriaVersions,
    dataStoreConfig: c.dataStoreConfig,
    config: c.config,

    // Subscribers and retrieval methods
    getSubscribers: c.getSubscribers,
    getSnapshotByKey: c.getSnapshotByKey,
    getSuubscribers: c.getSuubscribers,



    }))
  );
};




function convertToSnapshotStoreConfig <T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T>(
  snapshotStore: SnapshotStore<T, Meta, K>
): SnapshotStoreConfig<T, any> {
  const mappedSnapshots: Snapshots<T, Meta> =
    snapshotStore.snapshots.map((s: Snapshot<T, any>) => ({
      ...s,
      ...snapshotStore,
      snapshotId: s.snapshotId || '',
      set: s.set || new Set(),
      snapshots: s.snapshots || [],
      schema: s.schema,  
      config: s.config || {},
      items: s.items || [],
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

  const mappedState: Snapshot<T, Meta, K>[] | null = snapshotStore.state
    ? snapshotStore.state.map((
      snapshot: SnapshotUnion<T, Meta>
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

  function isSubscriber <T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T>(
    obj: any
  ): obj is Subscriber<T, Meta, K> {
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

function convertSnapshotStoreConfig<T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T>(config: SnapshotStoreConfig<any, any>): SnapshotStoreConfig<T, Meta, K> {
  // Implement conversion logic for SnapshotStoreConfig
  // This is a placeholder; adjust according to your actual conversion logic
  return config as SnapshotStoreConfig<T, Meta, K>;
}

function convertSnapshotToStore <T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T>(
  snapshot: Snapshot<T, Meta, K>
): SnapshotStore<T, Meta, K> {
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
    initialState: snapshot.initialState || {},
    dataStoreMethods: snapshot.dataStoreMethods,
    delegate: snapshot.delegate || undefined,
    subscriberId: snapshot.subscriberId,
    length: snapshot.length,
    content: snapshot.content,
    value: snapshot.value,

    todoSnapshotId: snapshot.todoSnapshotId,
    events: snapshot.events,
    snapshotStore: snapshot.snapshotStore,
    dataItems: snapshot.dataItems || null,

    newData: snapshot.newData,
    defaultSubscribeToSnapshots: snapshot.defaultSubscribeToSnapshots,
    subscribeToSnapshots: snapshot.subscribeToSnapshots,
    transformSubscriber: snapshot.transformedSubscriber,

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
    snapshotItems: snapshot.snapshotItems.nestedStores,
    nestedStores: snapshot.nestedStores,
    addSnapshotItem: snapshot.addSnapshotItem,
    addNestedStore: snapshot.addNestedStore,
    getData: snapshot.getData,
    getData: snapshot.getData,
    clearSnapshots: snapshot.clearSnapshots,
    addSnapshot: snapshot.addSnapshot,
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
      // other properties from SnapshotStore<T, Meta, K>
    }
  }
}

const convertSnapshotStoreToSnapshot = <T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T>(
  store: SnapshotStore<T, Meta, K>
): Snapshot<T, Meta, K> => {
  const snapshotStoreConfig = store.getConfig();

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
    config: snapshotStoreConfig,
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
    getChildren: (id: string, childSnapshot: Snapshot<T, Meta, K>) => { 
      return []
    },
    hasChildren: () => false,
    isDescendantOf: (childId: string, 
      parentId: string, 
      parentSnapshot: Snapshot<T, Meta, K>, 
      childSnapshot: Snapshot<T, Meta, K>) => false,
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

const convertSnapshotData =  <T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T>(
  snapshotConfigData: SnapshotDataType<T, Meta, K> 
): SnapshotDataType<T, Meta, K> => {
  return snapshotConfigData
};


function convertToDataSnapshot <T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T>(
  snapshot: Snapshot<T, Meta, K>
): Snapshot<Data, Meta, Data> {
  return {
    ...snapshot,
    data: snapshot.data as unknown as Map<string, Snapshot<Data, Meta, Data>>,
    content: snapshot.content as unknown as SnapshotContent<T, Meta, Data>,
    mappedSnapshotData: new Map(Object.entries(snapshot.mappedSnapshotData).map(([key, value]) => [key, value as Snapshot<Data, Meta, Data>])),
    snapshot: (
      id: string | number | undefined,
      snapshotId: number,
      snapshotData: SnapshotData<T, Meta, K>,
      category: symbol | string | Category | undefined,
      categoryProperties: CategoryProperties | undefined,
      callback: (snapshotStore: SnapshotStore<T, Meta, K>) => void,
      dataStore: DataStore<T, Meta, K>,
      dataStoreMethods: DataStoreMethods<T, Meta, K>,
      metadata: UnifiedMetaDataOptions,
      subscriberId: string, // Add subscriberId here
      endpointCategory: string | number, // Add endpointCategory here
      storeProps: SnapshotStoreProps<T, Meta, K>,
      snapshotConfigData: SnapshotConfig<T, Meta, K>,
      subscription: Subscription<T, Meta, K>,
  
      snapshotStoreConfigData?: SnapshotStoreConfig<T, Meta, K>,
      snapshotContainer?: SnapshotStore<T, Meta, K> | Snapshot<T, Meta, K> | null
    ) => {
      return new Promise<Snapshot<Data, Meta, Data>>(async (resolve, reject) => {
        try {
          const result = await snapshot.snapshot(
            id,
            snapshotId,
            snapshotData,
            category,
            categoryProperties,
            callback,
            dataStore,
            dataStoreMethods,
            metadata,
            subscriberId,
            endpointCategory,
            storeProps,
            snapshotConfigData,
            subscription,
            snapshotStoreConfigData,
            snapshotContainer,
          );
          resolve(result as unknown as Snapshot<Data, Meta, Data>);
        } catch (error) {
          reject(error);
        }
      });
    }
  } as unknown as Snapshot<Data, Meta, Data>;
}





const convertSnapshoStoretData =  <T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T>(
  snapshotStoreConfigData: SnapshotStoreConfig<any, Meta, K>
): SnapshotStoreConfig<any, Meta, K> => {
  return snapshotStoreConfigData
};


const snapshotType =  <T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T>(
  snapshot: Snapshot<T, Meta, K>
): Snapshot<T, Meta, K> => {
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


const snapshotStoreType = async <T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T>(
  snapshotStore: SnapshotStore<T, Meta, K>
): Promise<SnapshotStore<T, Meta, K>> => {
  const defaultCategory: Category = "defaultCategory";
  const context = useContext(SnapshotContext);
  const newSnapshotStore = { ...snapshotStore };
  
  newSnapshotStore.id = snapshotStore.id || generateSnapshotId();
  newSnapshotStore.title = snapshotStore.title || "";
  newSnapshotStore.timestamp = snapshotStore.timestamp
    ? new Date(snapshotStore.timestamp)
    : new Date();
  newSnapshotStore.subscriberId = snapshotStore.subscriberId || "";
  newSnapshotStore.category =
    typeof snapshotStore.category === "string"
      ? snapshotStore.category
      : defaultCategory;
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

  // Get delegates if available
  const delegate = await snapshotStore.getDelegate(context);
  newSnapshotStore.delegate = delegate
    ? delegate.map((delegateConfig: any) => ({
        ...delegateConfig,
        data: delegateConfig.data as T,
        snapshotStore: delegateConfig.snapshotStore as SnapshotStore<T, Meta, K>
      }))
    : [];
  
  // Additional assignments
  newSnapshotStore.store = snapshotStore.store;
  newSnapshotStore.state = snapshotStore.state;
  newSnapshotStore.todoSnapshotId = snapshotStore.todoSnapshotId || "";
  newSnapshotStore.initialState = snapshotStore.initialState;
  newSnapshotStore.safeCastSnapshotStore = snapshotStore.safeCastSnapshotStore(snapshotStore);
  newSnapshotStore.getFirstDelegate = snapshotStore.getFirstDelegate();
  newSnapshotStore.getInitialDelegate = snapshotStore.getInitialDelegate();
  newSnapshotStore.transformInitialState = snapshotStore.transformInitialState();

  return newSnapshotStore;
};


// Type guard to check if input is SnapshotStore<BaseData>
const isSnapshotStore = (store: any): store is SnapshotStore<BaseData, Meta, K> => {
  return store && store instanceof SnapshotStore;
};



const convertSnapshotStoreItemToT =  <T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T>(
  item: Snapshot<T, Meta, K>
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


const convertSnapshotStoreItemToSnapshot =  <T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T>(
  item: Snapshot<T, Meta, K>
): Snapshot<T, Meta, K> => {
  return item;
};

// Function to convert SnapshotStore<BaseData> to Map<string, T>
const convertSnapshotStoreToMap =  <T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T>(
  store: SnapshotStore<T, Meta, K>
): Map<string, Snapshot<T, Meta, K>> => {
  const dataMap = new Map<string, Snapshot<T, Meta, K>>();

  // Assuming 'data' is an array or iterable within SnapshotStore<BaseData>
  store.data?.forEach((item: Snapshot<T, Meta, K>, key: string) => {
    // Use the conversion function to ensure item is compatible with Snapshot<T, Meta, K>
    const convertedItem = convertSnapshotStoreItemToSnapshot(item);
    dataMap.set(key, convertedItem);
  });

  return dataMap;
};


function createSnapshotStoreConfig <T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T>(
  options: SnapshotStoreConfig<T, Meta, K>
): SnapshotStoreConfig<T, Meta, K> {
  return { ...options };
}

function convertMapToSnapshotStore<T extends Data, K extends T>(
  map: Map<string, Snapshot<T, Meta, K>>,
  timestamp: string | number | Date | undefined,
  storeProps: SnapshotStoreProps<T, Meta, K>
): SnapshotStore<T, Meta, K> {

  const snapshotStoreOptions = createSnapshotStoreOptions<T, Meta, K>({
    initialState: null,
    snapshotId: "defaultId",
    category: {} as CategoryProperties, // Adjust as needed
    dataStoreMethods: {} as Partial<DataStoreWithSnapshotMethods<T, Meta, K>>, // Provide actual methods if needed
    categoryProperties: {} as CategoryProperties,
  });
  const { storeId, name, version, schema, options, category, config, operation, snapshots, expirationDate, payload, callback, storeProps, endpointCategory} = storeProps
  const snapshotStore = new SnapshotStore<T, Meta, K>({ storeId, name, version, schema, options, category, config, operation, snapshots, expirationDate, payload, callback, storeProps, endpointCategory });

  // Populate snapshotStore with map data
  map.forEach((value, key) => {
    const snapshot: Snapshot<T, Meta, K> = {
      id: key,
      data: new Map<string, Snapshot<T, Meta, K>>().set(key, {

        isCore: "",
        initialConfig: "",
        removeSubscriber: "",
        onInitialize: "",
        
        onError: "",
        taskIdToAssign: "",
        schema: "",
        currentCategory: "",
       
        mappedSnapshotData: "",
        storeId: "",
        versionInfo: "",
        initializedState: "",
       
        criteria: "",
        setCategory: "",
        applyStoreConfig: "",
        generateId: "",
       
        snapshotData: "",
        snapshotContainer: "",
        getSnapshotItems: "",
        defaultSubscribeToSnapshots: "",
       
        notify: "",
        notifySubscribers: "",
        getAllSnapshots: "",
        getSubscribers: "",
       
        transformSubscriber: "",
        transformDelegate: "",
        getAllKeys: "",
        getAllValues: "",
       
        getAllItems: "",
        getSnapshotEntries: "",
        getAllSnapshotEntries: "",
        addDataStatus: "",
        
        removeData: "",
        updateData: "",
        updateDataTitle: "",
        updateDataDescription: "",
       
        updateDataStatus: "",
        addDataSuccess: "",
        getDataVersions: "",
        updateDataVersions: "",
       
        getBackendVersion: "",
        getFrontendVersion: "",
        fetchStoreData: "",
        fetchData: "",
       
        subscribers: "",
        getSnapshotId: "",
        snapshot: "",
        createSnapshot: "",
        
        defaultSubscribeToSnapshot: "",
        handleSubscribeToSnapshot: "",
        removeItem: "",
        getSnapshot: "",
       



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
        setData: (data: Map<string, Snapshot<T, Meta, K>>) => { },
        addData: () => { },
        eventRecords: {},
        getParentId: () => null,
        getChildIds: (childSnapshot: Snapshot<BaseData, Meta, K>) => null,
        addChild: (snapshot: Snapshot<T, Meta, K>) => { },
        removeChild: (snapshot: Snapshot<T, Meta, K>) => { },
        getChildren: () => { },
        hasChildren: () => false,
        isDescendantOf: () => false,
        dataItems: [],
        newData: {} as Snapshot<T, Meta, K>,
        stores: [],
        getConfigOption: () => getCurrentSnapshotConfigOptions,
        getStore: (
          storeId: number,
          snapshotStore: SnapshotStore<T, Meta, K>,
          snapshotId: string,
          snapshot: Snapshot<T, Meta, K>,
          type: string,
          event: Event
        ) => null,
        addStore: (
          storeId: number,
          snapshotStore: SnapshotStore<T, Meta, K>,
          snapshotId: string,
          snapshot: Snapshot<T, Meta, K>,
          type: string,
          event: Event
        ) => null,
        mapSnapshot: (
          storeId: number,
          snapshotStore: SnapshotStore<T, Meta, K>,
          snapshotId: string,
          snapshot: Snapshot<T, Meta, K>,
          type: string,
          event: Event
        ) => null,
        removeStore: (
          storeId: number,
          store: SnapshotStore<T, Meta, K>,
          snapshotId: string,
          snapshot: Snapshot<T, Meta, K>,
          type: string,
          event: Event
        ) => null,
        unsubscribe: (
          callback: Callback<Snapshot<T, Meta, K>>) => null,
        fetchSnapshot: (
          callback: (
            snapshotId: string,
            snapshot: Snapshot<T, Meta, K> | undefined
          ) => void
        ) => null,
        addSnapshotFailure: (
          snapshotManager: SnapshotManager<T, Meta, K>,
          snapshot: Snapshot<T, Meta, K>,
          payload: { error: Error; }
        ) => null,
        configureSnapshotStore: (
          snapshotStore: SnapshotStore<T, Meta, K>,
          snapshotId: string,
          data: Map<string, Snapshot<T, Meta, K>>,
          events: Record<string, CalendarEvent[]>,
          dataItems: RealtimeDataItem[],
          newData: Snapshot<T, Meta, K>,
          payload: ConfigureSnapshotStorePayload<T>,
          store: SnapshotStore<any, Meta, K>,
          callback: (snapshotStore: SnapshotStore<T, Meta, K>) => void
        ) => null,
        updateSnapshotSuccess: (
          snapshotId: string,
          snapshotManager: SnapshotManager<T, Meta, K>,
          snapshot: Snapshot<T, Meta, K>,
          payload: { error: Error; }
        ) => null,
        createSnapshotFailure: async (
          snapshotId: string,
          snapshotManager: SnapshotManager<T, Meta, K>,
          snapshot: Snapshot<T, Meta, K>,
          payload: { error: Error; }
        ) => { },
        createSnapshotSuccess: (
          snapshotId: string,
          snapshotManager: SnapshotManager<T, Meta, K>,
          snapshot: Snapshot<T, Meta, K>,
          payload: { error: Error; }) => null,
        createSnapshots: (
          id: string,
          snapshotId: string,
          snapshot: Snapshot<T, Meta, K>,
          snapshotManager: SnapshotManager<T, Meta, K>,
          payload: CreateSnapshotsPayload<T, Meta, K>,
          callback: (snapshots: Snapshot<T, Meta, K>[]) => void | null,
          snapshotDataConfig?: SnapshotConfig<T, Meta, K>[],
          category?: string | symbol | Category
        ) => [],
        onSnapshot: (
          snapshotId: string,
          snapshot: Snapshot<T, Meta, K>,
          type: string,
          event: Event,
          callback: (
            snapshot: Snapshot<T, Meta, K>
          ) => void
        ) => null,
        onSnapshots: (
          snapshotId: string,
          snapshots: Snapshots<T, Meta>,
          type: string,
          event: Event,
          callback: (snapshots: Snapshots<T, Meta>
          ) => void) => { },
        events: {
          callbacks: [],
          eventRecords: {}
        },
        handleSnapshot: (snapshotId: string,
          snapshot: Snapshot<T, Meta, K> | null,
          snapshots: Snapshots<T, Meta>,
          type: string,
          event: Event
        ) => null,
        mapSnapshots: (
          snapshotId: string,
          snapshot: Snapshot<T, Meta, K>,
          snapshots: Snapshots<T, Meta>,
          type: string,
          event: Event
        ) => null,
        meta: undefined,
        snapshotStoreConfig: config,

      } as Snapshot<T, Meta, K>

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
      getConfigOption: (): SnapshotStoreConfig<T, Meta, K> | null => getCurrentSnapshotConfigOptions(
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
      getData: () => new Map<string, Snapshot<T, Meta, K>>().set(key, {} as Snapshot<T, Meta, K>),
      setData: (data: Map<string, Snapshot<T, Meta, K>>) => { },
      addData: () => { },
      eventRecords: null,
      getParentId: function (snapshot: Snapshot<T, Meta, K>): string | null {
        throw new Error("Function not implemented.");
      },
      getChildIds: function (id: string, childSnapshot: Snapshot<T, Meta, K>): (string | number | undefined)[] {
        throw new Error("Function not implemented.");
      },
      addChild: function (snapshot: Snapshot<T, Meta, K>): void {
        throw new Error("Function not implemented.");
      },
      removeChild: function (snapshot: Snapshot<T, Meta, K>): void {
        throw new Error("Function not implemented.");
      },
      getChildren: function (): void {
        throw new Error("Function not implemented.");
      },
      hasChildren: function (): boolean {
        throw new Error("Function not implemented.");
      },
      isDescendantOf: function (snapshot: Snapshot<T, Meta, K>, childSnapshot: Snapshot<T, Meta, K>): boolean {
        throw new Error("Function not implemented.");
      },
      newData: null,
      stores: null,
      getStore: function (
        storeId: number,
        snapshotStore: SnapshotStore<T, Meta, K>,
        snapshotId: string | null,
        snapshot: Snapshot<T, Meta, K>,
        snapshotStoreConfig: SnapshotStoreConfig<T, Meta, K>,
        type: string,
        event: Event
        ): SnapshotStore<T, Meta, K> | null {
        throw new Error("Function not implemented.");
      },
      addStore: function (storeId: number, snapshotId: string, snapshotStore: SnapshotStore<T, Meta, K>, snapshotId: string, snapshot: Snapshot<T, Meta, K>, type: string, event: Event): void | null {
        throw new Error("Function not implemented.");
      },
      mapSnapshot: function (storeId: number, snapshotId: string, snapshot: Snapshot<T, Meta, K>, type: string, event: Event): void | null {
        throw new Error("Function not implemented.");
      },
      mapSnapshots: function (storeIds: number[], snapshotId: string, snapshot: Snapshot<T, Meta, K>, type: string, event: Event): void | null {
        throw new Error("Function not implemented.");
      },
      removeStore: function (storeId: number, store: SnapshotStore<T, Meta, K>, snapshotId: string, snapshot: Snapshot<T, Meta, K>, type: string, event: Event): void | null {
        throw new Error("Function not implemented.");
      },
      unsubscribe: function (callback: Callback<Snapshot<T, Meta, K>>): void {
        throw new Error("Function not implemented.");
      },
      fetchSnapshot: function (callback: (
        snapshotId: string,
        snapshot: Snapshot<T, Meta, K> | undefined
      ) => void): void {
        throw new Error("Function not implemented.");
      },
      addSnapshotFailure: function (snapshotManager: SnapshotManager<T, Meta, K>, snapshot: Snapshot<T, Meta, K>, payload: { error: Error; }): void {
        throw new Error("Function not implemented.");
      },
      configureSnapshotStore: function (snapshotStore: SnapshotStore<T, Meta, K>, snapshotId: string, data: Map<string, Snapshot<T, Meta, K>>, events: Record<string, CalendarEvent[]>, dataItems: RealtimeDataItem[], newData: Snapshot<T, Meta, K>, payload: ConfigureSnapshotStorePayload<T>, store: SnapshotStore<any, T>, callback: (snapshotStore: SnapshotStore<T, Meta, K>) => void): void | null {
        throw new Error("Function not implemented.");
      },
      updateSnapshotSuccess: function (snapshotId: string, snapshotManager: SnapshotManager<T, Meta, K>, snapshot: Snapshot<T, Meta, K>, payload: { error: Error; }): void | null {
        throw new Error("Function not implemented.");
      },
      createSnapshotFailure: function (snapshotId: string, snapshotManager: SnapshotManager<T, Meta, K>, snapshot: Snapshot<T, Meta, K>, payload: { error: Error; }): Promise<void> {
        throw new Error("Function not implemented.");
      },
      createSnapshotSuccess: function (snapshotId: string, snapshotManager: SnapshotManager<T, Meta, K>, snapshot: Snapshot<T, Meta, K>, payload: { error: Error; }): void | null {
        throw new Error("Function not implemented.");
      },
      createSnapshots: function (id: string, snapshotId: string, snapshot: Snapshot<T, Meta, K>, snapshotManager: SnapshotManager<T, Meta, K>, payload: CreateSnapshotsPayload<T, Meta, K>, callback: (snapshots: Snapshot<T, Meta, K>[]) => void | null, snapshotDataConfig?: SnapshotConfig<T, Meta, K>[] | undefined, category?: string | symbol | Category): Snapshot<T, Meta, K>[] | null {
        throw new Error("Function not implemented.");
      },
      onSnapshot: function (snapshotId: string, snapshot: Snapshot<T, Meta, K>, type: string, event: Event, callback: (snapshot: Snapshot<T, Meta, K>) => void): void {
        throw new Error("Function not implemented.");
      },
      onSnapshots: function (snapshotId: string, snapshots: Snapshots<T, Meta>, type: string, event: Event, callback: (snapshots: Snapshots<T, Meta>) => void): void {
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





// Convert Map<string, T> to Snapshot<BaseData, Meta, BaseData>

// Convert Map<string, T> to Snapshot<BaseData, Meta, BaseData>
function convertMapToSnapshot<T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T>(
  map: Map<string, Snapshot<T, Meta, K>>,
  timestamp: string | number | Date | undefined
): SnapshotDataType<T, Meta, K> | null  {
  const snapshotMap = new Map<string, Snapshot<T, Meta, K>>();

  map.forEach((value, key) => {
    const snapshot: Snapshot<T, Meta, K> = {
      id: key,
      title: "Snapshot Title",
      timestamp: new Date(),
      subscriberId: "some-subscriber-id",
      category: "some-category",
      length: 1,
      content: value.data ? value.data.toString() : '',
      data: value.data as T,
      value: 0,
      // Populate with other properties of Snapshot<T, Meta, K> as needed
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
    data: snapshotMap, // Ensure the type matches Snapshot<T, Meta, K>
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
    snapshotStoreConfig: {} as SnapshotStoreConfig<T, Meta, K>,

    getSnapshotItems: [],
    defaultSubscribeToSnapshots: () => Promise.resolve(),
    transformSubscriber: (sub: Subscriber<T, Meta, K>): Subscriber<T, Meta, K> => {
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
        notifyEventSystem: sub.getNotifyEventSystem(),
        updateProjectState: sub.getUpdateProjectState(),
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
    transformDelegate: (): SnapshotStoreConfig<T, Meta, K>[] => {
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
    getSnapshot: () => ({}) as Snapshot<T, Meta, K>,
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
    snapshotStoreConfig: {} as SnapshotStoreConfig<T, Meta, K>,
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
      callback: (value: SnapshotStoreConfig<T, Meta, K>, index: number, array: SnapshotStoreConfig<T, Meta, K>[]) => U
    ) {
      // Assume we have an array of SnapshotStoreConfig<T, Meta, K>
      const snapshotStoreConfigArray: SnapshotStoreConfig<T, Meta, K>[] = []; // Populate this as necessary
      return flatMapImplementation(snapshotStoreConfigArray, callback);
    },
    setData: (data: Map<string, Snapshot<T, Meta, K>>) => { },
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
      snapshots: SnapshotsArray<T, Meta>,
      type: string,
      event: Event,
      snapshotContainer?: T,
      snapshotStoreConfig?: SnapshotStoreConfig<T, any> | null,
    ): Promise<Snapshot<T, Meta, K> | null> => { 
      return new Promise<Snapshot<T, Meta, K> | null>(async (resolve, reject) => {
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
            store: {} as SnapshotStore<T, Meta, K>, // Replace with actual SnapshotStore instance if needed
            getSnapshotId: async () => id,
            compareSnapshotState: () => false, // Implement comparison logic
            snapshot: async () => ({
              snapshot: {
                id,
                data: new Map<string, T>(), // Replace with actual snapshot data if needed
                category,
              }
            }),
            getSnapshotData: () => new Map<string, Snapshot<T, Meta, K>>(), // Replace with actual snapshot data if needed
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
      snapshotStore: SnapshotStore<T, Meta, K>,
      data: Map<string, Snapshot<T, Meta, K>>,
      subscribers: Subscriber<T, Meta, K>[],
      snapshotData: Partial<
        SnapshotStoreConfig<T, Meta, K>
      >
    ) => { },
    setSnapshots: () => { },
    clearSnapshot: () => { },

    mergeSnapshots: () => [],
    reduceSnapshots: () => [],
    sortSnapshots: () => [],
    filterSnapshots: () => [],

    mapSnapshots: () => { },
    findSnapshot: () => ({} as Snapshot<T, Meta, K>),
    getSubscribers: () => [],
    notify: () => { },

    notifySubscribers: (
      subscribers: Subscriber<T, Meta, K>[],
      data: Partial<SnapshotStoreConfig<BaseData, any>>
    ): Subscriber<BaseData, Meta, K>[] => {
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
      snapshotStore: SnapshotStore<T, Meta, K>,
      snapshots: Snapshots<T, Meta>
    ): Promise<{ snapshots: Snapshots<T, Meta>; }> => {
      // Implement the logic to batch take snapshots
      return Promise.resolve({ snapshots });
    },

    handleSnapshotSuccess: () => { },
    handleSnapshotFailure: () => { },
    eventRecords: {},

    getBackendVersion: async () => "",
    snapshotStore: {} as SnapshotStore<T, Meta, K>,
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

    getConfigOption: () => ({} as SnapshotStoreConfig<T, Meta, K>),
    getTimestamp: () => new Date(),
    stores: [],
    getStore: () => ({} as SnapshotStore<T, Meta, K>),

    addStore: (): SnapshotStore<T, Meta, K> | null => { },
    mapSnapshot: () => ({} as Snapshot<T, Meta, K>),
    removeStore: () => { },
    createSnapshots: () => [],

    onSnapshot: () => { },
    onSnapshots: () => { },
    events: {
      callbacks: {} as Callback<Snapshots<T, Meta>>,
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
    getStoreSnapshot: () => ({} as Snapshot<T, Meta, K>),
    fetchStoreSnapshots: () => [],

    transformSnapshot: () => ({} as Snapshot<T, Meta, K>),
    flattenSnapshot: () => { },
    batchSnapshots: [],
    batchStores: [],

    getAllSnapshotStores: () => [],
    getAllSnapshotItems: () => [],
    getSnapshotConfig: () => ({} as SnapshotStoreConfig<T, Meta, K>),
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

function convertSnapshotToMap<T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T>(
  snapshot: Snapshot<T, Meta, K>
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


const convertSnapshotContainerToStore = <T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T>(
  snapshotContainer: SnapshotContainer<T, Meta, K>
): SnapshotStore<Data, Meta, BaseData> => {
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
    maxAge, expirationDate, criteria, initializeWithData, hasSnapshots, getDataStoreMap, emit, removeChild,
    structuredMetadata, snapshotStoreConfig, getChildren, hasChildren,


    // Map other propertiwes as needed
  } as SnapshotStore<Data, Meta, BaseData>;
};


const convertToSnapshot = <T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T>(
  id: string | number | undefined,
  snapshotId: string | null,
  snapshotData: SnapshotData<T, Meta, K>,
  category: symbol | string | Category | undefined,
  categoryProperties: CategoryProperties | undefined,
  metadata: UnifiedMetaDataOptions,
  subscriberId: string,
  endpointCategory: string | number,
  storeProps: SnapshotStoreProps<T, Meta, K>,
  snapshotConfigData: SnapshotConfig<T, Meta, K>,
  subscription: Subscription<T, Meta, K>,
  snapshotContainer?: SnapshotStore<T, Meta, K> | Snapshot<T, Meta, K> | null,
): Snapshot<T, Meta, K> => {
  // Create a Snapshot object from the parameters
  const snapshot: Snapshot<T, Meta, K> = {
    id, // Assign the id
    snapshotId, // Assign the snapshotId
    snapshotData, // Assign the snapshotData
    category, // Assign the category
    categoryProperties, // Assign the categoryProperties
    metadata, // Assign metadata
    subscriberId, // Assign the subscriberId
    endpointCategory, // Assign endpointCategory
    storeProps, // Assign storeProps
    snapshotConfigData, // Assign snapshotConfigData
    subscription, // Assign subscription
    snapshotContainer, // Assign snapshotContainer if provided
    // Include additional properties if needed
  };

  return snapshot;
};




function convertSnapshotMap <T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T>(
  dataMap: Map<string, Snapshot<Data, Meta, Data>>
): Map<string, Snapshot<T, Meta, K>> {
  const convertedMap = new Map<string, Snapshot<T, Meta, K>>();

  dataMap.forEach((snapshot, key) => {
    const convertedSnapshot = convertBaseDataToK(snapshot) as unknown as Snapshot<T, Meta, K>;
    convertedMap.set(key, convertedSnapshot);
  });

  return convertedMap;
}

function isCoreSnapshot<T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T>(
  snapshot: any
): snapshot is CoreSnapshot<T, Meta, K> {
  return snapshot && Array.isArray(snapshot.children) && typeof snapshot.id === 'string';
}


export {
    convertMapToSnapshot, convertMapToSnapshotStore, convertSnapshoStoretData, convertSnapshotContainerToStore, convertSnapshotContent,
    convertSnapshotData, convertSnapshotMap, convertSnapshotStoreConfig,
    convertSnapshotStoreItemToT,
    convertSnapshotStoreToMap,
    convertSnapshotStoreToSnapshot, convertSnapshotToMap, convertSnapshotToStore, convertToDataSnapshot, convertToDataStore,
    convertToSnapshotStoreConfig,
    createSnapshotStoreConfig,
    createSnapshotStoreOptions, isCoreSnapshot, isSnapshotStore, snapshotType, convertToSnapshot
};

