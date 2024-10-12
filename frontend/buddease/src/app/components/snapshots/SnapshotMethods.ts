import { Callback, ConfigureSnapshotStorePayload, SnapshotConfig, SnapshotContainer, SnapshotData, SnapshotDataType, SnapshotStoreProps } from '@/app/components/snapshots';
import { SubscriberCollection } from '@/app/components/snapshots/SnapshotStore';

import { CategoryProperties } from '@/app/pages/personas/ScenarioBuilder';
import { SnapshotWithCriteria } from ".";
import { SnapshotWithData } from '../calendar/CalendarApp';
import { CreateSnapshotsPayload, Payload } from '../database/Payload';
import { CombinedEvents, SnapshotManager } from '../hooks/useSnapshotManager';
import { Category } from "../libraries/categories/generateCategoryProperties";
import { BaseData, Data, DataDetails } from "../models/data/Data";
import { RealtimeDataItem } from "../models/realtime/RealtimeData";
import { DataStore } from '../projects/DataAnalysisPhase/DataProcessing/DataStore';
import CalendarManagerStoreClass from "../state/stores/CalendarEvent";
import { NotificationTypeEnum } from "../support/NotificationContext";
import { Subscriber } from "../users/Subscriber";
import { FetchSnapshotPayload } from './FetchSnapshotPayload';
import { Snapshot, SnapshotUnion, Snapshots } from "./LocalStorageSnapshotStore";


import { CriteriaType } from '@/app/pages/searchs/CriteriaType';
import SnapshotStore from "./SnapshotStore";
import { SnapshotStoreConfig } from "./SnapshotStoreConfig";
import { SnapshotSubscriberManagement } from './SnapshotSubscriberManagement';
import { DataStoreMethods } from '../projects/DataAnalysisPhase/DataProcessing/ DataStoreMethods';
import { UnifiedMetaDataOptions } from '@/app/configs/database/MetaDataOptions';
import Version from '../versions/Version';
import { Subscription } from '../subscriptions/Subscription';

