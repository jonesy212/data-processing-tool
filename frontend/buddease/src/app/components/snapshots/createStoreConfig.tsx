// createStoreConfig.tsx
import { ConvertMeta } from '@/app/components/models/data/dataStoreMethods';
import {
    SnapshotUnion,
    SnapshotsArray
} from "@/app/components/snapshots/LocalStorageSnapshotStore";
import { Snapshot } from "@/app/components/snapshots/Snapshot";

import { SnapshotStoreConfig } from '@/app/components/snapshots/SnapshotStoreConfig';


import { StructuredMetadata } from "@/app/configs/StructuredMetadata";

import { BaseDataEntity } from '@/app/configs/BaseConfig';
import { T } from "../models/data/dataStoreMethods";
import { RealtimeDataItem } from "../models/realtime/RealtimeData";
import { DataStoreWithSnapshotMethods } from "../projects/DataAnalysisPhase/DataProcessing/ DataStoreMethods";
import { InitializedState } from "../projects/DataAnalysisPhase/DataProcessing/DataStore";
import CalendarManagerStoreClass from "../state/stores/CalendarManagerStore";
import { convertMetadata } from './convertMetadata';
import { ConfigureSnapshotStorePayload } from "./SnapshotConfig";

// SnapshotStore.ts

// Function to transform config options
function createStoreConfig<
  U extends BaseDataEntity,  // ← Add <any>
  K extends U = U,
  Meta extends StructuredMetadata<U, K> = StructuredMetadata<U, K>,  // ← Add Meta
  ExcludedFields extends keyof U = never
