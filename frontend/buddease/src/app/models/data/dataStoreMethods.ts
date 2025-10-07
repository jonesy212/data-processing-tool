// dataStoreMethods.ts
import { DataStore } from "@/app/@/projects/DataAnalysisPhase/DataProcessing/DataStore";
import { CategoryProperties } from "@/app/pages/personas/ScenarioBuilder";
import { CriteriaType } from '@/app/pages/searchs/CriteriaType';
import { SnapshotConfig, SnapshotData, SnapshotItem, SnapshotOperationType, SnapshotStoreProps } from '@/app/snapshots';
import { Snapshots, SnapshotsArray, SnapshotsObject, SnapshotUnion } from "@/app/snapshots/LocalStorageSnapshotStore";
import { Snapshot } from "@/app/snapshots/Snapshot";
import { Subscriber } from "@/app/subscribers/Subscriber";
import { addToSnapshotList, isBaseData, isSnapshot } from '@/app/utils/snapshotUtils';
import { CustomHydrateResult } from "@/config/DocumentBuilderConfig";

import { StructuredMetadata } from '@/config/StructuredMetadata';
import { Attachment } from '@/app/documents/Attachment/attachment';
import useSecureStoreId from "@/app/hooks/useSecureStoreId";
import { Category } from "@/app/libraries/categories/generateCategoryProperties";
import { convertToArray } from '@/app/snapshots/createSnapshotStoreOptions';
import { SnapshotContainer } from "@/app/snapshots/SnapshotContainer";
import SnapshotStore from "@/app/snapshots/SnapshotStore";
import { SnapshotStoreConfig, UserConfig } from "@/app/snapshots/SnapshotStoreConfig";
import { InitializedData } from '@/app/snapshots/SnapshotStoreOptions';
import { storeProps } from '@/app/snapshots/SnapshotStoreProps';
import { SnapshotWithCriteria } from "@/app/snapshots/SnapshotWithCriteria";
import { useSnapshotStore, } from "@/app/snapshots/useSnapshotStore";
import { Version } from "@/app/versions/Version";
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/config/BaseConfig';
import { UnifiedMetadata, UnifiedMetaDataOptions } from "@/server/database/MetaDataOptions";
import { BaseData, Data } from "./Data";
import { StatusType } from "./StatusType";

// Assuming T is defined in your context
type T = BaseDataEntity; // Replace with the appropriate type if necessary
type K = T; // Use T or another type that extends BaseData


export type UserConfigData<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> = 
  UserConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  
  
type Meta<T extends BaseDataEntity, K extends T> = StructuredMetadata<T, K>;

type ConvertMeta<
  U extends BaseDataEntity,
  K extends U = U,
  MetaType extends DefaultMeta<U, K> = DefaultMeta<U, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof U = DefaultExcludedFields<U>,
  IncludedFields extends keyof U = keyof U
> = MetaType extends StructuredMetadata<U, K, MetaType, AttachmentType, ExcludedFields, IncludedFields>
  ? StructuredMetadata<U, K, MetaType, AttachmentType, ExcludedFields, IncludedFields>
  : never;

type ConvertMetadata<
  U extends BaseDataEntity,
  K extends U = U,
  MetaType extends DefaultMeta<U, K> = DefaultMeta<U, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof U = DefaultExcludedFields<U>,
  IncludedFields extends keyof U = keyof U
> = MetaType extends UnifiedMetadata<U, K, MetaType, AttachmentType, ExcludedFields, IncludedFields>
  ? UnifiedMetadata<U, K, MetaType, AttachmentType, ExcludedFields, IncludedFields>
  : MetaType;

// Unified metadata type
export type Metadata<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> = UnifiedMetaDataOptions<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;

const storeId = useSecureStoreId()

if (storeId === null) {
  throw new Error("Store id is null");
}



function createDefaultSnapshotWithCriteriaSafe<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  overrides?: Partial<SnapshotWithCriteria<T, K, MetaType, AttachmentType, ExcludedFields, IncludedFields>>
): SnapshotWithCriteria<T, K, MetaType, AttachmentType, ExcludedFields, IncludedFields> {

  // Create base object with required properties
  const baseSnapshot = {
    id: overrides?.id ?? '',
    createdAt: overrides?.createdAt ?? new Date(),
    updatedAt: overrides?.updatedAt ?? new Date(),
    deleted: overrides?.deleted ?? false,
    isCore: overrides?.isCore ?? false,
    isDeleted: overrides?.isDeleted ?? false,
    isModified: overrides?.isModified ?? false,
    isNew: overrides?.isNew ?? true,
    isPersisted: overrides?.isPersisted ?? false,
    isRemoved: overrides?.isRemoved ?? false,
    isSaved: overrides?.isSaved ?? false,
    isSnapshot: overrides?.isSnapshot ?? true,
    isTransient: overrides?.isTransient ?? false,
    isUpdated: overrides?.isUpdated ?? false,
    isValid: overrides?.isValid ?? true,
    snapshotId: overrides?.snapshotId ?? '',
    snapshotType: overrides?.snapshotType ?? 'default',
    state: overrides?.state ?? 'active',
    timestamp: overrides?.timestamp ?? new Date().toISOString(),
    version: overrides?.version ?? 0,
  };

  // Create complex objects with proper typing
  const complexObjects = {
    dataObject: overrides?.dataObject ?? ({} as T),
    initialState: overrides?.initialState ?? ({} as Partial<T>),
    originalData: overrides?.originalData ?? ({} as Partial<T>),
    metadata: overrides?.metadata ?? (undefined as unknown as MetaType),
    criteria: overrides?.criteria ?? { filters: [], limit: 0, offset: 0, sort: [] },
    analysisType: overrides?.analysisType ?? undefined,
    events: overrides?.events ?? undefined,
    subscribers: overrides?.subscribers ?? [],
    tags: overrides?.tags ?? [],
    snapshots: overrides?.snapshots ?? undefined,
    delegate: overrides?.delegate ?? {
      id: 'default-delegate',
      type: 'default',
      metadata: undefined as unknown as MetaType,
      methods: {}
    },
  };

  return {
    ...baseSnapshot,
    ...complexObjects,
    ...overrides
  } as SnapshotWithCriteria<T, K, MetaType, AttachmentType, ExcludedFields, IncludedFields>;
}


