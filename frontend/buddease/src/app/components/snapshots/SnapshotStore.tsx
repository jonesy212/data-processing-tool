import { SnapshotContainerData } from '@/app/components/snapshots/SnapshotContainer';
import { Data } from '@/app/components/models/data/Data';
import { ConvertMeta } from '@/app/components/models/data/dataStoreMethods';
import { Subscription } from '@/app/components/subscriptions/Subscription';
import { Subscriber } from '@/app/components/users/Subscriber';
import { SnapshotStoreConfig } from '@/app/components/snapshots/SnapshotStoreConfig';
import { CategoryProperties } from "@/app/pages/personas/ScenarioBuilder";
import { SnapshotData } from '@/app/components/snapshots';
import { getAllSnapshotEntries } from '@/app/components/snapshots/getSnapshotEntries';
import {
  Snapshot,
  SnapshotUnion,
  Snapshots,
  SnapshotsArray,
  SnapshotsObject
} from "@/app/components/snapshots/LocalStorageSnapshotStore";
import { initialState } from "../state/redux/slices/FilteredEventsSlice";
import { CoreSnapshot } from './CoreSnapshot';

import { handleApiError } from "@/app/api/ApiLogs";
import { getSnapshotStoreConfig } from "@/app/api/SnapshotApi";
import { NotificationType, NotificationTypeEnum, useNotification } from '@/app/components/support/NotificationContext';
import { UnifiedMetaDataOptions } from "@/app/configs/database/MetaDataOptions";
import { getConfigPromise } from "@/app/configs/getConfigPromise";
import { ProjectMetadata, StructuredMetadata } from "@/app/configs/StructuredMetadata";
import UniqueIDGenerator from "@/app/generators/GenerateUniqueIds";
import { MessageType } from "@/app/generators/MessaageType";
import { CriteriaType } from "@/app/pages/searchs/CriteriaType";
import { FilterCriteria } from "@/app/pages/searchs/FilterCriteria";
import retrieveSnapshotData from "@/app/utils/retrieveSnapshotData";
import { prefix } from "@fortawesome/free-solid-svg-icons";
import { AxiosError } from "axios";

import { find, findIndex } from "lodash";
import { IHydrateResult } from "mobx-persist";
import getConfig from "next/config";
import { error } from "node:console";
import { get } from "node:http";
import { version } from "node:os";
import { config } from "node:process";
import { callback } from "node_modules/chart.js/dist/helpers/helpers.core";
import { prop } from "node_modules/cheerio/lib/esm/api/attributes";
import {  useDispatch } from "react-redux";
import { SnapshotWithData } from "../calendar/CalendarApp";
import { CodingLanguageEnum, LanguageEnum } from "../communications/LanguageEnum";
import { CreateSnapshotStoresPayload, CreateSnapshotsPayload, Payload, UpdateSnapshotPayload } from "../database/Payload";
import { SchemaField } from "../database/SchemaField";
import { DocumentTypeEnum } from "../documents/DocumentGenerator";
import { FileTypeEnum } from "../documents/FileType";
import defaultImplementation from "../event/defaultImplementation";
import { UnsubscribeDetails } from "../event/DynamicEventHandlerExample";
import FormatEnum from "../form/FormatEnum";
import { CombinedEvents, SnapshotManager, SnapshotStoreOptions, useSnapshotManager } from "../hooks/useSnapshotManager";
import AnimationTypeEnum from "../libraries/animations/AnimationLibrary";
import { Category } from "../libraries/categories/generateCategoryProperties";
import { Content } from "../models/content/AddContent";
import { BaseData, DataDetails } from "../models/data/Data";
import { Meta, T, dataStoreMethods } from "../models/data/dataStoreMethods";
import { BookmarkStatus, CalendarStatus, DataStatus, DevelopmentPhaseEnum, NotificationPosition, NotificationStatus, PriorityTypeEnum, PrivacySettingEnum, ProjectPhaseTypeEnum, StatusType, SubscriberTypeEnum, SubscriptionTypeEnum, TaskStatus, TeamStatus, TodoStatus } from "../models/data/StatusType";
import { DebugInfo, TempData } from "../models/data/TempData";
import { RealtimeDataItem } from "../models/realtime/RealtimeData";
import { ContentManagementPhaseEnum } from "../phases/ContentManagementPhase";
import { FeedbackPhaseEnum } from "../phases/FeedbackPhase";
import { TaskPhaseEnum } from "../phases/TaskProcess";
import { TenantManagementPhaseEnum } from "../phases/TenantManagementPhase";
import { AnalysisTypeEnum } from "../projects/DataAnalysisPhase/AnalysisType";
import { DataStoreMethods, DataStoreWithSnapshotMethods } from "../projects/DataAnalysisPhase/DataProcessing/ DataStoreMethods";
import { CommonDataStoreMethods, DataStore, EventRecord, InitializedState } from "../projects/DataAnalysisPhase/DataProcessing/DataStore";
import { ExcludedFields } from "../routing/Fields";
import { SearchCriteria } from "../routing/SearchCriteria";
import { SecurityFeatureEnum } from "../security/SecurityFeatureEnum";
import CalendarManagerStoreClass from "../state/stores/CalendarManagerStore";
import { convertEventsToRecord } from "../typings/convertSnapshotEvents";
import { AllTypes } from "../typings/PropTypes";
import { isDataStoreMethod } from "../typings/typeguards/dataStoreTypeGuards";
import { convertSnapshotStoreToSnapshot, convertToDataStore, isSnapshotStore, snapshotType } from "../typings/YourSpecificSnapshotType";
import { AuditRecord } from "../users/Subscriber";
import { SubscriberCollection } from "../users/SubscriberCollection";
import { IdeaCreationPhaseEnum } from "../users/userJourney/IdeaCreationPhase";
import { convertToSnapshotArray, isSnapshot, isSnapshotStoreConfig, isSnapshotUnionBaseData, snapshotId } from "../utils/snapshotUtils";
import Version from "../versions/Version";
import { defaultSubscribeToSnapshot } from "./defaultSnapshotSubscribeFunctions";
import { defaultSubscribeToSnapshots } from "./defaultSubscribeToSnapshots";
import { FetchSnapshotPayload } from "./FetchSnapshotPayload";
import { createSnapshotStores } from "./newStoreUtils";
import { SnapshotActions, SnapshotOperation } from "./SnapshotActions";
import { SnapshotActionType } from "./SnapshotActionType";
import { ConfigureSnapshotStorePayload, RetentionPolicy, SnapshotConfig } from "./SnapshotConfig";
import { SnapshotContainer } from "./SnapshotContainer";
import { SnapshotEvents } from "./SnapshotEvents";
import { createSnapshotStore, delegate, subscribeToSnapshot, subscribeToSnapshots } from "./snapshotHandlers";
import { SnapshotItem } from "./SnapshotList";
import { getSnapshotItems } from "./snapshotOperations";
import { SnapshotStoreMethod } from "./SnapshotStoreMethod";
import { InitializedData, InitializedDataStore } from "./SnapshotStoreOptions";
import { SnapshotWithCriteria, TagsRecord, data } from "./SnapshotWithCriteria";
import { Callback } from "./subscribeToSnapshotsImplementation";
import { SnapshotStoreProps } from "./useSnapshotStore";
import { Video } from "@/app/components/state/stores/VideoStore";
import { Attachment } from '../documents/Attachment/attachment';


const { notify } = useNotification();
const dispatch = useDispatch();
const notificationContext = useNotification();

interface FetchableDataStore<T extends  BaseData<any>, 
  K extends T = T> {
  getData(): Promise<DataStore<T, K>[]>;
}

const initializeData = ():  BaseData<any> => {
  return {
    id: "initial-id",
    name: "Initial Name",
    value: "Initial Value",
    timestamp: new Date(),
    category: "Initial Category",
  };
};



// Ensure you're checking the correct type and calling the `trigger` method
function handleSnapshotEvent<T extends BaseData<any>, K extends T = T>(
    coreSnapshot: CoreSnapshot<T, K>,
    type: string,
    snapshot: Snapshot<T, K>,
    eventDate: Date,
    snapshotData: SnapshotData<T, K>,
    subscribers: SubscriberCollection<T, K>,
    snapshotId?: string | number | null,
): void {
    const combinedEvent = coreSnapshot.events;

    
    if (combinedEvent && typeof combinedEvent.trigger === "function") {
        // Extracting the event string from the combinedEvent
        const eventStr = combinedEvent.event;
        const eventData = new Date()
        combinedEvent.trigger(
            eventStr,
            snapshot,
            eventData,
            String(snapshotId),
            subscribers,
            type,
            snapshotData
        );
    } else {
        console.warn("Event or trigger function not found");
    }
}



function isCompatibleTempData<
  U extends BaseData, 
  K extends Data<U> = U, 
  // ExcludedFields extends keyof T = never
>(
  tempData: TempData<U, K> | undefined
): boolean {
  if (!tempData) {
    return false;
  }

  // If `valueA` and `valueB` are both defined, check if they have the same keys
  if (tempData.valueA && tempData.valueB) {
    const valueAKeys = Object.keys(tempData.valueA);
    const valueBKeys = Object.keys(tempData.valueB);

    // Check that valueB has at least the same keys as valueA
    return valueAKeys.every((key) => valueBKeys.includes(key));
  }

  // If either `valueA` or `valueB` is missing, consider it incompatible
  return false;
}

type U = T
type WrappedU = U extends BaseData ? U : BaseData<U, U, StructuredMetadata<WrappedU, WrappedU>, Attachment>;


// Function to transform config options
function createStoreConfig<
  U extends BaseData,
  K extends U = U,
  Meta extends StructuredMetadata<U, K> = StructuredMetadata<U, K>,
  ExcludedFields extends keyof U = never
>(
  config: SnapshotStoreConfig<U, K, Meta> // Updated to include Meta and ExcludedFields
): SnapshotStoreConfig<U, K, ConvertMeta<U, K>, ExcludedFields> {
  // Transform the data property


  const transformedData: U = transformData<U, K>(config.data as U);

  // Use the boolean check to see if tempData is compatible
  const tempData = isCompatibleTempData(config.tempData) ? config.tempData : undefined;

  // Transform tempData with type guard
  const transformedTempData: U | undefined = config.tempData && isCompatibleTempData<U, K>(config.tempData)
    ? transformData<U, K>(config.tempData as U)
    : undefined;

  // Transform the options property if necessary to ensure compatibility
  const transformedOptions = config.options
    ? {
        ...config.options,
        initialState: transformInitialState<U, K, StructuredMetadata<T, K>>(config.options.initialState as InitializedState<U, K>),
      }
    : undefined;

    // Define a helper type ConvertSnapshot for conditional type conversion
    type ConvertSnapshot<
      U extends Data<U>, 
      K extends U = U, 
      Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>,
      ExcludedFields extends keyof T = never
    > = U extends K ? Snapshot<U, K, StructuredMetadata<U, K>, keyof U> : Snapshot<U, K, StructuredMetadata<U, K>, ExcludedFields>;

    // Transform the snapshotStore property to match the expected function signature
    const transformedSnapshotStore = (
      snapshotStore: SnapshotStore<U, K>,
      snapshotId: string,
      data: Map<string, Snapshot<U, K>>,
      events: Record<string, CalendarManagerStoreClass<U, K>[]>,
      dataItems: RealtimeDataItem[],
      newData: Snapshot<U, K, StructuredMetadata<U, K>, never>,
      payload: ConfigureSnapshotStorePayload<U, K>,
      store: SnapshotStore<any, K>,
      callback: (snapshotStore: SnapshotStore<U, K>) => void
    ): void | null => {

      // Cast the data map to the expected type, if necessary
      const castedData = data as unknown as Map<string, Snapshot<U, K>>;

      // Implement your transformation logic here
      return config.snapshotStore?.(
        snapshotStore as unknown as SnapshotStore<U, K>,
        snapshotId,
        castedData,
        events,
        dataItems,
        newData,
        payload,
        store,
        callback as unknown as (snapshotStore: SnapshotStore<U, K>) => void
      ) ?? null;
    }

  // Transform the `dataStoreMethods` to match the expected type
  const transformedDataStoreMethods: Partial<DataStoreWithSnapshotMethods<U, K, Meta>> | undefined =
  config.dataStoreMethods
    ? (Object.entries(config.dataStoreMethods) as [keyof DataStoreWithSnapshotMethods<U, K, Meta>, unknown][]).reduce(
        (acc, [key, value]) => {
          if (isDataStoreMethod<U, K, keyof DataStoreWithSnapshotMethods<U, any, Meta>, typeof key>(value)) {
            acc[key] = value as DataStoreWithSnapshotMethods<U, K, Meta>[typeof key];
          }
          return acc;
        },
        {} as Partial<DataStoreWithSnapshotMethods<U, K, Meta>>

      )
    : undefined;

  
  return {
    // ...transformedData,

    id: config.id, 
    createdBy: config.createdBy, 
    category: config.category,
    data: transformedData,
    isCore: config.isCore,
    configId: config.configId,
    getSnapshotConfig: config.getSnapshotConfig,
    isSubscribed: config.isSubscribed,
    getSnapshotManager: config.getSnapshotManager,
    callback: config.callback,
    batchUpdateSnapshotsSuccess: config.batchUpdateSnapshotsSuccess,
    configureSnap: config.configureSnap,
    manageSubscription: config.manageSubscription,
    snapshots: config.snapshots,
    
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

    initialState: transformInitialState<U, K, StructuredMetadata<T, K>>(config.options?.initialState as InitializedState<U, K, Meta>),
    configOption: config.configOption as string | SnapshotStoreConfig<U, K, Meta, ExcludedFields> | null,
    tempData: tempData as TempData<WrappedU, WrappedU> | undefined,
    options: transformedOptions as SnapshotStoreOptions<U, K, Meta, ExcludedFields> | undefined,
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
   
    
    dataStoreMethods: transformedDataStoreMethods,
    criteria: config.criteria,
    content: config.content,
    
    config: config.config,
    snapshotCategory: config.snapshotCategory,
    snapshotSubscriberId: config.snapshotSubscriberId,
    snapshotContent: config.snapshotContent,
    
    snapshotStore: transformedSnapshotStore,

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
  } as SnapshotStoreConfig<U, K, Meta, ExcludedFields>;
}

// Helper function to transform the initial state if necessary
function transformInitialState<
  U extends BaseData, 
  K extends T = T,
  Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>,
  ExcludedFields extends keyof T = never
>(initialState: InitializedState<U, any>): InitializedState<WrappedU, WrappedU> {
  // Assuming transformation logic is available here
  return initialState as InitializedState<WrappedU, WrappedU>;
}


function transformConfigOption<
  U extends Data<U>, 
  K extends U = U>(
    configOption: string | SnapshotConfig<U, K> | SnapshotStoreConfig<U, K> | null
): string | SnapshotConfig<WrappedU, WrappedU> | SnapshotStoreConfig<WrappedU, WrappedU> | null {
  if (typeof configOption === "string") {
    return configOption; // Keep strings as is
  } else if (configOption && typeof configOption === "object") {
    if ('storeConfig' in configOption) {
      // Transform SnapshotStoreConfig to match U type
      return {
        ...configOption,
        storeConfig: transformStoreConfig<WrappedU, WrappedU>(configOption.storeConfig),
        find, 
        autoSave: true,
        syncInterval: 300000, // 5 minutes
        snapshotLimit: 100,
        getSnapshotManager, callback, configId, additionalSetting,

      } as SnapshotStoreConfig<WrappedU, WrappedU>;
    } else {
      // Transform SnapshotConfig to match U type
      return {
        ...configOption,
        data: transformData<T, U>(configOption.data),
        storeConfig, additionalData, isCore, currentCategory,
      } as SnapshotConfig<WrappedU, WrappedU>;
    }
  }
  return null; // Return null if configOption is null or undefined
}

// Helper function to transform storeConfig from SnapshotStoreConfig<T, K> to SnapshotStoreConfig<WrappedU, WrappedU>
function transformStoreConfig<T extends  BaseData<any>, 
  U extends T = T>(
  storeConfig: SnapshotStoreConfig<T>
): SnapshotStoreConfig<U> {
  return {
    ...storeConfig,
    data: storeConfig.data.map((item) => transformData<T, U>(item)),
  } as SnapshotStoreConfig<WrappedU, WrappedU>;
}



// Helper function to transform data from T to U
function transformData<
T extends  BaseData<any>,   
U extends T = T>(
  data: T
): U {
  // Create an empty object of type U
  const transformedData: U = {} as U;

  // Iterate over the properties of data and assign them to transformedData
  for (const key in data) {
    if (data.hasOwnProperty(key)) {
      // Example transformation logic
      if (key === 'id') {
        (transformedData as any)[key] = transformField((data as any)[key]);
      } else {
        // Copy other properties as they are
        (transformedData as any)[key] = (data as any)[key];
      }
    }
  }
  // Set default values for fields that are in U but not in T
  if (!('title' in data)) {
    (transformedData as any).additionalField = getDefaultValueForField(defaultType);
  }

  // Remove properties that are in T but not relevant for U
  delete (transformedData as any).unnecessaryField;

  // Ensure transformedData is of type U
  return transformedData;
}

// Example transformation function for a specific field
function transformField(value: any): any {
  // Check if the value is a string
  if (typeof value === 'string') {
    // Return the value transformed, e.g., changing its case or appending a prefix
    return value.trim().toUpperCase(); // Example: converting to uppercase and trimming whitespace
  }
  // Check if the value is a number
  else if (typeof value === 'number') {
    // Transform the number, e.g., adding 10 to it
    return value + 10; // Example: incrementing the number
  }
  // If the value is an object, you might want to do something else
  else if (typeof value === 'object' && value !== null) {
    // Example: returning a new object with a specific property transformed
    return { ...value, transformed: true }; // Adding a 'transformed' property
  }
  // If the value is of an unexpected type, you can return it as-is or handle it
  return value; // Default: return the original value
}


// Example function to get default values for new fields
function getDefaultValueForField(defaultType: string): any {
  switch (defaultType as 'string' | 'number' | 'boolean' | 'array' | 'object') {
    case 'string':
      return "defaultValue"; // Default string value
    case 'number':
      return 0; // Default numeric value
    case 'boolean':
      return false; // Default boolean value
    case 'array':
      return []; // Default empty array
    case 'object':
      return { key: 'defaultKey', value: 'defaultValue' }; // Default object
    default:
      return null; // Default for any other types
  }
}

interface InitializableWithData<T extends  BaseData<any>, 
  K extends T = T> {
  initializeWithData(data: SnapshotUnion<T, K, Meta>[]): void | undefined;
  hasSnapshots(): Promise<boolean>;   
  addSnapshot(
    snapshot: Snapshot<T, K>,
    snapshotId: string,
    subscribers: SubscriberCollection<T, K>
  ): Promise<Snapshot<T, K> | undefined>;
}

function convertToSnapshotUnion<
  T extends  BaseData<any>, 
  K extends T = T
>(snapshot: Snapshot<T, K>): SnapshotUnion<T, K, Meta> {
  // Depending on how SnapshotUnion<T, K, Meta> is defined, 
  // ensure the conversion makes sense (e.g., setting additional properties if needed)
  return snapshot as unknown as SnapshotUnion<T, K, Meta>;
}



// Define a more abstract interface to represent snapshot stores
interface SnapshotStoreReference<T extends BaseData<any>, K extends T = T> {
  // Add the specific methods you need here for snapshot store references
}



class SnapshotStore<
  T extends  BaseData<any>,
  K extends T = T,
  Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>,
  ExcludedFields extends keyof T = never
