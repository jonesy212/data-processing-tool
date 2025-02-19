import apiNotificationsService from "@/app/api/NotificationsService";
import * as snapshotApi from "@/app/api/SnapshotApi";
import { addSnapshot } from "@/app/api/SnapshotApi";
import { Payload, UpdateSnapshotPayload } from "@/app/components/database/Payload";
import { TriggerIncentivesParams } from "@/app/components/utils/applicationUtils";
import CalendarManagerStoreClass from "@/app/components/state/stores/CalendarManagerStore";
import { BaseDatabaseService } from "@/app/configs/DatabaseConfig";
import { StructuredMetadata } from "@/app/configs/StructuredMetadata";
import { CategoryProperties } from "@/app/pages/personas/ScenarioBuilder";
import { config } from "process";
import { SubscriptionActions } from "../actions/SubscriptionActions";
import { ModifiedDate } from "../documents/DocType";
import {
    CombinedEvents,
    SnapshotStoreOptions,
    convertSnapshotToContent,
} from "../hooks/useSnapshotManager";
import { Category } from "../libraries/categories/generateCategoryProperties";
import { Content } from "../models/content/AddContent";
import { BaseData, Data } from "../models/data/Data";
import {
    NotificationStatus,
    SubscriberTypeEnum,
    SubscriptionTypeEnum,
} from "../models/data/StatusType";
import { RealtimeDataItem } from "../models/realtime/RealtimeData";
import {
    CustomSnapshotData,
    SnapshotConfig,
    SnapshotData,
    SnapshotItem,
    SnapshotStoreConfig,
    SnapshotWithCriteria
} from "../snapshots";
import { FetchSnapshotPayload } from "../snapshots/FetchSnapshotPayload";
import {
    Snapshot,
    Snapshots,
    SnapshotsArray,
    createSnapshotOptions,
} from "../snapshots/LocalStorageSnapshotStore";
import SnapshotStore from "../snapshots/SnapshotStore";
import { SnapshotStorePublicMethods } from "../snapshots/SnapshotStorePublicMethods";
import SnapshotStoreSubset from "../snapshots/SnapshotStoreSubset";
import {
    addSnapshotSuccess,
    createInitSnapshot,
    createSnapshotFailure,
    createSnapshotSuccess,
    updateSnapshot,
    updateSnapshotFailure,
    updateSnapshotSuccess,
    updateSnapshots,
    updateSnapshotsSuccess,
} from "../snapshots/snapshotHandlers";
import {
    clearSnapshots,
    removeSnapshot,
} from "../state/redux/slices/SnapshotSlice";
import {
    FetchSnapshotByIdCallback,
    Subscription,
} from "../subscriptions/Subscription";
import { SubscriptionLevel } from "../subscriptions/SubscriptionLevel";
import {
    NotificationType,
    NotificationTypeEnum,
} from "../support/NotificationContext";
import {
    YourSpecificSnapshotType,
    convertMapToSnapshot,
    convertSnapshotToStore,
} from "../typings/YourSpecificSnapshotType";
import { isSnapshotStoreConfig } from "../utils/snapshotUtils";
import { sendNotification } from "./UserSlice";

type SnapshotStoreDelegate<T extends BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>> = (
  snapshot: Snapshot<T, K>,
  initialState: Snapshot<T, K>,
  snapshotConfig: SnapshotStoreConfig<
    SnapshotWithCriteria<any, BaseData>,
    SnapshotWithCriteria<any, BaseData<any, any, StructuredMetadata<any, any>, Attachment>
  >
  >[]
) => void;

type Subscribers = Subscriber<CustomSnapshotData<T, K>, Data>[];

type SubscribeResult<T, K> = {
  subscriber: Subscriber<T, K> | null;
  snapshots: SnapshotsArray<T, K>;
};


interface AuditRecord {
  timestamp: Date;
  userId: string;
  action: string;
  details: string;
}

type SnapshotCallback<T> = (data: T) => void;

const delegateFunction: SnapshotStoreDelegate<CustomSnapshotData<T, K>, Data> = (
  snapshot: Snapshot<CustomSnapshotData<T, K>>,
  initialState: Snapshot<CustomSnapshotData<T, K>>,
  snapshotConfig: SnapshotStoreConfig<
    SnapshotWithCriteria<any, BaseData>,
    SnapshotWithCriteria<any, BaseData<any, any, StructuredMetadata<any, any>, Attachment>>
  >[]
) => {
  console.log("Delegate function called with snapshot:", snapshot);
  console.log("Initial state:", initialState);
  console.log("Snapshot config:", snapshotConfig);
};

function convertSnapshotToSpecificType <T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(
  snapshot: Snapshot<T, K>
): Snapshot<T, K> {
  const newData = new Map<string, Snapshot<T, K>>();

  if (snapshot.data instanceof Map) {
    snapshot.data.forEach((value: Snapshot<T, K>, key: string) => {
      if (typeof value === "object" && value !== null) {
        newData.set(key, value);
      }
    });
  }

  const newStore = snapshot.store
    ? convertSnapshotStore<T, K>(snapshot.store as SnapshotStore<T, K>)
    : null;

  const snapshotItems = snapshot.snapshotItems ?? [];
  const mappedSnapshotItems = snapshotItems.map((item: SnapshotItem<T, K>) => {
    return convertSnapshotItem(item);
  });

  return {
    ...snapshot,
    data: newData,
    store: newStore,
    snapshotItems: mappedSnapshotItems, // Ensure this matches the expected type
  };
}

function convertSnapshotItem <T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(
  item: SnapshotItem<T, K>
): SnapshotItem<T, K> {
  // Ensure that `message` is a string and not undefined
  if (typeof item.message === "undefined") {
    throw new Error("Message is required and cannot be undefined");
  }
  // Convert SnapshotItem to Snapshot with necessary logic
  // This is a placeholder logic; adapt as needed based on your actual SnapshotItem structure
  return {
    ...item, // Make sure SnapshotItem can be spread into Snapshot
    message: item.message ? item.message : "",
    parentId: item.parentId,
    childIds: item.childIds,
    taskIdToAssign: item.taskIdToAssign,
    initialConfig: item.initialConfig,
    removeSubscriber: item.removeSubscriber,

    onInitialize: item.onInitialize,
    onError: item.onError,
    snapshot: item.snapshot,
    snapshotData: item.snapshotData,

    snapshotStoreConfig: item.snapshotStoreConfig,
    getSnapshotItems: item.getSnapshotItems,
    defaultSubscribeToSnapshots: item.defaultSubscribeToSnapshots,
    versionInfo: item.versionInfo,

    transformSubscriber: item.transformSubscriber,
    transformDelegate: item.transformDelegate,
    initializedState: item.initializedState,
    getAllKeys: item.getAllKeys,
    getAllItems: item.getAllItems,
    addDataStatus: item.addDataStatus,
    removeData: item.removeData,
    updateData: item.updateData,

    updateDataTitle: item.updateDataTitle,
    updateDataDescription: item.updateDataDescription,
    updateDataStatus: item.updateDataStatus,
    addDataSuccess: item.addDataSuccess,

    getDataVersions: item.getDataVersions,
    updateDataVersions: item.updateDataVersions,
    getBackendVersion: item.getBackendVersion,
    getFrontendVersion: item.getFrontendVersion,

    fetchData: item.fetchData,
    defaultSubscribeToSnapshot: item.defaultSubscribeToSnapshot,
    handleSubscribeToSnapshot: item.handleSubscribeToSnapshot,
    removeItem: item.removeItem,

    getSnapshot: item.getSnapshot,
    getSnapshotSuccess: item.getSnapshotSuccess,
    setItem: item.setItem,
    getItem: item.getItem,
    getDataStore: item.getDataStore,
    getDataStoreMap: item.getDataStoreMap,
    addSnapshotSuccess: item.addSnapshotSuccess,
    deepCompare: item.deepCompare,

    shallowCompare: item.shallowCompare,
    getDataStoreMethods: item.getDataStoreMethods,
    getDelegate: item.getDelegate,
    determineCategory: item.determineCategory,

    determinePrefix: item.determinePrefix,
    removeSnapshot: item.removeSnapshot,
    addSnapshotItem: item.addSnapshotItem,
    addNestedStore: item.addNestedStore,

    clearSnapshots: item.clearSnapshots,
    addSnapshot: item.addSnapshot,
    emit: item.emit,
    createSnapshot: item.createSnapshot,

    createInitSnapshot: item.createInitSnapshot,
    setSnapshotSuccess: item.setSnapshotSuccess,
    setSnapshotFailure: item.setSnapshotFailure,
    updateSnapshots: item.updateSnapshots,

    updateSnapshotsSuccess: item.updateSnapshotsSuccess,
    updateSnapshotsFailure: item.updateSnapshotsFailure,
    initSnapshot: item.initSnapshot,
    takeSnapshot: item.takeSnapshot,

    takeSnapshotSuccess: item.takeSnapshotSuccess,
    takeSnapshotsSuccess: item.takeSnapshotsSuccess,
    flatMap: item.flatMap,
    getState: item.getState,

    setState: item.setState,
    validateSnapshot: item.validateSnapshot,
    handleActions: item.handleActions,
    setSnapshot: item.setSnapshot,

    transformSnapshotConfig: item.transformSnapshotConfig,
    setSnapshots: item.setSnapshots,
    clearSnapshot: item.clearSnapshot,
    mergeSnapshots: item.mergeSnapshots,

    reduceSnapshots: item.reduceSnapshots,
    sortSnapshots: item.sortSnapshots,
    filterSnapshots: item.filterSnapshots,
    findSnapshot: item.findSnapshot,

    getSubscribers: item.getSubscribers,
    notify: item.notify,
    notifySubscribers: item.notifySubscribers,
    getSnapshots: item.getSnapshots,

    getAllSnapshots: item.getAllSnapshots,
    generateId: item.generateId,
    batchFetchSnapshots: item.batchFetchSnapshots,
    batchTakeSnapshotsRequest: item.batchTakeSnapshotsRequest,

    batchUpdateSnapshotsRequest: item.batchUpdateSnapshotsRequest,
    filterSnapshotsByStatus: item.filterSnapshotsByStatus,
    filterSnapshotsByCategory: item.filterSnapshotsByCategory,
    filterSnapshotsByTag: item.filterSnapshotsByTag,
    batchFetchSnapshotsSuccess: item.batchFetchSnapshotsSuccess,
    batchFetchSnapshotsFailure: item.batchFetchSnapshotsFailure,
    batchUpdateSnapshotsSuccess: item.batchUpdateSnapshotsSuccess,
    batchUpdateSnapshotsFailure: item.batchUpdateSnapshotsFailure,

    batchTakeSnapshot: item.batchTakeSnapshot,
    handleSnapshotSuccess: item.handleSnapshotSuccess,
    getSnapshotId: item.getSnapshotId,
    compareSnapshotState: item.compareSnapshotState,

    eventRecords: item.eventRecords,
    snapshotStore: item.snapshotStore,
    getParentId: item.getParentId,
    getChildIds: item.getChildIds,

    addChild: item.addChild,
    removeChild: item.removeChild,
    getChildren: item.getChildren,
    hasChildren: item.hasChildren,

    isDescendantOf: item.isDescendantOf,
    dataItems: item.dataItems,
    payload: item.payload,
    newData: item.newData,

    getInitialState: item.getInitialState,
    getConfigOption: item.getConfigOption,
    getTimestamp: item.getTimestamp,
    getStores: item.getStores,

    getData: item.getData,
    setData: item.setData,
    addData: item.addData,
    stores: item.stores,

    getStore: item.getStore,
    addStore: item.addStore,
    mapSnapshot: item.mapSnapshot,
    mapSnapshots: item.mapSnapshots,

    removeStore: item.removeStore,
    subscribe: item.subscribe,
    unsubscribe: item.unsubscribe,
    fetchSnapshotFailure: item.fetchSnapshotFailure,

    fetchSnapshot: item.fetchSnapshot,
    addSnapshotFailure: item.addSnapshotFailure,
    configureSnapshotStore: item.configureSnapshotStore,
    fetchSnapshotSuccess: item.fetchSnapshotSuccess,

    updateSnapshotFailure: item.updateSnapshotFailure,
    updateSnapshotSuccess: item.updateSnapshotSuccess,
    createSnapshotFailure: item.createSnapshotFailure,
    createSnapshotSuccess: item.createSnapshotSuccess,

    createSnapshots: item.createSnapshots,
    onSnapshot: item.onSnapshot,
    onSnapshots: item.onSnapshots,
    updateSnapshot: item.updateSnapshot,

    events: item.events,
    handleSnapshot: item.handleSnapshot,
    subscribeToSnapshots: item.subscribeToSnapshots,
    meta: item.meta,
    subscribers: item.subscribers,
    // Add additional properties or conversions if needed
  } as Snapshot<T, K>;
}




