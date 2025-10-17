// SnapshotMethods.ts
import { SnapshotWithData } from '@/app/calendar/CalendarApp';
import { UnsubscribeDetails } from '@/app/components/event/DynamicEventHandlerExample';
import { NotificationType } from '@/app/context/NotificationContext';
import { Attachment } from '@/app/documents/attachment/Attachment';
import { CombinedEvents, SnapshotManager } from '@/app/hooks/useSnapshotManager';
import { Category } from "@/app/libraries/categories/generateCategoryProperties";
import { Content } from '@/app/models/content/AddContent';
import { BaseData, DataDetails } from '@/app/models/data/Data';
import { StatusType } from "@/app/models/data/StatusType";
import { CategoryProperties } from '@/app/pages/personas/ScenarioBuilder';
import { CriteriaType } from '@/app/pages/searches/CriteriaType';
import { DataStore } from '@/app/projects/DataAnalysisPhase/DataProcessing/DataStore';
import { DataStoreMethods } from '@/app/projects/DataAnalysisPhase/DataProcessing/DataStoreMethods';
import { FetchSnapshotPayload } from '@/app/snapshots/FetchSnapshotPayload';
import { WrappedU } from '@/app/snapshots/isCompatibleTempData';
import {
  Result,
  Snapshots, SnapshotsArray, SnapshotUnion
} from '@/app/snapshots/LocalStorageSnapshotStore';
import { Snapshot } from '@/app/snapshots/Snapshot';
import { SnapshotActionType } from '@/app/snapshots/SnapshotActionType';
import { SnapshotContainer, SnapshotDataType } from '@/app/snapshots/SnapshotContainer';
import { SnapshotData, SnapshotHierarchyMethods } from '@/app/snapshots/SnapshotData';
import { SnapshotDataParams } from '@/app/snapshots/SnapshotDataParams';
import { SnapshotEvents } from "@/app/snapshots/SnapshotEvents";
import { SnapshotItem } from '@/app/snapshots/SnapshotList';
import { InitializedData, InitializedDataStore } from '@/app/snapshots/SnapshotStoreOptions';
import { SnapshotContext, SnapshotSubscriberManagement } from '@/app/snapshots/SnapshotSubscriberManagement';
import { SnapshotWithCriteria } from "@/app/snapshots/SnapshotWithCriteria";
import { UpdateSnapshotParams } from '@/app/snapshots/UpdateSnapshotParams';
import CalendarManagerStoreClass from '@/app/state/stores/CalendarManagerStore';
import { Subscriber } from "@/app/subscribers/Subscriber";
import { SubscriberCollection } from '@/app/subscribers/SubscriberCollection';
import { Callback } from '@/app/subscribers/subscribeToSnapshotsImplementation';
import { Tag } from '@/app/typings/entities/TagEntity';
import { SnapshotEvent } from '@/app/typings/eventTypes';
import { RealtimeDataItem } from "@/app/typings/realtimeTypes";
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/config/BaseConfig';
import { CreateSnapshotsPayload, Payload, UpdateSnapshotPayload } from "@/server/database/Payload";
import { Version } from '@/versions/Version';
import { IHydrateResult } from "mobx-persist";
import { SnapshotConfig } from "./SnapshotConfig";
import { default as SnapshotStore } from "./SnapshotStore";
import { SnapshotStoreConfig } from "./SnapshotStoreConfig";
;


// 1. COMPARISON METHODS
interface SnapshotComparisonMethods<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {
  compareSnapshots: (
    snap1: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snap2: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ) => {
    snapshot1: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
    snapshot2: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
    differences: Record<string, { snapshot1: any; snapshot2: any }>;
    versionHistory: {
      snapshot1Version?: string | number | Version<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null;
      snapshot2Version?: string | number | Version<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
    };
  } | null;

  compareSnapshotItems: (
    snap1: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snap2: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    keys: (keyof Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>)[]
  ) => {
    itemDifferences: Record<string, {
      snapshot1: any;
      snapshot2: any;
      differences: { [key: string]: { value1: any; value2: any } };
    }>;
  } | null;

