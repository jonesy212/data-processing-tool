import SnapshotStore from '@/app/components/snapshots/SnapshotStore';
import { ProjectMetadata, StructuredMetadata } from '@/app/configs/StructuredMetadata';
import { CategoryProperties } from '@/app/pages/personas/ScenarioBuilder';
import { CriteriaType } from '@/app/pages/searchs/CriteriaType';
import { Category } from '../libraries/categories/generateCategoryProperties';
import { BaseData, Data } from '../models/data/Data';
import { DataStoreWithSnapshotMethods } from '../projects/DataAnalysisPhase/DataProcessing/ DataStoreMethods';
import { ConfigureSnapshotStorePayload, MultipleEventsCallbacks, Snapshot, SnapshotConfig, SnapshotData, SnapshotOperation, SnapshotOperationType, Snapshots, SnapshotsArray, SnapshotStoreConfig, SnapshotStoreMethod, SnapshotUnion, SnapshotWithCriteria } from '../snapshots/index';

import { UnifiedMetaDataOptions } from '@/app/configs/database/MetaDataOptions';
import { UnsubscribeDetails } from '../event/DynamicEventHandlerExample';
import { K, Meta, T } from '../models/data/dataStoreMethods';
import { RealtimeDataItem } from '../models/realtime/RealtimeData';
import { DataStore, EventRecord, InitializedState } from '../projects/DataAnalysisPhase/DataProcessing/DataStore';
import CalendarManagerStoreClass from '../state/stores/CalendarEvent';
import { AllTypes } from '../typings/PropTypes';
import { Subscriber } from '../users/Subscriber';

type MetaDataOptions = StructuredMetadata<T, Meta, K> | ProjectMetadata
type InitializedData = T | Map<string, Snapshot<T, Meta, K>> | null
type InitializedDataStore = T | DataStore<T, Meta, K> | Map<string, SnapshotStore<T, Meta, K>> | null;


// Renaming SnapshotStoreConfig to InitializedDelegate
type InitializedDelegate<T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T> =
    SnapshotStoreConfig<T, Meta, K>[] | (() => Promise<SnapshotStoreConfig<T, Meta, K>[]>);

// New type for InitializedDelegateSearch
type InitializedDelegateSearch<T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T> =
    () => Promise<SnapshotWithCriteria<T, Meta, K>[] | null>;

interface SnapshotStoreOptions<T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T> {
  id: string | number | null
  storeId: number
  data?: InitializedData | null
  baseURL: string,
  enabled: boolean,
  maxRetries: number,
  retryDelay: number,
  maxAge: string | number,
  staleWhileRevalidate: number,
  cacheKey: string,
  initialState: InitializedState<T, Meta, K> | {};
  snapshotObj?: Snapshot<T, Meta, K> | null;
  snapshots?: Snapshots<T, Meta>;
  eventRecords: Record<string, EventRecord<T, Meta, K>[]> | null;
  records: Record<string, CalendarManagerStoreClass<T, Meta, K>[]> | []; // Store calendar records
  snapshotRecords?: Record<string, Snapshot<T, Meta, K>[]>; // Add snapshotRecords to store snapshots

  category: Category
  date: string | number | Date | undefined;
  type: AllTypes;
  snapshotId: string | number | null | undefined;
  snapshotStoreConfig: SnapshotStoreConfig<T, Meta, K> | undefined;
  metadata?: UnifiedMetaDataOptions | {}
  criteria: CriteriaType;
  callbacks: MultipleEventsCallbacks<Snapshot<T, Meta, K>>;
  snapshotConfig?: SnapshotConfig<T, Meta, K>[] | undefined;
  subscribeToSnapshots: (
    snapshotStore: SnapshotStore<T, Meta, K>,
    snapshotId: string,
    snapshotData: SnapshotData<T, Meta, K>,
    category: Category | undefined,
    snapshotConfig: SnapshotStoreConfig<T, Meta, K>,
    callback: (snapshots: SnapshotsArray<T, Meta>) => Subscriber<T, Meta, K> | null,
    snapshots: SnapshotsArray<T, Meta>,
    unsubscribe?: UnsubscribeDetails, 
  ) => SnapshotsArray<T, Meta> | [];

