import SnapshotStore from '@/app/components/snapshots/SnapshotStore';
import ProjectMetadata, { StructuredMetadata } from '@/app/configs/StructuredMetadata';
import { CategoryProperties } from '@/app/pages/personas/ScenarioBuilder';
import { CriteriaType } from '@/app/pages/searchs/CriteriaType';
import { Category } from '../libraries/categories/generateCategoryProperties';
import { Data } from '../models/data/Data';
import { DataStoreWithSnapshotMethods } from '../projects/DataAnalysisPhase/DataProcessing/ DataStoreMethods';
import { ConfigureSnapshotStorePayload, MultipleEventsCallbacks, Snapshot, SnapshotConfig, SnapshotOperation, SnapshotOperationType, Snapshots, SnapshotsArray, SnapshotStoreConfig, SnapshotStoreMethod, SnapshotWithCriteria } from '../snapshots/index';

import { UnifiedMetaDataOptions } from '@/app/configs/database/MetaDataOptions';
import { UnsubscribeDetails } from '../event/DynamicEventHandlerExample';
import { K, T } from '../models/data/dataStoreMethods';
import { RealtimeDataItem } from '../models/realtime/RealtimeData';
import { DataStore, EventRecord, InitializedState } from '../projects/DataAnalysisPhase/DataProcessing/DataStore';
import CalendarManagerStoreClass from '../state/stores/CalendarEvent';
import { Subscriber } from '../users/Subscriber';

type MetaDataOptions = StructuredMetadata | ProjectMetadata
type InitializedData = T | Map<string, Snapshot<T, K>> | null
type InitializedDataStore = T | DataStore<T, K> | Map<string, SnapshotStore<T, K>> | null;

interface SnapshotStoreOptions<T extends Data, K extends Data> {
  id?: string | number | null | undefined
  storeId: number
  data?: InitializedData | null
  baseURL: string,
  enabled: boolean,
  maxRetries: number,
  retryDelay: number,
  maxAge: string | number,
  staleWhileRevalidate: number,
  cacheKey: string,
  initialState: InitializedState<T, K> | {};
  snapshotObj?: Snapshot<T, K> | null;
  snapshots?: Snapshots<T>;
  eventRecords: Record<string, EventRecord<T, K>[]> | null; // Store events and their callbacks
  records: Record<string, CalendarManagerStoreClass<T, K>[]> | []; // Store calendar records

  category: Category
  date: string | number | Date | undefined;
  type: string | null | undefined;
  snapshotId: string | number | null | undefined;
  snapshotStoreConfig: SnapshotStoreConfig<T, K> | undefined;
  metadata?: UnifiedMetaDataOptions | {}
  criteria: CriteriaType;
  callbacks: MultipleEventsCallbacks<Snapshot<T, K>>;
  snapshotConfig?: SnapshotConfig<T, K>[] | undefined;
  subscribeToSnapshots: (
    snapshotStore: SnapshotStore<T, K>,
    snapshotId: string,
    snapshotData: SnapshotStore<T, K>,
    category: Category | undefined,
    snapshotConfig: SnapshotStoreConfig<T, K>,
    callback: (snapshots: SnapshotsArray<T>) => Subscriber<T, K> | null,
    snapshots: SnapshotsArray<T>,
    unsubscribe?: UnsubscribeDetails, 
  ) => SnapshotsArray<T> | [];

  subscribeToSnapshot: (
    snapshotId: string,
    callback: (snapshot: Snapshot<T, K>) => Subscriber<T, K> | null,
    snapshot: Snapshot<T, K>
  ) =>  Subscriber<T, K> | null 
   
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
  delegate: SnapshotWithCriteria<T, K>[] | null;
  getDelegate: (
    | []
    | (
      (context: {
        useSimulatedDataSource: boolean;
        simulatedDataSource: SnapshotStoreConfig<T, K>[];
      }) => SnapshotStoreConfig<T, K>[]
    )
  );

