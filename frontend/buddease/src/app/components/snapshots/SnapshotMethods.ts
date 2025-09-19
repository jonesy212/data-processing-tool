// SnapshotMethods.ts
import { Content } from '@/app/components/models/content/AddContent';
import { BaseData } from '@/app/components/models/data/Data';
import { K, T } from "@/app/components/models/data/dataStoreMethods";
import { StatusType } from '@/app/components/models/data/StatusType';
import { Tag } from '@/app/components/models/tracker/Tag';
import { Callback, SnapshotContainer, SnapshotItem } from '@/app/components/snapshots';
import { SnapshotsArray } from '@/app/components/snapshots/LocalStorageSnapshotStore';
import { SnapshotEvents } from "@/app/components/snapshots/SnapshotEvents";
import { SnapshotContext } from '@/app/components/snapshots/SnapshotSubscriberManagement';
import { SubscriberCollection } from '@/app/components/users/SubscriberCollection';
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/app/configs/BaseConfig';
import { NotificationType, NotificationTypeEnum } from '@/app/context/NotificationContext';
import { CategoryProperties } from '@/app/pages/personas/ScenarioBuilder';
import { CriteriaType } from '@/app/pages/searchs/CriteriaType';
import { SnapshotEvent } from '@/app/typings/eventTypes';
import { IHydrateResult } from "mobx-persist";
import { SnapshotData, SnapshotDataType, SnapshotWithCriteria } from ".";
import { UnsubscribeDetails } from '../../../data_analysis/frontend/buddease/src/app/components/event/DynamicEventHandlerExample';
import { DataStoreMethods } from '../../../data_analysis/frontend/buddease/src/app/components/projects/DataAnalysisPhase/DataProcessing/ DataStoreMethods';
import CalendarManagerStoreClass from '../../../data_analysis/frontend/buddease/src/app/components/state/stores/CalendarManagerStore';
import { StructuredMetadata } from '../../../data_analysis/frontend/buddease/src/app/configs/StructuredMetadata';
import { UpdateSnapshotPayload } from '../../../data_analysis/frontend/buddease/src/server/database/Payload';
import { CreateSnapshotsPayload, Payload } from "../../../server/database/Payload";
import { SnapshotWithData } from '../calendar/CalendarApp';
import { CombinedEvents, SnapshotManager } from '../hooks/useSnapshotManager';
import { Category } from "../libraries/categories/generateCategoryProperties";
import { DataDetails } from "../models/data/Data";
import { RealtimeDataItem } from "../models/realtime/RealtimeData";
import { DataStore } from '../projects/DataAnalysisPhase/DataProcessing/DataStore';
import { Subscriber } from "../users/Subscriber";
import Version from '../versions/Version';
import { FetchSnapshotPayload } from './FetchSnapshotPayload';
import { WrappedU } from './isCompatibleTempData';
import {
  Result,
  Snapshots,
  SnapshotUnion
} from "./LocalStorageSnapshotStore";
import { Snapshot } from "./Snapshot";
import { SnapshotActionType } from './SnapshotActionType';
import { SnapshotConfig } from "./SnapshotConfig";
import { SnapshotHierarchyMethods } from './SnapshotData';
import { SnapshotDataParams } from './SnapshotDataParams';
import { default as SnapshotStore } from "./SnapshotStore";
import { SnapshotStoreConfig } from "./SnapshotStoreConfig";
import { InitializedData, InitializedDataStore } from './SnapshotStoreOptions';
import { SnapshotSubscriberManagement } from './SnapshotSubscriberManagement';
import { UpdateSnapshotParams } from './UpdateSnapshotParams';
import { Attachment } from "@/components/documents/Attachment/attachment";