const configTransform = <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  config: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
): SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> => {
  // Map the input `config` to a `SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>`
  return {
    // Optional properties
    id: config.id,
    storeId: config.storeId,
    find: config.find,
    configId: config.configId,
    getSnapshotManager: config.getSnapshotManager,
    callback: config.callback,
    isCore: config.isCore,
    operation: config.operation,
    initialBaseConfig: config.initialBaseConfig,
    snapshotManager: config.snapshotManager,
    payload: config.payload,
    snapshotStoreData: config.snapshotStoreData,
    logging: config.logging,
    autoSync: config.autoSync,
    name: config.name,
    options: config.options,
    title: config.title,
    description: config.description,
    data: config.data,
    createdAt: config.createdAt,
    updatedAt: config.updatedAt,
    meta: config.meta,
    autoSave: config.autoSave,
    syncInterval: config.syncInterval,
    snapshotLimit: config.snapshotLimit,
    additionalSetting: config.additionalSetting,
    timestamp: config.timestamp,
    createdBy: config.createdBy,
    snapshotId: config.snapshotId,
    currentCategory: config.currentCategory,
    snapshotStore: config.snapshotStore,
    taskIdToAssign: config.taskIdToAssign,
    clearSnapshots: config.clearSnapshots,
    key: config.key,
    topic: config.topic,
    dataStoreMethods: config.dataStoreMethods,
    category: config.category,
    criteria: config.criteria,
    length: config.length,
    content: config.content,
    privacy: config.privacy,
    snapshotConfig: config.snapshotConfig,
    snapshotCategory: config.snapshotCategory,
    snapshotContent: config.snapshotContent,
    store: config.store,
    snapshots: config.snapshots,
    delegate: config.delegate,
    getParentId: config.getParentId,
    getChildIds: config.getChildIds,
    set: config.set,
    setStore: config.setStore,
    state: config.state,
    getSnapshotById: config.getSnapshotById,
    onInitialize: config.onInitialize,
    setSnapshotData: config.setSnapshotData,
    handleSnapshot: config.handleSnapshot,
    getSnapshotId: config.getSnapshotId,
    fetchSnapshotData: config.fetchSnapshotData,
    snapshot: config.snapshot,
    createSnapshot: config.createSnapshot,
    actions: config.actions,
    setSnapshot: config.setSnapshot,
    setSnapshotStore: config.setSnapshotStore,
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
    displayToast: config.displayToast,
    addToSnapshotStoreList: config.addToSnapshotStoreList,
    fetchInitialSnapshotData: config.fetchInitialSnapshotData,
    updateSnapshot: config.updateSnapshot,
    getSnapshots: config.getSnapshots,
    mergeSnapshots: config.mergeSnapshots,
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
    mapSnapshots: config.mapSnapshots,
    getAllSnapshots: config.getAllSnapshots,
    getSnapshotStoreData: config.getSnapshotStoreData,
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
    batchUpdateSnapshotsSuccess: config.batchUpdateSnapshotsSuccess,
    batchUpdateSnapshotsRequest: config.batchUpdateSnapshotsRequest,
    batchFetchSnapshots: config.batchFetchSnapshots,
    getData: config.getData,
    batchFetchSnapshotsSuccess: config.batchFetchSnapshotsSuccess,
    batchFetchSnapshotsFailure: config.batchFetchSnapshotsFailure,
    batchUpdateSnapshotsFailure: config.batchUpdateSnapshotsFailure,
    getCategory: config.getCategory,
    expirationDate: config.expirationDate,
    isExpired: config.isExpired,
    priority: config.priority,
    tags: config.tags,
    metadata: config.metadata,
    status: config.status,
    isCompressed: config.isCompressed,
    compress: config.compress,
    isEncrypted: config.isEncrypted,
    encrypt: config.encrypt,
    decrypt: config.decrypt,
    ownerId: config.ownerId,
    getOwner: config.getOwner,
    version: config.version,
    schema: config.schema,
    previousVersionId: config.previousVersionId,
    nextVersionId: config.nextVersionId,
    auditTrail: config.auditTrail,
    addAuditRecord: config.addAuditRecord,
    retentionPolicy: config.retentionPolicy,
    dependencies: config.dependencies,
    useSimulatedDataSource: config.useSimulatedDataSource,
    simulatedDataSource: config.simulatedDataSource,
    updateSnapshots: config.updateSnapshots,
    updateSnapshotStore: config.updateSnapshotStore,
    updateSnapshotsFailure: config.updateSnapshotsFailure,
    flatMap: config.flatMap,
    setData: config.setData,
    getState: config.getState,
    setState: config.setState,
    handleActions: config.handleActions,
    setSnapshots: config.setSnapshots,
    reduceSnapshots: config.reduceSnapshots,
    sortSnapshots: config.sortSnapshots,
    filterSnapshots: config.filterSnapshots,
    findSnapshot: config.findSnapshot,
    fetchSnapshotFailure: config.fetchSnapshotFailure,
    generateId: config.generateId,
    subscriberManagement: config.subscriberManagement,
    baseURL: config.baseURL,
    enabled: config.enabled,
    maxRetries: config.maxRetries,
    retryDelay: config.retryDelay,
    maxAge: config.maxAge,
    staleWhileRevalidate: config.staleWhileRevalidate,
    cacheKey: config.cacheKey,
    initialState: config.initialState,
    eventRecords: config.eventRecords,
    records: config.records,
    date: config.date,
    type: config.type,
    callbacks: config.callbacks,
    subscribeToSnapshots: config.subscribeToSnapshots,
    subscribeToSnapshot: config.subscribeToSnapshot,
    subscribeToSnapshotWithMetadata: config.subscribeToSnapshotWithMetadata,
    unsubscribeToSnapshots: config.unsubscribeToSnapshots,
    unsubscribeToSnapshot: config.unsubscribeToSnapshot,
    getDelegate: config.getDelegate,
    initSnapshot: config.initSnapshot,
    createSnapshotStore: config.createSnapshotStore,
    getDataStoreMethods: config.getDataStoreMethods,
    snapshotMethods: config.snapshotMethods,
    handleSnapshotOperation: config.handleSnapshotOperation,
    handleSnapshotStoreOperation: config.handleSnapshotStoreOperation,
    addToSnapshotList: config.addToSnapshotList,
    getSnapshotConfig: config.getSnapshotConfig,
    configureSnap: config.configureSnap,
    config: config.config,
    loadConfig: config.loadConfig,
    saveConfig: config.saveConfig,
    clearSnapshotFailure: config.clearSnapshotFailure,
    logError: config.logError,
    handleSnapshotError: config.handleSnapshotError,
    resetErrorState: config.resetErrorState,
    subscribers: config.subscribers,
    snapshotSubscriberId: config.snapshotSubscriberId,
    isSubscribed: config.isSubscribed,
    notifySubscribers: config.notifySubscribers,
    notify: config.notify,
    subscribe: config.subscribe,
    manageSubscription: config.manageSubscription,
    subscribeToSnapshotList: config.subscribeToSnapshotList,
    unsubscribeFromSnapshot: config.unsubscribeFromSnapshot,
    subscribeToSnapshotsSuccess: config.subscribeToSnapshotsSuccess,
    unsubscribeFromSnapshots: config.unsubscribeFromSnapshots,
    unsubscribe: config.unsubscribe,
    clearSnapshot: config.clearSnapshot,
    clearSnapshotSuccess: config.clearSnapshotSuccess,
    removeSubscriber: config.removeSubscriber,
    addSnapshotSubscriber: config.addSnapshotSubscriber,
    removeSnapshotSubscriber: config.removeSnapshotSubscriber,
    transformSubscriber: config.transformSubscriber,
    defaultSubscribeToSnapshots: config.defaultSubscribeToSnapshots,
    getSnapshotsBySubscriber: config.getSnapshotsBySubscriber,
    getSnapshotsBySubscriberSuccess: config.getSnapshotsBySubscriberSuccess,
    snapshotWithCriteria: config.snapshotWithCriteria,

    [Symbol.iterator]: config[Symbol.iterator],
    [Symbol.asyncIterator]: config[Symbol.asyncIterator],


    // Add other mappings as needed
  }
};

function createDefaultSnapshotStoreConfig<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(): SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  return {
    id: "defaultId",
    snapshotWithCriteria: createDefaultSnapshotWithCriteriaSafe<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>(), // Default criteria
    // Initialize other fields as needed
  };
}

