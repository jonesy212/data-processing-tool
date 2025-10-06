// CoreSnapshot.ts
import { CategoryProperties } from "@/app/app/pages/personas/ScenarioBuilder";
import { ContentItem } from "@/app/cards/DummyCardLoader";
import { RealtimeDataItem } from '@/app/components/models/realtime/RealtimeData';
import { Task } from '@/app/components/models/tasks/Task';
import { StructuredMetadata } from '@/config/StructuredMetadata';
import { NotificationType } from '@/app/context/NotificationContext';
import { Message } from '@/app/generators/GenerateChatInterfaces';
import { CombinedEvents } from "@/app/hooks/useSnapshotManager";
import { Category } from "@/app/libraries/categories/generateCategoryProperties";
import { Content } from "@/app/models/content/AddContent";
import { ChatRoom } from '@/calendar/CalendarSlice';
import { Sender } from '@/communications/chat/Communication';
import { UnifiedMetadata } from "@/server/database/MetaDataOptions";
import { SnapshotIdentity } from '@/SnapshotIdentity';
import { SnapshotBase, SnapshotData } from ".";

import { Label } from "@/app/branding/BrandingSettings";
import { SharedIdentifiers } from '@/app/components/documents/RelatedProps';
import { BaseEntity } from '@/app/components/routing/FuzzyMatch';
import { Attachment } from '@/app/documents/Attachment/attachment';
import { SnapshotManager } from '@/app/hooks/useSnapshotManager';
import { SharedTimestamps } from '@/app/models/CommonData';
import { ProjectPhaseTypeEnum, StatusType } from "@/app/models/data/StatusType";
import CalendarManagerStoreClass from '@/app/state/stores/CalendarManagerStore';
import { Subscriber } from "@/app/subscribers/Subscriber";
import { AllTypes } from "@/app/typings/PropTypes";
import { User } from "@/app/users/User";
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/config/BaseConfig';
import { UpdateSnapshotPayload } from '@/server/database/Payload';
import { SnapshotOperations } from '@/snapshotOperations';
import { SubscriberCollection } from '@/users/SubscriberCollection';
import {
  SnapshotEquality,
  Snapshots,
  SnapshotsArray
} from "./LocalStorageSnapshotStore";
import { Snapshot } from "./Snapshot";
import { SnapshotOperation } from "./SnapshotActions";
import { SnapshotConfig } from "./SnapshotConfig";
import {
  SnapshotRelationships,
} from "./SnapshotData";
import { SnapshotEvents } from "./SnapshotEvents";
import { SnapshotInitialization } from "./SnapshotInitialization";
import { SnapshotItem } from "./SnapshotList";
import { SnapshotMethods } from "./SnapshotMethods";
import { default as SnapshotStore } from "./SnapshotStore";
import { SnapshotStoreConfig } from "./SnapshotStoreConfig";
import { SnapshotStoreMethod } from "./SnapshotStoreMethod";
import { InitializedDataStore } from "./SnapshotStoreOptions";
import { SnapshotCRUD } from "./SnapshotSubscriberManagement";
import { SnapshotWithCriteria, TagsRecord } from "./SnapshotWithCriteria";

