import { Callback, ConfigureSnapshotStorePayload, SnapshotConfig, SnapshotContainer, SnapshotData, SnapshotStoreProps } from '@/app/components/snapshots';
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

import { UnifiedMetaDataOptions } from '@/app/configs/database/MetaDataOptions';
import { CriteriaType } from '@/app/pages/searchs/CriteriaType';
import { DataStoreMethods } from '../projects/DataAnalysisPhase/DataProcessing/ DataStoreMethods';
import { Subscription } from '../subscriptions/Subscription';
import Version from '../versions/Version';
import SnapshotStore from "./SnapshotStore";
import { SnapshotStoreConfig } from "./SnapshotStoreConfig";
import { SnapshotSubscriberManagement } from './SnapshotSubscriberManagement';

// SnapshotMethods.ts
interface SnapshotMethods<T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T> {
  isCore: boolean;
  storeId: number;
  snapConfig: SnapshotConfig<T, Meta, K> | undefined;
  subscriberManagement?: SnapshotSubscriberManagement<T, Meta, K> | undefined;

  getSnapshots: (category: string, data: Snapshots<T, Meta>) => void;
  getAllSnapshots: (
    storeId: number,
    snapshotId: string,
    snapshotData: T,
    timestamp: string,
    type: string,
    event: Event,
    id: number,
    snapshotStore: SnapshotStore<T, Meta, K>,
    category: symbol | string | Category | undefined,
    categoryProperties: CategoryProperties | undefined,
    dataStoreMethods: DataStore<T, Meta, K>,
    data: T,
    filter?: (snapshot: Snapshot<T, Meta, K>) => boolean,
    dataCallback?: (
      subscribers: Subscriber<T, Meta, K>[],
      snapshots: Snapshots<T, Meta>
    ) => Promise<SnapshotUnion<T, Meta>[]>
  ) => Promise<Snapshot<T, Meta, K>[]>;

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

  compareSnapshots: (snap1: Snapshot<T, Meta, K>, snap2: Snapshot<T, Meta, K>) => {
    snapshot1: Snapshot<T, Meta, K>;
    snapshot2: Snapshot<T, Meta, K>;
    differences: Record<string, { snapshot1: any; snapshot2: any }>;
    versionHistory: {
      snapshot1Version?: number | Version;
      snapshot2Version?: number | Version;
    };
  } | null;

  compareSnapshotItems: (
    snap1: Snapshot<T, Meta, K>,
    snap2: Snapshot<T, Meta, K>,
    keys: (keyof Snapshot<T, Meta, K>)[]
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
    snapshot: Snapshot<T, Meta, K>,
    snapshotStore: SnapshotStore<T, Meta, K>,
    snapshots: Snapshots<T, Meta>,
  ) => Promise<{ snapshots: Snapshots<T, Meta>; }>;

  batchFetchSnapshots: (
    criteria: CriteriaType,
    snapshotData: (
      snapshotIds: string[],
      subscribers: SubscriberCollection<T, Meta, K>,
      snapshots: Snapshots<T, Meta>
    ) => Promise<{
      subscribers: SubscriberCollection<T, Meta, K>;
      snapshots: Snapshots<T, Meta>; // Include snapshots here for consistency
    }>
  ) => Promise<Snapshot<T, Meta, K>[]>;

  batchTakeSnapshotsRequest: (
    criteria: CriteriaType,
    snapshotData: (
      snapshotIds: string[],
      snapshots: Snapshots<T, Meta>,
      subscribers: Subscriber<T, Meta, K>[]
    ) => Promise<{
      subscribers: Subscriber<T, Meta, K>[]
    }>
  ) => Promise<void>;

  batchUpdateSnapshotsRequest: (
    snapshotData: (subscribers: SubscriberCollection<T, Meta, K>) => Promise<{
      subscribers: SubscriberCollection<T, Meta, K>;
      snapshots: Snapshots<T, Meta>
    }>,
    snapshotManager: SnapshotManager<T, Meta, K>
  ) => Promise<void>;

  filterSnapshotsByStatus: (status: string) => Snapshots<T, Meta>;
  filterSnapshotsByCategory: (category: string) => Snapshots<T, Meta>;
  filterSnapshotsByTag: (tag: string) => Snapshots<T, Meta>;
  batchFetchSnapshotsSuccess: (
    subscribers: SubscriberCollection<T, Meta, K>[],
    snapshots: Snapshots<T, Meta>) => void;
  batchFetchSnapshotsFailure: (date: Date,
    snapshotManager: SnapshotManager<T, Meta, K>,
    snapshot: Snapshot<T, Meta, K>,
    payload: { error: Error; }
  ) => void;
  batchUpdateSnapshotsSuccess: (
    subscribers: SubscriberCollection<T, Meta, K>,
    snapshots: Snapshots<T, Meta>
  ) => void;
  
