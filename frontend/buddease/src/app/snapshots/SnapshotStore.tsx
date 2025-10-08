// SnapshotStore.ts

import { IHydrateResult } from 'mobx-persist';
import { SnapshotCategory } from '@/app/api/getSnapshotEndpoint';
import { SharedIdentifiers, SharedStatusFlags, SharedTimestamps } from '@/app/components/documents/RelatedProps';
import { Data } from '@/app/models/data/Data';
import { bindAllMethods } from '@/methodBinder'
import { VersionHistory } from '@/app/versions/VersionData';
import { Label } from '@/app/branding/BrandingSettings';
import { Snapshot } from '@/app/snapshots/Snapshot';
import { AllTypes } from '@/app/typings/PropTypes';
import { U, WrappedU } from '@/isCompatibleTempData';
import { SnapshotStoreReference } from '@/app/snapshots/SnapshotStoreReference';
import { UpdateSnapshotParams } from '@/app/snapshots/UpdateSnapshotParams';

import * as snapshotApi from '@/app/api/SnapshotApi';
import { InitializedConfig } from '@/app/snapshots/SnapshotStoreConfig';
import { Subscription } from '@/app/subscriptions/Subscription';
import { Subscriber } from '@/app/subscribers/Subscriber';
import { CategoryProperties } from '@/app/pages/personas/ScenarioBuilder';
import { CoreSnapshot } from '@/app/snapshots/CoreSnapshot';
import { SnapshotMethodsImplementation } from '@/methods/snapshotMethods';
import { ValidationMethods } from '@/app/snapshots/methods/validationMethods'
import { getSnapshotStoreConfig } from '@/app/api/SnapshotApi';
import { UnifiedMetadata } from '@/server/database/MetaDataOptions';
import { getConfigPromise } from '@/config/getConfigPromise';
import { ProjectMetadata, StructuredMetadata } from '@/config/StructuredMetadata';
import { NotificationType, NotificationTypeEnum } from '@/context/NotificationContext';
import UniqueIDGenerator from '@/app/generators/GenerateUniqueIds';
import { MessageType } from '@/app/generators/MessaageType';
import { CriteriaType } from '@/app/pages/searchs/CriteriaType';
import { FilterCriteria } from '@/app/pages/searchs/FilterCriteria';
import retrieveSnapshotData from '@/app/utils/retrieveSnapshotData';
import { prefix } from '@fortawesome/free-solid-svg-icons';

import { Video } from '@/app/state/stores/VideoStore';

import getConfig from 'next/config';

import { Attachment } from '@/app/documents/attachment/Attachment';
import { CreateSnapshotStoresPayload, CreateSnapshotsPayload, Payload, UpdateSnapshotPayload } from '@/app/server/database/Payload';
import { SchemaField } from '@/server/database/SchemaField';
import { DocumentTypeEnum } from '@/app/typings/documents';
import { SnapshotWithData } from '@/app/calendar/CalendarApp';
import { CodingLanguageEnum, LanguageEnum } from '@/app/communications/LanguageEnum';
import { FileTypeEnum } from '@/app/documents/FileType';
import defaultImplementation from '@/app/event/defaultImplementation';
import { UnsubscribeDetails } from '@/app/event/DynamicEventHandlerExample';
import FormatEnum from '@/app/form/FormatEnum';
import { CombinedEvents, SnapshotManager, SnapshotStoreOptions, useSnapshotManager } from '@/app/hooks/useSnapshotManager';
import AnimationTypeEnum from '@/app/libraries/animations/AnimationLibrary';
import { Category } from '@/app/libraries/categories/generateCategoryProperties';
import { Content } from '@/app/models/content/AddContent';
import { BaseData, DataDetails } from '@/app/models/data/Data';
import { dataStoreMethods } from '@/app/models/data/dataStoreMethods';
import { BookmarkStatus, CalendarStatus, DataStatus, DevelopmentPhaseEnum, NotificationPosition, NotificationStatus, PriorityTypeEnum, PrivacySettingEnum, ProjectPhaseTypeEnum, StatusType, SubscriberTypeEnum, SubscriptionTypeEnum, TaskStatus, TeamStatus, TodoStatus } from '@/app/models/data/StatusType';
import { DebugInfo, TempData } from '@/app/models/data/TempData';
import { RealtimeDataItem } from '@/app/models/realtime/RealtimeData';
import { ContentManagementPhaseEnum } from '@/app/components/phases/ContentManagementPhase';
import { FeedbackPhaseEnum } from '@/app/phases/FeedbackPhase';
import { TaskPhaseEnum } from '@/app/phases/TaskProcess';
import { TenantManagementPhaseEnum } from '@/app/components/phases/TenantManagementPhase';
import { AnalysisTypeEnum } from '@/app/typings/AnalysisType';
import { DataStoreMethods, DataStoreWithSnapshotMethods } from '@/app/projects/DataAnalysisPhase/DataProcessing/DataStoreMethods';
import { CommonDataStoreMethods, DataStore, EventRecord, InitializedState } from '@/app/projects/DataAnalysisPhase/DataProcessing/DataStore';
import { SearchCriteria } from '@/app/routing/SearchCriteria';
import { SecurityFeatureEnum } from '@/app/security/SecurityFeatureEnum';
import CalendarManagerStoreClass from '@/app/state/stores/CalendarManagerStore';
import { convertSnapshotStoreToSnapshot, convertToDataStore, isSnapshotStore, snapshotType } from '@/app/typings/YourSpecificSnapshotType';
import { AuditRecord } from '@/app/subscribers/Subscriber';
import { SubscriberCollection } from '@/app/subscribers/SubscriberCollection';
import { IdeaCreationPhaseEnum } from '@/app/users/userJourney/IdeaCreationPhase';
import { addToSnapshotList, convertToSnapshotArray, isSnapshot, isSnapshotStoreConfig, snapshotId } from '@/app/utils/snapshotUtils';
import { Version } from '@/app/versions/Version';
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/config/BaseConfig';
import { defaultSubscribeToSnapshot } from '@/app/snapshots/defaultSnapshotSubscribeFunctions';
import { defaultSubscribeToSnapshots } from '@/app/snapshots/defaultSubscribeToSnapshots';
import { FetchSnapshotPayload } from '@/app/snapshots/FetchSnapshotPayload';
import {
  SnapshotUnion,
  Snapshots,
  SnapshotsArray,
  SnapshotsObject
} from "./LocalStorageSnapshotStore";
import { ConfigMethods, applyStoreConfig } from '@/methods/configMethods';
import  { UtilMethods } from '@/app/snapshots/methods/utilMethods';

import { createSnapshotStores } from '@/app/snapshots/newStoreUtils';
import { SnapshotActions, SnapshotOperation } from '@/app/snapshots/SnapshotActions';
import { ConfigureSnapshotStorePayload, RetentionPolicy, SnapshotConfig } from '@/app/snapshots/SnapshotConfig';
import { SnapshotContainer, SnapshotContainerType, SnapshotDataType } from '@/app/snapshots/SnapshotContainer';
import { SnapshotData, SnapshotBaseMethods } from '@/app/snapshots/SnapshotData';
import { SnapshotEvents } from '@/app/snapshots/SnapshotEvents';
import { createSnapshotStore, delegate, notifySubscribers, onSnapshots, subscribeToSnapshot, subscribeToSnapshots } from '@/app/snapshots/snapshotHandlers';
import { SnapshotItem } from '@/app/snapshots/SnapshotList';
import { getSnapshotItems, SnapshotOperations } from '@/app/snapshots/snapshotOperations';
import { SnapshotStoreMethod } from '@/app/snapshots/SnapshotStoreMethod';
import { InitializedData, InitializedDataStore, SnapshotWithCriteriaAsBase } from '@/app/snapshots/SnapshotStoreOptions';
import { SnapshotWithCriteriaContract, TagsRecord, data } from '@/app/snapshots/SnapshotWithCriteria';
import { Callback } from './subscribeToSnapshotsImplementation';
import { SnapshotStoreProps, useSnapshotStore } from './useSnapshotStore';


import { LifecycleMethods } from './methods/lifecycleMethods';
import { SnapshotEvent } from '@/typings/eventTypes';
import { snapshot, SnapshotWithCriteria } from '.';
import { ConvertSnapshotWithCriteria  } from '@/app/snapshots/ConvertSnapshotUnion';
import { options } from '@/app/documents/editing/DocumentBuilder';
import { notify } from '@/app/utils/snapshotUtils';
import { transformSubscriberAdvanced, transformSubscriberMappedAdvanced } from './methods/advancedTransform';
import { BatchMethods } from './methods/batchMethods';
import * as DataMethods from './methods/dataMethods';
import * as FetchMethods from './methods/fetchMethods';
import * as SnapshotMethods from './methods/snapshotMethods';
import { SubscriptionMethods } from './methods/subscriptionMethods';
import * as TransformMethods from './methods/transformMethods';
import { SnapshotStoreConfigWithCore } from './methods/transformMethods';
import * as VersionMethods from './methods/versionMethods';
import { SnapshotSubscriptionMethods } from '@/app/snapshots/SnapshpshotMethods';
import { SnapshotStoreConfig } from '@/app/snapshots/SnapshpshotStoreConfig';
import { SnapshotContext } from "./SnapshotSubscriberManagement";
import { store } from '@/app/state/stores/useAppDispatch';
import { SnapshotDataParams } from "./SnapshotDataParams";
import { SnapshotSecurity } from "./SnapshotSecurity";
import { ChatRoom } from "@/app/communications/chatRoom"
import { Sender } from "@/appation";
import { getAllSnapshotEntries } from "@/app/snapshots/getSnapshotEntries";
import { Message } from "@/app/generators/GenerateChatInterfaces";
import { MapMethods } from "./methods/mappingMethods";
import { BaseEntity } from '@/app/components/routing/FuzzyMatch';
import { searchAPI } from "@/app/api/ApiSearch";
import { SearchResult } from "@/app/components/routing/SearchResult"

interface UnsubscribeEvent extends UnsubscribeDetails {
  id: string;
  storedAt: Date;
  storeId?: number;
  category?: string;
  metadata?: Record<string, any>;
  snapshotId?: string;
  userId?: string;
  unsubscribeType: string;
  unsubscribeReason: string;
}

class SnapshotStore<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>
  implements 
    SharedTimestamps,
    SharedStatusFlags,
    SnapshotSubscriptionMethods<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, 
    SharedIdentifiers<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    DataStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    SnapshotWithCriteriaContract<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    SnapshotStoreMethods<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    CommonDataStoreMethods<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
{
  dataItems?: RealtimeDataItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] | null = null;
  newData: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null =  null;
  
  // ---------------------------
  // SharedIdentifiers
  _id?: string;
  id?: string | number;
  type?: string | AllTypes | null;
  title?: string;
  name: string;
  label?: Label | string | Record<string, string> | null;
  key?: string;
  value?: string | number | Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null = 0;
  configOption?:
  | string
    | SnapshotConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
    | SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
    | null;

  length: number | undefined = 0;
    
  // SharedTimestamps
  updatedAt?: string | Date | undefined;
  createdBy?: string | undefined;
  updatedBy?: string;
  deletedAt?: Date | null;
  lastLogin?: Date;
  lastLogout?: Date;
  lastPasswordChange?: Date;
  lastEmailChange?: Date;
  lastProfileChange?: Date;
  lastAvatarChange?: Date;
  lastBannerChange?: Date;
  lastStatusChange?: Date;
  lastRoleChange?: Date;
  lastTierChange?: Date;
  lastPaymentChange?: Date;
  lastSubscriptionChange?: Date;
  lastEmailVerification?: Date;
  lastPasswordReset?: Date;
  lastLoginAttempt?: Date;
  loginAttempts?: number;
  lockoutEnd?: Date | null;
  
  // Extra bookkeeping
  isEncrypted?: boolean;
  ownerId?: string;
  previousVersionId?: string;
  nextVersionId?: string;
  auditTrail?: AuditRecord[];
  retentionPolicy?: RetentionPolicy;
  dependencies?: string[];
  auditRecords: AuditRecord[] = [];
  
  // ---------------------------
  // SharedStatusFlags
  isActive?: boolean;
  isArchived?: boolean;
  isCompleted?: boolean;
  isBeingEdited?: boolean;
  isBeingDeleted?: boolean;
  isBeingCompleted?: boolean;
  isBeingReassigned?: boolean;
  isDeleted?: boolean;
  isBanned?: boolean;
  isDisabled?: boolean;
  isSuspended?: boolean;
  isPending?: boolean;
  isRequested?: boolean;
  isRecommended?: boolean;
  isPopular?: boolean;
  isTrending?: boolean;
  isViral?: boolean;
  isControversial?: boolean;
  isFeatured?: boolean;
  isSponsored?: boolean;
  isPromoted?: boolean;
  isBoosted?: boolean;
  isBookmarked?: boolean;
  isSaved?: boolean;
  isLiked?: boolean;
  isDisliked?: boolean;
  isShared?: boolean;
  isViewed?: boolean;
  isRead?: boolean;
  isUnread?: boolean;
  isNotified?: boolean;
  isNoteworthy?: boolean;
  isResponsible?: boolean;
  isAccountable?: boolean;
  isConsulted?: boolean;
  isInformed?: boolean;
  isEngaged?: boolean;
  isAvailable?: boolean;
  isOnline?: boolean;
  isOffline?: boolean;
  isAway?: boolean;
  isBusy?: boolean;
  isDoNotDisturb?: boolean;
  isUnderMaintenance?: boolean;

  // ---------------------------
  // SnapshotStore-specific properties
  snapshotId?: string | number | undefined = undefined;
  keys: string[] = [];
  topic: string = "";
  date: string | number | Date | undefined;
  operation!: SnapshotOperation<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  subscription?: Subscription<T, K, Meta, ExcludedFields> | null = null;
  description?: string | undefined = "";
  category: symbol | string | Category | undefined;
  options: SnapshotStoreOptions<T, K, Meta, ExcludedFields> = {} as SnapshotStoreOptions<T, K, Meta, ExcludedFields>;
  categoryProperties: CategoryProperties | undefined;
  message: any = undefined;
  timestamp: string | number | Date | undefined;
  logging?: boolean;
  autoSync?: boolean;
  structuredMetadata: StructuredMetadata<T, K> = {} as StructuredMetadata<T, K>;
  storeId: number = 0;
  videos?: Video[];
  maxAge: string | number | undefined = undefined;

  // For storing store references
  stores: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] = [];

