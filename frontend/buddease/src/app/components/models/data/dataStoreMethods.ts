import { CustomHydrateResult } from "@/app/configs/DocumentBuilderConfig";
import { CategoryProperties } from "@/app/pages/personas/ScenarioBuilder";
import { DataStore } from "../../projects/DataAnalysisPhase/DataProcessing/DataStore";
import { SnapshotConfig, SnapshotItem, SnapshotOperationType } from '../../snapshots';
import { Snapshot, Snapshots, SnapshotsArray, SnapshotsObject, SnapshotUnion } from "../../snapshots/LocalStorageSnapshotStore";

import { UnifiedMetaDataOptions } from "@/app/configs/database/MetaDataOptions";
import { useSnapshotManager } from "../../hooks/useSnapshotManager";
import { Category } from "../../libraries/categories/generateCategoryProperties";
import { SnapshotContainer } from "../../snapshots/SnapshotContainer";
import SnapshotStore, { SubscriberCollection } from "../../snapshots/SnapshotStore";
import { SnapshotStoreConfig } from "../../snapshots/SnapshotStoreConfig";
import { SnapshotWithCriteria } from "../../snapshots/SnapshotWithCriteria";
import { useSnapshotStore } from "../../snapshots/useSnapshotStore";
import { addToSnapshotList } from "../../utils/snapshotUtils";
import useSecureStoreId from "../../utils/useSecureStoreId";
import Version from "../../versions/Version";
import { RealtimeDataItem } from "../realtime/RealtimeData";
import { BaseData, Data } from "./Data";
import { StatusType } from "./StatusType";


export type T = Data;
// Define a generic type K that extends Data
export type K<T extends Data> = T; // K is now a generic type that takes T as an argument extending Data.// K could be the same as T or a different specialized type
export type Meta = UnifiedMetaDataOptions