// Create the default snapshot store config
const defaultSnapshotStoreConfig = createDefaultSnapshotStoreConfig();

const dataStoreMethods = <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(): {
  data: T | undefined;
  updateData: (id: number, newData: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;
  storage: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
  fetchData: (
    id: number,
    storeConfigProps: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ) => Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>;

  addData: (
    id: number,
    storeConfigProps: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ) => Promise<{
    id: number;
    title: string;
    content: string;
    status: StatusType;
  } | {}>;
} => {
  const storage: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] = [];

  return {
    data: undefined,
    storage: [] as SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
    addData: (
      id: number,
      storeConfigProps: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
    ): Promise<{} | {
      id: number,
      title: string,
      content: string,
      status: StatusType,
    }> => {
      return Promise.resolve({});
    },
    updateData: (id: number, newData: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => { },
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
    addDataSuccess: (payload: { data: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> }) => { },
    getDataVersions: async (id: number) => {
      // Implement logic to fetch data versions from a data source
      return undefined;
    },
    updateDataVersions: (id: number, versions: Snapshots<BaseDataEntity>) => { },
    getBackendVersion: () => {
      const conditionForHydrateResult = true; // Replace with actual condition

      if (conditionForHydrateResult) {
        const hydrateResult: CustomHydrateResult<number> = {
          storeKey: "dataStore",
          storeValue: 0,
          version: {} as Version<T, K, Meta>,
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

    // Mark the fetchData method as async
    // Assuming storeId is a parameter, filter `storage` by storeId if needed.
    fetchData: async (id: number, storeConfigProps: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => {

      // Find the relevant store if applicable (e.g., by id)
      const store = dataStoreMethods<T, K, Meta>()
        .storage.find((store) => store.id === id.toString()) as DataStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined;

      // If the store is found, retrieve properties from it
      if (store) {
        const {
          isSnapshotStoreConfig,
          generateId,
          findIndex,
          splice,
          transformSnapshotConfig,
          handleActions,
          delegate,
          transformedDelegate,
          ensureDelegate,
          handleDelegate,
          transformDelegate,
          notifySuccess,
          notifyFailure,
          compareSnapshotState,
          deepCompare,
          shallowCompare,
          compress,
          auditRecords,
          encrypt,
          decrypt,
          getTimestamp,
          isExpired,
          createdAt,
          getSnapshotsByTopic,
          getSnapshotsByKey,
          getSnapshotsByKeySuccess,
          getSnapshotsByPriority,
          getSnapshotsByPrioritySuccess,
          getStoreData,
          updateStoreData,
          updateDelegate,
          getSnapshotContainer,
          getSnapshotVersions,
          createSnapshot,
          criteria,
          defaultSubscribeToSnapshots,
          getDataStoreMap,
          addSnapshotItem,
          addNestedStore,
          emit,
          removeChild,
          getChildren,
          hasChildren,
          isDescendantOf,
          getInitialState,
          getConfigOption,

          getStores,
          getData,
          addStore,
          removeStore,
          createSnapshots,
          onSnapshot,
          restoreSnapshot,
          snapshotStoreConfig,
          config,
          dataStore,
          mapDataStore,
          snapshotStores,
          initialState,
          snapshotItems,
          nestedStores,
          snapshotIds,
          dataStoreMethods,
          getConfig,
          setConfig,
          getSnapshotItems,

          findSnapshotStoreById,
          defaultSaveSnapshotStore,
          saveSnapshotStore,

          events,
          subscriberId,
          length,
          value,
          todoSnapshotId,
          snapshotStore,
          dataItems,
          newData,
          storeId,
          defaultCreateSnapshotStores,
          createSnapshotStores,
          subscribeToSnapshots,
          executeSnapshotAction,
          subscribeToSnapshot,
          defaultOnSnapshots,
          onSnapshots,
          getSaveSnapshotStore,
          getSaveSnapshotStores,
          initializedState,
          transformedSubscriber,
          getSnapshotIds,
          getNestedStores,
          getFindSnapshotStoreById,
          getAllKeys,
          mapSnapshot,
          getAllItems,
          addData,
          addDataStatus,
          removeData,
          updateData,
          updateDataTitle,
          updateDataDescription,
          updateDataStatus,
          addDataSuccess,
          getDataVersions,
          updateDataVersions,
          getBackendVersion,
          getFrontendVersion,
          fetchData,
          defaultSubscribeToSnapshot,
          handleSubscribeToSnapshot,
          snapshot,
          removeItem,
          getSnapshot,
          getSnapshotById,
          getSnapshotSuccess,
          getSnapshotId,
          getSnapshotArray,
          getItem,
          setItem,
          addSnapshotFailure,
          addSnapshotSuccess,
          getParentId,
          getChildIds,
          addChild,

          getDataStoreMethods,
          getDelegate,
          determineCategory,
          determineSnapshotStoreCategory,
          determinePrefix,
          updateSnapshot,
          updateSnapshotSuccess,
          updateSnapshotFailure,
          removeSnapshot,
          clearSnapshots,
          addSnapshot,
          createInitSnapshot,
          createSnapshotSuccess,
          clearSnapshotSuccess,
          clearSnapshotFailure,
          createSnapshotFailure,
          setSnapshotSuccess,
          setSnapshotFailure,
          updateSnapshots,
          updateSnapshotsSuccess,
          updateSnapshotsFailure,
          initSnapshot,
          takeSnapshot,
          takeSnapshotSuccess,
          takeSnapshotsSuccess,
          configureSnapshotStore,
          updateSnapshotStore,
          flatMap,
          setData,
          getState,
          setState,
          validateSnapshot,
          handleSnapshot,
          setSnapshot,
          setSnapshotData,
          filterInvalidSnapshots,
          setSnapshots,
          clearSnapshot,
          mergeSnapshots,
          reduceSnapshots,
          sortSnapshots,
          filterSnapshots,
          mapSnapshotsAO,
          mapSnapshots,
          findSnapshot,
          getSubscribers,
          notify,

          notifySubscribers,
          subscribe,
          unsubscribe,
          fetchSnapshot,
          fetchSnapshotSuccess,
          fetchSnapshotFailure,
          getSnapshots,
          getAllSnapshots,
          getSnapshotStoreData,
          batchFetchSnapshots,
          batchTakeSnapshotsRequest,
          batchUpdateSnapshotsRequest,
          batchFetchSnapshotsSuccess,
          batchFetchSnapshotsFailure,
          batchUpdateSnapshotsSuccess,
          batchUpdateSnapshotsFailure,
          batchTakeSnapshot,
          handleSnapshotSuccess,

          schema,
          addSnapshotToStore,
          getDataStore,

          getSnapshotsByDate,
          getSnapshotsByDateSuccess,
          getSnapshotsByOperation,
          getSnapshotsByOperationSuccess,

          additionalInfo,
          createdDate,
          modifiedDate,
          createdBy,
          modifiedBy,

          options,
          structuredMetadata,
          get,
          maxAge,

          expirationDate,
          initializeWithData,
          hasSnapshots,
          getEventsAsRecord,

          getStore,
          dataStores,
          getSnapshotStores,
          getItems,

          initializeDefaultConfigs,
          _saveSnapshotStores,
          consolidateMetadata,
          _saveSnapshotStore,

          defaultSaveSnapshotStores,
          safeCastSnapshotStore,
          getFirstDelegate,
          getInitialDelegate,

          transformInitialState,
          transformSnapshot,
          transformMappedSnapshotData,
          transformSnapshotStore,

          transformSnapshotMethod,
          getName,
          getVersion,
          getSchema,

          getSnapshotStoreConfig,
          defaultConfigs,
          items,
          payload,

          callback,
          storeProps,
          endpointCategory,
          getMetadata,

          getProjectMetadata,
          getStructuredMetadata,
          find,
          isCompatibleSnapshot,

          getTransformedSnapshot,
          getSavedSnapshotStore,
          getConfigs,
          getSavedSnapshotStores,

          getTransformedInitialState,
          getPayload,
          getCallback,
          getStoreProps,

          getEndpointCategory,
          setPayload,
          setCallback,
          setStoreProps,

          setEndpointCategory,
          addDebugInfo,
          storeTempData,
          getTempData,
          // [Symbol.iterator]: symbolIterator,
          // Access more properties here as needed
        } = store;

        return {
          id,
          title: store.title || "", // Placeholder if not defined
          content: store.content || "", // Placeholder if not defined
          status: store.status || StatusType.Active,
          // Assuming an enum type for status
          key: "",
          keys: [],
          topic: "",
          date: "",

          // Category Properties
          category: store.category || "default category",
          categoryProperties: {
            name: store.categoryProperties?.name || "General Category",
            description: store.categoryProperties?.description || "This is a category used for general purposes.",
            icon: store.categoryProperties?.icon || "icon-path.svg",
            color: store.categoryProperties?.color || "#FF5733",
            iconColor: store.categoryProperties?.iconColor || "#FFFFFF",
            isActive: store.categoryProperties?.isActive || true,
            isPublic: store.categoryProperties?.isPublic || true,
            isSystem: store.categoryProperties?.isSystem || false,
            isDefault: store.categoryProperties?.isDefault || false,
            isHidden: store.categoryProperties?.isHidden || false,
            isHiddenInList: store.categoryProperties?.isHiddenInList || false,
            UserInterface: store.categoryProperties?.UserInterface || ["UIComponent1", "UIComponent2"],
            DataVisualization: store.categoryProperties?.DataVisualization || ["Chart1", "Graph2"],
            Forms: store.categoryProperties?.Forms || {
              form1: "Form description 1",
              form2: "Form description 2",
            },
            Analysis: store.categoryProperties?.Analysis || ["AnalysisComponent1", "AnalysisComponent2"],
            Communication: store.categoryProperties?.Communication || ["Email", "Chat"],
            TaskManagement: store.categoryProperties?.TaskManagement || ["TaskBoard", "ToDoList"],
            Crypto: store.categoryProperties?.Crypto || ["CryptoWallet", "MarketTracker"],
            brandName: store.categoryProperties?.brandName || "CategoryBrand",
            brandLogo: store.categoryProperties?.brandLogo || "brand-logo.svg",
            brandColor: store.categoryProperties?.brandColor || "#336699",
            brandMessage: store.categoryProperties?.brandMessage || "This is a branded message for the category.",
          },



          // Message and Metadata
          message: store.message || "default message",
          timestamp: store.timestamp || "",
          meta: store.meta || "",
          eventRecords: store.eventRecords || {},

          // Snapshot and Subscriber Properties
          type: store.type || "",
          subscribers: store.subscribers || [],
          store: store,
          stores: store.stores || [],
          snapshots: store.snapshots || [],
          snapshotConfig: store.snapshotConfig || [],
          snapshotMethods: store.snapshotMethods || [],

          // Subscriber Transformation
          transformSubscriber: store.transformSubscriber || undefined,

          // State Management
          getState: store.getState || undefined,
          setState: store.setState || undefined,
          initializedState: store.initializedState || undefined,

          // Encryption and Compression
          compress: store.compress || undefined,
          auditRecords: store.auditRecords || undefined,
          encrypt: store.encrypt || undefined,
          decrypt: store.decrypt || undefined,

          // Snapshot Timing
          getTimestamp: store.getTimestamp || undefined,
          isExpired: store.isExpired || undefined,
          createdAt: store.createdAt || undefined,

          // Operation and Category
          operation: store.operation || { operationType: SnapshotOperationType.CreateSnapshot },

          // Other Utility Methods
          getSnapshotsBySubscriber: store.getSnapshotsBySubscriber || undefined,
          getSnapshotsBySubscriberSuccess: store.getSnapshotsBySubscriberSuccess || undefined,
          getSnapshotsByTopic: store.getSnapshotsByTopic || undefined,
          getSnapshotsByTopicSuccess: store.getSnapshotsByTopicSuccess || undefined,
          getSnapshotsByCategory: store.getSnapshotsByCategory || undefined,
          getSnapshotsByCategorySuccess: store.getSnapshotsByCategorySuccess || undefined,

          // Configurations
          config: store.getConfig ? await store.getConfig(storeConfigProps) : undefined,
          configs: store.configs || [],
          getConfig: store.getConfig,
          setConfig: store.setConfig,
          handleActions: store.handleActions,
          transformSnapshotConfig: store.transformSnapshotConfig,

          // Delegate Methods
          delegate: store.delegate,
          transformedDelegate: store.transformedDelegate,
          ensureDelegate: store.ensureDelegate,
          handleDelegate: store.handleDelegate,
          transformDelegate: store.transformDelegate,

          // Event Handling
          events: store.events || [],
          notify: store.notify,
          notifySuccess: store.notifySuccess,
          notifyFailure: store.notifyFailure,

          // Snapshot Comparison
          compareSnapshotState: store.compareSnapshotState,
          deepCompare: store.deepCompare,
          shallowCompare: store.shallowCompare,

          // Snapshot Management
          clearSnapshotSuccess: store.clearSnapshotSuccess,
          clearSnapshotFailure: store.clearSnapshotFailure,
          createSnapshotSuccess: store.createSnapshotSuccess,
          createSnapshotFailure: store.createSnapshotFailure,
          takeSnapshotsSuccess: store.takeSnapshotsSuccess,
          flatMap: store.flatMap,
          setSnapshot: store.setSnapshot,
          setSnapshotData: store.setSnapshotData,
          setSnapshots: store.setSnapshots,
          clearSnapshot: store.clearSnapshot,
          mergeSnapshots: store.mergeSnapshots,
          reduceSnapshots: store.reduceSnapshots,
          sortSnapshots: store.sortSnapshots,
          filterSnapshots: store.filterSnapshots,
          mapSnapshots: store.mapSnapshots,
          mapSnapshotsAO: store.mapSnapshotsAO,

          // Data Manipulation
          setData: store.setData,
          getData: store.getData,
          getAllKeys: store.getAllKeys,
          getInitialState: store.getInitialState,
          addStore: store.addStore,
          removeStore: store.removeStore,
          findSnapshot: store.findSnapshot,
          addDataSuccess: store.addDataSuccess,
          removeItem: store.removeItem,
          getItem: store.getItem,
          setItem: store.setItem,
          addChild: store.addChild,
          removeChild: store.removeChild,

          // Data Validation
          validateSnapshot: store.validateSnapshot,
          filterInvalidSnapshots: store.filterInvalidSnapshots,
          isSnapshotStoreConfig: store.isSnapshotStoreConfig,

          // ID and Mapping Utilities
          generateId: store.generateId,
          findIndex: store.findIndex,
          splice: store.splice,



          mapSnapshot: store.mapSnapshot || undefined,
          determinePrefix: store.determinePrefix || undefined,



          getSnapshotsByKey,
          getSnapshotsByKeySuccess,
          getSnapshotsByPriority,
          getSnapshotsByPrioritySuccess,
          getStoreData,
          updateStoreData,
          updateDelegate,
          getSnapshotContainer,
          getSnapshotVersions,
          createSnapshot,
          criteria,
          defaultSubscribeToSnapshots,
          getDataStoreMap,
          addSnapshotItem,
          addNestedStore,
          emit,
          getChildren,
          hasChildren,
          isDescendantOf,
          getConfigOption,
          getStores,
          createSnapshots,
          onSnapshot,
          restoreSnapshot,
          snapshotStoreConfig,
          dataStore,
          mapDataStore,
          snapshotStores,
          initialState,
          snapshotItems,
          nestedStores,
          snapshotIds,
          dataStoreMethods,

          getSnapshotItems,

          findSnapshotStoreById,
          defaultSaveSnapshotStore,
          saveSnapshotStore,

          subscriberId,
          length,
          value,
          todoSnapshotId,
          snapshotStore,
          dataItems,
          newData,
          storeId,
          defaultCreateSnapshotStores,
          createSnapshotStores,
          subscribeToSnapshots,
          executeSnapshotAction,
          subscribeToSnapshot,
          defaultOnSnapshots,
          onSnapshots,
          getSaveSnapshotStore,
          getSaveSnapshotStores,

          transformedSubscriber,
          getSnapshotIds,
          getNestedStores,
          getFindSnapshotStoreById,

          getAllItems,
          addData,
          addDataStatus,
          removeData,
          updateData,
          updateDataTitle,
          updateDataDescription,
          updateDataStatus,

          getDataVersions,
          updateDataVersions,
          getBackendVersion,
          getFrontendVersion,
          fetchData,
          defaultSubscribeToSnapshot,
          handleSubscribeToSnapshot,
          snapshot,

          getSnapshot,
          getSnapshotById,
          getSnapshotSuccess,
          getSnapshotId,
          getSnapshotArray,

          addSnapshotFailure,
          addSnapshotSuccess,
          getParentId,
          getChildIds,

          getDataStoreMethods,
          getDelegate,
          determineCategory,
          determineSnapshotStoreCategory,

          updateSnapshot,
          updateSnapshotSuccess,
          updateSnapshotFailure,
          removeSnapshot,
          clearSnapshots,
          addSnapshot,
          createInitSnapshot,

          setSnapshotSuccess,
          setSnapshotFailure,
          updateSnapshots,
          updateSnapshotsSuccess,
          updateSnapshotsFailure,
          initSnapshot,
          takeSnapshot,
          takeSnapshotSuccess,
          configureSnapshotStore,
          updateSnapshotStore,

          handleSnapshot,
          getSubscribers,
          notifySubscribers,
          subscribe,
          unsubscribe,
          fetchSnapshot,
          fetchSnapshotSuccess,
          fetchSnapshotFailure,
          getSnapshots,
          getAllSnapshots,
          getSnapshotStoreData,
          batchFetchSnapshots,
          batchTakeSnapshotsRequest,
          batchUpdateSnapshotsRequest,
          batchFetchSnapshotsSuccess,
          batchFetchSnapshotsFailure,
          batchUpdateSnapshotsSuccess,
          batchUpdateSnapshotsFailure,
          batchTakeSnapshot,
          handleSnapshotSuccess,

          name,
          schema,
          addSnapshotToStore,
          getDataStore,


          // // Symbol Iterator (for iteration purposes)
          // [Symbol.iterator]: undefined,
          // snapshotStore, snapshotContainers, snapshotContainersMap,

          // isAncestorOf, getDescendants, getAncestors, getRoot, getLeafs,

          getSnapshotsByDate,
          getSnapshotsByDateSuccess,
          getSnapshotsByOperation,
          getSnapshotsByOperationSuccess,
          additionalInfo,
          createdDate,
          modifiedDate,
          createdBy,
          modifiedBy,
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
          color: '',
          colorCoding: {},
          highlight: [],
          highlightColor: {},
          customSettings: {},
          includeType: "",
          includeTitle: [],

          options,
          structuredMetadata,
          get,
          maxAge,

          expirationDate,
          initializeWithData,
          hasSnapshots,
          getEventsAsRecord,

          getStore,
          dataStores,
          getSnapshotStores,
          getItems,

          initializeDefaultConfigs,
          _saveSnapshotStores,
          consolidateMetadata,
          _saveSnapshotStore,

          defaultSaveSnapshotStores,
          safeCastSnapshotStore,
          getFirstDelegate,
          getInitialDelegate,

          transformInitialState,
          transformSnapshot,
          transformMappedSnapshotData,
          transformSnapshotStore,

          transformSnapshotMethod,
          getName,
          getVersion,
          getSchema,

          getSnapshotStoreConfig,
          defaultConfigs,
          items,
          payload,

          callback,
          storeProps,
          endpointCategory,
          getMetadata,

          getProjectMetadata,
          getStructuredMetadata,
          find,
          isCompatibleSnapshot,

          getTransformedSnapshot,
          getSavedSnapshotStore,
          getConfigs,
          getSavedSnapshotStores,

          getTransformedInitialState,
          getPayload,
          getCallback,
          getStoreProps,

          getEndpointCategory,
          setPayload,
          setCallback,
          setStoreProps,

          setEndpointCategory,
          addDebugInfo,
          storeTempData,
          getTempData,

        };
      }
      // If no store is found, return an empty object or handle the case accordingly.
      return {};
    },

    getItem: (key: T): Promise<Snapshot<any, BaseDataEntity> | undefined> => {
      return new Promise((resolve, reject) => {
        const methods = dataStoreMethods<T, K, Meta>(); // Call the function to get the methods
        if (methods.storage?.length) {
          for (const store of methods.storage) {
            if (store.getItem) {
              const item = store.getItem(key);
              if (item) {
                item
                  .then((resolvedItem: SnapshotItem<any, any>) => {
                    if (resolvedItem) {
                      resolve(JSON.parse(resolvedItem as unknown as string));
                    } else {
                      resolve(undefined);
                    }
                  })
                  .catch((error: any) => {
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
      if (storage.length) {
        for (const store of storage) {
          if (store.removeItem) {
            await store.removeItem(key);
          }
        }
      } else {
        throw new Error("Storage is not defined or empty");
      }
    },

    getAllKeys: async ({
      storeId,
      snapshotId,
      category,
      timestamp,
      type,
      event,
      snapshotStore,
    }: {
      storeId: number;
      snapshotId: string;
      category?: symbol | string | Category;
      timestamp?: string | number | Date;
      type: string;
      event: Event;
      snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
    }): Promise<string[] | undefined> => {
      const keys: string[] = [];

      if (storage.length) {
        for (const store of storage) {
          if (
            store.id === storeId &&
            store.snapshotId === snapshotId &&
            store.category === category &&
            store.timestamp === timestamp &&
            store.type === type &&
            store.event === event &&
            store.snapshotStore === snapshotStore
          ) {
            if (Array.isArray(store.keys)) {
              keys.push(...store.keys);
            }
          }
        }
      } else {
        throw new Error("Storage is not defined or empty");
      }

      return keys.length ? keys : undefined;
    },

    getAllItems: async (
      storeId: number,
      snapshotId: string,
      category: Category | undefined,
      categoryProperties: CategoryProperties | undefined,
      snapshot: SnapshotUnion<T, K, Meta> | null,
      timestamp: string | number | Date | undefined,
      type: string,
      event: Event,
      id: number,
      snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      data: T
    ): Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]> => {
      try {
        const keys = await snapshotStore.getAllKeys(storeId, snapshotId, category, categoryProperties, snapshot, timestamp, type, event, id, snapshotStore, data);
        // Handle the case when keys is undefined
        if (!keys) {
          throw new Error("Failed to retrieve keys");
        }
        if (!keys.length) {
          return [];
        }

        const items: (Data<T> | undefined)[] = await Promise.all(
          keys.map(async (key: string) => { // Specify 'key' as a string or the appropriate type
            const typedKey = convertStringToT(key);
            const item = await snapshotStore.getItem(typedKey, id);
            return item;
          })
        );

        const filteredItems = items.filter(
          (item): item is BaseDataEntity => item !== undefined
        );

        return filteredItems.map(item => ({

          childIds: snapshotStore.childIds,
          snapshotCategory: snapshotStore.snapshotCategory,
          getSnapshotById: snapshotStore.getSnapshotById,
          isExpired: snapshotStore.isExpired,

          setSnapshotCategory: snapshotStore.setSnapshotCategory,
          getSnapshotCategory: snapshotStore.getSnapshotCategory,
          getSnapshotData: snapshotStore.getSnapshotData,
          deleteSnapshot: snapshotStore.deleteSnapshot,

          createdBy: snapshotStore.createdBy,
          initializeWithData: snapshotStore.initializeWithData,
          createdAt: snapshotStore.createdAt,


          items: snapshotStore.items,
          find: snapshotStore.find,
          snapConfig: snapshotStore.snapConfig,
          compareSnapshots: snapshotStore.compareSnapshots,
          compareSnapshotItems: snapshotStore.compareSnapshotItems,

          handleSnapshotFailure: snapshotStore.handleSnapshotFailure,
          getData: snapshotStore.getData,
          mapSnapshotWithDetails: snapshotStore.mapSnapshotWithDetails,
          equals: snapshotStore.equals,

          initializedState: snapshotStore.initializedState,
          takeLatestSnapshot: snapshotStore.takeLatestSnapshot,
          addSnapshotSubscriber: snapshotStore.addSnapshotSubscriber,
          removeSnapshotSubscriber: snapshotStore.removeSnapshotSubscriber,
          getSnapshotConfigItems: snapshotStore.getSnapshotConfigItems,
          executeSnapshotAction: snapshotStore.executeSnapshotAction,
          subscribeToSnapshot: snapshotStore.subscribeToSnapshot,
          unsubscribeFromSnapshot: snapshotStore.unsubscribeFromSnapshot,
          subscribeToSnapshotsSuccess: snapshotStore.subscribeToSnapshotsSuccess,
          unsubscribeFromSnapshots: snapshotStore.unsubscribeFromSnapshots,
          getSnapshotItemsSuccess: snapshotStore.getSnapshotItemsSuccess,
          getSnapshotItemSuccess: snapshotStore.getSnapshotItemSuccess,
          getSnapshotKeys: snapshotStore.getSnapshotKeys,
          getSnapshotIdSuccess: snapshotStore.getSnapshotIdSuccess,
          getSnapshotValuesSuccess: snapshotStore.getSnapshotValuesSuccess,
          getSnapshotWithCriteria: snapshotStore.getSnapshotWithCriteria,
          reduceSnapshotItems: snapshotStore.reduceSnapshotItems,
          subscribeToSnapshotList: snapshotStore.subscribeToSnapshotList,
          parentId: snapshotStore.parentId,
          getAllKeys: snapshotStore.getAllKeys,
          getAllItems: snapshotStore.getAllItems,
          addDataStatus: snapshotStore.addDataStatus,
          removeData: snapshotStore.removeData,
          updateData: snapshotStore.updateData,
          updateDataTitle: snapshotStore.updateDataTitle,
          updateDataDescription: snapshotStore.updateDataDescription,
          updateDataStatus: snapshotStore.updateDataStatus,
          addDataSuccess: snapshotStore.addDataSuccess,
          getDataVersions: snapshotStore.getDataVersions,
          updateDataVersions: snapshotStore.updateDataVersions,
          getBackendVersion: snapshotStore.getBackendVersion,
          getFrontendVersion: snapshotStore.getFrontendVersion,
          fetchData: snapshotStore.fetchData,
          defaultSubscribeToSnapshot: snapshotStore.defaultSubscribeToSnapshot,
          handleSubscribeToSnapshot: snapshotStore.handleSubscribeToSnapshot,
          removeItem: snapshotStore.removeItem,
          getSnapshot: snapshotStore.getSnapshot,
          getSnapshotSuccess: snapshotStore.getSnapshotSuccess,
          setItem: snapshotStore.setItem,
          getDataStore: snapshotStore.getDataStore,
          addSnapshotSuccess: snapshotStore.addSnapshotSuccess,
          deepCompare: snapshotStore.deepCompare,
          shallowCompare: snapshotStore.shallowCompare,
          getDataStoreMethods: snapshotStore.getDataStoreMethods,
          getDelegate: snapshotStore.getDelegate,
          determineCategory: snapshotStore.determineCategory,
          determinePrefix: snapshotStore.determinePrefix,
          removeSnapshot: snapshotStore.removeSnapshot,
          addSnapshotItem: snapshotStore.addSnapshotItem,
          addNestedStore: snapshotStore.addNestedStore,
          clearSnapshots: snapshotStore.clearSnapshots,
          addSnapshot: snapshotStore.addSnapshot,
          createSnapshot: snapshotStore.createSnapshot,
          createInitSnapshot: snapshotStore.createInitSnapshot,
          setSnapshotSuccess: snapshotStore.setSnapshotSuccess,
          setSnapshotFailure: snapshotStore.setSnapshotFailure,
          updateSnapshots: snapshotStore.updateSnapshots,
          updateSnapshotsSuccess: snapshotStore.updateSnapshotsSuccess,
          updateSnapshotsFailure: snapshotStore.updateSnapshotsFailure,
          initSnapshot: snapshotStore.initSnapshot,
          takeSnapshot: snapshotStore.takeSnapshot,
          takeSnapshotSuccess: snapshotStore.takeSnapshotSuccess,
          takeSnapshotsSuccess: snapshotStore.takeSnapshotsSuccess,
          flatMap: snapshotStore.flatMap,
          getState: snapshotStore.getState,
          setState: snapshotStore.setState,
          validateSnapshot: snapshotStore.validateSnapshot,
          handleActions: snapshotStore.handleActions,
          setSnapshot: snapshotStore.setSnapshot,
          transformSnapshotConfig: snapshotStore.transformSnapshotConfig,
          setSnapshots: snapshotStore.setSnapshots,
          clearSnapshot: snapshotStore.clearSnapshot,
          mergeSnapshots: snapshotStore.mergeSnapshots,
          reduceSnapshots: snapshotStore.reduceSnapshots,
          sortSnapshots: snapshotStore.sortSnapshots,
          filterSnapshots: snapshotStore.filterSnapshots,
          findSnapshot: snapshotStore.findSnapshot,
          getSubscribers: snapshotStore.getSubscribers,
          notify: snapshotStore.notify,
          notifySubscribers: snapshotStore.notifySubscribers,
          getSnapshots: snapshotStore.getSnapshots,
          getAllSnapshots: snapshotStore.getAllSnapshots,
          generateId: snapshotStore.generateId,
          batchFetchSnapshots: snapshotStore.batchFetchSnapshots,
          batchTakeSnapshotsRequest: snapshotStore.batchTakeSnapshotsRequest,
          batchUpdateSnapshotsRequest: snapshotStore.batchUpdateSnapshotsRequest,
          filterSnapshotsByStatus: snapshotStore.filterSnapshotsByStatus,
          filterSnapshotsByCategory: snapshotStore.filterSnapshotsByCategory,
          filterSnapshotsByTag: snapshotStore.filterSnapshotsByTag,
          batchFetchSnapshotsSuccess: snapshotStore.batchFetchSnapshotsSuccess,
          batchFetchSnapshotsFailure: snapshotStore.batchFetchSnapshotsFailure,
          batchUpdateSnapshotsSuccess: snapshotStore.batchUpdateSnapshotsSuccess,
          batchUpdateSnapshotsFailure: snapshotStore.batchUpdateSnapshotsFailure,
          batchTakeSnapshot: snapshotStore.batchTakeSnapshot,
          handleSnapshotSuccess: snapshotStore.handleSnapshotSuccess,
          getSnapshotId: snapshotStore.getSnapshotId,
          compareSnapshotState: snapshotStore.compareSnapshotState,
          eventRecords: snapshotStore.eventRecords,
          snapshotStore: snapshotStore.snapshotStore,
          getParentId: snapshotStore.getParentId,
          getChildIds: snapshotStore.getChildIds,
          addChild: snapshotStore.addChild,
          removeChild: snapshotStore.removeChild,
          getChildren: snapshotStore.getChildren,
          hasChildren: snapshotStore.hasChildren,
          isDescendantOf: snapshotStore.isDescendantOf,
          dataItems: snapshotStore.dataItems,
          newData: snapshotStore.newData,
          timestamp: snapshotStore.timestamp,
          getInitialState: snapshotStore.getInitialState,
          getConfigOption: snapshotStore.getConfigOption,
          getTimestamp: snapshotStore.getTimestamp,
          getStores: snapshotStore.getStores,
          getSnapshotStoreData: snapshotStore.getSnapshotStoreData,
          setData: snapshotStore.setData,
          addData: snapshotStore.addData,
          stores: snapshotStore.stores,
          getStore: snapshotStore.getStore,
          addStore: snapshotStore.addStore,
          mapSnapshot: snapshotStore.mapSnapshot,
          mapSnapshots: snapshotStore.mapSnapshots,
          removeStore: snapshotStore.removeStore,
          unsubscribe: snapshotStore.unsubscribe,
          fetchSnapshot: snapshotStore.fetchSnapshot,
          addSnapshotFailure: snapshotStore.addSnapshotFailure,
          configureSnapshotStore: snapshotStore.configureSnapshotStore,
          updateSnapshotSuccess: snapshotStore.updateSnapshotSuccess,
          createSnapshotFailure: snapshotStore.createSnapshotFailure,
          createSnapshotSuccess: snapshotStore.createSnapshotSuccess,
          createSnapshots: snapshotStore.createSnapshots,
          onSnapshot: snapshotStore.onSnapshot,
          onSnapshots: snapshotStore.onSnapshots,
          label: snapshotStore.label,
          handleSnapshot: snapshotStore.handleSnapshot,
          initialConfig: snapshotStore.initialConfig,
          removeSubscriber: snapshotStore.removeSubscriber,
          onInitialize: snapshotStore.onInitialize,
          onError: snapshotStore.onError,
          snapshot: snapshotStore.snapshot,
          setCategory: snapshotStore.setCategory,
          applyStoreConfig: snapshotStore.applyStoreConfig,
          snapshotData: snapshotStore.snapshotData,
          getItem: snapshotStore.getItem,
          getDataStoreMap: snapshotStore.getDataStoreMap,
          emit: snapshotStore.emit,
          addStoreConfig: snapshotStore.addStoreConfig,
          handleSnapshotConfig: snapshotStore.handleSnapshotConfig,
          getSnapshotConfig: snapshotStore.getSnapshotConfig,
          getSnapshotListByCriteria: snapshotStore.getSnapshotListByCriteria,
          payload: snapshotStore.payload,
          subscribe: snapshotStore.subscribe,
          fetchSnapshotFailure: snapshotStore.fetchSnapshotFailure,
          fetchSnapshotSuccess: snapshotStore.fetchSnapshotSuccess,
          updateSnapshotFailure: snapshotStore.updateSnapshotFailure,
          updateSnapshot: snapshotStore.updateSnapshot,
          restoreSnapshot: snapshotStore.restoreSnapshot, // Fixed initialization
          subscribers: snapshotStore.subscribers,
          getSnapshotItems: snapshotStore.getSnapshotItems,
          defaultSubscribeToSnapshots: snapshotStore.defaultSubscribeToSnapshots,

          versionInfo: snapshotStore.versionInfo,
          transformSubscriber: snapshotStore.transformSubscriber,
          transformDelegate: snapshotStore.transformDelegate,
          events: snapshotStore.events,
          meta: snapshotStore.meta,
          data: snapshotStore.data,
          item: snapshotStore.item,

          deleted: snapshotStore.deleted,
          initialState: snapshotStore.initialState,
          isCore: snapshotStore.isCore,
          taskIdToAssign: snapshotStore.taskIdToAssign,
          schema: snapshotStore.schema,
          currentCategory: snapshotStore.currentCategory,
          mappedSnapshotData: snapshotStore.mappedSnapshotData,
          storeId: snapshotStore.storeId,
          criteria: snapshotStore.criteria,
          snapshotContainer: snapshotStore.snapshotContainer,
          getAllValues: snapshotStore.getAllValues,
          getSnapshotEntries: snapshotStore.getSnapshotEntries,
          getAllSnapshotEntries: snapshotStore.getAllSnapshotEntries,
          fetchStoreData: snapshotStore.fetchStoreData,
          id: snapshotStore.id,
          config: snapshotStore.config,
          snapshotMethods: snapshotStore.snapshotMethods,
          getSnapshotsBySubscriber: snapshotStore.getSnapshotsBySubscriber,
          snapshotSubscriberId: snapshotStore.snapshotSubscriberId,
          isSubscribed: snapshotStore.isSubscribed,
          manageSubscription: snapshotStore.manageSubscription,
          clearSnapshotSuccess: snapshotStore.clearSnapshotSuccess,
          addToSnapshotList: snapshotStore.addToSnapshotList,
          getSnapshotsBySubscriberSuccess: snapshotStore.getSnapshotsBySubscriberSuccess,

          // Callback method for subscription
          subscribeToSnapshots: (callback: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void
          ): SnapshotsArray<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | [] => {
            callback({
              data: item,
              isCore: true, // Adjust according to your Snapshot<Data<T>, any> requirements
              initialConfig: {},
              removeSubscriber: () => { },
              onInitialize: () => { },
              // Add other required properties and methods for Snapshot<Data<T>, any>
            })
            return
          }
        })
        )
      } catch (error) {
        console.error('Error fetching all items:', error);
        throw error;
      }
    },

    events: {
      eventRecords: {},
      callbacks: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => {
        return {
          onDataChange: (callback: (data: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void) => {
            callback(snapshot);
          },
          onDataDelete: (callback: (data: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void) => {
            callback(snapshot);
          },
          onDataCreate: (callback: (data: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void) => {
            callback(snapshot);
          },
          onDataUpdate: (callback: (data: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void) => {
            callback(snapshot);
          },
          onDataMerge: (callback: (data: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void) => {
            callback(snapshot);
          }
        };
      },
      subscribers: [],
      eventIds: []
    },
    snapshotStoreConfig: [
      configTransform(
        {
          // Provide initial configuration here
          ...defaultSnapshotStoreConfig,
          id: "",
          snapshotWithCriteria: {
            // Example criteria
          },
        } as SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>),
    ],


    snapshotConfig: (config: SnapshotConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => {
      return {
        snapshotConfig: config
      };
    },

    getSnapshotItems: async (category: Category, snapshots: SnapshotsArray<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => {
      const snapshotItems = snapshots.map((snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => ({
        snapshots: snapshot,
        ...snapshot.data
      }));
      return { snapshots: snapshotItems };
    },

    defaultSubscribeToSnapshots: (
      snapshotId: string,
      callback: (snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => Subscriber<T> | null,
      snapshot: Snapshot<T> | null
    ) => {
      // Ensure 'snapshots' is the correct variable passed to callback
      const snapshots = snapshot ? [snapshot] : []; // Example logic to handle snapshot
      callback(snapshots); // Pass 'snapshots' instead of 'item'
    },

    versionInfo: { version: '1.0.0' },

    transformSubscriber: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => {
      return snapshot;
    },

    transformDelegate: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => {
      return snapshot;
    },

    meta: {},

    getSnapshotStoreData: function <
      T extends BaseDataEntity,
      K extends T = T,
      Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
      AttachmentType extends Attachment = Attachment,
      ExcludedFields extends keyof T = DefaultExcludedFields<T>,
      IncludedFields extends keyof T = keyof T
    >(
      id: number,
      storeProps: SnapshotStoreProps<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
    ): Promise<SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined> {
      return new Promise(async (resolve, reject) => {
        try {
          const snapshotStore = await useSnapshotStore(addToSnapshotList, storeProps)

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
        } catch (error: any) {
          reject(new Error(`An error occurred while getting the snapshot: ${error.message}`));
        }
      });
    },

    getStoreData: function (id: number): Promise<SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]> {
      throw new Error("Function not implemented.");
    },
    getDelegate: function (context: {
      useSimulatedDataSource: boolean;
      simulatedDataSource: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
    }): Promise<SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]> {
      throw new Error("Function not implemented.");
    },
    updateDelegate: function (config: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]): Promise<SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]> {
      throw new Error("Function not implemented.");
    },
    getSnapshot: async function (
      snapshot: (id: string | number) =>
        | Promise<{
          snapshotId: number;
          snapshotData: SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
          category: Category | undefined;
          categoryProperties: CategoryProperties | undefined;
          dataStoreMethods: DataStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null;
          timestamp: string | number | Date | undefined;
          id: string | number | undefined;
          snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
          snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
          data: T;
        }>
        | undefined,
    ): Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined> {

      if (!storeProps) {
        throw new Error("Snapshot properties not available")
      }
      const snapshotStore = await useSnapshotStore(addToSnapshotList, storeProps);

      return snapshotStore.getSnapshot(isSnapshot(snapshot));
    },

    getSnapshotWithCriteria: function (
      category: Category | undefined, timestamp: any,
      id: number,
      snapshot: Snapshot<BaseDataEntity, any>,
      snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      data: BaseDataEntity
    ): Promise<SnapshotWithCriteria<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined> {
      return new Promise((resolve, reject) => {
        resolve(undefined);
      })
    },

    getSnapshotVersions: function (
      category: Category | undefined, timestamp: any,
      id: number,
      snapshot: Snapshot<BaseData, any>,
      snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      data: BaseDataEntity
    ): Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] | undefined> {
      return new Promise((resolve, reject) => {
        resolve(undefined);
      })
    },
    getSnapshotWithCriteriaVersions: function (
      category: Category | undefined,
      timestamp: any,
      id: number,
      snapshot: Snapshot<BaseData, any>,
      snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      data: BaseDataEntity
    ): Promise<SnapshotWithCriteria<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] | undefined> {
      return new Promise((resolve, reject) => {
        resolve(undefined);
      })
    },

    mapSnapshot: function (
      id: number,
      storeId: string | number,
      snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      snapshotId: string,
      snapshotContainer: SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      criteria: CriteriaType,
      snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      type: string,
      event: Event
      //data: Data
    ): Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined> {
      return new Promise((resolve, reject) => {
        resolve(undefined);
      })
    },

    mapSnapshots: (
      storeIds: number[],
      snapshotId: string,
      category: Category | undefined,
      categoryProperties: CategoryProperties | undefined,
      snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      timestamp: string | number | Date | undefined,
      type: string,
      event: Event,
      id: number,
      snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      data: T,
      callback: (
        storeIds: number[],
        snapshotId: string,
        category: Category | undefined,
        snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
        timestamp: string | number | Date | undefined,
        type: string,
        event: Event,
        id: number,
        snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
        data: T
      ) => SnapshotsObject<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
    ): SnapshotsObject<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> => {
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
      data: BaseDataEntity,
      id: number,
      newData: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
    ): Promise<SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]> => {
      throw new Error("Function not implemented.");
    },


    getSnapshotContainer: (
      category: string, // Adjusted to more specific type
      timestamp: string, // Adjusted to more specific type
      id: number,
      snapshot: Snapshot<T, K, DefaultMeta<T, K>>,
      snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      snapshotData: SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      data: InitializedData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null | undefined,
      snapshotsArray: SnapshotsArray<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      snapshotsObject: SnapshotsObject<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
    ): Promise<SnapshotContainer<T, any> | undefined> => {
      return new Promise((resolve, reject) => {

        if (!isSnapshot(snapshot)) {
          reject(new Error("Invalid snapshot provided"));
          return;
        }

        if (!isBaseData(data)) {
          reject(new Error("Invalid base data provided"));
          return;
        }

        const convertedSnapshot = convertToArray(snapshotStore, snapshot)[0]; // Convert single snapshot to array and take the first element

        // Implementation logic to fetch or construct a SnapshotContainer
        const container: SnapshotContainer<T, any> = {
          id: id.toString(), // Ensure id is a string
          category,
          timestamp,
          convertedSnapshot,
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
      category: Category | undefined,
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
        if (!isSnapshot(snapshot)) {
          reject(new TypeError("Provided snapshot does not match the expected structure."));
          return;
        }
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
  }
  // If no store is found, return an empty object
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
export type { ConvertMeta, ConvertMetadata, K, Meta, T };


// Example of a simple convert function (you may need a custom implementation)
function convertStringToT(key: string): T {
  return JSON.parse(key) as T;
}