  subscribeToSnapshot: (
    snapshotId: string,
    callback: (snapshot: Snapshot<T, Meta, K>) => Subscriber<T, Meta, K> | null,
    snapshot: Snapshot<T, Meta, K>
  ) =>  Subscriber<T, Meta, K> | null 
   
  unsubscribeToSnapshots: (
    snapshotId: string,
    snapshot: Snapshot<T, Meta, K>,
    type: string,
    event: Event,
    callback: (snapshot: Snapshot<T, Meta, K>) => void
  ) => void;
  unsubscribeToSnapshot: (
    snapshotId: string,
    snapshot: Snapshot<T, Meta, K>,
    type: string,
    event: Event,
    callback: (snapshot: Snapshot<T, Meta, K>) => void
  ) => void;
  delegate: InitializedDelegate<T, Meta, K> | null;
  searchDelegate?: InitializedDelegateSearch<T, Meta, K>;
  getDelegate: (
    | []
    | (
      (context: {
        useSimulatedDataSource: boolean;
        simulatedDataSource: SnapshotStoreConfig<T, Meta, K>[];
      }) => SnapshotStoreConfig<T, Meta, K>[]
    )
  );

  getCategory: (
    snapshotId: string,
    snapshot: Snapshot<T, Meta, K>,
    type: string,
    event: Event
  ) => CategoryProperties | undefined;

  // getSnapshotConfig: (
  //   snapshotId: string | null,
  //   snapshotContainer: SnapshotContainer<T, Meta, K>,
  //   criteria: CriteriaType,
  //   category: symbol | string | Category | undefined,
  //   categoryProperties: CategoryProperties | undefined,
  //   delegate: any,
  //   snapshotData: SnapshotData<T, Meta, K>,
  //   snapshot: (
  //     id: string,
  //     snapshotId: string | null,
  //     snapshotData: SnapshotData<T, Meta, K>,
  //     category: symbol | string | Category | undefined,
  //     categoryProperties: CategoryProperties,
  //     callback: (snapshotStore: Snapshot<T, Meta, K>) => void,
  //     dataStore: DataStore<T, Meta, K>,
  //     dataStoreMethods: DataStoreMethods<T, Meta, K>,
  //     // dataStoreSnapshotMethods: DataStoreWithSnapshotMethods<T, Meta, K>,
  //     metadata: UnifiedMetaDataOptions,
  //     subscriberId: string, // Add subscriberId here
  //     endpointCategory: string | number ,// Add endpointCategory here
  //     storeProps: SnapshotStoreProps<T, Meta, K>,
  //     snapshotConfigData: SnapshotConfig<T, Meta, K>,
  //     snapshotStoreConfigData?: SnapshotStoreConfig<T, Meta, K>,
  //     snapshotContainer?: SnapshotStore<T, Meta, K> | Snapshot<T, Meta, K> | null,
  //   ) => Promise<Snapshot<T, Meta, K>>,
  
    initSnapshot: (
      snapshot: SnapshotStore<T, Meta, K> | Snapshot<T, Meta, K> | null,
      snapshotId: string | null,
      snapshotData: SnapshotData<T, Meta, K>,
      category: symbol | string | Category | undefined,
      snapshotConfig: SnapshotStoreConfig<T, Meta, K>,
      callback: (snapshotStore: SnapshotStore<T, Meta, K>) => void
    ) => void,
  

    createSnapshot: (
      id: string,
      snapshotData: SnapshotData<T, Meta, K>,
      category: symbol | string | Category | undefined,
      categoryProperties: CategoryProperties | undefined,
      callback?: (snapshot: Snapshot<T, Meta, K>) => void,
      snapshotStore?: SnapshotStore<T, Meta, K>,
      snapshotStoreConfig?: SnapshotStoreConfig<T, Meta, K> | null,
      snapshotStoreConfigSearch?: SnapshotStoreConfig<
      SnapshotWithCriteria<any, Meta, BaseData>, Meta, K>
    ) => Snapshot<T, Meta, K> | null,
  
