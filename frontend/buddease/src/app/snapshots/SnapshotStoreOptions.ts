import { Content } from '@/app/components/models/content/AddContent';
import { Attachment } from "@/app/documents/attachment/Attachment";
import { SnapshotContainerType } from '@/app/snapshots/SnapshotContainer';
import { SnapshotEvent } from '@/app/typings/eventTypes';

import { Category } from '@/app/libraries/categories/generateCategoryProperties';
import { BaseData } from '@/app/models/data/Data';
import { CategoryProperties } from '@/app/pages/personas/ScenarioBuilder';
import { CriteriaType } from '@/app/pages/searchs/CriteriaType';
import { DataStoreMethods, DataStoreWithSnapshotMethods } from '@/app/projects/DataAnalysisPhase/DataProcessing/ DataStoreMethods';
import { SnapshotStoreConfig } from '@/app/snapshots';
import { ConfigureSnapshotStorePayload } from "@/app/snapshots/SnapshotConfig";
import { CustomSnapshotData } from "@/app/snapshots/SnapshotData";
import SnapshotStore from '@/app/snapshots/SnapshotStore';
import { ProjectMetadata, StructuredMetadata } from '@/config/StructuredMetadata';
import {
  MultipleEventsCallbacks, Snapshot, SnapshotConfig, SnapshotContainer, SnapshotData, SnapshotOperation, SnapshotOperationType, Snapshots,
  SnapshotStoreMethods, SnapshotStoreProps,
  SnapshotWithCriteria
} from '@/index';
import { SimulatedDataSource } from "./createSnapshotOptions";
import { MultipleEventsCallbacks } from "@/app/subscribers/subscribeToSnapshotsImplementation";

import { SharedIdentifiers } from "@/app/documents/RelatedProps";
import { DataStore, EventRecord } from '@/app/projects/DataAnalysisPhase/DataProcessing/DataStore';
import { SnapshotStoreCore } from '@/app/snapshots/SnapshotCore';
import CalendarManagerStoreClass from "@/app/state/stores/CalendarManagerStore";
import { SubscriberCollection } from '@/app/subscribers/SubscriberCollection';
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/config/BaseConfig';
import { RealtimeDataItem } from '@/models/realtime/RealtimeData';
import { UnifiedMetadata } from "@/server/database/MetaDataOptions";
import { SchemaField } from '@/server/database/SchemaField';
import { Subscription } from '@/subscriptions/Subscription';
import { Subscriber } from '@/users/Subscriber';


type UnifiedConfigOption<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> = string | SnapshotConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null;

type MetaDataOptions<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> = DefaultMeta<T, K> | ProjectMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;  

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
> = T | DataStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | Map<string, SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> | null;  

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
  () => Promise<SnapshotWithCriteria<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] | null>;  


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
> extends SnapshotStoreCore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
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
    dataStoreMethods: DataStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    category?:  Category,
    categoryProperties?: CategoryProperties | undefined,
    callback?: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void,
    snapshotData?: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshotStoreConfig?: SnapshotStoreConfig<T, K, Meta, never>,
    subscribers?: SubscriberCollection<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ) => Promise<SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
}

