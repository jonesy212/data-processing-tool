import { Content } from '@/app/components/models/content/AddContent';
import { SnapshotEvent } from '@/app/typings/eventTypes';
import { SnapshotContainerType } from '@/app/snapshots/SnapshpshotContainer';

import { BaseData } from '@/app/models/data/Data';
import { ProjectMetadata, StructuredMetadata } from '@/config/StructuredMetadata';
import { Category } from '@/app/libraries/categories/generateCategoryProperties';
import { CategoryProperties } from '@/app/pages/personas/ScenarioBuilder';
import { CriteriaType } from '@/app/pages/searchs/CriteriaType';
import { DataStoreMethods, DataStoreWithSnapshotMethods } from '@/app/projects/DataAnalysisPhase/DataProcessing/ DataStoreMethods';
import { SnapshotStoreConfig } from '@/app/snapshots';
import { CustomSnapshotData } from "@/app/snapshots/SnapshotData";
import SnapshotStore from '@/app/snapshots/SnapshotStore';
import {
  ConfigureSnapshotStorePayload, MultipleEventsCallbacks, Snapshot, SnapshotConfig, SnapshotContainer, SnapshotData, SnapshotOperation, SnapshotOperationType, Snapshots,
  SnapshotStoreMethod, SnapshotStoreProps,
  SnapshotWithCriteria
} from '@/index';
import { SimulatedDataSource } from "./createSnapshotOptions";

import { SharedIdentifiers } from "@/app/documents/RelatedProps";
import { DataStore, EventRecord } from '@/app/projects/DataAnalysisPhase/DataProcessing/DataStore';
import CalendarManagerStoreClass from "@/app/state/stores/CalendarManagerStore";
import { SubscriberCollection } from '@/app/subscribers/SubscriberCollection';
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/config/BaseConfig';
import { RealtimeDataItem } from '@/models/realtime/RealtimeData';
import { UnifiedMetadata } from "@/server/database/MetaDataOptions";
import { SchemaField } from '@/server/database/SchemaField';
import { SnapshotStoreCore } from '@/app/snapshots/SnapshpshotCore';
import { Subscription } from '@/subscriptions/Subscription';
import { Subscriber } from '@/users/Subscriber';


type UnifiedConfigOption<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> = string | SnapshotConfig<T, K, Meta, ExcludedFields> | SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null;

type MetaDataOptions<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> = DefaultMeta<T, K> | ProjectMetadata<T, K, Meta, ExcludedFields>;  

type InitializedData<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> =
  | T
  | Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>  
  | SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  | null;

type InitializedDataStore<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> = T | DataStore<T, K, Meta, ExcludedFields> | Map<string, SnapshotStore<T, K, Meta, ExcludedFields>> | null;  

// Renaming SnapshotStoreConfig to InitializedDelegate
type InitializedDelegate<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> =
  SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] | (() => Promise<SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>);  

// New type for InitializedDelegateSearch
type InitializedDelegateSearch<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> =
  () => Promise<SnapshotWithCriteria<T, K, Meta, ExcludedFields>[] | null>;  


