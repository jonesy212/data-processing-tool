// SnapshotStore.ts

import { SnapshotCategory } from '@/app/api/getSnapshotEndpoint';
import { FilterMethods } from 'app/snapshots/methods/FilterMethods'
import { Label } from '@/app/branding/BrandingSettings';
import { SharedIdentifiers, SharedStatusFlags, SharedTimestamps } from '@/app/documents/RelatedProps';
import { Data } from '@/app/models/data/Data';
import { PriorityValue } from '@/app/pages/searches/CriteriaType';
import { FilterCriteria } from '@/app/pages/searches/FilterCriteria';
import { U, WrappedU } from '@/app/snapshots/isCompatibleTempData';
import { MethodBinder, bindAllMethods } from '@/app/snapshots/methods/methodBinder';
import { Snapshot } from '@/app/snapshots/Snapshot';
import { SnapshotStoreReference } from '@/app/snapshots/SnapshotStoreReference';
import { UpdateSnapshotParams } from '@/app/snapshots/UpdateSnapshotParams';
import { AllTypes } from '@/app/typings/PropTypes';
import { VersionHistory } from '@/app/versions/VersionData';

import getSnapshotStoreConfig from '@/app/api/SnapshotApi';
import { UnifiedMetadata } from '@/app/config/MetaDataOptions';
import { ProjectMetadata, StructuredMetadata } from '@/app/config/StructuredMetadata';
import UniqueIDGenerator from '@/app/generators/GenerateUniqueIds';
import { CategoryProperties } from '@/app/pages/personas/ScenarioBuilder';
import { CoreSnapshot } from '@/app/snapshots/CoreSnapshot';
import { SnapshotMethodsImplementation } from '@/app/snapshots/methods/snapshotMethods';
import { ValidationMethods } from '@/app/snapshots/methods/validationMethods';
import { Subscriber } from '@/app/subscribers/Subscriber';
import { Subscription } from '@/app/subscriptions/Subscription';
import { NotificationType, NotificationTypeEnum } from '@/state/context/NotificationContext';

import { Video } from '@/app/typings/videoTypes/Video';

import getConfig from 'next/config';

import { SnapshotWithData } from '@/app/components/calendar/CalendarApp';
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { SchemaField } from '@/app/config/metadata/SchemaField';
import { Attachment } from '@/app/documents/attachment/Attachment';
import { CombinedEvents, SnapshotManager, SnapshotStoreOptions } from '@/app/hooks/useSnapshotManager';
import { Category } from '@/app/libraries/categories/generateCategoryProperties';
import { Content } from '@/app/models/content/AddContent';
import { BaseData } from '@/app/models/data/Data';
import { dataStoreMethods } from '@/app/models/data/dataStoreMethods';
import { NotificationPosition, StatusType } from '@/app/models/data/StatusType';
import { DebugInfo, TempData } from '@/app/models/data/TempData';
import { SearchCriteria } from '@/app/pages/searches/SearchCriteria';
import { DataStoreMethods, DataStoreWithSnapshotMethods } from '@/app/projects/DataAnalysisPhase/DataProcessing/DataStoreMethods';
import { CreateSnapshotStoresPayload, Payload, UpdateSnapshotPayload } from '@/app/server/database/Payload';
import { defaultSubscribeToSnapshots } from '@/app/snapshots/defaultSubscribeToSnapshots';
import { FetchSnapshotPayload } from '@/app/snapshots/FetchSnapshotPayload';
import {
  SnapshotUnion,
  Snapshots,
  SnapshotsArray,
  SnapshotsObject
} from '@/app/snapshots/LocalStorageSnapshotStore';
import { ConfigMethods, applyStoreConfig } from '@/app/snapshots/methods/configMethods';
import { UtilMethods } from '@/app/snapshots/methods/utilMethods';
import CalendarManagerStoreClass from '@/app/state/stores/CalendarManagerStore';
import { CommonDataStoreMethods, DataStore, EventRecord, InitializedState } from '@/app/state/stores/DataStore';
import { AuditRecord } from '@/app/subscribers/Subscriber';
import { SubscriberCollection } from '@/app/subscribers/SubscriberCollection';
import { UnsubscribeDetails } from '@/app/typings/eventHandlers/DynamicEventHandlerExample';
import { RealtimeDataItem } from "@/app/typings/realtimeTypes";
import { convertSnapshotStoreToSnapshot, convertToDataStore, isSnapshotStore, snapshotType } from '@/app/typings/YourSpecificSnapshotType';
import { Version } from '@/app/versions/Version';
import { addToSnapshotList, convertToSnapshotArray, isSnapshot, isSnapshotStoreConfig, snapshotId } from '@/utils/snapshotUtils';

import { SnapshotOperation } from '@/app/actions/SnapshotActions';
import { createSnapshotStores } from '@/app/snapshots/newStoreUtils';
import { ConfigureSnapshotStorePayload, RetentionPolicy, SnapshotConfig } from '@/app/snapshots/SnapshotConfig';
import { SnapshotContainer, SnapshotContainerType, SnapshotDataType } from '@/app/snapshots/SnapshotContainer';
import { SnapshotData } from '@/app/snapshots/SnapshotData';
import { delegate, notifySubscribers, subscribeToSnapshot, subscribeToSnapshots } from '@/app/snapshots/snapshotHandlers';
import { SnapshotItem } from '@/app/snapshots/SnapshotList';
import { SnapshotOperations, getSnapshotItems } from '@/app/snapshots/snapshotOperations';
import { SnapshotStoreMethods } from '@/app/snapshots/SnapshotStoreMethods';
import { InitializedDataStore, SnapshotWithCriteriaAsBase } from '@/app/snapshots/SnapshotStoreOptions';
import { SnapshotWithCriteriaContract, TagsRecord, data } from '@/app/snapshots/SnapshotWithCriteria';
import { Callback } from "@/app/subscribers/subscribeToSnapshotsImplementation";
import { SnapshotEvents } from '@/app/typings/snapshotTypes';
import { SnapshotStoreProps, useSnapshotStore } from './useSnapshotStore';


import { searchAPI } from "@/app/api/ApiSearch";
import { ChatRoom } from "@/app/communications/ChatRoom";
import { Sender } from '@/app/components/communications/CommunicationPage';
import { SearchResult } from "@/app/components/routing/SearchResult";
import { BaseEntity } from '@/app/config/BaseConfig';
import { Message } from "@/app/generators/GenerateChatInterfaces";
import { BatchMethods } from '@/app/snapshots/methods/batchMethods';
import * as DataMethods from '@/app/snapshots/methods/dataMethods';
import * as FetchMethods from '@/app/snapshots/methods/fetchMethods';
import { LifecycleMethods } from '@/app/snapshots/methods/lifecycleMethods';
import { MapMethods } from "@/app/snapshots/methods/mappingMethods";
import * as SnapshotMethods from '@/app/snapshots/methods/snapshotMethods';
import { SubscriptionMethods } from '@/app/snapshots/methods/subscriptionMethods';
import * as TransformMethods from '@/app/snapshots/methods/transformMethods';
import { SnapshotStoreConfigWithCore } from '@/app/snapshots/methods/transformMethods';
import * as VersionMethods from '@/app/snapshots/methods/versionMethods';
import { SnapshotDataParams } from "@/app/snapshots/SnapshotDataParams";
import { SnapshotSubscriptionMethods } from '@/app/snapshots/SnapshotMethods';
import { SnapshotSecurity } from "@/app/snapshots/SnapshotSecurity";
import { SnapshotStoreConfig } from '@/app/snapshots/SnapshotStoreConfig';
import { SnapshotContext } from "@/app/snapshots/SnapshotSubscriberManagement";
import { SnapshotWithCriteria } from '@/app/snapshots/SnapshotWithCriteria';
import { SnapshotEvent } from '@/app/typings/snapshotTypes';
import { notify } from '@/utils/snapshotUtils';
import { transformSubscriberAdvanced, transformSubscriberMappedAdvanced } from './methods/advancedTransform';

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
    SharedIdentifiers<T, K>,
    DataStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    SnapshotWithCriteriaContract<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    SnapshotStoreMethods<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    CommonDataStoreMethods<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
{
  dataItems?: RealtimeDataItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] | undefined = undefined;
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
  subscription?: Subscription<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null = null;
  description?: string = "";
  category?: Category;
  options?: SnapshotStoreOptions<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = {} as SnapshotStoreOptions<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  categoryProperties: CategoryProperties | undefined;
  message: any = undefined;
  timestamp: string | number | Date | undefined;
  logging?: boolean;
  autoSync?: boolean;
  structuredMetadata: StructuredMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = {} as StructuredMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  storeId: number = 0;
  videos?: Video[];
  maxAge: string | number | undefined = undefined;

  // For storing store references
  stores: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] = [];

