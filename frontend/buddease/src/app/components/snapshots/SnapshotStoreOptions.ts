import { Content } from '@/app/components/models/content/AddContent';
import { Attachment } from '@/app/components/documents/Attachment/attachment';

import { BaseData } from '@/app/components/models/data/Data';
import { SnapshotStoreConfig } from '@/app/components/snapshots';
import { CustomSnapshotData } from "@/app/components/snapshots/SnapshotData";
import SnapshotStore from '@/app/components/snapshots/SnapshotStore';
import { ProjectMetadata, StructuredMetadata } from '@/app/configs/StructuredMetadata';
import { CategoryProperties } from '@/app/pages/personas/ScenarioBuilder';
import { CriteriaType } from '@/app/pages/searchs/CriteriaType';
import { Category } from '../libraries/categories/generateCategoryProperties';
import { DataStoreMethods, DataStoreWithSnapshotMethods } from '../projects/DataAnalysisPhase/DataProcessing/ DataStoreMethods';
import { SimulatedDataSource } from "./createSnapshotOptions";
import {
  ConfigureSnapshotStorePayload, MultipleEventsCallbacks, Snapshot, SnapshotConfig, SnapshotContainer, SnapshotData, SnapshotOperation, SnapshotOperationType, Snapshots,
  SnapshotsArray, SnapshotStoreMethod, SnapshotStoreProps,
  SnapshotWithCriteria
} from './index';

import { SharedIdentifiers } from "../documents/RelatedProps";
import CalendarManagerStoreClass from "@/app/components/state/stores/CalendarManagerStore";
import { SubscriberCollection } from '@/app/components/users/SubscriberCollection';
import { UnifiedMetadata } from '@/app/configs/database/MetaDataOptions';
import { SchemaField } from '../../../server/database/SchemaField';
import { UnsubscribeDetails } from '../event/DynamicEventHandlerExample';
import { RealtimeDataItem } from '../models/realtime/RealtimeData';
import { DataStore, EventRecord, InitializedState } from '../projects/DataAnalysisPhase/DataProcessing/DataStore';
import { Subscription } from '../subscriptions/Subscription';
import { AllTypes } from '../typings/PropTypes';
import { Subscriber } from '../users/Subscriber';
import { SnapshotStoreCore } from './SnapshotCore';
import { ExcludedFields } from '@/app/components/routing/Fields';
import { BaseDataEntity, DefaultMeta, DefaultExcludedFields } from '@/app/configs/BaseConfig';


type MetaDataOptions<  T extends BaseDataEntity,
  K extends T = T > = DefaultMeta<T, K> | ProjectMetadata<T, K>;

// Define InitializedData with T and K
type InitializedData<  T extends BaseDataEntity,
  K extends T = T > =
  | T
  | Map<string, Snapshot<T, K, DefaultMeta<T, K>>>
  | SnapshotStoreConfig<T, K, DefaultMeta<T, K>>
  | null;

// Define InitializedDataStore with T and K
type InitializedDataStore<  T extends BaseDataEntity,
  K extends T = T
> = T | DataStore<T, K> | Map<string, SnapshotStore<T, K>> | null;

// Renaming SnapshotStoreConfig to InitializedDelegate
type InitializedDelegate<  T extends BaseDataEntity, K extends T = T> =
  SnapshotStoreConfig<T, K>[] | (() => Promise<SnapshotStoreConfig<T, K>[]>);

// New type for InitializedDelegateSearch
type InitializedDelegateSearch<
    T extends BaseDataEntity,
    K extends T = T
> =
  () => Promise<SnapshotWithCriteria<T, K>[] | null>;


type InitializedSnapshot<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>
> = Snapshot<T, K, Meta> & {
    /** 
     Flag indicating this snapshot has been properly initialized
    */
    isInitialized: true;
    
    /**
    * Timestamp when the snapshot was initialized
    */
    initializedAt: Date;
    
    /**
    * Optional version identifier
    */
    version?: string;
    
    /**
    * Optional initialization source
    */
    initializedFrom?: 'api' | 'cache' | 'local';
    
    /**
    * Additional initialization context
    */
    initializationContext?: Record<string, unknown>;
};

