// SnapshotStoreConfig.ts
import { getAllKeys, getDataVersions, getFrontendVersion, removeData } from "@/app/api/ApiData";
import { fetchCategoryByName } from "@/app/api/CategoryApi";
import { AllStatus } from '@/app/components/state/stores/DetailsListStore';
import { endpoints } from "@/app/api/endpointConfigurations";
import * as snapshotApi from '@/app/api/SnapshotApi';
import { fetchSnapshotStoreData } from "@/app/api/SnapshotApi";
import { Payload, UpdateSnapshotPayload } from "@/app/components/database/Payload";
import { Content } from '@/app/components/models/content/AddContent';
import { Meta } from "@/app/components/models/data/dataStoreMethods";
import { InitializedState } from '@/app/components/projects/DataAnalysisPhase/DataProcessing/DataStore';
import { SnapshotErrorHandling } from '@/app/components/snapshots/SnapshotErrorHandling';
import { RetentionPolicy } from '@/app/components/snapshots/SnapshotConfig';
import { StructuredMetadata } from "@/app/configs/StructuredMetadata";
import { CriteriaType } from "@/app/pages/searchs/CriteriaType";
import { IHydrateResult } from "mobx-persist";
import { fetchData } from "pdfjs-dist";
import { CategoryProperties } from "../../pages/personas/ScenarioBuilder";
import { SnapshotWithData } from "../calendar/CalendarApp";
import { CreateSnapshotsPayload, CreateSnapshotStoresPayload } from "../database/Payload";
import { ModifiedDate } from "../documents/DocType";
import { FileCategory } from "../documents/FileType";
import { UnsubscribeDetails } from "../event/DynamicEventHandlerExample";
import { SnapshotManager, useSnapshotManager } from "../hooks/useSnapshotManager";
import { determineCategory } from "../libraries/categories/determineCategory";
import determineFileCategory, { fetchFileSnapshotData } from "../libraries/categories/determineFileCategory";
import { Category } from "../libraries/categories/generateCategoryProperties";
import { BaseData, Data, DataDetails } from "../models/data/Data";
import { NotificationPosition, StatusType } from "../models/data/StatusType";
import { RealtimeDataItem } from "../models/realtime/RealtimeData";
import { DataStoreMethods, DataStoreWithSnapshotMethods } from "../projects/DataAnalysisPhase/DataProcessing/ DataStoreMethods";
import { DataStore } from "../projects/DataAnalysisPhase/DataProcessing/DataStore";
import { updateDataDescription, updateDataStatus, updateDataTitle } from "../state/redux/slices/DataSlice";
import { batchFetchSnapshotsFailure, batchFetchSnapshotsSuccess, batchUpdateSnapshotsFailure, batchUpdateSnapshotsRequest, batchUpdateSnapshotsSuccess } from "../state/redux/slices/SnapshotSlice";
import { CalendarEvent } from '@/app/components/calendar/CalendarEvent';
import CalendarManagerStoreClass from "@/app/components/state/stores/CalendarManagerStore";
import { NotificationType, NotificationTypeEnum } from "../support/NotificationContext";
import { PortfolioUpdatesLastUpdated } from "../trading/PortfolioUpdatesLastUpdated";
import { getCommunityEngagement, getMarketUpdates, getTradeExecutions } from "../trading/TradingUtils";
import { AuditRecord, Subscriber } from "../users/Subscriber";
import { updateData } from "../users/UserSlice";
import { portfolioUpdates, tradeExections, triggerIncentives } from "../utils/applicationUtils";
import { generateSnapshotId } from "../utils/snapshotUtils";
import { VersionHistory } from "../versions/VersionData";
import { defaultSubscribeToSnapshot } from "./defaultSnapshotSubscribeFunctions";
import { FetchSnapshotPayload } from "./FetchSnapshotPayload";
import { Snapshot, Snapshots, SnapshotsArray, SnapshotsObject, SnapshotUnion } from "./LocalStorageSnapshotStore";
import { returnsSnapshotStore } from "./responsetUtils";
import { Callback, MultipleEventsCallbacks } from "./subscribeToSnapshotsImplementation";
  
import { UnifiedMetaDataOptions } from "@/app/configs/database/MetaDataOptions";
import { SchemaField } from "../database/SchemaField";
import { K, T } from "../models/data/dataStoreMethods";
import { SubscriberCollection } from "../users/SubscriberCollection";
import Version from "../versions/Version";
import { SnapshotOperation } from "./SnapshotActions";
import { SnapshotActionType } from "./SnapshotActionType";
import { ConfigureSnapshotStorePayload, SnapshotConfig } from "./SnapshotConfig";
import { SnapshotConfiguration } from "./SnapshotConfiguration";
import { SnapshotContainer, SnapshotDataType } from "./SnapshotContainer";
import { CustomSnapshotData, SnapshotData } from "./SnapshotData";
import { SnapshotEvents } from "./SnapshotEvents";
import { addSnapshotSuccess, batchTakeSnapshot, batchTakeSnapshotsRequest, handleSnapshotSuccess } from "./snapshotHandlers";
import SnapshotList, { SnapshotItem } from "./SnapshotList";
import { default as SnapshotStore, default as SnapshotStoreReference } from "./SnapshotStore";
import { snapshotStoreConfigInstance } from "./snapshotStoreConfigInstance";
import { InitializedData, InitializedDataStore, SnapshotStoreOptions } from "./SnapshotStoreOptions";
import SnapshotStoreSubset from "./SnapshotStoreSubset";
import { SnapshotSubscriberManagement } from "./SnapshotSubscriberManagement";
import { SnapshotWithCriteria, TagsRecord } from "./SnapshotWithCriteria";
import { subscribeToSnapshotImpl } from "./subscribeToSnapshotsImplementation";
import { SnapshotStoreProps } from "./useSnapshotStore";
import { UserConfig as ViteUserConfig } from 'vite';
import { PrivacySettings } from "../settings/PrivacySettings";


interface UserConfig<
  T extends BaseData<any> = BaseData<any, any>,
  K extends T = T,
  Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>> extends ViteUserConfig {
  snapshotConfig?: SnapshotConfig<T, K>[]; // Use generic types
  snapshotStoreConfig?: SnapshotStoreConfig<T, K, StructuredMetadata<T, K>, never>; // Use generic types
}

interface DataWithParentAndChildIds<
  T extends BaseData<any> = BaseData<any, any>,
  K extends T = T, 
  Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>, 
> extends BaseData<T, K> {
  parentId?: string;
  childIds?: K[];
}

export interface SnapshotStoreConfig<
  T extends  BaseData<any>, 
  K extends T = T, 
  Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>,
  ExcludedFields extends keyof T = never
> extends SnapshotStoreOptions<T, K, StructuredMetadata<T, K>, never>,
  SnapshotConfiguration<T, K, StructuredMetadata<T, K>>, 
  SnapshotErrorHandling<T, K, StructuredMetadata<T, K>>,
  SnapshotSubscriberManagement<T, K, StructuredMetadata<T, K>>{
  snapshotManager?: SnapshotManager<T, K>,
  payload?: Payload,
  snapshotStoreData?: Snapshots<T, K>,
  getSnapshotManager: () => SnapshotManager<T, K, any, any>;
  logging?: boolean;
  autoSync?: boolean;
  find(arg0: (snapshotId: string, config: SnapshotStoreConfig<T, K>) => boolean): unknown;
  callback: MultipleEventsCallbacks<T>
  id: string | number | null 
  storeId: number
  name?: string;
  isCore: boolean;
  configId: string
  options?: SnapshotStoreOptions<T, K>
  operation: SnapshotOperation<T, K>
  title?: string;
  description?: string | null;
  data: InitializedData<T>| null | undefined
  createdAt?:  string | Date | undefined
  updatedAt?: string | Date | undefined
  
  meta?:  BaseData<any> | undefined;
  autoSave: boolean,
  syncInterval: number, // Sync every 5 minutes
  snapshotLimit: number,   // Keep a maximum of 100 snapshots
  additionalSetting: string,
     
  timestamp?: string | number | Date | undefined;
  createdBy: string | undefined;
  snapshotId: string | number | undefined;
  currentCategory?: Category;
  snapshotStore: (
    snapshotStore: SnapshotStore<T, K>,
    snapshotId: string, 
    data: Map<string, Snapshot<T, K>>,
    events: Record<string, CalendarManagerStoreClass<T, K>[]>,
    dataItems: RealtimeDataItem[], 
    newData: Snapshot<T, K>,
    payload: ConfigureSnapshotStorePayload<T, K>, 
    store: SnapshotStore<any, K>,
    callback: (snapshotStore: SnapshotStore<T, K>) => void
  ) => void | null;
  taskIdToAssign?: string;
  clearSnapshots?: any;
  key?: string;
  topic?: string;
  dataStoreMethods: Partial<DataStoreWithSnapshotMethods<T, K>> | undefined; // Match the type to the base interface
  category: Category
  criteria: CriteriaType
  length?: number
  content: string | Content<T, K> | undefined;
  privacy?: PrivacySettings;

  snapshotConfig?: UserConfig<T, K>["snapshotConfig"];
  snapshotCategory: Category
  snapshotContent: string | Content<T, K> | undefined;
  store?: SnapshotStoreConfig<T, K> | null;
  snapshots: SnapshotsArray<T, K>
  delegate: SnapshotWithCriteria<T, K>[] | null;
  getParentId(id: string, snapshot: Snapshot<T, K>): string | null;
  getChildIds(childSnapshot: Snapshot<T, K>): string[];

  set?: (data: T | Map<string, Snapshot<T, K>>, type: string, event: Event) => void | null;
  setStore?: (data: T | Map<string, SnapshotStore<T, K>>, type: string, event: Event) => void | null

  state: any;
  getSnapshotById: (
    snapshot: (
      id: string
    ) => Promise<{
      category: Category
      timestamp: string | number | Date | undefined;
      id: string | number | undefined;
      snapshot: Snapshot<T, K>;
      snapshotStore: SnapshotStore<T, K>;
      data: T;
    }> | undefined
  ) => Promise<Snapshot<T, K> | null>
  onInitialize?: () => void;
  setSnapshotData(data: SnapshotDataType<T, K>, subscribers: SubscriberCollection<T, K>[]): void;
  handleSnapshot: (
    id: string | number,
    snapshotId: string | null,
    snapshot: Snapshot<T, K> | null,
    snapshotData: T,
    category: Category | undefined,
    callback: (snapshot: T) => void,
    snapshots: SnapshotsArray<any>,
    type: string,
    event: Event,
    snapshotContainer?: T,
    snapshotStoreConfig?: SnapshotStoreConfig<T, K, StructuredMetadata<T, K>, never>  | null, 
  ) => Promise<Snapshot<T, K> | null>
  getSnapshotId: (data: SnapshotData<T, K>) => Promise<string>;
  fetchSnapshotData: (endpoint: string, id: string | number) => SnapshotDataType<T, K>; // Adjust the return type as necessary

  snapshot: (
    id: string | number | undefined,
    snapshotId: string | null,
    snapshotData: SnapshotData<T, K> | null, // Change here
    category: Category | undefined,
    categoryProperties: CategoryProperties | undefined,
    callback: (snapshot: Snapshot<T, K> | null) => void,
    dataStore: DataStore<T, K>,
    dataStoreMethods: DataStoreMethods<T, K>,
    // dataStoreSnapshotMethods: DataStoreWithSnapshotMethods<T, K>,
    metadata: UnifiedMetaDataOptions<T, K, Meta, ExcludedFields>,
    subscriberId: string, // Add subscriberId here
    endpointCategory: string | number ,// Add endpointCategory here
    storeProps: SnapshotStoreProps<T, K>,
    snapshotConfigData: SnapshotConfig<T, K>,
    snapshotStoreConfigData?: SnapshotStoreConfig<T, K>,
    snapshotContainer?: SnapshotContainer<T, K>,
  ) => Promise<{
    snapshot: Snapshot<T, K> | null,
    snapshotData: SnapshotData<T, K>
  }>;

  createSnapshot: (
    id: string,
    category: symbol | string | Category | undefined,
    categoryProperties: CategoryProperties | undefined,
    callback?: (snapshot: Snapshot<T, K>) => void,
    snapshotData?: SnapshotStore<T, K>,
    snapshotStoreConfig?: SnapshotStoreConfig<T, K, StructuredMetadata<T, K>, never>  | null,
    snapshotStoreConfigSearch?: SnapshotStoreConfig<
      SnapshotWithCriteria<any, BaseData<T, K>>,
      SnapshotWithCriteria<any, BaseData<T, K, StructuredMetadata<T, K>>>
      >
  ) => Snapshot<T, K> | null;

  actions?: {
    takeSnapshot: (
      snapshot: Snapshot<T, K>,
      data: SnapshotStoreConfig<T, K>
    ) => Promise<Snapshot<T, K>>;

    updateSnapshot: (
      snapshot: Snapshot<T, K>,
      data: SnapshotStoreConfig<T, K>
    ) => Promise<Snapshot<T, K>>;

    mapSnapsohts: (
      snapshots: Snapshots<T, K>, 
      category: string
    ) => void;

    deleteSnapshot: (
      snapshot: Snapshot<T, K>,
      data: SnapshotStoreConfig<T, K>
    ) => Promise<Snapshot<T, K>>;

    updateSnapshotStore: (
      snapshotStore: SnapshotStore<T, K>,
      data: SnapshotStoreConfig<T, K>
    ) => Promise<SnapshotStore<T, K>>;

    deleteSnapshotStore: (
      snapshotStore: SnapshotStore<T, K>,
      data: SnapshotStoreConfig<T, K>
    ) => Promise<SnapshotStore<T, K>>

  };

  setSnapshot?: (snapshot: Snapshot<T, K>) => void;
  setSnapshotStore?: (snapshot: SnapshotStore<T, K>) => void;

  configureSnapshot: (
    id: string,
    storeId: number,
    snapshotId: string,
    dataStoreMethods: DataStore<T, K>,
    category?: string | symbol | Category,
    categoryProperties?: CategoryProperties | undefined,
    callback?: (snapshot: Snapshot<T, K>) => void,
    snapshotData?: SnapshotStore<T, K>,
    snapshotStoreConfig?: SnapshotStoreConfig<T, K, StructuredMetadata<T, K>, never> ,
  ) => Promise<SnapshotStore<T, K>>,


  configureSnapshotStore: (
    snapshotStore: SnapshotStore<T, K>,
    snapshotId: string,
    data: Map<string, Snapshot<T, K>>,
    events: Record<string, CalendarManagerStoreClass<T, K>[]>,
    dataItems: RealtimeDataItem[],
    newData: Snapshot<T, K>,
    payload: ConfigureSnapshotStorePayload<T, K>,
    store: SnapshotStore<any, K>,
    callback?: (snapshotStore: SnapshotStore<T, K>) => void
  ) => Promise<{
    snapshotStore: SnapshotStore<T, K>, 
    storeConfig: SnapshotStoreConfig<T, K>,
    updatedStore?: SnapshotStore<T, K>
  }>


  createSnapshotSuccess: (
    snapshotId: string,
    snapshotManager: SnapshotManager<T, K>,
    snapshot: Snapshot<T, K>,
    payload: { error: Error; }
  ) => Promise<void>;

  createSnapshotFailure: (
    snapshotId: string,
    snapshotManager: SnapshotManager<T, K>,
    snapshot: Snapshot<T, K>,
    payload: { error: Error }
  ) => Promise<void>;

  batchTakeSnapshot: (
    snapshotId: string,
    snapshotStore: SnapshotStore<T, K>,
    snapshots: Snapshots<T, K>
  ) => Promise<{
    snapshots: Snapshots<T, K>;
  }>;

  onSnapshot: (
    snapshotId: string,
    snapshot: Snapshot<T, K>,
    type: string,
    event: Event,
    callback: (snapshot: Snapshot<T, K>) => void
  ) => void;

  onSnapshots: (
    (snapshotId: string,
      snapshots: Snapshots<T, K>,
      type: string, event: Event,
      callback: (snapshots: Snapshots<T, K>) => void
    ) => Promise<void>
  ) | null;

  onSnapshotStore: (
    snapshotId: string,
    snapshots: Snapshots<T, K>,
    type: string, event: Event,
    callback: (snapshots: Snapshots<T, K>
    ) => void
  ) => void | undefined;

  snapshotData: (snapshotStore: SnapshotStore<T, K>) => {
    snapshots: Snapshots<T, K>;
  };

  mapSnapshot: (snapshotId: string,
    snapshot: Snapshot<T, K>,
    type: string,
    event: Event
  ) => SnapshotStore<T, K> | undefined

  createSnapshotStores: (
    id: string,
    snapshotId: string,
    snapshot: Snapshot<T, K>,
    snapshotStore: SnapshotStore<T, K>,
    snapshotManager: SnapshotManager<T, K>,
    payload: CreateSnapshotStoresPayload<T, K>,
    callback: (snapshotStore: SnapshotStore<T, K>[]) => void | null,
    snapshotStoreData?: SnapshotStore<T, K>[],
    category?: string | symbol | Category,
    snapshotDataConfig?: SnapshotStoreConfig<T, K>[]
  ) => Promise<{ 
    snapshotStores?: SnapshotStoreReference<T, K>[],
    storeConfigs: SnapshotStoreConfig<T, K>[], 
    category?: Category 
  }>

  displayToast: (
    message: string,
    type: string,
    duration: number,
    onClose: () => void
  ) => Promise<void> | null;
  
  addToSnapshotStoreList: (
    snapshotStore: SnapshotStore<any, any>,
    subscribers: Subscriber<T, K>[]
  ) => void | null;

  fetchInitialSnapshotData: (
    snapshotId: string,
    snapshotData: SnapshotData<T, K>,
    category: Category | undefined,
    snapshotConfig: SnapshotStoreConfig<T, K>,
    callback: (snapshotStore: SnapshotStore<T, K>) => Promise<Snapshot<T, K>>
  ) => Promise<Snapshot<T, K>>;

  updateSnapshot: (
    snapshotId: string,
    data: Map<string, Snapshot<T, K>>,
    events: Record<string, CalendarManagerStoreClass<T, K>[]>, 
    snapshotStore: SnapshotStore<T, K>,
    dataItems: RealtimeDataItem[],
    newData: Snapshot<T, K>,
    payload: UpdateSnapshotPayload<T>,
    store: SnapshotStore<any, any>,
    callback: (snapshotStore: SnapshotStore<T, K>) => Promise<{ snapshot: Snapshot<T, K>; }>
  ) => Promise<{ snapshot: Snapshot<T, K> }>;

  getSnapshots: (
    category: symbol | string | Category | undefined,
    snapshots: SnapshotsArray<T, K>
  ) => Promise<{
    snapshots: SnapshotsArray<T, K>;
  }>;

  mergeSnapshots: (snapshots: Snapshots<T, K>, category: string) => void;

  getSnapshotItems: (
      category: symbol | string | Category | undefined,
    snapshots: SnapshotsArray<T, K>
  ) => Promise<{snapshots: SnapshotItem<T, K>[]}>

  takeSnapshot: (snapshot: Snapshot<T, K>) => Promise<{
    snapshot: Snapshot<T, K>;
  }>;

  takeSnapshotStore: (snapshotStore: SnapshotStore<T, K>) => Promise<{
    snapshotStore: SnapshotStore<T, K>;
  }>;

  // addSnapshot: (snapshot: T, subscribers: SubscriberCollection<T, K>) => void;

  addSnapshotSuccess: (
    snapshot: T,
    subscribers: SubscriberCollection<T, K>
  ) => void;

  removeSnapshot: (snapshotToRemove: SnapshotStore<T, K>) => void;

  getSubscribers: (
    subscribers: SubscriberCollection<T, K>,
    snapshots: Snapshots<K>
  ) => Promise<{
    subscribers: SubscriberCollection<T, K>;
    snapshots: Snapshots<T, K>;
  }>;

  addSubscriber: (
    subscriber: Subscriber<T, K>,
    data: T,
    snapshotConfig: SnapshotStoreConfig<T, K>[],
    delegate: SnapshotStoreSubset<T, K>,
    sendNotification: (type: NotificationTypeEnum) => void
  ) => void;
  validateSnapshot: (data: Snapshot<T, K>) => boolean;
  getSnapshot(
    snapshot: (
      id: string
    ) =>
      | Promise<{
        category: any;
        timestamp: any;
        id: any;
        snapshot: Snapshot<T, K>;
        data: T;
      }>
      | undefined
  ): Promise<Snapshot<T, K>>;
  // Method to get a snapshot container using a snapshotFetcher

  getSnapshotContainer: (
    snapshotFetcher: (
      id: string | number
    ) => Promise<{
      id: string;
      category: string;
      timestamp: string;
      snapshotStore: SnapshotStore<T, K>;
      snapshot: Snapshot<T, K>;
      snapshots: Snapshots<T, K>;
      subscribers: Subscriber<T, K>[];
      data: InitializedData<T> | null | undefined;
      newData: InitializedData<T> | null | undefined;
      unsubscribe: () => void;
      addSnapshotFailure: (
        date: Date,
        snapshotManager: SnapshotManager<T, K>,
        snapshot: Snapshot<T, K>,
        payload: { error: Error; }
      ) => void;
      deleteSnapshot: (id: string) => void;
      
      createSnapshotSuccess: (
        snapshotId: string | number | null,
        snapshotManager: SnapshotManager<T, K>, 
        snapshot: Snapshot<T, K>, payload?: { data?: any; } | undefined
      ) => void;

      createSnapshotFailure: (
        date: Date,
        snapshotId: string, 
        snapshotManager: SnapshotManager<T, K>,
        snapshot: Snapshot<T, K>,
        payload: { error: Error; }

      ) => void;
      updateSnapshotSuccess: (
        snapshotId: string | number | null,
        snapshotManager: SnapshotManager<T, K>, 
        snapshot: Snapshot<T, K>,
        payload?: { data?: any; } | undefined
        ) => void;

      batchUpdateSnapshotsSuccess: (subscribers: Subscriber<T, K>[], snapshots: Snapshots<T, K>) => void;
      batchUpdateSnapshotsFailure: (
        date: Date,
        snapshotId: string | number | null,
        snapshotManager: SnapshotManager<T, K>,
        snapshot: Snapshot<T, K>,
        payload: { error: Error; }
      ) => void;
      batchUpdateSnapshotsRequest: (
        snapshotData: (subscribers: SubscriberCollection<T, K>) => Promise<{
          subscribers: SubscriberCollection<T, K>;
          snapshots: Snapshots<T, K>
        }>,
        snapshotManager: SnapshotManager<T, K>
      ) => Promise<void>;
     
      createSnapshots: (snapshots: Snapshots<T, K>) => void;
      batchTakeSnapshot: (snapshot: Snapshot<T, K>) => void;
      batchTakeSnapshotsRequest: (snapshots: Snapshots<T, K>) => void;
      batchFetchSnapshots: (criteria: any) => Promise<Snapshots<T, K>>;
      batchFetchSnapshotsSuccess: (snapshots: Snapshots<T, K>) => void;
      batchFetchSnapshotsFailure: (snapshotManager: SnapshotManager<T, K>, snapshot: Snapshot<T, K>, payload: { error: Error; }) => void;
      filterSnapshotsByStatus: (status: string) => Snapshots<T, K>;
      
      filterSnapshotsByCategory: (category: string) => Snapshots<T, K>;
      filterSnapshotsByTag: (tag: string) => Snapshots<T, K>;
      fetchSnapshot: (id: string) => Promise<Snapshot<T, K>>;

      getSnapshotData: (id: string) => T;
      setSnapshotCategory: (id: string, category: string) => void;
      getSnapshotCategory: (id: string) => string;
      getSnapshots: (criteria: any) => Snapshots<T, K>;
      getAllSnapshots: () => Snapshots<T, K>;
      addData: (id: string, data: T) => void;
      setData: (id: string, data: T) => void;
      getData: (id: string) => T;

      dataItems: () => T[];
      getStore: (id: string) => SnapshotStore<T, K>;
      addStore: (store: SnapshotStore<T, K>) => void;
      removeStore: (id: string) => void;
      stores: () => SnapshotStore<T, K>[];
      configureSnapshotStore: (config: any) => void;

      onSnapshot: (callback: (snapshot: Snapshot<T, K>) => void) => void;
      onSnapshots: (callback: (snapshots: Snapshots<T, K>) => void) => void;
      events: Record<string, CalendarManagerStoreClass<T, K>[]>, // Added prop
        
      notify: (message: string) => void;
      notifySubscribers: (message: string,
        subscribers: Subscriber<T, K>[],
        data: Partial<SnapshotStoreConfig<T, K>>
      ) => Subscriber<T, K>[]
  
    
      parentId: string;
      childIds?: K[];
      getParentId: (id: string) => string;
      getChildIds: (id: string) => string[];
      addChild: (parentId: string, childId: string) => void;
      removeChild: (parentId: string, childId: string) => void;
      getChildren: (id: string) => string[];
      hasChildren: (id: string) => boolean;
      isDescendantOf: (childId: string, parentId: string) => boolean;

      generateId: () => string;
      compareSnapshots: (snap1: Snapshot<T, K>, snap2: Snapshot<T, K>) => number;
      compareSnapshotItems: (item1: T, item2: T) => number;
      mapSnapshot: (snap: Snapshot<T, K>, mapFn: (item: T) => T) => Snapshot<T, K>;
      compareSnapshotState: (state1: Snapshot<T, K> | null, state2: Snapshot<T, K>) => boolean;

      getConfigOption: (key: string) => any;
      getTimestamp: () => string;
      getInitialState: () => any;
      getStores: () => SnapshotStore<T, K>[];
      getSnapshotId: (snapshot: Snapshot<T, K>) => Promise<string>;
      handleSnapshotSuccess: (message: string) => void;
    }> | undefined
  ) => Promise<SnapshotContainer<T, K>>;


  getSnapshotVersions: (
    snapshot: Snapshot<T, K>,
    snapshotId: string,
    snapshotData: SnapshotData<T, K>,
    versionHistory: VersionHistory
  ) => Promise<Snapshot<T, K>> | null;

  fetchData: (
    snapshot: Snapshot<T, K>,
    snapshotId: string,
    snapshotData: SnapshotData<T, K>,
    snapshotConfig: SnapshotStoreConfig<T, K>,
    callback: (snapshotStore: SnapshotStore<T, K>) => Promise<Snapshot<T, K>>
  ) => Promise<Snapshot<T, K>>;

  versionedSnapshot: (
    snapshot: Snapshot<T, K>,
    snapshotId: string,
    snapshotData: SnapshotData<T, K>,
    snapshotConfig: SnapshotStoreConfig<T, K>,
    callback: (snapshotStore: SnapshotStore<T, K>) => Promise<Snapshot<T, K>>,
    versionHistory: VersionHistory
  ) => Promise<Snapshot<T, K>>; 

  // Function to map snapshots (adjusted to return a list of snapshots or similar)
  mapSnapshots: (
    storeIds: number[],
    snapshotId: string,
    category: Category | undefined,
    categoryProperties: CategoryProperties | undefined,
    snapshot: Snapshot<T, K, StructuredMetadata<T, K>>,
    timestamp: string | number | Date | undefined,
    type: string,
    event: Event,
    id: number,
    snapshotStore: SnapshotStore<T, K, StructuredMetadata<T, K>>,
    data: BaseData
  ) => Promise<SnapshotsArray<BaseData>>

  getAllSnapshots: (
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
    ) => Promise<SnapshotUnion<T, K, Meta>[]>
  ) => Promise<Snapshot<T, K>[]>

  getSnapshotStoreData: (
    snapshotStore: SnapshotStore<T, K>,
    snapshot: Snapshot<T, K>,
    snapshotId: string,
    snapshotData: SnapshotData<T, K>
  ) => Promise<SnapshotStore<T, K>>;

  takeSnapshotSuccess: (snapshot: Snapshot<T, K>) => void;
  updateSnapshotFailure: (payload: { error: string }) => void;
  takeSnapshotsSuccess: (snapshots: T[]) => void;
  fetchSnapshot: (
    id: string,
    category: Category | undefined,
    timestamp: Date,
    snapshot: Snapshot<T, K>,
    data: T,
    delegate: SnapshotWithCriteria<T, K>[] | null,
  ) => Promise<{
    id: any;
    category: Category
    timestamp: any;
    snapshot: Snapshot<T, K>;
    data: T;
    delegate: SnapshotWithCriteria<T, K>[] | null;
  }>;

  addSnapshotToStore: (
    storeId: number,
    snapshot: Snapshot<T, K>,
    snapshotStore: SnapshotStore<T, K>,
    snapshotStoreData: SnapshotStore<T, K>,
    category: Category | undefined,
    subscribers: Subscriber<T>[]
  ) => void;

  getSnapshotSuccess: (
    snapshot: Snapshot<T, K>, 
    subscribers: Subscriber<T, K>[]
  ) => Promise<SnapshotStore<T, K>>;


  setSnapshotSuccess: (
    snapshot: SnapshotStore<T, K>,
    subscribers: SubscriberCollection<T, K>
  ) => void;
  setSnapshotFailure: (error: any) => void;
  updateSnapshotSuccess: (
    snapshotId: string,
    snapshotManager: SnapshotManager<T, K>,
    snapshot: Snapshot<T, K>,
    payload: { error: Error; }
  ) => void | null

  updateSnapshotsSuccess: (
    snapshotData: (
      subscribers: SubscriberCollection<T, K>,
      snapshot: Snapshots<T, K>
    ) => void
  ) => void;
  fetchSnapshotSuccess: (
    snapshotId: string,
    snapshotStore: SnapshotStore<T, K>,
    payload: FetchSnapshotPayload<T, K> | undefined,
    snapshot: Snapshot<T, K>,
    data: T,
    snapshotData: (
      snapshotManager: SnapshotManager<T, K>,
      subscribers: Subscriber<T, K>[],
      snapshot: Snapshot<T, K>
    ) => void,
  ) => void;

  updateSnapshotForSubscriber: (
    subscriber: Subscriber<T, K>,
    snapshots: Snapshots<T, K>
  ) => Promise<{
    subscribers: SubscriberCollection<T, K>;
    snapshots: Snapshots<T, K>;
  }>;

  updateMainSnapshots: (snapshots: Snapshots<T, K>) => Promise<Snapshots<T, K>>;

  batchProcessSnapshots: (
    subscribers: SubscriberCollection<T, K>,
    snapshots: Snapshots<T, K>
  ) => Promise<{ snapshots: Snapshots<T, K> }[]>;

  batchUpdateSnapshots: (
    subscribers: SubscriberCollection<T, K>,
    snapshots: Snapshots<T, K>
  ) => Promise<{ snapshots: Snapshots<T, K> }[]>;

  batchFetchSnapshotsRequest: (snapshotData: {
    subscribers: SubscriberCollection<T, K>;
    snapshots: Snapshots<T, K>;
  }) => Promise<{
    subscribers: SubscriberCollection<T, K>;
    snapshots: Snapshots<T, K>;
  }>;

  batchTakeSnapshotsRequest: (snapshotData: any) => Promise<{
    snapshots: Snapshots<T, K>;
  }>;

  batchUpdateSnapshotsSuccess: (
    subscribers: SubscriberCollection<T, K>,
    snapshots: Snapshots<T, K>
  ) => {
    snapshots: Snapshots<T, K>;
    }[];


  batchUpdateSnapshotsRequest: (
    snapshotData: (
      subscribers: Subscriber<T, K>[]
    ) => Promise<{
        subscribers: Subscriber<T, K>[];
        snapshots: Snapshots<T, K>;
      }>
  ) => {
    subscribers: SubscriberCollection<T, K>;
    snapshots: Snapshots<T, K>;
  };

  batchFetchSnapshots: (
    criteria: CriteriaType, // Added to match SnapshotMethods
    snapshotData: (
      snapshotIds: string[],
      subscribers: SubscriberCollection<T, K>,
      snapshots: Snapshots<T, K>
    ) => Promise<{
      subscribers: SubscriberCollection<T, K>;
      snapshots: Snapshots<T, K>; // Include snapshots here for consistency
    }>
  ) => Promise<Snapshot<T, K>[]>;

  getData: (data: Snapshot<T, K> | Snapshot<T, K>) => Promise<{
    data: Snapshot<T, K>;
  }>;

  batchFetchSnapshotsSuccess: (
    subscribers: SubscriberCollection<T, K>,
    snapshots: Snapshots<T, K>
  ) => Snapshots<T, K>;

  batchFetchSnapshotsFailure: (payload: { error: Error }) => void;
  batchUpdateSnapshotsFailure: (payload: { error: Error }) => void;
  
  [Symbol.iterator]: () => IterableIterator<T>;
  [Symbol.asyncIterator]: () => AsyncIterableIterator<T>;

  getCategory: (
    category: symbol | string | Category | undefined
  ) => { categoryProperties: CategoryProperties; snapshots: Snapshot<T, K>[] } // Match the base method's return type

  expirationDate?: Date;
  isExpired?: (() => boolean) | undefined;
  priority?: AllStatus;
   tags?: TagsRecord<T, K> | string[] | undefined; 
  metadata?: UnifiedMetaDataOptions<T, K, Meta, ExcludedFields> | {}
  status?: StatusType | undefined
  isCompressed?: boolean;
  compress?: () => void;
  isEncrypted?: boolean;
  encrypt?: () => void;
  decrypt?: () => void;
  ownerId?: string;
  getOwner?: () => string;
  version?: string | Version<T, K>;
  schema: Record<string, SchemaField>; // Schema definition
  previousVersionId?: string;
  nextVersionId?: string;
  auditTrail?: AuditRecord[];
  addAuditRecord?: (record: AuditRecord) => void;
  retentionPolicy?: RetentionPolicy;
  dependencies?: string[];
  useSimulatedDataSource: boolean;
  simulatedDataSource: SnapshotStoreConfig<T, K>[];

  updateSnapshots: () => void;
  updateSnapshotStore: (
    snapshotStore: SnapshotStore<T, K>, 
    snapshotId: string, 
    data: Map<string, Snapshot<T, K>>, 
    events: Record<string, CalendarManagerStoreClass<T, K>[]>, 
    dataItems: RealtimeDataItem[], 
    newData: Snapshot<T, K>, 
    payload: ConfigureSnapshotStorePayload<T, K>, 
  store: SnapshotStore<any, K>,
  callback: (snapshotStore: SnapshotStore<T, K>) => void
)=> void

  updateSnapshotsFailure: (error: Payload) => void;

  flatMap: <U>(
    callback: (
      snapshot: Snapshot<T, K> | SnapshotStoreConfig<T, K>, 
      index: number,
      array: (Snapshot<T, K> | SnapshotStoreConfig<T, K>)[]) => U
  ) => U[] | void;

  setData: (data: Map<string, Snapshot<T, K>>) => void;
  getState: () => any;
  setState: (state: any) => void;
  handleActions: (action: any) => void;
  setSnapshots: (snapshots: Snapshots<T, K>) => void;
  reduceSnapshots: <U>(callback: (acc: U, snapshot: Snapshot<T, K>) => U, initialValue: U) => U;
  sortSnapshots: (compareFn: (a: Snapshot<T, K>, b: Snapshot<T, K>) => number) => void;
  filterSnapshots: (predicate: (snapshot: Snapshot<T, K>) => boolean) => Snapshot<T, K>[];
  findSnapshot: (predicate: (snapshot: Snapshot<T, K>) => boolean) => Snapshot<T, K> | undefined;
  
  fetchSnapshotFailure: (payload: { error: Error }) => void;
  generateId: ( prefix: string,
    name: string,
    type: NotificationTypeEnum,
    id?: string,
    title?: string,
    chatThreadName?: string,
    chatMessageId?: string,
    chatThreadId?: string,
    dataDetails?: DataDetails<T, K>,
    generatorType?: string) => string;
  [Symbol.iterator]: () => IterableIterator<T>;
  [Symbol.asyncIterator]: () => AsyncIterableIterator<T>;

  // Add the new SnapshotSubscriberManagement interface here
  subscriberManagement?: SnapshotSubscriberManagement<T, K>;
}