// For store creation factory
  createStore?: (props: SnapshotStoreProps<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => 
  SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  
  isCompressed?: boolean;
  isSubscribed: boolean = false;
  snapshotMethods?: SnapshotStoreMethods<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] = [];

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
  metadata?: UnifiedMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined = undefined;
  meta: StructuredMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined = undefined;
  mappedSnapshot?: Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> | undefined = undefined;
  tags?: TagsRecord<T>| string[] | undefined;
  priority?: PriorityValue 

  
  // Then provide proper type guards
  isMessageString(): this is { message: string | undefined } {
    return typeof this.message === 'string' || this.message === undefined;
  }

  isMessageFunction(): this is { 
    message: (type: NotificationType, content: string, additionalData?: string, userId?: number, sender?: Sender<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, 
      channel?: ChatRoom) => Message<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
      
  } {
    return typeof this.message === 'function';
  }

  isExpired(): boolean {
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

  // <------------ CommonDataStoreMethods ------------>

  getSnapshotByKey!: (key: string) => Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined;
  mapSnapshotStore!: (
    storeId: number,
    snapshotId: string,
    categoryProperties: CategoryProperties | undefined,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    timestamp: string | number | Date | undefined,
    type: string,
    event: Event,
    id: number,
    snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    data: T,
    category?: Category
  ) => Promise<SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined>;
  getSubscribers!: (
    snapshotId: string,
    categoryProperties: CategoryProperties | undefined,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    timestamp: string | number | Date | undefined,
    type: string,
    event: Event,
    id: number,
    snapshotStore: SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    data: T,
    category?: Category
  ) => Promise<Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>;
  getDataWithSearchCriteria!: (criteria: FilterCriteria | SearchCriteria | MixedCriteria) => T[];
  addData!: (id: string, data: Partial<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>) => void;

  
  //<------ SUBSCRIBER METHODS ------>
  public defaultSubscribeToSnapshots: SnapshotSubscriptionMethods<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>["defaultSubscribeToSnapshots"] = (
    snapshotId: string,
    callback: (snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null = null
  ) => {
    return defaultSubscribeToSnapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>(
      snapshotId,
      callback as unknown as (snapshots: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]) => Subscriber<BaseData, T> | null,
      snapshot
    );
  };

  public getNotifyFailure(message: string): void {
    this.privateNotifyFailure(message);
  }

  notify!: (
    id: string, 
    message: string, 
    content: Content<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, 
    data: any, 
    date: Date, 
    type: NotificationType
  ) => void;

  // getSubscribers!: <
  //   U extends BaseDataEntity,
  //   K extends U = U,
  //   Meta extends DefaultMeta<U, K> = DefaultMeta<U, K>
  // >(
  //   subscribers: Subscriber<U, K>[], 
  //   snapshots: Snapshots<U, K, Meta>
  // ) => Promise<{ subscribers: Subscriber<U, K>[]; snapshots: Snapshots<U, K, Meta> }>;

  // STATE MANAGEMENT TYPE DECLARATIONS
  getCurrentState!: <  T extends BaseDataEntity = BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T>() => Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null;

  getStates!: <  T extends BaseDataEntity = BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T>() => Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];

  hasSnapshots!: <  T extends BaseDataEntity = BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T>() => Promise<boolean>;

  equals!: <
    T extends BaseDataEntity = BaseDataEntity,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T
  >(
    otherStore: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ) => Promise<boolean>;

  initializeWithData!: <  
    T extends BaseDataEntity = BaseDataEntity,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T
  >(
    data: SnapshotUnion<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]
  ) => void;

  addToSnapshotList!: <
    T extends BaseDataEntity = BaseDataEntity,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T
  >(
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
    subscribers: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]
  ) => Promise<Subscription<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>;

  getSnapshotsBySubscriber!: <
    T extends BaseDataEntity = BaseDataEntity,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T
  >(
    subscriber: string
  ) => Promise<BaseData[]>;
    
  findIndex(predicate: (snapshot: SnapshotUnion<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => boolean): number {
    if (Array.isArray(this.snapshots)) {
      return this.snapshots.findIndex(predicate);
    } else {
      // Convert the object values to SnapshotUnion<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
      const snapshotArray: SnapshotUnion<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] = Object.values(
        this.snapshots
      ) as SnapshotUnion<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
      return snapshotArray.findIndex(predicate);
    }
  }

  splice(index: number, count: number): SnapshotUnion<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] {
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
    snapshotIdOrParams?: string | number | null | UpdateSnapshotParams<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, // Make optional
    data?: Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>, // Make optional
    newData?: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, // Make optional
    timestamp?: Date, // Make optional
    category?: Category, // Make optional
    events?: Record<string, CalendarManagerStoreClass<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>, // Make optional
    snapshotStore?: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, // Make optional
    dataItems?: RealtimeDataItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[], // Make optional
    payloadData?: T | K, // Make optional
    mappedSnapshotData?: Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>, // Make optional
    delegate?: SnapshotWithCriteria<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[], // Make optional
    payload?: UpdateSnapshotPayload<T>, // Make optional
    store?: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, // Make optional
    callback?: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void, // Make optional
    snapshotManager?: SnapshotManager<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  ) => Promise<{ snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> }>;


  // EVENT & HIERARCHY TYPE DECLARATIONS - validation methods
  emit!: <
    T extends BaseDataEntity = BaseDataEntity,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T
  >(
    event: string,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshotId: string,
    subscribers: SubscriberCollection<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    type: string,
    snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    dataItems: RealtimeDataItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
    criteria: SnapshotWithCriteriaAsBase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    category: symbol | string | Category | undefined
  ) => void;

  removeChild!: <
    T extends BaseDataEntity = BaseDataEntity,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T
  >(
    childId: string,
    parentId: string,
    parentSnapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    childSnapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ) => void;

  getChildren!: <
    T extends BaseDataEntity = BaseDataEntity,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T
  >(
    id: string,
    childSnapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ) => Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];

  hasChildren!: <
    T extends BaseDataEntity = BaseDataEntity,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T
  >(
    id: string
  ) => boolean;

  isDescendantOf!: <  T extends BaseDataEntity = BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T>(
    childId: string,
    parentId: string,
    parentSnapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    childSnapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ) => boolean;

  getInitialState!: <  T extends BaseDataEntity = BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T>() => Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;

  getConfigOption!: <
    T extends BaseDataEntity,
    K extends T = T,
    Meta = DefaultMeta<T, K>,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>>(
    optionKey: string
  ) => Record<string, any>;

  getTimestamp!: <  T extends BaseDataEntity = BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T>() => Date;

  // STORE MANAGEMENT TYPE DECLARATIONS
  findSnapshots!: (criteria: SearchCriteria) => Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>;
  
  // snapshotMethods 
  snapshot!: (
    id: string | number | undefined,
    snapshotId: string | null,
    snapshotData: SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    category?: Category,
    categoryProperties: CategoryProperties | undefined,
    callback: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null) => void,
    dataStore: DataStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    dataStoreMethods: DataStoreMethods<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    metadata: UnifiedMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    subscriberId: string,
    endpointCategory: string | number,
    storeProps: SnapshotStoreProps<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    subscription?: Subscription<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshotConfigData?: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshotStoreConfigData?: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshotContainer?: SnapshotContainerType<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null,
  ) => Promise<{
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null,
    snapshotData: SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  }>;

  removeSnapshot!: (snapshotToRemove: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;
  clearSnapshots!: () => void;

  takeSnapshot!: (
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    subscribers?: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]
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
  private syncInProgress: boolean = false;
  
  // private sync-related properties
  private syncQueue: Array<() => Promise<void>> = [];
  private lastSyncTime: number = 0;
  private syncRetryCount: number = 0;
  private readonly MAX_SYNC_RETRIES: number = 3;
  private syncIntervalId: NodeJS.Timeout | null = null;

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

  snapshotData: SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined = undefined;

  // Method to update config
  async updateConfig(newConfig: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): Promise<void> {
    this.config = Promise.resolve(newConfig);
  }

  // Method to get current config (non-promise version for convenience)
  async getCurrentConfig(): Promise<SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null> {
    return await this.config;
  }

// Renamed method to avoid conflict
processSnapshotData = async (
  id: string | number | null,
  data: Data<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  snapshotManager: SnapshotManager<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  events: Record<string, CalendarManagerStoreClass<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>,
  snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  dataItems: RealtimeDataItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
  newData: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  timestamp: Date,
  payload: UpdateSnapshotPayload<T>,
  category?: Category,
  categoryProperties: CategoryProperties | undefined,
  payloadData: T | K,
  mappedSnapshotData: Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
  delegate: SnapshotWithCriteria<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
  snapshotId?: string | number | null,
  storeId?: number,
  store?: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
): Promise<SnapshotDataType<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> => {
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
      // Get the current config for use in the return object
      const currentConfig = await this.config;
        
      return {
        getSnapshot: async () => {
            if (newData.id) {
              const snapshot = await this.getSnapshot(newData.id.toString());
              return snapshot || newData;
            }
          return newData;
        },
        validate: () => this.validateSnapshot(newData.id?.toString() || '', newData),
        transform: (snap) => this.transformSnapshotMethod(snap),
        id: newData.id?.toString() || "",
        storeId: this.storeId,
        category: this.category?.toString() || "",
        serialize: () => JSON.stringify(newData),
        get: (key: string) => {
          return (newData as any)[key]; // Simple property access
        },
        set: (key: string, value: any) => {
          (newData as any)[key] = value; // Simple property set
        },
        processEvent: (eventData: any, type: string, event: Event) => {
          this.processAction({
            type: 'EVENT_PROCESS',
            payload: { eventData, type, event }
          });
        },
        config: Promise.resolve(currentConfig),
        shared: this.topic || "",
        operations: this.getSnapshotOperations(), // Use existing method
        base: this.getBaseEntity(), // Use existing method
        sharedMetadata: JSON.stringify(this.metadata || {}),

        // For RETRIEVING data (simple lookup)
        getSnapshotData: (params: SnapshotDataParams<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => {
          return this.getSnapshotData(params);
        },
        
        deleteSnapshot: (id: string) => {
          this.removeSnapshot(id); // Use existing method
        },
        core: this.getCoreSnapshot(), // Use existing method
        security: this.getSecurity(), // Use existing method
        storage: this.getStorageType(), // Use existing method
        isExpired: () => this.isExpired(), // Use existing method
        data: JSON.stringify(newData.data || {}),
        snapshotStore: this,
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
    // Additional method to handle task assignment if taskIdToAssign is provided
  async assignTaskIfNeeded(): Promise<void> {
    if (this.taskIdToAssign) {
      // Implement task assignment logic here
      console.log(`Assigning task: ${this.taskIdToAssign}`);
      // Your task assignment implementation
    }
  }
  // Optional: Add a helper property if you need direct access to the data
  private _snapshotDataCache?: SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;

  // Helper method to get the actual snapshot data
  getSnapshotData(params: SnapshotDataParams<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined {
    return this._snapshotDataCache.get(params.id);
  }

  setSnapshotData(params: SnapshotDataParams<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): void {
    this._snapshotDataCache.set(params.id, params.data);
  }

  // mappingMethods assignment
  mapSnapshot!: (
    id: number,
    storeId: string | number,
    snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshotContainer: SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshotId: string,
    criteria: CriteriaType,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    type: string,
    event: SnapshotEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    callback: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void,
    mapFn: (item: T) => T,
    isAsync?: boolean
  ) => Promise<string | undefined> | Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null;
  
  mapSnapshots!: (
    storeIds: number[],
    snapshotId: string,
    category?: Category,
    categoryProperties: CategoryProperties | undefined,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,  
    timestamp: string | number | Date | undefined,
    type: string,
    event: SnapshotEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    id: number,
    snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,  
    data: T,
    callback: (
      storeIds: number[],
      snapshotId: string,
      category?: Category,
      categoryProperties: CategoryProperties | undefined,
      snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,  
      timestamp: string | number | Date | undefined,
      type: string,
      event: SnapshotEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      id: number,
      snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,  
      data: K,
      index: number
    ) => SnapshotsObject<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ) => Promise<SnapshotsArray<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>;

  mapSnapshotWithDetails!: (
    storeId: number,
    snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,  
    snapshotId: string,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,  
    type: string,
    event: SnapshotEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    callback: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void  
  ) => SnapshotWithData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null;

  
  // ✅ Transform method stubs
    transformSubscriber!: (
    subscriberId: string, 
    sub: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ) => Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;

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
  ) => Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;

  transformDelegate!: <
    T extends BaseDataEntity,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>
  >(
    delegate: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
    transformSubscriberFn: (sub: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    subscribers: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
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
  ) => SnapshotStoreConfigWithCore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | string | null;


  unsubscribe!: (snapshotId: string, 
    unsubscribeDetails: UnsubscribeDetails,
    callback: SubscriberCallbackType<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null,
    ctx?: SnapshotContext<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined
  ) => void;

  subscribeToSnapshots!: (
    snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshotId: string,
    snapshotData: SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshotConfig: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    callback: (
      snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      snapshots: SnapshotsArray<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
    ) => Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null,
    snapshots: SnapshotsArray<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    category?: Category,
    unsubscribe?: UnsubscribeDetails  
  ) => SnapshotsArray<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | [] 

  // Hybrid signatures (typing only)
  restoreSnapshot!: (
    id: string,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshotId: string,
    snapshotData: SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    savedState: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    callback: (snapshot: T) => void,
    snapshots: SnapshotsArray<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    type: string,
    event: string | SnapshotEvents<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    subscribers?: SubscriberCollection<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshotContainer?: SnapshotContainerType<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshotStoreConfig?: SnapshotStoreConfig<SnapshotUnion<BaseData, Meta>, K> | undefined,
    category?: Category
  ) => void;
  
  // Subscription methods
  subscribe!: (
    snapshotId: string | number | null,
    unsubscribe: UnsubscribeDetails,
    subscriber: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null,
    data: T,
    event: SnapshotEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    callback: Callback<SnapshotContext<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
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
    metadata: {} as Meta,
    deleted, initialState, isCore, initialConfig, 
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
private globalSubscribers: Map<string, Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> = new Map();

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
  dataItems: RealtimeDataItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
  criteria: SnapshotWithCriteriaAsBase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
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
  }: SnapshotStoreProps<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) {
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

    // 1. Core Configuration Methods (should be first)
    bindAllMethods(
      this,
      ConfigMethods,
      [
        'addStoreConfig',
        'handleSnapshotConfig',
        'getSnapshotConfig',
        'setCategory',
        'transformDelegate',
        'applyStoreConfig',
        'setConfig',
        'initializeDefaultConfigs',
        'ensureDelegate'
      ] as const
    );

    // 2. Core Utility Methods
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
        'getAllSnapshotEntries',
        'generateId'
      ] as const
    );

    // 3. Validation Methods
    bindAllMethods(
      this,
      ValidationMethods,
      [
        'validateSnapshot',
        'compareSnapshotState'
      ] as const
    );

    // 4. Data Management Methods
    bindAllMethods(
      this,
      DataMethods,
      [
        'addDataSnapshot',
        'getData',
        'removeData',
        'updateData',
        'updateDataTitle',
        'updateDataDescription',
        'updateDataStatus',
        'addDataSuccess',
        'addDataStatus',
        'setData',
        'addDataPartial',
        'getAllKeys',
        'getAllValues',
        'getAllItems',
        'getSnapshotEntries'
      ] as const
    );

    // 5. Common Data Store Methods
    bindAllMethods(
      this,
      CommonDataStoreMethods,
      [
        'getSnapshotByKey',
        'mapSnapshotStore',
        'getSubscribers',
        'getDataWithSearchCriteria',
        'addData'
      ] as const
    );

    // 6. Core Snapshot Operations
    bindAllMethods(
      this,
      SnapshotMethodsImplementation,
      [
        'snapshot',
        'addSnapshot', 
        'removeSnapshot',
        'updateSnapshot',
        'takeSnapshot',
        'restoreSnapshot',
        'getSnapshotContainer',
        'setSnapshotContainer',
        'removeSnapshotContainer',
        'getAllSnapshotContainers',
        'findSnapshotContainers'
      ] as const
    );

    // 7. Snapshot Store Methods
    bindAllMethods(
      this,
      SnapshotStoreMethods,
      [
        'addStore',
        'getStore', 
        'createSnapshot'
      ] as const
    );

    // 8. Version Management
    bindAllMethods(
      this,
      VersionMethods,
      [
        'getBackendVersion',
        'getFrontendVersion',
        'getDataVersions',
        'updateDataVersions'
      ] as const
    );

    // 9. Data Operations
    bindAllMethods(
      this,
      TransformMethods,
      [
        'processSnapshotData',
        'reduceSnapshots',
        'reduceSnapshotItems',
        'flatMap',
        'transformSnapshotConfig',
        'mapSnapshots'
      ] as const
    );

    bindAllMethods(
      this,
      FetchMethods,
      [
        'fetchStoreData',
        'fetchData',
        'getDataStore',
        'getDataStoreMap',
        'getDataStoreMethods',
        'getDelegate',
        'getSnapshot',
        'getSnapshotById',
        'getSnapshotByCriteria',
        'getSnapshotSuccess',
        'getSnapshotConfigItems',
        'getSnapshotItemsSuccess',
        'getSnapshotItemSuccess',
        'getSnapshotKeys',
        'getSnapshotIdSuccess',
        'getSnapshotValuesSuccess',
        'getSnapshotWithCriteria',
        'getSnapshotData'
      ] as const
    );

    bindAllMethods(
      this,
      BatchMethods,
      [
        'mergeSnapshots',
        'setSnapshots',
        'batchTakeSnapshot',
        'batchFetchSnapshots',
        'batchTakeSnapshotsRequest',
        'batchUpdateSnapshots',
        'batchUpdateSnapshotsRequest'
      ] as const
    );

    // 10. Filter and Search Methods
    bindAllMethods(
      this,
      FilterMethods,
      [
        'getSnapshots',
        'findSnapshot',
        'filterSnapshotsByStatus',
        'filterSnapshotsByCategory',
        'filterSnapshotsByTag',
        'getSnapshotItems',
        'getSnapshotListByCriteria',
        'getSnapshotCategory'
      ] as const
    );

    // 11. Lifecycle and State Management
    bindAllMethods(this, LifecycleMethods, [
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
      'getSubscribers',
      'addDataStatus',
      'updateDataTitle',
      'updateDataDescription',
      'updateDataStatus',
      'initSnapshot',
      'createSnapshots',
      'takeSnapshot',
      'removeSnapshot',
      'addSnapshotItem',
      'addNestedStore',
      'clearSnapshots',
      'addSnapshot',
      'createInitSnapshot',
      'validateSnapshot',
      'setSnapshot',
      'clearSnapshot',
      'takeLatestSnapshot',
      'updateSnapshot',
      'handleSnapshotFailure',
      'updateSnapshotFailure',  
      'getSnapshotId',
      'deleteSnapshot',
      'removeStore'
      ]
    );

    //  ✅ Subscription and Notification
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
    );

    bindAllMethods(
      this,
      NotificationMethods,
      [
        'notify',
        'notifySubscribers'
      ] as const
    );

    // 13. Success and Failure Handlers
    bindAllMethods(
      this,
      SuccessMethods,
      [
        'addDataSuccess',
        'batchFetchSnapshotsSuccess',
        'batchUpdateSnapshotsSuccess',
        'updateSnapshotSuccess',
        'createSnapshotSuccess',
        'addSnapshotSuccess',
        'takeSnapshotSuccess',
        'takeSnapshotsSuccess',
        'handleSnapshotSuccess',
        'configureSnapshotStore',
        'fetchSnapshotSuccess',
        'setSnapshotSuccess'
      ] as const
    );

    bindAllMethods(
      this,
      FailureMethods,
      [
        'batchFetchSnapshotsFailure',
        'batchUpdateSnapshotsFailure',
        'updateSnapshotsFailure',
        'setSnapshotFailure',
        'fetchSnapshotFailure',
        'addSnapshotFailure',
        'createSnapshotFailure',
        'handleSnapshotFailure',
        'updateSnapshotFailure'
      ] as const
    );

    // 14. Action and Event Methods
    bindAllMethods(
      this,
      ActionMethods,
      [
        'executeSnapshotAction',
        'handleActions'
      ] as const
    );

    // 15. Mapping Methods
    bindAllMethods(
      this,
      MapMethods,
      [
        'mapSnapshots',
        'mapSnapshotWithDetails',
        'mapSnapshot'
      ] as const
    );


    bindAllMethods(this, SuccessFailureMethods, [
      'createSnapshotSuccess', 
      'createSnapshotFailure', 
      'clearSnapshotSuccess', 
      'clearSnapshotFailure', 
      'takeSnapshotSuccess', 
      'takeSnapshotsSuccess', 
      'setSnapshotSuccess', 
      'setSnapshotFailure', 
      'updateSnapshotsSuccess', 
      'updateSnapshotsFailure', 
      'fetchSnapshotSuccess',
      'fetchSnapshotFailure'
    ]);

    // 16. Final integration methods
    bindAllMethods(
      this,
      MethodBinder,
      [
        'bindMethods',
        'bindAllMethods'
      ] as const
    );



    // ✅ Bind Data Processing Methods
    bindAllMethods(
      this,
      DataProcessingImplementation,
      [
        'mapSnapshot',
        'mapSnapshots',
        'getSnapshotsByTopic',
        'getSnapshotsByCategory',
        'getSnapshotsByPriority',
        'getSnapshotsByKey',
        'getSnapshotsByTopicSuccess',
        'getSnapshotsByCategorySuccess',
        'getSpnapshotsByKeySuccess',
        'getSnapshotsByPrioritySuccess'
      ] as const
    );

    // ✅ Bind Action Methods (Expanded)
    bindAllMethods(
      this,
      ActionMethods,
      [
        // Base Actions
        'executeSnapshotAction',
        'handleActions',
        'handleCreateAction',
        'handleUpdateAction',
        'handleDeleteAction',
        'handleRestoreAction',
        'handleValidateAction',
        'handleTransformAction',
        
        // Project Management
        'startNewPhase',
        'completeCurrentPhase',
        'initiateVideoCall',
        'createIdea',
        'createTask',
        'scheduleProductLaunch',
        
        // Crypto Integration
        'executeTrade',
        'addCryptoToPortfolio',
        'analyzeMarketTrends',
        'setPriceAlert',
        
        // Data Analysis
        'analyzeProjectData',
        'generateProgressReport',
        
        // Communication
        'sendMessage',
        'createGroupChat',
        'shareFile'
      ] as const
    );

  }
  
  public dataStore: InitializedDataStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined = undefined;
  public initialState: InitializedState<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  
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
  ): Promise<SearchResult<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]> {
    return await searchAPI<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>(query);
  }
  
  public createdAt?: string | Date | undefined
  public parentSnapshotStore?: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  public content?: string | Content<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  public data: Data<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null = null;
  public snapshotCategory?: SnapshotCategory<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>; // Replace 'any' with proper type
  public subscriberId?: string | undefined = undefined;

  public getDataStores(): ReadonlyArray<DataStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> {
    return this.dataStores.slice(); // Return copy
  }

  public addDataStore(store: DataStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): void {
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

  private version: Version<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | string | number;
  private schema: string | Record<string, SchemaField>;
  private dataStores: DataStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
  private snapshotItems: SnapshotItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] = [];
  private nestedStores: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] = [];
  private configs: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] = [];
  private defaultConfigs: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] = []; 

  private payload: Payload | undefined = undefined
  private callback: (data: T) => void
  private storeProps: Partial<SnapshotStoreProps<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> = {};
  private endpointCategory: string = "";

  // Idle timeout properties
  private idleTimeoutId: NodeJS.Timeout | null = null;
  private idleTimeoutDuration: number = 300000; // 5 minutes default
  private lastActivityTimestamp: number = Date.now();
  private isIdle: boolean = false;
  private idleCallbacks: Array<() => void> = [];
  private activityCallbacks: Array<() => void> = [];
  private configMethods: ConfigMethods<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;

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

  protected eventRecords: Record<string, EventRecord<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]> = {};
  protected records: Record<string, CalendarManagerStoreClass<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]> = {};
  protected callbacks: Record<string, ((snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void)[]> = {};
  protected subscribers: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] = [];
  protected eventIds: string[] = [];

  protected autoSyncData(): void {
    console.log('Auto-syncing data...');
    
    if (this.syncInProgress) {
      console.log('Sync already in progress, queuing request');
      this.queueSyncOperation();
      return;
    }

    this.performAutoSync().catch(error => {
      console.error('Auto-sync failed:', error);
      this.handleSyncFailure(error);
    });
  }
  protected dataStoreMethods: DataStoreWithSnapshotMethods<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null = null;
  
  protected config: Promise<SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null>;
  
  // Protected methods for internal/mixin access
  protected getConfigInternal(): Promise<SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null> {
    return this.config;
  }
  
  protected setConfigInternal(config: Promise<SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null>): void {
    this.config = config;
  }
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

  // Public sync methods following the same pattern as notifySuccess/notifyFailure
  public startAutoSync(intervalMs: number = 300000): void {
    this.privateStartAutoSync(intervalMs);
  }

  public stopAutoSync(): void {
    this.privateStopAutoSync();
  }

  public manualSync(): Promise<void> {
    return this.privateManualSync();
  }

  public getSyncStatus(): {
    inProgress: boolean;
    lastSync: number;
    queuedOperations: number;
    retryCount: number;
  } {
    return this.privateGetSyncStatus();
  }

 
  snapshotContainer: SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null = null;
  snapshotContainers?: Map<string, SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>;

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
        this.validateSnapshot(snapshotId, snapshot)
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

  // Private helper methods with proper typing
  private validateSyncPreconditions(): boolean {
    return (
      this.isActive !== false &&
      !this.isDeleted &&
      !this.isBeingDeleted &&
      this.mounted === true &&
      this.config?.autoSync !== false
    );
  }


  private collectChangesSinceLastSync(): Array<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> {
    const changes: Array<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> = [];
    const sinceTime = this.lastSyncTime;
    
    // Check snapshots for changes
    if (this.snapshots && Array.isArray(this.snapshots)) {
      for (const snapshot of this.snapshots) {
        if (this.isSnapshotChanged(snapshot, sinceTime)) {
          changes.push(snapshot);
        }
      }
    }
    
    // Check data items if available
    if (this.dataItems && Array.isArray(this.dataItems)) {
      for (const dataItem of this.dataItems) {
        if (this.isDataItemChanged(dataItem, sinceTime)) {
          // Convert data item to snapshot format if needed
          const snapshot = this.convertDataItemToSnapshot(dataItem);
          if (snapshot) {
            changes.push(snapshot);
          }
        }
      }
    }
    
    return changes;
  }

  private isSnapshotChanged(
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, 
    sinceTime: number
  ): boolean {
    const snapshotTime = new Date(snapshot.timestamp || 0).getTime();
    return snapshotTime > sinceTime && 
          snapshot.isDeleted !== true && 
          snapshot.isBeingDeleted !== true;
  }

  private isDataItemChanged(
    dataItem: RealtimeDataItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    sinceTime: number
  ): boolean {
    const itemTime = new Date(dataItem.timestamp || 0).getTime();
    return itemTime > sinceTime;
  }

  private convertDataItemToSnapshot(
    dataItem: RealtimeDataItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ): Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null {
    try {
      return {
        id: dataItem.id || this.generateId('sync', 'data-item', NotificationTypeEnum.INFO),
        data: dataItem.data as T,
        timestamp: dataItem.timestamp || new Date(),
        category: this.category,
        metadata: dataItem.metadata as Meta,
        // Add other required snapshot properties
        unsubscribe: () => {},
        fetchSnapshot: async () => { return {} as any; },
        handleSnapshot: async () => { return {} as any; },
        events: undefined,
        meta: {}
      };
    } catch (error) {
      console.warn('Failed to convert data item to snapshot:', error);
      return null;
    }
  }

  private async executeSyncOperation(
    changes: Array<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>
  ): Promise<void> {
    // Implement your actual sync logic here
    // This could be:
    // - API calls to backend
    // - Database operations
    // - File system writes
    // - Cache updates
    
    console.log(`Executing sync for ${changes.length} changes`);
    
    // Example sync implementation
    for (const change of changes) {
      await this.syncSingleChange(change);
    }
    
    // Update local state after successful sync
    await this.updateLocalStateAfterSync(changes);
  }

  private async syncSingleChange(
    change: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ): Promise<void> {
    // Implement single change sync logic
    // This is where you'd make your API calls or database operations
    
    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 10));
    
    // Update change metadata to mark as synced
    if (change.metadata) {
      change.metadata.lastSynced = new Date();
      change.metadata.syncVersion = (change.metadata.syncVersion || 0) + 1;
    }
  }

  private async updateLocalStateAfterSync(
    changes: Array<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>
  ): Promise<void> {
    // Update any local state that needs to reflect the sync
    this.lastSyncTime = Date.now();
    
    // Update snapshots with sync metadata
    changes.forEach(change => {
      const existingSnapshot = this.snapshots.find(s => s.id === change.id);
      if (existingSnapshot && existingSnapshot.metadata) {
        existingSnapshot.metadata.lastSynced = new Date();
      }
    });
  }

  private async handleSyncFailure(error: Error): Promise<void> {
    console.error('Sync operation failed:', error);
    
    this.syncRetryCount++;
    
    if (this.syncRetryCount <= this.MAX_SYNC_RETRIES) {
      console.log(`Retrying sync in 5 seconds (attempt ${this.syncRetryCount}/${this.MAX_SYNC_RETRIES})`);
      
      // Schedule retry
      setTimeout(() => {
        this.autoSyncData();
      }, 5000);
    } else {
      console.error('Max sync retries exceeded. Giving up.');
      this.notifySyncFailure(error);
    }
  }

  private queueSyncOperation(): void {
    this.syncQueue.push(async () => {
      await this.performAutoSync();
    });
  }

  private async processSyncQueue(): Promise<void> {
    if (this.syncQueue.length > 0 && !this.syncInProgress) {
      const nextOperation = this.syncQueue.shift();
      if (nextOperation) {
        await nextOperation();
      }
    }
  }


  // Private implementations
  private privateStartAutoSync(intervalMs: number): void {
    if (this.syncIntervalId) {
      this.privateStopAutoSync();
    }
    
    this.syncIntervalId = setInterval(() => {
      this.autoSyncData();
    }, intervalMs);
    
    console.log(`Auto-sync started with ${intervalMs}ms interval`);
  }

  private privateStopAutoSync(): void {
    if (this.syncIntervalId) {
      clearInterval(this.syncIntervalId);
      this.syncIntervalId = null;
      console.log('Auto-sync stopped');
    }
  }

  private async privateManualSync(): Promise<void> {
    return this.performAutoSync();
  }

  private privateGetSyncStatus(): {
    inProgress: boolean;
    lastSync: number;
    queuedOperations: number;
    retryCount: number;
  } {
    return {
      inProgress: this.syncInProgress,
      lastSync: this.lastSyncTime,
      queuedOperations: this.syncQueue.length,
      retryCount: this.syncRetryCount
    };
  }

  // Sync notification methods
  private notifySyncSuccess(
    changes: Array<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>
  ): void {
    this.emit('syncSuccess', {
      timestamp: new Date(),
      changesCount: changes.length,
      changes: changes.map(change => ({
        id: change.id,
        type: change.type,
        timestamp: change.timestamp
      }))
    });
    
    // Also use the existing notify system
    this.privateNotifySuccess(`Sync completed successfully. ${changes.length} changes synced.`);
  }

  private notifySyncFailure(error: Error): void {
    this.emit('syncFailure', {
      timestamp: new Date(),
      error: error.message,
      retryCount: this.syncRetryCount
    });
    
    this.privateNotifyFailure(`Sync failed: ${error.message}`);
  }

  // Add these methods to handle the WrappedU and U type conversions
  private convertToWrappedU<U extends BaseDataEntity>(
    data: U
  ): WrappedU<U, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
    // Implementation for converting U to WrappedU with all 6 parameters
    return {
      ...data,
      // Add any wrapping logic needed
      _wrapped: true,
      originalData: data,
      metadata: this.metadata as unknown as Meta,
      attachments: [] as AttachmentType[],
      // Ensure all required properties are present
    } as WrappedU<U, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  }

  private convertFromWrappedU<U extends BaseDataEntity>(
    wrapped: WrappedU<U, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ): U {
    // Extract the original data from wrapped format
    return wrapped.originalData || (wrapped as unknown as U);
  }

  // Utility method to handle type conversions during sync
  private ensureProperTypesDuringSync<U extends BaseDataEntity>(
    data: U | WrappedU<U, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ): Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
    let processedData: T;
    
    // Check if data needs to be converted from WrappedU
    if (this.isWrappedU(data)) {
      processedData = this.convertFromWrappedU(data as WrappedU<U, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) as unknown as T;
    } else {
      processedData = data as unknown as T;
    }
    
    // Create or return a snapshot with proper typing
    return {
      id: this.generateId('sync', 'converted', NotificationTypeEnum.INFO),
      data: processedData,
      timestamp: new Date(),
      category: this.category,
      // Add other required properties
      unsubscribe: () => {},
      fetchSnapshot: async () => { return {} as any; },
      handleSnapshot: async () => { return {} as any; },
      events: undefined,
      meta: {}
    };
  }

  private isWrappedU<U extends BaseDataEntity>(
    data: any
  ): data is WrappedU<U, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
    return data && data._wrapped === true;
  }

  // Private implementation with proper 6 generic parameters
  private async performAutoSync(): Promise<void> {
    if (this.syncInProgress) {
      return;
    }

    this.syncInProgress = true;
    
    try {
      console.log('Starting auto-sync process...');
      
      // 1. Validate current state before sync
      if (!this.validateSyncPreconditions()) {
        throw new Error('Sync preconditions not met');
      }

      // 2. Collect changed data
      const changes = this.collectChangesSinceLastSync();
      
      if (changes.length === 0) {
        console.log('No changes to sync');
        return;
      }

      // 3. Perform the actual sync
      await this.executeSyncOperation(changes);
      
      // 4. Update sync state
      this.lastSyncTime = Date.now();
      this.syncRetryCount = 0;
      
      // 5. Notify subscribers
      this.notifySyncSuccess(changes);
      
      console.log(`Auto-sync completed successfully. Synced ${changes.length} items`);
      
    } catch (error) {
      await this.handleSyncFailure(error as Error);
      throw error;
    } finally {
      this.syncInProgress = false;
      
      // Process any queued sync operations
      await this.processSyncQueue();
    }
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
  public getStoreProps(): Partial<SnapshotStoreProps<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> {
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

  public setStoreProps(storeProps: Partial<SnapshotStoreProps<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>): void {
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

  // Get the version (now it can return either a Version<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> or a string)
  public getVersion(): Version<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | string {
    return this.version;
  }

  // Update the version (accepts either a Version<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> or a string)
  public updateVersion(newVersion: Version<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | string): void {
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
    subscribers: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]
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
    snapshotManager: SnapshotManager<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
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


  getDataStoreMethods(): DataStoreMethods<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
    return {
      addData: this.addData.bind(this),
      getItem: this.getItem.bind(this),
      removeData: this.removeData.bind(this),
      category: this.category as string,
      dataStoreMethods: this.dataStoreMethods as DataStoreMethods<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
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
  }): Promise<DataStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]> {
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
    snapshotManager: SnapshotManager<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
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



  public safeCastSnapshotStore<
    T extends BaseDataEntity,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T
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
  public setDataStores(stores: DataStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]): void {
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
    event: SnapshotEvents<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
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

  // ADD PUBLIC VERSION (simpler string-based API)
  public executeDelegateMethod<R = any>(
    methodName: string,
    ...args: any[]
  ): R | undefined {
    if (this.delegate && this.delegate.length > 0) {
      for (const delegate of this.delegate) {
        const method = delegate[methodName];
        if (method && typeof method === "function") {
          try {
            return method.apply(delegate, args);
          } catch (error) {
            console.error(`Error executing delegate method '${methodName}':`, error);
            return undefined;
          }
        }
      }
      console.warn(`Method '${methodName}' not found on any delegate`);
    } else {
      console.warn("Delegate is undefined or empty");
    }
    return undefined;
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
    snapshotManager: SnapshotManager<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    payload: CreateSnapshotStoresPayload<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    callback: (snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]) => void | null,
    snapshotStoreData?: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
    category?: string | Category,
     categoryProperties?: CategoryProperties,
    snapshotDataConfig?: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields
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
  private transformMappedSnapshotData<U extends BaseDataEntity>(
    mappedSnapshotData: Map<string, Snapshot<Data<U>, U>>
  ): Map<string, Snapshot<WrappedU<U, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, WrappedU<U, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, Meta, AttachmentType, ExcludedFields, IncludedFields>> {
    const transformedData = new Map<
      string, 
      Snapshot<WrappedU<U, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, WrappedU<U, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, Meta, AttachmentType, ExcludedFields, IncludedFields>
    >();
    
    mappedSnapshotData.forEach((value, key) => {
      transformedData.set(key, this.transformSnapshot<U>(value));
    });
    return transformedData;
  }

  // Updated transformSnapshotStore with all 6 parameters
// Corrected transformSnapshotStore function
  private transformSnapshotStore<U extends BaseDataEntity>(
    snapshotStore: SnapshotStore<Data<U>, U, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ): SnapshotStore<WrappedU<U, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, WrappedU<U, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  
    // Separate config and data transformations
    const transformedConfig: SnapshotStoreConfig<
      WrappedU<U, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      WrappedU<U, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      Meta,
      AttachmentType,
      ExcludedFields,
      IncludedFields
    > = {
      id: snapshotStore.id || this.generateId('transform', 'store-config', NotificationTypeEnum.INFO),
      storeId: snapshotStore.storeId,
      name: snapshotStore.name || "Default Name",
      version: snapshotStore.version || 1,
      schema: snapshotStore.schema || "default-schema",
      category: snapshotStore.category || 'default-transform-snapshotStore',
      autoSave: snapshotStore.config?.autoSave ?? true,
      syncInterval: snapshotStore.config?.syncInterval ?? 300000,
      snapshotLimit: snapshotStore.config?.snapshotLimit ?? 100,
      // Add other config properties as needed
      operation: snapshotStore.operation,
      data: this.convertToWrappedU(snapshotStore.data as U),
      createdAt: snapshotStore.createdAt,
      initialState: snapshotStore.initialState ? this.transformInitialState(snapshotStore.initialState) : null,
      timestamp: snapshotStore.timestamp,
      snapshotId: snapshotStore.snapshotId,
      snapshotStore: this as any, // Current store as the snapshot store
      dataStoreMethods: snapshotStore.dataStoreMethods,
      criteria: snapshotStore.criteria,
      content: snapshotStore.content,
      config: snapshotStore.config,
      snapshotCategory: snapshotStore.snapshotCategory,
      snapshotSubscriberId: snapshotStore.snapshotSubscriberId,
    };

    const transformedData: SnapshotData<
      WrappedU<U, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      WrappedU<U, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      Meta,
      AttachmentType,
      ExcludedFields,
      IncludedFields
    > = {
      // Core data methods - using existing methods from snapshotStore
      getSnapshot: async () => {
        const currentState = await snapshotStore.getCurrentState();
        return currentState ? this.transformSnapshot<U>(currentState) : null;
      },
    
      validate: () => {
        return snapshotStore.validate(); // Use the source store's validate method
      },
    
      transform: (snap) => {
        return this.transformSnapshot<U>(snap as any);
      },
    
      id: snapshotStore.id || "",
      storeId: snapshotStore.storeId,
      category: snapshotStore.category?.toString() || "",
    
      serialize: () => {
        return JSON.stringify({
          id: snapshotStore.id,
          storeId: snapshotStore.storeId,
          data: snapshotStore.data,
          metadata: snapshotStore.metadata
        });
      },
    
      get: (key: string) => {
        // Use the source store's data access methods
        return (snapshotStore as any)[key];
      },
    
      set: (key: string, value: any) => {
        // Use the source store's data modification methods
        (snapshotStore as any)[key] = value;
      },
    
      processEvent: (data: any, type: string, event: Event) => {
        // Use the source store's event processing
        snapshotStore.processAction({
          type: 'PROCESS_EVENT',
          payload: { data, type, event }
        });
      },
    
      shared: snapshotStore.topic || "",
    
      operations: {
        // Use the source store's operation methods
        add: snapshotStore.addSnapshot.bind(snapshotStore),
        update: snapshotStore.updateSnapshot.bind(snapshotStore),
        remove: snapshotStore.removeSnapshot.bind(snapshotStore),
        get: snapshotStore.getSnapshot.bind(snapshotStore),
        // Add other operations as needed
      } as SnapshotOperations<
        WrappedU<U, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
        WrappedU<U, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
        Meta,
        AttachmentType,
        ExcludedFields,
        IncludedFields
      >,
    
      base: {
        id: snapshotStore.id,
        createdAt: snapshotStore.createdAt,
        updatedAt: snapshotStore.updatedAt,
        // Add other base properties from the source store
      } as BaseEntity<
        WrappedU<U, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
        WrappedU<U, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
        Meta,
        AttachmentType,
        ExcludedFields,
        IncludedFields
      >,
    
      sharedMetadata: JSON.stringify(snapshotStore.metadata || {}),
    
      getSnapshotData: (params) => {
        // Use the source store's getSnapshotData method
        const originalResult = snapshotStore.getSnapshotData(params as any);
      
        if (!originalResult) {
          return undefined;
        }
      
        // Transform the result to match the WrappedU type if needed
        return this.transformSnapshotData<U>(originalResult);
      },
    
      deleteSnapshot: (id: string) => {
        snapshotStore.removeSnapshot(id); // Use source store's remove method
      },
    
      core: {
        id: snapshotStore.id,
        data: snapshotStore.data ? this.convertToWrappedU(snapshotStore.data as U) : undefined,
        timestamp: snapshotStore.timestamp,
        // Add other core properties from source store
      } as CoreSnapshot<
        WrappedU<U, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
        WrappedU<U, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
        Meta,
        AttachmentType,
        ExcludedFields,
        IncludedFields
      >,
    
      security: {
        isEncrypted: snapshotStore.isEncrypted,
        ownerId: snapshotStore.ownerId,
        // Add other security properties from source store
      } as SnapshotSecurity,
    
      storage: snapshotStore.config?.storageType || "memory",
    
      isExpired: () => {
        return snapshotStore.isExpired(); // Use source store's expiration check
      },
    
      data: JSON.stringify(snapshotStore.data || {}),
      snapshotStore: snapshotStore as any, // Reference to the source store
      timestamp: new Date(),
    };
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
  private transformInitialState<U extends Data<U>, T extends BaseDataEntity>(
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
    | SnapshotItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
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
    snapshotManager: SnapshotManager<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    payload: CreateSnapshotStoresPayload<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    callback: (snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]) => void | null,
    snapshotStoreData?: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
    category?: string | Category,
     categoryProperties?: CategoryProperties,
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
  
  public lastUpdated?: Date | VersionHistory<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  
  // ADD PUBLIC VERSIONS (for external/method binding use)
  public notifyPublicSuccess(message: string): void {
    try {
      this.emit('notification', { type: 'success', message, timestamp: new Date() });
      console.log(`Success: ${message}`);
    } catch (error) {
      console.error('Error in notifyPublicSuccess:', error);
    }
  }

  public notifyPublicFailure(message: string): void {
    try {
      this.emit('notification', { type: 'error', message, timestamp: new Date() });
      console.error(`Error: ${message}`);
    } catch (error) {
      console.error('Error in notifyPublicFailure:', error);
    }
  }

  // ALTERNATIVE: Unified public notify method
  public notifyPublic(type: 'success' | 'error' | 'warning' | 'info', message: string): void {
    try {
      this.emit('notification', { type, message, timestamp: new Date() });
      console.log(`${type.toUpperCase()}: ${message}`);
    } catch (error) {
      console.error('Error in notifyPublic:', error);
    }
  }

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
  events?: (SnapshotEvents<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> & CombinedEvents<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) | undefined = undefined;
  getSnapshot(
    snapshot: (id: string) =>
      | Promise<{
          snapshotId: number;
          snapshotData: SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
          category: symbol | string | Category | undefined
          categoryProperties: CategoryProperties | undefined;
          dataStoreMethods: DataStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null;
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
    prefix: string,
    name: string,
    type: NotificationType,
    id?: string,
    title?: string,
    chatThreadName?: string,
    chatMessageId?: string,
    chatThreadId?: string,
    dataDetails?: DataDetails<any, T>,
    generatorType?: string
  ): string {
    const delegateWithGenerateId = this.delegate?.find((d) => d.generateId);
    const generatedId = delegateWithGenerateId?.generateId(prefix, name, type);
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
      find(arg0: (config: SnapshotStoreConfig<SnapshotWithCriteriaAsBase<BaseData, any>, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => boolean): unknown;
      optionalData?: any; // Include optional data if necessary
      debugInfo?: DebugInfo,
      tempData: TempData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
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
  getMetadata(): UnifiedMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined {
    return this.metadata;
  }

  // Additional methods to access metadata based on its type
  getProjectMetadata(): ProjectMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined {
    if ('startDate' in this.metadata && this.metadata != undefined) {
      return this.metadata as ProjectMetadata;
    }
    return undefined;
  }

  getStructuredMetadata(): StructuredMetadata<T,K> | undefined {
    if ('metadataEntries' in this.meta) {
      return this.meta as StructuredMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
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
    snapshotManager: SnapshotManager<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    payload: CreateSnapshotStoresPayload<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
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
    event: SnapshotEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
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
    event: SnapshotEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
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
    sub: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
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
        subscribers: subscribersPromise.subscribers.map((sub: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) =>
          this.transformSubscriber(sub)
        ) as Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
        configOption:
          config.configOption && typeof config.configOption !== "string"
            ? {
                ...config.configOption,
                data: config.configOption.data,
                subscribers: (await config.configOption.getSubscribers(
                  this.subscribers, // Provide a valid SubscriberCollection<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> here
                  this.snapshots // Provide a valid Snapshots<K> here
                )).subscribers.map((sub: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) =>
                  this.transformSubscriber(sub)
                ) as Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
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
    snapshotManager: SnapshotManager<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    payload: CreateSnapshotStoresPayload<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    callback: (snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]) => void | null,
    snapshotStoreData?: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
    category?:  Category,
     categoryProperties?: CategoryProperties,
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
    snapshotManager: SnapshotManager<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    payload: CreateSnapshotStoresPayload<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
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
    snapshotManager: SnapshotManager<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    payload: CreateSnapshotStoresPayload<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    callback: (snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]) => void | null,
    snapshotStoreData?: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
    category?: string | Category,
     categoryProperties?: CategoryProperties,
    snapshotDataConfig?: SnapshotStoreConfig<
      SnapshotWithCriteriaAsBase<any, BaseData>,
      K
    >[]
  ) => void {
    return this._saveSnapshotStores
      ? this._saveSnapshotStores.bind(this)
      : this.defaultSaveSnapshotStores.bind(this);
  }

  get initializedState(): InitializedState<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
    return this.initialState;
  }

  get transformedDelegate(): SnapshotStoreConfig<
    SnapshotWithCriteriaAsBase<any, BaseData>,
    K
  >[] {
    return this.transformDelegate();
  }

  // Getter for transformed initial state
  get getTransformedInitialState(): InitializedState<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null {
    if (!this.initialState) {
      return null; // Return null if the initial state is not set
    }

    // We assume that we want to transform it to a specific type U 
    // that is defined elsewhere or can be passed in context
    return this.transformInitialState<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>(this.initialState);
  }

 get isMobile() {
    return this.options.browserSpecific?.isMobile || false;
  }

  get browserType() {
    return this.options.browserSpecific?.browserType || 'Unknown';
  }

  transformedSubscriber(sub: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
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


  // SnapshotStoreMethods
  createSnapshot!: (
    id: string | number | undefined,
    snapshotId: string | null,
    snapshotData: SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    category?: Category,
    categoryProperties: CategoryProperties | undefined,
    callback: (snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void,
    dataStore: DataStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    dataStoreMethods: DataStoreMethods<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    metadata: UnifiedMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    subscriberId: string,
    endpointCategory: string | number,
    storeProps: SnapshotStoreProps<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshotConfigData: SnapshotConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    subscription: Subscription<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshotStoreConfigData?: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshotContainer?: SnapshotContainerType<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ) => Promise<{ snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> }>;










  //______________ REMOVE FRROM HERE______________
  //______________ REMOVE FRROM HERE______________
  //______________ REMOVE FRROM HERE______________
  //______________ REMOVE FRROM HERE______________
  //______________ REMOVE FRROM HERE______________
  //______________ REMOVE FRROM HERE______________
  //______________ REMOVE FRROM HERE______________
  //______________ REMOVE FRROM HERE______________
  //______________ REMOVE FRROM HERE______________

  updateSnapshots(): void {
    this.handleDelegate((delegate) => delegate.updateSnapshots.bind(delegate));
  }


  configureSnapshotStore(
    snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    storeId: number,
    data: Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
    events: Record<string, CalendarManagerStoreClass<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>,
    dataItems: RealtimeDataItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
    newData: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    payload: ConfigureSnapshotStorePayload<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
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
    dataItems: RealtimeDataItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
    newData: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, // New snapshot data
    payload: ConfigureSnapshotStorePayload<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
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
    category?: Category,    categoryProperties: CategoryProperties | undefined,
    callback: (snapshot: T) => void,
    snapshots: SnapshotsArray<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    type: string,
    event: SnapshotEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
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
    category?: Category,
    categoryProperties: CategoryProperties | undefined,
    callback: (snapshot: T) => void,
    snapshots: SnapshotsArray<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    type: string,
    event: SnapshotEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    data: Map<string, T>,
    subscribers: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
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
    categoryProperties: CategoryProperties | undefined,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    timestamp: string | number | Date | undefined,
    type: string,
    event: SnapshotEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    id: number,
    snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    data: T,
    category?: Category
  ): Promise<SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> {
    try {
      const snapshotMap = new Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>();
      snapshotMap.set(snapshotId, snapshot);

      const snapshotsArray: SnapshotsArray<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = Array.from(
        snapshotMap.values()
      );
      const snapshotsObject: SnapshotsObject<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = Object.fromEntries(
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
    content: Content<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
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
    subscribers: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
    data: Partial<SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>
  ): Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] {
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
      category?: Category,      categoryProperties: CategoryProperties | undefined,
      timestamp: Date,
      data: T,
      delegate: SnapshotWithCriteriaAsBase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]
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
    event: SnapshotEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    id: number,
    snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    category?: Category,    categoryProperties: CategoryProperties | undefined,
    dataStoreMethods: DataStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    data: T,
    dataCallback?: (
      subscribers: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
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

// 1. Core Configuration and Setup First
Object.assign(SnapshotStore.prototype, ConfigMethods);

// 2. Core Utility Methods 
Object.assign(SnapshotStore.prototype, UtilMethods);

// 3. Validation Methods (needed early for data integrity)
Object.assign(SnapshotStore.prototype, ValidationMethods);

// 4. Data Management Foundations
Object.assign(SnapshotStore.prototype, DataMethods);

// 5. Core Snapshot Operations  
Object.assign(SnapshotStore.prototype, SnapshotMethods);
Object.assign(SnapshotStore.prototype, SnapshotMethodsImplementation);

// 6. Data Operations and Transformations
Object.assign(SnapshotStore.prototype, TransformMethods);
Object.assign(SnapshotStore.prototype, AdvancedTransformMethods);
Object.assign(SnapshotStore.prototype, MappingMethods);

// 7. Data Retrieval and Processing
Object.assign(SnapshotStore.prototype, FetchMethods);
Object.assign(SnapshotStore.prototype, BatchMethods);

// 8. Version Management
Object.assign(SnapshotStore.prototype, VersionMethods);

// 9. Lifecycle and State Management
Object.assign(SnapshotStore.prototype, LifecycleMethods);
Object.assign(SnapshotStore.prototype, ContainerMethods);
Object.assign(SnapshotStore.prototype, StoreManagementMethods);

// 10. Success/Failure Handlers (NEW)
Object.assign(SnapshotStore.prototype, SuccessFailureMethods);

// 11. Data Processing Methods
Object.assign(SnapshotStore.prototype, DataProcessingImplementation);

// 12. Subscription and Notification (depend on most other methods)
Object.assign(SnapshotStore.prototype, SubscriptionMethods);
Object.assign(SnapshotStore.prototype, NotificationMethods);

// 13. Action and Event Methods (NEW)
Object.assign(SnapshotStore.prototype, ActionMethods);

// 14. Utility Functions (NEW)
Object.assign(SnapshotStore.prototype, UtilityMethods);

// 15. Final Integration Methods
Object.assign(SnapshotStore.prototype, MethodBinder);
Object.assign(SnapshotStore.prototype, CommonDataStoreMethods);

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
