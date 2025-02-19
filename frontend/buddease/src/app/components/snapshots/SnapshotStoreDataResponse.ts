import { BaseData } from '@/app/components/models/data/Data';
import SnapshotStore from '@/app/components/snapshots/SnapshotStore';
import { StructuredMetadata } from '@/app/configs/StructuredMetadata';
import { SnapshotDataResponse } from "../../../app/utils/retrieveSnapshotData";
import { UpdateSnapshotPayload } from '../database/Payload';
import { Category } from '../libraries/categories/generateCategoryProperties';
import { Data } from "../models/data/Data";
import { RealtimeDataItem } from '../models/realtime/RealtimeData';
import { InitializedState } from '../projects/DataAnalysisPhase/DataProcessing/DataStore';
import CalendarManagerStoreClass from '../state/stores/CalendarManagerStore';
import { Subscriber } from "../users/Subscriber";
import { Snapshot, Snapshots, SnapshotsArray } from "./LocalStorageSnapshotStore";
import { SnapshotData } from './SnapshotData';
import { SnapshotItem } from "./SnapshotList";
import { SnapshotStoreConfig } from "./SnapshotStoreConfig";


type OptionalSnapshotProps<
  T extends BaseData<any> = BaseData<any, any>,
  K extends T = T,
  Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>
>  = Omit<
  SnapshotDataResponse<T, K>,
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
  transformDelegate?: (delegate: any) => Promise<SnapshotStoreConfig<T, K>[]>;
  getSnapshotsBySubscriber?: () => Snapshot<SnapshotStoreDataResponse<T, K>>[];
  getSnapshotsBySubscriberSuccess?: boolean;
  getSnapshotsByTopic?: () => Snapshot<SnapshotStoreDataResponse<T, K>>[];
  getSnapshotsByTopicSuccess?: boolean;
  getSnapshotsByCategory?: () => Snapshot<SnapshotStoreDataResponse<T, K>>[];
  getSnapshotsByCategorySuccess?: boolean;
  getSnapshotsByKey?: () => Snapshot<SnapshotStoreDataResponse<T, K>>[];
  getSnapshotsByKeySuccess?: boolean;
  getSnapshotsByPriority?: () => Snapshot<SnapshotStoreDataResponse<T, K>>[];
  getSnapshotsByPrioritySuccess?: boolean;
  getStoreData?: () => any; // Adjust to specific type if known
  updateStoreData?: (data: any) => void; // Adjust to specific type if known
  updateDelegate?: () => void;
  getSnapshotContainer?: () => any; // Adjust to specific type if known
  getSnapshotVersions?: () => any; // Adjust to specific type if known
  createSnapshot?: (id: string,
    snapshotData: SnapshotData<T, K>,
    additionalData: any,
    category?: string | symbol | Category,
    callback?: (snapshot: Snapshot<T, K>) => void,
    snapshotData?: SnapshotStore<T, K>,
    snapshotStoreConfig?: SnapshotStoreConfig<T, K, StructuredMetadata<T, K>, never> 
  ) => Snapshot<T, K> | null;

  updateSnapshot?: (snapshotId: string,
    data: Map<string, Snapshot<T, K>>,
    events: Record<string, CalendarManagerStoreClass<T, K>[]>,
    snapshotStore: SnapshotStore<T, K>,
    dataItems: RealtimeDataItem[],
    newData: Snapshot<T, K>,
    payload: UpdateSnapshotPayload<T>,
    store: SnapshotStore<any, K>
  ) => Snapshot<T, K>; // Adjust as needed
  deleteSnapshot?: (id: string) => void;
  getSnapshotItems?: (
    category: symbol | string | Category | undefined, 
    snapshots: SnapshotsArray<T, K>,
    snapshotId?: string,                     // Optional: If you need to fetch a specific snapshot by ID
    callback?: (snapshots: Snapshots<T, K>) => Subscriber<T, K> | null, // Optional: Callback to process snapshots
    snapshot?: Snapshot<T, K> | null        // Optional: Current snapshot to process or filter by
  ) => (
    | SnapshotItem<Data<T, K, Meta>, any>
    | SnapshotStoreConfig<T, K>
    | undefined
  )[] | undefined;
  findSnapshot?: (id: string) => Snapshot<SnapshotStoreDataResponse<T, K>> | null;
  defaultSubscribeToSnapshots?: (
    snapshotId: string,
    callback: (snapshots: Snapshots<T, K>) => Subscriber<T, K> | null,
    snapshot: Snapshot<T, K> | null
  ) => void;
  getAllKeys?: () => string[];
  mapSnapshot?: (snapshot: Snapshot<SnapshotStoreDataResponse<T, K>>) => any; // Adjust type if known
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
  handleSubscribeToSnapshot?: (id: string, callback: (snapshot: Snapshot<SnapshotStoreDataResponse<T, K>>) => void) => void;
  removeItem?: (id: string) => void;
  getSnapshot?: (id: string) => Snapshot<SnapshotStoreDataResponse<T, K>> | null;
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
  addSnapshot?: (snapshot: Snapshot<SnapshotStoreDataResponse<T, K>>) => void;
  createInitSnapshot?: () => void;
  createSnapshotSuccess?: boolean;
  clearSnapshotSuccess?: boolean;
  clearSnapshotFailure?: boolean;
  createSnapshotFailure?: boolean;
  setSnapshotSuccess?: boolean;
  setSnapshotFailure?: boolean;
  updateSnapshots?: (snapshots: Snapshot<SnapshotStoreDataResponse<T, K>>[]) => void;
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
  handleSnapshot?: (snapshot: Snapshot<SnapshotStoreDataResponse<T, K>>) => void;
  handleActions?: (actions: any) => void; // Adjust type if known
  setSnapshot?: (snapshot: Snapshot<SnapshotStoreDataResponse<T, K>>) => void;
  transformSnapshotConfig?: (config: any) => any; // Adjust type if known
  getSnapshotCategory?: (category: string) => Snapshot<SnapshotStoreDataResponse<T, K>>[];
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
  T extends BaseData<any> = BaseData<any, any>,
  K extends T = T,
  Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>
