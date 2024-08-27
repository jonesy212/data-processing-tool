// CoreSnapshot.ts
import { Task } from "react-native";
import { CategoryProperties } from "../../../app/pages/personas/ScenarioBuilder";
import { Category } from "../libraries/categories/generateCategoryProperties";
import { Content } from "../models/content/AddContent";
import { BaseData, Data } from "../models/data/Data";
import { ProjectPhaseTypeEnum, StatusType } from "../models/data/StatusType";
import { RealtimeDataItem } from "../models/realtime/RealtimeData";
import { DataStore, InitializedState } from "../projects/DataAnalysisPhase/DataProcessing/DataStore";
import CalendarManagerStoreClass from "../state/stores/CalendarEvent";
import { Subscriber } from "../users/Subscriber";
import {
  Snapshot,
  Snapshots,
  SnapshotsArray,
  SnapshotUnion,
  UpdateSnapshotPayload,
} from "./LocalStorageSnapshotStore";
import SnapshotStore, { SubscriberCollection } from "./SnapshotStore";
import { SnapshotStoreConfig } from "./SnapshotStoreConfig";
import { Phase } from "../phases/Phase";
import { Label } from "../projects/branding/BrandingSettings";
import { User } from "../users/User";
import { SnapshotItem } from "./SnapshotList";
import { SnapshotWithCriteria } from "./SnapshotWithCriteria";
import { SnapshotConfig } from "./snapshot";

interface CoreSnapshot<T extends Data, K extends Data> {
  id?: string | number;
  data: T | Map<string, Snapshot<T, K>> | null | undefined;
  name?: string;
  timestamp: string | number | Date | undefined;
  orders?: any;
  createdBy?: string;
  eventRecords?: Record<string, CalendarManagerStoreClass<T, K>[]> | null;
  subscriberId?: string;
  length?: number;
  task?: Task;
  category?: Category;
  categoryProperties?: CategoryProperties | undefined;
  date?: string | number | string | number | Date | null;
  status?: StatusType | undefined;
  content?: string | Content<T> | undefined;
  label: Label | undefined;
  message?: string;
  user?: User;
  type?: string | null | undefined;
  phases?: ProjectPhaseTypeEnum;
  phase?: Phase | null;
  ownerId?: string;
  store?: SnapshotStore<T, K> | null;
  state?: Snapshot<T, K>[] | null; // Ensure state matches Snapshot<T> or null/undefined
  dataStore?: DataStore<T, K> | null;
  snapshotId?: string | number;
  configOption?:
    | string
    | SnapshotStoreConfig<T, K>
    | null;
  snapshotItems?: SnapshotItem<T, K>[];
  snapshots?: Snapshots<T>;
  initialState?: InitializedState<T, K>
  nestedStores?: SnapshotStore<T, K>[];
  events:
    | {
        eventRecords: Record<string, CalendarManagerStoreClass<T, K>[]> | null;
        callbacks: Record<string, Array<(snapshot: Snapshot<T, K>) => void>>;
        subscribers: SubscriberCollection<T, K>; // Ensure this is correct
        eventIds: string[];
        initialConfig: SnapshotConfig<T, K>,
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

  setSnapshotData?: (
    snapshotStore: SnapshotStore<T, K>,
    data: Map<string, Snapshot<T, K>>,
    subscribers: Subscriber<T, K>[],
    snapshotData: Partial<
      SnapshotStoreConfig<T, K>
    >
  ) => void;
  event?: Event;
  snapshotConfig?:
    | SnapshotConfig<T, K>[]
    | undefined;
    snapshotStoreConfig?: SnapshotStoreConfig<T, any> | null;
  set?: (
    data: T | Map<string, Snapshot<T, K>>,
    type: string,
    event: Event
  ) => void;
  
  setStore?: (
    data: T | Map<string, SnapshotStore<T, K>>,
    type: string,
    event: Event
  ) => void | null;

  restoreSnapshot: (
    snapshot: Snapshot<T, K>,
    snapshotData: T,
    category: Category | undefined,
    callback: (snapshot: T) => void,
    snapshots: SnapshotsArray<T>,
    type: string,
    event: Event,
    snapshotContainer?: T,
    snapshotStoreConfig?: SnapshotStoreConfig<T, K>
  ) => void;

  handleSnapshot: (
    id: string,
    snapshotId: number,
    snapshot: T | null,
    snapshotData: T,
    category: Category | undefined,
    categoryProperties: CategoryProperties,
    callback: (snapshot: T) => void,
    snapshots: SnapshotsArray<T>,
    type: string,
    event: Event,
    snapshotContainer?: T,
    snapshotStoreConfig?: SnapshotStoreConfig<T, any> | null,
  ) => Promise<Snapshot<T, K> | null>;

  subscribeToSnapshots: (
    snapshotId: string,
    callback: (snapshots: Snapshots<T>) => Subscriber<T, K> | null
  ) => [] | SnapshotsArray<T>;
  getItem: (key: T) => Promise<Snapshot<T, K> | undefined>;
  meta: Map<string, Snapshot<T, K>> | {};
}

export type { CoreSnapshot };
