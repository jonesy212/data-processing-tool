import { CategoryProperties } from '@/app/pages/personas/ScenarioBuilder';

import { DataStoreWithSnapshotMethods } from '../projects/DataAnalysisPhase/DataProcessing/ DataStoreMethods';
import { SnapshotStoreConfig, Snapshot, Callback, SnapshotConfig, SnapshotOperation, SnapshotOperationType, Snapshots, SnapshotStoreMethod, SnapshotsArray, SnapshotWithCriteria, SnapshotUnion } from '../snapshots/index'
import CalendarEvent from '../state/stores/CalendarEvent';
import { Subscriber } from '../users/Subscriber';
import SnapshotStore from '../snapshots/SnapshotStore';
import { BaseData, Data } from '../models/data/Data';
import { Category } from '../libraries/categories/generateCategoryProperties';

interface SnapshotStoreOptions<T extends Data, K extends Data> {
  data?: Map<string, Snapshot<T, K>> | undefined;
  baseURL: string,
  enabled: boolean,
  maxRetries: number,
  retryDelay: number,
  maxAge: number,
  staleWhileRevalidate: number,
  cacheKey: number,
  initialState?: SnapshotStore<T, K> | Snapshot<T, K> | null;
  snapshot?: Snapshot<T, K> | null;
  snapshots?: Snapshots<T>;
  eventRecords: Record<string, CalendarEvent<T, K>[]> | null;
  category: Category
  date: string | number | Date | undefined;
  type: string | null | undefined;
  snapshotId: string | number | undefined;
  snapshotStoreConfig: SnapshotStoreConfig<SnapshotUnion<T>, K>[] | undefined;

  snapshotConfig: SnapshotConfig<T, K>[] | undefined;
  subscribeToSnapshots: (
    snapshotId: string,
    callback: (snapshots: Snapshots<T>) => Subscriber<T, K> | null,
    snapshots: SnapshotsArray<T>
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
  delegate: () => Promise<SnapshotStoreConfig<SnapshotUnion<T>, K>[]> | []
  getDelegate: (
    | []
    | (
      (context: {
        useSimulatedDataSource: boolean;
        simulatedDataSource: SnapshotStoreConfig<SnapshotUnion<T>, K>[];
      }) => SnapshotStoreConfig<SnapshotUnion<T>, K>[]
    )
  );

  getCategory: (
    snapshotId: string,
    snapshot: Snapshot<T, K>,
    type: string,
    event: Event
  ) => CategoryProperties;

  getSnapshotConfig: (
    category: string,
    categoryProperties: CategoryProperties,
    delegate: any,
    snapshotData: SnapshotStore<T, K>,
    snapshot: (
      id: string,
      snapshotId: string | null,
      snapshotData: Snapshot<T, K>,
      category: string | CategoryProperties | undefined,
      callback: (snapshotStore: Snapshot<T, K>) => void,
      snapshotStoreConfigData?: SnapshotStoreConfig<SnapshotUnion<T>, K>,
      snapshotContainer?: SnapshotStore<T, K> | Snapshot<T, K> | null
    ) => Promise<Snapshot<T, K>>,
  
    initSnapshot: (
      snapshot: SnapshotStore<T, K> | Snapshot<T, K> | null,
      snapshotId: string | null,
      snapshotData: SnapshotStore<T, K>,
      category: string | CategoryProperties | undefined,
      snapshotConfig: SnapshotStoreConfig<SnapshotUnion<T>, K>,
      callback: (snapshotStore: SnapshotStore<T, K>) => void
    ) => void,
  
    subscribeToSnapshots: (
      snapshot: SnapshotStore<T, K>,
      snapshotId: string,
      snapshotData: SnapshotStore<T, K>,
      category: string | CategoryProperties | undefined,
      snapshotConfig: SnapshotStoreConfig<SnapshotUnion<T>, K>,
      callback: (snapshotStore: SnapshotStore<any, any>) => void
    ) => void,
  
    createSnapshot: (
      id: string,
      snapshotData: Snapshot<T, K>,
      category?: string | CategoryProperties,
      callback?: (snapshot: Snapshot<T, K>) => void,
      snapshotDataStore?: SnapshotStore<T, K>,
      snapshotStoreConfig?: SnapshotStoreConfig<SnapshotUnion<T>, K>
    ) => Snapshot<T, K> | null,
  
    createSnapshotStore: (
      id: string,
      snapshotId: number,
      snapshotStoreData: Snapshots<T>,
      category?: string | CategoryProperties,
      callback?: (snapshotStore: SnapshotStore<T, K>) => void,
      snapshotDataConfig?: SnapshotStoreConfig<SnapshotUnion<T>, K>[]
    ) => SnapshotStore<T, K> | null,
  
    configureSnapshot: (
      id: string,
      snapshotId: number,
      snapshotData: Snapshot<T, K>,
      category?: string | CategoryProperties,
      callback?: (snapshot: Snapshot<T, K>) => void,
      snapshotDataStore?: SnapshotStore<T, K>,
      snapshotStoreConfig?: SnapshotStoreConfig<SnapshotUnion<T>, K>
    ) => SnapshotConfig<T, K> | undefined,
  ) => SnapshotConfig<SnapshotWithCriteria<any, BaseData>, K> 

  dataStoreMethods: Partial<DataStoreWithSnapshotMethods<T, K>>;
  getDataStoreMethods: (
    snapshotStoreConfig: SnapshotStoreConfig<SnapshotUnion<T>, K>[],
    dataStoreMethods: Partial<DataStoreWithSnapshotMethods<T, K>>
  ) => Partial<DataStoreWithSnapshotMethods<T, K>>

  snapshotMethods: SnapshotStoreMethod<T, K>[] | undefined;
  configOption?: SnapshotStoreConfig<SnapshotUnion<T>, K> | null;

  handleSnapshotOperation: (
    snapshot: Snapshot<T, K>,
    data: Map<string, Snapshot<T, K>>,
    operation: SnapshotOperation,
    operationType: SnapshotOperationType
  ) => Promise<Snapshot<T, K>>;

  // Added handleSnapshotOperation
  handleSnapshotStoreOperation: (
    snapshotId: string,
    snapshotStore: SnapshotStore<T, K>,
    snapshot: Snapshot<T, K>,
    operation: SnapshotOperation,
    operationType: SnapshotOperationType,
    callback: (snapshotStore: SnapshotStore<T, K>) => void,
  ) => Promise<void>;
  // Added handleSnapshotOperation
  displayToast: (message: string) => void; // Added displayToast

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
export default SnapshotStoreOptions;