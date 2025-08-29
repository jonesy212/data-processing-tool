// SnapshotMethods.ts
import { SnapshotContext } from '@/app/components/snapshots/SnapshotSubscriberManagement';
import { BaseData, Data } from '@/app/components/models/data/Data';
import { K, T } from "@/app/components/models/data/dataStoreMethods";
import { StatusType } from '@/app/components/models/data/StatusType';
import { Tag } from '@/app/components/models/tracker/Tag';
import { ConfigureSnapshotStorePayload, SnapshotConfig, SnapshotContainer, SnapshotData, SnapshotItem } from '@/app/components/snapshots';
import { SnapshotStoreProps } from '@/app/components/snapshots//useSnapshotStore';
import { SnapshotsArray } from '@/app/components/snapshots/LocalStorageSnapshotStore';
import CalendarManagerStoreClass from "@/app/components/state/stores/CalendarManagerStore";
import { SubscriberCollection } from '@/app/components/users/SubscriberCollection';
import { UnifiedMetadata } from "@/app/configs/database/MetaDataOptions";

import { NotificationTypeEnum } from "@/app/context/NotificationContext";
import { CategoryProperties } from '@/app/pages/personas/ScenarioBuilder';
import { CriteriaType } from '@/app/pages/searchs/CriteriaType';
import { SnapshotWithCriteria } from ".";
import { SnapshotWithData } from '../calendar/CalendarApp';
import { CreateSnapshotsPayload, Payload } from '../../../server/database/Payload';
import { CombinedEvents, SnapshotManager } from '../hooks/useSnapshotManager';
import { Category } from "../libraries/categories/generateCategoryProperties";
import { DataDetails } from "../models/data/Data";
import { RealtimeDataItem } from "../models/realtime/RealtimeData";
import { DataStoreMethods } from '../projects/DataAnalysisPhase/DataProcessing/ DataStoreMethods';
import { DataStore } from '../projects/DataAnalysisPhase/DataProcessing/DataStore';
import { Subscription } from '../subscriptions/Subscription';
import { Subscriber } from "../users/Subscriber";
import Version from '../versions/Version';
import { FetchSnapshotPayload } from './FetchSnapshotPayload';
import { SnapshotUnion, Snapshots } from "./LocalStorageSnapshotStore";
import { Snapshot } from "./Snapshot";
import { default as SnapshotStore, default as SnapshotStoreReference } from "./SnapshotStore";
import { SnapshotStoreConfig } from "./SnapshotStoreConfig";
import { SnapshotSubscriberManagement } from './SnapshotSubscriberManagement';
import { BaseDataEntity, DefaultMeta, DefaultExcludedFields } from '@/app/configs/BaseConfig';


type SnapshotMap = Map<T, [K, SnapshotStore<T, K>]>;