function convertSnapshotStore<T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(
  store: SnapshotStore<T, K>
): SnapshotStorePublicMethods<T, K> {
  // Get the snapshot items array using the public method
  const snapshotItems = store.getSnapshotItems();

  // Convert items in the snapshot items array
  const newSnapshotItems = snapshotItems.map((item) => {
    if (isSnapshotStoreConfig(item)) {
      // Use a type assertion here if you're sure about the types
      return convertSnapshotStoreConfig(
          item as unknown as SnapshotStoreConfig<SnapshotWithCriteria<any, BaseData<any, any, StructuredMetadata<any, any>, Attachment>>, StructuredMetadata<BaseData<any, any, StructuredMetadata<T, K>, Attachment>, K>, K>,
      );
      } else {
        return item as unknown as Snapshot<T, K>;
      }
    });

  // Construct and return the public methods object
  return {
    // Public methods
    findIndex: store.findIndex.bind(store),
    splice: store.splice.bind(store),

    saveSnapshotStore: store.getSaveSnapshotStore.bind(store),
    addSnapshotToStore: store.addSnapshotToStore.bind(store),
    determineSnapshotStoreCategory:
      store.determineSnapshotStoreCategory.bind(store),
    getSnapshotStoreData: store.getSnapshotStoreData.bind(store),

    // Public methods that are part of SnapshotStorePublicMethods
    getSnapshotItems: () => newSnapshotItems,
    initialState: store.initialState,
    nestedStores: store.getNestedStores,
    dataStoreMethods: store.getDataStoreMethods,
    delegate: store.getDelegate,
    events: store.events,
    getData: store.getData.bind(store),
    getDataStore: store.getDataStore.bind(store),
    addSnapshotItem: store.addSnapshotItem.bind(store),
    addNestedStore: store.addNestedStore.bind(store),
    defaultSubscribeToSnapshots: store.defaultSubscribeToSnapshots.bind(store),
    defaultCreateSnapshotStores: store.defaultCreateSnapshotStores.bind(store),
    createSnapshotStores: store.createSnapshotStores.bind(store),
    subscribeToSnapshots: store.subscribeToSnapshots.bind(store),
    transformSubscriber: store.transformedSubscriber.bind(store),
    transformDelegate: store.transformedDelegate,
    initializedState: store.initializedState,
    transformedDelegate: store.transformedDelegate,
    getAllKeys: store.getAllKeys.bind(store),
    mapSnapshot: store.mapSnapshot.bind(store),
    getAllItems: store.getAllItems.bind(store),
    addData: store.addData.bind(store),
    addDataStatus: store.addDataStatus.bind(store),
    removeData: store.removeData.bind(store),
    updateData: store.updateData.bind(store),
    updateDataTitle: store.updateDataTitle.bind(store),
    updateDataDescription: store.updateDataDescription.bind(store),
    updateDataStatus: store.updateDataStatus.bind(store),
    addDataSuccess: store.addDataSuccess.bind(store),
    getDataVersions: store.getDataVersions.bind(store),
    updateDataVersions: store.updateDataVersions.bind(store),
    getBackendVersion: store.getBackendVersion.bind(store),
    getFrontendVersion: store.getFrontendVersion.bind(store),
    fetchData: store.fetchData.bind(store),
    defaultSubscribeToSnapshot: store.defaultSubscribeToSnapshot.bind(store),
    handleSubscribeToSnapshot: store.handleSubscribeToSnapshot.bind(store),
    removeItem: store.removeItem.bind(store),
    getSnapshot: store.getSnapshot.bind(store),
    getSnapshotSuccess: store.getSnapshotSuccess.bind(store),
    getSnapshotId: store.getSnapshotId.bind(store),
    getItem: store.getItem.bind(store),
    setItem: store.setItem.bind(store),
    addSnapshotFailure: store.addSnapshotFailure.bind(store),
    addSnapshotSuccess: store.addSnapshotSuccess.bind(store),
    compareSnapshotState: store.compareSnapshotState.bind(store),
    deepCompare: store.deepCompare.bind(store),
    shallowCompare: store.shallowCompare.bind(store),
    getDataStoreMethods: store.getDataStoreMethods.bind(store),
    getDelegate: store.getDelegate.bind(store),
    determineCategory: store.determineCategory.bind(store),
    determinePrefix: store.determinePrefix.bind(store),
    updateSnapshot: store.updateSnapshot.bind(store),
    updateSnapshotSuccess: store.updateSnapshotSuccess.bind(store),
    updateSnapshotFailure: store.updateSnapshotFailure.bind(store),
    removeSnapshot: store.removeSnapshot.bind(store),
    clearSnapshots: store.clearSnapshots.bind(store),
    addSnapshot: store.addSnapshot.bind(store),
    createInitSnapshot: store.createInitSnapshot.bind(store),
    createSnapshotSuccess: store.createSnapshotSuccess.bind(store),
    setSnapshotSuccess: store.setSnapshotSuccess.bind(store),
    setSnapshotFailure: store.setSnapshotFailure.bind(store),
    createSnapshotFailure: store.createSnapshotFailure.bind(store),
    updateSnapshots: store.updateSnapshots.bind(store),
    updateSnapshotsSuccess: store.updateSnapshotsSuccess.bind(store),
    updateSnapshotsFailure: store.updateSnapshotsFailure.bind(store),
    initSnapshot: store.initSnapshot.bind(store),
    takeSnapshot: store.takeSnapshot.bind(store),
    takeSnapshotSuccess: store.takeSnapshotSuccess.bind(store),
    takeSnapshotsSuccess: store.takeSnapshotsSuccess.bind(store),
    configureSnapshotStore: store.configureSnapshotStore.bind(store),
    flatMap: store.flatMap.bind(store),
    setData: store.setData.bind(store),
    getState: store.getState.bind(store),
    setState: store.setState.bind(store),
    validateSnapshot: store.validateSnapshot.bind(store),
    handleSnapshot: store.handleSnapshot.bind(store),
    handleActions: store.handleActions.bind(store),
    setSnapshot: store.setSnapshot.bind(store),
    transformSnapshotConfig: store.transformSnapshotConfig.bind(store),
    setSnapshotData: store.setSnapshotData.bind(store),
    setSnapshots: store.setSnapshots.bind(store),
    clearSnapshot: store.clearSnapshot.bind(store),
    mergeSnapshots: store.mergeSnapshots.bind(store),
    reduceSnapshots: store.reduceSnapshots.bind(store),
    sortSnapshots: store.sortSnapshots.bind(store),
    filterSnapshots: store.filterSnapshots.bind(store),
    mapSnapshots: store.mapSnapshots.bind(store),
    findSnapshot: store.findSnapshot.bind(store),
    getSubscribers: store.getSubscribers.bind(store),
    notify: store.notify.bind(store),
    notifySubscribers: store.notifySubscribers.bind(store),
    subscribe: store.subscribe.bind(store),
    unsubscribe: store.unsubscribe.bind(store),
    fetchSnapshot: store.fetchSnapshot.bind(store),
    fetchSnapshotSuccess: store.fetchSnapshotSuccess.bind(store),
    fetchSnapshotFailure: store.fetchSnapshotFailure.bind(store),
    getSnapshots: store.getSnapshots.bind(store),
    getAllSnapshots: store.getAllSnapshots.bind(store),
    generateId: store.generateId.bind(store),
    batchFetchSnapshots: store.batchFetchSnapshots.bind(store),
    batchTakeSnapshotsRequest: store.batchTakeSnapshotsRequest.bind(store),
    batchUpdateSnapshotsRequest: store.batchUpdateSnapshotsRequest.bind(store),
    batchFetchSnapshotsSuccess: store.batchFetchSnapshotsSuccess.bind(store),
    batchFetchSnapshotsFailure: store.batchFetchSnapshotsFailure.bind(store),
    batchUpdateSnapshotsSuccess: store.batchUpdateSnapshotsSuccess.bind(store),
    batchUpdateSnapshotsFailure: store.batchUpdateSnapshotsFailure.bind(store),
    batchTakeSnapshot: store.batchTakeSnapshot.bind(store),
    handleSnapshotSuccess: store.handleSnapshotSuccess.bind(store),
    [Symbol.iterator]: store[Symbol.iterator].bind(store),
    snapshotIds: store.getSnapshotIds.bind(store),
    isSnapshotStoreConfig: store.isSnapshotStoreConfig.bind(store),
    getSnapshotIds: store.getSnapshotIds.bind(store),
    subscribeToSnapshot: store.subscribeToSnapshot.bind(store),
    defaultOnSnapshots: store.defaultOnSnapshots.bind(store),
    onSnapshots: store.onSnapshots.bind(store),
    getParentId: store.getParentId.bind(store),
    getChildIds: store.getChildIds.bind(store),
    snapshotItems: newSnapshotItems,
  } as SnapshotStorePublicMethods<T, K>;
}

