import { Callback, ConfigureSnapshotStorePayload, SnapshotConfig, SnapshotData, SnapshotDataType } from '@/app/components/snapshots';

import { CategoryProperties } from '@/app/pages/personas/ScenarioBuilder';
import { SnapshotWithCriteria, SubscriberCollection } from ".";
import { SnapshotWithData } from '../calendar/CalendarApp';
import { CreateSnapshotsPayload, Payload } from '../database/Payload';
import { SnapshotManager } from '../hooks/useSnapshotManager';
import { Category } from "../libraries/categories/generateCategoryProperties";
import { BaseData, Data, DataDetails } from "../models/data/Data";
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
import { UnifiedMetaDataOptions } from '@/app/configs/database/MetaDataOptions';
import { DataStoreWithSnapshotMethods } from '../projects/DataAnalysisPhase/DataProcessing/ DataStoreMethods';

// SnapshotMethods.ts
interface SnapshotMethods<T extends Data, K extends Data> {
  isCore: boolean
  notify: (id: string, message: string, content: any, date: Date, type: NotificationType, notificationPosition?: NotificationPosition) => void;
  notifySubscribers: (message: string, subscribers: Subscriber<T, K>[], data: Partial<SnapshotStoreConfig<SnapshotUnion<BaseData>, K>>) => Subscriber<T, K>[];
  getSnapshots: (category: string, data: Snapshots<T>) => void;
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

  batchTakeSnapshot: (
    snapshotId: string,
    snapshotStore: SnapshotStore<T, K>,
    snapshots: Snapshots<T>
  ) => Promise<{ snapshots: Snapshots<T>; }>;

  batchFetchSnapshots: (
    criteria: any,
    snapshotData: (
      snapshotIds: string[],
      subscribers: SubscriberCollection<T, K>,
      snapshots: Snapshots<T>
    ) => Promise<{
      subscribers: SubscriberCollection<T, K>
    }>
  ) => Promise<Snapshot<T, K>[]>;

  batchTakeSnapshotsRequest: (
    criteria: any,
    snapshotData: (
      snapshotIds: string[],
      snapshots: Snapshots<T>,
      subscribers: Subscriber<T, K>[]
    ) => Promise<{
      subscribers: Subscriber<T, K>[]
    }>
  ) => Promise<void>;
  batchUpdateSnapshotsRequest: (
    snapshotData: (subscribers: Subscriber<T, K>[]) => Promise<{
      subscribers: Subscriber<T, K>[];
    }>) => Promise<void>;
  filterSnapshotsByStatus: (status: string) => Snapshots<T>;
  filterSnapshotsByCategory: (category: string) => Snapshots<T>;
  filterSnapshotsByTag: (tag: string) => Snapshots<T>;
  batchFetchSnapshotsSuccess: (subscribers: Subscriber<T, K>[], snapshots: Snapshots<T>) => void;
  batchFetchSnapshotsFailure: (date: Date,
    snapshotManager: SnapshotManager<T, K>,
    snapshot: Snapshot<T, K>,
    payload: { error: Error; }
  ) => void;
  batchUpdateSnapshotsSuccess: (subscribers: Subscriber<T, K>[], snapshots: Snapshots<T>) => void;
  batchUpdateSnapshotsFailure: (
    date: Date,
    snapshotId: string,
    snapshotManager: SnapshotManager<T, K>,
    snapshot: Snapshot<T, K>,
    payload: { error: Error; }
  ) => void;

  snapshot: (
    id: string | number | undefined,
    snapshotId: string | null,
    snapshotData: SnapshotDataType<T, K>,
    category: Category | undefined,
    categoryProperties: CategoryProperties | undefined,
    callback: (snapshotStore: SnapshotStore<T, K>) => void,
    dataStoreMethods: DataStore<T, K>[],
    // dataStoreSnapshotMethods: DataStoreWithSnapshotMethods<T, K>,
    metadata: UnifiedMetaDataOptions,
    subscriberId: string, // Add subscriberId here
    endpointCategory: string | number, // Add endpointCategory here
    snapshotStoreConfigData?: SnapshotStoreConfig<T, K>,
    snapshotContainer?: SnapshotStore<T, K> | Snapshot<T, K> | null,
  ) => Snapshot<T, K> | Promise<{ snapshot: Snapshot<T, K>; }>,

  handleSnapshotSuccess: (message: string,
    snapshot: Snapshot<T, K> | null,
    snapshotId: string
  ) => void;
  getSnapshotId: (key: string | SnapshotData<T, K>, snapshot: Snapshot<T, K>) => unknown
  compareSnapshotState: (snapshot1: Snapshot<T, K>, snapshot2: Snapshot<T, K>) => boolean;