// const snapshotStoreConfigInstance: SnapshotStoreConfig<T, K<T>> | null = null; // Or populate as needed
        
type InitializedConfig = SnapshotStoreConfig< BaseData<any>,  BaseData<any>> | SnapshotConfig< BaseData<any>,  BaseData<any>> | null

type ConstrainedSnapshotUnion<Base, Meta> = Base extends BaseData<any, any, any, any> 
  ? SnapshotUnion<Base, Meta> extends Base 
    ? SnapshotUnion<Base, Meta> 
    : Base 
  : never;
  
  
// A safe casting function to ensure type compatibility
function safeCastSnapshotStore<
  T extends BaseData<any> = BaseData<any, any>,
  K extends T = T, 
  Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>
>(
  snapshotStore: SnapshotStore<T, K>,
  context: {
    useSimulatedDataSource: boolean;
    simulatedDataSource: SnapshotStoreConfig<T, K>[];
  }
): SnapshotStore<SnapshotUnion<BaseData<any, any>, Meta>, K> {

  // Destructure and get delegates from the context
  const { simulatedDataSource } = context;

  return {
    ...snapshotStore,
    getFirstDelegate: () => {
      // Access the delegate from simulatedDataSource (or context)
      const delegates = simulatedDataSource;

      // Ensure delegates are available
      if (!delegates || delegates.length === 0) {
        throw new Error("No delegates available.");
      }

      // Convert to 'unknown' first, then cast to the desired type to ensure type compatibility
      return delegates[0] as unknown as SnapshotStoreConfig<SnapshotUnion<BaseData, Meta>, K>;
    },

    // Function to get the initial delegate, based on the simulatedDataSource
    getInitialDelegate: () => {
      if (!simulatedDataSource || simulatedDataSource.length === 0) {
        throw new Error("No delegates available.");
      }
      return simulatedDataSource as unknown as SnapshotStoreConfig<SnapshotUnion<BaseData<any, any, StructuredMetadata<any, any>>, Meta>, K, StructuredMetadata<SnapshotUnion<BaseData<any, any, StructuredMetadata<any, any>>, Meta>, K>, never>
    },

    // Transformation function for initializing the state of the snapshot store
    transformInitialState: <U extends BaseData<any, any, any, any>, T extends U = U>
    (
      initialState: InitializedState<U, T>
    ): InitializedState<U, U> | null => {
      if (initialState instanceof Map) {
        const transformed = new Map<string, Snapshot<U, U>>();
        initialState.forEach((value, key) => {
          transformed.set(key, {
            ...value,
            id: key, // Ensure the id is correctly set in each snapshot
            data: value.data as U, // Explicitly cast data to type U
          });
        });
        return transformed as InitializedState<U, U>;
      } else if (Array.isArray(initialState)) {
        return initialState.map((snapshot) => ({
          ...snapshot,
          id: snapshot.id || "default-id",
          data: snapshot.data as U, // Explicitly cast data to type U
        })) as InitializedState<U, U>;
      }
      return initialState as InitializedState<U, U>; // Ensure the return type is compatible
    },


    // Transformation function for a specific snapshot within the store
    transformSnapshot: (snapshot: Snapshot<T, K>): Snapshot<T, K> => {
      // Example transformation logic for a single snapshot
      return {
        ...snapshot,
        data: snapshot.data ? snapshot.data : new Map(), // Defaulting data to an empty map if missing
        timestamp: snapshot.timestamp ? snapshot.timestamp : Date.now(), // Assign a timestamp if not provided
        get: snapshot.get,
        dataStores: snapshot.dataStores,
        getConfig: snapshot.getConfig,
        initializeOptions: snapshot.initializeOptions,
        setConfig: snapshot.setConfig,
        autoSyncData: snapshot.autoSyncData,
        #snapshotStores: snapshot.#snapshotStores,
        ensureDelegate: snapshot.ensureDelegate, getSnapshotStores: snapshot.getSnapshotStores, getItems: snapshot.getItems,

       
      };
    },

    // Method to get the name of the snapshot store
    getName: (): string => {
      // Example implementation that returns a name based on simulated data or a default name
      return snapshotStore.getName() || "DefaultSnapshotStoreName";
    },

    // Method to get the version of the snapshot store
    getVersion: ():  string | Version<T, K> => {
      // Example versioning scheme based on context
      return context.useSimulatedDataSource ? "SimulatedVersion_1.0" : snapshotStore.getVersion() || "1.0";
    },

    // Method to get the schema of the snapshot store
    getSchema: (): string | Record<string, SchemaField> => {
      const schema = snapshotStore.getSchema();
      if (typeof schema === "object") {
        return JSON.stringify(schema); // Convert to string if it's an object
      }
      // returning a JSON schema or a placeholder schema
      return snapshotStore.getSchema() || JSON.stringify({ type: "object", properties: {} });
    },

    // Function to restore the snapshot from a saved state
    restoreSnapshot: (
      id: string,
      snapshot: Snapshot<SnapshotUnion<BaseData, Meta>, K>,
      snapshotId: string,
      snapshotData: SnapshotData<SnapshotUnion<BaseData, Meta>, K>,
      savedState: SnapshotStore<SnapshotUnion<BaseData, Meta>, K>,
      category: symbol | string | Category | undefined,
      callback: (snapshot: SnapshotUnion<BaseData, Meta>) => void,
      snapshots: SnapshotsArray<SnapshotUnion<BaseData, Meta>>,
      type: string,
      event: string | SnapshotEvents<SnapshotUnion<BaseData, Meta>, K>,
      subscribers: SubscriberCollection<SnapshotUnion<BaseData, Meta>, K>,
      snapshotContainer?: SnapshotUnion<BaseData, Meta> | undefined,
      snapshotStoreConfig?:
        | SnapshotStoreConfig<SnapshotUnion<BaseData, Meta>, K>
        | undefined,

      ): void => {
      // Example restoration logic, modifying the store in place based on a saved state
      
      if (savedState) {
        snapshotStore.data = savedState.data; // Restore the stored data
        snapshotStore.updateVersion(savedState.getVersion()); // Restore the version using the updateVersion method
      }
    },

    // Configuration getter that returns the store's configuration
    config: (): Promise<SnapshotStoreConfig<SnapshotUnion<BaseData, Meta>, K> | null>  => {
      // Return the configuration from the simulated data source if available
      return simulatedDataSource.length > 0 ? simulatedDataSource[0] : snapshotStore.getConfig();
    },
    // Configuration options for the snapshot store
    configs: context.useSimulatedDataSource
      ? simulatedDataSource.map((config) => ({
          ...config,
          name: `Simulated_${config.name}`,
        }))
      : snapshotStore.configs as SnapshotStoreConfig<SnapshotUnion<BaseData, Meta>, K>[], // Casting to match the expected type

    // Items managed by the snapshot store
    items: snapshotStore.getItems() ? snapshotStore.items as Snapshot<SnapshotUnion<BaseData, Meta>, K>[] : [],

    // Additional nested snapshot stores
    snapshotStores: snapshotStore.snapshotStores
      ? snapshotStore.getSnapshotStores().get.map((store) =>
          safeCastSnapshotStore(store, context)
        )
      : [],

    // Name of the snapshot store
    name: snapshotStore.getName() ? `SafeCast_${snapshotStore.getName()}` : "DefaultSafeCastStore",

    // Version of the snapshot store
    version: snapshotStore.getVersion() ? `SafeCast_${snapshotStore.getVersion()}` : "1.0",

    // Schema definition for the snapshot store
    schema: snapshotStore.getSchema() 
    ? { [`${snapshotStore.getSchema()}_SafeCast`]: {} as SchemaField } 
      : { SafeCastSchema: {} as SchemaField },
    
    // Snapshot items managed by the store
    snapshotItems: snapshotStore.getSnapshotItems
      ? snapshotStore.snapshotItems.map((item) => ({
          ...item,
          id: item.id || "default-id",
        }))
      : [],

    // Subscribers of the snapshot store
    subscribers: snapshotStore.subscribers
      ? snapshotStore.subscribers as unknown as SubscriberCollection<SnapshotUnion<BaseData, Meta>, K> // Casting to match the expected type
      : {} as SubscriberCollection<SnapshotUnion<BaseData, Meta>, K>,

    // Value property
    value: snapshotStore.value !== null
      ? snapshotStore.value as unknown as string | number | Snapshot<SnapshotUnion<BaseData, Meta>, K> | undefined
      : undefined,
  };
}