const createSnapshotConfig =  <T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(
  snapshotStore: SnapshotStore<T, K>,
  snapshotContent?: Snapshot<T, K>
): SnapshotStoreConfig<SnapshotWithCriteria<any, BaseData>, K, Meta> => {

  const content = snapshotContent
    ? convertSnapshotToContent(snapshotContent)
    : undefined;

  return {
    snapshotStore,
    snapshotId: "initial-id",
    snapshotCategory: "initial-category",
    snapshotSubscriberId: "initial-subscriber",
    timestamp: new Date(),
    snapshotContent: content,
    id: null,
    data: {} as T,
    initialState: null,
    handleSnapshot: (
      id: string | number,
      snapshotId: string | null,
      snapshot: Snapshot<T, K> | null,
      snapshots: Snapshots<T, K>,
      category: string | symbol | Category | undefined,
      type: string,
      event: Event,
      snapshotContainer?: T,
      snapshotStoreConfig?: SnapshotStoreConfig<T, K, StructuredMetadata<T, K>, never>  | null, 
    ): Promise<Snapshot<T, K> | null> => {
      if (snapshot) {
        console.log(`Handling snapshot with ID: ${snapshotId}`);
      } else {
        console.log(`No snapshot to handle for ID: ${snapshotId}`);
      }
      return Promise.resolve(null);
    },
    state: null,
    snapshots: [],
    subscribers: [],
    category: "default-category",
    getSnapshotId: async () => "default-id",
    snapshot: async  <T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(
      id: string,
      snapshotId: string | null,
      snapshotData: SnapshotData<T, K>,
      category: symbol | string | Category | undefined,
      callback: (snapshot: Snapshot<T, K>) => void,
      snapshotContainer?: SnapshotStore<T, K> | Snapshot<T, K> | null,
      snapshotStoreConfigData?: SnapshotStoreConfig<
        SnapshotWithCriteria<any, BaseData>,
        K
      >
    ): Promise<{ snapshot: Snapshot<T, K> | null }> => {
      const snapshot: Snapshot<T, K> | null =
        snapshotStoreConfigData?.createSnapshot?.(
          id,
          snapshotData,
          category,
          callback
        ) ?? null;

      if (snapshot) {
        callback(snapshot);
        const snapshotStore = convertSnapshotToStore(snapshot);
        const options: SnapshotStoreOptions<T, K> = createSnapshotOptions<T, K>(
          snapshotStore
        );
        const config = Array.isArray(options.snapshotStoreConfig)
          ? options.snapshotStoreConfig[0]
          : options.snapshotStoreConfig;
        const newSnapshotStore = new SnapshotStore<T, K>(options, config);
        return {
          snapshot: snapshot,
          snapshotStore: newSnapshotStore,
        };
      } else {
        console.error("Failed to create snapshot");
        return {
          snapshot: null,
        };
      }
    },


    createSnapshot: (
      id: string,
      snapshotData: SnapshotData<SnapshotWithCriteria<any, BaseData>, K>,
      category?: string | Category,
      categoryProperties?: string | CategoryProperties,
      callback?: (snapshot: Snapshot<SnapshotWithCriteria<any, BaseData>, K>) => void,
      snapshotData?: SnapshotStore<T, K>,
      snapshotStoreConfig?: SnapshotStoreConfig<T, any> | null,
      snapshotStoreConfigSearch?: SnapshotStoreConfig<
        SnapshotWithCriteria<any, BaseData>,
        K
      >
    ): Snapshot<T, K> | null => {
      const newSnapshot: Snapshot<T, K> = {
        id: id,
        data: new Map<string, Snapshot<T, K>>(),
        timestamp: new Date(),
        category: typeof category === "string" ? category : "default-category",
        subscriberId: "default-subscriber-id",
        meta: new Map<string, Snapshot<T, K>>(),
        events: {} as CombinedEvents<T, K>,
        snapshotStoreConfig: snapshotStoreConfig || null,
        snapshotStoreConfigSearch: snapshotStoreConfigSearch || null,
        getSnapshotItems: () => [],
        defaultSubscribeToSnapshots: () => {},
        transformSubscriber: (sub: Subscriber<T, K>): Subscriber<T, K> => {
          
        },
        // Add other required properties and methods here
      };

      if (callback) {
        callback(newSnapshot);
      }

      return newSnapshot;
    },
  };
};

function convertSnapshotStoreConfig <T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(
  config: SnapshotStoreConfig<SnapshotWithCriteria<any, BaseData>, K, Meta>,
): SnapshotStoreConfig<SnapshotWithCriteria<any, BaseData>, K, Meta> {
  // Map or transform the fields as needed to match T and K types
  return {
    ...config,
    data: config.data,
    snapshotContent: config.snapshotContent,
    // Ensure all other fields are properly converted or mapped
  };
}

interface SubscriberCallback <T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>> {
  id: string;
  _id: string;
  handleCallback: (data: Snapshot<T, K>) => void;
  snapshotCallback: (data: Snapshot<T, K>) => void; // Ensure this is a function type
}


// Type guard to check if triggerIncentives is defined and has the correct signature
function hasTriggerIncentives(
  subscriber: Subscriber<any, any>
): subscriber is Subscriber<any, any> & { triggerIncentives: Subscription<any>['triggerIncentives'] } {
  return typeof subscriber.triggerIncentives === 'function';
}