>(
  config: SnapshotStoreConfig<U, K, Meta, ExcludedFields>  // ← Use Meta instead of StructuredMetadata<U, K>
): SnapshotStoreConfig<U, K, ConvertMeta<U, K>, ExcludedFields> {
  // Transform the data property
  const transformedData: U = transformData<U, K, Meta, ExcludedFields>(config.data as U);  // ← Add Meta and ExcludedFields

  // Use the boolean check to see if tempData is compatible
  const tempData = isCompatibleTempData<U, K, Meta, ExcludedFields>(config.tempData) ? config.tempData : undefined;  // ← Add Meta and ExcludedFields

  // Transform tempData with type guard
  const transformedTempData: U | undefined = config.tempData && isCompatibleTempData<U, K, Meta, ExcludedFields>(config.tempData)
    ? transformData<U, K, Meta, ExcludedFields>(config.tempData as U)  // ← Add Meta and ExcludedFields
    : undefined;

  // Transform the options property
  const transformedOptions = config.options
    ? {
        ...config.options,
        initialState: transformInitialState<U, K, Meta, ExcludedFields>(config.options.initialState),  // ← Add ExcludedFields
      }
    : undefined;

  // Update ConvertSnapshot type helper
  type ConvertSnapshot<
    U extends BaseDataEntity,  // ← Change Data<U> to BaseDataEntity
    K extends U = U, 
    Meta extends StructuredMetadata<U, K> = StructuredMetadata<U, K>,
    ExcludedFields extends keyof U = never
  > = U extends K ? Snapshot<U, K, Meta, ExcludedFields> : Snapshot<U, K, Meta, ExcludedFields>;

  // Transform the snapshotStore property
  const transformedSnapshotStore = (
    snapshotStore: SnapshotStore<U, K, Meta, ExcludedFields>,  // ← Add Meta and ExcludedFields
    snapshotId: string,
    data: Map<string, Snapshot<U, K, Meta, ExcludedFields>>,  // ← Add Meta and ExcludedFields
    events: Record<string, CalendarManagerStoreClass<U, K, Meta>[]>,  // ← Add Meta
    dataItems: RealtimeDataItem<T, K, Meta, ExcludedFields>[],
    newData: Snapshot<U, K, Meta, ExcludedFields>,  // ← Add Meta and ExcludedFields
    payload: ConfigureSnapshotStorePayload<U, K, Meta, ExcludedFields>,  // ← Add Meta and ExcludedFields
    store: SnapshotStore<any, any, any, any>,  // ← Use any for compatibility
    callback: (snapshotStore: SnapshotStore<U, K, Meta, ExcludedFields>) => void  // ← Add Meta and ExcludedFields
  ): void | null => {
    // Implementation
  }

  // Transform dataStoreMethods
  const transformedDataStoreMethods: Partial<DataStoreWithSnapshotMethods<U, K, ConvertMeta<U, K>, ExcludedFields>> | undefined =  // ← Add ExcludedFields
    config.dataStoreMethods ? transformDataStoreMethods(config.dataStoreMethods) : undefined;

  // Transform snapshots
  const transformedSnapshots: SnapshotsArray<U, K, Meta, ExcludedFields> = config.snapshots.map(  // ← Add ExcludedFields
    (snapshot) => ({
      ...snapshot,
      metadata: convertMetadata<U, K, Meta>(snapshot.metadata),
    }) as SnapshotUnion<U, K, Meta, ExcludedFields>  // ← Add ExcludedFields
  );

  return {
    // ...transformedData,

    subscribeToSnapshotWithMetadata: config.subscribeToSnapshotWithMetadata,
    id: config.id, 
    createdBy: config.createdBy, 
    category: config.category,
    data: transformedData,
    snapshots: transformedSnapshots,  
    tempData: transformedTempData,
    options: transformedOptions,
    snapshotStore: transformedSnapshotStore,
    dataStoreMethods: transformedDataStoreMethods,
    
    isCore: config.isCore,
    configId: config.configId,
    getSnapshotConfig: config.getSnapshotConfig,
    isSubscribed: config.isSubscribed,
    getSnapshotManager: config.getSnapshotManager,
    callback: config.callback,
    batchUpdateSnapshotsSuccess: config.batchUpdateSnapshotsSuccess,
    configureSnap: config.configureSnap,
    manageSubscription: config.manageSubscription,
    subscribeToSnapshotList: config.subscribeToSnapshotList,
    unsubscribeFromSnapshot: config.unsubscribeFromSnapshot,
    subscribeToSnapshotsSuccess: config.subscribeToSnapshotsSuccess,
    unsubscribeFromSnapshots: config.unsubscribeFromSnapshots,

    removeSubscriber: config.removeSubscriber,
    addSnapshotSubscriber: config.addSnapshotSubscriber,
    removeSnapshotSubscriber: config.removeSnapshotSubscriber,
    transformSubscriber: config.transformSubscriber,

    defaultSubscribeToSnapshots: config.defaultSubscribeToSnapshots,
    getSnapshotsBySubscriber: config.getSnapshotsBySubscriber,
    getSnapshotsBySubscriberSuccess: config.getSnapshotsBySubscriberSuccess,

    initialState: transformInitialState<U, K, StructuredMetadata<U, K>>(config.options?.initialState as InitializedState<U, K, StructuredMetadata<T, K>>),
    configOption: config.configOption as string | SnapshotStoreConfig<U, K, ConvertMeta<U, K>, ExcludedFields> | null,
    find: config.find,
    storeId: config.storeId,
    operation: config.operation,
    autoSave: config.autoSave,
    setSnapshotData: config.setSnapshotData,
    fetchSnapshotData: config.fetchSnapshotData, 
    syncInterval: config.syncInterval,
    snapshotLimit: config.snapshotLimit,
    additionalSetting: config.additionalSetting,
    snapshotId: config.snapshotId,
    loadConfig: config.loadConfig,
    saveConfig: config.saveConfig,
    logError: config.logError,
    handleSnapshotError: config.handleSnapshotError,
    resetErrorState: config.resetErrorState,
  
    criteria: config.criteria,
    content: config.content,
    config: config.config,
    snapshotCategory: config.snapshotCategory,
    snapshotSubscriberId: config.snapshotSubscriberId,
    snapshotContent: config.snapshotContent,
    

    takeSnapshotSuccess: config.takeSnapshotSuccess,
    updateSnapshotFailure: config.updateSnapshotFailure,
    takeSnapshotsSuccess: config.takeSnapshotsSuccess,
    fetchSnapshot: config.fetchSnapshot,
    
    addSnapshotToStore: config.addSnapshotToStore,
    getSnapshotSuccess: config.getSnapshotSuccess,
    setSnapshotSuccess: config.setSnapshotSuccess,
    setSnapshotFailure: config.setSnapshotFailure,
   
    updateSnapshotSuccess: config.updateSnapshotSuccess,
    updateSnapshotsSuccess: config.updateSnapshotsSuccess,
    fetchSnapshotSuccess: config.fetchSnapshotSuccess,
    updateSnapshotForSubscriber: config.updateSnapshotForSubscriber,
   
    updateMainSnapshots: config.updateMainSnapshots,
    batchProcessSnapshots: config.batchProcessSnapshots,
    batchUpdateSnapshots: config.batchUpdateSnapshots,
    batchFetchSnapshotsRequest: config.batchFetchSnapshotsRequest,
   
    batchTakeSnapshotsRequest: config.batchTakeSnapshotsRequest,
    batchUpdateSnapshotsRequest: config.batchUpdateSnapshotsRequest,
    batchFetchSnapshots: config.batchFetchSnapshots,
    getData: config.getData,
    
    batchFetchSnapshotsSuccess: config.batchFetchSnapshotsSuccess,
    batchFetchSnapshotsFailure: config.batchFetchSnapshotsFailure,
    batchUpdateSnapshotsFailure: config.batchUpdateSnapshotsFailure,
    notifySubscribers: config.notifySubscribers,
   
    notify: config.notify,
    getCategory: config.getCategory,
    schema: config.schema,
    updateSnapshots: config.updateSnapshots,
    
    updateSnapshotsFailure: config.updateSnapshotsFailure,
    flatMap: config.flatMap,
    setData: config.setData,
    getState: config.getState,
    
    setState: config.setState,
    handleActions: config.handleActions,
    setSnapshots: config.setSnapshots,
    mergeSnapshots: config.mergeSnapshots,
   
    reduceSnapshots: config.reduceSnapshots,
    sortSnapshots: config.sortSnapshots,
    filterSnapshots: config.filterSnapshots,
    findSnapshot: config.findSnapshot,
   
    fetchSnapshotFailure: config.fetchSnapshotFailure,
    generateId: config.generateId,
    
    subscribers: config.subscribers,
    subscribe: config.subscribe,
    unsubscribe: config.unsubscribe,
    getSnapshotId: config.getSnapshotId,
    snapshot: config.snapshot,
    createSnapshot: config.createSnapshot,
    
    createSnapshotStore: config.createSnapshotStore,
    updateSnapshotStore: config.updateSnapshotStore,
    configureSnapshot: config.configureSnapshot,
    configureSnapshotStore: config.configureSnapshotStore,
    
    createSnapshotSuccess: config.createSnapshotSuccess,
    createSnapshotFailure: config.createSnapshotFailure,
    batchTakeSnapshot: config.batchTakeSnapshot,
   
    onSnapshot: config.onSnapshot,
    onSnapshots: config.onSnapshots,
    onSnapshotStore: config.onSnapshotStore,
    snapshotData: config.snapshotData,
   
    mapSnapshot: config.mapSnapshot,
    createSnapshotStores: config.createSnapshotStores,
    initSnapshot: config.initSnapshot,
    subscribeToSnapshots: config.subscribeToSnapshots,
   
    clearSnapshot: config.clearSnapshot,
    clearSnapshotSuccess: config.clearSnapshotSuccess,
    handleSnapshotOperation: config.handleSnapshotOperation,
    displayToast: config.displayToast,
    
    addToSnapshotList: config.addToSnapshotList,
    addToSnapshotStoreList: config.addToSnapshotStoreList,
    fetchInitialSnapshotData: config.fetchInitialSnapshotData,
    updateSnapshot: config.updateSnapshot,
    
    getSnapshots: config.getSnapshots,
    getSnapshotItems: config.getSnapshotItems,
    takeSnapshot: config.takeSnapshot,
    takeSnapshotStore: config.takeSnapshotStore,
    
    addSnapshotSuccess: config.addSnapshotSuccess,
    removeSnapshot: config.removeSnapshot,
    getSubscribers: config.getSubscribers,
    addSubscriber: config.addSubscriber,
   
    validateSnapshot: config.validateSnapshot,
    getSnapshot: config.getSnapshot,
    getSnapshotContainer: config.getSnapshotContainer,
    getSnapshotVersions: config.getSnapshotVersions,
   
    fetchData: config.fetchData,
    versionedSnapshot: config.versionedSnapshot,
    getAllSnapshots: config.getAllSnapshots,
    getSnapshotStoreData: config.getSnapshotStoreData,
   

    delegate: config.delegate,
    getParentId: config.getParentId,
    getChildIds: config.getChildIds,
    clearSnapshotFailure: config.clearSnapshotFailure,
    mapSnapshots: config.mapSnapshots,
    state: config.state,
    getSnapshotById: config.getSnapshotById,
    handleSnapshot: config.handleSnapshot,
    meta: config.meta,
    initialBaseConfig: config.initialBaseConfig,
    useSimulatedDataSource: config.useSimulatedDataSource,
    simulatedDataSource: config.simulatedDataSource,
    
    baseURL: config.baseURL,
    enabled: config.enabled,
    maxRetries: config.maxRetries,
    retryDelay: config.retryDelay,
    
    maxAge: config.maxAge,
    staleWhileRevalidate: config.staleWhileRevalidate,
    cacheKey: config.cacheKey,
    eventRecords: config.eventRecords,
   
    records: config.records,
    date: config.date,
    type: config.type,
    snapshotStoreConfig: config.snapshotStoreConfig,
    
    callbacks: config.callbacks,
    subscribeToSnapshot: config.subscribeToSnapshot,
    unsubscribeToSnapshots: config.unsubscribeToSnapshots,
    unsubscribeToSnapshot: config.unsubscribeToSnapshot,
    
    getDelegate: config.getDelegate,
    getDataStoreMethods: config.getDataStoreMethods,
    snapshotMethods: config.snapshotMethods,
    handleSnapshotStoreOperation: config.handleSnapshotStoreOperation,
   
    [Symbol.iterator]: function* () {
      yield* Object.entries(this);
    },
    [Symbol.asyncIterator]: async function* () {
      for (const entry of Object.entries(this)) {
        yield entry;
      }
    },
  } as SnapshotStoreConfig<U, K, ConvertMeta<U, K>, ExcludedFields>;
}