// For store creation factory
  createStore?: (props: SnapshotStoreProps<T, K, Meta, ExcludedFields>) => 
  SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  
  isCompressed?: boolean;
  isSubscribed: boolean = false;
  snapshotMethods?: SnapshotStoreMethods<T, K, Meta, ExcludedFields>[] = [];

  todoSnapshotId: string | undefined = "";
  
  // Lifecycle
  expirationDate?: Date;

  // State flags
  status?: StatusType;
  pending: boolean = false;
  loading: boolean = false;
  readOnly: boolean = false;
  isSigned?: boolean;
  mounted: boolean = false;
  

 

  // ----------------
  // Utilities
  // ----------------
  metadata?: UnifiedMetadata<T, K, Meta, ExcludedFields> | {};
  meta: StructuredMetadata<T, K> | {};
  mappedSnapshot?: Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> | {} = {};
  tags?: TagsRecord<T, K, Meta, ExcludedFields> | string[] | undefined;
  priority?: PriorityTypeEnum | undefined;

  
  // Then provide proper type guards
  isMessageString(): this is { message: string | undefined } {
    return typeof this.message === 'string' || this.message === undefined;
  }

  isMessageFunction(): this is { 
    message: (type: NotificationType, content: string, additionalData?: string, userId?: number, sender?: Sender, channel?: ChatRoom) => Message 
  } {
    return typeof this.message === 'function';
  }

  isExpired(): boolean | undefined {
    return !!this.expirationDate && new Date() > this.expirationDate;
  }

  /**
   * Start idle timeout monitoring
   * @param timeoutMs Optional custom timeout duration in milliseconds
   */
  startIdleTimeout(timeoutMs?: number): void {
    // Clear any existing timeout
    this.clearIdleTimeout();

    // Set custom timeout if provided
    if (timeoutMs !== undefined) {
      this.idleTimeoutDuration = timeoutMs;
    }

    // Set up activity listeners
    this.setupActivityListeners();

    // Start the timeout
    this.resetIdleTimeout();

    console.log(`Idle timeout started (${this.idleTimeoutDuration}ms)`);
  }

  /**
   * Reset the idle timeout timer
   */
  resetIdleTimeout(): void {
    // Clear existing timeout
    this.clearIdleTimeout();

    // Update last activity timestamp
    this.lastActivityTimestamp = Date.now();

    // Set new timeout
    this.idleTimeoutId = setTimeout(() => {
      this.handleIdleTimeout();
    }, this.idleTimeoutDuration);

    // If we were idle, trigger activity callbacks
    if (this.isIdle) {
      this.isIdle = false;
      this.triggerActivityCallbacks();
    }
  }

  
  //<------ SUBSCRIBER METHODS ------>
  public defaultSubscribeToSnapshots: SnapshotSubscriptionMethods<T, K, Meta, ExcludedFields>["defaultSubscribeToSnapshots"] = (
    snapshotId: string,
    callback: (snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => Subscriber<T, K, Meta, ExcludedFields> | null,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null = null
  ) => {
    return defaultSubscribeToSnapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>(
      snapshotId,
      callback as unknown as (snapshots: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]) => Subscriber<BaseData, T> | null,
      snapshot
    );
  };

  notify!: <U, K>(id: string, message: string, content: Content<U, K>, data: any, date: Date, type: NotificationType) => void;

  // getSubscribers!: <
  //   U extends BaseDataEntity,
  //   K extends U = U,
  //   Meta extends DefaultMeta<U, K> = DefaultMeta<U, K>
  // >(
  //   subscribers: Subscriber<U, K>[], 
  //   snapshots: Snapshots<U, K, Meta>
  // ) => Promise<{ subscribers: Subscriber<U, K>[]; snapshots: Snapshots<U, K, Meta> }>;

  // STATE MANAGEMENT TYPE DECLARATIONS
  getCurrentState!: <T extends BaseDataEntity, K extends T = T, Meta = DefaultMeta<T, K>, ExcludedFields extends keyof T = DefaultExcludedFields<T>>() => Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null;

  getStates!: <T extends BaseDataEntity, K extends T = T, Meta = DefaultMeta<T, K>, ExcludedFields extends keyof T = DefaultExcludedFields<T>>() => Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];

  hasSnapshots!: <T extends BaseDataEntity, K extends T = T, Meta = DefaultMeta<T, K>, ExcludedFields extends keyof T = DefaultExcludedFields<T>>() => Promise<boolean>;

  equals!: <T extends BaseDataEntity, K extends T = T, Meta = DefaultMeta<T, K>, ExcludedFields extends keyof T = DefaultExcludedFields<T>>(
    otherStore: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ) => Promise<boolean>;

  initializeWithData!: <T extends BaseDataEntity, K extends T = T, Meta = DefaultMeta<T, K>, ExcludedFields extends keyof T = DefaultExcludedFields<T>>(
    data: SnapshotUnion<T, K, Meta, ExcludedFields>[]
  ) => void;

  addToSnapshotList!: <T extends BaseDataEntity, K extends T = T, Meta = DefaultMeta<T, K>, ExcludedFields extends keyof T = DefaultExcludedFields<T>>(
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
    subscribers: Subscriber<T, K, Meta, ExcludedFields>[]
  ) => Promise<Subscription<T, K, Meta, ExcludedFields>[]>;

  getSnapshotsBySubscriber!: <T extends BaseDataEntity, K extends T = T, Meta = DefaultMeta<T, K>, ExcludedFields extends keyof T = DefaultExcludedFields<T>>(
    subscriber: string
  ) => Promise<BaseData[]>;
    
  findIndex(predicate: (snapshot: SnapshotUnion<T, K, Meta, ExcludedFields>) => boolean): number {
    if (Array.isArray(this.snapshots)) {
      return this.snapshots.findIndex(predicate);
    } else {
      // Convert the object values to SnapshotUnion<T, K, Meta, ExcludedFields>
      const snapshotArray: SnapshotUnion<T, K, Meta, ExcludedFields>[] = Object.values(
        this.snapshots
      ) as SnapshotUnion<T, K, Meta, ExcludedFields>[];
      return snapshotArray.findIndex(predicate);
    }
  }

  splice(index: number, count: number): SnapshotUnion<T, K, Meta, ExcludedFields>[] {
    if (Array.isArray(this.snapshots)) {
      this.snapshots.splice(index, count);
    } else {
      throw new Error("Cannot splice an object. Convert to array first.");
    }
    return this.snapshots.slice(index, index + count);
  }

  // In your interface/class definition
  addSnapshot!: (
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshotId?: string, // Make optional if not always needed
    subscribers?: SubscriberCollection<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ) => Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined>;

  updateSnapshot!: (
    snapshotId: string | number | null,
    snapshotIdOrParams?: string | number | null | UpdateSnapshotParams<T, K, Meta, ExcludedFields>, // Make optional
    data?: Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>, // Make optional
    newData?: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, // Make optional
    timestamp?: Date, // Make optional
    category?: Category | undefined, // Make optional
    events?: Record<string, CalendarManagerStoreClass<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>, // Make optional
    snapshotStore?: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, // Make optional
    dataItems?: RealtimeDataItem<T, K, Meta, ExcludedFields>[], // Make optional
    payloadData?: T | K, // Make optional
    mappedSnapshotData?: Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>, // Make optional
    delegate?: SnapshotWithCriteria<T, K, Meta, ExcludedFields>[], // Make optional
    payload?: UpdateSnapshotPayload<T>, // Make optional
    store?: SnapshotStore<any, K, Meta, ExcludedFields>, // Make optional
    callback?: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void // Make optional
  ) => Promise<{ snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> }>;


  // EVENT & HIERARCHY TYPE DECLARATIONS - validation methods
  emit!: <T extends BaseDataEntity, K extends T = T, Meta = DefaultMeta<T, K>, ExcludedFields extends keyof T = DefaultExcludedFields<T>>(
    event: string,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshotId: string,
    subscribers: SubscriberCollection<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    type: string,
    snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    dataItems: RealtimeDataItem<T, K, Meta, ExcludedFields>[],
    criteria: SnapshotWithCriteriaAsBase<T, K, Meta, ExcludedFields>,
    category: symbol | string | Category | undefined
  ) => void;

  removeChild!: <T extends BaseDataEntity, K extends T = T, Meta = DefaultMeta<T, K>, ExcludedFields extends keyof T = DefaultExcludedFields<T>>(
    childId: string,
    parentId: string,
    parentSnapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    childSnapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ) => void;

  getChildren!: <T extends BaseDataEntity, K extends T = T, Meta = DefaultMeta<T, K>, ExcludedFields extends keyof T = DefaultExcludedFields<T>>(
    id: string,
    childSnapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ) => Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];

  hasChildren!: <T extends BaseDataEntity, K extends T = T, Meta = DefaultMeta<T, K>, ExcludedFields extends keyof T = DefaultExcludedFields<T>>(
    id: string
  ) => boolean;

  isDescendantOf!: <T extends BaseDataEntity, K extends T = T, Meta = DefaultMeta<T, K>, ExcludedFields extends keyof T = DefaultExcludedFields<T>>(
    childId: string,
    parentId: string,
    parentSnapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    childSnapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ) => boolean;

  getInitialState!: <T extends BaseDataEntity, K extends T = T, Meta = DefaultMeta<T, K>, ExcludedFields extends keyof T = DefaultExcludedFields<T>>() => Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;

  getConfigOption!: <
    T extends BaseDataEntity,
    K extends T = T,
    Meta = DefaultMeta<T, K>,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>>(
    optionKey: string
  ) => Record<string, any>;

  getTimestamp!: <T extends BaseDataEntity, K extends T = T, Meta = DefaultMeta<T, K>, ExcludedFields extends keyof T = DefaultExcludedFields<T>>() => Date;

  // STORE MANAGEMENT TYPE DECLARATIONS
  findSnapshots!: (criteria: SearchCriteria) => Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>;
  
  // snapshotMethods 
  snapshot!: (
    id: string | number | undefined,
    snapshotId: string | null,
    snapshotData: SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    category: Category | undefined,
    categoryProperties: CategoryProperties | undefined,
    callback: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null) => void,
    dataStore: DataStore<T, K, Meta, ExcludedFields>,
    dataStoreMethods: DataStoreMethods<T, K, Meta, ExcludedFields>,
    metadata: UnifiedMetadata<T, K, Meta, ExcludedFields>,
    subscriberId: string,
    endpointCategory: string | number,
    storeProps: SnapshotStoreProps<T, K, Meta, ExcludedFields>,
    subscription?: Subscription<T, K, Meta, ExcludedFields>,
    snapshotConfigData?: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshotStoreConfigData?: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshotContainer?: SnapshotContainerType<T, K, Meta, ExcludedFields> | null,
  ) => Promise<{
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null,
    snapshotData: SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  }>;

  removeSnapshot!: (snapshotToRemove: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;
  clearSnapshots!: () => void;

  takeSnapshot!: (
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    subscribers?: Subscriber<T, K, Meta, ExcludedFields>[]
  ) => Promise<{ snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> }>;




    // SnapshotStore identity comparison
  isSameStore = (otherStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): boolean => {
    return this.id === otherStore.id && this.storeId === otherStore.storeId;
  };

  // SnapshotStore deep comparison
  isEqualStore = async (otherStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): Promise<boolean> => {
    return this.isSameStore(otherStore) &&
           this.timestamp?.getTime() === otherStore.timestamp?.getTime() &&
           this.category === otherStore.category &&
           JSON.stringify(this.config) === JSON.stringify(otherStore.config);
  };

  // Snapshot comparison
  isSameSnapshot = (snapshotA: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, snapshotB: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): boolean => {
    return snapshotA.id === snapshotB.id;
  };


  // Use the existing equals method for comparison
  isSameSnapshot = async (
    snapshotA: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, 
    snapshotB: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ): Promise<boolean> => {
    // Delegate to the equals method for comprehensive comparison
    return await snapshotA.equals(snapshotB);
  };

  // Or if you want a synchronous version that uses equals internally
  isSameSnapshotSync = (
    snapshotA: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, 
    snapshotB: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ): boolean => {
    // For synchronous needs, you might want a simpler check
    // but still leverage equals if possible
    try {
      // If equals returns a promise, you might need to handle it differently
      // or create a synchronous version of the comparison logic
      return snapshotA.id === snapshotB.id;
    } catch (error) {
      console.warn('Error in synchronous comparison, falling back to ID check');
      return snapshotA.id === snapshotB.id;
    }
  };

  // Add this method to your SnapshotStore class
async processBatch(
  operations: Array<{
    type: 'add' | 'update' | 'remove' | 'move' | 'copy';
    snapshot?: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
    snapshotId?: string | number;
    data?: Partial<T>;
    options?: {
      validate?: boolean;
      notifySubscribers?: boolean;
      updateTimestamp?: boolean;
      category?: Category;
      metadata?: Partial<Meta>;
    };
  }>,
  batchOptions: {
    atomic?: boolean;
    validateAll?: boolean;
    onProgress?: (completed: number, total: number) => void;
    timeout?: number;
    retryAttempts?: number;
  } = {}
): Promise<{
  results: Array<{
    success: boolean;
    operation: string;
    snapshotId?: string | number;
    snapshot?: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
    error?: Error;
    duration: number;
  }>;
  total: number;
  successful: number;
  failed: number;
  totalDuration: number;
}> {
  const startTime = Date.now();
  const results: Array<{
    success: boolean;
    operation: string;
    snapshotId?: string | number;
    snapshot?: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
    error?: Error;
    duration: number;
  }> = [];

  const { atomic = false, validateAll = true, onProgress, timeout = 30000, retryAttempts = 3 } = batchOptions;

  try {
    // Validate batch operations
    if (!Array.isArray(operations) || operations.length === 0) {
      throw new Error('Batch operations must be a non-empty array');
    }

    if (atomic) {
      // Start transaction for atomic operations
      await this.beginTransaction();
    }

    let completed = 0;
    const total = operations.length;

    for (const operation of operations) {
      const operationStartTime = Date.now();
      let result: any;

      try {
        // Validate individual operation
        if (!operation.type) {
          throw new Error('Operation type is required');
        }

        switch (operation.type) {
          case 'add':
            if (!operation.snapshot) {
              throw new Error('Snapshot is required for add operation');
            }
            result = await this.addSnapshot(
              operation.snapshot,
              operation.snapshotId?.toString(),
              undefined // subscribers optional
            );
            break;

          case 'update':
            if (!operation.snapshotId && !operation.snapshot?.id) {
              throw new Error('Snapshot ID or snapshot with ID is required for update operation');
            }
            const updateId = operation.snapshotId || operation.snapshot?.id;
            result = await this.updateSnapshot(
              updateId!,
              undefined, // snapshotIdOrParams optional
              undefined, // data optional
              operation.snapshot, // newData
              new Date(), // timestamp
              operation.options?.category, // category
              undefined, // events optional
              undefined, // snapshotStore optional
              undefined, // dataItems optional
              operation.data as T | K, // payloadData
              undefined, // mappedSnapshotData optional
              undefined, // delegate optional
              { data: operation.data, options: operation.options } as UpdateSnapshotPayload<T>, // payload
              undefined, // store optional
              undefined // callback optional
            );
            break;

          case 'remove':
            if (!operation.snapshotId) {
              throw new Error('Snapshot ID is required for remove operation');
            }
            // Assuming you have a removeSnapshot method
            result = await this.removeSnapshot(operation.snapshotId);
            break;

          case 'move':
          case 'copy':
            // Implement move/copy logic if needed
            throw new Error(`Operation type '${operation.type}' not implemented yet`);

          default:
            throw new Error(`Unknown operation type: ${operation.type}`);
        }

        results.push({
          success: true,
          operation: operation.type,
          snapshotId: operation.snapshotId || operation.snapshot?.id,
          snapshot: result?.snapshot || operation.snapshot,
          duration: Date.now() - operationStartTime
        });

      } catch (error) {
        results.push({
          success: false,
          operation: operation.type,
          snapshotId: operation.snapshotId || operation.snapshot?.id,
          error: error as Error,
          duration: Date.now() - operationStartTime
        });

        if (atomic) {
          // If atomic and one operation fails, break and rollback
          throw error;
        }
      }

      completed++;
      onProgress?.(completed, total);
    }

    if (atomic) {
      await this.commitTransaction();
    }

    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    return {
      results,
      total,
      successful,
      failed,
      totalDuration: Date.now() - startTime
    };

  } catch (error) {
    if (atomic) {
      await this.rollbackTransaction().catch(rollbackError => {
        console.error('Failed to rollback transaction:', rollbackError);
      });
    }

    throw error;
  }
}


  private delegate: Array<SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> = [];

  private securityService: SecurityService;
  
  


  getStore!: typeof LifecycleMethods.getStore;
  getStores!: typeof LifecycleMethods.getStores;
  addStore!: typeof LifecycleMethods.addStore;
  getSubscribers!: typeof LifecycleMethods.getSubscribers;

  // Helper methods for transaction support (add these too)
  private async beginTransaction(): Promise<void> {
    // Implement transaction begin logic
    console.log('Transaction started');
  }

  private async commitTransaction(): Promise<void> {
    // Implement transaction commit logic
    console.log('Transaction committed');
  }

  private async rollbackTransaction(): Promise<void> {
    // Implement transaction rollback logic
    console.log('Transaction rolled back');
  }

    /**
   * Handle idle timeout event
   */
  private handleIdleTimeout(): void {
    this.isIdle = true;
    console.log('SnapshotStore is now idle');

    // Trigger idle callbacks
    this.triggerIdleCallbacks();

    // Perform idle operations
    this.performIdleOperations();
  }

  /**
   * Clear the current idle timeout
   */
  private clearIdleTimeout(): void {
    if (this.idleTimeoutId) {
      clearTimeout(this.idleTimeoutId);
      this.idleTimeoutId = null;
    }
  }
snapshotData: SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null;

  // Renamed method to avoid conflict
processSnapshotData? = async (
  id: string | number | null,
  data: InitializedData<T, K, Meta, ExcludedFields>,
  snapshotManager: SnapshotManager<T, K, Meta, ExcludedFields>,
  events: Record<string, CalendarManagerStoreClass<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>,
  snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  dataItems: RealtimeDataItem<T, K, Meta, ExcludedFields>[],
  newData: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  timestamp: Date,
  payload: UpdateSnapshotPayload<T>,
  category: Category | undefined,
  categoryProperties: CategoryProperties | undefined,
  payloadData: T | K,
  mappedSnapshotData: Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
  delegate: SnapshotWithCriteria<T, K, Meta, ExcludedFields>[],
  snapshotId?: string | number | null,
  storeId?: number,
  store?: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
): Promise<SnapshotDataType<T, K, Meta, ExcludedFields>> => {
  try {
    // Determine what to return based on input parameters
    if (payload?.returnType === 'map') {
      const snapshotsMap = new Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>();
      if (newData.id) {
        snapshotsMap.set(newData.id.toString(), newData);
      }
      return snapshotsMap;
    }

    if (payload?.returnType === 'store') {
      return snapshotStore;
    }

    if (payload?.returnType === 'promise') {
      return Promise.resolve({ snapshot: newData });
    }

    if (payload?.returnType === 'snapshotData') {
      // Return as SnapshotData type if needed
      return {
        getSnapshot: async () => newData,
        validate: () => true,
        transform: (snap: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => snap,
        id: "",
        storeId: 0,
        category: "",
        serialize: () => "",
        
        get: (key: string) => { },
        set: (key: string, value: any) => { },
        processEvent: (data: any, type: string, event: Event) => { },
        shared: "",
        
        operations: {} as SnapshotOperations<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
        base: {} as  BaseEntity<T, K, Meta, ExcludedFields>,
        sharedMetadata: "",

        // For RETRIEVING data (simple lookup)
        getSnapshotData?: (params: SnapshotDataParams<T, K, Meta, ExcludedFields>) => SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined,

        
        deleteSnapshot: (id: string) => {},
        core: {} as CoreSnapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
        security: {} as SnapshotSecurity, 
        storage: "",
       
        isExpired: () => false,
        data: "",
        snapshotStore: {} as SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
        timestamp: new Date(),
       
      } as SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
    }

    // Default: return undefined or based on some condition
    return undefined;

  } catch (error) {
    console.error('Error in snapshotData:', error);
    return undefined;
  }
}
  // Optional: Add a helper property if you need direct access to the data
  private _snapshotDataCache?: SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;

  // Helper method to get the actual snapshot data
  getSnapshotData(params: SnapshotDataParams<T, K, Meta, ExcludedFields>): SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined {
    return this._snapshotDataCache.get(params.id);
  }

  setSnapshotData(params: SnapshotDataParams<T, K, Meta, ExcludedFields>): void {
    this._snapshotDataCache.set(params.id, params.data);
  }
  // mappingMethods assignment
  mapSnapshots!: (
    storeIds: number[],
    snapshotId: string,
    category: Category | undefined,
    categoryProperties: CategoryProperties | undefined,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,  
    timestamp: string | number | Date | undefined,
    type: string,
    event: SnapshotEvent<T, K, Meta, ExcludedFields>,
    id: number,
    snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,  
    data: T,
    callback: (
      storeIds: number[],
      snapshotId: string,
      category: Category | undefined,
      categoryProperties: CategoryProperties | undefined,
      snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,  
      timestamp: string | number | Date | undefined,
      type: string,
      event: SnapshotEvent<T, K, Meta, ExcludedFields>,
      id: number,
      snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,  
      data: K,
      index: number
    ) => SnapshotsObject<T, K, Meta, ExcludedFields>
  ) => Promise<SnapshotsArray<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>;

  mapSnapshotWithDetails!: (
    storeId: number,
    snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,  
    snapshotId: string,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,  
    type: string,
    event: SnapshotEvent<T, K, Meta, ExcludedFields>,
    callback: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void  
  ) => SnapshotWithData<T, K, Meta, ExcludedFields> | null;

  
  // ✅ Transform method stubs
    transformSubscriber!: (
    subscriberId: string, 
    sub: Subscriber<T, K, Meta, ExcludedFields>
  ) => Subscriber<T, K, Meta, ExcludedFields>;

  // ✅ You can also add the advanced utility as a method if needed
  transformSubscriberAdvanced!: typeof transformSubscriberAdvanced;
  transformSubscriberMappedAdvanced!: typeof transformSubscriberMappedAdvanced

   transformSubscriberMapped!: <
    U extends BaseDataEntity = T,
    V extends U = U,
    Meta2 = DefaultMeta<U, V>,
    ExcludedFields2 extends keyof U = DefaultExcludedFields<U>
  >(
    subscriberId: string,
    sub: Subscriber<U, V, Meta2, ExcludedFields2>
  ) => Subscriber<T, K, Meta, ExcludedFields>;

  transformDelegate!: <
    T extends BaseDataEntity,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>
  >(
    delegate: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
    transformSubscriberFn: (sub: Subscriber<T, K, Meta, ExcludedFields>) => Subscriber<T, K, Meta, ExcludedFields>,
    subscribers: Subscriber<T, K, Meta, ExcludedFields>[],
    snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ) => Promise<SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>;

  transformMappedData!: <
    T extends BaseDataEntity,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>
  >(
    value: T | Partial<T> 
  ) => T;

  transformConfigOption!: <
    T extends BaseDataEntity,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>
  >(
    option: Partial<SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> | string | null | undefined
  ) => SnapshotStoreConfigWithCore<T, K, Meta, ExcludedFields> | string | null;


  unsubscribe!: (callback: Function) => void;

  subscribeToSnapshots!: (
    snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshotId: string,
    snapshotData: SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    category: Category | undefined,
    snapshotConfig: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    callback: (
      snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      snapshots: SnapshotsArray<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
    ) => Subscriber<T, K, Meta, ExcludedFields> | null,
    snapshots: SnapshotsArray<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    unsubscribe?: UnsubscribeDetails  
  ) => SnapshotsArray<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | [] 

  // Hybrid signatures (typing only)
  restoreSnapshot!: (
    id: string,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshotId: string,
    snapshotData: SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    savedState: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    category: Category | undefined,
    callback: (snapshot: T) => void,
    snapshots: SnapshotsArray<T, K, Meta, ExcludedFields>,
    type: string,
    event: string | SnapshotEvents<T, K, Meta, ExcludedFields>,
    subscribers?: SubscriberCollection<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshotContainer?: SnapshotContainerType<T, K, Meta, ExcludedFields>,
    snapshotStoreConfig?: SnapshotStoreConfig<SnapshotUnion<BaseData, Meta>, K> | undefined
  ) => void;
  
  // Subscription methods
  subscribe!: (
    snapshotId: string | number | null,
    unsubscribe: UnsubscribeDetails,
    subscriber: Subscriber<T, K, Meta, ExcludedFields> | null,
    data: T,
    event: SnapshotEvent<T, K, Meta, ExcludedFields>,
    callback: Callback<SnapshotContext<T, K, Meta, ExcludedFields>>,
    value: T
  ) => [] | SnapshotsArray<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
    
  subscribeSimple(
    callback: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void
  ): () => void {
  // Create a mock snapshot for type consistency
  const mockSnapshot = {
    id: 'global_listener',
    timestamp: new Date(),
    data: {} as T,
    metadata: {} as Meta
  } as Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;

  // Use your existing subscribe method and wrap it to return unsubscribe function
  const subscriptionResult = this.subscribe(
    null,                        // Listen globally (no specific snapshotId)
    { 
      type: "simple",
      id: `simple_${Date.now()}`,
      events: ['update', 'add', 'change']
    },          
    {
      id: `sub_${Date.now()}`,
      callback: callback,
      timestamp: new Date()
    },                        
    mockSnapshot,                
    "snapshotUpdated",          
    callback,                    
    mockSnapshot                 
  );

  // Return a proper unsubscribe function
  return () => {
    // If subscribe returns an array with unsubscribe functionality
    if (Array.isArray(subscriptionResult)) {
      // Look for an unsubscribe method in the array
      const unsubscribeFn = subscriptionResult.find((item: any) => 
        typeof item === 'function' && item.name === 'unsubscribe'
      );
      
      if (unsubscribeFn) {
        unsubscribeFn();
      } else {
        // If no unsubscribe function found, try to remove by ID
        const subscriberId = `sub_${Date.now()}`;
        this.removeSubscriber(subscriberId);
      }
    } 
    // If subscribe returns an object with unsubscribe method
    else if (subscriptionResult && typeof subscriptionResult.unsubscribe === 'function') {
      subscriptionResult.unsubscribe();
    }
    // If subscribe returns a function directly
    else if (typeof subscriptionResult === 'function') {
      subscriptionResult();
    }
    // Fallback: manual cleanup
    else {
      console.warn('Could not find unsubscribe method, performing manual cleanup');
      this.removeSubscriber(`sub_${Date.now()}`);
    }
  };
}


// Add these properties to your class
private actionMetrics: {
  totalActions: number;
  successfulActions: number;
  failedActions: number;
  actionTypes: Map<string, { 
    count: number; 
    totalDuration: number; 
    successes: number; 
    failures: number; 
  }>;
  lastActionTime: number;
  averageActionDuration: number;
  peakActionDuration: number;
  actionDurations: number[];
} = {
  totalActions: 0,
  successfulActions: 0,
  failedActions: 0,
  actionTypes: new Map(),
  lastActionTime: 0,
  averageActionDuration: 0,
  peakActionDuration: 0,
  actionDurations: []
};

// Properly typed action subscribers
private actionSubscribers: Set<{
  callback: (action: any, result?: any, error?: Error) => void;
  filter?: string[];
}> = new Set();

// Global subscribers with proper typing
private globalSubscribers: Map<string, Subscriber<T, K, Meta, ExcludedFields>> = new Map();

/**
 * Update action metrics
 */
private updateActionMetrics(
  actionType: string,
  duration: number,
  success: boolean
): void {
  // Update basic counters
  this.actionMetrics.totalActions++;
  if (success) {
    this.actionMetrics.successfulActions++;
  } else {
    this.actionMetrics.failedActions++;
  }
  this.actionMetrics.lastActionTime = Date.now();

  // Update duration metrics
  this.actionMetrics.actionDurations.push(duration);
  if (this.actionMetrics.actionDurations.length > 1000) {
    this.actionMetrics.actionDurations.shift(); // Keep only last 1000
  }
  
  this.actionMetrics.averageActionDuration = 
    this.actionMetrics.actionDurations.reduce((sum, d) => sum + d, 0) / 
    this.actionMetrics.actionDurations.length;
  
  this.actionMetrics.peakActionDuration = Math.max(
    this.actionMetrics.peakActionDuration,
    duration
  );

  // Update action type specific metrics
  if (!this.actionMetrics.actionTypes.has(actionType)) {
    this.actionMetrics.actionTypes.set(actionType, {
      count: 0,
      totalDuration: 0,
      successes: 0,
      failures: 0
    });
  }

  const typeMetrics = this.actionMetrics.actionTypes.get(actionType)!;
  typeMetrics.count++;
  typeMetrics.totalDuration += duration;
  
  if (success) {
    typeMetrics.successes++;
  } else {
    typeMetrics.failures++;
  }
}



  private processAction(action: any): void {
  // Validate action structure
  if (!action || typeof action !== 'object') {
    throw new Error('Action must be a valid object');
  }

  if (typeof action.type !== 'string') {
    throw new Error('Action must have a string type property');
  }

  // Process action based on type
  switch (action.type) {
    case 'SNAPSHOT_ADD':
      this.processAddSnapshotAction(action);
      break;

    case 'SNAPSHOT_UPDATE':
      this.processUpdateSnapshotAction(action);
      break;

    case 'SNAPSHOT_REMOVE':
      this.processRemoveSnapshotAction(action);
      break;

    case 'SNAPSHOT_BATCH':
      this.processBatchSnapshotAction(action);
      break;

    case 'CONFIG_UPDATE':
      this.processConfigUpdateAction(action);
      break;

    case 'SUBSCRIPTION_ADD':
      this.processAddSubscriptionAction(action);
      break;

    case 'SUBSCRIPTION_REMOVE':
      this.processRemoveSubscriptionAction(action);
      break;

    case 'METADATA_UPDATE':
      this.processMetadataUpdateAction(action);
      break;

    case 'CACHE_CLEAR':
      this.processCacheClearAction(action);
      break;

    case 'VALIDATION_TRIGGER':
      this.processValidationAction(action);
      break;

    case 'SYNC_TRIGGER':
      this.processSyncAction(action);
      break;

    case 'IDLE_TIMEOUT_UPDATE':
      this.processIdleTimeoutAction(action);
      break;

    case 'TRANSACTION_BEGIN':
      this.processTransactionBeginAction(action);
      break;

    case 'TRANSACTION_COMMIT':
      this.processTransactionCommitAction(action);
      break;

    case 'TRANSACTION_ROLLBACK':
      this.processTransactionRollbackAction(action);
      break;

    case 'METRICS_RESET':
      this.processMetricsResetAction(action);
      break;

    case 'EVENT_EMIT':
      this.processEventEmitAction(action);
      break;

    default:
      // Try to handle custom actions or throw error
      if (action.type.startsWith('CUSTOM_')) {
        this.processCustomAction(action);
      } else {
        throw new Error(`Unknown action type: ${action.type}`);
      }
      break;
  }

  // Update last processed action timestamp
  this.lastProcessedActionTime = Date.now();
}


  private emitEvent(params: Partial<{
  event: string;
  snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  snapshotId: string;
  subscribers: SubscriberCollection<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  type: string;
  snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  dataItems: RealtimeDataItem<T, K, Meta, ExcludedFields>[];
  criteria: SnapshotWithCriteriaAsBase<T, K, Meta, ExcludedFields>;
  category: symbol | string | Category | undefined;
}>) {
  const {
    event = 'unknown',
    snapshot,
    snapshotId = snapshot?.id || '',
    subscribers = {},
    type = '',
    snapshotStore = this,
    dataItems = [],
    criteria = {} as any,
    category,
  } = params;

  this.emit(event, snapshot!, snapshotId, subscribers, type, snapshotStore, dataItems, criteria, category);
}
// Helper methods for each action type
private processAddSnapshotAction(action: any): void {
  const { payload } = action;
  if (!payload || !payload.snapshot) {
    throw new Error('SNAPSHOT_ADD action requires payload with snapshot');
  }

  this.addSnapshot(
    payload.snapshot,
    payload.snapshotId,
    payload.subscribers
  );

  // Emit event
  this.emitEvent({
    event: 'snapshotAdded',
    snapshot: payload.snapshot,
    snapshotId: payload.snapshotId,
    subscribers: payload.subscribers,
    type: 'add'
  });
}

private processUpdateSnapshotAction(action: any): void {
  const { payload } = action;
  if (!payload || (!payload.snapshotId && !payload.snapshot?.id)) {
    throw new Error('SNAPSHOT_UPDATE action requires snapshotId or snapshot with id');
  }

  this.updateSnapshot(
    payload.snapshotId || payload.snapshot.id,
    payload.params,
    payload.data,
    payload.snapshot,
    payload.timestamp || new Date(),
    payload.category,
    payload.events,
    payload.snapshotStore,
    payload.dataItems,
    payload.payloadData,
    payload.mappedSnapshotData,
    payload.delegate,
    payload.payload,
    payload.store,
    payload.callback
  );

  this.emitEvent({
    event: 'snapshotUpdated',
    snapshot: payload.snapshot,
    snapshotId: payload.snapshotId || payload.snapshot.id,
    subscribers: payload.subscribers,
    type: 'update'
  });
}

private processRemoveSnapshotAction(action: any): void {
  const { payload } = action;
  if (!payload || !payload.snapshotId) {
    throw new Error('SNAPSHOT_REMOVE action requires snapshotId');
  }

  this.removeSnapshot(payload.snapshotId);

  this.emitEvent({
    event: 'snapshotRemoved',
    snapshotId: payload.snapshotId,
    type: 'remove'
  });
}

private processBatchSnapshotAction(action: any): void {
  const { payload } = action;
  if (!payload || !Array.isArray(payload.operations)) {
    throw new Error('SNAPSHOT_BATCH action requires operations array');
  }

  this.processBatch(payload.operations, payload.options);

  this.emitEvent({
    event: 'batchProcessed',
    type: 'batch',
    dataItems: payload.operations
  });
}

private processConfigUpdateAction(action: any): void {
  const { payload } = action;
  if (!payload || typeof payload.config !== 'object') {
    throw new Error('CONFIG_UPDATE action requires config object');
  }

  Object.assign(this.config, payload.config);

  this.emitEvent({
    event: 'configUpdated',
    type: 'config',
    snapshotStore: this,
    dataItems: [payload.config]
  });
}

private processAddSubscriptionAction(action: any): void {
  const { payload } = action;
  if (!payload || !payload.callback || typeof payload.callback !== 'function') {
    throw new Error('SUBSCRIPTION_ADD action requires callback function');
  }

  const unsubscribe = this.subscribeToActions(
    payload.callback,
    payload.filter
  );

  this.emitEvent({
    event: 'subscriptionAdded',
    type: 'subscription',
    snapshotId: payload.subscriberId,
    dataItems: [unsubscribe]
  });
}
private processRemoveSubscriptionAction(action: any): void {
  const { payload } = action;
  if (!payload || !payload.subscriberId) {
    throw new Error('SUBSCRIPTION_REMOVE action requires subscriberId');
  }

  this.removeSubscriber(payload.subscriberId);

  this.emitEvent({
    event: 'subscriptionRemoved',
    snapshotId: payload.subscriberId,
    type: 'subscriptionRemove',
    dataItems: [payload],
  });
}

private processMetadataUpdateAction(action: any): void {
  const { payload } = action;
  if (!payload || typeof payload.metadata !== 'object') {
    throw new Error('METADATA_UPDATE action requires metadata object');
  }

  Object.assign(this.metadata, payload.metadata);

  this.emitEvent({
    event: 'metadataUpdated',
    type: 'metadata',
    snapshotStore: this,
    dataItems: [payload.metadata],
  });
}

private processCacheClearAction(action: any): void {
  const { payload } = action;
  this.clearCache(payload?.pattern);

  this.emitEvent({
    event: 'cacheCleared',
    type: 'cache',
    dataItems: [payload?.pattern],
  });
}

private processValidationAction(action: any): void {
  const { payload } = action;
  this.validateAllSnapshots(payload?.options);

  this.emitEvent({
    event: 'validationTriggered',
    type: 'validation',
    dataItems: [payload?.options],
  });
}

private processSyncAction(action: any): void {
  const { payload } = action;
  this.syncWithRemote(payload?.force);

  this.emitEvent({
    event: 'syncTriggered',
    snapshot: payload?.snapshot,
    snapshotId: payload?.snapshotId,
    subscribers: payload?.subscribers,
    type: 'sync',
    snapshotStore: this,
    dataItems: payload?.dataItems,
    criteria: payload?.criteria,
    category: payload?.category,
  });
}

private processIdleTimeoutAction(action: { payload?: { timeoutMs?: number; enabled?: boolean } }): void {
  const { payload } = action;

  if (payload?.timeoutMs !== undefined) {
    this.startIdleTimeout(payload.timeoutMs);
  } else if (payload?.enabled === false) {
    this.stopIdleTimeout();
  } else {
    this.startIdleTimeout();
  }

  this.emitEvent({
    event: 'idleTimeoutUpdated',
    type: 'idleTimeout',
    dataItems: [payload?.timeoutMs],
  });
}

// -------------------------
// Transaction Actions
// -------------------------
private processTransactionBeginAction(action: { payload?: any }): void {
  this.beginTransaction();

  this.emitEvent({
    event: 'transactionBegin',
    type: 'transaction',
    dataItems: [action.payload],
  });
}

private processTransactionCommitAction(action: { payload?: any }): void {
  this.commitTransaction();

  this.emitEvent({
    event: 'transactionCommit',
    type: 'transaction',
    dataItems: [action.payload],
  });
}

private processTransactionRollbackAction(action: { payload?: any }): void {
  this.rollbackTransaction();

  this.emitEvent({
    event: 'transactionRollback',
    type: 'transaction',
    dataItems: [action.payload],
  });
}

// -------------------------
// Metrics Reset Action
// -------------------------
private processMetricsResetAction(action: { payload?: any }): void {
  this.actionMetrics = {
    totalActions: 0,
    successfulActions: 0,
    failedActions: 0,
    actionTypes: new Map(),
    lastActionTime: 0,
    averageActionDuration: 0,
    peakActionDuration: 0,
    actionDurations: [],
  };

  this.emitEvent({
    event: 'metricsReset',
    type: 'metrics',
    dataItems: [action.payload],
  });
}

// -------------------------
// Event Emit Action
// -------------------------
private processEventEmitAction(action: { payload?: { eventName: string; eventData?: any } }): void {
  const { payload } = action;
  if (!payload?.eventName) throw new Error('EVENT_EMIT action requires eventName');

  this.emitEvent({
    event: payload.eventName,
    type: 'event',
    dataItems: [payload.eventData],
  });
}

// -------------------------
// Custom Action
// -------------------------
private processCustomAction(action: { payload?: any; type: string }): void {
  this.emitEvent({
    event: 'customAction',
    type: 'custom',
    dataItems: [action],
  });

  if (!this.handleCustomAction) {
    console.warn(`Custom action ${action.type} received but no handler implemented`);
  }
}

// Add this property to track last processed action
private lastProcessedActionTime: number = 0;

/**
 * Notify action subscribers
 */
private notifyActionSubscribers(
  action: any,
  result?: any,
  error?: Error
): void {
  for (const subscriber of this.actionSubscribers) {
    // Apply filter if specified
    if (subscriber.filter && !subscriber.filter.includes(action.type)) {
      continue;
    }

    try {
      subscriber.callback(action, result, error);
    } catch (callbackError) {
      console.warn('Action subscriber callback failed:', callbackError);
    }
  }
}

/**
 * Subscribe to actions
 */
subscribeToActions(
  callback: (action: any, result?: any, error?: Error) => void,
  filter?: string[]
): () => void {
  const subscriber = { callback, filter };
  this.actionSubscribers.add(subscriber);

  // Return unsubscribe function
  return () => {
    this.actionSubscribers.delete(subscriber);
  };
}

/**
 * Get action metrics
 */
getActionMetrics() {
  return {
    ...this.actionMetrics,
    actionTypes: Object.fromEntries(this.actionMetrics.actionTypes),
    successRate: this.actionMetrics.totalActions > 0 
      ? (this.actionMetrics.successfulActions / this.actionMetrics.totalActions) * 100 
      : 0
  };
}


/**
 * Action handler with pre/post processing hooks
 * Handle actions (if this is a Redux-like pattern)
 */
handleActions(action: any): void {
  const startTime = performance.now();
  
  try {
    // Process action...
    const result = this.processAction(action);
    
    // Update metrics and notify
    const duration = performance.now() - startTime;
    this.updateActionMetrics(action.type, duration, true);
    this.notifyActionSubscribers(action, result);
    
  } catch (error) {
    const duration = performance.now() - startTime;
    this.updateActionMetrics(action.type, duration, false);
    this.notifyActionSubscribers(action, undefined, error as Error);
    throw error;
  }
}

  /**
   * Core action processing logic
   */
  private processActionCore(action: any): any {
    switch (action.type) {
      case 'SNAPSHOT_ADD':
        return this.addSnapshot(action.payload);
      
      case 'SNAPSHOT_UPDATE':
        return this.updateSnapshot(action.payload);
      
      case 'SNAPSHOT_REMOVE':
        return this.removeSnapshot(action.payload);
      
      case 'BATCH_OPERATION':
        return this.processBatch(action.payload);
      
      // Add other action types as needed
      
      default:
        throw new Error(`Unknown action type: ${action.type}`);
    }
  }

  /**
   * Validate action structure
   */
  private validateAction(action: any): void {
    if (!action || typeof action !== 'object') {
      throw new Error('Action must be an object');
    }
    
    if (typeof action.type !== 'string') {
      throw new Error('Action must have a string type property');
    }
    
    // Additional validation based on action type
    if (action.type === 'SNAPSHOT_ADD' && !action.payload) {
      throw new Error('SNAPSHOT_ADD action requires payload');
    }
  }

  private validateConstructorParams(options: any, config: any) {
    if (!options) {
      throw new Error("SnapshotStore: options parameter is required");
    }
  
    if (!config) {
      throw new Error("SnapshotStore: config parameter is required");
    }

    if (typeof config.isExpired !== 'function' && config.isExpired !== undefined) {
      throw new Error("SnapshotStore: config.isExpired must be a function or undefined");
    }
  }

  clearSnapshot(): void {
    // Implementation to clear the snapshot
    this.dataItems = [];
    this.newData = null;
    // Clear any other snapshot-specific data
    console.log("Snapshot cleared");
  }

  validate(): boolean {
  this.validateConstructorParams();
  this.validateAction();
  return true; // or actual validation result
}

  constructor({
    storeId,
    name,
    version,
    schema,
    options,
    category,
    config,
    operation,
    snapshots = [],
    expirationDate,
    payload,
    callback,
    storeProps,
    endpointCategory,
    metadata,
    initialState
  }: SnapshotStoreProps<T, K, Meta, ExcludedFields>) {
    // 1. First validate required parameters exist
    if (!options) {
      throw new Error("SnapshotStore: options parameter is required");
    }
    
    if (!config) {
      throw new Error("SnapshotStore: config parameter is required");
    }

    // 2. Validate basic structure before diving into specifics
    if (typeof options !== 'object') {
      throw new Error("SnapshotStore: options must be an object");
    }

    if (typeof config !== 'object') {
      throw new Error("SnapshotStore: config must be an object");
    }

    if (!options && options === undefined) {
      throw Error("options must be provided");
    }
    
    if(config === null){
      throw new Error("config not defined")
    }
    if (config?.isExpired) {
      this.isExpired = config.isExpired;
    } else {
      this.isExpired = () => false; // Default: not expired
    }
    // ✅ Add super() call if SnapshotStore extends another class
    // If it doesn't extend anything, you don't need super()
    // super(); // Uncomment if extending a parent class
    
    this.validateConstructorParams(options, config);
    Object.assign(this, options.data);
    this.assignUtilMethods();

    this.timestamp = new Date()
    this.metadata = metadata;
    this.initializeOptions();
    this.snapshotContainers = new Map();
    this.version = version ? version : this.getVersion();

    this.config = config ? config : this.getConfig();
    const prefix = this.determinePrefix(
      options.snapshotConfig,
      options.category?.toString() ?? ""
    );
    this.id = UniqueIDGenerator.generateID(
      prefix,
      (
        options.snapshotId ||
        (isSnapshotStoreConfig(options.configOption) ? options.configOption.id : undefined) ||
        (isSnapshotStoreConfig(options.configOption) ? options.configOption.name : undefined) ||
        (isSnapshotStoreConfig(options.configOption) ? options.configOption.title : undefined) ||
        (isSnapshotStoreConfig(options.configOption) ? options.configOption.description : undefined) ||
        ""
      ).toString(),
      NotificationTypeEnum.GeneratedId
    );

    this.handleSnapshotFailure = (snapshots) => {
      console.error('Snapshot failure:', snapshots);
      // Additional logic for handling snapshot failure can be implemented here
    };

    // Initialize defaultConfigs as needed
    this.defaultConfigs = this.initializeDefaultConfigs();
    this.snapshots = snapshots;

    this.dataStores = [];
    this.setConfig(config);
    this.endpointCategory = endpointCategory;

    this.startIdleTimeout = this.startIdleTimeout.bind(this);
    this.stopIdleTimeout = this.stopIdleTimeout.bind(this);
    this.cleanup = this.cleanup.bind(this);
    this.handleActions = this.handleActions.bind(this);
    
    // Subscription/notification methods that maintain internal state
    this.subscribe = subscribe.bind(this);
    this.unsubscribe = unsubscribe.bind(this);
    this.notifySubscribers = notifySubscribers.bind(this);
    this.notify = notify.bind(this);
    
    // main 
    this.storeId = storeId;
    this.name = name;
    this.version = version;
    this.schema = schema;
    this.category = category;    this.operation = operation;
    this.expirationDate = expirationDate;
    this.payload = payload;
    this.callback = callback;
    this.storeProps = storeProps;
    this.endpointCategory = endpointCategory;
    this.initialState = initialState;
    
      // Properly handle the config with all generic parameters
    this.config = config ? config : this.getDefaultConfig();
    this.configOption = options?.configOption || null;
    
    // Initialize configs array
    this.configs = this.initializeDefaultConfigs();
    
    this.initializeOptions();


    // ✅ Bind Util Methods
    bindAllMethods(
      this,
      UtilMethods,
      [
        'deepCompare',
        'shallowCompare',
        'compareSnapshots',
        'compareSnapshotItems',
        'getEventsAsRecord',
        'getDataStoreMap',
        'determinePrefix',
        'determineCategory',
        'getAllKeys',
        'getAllValues',
        'getAllItems',
        'getSnapshotEntries',
        'getAllSnapshotEntries'
      ] as const
    );

    // ✅ Bind Data Methods
    bindAllMethods(
      this,
      DataMethods,
      [
        // List all DataMethods properties here
      ] as const
    );

    // ✅ Bind Snapshot Methods
    bindAllMethods(
      this,
      SnapshotMethods,
      [
        // List all SnapshotMethods properties here
      ] as const
    );

    // BINDED METHODS
        // ✅ Use utility function for cleaner binding
    bindAllMethods(
      this,
      SubscriptionMethods,
      [
        'addSnapshotSubscriber',
        'removeSnapshotSubscriber',
        'subscribeToSnapshot',
        'unsubscribeFromSnapshot',
        'subscribeToSnapshotsSuccess',
        'unsubscribeFromSnapshots',
        'subscribeToSnapshotList',
        'subscribeToSnapshots',
        'defaultSubscribeToSnapshot',
        'handleSubscribeToSnapshot',
        'transformSubscriber',
        'subscribe',
        'subscribeSimple',
        'defaultSubscribeToSnapshots'
      ] as const
    )

     // ✅ Bind Map Methods
    bindAllMethods(
      this,
      MapMethods,
      [
        'mapSnapshots',
        'mapSnapshotWithDetails'
      ] as const
    );

        // ✅ Bind Version Methods (ADD THIS)
    bindAllMethods(
      this,
      VersionMethods,
      [
        'getBackendVersion',
        'getFrontendVersion',
        'getDataVersions',
        'updateDataVersions'
      ] as const
    )
    // ✅ Bind Lifecycle Methods
    bindAllMethods(
      this,
      LifecycleMethods,
      [
        'set',
        'setStore',
        'onSnapshot',
        'updateState',
        'getCurrentState',
        'getStates',
        'hasSnapshots',
        'equals',
        'initializeWithData',
        'addToSnapshotList',
        'getSnapshotsBySubscriber',
        'emit',
        'removeChild',
        'getChildren',
        'hasChildren',
        'isDescendantOf',
        'getInitialState',
        'getConfigOption',
        'getTimestamp',
        'getData',
        'getStore',
        'getStores',
        'findSnapshots',
        'addStore',
        'removeStore',
        'onSnapshot',
        'createSnapshots',
        'initializeStores',
        'initializeOptions',
        'setConfig',
        'initializeDefaultConfigs',
        'ensureDelegate',
        'defaultSubscribeToSnapshots',
        'notify',
        'getSubscribers'
      ] as const
    )
  }
  
  
  public dataStore: InitializedDataStore<T, K, Meta, ExcludedFields> | undefined = undefined;
  public initialState: InitializedState<T, K, Meta, ExcludedFields>;
  
  // Util Methods
  public determinePrefix!: typeof UtilMethods.determinePrefix;
  public deepCompare!: typeof UtilMethods.deepCompare;
  public shallowCompare!: typeof UtilMethods.shallowCompare;
  public compareSnapshots!: typeof UtilMethods.compareSnapshots;
  public compareSnapshotItems!: typeof UtilMethods.compareSnapshotItems;
  public getEventsAsRecord!: typeof UtilMethods.getEventsAsRecord;
  public getDataStoreMap!: typeof UtilMethods.getDataStoreMap;
  public determineCategory!: typeof UtilMethods.determineCategory;
  public getAllKeys!: typeof UtilMethods.getAllKeys;
  public getAllValues!: typeof UtilMethods.getAllValues;
  public getAllItems!: typeof UtilMethods.getAllItems;
  public getSnapshotEntries!: typeof UtilMethods.getSnapshotEntries;
  public getAllSnapshotEntries!: typeof UtilMethods.getAllSnapshotEntries;



  // Declare SubscriptionMethods functions
  public addSnapshotSubscriber!: typeof SubscriptionMethods.addSnapshotSubscriber;
  public removeSnapshotSubscriber!: typeof SubscriptionMethods.removeSnapshotSubscriber;
  public subscribeToSnapshot!: typeof SubscriptionMethods.subscribeToSnapshot;
  public unsubscribeFromSnapshot!: typeof SubscriptionMethods.unsubscribeFromSnapshot;
  public subscribeToSnapshotsSuccess!: typeof SubscriptionMethods.subscribeToSnapshotsSuccess;
  public unsubscribeFromSnapshots!: typeof SubscriptionMethods.unsubscribeFromSnapshots;
  public subscribeToSnapshotList!: typeof SubscriptionMethods.subscribeToSnapshotList;
  public subscribeToSnapshots!: typeof SubscriptionMethods.subscribeToSnapshots;
  public defaultSubscribeToSnapshot!: typeof SubscriptionMethods.defaultSubscribeToSnapshot;
  public handleSubscribeToSnapshot!: typeof SubscriptionMethods.handleSubscribeToSnapshot;
  public transformSubscriber!: typeof SubscriptionMethods.transformSubscriber;
  public subscribe!: typeof SubscriptionMethods.subscribe;
  public subscribeSimple!: typeof SubscriptionMethods.subscribeSimple;
  public defaultSubscribeToSnapshots!: typeof SubscriptionMethods.defaultSubscribeToSnapshots;
  /**
   * Contracted method: find by id (synchronous-ish).
   * This just searches locally within resolved configs.
   */
  public find(id: string): SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined {
    const maybeConfigs = (this as any).snapshotConfig as SnapshotStoreConfig<
      T,
      K,
      Meta,
      ExcludedFields
    >[] | undefined;
    if (!maybeConfigs) return undefined;
    return maybeConfigs.find(cfg => String(cfg.id) === id);
  }

  /**
   * Predicate-based search powered by API
   */
  public async findByQuery(
    query: string
  ): Promise<SearchResult<T, K, Meta, ExcludedFields>[]> {
    return await searchAPI<T, K, Meta, ExcludedFields>(query);
  }
  
  public createdAt?: string | Date | undefined
  public parentSnapshotStore?: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  public content?: string | Content<T, K, Meta, ExcludedFields>;
  public data: InitializedData<T, K, Meta, ExcludedFields> | null = null;
  public snapshotCategory?: SnapshotCategory<T, K, Meta, ExcludedFields>; // Replace 'any' with proper type
  public subscriberId?: string | undefined = undefined;

  public getDataStores(): ReadonlyArray<DataStore<T, K, Meta, ExcludedFields>> {
    return this.dataStores.slice(); // Return copy
  }

  public addDataStore(store: DataStore<T, K, Meta, ExcludedFields>): void {
    this.dataStores.push(store);
    // Add any validation/cleanup logic here
  }

  #snapshotStores: Map<number, SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> = new Map();
    // Define defaultConfigs property
  private items: K[] = [];
  private unsubscribeEvents: Map<string, UnsubscribeEvent<T, K>> = new Map();
  private assignUtilMethods(): void {
    // Assign each method individually
    this.determinePrefix = UtilMethods.determinePrefix.bind(this);
    this.deepCompare = UtilMethods.deepCompare.bind(this);
    this.shallowCompare = UtilMethods.shallowCompare.bind(this);
    this.compareSnapshots = UtilMethods.compareSnapshots.bind(this);
    this.compareSnapshotItems = UtilMethods.compareSnapshotItems.bind(this);
    this.getEventsAsRecord = UtilMethods.getEventsAsRecord.bind(this);
    this.getDataStoreMap = UtilMethods.getDataStoreMap.bind(this);
    this.determineCategory = UtilMethods.determineCategory.bind(this);
    this.getAllKeys = UtilMethods.getAllKeys.bind(this);
    this.getAllValues = UtilMethods.getAllValues.bind(this);
    this.getAllItems = UtilMethods.getAllItems.bind(this);
    this.getSnapshotEntries = UtilMethods.getSnapshotEntries.bind(this);
    this.getAllSnapshotEntries = UtilMethods.getAllSnapshotEntries.bind(this);
  }
  private version: Version<T, K, Meta, ExcludedFields> | string | number;
  private schema: string | Record<string, SchemaField>;
  private dataStores: DataStore<T, K, Meta, ExcludedFields>[];
  private snapshotItems: SnapshotItem<T, K, Meta, ExcludedFields>[] = [];
  private nestedStores: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] = [];
  private configs: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] = [];
  private defaultConfigs: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] = []; 

  private payload: Payload | undefined = undefined
  private callback: (data: T) => void
  private storeProps: Partial<SnapshotStoreProps<T, K, Meta, ExcludedFields>> = {};
  private endpointCategory: string = "";


  // Idle timeout properties
  private idleTimeoutId: NodeJS.Timeout | null = null;
  private idleTimeoutDuration: number = 300000; // 5 minutes default
  private lastActivityTimestamp: number = Date.now();
  private isIdle: boolean = false;
  private idleCallbacks: Array<() => void> = [];
  private activityCallbacks: Array<() => void> = [];
  private configMethods: ConfigMethods<T, K, Meta, ExcludedFields>;

  
   /**
   * Stores unsubscribe events for analytics, auditing, and debugging
   */
  storeUnsubscribeEvent(details: UnsubscribeDetails): void {
    const eventId = `unsubscribe-${details.userId}-${details.snapshotId}-${Date.now()}`;
    
    const unsubscribeEvent: UnsubscribeEvent<T, K> = {
      ...details,
      id: eventId,
      storedAt: new Date(),
      storeId: this.storeId,
      category: this.category,
      metadata: {
        appVersion: process.env.APP_VERSION,
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'server',
        timestamp: new Date().toISOString()
      }
    };

    // Store in memory
    this.unsubscribeEvents.set(eventId, unsubscribeEvent);

    // Optional: Persist to localStorage or database
    this.persistUnsubscribeEvent(unsubscribeEvent);

    // Optional: Send to analytics service
    this.sendToAnalytics(unsubscribeEvent);

    console.log(`Stored unsubscribe event: ${eventId}`);
  }

  /**
   * Persists unsubscribe event to localStorage (client-side) or database
   */
  private persistUnsubscribeEvent(event: UnsubscribeEvent<T, K>): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const existingEvents = JSON.parse(localStorage.getItem('unsubscribeEvents') || '[]');
        const updatedEvents = [...existingEvents, event].slice(-1000); // Keep last 1000 events
        localStorage.setItem('unsubscribeEvents', JSON.stringify(updatedEvents));
      }
      // For server-side, you would save to database here
    } catch (error) {
      console.warn('Failed to persist unsubscribe event:', error);
    }
  }

  /**
   * Sends unsubscribe event to analytics service
   */
  private sendToAnalytics(event: UnsubscribeEvent<T, K>): void {
    // Example: Send to analytics service like Google Analytics, Mixpanel, etc.
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'unsubscribe', {
        user_id: event.userId,
        snapshot_id: event.snapshotId,
        unsubscribe_type: event.unsubscribeType,
        unsubscribe_reason: event.unsubscribeReason,
        // ... other analytics data
      });
    }
  }

  // Optional: Cleanup method for removing subscribers
  removeSnapshotSubscriber(snapshotId: string, callback: Function): boolean {
    if (!this.snapshotSubscribers || !this.snapshotSubscribers.has(snapshotId)) {
      return false;
    }
    
    const subscribers = this.snapshotSubscribers.get(snapshotId)!;
    const initialLength = subscribers.length;
    this.snapshotSubscribers.set(
      snapshotId, 
      subscribers.filter(sub => sub.callback !== callback)
    );
    
    return subscribers.length < initialLength;
  }

  /**
   * Retrieves unsubscribe events for a user or snapshot
   */
  getUnsubscribeEvents(options?: {
    userId?: string;
    snapshotId?: string;
    startDate?: Date;
    endDate?: Date;
  }): UnsubscribeEvent<T, K>[] {
    const events = Array.from(this.unsubscribeEvents.values());
    
    return events.filter(event => {
      if (options?.userId && event.userId !== options.userId) return false;
      if (options?.snapshotId && event.snapshotId !== options.snapshotId) return false;
      if (options?.startDate && event.storedAt < options.startDate) return false;
      if (options?.endDate && event.storedAt > options.endDate) return false;
      return true;
    }).sort((a, b) => b.storedAt.getTime() - a.storedAt.getTime());
  }

  /**
   * Cleans up old unsubscribe events
   */
  cleanupUnsubscribeEvents(maxAgeDays: number = 30): void {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - maxAgeDays);
    
    Array.from(this.unsubscribeEvents.entries()).forEach(([id, event]) => {
      if (event.storedAt < cutoffDate) {
        this.unsubscribeEvents.delete(id);
      }
    });

    // Also clean up localStorage
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const events = JSON.parse(localStorage.getItem('unsubscribeEvents') || '[]');
        const filteredEvents = events.filter((event: any) => 
          new Date(event.storedAt) >= cutoffDate
        );
        localStorage.setItem('unsubscribeEvents', JSON.stringify(filteredEvents));
      } catch (error) {
        console.warn('Failed to cleanup localStorage events:', error);
      }
    }
  }

  protected eventRecords: Record<string, EventRecord<T, K, Meta, ExcludedFields>[]> = {};
  protected records: Record<string, CalendarManagerStoreClass<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]> = {};
  protected callbacks: Record<string, ((snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void)[]> = {};
  protected subscribers: Subscriber<T, K, Meta, ExcludedFields>[] = [];
  protected eventIds: string[] = [];

  // ✅ Event methods (implement the interface)
  public on = (
    event: string | number,
    callback: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void
  ): void => {
    const eventKey = String(event);
    if (!this.callbacks[eventKey]) {
      this.callbacks[eventKey] = [];
    }
    this.callbacks[eventKey].push(callback);
  };

  public off = (
    event: string | number,
    callback: Callback<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>, 
    snapshotId: string,
    subscribers: SubscriberCollection<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    type: string,
    snapshotData: SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    unsubscribeDetails?: { 
      userId: string; 
      snapshotId: string; 
      unsubscribeType: string; 
      unsubscribeDate: Date; 
      unsubscribeReason: string; 
      unsubscribeData: any; 
    } | undefined
  ): void => {
    const eventKey = String(event);
    const callbacks = this.callbacks[eventKey];
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index !== -1) {
        callbacks.splice(index, 1);
      }
    }
  };
  protected dataStoreMethods: DataStoreWithSnapshotMethods<T, K, Meta, ExcludedFields> | null = null;
  
  protected config: Promise<SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null>;
  
  // Protected methods for internal/mixin access
  protected getConfigInternal(): Promise<SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null> {
    return this.config;
  }
  
  protected setConfigInternal(config: Promise<SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null>): void {
    this.config = config;
  }

 
  snapshotContainer: SnapshotContainer<T, K, Meta, ExcludedFields> | null = null;
  snapshotContainers?: Map<string, SnapshotContainer<T, K, Meta, ExcludedFields>>;

  // ----------------
  // Configuration Methods 
  // ----------------

    /**
   * Get default configuration with proper typing
   */
  private getDefaultConfig(): Promise<SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null> {
    return Promise.resolve({
      id: "default",
      storeId: this.storeId,
      autoSave: true,
      syncInterval: 300000,
      snapshotLimit: 100,
      // Include all required properties with proper types
    } as SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>);
  }


  private filterInvalidSnapshots(
    snapshotId: string,
    state: Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>
  ): Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> {
    return new Map(
      [...state.entries()].filter(([_, snapshot]) =>
        this.validateSnapshot(snapshhotId, snapshot)
      )
    );
  }

  // Helper to notify subscribers about deletion
  private notifySubscribers(event: {
    type: 'delete';
    snapshotId: string;
    permanent: boolean;
  }): void {
    this.subscribers.forEach(subscriber => {
      if (subscriber.onDelete) {
        try {
          subscriber.onDelete(event);
        } catch (err) {
          console.error('Error in delete subscriber:', err);
        }
      }
    });
  }


  
  // ✅ PUBLIC override - extends the mixed-in functionality
  public updateState(newState: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): void {
    // Call the mixed-in method
    LifecycleMethods.updateState.call(this, newState);
    
    // Add your specific logic
    this.lastUpdated = new Date();
  }

  /**
   * Get configuration with proper async handling and type safety
   */
  public async getConfig(): Promise<SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null> {
    try {
      const config = await this.config;
      return config;
    } catch (error) {
      console.error('Error retrieving config:', error);
      return null;
    }
  }