class Subscriber<
  T extends BaseData<any>,
  K extends T = T, 
  Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K> 
  > {
  public data: Partial<SnapshotStore<T, K>> | null = {};
  // public callback: Callback<Snapshot<T, K>>,
  private _id: string | undefined;
  private readonly name: string;
  private subscription: Subscription<T, K>;
  private subscriptionLevel: SubscriptionLevel; // Updated to hold a subscription level
  private subscriberId: string;
  private subscribersById: Map<string, Subscriber<T, K>> | undefined =
  new Map();
  private subscribers: SubscriberCallback<T, K>[] = []; // Use the SubscriberCallback type here
  private onSnapshotCallbacks: SubscriberCallback<T, K>[] = []; // Updated to SubscriberCallback
  private internalState: Map<string, Snapshot<T, K>> = new Map();
  private internalCache: Map<string, T>;
  
  private onErrorCallbacks: ((error: Error) => void)[] = [];
  private onUnsubscribeCallbacks: ((data: Snapshot<T, K>) => void)[] = [];
  private state?: T | null = null;
  private callbackFunction?: (data: Snapshot<T, K>) => void;

  private notifyEventSystem: Function | undefined;
  private updateProjectState: Function | undefined;
  private logActivity: Function | undefined;
  private triggerIncentives: (({ userId, incentiveType, params }: TriggerIncentivesParams) => void) | undefined;
  private optionalData: CustomSnapshotData<T, K> | null;
  
  private email: string = "";
  private enabled = false;
  private tags: string[] = [];
  private snapshotIds: string[] = [];
  private readonly payload: T | undefined;
  
  private async fetchSnapshotIds(): Promise<string[]> {
    // Simulate an asynchronous operation to fetch snapshot IDs
    return new Promise<string[]>((resolve, reject) => {
      setTimeout(async () => {
        // Example: Fetching snapshot IDs from an API or database
        const fetchedSnapshotIds = await snapshotApi.fetchSnapshotIds(this.getUniqueId!);

        // Resolve with fetched snapshot IDs
        resolve(fetchedSnapshotIds);
      }, 1000); // Simulating a delay of 1 second (adjust as needed)
    });
  }

  private callback?: (data: Snapshot<T, K>) => void = (data: Snapshot<T, K>) => {
    if (data.data instanceof Map) {
      // Handle the case where data.data is a Map
      console.error("Unexpected data type: Map");
      return;
    }

    this.state = data.data as T; // Type assertion to ensure type safety
    
    this.callbackFunction && this.callbackFunction(data);
    this.onSnapshotCallbacks.forEach((subscriber) =>
      subscriber.handleCallback(data)
    );
    this.triggerIncentives && this.triggerIncentives(data);
    this.logActivity && this.logActivity(data);
    this.updateProjectState && this.updateProjectState(data);
    this.notifyEventSystem && this.notifyEventSystem(data);
    this.triggerIncentives && this.triggerIncentives(data);
  };
  

  
  public subscriber?: Subscriber<T, K>;
  public callTriggerIncentives(params: TriggerIncentivesParams) {
    if (hasTriggerIncentives(this)) {
      this.triggerIncentives(params);
    } else {
      console.warn("triggerIncentives function is not defined");
    }
  }

  public async fetchSnapshotIds(): Promise<string[]> {
    // Simulate an asynchronous operation to fetch snapshot IDs
    return new Promise<string[]>((resolve, reject) => {
      setTimeout(async () => {
        // Example: Fetching snapshot IDs from an API or database
        const fetchedSnapshotIds = await snapshotApi.fetchSnapshotIds(this.getUniqueId!);
        // Resolve with fetched snapshot IDs
        resolve(fetchedSnapshotIds);
        1000}); // Simulating a delay of 1 second (adjust as needed)
        resolve(fetchedSnapshotIds);
    
        // Reject with an error if fetching snapshot IDs fails
        reject(new Error("Failed to fetch snapshot IDs")
      );
      }, 1000); // Simulating a delay of 1 second (adjust as needed)
    }
 

  // Define a method to subscribe to snapshots

  // Define a getter method to access the sendNotification method
  public get sentNotification(): (
    eventType: string,
    eventData: any,
    date: Date,
    type: NotificationTypeEnum
  ) => Promise<void> {
    return async (
      eventType: string,
      eventData: any,
      date: Date,
      type: NotificationTypeEnum
    ) => {
      return this.sendNotification(eventType, eventData, date, type);
    };
  }

  // Define the sendNotification method that uses the external API service
  public async sendNotification(
    eventType: string,
    eventData: any,
    date: Date,
    type: NotificationTypeEnum
  ): Promise<void> {
    // Implement the notification logic using the API service
    console.log(
      `Notification sent: EventType - ${eventType}, EventData - ${eventData}, Date - ${date}, Type - ${type}`
    );

    // You could also integrate the real notification service here:
    await apiNotificationsService.sentNotification(
      eventType,
      eventData,
      date,
      type
    );
  }

  /**
   * Handles the update of the subscriber with a new snapshot.
   *
   * @param snapshot - The snapshot to update with.
   */
  update(snapshot: Snapshot<T, K>): void {
    // Log the snapshot details
    console.log("Subscriber updated with snapshot:", snapshot);
    console.log("Snapshot ID:", snapshot.id);
    console.log("Snapshot Data:", snapshot.data);

    // Update internal state with the new snapshot if ID is valid
    if (snapshot.id) {
      this.internalState.set(snapshot.id.toString(), snapshot);
      console.log(`Internal state updated with snapshot ID: ${snapshot.id}`);
    } else {
      console.error("Snapshot ID is undefined. Cannot update internal state.");
    }

    // Process the snapshot data if available
    if (snapshot.data) {
      this.processData(snapshot.data);
    } else {
      console.error("Snapshot data is undefined or null. Cannot process data.");
    }

    // Notify about the update if notify method exists
    if (this.notify && snapshot.id) {
      const callback = (data: Snapshot<T, K>) =>
        console.log("Callback invoked with data:", data);
      const subscribers: Subscriber<T, K>[] = []; // Use actual subscribers if available
      this.notify(snapshot, callback, subscribers);
    } else {
      console.error(
        "Notify method or snapshot ID is undefined. Cannot send notification."
      );
    }
  }

  /**
   * Processes the data from the snapshot.
   *
   * @param data - The data to process.
   */

  private processData(
    data: T | Map<string, Snapshot<T, K>> | null | undefined
  ): void {
    // Log the start of data processing
    console.log("Starting data processing for:", data);

    // Ensure data is not null or undefined
    if (data == null) {
      console.error("Cannot process null or undefined data.");
      return;
    }

    // Check if the data is a Map or a single data object
    if (data instanceof Map) {
      // Handle the Map case
      data.forEach((snapshot, key) => {
        console.log(`Processing snapshot with key: ${key}`);

        // Ensure snapshot data is not null or undefined
        if (!snapshot.data) {
          console.error(`Snapshot data is null or undefined for key: ${key}`);
          return;
        }

        // 1. Validate the snapshot data
        if (this.validateData(snapshot.data)) {
          console.log(`Data validation successful for key: ${key}`);
        } else {
          console.error(`Data validation failed for key: ${key}`);
          return;
        }

        // 2. Transform the snapshot data using transformData (only if it's of type T)
        const transformedData = this.transformData(snapshot.data as T);
        console.log(`Transformed data for key: ${key}:`, transformedData);

        // 3. Store or update internal data structures with the processed data
        this.updateInternalStore(transformedData);

        // 4. Optionally, trigger additional actions based on the processed data
        this.triggerActions(transformedData);
      });
    } else {
      // Handle the case where data is of type T

      // Ensure data is not null or undefined
      if (!data) {
        console.error("Data is null or undefined.");
        return;
      }

      // 1. Validate the data
      if (this.validateData(data)) {
        console.log("Data validation successful.");
      } else {
        console.error("Data validation failed.");
        return;
      }

      // 2. Transform or manipulate the data if needed
      const transformedData = this.transformData(data);
      console.log("Transformed data:", transformedData);

      // 3. Store or update internal data structures with the processed data
      this.updateInternalStore(transformedData);

      // 4. Optionally, trigger additional actions based on the processed data
      this.triggerActions(transformedData);
    }
  }

  /**
   * Validates the given data.
   *
   * @param data - The data to validate.
   * @returns - True if data is valid, false otherwise.
   */
  private validateData(data: T | Map<string, Snapshot<T, K>>): boolean {
    // Check if the data is not null or undefined
    if (!data) {
      console.error("Data is null or undefined.");
      return false;
    }

    // Example: Check if 'requiredProperty' exists in the data
    if (!("requiredProperty" in data)) {
      console.error("'requiredProperty' is missing from data.");
      return false;
    }

    // Data is valid
    return true;
  }

  /**
   * Transforms or manipulates the given data.
   *
   * @param data - The data to transform.
   * @returns - The transformed data.
   */
  
  private transformData(data: Snapshot<T, K>): Snapshot<T, K> {
    // Example transformation: Add a timestamp to the data if it doesn't exist
    if (!(data.data as any).timestamp) {
      (data.data as any).timestamp = new Date().toISOString();
    }
  
    // Example: Convert data values to uppercase (assuming 'data' has a 'name' field)
    if ("name" in data.data) {
      (data.data as any).name = (data.data as any).name.toUpperCase();
    }
  
    // Return the transformed snapshot
    return data;
  }

  /**
   * Triggers additional actions based on the processed data.
   *
   * @param data - The processed data.
   */

  // Implement the triggerActions method
  private async triggerActions(data: T): Promise<void> {
    // Example: Send notification if data meets certain conditions
    if ("status" in data && (data as any).status === "COMPLETED") {
      // Prepare notification details
      const eventType = "DataCompleted";
      const eventData = { id: (data as any).id };
      const date = new Date();
      const type = NotificationTypeEnum.Info; // Example notification type

      // Use the sentNotification getter to send the notification
      await this.sentNotification(eventType, eventData, date, type);
    }
  }

  constructor(
    id: string,
    name: string,
    subscription: Subscription<T, K>,
    subscriberId: string,
    notifyEventSystem: Function,
    updateProjectState: Function,
    logActivity: Function,
    triggerIncentives: Function,
    optionalData: CustomSnapshotData<T, K> | null = null,
    // data: Partial<SnapshotStore<T, K>>,
    payload: T | null = null
  ) {
    this.id = id;
    this.name = name;
    this.subscription = subscription;
    this.subscriberId = subscriberId;
    this.notifyEventSystem = notifyEventSystem;
    this.updateProjectState = updateProjectState;
    this.logActivity = logActivity;
    this.triggerIncentives = triggerIncentives;
    this.optionalData = optionalData;
    this.subscriptionLevel = subscriptionLevel;

    // Initialize the internal cache as a Map
    this.internalCache = new Map<string, T>();
    // this.data = data;
    this.payload = payload !== null ? payload : (optionalData as unknown as T);
  }

  /**
   * Updates internal data structures with the processed data.
   *
   * @param data - The processed data to store.
   */
  private updateInternalStore(data: T): void {
    // Get the ID from the data (assuming it has an 'id' field)
    const id = (data as any).id; // You should ensure the data has an ID field

    if (!id) {
      console.error("Data does not contain an 'id' field.");
      return;
    }

    // Store the data in the internal cache with its ID as the key
    this.internalCache.set(id, data);
    console.log(`Internal store updated for ID: ${id}`);
  }


    /**
   * Public method to check if the data is of type T.
   *
   * @param data - The data to check.
   * @returns - True if the data is of type T, false otherwise.
   */
    public getIsDataType(data: any): data is T {
      return this.isDataType(data);
    }
  

    // Method to retrieve the SubscriptionLevel information
    public getSubscriptionLevel(): SubscriptionLevel {
      return this.subscriptionLevel;
    }

    /**
   * Public method to update internal store with processed data.
   *
   * @param data - The processed data to store.
   */
    public getUpdateInternalStore(data: T): void {
      // Call the private method to update the internal data structure
      this.updateInternalStore(data);
    }

  /**
   * Public method to process the data.
   *
   * @param data - The data to process.
   */
  public getProcessData(data: T | Map<string, Snapshot<T, K>> | null | undefined): void {
    this.processData(data);
  }

  /**
   * Public method to validate the data.
   *
   * @param data - The data to validate.
   * @returns - True if data is valid, false otherwise.
   */
  public getValidateData(data: T | Map<string, Snapshot<T, K>>): boolean {
    return this.validateData(data);
  }

  /**
   * Public method to transform the data.
   *
   * @param data - The **Snapshot** to transform (not just raw data `T`).
   * @returns - The transformed **Snapshot**.
   */
  public getTransformData(data: Snapshot<T, K>): Snapshot<T, K> {
    return this.transformData(data);
  }


  /**
   * Public method to trigger actions based on processed data.
   *
   * @param data - The processed data.
   */
  public getTriggerActions(eventType: string, eventData: any, date: Date, type: NotificationTypeEnum, data: T): Promise<void> {
    return this.triggerActions(data);
  }

  
  /**
   * Retrieves data from the internal cache based on the ID.
   *
   * @param id - The ID of the data to retrieve.
   * @returns - The data associated with the ID, or undefined if not found.
   */
  public getFromInternalCache(id: string): T | undefined {
    // Retrieve data from the cache using the ID as the key
    const data = this.internalCache.get(id);

    if (!data) {
      console.warn(`Data with ID: ${id} not found in the internal cache.`);
      return undefined;
    }

    return data;
  }

  /**
   * Clears the internal cache.
   */
  public clearInternalCache(): void {
    // Clear all data from the internal cache
    this.internalCache.clear();
    console.log("Internal cache cleared.");
  }

  /**
   * Removes a specific item from the internal cache based on the ID.
   *
   * @param id - The ID of the data to remove.
   */
  public removeFromInternalCache(id: string): void {
    if (this.internalCache.has(id)) {
      this.internalCache.delete(id);
      console.log(`Data with ID: ${id} removed from internal cache.`);
    } else {
      console.warn(`Data with ID: ${id} not found in internal cache.`);
    }
  }

  private isDataType(data: any): data is T {
    // Implement your own logic to check if data is of type T
    // For example, if T has a specific property, you can check for that
    // Here is a simple example assuming T has a property `id`
    return data && typeof data === "object" && "id" in data;
  }

  newData(data: Snapshot<T, K>): Snapshot<T, K> {
    // Ensure data.data is of type T
    if (this.isDataType(data.data)) {
      this.state = data.data; // Safe to assign as T
    } else {
      console.error("Unexpected data type:", data.data);
      // Handle the case where data.data is not of type T
      this.state = null; // Or some other appropriate default value or handling
    }
    this.callbackFunction && this.callbackFunction(data);
    this.onSnapshotCallbacks.forEach((callback) =>
      callback.handleCallback(data)
    );
    // this.triggerIncentives && this.triggerIncentives(data);
    // this.logActivity && this.logActivity(data);
    // this.updateProjectState && this.updateProjectState(data);
    // this.notifyEventSystem && this.notifyEventSystem(data);
    return data;
  }

  getId(): string | undefined {
    return this.id;
  }

  get getUniqueId(): string | undefined {
    return this._id;
  }

  set setUniqueId(key: string) {
    this.setUniqueId = key
  }

  set id(value: string | undefined) {
    this.id = value;
  }

  get getEnabled(): boolean {
    return this.enabled;
  }

  get getTags(): string[] {
    if (this.tags.length === 0) {
      return this.tags;
    }
    return this.tags;
  }

  get getInternalState(): Map<string, Snapshot<T, K>> { 
    return this.internalState
  }

  get getInternalCache(): Map<string, T> {
    return this.internalCache
  }
    

  get getCallback(): ((data: Snapshot<T, K>) => void) | undefined {
    return this.callbackFunction;
  }


  get defaultSubscribeToSnapshots(): string[] {
    return this.snapshotIds;
  }

  set defaultSubscribeToSnapshots(value: string[]) {
    this.snapshotIds = value;
  }

  get subscribeToSnapshots(): string[] {
    return this.snapshotIds;
  }

  get getSubscribers(): SubscriberCallback<T, K>[] {
    return this.subscribers;
  }

  // Getter method for transforming the subscriber
  get getTransformSubscriber() {
    return (
      event: string,
      snapshotId: string,
      snapshot: Snapshot<T, K>,
      snapshotStore: SnapshotStore<T, K>,
      dataItems: T[],
      criteria: any,
      category: any
    ): Subscriber<BaseData, BaseData> => {
      // You can add your transformation logic based on event and criteria here
      const transformedSubscriber = Subscriber.transformSubscriber(this);
      
      // Here you can potentially add logic based on the event, criteria, and category
      // Example logic:
      if (event === 'someEvent' && criteria.someCondition) {
        // Modify transformedSubscriber based on the event or criteria
      }

      // You can also log or handle dataItems, snapshot, snapshotStore as needed
      
      return transformedSubscriber;
    };
  }

  get transformSubscribers(): SubscriberCallback<T, K>[] {
    return this.subscribers;
  }

  set setSubscribers(subscribers: SubscriberCallback<T, K>[]) {
    this.subscribers = subscribers;
  }

  // Corrected return type to match `onSnapshotCallbacks` type
  get getOnSnapshotCallbacks(): SubscriberCallback<T, K>[] {
    return this.onSnapshotCallbacks;
  }

  set setOnSnapshotCallbacks(callbacks: SubscriberCallback<T, K>[]) {
    this.onSnapshotCallbacks = callbacks;
  }

  get getOnErrorCallbacks(): ((error: Error) => void)[] {
    return this.onErrorCallbacks;
  }

  set setOnErrorCallbacks(callbacks: ((error: Error) => void)[]) {
    this.onErrorCallbacks = callbacks;
  }

  get getOnUnsubscribeCallbacks(): ((data: Snapshot<T, K>) => void)[] {
    return this.onUnsubscribeCallbacks;
  }

  set setOnUnsubscribeCallbacks(callbacks: ((data: Snapshot<T, K>) => void)[]) {
    this.onUnsubscribeCallbacks = callbacks;
  }

  set setNotifyEventSystem(func: Function | undefined) {
    this.notifyEventSystem = func;
  }

  set setUpdateProjectState(func: Function | undefined) {
    this.updateProjectState = func;
  }

  set setLogActivity(func: Function | undefined) {
    this.logActivity = func;
  }

  set setTriggerIncentives(func: Function | undefined) {
    this.triggerIncentives = func;
  }

  set setOptionalData(data: CustomSnapshotData<T, K> | null) {
    this.optionalData = data;
  }

  set setEmail(email: string) {
    this.email = email;
  }

  set setSnapshotIds(ids: string[]) {
    this.snapshotIds = ids;
  }

  get getPayload(): T | undefined {
    return this.payload;
  }

  handleSnapshot(data: Snapshot<T, K>): void {
    if (typeof this.callbackFunction === "function") {
      this.callbackFunction(data);
    }
    this.onSnapshotCallbacks.forEach((callback) => {
      if (typeof callback.handleCallback === "function") {
        callback.handleCallback(data); // Call the handleCallback function
      }
    });
    if (typeof this.logActivity === "function") {
      this.logActivity(data);
    }
    if (typeof this.updateProjectState === "function") {
      this.updateProjectState(data);
    }
    if (typeof this.notifyEventSystem === "function") {
      this.notifyEventSystem(data);
    }
  }

  // Method to handle the callback
  handleCallback(data: Snapshot<T, K>): void {
    if (this.callbackFunction) {
      this.callbackFunction(data);
    } else {
      console.warn("No callback function provided.");
    }
  }

  // Static method to transform Subscriber
  static transformSubscriber <T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(
    sub: Subscriber<T, K>
  ): Subscriber<BaseData, BaseData> {
    const transformedSub = new Subscriber<BaseData, BaseData>(
      sub.getUniqueId!,
      sub.name,
      sub.subscription as Subscription<BaseData, BaseData>,
      sub.subscriberId,
      sub.notifyEventSystem ? sub.notifyEventSystem : SubscriptionActions,
      sub.updateProjectState ? sub.updateProjectState : SubscriptionActions,
      sub.logActivity ? sub.logActivity : SubscriptionActions,
      sub.triggerIncentives ? sub.triggerIncentives : SubscriptionActions,
      sub.optionalData as unknown as CustomSnapshotData<T, K>,
      sub.payload as unknown as BaseData
    );

    // Copy methods and properties
    transformedSub.notifyEventSystem = sub.notifyEventSystem;
    transformedSub.updateProjectState = sub.updateProjectState;
    transformedSub.logActivity = sub.logActivity;
    transformedSub.triggerIncentives = sub.triggerIncentives;
    transformedSub.optionalData = sub.optionalData;
    transformedSub.subscriberId = sub.subscriberId;

    // Copy any other methods and properties as needed...
    transformedSub.subscription = sub.subscription as Subscription<
      BaseData,
      Meta,
      BaseData
    >;

    transformedSub.subscribersById = sub.getSubscribersById?.() ?? {};
    transformedSub.subscribers = sub.getSubscribers ?? [];
    transformedSub.onSnapshotCallbacks = sub.getOnSnapshotCallbacks ?? [];
    transformedSub.onErrorCallbacks = sub.getOnErrorCallbacks ?? [];
    transformedSub.onUnsubscribeCallbacks =
      sub.getOnUnsubscribeCallbacks ?? [];
    transformedSub.notifyEventSystem = sub.notifyEventSystem;
    transformedSub.updateProjectState = sub.updateProjectState;
    transformedSub.logActivity = sub.getLogActivity?.() || undefined;
    transformedSub.triggerIncentives =
    sub.getTriggerIncentives?.() || undefined;
    transformedSub.optionalData = sub.getOptionalData?.();
    transformedSub.data = sub.data;
    transformedSub.email = "";
    transformedSub.enabled = false;
    transformedSub.tags = [];
    transformedSub.snapshotIds = [];
    transformedSub.payload = sub.payload;
    transformedSub.transformSubscriber = sub.getTransformSubscriber;
    transformedSub.fetchSnapshotIds = sub.getFetchSnapshotIds;
    transformedSub.getId = sub.getId;
    transformedSub._id = sub.getUniqueId;
    transformedSub.id = sub.id;
    transformedSub.enabled = sub.getEnabled;
    transformedSub.tags = sub.getTags;
    transformedSub.defaultSubscribeToSnapshots =
      sub.defaultSubscribeToSnapshots;
    transformedSub.subscribeToSnapshots = sub.subscribeToSnapshots;
    transformedSub.subscribers = sub.getSubscribers;
    transformedSub.transformSubscribers = sub.getTransformSubscribers;
    transformedSub.setSubscribers = sub.setSubscribers;
    transformedSub.getOnSnapshotCallbacks = sub.getOnSnapshotCallbacks;
    transformedSub.setOnSnapshotCallbacks = sub.setOnSnapshotCallbacks;
    transformedSub.getOnErrorCallbacks = sub.getOnErrorCallbacks;
    transformedSub.setOnErrorCallbacks = sub.setOnErrorCallbacks;
    transformedSub.getOnUnsubscribeCallbacks = sub.getOnUnsubscribeCallbacks;
    transformedSub.setOnUnsubscribeCallbacks = sub.setOnUnsubscribeCallbacks;
    transformedSub.setNotifyEventSystem = sub.setNotifyEventSystem;
    transformedSub.setUpdateProjectState = sub.setUpdateProjectState;
    transformedSub.setLogActivity = sub.setLogActivity;
    transformedSub.setTriggerIncentives = sub.setTriggerIncentives;
    transformedSub.setOptionalData = sub.setOptionalData;
    transformedSub.setEmail = sub.setEmail;
    transformedSub.setSnapshotIds = sub.setSnapshotIds;
    transformedSub.payload = sub.getPayload;
    transformedSub.handleCallback = sub.handleCallback;
    transformedSub.snapshotCallback = sub.snapshotCallback;
    transformedSub.getEmail = sub.getEmail;
    transformedSub.subscribe = sub.subscribe;
    transformedSub.unsubscribe = sub.unsubscribe;
    transformedSub.getOptionalData = sub.getOptionalData;
    transformedSub.getFetchSnapshotIds = sub.getFetchSnapshotIds;
    transformedSub.getSnapshotIds = sub.getSnapshotIds;
    transformedSub.getData = sub.getData;
    transformedSub.getInitialData = sub.getInitialData;
    transformedSub.getNewData = sub.getNewData;
    transformedSub.getDefaultSubscribeToSnapshots =
      sub.getDefaultSubscribeToSnapshots;
    transformedSub.getSubscribeToSnapshots = sub.getSubscribeToSnapshots;
    transformedSub.fetchTransformSubscribers = sub.fetchTransformSubscribers;
    transformedSub.getTransformSubscribers = sub.getTransformSubscribers;
    transformedSub.setTransformSubscribers = sub.setTransformSubscribers;
    transformedSub.getNotifyEventSystem = sub.getNotifyEventSystem;
    transformedSub.getUpdateProjectState = sub.getUpdateProjectState;
    transformedSub.getLogActivity = sub.getLogActivity;
    transformedSub.getTriggerIncentives = sub.getTriggerIncentives;
    transformedSub.initialData = sub.initialData;
    transformedSub.getName = sub.getName;
    transformedSub.getDetermineCategory = sub.getDetermineCategory;
    transformedSub.fetchSnapshotById = sub.fetchSnapshotById;
    transformedSub.snapshots = sub.snapshots;
    transformedSub.toSnapshotStore = sub.toSnapshotStore;
    transformedSub.determineCategory = sub.determineCategory;
    transformedSub.getDeterminedCategory = sub.getDeterminedCategory;
    transformedSub.processNotification = sub.processNotification;
    transformedSub.receiveSnapshot = sub.receiveSnapshot;
    transformedSub.getState = sub.getState;
    transformedSub.setEvent = sub.setEvent;
    transformedSub.onError = sub.onError;
    transformedSub.getSubscriberId = sub.getSubscriberId;
    transformedSub.getSubscribersById = sub.getSubscribersById;
    transformedSub.getSubscribersWithSubscriptionPlan =
      sub.getSubscribersWithSubscriptionPlan;
    transformedSub.getSubscription = sub.getSubscription;
    transformedSub.onUnsubscribe = sub.onUnsubscribe;
    transformedSub.onSnapshot = sub.onSnapshot;
    transformedSub.onSnapshotError = sub.onSnapshotError;
    transformedSub.onSnapshotUnsubscribe = sub.onSnapshotUnsubscribe;
    transformedSub.triggerOnSnapshot = sub.triggerOnSnapshot;

    return transformedSub;
  }

  snapshotCallback(data: Snapshot<T, K>): void {
    console.log("Snapshot callback called with data:", data);

    // Safely assign state
    if (data.data instanceof Map) {
      // Assuming the Map's first value is the relevant data
      this.state = Array.from(data.data.values())[0] || null;
    } else {
      this.state = data.data || null;
    }

    // Provide default values for potentially undefined properties
    this.snapshotIds = data.snapshotIds || [];

    // Safely invoke functions if they are defined
    if (this.notifyEventSystem) {
      this.notifyEventSystem(data);
    }

    if (this.updateProjectState) {
      this.updateProjectState(data);
    }

    if (this.logActivity) {
      this.logActivity(data);
    }

    if (this.triggerIncentives) {
      this.triggerIncentives(data);
    }
    // Ensure subscribers and onSnapshotCallbacks are arrays
    this.subscribers.forEach((subscriber) => subscriber(data));
    this.onSnapshotCallbacks.forEach((cb) => cb(data));
  }

  getEmail(): string {
    return this.email;
  }

  subscribe(callback: SubscriberCallback<T, K>) {
    this.subscribers.push(callback);
  }

  unsubscribe(
    snapshotId: number, 
    unsubscribe: UnsubscribeDetails, 
    callback: SubscriberCallback<T, K>
  ) {
    const index = this.subscribers.indexOf(callback);
    if (index !== -1) {
      this.subscribers.splice(index, 1);
      this.onUnsubscribeCallbacks.forEach((cb) => cb(callback));
    }
  }

  getOptionalData(): CustomSnapshotData<T, K> | null {
    return this.optionalData;
  }

  getFetchSnapshotIds(): Promise<string[]> {
    return this.fetchSnapshotIds();
  }

  getSnapshotIds(): string[] {
    return this.snapshotIds;
  }

  getData(): Partial<Snapshot<T, K>> | null {
    return this.data;
  }

  getInitialData(): Partial<SnapshotStore<T, K>> | null {
    return this.initialData;
  }

  // New method to fetch and process new data
  async getNewData(): Promise<Partial<SnapshotStore<T, K>> | null> {
    try {
      // Fetch the latest snapshot IDs
      const newSnapshotIds = await this.fetchSnapshotIds();

      // Process the new snapshot IDs (if needed)
      this.snapshotIds = newSnapshotIds;

      // Optionally, fetch and process the latest snapshots based on the new IDs
      const newSnapshots: Snapshot<T, K>[] = await Promise.all(
        newSnapshotIds.map((id): Promise<Snapshot<T, K>> => {
          return snapshotApi.fetchSnapshotById(id);
        })
      );

      // Update the subscriber's data with the new snapshots
      const newData: Partial<SnapshotStore<T, K>> = {
        ...this.data,
        snapshots: newSnapshots,
      };

      // Return the processed new data
      return newData;
    } catch (error) {
      console.error("Failed to fetch new data:", error);
      return null;
    }
  }
  async getDefaultSubscribeToSnapshots(
    snapshotIds: string[]
  ): Promise<Partial<SnapshotStore<T, K>> | null> {
    try {
      // Fetch the latest snapshot IDs
      const newSnapshotIds = await this.fetchSnapshotIds();
      console.log("newSnapshotIds", newSnapshotIds);
      console.log("this.snapshotIds", this.snapshotIds);

      // Assuming you process newSnapshotIds and this.snapshotIds to form the result
      const result: Partial<SnapshotStore<T, K>> = {
        snapshotIds: newSnapshotIds, // Example property
        // Add other properties as necessary
      };

      return result;
    } catch (error) {
      console.error("Failed to fetch new data:", error);
      return null;
    }
  }

  async getSubscribeToSnapshots(): Promise<Partial<
    SnapshotStore<T, K>
  > | null> {
    try {
      // Fetch the latest snapshot IDs
      const newSnapshotIds = await this.fetchSnapshotIds();
      console.log("newSnapshotIds", newSnapshotIds);
      console.log("this.snapshotIds", this.snapshotIds);
      // Process the new snapshot IDs (if needed)
      this.snapshotIds = newSnapshotIds;
      // Optionally, fetch and process the latest snapshots based on the new IDs
      const newSnapshots: Snapshot<T, K>[] = await Promise.all(
        newSnapshotIds.map((id): Promise<Snapshot<T, K>> => {
          return snapshotApi.fetchSnapshotById(id);
        })
      );
      // Update the subscriber's data with the new snapshots
      const newData: Partial<SnapshotStore<T, K>> = {
        ...this.data,
        snapshots: newSnapshots,
      };
      // Return the processed new data
      return newData;
    } catch (error) {
      console.error("Failed to fetch new data:", error);
      return null;
    }
    // Return the processed new data
  }

  // Fetch transform subscribers asynchronously
  async fetchTransformSubscribers(): Promise<BaseDatabaseService | null> {
    try {
      // Await if transformSubscribers is a promise
      const result = await (this.transformSubscribers instanceof Promise
        ? this.transformSubscribers
        : Promise.resolve(this.transformSubscribers));
      return result as BaseDatabaseService;
    } catch (error) {
      // Log the error for debugging
      console.error("Failed to fetch transform subscribers:", error);

      // Handle the error as needed (e.g., notify the user, retry, etc.)
      // Returning null in this case to indicate failure
      return null;
    }
  }

  // Get transform subscribers synchronously
  getTransformSubscribers(): SubscriberCallback<T, K>[] {
    if (Array.isArray(this.transformSubscribers)) {
      return this.transformSubscribers;
    } else {
      // If transformSubscribers is a promise, handle it accordingly
      // This could be changed based on your specific needs
      console.warn(
        "Transform subscribers are currently being fetched asynchronously."
      );
      return [];
    }
  }

  // Method to initialize or set transformSubscribers
  setTransformSubscribers(
    subscribers: SubscriberCallback<T, K>[] | Promise<BaseDatabaseService>
  ): void {
    (this as any).transformSubscribers = subscribers;
  }

  getNotifyEventSystem(): Function | undefined {
    return this.notifyEventSystem;
  }

  getUpdateProjectState(): Function | undefined {
    return this.updateProjectState;
  }

  getLogActivity(): Function | undefined {
    return this.logActivity;
  }

  getTriggerIncentives(): Function | undefined {
    return this.triggerIncentives;
  }
  // Example method for adding callbacks
  addSnapshotCallback(callback: SnapshotCallback<T>): void {
    this.onSnapshotCallbacks.push(callback);
  }

  initialData(data: Snapshot<T, K>) {
    this.state = data.state as T | null | undefined;
    if (this.notifyEventSystem) {
      this.notifyEventSystem(NotificationTypeEnum.SUBSCRIBER_INITIAL_DATA, {
        subscriberId: this.subscriberId,
        data: data,
      });
    }
  }

  getName(): string {
    return this.name;
  }

  getDetermineCategory(data: Snapshot<T, K>): string | CategoryProperties | null {
    return this.subscription.determineCategory(data);
  }

  // Assuming the fetchSnapshotById on `this.subscription` accepts a single object argument
  fetchSnapshotById(
    userId: string,
    snapshotId: string
  ): Promise<Snapshot<T, K>> {
    return new Promise((resolve, reject) => {
      if (
        this.subscription &&
        typeof this.subscription.fetchSnapshotById === "function"
      ) {
        const callback: FetchSnapshotByIdCallback<T, K> = {
          onSuccess: (snapshot: Snapshot<T, K>) => {
            const specificSnapshot = convertSnapshotToSpecificType<T, K>(
              snapshot
            );
            resolve(specificSnapshot);
          },
          onError: (error: any) => reject(error),
        };
        try {
          this.subscription.fetchSnapshotById({ userId, snapshotId });
          this.subscription.fetchSnapshotByIdCallback?.(
            { userId, snapshotId },
            callback
          );
        } catch (error) {
          reject(error);
        }
      } else {
        reject(new Error("fetchSnapshotById is not defined or not a function"));
      }
    });
  }

  // Type guard to check if snapshot is of type Snapshot<T, K>
  private isSnapshotOfType<X extends Data, Y extends Data>(
    snapshot: Snapshot<any, any>
  ): snapshot is Snapshot<X, Y> {
    // Implement the logic to validate the snapshot's properties
    // Here, we're assuming `snapshot` should have specific properties that define its type
    return (
      snapshot.snapshotsArray !== undefined &&
      snapshot.snapshotsObject !== undefined
      // Add additional checks as necessary to validate the snapshot structure
    );
  }

  async snapshots(): Promise<SnapshotConfig<T, K>[]> {
    try {
      // Fetch snapshot IDs asynchronously
      const snapshotIds = await this.fetchSnapshotIds();

      // Fetch snapshot data based on the IDs
      const snapshotData = await Promise.all(
        snapshotIds.map(async (id: string) => {
          return new Promise((resolve, reject) => {
            // Define a way to handle the asynchronous behavior
            const callback = (snapshot: Snapshot<T, K>) => resolve(snapshot);
            const errorCallback = (error: any) => reject(error);
            // Ensure fetchSnapshotById method returns a valid promise
            const snapshot = this.fetchSnapshotById(this.email, id);
            return snapshot;
          });
        })
      );

      return snapshotData as SnapshotConfig<BaseData, K>[]; // Ensure the correct type is returned
    } catch (error) {
      console.error("Error fetching snapshot IDs:", error);
      throw new Error("Failed to fetch snapshot IDs");
    }
  }

  async snapshotStores(): Promise<SnapshotStoreConfig <T, Data>[]> {
    try {
      // Fetch snapshot IDs asynchronously
      const snapshotIds = await this.fetchSnapshotIds();

      // Fetch snapshot data based on the IDs
      const snapshotData = await Promise.all(
        snapshotIds.map(async (id: string) => {
          return new Promise((resolve, reject) => {
            // Define a way to handle the asynchronous behavior
            const callback = (snapshot: Snapshot<T, K>) => resolve(snapshot);
            const errorCallback = (error: any) => reject(error);
            // Ensure fetchSnapshotById method returns a valid promise
            const snapshot = this.fetchSnapshotById(this.email, id);
            return snapshot;
          });
        })
      );

      return snapshotData as SnapshotStoreConfig <T, Data>[]; // Ensure the correct type is returned
    } catch (error) {
      console.error("Error fetching snapshot IDs:", error);
      throw new Error("Failed to fetch snapshot IDs");
    }
  }

  toSnapshotStore(
    initialState: Snapshot<T, K> | undefined,
    snapshotConfig: SnapshotStoreConfig <T, K>[],
    delegate: SnapshotStoreDelegate<T, K>
  ): SnapshotStore<T, K>[] | undefined {
    let snapshotString: string | undefined;
    if (initialState !== undefined) {
      snapshotString = initialState.id?.toString();
    }
    if (initialState && snapshotString !== undefined) {
      // Ensure initialState is defined
      const category = this.determineCategory(initialState);

      // Retrieve options for SnapshotStore initialization using the helper function
      const options: SnapshotStoreOptions<T, K> = createSnapshotOptions(
        snapshotObj,
        snapshot
      );

      const delegateFunction: SnapshotStoreSubset<T, K> = {
        
        onSnapshot: (
          snapshot: Snapshot<T, K>,
          config: SnapshotStoreConfig<SnapshotWithCriteria<any, BaseData>, K, Meta>[]
        ) => {
          delegate(snapshot, initialState, config);
        },
        snapshotId: "",
        taskIdToAssign: undefined,
        addSnapshot: addSnapshot,
        addSnapshotSuccess: addSnapshotSuccess,
        updateSnapshot: updateSnapshot as (
          snapshotId: string,
          data: SnapshotStore<T, K>,
          events: Record<string, CalendarManagerStoreClass<T, K>[]>,
          snapshotStore: SnapshotStore<T, K>,
          dataItems: RealtimeDataItem[],
          newData: T | Data,
          payload: UpdateSnapshotPayload<any>
        ) => Promise<{ snapshot: SnapshotStore<T, K>[] }>,
        removeSnapshot: removeSnapshot,
        clearSnapshots: clearSnapshots,
        createInitSnapshot: createInitSnapshot,
        createSnapshotSuccess: createSnapshotSuccess,
        createSnapshotFailure: createSnapshotFailure,
        updateSnapshots: updateSnapshots,
        updateSnapshotSuccess: updateSnapshotSuccess,
        updateSnapshotFailure: updateSnapshotFailure,
        updateSnapshotsSuccess: updateSnapshotsSuccess,
        // updateSnapshotsFailure: updateSnapshotsFailure,
        // initSnapshot: initSnapshot,
        // takeSnapshot: takeSnapshot,
        // takeSnapshotSuccess: takeSnapshotSuccess,
        // takeSnapshotsSuccess: takeSnapshotsSuccess,
        // configureSnapshotStore: configureSnapshotStore,
        // getData: this.getData,
        // flatMap: flatMap,
        // setData: setData,
        // getState: getState,
        // setState: setState,
        // validateSnapshot: validateSnapshot,
        // handleSnapshot: handleSnapshot,
        // handleActions: handleActions,
        // setSnapshot: setSnapshot,
        // setSnapshots: setSnapshots,
        // clearSnapshot: clearSnapshot,
        // mergeSnapshots: mergeSnapshots,
        // reduceSnapshots: reduceSnapshots,
        // sortSnapshots: sortSnapshots,
        // filterSnapshots: filterSnapshots,
        // mapSnapshots: mapSnapshots,
        // findSnapshot: findSnapshot,
        // getSubscribers: getSubscribers,
        // notify: notify,
        // notifySubscribers: notifySubscribers,
        // subscribe: subscribe,
        // unsubscribe: unsubscribe,
        // fetchSnapshot: fetchSnapshot,
        // fetchSnapshotSuccess: fetchSnapshotSuccess,
        // fetchSnapshotFailure: fetchSnapshotFailure,
        // getSnapshot: getSnapshot,
        // getSnapshots: getSnapshots,
        // getAllSnapshots: getAllSnapshots,
        // generateId: generateId,
        // batchFetchSnapshots: batchFetchSnapshots,
        // batchTakeSnapshotsRequest: batchTakeSnapshotsRequest,
        // batchUpdateSnapshotsRequest: batchUpdateSnapshotsRequest,
        // batchFetchSnapshotsSuccess: batchFetchSnapshotsSuccess,
        // batchFetchSnapshotsFailure: batchFetchSnapshotsFailure,
        // batchUpdateSnapshotsSuccess: batchUpdateSnapshotsSuccess,
        // batchUpdateSnapshotsFailure: batchUpdateSnapshotsFailure,
        // batchTakeSnapshot: batchTakeSnapshot
      };

      return [new SnapshotStore<T, K>(options, config)];
    }

    return undefined;
  }

  private determineCategory(initialState: Snapshot<T, K>): string {
    if (initialState instanceof YourSpecificSnapshotType) {
      return "SpecificCategory";
    } else {
      return "DefaultCategory";
    }
  }

  getDeterminedCategory(data: Snapshot<T, K>): string | CategoryProperties {
    const category = this.subscription.determineCategory(data);
    if (category === undefined || category === null) {
      // Provide a fallback value in case category is undefined or null
      return "defaultCategory"; // Or provide a default CategoryProperties object
    }
    return category;
  }

  // Updated processNotification function
  async processNotification(
    id: string,
    message: string,
    snapshotContent: Map<string, Snapshot<T, K>> | null | undefined,
    date: Date,
    type: NotificationType,
    store: SnapshotStore<T, K>
  ): Promise<void> {
    const content = snapshotContent
      ? convertMapToSnapshot(snapshotContent, date)
      : null;
    return new Promise<void>((resolve, reject) => {
      const snapshotData: SnapshotData<T, K> = {
        id,
        message: message,
        initialState: content,
        date: date,
        category: "subscriberCategory",
        content: content
          ? (content.content as string | Content<T> | undefined)
          : undefined,
        data: content
          ? (content.data as T | Map<string, Snapshot<T, K>> | null | undefined)
          : new Map<string, Snapshot<T, K>>(),
        type,
        store: store,
        unsubscribe: () => {
          console.log("unsubscribe");
        },
        fetchSnapshot: (
          callback: (
            snapshotId: string,
            payload: FetchSnapshotPayload<K>,
            snapshotStore: SnapshotStore<T, K>,
            payloadData: Data | T
          ) => void
        ) => {
          console.log("fetchSnapshot");
          return Promise.resolve();
        },
        handleSnapshot: (
          id: string,
          snapshotId: string,
          snapshot: T | null,
          snapshotData: T,
          category: Category | undefined,
          callback: (snapshot: T) => void,
          snapshots: SnapshotsArray<T, K>,
          type: string,
          event: Event,
          snapshotContainer?: T,
          snapshotStoreConfig?: SnapshotStoreConfig<T, any> | null
        ): Promise<Snapshot<T, K> | null> => {
          console.log("handleSnapshot");
          return Promise.resolve(null);
        },
        meta: content
          ? (content.meta as Map<string, Snapshot<StructuredMetadata, K>> | {})
          : {},
        events: content
          ? {
              eventRecords: (
                content.events as {
                  eventRecords: Record<
                    string,
                    CalendarManagerStoreClass<T, K>[]
                  > | null;
                }
              ).eventRecords,
              callbacks: {}, // Initialize empty or based on your logic
              subscribers: new SubscriberCollection<T, K>(), // Replace with actual logic or initialization
              eventIds: [], // Initialize or populate based on your logic
              onSnapshotAdded: () => {
                /* Implement the function */
              },
              onSnapshotRemoved: () => {
                /* Implement the function */
              },
              initialConfig: {} as SnapshotConfig<T, K>, // Replace with actual config
              removeSubscriber: () => {
                /* Implement the function */
              },
              onError: () => {
                /* Implement the function */
              },
              onInitialize: () => {
                /* Implement the function */
              },
              onSnapshotUpdated: () => {
                /* Implement the function */
              },
              on: () => {
                /* Implement the function */
              },
              off: () => {
                /* Implement the function */
              },
              emit: () => {
                /* Implement the function */
              },
              once: () => {
                /* Implement the function */
              },
              addRecord: () => {
                /* Implement the function */
              },
              removeAllListeners: () => {
                /* Implement the function */
              },
              subscribe: () => {
                /* Implement the function */
              },
              unsubscribe: () => {
                /* Implement the function */
              },
              trigger: () => {
                /* Implement the function */
              },
              eventsDetails: content.events as
                | CalendarManagerStoreClass<T, K>[]
                | undefined,
            }
          : undefined,
      };

      // Handle the promise resolution
      resolve();
    });
  }

  receiveSnapshot(snapshot: T): void {
    this.state = snapshot;
    console.log(`Subscriber ${this.id} received snapshot:`, snapshot);
    this.notifyEventSystem?.({
      type: "SNAPSHOT_RECEIVED",
      subscriberId: this.id,
      snapshot,
    });
    this.updateProjectState?.(this.id, snapshot);
    this.logActivity?.({
      subscriberId: this.id,
      action: "RECEIVED_SNAPSHOT",
      details: snapshot,
    });
    this.triggerIncentives?.(this.id, snapshot);
  }

  getState(prop: any): T | null {
    return this.state ?? null;
  }

  setEvent(prop: any, value: any): void {
    this.state = value;
    console.log(`Subscriber ${this.id} set event:`, prop, value);
    this.updateProjectState?.(this.id, value);
    this.logActivity?.({
      subscriberId: this.subscriberId,
      action: "SET_EVENT",
      details: { prop, value },
    });
    this.triggerIncentives?.(this.id, value);
    this.notifyEventSystem?.({
      type: "EVENT_SET",
      subscriberId: this.subscriberId,
    });
  }

  onError(callback: (error: Error) => void) {
    this.onErrorCallbacks.push(callback);
  }

  getSubscriberId(): string {
    return this.subscriberId;
  }

  getSubscribersById(): Map<string, Subscriber<T, K>> | undefined {
    return this.subscribersById;
  }

  getSubscribersWithSubscriptionPlan(
    userId: string,
    snapshotId: string
  ): SubscriberTypeEnum | undefined {
    return this.subscription?.getPlanName
      ? this.subscription.getPlanName({ userId, snapshotId })
      : undefined;
  }

  getSubscription(): Subscription<T, K> {
    return this.subscription;
  }

  getSubscriptionId?(): string {
    return this.subscription.getId ? this.subscription.getId() : "";
  }

  getSubscriberType?(
    userId: string,
    snapshotId: string
  ): SubscriberTypeEnum | undefined {
    return this.subscription?.getPlanName
      ? this.subscription.getPlanName({ userId, snapshotId })
      : undefined;
  }

  onUnsubscribe(callback: (data: Snapshot<T, K>) => void) {
    this.onUnsubscribeCallbacks.push(callback);
  }

  onSnapshot(callback: (snapshot: Snapshot<T, K>) => void | Promise<void>) {
    this.onSnapshotCallbacks.push(callback);
  }

  onSnapshotError(callback: (error: Error) => void) {
    this.onErrorCallbacks.push(callback);
  }

  onSnapshotUnsubscribe(callback: (data: Snapshot<T, K>) => Snapshot<T, K>) {
    this.onUnsubscribeCallbacks.push(callback);
  }

  triggerOnSnapshot(snapshot: Snapshot<T, K>) {
    this.onSnapshotCallbacks.forEach((callback) => callback(snapshot));
  }

  notify?(
    data: Snapshot<T, K>,
    callback: (data: Snapshot<T, K>) => void,
    subscribers: Subscriber<T, K>[] = []
  ) {
    if (callback) { // Check if callback is provided
      callback(data);
    }
    if (typeof callback === "function") {
      callback(data);
    }
    subscribers.forEach((subscriber) => {
      subscriber.triggerOnSnapshot({
        ...data, // Ensuring the data remains intact
        timestamp: new Date().toISOString(), // Add a timestamp
        category: data.category ?? 'General', // Ensure category is included
      });
    });
    if (typeof sendNotification === "function") {
      (sendNotification as (type: NotificationTypeEnum) => void)(
        NotificationTypeEnum.DataLoading
      );
    }
    return subscribers;
  }
  

  static createSubscriber<T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(
    id: string,
    name: string,
    subscription: Subscription<T, K>,
    subscriberId: string,
    notifyEventSystem: Function,
    updateProjectState: Function,
    logActivity: Function,
    triggerIncentives: Function,
    optionalData: CustomSnapshotData<T, K> | null = null,
    data: T | null = null
  ) {
    return new Subscriber<T, K>(
      id,
      name,
      subscription,
      subscriberId,
      notifyEventSystem,
      updateProjectState,
      logActivity,
      triggerIncentives,
      optionalData,
      data
    );
  }
}