const snapshotStoreConfigs: SnapshotStoreConfig<BaseData, BaseData>[] = [
  {
    id: null,
    snapshotId: "snapshot1",
    key: "key1",
    priority: "active",
    topic: "topic1",
    status: StatusType.Inactive,
    category: "category1",
    timestamp: new Date(),
    state: null,
    snapshots: [],
    subscribers: [],
    subscription: null,
    initialState: null,
    clearSnapshots: null,
    isCompressed: false,
    expirationDate: new Date(),
    tags: {
      tag1: {
        id: "0292",
        name: "tag1",
        tagName: "tag1",
        color: "red",
        attribs: {},
        relatedTags: []
      },
    },
    metadata: {
      description: "metadata description",
      structuredMetadata: {
        description: "description",
        metadataEntries: {},
        apiEndpoint: "",
        apiKey: "",
        timeout: 0,
       
        retryAttempts: 0,
        name:"",
      },
      budget: 0,
      status: "",
      teamMembers: [],
      tasks: [], 

      apiEndpoint: "",
      apiKey: "",
      timeout: 0,
      
      retryAttempts: 0,
      name: "",
      startDate: new Date(),
      endDate: new Date(),
     
      milestones: [], 
      videos: [],

      metadataEntries: {
      id: "0292",
      name: "metadata",
      color: "red",
      creator: "admin",
      environment: "production",
      } 
    },
    configOption: {
      id: '', // Unique identifier
      name: '', // Name of the snapshot configuration
      title: '', // Title for display
      description: '', // Description of the snapshot
      data: null, // Snapshot data
      timestamp: new Date(), // Timestamp of the snapshot
      createdBy: '', // User who created the snapshot
      snapshotId: '', // Snapshot ID
      snapshotStore: null, // Snapshot store reference
      taskIdToAssign: '', // Task ID for assignment
      clearSnapshots: () => { }, // Function to clear snapshots

      key: '', // Key for identification
      topic: '', // Topic related to the snapshot
      dataStoreMethods: {} as DataStore<BaseData, BaseData>, // Methods for data store
      category: '', // Category of the snapshot
      length: 0, // Length or count of snapshots
      content: '', // Content associated with the snapshot

      // Optional configurations and states
      configOption: null, // Optional configuration for additional settings
      subscription: null, // Subscription details
      initialConfig: null, // Initial configuration for the snapshot store
      config: [], // List of additional configurations

      snapshotConfig: [], // Configuration specific to snapshots
      snapshotCategory: '', // Category for snapshots
      snapshotSubscriberId: null, // Subscriber ID for the snapshot
      snapshotContent: '', // Content of the snapshot
      store: null, // Snapshot store configuration
      snapshots: [], // Array of snapshots

      // Delegate functions and configurations
      delegate: [], // List of delegates or snapshot criteria
      snapshot: null, // Current snapshot (if applicable)
      meta: {
        // Meta information, if any
      },

      // Function to get the parent ID of a snapshot
      getParentId: (snapshot: Snapshot<SnapshotWithCriteria<DataWithParentAndChildIds<T, K>, any>, any>): string | null => {
        if (snapshot.data && typeof snapshot.data !== 'function') {
          // Type guard ensures that we're working with the expected SnapshotWithCriteria
          return (snapshot.data as DataWithParentAndChildIds<T, K>).parentId || null;
        }
        return null; // Return null if snapshot data is not of expected type
      },
  
      // Function to get child IDs of a snapshot
      getChildIds: (childSnapshot: Snapshot<SnapshotWithCriteria<DataWithParentAndChildIds<T, K>, any>, any>): string[] => {
        if (childSnapshot.data && typeof childSnapshot.data !== 'function') {
          // Type guard ensures that we're working with the expected SnapshotWithCriteria
          return (childSnapshot.data as DataWithParentAndChildIds<T, K>).childIds || [];
        }
        return []; // Return empty array if childSnapshot data is not of expected type
      },

      // Function to clear snapshot failure status
      clearSnapshotFailure: (): void => {
        // Implementation here
      },

      // Function to map snapshots (adjusted to return a list of snapshots or similar)
      mapSnapshots: async (
        storeIds: number[],
        snapshotId: string,
        category: Category | undefined,
        categoryProperties: CategoryProperties | undefined,
        snapshot: Snapshot<BaseData, BaseData, StructuredMetadata<T, K>>,
        timestamp: string | number | Date | undefined,
        type: string,
        event: Event,
        id: number,
        snapshotStore: SnapshotStore<BaseData, K<T>, StructuredMetadata<T, K<T>>>,
        data: BaseData
      ): Promise<SnapshotsArray<BaseData>> => {
        // Implementation here
        return [];
      },
      // Function to get snapshot ID createSnapshotStore: async (): Promise<void> => { }, // Function to create a snapshot store
      getSnapshotId: async (snapshot: Snapshot<BaseData, BaseData>): Promise<string> => (await snapshot.id?.toString() || ''), 
      updateSnapshotStore: async (): Promise<void> => { }, 

      configureSnapshot: async (
        id: string,
        snapshotData: SnapshotData<BaseData, BaseData> | undefined, 
        category: Category | undefined,
        categoryProperties: CategoryProperties | undefined,
        dataStoreMethods: DataStore<SnapshotUnion<BaseData, StructuredMetadata<T, K<T>>>, BaseData>
      ): Promise<SnapshotStore<BaseData, K<T>, StructuredMetadata<T,K<T>>>> => {
        
        // Validate the provided snapshotData
        if (!snapshotData || !id) {
          console.error("Invalid snapshot data or ID.");
          throw new Error("Invalid snapshot data or ID.");
        }
      
        // Determine the category and category properties
        let categoryName: string | undefined;
        if (category && typeof category === "string") {
          try {
            categoryName = determineFileCategory(category);
          } catch (error: any) {
            console.error(`Error determining category: ${error.message}`);
            throw new Error(`Error determining category: ${error.message}`);
          }
        } else if (categoryProperties) {
          categoryName = categoryProperties.name;
        }
      
        // Default values or retrieve from the store
        const storeConfig = dataStoreMethods?.config;
        // retrieve store Id 
        const storeId = await storeConfig?.id;
        // If the category is still undefined, use the determineSnapshotStoreCategory method
        if (!categoryName && storeConfig && storeId !== null) {
          
        const { snapshotStore } = await useSnapshotManager(Number(storeId));
        
          if (snapshotStore !== null) {
        
                // Use a safe type conversion function
              const castSnapshotStore = safeCastSnapshotStore(snapshotStore, {
                useSimulatedDataSource: false,
                simulatedDataSource: []
              });

              categoryName = dataStoreMethods.determineSnapshotStoreCategory(
                Number(storeId),
                castSnapshotStore,
                [storeConfig]
              );
          } else {
            console.error("SnapshotStore is null.");
            throw new Error("Cannot determine category: SnapshotStore is null.");
          }
            // Return a valid SnapshotStore after all processing
            return snapshotStore as unknown as SnapshotStore<BaseData, K<T>, Meta>;
        }
        // Initialize required properties with actual implementations
        let initialState: Snapshot<BaseData, BaseData>[] | null = null;
        let initialConfig: InitializedConfig = null;
        let data: Data | Map<string, Snapshot<BaseData, BaseData>> | undefined |  null = null;
        let subscribers: SubscriberCollection<BaseData, BaseData> = [];

        if (snapshotData && !(snapshotData instanceof Map)) {
          // snapshotData is of type SnapshotData<T, K>
          initialState = snapshotData.state || null; 
          if (typeof snapshotData.configOption !== "string") {
            initialConfig = snapshotData.configOption || null;
          } else {
            console.error("configOption is a string, but expected SnapshotConfig<BaseData, BaseData>");
            // Handle the error or assign a default value if needed
          };
          data = snapshotData.data;
          subscribers = snapshotData.subscribers || [];
        } else if (snapshotData instanceof Map) {
          // Handle case when snapshotData is a Map<string, Snapshot<T, K>>
          // You might want to implement additional logic here, depending on your needs
          console.log("snapshotData is a Map");
        }
        // Type guard to check if subscribers is an array
        const isArray = Array.isArray(subscribers);

        const removeSubscriber = (subscriberId: string) => {
          if (Array.isArray(subscribers)) {
            // Handle array case
            const index = subscribers.findIndex((sub: Subscriber<BaseData, BaseData>) => sub.id === subscriberId);
            if (index !== -1) {
              subscribers.splice(index, 1);
            }
          } else {
            // Handle record case
            for (const key in subscribers) {
              if (subscribers.hasOwnProperty(key)) {
                const subscriberArray = subscribers[key] as Subscriber<BaseData, BaseData>[];
                const index = subscriberArray.findIndex((sub: Subscriber<BaseData, BaseData>) => sub.id === subscriberId);
                if (index !== -1) {
                  subscriberArray.splice(index, 1);
                }
              }
            }
          }
        }   
        
        const onInitialize = () => {
          
          };

        
        const taskIdToAssign: string = ''; // If task ID needs to be assigned dynamically, handle it accordingly
        const snapshot: Snapshot<BaseData, BaseData> = {
          id,
          data,
          initialState,
          isCore: false,
          category: categoryName || "defaultName",
          timestamp: new Date(),
          initialConfig: {},
          removeSubscriber: (
            event: string,
            snapshotId: string, 
            snapshot: Snapshot<BaseData, BaseData>,
            snapshotStore: SnapshotStore<BaseData, BaseData>,
            dataItems: RealtimeDataItem[], 
            criteria: SnapshotWithCriteria<T, K<T>>,
             category: Category
          ) => {}, 
          onInitialize: () =>{},
          onError: (error: any, snapshot?: Snapshot<BaseData, BaseData>) => {
            // Log the error to the console
            console.error(`An error occurred in snapshot with ID: ${snapshot?.id}`, error);
            
            // Notify a monitoring service (this is just a placeholder for illustration)
            // e.g., notifyMonitoringService(error);
            if (typeof notifyMonitoringService === "function") {
              notifyMonitoringService({
                error,
                snapshotId: snapshot?.id,
                timestamp: new Date().toISOString(),
              });
            }
        
            // Perform cleanup or other error-related actions
            if (snapshot) {
              // Log the snapshot data for debugging purposes
              console.log(`Snapshot data at the time of error:`, snapshot.data);
              
              // Example: Remove the snapshot from some store if it can't recover
              // snapshotStore.removeSnapshot(snapshot.id);
            }
        
            // Optional: Additional error recovery logic
            if (error.recoverable) {
              // Attempt to recover or reinitialize the snapshot if needed
              console.warn(`Attempting to recover snapshot with ID: ${snapshot?.id}`);
              if (snapshot && typeof snapshot.onInitialize === "function") {
                snapshot.onInitialize(callback);
              }
            } else {
              console.warn(`Error is not recoverable. Snapshot with ID ${snapshot?.id} may need manual intervention.`);
            }
          },
          taskIdToAssign: undefined,
          currentCategory: undefined,
          mappedSnapshotData: {} as Map<string, Snapshot<BaseData, BaseData>>,
          snapshot: function (
            id: string | number | undefined,
            snapshotId: string | null,
            snapshotData: SnapshotData<BaseData, BaseData>,
            category: symbol | string | Category | undefined,
            categoryProperties: CategoryProperties | undefined,
            callback: (snapshotStore: SnapshotStore<BaseData, BaseData>) => void,
            dataStoreMethods: DataStore<BaseData, BaseData>[],
            // dataStoreSnapshotMethods: DataStoreWithSnapshotMethods<T, K>,
            metadata: UnifiedMetaDataOptions<T, K, Meta, ExcludedFields>,
            subscriberId: string, // Add subscriberId here
            endpointCategory: string | number ,// Add endpointCategory here
            storeProps: SnapshotStoreProps<T, K>,
            snapshotConfigData?: Snapshot<T, K>,
            snapshotStoreConfigData?: SnapshotStoreConfig<T, K>,
            snapshotContainer?: SnapshotStore<T, K> | Snapshot<T, K> | null,
          ): Snapshot<BaseData, BaseData> | Promise<{ snapshot: Snapshot<BaseData, BaseData>; }> {
            throw new Error("Function not implemented.");
          },
          setCategory: function (category: Category): void {
            throw new Error("Function not implemented.");
          },
          applyStoreConfig: function (
            snapshotStoreConfig: SnapshotStoreConfig<SnapshotUnion<BaseData, Meta>, K> | undefined
          ): void {
            throw new Error("Function not implemented.");
          },
          generateId: function (prefix: string, name: string, type: NotificationTypeEnum, id?: string, title?: string, chatThreadName?: string, chatMessageId?: string, chatThreadId?: string, dataDetails?: DataDetails, generatorType?: string): string {
            throw new Error("Function not implemented.");
          },
          snapshotData: function (id: string, snapshotData: T, category: Category | undefined, categoryProperties: CategoryProperties | undefined, dataStoreMethods: DataStore<BaseData, BaseData>): Promise<SnapshotStore<BaseData, BaseData>> {
            throw new Error("Function not implemented.");
          },
          getSnapshotItems: function (
            category: symbol | string | Category | undefined,
            snapshots: SnapshotsArray<T, K>
          ): (SnapshotStoreConfig<BaseData, BaseData> | SnapshotItem<BaseData, BaseData> | undefined)[] {
            throw new Error("Function not implemented.");
          },
          defaultSubscribeToSnapshots: function (snapshotId: string, callback: (snapshots: Snapshots<T, K>) => Subscriber<BaseData, BaseData> | null, snapshot: Snapshot<BaseData, BaseData> | null): void {
            throw new Error("Function not implemented.");
          },
          notify: function (id: string, message: string, data: any, date: Date, type: NotificationType): void {
            throw new Error("Function not implemented.");
          },
          notifySubscribers: function (
            message: string,
            subscribers: Subscriber<BaseData, BaseData>[],
            data: Partial<SnapshotStoreConfig<T, K>>
          ): Subscriber<BaseData, BaseData>[] {
            throw new Error("Function not implemented.");
          },
          getAllSnapshots: function (
            storeId: number,
            snapshotId: string, 
            snapshotData: T, 
            timestamp: string, 
            type: string, 
            event: Event, 
            id: number, 
            snapshotStore: SnapshotStore<BaseData, BaseData>, category: symbol | string | Category | undefined, categoryProperties: CategoryProperties | undefined, dataStoreMethods: DataStore<BaseData, BaseData>, data: T, dataCallback?: ((subscribers: Subscriber<BaseData, BaseData>[], snapshots: Snapshots<T, K>) => Promise<Snapshots<T, K>>) | undefined): Promise<Snapshot<BaseData, BaseData>[]> {
            throw new Error("Function not implemented.");
          },
          getSubscribers: function (subscribers: Subscriber<BaseData, BaseData>[], snapshots: Snapshots<T, K>): Promise<{ subscribers: Subscriber<BaseData, BaseData>[]; snapshots: Snapshots<T, K>; }> {
            throw new Error("Function not implemented.");
          },
          versionInfo: null,
          transformSubscriber: function (sub: Subscriber<BaseData, BaseData>): Subscriber<BaseData, BaseData> {
            throw new Error("Function not implemented.");
          },
          transformDelegate: function (): SnapshotStoreConfig<BaseData, BaseData>[] {
            throw new Error("Function not implemented.");
          },
          initializedState: undefined,
          getAllKeys: function (
            storeId: number, 
            snapshotId: string, 
            category: symbol | string | Category | undefined,
            categoryProperties: CategoryProperties | undefined,
            snapshot: Snapshot<BaseData, BaseData>, 
             timestamp: string | number | Date | undefined,
              type: string, 
              event: SnapshotEvents<T, K>, 
              id: number, 
              snapshotStore: SnapshotStore<BaseData, BaseData>, data: T): Promise<string[] | undefined> {
            throw new Error("Function not implemented.");
          },
          getAllValues: function (): SnapshotsArray<T, K> {
            throw new Error("Function not implemented.");
          },
          getAllItems: function (): Promise<Snapshot<BaseData, BaseData>[] | undefined> {
            throw new Error("Function not implemented.");
          },
          getSnapshotEntries: function (snapshotId: string): Map<string, K<T>> | undefined {
            throw new Error("Function not implemented.");
          },
          getAllSnapshotEntries: function (): Map<string, K<T>>[] {
            throw new Error("Function not implemented.");
          },
          addDataStatus: function (id: number, status: StatusType | undefined): void {
            throw new Error("Function not implemented.");
          },
          removeData: function (id: number): void {
            throw new Error("Function not implemented.");
          },
          updateData: function (id: number, newData: Snapshot<BaseData, BaseData>): void {
            throw new Error("Function not implemented.");
          },
          updateDataTitle: function (id: number, title: string): void {
            throw new Error("Function not implemented.");
          },
          updateDataDescription: function (id: number, description: string): void {
            throw new Error("Function not implemented.");
          },
          updateDataStatus: function (id: number, status: StatusType | undefined): void {
            throw new Error("Function not implemented.");
          },
          addDataSuccess: function (payload: { data: Snapshot<BaseData, BaseData>[]; }): void {
            throw new Error("Function not implemented.");
          },
          getDataVersions: function (id: number): Promise<Snapshot<BaseData, BaseData>[] | undefined> {
            throw new Error("Function not implemented.");
          },
          updateDataVersions: function (id: number, versions: Snapshot<BaseData, BaseData>[]): void {
            throw new Error("Function not implemented.");
          },
          getBackendVersion: function (): Promise<string | undefined> {
            throw new Error("Function not implemented.");
          },
          getFrontendVersion: function (): Promise<string | number | undefined> {
            throw new Error("Function not implemented.");
          },
          fetchData: function (id: number): Promise<SnapshotStore<BaseData, BaseData>[]> {
            throw new Error("Function not implemented.");
          },
          defaultSubscribeToSnapshot: function (snapshotId: string, callback: Callback<Snapshot<BaseData, BaseData>>, snapshot: Snapshot<BaseData, BaseData>): string {
            throw new Error("Function not implemented.");
          },
          handleSubscribeToSnapshot: function (snapshotId: string, callback: Callback<Snapshot<BaseData, BaseData>>, snapshot: Snapshot<BaseData, BaseData>): void {
            throw new Error("Function not implemented.");
          },
          removeItem: function (key: string): Promise<void> {
            throw new Error("Function not implemented.");
          },
          getSnapshot: function (
            snapshot: (id: string | number) => Promise<{ 
              snapshotId: string | number;
              snapshotData: T; 
              category: Category | undefined; 
              categoryProperties: CategoryProperties; 
              dataStoreMethods: DataStore<BaseData, BaseData>; 
              timestamp: string | number | Date | undefined; 
              id: string | number | undefined; 
              snapshot: Snapshot<BaseData, BaseData>; 
              snapshotStore: SnapshotStore<BaseData, BaseData>; 
              data: T; 
            }> | undefined): Promise<Snapshot<BaseData, BaseData> | undefined> {
            throw new Error("Function not implemented.");
          },
          getSnapshotSuccess: function (
            snapshot: Snapshot<SnapshotUnion<BaseData, Meta<T, K>>, 
            SnapshotUnion<BaseData<any, any, StructuredMetadata<any, any>, Attachment>, any>
            >

          ): Promise<SnapshotStore<BaseData, BaseData>> {
            throw new Error("Function not implemented.");
          },
          setItem: function (key: T, value: T): Promise<void> {
            throw new Error("Function not implemented.");
          },
          getItem: function (key: T): Promise<Snapshot<BaseData, BaseData> | undefined> {
            throw new Error("Function not implemented.");
          },
          getDataStore: function (): Promise<DataStore<BaseData, BaseData>> {
            throw new Error("Function not implemented.");
          },
          getDataStoreMap: function (): Promise<Map<string, DataStore<BaseData, BaseData>>> {
            throw new Error("Function not implemented.");
          },
          addSnapshotSuccess: function (
            snapshot: Snapshot<BaseData, BaseData>, 
            subscribers: Subscriber<BaseData, BaseData>[]
          ): void {
            throw new Error("Function not implemented.");
          },
          deepCompare: function (objA: any, objB: any): boolean {
            throw new Error("Function not implemented.");
          },
          shallowCompare: function (objA: any, objB: any): boolean {
            throw new Error("Function not implemented.");
          },
          getDataStoreMethods: function (): DataStoreMethods<BaseData, BaseData> {
            throw new Error("Function not implemented.");
          },
          getDelegate: function (
            context: {
              useSimulatedDataSource: boolean; 
            simulatedDataSource: SnapshotStoreConfig<BaseData, BaseData>[]; }): SnapshotStoreConfig<BaseData, BaseData>[] {
            throw new Error("Function not implemented.");
          },
          determineCategory: function (snapshot: Snapshot<BaseData, BaseData> | null | undefined): string {
            throw new Error("Function not implemented.");
          },
          determinePrefix: function (snapshot: any, category: string): string {
            throw new Error("Function not implemented.");
          },
          removeSnapshot: function (snapshotToRemove: Snapshot<BaseData, BaseData>): void {
            throw new Error("Function not implemented.");
          },
          addSnapshotItem: function (item: Snapshot<BaseData, BaseData> | SnapshotStoreConfig<BaseData, BaseData>): void {
            throw new Error("Function not implemented.");
          },
          addNestedStore: function (store: SnapshotStore<BaseData, BaseData>): void {
            throw new Error("Function not implemented.");
          },
          clearSnapshots: function (): void {
            throw new Error("Function not implemented.");
          },
          // addSnapshot: function (snapshot: Snapshot<BaseData, BaseData>, snapshotId: string, subscribers: SubscriberCollection<BaseData, BaseData>): Promise<Snapshot<BaseData, BaseData> | undefined> {
          //   throw new Error("Function not implemented.");
          // },
          emit: function (event: string, snapshot: Snapshot<BaseData, BaseData>, snapshotId: string, subscribers: SubscriberCollection<BaseData, BaseData>, snapshotStore: SnapshotStore<BaseData, BaseData>, dataItems: RealtimeDataItem[], criteria: SnapshotWithCriteria<BaseData, BaseData>, category: Category): void {
            throw new Error("Function not implemented.");
          },
          createSnapshot: undefined,

          createInitSnapshot: function (
            id: string, 
            initialData: T, 
            snapshoConfigtData: SnapshotStoreConfig<BaseData, BaseData>, 
            category: Category): Promise<Snapshot<Data, K<T>>> {
            throw new Error("Function not implemented.");
          },
          addStoreConfig: function (config: SnapshotStoreConfig<T, any>): void {
            throw new Error("Function not implemented.");
          },
          handleSnapshotConfig: function (config: SnapshotStoreConfig<T, any>): void {
            throw new Error("Function not implemented.");
          },
          getSnapshotConfig: function (): SnapshotStoreConfig<T, any>[] {
            throw new Error("Function not implemented.");
          },
          getSnapshotListByCriteria: function (criteria: SnapshotStoreConfig<BaseData, BaseData>): Promise<Snapshot<BaseData, BaseData>[]> {
            throw new Error("Function not implemented.");
          },
          setSnapshotSuccess: function (snapshotData: SnapshotData<BaseData, BaseData>, subscribers: SubscriberCollection<BaseData, BaseData>): void {
            throw new Error("Function not implemented.");
          },
          setSnapshotFailure: function (error: Error): void {
            throw new Error("Function not implemented.");
          },
          updateSnapshots: function (): void {
            throw new Error("Function not implemented.");
          },
          updateSnapshotsSuccess: function (snapshotData: (subscribers: Subscriber<BaseData, BaseData>[], snapshot: Snapshots<T, K>) => void): void {
            throw new Error("Function not implemented.");
          },
          updateSnapshotsFailure: function (error: Payload): void {
            throw new Error("Function not implemented.");
          },
          initSnapshot: function (
            snapshot: Snapshot<BaseData, BaseData> | SnapshotStore<BaseData, BaseData> | null,
            snapshotId: string | null, snapshotData: SnapshotData<BaseData, BaseData>, category: symbol | string | Category | undefined,
             snapshotConfig: SnapshotStoreConfig<BaseData, BaseData>, callback: (snapshotStore: SnapshotStore<any, any>) => void): void {
            throw new Error("Function not implemented.");
          },
          takeSnapshot: function (snapshot: Snapshot<BaseData, BaseData>, subscribers: Subscriber<BaseData, BaseData>[]): Promise<{ snapshot: Snapshot<BaseData, BaseData>; }> {
            throw new Error("Function not implemented.");
          },
          takeSnapshotSuccess: function (snapshot: Snapshot<BaseData, BaseData>): void {
            throw new Error("Function not implemented.");
          },
          takeSnapshotsSuccess: function (snapshots: T[]): void {
            throw new Error("Function not implemented.");
          },
          flatMap: function <U extends Iterable<any>>(callback: (value: SnapshotStoreConfig<BaseData, BaseData>, index: number, array: SnapshotStoreConfig<BaseData, BaseData>[]) => U): U extends (infer I)[] ? I[] : U[] {
            throw new Error("Function not implemented.");
          },
          getState: function () {
            throw new Error("Function not implemented.");
          },
          setState: function (state: any): void {
            throw new Error("Function not implemented.");
          },
          validateSnapshot: function (snapshotId: string, snapshot: Snapshot<BaseData, BaseData>): boolean {
            throw new Error("Function not implemented.");
          },
          handleActions: function (action: (selectedText: string) => void): void {
            throw new Error("Function not implemented.");
          },
          setSnapshot: function (snapshot: Snapshot<BaseData, BaseData>): void {
            throw new Error("Function not implemented.");
          },
          transformSnapshotConfig: function <U extends BaseData>(
            config: SnapshotStoreConfig<U, U>): SnapshotStoreConfig<U, U> {
            throw new Error("Function not implemented.");
          },
          setSnapshots: function (snapshots: Snapshots<T, K>): void {
            throw new Error("Function not implemented.");
          },
          clearSnapshot: function (): void {
            throw new Error("Function not implemented.");
          },
          mergeSnapshots: function (snapshots: Snapshots<T, K>, category: string): void {
            throw new Error("Function not implemented.");
          },
          reduceSnapshots: function <U>(callback: (acc: U, snapshot: Snapshot<BaseData, BaseData>) => U, initialValue: U): U | undefined {
            throw new Error("Function not implemented.");
          },
          sortSnapshots: function (): void {
            throw new Error("Function not implemented.");
          },
          filterSnapshots: function (): void {
            throw new Error("Function not implemented.");
          },
          findSnapshot: function (predicate: (snapshot: Snapshot<BaseData, BaseData>) => boolean): Snapshot<BaseData, BaseData> | undefined {
            throw new Error("Function not implemented.");
          },
          mapSnapshots: function <U>(
            storeIds: number[], 
            snapshotId: string, 
            category: symbol | string | Category | undefined,
            categoryProperties: CategoryProperties | undefined, 
            snapshot: Snapshot<BaseData, BaseData>, 
            timestamp: string | number | Date | undefined, 
            type: string, 
            event: Event, 
            id: number, 
            snapshotStore: SnapshotStore<BaseData, BaseData>, 
            data: T,
            callback: (storeIds: number[], snapshotId: string, category: symbol | string | Category | undefined, categoryProperties: CategoryProperties | undefined, snapshot: Snapshot<BaseData, BaseData>, timestamp: string | number | Date | undefined, type: string, event: Event, id: number, snapshotStore: SnapshotStore<BaseData, BaseData>, data: T, index: number) => U): U[] {
            throw new Error("Function not implemented.");
          },
          takeLatestSnapshot: function (): Snapshot<BaseData, BaseData> | undefined {
            throw new Error("Function not implemented.");
          },
          updateSnapshot: function (
            snapshotId: string, 
            data: Map<string, Snapshot<BaseData, BaseData>>,
            snapshotManager: SnapshotManager<BaseData<any, any, StructuredMetadata<any, any>>, BaseData<any, any, StructuredMetadata<any, any>>, StructuredMetadata<any, any>, never>,
            events: Record<string, CalendarManagerStoreClass<BaseData, BaseData>[]>,
            snapshotStore: SnapshotStore<BaseData, BaseData>, 
            dataItems: RealtimeDataItem[], 
            newData: Snapshot<BaseData, BaseData>,
            timestamp: Date, 
            payload: UpdateSnapshotPayload<T>, 
            category: symbol | string | Category | undefined,
            payloadData: T | K,
            mappedSnapshotData: Map<string, Snapshot<T, K>>,
            delegate: SnapshotWithCriteria<T, K>[],
            store: SnapshotStore<any, K<T>>
          ): void {
            throw new Error("Function not implemented.");
          },
          addSnapshotSubscriber: function (snapshotId: string, subscriber: Subscriber<BaseData, BaseData>): void {
            throw new Error("Function not implemented.");
          },
          removeSnapshotSubscriber: function (snapshotId: string, subscriber: Subscriber<BaseData, BaseData>): void {
            throw new Error("Function not implemented.");
          },
          getSnapshotConfigItems: function (): SnapshotStoreConfig<BaseData, BaseData>[] {
            throw new Error("Function not implemented.");
          },
          subscribeToSnapshots: function (
            snapshotStore: SnapshotStore<T, K<T>>,
            snapshotId: string,
            snapshotData: SnapshotData<T, K<T>>,
            category: Category | undefined,
            snapshotConfig: SnapshotStoreConfig<T, K<T>>,
            callback: (
              snapshotStore: SnapshotStore<T, K<T>>,
              snapshots: SnapshotsArray<T, K<T>>
            ) => Subscriber<T, K<T>> | null,
            snapshots: SnapshotsArray<T, K<T>>,
            unsubscribe?: UnsubscribeDetails,
          ): [] | SnapshotsArray<T, K<T>> {
            throw new Error("Function not implemented.");
          },
          executeSnapshotAction: function (actionType: SnapshotActionType, actionData: any): Promise<void> {
            throw new Error("Function not implemented.");
          },
          subscribeToSnapshot: function (
            snapshotId: string,
            callback: (snapshot: Snapshot<T, K<T>>) => Subscriber<T, K<T>> | null,
            snapshot: Snapshot<T, K<T>>
          ): Snapshot<BaseData, BaseData> {
            throw new Error("Function not implemented.");
          },
          unsubscribeFromSnapshot: function (snapshotId: string, callback: (snapshot: Snapshot<BaseData, BaseData>) => void): void {
            throw new Error("Function not implemented.");
          },
          subscribeToSnapshotsSuccess: function (callback: (snapshots: Snapshots<T, K<T>>) => void): string {
            throw new Error("Function not implemented.");
          },
          unsubscribeFromSnapshots: function (callback: (snapshots: Snapshots<T, K<T>>) => void): void {
            throw new Error("Function not implemented.");
          },
          getSnapshotItemsSuccess: function (): SnapshotItem<Data, any>[] | undefined {
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
          getSnapshotValuesSuccess: function (): SnapshotItem<Data, any>[] | undefined {
            throw new Error("Function not implemented.");
          },
          getSnapshotWithCriteria: function (criteria: SnapshotStoreConfig<BaseData, BaseData>): SnapshotStoreConfig<BaseData, BaseData> {
            throw new Error("Function not implemented.");
          },
          reduceSnapshotItems: function (callback: (acc: any, snapshot: Snapshot<BaseData, BaseData>) => any, initialValue: any) {
            throw new Error("Function not implemented.");
          },
          subscribeToSnapshotList: function (snapshotId: string, callback: (snapshots: Snapshot<BaseData, BaseData>) => void): void {
            throw new Error("Function not implemented.");
          },
          config: Promise.resolve(null),
          label: undefined,
          events: undefined,
          restoreSnapshot: function (
            id: string,
            snapshot: Snapshot<BaseData, BaseData>, 
            snapshotId: string, 
            snapshotData: T,
            category: Category | undefined, callback: (snapshot: T) => void, snapshots: SnapshotsArray<T, K>,
            type: string, 
            event: Event, 
            snapshotContainer?: any,
            snapshotStoreConfig?: SnapshotStoreConfig<BaseData, BaseData> | undefined): void {
            throw new Error("Function not implemented.");
          },

          handleSnapshot: function (
            id: string, 
            snapshotId: string | number | null,
            snapshot: T extends SnapshotData<T, K<T>> ? Snapshot<T, K<T>> : null,
            snapshotData: T, 
            category: Category | undefined, 
            categoryProperties: CategoryProperties | undefined,
            callback: (snapshot: T) => void, 
            snapshots: SnapshotsArray<T, K<T>>, 
            type: string,
            event: Event,
            snapshotContainer?: any,
            snapshotStoreConfig?: SnapshotStoreConfig<T, any> | null | undefined,
            storeConfigs?: SnapshotStoreConfig<T, K<T>>[]
          ): Promise<Snapshot<BaseData, BaseData> | null> {
            throw new Error("Function not implemented.");
          },
          subscribe: function (
            snapshotId: string | number | null,
            unsubscribe: UnsubscribeDetails, 
            subscriber: Subscriber<BaseData, BaseData> | null, 
            data: T, 
            event: Event, callback: Callback<Snapshot<BaseData, BaseData>>, 
            value: T
          ): [] | SnapshotsArray<T, K<T>> {
            throw new Error("Function not implemented.");
          },
          meta: {},
          subscribers: [],
          snapshotStore: null,
          setSnapshotCategory: function (id: string, newCategory: Category): void {
            throw new Error("Function not implemented.");
          },
          getSnapshotCategory: function (id: string): Category | undefined {
            throw new Error("Function not implemented.");
          },
          getSnapshotData: function (id: string | number | undefined, 
            snapshotId: number, 
            snapshotData: T, 
            category: Category | undefined, 
            categoryProperties: CategoryProperties | undefined, 
            dataStoreMethods: DataStore<BaseData, BaseData>
          ): Map<string, Snapshot<BaseData, BaseData>> | null | undefined {
            throw new Error("Function not implemented.");
          },
          deleteSnapshot: function (id: string): void {
            throw new Error("Function not implemented.");
          },
          getSnapshots: function (category: string, data: Snapshots<T, K<T>>): void {
            throw new Error("Function not implemented.");
          },
          compareSnapshots: function (snap1: Snapshot<BaseData, BaseData>, snap2: Snapshot<BaseData, BaseData>): { snapshot1: Snapshot<BaseData, BaseData>; snapshot2: Snapshot<BaseData, BaseData>; differences: Record<string, { snapshot1: any; snapshot2: any; }>; versionHistory: { snapshot1Version: number; snapshot2Version: number; }; } | null {
            throw new Error("Function not implemented.");
          },

          compareSnapshotItems: function (snap1: Snapshot<BaseData, BaseData>, snap2: Snapshot<BaseData, BaseData>, keys: string[]): { 
            itemDifferences: Record<string, { snapshot1: any; 
              snapshot2: any;
              differences: {
                [key: string]: { 
                value1: any; value2: any; }; 
              }; }>;
             } | null {
            throw new Error("Function not implemented.");
          },

          batchTakeSnapshot: function (
            id: number,
            snapshotId: string, 
            snapshotStore: SnapshotStore<BaseData, BaseData>,
            snapshots: Snapshots<Data>
          ): Promise<{ snapshots: Snapshots<T, K<T>>; }> {
            throw new Error("Function not implemented.");
          },
          batchFetchSnapshots: function (
            criteria: CriteriaType,
            snapshotData: (
              snapshotIds: string[],
              subscribers: SubscriberCollection<T, K<T>>,
              snapshots: Snapshots<T, K<T>>
            ) => Promise<{
              subscribers: SubscriberCollection<T, K<T>>;
              snapshots: Snapshots<T, K<T>>; // Include snapshots here for consistency
            }>
          ): Promise<Snapshot<BaseData, BaseData>[]> {
            throw new Error("Function not implemented.");
          },
          batchTakeSnapshotsRequest: function (
            criteria: CriteriaType,
            snapshotData: (
              snapshotIds: string[],
              snapshots: Snapshots<T, K<T>>,
              subscribers: Subscriber<T, K<T>>[]
            ) => Promise<{
              subscribers: Subscriber<T, K<T>>[]
            }>
          ): Promise<void> {
            throw new Error("Function not implemented.");
          },
          batchUpdateSnapshotsRequest: function (
            snapshotData: (subscribers: SubscriberCollection<T, K<T>>) => Promise<{
              subscribers: SubscriberCollection<T, K<T>>;
              snapshots: Snapshots<T, K<T>>
            }>,
            snapshotManager: SnapshotManager<T, K<T>>        
          ): Promise<void> {
            throw new Error("Function not implemented.");
          },
          filterSnapshotsByStatus: function (status: string): Snapshots<T, K<T>> {
            throw new Error("Function not implemented.");
          },
          filterSnapshotsByCategory: function (category: string): Snapshots<T, K<T>> {
            throw new Error("Function not implemented.");
          },
          filterSnapshotsByTag: function (tag: string): Snapshots<T, K<T>> {
            throw new Error("Function not implemented.");
          },
          batchFetchSnapshotsSuccess: function (
            subscribers: SubscriberCollection<T, K<T>>[],
            snapshots: Snapshots<T, K<T>>
          ): void {
            throw new Error("Function not implemented.");
          },
          batchFetchSnapshotsFailure: function (date: Date, snapshotManager: SnapshotManager<BaseData, BaseData>, snapshot: Snapshot<BaseData, BaseData>, payload: { error: Error; }): void {
            throw new Error("Function not implemented.");
          },
          batchUpdateSnapshotsSuccess: function (
            subscribers: SubscriberCollection<T, K<T>>,
            snapshots: Snapshots<T, K<T>>
          ): void {
            throw new Error("Function not implemented.");
          },
          batchUpdateSnapshotsFailure: function (
            date: Date, 
            snapshotId: string, 
            snapshotManager: SnapshotManager<BaseData, BaseData>, 
            snapshot: Snapshot<BaseData, BaseData>,
            payload: { error: Error; }): void {
            throw new Error("Function not implemented.");
          },
          handleSnapshotSuccess: function (message: string, 
            snapshot: Snapshot<BaseData, BaseData>  | null,
            snapshotId: string
          ): void {
            throw new Error("Function not implemented.");
          },
          getSnapshotId: function (key: any, snapshot: Snapshot<BaseData, BaseData>): unknown {
            throw new Error("Function not implemented.");
          },
          compareSnapshotState: function (snapshot1: Snapshot<BaseData, BaseData>, snapshot2: Snapshot<BaseData, BaseData>): boolean {
            throw new Error("Function not implemented.");
          },
          payload: undefined,
          dataItems: null,
          newData: null,
          getInitialState: function () {
            throw new Error("Function not implemented.");
          },
          getConfigOption: function (optionKey: string) {
            throw new Error("Function not implemented.");
          },
          getTimestamp: function (): Date {
            throw new Error("Function not implemented.");
          },
          getStores: function (storeId: number, snapshotStores: SnapshotStore<BaseData, BaseData>[], snapshotStoreConfigs: SnapshotStoreConfig<BaseData, BaseData>[]): SnapshotStore<BaseData, BaseData>[] {
            throw new Error("Function not implemented.");
          },
          getData: function (id: string | number) {
            throw new Error("Function not implemented.");
          },
          setData: function (id: string, data: Map<string, Snapshot<BaseData, BaseData>>): void {
            throw new Error("Function not implemented.");
          },
          addData: function (id: string, data: Partial<Snapshot<BaseData, BaseData>>): void {
            throw new Error("Function not implemented.");
          },
          stores: null,
          getStore: function (
            storeId: number, 
            snapshotStore: SnapshotStore<BaseData, BaseData>, 
            snapshotId: string | null, 
            snapshot: Snapshot<BaseData, BaseData>, 
            snapshotStoreConfig: SnapshotStoreConfig<T, K<T>>,
            type: string, 
            event: Event
          ) {
            throw new Error("Function not implemented.");
          },
          addStore: function (
            snapshotId: string | null, 
            storeId: number, 
            snapshotStore: SnapshotStore<BaseData, BaseData>, 
            snapshot: Snapshot<BaseData, BaseData>, 
            type: string, 
            event: Event): SnapshotStore<BaseData, BaseData> | null {
            throw new Error("Function not implemented.");
          },
          mapSnapshot: function (
            id: number, 
            storeId: string | number,
            snapshotStore: SnapshotStore<BaseData, BaseData>, 
            snapshotContainer: SnapshotContainer<BaseData, BaseData>,
            snapshotId: string,
            criteria: CriteriaType,
            snapshot: Snapshot<BaseData, BaseData>,
            type: string, 
            event: Event, 
            callback: (snapshot: Snapshot<BaseData, BaseData>) => void, 
            mapFn: (item: T) => T
          ): Promise<string | undefined> | Snapshot<BaseData, BaseData> | null {
            throw new Error("Function not implemented.");
          },
          mapSnapshotWithDetails: function (
            storeId: number, 
            snapshotStore: SnapshotStore<BaseData, BaseData>, 
            snapshotId: string,
            snapshot: Snapshot<BaseData, BaseData>,
             type: string, event: Event, 
             callback: (snapshot: Snapshot<BaseData, BaseData>) => void)
             : SnapshotWithData<BaseData, BaseData> | null {
            throw new Error("Function not implemented.");
          },
          removeStore: function (
            storeId: number, 
            store: SnapshotStore<BaseData, BaseData>, 
            snapshotId: string,
            snapshot: Snapshot<BaseData, BaseData>, 
            type: string, 
            event: Event
          ): void {
            throw new Error("Function not implemented.");
          },
          unsubscribe: function (unsubscribeDetails: { userId: string; snapshotId: string; unsubscribeType: string; unsubscribeDate: Date; 
            unsubscribeReason: string; unsubscribeData: any; 
          }, 
          
            callback: Callback<Snapshot<BaseData, BaseData>> | null): void {
            throw new Error("Function not implemented.");
          },

          fetchSnapshot: async function (
            snapshotId: string,
            callback: (
              snapshotId: string,
              payload: FetchSnapshotPayload<BaseData, BaseData> | undefined,
              snapshotStore: SnapshotStore<BaseData, BaseData>,
              payloadData: any,
              category: Category | undefined,
              categoryProperties: CategoryProperties | undefined,
              timestamp: Date,
              data: Data<T, K<T>, Meta<T, K<T>>>,
              delegate: SnapshotWithCriteria<BaseData, BaseData>[]
              ) => Snapshot<BaseData, BaseData> | Promise<{ snapshot: Snapshot<BaseData, BaseData> }>
            ): Promise<{
              id: string;
              category: Category | string | symbol | undefined;
              categoryProperties: CategoryProperties | undefined;
              timestamp: Date;
              snapshot: Snapshot<BaseData, BaseData>;
              data: Data<T, K<T>, Meta<T, K<T>>>;
              delegate: SnapshotStoreConfig<BaseData, BaseData>[];
            }> {
            // Use callback and retrieve snapshot
            const result = await callback(
              "someSnapshotId",
              undefined,
              snapshotStore,
              payloadData,
              category,
              categoryProperties,
              new Date(),
              data,
              []
            );

            return {
              id: "someId",
              category: category,
              categoryProperties: categoryProperties || undefined,
              timestamp: new Date(),
              snapshot: result instanceof Snapshot ? result : result.snapshot,
              data: data,
              delegate: [] // Add logic for delegating if necessary
            };
          },
      
          fetchSnapshotSuccess: function (
            id: number,
            snapshotId: string, 
            snapshotStore: SnapshotStore<BaseData, BaseData>, 
            payload: FetchSnapshotPayload<BaseData, BaseData> | undefined, 
            snapshot: Snapshot<BaseData, BaseData>, 
            data: T, 
            delegate: SnapshotWithCriteria<BaseData, BaseData>[]
          ): void {
            throw new Error("Function not implemented.");
          },
          updateSnapshotFailure: function (
            snapshotId: number,
            snapshotManager: SnapshotManager<BaseData, BaseData>,
            snapshot: Snapshot<BaseData, BaseData>,
            date: Date | undefined,
            payload: { error: Error; }
          ): void {
            throw new Error("Function not implemented.");
          },
          fetchSnapshotFailure: function (
            snapshotId: number,
            snapshotManager: SnapshotManager<BaseData, BaseData>,
            snapshot: Snapshot<BaseData, BaseData>,
            date: Date | undefined,
            payload: { error: Error }
          ): void {
            throw new Error("Function not implemented.");
          },
          addSnapshotFailure: function (
            date: Date,
            snapshotManager: SnapshotManager<BaseData, BaseData>,
            snapshot: Snapshot<BaseData, BaseData>,
            payload: { error: Error; }): void {
            throw new Error("Function not implemented.");
          },
          configureSnapshotStore: function (
            snapshotStore: SnapshotStore<BaseData, BaseData>, 
            storeId: number, 
            data: Map<string, Snapshot<BaseData, BaseData>>, 
            events: Record<string, CalendarManagerStoreClass<BaseData, BaseData>[]>, 
            dataItems: RealtimeDataItem[], 
            newData: Snapshot<BaseData, BaseData>,
            payload: ConfigureSnapshotStorePayload<T, K>,
             store: SnapshotStore<any, K<T>>, 
             callback: (snapshotStore: SnapshotStore<BaseData, BaseData>) => void, 
            config: SnapshotStoreConfig<BaseData, BaseData>
          ): void {
            throw new Error("Function not implemented.");
          },
          updateSnapshotSuccess: function (snapshotId: number, snapshotManager: SnapshotManager<BaseData, BaseData>, snapshot: Snapshot<BaseData, BaseData>, payload?: { data?: any; }): void {
            throw new Error("Function not implemented.");
          },
          createSnapshotFailure: function (date: Date, snapshotId: number, snapshotManager: SnapshotManager<BaseData, BaseData>, snapshot: Snapshot<BaseData, BaseData>, payload: { error: Error; }): void {
            throw new Error("Function not implemented.");
          },
          createSnapshotSuccess: function (snapshotId: number, snapshotManager: SnapshotManager<BaseData, BaseData>, snapshot: Snapshot<BaseData, BaseData>, payload?: { data?: any; }): void {
            throw new Error("Function not implemented.");
          },
          createSnapshots: function (id: string, 
            snapshotId: number, snapshots: Snapshot<BaseData, BaseData>[],
            snapshotManager: SnapshotManager<BaseData, BaseData>,
            payload: CreateSnapshotsPayload<BaseData, BaseData>, 
            callback: (snapshots: Snapshot<BaseData, BaseData>[]) => void | null,
            snapshotDataConfig?: T[] | undefined, 
            category?: string | Category, categoryProperties?: string | CategoryProperties): Snapshot<BaseData, BaseData>[] | null {
            throw new Error("Function not implemented.");
          },
          onSnapshot: function (snapshotId: number, snapshot: Snapshot<BaseData, BaseData>, type: string, event: Event, callback: (snapshot: Snapshot<BaseData, BaseData>) => void): void {
            throw new Error("Function not implemented.");
          },
          onSnapshots: function (snapshotId: number, snapshots: Snapshots<T, K<T>>, type: string, event: Event, callback: (snapshots: Snapshots<T, K<T>>) => void): void {
            throw new Error("Function not implemented.");
          },
          parentId: null,
          childIds: null,
          getParentId: function (
            id: string,
            snapshot: Snapshot<SnapshotUnion<Data, Meta<T, K<T>>>, Data>
          ): string | null {
            throw new Error("Function not implemented.");
          },
          getChildIds: function (id: string, childSnapshot: Snapshot<BaseData, K<T>>): string[] {
            throw new Error("Function not implemented.");
          },
          addChild: function (parentId: string, childId: string, childSnapshot: Snapshot<BaseData, BaseData>): void {
            throw new Error("Function not implemented.");
          },
          removeChild: function (parentId: string, childId: string, childSnapshot: Snapshot<BaseData, BaseData>): void {
            throw new Error("Function not implemented.");
          },
          getChildren: function (id: string, childSnapshot: Snapshot<BaseData, BaseData>): Snapshot<BaseData, BaseData>[] {
            throw new Error("Function not implemented.");
          },
          hasChildren: function (id: string): boolean {
            throw new Error("Function not implemented.");
          },
          isDescendantOf: function (childId: string, parentId: string, parentSnapshot: Snapshot<BaseData, BaseData>, childSnapshot: Snapshot<BaseData, BaseData>): boolean {
            throw new Error("Function not implemented.");
          },
        }
      
      
      
        const setCategory = (newCategory: string) => {
          // Implement logic to set the category
          categoryName = newCategory;
        };
        const applyStoreConfig = (config: SnapshotStoreConfig<BaseData, BaseData>) => {
          // Implement logic to apply store configuration
          console.log("Applying store configuration:", config);
        };
        const generateId = () => 'generatedId'; // Implement ID generation logic if necessary

      
        
      
        // Create a snapshot configuration object
        const snapshotConfig: SnapshotConfig<BaseData, BaseData> = {
        id,
        category: categoryName || "defaultName",
        initialState,
        initialConfig,
        data,
        subscribers,
        timestamp: new Date(),
        snapshotData: async (
          id: string | number | undefined,
          snapshotId: number,
          data: Snapshot<T, K<T>>,
          mappedSnapshotData: Map<string, Snapshot<T, K<T>>> | null | undefined,
          snapshotData: SnapshotData<T, K<T>>,
          snapshotStore: SnapshotStore<T, K<T>>,
          category: symbol | string | Category | undefined,
          categoryProperties: CategoryProperties | undefined,
          dataStoreMethods: DataStore<BaseData, BaseData>
        ): Promise<SnapshotStore<BaseData, BaseData>> => {
          // Define your implementation here or pass the correct function
          return returnsSnapshotStore(String(id), snapshotData, category, categoryProperties, dataStoreMethods);
        },


        categoryProperties,
        storeConfig,
        removeSubscriber,
        onInitialize,
        onError: "",
        taskIdToAssign,
        snapshot,
        setCategory,
        applyStoreConfig,
        generateId,
        additionalData: {},
        };

      
        // Additional configuration logic if needed
        // Modify snapshotConfig based on conditions
              

        // Convert snapshotConfig into the correct type (Snapshot<SnapshotUnion<BaseData, Meta<T, K<T>>>, K>)
        const fullyConfiguredSnapshot: Snapshot<SnapshotUnion<BaseData, Meta<T, K<T>>>, K<T>> = {
          ...snapshotConfig,
          // Add any missing properties specific to `SnapshotUnion<BaseData, Meta<T, K<T>>>`
        };


        // Return the configured snapshot wrapped in a Promise as SnapshotStore<BaseData, BaseData>
        const snapshotStore: SnapshotStore< BaseData<any>, BaseData> = {
          id: id,
          key: key,
          keys: keys,
          config: storeConfig,
          snapshots: [fullyConfiguredSnapshot],
          topic: "",
          date: undefined,
          operation: {
            operationType: "/Users/dixiejones/data_analysis/frontend/buddease/src/app/components/snapshots/SnapshotActions".CreateSnapshot
          },
          title: "",
          category: undefined,
          categoryProperties: undefined,
          message: undefined,
          timestamp: undefined,
          createdBy: "",
          eventRecords: null,
          type: undefined,
          subscribers: [],
          store: undefined,
          stores: null,
          snapshotConfig: undefined,
          meta: undefined,
          snapshotMethods: undefined,
          getSnapshotsBySubscriber: undefined,
          getSnapshotsBySubscriberSuccess: undefined,
          getSnapshotsByTopic: undefined,
          getSnapshotsByTopicSuccess: undefined,
          getSnapshotsByCategory: undefined,
          getSnapshotsByCategorySuccess: undefined,
          getSnapshotsByKey: undefined,
          getSnapshotsByKeySuccess: undefined,
          getSnapshotsByPriority: undefined,
          getSnapshotsByPrioritySuccess: undefined,
          getStoreData: undefined,
          updateStoreData: undefined,
          updateDelegate: undefined,
          getSnapshotContainer: undefined,
          getSnapshotVersions: undefined,
          createSnapshot: undefined,
          dataStore: undefined,
          mapDataStore: undefined,
          snapshotStores: undefined,
          initialState: undefined,
          snapshotItems: [],
          nestedStores: [],
          snapshotIds: [],
          dataStoreMethods: undefined,
          delegate: undefined,
          initializedState: undefined,
          transformedDelegate: [],
          getSnapshotIds: [],
          getNestedStores: [],
          getFindSnapshotStoreById: undefined,
          snapshot: undefined,
          events: undefined,
          subscriberId: undefined,
          length: undefined,
          content: undefined,
          value: undefined,
          todoSnapshotId: undefined,
          snapshotStore: null,
          dataItems: [],
          newData: null,
          storeId: 0,
          restoreSnapshot: function (
            id: string, 
            snapshot: Snapshot<T, K>,
            snapshotId: string,
            snapshotData: SnapshotData<BaseData, Meta<T, K<T>>>, 
            category: Category | undefined, 
            callback: (snapshot: SnapshotUnion<BaseData, Meta<T, K<T>>>) => void, 
            snapshots: SnapshotsArray<T, K>, 
            type: string, 
            event: string | SnapshotEvents<T, K>,
            subscribers: SubscriberCollection<T, K>,
            snapshotContainer?: SnapshotUnion<BaseData, Meta<T, K<T>>> | undefined,
            snapshotStoreConfig?: SnapshotStoreConfig<SnapshotUnion<BaseData, Meta<T, K<T>>>, K<T>> | undefined): void {
            throw new Error("Function not implemented.");
          },
          snapshotStoreConfig: {} as SnapshotStoreConfig<BaseData<any, any, StructuredMetadata<any, any>, Attachment>, 
            BaseData<any, any, StructuredMetadata<any, any>, Attachment>, StructuredMetadata<T, K>, never>[],
          getSnapshotItems: function (): SnapshotItem<SnapshotUnion<BaseData, Meta<T, K<T>>>, K<T>>[] | undefined {
            throw new Error("Function not implemented.");
          },
          ensureDelegate: function (): SnapshotStoreConfig<SnapshotUnion<BaseData, Meta<T, K<T>>>, K<T>> {
            throw new Error("Function not implemented.");
          },
         
          handleDelegate: function <T extends (...args: any[]) => any, R = ReturnType<T>>(method: (delegate: any) => T, ...args: Parameters<T>): R | undefined {
            throw new Error("Function not implemented.");
          },
          notifySuccess: function (message: string): void {
            throw new Error("Function not implemented.");
          },
          notifyFailure: function (message: string): void {
            throw new Error("Function not implemented.");
          },
          findSnapshotStoreById: function (storeId: number): SnapshotStore<SnapshotUnion<BaseData, Meta>, K<T>> | null {
            throw new Error("Function not implemented.");
          },
          defaultSaveSnapshotStore: function (store: SnapshotStore<SnapshotUnion<BaseData, Meta>, K<T>>): Promise<void> {
            throw new Error("Function not implemented.");
          },
          saveSnapshotStore: function (store: SnapshotStore<SnapshotUnion<BaseData, Meta>, K<T>>): Promise<void> {
            throw new Error("Function not implemented.");
          },
          findIndex: function (predicate: (snapshot: Snapshot<SnapshotUnion<BaseData, Meta>, K<T>>) => boolean): number {
            throw new Error("Function not implemented.");
          },
          splice: function (index: number, count: number): void {
            throw new Error("Function not implemented.");
          },
       
          defaultCreateSnapshotStores: function (id: string, snapshotId: string, snapshot: Snapshot<SnapshotUnion<BaseData, Meta>, K<T>>, snapshotStore: SnapshotStore<SnapshotUnion<BaseData, Meta>, K<T>>, snapshotManager: SnapshotManager<SnapshotUnion<BaseData, Meta>, K<T>>, payload: CreateSnapshotStoresPayload<SnapshotUnion<BaseData, Meta>, K<T>>, callback: (snapshotStore: SnapshotStore<SnapshotUnion<BaseData, Meta>, K<T>>[]) => void | null, snapshotStoreData?: SnapshotStore<SnapshotUnion<BaseData, Meta>, K<T>>[] | undefined, category?: string | symbol | Category, snapshotDataConfig?: SnapshotStoreConfig<SnapshotWithCriteria<any, BaseData>, K<T>>[] | undefined): SnapshotStore<SnapshotUnion<BaseData, Meta>, K<T>>[] | null {
            throw new Error("Function not implemented.");
          },
          createSnapshotStores: function (id: string, snapshotId: string, snapshot: Snapshot<SnapshotUnion<BaseData, Meta>, K<T>>, snapshotStore: SnapshotStore<SnapshotUnion<BaseData, Meta>, K<T>>, snapshotManager: SnapshotManager<SnapshotUnion<BaseData, Meta>, K<T>>, payload: CreateSnapshotStoresPayload<SnapshotUnion<BaseData, Meta>, K<T>>, callback: (snapshotStore: SnapshotStore<SnapshotUnion<BaseData, Meta>, K<T>>[]) => void | null, snapshotStoreData?: SnapshotStore<SnapshotUnion<BaseData, Meta>, K<T>>[] | undefined, category?: string | symbol | Category, snapshotDataConfig?: SnapshotStoreConfig<SnapshotWithCriteria<any, BaseData>, K<T>>[] | undefined): void {
            throw new Error("Function not implemented.");
          },
          subscribeToSnapshots: function (snapshotId: string, callback: (snapshots: Snapshots<SnapshotUnion<BaseData, Meta>>) => Snapshot<SnapshotUnion<BaseData, Meta>, K<T>> | null, snapshot?: Snapshot<SnapshotUnion<BaseData, Meta>, K<T>> | null): null {
            throw new Error("Function not implemented.");
          },
          subscribeToSnapshot: function (snapshotId: string, callback: Callback<Snapshot<SnapshotUnion<BaseData, Meta>, K<T>>>, snapshot: Snapshot<SnapshotUnion<BaseData, Meta>, K<T>>): void {
            throw new Error("Function not implemented.");
          },
          defaultOnSnapshots: function (snapshotId: string, snapshots: Snapshots<SnapshotUnion<BaseData, Meta>>, type: string, event: Event, callback: (snapshots: Snapshots<SnapshotUnion<BaseData, Meta>>) => void): void {
            throw new Error("Function not implemented.");
          },
          onSnapshots: function (snapshotId: string, snapshots: Snapshots<SnapshotUnion<BaseData, Meta>>, type: string, event: Event, callback: (snapshots: Snapshots<SnapshotUnion<BaseData, Meta>>) => void): Promise<void | null> {
            throw new Error("Function not implemented.");
          },
          transformSubscriber: function (sub: Subscriber<SnapshotUnion<BaseData, Meta>, K<T>>): Subscriber<BaseData, K<T>> {
            throw new Error("Function not implemented.");
          },
          isSnapshotStoreConfig: function (item: any): item is SnapshotStoreConfig<SnapshotUnion<BaseData, Meta>, K<T>> {
            throw new Error("Function not implemented.");
          },
          transformDelegate: function (): SnapshotStoreConfig<SnapshotWithCriteria<any, BaseData>, K<T>>[] {
            throw new Error("Function not implemented.");
          },
          getSaveSnapshotStore: function (id: string, snapshotId: string, snapshot: Snapshot<SnapshotUnion<BaseData, Meta>, K<T>>, snapshotStore: SnapshotStore<SnapshotUnion<BaseData, Meta>, K<T>>, snapshotManager: SnapshotManager<SnapshotUnion<BaseData, Meta>, K<T>>, payload: CreateSnapshotStoresPayload<SnapshotUnion<BaseData, Meta>, K<T>>, callback: (snapshotStore: SnapshotStore<SnapshotUnion<BaseData, Meta>, K<T>>[]) => void | null, snapshotStoreData?: SnapshotStore<SnapshotUnion<BaseData, Meta>, K<T>>[] | undefined, category?: string | symbol | Category, snapshotDataConfig?: SnapshotStoreConfig<SnapshotWithCriteria<any, BaseData>, K<T>>[] | undefined): void {
            throw new Error("Function not implemented.");
          },
          getSaveSnapshotStores: function (id: string, snapshotId: string, snapshot: Snapshot<SnapshotUnion<BaseData, Meta>, K<T>>, snapshotStore: SnapshotStore<SnapshotUnion<BaseData, Meta>, K<T>>, snapshotManager: SnapshotManager<SnapshotUnion<BaseData, Meta>, K<T>>, payload: CreateSnapshotStoresPayload<SnapshotUnion<BaseData, Meta>, K<T>>, callback: (snapshotStore: SnapshotStore<SnapshotUnion<BaseData, Meta>, K<T>>[]) => void | null, snapshotStoreData?: SnapshotStore<SnapshotUnion<BaseData, Meta>, K<T>>[] | undefined, category?: string | symbol | Category, snapshotDataConfig?: SnapshotStoreConfig<SnapshotWithCriteria<any, BaseData>, K<T>>[] | undefined): void {
            throw new Error("Function not implemented.");
          },

          transformedSubscriber: function (
            sub: Subscriber<BaseData, BaseData>): Subscriber<BaseData, K<T>> {
            throw new Error("Function not implemented.");
          },
          getAllKeys: function (
            storeId: number, 
            snapshotId: string, 
            category: symbol | string | Category | undefined,
             categoryProperties: CategoryProperties | undefined, 
            snapshot: Snapshot<SnapshotUnion<BaseData, Meta>, K<T>> | null,
            
             timestamp: string | number | Date | undefined, 
             type: string, 
            event: Event,
            id: number, 
             snapshotStore: SnapshotStore<SnapshotUnion<BaseData, Meta>, K<T>>, 
            data: SnapshotUnion<BaseData, Meta>
          ): Promise<string[] | undefined> {
            throw new Error("Function not implemented.");
          },
          mapSnapshot: function (storeId: number, snapshotStore: SnapshotStore<SnapshotUnion<BaseData, Meta>, K<T>>, snapshotId: string, snapshot: Snapshot<SnapshotUnion<BaseData, Meta>, K<T>>, type: string, event: Event): Promise<Snapshot<SnapshotUnion<BaseData, Meta>, K<T>> | null> {
            throw new Error("Function not implemented.");
          },
          getAllItems: function (): Promise<Snapshot<SnapshotUnion<BaseData, Meta>, K<T>>[]> | undefined {
            throw new Error("Function not implemented.");
          },
          addData: function (data: Snapshot<SnapshotUnion<BaseData, Meta>, K<T>>): void {
            throw new Error("Function not implemented.");
          },
          addDataStatus: function (id: number, status: StatusType | undefined): void {
            throw new Error("Function not implemented.");
          },
          removeData: function (id: number): void {
            throw new Error("Function not implemented.");
          },
          updateData: function (id: number, newData: Snapshot<SnapshotUnion<BaseData, Meta>, K<T>>): void {
            throw new Error("Function not implemented.");
          },
          updateDataTitle: function (id: number, title: string): void {
            throw new Error("Function not implemented.");
          },
          updateDataDescription: function (id: number, description: string): void {
            throw new Error("Function not implemented.");
          },
          updateDataStatus: function (id: number, status: StatusType | undefined): void {
            throw new Error("Function not implemented.");
          },
          addDataSuccess: function (payload: { data: Snapshot<SnapshotUnion<BaseData, Meta>, K<T>>[]; }): void {
            throw new Error("Function not implemented.");
          },
          getDataVersions: function (id: number): Promise<Snapshot<SnapshotUnion<BaseData, Meta>, K<T>>[] | undefined> {
            throw new Error("Function not implemented.");
          },
          updateDataVersions: function (id: number, versions: Snapshot<SnapshotUnion<BaseData, Meta>, K<T>>[]): void {
            throw new Error("Function not implemented.");
          },
          getBackendVersion: function (): IHydrateResult<number> | Promise<string> {
            throw new Error("Function not implemented.");
          },
          getFrontendVersion: function (): Promise<string | number | undefined> {
            throw new Error("Function not implemented.");
          },
          fetchData: function (id: number): Promise<SnapshotStore<SnapshotUnion<BaseData, Meta>, K<T>>[]> {
            throw new Error("Function not implemented.");
          },
          defaultSubscribeToSnapshot: function (snapshotId: string, callback: Callback<Snapshot<SnapshotUnion<BaseData, Meta>, K<T>>>, snapshot: Snapshot<SnapshotUnion<BaseData, Meta>, K<T>>): string {
            throw new Error("Function not implemented.");
          },
          handleSubscribeToSnapshot: function (snapshotId: string, callback: Callback<Snapshot<SnapshotUnion<BaseData, Meta>, K<T>>>, snapshot: Snapshot<SnapshotUnion<BaseData, Meta>, K<T>>): void {
            throw new Error("Function not implemented.");
          },
          removeItem: function (key: string): Promise<void> {
            throw new Error("Function not implemented.");
          },
          getSnapshot: function (snapshot: (id: string) => Promise<{ snapshotId: number; snapshotData: SnapshotData<BaseData, Meta>; category: Category | undefined; categoryProperties: CategoryProperties; dataStoreMethods: DataStore<SnapshotUnion<BaseData, Meta>, K<T>>; timestamp: string | number | Date | undefined; id: string | number | undefined; snapshot: Snapshot<SnapshotUnion<BaseData, Meta>, K<T>>; snapshotStore: SnapshotStore<SnapshotUnion<BaseData, Meta>, K<T>>; data: SnapshotUnion<BaseData, Meta>; }> | undefined): Promise<Snapshot<SnapshotUnion<BaseData, Meta>, K<T>> | undefined> {
            throw new Error("Function not implemented.");
          },
          getSnapshotById: function (
            snapshot: (id: string) => Promise<{
              category: Category | undefined; 
              categoryProperties: CategoryProperties; 
              timestamp: string | number | Date | undefined; 
              id: string | number | undefined; 
              snapshot: Snapshot<SnapshotUnion<BaseData, Meta>, K<T>>;
              snapshotStore: SnapshotStore<SnapshotUnion<BaseData, Meta>, K<T>>;
              data: SnapshotUnion<BaseData, Meta>;
            }> | undefined): Promise<Snapshot<SnapshotUnion<BaseData, Meta>, K<T>> | null> {
            throw new Error("Function not implemented.");
          },
          getSnapshotSuccess: function (snapshot: Snapshot<SnapshotUnion<BaseData, Meta>, K<T>>, subscribers: Subscriber<T, K<T>>[]): Promise<SnapshotStore<SnapshotUnion<BaseData, Meta>, K<T>>> {
            throw new Error("Function not implemented.");
          },
          getSnapshotId: function (key: string | SnapshotData<SnapshotUnion<BaseData, Meta>, K<T>>): Promise<string | undefined> {
            throw new Error("Function not implemented.");
          },
          getSnapshotArray: function (): Promise<Snapshot<SnapshotUnion<BaseData, Meta>, K<T>>[]> {
            throw new Error("Function not implemented.");
          },
          getItem: function (key: SnapshotUnion<BaseData, Meta<T, K<T>>>): Promise<Snapshot<SnapshotUnion<BaseData, Meta<T, K<T>>>, K<T>> | undefined> {
            throw new Error("Function not implemented.");
          },
          setItem: function (key: string, value: Snapshot<SnapshotUnion<BaseData, Meta<T, K<T>>>, K<T>>): Promise<void> {
            throw new Error("Function not implemented.");
          },
          addSnapshotFailure: function (date: Date, snapshotManager: SnapshotManager<SnapshotUnion<BaseData, Meta<T, K<T>>>, K<T>>, snapshot: Snapshot<SnapshotUnion<BaseData, Meta<T, K<T>>>, K<T>>, payload: { error: Error; }): void {
            throw new Error("Function not implemented.");
          },
          addSnapshotSuccess: function (snapshot: SnapshotUnion<BaseData, Meta<T, K<T>>>, subscribers: SubscriberCollection<SnapshotUnion<BaseData, Meta<T, K<T>>>, K<T>>): void {
            throw new Error("Function not implemented.");
          },
          getParentId: function (id: string, snapshot: Snapshot<SnapshotUnion<BaseData, Meta<T, K<T>>>, K<T>>): string | null {
            throw new Error("Function not implemented.");
          },
          getChildIds: function (childSnapshot: Snapshot<SnapshotUnion<BaseData, Meta<T, K<T>>>, K<T>>): string[] {
            throw new Error("Function not implemented.");
          },
          addChild: function (parentId: string, childId: string, childSnapshot: Snapshot<T, K>): void {
            throw new Error("Function not implemented.");
          },
          compareSnapshotState: function (stateA: Snapshot<SnapshotUnion<BaseData, Meta<T, K<T>>>, K<T>> | Snapshot<SnapshotUnion<BaseData, Meta<T, K<T>>>, K<T>>[] | null | undefined, stateB: Snapshot<SnapshotUnion<BaseData, Meta<T, K<T>>>, K<T>> | null | undefined): boolean {
            throw new Error("Function not implemented.");
          },
          deepCompare: function (objA: any, objB: any): boolean {
            throw new Error("Function not implemented.");
          },
          shallowCompare: function (objA: any, objB: any): boolean {
            throw new Error("Function not implemented.");
          },
          getDataStoreMethods: function (): DataStoreMethods<SnapshotUnion<BaseData, Meta<T, K<T>>>, K<T>> {
            throw new Error("Function not implemented.");
          },
          getDelegate: function (context: { useSimulatedDataSource: boolean; simulatedDataSource: SnapshotStoreConfig<SnapshotUnion<BaseData, Meta>, K<T>>[]; }): Promise<SnapshotStoreConfig<SnapshotUnion<BaseData, Meta>, K<T>>[]> {
            throw new Error("Function not implemented.");
          },
          determineCategory: function (snapshot: string | Snapshot<SnapshotUnion<BaseData, Meta>, K<T>> | null | undefined): string {
            throw new Error("Function not implemented.");
          },
          determineSnapshotStoreCategory: function (
            storeId: number, 
            snapshotStore: SnapshotStore<BaseData, BaseData>, 
            configs: SnapshotStoreConfig<SnapshotUnion<BaseData, Meta>, K<T>>[]
          ): string {
            throw new Error("Function not implemented.");
          },
          determinePrefix: function <T extends Data>(snapshot: T | null | undefined, category: string): string {
            throw new Error("Function not implemented.");
          },
          updateSnapshot: function (snapshotId: string, data: Map<string, Snapshot<SnapshotUnion<BaseData, Meta>, K<T>>>, events: Record<string, CalendarManagerStoreClass<SnapshotUnion<BaseData, Meta>, K<T>>[]>, snapshotStore: SnapshotStore<SnapshotUnion<BaseData, Meta>, K<T>>, dataItems: RealtimeDataItem[], newData: Snapshot<SnapshotUnion<BaseData, Meta>, K<T>>, payload: UpdateSnapshotPayload<SnapshotUnion<BaseData, Meta>>, store: SnapshotStore<any, K<T>>): Promise<{ snapshot: Snapshot<SnapshotUnion<BaseData, Meta>, K<T>>; }> {
            throw new Error("Function not implemented.");
          },
          updateSnapshotSuccess: function (): void {
            throw new Error("Function not implemented.");
          },
          updateSnapshotFailure: function (
            snapshotId: string,
            snapshotManager: SnapshotManager<SnapshotUnion<BaseData, Meta>, K<T>>,
            snapshot: Snapshot<SnapshotUnion<BaseData, Meta>, K<T>>,
            date: Date | undefined,
            payload: { error: Error }
          ): void {
            // Implement the function logic here or throw the error for now
            throw new Error("Function not implemented.");
          },
          removeSnapshot: function (snapshotToRemove: Snapshot<SnapshotUnion<BaseData, Meta>, K<T>>): void {
            throw new Error("Function not implemented.");
          },
          clearSnapshots: function (): void {
            throw new Error("Function not implemented.");
          },
          // addSnapshot: function (
          //   snapshot: Snapshot<SnapshotUnion<BaseData, Meta>, K<T>>, 
          //   snapshotId: string, 
          //   subscribers: SubscriberCollection<SnapshotUnion<BaseData, Meta>, K<T>> | undefined
          // ): Promise<Snapshot<SnapshotUnion<BaseData, Meta>, K<T>> | undefined> {
          //   throw new Error("Function not implemented.");
          // },
          createInitSnapshot: function (id: string,
             initialData: SnapshotUnion<BaseData, Meta>,
            snapshotData: SnapshotData<SnapshotUnion<BaseData, Meta>, K<T>>, 
            category: Category): Promise<Snapshot<Data, K<T>>> {
            throw new Error("Function not implemented.");
          },
          createSnapshotSuccess: function (snapshotId: string, snapshotManager: SnapshotManager<SnapshotUnion<BaseData, Meta>, K<T>>, snapshot: Snapshot<SnapshotUnion<BaseData, Meta>, K<T>>, payload: { error: Error; }): void {
            throw new Error("Function not implemented.");
          },
          clearSnapshotSuccess: function (context: { useSimulatedDataSource: boolean; simulatedDataSource: SnapshotStoreConfig<SnapshotUnion<BaseData, Meta>, K<T>>[]; }): void {
            throw new Error("Function not implemented.");
          },
          clearSnapshotFailure: function (context: { useSimulatedDataSource: boolean; simulatedDataSource: SnapshotStoreConfig<SnapshotUnion<BaseData, Meta>, K<T>>[]; }): void {
            throw new Error("Function not implemented.");
          },
          createSnapshotFailure: function (snapshotId: string, snapshotManager: SnapshotManager<SnapshotUnion<BaseData, Meta>, K<T>>, snapshot: Snapshot<SnapshotUnion<BaseData, Meta>, K<T>>, payload: { error: Error; }): void {
            throw new Error("Function not implemented.");
          },
          setSnapshotSuccess: function (snapshotData: SnapshotData<SnapshotUnion<BaseData, Meta>, K<T>>, subscribers: ((data: Subscriber<SnapshotUnion<BaseData, Meta>, K<T>>) => void)[]): void {
            throw new Error("Function not implemented.");
          },
          setSnapshotFailure: function (error: Error): void {
            throw new Error("Function not implemented.");
          },
          updateSnapshots: function (): void {
            throw new Error("Function not implemented.");
          },
          updateSnapshotsSuccess: function (snapshotData: (subscribers: Subscriber<SnapshotUnion<BaseData, Meta>, K<T>>[], snapshot: Snapshots<SnapshotUnion<BaseData, Meta>>) => void): void {
            throw new Error("Function not implemented.");
          },
          updateSnapshotsFailure: function (error: Payload): void {
            throw new Error("Function not implemented.");
          },
          initSnapshot: function (snapshot: SnapshotStore<SnapshotUnion<BaseData, Meta>, K<T>> | Snapshot<SnapshotUnion<BaseData, Meta>, K<T>> | null, snapshotId: number, snapshotData: SnapshotData<SnapshotUnion<BaseData, Meta>, K<T>>, category: Category | undefined, categoryProperties: CategoryProperties | undefined, snapshotConfig: SnapshotStoreConfig<SnapshotUnion<BaseData, Meta>, K<T>>, callback: (snapshotStore: SnapshotStore<any, any>) => void): void {
            throw new Error("Function not implemented.");
          },
          takeSnapshot: function (snapshot: Snapshot<SnapshotUnion<BaseData, Meta>, K<T>>, subscribers?: Subscriber<SnapshotUnion<BaseData, Meta>, K<T>>[] | undefined): Promise<{ snapshot: Snapshot<SnapshotUnion<BaseData, Meta>, K<T>>; }> {
            throw new Error("Function not implemented.");
          },
          takeSnapshotSuccess: function (snapshot: Snapshot<SnapshotUnion<BaseData, Meta>, K<T>>): void {
            throw new Error("Function not implemented.");
          },
          takeSnapshotsSuccess: function (snapshots: SnapshotUnion<BaseData, Meta>[]): void {
            throw new Error("Function not implemented.");
          },
          configureSnapshotStore: function (
            snapshotStore: SnapshotStore<SnapshotUnion<BaseData, Meta>, K<T>>,
            snapshotId: string, 
            data: Map<string, Snapshot<SnapshotUnion<BaseData, Meta>, K<T>>>, 
            events: Record<string, CalendarManagerStoreClass<SnapshotUnion<BaseData, Meta>, K<T>>[]>,
            dataItems: RealtimeDataItem[],
            newData: Snapshot<SnapshotUnion<BaseData, Meta>, K<T>>, 
            payload: ConfigureSnapshotStorePayload<SnapshotUnion<BaseData, Meta>, K>,
            store: SnapshotStore<any, K<T>>,
            callback: (snapshotStore: SnapshotStore<SnapshotUnion<BaseData, Meta>, K<T>>) => void
          ): void {
            throw new Error("Function not implemented.");
          },
          updateSnapshotStore: function (snapshotStore: SnapshotStore<SnapshotUnion<BaseData, Meta>, K<T>>, snapshotId: string, data: Map<string, Snapshot<SnapshotUnion<BaseData, Meta>, K<T>>>, events: Record<string, CalendarManagerStoreClass<SnapshotUnion<BaseData, Meta>, K<T>>[]>, dataItems: RealtimeDataItem[], newData: Snapshot<SnapshotUnion<BaseData, Meta>, K<T>>, payload: ConfigureSnapshotStorePayload<SnapshotUnion<BaseData, Meta>>, store: SnapshotStore<any, K<T>>, callback: (snapshotStore: SnapshotStore<SnapshotUnion<BaseData, Meta>, K<T>>) => void): void {
            throw new Error("Function not implemented.");
          },
          flatMap: function <U extends Iterable<any>>(callback: (value: SnapshotStoreConfig<SnapshotUnion<BaseData, Meta>, K<T>>, index: number, array: SnapshotStoreConfig<SnapshotUnion<BaseData, Meta>, K<T>>[]) => U): U extends (infer I)[] ? I[] : U[] {
            throw new Error("Function not implemented.");
          },
          setData: function (data: Map<string, Snapshot<SnapshotUnion<BaseData, Meta>, K<T>>>): void {
            throw new Error("Function not implemented.");
          },
          getState: function () {
            throw new Error("Function not implemented.");
          },
          setState: function (state: any): void {
            throw new Error("Function not implemented.");
          },
          validateSnapshot: function (snapshotId: string, snapshot: Snapshot<SnapshotUnion<BaseData, Meta>, K<T>>): boolean {
            throw new Error("Function not implemented.");
          },
          handleSnapshot: function (id: string, snapshotId: number, snapshot: SnapshotUnion<BaseData, Meta> | null, snapshotData: SnapshotData<BaseData, Meta>, category: Category | undefined, categoryProperties: CategoryProperties | undefined, callback: (snapshot: SnapshotUnion<BaseData, Meta>) => void, snapshots: SnapshotsArray<SnapshotUnion<BaseData, Meta>>, type: string, event: Event, snapshotContainer?: SnapshotUnion<BaseData, Meta> | undefined, snapshotStoreConfig?: SnapshotStoreConfig<SnapshotUnion<BaseData, Meta>, K<T>> | undefined): Promise<Snapshot<SnapshotUnion<BaseData, Meta>, K<T>> | null> {
            throw new Error("Function not implemented.");
          },
          handleActions: function (action: (selectedText: string) => void): void {
            throw new Error("Function not implemented.");
          },
          setSnapshot: function (snapshot: Snapshot<SnapshotUnion<BaseData, Meta>, K<T>>): void {
            throw new Error("Function not implemented.");
          },
          transformSnapshotConfig: function (config: SnapshotConfig<T, K<T>>) {
            throw new Error("Function not implemented.");
          },
          setSnapshotData: function (snapshotStore: SnapshotStore<SnapshotUnion<BaseData, Meta>, K<T>>, data: Map<string, Snapshot<SnapshotUnion<BaseData, Meta>, K<T>>>, subscribers: Subscriber<SnapshotUnion<BaseData, Meta>, K<T>>[], snapshotData: Partial<SnapshotStoreConfig<SnapshotUnion<BaseData, Meta>, K<T>>>): Map<string, Snapshot<SnapshotUnion<BaseData, Meta>, K<T>>> {
            throw new Error("Function not implemented.");
          },
          filterInvalidSnapshots: function (snapshotId: string, state: Map<string, Snapshot<SnapshotUnion<BaseData, Meta>, K<T>>>): Map<string, Snapshot<SnapshotUnion<BaseData, Meta>, K<T>>> {
            throw new Error("Function not implemented.");
          },
          setSnapshots: function (snapshots: Snapshots<SnapshotUnion<BaseData, Meta>>): void {
            throw new Error("Function not implemented.");
          },
          clearSnapshot: function (): void {
            throw new Error("Function not implemented.");
          },
          mergeSnapshots: function (snapshots: Snapshots<SnapshotUnion<BaseData, Meta>>, category: string): void {
            throw new Error("Function not implemented.");
          },
          reduceSnapshots: function <U>(callback: (acc: U, snapshot: Snapshot<SnapshotUnion<BaseData, Meta>, K<T>>) => U, initialValue: U): U | undefined {
            throw new Error("Function not implemented.");
          },
          sortSnapshots: function (): void {
            throw new Error("Function not implemented.");
          },
          filterSnapshots: function (): void {
            throw new Error("Function not implemented.");
          },
          mapSnapshotsAO: function (storeIds: number[], snapshotId: string, category: Category | undefined, categoryProperties: CategoryProperties | undefined, snapshot: Snapshot<SnapshotUnion<BaseData, Meta>, K<T>>, timestamp: string | number | Date | undefined, type: string, event: Event, id: number, snapshotStore: SnapshotStore<SnapshotUnion<BaseData, Meta>, K<T>>, data: SnapshotUnion<BaseData, Meta>): Promise<SnapshotContainer<SnapshotUnion<BaseData, Meta>, K<T>>> {
            throw new Error("Function not implemented.");
          },
          mapSnapshots: function <U>(storeIds: number[], snapshotId: string, category: Category | undefined, categoryProperties: CategoryProperties | undefined, snapshot: Snapshot<SnapshotUnion<BaseData, Meta>, K<T>>, timestamp: string | number | Date | undefined, type: string, event: Event, id: number, snapshotStore: SnapshotStore<SnapshotUnion<BaseData, Meta>, K<T>>, data: SnapshotUnion<BaseData, Meta>, callback: (storeIds: number[], snapshotId: string, category: Category | undefined, categoryProperties: CategoryProperties | undefined, snapshot: Snapshot<SnapshotUnion<BaseData, Meta>, K<T>>, timestamp: string | number | Date | undefined, type: string, event: Event, id: number, snapshotStore: SnapshotStore<SnapshotUnion<BaseData, Meta>, K<T>>, data: T, index: number) => SnapshotsObject<SnapshotUnion<BaseData, Meta>>): Promise<SnapshotsArray<SnapshotUnion<BaseData, Meta>>> {
            throw new Error("Function not implemented.");
          },
          findSnapshot: function (predicate: (snapshot: Snapshot<SnapshotUnion<BaseData, Meta>, K<T>>) => boolean): Snapshot<SnapshotUnion<BaseData, Meta>, K<T>> | undefined {
            throw new Error("Function not implemented.");
          },
          getSubscribers: function (subscribers: Subscriber<SnapshotUnion<BaseData, Meta>, K<T>>[], snapshots: Snapshots<SnapshotUnion<BaseData, Meta>>): Promise<{ subscribers: Subscriber<SnapshotUnion<BaseData, Meta>, K<T>>[]; snapshots: Snapshots<SnapshotUnion<BaseData, Meta>>; }> {
            throw new Error("Function not implemented.");
          },
          notify: function (id: string, message: string, content: any, date: Date, type: NotificationType, notificationPosition?: NotificationPosition | undefined): void {
            throw new Error("Function not implemented.");
          },
          notifySubscribers: function (message: string, subscribers: Subscriber<SnapshotUnion<BaseData, Meta>, K<T>>[], data: Partial<SnapshotStoreConfig<SnapshotUnion<BaseData, Meta>, any>>): Subscriber<SnapshotUnion<BaseData, Meta>, K<T>>[] {
            throw new Error("Function not implemented.");
          },
          subscribe: function (): void {
            throw new Error("Function not implemented.");
          },
          unsubscribe: function (): void {
            throw new Error("Function not implemented.");
          },
          fetchSnapshot: function (callback: (snapshotId: string, payload: T<T>, snapshotStore: SnapshotStore<SnapshotUnion<BaseData, Meta>, K<T>>, payloadData: SnapshotUnion<BaseData, Meta> | Data, category: Category | undefined, categoryProperties: CategoryProperties | undefined, timestamp: Date, data: SnapshotUnion<BaseData, Meta>, delegate: SnapshotWithCriteria<SnapshotUnion<BaseData, Meta>, K<T>>[]) => void): Promise<{ id: any; category: Category | undefined; categoryProperties: CategoryProperties; timestamp: any; snapshot: Snapshot<SnapshotUnion<BaseData, Meta>, K<T>>; data: SnapshotUnion<BaseData, Meta>; getItem?: ((snapshot: Snapshot<SnapshotUnion<BaseData, Meta>, K<T>>) => Snapshot<SnapshotUnion<BaseData, Meta>, K<T>> | undefined) | undefined; }> {
            throw new Error("Function not implemented.");
          },
          fetchSnapshotSuccess: function (
            snapshotData: (
              snapshotManager: SnapshotManager<SnapshotUnion<BaseData, Meta>, K<T>>,
              subscribers: Subscriber<SnapshotUnion<BaseData, Meta>, K<T>>[],
              snapshot: Snapshot<SnapshotUnion<BaseData, Meta>, K<T>>) => void): void {
            throw new Error("Function not implemented.");
          },
          fetchSnapshotFailure: function (
            snapshotId: string,
            snapshotManager: SnapshotManager<T, K>,
            snapshot: Snapshot<T, K>,
            date: Date | undefined,
            payload: { error: Error }
          ): void {
            throw new Error("Function not implemented.");
          },
          getSnapshots: function (category: string, data: Snapshots<SnapshotUnion<BaseData, Meta>>): void {
            throw new Error("Function not implemented.");
          },
          getAllSnapshots: function (data: (subscribers: Subscriber<SnapshotUnion<BaseData, Meta>, K<T>>[], snapshots: Snapshots<SnapshotUnion<BaseData, Meta>>) => Promise<Snapshots<SnapshotUnion<BaseData, Meta>>>): void {
            throw new Error("Function not implemented.");
          },
          getSnapshotStoreData: function (snapshotStore: SnapshotStore<SnapshotUnion<BaseData, Meta>, K<T>>, snapshot: Snapshot<SnapshotUnion<BaseData, Meta>, K<T>>, snapshotId: string, snapshotData: SnapshotData<SnapshotUnion<BaseData, Meta>, K<T>>): SnapshotStore<SnapshotUnion<BaseData, Meta>, K<T>> {
            throw new Error("Function not implemented.");
          },
          generateId: function (): string {
            throw new Error("Function not implemented.");
          },
          batchFetchSnapshots: function (subscribers: Subscriber<SnapshotUnion<BaseData, Meta>, K<T>>[], snapshots: Snapshots<SnapshotUnion<BaseData, Meta>>): void {
            throw new Error("Function not implemented.");
          },
          batchTakeSnapshotsRequest: function (snapshotData: SnapshotData<SnapshotUnion<BaseData, Meta>, K<T>>): void {
            throw new Error("Function not implemented.");
          },
          batchUpdateSnapshotsRequest: function (
            snapshotData: (
              subscribers: SubscriberCollection<T, K>
            ) => Promise<{
            subscribers: SubscriberCollection<T, K>,
            snapshots: Snapshots<T, K>,
          }>): void {
            throw new Error("Function not implemented.");
          },
          batchFetchSnapshotsSuccess: function (subscribers: Subscriber<SnapshotUnion<BaseData, Meta>, K<T>>[], snapshots: Snapshots<SnapshotUnion<BaseData, Meta>>): void {
            throw new Error("Function not implemented.");
          },
          batchFetchSnapshotsFailure: function (payload: { error: Error; }): void {
            throw new Error("Function not implemented.");
          },
          batchUpdateSnapshotsSuccess: function (subscribers: Subscriber<SnapshotUnion<BaseData, Meta>, K<T>>[], snapshots: Snapshots<SnapshotUnion<BaseData, Meta>>): void {
            throw new Error("Function not implemented.");
          },
          batchUpdateSnapshotsFailure: function (payload: { error: Error; }): void {
            throw new Error("Function not implemented.");
          },
          batchTakeSnapshot: function (snapshotStore: SnapshotStore<SnapshotUnion<BaseData, Meta>, K<T>>, snapshots: Snapshots<SnapshotUnion<BaseData, Meta>>): Promise<{ snapshots: Snapshots<SnapshotUnion<BaseData, Meta>>; }> {
            throw new Error("Function not implemented.");
          },
          handleSnapshotSuccess: function (message: string, snapshot: Snapshot<BaseData, BaseData> | null, snapshotId: string): void {
            throw new Error("Function not implemented.");
          },
          isExpired: function (): boolean | undefined {
            throw new Error("Function not implemented.");
          },
          compress: function (): void {
            throw new Error("Function not implemented.");
          },
          auditRecords: [],
          encrypt: function (): void {
            throw new Error("Function not implemented.");
          },
          decrypt: function (): void {
            throw new Error("Function not implemented.");
          },
          [Symbol.iterator]: function (): IterableIterator<Snapshot<SnapshotUnion<BaseData, Meta>, K<T>>> {
            throw new Error("Function not implemented.");
          }
        };
      
        return Promise.resolve(snapshotStore);
      },
      
      

      configureSnapshotStore: () => { }, // Function to configure a snapshot store
      createSnapshotSuccess: () => { }, // Callback for successful snapshot creation
      createSnapshotFailure: () => { }, // Callback for failed snapshot creation
      batchTakeSnapshot: async (): Promise<void> => { }, // Function to batch take snapshots

      onSnapshot: () => { }, // Handler for snapshot events
      onSnapshotStore: () => { }, // Handler for snapshot store events
      snapshotData: '', // Data related to the snapshot
      mapSnapshot: () => { }, // Function to map snapshots

      createSnapshotStores: async (): Promise<void> => { }, // Function to create multiple snapshot stores
      initSnapshot: () => { }, // Function to initialize a snapshot
      subscribeToSnapshots: () => { }, // Function to subscribe to snapshot updates
      clearSnapshot: () => { }, // Function to clear a snapshot

      clearSnapshotSuccess: () => { }, // Callback for successful snapshot clearing
      handleSnapshotOperation: () => { }, // Function to handle snapshot operations
      displayToast: (message: string, type: string, duration: number, onClose: () => void) => { }, // Function to display a toast notification
      addToSnapshotList: (
        snapshot: Snapshot<BaseData, BaseData>,
        subscribers: Subscriber<T, K>[]
      ) => { }, // Function to add a snapshot to a list

      addToSnapshotStoreList: (store: SnapshotStore<BaseData, BaseData>) => { }, // Function to add a store to the list
      fetchInitialSnapshotData: async (): Promise<void> => { }, // Function to fetch initial snapshot data
      updateSnapshot: async (snapshot: Snapshot<BaseData, BaseData>) => { }, // Function to update a snapshot
      getSnapshots: async (): Promise<SnapshotsArray<BaseData>> => [], // Function to get all snapshots

      takeSnapshot: async (snapshot: Snapshot<BaseData, BaseData>): Promise<void> => { }, // Function to take a snapshot
      takeSnapshotStore: async (): Promise<void> => { }, // Function to take a snapshot store
      addSnapshot: async (snapshot: Snapshot<BaseData, BaseData>) => { }, // Function to add a snapshot
      addSnapshotSuccess: () => { }, // Callback for successful snapshot addition

      removeSnapshot: async (id: string) => { }, // Function to remove a snapshot
      getSubscribers: async (): Promise<Subscriber<BaseData, BaseData>[]> => [], // Function to get subscribers
      addSubscriber: (subscriber: Subscriber<BaseData, BaseData>) => { }, // Function to add a subscriber
      validateSnapshot: (snapshot: Snapshot<BaseData, BaseData>) => { }, // Function to validate a snapshot
      getSnapshot: (id: string): Promise<Snapshot<BaseData, BaseData> | null> => {
        return new Promise<Snapshot<BaseData, BaseData> | null>(async (resolve, reject) => {
          try {
            // Assume there's some asynchronous operation to fetch the snapshot.
            const snapshotStore = await fetchSnapshotStoreData(id); // Replace with your actual fetch logic



            // Assuming you have a way to get a specific snapshot from the snapshotStore
            const snapshot = snapshotStore.getSnapshotsByPriority.getSnapshotById(id); // Replace this with actual logic to retrieve the snapshot

            if (snapshot) {
              resolve(snapshot); // Successfully retrieved the snapshot
            } else {
              resolve(null); // No snapshot found, resolve with null
            }
          } catch (error) {
            console.error('Error fetching snapshot:', error);
            reject(error); // Reject the promise with the error
          }
        });
      }, // Function to get a snapshot by ID
      
      getSnapshotContainer<K extends Data>(
        id: string
      ): Promise<SnapshotContainer<SnapshotWithCriteria<Data, K>, K> | null> {
        return new Promise<SnapshotContainer<SnapshotWithCriteria<Data, K>, K> | null>(
          async (resolve, reject) => {
            try {
              // Fetch the snapshot store data using the provided id
              const snapshotStoreData = await fetchSnapshotStoreData(id);

              if (snapshotStoreData) {
                // Assuming snapshotStoreData needs to be transformed into SnapshotContainer
                const snapshotContainer: SnapshotContainer<SnapshotWithCriteria<Data, K>, K> = {
                  // Populate the necessary fields from snapshotStoreData
                  id: snapshotStoreData.id,
                  snapshots: snapshotStoreData.snapshots, 
                  criteria: snapshotStoreData.criteria, 
                  // Add other necessary fields and transformations
                };

                resolve(snapshotContainer);
              } else {
                resolve(null); // No data found for the given id
              }
            } catch (error) {
              console.error('Error fetching snapshot container:', error);
              reject(error); // Reject the promise with the error
            }
          }
        );
      }, // Function to get snapshot container
      getSnapshotVersions: async (id: string): Promise<SnapshotVersion[]> => [], // Function to get snapshot versions
      fetchData: async (): Promise<Data[]> => [], // Function to fetch data

      snapshotMethods: [], // List of snapshot methods
      getAllSnapshots: async (): Promise<SnapshotsArray<BaseData>> => [], // Function to get all snapshots
      getSnapshotStoreData: async (): Promise<SnapshotStore<BaseData, BaseData>> => ({}) as SnapshotStore<SnapshotWithCriteria<Data, any>, any>, // Function to get snapshot store data
      takeSnapshotSuccess: () => { }, // Callback for successful snapshot taking

      updateSnapshotFailure: () => { }, // Callback for failed snapshot update
      takeSnapshotsSuccess: () => { }, // Callback for successful snapshot taking
      fetchSnapshot: (
        id: string
      ): Promise<Snapshot<BaseData, BaseData> | null> => {
        return new Promise<Snapshot<BaseData, BaseData> | null>(async (resolve, reject) => {
          try {
            // Assume there's some asynchronous operation to fetch the snapshot.
            const snapshotStore = await fetchSnapshotStoreData(id); // Replace with your actual fetch logic

            if (snapshotStore) {
              const snapshot: Snapshot<BaseData, BaseData> = {
                id: snapshotStore.id,
                data: snapshotStore.data, // Assuming snapshotStore has a data property
                timestamp: snapshotStore.timestamp,
                snapshotStoreConfig: null,
                getSnapshotItems: snapshotStore.getSnapshotItems,
                defaultSubscribeToSnapshots: snapshotStore.defaultSubscribeToSnapshots,
                versionInfo: null,
                transformSubscriber: snapshotStore.transformSubscriber,
                transformDelegate: snapshotStore.transformDelegate,
                initializedState: undefined,
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
                getItem: snapshotStore.getItem,
                getDataStore: snapshotStore.getDataStore,
                getDataStoreMap: snapshotStore.getDataStoreMap,
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
                emit: snapshotStore.emit,
                createSnapshot: undefined,
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
                filterSnapshotsByStatus: undefined,
                filterSnapshotsByCategory: undefined,
                filterSnapshotsByTag: undefined,
                batchFetchSnapshotsSuccess: snapshotStore.batchFetchSnapshotsSuccess,
                batchFetchSnapshotsFailure: snapshotStore.batchFetchSnapshotsFailure,
                batchUpdateSnapshotsSuccess: snapshotStore.batchUpdateSnapshotsSuccess,
                batchUpdateSnapshotsFailure: snapshotStore.batchUpdateSnapshotsFailure,
                batchTakeSnapshot: snapshotStore.batchTakeSnapshot,
                handleSnapshotSuccess: snapshotStore.handleSnapshotSuccess,
                getSnapshotId: snapshotStore.getSnapshotId,
                compareSnapshotState: snapshotStore.compareSnapshotState,
                eventRecords: null,
                snapshotStore: null,
                getParentId: snapshotStore.getParentId,
                getChildIds: snapshotStore.getChildIds,
                addChild: snapshotStore.addChild,
                removeChild: snapshotStore.removeChild,
                getChildren: snapshotStore.getChildren,
                hasChildren: snapshotStore.hasChildren,
                isDescendantOf: snapshotStore.isDescendantOf,
                dataItems: null,
                payload: undefined,
                newData: null,
                getInitialState: snapshotStore.getInitialState,
                getConfigOption: snapshotStore.getConfigOption,
                getTimestamp: snapshotStore.getTimestamp,
                getStores: snapshotStore.getStores,
                getData: snapshotStore.getData,
                setData: snapshotStore.setData,
                addData: snapshotStore.addData,
                stores: null,
                getStore: snapshotStore.getStore,
                addStore: snapshotStore.addStore,
                mapSnapshot: snapshotStore.mapSnapshot,
                mapSnapshots: snapshotStore.mapSnapshots,
                removeStore: snapshotStore.removeStore,
                subscribe: snapshotStore.subscribe,
                unsubscribe: snapshotStore.unsubscribe,
                fetchSnapshotFailure: snapshotStore.fetchSnapshotFailure,
                fetchSnapshot: snapshotStore.fetchSnapshot,
                addSnapshotFailure: snapshotStore.addSnapshotFailure,
                configureSnapshotStore: snapshotStore.configureSnapshotStore,
                fetchSnapshotSuccess: snapshotStore.fetchSnapshotSuccess,
                updateSnapshotFailure: snapshotStore.updateSnapshotFailure,
                updateSnapshotSuccess: snapshotStore.updateSnapshotSuccess,
                createSnapshotFailure: snapshotStore.createSnapshotFailure,
                createSnapshotSuccess: snapshotStore.createSnapshotSuccess,
                createSnapshots: snapshotStore.createSnapshots,
                onSnapshot: snapshotStore.onSnapshot,
                onSnapshots: snapshotStore.onSnapshots,
                updateSnapshot: snapshotStore.updateSnapshot,
                label: undefined,
                events: undefined,
                handleSnapshot: snapshotStore.handleSnapshot,
                subscribeToSnapshots: snapshotStore.subscribeToSnapshots,
                meta: undefined,
                subscribers: []
              };
              resolve(snapshot);
            } else {
              resolve(null); // Resolve with null if no snapshot is found
            }
          } catch (err) {
            console.error('Error fetching snapshot:', err);
            reject(err); // Reject the promise with the error
          }
        });
      },

      // Function to fetch a snapshot
      addSnapshotToStore: async (snapshot: Snapshot<BaseData, BaseData>) => { }, // Function to add a snapshot to a store

      getSnapshotSuccess: () => { }, // Callback for successful snapshot retrieval
      setSnapshotSuccess: () => { }, // Callback for successful snapshot setting
      setSnapshotFailure: () => { }, // Callback for failed snapshot setting
      updateSnapshotSuccess: () => { }, // Callback for successful snapshot update

      updateSnapshotsSuccess: () => { }, // Callback for successful snapshot updates
      fetchSnapshotSuccess: () => { }, // Callback for successful snapshot fetch
      updateSnapshotForSubscriber: async (subscriberId: string) => { }, // Function to update snapshot for a subscriber
      updateMainSnapshots: async () => { }, // Function to update main snapshots

      batchProcessSnapshots: async (): Promise<void> => { }, // Function to batch process snapshots
      batchUpdateSnapshots: async (): Promise<void> => { }, // Function to batch update snapshots
      batchFetchSnapshotsRequest: async (): Promise<void> => { }, // Function to batch fetch snapshot requests

      batchTakeSnapshotsRequest: async (): Promise<void> => { }, // Function to batch take snapshot requests

      batchUpdateSnapshotsRequest: async (
        snapshotData: (
          subscribers: Subscriber<T, K>[]
        ) => Promise<{
            subscribers: Subscriber<T, K>[];
            snapshots: Snapshots<T, K>;
          }>
      ): Promise<void> => { }, // Function to batch update snapshot requests

      batchFetchSnapshots: async (): Promise<void> => { }, // Function to batch fetch snapshots
      getData: async (): Promise<Data[]> => [], // Function to get data
      batchFetchSnapshotsSuccess: () => { }, // Callback for successful batch fetch snapshots
      batchFetchSnapshotsFailure: () => { }, // Callback for failed batch fetch snapshots

      batchUpdateSnapshotsFailure: () => { }, // Callback for failed batch update snapshots
      notifySubscribers: () => { }, // Function to notify subscribers
      notify: () => { }, // Function to notify with some logic
      getCategory: (id: string): CategoryProperties | null => null, // Function to get a category by ID
      expirationDate: undefined, // Date when the snapshot expires, if applicable

      isExpired: (): boolean => {
        if (!this.expirationDate) return false;
        return new Date() > this.expirationDate;
      },

      priority: "Normal", // Default priority level, adjust based on `AllStatus` enum

      tags: {}, // Tags for categorizing or labeling snapshots

      metadata: {}, // Metadata for additional context

      status: undefined, // Status of the snapshot

      isCompressed: false, // Whether the snapshot is compressed

      compress: () => {
        // Logic to compress the snapshot
      },

      isEncrypted: false, // Whether the snapshot is encrypted

      encrypt: () => {
        // Logic to encrypt the snapshot
      },

      decrypt: () => {
        // Logic to decrypt the snapshot
      },

      ownerId: '', // ID of the owner of the snapshot

      getOwner: (): string => this.ownerId || '', // Function to get owner ID

      version: '', // Version of the snapshot

      previousVersionId: '', // ID of the previous version, if any

      nextVersionId: '', // ID of the next version, if any

      auditTrail: [], // Audit records for changes to the snapshot

      addAuditRecord: (record: AuditRecord) => {
        // Add a record to the audit trail
        this.auditTrail.push(record);
      },

      retentionPolicy: {}, // Policy for retaining the snapshot

      dependencies: [], // List of dependent snapshots or resources

      updateSnapshots: () => {
        // Logic to update snapshots
      },

      updateSnapshotsFailure: (error: Payload) => {
        // Handle failure in updating snapshots
      },

      flatMap: <U>(
        callback: (snapshot: Snapshot<BaseData, BaseData> | SnapshotStoreConfig<SnapshotWithCriteria<BaseData, any>, Meta, BaseData>, index: number, array: (Snapshot<BaseData, BaseData> | SnapshotStoreConfig<SnapshotWithCriteria<BaseData, any>, Meta, BaseData>)[]) => U
      ): U[] | void => {
        // Flatten and map over snapshots or configurations
        return (this.snapshots as any).flatMap(callback);
      },

      setData: (data: BaseData) => {
        // Set data in the snapshot
      },

      getState: (): any => {
        // Retrieve current state
        return this.state;
      },

      setState: (state: any) => {
        // Set current state
        this.state = state;
      },

      handleActions: (action: any) => {
        // Handle actions related to the snapshot
      },

      setSnapshots: (snapshots: Snapshots<BaseData>) => {
        // Set snapshots
        this.snapshots = snapshots;
      },

      mergeSnapshots: async (snapshots: Snapshots<BaseData>, category: string) => {
        // Merge provided snapshots with current ones
      },

      reduceSnapshots: <U>(callback: (acc: U, snapshot: Snapshot<BaseData, BaseData>) => U, initialValue: U): U => {
        // Reduce snapshots to a single value
        return (this.snapshots as any).reduce(callback, initialValue);
      },

      sortSnapshots: (compareFn: (a: Snapshot<BaseData, BaseData>, b: Snapshot<BaseData, BaseData>) => number) => {
        // Sort snapshots based on compare function
      },

      filterSnapshots: (predicate: (snapshot: Snapshot<BaseData, BaseData>) => boolean): Snapshot<BaseData, BaseData>[] => {
        // Filter snapshots based on predicate
        return (this.snapshots as any).filter(predicate);
      },

      findSnapshot: (predicate: (snapshot: Snapshot<BaseData, BaseData>) => boolean): Snapshot<BaseData, BaseData> | undefined => {
        // Find a snapshot based on predicate
        return (this.snapshots as any).find(predicate);
      },

      subscribe: (callback: (snapshot: Snapshot<BaseData, BaseData>) => void) => {
        // Subscribe to snapshot changes
      },

      unsubscribe: (callback: (snapshot: Snapshot<BaseData, BaseData>) => void) => {
        // Unsubscribe from snapshot changes
      },

      fetchSnapshotFailure: (payload: { error: Error }) => {
        // Handle failure in fetching snapshot
      },

      generateId: (): string => {
        // Generate a unique ID
        return 'unique-id'; // Replace with actual ID generation logic
      },

      useSimulatedDataSource: false, // Whether to use a simulated data source

      simulatedDataSource: [], // List of simulated snapshot store configurations

      [Symbol.iterator]: function* (): IterableIterator<BaseData> {
        // Iterator for snapshots or data
        for (const snapshot of this.snapshots) {
          yield snapshot;
        }
      },

      [Symbol.asyncIterator]: async function* (): AsyncIterableIterator<BaseData> {
        // Async iterator for snapshots or data
        for (const snapshot of this.snapshots) {
          yield snapshot;
        }
      },
    },

    id: "c5049",
    name: "configOption",
    // color: "red",
    snapshotId: "snapshot1",
    subscribers: [],
    onSnapshots: null,
    clearSnapshots: null,
    key: "",
    configOption: null,
    subscription: null,
    initialState: null,
    category: "",
    timestamp: new Date(),
    set: (data: any, type: string, event: Event) => {
      console.log(`Event type: ${type}`);
      console.log("Event:", event);
      return null;
    },
    data: null,
    store: null,
    state: null,
    snapshots: [],

    handleSnapshot: (
      id: number,
      snapshotId: string | null,
      snapshot: Snapshot<BaseData, BaseData> | null,
      snapshotData: SnapshotData<BaseData, BaseData>,
      category: Category | undefined,
      callback: (snapshot: Snapshot<BaseData, BaseData>) => void,
      snapshots: SnapshotsArray<BaseData>,
      type: string,
      event: Event,
      snapshotContainer?: Data,
      snapshotStoreConfig?: SnapshotStoreConfig<SnapshotWithCriteria<Data, K>, K>
    ): Promise<Snapshot<Data, K> | null> => {
      return new Promise((resolve, reject) => {
        try {
          console.log(`Handling snapshot with ID: ${snapshotId}`, snapshot);
          console.log("Snapshot data:", snapshotData);
          console.log("Category:", category);
          console.log("Callback:", callback);
          console.log("Snapshots:", snapshots);
          console.log("Type:", type);
          console.log("Event:", event);
          console.log("Snapshot container:", snapshotContainer);
          console.log("Snapshot store config:", snapshotStoreConfig);

          // Example processing based on type
          let result: Snapshot<BaseData, BaseData> | null = null;

          switch (type) {
            case 'create':
              // Create a new snapshot
              result = { ...snapshotData } as Snapshot<BaseData, BaseData>;
              break;
            case 'update':
              // Update an existing snapshot
              if (snapshot) {
                result = { ...snapshot, ...snapshotData } as Snapshot<BaseData, BaseData>;
              }
              break;
            case 'process':
              // Process or transform the snapshot data
              if (snapshotContainer) {
                result = { ...snapshotContainer, ...snapshotData } as Snapshot<BaseData, BaseData>;
              }
              break;
            default:
              throw new Error(`Unknown snapshot type: ${type}`);
          }

          // Execute the callback function
          callback(snapshotData);

          // Resolve with the result
          resolve(result);
        } catch (error) {
          // Handle any errors and reject the promise
          console.error("Error handling snapshot:", error);
          reject(error);
        }
      })
    },
    onInitialize: () => {
      console.log("Snapshot store initialized.");
    },
    onError: (error: any) => {
      console.error("Error in snapshot store:", error);
    },

    createSnapshot: (
      id: string,
      snapshotData: SnapshotData<BaseData, BaseData>,
      category: symbol | string | Category | undefined,
      categoryProperties: CategoryProperties | undefined,
      callback?: (snapshot: Snapshot<BaseData, BaseData>) => void,
      snapshotStore?: SnapshotStore<BaseData, BaseData>,
      snapshotStoreConfig?: SnapshotStoreConfig<Data, K> | null,
      snapshotStoreConfigSearch?: SnapshotStoreConfig<
      SnapshotWithCriteria<any, BaseData>,
      K
    >
    ): Snapshot<BaseData, BaseData> | null => {
      console.log(
        `Creating snapshot with ID: ${id} in category: ${String(category)}`,
        snapshotStoreConfig
      );

      // Define event handling
      const eventHandlers: { [event: string]: ((snapshot: Snapshot<BaseData, BaseData>) => void)[] } = {};

      // Return a Snapshot object
      return {
        id,
        data: snapshotData, // Ensure snapshotData is of type Snapshot<BaseData, BaseData>
        category,
        snapshotItems: [],
        meta: {} as Map<string, Snapshot<Data, any>>,
        configOption: snapshotStoreConfig, // Ensure snapshotDataConfig is of type SnapshotStoreConfig<any, any>
        dataItems: [],
        newData: null,
        stores: [],
        timestamp: new Date(),
        handleSnapshot: (
          id: string,
          snapshotId: string | number | null,
          snapshot: T | null,
          snapshotData: T,
          category: Category | undefined,
          callback: (snapshot: T) => void,
          snapshots: Snapshots<Data>,
          type: string,
          event: Event,
          snapshotContainer?: T,
          snapshotStoreConfig?: SnapshotStoreConfig<SnapshotWithCriteria<Data, K>, K>,

        ): Promise<Snapshot<T, K>> => {
          console.log(`Handling snapshot with ID: ${snapshotId}`, snapshot);

          // Handle snapshot based on its existence
          if (snapshot === null) {
            console.error("No snapshot found for ID:", snapshotId);
            // You might need to return a default or empty Snapshot<T, K>
            return Promise.resolve({
              id: snapshotId,
              data: {} as Snapshot<T, K>,
              category,
              snapshotItems: [],
              meta: new Map(),
              configOption: {},
              dataItems: [],
              newData: null,
              stores: [],
              timestamp: new Date(),
              versionInfo: {} as VersionHistory,
              snapshotStoreConfig: snapshotStoreConfigInstance,
              getSnapshotItems: "",
              defaultSubscribeToSnapshots: "",
              transformSubscriber: "",
              transformDelegate: "",
              initializedState, 
              getAllKeys,
              getAllItems, 
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
              removeItem,
              getSnapshot,
              getSnapshotSuccess,
             
              setItem,
              getDataStore,
              getDataStoreMap,
              addSnapshotSuccess,

            });
          }

          console.log("Snapshot:", snapshot);
          return Promise.resolve(snapshot as unknown as Snapshot<Data, any>);
        },
        events: {
          eventRecords: {
            add: [],
            remove: [],
            update: [],
          },
          callbacks: (
            snapshots: Snapshots<Data>
          ) => {
            // Handle event callbacks
            console.log("Event callbacks:", snapshots);
          },
          subscribers: [],
          eventIds: [],
          on: (event: string, callback: (snapshot: Snapshot<T, K>) => void) => {
            if (!eventHandlers[event]) {
              eventHandlers[event] = [];
            }
            eventHandlers[event].push(callback);
            console.log(`Event '${event}' registered.`);
          },
          off: (event: string, callback: (snapshot: Snapshot<T, K>) => void) => {
            if (eventHandlers[event]) {
              eventHandlers[event] = eventHandlers[event].filter(cb => cb !== callback);
              console.log(`Event '${event}' unregistered.`);
            }
          }
        },
        getSnapshotId: (
          snapshotData: SnapshotData<T, K>,
        ) => {
          console.log("Getting snapshot ID");

          console.log("Snapshot data:", snapshotData);
          return null;
        },
        compareSnapshotState: (snapshot: Snapshot<T, K>) => {
          console.log("Comparing snapshot state:", snapshot);
          return null;
        },
        eventRecords: {
          add: [],
          remove: [],
          update: [],
        },
        snapshotStore: null,

        subscribe: (
          subscriber: Subscriber<Data, any> | null,
          snapshot: Snapshot<Data, any>,
          event: Event,
          callback: Callback<Snapshot<Data, any>>,
          value: Data
        ): void => {
          console.log("Subscribed to snapshot:", subscriber, snapshot, event, callback, value);
          // Example usage of the callback
          if (callback) {
            callback(snapshot);
          }
        },
        unsubscribe: (callback: (snapshot: Snapshot<T, K>) => void) => {
          console.log("Unsubscribed from snapshot:", callback);
        },
        fetchSnapshotFailure: (
          snapshotManager: SnapshotManager<T, K>,
          snapshot: Snapshot<T, K>,
          payload: { error: Error }
        ) => {
          console.log("Fetching snapshot:", snapshot);
          console.error("Error fetching snapshot:", payload.error);
        },
        fetchSnapshotSuccess: (
          snapshotManager: SnapshotManager<T, K>,
          snapshot: Snapshot<T, K>,
        ) => {
          console.log("Fetching snapshot:", snapshot);
        },

        fetchSnapshot: (
          callback: (
            snapshotId: string,
            payload: FetchSnapshotPayload<K>,
            snapshotStore: SnapshotStore<T, K>,
            payloadData: T | Data,
            category: Category | undefined,
            timestamp: Date,
            data: T,
            delegate: SnapshotWithCriteria<SnapshotWithCriteria<Data, K>, K>[]
          ) => Snapshot<T, K>
        ): Snapshot<T, K> => {
          console.log("Fetching snapshot with ID:", snapshotId);
          if (snapshotId === "snapshot1") {
            callback({
              id: "snapshot1",
              data: {
                name: "John Doe",
                age: 30,
                timestamp: new Date().getTime(),
              },
              category: "user",
              snapshotItems: [],
              meta: new Map(),
              configOption: null,
              dataItems: [],
              newData: null,
              stores: [],
              timestamp: new Date(),
              handleSnapshot: (snapshotId: string, snapshot: Snapshot<T, K> | null
              ): Promise<Snapshot<Data, any> | null> => {
                console.log(`Handling snapshot with ID: ${snapshotId}`, snapshot);
                if (snapshot) {
                  console.log("Snapshot:", snapshot);
                }
                return Promise.resolve(snapshot);
              },
              eventIds: [],
              events: {
                eventRecords: {
                  add: [],
                  remove: [],
                  update: [],
                },
                callbacks: (snapshots: Snapshots<T, K>) => {
                  if (snapshots.length > 0) {
                    console.log("Snapshots:", snapshots);
                  }
                },
              },
              on: (event: string, callback: (snapshot: Snapshot<T, K>) => void) => {
                if (!eventHandlers[event]) {
                  eventHandlers[event] = [];
                }
                eventHandlers[event].push(callback);
                console.log(`Event '${event}' registered.`);
              },
              getSnapshotId: () => { },
              compareSnapshotState: (snapshot: Snapshot<T, K>) => {
                console.log("Comparing snapshot state:", snapshot);
                return null;
              },
              eventRecords: {
                add: [],
                remove: [],
                update: [],
              },
              snapshotStore: null,
              unsubscribe: (callback: (snapshot: Snapshot<T, K>) => void) => {
                console.log("Unsubscribed from snapshot:", callback);
              },

              configureSnapshotStore: (
                snapshotStore: SnapshotStore<T, K>,
                snapshotId: string,
                data: Map<string, Snapshot<Data, any>>,
                events: Record<string, CalendarEvent<SnapshotWithCriteria<Data, K>, K>[]>,
                dataItems: RealtimeDataItem[],
                newData: Snapshot<T, K>,
                payload: ConfigureSnapshotStorePayload<T, K>,
                store: SnapshotStore<any, K>
              ) => {
                console.log("Configuring snapshot store:", snapshotStore);
                snapshotStore.configureSnapshotStore(snapshotStore, snapshotId, data, events, dataItems, newData, payload, store, callback);
              },

              updateSnapshotSuccess: (
                snapshotId: string,
                snapshotManager: SnapshotManager<T, K>,
                snapshot: Snapshot<T, K>) => {
                console.log("Updating snapshot:", snapshotId, snapshot);
              },
              createSnapshotFailure: (
                snapshotId: string,
                snapshotManager: SnapshotManager<T, K>,
                snapshot: Snapshot<T, K>,
                payload: { error: Error }
              ): Promise<void> => {
                console.log("Creating snapshot failure:", snapshotId, snapshotManager, snapshot);
                return Promise.resolve();
              },
              getParentId: () => "",
              getChildIds: () => [],
              addChild: (snapshot: Snapshot<T, K>) => {
                console.log("Adding snapshot:", snapshot);
              },
              removeChild: (snapshot: Snapshot<T, K>) => {
                console.log("Removing snapshot:", snapshot);
              },
              getChildren: () => [],
              hasChildren: () => false,
              isDescendantOf: (snapshot: Snapshot<T, K>) => false,
              getStore: (
                storeId: number,
                snapshotId: string,
                snapshot: Snapshot<T, K>,
                type: string,
                event: Event
              ) => null,
              addStore: (
                storeId: number,
                snapshotId: string,
                store: SnapshotStore<T, K>,
                snapshot: Snapshot<T, K>,
                type: string,
                event: Event
              ) => {
                console.log("Adding store:", storeId, store, snapshotId, snapshot, type, event);
                return store;
              },
              mapSnapshot(
                snapshotId: string,
                snapshot: Snapshot<Data, any>,
                type: string, event: Event
              ): Snapshot<T, K> {
                console.log("Mapping snapshot:", snapshot);
                return snapshot;
              },
              removeStore(
                storeId: number,
                store: SnapshotStore<T, K>,
                snapshotId: string,
                snapshot: Snapshot<T, K>,
                type: string,
                event: Event
              ): Snapshot<T, K> {
                console.log("Removing store:", storeId, store, snapshotId, snapshot, type, event);
                return snapshot;
              },
            })
          }
          return
        },
       
        updateSnapshot: (
          snapshotId: string,
          // oldSnapshot: Snapshot<T, K>,
          data: Map<string, Snapshot<Data, any>>,
          events: Record<string, CalendarManagerStoreClass<SnapshotWithCriteria<Data, K>, K>[]>, // Added prop,
          snapshotStore: SnapshotStore<T, K>,
          dataItems: RealtimeDataItem[],
          newData: Snapshot<T, K>,
          payload: UpdateSnapshotPayload<T>,
          store: SnapshotStore<any, K>
        ) => {
          console.log("Updating snapshot:", newData);
        },
        updateSnapshotFailure: (
          snapshotManager: SnapshotManager<T, K>,
          snapshot: Snapshot<BaseData, BaseData>,
          payload: { error: Error }
        ) => {
          console.log("Error in updating snapshot:", payload);
        },
        updateSnapshotSuccess: (snapshot: Snapshot<T, K>) => {
          console.log("Updated snapshot:", snapshot);
        },
        updateSnapshotItem: (snapshotItem: SnapshotItem) => {
          console.log("Updating snapshot item:", snapshotItem);
        },
        // other properties if any
      }
    },
    snapshotStore: {
      configureSnapshotStore: (
        snapshotStore: SnapshotStore<T, K>,
        snapshotId: string,
        data: Map<string, Snapshot<Data, any>>,
        events: Record<string, CalendarEvent<SnapshotWithCriteria<Data, K>, K>[]>,
        dataItems: RealtimeDataItem[],
        newData: Snapshot<T, K>,
        payload: ConfigureSnapshotStorePayload<T, K>,
        store: SnapshotStore<any, K>
      ) => {
        console.log("Configuring snapshot store:", snapshotStore);
      },
      updateSnapshotStore: (
        snapshotStore: SnapshotStore<T, K>, // Current snapshot store
        snapshotId: string,
        data: Map<string, Snapshot<T, K>>,
        events: Record<string, CalendarManagerStoreClass<SnapshotWithCriteria<Data, K>, K>[]>,
        dataItems: RealtimeDataItem[],
        newData: Snapshot<T, K>, // New snapshot data
        payload: ConfigureSnapshotStorePayload<T, K>,
        store: SnapshotStore<any, K>, // New snapshot store after update
        callback: (snapshotStore: SnapshotStore<T, K>) => void
        // New snapshot store after update
      ): SnapshotStore<T, K> => {
        console.log("Updating snapshot:", newData);
        return store;
      },
    },

    createSnapshotStores(
      id: string,
      snapshotId: string,
      snapshot: Snapshot<T, K>,
      snapshotStore: SnapshotStore<T, K>,
      snapshotManager: SnapshotManager<T, K>,
      payload: CreateSnapshotStoresPayload<SnapshotWithCriteria<Data, K>, K>,
      callback: (snapshotStore: SnapshotStore<T, K>[]) => void | null,
      snapshotStoreData?: SnapshotStore<T, K>[],
      category?: string | symbol | Category,
      snapshotDataConfig?: SnapshotStoreConfig<T, K>[]
    ): SnapshotStore<T, K>[] | null {
      console.log(`Creating snapshot stores with ID: ${id} in category: ${category}`, snapshotDataConfig);

      // Example logic to create snapshot stores
      const newSnapshotStores: SnapshotStore<T, K>[] = snapshotStoreData ?? [];

      // Perform additional operations as required

      // Invoke callback if provided
      if (callback) {
        callback(newSnapshotStores);
      }

      // Return the array of SnapshotStore objects
      return newSnapshotStores.length > 0 ? newSnapshotStores : null;
    },

    // Alternate createSnapshotStores definition
    createSnapshotStoresAlternate: (
      id: string,
      snapshotStoresData: SnapshotStore<any, any>[], // Use Snapshot instead of Map
      category: Category | undefined,
      callback: (snapshotStores: SnapshotStore<any, any>[]) => void,
      snapshotDataConfig?: SnapshotStoreConfig<any, any>[] // Adjust as per your definition
    ): SnapshotStore<any, any>[] | null => {
      console.log(`Creating snapshot with ID: ${id} in category: ${category}`, snapshotDataConfig);

      // Call the callback function with the snapshotStoresData
      callback(snapshotStoresData);

      // Return the array of SnapshotStore objects
      return snapshotStoresData;
    },


    createSnapshotStore:  <T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(
      id: string,
      storeId: number,
      snapshotId: string,
      snapshotStoreData: SnapshotStore<T, K>[],
      category: Category | undefined,
      categoryProperties: CategoryProperties | undefined,
      callback: (snapshotStore: SnapshotStore<T, K>) => void,
      snapshotDataConfig?: SnapshotStoreConfig<T, K>[] // Array of SnapshotStoreConfig objects
    ): SnapshotStore<T, K> | null => {
      console.log(
        `Creating snapshot with ID: ${id} in category: ${category}`,
        snapshotDataConfig
      );

      const tags: TagsRecord = {
        "1": {
          id: "tag id",
          name: "tag name",
          color: "#000000",
          tag: "field",
          value: "value",
          relatedTags: []
        },
      };

      const portfolioUpdatesLastUpdated: PortfolioUpdatesLastUpdated = null; // Example initialization

      // Return a SnapshotStore object
      return {
        id,
        category,
        state: snapshotStoreData, // This is an array of Snapshot objects
        snapshotId: snapshotId || 'defaultSnapshotId', // Provide a default value if snapshotId is undefined
        // snapshotManager: null, // Provide a default value if snapshotManager is undefined
        snapshotStoreConfig: snapshotDataConfig || [], // Provide a default value if snapshotStoreConfig is undefined
        findIndex: () => -1,
        splice: () => null,
        key: "snapshot store",
        keys: [],
        topic: "snapshot topic",
        date: new Date(),
        config: [],
        title: "createSnapshotStore",
        message: "creating snapshot store",
        configOption: "default config option",
        subscription: {
          unsubscribe: () => { },
          portfolioUpdates: portfolioUpdates,
          tradeExecutions: tradeExections,
          marketUpdates: getMarketUpdates,
          triggerIncentives: triggerIncentives,
          communityEngagement: getCommunityEngagement,
          determineCategory: determineCategory,
          portfolioUpdatesLastUpdated: portfolioUpdatesLastUpdated,
        },
        description: "snapshot description",
        timestamp: new Date(),
        createdBy: "John Doe",
        eventRecords: {},
        type: "snapshot",
        subscribers: [],
        set: () => { },
        setStore: () => { },
        data: {} as T | Map<string, Snapshot<T, K>> | null | undefined,
        store: {} as SnapshotStore<T, K>,
        stores: [],
        snapshots: [],
        expirationDate: new Date(),
        priority: undefined,
        tags: tags,
        metadata: undefined,
        meta: new Map<string, Snapshot<T, K>>(),
        status: undefined,
        isCompressed: false,
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
        deleteSnapshot: "",
        // other properties if any
      };
    },


    configureSnapshotStore: (
      snapshotStore: SnapshotStore<T, K>,
      snapshotId: string,
      data: Map<string, Snapshot<T, K>>,
      events: Record<string, CalendarManagerStoreClass<T, K>[]>,
      dataItems: RealtimeDataItem[],
      newData: Snapshot<T, K>,
      payload: ConfigureSnapshotStorePayload<T, K>,
      store: SnapshotStore<any, K>,
      callback: (snapshotStore: SnapshotStore<T, K>) => void
    ): Promise<{
      snapshotStore: SnapshotStore<T, K>, 
      storeConfig: SnapshotStoreConfig<T, K>,
      updatedStore?: SnapshotStore<T, K>
    }> => {
      console.log("Configuring snapshot store:", snapshotStore, "with ID:", snapshotId);
    },

    batchTakeSnapshot: async (
      snapshotStore: SnapshotStore<T, K>,
      snapshots: Snapshots<T, K>
    ) => {
      console.log("Batch taking snapshots:", snapshotStore, snapshots);
      return { snapshots };
    },

    onSnapshot: (
      snapshotId: string,
      snapshot: Snapshot<any, any>,
      type: string, event: Event,
      callback: (snapshot: Snapshot<any, any>

      ) => void) => {
      console.log("Snapshot taken:", snapshot, "Type:", type, "Event:", event);
    },

    initSnapshot: (
      snapshot: SnapshotStore<T, K> | Snapshot<T, K> | null,
      snapshotId: string | null,
      snapshotData: SnapshotData<T, K>,
      category: Category | undefined,
      snapshotDataConfig: SnapshotStoreConfig<any, any>, // Adjust as per your definition
      callback: (snapshotStore: SnapshotStore<any, any>) => void
    ) => {
      console.log(
        `Initializing snapshot with ID: ${snapshotId} in category: ${category}`,
        snapshotDataConfig
      );
      return { snapshot };
    },

    clearSnapshot: () => {
      console.log("Clearing snapshot.");
    },

    updateSnapshot: async (
      snapshotId: string,
      data: Map<string, BaseData>,
      events: Record<string, CalendarManagerStoreClass<SnapshotWithCriteria<BaseData, BaseData>, Meta, BaseData>[]>,
      snapshotStore: SnapshotStore<T, K>,
      dataItems: RealtimeDataItem[],
      newData: Snapshot<BaseData, BaseData>,
      payload: UpdateSnapshotPayload<T>,
      store: SnapshotStore<any, any>
    ) => {
      console.log(
        `Updating snapshot with ID: ${snapshotId}`,
        newData,
        payload
      );
      return { snapshot: newData };
    },
    getSnapshots: async (category: Category, 
      snapshots: napshotsArray<Data>,
    ) => {
      console.log(`Getting snapshots in category: ${category}`, snapshots);
      return { snapshots };
    },

    takeSnapshot: async (snapshot: SnapshotStore<T, K>) => {
      console.log("Taking snapshot:", snapshot);
      return { snapshot: snapshot }; // Adjust according to your snapshot logic
    },

    // addSnapshot: (snapshot: Snapshot<T, K>) => {
    //   console.log("Adding snapshot:", snapshot);
    // },

    removeSnapshot: (snapshotToRemove: SnapshotStore<T, K>) => {
      console.log("Removing snapshot:", snapshotToRemove);
    },

    getSubscribers: async (
      subscribers: SubscriberCollection<SnapshotWithCriteria<Data, K>, K>,
      snapshots: Snapshots<BaseData>
    ) => {
      console.log("Getting subscribers:", subscribers, snapshots);
      return { subscribers, snapshots };
    },
    addSubscriber: (subscriber: Subscriber<BaseData, K>) => {
      console.log("Adding subscriber:", subscriber);
    },

    // Implementing the snapshot function
    snapshot: async (
      id: string,
      snapshotId: string | null,
      snapshotData: SnapshotData<T, K>,
      category: Category | undefined,
      callback: (snapshotStore: Snapshot<T, K>) => void
    ) => {
      try {
        let resolvedCategory: CategoryProperties | undefined;

        if (typeof category === "string") {
          resolvedCategory = await fetchCategoryByName(category);
        } else {
          resolvedCategory = category;
        }

        if (resolvedCategory) {
          snapshotConfig[0].createSnapshot(
            id,
            snapshotData,
            resolvedCategory,
            callback
          );

          const { snapshotStore: newSnapshot } =
            await snapshotConfig[0].snapshot(
              id,
              snapshotData,
              resolvedCategory,
              callback
            );

          return { snapshotStore: newSnapshot };
        } else {
          throw new Error("Category is undefined");
        }
      } catch (error) {
        console.error("Error creating snapshot:", error);
        throw error;
      }
    },

    setSnapshot: (snapshot: SnapshotStore<T, K>) => {
      return Promise.resolve({ snapshot });
    },

    createSnapshot: (
      id: string,
      snapshotData: SnapshotData<T, K>,
      category: symbol | string | Category | undefined,
      categoryProperties: CategoryProperties | undefined,
      callback?: (snapshot: Snapshot<T, K>) => void,
      snapshotData?: SnapshotStore<T, K>,
      snapshotStoreConfig?: SnapshotStoreConfig<T, any> | null,
      snapshotStoreConfigSearch?: SnapshotStoreConfig<
        SnapshotWithCriteria<any, BaseData>,
        K
          >
    ): Snapshot<T, K> | null => {
      console.log(
        `Creating snapshot with ID: ${id} in category: ${category}`,
        snapshotData
      );

      // Return a Snapshot<BaseData, BaseData> object
      return {
        id,
        data: snapshotData, // Ensure snapshotData is of type Data
        category,
        timestamp: new Date(),
        dataItems: [],
        newData: snapshotData,
        // store: snapshotStore,
        // // unsubscribe: unsubscribe,
        // getSnapshotId: getSnapshotId,
        // compareSnapshotState: compareSnapshotState,
        // snapshot: snapshot,
        // snapshotStore: snapshotStore,
        // handleSnapshot: handleSnapshot,
        // unsubscribe: unsubscribe,
        // events: {
        //   eventRecords,
        //   callbacks: (snapshot: Snapshot<BaseData, BaseData>) => {
        //     return {
        //       snapshot: snapshot,
        //       events: snapshot.meta.events,
        //       callbacks: snapshot.meta.callbacks,
        //       subscribers: snapshot.store.subscribers,
        //       eventIds: snapshot.meta.eventIds
        //     };
        //   },
        //   subscribers: [],
        //   eventIds: []
        // },
        // meta: meta,
        // fetchSnapshot: () => Promise.resolve(snapshotData),
        // other properties if any
      };
    },

    configureSnapshotStore: (
      snapshotStore: SnapshotStore<SnapshotStore<SnapshotUnion<Data, Meta>, K<T>>, K>
    ) => { },

    createSnapshotSuccess: () => { },

    createSnapshotFailure: async (
      snapshotId: string,
      snapshotManager: SnapshotManager<T, K>,
      snapshot: Snapshot<T, K>,
      payload: { error: Error }
    ) => {
      const snapshotStore: SnapshotStore<T, K>[] = snapshotManager.state as SnapshotStore<T, K>[];

      if (snapshotStore && snapshotStore.length > 0) {
        const generatedSnapshotId = generateSnapshotId; // Assuming generateSnapshotId returns a string

        const config = {} as SnapshotStoreConfig<T, K>; // Cast to expected type
        const configOption = {} as SnapshotStoreConfig<T, K>; // Cast to expected type
        // Example: Transforming snapshot.data (Map<string, BaseData>) to initialState (SnapshotStore<BaseData, K> | Snapshot<BaseData>)
        const initialState: SnapshotStore<T, K> = {
          id: generatedSnapshotId,
          key: "key",
          topic: "topic",
          date: new Date(),
          timestamp: new Date().getTime(),
          message: "message",
          category: "category",
          data: snapshot.data,
          configOption: configOption,
          config: config,
          subscription: {
            subscribers: [],
            unsubscribe: (unsubscribeDetails, callback: Callback<Snapshot<T, K>> | null) => {
              // Define the unsubscribe logic here
              console.log("Unsubscribed:", unsubscribeDetails);
              if (callback) {
                callback(snapshot);
              }
            },
            portfolioUpdates: portfolioUpdates,
            tradeExecutions: getTradeExecutions,
            marketUpdates: getMarketUpdates,
            triggerIncentives: triggerIncentives,
            communityEngagement: getCommunityEngagement,
            portfolioUpdatesLastUpdated: {
              value: new Date(),
              isModified: false,
            } as ModifiedDate,
            determineCategory: determineCategory,
          },

          setSnapshotData(
            snapshotStore: SnapshotStore<T, K>,
            data: Map<string, Snapshot<T, K>>,
            subscribers: Subscriber<any, any>[],
            snapshotData: Partial<SnapshotStoreConfig<T, K>>,
            id?: string,
          ): Map<string, Snapshot<T, K>> {
            const self = this as SnapshotStore<T, K>;
          
            if (data) {
              const snapshot = data.get(id || ''); // Get the specific snapshot if `id` is provided
          
              if (snapshot) {
                // Update properties of the SnapshotStore
                if (snapshot.id) {
                  self.id = snapshot.id as string; // Ensure snapshot.id is of type string
                }
                if (snapshot.timestamp) {
                  self.timestamp = snapshot.timestamp;
                }
                if (snapshot.data) {
                  self.data = { ...self.data, ...snapshot.data };
                }
          
                // Define message properly (e.g., could be a string like "Snapshot updated")
                const message = "Snapshot updated";
                
                // Create a Partial<SnapshotStoreConfig<T, K>> from the snapshot
              const partialConfig: Partial<SnapshotStoreConfig<T, K>> = {
                id: snapshot.id,
                data: snapshot.data,
              };

                // Notify subscribers or trigger updates if necessary
              self.notifySubscribers(message, subscribers, partialConfig);
              }
            }
          
            // Return updated data
            return data;
          },
          
          title: "defaultTitle", // Example placeholder
          type: "defaultType", // Example placeholder
          subscribeToSnapshots: (
            snapshotId: string,
            callback: (snapshots: Snapshots<T, K>) => Snapshot<T, K> | null,
            snapshot: Snapshot<T, K> | null = null
          ) => { },
          snapshotId: "",
          createdBy: "",
          subscribers: [],
          set: undefined,
          state: null,
          store: null,
          snapshots: [],
          snapshotConfig: [],
          initialState: undefined,
          dataStore: undefined,
          dataStoreMethods: {} as DataStore<T, K>,
          delegate: [],
          subscriberId: "",
          length: 0,
          content: "",
          value: 0,
          todoSnapshotId: "",
          events: undefined,
          snapshotStore: null,
          dataItems: [],
          newData: undefined,
          subscribeToSnapshot: subscribeToSnapshotImpl,
          transformSubscriber: transformSubscriber,
          transformDelegate: transformDelegate,
          initializedState: undefined,
          getAllKeys: function (): Promise<string[]> {
            throw new Error("Function not implemented.");
          },
          getAllItems: function (): Promise<BaseData[]> {
            throw new Error("Function not implemented.");
          },
          addData: function (data: Snapshot<T, K>): void {
            throw new Error("Function not implemented.");
          },
          addDataStatus: function (
            id: number,
            status: "completed" | "pending" | "inProgress"
          ): void {
            throw new Error("Function not implemented.");
          },
          removeData: function (id: number): void {
            throw new Error("Function not implemented.");
          },
          updateData: function (id: number, newData: BaseData): void {
            throw new Error("Function not implemented.");
          },
          updateDataTitle: function (id: number, title: string): void {
            throw new Error("Function not implemented.");
          },
          updateDataDescription: function (
            id: number,
            description: string
          ): void {
            throw new Error("Function not implemented.");
          },
          updateDataStatus: function (
            id: number,
            status: "completed" | "pending" | "inProgress"
          ): void {
            throw new Error("Function not implemented.");
          },
          addDataSuccess: function (payload: { data: BaseData[] }): void {
            throw new Error("Function not implemented.");
          },
          getDataVersions: function (
            id: number
          ): Promise<BaseData[] | undefined> {
            throw new Error("Function not implemented.");
          },
          updateDataVersions: function (
            id: number,
            versions: BaseData[]
          ): void {
            throw new Error("Function not implemented.");
          },
          getBackendVersion: function (): Promise<string | undefined> {
            throw new Error("Function not implemented.");
          },
          getFrontendVersion: function (): Promise<string | undefined> {
            throw new Error("Function not implemented.");
          },
          fetchData: function (
            id: number
          ): Promise<SnapshotStore<T, K>[]> {
            throw new Error("Function not implemented.");
          },
          snapshot: undefined,
          removeItem: function (key: string): Promise<void> {
            throw new Error("Function not implemented.");
          },
          getSnapshot: function (
            snapshot: ( id: string) =>
              | Promise<{
                snapshotId: number;
                snapshotData: T;
                category: Category | undefined;
                categoryProperties: CategoryProperties;
                dataStoreMethods: DataStore<T, K>;
                timestamp: string | number | Date | undefined;
                id: string | number | undefined;
                snapshot: Snapshot<T, K>;
                snapshotStore: SnapshotStore<T, K>;
                data: T;
              }>
          ): Promise<Snapshot<T, K>> {
            throw new Error("Function not implemented.");
          },
          getSnapshotSuccess: this.getSnapshotSuccess,
          getSnapshotId: function (
            key: SnapshotData<T, K>
          ): Promise<string | undefined> {
            const snapshot = this.getSnapshot(key);
            return snapshot.data.snapshotId;
          },
          getItem: function (key: string): Promise<BaseData | undefined> {
            throw new Error("Function not implemented.");
          },
          setItem: function (key: string, value: BaseData): Promise<void> {
            throw new Error("Function not implemented.");
          },
          addSnapshotFailure: function (date: Date, error: Error): void {
            throw new Error("Function not implemented.");
          },
          getDataStore: function (): Promise<InitializedDataStore> {
            throw new Error("Function not implemented.");
          },
          getDataStoreMap: function (): Promise<Map<string, Promise<DataStore<T, K>[]>>> {
            throw new Error("Function not implemented.");
          },
          addSnapshotSuccess: function (
            snapshot: BaseData,
            subscribers: SubscriberCollection<T, K>
          ): void {
            throw new Error("Function not implemented.");
          },
          compareSnapshotState: function (
            stateA:
              | Snapshot<BaseData, BaseData>
              | Snapshot<BaseData, BaseData>[]
              | null
              | undefined,
            stateB: Snapshot<BaseData, BaseData> | null | undefined
          ): boolean {
            throw new Error("Function not implemented.");
          },
          deepCompare: function (objA: any, objB: any): boolean {
            throw new Error("Function not implemented.");
          },
          shallowCompare: function (objA: any, objB: any): boolean {
            throw new Error("Function not implemented.");
          },
          getDataStoreMethods: function () {
            throw new Error("Function not implemented.");
          },
          getDelegate: function (): SnapshotStoreConfig<SnapshotWithCriteria<BaseData, any>, Meta, BaseData>[] {
            throw new Error("Function not implemented.");
          },
          determineCategory: function (
            snapshot: Snapshot<BaseData, BaseData> | null | undefined
          ): string {
            throw new Error("Function not implemented.");
          },
          determinePrefix: function <T extends Data>(
            snapshot: T | null | undefined,
            category: string
          ): string {
            throw new Error("Function not implemented.");
          },
          updateSnapshot: function (
            snapshotId: string,
            data: Map<string, BaseData>,
            events: Record<string, CalendarEvent<SnapshotWithCriteria<Data, K>, K>[]>,
            snapshotStore: any,
            dataItems: RealtimeDataItem[],
            newData: Snapshot<BaseData, BaseData>,
            payload: UpdateSnapshotPayload<BaseData>,
            store: any
          ): Promise<{ snapshot: SnapshotStore<T, K> }> {
            throw new Error("Function not implemented.");
          },
          updateSnapshotSuccess: function (): void {
            throw new Error("Function not implemented.");
          },
          updateSnapshotFailure: function ({
            snapshotManager,
            snapshot,
            date,
            payload,
          }: {
            snapshotManager: SnapshotManager<any, any>;
            snapshot: Snapshot<any, any>;
            date: Date | undefined;
            payload: { error: Error; };
          }): void {
            throw new Error("Function not implemented.");
          },
          removeSnapshot: function (snapshotToRemove: any): void {
            throw new Error("Function not implemented.");
          },
          clearSnapshots: function (): void {
            throw new Error("Function not implemented.");
          },
          // addSnapshot: function (
          //   snapshot: Snapshot<T, K>,
          //   subscribers: Subscriber<T, K>[]
          // ): Promise<void> {
          //   throw new Error("Function not implemented.");
          // },
          createSnapshot: function (
            id: string,
            snapshotData: SnapshotData<any, BaseData>,
            category: string
          ): Snapshot<BaseData, BaseData> {
            throw new Error("Function not implemented.");
          },
          createSnapshotSuccess: function (
            snapshot: Snapshot<BaseData, BaseData>
          ): void {
            throw new Error("Function not implemented.");
          },
          setSnapshotSuccess: function (
            snapshotData: any,
            subscribers: ((data: Snapshot<BaseData, BaseData>) => void)[]
          ): void {
            throw new Error("Function not implemented.");
          },
          setSnapshotFailure: function (error: Error): void {
            throw new Error("Function not implemented.");
          },
          createSnapshotFailure: function (
            snapshotId: string,
            snapshotManager: SnapshotManager<T, K>,
            snapshot: Snapshot<T, K>,
            payload: { error: Error }
          ): void {
            throw new Error("Function not implemented.");
          },
          updateSnapshots: function (): void {
            throw new Error("Function not implemented.");
          },
          updateSnapshotsSuccess: function (
            snapshotData: (
              subscribers: Subscriber<T, K>[],
              snapshot: Snapshots<BaseData>
            ) => void
          ): void {
            throw new Error("Function not implemented.");
          },
          updateSnapshotsFailure: function (error: Payload): void {
            throw new Error("Function not implemented.");
          },
          initSnapshot: function (
            snapshotConfig: SnapshotStoreConfig<SnapshotWithCriteria<Data, K>, K>,
            snapshotData: SnapshotData<T, K>
          ): void {
            throw new Error("Function not implemented.");
          },
          takeSnapshot: function (
            snapshot: SnapshotStore<T, K>,
            subscribers: any[]
          ): Promise<{ snapshot: SnapshotStore<T, K> }> {
            throw new Error("Function not implemented.");
          },
          takeSnapshotSuccess: function (
            snapshot: SnapshotStore<T, K>
          ): void {
            throw new Error("Function not implemented.");
          },
          takeSnapshotsSuccess: function (snapshots: BaseData[]): void {
            throw new Error("Function not implemented.");
          },

          configureSnapshotStore: function (
            snapshotStore: SnapshotStore<T, K>,
            snapshotId: string,
            data: Map<string, Snapshot<T, K>>,
            events: Record<string, CalendarManagerStoreClass<SnapshotWithCriteria<Data, K>, K>[]>,
            dataItems: RealtimeDataItem[],
            newData: Snapshot<T, K>,
            payload: ConfigureSnapshotStorePayload<T, K>,
            store: SnapshotStore<any, K>,
            callback: (snapshotStore: SnapshotStore<T, K>) => void
          ): void {
            throw new Error("Function not implemented.");
          },
          getData: function <T extends Data>(
            data:
              | Snapshot<BaseData, K>
              | Snapshot<CustomSnapshotData, K>
          ): Promise<{
            data: (
              | Snapshot<CustomSnapshotData, K>
              | Snapshot<T, K>
            )[]; // Implement logic to convert subscriber data to SnapshotStore instance
            // Implement logic to convert subscriber data to SnapshotStore instance
            getDelegate: SnapshotStore<T, any>;
          }> {
            throw new Error("Function not implemented.");
          },
          flatMap: function (
            snapshot: Snapshot<BaseData, K>,
            subscribers: Subscriber<T, K>[]
              | Subscriber<CustomSnapshotData, any>[]
          ): Promise<{
            snapshot: Snapshot<BaseData, BaseData>;
            subscribers: Subscriber<T, K>[];
          }> {
            throw new Error("Function not implemented.");
          },
          setData: function (data: BaseData): void {
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
            snapshot: Snapshot<BaseData, BaseData>
          ): boolean {
            throw new Error("Function not implemented.");
          },
          handleSnapshot: function (
            id: string,
            snapshotId: string,
            snapshot: Snapshot<T, K> | null,
            snapshotData: T,
            category: Category | undefined,
            callback: (snapshot: T) => void,
            snapshots: Snapshots<T, K>,
            type: string,
            event: Event,
            snapshotContainer?: T,
            snapshotStoreConfig?: SnapshotStoreConfig<SnapshotWithCriteria<Data, K>, K>,
          ): void {
            throw new Error("Function not implemented.");
          },
          handleActions: function (): void {
            throw new Error("Function not implemented.");
          },
          setSnapshot: function (snapshot: SnapshotStore<T, K>): void {
            throw new Error("Function not implemented.");
          },
          transformSnapshotConfig: function <T extends BaseData>(
            config: SnapshotStoreConfig<SnapshotWithCriteria<BaseData, any>, K<T>>
          ): SnapshotStoreConfig<SnapshotWithCriteria<BaseData, any>, K<T>> {
            throw new Error("Function not implemented.");
          },
          setSnapshots: function (
            snapshots: SnapshotStore<T, K>[]
          ): void {
            throw new Error("Function not implemented.");
          },
          clearSnapshot: function (): void {
            throw new Error("Function not implemented.");
          },
          mergeSnapshots: function (snapshots: BaseData[]): void {
            throw new Error("Function not implemented.");
          },
          reduceSnapshots: function (): void {
            throw new Error("Function not implemented.");
          },
          sortSnapshots: function (): void {
            throw new Error("Function not implemented.");
          },
          filterSnapshots: function (): void {
            throw new Error("Function not implemented.");
          },
          mapSnapshots: function (
            storeIds: number[],
            snapshotId: string,
            category: Category | undefined,
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
              category: Category | undefined,
              categoryProperties: CategoryProperties | undefined,
              snapshot: Snapshot<T, K>,
              timestamp: string | number | Date | undefined,
              type: string,
              event: Event,
              id: number,
              snapshotStore: SnapshotStore<T, K>,
              data: T,
              index: number
            ) => SnapshotsObject<T, K>
          ): Promise<SnapshotsArray<T, K>> {
            throw new Error("Function not implemented.");
          },
          findSnapshot: function (
            predicate: (snapshot: Snapshot<T, K>) => boolean
        ):Snapshot<T, K> | undefined {
            throw new Error("Function not implemented.");
          },
          getSubscribers: function (
            subscribers: Subscriber<T, K>[],
            snapshots: Snapshots<BaseData>
          ): Promise<{
            subscribers: Subscriber<T, K>[];
            snapshots: Snapshots<BaseData>;
          }> {
            throw new Error("Function not implemented.");
          },
          notify: function (
            id: string,
            message: string,
            content: any,
            date: Date,
            type: NotificationType,
            notificationPosition?: NotificationPosition | undefined
          ): void {
            throw new Error("Function not implemented.");
          },
          notifySubscribers: function (
            subscribers: Subscriber<T, K>[],
            data: Partial<SnapshotStoreConfig<T, K>>
          ): Subscriber<T, K>[] {
            throw new Error("Function not implemented.");
          },
          subscribe: function (): void {
            throw new Error("Function not implemented.");
          },
          unsubscribe: function (): void {
            throw new Error("Function not implemented.");
          },
          fetchSnapshot: function (
            snapshotId: string,
            category: Category | undefined,
            timestamp: Date,
            snapshot: Snapshot<BaseData, BaseData>,
            data: BaseData,
            delegate: SnapshotStoreConfig<SnapshotWithCriteria<BaseData, any>, Meta, BaseData>[]
          ): Promise<{
            id: any;
            category: Category
            timestamp: any;
            snapshot: Snapshot<BaseData, BaseData>;
            data: BaseData;
            getItem?:
            | ((
              snapshot: Snapshot<BaseData, BaseData>
            ) => Snapshot<BaseData, BaseData> | undefined)
            | undefined;
          }> {
            throw new Error("Function not implemented.");
          },
          fetchSnapshotSuccess: function (
            snapshotData: (
              subscribers: Subscriber<T, K>[],
              snapshot: Snapshot<T, K>
            ) => void
          ): void {
            throw new Error("Function not implemented.");
          },
          fetchSnapshotFailure: function (
            snapshotId: string,
            snapshotManager: SnapshotManager<T, K>,
            snapshot: Snapshot<T, K>,
            date: Date | undefined,
            payload: { error: Error }
          ): void {
            throw new Error("Function not implemented.");
          },
          getSnapshots: function (
            category: string,
            data: Snapshots<BaseData>
          ): void {
            throw new Error("Function not implemented.");
          },
          getAllSnapshots: function (
            data: (
              subscribers: Subscriber<T, K>[],
              snapshots: Snapshots<BaseData>
            ) => Promise<Snapshots<BaseData>>
          ): void {
            throw new Error("Function not implemented.");
          },
          generateId: function (): string {
            throw new Error("Function not implemented.");
          },
          batchFetchSnapshots: function (
            subscribers: Subscriber<T, K>[],
            snapshots: Snapshots<BaseData>
          ): void {
            throw new Error("Function not implemented.");
          },
          batchTakeSnapshotsRequest: batchTakeSnapshotsRequest,
          batchUpdateSnapshotsRequest: batchUpdateSnapshotsRequest,
          batchFetchSnapshotsSuccess: batchFetchSnapshotsSuccess,
          batchFetchSnapshotsFailure: batchFetchSnapshotsFailure,
          batchUpdateSnapshotsSuccess: batchUpdateSnapshotsSuccess,
          batchUpdateSnapshotsFailure: batchUpdateSnapshotsFailure,
          batchTakeSnapshot: batchTakeSnapshot,
          handleSnapshotSuccess: handleSnapshotSuccess,
          [Symbol.iterator]: function (): IterableIterator<
            Snapshot<BaseData, BaseData>
          > {
            throw new Error("Function not implemented.");
          },
        }

        const updatedSnapshotData: Partial<
          SnapshotStoreConfig<SnapshotWithCriteria<BaseData, any>, Meta, BaseData>
        > = {
          id: generatedSnapshotId.toString(),
          data: snapshot.data ?? undefined,
          timestamp: new Date(),
          snapshotId: generatedSnapshotId.toString(),
          category: "update" as any, // Adjust according to your actual category type
          // Ensure other required properties are included
        };

        const subscribers: Subscriber<T, K>[] = [];

        // Check if snapshotStore[0] is defined and has the method setSnapshotData
        if (
          snapshotStore[0] &&
          typeof snapshotStore[0].setSnapshotData === "function"
        ) {
          snapshotStore[0].setSnapshotData(subscribers, updatedSnapshotData);
        }

        // Check if snapshotStore is an array
        if (Array.isArray(snapshotStore)) {
          snapshotStore.unshift(initialState); // Add the initial snapshot to the beginning of the snapshot store
        }

        const snapshotManager = await useSnapshotManager(storeId);
        // Update the snapshot store through a setter method if available
        await snapshotManager.setSnapshotManager(newState); // Ensure this method exists and correctly updates state
      }
    }, // Change 'any' to 'Error' if you handle specific error types

    batchTakeSnapshot: async (
      snapshotStore: SnapshotStore<BaseData, K>,
      snapshots: Snapshots<T, K>
    ) => {
      return { snapshots: [] };
    },
    onSnapshot: (snapshotStore: SnapshotStore<BaseData, K>) => { },
    snapshotData: (snapshot: SnapshotStore<any, any>) => {
      return { snapshots: [] };
    },
    initSnapshot: () => { },
    // Implementation of fetchSnapshot function

    fetchSnapshot: async (
      id: string,
      category: Category | undefined,
      timestamp: Date,
      snapshot: Snapshot<T, K>,
      data: T,
      delegate: SnapshotStoreConfig<SnapshotWithCriteria<Data, K>, K>[]
    ): Promise<{
      id: any;
      category: Category
      timestamp: any;
      snapshot: Snapshot<T, K>;
      data: T;
      delegate: SnapshotStoreConfig<SnapshotWithCriteria<Data, K>, K>[];
    }> => {
      try {
        // Example implementation fetching snapshot data
        const snapshotData = (await fetchFileSnapshotData(
          category as FileCategory
        )) as SnapshotData;

        // Check if snapshotData is defined
        if (!snapshotData) {
          throw new Error("Snapshot data is undefined.");
        }

        // Create a new SnapshotStore instance
        const snapshotStore = new SnapshotStore<BaseData, K>({
          snapshotId: snapshotData.id,
          data: snapshotData.data,
          date: snapshotData.timestamp as Date,
          category: snapshotData.category,
          type: snapshotData.type,
          snapshotConfig: snapshotData.snapshotConfig,
          delegate: snapshotData.delegate,
          dataStoreMethods: snapshotData.getDataStoreMethods(),
          subscribeToSnapshot: snapshotData.subscribeToSnapshot,
          subscribeToSnapshots: snapshotData.subscribeToSnapshots,
        });

        return {
          id: snapshotData.id,
          category: snapshotData.category,
          timestamp: snapshotData.timestamp,
          snapshot: snapshotData.snapshot,
          data: snapshotData.data,
          delegate: snapshotData.delegate,
        };
      } catch (error) {
        console.error("Error fetching snapshot:", error);
        throw error;
      }
    },


    clearSnapshot: () => { },

    updateSnapshot: async (
      snapshotId: string,
      data: Map<string, BaseData>,
      events: Record<string, CalendarEvent<SnapshotWithCriteria<Data, K>, K>[]>,
      snapshotStore: SnapshotStore<T, K>,
      dataItems: RealtimeDataItem[],
      newData: Snapshot<T, K>,
      payload: UpdateSnapshotPayload<T>,
      store: SnapshotStore<any, any>
    ): Promise<{ snapshot: Snapshot<BaseData> }> => {
      // Example implementation logic (adjust as per your actual implementation)

      // Assuming you update some data in snapshotStore
      snapshotStore.addData(newData);

      // Convert snapshotStore to Snapshot<BaseData>
      const snapshotData: SnapshotData<BaseData, BaseData> = {
        id: snapshotStore.id, // Ensure id is correctly assigned
        // Assign other properties as needed
        createdAt: new Date(),
        updatedAt: new Date(),
        title: "Snapshot Title", // Example: Replace with actual title
        description: "Snapshot Description", // Example: Replace with actual description
        status: "active", // Example: Replace with actual status
        category: "Snapshot Category", // Example: Replace with actual category
        // Ensure all required properties are assigned correctly
      };

      // Return the updated snapshot
      return { snapshot: snapshotData };
    },

    getSnapshots: async (category: string, snapshots: Snapshots<T, K>) => {
      return { snapshots };
    },
    takeSnapshot: async (snapshot: SnapshotStore<BaseData, K>) => {
      return { snapshot: snapshot };
    },

    getAllSnapshots: async (
      data: (
        subscribers: SubscriberCollection<SnapshotWithCriteria<Data, K>, K>,
        snapshots: Snapshots<T, K>
      ) => Promise<Snapshots<T, K>>
    ) => {
      // Implement your logic here
      const subscribers: SubscriberCollection<SnapshotWithCriteria<Data, K>, K> = []; // Example
      const snapshots: Snapshots<T, K> = []; // Example
      return data(subscribers, snapshots);
    },

    takeSnapshotSuccess: () => { },
    updateSnapshotFailure: (payload: { error: string }) => {
      console.log("Error updating snapshot:", payload);
    },
    takeSnapshotsSuccess: () => { },
    fetchSnapshotSuccess: () => { },
    updateSnapshotsSuccess: () => { },
    notify: () => { },

    updateMainSnapshots: async <T extends BaseData>(
      snapshots: Snapshots<T, K>
    ): Promise<Snapshots<T, K>> => {
      try {
        const updatedSnapshots: Snapshots<T, K> = snapshots.map((snapshot) => ({
          ...snapshot,
          message: "Main snapshot updated",
          content: "Updated main content",
          description: snapshot.description || undefined,
        }));
        return Promise.resolve(updatedSnapshots);
      } catch (error) {
        console.error("Error updating main snapshots:", error);
        throw error;
      }
    },

    batchFetchSnapshots: async (
      criteria: CriteriaType,
      subscribers: SubscriberCollection<T, K>,
      snapshots: Snapshots<Data>
    ) => {
      return {
        subscribers: [],
        snapshots: [],
      };
    },

    batchUpdateSnapshots: async (
      subscribers: SubscriberCollection<T, K>,
      snapshots: Snapshots<Data>
    ) => {
      // Perform batch update logic
      return [
        { snapshots: [] }, // Example empty array, adjust as per your logic
      ];
    },
    batchFetchSnapshotsRequest: async (snapshotData: {
      subscribers: SubscriberCollection<T, K>;
      snapshots: Snapshots<T, K>;
    }) => {
      console.log("Batch snapshot fetching requested.");

      try {
        const target = {
          endpoint: "https://example.com/api/snapshots/batch",
          params: {
            limit: 100,
            sortBy: "createdAt",
          },
        };

        const fetchedSnapshots: SnapshotList<T, K>| Snapshots<T, K> =
          await snapshotApi
            .getSortedList(target)
            .then((sortedList) => snapshotApi.fetchAllSnapshots(sortedList));

        let snapshots: Snapshots<CustomSnapshotData>;

        if (Array.isArray(fetchedSnapshots)) {
          snapshots = fetchedSnapshots.map((snapshot) => ({

            id: snapshot.id,
            isCore: snapshot.isCore,
            isExpired: snapshot.isExpired,
            initialConfig: snapshot.initialConfig,
            removeSubscriber: snapshot.removeSubscriber,
            onInitialize: snapshot.onInitialize,
            onError: snapshot.onError,
           
            taskIdToAssign: snapshot.taskIdToAssign,
            schema: snapshot.schema,
            currentCategory: snapshot.currentCategory,
            mappedSnapshotData: snapshot.mappedSnapshotData,
           
            storeId: snapshot.storeId,
            versionInfo: snapshot.versionInfo,
            initializedState: snapshot.initializedState,
            criteria: snapshot.criteria,
           
            setCategory: snapshot.setCategory,
            applyStoreConfig: snapshot.applyStoreConfig,
            generateId: snapshot.generateId,
            snapshotData: snapshot.snapshotData,
           
            snapshotContainer: snapshot.snapshotContainer,
            getSnapshotItems: snapshot.getSnapshotItems,
            defaultSubscribeToSnapshots: snapshot.defaultSubscribeToSnapshots,
            notify: snapshot.notify,
           
            notifySubscribers: snapshot.notifySubscribers,
            getAllSnapshots: snapshot.getAllSnapshots,
            getSubscribers: snapshot.getSubscribers,
            transformSubscriber: snapshot.transformSubscriber,
           
            transformDelegate: snapshot.transformDelegate,
            getAllKeys: snapshot.getAllKeys,
            getAllValues: snapshot.getAllValues,
            getAllItems: snapshot.getAllItems,
            
            getSnapshotEntries: snapshot.getSnapshotEntries,
            getAllSnapshotEntries: snapshot.getAllSnapshotEntries,
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
            fetchStoreData: snapshot.fetchStoreData,
            fetchData: snapshot.fetchData,
            defaultSubscribeToSnapshot: snapshot.defaultSubscribeToSnapshot,
            
            handleSubscribeToSnapshot: snapshot.handleSubscribeToSnapshot,
            removeItem: snapshot.removeItem,
            getSnapshot: snapshot.getSnapshot,
            getSnapshotSuccess: snapshot.getSnapshotSuccess,
            
            setItem: snapshot.setItem,
            getItem: snapshot.getItem,
            getDataStore: snapshot.getDataStore,
            getDataStoreMap: snapshot.getDataStoreMap,
           
            addSnapshotSuccess: snapshot.addSnapshotSuccess,
            deepCompare: snapshot.deepCompare,
            shallowCompare: snapshot.shallowCompare,
            getDataStoreMethods: snapshot.getDataStoreMethods,
           
            getDelegate: snapshot.getDelegate,
            determineCategory: snapshot.determineCategory,
            determinePrefix: snapshot.determinePrefix,
            removeSnapshot: snapshot.removeSnapshot,
           
            addSnapshotItem: snapshot.addSnapshotItem,
            addNestedStore: snapshot.addNestedStore,
            clearSnapshots: snapshot.clearSnapshots,
            addSnapshot: snapshot.addSnapshot,
           
            emit: snapshot.emit,
            createSnapshot: snapshot.createSnapshot,
            createInitSnapshot: snapshot.createInitSnapshot,
            addStoreConfig: snapshot.addStoreConfig,
        
            snapshotId: snapshot.snapshotId,
            timestamp: snapshot.timestamp,
            category: snapshot.category,
            message: snapshot.message,
            content: snapshot.content,
            data: snapshot.data, // Ensure data is directly assigned if it's already in the correct format
            store: snapshot.store,
            metadata: snapshot.metadata,
            key: snapshot.key,
            topic: snapshot.topic,
            date: snapshot.date,
            configOption: snapshot.configOption,
            config: snapshot.config,
            title: snapshot.title,
            type: snapshot.type,
            subscribers: snapshot.subscribers,
            set: snapshot.set,
            state: snapshot.state,
            snapshots: snapshot.snapshots,
            snapshotConfig: snapshot.snapshotConfig,
            dataStore: snapshot.dataStore,
            dataStoreMethods: snapshot.dataStoreMethods,
            delegate: snapshot.delegate,
            subscriberId: snapshot.subscriberId,
            length: snapshot.length,
            events: snapshot.events,
            meta: snapshot.meta,
            initialState: snapshot.initialState,
            snapshot: snapshot.snapshot,
            getSnapshotId: snapshot.getSnapshotId,
            compareSnapshotState: snapshot.compareSnapshotState,
            eventRecords: snapshot.eventRecords,
            snapshotStore: snapshot.snapshotStore,
            getParentId: snapshot.getParentId,
            getChildIds: snapshot.getChildIds,
            addChild: snapshot.addChild,
            removeChild: snapshot.removeChild,
            getChildren: snapshot.getChildren,
            hasChildren: snapshot.hasChildren,
            isDescendantOf: snapshot.isDescendantOf,
            dataItems: snapshot.dataItems,
            newData: snapshot.newData,
            getInitialState: snapshot.getInitialState,
            getConfigOption: snapshot.getConfigOption,
            stores: snapshot.stores,
            getStore: snapshot.getStore,
            addStore: snapshot.addStore,
            mapSnapshot: snapshot.mapSnapshot,
            removeStore: snapshot.removeStore,
            unsubscribe: snapshot.unsubscribe,
            fetchSnapshot: snapshot.fetchSnapshot,
            addSnapshotFailure: snapshot.addSnapshotFailure,
            configureSnapshotStore: snapshot.configureSnapshotStore,
            updateSnapshotSuccess: snapshot.updateSnapshotSuccess,
            createSnapshotFailure: snapshot.createSnapshotFailure,
            createSnapshotSuccess: snapshot.createSnapshotSuccess,
            createSnapshots: snapshot.createSnapshots,
            onSnapshot: snapshot.onSnapshot,
            onSnapshots: snapshot.onSnapshots,
            handleSnapshot: snapshot.handleSnapshot,

            handleSnapshotConfig: snapshot.handleSnapshotConfig,
            getSnapshotConfig: snapshot.getSnapshotConfig,
            getSnapshotListByCriteria: snapshot.getSnapshotListByCriteria,
            setSnapshotSuccess: snapshot.setSnapshotSuccess,
           
            setSnapshotFailure: snapshot.setSnapshotFailure,
            updateSnapshots: snapshot.updateSnapshots,
            updateSnapshotsSuccess: snapshot.updateSnapshotsSuccess,
            updateSnapshotsFailure: snapshot.updateSnapshotsFailure,
            
            initSnapshot: snapshot.initSnapshot,
            takeSnapshot: snapshot.takeSnapshot,
            takeSnapshotSuccess: snapshot.takeSnapshotSuccess,
            takeSnapshotsSuccess: snapshot.takeSnapshotsSuccess,
           
            flatMap: snapshot.flatMap,
            getState: snapshot.getState,
            setState: snapshot.setState,
            validateSnapshot: snapshot.validateSnapshot,
            
            handleActions: snapshot.handleActions,
            setSnapshot: snapshot.setSnapshot,
            transformSnapshotConfig: snapshot.transformSnapshotConfig,
            setSnapshots: snapshot.setSnapshots,
           
            clearSnapshot: snapshot.clearSnapshot,
            mergeSnapshots: snapshot.mergeSnapshots,
            reduceSnapshots: snapshot.reduceSnapshots,
            sortSnapshots: snapshot.sortSnapshots,
           
            filterSnapshots: snapshot.filterSnapshots,
            findSnapshot: snapshot.findSnapshot,
            mapSnapshots: snapshot.mapSnapshots,
            takeLatestSnapshot: snapshot.takeLatestSnapshot,
           
            updateSnapshot: snapshot.updateSnapshot,
            addSnapshotSubscriber: snapshot.addSnapshotSubscriber,
            removeSnapshotSubscriber: snapshot.removeSnapshotSubscriber,
            getSnapshotConfigItems: snapshot.getSnapshotConfigItems,
           
            subscribeToSnapshots: snapshot.subscribeToSnapshots,
            executeSnapshotAction: snapshot.executeSnapshotAction,
            subscribeToSnapshot: snapshot.subscribeToSnapshot,
            unsubscribeFromSnapshot: snapshot.unsubscribeFromSnapshot,
            
            subscribeToSnapshotsSuccess: snapshot.subscribeToSnapshotsSuccess,
            unsubscribeFromSnapshots: snapshot.unsubscribeFromSnapshots,
            getSnapshotItemsSuccess: snapshot.getSnapshotItemsSuccess,
            getSnapshotItemSuccess: snapshot.getSnapshotItemSuccess,
           
            getSnapshotKeys: snapshot.getSnapshotKeys,
            getSnapshotIdSuccess: snapshot.getSnapshotIdSuccess,
            getSnapshotValuesSuccess: snapshot.getSnapshotValuesSuccess,
            getSnapshotWithCriteria: snapshot.getSnapshotWithCriteria,
           
            reduceSnapshotItems: snapshot.reduceSnapshotItems,
            subscribeToSnapshotList: snapshot.subscribeToSnapshotList,
            label: snapshot.label,
            restoreSnapshot: snapshot.restoreSnapshot,
           
            subscribe: snapshot.subscribe,
            snapshotMethods: snapshot.snapshotMethods,
            getSnapshotsBySubscriber: snapshot.getSnapshotsBySubscriber,
            items: snapshot.items,
           
            setSnapshotCategory: snapshot.setSnapshotCategory,
            getSnapshotCategory: snapshot.getSnapshotCategory,
            getSnapshotData: snapshot.getSnapshotData,
            deleteSnapshot: snapshot.deleteSnapshot,
           
            getSnapshots: snapshot.getSnapshots,
            compareSnapshots: snapshot.compareSnapshots,
            compareSnapshotItems: snapshot.compareSnapshotItems,
            batchTakeSnapshot: snapshot.batchTakeSnapshot,
           
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
            handleSnapshotSuccess: snapshot.handleSnapshotSuccess,
            handleSnapshotFailure: snapshot.handleSnapshotFailure,
           
            payload: snapshot.payload,
            getTimestamp: snapshot.getTimestamp,
            getStores: snapshot.getStores,
            getData: snapshot.getData,
            setData: snapshot.setData,
            addData: snapshot.addData,
            mapSnapshotWithDetails: snapshot.mapSnapshotWithDetails,
            fetchSnapshotSuccess: snapshot.fetchSnapshotSuccess,
            
            updateSnapshotFailure: snapshot.updateSnapshotFailure,
            fetchSnapshotFailure: snapshot.fetchSnapshotFailure,
            snapConfig: snapshot.snapConfig,
            childIds: snapshot.childIds,
            snapshotCategory: snapshot.snapshotCategory,
            snapshotSubscriberId: snapshot.snapshotSubscriberId,
            getSnapshotById: snapshot.getSnapshotById,
            initializeWithData: snapshot.initializeWithData,
            hasSnapshots: snapshot.hasSnapshots,
            // Adjust this based on your actual data structure
          }));
        } else {
          snapshots = fetchedSnapshots.getSnapshots()
            .map((snapshot: SnapshotItem<T, K>) => ({
              id: snapshot.id,
              timestamp: snapshot.timestamp,
              category: snapshot.category,
              message: snapshot.message,
              content: snapshot.content,
              data: snapshot.data,
              store: snapshot.store,
              metadata: snapshot.metadata,
              events: snapshot.events,
              meta: snapshot.meta,
              initialState: new Map(), // Adjust this based on your actual data structure
            }));
        }

        return {
          subscribers: snapshotData.subscribers,
          snapshots: snapshots,
        };
      } catch (error) {
        console.error("Error fetching snapshots in batch:", error);
        throw error;
      }
    },

    updateSnapshotForSubscriber: async (
      subscriber: Subscriber<T, K>,
      snapshots: Snapshots<T, K>
    ): Promise<{
      subscribers: Subscriber<T, K>[];
      snapshots: Snapshot<BaseData, BaseData>[];
    }> => {
      try {
        const subscriberId = subscriber.id;

        if (!subscriberId) {
          throw new Error("Subscriber ID is undefined");
        }
    
        // Accessing the snapshot data using the subscriber ID as a key
        const snapshotData = snapshots[subscriberId];

        if (!snapshotData) {
          throw new Error(
            `No snapshot data found for subscriber ID: ${subscriberId}`
          );
        }

        // Logic to update the snapshot for a specific subscriber
        const updatedSnapshot: Snapshot<BaseData, BaseData> = {
          ...snapshotData,
          message: "Updated for subscriber",
        };


        // Create a new array with the updated snapshot
        const updatedSnapshots: Snapshots<Data> = {
          ...snapshots,
          [String(subscriberId)]: updatedSnapshot,
        };

          // Convert the updatedSnapshots object into an array
      const updatedSnapshotsArray: Snapshot<BaseData, BaseData>[] = Object.values(updatedSnapshots);

  
     // Return the updated snapshot wrapped in the expected structure
        return {
          subscribers: [subscriber],
          snapshots: updatedSnapshotsArray,
        };
      } catch (error) {
        console.error("Error updating snapshot for subscriber:", error);
        throw error;
      }
    },

    batchFetchSnapshotsSuccess: () => {
      return [];
    },
    batchFetchSnapshotsFailure: (payload: { error: Error }) => { },

    batchUpdateSnapshotsFailure: (payload: { error: Error }) => { },

    notifySubscribers: (
      message: string,
      subscribers: SubscriberCollection<SnapshotWithCriteria<Data, K>, K>,
      data: Partial<SnapshotStoreConfig<T, K>>
    ) => {
      return subscribers;
    },

    removeSnapshot: (snapshotToRemove) => {
      if (snapshotToRemove && snapshotToRemove.id !== undefined) {
        const currentConfig = snapshotConfig.find(
          (config) => config.snapshotId === "snapshot1" // Adjust the condition to match your use case
        );
        if (currentConfig && currentConfig.snapshots) {
          const filteredSnapshots = currentConfig.snapshots.filter(
            (snapshot) => snapshot.id !== snapshotToRemove.id
          );
          currentConfig.snapshots = filteredSnapshots;
        } else {
          console.warn("Snapshots not found in snapshotConfig.");
        }
      } else {
        console.warn(
          `${snapshotToRemove} or ${snapshotToRemove?.id} is undefined, no snapshot removed`
        );
      }
    },

    // Implementing the removeSubscriber method
    removeSubscriber: (subscriber) => {
      const subscriberId = subscriber.id;
      if (subscriberId !== undefined) {
        const currentConfig = snapshotConfig.find(
          (config) => config.snapshotId === "snapshot1" // Adjust the condition to match your use case
        );
        if (currentConfig && currentConfig.subscribers) {
          const filteredSubscribers = currentConfig.subscribers.filter(
            (sub) => sub.id !== subscriberId
          );
          currentConfig.subscribers = filteredSubscribers;
        } else {
          console.warn("Subscribers not found in snapshotConfig.");
        }
      } else {
        console.warn(`${subscriberId} is undefined, subscriber not removed`);
      }
    },

    // Implementing the addSubscriber method
    addSnapshot: function (snapshot: Snapshot<BaseData, BaseData>) {
      if (
        "data" in snapshot &&
        "timestamp" in snapshot &&
        "category" in snapshot &&
        typeof snapshot.category === "string"
      ) {
        const snapshotWithValidTimestamp: SnapshotStore<BaseData, K> = {
          ...snapshot,
          timestamp: new Date(snapshot.timestamp as unknown as string),
          // Ensure all required properties of SnapshotStore<Snapshot<T, K>> are included
          id: snapshot.id!.toString(),
          snapshotId: snapshot.snapshotId!.toString(),
          taskIdToAssign: snapshot.taskIdToAssign,
          clearSnapshots: snapshot.clearSnapshots,
          key: snapshot.key!,
          topic: snapshot.topic!,
          initialState: snapshot.initialState as SnapshotStore<T, K>
            | Snapshot<T, K> | null | undefined,
          initialConfig: snapshot.initialConfig,
          configOption: snapshot.configOption ? snapshot.configOption : null,
          subscription: snapshot.subscription ? snapshot.subscription : null,
          config: snapshot.config,
          category: snapshot.category,
          set: snapshot.set,
          data: snapshot.data || undefined,
          store: snapshot.store!,
          removeSubscriber: snapshot.removeSubscriber,
          handleSnapshot: snapshot.handleSnapshot,
          state: snapshot.state,
          snapshots: snapshot.snapshots,
          onInitialize: snapshot.onInitialize,
          subscribers: snapshot.subscribers,
          onError: snapshot.onError,
          snapshot: snapshot.snapshot,
          setSnapshot: snapshot.setSnapshot!,
          createSnapshot: snapshot.createSnapshot,
          configureSnapshotStore: snapshot.configureSnapshotStore,
          createSnapshotSuccess: snapshot.createSnapshotSuccess,
          createSnapshotFailure: snapshot.createSnapshotFailure,
          batchTakeSnapshot: snapshot.batchTakeSnapshot,
          onSnapshot: snapshot.onSnapshot,
          snapshotData: snapshot.snapshotData,
          initSnapshot: snapshot.initSnapshot,
          clearSnapshot: snapshot.clearSnapshot,
          updateSnapshot: snapshot.updateSnapshot,
          getSnapshots: snapshot.getSnapshots,
          takeSnapshot: snapshot.takeSnapshot,
          getAllSnapshots: this.getAllSnapshots,
          takeSnapshotSuccess: this.takeSnapshotSuccess,
          updateSnapshotFailure: this.updateSnapshotFailure,
          takeSnapshotsSuccess: this.takeSnapshotsSuccess,
          fetchSnapshotSuccess: this.fetchSnapshotSuccess,
          updateSnapshotsSuccess: this.updateSnapshotsSuccess,
          notify: this.notify,
          updateMainSnapshots: this.updateMainSnapshots,
          batchFetchSnapshots: this.batchFetchSnapshots,
          batchUpdateSnapshots: this.batchUpdateSnapshots,
          batchFetchSnapshotsRequest: this.batchFetchSnapshotsRequest,
          updateSnapshotForSubscriber: this.updateSnapshotForSubscriber,
          batchFetchSnapshotsSuccess: this.batchFetchSnapshotsSuccess,
          batchFetchSnapshotsFailure: this.batchFetchSnapshotsFailure,
          batchUpdateSnapshotsFailure: this.batchUpdateSnapshotsFailure,
          notifySubscribers: this.notifySubscribers,
          removeSnapshot: this.removeSnapshot,
          expirationDate: this.expirationDate,
          isExpired: this.isExpired,
          priority: this.priority,
          tags: this.tags,
          metadata: this.metadata,
          status: this.status,
          isCompressed: this.isCompressed,
          compress: this.compress,
          isEncrypted: this.isEncrypted,
          encrypt: this.encrypt,
          decrypt: this.decrypt,
          ownerId: this.ownerId,
          getOwner: this.getOwner,
          version: this.version,
          previousVersionId: this.previousVersionId,
          nextVersionId: this.nextVersionId,
          auditTrail: this.auditTrail,
          addAuditRecord: this.addAuditRecord,
          retentionPolicy: this.retentionPolicy,
          dependencies: this.dependencies,
          updateSnapshots: this.updateSnapshots,
          updateSnapshotsFailure: this.updateSnapshotsFailure,
          flatMap: this.flatMap,
          setData: this.setData,
          getState: this.getState,
          setState: this.setState,
          handleActions: this.handleActions,
          setSnapshots: this.setSnapshots,
          mergeSnapshots: this.mergeSnapshots,
          reduceSnapshots: this.reduceSnapshots,
          sortSnapshots: this.sortSnapshots,
          filterSnapshots: this.filterSnapshots,
          mapSnapshots: this.mapSnapshots,
          findSnapshot: this.findSnapshot,
          subscribe: this.subscribe,
          unsubscribe: this.unsubscribe,
          fetchSnapshotFailure: this.fetchSnapshotFailure,
          generateId: this.generateId,
        };

        const currentConfig = snapshotConfig.find(
          (config) => config.snapshotId === this.snapshotId
        );
        if (currentConfig && currentConfig.snapshots) {
          currentConfig.snapshots.push(snapshotWithValidTimestamp);
        } else {
          console.error("Snapshots not found in snapshotConfig.");
        }
      } else {
        console.error("Invalid snapshot format");
      }
    },

    getSubscribers: async (
      subscribers: SubscriberCollection<SnapshotWithCriteria<Data, K>, K>,
      snapshots: Snapshots<Data>
    ): Promise<{
      subscribers: SubscriberCollection<SnapshotWithCriteria<Data, K>, K>;
      snapshots: Snapshots<BaseData>[];
    }> => {
      const data = Object.entries(snapshots)
        .map(([category, categorySnapshots]) => {
          const subscribersForCategory = subscribers.filter(
            (subscriber) => subscriber.getData()?.category === category
          );
          if (Array.isArray(categorySnapshots)) {
            const snapshotsForCategory = categorySnapshots.map(
              (snapshot: Snapshot<BaseData, BaseData>) => {
                const updatedSnapshot = {
                  ...snapshot,
                  subscribers: subscribersForCategory.map((subscriber) => {
                    const subscriberData = subscriber.getData();
                    if (subscriberData) {
                      return {
                        ...subscriberData,
                        id: subscriber.getId(),
                      };
                    } else {
                      return {
                        id: subscriber.getId(),
                      };
                    }
                  }),
                };
                return updatedSnapshot;
              }
            );
            return snapshotsForCategory;
          }
        })
        .flat();

      return {
        subscribers,
        snapshots: data,
      };
    },

    addSubscriber: function <T extends Data | CustomSnapshotData>(
      subscriber: Subscriber<BaseData, K>,
      data: T,
      snapshotConfig: SnapshotStoreConfig<SnapshotWithCriteria<BaseData, any>, K<T>>[],
      delegate: SnapshotStoreSubset<BaseData>,
      sendNotification: (type: NotificationTypeEnum) => void
    ): void { },

    validateSnapshot: function (snapshot: Snapshot<BaseData, BaseData>): boolean {
      if (!snapshot.id || typeof snapshot.id !== "string") {
        console.error("Invalid snapshot ID");
        return false;
      }
      if (!(snapshot.timestamp instanceof Date)) {
        console.error("Invalid timestamp");
        return false;
      }
      if (!snapshot.data) {
        console.error("Data is required");
        return false;
      }
      return true;
    },

    getSnapshot: async function (
      snapshot: () =>
        | Promise<{
          category: any;
          timestamp: any;
          id: any;
          snapshot: SnapshotStore<BaseData, K>;
          data: Data;
        }>
        | undefined
    ): Promise<SnapshotStore<BaseData, K>> {
      try {
        const result = await snapshot();
        if (!result) {
          throw new Error("Snapshot not found");
        }
        const {
          category,
          timestamp,
          id,
          snapshot: storeSnapshot,
          data,
        } = result;
        return storeSnapshot;
      } catch (error) {
        console.error("Error fetching snapshot:", error);
        throw error;
      }
    },

    getSnapshotById: async function (
      snapshot: (
        id: string
      ) => Promise<{
        category: Category
        timestamp: string | number | Date | undefined;
        id: string | number | undefined;
        snapshot: Snapshot<T, K>;
        snapshotStore: SnapshotStore<T, K>;
        data: T;
      }> | undefined,
      snapshotId: string,
      snapshotContainer: SnapshotContainer<T, K>,
      criteria: CriteriaType, // Adjust the type as needed
      storeId: number
    ): Promise<SnapshotStore<T, K> | undefined> {
      try {
       
      
        const config = await snapshotApi.getSnapshotStoreConfig(
          snapshotId, snapshotContainer, criteria, storeId
        )

        if (!config) {
          throw new Error("Snapshot configuration not found");
        }

        // Here, assuming `config` is of type `SnapshotStoreConfig<SnapshotWithCriteria<BaseData, any>, Data>`
        // and you need to create or access a `SnapshotStore<BaseData, K>` instance
        const snapshotStore: SnapshotStore<BaseData, K> = {
          id: config.id, // Ensure `id` is accessible from `SnapshotStoreConfig`
          key: config.key ? config.key : config.snapshotId, // Ensure `key` is accessible from `SnapshotStoreConfig`
          topic: config.topic ? config.topic : "defaultTopic",
          date: new Date(), // Adjust as per your logic
          title: "Snapshot Title", // Example, adjust as per your logic
          type: "snapshot_type", // Example, adjust as per your logic
          subscription: null, // Example, adjust as per your logic
          category: config.category,
          timestamp: new Date(),
          findIndex: config.findIndex,
          splice: config.splice,
          keys: config.keys,
          config: config.config,
          message: config.message,
          createdBy: "",
          eventRecords: null,
          subscribers: config.subscribers,
          store: config.store,
          stores: null,
          snapshots: config.snapshots,
          snapshotConfig: config.snapshotConfig,
          meta: config.meta,
          snapshotMethods: config.snapshotMethods,
          getSnapshotsBySubscriber: config.getSnapshotsBySubscriber,
          getSnapshotsBySubscriberSuccess: config.getSnapshotsBySubscriberSuccess,
          getSnapshotsByTopic: config.getSnapshotsByTopic,
          getSnapshotsByTopicSuccess: config.getSnapshotsByTopicSuccess,
          getSnapshotsByCategory: config.getSnapshotsByCategory,
          getSnapshotsByCategorySuccess: config.getSnapshotsByCategorySuccess,
          getSnapshotsByKey: config.getSnapshotsByKey,
          getSnapshotsByKeySuccess: config.getSnapshotsByKeySuccess,
          getSnapshotsByPriority: config.getSnapshotsByPriority,
          getSnapshotsByPrioritySuccess: config.getSnapshotsByPrioritySuccess,
          getStoreData: config.getStoreData,
          updateStoreData: config.updateStoreData,
          updateDelegate: config.updateDelegate,
          getSnapshotContainer: config.getSnapshotContainer,
          getSnapshotVersions: config.getSnapshotVersions,
          createSnapshot: config.createSnapshot,
          deleteSnapshot: config.deleteSnapshot,
          snapshotStoreConfig: config.snapshotStoreConfig,
          getSnapshotItems: config.getSnapshotItems,
          dataStore: config.dataStore,
          snapshotStores: config.snapshotStores,
          initialState: config.initialState,
          snapshotItems: config.snapshotItems,
          nestedStores: config.nestedStores,
          snapshotIds: config.snapshotIds,
          dataStoreMethods: config.dataStoreMethods,
          delegate: config.delegate,
          findSnapshotStoreById: config.findSnapshotStoreById,
          saveSnapshotStore: config.saveSnapshotStore,
          events: config.events,
          subscriberId: config.subscriberId,
          length: config.length,
          content: config.content,
          value: config.value,
          todoSnapshotId: config.todoSnapshotId,
          snapshotStore: null,
          dataItems: config.dataItems,
          newData: null,
          storeId: 0,
          handleSnapshotOperation: config.handleSnapshotOperation,
          getStore: config.getStore,
          addStore: config.addStore,
          getCustomStore: config.getCustomStore,
          addSCustomStore: config.addSCustomStore,
          removeStore: config.removeStore,
          onSnapshot: config.onSnapshot,
          getData: config.getData,
          getDataStore: config.getDataStore,
          addSnapshotToStore: config.addSnapshotToStore,
          addSnapshotItem: config.addSnapshotItem,
          addNestedStore: config.addNestedStore,
          defaultSubscribeToSnapshots: config.defaultSubscribeToSnapshots,
          defaultCreateSnapshotStores: config.defaultCreateSnapshotStores,
          createSnapshotStores: config.createSnapshotStores,
          subscribeToSnapshots: config.subscribeToSnapshots,
          subscribeToSnapshot: config.subscribeToSnapshot,
          defaultOnSnapshots: config.defaultOnSnapshots,
          onSnapshots: config.onSnapshots,
          transformSubscriber: config.transformSubscriber,
          isSnapshotStoreConfig: config.isSnapshotStoreConfig,
          transformDelegate: config.transformDelegate,
          initializedState: config.initializedState,
          transformedDelegate: config.transformedDelegate,
          getSnapshotIds: config.getSnapshotIds,
          getNestedStores: config.getNestedStores,
          getFindSnapshotStoreById: config.getFindSnapshotStoreById,
          getAllKeys: config.getAllKeys,
          mapSnapshot: config.mapSnapshot,
          getAllItems: config.getAllItems,
          // addData: config.addData,
          // addDataStatus: config.addDataStatus,
          // removeData: config.removeData,
          // updateData: config.updateData,
          updateDataTitle: config.updateDataTitle,
          updateDataDescription: config.updateDataDescription,
          updateDataStatus: config.updateDataStatus,
          addDataSuccess: config.addDataSuccess,
          getDataVersions: config.getDataVersions,
          updateDataVersions: config.updateDataVersions,
          getBackendVersion: config.getBackendVersion,
          getFrontendVersion: config.getFrontendVersion,
          fetchData: config.fetchData,
          defaultSubscribeToSnapshot: config.defaultSubscribeToSnapshot,
          handleSubscribeToSnapshot: config.handleSubscribeToSnapshot,
          snapshot: config.snapshot,
          removeItem: config.removeItem,
          getSnapshot: config.getSnapshot,
          getSnapshotById: config.getSnapshotById,
          getSnapshotSuccess: config.getSnapshotSuccess,
          getSnapshotId: config.getSnapshotId,
          getSnapshotArray: config.getSnapshotArray,
          getItem: config.getItem,
          setItem: config.setItem,
          addSnapshotFailure: config.addSnapshotFailure,
          addSnapshotSuccess: config.addSnapshotSuccess,
          getParentId: config.getParentId,
          getChildIds: config.getChildIds,
          compareSnapshotState: config.compareSnapshotState,
          deepCompare: config.deepCompare,
          shallowCompare: config.shallowCompare,
          getDataStoreMethods: config.getDataStoreMethods,
          getDelegate: config.getDelegate,
          determineCategory: config.determineCategory,
          determineSnapshotStoreCategory: config.determineSnapshotStoreCategory,
          determinePrefix: config.determinePrefix,
          updateSnapshot: config.updateSnapshot,
          updateSnapshotSuccess: config.updateSnapshotSuccess,
          updateSnapshotFailure: config.updateSnapshotFailure,
          removeSnapshot: config.removeSnapshot,
          clearSnapshots: config.clearSnapshots,
          addSnapshot: config.addSnapshot,
          createInitSnapshot: config.createInitSnapshot,
          createSnapshotSuccess: config.createSnapshotSuccess,
          clearSnapshotSuccess: config.clearSnapshotSuccess,
          clearSnapshotFailure: config.clearSnapshotFailure,
          createSnapshotFailure: config.createSnapshotFailure,
          setSnapshotSuccess: config.setSnapshotSuccess,
          setSnapshotFailure: config.setSnapshotFailure,
          updateSnapshots: config.updateSnapshots,
          updateSnapshotsSuccess: config.updateSnapshotsSuccess,
          updateSnapshotsFailure: config.updateSnapshotsFailure,
          initSnapshot: config.initSnapshot,
          takeSnapshot: config.takeSnapshot,
          takeSnapshotSuccess: config.takeSnapshotSuccess,
          takeSnapshotsSuccess: config.takeSnapshotsSuccess,
          configureSnapshotStore: config.configureSnapshotStore,
          updateSnapshotStore: config.updateSnapshotStore,
          flatMap: config.flatMap,
          setData: config.setData,
          getState: config.getState,
          setState: config.setState,
          validateSnapshot: config.validateSnapshot,
          handleSnapshot: config.handleSnapshot,
          handleActions: config.handleActions,
          setSnapshot: config.setSnapshot,
          transformSnapshotConfig: config.transformSnapshotConfig,
          setSnapshotData: config.setSnapshotData,
          setSnapshots: config.setSnapshots,
          clearSnapshot: config.clearSnapshot,
          mergeSnapshots: config.mergeSnapshots,
          reduceSnapshots: config.reduceSnapshots,
          sortSnapshots: config.sortSnapshots,
          filterSnapshots: config.filterSnapshots,
          mapSnapshotsAO: config.mapSnapshotsAO,
          mapSnapshots: config.mapSnapshots,
          findSnapshot: config.findSnapshot,
          getSubscribers: config.getSubscribers,
          notify: config.notify,
          notifySubscribers: config.notifySubscribers,
          subscribe: config.subscribe,
          unsubscribe: config.unsubscribe,
          fetchSnapshot: config.fetchSnapshot,
          fetchSnapshotSuccess: config.fetchSnapshotSuccess,
          fetchSnapshotFailure: config.fetchSnapshotFailure,
          getSnapshots: config.getSnapshots,
          getAllSnapshots: config.getAllSnapshots,
          getSnapshotStoreData: config.getSnapshotStoreData,
          generateId: config.generateId,
          batchFetchSnapshots: config.batchFetchSnapshots,
          batchTakeSnapshotsRequest: config.batchTakeSnapshotsRequest,
          batchUpdateSnapshotsRequest: config.batchUpdateSnapshotsRequest,
          batchFetchSnapshotsSuccess: config.batchFetchSnapshotsSuccess,
          batchFetchSnapshotsFailure: config.batchFetchSnapshotsFailure,
          batchUpdateSnapshotsSuccess: config.batchUpdateSnapshotsSuccess,
          batchUpdateSnapshotsFailure: config.batchUpdateSnapshotsFailure,
          batchTakeSnapshot: config.batchTakeSnapshot,
          handleSnapshotSuccess: config.handleSnapshotSuccess,
          [Symbol.iterator]: function (): IterableIterator<Snapshot<BaseData, any>> {
            throw new Error("Function not implemented.");
          }
        };
        return snapshotStore;
      } catch (error) {
        console.error("Error fetching snapshot:", error);
        throw error;
      }
    },
    batchTakeSnapshotsRequest: (snapshotData: any) => {
      console.log("Batch snapshot taking requested.");
      return Promise.resolve({ snapshots: [] });
    },
    updateSnapshotSuccess: () => {
      console.log("Snapshot updated successfully.");
    },
    setSnapshotFailure: (error: Error) => {
      console.error("Error in snapshot update:", error);
    },
    batchUpdateSnapshotsSuccess: (
      subscribers: SubscriberCollection<SnapshotWithCriteria<Data, K>, K>,
      snapshots: Snapshots<T, K>
    ) => {
      try {
        console.log("Batch snapshots updated successfully.");
        return [{ snapshots }];
      } catch (error) {
        console.error("Error in batch snapshots update:", error);
        throw error;
      }
    },
    getData: async () => {
      try {
        const data = await fetchData(String(endpoints));
        if (data && data.data) {
          return data.data.map((snapshot: any) => ({
            ...snapshot,
            data: snapshot.data,
          }));
        }
        return [];
      } catch (error) {
        console.error("Error fetching data:", error);
        throw error;
      }
    },
    isExpired: function () {
      return !!this.expirationDate && this.expirationDate < new Date();
    },

    compress: function () {
      this.isCompressed = true;
    },
    isEncrypted: false,
    encrypt: function () {
      this.isEncrypted = true;
    },
    decrypt: function () {
      this.isEncrypted = false;
    },
    ownerId: "owner-id",
    getOwner: function () {
      return this.ownerId ?? "defaultOwner"; // Replace "defaultOwner" with your desired default value
    },
    version: "1.0.0",
    previousVersionId: "0.9.0",
    nextVersionId: "1.1.0",
    auditTrail: [],
    addAuditRecord: function (record: AuditRecord) {
      if (this.auditTrail) {
        this.auditTrail.push(record);
      }
    },
    retentionPolicy: {
      retentionPeriod: 0, // in days
      cleanupOnExpiration: false,
      retainUntil: new Date(),
    },
    dependencies: [],
    [Symbol.iterator]: function (): IterableIterator<any> {
      const snapshotStore = this;
      return snapshotStore[Symbol.iterator]();
    },
    [Symbol.asyncIterator]: function (): AsyncIterableIterator<any> {
      const snapshotStore = this;
      return snapshotStore[Symbol.asyncIterator]();
    },
    [Symbol.toStringTag]: "SnapshotStore",
  },
];

export {
    // snapshotStoreConfigInstance, 
    snapshotStoreConfigs
};
export type { InitializedConfig, UserConfig };


