import { Callback, ConfigureSnapshotStorePayload, SnapshotData } from '@/app/components/snapshots';

import { SubscriberCollection, SnapshotWithCriteria } from ".";
import { Category } from "../libraries/categories/generateCategoryProperties";
import { BaseData, Data, DataDetails } from "../models/data/Data";
import { NotificationPosition } from "../models/data/StatusType";
import { RealtimeDataItem } from "../models/realtime/RealtimeData";
import CalendarManagerStoreClass from "../state/stores/CalendarEvent";
import { NotificationType, NotificationTypeEnum } from "../support/NotificationContext";
import { Subscriber } from "../users/Subscriber";
import { SnapshotUnion, Snapshots, Snapshot, UpdateSnapshotPayload } from "./LocalStorageSnapshotStore";
import { SnapshotConfig } from "./snapshot";
import SnapshotStore from "./SnapshotStore";
import { SnapshotStoreConfig } from "./SnapshotStoreConfig";
import { CategoryProperties } from '@/app/pages/personas/ScenarioBuilder';
import { DataStore } from '../projects/DataAnalysisPhase/DataProcessing/DataStore';
import FetchSnapshotPayload from './FetchSnapshotPayload';
import { SnapshotManager } from '../hooks/useSnapshotManager';
import { CreateSnapshotsPayload } from '../database/Payload';