  batchUpdateSnapshotsFailure: (
    date: Date,
    snapshotId: string | number,
    snapshotManager: SnapshotManager<T, Meta, K>,
    snapshot: Snapshot<T, Meta, K>,
    payload: { error: Error; }
  ) => void;

  snapshot: (
    id: string | number | undefined,
    snapshotId: string | number | null,
    snapshotData: SnapshotData<T, Meta, K>,
    category: Category | undefined,
    categoryProperties: CategoryProperties | undefined,
    callback: (snapshotStore: SnapshotStore<T, Meta, K>) => void,
    dataStore: DataStore<T, Meta, K>,
    dataStoreMethods: DataStoreMethods<T, Meta, K>,
    // dataStoreSnapshotMethods: DataStoreWithSnapshotMethods<T, Meta, K>,
    metadata: UnifiedMetaDataOptions,
    subscriberId: string, // Add subscriberId here
    endpointCategory: string | number, // Add endpointCategory here
    storeProps: SnapshotStoreProps<T, Meta, K>,
    snapshotConfigData: SnapshotConfig<T, Meta, K>,
    subscription: Subscription<T, Meta, K>,
    snapshotStoreConfigData?: SnapshotStoreConfig<T, Meta, K>,
    snapshotContainer?: SnapshotStore<T, Meta, K> | Snapshot<T, Meta, K> | null,
  ) => Snapshot<T, Meta, K> | Promise<{ snapshot: Snapshot<T, Meta, K>; }>,

  handleSnapshotSuccess: (
    message: string,
    snapshot: Snapshot<T, Meta, K> | null,
    snapshotId: string
  ) => void;

  handleSnapshotFailure: (error: Error, snapshotId: string) => void; // New method added
  getSnapshotId: (key: string | T, snapshot: Snapshot<T, Meta, K>) => unknown
  compareSnapshotState: (snapshot1: Snapshot<T, Meta, K>, snapshot2: Snapshot<T, Meta, K>) => boolean;

  payload: Payload | undefined;
  dataItems: () =>  RealtimeDataItem[] | null;
  newData: null | Snapshot<T, Meta, K>;
  getInitialState: () => Snapshot<T, Meta, K> | null;
  getConfigOption: (optionKey: string) => any;
  getTimestamp: () => Date | undefined;
  getStores: (
    storeId: number,
    snapshotId: string,
    snapshotStores: SnapshotStore<T, Meta, K>[],
    snapshotStoreConfigs: SnapshotStoreConfig<T, Meta, K>[],
  ) => SnapshotStore<T, Meta, K>[]; // Define an appropriate type if possible
  
  
  getData: (id: number | string, snapshotStore: SnapshotStore<T, Meta, K>
  ) => Data | Map<string, Snapshot<T, Meta, K>> | null | undefined
  getDataVersions: (id: number) => Promise<Snapshot<T, Meta, K>[] | undefined>
  updateDataVersions: (id: number, versions: Snapshot<T, Meta, K>[]) => void
  setData: (id: string, data: Map<string, Snapshot<T, Meta, K>>) => void;
  addData: (id: string, data: Partial<Snapshot<T, Meta, K>>) => void;
  removeData: (id: number) => void;
  updateData: (id: number, newData: Snapshot<T, Meta, K>) => void;
  stores: () => SnapshotStore<T, Meta, K>[];

  getStore: (
    storeId: number,
    snapshotStore: SnapshotStore<T, Meta, K>,
    snapshotId: string | null,
    snapshot: Snapshot<T, Meta, K>,
    snapshotStoreConfig: SnapshotStoreConfig<T, Meta, K>,
    type: string,
    event: Event
  ) => SnapshotStore<T, Meta, K> | null; // Define an appropriate return type
  addStore: (
    storeId: number,
    snapshotId: string,
    snapshotStore: SnapshotStore<T, Meta, K>,
    snapshot: Snapshot<T, Meta, K>,
    type: string,
    event: Event
  ) => SnapshotStore<T, Meta, K> | null
  mapSnapshot: (
    id: number,
    storeId: string | number,
    snapshotStore: SnapshotStore<T, Meta, K>,
    snapshotContainer: SnapshotContainer<T, Meta, K>,
    snapshotId: string,
    criteria: CriteriaType,
    snapshot: Snapshot<T, Meta, K>,
    type: string,
    event: Event,
    callback: (snapshot: Snapshot<T, Meta, K>) => void,
    mapFn: (item: T) => T
  ) => Snapshot<T, Meta, K> | null;

  mapSnapshotWithDetails: (
    storeId: number,
    snapshotStore: SnapshotStore<T, Meta, K>,
    snapshotId: string,
    snapshot: Snapshot<T, Meta, K>,
    type: string,
    event: Event,
    callback: (snapshot: Snapshot<T, Meta, K>) => void
  ) => SnapshotWithData<T, Meta, K> | null;
  removeStore: (
    storeId: number,
    store: SnapshotStore<T, Meta, K>,
    snapshotId: string,
    snapshot: Snapshot<T, Meta, K>,
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
    callback: Callback<Snapshot<T, Meta, K>> | null
  ) => void;