interface SnapshotInstanceProps<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>
> extends SnapshotStoreCore<T, K> {
  name: string;
  schema: Record<string, SchemaField>;
  options?: Record<string, any>; 
  expirationDate: Date;
  additionalData?: CustomSnapshotData<T>
  description?: string;
  priority?: string;
  version?: string;
  operation: SnapshotOperation<T, K>;
  id?: string | number | undefined;
  localStorage?: Storage;
  additionalHeaders?: Record<string, string>,
  configureSnapshot: (
    id: string,
    storeId: number,
    snapshotId: string,
    dataStoreMethods: DataStore<T, K>,
    category?:  Category,
    categoryProperties?: CategoryProperties | undefined,
    callback?: (snapshot: Snapshot<T, K>) => void,
    snapshotData?: SnapshotStore<T, K>,
    snapshotStoreConfig?: SnapshotStoreConfig<T, K, Meta, never>,
    subscribers?: SubscriberCollection<T, K>
  ) => Promise<SnapshotStore<T, K>>,
}

interface SnapshotConfigOption<
  T extends BaseDataEntity,
  K extends T = T
>
  extends Omit<SnapshotInstanceProps<T, K>, 'configureSnapshot'> {  // Exclude configureSnapshot
  snapshotStore: SnapshotStoreConfig<T, K> | null; // Define as config option
  taskIdToAssign: string;
  clearSnapshots: () => void;
  getParentId: (snapshot: Snapshot<T, K>) => string | null;
  getChildIds: (id: string, childSnapshot: Snapshot<T, K>) => string[];
}


type SnapshotWithCriteriaAsBase<
  T extends BaseDataEntity,
  K extends T = T
> =
  BaseData<any> & Omit<SnapshotWithCriteria<T, K>, keyof BaseData<any>>;

