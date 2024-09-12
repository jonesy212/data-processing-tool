import { Callback, ConfigureSnapshotStorePayload, SnapshotConfig, SnapshotData } from '@/app/components/snapshots';

import { CategoryProperties } from '@/app/pages/personas/ScenarioBuilder';
import { SnapshotWithCriteria, SubscriberCollection } from ".";
import { SnapshotWithData } from '../calendar/CalendarApp';
import { CreateSnapshotsPayload, Payload } from '../database/Payload';
import { SnapshotManager } from '../hooks/useSnapshotManager';
import { Category } from "../libraries/categories/generateCategoryProperties";
import { Data, DataDetails } from "../models/data/Data";
import { NotificationPosition } from "../models/data/StatusType";
import { RealtimeDataItem } from "../models/realtime/RealtimeData";
import { DataStore } from '../projects/DataAnalysisPhase/DataProcessing/DataStore';
import CalendarManagerStoreClass from "../state/stores/CalendarEvent";
import { NotificationType, NotificationTypeEnum } from "../support/NotificationContext";
import { Subscriber } from "../users/Subscriber";
import { FetchSnapshotPayload } from './FetchSnapshotPayload';
import { Snapshot, SnapshotUnion, Snapshots, UpdateSnapshotPayload } from "./LocalStorageSnapshotStore";


import SnapshotStore from "./SnapshotStore";
import { SnapshotStoreConfig } from "./SnapshotStoreConfig";
import { SnapshotEvents } from './SnapshotEvents';