  getCategory: (
    snapshotId: string,
    snapshot: Snapshot<T, K>,
    type: string,
    event: Event
  ) => CategoryProperties | undefined;

  // getSnapshotConfig: (
  //   snapshotId: string | null,
  //   snapshotContainer: SnapshotContainer<T, K>,
  //   criteria: CriteriaType,
  //   category: symbol | string | Category | undefined,
  //   categoryProperties: CategoryProperties | undefined,
  //   delegate: any,
  //   snapshotData: SnapshotStore<T, K>,
  //   snapshot: (
  //     id: string,
  //     snapshotId: string | null,
  //     snapshotData: Snapshot<T, K>,
  //     category: symbol | string | Category | undefined,
  //     categoryProperties: CategoryProperties,
  //     callback: (snapshotStore: Snapshot<T, K>) => void,
  //     dataStore: DataStore<T, K>,
  //     dataStoreMethods: DataStoreMethods<T, K>,
  //     // dataStoreSnapshotMethods: DataStoreWithSnapshotMethods<T, K>,
  //     metadata: UnifiedMetaDataOptions,
  //     subscriberId: string, // Add subscriberId here
  //     endpointCategory: string | number ,// Add endpointCategory here
  //     storeProps: SnapshotStoreProps<T, K>,
  //     snapshotConfigData: SnapshotConfig<T, K>,
  //     snapshotStoreConfigData?: SnapshotStoreConfig<T, K>,
  //     snapshotContainer?: SnapshotStore<T, K> | Snapshot<T, K> | null,
  //   ) => Promise<Snapshot<T, K>>,
  
    initSnapshot: (
      snapshot: SnapshotStore<T, K> | Snapshot<T, K> | null,
      snapshotId: string | null,
      snapshotData: SnapshotStore<T, K>,
      category: symbol | string | Category | undefined,
      snapshotConfig: SnapshotStoreConfig<T, K>,
      callback: (snapshotStore: SnapshotStore<T, K>) => void
    ) => void,
  

    createSnapshot: (
      id: string,
      snapshotData: Snapshot<T, K>,
      category: string | Category,
      categoryProperties: CategoryProperties | undefined,
      callback?: (snapshot: Snapshot<T, K>) => void,
      snapshotStore?: SnapshotStore<T, K>,
      snapshotStoreConfig?: SnapshotStoreConfig<T, K> | null, // Adjust as per your definition
    ) => Snapshot<T, K> | null,
  
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
      snapshotData: Snapshot<T, K>,
      category?: string | symbol | Category,
      callback?: (snapshot: Snapshot<T, K>) => void,
      snapshotDataStore?: SnapshotStore<T, K>,
      snapshotStoreConfig?: SnapshotStoreConfig<T, K>
    ) => { snapshot: Snapshot<T, K>, config: SnapshotConfig<T, K> } | null,
  
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
    ) => {snapshotStore: SnapshotStore<T, K>, storeConfig: SnapshotStoreConfig<T, K>}
  
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
    operation: SnapshotOperation,
    operationType: SnapshotOperationType
  ) => Promise<Snapshot<T, K> | null> ;

  // Added handleSnapshotOperation
  handleSnapshotStoreOperation: (
    snapshotId: string,
    snapshotStore: SnapshotStore<T, K>,
    snapshot: Snapshot<T, K>,
    
    operation: SnapshotOperation,
    operationType: SnapshotOperationType,
    callback: (snapshotStore: SnapshotStore<T, K>) => void,
  ) => void;
  // Added handleSnapshotOperation
  displayToast: (message: string, type: string, duration: number, onClose: () => void) => void | null

  addToSnapshotList: (
    snapshot: Snapshot<T, K>,
    subscribers: Subscriber<T, K>[]
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

export type { InitializedData, InitializedDataStore, MetaDataOptions, SnapshotStoreOptions };

