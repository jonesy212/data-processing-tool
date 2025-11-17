// SnapshotStoreConfig.ts
import { NotificationTypeEnum } from '@/state/context/NotificationContext';
import { SnapshotContextType } from '@/app/state/context/SnapshotContext';
import fetchCategoryByName from "@/app/api/CategoryApi";
import { endpoints } from "@/app/api/endpointConfigurations";
import { SnapshotCategory } from "@/app/api/getSnapshotEndpoint";
import fetchSnapshotStoreData, * as snapshotApi from "@/app/api/SnapshotApi";
import { CalendarEvent } from '@/app/calendar/CalendarEvent';
import { StructuredMetadata } from "@/app/config/StructuredMetadata";
import { Attachment } from '@/app/documents/attachment/Attachment';
import { ModifiedDate } from "@/app/documents/DocType";
import { FileCategory } from "@/app/documents/FileType";
import { SnapshotManager, useSnapshotManager } from "@/app/hooks/useSnapshotManager";
import { determineCategory } from "@/app/libraries/categories/determineCategory";
import determineFileCategory, { fetchFileSnapshotData } from "@/app/libraries/categories/determineFileCategory";
import { Category } from "@/app/libraries/categories/generateCategoryProperties";
import { Content } from '@/app/models/content/AddContent';
import { BaseData, Data, DataDetails } from '@/app/models/data/Data';
import { Meta } from '@/app/models/data/dataStoreMethods';
import { NotificationPosition, StatusType } from "@/app/models/data/StatusType";
import { CategoryProperties } from "@/app/pages/personas/ScenarioBuilder";
import { CriteriaType } from "@/app/pages/searches/CriteriaType";
import { DataStoreMethods, DataStoreWithSnapshotMethods } from "@/app/projects/DataAnalysisPhase/DataProcessing/DataStoreMethods";
import { CreateSnapshotStoresPayload, Payload, UpdateSnapshotPayload } from "@/app/server/database/Payload";
import { Snapshots, SnapshotsArray, SnapshotsObject, SnapshotUnion } from '@/app/snapshots/LocalStorageSnapshotStore';
import { Snapshot } from '@/app/snapshots/Snapshot';
import { RetentionPolicy } from '@/app/snapshots/SnapshotConfig';
import { SnapshotErrorHandling } from '@/app/snapshots/SnapshotErrorHandling';
import { InitializedDelegate } from '@/app/snapshots/SnapshotStoreOptions';
import { SnapshotContext } from '@/app/snapshots/SnapshotSubscriberManagement';
import { NotificationType } from '@/app/state/context/NotificationContext';
import { batchFetchSnapshotsFailure, batchFetchSnapshotsSuccess, batchUpdateSnapshotsFailure, batchUpdateSnapshotsRequest, batchUpdateSnapshotsSuccess } from "@/app/state/redux/slices/SnapshotSlice";
import CalendarManagerStoreClass from "@/app/state/stores/CalendarManagerStore";
import { DataStore } from "@/app/state/stores/DataStore";
import { AllStatus } from '@/app/state/stores/DetailsListStore';
import { AuditRecord, Subscriber } from "@/app/subscribers/Subscriber";
import { Callback, MultipleEventsCallbacks } from "@/app/subscribers/subscribeToSnapshotsImplementation";
import { PortfolioUpdatesLastUpdated } from "@/app/trading/PortfolioUpdatesLastUpdated";
import { UnsubscribeDetails } from '@/app/typings/eventHandlers/eventTypes';
import { RealtimeDataItem } from '@/app/typings/realtimeTypes';
import { VersionHistory } from "@/app/versions/VersionData";
import { generateSnapshotId, storeId } from "@/utils/snapshotUtils";
import { getCommunityEngagement, getMarketUpdates, getTradeExecutions } from "@/utils/trading/TradingUtils";
import { portfolioUpdates, tradeExections, triggerIncentives } from "@/utils/web3/applicationUtils";
import { fetchData } from "pdfjs-dist";
import { SimulatedDataSource } from "./createSnapshotOptions";
import { FetchSnapshotPayload } from "./FetchSnapshotPayload";

import { AdminUser } from "@/app/api/ApiUser";
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { SchemaField } from "@/app/config/metadata/SchemaField";
import { UnifiedMetadata } from "@/app/config/MetaDataOptions";
import { SharedIdentifiers } from "@/app/documents/RelatedProps";
import { PrivacySettings } from "@/app/settings/PrivacySettings";
import { snapshotConfig } from '@/app/snapshots/Snapshot';
import { UpdateSnapshotParams } from '@/app/snapshots/UpdateSnapshotParams';
import { SnapshotVersion } from '@/app/snapshots/useSnapshotVersioningSystem';
import { AppSubscriber, AppSubscription } from '@/app/subscribers/Subscriber';
import { SubscriberCollection } from '@/app/subscribers/SubscriberCollection';
import { subscribeToSnapshotImpl } from "@/app/subscribers/subscribeToSnapshotsImplementation";
import { Subscription } from '@/app/subscriptions/Subscription';
import { AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields, AppSnapshot, AppSnapshotStoreConfig } from "@/app/typings/entities/AppEntity";
import { SnapshotEvent } from "@/app/typings/snapshotTypes";
import { default as Version } from "@/app/versions/Version";
import { UserConfig as ViteUserConfig } from 'vite';
import { SnapshotOperation } from "../actions/SnapshotActions";
import { createSnapshot } from "./createSnapshot";
import { TransformMethods } from "./methods/transformMethods";
import { ConfigureSnapshotStorePayload, SnapshotConfig } from "./SnapshotConfig";
import { SnapshotConfiguration } from "./SnapshotConfiguration";
import { SnapshotContainer, SnapshotContainerType, SnapshotDataType } from "./SnapshotContainer";
import { SnapshotCore, SnapshotStoreCore } from "./SnapshotCore";
import { CustomSnapshotData, SnapshotData } from "./SnapshotData";
import { batchTakeSnapshot, batchTakeSnapshotsRequest, handleSnapshotSuccess } from "./snapshotHandlers";
import SnapshotList, { SnapshotItem } from "./SnapshotList";
import { default as SnapshotStore } from "./SnapshotStore";
import { InitializedData, InitializedDataStore, SnapshotStoreOptions } from "./SnapshotStoreOptions";
import { storeProps } from "./SnapshotStoreProps";
import SnapshotStoreSubset from "./SnapshotStoreSubset";
import { SnapshotSubscriberManagement } from "./SnapshotSubscriberManagement";
import { SnapshotWithCriteria } from "./SnapshotWithCriteria";
import { TagsRecord } from '@/app/models/tracker/Tag';
import { SnapshotStoreProps } from "./useSnapshotStore";
import { ValidationRule } from "./ValidationRule";

interface UserConfig<  
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> extends ViteUserConfig {
  snapshotConfig?: SnapshotConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]; // Use generic types
  snapshotStoreConfig?: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>; // Use generic types
  root?: string; 
  base?: string; 
}

interface DataWithParentAndChildIds<
  T extends BaseDataEntity = BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>
> extends BaseDataEntity {
  parentId?: string;
  childIds?: K[];
}


const snapshot = snapshotApi.getSnapshot(
  "123", // snapshotId
  1, // storeId
  {} as Snapshot<AdminUser,
    AdminUser,
    DefaultMeta<T, K>,
    DefaultExcludedFields<T>
  >,
  // snapshot (you’ll want a real Snapshot<T,K> here)
  "manual", // type
  {} as SnapshotEvent<
    AdminUser, AdminUser,
    DefaultMeta<T, K>,
    DefaultExcludedFields<T>
  >, // event
  {} as SnapshotConfig<any>, // snapshotConfig
  { Authorization: "Bearer token" } // optional headers
);