  compareSnapshotState: (
    snapshot1: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null,
    snapshot2: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ) => boolean;
}

// 2. BATCH OPERATION METHODS
interface SnapshotBatchMethods<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {
  mergeSnapshots: (snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, category: string) => void;
  setSnapshots: (snapshots: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]) => void;

  batchTakeSnapshot: (
    id: number,
    snapshotId: string,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  ) => Promise<{ snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> }>;

  batchFetchSnapshots: (
    criteria: CriteriaType,
    snapshotData: (
      snapshotIds: string[],
      subscribers: SubscriberCollection<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
    ) => Promise<{
      subscribers: SubscriberCollection<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
      snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
    }>
  ) => Promise<Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>;

  batchTakeSnapshotsRequest: (
    criteria: CriteriaType,
    snapshotData: (
      snapshotIds: string[],
      snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      subscribers: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]
    ) => Promise<{ subscribers: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] }>
  ) => Promise<void>;

  // Bulk snapshots update
  batchUpdateSnapshots: (
    criteria: CriteriaType,
    updates: Partial<T>,
    options?: {
      batchSize?: number;
      where?: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => boolean;
    }
  ) => Promise<{ updatedCount: number; snapshots: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] }>;

  batchUpdateSnapshotsRequest: (
    snapshotData: (
      subscribers: SubscriberCollection<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
    ) => Promise<{
      subscribers: SubscriberCollection<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
      snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
    }>,
    snapshotManager: SnapshotManager<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ) => Promise<void>;

}

// 3. FILTER METHODS
interface SnapshotFilterMethods<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {
  getSnapshots: (category: string, data: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;
  getAllValues: () => SnapshotsArray<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>; // Use SnapshotsArray<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> if it represents an array of snapshots

  getAllItems: () => Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] | undefined>;

  getSnapshotEntries: (snapshotId: string) => Map<string, T> | undefined;
  getAllSnapshotEntries: () => Map<string, T>[];
  getAllSnapshots: (
    storeId: number,
    event: SnapshotEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    ctx: SnapshotContext<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> & {
      timestamp: string;
      type: string;
      id: number;
      categoryProperties?: CategoryProperties;
      dataStoreMethods: DataStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
      data: T;
      snapshotId?: string;
      snapshotData?: T;
      snapshotStore?: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
      category?: Category;
    },
    filter?: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => boolean,
    dataCallback?: (
      subscribers: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
      snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
    ) => Promise<SnapshotUnion<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>
  ) => Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>;


  getAllKeys: (
    storeId: number,
    snapshotId: string,
    categoryProperties: CategoryProperties | undefined,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null,
    timestamp: string | number | Date | undefined,
    type: string,
    event: SnapshotEvents<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    id: number,
    snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    data: T,
    category?: Category
  ) => Promise<string[] | undefined> | undefined;

  findSnapshot: (
    predicate: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => boolean
  ) => Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined;

  filterSnapshotsByStatus: (status: StatusType) => Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  filterSnapshotsByCategory: (category: Category) => Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  filterSnapshotsByTag: (tag: Tag<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;


  getSnapshotItems: (
    snapshots: SnapshotsArray<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshotId?: string,
    category?: Category,
    callback?: (items: SnapshotItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]) => void
  ) => (SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | SnapshotItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>)[] | undefined;

  getSnapshotListByCriteria: (
    criteria: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ) => Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>;


  getSnapshotCategory: (id: string) => Category | undefined;

}

// 4. LIFECYCLE METHODS
interface SnapshotLifecycleMethods<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {

  addDataStatus: (id: number, status: StatusType | undefined) => void;
  updateDataTitle: (id: number, title: string) => void;
  updateDataDescription: (id: number, description: string) => void;
  updateDataStatus: (id: number, status: StatusType | undefined) => void;