const storeId = useSecureStoreId()
if(storeId === null){
  throw new Error("Store id is null");
}
// dataStoreMethods.ts
const dataStoreMethods: DataStore<T, Meta, K> = {
  data: undefined,
  storage: [] as SnapshotStore<T, Meta, K>[],
  addData: (data: Snapshot<T, Meta, K>) => { },
  updateData: (id: number, newData: Snapshot<T, Meta, K>) => { },
  removeData: (id: number) => { },

  updateDataTitle: (id: number, title: string) => { },
  updateDataDescription: (id: number, description: string) => { },
  addDataStatus: (
    id: number,
    status: StatusType | undefined
  ) => { },
  updateDataStatus: (
    id: number,
    status: StatusType | undefined
  ) => { },
  addDataSuccess: (payload: { data: Snapshots<T, Meta> }) => { },
  getDataVersions: async (id: number) => {
    // Implement logic to fetch data versions from a data source
    return undefined;
  },
  updateDataVersions: (id: number, versions: Snapshots<BaseData>) => { },
  getBackendVersion: () => {
    const conditionForHydrateResult = true; // Replace with actual condition

    if (conditionForHydrateResult) {
      const hydrateResult: CustomHydrateResult<number> = {
        storeKey: "dataStore",
        storeValue: 0,
        version: {} as Version,
        customProperty1: "",
        customMethod: () => { },
        // The `rehydrate` method now returns `hydrateResult` to ensure recursive compatibility
        rehydrate: () => hydrateResult,

        // The `finally` method also returns `hydrateResult`
        finally: (onFinally: () => void) => {
          onFinally();
          return hydrateResult;
        },

        // Implementing the `then` method to comply with Promise-like behavior
        // Adjusted `then` method to match the expected signature
        then: <TResult1 = number, TResult2 = never>(
          onfulfilled?: (value: number) => TResult1 | PromiseLike<TResult1>,
          onrejected?: (reason: any) => TResult2 | PromiseLike<TResult2>
        ): CustomHydrateResult<TResult1 | TResult2> => {
          if (onfulfilled) {
            const result = onfulfilled(hydrateResult.storeValue);
            return {
              ...hydrateResult,
              storeValue: result as TResult1,
            } as CustomHydrateResult<TResult1 | TResult2>;
          }
          return hydrateResult as unknown as CustomHydrateResult<TResult1 | TResult2>;
        },
        catch: (onrejected) => {
          if (onrejected) {
            onrejected(new Error("An error occurred"));
          }
          return hydrateResult;
        },
        [Symbol.toStringTag]: "CustomHydrateResult",
      };
      return hydrateResult;
    } else {
      return Promise.resolve("Backend version as a string");
    }
  },

  getFrontendVersion: () => Promise.resolve(""),

  fetchData: (id: number) => Promise.resolve({
    id,
    title: "",
    content: "",
    status: StatusType.Active,

    key: "",
    keys: [],
    topic: "",
    date: "",

    // Configuration Methods
    config: undefined,
    configs: [],
    getConfig: undefined,
    setConfig: undefined,
    handleActions: undefined,
    transformSnapshotConfig: undefined,

    // Delegate Methods
    delegate: undefined,
    transformedDelegate: undefined,
    ensureDelegate: undefined,
    handleDelegate: undefined,
    transformDelegate: undefined,

    // Event Methods
    events: [],
    notify: undefined,
    notifySuccess: undefined,
    notifyFailure: undefined,

    // Snapshot Comparison
    compareSnapshotState: undefined,
    deepCompare: undefined,
    shallowCompare: undefined,

    // Snapshot Management
    clearSnapshotSuccess: undefined,
    clearSnapshotFailure: undefined,
    createSnapshotSuccess: undefined,
    createSnapshotFailure: undefined,
    takeSnapshotsSuccess: undefined,
    flatMap: undefined,
    setSnapshot: undefined,
    setSnapshotData: undefined,
    setSnapshots: undefined,
    clearSnapshot: undefined,
    mergeSnapshots: undefined,
    reduceSnapshots: undefined,
    sortSnapshots: undefined,
    filterSnapshots: undefined,
    mapSnapshots: undefined,
    mapSnapshotsAO: undefined,

    // Data Manipulation
    setData: undefined,
    getData: undefined,
    getAllKeys: undefined,
    getInitialState: undefined,
    addStore: undefined,
    removeStore: undefined,
    findSnapshot: undefined,
    addDataSuccess: undefined,
    removeItem: undefined,
    getItem: undefined,
    setItem: undefined,
    addChild: undefined,
    removeChild: undefined,

    // Data Validation
    validateSnapshot: undefined,
    filterInvalidSnapshots: undefined,
    isSnapshotStoreConfig: undefined,

    // ID and Mapping
    generateId: undefined,
    findIndex: undefined,
    splice: undefined,
    getDataStoreMethods: (): Promise<Map<string, DataStore<Data, Data>>> => {},
    mapSnapshot: undefined,
    determinePrefix: undefined,

    // Subscriber Transformation
    transformSubscriber: undefined,
    isSnapshotStoreConfig: undefined,

    // State Management
    getState: undefined,
    setState: undefined,
    initializedState: undefined,

    // Encryption and Compression
    compress: undefined,
    auditRecords: undefined,
    encrypt: undefined,
    decrypt: undefined,

    // Snapshot Timing
    getTimestamp: undefined,
    isExpired: undefined,
    createdAt: undefined,

    // Symbol Iterator (for iteration purposes)
    [Symbol.iterator]: undefined,

    operation: {
      operationType: SnapshotOperationType.CreateSnapshot,
    },
    category: "default category",
    categoryProperties: {
      name: "General Category",  // Replace with appropriate value
      description: "This is a category used for general purposes.",
      icon: "icon-path.svg",
      color: "#FF5733",
      iconColor: "#FFFFFF",
      isActive: true,
      isPublic: true,
      isSystem: false,
      isDefault: false,
      isHidden: false,
      isHiddenInList: false,
      UserInterface: ["UIComponent1", "UIComponent2"],
      DataVisualization: ["Chart1", "Graph2"],
      Forms: {
        form1: "Form description 1",
        form2: "Form description 2"
      },
      Analysis: ["AnalysisComponent1", "AnalysisComponent2"],
      Communication: ["Email", "Chat"],
      TaskManagement: ["TaskBoard", "ToDoList"],
      Crypto: ["CryptoWallet", "MarketTracker"],
      brandName: "CategoryBrand",
      brandLogo: "brand-logo.svg",
      brandColor: "#336699",
      brandMessage: "This is a branded message for the category."
    },
    message: "default message",

    timestamp: "",
    eventRecords: {},
    type: "",
    subscribers: [],
    store: (await useSnapshotManager(storeId)).snapshotStore,
    stores: [],
    snapshots: [],
    snapshotConfig: [],

    meta: "",
    snapshotMethods: [],
    getSnapshotsBySubscriber: "",
    getSnapshotsBySubscriberSuccess: "",

    getSnapshotsByTopic: "",
    getSnapshotsByTopicSuccess: "",
    getSnapshotsByCategory: "",
    getSnapshotsByCategorySuccess: "",

    getSnapshotsByKey: "",
    getSnapshotsByKeySuccess: "",
    getSnapshotsByPriority: "",
    getSnapshotsByPrioritySuccess: "",

    getStoreData: "",
    updateStoreData: "",
    updateDelegate: "",
    getSnapshotContainer: "",

    getSnapshotVersions: "",
    createSnapshot: "",
    criteria: "",
    defaultSubscribeToSnapshots: "",

    getDataStoreMap: (): Promise<Map<string, DataStore<Data, Data>>> => {},
    addSnapshotItem: "",
    addNestedStore: "",
    emit: (
      event: string,
      snapshot: Snapshot<T, Meta, K>,
      snapshotId: string,
      subscribers: SubscriberCollection<T, Meta, K>,
      type: string,
      snapshotStore: SnapshotStore<T, Meta, K>,
      dataItems: RealtimeDataItem[],
      criteria: SnapshotWithCriteria<T, Meta, K>,
      category: Category
    ) => { },

    removeChild: (
      childId: string, 
      parentId: string, 
      parentSnapshot: Snapshot<Data, Meta, Data>,
      childSnapshot: Snapshot<Data, Meta, Data>
    ) => { },
    getChildren: "",
    hasChildren: "",
    isDescendantOf: "",

    getInitialState: "",
    getConfigOption: "",
    getTimestamp: "",
    getStores: "",

    getData: "",
    addStore: "",
    removeStore: "",
    createSnapshots: "",

    onSnapshot: "",
    restoreSnapshot: "",
    snapshotStoreConfig: [],
    config: "",

    dataStore: "",
    mapDataStore: "",
    snapshotStores: "",

    initialState: "",
    snapshotItems: "",
    nestedStores: "",
    snapshotIds: "",

    dataStoreMethods: "",
    delegate: "",
    getConfig: "",
    setConfig: "",

    ensureDelegate: "",
    getSnapshotItems: "",
    handleDelegate: "",
    notifySuccess: "",

    notifyFailure: "",
    findSnapshotStoreById: "",
    defaultSaveSnapshotStore: "",
    saveSnapshotStore: "",

    findIndex: "",
    splice: "",
    events: "",
    subscriberId: "",
    length: "",
    value: "",
    todoSnapshotId: "",
    snapshotStore: "",

    dataItems: "",
    newData: "",
    storeId: 0,
    defaultCreateSnapshotStores: "",

    createSnapshotStores: "",
    subscribeToSnapshots: "",
    subscribeToSnapshot: "",
    defaultOnSnapshots: "",

    onSnapshots: "",
    transformSubscriber: "",
    isSnapshotStoreConfig: "",
    transformDelegate: "",

    getSaveSnapshotStore: "",
    getSaveSnapshotStores: "",
    initializedState: "",
    transformedDelegate: "",

    transformedSubscriber: "",
    getSnapshotIds: "",
    getNestedStores: "",
    getFindSnapshotStoreById: "",

    getAllKeys: "",
    mapSnapshot: "",
    getAllItems: "",
    addData: "",

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
    fetchData: "",

    defaultSubscribeToSnapshot: "",
    handleSubscribeToSnapshot: "",
    snapshot: "",
    removeItem: "",

    getSnapshot: "",
    getSnapshotById: "",
    getSnapshotSuccess: "",
    getSnapshotId: "",

    getSnapshotArray: "",
    getItem: "",
    setItem: "",
    addSnapshotFailure: "",

    addSnapshotSuccess: "",
    getParentId: "",
    getChildIds: "",
    addChild: "",

    compareSnapshotState: "",
    deepCompare: "",
    shallowCompare: "",
    getDataStoreMethods: "",

    getDelegate: "",
    determineCategory: "",
    determineSnapshotStoreCategory: "",
    determinePrefix: "",

    updateSnapshot: "",
    updateSnapshotSuccess: "",
    updateSnapshotFailure: "",
    removeSnapshot: "",

    clearSnapshots: "",
    addSnapshot: "",
    createInitSnapshot: "",
    createSnapshotSuccess: "",

    clearSnapshotSuccess: "",
    clearSnapshotFailure: "",
    createSnapshotFailure: "",
    setSnapshotSuccess: "",

    setSnapshotFailure: "",
    updateSnapshots: "",
    updateSnapshotsSuccess: "",
    updateSnapshotsFailure: "",

    initSnapshot: "",
    takeSnapshot: "",
    takeSnapshotSuccess: "",
    takeSnapshotsSuccess: "",

    configureSnapshotStore: "",
    updateSnapshotStore: "",
    flatMap: "",
    setData: "",

    getState: "",
    setState: "",
    validateSnapshot: "",
    handleSnapshot: "",

    handleActions: "",
    setSnapshot: "",
    transformSnapshotConfig: "",
    setSnapshotData: "",

    filterInvalidSnapshots: "",
    setSnapshots: "",
    clearSnapshot: "",
    mergeSnapshots: "",

    reduceSnapshots: "",
    sortSnapshots: "",
    filterSnapshots: "",
    mapSnapshotsAO: "",

    mapSnapshots: "",
    findSnapshot: "",
    getSubscribers: "",
    notify: "",

    notifySubscribers: "",
    subscribe: "",
    unsubscribe: "",
    fetchSnapshot: "",

    fetchSnapshotSuccess: "",
    fetchSnapshotFailure: "",
    getSnapshots: "",
    getAllSnapshots: "",

    getSnapshotStoreData: "",
    generateId: "",
    batchFetchSnapshots: "",
    batchTakeSnapshotsRequest: "",

    batchUpdateSnapshotsRequest: "",
    batchFetchSnapshotsSuccess: "",
    batchFetchSnapshotsFailure: "",
    batchUpdateSnapshotsSuccess: "",

    batchUpdateSnapshotsFailure: "",
    batchTakeSnapshot: "",
    handleSnapshotSuccess: "",
    isExpired: "",

    compress: "",
    auditRecords: "",
    encrypt: "",
    decrypt: "",

    createdAt: "",
    getSnapshotsByTopic: "",
    name: "",
    schema: "",

    addSnapshotToStore: "",
    getDataStore: "",

    [Symbol.iterator]: "",
    // snapshotStore, snapshotContainers, snapshotContainersMap,

    // isAncestorOf, getDescendants, getAncestors, getRoot, getLeafs,

    getSnapshotsByDate: "",
    getSnapshotsByDateSuccess: "",
    getSnapshotsByOperation: "",
    getSnapshotsByOperationSuccess: "",
    additionalInfo: "",
    createdDate: "",
    modifiedDate: "",
    createdBy: "",
    modifiedBy: "",
    version: 0,
    isDeleted: false,
    isArchived: false,
    isDraft: false,
    isTemplate: false,
    isFavorite: false,
    isPinned: false,
    isTrashed: false,
    isUnlisted: false,
    tags: [],
    properties: {},
    permissions: {},
    accessHistory: [],
    revisions: [],
    documents: [],
    comments: [],
    footnotes: [],
    highlights: [],
    embeddedMedia: [],
    embeddedCode: [],
    styles: [],
    tableCells: [],
    tableRows: [],
    tableColumns: [],
    codeBlock: [],
    blockquote: [],
    codeInline: [],
    quote: [],
    todoList: [],
    orderedTodoList: [],
    unorderedTodoList: [],
    color: "",
    colorCoding: {},
    highlight: [],
    highlightColor: "",
    customSettings: {},
    includeType: "",
    includeTitle: [],

    options, structuredMetadata, get, maxAge,
    expirationDate, initializeWithData, hasSnapshots, getEventsAsRecord,
    getStore, dataStores, getSnapshotStores, getItems,
    initializeDefaultConfigs, _saveSnapshotStores, consolidateMetadata, _saveSnapshotStore,
    defaultSaveSnapshotStores, safeCastSnapshotStore, getFirstDelegate, getInitialDelegate,
    transformInitialState, transformSnapshot, transformMappedSnapshotData, transformSnapshotStore,
    transformSnapshotMethod, getName, getVersion, getSchema,
    getSnapshotStoreConfig, defaultConfigs, items, payload,
    callback, storeProps, endpointCategory, getMetadata,
    getProjectMetadata, getStructuredMetadata, find, isCompatibleSnapshot,
    getTransformedSnapshot, getSavedSnapshotStore, getConfigs, getSavedSnapshotStores,
    getTransformedInitialState, getPayload, getCallback, getStoreProps,
    getEndpointCategory, setPayload, setCallback, setStoreProps,
    setEndpointCategory, addDebugInfo, storeTempData, getTempData,
  }),
  getItem: (key: T): Promise<Snapshot<any, Meta, Data> | undefined> => {
    return new Promise((resolve, reject) => {
      if (dataStoreMethods.storage?.length) {
        for (const store of dataStoreMethods.storage) {
          if (store.getItem) {
            const item = store.getItem(key);
            if (item) {
              item.then((resolvedItem: SnapshotItem<any, any, Meta>

              ) => {
                if (resolvedItem) {
                  resolve(JSON.parse(resolvedItem as unknown as string));
                } else {
                  resolve(undefined);
                }
              }).catch((error: any) => {
                reject(error);
              });
              return; // Exit after finding and processing the first matching item
            }
          }
        }
        resolve(undefined); // If no item is found
      } else {
        reject(new Error("Storage is not defined or empty"));
      }
    });
  },

  removeItem: async (key: string): Promise<void> => {
    if (dataStoreMethods.storage?.length) {
      for (const store of dataStoreMethods.storage) {
        if (store.removeItem) {
          await store.removeItem(key);
        }
      }
    } else {
      throw new Error("Storage is not defined or empty");
    }
  },

  getAllKeys: async (
    storeId: number,
    snapshotId: string,
    category: symbol | string | Category | undefined,
    categoryProperties: CategoryProperties | undefined,
    snapshot: Snapshot<SnapshotUnion<BaseData, Meta>, K>,
    timestamp: string | number | Date | undefined,
    type: string,
    event: Event,
    id: number,
    snapshotStore: SnapshotStore<T, Meta, K>,
    data: T
  ): Promise<string[] | undefined> => {
    const keys: string[] = [];

    if (dataStoreMethods.storage?.length) {
      for (const store of dataStoreMethods.storage) {
        // Example usage of parameters, adjust as necessary
        if (
          store.id === storeId &&
          store.snapshotId === snapshotId &&
          store.category === category &&
          store.timestamp === timestamp &&
          store.type === type &&
          store.event === event &&
          store.snapshotStore === snapshotStore
        ) {
          // Directly use store.keys since it's an array
          if (store.keys && Array.isArray(store.keys)) {
            for (const key of store.keys) {
              keys.push(key);
            }
          }
        }
      }
    } else {
      throw new Error("Storage is not defined or empty");
    }
    return keys.length ? keys : undefined;
  },

  async getAllItems(
    storeId: number,
    snapshotId: string,
    category: symbol | string | Category | undefined,
    categoryProperties: CategoryProperties | undefined,
    snapshot: Snapshot<T, Meta, K>,
    timestamp: string | number | Date | undefined,
    type: string,
    event: Event,
    id: number,
    snapshotStore: SnapshotStore<T, Meta, K>,
    data: T
  ): Promise<Snapshot<Data, any>[]> {
    try {
      const keys = await this.getAllKeys(storeId, snapshotId, category, categgoryyProperties, snapshot, timestamp, type, event, id, snapshotStore, data);
      // Handle the case when keys is undefined
      if (!keys) {
        throw new Error("Failed to retrieve keys");
      }
      const items: (Data | undefined)[] = await Promise.all(
        keys.map(async (key) => {
          const item = await this.getItem(key);
          return item;
        })
      );

      const filteredItems = items.filter(
        (item): item is Data => item !== undefined
      );

      return filteredItems.map(item => ({
        initializedState: this.initializedState,
        takeLatestSnapshot: this.takeLatestSnapshot,
        addSnapshotSubscriber: this.addSnapshotSubscriber,
        removeSnapshotSubscriber: this.removeSnapshotSubscriber,
        getSnapshotConfigItems: this.getSnapshotConfigItems,
        executeSnapshotAction: this.executeSnapshotAction,
        subscribeToSnapshot: this.subscribeToSnapshot,
        unsubscribeFromSnapshot: this.unsubscribeFromSnapshot,
        subscribeToSnapshotsSuccess: this.subscribeToSnapshotsSuccess,
        unsubscribeFromSnapshots: this.unsubscribeFromSnapshots,
        getSnapshotItemsSuccess: this.getSnapshotItemsSuccess,
        getSnapshotItemSuccess: this.getSnapshotItemSuccess,
        getSnapshotKeys: this.getSnapshotKeys,
        getSnapshotIdSuccess: this.getSnapshotIdSuccess,
        getSnapshotValuesSuccess: this.getSnapshotValuesSuccess,
        getSnapshotWithCriteria: this.getSnapshotWithCriteria,
        reduceSnapshotItems: this.reduceSnapshotItems,
        subscribeToSnapshotList: this.subscribeToSnapshotList,
        parentId: this.parentId,
        getAllKeys: this.getAllKeys,
        getAllItems: this.getAllItems,
        addDataStatus: this.addDataStatus,
        removeData: this.removeData,
        updateData: this.updateData,
        updateDataTitle: this.updateDataTitle,
        updateDataDescription: this.updateDataDescription,
        updateDataStatus: this.updateDataStatus,
        addDataSuccess: this.addDataSuccess,
        getDataVersions: this.getDataVersions,
        updateDataVersions: this.updateDataVersions,
        getBackendVersion: this.getBackendVersion,
        getFrontendVersion: this.getFrontendVersion,
        fetchData: this.fetchData,
        defaultSubscribeToSnapshot: this.defaultSubscribeToSnapshot,
        handleSubscribeToSnapshot: this.handleSubscribeToSnapshot,
        removeItem: this.removeItem,
        getSnapshot: this.getSnapshot,
        getSnapshotSuccess: this.getSnapshotSuccess,
        setItem: this.setItem,
        getDataStore: this.getDataStore,
        addSnapshotSuccess: this.addSnapshotSuccess,
        deepCompare: this.deepCompare,
        shallowCompare: this.shallowCompare,
        getDataStoreMethods: this.getDataStoreMethods,
        getDelegate: this.getDelegate,
        determineCategory: this.determineCategory,
        determinePrefix: this.determinePrefix,
        removeSnapshot: this.removeSnapshot,
        addSnapshotItem: this.addSnapshotItem,
        addNestedStore: this.addNestedStore,
        clearSnapshots: this.clearSnapshots,
        addSnapshot: this.addSnapshot,
        createSnapshot: this.createSnapshot,
        createInitSnapshot: this.createInitSnapshot,
        setSnapshotSuccess: this.setSnapshotSuccess,
        setSnapshotFailure: this.setSnapshotFailure,
        updateSnapshots: this.updateSnapshots,
        updateSnapshotsSuccess: this.updateSnapshotsSuccess,
        updateSnapshotsFailure: this.updateSnapshotsFailure,
        initSnapshot: this.initSnapshot,
        takeSnapshot: this.takeSnapshot,
        takeSnapshotSuccess: this.takeSnapshotSuccess,
        takeSnapshotsSuccess: this.takeSnapshotsSuccess,
        flatMap: this.flatMap,
        getState: this.getState,
        setState: this.setState,
        validateSnapshot: this.validateSnapshot,
        handleActions: this.handleActions,
        setSnapshot: this.setSnapshot,
        transformSnapshotConfig: this.transformSnapshotConfig,
        setSnapshots: this.setSnapshots,
        clearSnapshot: this.clearSnapshot,
        mergeSnapshots: this.mergeSnapshots,
        reduceSnapshots: this.reduceSnapshots,
        sortSnapshots: this.sortSnapshots,
        filterSnapshots: this.filterSnapshots,
        findSnapshot: this.findSnapshot,
        getSubscribers: this.getSubscribers,
        notify: this.notify,
        notifySubscribers: this.notifySubscribers,
        getSnapshots: this.getSnapshots,
        getAllSnapshots: this.getAllSnapshots,
        generateId: this.generateId,
        batchFetchSnapshots: this.batchFetchSnapshots,
        batchTakeSnapshotsRequest: this.batchTakeSnapshotsRequest,
        batchUpdateSnapshotsRequest: this.batchUpdateSnapshotsRequest,
        filterSnapshotsByStatus: this.filterSnapshotsByStatus,
        filterSnapshotsByCategory: this.filterSnapshotsByCategory,
        filterSnapshotsByTag: this.filterSnapshotsByTag,
        batchFetchSnapshotsSuccess: this.batchFetchSnapshotsSuccess,
        batchFetchSnapshotsFailure: this.batchFetchSnapshotsFailure,
        batchUpdateSnapshotsSuccess: this.batchUpdateSnapshotsSuccess,
        batchUpdateSnapshotsFailure: this.batchUpdateSnapshotsFailure,
        batchTakeSnapshot: this.batchTakeSnapshot,
        handleSnapshotSuccess: this.handleSnapshotSuccess,
        getSnapshotId: this.getSnapshotId,
        compareSnapshotState: this.compareSnapshotState,
        eventRecords: this.eventRecords,
        snapshotStore: this.snapshotStore,
        getParentId: this.getParentId,
        getChildIds: this.getChildIds,
        addChild: this.addChild,
        removeChild: this.removeChild,
        getChildren: this.getChildren,
        hasChildren: this.hasChildren,
        isDescendantOf: this.isDescendantOf,
        dataItems: this.dataItems,
        newData: this.newData,
        timestamp: this.timestamp,
        getInitialState: this.getInitialState,
        getConfigOption: this.getConfigOption,
        getTimestamp: this.getTimestamp,
        getStores: this.getStores,
        getSnapshotStoreData: this.getSnapshotStoreData,
        setData: this.setData,
        addData: this.addData,
        stores: this.stores,
        getStore: this.getStore,
        addStore: this.addStore,
        mapSnapshot: this.mapSnapshot,
        mapSnapshots: this.mapSnapshots,
        removeStore: this.removeStore,
        unsubscribe: this.unsubscribe,
        fetchSnapshot: this.fetchSnapshot,
        addSnapshotFailure: this.addSnapshotFailure,
        configureSnapshotStore: this.configureSnapshotStore,
        updateSnapshotSuccess: this.updateSnapshotSuccess,
        createSnapshotFailure: this.createSnapshotFailure,
        createSnapshotSuccess: this.createSnapshotSuccess,
        createSnapshots: this.createSnapshots,
        onSnapshot: this.onSnapshot,
        onSnapshots: this.onSnapshots,
        label: this.label,
        handleSnapshot: this.handleSnapshot,
        initialConfig: this.initialConfig,
        removeSubscriber: this.removeSubscriber,
        onInitialize: this.onInitialize,
        onError: this.onError,
        snapshot: this.snapshot,
        setCategory: this.setCategory,
        applyStoreConfig: this.applyStoreConfig,
        snapshotData: this.snapshotData,
        getItem: this.getItem,
        getDataStoreMap: this.getDataStoreMap,
        emit: this.emit,
        addStoreConfig: this.addStoreConfig,
        handleSnapshotConfig: this.handleSnapshotConfig,
        getSnapshotConfig: this.getSnapshotConfig,
        getSnapshotListByCriteria: this.getSnapshotListByCriteria,
        payload: this.payload,
        subscribe: this.subscribe,
        fetchSnapshotFailure: this.fetchSnapshotFailure,
        fetchSnapshotSuccess: this.fetchSnapshotSuccess,
        updateSnapshotFailure: this.updateSnapshotFailure,
        updateSnapshot: this.updateSnapshot,
        restoreSnapshot: this.restoreSnapshot, // Fixed initialization
        subscribers: this.subscribers,
        getSnapshotItems: this.getSnapshotItems,
        defaultSubscribeToSnapshots: this.defaultSubscribeToSnapshots,

        versionInfo: this.versionInfo,
        transformSubscriber: this.transformSubscriber,
        transformDelegate: this.transformDelegate,
        events: this.events,
        meta: this.meta,
        data: item,

        // Callback method for subscription
        subscribeToSnapshots: (callback: (snapshot: Snapshot<Data, any>) => void) => {
          callback({
            data: item,
            isCore: true, // Adjust according to your Snapshot<Data, any> requirements
            initialConfig: {},
            removeSubscriber: () => { },
            onInitialize: () => { },
            // Add other required properties and methods for Snapshot<Data, any>

          }));
    } catch (error) {
      console.error('Error fetching all items:', error);
      throw error;
    }
  },
  events: {
    eventRecords: {},
    callbacks: (snapshot: Snapshot<Data, any>) => {
      return {
        onDataChange: (callback: (data: Snapshot<Data, any>) => void) => {
          callback(snapshot);
        },
        onDataDelete: (callback: (data: Snapshot<Data, any>) => void) => {
          callback(snapshot);
        },
        onDataCreate: (callback: (data: Snapshot<Data, any>) => void) => {
          callback(snapshot);
        },
        onDataUpdate: (callback: (data: Snapshot<Data, any>) => void) => {
          callback(snapshot);
        },
        onDataMerge: (callback: (data: Snapshot<Data, any>) => void) => {
          callback(snapshot);
        }
      };
    },
    subscribers: [],
    eventIds: []
  },
  snapshotStoreConfig: (config: SnapshotStoreConfig<SnapshotUnion<Data, Meta>, any>) => {
    return {
      snapshotStoreConfig: config
    };
  },
  snapshotConfig: (config: SnapshotConfig<SnapshotWithCriteria<Data, any>, any>) => {
    return {
      snapshotConfig: config
    };
  },
  getSnapshotItems: (items: Data) => {
    return items;
  },

  defaultSubscribeToSnapshots: (

    callback: (snapshot: Snapshot<Data, any>) => void
  ) => {
    callback(item);
  },

  versionInfo: { version: '1.0.0' },

  transformSubscriber: (snapshot: Snapshot<Data, any>) => {
    return snapshot;
  },

  transformDelegate: (snapshot: Snapshot<Data, any>) => {
    return snapshot;
  },

  meta: {},

  getSnapshotStoreData: function (
    id: number // Changed from string to number
  ): Promise<SnapshotStore<Data, Meta, BaseData> | undefined> {
    return new Promise(async (resolve, reject) => {
      try {
        const snapshotStore = await useSnapshotStore(addToSnapshotList)

        if (!snapshotStore || !snapshotStore.state) {
          return reject(new Error("SnapshotStore or its state is null"));
        }

        const snapshot = snapshotStore.getSnapshot(id.toString()); // Convert number to string if necessary

        if (snapshot) {
          resolve({
            category: snapshot.category,
            timestamp: snapshot.timestamp,
            id: snapshot.id,
            snapshot,
            snapshotStore,
            data: snapshot.data,
          });
        } else {
          reject(new Error(`Snapshot with id ${id} not found`));
        }
      } catch (error) {
        reject(new Error(`An error occurred while getting the snapshot: ${error.message}`));
      }
    });
  },

  getStoreData: function (id: number): Promise<SnapshotStore<Data, any>[]> {
    throw new Error("Function not implemented.");
  },
  getDelegate: function (context: {
    useSimulatedDataSource: boolean;
    simulatedDataSource: SnapshotStoreConfig<SnapshotWithCriteria<T, Meta, K>, K>[];
  }): Promise<SnapshotStoreConfig<SnapshotUnion<Data, Meta>, any>[]> {
    throw new Error("Function not implemented.");
  },
  updateDelegate: function (config: SnapshotStoreConfig<Data, any>[]): Promise<SnapshotStoreConfig<Data, any>[]> {
    throw new Error("Function not implemented.");
  },
  getSnapshot: function (
    snapshot: (id: string | number) =>
      | Promise<{
        snapshotId: number;
        snapshotData: SnapshotData<T, Meta, K>;
        category: Category | undefined;
        categoryProperties: CategoryProperties | undefined;
        dataStoreMethods: DataStore<T, Meta, K> | null;
        timestamp: string | number | Date | undefined;
        id: string | number | undefined;
        snapshot: Snapshot<T, Meta, K>;
        snapshotStore: SnapshotStore<T, Meta, K>;
        data: T;
      }>
      | undefined
  ): Promise<Snapshot<Data, any> | undefined> {
    return this.getSnapshot(category, timestamp, id, snapshot, snapshotStore, data);
  },

  getSnapshotWithCriteria: function (
    category: symbol | string | Category | undefined,
    timestamp: any,
    id: number,
    snapshot: Snapshot<BaseData, any>,
    snapshotStore: SnapshotStore<Data, any>,
    data: Data
  ): Promise<SnapshotWithCriteria<T, Meta, K> | undefined> {
    return new Promise((resolve, reject) => {
      resolve(undefined);
    })
  },

  getSnapshotVersions: function (
    category: symbol | string | Category | undefined,
    timestamp: any,
    id: number,
    snapshot: Snapshot<BaseData, any>,
    snapshotStore: SnapshotStore<Data, any>,
    data: Data
  ): Promise<Snapshot<Data, any>[] | undefined> {
    return new Promise((resolve, reject) => {
      resolve(undefined);
    })
  },
  getSnapshotWithCriteriaVersions: function (
    category: symbol | string | Category | undefined,
    timestamp: any,
    id: number,
    snapshot: Snapshot<BaseData, any>,
    snapshotStore: SnapshotStore<Data, any>,
    data: Data
  ): Promise<SnapshotWithCriteria<T, Meta, K>[] | undefined> {
    return new Promise((resolve, reject) => {
      resolve(undefined);
    })
  },

  mapSnapshot: function (
    storeId: number,
    snapshotStore: SnapshotStore<T, Meta, K>,
    snapshotContainer: SnapshotContainer<T, Meta, K>,
    snapshotId: string,
    criteria: CriteriaType,
    snapshot: Snapshot<T, Meta, K>,
    type: string,
    event: Event
    //data: Data
  ): Promise<Snapshot<Data, any> | undefined> {
    return new Promise((resolve, reject) => {
      resolve(undefined);
    })
  },

  mapSnapshots: (
    storeIds: number[],
    snapshotId: string,
    category: symbol | string | Category | undefined,
    snapshot: Snapshot<T, Meta, K>,
    timestamp: string | number | Date | undefined,
    type: string,
    event: Event,
    id: number,
    snapshotStore: SnapshotStore<T, Meta, K>,
    data: T,
    callback: (
      storeIds: number[],
      snapshotId: string,
      category: symbol | string | Category | undefined,
      snapshot: Snapshot<T, Meta, K>,
      timestamp: string | number | Date | undefined,
      type: string,
      event: Event,
      id: number,
      snapshotStore: SnapshotStore<T, Meta, K>,
      data: T
    ) => SnapshotsObject<T, Meta, K>
  ): SnapshotsObject<T, Meta, K> => {
    try {
      // Call the callback function with the provided parameters
      const result = callback(
        storeIds,
        snapshotId,
        category,
        snapshot,
        timestamp,
        type,
        event,
        id,
        snapshotStore,
        data
      );

      // Return the result from the callback function
      return result;
    } catch (error: any) {
      throw new Error(`Error processing snapshots: ${error.message}`);
    }
  },

  updateStoreData: (
    data: Data,
    id: number,
    newData: SnapshotStore<Data, Data>
  ): Promise<SnapshotStore<Data, Data>[]> => {
    throw new Error("Function not implemented.");
  },


  getSnapshotContainer: (
    category: string, // Adjusted to more specific type
    timestamp: string, // Adjusted to more specific type
    id: number,
    snapshot: Snapshot<BaseData, any>,
    snapshotStore: SnapshotStore<Data, any>,
    snapshotData: SnapshotData<Data, Data>,
    data: Data,
    snapshotsArray: SnapshotsArray<T, Meta>,
    snapshotsObject: SnapshotsObject<T, Meta, K>
  ): Promise<SnapshotContainer<Data, any> | undefined> => {
    return new Promise((resolve, reject) => {
      // Implementation logic to fetch or construct a SnapshotContainer
      const container: SnapshotContainer<Data, any> = {
        id: id.toString(), // Ensure id is a string
        category,
        timestamp,
        snapshot,
        snapshotData,
        snapshotStore,
        data,
        snapshotsArray,
        snapshotsObject
      };
      resolve(container);
    });
  },

  mapSnapshotStore: (
    storeId: number,
    snapshotId: string,
    category: symbol | string | Category | undefined,
    categoryProperties: CategoryProperties | undefined,
    snapshot: Snapshot<any, any>,
    timestamp: string | number | Date | undefined,
    type: string,
    event: Event,
    id: number,
    snapshotStore: SnapshotStore<any, any>,
    data: any
  ): Promise<SnapshotContainer<any, any> | undefined> => {
    return new Promise((resolve, reject) => {
      // Implementation logic to fetch or construct a SnapshotContainer
      const container: SnapshotContainer<any, any> = {
        id: id.toString(), // Ensure id is a string
        category,
        timestamp,
        snapshot,
        snapshotData: snapshotStore,
        snapshotStore,
        data,
        snapshotsArray: [],
        snapshotsObject: {}
      };
      resolve(container);
    });
  }
};


export const getDocumentVersions = async (
  documentId: string
): Promise<any> => {
  try {
    // Call the API method
    const versions = await getDocumentVersions(documentId);

    // Process the data if needed
    return versions;
  } catch (error) {
    console.error("Error in getDocumentVersions:", error);
    throw error;
  }
};


export const updateSnapshotDetails = async (
  snapshotId: string,
  newDetails: any // Define a proper type for `newDetails` as needed
): Promise<any> => {
  try {
    // Call the API method
    const updatedSnapshot = await updateSnapshotDetails(snapshotId, newDetails);

    // Process the data if needed
    return updatedSnapshot;
  } catch (error) {
    console.error("Error in updateSnapshotDetails:", error);
    throw error;
  }
};

export { dataStoreMethods };
