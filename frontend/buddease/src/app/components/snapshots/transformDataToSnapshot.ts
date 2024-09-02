// transformDataToSnapshot.ts
import { SnapshotConfig, SnapshotItem, SnapshotStoreConfig, SnapshotWithCriteria } from ".";
import { Category } from "../libraries/categories/generateCategoryProperties";
import { BaseData } from "../models/data/Data";
import { RealtimeDataItem } from "../models/realtime/RealtimeData";
import CalendarManagerStoreClass from "../state/stores/CalendarEvent";
import { CoreSnapshot, Snapshot, SnapshotUnion, UpdateSnapshotPayload } from "./LocalStorageSnapshotStore";
import SnapshotStore, { SubscriberCollection } from "./SnapshotStore";

const transformDataToSnapshot = <T extends BaseData, K extends BaseData>(
  item: CoreSnapshot<T, K>,
  snapshotConfig: SnapshotConfig<T, K>,
  snapshotStoreConfig: SnapshotStoreConfig<T, K>
): Snapshot<T, K> => {
  const snapshotItem: Snapshot<T, K> = {
    // Core Properties
    id: item.id?.toString() ?? '',
    data: item.data as T | Map<string, Snapshot<T, K>> | null | undefined,
    initialState: item.initialState as unknown as Snapshot<T, K> | null,
    timestamp: item.timestamp ? new Date(item.timestamp) : new Date(),
    meta: item.meta,
    label: item.label,
    restoreSnapshot: item.restoreSnapshot,
    handleSnapshot: item.handleSnapshot,
    subscribeToSnapshots: item.subscribeToSnapshots,
    config: snapshotConfig.config,
    isCore: snapshotConfig.isCore,

    // Category Management
    currentCategory: snapshotConfig.currentCategory,
    setSnapshotCategory: snapshotConfig.setSnapshotCategory,
    getSnapshotCategory: snapshotConfig.getSnapshotCategory,


    // Events Management
    addSnapshotSubscriber: snapshotConfig.addSnapshotSubscriber,
    removeSnapshotSubscriber: snapshotConfig.removeSnapshotSubscriber,
    subscribeToSnapshotList: snapshotConfig.subscribeToSnapshotList,
    subscribers: snapshotConfig.subscribers,
    subscribeToSnapshot: snapshotConfig.subscribeToSnapshot,
    unsubscribeFromSnapshot: snapshotConfig.unsubscribeFromSnapshot,
    subscribeToSnapshotsSuccess: snapshotConfig.subscribeToSnapshotsSuccess,
    unsubscribeFromSnapshots: snapshotConfig.unsubscribeFromSnapshots,

    events: {
      eventRecords: item.events?.eventRecords ?? {},
      callbacks: item.events?.callbacks ?? {},
      subscribers: [],
      eventIds: [],
      onSnapshotAdded: item.events?.onSnapshotAdded ?? (() => { }),
      onSnapshotRemoved: item.events?.onSnapshotRemoved ?? (() => { }),
      onSnapshotUpdated: item.events?.onSnapshotUpdated ?? (() => { }),
      initialConfig: item.events?.initialConfig ?? {} as SnapshotConfig<T, K>,
      removeSubscriber: item.events?.removeSubscriber ?? (() => { }),
      onInitialize: item.events?.onInitialize ?? (() => { }),
      onError: item.events?.onError ?? (() => { }),
      on: item.events?.on ?? (() => { }),
      off: item.events?.off ?? (() => { }),
      emit: item.events?.emit ?? (() => { }),
      once: item.events?.once ?? (() => { }),
      addRecord: item.events?.addRecord ?? (() => { }),
      removeAllListeners: item.events?.removeAllListeners ?? (() => { }),
      subscribe: item.events?.subscribe ?? (() => { }),
      unsubscribe: item.events?.unsubscribe ?? (() => { }),
      trigger: item.events?.trigger ?? (() => { }),
    },

    // Configuration & State Management
    initialConfig: item.events?.initialConfig,
    removeSubscriber: item.snapshotStoreConfig?.removeSubscriber,
    onInitialize: item.events?.onInitialize,
    onError: snapshotConfig.onError,
    snapshot: snapshotConfig.snapshot,
    setCategory: snapshotConfig.setCategory,
    applyStoreConfig: snapshotConfig.applyStoreConfig,
    snapshotData: snapshotConfig.snapshotData,
    initializedState: snapshotConfig.initializedState,
    getState: snapshotConfig.getState,
    setState: snapshotConfig.setState,
    getSnapshotItems: snapshotConfig.getSnapshotItems,
    defaultSubscribeToSnapshots: snapshotConfig.defaultSubscribeToSnapshots,
    versionInfo: snapshotConfig.versionInfo,
    transformSubscriber: snapshotConfig.transformSubscriber,
    transformDelegate: snapshotConfig.transformDelegate,
    getAllKeys: snapshotConfig.getAllKeys,
    getAllItems: snapshotConfig.getAllItems,

    // Snapshot Operations
    addDataStatus: snapshotConfig.addDataStatus,
    removeData: snapshotConfig.removeData,
    updateData: snapshotConfig.updateData,
    updateDataTitle: snapshotConfig.updateDataTitle,
    updateDataDescription: snapshotConfig.updateDataDescription,
    updateDataStatus: snapshotConfig.updateDataStatus,
    addDataSuccess: snapshotConfig.addDataSuccess,
    getDataVersions: snapshotConfig.getDataVersions,
    updateDataVersions: snapshotConfig.updateDataVersions,
    getBackendVersion: snapshotConfig.getBackendVersion,
    getFrontendVersion: snapshotConfig.getFrontendVersion,
    fetchData: snapshotConfig.fetchData,


    getSnapshotSuccess: snapshotConfig.getSnapshotSuccess,
    takeLatestSnapshot: snapshotConfig.takeLatestSnapshot,
    executeSnapshotAction: snapshotConfig.executeSnapshotAction,
    deleteSnapshot: snapshotConfig.deleteSnapshot,
    compareSnapshots: snapshotConfig.compareSnapshots,
    compareSnapshotItems: snapshotConfig.compareSnapshotItems,
    reduceSnapshotItems: snapshotConfig.reduceSnapshotItems,
    mapSnapshotWithDetails: snapshotConfig.mapSnapshotWithDetails,


    // Snapshot Data Management
    mappedSnapshotData: snapshotConfig.mappedSnapshotData,
    getSnapshotData: snapshotConfig.getSnapshotData,
    getSnapshotKeys: snapshotConfig.getSnapshotKeys,
    getSnapshotValuesSuccess: snapshotConfig.getSnapshotValuesSuccess,
    getSnapshotEntries: snapshotConfig.getSnapshotEntries,
    getAllSnapshotEntries: snapshotConfig.getAllSnapshotEntries,
    getSnapshotWithCriteria: snapshotConfig.getSnapshotWithCriteria,
    getSnapshotItemsSuccess: snapshotConfig.getSnapshotItemsSuccess,
    getSnapshotItemSuccess: snapshotConfig.getSnapshotItemSuccess,
    getAllValues: snapshotConfig.getAllValues,
    getSnapshotConfigItems: snapshotConfig.getSnapshotConfigItems,

    // Snapshot Identification
    getSnapshotIdSuccess: snapshotConfig.getSnapshotIdSuccess,

    // Task Management
    taskIdToAssign: snapshotConfig.taskIdToAssign,

    // Hierarchical Management
    parentId: snapshotConfig.parentId,
    childIds: snapshotConfig.childIds,

    // Snapshot Management
    defaultSubscribeToSnapshot: snapshotConfig.defaultSubscribeToSnapshot,
    handleSubscribeToSnapshot: snapshotConfig.handleSubscribeToSnapshot,
    removeItem: snapshotConfig.removeItem,
    getSnapshot: snapshotConfig.getSnapshot,
    setItem: snapshotConfig.setItem,
    getItem: snapshotConfig.getItem ?? (() => Promise.resolve(undefined)),
    getDataStore: snapshotConfig.getDataStore ?? (() => ({} as any)),
    getDataStoreMap: snapshotConfig.getDataStoreMap ?? (() => new Map()),
    addSnapshotSuccess: snapshotConfig.addSnapshotSuccess ?? (() => { }),
    deepCompare: snapshotConfig.deepCompare ?? (() => false),
    shallowCompare: snapshotConfig.shallowCompare ?? (() => false),
    getDataStoreMethods: snapshotConfig.getDataStoreMethods,
    getDelegate: snapshotConfig.getDelegate,
    determineCategory: snapshotConfig.determineCategory,
    determinePrefix: snapshotConfig.determinePrefix,
    removeSnapshot: snapshotConfig.removeSnapshot,
    addSnapshotItem: snapshotConfig.addSnapshotItem,
    addNestedStore: snapshotConfig.addNestedStore,
    clearSnapshots: snapshotConfig.clearSnapshots,
    addSnapshot: snapshotConfig.addSnapshot,
    emit: snapshotConfig.emit,
    createSnapshot: snapshotConfig.createSnapshot,
    createInitSnapshot: snapshotConfig.createInitSnapshot,
    addStoreConfig: snapshotConfig.addStoreConfig,
    handleSnapshotConfig: snapshotConfig.handleSnapshotConfig,
    getSnapshotConfig: snapshotConfig.getSnapshotConfig,
    getSnapshotListByCriteria: snapshotConfig.getSnapshotListByCriteria,
    setSnapshotSuccess: snapshotConfig.setSnapshotSuccess,
    setSnapshotFailure: snapshotConfig.setSnapshotFailure,
    updateSnapshots: snapshotConfig.updateSnapshots,
    updateSnapshotsSuccess: snapshotConfig.updateSnapshotsSuccess,
    updateSnapshotsFailure: snapshotConfig.updateSnapshotsFailure,
    initSnapshot: snapshotConfig.initSnapshot,
    takeSnapshot: snapshotConfig.takeSnapshot,
    takeSnapshotSuccess: snapshotConfig.takeSnapshotSuccess,
    takeSnapshotsSuccess: snapshotConfig.takeSnapshotsSuccess,
    flatMap: snapshotConfig.flatMap,
    validateSnapshot: snapshotConfig.validateSnapshot,
    handleActions: snapshotConfig.handleActions,
    setSnapshot: snapshotConfig.setSnapshot,
    transformSnapshotConfig: snapshotConfig.transformSnapshotConfig,
    setSnapshots: snapshotConfig.setSnapshots,
    clearSnapshot: snapshotConfig.clearSnapshot,
    mergeSnapshots: snapshotConfig.mergeSnapshots,
    reduceSnapshots: snapshotConfig.reduceSnapshots,
    sortSnapshots: snapshotConfig.sortSnapshots,
    filterSnapshots: snapshotConfig.filterSnapshots,
    findSnapshot: snapshotConfig.findSnapshot,
    getSubscribers: snapshotConfig.getSubscribers,
    notify: snapshotConfig.notify,
    notifySubscribers: snapshotConfig.notifySubscribers,
    getSnapshots: snapshotConfig.getSnapshots,
    getAllSnapshots: snapshotConfig.getAllSnapshots,
    generateId: snapshotConfig.generateId,

    // Batch Operations
    batchFetchSnapshots: snapshotConfig.batchFetchSnapshots,
    batchTakeSnapshotsRequest: snapshotConfig.batchTakeSnapshotsRequest,
    batchUpdateSnapshotsRequest: snapshotConfig.batchUpdateSnapshotsRequest,
    filterSnapshotsByStatus: snapshotConfig.filterSnapshotsByStatus,
    filterSnapshotsByCategory: snapshotConfig.filterSnapshotsByCategory,
    filterSnapshotsByTag: snapshotConfig.filterSnapshotsByTag,
    batchFetchSnapshotsSuccess: snapshotConfig.batchFetchSnapshotsSuccess,
    batchFetchSnapshotsFailure: snapshotConfig.batchFetchSnapshotsFailure,
    batchUpdateSnapshotsSuccess: snapshotConfig.batchUpdateSnapshotsSuccess,
    batchUpdateSnapshotsFailure: snapshotConfig.batchUpdateSnapshotsFailure,
    batchTakeSnapshot: snapshotConfig.batchTakeSnapshot,
    handleSnapshotSuccess: snapshotConfig.handleSnapshotSuccess,

    // Snapshot Identification & Comparison
    getSnapshotId: snapshotConfig.getSnapshotId,
    compareSnapshotState: snapshotConfig.compareSnapshotState,
    eventRecords: snapshotConfig.eventRecords,
    snapshotStore: snapshotConfig.snapshotStore,

    // Hierarchical Management
    getParentId: snapshotConfig.getParentId,
    getChildIds: snapshotConfig.getChildIds,
    addChild: snapshotConfig.addChild,
    removeChild: snapshotConfig.removeChild,
    getChildren: snapshotConfig.getChildren,
    hasChildren: snapshotConfig.hasChildren,
    isDescendantOf: snapshotConfig.isDescendantOf,

    // Data Management
    dataItems: snapshotConfig.dataItems,
    payload: snapshotConfig.payload,
    newData: snapshotConfig.newData,
    getInitialState: snapshotConfig.getInitialState,
    getConfigOption: snapshotConfig.getConfigOption,
    getTimestamp: snapshotConfig.getTimestamp,
    getStores: snapshotConfig.getStores,
    getData: snapshotConfig.getData,
    setData: snapshotConfig.setData,
    addData: snapshotConfig.addData,
    stores: snapshotConfig.stores,
    getStore: snapshotConfig.getStore,
    addStore: snapshotConfig.addStore,
    mapSnapshot: snapshotConfig.mapSnapshot,
    mapSnapshots: snapshotConfig.mapSnapshots,
    removeStore: snapshotConfig.removeStore,

    // Subscription & Notification Management
    subscribe: item.subscribe,
    unsubscribe: snapshotConfig.unsubscribe,
    fetchSnapshotFailure: snapshotConfig.fetchSnapshotFailure,
    fetchSnapshot: snapshotConfig.fetchSnapshot,
    addSnapshotFailure: snapshotConfig.addSnapshotFailure,
    configureSnapshotStore: snapshotConfig.configureSnapshotStore,
    fetchSnapshotSuccess: snapshotConfig.fetchSnapshotSuccess,
    updateSnapshotFailure: snapshotConfig.updateSnapshotFailure,
    updateSnapshotSuccess: snapshotConfig.updateSnapshotSuccess,
    createSnapshotFailure: snapshotConfig.createSnapshotFailure,
    createSnapshotSuccess: snapshotConfig.createSnapshotSuccess,
    createSnapshots: snapshotConfig.createSnapshots,
    onSnapshot: snapshotConfig.onSnapshot,
    onSnapshots: snapshotConfig.onSnapshots,
    updateSnapshot: snapshotConfig.updateSnapshot,
  };

  return snapshotItem;
};

export default transformDataToSnapshot;

