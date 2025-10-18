// SnapshotContainer.ts
import { fetchData } from "@/api/ApiData";
import { handleApiError } from "@/app/api/ApiLogs";
import axiosInstance from '@/app/api/csrfToken';
import { endpoints } from "@/app/api/endpointConfigurations";
import { SnapshotCategory } from "@/app/api/getSnapshotEndpoint";
import { AuthenticationHeaders, createAuthenticationHeaders } from "@/app/api/headers/authenticationHeaders";
import createCacheHeaders from "@/app/api/headers/cacheHeaders";
import createContentHeaders from "@/app/api/headers/contentHeaders";
import generateCustomHeaders from "@/app/api/headers/customHeaders";
import createRequestHeaders from "@/app/api/headers/requestHeaders";
import * as snapshotApi from "@/app/api/SnapshotApi";
import addSnapshot,from "@/app/api/SnapshotApi";
import apiCallfrom "@/app/api/SnapshotApi";
import getSnapshotId from "@/app/api/SnapshotApi";
import handleOtherStatusCodes from "@/app/api/SnapshotApi";
import mergeSnapshots from "@/app/api/SnapshotApi";
import updateSnapshotStore from "@/app/api/SnapshotApi";
import { SnapshotWithData } from "@/app/calendar/CalendarApp";
import { ContentItem } from '@/app/cards/DummyCardLoader';
import { Version } from "@/app/versions/Version";
import { NotificationType, NotificationTypeEnum } from "@/app/context/NotificationContext";
import { Attachment } from "@/app/documents/attachment/Attachment";
import { SnapshotManager, useSnapshotManager } from "@/app/hooks/useSnapshotManager";
import { Category } from "@/app/libraries/categories/generateCategoryProperties";
import { Content } from "@/app/models/content/AddContent";
import { BaseData, DataDetails } from '@/app/models/data/Data';
import { K } from '@/app/models/data/dataStoreMethods';
import { NotificationPosition, StatusType } from "@/app/models/data/StatusType";
import { CategoryProperties } from "@/app/pages/personas/ScenarioBuilder";
import { CriteriaType } from '@/app/pages/searches/CriteriaType';
import { criteria } from "@/app/pages/searches/FilterCriteria";
import { DataStore } from "@/app/projects/DataAnalysisPhase/DataProcessing/DataStore";
import { DataStoreMethods } from "@/app/projects/DataAnalysisPhase/DataProcessing/DataStoreMethods";
import { SharedMetadata } from '@/app/shared/SharedMetadata';
import { convertStoreId } from '@/app/snapshots/convertSnapshot';
import { CoreSnapshot } from "@/app/snapshots/CoreSnapshot";
import { isSnapshotsArray } from '@/app/snapshots/createSnapshotStoreOptions';
import { Snapshots, SnapshotsArray, SnapshotsObject, SnapshotUnion } from '@/app/snapshots/LocalStorageSnapshotStore';
import { snapshot, Snapshot } from '@/app/snapshots/Snapshot';
import { SnapshotOperationType } from "@/app/snapshots/SnapshotActions";
import { addSnapshotSuccess, batchFetchSnapshots, batchFetchSnapshotsFailure, batchFetchSnapshotsRequest, batchFetchSnapshotsSuccess, batchTakeSnapshot, batchTakeSnapshotsRequest, batchUpdateSnapshots, batchUpdateSnapshotsFailure, batchUpdateSnapshotsRequest, createSnapshotFailure, createSnapshotStore, createSnapshotSuccess, fetchSnapshot, getAllSnapshots, initSnapshot, notifySubscribers, onSnapshot, onSnapshots, updateSnapshot, updateSnapshotFailure, updateSnapshots, updateSnapshotsSuccess, updateSnapshotSuccess } from '@/app/snapshots/snapshotHandlers';
import SnapshotStore, { initialState, SnapshotStoreReference } from '@/app/snapshots/SnapshotStore';
import initialState from '@/app/snapshots/SnapshotStore';
import { snapshotStoreConfigInstance } from '@/app/snapshots/snapshotStoreConfigInstance';
import { SnapshotContext, SnapshotSubscriberManagement } from '@/app/snapshots/SnapshotSubscriberManagement';
import { data, SnapshotWithCriteria, TagsRecord } from '@/app/snapshots/SnapshotWithCriteria';
import { Callback } from '@/app/subscribers/subscribeToSnapshotsImplementation';
import { clearSnapshot } from "@/app/state/redux/slices/SnapshotSlice";
import CalendarManagerStoreClass from "@/app/state/stores/CalendarManagerStore";
import { Subscriber } from "@/app/subscribers/Subscriber";
import { SubscriberCollection } from '@/app/subscribers/SubscriberCollection';
import { Subscription } from "@/app/subscriptions/Subscription";
import { RealtimeDataItem } from '@/app/typings/realtimeTypes';
import { isSnapshotDataType, notify } from "@/app/utils/snapshotUtils";
import { VersionData } from "@/app/versions/VersionData";
import { Tag } from '@/appp/models/tracker/Tag';
import { AppConfig, getAppConfig } from "@/config/AppConfig";
import configData from "@/config/endpoints/configData";
import { UnifiedMetadata } from "@/config/MetaDataOptions";
import { StructuredMetadata } from '@/config/StructuredMetadata';
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/config/BaseConfig';
import { FetchSnapshotPayload, fetchSnapshotPayload } from '@/app/snapshots/FetchSnapshotPayload';
import { BaseEntity } from '@/app/routing/FuzzyMatch';
import { SnapshotEvent } from "@/typings/eventTypes";
import { SnapshotStoreProps } from '@/app/snapshots/useSnapshotStore';
import { AxiosError } from "axios";
import { createSnapshot } from "./createSnapshot";
import { flatMap } from "./defaultSnapshotBuilder";
import { getData, setData } from "./methods/dataMethods";
import { createSnapshotStores } from "./newStoreUtils";
import { SnapshotOperation } from "./SnapshotActions";
import { ConfigureSnapshotStorePayload, createSnapshotConfig, SnapshotConfig } from "./SnapshotConfig";
import { CustomSnapshotData, SnapshotData, SnapshotRelationships } from "./SnapshotData";
import { SnapshotDataParams } from "./SnapshotDataParams";
import { SnapshotMethods } from "./SnapshotMethods";
import { clearSnapshotFailure, configureSnapshot, getChildIds, getParentId, getSnapshot, getSnapshotById, getSnapshotContainer, getSnapshotItems, getSnapshots, handleSnapshot, mapSnapshots, removeSnapshot, takeSnapshot } from "./snapshotOperations";
import { InitializedConfig, SnapshotStoreConfig } from "./SnapshotStoreConfig";
import { InitializedData, SnapshotStoreOptions } from "./SnapshotStoreOptions";

