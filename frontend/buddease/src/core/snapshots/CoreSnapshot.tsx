// CoreSnapshot.tsx

import type { SnapshotManager } from "@/app/hooks/useSnapshotManager"
import type { ContentItem } from "@/core/cards/DummyCardLoader";
import type { ChatRoom } from '@/core/communications/ChatRoom';
import type { Sender } from '@/core/components/communications/CommunicationPage';
import type { Task } from '@/core/components/models/tasks/Task';
import type { UnifiedMetadata } from "@/core/config/MetaDataOptions";
import type { StructuredMetadata } from '@/core/config/StructuredMetadata';
import type { NotificationType } from '@/core/features/support/UnifiedNotificationTypes';
import type { Message } from '@/core/generators/GenerateChatInterfaces';
import type { CombinedEvents } from '@/core/hooks/useSnapshotManager';
import type { Category } from "@/core/libraries/categories/generateCategoryProperties";
import type { Content } from "@/core/models/content/AddContent";
import type { Data } from '@/core/models/data/Data';
import type { CategoryProperties } from "@/core/pages/personas/ScenarioBuilder";
import type { SnapshotBase } from "@/core/snapshots/SnapshotContainer";
import type { SnapshotData } from "@/core/snapshots/SnapshotData";
import type { SnapshotIdentity } from '@/core/snapshots/SnapshotIdentity';
import type { InitializedState } from '@/core/state/stores/DataStore';
import type { PhaseDefault } from '@/core/typings/phaseTypes';
import type { RealtimeDataItem } from '@/core/typings/realtimeTypes';