type InitializedSnapshot<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> = Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> & {  
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
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T 
> extends SnapshotStoreCore<T, K, Meta, ExcludedFields> {
  name: string;
  schema: Record<string, SchemaField>;
  options?: Record<string, any>; 
  expirationDate: Date;
  additionalData?: CustomSnapshotData<T>
  description?: string;
  priority?: string;
  version?: string;
  operation: SnapshotOperation<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  id?: string | number | undefined;
  localStorage?: Storage;
  additionalHeaders?: Record<string, string>,
  configureSnapshot: (
    id: string,
    storeId: number,
    snapshotId: string,
    dataStoreMethods: DataStore<T, K, Meta, ExcludedFields>,
    category?:  Category,
    categoryProperties?: CategoryProperties | undefined,
    callback?: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void,
    snapshotData?: SnapshotStore<T, K, Meta, ExcludedFields>,
    snapshotStoreConfig?: SnapshotStoreConfig<T, K, Meta, never>,
    subscribers?: SubscriberCollection<T, K, Meta, ExcludedFields>
  ) => Promise<SnapshotStore<T, K, Meta, ExcludedFields>>,
}

interface SnapshotConfigOption<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T  
> extends Omit<SnapshotInstanceProps<T, K, Meta, ExcludedFields>, 'configureSnapshot'> {  // Exclude configureSnapshot
  snapshotStore: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null; // Define as config option
  taskIdToAssign: string;
  clearSnapshots: () => void;
  getParentId: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => string | null;
  getChildIds: (id: string, childSnapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => string[];
}

type SnapshotWithCriteriaAsBase<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
  > = BaseData<any> & Omit<SnapshotWithCriteria<T, K, Meta, ExcludedFields>, keyof BaseData<any>>;



// This automatically updates everywhere:
type UpdatedSignature<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
  > = SnapshotStoreOptions<T, K, Meta, ExcludedFields>['createSnapshotStore'];

interface SnapshotStoreOptions<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> extends SharedIdentifiers<T, K, Meta, AttachmentType, ExcludedFields> {
  storeId: number;
  data?: InitializedData<T, K, Meta, ExcludedFields> | null;
  baseURL: string;
  enabled: boolean;
  maxRetries: number;
  retryDelay: number;
  maxAge: string | number | undefined;
  staleWhileRevalidate: number;
  cacheKey: string;
  key?: string;
  keys?: string[];
  snapshotObj?: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null;
  snapshots?: Snapshots<T, K, Meta, ExcludedFields, IncludedFields>;
  eventRecords?: Record<string, EventRecord<T, K, Meta, ExcludedFields>[]> | null;
  records: Record<string, CalendarManagerStoreClass<T, K, Meta, ExcludedFields>[]> | []; // Store calendar records
  snapshotRecords?: Record<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>; // Add snapshotRecords to store snapshots

  category: Category;
  date: string | number | Date | undefined;
  content?: string | Content<T, K, Meta, ExcludedFields> | undefined;
  snapshotId?: string | number | null;
  snapshotStoreConfig?: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined;
  metadata?: UnifiedMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | {}
  multipleCallbacks: MultipleEventsCallbacks<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>;
  snapshotConfig?: SnapshotConfig<T, K, Meta, ExcludedFields>[] | undefined;

  dataStoreMethods?: Partial<DataStoreWithSnapshotMethods<T, K, Meta, ExcludedFields>> | undefined;
  snapshotMethods: SnapshotStoreMethod<T, K, Meta, ExcludedFields>[] | undefined;
  configOption?: UnifiedConfigOption<T, K, Meta, ExcludedFields>; 

  delegate: InitializedDelegate<T, K, Meta, ExcludedFields> | null;
  searchDelegate?: InitializedDelegateSearch<T, K, Meta, ExcludedFields>;
  getDelegate: (context: {
    useSimulatedDataSource: boolean;
    simulatedDataSource: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
  }) => Promise<DataStore<T, K, Meta, ExcludedFields>[]>;

  getCategory: (
    snapshotId: string,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    type: string,
    event: SnapshotEvent<T, K, Meta, ExcludedFields>,
    snapshotConfig: SnapshotConfig<T, K, Meta, ExcludedFields>,
    category?:  Category,
    additionalHeaders?: Record<string, string>
  ) => Promise<{ categoryProperties?: CategoryProperties; snapshots: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] }>;

  initSnapshot: (
    snapshot: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null,
    snapshotId: string | null,
    snapshotData: SnapshotData<T, K, Meta, ExcludedFields>,
    category: Category | undefined,    
    snapshotConfig: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    callback: (snapshotStore: SnapshotStore<T, K, Meta, ExcludedFields>) => void
  ) => void,

  createSnapshotStore?: (
    id: string,
    currentSnapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshotId: string,
    storeId: number,
    data: Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
    events: Record<string, CalendarManagerStoreClass<T, K, Meta, ExcludedFields>[]>,
    dataItems: RealtimeDataItem<T, K, Meta, ExcludedFields>[],
    newData: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    payload: ConfigureSnapshotStorePayload<T, K, Meta, ExcludedFields>,
    store: SnapshotStore<T, K, Meta, ExcludedFields>,
    category: Category | undefined,
    categoryProperties: CategoryProperties | undefined,
    callback: (createdStore: SnapshotStore<T, K, Meta, ExcludedFields>) => void,
    snapshotDataConfig?: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] // Array of SnapshotStoreConfig objects
  ) => Promise<SnapshotStore<T, K, Meta, ExcludedFields> | null>,

  configureSnapshot: (
    id: string,
    storeId: number,
    snapshotId: string,
    snapshotData: SnapshotData<T, K, Meta, ExcludedFields>,
    dataStoreMethods: DataStore<T, K, Meta, ExcludedFields>,
    category?:  Category,
    categoryProperties?: CategoryProperties | undefined,
    callback?: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void,
    snapshotStore?: SnapshotStore<T, K, Meta, ExcludedFields>,
    snapshotStoreConfig?: SnapshotStoreConfig<T, K, StructuredMetadata<T, K>, never>,
  ) => Promise<SnapshotStore<T, K, Meta, ExcludedFields>>,

  configureSnapshotStore: (
    currentSnapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, // current snapshot
    snapshotId: string,
    data: Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
    events: Record<string, CalendarManagerStoreClass<T, K, Meta, ExcludedFields>[]>,
    dataItems:RealtimeDataItem<T, K, Meta, ExcludedFields>[],
    newSnapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    payload: ConfigureSnapshotStorePayload<T, K, Meta, ExcludedFields>,
    store: SnapshotStore<T, K, Meta, ExcludedFields>,  // just one
    callback?: (
      store: SnapshotStore<T, K, Meta, ExcludedFields>) => void
  ) => Promise<{
    currentSnapshotStore: SnapshotStore<T, K, Meta, ExcludedFields>,
    storeConfig: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    updatedStore?: SnapshotStore<T, K, Meta, ExcludedFields>
  }>

  getDataStoreMethods: (
    snapshotStoreConfig: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
    dataStoreMethods: Partial<DataStoreWithSnapshotMethods<T, K, Meta, ExcludedFields>>
  ) => Partial<DataStoreWithSnapshotMethods<T, K, Meta, ExcludedFields>>
  
  handleSnapshotOperation: (
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    data: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    mappedData: Map<string, SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
    operation: SnapshotOperation<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    operationType: SnapshotOperationType
  ) => Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null>;

  // Added handleSnapshotOperation
  handleSnapshotStoreOperation: (
    snapshotId: string,
    snapshotStore: SnapshotStore<T, K, Meta, ExcludedFields>,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,

    operation: SnapshotOperation<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    operationType: SnapshotOperationType,
    callback: (snapshotStore: SnapshotStore<T, K, Meta, ExcludedFields>) => void,
  ) => Promise<SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null>;
  // Added handleSnapshotOperation
  displayToast: (message: string, type: string, duration: number, onClose: () => void) => Promise<void> | null

  addToSnapshotList: (
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
    subscribers: Subscriber<T, K, Meta, ExcludedFields>[],
    storeProps?: SnapshotStoreProps<T, K, Meta, ExcludedFields>
  ) => Promise<Subscription<T, K, Meta, ExcludedFields> | null>;

  getSnapshotConfig: (
    id: string | number,
    snapshotId: string | null,
    criteria: CriteriaType,
    category: Category | undefined,
    categoryProperties: CategoryProperties | undefined,
    subscriberId: string | undefined,
    delegate: SnapshotWithCriteria<T, K, Meta, ExcludedFields>[] | null,
    snapshotData: SnapshotData<T, K, Meta, ExcludedFields>,
    snapshot: (
      id: string | number | undefined,
      snapshotId: string | null,
      snapshotData: SnapshotData<T, K, Meta, ExcludedFields>,
      category: Category | undefined,
      categoryProperties: CategoryProperties | undefined,
      callback: (snapshotStore: SnapshotStore<T, K, Meta, ExcludedFields> | null) => void,
      dataStore: DataStore<T, K, Meta, ExcludedFields>,
      dataStoreMethods: DataStoreMethods<T, K, Meta, ExcludedFields>,
      // dataStoreSnapshotMethods: DataStoreWithSnapshotMethods<T, K, Meta, ExcludedFields>,
      metadata: UnifiedMetadata<T, K, Meta, ExcludedFields>,
      subscriberId: string, // Add subscriberId here
      endpointCategory: string | number,// Add endpointCategory here
      storeProps: SnapshotStoreProps<T, K, Meta, ExcludedFields>,
      snapshotConfigData: SnapshotConfig<T, K, Meta, ExcludedFields>,
      subscription: Subscription<T, K, Meta, ExcludedFields>,
      snapshotStoreConfigData?: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      snapshotContainer?: SnapshotContainerType<T, K, Meta, ExcludedFields>,
    ) => Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
    data: Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
    events: Record<string, CalendarManagerStoreClass<T, K, Meta, ExcludedFields>[]>, // Added prop
    dataItems: RealtimeDataItem<T, K, Meta, ExcludedFields>[], // Added prop
    newData: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, // Added prop
    payload: ConfigureSnapshotStorePayload<T, K, Meta, ExcludedFields>, // Added prop
    store: SnapshotStore<T, K, Meta, ExcludedFields>, // Added prop
    callback: (snapshot: SnapshotStore<T, K, Meta, ExcludedFields>) => void, // Added prop
    storeProps: SnapshotStoreProps<T, K, Meta, ExcludedFields>,
    endpointCategory: string | number,
    snapshotContainer: Promise<SnapshotContainer<T, K, Meta, ExcludedFields>>,
  ) => SnapshotConfig<T, K, Meta, ExcludedFields>;

  createSnapshot: (
    id: string,
    snapshotData: SnapshotData<T, K, Meta, ExcludedFields>,
    category: Category | undefined,
    categoryProperties: CategoryProperties | undefined,
    callback?: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void,
    snapshotStore?: SnapshotStore<T, K, Meta, ExcludedFields>,
    snapshotStoreConfig?: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>| null,
    snapshotStoreConfigSearch?: SnapshotStoreConfig<
      BaseData<any>, // T is BaseData
      SnapshotWithCriteriaAsBase<any, BaseData<any>> // K extends T
  >
  ) => Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null,

  configureSnap: (
    id: string,
    storeId: number,
    snapshotId: string,
    snapshotData: SnapshotData<T, K, Meta, ExcludedFields>,
    dataStoreMethods: DataStore<T, K, Meta, ExcludedFields>,
    category?:  Category,
    categoryProperties?: CategoryProperties | undefined,
    callback?: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void,
    snapshotStore?: SnapshotStore<T, K, Meta, ExcludedFields>,
    snapsohotStoreConfig?: SnapshotStoreConfig<T, K, StructuredMetadata<T, K>, never>,
  ) => SnapshotConfig<T, K, Meta, ExcludedFields> | undefined,

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
  simulatedDataSource: SimulatedDataSource<T, K, Meta, ExcludedFields>;
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
  SnapshotWithCriteriaAsBase, UnifiedConfigOption
};