type SnapshotStoreMap = Map<T, [K, SnapshotStore<T, K, DefaultMeta<T, K>, DefaultExcludedFields<T>>]>;

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
      snapshot1Version?: string | number | Version<T, K, Meta, ExcludedFields> | null;
      snapshot2Version?: string | number | Version<T, K, Meta, ExcludedFields>;
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
  ) => Promise<{ snapshots: Snapshots<T, K, Meta, ExcludedFields> }>;

  batchFetchSnapshots: (
    criteria: CriteriaType,
    snapshotData: (
      snapshotIds: string[],
      subscribers: SubscriberCollection<T, K, Meta, ExcludedFields>,
      snapshots: Snapshots<T, K, Meta, ExcludedFields>
    ) => Promise<{
      subscribers: SubscriberCollection<T, K, Meta, ExcludedFields>;
      snapshots: Snapshots<T, K, Meta, ExcludedFields>;
    }>
  ) => Promise<Snapshots<T, K, Meta, ExcludedFields>>;

  batchTakeSnapshotsRequest: (
    criteria: CriteriaType,
    snapshotData: (
      snapshotIds: string[],
      snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      subscribers: Subscriber<T, K, Meta, ExcludedFields>[]
    ) => Promise<{ subscribers: Subscriber<T, K, Meta, ExcludedFields>[] }>
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
      subscribers: SubscriberCollection<T, K, Meta, ExcludedFields>
    ) => Promise<{
      subscribers: SubscriberCollection<T, K, Meta, ExcludedFields>;
      snapshots: Snapshots<T, K, Meta, ExcludedFields>;
    }>,
    snapshotManager: SnapshotManager<T, K, Meta, ExcludedFields>
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
  getSnapshots: (category: string, data: Snapshots<T, K, Meta, ExcludedFields>) => void;
  getAllValues: () => SnapshotsArray<T, K, Meta>; // Use SnapshotsArray<T, K, Meta> if it represents an array of snapshots

  getAllItems: () => Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] | undefined>;

  getSnapshotEntries: (snapshotId: string) => Map<string, T> | undefined;
  getAllSnapshotEntries: () => Map<string, T>[];




  getAllSnapshots: (
    storeId: number,
    event: SnapshotEvent<T, K, Meta, ExcludedFields>,
    ctx: SnapshotContext<T, K, Meta, ExcludedFields> & {
      timestamp: string;
      type: string;
      id: number;
      categoryProperties?: CategoryProperties;
      dataStoreMethods: DataStore<T, K, Meta, ExcludedFields>;
      data: T;
    },
    filter?: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => boolean,
    dataCallback?: (
      subscribers: Subscriber<T, K, Meta, ExcludedFields>[],
      snapshots: Snapshots<T, K, Meta, ExcludedFields>
    ) => Promise<SnapshotUnion<T, K, Meta, ExcludedFields>[]>
  ) => Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>;


  getAllKeys: (
    storeId: number,
    snapshotId: string,
    category: Category | undefined,
    categoryProperties: CategoryProperties | undefined,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null,
    timestamp: string | number | Date | undefined,
    type: string,
    event: SnapshotEvents<T, K, Meta, ExcludedFields>,
    id: number,
    snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    data: T
  ) => Promise<string[] | undefined> | undefined;

  findSnapshot: (
    predicate: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => boolean
  ) => Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined;

  filterSnapshotsByStatus: (status: StatusType) => Snapshots<T, K, Meta, ExcludedFields>;
  filterSnapshotsByCategory: (category: Category) => Snapshots<T, K, Meta, ExcludedFields>;
  filterSnapshotsByTag: (tag: Tag<T, K, Meta, ExcludedFields>) => Snapshots<T, K, Meta, ExcludedFields>;


  getSnapshotItems: (
    category: Category | undefined,
    snapshots: SnapshotsArray<T, K, Meta>,
    snapshotId?: string,
    callback?: (items: SnapshotItem<T, K, Meta, ExcludedFields>[]) => void
  ) => (SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | SnapshotItem<T, K, Meta, ExcludedFields>)[] | undefined;

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
  initializeWithData: (data: SnapshotUnion<T, K, Meta, ExcludedFields>[]) => void;

  initSnapshot: (
    snapshot: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null,
    snapshotId: string | number | null,
    snapshotData: SnapshotData<T, K, Meta, ExcludedFields>,
    category: symbol | string | Category | undefined,
    categoryProperties: CategoryProperties | undefined,
    snapshotConfig: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    callback: (snapshotStore: SnapshotStore<any, any>) => void,
    snapshotStoreConfig: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshotStoreConfigSearch: SnapshotStoreConfig<
      SnapshotWithCriteria<BaseDataEntity, K>,
      SnapshotWithCriteria<BaseDataEntity, K>
    >
  ) => void;

  createSnapshots: (
    id: string,
    snapshotId: string,
    snapshots: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
    snapshotManager: SnapshotManager<T, K, Meta, ExcludedFields>,
    payload: CreateSnapshotsPayload<T, K, Meta, ExcludedFields>,
    callback: (snapshots: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]) => void | null,
    snapshotDataConfig?: SnapshotConfig<T, K, Meta, ExcludedFields>[] | undefined,
    category?: string | Category,
    categoryProperties?: CategoryProperties
  ) => Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] | null;


  takeSnapshot: (
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    subscribers: Subscriber<T, K, Meta, ExcludedFields>[]
  ) => Promise<{ snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> }>;


  removeSnapshot: (snapshotToRemove: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;
  addSnapshotItem: (item: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;
  // addSnapConfig: (config: SnapshotConfig<T, K, Meta, ExcludedFields>) => void;
  addNestedStore: (
    store: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    item: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ) => void;
  clearSnapshots: () => void;

  addSnapshot: (
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshotId: string,
    subscribers: SubscriberCollection<T, K, Meta, ExcludedFields>
  ) => Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined>;

  createInitSnapshot: (
    id: string,
    initialData: T,
    snapshotData: SnapshotData<T, K, Meta, ExcludedFields>,
    snapshotStoreConfig: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    category: Category | undefined,
    additionalData: any
  ) => Promise<Result<Snapshot<T, K, never>>>;


  validateSnapshot: (snapshotId: string, snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => boolean;

  setSnapshot: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;
  clearSnapshot: () => void;

  takeLatestSnapshot: () => Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined;

  updateSnapshot: (
    snapshotId: string | number | null,
    snapshotIdOrParams: string | number | null | UpdateSnapshotParams<T, K, Meta, ExcludedFields>,
    // oldSnapshot: Snapshot<AppEntity, AppK,  AppMeta, AppAttachment, AppExcludedFields, AppIncludeField>,
    data: Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
    newData: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    timestamp: Date,
    category: Category | undefined,
    events?: Record<string, CalendarManagerStoreClass<T, K, Meta, ExcludedFields>[]>,
    snapshotStore?: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    dataItems?: RealtimeDataItem<T, K, Meta, ExcludedFields>[],
    payloadData?: T | K,
    mappedSnapshotData?: Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
    delegate?: SnapshotWithCriteria<T, K, Meta, ExcludedFields>[],
    payload?: UpdateSnapshotPayload<T>,
    store?: SnapshotStore<any, K, Meta, ExcludedFields>,
    callback?: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void, 
    snapshotManager?: SnapshotManager<T, K, Meta, ExcludedFields>,
  ) => Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;



  handleSnapshotFailure: (error: Error, snapshotId: string) => void;

  updateSnapshotFailure: (
    snapshotId: string,
    snapshotManager: SnapshotManager<WrappedU, WrappedU, Meta, ExcludedFields>,
    snapshot: Snapshot<WrappedU, WrappedU, Meta, ExcludedFields>,
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
    store: SnapshotStore<WrappedU, WrappedU, Meta, ExcludedFields>,
    snapshotId: string,
    snapshot: Snapshot<WrappedU, WrappedU, Meta, ExcludedFields>,
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
    content: Content<WrappedU, WrappedU, Meta, ExcludedFields>,
    data: any,
    date: Date,
    type: NotificationType
  ) => void;

  notifySubscribers: (
    message: string,
    subscribers: Subscriber<WrappedU, WrappedU, Meta, ExcludedFields>[],
    callback: (data: Snapshot<T, K, StructuredMetadata<T, K>, never>) => Subscriber<T, K, StructuredMetadata<T, K>>[],
    data: Partial<SnapshotStoreConfig<SnapshotUnion<T, K, Meta, ExcludedFields>, K>>
  ) => Subscriber<WrappedU, WrappedU, Meta, ExcludedFields>[];
}

interface SnapshotSubscriptionMethods<
  T extends BaseDataEntity,
  K extends T = T,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {
  addSnapshotSubscriber: (snapshotId: string, subscriber: Subscriber<WrappedU, WrappedU, Meta, ExcludedFields>) => void;
  removeSnapshotSubscriber: (snapshotId: string, subscriber: Subscriber<WrappedU, WrappedU, Meta, ExcludedFields>) => void;
  subscribeToSnapshot: (
    snapshotId: string,
    callback: Callback<Snapshot<WrappedU, WrappedU, Meta, ExcludedFields>>,
    snapshot: Snapshot<WrappedU, WrappedU, Meta, ExcludedFields>
  ) => Snapshot<WrappedU, WrappedU, Meta, ExcludedFields>;
  unsubscribeFromSnapshot: (snapshotId: string, callback: (snapshot: Snapshot<WrappedU, WrappedU, Meta, ExcludedFields>) => void) => void;
  subscribeToSnapshotsSuccess: (callback: (snapshots: Snapshots<T, K, Meta>) => void) => string;
  unsubscribeFromSnapshots: (callback: (snapshots: Snapshots<T, K, Meta>) => void) => void;

  subscribeToSnapshotList: (
    snapshotId: string,
    callback: (snapshots: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void
  ) => void;


  defaultSubscribeToSnapshots: (
    snapshotId: string,
    callback: (snapshots: Snapshots<T, K, Meta, ExcludedFields>) => Subscriber<T, K, Meta, ExcludedFields> | null,
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
    sub: Subscriber<T, K, Meta, ExcludedFields>
  ) => Subscriber<T, K, Meta, ExcludedFields>

  subscribe: (
    snapshotId: string | number | null,
    unsubscribe: UnsubscribeDetails,
    subscriber: Subscriber<WrappedU, WrappedU, Meta, ExcludedFields> | null,
    data: T,
    event: SnapshotEvent<T, K, Meta, ExcludedFields>,
    callback: Callback<SnapshotContext<WrappedU, WrappedU, Meta, ExcludedFields>>,
    value: T
  ) => [] | SnapshotsArray<T, K, Meta, ExcludedFields>;

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
    snapshot: T extends SnapshotData<WrappedU, WrappedU, Meta, ExcludedFields> ? Snapshot<WrappedU, WrappedU, Meta, ExcludedFields> : null,
    snapshotData: WrappedU,
    category: Category | undefined,
    categoryProperties: CategoryProperties | undefined,
    callback: (snapshot: T) => void,
    snapshots: SnapshotsArray<T>,
    type: string,
    event: SnapshotEvent<T, K, Meta, ExcludedFields>,
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
    data: InitializedData<T, K, Meta, ExcludedFields>,
    snapshotManager: SnapshotManager<T, K, Meta, ExcludedFields>,
    events: Record<string, CalendarManagerStoreClass<T, K, Meta, ExcludedFields>[]>,
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
    store?: SnapshotStore<any, any, any, any>
  ) => Promise<SnapshotDataType<T, K, ExcludedFields>>;

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
    category: Category | undefined, 
    categoryProperties: CategoryProperties | undefined,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    timestamp: string | number | Date | undefined,
    type: string,
    event: SnapshotEvent<T, K, Meta, ExcludedFields>,
    id: number,
    snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    data: K,
    callback: (
      storeIds: number[],
      snapshotId: string,
      category: Category | undefined, categoryProperties: CategoryProperties | undefined,
      snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      timestamp: string | number | Date | undefined,
      type: string,
      event: SnapshotEvent<T, K, Meta, ExcludedFields>,
      id: number,
      snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      data: V, // Use V for the callback data type
      index: number
    ) => U // Return type of the callback
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
    snapshotContainer: SnapshotContainer<T, K, Meta, ExcludedFields>,
    criteria: CriteriaType,
    category: Category,
    categoryProperties: CategoryProperties | undefined,
    delegate: any,
    snapshotData: SnapshotData<T, K, Meta, ExcludedFields>,
    snapshot: (
      id: string,
      snapshotId: string | null,
      snapshotData: SnapshotData<T, K, Meta, ExcludedFields>,
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
      subscribers: Subscriber<T, K, Meta, ExcludedFields>[],
      snapshot: Snapshots<T, K, Meta, ExcludedFields>
    ) => void) => void;
  setSnapshotSuccess: (snapshotData: SnapshotData<T, K, Meta, ExcludedFields>, subscribers: SubscriberCollection<T, K, Meta, ExcludedFields>) => void;
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
    snapshotData: SnapshotData<T, K, Meta, ExcludedFields>,
    savedState: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    category: Category | undefined,
    callback: (snapshot: WrappedU) => void,
    snapshots: SnapshotsArray<WrappedU>,
    type: string,
    event: string | SnapshotEvents<T, K, Meta, ExcludedFields>,
    subscribers: SubscriberCollection<T, K, Meta, ExcludedFields>,
    snapshotContainer?: T | undefined,
    snapshotStoreConfig?: SnapshotStoreConfig<SnapshotUnion<T, K, Meta, ExcludedFields>, K> | undefined
  ) => void;
}



