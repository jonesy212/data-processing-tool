import { SnapshotDataResponse } from "@/app/app/utils/retrieveSnapshotData";
import { Category } from '@/app/libraries/categories/generateCategoryProperties';
import { Data } from '@/app/models/data/Data';
import { InitializedState } from '@/app/projects/DataAnalysisPhase/DataProcessing/DataStore';
import SnapshotStore from '@/app/snapshots/SnapshotStore';
import CalendarManagerStoreClass from '@/app/state/stores/CalendarManagerStore';
import { Subscriber } from "@/app/subscribers/Subscriber";
import { SharedIdentifiers } from '@/documents/RelatedProps';
import { RealtimeDataItem } from '@/models/realtime/RealtimeData';
import { UpdateSnapshotPayload } from '@/server/database/Payload';
import { Snapshot, Snapshots, SnapshotsArray } from "./LocalStorageSnapshotStore";
import { SnapshotItem } from "./SnapshotList";
import { SnapshotStoreConfig } from "./SnapshotStoreConfig";


type OptionalSnapshotProps<
  T extends BaseDataEntity = BaseDataRoot,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>
>  = Omit<
  SnapshotDataResponse<T, K, Meta>,
  'transformDelegate'
  | 'getSnapshotsBySubscriber'
  | 'getSnapshotsBySubscriberSuccess'
  | 'getSnapshotsByTopic'
  | 'getSnapshotsByTopicSuccess'
  | 'getSnapshotsByCategory'
  | 'getSnapshotsByCategorySuccess'
  | 'getSnapshotsByKey'
  | 'getSnapshotsByKeySuccess'
  | 'getSnapshotsByPriority'
  | 'getSnapshotsByPrioritySuccess'
  | 'getStoreData'
  | 'updateStoreData'
  | 'updateDelegate'
  | 'getSnapshotContainer'
  | 'getSnapshotVersions'
  | 'createSnapshot'
  | 'updateSnapshot'
  | 'getSnapshotItems'
  | 'defaultSubscribeToSnapshots'
  | 'getAllKeys'
  | 'mapSnapshot'
  | 'getAllItems'
  | 'addData'
  | 'addDataStatus'
  | 'removeData'
  | 'updateData'
  | 'updateDataTitle'
  | 'updateDataDescription'
  | 'updateDataStatus'
  | 'addDataSuccess'
  | 'getDataVersions'
  | 'updateDataVersions'
  | 'getBackendVersion'
  | 'getFrontendVersion'
  | 'fetchData'
  | 'defaultSubscribeToSnapshot'
  | 'handleSubscribeToSnapshot'
  | 'removeItem'
  | 'getSnapshot'
  | 'getSnapshotSuccess'
  | 'getSnapshotId'
  | 'getItem'
  | 'setItem'
  | 'addSnapshotFailure'
  | 'addSnapshotSuccess'
  | 'getParentId'
  | 'getChildIds'
  | 'compareSnapshotState'
  | 'deepCompare'
  | 'shallowCompare'
  | 'getDataStoreMethods'
  | 'getDelegate'
  | 'determineCategory'
  | 'determinePrefix'
  | 'updateSnapshotSuccess'
  | 'updateSnapshotFailure'
  | 'removeSnapshot'
  | 'clearSnapshots'
  | 'addSnapshot'
  | 'createInitSnapshot'
  | 'createSnapshotSuccess'
  | 'clearSnapshotSuccess'
  | 'clearSnapshotFailure'
  | 'createSnapshotFailure'
  | 'setSnapshotSuccess'
  | 'setSnapshotFailure'
  | 'updateSnapshots'
  | 'updateSnapshotsSuccess'
  | 'updateSnapshotsFailure'
  | 'initSnapshot'
  | 'takeSnapshot'
  | 'takeSnapshotSuccess'
  | 'takeSnapshotsSuccess'
  | 'configureSnapshotStore'
  | 'flatMap'
  | 'setData'
  | 'getState'
  | 'setState'
  | 'validateSnapshot'
  | 'handleSnapshot'
  | 'handleActions'
  | 'setSnapshot'
  | 'transformSnapshotConfig'
  | 'getSnapshotCategory'
  | 'getSnapshotCategorySuccess'
  | 'getSnapshotCategoryFailure'
  | 'transformSnapshotStore'
  | 'processSnapshotStore'
  | 'updateSnapshotStore'
  | 'getSnapshotItemsSuccess'
  | 'clearSnapshotItems'
  | 'processSnapshotItems'
  | 'handleSnapshotItems'
  | 'processStore'
  | 'handleStore'
  | 'createStore'
  | 'initializeStore'
  | 'createSnapshotStoreSuccess'
  | 'clearStore'
  | 'fetchSnapshotStoreData'
  | 'storeId'
  | 'snapshotStoreId'
  | 'storeType'
  | 'snapshotStoreConfig'
  | 'handleSnapshotStoreConfig'
  | 'fetchSnapshotStoreConfig'
  | 'getSnapshotStoreConfigSuccess'
  | 'getSnapshotStoreConfigFailure'
