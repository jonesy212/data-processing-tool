// SnapshotMethods.ts
import { BaseData, Data } from '@/app/components/models/data/Data';
import { StatusType } from '@/app/components/models/data/StatusType';
import { Tag } from '@/app/components/models/tracker/Tag';
import { ConfigureSnapshotStorePayload, SnapshotConfig, SnapshotContainer, SnapshotData, SnapshotItem } from '@/app/components/snapshots';
import { SnapshotStoreProps } from '@/app/components/snapshots//useSnapshotStore';
import CalendarManagerStoreClass from "@/app/components/state/stores/CalendarManagerStore";
import { SubscriberCollection } from '@/app/components/users/SubscriberCollection';
import { UnifiedMetaDataOptions } from '@/app/configs/database/MetaDataOptions';
import { StructuredMetadata } from '@/app/configs/StructuredMetadata';
import { CategoryProperties } from '@/app/pages/personas/ScenarioBuilder';
import { CriteriaType } from '@/app/pages/searchs/CriteriaType';
import { SnapshotWithCriteria } from ".";
import { SnapshotWithData } from '../calendar/CalendarApp';
import { CreateSnapshotsPayload, Payload } from '../database/Payload';
import { CombinedEvents, SnapshotManager } from '../hooks/useSnapshotManager';
import { Category } from "../libraries/categories/generateCategoryProperties";
import { DataDetails } from "../models/data/Data";
import { RealtimeDataItem } from "../models/realtime/RealtimeData";
import { DataStoreMethods } from '../projects/DataAnalysisPhase/DataProcessing/ DataStoreMethods';
import { DataStore } from '../projects/DataAnalysisPhase/DataProcessing/DataStore';
import { Subscription } from '../subscriptions/Subscription';
import { NotificationTypeEnum } from "../support/NotificationContext";
import { Subscriber } from "../users/Subscriber";
import Version from '../versions/Version';
import { FetchSnapshotPayload } from './FetchSnapshotPayload';
import { Snapshot, SnapshotUnion, Snapshots } from "./LocalStorageSnapshotStore";
import { default as SnapshotStore, default as SnapshotStoreReference } from "./SnapshotStore";
import { SnapshotStoreConfig } from "./SnapshotStoreConfig";
import { SnapshotSubscriberManagement } from './SnapshotSubscriberManagement';
import { T, K } from "@/app/components/models/data/dataStoreMethods";




type SnapshotMap = Map<T, [K<T>, SnapshotStore<Data, any>]>;

interface SnapshotMethods<
  T extends BaseData<any>,
  K extends T = T,
  Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>,
  ExcludedFields extends keyof T = never