interface SnapshotConfigOption<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T  
> extends Omit<SnapshotInstanceProps<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, 'configureSnapshot'> {  // Exclude configureSnapshot
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
  > = BaseData<any> & Omit<SnapshotWithCriteria<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, keyof BaseData<any>>;



// This automatically updates everywhere:
type UpdatedSignature<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> = SnapshotStoreOptions<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>['createSnapshotStore'];

interface SnapshotStoreOptions<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> extends SharedIdentifiers<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  storeId: number;
  data?: InitializedData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null;
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
  snapshots?: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  eventRecords?: Record<string, EventRecord<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]> | null;
  records: Record<string, CalendarManagerStoreClass<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]> | []; // Store calendar records
  snapshotRecords?: Record<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>; // Add snapshotRecords to store snapshots

  category: Category;
  date: string | number | Date | undefined;
  content?: string | Content<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined;
  snapshotId?: string | number | null;
  snapshotStoreConfig?: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined;
  metadata?: UnifiedMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | {}
  multipleCallbacks: MultipleEventsCallbacks<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>;
  snapshotConfig?: SnapshotConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] | undefined;

  dataStoreMethods?: Partial<DataStoreWithSnapshotMethods<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> | undefined;
  snapshotMethods: SnapshotStoreMethods<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] | undefined;
  configOption?: UnifiedConfigOption<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>; 

  delegate: InitializedDelegate<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null;
  searchDelegate?: InitializedDelegateSearch<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  getDelegate: (context: {
    useSimulatedDataSource: boolean;
    simulatedDataSource: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
  }) => Promise<DataStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>;

  getCategory: (
    snapshotId: string,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    type: string,
    event: SnapshotEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshotConfig: SnapshotConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    category?:  Category,
    additionalHeaders?: Record<string, string>
  ) => Promise<{ categoryProperties?: CategoryProperties; snapshots: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] }>;

  initSnapshot: (
    snapshot: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null,
    snapshotId: string | null,
    snapshotData: SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    category?: Category,    
    snapshotConfig: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    callback: (snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void
  ) => void,

  createSnapshotStore?: (
    id: string,
    currentSnapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshotId: string,
    storeId: number,
    data: Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
    events: Record<string, CalendarManagerStoreClass<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>,
    dataItems: RealtimeDataItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
    newData: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    payload: ConfigureSnapshotStorePayload<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    store: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    category?: Category,
    categoryProperties: CategoryProperties | undefined,
    callback: (createdStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void,
    snapshotDataConfig?: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] // Array of SnapshotStoreConfig objects
  ) => Promise<SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null>,

  configureSnapshot: (
    id: string,
    storeId: number,
    snapshotId: string,
    snapshotData: SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    dataStoreMethods: DataStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    category?:  Category,
    categoryProperties?: CategoryProperties | undefined,
    callback?: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void,
    snapshotStore?: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshotStoreConfig?: SnapshotStoreConfig<T, K, StructuredMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, never>,
  ) => Promise<SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,

  configureSnapshotStore: (
    currentSnapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, // current snapshot
    snapshotId: string,
    data: Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
    events: Record<string, CalendarManagerStoreClass<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>,
    dataItems:RealtimeDataItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
    newSnapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    payload: ConfigureSnapshotStorePayload<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    store: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,  // just one
    callback?: (
      store: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void
  ) => Promise<{
    currentSnapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    storeConfig: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    updatedStore?: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  }>

  getDataStoreMethods: (
    snapshotStoreConfig: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
    dataStoreMethods: Partial<DataStoreWithSnapshotMethods<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>
  ) => Partial<DataStoreWithSnapshotMethods<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>
  
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
    snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,

    operation: SnapshotOperation<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    operationType: SnapshotOperationType,
    callback: (snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void,
  ) => Promise<SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null>;
  // Added handleSnapshotOperation
  displayToast: (message: string, type: string, duration: number, onClose: () => void) => Promise<void> | null

  addToSnapshotList: (
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
    subscribers: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
    storeProps?: SnapshotStoreProps<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ) => Promise<Subscription<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null>;

  getSnapshotConfig: (
    id: string | number,
    snapshotId: string | null,
    criteria: CriteriaType,
    category?: Category,
    categoryProperties: CategoryProperties | undefined,
    subscriberId: string | undefined,
    delegate: SnapshotWithCriteria<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] | null,
    snapshotData: SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshot: (
      id: string | number | undefined,
      snapshotId: string | null,
      snapshotData: SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      category?: Category,
      categoryProperties: CategoryProperties | undefined,
      callback: (snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null) => void,
      dataStore: DataStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      dataStoreMethods: DataStoreMethods<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      // dataStoreSnapshotMethods: DataStoreWithSnapshotMethods<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      metadata: UnifiedMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      subscriberId: string, // Add subscriberId here
      endpointCategory: string | number,// Add endpointCategory here
      storeProps: SnapshotStoreProps<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      snapshotConfigData: SnapshotConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      subscription: Subscription<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      snapshotStoreConfigData?: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      snapshotContainer?: SnapshotContainerType<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    ) => Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
    data: Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
    events: Record<string, CalendarManagerStoreClass<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>, // Added prop
    dataItems: RealtimeDataItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[], // Added prop
    newData: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, // Added prop
    payload: ConfigureSnapshotStorePayload<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, // Added prop
    store: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, // Added prop
    callback: (snapshot: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void, // Added prop
    storeProps: SnapshotStoreProps<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    endpointCategory: string | number,
    snapshotContainer: Promise<SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
  ) => SnapshotConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;

  createSnapshot: (
    id: string,
    snapshotData: SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    category?: Category,
    categoryProperties: CategoryProperties | undefined,
    callback?: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void,
    snapshotStore?: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
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
    snapshotData: SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    dataStoreMethods: DataStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    category?:  Category,
    categoryProperties?: CategoryProperties | undefined,
    callback?: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void,
    snapshotStore?: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapsohotStoreConfig?: SnapshotStoreConfig<T, K, StructuredMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, never>,
  ) => SnapshotConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined,

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
  simulatedDataSource: SimulatedDataSource<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
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