// Add this method for snapshot-specific configuration
public async getSnapshotConfig(snapshotId: string): Promise<SnapshotConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null> {
  try {
    const fullConfig = await this.getConfig();
    return fullConfig?.snapshots?.[snapshotId] || null; // Adjust based on your config structure
  } catch (error) {
    console.error('Error retrieving snapshot config:', error);
    return null;
  }
}



  // Getter for payload
  public getPayload(): Payload | undefined {
    return this.payload;
  }

  // Getter for callback
  public getCallback(): ((data: T) => void) | undefined {
    return this.callback;
  }

  // Getter for storeProps
  public getStoreProps(): Partial<SnapshotStoreProps<T, K, Meta, ExcludedFields>> {
    return this.storeProps;
  }

  // Getter for endpointCategory
  public getEndpointCategory(): string {
    return this.endpointCategory;
  }

  // You can also add setters if needed
  public setPayload(payload: Payload): void {
    this.payload = payload;
  }

  public setCallback(callback: (data: T) => void): void {
    this.callback = callback;
  }

  public setStoreProps(storeProps: Partial<SnapshotStoreProps<T, K, Meta, ExcludedFields>>): void {
    this.storeProps = storeProps;
  }

  public setEndpointCategory(category: string): void {
    this.endpointCategory = category;
  }

  // New flatMap method
  public flatMap<R extends Iterable<any>>(
    callback: (
      value: SnapshotStoreConfig<R, K>,
      index: number,
      array: SnapshotStoreConfig<R, K>[]
    ) => R
  ): R extends (infer I)[] ? I[] : R[] {
    const result = [] as unknown as R extends (infer I)[] ? I[] : R[];
    if (this.snapshotStoreConfig) {
      this.snapshotStoreConfig.forEach(
        (
          delegateItem: SnapshotStoreConfig<R, K>,
          i: number,
          arr: SnapshotStoreConfig<R, K>[]
        ) => {
          const mappedValues = callback(delegateItem, i, arr);
          result.push(
            ...(mappedValues as unknown as (R extends (infer I)[] ? I : U)[])
          );
        }
      );
    } else {
      console.error("snapshotStoreConfig is undefined");
    }
    return result;
  }
  
  public getName(): string {
    return this.name;
  }

  // Get the version (now it can return either a Version<T, K, Meta, ExcludedFields> or a string)
  public getVersion(): Version<T, K, Meta, ExcludedFields> | string {
    return this.version;
  }

  // Update the version (accepts either a Version<T, K, Meta, ExcludedFields> or a string)
  public updateVersion(newVersion: Version<T, K, Meta, ExcludedFields> | string): void {
    this.version = newVersion;
  }

  public getSchema(): string | Record<string, SchemaField> {
    return this.schema;
  }

  public getSnapshotStoreConfig(): Promise<SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> {
    return this.config;
  }

  /**
   * Set configuration with proper typing
   */
  protected async setConfig(
    config: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | Promise<SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null>
  ): Promise<void> {
    console.log('Base SnapshotStore setConfig called.');
    this.config = Promise.resolve(config);
    await this.initializeOptions();
  }

  /**
   * Get all configs with proper typing
   */
  public getConfigs(): SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] {
    return this.configs;
  }

  /**
   * Add a new config with proper typing
   */
  public addConfig(config: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): void {
    this.configs.push(config);
  }

  /**
   * Find config by ID with proper typing
   */
  public findConfigById(id: string): SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined {
    return this.configs.find(config => config.id === id);
  }

  /**
   * Update config option with proper typing
   */
  public updateConfigOption(
    newConfigOption: 
      | string
      | SnapshotConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
      | SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
      | null
  ): void {
    this.configOption = newConfigOption;
    
    // If it's a full config, also add it to configs array
    if (newConfigOption && typeof newConfigOption !== 'string') {
      const existingIndex = this.configs.findIndex(config => 
        'id' in newConfigOption && config.id === (newConfigOption as any).id
      );
      
      if (existingIndex !== -1) {
        this.configs[existingIndex] = newConfigOption as SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
      } else {
        this.configs.push(newConfigOption as SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>);
      }
    }
  }



  async removeItem(key: string): Promise<void> {
    if (this.dataStoreMethods === undefined || this.dataStoreMethods === null) {
      return Promise.reject(new Error("DataStoreMethods is undefined or null"));
    }
    try {
      await this.dataStoreMethods.removeItem(key);
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(new Error("Failed to remove item"));
    }
  }


  getSnapshotSuccess(
    snapshot: Snapshot<SnapshotUnion<BaseData, Meta>, T>,
    subscribers: Subscriber<T, K, Meta, ExcludedFields>[]
  ): Promise<SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> {
    if (this.delegate && this.delegate.length > 0) {
      for (const delegateConfig of this.delegate) {
        if (
          delegateConfig &&
          typeof delegateConfig.getSnapshotSuccess === "function"
        ) {
          return delegateConfig.getSnapshotSuccess(snapshot, subscribers);
        }
      }
      throw new Error("No valid delegate found for getSnapshotSuccess");
    } else {
      throw new Error("Delegate is undefined or empty");
    }
  }

  getSnapshotId(key: string | SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): Promise<string | undefined> {
    if (this.delegate && this.delegate.length > 0) {
      for (const delegateConfig of this.delegate) {
        if (
          delegateConfig &&
          typeof delegateConfig.getSnapshotId === "function"
        ) {
          // Check if 'key' is of type 'SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>' before passing it to 'getSnapshotId'
          if (typeof key !== "string") {
            return Promise.resolve(delegateConfig.getSnapshotId(key));
          }
        }
      }
      throw new Error("No valid delegate found for getSnapshotId");
    } else {
      throw new Error("Delegate is undefined or empty");
    }
  }

  async getSnapshotArray(): Promise<Array<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>> {
    if (this.delegate && this.delegate.length > 0) {
      for (const delegateConfig of this.delegate) {
        if (
          delegateConfig &&
          typeof delegateConfig.getSnapshots === "function"
        ) {
          const result = await delegateConfig.getSnapshots(
            this.category,
            this.snapshots
          );

          // Check if 'result' exists and contains an array of snapshots
          if (result && Array.isArray(result.snapshots)) {
            const snapshots = result.snapshots;

            // Check if the snapshots are of type Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
            if (
              snapshots.every((snapshot: any) =>
                this.isCompatibleSnapshot(snapshot)
              )
            ) {
              return Promise.resolve(snapshots as Array<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>);
            } else {
              throw new Error(
                "Incompatible snapshot types returned from delegate"
              );
            }
          } else {
            throw new Error("Unexpected format of snapshots from delegate");
          }
        }
      }
      throw new Error("No valid delegate found for getSnapshotArray");
    } else {
      throw new Error("Delegate is undefined or empty");
    }
  }

  async getItem(key: T): Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined> {
    // Check if the dataStore is available and try to get the item from it
    if (this.dataStore) {
      const item = this.dataStore.get(key);
      if (item) {
        return item;
      }
    }

    // If dataStore is not available, try to fetch the snapshot from delegate
    try {
      const snapshotId = await this.getSnapshotId({
        key,
        createdAt: undefined,
        updatedAt: undefined,
        // id: "",
        title: "",
        description: "",
        status: StatusType.Active,
        category: currentCategory,
        timestamp: undefined,
        subscribers: [],
        snapshotStore: this,
        data: undefined,
      });

      if (typeof snapshotId !== "string") {
        return undefined;
      }

      const transformedDelegate = this.transformDelegate();
      const snapshot = await this.fetchSnapshot(snapshotId, callback);

      if (snapshot) {
        const item = snapshot.getItem
          ? snapshot.getItem(key)
          : snapshot.data?.get(key);
        return item as Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined;
      }
    } catch (error) {
      console.error("Error fetching snapshot:", error);
    }

    // Return undefined if item is not found or an error occurred
    return undefined;
  }

  setItem(key: T, value: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): Promise<void> {
    
    if (this.dataStore) {
      this.dataStore.set(key, value);
    }
    return Promise.resolve();
  }

  addSnapshotFailure(
    date: Date,
    snapshotManager: SnapshotManager<T, K, Meta, ExcludedFields>,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    payload: { error: Error }
  ): void {
    notify(
      `${error.message}`,
      `Snapshot added failed fully.`,
      "Error",
      new Date(),
      NotificationTypeEnum.ERROR,
      NotificationPosition.TopRight
    );
  }

  getDataStore(): Promise<InitializedDataStore> {
    if(!this.dataStore){
      throw Error("dataStore is not initialized")
    }
    return this.dataStore;
  }

  addSnapshotSuccess(
    snapshot: T,
    subscribers: SubscriberCollection<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ): void {
    if (!this.delegate) {
      console.error("Delegate is undefined or empty.");
      return;
    }

    const index = this.delegate.findIndex(
      (snapshotStore) =>
        snapshotStore.id === snapshot.id &&
        snapshotStore.category === snapshot.category &&
        snapshotStore.key === snapshot.key &&
        snapshotStore.topic === snapshot.topic &&
        snapshotStore.priority === snapshot.priority &&
        snapshotStore.tags === snapshot.tags &&
        snapshotStore.metadata === snapshot.metadata &&
        snapshotStore.status === snapshot.status &&
        snapshotStore.isCompressed === snapshot.isCompressed &&
        snapshotStore.expirationDate === snapshot.expirationDate &&
        snapshotStore.timestamp === snapshot.timestamp &&
        snapshotStore.data === snapshot.data &&
        this.compareSnapshotState(
          snapshotStore.state as Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null,
          snapshot.state
        )
    );

    if (index !== -1) {
      this.delegate[index].addSnapshotSuccess(snapshot, subscribers);

      notify(
        `${snapshot.id}`,
        `Snapshot ${snapshot.id} added successfully.`,
        "Success",
        new Date(),
        NotificationTypeEnum.SUCCESS,
        NotificationPosition.TopRight
      );
    } else {
      // Handle case where snapshotStore matching snapshot is not found
      console.error(`SnapshotStore matching ${snapshot.id} not found.`);
    }
  }


  getDataStoreMethods(): DataStoreMethods<T, K, Meta, ExcludedFields> {
    return {
      addData: this.addData.bind(this),
      getItem: this.getItem.bind(this),
      removeData: this.removeData.bind(this),
      category: this.category as string,
      dataStoreMethods: this.dataStoreMethods as DataStoreMethods<T, K, Meta, ExcludedFields>,
      initialState: this.initialState ? this.initialState : null,
      updateData: this.updateData.bind(this),
      updateDataTitle: this.updateDataTitle.bind(this),
      updateDataDescription: this.updateDataDescription.bind(this),
      addDataStatus: this.addDataStatus.bind(this),
      updateDataStatus: this.updateDataStatus.bind(this),
      addDataSuccess: this.addDataSuccess.bind(this),
      getDataVersions: this.getDataVersions.bind(this),
      updateDataVersions: this.updateDataVersions.bind(this),
      getBackendVersion: this.getBackendVersion.bind(this),
      getFrontendVersion: this.getFrontendVersion.bind(this),
      getAllKeys: this.getAllKeys.bind(this),
      fetchData: this.fetchData.bind(this),
      setItem: this.setItem.bind(this),
      removeItem: this.removeItem.bind(this),
      getAllItems: this.getAllItems.bind(this),
      getData: this.getData.bind(this),
      addSnapshot: this.addSnapshot.bind(this),
      addSnapshotSuccess: this.addSnapshotSuccess.bind(this),
      getSnapshot: this.getSnapshot.bind(this),
      getSnapshotSuccess: this.getSnapshotSuccess.bind(this),
      getSnapshotsBySubscriber: this.getSnapshotsBySubscriber.bind(this),
      getSnapshotsBySubscriberSuccess:
        this.getSnapshotsBySubscriberSuccess.bind(this),
      getSnapshotsByTopic: this.getSnapshotsByTopic.bind(this),
      getSnapshotsByTopicSuccess: this.getSnapshotsByTopicSuccess.bind(this),
      getSnapshotsByCategory: this.getSnapshotsByCategory.bind(this),
      getSnapshotsByCategorySuccess:
        this.getSnapshotsByCategorySuccess.bind(this),
      getSnapshotsByKey: this.getSnapshotsByKey.bind(this),
      getSnapshotsByKeySuccess: this.getSnapshotsByKeySuccess.bind(this),
      getSnapshotsByPriority: this.getSnapshotsByPriority.bind(this),
      getSnapshotsByPrioritySuccess:
        this.getSnapshotsByPrioritySuccess.bind(this),
      snapshotMethods: this.snapshotMethods,
      getDelegate: this.getDelegate,
      getStoreData: this.getStoreData.bind(this),

      updateStoreData: this.updateStoreData.bind(this),
      updateDelegate: this.updateDelegate.bind(this),
      getSnapshotContainer: this.getSnapshotContainer.bind(this),
      getSnapshotVersions: this.getSnapshotVersions.bind(this),
      mapSnapshots: this.mapSnapshots.bind(this),
    };
  }

  getDelegate(context: {
    useSimulatedDataSource: boolean;
    simulatedDataSource: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
  }): Promise<DataStore<T, K, Meta, ExcludedFields>[]> {
    // Convert SnapshotStoreConfig to DataStore
    return convertToDataStore(context.simulatedDataSource)
  }

  determineCategory(
    snapshot: string | Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null | undefined
  ): string {
    if (snapshot && snapshot.store) {
      return snapshot.store.toString();
    }
    return "";
  }

  determineSnapshotStoreCategory(
    storeId: number,
    snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    configs: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]
  ): string {
    // Check if configs array is empty
    if (configs.length === 0) {
      return "";
    }

    // Example logic: Determine category based on the majority category in configs
    const categoryCount: Record<string, number> = {};

    configs.forEach((config) => {
      const category =
        typeof config.category === "string"
          ? config.category
          : (config.category as CategoryProperties)?.name;
      if (category) {
        categoryCount[category] = (categoryCount[category] || 0) + 1;
      }
    });

    // Find the category with the highest count
    let maxCategory = "";
    let maxCount = 0;

    for (const category in categoryCount) {
      if (categoryCount[category] > maxCount) {
        maxCount = categoryCount[category];
        maxCategory = category;
      }
    }

    return maxCategory;
  }

  async updateSnapshot(
    snapshotId: string | number | null,
    snapshotIdOrParams: string | number | null | UpdateSnapshotParams<T, K, Meta, ExcludedFields>,
    data: Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
    newData: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    timestamp: Date,
    category: Category | undefined,
    events?: Record<string, CalendarManagerStoreClass<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>,
    snapshotStore?: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    dataItems?: RealtimeDataItem<T, K, Meta, ExcludedFields>[],
    payloadData?: T | K,
    mappedSnapshotData?: Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
    delegate?: SnapshotWithCriteria<T, K, Meta, ExcludedFields>[],
    payload?: UpdateSnapshotPayload<T>,
    store?: SnapshotStore<any, K, Meta, ExcludedFields>,
    callback?: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void
  ): Promise<{ snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> }> {
    try {
      // Create updated snapshot data
      const updatedSnapshotData: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = {
        id: snapshotId,
        events: undefined,
        meta: {},
        data: {
          ...(snapshotStore.data || new Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>()),  
          ...newData.data, // Merge with new data
        },
        timestamp: new Date(),
        category: "update",
        length: 0,
        content: undefined,
        initialState: null,
        getSnapshotId: function (key: string | T): unknown {
          throw new Error("Function not implemented.");
        },
        compareSnapshotState: function (
          arg0: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null,
          state: any
        ): boolean {
          throw new Error("Function not implemented.");
        },
        eventRecords: null,
        snapshotStore: null,
        getParentId: function (
          id: string,
          snapshot: Snapshot<SnapshotUnion<BaseData, Meta>, T>): string | null {
          throw new Error("Function not implemented.");
        },
        getChildIds: function (
          id: string,
          childSnapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
        ): string[] {
          throw new Error("Function not implemented.");
        },
        addChild: function (
          parentId: string,
          childId: string,
          childSnapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
        ): void {
          throw new Error("Function not implemented.");
        },
        removeChild: function (
          parentId: string,
          childId: string,
          childSnapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
        ): void {
          throw new Error("Function not implemented.");
        },
        getChildren: function (
          id: string,
          childSnapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
        ): CoreSnapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] {
          throw new Error("Function not implemented.");
        },
        hasChildren: function (id: string): boolean {
          throw new Error("Function not implemented.");
        },
        isDescendantOf: function (
          childId: string,
          parentId: string,
          parentSnapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
          childSnapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
        ): boolean {
          throw new Error("Function not implemented.");
        },
        dataItems: null,
        newData: null,
        stores: null,
        getStore: function (
          storeId: number,
          snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
          snapshotId: string | null,
          snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
          snapshotStoreConfig: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
          type: string,
          event: Event
        ): SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null {
          throw new Error("Function not implemented.");
        },

        addStore: function (
          storeId: number,
          snapshotId: string,
          snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
          snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
          type: string,
          event: Event
        ): SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null {
          throw new Error("Function not implemented.");
        },
        mapSnapshot: function (
          id: number,
          storeId: string | number,
          snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
          snapshotContainer: SnapshotContainer<T, K, Meta, ExcludedFields>,
          snapshotId: string,
          criteria: CriteriaType,
          snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
          type: string,
          event: SnapshotEvent<T, K, Meta, ExcludedFields>,
          callback: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void,
          mapFn: (item: T) => T
        ): Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null {
          throw new Error("Function not implemented.");
        },
        mapSnapshotWithDetails: function (
          storeId: number,
          snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
          snapshotId: string,
          snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
          type: string,
          event: SnapshotEvent<T, K, Meta, ExcludedFields>,
          callback: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void
        ): SnapshotWithData<T, K, Meta, ExcludedFields> | null {
          throw new Error("Function not implemented.");
        },
        removeStore: function (
          storeId: number,
          store: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
          snapshotId: string,
          snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
          type: string,
          event: Event
        ): void {
          throw new Error("Function not implemented.");
        },
       
        fetchSnapshot: async (
          callback: (
            snapshotId: string,
            payload: FetchSnapshotPayload<K, Meta> | undefined,
            snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
            payloadData: T | Data,
            category: Category | undefined,
            categoryProperties: CategoryProperties | undefined,
            timestamp: Date,
            data: T,
            delegate: SnapshotWithCriteriaAsBase<T, K, Meta, ExcludedFields>[]
          ) => Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | Promise<{ snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> }>
        ): Promise<{
          id: string;
          category: Category | string | symbol | undefined; 
          categoryProperties: CategoryProperties | undefined;
          timestamp: Date;
          snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>; 
          data: T; 
          delegate: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]
         }> => {
          // Implement your fetch logic here
          throw new Error("Function not implemented.");
        },
        addSnapshotFailure: function (
          date: Date,
          snapshotManager: SnapshotManager<T, K, Meta, ExcludedFields>,
          snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
          payload: { error: Error }
        ): void {
          throw new Error("Function not implemented.");
        },
        configureSnapshotStore: function (
          snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
          storeId: number,
          data: Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
          events: Record<string, CalendarManagerStoreClass<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>,
          dataItems: RealtimeDataItem<T, K, Meta, ExcludedFields>[],
          newData: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
          payload: ConfigureSnapshotStorePayload<T, K, Meta, ExcludedFields>,
          store: SnapshotStore<any, K>,
          callback: (snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void
        ): void | null {
          throw new Error("Function not implemented.");
        },
        updateSnapshotSuccess: function (
          snapshotId: string,
          snapshotManager: SnapshotManager<T, K, Meta, ExcludedFields>,
          snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
          payload?: { data?: any }
        ): void | null {
          throw new Error("Function not implemented.");
        },
        createSnapshotFailure: function (
          date: Date,
          snapshotId: string,
          snapshotManager: SnapshotManager<T, K, Meta, ExcludedFields>,
          snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
          payload: { error: Error }
        ): Promise<void> {
          throw new Error("Function not implemented.");
        },

        createSnapshotSuccess: function (
          snapshotId: string,
          snapshotManager: SnapshotManager<T, K, Meta, ExcludedFields>,
          snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
          payload: { error: Error }
        ): void | null {
          throw new Error("Function not implemented.");
        },

        createSnapshots: function (
          id: string,
          snapshotId: string,
          snapshots: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[], // Use Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] here
          snapshotManager: SnapshotManager<T, K, Meta, ExcludedFields>,
          payload: CreateSnapshotsPayload<T, K, Meta, ExcludedFields>,
          callback: (snapshots: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]) => void | null,
          snapshotDataConfig?: SnapshotConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] | undefined,
          category?:  Category,
          categoryProperties?: string | CategoryProperties
        ): Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] | null {
          // Implement the logic for creating snapshots
          // For example, processing the snapshots array, applying transformations, etc.
          const createdSnapshots: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] = snapshots.map(
            (snapshot) => {
              // Ensure that snapshot.data is correctly typed as T | Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> | null | undefined
              const processedData:
                | T
                | Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>
                | null
                | undefined = snapshot.data
                ? { ...snapshot.data } // Properly typed data based on existing snapshot data
                : null; // Ensure null is assignable if data is undefined

              // Create or update snapshots based on payload or other logic
              return {
                ...snapshot,
                id: `${id}-${snapshotId}`, // Modify snapshot ID as needed
                data: processedData, // Assign the processed data
                // Additional processing if needed
              };
            }
          );

          // Invoke the callback with the created snapshots
          callback(createdSnapshots);

          return createdSnapshots;
        },
        onSnapshot: function (
          snapshotId: string,
          snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
          type: string,
          event: SnapshotEvent<T, K, Meta, ExcludedFields>,
          callback: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void
        ): void {
          throw new Error("Function not implemented.");
        },
        onSnapshots: function (
          snapshotId: string,
          snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
          type: string,
          event: SnapshotEvent<T, K, Meta, ExcludedFields>,
          callback: (snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void
        ): void {
          throw new Error("Function not implemented.");
        },

        handleSnapshot: function (
          id: string,
          snapshotId: string,
          snapshot: T | null,
          snapshotData: T,
          category: Category | undefined,          categoryProperties: CategoryProperties | undefined,
          callback: (snapshot: T) => void,
          snapshots: SnapshotsArray<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
          type: string,
          event: SnapshotEvent<T, K, Meta, ExcludedFields>,
          snapshotContainer?: T,
          snapshotStoreConfig?: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null
        ): Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null> {
          throw new Error("Function not implemented.");
        },
      };

      // Update snapshotStore with the new data
      if (!snapshotStore.data) {
        snapshotStore.data = new Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>(); // Initialize if needed
      }
      snapshotStore.data.set(snapshotId.toString(), updatedSnapshotData);

      // Set the updated snapshot in the store
      snapshotStore.data.set(snapshotId.toString(), updatedSnapshotData);

      console.log("Snapshot updated successfully:", snapshotStore);

      // Extract the updated snapshot from the store
      const updatedSnapshot = snapshotStore.data.get(snapshotId.toString());

      if (updatedSnapshot) {
        // Call the callback with the updated snapshot data if provided
        if (callback) {
          callback(updatedSnapshotData);
        }

        // Return the updated snapshot wrapped in a Promise
        return Promise.resolve({ snapshot: updatedSnapshot });
      } else {
        throw new Error("Snapshot not found in the store");
      }
    } catch (error) {
      console.error("Error updating snapshot:", error);
      return Promise.reject(error); // Ensure error is rejected properly
    }
  }

  updateSnapshotSuccess(): void {
    notify(
      "updateSnapshotSuccess",
      "Snapshot updated successfully.",
      "",
      new Date(),
      NotificationTypeEnum.SUCCESS,
      NotificationPosition.TopRight
    );
  }

  updateSnapshotFailure(
    snapshotId: string,
    snapshotManager: SnapshotManager<T, K, Meta, ExcludedFields>,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    date: Date | undefined,
    payload: { error: Error }
  ): void {
    // Combine properties if either is missing any
    if (!snapshotId) {
      snapshotId =
        typeof snapshot.id === "string" ? snapshot.id : "unknown_snapshot_id";
    }
    if (!date) {
      date = new Date(); // Default to the current date if no date is provided
    }

    notify(
      "updateSnapshotFailure",
      `Failed to update snapshot: ${payload.error.message}`,
      snapshotId,
      date,
      NotificationTypeEnum.ERROR,
      NotificationPosition.TopRight
    );
  }



  clearSnapshots(): void {
    this.snapshots = [];
    notify(
      "clearSnapshots",
      "All snapshots cleared.",
      "",
      new Date(),
      NotificationTypeEnum.SUCCESS,
      NotificationPosition.TopRight
    );
  }



  public safeCastSnapshotStore< T extends BaseDataEntity, 
    K extends T = T,
   Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>
  >(
    snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ): SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
    return {
      ...snapshotStore,

      config: this.config,
      configs: this.configs,
      items: this.items,
      snapshotStores: this.#snapshotStores,
      defaultConfigs: this.defaultConfigs,
      name: this.name,
      version: this.version,
      schema: this.schema,
      snapshotItems: this.snapshotItems,
      nestedStores: this.nestedStores,
      snapshotIds: this.snapshotIds,
      dataStoreMethods: this.dataStoreMethods,
      delegate: this.delegate,
      getConfig: this.getConfig.bind(this),
      setConfig: this.setConfig.bind(this),
      ensureDelegate: this.ensureDelegate.bind(this),
      getSnapshotItems: this.getSnapshotItems.bind(this),

      handleDelegate: this.handleDelegate.bind(this),
      notifySuccess: this.notifySuccess.bind(this),
      notifyFailure: this.notifyFailure.bind(this),
      findSnapshotStoreById: this.findSnapshotStoreById.bind(this),

      defaultSaveSnapshotStore: this.defaultSaveSnapshotStore.bind(this),
      saveSnapshotStore: this.saveSnapshotStore.bind(this),
      findIndex: this.findIndex.bind(this),
      splice: this.splice.bind(this),

      addSnapshotToStore: this.addSnapshotToStore.bind(this),
      addSnapshotItem: this.addSnapshotItem.bind(this),
      addNestedStore: this.addNestedStore.bind(this),
      defaultSubscribeToSnapshots: this.defaultSubscribeToSnapshots.bind(this),

      defaultCreateSnapshotStores: this.defaultCreateSnapshotStores.bind(this),
      createSnapshotStores: this.createSnapshotStores.bind(this),
      subscribeToSnapshots: this.subscribeToSnapshots.bind(this),
      subscribeToSnapshot: this.subscribeToSnapshot.bind(this),

      defaultOnSnapshots: this.defaultOnSnapshots.bind(this),
      onSnapshots: this.onSnapshots.bind(this),
      transformSubscriber: this.transformSubscriber.bind(this),
      isCompatibleSnapshot: this.isCompatibleSnapshot.bind(this),

      isSnapshotStoreConfig: this.isSnapshotStoreConfig.bind(this),
      transformDelegate: this.transformDelegate.bind(this),
      getSavedSnapshotStore: this.getSavedSnapshotStore.bind(this),
      getConfigs: this.getConfigs.bind(this),

      getSavedSnapshotStores: this.getSavedSnapshotStores.bind(this),
      initializedState: this.initializedState,
      transformedDelegate: this.transformedDelegate,
      transformedSubscriber: this.transformedSubscriber.bind(this),

      getSnapshotIds: this.getSnapshotIds,
      getNestedStores: this.getNestedStores,
      getFindSnapshotStoreById: this.getFindSnapshotStoreById.bind(this),
      getAllKeys: this.getAllKeys.bind(this),

      mapSnapshot: this.mapSnapshot.bind(this),
      getAllItems: this.getAllItems.bind(this),
      addData: this.addData.bind(this),
      addDataStatus: this.addDataStatus.bind(this),

      removeData: this.removeData.bind(this),
      updateData: this.updateData.bind(this),
      updateDataTitle: this.updateDataTitle.bind(this),
      updateDataDescription: this.updateDataDescription.bind(this),

      updateDataStatus: this.updateDataStatus.bind(this),
      addDataSuccess: this.addDataSuccess.bind(this),
      getDataVersions: this.getDataVersions.bind(this),
      updateDataVersions: this.updateDataVersions.bind(this),

      getBackendVersion: this.getBackendVersion.bind(this),
      getFrontendVersion: this.getFrontendVersion.bind(this),
      fetchData: this.fetchData.bind(this),
      defaultSubscribeToSnapshot: this.defaultSubscribeToSnapshot.bind(this),

      handleSubscribeToSnapshot: this.handleSubscribeToSnapshot.bind(this),
      removeItem: this.removeItem.bind(this),
      getSnapshot: this.getSnapshot.bind(this),
      getSnapshotById: this.getSnapshotById.bind(this),

      getSnapshotSuccess: this.getSnapshotSuccess.bind(this),
      getSnapshotId: this.getSnapshotId.bind(this),
      getSnapshotArray: this.getSnapshotArray.bind(this),
      getItem: this.getItem.bind(this),

      addSnapshotFailure: this.addSnapshotFailure.bind(this),
      getDataStore: this.getDataStore.bind(this),
      addSnapshotSuccess: this.addSnapshotSuccess.bind(this),

      setItem: this.setItem.bind(this),
      getParentId: this.getParentId.bind(this),
      getChildIds: this.getChildIds.bind(this),
      addChild: this.addChild.bind(this),

      compareSnapshotState: this.compareSnapshotState.bind(this),
      deepCompare: this.deepCompare.bind(this),
      shallowCompare: this.shallowCompare.bind(this),
      getDataStoreMethods: this.getDataStoreMethods.bind(this),

      getDelegate: this.getDelegate.bind(this),
      determineCategory: this.determineCategory.bind(this),
      determineSnapshotStoreCategory:
        this.determineSnapshotStoreCategory.bind(this),
      determinePrefix: this.determinePrefix.bind(this),

      updateSnapshot: this.updateSnapshot.bind(this),
      updateSnapshotSuccess: this.updateSnapshotSuccess.bind(this),
      updateSnapshotFailure: this.updateSnapshotFailure.bind(this),
      removeSnapshot: this.removeSnapshot.bind(this),

      clearSnapshots: this.clearSnapshots.bind(this),
      addSnapshot: this.addSnapshot.bind(this),
      createInitSnapshot: this.createInitSnapshot.bind(this),
      createSnapshotSuccess: this.createSnapshotSuccess.bind(this),

      createSnapshotFailure: this.createSnapshotFailure.bind(this),
      setSnapshotSuccess: this.setSnapshotSuccess.bind(this),
      setSnapshotFailure: this.setSnapshotFailure.bind(this),
      updateSnapshots: this.updateSnapshots.bind(this),

      updateSnapshotsSuccess: this.updateSnapshotsSuccess.bind(this),
      updateSnapshotsFailure: this.updateSnapshotsFailure.bind(this),
      initSnapshot: this.initSnapshot.bind(this),
      takeSnapshot: this.takeSnapshot.bind(this),

      takeSnapshotSuccess: this.takeSnapshotSuccess.bind(this),
      takeSnapshotsSuccess: this.takeSnapshotsSuccess.bind(this),
      configureSnapshotStore: this.configureSnapshotStore.bind(this),
      updateSnapshotStore: this.updateSnapshotStore.bind(this),

      flatMap: this.flatMap.bind(this),
      setData: this.setData.bind(this),
      getState: this.getState.bind(this),
      setState: this.setState.bind(this),

      validateSnapshot: this.validateSnapshot.bind(this),
      handleSnapshot: this.handleSnapshot.bind(this),
      handleActions: this.handleActions.bind(this),
      setSnapshot: this.setSnapshot.bind(this),

      transformSnapshotConfig: this.transformSnapshotConfig.bind(this),
      setSnapshotData: this.setSnapshotData.bind(this),
      filterInvalidSnapshots: this.filterInvalidSnapshots.bind(this),
      setSnapshots: this.setSnapshots.bind(this),

      clearSnapshot: this.clearSnapshot.bind(this),
      mergeSnapshots: this.mergeSnapshots.bind(this),
      reduceSnapshots: this.reduceSnapshots.bind(this),
      sortSnapshots: this.sortSnapshots.bind(this),

      filterSnapshots: this.filterSnapshots.bind(this),
      mapSnapshotsAO: this.mapSnapshotsAO.bind(this),
      findSnapshot: this.findSnapshot.bind(this),
      getSubscribers: this.getSubscribers.bind(this),

      notify: this.notify.bind(this),
      notifySubscribers: this.notifySubscribers.bind(this),
      subscribe: this.subscribe.bind(this),
      unsubscribe: this.unsubscribe.bind(this),

      fetchSnapshot: this.fetchSnapshot.bind(this),
      fetchSnapshotSuccess: this.fetchSnapshotSuccess.bind(this),
      fetchSnapshotFailure: this.fetchSnapshotFailure.bind(this),
      getSnapshots: this.getSnapshots.bind(this),

      getAllSnapshots: this.getAllSnapshots.bind(this),
      getSnapshotStoreData: this.getSnapshotStoreData.bind(this),
      generateId: this.generateId.bind(this),
      batchFetchSnapshots: this.batchFetchSnapshots.bind(this),

      batchTakeSnapshotsRequest: this.batchTakeSnapshotsRequest.bind(this),
      batchUpdateSnapshotsRequest: this.batchUpdateSnapshotsRequest.bind(this),
      batchFetchSnapshotsSuccess: this.batchFetchSnapshotsSuccess.bind(this),
      batchFetchSnapshotsFailure: this.batchFetchSnapshotsFailure.bind(this),

      batchUpdateSnapshotsSuccess: this.batchUpdateSnapshotsSuccess.bind(this),
      batchUpdateSnapshotsFailure: this.batchUpdateSnapshotsFailure.bind(this),
      batchTakeSnapshot: this.batchTakeSnapshot.bind(this),
      handleSnapshotSuccess: this.handleSnapshotSuccess.bind(this),

      isExpired: this.isExpired.bind(this),
      compress: this.compress.bind(this),
      encrypt: this.encrypt.bind(this),
      decrypt: this.decrypt.bind(this),
      getFirstDelegate: this.getFirstDelegate.bind(this), // Bind 'this' correctly
      safeCastSnapshotStore: this.safeCastSnapshotStore.bind(this),
      getInitialDelegate: this.getInitialDelegate.bind(this),
      transformInitialState: this.transformInitialState.bind(this),
      transformSnapshot: this.transformSnapshot.bind(this),
      getName: this.getName.bind(this),
      getVersion: this.getVersion.bind(this),
      getSchema: this.getSchema.bind(this),
      restoreSnapshot: this.restoreSnapshot.bind(this),

      initializeWithData: this.initializeWithData.bind(this),
      hasSnapshots: this.hasSnapshots.bind(this),
      transformMappedSnapshotData: this.transformMappedSnapshotData.bind(this),
      transformSnapshotMethod: this.transformSnapshotMethod.bind(this),

      initializeDefaultConfigs: this.initializeDefaultConfigs.bind(this),
      _saveSnapshotStores: this._saveSnapshotStores.bind(this),
      defaultSaveSnapshotStores: this.defaultSaveSnapshotStores.bind(this),
      getTransformedSnapshot: this.getTransformedSnapshot.bind(this),

      [Symbol.iterator]: this[Symbol.iterator].bind(this),
      // Other properties...
    };
  }

  // /**
  //  * Get config option with proper typing
  //  */
  // public getConfigOption(): 
  //   | string
  //   | SnapshotConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  //   | SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  //   | null 
  // {
  //   return this.configOption;
  // }

  /**
   * Transform config with proper generic preservation
   */
  private transformSnapshotConfig<U extends BaseDataEntity>(
    config: SnapshotConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ): SnapshotConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
    // Implementation that preserves all generic parameters
    return {
      ...config,
      // Ensure all properties maintain their generic types
    };
  }

  // ----------------
  // Helper Methods for Type Safety
  // ----------------

  /**
   * Type guard for SnapshotStoreConfig
   */
  private isSnapshotStoreConfig(
    item: any
  ): item is SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
    return item && typeof item === "object" && "id" in item && "storeId" in item;
  }

  /**
   * Type guard for SnapshotConfig
   */
  private isSnapshotConfig(
    item: any
  ): item is SnapshotConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
    return item && typeof item === "object" && "snapshotId" in item;
  }

  /**
   * Safely handle config option with type checking
   */
  private handleConfigOption(): void {
    if (typeof this.configOption === 'string') {
      // Handle string config option
      console.log('Config option is a string:', this.configOption);
    } else if (this.isSnapshotStoreConfig(this.configOption)) {
      // Handle full store config
      console.log('Config option is a store config:', this.configOption.id);
    } else if (this.isSnapshotConfig(this.configOption)) {
      // Handle snapshot config
      console.log('Config option is a snapshot config:', this.configOption.snapshotId);
    } else if (this.configOption === null) {
      // Handle null case
      console.log('Config option is null');
    }
  }


    // Helper methods for operations
  private findSnapshotStoreById(storeId: number): SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null {
    console.log(`Looking for snapshot store with ID: ${storeId}`);

    const store = this.#snapshotStores.get(storeId);

    if (store) {
      console.log(`Snapshot store found:`, store);
      return store;
    } else {
      console.log(`Snapshot store with ID ${storeId} not found.`);
      return null;
    }
  }
  // Public setter
  public setDataStores(stores: DataStore<T, K, Meta, ExcludedFields>[]): void {
    this.dataStores = stores;
  }
  
  // Public getter for #snapshotStores
  public get snapshotStores(): Map<number, SnapshotStore<T, K, Meta>> {
    return this.#snapshotStores;
  }

  protected setSnapshotStores(stores: Map<number, SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>): void {
    this.#snapshotStores = stores;
  }

  // Initialize options based on the config
  protected async initializeOptions(): Promise<void> {
    const config = await this.config; // Await the promise to get the resolved config

    if (config?.logging) {
      console.log('Logging is enabled for this SnapshotStore.');
    }
  
    if (config?.autoSync) {
      console.log('Auto-sync is enabled for this SnapshotStore.');
      this.autoSyncData();
    }
  }


  // Example method for syncing data
  protected autoSyncData(): void {
    console.log('Auto-syncing data...');
    // Add your sync logic here
  }
  
  private ensureDelegate(): SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
    if (!this.delegate || this.delegate.length === 0) {
      throw new Error("Delegate is not defined or is empty.");
    }
    return this.delegate[0];
  }


  // Helper methods would be defined in the same class
  private async handleSnapshotContainer(
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    container: T,
    config?: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null
  ): Promise<void> {
    // Implementation for container management
  }
  
  private async cleanupSnapshotContainer(
    snapshotId: string | number | null,
    container: T,
    config?: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null
  ): Promise<void> {
    // Cleanup implementation
  }
  
  private handleEventUpdate(
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    event: SnapshotEvents<T, K, Meta, ExcludedFields>,
    snapshots: SnapshotsArray<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    callback: (data: T) => void
  ): Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> {
    // Custom event update logic
  }
  
  private handleMetadataChange(
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    newMetadata: Partial<Meta>,
    callback: (data: T) => void
  ): Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> {
    // Metadata update logic
  }




  /**
   * Initialize default configs with proper typing
   */
  private initializeDefaultConfigs(): SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] {
    return [
      {
        id: "default",
        autoSave: true,
        syncInterval: 300000,
        snapshotLimit: 100,
        additionalSetting: "default-setting",
        find: this.find.bind(this),
        storeId: this.storeId,
        operation: this.operation,
        data: this.data ? this.data : undefined,
        createdAt: this.createdAt,
        initialState: this.initialState,
        timestamp: this.timestamp,
        snapshotId: this.snapshotId,
        dataStoreMethods: this.dataStoreMethods || null,
        category: this.category,
        criteria: this.criteria,
        content: this.content,
        config: this.config,
        snapshotCategory: this.snapshotCategory,
        subscriberId: this.subscriberId,
        // Ensure all properties maintain the correct generic structure
      } as SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    ];
  }
  // Method to initialize default configurations
  private initializeDefaultConfigs(): SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] {
    return [
      {
        id: "default",
        autoSave: true,
        syncInterval: 300000, // Sync every 5 minutes
        snapshotLimit: 100, // Keep a maximum of 100 snapshots
        additionalSetting: "default-setting",
        find: this.find,
        storeId: this.storeId,
        operation: this.operation,
        data: this.data ? this.data : undefined,
        createdAt: this.createdAt,
        initialState: this.initialState,
        timestamp: this.timestamp,
        snapshotId: this.snapshotId,


        snapshotStore: this.snapshotStore ? this.snapshotStore : null,
        dataStoreMethods: this.dataStoreMethods || null,
        category: this.category,
        criteria: this.criteria,

        content: this.content,
        config: this.config,
        snapshotCategory: this.snapshotCategory,
        snapshotSubscriberId: this.snapshotSubscriberId,
      },
    ];
  }

 

  private handleDelegate<T extends (...args: any[]) => any, R = ReturnType<T>>(
    method: (delegate: any) => T,
    ...args: Parameters<T>
  ): R | undefined {
    if (this.delegate && this.delegate.length > 0) {
      for (const delegate of this.delegate) {
        const func = method(delegate);
        if (func && typeof func === "function") {
          return func(...args);
        } else {
          console.error("Method is not a function on delegate");
        }
      }
    } else {
      console.error("Delegate is undefined or empty");
      return undefined;
    }
  }

  private notifySuccess(message: string): void {
    notify(
      "clearSnapshotSuccess",
      message,
      "",
      new Date(),
      NotificationTypeEnum.SUCCESS,
      NotificationPosition.TopRight
    );
  }

  private notifyFailure(message: string): void {
    notify(
      "clearSnapshotFailure",
      message,
      "",
      new Date(),
      NotificationTypeEnum.ERROR,
      NotificationPosition.TopRight
    );
  }



  private async defaultSaveSnapshotStore(
    store: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ): Promise<void> {
    try {
      console.log(
        `Saving snapshot store with ID: ${store.storeId} (default method)`
      );
      this.#snapshotStores.set(store.storeId, store);
      console.log(`Snapshot store saved successfully using default method.`);
    } catch (error) {
      console.error(
        `Failed to save snapshot store using default method:`,
        error
      );
    }
  }

  private async saveSnapshotStore(store: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): Promise<void> {
    try {
      console.log(`Saving snapshot store with ID: ${store.storeId}`);
      this.#snapshotStores.set(store.storeId, store);
      console.log(`Snapshot store saved successfully.`);
    } catch (error) {
      console.error(`Failed to save snapshot store:`, error);
    }
  }


  // Example of transforming snapshot method
  private transformSnapshotMethod<U extends Data<U>,   T extends BaseDataEntity>(
    snapshotMethod: any // Adjust type as needed
  ): any {
    // Logic to transform the snapshot method, ensuring it returns the correct types
    return (id: string | number | undefined, ...otherParams: any) => {
      // Example logic here, transforming as necessary
      return; // Return a compatible value of type Snapshot<WrappedU, WrappedU, Meta, ExcludedFields>
    };
  }

  // Method to save multiple snapshot stores
  private async _saveSnapshotStores(
    id: string,
    snapshotId: string,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshotManager: SnapshotManager<T, K, Meta, ExcludedFields>,
    payload: CreateSnapshotStoresPayload<T, K, Meta, ExcludedFields>,
    callback: (snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]) => void | null,
    snapshotStoreData?: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
    category?: string | Category,
    categoryProperties?: string | CategoryProperties,
    snapshotDataConfig?: SnapshotStoreConfig<
      SnapshotWithCriteriaAsBase<any, BaseData>,
      K
    >[]
  ): Promise<void> {
    try {
      console.log(`Saving multiple snapshot stores...`);
      if (snapshotStoreData) {
        for (const store of snapshotStoreData) {
          await this.saveSnapshotStore(store);
        }
      }
      console.log(`All snapshot stores saved successfully.`);
      if (callback) {
        callback(snapshotStoreData || []);
      }
    } catch (error) {
      console.error(`Failed to save one or more snapshot stores:`, error);
    }
  }

  // Helper method to consolidate metadata for efficiency
  private consolidateMetadata(metadata: Record<string, any>): Record<string, any> {
    // Placeholder for real consolidation logic
    // For example: if metadata has repetitive information, reduce it to a smaller format
    const consolidatedMetadata = { ...metadata };

    // Example: remove duplicate entries or unify them
    if (consolidatedMetadata.repetitiveField) {
      delete consolidatedMetadata.repetitiveField;
    }

    return consolidatedMetadata;
  }

  


  // Example of transforming mappedSnapshotData
  private transformMappedSnapshotData<U extends Data<U>,   T extends BaseDataEntity>(
    mappedSnapshotData: Map<string, Snapshot<Data, T>>
  ): Map<string, Snapshot<WrappedU, WrappedU, Meta, ExcludedFields>> {
    const transformedData = new Map<string, Snapshot<WrappedU, WrappedU, Meta, ExcludedFields>>();
    mappedSnapshotData.forEach((value, key) => {
      transformedData.set(key, this.transformSnapshot<U, T>(value));
    });
    return transformedData;
  }

  // Updated transformSnapshotStore function
  private transformSnapshotStore<U extends Data<U>, T extends BaseDataEntity>(
    snapshotStore: SnapshotStore<Data<U>, T>
  ): SnapshotStore<WrappedU, WrappedU, Meta, ExcludedFields> {
    const transformedSnapshotData = {
      
      ...snapshotStore,
      category: snapshotStore.category || 'default-transform-snapshotStore',
      // Apply transformations or assign default values as needed for each property
      initializeWithData: snapshotStore.initializeWithData || (() => { /* default */ }),
      hasSnapshots: snapshotStore.hasSnapshots || (() => { /* default */ }),
      snapshotStores: snapshotStore.#snapshotStores || [],
      name: snapshotStore.name || "Default Name",
      version: snapshotStore.version || 1,
      schema: snapshotStore.schema || "default-schema",
      dataStores: snapshotStore.dataStores || [],
      snapshotItems: snapshotStore.snapshotItems || [],
      nestedStores: snapshotStore.nestedStores || [],
      snapshotIds: snapshotStore.snapshotIds || [],
      dataStoreMethods: snapshotStore.dataStoreMethods || {},
      getConfig: snapshotStore.getConfig || (() => { /* default */ }),
      setConfig: snapshotStore.setConfig || ((config) => { /* default */ }),
      delegate: snapshotStore.delegate || null,
      notifySuccess: snapshotStore.notifySuccess || (() => { /* default */ }),
      notifyFailure: snapshotStore.notifyFailure || (() => { /* default */ })
    };

    // Now use createSnapshotStore to initialize a new snapshot store based on the transformed data
    return createSnapshotStore<WrappedU, WrappedU, Meta, ExcludedFields>(
      transformedSnapshotData as SnapshotStoreConfig<WrappedU, WrappedU, Meta, ExcludedFields>,  // Pass as config
      transformedSnapshotData as SnapshotData<U, U, StructuredMetadata<WrappedU, WrappedU, Meta, ExcludedFields>>          // Pass as data
    );
  }

  private getFirstDelegate() {
    if (!this.delegate || this.delegate.length === 0) {
      throw new Error("No delegates available.");
    }
    return this.delegate[0];
  }

  get getInitialDelegate() {
    return this.getFirstDelegate;
  }
  
  // Transform initialState from T to U
  private transformInitialState<U extends Data<U>,   T extends BaseDataEntity>(
    initialState: InitializedState<U, T>
  ): InitializedState<WrappedU, WrappedU, Meta, ExcludedFields> | null {
    if (isSnapshotStore(initialState)) {
      return {
        ...initialState,
        name: this.name, // Use 'this.name' if this is a property of the class
        hasSnapshots: this.hasSnapshots,

        transformInitialState,
        defaultSubscribeToSnapshots,
        getSnapshotStoreConfig,
        version,
        dataStoreMethods,
        getConfig, 
        getSnapshotItems,
        delegate, 
        findIndex, 
        get, 
        createSnapshotStores, 
        subscribeToSnapshots, 
        subscribeToSnapshot, 
        
        initializeWithData: this.initializeWithData, 
        snapshotStores: this.#snapshotStores,
        schema: this.schema,
        dataStores: this.dataStores, 
        snapshotItems: this.snapshotItems, 
        nestedStores: this.nestedStores, 
        snapshotIds: this.snapshotIds,
        setConfig: this.setConfig, 
        ensureDelegate: this.ensureDelegate,
        initializeDefaultConfigs: this.initializeDefaultConfigs, 
        handleDelegate: this.handleDelegate, 
        notifySuccess: this.notifySuccess, 
        notifyFailure: this.notifyFailure, 
        findSnapshotStoreById: this.findSnapshotStoreById, 
        defaultSaveSnapshotStore: this.defaultSaveSnapshotStore,
        saveSnapshotStore: this.saveSnapshotStore, 
        _saveSnapshotStores: this._saveSnapshotStores, 
        consolidateMetadata: this.consolidateMetadata, 
        _saveSnapshotStore: this._saveSnapshotStore,
        transformSnapshot: this.transformSnapshot, 
        transformMappedSnapshotData: this.transformMappedSnapshotData, 
        transformSnapshotStore: this.transformSnapshotStore,
        defaultSaveSnapshotStores: this.defaultSaveSnapshotStores, 
        safeCastSnapshotStore: this.safeCastSnapshotStore, 
        getFirstDelegate: this.getFirstDelegate, 
        getInitialDelegate: this.getInitialDelegate,
        transformSnapshotMethod: this.transformSnapshotMethod, 
        getName: this.getName, 
        getVersion: this.getVersion, 
        getSchema: this.getSchema,
        restoreSnapshot: this.restoreSnapshot, 
        config, 
        configs: this.configs, 
        defaultConfigs: this.defaultConfigs,
        addSnapshotItem: this.addSnapshotItem,
        addNestedStore: this.addNestedStore, 
        defaultCreateSnapshotStores: this.defaultCreateSnapshotStores,
        items: this.items, 
        splice: this.splice, 
        addSnapshotToStore: this.addSnapshotToStore, 
        getSnapshotStores: this.getSnapshotStores, 
        getItems: this.getItems, 
        configOption: transformConfigOption(initialState.configOption),
      } as InitializedState<WrappedU, WrappedU, Meta, ExcludedFields>; // Ensure you cast properly.
    } else if (isSnapshot(initialState)) {
      return this.transformSnapshot<U, BaseData>(initialState); // Assuming this method handles transformation correctly
    } else if (initialState instanceof Map) {
      return new Map<string, Snapshot<WrappedU, WrappedU, Meta, ExcludedFields>>(
        Array.from(initialState.entries()).map(([key, value]) => [
          key,
          this.transformSnapshot<U, T>(value),
        ])
      ) as InitializedState<WrappedU, WrappedU, Meta, ExcludedFields>;
    } else {
      return null;
    }
  }

  public getSnapshotStores(): Map<number, SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> {
    return this.#snapshotStores
  }

  public getItems( items: K[]): void {
    this.items = items
  }
  
  // Implementing getSnapshotItems
  public getSnapshotItems(): (
    | SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
    | SnapshotItem<T, K, Meta, ExcludedFields>
    | undefined
  )[] {
    return this.config?.useSimulatedDataSource
      ? this.config.simulatedDataSource
      : this.snapshotItems;
  }

  // Public method to save a single snapshot store (wrapper method)
  public async _saveSnapshotStore(store: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): Promise<void> {
    try {
      console.log(
        `Public method: Saving snapshot store with ID: ${store.storeId}`
      );
      await this.saveSnapshotStore(store);
    } catch (error) {
      console.error(`Public method: Failed to save snapshot store:`, error);
    }
  }

  // Public method to save multiple snapshot stores using the default save method
  public async defaultSaveSnapshotStores(
    id: string,
    snapshotId: string,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshotManager: SnapshotManager<T, K, Meta, ExcludedFields>,
    payload: CreateSnapshotStoresPayload<T, K, Meta, ExcludedFields>,
    callback: (snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]) => void | null,
    snapshotStoreData?: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
    category?: string | Category,
    categoryProperties?: string | CategoryProperties,
    snapshotDataConfig?: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
    
    snapshotDataConfigSearch?: SnapshotStoreConfig<
      SnapshotWithCriteriaAsBase<any, BaseData>, 
      SnapshotWithCriteriaAsBase<any, BaseData<any, any, StructuredMetadata<any, any>, Attachment>>
    >[],
    
  ): Promise<void> {
    try {
      console.log(
        `Saving multiple snapshot stores using default save method...`
      );
      if (snapshotStoreData) {
        for (const store of snapshotStoreData) {
          await this.defaultSaveSnapshotStore(store);
        }
      }
      console.log(
        `All snapshot stores saved successfully using default method.`
      );
      if (callback) {
        callback(snapshotStoreData || []);
      }
    } catch (error) {
      console.error(
        `Failed to save one or more snapshot stores using default method:`,
        error
      );
    }
  }
  
  public lastUpdated?: VersionHistory<T, K>;
  
  // State management
  state?: SnapshotsArray<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null = null;
  states: SnapshotsArray<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = [];
  currentState: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null = null;
  
  // Snapshots collection
  snapshots: SnapshotsArray<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = [];
    // Add index for fast lookup
  snapshotsIndex: { [id: string]: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> } = {};
  
  snapshotConfig: SnapshotConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] = [];
  snapshotStoreConfig: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null = null;
  previousSnapshot?: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null = null;

  // ID management
  idMap: Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> = new Map();
  snapshotIds: string[] = [];
  leader?: string; // For distributed systems
  
  // ----------------
  // Snapshot Operations
  // ----------------
  source?: string;
  taskIdToAssign?: string;
  criteria?: any;
  
  
  // Event system
  events?: (SnapshotEvents<T, K, Meta, ExcludedFields> & CombinedEvents<T, K, Meta, ExcludedFields>) | undefined = undefined;
  getSnapshot(
    snapshot: (id: string) =>
      | Promise<{
          snapshotId: number;
          snapshotData: SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
          category: symbol | string | Category | undefined
          categoryProperties: CategoryProperties | undefined;
          dataStoreMethods: DataStore<T, K, Meta, ExcludedFields> | null;
          timestamp: string | number | Date | undefined;
          id: string | number | undefined;
          snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
          snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
          data: T;
        }>
      | undefined
  ): Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined> {
    // Check if the delegate array exists and is not empty
    if (this.delegate && this.delegate.length > 0) {
      const firstDelegate = this.delegate.find(
        (del) => typeof del.getSnapshot === "function"
      );

      if (firstDelegate) {
        // Call getSnapshot on the first valid delegate found
        return firstDelegate.getSnapshot(snapshot);
      } else {
        // Handle the case where no valid delegate is found
        throw new Error("No valid delegate found with getSnapshot method");
      }
    } else {
      // Handle the case where the delegate array is undefined or empty
      throw new Error("Delegate is undefined or empty");
    }
  }

  getSnapshotById(
    snapshot: (id: string) =>
      | Promise<{
          category: symbol | string | Category | undefined
          categoryProperties: CategoryProperties;
          timestamp: string | number | Date | undefined;
          id: string | number | undefined;
          snapshot: Snapshot<SnapshotUnion<BaseData, Meta>, T>;
          snapshotStore: SnapshotStore<SnapshotUnion<BaseData, Meta>, T>;
          data: SnapshotUnion<BaseData, Meta>;
        }>
      | undefined
  ): Promise<Snapshot<SnapshotUnion<BaseData, Meta>, T> | null> {
    // Check if the delegate array exists and is not empty
    if (this.delegate && this.delegate.length > 0) {
      const firstDelegate = this.delegate.find(
        (del) => typeof del.getSnapshotById === "function"
      );
      if (firstDelegate) {
        // Call getSnapshot on the first valid delegate found
        return firstDelegate.getSnapshotById(snapshot);
      } else {
        // Handle the case where no valid delegate is found
        throw new Error("No valid delegate found with getSnapshotById method");
      }
    }
    return Promise.reject(new Error("Delegate is undefined or empty"));
  }

  transformSnapshotConfig<U extends BaseDataEntity>(
    config: SnapshotConfig<WrappedU, WrappedU, Meta, ExcludedFields>
  ): SnapshotConfig<WrappedU, WrappedU, Meta, ExcludedFields> {
    const { initialState, configOption, ...rest } = config;

    // Safely transform configOption and its initialState
    const transformedConfigOption =
      typeof configOption === "object" &&
      configOption !== null &&
      "initialState" in configOption
        ? {
            ...configOption,
            initialState:
              configOption.initialState instanceof Map
                ? new Map<string, Snapshot<WrappedU, WrappedU, Meta, ExcludedFields>>(
                    // Map the entries to transform Snapshot<Data, T> to Snapshot<WrappedU, WrappedU, Meta, ExcludedFields>
                    Array.from(configOption.initialState.entries()).map(
                      ([key, snapshot]): readonly [string, Snapshot<WrappedU, WrappedU, Meta, ExcludedFields>] => [
                        key,
                        this.transformSnapshot<U, T>(snapshot), // Ensure proper snapshot transformation
                      ]
                    )
                  )
                : null,
          }
        : undefined;

    // Safely handle initialState based on its type
    let transformedInitialState: InitializedState<WrappedU, WrappedU, Meta, ExcludedFields> | null;
    if (
      isSnapshotStore(initialState) ||
      isSnapshot(initialState) ||
      initialState instanceof Map ||
      initialState === null
    ) {
      transformedInitialState = initialState;
    } else {
      transformedInitialState = null; // Handle any other case as necessary
    }

    return {
      ...rest,
      initialState: transformedInitialState,
      configOption: transformedConfigOption
        ? transformedConfigOption
        : undefined,
    };
  }

  generateId(
    //     prefix: string,
    // name: string,
    // type: NotificationType,
    // id?: string,
    // title?: string,
    // chatThreadName?: string,
    // chatMessageId?: string,
    // chatThreadId?: string,
    // dataDetails?: DataDetails<any, T>,
    // generatorType?: string
  ): string {
    const delegateWithGenerateId = this.delegate?.find((d) => d.generateId);
    const generatedId = delegateWithGenerateId?.generateId();
    return typeof generatedId === "string" ? generatedId : "";
  }
  
  validateSnapshot(snapshotId: string, snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): boolean {
    const result = this.handleDelegate(
      (delegate) => delegate.validateSnapshot,
      snapshotId,
      snapshot
    );
    return result !== undefined ? result : false;
  }

  
  // Compression/encryption
  compress(): void {
    // Check if compressing is necessary
    if (!this.configs || this.configs.length === 0) {
      console.warn("No configuration available to compress.");
      return;
    } 
  
    // Create a type that omits unnecessary fields from SnapshotStoreConfig
    type CompressedConfig = Omit<SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, 'debugInfo' | 'tempData'> & {
      find(arg0: (config: SnapshotStoreConfig<SnapshotWithCriteriaAsBase<BaseData, any>, Data>) => boolean): unknown;
      optionalData?: any; // Include optional data if necessary
      debugInfo?: DebugInfo,
      tempData: TempData<T, K, Meta, ExcludedFields>,
      // [key: string]: any
    };
 
    this.configs = this.configs.map((config: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => {
      const { debugInfo, tempData, ...compressedConfig } = config;
    
      // Example 2: Transform the 'createdAt' field from Date to timestamp
      if (compressedConfig.createdAt !== undefined && compressedConfig.createdAt instanceof Date) {
        compressedConfig.createdAt = compressedConfig.createdAt.getTime().toString();
      }
    
      // Example 3: Remove empty or null fields for efficiency
      Object.keys(compressedConfig).forEach((key) => {
        const value = compressedConfig[key as keyof typeof compressedConfig]; // Type assertion here
        if (
          value === null ||
          value === undefined ||
          (Array.isArray(value) && value.length === 0) ||
          (typeof value === 'object' && Object.keys(value).length === 0)
        ) {
          delete compressedConfig[key as keyof typeof compressedConfig];
        }
      });
    
      // Example 4: Consolidate common data into a shared property
      if (compressedConfig.metadata && typeof compressedConfig.metadata === 'object') {
        compressedConfig.metadata = this.consolidateMetadata(compressedConfig.metadata);
      }
    
      return compressedConfig;
    });
    
  
    console.log("Compression completed.");
  }

   // Method to access metadata
  getMetadata(): UnifiedMetadata<T, K, Meta> {
    return this.metadata;
  }

  // Additional methods to access metadata based on its type
  getProjectMetadata(): ProjectMetadata<T, K, Meta, ExcludedFields> | undefined {
    if ('startDate' in this.metadata && this.metadata != undefined) {
      return this.metadata as ProjectMetadata;
    }
    return undefined;
  }

  getStructuredMetadata(): StructuredMetadata<T,K> | undefined {
    if ('metadataEntries' in this.meta) {
      return this.meta as StructuredMetadata<T, K>;
    }
    return undefined;
  }


  encrypt(): void {
    if (!this.config) {
      console.warn("No configuration available to encrypt.");
      return;
    }

    // Example encryption logic: Encrypt a single configuration
    this.config = {
      ...this.config,
      encryptedData: JSON.stringify(this.config), // Placeholder encryption
    } as SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;

    this.isEncrypted = true;
    console.log("Encryption completed.");
  }

  decrypt(): void {
    if (!this.config || !this.isEncrypted) {
      console.warn("No encrypted data available to decrypt.");
      return;
    }

    // Example decryption logic: Decrypt a single configuration
    try {
      const decryptedData = JSON.parse((this.config as any).encryptedData || "{}");
      this.config = {
        ...this.config,
        ...decryptedData,
      } as SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
    } catch (error) {
      console.error("Decryption failed:", error);
    }

    this.isEncrypted = false;
    console.log("Decryption completed.");
  }
  

  /**
   * Set up activity listeners to detect user/system activity
   */
  private setupActivityListeners(): void {
    // Browser events (if running in browser environment)
    if (typeof window !== 'undefined') {
      const activityEvents = [
        'mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart',
        'click', 'input', 'focus'
      ];

      activityEvents.forEach(event => {
        window.addEventListener(event, this.handleActivity.bind(this), true);
      });
    }

    // Custom store activity events
    this.setupStoreActivityListeners();
  }


    /**
   * Remove activity listeners
   */
  private removeActivityListeners(): void {
    // Remove any activity listeners
  }


  /**
   * Set up store-specific activity listeners
   */
  private setupStoreActivityListeners(): void {
    // Listen for snapshot operations
    const operationsToWatch = [
      'addSnapshot', 'removeSnapshot', 'updateSnapshot',
      'addData', 'removeData', 'updateData',
      'subscribe', 'unsubscribe', 'notify'
    ];

    operationsToWatch.forEach(operation => {
      const originalMethod = (this as any)[operation];
      if (typeof originalMethod === 'function') {
        (this as any)[operation] = (...args: any[]) => {
          this.handleActivity();
          return originalMethod.apply(this, args);
        };
      }
    });
  }

  /**
   * Handle activity detection
   */
  private handleActivity(): void {
    this.resetIdleTimeout();
  }

  /**
   * Perform operations when store becomes idle
   */
  private performIdleOperations(): void {
    // Auto-save current state
    this.autoSaveState();

    // Clean up old snapshots based on retention policy
    this.cleanupOldSnapshots();

    // Compress data if enabled
    if (this.config?.autoCompress) {
      this.compress();
    }

    // Sync with backend if autoSync is enabled
    if (this.autoSync) {
      this.autoSyncData();
    }

    // Emit idle event
    this.emit('idle', {
      timestamp: new Date(),
      duration: this.idleTimeoutDuration,
      lastActivity: new Date(this.lastActivityTimestamp)
    });
  }

  /**
   * Auto-save current state
   */
  private async autoSaveState(): Promise<void> {
    try {
      if (this.currentState && this.config?.autoSave) {
        await this.saveSnapshotStore(this);
        console.log('Auto-save completed during idle time');
      }
    } catch (error) {
      console.warn('Auto-save failed:', error);
    }
  }

  /**
   * Clean up old snapshots based on retention policy
   */
private cleanupOldSnapshots(): void {
  const retentionPolicy = this.retentionPolicy;
  const config = this.config;
  
  // Use retention policy if available, otherwise fall back to config
  const maxAgeMs = retentionPolicy?.maxAge 
    ? retentionPolicy.maxAge * 1000 // Convert seconds to ms
    : config.retentionPeriod;

  const maxSnapshots = retentionPolicy?.maxCount || config.maxSnapshots;

  if (!maxAgeMs && !maxSnapshots) return;

  const now = Date.now();

  // Convert to array for processing (if using Map)
  const snapshotsArray = this.snapshots instanceof Map 
    ? Array.from(this.snapshots.values())
    : [...this.snapshots];

  // Remove oldest snapshots when count limit is reached
  if (maxSnapshots && snapshotsArray.length > maxSnapshots) {
    const sortedSnapshots = snapshotsArray.sort((a, b) => 
      new Date(a.timestamp || 0).getTime() - new Date(b.timestamp || 0).getTime()
    );
    
    const snapshotsToRemove = sortedSnapshots.slice(0, sortedSnapshots.length - maxSnapshots);
    
    if (this.snapshots instanceof Map) {
      snapshotsToRemove.forEach(snapshot => this.snapshots.delete(snapshot.id));
    } else {
      this.snapshots = sortedSnapshots.slice(-maxSnapshots);
    }
  }

  // Remove snapshots older than max age
  if (maxAgeMs) {
    const snapshotsToRemove = snapshotsArray.filter(snapshot => {
      const snapshotAge = now - new Date(snapshot.timestamp || 0).getTime();
      return snapshotAge > maxAgeMs;
    });

    if (this.snapshots instanceof Map) {
      snapshotsToRemove.forEach(snapshot => this.snapshots.delete(snapshot.id));
    } else {
      this.snapshots = this.snapshots.filter(snapshot => {
        const snapshotAge = now - new Date(snapshot.timestamp || 0).getTime();
        return snapshotAge <= maxAgeMs;
      });
    }
  }
  console.log(`Cleaned up snapshots. Current count: ${this.snapshots.size || this.snapshots.length}`);
}



  
  createSnapshotStores(
    id: string,
    snapshotId: string,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshotManager: SnapshotManager<T, K, Meta, ExcludedFields>,
    payload: CreateSnapshotStoresPayload<T, K, Meta, ExcludedFields>,
    callback: (snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]) => void | null,
    snapshotStoreData?: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
    category?:  Category,
    snapshotDataConfig?: SnapshotStoreConfig<
      SnapshotWithCriteriaAsBase<any, BaseData>,
      K
    >[]
  ) {
    if (this.createSnapshotStores) {
      this.createSnapshotStores(
        id,
        snapshotId,
        snapshot,
        snapshotStore,
        snapshotManager,
        payload,
        callback,
        snapshotStoreData,
        category,
        snapshotDataConfig
      );
    } else {
      console.warn("createSnapshotStores method is not defined.");
      this.defaultCreateSnapshotStores(
        id,
        snapshotId,
        snapshot,
        snapshotStore,
        snapshotManager,
        payload,
        callback,
        snapshotStoreData,
        category,
        snapshotDataConfig
      );
    }
  }

  defaultOnSnapshots(
    snapshotId: string,
    snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    type: string,
    event: SnapshotEvent<T, K, Meta, ExcludedFields>,
    callback: (snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void
  ) {
    console.log("onSnapshots called with snapshotId:", snapshotId);
    console.log("snapshots:", snapshots);
    console.log("type:", type);
    console.log("event:", event);
    console.log("callback:", callback);
    callback(snapshots);
  }

  onSnapshots(
    snapshotId: string,
    snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    type: string,
    event: SnapshotEvent<T, K, Meta, ExcludedFields>,
    callback: (snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void
  ): Promise<void | null> {
    if (this.onSnapshots) {
      // Ensure to wrap the call in a Promise to match the return type
      return Promise.resolve(
        this.onSnapshots(snapshotId, snapshots, type, event, callback)
      );
    } else {
      console.warn("onSnapshots method is not defined.");
      // Optionally, you can provide a default behavior here
      this.defaultOnSnapshots(snapshotId, snapshots, type, event, callback);
      return Promise.resolve(); // Return a resolved promise to match the return type
    }
  }

  

  /**
   * Register callback for idle events
   */
  onIdle(callback: () => void): void {
    this.idleCallbacks.push(callback);
  }

  /**
   * Register callback for activity resumption
   */
  onActivity(callback: () => void): void {
    this.activityCallbacks.push(callback);
  }

  /**
   * Remove idle callback
   */
  offIdle(callback: () => void): void {
    this.idleCallbacks = this.idleCallbacks.filter(cb => cb !== callback);
  }

  /**
   * Remove activity callback
   */
  offActivity(callback: () => void): void {
    this.activityCallbacks = this.activityCallbacks.filter(cb => cb !== callback);
  }

  /**
   * Trigger all idle callbacks
   */
  private triggerIdleCallbacks(): void {
    this.idleCallbacks.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('Error in idle callback:', error);
      }
    });
  }

  /**
   * Trigger all activity callbacks
   */
  private triggerActivityCallbacks(): void {
    this.activityCallbacks.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('Error in activity callback:', error);
      }
    });
  }


    private transformSubscriber<U extends BaseDataEntity<U>, K extends U = U>(
    sub: Subscriber<T, K, Meta, ExcludedFields>
  ): Subscriber<U, K> {
    // Safely access data by checking if sub.getData() is not null
    const data =
      sub.getData && sub.getData() !== null ? sub.getData()!.data : null;

    // Ensure data is of the correct type or null
    const isValidData = (
      data: any
    ): data is Partial<SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> | null => {
      return data === null || typeof data === "object"; // Adjust this check based on the structure of SnapshotStore
    };
    return {
      // General subscriber info
      _id: sub.getUniqueId,
      name: sub.getName(),
      subscriberId: sub.getSubscriberId(),
      email: sub.getEmail(),
      enabled: sub.getEnabled,
      tags: sub.getTags,

      // Data management
      data: isValidData(data) ? data : null,
      initialData: sub.initialData,
      newData: sub.newData,

      // Data transformation and processing
      getTransformSubscriber: sub.getTransformSubscriber,
      processData: sub.getProcessData,
      validateData: sub.getValidateData,
      transformData: sub.getTransformData,
      triggerActions: sub.getTriggerActions,
      getIsDataType: sub.getIsDataType,
      getUpdateInternalStore: sub.getUpdateInternalStore,
      getProcessData: sub.getProcessData,
      getValidateData: sub.getValidateData,
      getTransformData: sub.getTransformData,
      getTriggerActions: sub.getTriggerActions,

      // Data handling
      payload: sub.getPayload,
      update: sub.update,
      updateInternalStore: sub.getUpdateInternalStore,

      // Internal cache management
      internalCache: sub.getInternalCache,
      getFromInternalCache: sub.getFromInternalCache,
      clearInternalCache: sub.clearInternalCache,
      removeFromInternalCache: sub.removeFromInternalCache,

      // Subscriber methods
      subscribe: sub.subscribe,
      unsubscribe: sub.unsubscribe,
      getSubscribers: sub.getSubscribers,
      setSubscribers: sub.setSubscribers,

      // Subscription management *
      subscription: sub.getSubscription(),
      subscribersById: sub.getSubscribersById()
        ? sub.getSubscribersById()
        : undefined,
      subscribers: sub.getSubscribers,
      defaultSubscribeToSnapshots: sub.defaultSubscribeToSnapshots,
      subscribeToSnapshots: sub.subscribeToSnapshots,

      // Callbacks and event handling
      onSnapshotCallbacks: sub.getOnSnapshotCallbacks,
      onErrorCallbacks: sub.getOnErrorCallbacks,
      onUnsubscribeCallbacks: sub.getOnUnsubscribeCallbacks,
      notifyEventSystem: sub.getNotifyEventSystem(),
      processNotification: sub.processNotification,

      // Event handling
      getNotifyEventSystem: sub.getNotifyEventSystem,
      getUpdateProjectState: sub.getUpdateProjectState,
      getLogActivity: sub.getLogActivity,
      getTriggerIncentives: sub.getTriggerIncentives,
      addSnapshotCallback: sub.addSnapshotCallback,
      setEvent: sub.setEvent,

      // Snapshot management
      snapshotIds: sub.getSnapshotIds(),
      fetchSnapshotIds: sub.getFetchSnapshotIds(),
      fetchSnapshotById: sub.fetchSnapshotById,
      toSnapshotStore: sub.toSnapshotStore,
      handleSnapshot: sub.handleSnapshot,
      triggerOnSnapshot: sub.triggerOnSnapshot,

      // State management
      internalState: sub.getInternalState,
      getState: sub.getState(prop),
      updateProjectState: sub.getUpdateProjectState(),
      logActivity: sub.getLogActivity(),
      triggerIncentives: sub.getTriggerIncentives(),

      // Optional properties
      optionalData: sub.getOptionalData(),
      callback: sub.getCallback ? sub.getCallback(data) : undefined,

      // Additional utility functions
      determineCategory: sub.getDetermineCategory(),
      getDeterminedCategory: sub.getDeterminedCategory(),
      transformSubscribers: sub.getTransformSubscribers(),

      // Error handling
      onError: sub.onError,

      // Unique identifiers and miscellaneous
      getId: sub.getId(),
      sentNotification: sub.sentNotification,
      sendNotification: sub.sendNotification,
      getUniqueId: sub.getUniqueId,
      id: sub.id,
      getEnabled: sub.getEnabled,
      getTags: sub.getTags,
      getCallback: sub.getCallback,

      // Callback management *
      getOnSnapshotCallbacks: sub.getOnSnapshotCallbacks,
      setOnSnapshotCallbacks: sub.setOnSnapshotCallbacks,
      getOnErrorCallbacks: sub.getOnErrorCallbacks,
      setOnErrorCallbacks: sub.setOnErrorCallbacks,
      getOnUnsubscribeCallbacks: sub.getOnUnsubscribeCallbacks,
      setOnUnsubscribeCallbacks: sub.setOnUnsubscribeCallbacks,
      setNotifyEventSystem: sub.setNotifyEventSystem,
      setUpdateProjectState: sub.setUpdateProjectState,
      setLogActivity: sub.setLogActivity,
      setTriggerIncentives: sub.setTriggerIncentives,
      setOptionalData: sub.setOptionalData,
      setEmail: sub.setEmail,
      setSnapshotIds: sub.setSnapshotIds,

      // Internal state and data
      getInternalState: sub.getInternalState,
      getInternalCache: sub.getInternalCache,
      getPayload: sub.getPayload,

      // Snapshot handling
      handleCallback: sub.handleCallback,
      snapshotCallback: sub.snapshotCallback,
      getEmail: sub.getEmail,

      // Data fetching and subscription
      getOptionalData: sub.getOptionalData,
      getFetchSnapshotIds: sub.getFetchSnapshotIds,
      getSnapshotIds: sub.getSnapshotIds,
      getData: sub.getData,
      getInitialData: sub.getInitialData,
      getNewData: sub.getNewData,
      getDefaultSubscribeToSnapshots: sub.getDefaultSubscribeToSnapshots,
      getSubscribeToSnapshots: sub.getSubscribeToSnapshots,
      fetchTransformSubscribers: sub.fetchTransformSubscribers,
      getTransformSubscribers: sub.getTransformSubscribers,
      setTransformSubscribers: sub.setTransformSubscribers,

      // General information *
      getName: sub.getName,
      getDetermineCategory: sub.getDetermineCategory,

      // Snapshot management *
      snapshots: sub.snapshots,
      snapshotStores: sub.snapshotStores,
      receiveSnapshot: sub.receiveSnapshot,

      // Subscriber management *
      getSubscriberId: sub.getSubscriberId,
      getSubscribersById: sub.getSubscribersById,
      getSubscribersWithSubscriptionPlan:
        sub.getSubscribersWithSubscriptionPlan,
      getSubscription: sub.getSubscription,
      onUnsubscribe: sub.onUnsubscribe,
      onSnapshot: sub.onSnapshot,
      onSnapshotError: sub.onSnapshotError,
      onSnapshotUnsubscribe: sub.onSnapshotUnsubscribe,
      isDataType: sub.getIsDataType,
    };
  }

  // Helper function to check compatibility of snapshot types
  private isCompatibleSnapshot(snapshot: any): snapshot is Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
    // Add your compatibility check logic here, depending on what makes Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> valid
    return (
      snapshot &&
      snapshot.hasOwnProperty("snapshotId") &&
      snapshot.hasOwnProperty("snapshotData")
    );
  }

  private isSnapshotStoreConfig(item: any): item is SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
    // Add checks for required properties of SnapshotStoreConfig
    return (
      item &&
      typeof item === "object" &&
      "id" in item &&
      "title" in item &&
      // Add more property checks as needed
      true
    );
  }

  private async transformDelegate(): Promise<SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]> {
    return this.delegate?.map(async (config) => {
      const subscribersPromise = await config.getSubscribers(
        this.subscriberCollection, // Provide a valid SubscriberCollection<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> here
        this.snapshots // Provide a valid Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> here
      );
  
      return {
        ...config,
        data: config.data,
        subscribers: subscribersPromise.subscribers.map((sub: Subscriber<T, K, Meta, ExcludedFields>) =>
          this.transformSubscriber(sub)
        ) as Subscriber<T, K, Meta, ExcludedFields>[],
        configOption:
          config.configOption && typeof config.configOption !== "string"
            ? {
                ...config.configOption,
                data: config.configOption.data,
                subscribers: (await config.configOption.getSubscribers(
                  this.subscribers, // Provide a valid SubscriberCollection<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> here
                  this.snapshots // Provide a valid Snapshots<K> here
                )).subscribers.map((sub: Subscriber<T, K, Meta, ExcludedFields>) =>
                  this.transformSubscriber(sub)
                ) as Subscriber<T, K, Meta, ExcludedFields>[],
              }
            : config.configOption,
      };
    });
  }

  get getTransformedSnapshot() {
    return <U extends Data<U>, T extends Data>(
      snapshot: Snapshot<Data, T>
    ): Snapshot<WrappedU, WrappedU, Meta, ExcludedFields> => {
      return this.transformSnapshot<U, T>(snapshot);
    };
  }

  get getSavedSnapshotStore(): (
    id: string,
    snapshotId: string,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshotManager: SnapshotManager<T, K, Meta, ExcludedFields>,
    payload: CreateSnapshotStoresPayload<T, K, Meta, ExcludedFields>,
    callback: (snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]) => void | null,
    snapshotStoreData?: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
    category?:  Category,
    categoryProperties?: string | CategoryProperties,
    snapshotDataConfig?: SnapshotStoreConfig<
      SnapshotWithCriteriaAsBase<any, BaseData>,
      K
    >[]
  ) => void {
    return this.saveSnapshotStore
      ? this._saveSnapshotStore.bind(this)
      : this.defaultSaveSnapshotStore.bind(this);
  }

  get getConfigs(): (
    snapshotId: string,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshotManager: SnapshotManager<T, K, Meta, ExcludedFields>,
    payload: CreateSnapshotStoresPayload<T, K, Meta, ExcludedFields>,
    callback: (snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]) => void | null,
    snapshotStoreData?: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
    category?:  Category,
    snapshotDataConfig?: SnapshotStoreConfig<
      SnapshotWithCriteriaAsBase<any, BaseData>,
      K
    >[]
  ) => void {
    return this.configs
      ? this.configs.bind(this)
      : this.defaultConfigs.bind(this);
  }

  get getSavedSnapshotStores(): (
    id: string,
    snapshotId: string,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshotManager: SnapshotManager<T, K, Meta, ExcludedFields>,
    payload: CreateSnapshotStoresPayload<T, K, Meta, ExcludedFields>,
    callback: (snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]) => void | null,
    snapshotStoreData?: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
    category?: string | Category,
    categoryProperties?: string | CategoryProperties,
    snapshotDataConfig?: SnapshotStoreConfig<
      SnapshotWithCriteriaAsBase<any, BaseData>,
      K
    >[]
  ) => void {
    return this._saveSnapshotStores
      ? this._saveSnapshotStores.bind(this)
      : this.defaultSaveSnapshotStores.bind(this);
  }

  get initializedState(): InitializedState<T, K, Meta, ExcludedFields> {
    return this.initialState;
  }

  get transformedDelegate(): SnapshotStoreConfig<
    SnapshotWithCriteriaAsBase<any, BaseData>,
    K
  >[] {
    return this.transformDelegate();
  }

  // Getter for transformed initial state
  get getTransformedInitialState(): InitializedState<T, K, Meta, ExcludedFields> | null {
    if (!this.initialState) {
      return null; // Return null if the initial state is not set
    }

    // We assume that we want to transform it to a specific type U 
    // that is defined elsewhere or can be passed in context
    return this.transformInitialState<T, K, Meta, ExcludedFields>(this.initialState);
  }

 get isMobile() {
    return this.options.browserSpecific?.isMobile || false;
  }

  get browserType() {
    return this.options.browserSpecific?.browserType || 'Unknown';
  }

  transformedSubscriber(sub: Subscriber<T, K, Meta, ExcludedFields>): Subscriber<T, K, Meta, ExcludedFields> {
    return this.transformSubscriber(sub);
  }

  get getSnapshotIds(): SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] {
    if (
      this.transformedDelegate &&
      Array.isArray(this.transformedDelegate) &&
      this.transformedDelegate.every(
        (item) => item instanceof SnapshotStoreConfig
      )
    ) {
      return this.transformedDelegate;
    }
    return [];
  }

  get getNestedStores(): SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] {
    return this.nestedStores;
  }

  get getFindSnapshotStoreById(): (
    storeId: number
  ) => SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null {
    return this.findSnapshotStoreById.bind(this); // Bind this context if necessary
  }


  defaultSubscribeToSnapshot(
    snapshotId: string,
    callback: Callback<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ): string {
    // Add the subscriber to the subscribers array
    this.subscribers.push({
      id: snapshotId,
      _id: this.subscriberId,
      handleCallback: callback,
      snapshotCallback: snapshot,
    });
    // Call the callback with the snapshot
    callback(snapshot);
    // Return the subscriberId
    return this.subscriberId;
  }

  // Method to handle the subscription
  handleSubscribeToSnapshot(
    snapshotId: string,
    callback: Callback<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ): void {
    // Check if subscribeToSnapshot is defined
    if (this.subscribeToSnapshot) {
      this.subscribeToSnapshot(snapshotId, callback, snapshot);
    } else {
      console.warn("subscribeToSnapshot method is not defined.");
      // Optionally, you can provide a default behavior here
      this.defaultSubscribeToSnapshot(snapshotId, callback, snapshot);
    }
  }

  /**
   * Get idle status
   */
  getIdleStatus(): { isIdle: boolean; lastActivity: Date; timeoutDuration: number } {
    return {
      isIdle: this.isIdle,
      lastActivity: new Date(this.lastActivityTimestamp),
      timeoutDuration: this.idleTimeoutDuration
    };
  }

  /**
   * Update idle timeout duration
   */
  updateIdleTimeoutDuration(durationMs: number): void {
    this.idleTimeoutDuration = durationMs;
    this.resetIdleTimeout();
    console.log(`Idle timeout duration updated to ${durationMs}ms`);
  }

  /**
   * Stop idle timeout monitoring
   */
  stopIdleTimeout(): void {
    this.clearIdleTimeout();
    
    // Remove event listeners
    if (typeof window !== 'undefined') {
      const activityEvents = [
        'mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart',
        'click', 'input', 'focus'
      ];

      activityEvents.forEach(event => {
        window.removeEventListener(event, this.handleActivity.bind(this), true);
      });
    }

    console.log('Idle timeout stopped');
  }


  /**
   * Cleanup method to be called when store is destroyed
   */
  cleanup(): void {
    this.stopIdleTimeout();
    this.idleCallbacks = [];
    this.activityCallbacks = [];
  }
  
  // Mount/unmount
  mount(): void {
    this.mounted = true;
  }
  
  unmount(): void {
    this.mounted = false;
  }