const API_BASE_URL = endpoints.snapshots


type SnapshotDataType<
  T extends BaseDataEntity = BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> =
  | Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>
  | SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  | SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  | Map<string, SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>
  | Promise<{ snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> }> 
  | undefined;

type ItemUnion = ContentItem | K; // Assuming K extends Data

interface SnapshotBase<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> extends BaseEntity<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>  {
  data: InitializedData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null | undefined;
  items: ItemUnion[];
  contentItems?: ContentItem[];
  config: Promise<SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null>;
  timestamp: string | number | Date | undefined;
  currentcategory?: Category;
  snapshotId?: string | number | null;
  title?: string;
  tags?: TagsRecord<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | string[] | undefined;
  key?: string;
  state?: SnapshotsArray<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null;
  topic?: string;
  find: (id: string) => SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined;
  version: string | Version<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  // Category-related methods
  setSnapshotCategory: (id: string, newCategory: string | Category) => void;
  getSnapshotCategory: (id: string) => Category | undefined;
}


interface SnapshotContainerData<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> extends SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
SharedMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  data: InitializedData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined;
  items: ItemUnion[];
  config: Promise<SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null>;
  timestamp?: string | number | Date;
  currentcategory?: Category;
  excludedFields?: ExcludedFields;
}

type SnapshotContainerType<  
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T,
> = Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;


