// CoreSnapshot.ts
import { Task } from "react-native";
import { CategoryProperties } from "../../../app/pages/personas/ScenarioBuilder";
import { UnsubscribeDetails } from "../event/DynamicEventHandlerExample";
import { Category } from "../libraries/categories/generateCategoryProperties";
import { Content } from "../models/content/AddContent";
import { BaseData, Data } from "../models/data/Data";
import { ProjectPhaseTypeEnum, StatusType } from "../models/data/StatusType";

import { Phase } from "../phases/Phase";
import { Label } from "../projects/branding/BrandingSettings";
import { DataStore, InitializedState } from "../projects/DataAnalysisPhase/DataProcessing/DataStore";
import CalendarManagerStoreClass from "../state/stores/CalendarEvent";
import { Subscriber } from "../users/Subscriber";
import { User } from "../users/User";
import {
  Snapshot,
  Snapshots,
  SnapshotsArray,
  SnapshotUnion,
  UpdateSnapshotPayload
} from "./LocalStorageSnapshotStore";
import { SnapshotConfig } from "./SnapshotConfig";
import { SnapshotItem } from "./SnapshotList";
import SnapshotStore, { SubscriberCollection } from "./SnapshotStore";
import { SnapshotStoreConfig } from "./SnapshotStoreConfig";
import { SnapshotWithCriteria } from "./SnapshotWithCriteria";
import { Callback } from "./subscribeToSnapshotsImplementation";
import { SnapshotEvents } from "./SnapshotEvents";
import { SnapshotOperation } from "./SnapshotActions";

interface CoreSnapshot<T extends Data, K extends Data> {
  id: string | number | undefined
  config: SnapshotStoreConfig<T, K> | null;
  configs?: SnapshotStoreConfig<T, K>[] | null;
  data: T | Map<string, Snapshot<T, K>> | null | undefined;
  parentId?: string | null;
  children?: CoreSnapshot<K, T>[];
  operation?: SnapshotOperation
  name?: string;
  timestamp: string | number | Date | undefined;
  orders?: any;
  createdBy?: string;
  eventRecords?: Record<string, CalendarManagerStoreClass<T, K>[]> | null;
  subscriberId?: string;
  length?: number;
  task?: Task;
  category?: symbol | string | Category | undefined;
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
  state?: SnapshotsArray<T> | null; // Ensure state matches Snapshot<T> or null/undefined
  dataStore?: DataStore<T, K> | null;
  snapshotId?: string | number;
  configOption?:
  | string
  | SnapshotConfig<T, K>
  | SnapshotStoreConfig<T, K>
  | null;
  snapshotItems?: SnapshotItem<T, K>[];
  snapshots?: Snapshots<T>;
  initialState?: InitializedState<T, K>
  nestedStores?: SnapshotStore<T, K>[];
  events: SnapshotEvents<T, K> | undefined;

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
    id: string,
    snapshot: Snapshot<T, K>,
    snapshotId: string,
    snapshotData: Snapshot<T, K>,
    category: Category | undefined,
    callback: (snapshot: T) => void,
    snapshots: SnapshotsArray<T>,
    type: string,
    event: Event,
    snapshotContainer?: T,
    snapshotStoreConfig?: SnapshotStoreConfig<SnapshotUnion<BaseData>, T> | undefined
  ) => void;

  handleSnapshot: (
    id: string,
    snapshotId: string,
    snapshot: T | null, // Update the type here
    snapshotData: T,
    category: Category | undefined,
    categoryProperties: CategoryProperties | undefined,
    callback: (snapshot: T) => void,
    snapshots: SnapshotsArray<T>,
    type: string,
    event: Event,
    snapshotContainer?: T,
    snapshotStoreConfig?: SnapshotStoreConfig<T, any> | null,
  ) => Promise<Snapshot<T, K> | null>;

  subscribe: (
    snapshotId: string,
    unsubscribe: UnsubscribeDetails,
    subscriber: Subscriber<T, K> | null,
    data: T,
    event: Event,
    callback: Callback<Snapshot<T, K>>,
    value: T,
  ) => [] | SnapshotsArray<T>;

  subscribeToSnapshots: (
    snapshotId: string,
    unsubscribe: UnsubscribeDetails, 
    callback: (snapshots: Snapshots<T>) => Subscriber<T, K> | null
  ) => [] | SnapshotsArray<T>;
  getItem: (key: T) => Promise<Snapshot<T, K> | undefined>;
  meta: Map<string, Snapshot<T, K>> | {};
}

export type { CoreSnapshot };