  getDataVersions: (id: number) => Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] | undefined>;
  updateDataVersions: (id: number, versions: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]) => void;
  initializeWithData: (data: SnapshotUnion<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]) => void;

  initSnapshot: (
    snapshot: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null,
    snapshotId: string | number | null,
    snapshotData: SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    categoryProperties: CategoryProperties | undefined,
    snapshotConfig: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    callback: (snapshotStore: SnapshotStore<any, any>) => void,
    snapshotStoreConfig: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshotStoreConfigSearch: SnapshotStoreConfig<
    SnapshotWithCriteria<BaseDataEntity, K>,
    SnapshotWithCriteria<BaseDataEntity, K>
    >,
    category?: Category,
  ) => void;

  createSnapshots: (
    id: string,
    snapshotId: string,
    snapshots: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
    snapshotManager: SnapshotManager<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    payload: CreateSnapshotsPayload<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    callback: (snapshots: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]) => void | null,
    category?: string | Category,
    snapshotDataConfig?: SnapshotConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] | undefined,
    categoryProperties?: CategoryProperties
  ) => Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] | null;


  takeSnapshot: (
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    subscribers: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]
  ) => Promise<{ snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> }>;


  removeSnapshot: (snapshotToRemove: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;
  addSnapshotItem: (item: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;
  // addSnapConfig: (config: SnapshotConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;
  addNestedStore: (
    store: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    item: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ) => void;
  clearSnapshots: () => void;

  addSnapshot: (
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshotId: string,
    subscribers: SubscriberCollection<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ) => Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined>;

  createInitSnapshot: (
    id: string,
    initialData: T,
    snapshotData: SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshotStoreConfig: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    category?: Category,
    additionalData?: any,
  ) => Promise<Result<Snapshot<T, K, never>>>;


  validateSnapshot: (snapshotId: string, snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => boolean;

  setSnapshot: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;
  clearSnapshot: () => void;

  takeLatestSnapshot: () => Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined;

  updateSnapshot: (
    snapshotId: string | number | null,
    snapshotIdOrParams: string | number | null | UpdateSnapshotParams<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    // oldSnapshot: Snapshot<AppEntity, AppK,  AppMeta, AppAttachment, AppExcludedFields, AppIncludeField>,
    data: Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
    newData: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    timestamp: Date,
    category?: Category,
    events?: Record<string, CalendarManagerStoreClass<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>,
    snapshotStore?: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    dataItems?: RealtimeDataItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
    payloadData?: T | K,
    mappedSnapshotData?: Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
    delegate?: SnapshotWithCriteria<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
    payload?: UpdateSnapshotPayload<T>,
    store?: SnapshotStore<any, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    callback?: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void, 
    snapshotManager?: SnapshotManager<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  ) => Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;



  handleSnapshotFailure: (error: Error, snapshotId: string) => void;

  updateSnapshotFailure: (
    snapshotId: string,
    snapshotManager: SnapshotManager<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    date: Date | undefined,
    payload: { error: Error }
  ) => void;
  getSnapshotId: (
    key: string | T,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ) => string;

  deleteSnapshot: (id: string) => void;
  removeStore: (
    storeId: number,
    store: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshotId: string,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    type: string,
    event: Event
  ) => void;
}



interface SnapshotNotificationMethods<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {
  notify: (
    id: string,
    message: string,
    content: Content<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    data: any,
    date: Date,
    type: NotificationType
  ) => void;

  notifySubscribers: (
    message: string,
    subscribers: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
    callback: (data: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
    data: Partial<SnapshotStoreConfig<SnapshotUnion<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, SnapshotUnion<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>>
  ) => Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
}

interface SnapshotSubscriptionMethods<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {
  addSnapshotSubscriber: (snapshotId: string, subscriber: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;
  removeSnapshotSubscriber: (snapshotId: string, subscriber: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;
  subscribeToSnapshot: (
    snapshotId: string,
    callback: Callback<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ) => Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  unsubscribeFromSnapshot: (snapshotId: string, callback: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void) => void;
  subscribeToSnapshotsSuccess: (callback: (snapshots: Snapshots<T, K, Meta>) => void) => string;
  unsubscribeFromSnapshots: (callback: (snapshots: Snapshots<T, K, Meta>) => void) => void;

  subscribeToSnapshotList: (
    snapshotId: string,
    callback: (snapshots: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void
  ) => void;


  defaultSubscribeToSnapshots: (
    snapshotId: string,
    callback: (snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null,
    snapshot?: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null
  ) => void;

  defaultSubscribeToSnapshot: (
    snapshotId: string,
    callback: Callback<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ) => string;

  handleSubscribeToSnapshot: (
    snapshotId: string,
    callback: Callback<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ) => void;

  transformSubscriber: (
    subscriberId: string,
    sub: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ) => Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>

  subscribe: (
    snapshotId: string | number | null,
    unsubscribe: UnsubscribeDetails,
    subscriber: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null,
    data: T,
    event: SnapshotEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    callback: Callback<SnapshotContext<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
    value: T
  ) => [] | SnapshotsArray<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;

 subscribeSimple(
    callback: (snap: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void
  ): () => void
}

interface SnapshotHandlerMethods<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {
  handleSnapshot: (
    id: string,
    snapshotId: string | number | null,
    snapshot: T extends SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> ? Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> : null,
    snapshotData: WrappedU,
    categoryProperties: CategoryProperties | undefined,
    callback: (snapshot: T) => void,
    snapshots: SnapshotsArray<T>,
    type: string,
    event: SnapshotEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    category?: Category,
    snapshotContainer?: T | undefined,
    snapshotStoreConfig?: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null | undefined,
    storeConfigs?: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]
  ) => Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null>;
}

interface SnapshotActionMethods {
  executeSnapshotAction: (actionType: SnapshotActionType, actionData: any) => Promise<void>;
  handleActions: (action: (selectedText: string) => void) => void;
}
interface SnapshotStateManagementMethods {
  getState: () => any;
  setState: (state: any) => void;
  sortSnapshots: () => void;
  filterSnapshots: () => void;
}

interface SnapshotTransformationMethods<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {

  // ADD new function property (for data processing)
  processSnapshotData?: (
    id: string | number | null,
    data: InitializedData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
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
    store?: SnapshotStore<any, any, any, any, any, any>
  ) => Promise<SnapshotDataType<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>;

  reduceSnapshots: <R extends BaseDataEntity>(
    callback: (acc: R, snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => R,
    initialValue: R
  ) => R | undefined;

  reduceSnapshotItems: (
    callback: (acc: any, snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => any,
    initialValue: any
  ) => any;

  flatMap: <R extends Iterable<any>>(
    callback: (
      value: SnapshotStoreConfig<R, any>,
      index: number,
      array: SnapshotStoreConfig<R, any>[]
    ) => R
  ) => R extends (infer I)[] ? I[] : R[];

  transformSnapshotConfig: <U extends BaseDataEntity>(
    config: SnapshotStoreConfig<U, U>
  ) => SnapshotStoreConfig<U, U>;


  mapSnapshots: <U, V>(
    storeIds: number[],
    snapshotId: string,
    categoryProperties: CategoryProperties | undefined,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    timestamp: string | number | Date | undefined,
    type: string,
    event: SnapshotEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    id: number,
    snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    data: K,
    callback: (
      storeIds: number[],
      snapshotId: string,
      categoryProperties: CategoryProperties | undefined,
      snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      timestamp: string | number | Date | undefined,
      type: string,
      event: SnapshotEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      id: number,
      snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      data: V, // Use V for the callback data type
      index: number,
      category?: Category, 
    ) => U, // Return type of the callback
    category?: Category,
  ) => U[];
  
}



interface SnapshotConfigurationMethods<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {
  addStoreConfig: (config: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void,


  handleSnapshotConfig: (config: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void,
  getSnapshotConfig: (
    snapshotId: string | null,
    snapshotContainer: SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    criteria: CriteriaType,
    category: Category,
    categoryProperties: CategoryProperties | undefined,
    delegate: any,
    snapshotData: SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshot: (
      id: string,
      snapshotId: string | null,
      snapshotData: SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      category: Category
    ) => void
  ) => SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] | undefined;
  setCategory?: (category: symbol | string | Category | undefined) => void;
  transformDelegate?: (delegate: any) => Promise<SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>;
  applyStoreConfig?: (
    snapshotStoreConfig: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
      | undefined
  ) => void;
}

interface SnapshotUpdateMethods<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {

  updateSnapshotsSuccess: (
    snapshotData: (
      subscribers: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
      snapshot: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
    ) => void) => void;
  setSnapshotSuccess: (snapshotData: SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, subscribers: SubscriberCollection<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;
  onInitialize?: (callback: () => void) => void; // This is a method, not a property
  onError?: (error: Error) => void;

  setSnapshotCategory: (id: string, newCategory: Category) => void;
  updateSnapshots: (
    criteria?: CriteriaType,
    updates?: Partial<T>,
    options?: {
      batchSize?: number;
      validate?: boolean;
      notifySubscribers?: boolean;
    }
  ) => Promise<number>;
  // Return count of updated snapshots
  restoreSnapshot?: (
    id: string,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshotId: string,
    snapshotData: SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    savedState: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    callback: (snapshot: WrappedU) => void,
    snapshots: SnapshotsArray<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    type: string,
    event: string | SnapshotEvents<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    subscribers: SubscriberCollection<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    category?: Category,
    snapshotContainer?: T | undefined,
    snapshotStoreConfig?: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined
  ) => void;
}



interface SnapshotVersionMethods {
 getBackendVersion: () => 
    | IHydrateResult<number> 
    | Promise<string> 
    | Promise<string | number | undefined>
    | undefined;
  
  getFrontendVersion: () => 
    | IHydrateResult<number> 
    | Promise<string> 
    | Promise<string | number | undefined>
    | undefined;
}

interface SnapshotUtilityMethods<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {
  generateId: (
    prefix: string,
    name: string,
    type: NotificationType,
    id?: string,
    title?: string,
    chatThreadName?: string,
    chatMessageId?: string,
    chatThreadId?: string,
    dataDetails?: DataDetails<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    generatorType?: string
  ) => string;
  deepCompare: (objA: any, objB: any) => boolean;
  shallowCompare: (objA: any, objB: any) => boolean;
  determineCategory: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null | undefined) => string;
  determinePrefix: (snapshot: T | null | undefined, category: string) => string;
  getBackendVersion: () =>
    | IHydrateResult<number>
    | Promise<string>
    | Promise<string | number | undefined>
    | undefined;
  
  getFrontendVersion: () =>
    | IHydrateResult<number>
    | Promise<string>
    | Promise<string | number | undefined>
    | undefined;
}

interface SnapshotDataStoreMethods<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {
  emit: (
    event: string,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshotId: string,
    subscribers: SubscriberCollection<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    type: string,
    snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    dataItems: RealtimeDataItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
    criteria: SnapshotWithCriteria<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    category: Category,
    snapshotData: SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;
}

interface SnapshotDataStoreMethods<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {
  fetchStoreData: (id: number) => Promise<SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>;
  fetchData: (endpoint: string, id: number) => Promise<SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>;

  getDataStore: () => Promise<InitializedDataStore<T>>;
  getDataStoreMap: () => Promise<Map<string, DataStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>>;

  getDataStoreMethods: () => DataStoreMethods<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;

  getDelegate: (context: {
    useSimulatedDataSource: boolean;
    simulatedDataSource: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
  }) => Promise<DataStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>;
}
interface SnapshotRetrievalMethods<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {

  removeItem: (key: string | number) => Promise<void>;
  setItem: (key: T, value: T) => Promise<void>;
  getItem: (key: T) => Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined>;

  getSnapshot: (
    snapshot: (id: string | number) =>
      | Promise<{
        snapshotId: string | number;
        snapshotData: SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
        category?: Category;
        categoryProperties: CategoryProperties;
        dataStoreMethods: DataStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
        timestamp: string | number | Date | undefined;
        id: string | number | undefined;
        snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
        snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
        data: T;
      }>
      | undefined
  ) => Promise<SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined>;

  getSnapshotById: (id: string) => Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null;

  hasSnapshots: () => Promise<boolean>;

  getSnapshotByCriteria: (criteria: CriteriaType) => Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null;
  getAllSnapshots: (
    storeId: number,
    event: SnapshotEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    ctx: SnapshotContext<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> & {
      timestamp: string;
      type: string;
      id: number;
      categoryProperties?: CategoryProperties;
      dataStoreMethods: DataStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
      data: T;
      snapshotId?: string;
      snapshotData?: T;
      snapshotStore?: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
      category?: Category;
    },
    filter?: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => boolean,
    dataCallback?: (
      subscribers: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
      snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
    ) => Promise<SnapshotUnion<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>
  ) => Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>;

  getSnapshotSuccess: (
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    subscribers: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]
  ) => Promise<SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>;


  getSnapshotConfigItems: () => SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];


  getSnapshotItemsSuccess: () => SnapshotItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] | undefined;
  getSnapshotItemSuccess: () => SnapshotItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined;

  getSnapshotKeys: () => string[] | undefined;
  getSnapshotIdSuccess: () => string | undefined;

  getSnapshotValuesSuccess: () => SnapshotItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] | undefined;

  getSnapshotWithCriteria: (
    criteria: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ) => SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>

   // For RETRIEVING data (simple lookup)
  getSnapshotData?: (params: SnapshotDataParams<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => 
    SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined;

}


interface SnapshotEventMethods {

}


interface SnapshotSuccessMethods<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {

  addDataSuccess: (payload: { data: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] }) => void;

  batchFetchSnapshotsSuccess: (
    subscribers: SubscriberCollection<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
    snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ) => void;

  batchUpdateSnapshotsSuccess: (
    subscribers: SubscriberCollection<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ) => void;

  updateSnapshotSuccess: (
    snapshotId: string,
    snapshotManager: SnapshotManager<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    payload?: { data?: any }
  ) => void;

  createSnapshotSuccess: (
    snapshotId: string,
    snapshotManager: SnapshotManager<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    payload?: { data?: any }
  ) => void;



  addSnapshotSuccess: (
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    subscribers: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]
  ) => void;

  takeSnapshotSuccess: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;

  takeSnapshotsSuccess: (snapshots: T[]) => void;

  handleSnapshotSuccess: (
    message: string,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null,
    snapshotId: string
  ) => void;

  configureSnapshotStore: (
    payload: ConfigureSnapshotStorePayload<
      T,
      K,
      Meta,
      AttachmentType,
      ExcludedFields,
      IncludedFields
    >
  ) => void;


  fetchSnapshotSuccess: (
    id: number,
    snapshotId: string,
    snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    payload: FetchSnapshotPayload<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    data: T,
    delegate: SnapshotWithCriteria<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
    snapshotData: (
      snapshotManager: SnapshotManager<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      subscribers: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
      snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
    ) => void,
  ) => SnapshotWithCriteria<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]
}


interface SnapshotFailureMethods<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {
  // Batch operation failures
  batchFetchSnapshotsFailure: (
    date: Date,
    snapshotManager: SnapshotManager<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    payload: { error: Error }
  ) => void;

  batchUpdateSnapshotsFailure: (
    date: Date,
    snapshotId: string | number | null,
    snapshotManager: SnapshotManager<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    payload: { error: Error }
  ) => void;

  // Update operation failures
  updateSnapshotsFailure: (error: Payload) => void;

  setSnapshotFailure: (error: Error) => void;

  // Other failure methods
  fetchSnapshotFailure: (
    snapshotId: string,
    snapshotManager: SnapshotManager<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    date: Date | undefined,
    payload: { error: Error }
  ) => void;

  addSnapshotFailure: (
    date: Date, 
    snapshotId: string | number | null,
    snapshotManager: SnapshotManager<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    payload: { error: Error; }
  ) => void;

  createSnapshotFailure: (
    date: Date,
    snapshotId: string,
    snapshotManager: SnapshotManager<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    payload: { error: Error }
  ) => void;
}


interface SnapshotMethods<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> extends SnapshotStateManagementMethods,
  SnapshotActionMethods,
  SnapshotHierarchyMethods<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  SnapshotFailureMethods<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  SnapshotConfigurationMethods<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  SnapshotUpdateMethods<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  SnapshotUtilityMethods<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  SnapshotDataStoreMethods<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  SnapshotDataStoreMethods<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  SnapshotRetrievalMethods<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  SnapshotSubscriptionMethods<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  SnapshotComparisonMethods<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  SnapshotBatchMethods<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  SnapshotFilterMethods<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  SnapshotLifecycleMethods<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  SnapshotSuccessMethods<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  SnapshotTransformationMethods<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  SnapshotVersionMethods {
  storeId: number;
  snapConfig: SnapshotConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined;
  subscriberManagement?: SnapshotSubscriberManagement<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined;
  failureDate?: Date; // Tracks the most recent failure date
  payload: Payload | undefined;
  dataItems?: RealtimeDataItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
  newData: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null;
  events: CombinedEvents<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined;
  setCategory?: ((category: symbol | string | Category | undefined) => void) | undefined;

  generateId: (
    prefix: string,
    name: string,
    type: NotificationType,
    id?: string,
    title?: string,
    chatThreadName?: string,
    chatMessageId?: string,
    chatThreadId?: string,
    dataDetails?: DataDetails<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    generatorType?: string
  ) => string;


  getInitialState: () => Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null;
  // getConfigOption: (optionKey: string) =>  ) => Record<string, any>;
  getTimestamp: () => Date | undefined;
  
  mapSnapshot: (
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
    isAsync?: boolean // Flag to determine behavior
  ) => Promise<string | undefined> | Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null

  mapSnapshotWithDetails: (
    storeId: number,
    snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshotId: string,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    type: string,
    event: SnapshotEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    callback: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void,
    details: any
  ) => SnapshotWithData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null;

  unsubscribe: (
    unsubscribeDetails: {
      userId: string; snapshotId: string;
      unsubscribeType: string;
      unsubscribeDate: Date;
      unsubscribeReason: string;
      unsubscribeData: any;
    },
    event: string,
    callback: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void
  ) => void;

  fetchSnapshot: (
    snapshotId: string,
    callback: (
      snapshotId: string,
      payload: FetchSnapshotPayload<T> | undefined,
      snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      payloadData: T | BaseData<any>,
      category: symbol | string | Category | undefined,
      categoryProperties: CategoryProperties | undefined,
      timestamp: Date,
      data: T,
      delegate: SnapshotWithCriteria<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]
    ) => Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ) => Promise<{
    id: string;
    category: Category;
    categoryProperties: CategoryProperties | undefined;
    timestamp: Date;
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
    data: BaseDataEntity;
    delegate: SnapshotWithCriteria<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
  }>

  getAllSnapshots: (
    storeId: number,
    event: SnapshotEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    ctx: SnapshotContext<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> & {
      timestamp: string;
      type: string;
      id: number;
      categoryProperties?: CategoryProperties;
      dataStoreMethods: DataStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
      data: T;
      snapshotId?: string;
      snapshotData?: T;
      snapshotStore?: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
      category?: Category;
    },
    filter?: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => boolean,
    dataCallback?: (
      subscribers: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
      snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
    ) => Promise<SnapshotUnion<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>
  ) => Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>;


  onSnapshot: (
    snapshotId: string,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    type: string,
    event: SnapshotEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    callback: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void
  ) => void;

  onSnapshots: (snapshotId: string,
    snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    type: string,
    event: SnapshotEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    callback: (snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void
  ) => void;
}

export type { SnapshotHierarchyMethods, SnapshotMethods, SnapshotSubscriptionMethods };