function notifyEventSystem(event: {
  type: string;
  subscriberId: string;
  snapshot: any;
}) {
  console.log(
    `Event system notified: ${event.type} for subscriber ${event.subscriberId}`
  );
}

function updateProjectState(subscriberId: string, snapshot: any) {
  console.log(`Project state updated for subscriber ${subscriberId}`);
}

function logActivity(activity: {
  subscriberId: string;
  action: string;
  details: any;
}) {
  console.log(
    `Activity logged: ${activity.action} by subscriber ${activity.subscriberId}`
  );
}

function triggerIncentives(subscriberId: string, snapshot: any) {
  console.log(`Incentives triggered for subscriber ${subscriberId}`);
}

export const payload: Payload = {
  error: "Error occurred",
  meta: {
    id: "1",
    name: "Subscriber Name",
    timestamp: new Date(),
    type: NotificationTypeEnum.DataLoading,
    startDate: new Date(),
    endDate: new Date(),
    status: NotificationStatus.ERROR,
    isSticky: false,
    isDismissable: false,
    isClickable: false,
    isClosable: false,
    isAutoDismiss: false,
    isAutoDismissable: false,
    isAutoDismissOnNavigation: false,
    isAutoDismissOnAction: false,
    isAutoDismissOnTimeout: false,
    isAutoDismissOnTap: false,
    optionalData: {},
    data: {},
  },
};