interface SnapshotContainer<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> extends SnapshotBase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  SnapshotMethods<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  SnapshotRelationships<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  SnapshotContainerData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  name?: string | undefined;
  category?: Category;
  mappedSnapshotData: Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> | undefined;
  subscriberManagement?: SnapshotSubscriberManagement<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  criteria: CriteriaType | undefined,
  content?: string | Content<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined;
  snapshotCategory?: SnapshotCategory<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  snapshotSubscriberId?: string | null | undefined;
  taskIdToAssign?: string;
  initialConfig: InitializedConfig | {};
  removeSubscriber: any;
  onError: (error: any) => void;
  data: InitializedData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null | undefined;
  snapshotsArray?: SnapshotsArray<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  snapshotsObject?: SnapshotsObject<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  snapshots?: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  currentcategory?: Category;
  snapshotContent?: string | Content<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined; // Add snapshotContent if needed
  snapshotId?: string | number | null;
  snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null;
  snapshotContainer?: SnapshotContainerType<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  createSnapshotData(params: {
    id: string | number | null;
    data: InitializedData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
    snapshotManager: SnapshotManager<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
    // ... other parameters as an object
  }): Promise<SnapshotDataType<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>;
  snapshotSubscriberManagement?: SnapshotSubscriberManagement<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
}

// Utility method to initialize properties of SnapshotContainer
function initializeSnapshotContainer <
  T extends BaseDataEntity = BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  snapshotContainer: Partial<SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
  initialValues: Partial<SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>
): SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  
  // Use spread operator for the cleanest approach
  return {
    ...snapshotContainer,
    ...initialValues
  } as SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
}

// Example of initializing SnapshotContainer within a method
function configureSnapshotContainer<  
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T  
>(
    container: Partial<SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
    config: Partial<SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>
): SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  // Use the initializeSnapshotContainer utility to set the properties
  return initializeSnapshotContainer(container, config);
}

export const snapshotContainer = async <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  snapshotId: string,
  storeId: number,
  config: Promise<SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null>,
  snapConfig?: SnapshotConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
): Promise<SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> => {
  try {
    // Step 1: Resolve configuration
    const resolvedConfig = await config;
    if (!resolvedConfig) {
      throw new Error("SnapshotStoreConfig could not be resolved");
    }

    // Step 2: Create or fetch the snapshot manager
    const snapshotManager = new SnapshotManager<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>();

    // Step 3: Initialize a snapshot store for this container
    const snapshotStore = new SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>(resolvedConfig);

    // Step 4: Create the snapshot using your reusable builder
    const baseData = snapConfig?.data || ({} as T);
    const baseMeta = snapConfig?.metaMap || new Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>();
    const snapshot = await createCompleteSnapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>(
      baseData,
      baseMeta,
      snapshotId,
      snapConfig?.category,
      snapshotStore,
      snapshotManager,
      resolvedConfig,
      true, // subscribed by default
      snapConfig?.storeProps,
      snapConfig?.storeOptions
    );

    // Step 5: Build SnapshotContainer
    const container: SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = {
      id: snapshotId,
      storeId,
      snapshot,
      store: snapshotStore,
      manager: snapshotManager,
      config: resolvedConfig,
      initialized: true,
      getSnapshot: () => snapshot,
      getConfig: () => resolvedConfig,
      updateSnapshot: (updatedData: Partial<T>) => {
        snapshot.data = { ...snapshot.data, ...updatedData };
        return snapshot;
      },
    };

    return container;
  } catch (error) {
    console.error("Error creating snapshot container:", error);
    throw error;
  }
};


export type {
  ItemUnion, SnapshotBase,
  SnapshotContainer, SnapshotContainerData, SnapshotContainerType, SnapshotDataType
};

