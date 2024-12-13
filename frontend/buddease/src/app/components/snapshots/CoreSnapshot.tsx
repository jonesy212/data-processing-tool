// CoreSnapshot.ts
import { Task } from '@/app/components/models/tasks/Task';
import CalendarManagerStoreClass from "@/app/components/state/stores/CalendarManagerStore";
import { UnifiedMetaDataOptions } from '@/app/configs/database/MetaDataOptions';
import { StructuredMetadata } from '@/app/configs/StructuredMetadata';
import { Message } from '@/app/generators/GenerateChatInterfaces';
import { SnapshotData } from ".";
import { Attachment } from '@/app/components/documents/Attachment/attachment'
import { CategoryProperties } from "../../../app/pages/personas/ScenarioBuilder";
import { ChatRoom } from '../calendar/CalendarSlice';
import { ContentItem } from "../cards/DummyCardLoader";
import { Sender } from '../communications/chat/Communication';
import { CombinedEvents } from "../hooks/useSnapshotManager";
import { Category } from "../libraries/categories/generateCategoryProperties";
import { Content } from "../models/content/AddContent";
import { BaseData } from "../models/data/Data";
import { ProjectPhaseTypeEnum, StatusType } from "../models/data/StatusType";
import { Phase } from "../phases/Phase";
import { Label } from "../projects/branding/BrandingSettings";
import { InitializedState } from "../projects/DataAnalysisPhase/DataProcessing/DataStore";
import { NotificationType } from '../support/NotificationContext';
import { AllTypes } from "../typings/PropTypes";
import { Subscriber } from "../users/Subscriber";
import { SubscriberCollection } from '../users/SubscriberCollection';
import { User } from "../users/User";
import {
  Snapshot,
  Snapshots,
  SnapshotsArray
} from "./LocalStorageSnapshotStore";
import { SnapshotOperation } from "./SnapshotActions";
import { SnapshotConfig } from "./SnapshotConfig";
import {
  SnapshotRelationships,
} from "./SnapshotData";
import { SnapshotEvents } from "./SnapshotEvents";
import { SnapshotItem } from "./SnapshotList";
import SnapshotStore from "./SnapshotStore";
import { SnapshotStoreConfig } from "./SnapshotStoreConfig";
import { SnapshotStoreMethod } from "./SnapshotStoreMethod";
import { InitializedData, InitializedDataStore } from "./SnapshotStoreOptions";
import { SnapshotSubscriberManagement } from "./SnapshotSubscriberManagement";
import { SnapshotWithCriteria, TagsRecord } from "./SnapshotWithCriteria";

interface CoreSnapshot<
  T extends BaseData<any> = BaseData<any, any>,
  K extends T = T,
  Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>,
  ExcludedFields extends keyof T = never
> extends SnapshotSubscriberManagement<T, K>,
  SnapshotRelationships<T, K>
{
  metadata?: UnifiedMetaDataOptions<T, K>;
  id: string | number | undefined
  config: Promise<SnapshotStoreConfig<T, K> | null>;
  configs?: SnapshotStoreConfig<T, K>[] | null;
  data: InitializedData<T> | null | undefined
  parentId?: string | null;
  operation?: SnapshotOperation<T, K>
  description?: string | null;
  name?: string;
  isCore?: boolean;
  currentCategory: Category;
  timestamp: string | number | Date | undefined;
  orders?: any;
  createdBy: string;
  eventRecords?: Record<string, CalendarManagerStoreClass<T, K>[]> | null;
  subscriberId?: string;
  length?: number;
  task?: Task<T>;
  category?: symbol | string | Category | undefined;
  categoryProperties?: CategoryProperties | undefined;
  date?: string | number | string | number | Date | null;
  status?: StatusType | undefined;
  content?: string | Content<T, K>;
  contentItem?: string | ContentItem ;
  label: Label | undefined;
  excludedFields?: ExcludedFields;
  message?: (
    type: NotificationType,
    content: string,
    additionalData?: string,
    userId?: number,
    sender?: Sender,
    channel?: ChatRoom
  ) => Message;
  user?: User;
  type?: AllTypes;
  phases?: ProjectPhaseTypeEnum;
  phase?: Phase<BaseData<any, any, StructuredMetadata<any, any>, Attachment>, BaseData<any, any, StructuredMetadata<any, any>, Attachment>> | null;
  ownerId?: string;
  store?: SnapshotStore<T, K> | null;
  state?: SnapshotsArray<T, K> | null; // Ensure state matches Snapshot<T> or null/undefined
  dataStore?: InitializedDataStore<T>
  snapshotId?: string | number | null;
  configOption?:
  | string
  | SnapshotConfig<T, K>
  | SnapshotStoreConfig<T, K>
  | null;
  snapshotItems?: SnapshotItem<T, K>[];
  snapshots?: Snapshots<T, K>;
  initialState?: InitializedState<T, K> | {}
  nestedStores?: SnapshotStore<T, K>[];
  events: CombinedEvents<T, K> | undefined;
  tags?: TagsRecord<T, K> | string[] | undefined;  
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
    SnapshotWithCriteria<any, BaseData>> | null;

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
    snapshotData: SnapshotData<T, K>,
    savedState: SnapshotStore<T, K>,
    category: symbol | string | Category | undefined,
    callback: (snapshot: T) => void,
    snapshots: SnapshotsArray<T, K>,
    type: string,
    event: string | SnapshotEvents<T, K>,
    subscribers: SubscriberCollection<T, K>,
    snapshotContainer?: T,
    snapshotStoreConfig?: SnapshotStoreConfig<T, K, StructuredMetadata<T, K>, never>  | undefined,
   ) => void;

  handleSnapshot: (
    id: string,
    snapshotId: string | number | null,
    snapshot: T extends SnapshotData<T, K> ? Snapshot<T, K, Meta> : null,
    snapshotData: T,
    category: symbol | string | Category | undefined,
    categoryProperties: CategoryProperties | undefined,
    callback: (snapshot: T) => void,
    snapshots: SnapshotsArray<T, K>,
    type: string,
    event: SnapshotEvents<T, K>,
    snapshotContainer?: T | undefined,
    snapshotStoreConfig?: SnapshotStoreConfig<T, K, StructuredMetadata<T, K>, never>  | null | undefined,
    storeConfigs?: SnapshotStoreConfig<T, K>[]
  ) => Promise<Snapshot<T, K> | null>

  getItem: (key: T) => Promise<Snapshot<T, K> | undefined>;
  meta?: StructuredMetadata<T, K>;
  mappedSnapshot: Map<string, Snapshot<T, K, StructuredMetadata<T, K>>> | {};
  snapshotMethods: SnapshotStoreMethod<T, K>[]
  getSnapshotsBySubscriber: (subscriber: string) => Promise<T[]>;
}

export type { CoreSnapshot };