interface SnapshotVersionMethods<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {
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
    type: NotificationTypeEnum,
    id?: string,
    title?: string,
    chatThreadName?: string,
    chatMessageId?: string,
    chatThreadId?: string,
    dataDetails?: DataDetails<T, K, Meta, ExcludedFields>,
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
    subscribers: SubscriberCollection<T, K, Meta, ExcludedFields>,
    type: string,
    snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    dataItems: RealtimeDataItem<T, K, Meta, ExcludedFields>[],
    criteria: SnapshotWithCriteria<T, K, Meta, ExcludedFields>,
    category: Category,
    snapshotData: SnapshotData<T, K, Meta, ExcludedFields>) => void;
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
  getDataStoreMap: () => Promise<Map<string, DataStore<T, K, Meta, ExcludedFields>>>;

  getDataStoreMethods: () => DataStoreMethods<T, K, Meta, ExcludedFields>;

  getDelegate: (context: {
    useSimulatedDataSource: boolean;
    simulatedDataSource: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
  }) => Promise<DataStore<T, K, Meta, ExcludedFields>[]>;
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
        snapshotData: SnapshotData<T, K, Meta, ExcludedFields>;
        category: Category | undefined;
        categoryProperties: CategoryProperties;
        dataStoreMethods: DataStore<T, K, Meta, ExcludedFields>;
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
    event: SnapshotEvent<T, K, Meta, ExcludedFields>,
    ctx: SnapshotContext<T, K, Meta, ExcludedFields> & {
      timestamp: string;
      type: string;
      id: number;
      categoryProperties?: CategoryProperties;
      dataStoreMethods: DataStore<T, K, Meta, ExcludedFields>;
      data: T;
    },
    filter?: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => boolean,
    dataCallback?: (
      subscribers: Subscriber<T, K, Meta, ExcludedFields>[],
      snapshots: Snapshots<T, K, Meta, ExcludedFields>
    ) => Promise<SnapshotUnion<T, K, Meta, ExcludedFields>[]>
  ) => Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>;

  getSnapshotSuccess: (
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    subscribers: Subscriber<T, K, Meta, ExcludedFields>[]
  ) => Promise<SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>;


  getSnapshotConfigItems: () => SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];


  getSnapshotItemsSuccess: () => SnapshotItem<T, K, Meta, ExcludedFields>[] | undefined;
  getSnapshotItemSuccess: () => SnapshotItem<T, K, Meta, ExcludedFields> | undefined;

  getSnapshotKeys: () => string[] | undefined;
  getSnapshotIdSuccess: () => string | undefined;

  getSnapshotValuesSuccess: () => SnapshotItem<T, K, Meta, ExcludedFields>[] | undefined;

  getSnapshotWithCriteria: (
    criteria: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ) => SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>

   // For RETRIEVING data (simple lookup)
  getSnapshotData?: (params: SnapshotDataParams<T, K, Meta, ExcludedFields>) => 
    SnapshotData<T, K, Meta, ExcludedFields> | undefined;

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
    subscribers: SubscriberCollection<T, K, Meta, ExcludedFields>[],
    snapshots: Snapshots<T, K, Meta, ExcludedFields>
  ) => void;

  batchUpdateSnapshotsSuccess: (
    subscribers: SubscriberCollection<T, K, Meta, ExcludedFields>,
    snapshots: Snapshots<T, K, Meta, ExcludedFields>
  ) => void;

  updateSnapshotSuccess: (
    snapshotId: string,
    snapshotManager: SnapshotManager<T, K, Meta, ExcludedFields>,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    payload?: { data?: any }
  ) => void;

  createSnapshotSuccess: (
    snapshotId: string,
    snapshotManager: SnapshotManager<T, K, Meta, ExcludedFields>,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    payload?: { data?: any }
  ) => void;



  addSnapshotSuccess: (
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    subscribers: Subscriber<T, K, Meta, ExcludedFields>[]
  ) => void;

  takeSnapshotSuccess: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;

  takeSnapshotsSuccess: (snapshots: T[]) => void;

  handleSnapshotSuccess: (
    message: string,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null,
    snapshotId: string
  ) => void;

  fetchSnapshotSuccess: (
    id: number,
    snapshotId: string,
    snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    payload: FetchSnapshotPayload<T, K, Meta, ExcludedFields> | undefined,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    data: T,
    delegate: SnapshotWithCriteria<T, K, Meta, ExcludedFields>[],
    snapshotData: (
      snapshotManager: SnapshotManager<T, K, Meta, ExcludedFields>,
      subscribers: Subscriber<T, K, Meta, ExcludedFields>[],
      snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
    ) => void,
  ) => SnapshotWithCriteria<T, K, Meta, ExcludedFields>[]
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
    snapshotManager: SnapshotManager<T, K, Meta, ExcludedFields>,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    payload: { error: Error }
  ) => void;

  batchUpdateSnapshotsFailure: (
    date: Date,
    snapshotId: string | number | null,
    snapshotManager: SnapshotManager<T, K, Meta, ExcludedFields>,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    payload: { error: Error }
  ) => void;

  // Update operation failures
  updateSnapshotsFailure: (error: Payload) => void;

  setSnapshotFailure: (error: Error) => void;

  // Other failure methods
  fetchSnapshotFailure: (
    snapshotId: string,
    snapshotManager: SnapshotManager<T, K, Meta, ExcludedFields>,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    date: Date | undefined,
    payload: { error: Error }
  ) => void;

  addSnapshotFailure: (
    date: Date, 
    snapshotId: string | number | null,
    snapshotManager: SnapshotManager<T, K, Meta, ExcludedFields>,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    payload: { error: Error; }
  ) => void;

  createSnapshotFailure: (
    date: Date,
    snapshotId: string,
    snapshotManager: SnapshotManager<T, K, Meta, ExcludedFields>,
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
  SnapshotHierarchyMethods<T, K, Meta, ExcludedFields>,
  SnapshotFailureMethods<T, K, Meta, ExcludedFields>,
  SnapshotConfigurationMethods<T, K, Meta, ExcludedFields>,
  SnapshotUpdateMethods<T, K, Meta, ExcludedFields>,
  SnapshotUtilityMethods<T, K, Meta, ExcludedFields>,
  SnapshotDataStoreMethods<T, K, Meta, ExcludedFields>,
  SnapshotDataStoreMethods<T, K, Meta, ExcludedFields>,
  SnapshotRetrievalMethods<T, K, Meta, ExcludedFields>,
  SnapshotSubscriptionMethods<T, K, Meta, ExcludedFields>,
  SnapshotComparisonMethods<T, K, Meta, ExcludedFields>,
  SnapshotBatchMethods<T, K, Meta, ExcludedFields>,
  SnapshotFilterMethods<T, K, Meta, ExcludedFields>,
  SnapshotLifecycleMethods<T, K, Meta, ExcludedFields>,
  SnapshotSuccessMethods<T, K, Meta, ExcludedFields>,
  SnapshotTransformationMethods<T, K, Meta, ExcludedFields>,
  SnapshotVersionMethods<T, K, Meta, ExcludedFields> {
  storeId: number;
  snapConfig: SnapshotConfig<T, K, Meta, ExcludedFields> | undefined;
  subscriberManagement?: SnapshotSubscriberManagement<T, K, Meta, ExcludedFields> | undefined;
  failureDate?: Date; // Tracks the most recent failure date
  payload: Payload | undefined;
  dataItems?: RealtimeDataItem<T, K, Meta, ExcludedFields>[];
  newData: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null;
  events: CombinedEvents<T, K, Meta, ExcludedFields> | undefined;
  setCategory?: ((category: symbol | string | Category | undefined) => void) | undefined;

  generateId: (
    prefix: string,
    name: string,
    type: NotificationTypeEnum,
    id?: string,
    title?: string,
    chatThreadName?: string,
    chatMessageId?: string,
    chatThreadId?: string,
    dataDetails?: DataDetails<T, K, Meta, ExcludedFields>,
    generatorType?: string
  ) => string;


  getInitialState: () => Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null;
  // getConfigOption: (optionKey: string) =>  ) => Record<string, any>;;
  getTimestamp: () => Date | undefined;
  
  mapSnapshot: (
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
    mapFn: (item: T) => T,
    isAsync?: boolean // Flag to determine behavior
  ) => Promise<string | undefined> | Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null

  mapSnapshotWithDetails: (
    storeId: number,
    snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshotId: string,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    type: string,
    event: SnapshotEvent<T, K, Meta, ExcludedFields>,
    callback: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void,
    details: any
  ) => SnapshotWithData<T, K, Meta, ExcludedFields> | null;

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
      delegate: SnapshotWithCriteria<T, K, Meta, ExcludedFields>[]
    ) => Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ) => Promise<{
    id: string;
    category: Category;
    categoryProperties: CategoryProperties | undefined;
    timestamp: Date;
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
    data: BaseDataEntity;
    delegate: SnapshotWithCriteria<T, K, Meta, ExcludedFields>[];
  }>

  getAllSnapshots: (
    storeId: number,
    event: SnapshotEvent<T, K, Meta, ExcludedFields>,
    ctx: SnapshotContext<T, K, Meta, ExcludedFields> & {
      timestamp: string;
      type: string;
      id: number;
      categoryProperties?: CategoryProperties;
      dataStoreMethods: DataStore<T, K, Meta, ExcludedFields>;
      data: T;
      snapshotId?: string;
      snapshotData?: T;
      snapshotStore?: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
      category?: Category;
    },
    filter?: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => boolean,
    dataCallback?: (
      subscribers: Subscriber<T, K, Meta, ExcludedFields>[],
      snapshots: Snapshots<T, K, Meta, ExcludedFields>
    ) => Promise<SnapshotUnion<T, K, Meta, ExcludedFields>[]>
  ) => Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>;


  onSnapshot: (
    snapshotId: string,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    type: string,
    event: SnapshotEvent<T, K, Meta, ExcludedFields>,
    callback: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void
  ) => void;

  onSnapshots: (snapshotId: string,
    snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    type: string,
    event: SnapshotEvent<T, K, Meta, ExcludedFields>,
    callback: (snapshots: Snapshots<T, K, Meta, ExcludedFields>) => void
  ) => void;
}

export type { SnapshotHierarchyMethods, SnapshotMethods, SnapshotStoreMap, SnapshotSubscriptionMethods };