> {
  isCore: boolean;
  storeId: number;
  snapConfig: SnapshotConfig<T, K> | undefined;
  subscriberManagement?: SnapshotSubscriberManagement<T, K> | undefined;
  failureDate?: Date; // Tracks the most recent failure date

  getSnapshots: (category: string, data: Snapshots<T, K>) => void;
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
    filter?: (snapshot: Snapshot<T, K>) => boolean,
    dataCallback?: (
      subscribers: Subscriber<T, K>[],
      snapshots: Snapshots<T, K>
    ) => Promise<SnapshotUnion<T, K, Meta>[]>
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
    dataDetails?: DataDetails<T, K>,
    generatorType?: string
  ) => string;

  compareSnapshots: (snap1: Snapshot<T, K>, snap2: Snapshot<T, K>) => {
    snapshot1: Snapshot<T, K>;
    snapshot2: Snapshot<T, K>;
    differences: Record<string, { snapshot1: any; snapshot2: any }>;
    versionHistory: {
      snapshot1Version?: string | number | Version<T, K>;
      snapshot2Version?: string | number | Version<T, K>;
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
    snapshot: Snapshot<T, K>,
    snapshotStore: SnapshotStore<T, K>,
    snapshots: Snapshots<T, K>,
  ) => Promise<{ snapshots: Snapshots<T, K>; }>;

  batchFetchSnapshots: (
    criteria: CriteriaType,
    snapshotData: (
      snapshotIds: string[],
      subscribers: SubscriberCollection<T, K>,
      snapshots: Snapshots<T, K>
    ) => Promise<{
      subscribers: SubscriberCollection<T, K>;
      snapshots: Snapshots<T, K>; // Include snapshots here for consistency
    }>
  ) => Promise<Snapshots<T, K>>;

  batchTakeSnapshotsRequest: (
    criteria: CriteriaType,
    snapshotData: (
      snapshotIds: string[],
      snapshots: Snapshots<T, K>,
      subscribers: Subscriber<T, K>[]
    ) => Promise<{
      subscribers: Subscriber<T, K>[]
    }>
  ) => Promise<void>;

  batchUpdateSnapshotsRequest: (
    snapshotData: (
      subscribers: SubscriberCollection<T, K>) => Promise<{
      subscribers: SubscriberCollection<T, K>;
      snapshots: Snapshots<T, K>
    }>,
    snapshotManager: SnapshotManager<T, K>
  ) => Promise<void>;

  getSnapshotItems: (
    // snapshotId: string,
    // callback: (snapshots: Snapshots<T, K>) => Subscriber<T, K> | null,
    // snapshot: Snapshot<T, K> | null
  ) => (SnapshotStoreConfig<T, any> | SnapshotItem<Data<T, K, Meta>, any>)[] | undefined; // Adjust to specific type if known
 
  filterSnapshotsByStatus: (status: StatusType) => Snapshots<T, K>;
  filterSnapshotsByCategory: (category: Category) => Snapshots<T, K>;
  filterSnapshotsByTag: (tag: Tag<T, K>) => Snapshots<T, K>;
  batchFetchSnapshotsSuccess: (
    subscribers: SubscriberCollection<T, K>[],
    snapshots: Snapshots<T, K>
  ) => void;
  
  batchFetchSnapshotsFailure: (
    date: Date,
    snapshotManager: SnapshotManager<T, K>,
    snapshot: Snapshot<T, K>,
    payload: { error: Error; }
  ) => void;
  
  batchUpdateSnapshotsSuccess: (
    subscribers: SubscriberCollection<T, K>,
    snapshots: Snapshots<T, K>
  ) => void;
  
  batchUpdateSnapshotsFailure: (
    date: Date,
    snapshotId: string | number | null,
    snapshotManager: SnapshotManager<T, K>,
    snapshot: Snapshot<T, K>,
    payload: { error: Error; }
  ) => void;

  snapshot: (
    id: string | number | undefined,
    snapshotData: SnapshotData<T, K>,
    category: Category | undefined,
    categoryProperties: CategoryProperties | undefined,
    callback: (snapshotStore: SnapshotStore<T, K>) => void,
    dataStore: DataStore<T, K>,
    dataStoreMethods: DataStoreMethods<T, K>,
    // dataStoreSnapshotMethods: DataStoreWithSnapshotMethods<T, K>,
    metadata: UnifiedMetaDataOptions<T, K, Meta, ExcludedFields>,
    subscriberId: string, // Add subscriberId here
    endpointCategory: string | number, // Add endpointCategory here
    storeProps: SnapshotStoreProps<T, K>,
    snapshotConfigData: SnapshotConfig<T, K>,
    subscription: Subscription<T, K>,
    snapshotId?: string | number | null,
    snapshotStoreConfigData?: SnapshotStoreConfig<T, K>,
    snapshotContainer?: SnapshotStore<T, K> | Snapshot<T, K> | null,
  ) => Promise<{ snapshot: Snapshot<T, K>; }>,

  handleSnapshotSuccess: (
    message: string,
    snapshot: Snapshot<T, K> | null,
    snapshotId: string
  ) => void;

  handleSnapshotFailure: (error: Error, snapshotId: string) => void; // New method added
  getSnapshotId: (key: string | T, snapshot: Snapshot<T, K>) => string
  compareSnapshotState: (snapshot1: Snapshot<T, K> | null, snapshot2: Snapshot<T, K>) => boolean;

  payload: Payload | undefined;
  dataItems: () =>  RealtimeDataItem[] | null;
  newData: Snapshot<T, K> | null 
  getInitialState: () => Snapshot<T, K> | null;
  getConfigOption: (optionKey: string) => any;
  getTimestamp: () => Date | undefined;
  getStores: (
    storeId: number,
    snapshotId: string,
    snapshotStoreConfigs: SnapshotStoreConfig<T, K>[],
    snapshotStores?: SnapshotStoreReference<T, K>[],
  ) => SnapshotMap
  
  
  getData: (id: number | string, snapshotStore: SnapshotStore<T, K>
  ) =>  BaseData<any> | Map<string, Snapshot<T, K>> | null | undefined
  getDataVersions: (id: number) => Promise<Snapshot<T, K>[] | undefined>
  updateDataVersions: (id: number, versions: Snapshot<T, K>[]) => void
  setData: (id: string, data: Map<string, Snapshot<T, K>>) => void;
  addData: (id: string, data: Partial<Snapshot<T, K>>) => void;
  removeData: (id: number) => void;
  updateData: (id: number, newData: Snapshot<T, K>) => void;
  stores: (storeProps: SnapshotStoreProps<T, K>) => SnapshotStore<T, K>[];

  getStore: (
    storeId: number,
    snapshotStore: SnapshotStore<T, K>,
    snapshotId: string | null,
    snapshot: Snapshot<T, K>,
    snapshotStoreConfig: SnapshotStoreConfig<T, K>,
    type: string,
    event: Event
  ) => SnapshotStore<T, K> | null; // Define an appropriate return type
  
  addStore: (
    storeId: number,
    snapshotId: string | null,
    snapshotStore: SnapshotStore<T, K>,
    snapshot: Snapshot<T, K>,
    type: string,
    event: Event
  ) => SnapshotStore<T, K> | null
  
  mapSnapshot: (
    id: number,
    storeId: string | number,
    snapshotStore: SnapshotStore<T, K>,
    snapshotContainer: SnapshotContainer<T, K>,
    snapshotId: string,
    criteria: CriteriaType,
    snapshot: Snapshot<T, K>,
    type: string,
    event: Event,
    callback: (snapshot: Snapshot<T, K>) => void,
    mapFn: (item: T) => T,
    isAsync?: boolean // Flag to determine behavior
  ) => Promise<string | undefined> | Snapshot<T, K> | null 

  mapSnapshotWithDetails: (
    storeId: number,
    snapshotStore: SnapshotStore<T, K>,
    snapshotId: string,
    snapshot: Snapshot<T, K>,
    type: string,
    event: Event,
    callback: (snapshot: Snapshot<T, K>) => void,
    details: any
  ) => SnapshotWithData<T, K> | null;

  removeStore: (
    storeId: number,
    store: SnapshotStore<T, K>,
    snapshotId: string,
    snapshot: Snapshot<T, K>,
    type: string,
    event: Event
  ) => void;

  unsubscribe: (
    unsubscribeDetails: {
      userId: string; snapshotId: string;
      unsubscribeType: string;
      unsubscribeDate: Date;
      unsubscribeReason: string;
      unsubscribeData: any;
    },
      event: string,
      callback: (snapshot: Snapshot<T, K>) => void
  ) => void;

  fetchSnapshot: (
    snapshotId: string, 
    callback: (
      snapshotId: string,
      payload: FetchSnapshotPayload<T> | undefined,
      snapshotStore: SnapshotStore<T, K>,
      payloadData: T |  BaseData<any>,
      category: symbol | string | Category | undefined, 
      categoryProperties: CategoryProperties | undefined,
      timestamp: Date,
      data: T,
      delegate: SnapshotWithCriteria<T, K>[]
   ) => Snapshot<T, K>
  ) => Promise<{
    id: string; 
    category: Category; 
    categoryProperties: CategoryProperties | undefined; 
    timestamp: Date; 
    snapshot: Snapshot<T, K>;
    data: BaseData;
    delegate: SnapshotWithCriteria<T, K>[]; 
  }> 

  fetchSnapshotSuccess: (
    id: number,
    snapshotId: string,
    snapshotStore: SnapshotStore<T, K>,
    payload: FetchSnapshotPayload<T, K> | undefined,
    snapshot: Snapshot<T, K>,
    data: T,
    delegate: SnapshotWithCriteria<T, K>[],
    snapshotData: (
      snapshotManager: SnapshotManager<T, K>,
      subscribers: Subscriber<T, K>[],
      snapshot: Snapshot<T, K>
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
    date: Date, 
    snapshotId: string | number | null,
    snapshotManager: SnapshotManager<T, K>,
    snapshot: Snapshot<T, K>,
     payload: { error: Error; }
    ) => void;
  
  configureSnapshotStore: (
    snapshotStore: SnapshotStore<T, K>,
    storeId: number,
    snapshotId: string,
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
    payload?: { data?: Error }
  ) => void;

  createSnapshotFailure: (
    date: Date,
    snapshotId: string | number | null,
    snapshotManager: SnapshotManager<T, K>,
    snapshot: Snapshot<T, K>,
    payload: { error: Error; }
  ) => void;

  createSnapshotSuccess: (
    snapshotId: string | number | null,
    snapshotManager: SnapshotManager<T, K>,
    snapshot: Snapshot<T, K>,
    payload?: { data?: any }
  ) => void;

  createSnapshots: (
    id: string,
    snapshotId: string | number | null,
    snapshots: Snapshot<T, K>[], // Use Snapshot<T, K>[] here
    snapshotManager: SnapshotManager<T, K>,
    payload: CreateSnapshotsPayload<T, K>,
    callback: (snapshots: Snapshot<T, K>[]) => void | null,
    snapshotDataConfig?: SnapshotConfig<T, K>[] | undefined,
    category?: string | symbol | Category | undefined,
    categoryProperties?: string | CategoryProperties
  ) => Snapshot<T, K>[] | null;

  onSnapshot: (
    snapshotId: string,
    snapshot: Snapshot<T, K>,
    type: string,
    event: Event,
    callback: (snapshot: Snapshot<T, K>) => void
  ) => void;
  onSnapshots: (snapshotId: string,
    snapshots: Snapshots<T, K>,
    type: string,
    event: Event,
    callback: (snapshots: Snapshots<T, K>) => void
  ) => void;
  events: CombinedEvents<T, K> | undefined;

}

export type { SnapshotMethods };