export interface SnapshotStoreConfig<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> extends
  SnapshotStoreOptions<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  SnapshotConfiguration<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  SnapshotErrorHandling<T, K, Meta>,
  SnapshotSubscriberManagement<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  SharedIdentifiers<T, K>,
  Partial<SnapshotCore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
  Partial<SnapshotStoreCore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> {
  forEach<U extends BaseDataEntity, V extends U = U, M extends DefaultMeta<U, V> = DefaultMeta<U, V>, A extends Attachment = Attachment, E extends keyof U = DefaultExcludedFields<U>, I extends keyof U = keyof U>(
    callback: (
      item: SnapshotStoreConfig<U, V, M, A, E, I>,
      index: number,
      array: SnapshotStoreConfig<U, V, M, A, E, I>[]
    ) => void,
    // Optional configuration for the iteration
    options?: {
      includeInactive?: boolean;
      filterByCategory?: string;
      limit?: number;
    }
  ): void;

    /**
   * Retrieve an existing snapshot by ID, or create a new one if not found.
   */
  getOrCreateSnapshot?: (
    id: string,
    baseData: T,
    storeProps: SnapshotStoreProps<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ) => Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>;

  // Additional array-like methods for consistency
  map< U extends BaseDataEntity, V extends U = U, M extends DefaultMeta<U, V> = DefaultMeta<U, V>, A extends Attachment = Attachment, E extends keyof U = DefaultExcludedFields<U>, I extends keyof U = keyof U, R = any>(
    callback: (
      item: SnapshotStoreConfig<U, V, M, A, E, I>,
      index: number,
      array: SnapshotStoreConfig<U, V, M, A, E, I>[]
    ) => R,
    options?: {
      parallel?: boolean;
      batchSize?: number;
    }
  ): R[];

  filter< U extends BaseDataEntity, V extends U = U, M extends DefaultMeta<U, V> = DefaultMeta<U, V>, A extends Attachment = Attachment, E extends keyof U = DefaultExcludedFields<U>, I extends keyof U = keyof U>(
    predicate: (
      item: SnapshotStoreConfig<U, V, M, A, E, I>,
      index: number,
      array: SnapshotStoreConfig<U, V, M, A, E, I>[]
    ) => boolean
  ): SnapshotStoreConfig<U, V, M, A, E, I>[];

  snapshotManager?: SnapshotManager<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  snapshotContainer?: SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null;
  mappedData?: Map<string, any>;
  maxSnapshots: number;
  retentionPeriod: number;
  defaultCategory?: Category;

  defaultMetadata?: Partial<Meta>;

  validationRules: ValidationRule[];
  payload?: Payload,
  snapshotStoreData?: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  getSnapshotManager: () => SnapshotManager<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  logging?: boolean;
  autoSync?: boolean;
  lastUpdated?: Date | VersionHistory<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  find(arg0: (
    snapshotId: string,
    config: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ) => boolean): unknown;
  callback: (data: T) => void;
  multipleCallbacks: MultipleEventsCallbacks<T>;

  storeId: number
  name?: string;
  isCore: boolean;
  configId: string
  options?: SnapshotStoreOptions<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  operation: SnapshotOperation<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  title?: string;
  description?: string | null;
  data: Data<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null | undefined
  createdAt?: string | Date | undefined
  updatedAt?: string | Date | undefined

  baseData?: BaseData<any> | undefined;
  meta: StructuredMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  autoSave: boolean,
  syncInterval: number, // Sync every 5 minutes
  snapshotLimit: number,   // Keep a maximum of 100 snapshots
  additionalSetting: string,

  timestamp?: string | number | Date | undefined;
  createdBy: string | undefined;
  snapshotId: string | number | undefined;
  currentCategory?: Category;
  createSnapshotStore?: (
    id: string,
    currentSnapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshotId: string,
    storeId: number,
    data: Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
    events: Record<string, CalendarManagerStoreClass<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>,
    dataItems: RealtimeDataItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
    newData: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    payload: ConfigureSnapshotStorePayload<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    store: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    categoryProperties: CategoryProperties | undefined,
    callback: (createdStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void,
    category?: Category,
    snapshotDataConfig?: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] // Array of SnapshotStoreConfig objects
  ) => Promise<SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null>

  taskIdToAssign?: string;
  clearSnapshots?: (() => void) | (() => Promise<void>);
  key?: string;
  topic?: string;
  dataStoreMethods: Partial<DataStoreWithSnapshotMethods<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,> | undefined; // Match the type to the base interface
  category: Category
  criteria?: CriteriaType
  length?: number
  content: string | Content<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined;
  privacy?: PrivacySettings;
  snapshotConfig?: UserConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>["snapshotConfig"];
  userConfig?: UserConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  snapshotCategory?: SnapshotCategory<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  snapshotContent: string | Content<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined;
  store?: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null;
  snapshots: SnapshotsArray<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  delegate: InitializedDelegate<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null
  delegateSearch?: SnapshotWithCriteria<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] | null;
  getParentId(id: string, snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): string | null;
  getChildIds(childSnapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): string[];

  set?: (data: T | Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>, type: string, event: Event) => void | null;
  setStore?: (data: T | Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>, type: string, event: Event) => void | null

  state: any;
  getSnapshotById: (
    snapshot: (
      id: string
    ) => Promise<{
      category: Category
      timestamp: string | number | Date | undefined;
      id: string | number | undefined;
      snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
      snapshotStore: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
      data: T;
    }> | undefined,
    snapshotId: string,
    snapshotContainer: SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    criteria: CriteriaType, // Adjust the type as needed
    storeId: number
  ) => Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null>
  onInitialize?: () => void;
  setSnapshotData(data: SnapshotDataType<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    subscribers: SubscriberCollection<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]): void;
  handleSnapshot: (
    id: string | number,
    snapshotId: string | null,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null,
    snapshotData: T,
    category?: Category,
    callback: (snapshot: T) => void,
    snapshots: SnapshotsArray<any>,
    type: string,
    event: SnapshotEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshotContainer?: T,
    snapshotStoreConfig?: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null,
  ) => Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null>
  getSnapshotId: (data: SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => Promise<string>;
  fetchSnapshotData: (endpoint: string, id: string | number) => SnapshotDataType<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>; // Adjust the return type as necessary
  snapshot: (
    id: string | number | undefined,
    snapshotId: string | null,
    snapshotData: SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null, // Change here
    category?: Category,
    categoryProperties: CategoryProperties | undefined,
    callback: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null) => void,
    dataStore: DataStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    dataStoreMethods: DataStoreMethods<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    metadata: UnifiedMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    subscriberId: string, // Add subscriberId here
    endpointCategory: string | number,// Add endpointCategory here
    storeProps: SnapshotStoreProps<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    subscription?: Subscription<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshotConfigData?: SnapshotConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshotStoreConfigData?: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshotContainer?: SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  ) => Promise<{
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null,
    snapshotData: SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  }> | null;

  actions?: {
    takeSnapshot: (
      snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      data: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
    ) => Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>;

    updateSnapshot: (
      snapshotId: string | number | null,
      snapshotIdOrParams: string | number | null | UpdateSnapshotParams<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
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
      store?: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      callback?: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void,
      snapshotManager?: SnapshotManager<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    ) => Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>;

    mapSnapshots: (
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
        data: K,
        index: number,
        category?: Category,
      ) => SnapshotsObject<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      category?: Category,
    ) => Promise<SnapshotsArray<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>;

    deleteSnapshot: (
      snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      data: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
    ) => Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>;

    updateSnapshotStore: (
      snapshotStore: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      data: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
    ) => Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>;

    deleteSnapshotStore: (
      snapshotStore: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      data: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
    ) => Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>

  };

  setSnapshot?: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;
  setSnapshotStore?: (snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;

  configureSnapshotStore: (
    currentSnapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, //
    snapshotId: string,
    data: Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
    events: Record<string, CalendarManagerStoreClass<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>,
    dataItems: RealtimeDataItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
    newSnapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, // raw snapshot to apply
    payload: ConfigureSnapshotStorePayload<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    store: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,  // just one
    callback?: (
      store: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void
  ) => Promise<{
    currentSnapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    storeConfig: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    updatedStore?: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  }>


  createSnapshotSuccess: (
    snapshotId: string,
    snapshotManager: SnapshotManager<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    payload: { error: Error; }
  ) => Promise<void>;

  createSnapshotFailure: (
    snapshotId: string,
    snapshotManager: SnapshotManager<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    payload: { error: Error }
  ) => Promise<void>;

  batchTakeSnapshot: (
    snapshotId: string,
    snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ) => Promise<{
    snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  }>;

  onSnapshot: (
    snapshotId: string,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    type: string,
    event: SnapshotEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    callback: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void
  ) => void;

  onSnapshots: (
    (snapshotId: string,
      snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      type: string, event: SnapshotEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      callback: (snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void
    ) => Promise<void>
  ) | null;

  onSnapshotStore: (
    snapshotId: string,
    snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    type: string, event: SnapshotEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    callback: (snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
    ) => void
  ) => void | undefined;

  snapshotData: SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null

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
    store?: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  ) => Promise<SnapshotDataType<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,>

  mapSnapshot: (snapshotId: string,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    type: string,
    event: Event
  ) => Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined

  displayToast: (
    message: string,
    type: string,
    duration: number,
    onClose: () => void
  ) => Promise<void> | null

  addToSnapshotStoreList: (
    snapshotStore: SnapshotStore<any, any>,
    subscribers: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]
  ) => void | null

  fetchInitialSnapshotData: (
    snapshotId: string,
    snapshotData: SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshotConfig: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    category?: Category,
    callback: (snapshotStore: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>
  ) => Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>;

  updateSnapshot: (
    snapshotId: string | number | null,
    snapshotIdOrParams: string | number | null | UpdateSnapshotParams<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    // oldSnapshot: Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>,
    data?: Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
    newData?: Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>,
    timestamp?: Date,
    category?: Category,
    events?: Record<string, CalendarManagerStoreClass<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>,
    snapshotStore?: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    dataItems?: RealtimeDataItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
    payloadData?: T | K,
    mappedSnapshotData?: Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
    delegate?: SnapshotWithCriteria<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
    payload?: UpdateSnapshotPayload<T>,
    store?: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    callback?: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void,
    snapshotManager?: SnapshotManager<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  ) => Promise<{ snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> }>;

  getSnapshots: (
    snapshots: SnapshotsArray<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    category?: Category,
  ) => Promise<{
    snapshots: SnapshotsArray<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  }>;

  mergeSnapshots: (snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, category: string) => void;

  getSnapshotItems: (
    snapshots: SnapshotsArray<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    category?: Category, 
    snapshotId?: string,            // Keep if you need to filter by specific ID
    callback?: (items: SnapshotItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]) => void, // Keep for async operations
  ) => Promise<{ snapshots: SnapshotItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] }>

  takeSnapshot: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => Promise<{
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  }>;

  takeSnapshotStore: (snapshotStore: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => Promise<{
    snapshotStore: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  }>;

  // addSnapshot: (snapshot: T, subscribers: SubscriberCollection<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;

  addSnapshotSuccess: (
    snapshot: T,
    subscribers: SubscriberCollection<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  ) => void    

  clearSnapshotSuccess: (context: SnapshotContextType<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;

  removeSnapshot: (snapshotToRemove: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;

  getSubscribers: (
    subscribers: SubscriberCollection<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ) => Promise<{
    subscribers: SubscriberCollection<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
    snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  }>;

  addSubscriber: (
    subscriber: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    data: T,
    snapshotConfig: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
    delegate: SnapshotStoreSubset<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    sendNotification: (type: NotificationTypeEnum) => void
  ) => void;

    // Error callbacks
  onSnapshotError?: (error: Error, context: SnapshotContextType<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;
  onClearError?: (error: Error, context: SnapshotContextType<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;
  
  validateSnapshot: (data: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => boolean;
  
  beforeSnapshotCreate?: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => boolean;
  afterSnapshotCreate?: (context: SnapshotContextType<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;

  getSnapshot(
    snapshot: (
      id: string
    ) =>
      | Promise<{
        category: any;
        timestamp: any;
        id: any;
        snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
        data: T;
      }>
      | undefined
  ): Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>;
  // Method to get a snapshot container using a snapshotFetcher

  getSnapshotContainer: (
    snapshotFetcher: (
      id: string | number
    ) => Promise<{
      id: string;
      category: string;
      timestamp: string;
      snapshotStore: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
      snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
      snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
      subscribers: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
      data: Data<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null | undefined;
      newData: InitializedData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null | undefined;
      unsubscribe: () => void;
      addSnapshotFailure: (
        date: Date,
        snapshotManager: SnapshotManager<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
        snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
        payload: { error: Error; }
      ) => void;
      deleteSnapshot: (id: string) => void;

      createSnapshotSuccess: (
        snapshotId: string | number | null,
        snapshotManager: SnapshotManager<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
        snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, payload?: { data?: any; } | undefined
      ) => void;

      createSnapshotFailure: (
        date: Date,
        snapshotId: string,
        snapshotManager: SnapshotManager<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
        snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
        payload: { error: Error; }

      ) => void;
      updateSnapshotSuccess: (
        snapshotId: string | number | null,
        snapshotManager: SnapshotManager<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
        snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
        payload?: { data?: any; } | undefined
      ) => void;

      batchUpdateSnapshotsSuccess: (subscribers: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
        snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;
      batchUpdateSnapshotsFailure: (
        date: Date,
        snapshotId: string | number | null,
        snapshotManager: SnapshotManager<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
        snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
        payload: { error: Error; }
      ) => void;
      batchUpdateSnapshotsRequest: (
        snapshotData: (subscribers: SubscriberCollection<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => Promise<{
          subscribers: SubscriberCollection<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
          snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
        }>,
        snapshotManager: SnapshotManager<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      ) => Promise<void>;

      createSnapshots: (snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;
      batchTakeSnapshot: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;
      batchTakeSnapshotsRequest: (snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;
      batchFetchSnapshots: (criteria: any) => Promise<Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>;
      batchFetchSnapshotsSuccess: (snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;
      batchFetchSnapshotsFailure: (snapshotManager: SnapshotManager<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, payload: { error: Error; }) => void;
      filterSnapshotsByStatus: (status: string) => Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;

      filterSnapshotsByCategory: (category: string) => Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
      filterSnapshotsByTag: (tag: string) => Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
      fetchSnapshot: (id: string) => Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>;

      getSnapshotData: (id: string) => T;
      setSnapshotCategory: (id: string, category: string) => void;
      getSnapshotCategory: (id: string) => string;
      getSnapshots: (criteria: any) => Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
      getAllSnapshots: () => Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
      addData: (id: string, data: T) => void;
      setData: (id: string, data: T) => void;
      getData: (id: string) => T;

      dataItems: () => T[];
      getStore: (id: string) => Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
      addStore: (store: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;
      removeStore: (id: string) => void;
      stores: () => Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
      configureSnapshotStore?: (config: {
        currentSnapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
        snapshotId: string;
        data: Map<string, Snapshot<T, any>>;
        events: Record<string, CalendarEvent<SnapshotWithCriteria<T, K>, SnapshotWithCriteria<T, K>, Meta, ExcludedFields>[]>;
        dataItems: RealtimeDataItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
        newData: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
        payload: ConfigureSnapshotStorePayload<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
        store: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
      }) => void;

      onSnapshot: (callback: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void) => void;
      onSnapshots: (callback: (snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void) => void;
      events: Record<string, CalendarManagerStoreClass<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>, // Added prop

      notify: (message: string) => void;
      notifySubscribers: (message: string,
        subscribers: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
        data: Partial<SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>
      ) => Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]


      parentId: string;
      childIds?: K[];
      getParentId: (id: string) => string;
      getChildIds: (id: string) => string[];
      addChild: (parentId: string, childId: string) => void;
      removeChild: (parentId: string, childId: string) => void;
      getChildren: (id: string) => string[];
      hasChildren: (id: string) => boolean;
      isDescendantOf: (childId: string, parentId: string) => boolean;

      generateId: () => string;
      compareSnapshots: (snap1: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, snap2: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => number;
      compareSnapshotItems: (item1: T, item2: T) => number;
      mapSnapshot: (snap: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, mapFn: (item: T) => T) => Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
      compareSnapshotState: (state1: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null, state2: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => boolean;

      getConfigOption: (key: string) => any;
      getTimestamp: () => string;
      getInitialState: () => any;
      getStores: () => Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
      getSnapshotId: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => Promise<string>;
      handleSnapshotSuccess: (message: string) => void;
    }> | undefined
  ) => Promise<SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,>;


  getSnapshotVersions: (
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshotId: string,
    snapshotData: SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    versionHistory: VersionHistory<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ) => Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> | null;

  fetchData: (
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshotId: string,
    snapshotData: SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshotConfig: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    callback: (snapshotStore: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>
  ) => Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>;

  versionedSnapshot: (
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshotId: string,
    snapshotData: SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshotConfig: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    callback: (snapshotStore: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
    versionHistory: VersionHistory<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ) => Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>;

  // Function to map snapshots (adjusted to return a list of snapshots or similar)
  mapSnapshots: (
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
      data: K,
      index: number,
      category?: Category,
    ) => SnapshotsObject<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    category?: Category,
  ) => Promise<SnapshotsArray<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>;


  getAllSnapshots: (
    storeId: number,
    snapshotId: string,
    snapshotData: T,
    timestamp: string,
    type: string,
    event: SnapshotEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    id: number,
    snapshotStore: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    categoryProperties: CategoryProperties | undefined,
    dataStoreMethods: DataStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    data: T,
    dataCallback?: (
      subscribers: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
      snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
    ) => Promise<SnapshotUnion<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>,
    category?: Category, 
  ) => Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>

  getSnapshotStoreData: (
    snapshotStore: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshotId: string,
    snapshotData: SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  ) => Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>;

  takeSnapshotSuccess: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;
  updateSnapshotFailure: (payload: { error: string }) => void;
  takeSnapshotsSuccess: (snapshots: T[]) => void;
  fetchSnapshot: (
    id: string,
    timestamp: Date,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    data: T,
    delegate: SnapshotWithCriteria<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] | null,
    category?: Category,
  ) => Promise<{
    id: any;
    category: Category;
    timestamp: any;
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
    data: T;
    delegate: SnapshotWithCriteria<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] | null;
  }>;

  addSnapshotToStore: (
    storeId: number,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshotStore: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshotStoreData: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    subscribers: Subscriber<T>[],
    category?: Category
  ) => void;

  getSnapshotSuccess: (
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    subscribers: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]
  ) => Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>;


  setSnapshotSuccess: (
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    subscribers: SubscriberCollection<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  ) => void;
  setSnapshotFailure: (error: any) => void;
  updateSnapshotSuccess: (
    snapshotId: string,
    snapshotManager: SnapshotManager<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    payload: { error: Error; }
  ) => void | null

  updateSnapshotsSuccess: (
    snapshotData: (
      subscribers: SubscriberCollection<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      snapshot: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
    ) => void
  ) => void;
  fetchSnapshotSuccess: (
    snapshotId: string,
    snapshotStore: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    payload: FetchSnapshotPayload<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    data: T,
    snapshotData: (
      snapshotManager: SnapshotManager<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      subscribers: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
      snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
    ) => void,
  ) => void;

  updateSnapshotForSubscriber: (
    subscriber: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ) => Promise<{
    subscribers: SubscriberCollection<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
    snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  }>;

  updateMainSnapshots: (snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => Promise<Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>;

  batchProcessSnapshots: (
    subscribers: SubscriberCollection<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ) => Promise<{ snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> }[]>;

  batchUpdateSnapshots: (
    subscribers: SubscriberCollection<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ) => Promise<{ snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> }[]>;

  batchFetchSnapshotsRequest: (snapshotData: {
    subscribers: SubscriberCollection<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
    snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  }) => Promise<{
    subscribers: SubscriberCollection<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
    snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  }>;

  batchTakeSnapshotsRequest: (snapshotData: any) => Promise<{
    snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  }>;

  batchUpdateSnapshotsSuccess: (
    subscribers: SubscriberCollection<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ) => {
    snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  }[];


  batchUpdateSnapshotsRequest: (
    snapshotData: (
      subscribers: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]
    ) => Promise<{
      subscribers: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
      snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
    }>
  ) => {
    subscribers: SubscriberCollection<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
    snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  };

  batchFetchSnapshots: (
    criteria: CriteriaType, // Added to match SnapshotMethods
    snapshotData: (
      snapshotIds: string[],
      subscribers: SubscriberCollection<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
    ) => Promise<{
      subscribers: SubscriberCollection<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
      snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>; // Include snapshots here for consistency
    }>
  ) => Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>;

  getData: (id: string | number, data: Snapshot<CustomSnapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> | SnapshotStore<CustomSnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,>) => Promise<{
    id: string | number, data: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  }>;

  batchFetchSnapshotsSuccess: (
    subscribers: SubscriberCollection<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ) => Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;

  batchFetchSnapshotsFailure: (payload: { error: Error }) => void;
  batchUpdateSnapshotsFailure: (payload: { error: Error }) => void;

  [Symbol.iterator]: () => IterableIterator<T>;
  [Symbol.asyncIterator]: () => AsyncIterableIterator<T>;

  getCategory: (
    snapshotId: string,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    type: string,
    event: SnapshotEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshotConfig: SnapshotConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    category?: Category,
    additionalHeaders?: Record<string, string>
  ) => Promise<{
    categoryProperties?: CategoryProperties;
    snapshots: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]
  }>;

  expirationDate?: Date;
  isExpired?: (() => boolean) | undefined;
  priority?: AllStatus;
  tags?: string[] | TagsRecord<T> | undefined;
  metadata?: UnifiedMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | {}
  status?: StatusType | undefined
  isCompressed?: boolean;
  compress?: () => void;
  isEncrypted?: boolean;
  encrypt?: () => void;
  decrypt?: () => void;
  ownerId?: string;
  getOwner?: () => string;
  version?: string | Version<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  schema: string | Record<string, SchemaField>; // Schema definition
  previousVersionId?: string;
  nextVersionId?: string;
  auditTrail?: AuditRecord[];
  addAuditRecord?: (record: AuditRecord) => void;
  retentionPolicy?: RetentionPolicy;
  dependencies?: string[];
  useSimulatedDataSource: boolean;
  simulatedDataSource: SimulatedDataSource<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;

  updateSnapshots: () => void;
  updateSnapshotStore: (
    snapshotStore: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshotId: string,
    data: Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
    events: Record<string, CalendarManagerStoreClass<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>,
    dataItems: RealtimeDataItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
    newData: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    payload: ConfigureSnapshotStorePayload<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    store: SnapshotStore<any, K>,
    callback: (snapshotStore: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void
  ) => void

  updateSnapshotsFailure: (error: Payload) => void;

  flatMap: <U>(
    callback: (
      snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      index: number,
      array: (Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>)[]) => U
  ) => U[] | void;

  setData: (id: string, data: Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>) => void;
  getState: () => any;
  setState: (state: any) => void;
  handleActions: (action: any) => void;
  setSnapshots: (snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;
  reduceSnapshots: <U>(callback: (acc: U, snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => U, initialValue: U) => U;
  sortSnapshots: (compareFn: (a: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, b: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => number) => void;
  filterSnapshots: (predicate: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => boolean) => Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  findSnapshot: (predicate: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => boolean) => Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined;

  fetchSnapshotFailure: (
    snapshotManager: SnapshotManager<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    payload: { error: Error }
  ) => void;
  generateId: (prefix: string,
    name: string,
    type: NotificationType,
    id?: string,
    title?: string,
    chatThreadName?: string,
    chatMessageId?: string,
    chatThreadId?: string,
    dataDetails?: DataDetails<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    generatorType?: string) => string;
  [Symbol.iterator]: () => IterableIterator<T>;
  [Symbol.asyncIterator]: () => AsyncIterableIterator<T>;

  // Add the new SnapshotSubscriberManagement interface here
  subscriberManagement?: SnapshotSubscriberManagement<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
}

// const snapshotStoreConfigInstance: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null = null; // Or populate as needed

type InitializedConfig = SnapshotStoreConfig<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields> | SnapshotConfig<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields> | null

type ConstrainedSnapshotUnion<
  Base extends BaseDataEntity,
  Meta extends StructuredMetadata<Base, K>,
  K extends Base = Base
  > = SnapshotUnion<Base, K, Meta>;

const snapshotStoreConfigs: AppSnapshotStoreConfig[] = [
  {

    id: null,
    name: "configOption",
    color: "red",
    snapshotId: "snapshot1",
    key: "key1",
    priority: "active",
    topic: "topic1",
    status: StatusType.Inactive,
    category: "snapshotStoreConfig",
    timestamp: new Date(),
    state: null,
    snapshots: [],
    subscribers: [],
    subscription: null,
    initialState: null,
    clearSnapshots: undefined,
    isCompressed: false,
    expirationDate: new Date(),
    tags: {
      tag1: {
        id: "0292",
        name: "tag1",
        color: "red",
        attribs: {},
        relatedTags: []
      },
    },
    metadata: {
      description: "metadata description",
      structuredMetadata: {
        description: "description",
        metadataEntries: {},
        apiEndpoint: "",
        apiKey: "",
        timeout: 0,

        retryAttempts: 0,
        name: "",
      },
      budget: 0,
      status: "",
      teamMembers: [],
      tasks: [],

      apiEndpoint: "",
      apiKey: "",
      timeout: 0,

      retryAttempts: 0,
      name: "",
      startDate: new Date(),
      endDate: new Date(),

      milestones: [],
      videos: [],

      metadataEntries: {
        id: "0292",
        name: "metadata",
        color: "red",
        creator: "admin",
        environment: "production",
      }
    },
    configOption: {
      maxSnapshots: 100,
      retentionPeriod: 86400000,
      compression: false,
      encryption: false,
      id: '', // Unique identifier
      name: '', // Name of the snapshot configuration
      title: '', // Title for display
      description: '', // Description of the snapshot
      data: null, // Snapshot data
      timestamp: new Date(), // Timestamp of the snapshot
      createdBy: '', // User who created the snapshot
      snapshotId: '', // Snapshot ID
      snapshotStore: null, // Snapshot store reference
      taskIdToAssign: '', // Task ID for assignment
      clearSnapshots: () => { }, // Function to clear snapshots

      key: '', // Key for identification
      topic: '', // Topic related to the snapshot
      dataStoreMethods: {} as DataStore<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>, // Methods for data store
      category: '', // Category of the snapshot
      length: 0, // Length or count of snapshots
      content: '', // Content associated with the snapshot

      // Optional configurations and states
      configOption: null, // Optional configuration for additional settings
      subscription: null, // Subscription details
      initialConfig: null, // Initial configuration for the snapshot store
      config: {} as Promise<SnapshotStoreConfig<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields> | null>, // List of additional configurations

      snapshotConfig: [], // Configuration specific to snapshots
      snapshotCategory: {} as SnapshotCategory<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>, // Category for snapshots
      snapshotSubscriberId: null, // Subscriber ID for the snapshot
      snapshotContent: '', // Content of the snapshot
      store: null, // Snapshot store configuration
      snapshots: [], // Array of snapshots

      // Delegate functions and configurations
      delegate: [], // List of delegates or snapshot criteria
      snapshot: null, // Current snapshot (if applicable)
      meta: {
        // Meta information, if any
      },

      // Function to get the parent ID of a snapshot
      getParentId: (id: string, snapshot: Snapshot<SnapshotWithCriteria<DataWithParentAndChildIds<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>, AppK>, AppK>): string | null => {
        if (snapshot.data && typeof snapshot.data !== 'function') {
          // Type guard ensures that we're working with the expected SnapshotWithCriteria
          return (snapshot.data as DataWithParentAndChildIds<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>).parentId || null;
        }
        return null; // Return null if snapshot data is not of expected type
      },

      // Function to get child IDs of a snapshot
      getChildIds: (childSnapshot: Snapshot<SnapshotWithCriteria<DataWithParentAndChildIds<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>, AppK>, AppK>): string[] => {
        if (childSnapshot.data && typeof childSnapshot.data !== 'function') {
          // Type guard ensures that we're working with the expected SnapshotWithCriteria
          return (childSnapshot.data as DataWithParentAndChildIds<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>).childIds || [];
        }
        return []; // Return empty array if childSnapshot data is not of expected type
      },

      // Function to clear snapshot failure status
      clearSnapshotFailure: (): void => {
        // Implementation here
      },

      // Function to map snapshots (adjusted to return a list of snapshots or similar)
      mapSnapshots: async (
        storeIds: number[],
        snapshotId: string,
        categoryProperties: CategoryProperties | undefined,
        snapshot: Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>,
        timestamp: string | number | Date | undefined,
        type: string,
        event: SnapshotEvent<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>,
        id: number,
        snapshotStore: SnapshotStore<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>,
        data: BaseData,
        callback: (
          storeIds: number[],
          snapshotId: string,
          categoryProperties: CategoryProperties | undefined,
          snapshot: Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>,
          timestamp: string | number | Date | undefined,
          type: string,
          event: SnapshotEvent<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>,
          id: number,
          snapshotStore: SnapshotStore<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>,
          data: K,
          index: number,
          category?: Category,
        ) => SnapshotsObject<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>,
        category?: Category
      ): Promise<SnapshotsArray<AppEntity, AppK, AppMeta>> => {
        // Implementation here
        return [];
      },
      // Function to get snapshot ID createSnapshotStore: async (): Promise<void> => { }, // Function to create a snapshot store
      getSnapshotId: async (data: SnapshotData<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>): Promise<string> => (await snapshot.id?.toString() || ''),
      updateSnapshotStore: async (): Promise<void> => { },


      // configureSnapshot should be a top-level method, not nested in configOption
      configureSnapshot: async (
        id: string,
        storeId: number,
        snaphsotId: string,
        snapshotData: SnapshotData<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields> | undefined,
        dataStoreMethods: DataStore<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>,
        category?: Category,
        categoryProperties: CategoryProperties | undefined,
        callback?: (snapshot: Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>) => void,
        snapshotStore?: SnapshotStore<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>,
        snapshotStoreConfig?: SnapshotStoreConfig<T, K, StructuredMetadata<AppEntity, AppK>, never>
      ): Promise<SnapshotStore<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>> => {

        // Basic validation
        if (!snapshotData || !id) {
          throw new Error("Invalid snapshot data or ID.");
        }

        // Determine category name
        let categoryName: string;
        if (category && typeof category === "string") {
          categoryName = determineFileCategory(category);
        } else if (categoryProperties) {
          categoryName = categoryProperties.name;
        } else {
          categoryName = "default";
        }

        // Return a basic SnapshotStore - complex initialization should be handled elsewhere
        return {
          id: id,
          config: {
            id: id,
            name: `SnapshotStore-${id}`,
            category: categoryName,
            // ... other minimal config properties
          },
          // Add minimal required methods
          subscribe: () => () => { },
          unsubscribe: () => { },
          validate: () => true,
          serialize: () => JSON.stringify({}),
          // ... other required SnapshotStore methods
        } as unknown as SnapshotStore<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>;
      },

      // Other required methods for AppSnapshotStoreConfig
      createSnapshotStore: async (
        id: string,
        currentSnapshot: Snapshot<AppEntity, AppK, AppMeta, AppExcludedField>,
        snapshotId: string,
        storeId: number,
        data: Map<string, Snapshot<AppEntity, AppK, AppMeta, AppExcludedField>>,
        events: Record<string, CalendarManagerStoreClass<AppEntity, AppK, AppMeta, AppExcludedField>[]>,
        dataItems: RealtimeDataItem<AppEntity, AppK, AppMeta, AppExcludedField>[],
        newData: Snapshot<AppEntity, AppK, AppMeta, AppExcludedField>,
        payload: ConfigureSnapshotStorePayload<AppEntity, AppK, AppMeta, AppExcludedField>,
        store: SnapshotStore<AppEntity, AppK, AppMeta, AppExcludedField>,
        categoryProperties: CategoryProperties | undefined,
        callback: (createdStore: SnapshotStore<AppEntity, AppK, AppMeta, AppExcludedField>) => void,
        category?: Category,
        snapshotDataConfig?: SnapshotStoreConfig<AppEntity, AppK, AppMeta, AppExcludedField>[]
      ): SnapshotStore<AppEntity, AppK, AppMeta, AppExcludedFields, never> | null => { },

      configureSnapshotStore: (
        currentSnapshot: Snapshot<AppEntity, AppK, AppMeta, AppExcludedField>, // current snapshot
        snapshotId: string,
        data: Map<string, Snapshot<AppEntity, AppK, AppMeta, AppExcludedField>>,
        events: Record<string, CalendarManagerStoreClass<AppEntity, AppK, AppMeta, AppExcludedField>[]>,
        dataItems: RealtimeDataItem<AppEntity, AppK, AppMeta, AppExcludedField>[],
        newSnapshot: Snapshot<AppEntity, AppK, AppMeta, AppExcludedField>,
        payload: ConfigureSnapshotStorePayload<AppEntity, AppK, AppMeta, AppExcludedField>,
        store: SnapshotStore<AppEntity, AppK, AppMeta, AppExcludedField>,  // just one
        callback?: (
          store: SnapshotStore<AppEntity, AppK, AppMeta, AppExcludedField>) => void
      ): Promise<{
        currentSnapshotStore: SnapshotStore<AppEntity, AppK, AppMeta, AppExcludedField>;
        storeConfig: SnapshotStoreConfig<AppEntity, AppK, AppMeta, AppExcludedField>;
        updatedStore?: Snapshot<AppEntity, AppK, AppMeta, AppExcludedField> | undefined;

      }> => { }, // Function to configure a snapshot store
      createSnapshotSuccess: (): Promise<void> => { }, // Callback for successful snapshot creation
      createSnapshotFailure: (): Promise<void> => { }, // Callback for failed snapshot creation
      batchTakeSnapshot: async (): Promise<{
        snapshots: Snapshots<AppEntity, AppK, AppMeta, never>;
      }> => { }, // Function to batch take snapshots

      onSnapshot: () => { }, // Handler for snapshot events
      onSnapshotStore: () => { }, // Handler for snapshot store events
      snapshotData: {} as SnapshotData<AppEntity, AppK, AppMeta, never>, // Data related to the snapshot
      mapSnapshot: (): Snapshot<AppEntity, AppK, AppMeta, AppExcludedField> => { }, // Function to map snapshots

      createSnapshotStores: async (): Promise<void> => { }, // Function to create multiple snapshot stores
      initSnapshot: () => { }, // Function to initialize a snapshot
      subscribeToSnapshots: (): Snapshot<AppEntity, AppK, AppMeta, AppExcludedField> => { }, // Function to subscribe to snapshot updates
      clearSnapshot: () => { }, // Function to clear a snapshot

      clearSnapshotSuccess: () => { }, // Callback for successful snapshot clearing
      handleSnapshotOperation: (): Promise<Snapshot<BaseDataRoot, BaseDataRoot, AppMeta, never> | null> => { }, // Function to handle snapshot operations
      displayToast: (message: string, type: string, duration: number, onClose: () => void) => { }, // Function to display a toast notification
      addToSnapshotList: async ( // Function to add a snapshot to a list
        snapshot: AppSnapshot[],
        subscribers: AppSubscriber[],
        storeProps?: SnapshotStoreProps<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>
      ): Promise<AppSubscription[]> => {
        // Implementation using storeProps if provided
        const subscriptions: AppSubscription[] = [];

        for (const subscriber of subscribers) {
          const subscription: AppSubscription = {
            id: `sub-${Date.now()}`,
            snapshotId: snapshot.id,
            subscriberId: subscriber.id,
            createdAt: new Date(),
            status: 'active',
            storeId: storeProps?.storeId // Use storeProps if available
          };
          subscriptions.push(subscription);
        }

        return subscriptions;
      },

      addToSnapshotStoreList: (store: SnapshotStore<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>) => { }, // Function to add a store to the list
      fetchInitialSnapshotData: async (): Promise<void> => { }, // Function to fetch initial snapshot data
      updateSnapshot: async (snapshot: Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>) => { }, // Function to update a snapshot
      getSnapshots: async (): Promise<SnapshotsArray<BaseData>> => [], // Function to get all snapshots

      takeSnapshot: async (snapshot: Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>): Promise<void> => { }, // Function to take a snapshot
      takeSnapshotStore: async (): Promise<void> => { }, // Function to take a snapshot store
      addSnapshot: async (snapshot: Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>) => { }, // Function to add a snapshot
      addSnapshotSuccess: () => { }, // Callback for successful snapshot addition

      removeSnapshot: async (id: string) => { }, // Function to remove a snapshot
      getSubscribers: async (): Promise<Subscriber<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>[]> => [], // Function to get subscribers
      addSubscriber: (subscriber: Subscriber<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>) => { }, // Function to add a subscriber
      validateSnapshot: (snapshot: Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>) => { }, // Function to validate a snapshot
      getSnapshot: (id: string): Promise<Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields> | null> => {
        return new Promise<Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields> | null>(async (resolve, reject) => {
          try {
            // Assume there's some asynchronous operation to fetch the snapshot.
            const snapshotStore = await fetchSnapshotStoreData(id); // Replace with your actual fetch logic



            // Assuming you have a way to get a specific snapshot from the snapshotStore
            const snapshot = snapshotStore.getSnapshotsByPriority.getSnapshotById(id); // Replace this with actual logic to retrieve the snapshot

            if (snapshot) {
              resolve(snapshot); // Successfully retrieved the snapshot
            } else {
              resolve(null); // No snapshot found, resolve with null
            }
          } catch (error) {
            console.error('Error fetching snapshot:', error);
            reject(error); // Reject the promise with the error
          }
        });
      }, // Function to get a snapshot by ID

      getSnapshotContainer<K extends Data<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>>(
        id: string
      ): Promise<SnapshotContainer<SnapshotWithCriteria<Data<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>, K>, K> | null> {
        return new Promise(async (resolve, reject) => {
          try {
            // Type is now strong instead of `any`
            const snapshotStoreData = await fetchSnapshotStoreData<K>(id);

            if (snapshotStoreData) {
              const snapshotContainer: SnapshotContainer<
                SnapshotWithCriteria<Data<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>, K>,
                K
              > = {
                // Populate the necessary fields from snapshotStoreData
                id: snapshotStoreData.id,
                snapshots: snapshotStoreData.snapshots,
                criteria: snapshotStoreData.criteria,
                mappedSnapshotData: snapshotStoreData.mappedSnapshotData,
                initialConfig: snapshotStoreData.initialConfig,
                removeSubscriber: snapshotStoreData.removeSubscriber,
                onError: snapshotStoreData.onError,

                data: snapshotStoreData.data,
                currentCategory: snapshotStoreData.currentCategory,
                snapshotStore: snapshotStoreData.snapshotStore,
                createSnapshotData: snapshotStoreData.createSnapshotData,

                items: snapshotStoreData.items,
                config: snapshotStoreData.config,
                timestamp: snapshotStoreData.timestamp,
                find: snapshotStoreData.find,

                version: snapshotStoreData.version,
                setSnapshotCategory: snapshotStoreData.setSnapshotCategory,
                getSnapshotCategory: snapshotStoreData.getSnapshotCategory,
                storeId: snapshotStoreData.storeId,

                category: snapshotStoreData.category,
                validate: snapshotStoreData.validate,
                serialize: snapshotStoreData.serialize,
                get: snapshotStoreData.get,

                set: snapshotStoreData.set,
                processEvent: snapshotStoreData.processEvent,
                shared: snapshotStoreData.shared,
                operations: snapshotStoreData.operations,

                base: snapshotStoreData.base,
                sharedMetadata: snapshotStoreData.sharedMetadata,
                deleteSnapshot: snapshotStoreData.deleteSnapshot,
                core: snapshotStoreData.core,

                security: snapshotStoreData.security,
                storage: snapshotStoreData.storage,
                isExpired: snapshotStoreData.isExpired,
                childSnapshots: snapshotStoreData.childSnapshots,

                relatedSnapshots: snapshotStoreData.relatedSnapshots,
                addRelationship: snapshotStoreData.addRelationship,
                removeRelationship: snapshotStoreData.removeRelationship,
                getRelationship: snapshotStoreData.getRelationship,
                hasRelationship: snapshotStoreData.hasRelationship,

                // Add other necessary fields and transformations
              };

              resolve(snapshotContainer);
            } else {
              resolve(null); // No data found for the given id
            }
          } catch (error) {
            console.error('Error fetching snapshot container:', error);
            reject(error); // Reject the promise with the error
          }
        }
        );
      }, // Function to get snapshot container
      getSnapshotVersions: async (id: string): Promise<SnapshotVersion<AppEntity>[]> => [], // Function to get snapshot versions
      fetchData: async (): Promise<Data<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>[]> => [], // Function to fetch data

      snapshotMethods: [], // List of snapshot methods
      getAllSnapshots: async (): Promise<SnapshotsArray<BaseData>> => [], // Function to get all snapshots
      getSnapshotStoreData: async (): Promise<SnapshotStore<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>> => ({}) as SnapshotStore<SnapshotWithCriteria<Data<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>, any>, any>, // Function to get snapshot store data
      takeSnapshotSuccess: () => { }, // Callback for successful snapshot taking

      updateSnapshotFailure: () => { }, // Callback for failed snapshot update
      takeSnapshotsSuccess: () => { }, // Callback for successful snapshot taking
      fetchSnapshot: (
        id: string
      ): Promise<Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields> | null> => {
        return new Promise<Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields> | null>(async (resolve, reject) => {
          try {
            // Assume there's some asynchronous operation to fetch the snapshot.
            const snapshotStore = await fetchSnapshotStoreData(id); // Replace with your actual fetch logic

            if (snapshotStore) {
              const snapshot: Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields> = {
                id: snapshotStore.id,
                data: snapshotStore.data, // Assuming snapshotStore has a data property
                timestamp: snapshotStore.timestamp,
                snapshotStoreConfig: null,
                getSnapshotItems: snapshotStore.getSnapshotItems,
                defaultSubscribeToSnapshots: snapshotStore.defaultSubscribeToSnapshots,
                versionInfo: null,
                transformSubscriber: snapshotStore.transformSubscriber,
                transformDelegate: snapshotStore.transformDelegate,
                initializedState: undefined,
                getAllKeys: snapshotStore.getAllKeys,
                getAllItems: snapshotStore.getAllItems,
                addDataStatus: snapshotStore.addDataStatus,
                removeData: snapshotStore.removeData,
                updateData: snapshotStore.updateData,
                updateDataTitle: snapshotStore.updateDataTitle,
                updateDataDescription: snapshotStore.updateDataDescription,
                updateDataStatus: snapshotStore.updateDataStatus,
                addDataSuccess: snapshotStore.addDataSuccess,
                getDataVersions: snapshotStore.getDataVersions,
                updateDataVersions: snapshotStore.updateDataVersions,
                getBackendVersion: snapshotStore.getBackendVersion,
                getFrontendVersion: snapshotStore.getFrontendVersion,
                fetchData: snapshotStore.fetchData,
                defaultSubscribeToSnapshot: snapshotStore.defaultSubscribeToSnapshot,
                handleSubscribeToSnapshot: snapshotStore.handleSubscribeToSnapshot,
                removeItem: snapshotStore.removeItem,
                getSnapshot: snapshotStore.getSnapshot,
                getSnapshotSuccess: snapshotStore.getSnapshotSuccess,
                setItem: snapshotStore.setItem,
                getItem: snapshotStore.getItem,
                getDataStore: snapshotStore.getDataStore,
                getDataStoreMap: snapshotStore.getDataStoreMap,
                addSnapshotSuccess: snapshotStore.addSnapshotSuccess,
                deepCompare: snapshotStore.deepCompare,
                shallowCompare: snapshotStore.shallowCompare,
                getDataStoreMethods: snapshotStore.getDataStoreMethods,
                getDelegate: snapshotStore.getDelegate,
                determineCategory: snapshotStore.determineCategory,
                determinePrefix: snapshotStore.determinePrefix,
                removeSnapshot: snapshotStore.removeSnapshot,
                addSnapshotItem: snapshotStore.addSnapshotItem,
                addNestedStore: snapshotStore.addNestedStore,
                clearSnapshots: snapshotStore.clearSnapshots,
                addSnapshot: snapshotStore.addSnapshot,
                emit: snapshotStore.emit,
                createSnapshot: undefined,
                createInitSnapshot: snapshotStore.createInitSnapshot,
                setSnapshotSuccess: snapshotStore.setSnapshotSuccess,
                setSnapshotFailure: snapshotStore.setSnapshotFailure,
                updateSnapshots: snapshotStore.updateSnapshots,
                updateSnapshotsSuccess: snapshotStore.updateSnapshotsSuccess,
                updateSnapshotsFailure: snapshotStore.updateSnapshotsFailure,
                initSnapshot: snapshotStore.initSnapshot,
                takeSnapshot: snapshotStore.takeSnapshot,
                takeSnapshotSuccess: snapshotStore.takeSnapshotSuccess,
                takeSnapshotsSuccess: snapshotStore.takeSnapshotsSuccess,
                flatMap: snapshotStore.flatMap,
                getState: snapshotStore.getState,
                setState: snapshotStore.setState,
                validateSnapshot: snapshotStore.validateSnapshot,
                handleActions: snapshotStore.handleActions,
                setSnapshot: snapshotStore.setSnapshot,
                transformSnapshotConfig: snapshotStore.transformSnapshotConfig,
                setSnapshots: snapshotStore.setSnapshots,
                clearSnapshot: snapshotStore.clearSnapshot,
                mergeSnapshots: snapshotStore.mergeSnapshots,
                reduceSnapshots: snapshotStore.reduceSnapshots,
                sortSnapshots: snapshotStore.sortSnapshots,
                filterSnapshots: snapshotStore.filterSnapshots,
                findSnapshot: snapshotStore.findSnapshot,
                getSubscribers: snapshotStore.getSubscribers,
                notify: snapshotStore.notify,
                notifySubscribers: snapshotStore.notifySubscribers,
                getSnapshots: snapshotStore.getSnapshots,
                getAllSnapshots: snapshotStore.getAllSnapshots,
                generateId: snapshotStore.generateId,
                batchFetchSnapshots: snapshotStore.batchFetchSnapshots,
                batchTakeSnapshotsRequest: snapshotStore.batchTakeSnapshotsRequest,
                batchUpdateSnapshotsRequest: snapshotStore.batchUpdateSnapshotsRequest,
                filterSnapshotsByStatus: undefined,
                filterSnapshotsByCategory: undefined,
                filterSnapshotsByTag: undefined,
                batchFetchSnapshotsSuccess: snapshotStore.batchFetchSnapshotsSuccess,
                batchFetchSnapshotsFailure: snapshotStore.batchFetchSnapshotsFailure,
                batchUpdateSnapshotsSuccess: snapshotStore.batchUpdateSnapshotsSuccess,
                batchUpdateSnapshotsFailure: snapshotStore.batchUpdateSnapshotsFailure,
                batchTakeSnapshot: snapshotStore.batchTakeSnapshot,
                handleSnapshotSuccess: snapshotStore.handleSnapshotSuccess,
                getSnapshotId: snapshotStore.getSnapshotId,
                compareSnapshotState: snapshotStore.compareSnapshotState,
                eventRecords: null,
                snapshotStore: null,
                getParentId: snapshotStore.getParentId,
                getChildIds: snapshotStore.getChildIds,
                addChild: snapshotStore.addChild,
                removeChild: snapshotStore.removeChild,
                getChildren: snapshotStore.getChildren,
                hasChildren: snapshotStore.hasChildren,
                isDescendantOf: snapshotStore.isDescendantOf,
                dataItems: null,
                payload: undefined,
                newData: null,
                getInitialState: snapshotStore.getInitialState,
                getConfigOption: snapshotStore.getConfigOption,
                getTimestamp: snapshotStore.getTimestamp,
                getStores: snapshotStore.getStores,
                getData: snapshotStore.getData,
                setData: snapshotStore.setData,
                addData: snapshotStore.addData,
                stores: null,
                getStore: snapshotStore.getStore,
                addStore: snapshotStore.addStore,
                mapSnapshot: snapshotStore.mapSnapshot,
                mapSnapshots: snapshotStore.mapSnapshots,
                removeStore: snapshotStore.removeStore,
                subscribe: snapshotStore.subscribe,
                unsubscribe: snapshotStore.unsubscribe,
                fetchSnapshotFailure: snapshotStore.fetchSnapshotFailure,
                fetchSnapshot: snapshotStore.fetchSnapshot,
                addSnapshotFailure: snapshotStore.addSnapshotFailure,
                configureSnapshotStore: snapshotStore.configureSnapshotStore,
                fetchSnapshotSuccess: snapshotStore.fetchSnapshotSuccess,
                updateSnapshotFailure: snapshotStore.updateSnapshotFailure,
                updateSnapshotSuccess: snapshotStore.updateSnapshotSuccess,
                createSnapshotFailure: snapshotStore.createSnapshotFailure,
                createSnapshotSuccess: snapshotStore.createSnapshotSuccess,
                createSnapshots: snapshotStore.createSnapshots,
                onSnapshot: snapshotStore.onSnapshot,
                onSnapshots: snapshotStore.onSnapshots,
                updateSnapshot: snapshotStore.updateSnapshot,
                label: undefined,
                events: undefined,
                handleSnapshot: snapshotStore.handleSnapshot,
                subscribeToSnapshots: snapshotStore.subscribeToSnapshots,
                meta: undefined,
                subscribers: []
              };
              resolve(snapshot);
            } else {
              resolve(null); // Resolve with null if no snapshot is found
            }
          } catch (err) {
            console.error('Error fetching snapshot:', err);
            reject(err); // Reject the promise with the error
          }
        });
      },

      // Function to fetch a snapshot
      addSnapshotToStore: async (snapshot: Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>) => { }, // Function to add a snapshot to a store

      getSnapshotSuccess: () => { }, // Callback for successful snapshot retrieval
      setSnapshotSuccess: () => { }, // Callback for successful snapshot setting
      setSnapshotFailure: () => { }, // Callback for failed snapshot setting
      updateSnapshotSuccess: () => { }, // Callback for successful snapshot update

      updateSnapshotsSuccess: () => { }, // Callback for successful snapshot updates
      fetchSnapshotSuccess: () => { }, // Callback for successful snapshot fetch
      updateSnapshotForSubscriber: async (subscriberId: string) => { }, // Function to update snapshot for a subscriber
      updateMainSnapshots: async () => { }, // Function to update main snapshots

      batchProcessSnapshots: async (): Promise<void> => { }, // Function to batch process snapshots
      batchUpdateSnapshots: async (): Promise<void> => { }, // Function to batch update snapshots
      batchFetchSnapshotsRequest: async (): Promise<void> => { }, // Function to batch fetch snapshot requests

      batchTakeSnapshotsRequest: async (): Promise<void> => { }, // Function to batch take snapshot requests

      batchUpdateSnapshotsRequest: async (
        snapshotData: (
          subscribers: Subscriber<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>[]
        ) => Promise<{
          subscribers: Subscriber<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>[];
          snapshots: Snapshots<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>;
        }>
      ): Promise<void> => { }, // Function to batch update snapshot requests

      batchFetchSnapshots: async (): Promise<void> => { }, // Function to batch fetch snapshots
      getData: async (): Promise<Data<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>[]> => [], // Function to get data
      batchFetchSnapshotsSuccess: () => { }, // Callback for successful batch fetch snapshots
      batchFetchSnapshotsFailure: () => { }, // Callback for failed batch fetch snapshots

      batchUpdateSnapshotsFailure: () => { }, // Callback for failed batch update snapshots
      notifySubscribers: () => { }, // Function to notify subscribers
      notify: () => { }, // Function to notify with some logic
      getCategory: (id: string): CategoryProperties | null => null, // Function to get a category by ID
      expirationDate: undefined, // Date when the snapshot expires, if applicable

      isExpired(): boolean {
        if (!this.expirationDate) return false;
        return new Date() > this.expirationDate;
      },

      priority: "Normal", // Default priority level, adjust based on `AllStatus` enum

      tags: {}, // Tags for categorizing or labeling snapshots

      metadata: {}, // Metadata for additional context

      status: undefined, // Status of the snapshot

      isCompressed: false, // Whether the snapshot is compressed

      compress: () => {
        // Logic to compress the snapshot
      },

      isEncrypted: false, // Whether the snapshot is encrypted

      encrypt: () => {
        // Logic to encrypt the snapshot
      },

      decrypt: () => {
        // Logic to decrypt the snapshot
      },

      ownerId: '', // ID of the owner of the snapshot

      // Function to get owner ID
      getOwner(): string {
        return this.ownerId || '';
      },

      version: '', // Version of the snapshot

      previousVersionId: '', // ID of the previous version, if any

      nextVersionId: '', // ID of the next version, if any

      auditTrail: [] as AuditRecord[],// Audit records for changes to the snapshot

      addAuditRecord(record: AuditRecord) {
        this.auditTrail.push(record);
      },

      retentionPolicy: {}, // Policy for retaining the snapshot

      dependencies: [], // List of dependent snapshots or resources

      updateSnapshots: () => {
        // Logic to update snapshots
      },

      updateSnapshotsFailure: (error: Payload) => {
        // Handle failure in updating snapshots
      },

      flatMap<U>(
        this: { snapshots: any[] },
        callback: (
          snapshot: Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields> | SnapshotStoreConfig<SnapshotWithCriteria<BaseData, any>, Meta, BaseData>,
          index: number,
          array: (
            | Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>
            | SnapshotStoreConfig<SnapshotWithCriteria<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>, AppMeta, AppExcludedFields>
          )[]
        ) => U
      ): U[] {
        return this.snapshots.flatMap(callback);
      },

      setData: (data: BaseData) => {
        // Set data in the snapshot
      },

      getState(): any {
        // Retrieve current state
        return this.state;
      },

      setState(state: any) {
        // Set current state
        this.state = state;
      },

      handleActions: (action: any) => {
        // Handle actions related to the snapshot
      },

      setSnapshots(snapshots: Snapshots<BaseData>) {
        // Set snapshots
        this.snapshots = snapshots;
      },

      mergeSnapshots: async (snapshots: Snapshots<BaseData>, category: string) => {
        // Merge provided snapshots with current ones
      },

      reduceSnapshots<U>(
        callback: (acc: U,
          snapshot: Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>
        ) => U,
        initialValue: U
      ): U {
        // Reduce snapshots to a single value
        return (this.snapshots as any).reduce(callback, initialValue);
      },

      sortSnapshots: (compareFn: (a: Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>, b: Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>) => number) => {
        // Sort snapshots based on compare function
      },

      filterSnapshots(predicate: (snapshot: Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>) => boolean): Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>[] {
        // Filter snapshots based on predicate
        return (this.snapshots as any).filter(predicate);
      },

      findSnapshot(predicate: (snapshot: Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>) => boolean): Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields> | undefined {
        // Find a snapshot based on predicate
        return (this.snapshots as any).find(predicate);
      },

      subscribe: (
        snapshotId: string | number | null,
        unsubscribe: UnsubscribeDetails,
        subscriber: Subscriber<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields> | null,
        data: T,
        event: SnapshotEvent<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>,
        callback: Callback<SnapshotContext<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>>,
        value: T
      ) => {
        // Subscribe to snapshot changes
      },

      unsubscribe: (callback: (snapshot: Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>) => void) => {
        // Unsubscribe from snapshot changes
      },

      fetchSnapshotFailure: (payload: { error: Error }) => {
        // Handle failure in fetching snapshot
      },

      generateId: (): string => {
        // Generate a unique ID
        return 'unique-id'; // Replace with actual ID generation logic
      },

      useSimulatedDataSource: false, // Whether to use a simulated data source

      simulatedDataSource: {} as SimulatedDataSource<BaseDataRoot, BaseDataRoot, AppMeta, AppExcludedFields>, // List of simulated snapshot store configurations

      [Symbol.iterator]: function* (): IterableIterator<BaseData> {
        // Iterator for snapshots or data
        for (const snapshot of this.snapshots) {
          yield snapshot;
        }
      },

      [Symbol.asyncIterator]: async function* (): AsyncIterableIterator<BaseData> {
        // Async iterator for snapshots or data
        for (const snapshot of this.snapshots) {
          yield snapshot;
        }
      },
    },

    onSnapshots: null,
    set: (key: string, value: any) => {
      // Proper implementation that matches the interface
      console.log(`Setting key: ${key}, value: ${value}`);

      // Your logic here, but don't return anything
      // Or return undefined if needed
    },

    processEvent: (
      data: any,
      type: string,
      event: Event
    ) => {
      console.log(`Event type: ${type}`);
      console.log("Event:", event);
      return null;
    },

    handleSnapshot: (
      id: number,
      snapshotId: string | null,
      snapshot: Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields> | null,
      snapshotData: SnapshotData<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>,
      category?: Category,
      callback: (snapshot: Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>) => void,
      snapshots: SnapshotsArray<BaseData>,
      type: string,
      event: SnapshotEvent<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>,
      snapshotContainer?: Data<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>,
      snapshotStoreConfig?: SnapshotStoreConfig<SnapshotWithCriteria<Data<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>, K>, K>
    ): Promise<Snapshot<Data<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>, K> | null> => {
      return new Promise((resolve, reject) => {
        try {
          console.log(`Handling snapshot with ID: ${snapshotId}`, snapshot);
          console.log("Snapshot data:", snapshotData);
          console.log("Category:", category);
          console.log("Callback:", callback);
          console.log("Snapshots:", snapshots);
          console.log("Type:", type);
          console.log("Event:", event);
          console.log("Snapshot container:", snapshotContainer);
          console.log("Snapshot store config:", snapshotStoreConfig);

          // Example processing based on type
          let result: Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields> | null = null;

          const { criteria } = storeProps
          switch (type) {
            case 'create':
              // Create a new snapshot
              result = {
                ...snapshotData,
                isCore: false,
                currentCategory: category,
                criteria,
                createdBy: "",
                mappedSnapshotData: {} as Map<string, Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>>,
                initializedState: true,
                snapshotContainer,
                config: {} as Promise<SnapshotStoreConfig<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>>,
              } as Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>;
              break;
            case 'update':
              // Update an existing snapshot
              if (snapshot) {
                result = { ...snapshot, ...snapshotData } as Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>;
              }
              break;
            case 'process':
              // Process or transform the snapshot data
              if (snapshotContainer) {
                result = { ...snapshotContainer, ...snapshotData } as Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>;
              }
              break;
            default:
              throw new Error(`Unknown snapshot type: ${type}`);
          }

          if (result) {
            callback(result);
          }
          // Resolve with the result
          resolve(result);
        } catch (error) {
          // Handle any errors and reject the promise
          console.error("Error handling snapshot:", error);
          reject(error);
        }
      })
    },
    onInitialize: () => {
      console.log("Snapshot store initialized.");
    },
    onError: (error: any) => {
      console.error("Error in snapshot store:", error);
    },
    createSnapshot: (
      id,
      snapshotData,
      category,
      categoryProperties,
      callback,
      snapshotStore,
      snapshotStoreConfig,
      snapshotStoreConfigSearch
    ) => {
      let snapshot: Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields> | null = null;

      createSnapshot( // the async function
        snapshotData,
        new Map(),
        id,
        category,
        snapshotStore,
        null,
        snapshotStoreConfig || null,
        false
      ).then(result => {
        snapshot = result;
        if (callback && snapshot) callback(snapshot);
      }).catch(err => console.error(err));

      return snapshot; // This will initially be null, but type matches
    },
    events: {
      eventRecords: {
        add: [],
        remove: [],
        update: [],
      },
      callbacks: (
        snapshots: Snapshots<Data<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>>
      ) => {
        // Handle event callbacks
        console.log("Event callbacks:", snapshots);
      },
      subscribers: [],
      eventIds: [],
      on: (event: string, callback: (snapshot: Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>) => void) => {
        if (!eventHandlers[event]) {
          eventHandlers[event] = [];
        }
        eventHandlers[event].push(callback);
        console.log(`Event '${event}' registered.`);
      },
      off: (event: string, callback: (snapshot: Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>) => void) => {
        if (eventHandlers[event]) {
          eventHandlers[event] = eventHandlers[event].filter(cb => cb !== callback);
          console.log(`Event '${event}' unregistered.`);
        }
      }
    },
    getSnapshotId: (
      snapshotData: SnapshotData<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>,
    ) => {
      console.log("Getting snapshot ID");

      console.log("Snapshot data:", snapshotData);
      return null;
    },
    compareSnapshotState: (snapshot: Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>) => {
      console.log("Comparing snapshot state:", snapshot);
      return null;
    },
    eventRecords: {
      add: [],
      remove: [],
      update: [],
    },
    snapshotStore: null,

    subscribe: (
      snapshotId: string | number | null,
      unsubscribe: UnsubscribeDetails,
      subscriber: Subscriber<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields> | null,
      data: T,
      event: SnapshotEvent<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>,
      callback: Callback<SnapshotContext<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>>,
      value: T
    ): [] | SnapshotsArray<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields> => {
      console.log("Subscribed to snapshot:", subscriber, snapshot, event, callback, value);
      // Example usage of the callback
      if (callback) {
        callback(snapshot);
      }
    },
    unsubscribe: (callback: (snapshot: Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>) => void) => {
      console.log("Unsubscribed from snapshot:", callback);
    },
    fetchSnapshotFailure: (
      snapshotManager: SnapshotManager<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>,
      snapshot: Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>,
      payload: { error: Error }
    ) => {
      console.log("Fetching snapshot:", snapshot);
      console.error("Error fetching snapshot:", payload.error);
    },
    fetchSnapshotSuccess: (
      snapshotManager: SnapshotManager<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>,
      snapshot: Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>,
    ) => {
      console.log("Fetching snapshot:", snapshot);
    },

    updateSnapshot: (
      snapshotId: string | number | null,
      snapshotIdOrParams: string | number | null | UpdateSnapshotParams<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>,
      // oldSnapshot: Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>,
      data: Map<string, Snapshot<Data<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>, any>>,
      newData: Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>,
      timestamp: Date,
      category?: Category,
      events?: Record<string, CalendarManagerStoreClass<SnapshotWithCriteria<Data<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>, K>, K>[]>, // Added prop,
      snapshotStore?: Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>,
      dataItems?: RealtimeDataItem<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>[],
      payloadData?: T | K,
      mappedSnapshotData?: Map<string, Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>>,
      delegate?: SnapshotWithCriteria<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>[],
      payload?: UpdateSnapshotPayload<AppEntity>,
      store?: SnapshotStore<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>,
      callback?: (snapshot: Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>) => void,
    ) => {
      console.log("Updating snapshot:", newData);
    },

    updateSnapshotFailure: (
      snapshotManager: SnapshotManager<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>,
      snapshot: Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>,
      payload: { error: Error }
    ) => {
      console.log("Error in updating snapshot:", payload);
    },

    updateSnapshotSuccess: (snapshot: Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>) => {
      console.log("Updated snapshot:", snapshot);
    },

    updateSnapshotItem: (snapshotItem: SnapshotItem<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>) => {
      console.log("Updating snapshot item:", snapshotItem);
    },
    // other properties if any

    snapshotStore: {
      configureSnapshotStore: (
        snapshot: Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>,
        snapshotId: string,
        data: Map<string, Snapshot<Data<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>, any>>,
        events: Record<string, CalendarEvent<SnapshotWithCriteria<Data<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>, K>, K>[]>,
        dataItems: RealtimeDataItem<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>[],
        newData: Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>,
        payload: ConfigureSnapshotStorePayload<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>,
        store: SnapshotStore<T, K, DefaultMeta<any, K>, DefaultExcludedFields<any>>
      ) => {
        console.log("Configuring snapshot store:", store);

        // 1. Apply config options (from payload)
        if (payload.logging) {
          console.log(`[Store:${snapshotId}] Logging enabled.`);
          store.enableLogging?.();
        }

        if (payload.autoSync) {
          console.log(`[Store:${snapshotId}] Auto-sync enabled.`);
          store.enableAutoSync?.();
        }

        // 2. Seed the store with data
        if (data && data.size > 0) {
          data.forEach((snap, id) => {
            store.addSnapshot?.(id, snap);
          });
        }

        // 3. Register events/observers
        Object.entries(events).forEach(([eventType, eventList]) => {
          eventList.forEach(eventHandler => {
            store.subscribe?.(snapshotId, { eventType, handler: eventHandler });
          });
        });

        // 4. Optionally merge new incoming snapshot into store
        if (newData) {
          store.updateSnapshot?.(snapshotId, newData);
        }

        // 5. Return the configured store (if expected)
        return store;
      },

      updateSnapshotStore: (
        snapshot: Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>,
        snapshotId: string,
        data: Map<string, Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>>,
        events: Record<string, CalendarManagerStoreClass<SnapshotWithCriteria<Data<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>, AppK>, AppK>[]>,
        dataItems: RealtimeDataItem<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>[],
        newData: SnapshotStore<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>,
        payload: ConfigureSnapshotStorePayload<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>,
        store: SnapshotStore<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>,
        callback: (snapshotStore: SnapshotStore<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>) => void
      ): SnapshotStore<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields> => {
        console.log("Updating snapshot:", newData);
        callback(store);
        return store;
      },
    },
    createSnapshotStores(
      id: string,
      snapshotId: string,
      snapshot: Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>,
      snapshotStore: Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>,
      snapshotManager: SnapshotManager<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>,
      payload: CreateSnapshotStoresPayload<SnapshotWithCriteria<Data<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>, K>, K>,
      callback: (snapshotStore: Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>[]) => void | null,
      snapshotStoreData?: Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>[],
      category?: Category,
      snapshotDataConfig?: SnapshotStoreConfig<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>[]
    ): Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>[] | null {
      console.log(`Creating snapshot stores with ID: ${id} in category: ${String(category)}`, snapshotDataConfig);

      // Example logic to create snapshot stores
      const newSnapshotStores: Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>[] = snapshotStoreData ?? [];

      // Perform additional operations as required

      // Invoke callback if provided
      if (callback) {
        callback(newSnapshotStores);
      }

      // Return the array of SnapshotStore objects
      return newSnapshotStores.length > 0 ? newSnapshotStores : null;
    },

    // Alternate createSnapshotStores definition
    createSnapshotStoresAlternate: (
      id: string,
      snapshotStoresData: SnapshotStore<any, any>[], // Use Snapshot instead of Map
      category?: Category,
      callback: (snapshotStores: SnapshotStore<any, any>[]) => void,
      snapshotDataConfig?: SnapshotStoreConfig<any, any>[] // Adjust as per your definition
    ): SnapshotStore<any, any>[] | null => {
      console.log(`Creating snapshot with ID: ${id} in category: ${category}`, snapshotDataConfig);

      // Call the callback function with the snapshotStoresData
      callback(snapshotStoresData);

      // Return the array of SnapshotStore objects
      return snapshotStoresData;
    },


    createSnapshotStore: <
      T extends BaseDataEntity,
      K extends T = T,
      Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
      AttachmentType extends Attachment = Attachment,
      ExcludedFields extends keyof T = DefaultExcludedFields<T>,
      IncludedFields extends keyof T = keyof T
    >(
      id: string,
      currentSnapshot: Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>,
      snapshotId: string,
      storeId: number,
      data: Map<string, Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>>,
      events: Record<string, CalendarManagerStoreClass<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>[]>,
      dataItems: RealtimeDataItem<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>[],
      newData: Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>,
      payload: ConfigureSnapshotStorePayload<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>,
      store: SnapshotStore<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>,
      category?: Category,
      categoryProperties: CategoryProperties | undefined,
      callback: (snapshotStore: SnapshotStore<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>) => void,
      snapshotDataConfig?: SnapshotStoreConfig<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>[] // Array of SnapshotStoreConfig objects
    ): SnapshotStore<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields> | null => {
      console.log(
        `Creating snapshot with ID: ${snapshotId} in category: ${String(category)}`,
        snapshotDataConfig
      );

      const tags: TagsRecord = {
        "1": {
          id: "tag id",
          name: "tag name",
          color: "#000000",
          tag: "field",
          value: "value",
          relatedTags: []
        },
      };

      const portfolioUpdatesLastUpdated: PortfolioUpdatesLastUpdated = null; // Example initialization
      const snapshotStoreData = fetchSnapshotStoreData()
      // Return a SnapshotStore object
      return {
        id,
        category,
        state: snapshotStoreData, // This is an array of Snapshot objects
        snapshotId: snapshotId || 'defaultSnapshotId', // Provide a default value if snapshotId is undefined
        // snapshotManager: null, // Provide a default value if snapshotManager is undefined
        snapshotStoreConfig: snapshotDataConfig || undefined, // Provide a default value if snapshotStoreConfig is undefined
        findIndex: () => -1,
        splice: () => null,
        key: "snapshot store",
        keys: [],
        topic: "snapshot topic",
        date: new Date(),
        config: {} as Promise<SnapshotStoreConfig<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>>,
        title: "createSnapshotStore",
        message: "creating snapshot store",
        configOption: "default config option",
        subscription: {
          unsubscribe: () => { },
          portfolioUpdates: portfolioUpdates,
          tradeExecutions: tradeExections,
          marketUpdates: getMarketUpdates,
          triggerIncentives: triggerIncentives,
          communityEngagement: getCommunityEngagement,
          determineCategory: determineCategory,
          portfolioUpdatesLastUpdated: portfolioUpdatesLastUpdated,
        },
        description: "snapshot description",
        timestamp: new Date(),
        createdBy: "John Doe",
        eventRecords: {},
        type: "snapshot",
        subscribers: [],
        set: () => { },
        setStore: () => { },
        data: {} as T | Map<string, Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>> | null | undefined,
        store: {} as SnapshotStore<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>,
        stores: [],
        snapshots: [],
        expirationDate: new Date(),
        priority: undefined,
        tags: tags,
        metadata: undefined,
        meta: new Map<string, Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>>(),
        status: undefined,
        isCompressed: false,
        snapshotMethods: [],
        getSnapshotsBySubscriber: (subscriber: string): Promise<BaseDataEntity[]> => { },
        getSnapshotsBySubscriberSuccess: "",
        getSnapshotsByTopic: "",
        getSnapshotsByTopicSuccess: "",
        getSnapshotsByCategory: "",
        getSnapshotsByCategorySuccess: "",
        getSnapshotsByKey: "",
        getSnapshotsByKeySuccess: "",
        getSnapshotsByPriority: "",
        getSnapshotsByPrioritySuccess: "",
        getStoreData: "",
        updateStoreData: "",
        updateDelegate: "",
        getSnapshotContainer: "",
        getSnapshotVersions: "",
        createSnapshot: (
          id: string | number,
          snapshotData: SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
          category?: Category,
          categoryProperties?: CategoryProperties,
          callback?: (
            snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void
        ): Promise<{ snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> }> => { },
        deleteSnapshot: (id: string) => {

        },
        // other properties if any
      };
    },


    configureSnapshotStore: (
      snapshot: Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>,
      snapshotId: string,
      data: Map<string, Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>>,
      events: Record<string, CalendarManagerStoreClass<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>[]>,
      dataItems: RealtimeDataItem<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>[],
      newData: Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>,
      payload: ConfigureSnapshotStorePayload<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>,
      store: SnapshotStore<any, K>,
      callback: (snapshotStore: Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>) => void
    ): Promise<{
      snapshotStore: Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>,
      storeConfig: SnapshotStoreConfig<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>,
      updatedStore?: Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>
    }> => {
      console.log("Configuring snapshot store:", snapshotStore, "with ID:", snapshotId);
    },

    batchTakeSnapshot: async (
      snapshotStore: Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>,
      snapshots: Snapshots<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>
    ) => {
      console.log("Batch taking snapshots:", snapshotStore, snapshots);
      return { snapshots };
    },

    onSnapshot: (
      snapshotId: string,
      snapshot: Snapshot<any, any>,
      type: string, event: SnapshotEvent<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>,
      callback: (snapshot: Snapshot<any, any>

      ) => void) => {
      console.log("Snapshot taken:", snapshot, "Type:", type, "Event:", event);
    },

    initSnapshot: (
      snapshot: Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields> | Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields> | null,
      snapshotId: string | null,
      snapshotData: SnapshotData<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>,
      category?: Category,
      snapshotDataConfig: SnapshotStoreConfig<any, any>, // Adjust as per your definition
      callback: (snapshotStore: SnapshotStore<any, any>) => void
    ) => {
      console.log(
        `Initializing snapshot with ID: ${snapshotId} in category: ${category}`,
        snapshotDataConfig
      );
      return { snapshot };
    },

    clearSnapshot: () => {
      console.log("Clearing snapshot.");
    },

    updateSnapshot: async (
      snapshotId: string,
      snapshotIdOrParams: string | number | null | UpdateSnapshotParams<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>,
      data: Map<string, Snapshot<BaseData<any>, BaseData>>,
      newData: Partial<Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>>,
      events?: Record<string, CalendarManagerStoreClass<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>[]>,
      snapshotStore?: SnapshotStore<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>,
      dataItems?: RealtimeDataItem<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>[],
      payload?: UpdateSnapshotPayload<T>,
      store?: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      callback?: (snapshot: Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>) => void,
      snapshotManager?: SnapshotManager<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>,
    ) => {
      console.log(
        `Updating snapshot with ID: ${snapshotId}`,
        newData,
        payload
      );
      return { snapshot: newData };
    },
    getSnapshots: async (category: Category,
      snapshots: SnapshotsArray<Data<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>>,
    ) => {
      console.log(`Getting snapshots in category: ${category}`, snapshots);
      return { snapshots };
    },

    takeSnapshot: async (snapshot: Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>) => {
      console.log("Taking snapshot:", snapshot);
      return { snapshot: snapshot }; // Adjust according to your snapshot logic
    },

    // addSnapshot: (snapshot: Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>) => {
    //   console.log("Adding snapshot:", snapshot);
    // },

    getSubscribers: async (
      subscribers: SubscriberCollection<SnapshotWithCriteria<Data<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>, K>, K>,
      snapshots: Snapshots<BaseData>
    ) => {
      console.log("Getting subscribers:", subscribers, snapshots);
      return { subscribers, snapshots };
    },
    addSubscriber: (subscriber: Subscriber<BaseData, K>) => {
      console.log("Adding subscriber:", subscriber);
    },

    // Implementing the snapshot function
    snapshot: async (
      id: string | number | undefined,
      snapshotId: string | null,
      snapshotData: SnapshotData<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>,
      category?: Category,
      categoryProperties: CategoryProperties | undefined,
      callback: (snapshot: Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields> | null) => void,
      dataStore: DataStore<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>,
      dataStoreMethods: DataStoreMethods<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>,
      metadata: UnifiedMetadata<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>,
      subscriberId: string,
      endpointCategory: string | number,
      storeProps: SnapshotStoreProps<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>,
      subscription?: Subscription<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>,
      snapshotConfigData?: Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>,
      snapshotStoreConfigData?: SnapshotStoreConfig<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>,
      snapshotContainer?: SnapshotContainerType | null,

    ) => {
      try {
        let resolvedCategory: CategoryProperties | undefined;

        if (typeof category === "string") {
          resolvedCategory = await fetchCategoryByName(category);
        } else {
          resolvedCategory = category;
        }

        if (resolvedCategory) {
          snapshotConfig[0].createSnapshot(
            id,
            snapshotData,
            resolvedCategory,
            callback
          );

          const { snapshotStore: newSnapshot } =
            await snapshotConfig[0].snapshot(
              id,
              snapshotData,
              resolvedCategory,
              callback
            );

          return { snapshotStore: newSnapshot };
        } else {
          throw new Error("Category is undefined");
        }
      } catch (error) {
        console.error("Error creating snapshot:", error);
        throw error;
      }
    },

    setSnapshot: (snapshot: Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>) => {
      return Promise.resolve({ snapshot });
    },

    createSnapshotSuccess: (
      snapshotId: string,
      snapshotManager: SnapshotManager<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>,
      snapshot: Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>,
      payload: { error: Error; }
    ): Promise<void> => { },

    createSnapshotFailure: async (
      snapshotId: string,
      snapshotManager: SnapshotManager<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>,
      snapshot: Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>,
      payload: { error: Error }
    ) => {
      const snapshotStore: Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>[] = snapshotManager.state as Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>[];

      if (snapshotStore && snapshotStore.length > 0) {
        const generatedSnapshotId = generateSnapshotId; // Assuming generateSnapshotId returns a string

        const config = {} as Promise<SnapshotStoreConfig<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields> | null>; // Cast to expected type
        const configOption = {} as SnapshotStoreConfig<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>; // Cast to expected type
        // Example: Transforming snapshot.data (Map<string, BaseData>) to initialState (SnapshotStore<BaseData, K> | Snapshot<BaseData>)
        const initialState: Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields> = {
          id: generatedSnapshotId,
          key: "key",
          topic: "topic",
          date: new Date(),
          timestamp: new Date().getTime(),
          message: "message",
          category: "category",
          data: snapshot.data,
          configOption: configOption,
          config: config,
          subscription: {
            subscribers: [],
            unsubscribe: (unsubscribeDetails, callback: Callback<Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>> | null) => {
              // Define the unsubscribe logic here
              console.log("Unsubscribed:", unsubscribeDetails);
              if (callback) {
                callback(snapshot);
              }
            },
            portfolioUpdates: portfolioUpdates,
            tradeExecutions: getTradeExecutions,
            marketUpdates: getMarketUpdates,
            triggerIncentives: triggerIncentives,
            communityEngagement: getCommunityEngagement,
            portfolioUpdatesLastUpdated: {
              value: new Date(),
              isModified: false,
            } as ModifiedDate,
            determineCategory: determineCategory,
          },

          setSnapshotData(
            snapshotStore: Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>,
            data: Map<string, Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>>,
            subscribers: Subscriber<any, any>[],
            snapshotData: Partial<SnapshotStoreConfig<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>>,
            id?: string,
          ): Map<string, Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>> {
            const self = this as Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>;

            if (data) {
              const snapshot = data.get(id || ''); // Get the specific snapshot if `id` is provided

              if (snapshot) {
                // Update properties of the SnapshotStore
                if (snapshot.id) {
                  self.id = snapshot.id as string; // Ensure snapshot.id is of type string
                }
                if (snapshot.timestamp) {
                  self.timestamp = snapshot.timestamp;
                }
                if (snapshot.data) {
                  self.data = { ...self.data, ...snapshot.data };
                }

                // Define message properly (e.g., could be a string like "Snapshot updated")
                const message = "Snapshot updated";

                // Create a Partial<SnapshotStoreConfig<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>> from the snapshot
                const partialConfig: Partial<SnapshotStoreConfig<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>> = {
                  id: snapshot.id,
                  data: snapshot.data,
                };

                // Notify subscribers or trigger updates if necessary
                self.notifySubscribers(message, subscribers, partialConfig);
              }
            }

            // Return updated data
            return data;
          },

          title: "defaultTitle", // Example placeholder
          type: "defaultType", // Example placeholder
          subscribeToSnapshots: (
            snapshotId: string,
            callback: (snapshots: Snapshots<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>) => Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields> | null,
            snapshot: Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields> | null = null
          ) => { },
          snapshotId: "",
          createdBy: "",
          subscribers: [],
          set: undefined,
          state: null,
          store: null,
          snapshots: [],
          snapshotConfig: [],
          initialState: undefined,
          dataStore: undefined,
          dataStoreMethods: {} as DataStore<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>,
          delegate: [],
          subscriberId: "",
          length: 0,
          content: "",
          value: 0,
          todoSnapshotId: "",
          events: undefined,
          snapshotStore: null,
          dataItems: [],
          newData: undefined,
          subscribeToSnapshot: subscribeToSnapshotImpl,
          transformSubscriber: TransformMethods.transformSubscriber,
          transformDelegate: TransformMethods.transformDelegate,
          initializedState: undefined,
          getAllKeys: function (): Promise<string[]> {
            throw new Error("Function not implemented.");
          },
          getAllItems: function (): Promise<BaseData[]> {
            throw new Error("Function not implemented.");
          },
          addData: function (data: Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>): void {
            throw new Error("Function not implemented.");
          },
          addDataStatus: function (
            id: number,
            status: "completed" | "pending" | "inProgress"
          ): void {
            throw new Error("Function not implemented.");
          },
          removeData: function (id: number): void {
            throw new Error("Function not implemented.");
          },
          updateData: function (id: number, newData: BaseData): void {
            throw new Error("Function not implemented.");
          },
          updateDataTitle: function (id: number, title: string): void {
            throw new Error("Function not implemented.");
          },
          updateDataDescription: function (
            id: number,
            description: string
          ): void {
            throw new Error("Function not implemented.");
          },
          updateDataStatus: function (
            id: number,
            status: "completed" | "pending" | "inProgress"
          ): void {
            throw new Error("Function not implemented.");
          },
          addDataSuccess: function (payload: { data: BaseData[] }): void {
            throw new Error("Function not implemented.");
          },
          getDataVersions: function (
            id: number
          ): Promise<BaseData[] | undefined> {
            throw new Error("Function not implemented.");
          },
          updateDataVersions: function (
            id: number,
            versions: BaseData[]
          ): void {
            throw new Error("Function not implemented.");
          },
          getBackendVersion: function (): Promise<string | undefined> {
            throw new Error("Function not implemented.");
          },
          getFrontendVersion: function (): Promise<string | undefined> {
            throw new Error("Function not implemented.");
          },
          fetchData: function (
            id: number
          ): Promise<Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>[]> {
            throw new Error("Function not implemented.");
          },
          snapshot: undefined,
          removeItem: function (key: string): Promise<void> {
            throw new Error("Function not implemented.");
          },
          getSnapshot: function (
            snapshot: (id: string) =>
              | Promise<{
                snapshotId: number;
                snapshotData: T;
                category?: Category;
                categoryProperties: CategoryProperties;
                dataStoreMethods: DataStore<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>;
                timestamp: string | number | Date | undefined;
                id: string | number | undefined;
                snapshot: Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>;
                snapshotStore: Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>;
                data: T;
              }>
          ): Promise<Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>> {
            throw new Error("Function not implemented.");
          },
          getSnapshotSuccess: this.getSnapshotSuccess,
          getSnapshotId: function (
            key: SnapshotData<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>
          ): Promise<string | undefined> {
            const snapshot = this.getSnapshot(key);
            return snapshot.data.snapshotId;
          },
          getItem: function (key: string): Promise<BaseData | undefined> {
            throw new Error("Function not implemented.");
          },
          setItem: function (key: string, value: BaseData): Promise<void> {
            throw new Error("Function not implemented.");
          },
          addSnapshotFailure: function (date: Date, error: Error): void {
            throw new Error("Function not implemented.");
          },
          getDataStore: function (): Promise<InitializedDataStore<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>> {
            throw new Error("Function not implemented.");
          },
          getDataStoreMap: function (): Promise<Map<string, Promise<DataStore<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>[]>>> {
            throw new Error("Function not implemented.");
          },
          addSnapshotSuccess: function (
            snapshot: BaseData,
            subscribers: SubscriberCollection<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>
          ): void {
            throw new Error("Function not implemented.");
          },
          compareSnapshotState: function (
            stateA:
              | Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>
              | Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>[]
              | null
              | undefined,
            stateB: Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields> | null | undefined
          ): boolean {
            throw new Error("Function not implemented.");
          },
          deepCompare: function (objA: any, objB: any): boolean {
            throw new Error("Function not implemented.");
          },
          shallowCompare: function (objA: any, objB: any): boolean {
            throw new Error("Function not implemented.");
          },
          getDataStoreMethods: function () {
            throw new Error("Function not implemented.");
          },
          getDelegate: function (): SnapshotStoreConfig<SnapshotWithCriteria<BaseData, any>, Meta, BaseData>[] {
            throw new Error("Function not implemented.");
          },
          determineCategory: function (
            snapshot: Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields> | null | undefined
          ): string {
            throw new Error("Function not implemented.");
          },
          determinePrefix: function <T extends Data<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>>(
            snapshot: T | null | undefined,
            category: string
          ): string {
            throw new Error("Function not implemented.");
          },
          updateSnapshot: function (
            snapshotId: string,
            data: Map<string, BaseData>,
            events: Record<string, CalendarEvent<SnapshotWithCriteria<Data<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>, K>, K>[]>,
            snapshotStore: any,
            dataItems: RealtimeDataItem<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>[],
            newData: Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>,
            payload: UpdateSnapshotPayload<BaseData>,
            store: any
          ): Promise<{ snapshot: Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields> }> {
            throw new Error("Function not implemented.");
          },
          updateSnapshotSuccess: function (): void {
            throw new Error("Function not implemented.");
          },
          updateSnapshotFailure: function ({
            snapshotManager,
            snapshot,
            date,
            payload,
          }: {
            snapshotManager: SnapshotManager<any, any>;
            snapshot: Snapshot<any, any>;
            date: Date | undefined;
            payload: { error: Error; };
          }): void {
            throw new Error("Function not implemented.");
          },
          removeSnapshot: function (snapshotToRemove: any): void {
            throw new Error("Function not implemented.");
          },
          clearSnapshots: function (): void {
            throw new Error("Function not implemented.");
          },
          // addSnapshot: function (
          //   snapshot: Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>,
          //   subscribers: Subscriber<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>[]
          // ): Promise<void> {
          //   throw new Error("Function not implemented.");
          // },
          createSnapshot: function (
            id: string,
            snapshotData: SnapshotData<any, BaseData>,
            category: string
          ): Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields> {
            throw new Error("Function not implemented.");
          },
          createSnapshotSuccess: function (
            snapshot: Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>
          ): void {
            throw new Error("Function not implemented.");
          },
          setSnapshotSuccess: function (
            snapshotData: any,
            subscribers: ((data: Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>) => void)[]
          ): void {
            throw new Error("Function not implemented.");
          },
          setSnapshotFailure: function (error: Error): void {
            throw new Error("Function not implemented.");
          },
          createSnapshotFailure: function (
            snapshotId: string,
            snapshotManager: SnapshotManager<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>,
            snapshot: Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>,
            payload: { error: Error }
          ): void {
            throw new Error("Function not implemented.");
          },
          updateSnapshots: function (): void {
            throw new Error("Function not implemented.");
          },
          updateSnapshotsSuccess: function (
            snapshotData: (
              subscribers: Subscriber<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>[],
              snapshot: Snapshots<BaseData>
            ) => void
          ): void {
            throw new Error("Function not implemented.");
          },
          updateSnapshotsFailure: function (error: Payload): void {
            throw new Error("Function not implemented.");
          },
          initSnapshot: function (
            snapshotConfig: SnapshotStoreConfig<SnapshotWithCriteria<Data<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>, K>, K>,
            snapshotData: SnapshotData<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>
          ): void {
            throw new Error("Function not implemented.");
          },
          takeSnapshot: function (
            snapshot: Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>,
            subscribers: any[]
          ): Promise<{ snapshot: Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields> }> {
            throw new Error("Function not implemented.");
          },
          takeSnapshotSuccess: function (
            snapshot: Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>
          ): void {
            throw new Error("Function not implemented.");
          },
          takeSnapshotsSuccess: function (snapshots: BaseData[]): void {
            throw new Error("Function not implemented.");
          },

          configureSnapshotStore: function (
            snapshotStore: Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>,
            snapshotId: string,
            data: Map<string, Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>>,
            events: Record<string, CalendarManagerStoreClass<SnapshotWithCriteria<Data<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>, K>, K>[]>,
            dataItems: RealtimeDataItem<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>[],
            newData: Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>,
            payload: ConfigureSnapshotStorePayload<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>,
            store: SnapshotStore<any, K>,
            callback: (snapshotStore: Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>) => void
          ): void {
            throw new Error("Function not implemented.");
          },
          getData: function <T extends Data<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>>(
            data:
              | Snapshot<BaseData, K>
              | Snapshot<CustomSnapshotData<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>, K>
          ): Promise<{
            data: (
              | Snapshot<CustomSnapshotData<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>, K>
              | Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>
            )[]; // Implement logic to convert subscriber data to SnapshotStore instance
            // Implement logic to convert subscriber data to SnapshotStore instance
            getDelegate: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
          }> {
            throw new Error("Function not implemented.");
          },
          flatMap: function (
            snapshot: Snapshot<BaseData, K>,
            subscribers: Subscriber<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>[]
              | Subscriber<CustomSnapshotData<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>, any>[]
          ): Promise<{
            snapshot: Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>;
            subscribers: Subscriber<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>[];
          }> {
            throw new Error("Function not implemented.");
          },
          setData: function (data: BaseData): void {
            throw new Error("Function not implemented.");
          },
          getState: function () {
            throw new Error("Function not implemented.");
          },
          setState: function (state: any): void {
            throw new Error("Function not implemented.");
          },
          validateSnapshot: function (
            snapshotId: string,
            snapshot: Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>
          ): boolean {
            throw new Error("Function not implemented.");
          },
          handleSnapshot: function (
            id: string,
            snapshotId: string | number | null,
            snapshot: Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields> | null,
            snapshotData: T,
            category?: Category,
            callback: (snapshot: T) => void,
            snapshots: Snapshots<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>,
            type: string,
            event: SnapshotEvent<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>,
            snapshotContainer?: T,
            snapshotStoreConfig?: SnapshotStoreConfig<SnapshotWithCriteria<Data<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>, K>, AppK, AppMeta, AppExcludedFields>,
          ): void {
            throw new Error("Function not implemented.");
          },
          handleActions: function (): void {
            throw new Error("Function not implemented.");
          },
          setSnapshot: function (snapshot: Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>): void {
            throw new Error("Function not implemented.");
          },
          transformSnapshotConfig: function <U extends BaseDataEntity>(
            config: SnapshotStoreConfig<U, U>
          ): SnapshotStoreConfig<U, U> {
            throw new Error("Function not implemented.");
          },
          setSnapshots: function (
            snapshots: SnapshotStore<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>[]
          ): void {
            throw new Error("Function not implemented.");
          },
          clearSnapshot: function (): void {
            throw new Error("Function not implemented.");
          },
          mergeSnapshots: function (snapshots: SnapshotStore<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>[]): void {
            throw new Error("Function not implemented.");
          },
          reduceSnapshots: function (
            callback: (
              acc: R,
              snapshot: Snapshot<BaseDataRoot, BaseDataRoot, AppMeta, never>
            ) => R, initialValue: R): R {
            throw new Error("Function not implemented.");
          },
          sortSnapshots: function (): void {
            throw new Error("Function not implemented.");
          },
          filterSnapshots: function (): void {
            throw new Error("Function not implemented.");
          },
          mapSnapshots: function (
            storeIds: number[],
            snapshotId: string,
            category?: Category,
            categoryProperties: CategoryProperties | undefined,
            snapshot: Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>,
            timestamp: string | number | Date | undefined,
            type: string,
            event: SnapshotEvent<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>,
            id: number,
            snapshotStore: SnapshotStore<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>,
            data: T,
            callback: (
              storeIds: number[],
              snapshotId: string,
              category?: Category,
              categoryProperties: CategoryProperties | undefined,
              snapshot: Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>,
              timestamp: string | number | Date | undefined,
              type: string,
              event: SnapshotEvent<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>,
              id: number,
              snapshotStore: SnapshotStore<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>,
              data: T,
              index: number
            ) => SnapshotsObject<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>
          ): Promise<SnapshotsArray<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>> {
            throw new Error("Function not implemented.");
          },
          findSnapshot: function (
            predicate: (snapshot: Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>) => boolean
          ): Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields> | undefined {
            throw new Error("Function not implemented.");
          },
          getSubscribers: function (
            subscribers: Subscriber<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>[],
            snapshots: Snapshots<BaseData>
          ): Promise<{
            subscribers: Subscriber<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>[];
            snapshots: Snapshots<BaseData>;
          }> {
            throw new Error("Function not implemented.");
          },
          notify: function (
            id: string,
            message: string,
            content: any,
            date: Date,
            type: NotificationType,
            notificationPosition?: NotificationPosition | undefined
          ): void {
            throw new Error("Function not implemented.");
          },
          notifySubscribers: function (
            subscribers: Subscriber<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>[],
            data: Partial<SnapshotStoreConfig<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>>
          ): Subscriber<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>[] {
            throw new Error("Function not implemented.");
          },
          subscribe: function (
            snapshotId: string | number | null,
            unsubscribe: UnsubscribeDetails,
            subscriber: Subscriber<AppEntity, AppK, AppMeta, AppExcludedFieldss> | null,
            data: T,
            event: SnapshotEvent<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>,
            callback: Callback<SnapshotContext<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>>,
            value: T): [] | SnapshotsArray<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields> {
            throw new Error("Function not implemented.");
          },
          unsubscribe: function (): void {
            throw new Error("Function not implemented.");
          },

          fetchSnapshot: function (
            snapshotId: string,
            category?: Category,
            timestamp: Date,
            snapshot: Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>,
            data: BaseData,
            delegate: SnapshotStoreConfig<SnapshotWithCriteria<BaseData, any>, Meta, BaseData>[]
          ): Promise<{
            id: any;
            category: Category
            timestamp: any;
            snapshot: Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>;
            data: BaseData;
            getItem?:
            | ((
              snapshot: Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>
            ) => Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields> | undefined)
            | undefined;
          }> {
            throw new Error("Function not implemented.");
          },
          fetchSnapshotSuccess: function (
            snapshotData: (
              subscribers: Subscriber<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>[],
              snapshot: Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>
            ) => void
          ): void {
            throw new Error("Function not implemented.");
          },
          fetchSnapshotFailure: function (
            snapshotId: string,
            snapshotManager: SnapshotManager<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>,
            snapshot: Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>,
            date: Date | undefined,
            payload: { error: Error }
          ): void {
            throw new Error("Function not implemented.");
          },
          getSnapshots: function (
            category: string,
            data: Snapshots<BaseData>
          ): void {
            throw new Error("Function not implemented.");
          },
          getAllSnapshots: function (
            data: (
              subscribers: Subscriber<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>[],
              snapshots: Snapshots<BaseData>
            ) => Promise<Snapshots<BaseData>>
          ): void {
            throw new Error("Function not implemented.");
          },
          generateId: function (): string {
            throw new Error("Function not implemented.");
          },
          batchFetchSnapshots: function (
            subscribers: Subscriber<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>[],
            snapshots: Snapshots<BaseData>
          ): void {
            throw new Error("Function not implemented.");
          },
          batchTakeSnapshotsRequest: batchTakeSnapshotsRequest,
          batchUpdateSnapshotsRequest: batchUpdateSnapshotsRequest,
          batchFetchSnapshotsSuccess: batchFetchSnapshotsSuccess,
          batchFetchSnapshotsFailure: batchFetchSnapshotsFailure,
          batchUpdateSnapshotsSuccess: batchUpdateSnapshotsSuccess,
          batchUpdateSnapshotsFailure: batchUpdateSnapshotsFailure,
          batchTakeSnapshot: batchTakeSnapshot,
          handleSnapshotSuccess: handleSnapshotSuccess,
          [Symbol.iterator]: function (): IterableIterator<
            Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>
          > {
            throw new Error("Function not implemented.");
          },
        }

        const updatedSnapshotData: Partial<
          SnapshotStoreConfig<SnapshotWithCriteria<BaseData, any>, Meta, BaseData>
        > = {
          id: generatedSnapshotId.toString(),
          data: snapshot.data ?? undefined,
          timestamp: new Date(),
          snapshotId: generatedSnapshotId.toString(),
          category: "update" as any, // Adjust according to your actual category type
          // Ensure other required properties are included
        };

        const subscribers: Subscriber<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>[] = [];

        // Check if snapshotStore[0] is defined and has the method setSnapshotData
        if (
          snapshotStore[0] &&
          typeof snapshotStore[0].setSnapshotData === "function"
        ) {
          snapshotStore[0].setSnapshotData(subscribers, updatedSnapshotData);
        }

        // Check if snapshotStore is an array
        if (Array.isArray(snapshotStore)) {
          snapshotStore.unshift(initialState); // Add the initial snapshot to the beginning of the snapshot store
        }

        const snapshotManager = await useSnapshotManager(storeId);
        // Update the snapshot store through a setter method if available
        await snapshotManager.setSnapshotManager(newState); // Ensure this method exists and correctly updates state
      }
    }, 
  
    batchTakeSnapshot: async (
      snapshotStore: SnapshotStore<BaseData, K>,
      snapshots: Snapshots<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>
    ) => {
      return { snapshots: [] };
    },
    onSnapshot: (snapshotStore: SnapshotStore<BaseData, K>) => { },
    snapshotData: (snapshot: SnapshotStore<any, any>) => {
      return { snapshots: [] };
    },
    initSnapshot: () => { },
    // Implementation of fetchSnapshot function

    fetchSnapshot: async (
      id: string,
      category?: Category,
      timestamp: Date,
      snapshot: Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>,
      data: T,
      delegate: SnapshotStoreConfig<SnapshotWithCriteria<Data<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>, K>, K>[]
    ): Promise<{
      id: any;
      category: Category
      timestamp: any;
      snapshot: Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>;
      data: T;
      delegate: SnapshotStoreConfig<SnapshotWithCriteria<Data<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>, K>, K>[];
    }> => {
      try {
        // Example implementation fetching snapshot data
        const snapshotData = (await fetchFileSnapshotData(
          category as FileCategory
        )) as SnapshotData;

        // Check if snapshotData is defined
        if (!snapshotData) {
          throw new Error("Snapshot data is undefined.");
        }

        // Create a new SnapshotStore instance
        const snapshotStore = new SnapshotStore<BaseData, K>({
          snapshotId: snapshotData.id,
          data: snapshotData.data,
          date: snapshotData.timestamp as Date,
          category: snapshotData.category,
          type: snapshotData.type,
          snapshotConfig: snapshotData.snapshotConfig,
          delegate: snapshotData.delegate,
          dataStoreMethods: snapshotData.getDataStoreMethods(),
          subscribeToSnapshot: snapshotData.subscribeToSnapshot,
          subscribeToSnapshots: snapshotData.subscribeToSnapshots,
        });

        return {
          id: snapshotData.id,
          category: snapshotData.category,
          timestamp: snapshotData.timestamp,
          snapshot: snapshotData.snapshot,
          data: snapshotData.data,
          delegate: snapshotData.delegate,
        };
      } catch (error) {
        console.error("Error fetching snapshot:", error);
        throw error;
      }
    },


    clearSnapshot: () => { },

    updateSnapshot: async (
      snapshotId: string,
      snapshotIdOrParams: string | number | null | UpdateSnapshotParams<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>,
      data: Map<string, Snapshot<BaseData<any>, BaseData>>,
      newData: Partial<Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>>,
      events?: Record<string, CalendarManagerStoreClass<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>[]>,
      snapshotStore?: SnapshotStore<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>,
      dataItems?: RealtimeDataItem<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>[],
      payload?: UpdateSnapshotPayload<T>,
      store?: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      callback?: (snapshot: Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>) => void,
      snapshotManager?: SnapshotManager<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>,
    ): Promise<{ snapshot: Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields> }> => {
      // Example implementation logic (adjust as per your actual implementation)

      // Assuming you update some data in snapshotStore
      snapshotStore.addData(newData);

      // Convert snapshotStore to Snapshot<BaseData>
      const snapshotData: SnapshotData<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields> = {
        id: snapshotStore.id, // Ensure id is correctly assigned
        // Assign other properties as needed
        createdAt: new Date(),
        updatedAt: new Date(),
        title: "Snapshot Title", // Example: Replace with actual title
        description: "Snapshot Description", // Example: Replace with actual description
        status: "active", // Example: Replace with actual status
        category: "Snapshot Category", // Example: Replace with actual category
        // Ensure all required properties are assigned correctly
      };

      // Return the updated snapshot
      return { snapshot: snapshotData };
    },

    getSnapshots: async (category: string, snapshots: Snapshots<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>) => {
      return { snapshots };
    },
    takeSnapshot: async (snapshot: SnapshotStore<BaseData, K>) => {
      return { snapshot: snapshot };
    },

    getAllSnapshots: async (
      data: (
        subscribers: SubscriberCollection<SnapshotWithCriteria<Data<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>, K>, K>,
        snapshots: Snapshots<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>
      ) => Promise<Snapshots<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>>
    ) => {
      // Implement your logic here
      const subscribers: SubscriberCollection<SnapshotWithCriteria<Data<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>, K>, K> = []; // Example
      const snapshots: Snapshots<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields> = []; // Example
      return data(subscribers, snapshots);
    },

    takeSnapshotSuccess: () => { },
    updateSnapshotFailure: (payload: { error: string }) => {
      console.log("Error updating snapshot:", payload);
    },
    takeSnapshotsSuccess: () => { },
    fetchSnapshotSuccess: () => { },
    updateSnapshotsSuccess: () => { },
    notify: () => { },

    updateMainSnapshots: async <T extends BaseDataEntity>(
      snapshots: Snapshots<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>
    ): Promise<Snapshots<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>> => {
      try {
        const updatedSnapshots: Snapshots<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields> = snapshots.map((snapshot) => ({
          ...snapshot,
          message: "Main snapshot updated",
          content: "Updated main content",
          description: snapshot.description || undefined,
        }));
        return Promise.resolve(updatedSnapshots);
      } catch (error) {
        console.error("Error updating main snapshots:", error);
        throw error;
      }
    },

    batchFetchSnapshots: async (
      criteria: CriteriaType,
      subscribers: SubscriberCollection<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>,
      snapshots: Snapshots<Data<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>>
    ) => {
      return {
        subscribers: [],
        snapshots: [],
      };
    },

    batchUpdateSnapshots: async (
      subscribers: SubscriberCollection<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>,
      snapshots: Snapshots<Data<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>>
    ) => {
      // Perform batch update logic
      return [
        { snapshots: [] }, // Example empty array, adjust as per your logic
      ];
    },
    batchFetchSnapshotsRequest: async (snapshotData: {
      subscribers: SubscriberCollection<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>;
      snapshots: Snapshots<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>;
    }) => {
      console.log("Batch snapshot fetching requested.");

      try {
        const target = {
          endpoint: "https://example.com/api/snapshots/batch",
          params: {
            limit: 100,
            sortBy: "createdAt",
          },
        };

        const fetchedSnapshots: SnapshotList<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields> | Snapshots<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields> =
          await snapshotApi
            .getSortedList(target)
            .then((sortedList) => snapshotApi.fetchAllSnapshots(sortedList));

        let snapshots: Snapshots<CustomSnapshotData<AppEntity, AppK, AppMeta, AttachmentType, AppExcludedFields>>;

        if (Array.isArray(fetchedSnapshots)) {
          snapshots = fetchedSnapshots.map((snapshot) => ({

            id: snapshot.id,
            isCore: snapshot.isCore,
            isExpired: snapshot.isExpired,
            initialConfig: snapshot.initialConfig,
            removeSubscriber: snapshot.removeSubscriber,
            onInitialize: snapshot.onInitialize,
            onError: snapshot.onError,

            taskIdToAssign: snapshot.taskIdToAssign,
            schema: snapshot.schema,
            currentCategory: snapshot.currentCategory,
            mappedSnapshotData: snapshot.mappedSnapshotData,

            storeId: snapshot.storeId,
            versionInfo: snapshot.versionInfo,
            initializedState: snapshot.initializedState,
            criteria: snapshot.criteria,

            setCategory: snapshot.setCategory,
            applyStoreConfig: snapshot.applyStoreConfig,
            generateId: snapshot.generateId,
            snapshotData: snapshot.snapshotData,

            snapshotContainer: snapshot.snapshotContainer,
            getSnapshotItems: snapshot.getSnapshotItems,
            defaultSubscribeToSnapshots: snapshot.defaultSubscribeToSnapshots,
            notify: snapshot.notify,

            notifySubscribers: snapshot.notifySubscribers,
            getAllSnapshots: snapshot.getAllSnapshots,
            getSubscribers: snapshot.getSubscribers,
            transformSubscriber: snapshot.transformSubscriber,

            transformDelegate: snapshot.transformDelegate,
            getAllKeys: snapshot.getAllKeys,
            getAllValues: snapshot.getAllValues,
            getAllItems: snapshot.getAllItems,

            getSnapshotEntries: snapshot.getSnapshotEntries,
            getAllSnapshotEntries: snapshot.getAllSnapshotEntries,
            addDataStatus: snapshot.addDataStatus,
            removeData: snapshot.removeData,

            updateData: snapshot.updateData,
            updateDataTitle: snapshot.updateDataTitle,
            updateDataDescription: snapshot.updateDataDescription,
            updateDataStatus: snapshot.updateDataStatus,

            addDataSuccess: snapshot.addDataSuccess,
            getDataVersions: snapshot.getDataVersions,
            updateDataVersions: snapshot.updateDataVersions,
            getBackendVersion: snapshot.getBackendVersion,

            getFrontendVersion: snapshot.getFrontendVersion,
            fetchStoreData: snapshot.fetchStoreData,
            fetchData: snapshot.fetchData,
            defaultSubscribeToSnapshot: snapshot.defaultSubscribeToSnapshot,

            handleSubscribeToSnapshot: snapshot.handleSubscribeToSnapshot,
            removeItem: snapshot.removeItem,
            getSnapshot: snapshot.getSnapshot,
            getSnapshotSuccess: snapshot.getSnapshotSuccess,

            setItem: snapshot.setItem,
            getItem: snapshot.getItem,
            getDataStore: snapshot.getDataStore,
            getDataStoreMap: snapshot.getDataStoreMap,

            addSnapshotSuccess: snapshot.addSnapshotSuccess,
            deepCompare: snapshot.deepCompare,
            shallowCompare: snapshot.shallowCompare,
            getDataStoreMethods: snapshot.getDataStoreMethods,

            getDelegate: snapshot.getDelegate,
            determineCategory: snapshot.determineCategory,
            determinePrefix: snapshot.determinePrefix,
            removeSnapshot: snapshot.removeSnapshot,

            addSnapshotItem: snapshot.addSnapshotItem,
            addNestedStore: snapshot.addNestedStore,
            clearSnapshots: snapshot.clearSnapshots,
            addSnapshot: snapshot.addSnapshot,

            emit: snapshot.emit,
            createSnapshot: snapshot.createSnapshot,
            createInitSnapshot: snapshot.createInitSnapshot,
            addStoreConfig: snapshot.addStoreConfig,

            snapshotId: snapshot.snapshotId,
            timestamp: snapshot.timestamp,
            category: snapshot.category,
            message: snapshot.message,
            content: snapshot.content,
            data: snapshot.data, // Ensure data is directly assigned if it's already in the correct format
            store: snapshot.store,
            metadata: snapshot.metadata,
            key: snapshot.key,
            topic: snapshot.topic,
            date: snapshot.date,
            configOption: snapshot.configOption,
            config: snapshot.config,
            title: snapshot.title,
            type: snapshot.type,
            subscribers: snapshot.subscribers,
            set: snapshot.set,
            state: snapshot.state,
            snapshots: snapshot.snapshots,
            snapshotConfig: snapshot.snapshotConfig,
            dataStore: snapshot.dataStore,
            dataStoreMethods: snapshot.dataStoreMethods,
            delegate: snapshot.delegate,
            subscriberId: snapshot.subscriberId,
            length: snapshot.length,
            events: snapshot.events,
            meta: snapshot.meta,
            initialState: snapshot.initialState,
            snapshot: snapshot.snapshot,
            getSnapshotId: snapshot.getSnapshotId,
            compareSnapshotState: snapshot.compareSnapshotState,
            eventRecords: snapshot.eventRecords,
            snapshotStore: snapshot.snapshotStore,
            getParentId: snapshot.getParentId,
            getChildIds: snapshot.getChildIds,
            addChild: snapshot.addChild,
            removeChild: snapshot.removeChild,
            getChildren: snapshot.getChildren,
            hasChildren: snapshot.hasChildren,
            isDescendantOf: snapshot.isDescendantOf,
            dataItems: snapshot.dataItems,
            newData: snapshot.newData,
            getInitialState: snapshot.getInitialState,
            getConfigOption: snapshot.getConfigOption,
            stores: snapshot.stores,
            getStore: snapshot.getStore,
            addStore: snapshot.addStore,
            mapSnapshot: snapshot.mapSnapshot,
            removeStore: snapshot.removeStore,
            unsubscribe: snapshot.unsubscribe,
            fetchSnapshot: snapshot.fetchSnapshot,
            addSnapshotFailure: snapshot.addSnapshotFailure,
            configureSnapshotStore: snapshot.configureSnapshotStore,
            updateSnapshotSuccess: snapshot.updateSnapshotSuccess,
            createSnapshotFailure: snapshot.createSnapshotFailure,
            createSnapshotSuccess: snapshot.createSnapshotSuccess,
            createSnapshots: snapshot.createSnapshots,
            onSnapshot: snapshot.onSnapshot,
            onSnapshots: snapshot.onSnapshots,
            handleSnapshot: snapshot.handleSnapshot,

            handleSnapshotConfig: snapshot.handleSnapshotConfig,
            getSnapshotConfig: snapshot.getSnapshotConfig,
            getSnapshotListByCriteria: snapshot.getSnapshotListByCriteria,
            setSnapshotSuccess: snapshot.setSnapshotSuccess,

            setSnapshotFailure: snapshot.setSnapshotFailure,
            updateSnapshots: snapshot.updateSnapshots,
            updateSnapshotsSuccess: snapshot.updateSnapshotsSuccess,
            updateSnapshotsFailure: snapshot.updateSnapshotsFailure,

            initSnapshot: snapshot.initSnapshot,
            takeSnapshot: snapshot.takeSnapshot,
            takeSnapshotSuccess: snapshot.takeSnapshotSuccess,
            takeSnapshotsSuccess: snapshot.takeSnapshotsSuccess,

            flatMap: snapshot.flatMap,
            getState: snapshot.getState,
            setState: snapshot.setState,
            validateSnapshot: snapshot.validateSnapshot,

            handleActions: snapshot.handleActions,
            setSnapshot: snapshot.setSnapshot,
            transformSnapshotConfig: snapshot.transformSnapshotConfig,
            setSnapshots: snapshot.setSnapshots,

            clearSnapshot: snapshot.clearSnapshot,
            mergeSnapshots: snapshot.mergeSnapshots,
            reduceSnapshots: snapshot.reduceSnapshots,
            sortSnapshots: snapshot.sortSnapshots,

            filterSnapshots: snapshot.filterSnapshots,
            findSnapshot: snapshot.findSnapshot,
            mapSnapshots: snapshot.mapSnapshots,
            takeLatestSnapshot: snapshot.takeLatestSnapshot,

            updateSnapshot: snapshot.updateSnapshot,
            addSnapshotSubscriber: snapshot.addSnapshotSubscriber,
            removeSnapshotSubscriber: snapshot.removeSnapshotSubscriber,
            getSnapshotConfigItems: snapshot.getSnapshotConfigItems,

            subscribeToSnapshots: snapshot.subscribeToSnapshots,
            executeSnapshotAction: snapshot.executeSnapshotAction,
            subscribeToSnapshot: snapshot.subscribeToSnapshot,
            unsubscribeFromSnapshot: snapshot.unsubscribeFromSnapshot,

            subscribeToSnapshotsSuccess: snapshot.subscribeToSnapshotsSuccess,
            unsubscribeFromSnapshots: snapshot.unsubscribeFromSnapshots,
            getSnapshotItemsSuccess: snapshot.getSnapshotItemsSuccess,
            getSnapshotItemSuccess: snapshot.getSnapshotItemSuccess,

            getSnapshotKeys: snapshot.getSnapshotKeys,
            getSnapshotIdSuccess: snapshot.getSnapshotIdSuccess,
            getSnapshotValuesSuccess: snapshot.getSnapshotValuesSuccess,
            getSnapshotWithCriteria: snapshot.getSnapshotWithCriteria,

            reduceSnapshotItems: snapshot.reduceSnapshotItems,
            subscribeToSnapshotList: snapshot.subscribeToSnapshotList,
            label: snapshot.label,
            restoreSnapshot: snapshot.restoreSnapshot,

            subscribe: snapshot.subscribe,
            snapshotMethods: snapshot.snapshotMethods,
            getSnapshotsBySubscriber: snapshot.getSnapshotsBySubscriber,
            items: snapshot.items,

            setSnapshotCategory: snapshot.setSnapshotCategory,
            getSnapshotCategory: snapshot.getSnapshotCategory,
            getSnapshotData: snapshot.getSnapshotData,
            deleteSnapshot: snapshot.deleteSnapshot,

            getSnapshots: snapshot.getSnapshots,
            compareSnapshots: snapshot.compareSnapshots,
            compareSnapshotItems: snapshot.compareSnapshotItems,
            batchTakeSnapshot: snapshot.batchTakeSnapshot,

            batchFetchSnapshots: snapshot.batchFetchSnapshots,
            batchTakeSnapshotsRequest: snapshot.batchTakeSnapshotsRequest,
            batchUpdateSnapshotsRequest: snapshot.batchUpdateSnapshotsRequest,
            filterSnapshotsByStatus: snapshot.filterSnapshotsByStatus,

            filterSnapshotsByCategory: snapshot.filterSnapshotsByCategory,
            filterSnapshotsByTag: snapshot.filterSnapshotsByTag,
            batchFetchSnapshotsSuccess: snapshot.batchFetchSnapshotsSuccess,
            batchFetchSnapshotsFailure: snapshot.batchFetchSnapshotsFailure,

            batchUpdateSnapshotsSuccess: snapshot.batchUpdateSnapshotsSuccess,
            batchUpdateSnapshotsFailure: snapshot.batchUpdateSnapshotsFailure,
            handleSnapshotSuccess: snapshot.handleSnapshotSuccess,
            handleSnapshotFailure: snapshot.handleSnapshotFailure,

            payload: snapshot.payload,
            getTimestamp: snapshot.getTimestamp,
            getStores: snapshot.getStores,
            getData: snapshot.getData,
            setData: snapshot.setData,
            addData: snapshot.addData,
            mapSnapshotWithDetails: snapshot.mapSnapshotWithDetails,
            fetchSnapshotSuccess: snapshot.fetchSnapshotSuccess,

            updateSnapshotFailure: snapshot.updateSnapshotFailure,
            fetchSnapshotFailure: snapshot.fetchSnapshotFailure,
            snapConfig: snapshot.snapConfig,
            childIds: snapshot.childIds,
            snapshotCategory: snapshot.snapshotCategory,
            snapshotSubscriberId: snapshot.snapshotSubscriberId,
            getSnapshotById: snapshot.getSnapshotById,
            initializeWithData: snapshot.initializeWithData,
            hasSnapshots: snapshot.hasSnapshots,
            // Adjust this based on your actual data structure
          }));
        } else {
          snapshots = fetchedSnapshots.getSnapshots()
            .map((snapshot: SnapshotItem<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>) => ({
              id: snapshot.id,
              timestamp: snapshot.timestamp,
              category: snapshot.category,
              message: snapshot.message,
              content: snapshot.content,
              data: snapshot.data,
              store: snapshot.store,
              metadata: snapshot.metadata,
              events: snapshot.events,
              meta: snapshot.meta,
              initialState: new Map(), // Adjust this based on your actual data structure
            }));
        }

        return {
          subscribers: snapshotData.subscribers,
          snapshots: snapshots,
        };
      } catch (error) {
        console.error("Error fetching snapshots in batch:", error);
        throw error;
      }
    },

    updateSnapshotForSubscriber: async (
      subscriber: Subscriber<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>,
      snapshots: Snapshots<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>
    ): Promise<{
      subscribers: Subscriber<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>[];
      snapshots: Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>[];
    }> => {
      try {
        const subscriberId = subscriber.id;

        if (!subscriberId) {
          throw new Error("Subscriber ID is undefined");
        }

        // Accessing the snapshot data using the subscriber ID as a key
        const snapshotData = snapshots[subscriberId];

        if (!snapshotData) {
          throw new Error(
            `No snapshot data found for subscriber ID: ${subscriberId}`
          );
        }

        // Logic to update the snapshot for a specific subscriber
        const updatedSnapshot: Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields> = {
          ...snapshotData,
          message: "Updated for subscriber",
        };


        // Create a new array with the updated snapshot
        const updatedSnapshots: Snapshots<Data<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>> = {
          ...snapshots,
          [String(subscriberId)]: updatedSnapshot,
        };

        // Convert the updatedSnapshots object into an array
        const updatedSnapshotsArray: Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>[] = Object.values(updatedSnapshots);


        // Return the updated snapshot wrapped in the expected structure
        return {
          subscribers: [subscriber],
          snapshots: updatedSnapshotsArray,
        };
      } catch (error) {
        console.error("Error updating snapshot for subscriber:", error);
        throw error;
      }
    },

    batchFetchSnapshotsSuccess: () => {
      return [];
    },
    batchFetchSnapshotsFailure: (payload: { error: Error }) => { },

    batchUpdateSnapshotsFailure: (payload: { error: Error }) => { },

    notifySubscribers: (
      message: string,
      subscribers: AppSubscriber[],
      callback: (data: AppSnapshot) => AppSubscriber[],
      data?: Partial<AppSnapshotStoreConfig>
    ): Promise<AppSubscriber[]> => {
      console.log("Notify message:", message);

      // Example logic: apply callback to a dummy snapshot or a real one
      const dummySnapshot: AppSnapshot = {
        id: "snapshot1",
        data: {} as any,
        meta: {} as any,
        // add any required Snapshot props here
      };

      const updatedSubscribers = callback(dummySnapshot);

      // Return Promise<Subscriber[]>
      return Promise.resolve(updatedSubscribers);
    },

    removeSnapshot: (snapshotToRemove) => {
      if (snapshotToRemove && snapshotToRemove.id !== undefined) {
        const currentConfig = snapshotConfig.find(
          (config) => config.snapshotId === "snapshot1" // Adjust the condition to match your use case
        );
        if (currentConfig && currentConfig.snapshots) {
          const filteredSnapshots = currentConfig.snapshots.filter(
            (snapshot) => snapshot.id !== snapshotToRemove.id
          );
          currentConfig.snapshots = filteredSnapshots;
        } else {
          console.warn("Snapshots not found in snapshotConfig.");
        }
      } else {
        console.warn(
          `${snapshotToRemove} or ${snapshotToRemove?.id} is undefined, no snapshot removed`
        );
      }
    },

    // Implementing the removeSubscriber method
    removeSubscriber: (subscriber) => {
      const subscriberId = subscriber.id;
      if (subscriberId !== undefined) {
        const currentConfig = snapshotConfig.find(
          (config) => config.snapshotId === "snapshot1" // Adjust the condition to match your use case
        );
        if (currentConfig && currentConfig.subscribers) {
          const filteredSubscribers = currentConfig.subscribers.filter(
            (sub) => sub.id !== subscriberId
          );
          currentConfig.subscribers = filteredSubscribers;
        } else {
          console.warn("Subscribers not found in snapshotConfig.");
        }
      } else {
        console.warn(`${subscriberId} is undefined, subscriber not removed`);
      }
    },

    // Implementing the addSubscriber method
    addSnapshot: function (snapshot: Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>) {
      if (
        "data" in snapshot &&
        "timestamp" in snapshot &&
        "category" in snapshot &&
        typeof snapshot.category === "string"
      ) {
        const snapshotWithValidTimestamp: SnapshotStore<BaseData, K> = {
          ...snapshot,
          timestamp: new Date(snapshot.timestamp as unknown as string),
          // Ensure all required properties of Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields> are included
          id: snapshot.id!.toString(),
          snapshotId: snapshot.snapshotId!.toString(),
          taskIdToAssign: snapshot.taskIdToAssign,
          clearSnapshots: snapshot.clearSnapshots,
          key: snapshot.key!,
          topic: snapshot.topic!,
          initialState: snapshot.initialState as Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>
            | Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields> | null | undefined,
          initialConfig: snapshot.initialConfig,
          configOption: snapshot.configOption ? snapshot.configOption : null,
          subscription: snapshot.subscription ? snapshot.subscription : null,
          config: snapshot.config,
          category: snapshot.category,
          set: snapshot.set,
          data: snapshot.data || undefined,
          store: snapshot.store!,
          removeSubscriber: snapshot.removeSubscriber,
          handleSnapshot: snapshot.handleSnapshot,
          state: snapshot.state,
          snapshots: snapshot.snapshots,
          onInitialize: snapshot.onInitialize,
          subscribers: snapshot.subscribers,
          onError: snapshot.onError,
          snapshot: snapshot.snapshot,
          setSnapshot: snapshot.setSnapshot!,
          createSnapshot: snapshot.createSnapshot,
          configureSnapshotStore: snapshot.configureSnapshotStore,
          createSnapshotSuccess: snapshot.createSnapshotSuccess,
          createSnapshotFailure: snapshot.createSnapshotFailure,
          batchTakeSnapshot: snapshot.batchTakeSnapshot,
          onSnapshot: snapshot.onSnapshot,
          snapshotData: snapshot.snapshotData,
          initSnapshot: snapshot.initSnapshot,
          clearSnapshot: snapshot.clearSnapshot,
          updateSnapshot: snapshot.updateSnapshot,
          getSnapshots: snapshot.getSnapshots,
          takeSnapshot: snapshot.takeSnapshot,
          getAllSnapshots: this.getAllSnapshots,
          takeSnapshotSuccess: this.takeSnapshotSuccess,
          updateSnapshotFailure: this.updateSnapshotFailure,
          takeSnapshotsSuccess: this.takeSnapshotsSuccess,
          fetchSnapshotSuccess: this.fetchSnapshotSuccess,
          updateSnapshotsSuccess: this.updateSnapshotsSuccess,
          notify: this.notify,
          updateMainSnapshots: this.updateMainSnapshots,
          batchFetchSnapshots: this.batchFetchSnapshots,
          batchUpdateSnapshots: this.batchUpdateSnapshots,
          batchFetchSnapshotsRequest: this.batchFetchSnapshotsRequest,
          updateSnapshotForSubscriber: this.updateSnapshotForSubscriber,
          batchFetchSnapshotsSuccess: this.batchFetchSnapshotsSuccess,
          batchFetchSnapshotsFailure: this.batchFetchSnapshotsFailure,
          batchUpdateSnapshotsFailure: this.batchUpdateSnapshotsFailure,
          notifySubscribers: this.notifySubscribers,
          removeSnapshot: this.removeSnapshot,
          expirationDate: this.expirationDate,
          isExpired: this.isExpired,
          priority: this.priority,
          tags: this.tags,
          metadata: this.metadata,
          status: this.status,
          isCompressed: this.isCompressed,
          compress: this.compress,
          isEncrypted: this.isEncrypted,
          encrypt: this.encrypt,
          decrypt: this.decrypt,
          ownerId: this.ownerId,
          getOwner: this.getOwner,
          version: this.version,
          previousVersionId: this.previousVersionId,
          nextVersionId: this.nextVersionId,
          auditTrail: this.auditTrail,
          addAuditRecord: this.addAuditRecord,
          retentionPolicy: this.retentionPolicy,
          dependencies: this.dependencies,
          updateSnapshots: this.updateSnapshots,
          updateSnapshotsFailure: this.updateSnapshotsFailure,
          flatMap: this.flatMap,
          setData: this.setData,
          getState: this.getState,
          setState: this.setState,
          handleActions: this.handleActions,
          setSnapshots: this.setSnapshots,
          mergeSnapshots: this.mergeSnapshots,
          reduceSnapshots: this.reduceSnapshots,
          sortSnapshots: this.sortSnapshots,
          filterSnapshots: this.filterSnapshots,
          mapSnapshots: this.mapSnapshots,
          findSnapshot: this.findSnapshot,
          subscribe: this.subscribe,
          unsubscribe: this.unsubscribe,
          fetchSnapshotFailure: this.fetchSnapshotFailure,
          generateId: this.generateId,
        };

        const currentConfig = snapshotConfig.find(
          (config) => config.snapshotId === this.snapshotId
        );
        if (currentConfig && currentConfig.snapshots) {
          currentConfig.snapshots.push(snapshotWithValidTimestamp);
        } else {
          console.error("Snapshots not found in snapshotConfig.");
        }
      } else {
        console.error("Invalid snapshot format");
      }
    },

    getSubscribers: async (
      subscribers: SubscriberCollection<SnapshotWithCriteria<Data<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>, K>, K>,
      snapshots: Snapshots<Data<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>>
    ): Promise<{
      subscribers: SubscriberCollection<SnapshotWithCriteria<Data<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>, K>, K>;
      snapshots: Snapshots<BaseData>[];
    }> => {
      const data = Object.entries(snapshots)
        .map(([category, categorySnapshots]) => {
          const subscribersForCategory = subscribers.filter(
            (subscriber) => subscriber.getData()?.category === category
          );
          if (Array.isArray(categorySnapshots)) {
            const snapshotsForCategory = categorySnapshots.map(
              (snapshot: Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>) => {
                const updatedSnapshot = {
                  ...snapshot,
                  subscribers: subscribersForCategory.map((subscriber) => {
                    const subscriberData = subscriber.getData();
                    if (subscriberData) {
                      return {
                        ...subscriberData,
                        id: subscriber.getId(),
                      };
                    } else {
                      return {
                        id: subscriber.getId(),
                      };
                    }
                  }),
                };
                return updatedSnapshot;
              }
            );
            return snapshotsForCategory;
          }
        })
        .flat();

      return {
        subscribers,
        snapshots: data,
      };
    },

    addSubscriber: function <T extends Data | CustomSnapshotData>(
      subscriber: Subscriber<BaseData, K>,
      data: T,
      snapshotConfig: SnapshotStoreConfig<SnapshotWithCriteria<BaseData, any>, K>[],
      delegate: SnapshotStoreSubset<BaseData>,
      sendNotification: (type: NotificationTypeEnum) => void
    ): void { },

    validateSnapshot: function (snapshot: Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>): boolean {
      if (!snapshot.id || typeof snapshot.id !== "string") {
        console.error("Invalid snapshot ID");
        return false;
      }
      if (!(snapshot.timestamp instanceof Date)) {
        console.error("Invalid timestamp");
        return false;
      }
      if (!snapshot.data) {
        console.error("Data is required");
        return false;
      }
      return true;
    },

    getSnapshot: async function (
      snapshot: () =>
        | Promise<{
          category: any;
          timestamp: any;
          id: any;
          snapshot: SnapshotStore<BaseData, K>;
          data: Data;
        }>
        | undefined
    ): Promise<SnapshotStore<BaseData, K>> {
      try {
        const result = await snapshot();
        if (!result) {
          throw new Error("Snapshot not found");
        }
        const {
          category,
          timestamp,
          id,
          snapshot: storeSnapshot,
          data,
        } = result;
        return storeSnapshot;
      } catch (error) {
        console.error("Error fetching snapshot:", error);
        throw error;
      }
    },

    getSnapshotById: async function (
      snapshot: (
        id: string
      ) => Promise<{
        category: Category
        timestamp: string | number | Date | undefined;
        id: string | number | undefined;
        snapshot: Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>;
        snapshotStore: Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>;
        data: T;
      }> | undefined,
      snapshotId: string,
      snapshotContainer: SnapshotContainer<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>,
      criteria: CriteriaType, // Adjust the type as needed
      storeId: number
    ): Promise<Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields> | undefined> {
      try {


        const config = await snapshotApi.getSnapshotStoreConfig(
          snapshotId, snapshotContainer, criteria, storeId
        )

        if (!config) {
          throw new Error("Snapshot configuration not found");
        }

        // Here, assuming `config` is of type `SnapshotStoreConfig<SnapshotWithCriteria<BaseData, any>, Data<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>>`
        // and you need to create or access a `SnapshotStore<BaseData, K>` instance
        const snapshotStore: SnapshotStore<BaseData, K> = {
          id: config.id, // Ensure `id` is accessible from `SnapshotStoreConfig`
          key: config.key ? config.key : config.snapshotId, // Ensure `key` is accessible from `SnapshotStoreConfig`
          topic: config.topic ? config.topic : "defaultTopic",
          date: new Date(), // Adjust as per your logic
          title: "Snapshot Title", // Example, adjust as per your logic
          type: "snapshot_type", // Example, adjust as per your logic
          subscription: null, // Example, adjust as per your logic
          category: config.category,
          timestamp: new Date(),
          findIndex: config.findIndex,
          splice: config.splice,
          keys: config.keys,
          config: config.config,
          message: config.message,
          createdBy: "",
          eventRecords: null,
          subscribers: config.subscribers,
          stores: null,
          snapshots: config.snapshots,
          snapshotConfig: config.snapshotConfig,
          meta: config.meta,
          snapshotMethods: config.snapshotMethods,
          getSnapshotsBySubscriber: config.getSnapshotsBySubscriber,
          getSnapshotsByTopicSuccess: config.getSnapshotsByTopicSuccess,
          getSnapshotsByCategory: config.getSnapshotsByCategory,
          getSnapshotsByCategorySuccess: config.getSnapshotsByCategorySuccess,
          getSnapshotsByKey: config.getSnapshotsByKey,
          getSnapshotsByKeySuccess: config.getSnapshotsByKeySuccess,
          getSnapshotsByPriority: config.getSnapshotsByPriority,
          getSnapshotsByPrioritySuccess: config.getSnapshotsByPrioritySuccess,
          getStoreData: config.getStoreData,
          updateStoreData: config.updateStoreData,
          updateDelegate: config.updateDelegate,
          getSnapshotContainer: config.getSnapshotContainer,
          getSnapshotVersions: config.getSnapshotVersions,
          createSnapshot: config.createSnapshot,
          deleteSnapshot: config.deleteSnapshot,
          snapshotStoreConfig: config.snapshotStoreConfig,
          getSnapshotItems: config.getSnapshotItems,
          dataStore: config.dataStore,
          snapshotStores: config.snapshotStores,
          initialState: config.initialState,
          snapshotItems: config.snapshotItems,
          nestedStores: config.nestedStores,
          snapshotIds: config.snapshotIds,
          dataStoreMethods: config.dataStoreMethods,
          delegate: config.delegate,
          findSnapshotStoreById: config.findSnapshotStoreById,
          saveSnapshotStore: config.saveSnapshotStore,
          events: config.events,
          subscriberId: config.subscriberId,
          length: config.length,
          content: config.content,
          value: config.value,
          todoSnapshotId: config.todoSnapshotId,
          snapshotStore: null,
          dataItems: config.dataItems,
          newData: null,
          storeId: 0,
          handleSnapshotOperation: config.handleSnapshotOperation,
          getStore: config.getStore,
          addStore: config.addStore,
          getCustomStore: config.getCustomStore,
          addSCustomStore: config.addSCustomStore,
          removeStore: config.removeStore,
          onSnapshot: config.onSnapshot,
          getData: config.getData,
          getDataStore: config.getDataStore,
          addSnapshotToStore: config.addSnapshotToStore,
          addSnapshotItem: config.addSnapshotItem,
          addNestedStore: config.addNestedStore,
          defaultSubscribeToSnapshots: config.defaultSubscribeToSnapshots,
          defaultCreateSnapshotStores: config.defaultCreateSnapshotStores,
          createSnapshotStores: config.createSnapshotStores,
          subscribeToSnapshots: config.subscribeToSnapshots,
          subscribeToSnapshot: config.subscribeToSnapshot,
          defaultOnSnapshots: config.defaultOnSnapshots,
          onSnapshots: config.onSnapshots,
          transformSubscriber: config.transformSubscriber,
          isSnapshotStoreConfig: config.isSnapshotStoreConfig,
          transformDelegate: config.transformDelegate,
          initializedState: config.initializedState,
          transformedDelegate: config.transformedDelegate,
          getSnapshotIds: config.getSnapshotIds,
          getNestedStores: config.getNestedStores,
          getFindSnapshotStoreById: config.getFindSnapshotStoreById,
          getAllKeys: config.getAllKeys,
          mapSnapshot: config.mapSnapshot,
          getAllItems: config.getAllItems,
          // addData: config.addData,
          // addDataStatus: config.addDataStatus,
          // removeData: config.removeData,
          // updateData: config.updateData,
          updateDataTitle: config.updateDataTitle,
          updateDataDescription: config.updateDataDescription,
          updateDataStatus: config.updateDataStatus,
          addDataSuccess: config.addDataSuccess,
          getDataVersions: config.getDataVersions,
          updateDataVersions: config.updateDataVersions,
          getBackendVersion: config.getBackendVersion,
          getFrontendVersion: config.getFrontendVersion,
          fetchData: config.fetchData,
          defaultSubscribeToSnapshot: config.defaultSubscribeToSnapshot,
          handleSubscribeToSnapshot: config.handleSubscribeToSnapshot,
          snapshot: config.snapshot,
          removeItem: config.removeItem,
          getSnapshot: config.getSnapshot,
          getSnapshotById: config.getSnapshotById,
          getSnapshotSuccess: config.getSnapshotSuccess,
          getSnapshotId: config.getSnapshotId,
          getSnapshotArray: config.getSnapshotArray,
          getItem: config.getItem,
          setItem: config.setItem,
          addSnapshotFailure: config.addSnapshotFailure,
          addSnapshotSuccess: config.addSnapshotSuccess,
          getParentId: config.getParentId,
          getChildIds: config.getChildIds,
          compareSnapshotState: config.compareSnapshotState,
          deepCompare: config.deepCompare,
          shallowCompare: config.shallowCompare,
          getDataStoreMethods: config.getDataStoreMethods,
          getDelegate: config.getDelegate,
          determineCategory: config.determineCategory,
          determineSnapshotStoreCategory: config.determineSnapshotStoreCategory,
          determinePrefix: config.determinePrefix,
          updateSnapshot: config.updateSnapshot,
          updateSnapshotSuccess: config.updateSnapshotSuccess,
          updateSnapshotFailure: config.updateSnapshotFailure,
          removeSnapshot: config.removeSnapshot,
          clearSnapshots: config.clearSnapshots,
          addSnapshot: config.addSnapshot,
          createInitSnapshot: config.createInitSnapshot,
          createSnapshotSuccess: config.createSnapshotSuccess,
          clearSnapshotSuccess: config.clearSnapshotSuccess,
          clearSnapshotFailure: config.clearSnapshotFailure,
          createSnapshotFailure: config.createSnapshotFailure,
          setSnapshotSuccess: config.setSnapshotSuccess,
          setSnapshotFailure: config.setSnapshotFailure,
          updateSnapshots: config.updateSnapshots,
          updateSnapshotsSuccess: config.updateSnapshotsSuccess,
          updateSnapshotsFailure: config.updateSnapshotsFailure,
          initSnapshot: config.initSnapshot,
          takeSnapshot: config.takeSnapshot,
          takeSnapshotSuccess: config.takeSnapshotSuccess,
          takeSnapshotsSuccess: config.takeSnapshotsSuccess,
          configureSnapshotStore: config.configureSnapshotStore,
          updateSnapshotStore: config.updateSnapshotStore,
          flatMap: config.flatMap,
          setData: config.setData,
          getState: config.getState,
          setState: config.setState,
          validateSnapshot: config.validateSnapshot,
          handleSnapshot: config.handleSnapshot,
          handleActions: config.handleActions,
          setSnapshot: config.setSnapshot,
          transformSnapshotConfig: config.transformSnapshotConfig,
          setSnapshotData: config.setSnapshotData,
          setSnapshots: config.setSnapshots,
          clearSnapshot: config.clearSnapshot,
          mergeSnapshots: config.mergeSnapshots,
          reduceSnapshots: config.reduceSnapshots,
          sortSnapshots: config.sortSnapshots,
          filterSnapshots: config.filterSnapshots,
          mapSnapshotsAO: config.mapSnapshotsAO,
          mapSnapshots: config.mapSnapshots,
          findSnapshot: config.findSnapshot,
          getSubscribers: config.getSubscribers,
          notify: config.notify,
          notifySubscribers: config.notifySubscribers,
          subscribe: config.subscribe,
          unsubscribe: config.unsubscribe,
          fetchSnapshot: config.fetchSnapshot,
          fetchSnapshotSuccess: config.fetchSnapshotSuccess,
          fetchSnapshotFailure: config.fetchSnapshotFailure,
          getSnapshots: config.getSnapshots,
          getAllSnapshots: config.getAllSnapshots,
          getSnapshotStoreData: config.getSnapshotStoreData,
          generateId: config.generateId,
          batchFetchSnapshots: config.batchFetchSnapshots,
          batchTakeSnapshotsRequest: config.batchTakeSnapshotsRequest,
          batchUpdateSnapshotsRequest: config.batchUpdateSnapshotsRequest,
          batchFetchSnapshotsSuccess: config.batchFetchSnapshotsSuccess,
          batchFetchSnapshotsFailure: config.batchFetchSnapshotsFailure,
          batchUpdateSnapshotsSuccess: config.batchUpdateSnapshotsSuccess,
          batchUpdateSnapshotsFailure: config.batchUpdateSnapshotsFailure,
          batchTakeSnapshot: config.batchTakeSnapshot,
          handleSnapshotSuccess: config.handleSnapshotSuccess,
          [Symbol.iterator]: function (): IterableIterator<Snapshot<BaseData, any>> {
            throw new Error("Function not implemented.");
          }
        };
        return snapshotStore;
      } catch (error) {
        console.error("Error fetching snapshot:", error);
        throw error;
      }
    },
    batchTakeSnapshotsRequest: (snapshotData: any) => {
      console.log("Batch snapshot taking requested.");
      return Promise.resolve({ snapshots: [] });
    },
    updateSnapshotSuccess: () => {
      console.log("Snapshot updated successfully.");
    },
    setSnapshotFailure: (error: Error) => {
      console.error("Error in snapshot update:", error);
    },
    batchUpdateSnapshotsSuccess: (
      subscribers: SubscriberCollection<SnapshotWithCriteria<Data<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>, K>, K>,
      snapshots: Snapshots<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>
    ) => {
      try {
        console.log("Batch snapshots updated successfully.");
        return [{ snapshots }];
      } catch (error) {
        console.error("Error in batch snapshots update:", error);
        throw error;
      }
    },
    getData: async () => {
      try {
        const data = await fetchData(String(endpoints));
        if (data && data.data) {
          return data.data.map((snapshot: any) => ({
            ...snapshot,
            data: snapshot.data,
          }));
        }
        return [];
      } catch (error) {
        console.error("Error fetching data:", error);
        throw error;
      }
    },
    isExpired: function () {
      return !!this.expirationDate && this.expirationDate < new Date();
    },

    compress: function () {
      this.isCompressed = true;
    },
    isEncrypted: false,
    encrypt: function () {
      this.isEncrypted = true;
    },
    decrypt: function () {
      this.isEncrypted = false;
    },
    ownerId: "owner-id",
    getOwner: function () {
      return this.ownerId ?? "defaultOwner"; // Replace "defaultOwner" with your desired default value
    },
    version: "1.0.0",
    previousVersionId: "0.9.0",
    nextVersionId: "1.1.0",
    auditTrail: [],
    addAuditRecord: function (record: AuditRecord) {
      if (this.auditTrail) {
        this.auditTrail.push(record);
      }
    },
    retentionPolicy: {
      retentionPeriod: 0, // in days
      cleanupOnExpiration: false,
      retainUntil: new Date(),
    },
    dependencies: [],
    [Symbol.iterator]: function (): IterableIterator<any> {
      const snapshotStore = this;
      return snapshotStore[Symbol.iterator]();
    },
    [Symbol.asyncIterator]: function (): AsyncIterableIterator<any> {
      const snapshotStore = this;
      return snapshotStore[Symbol.asyncIterator]();
    },
    [Symbol.toStringTag]: "SnapshotStore",
  },
];

export {
  snapshotStoreConfigs
};

  export type { InitializedConfig, UserConfig };


