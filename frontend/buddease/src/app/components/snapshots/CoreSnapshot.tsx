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
import { SnapshotWithCriteria, TagsRecord } from "./SnapshotWithCriteria";
import { Callback } from "./subscribeToSnapshotsImplementation";
import { SnapshotEvents } from "./SnapshotEvents";
import { SnapshotOperation } from "./SnapshotActions";
import { CombinedEvents } from "../hooks/useSnapshotManager";
import { SnapshotStoreMethod } from "./SnapshotStoreMethod";
import { ContentItem } from "../cards/DummyCardLoader";
import { InitializedData, InitializedDataStore } from "../hooks/SnapshotStoreOptions";
import { SnapshotData } from ".";
import { SnapshotSubscriberManagement } from "./SnapshotSubscriberManagement";

interface CoreSnapshot<T extends Data, K extends Data> extends SnapshotSubscriberManagement<T, K>
{
  id: string | number | undefined
  config: SnapshotStoreConfig<T, K> | null;
  configs?: SnapshotStoreConfig<T, K>[] | null;
  data: InitializedData | null | undefined
  parentId?: string | null;
  children?: CoreSnapshot<K, T>[];
  operation?: SnapshotOperation
  description?: string | null;
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
  content?: string | Content<T, K>;
  contentItem?: string | ContentItem ;
  label: Label | undefined;
  message?: string;
  user?: User;
  type?: string | null | undefined;
  phases?: ProjectPhaseTypeEnum;
  phase?: Phase<T> | null;
  ownerId?: string;
  store?: SnapshotStore<T, K> | null;
  state?: SnapshotsArray<T> | null; // Ensure state matches Snapshot<T> or null/undefined
  dataStore?: InitializedDataStore
  snapshotId?: string | number;
  configOption?:
  | string
  | SnapshotConfig<T, K>
  | SnapshotStoreConfig<T, K>
  | null;
  snapshotItems?: SnapshotItem<T, K>[];
  snapshots?: Snapshots<T>;
  initialState?: InitializedState<T, K> | {}
  nestedStores?: SnapshotStore<T, K>[];
  events: CombinedEvents<T, K> | undefined;

  tags?: TagsRecord | string[] | undefined;  
  setSnapshotData?: (
    snapshotStore: SnapshotStore<T, K>,
    data: Map<string, Snapshot<T, K>>,
    subscribers: Subscriber<T, K>[],
    snapshotData: Partial<
    SnapshotStoreConfig<T, K>
    >,
    id?: string, 
  ) => void;
  event?: Event;
  snapshotConfig?:
    | SnapshotConfig<T, K>[]
    | undefined;
   
  

    snapshotStoreConfig?: SnapshotStoreConfig<T, any> | null;
    
    snapshotStoreConfigSearch?: SnapshotStoreConfig<
    SnapshotWithCriteria<any, BaseData>,
    K
    > | null;

  
  
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
    event: string | SnapshotEvents<T, K>,
    subscribers: SubscriberCollection<T, K>,
    snapshotContainer?: T,
    snapshotStoreConfig?: SnapshotStoreConfig<SnapshotUnion<BaseData>, T> | undefined,
   ) => void;

  handleSnapshot: (
    id: string,
    snapshotId: string | number,
    snapshot: T extends SnapshotData<T, K> ? Snapshot<T, K> : null,
    snapshotData: T,
    category: symbol | string | Category | undefined,
    categoryProperties: CategoryProperties | undefined,
    callback: (snapshot: T) => void,
    snapshots: SnapshotsArray<T>,
    type: string,
    event: Event,
    snapshotContainer?: T | undefined,
    snapshotStoreConfig?: SnapshotStoreConfig<T, K> | null | undefined,
    storeConfigs?: SnapshotStoreConfig<T, K>[]
  ) => Promise<Snapshot<T, K> | null>

  subscribe: (
    snapshotId: string | number,
    unsubscribe: UnsubscribeDetails,
    subscriber: Subscriber<T, K> | null,
    data: T,
    event: Event,
    callback: Callback<Snapshot<T, K>>,
    value: T,
  ) => [] | SnapshotsArray<T>;

    
  subscribeToSnapshots: (
    snapshotStore: SnapshotStore<T, K>,
    snapshotId: string,
    snapshotData: SnapshotStore<T, K>,
    category: Category | undefined,
    snapshotConfig: SnapshotStoreConfig<T, K>,
    callback: (snapshotStore: SnapshotStore<any, any>) => void,
    snapshots: SnapshotsArray<T>,
    unsubscribe?: UnsubscribeDetails, 
  ) => [] | SnapshotsArray<T>;
    
  getItem: (key: T) => Promise<Snapshot<T, K> | undefined>;
  meta: Map<string, Snapshot<T, K>> | {};
  snapshotMethods: SnapshotStoreMethod<T, K>
  getSnapshotsBySubscriber: (subscriber: string) => Promise<T[]>;

}

export type { CoreSnapshot };