// SnapshotMethods.ts
interface SnapshotMethods<T extends Data, K extends Data>
{
  isCore: boolean
  notify: (id: string, message: string, content: any, date: Date, type: NotificationType, notificationPosition?: NotificationPosition) => void;
  notifySubscribers: (message: string, subscribers: Subscriber<T, K>[], data: Partial<SnapshotStoreConfig<T, any>>) => Subscriber<T, K>[];
  getSnapshots: (category: string, data: Snapshots<T>) => void;
  getAllSnapshots: (
    snapshotId: number,
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
      snapshots: Snapshots<T>
    ) => Promise<SnapshotUnion<T>[]>
  ) => Promise<Snapshot<T, K>[]>;

  generateId: (
    prefix: string,
    name: string,
    type: NotificationTypeEnum,
    id?: string,
    title?: string,
    chatThreadName?: string,
    chatMessageId?: string,
    chatThreadId?: string,
    dataDetails?: DataDetails,
    generatorType?: string
  ) => string;

  compareSnapshots: (snap1: Snapshot<T, K>, snap2: Snapshot<T, K>) => {
    snapshot1: Snapshot<T, K>;
    snapshot2: Snapshot<T, K>;
    differences: Record<string, { snapshot1: any; snapshot2: any }>;
    versionHistory: {
      snapshot1Version: number;
      snapshot2Version: number;
    };
  } | null;
   
  compareSnapshotItems: (snap1: Snapshot<T, K>, snap2: Snapshot<T, K>, keys: string[]) => {
    itemDifferences: Record<string, {
      snapshot1: any;
      snapshot2: any;
      differences: {
        [key: string]: { value1: any; value2: any };
      };
    }>;
  } | null;

  batchTakeSnapshot: (snapshotId: number, snapshot: Snapshot<T, K>) => Promise<Snapshot<T, K>>;
  batchFetchSnapshots: (criteria: any) => Promise<Snapshot<T, K>[]>;
  batchTakeSnapshotsRequest: (snapshotIds: string[], snapshots: Snapshots<T> ) => Promise<void>;
  batchUpdateSnapshotsRequest: (snapshots: Snapshots<T>) => Promise<void>;
  filterSnapshotsByStatus: (status: string) =>Snapshots<T>;
  filterSnapshotsByCategory: (category: string) => Snapshots<T>;
  filterSnapshotsByTag: (tag: string) => Snapshots<T>;
  batchFetchSnapshotsSuccess: (snapshots: Snapshot<T, K>[]) => void;
  batchFetchSnapshotsFailure: (date: Date, 
    snapshotManager: SnapshotManager<T, K>,
    snapshot: Snapshot<T, K>, 
    payload: { error: Error; }
  ) => void;
  batchUpdateSnapshotsSuccess: (snapshots: Snapshot<T, K>[]) => void;
  batchUpdateSnapshotsFailure: (
    date: Date, 
    snapshotId: number, 
    snapshotManager: SnapshotManager<T, K>,
     snapshot: Snapshot<T, K>,
      payload: { error: Error; }
  ) => void;
  
    snapshot: (
      id: string,
      snapshotId: number, 
      snapshotData: SnapshotData<T, K>,
       category: symbol | string | Category | undefined, 
     categoryProperties: CategoryProperties | undefined,
      dataStoreMethods: DataStore<T,K>[]
    ) => void,
  
  handleSnapshotSuccess: (message: string,snapshot: Snapshot<T, K>) => void;
  getSnapshotId: (key: string | T, snapshot: Snapshot<T, K>) => unknown
  compareSnapshotState: (snapshot1: Snapshot<T, K>, snapshot2: Snapshot<T, K>) => boolean;

  payload: Payload | undefined;
  dataItems: null | T[];
  newData: null | T;
  getInitialState: () => T;
  getConfigOption: (optionKey: string) => any;
  getTimestamp: () => Date;
  getStores: (
    storeId: number,
    snapshotStores: SnapshotStore<T, K>[],
    snapshotStoreConfigs: SnapshotStoreConfig<T, K>[],
  ) => SnapshotStore<T, K>[]; // Define an appropriate type if possible
  getData: (id: string) => T;
  setData: (id: string, data: Snapshot<T, K>) => void;
  addData: (id: string, data: Partial<Snapshot<T, K>>) => void;
  stores: null | SnapshotStore<T, K>[]
  getStore: ( storeId: number,
    snapshotStore: SnapshotStore<T, K>,
    snapshotId: number,
    snapshot: Snapshot<T, K>,
    type: string,
    event: Event) => any; // Define an appropriate return type
  addStore: (
    storeId: number,
    snapshotId: number,
    snapshotStore: SnapshotStore<T, K>,
    snapshot: Snapshot<T, K>,
    type: string,
    event: Event
  ) => SnapshotStore<T, K> | null 
  mapSnapshot: (
    storeId: number,
    snapshotStore: SnapshotStore<T, K>,
    snapshotId: number,
    snapshot: Snapshot<T, K>,
    type: string,
    event: Event,
    callback: (snapshot: Snapshot<T, K>) => void,
    mapFn: (item: T) => T
  ) => Snapshot<T, K>  | null ;
  mapSnapshotWithDetails: (
    storeId: number,
    snapshotStore: SnapshotStore<T, K>,
    snapshotId: number,
    snapshot: Snapshot<T, K>,
    type: string,
    event: Event,
    callback: (snapshot: Snapshot<T, K>) => void
  ) => SnapshotWithData<T, K> |  null;
  removeStore: (
    storeId: number,
    store: SnapshotStore<T, K>,
    snapshotId: string,
    snapshot: Snapshot<T, K>,
    type: string,
    event: Event
  ) => void;
  unsubscribe: (unsubscribeDetails: {
    userId: string;
    snapshotId: string;
    unsubscribeType: string;
    unsubscribeDate: Date;
    unsubscribeReason: string;
    unsubscribeData: any;
  },
  callback: Callback<Snapshot<T, K>> | null
  ) => void;
    fetchSnapshot: ( 
      callback: (
        snapshotId: string,
        payload: FetchSnapshotPayload<K> | undefined,
        snapshotStore: SnapshotStore<T, K>,
        payloadData: T | Data,
        category: Category | undefined,
        categoryProperties: CategoryProperties | undefined,
        timestamp: Date,
        data: T,
        delegate: SnapshotWithCriteria<T, K>[]
      ) => Snapshot<T, K>
  ) => Promise<Snapshot<T, K> | undefined>;

  fetchSnapshotSuccess: (
    snapshotId: number,
    snapshotStore: SnapshotStore<T, K>,
    payload: FetchSnapshotPayload<K> | undefined,
    snapshot: Snapshot<T, K>,
    data: T,
    delegate: SnapshotWithCriteria<T, K>[]
  ) => void

  updateSnapshotFailure: (
    snapshotId: number,
    snapshotManager: SnapshotManager<T, K>,
    snapshot: Snapshot<T, K>,
    date: Date | undefined,
    payload: { error: Error }
  ) => void

  fetchSnapshotFailure: (
    snapshotId: number,
    snapshotManager: SnapshotManager<T, K>,
    snapshot: Snapshot<T, K>,
    date: Date | undefined,
    payload: { error: Error }
  ) => void

  addSnapshotFailure: (
    date: Date, snapshotManager: SnapshotManager<T, K>,
     snapshot: Snapshot<T, K>, payload: { error: Error; }) => void;
  
  
  
    configureSnapshotStore: (
    snapshotStore: SnapshotStore<T, K>,
    storeId: number,
    data: Map<string, Snapshot<T, K>>,
    events: Record<string, CalendarManagerStoreClass<T, K>[]>,
    dataItems: RealtimeDataItem[],
    newData: Snapshot<T, K>,
    payload: ConfigureSnapshotStorePayload<T, K>,
    store: SnapshotStore<any, K>,
    callback: (snapshotStore: SnapshotStore<T, K>) => void,
    config: SnapshotStoreConfig<T, K>
  ) => void;
  updateSnapshotSuccess: (
    snapshotId: number,
    snapshotManager: SnapshotManager<T, K>,
    snapshot: Snapshot<T, K>,
    payload?: { data?: any }) => void;
  
  createSnapshotFailure: (
    date: Date,
    snapshotId: number, 
    snapshotManager: SnapshotManager<T, K>, 
    snapshot: Snapshot<T, K>,
    payload: { error: Error; }
  ) => void;

  createSnapshotSuccess: (
    snapshotId: number,
    snapshotManager: SnapshotManager<T, K>,
    snapshot: Snapshot<T, K>,
    payload?: { data?: any } 
  ) => void;

  createSnapshots: (
    id: string,
    snapshotId: number,
    snapshots: Snapshot<T, K>[], // Use Snapshot<T, K>[] here
    snapshotManager: SnapshotManager<T, K>,
    payload: CreateSnapshotsPayload<T, K>,
    callback: (snapshots: Snapshot<T, K>[]) => void | null,
    snapshotDataConfig?: SnapshotConfig<T, K>[] | undefined,
    category?: string | Category,
    categoryProperties?: string | CategoryProperties
  ) => Snapshot<T, K>[] | null;
  
  onSnapshot: (snapshotId: number,
    snapshot: Snapshot<T, K>,
    type: string,
    event: Event,
    callback: (snapshot: Snapshot<T, K>) => void
  ) => void;
  onSnapshots: (snapshotId: number,
    snapshots: Snapshots<T>,
    type: string,
    event: Event,
    callback: (snapshots: Snapshots<T>) => void
  ) => void;
  events: SnapshotEvents<T, K> | undefined;

}

export type { SnapshotMethods };
