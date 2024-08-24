import { SnapshotData } from '@/app/components/snapshots';

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

// SnapshotMethods.ts
interface SnapshotMethods<T extends Data, K extends Data>
{
  parentId: string | null;
  notify: (id: string, message: string, content: any, date: Date, type: NotificationType, notificationPosition?: NotificationPosition) => void;
  notifySubscribers: (subscribers: Subscriber<T, K>[], data: Partial<SnapshotStoreConfig<SnapshotUnion<T>, any>>) => Subscriber<T, K>[];
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
  ) => Promise<SnapshotUnion<T>[]>;
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
  getSnapshotId: (key: string | SnapshotData<T, K>) => unknown;
  compareSnapshotState: (snapshot1: Snapshot<T, K>, snapshot2: Snapshot<T, K>) => boolean;
  // Newly added methods
  getParentId: () => string | null;
  getChildIds: () => string[];
  addChild: (childId: string) => void;
  removeChild: (childId: string) => void;
  getChildren: () => Snapshot<T, K>[];
  hasChildren: () => boolean;
  isDescendantOf: (parentId: string) => boolean;
  dataItems: null | T[];
  newData: null | T;
  getInitialState: () => T;
  getConfigOption: (optionKey: string) => any;
  getTimestamp: () => Date;
  getStores: () => any[]; // Define an appropriate type if possible
  getData: () => T;
  setData: (data: T) => void;
  addData: (data: Partial<T>) => void;
  stores: null | any[]; // Define an appropriate type if possible
  getStore: (storeId: string) => any; // Define an appropriate return type
  addStore: (store: any) => void;
  mapSnapshot: (callback: (snapshot: Snapshot<T, K>) => void) => void;
  removeStore: (storeId: string) => void;
  unsubscribe: () => void;
  fetchSnapshot: (snapshotId: string) => Promise<Snapshot<T, K>>;
  addSnapshotFailure: (error: Error) => void;
  configureSnapshotStore: (config: SnapshotStoreConfig<SnapshotUnion<T>, K>) => void;
  updateSnapshotSuccess: (snapshot: Snapshot<T, K>) => void;
  createSnapshotFailure: (error: Error) => void;
  createSnapshotSuccess: (snapshot: Snapshot<T, K>) => void;
  createSnapshots: (snapshots: Snapshot<T, K>[]) => void;
  onSnapshot: (snapshotId: string, callback: (snapshot: Snapshot<T, K>) => void) => void;
  onSnapshots: (callback: (snapshots: Snapshot<T, K>[]) => void) => void;
  events:
    | {
        eventRecords: Record<string, CalendarManagerStoreClass<T, K>[]> | null;
        callbacks: Record<string, Array<(snapshot: Snapshot<T, K>) => void>>;
        subscribers: SubscriberCollection<T, K>; // Ensure this is correct
        eventIds: string[];
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

        initialConfig: SnapshotConfig<T, K>,
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
        onInitialize: () => void
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