>
  // implements
  // //   DataStore<T, K>
    // SnapshotWithCriteria<T, K>
  //   SnapshotStoreMethod<T, K>,
  //   CommonDataStoreMethods<T, K>
{
  id: string | number | undefined = "";
  snapshotId?: string | number  | undefined = undefined
  key: string = "";
  keys: string[] = [];
  topic: string = "";
  date: string | number | Date | undefined;
  // metadata: Meta;

  configOption?:
    | string
    | SnapshotConfig<T, K>
    | SnapshotStoreConfig<T, K>
    | null;
  operation!: SnapshotOperation<T, K>;
  title: string = "";
  subscription?: Subscription<T, K> | null = null;
  description?: string | undefined = "";
  category: symbol | string | Category | undefined;
  options: SnapshotStoreOptions<T, K> = {} as SnapshotStoreOptions<T, K>;
  categoryProperties: CategoryProperties | undefined;
  message: string | undefined = undefined;
  timestamp: string | number | Date | undefined;
  logging?: boolean;  // Whether to enable logging for the store
  autoSync?: boolean; // Whether to enable auto-sync for the store
 
  createdBy: string = "";
  eventRecords?: Record<string, CalendarManagerStoreClass<T, K>[]> | null;
  type: string | AllTypes | null = "";
  structuredMetadata: StructuredMetadata<T, K> = {} as StructuredMetadata<T, K>;
  subscribers: SubscriberCollection<T, K>[] = []

  get(id: string): CoreSnapshot<T, K> | undefined {
    return this.snapshots.get(id);
  }

  set?: (
    data: T | Map<string, Snapshot<T, K>>,
    type: string,
    event: Event
  ) => void | null;

  setStore?: (
    data: T | Map<string, SnapshotStore<T, K>>,
    type: string,
    event: Event
  ) => void | null;
  data?: InitializedData<T> | null = null;
  createdAt: string | Date | undefined;
  storeId: number = 0;
  updatedAt?: string | Date | undefined;
  videos?: Video[]
  updatedBy?: string | undefined = undefined
  maxAge: string | number | undefined = undefined
  state?: SnapshotsArray<T, K> | null = null;
  store: SnapshotStore<T, K> | null = null;
  stores: (storeProps: SnapshotStoreProps<T, K>) => SnapshotStore<T, K>[] | null = () => null;
  snapshots: SnapshotsArray<T, K> = [];
  
  snapshotConfig: SnapshotConfig<T, K>[] = [];
  snapshotStoreConfig: SnapshotStoreConfig<T, K>[] = [];
  expirationDate: Date;
  priority?: PriorityTypeEnum | undefined;
  tags?: TagsRecord<T, K> | string[] | undefined;
  metadata?: UnifiedMetaDataOptions<T, K, Meta, ExcludedFields> | {};
  // delegate: SnapshotStoreConfig<T, K>[] = []
  meta: Map<string, Snapshot<T, K>> | {} = {};
  status?: StatusType | undefined;
  isCompressed?: boolean;
  isSubscribed: boolean = false;
  snapshotMethods: SnapshotStoreMethod<T, K>[] = []; // Initialized to an empty array

  addToSnapshotList = async (
    snapshots: Snapshot<T, K>[], 
    subscribers: Subscriber<T, K>[]
  ): Promise<Subscription<T, K>[]> => {
    const results: Subscription<T, K>[] = [];
    for (const snapshot of snapshots) {
      const storeProps: SnapshotStoreProps<T, K> = {
        storeId: 123, 
        name: 'MyStore',
        version: '1.0.0',
        schema: {},
        options: {} as SnapshotStoreOptions<T, K, StructuredMetadata<T, K>, never>, 
        category: 'example',
        config: Promise.resolve({} as Promise<SnapshotStoreConfig<T, K, StructuredMetadata<T, K>, never> | null>), 
        operation: {} as SnapshotOperation<T, K>,
        expirationDate: new Date(),
        payload: {
          error: {}, 
          meta: {}
        },
        callback: () => {},
        storeProps: {}, 
        endpointCategory: 'default',
        metadata: {} as Meta,
      };
      const result = await addToSnapshotList<T, K, Meta>(snapshot, subscribers, storeProps);
      if (result) {
        results.push(result);
      }
    }
    return results;
  };

  getAllSnapshots = async (
    storeId: number,
    snapshotId: string,
    snapshotData: SnapshotContainerData<T, K, ExcludedFields>,
    timestamp: string,
    type: string,
    event: Event,
    id: number,
    snapshotStore: SnapshotStore<T, K>,
    category: symbol | string | Category | undefined,
    categoryProperties: CategoryProperties | undefined,
    dataStoreMethods: DataStore<
      SnapshotContainerData<T, K, ExcludedFields>,
      SnapshotContainerData<T, K, ExcludedFields>
    >,
    data: SnapshotContainerData<T, K, ExcludedFields>,
    filter?: (
      snapshot: Snapshot<
        SnapshotContainerData<T, K, ExcludedFields>,
        SnapshotContainerData<T, K, ExcludedFields>
      >
    ) => boolean,
    dataCallback?: (
      subscribers: Subscriber<
        SnapshotContainerData<T, K, ExcludedFields>,
        SnapshotContainerData<T, K, ExcludedFields>
      >[],
      snapshots: Snapshots<T, K>
    ) => Promise<SnapshotUnion<T, K, Meta>[]>
  ): Promise<
    Snapshot<
      SnapshotContainerData<T, K, ExcludedFields>,
      SnapshotContainerData<T, K, ExcludedFields>
    >[]
  > => {
    // Placeholder logic for demonstration purposes
    const snapshots: Array<
      Snapshot<
        SnapshotContainerData<T, K, ExcludedFields>,
        SnapshotContainerData<T, K, ExcludedFields>
      >
    > = []; // Assume this is populated from the snapshot store

    const filteredSnapshots = filter ? snapshots.filter(filter) : snapshots;

    if (dataCallback) {
      await dataCallback([], filteredSnapshots);
    }

    return filteredSnapshots;
  };

  getSnapshotsBySubscriber = async (subscriber: string): Promise<BaseData[]> => {
    // Retrieve the current snapshot store instance (assumes it is available in this context)
    const snapshots = this.getAllSnapshots(
      storeId,
      snapshotId,
      snapshotData,
      timestamp,
      type,
      event,
      id,
      snapshotStore,
      category,
      categoryProperties,
      dataStoreMethods,
      data,
      filter,
      dataCallback,
      dataStoreMethods,
    ).filter(snapshot => {
      if (snapshot && snapshot.subscribers && Array.isArray(snapshot.subscribers)) {
        return snapshot.subscribers.includes(subscriber);
      }
      return false;
    });

    return snapshots.map(snapshot => snapshot.data);
  };

  handleSnapshotFailure: (
    error: Error,
    snapshotId: string,     
    snapshots: Snapshots<BaseData, UnifiedMetaDataOptions<T, K, Meta, ExcludedFields>>
  ) => void;

  getSnapshotsBySubscriberSuccess: any;
  getSnapshotsByTopic: any;
  getSnapshotsByTopicSuccess: any;
  getSnapshotsByCategory: any;
  getSnapshotsByCategorySuccess: any;
  getSnapshotsByKey: any;
  getSnapshotsByKeySuccess: any;
  getSnapshotsByPriority: any;
  getSnapshotsByPrioritySuccess: any;
  getStoreData: (id: number) => Promise<SnapshotStore<T, K>[]>;
  updateStoreData: any;
  updateDelegate: any;
  getSnapshotContainer: any;
  getSnapshotVersions: any;
  createSnapshot: any;
  criteria: any;

  // Implement the initializeWithData method from the InitializableWithData interface
  initializeWithData = (data: SnapshotUnion<T, K, Meta>[]): void => {
    this.snapshots = data; // Fixed 'retrun' typo to 'return'
  }

  // Correct the syntax for hasSnapshots method
  hasSnapshots = (): Promise<boolean> => {
    return Promise.resolve(this.snapshots.length > 0);
  }

  getEventsAsRecord= (): Record<string, CalendarManagerStoreClass<T, K>[]> => {
    return convertEventsToRecord(this.events);
  }

  getDataStoreMap = async (): Promise<Map<string, DataStore<T, K>>> => {
    // Create a new Map to hold the data store entries
    const dataStoreMap = new Map<string, DataStore<T, K>>();

    try {
      // Populate the map with data stores
      for (const store of this.dataStores) {
        // Assuming each store has a unique identifier, e.g., store.id
        const id = store.id; // Adjust according to how you identify your data stores

        if (id) {
          dataStoreMap.set(id.toString(), store);
        } else {
          console.warn("Data store missing ID:", store);
        }
      }

      // Optionally, you can add more logic here, such as filtering or transforming data stores

      return Promise.resolve(dataStoreMap); // Resolve with the populated map
    } catch (error) {
      console.error("Error getting data store map:", error);
      return Promise.reject(error); // Reject the promise in case of an error
    }
  };

  emit = (
    event: string,
    snapshot: Snapshot<T, K>,
    snapshotId: string,
    subscribers: SubscriberCollection<T, K>,
    type: string,
    snapshotStore: SnapshotStore<T, K>,
    dataItems: RealtimeDataItem[],
    criteria: SnapshotWithCriteria<T, K>,
    category: symbol | string | Category | undefined
  ) => {
    // Implementation here
  };

  removeChild = (
    childId: string,
    parentId: string,
    parentSnapshot: Snapshot<T, K>,
    childSnapshot: CoreSnapshot<T, K, StructuredMetadata<T, K>, never>
  ) => {
    // Implementation here
  };

  getChildren = (id: string, childSnapshot: Snapshot<T, K>) => {
    // Implementation here
    return [];
  };

  hasChildren = (id: string) => {
    // Implementation here
    return false;
  };

  isDescendantOf = (
    childId: string,
    parentId: string,
    parentSnapshot: Snapshot<T, K>,
    childSnapshot: Snapshot<T, K>
  ) => {
    // Implementation here
    return false;
  };

  getInitialState = () => {
    // Implementation here
    return {} as Snapshot<T, K>;
  };

  getConfigOption = (optionKey: string) => {
    // Implementation here
    return {};
  };

  getTimestamp = () => {
    // Implementation here
    return new Date();
  };

  getStore = (
    storeId: number,
    snapshotStore: SnapshotStore<T, K>,
    snapshotId: string | null,
    snapshot: Snapshot<T, K>,
    snapshotStoreConfig: SnapshotStoreConfig<T, K>,
    type: string,
    event: Event
  ): SnapshotStore<T, K> | null => {
    // Step 1: Check if snapshotId is provided
    if (snapshotId) {
      // Step 2: Find the snapshot with the given snapshotId in the store
    
      const existingSnapshot = this.snapshots.find((s: SnapshotUnion<T, K, Meta>) => {
        return isSnapshot<T, K>(s) && s.id === snapshotId;
      });

      if (existingSnapshot) {
        // Step 3: Update the existing snapshot with new data if 'snapshot' is provided
        if (snapshot) {
          existingSnapshot.data = snapshot.data;
          existingSnapshot.metadata = snapshot.metadata;
          existingSnapshot.category = snapshot.category;
          // Add any other updates needed
        }
  
        // Step 4: Optionally update configuration
        if (snapshotStoreConfig) {
          this.config = snapshotStoreConfig;
        }
  
        // Step 5: Return updated store
        return this;
      } else {

        // Step 6: If no snapshot found and a snapshot is provided, add it to the store
        if (snapshot && isSnapshot<T, K>(snapshot)) {
          // Add the new snapshot to the array
          this.snapshots.push(convertToSnapshotUnion(snapshot));

          if (snapshotStoreConfig) {
            this.config = snapshotStoreConfig;
          }

          return this;
        }

      }
    } else {
      // Step 7: Handle the case where snapshotId is null (e.g., apply global config or return null)
      if (snapshotStoreConfig) {
        // Apply the new configuration to the store
        this.config = snapshotStoreConfig;
      }
      // If no snapshotId and no snapshot, simply return the current store or null
      return this;
    }
  
    // Step 8: If no suitable action was taken, return null (or handle differently as needed)
    return null;
  };
  
  getStores = (
    storeId: number,
    snapshotStores?: SnapshotStoreReference<T, K>[],
    snapshotStoreConfigs?: SnapshotStoreConfig<T, K>[]
  ) => {
    // Implementation here
    return [];
  };

  getData = (
    id: string | number,
    snapshot: Snapshot<T, K>
  ): Promise<SnapshotStore<T, K>[] | undefined> => {
    // Implementation here
    return {} as Promise<SnapshotStore<T, K>[] | undefined>;
  };

  addStore = (
    storeId: number,
    snapshotId: string | null,
    snapshotStore: SnapshotStore<T, K>,
    snapshot: Snapshot<T, K>,
    type: string,
    event: Event
  ): SnapshotStore<T, K> | null => {
    // Implementation here
    return null;
  };

  removeStore = (
    storeId: number,
    store: SnapshotStore<T, K>,
    snapshotId: string,
    snapshot: Snapshot<T, K>,
    type: string,
    event: Event
  ) => {
    // Implementation here
  };

  createSnapshots = (
    id: string,
    snapshotId: string | number | null,
    snapshots: Snapshot<T, K> | Snapshots<T, K>,
    snapshotManager: SnapshotManager<T, K>,
    payload: CreateSnapshotsPayload<T, K>,
    callback: (snapshots: Snapshot<T, K>[]) => void | null,
    snapshotDataConfig?: SnapshotConfig<T, K>[],
    category?: Category,
    categoryProperties?: string | CategoryProperties
  ) => {
    // Implementation here
    return [];
  };

onSnapshot = (
  snapshotId: string,
  snapshot: Snapshot<T, K>,
  type: string,
  event: Event,
  callback: (snapshot: Snapshot<T, K>) => void
) => {
  // Implementation here
};

  #snapshotStores: Map<number, SnapshotStore<T, K>> = new Map();

  public dataStore: InitializedDataStore<T> | undefined = undefined;
  
  public mapDataStore: T | Map<string, DataStore<T, K>> | null | undefined;
  public initialState: InitializedState<T, K>;

  private name: string;
  private version: Version<T, K> | string;
  private schema: Record<string, SchemaField>;
  private dataStores: DataStore<T, K>[];

  private snapshotItems: SnapshotItem<T, K>[] = [];

  private nestedStores: SnapshotStore<T, K>[] = [];

  private snapshotIds: string[] = [];

  protected dataStoreMethods: 
    | DataStoreWithSnapshotMethods<T, K>
    | undefined
    | null = null;
    

    // Initialize options based on the config
    protected initializeOptions(): Promise<void> {
      const config = await this.config; // Await the promise to get the resolved config

      if (config?.logging) {
        console.log('Logging is enabled for this SnapshotStore.');
      }
    
      if (config?.autoSync) {
        console.log('Auto-sync is enabled for this SnapshotStore.');
        this.autoSyncData();
      }
    }

    protected setConfig(config: Promise<SnapshotStoreConfig<T, K>>): Promise<void>{
      console.log('Base SnapshotStore setConfig called.');
      this.config = config;
      this.initializeOptions(); // Re-apply the options whenever the config is updated
    }

    // Example method for syncing data
    protected autoSyncData(): void {
      console.log('Auto-syncing data...');
      // Add your sync logic here
    }
    
    private ensureDelegate(): SnapshotStoreConfig<T, K> {
      if (!this.delegate || this.delegate.length === 0) {
        throw new Error("Delegate is not defined or is empty.");
    }
    return this.delegate[0];
  }
  
  // Provide a getter for controlled access
  public getConfig(): SnapshotStoreConfig<T, K> | null {
    return this.config;
  }

  public getSnapshotStores(): Map<number, SnapshotStore<T, K>> {
    return this.#snapshotStores
  }

  public getItems( items: K[]): void {
    this.items = items
  }
  
  // Implementing getSnapshotItems
  public getSnapshotItems(): (
    | SnapshotStoreConfig<T, K>
    | SnapshotItem<T, K>
    | undefined
  )[] {
    return this.config?.useSimulatedDataSource
      ? this.config.simulatedDataSource
      : this.snapshotItems;
  }

  initializeStores(stores: Map<number, SnapshotStore<T, K, StructuredMetadata<T, K>, never>>) {
    this.#snapshotStores = stores;
  }

  getSnapshotStores() {
    return this.#snapshotStores;
  }

  private delegate: Array<SnapshotStoreConfig<T, K>> = [];

  // Method to initialize default configurations
  private initializeDefaultConfigs(): SnapshotStoreConfig<T, K>[] {
    return [
      {
        id: "default",
        autoSave: true,
        syncInterval: 300000, // Sync every 5 minutes
        snapshotLimit: 100, // Keep a maximum of 100 snapshots
        additionalSetting: "default-setting",
        find: this.find,
        storeId: this.storeId,
        operation: this.operation,
        data: {} as InitializedData,
        createdAt: this.createdAt,
        initialState: this.initialState,
        timestamp: this.timestamp,
        snapshotId: this.snapshotId,


        snapshotStore: this.snapshotStore ? this.snapshotStore : null,
        dataStoreMethods: this.dataStoreMethods || null,
        category: this.category,
        criteria: this.criteria,

        content: this.content,
        config: this.config,
        snapshotCategory: this.snapshotCategory,
        snapshotSubscriberId: this.snapshotSubscriberId,
      },
    ];
  }

 

  private handleDelegate<T extends (...args: any[]) => any, R = ReturnType<T>>(
    method: (delegate: any) => T,
    ...args: Parameters<T>
  ): R | undefined {
    if (this.delegate && this.delegate.length > 0) {
      for (const delegate of this.delegate) {
        const func = method(delegate);
        if (func && typeof func === "function") {
          return func(...args);
        } else {
          console.error("Method is not a function on delegate");
        }
      }
    } else {
      console.error("Delegate is undefined or empty");
      return undefined;
    }
  }

  private notifySuccess(message: string): void {
    notify(
      "clearSnapshotSuccess",
      message,
      "",
      new Date(),
      NotificationTypeEnum.Success,
      NotificationPosition.TopRight
    );
  }

  private notifyFailure(message: string): void {
    notify(
      "clearSnapshotFailure",
      message,
      "",
      new Date(),
      NotificationTypeEnum.Error,
      NotificationPosition.TopRight
    );
  }

  private findSnapshotStoreById(storeId: number): SnapshotStore<T, K> | null {
    console.log(`Looking for snapshot store with ID: ${storeId}`);

    const store = this.#snapshotStores.get(storeId);

    if (store) {
      console.log(`Snapshot store found:`, store);
      return store;
    } else {
      console.log(`Snapshot store with ID ${storeId} not found.`);
      return null;
    }
  }

  private async defaultSaveSnapshotStore(
    store: SnapshotStore<T, K>
  ): Promise<void> {
    try {
      console.log(
        `Saving snapshot store with ID: ${store.storeId} (default method)`
      );
      this.#snapshotStores.set(store.storeId, store);
      console.log(`Snapshot store saved successfully using default method.`);
    } catch (error) {
      console.error(
        `Failed to save snapshot store using default method:`,
        error
      );
    }
  }

  private async saveSnapshotStore(store: SnapshotStore<T, K>): Promise<void> {
    try {
      console.log(`Saving snapshot store with ID: ${store.storeId}`);
      this.#snapshotStores.set(store.storeId, store);
      console.log(`Snapshot store saved successfully.`);
    } catch (error) {
      console.error(`Failed to save snapshot store:`, error);
    }
  }

  // #todo saveSnapshotStore

  // Method to save multiple snapshot stores
  private async _saveSnapshotStores(
    id: string,
    snapshotId: string,
    snapshot: Snapshot<T, K>,
    snapshotStore: SnapshotStore<T, K>,
    snapshotManager: SnapshotManager<T, K>,
    payload: CreateSnapshotStoresPayload<T, K>,
    callback: (snapshotStore: SnapshotStore<T, K>[]) => void | null,
    snapshotStoreData?: SnapshotStore<T, K>[],
    category?: string | Category,
    categoryProperties?: string | CategoryProperties,
    snapshotDataConfig?: SnapshotStoreConfig<
      SnapshotWithCriteria<any, BaseData>,
      K
    >[]
  ): Promise<void> {
    try {
      console.log(`Saving multiple snapshot stores...`);
      if (snapshotStoreData) {
        for (const store of snapshotStoreData) {
          await this.saveSnapshotStore(store);
        }
      }
      console.log(`All snapshot stores saved successfully.`);
      if (callback) {
        callback(snapshotStoreData || []);
      }
    } catch (error) {
      console.error(`Failed to save one or more snapshot stores:`, error);
    }
  }




  // Helper method to consolidate metadata for efficiency
  private consolidateMetadata(metadata: Record<string, any>): Record<string, any> {
    // Placeholder for real consolidation logic
    // For example: if metadata has repetitive information, reduce it to a smaller format
    const consolidatedMetadata = { ...metadata };

    // Example: remove duplicate entries or unify them
    if (consolidatedMetadata.repetitiveField) {
      delete consolidatedMetadata.repetitiveField;
    }

    return consolidatedMetadata;
  }


  // Public method to save a single snapshot store (wrapper method)
  public async _saveSnapshotStore(store: SnapshotStore<T, K>): Promise<void> {
    try {
      console.log(
        `Public method: Saving snapshot store with ID: ${store.storeId}`
      );
      await this.saveSnapshotStore(store);
    } catch (error) {
      console.error(`Public method: Failed to save snapshot store:`, error);
    }
  }

  // Public method to save multiple snapshot stores using the default save method
  public async defaultSaveSnapshotStores(
    id: string,
    snapshotId: string,
    snapshot: Snapshot<T, K>,
    snapshotStore: SnapshotStore<T, K>,
    snapshotManager: SnapshotManager<T, K>,
    payload: CreateSnapshotStoresPayload<T, K>,
    callback: (snapshotStore: SnapshotStore<T, K>[]) => void | null,
    snapshotStoreData?: SnapshotStore<T, K>[],
    category?: string | Category,
    categoryProperties?: string | CategoryProperties,
    snapshotDataConfig?: SnapshotStoreConfig<T, K>[],
    
    snapshotDataConfigSearch?: SnapshotStoreConfig<
      SnapshotWithCriteria<any, BaseData>, 
      SnapshotWithCriteria<any, BaseData<any, any, StructuredMetadata<any, any>, Attachment>>
    >[],
    
  ): Promise<void> {
    try {
      console.log(
        `Saving multiple snapshot stores using default save method...`
      );
      if (snapshotStoreData) {
        for (const store of snapshotStoreData) {
          await this.defaultSaveSnapshotStore(store);
        }
      }
      console.log(
        `All snapshot stores saved successfully using default method.`
      );
      if (callback) {
        callback(snapshotStoreData || []);
      }
    } catch (error) {
      console.error(
        `Failed to save one or more snapshot stores using default method:`,
        error
      );
    }
  }

  public safeCastSnapshotStore<T extends  BaseData<any>, 
    K extends T = T>(
    snapshotStore: SnapshotStore<T, K>
  ): SnapshotStore<T, K> {
    return {
      ...snapshotStore,

      config: this.config,
      configs: this.configs,
      items: this.items,
      snapshotStores: this.#snapshotStores,
      defaultConfigs: this.defaultConfigs,
      name: this.name,
      version: this.version,
      schema: this.schema,
      snapshotItems: this.snapshotItems,
      nestedStores: this.nestedStores,
      snapshotIds: this.snapshotIds,
      dataStoreMethods: this.dataStoreMethods,
      delegate: this.delegate,
      getConfig: this.getConfig.bind(this),
      setConfig: this.setConfig.bind(this),
      ensureDelegate: this.ensureDelegate.bind(this),
      getSnapshotItems: this.getSnapshotItems.bind(this),

      handleDelegate: this.handleDelegate.bind(this),
      notifySuccess: this.notifySuccess.bind(this),
      notifyFailure: this.notifyFailure.bind(this),
      findSnapshotStoreById: this.findSnapshotStoreById.bind(this),

      defaultSaveSnapshotStore: this.defaultSaveSnapshotStore.bind(this),
      saveSnapshotStore: this.saveSnapshotStore.bind(this),
      findIndex: this.findIndex.bind(this),
      splice: this.splice.bind(this),

      addSnapshotToStore: this.addSnapshotToStore.bind(this),
      addSnapshotItem: this.addSnapshotItem.bind(this),
      addNestedStore: this.addNestedStore.bind(this),
      defaultSubscribeToSnapshots: this.defaultSubscribeToSnapshots.bind(this),

      defaultCreateSnapshotStores: this.defaultCreateSnapshotStores.bind(this),
      createSnapshotStores: this.createSnapshotStores.bind(this),
      subscribeToSnapshots: this.subscribeToSnapshots.bind(this),
      subscribeToSnapshot: this.subscribeToSnapshot.bind(this),

      defaultOnSnapshots: this.defaultOnSnapshots.bind(this),
      onSnapshots: this.onSnapshots.bind(this),
      transformSubscriber: this.transformSubscriber.bind(this),
      isCompatibleSnapshot: this.isCompatibleSnapshot.bind(this),

      isSnapshotStoreConfig: this.isSnapshotStoreConfig.bind(this),
      transformDelegate: this.transformDelegate.bind(this),
      getSavedSnapshotStore: this.getSavedSnapshotStore.bind(this),
      getConfigs: this.getConfigs.bind(this),

      getSavedSnapshotStores: this.getSavedSnapshotStores.bind(this),
      initializedState: this.initializedState,
      transformedDelegate: this.transformedDelegate,
      transformedSubscriber: this.transformedSubscriber.bind(this),

      getSnapshotIds: this.getSnapshotIds,
      getNestedStores: this.getNestedStores,
      getFindSnapshotStoreById: this.getFindSnapshotStoreById.bind(this),
      getAllKeys: this.getAllKeys.bind(this),

      mapSnapshot: this.mapSnapshot.bind(this),
      getAllItems: this.getAllItems.bind(this),
      addData: this.addData.bind(this),
      addDataStatus: this.addDataStatus.bind(this),

      removeData: this.removeData.bind(this),
      updateData: this.updateData.bind(this),
      updateDataTitle: this.updateDataTitle.bind(this),
      updateDataDescription: this.updateDataDescription.bind(this),

      updateDataStatus: this.updateDataStatus.bind(this),
      addDataSuccess: this.addDataSuccess.bind(this),
      getDataVersions: this.getDataVersions.bind(this),
      updateDataVersions: this.updateDataVersions.bind(this),

      getBackendVersion: this.getBackendVersion.bind(this),
      getFrontendVersion: this.getFrontendVersion.bind(this),
      fetchData: this.fetchData.bind(this),
      defaultSubscribeToSnapshot: this.defaultSubscribeToSnapshot.bind(this),

      handleSubscribeToSnapshot: this.handleSubscribeToSnapshot.bind(this),
      removeItem: this.removeItem.bind(this),
      getSnapshot: this.getSnapshot.bind(this),
      getSnapshotById: this.getSnapshotById.bind(this),

      getSnapshotSuccess: this.getSnapshotSuccess.bind(this),
      getSnapshotId: this.getSnapshotId.bind(this),
      getSnapshotArray: this.getSnapshotArray.bind(this),
      getItem: this.getItem.bind(this),

      addSnapshotFailure: this.addSnapshotFailure.bind(this),
      getDataStore: this.getDataStore.bind(this),
      addSnapshotSuccess: this.addSnapshotSuccess.bind(this),

      setItem: this.setItem.bind(this),
      getParentId: this.getParentId.bind(this),
      getChildIds: this.getChildIds.bind(this),
      addChild: this.addChild.bind(this),

      compareSnapshotState: this.compareSnapshotState.bind(this),
      deepCompare: this.deepCompare.bind(this),
      shallowCompare: this.shallowCompare.bind(this),
      getDataStoreMethods: this.getDataStoreMethods.bind(this),

      getDelegate: this.getDelegate.bind(this),
      determineCategory: this.determineCategory.bind(this),
      determineSnapshotStoreCategory:
        this.determineSnapshotStoreCategory.bind(this),
      determinePrefix: this.determinePrefix.bind(this),

      updateSnapshot: this.updateSnapshot.bind(this),
      updateSnapshotSuccess: this.updateSnapshotSuccess.bind(this),
      updateSnapshotFailure: this.updateSnapshotFailure.bind(this),
      removeSnapshot: this.removeSnapshot.bind(this),

      clearSnapshots: this.clearSnapshots.bind(this),
      addSnapshot: this.addSnapshot.bind(this),
      createInitSnapshot: this.createInitSnapshot.bind(this),
      createSnapshotSuccess: this.createSnapshotSuccess.bind(this),

      createSnapshotFailure: this.createSnapshotFailure.bind(this),
      setSnapshotSuccess: this.setSnapshotSuccess.bind(this),
      setSnapshotFailure: this.setSnapshotFailure.bind(this),
      updateSnapshots: this.updateSnapshots.bind(this),

      updateSnapshotsSuccess: this.updateSnapshotsSuccess.bind(this),
      updateSnapshotsFailure: this.updateSnapshotsFailure.bind(this),
      initSnapshot: this.initSnapshot.bind(this),
      takeSnapshot: this.takeSnapshot.bind(this),

      takeSnapshotSuccess: this.takeSnapshotSuccess.bind(this),
      takeSnapshotsSuccess: this.takeSnapshotsSuccess.bind(this),
      configureSnapshotStore: this.configureSnapshotStore.bind(this),
      updateSnapshotStore: this.updateSnapshotStore.bind(this),

      flatMap: this.flatMap.bind(this),
      setData: this.setData.bind(this),
      getState: this.getState.bind(this),
      setState: this.setState.bind(this),

      validateSnapshot: this.validateSnapshot.bind(this),
      handleSnapshot: this.handleSnapshot.bind(this),
      handleActions: this.handleActions.bind(this),
      setSnapshot: this.setSnapshot.bind(this),

      transformSnapshotConfig: this.transformSnapshotConfig.bind(this),
      setSnapshotData: this.setSnapshotData.bind(this),
      filterInvalidSnapshots: this.filterInvalidSnapshots.bind(this),
      setSnapshots: this.setSnapshots.bind(this),

      clearSnapshot: this.clearSnapshot.bind(this),
      mergeSnapshots: this.mergeSnapshots.bind(this),
      reduceSnapshots: this.reduceSnapshots.bind(this),
      sortSnapshots: this.sortSnapshots.bind(this),

      filterSnapshots: this.filterSnapshots.bind(this),
      mapSnapshotsAO: this.mapSnapshotsAO.bind(this),
      findSnapshot: this.findSnapshot.bind(this),
      getSubscribers: this.getSubscribers.bind(this),

      notify: this.notify.bind(this),
      notifySubscribers: this.notifySubscribers.bind(this),
      subscribe: this.subscribe.bind(this),
      unsubscribe: this.unsubscribe.bind(this),

      fetchSnapshot: this.fetchSnapshot.bind(this),
      fetchSnapshotSuccess: this.fetchSnapshotSuccess.bind(this),
      fetchSnapshotFailure: this.fetchSnapshotFailure.bind(this),
      getSnapshots: this.getSnapshots.bind(this),

      getAllSnapshots: this.getAllSnapshots.bind(this),
      getSnapshotStoreData: this.getSnapshotStoreData.bind(this),
      generateId: this.generateId.bind(this),
      batchFetchSnapshots: this.batchFetchSnapshots.bind(this),

      batchTakeSnapshotsRequest: this.batchTakeSnapshotsRequest.bind(this),
      batchUpdateSnapshotsRequest: this.batchUpdateSnapshotsRequest.bind(this),
      batchFetchSnapshotsSuccess: this.batchFetchSnapshotsSuccess.bind(this),
      batchFetchSnapshotsFailure: this.batchFetchSnapshotsFailure.bind(this),

      batchUpdateSnapshotsSuccess: this.batchUpdateSnapshotsSuccess.bind(this),
      batchUpdateSnapshotsFailure: this.batchUpdateSnapshotsFailure.bind(this),
      batchTakeSnapshot: this.batchTakeSnapshot.bind(this),
      handleSnapshotSuccess: this.handleSnapshotSuccess.bind(this),

      isExpired: this.isExpired.bind(this),
      compress: this.compress.bind(this),
      encrypt: this.encrypt.bind(this),
      decrypt: this.decrypt.bind(this),
      getFirstDelegate: this.getFirstDelegate.bind(this), // Bind 'this' correctly
      safeCastSnapshotStore: this.safeCastSnapshotStore.bind(this),
      getInitialDelegate: this.getInitialDelegate.bind(this),
      transformInitialState: this.transformInitialState.bind(this),
      transformSnapshot: this.transformSnapshot.bind(this),
      getName: this.getName.bind(this),
      getVersion: this.getVersion.bind(this),
      getSchema: this.getSchema.bind(this),
      restoreSnapshot: this.restoreSnapshot.bind(this),

      initializeWithData: this.initializeWithData.bind(this),
      hasSnapshots: this.hasSnapshots.bind(this),
      transformMappedSnapshotData: this.transformMappedSnapshotData.bind(this),
      transformSnapshotMethod: this.transformSnapshotMethod.bind(this),

      initializeDefaultConfigs: this.initializeDefaultConfigs.bind(this),
      _saveSnapshotStores: this._saveSnapshotStores.bind(this),
      defaultSaveSnapshotStores: this.defaultSaveSnapshotStores.bind(this),
      getTransformedSnapshot: this.getTransformedSnapshot.bind(this),

      [Symbol.iterator]: this[Symbol.iterator].bind(this),
      // Other properties...
    };
  }

  private getFirstDelegate() {
    if (!this.delegate || this.delegate.length === 0) {
      throw new Error("No delegates available.");
    }
    return this.delegate[0];
  }

  get getInitialDelegate() {
    return this.getFirstDelegate;
  }


  
  // Transform initialState from T to U
  private transformInitialState<U extends Data<U>,   T extends BaseData>(
    initialState: InitializedState<U, T>
  ): InitializedState<WrappedU, WrappedU> | null {
    if (isSnapshotStore(initialState)) {
      return {
        ...initialState,
        name: this.name, // Use 'this.name' if this is a property of the class
        hasSnapshots: this.hasSnapshots,

        transformInitialState,
        defaultSubscribeToSnapshots,
        getSnapshotStoreConfig,
        version,
        dataStoreMethods, getConfig, 
        getSnapshotItems, delegate, 
        findIndex, 
        get, 
        createSnapshotStores, 
        subscribeToSnapshots, 
        subscribeToSnapshot, 

        initializeWithData, 
        snapshotStores,
        schema,
        dataStores, 
        snapshotItems, 
        nestedStores, 
        snapshotIds,
        setConfig, 
        ensureDelegate,
        initializeDefaultConfigs, 
        handleDelegate, 
        notifySuccess, 
        notifyFailure, 
        findSnapshotStoreById, 
        defaultSaveSnapshotStore,
        saveSnapshotStore, 
        _saveSnapshotStores, 
        consolidateMetadata, 
        _saveSnapshotStore,
        transformSnapshot, 
        transformMappedSnapshotData, 
        transformSnapshotStore,
        defaultSaveSnapshotStores, 
        safeCastSnapshotStore, 
        getFirstDelegate, 
        getInitialDelegate,
        transformSnapshotMethod, 
        getName, 
        getVersion, 
        getSchema,
        restoreSnapshot, 
        config, 
        configs, 
        defaultConfigs,
        addSnapshotItem,
        addNestedStore, 
        defaultCreateSnapshotStores,
        items, 
        splice, 
        addSnapshotToStore, 
        getSnapshotStores, 
        getItems, 


        configOption: transformConfigOption(initialState.configOption),
      } as InitializedState<WrappedU, WrappedU>; // Ensure you cast properly.
    } else if (isSnapshot(initialState)) {
      return this.transformSnapshot<U, BaseData>(initialState); // Assuming this method handles transformation correctly
    } else if (initialState instanceof Map) {
      return new Map<string, Snapshot<WrappedU, WrappedU>>(
        Array.from(initialState.entries()).map(([key, value]) => [
          key,
          this.transformSnapshot<U, T>(value),
        ])
      ) as InitializedState<WrappedU, WrappedU>;
    } else {
      return null;
    }
  }
  
  // Transform a snapshot of type T to a snapshot of type U
  private transformSnapshot<U extends Data<U>, T extends BaseData>(
    snapshot: Snapshot<Data, T>
  ): Snapshot<WrappedU, WrappedU> {


    // Transform the initial state using InitializedState
    const transformedInitialState: InitializedState<WrappedU, WrappedU> | null =
      snapshot.initialState ? this.transformInitialState<U, T>(
        snapshot.initialState as InitializedState<U, T>) : null;

    const transformedRemoveSubscriber = this.transformSubscriber<WrappedU, T>(snapshot.removeSubscriber);

    // Create the transformed snapshot ensuring type compatibility
    const transformedSnapshot: Snapshot<WrappedU, WrappedU> = {
      ...snapshot,
      id: undefined,
      config: Promise.resolve(null),
      data: undefined,
      timestamp: undefined,
      label: undefined,
       events: undefined,

      mappedSnapshotData: this.transformMappedSnapshotData<WappedU, T>(
        snapshot.mappedSnapshotData
        //  ? snapshot.mappedSnapshotData : undefined
      ),
      snapshot: this.transformSnapshotMethod<U, T>(snapshot.snapshot),
      isCore: snapshot.isCore,
      initialConfig: snapshot.initialConfig, // Adjust type if necessary

      removeSubscriber: transformedRemoveSubscriber,
      onInitialize: snapshot.onInitialize,
      onError: snapshot.onError,
      taskIdToAssign: snapshot.taskIdToAssign,

      schema: snapshot.schema,
      currentCategory: snapshot.currentCategory,
      storeId: snapshot.storeId,
      versionInfo: snapshot.versionInfo,

      initializedState: transformedInitialState,
      criteria: snapshot.criteria,
      setCategory: snapshot.setCategory,
      applyStoreConfig: (
        snapshotStoreConfig?:
          | SnapshotStoreConfig<SnapshotUnion<BaseData<any, any, StructuredMetadata<any, any>, Attachment>>, U>
          | undefined
      ) => {
        if (snapshotStoreConfig) {
          // Apply initial state configuration
          if (snapshotStoreConfig.initialState) {
            // Cast the initialState to the expected type
            const newState =
              snapshotStoreConfig.initialState as InitializedState<
                SnapshotUnion<BaseData>,
                WrappedU
              >;

            // Update the initial state
            this.initialState = newState;
          }

          // Apply any specific configuration options
          if (snapshotStoreConfig.configOption) {
            // Ensure the config option is transformed correctly
            const transformedConfig = transformConfigOption(
              snapshotStoreConfig.configOption
            );
            // Assign the transformed option
            this.configOption = transformedConfig;
          }

          // Apply any transformations required for mapping data
          if (snapshotStoreConfig.mappedData) {
            // Ensure `mappedData` is an appropriate Map or iterable
            const entries = snapshotStoreConfig.mappedData.entries();
            const mappedDataArray: [string, Snapshot<WrappedU, WrappedU>][] = [];

            // Map through the entries and transform them as necessary
            for (const [key, value] of entries) {
              const transformedValue = this.transformMappedData<U, K, Meta>(value);
              mappedDataArray.push([key, transformedValue]);
            }

            // Create the new Map from the transformed entries
            this.mappedSnapshotData = new Map(mappedDataArray);
          }

          // Handle any additional configurations as needed
          // Add more logic here based on your application requirements.
        }
      },

      generateId: function (
        prefix: string,
        name: string,
        type: NotificationTypeEnum,
        id?: string,
        title?: string,
        chatThreadName?: string,
        chatMessageId?: string,
        chatThreadId?: string,
        dataDetails?: DataDetails<U, T, Meta, ExcludedFields>,
        generatorType?: string
      ): string {
        throw new Error("Function not implemented.");
      },
      snapshotData: undefined,
      snapshotContainer: null,
      getSnapshotItems: function (): (
        | SnapshotStoreConfig<WrappedU, WrappedU>
        | SnapshotItem<WrappedU, WrappedU>
        | undefined
      )[] {
        throw new Error("Function not implemented.");
      },
      defaultSubscribeToSnapshots: function (
        snapshotId: string,
        callback: (snapshots: Snapshots<U, K, Meta>) => Subscriber<WrappedU, WrappedU> | null,
        snapshot: Snapshot<WrappedU, WrappedU> | null
      ): void {
        throw new Error("Function not implemented.");
      },
      notify: function (
        id: string,
        message: string,
        content: Content<WrappedU, WrappedU>,
        data: any,
        date: Date,
        type: NotificationType
      ): void {
        throw new Error("Function not implemented.");
      },
      notifySubscribers: function (
        message: string,
        subscribers: Subscriber<WrappedU, WrappedU>[],
        data: Partial<SnapshotStoreConfig<SnapshotUnion<BaseData, Meta>, T>>
      ): Subscriber<WrappedU, WrappedU>[] {
        throw new Error("Function not implemented.");
      },
      getAllSnapshots: function (
        storeId: number,
        snapshotId: string,
        snapshotData: U,
        timestamp: string,
        type: string,
        event: Event,
        id: number,
        snapshotStore: SnapshotStore<WrappedU, WrappedU>,
        category: symbol | string | Category | undefined,
        categoryProperties: CategoryProperties | undefined,
        dataStoreMethods: DataStore<WrappedU, WrappedU>,
        data: U,
        dataCallback?:
          | ((
              subscribers: Subscriber<WrappedU, WrappedU>[],
              snapshots: Snapshots<U, K, Meta>
            ) => Promise<SnapshotUnion<U, Meta>[]>)
          | undefined
      ): Promise<Snapshot<WrappedU, WrappedU>[]> {
        throw new Error("Function not implemented.");
      },
      getSubscribers: function (
        subscribers: Subscriber<WrappedU, WrappedU>[],
        snapshots: Snapshots<U, K, Meta>
      ): Promise<{ subscribers: Subscriber<WrappedU, WrappedU>[]; snapshots: Snapshots<U, K, Meta> }> {
        throw new Error("Function not implemented.");
      },
      transformSubscriber: function (subscriberId: string, sub: Subscriber<WrappedU, WrappedU>): Subscriber<WrappedU, WrappedU> {
        throw new Error("Function not implemented.");
      },
      transformDelegate: function (): Promise<SnapshotStoreConfig<WrappedU, WrappedU>[]> {
        throw new Error("Function not implemented.");
      },
      getAllKeys: function (
        storeId: number,
        snapshotId: string,
        category: symbol | string | Category | undefined,
        categoryProperties: CategoryProperties | undefined,
        snapshot: Snapshot<SnapshotUnion<U, K>, U> | null,
        timestamp: string | number | Date | undefined,
        type: string,
        event: Event,
        id: number,
        snapshotStore: SnapshotStore<SnapshotUnion<U, K>, U>,
        data: U
      ): Promise<string[] | undefined> | undefined {
        throw new Error("Function not implemented.");
      },
      getAllValues: function (): SnapshotsArray<U, K> {
        throw new Error("Function not implemented.");
      },
      getAllItems: function (): Promise<Snapshot<WrappedU, WrappedU>[] | undefined> {
        throw new Error("Function not implemented.");
      },
      getSnapshotEntries: function (
        snapshotId: string
      ): Map<string, U> | undefined {
        throw new Error("Function not implemented.");
      },
      getAllSnapshotEntries: function (): Map<string, U>[] {
        throw new Error("Function not implemented.");
      },
      addDataStatus: function (
        id: number,
        status: StatusType | undefined
      ): void {
        throw new Error("Function not implemented.");
      },
      removeData: function (id: number): void {
        throw new Error("Function not implemented.");
      },
      updateData: function (id: number, newData: Snapshot<WrappedU, WrappedU>): void {
        throw new Error("Function not implemented.");
      },
      updateDataTitle: function (id: number, title: string): void {
        throw new Error("Function not implemented.");
      },
      updateDataDescription: function (id: number, description: string): void {
        throw new Error("Function not implemented.");
      },
      updateDataStatus: function (
        id: number,
        status: StatusType | undefined
      ): void {
        throw new Error("Function not implemented.");
      },
      addDataSuccess: function (payload: { data: Snapshot<WrappedU, WrappedU>[] }): void {
        throw new Error("Function not implemented.");
      },
      getDataVersions: function (
        id: number
      ): Promise<Snapshot<WrappedU, WrappedU>[] | undefined> {
        throw new Error("Function not implemented.");
      },
      updateDataVersions: function (
        id: number,
        versions: Snapshot<WrappedU, WrappedU>[]
      ): void {
        throw new Error("Function not implemented.");
      },
      getBackendVersion: function ():
        | IHydrateResult<number>
        | Promise<string>
        | undefined {
        throw new Error("Function not implemented.");
      },
      getFrontendVersion: function ():
        | IHydrateResult<number>
        | Promise<string>
        | undefined {
        throw new Error("Function not implemented.");
      },
      fetchStoreData: function (id: number): Promise<SnapshotStore<WrappedU, WrappedU>[]> {
        throw new Error("Function not implemented.");
      },
      fetchData: function (endpoint: string, id: number): Promise<SnapshotStore<WrappedU, WrappedU>> {
        throw new Error("Function not implemented.");
      },
      defaultSubscribeToSnapshot: function (
        snapshotId: string,
        callback: Callback<Snapshot<WrappedU, WrappedU>>,
        snapshot: Snapshot<WrappedU, WrappedU>
      ): string {
        throw new Error("Function not implemented.");
      },
      handleSubscribeToSnapshot: function (
        snapshotId: string,
        callback: Callback<Snapshot<WrappedU, WrappedU>>,
        snapshot: Snapshot<WrappedU, WrappedU>
      ): void {
        throw new Error("Function not implemented.");
      },
      removeItem: function (key: string | number): Promise<void> {
        throw new Error("Function not implemented.");
      },
      getSnapshot: function (
        snapshot: (
          id: string | number
        ) =>
          | Promise<{
              snapshotId: number;
              snapshotData: SnapshotData<WrappedU, WrappedU>;
              category: symbol | string | Category | undefined
              categoryProperties: CategoryProperties;
              dataStoreMethods: DataStore<WrappedU, WrappedU>;
              timestamp: string | number | Date | undefined;
              id: string | number | undefined;
              snapshot: Snapshot<WrappedU, WrappedU>;
              snapshotStore: SnapshotStore<WrappedU, WrappedU>;
              data: U;
            }>
          | undefined
      ): Promise<Snapshot<WrappedU, WrappedU> | undefined> {
        throw new Error("Function not implemented.");
      },
      getSnapshotSuccess: function (
        snapshot: Snapshot<SnapshotUnion<BaseData, Meta>, U>,
        subscribers: Subscriber<WrappedU, WrappedU>[]
      ): Promise<SnapshotStore<WrappedU, WrappedU>> {
        throw new Error("Function not implemented.");
      },
      setItem: function (key: U, value: U): Promise<void> {
        throw new Error("Function not implemented.");
      },
      getItem: function (key: U): Promise<Snapshot<WrappedU, WrappedU> | undefined> {
        throw new Error("Function not implemented.");
      },
      getDataStore: function (): Promise<InitializedDataStore> {
        throw new Error("Function not implemented.");
      },
      getDataStoreMap: function (): Promise<Map<string, Snapshot<WrappedU, WrappedU>>> {
        throw new Error("Function not implemented.");
      },
      addSnapshotSuccess: function (
        snapshot: Snapshot<WrappedU, WrappedU>,
        subscribers: Subscriber<WrappedU, WrappedU>[]
      ): void {
        throw new Error("Function not implemented.");
      },
      deepCompare: function (objA: any, objB: any): boolean {
        throw new Error("Function not implemented.");
      },
      shallowCompare: function (objA: any, objB: any): boolean {
        throw new Error("Function not implemented.");
      },
      getDataStoreMethods: function (): DataStoreMethods<WrappedU, WrappedU> {
        throw new Error("Function not implemented.");
      },
      getDelegate: function (context: {
        useSimulatedDataSource: boolean;
        simulatedDataSource: SnapshotStoreConfig<WrappedU, WrappedU>[];
      }): Promise<SnapshotStoreConfig<WrappedU, WrappedU>[]> {
        throw new Error("Function not implemented.");
      },
      determineCategory: function (
        snapshot: Snapshot<WrappedU, WrappedU> | null | undefined
      ): string {
        throw new Error("Function not implemented.");
      },
      determinePrefix: function (
        snapshot: U | null | undefined,
        category: string
      ): string {
        throw new Error("Function not implemented.");
      },
      removeSnapshot: function (snapshotToRemove: Snapshot<WrappedU, WrappedU>): void {
        throw new Error("Function not implemented.");
      },
      addSnapshotItem: function (
        item: Snapshot<WrappedU, WrappedU> | SnapshotStoreConfig<WrappedU, WrappedU>
      ): void {
        throw new Error("Function not implemented.");
      },
      addNestedStore: function (store: SnapshotStore<WrappedU, WrappedU>): void {
        throw new Error("Function not implemented.");
      },
      clearSnapshots: function (): void {
        throw new Error("Function not implemented.");
      },
      addSnapshot: function (
        snapshot: Snapshot<WrappedU, WrappedU>,
        snapshotId: string,
        subscribers: SubscriberCollection<WrappedU, WrappedU>
      ): Promise<Snapshot<WrappedU, WrappedU> | undefined> {
        throw new Error("Function not implemented.");
      },
      emit: function (
        event: string,
        snapshot: Snapshot<WrappedU, WrappedU>,
        snapshotId: string,
        subscribers: SubscriberCollection<WrappedU, WrappedU>,
        snapshotStore: SnapshotStore<WrappedU, WrappedU>,
        dataItems: RealtimeDataItem[],
        criteria: SnapshotWithCriteria<WrappedU, WrappedU>,
        category: symbol | string | Category | undefined
      ): void {
        throw new Error("Function not implemented.");
      },

      createSnapshot: createSnapshot,

      createInitSnapshot: function (
        id: string,
        initialData: U,
        snapshotData: SnapshotData<any, U>,
        snapshotStoreConfig: SnapshotStoreConfig<any, U>,
        category: symbol | string | Category | undefined,
        additionalData: any
      ): Promise<SnapshotWithCriteria<WrappedU, WrappedU>> {
        throw new Error("Function not implemented.");
      },
      addStoreConfig: function (config: SnapshotStoreConfig<WrappedU, WrappedU>): void {
        throw new Error("Function not implemented.");
      },
      handleSnapshotConfig: function (config: SnapshotStoreConfig<WrappedU, WrappedU>): void {
        throw new Error("Function not implemented.");
      },
      getSnapshotConfig: function (
        snapshotId: string | null,
        snapshotContainer: SnapshotContainer<WrappedU, WrappedU>,
        criteria: CriteriaType,
        category: symbol | string | Category | undefined,
        categoryProperties: CategoryProperties | undefined,
        delegate: any,
        snapshotData: SnapshotData<WrappedU, WrappedU>,
        snapshot: (
          id: string,
          snapshotId: string | null,
          snapshotData: SnapshotData<WrappedU, WrappedU>,
          category: symbol | string | Category | undefined
        ) => void
      ): SnapshotStoreConfig<WrappedU, WrappedU>[] | undefined {
        throw new Error("Function not implemented.");
      },
      getSnapshotListByCriteria: function (
        criteria: SnapshotStoreConfig<WrappedU, WrappedU>
      ): Promise<Snapshot<WrappedU, WrappedU>[]> {
        throw new Error("Function not implemented.");
      },
      setSnapshotSuccess: function (
        snapshotData: SnapshotData<WrappedU, WrappedU>,
        subscribers: SubscriberCollection<WrappedU, WrappedU>
      ): void {
        throw new Error("Function not implemented.");
      },
      setSnapshotFailure: function (error: Error): void {
        throw new Error("Function not implemented.");
      },
      updateSnapshots: function (): void {
        throw new Error("Function not implemented.");
      },
      updateSnapshotsSuccess: function (
        snapshotData: (
          subscribers: Subscriber<WrappedU, WrappedU>[],
          snapshot: Snapshots<WrappedU, WrappedU>
        ) => void
      ): void {
        throw new Error("Function not implemented.");
      },
      updateSnapshotsFailure: function (error: Payload): void {
        throw new Error("Function not implemented.");
      },
      initSnapshot: function (
        snapshot: Snapshot<WrappedU, WrappedU> | SnapshotStore<WrappedU, WrappedU> | null,
        snapshotId: string | number | null,
        snapshotData: SnapshotData<WrappedU, WrappedU>,
        category: symbol | string | Category | undefined,
        categoryProperties: CategoryProperties | undefined,
        snapshotConfig: SnapshotStoreConfig<WrappedU, WrappedU>,
        callback: (snapshotStore: SnapshotStore<any, any>) => void,
        snapshotStoreConfig: SnapshotStoreConfig<U, K>,
        snapshotStoreConfigSearch: SnapshotStoreConfig<U, K>
      
      ): void {
        throw new Error("Function not implemented.");
      },
      takeSnapshot: function (
        snapshot: Snapshot<WrappedU, WrappedU>,
        subscribers: Subscriber<WrappedU, WrappedU>[]
      ): Promise<{ snapshot: Snapshot<WrappedU, WrappedU> }> {
        throw new Error("Function not implemented.");
      },
      takeSnapshotSuccess: function (snapshot: Snapshot<WrappedU, WrappedU>): void {
        throw new Error("Function not implemented.");
      },
      takeSnapshotsSuccess: function (snapshots: U[]): void {
        throw new Error("Function not implemented.");
      },
      flatMap: function <R extends Iterable<any>>(
        callback: (
          value: SnapshotStoreConfig<R, U>,
          index: number,
          array: SnapshotStoreConfig<R, U>[]
        ) => R
      ): R extends (infer I)[] ? I[] : R[] {
        throw new Error("Function not implemented.");
      },
      getState: function () {
        throw new Error("Function not implemented.");
      },
      setState: function (state: any): void {
        throw new Error("Function not implemented.");
      },
      validateSnapshot: function (
        snapshotId: string,
        snapshot: Snapshot<WrappedU, WrappedU>
      ): boolean {
        throw new Error("Function not implemented.");
      },
      handleActions: function (action: (selectedText: string) => void): void {
        throw new Error("Function not implemented.");
      },
      setSnapshot: function (snapshot: Snapshot<WrappedU, WrappedU>): void {
        throw new Error("Function not implemented.");
      },
      transformSnapshotConfig: function <U extends BaseData>(
        config: SnapshotConfig<WrappedU, WrappedU>
      ): SnapshotConfig<WrappedU, WrappedU> {
        throw new Error("Function not implemented.");
      },
      setSnapshots: function (snapshots: Snapshots<U, K>): void {
        throw new Error("Function not implemented.");
      },
      clearSnapshot: function (): void {
        throw new Error("Function not implemented.");
      },
      mergeSnapshots: function (
        snapshots: Snapshots<U, K>,
        category: string
      ): void {
        throw new Error("Function not implemented.");
      },
      reduceSnapshots: function <U extends BaseData>(
        callback: (acc: U, snapshot: Snapshot<WrappedU, WrappedU>) => U,
        initialValue: U
      ): U | undefined {
        throw new Error("Function not implemented.");
      },
      sortSnapshots: function (): void {
        throw new Error("Function not implemented.");
      },
      filterSnapshots: function (): void {
        throw new Error("Function not implemented.");
      },
      findSnapshot: function (
        predicate: (snapshot: Snapshot<WrappedU, WrappedU>) => boolean
      ): Snapshot<WrappedU, WrappedU> | undefined {
        throw new Error("Function not implemented.");
      },
      mapSnapshots: function <T extends  BaseData<any>, 
        V extends Data>(
        storeIds: number[],
        snapshotId: string,
        category: symbol | string | Category | undefined,
        categoryProperties: CategoryProperties | undefined,
        snapshot: Snapshot<T, T>,
        timestamp: string | number | Date | undefined,
        type: string,
        event: Event,
        id: number,
        snapshotStore: SnapshotStore<T>,
        data: T,
        callback: (
          storeIds: number[],
          snapshotId: string,
          category: symbol | string | Category | undefined,
          categoryProperties: CategoryProperties | undefined,
          snapshot: Snapshot<T, T>,
          timestamp: string | number | Date | undefined,
          type: string,
          event: Event,
          id: number,
          snapshotStore: SnapshotStore<T>,
          data: V,  // Use V for the callback data type
          index: number
        ) => V  // Return type of the callback
      ): V[] {  // Return type of mapSnapshots
        // Your implementation logic here
        throw new Error("Function not implemented.");
      },
      takeLatestSnapshot: function (): Snapshot<WrappedU, WrappedU> | undefined {
        throw new Error("Function not implemented.");
      },
      updateSnapshot: function (
        snapshotId: string,
        data: Map<string, Snapshot<WrappedU, WrappedU>>,
        events: Record<string, CalendarManagerStoreClass<WrappedU, WrappedU>[]>,
        snapshotStore: SnapshotStore<WrappedU, WrappedU>,
        dataItems: RealtimeDataItem[],
        newData: Snapshot<WrappedU, WrappedU>,
        payload: UpdateSnapshotPayload<U, Meta>,
        store: SnapshotStore<any, U>
      ): Promise<{ snapshot: Snapshot<T, K>; }> {
        throw new Error("Function not implemented.");
      },

      addSnapshotSubscriber: function (
        snapshotId: string,
        subscriber: Subscriber<WrappedU, WrappedU>
      ): void {
        throw new Error("Function not implemented.");
      },

      removeSnapshotSubscriber: function (
        snapshotId: string,
        subscriber: Subscriber<WrappedU, WrappedU>
      ): void {
        throw new Error("Function not implemented.");
      },

      getSnapshotConfigItems: function (): SnapshotStoreConfig<WrappedU, WrappedU>[] {
        throw new Error("Function not implemented.");
      },

      subscribeToSnapshots: function (
        snapshotStore: SnapshotStore<WrappedU, WrappedU>,
        snapshotId: string,
        snapshotData: SnapshotData<T, K>,
        category: Category | undefined,
        snapshotCnfig: SnapshotStoreConfig<T, K>,
        callback: (snapshots: Snapshots<U, K, Meta>) => Subscriber<WrappedU, WrappedU> | null,
        snapshot: Snapshot<WrappedU, WrappedU> | null,
        unsubscribe?: UnsubscribeDetails,
      ): [] | SnapshotsArray<U, Meta> {
        throw new Error("Function not implemented.");
      },
      executeSnapshotAction: function (
        actionType: SnapshotActionType,
        actionData: any
      ): Promise<void> {
        throw new Error("Function not implemented.");
      },
      subscribeToSnapshot: function (
        snapshotId: string,
        callback: Callback<Snapshot<WrappedU, WrappedU>>,
        snapshot: Snapshot<WrappedU, WrappedU>
      ): Snapshot<WrappedU, WrappedU> {
        throw new Error("Function not implemented.");
      },
      unsubscribeFromSnapshot: function (
        snapshotId: string,
        callback: (snapshot: Snapshot<WrappedU, WrappedU>) => void
      ): void {
        throw new Error("Function not implemented.");
      },
      subscribeToSnapshotsSuccess: function (
        callback: (snapshots: Snapshots<U, K, Meta>) => void
      ): string {
        throw new Error("Function not implemented.");
      },
      unsubscribeFromSnapshots: function (
        callback: (snapshots: Snapshots<U, K, Meta>) => void
      ): void {
        throw new Error("Function not implemented.");
      },
      getSnapshotItemsSuccess: function ():
        | SnapshotItem<Data, any>[]
        | undefined {
        throw new Error("Function not implemented.");
      },
      getSnapshotItemSuccess: function (): SnapshotItem<Data, any> | undefined {
        throw new Error("Function not implemented.");
      },
      getSnapshotKeys: function (): string[] | undefined {
        throw new Error("Function not implemented.");
      },
      getSnapshotIdSuccess: function (): string | undefined {
        throw new Error("Function not implemented.");
      },
      getSnapshotValuesSuccess: function ():
        | SnapshotItem<Data, any>[]
        | undefined {
        throw new Error("Function not implemented.");
      },
      getSnapshotWithCriteria: function (
        criteria: SnapshotStoreConfig<WrappedU, WrappedU>
      ): SnapshotStoreConfig<WrappedU, WrappedU> {
        throw new Error("Function not implemented.");
      },
      reduceSnapshotItems: function (
        callback: (acc: any, snapshot: Snapshot<WrappedU, WrappedU>) => any,
        initialValue: any
      ) {
        throw new Error("Function not implemented.");
      },
      subscribeToSnapshotList: function (
        snapshotId: string,
        callback: (snapshots: Snapshot<WrappedU, WrappedU>) => void
      ): void {
        throw new Error("Function not implemented.");
      },

      restoreSnapshot: function (
        id: string,
        snapshot: Snapshot<WrappedU, WrappedU>,
        snapshotId: string,
        snapshotData: SnapshotData<WrappedU, WrappedU>,
        savedState: SnapshotStore<WrappedU, WrappedU>,
        category: symbol | string | Category | undefined,
        callback: (snapshot: WrappedU) => void,
        snapshots: SnapshotsArray<WrappedU, K, Meta>,
        type: string,
        event: string | SnapshotEvents<WrappedU, WrappedU>,
        subscribers: SubscriberCollection<WrappedU, WrappedU>,
        snapshotContainer?: U | undefined,
        snapshotStoreConfig?:
          | SnapshotStoreConfig<SnapshotUnion<BaseData, Meta>, U>
          | undefined
      ): void {
        throw new Error("Function not implemented.");
      },
      handleSnapshot: function (
        id: string,
        snapshotId: string | number | null,
        snapshot: U extends SnapshotData<WrappedU, WrappedU> ? Snapshot<WrappedU, WrappedU> : null,
        snapshotData: WrappedU,
        category: symbol | string | Category | undefined,
        categoryProperties: CategoryProperties | undefined,
        callback: (snapshot: U) => void,
        snapshots: SnapshotsArray<U, Meta>,
        type: string,
        event: Event,
        snapshotContainer?: U | undefined,
        snapshotStoreConfig?: SnapshotStoreConfig<U, any> | null | undefined,
        storeConfigs?: SnapshotStoreConfig<WrappedU, WrappedU>[]
      ): Promise<Snapshot<WrappedU, WrappedU> | null> {
        throw new Error("Function not implemented.");
      },
      subscribe: function (
        snapshotId: string | number | null,
        unsubscribe: UnsubscribeDetails,
        subscriber: Subscriber<WrappedU, WrappedU> | null,
        data: U,
        event: Event,
        callback: Callback<Snapshot<WrappedU, WrappedU>>,
        value: U
      ): [] | SnapshotsArray<U, Meta> {
        throw new Error("Function not implemented.");
      },
      meta: {},
      items: [],
      subscribers: [],
      snapshotStore: null,
      setSnapshotCategory: function (id: string, newCategory: Category): void {
        throw new Error("Function not implemented.");
      },
      getSnapshotCategory: function (id: string): Category | undefined {
        throw new Error("Function not implemented.");
      },
      
      getSnapshotData: function (
        id: string | number | undefined,
        snapshotId: number,
        snapshotData: WrappedU,
        category: symbol | string | Category | undefined,
        categoryProperties: CategoryProperties | undefined,
        dataStoreMethods: DataStore<WrappedU, WrappedU>
      ): Map<string, Snapshot<WrappedU, WrappedU>> | null | undefined {
        throw new Error("Function not implemented.");
      },
      deleteSnapshot: function (id: string): void {
        throw new Error("Function not implemented.");
      },
      getSnapshots: function (category: string, data: Snapshots<U, K, Meta>): void {
        throw new Error("Function not implemented.");
      },
      compareSnapshots: function (
        snap1: Snapshot<WrappedU, WrappedU>,
        snap2: Snapshot<WrappedU, WrappedU>
      ): {
        snapshot1: Snapshot<WrappedU, WrappedU>;
        snapshot2: Snapshot<WrappedU, WrappedU>;
        differences: Record<string, { snapshot1: any; snapshot2: any }>;
        versionHistory: { snapshot1Version: number; snapshot2Version: number };
      } | null {
        throw new Error("Function not implemented.");
      },
      compareSnapshotItems: function (
        snap1: Snapshot<WrappedU, WrappedU>,
        snap2: Snapshot<WrappedU, WrappedU>,
        keys: string[]
      ): {
        itemDifferences: Record<
          string,
          {
            snapshot1: any;
            snapshot2: any;
            differences: { [key: string]: { value1: any; value2: any } };
          }
        >;
      } | null {
        throw new Error("Function not implemented.");
      },
      batchTakeSnapshot: function (
        snapshotId: string,
        snapshotStore: SnapshotStore<WrappedU, WrappedU>,
        snapshots: Snapshots<U, K, Meta>
      ): Promise<{ snapshots: Snapshots<U, K, Meta> }> {
        throw new Error("Function not implemented.");
      },
      batchFetchSnapshots: function (
        criteria: any,
        snapshotData: (
          snapshotIds: string[],
          subscribers: SubscriberCollection<WrappedU, WrappedU>,
          snapshots: Snapshots<U, K, Meta>
        ) => Promise<{ subscribers: SubscriberCollection<WrappedU, WrappedU> }>
      ): Promise<Snapshot<WrappedU, WrappedU>[]> {
        throw new Error("Function not implemented.");
      },
      batchTakeSnapshotsRequest: function (
        criteria: any,
        snapshotData: (
          snapshotIds: string[],
          snapshots: Snapshots<U, K, Meta>,
          subscribers: Subscriber<WrappedU, WrappedU>[]
        ) => Promise<{ subscribers: Subscriber<WrappedU, WrappedU>[] }>
      ): Promise<void> {
        throw new Error("Function not implemented.");
      },
      batchUpdateSnapshotsRequest: function (
        snapshotData: (
          subscribers: SubscriberCollection<WrappedU, WrappedU>,
          
        ) => Promise<{
          subscribers: SubscriberCollection<WrappedU, WrappedU>,
          snapshots: Snapshots<U, K, Meta>
        }>
      ): Promise<void> {
        throw new Error("Function not implemented.");
      },
      filterSnapshotsByStatus: function (status: string): Snapshots<U, K, Meta> {
        throw new Error("Function not implemented.");
      },
      filterSnapshotsByCategory: function (category: string): Snapshots<U, K, Meta> {
        throw new Error("Function not implemented.");
      },
      filterSnapshotsByTag: function (tag: string): Snapshots<U, K, Meta> {
        throw new Error("Function not implemented.");
      },
      batchFetchSnapshotsSuccess: function (
        subscribers: Subscriber<WrappedU, WrappedU>[],
        snapshots: Snapshots<U, K, Meta>
      ): void {
        throw new Error("Function not implemented.");
      },
      batchFetchSnapshotsFailure: function (
        date: Date,
        snapshotManager: SnapshotManager<WrappedU, WrappedU>,
        snapshot: Snapshot<WrappedU, WrappedU>,
        payload: { error: Error }
      ): void {
        throw new Error("Function not implemented.");
      },
      batchUpdateSnapshotsSuccess: function (
        subscribers: Subscriber<WrappedU, WrappedU>[],
        snapshots: Snapshots<U, K, Meta>
      ): void {
        throw new Error("Function not implemented.");
      },
      batchUpdateSnapshotsFailure: function (
        date: Date,
        snapshotId: string,
        snapshotManager: SnapshotManager<WrappedU, WrappedU>,
        snapshot: Snapshot<WrappedU, WrappedU>,
        payload: { error: Error }
      ): void {
        throw new Error("Function not implemented.");
      },
      handleSnapshotSuccess: function (
        message: string,
        snapshot: Snapshot<WrappedU, WrappedU> | null,
        snapshotId: string
      ): void {
        throw new Error("Function not implemented.");
      },

      handleSnapshotFailure: function (error: Error, snapshotId: string): void {
        throw new Error("Function not implemented.");
      },

      getSnapshotId: function (
        key: string | SnapshotData<WrappedU, WrappedU>,
        snapshot: Snapshot<WrappedU, WrappedU>
      ): unknown {
        throw new Error("Function not implemented.");
      },
      compareSnapshotState: function (
        snapshot1: Snapshot<WrappedU, WrappedU>,
        snapshot2: Snapshot<WrappedU, WrappedU>
      ): boolean {
        throw new Error("Function not implemented.");
      },
      payload: undefined,
      dataItems: null,
      newData: null,
      getInitialState: function (): Snapshot<WrappedU, WrappedU> | null {
        throw new Error("Function not implemented.");
      },
      getConfigOption: function (optionKey: string) {
        throw new Error("Function not implemented.");
      },
      getTimestamp: function (): Date | undefined {
        throw new Error("Function not implemented.");
      },
      getStores: function (
        storeId: number,
        snapshotStores: SnapshotStore<WrappedU, WrappedU>[],
        snapshotStoreConfigs: SnapshotStoreConfig<WrappedU, WrappedU>[]
      ): SnapshotStore<WrappedU, WrappedU>[] {
        throw new Error("Function not implemented.");
      },
      getData: function (
        id: string | number,
        snapshot: Snapshot<WrappedU, WrappedU>
      ): Data | Map<string, Snapshot<WrappedU, WrappedU>> | null | undefined {
        throw new Error("Function not implemented.");
      },
      setData: function (id: string, data: Map<string, Snapshot<WrappedU, WrappedU>>): void {
        throw new Error("Function not implemented.");
      },
      addData: function (id: string, data: Partial<Snapshot<WrappedU, WrappedU>>): void {
        throw new Error("Function not implemented.");
      },
      stores: null,
      getStore: function (
        storeId: number,
        snapshotStore: SnapshotStore<WrappedU, WrappedU>,
        snapshotId: string | null,
        snapshot: Snapshot<WrappedU, WrappedU>,
        snapshotStoreConfig: SnapshotStoreConfig<WrappedU, WrappedU>,
        type: string,
        event: Event
      ): SnapshotStore<WrappedU, WrappedU> | null {
        throw new Error("Function not implemented.");
      },
      addStore: function (
        storeId: number,
        snapshotId: string,
        snapshotStore: SnapshotStore<WrappedU, WrappedU>,
        snapshot: Snapshot<WrappedU, WrappedU>,
        type: string,
        event: Event
      ): SnapshotStore<WrappedU, WrappedU> | null {
        throw new Error("Function not implemented.");
      },
      mapSnapshot: function (
        id: number,
        storeId: string,
        snapshotStore: SnapshotStore<WrappedU, WrappedU>,
        snapshotContainer: SnapshotContainer<WrappedU, WrappedU>,
        snapshotId: string,
        criteria: CriteriaType,
        snapshot: Snapshot<WrappedU, WrappedU>,
        type: string,
        event: Event,
        callback: (snapshot: Snapshot<WrappedU, WrappedU>) => void,
        mapFn: (item: U) => U
      ): Snapshot<WrappedU, WrappedU> | null {
        throw new Error("Function not implemented.");
      },
      mapSnapshotWithDetails: function (
        storeId: number,
        snapshotStore: SnapshotStore<WrappedU, WrappedU>,
        snapshotId: string,
        snapshot: Snapshot<WrappedU, WrappedU>,
        type: string,
        event: Event,
        callback: (snapshot: Snapshot<WrappedU, WrappedU>) => void
      ): SnapshotWithData<WrappedU, WrappedU> | null {
        throw new Error("Function not implemented.");
      },
      removeStore: function (
        storeId: number,
        store: SnapshotStore<WrappedU, WrappedU>,
        snapshotId: string,
        snapshot: Snapshot<WrappedU, WrappedU>,
        type: string,
        event: Event
      ): void {
        throw new Error("Function not implemented.");
      },
      unsubscribe: function (
        unsubscribeDetails: {
          userId: string;
          snapshotId: string;
          unsubscribeType: string;
          unsubscribeDate: Date;
          unsubscribeReason: string;
          unsubscribeData: any;
        },
        callback: Callback<Snapshot<WrappedU, WrappedU>> | null
      ): void {
        throw new Error("Function not implemented.");
      },
      fetchSnapshot: function (
        callback: (
          snapshotId: string,
          payload: FetchSnapshotPayload<WrappedU, WrappedU> | undefined,
          snapshotStore: SnapshotStore<WrappedU, WrappedU>,
          payloadData: U | Data,
          category: symbol | string | Category | undefined,
          categoryProperties: CategoryProperties | undefined,
          timestamp: Date,
          data: U,
          delegate: SnapshotWithCriteria<WrappedU, WrappedU>[]
        ) => Snapshot<WrappedU, WrappedU>
      ): Promise<Snapshot<WrappedU, WrappedU> | undefined> {
        throw new Error("Function not implemented.");
      },
      fetchSnapshotSuccess: function (
        snapshotId: string,
        snapshotStore: SnapshotStore<WrappedU, WrappedU>,
        payload: FetchSnapshotPayload<WrappedU, WrappedU> | undefined,
        snapshot: Snapshot<WrappedU, WrappedU>,
        data: U,
        delegate: SnapshotWithCriteria<WrappedU, WrappedU>[],
        snapshotData: (
          snapshotManager: SnapshotManager<SnapshotUnion<BaseData, Meta>, T>,
          subscribers: Subscriber<U, K>[],
          snapshot: Snapshot<SnapshotUnion<BaseData, Meta>, U>
        ) => void,
      ): SnapshotWithCriteria<WrappedU, WrappedU>[] {
        throw new Error("Function not implemented.");
      },
      updateSnapshotFailure: function (
        snapshotId: string,
        snapshotManager: SnapshotManager<WrappedU, WrappedU>,
        snapshot: Snapshot<WrappedU, WrappedU>,
        date: Date | undefined,
        payload: { error: Error }
      ): void {
        throw new Error("Function not implemented.");
      },
      fetchSnapshotFailure: function (
        snapshotId: string,
        snapshotManager: SnapshotManager<WrappedU, WrappedU>,
        snapshot: Snapshot<WrappedU, WrappedU>,
        date: Date | undefined,
        payload: { error: Error }
      ): void {
        throw new Error("Function not implemented.");
      },
      addSnapshotFailure: function (
        date: Date,
        snapshotManager: SnapshotManager<WrappedU, WrappedU>,
        snapshot: Snapshot<WrappedU, WrappedU>,
        payload: { error: Error }
      ): void {
        throw new Error("Function not implemented.");
      },
      configureSnapshotStore: function (
        snapshotStore: SnapshotStore<WrappedU, WrappedU>,
        storeId: number,
        data: Map<string, Snapshot<WrappedU, WrappedU>>,
        events: Record<string, CalendarManagerStoreClass<WrappedU, WrappedU>[]>,
        dataItems: RealtimeDataItem[],
        newData: Snapshot<WrappedU, WrappedU>,
        payload: ConfigureSnapshotStorePayload<WrappedU, WrappedU>,
        store: SnapshotStore<any, U>,
        callback: (snapshotStore: SnapshotStore<WrappedU, WrappedU>) => void,
        config: SnapshotStoreConfig<WrappedU, WrappedU>
      ): void {
        throw new Error("Function not implemented.");
      },
      updateSnapshotSuccess: function (
        snapshotId: string,
        snapshotManager: SnapshotManager<WrappedU, WrappedU>,
        snapshot: Snapshot<WrappedU, WrappedU>,
        payload?: { data?: any }
      ): void {
        throw new Error("Function not implemented.");
      },
      createSnapshotFailure: function (
        date: Date,
        snapshotId: string,
        snapshotManager: SnapshotManager<WrappedU, WrappedU>,
        snapshot: Snapshot<WrappedU, WrappedU>,
        payload: { error: Error }
      ): void {
        throw new Error("Function not implemented.");
      },
      createSnapshotSuccess: function (
        snapshotId: string,
        snapshotManager: SnapshotManager<WrappedU, WrappedU>,
        snapshot: Snapshot<WrappedU, WrappedU>,
        payload?: { data?: any }
      ): void {
        throw new Error("Function not implemented.");
      },
      createSnapshots: function (
        id: string,
        snapshotId: string,
        snapshots: Snapshot<WrappedU, WrappedU>[],
        snapshotManager: SnapshotManager<WrappedU, WrappedU>,
        payload: CreateSnapshotsPayload<WrappedU, WrappedU>,
        callback: (snapshots: Snapshot<WrappedU, WrappedU>[]) => void | null,
        snapshotDataConfig?: SnapshotConfig<WrappedU, WrappedU>[] | undefined,
        category?: string | Category,
        categoryProperties?: string | CategoryProperties
      ): Snapshot<WrappedU, WrappedU>[] | null {
        throw new Error("Function not implemented.");
      },
      snapConfig: undefined,
      onSnapshot: function (
        snapshotId: string,
        snapshot: Snapshot<WrappedU, WrappedU>,
        type: string,
        event: Event,
        callback: (snapshot: Snapshot<WrappedU, WrappedU>) => void
      ): void {
        throw new Error("Function not implemented.");
      },
      onSnapshots: function (
        snapshotId: string,
        snapshots: Snapshots<U, K, Meta>,
        type: string,
        event: Event,
        callback: (snapshots: Snapshots<U, K, Meta>) => void
      ): void {
        throw new Error("Function not implemented.");
      },
      childIds: {} as U[] | undefined,
      getParentId: function (
        id: string,
        snapshot: Snapshot<SnapshotUnion<BaseData, Meta>, U>
      ): string | null {
        throw new Error("Function not implemented.");
      },
      getChildIds: function (
        id: string,
        childSnapshot: Snapshot<BaseData, U>
      ): (string | number | undefined)[] {
        throw new Error("Function not implemented.");
      },
      snapshotCategory: undefined,
      snapshotSubscriberId: undefined,
      addChild: function (
        parentId: string,
        childId: string,
        childSnapshot: Snapshot<WrappedU, WrappedU>
      ): void {
        throw new Error("Function not implemented.");
      },
      removeChild: function (
        childId: string,
        parentId: string,
        parentSnapshot: Snapshot<Data, Data>,
        childSnapshot: Snapshot<Data, Data>
      ): void {
        throw new Error("Function not implemented.");
      },
      getChildren: function (
        id: string,
        childSnapshot: Snapshot<WrappedU, WrappedU>
      ): CoreSnapshot<T, K>[] {
        throw new Error("Function not implemented.");
      },
      hasChildren: function (id: string): boolean {
        throw new Error("Function not implemented.");
      },
      isDescendantOf: function (
        childId: string,
        parentId: string,
        parentSnapshot: Snapshot<WrappedU, WrappedU>,
        childSnapshot: Snapshot<WrappedU, WrappedU>
      ): boolean {
        throw new Error("Function not implemented.");
      },
      getSnapshotById: function (id: string): Snapshot<WrappedU, WrappedU> | null {
        throw new Error("Function not implemented.");
      },
      initializeWithData: function (data:SnapshotUnion<U, K>[]): void {
        throw new Error("Function not implemented.");
      },
      hasSnapshots: function (): Promise<boolean> {
        throw new Error("Function not implemented.");
      },
    };

    return transformedSnapshot;
  }

  // Example of transforming mappedSnapshotData
  private transformMappedSnapshotData<U extends Data<U>,   T extends BaseData>(
    mappedSnapshotData: Map<string, Snapshot<Data, T>>
  ): Map<string, Snapshot<WrappedU, WrappedU>> {
    const transformedData = new Map<string, Snapshot<WrappedU, WrappedU>>();
    mappedSnapshotData.forEach((value, key) => {
      transformedData.set(key, this.transformSnapshot<U, T>(value));
    });
    return transformedData;
  }

  // Updated transformSnapshotStore function
  private transformSnapshotStore<U extends Data<U>, T extends BaseData>(
    snapshotStore: SnapshotStore<Data<U>, T>
  ): SnapshotStore<WrappedU, WrappedU> {
    const transformedSnapshotData = {
      ...snapshotStore,
      // Apply transformations or assign default values as needed for each property
      initializeWithData: snapshotStore.initializeWithData || (() => { /* default */ }),
      hasSnapshots: snapshotStore.hasSnapshots || (() => { /* default */ }),
      snapshotStores: snapshotStore.#snapshotStores || [],
      name: snapshotStore.name || "Default Name",
      version: snapshotStore.version || 1,
      schema: snapshotStore.schema || "default-schema",
      dataStores: snapshotStore.dataStores || [],
      snapshotItems: snapshotStore.snapshotItems || [],
      nestedStores: snapshotStore.nestedStores || [],
      snapshotIds: snapshotStore.snapshotIds || [],
      dataStoreMethods: snapshotStore.dataStoreMethods || {},
      getConfig: snapshotStore.getConfig || (() => { /* default */ }),
      setConfig: snapshotStore.setConfig || ((config) => { /* default */ }),
      delegate: snapshotStore.delegate || null,
      notifySuccess: snapshotStore.notifySuccess || (() => { /* default */ }),
      notifyFailure: snapshotStore.notifyFailure || (() => { /* default */ })
    };

    // Now use createSnapshotStore to initialize a new snapshot store based on the transformed data
    return createSnapshotStore<WrappedU, WrappedU>(
      transformedSnapshotData as SnapshotStoreConfig<WrappedU, WrappedU>,  // Pass as config
      transformedSnapshotData as SnapshotData<U, U, StructuredMetadata<WrappedU, WrappedU>>          // Pass as data
    );
  }

  // Example of transforming snapshot method
  private transformSnapshotMethod<U extends Data<U>,   T extends BaseData>(
    snapshotMethod: any // Adjust type as needed
  ): any {
    // Logic to transform the snapshot method, ensuring it returns the correct types
    return (id: string | number | undefined, ...otherParams: any) => {
      // Example logic here, transforming as necessary
      return; // Return a compatible value of type Snapshot<WrappedU, WrappedU>
    };
  }


   // Transform a snapshot subscriber of type T to one of type U
 private transformSubscriber<U extends Data<U>, 
 T extends U = U>(
   subscriber: (
     event: string,
     snapshotId: string,
     snapshot: Snapshot< BaseData<any>, T>,
     snapshotStore: SnapshotStore< BaseData<any>, T>,
     dataItems: RealtimeDataItem[],
     criteria: SnapshotWithCriteria< BaseData<any>, T>,
     category: symbol | string | Category | undefined
   ) => void
 ): (
   event: string,
   snapshotId: string,
   snapshot: Snapshot<WrappedU, WrappedU>,
   snapshotStore: SnapshotStore<WrappedU, WrappedU>,
   dataItems: RealtimeDataItem[],
   criteria: SnapshotWithCriteria<WrappedU, WrappedU>,
   category: symbol | string | Category | undefined
 ) => void {
   return (
     event,
     snapshotId,
     snapshot,
     snapshotStore,
     dataItems,
     criteria,
     category
   ) => {
     // Transform snapshot and snapshotStore from U, U back to BaseData, T
     const transformedSnapshot = this.transformSnapshot<T, U>(snapshot);
     const transformedSnapshotStore = this.transformSnapshotStore<T, U>(snapshotStore);
     const transformedCriteria = this.transformSnapshotCriteria<T, U>(criteria);

     // Call the original subscriber with transformed types
     subscriber(
       event,
       snapshotId,
       transformedSnapshot,
       transformedSnapshotStore,
       dataItems,
       transformedCriteria,
       category
     );
   };
 }


  public getName(): string {
    return this.name;
  }

  // Get the version (now it can return either a Version<T, K> or a string)
  public getVersion(): Version<T, K> | string {
    return this.version;
  }

  // Update the version (accepts either a Version<T, K> or a string)
  public updateVersion(newVersion: Version<T, K> | string): void {
    this.version = newVersion;
  }

  public getSchema(): string | Record<string, SchemaField> {
    return this.schema;
  }

  public restoreSnapshot(
    id: string,
    snapshot: Snapshot<T, K>,
    snapshotId: string,
    snapshotData: SnapshotData<T, K>,
    savedState: SnapshotStore<T, K>,
    category: symbol | string | Category | undefined,
    callback: (snapshot: T) => void,
    snapshots: SnapshotsArray<T, K>,
    type: string,
    event: string | SnapshotEvents<T, K>,
    subscribers: SubscriberCollection<T, K>,
    snapshotContainer?: T,
    snapshotStoreConfig?:
      | SnapshotStoreConfig<SnapshotUnion<BaseData, Meta>, K>
      | undefined
  ): void {
    if (!this.id) {
      throw new Error("SnapshotStore ID is undefined");
    }

    const idAsNumber =
      typeof this.id === "string" ? parseInt(this.id, 10) : this.id;

    if (isNaN(idAsNumber)) {
      throw new Error("SnapshotStore ID could not be converted to a number");
    }

    // Use the type guard to check if snapshotData is of type Snapshot<T, K>
    if (isSnapshot(snapshotData)) {
      snapshot.updateData(idAsNumber, snapshotData);
    } else {
      throw new Error("snapshotData is not of type Snapshot");
    }

    if (category) {
      snapshot.setCategory(category);
    }

    switch (type) {
      case "restore":
        // Ensure snapshotData is compatible with SnapshotsArray<T, K>
        if (!snapshots.includes(snapshotData as unknown as SnapshotUnion<T, K, Meta>)) {
          snapshots.push(snapshotData as unknown as SnapshotUnion<T, K, Meta>);
        }
        break;
      case "revert":
        const index = snapshots.indexOf(
          snapshotData as unknown as SnapshotUnion<T, K, Meta>
        );
        if (index !== -1) {
          snapshots.splice(index, 1);
        }
        break;
      default:
        console.warn(`Unknown type: ${type}`);
    }

    if (snapshotContainer) {
      Object.assign(snapshotContainer, snapshotData.getInitialState());
    }

    if (snapshotStoreConfig) {
      snapshot.applyStoreConfig(snapshotStoreConfig);
    }

    // Assuming callback expects T (not a Snapshot type)
    if (isSnapshot(snapshotData)) {
      callback(snapshotData.initialState as T); // Ensure proper conversion to T
    } else {
      throw new Error("snapshotData is not a valid Snapshot");
    }

    if (!this.id) {
      throw new Error("SnapshotStore ID is undefined");
    }

    if (typeof event === "object" && "trigger" in event) {
      event.trigger(
        event,
        snapshot,
        snapshotId,
        subscribers,
        type,
        snapshotData
      );
    } else {
      // Handle the case where event is a string, if needed
      console.warn("Event is a string and does not have a trigger method.");
    }
  }
  protected config: Promise<SnapshotStoreConfig<T, K> | null>; 
  public getSnapshotStoreConfig(): Promise<SnapshotStoreConfig<T, K>> {
    return this.config;
  }
  
  private configs: SnapshotStoreConfig<T, K>[] = [];

  // Define defaultConfigs property
  private defaultConfigs: SnapshotStoreConfig<T, K>[] = []; // Add this line

  private items: K[] = [];


  // Define class properties
  private payload: Payload | undefined = undefined
  private callback: (data: T) => void
  private storeProps: Partial<SnapshotStoreProps<T, K>> = {};
  private endpointCategory: string = "";


  findIndex(predicate: (snapshot: SnapshotUnion<T, K, Meta>) => boolean): number {
    if (Array.isArray(this.snapshots)) {
      return this.snapshots.findIndex(predicate);
    } else {
      // Convert the object values to SnapshotUnion<T, K, Meta>
      const snapshotArray: SnapshotUnion<T, K, Meta>[] = Object.values(
        this.snapshots
      ) as SnapshotUnion<T, K, Meta>[];
      return snapshotArray.findIndex(predicate);
    }
  }

  splice(index: number, count: number): SnapshotUnion<T, K, Meta>[] {
    if (Array.isArray(this.snapshots)) {
      this.snapshots.splice(index, count);
    } else {
      throw new Error("Cannot splice an object. Convert to array first.");
    }
    return this.snapshots.slice(index, index + count);
  }

  events: (SnapshotEvents<T, K> & CombinedEvents<T, K>) | undefined = undefined;

  subscriberId: string | undefined = undefined;
  length: number | undefined = 0;
  content: string | Content<T, K> | undefined = "";
  value: string | number | Snapshot<T, K> | undefined | null = 0;
  todoSnapshotId: string | undefined = "";

  snapshotStore: SnapshotStore<T, K> | null = null;
  dataItems: () => RealtimeDataItem[] = [];

  newData: Snapshot<T, K> | null = {
    id: "",
    name: "",
    title: "",
    description: "",
    status: undefined,
    category: "",
    createdAt: new Date(),
    updatedAt: new Date(),
    data: {} as T | Map<string, Snapshot<T, K>>,
    meta: {} as Map<string, any>,
    set: () => {},
    snapshotItems: [],
    configOption: {} as SnapshotStoreConfig<T, K>,
    initialState: {} as InitializedState<T, K>,
    isCore: false,
    initialConfig: {} as InitializedConfig,
    removeSubscriber: (
      event: string,
      snapshotId: string,
      snapshot: Snapshot<T, K>,
      snapshotStore: SnapshotStore<T, K>,
      dataItems: RealtimeDataItem[],
      criteria: SnapshotWithCriteria<T, K>,
      category: symbol | string | Category | undefined
    ) => {},
    onInitialize: () => {},
    onError: (error: any) => console.error(error),
    taskIdToAssign: "",
    schema: this.schema,
    currentCategory: this.currentCategory,
    mappedSnapshotData: this.mappedSnapshotData,
    storeId: this.storeId,
    versionInfo: this.versionInfo,

    // Using class methods
    getDataVersions: this.getDataVersions,
    updateDataVersions: this.updateDataVersions,
    getBackendVersion: this.getBackendVersion,
    getFrontendVersion: this.getFrontendVersion,

    // Reusing other methods
    initializedState: this.initializedState,
    criteria: this.criteria,
    snapshot: this.snapshot,
    setCategory: this.setCategory,
    applyStoreConfig: this.applyStoreConfig,
    generateId: this.generateId,
    snapshotData: this.snapshotData,
    snapshotContainer: this.snapshotContainer,
    getSnapshotItems: this.getSnapshotItems,
    defaultSubscribeToSnapshots: this.defaultSubscribeToSnapshots,
    notify: this.notify,
    notifySubscribers: this.notifySubscribers,
    getAllSnapshots: this.getAllSnapshots,
    getSubscribers: this.getSubscribers,
    transformSubscriber: this.transformSubscriber,
    transformDelegate: this.transformDelegate,
    getAllKeys: this.getAllKeys,
    getAllValues: this.getAllValues,
    getAllItems: this.getAllItems,
    getSnapshotEntries: this.getSnapshotEntries,
    getAllSnapshotEntries: getAllSnapshotEntries,
    addDataStatus: this.addDataStatus,
    removeData: this.removeData,
    updateData: this.updateData,
    updateDataTitle: this.updateDataTitle,
    updateDataDescription: this.updateDataDescription,
    updateDataStatus: this.updateDataStatus,
    addDataSuccess: this.addDataSuccess,

    // Keeping these unique
    fetchData: "",
    defaultSubscribeToSnapshot: "",
    handleSubscribeToSnapshot: "",
    removeItem: "",
  };

  constructor({
    storeId,
    name,
    version,
    schema,
    options,
    category,
    config,
    operation,
    snapshots = [], // Optional snapshots, defaulting to an empty array
    expirationDate,
    payload,
    callback,
    storeProps,
    endpointCategory,
    metadata  
  }: SnapshotStoreProps<T, K>) {
    if (!options && options === undefined) {
      throw Error("options must be provided");
    }

    if(config === null){
      throw new Error("config not defined")
    }
    Object.assign(this, options.data);
    this.timestamp = new Date();
  
    this.store = {} as SnapshotStore<T, K>;
    this.expirationDate = expirationDate;
    this.metadata = metadata;
    this.initializeOptions();



    this.name = name;
    this.version = version ? version : this.getVersion();

    // Initialize defaultConfigs as needed
    this.defaultConfigs = this.initializeDefaultConfigs();
    this.schema = schema;
    this.operation = operation;
    this.snapshots = snapshots;
    const prefix = this.determinePrefix(
      options.snapshotConfig,
      options.category?.toString() ?? ""
    );
    this.dataStores = [];

    this.category = options.category;
    this.setConfig(config);
    this.operation = operation;

    this.payload = payload;
    this.callback = callback;
    this.storeProps = storeProps;
    this.endpointCategory = endpointCategory;
    // Use the provided config or derive it dynamically
    this.config = config ? config : this.getConfig();

    this.id = UniqueIDGenerator.generateID(
      prefix,
      (
        options.snapshotId ||
        (isSnapshotStoreConfig(options.configOption) ? options.configOption.id : undefined) ||
        (isSnapshotStoreConfig(options.configOption) ? options.configOption.name : undefined) ||
        (isSnapshotStoreConfig(options.configOption) ? options.configOption.title : undefined) ||
        (isSnapshotStoreConfig(options.configOption) ? options.configOption.description : undefined) ||
        ""
      ).toString(),
      NotificationTypeEnum.GeneratedID
    );
    
    this.handleSnapshotFailure = (snapshots) => {
      console.error('Snapshot failure:', snapshots);
      // Additional logic for handling snapshot failure can be implemented here
    };

    const eventRecords: Record<string, EventRecord<T, K>[]> = {};
    const records: Record<string, CalendarManagerStoreClass<T, K>[]> = {};
    const callbacks: Record<string, ((snapshot: Snapshot<T, K>) => void)[]> =
      {};
    const subscribers: Subscriber<T, K>[] = [];
    const eventIds: string[] = [];
    const on = (
      event: string | number,
      callback: (snapshot: Snapshot<T, K>) => void
    ): void => {
      if (!subscribers[Number(event)]) {
        subscribers[Number(event)] = {} as Subscriber<T, K, StructuredMetadata<T, K>> }
      subscribers[Number(event)].push(callback);
    };

    const off = (
      event: number,
      callback: (snapshot: Snapshot<T, K>) => void
    ): void => {
      const callbacks = subscribers[event];
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index !== -1) {
          callbacks.splice(index, 1);
        }
      }
    };

    const subscribe = (
      event: string,
      callback: (snapshot: Snapshot<T, K>) => void
    ): void => {};
    const getDataStore = (): Promise<DataStore<T, K>[]> => {
      return new Promise((resolve, reject) => {
        try {
          type FilterAnSearchCriteria = FilterCriteria | SearchCriteria;
          // Your logic to retrieve data goes here
          const data: FilterAnSearchCriteria[] = [
            {
              // description: "This is a sample event",
              startDate: new Date("2024-06-01"),
              endDate: new Date("2024-06-05"),
              status: StatusType.Scheduled,
              priority: PriorityTypeEnum.High,
              assignedUser: "John Doe",
              todoStatus: TodoStatus.Completed,
              taskStatus: TaskStatus.InProgress,
              teamStatus: TeamStatus.Active,
              dataStatus: DataStatus.Processed,
              calendarStatus: CalendarStatus.Approved,
              notificationStatus: NotificationStatus.READ,
              bookmarkStatus: BookmarkStatus.Saved,
              priorityType: PriorityTypeEnum.Urgent,
              projectPhase: ProjectPhaseTypeEnum.Planning,
              developmentPhase: DevelopmentPhaseEnum.CODING,
              subscriberType: SubscriberTypeEnum.PREMIUM,
              subscriptionType: SubscriptionTypeEnum.Monthly,
              analysisType: AnalysisTypeEnum.STATISTICAL,
              documentType: DocumentTypeEnum.PDF,
              fileType: FileTypeEnum.Document,
              tenantType: TenantManagementPhaseEnum.TenantA,
              ideaCreationPhaseType: IdeaCreationPhaseEnum.IDEATION,
              securityFeatureType: SecurityFeatureEnum.Encryption,
              feedbackPhaseType: FeedbackPhaseEnum.FEEDBACK_REVIEW,
              contentManagementType:
                ContentManagementPhaseEnum.CONTENT_CREATION,
              taskPhaseType: TaskPhaseEnum.EXECUTION,
              animationType: AnimationTypeEnum.TwoD,
              languageType: LanguageEnum.English,
              codingLanguageType: CodingLanguageEnum.Javascript,
              formatType: FormatEnum.PDF,
              privacySettingsType: PrivacySettingEnum.Public,
              messageType: MessageType.Text,
              id: "event1",
              title: "Sample Event",
              content: "This is a sample event content",
              topics: [],
              highlights: [],
              files: [],
              rsvpStatus: "yes",
              then: function <T extends  BaseData<any>, 
                K extends T = T>(
                callback: (newData: Snapshot<T, K>) => void
              ): Snapshot<Data, Data> | undefined {
                // Implement the then function here
                callback({
                  description: "This is a sample event",
                  // startDate: new Date("2024-06-01"),
                  // endDate: new Date("2024-06-05"),
                  status: StatusType.Scheduled,
                  priority: "high",
                  assignedUser: "John Doe",
                  todoStatus: "completed",
                  taskStatus: "in progress",
                  teamStatus: "active",
                  dataStatus: "processed",
                  calendarStatus: "approved",
                  notificationStatus: "read",
                  bookmarkStatus: "saved",
                  priorityType: "urgent",
                  projectPhase: "planning",
                  developmentPhase: "coding",
                  subscriberType: "premium",
                  subscriptionType: "monthly",
                  analysisType: AnalysisTypeEnum.STATISTICAL,
                  documentType: "pdf",
                  fileType: "document",
                  tenantType: "tenantA",
                  ideaCreationPhaseType: "ideation",
                  securityFeatureType: "encryption",
                  feedbackPhaseType: "review",
                  contentManagementType: "content",
                  taskPhaseType: "execution",
                  animationType: "2d",
                  languageType: "english",
                  codingLanguageType: "javascript",
                  formatType: "json",
                  privacySettingsType: "public",
                  messageType: "email",
                  id: "event1",
                  title: "Sample Event",
                  content: "This is a sample event content",
                  topics: [],
                  highlights: [],
                  files: [],
                  rsvpStatus: "yes",
                });
                return undefined;
              },
            },
          ]; // Example data, replace with actual logic

          // Resolve the promise with the data
          resolve(data);
        } catch (error) {
          // In case of an error, you can call reject with an error message
          reject(new Error("Something went wrong"));
        }
      });
    };

    this.handleSnapshotFailure = (snapshots) => {
      console.error('Snapshot failure:', snapshots);
      // Additional logic for handling snapshot failure can be implemented here
    };
  }
   // Method to access metadata
  getMetadata(): UnifiedMetadata<T, K, Meta> {
    return this.metadata;
  }



  getSnapshotData(): Partial<SnapshotStoreConfig<T, K>> {
    if (this.config && this.config.length > 0) {
      return this.config[0]; // Return the first configuration item
    }
    return {}; // Default empty object
  }

  // Additional methods to access metadata based on its type
  getProjectMetadata(): ProjectMetadata<T, K> | undefined {
    if ('startDate' in this.metadata) {
      return this.metadata as ProjectMetadata;
    }
    return undefined;
  }

  getStructuredMetadata(): StructuredMetadata<T,K> | undefined {
    if ('metadataEntries' in this.metadata) {
      return this.metadata as StructuredMetadata<T, K>;
    }
    return undefined;
  }

   // Find a snapshot by its ID
   find(snapshotId: string): SnapshotStore<T, K> | undefined {
    // Use the find method to locate the snapshot by its ID
    return this.snapshots.find((snapshot: Snapshot<T, K>) => snapshot.id === snapshotId);
   }
  
  addSnapshotToStore(
    storeId: number,
    snapshot: Snapshot<T, K>,
    snapshotStore: SnapshotStore<T, K>,
    snapshotStoreData: SnapshotStore<T, K>,
    category: symbol | string | Category | undefined,
    categoryProperties: CategoryProperties | undefined,
    subscribers: SubscriberCollection<T, K>
  ): Promise<{ snapshotStore: SnapshotStore<T, K> }> {
    try {
      // Find the snapshot store by storeId if necessary
      // Assuming you have a way to find a snapshot store by its ID, if needed
      // This is just a placeholder and might not be needed if you already have the snapshotStore instance
      const store = this.findSnapshotStoreById(storeId);
      if (!store) {
        throw new Error(`Snapshot store with ID ${storeId} not found`);
      }

      // Add the snapshot to the store's snapshots
      store.snapshots.push(snapshot);

      // Update the store's category if provided
      if (category) {
        store.category = category;
      }

      // Update the store's subscribers if provided
      if (subscribers) {
        store.subscribers = subscribers;
      }

      // Perform any additional logic needed with snapshotStoreData
      // Assuming snapshotStoreData is used for some additional processing or validation

      // Save or update the snapshot store
      await this.saveSnapshotStore(store);

      // Return the updated snapshot store
      return { snapshotStore: store };
    } catch (error) {
      // Handle errors appropriately
      console.error("Error adding snapshot to store:", error);
      throw new Error("Failed to add snapshot to store");
    }
  }

  // Method to handle snapshots and configurations
  addSnapshotItem(item: SnapshotItem<T, K> | SnapshotStoreConfig<T, K>): void {
    this.snapshotItems.push(item);
  }

  // Method to handle nested stores
  addNestedStore(store: SnapshotStore<T, K>): void {
    this.nestedStores.push(store);
  }

  defaultSubscribeToSnapshots(
    snapshotId: string,
    callback: (snapshots: Snapshots<T, K>) => Subscriber<T, K> | null,
    snapshot: Snapshot<T, K> | null = null
  ): void {
    console.warn("Default subscription to snapshots is being used.");

    // Dummy implementation of subscribing to snapshots
    console.log(`Subscribed to snapshot with ID: ${snapshotId}`);

    // Simulate receiving a snapshot update
    setTimeout(() => {
      const data: BaseData = {
        id: "data1", // Ensure this matches the expected structure of BaseData
        title: "Sample Data",
        description: "Sample description",
        timestamp: new Date(),
        category: "Sample category",
        startDate: new Date(),
        endDate: new Date(),
        scheduled: true,
        status: "Pending",
        isActive: true,
        tags: {
          "1": {
            id: "1",
            name: "Important",
            color: "red",
            tags: [],
            description: "",
            enabled: false,
            type: "",
          },
        },
      };

      const snapshot: Snapshot<T, any> = {
        id: snapshotId,
        data: data as T,
        timestamp: new Date(),

        unsubscribe: function (
          unsubscribeDetails: {
            userId: string;
            snapshotId: string;
            unsubscribeType: string;
            unsubscribeDate: Date;
            unsubscribeReason: string;
            unsubscribeData: any;
          },
          callback: Callback<Snapshot<T, any>>): void {
          throw new Error("Function not implemented.");
        },

        fetchSnapshot: function (
          snapshotId: string,
          callback: (snapshot: Snapshot<T, any>) => void
        ): void {
          throw new Error("Function not implemented.");
        },

        handleSnapshot: function (
          id: string,
          snapshotId: string | number | null,
          snapshot: T extends SnapshotData<T, K> ? Snapshot<T, K> : null,
          snapshotData: T,
          category: Category | undefined,
          categoryProperties: CategoryProperties | undefined,
          callback: (snapshot: T) => void,
          snapshots: SnapshotsArray<T, K>,
          type: string,
          event: Event,
          snapshotContainer?: T,
          snapshotStoreConfig?: SnapshotStoreConfig<T, any> | null,
          storeConfigs?: SnapshotStoreConfig<T, K>[]
        ): Promise<Snapshot<T, K> | null> {
          throw new Error("Function not implemented.");
        },
        events: undefined,
        meta: {} as StructuredMetadata<T, any>,
      };

      callback([snapshot]);
    }, 1000); // Simulate a delay before receiving the update
  }

  defaultCreateSnapshotStores(
    id: string,
    snapshotId: string,
    snapshot: Snapshot<T, K>,
    snapshotStore: SnapshotStore<T, K>,
    snapshotManager: SnapshotManager<T, K>,
    payload: CreateSnapshotStoresPayload<T, K>,
    callback: (snapshotStore: SnapshotStore<T, K>[]) => void | null,
    snapshotStoreData?: SnapshotStore<T, K>[],
    category?: string | symbol | Category,
    snapshotDataConfig?: SnapshotStoreConfig<
      SnapshotWithCriteria<any, BaseData>,
      K
    >[]
  ): SnapshotStore<T, K>[] | null {
    console.warn("Default create snapshot stores is being used.");
    // Dummy implementation of creating snapshot stores
    console.log(`Created snapshot stores with ID: ${id}`);
    // use snapshotApi to receive a snapshot update
    setTimeout(() => {
      const data: BaseData = {
        id: "data1", // Ensure this matches the expected structure of BaseData
        title: "Sample Data",
        description: "Sample description",
        timestamp: new Date(),
        category: "Sample category",
        startDate: new Date(),
        endDate: new Date(),
        scheduled: {},
        isScheduled: true,
        status: "Pending",
        isActive: true,
        tags: [
          {
            id: "1",
            name: "Important",
            color: "red",
            description: "This is a sample description",
            enabled: true,
            type: "tag",
            tags: [],
          },
        ],
      };

      const snapshot: Snapshot<T, any> = {
        id: snapshotId,
        data: data as T,
        timestamp: new Date(),
        unsubscribe: function (callback: Callback<Snapshot<T, any>>): void {
          throw new Error("Function not implemented.");
        },
        fetchSnapshot: function (
          snapshotId: string,
          callback: (snapshot: Snapshot<T, any>) => void
        ): void {
          throw new Error("Function not implemented.");
        },
        handleSnapshot: function (
          id: string,
          snapshotId: string,
          snapshot: T extends SnapshotData<T, K> ? Snapshot<T, K> : null,
          snapshotData: T,
          category: Category | undefined,
          categoryProperties: CategoryProperties | undefined,
          callback: (snapshot: T) => void,
          snapshots: SnapshotsArray<T, K>,
          type: string,
          event: Event,
          snapshotContainer?: T,
          snapshotStoreConfig?: SnapshotStoreConfig<T, K, StructuredMetadata<T, K>, never>  | null,
          storeConfigs?: SnapshotStoreConfig<T, K>[]      
        ): void {
          throw new Error("Function not implemented.");
        },
        events: undefined,
        meta: undefined,
        category: category,
        snapshotDataConfig: snapshotDataConfig || [
          {
            id: "data1",
            title: "Sample Data",
            description: "Sample description",
            timestamp: new Date(),
            category: "Sample category",
            startDate: new Date(),
            endDate: new Date(),
            scheduled: true,
            status: "Pending",
            isActive: true,
            tags: [{ id: "1", name: "Important", color: "red" }],
          },
          {
            id: "data2",
            title: "Sample Data",
            description: "Sample description",
            timestamp: new Date(),
            category: "Sample category",
            startDate: new Date(),
            endDate: new Date(),
            scheduled: true,
            status: "Pending",
            isActive: true,
            tags: [{ id: "1", name: "Important", color: "red" }],
          },
          {
            id: "data3",
            title: "Sample Data",
            description: "Sample description",
            timestamp: new Date(),
            category: "Sample category",
            startDate: new Date(),
            endDate: new Date(),
            scheduled: true,
            status: "Pending",
            isActive: true,
            tags: [{ id: "1", name: "Important", color: "red" }],
          },
        ],
      };
    });
    return null;
  }

  createSnapshotStores(
    id: string,
    snapshotId: string,
    snapshot: Snapshot<T, K>,
    snapshotStore: SnapshotStore<T, K>,
    snapshotManager: SnapshotManager<T, K>,
    payload: CreateSnapshotStoresPayload<T, K>,
    callback: (snapshotStore: SnapshotStore<T, K>[]) => void | null,
    snapshotStoreData?: SnapshotStore<T, K>[],
    category?: string | symbol | Category,
    snapshotDataConfig?: SnapshotStoreConfig<
      SnapshotWithCriteria<any, BaseData>,
      K
    >[]
  ) {
    if (this.createSnapshotStores) {
      this.createSnapshotStores(
        id,
        snapshotId,
        snapshot,
        snapshotStore,
        snapshotManager,
        payload,
        callback,
        snapshotStoreData,
        category,
        snapshotDataConfig
      );
    } else {
      console.warn("createSnapshotStores method is not defined.");
      this.defaultCreateSnapshotStores(
        id,
        snapshotId,
        snapshot,
        snapshotStore,
        snapshotManager,
        payload,
        callback,
        snapshotStoreData,
        category,
        snapshotDataConfig
      );
    }
  }

  subscribeToSnapshots(
    snapshotId: string,
    callback: (snapshots: Snapshots<T, K>) => Subscriber<T, K> | null,
    snapshot: Snapshot<T, K> | null,
    unsubscribe?: UnsubscribeDetails,
  ): [] | SnapshotsArray<T, K> {
    if (this.subscribeToSnapshots) {
      this.subscribeToSnapshots(snapshotId, callback, snapshot);
    } else {
      console.warn("subscribeToSnapshots method is not defined.");
      this.defaultSubscribeToSnapshots(snapshotId, callback, snapshot);
    }
    return [];
  }

  subscribeToSnapshot(
    snapshotId: string,
    callback: Callback<Snapshot<T, K>>,
    snapshot: Snapshot<T, K>
  ): Snapshot<T, K> {
    // Check if a custom subscribeToSnapshot function is defined
    if (this.subscribeToSnapshot) {
      // Use the custom implementation if available
      return this.subscribeToSnapshot(snapshotId, callback, snapshot);
    } else {
      console.warn("subscribeToSnapshot method is not defined.");
      // Fallback to the default behavior
      defaultSubscribeToSnapshot(snapshotId, callback, snapshot);
      return snapshot; // Ensure that the method returns the snapshot as required
    }
  }

  defaultOnSnapshots(
    snapshotId: string,
    snapshots: Snapshots<T, K>,
    type: string,
    event: Event,
    callback: (snapshots: Snapshots<T, K>) => void
  ) {
    console.log("onSnapshots called with snapshotId:", snapshotId);
    console.log("snapshots:", snapshots);
    console.log("type:", type);
    console.log("event:", event);
    console.log("callback:", callback);
    callback(snapshots);
  }

  onSnapshots(
    snapshotId: string,
    snapshots: Snapshots<T, K>,
    type: string,
    event: Event,
    callback: (snapshots: Snapshots<T, K>) => void
  ): Promise<void | null> {
    if (this.onSnapshots) {
      // Ensure to wrap the call in a Promise to match the return type
      return Promise.resolve(
        this.onSnapshots(snapshotId, snapshots, type, event, callback)
      );
    } else {
      console.warn("onSnapshots method is not defined.");
      // Optionally, you can provide a default behavior here
      this.defaultOnSnapshots(snapshotId, snapshots, type, event, callback);
      return Promise.resolve(); // Return a resolved promise to match the return type
    }
  }


  private transformSubscriber<U extends BaseData<U>, K extends U = U>(
    sub: Subscriber<T, K>
  ): Subscriber<U, K> {
    // Safely access data by checking if sub.getData() is not null
    const data =
      sub.getData && sub.getData() !== null ? sub.getData()!.data : null;

    // Ensure data is of the correct type or null
    const isValidData = (
      data: any
    ): data is Partial<SnapshotStore<T, K>> | null => {
      return data === null || typeof data === "object"; // Adjust this check based on the structure of SnapshotStore
    };
    return {
      // General subscriber info
      _id: sub.getUniqueId,
      name: sub.getName(),
      subscriberId: sub.getSubscriberId(),
      email: sub.getEmail(),
      enabled: sub.getEnabled,
      tags: sub.getTags,

      // Data management
      data: isValidData(data) ? data : null,
      initialData: sub.initialData,
      newData: sub.newData,

      // Data transformation and processing
      getTransformSubscriber: sub.getTransformSubscriber,
      processData: sub.getProcessData,
      validateData: sub.getValidateData,
      transformData: sub.getTransformData,
      triggerActions: sub.getTriggerActions,
      getIsDataType: sub.getIsDataType,
      getUpdateInternalStore: sub.getUpdateInternalStore,
      getProcessData: sub.getProcessData,
      getValidateData: sub.getValidateData,
      getTransformData: sub.getTransformData,
      getTriggerActions: sub.getTriggerActions,

      // Data handling
      payload: sub.getPayload,
      update: sub.update,
      updateInternalStore: sub.getUpdateInternalStore,

      // Internal cache management
      internalCache: sub.getInternalCache,
      getFromInternalCache: sub.getFromInternalCache,
      clearInternalCache: sub.clearInternalCache,
      removeFromInternalCache: sub.removeFromInternalCache,

      // Subscriber methods
      subscribe: sub.subscribe,
      unsubscribe: sub.unsubscribe,
      getSubscribers: sub.getSubscribers,
      setSubscribers: sub.setSubscribers,

      // Subscription management *
      subscription: sub.getSubscription(),
      subscribersById: sub.getSubscribersById()
        ? sub.getSubscribersById()
        : undefined,
      subscribers: sub.getSubscribers,
      defaultSubscribeToSnapshots: sub.defaultSubscribeToSnapshots,
      subscribeToSnapshots: sub.subscribeToSnapshots,

      // Callbacks and event handling
      onSnapshotCallbacks: sub.getOnSnapshotCallbacks,
      onErrorCallbacks: sub.getOnErrorCallbacks,
      onUnsubscribeCallbacks: sub.getOnUnsubscribeCallbacks,
      notifyEventSystem: sub.getNotifyEventSystem(),
      processNotification: sub.processNotification,

      // Event handling
      getNotifyEventSystem: sub.getNotifyEventSystem,
      getUpdateProjectState: sub.getUpdateProjectState,
      getLogActivity: sub.getLogActivity,
      getTriggerIncentives: sub.getTriggerIncentives,
      addSnapshotCallback: sub.addSnapshotCallback,
      setEvent: sub.setEvent,

      // Snapshot management
      snapshotIds: sub.getSnapshotIds(),
      fetchSnapshotIds: sub.getFetchSnapshotIds(),
      fetchSnapshotById: sub.fetchSnapshotById,
      toSnapshotStore: sub.toSnapshotStore,
      handleSnapshot: sub.handleSnapshot,
      triggerOnSnapshot: sub.triggerOnSnapshot,

      // State management
      internalState: sub.getInternalState,
      getState: sub.getState(prop),
      updateProjectState: sub.getUpdateProjectState(),
      logActivity: sub.getLogActivity(),
      triggerIncentives: sub.getTriggerIncentives(),

      // Optional properties
      optionalData: sub.getOptionalData(),
      callback: sub.getCallback ? sub.getCallback(data) : undefined,

      // Additional utility functions
      determineCategory: sub.getDetermineCategory(),
      getDeterminedCategory: sub.getDeterminedCategory(),
      transformSubscribers: sub.getTransformSubscribers(),

      // Error handling
      onError: sub.onError,

      // Unique identifiers and miscellaneous
      getId: sub.getId(),
      sentNotification: sub.sentNotification,
      sendNotification: sub.sendNotification,
      getUniqueId: sub.getUniqueId,
      id: sub.id,
      getEnabled: sub.getEnabled,
      getTags: sub.getTags,
      getCallback: sub.getCallback,

      // Callback management *
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

      // Internal state and data
      getInternalState: sub.getInternalState,
      getInternalCache: sub.getInternalCache,
      getPayload: sub.getPayload,

      // Snapshot handling
      handleCallback: sub.handleCallback,
      snapshotCallback: sub.snapshotCallback,
      getEmail: sub.getEmail,

      // Data fetching and subscription
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

      // General information *
      getName: sub.getName,
      getDetermineCategory: sub.getDetermineCategory,

      // Snapshot management *
      snapshots: sub.snapshots,
      snapshotStores: sub.snapshotStores,
      receiveSnapshot: sub.receiveSnapshot,

      // Subscriber management *
      getSubscriberId: sub.getSubscriberId,
      getSubscribersById: sub.getSubscribersById,
      getSubscribersWithSubscriptionPlan:
        sub.getSubscribersWithSubscriptionPlan,
      getSubscription: sub.getSubscription,
      onUnsubscribe: sub.onUnsubscribe,
      onSnapshot: sub.onSnapshot,
      onSnapshotError: sub.onSnapshotError,
      onSnapshotUnsubscribe: sub.onSnapshotUnsubscribe,
      isDataType: sub.getIsDataType,
    };
  }

  // Helper function to check compatibility of snapshot types
  private isCompatibleSnapshot(snapshot: any): snapshot is Snapshot<T, K> {
    // Add your compatibility check logic here, depending on what makes Snapshot<T, K> valid
    return (
      snapshot &&
      snapshot.hasOwnProperty("snapshotId") &&
      snapshot.hasOwnProperty("snapshotData")
    );
  }

  private isSnapshotStoreConfig(item: any): item is SnapshotStoreConfig<T, K> {
    // Add checks for required properties of SnapshotStoreConfig
    return (
      item &&
      typeof item === "object" &&
      "id" in item &&
      "title" in item &&
      // Add more property checks as needed
      true
    );
  }

  private async transformDelegate(): Promise<SnapshotStoreConfig<T, K>[]> {
    return this.delegate?.map(async (config) => {
      const subscribersPromise = await config.getSubscribers(
        this.subscriberCollection, // Provide a valid SubscriberCollection<T, K> here
        this.snapshots // Provide a valid Snapshots<T, K> here
      );
  
      return {
        ...config,
        data: config.data,
        subscribers: subscribersPromise.subscribers.map((sub: Subscriber<T, K>) =>
          this.transformSubscriber(sub)
        ) as Subscriber<T, K>[],
        configOption:
          config.configOption && typeof config.configOption !== "string"
            ? {
                ...config.configOption,
                data: config.configOption.data,
                subscribers: (await config.configOption.getSubscribers(
                  this.subscribers, // Provide a valid SubscriberCollection<T, K> here
                  this.snapshots // Provide a valid Snapshots<K> here
                )).subscribers.map((sub: Subscriber<T, K>) =>
                  this.transformSubscriber(sub)
                ) as Subscriber<T, K>[],
              }
            : config.configOption,
      };
    });
  }

  get getTransformedSnapshot() {
    return <U extends Data<U>, T extends Data>(
      snapshot: Snapshot<Data, T>
    ): Snapshot<WrappedU, WrappedU> => {
      return this.transformSnapshot<U, T>(snapshot);
    };
  }

  get getSavedSnapshotStore(): (
    id: string,
    snapshotId: string,
    snapshot: Snapshot<T, K>,
    snapshotStore: SnapshotStore<T, K>,
    snapshotManager: SnapshotManager<T, K>,
    payload: CreateSnapshotStoresPayload<T, K>,
    callback: (snapshotStore: SnapshotStore<T, K>[]) => void | null,
    snapshotStoreData?: SnapshotStore<T, K>[],
    category?: string | symbol | Category,
    categoryProperties?: string | CategoryProperties,
    snapshotDataConfig?: SnapshotStoreConfig<
      SnapshotWithCriteria<any, BaseData>,
      K
    >[]
  ) => void {
    return this.saveSnapshotStore
      ? this._saveSnapshotStore.bind(this)
      : this.defaultSaveSnapshotStore.bind(this);
  }

  get getConfigs(): (
    snapshotId: string,
    snapshot: Snapshot<T, K>,
    snapshotStore: SnapshotStore<T, K>,
    snapshotManager: SnapshotManager<T, K>,
    payload: CreateSnapshotStoresPayload<T, K>,
    callback: (snapshotStore: SnapshotStore<T, K>[]) => void | null,
    snapshotStoreData?: SnapshotStore<T, K>[],
    category?: string | symbol | Category,
    snapshotDataConfig?: SnapshotStoreConfig<
      SnapshotWithCriteria<any, BaseData>,
      K
    >[]
  ) => void {
    return this.configs
      ? this.configs.bind(this)
      : this.defaultConfigs.bind(this);
  }

  get getSavedSnapshotStores(): (
    id: string,
    snapshotId: string,
    snapshot: Snapshot<T, K>,
    snapshotStore: SnapshotStore<T, K>,
    snapshotManager: SnapshotManager<T, K>,
    payload: CreateSnapshotStoresPayload<T, K>,
    callback: (snapshotStore: SnapshotStore<T, K>[]) => void | null,
    snapshotStoreData?: SnapshotStore<T, K>[],
    category?: string | Category,
    categoryProperties?: string | CategoryProperties,
    snapshotDataConfig?: SnapshotStoreConfig<
      SnapshotWithCriteria<any, BaseData>,
      K
    >[]
  ) => void {
    return this._saveSnapshotStores
      ? this._saveSnapshotStores.bind(this)
      : this.defaultSaveSnapshotStores.bind(this);
  }

  get initializedState(): InitializedState<T, K> {
    return this.initialState;
  }

  get transformedDelegate(): SnapshotStoreConfig<
    SnapshotWithCriteria<any, BaseData>,
    K
  >[] {
    return this.transformDelegate();
  }

  // Getter for transformed initial state
  get getTransformedInitialState(): InitializedState<T, K> | null {
    if (!this.initialState) {
      return null; // Return null if the initial state is not set
    }

    // We assume that we want to transform it to a specific type U 
    // that is defined elsewhere or can be passed in context
    return this.transformInitialState<T, K>(this.initialState);
  }

 get isMobile() {
    return this.options.browserSpecific?.isMobile || false;
  }

  get browserType() {
    return this.options.browserSpecific?.browserType || 'Unknown';
  }

  transformedSubscriber(sub: Subscriber<T, K>): Subscriber<T, K> {
    return this.transformSubscriber(sub);
  }

  get getSnapshotIds(): SnapshotStoreConfig<T, K>[] {
    if (
      this.transformedDelegate &&
      Array.isArray(this.transformedDelegate) &&
      this.transformedDelegate.every(
        (item) => item instanceof SnapshotStoreConfig
      )
    ) {
      return this.transformedDelegate;
    }
    return [];
  }

  get getNestedStores(): SnapshotStore<T, K>[] {
    return this.nestedStores;
  }

  get getFindSnapshotStoreById(): (
    storeId: number
  ) => SnapshotStore<T, K> | null {
    return this.findSnapshotStoreById.bind(this); // Bind this context if necessary
  }

  getAllKeys(
    storeId: number,
    snapshotId: string,
    category: symbol | string | Category | undefined,
    categoryProperties: CategoryProperties | undefined,
    snapshot: Snapshot<SnapshotUnion<BaseData, Meta>, T> | null,
    timestamp: string | number | Date | undefined,
    type: string,
    event: Event,
    id: number,
    snapshotStore: SnapshotStore<SnapshotUnion<BaseData, Meta>, K>,
    data: T
  ): Promise<string[] | undefined> | undefined {
    return this.dataStoreMethods?.getAllKeys(
      storeId,
      snapshotId,
      category,
      categoryProperties,
      snapshot,
      timestamp,
      type,
      event,
      id,
      snapshotStore,
      data
    );
  }

  mapSnapshot(
    id: number,
    storeId: string,
    snapshotStore: SnapshotStore<T, K>,
    snapshotContainer: SnapshotContainer<T, K>,
    snapshotId: string,
    criteria: CriteriaType,
    snapshot: Snapshot<T, K>,
    type: string,
    event: Event,
    callback: (snapshot: Snapshot<T, K>) => void,
    mapFn: (item: T) => T
  ): Promise<Snapshot<T, K> | null> {
    return new Promise((resolve, reject) => {
      // Ensure type safety here
      if (
        this.dataStoreMethods === undefined &&
        this.dataStoreMethods === null
      ) {
        return Promise.resolve(this.dataStore);
      }
      if (this.dataStoreMethods) {
        return this.dataStoreMethods.mapSnapshot(
          storeId,
          snapshotStore,
          snapshotId,
          snapshot,
          type,
          event
          // initialConfig,
          // removeSubscriber,
          // onInitialize,
          // onError,
        );
      }
      return {};
    });
  }

  getAllItems(): Promise<Snapshot<T, K>[]> | undefined {
    if (this.dataStoreMethods === undefined) {
      return undefined;
    }
    if (this.dataStoreMethods) {
      return this.dataStoreMethods.getAllItems();
    }
    return undefined;
  }

  addData(data: Snapshot<T, K>): void {
    // Ensure dataStoreMethods is defined and has the addData method
    this.dataStoreMethods?.addData(data);

    // Ensure data.id is a number before passing to addDataStatus
    const idAsNumber =
      typeof data.id === "string" ? parseInt(data.id, 10) : data.id;

    // Add a check to handle NaN cases if needed
    if (!isNaN(idAsNumber)) {
      this.dataStoreMethods?.addDataStatus(idAsNumber, StatusType.Pending);
    } else {
      console.error("Invalid ID: Not a number");
    }
  }

  addDataStatus(id: number, status: StatusType | undefined): void {
    this.dataStoreMethods?.addDataStatus(id, status);
  }

  removeData(id: number): void {
    this.dataStoreMethods?.removeData(id);
  }

  updateData(id: number, newData: Snapshot<T, K>): void {
    this.dataStoreMethods?.updateData(id, newData);
  }

  updateDataTitle(id: number, title: string): void {
    this.dataStoreMethods?.updateDataTitle(id, title);
  }

  updateDataDescription(id: number, description: string): void {
    this.dataStoreMethods?.updateDataDescription(id, description);
  }

  updateDataStatus(id: number, status: StatusType | undefined): void {
    this.dataStoreMethods?.updateDataStatus(id, status);
  }

  addDataSuccess(payload: { data: Snapshot<T, K>[] }): void {
    this.dataStoreMethods?.addDataSuccess(payload);
  }

  getDataVersions(id: number): Promise<Snapshot<T, K>[] | undefined> {
    if (this.dataStoreMethods?.getDataVersions === undefined) {
      return Promise.reject(
        new Error(
          `getDataVersions method is not defined for the given data store methods.`
        )
      );
    }
    return this.dataStoreMethods?.getDataVersions(id);
  }

  updateDataVersions(id: number, versions: Snapshot<T, K>[]): void {
    this.dataStoreMethods?.updateDataVersions(id, versions);
  }

  getBackendVersion(): Promise<string | number | undefined> {
    if (this.dataStoreMethods?.getBackendVersion === undefined) {
      return Promise.reject(
        new Error(
          `getBackendVersion method is not defined for the given data store methods.`
        )
      );
    }

    return this.dataStoreMethods?.getBackendVersion();
  }

  getFrontendVersion(): Promise<string | number | undefined> {
    return this.dataStoreMethods?.getFrontendVersion();
  }

  fetchData(id: number): Promise<SnapshotStore<T, K>> {
    if (this.dataStoreMethods?.fetchData === undefined) {
      return Promise.reject(
        new Error(
          `fetchData method is not defined for the given data store methods.`
        )
      );
    }

    return this.dataStoreMethods.fetchData(id);
  }

  defaultSubscribeToSnapshot(
    snapshotId: string,
    callback: Callback<Snapshot<T, K>>,
    snapshot: Snapshot<T, K>
  ): string {
    // Add the subscriber to the subscribers array
    this.subscribers.push({
      id: snapshotId,
      _id: this.subscriberId,
      handleCallback: callback,
      snapshotCallback: snapshot,
    });
    // Call the callback with the snapshot
    callback(snapshot);
    // Return the subscriberId
    return this.subscriberId;
  }

  // Method to handle the subscription
  handleSubscribeToSnapshot(
    snapshotId: string,
    callback: Callback<Snapshot<T, K>>,
    snapshot: Snapshot<T, K>
  ): void {
    // Check if subscribeToSnapshot is defined
    if (this.subscribeToSnapshot) {
      this.subscribeToSnapshot(snapshotId, callback, snapshot);
    } else {
      console.warn("subscribeToSnapshot method is not defined.");
      // Optionally, you can provide a default behavior here
      this.defaultSubscribeToSnapshot(snapshotId, callback, snapshot);
    }
  }

  // Implement the snapshot method as expected by SnapshotStoreConfig
  snapshot = async (
    id: string | number | undefined,
    snapshotId: string | null,
    snapshotData: SnapshotData<T, K>,
    category: symbol | string | Category | undefined,
    categoryProperties: CategoryProperties | undefined,
    callback: (snapshotStore: SnapshotStore<T, K>) => void,
    dataStore: DataStore<T, K>,
    dataStoreMethods: DataStoreMethods<T, K>,
    // dataStoreSnapshotMethods: DataStoreWithSnapshotMethods<T, K>,
    metadata: UnifiedMetaDataOptions<T, K, Meta, ExcludedFields>,
    subscriberId: string, // Add subscriberId here
    endpointCategory: string | number, // Add endpointCategory here
    storeProps: SnapshotStoreProps<T, K>,
    snapshotConfigData: SnapshotConfig<T, K>,
    subscription: Subscription<T, K>,
    snapshotStoreConfigData?: SnapshotStoreConfig<T, K>,
    snapshotContainer?: SnapshotStore<T, K> | Snapshot<T, K> | null
  ): Promise<{ snapshot: Snapshot<T, K> }> => {
    // Utilize the snapshotContainer to manage snapshots or stores

    const {
      storeId,
      name,
      version,
      schema,
      options,
      config,
      operation,
      snapshots,
      expirationDate,
      payload, 
    } = storeProps;

    const { subscribers } = subscription;

    if (!snapshotContainer) {
      snapshotContainer = new SnapshotStore<T, K>({
        storeId,
        name,
        version,
        schema,
        options,
        category,
        config,
        operation,
        snapshots,
        expirationDate,
        payload, callback, storeProps, endpointCategory

      });
    }

    // Check if snapshotContainer already contains data
    if (!snapshotContainer.hasSnapshots()) {
      // Optionally initialize snapshotContainer if needed
      snapshotContainer.initializeWithData({} as SnapshotUnion<T, K, Meta>[]);
    }

    // Use the container's method to handle the map conversion and storage logic
    const convertedData =
      snapshotContainer.getSnapshotStore() ||
      snapshotContainer.convertMapToSnapshotStore();

    // Generate a new snapshot
    const newSnapshot: Snapshot<T, K> = new Snapshot<T, K>(
      isCore,
      initialConfig,
      removeSubscriber,
      onInitialize
    );

    // Optionally, store the new snapshot in the container
    snapshotContainer.addSnapshot(newSnapshot, String(snapshotId), subscribers);

    // Return the newly created snapshot
    return { snapshot: newSnapshot };
  };

  async removeItem(key: string): Promise<void> {
    if (this.dataStoreMethods === undefined || this.dataStoreMethods === null) {
      return Promise.reject(new Error("DataStoreMethods is undefined or null"));
    }
    try {
      await this.dataStoreMethods.removeItem(key);
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(new Error("Failed to remove item"));
    }
  }

  getSnapshot(
    snapshot: (id: number | string) =>
      | Promise<{
          snapshotId: number;
          snapshotData: SnapshotData<T, K>;
          category: symbol | string | Category | undefined
          categoryProperties: CategoryProperties | undefined;
          dataStoreMethods: DataStore<T, K> | null;
          timestamp: string | number | Date | undefined;
          id: string | number | undefined;
          snapshot: Snapshot<T, K>;
          snapshotStore: SnapshotStore<T, K>;
          data: T;
        }>
      | undefined
  ): Promise<Snapshot<T, K> | undefined> {
    // Check if the delegate array exists and is not empty
    if (this.delegate && this.delegate.length > 0) {
      const firstDelegate = this.delegate.find(
        (del) => typeof del.getSnapshot === "function"
      );

      if (firstDelegate) {
        // Call getSnapshot on the first valid delegate found
        return firstDelegate.getSnapshot(snapshot);
      } else {
        // Handle the case where no valid delegate is found
        throw new Error("No valid delegate found with getSnapshot method");
      }
    } else {
      // Handle the case where the delegate array is undefined or empty
      throw new Error("Delegate is undefined or empty");
    }
  }

  getSnapshotById(
    snapshot: (id: string) =>
      | Promise<{
          category: symbol | string | Category | undefined
          categoryProperties: CategoryProperties;
          timestamp: string | number | Date | undefined;
          id: string | number | undefined;
          snapshot: Snapshot<SnapshotUnion<BaseData, Meta>, T>;
          snapshotStore: SnapshotStore<SnapshotUnion<BaseData, Meta>, T>;
          data: SnapshotUnion<BaseData, Meta>;
        }>
      | undefined
  ): Promise<Snapshot<SnapshotUnion<BaseData, Meta>, T> | null> {
    // Check if the delegate array exists and is not empty
    if (this.delegate && this.delegate.length > 0) {
      const firstDelegate = this.delegate.find(
        (del) => typeof del.getSnapshotById === "function"
      );
      if (firstDelegate) {
        // Call getSnapshot on the first valid delegate found
        return firstDelegate.getSnapshotById(snapshot);
      } else {
        // Handle the case where no valid delegate is found
        throw new Error("No valid delegate found with getSnapshotById method");
      }
    }
    return Promise.reject(new Error("Delegate is undefined or empty"));
  }

  getSnapshotSuccess(
    snapshot: Snapshot<SnapshotUnion<BaseData, Meta>, T>,
    subscribers: Subscriber<T, K>[]
  ): Promise<SnapshotStore<T, K>> {
    if (this.delegate && this.delegate.length > 0) {
      for (const delegateConfig of this.delegate) {
        if (
          delegateConfig &&
          typeof delegateConfig.getSnapshotSuccess === "function"
        ) {
          return delegateConfig.getSnapshotSuccess(snapshot, subscribers);
        }
      }
      throw new Error("No valid delegate found for getSnapshotSuccess");
    } else {
      throw new Error("Delegate is undefined or empty");
    }
  }

  getSnapshotId(key: string | SnapshotData<T, K>): Promise<string | undefined> {
    if (this.delegate && this.delegate.length > 0) {
      for (const delegateConfig of this.delegate) {
        if (
          delegateConfig &&
          typeof delegateConfig.getSnapshotId === "function"
        ) {
          // Check if 'key' is of type 'SnapshotData<T, K>' before passing it to 'getSnapshotId'
          if (typeof key !== "string") {
            return Promise.resolve(delegateConfig.getSnapshotId(key));
          }
        }
      }
      throw new Error("No valid delegate found for getSnapshotId");
    } else {
      throw new Error("Delegate is undefined or empty");
    }
  }

  async getSnapshotArray(): Promise<Array<Snapshot<T, K>>> {
    if (this.delegate && this.delegate.length > 0) {
      for (const delegateConfig of this.delegate) {
        if (
          delegateConfig &&
          typeof delegateConfig.getSnapshots === "function"
        ) {
          const result = await delegateConfig.getSnapshots(
            this.category,
            this.snapshots
          );

          // Check if 'result' exists and contains an array of snapshots
          if (result && Array.isArray(result.snapshots)) {
            const snapshots = result.snapshots;

            // Check if the snapshots are of type Snapshot<T, K>
            if (
              snapshots.every((snapshot: any) =>
                this.isCompatibleSnapshot(snapshot)
              )
            ) {
              return Promise.resolve(snapshots as Array<Snapshot<T, K>>);
            } else {
              throw new Error(
                "Incompatible snapshot types returned from delegate"
              );
            }
          } else {
            throw new Error("Unexpected format of snapshots from delegate");
          }
        }
      }
      throw new Error("No valid delegate found for getSnapshotArray");
    } else {
      throw new Error("Delegate is undefined or empty");
    }
  }

  async getItem(key: T): Promise<Snapshot<T, K> | undefined> {
    // Check if the dataStore is available and try to get the item from it
    if (this.dataStore) {
      const item = this.dataStore.get(key);
      if (item) {
        return item;
      }
    }

    // If dataStore is not available, try to fetch the snapshot from delegate
    try {
      const snapshotId = await this.getSnapshotId({
        key,
        createdAt: undefined,
        updatedAt: undefined,
        // id: "",
        title: "",
        description: "",
        status: StatusType.Active,
        category: currentCategory,
        timestamp: undefined,
        subscribers: [],
        snapshotStore: this,
        data: undefined,
      });

      if (typeof snapshotId !== "string") {
        return undefined;
      }

      const transformedDelegate = this.transformDelegate();
      const snapshot = await this.fetchSnapshot(snapshotId, callback);

      if (snapshot) {
        const item = snapshot.getItem
          ? snapshot.getItem(key)
          : snapshot.data?.get(key);
        return item as Snapshot<T, K> | undefined;
      }
    } catch (error) {
      console.error("Error fetching snapshot:", error);
    }

    // Return undefined if item is not found or an error occurred
    return undefined;
  }

  setItem(key: T, value: Snapshot<T, K>): Promise<void> {
    
    if (this.dataStore) {
      this.dataStore.set(key, value);
    }
    return Promise.resolve();
  }

  addSnapshotFailure(
    date: Date,
    snapshotManager: SnapshotManager<T, K>,
    snapshot: Snapshot<T, K>,
    payload: { error: Error }
  ): void {
    notify(
      `${error.message}`,
      `Snapshot added failed fully.`,
      "Error",
      new Date(),
      NotificationTypeEnum.Error,
      NotificationPosition.TopRight
    );
  }

  getDataStore(): Promise<InitializedDataStore> {
    if(!this.dataStore){
      throw Error("dataStore is not initialized")
    }
    return this.dataStore;
  }

  addSnapshotSuccess(
    snapshot: T,
    subscribers: SubscriberCollection<T, K>
  ): void {
    if (!this.delegate) {
      console.error("Delegate is undefined or empty.");
      return;
    }

    const index = this.delegate.findIndex(
      (snapshotStore) =>
        snapshotStore.id === snapshot.id &&
        snapshotStore.category === snapshot.category &&
        snapshotStore.key === snapshot.key &&
        snapshotStore.topic === snapshot.topic &&
        snapshotStore.priority === snapshot.priority &&
        snapshotStore.tags === snapshot.tags &&
        snapshotStore.metadata === snapshot.metadata &&
        snapshotStore.status === snapshot.status &&
        snapshotStore.isCompressed === snapshot.isCompressed &&
        snapshotStore.expirationDate === snapshot.expirationDate &&
        snapshotStore.timestamp === snapshot.timestamp &&
        snapshotStore.data === snapshot.data &&
        this.compareSnapshotState(
          snapshotStore.state as Snapshot<T, K> | null,
          snapshot.state
        )
    );

    if (index !== -1) {
      this.delegate[index].addSnapshotSuccess(snapshot, subscribers);

      notify(
        `${snapshot.id}`,
        `Snapshot ${snapshot.id} added successfully.`,
        "Success",
        new Date(),
        NotificationTypeEnum.Success,
        NotificationPosition.TopRight
      );
    } else {
      // Handle case where snapshotStore matching snapshot is not found
      console.error(`SnapshotStore matching ${snapshot.id} not found.`);
    }
  }

  getParentId(
    id: string,
    snapshot: Snapshot<SnapshotUnion<Data, Meta>, T>
  ): string | null {
    if (this.delegate && this.delegate.length > 0) {
      for (const delegateConfig of this.delegate) {
        if (
          delegateConfig &&
          typeof delegateConfig.getParentId === "function"
        ) {
          return delegateConfig.getParentId(id, snapshot);
        }
      }
      throw new Error("No valid delegate found for getParentId");
    } else {
      throw new Error("Delegate is undefined or empty");
    }
  }

  getChildIds(id: string, childSnapshot: Snapshot<T, K>): string[] {
    if (this.delegate && this.delegate.length > 0) {
      for (const delegateConfig of this.delegate) {
        if (
          delegateConfig &&
          typeof delegateConfig.getChildIds === "function"
        ) {
          return delegateConfig.getChildIds(id, childSnapshot);
        }
      }
      throw new Error("No valid delegate found for getChildIds");
    } else {
      throw new Error("Delegate is undefined or empty");
    }
  }

  addChild(
    parentId: string,
    childId: string,
    childSnapshot: CoreSnapshot<T, K>
  ): void {}

  compareSnapshotState(
    stateA: Snapshot<T, K> | Snapshot<T, K>[] | null | undefined,
    stateB: Snapshot<T, K> | null | undefined
  ): boolean {
    if (!stateA && !stateB) {
      return true; // Both are null or undefined
    }

    if (!stateA || !stateB) {
      return false; // One is null or undefined while the other is not
    }

    // Helper function to compare snapshot objects
    const compareSnapshot = (
      snapshotA: Snapshot<T, K>,
      snapshotB: Snapshot<T, K>
    ): boolean => {
      if (!snapshotA && !snapshotB) {
        return true; // Both are null or undefined
      }

      if (!snapshotA || !snapshotB) {
        return false; // One is null or undefined while the other is not
      }

      // Compare based on available properties
      if (snapshotA._id !== undefined && snapshotB._id !== undefined) {
        return snapshotA._id === snapshotB._id;
      }

      return (
        snapshotA.id === snapshotB.id &&
        snapshotA.data === snapshotB.data &&
        snapshotA.name === snapshotB.name &&
        snapshotA.timestamp === snapshotB.timestamp &&
        snapshotA.title === snapshotB.title &&
        snapshotA.createdBy === snapshotB.createdBy &&
        snapshotA.description === snapshotB.description &&
        snapshotA.tags === snapshotB.tags &&
        snapshotA.subscriberId === snapshotB.subscriberId &&
        snapshotA.store === snapshotB.store &&
        this.compareSnapshotState(snapshotA.state, snapshotB.state) && // Comparison of nested states
        snapshotA.todoSnapshotId === snapshotB.todoSnapshotId &&
        snapshotA.initialState === snapshotB.initialState
        // Add more properties as needed
      );
    };

    // Refactored array comparison logic
    if (Array.isArray(stateA)) {
      // Handle the case when stateA is an array and compare each item to stateB
      if (Array.isArray(stateB)) {
        // If both are arrays, compare their lengths and items
        if (stateA.length !== stateB.length) {
          return false; // Arrays have different lengths
        }

        for (let i = 0; i < stateA.length; i++) {
          if (!compareSnapshot(stateA[i], stateB[i])) {
            return false; // Arrays differ at index i
          }
        }

        return true; // Arrays are deeply equal
      } else {
        // If stateA is an array and stateB is not, we compare each item in stateA to stateB
        return stateA.every((snapshot) =>
          compareSnapshot(snapshot, stateB as Snapshot<T, K>)
        );
      }
    } else {
      // If stateA is not an array, compare stateA and stateB directly
      return compareSnapshot(stateA as Snapshot<T, K>, stateB);
    }
  }

  deepCompare(objA: any, objB: any): boolean {
    // Basic deep comparison for objects
    const keysA = Object.keys(objA);
    const keysB = Object.keys(objB);

    if (keysA.length !== keysB.length) {
      return false; // Different number of keys
    }

    for (let key of keysA) {
      if (objA[key] !== objB[key]) {
        return false; // Different value for key
      }
    }

    return true; // Objects are deeply equal
  }

  shallowCompare(objA: any, objB: any): boolean {
    // Basic shallow comparison for objects
    return JSON.stringify(objA) === JSON.stringify(objB);
  }

  getDataStoreMethods(): DataStoreMethods<T, K> {
    return {
      addData: this.addData.bind(this),
      getItem: this.getItem.bind(this),
      removeData: this.removeData.bind(this),
      category: this.category as string,
      dataStoreMethods: this.dataStoreMethods as DataStoreMethods<T, K>,
      initialState: this.initialState ? this.initialState : null,
      updateData: this.updateData.bind(this),
      updateDataTitle: this.updateDataTitle.bind(this),
      updateDataDescription: this.updateDataDescription.bind(this),
      addDataStatus: this.addDataStatus.bind(this),
      updateDataStatus: this.updateDataStatus.bind(this),
      addDataSuccess: this.addDataSuccess.bind(this),
      getDataVersions: this.getDataVersions.bind(this),
      updateDataVersions: this.updateDataVersions.bind(this),
      getBackendVersion: this.getBackendVersion.bind(this),
      getFrontendVersion: this.getFrontendVersion.bind(this),
      getAllKeys: this.getAllKeys.bind(this),
      fetchData: this.fetchData.bind(this),
      setItem: this.setItem.bind(this),
      removeItem: this.removeItem.bind(this),
      getAllItems: this.getAllItems.bind(this),
      getData: this.getData.bind(this),
      addSnapshot: this.addSnapshot.bind(this),
      addSnapshotSuccess: this.addSnapshotSuccess.bind(this),
      getSnapshot: this.getSnapshot.bind(this),
      getSnapshotSuccess: this.getSnapshotSuccess.bind(this),
      getSnapshotsBySubscriber: this.getSnapshotsBySubscriber.bind(this),
      getSnapshotsBySubscriberSuccess:
        this.getSnapshotsBySubscriberSuccess.bind(this),
      getSnapshotsByTopic: this.getSnapshotsByTopic.bind(this),
      getSnapshotsByTopicSuccess: this.getSnapshotsByTopicSuccess.bind(this),
      getSnapshotsByCategory: this.getSnapshotsByCategory.bind(this),
      getSnapshotsByCategorySuccess:
        this.getSnapshotsByCategorySuccess.bind(this),
      getSnapshotsByKey: this.getSnapshotsByKey.bind(this),
      getSnapshotsByKeySuccess: this.getSnapshotsByKeySuccess.bind(this),
      getSnapshotsByPriority: this.getSnapshotsByPriority.bind(this),
      getSnapshotsByPrioritySuccess:
        this.getSnapshotsByPrioritySuccess.bind(this),
      snapshotMethods: this.snapshotMethods,
      getDelegate: this.getDelegate,
      getStoreData: this.getStoreData.bind(this),

      updateStoreData: this.updateStoreData.bind(this),
      updateDelegate: this.updateDelegate.bind(this),
      getSnapshotContainer: this.getSnapshotContainer.bind(this),
      getSnapshotVersions: this.getSnapshotVersions.bind(this),
      mapSnapshots: this.mapSnapshots.bind(this),
    };
  }

  getDelegate(context: {
    useSimulatedDataSource: boolean;
    simulatedDataSource: SnapshotStoreConfig<T, K>[];
  }): Promise<DataStore<T, K>[]> {
    // Convert SnapshotStoreConfig to DataStore
    return convertToDataStore(context.simulatedDataSource)
  }

  determineCategory(
    snapshot: string | Snapshot<T, K> | null | undefined
  ): string {
    if (snapshot && snapshot.store) {
      return snapshot.store.toString();
    }
    return "";
  }

  determineSnapshotStoreCategory(
    storeId: number,
    snapshotStore: SnapshotStore<T, K>,
    configs: SnapshotStoreConfig<T, K>[]
  ): string {
    // Check if configs array is empty
    if (configs.length === 0) {
      return "";
    }

    // Example logic: Determine category based on the majority category in configs
    const categoryCount: Record<string, number> = {};

    configs.forEach((config) => {
      const category =
        typeof config.category === "string"
          ? config.category
          : (config.category as CategoryProperties)?.name;
      if (category) {
        categoryCount[category] = (categoryCount[category] || 0) + 1;
      }
    });

    // Find the category with the highest count
    let maxCategory = "";
    let maxCount = 0;

    for (const category in categoryCount) {
      if (categoryCount[category] > maxCount) {
        maxCount = categoryCount[category];
        maxCategory = category;
      }
    }

    return maxCategory;
  }

  determinePrefix<T extends Data>(
    snapshot: T | null | undefined,
    category: string
  ): string {
    if (category === "user") {
      return "USR";
    } else if (category === "team") {
      return "TM";
    } else if (category === "project") {
      return "PRJ";
    } else if (category === "task") {
      return "TSK";
    } else if (category === "event") {
      return "EVT";
    } else if (category === "file") {
      return "FIL";
    } else if (category === "document") {
      return "DOC";
    } else if (category === "message") {
      return "MSG";
    } else if (category === "location") {
      return "LOC";
    } else if (category === "coupon") {
      return "CPN";
    } else if (category === "video") {
      return "VID";
    } else if (category === "survey") {
      return "SRV";
    } else if (category === "analytics") {
      return "ANL";
    } else if (category === "chat") {
      return "CHT";
    } else if (category === "thread") {
      return "THD";
    } else if (snapshot?.name) {
      // Ensure snapshot is not null or undefined
      return "SNAP";
    } else {
      return "GEN"; // Default prefix
    }
  }

  async updateSnapshot(
    snapshotId: string,
    data: Map<string, Snapshot<T, K>>,
    events: Record<string, CalendarManagerStoreClass<T, K>[]>,
    snapshotStore: SnapshotStore<T, K>,
    dataItems: RealtimeDataItem[],
    newData: Snapshot<T, K>,
    payload: UpdateSnapshotPayload<T>,
    store: SnapshotStore<any, K>,
    callback?: (snapshot: Snapshot<T, K>) => void  
  ): Promise<{ snapshot: Snapshot<T, K> }> {
    try {
      // Create updated snapshot data
      const updatedSnapshotData: Snapshot<T, K> = {
        id: snapshotId,
        events: undefined,
        meta: {},
        data: {
          ...(snapshotStore.data || new Map<string, Snapshot<T, K>>()),  
          ...newData.data, // Merge with new data
        },
        timestamp: new Date(),
        category: "update",
        length: 0,
        content: undefined,
        initialState: null,
        getSnapshotId: function (key: string | T): unknown {
          throw new Error("Function not implemented.");
        },
        compareSnapshotState: function (
          arg0: Snapshot<T, K> | null,
          state: any
        ): boolean {
          throw new Error("Function not implemented.");
        },
        eventRecords: null,
        snapshotStore: null,
        getParentId: function (
          id: string,
          snapshot: Snapshot<SnapshotUnion<BaseData, Meta>, T>): string | null {
          throw new Error("Function not implemented.");
        },
        getChildIds: function (
          id: string,
          childSnapshot: Snapshot<T, K>
        ): string[] {
          throw new Error("Function not implemented.");
        },
        addChild: function (
          parentId: string,
          childId: string,
          childSnapshot: Snapshot<T, K>
        ): void {
          throw new Error("Function not implemented.");
        },
        removeChild: function (
          parentId: string,
          childId: string,
          childSnapshot: Snapshot<T, K>
        ): void {
          throw new Error("Function not implemented.");
        },
        getChildren: function (
          id: string,
          childSnapshot: Snapshot<T, K>
        ): CoreSnapshot<T, K>[] {
          throw new Error("Function not implemented.");
        },
        hasChildren: function (id: string): boolean {
          throw new Error("Function not implemented.");
        },
        isDescendantOf: function (
          childId: string,
          parentId: string,
          parentSnapshot: Snapshot<T, K>,
          childSnapshot: Snapshot<T, K>
        ): boolean {
          throw new Error("Function not implemented.");
        },
        dataItems: null,
        newData: null,
        stores: null,
        getStore: function (
          storeId: number,
          snapshotStore: SnapshotStore<T, K>,
          snapshotId: string | null,
          snapshot: Snapshot<T, K>,
          snapshotStoreConfig: SnapshotStoreConfig<T, K>,
          type: string,
          event: Event
        ): SnapshotStore<T, K> | null {
          throw new Error("Function not implemented.");
        },

        addStore: function (
          storeId: number,
          snapshotId: string,
          snapshotStore: SnapshotStore<T, K>,
          snapshot: Snapshot<T, K>,
          type: string,
          event: Event
        ): SnapshotStore<T, K> | null {
          throw new Error("Function not implemented.");
        },
        mapSnapshot: function (
          id: number,
          storeId: string | number,
          snapshotStore: SnapshotStore<T, K>,
          snapshotContainer: SnapshotContainer<T, K>,
          snapshotId: string,
          criteria: CriteriaType,
          snapshot: Snapshot<T, K>,
          type: string,
          event: Event,
          callback: (snapshot: Snapshot<T, K>) => void,
          mapFn: (item: T) => T
        ): Snapshot<T, K> | null {
          throw new Error("Function not implemented.");
        },
        mapSnapshotWithDetails: function (
          storeId: number,
          snapshotStore: SnapshotStore<T, K>,
          snapshotId: string,
          snapshot: Snapshot<T, K>,
          type: string,
          event: Event,
          callback: (snapshot: Snapshot<T, K>) => void
        ): SnapshotWithData<T, K> | null {
          throw new Error("Function not implemented.");
        },
        removeStore: function (
          storeId: number,
          store: SnapshotStore<T, K>,
          snapshotId: string,
          snapshot: Snapshot<T, K>,
          type: string,
          event: Event
        ): void {
          throw new Error("Function not implemented.");
        },
        unsubscribe: function (unsubscribeDetails: {
          userId: string;
          snapshotId: string;
          unsubscribeType: string;
          unsubscribeDate: Date;
          unsubscribeReason: string;
          unsubscribeData: any;
        }): void {
          throw new Error("Function not implemented.");
        },
        fetchSnapshot: async (
          callback: (
            snapshotId: string,
            payload: FetchSnapshotPayload<K, Meta> | undefined,
            snapshotStore: SnapshotStore<T, K>,
            payloadData: T | Data,
            category: Category | undefined,
            categoryProperties: CategoryProperties | undefined,
            timestamp: Date,
            data: T,
            delegate: SnapshotWithCriteria<T, K>[]
          ) => Snapshot<T, K> | Promise<{ snapshot: Snapshot<T, K> }>
        ): Promise<{
          id: string;
          category: Category | string | symbol | undefined; 
          categoryProperties: CategoryProperties | undefined;
          timestamp: Date;
          snapshot: Snapshot<T, K>; 
          data: T; 
          delegate: SnapshotStoreConfig<T, K>[]
         }> => {
          // Implement your fetch logic here
          throw new Error("Function not implemented.");
        },
        addSnapshotFailure: function (
          date: Date,
          snapshotManager: SnapshotManager<T, K>,
          snapshot: Snapshot<T, K>,
          payload: { error: Error }
        ): void {
          throw new Error("Function not implemented.");
        },
        configureSnapshotStore: function (
          snapshotStore: SnapshotStore<T, K>,
          storeId: number,
          data: Map<string, Snapshot<T, K>>,
          events: Record<string, CalendarManagerStoreClass<T, K>[]>,
          dataItems: RealtimeDataItem[],
          newData: Snapshot<T, K>,
          payload: ConfigureSnapshotStorePayload<T, K>,
          store: SnapshotStore<any, K>,
          callback: (snapshotStore: SnapshotStore<T, K>) => void
        ): void | null {
          throw new Error("Function not implemented.");
        },
        updateSnapshotSuccess: function (
          snapshotId: string,
          snapshotManager: SnapshotManager<T, K>,
          snapshot: Snapshot<T, K>,
          payload?: { data?: any }
        ): void | null {
          throw new Error("Function not implemented.");
        },
        createSnapshotFailure: function (
          date: Date,
          snapshotId: string,
          snapshotManager: SnapshotManager<T, K>,
          snapshot: Snapshot<T, K>,
          payload: { error: Error }
        ): Promise<void> {
          throw new Error("Function not implemented.");
        },
        createSnapshotSuccess: function (
          snapshotId: string,
          snapshotManager: SnapshotManager<T, K>,
          snapshot: Snapshot<T, K>,
          payload?: { data?: any }
        ): void | null {
          throw new Error("Function not implemented.");
        },
        createSnapshots: function (
          id: string,
          snapshotId: string,
          snapshots: Snapshot<T, K>[], // Use Snapshot<T, K>[] here
          snapshotManager: SnapshotManager<T, K>,
          payload: CreateSnapshotsPayload<T, K>,
          callback: (snapshots: Snapshot<T, K>[]) => void | null,
          snapshotDataConfig?: SnapshotConfig<T, K>[] | undefined,
          category?: Category,
          categoryProperties?: string | CategoryProperties
        ): Snapshot<T, K>[] | null {
          // Implement the logic for creating snapshots
          // For example, processing the snapshots array, applying transformations, etc.
          const createdSnapshots: Snapshot<T, K>[] = snapshots.map(
            (snapshot) => {
              // Ensure that snapshot.data is correctly typed as T | Map<string, Snapshot<T, K>> | null | undefined
              const processedData:
                | T
                | Map<string, Snapshot<T, K>>
                | null
                | undefined = snapshot.data
                ? { ...snapshot.data } // Properly typed data based on existing snapshot data
                : null; // Ensure null is assignable if data is undefined

              // Create or update snapshots based on payload or other logic
              return {
                ...snapshot,
                id: `${id}-${snapshotId}`, // Modify snapshot ID as needed
                data: processedData, // Assign the processed data
                // Additional processing if needed
              };
            }
          );

          // Invoke the callback with the created snapshots
          callback(createdSnapshots);

          return createdSnapshots;
        },
        onSnapshot: function (
          snapshotId: string,
          snapshot: Snapshot<T, K>,
          type: string,
          event: Event,
          callback: (snapshot: Snapshot<T, K>) => void
        ): void {
          throw new Error("Function not implemented.");
        },
        onSnapshots: function (
          snapshotId: string,
          snapshots: Snapshots<T, K>,
          type: string,
          event: Event,
          callback: (snapshots: Snapshots<T, K>) => void
        ): void {
          throw new Error("Function not implemented.");
        },

        handleSnapshot: function (
          id: string,
          snapshotId: string,
          snapshot: T | null,
          snapshotData: T,
          category: symbol | string | Category | undefined,
          categoryProperties: CategoryProperties | undefined,
          callback: (snapshot: T) => void,
          snapshots: SnapshotsArray<T, K>,
          type: string,
          event: Event,
          snapshotContainer?: T,
          snapshotStoreConfig?: SnapshotStoreConfig<T, any> | null
        ): Promise<Snapshot<T, K> | null> {
          throw new Error("Function not implemented.");
        },
      };

      // Update snapshotStore with the new data
      if (!snapshotStore.data) {
        snapshotStore.data = new Map<string, Snapshot<T, K>>(); // Initialize if needed
      }
      snapshotStore.data.set(snapshotId.toString(), updatedSnapshotData);

      // Set the updated snapshot in the store
      snapshotStore.data.set(snapshotId.toString(), updatedSnapshotData);

      console.log("Snapshot updated successfully:", snapshotStore);

      // Extract the updated snapshot from the store
      const updatedSnapshot = snapshotStore.data.get(snapshotId.toString());

      if (updatedSnapshot) {
        // Call the callback with the updated snapshot data if provided
        if (callback) {
          callback(updatedSnapshotData);
        }

        // Return the updated snapshot wrapped in a Promise
        return Promise.resolve({ snapshot: updatedSnapshot });
      } else {
        throw new Error("Snapshot not found in the store");
      }
    } catch (error) {
      console.error("Error updating snapshot:", error);
      return Promise.reject(error); // Ensure error is rejected properly
    }
  }

  updateSnapshotSuccess(): void {
    notify(
      "updateSnapshotSuccess",
      "Snapshot updated successfully.",
      "",
      new Date(),
      NotificationTypeEnum.Success,
      NotificationPosition.TopRight
    );
  }

  updateSnapshotFailure(
    snapshotId: string,
    snapshotManager: SnapshotManager<T, K>,
    snapshot: Snapshot<T, K>,
    date: Date | undefined,
    payload: { error: Error }
  ): void {
    // Combine properties if either is missing any
    if (!snapshotId) {
      snapshotId =
        typeof snapshot.id === "string" ? snapshot.id : "unknown_snapshot_id";
    }
    if (!date) {
      date = new Date(); // Default to the current date if no date is provided
    }

    notify(
      "updateSnapshotFailure",
      `Failed to update snapshot: ${payload.error.message}`,
      snapshotId,
      date,
      NotificationTypeEnum.Error,
      NotificationPosition.TopRight
    );
  }

  removeSnapshot(snapshotToRemove: Snapshot<T, K>): void {
    this.snapshots = this.snapshots.filter((s) => s.id !== snapshotToRemove.id);
    notify(
      "removeSnapshot",
      `Snapshot ${snapshotToRemove.id} removed successfully.`,
      "",
      new Date(),
      NotificationTypeEnum.Success,
      NotificationPosition.TopRight
    );
  }

  clearSnapshots(): void {
    this.snapshots = [];
    notify(
      "clearSnapshots",
      "All snapshots cleared.",
      "",
      new Date(),
      NotificationTypeEnum.Success,
      NotificationPosition.TopRight
    );
  }

  addSnapshot(
    snapshot: Snapshot<T, K>,
    snapshotId: string,
    subscribers: SubscriberCollection<T, K> | undefined
  ): Promise<Snapshot<T, K> | undefined> {
    const snapshotData: SnapshotData<T, K> = {
      id: snapshot.id || "",
      data: snapshot?.data ?? ({} as T),
      timestamp: new Date(),
      category: snapshot.category || this.category,
      subscribers: subscribers || [],
      key: snapshot.key || this.key,
      topic: snapshot.topic || this.topic,
      state: snapshot.state || this.state,
      config: snapshot.config || this.config,
      delegate: snapshot.delegate || this.delegate,
      subscription: snapshot.subscription || this.subscription,
      length: snapshot.length || 0,
      metadata: snapshot.metadata || {},
      store: snapshot.store || null,
      getSnapshotId: snapshot.getSnapshotId || this.getSnapshotId,
      compareSnapshotState:
        snapshot.compareSnapshotState || this.compareSnapshotState,
      snapshotStore: snapshot.snapshotStore || this.snapshotStore,
      snapshotConfig: snapshot.snapshotConfig || this.snapshotConfig,

      snapshots: snapshot.snapshots || this.snapshots,
      configOption: snapshot.configOption || this.configOption,
      determinePrefix: snapshot.determinePrefix || this.determinePrefix,
      updateSnapshot: snapshot.updateSnapshot || this.updateSnapshot,
      updateSnapshotSuccess:
        snapshot.updateSnapshotSuccess || this.updateSnapshotSuccess,
      updateSnapshotFailure:
        snapshot.updateSnapshotFailure || this.updateSnapshotFailure,
      removeSnapshot: snapshot.removeSnapshot || this.removeSnapshot,
      clearSnapshots: snapshot.clearSnapshots || this.clearSnapshots,
      addSnapshot: snapshot.addSnapshot || this.addSnapshot,
      addSnapshotSuccess:
        snapshot.addSnapshotSuccess || this.addSnapshotSuccess,
      addSnapshotFailure:
        snapshot.addSnapshotFailure || this.addSnapshotFailure,
      updateSnapshots: snapshot.updateSnapshots || this.updateSnapshots,
      updateSnapshotsSuccess:
        snapshot.updateSnapshotsSuccess || this.updateSnapshotsSuccess,
      updateSnapshotsFailure:
        snapshot.updateSnapshotsFailure || this.updateSnapshotsFailure,

      takeSnapshot: snapshot.takeSnapshot || this.takeSnapshot,
      takeSnapshotsSuccess:
        snapshot.takeSnapshotsSuccess || this.takeSnapshotsSuccess,
      configureSnapshotStore:
        snapshot.configureSnapshotStore || this.configureSnapshotStore,
      getData: snapshot.getData || this.getData,
      takeSnapshotSuccess:
        snapshot.takeSnapshotSuccess || this.takeSnapshotSuccess,
      flatMap: snapshot.flatMap || this.flatMap,

      set: snapshot.set || this.set,
      notifySubscribers: this.notifySubscribers,
      createInitSnapshot: this.createInitSnapshot,
      createSnapshotSuccess: this.createSnapshotSuccess,
      createSnapshotFailure: this.createSnapshotFailure,

      initSnapshot: this.initSnapshot,
      setData: this.setData,
      mapSnapshots: this.mapSnapshots,

      getState: snapshot.getState || this.getState,
      setState: snapshot.setState || this.setState,
      validateSnapshot: snapshot.validateSnapshot || this.validateSnapshot,
      handleSnapshot: snapshot.handleSnapshot || this.handleSnapshot,
      handleActions: snapshot.handleActions || this.handleActions,
      setSnapshot: snapshot.setSnapshot || this.setSnapshot,
      setSnapshots: snapshot.setSnapshots || this.setSnapshots,
      clearSnapshot: snapshot.clearSnapshot || this.clearSnapshot,
      mergeSnapshots: snapshot.mergeSnapshots || this.mergeSnapshots,
      reduceSnapshots: snapshot.reduceSnapshots || this.reduceSnapshots,
      sortSnapshots: snapshot.sortSnapshots || this.sortSnapshots,
      filterSnapshots: snapshot.filterSnapshots || this.filterSnapshots,

      findSnapshot: snapshot.findSnapshot || this.findSnapshot,
      getSubscribers: snapshot.getSubscribers || this.getSubscribers,
      // notify: this.notify,
      // subscribe: this.subscribe,
      // unsubscribe: this.unsubscribe,
      // fetchSnapshot: this.fetchSnapshot,
      // fetchSnapshotSuccess: this.fetchSnapshotSuccess,
      // fetchSnapshotFailure: this.fetchSnapshotFailure,
      // getSnapshot: this.getSnapshot,
      // getSnapshots: this.getSnapshots,
      // getAllSnapshots: this.getAllSnapshots,
      // generateId: this.generateId,
      // batchFetchSnapshots: this.batchFetchSnapshots,
      // batchTakeSnapshotsRequest: this.batchTakeSnapshotsRequest,
      // batchUpdateSnapshotsRequest: this.batchUpdateSnapshotsRequest,
      // batchFetchSnapshotsSuccess: this.batchFetchSnapshotsSuccess,
      // batchFetchSnapshotsFailure: this.batchFetchSnapshotsFailure,
      // batchUpdateSnapshotsSuccess: this.batchUpdateSnapshotsSuccess,
      // batchUpdateSnapshotsFailure: this.batchUpdateSnapshotsFailure,
      // batchTakeSnapshot: this.batchTakeSnapshot,
      // handleSnapshotSuccess: this.handleSnapshotSuccess,
      // [Symbol.iterator]: this[Symbol.iterator],
      // [Symbol.asyncIterator]: this[Symbol.asyncIterator],
    };

    const id = `${prefix}_${this.generateId()}`;
    snapshotData.id = id;

    const snapshotStoreData: SnapshotStore<T, K> = {
      id: snapshotData.id,
      snapshots: [
        {
          // getSnapshotByKey: snapshotData.getSnapshotByKey,
          // mapSnapshotStore: snapshotData.mapSnapshotStore,
          // getSuubscribers: snapshotData.getSuubscribers,
          // getDataWithSearchCriteria: snapshotData.getDataWithSearchCriteria,
          data: snapshotData.data as Map<string, Snapshot<T, K>>,
          id: snapshotData.id,
          timestamp: snapshotData.timestamp as Date,
          category: snapshotData.category,
          key: "",
          topic: "",
          date: undefined,
          configOption: null,
          config: null,
          subscription: null,
          initialState: null,
          set: undefined,
          state: null,
          snapshots: [],
          type: "",
          dataStore: this.dataStore,
          // Implement getDataStore to return the expected type
          getDataStore: async function () {
            if(this.dataStore === undefined){
              throw Error("dataStore was not fund")
            }
            return this.dataStore;
          },
          setSnapshotSuccess: function () {
            defaultImplementation();
            return Promise.reject(new Error("Function not implemented."));
          },
          subscribeToSnapshots: function (
            snapshotStore: SnapshotStore<T, K>,
            snapshotId: string,
            snapshotData: SnapshotData<T, K>,
            category: Category | undefined,
            snapshotConfig: SnapshotStoreConfig<T, K>,
            callback: (snapshotStore: SnapshotStore<T, K>) => Subscriber<T, K> | null,
            snapshots: SnapshotsArray<T, K>,
            unsubscribe?: UnsubscribeDetails, 
          ): [] | SnapshotsArray<T, K> {
            if (this.subscription) {
              this.subscription.unsubscribe(
                snapshotId,
                unsubscribe,
                callback
              );
            }
            this.subscription = this.subscribe(
              snapshotId,
              callback,
              this.snapshots
            );
            this.subscription.subscribe();
            return;
          },
          subscribers: [],
          snapshotConfig: [],
          delegate: {} as SnapshotStoreConfig<T, K>[],

          async getItem(
            key: T
          ): Promise<Snapshot<T, K> | undefined> {
            if (this.snapshots.length === 0) {
              return undefined;
            }

            try {
              const snapshotId = await this.getSnapshotId(key).toString();
              const snapshot = await this.fetchSnapshot(
                snapshotId,
                category,
                timestamp,
                snapshot as SnapshotStore<BaseData>,
                data,
                delegate
              );

              if (snapshot) {
                const item = snapshot.getItem(key);
                return item as T | undefined;
              } else {
                return undefined;
              }
            } catch (error) {
              console.error("Error fetching snapshot:", error);
              return undefined;
            }
          },

          removeItem: function () {
            defaultImplementation();
            return Promise.reject(new Error("Function not implemented."));
          },
          compareSnapshotState: function () {
            defaultImplementation();
            return false;
          },
          setItem: function () {
            defaultImplementation();
            return Promise.reject(new Error("Function not implemented."));
          },
          deepCompare: function () {
            defaultImplementation();
            return false;
          },
          shallowCompare: function () {
            defaultImplementation();
            return false;
          },
          getDelegate: function (context: {
            useSimulatedDataSource: boolean;
            simulatedDataSource: SnapshotStoreConfig<T, K>[];
          }): Promise<DataStore<T, K>[]> {
            defaultImplementation();
            return Promise.resolve([]);
          },
          addSnapshotFailure: function (
            date: Date, 
            snapshotManager: SnapshotManager<T, K>, 
            snapshot: Snapshot<T, K>, 
            payload: { error: Error; }) {
            notify(
              `${error.message}`,
              `Snapshot added failed fully.`,
              "Error",
              new Date(),
              NotificationTypeEnum.Error,
              NotificationPosition.TopRight
            );
          },

          addSnapshotSuccess(
            snapshot: Snapshot<T, K>,
            subscribers: SubscriberCollection<T, K> 
          ): void {
            const index = this.delegate?.findIndex(
              (snapshotStore) =>
                snapshotStore.id === snapshot.id &&
                snapshotStore.snapshotCategory === snapshot.category &&
                snapshotStore.key === snapshot.key &&
                snapshotStore.topic === snapshot.topic &&
                snapshotStore.priority === snapshot.priority &&
                snapshotStore.tags === snapshot.tags &&
                snapshotStore.metadata === snapshot.metadata &&
                snapshotStore.status === snapshot.status &&
                snapshotStore.isCompressed === snapshot.isCompressed &&
                snapshotStore.expirationDate === snapshot.expirationDate &&
                snapshotStore.timestamp === snapshot.timestamp &&
                snapshotStore.data === snapshot.data &&
                this.compareSnapshotState(snapshotStore.state, snapshot.state)
            );

            if (index !== -1) {
              this.delegate[index].addSnapshotSuccess(snapshot, subscribers);

              notify(
                `${snapshot.id}`,
                `Snapshot ${snapshot.id} added successfully.`,
                "Success",
                new Date(),
                NotificationTypeEnum.Success,
                NotificationPosition.TopRight
              );
            } else {
              // Handle case where snapshotStore matching snapshot is not found
              console.error(`SnapshotStore matching ${snapshot.id} not found.`);
            }
          },
          determinePrefix: function <T extends Data>(
            snapshot: T | null | undefined,
            category: string
          ): string {
            defaultImplementation();
            return "";
          },
          updateSnapshot: function (
            snapshotId: string,
            data: Map<string, Snapshot<T, any>>,
            events: Record<string, CalendarManagerStoreClass<T, K>[]>,
            snapshotStore: SnapshotStore<T, K>,
            dataItems: RealtimeDataItem[],
            newData: Snapshot<T, any>,
            payload: UpdateSnapshotPayload<T>,
            store: SnapshotStore<any, BaseData>
          ): Promise<{ snapshot: SnapshotStore<T, K> }> {
            // Check if this.snapshots is defined and is an array
            if (!this.snapshots || !Array.isArray(this.snapshots)) {
              return Promise.reject(
                new Error("Snapshots collection is undefined or not an array.")
              );
            }

            const snapshot = this.snapshots.find(
              (snapshot: Snapshot<T, K>) => snapshot.id === snapshotId
            );
            if (snapshot) {
              snapshot.data = data;
              snapshot.events = events;
              snapshot.snapshotStore = snapshotStore;
              snapshot.dataItems = dataItems;
              snapshot.newData = newData;
              return Promise.resolve({ snapshot: snapshot });
            } else {
              return Promise.reject(
                new Error(`Snapshot ${snapshotId} not found.`)
              );
            }
          },
          updateSnapshotSuccess: function () {
            defaultImplementation();
          },

          updateSnapshotFailure(
            snapshotId: string,
            snapshotManager: SnapshotManager<T, K>,
            snapshot: Snapshot<T, K>,
            date: Date | undefined,
            payload: { error: Error }
          ): void {
            notify(
              "updateSnapshotFailure",
              `Failed to update snapshot: ${payload.error.message}`,
              "",
              new Date(),
              NotificationTypeEnum.Error,
              NotificationPosition.TopRight
            );
          },
          removeSnapshot: function (
          snapshotToRemove: Snapshot<T,  BaseData>) {
            if (!this.delegate) {
              // Handle the case where delegate is undefined
              console.warn("Delegate is not defined");
              return;
            }
            //compare state to find snapshot
            const index = this.delegate.findIndex(
              (snapshotStore) =>
                snapshotStore.id === snapshotToRemove.id &&
                snapshotStore.snapshotCategory === snapshotToRemove.category &&
                snapshotStore.key === snapshotToRemove.key &&
                snapshotStore.topic === snapshotToRemove.topic &&
                snapshotStore.priority === snapshotToRemove.priority &&
                snapshotStore.tags === snapshotToRemove.tags &&
                snapshotStore.metadata === snapshotToRemove.metadata &&
                snapshotStore.status === snapshotToRemove.status &&
                snapshotStore.isCompressed === snapshotToRemove.isCompressed &&
                snapshotStore.expirationDate ===
                  snapshotToRemove.expirationDate &&
                snapshotStore.timestamp === snapshotToRemove.timestamp &&
                snapshotStore.data === snapshotToRemove.data &&
                this.compareSnapshotState(
                  snapshotStore.state,
                  snapshotToRemove.state
                )
            );
            if (index !== -1) {
              this.delegate.splice(index, 1);
            }
            notify(
              `${snapshotToRemove.id}`,
              `Snapshot ${snapshotToRemove.id} removed successfully.`,
              "Success",
              new Date(),
              NotificationTypeEnum.Success,
              NotificationPosition.TopRight
            );
          },
          clearSnapshots: function () {
            this.delegate = [];
          },

          addSnapshot: async function (
            snapshot: Snapshot<T, K>,
            snapshotId: string,
            subscribers: SubscriberCollection<T, K> | undefined
          ): Promise<Snapshot<T, K> | undefined> {
            // Ensure snapshotStore is defined before proceeding
            if (!this.snapshotStore) {
              return Promise.reject(new Error("SnapshotStore is not defined."));
            }

            try {
              // Add the snapshot to the snapshot store
              await this.snapshotStore.addSnapshot(
                snapshot,
                snapshotId,
                subscribers
              );

              // Retrieve the snapshot from the snapshot store
              const result = await this.snapshotStore.getSnapshot(snapshotId);

              // Return the snapshot or undefined if not found
              return result;
            } catch (error: any) {
              // Handle errors appropriately
              return Promise.reject(
                new Error(`Failed to add snapshot: ${error.message}`)
              );
            }

            // This line is not necessary since any non-returned case in an async function automatically returns undefined
          },

          createInitSnapshot: function (
            id: string,
            initialData: T,
            snapshotData: SnapshotData<any, BaseData>,
            snapshotStoreConfig: SnapshotStoreConfig<any, BaseData>,
            category: symbol | string | Category | undefined
          ): Promise<SnapshotWithCriteria<T, K>>  {
            defaultImplementation();
            return {} as Snapshot<T, K>;
          },

          createSnapshotSuccess: function (
            snapshotId: string, 
            snapshotManager: SnapshotManager<T, K>,
            snapshot: Snapshot<T, K>, 
            payload?: { data?: any; } | undefined
          ) {
            defaultImplementation();
          },

          createSnapshotFailure: async function (
            date: Date,
            snapshotId: string,
            snapshotManager: SnapshotManager<T, K>,
            snapshot: Snapshot<T, K>,
            payload: { error: Error; }
          ): Promise<void> {
            notify(
              "createSnapshotFailure",
              `Error creating snapshot: ${error.message}`,
              "",
              new Date(),
              NotificationTypeEnum.Error,
              NotificationPosition.TopRight
            );
            if (this.delegate && this.delegate.length > 0) {
              for (const delegateConfig of this.delegate) {
                if (
                  delegateConfig &&
                  typeof delegateConfig.createSnapshotFailure === "function"
                ) {
                  await delegateConfig.createSnapshotFailure(
                    snapshotId,
                    snapshotManager,
                    snapshot,
                    error
                  );
                  return;
                }
              }
              throw new Error(
                "No valid delegate found for createSnapshotFailure"
              );
            } else {
              throw new Error("Delegate is undefined or empty");
            }
          },
          updateSnapshots: function () {
            defaultImplementation();
          },
          updateSnapshotsSuccess: function () {
            defaultImplementation();
          },
          updateSnapshotsFailure: function (error: Payload) {
            defaultImplementation();
          },
          initSnapshot: function (
            snapshot: SnapshotStore<T, K> | Snapshot<T, K> | null,
            snapshotId: number,
            snapshotData: SnapshotData<T, K>,
            category: Category | undefined,
            categoryProperties: CategoryProperties | undefined,
            snapshotConfig: SnapshotStoreConfig<T, K>,
            callback: (snapshotStore: SnapshotStore<any, any>) => void,
            snapshotStoreConfig: SnapshotStoreConfig<
              SnapshotWithCriteria<any, BaseData>,
             BaseData
            >,
          ) {
            defaultImplementation();
          },

          takeSnapshot: function (snapshot: Snapshot<T, K>): Promise<{
            snapshot: Snapshot<T, K>;
          }> {
            defaultImplementation();
            return Promise.reject(new Error("Function not implemented."));
          },
          takeSnapshotSuccess: function (snapshot: Snapshot<T, K>) {
            defaultImplementation();
          },
          takeSnapshotsSuccess: function (snapshots: T[]) {
            defaultImplementation();
          },
          configureSnapshotStore: function () {
            defaultImplementation();
          },

          getData: function (
            id: number | string,
            snapshotStore: SnapshotStore<T, K>
          ): Promise<Snapshot<T, K>> {
            const snapshot = snapshotStore.getSnapshot(id); // Assuming this returns Snapshot<T, K>
          
            
            // Use the existing type guard function to verify if it's a Snapshot<BaseData>
            if (snapshot && isSnapshotUnionBaseData(snapshot) && snapshot !== undefined) {
              return Promise.resolve(snapshot); // Snapshot is now ensured to be Snapshot<BaseData>
            }
          
            return Promise.reject(
              new Error(`Snapshot with id ${id} is not of type Snapshot<T, K>`)
            );
          },
          
          flatMap: function <R extends Iterable<any>>(
            callback: (
              value: SnapshotStoreConfig<R, BaseData>, // The current element
              index: number,                           // The index of the current element
              array: SnapshotStoreConfig<R, BaseData>[] // The full array of SnapshotStoreConfigs
            ) => R
          ): R extends (infer I)[] ? I[] : R[] {
            // First, we store the result of each callback invocation
            const result: any[] = [];
          
            // Ensure this.snapshots is an array before iterating
            if (Array.isArray(this.snapshots)) {
 
            // Iterate over the array of SnapshotStoreConfig<R, BaseData>
            for (let i = 0; i < this.snapshots.length; i++) {
              const currentValue = this.snapshots[i];
          
              // Invoke the callback with the current value, index, and the full array
              const mappedValue = callback(currentValue, i, this.snapshots);
          
              // Flatten the result by spreading the mappedValue (an iterable R) into result
              result.push(...mappedValue);
            }
          }
          
            // Return the flattened result array
            return result as R extends (infer I)[] ? I[] : R[];
          },
          setData: function (id: string, data: Map<string, Snapshot<T, K>>) {
            defaultImplementation();
          },
          getState: function () {
            defaultImplementation();
          },
          setState: function (state: any) {
            defaultImplementation();
          },
          validateSnapshot: function (
            snapshotId: string,
            snapshot: Snapshot<T, K>
          ): boolean {
            defaultImplementation();
            return false;
          },
          handleSnapshot: function (
            id: string,
            snapshotId: string,
            snapshot: T extends SnapshotData<T, K> ? Snapshot<T, K> :  null,
            snapshotData: T,
            category: symbol | string | Category | undefined,
            categoryProperties: CategoryProperties | undefined,
            callback: (snapshot: T) => void,
            snapshots: SnapshotsArray<T, K>,
            type: string,
            event: Event,
            snapshotContainer?: T,
            snapshotStoreConfig?: SnapshotStoreConfig<T, any> | null
          ): Promise<Snapshot<T, K> | null> {
            return new Promise((resolve, reject) => {});
          },
          handleActions: function () {
            defaultImplementation();
          },
          
          
          setSnapshot: function (snapshot: Snapshot<T, K>) {
            this.snapshot = snapshot;  
          },
          
          setSnapshots: function (snapshots: SnapshotStore<T, K>[]) {
            // set snapshots
            const snapshotStore = snapshots;
          },

          clearSnapshot: function () {
            defaultImplementation();
          },
          mergeSnapshots: function (snapshots: Snapshots<T, K>, category: string) {
            defaultImplementation();
          },
          reduceSnapshots: <T extends BaseData>(
            callback: (
              acc: T,
              snapshot: Snapshot<T, T>) => T, 
            initialValue: T
          ): T | undefined => {
            defaultImplementation();
          },
          sortSnapshots: function () {
            defaultImplementation();
          },
          filterSnapshots: function () {
            defaultImplementation();
          },
          mapSnapshots: function  <U, V>(
            storeIds: number[],
        snapshotId: string,
        category: symbol | string | Category | undefined,
        categoryProperties: CategoryProperties | undefined,
        snapshot: Snapshot<T, K>,
        timestamp: string | number | Date | undefined,
        type: string,
        event: Event,
        id: number,
        snapshotStore: SnapshotStore<T, K>,
        data: BaseData,
        callback: (
          storeIds: number[],
          snapshotId: string,
          category: symbol | string | Category | undefined,
          categoryProperties: CategoryProperties | undefined,
          snapshot: Snapshot<T, K>,
          timestamp: string | number | Date | undefined,
          type: string,
          event: Event,
          id: number,
          snapshotStore: SnapshotStore<T, K>,
          data: V, // Use V for the callback data type
          index: number
        ) => U 
          ): U[] {
            defaultImplementation();
          },
          findSnapshot: (
            predicate: (snapshot: Snapshot<T, K>) => boolean
          ): Snapshot<T, K> | undefined => {
            if (!this.delegate) {
              return undefined;
            }

            for (const delegate of this.delegate) {
              const foundSnapshot = delegate.findSnapshot(predicate);
              if (foundSnapshot) {
                return foundSnapshot;
              }
            }

            return undefined;
          },
          getSubscribers(
            subscribers: Subscriber<T, K>[],
            snapshots: Snapshots<T, K>
          ): Promise<{
            subscribers: Subscriber<T, K>[];
            snapshots: Snapshots<T, K>;
          }> {
            if (this.delegate && this.delegate.length > 0) {
              for (const delegateConfig of this.delegate) {
                if (
                  delegateConfig &&
                  typeof delegateConfig.getSubscribers === "function"
                ) {
                  return delegateConfig.getSubscribers(subscribers, snapshots);
                }
              }
              throw new Error("No valid delegate found for getSubscribers");
            } else {
              throw new Error("Delegate is undefined or empty");
            }
          },
          notify: function () {
            defaultImplementation();
          },

          notifySubscribers(
            message: string,
            subscribers: Subscriber<T, K>[],
            callback: (data: Snapshot<T, K>) => Subscriber<T, K>[],
            data: Partial<SnapshotStoreConfig<SnapshotUnion<BaseData, Meta>, BaseData>>,
          ): Subscriber<T, K>[] {
            // Notify each subscriber with the provided data
            const notifiedSubscribers = subscribers.map((subscriber) =>
              subscriber.notify
                ? subscriber.notify(data, callback, subscribers)
                : subscriber
            );
            return notifiedSubscribers as Subscriber<T, K>[];
          },
          subscribe: function (): [] | SnapshotsArray<T, K> {
            defaultImplementation();
          },
          unsubscribe: function () {
            defaultImplementation();
          },
          
          fetchSnapshot(
            snapshotId: string, // Matches signature
            payload: FetchSnapshotPayload<BaseT, K> | undefined, // Matches signature
            snapshotStore: SnapshotStore<T, K>, // Matches signature
            payloadData: T | Data, // Matches signature
            category: Category | undefined, // Matches signature
            categoryProperties: CategoryProperties | undefined, // Matches signature
            timestamp: Date, // Matches signature
            data: T, // Matches signature
            delegate: SnapshotWithCriteria<T, K>[] // Matches signature
          ): Promise<{
            id: any;
            category: symbol | string | Category | undefined
            categoryProperties: CategoryProperties;
            timestamp: any;
            snapshot: Snapshot<T, K>;
            data: T;
            delegate: SnapshotStoreConfig<T, K>[];
          }> {
            return Promise.resolve({
              id,
              category,
              categoryProperties,
              timestamp,
              snapshot: snapshot,
              data: data,
              delegate: delegate,
            });
          },
          fetchSnapshotSuccess: function (
            snapshotId: string,
              snapshotStore: SnapshotStore<T, K>,
              payload: FetchSnapshotPayload<T, K> | undefined,
              snapshot: Snapshot<T, K>,
              data: T,
              delegate: SnapshotWithCriteria<T, K>[],
              snapshotData: (
                snapshotManager: SnapshotManager<SnapshotUnion<BaseData, Meta>, T>,
                subscribers: Subscriber<T, K>[],
                snapshot: Snapshot<SnapshotUnion<BaseData, Meta>, T>
              ) => void,
          ): SnapshotWithCriteria<T, K>[] {

            // Process snapshotData and return an array of SnapshotWithCriteria<T, K>[]

            // Assuming some logic here to generate the correct return value
            // Transform the data as per the requirements

            const criteriaSnapshots: SnapshotWithCriteria<T, K>[] = delegate.map(item => {
              // Example: Construct a SnapshotWithCriteria object for each item in the delegate
              return {
                ...item, // Assuming `item` already matches the structure
                data: data, // Include additional data as needed
                timestamp: new Date(), // Example: Add timestamp
                // Add any other relevant fields from the SnapshotWithCriteria
              };
            });

            return criteriaSnapshots; // Return the correct array type
          },
          fetchSnapshotFailure: function () {
            defaultImplementation();
          },
          getSnapshot: function (
            snapshot: (id: string | number) =>
              | Promise<{
                  snapshotId: number;
                  snapshotData: SnapshotData<T, K>;
                  category: symbol | string | Category | undefined
                  categoryProperties: CategoryProperties;
                  dataStoreMethods: DataStore<T, K>;
                  timestamp: string | number | Date | undefined;
                  id: string | number | undefined;
                  snapshot: Snapshot<T, K>;
                  snapshotStore: SnapshotStore<T, K>;
                  data: T;
                }>  | undefined
          ): Promise<Snapshot<T, K>> {
            return Promise.resolve({
              category: "",
              timestamp: "",
              id: "",
              snapshot: {} as T,
              snapshotStore: {} as SnapshotStore<T, K>,
              data: {} as T,
            });
          },
          getSnapshots: function () {
            defaultImplementation();
          },
          getAllSnapshots: function (): Promise<Snapshot<T, K>[]> {
            defaultImplementation();
          },
          generateId: function () {
            defaultImplementation();
            return "";
          },
          batchFetchSnapshots: function (): Promise<Snapshot<T, K>[]> {
            defaultImplementation();
          },
          batchTakeSnapshotsRequest: function (): Promise<void> {
            defaultImplementation();
          },
          batchUpdateSnapshotsRequest: function (): Promise<void> {
            defaultImplementation();
          },
          batchFetchSnapshotsSuccess: function () {
            defaultImplementation();
          },
          batchFetchSnapshotsFailure: function () {
            defaultImplementation();
          },
          batchUpdateSnapshotsSuccess: function () {
            defaultImplementation();
          },
          batchUpdateSnapshotsFailure: function () {
            defaultImplementation();
          },
          batchTakeSnapshot: function (
            snapshotId: string, 
            snapshotStore: SnapshotStore<T, K>,
            snapshots: Snapshots<T, K>
          ): Promise<{ snapshots: Snapshots<T, K> }> {
            defaultImplementation();
            return Promise.reject(new Error("Function not implemented."));
          },
          handleSnapshotSuccess: function (
            message: string,
            snapshot: Snapshot<T, K> | null,
            snapshotId: string
          ) {
            defaultImplementation();
          },
          [Symbol.iterator]: function (): IterableIterator<Snapshot<T, K>> {
            return {} as IterableIterator<Snapshot<T, K>>;
          },
          [Symbol.asyncIterator]: function (): AsyncIterableIterator<
            Snapshot<T, K>
          > {
            defaultImplementation();
            return {} as AsyncIterableIterator<Snapshot<T, K>>;
          },
        },
      ],
    };

    this.snapshots.push(snapshotStoreData);
    this.addSnapshotSuccess(snapshotData, subscribers);
    this.notifySubscribers(snapshotData, subscribers);
    if (this.delegate && this.delegate.length > 0) {
      for (const delegateConfig of this.delegate) {
        if (
          delegateConfig &&
          typeof delegateConfig.addSnapshot === "function"
        ) {
          await delegateConfig.addSnapshot(snapshotData, subscribers);
          if (typeof delegateConfig.notifySubscribers === "function") {
            await delegateConfig.notifySubscribers(snapshotData, subscribers);
          }
          return;
        }
      }
      throw new Error("No valid delegate found for addSnapshot");
    } else {
      throw new Error("Delegate is undefined or empty");
    }

    return Promise.resolve(snapshotData);
  }

  createInitSnapshot(
    id: string,
    initialData: T,
    snapshotData: SnapshotData<T, K>,
    category: symbol | string | Category | undefined
  ): Promise<SnapshotWithCriteria<T, K>> {
    return new Promise(async (resolve, reject) => {
      try {
        if (!snapshotData) {
          return reject(new Error("snapshotData is null or undefined"));
        }

        let data: Data;
        if ("data" in snapshotData && snapshotData.data) {
          data = snapshotData.data;
        } else if (snapshotData.data && "data" in snapshotData.data) {
          data = snapshotData.data.data;
        } else {
          return reject(new Error("snapshotData does not have a valid 'data' property"));
        }

        id =
          typeof data.id === "string"
            ? data.id
            : String(
                UniqueIDGenerator.generateID(
                  "SNAP",
                  "defaultID",
                  NotificationTypeEnum.GeneratedID
                )
              );

        const snapshot: SnapshotWithCriteria<T, K> = {
          id,
          data,
          timestamp: snapshotData.timestamp || new Date(),
          category: this.category,
          topic: this.topic,
          initializedState: {},
          criteria: {}, // Example placeholder for search criteria
          unsubscribe: function () {
            throw new Error("Function not implemented.");
          },
          fetchSnapshot: async () => {
            throw new Error("Function not implemented.");
          },
          handleSnapshot: async () => {
            throw new Error("Function not implemented.");
          },
          events: undefined,
          meta: {},
        };

        const storeId = snapshotApi.getSnapshotStoreId(String(this.snapshotId));
        const snapshotManager = await useSnapshotManager<T, K>(await storeId);

        this.snapshots.push(snapshot);

        if (this.delegate && this.delegate.length > 0) {
          for (const delegateConfig of this.delegate) {
            if (
              delegateConfig &&
              typeof delegateConfig.createSnapshotSuccess === "function"
            ) {
              await delegateConfig.createSnapshotSuccess(
                id,
                snapshotManager,
                snapshot,
                initialData
              );
              return resolve(snapshot); // Correctly resolve the promise with the snapshot
            }
          }
          return reject(new Error("No valid delegate found for createSnapshotFailure"));
        } else {
          return reject(new Error("Delegate is undefined or empty"));
        }
      } catch (error) {
        reject(error); // Handle unexpected errors
      }
    });
  }

  createSnapshotSuccess(
    snapshotId: string,
    snapshotManager: SnapshotManager<T, K>,
    snapshot: Snapshot<T, K>,
    payload: { error: Error }
  ): void {
    if (snapshot.id !== undefined) {
      notify(
        String(snapshot.id) // Ensure snapshot.id is treated as a string
        // `Snapshot ${snapshot.id} created successfully.`,
        // "",
        // new Date(),
        // NotificationTypeEnum.Success,
        // NotificationPosition.TopRight
      );
    } else {
      console.error("Snapshot id is undefined.");
      // Optionally handle the case where snapshot.id is undefined
    }
  }

  clearSnapshotSuccess: (context: {
    useSimulatedDataSource: boolean;
    simulatedDataSource: SnapshotStoreConfig<T, K>[];
  }) => void = (context) => {
    try {
      const configs = await getConfigPromise(); // Await the promise
      configs.forEach((config) => {
        if (config.clearSnapshotSuccess) {
          config.clearSnapshotSuccess(context);
        }
      });
    } catch (error) {
      console.error("Error clearing snapshot:", error);
    }
    this.notifySuccess("Snapshot cleared successfully.");
  };

  clearSnapshotFailure: (context: {
    useSimulatedDataSource: boolean;
    simulatedDataSource: SnapshotStoreConfig<T, K>[];
  }) => void = (context) => {
    this.getDelegate(context).clearSnapshotFailure();
    this.notifyFailure("Error clearing snapshot.");
  };

  createSnapshotFailure(
    snapshotId: string,
    snapshotManager: SnapshotManager<T, K>,
    snapshot: Snapshot<T, K>,
    payload: { error: Error }
  ): void {
    notify(
      "createSnapshotFailure",
      `Error creating snapshot: ${payload.error.message}`,
      "",
      new Date(),
      NotificationTypeEnum.Error,
      NotificationPosition.TopRight
    );
  }

  setSnapshotSuccess(
    snapshotData: SnapshotData<T, K>,
    subscribers: SubscriberCollection<T, K>
  ): void {
    this.handleDelegate(
      (delegate) => delegate.setSnapshotSuccess.bind(delegate),
      snapshotData,
      subscribers
    );
  }

  setSnapshotFailure(error: Error): void {
    this.handleDelegate(
      (delegate) => delegate.setSnapshotFailure.bind(delegate),
      error
    );
  }

  async createSnapshotFailure(
    snapshotId: string,
    snapshotManager: SnapshotManager<T, K>,
    snapshot: Snapshot<T, K>,
    payload: { error: Error }
  ): Promise<void> {
    notify(
      "createSnapshotFailure",
      `Error creating snapshot: ${payload.error.message}`,
      "",
      new Date(),
      NotificationTypeEnum.Error,
      NotificationPosition.TopRight
    );

    await this.handleDelegate(
      (delegate) => delegate.createSnapshotFailure.bind(delegate),
      snapshotId,
      snapshotManager,
      snapshot,
      payload
    );

    return Promise.reject(payload.error);
  }

  updateSnapshots(): void {
    this.handleDelegate((delegate) => delegate.updateSnapshots.bind(delegate));
  }

  updateSnapshotsSuccess(
    snapshotData: (
      subscribers: Subscriber<T, K>[],
      snapshot: Snapshots<T, K>
    ) => void
  ): void {
    this.handleDelegate(
      (delegate) => delegate.updateSnapshotsSuccess.bind(delegate),
      snapshotData
    );
  }

  updateSnapshotsFailure(error: Payload): void {
    this.handleDelegate(
      (delegate) => delegate.updateSnapshotsFailure.bind(delegate),
      error
    );
  }

  initSnapshot(
    snapshot: SnapshotStore<T, K> | Snapshot<T, K> | null,
    snapshotId: string,
    snapshotData: SnapshotData<T, K>,
    category: symbol | string | Category | undefined,
    categoryProperties: CategoryProperties | undefined,
    snapshotConfig: SnapshotStoreConfig<T, K>,
    callback: (snapshotStore: SnapshotStore<any, any>) => void
  ): void {
    this.handleDelegate(
      (delegate) => delegate.initSnapshot.bind(delegate),
      snapshot,
      snapshotId,
      snapshotData,
      category,
      snapshotConfig,
      callback
    );
  }

  async takeSnapshot(
    snapshot: Snapshot<T, K>,
    subscribers?: Subscriber<T, K>[]
  ): Promise<{ snapshot: Snapshot<T, K> }> {
    try {
      const result = await this.handleDelegate(
        (delegate) => delegate.takeSnapshot.bind(delegate),
        snapshot
      );

      if (result !== null && Array.isArray(result)) {
        const snapshotWrapper: Snapshot<T, K> = {
          ...result[0],
          data: result[0].data as BaseData, // Ensure data type matches BaseData
          timestamp: result[0].timestamp,
          type: result[0].type,
          id: result[0].id,
          key: result[0].key,
        };

        return {
          snapshot: snapshotWrapper,
        };
      }

      throw new Error("Failed to take snapshot");
    } catch (error) {
      handleApiError(error as AxiosError<unknown>, "Failed to take snapshot");
      throw error;
    }
  }

  takeSnapshotSuccess(snapshot: Snapshot<T, K>): void {
    this.handleDelegate(
      (delegate) => delegate.takeSnapshotSuccess.bind(delegate),
      snapshot
    );
  }

  takeSnapshotsSuccess(snapshots: T[]): void {
    this.handleDelegate(
      (delegate) => delegate.takeSnapshotsSuccess.bind(delegate),
      snapshots
    );
  }

  configureSnapshotStore(
    snapshotStore: SnapshotStore<T, K>,
    storeId: number,
    data: Map<string, Snapshot<T, K>>,
    events: Record<string, CalendarManagerStoreClass<T, K>[]>,
    dataItems: RealtimeDataItem[],
    newData: Snapshot<T, K>,
    payload: ConfigureSnapshotStorePayload<T, K>,
    store: SnapshotStore<any, K>,
    callback: (snapshotStore: SnapshotStore<T, K>) => void
  ): void {
    this.handleDelegate(
      (delegate) => delegate.configureSnapshotStore.bind(delegate),
      snapshotStore,
      storeId,
      data,
      events,
      dataItems,
      newData,
      payload,
      store,
      callback
    );
  }

  updateSnapshotStore(
    snapshotStore: SnapshotStore<T, K>, // Current snapshot store
    snapshotId: string,
    data: Map<string, Snapshot<T, K>>,
    events: Record<string, CalendarManagerStoreClass<T, K>[]>,
    dataItems: RealtimeDataItem[],
    newData: Snapshot<T, K>, // New snapshot data
    payload: ConfigureSnapshotStorePayload<T, K>,
    store: SnapshotStore<any, K>, // New snapshot store after update
    callback: (snapshotStore: SnapshotStore<T, K>) => void
  ): { type: string; payload: SnapshotStore<T, K> } {
    if (
      this.delegate &&
      Array.isArray(this.delegate) &&
      this.delegate.length > 0
    ) {
      const delegate = this.delegate.find(
        (
          d
        ): d is SnapshotStoreConfig<T, K> & {
          snapshotStore: Function;
        } => d != null && typeof d.snapshotStore === "function"
      );

      if (delegate && delegate.snapshotStore) {
        delegate.snapshotStore(
          snapshotStore, // Passing the current snapshot store
          snapshotId,
          data,
          events,
          dataItems,
          newData, // Passing the new snapshot data
          payload,
          store, // Passing the new snapshot store after update
          callback
        );
      } else {
        console.error("No valid delegate found for snapshotStore.");
      }
    } else {
      console.error("Delegate is undefined or empty.");
    }

    return {
      type: "UPDATE_SNAPSHOT_STORE",
      payload: snapshotStore, // Ensure snapshotStore is returned as part of the action payload
    };
  }




  // Getter for payload
  public getPayload(): Payload | undefined {
    return this.payload;
  }

  // Getter for callback
  public getCallback(): ((data: T) => void) | undefined {
    return this.callback;
  }

  // Getter for storeProps
  public getStoreProps(): Partial<SnapshotStoreProps<T, K>> {
    return this.storeProps;
  }

  // Getter for endpointCategory
  public getEndpointCategory(): string {
    return this.endpointCategory;
  }

  // You can also add setters if needed
  public setPayload(payload: Payload): void {
    this.payload = payload;
  }

  public setCallback(callback: (data: T) => void): void {
    this.callback = callback;
  }

  public setStoreProps(storeProps: Partial<SnapshotStoreProps<T, K>>): void {
    this.storeProps = storeProps;
  }

  public setEndpointCategory(category: string): void {
    this.endpointCategory = category;
  }

  // New flatMap method
  public flatMap<R extends Iterable<any>>(
    callback: (
      value: SnapshotStoreConfig<R, K>,
      index: number,
      array: SnapshotStoreConfig<R, K>[]
    ) => R
  ): R extends (infer I)[] ? I[] : R[] {
    const result = [] as unknown as R extends (infer I)[] ? I[] : R[];
    if (this.snapshotStoreConfig) {
      this.snapshotStoreConfig.forEach(
        (
          delegateItem: SnapshotStoreConfig<R, K>,
          i: number,
          arr: SnapshotStoreConfig<R, K>[]
        ) => {
          const mappedValues = callback(delegateItem, i, arr);
          result.push(
            ...(mappedValues as unknown as (R extends (infer I)[] ? I : U)[])
          );
        }
      );
    } else {
      console.error("snapshotStoreConfig is undefined");
    }
    return result;
  }

  setData(data: Map<string, Snapshot<T, K>>): void {
    this.handleDelegate((delegate) => delegate.setData, data);
  }

  getState(): any {
    const result = this.handleDelegate((delegate) => delegate.getState);
    return result !== undefined ? result : undefined;
  }

  setState(state: any): void {
    this.handleDelegate((delegate) => delegate.setState, state);
  }

  validateSnapshot(snapshotId: string, snapshot: Snapshot<T, K>): boolean {
    const result = this.handleDelegate(
      (delegate) => delegate.validateSnapshot,
      snapshotId,
      snapshot
    );
    return result !== undefined ? result : false;
  }

  handleSnapshot(
    id: string,
    snapshotId: string,
    snapshot: T | null,
    snapshotData: T,
    category: symbol | string | Category | undefined,
    categoryProperties: CategoryProperties | undefined,
    callback: (snapshot: T) => void,
    snapshots: SnapshotsArray<T, K>,
    type: string,
    event: Event,
    snapshotContainer?: T,
    snapshotStoreConfig?: SnapshotStoreConfig<T, K, StructuredMetadata<T, K>, never>  | null
  ): Promise<Snapshot<T, K> | null> {
    const result = this.handleDelegate(
      (delegate) => delegate.handleSnapshot,
      id,
      snapshotId,
      snapshot,
      snapshotData,
      category,
      callback,
      snapshots,
      type,
      event,
      snapshotContainer,
      snapshotStoreConfig
    );

    return result !== undefined ? result : Promise.resolve(null);
  }

  handleActions(action: (selectedText: string) => void): void {
    const firstDelegate = this.delegate?.[0];
    if (firstDelegate && typeof firstDelegate.handleActions === "function") {
      firstDelegate.handleActions(action);
    } else {
      console.error("No valid delegate found to handle actions.");
    }
  }

  setSnapshot(snapshot: Snapshot<T, K>): void {
    const firstDelegate = this.delegate?.[0];
    if (firstDelegate && typeof firstDelegate.setSnapshot === "function") {
      firstDelegate.setSnapshot(snapshot);
    } else {
      console.error("No valid delegate found to set snapshot.");
    }
  }

  transformSnapshotConfig<U extends BaseData>(
    config: SnapshotConfig<WrappedU, WrappedU>
  ): SnapshotConfig<WrappedU, WrappedU> {
    const { initialState, configOption, ...rest } = config;

    // Safely transform configOption and its initialState
    const transformedConfigOption =
      typeof configOption === "object" &&
      configOption !== null &&
      "initialState" in configOption
        ? {
            ...configOption,
            initialState:
              configOption.initialState instanceof Map
                ? new Map<string, Snapshot<WrappedU, WrappedU>>(
                    // Map the entries to transform Snapshot<Data, T> to Snapshot<WrappedU, WrappedU>
                    Array.from(configOption.initialState.entries()).map(
                      ([key, snapshot]): readonly [string, Snapshot<WrappedU, WrappedU>] => [
                        key,
                        this.transformSnapshot<U, T>(snapshot), // Ensure proper snapshot transformation
                      ]
                    )
                  )
                : null,
          }
        : undefined;

    // Safely handle initialState based on its type
    let transformedInitialState: InitializedState<WrappedU, WrappedU> | null;
    if (
      isSnapshotStore(initialState) ||
      isSnapshot(initialState) ||
      initialState instanceof Map ||
      initialState === null
    ) {
      transformedInitialState = initialState;
    } else {
      transformedInitialState = null; // Handle any other case as necessary
    }

    return {
      ...rest,
      initialState: transformedInitialState,
      configOption: transformedConfigOption
        ? transformedConfigOption
        : undefined,
    };
  }

  setSnapshotData(
    id: string,
    snapshotId: string,
    snapshot: T | null,
    snapshotData: T,
    category: symbol | string | Category | undefined,
    categoryProperties: CategoryProperties | undefined,
    callback: (snapshot: T) => void,
    snapshots: SnapshotsArray<T, K>,
    type: string,
    event: Event,
    snapshotStore: SnapshotStore<T, K>,
    data: Map<string, T>,
    subscribers: Subscriber<T, K>[],
    snapshotData: Partial<SnapshotStoreConfig<T, K>>,
    id?: string
  ): Map<string, Snapshot<T, K>> {
    // Update the config with the provided snapshot data
    if (this.config) {
      this.config = this.config.map((configItem) => ({
        ...configItem,
        ...snapshotData,
        initialState:
          snapshotData.initialState !== undefined
            ? snapshotData.initialState
            : configItem.initialState !== undefined
            ? configItem.initialState
            : null, // Handle undefined explicitly
      }));
    } else {
      this.config = [
        {
          ...snapshotData,
          initialState:
            snapshotData.initialState !== null
              ? snapshotData.initialState
              : null,
        },
      ];
    }

    // Retrieve the current snapshot using the delegate
    const currentSnapshot = this.handleDelegate((delegate) => delegate);

    if (currentSnapshot) {
      // Create a new SnapshotStoreConfig object with updated state and snapshot data
      const updatedSnapshot: SnapshotStoreConfig<T, K> = {
        ...currentSnapshot,
        ...snapshotData,
        initialState:
          snapshotData.initialState !== undefined
            ? snapshotData.initialState
            : currentSnapshot.initialState !== undefined
            ? currentSnapshot.initialState
            : null, // Handle undefined explicitly
        state: currentSnapshot.state
          ? this.filterInvalidSnapshots(currentSnapshot.state)
          : null,
      };

      // Transform the updated snapshot to ensure it matches the expected type
      const transformedSnapshot = this.transformSnapshotConfig(updatedSnapshot);

      // Safely update the first element of the delegate array if it exists
      if (this.delegate && this.delegate.length > 0) {
        this.delegate[0] = transformedSnapshot;
      } else {
        // If the delegate array is empty, initialize it with the transformed snapshot
        this.delegate = [transformedSnapshot];
      }

      // Notify subscribers of the update, passing the relevant snapshot data
      this.notifySubscribers(subscribers, snapshotData);
    }
    return "";
  }

  private filterInvalidSnapshots(
    snapshotId: string,
    state: Map<string, Snapshot<T, K>>
  ): Map<string, Snapshot<T, K>> {
    return new Map(
      [...state.entries()].filter(([_, snapshot]) =>
        this.validateSnapshot(snapshhotId, snapshot)
      )
    );
  }

  setSnapshots(snapshots: Snapshots<T, K>): void {
    this.handleDelegate((delegate) => delegate.setSnapshots, snapshots);
  }

  clearSnapshot(): void {
    this.handleDelegate((delegate) => delegate.clearSnapshot);
  }

  mergeSnapshots(snapshots: Snapshots<T, K>, category: string): void {
    this.handleDelegate(
      (delegate) => delegate.mergeSnapshots,
      snapshots,
      category
    );
  }

  reduceSnapshots<U, Meta>(
    callback: (acc: U, snapshot: Snapshot<T, K>) => U,
    initialValue: U
  ): U | undefined {
    return this.handleDelegate(
      (delegate) => delegate.reduceSnapshots,
      callback,
      initialValue
    );
  }

  sortSnapshots(): void {
    this.handleDelegate((delegate) => delegate.sortSnapshots);
  }

  filterSnapshots(): void {
    this.handleDelegate((delegate) => delegate.filterSnapshots);
  }

  async mapSnapshotsAO(
    storeIds: number[],
    snapshotId: string,
    category: symbol | string | Category | undefined,
    categoryProperties: CategoryProperties | undefined,
    snapshot: Snapshot<T, K>,
    timestamp: string | number | Date | undefined,
    type: string,
    event: Event,
    id: number,
    snapshotStore: SnapshotStore<T, K>,
    data: T
  ): Promise<SnapshotContainer<T, K>> {
    try {
      const snapshotMap = new Map<string, Snapshot<T, K>>();
      snapshotMap.set(snapshotId, snapshot);

      const snapshotsArray: SnapshotsArray<T, K> = Array.from(
        snapshotMap.values()
      );
      const snapshotsObject: SnapshotsObject<T, K> = Object.fromEntries(
        snapshotMap.entries()
      );

      return {
        id: snapshotId,
        category: category as string,
        timestamp:
          timestamp instanceof Date
            ? timestamp.toISOString()
            : timestamp?.toString() || "",
        snapshot: snapshotMap.get(snapshotId) as Snapshot<T, K>,
        snapshotStore,
        snapshotData: snapshotStore, // Assuming this is similar to snapshotStore; adjust if needed
        data,
        snapshotsArray,
        snapshotsObject,
      };
    } catch (error) {
      console.error("Error mapping snapshots:", error);
      throw new Error("Failed to map snapshots");
    }
  }

  mapSnapshots: <U, Meta>(
    storeIds: number[],
    snapshotId: string,
    category: symbol | string | Category | undefined,
    categoryProperties: CategoryProperties | undefined,
    snapshot: Snapshot<T, K>,
    timestamp: string | number | Date | undefined,
    type: string,
    event: Event,
    id: number,
    snapshotStore: SnapshotStore<T, K>,
    data: T,
    callback: (
      storeIds: number[],
      snapshotId: string,
      category: symbol | string | Category | undefined,
      categoryProperties: CategoryProperties | undefined,
      snapshot: Snapshot<T, K>,
      timestamp: string | number | Date | undefined,
      type: string,
      event: Event,
      id: number,
      snapshotStore: SnapshotStore<T, K>,
      data: K,
      index: number
    ) => SnapshotsObject<T, K>
  ) => Promise<SnapshotsArray<T, K>> = (
    storeIds,
    snapshotId,
    category,
    categoryProperties,
    snapshot,
    timestamp,
    type,
    event,
    id,
    snapshotStore,
    data,
    callback
  ) => {
    if (!this.delegate || this.delegate.length === 0) {
      return Promise.resolve([]);
    }

    // Delegate the call to the first delegate in the list
    return this.delegate[0].mapSnapshots(
      storeIds,
      snapshotId,
      category,
      categoryProperties,
      snapshot,
      timestamp,
      type,
      event,
      id,
      snapshotStore,
      data,
      callback
    );
  };

  findSnapshot(
    predicate: (snapshot: Snapshot<T, K>) => boolean
  ): Snapshot<T, K> | undefined {
    // Ensure that this.delegate is defined before iterating
    if (!this.delegate) {
      return undefined;
    }

    // Iterate over each delegate to find a matching snapshot
    for (const delegate of this.delegate) {
      const foundSnapshot = delegate.findSnapshot(predicate);
      if (foundSnapshot) {
        return foundSnapshot;
      }
    }

    // Return undefined if no matching snapshot is found
    return undefined;
  }

  getSubscribers(
    subscribers?: Subscriber<T, K>[],
    snapshots: Snapshots<T, K>
  ): Promise<{
    subscribers: Subscriber<T, K>[];
    snapshots: Snapshots<T, K>;
  }> {
    const firstDelegate = this.getFirstDelegate();
    return firstDelegate.getSubscribers(subscribers, snapshots);
  }

  notify(
    id: string,
    message: string,
    content: Content<T, K>,
    data: any,
    date: Date,
    type: NotificationType,
    notificationPosition?: NotificationPosition | undefined
  ): void {
    const firstDelegate = this.getFirstDelegate();
    firstDelegate.notify(id, message, content, date, type);
  }

  notifySubscribers(
    message: string,
    subscribers: Subscriber<T, K>[],
    data: Partial<SnapshotStoreConfig<T, K>>
  ): Subscriber<T, K>[] {
    const firstDelegate = this.getFirstDelegate();
    return firstDelegate.notifySubscribers(subscribers, data);
  }

  subscribe(
    snapshotId: string,
    unsubscribe: UnsubscribeDetails,
    subscriber: Subscriber<T, K> | null,
    data: T,
    event: Event,
    callback: Callback<Snapshot<T, K>>
  ): [] | SnapshotsArray<T, K> {
    const firstDelegate = this.getFirstDelegate();

    // Call the subscribe method and handle its result
    firstDelegate.subscribe(callback); // If it returns void, we don't store the result

    // Retrieve the snapshot data using retrieveSnapshotData
    const snapshotDataPromise = retrieveSnapshotData<T, K>();

    snapshotDataPromise
      .then((snapshotData) => {
        if (snapshotData) {
          // Process the retrieved snapshot data as needed
          // You can handle the snapshot data here, e.g., store it or pass it to the callback
          console.log("Retrieved snapshot data:", snapshotData);
        } else {
          console.warn("No snapshot data retrieved.");
        }
      })
      .catch((error) => {
        console.error("Error retrieving snapshot data:", error);
      });

    // You can return an empty array or handle the snapshots retrieval if needed
    return []; // Return an empty array if no snapshots are provided
  }

  unsubscribe(
    unsubscribeDetails: {
      userId: string;
      snapshotId: string;
      unsubscribeType: string;
      unsubscribeDate: Date;
      unsubscribeReason: string;
      unsubscribeData: any;
    },
    callback: Callback<Snapshot<T, K>> | null
  ): void {
    const firstDelegate = this.getFirstDelegate();
    firstDelegate.unsubscribe(unsubscribeDetails, callback);
  }

  async fetchSnapshot(
    callback: (
      snapshotId: string,
      payload: FetchSnapshotPayload<K>,
      snapshotStore: SnapshotStore<T, K>,
      payloadData: T | Data,
      category: symbol | string | Category | undefined,
      categoryProperties: CategoryProperties | undefined,
      timestamp: Date,
      data: T,
      delegate: SnapshotWithCriteria<T, K>[]
    ) => void
  ): Promise<{
    id: any;
    category: symbol | string | Category | undefined
    categoryProperties: CategoryProperties;
    timestamp: any;
    snapshot: Snapshot<T, K>;
    data: T;
    getItem?: (snapshot: Snapshot<T, K>) => Snapshot<T, K> | undefined;
  }> {
    try {
      const firstDelegate = this.getFirstDelegate(); // Safely access delegate
      const fetchedSnapshot = await firstDelegate.fetchSnapshot(
        snapshotId,
        category,
        timestamp,
        callback,
        data
      );

      // Return the required object structure
      return {
        id: fetchedSnapshot.id,
        category: fetchedSnapshot.category,
        categoryProperties: fetchedSnapshot.categoryProperties,
        timestamp: fetchedSnapshot.timestamp,
        snapshot: fetchedSnapshot.snapshot,
        data: fetchedSnapshot.data as T,
        getItem: fetchedSnapshot.getItem,
      };
    } catch (error) {
      console.error("Error fetching snapshot:", error);
      throw error; // Handle or propagate the error as needed
    }
  }

  fetchSnapshotSuccess(
    snapshotId: string,
    snapshotStore: SnapshotStore<T, K>,
    payload: FetchSnapshotPayload<K> | undefined,

    snapshot: Snapshot<T, K>,
    data: T,
    snapshotData: (
      snapshotManager: SnapshotManager<SnapshotUnion<BaseData, Meta>, T>,
      subscribers: Subscriber<T, K>[],
      snapshot: Snapshot<SnapshotUnion<BaseData, Meta>, T>
    ) => void
  ): void {
    const delegate = this.ensureDelegate();
    delegate.fetchSnapshotSuccess(
      snapshotId,
      snapshotStore,
      payload,
      snapshot,
      data,
      snapshotData
    );
  }

  fetchSnapshotFailure(
    snapshotId: string,
    snapshotManager: SnapshotManager<T, K>,
    snapshot: Snapshot<T, K>,
    date: Date | undefined,
    payload: { error: Error }
  ): void {
    const delegate = this.ensureDelegate();
    delegate.fetchSnapshotFailure(payload);
  }

  getSnapshots(category: string, data: Snapshots<T, K>): void {
    const delegate = this.ensureDelegate();
    const convertedData: SnapshotsArray<T, K> = convertToSnapshotArray(data);
    delegate.getSnapshots(category, convertedData);
  }

  getAllSnapshots(
    storeId: number,
    snapshotId: string,
    snapshotData: T,
    timestamp: string,
    type: string,
    event: Event,
    id: number,
    snapshotStore: SnapshotStore<T, K>,
    category: symbol | string | Category | undefined,
    categoryProperties: CategoryProperties | undefined,
    dataStoreMethods: DataStore<T, K>,
    data: T,
    dataCallback?: (
      subscribers: Subscriber<T, K>[],
      snapshots: Snapshots<T, K>
    ) => Promise<Snapshots<T, K>>
  ): Promise<Snapshot<T, K>[]> {
    const delegate = this.ensureDelegate();

    const transformSnapshots = (snapshots: Snapshots<T, K>): Snapshot<T, K>[] => {
      // Assuming Snapshots<T, K> has a structure similar to an array or can be mapped
      return snapshots as unknown as Snapshot<T, K>[];
    };

    // Use dataCallback if it is provided
    if (dataCallback) {
      return delegate.getAllSnapshots(dataCallback).then(transformSnapshots);
    } else {
      // If no callback, default to calling the delegate's method with data
      return delegate
        .getAllSnapshots(() => Promise.resolve([]))
        .then(transformSnapshots);
    }
  }

  getSnapshotStoreData(
    snapshotStore: SnapshotStore<T, K>,
    snapshot: Snapshot<T, K>,
    snapshotId: string,
    snapshotData: SnapshotData<T, K>
  ): Promise<SnapshotStore<T, K>> {
    const delegate = this.ensureDelegate();
    return delegate.getSnapshotStoreData(
      snapshotStore,
      snapshot,
      snapshotId,
      snapshotData
    );
  }

  generateId(): string {
    const delegateWithGenerateId = this.delegate?.find((d) => d.generateId);
    const generatedId = delegateWithGenerateId?.generateId();
    return typeof generatedId === "string" ? generatedId : "";
  }

  async batchFetchSnapshots(
    criteria: CriteriaType,
    snapshotData: (
      snapshotIds: string[],
      subscribers: SubscriberCollection<T, K>,
      snapshots: Snapshots<T, K>
    ) => Promise<{
      subscribers: SubscriberCollection<T, K>;
      snapshots: Snapshots<T, K>; // Include snapshots here for consistency
    }>
  ): Promise<Snapshot<T, K>[]> {
    const delegate = this.ensureDelegate();
    
    // Call the delegate method and handle the result
    const result = await delegate.batchFetchSnapshots(criteria, snapshotData);
    
    // Assuming result contains snapshots, extract them
    const { snapshots } = result;

    // Convert Snapshots<T, K> to Snapshot<T, K>[] if needed
    return Array.from(snapshots.values()); // or use a suitable method to convert if necessary
  }

  async batchTakeSnapshotsRequest(snapshotData: SnapshotData<T, K>): Promise<void> {
    const delegate = this.ensureDelegate();
    // Call the delegate method
    await delegate.batchTakeSnapshotsRequest(snapshotData);
  }

  batchUpdateSnapshotsRequest(
    snapshotData: (
      subscribers: SubscriberCollection<T, K>
    ) => Promise<{
      subscribers: SubscriberCollection<T, K>;
      snapshots: Snapshots<T, K>;
    }>
  ): Promise<void> {
    const delegate = this.ensureDelegate();
    snapshotData(this.subscribers).then(({ snapshots }) => {
      delegate.batchUpdateSnapshotsRequest(async (subscribers) => {
        const { snapshots } = await snapshotData(subscribers);
        return { subscribers, snapshots };
      });
    });
    return Promise.resolve();
  }

  batchFetchSnapshotsSuccess(
    subscribers: Subscriber<T, K>[],
    snapshots: Snapshots<T, K>
  ): void {
    const delegate = this.ensureDelegate();
    delegate.batchFetchSnapshotsSuccess(subscribers, snapshots);
  }

  batchFetchSnapshotsFailure(
    date: Date,
    snapshotManager: SnapshotManager<T, K>, 
    snapshot: Snapshot<T, K>, 
    payload: { error: Error; }
  ): void {
    const delegate = this.ensureDelegate();
    delegate.batchFetchSnapshotsFailure(payload);
  }

  batchUpdateSnapshotsSuccess(
    subscribers: Subscriber<T, K>[],
    snapshots: Snapshots<T, K>
  ): void {
    const delegate = this.ensureDelegate();
    if (delegate.batchUpdateSnapshotsSuccess) {
      delegate.batchUpdateSnapshotsSuccess(subscribers, snapshots);
    } else {
      // Handle the case where batchUpdateSnapshotsSuccess is undefined
      console.error(
        "Delegate's batchUpdateSnapshotsSuccess is undefined. Cannot perform batch update."
      );
    }
  }

  batchUpdateSnapshotsFailure(
    date: Date, 
    snapshotId: string, 
    snapshotManager: SnapshotManager<T, K>, 
    snapshot: Snapshot<T, K>, payload: { error: Error; }

  ): void {
    const delegate = this.ensureDelegate();
    delegate.batchUpdateSnapshotsFailure(payload);
  }

  batchTakeSnapshot(
    snapshotId: string, 
    snapshotStore: SnapshotStore<T, K>,
    snapshots: Snapshots<T, K>
  ): Promise<{ snapshots: Snapshots<T, K> }> {
    const delegate = this.ensureDelegate();
    return new Promise((resolve) => {
      const result = delegate.batchTakeSnapshot(snapshotId, snapshotStore, snapshots);
      resolve(result);
    });
  }

  handleSnapshotSuccess(
    message: string,
    snapshot: Snapshot<T, K> | null,
    snapshotId: string
  ): void {
    // Ensure the snapshot is not null before proceeding
    if (snapshot) {
      // Perform actions required for handling the successful snapshot
      // For example, updating internal state, notifying subscribers, etc.
      SnapshotActions<T, K>().handleTaskSnapshotSuccess({ message, snapshot, snapshotId });
      console.log(`Handling success for snapshot ID: ${snapshotId}`);
      // Implement additional logic here based on your application's needs
    }
    // No return statement needed since the method should return void
  }

  // Implementing [Symbol.iterator] method
  [Symbol.iterator](): IterableIterator<Snapshot<T, K>> {
    const snapshotIterator = this.snapshots.values();

    // Create a custom iterator that maps each item to Snapshot<T, K>
    const iterator: IterableIterator<Snapshot<T, K>> = {
      [Symbol.iterator]: function () {
        return this;
      },
      next: function () {
        const next = snapshotIterator.next();
        if (next.done) {
          return { done: true, value: undefined as any };
        }

        // Use the type guard to ensure the value is a valid Snapshot<T, K>
        let snapshot: Snapshot<T, K>;
        if (isSnapshot<T, K>(next.value)) {
          snapshot = next.value;
        } else if (next.value instanceof SnapshotStore) {
          snapshot = convertSnapshotStoreToSnapshot<T, K>(next.value) 
        } else {
          // Handle the case where the value is not a valid Snapshot<T, K>
          console.warn(`Value is not a valid Snapshot<T, K>:`, next.value);
          return { done: false, value: undefined as any }; // or throw an error based on your logic
        }

        // Convert Snapshot<BaseData> to Snapshot<T, K> using snapshotType function
        const value: Snapshot<T, K> = snapshotType(snapshot);
        return { done: false, value };
      },
    };

    return iterator;
  }

  isExpired(): boolean | undefined {
    return !!this.expirationDate && new Date() > this.expirationDate;
  }


  compress(): void {
    // Check if compressing is necessary
    if (!this.configs || this.configs.length === 0) {
      console.warn("No configuration available to compress.");
      return;
    } 
  
    // Create a type that omits unnecessary fields from SnapshotStoreConfig
    type CompressedConfig = Omit<SnapshotStoreConfig<T, K>, 'debugInfo' | 'tempData'> & {
      find(arg0: (config: SnapshotStoreConfig<SnapshotWithCriteria<BaseData, any>, Data>) => boolean): unknown;
      optionalData?: any; // Include optional data if necessary
      debugInfo?: DebugInfo,
      tempData: TempData<T, K>,
      // [key: string]: any
    };
 
    this.configs = this.configs.map((config: SnapshotStoreConfig<T, K>) => {
      const { debugInfo, tempData, ...compressedConfig } = config;
    
      // Example 2: Transform the 'createdAt' field from Date to timestamp
      if (compressedConfig.createdAt !== undefined && compressedConfig.createdAt instanceof Date) {
        compressedConfig.createdAt = compressedConfig.createdAt.getTime().toString();
      }
    
      // Example 3: Remove empty or null fields for efficiency
      Object.keys(compressedConfig).forEach((key) => {
        const value = compressedConfig[key as keyof typeof compressedConfig]; // Type assertion here
        if (
          value === null ||
          value === undefined ||
          (Array.isArray(value) && value.length === 0) ||
          (typeof value === 'object' && Object.keys(value).length === 0)
        ) {
          delete compressedConfig[key as keyof typeof compressedConfig];
        }
      });
    
      // Example 4: Consolidate common data into a shared property
      if (compressedConfig.metadata && typeof compressedConfig.metadata === 'object') {
        compressedConfig.metadata = this.consolidateMetadata(compressedConfig.metadata);
      }
    
      return compressedConfig;
    });
    
  
    console.log("Compression completed.");
  }
  
  
  
  isEncrypted?: boolean;
  ownerId?: string;
  previousVersionId?: string;
  nextVersionId?: string;
  auditTrail?: AuditRecord[];
  retentionPolicy?: RetentionPolicy;
  dependencies?: string[];
  auditRecords: AuditRecord[] = [];
  getOwner?(): string {
    return this.ownerId || "";
  }

  encrypt(): void {
    if (!this.config) {
      console.warn("No configuration available to encrypt.");
      return;
    }

    // Example encryption logic: Encrypt a single configuration
    this.config = {
      ...this.config,
      encryptedData: JSON.stringify(this.config), // Placeholder encryption
    } as SnapshotStoreConfig<T, K>;

    this.isEncrypted = true;
    console.log("Encryption completed.");
  }

  decrypt(): void {
    if (!this.config || !this.isEncrypted) {
      console.warn("No encrypted data available to decrypt.");
      return;
    }

    // Example decryption logic: Decrypt a single configuration
    try {
      const decryptedData = JSON.parse((this.config as any).encryptedData || "{}");
      this.config = {
        ...this.config,
        ...decryptedData,
      } as SnapshotStoreConfig<T, K>;
    } catch (error) {
      console.error("Decryption failed:", error);
    }

    this.isEncrypted = false;
    console.log("Decryption completed.");
  }

  async addDebugInfo(configId: string, message: string, operation?: string): Promise<void> {
    const { addDebugInfo } = await import("../utils/debugInfoUtils");
    addDebugInfo(this.configs, configId, message, operation);
  }

  async storeTempData(configId: string, tempResults: T[]): Promise<void> {
    const { storeTempData } = await import("../utils/tempDataUtils");
    storeTempData(this.configs, configId, tempResults);
  }

  async getTempData(configId: string): Promise<T[] | undefined> {
    const { getTempData } = await import("../utils/tempDataUtils");
    return getTempData(this.configs, configId);
  }
}

 // Example usage of the Snapshot interface
 const takeSnapshot = async () => {
   const snapshotData = await fetchInitialSnapshotData();
   const { createSnapshot } = useSnapshotStore(addToSnapshotList);
   const snapshot = await takeSnapshot();
   console.log(snapshot);
 };

 const category = (process.argv[3] as keyof CategoryProperties) ?? "isHiddenInList";
//  const dataStoreMethods = {};




export default SnapshotStore;

export {
  // createStoreConfig, 
  handleSnapshotEvent,
  //  initializeData, 
  initialState
};

export type { SnapshotStoreReference }