> extends SnapshotDataResponse<T, K, Meta>
//  OptionalSnapshotProps<T, K, Meta> 
 {}

interface SnapshotStoreDataResponse<
  T extends BaseData<any> = BaseData<any, any>,
  K extends T = T,
  Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>
> 
// extends OptionalSnapshotDataResponse
 {
  id: string | number;
  timestamp: Date;
  category: string;
  initializedState: InitializedState<T, K> | {};
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
  value?: any; // Adjust to specific type if known
  todoSnapshotId?: string;
  snapshotStore?: any; // Adjust to specific type if known
  dataItems?: any[]; // Adjust to specific type if known
  newData?: any; // Adjust to specific type if known
  handleSnapshotOperation?: (operation: any) => void; // Adjust type if known
  getCustomStore?: () => any; // Adjust to specific type if known
  addSCustomStore?: (store: any) => void; // Adjust type if known
  removeStore?: (storeId: string) => void;
  onSnapshot?: (snapshot: Snapshot<SnapshotStoreDataResponse<T, K>>) => void;
  getData?: () => any; // Adjust to specific type if known
  getDataStore?: () => any; // Adjust to specific type if known
  addSnapshotItem?: (item: any) => void; // Adjust type if known
  addNestedStore?: (store: any) => void; // Adjust type if known
  
  defaultCreateSnapshotStores?: () => void;
  createSnapshotStores?: () => void;
  subscribeToSnapshots?: (callback: (snapshot: Snapshot<SnapshotStoreDataResponse<T, K>>) => void) => void;
  subscribeToSnapshot?: (id: string, callback: (snapshot: Snapshot<SnapshotStoreDataResponse<T, K>>) => void) => void;
  defaultOnSnapshots?: () => void;
  onSnapshots?: (snapshot: Snapshot<SnapshotStoreDataResponse<T, K>>) => void;
  transformSubscriber?: (subscriber: any) => any; // Adjust type if known
  isSnapshotStoreConfig?: () => boolean;
  transformDelegate?: (delegate: any) => Promise<SnapshotStoreConfig<T, K>[]>; // Adjust type if known
  transformSnapshot?: (snapshot: Snapshot<SnapshotStoreDataResponse<T, K>>) => any; // Adjust type if known
  transformedDelegate?: any[]; // Adjust to specific type if known
  getSnapshotIds?: string[];
  
  getAllKeys?: () => string[];
  mapSnapshot?: (snapshot: Snapshot<SnapshotStoreDataResponse<T, K>>) => any; // Adjust type if known
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
  handleSubscribeToSnapshot?: (id: string, callback: (snapshot: Snapshot<SnapshotStoreDataResponse<T, K>>) => void) => void;
  removeItem?: (id: string) => void;
  getSnapshot?: (id: string) => Snapshot<SnapshotStoreDataResponse<T, K>> | null;
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
  addSnapshot?: (snapshot: Snapshot<SnapshotStoreDataResponse<T, K>>) => void;
  createInitSnapshot?: () => void;
  createSnapshotSuccess?: boolean;
  clearSnapshotSuccess?: boolean;
  clearSnapshotFailure?: boolean;
  createSnapshotFailure?: boolean;
  setSnapshotSuccess?: boolean;
  setSnapshotFailure?: boolean;
  updateSnapshots?: (snapshots: Snapshot<SnapshotStoreDataResponse<T, K>>[]) => void;
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
  handleSnapshot?: (snapshot: Snapshot<SnapshotStoreDataResponse<T, K>>) => void;
  handleActions?: (actions: any) => void; // Adjust type if known
  setSnapshot?: (snapshot: Snapshot<SnapshotStoreDataResponse<T, K>>) => void;
  transformSnapshotConfig?: (config: any) => any; // Adjust type if known
  getSnapshotCategory?: (category: string) => Snapshot<SnapshotStoreDataResponse<T, K>>[];
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
