// createStoreConfig.tsx
import { ConvertMeta } from '@/app/models/data/dataStoreMethods';
import {
    SnapshotUnion,
    SnapshotsArray
} from "@/app/snapshots/LocalStorageSnapshotStore";
import { Snapshot } from "@/app/snapshots/Snapshot";

import { SnapshotStoreConfig } from '@/app/snapshots/SnapshotStoreConfig';


import { StructuredMetadata } from "@/config/StructuredMetadata";

import { InitializedState } from "@/app/projects/DataAnalysisPhase/DataProcessing/DataStore";
import { DataStoreWithSnapshotMethods } from "@/app/projects/DataAnalysisPhase/DataProcessing/DataStoreMethods";
import CalendarManagerStoreClass from "@/app/state/stores/CalendarManagerStore";
import { RealtimeDataItem } from '@/app/typings/realtimeTypes';
import { BaseDataEntity } from '@/config/BaseConfig';
import { convertMetadata } from '@/convertMetadata';
import { ConfigureSnapshotStorePayload } from "./SnapshotConfig";

// SnapshotStore.ts

// Function to transform config options
function createStoreConfig<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = never,
  IncludedFields extends keyof T = keyof T
>(
  config: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
): SnapshotStoreConfig<T, K, ConvertMeta<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, ExcludedFields> {
  
  const transformedData: T = transformData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>(
    config.data as T
  );

  const tempData = isCompatibleTempData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>(
    config.tempData
  ) ? config.tempData : undefined;

  const transformedTempData: T | undefined =
    config.tempData && isCompatibleTempData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>(
      config.tempData
    )
      ? transformData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>(
          config.tempData as T
        )
      : undefined;

  // Transform the options property
 const transformedOptions = config.options
    ? {
        ...config.options,
        initialState: transformInitialState<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>(
          config.options.initialState
        ),
      }
    : undefined;

  type ConvertSnapshot<
    U extends BaseDataEntity,
    K extends U = U,
    Meta extends StructuredMetadata<U, K> = StructuredMetadata<U, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof U = never,
    IncludedFields extends keyof U = keyof U
  > = U extends K ? Snapshot<U, K, Meta, AttachmentType, ExcludedFields, IncludedFields> : Snapshot<U, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;

  const transformedSnapshotStore = (
    snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshotId: string,
    data: Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
    events: Record<string, CalendarManagerStoreClass<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>,
    dataItems: RealtimeDataItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
    newData: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    payload: ConfigureSnapshotStorePayload<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    store: SnapshotStore<any, any, any, any, any, any>,
    callback: (snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void
  ): void | null => {
    // Implementation
  };

  
  // Transform dataStoreMethods
  const transformedDataStoreMethods: Partial<DataStoreWithSnapshotMethods<T, K, ConvertMeta<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, ExcludedFields>> | undefined =
    config.dataStoreMethods ? transformDataStoreMethods(config.dataStoreMethods) : undefined;

  // Transform snapshots
  const transformedSnapshots: SnapshotsArray<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = config.snapshots.map(
    (snapshot) => ({
      ...snapshot,
      metadata: convertMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>(snapshot.metadata),
    }) as SnapshotUnion<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
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

    initialState: transformInitialState<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>(
      config.options?.initialState as InitializedState<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
    ),
    configOption: config.configOption as string | SnapshotStoreConfig<T, K, ConvertMeta<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, ExcludedFields> | null,

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
  } as SnapshotStoreConfig<T, K, ConvertMeta<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, ExcludedFields>;
}