> & {
  transformDelegate?: (delegate: any) => Promise<SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>;
  getSnapshotsBySubscriber?: () => Snapshot<SnapshotStoreDataResponse<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>[];
  getSnapshotsBySubscriberSuccess?: boolean;
  getSnapshotsByTopic?: () => Snapshot<SnapshotStoreDataResponse<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>[];
  getSnapshotsByTopicSuccess?: boolean;
  getSnapshotsByCategory?: () => Snapshot<SnapshotStoreDataResponse<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>[];
  getSnapshotsByCategorySuccess?: boolean;
  getSnapshotsByKey?: () => Snapshot<SnapshotStoreDataResponse<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>[];
  getSnapshotsByKeySuccess?: boolean;
  getSnapshotsByPriority?: () => Snapshot<SnapshotStoreDataResponse<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>[];
  getSnapshotsByPrioritySuccess?: boolean;
  getStoreData?: () => any; // Adjust to specific type if known
  updateStoreData?: (data: any) => void; // Adjust to specific type if known
  updateDelegate?: () => void;
  getSnapshotContainer?: () => any; // Adjust to specific type if known
  getSnapshotVersions?: () => any; // Adjust to specific type if known
  createSnapshot?: (
      id: string,
    additionalData: any,
    category?:  Category,
    callback?: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void,
    snapshotData?: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshotStoreConfig?: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ) => Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null;

  updateSnapshot?: (snapshotId: string,
    data: Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
    events: Record<string, CalendarManagerStoreClass<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>,
    snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    dataItems: RealtimeDataItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
    newData: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    payload: UpdateSnapshotPayload<T>,
    store: SnapshotStore<any, K>
  ) => Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>; // Adjust as needed
  deleteSnapshot?: (id: string) => void;
  getSnapshotItems?: (
    category: symbol | string | Category | undefined, 
    snapshots: SnapshotsArray<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshotId?: string,                     // Optional: If you need to fetch a specific snapshot by ID
    callback?: (snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null, // Optional: Callback to process snapshots
    snapshot?: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null        // Optional: Current snapshot to process or filter by
  ) => (
    | SnapshotItem<Data<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, any>
    | SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
    | undefined
  )[] | undefined;
  findSnapshot?: (id: string) => Snapshot<SnapshotStoreDataResponse<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> | null;
  defaultSubscribeToSnapshots?: (
    snapshotId: string,
    callback: (snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null
  ) => void;
  getAllKeys?: () => string[];
  mapSnapshot?: (snapshot: Snapshot<SnapshotStoreDataResponse<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>) => any; // Adjust type if known
  getAllItems?: () => any[]; // Adjust to specific type if known
  addData?: (data: any) => void; // Adjust type if known
  addDataStatus?: string;
  removeData?: (id: string) => void;
  updateData?: (id: string, data: any) => void; // Adjust type if known
  updateDataTitle?: (id: string, title: string) => void;
  updateDataDescription?: (id: string, description: string) => void;
  updateDataStatus?: (id: string, status: string) => void;
  addDataSuccess?: boolean;
  getDataVersions?: () => any; // Adjust to specific type if known
  updateDataVersions?: (versions: any) => void; // Adjust type if known
  getBackendVersion?: () => string;
  getFrontendVersion?: () => string;
  fetchData?: () => any; // Adjust to specific type if known
  defaultSubscribeToSnapshot?: (id: string) => void;
  handleSubscribeToSnapshot?: (id: string, callback: (snapshot: Snapshot<SnapshotStoreDataResponse<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>) => void) => void;
  removeItem?: (id: string) => void;
  getSnapshot?: (id: string) => Snapshot<SnapshotStoreDataResponse<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> | null;
  getSnapshotSuccess?: boolean;
  getSnapshotId?: (id: string) => string;
  getItem?: (id: string) => any; // Adjust to specific type if known
  setItem?: (id: string, item: any) => void; // Adjust type if known
  addSnapshotFailure?: boolean;
  addSnapshotSuccess?: boolean;
  getParentId?: (id: string) => string;
  getChildIds?: (id: string) => string[];
  compareSnapshotState?: (state1: any, state2: any) => boolean; // Adjust type if known
  deepCompare?: (obj1: any, obj2: any) => boolean; // Adjust type if known
  shallowCompare?: (obj1: any, obj2: any) => boolean; // Adjust type if known
  getDataStoreMethods?: () => any; // Adjust to specific type if known
  getDelegate?: () => any; // Adjust to specific type if known
  determineCategory?: (data: any) => string; // Adjust type if known
  determinePrefix?: (data: any) => string; // Adjust type if known
  updateSnapshotSuccess?: boolean;
  updateSnapshotFailure?: boolean;
  removeSnapshot?: (id: string) => void;
  clearSnapshots?: () => void;
  addSnapshot?: (snapshot: Snapshot<SnapshotStoreDataResponse<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>) => void;
  createInitSnapshot?: () => void;
  createSnapshotSuccess?: boolean;
  clearSnapshotSuccess?: boolean;
  clearSnapshotFailure?: boolean;
  createSnapshotFailure?: boolean;
  setSnapshotSuccess?: boolean;
  setSnapshotFailure?: boolean;
  updateSnapshots?: (snapshots: Snapshot<SnapshotStoreDataResponse<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>[]) => void;
  updateSnapshotsSuccess?: boolean;
  updateSnapshotsFailure?: boolean;
  initSnapshot?: () => void;
  takeSnapshot?: () => void;
  takeSnapshotSuccess?: boolean;
  takeSnapshotsSuccess?: boolean;
  configureSnapshotStore?: () => void;
  flatMap?: (callback: (item: any) => any) => any[]; // Adjust type if known
  setData?: (data: any) => void; // Adjust type if known
  getState?: () => any; // Adjust type if known
  setState?: (state: any) => void; // Adjust type if known
  validateSnapshot?: () => boolean;
  handleSnapshot?: (snapshot: Snapshot<SnapshotStoreDataResponse<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>) => void;
  handleActions?: (actions: any) => void; // Adjust type if known
  setSnapshot?: (snapshot: Snapshot<SnapshotStoreDataResponse<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>) => void;
  transformSnapshotConfig?: (config: any) => any; // Adjust type if known
  getSnapshotCategory?: (category: string) => Snapshot<SnapshotStoreDataResponse<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>[];
  getSnapshotCategorySuccess?: boolean;
  getSnapshotCategoryFailure?: boolean;
  transformSnapshotStore?: (store: any) => any; // Adjust type if known
  processSnapshotStore?: (store: any) => void; // Adjust type if known
  updateSnapshotStore?: (store: any) => void; // Adjust type if known
  getSnapshotItemsSuccess?: boolean;
  clearSnapshotItems?: () => void;
  processSnapshotItems?: (items: any[]) => void; // Adjust type if known
  handleSnapshotItems?: (items: any[]) => void; // Adjust type if known
  processStore?: (store: any) => void; // Adjust type if known
  handleStore?: (store: any) => void; // Adjust type if known
  createStore?: () => void; // Adjust type if known
  initializeStore?: () => void; // Adjust type if known
  createSnapshotStoreSuccess?: boolean;
  clearStore?: () => void;
  fetchSnapshotStoreData?: () => void; // Adjust type if known
  storeId: number;
  snapshotStoreId?: string;
  storeType?: string;
  snapshotStoreConfig?: any; // Adjust to specific type if known
  handleSnapshotStoreConfig?: (config: any) => void; // Adjust type if known
  fetchSnapshotStoreConfig?: () => any; // Adjust type if known
  getSnapshotStoreConfigSuccess?: boolean;
  getSnapshotStoreConfigFailure?: boolean;
};

interface OptionalSnapshotDataResponse<
  T extends BaseDataEntity = BaseDataRoot,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>
> extends SnapshotDataResponse<T, K, Meta>
//  OptionalSnapshotProps<T, K, Meta> 
 {}

interface SnapshotStoreDataResponse<
  T extends BaseDataEntity = BaseDataRoot,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>
> extends SharedIdentifiers<T, K, Meta>
// extends OptionalSnapshotDataResponse
 {
  id: string | number;
  timestamp: Date;
  category: string;
  initializedState: InitializedStateInitializedState<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | {};
  topic?: string;
  date?: string;
  config?: any; // Adjust to specific type if known
  title?: string;
  message?: string;
  createdBy: string | undefined;
  eventRecords?: any; // Adjust to specific type if known
  type?: string;
  store?: any; // Adjust to specific type if known
  stores?: any; // Adjust to specific type if known
  snapshots?: any; // Adjust to specific type if known
  snapshot: any; // Adjust to specific type if known
  snapshotConfig?: any; // Adjust to specific type if known
  meta?: any; // Adjust to specific type if known
  snapshotMethods?: {
    initialize: () => void;
    onError: (error: Error) => void;
    // Add other methods as needed
  };
  
 
  // Adjust to specific type if known
  dataStore?: any; // Adjust to specific type if known
  snapshotItems?: any[]; // Adjust to specific type if known
  nestedStores?: any[]; // Adjust to specific type if known
  snapshotIds?: string[];
  dataStoreMethods?: any; // Adjust to specific type if known
  delegate?: any; // Adjust to specific type if known
  events?: any; // Adjust to specific type if known
  subscriberId?: string;
  length?: number;
  content?: any; // Adjust to specific type if known
  todoSnapshotId?: string;
  snapshotStore?: any; // Adjust to specific type if known
  dataItems?: any[]; // Adjust to specific type if known
  newData?: any; // Adjust to specific type if known
  handleSnapshotOperation?: (operation: any) => void; // Adjust type if known
  getCustomStore?: () => any; // Adjust to specific type if known
  addSCustomStore?: (store: any) => void; // Adjust type if known
  removeStore?: (storeId: string) => void;
  onSnapshot?: (snapshot: Snapshot<SnapshotStoreDataResponse<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>) => void;
  getData?: () => any; // Adjust to specific type if known
  getDataStore?: () => any; // Adjust to specific type if known
  addSnapshotItem?: (item: any) => void; // Adjust type if known
  addNestedStore?: (store: any) => void; // Adjust type if known
  
  defaultCreateSnapshotStores?: () => void;
  createSnapshotStores?: () => void;
  subscribeToSnapshots?: (callback: (snapshot: Snapshot<SnapshotStoreDataResponse<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>) => void) => void;
  subscribeToSnapshot?: (id: string, callback: (snapshot: Snapshot<SnapshotStoreDataResponse<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>) => void) => void;
  defaultOnSnapshots?: () => void;
  onSnapshots?: (snapshot: Snapshot<SnapshotStoreDataResponse<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>) => void;
  transformSubscriber?: (subscriber: any) => any; // Adjust type if known
  isSnapshotStoreConfig?: () => boolean;
  transformDelegate?: (delegate: any) => Promise<SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>; // Adjust type if known
  transformSnapshot?: (snapshot: Snapshot<SnapshotStoreDataResponse<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>) => any; // Adjust type if known
  transformedDelegate?: any[]; // Adjust to specific type if known
  getSnapshotIds?: string[];
  
  getAllKeys?: () => string[];
  mapSnapshot?: (snapshot: Snapshot<SnapshotStoreDataResponse<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>) => any; // Adjust type if known
  getAllItems?: () => any[]; // Adjust to specific type if known
  addData?: (data: any) => void; // Adjust type if known
  addDataStatus?: string;
  removeData?: (id: string) => void;
  updateData?: (id: string, data: any) => void; // Adjust type if known
  updateDataTitle?: (id: string, title: string) => void;
  updateDataDescription?: (id: string, description: string) => void;
  updateDataStatus?: (id: string, status: string) => void;
  addDataSuccess?: boolean;
  getDataVersions?: () => any; // Adjust to specific type if known
  updateDataVersions?: (versions: any) => void; // Adjust type if known
  getBackendVersion?: () => string;
  getFrontendVersion?: () => string;
  fetchData?: () => any; // Adjust to specific type if known
  defaultSubscribeToSnapshot?: (id: string) => void;
  handleSubscribeToSnapshot?: (id: string, callback: (snapshot: Snapshot<SnapshotStoreDataResponse<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>) => void) => void;
  removeItem?: (id: string) => void;
  getSnapshot?: (id: string) => Snapshot<SnapshotStoreDataResponse<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> | null;
  getSnapshotSuccess?: boolean;
  getSnapshotId?: (id: string) => string;
  getItem?: (id: string) => any; // Adjust to specific type if known
  setItem?: (id: string, item: any) => void; // Adjust type if known
  addSnapshotFailure?: boolean;
  addSnapshotSuccess?: boolean;
  getParentId?: (id: string) => string;
  getChildIds?: (id: string) => string[];
  compareSnapshotState?: (state1: any, state2: any) => boolean; // Adjust type if known
  deepCompare?: (obj1: any, obj2: any) => boolean; // Adjust type if known
  shallowCompare?: (obj1: any, obj2: any) => boolean; // Adjust type if known
  getDataStoreMethods?: () => any; // Adjust to specific type if known
  getDelegate?: () => any; // Adjust to specific type if known
  determineCategory?: (data: any) => string; // Adjust type if known
  determinePrefix?: (data: any) => string; // Adjust type if known
  updateSnapshotSuccess?: boolean;
  updateSnapshotFailure?: boolean;
  removeSnapshot?: (id: string) => void;
  clearSnapshots?: () => void;
  addSnapshot?: (snapshot: Snapshot<SnapshotStoreDataResponse<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>) => void;
  createInitSnapshot?: () => void;
  createSnapshotSuccess?: boolean;
  clearSnapshotSuccess?: boolean;
  clearSnapshotFailure?: boolean;
  createSnapshotFailure?: boolean;
  setSnapshotSuccess?: boolean;
  setSnapshotFailure?: boolean;
  updateSnapshots?: (snapshots: Snapshot<SnapshotStoreDataResponse<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>[]) => void;
  updateSnapshotsSuccess?: boolean;
  updateSnapshotsFailure?: boolean;
  initSnapshot?: () => void;
  takeSnapshot?: () => void;
  takeSnapshotSuccess?: boolean;
  takeSnapshotsSuccess?: boolean;
  configureSnapshotStore?: () => void;
  flatMap?: (callback: (item: any) => any) => any[]; // Adjust type if known
  setData?: (data: any) => void; // Adjust type if known
  getState?: () => any; // Adjust type if known
  setState?: (state: any) => void; // Adjust type if known
  validateSnapshot?: () => boolean;
  handleSnapshot?: (snapshot: Snapshot<SnapshotStoreDataResponse<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>) => void;
  handleActions?: (actions: any) => void; // Adjust type if known
  setSnapshot?: (snapshot: Snapshot<SnapshotStoreDataResponse<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>) => void;
  transformSnapshotConfig?: (config: any) => any; // Adjust type if known
  getSnapshotCategory?: (category: string) => Snapshot<SnapshotStoreDataResponse<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>[];
  getSnapshotCategorySuccess?: boolean;
  getSnapshotCategoryFailure?: boolean;
  transformSnapshotStore?: (store: any) => any; // Adjust type if known
  processSnapshotStore?: (store: any) => void; // Adjust type if known
  updateSnapshotStore?: (store: any) => void; // Adjust type if known
  getSnapshotItemsSuccess?: boolean;
  clearSnapshotItems?: () => void;
  processSnapshotItems?: (items: any[]) => void; // Adjust type if known
  handleSnapshotItems?: (items: any[]) => void; // Adjust type if known
  processStore?: (store: any) => void; // Adjust type if known
  handleStore?: (store: any) => void; // Adjust type if known
  createStore?: () => void; // Adjust type if known
  initializeStore?: () => void; // Adjust type if known
  createSnapshotStoreSuccess?: boolean;
  clearStore?: () => void;
  fetchSnapshotStoreData?: () => void; // Adjust type if known
  storeId: number;
  snapshotStoreId?: string;
  storeType?: string;
  snapshotStoreConfig?: any; // Adjust to specific type if known
  handleSnapshotStoreConfig?: (config: any) => void; // Adjust type if known
  fetchSnapshotStoreConfig?: () => any; // Adjust type if known
  getSnapshotStoreConfigSuccess?: boolean;
  getSnapshotStoreConfigFailure?: boolean;
}

export type { SnapshotStoreDataResponse };