interface SnapshotStoreOptions<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>
> extends SharedIdentifiers<T, K, Meta, ExcludedFields> {
  storeId: number;
  data?: InitializedData<T, K> | null;
  baseURL: string;
  enabled: boolean;
  maxRetries: number;
  retryDelay: number;
  maxAge: string | number | undefined;
  staleWhileRevalidate: number;
  cacheKey: string;
  initialState: InitializedState<T, K, Meta> | {};
  initialConfig?: SnapshotStoreConfig<T, K> | null;
  initialBaseConfig: SnapshotConfig<T, K>;
  key?: string;
  keys?: string[];
  snapshotObj?: Snapshot<T, K, Meta> | null;
  snapshots?: Snapshots<T, K, Meta>;
  eventRecords: Record<string, EventRecord<T, K>[]> | null;
  records: Record<string, CalendarManagerStoreClass<T, K>[]> | []; // Store calendar records
  snapshotRecords?: Record<string, Snapshot<T, K>[]>; // Add snapshotRecords to store snapshots

  category: Category;
  date: string | number | Date | undefined;
  content?: string | Content<T, K> | undefined;
  snapshotId?: string | number | null;
  snapshotStoreConfig?: SnapshotStoreConfig<T, K, Meta, ExcludedFields> | undefined;
  metadata?: UnifiedMetadata<T, K, Meta, ExcludedFields> | {}
  callbacks: MultipleEventsCallbacks<Snapshot<T, K>>;
  snapshotConfig?: SnapshotConfig<T, K>[] | undefined;

  subscribeToSnapshots: (
    snapshotStore: SnapshotStore<T, K>,
    snapshotId: string,
    snapshotData: SnapshotData<T, K>,
    category: Category | undefined,    snapshotConfig: SnapshotStoreConfig<T, K>,
    callback: (
      snapshotStore: SnapshotStore<T, K>,
      snapshots: SnapshotsArray<T, K, Meta>
    ) => Subscriber<T, K> | null,
    snapshots: SnapshotsArray<T, K, Meta>,
    unsubscribe?: UnsubscribeDetails,
  ) => SnapshotsArray<T, K, Meta> | [];

  subscribeToSnapshot: (
    snapshotId: string,
    callback: (snapshot: Snapshot<T, K>) => Subscriber<T, K> | null,
    snapshot: Snapshot<T, K>
  ) => Subscriber<T, K> | null;

  unsubscribeToSnapshots: (
    snapshotId: string,
    snapshot: Snapshot<T, K>,
    type: string,
    event: Event,
    callback: (snapshot: Snapshot<T, K>) => void
  ) => void;
  unsubscribeToSnapshot: (
    snapshotId: string,
    snapshot: Snapshot<T, K>,
    type: string,
    event: Event,
    callback: (snapshot: Snapshot<T, K>) => void
  ) => void;
  delegate: InitializedDelegate<T, K> | null;
  searchDelegate?: InitializedDelegateSearch<T, K>;
  getDelegate: (context: {
    useSimulatedDataSource: boolean;
    simulatedDataSource: SnapshotStoreConfig<T, K>[];
  }) => Promise<DataStore<T, K>[]>;

  getCategory: (
    snapshotId: string,
    snapshot: Snapshot<T, K>,
    type: string,
    event: Event,
    snapshotConfig: SnapshotConfig<T, K>,
    category?:  Category,
    additionalHeaders?: Record<string, string>
  ) => Promise<{ categoryProperties?: CategoryProperties; snapshots: Snapshot<T, K>[] }>;


  initSnapshot: (
    snapshot: SnapshotStore<T, K> | Snapshot<T, K> | null,
    snapshotId: string | null,
    snapshotData: SnapshotData<T, K>,
    category: Category | undefined,    snapshotConfig: SnapshotStoreConfig<T, K>,
    callback: (snapshotStore: SnapshotStore<T, K>) => void
  ) => void,

  createSnapshotStore: (
    id: string,
    storeId: number,
    snapshotId: string,
    snapshotStoreData: SnapshotStore<T, K>[],
    category: Category | undefined,
    categoryProperties: CategoryProperties | undefined,
    callback?: (snapshotStore: SnapshotStore<T, K>) => void,
    snapshotDataConfig?: SnapshotStoreConfig<T, K>[]
  ) => Promise<SnapshotStore<T, K> | null>,

  configureSnapshot: (
    id: string,
    storeId: number,
    snapshotId: string,
    snapshotData: SnapshotData<T, K>,
    dataStoreMethods: DataStore<T, K>,
    category?:  Category,
    categoryProperties?: CategoryProperties | undefined,
    callback?: (snapshot: Snapshot<T, K>) => void,
    snapshotStore?: SnapshotStore<T, K>,
    snapshotStoreConfig?: SnapshotStoreConfig<T, K, StructuredMetadata<T, K>, never>,
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
    callback?: (
      snapshotStore: SnapshotStore<T, K>) => void
  ) => Promise<{
    snapshotStore: SnapshotStore<T, K>,
    storeConfig: SnapshotStoreConfig<T, K>,
    updatedStore?: SnapshotStore<T, K>
  }>
  dataStoreMethods?: Partial<DataStoreWithSnapshotMethods<T, K>> | undefined;
  getDataStoreMethods: (
    snapshotStoreConfig: SnapshotStoreConfig<T, K>[],
    dataStoreMethods: Partial<DataStoreWithSnapshotMethods<T, K>>
  ) => Partial<DataStoreWithSnapshotMethods<T, K>>

  snapshotMethods: SnapshotStoreMethod<T, K>[] | undefined;
  configOption?: string | SnapshotStoreConfig<T, K> | null;

  handleSnapshotOperation: (
    snapshot: Snapshot<T, K>,
    data: SnapshotStoreConfig<T, K>,
    mappedData: Map<string, SnapshotStoreConfig<T, K>>,
    operation: SnapshotOperation<T, K>,
    operationType: SnapshotOperationType
  ) => Promise<Snapshot<T, K> | null>;

  // Added handleSnapshotOperation
  handleSnapshotStoreOperation: (
    snapshotId: string,
    snapshotStore: SnapshotStore<T, K>,
    snapshot: Snapshot<T, K>,

    operation: SnapshotOperation<T, K>,
    operationType: SnapshotOperationType,
    callback: (snapshotStore: SnapshotStore<T, K>) => void,
  ) => Promise<SnapshotStoreConfig<T, K> | null>;
  // Added handleSnapshotOperation
  displayToast: (message: string, type: string, duration: number, onClose: () => void) => Promise<void> | null

  addToSnapshotList: (
    snapshot: Snapshot<T, K>,
    subscribers: Subscriber<T, K>[],
    storeProps?: SnapshotStoreProps<T, K>
  ) => Promise<Subscription<T, K> | null>;

  getSnapshotConfig: (
    id: string | number,
    snapshotId: string | null,
    criteria: CriteriaType,
    category: Category | undefined,
    categoryProperties: CategoryProperties | undefined,
    subscriberId: string | undefined,
    delegate: SnapshotWithCriteria<T, K, Meta>[] | null,
    snapshotData: SnapshotData<T, K>,
    snapshot: (
      id: string | number | undefined,
      snapshotId: string | null,
      snapshotData: SnapshotData<T, K>,
      category: Category | undefined,
      categoryProperties: CategoryProperties | undefined,
      callback: (snapshotStore: SnapshotStore<T, K> | null) => void,
      dataStore: DataStore<T, K>,
      dataStoreMethods: DataStoreMethods<T, K>,
      // dataStoreSnapshotMethods: DataStoreWithSnapshotMethods<T, K>,
      metadata: UnifiedMetadata<T, K, Meta, ExcludedFields>,
      subscriberId: string, // Add subscriberId here
      endpointCategory: string | number,// Add endpointCategory here
      storeProps: SnapshotStoreProps<T, K>,
      snapshotConfigData: SnapshotConfig<T, K>,
      subscription: Subscription<T, K>,
      snapshotStoreConfigData?: SnapshotStoreConfig<T, K>,
      snapshotContainer?: SnapshotStore<T, K> | Snapshot<T, K> | null,
    ) => Promise<Snapshot<T, K>>,
    data: Map<string, Snapshot<T, K>>,
    events: Record<string, CalendarManagerStoreClass<T, K>[]>, // Added prop
    dataItems: RealtimeDataItem[], // Added prop
    newData: Snapshot<T, K>, // Added prop
    payload: ConfigureSnapshotStorePayload<T, K>, // Added prop
    store: SnapshotStore<T, K>, // Added prop
    callback: (snapshot: SnapshotStore<T, K>) => void, // Added prop
    storeProps: SnapshotStoreProps<T, K>,
    endpointCategory: string | number,
    snapshotContainer: Promise<SnapshotContainer<T, K>>,
  ) => SnapshotConfig<T, K>;

  createSnapshot: (
    id: string,
    snapshotData: SnapshotData<T, K>,
    category: Category | undefined,    categoryProperties: CategoryProperties | undefined,
    callback?: (snapshot: Snapshot<T, K>) => void,
    snapshotStore?: SnapshotStore<T, K>,
    snapshotStoreConfig?: SnapshotStoreConfig<T, K, StructuredMetadata<T, K>, never> | null,
    snapshotStoreConfigSearch?: SnapshotStoreConfig<
      BaseData<any>, // T is BaseData
      SnapshotWithCriteriaAsBase<any, BaseData<any>> // K extends T
  >
  ) => Snapshot<T, K> | null,

  configureSnap: (
    id: string,
    storeId: number,
    snapshotId: string,
    snapshotData: SnapshotData<T, K>,
    dataStoreMethods: DataStore<T, K>,
    category?:  Category,
    categoryProperties?: CategoryProperties | undefined,
    callback?: (snapshot: Snapshot<T, K>) => void,
    snapshotStore?: SnapshotStore<T, K>,
    snapsohotStoreConfig?: SnapshotStoreConfig<T, K, StructuredMetadata<T, K>, never>,
  ) => SnapshotConfig<T, K> | undefined,

  isAutoDismiss?: boolean;
  isAutoDismissable?: boolean;
  isAutoDismissOnNavigation?: boolean;
  isAutoDismissOnAction?: boolean;
  isAutoDismissOnTimeout?: boolean;
  isAutoDismissOnTap?: boolean;
  isClickable?: boolean;
  isClosable?: boolean;
  optionalData?: any;
  useSimulatedDataSource?: boolean;
  simulatedDataSource: SimulatedDataSource<T, K, Meta>;
  browserSpecific?: {
    isMobile?: boolean;
    browserType?: string; // e.g., "Chrome", "Firefox"
  };
}

export type {
  InitializedData, InitializedDataStore,
  InitializedDelegate, InitializedDelegateSearch,
  InitializedSnapshot, MetaDataOptions,
  SnapshotConfigOption, SnapshotInstanceProps,
  SnapshotStoreOptions,
  SnapshotWithCriteriaAsBase
};