interface SnapshotMethods<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>
> {
  isCore: boolean;
  storeId: number;
  snapConfig: SnapshotConfig<T, K> | undefined;
  subscriberManagement?: SnapshotSubscriberManagement<T, K> | undefined;
  failureDate?: Date; // Tracks the most recent failure date
  payload: Payload | undefined;
  dataItems?: RealtimeDataItem[];
  newData: Snapshot<T, K, Meta, ExcludedFields> | null;
  getAll(): T[];
  getSnapshots: (category: string, data: Snapshots<T, K, Meta, ExcludedFields>) => void;
  getAllSnapshots: (
    storeId: number,
    event: Event,
    ctx: SnapshotContext<T, K, Meta, ExcludedFields> & {
      timestamp: string;
      type: string;
      id: number;
      categoryProperties?: CategoryProperties;
      dataStoreMethods: DataStore<T, K>;
      data: T;
    },
    filter?: (snapshot: Snapshot<T, K, Meta, ExcludedFields>) => boolean,
    dataCallback?: (
      subscribers: Subscriber<T, K>[],
      snapshots: Snapshots<T, K, Meta, ExcludedFields>
    ) => Promise<SnapshotUnion<T, K, Meta, ExcludedFields>[]>
  ) => Promise<Snapshot<T, K, Meta, ExcludedFields>[]>;

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

  compareSnapshots: (snap1: Snapshot<T, K, Meta, ExcludedFields>, snap2: Snapshot<T, K, Meta, ExcludedFields>) => {
    snapshot1: Snapshot<T, K, Meta, ExcludedFields>;
    snapshot2: Snapshot<T, K, Meta, ExcludedFields>;
    differences: Record<string, { snapshot1: any; snapshot2: any }>;
    versionHistory: {
      snapshot1Version?: string | number | Version<T, K>  | null;
      snapshot2Version?: string | number | Version<T, K>;
    };
  } | null;

  compareSnapshotItems: (
    snap1: Snapshot<T, K, Meta, ExcludedFields>,
    snap2: Snapshot<T, K, Meta, ExcludedFields>,
    keys: (keyof Snapshot<T, K, Meta, ExcludedFields>)[]
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
    snapshot: Snapshot<T, K, Meta, ExcludedFields>,
    snapshotStore: SnapshotStore<T, K>,
    snapshots: Snapshots<T, K, Meta, ExcludedFields>,
  ) => Promise<{ snapshots: Snapshots<T, K, Meta, ExcludedFields>; }>;

  batchFetchSnapshots: (
    criteria: CriteriaType,
    snapshotData: (
      snapshotIds: string[],
      subscribers: SubscriberCollection<T, K>,
      snapshots: Snapshots<T, K, Meta, ExcludedFields>
    ) => Promise<{
      subscribers: SubscriberCollection<T, K>;
      snapshots: Snapshots<T, K, Meta, ExcludedFields>; // Include snapshots here for consistency
    }>
  ) => Promise<Snapshots<T, K, Meta, ExcludedFields>>;

  batchTakeSnapshotsRequest: (
    criteria: CriteriaType,
    snapshotData: (
      snapshotIds: string[],
      snapshots: Snapshots<T, K, Meta, ExcludedFields>,
      subscribers: Subscriber<T, K>[]
    ) => Promise<{
      subscribers: Subscriber<T, K>[]
    }>
  ) => Promise<void>;

  batchUpdateSnapshotsRequest: (
    snapshotData: (
      subscribers: SubscriberCollection<T, K>) => Promise<{
      subscribers: SubscriberCollection<T, K>;
      snapshots: Snapshots<T, K, Meta, ExcludedFields>
    }>,
    snapshotManager: SnapshotManager<T, K>
  ) => Promise<void>;

  getSnapshotItems: (
    // snapshotId: string,
    // callback: (snapshots: Snapshots<T, K, Meta, ExcludedFields>) => Subscriber<T, K> | null,
    // snapshot: Snapshot<T, K, Meta, ExcludedFields> | null
    category: Category | undefined,    snapshots: SnapshotsArray<T, K, Meta>,
    snapshotId?: string,            // Keep if you need to filter by specific ID
    callback?: (items: SnapshotItem<T, K>[]) => void, // Keep for async operations

  ) => (SnapshotStoreConfig<T, any> | SnapshotItem<T, K>)[] | undefined; // Adjust to specific type if known
 
  filterSnapshotsByStatus: (status: StatusType) => Snapshots<T, K, Meta, ExcludedFields>;
  filterSnapshotsByCategory: (category: Category) => Snapshots<T, K, Meta, ExcludedFields>;
  filterSnapshotsByTag: (tag: Tag<T, K>) => Snapshots<T, K, Meta, ExcludedFields>;
  batchFetchSnapshotsSuccess: (
    subscribers: SubscriberCollection<T, K>[],
    snapshots: Snapshots<T, K, Meta, ExcludedFields>
  ) => void;
  
  batchFetchSnapshotsFailure: (
    date: Date,
    snapshotManager: SnapshotManager<T, K>,
    snapshot: Snapshot<T, K, Meta, ExcludedFields>,
    payload: { error: Error; }
  ) => void;
  
  batchUpdateSnapshotsSuccess: (
    subscribers: SubscriberCollection<T, K>,
    snapshots: Snapshots<T, K, Meta, ExcludedFields>
  ) => void;
  
  batchUpdateSnapshotsFailure: (
    date: Date,
    snapshotId: string | number | null,
    snapshotManager: SnapshotManager<T, K>,
    snapshot: Snapshot<T, K, Meta, ExcludedFields>,
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
    metadata: UnifiedMetadata<T, K, Meta, ExcludedFields>,
    subscriberId: string, // Add subscriberId here
    endpointCategory: string | number, // Add endpointCategory here
    storeProps: SnapshotStoreProps<T, K>,
    snapshotConfigData: SnapshotConfig<T, K>,
    subscription: Subscription<T, K>,
    snapshotId?: string | number | null,
    snapshotStoreConfigData?: SnapshotStoreConfig<T, K>,
    snapshotContainer?: SnapshotStore<T, K> | Snapshot<T, K, Meta, ExcludedFields> | null,
  ) => Promise<{ snapshot: Snapshot<T, K, Meta, ExcludedFields>; }>,

  handleSnapshotSuccess: (
    message: string,
    snapshot: Snapshot<T, K, Meta, ExcludedFields> | null,
    snapshotId: string
  ) => void;

  handleSnapshotFailure: (error: Error, snapshotId: string) => void; // New method added
  getSnapshotId: (key: string | T, snapshot: Snapshot<T, K, Meta, ExcludedFields>) => string
  compareSnapshotState: (snapshot1: Snapshot<T, K, Meta, ExcludedFields> | null, snapshot2: Snapshot<T, K, Meta, ExcludedFields>) => boolean;


  getInitialState: () => Snapshot<T, K, Meta, ExcludedFields> | null;
  getConfigOption: (optionKey: string) => any;
  getTimestamp: () => Date | undefined;
  getStores: (
    storeId: number,
    snapshotId: string,
    snapshotStoreConfigs: SnapshotStoreConfig<T, K>[],
    snapshotStores?: SnapshotStoreReference<T, K>[] | Map<number, SnapshotStore<T, K, Meta>>
  ) => SnapshotMap
  
  
  getData: (id: number | string, snapshotStore: SnapshotStore<T, K>
  ) =>  BaseData<any> | Map<string, Snapshot<T, K, Meta, ExcludedFields>> | null | undefined
  getDataVersions: (id: number) => Promise<Snapshot<T, K, Meta, ExcludedFields>[] | undefined>
  updateDataVersions: (id: number, versions: Snapshot<T, K, Meta, ExcludedFields>[]) => void
  setData: (id: string, data: Map<string, Snapshot<T, K, Meta, ExcludedFields>>) => void;
  addData: (id: string, data: Partial<Snapshot<T, K, Meta, ExcludedFields>>) => void;
  removeData: (id: number) => void;
  updateData: (id: number, newData: Snapshot<T, K, Meta, ExcludedFields>) => void;
  stores: (storeProps: SnapshotStoreProps<T, K>) => SnapshotStore<T, K>[];

  getStore: (
    storeId: number,
    snapshotStore: SnapshotStore<T, K>,
    snapshotId: string | null,
    snapshot: Snapshot<T, K, Meta, ExcludedFields>,
    snapshotStoreConfig: SnapshotStoreConfig<T, K>,
    type: string,
    event: Event
  ) => SnapshotStore<T, K> | null; // Define an appropriate return type
  
  addStore: (
    storeId: number,
    snapshotId: string | null,
    snapshotStore: SnapshotStore<T, K>,
    snapshot: Snapshot<T, K, Meta, ExcludedFields>,
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
    snapshot: Snapshot<T, K, Meta, ExcludedFields>,
    type: string,
    event: Event,
    callback: (snapshot: Snapshot<T, K, Meta, ExcludedFields>) => void,
    mapFn: (item: T) => T,
    isAsync?: boolean // Flag to determine behavior
  ) => Promise<string | undefined> | Snapshot<T, K, Meta, ExcludedFields> | null 

  mapSnapshotWithDetails: (
    storeId: number,
    snapshotStore: SnapshotStore<T, K>,
    snapshotId: string,
    snapshot: Snapshot<T, K, Meta, ExcludedFields>,
    type: string,
    event: Event,
    callback: (snapshot: Snapshot<T, K, Meta, ExcludedFields>) => void,
    details: any
  ) => SnapshotWithData<T, K> | null;

  removeStore: (
    storeId: number,
    store: SnapshotStore<T, K>,
    snapshotId: string,
    snapshot: Snapshot<T, K, Meta, ExcludedFields>,
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
      callback: (snapshot: Snapshot<T, K, Meta, ExcludedFields>) => void
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
   ) => Snapshot<T, K, Meta, ExcludedFields>
  ) => Promise<{
    id: string; 
    category: Category; 
    categoryProperties: CategoryProperties | undefined; 
    timestamp: Date; 
    snapshot: Snapshot<T, K, Meta, ExcludedFields>;
    data: BaseDataEntity;
    delegate: SnapshotWithCriteria<T, K>[]; 
  }> 

  fetchSnapshotSuccess: (
    id: number,
    snapshotId: string,
    snapshotStore: SnapshotStore<T, K>,
    payload: FetchSnapshotPayload<T, K> | undefined,
    snapshot: Snapshot<T, K, Meta, ExcludedFields>,
    data: T,
    delegate: SnapshotWithCriteria<T, K>[],
    snapshotData: (
      snapshotManager: SnapshotManager<T, K>,
      subscribers: Subscriber<T, K>[],
      snapshot: Snapshot<T, K, Meta, ExcludedFields>
    ) => void,
  ) => SnapshotWithCriteria<T, K>[]

  updateSnapshotFailure: (
    snapshotId: string,
    snapshotManager: SnapshotManager<T, K>,
    snapshot: Snapshot<T, K, Meta, ExcludedFields>,
    date: Date | undefined,
    payload: { error: Error }
  ) => void

  fetchSnapshotFailure: (
    snapshotId: string,
    snapshotManager: SnapshotManager<T, K>,
    snapshot: Snapshot<T, K, Meta, ExcludedFields>,
    date: Date | undefined,
    payload: { error: Error }
  ) => void

  addSnapshotFailure: (
    date: Date, 
    snapshotId: string | number | null,
    snapshotManager: SnapshotManager<T, K>,
    snapshot: Snapshot<T, K, Meta, ExcludedFields>,
     payload: { error: Error; }
    ) => void;
  
  configureSnapshotStore: (
    snapshotStore: SnapshotStore<T, K>,
    storeId: number,
    snapshotId: string,
    data: Map<string, Snapshot<T, K, Meta, ExcludedFields>>,
    events: Record<string, CalendarManagerStoreClass<T, K>[]>,
    dataItems: RealtimeDataItem[],
    newData: Snapshot<T, K, Meta, ExcludedFields>,
    payload: ConfigureSnapshotStorePayload<T, K>,
    store: SnapshotStore<any, K>,
    callback: (snapshotStore: SnapshotStore<T, K>) => void,
    config: SnapshotStoreConfig<T, K>
  ) => void;
  
  updateSnapshotSuccess: (
    snapshotId: string,
    snapshotManager: SnapshotManager<T, K>,
    snapshot: Snapshot<T, K, Meta, ExcludedFields>,
    payload?: { data?: Error }
  ) => void;

  createSnapshotFailure: (
    date: Date,
    snapshotId: string | number | null,
    snapshotManager: SnapshotManager<T, K>,
    snapshot: Snapshot<T, K, Meta, ExcludedFields>,
    payload: { error: Error; }
  ) => void;

  createSnapshotSuccess: (
    snapshotId: string | number | null,
    snapshotManager: SnapshotManager<T, K>,
    snapshot: Snapshot<T, K, Meta, ExcludedFields>,
    payload?: { data?: any }
  ) => void;

  createSnapshots: (
    id: string,
    snapshotId: string | number | null,
    snapshots: Snapshot<T, K, Meta, ExcludedFields>[], // Use Snapshot<T, K, Meta, ExcludedFields>[] here
    snapshotManager: SnapshotManager<T, K>,
    payload: CreateSnapshotsPayload<T, K>,
    callback: (snapshots: Snapshot<T, K, Meta, ExcludedFields>[]) => void | null,
    snapshotDataConfig?: SnapshotConfig<T, K>[] | undefined,
    category?:  Category,
    categoryProperties?: string | CategoryProperties
  ) => Snapshot<T, K, Meta, ExcludedFields>[] | null;

  onSnapshot: (
    snapshotId: string,
    snapshot: Snapshot<T, K, Meta, ExcludedFields>,
    type: string,
    event: Event,
    callback: (snapshot: Snapshot<T, K, Meta, ExcludedFields>) => void
  ) => void;
  onSnapshots: (snapshotId: string,
    snapshots: Snapshots<T, K, Meta, ExcludedFields>,
    type: string,
    event: Event,
    callback: (snapshots: Snapshots<T, K, Meta, ExcludedFields>) => void
  ) => void;
  events: CombinedEvents<T, K> | undefined;
}

export type { SnapshotMethods };