  payload: Payload | undefined;
  dataItems: null | T[];
  newData: null | T;
  getInitialState: () =>  Snapshot<T, K> | null ;
  getConfigOption: (optionKey: string) => any;
  getTimestamp: () => Date | undefined;
  getStores: (
    storeId: number,
    snapshotStores: SnapshotStore<T, K>[],
    snapshotStoreConfigs: SnapshotStoreConfig<T, K>[],
  ) => SnapshotStore<T, K>[]; // Define an appropriate type if possible
  getData: (id: number, snapshot: Snapshot<T, K>

  ) => Data | Map<string, Snapshot<T, K>> | null | undefined
  setData: (id: string, data: Map<string, Snapshot<T, K>>) => void;
  addData: (id: string, data: Partial<Snapshot<T, K>>) => void;
  stores: null | SnapshotStore<T, K>[]

  getStore: (
    storeId: number,
    snapshotStore: SnapshotStore<T, K>,
    snapshotId: string | null,
    snapshot: Snapshot<T, K>,
    type: string,
    event: Event) => SnapshotStore<T, K> | null; // Define an appropriate return type
  addStore: (
    storeId: number,
    snapshotId: string,
    snapshotStore: SnapshotStore<T, K>,
    snapshot: Snapshot<T, K>,
    type: string,
    event: Event
  ) => SnapshotStore<T, K> | null
  mapSnapshot: (
    storeId: number,
    snapshotStore: SnapshotStore<T, K>,
    snapshotId: string,
    snapshot: Snapshot<T, K>,
    type: string,
    event: Event,
    callback: (snapshot: Snapshot<T, K>) => void,
    mapFn: (item: T) => T
  ) => Snapshot<T, K> | null;
  mapSnapshotWithDetails: (
    storeId: number,
    snapshotStore: SnapshotStore<T, K>,
    snapshotId: string,
    snapshot: Snapshot<T, K>,
    type: string,
    event: Event,
    callback: (snapshot: Snapshot<T, K>) => void
  ) => SnapshotWithData<T, K> | null;
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
    snapshotId: string,
    snapshotStore: SnapshotStore<T, K>,
    payload: FetchSnapshotPayload<K> | undefined,
    snapshot: Snapshot<T, K>,
    data: T,
    delegate: SnapshotWithCriteria<T, K>[]
  ) => void

  updateSnapshotFailure: (
    snapshotId: string,
    snapshotManager: SnapshotManager<T, K>,
    snapshot: Snapshot<T, K>,
    date: Date | undefined,
    payload: { error: Error }
  ) => void

  fetchSnapshotFailure: (
    snapshotId: string,
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
    snapshotId: string,
    snapshotManager: SnapshotManager<T, K>,
    snapshot: Snapshot<T, K>,
    payload?: { data?: any }) => void;

  createSnapshotFailure: (
    date: Date,
    snapshotId: string,
    snapshotManager: SnapshotManager<T, K>,
    snapshot: Snapshot<T, K>,
    payload: { error: Error; }
  ) => void;

  createSnapshotSuccess: (
    snapshotId: string,
    snapshotManager: SnapshotManager<T, K>,
    snapshot: Snapshot<T, K>,
    payload?: { data?: any }
  ) => void;

  createSnapshots: (
    id: string,
    snapshotId: string,
    snapshots: Snapshot<T, K>[], // Use Snapshot<T, K>[] here
    snapshotManager: SnapshotManager<T, K>,
    payload: CreateSnapshotsPayload<T, K>,
    callback: (snapshots: Snapshot<T, K>[]) => void | null,
    snapshotDataConfig?: SnapshotConfig<T, K>[] | undefined,
    category?: string | Category,
    categoryProperties?: string | CategoryProperties
  ) => Snapshot<T, K>[] | null;

  storeId: number
  snapConfig: SnapshotConfig<T, K>
  onSnapshot: (snapshotId: string,
    snapshot: Snapshot<T, K>,
    type: string,
    event: Event,
    callback: (snapshot: Snapshot<T, K>) => void
  ) => void;
  onSnapshots: (snapshotId: string,
    snapshots: Snapshots<T>,
    type: string,
    event: Event,
    callback: (snapshots: Snapshots<T>) => void
  ) => void;
  events: SnapshotEvents<T, K> | undefined;

}

export type { SnapshotMethods };