interface CoreSnapshot<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> extends Partial<SharedIdentifiers<T, K, Meta, AttachmentType, ExcludedFields>>,
          Partial<SnapshotMethods<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
          Partial<SnapshotRelationships<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
          Partial<SnapshotCRUD<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
          Partial<Omit<SnapshotInitialization<T, K, Meta, AttachmentType, ExcludedFields>, 'onInitialize'>>,
          Partial<SnapshotEquality<T, K, Meta, AttachmentType, ExcludedFields>>,
          Partial<SnapshotBase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
          Partial<SharedTimestamps>
{
  identity?: SnapshotIdentity<T, K, Meta, AttachmentType, ExcludedFields>;
  base?: BaseEntity<T, K, Meta, AttachmentType>;
  operations?: SnapshotOperations<T, K, Meta, AttachmentType, ExcludedFields>;
  methods?: Array<{ name: string; execute: (...args: any[]) => any; description?: string }>;
  processEvent?: (data: any, type: string, event: Event) => void;
  childSnapshotsMap?: Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>;
  childSnapshots?: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
  parentSnapshotId?: string;
  metadata?: UnifiedMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  config: Promise<SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null>;
  configs?: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] | null;
  parentId?: string | null;
  operation?: SnapshotOperation<T, K, Meta, AttachmentType, ExcludedFields>;
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
  task?: Task<T, K, Meta, AttachmentType>;
  category?: symbol | string | Category;
  categoryProperties?: CategoryProperties;
  date?: string | number | Date | null;
  status?: StatusType;
  content?: Content<T, K, Meta, AttachmentType, ExcludedFields>;
  contentItem?: string | ContentItem;
  label?: Label | string | Record<string, string> | null;
  excludedFields?: ExcludedFields;
  message?: (type: NotificationType, content: string, additionalData?: string, userId?: number, sender?: Sender, channel?: ChatRoom) => Message;
  user?: User;
  type?: string | AllTypes;
  phases?: ProjectPhaseTypeEnum;
phase?: PhaseDefault | null;
  ownerId?: string;
  store?: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null;
  state?: SnapshotsArray<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null;
  dataStore?: InitializedDataStore<T, K, Meta, AttachmentType, ExcludedFields>;
  snapshotId?: string | number | null;
  configOption?: string | SnapshotConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null;
  snapshotItems?: SnapshotItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
  snapshots?: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  nestedStores?: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
  events?: CombinedEvents<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  tags?: TagsRecord<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | string[];
  setSnapshotData?: (
    snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    data: Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
    subscribers: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
    snapshotData: Partial<SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
    id?: string
  ) => void;
  processSnapshotData?: (
    id: string | number | null,
    data: Initialized<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshotManager: SnapshotManager<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    events: Record<string, CalendarManagerStoreClass<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>,
    snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    dataItems: RealtimeDataItem<T, K, Meta, AttachmentType, ExcludedFields>[],
    newData: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    timestamp: Date,
    payload: UpdateSnapshotPayload<T>,
    category: Category | undefined,
    categoryProperties: CategoryProperties | undefined,
    payloadData: T | K,
    mappedSnapshotData: Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
    delegate: SnapshotWithCriteria<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
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
    category: Category | undefined,
    callback: (snapshot: T) => void,
    snapshots: SnapshotsArray<T, K, Meta>,
    type: string,
    event: string | SnapshotEvents<T, K, Meta, ExcludedFields>,
    subscribers: SubscriberCollection<T, K, Meta, ExcludedFields>,
    snapshotContainer?: T,
    snapshotStoreConfig?: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>| undefined
  ) => void;
  handleSnapshot?: (
    id: string,
    snapshotId: string | number | null,
    snapshot: T extends SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> ? Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> : null,
    snapshotData: T,
    category: Category | undefined,
    categoryProperties: CategoryProperties | undefined,
    callback: (snapshot: T) => void,
    snapshots: SnapshotsArray<T, K, Meta>,
    type: string,
    event: SnapshotEvents<T, K, Meta, ExcludedFields>,
    snapshotContainer?: T | undefined,
    snapshotStoreConfig?: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>| null | undefined,
    storeConfigs?: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]
  ) => Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null>;
  getItem?: (key: T) => Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined>;
  meta?: StructuredMetadata<T, K>;
  mappedSnapshot?: Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> | {};
  snapshotMethods?: SnapshotStoreMethod<T, K, Meta, ExcludedFields>[];
  getSnapshotsBySubscriber?: (subscriber: string) => Promise<T[]>;

  // Additional properties and methods from SnapshotEvents
  snapshotData?: SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  dataItems?: RealtimeDataItem<T, K, Meta, ExcludedFields>[];
  on?: (event: string, callback: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void) => void;
  off?: (event: string) => void;
  eventsDetails?: Record<string, any>;
}



export type { CoreSnapshot };