// SnapshotMethods.ts
interface SnapshotMethods<T extends Data, K extends Data> {
  isCore: boolean;
  storeId: number;
  snapConfig: SnapshotConfig<T, K> | undefined;
  subscriberManagement?: SnapshotSubscriberManagement<T, K> | undefined;

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
      snapshot1Version?: number | Version;
      snapshot2Version?: number | Version;
    };
  } | null;

  compareSnapshotItems: (
    snap1: Snapshot<T, K>,
    snap2: Snapshot<T, K>,
    keys: (keyof Snapshot<T, K>)[]
  ) => {
    itemDifferences: Record<string, {
      snapshot1: any;
      snapshot2: any;
      differences: {
        [key: string]: { value1: any; value2: any };
      };
    }>;
  } | null;

  batchTakeSnapshot: (
    id: number,
    snapshotId: string,
    snapshotStore: SnapshotStore<T, K>,
    snapshots: Snapshots<T>
  ) => Promise<{ snapshots: Snapshots<T>; }>;

  batchFetchSnapshots: (
    criteria: CriteriaType,
    snapshotData: (
      snapshotIds: string[],
      subscribers: SubscriberCollection<T, K>,
      snapshots: Snapshots<T>
    ) => Promise<{
      subscribers: SubscriberCollection<T, K>;
      snapshots: Snapshots<T>; // Include snapshots here for consistency
    }>
  ) => Promise<Snapshot<T, K>[]>;

  batchTakeSnapshotsRequest: (
    criteria: CriteriaType,
    snapshotData: (
      snapshotIds: string[],
      snapshots: Snapshots<T>,
      subscribers: Subscriber<T, K>[]
    ) => Promise<{
      subscribers: Subscriber<T, K>[]
    }>
  ) => Promise<void>;

  batchUpdateSnapshotsRequest: (
    snapshotData: (subscribers: SubscriberCollection<T, K>) => Promise<{
      subscribers: SubscriberCollection<T, K>;
      snapshots: Snapshots<T>
    }>,
    snapshotManager: SnapshotManager<T, K>
  ) => Promise<void>;
  filterSnapshotsByStatus: (status: string) => Snapshots<T>;
  filterSnapshotsByCategory: (category: string) => Snapshots<T>;
  filterSnapshotsByTag: (tag: string) => Snapshots<T>;
  batchFetchSnapshotsSuccess: (
    subscribers: SubscriberCollection<T, K>[],
    snapshots: Snapshots<T>) => void;
  batchFetchSnapshotsFailure: (date: Date,
    snapshotManager: SnapshotManager<T, K>,
    snapshot: Snapshot<T, K>,
    payload: { error: Error; }
  ) => void;
  batchUpdateSnapshotsSuccess: (
    subscribers: SubscriberCollection<T, K>,
    snapshots: Snapshots<T>
  ) => void;
  
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
    dataStore: DataStore<T, K>,
    dataStoreMethods: DataStoreMethods<T, K>,
    // dataStoreSnapshotMethods: DataStoreWithSnapshotMethods<T, K>,
    metadata: UnifiedMetaDataOptions,
    subscriberId: string, // Add subscriberId here
    endpointCategory: string | number, // Add endpointCategory here
    storeProps: SnapshotStoreProps<T, K>,
    snapshotConfigData: SnapshotConfig<T, K>,
    subscription: Subscription<T, K>,
    snapshotStoreConfigData?: SnapshotStoreConfig<T, K>,
    snapshotContainer?: SnapshotStore<T, K> | Snapshot<T, K> | null,
  ) => Snapshot<T, K> | Promise<{ snapshot: Snapshot<T, K>; }>,

  handleSnapshotSuccess: (
    message: string,
    snapshot: Snapshot<T, K> | null,
    snapshotId: string
  ) => void;

  handleSnapshotFailure: (error: Error, snapshotId: string) => void; // New method added
  getSnapshotId: (key: string | SnapshotData<T, K>, snapshot: Snapshot<T, K>) => unknown
  compareSnapshotState: (snapshot1: Snapshot<T, K>, snapshot2: Snapshot<T, K>) => boolean;

  payload: Payload | undefined;
  dataItems: null | RealtimeDataItem[];
  newData: null | Snapshot<T, K>;
  getInitialState: () => Snapshot<T, K> | null;
  getConfigOption: (optionKey: string) => any;
  getTimestamp: () => Date | undefined;
  getStores: (
    storeId: number,
    snapshotStores: SnapshotStore<T, K>[],
    snapshotStoreConfigs: SnapshotStoreConfig<T, K>[],
  ) => SnapshotStore<T, K>[]; // Define an appropriate type if possible
  getData: (id: number | string, snapshotStore: SnapshotStore<T, K>

  ) => Data | Map<string, Snapshot<T, K>> | null | undefined
  getDataVersions: (id: number) => Promise<Snapshot<T, K>[] | undefined>
  updateDataVersions: (id: number, versions: Snapshot<T, K>[]) => void
  setData: (id: string, data: Map<string, Snapshot<T, K>>) => void;
  addData: (id: string, data: Partial<Snapshot<T, K>>) => void;
  removeData: (id: number) => void;
  updateData: (id: number, newData: Snapshot<T, K>) => void;
  stores: null | SnapshotStore<T, K>[]

  getStore: (
    storeId: number,
    snapshotId: string | null,
    snapshot: Snapshot<T, K>,
    snapshotStoreConfig: SnapshotStoreConfig<T, K>,
    type: string,
    event: Event
  ) => SnapshotStore<T, K> | null; // Define an appropriate return type
  addStore: (
    storeId: number,
    snapshotId: string,
    snapshotStore: SnapshotStore<T, K>,
    snapshot: Snapshot<T, K>,
    type: string,
    event: Event
  ) => SnapshotStore<T, K> | null
  mapSnapshot: (
    id: number,
    storeId: number,
    snapshotStore: SnapshotStore<T, K>,
    snapshotContainer: SnapshotContainer<T, K>,
    snapshotId: string,
    criteria: CriteriaType,
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
    ) => Snapshot<T, K> | Promise<{ snapshot: Snapshot<T, K>; }>,
  ) => Promise<{
    id: string;
    category: Category | string | symbol | undefined;
    categoryProperties: CategoryProperties | undefined;
    timestamp: Date;
    snapshot: Snapshot<T, K>;
    data: T;
    delegate: SnapshotStoreConfig<T, K>[];
  }>;

  fetchSnapshotSuccess: (
    id: number,
    snapshotId: string,
    snapshotStore: SnapshotStore<T, K>,
    payload: FetchSnapshotPayload<T, K> | undefined,
    snapshot: Snapshot<T, K>,
    data: T,
    delegate: SnapshotWithCriteria<T, K>[],
    snapshotData: (
      snapshotManager: SnapshotManager<SnapshotUnion<BaseData>, T>,
      subscribers: Subscriber<T, K>[],
      snapshot: Snapshot<SnapshotUnion<BaseData>, T>
    ) => void,
  ) => SnapshotWithCriteria<T, K>[]

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
    payload?: { data?: Error }) => void;

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
  events: CombinedEvents<T, K> | undefined;

}

export type { SnapshotMethods };