// SnapshotMethods.ts
interface SnapshotMethods<T extends Data, K extends Data>
{
  isCore: boolean
  notify: (id: string, message: string, content: any, date: Date, type: NotificationType, notificationPosition?: NotificationPosition) => void;
  notifySubscribers: (subscribers: Subscriber<T, K>[], data: Partial<SnapshotStoreConfig<T, any>>) => Subscriber<T, K>[];
  getSnapshots: (category: string, data: Snapshots<T>) => void;
  getAllSnapshots: (
    snapshotId: string,
    snapshotData: T,
    timestamp: string,
    type: string,
    event: Event,
    id: number,
    snapshotStore: SnapshotStore<T, K>,
    category: string | Category | undefined,
    categoryProperties: CategoryProperties | undefined,
    dataStoreMethods: DataStore<T, K>,
    data: T,
    dataCallback?: (
      subscribers: Subscriber<T, K>[],
      snapshots: Snapshots<T>
    ) => Promise<Snapshots<T>>
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
  compareSnapshots: (snapshotId1: string, snapshotId2: string) => {
    snapshot1: Snapshot<T, K>;
    snapshot2: Snapshot<T, K>;
    differences: Record<string, { snapshot1: any; snapshot2: any }>;
    versionHistory: {
      snapshot1Version: number;
      snapshot2Version: number;
    };
  } | null;
   
  compareSnapshotItems: (snapshotId1: string, snapshotId2: string, keys: string[]) => {
    itemDifferences: Record<string, {
      snapshot1: any;
      snapshot2: any;
      differences: {
        [key: string]: { value1: any; value2: any };
      };
    }>;
  } | null;

  batchFetchSnapshots: () => Promise<Snapshot<T, K>[]>;
  batchTakeSnapshotsRequest: (snapshotIds: string[]) => Promise<void>;
  batchUpdateSnapshotsRequest: (snapshots: Snapshot<T, K>[]) => Promise<void>;
  filterSnapshotsByStatus: (status: string) => Snapshot<T, K>[];
  filterSnapshotsByCategory: (category: string) => Snapshot<T, K>[];
  filterSnapshotsByTag: (tag: string) => Snapshot<T, K>[];
  batchFetchSnapshotsSuccess: (snapshots: Snapshot<T, K>[]) => void;
  batchFetchSnapshotsFailure: (error: Error) => void;
  batchUpdateSnapshotsSuccess: (snapshots: Snapshot<T, K>[]) => void;
  batchUpdateSnapshotsFailure: (error: Error) => void;
  batchTakeSnapshot: (snapshotId: string) => Promise<Snapshot<T, K>>;
  handleSnapshotSuccess: (snapshot: Snapshot<T, K>) => void;
  getSnapshotId: (key: string | SnapshotData<T, K> | SnapshotData<T, K>) => unknown;
  compareSnapshotState: (snapshot1: Snapshot<T, K>, snapshot2: Snapshot<T, K>, state: any) => boolean;

  dataItems: null | T[];
  newData: null | T;
  getInitialState: () => T;
  getConfigOption: (optionKey: string) => any;
  getTimestamp: () => Date;
  getStores: () => any[]; // Define an appropriate type if possible
  getData: () => T;
  setData: (data: Snapshot<T, K>) => void;
  addData: (data: Partial<Snapshot<T, K>>) => void;
  stores: null | any[]; // Define an appropriate type if possible
  getStore: ( storeId: number,
    snapshotStore: SnapshotStore<T, K>,
    snapshotId: string,
    snapshot: Snapshot<T, K>,
    type: string,
    event: Event) => any; // Define an appropriate return type
  addStore: (storeId: number,
    snapshotStore: SnapshotStore<T, K>,
    snapshotId: string,
    snapshot: Snapshot<T, K>,
    type: string,
    event: Event
  ) => void;
  mapSnapshot: (
    storeId: number,
    snapshotStore: SnapshotStore<T, K>,
    snapshotId: string,
    snapshot: Snapshot<T, K>,
    type: string,
    event: Event,
    callback: (snapshot: Snapshot<T, K>) => void
  ) => Snapshot<T, K> | null;
  removeStore: (storeId: number,
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
  }
) => void;
  fetchSnapshot: ( 
    callback: (
      snapshotId: string,
      payload: FetchSnapshotPayload<K> | undefined,
      snapshotStore: SnapshotStore<T, K>,
      payloadData: T | Data,
      category: Category | undefined,
      categoryProperties: CategoryProperties,
      timestamp: Date,
      data: T,
      delegate: SnapshotWithCriteria<T, K>[]
    ) => Snapshot<T, K>
) => Promise<Snapshot<T, K> | undefined>;
  addSnapshotFailure: (date: Date, snapshotManager: SnapshotManager<T, K>, snapshot: Snapshot<T, K>, payload: { error: Error; }) => void;
  configureSnapshotStore: (
    snapshotStore: SnapshotStore<T, K>,
    snapshotId: string,
    data: Map<string, Snapshot<T, K>>,
    events: Record<string, CalendarManagerStoreClass<T, K>[]>,
    dataItems: RealtimeDataItem[],
    newData: Snapshot<T, K>,
    payload: ConfigureSnapshotStorePayload<T>,
    store: SnapshotStore<any, K>,
    callback: (snapshotStore: SnapshotStore<T, K>) => void,
    config: SnapshotStoreConfig<T, K>
  ) => void;
  updateSnapshotSuccess: (
    snapshotId: string,
    snapshotManager: SnapshotManager<T, K>,
    snapshot: Snapshot<T, K>,
    payload?: { data?: any } ) => void;
  createSnapshotFailure: (
    snapshotId: string,
    snapshotManager: SnapshotManager<T, K>,
    snapshot: Snapshot<T, K>,
    payload: { error: Error }) => void;
  createSnapshotSuccess: (
    snapshotId: string,
          snapshotManager: SnapshotManager<T, K>,
          snapshot: Snapshot<T, K>,
          payload?: { data?: any } 
  ) => void;
  createSnapshots: (id: string,
    snapshotId: string,
    snapshot: Snapshot<T, K>,
    snapshotManager: SnapshotManager<T, K>,
    payload: CreateSnapshotsPayload<T, K>,
    callback: (snapshots: Snapshot<T, K>[]) => void | null,
    snapshotDataConfig?: SnapshotConfig<T, K>[] | undefined,
    category?: string | CategoryProperties
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
  events:
  | {
        initialConfig: SnapshotConfig<T, K>,
        eventRecords: Record<string, CalendarManagerStoreClass<T, K>[]> | null;
        callbacks: Record<string, Array<(snapshot: Snapshot<T, K>) => void>>;
        subscribers: SubscriberCollection<T, K>; // Ensure this is correct
        eventIds: string[];
        onInitialize: () => void
        onSnapshotAdded: (
          event: string,
          snapshot: Snapshot<T, K>,
          snapshotId: string,
          subscribers: SubscriberCollection<T, K>,
          snapshotStore: SnapshotStore<T, K>, 
          dataItems: RealtimeDataItem[],
          subscriberId: string,
          criteria: SnapshotWithCriteria<T, K>,
          category: Category
        ) => void;
        onSnapshotRemoved: (
          event: string,
          snapshot: Snapshot<T, K>,
          snapshotId: string, 
          subscribers: SubscriberCollection<T, K>,
          snapshotStore: SnapshotStore<T, K>, 
          dataItems: RealtimeDataItem[],
          criteria: SnapshotWithCriteria<T, K>,
          category: Category
        ) => void;

        removeSubscriber: (
          event: string,
          snapshotId: string,
          snapshot: Snapshot<T, K>,
          snapshotStore: SnapshotStore<T, K>,
          dataItems: RealtimeDataItem[],
          criteria: SnapshotWithCriteria<T, K>,
          category: Category
        ) => void
        onError: (
          event: string,
          error: Error,
          snapshot: Snapshot<T, K>,
          snapshotId: string,
          snapshotStore: SnapshotStore<T, K>,
          dataItems: RealtimeDataItem[],
          criteria: SnapshotWithCriteria<T, K>,
          category: Category
        ) => void;
        onSnapshotUpdated: (
          event: string,
          snapshotId: string,
          snapshot: Snapshot<T, K>,
          data: Map<string, Snapshot<T, K>>,
          events: Record<string, CalendarManagerStoreClass<T, K>[]>,
          snapshotStore: SnapshotStore<T, K>,
          dataItems: RealtimeDataItem[],
          newData: Snapshot<T, K>,
          payload: UpdateSnapshotPayload<T>,
          store: SnapshotStore<any, K>
        ) => void;
        on: (
          event: string,
          callback: (snapshot: Snapshot<T, K>) => void
        ) => void;
        off: (
          event: string,
          callback: (snapshot: Snapshot<T, K>) => void
        ) => void;
        emit: (
          event: string,
          snapshot: Snapshot<T, K>,
          snapshotId: string, 
          subscribers: SubscriberCollection<T, K>,
          snapshotStore: SnapshotStore<T, K>, 
          dataItems: RealtimeDataItem[],
          criteria: SnapshotWithCriteria<T, K>,
          category: Category
        ) => void;
        once: (
          event: string,
          callback: (snapshot: Snapshot<T, K>) => void
        ) => void;
        addRecord: (
          event: string,
          record: CalendarManagerStoreClass<T, K>,
          callback: (snapshot: CalendarManagerStoreClass<T, K>) => void
        ) => void;
        removeAllListeners: (event?: string) => void;
        subscribe: (
          event: string,
          callback: (snapshot: Snapshot<T, K>) => void
        ) => void;
        unsubscribe: (
          event: string,
          callback: (snapshot: Snapshot<T, K>) => void
        ) => void;
        trigger: (
          event: string, 
          snapshot: Snapshot<T, K>, 
          snapshotId: string,
          subscribers: SubscriberCollection<T, K>
        ) => void;
        eventsDetails?: CalendarManagerStoreClass<T, K>[] | undefined;
      }
    | undefined;
}

export type {SnapshotMethods}