  fetchSnapshot: (
    callback: (
    snapshotId: string,
    payload: FetchSnapshotPayload<K> | undefined,
    snapshotStore: SnapshotStore<T, Meta, K>,
    payloadData: T | Data,
    category: Category | undefined,
    categoryProperties: CategoryProperties | undefined,
    timestamp: Date,
    data: T,
    delegate: SnapshotWithCriteria<T, Meta, K>[]
    ) => Snapshot<T, Meta, K> | Promise<{ snapshot: Snapshot<T, Meta, K>; }> 
  ) => Promise<{
    id: string;
    category: Category | string | symbol | undefined;
    categoryProperties: CategoryProperties | undefined;
    timestamp: Date;
    snapshot: Snapshot<T, Meta, K>;
    data: T;
    delegate: SnapshotStoreConfig<T, Meta, K>[];
  }>;

  fetchSnapshotSuccess: (
    id: number,
    snapshotId: string,
    snapshotStore: SnapshotStore<T, Meta, K>,
    payload: FetchSnapshotPayload<T, Meta, K> | undefined,
    snapshot: Snapshot<T, Meta, K>,
    data: T,
    delegate: SnapshotWithCriteria<T, Meta, K>[],
    snapshotData: (
      snapshotManager: SnapshotManager<SnapshotUnion<BaseData, Meta>, T>,
      subscribers: Subscriber<T, Meta, K>[],
      snapshot: Snapshot<SnapshotUnion<BaseData, Meta>, T>
    ) => void,
  ) => SnapshotWithCriteria<T, Meta, K>[]

  updateSnapshotFailure: (
    snapshotId: string,
    snapshotManager: SnapshotManager<T, Meta, K>,
    snapshot: Snapshot<T, Meta, K>,
    date: Date | undefined,
    payload: { error: Error }
  ) => void

  fetchSnapshotFailure: (
    snapshotId: string,
    snapshotManager: SnapshotManager<T, Meta, K>,
    snapshot: Snapshot<T, Meta, K>,
    date: Date | undefined,
    payload: { error: Error }
  ) => void

  addSnapshotFailure: (
    date: Date, snapshotManager: SnapshotManager<T, Meta, K>,
    snapshot: Snapshot<T, Meta, K>, payload: { error: Error; }) => void;
  
  configureSnapshotStore: (
    snapshotStore: SnapshotStore<T, Meta, K>,
    storeId: number,
    data: Map<string, Snapshot<T, Meta, K>>,
    events: Record<string, CalendarManagerStoreClass<T, Meta, K>[]>,
    dataItems: RealtimeDataItem[],
    newData: Snapshot<T, Meta, K>,
    payload: ConfigureSnapshotStorePayload<T, Meta, K>,
    store: SnapshotStore<any, Meta, K>,
    callback: (snapshotStore: SnapshotStore<T, Meta, K>) => void,
    config: SnapshotStoreConfig<T, Meta, K>
  ) => void;
  
  updateSnapshotSuccess: (
    snapshotId: string,
    snapshotManager: SnapshotManager<T, Meta, K>,
    snapshot: Snapshot<T, Meta, K>,
    payload?: { data?: Error }) => void;

  createSnapshotFailure: (
    date: Date,
    snapshotId: string,
    snapshotManager: SnapshotManager<T, Meta, K>,
    snapshot: Snapshot<T, Meta, K>,
    payload: { error: Error; }
  ) => void;

  createSnapshotSuccess: (
    snapshotId: string | number,
    snapshotManager: SnapshotManager<T, Meta, K>,
    snapshot: Snapshot<T, Meta, K>,
    payload?: { data?: any }
  ) => void;

  createSnapshots: (
    id: string,
    snapshotId: string | number,
    snapshots: Snapshot<T, Meta, K>[], // Use Snapshot<T, Meta, K>[] here
    snapshotManager: SnapshotManager<T, Meta, K>,
    payload: CreateSnapshotsPayload<T, Meta, K>,
    callback: (snapshots: Snapshot<T, Meta, K>[]) => void | null,
    snapshotDataConfig?: SnapshotConfig<T, Meta, K>[] | undefined,
    category?: string | Category,
    categoryProperties?: string | CategoryProperties
  ) => Snapshot<T, Meta, K>[] | null;

  onSnapshot: (snapshotId: string,
    snapshot: Snapshot<T, Meta, K>,
    type: string,
    event: Event,
    callback: (snapshot: Snapshot<T, Meta, K>) => void
  ) => void;
  onSnapshots: (snapshotId: string,
    snapshots: Snapshots<T, Meta>,
    type: string,
    event: Event,
    callback: (snapshots: Snapshots<T, Meta>) => void
  ) => void;
  events: CombinedEvents<T, Meta, K> | undefined;

}

export type { SnapshotMethods };