import type { Label } from "@/core/branding/BrandingSettings";
import type { BaseDataEntity, BaseEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import type { Attachment } from '@/core/documents/attachment/Attachment';
import type { SharedIdentifiers } from '@/core/documents/RelatedProps';
import type { UpdateSnapshotPayload } from '@/core/interfaces/payload/payloadTypes';
import type { SharedTimestamps } from '@/core/models/CommonData';
import type { ProjectPhaseTypeEnum, StatusType } from "@/core/models/data/StatusType";
import type { TagsRecord } from '@/core/models/tracker/Tag';
import type { SnapshotOperation } from "@/core/snapshots/index";
import type { 
    Snapshots,
    SnapshotEquality,
    Snapshots,
    SnapshotsArray
} from '@/core/snapshots/LocalStorageSnapshotStore';
import type { Snapshot } from '@/core/snapshots/Snapshot';
import type { SnapshotConfig } from "@/core/snapshots/SnapshotConfig";
import type { SnapshotItem } from "@/core/snapshots/SnapshotList";
import type { SnapshotMethods } from "@/core/snapshots/SnapshotMethods";
import type { SnapshotOperations } from '@/core/snapshots/snapshotOperations';
import type { SnapshotStoreConfig } from "@/core/snapshots/SnapshotStoreConfig";
import type { SnapshotStoreMethods } from "@/core/snapshots/SnapshotStoreMethods";
import type { InitializedDataStore } from "@/core/snapshots/SnapshotStoreOptions";
import type { SnapshotCRUD } from "@/core/snapshots/SnapshotSubscriberManagement";
import type { SnapshotWithCriteria } from "@/core/snapshots/SnapshotWithCriteria";
import CalendarManagerStoreClass from '@/core/state/stores/CalendarManagerStore';
import { Subscriber } from "@/core/subscribers/Subscriber";
import type { SubscriberCollection } from '@/core/subscribers/SubscriberCollection';
import type { AllTypes } from "@/core/typings/PropTypes";
import type { SnapshotEvents } from '@/core/typings/snapshotTypes';
import type { User } from "@/core/users/User";
import { default as SnapshotStore } from "./SnapshotStore";

interface CoreSnapshot<
  T extends BaseDataEntity = BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> extends Partial<SharedIdentifiers<T, K>>,
          Partial<SnapshotMethods<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
          Partial<SnapshotCRUD<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
          Partial<SnapshotEquality<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
          Partial<SnapshotBase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
          Partial<SharedTimestamps>
{
  initialState?: InitializedState<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | {};
  identity?: SnapshotIdentity<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  base?: BaseEntity<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  operations?: SnapshotOperations<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  methods?: Array<{ name: string; execute: (...args: any[]) => any; description?: string }>;
  processEvent?: (data: any, type: string, event: Event) => void;
  childSnapshotsMap?: Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>;
  childSnapshots?: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
  parentSnapshotId?: string;
  metadata?: UnifiedMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  attachments?: AttachmentType;
  config: Promise<SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null>;
  configs?: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] | null;
  parentId?: string | null;
  operation?: SnapshotOperation<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  description?: string | null;
  name?: string;
  isCore?: boolean;
  isInitialized?: boolean;
  excluded?: ExcludedFields; 
  initializedAt?: Date;
  currentCategory: Category;
  timestamp?: string | number | Date;
  orders?: any;
  createdBy?: string;
  subscriberId?: string;
  currentSnapshot?: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  length?: number;
  task?: Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  category?: Category;
  categoryProperties?: CategoryProperties;
  date?: string | number | Date | null;
  status?: StatusType;
  content?: string | Content<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  contentItem?: string | ContentItem;
  label?: Label | string | Record<string, string> | null;
  excludedFields?: ExcludedFields;
  message?: (
    type: NotificationType, 
    content: string, 
    additionalData?: string, 
    userId?: number,
     sender?: Sender<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    channel?: ChatRoom
  ) => Message<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  user?: User<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  type?: string | AllTypes;
  phases?: ProjectPhaseTypeEnum;
  phase?: PhaseDefault | null;
  ownerId?: string;
  store?: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null;
  state?: SnapshotsArray<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null;
  dataStore?: InitializedDataStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  snapshotId?: string | number | null;
  configOption?: string | SnapshotConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null;
  snapshotItems?: SnapshotItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
  snapshots?: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  nestedStores?: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
  events?: CombinedEvents<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  tags?: string[] | TagsRecord<T>;
  setSnapshotData?: (
    snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    data: Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
    subscribers: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
    snapshotData: Partial<SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
    id?: string
  ) => void;
  processSnapshotData?: (
    id: string | number | null,
    data: Data<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshotManager: SnapshotManager<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    events: Record<string, CalendarManagerStoreClass<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>,
    snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    dataItems: RealtimeDataItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
    newData: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    timestamp: Date,
    payload: UpdateSnapshotPayload<T>,
    categoryProperties: CategoryProperties | undefined,
    payloadData: T | K,
    mappedSnapshotData: Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
    delegate: SnapshotWithCriteria<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
    category?: Category,
    snapshotId?: string | number | null,
    storeId?: number,
    store?: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ) => Promise<SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>;
 
  set?: (
    data: T | Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
    type: string,
    event: Event
  ) => void;
  setStore?: (
    data: T | Map<string, SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
    type: string,
    event: Event
  ) => void | null;
  restoreSnapshot?: (
    id: string,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshotId: string,
    snapshotData: SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    savedState: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    callback: (snapshot: T) => void,
    snapshots: SnapshotsArray<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    type: string,
    event: string | SnapshotEvents<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    subscribers: SubscriberCollection<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    category?: Category,
    snapshotContainer?: T,
    snapshotStoreConfig?: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>| undefined
  ) => void;
  
  handleSnapshot?: (
    id: string,
    snapshotId: string | number | null,
    snapshot: T extends SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> ? Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> : null,
    snapshotData: T,
    categoryProperties: CategoryProperties | undefined,
    callback: (snapshot: T) => void,
    snapshots: SnapshotsArray<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    type: string,
    event: SnapshotEvents<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    category?: Category,
    snapshotContainer?: T | undefined,
    snapshotStoreConfig?: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>| null | undefined,
    storeConfigs?: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]
  ) => Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null>;
  getItem?: (key: T) => Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined>;
  meta?: StructuredMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  mappedSnapshot?: Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> | {};
  snapshotMethods?: SnapshotStoreMethods<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
  getSnapshotsBySubscriber?: (subscriber: string) => Promise<T[]>;

  // Additional properties and methods from SnapshotEvents
  snapshotData?: SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  dataItems?: RealtimeDataItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
  on?: (event: string, callback: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void) => void;
  off?: (event: string) => void;
  eventsDetails?: Record<string, any>;
}



export type { CoreSnapshot };