    createSnapshotStore: (
      id: string,
      storeId: number,
      snapshotId: string,
      snapshotStoreData: SnapshotStore<T, Meta, K>[],
      category: Category | undefined,
      categoryProperties: CategoryProperties | undefined,
      callback?: (snapshotStore: SnapshotStore<T, Meta, K>) => void,
      snapshotDataConfig?: SnapshotStoreConfig<T, Meta, K>[]
    ) => Promise<SnapshotStore<T, Meta, K> | null>,
  
    configureSnapshot: (
      id: string,
      storeId: number,
      snapshotId: string,
      snapshotData: SnapshotData<T, Meta, K>,
      dataStoreMethods: DataStore<SnapshotUnion<BaseData, Meta>, Meta, K>,
      category?: string | symbol | Category,
      categoryProperties?: CategoryProperties | undefined,
      callback?: (snapshot: Snapshot<T, Meta, K>) => void,
      SnapshotData?: SnapshotStore<T, Meta, K>,
      snapshotStoreConfig?: SnapshotStoreConfig<T, Meta, K>,
    ) => Promise<SnapshotStore<T, Meta, K>>,
  
    configureSnapshotStore: (
      snapshotStore: SnapshotStore<T, Meta, K>,
      snapshotId: string,
      data: Map<string, Snapshot<T, Meta, K>>,
      events: Record<string, CalendarManagerStoreClass<T, Meta, K>[]>,
      dataItems: RealtimeDataItem[],
      newData: Snapshot<T, Meta, K>,
      payload: ConfigureSnapshotStorePayload<T, Meta, K>,
      store: SnapshotStore<any, Meta, K>,
      callback?: (
        snapshotStore: SnapshotStore<T, Meta, K>) => void
    ) => Promise<{
      snapshotStore: SnapshotStore<T, Meta, K>, 
      storeConfig: SnapshotStoreConfig<T, Meta, K>,
      updatedStore?: SnapshotStore<T, Meta, K>
    }>
  dataStoreMethods?: Partial<DataStoreWithSnapshotMethods<T, Meta, K>> | undefined;
  getDataStoreMethods: (
    snapshotStoreConfig: SnapshotStoreConfig<T, Meta, K>[],
    dataStoreMethods: Partial<DataStoreWithSnapshotMethods<T, Meta, K>>
  ) => Partial<DataStoreWithSnapshotMethods<T, Meta, K>>

  snapshotMethods: SnapshotStoreMethod<T, Meta, K>[] | undefined;
  configOption?: string | SnapshotStoreConfig<T, Meta, K> | null;

  handleSnapshotOperation: (
    snapshot: Snapshot<T, Meta, K>,
    data: SnapshotStoreConfig<T, Meta, K>,
    operation: SnapshotOperation,
    operationType: SnapshotOperationType
  ) => Promise<Snapshot<T, Meta, K> | null> ;

  // Added handleSnapshotOperation
  handleSnapshotStoreOperation: (
    snapshotId: string,
    snapshotStore: SnapshotStore<T, Meta, K>,
    snapshot: Snapshot<T, Meta, K>,
    
    operation: SnapshotOperation,
    operationType: SnapshotOperationType,
    callback: (snapshotStore: SnapshotStore<T, Meta, K>) => void,
  ) => void;
  // Added handleSnapshotOperation
  displayToast: (message: string, type: string, duration: number, onClose: () => void) => Promise<void> | null

  addToSnapshotList: (
    snapshot: Snapshot<T, Meta, K>,
    subscribers: Subscriber<T, Meta, K>[]
  ) => void;
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
  simulatedDataSource: any;
}

export type { InitializedData, InitializedDataStore, MetaDataOptions, SnapshotStoreOptions,
  InitializedDelegate,
InitializedDelegateSearch,
 };

