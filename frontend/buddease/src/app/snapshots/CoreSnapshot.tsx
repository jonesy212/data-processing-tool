// CoreSnapshot.tsx

import { ContentItem } from "@/app/cards/DummyCardLoader";
import { ChatRoom } from '@/app/communications/ChatRoom';
import { Sender } from '@/app/components/communications/CommunicationPage';
import { Task } from '@/app/components/models/tasks/Task';
import { UnifiedMetadata } from "@/app/config/MetaDataOptions";
import { StructuredMetadata } from '@/app/config/StructuredMetadata';
import { NotificationType } from '@/app/features/support/UnifiedNotificationTypes';
import { Message } from '@/app/generators/GenerateChatInterfaces';
import { CombinedEvents } from "@/app/hooks/useSnapshotManager";
import { Category } from "@/app/libraries/categories/generateCategoryProperties";
import { Content } from "@/app/models/content/AddContent";
import { Data } from '@/app/models/data/Data';
import { CategoryProperties } from "@/app/pages/personas/ScenarioBuilder";
import { SnapshotIdentity } from '@/app/snapshots/SnapshotIdentity';
import { PhaseDefault } from '@/app/typings/phaseTypes';
import { RealtimeDataItem } from '@/app/typings/realtimeTypes';
import { SnapshotBase, SnapshotData } from "@/app/snapshots/SnapshotData";

import { Label } from "@/app/branding/BrandingSettings";
import { BaseDataEntity, BaseDataRoot, BaseEntity, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { Attachment } from '@/app/documents/attachment/Attachment';
import { SharedIdentifiers } from '@/app/documents/RelatedProps';
import { SnapshotManager } from '@/app/hooks/useSnapshotManager';
import { UpdateSnapshotPayload } from '@/app/interfaces/payload/payloadTypes';
import { SharedTimestamps } from '@/app/models/CommonData';
import { ProjectPhaseTypeEnum, StatusType } from "@/app/models/data/StatusType";
import { TagsRecord } from '@/app/models/tracker/Tag';
import {
  SnapshotEquality,
  Snapshots,
  SnapshotsArray
} from '@/app/snapshots/LocalStorageSnapshotStore';
import { Snapshot } from '@/app/snapshots/Snapshot';
import { SnapshotOperations } from '@/app/snapshots/snapshotOperations';
import CalendarManagerStoreClass from '@/app/state/stores/CalendarManagerStore';
import { Subscriber } from "@/app/subscribers/Subscriber";
import { SubscriberCollection } from '@/app/subscribers/SubscriberCollection';
import { AllTypes } from "@/app/typings/PropTypes";
import { SnapshotEvents } from '@/app/typings/snapshotTypes';
import { User } from "@/app/users/User";
import { SnapshotOperation } from "@/app/snapshots/index";
import { SnapshotConfig } from "@/app/snapshots/SnapshotConfig";
import { SnapshotItem } from "@/app/snapshots/SnapshotList";
import { SnapshotMethods } from "@/app/snapshots/SnapshotMethods";
import { default as SnapshotStore } from "./SnapshotStore";
import { SnapshotStoreConfig } from "@/app/snapshots/SnapshotStoreConfig";
import { SnapshotStoreMethods } from "@/app/snapshots/SnapshotStoreMethods";
import { InitializedDataStore } from "@/app/snapshots/SnapshotStoreOptions";
import { SnapshotCRUD } from "@/app/snapshots/SnapshotSubscriberManagement";
import { SnapshotWithCriteria } from "@/app/snapshots/SnapshotWithCriteria";

interface CoreSnapshot<
  T extends BaseDataEntity = BaseDataRoot,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> extends Partial<SharedIdentifiers<T, K>>,
          Partial<SnapshotMethods<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
          // Partial<SnapshotRelationships<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
          Partial<SnapshotCRUD<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
          // Partial<Omit<SnapshotInitialization<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, 'onInitialize'>>,
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