const subscription = {
  subscriberId: "1",
  subscriberType: SubscriberTypeEnum.STANDARD,
  subscriptionType: SubscriptionTypeEnum.PortfolioUpdates,
  getPlanName: () => SubscriberTypeEnum.STANDARD,
  portfolioUpdates: () => {},
  tradeExecutions: () => {},
  triggerIncentives: () => {},
  marketUpdates: () => {},
  determineCategory: (data: any) => data.category,
  communityEngagement: () => {},
  unsubscribe: () => {},
  portfolioUpdatesLastUpdated: {} as ModifiedDate,
  getId: () => "1",
  subscribers: [],
  data: {} as Snapshot<BaseData, K>,
  getSubscriptionLevel: () => ({}),
 
};

const subscriber = new Subscriber<BaseData, K>(
  payload.meta.id,
  payload.meta.name,
  subscription,
  subscription.getId ? subscription.getId() : "defaultSubscriberId", // Ensure subscriberId is correctly obtained
  notifyEventSystem,
  updateProjectState,
  logActivity,
  triggerIncentives,
  payload.meta.optionalData,
  payload.meta.data
);



const result = subscribeToSnapshots(snapshoStore,
  snapshotId,
  snapshotData,
  category,
  snapshotConfig,
  snapshots,
  callback,
);

if (result.subscriber) {
  // You can manage the subscription, e.g., unsubscribe
  result.subscriber.unsubscribe();
}

// Use the snapshots array directly
result.snapshots.forEach(snapshot => {
  // Do something with each snapshot
});

const sampleSnapshot: CustomSnapshotData<T, K> = {
  timestamp: new Date().toISOString(),
  value: "42",
};

subscriber.receiveSnapshot(sampleSnapshot);

console.log("Subscriber state:", subscriber.getState("state"));

export { Subscriber, subscriber };
export type { AuditRecord, SubscribeResult, SubscriberCallback, Subscribers };