private transformSnapshot<U extends Data<U>, T extends BaseDataEntity>(
    snapshot: Snapshot<Data<U, T>, T>
  ): Snapshot<any, any> {
    const transformedInitialState = snapshot.initialState
      ? this.transformInitialState<U, T>(snapshot.initialState)
      : null;

    const transformedRemoveSubscriber = transformSubscriber(snapshot.removeSubscriber);

    const transformedSnapshot: Snapshot<any, any> = {
      ...snapshot,
      id: undefined,
      config: Promise.resolve(null),
      data: undefined,
      timestamp: undefined,
      label: undefined,
      events: undefined,
      mappedSnapshotData: transformMappedSnapshotData(snapshot.mappedSnapshotData),
      snapshot: this.transformSnapshotMethod<U, T>(snapshot.snapshot),
      initializedState: transformedInitialState,
      removeSubscriber: transformedRemoveSubscriber,
    };

    // Now apply store configuration externally
    return applyStoreConfig(transformedSnapshot, snapshot.initialConfig);
  }
    
  [Symbol.iterator](): IterableIterator<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> {
    const snapshotIterator = this.snapshots.values();

    // Create a custom iterator that maps each item to Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
    const iterator: IterableIterator<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> = {
      [Symbol.iterator]: function () {
        return this;
      },
      next: function () {
        const next = snapshotIterator.next();
        if (next.done) {
          return { done: true, value: undefined as any };
        }

        // Use the type guard to ensure the value is a valid Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
        let snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
        if (isSnapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>(next.value)) {
          snapshot = next.value;
        } else if (next.value instanceof SnapshotStore) {
          snapshot = convertSnapshotStoreToSnapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>(next.value) 
        } else {
          // Handle the case where the value is not a valid Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
          console.warn(`Value is not a valid Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>:`, next.value);
          return { done: false, value: undefined as any }; // or throw an error based on your logic
        }

        // Convert Snapshot<BaseData> to Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> using snapshotType function
        const value: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = snapshotType(snapshot);
        return { done: false, value };
      },
    };

    return iterator;
  }


















  //______________REMOVE FRROMM HERE______________

    

  createInitSnapshot(
    id: string,
    initialData: T,
    snapshotData: SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    category: symbol | string | Category | undefined
  ): Promise<SnapshotWithCriteriaAsBase<T, K, Meta, ExcludedFields>> {
    return new Promise(async (resolve, reject) => {
      try {
        if (!snapshotData) {
          return reject(new Error("snapshotData is null or undefined"));
        }

        let data: Data;
        if ("data" in snapshotData && snapshotData.data) {
          data = snapshotData.data;
        } else if (snapshotData.data && "data" in snapshotData.data) {
          data = snapshotData.data.data;
        } else {
          return reject(new Error("snapshotData does not have a valid 'data' property"));
        }

        id =
          typeof data.id === "string"
            ? data.id
            : String(
                UniqueIDGenerator.generateID(
                  "SNAP",
                  "defaultID",
                  NotificationTypeEnum.GeneratedID
                )
              );

        const snapshot: SnapshotWithCriteriaAsBase<T, K, Meta, ExcludedFields> = {
          id,
          data,
          timestamp: snapshotData.timestamp || new Date(),
          category: this.category,
          topic: this.topic,
          initializedState: {},
          criteria: {}, // Example placeholder for search criteria
          unsubscribe: function () {
            throw new Error("Function not implemented.");
          },
          fetchSnapshot: async () => {
            throw new Error("Function not implemented.");
          },
          handleSnapshot: async () => {
            throw new Error("Function not implemented.");
          },
          events: undefined,
          meta: {},
        };

        const storeId = snapshotApi.getSnapshotStoreId(String(this.snapshotId));
        const snapshotManager = await useSnapshotManager<T, K, Meta, ExcludedFields>(await storeId);

        this.snapshots.push(snapshot);

        if (this.delegate && this.delegate.length > 0) {
          for (const delegateConfig of this.delegate) {
            if (
              delegateConfig &&
              typeof delegateConfig.createSnapshotSuccess === "function"
            ) {
              await delegateConfig.createSnapshotSuccess(
                id,
                snapshotManager,
                snapshot,
                initialData
              );
              return resolve(snapshot); // Correctly resolve the promise with the snapshot
            }
          }
          return reject(new Error("No valid delegate found for createSnapshotFailure"));
        } else {
          return reject(new Error("Delegate is undefined or empty"));
        }
      } catch (error) {
        reject(error); // Handle unexpected errors
      }
    });
  }

  createSnapshotSuccess(
    snapshotId: string,
    snapshotManager: SnapshotManager<T, K, Meta, ExcludedFields>,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    payload: { error: Error }
  ): void {
    if (snapshot.id !== undefined) {
      notify(
        String(snapshot.id) // Ensure snapshot.id is treated as a string
        // `Snapshot ${snapshot.id} created successfully.`,
        // "",
        // new Date(),
        // NotificationTypeEnum.SUCCESS,
        // NotificationPosition.TopRight
      );
    } else {
      console.error("Snapshot id is undefined.");
      // Optionally handle the case where snapshot.id is undefined
    }
  }

  clearSnapshotSuccess: (context: {
    useSimulatedDataSource: boolean;
    simulatedDataSource: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
  }) => void = (context) => {
    try {
      const configs = await getConfigPromise(); // Await the promise
      configs.forEach((config) => {
        if (config.clearSnapshotSuccess) {
          config.clearSnapshotSuccess(context);
        }
      });
    } catch (error) {
      console.error("Error clearing snapshot:", error);
    }
    this.notifySuccess("Snapshot cleared successfully.");
  };

  clearSnapshotFailure: (context: {
    useSimulatedDataSource: boolean;
    simulatedDataSource: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
  }) => void = (context) => {
    this.getDelegate(context).clearSnapshotFailure();
    this.notifyFailure("Error clearing snapshot.");
  };

  createSnapshotFailure(
    snapshotId: string,
    snapshotManager: SnapshotManager<T, K, Meta, ExcludedFields>,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    payload: { error: Error }
  ): void {
    notify(
      "createSnapshotFailure",
      `Error creating snapshot: ${payload.error.message}`,
      "",
      new Date(),
      NotificationTypeEnum.ERROR,
      NotificationPosition.TopRight
    );
  }

  setSnapshotSuccess(
    snapshotData: SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    subscribers: SubscriberCollection<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ): void {
    this.handleDelegate(
      (delegate) => delegate.setSnapshotSuccess.bind(delegate),
      snapshotData,
      subscribers
    );
  }

  setSnapshotFailure(error: Error): void {
    this.handleDelegate(
      (delegate) => delegate.setSnapshotFailure.bind(delegate),
      error
    );
  }

  async createSnapshotFailure(
    snapshotId: string,
    snapshotManager: SnapshotManager<T, K, Meta, ExcludedFields>,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    payload: { error: Error }
  ): Promise<void> {
    notify(
      "createSnapshotFailure",
      `Error creating snapshot: ${payload.error.message}`,
      "",
      new Date(),
      NotificationTypeEnum.ERROR,
      NotificationPosition.TopRight
    );

    await this.handleDelegate(
      (delegate) => delegate.createSnapshotFailure.bind(delegate),
      snapshotId,
      snapshotManager,
      snapshot,
      payload
    );

    return Promise.reject(payload.error);
  }

  updateSnapshots(): void {
    this.handleDelegate((delegate) => delegate.updateSnapshots.bind(delegate));
  }

  /**
 * Deletes a snapshot from the store with proper type safety
 * 
 * @template T - Base data type
 * @template K - Extended data type (defaults to T)
 * @template Meta - Metadata type
 * @template ExcludedFields - Fields to exclude
 * @param {string} snapshotId - ID of snapshot to delete
 * @param {boolean} [permanent=false] - Whether to permanently delete
 * @returns {Promise<boolean>} - True if deletion was successful
 */
  deleteSnapshot(
    snapshotId: string,
    permanent: boolean = false
  ): Promise<boolean> {
    return new Promise((resolve, reject) => {
      try {
        // Validate input
        if (!snapshotId) {
          throw new Error('Snapshot ID is required');
        }

        // Find the snapshot in storage
        const snapshot = this.snapshots.get(snapshotId);
        if (!snapshot) {
          resolve(false); // Not found = considered successful
          return;
        }

        // Handle deletion based on type
        if (permanent) {
          // Permanent deletion
          this.snapshots.delete(snapshotId);
          this.deletedSnapshots.delete(snapshotId); // Remove from deleted set
          
          // Notify subscribers
          this.notifySubscribers({
            type: 'delete',
            snapshotId,
            permanent: true
          });

          resolve(true);
        } else {
          // Soft deletion
          snapshot.deleted = true;
          snapshot.updatedAt = new Date();
          this.deletedSnapshots.add(snapshotId);

          // Mark versions as deleted
          if (snapshot.versions) {
            snapshot.versions.forEach(version => {
              version.deleted = true;
            });
          }

          // Notify subscribers
          this.notifySubscribers({
            type: 'delete',
            snapshotId,
            permanent: false
          });

          resolve(true);
        }
      } catch (error) {
        console.error(`Error deleting snapshot ${snapshotId}:`, error);
        reject(error);
      }
    });
  }

  

  updateSnapshotsSuccess(
    snapshotData: (
      subscribers: Subscriber<T, K, Meta, ExcludedFields>[],
      snapshot: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
    ) => void
  ): void {
    this.handleDelegate(
      (delegate) => delegate.updateSnapshotsSuccess.bind(delegate),
      snapshotData
    );
  }

  updateSnapshotsFailure(error: Payload): void {
    this.handleDelegate(
      (delegate) => delegate.updateSnapshotsFailure.bind(delegate),
      error
    );
  }

  initSnapshot(
    snapshot: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null,
    snapshotId: string,
    snapshotData: SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    category: Category | undefined,    categoryProperties: CategoryProperties | undefined,
    snapshotConfig: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    callback: (snapshotStore: SnapshotStore<any, any>) => void
  ): void {
    this.handleDelegate(
      (delegate) => delegate.initSnapshot.bind(delegate),
      snapshot,
      snapshotId,
      snapshotData,
      category,
      snapshotConfig,
      callback
    );
  }

  takeSnapshotSuccess(snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): void {
    this.handleDelegate(
      (delegate) => delegate.takeSnapshotSuccess.bind(delegate),
      snapshot
    );
  }

  takeSnapshotsSuccess(snapshots: T[]): void {
    this.handleDelegate(
      (delegate) => delegate.takeSnapshotsSuccess.bind(delegate),
      snapshots
    );
  }

  configureSnapshotStore(
    snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    storeId: number,
    data: Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
    events: Record<string, CalendarManagerStoreClass<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>,
    dataItems: RealtimeDataItem<T, K, Meta, ExcludedFields>[],
    newData: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    payload: ConfigureSnapshotStorePayload<T, K, Meta, ExcludedFields>,
    store: SnapshotStore<any, K>,
    callback: (snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void
  ): void {
    this.handleDelegate(
      (delegate) => delegate.configureSnapshotStore.bind(delegate),
      snapshotStore,
      storeId,
      data,
      events,
      dataItems,
      newData,
      payload,
      store,
      callback
    );
  }

  updateSnapshotStore(
    snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, // Current snapshot store
    snapshotId: string,
    data: Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
    events: Record<string, CalendarManagerStoreClass<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>,
    dataItems: RealtimeDataItem<T, K, Meta, ExcludedFields>[],
    newData: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, // New snapshot data
    payload: ConfigureSnapshotStorePayload<T, K, Meta, ExcludedFields>,
    store: SnapshotStore<any, K>, // New snapshot store after update
    callback: (snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void
  ): { type: string; payload: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> } {
    if (
      this.delegate &&
      Array.isArray(this.delegate) &&
      this.delegate.length > 0
    ) {
      const delegate = this.delegate.find(
        (
          d
        ): d is SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> & {
          snapshotStore: Function;
        } => d != null && typeof d.snapshotStore === "function"
      );

      if (delegate && delegate.snapshotStore) {
        delegate.snapshotStore(
          snapshotStore, // Passing the current snapshot store
          snapshotId,
          data,
          events,
          dataItems,
          newData, // Passing the new snapshot data
          payload,
          store, // Passing the new snapshot store after update
          callback
        );
      } else {
        console.error("No valid delegate found for snapshotStore.");
      }
    } else {
      console.error("Delegate is undefined or empty.");
    }

    return {
      type: "UPDATE_SNAPSHOT_STORE",
      payload: snapshotStore, // Ensure snapshotStore is returned as part of the action payload
    };
  }




  setData(data: Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>): void {
    this.handleDelegate((delegate) => delegate.setData, data);
  }

  getState(): any {
    const result = this.handleDelegate((delegate) => delegate.getState);
    return result !== undefined ? result : undefined;
  }

  setState(state: any): void {
    this.handleDelegate((delegate) => delegate.setState, state);
  }


  handleSnapshot(
    id: string,
    snapshotId: string,
    snapshot: T | null,
    snapshotData: T,
    category: Category | undefined,    categoryProperties: CategoryProperties | undefined,
    callback: (snapshot: T) => void,
    snapshots: SnapshotsArray<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    type: string,
    event: SnapshotEvent<T, K, Meta, ExcludedFields>,
    snapshotContainer?: T,
    snapshotStoreConfig?: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null
  ): Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null> {
    const result = this.handleDelegate(
      (delegate) => delegate.handleSnapshot,
      id,
      snapshotId,
      snapshot,
      snapshotData,
      category,
      callback,
      snapshots,
      type,
      event,
      snapshotContainer,
      snapshotStoreConfig
    );

    return result !== undefined ? result : Promise.resolve(null);
  }



  setSnapshot(snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): void {
    const firstDelegate = this.delegate?.[0];
    if (firstDelegate && typeof firstDelegate.setSnapshot === "function") {
      firstDelegate.setSnapshot(snapshot);
    } else {
      console.error("No valid delegate found to set snapshot.");
    }
  }

  
  setSnapshotData(
    id: string,
    snapshotId: string,
    snapshot: T | null,
    snapshotData: T,
    category: Category | undefined,
    categoryProperties: CategoryProperties | undefined,
    callback: (snapshot: T) => void,
    snapshots: SnapshotsArray<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    type: string,
    event: SnapshotEvent<T, K, Meta, ExcludedFields>,
    snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    data: Map<string, T>,
    subscribers: Subscriber<T, K, Meta, ExcludedFields>[],
    snapshotData: Partial<SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
    id?: string
  ): Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> {
    // Update the config with the provided snapshot data
    if (this.config) {
      this.config = this.config.map((configItem) => ({
        ...configItem,
        ...snapshotData,
        initialState:
          snapshotData.initialState !== undefined
            ? snapshotData.initialState
            : configItem.initialState !== undefined
            ? configItem.initialState
            : null, // Handle undefined explicitly
      }));
    } else {
      this.config = [
        {
          ...snapshotData,
          initialState:
            snapshotData.initialState !== null
              ? snapshotData.initialState
              : null,
        },
      ];
    }

    // Retrieve the current snapshot using the delegate
    const currentSnapshot = this.handleDelegate((delegate) => delegate);

    if (currentSnapshot) {
      // Create a new SnapshotStoreConfig object with updated state and snapshot data
      const updatedSnapshot: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = {
        ...currentSnapshot,
        ...snapshotData,
        initialState:
          snapshotData.initialState !== undefined
            ? snapshotData.initialState
            : currentSnapshot.initialState !== undefined
            ? currentSnapshot.initialState
            : null, // Handle undefined explicitly
        state: currentSnapshot.state
          ? this.filterInvalidSnapshots(currentSnapshot.state)
          : null,
      };

      // Transform the updated snapshot to ensure it matches the expected type
      const transformedSnapshot = this.transformSnapshotConfig(updatedSnapshot);

      // Safely update the first element of the delegate array if it exists
      if (this.delegate && this.delegate.length > 0) {
        this.delegate[0] = transformedSnapshot;
      } else {
        // If the delegate array is empty, initialize it with the transformed snapshot
        this.delegate = [transformedSnapshot];
      }

      // Notify subscribers of the update, passing the relevant snapshot data
      this.notifySubscribers(subscribers, snapshotData);
    }
    return "";
  }


  setSnapshots(snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): void {
    this.handleDelegate((delegate) => delegate.setSnapshots, snapshots);
  }

  clearSnapshot(): void {
    this.handleDelegate((delegate) => delegate.clearSnapshot);
  }

  mergeSnapshots(snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, category: string): void {
    this.handleDelegate(
      (delegate) => delegate.mergeSnapshots,
      snapshots,
      category
    );
  }

  reduceSnapshots<U, Meta>(
    callback: (acc: U, snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => U,
    initialValue: U
  ): U | undefined {
    return this.handleDelegate(
      (delegate) => delegate.reduceSnapshots,
      callback,
      initialValue
    );
  }

  sortSnapshots(): void {
    this.handleDelegate((delegate) => delegate.sortSnapshots);
  }

  filterSnapshots(): void {
    this.handleDelegate((delegate) => delegate.filterSnapshots);
  }

  async mapSnapshotsAO(
    storeIds: number[],
    snapshotId: string,
    category: Category | undefined,    categoryProperties: CategoryProperties | undefined,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    timestamp: string | number | Date | undefined,
    type: string,
    event: SnapshotEvent<T, K, Meta, ExcludedFields>,
    id: number,
    snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    data: T
  ): Promise<SnapshotContainer<T, K, Meta, ExcludedFields>> {
    try {
      const snapshotMap = new Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>();
      snapshotMap.set(snapshotId, snapshot);

      const snapshotsArray: SnapshotsArray<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = Array.from(
        snapshotMap.values()
      );
      const snapshotsObject: SnapshotsObject<T, K, Meta, ExcludedFields> = Object.fromEntries(
        snapshotMap.entries()
      );

      return {
        id: snapshotId,
        category: category as string,
        timestamp:
          timestamp instanceof Date
            ? timestamp.toISOString()
            : timestamp?.toString() || "",
        snapshot: snapshotMap.get(snapshotId) as Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
        snapshotStore,
        snapshotData: snapshotStore, // Assuming this is similar to snapshotStore; adjust if needed
        data,
        snapshotsArray,
        snapshotsObject,
      };
    } catch (error) {
      console.error("Error mapping snapshots:", error);
      throw new Error("Failed to map snapshots");
    }
  }

  findSnapshot(
    predicate: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => boolean
  ): Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined {
    // Ensure that this.delegate is defined before iterating
    if (!this.delegate) {
      return undefined;
    }

    // Iterate over each delegate to find a matching snapshot
    for (const delegate of this.delegate) {
      const foundSnapshot = delegate.findSnapshot(predicate);
      if (foundSnapshot) {
        return foundSnapshot;
      }
    }

    // Return undefined if no matching snapshot is found
    return undefined;
  }


  notify(
    id: string,
    message: string,
    content: Content<T, K, Meta, ExcludedFields>,
    data: any,
    date: Date,
    type: NotificationType,
    notificationPosition?: NotificationPosition | undefined
  ): void {
    const firstDelegate = this.getFirstDelegate();
    firstDelegate.notify(id, message, content, date, type);
  }

  notifySubscribers(
    message: string,
    subscribers: Subscriber<T, K, Meta, ExcludedFields>[],
    data: Partial<SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>
  ): Subscriber<T, K, Meta, ExcludedFields>[] {
    const firstDelegate = this.getFirstDelegate();
    return firstDelegate.notifySubscribers(subscribers, data);
  }

  unsubscribe(
    unsubscribeDetails: {
      userId: string;
      snapshotId: string;
      unsubscribeType: string;
      unsubscribeDate: Date;
      unsubscribeReason: string;
      unsubscribeData: any;
    },
    callback: Callback<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> | null
  ): void {
    const firstDelegate = this.getFirstDelegate();
    firstDelegate.unsubscribe(unsubscribeDetails, callback);
  }

  async fetchSnapshot(
    callback: (
      snapshotId: string,
      payload: FetchSnapshotPayload<K>,
      snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      payloadData: T | Data,
      category: Category | undefined,      categoryProperties: CategoryProperties | undefined,
      timestamp: Date,
      data: T,
      delegate: SnapshotWithCriteriaAsBase<T, K, Meta, ExcludedFields>[]
    ) => void
  ): Promise<{
    id: any;
    category: symbol | string | Category | undefined
    categoryProperties: CategoryProperties;
    timestamp: any;
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
    data: T;
    getItem?: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined;
  }> {
    try {
      const firstDelegate = this.getFirstDelegate(); // Safely access delegate
      const fetchedSnapshot = await firstDelegate.fetchSnapshot(
        snapshotId,
        category,
        this.timestamp,
        callback,
        data
      );

      // Return the required object structure
      return {
        id: fetchedSnapshot.id,
        category: fetchedSnapshot.category,
        categoryProperties: fetchedSnapshot.categoryProperties,
        timestamp: fetchedSnapshot.timestamp,
        snapshot: fetchedSnapshot.snapshot,
        data: fetchedSnapshot.data as T,
        getItem: fetchedSnapshot.getItem,
      };
    } catch (error) {
      console.error("Error fetching snapshot:", error);
      throw error; // Handle or propagate the error as needed
    }
  }

  fetchSnapshotSuccess(
    snapshotId: string,
    snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    payload: FetchSnapshotPayload<K> | undefined,

    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    data: T,
    snapshotData: (
      snapshotManager: SnapshotManager<SnapshotUnion<BaseData, Meta>, T>,
      subscribers: Subscriber<T, K, Meta, ExcludedFields>[],
      snapshot: Snapshot<SnapshotUnion<BaseData, Meta>, T>
    ) => void
  ): void {
    const delegate = this.ensureDelegate();
    delegate.fetchSnapshotSuccess(
      snapshotId,
      snapshotStore,
      payload,
      snapshot,
      data,
      snapshotData
    );
  }

  fetchSnapshotFailure(
    snapshotId: string,
    snapshotManager: SnapshotManager<T, K, Meta, ExcludedFields>,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    date: Date | undefined,
    payload: { error: Error }
  ): void {
    const delegate = this.ensureDelegate();
    delegate.fetchSnapshotFailure(payload);
  }

  getSnapshots(category: string, data: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): void {
    const delegate = this.ensureDelegate();
    const convertedData: SnapshotsArray<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = convertToSnapshotArray(data);
    delegate.getSnapshots(category, convertedData);
  }

  getAllSnapshots(
    storeId: number,
    snapshotId: string,
    snapshotData: T,
    timestamp: string,
    type: string,
    event: SnapshotEvent<T, K, Meta, ExcludedFields>,
    id: number,
    snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    category: Category | undefined,    categoryProperties: CategoryProperties | undefined,
    dataStoreMethods: DataStore<T, K, Meta, ExcludedFields>,
    data: T,
    dataCallback?: (
      subscribers: Subscriber<T, K, Meta, ExcludedFields>[],
      snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
    ) => Promise<Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>
  ): Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]> {
    const delegate = this.ensureDelegate();

    const transformSnapshots = (snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] => {
      // Assuming Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> has a structure similar to an array or can be mapped
      return snapshots as unknown as Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
    };

    // Use dataCallback if it is provided
    if (dataCallback) {
      return delegate.getAllSnapshots(dataCallback).then(transformSnapshots);
    } else {
      // If no callback, default to calling the delegate's method with data
      return delegate
        .getAllSnapshots(() => Promise.resolve([]))
        .then(transformSnapshots);
    }
  }

  getSnapshotStoreData(
    snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshotId: string,
    snapshotData: SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ): Promise<SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> {
    const delegate = this.ensureDelegate();
    return delegate.getSnapshotStoreData(
      snapshotStore,
      snapshot,
      snapshotId,
      snapshotData
    );
  }


  getOwner?(): string {
    return this.ownerId || "";
  }

  async addDebugInfo(configId: string, message: string, operation?: string): Promise<void> {
    const { addDebugInfo } = await import("@/utils/web3/debugInfoUtils");
    addDebugInfo(this.configs, configId, message, operation);
  }

  async storeTempData(configId: string, tempResults: T[]): Promise<void> {
    const { storeTempData } = await import("@/utils/tempDataUtils");
    storeTempData(this.configs, configId, tempResults);
  }

  async getTempData(configId: string): Promise<T[] | undefined> {
    const { getTempData } = await import("@/utils/tempDataUtils");
    return getTempData(this.configs, configId);
  }
}

// 1. Core utility methods first
Object.assign(SnapshotStore.prototype, UtilMethods);

// 2. Data management methods
Object.assign(SnapshotStore.prototype, DataMethods);

// 3. Configuration methods (setup before other operations)
Object.assign(SnapshotStore.prototype, ConfigMethods);

// 4. Validation methods (needed for many operations)
Object.assign(SnapshotStore.prototype, ValidationMethods);

// 5. Core snapshot operations
Object.assign(SnapshotStore.prototype, SnapshotMethods);
Object.assign(SnapshotStore.prototype, SnapshotMethodsImplementation);

// 6. Version management
Object.assign(SnapshotStore.prototype, VersionMethods);

// 7. Data operations
Object.assign(SnapshotStore.prototype, TransformMethods);
Object.assign(SnapshotStore.prototype, FetchMethods);
Object.assign(SnapshotStore.prototype, BatchMethods);

// 8. Lifecycle and state management
Object.assign(SnapshotStore.prototype, LifecycleMethods);
Object.assign(SnapshotStore.prototype, StoreManagementMethods);

// 9. Subscription and notification (often depend on other methods)
Object.assign(SnapshotStore.prototype, SubscriptionMethods);
Object.assign(SnapshotStore.prototype, NotificationMethods);

// 10. Utility methods that might use everything else
Object.assign(SnapshotStore.prototype, DataMethods);


// Usage Examples #info #todo
// typescript
// // Start idle timeout with default duration (5 minutes)
// store.startIdleTimeout();

// // Start with custom duration (2 minutes)
// store.startIdleTimeout(120000);

// // Register callbacks
// store.onIdle(() => {
//   console.log('Store is now idle - performing background tasks');
// });

// store.onActivity(() => {
//   console.log('Store activity detected - resuming normal operations');
// });

// // Get current idle status
// const status = store.getIdleStatus();
// console.log('Is idle:', status.isIdle);

// // Update timeout duration
// store.updateIdleTimeoutDuration(600000); // 10 minutes

// // Stop idle monitoring
// store.stopIdleTimeout();




 // Example usage of the Snapshot interface
 const takeSnapshot = async () => {
   const snapshotData = await fetchInitialSnapshotData();
   const { createSnapshot } = useSnapshotStore(addToSnapshotList);
   const snapshot = await takeSnapshot();
   console.log(snapshot);
 };

 const category = (process.argv[3] as keyof CategoryProperties) ?? "isHiddenInList";
//  const dataStoreMethods = {};




export default SnapshotStore;
export { SnapshotStoreReference, U };