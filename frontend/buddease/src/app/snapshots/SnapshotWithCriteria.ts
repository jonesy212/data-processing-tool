// SnapshotWithCriteria.ts
import { SnapshotEvent } from '@/app/typings/snapshotTypes';
import { createLatestVersion } from '@/app/versions/createLatestVersion';

import { BaseConfig, BaseDataEntity, BaseDataRoot, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { createMetadata } from '@/app/config/metadata/createMetadata';
import { MetadataEntriesType } from "@/app/config/StructuredMetadata";
import { CombinedEvents, SnapshotManager } from "@/app/hooks/useSnapshotManager";
import { Data } from '@/app/models/data/Data';
import { NotificationPosition, StatusType } from "@/app/models/data/StatusType";
import { Taggable } from '@/app/models/tracker/Tag';
import { CategoryProperties } from "@/app/pages/personas/ScenarioBuilder";
import { SearchCriteria } from "@/app/pages/searches/SearchCriteria";
import { Payload } from '@/app/server/database/Payload';
import { sharedMetadata } from '@/app/server/metadata/MetadataStateManager';
import { Snapshots, SnapshotsArray } from '@/app/snapshots/LocalStorageSnapshotStore';
import { Snapshot } from '@/app/snapshots/Snapshot';
import { SnapshotConfig } from '@/app/snapshots/SnapshotConfig';
import { SnapshotItem } from "@/app/snapshots/SnapshotList";
import { InitializedDelegate, SnapshotStoreOptions } from '@/app/snapshots/SnapshotStoreOptions';
import { SnapshotStoreProps } from '@/app/snapshots/SnapshotStoreProps';
import { useDataContext } from "@/app/state/context/DataContext";
import { NotificationType } from '@/app/features/support/UnifiedNotificationTypes'
import CalendarManagerStoreClass from "@/app/state/stores/CalendarManagerStore";
import { DataStore } from "@/app/state/stores/DataStore";
import { Subscriber } from "@/app/subscribers/Subscriber";
import { Callback } from "@/app/subscribers/subscribeToSnapshotsImplementation";
import { AnalysisTypeEnum } from "@/app/typings/AnalysisType";
import { handleSnapshotSuccess } from "./snapshotHandlers";
import SnapshotStore, { SnapshotStoreReference } from "./SnapshotStore";

import { SchemaField } from "@/app/config/metadata/SchemaField";
import { StructuredMetadata } from '@/app/config/StructuredMetadata';
import { Attachment } from '@/app/documents/attachment/Attachment';
import { ModifiedDate } from "@/app/documents/DocType";
import { Category } from "@/app/libraries/categories/generateCategoryProperties";
import { K, Meta, T } from '@/app/models/data/dataStoreMethods';
import { TagsRecord } from '@/app/models/tracker/Tag';
import { FilterCriteria } from "@/app/pages/searches/FilterCriteria";
import {
  SnapshotAttachment,
  SnapshotEntity,
  SnapshotEntityData,
  SnapshotEntityWithCriteria,
  SnapshotExcludedFields,
  SnapshotIncludedFields,
  SnapshotK,
  SnapshotMeta
} from "@/app/typings/entities/SnapshotEntity";
import { Version } from "@/app/versions/Version";
import { VersionData } from '@/app/versions/VersionData';
import { ExcludedFields } from '@/routing/Fields';
import { SubscriberCollection } from '@/subscribers/SubscriberCollection';
import { SnapshotOperation } from "../actions/SnapshotActions";
import { SnapshotStoreConfig } from "./SnapshotStoreConfig";

export type SortDirection = "asc" | "desc";

export interface SortSpec<T = string> {
  field: T;              // the property/key to sort on
  direction?: SortDirection; // default "asc" if not specified
  priority?: number;     // optional for multi-field sorts (lower = higher priority)
  nulls?: "first" | "last"; // control null/undefined ordering
}

// Make this a plain interface that mirrors the shape you actually need
interface SearchCriteriaBase {
  filters: FilterCriteria[];
  limit?: number;
  offset?: number;
  sort?: SortSpec[];
  // do NOT include analysisType here; you’ll add it explicitly below
}

interface SnapshotWithCriteriaContract<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> extends Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, SearchCriteriaBase {
  criteria: FilterCriteria;
  delegate: InitializedDelegate<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  analysisType?: AnalysisTypeEnum;
  events: CombinedEvents<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  subscribers?: SubscriberCollection<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
  tags?: string[] | TagsRecord<T>;
  timestamp: string | number | Date | undefined;
  snapshots?: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  snapshotStoreArray?: SnapshotStoreReference<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
}


type SnapshotWithCriteriaConfig<
  T extends BaseDataEntity = BaseDataRoot,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> = SnapshotStoreConfig<
  SnapshotWithCriteria<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  SnapshotWithCriteria<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  Meta,
  AttachmentType,
  ExcludedFields,
  IncludedFields
>;

// Define SnapshotWithCriteria type
type SnapshotWithCriteria<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> = Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> & Omit<SearchCriteria, 'analysisType'> & {
  criteria: FilterCriteria;
  delegate: InitializedDelegate<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  analysisType?: AnalysisTypeEnum;
  events?: CombinedEvents<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;  // Update as needed based on your schema
  subscribers?: SubscriberCollection<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];  // Update as needed based on your schema
  tags?: TagsRecord<T>| string[] | undefined;   // Update as needed based on your schema
  timestamp: string | number | Date | undefined;
  snapshots?: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  snapshotStores?: Map<number, SnapshotStoreReference<T, K, Meta>>; // not a Map
}

export class SnapshotStoreWithCriteria<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> extends SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  config: Promise<SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null>
  constructor(
    storeId: string,
    name: string,
    version: Version<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    schema: Record<string, SchemaField>,
    options: SnapshotStoreOptions<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    config: Promise<SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null>,
    operation: SnapshotOperation<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    expirationDate: Date,
    payload: Payload,
    callback: (data: T) => void,
    storeProps: SnapshotStoreProps<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    endpointCategory: string,
    initialState: InitializedState<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    category?: Category,
  ) {
    // Create a converted callback that performs the type guard
    const convertedCallback = (data: Data<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => {
      if (isCompatibleWithT(data)) {
        // Call the original callback with data cast to T
        callback(data as unknown as T);  // ← Use unknown first for safety
      } else {
        console.warn("Data is not compatible with the expected type T.");
      }
    };

    super({
      storeId,
      name,
      version,
      schema,
      options,
      config,
      operation,
      expirationDate,
      payload,
      callback: convertedCallback,
      storeProps,
      endpointCategory,
      initialState,
      category,
    });
    this.config = config;

    // Fix type predicate - check if data is compatible with Data<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
    const isCompatibleWithT = (data: Data<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): data is Data<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> => {
      // Basic property checks
      const hasId = typeof (data as any).id === "string";
      const hasName = typeof (data as any).title === "string";
      const hasType = (data as any).type !== undefined;
      
      // Check for a nested property
      const hasDetails = (data as any).details && typeof (data as any).details === "object";
      const hasItemsArray = Array.isArray((data as any).items) && (data as any).items.length > 0;

      // Combine all checks
      return hasId && hasName && hasType && hasDetails && hasItemsArray;
    };
  }
}


// Example data to be added to the store

const exampleSnapshotWithCriteria: SnapshotEntityWithCriteria = {
  deleted: false,
  initialState: {},
  isCore: false,
  initialConfig: {},
  onInitialize: () => {},
  taskIdToAssign: "",
  schema: {},
  currentCategory: "Sample Category",

  data: {
    id: "1",
    name: "Sample Snapshot",
    description: "Sample description",
    timestamp: new Date(),
    category: "Sample category",
  } as SnapshotEntityData,

  meta: createMetadata<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>({
    id: "2",
    name: "Sample Meta",
    description: "Sample meta description",
    timestamp: new Date(),
    category: "Sample meta category",
    author: "",
    keywords: [],
    baseConfig, sharedMetadata, sharedBaseData, taggable, keywords,
    permissions: [],
    customFields: {},
    versionData: {} as VersionData<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>,
    latestVersion: createLatestVersion<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>(),
    baseConfig: {} as BaseConfig<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>,
    sharedMetadata: sharedMetadata,
    sharedBaseData: {},
    taggable: {} as Taggable<SnapshotEntity>,
    metadataEntries: {} as MetadataEntriesType<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>,
  }),

  startDate: new Date(),
  endDate: new Date(),
  status: StatusType.Scheduled,
  analysisType: AnalysisTypeEnum.DEFAULT,
  configOption: "default config option",

  events: {
    onSnapshotAdded: (
      event,
      snapshot,
      snapshotId,
      subscribers
    ) => {},

    onSnapshotRemoved: (
      event,
      snapshot,
      snapshotId,
      subscribers,
      type,
      snapshotStore,
      dataItems,
      criteria,
      category,
      snapshotData
    ) => {},

    onSnapshotUpdated: (
      event,
      snapshotId,
      snapshot,
      data,
      events,
      snapshotStore,
      dataItems,
      newData,
      payload,
      store
    ) => {},

    removeSubscriber: (event, snapshotId, subscriberId) => {},

    onError: (
      event,
      error,
      snapshot,
      snapshotId,
      snapshotStore,
      dataItems,
      criteria,
      category
    ) => {},

    once: (event, callback) => {},

    addRecord: (event, record, callback) => {},

    unsubscribeSimple: (
      snapshotId,
      unsubscribeDetails,
      callback,
      ctx
    ) => {},

    subscribers: {},

    trigger: (
      event,
      snapshot,
      snapshotId,
      subscribers,
      type,
      snapshotData
    ) => {},

    initialConfig: {} as SnapshotConfig<
      SnapshotEntity,
      SnapshotK,
      SnapshotMeta,
      SnapshotAttachment,
      SnapshotExcludedFields,
      SnapshotIncludedFields
    >,

    records: {},

    onInitialize: () => {},

    on: (event, callback) => {},
    off: (event, callback, snapshotId, subscribers, type, snapshotData, unsubscribeDetails) => {},

    emit: (
      event,
      snapshot,
      snapshotId,
      subscribers,
      type,
      snapshotStore,
      dataItems,
      criteria,
      category
    ) => {},

    subscribe: (event, callback) => {},

    eventRecords: {
      "1": [
        {
          record: {} as CalendarManagerStoreClass<
            SnapshotEntity,
            SnapshotK,
            SnapshotMeta,
            SnapshotAttachment,
            SnapshotExcludedFields,
            SnapshotIncludedFields
          >,
          callback: () => {},
          action: "",
          timestamp: new Date(),
        },
      ],
    },

    eventIds: ["1"],

    callbacks: {
      onEventClick: [(snapshot) => (event) => console.log("onEventClick", event)],
      onEventDoubleClick: [(snapshot) => (event) => console.log("onEventDoubleClick", event)],
      onEventContextMenu: [(snapshot) => (event) => console.log("onEventContextMenu", event)],
      onEventDrop: [(snapshot) => (event) => console.log("onEventDrop", event)],
      onEventResize: [(snapshot) => (event) => console.log("onEventResize", event)],
      onEventSelect: [(snapshot) => (event) => console.log("onEventSelect", event)],
      onEventDeselect: [(snapshot) => (event) => console.log("onEventDeselect", event)],
      onEventCreate: [(snapshot) => (event) => console.log("onEventCreate", event)],
      onEventRemove: [(snapshot) => (event) => console.log("onEventRemove", event)],
      onEventReceive: [(snapshot) => (event) => console.log("onEventReceive", event)],
    },
  },

  subscribers: [
    {
      "1": {
        id: "1",
        name: "Sample Subscriber",
        email: "<EMAIL>",
        enabled: true,
        tags: ["Sample", "Subscriber"],
        subscription: {
          unsubscribe: () => {},
          portfolioUpdates: () => {},
          tradeExecutions: () => {},
          marketUpdates: () => {},
          triggerIncentives: () => {},
          communityEngagement: () => {},
          portfolioUpdatesLastUpdated: {
            value: new Date(),
            isModified: false,
          } as ModifiedDate,
          determineCategory: (data) => data ? "SomeCategory" : null,
        },
      },
    },
  ],

  tags: {
    "1": {
      id: "1",
      name: "Sample Tag",
      color: "#000000",
      description: "Sample tag description",
      enabled: true,
      tags: ["Sample", "Tag"],
      relatedTags: ["Sample", "Related", "Tag"],
      type: "",
      nulltype: "",
      createdBy: "",
      timestamp: 0,
    },
  },

  tagIds: ["1"],

  calendarEvents: {
    calendarEvents: {
      "1": {
        id: "1",
        title: "Sample Calendar Event",
        description: "Sample calendar event description",
        timestamp: new Date(),
        category: "Sample calendar event category",
        status: StatusType.Scheduled,
        callbacks: (snapshot) => ({
          onEventAdded: (event) => console.log("Event added:", event),
          onEventUpdated: (event) => console.log("Event updated:", event),
          onEventDeleted: (event) => console.log("Event deleted:", event),
          onEventMoved: (event) => console.log("Event moved:", event),
        }),
      },
    },
  },
};

// Handling type check for data
const data = exampleSnapshotWithCriteria.data;

if (data && typeof data !== 'object') {
  // Ensure `data` is `BaseData`
  const baseData: BaseDataEntity = data;
  console.log(baseData);
} else if (data instanceof Map) {
  // Handle the case where `data` is a Map
  console.log("Data is a Map and cannot be assigned directly to BaseDataEntity.");
} else {
  // Handle null or undefined cases
  console.log("Data is null or undefined.");
}

// Example of SnapshotStore with SnapshotWithCriteria
const exampleSnapshotStore: SnapshotStore<
  SnapshotEntity,
  SnapshotK,
  SnapshotMeta,
  SnapshotAttachment,
  SnapshotExcludedFields,
  SnapshotIncludedFields> = {
  id: "store1",
  title: "Sample Store",
  description: "This is a sample snapshot store",
  data: new Map<string, Snapshot<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>>(),
  snapshotId: "snapshot1",
  key: "key1",
  topic: "Sample Topic",
  date: new Date(),
  configOption: null,
  config: Promise.resolve(null),
  message: undefined,
  createdBy: "",
  type: undefined,
  subscribers: {} as Subscriber<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields,
    SnapshotIncludedFields>[] & Record<string, Subscriber<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>
  >,
  set: undefined,
  state: null,
  store: null,
  snapshots: [],
  snapshotConfig: [],
  dataStore: undefined,
  initialState: undefined,
  snapshotItems: [],
  nestedStores: [],
  dataStoreMethods: null,
  delegate: [],
  subscriberId: "",
  length: 0,
  content: "",
  value: 0,
  todoSnapshotId: "",
  events: undefined,
  snapshotStore: null,
  dataItems: [],
  newData: null,
  category: undefined,
  timestamp: undefined,
  async getData(
    id: string | number,
    snapshot: Snapshot<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>
  ): Promise<DataStore<SnapshotWithCriteria<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>[],
    SnapshotWithCriteria<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>[]>> {
    const { dataStore } = useDataContext();

    // Transform the dataStore's data to match the required type
    const transformedData: [string, SnapshotWithCriteria<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>][] =
      [...dataStore.data].map(([key, value]) => [
        key,
        {
          ...value,
          criteria: [], // Add criteria logic here
        } as SnapshotWithCriteria<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>,
      ]);

    const transformedDataStore: DataStore<
      SnapshotWithCriteria<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>[],
      SnapshotWithCriteria<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>[]
    > = {
      ...dataStore,
      data: new Map(transformedData), // Ensure transformed data is properly assigned
    };

    return Promise.resolve(transformedDataStore);
  },
  // Implement the required methods
  addSnapshotItem: function (item: SnapshotItem<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields> | SnapshotStoreConfig<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>): void {
    console.log("Adding snapshot item:", item);
    // Add logic to handle the snapshot item
  },

  addNestedStore: function (store: SnapshotStore<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>): void {
    console.log("Adding nested store:", store);
    // Add logic to handle the nested store
  },

  defaultSubscribeToSnapshots: function (
    snapshotId: string,
    callback: (snapshots: Snapshots<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>) => Subscriber<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields> | null,
    snapshot: Snapshot<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields> | null = null
  ): void {
    console.warn("Default subscription to snapshots is being used.");
    console.log(`Subscribed to snapshot with ID: ${snapshotId}`);

    // Simulate receiving a snapshot update
    setTimeout(() => {
      const data: BaseDataEntity = {
        id: "data1",
        title: "Sample Data",
        description: "Sample description",
        timestamp: new Date(),
        category: "Sample category",
        startDate: new Date(),
        endDate: new Date(),
        isScheduled: true,
        scheduled: {},
        status: "Pending",
        isActive: true,
        tags: {
          "1": {
            id: "1",
            name: "Important",
            color: "red",
            tags: [],
            description: "",
            enabled: false,
            type: "",
            relatedTags: [],
            nulltype: "",
            createdBy: "", 
            timestamp: new Date()
          },
        },
      };

      const snapshot: Snapshot<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields> = {
        id: snapshotId,
        data: data,
        timestamp: new Date(),

        unsubscribe: function (
          unsubscribeDetails: {
            userId: string;
            snapshotId: string;
            unsubscribeType: string;
            unsubscribeDate: Date;
            unsubscribeReason: string;
            unsubscribeData: any;
          },
          event: string,
          callback: Callback<Snapshot<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>>
        ): void {
          console.log("Unsubscribing from snapshot:", unsubscribeDetails);
        },

        fetchSnapshot: function (
          snapshotId: string,
          callback: (
            snapshotId: string,
            payload: FetchSnapshotPayload<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields> | undefined,
            snapshotStore: SnapshotStore<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>,
            payloadData: T | BaseData<any>,
            category: symbol | string | Category | undefined,
            categoryProperties: CategoryProperties | undefined,
            timestamp: Date,
            data: T,
            delegate: SnapshotWithCriteria<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>[]
          ) =>  Snapshot<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>
        ): void {
          console.log("Fetching snapshot:", snapshotId);
        },

        handleSnapshot: function (
          id: string,
          snapshotId: string | number | null,
          snapshot: BaseDataEntity,
          categoryProperties: CategoryProperties | undefined,
          callback: (snapshot: BaseDataEntity) => void,
          snapshots: SnapshotsArray<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>,
          type: string,
          event: SnapshotEvent<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>,
          category?: Category,
          snapshotContainer?: BaseDataEntity,
          snapshotStoreConfig?: SnapshotStoreConfig<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields> | null,
          storeConfigs?: SnapshotStoreConfig<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>[]
        ): Promise<Snapshot<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields> | null> {
          console.log("Handling snapshot:", snapshotId);
          return Promise.resolve(null);
        },
        events: undefined,
        meta: {} as StructuredMetadata<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>,
      };

      callback([snapshot]);
    }, 1000); // Simulate a delay before receiving the update
  },

  // Other required properties and methods
  subscribeToSnapshots: function (
    snapshotId: string,
    callback: (snapshots: Snapshots<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>) => Subscriber<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields> | null,
    snapshot: Snapshot<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields> | null = null
  ): void {
    console.log("Subscribing to snapshots:", snapshotId);
  },

  transformSubscriber: function (subscriber: Subscriber<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>): Subscriber<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields> {
    console.log("Transforming subscriber:", subscriber);
    return subscriber;
  },

  transformDelegate: function (delegate: SnapshotStoreConfig<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>): SnapshotStoreConfig<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields> {
    console.log("Transforming delegate:", delegate);
    return delegate;
  },

  initializedState: undefined,
  getAllKeys: undefined,
  getAllItems: undefined,
  addData: undefined,
  addDataStatus: undefined,
  removeData: undefined,
  updateData: undefined,
  updateDataTitle: undefined,
  updateDataDescription: undefined,
  updateDataStatus: undefined,
  addDataSuccess: undefined,
  getDataVersions: undefined,
  updateDataVersions: undefined,
  getBackendVersion: undefined,
  getFrontendVersion: undefined,
  fetchData: undefined,
  defaultSubscribeToSnapshot: undefined,
  handleSubscribeToSnapshot: undefined,
  snapshot: undefined,
  removeItem: undefined,

  getSnapshot: function (
    snapshot: (id: string) =>
      | Promise<{
        snapshotId: number;
        snapshotData: T;
        category?: Category;
        categoryProperties: CategoryProperties;
        dataStoreMethods: DataStore<T, BaseDataEntity>;
        timestamp: string | number | Date | undefined;
        id: string | number | undefined;
        snapshot: Snapshot<T, BaseDataEntity>;
        snapshotStore: SnapshotStore<T, BaseDataEntity>;
        data: T;
      }>
      | undefined
  ): Promise<SnapshotStore<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>> {
    throw new Error("Function not implemented.");
  },
  getSnapshotSuccess: undefined,
  getSnapshotId: undefined,
  getItem: undefined,
  setItem: undefined,
  addSnapshotFailure: undefined,
  getDataStore: undefined,
  addSnapshotSuccess: undefined,
  compareSnapshotState: undefined,
  deepCompare: undefined,
  shallowCompare: undefined,
  getDataStoreMethods: undefined,
  getDelegate: undefined,
  determineCategory: undefined,
  determinePrefix: function <T extends  BaseDataEntity>(
    snapshot: T | null | undefined, category: string
  ): string {
    throw new Error("Function not implemented.");
  },
  updateSnapshot: undefined,
  updateSnapshotSuccess: undefined,
  updateSnapshotFailure: undefined,
  removeSnapshot: undefined,
  clearSnapshots: undefined,
  addSnapshot: undefined,
  createSnapshot: undefined,
  createSnapshotSuccess: undefined,
  setSnapshotSuccess: undefined,
  setSnapshotFailure: undefined,
  createSnapshotFailure: undefined,
  updateSnapshots: undefined,
  updateSnapshotsSuccess: undefined,
  updateSnapshotsFailure: undefined,
  initSnapshot: undefined,
  takeSnapshot: undefined,
  takeSnapshotSuccess: undefined,
  takeSnapshotsSuccess: undefined,
  configureSnapshotStore: undefined,
  flatMap: function <U>(callback: (value: SnapshotStoreConfig<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>, index: number, array: SnapshotStoreConfig<Snapshot<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>, BaseDataEntity>[]) => U): U[] {
    throw new Error("Function not implemented.");
  },
  setData: undefined,
  getState: undefined,
  setState: undefined,
  validateSnapshot: undefined,
  handleSnapshot: function (
    id: string,
    snapshotId: string,
    snapshot: Snapshot<T, BaseDataEntity> | null,
    snapshotData: T,
    category?: Category,    callback: (snapshot: T) => void,
    snapshots: Snapshots<T, BaseDataEntity>,
    type: string,
    event: SnapshotEvent<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>,
    snapshotContainer?: T,
    snapshotStoreConfig?: SnapshotStoreConfig<T, BaseDataEntity>,
  ): void {
    throw new Error("Function not implemented.");
  },
  handleActions: function (): void {
    throw new Error("Function not implemented.");
  },
  setSnapshot: function (snapshot: Snapshot<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>): void {
    throw new Error("Function not implemented.");
  },
  transformSnapshotConfig: function <T extends BaseDataEntity>(
    config: SnapshotStoreConfig<BaseDataEntity, T>): SnapshotStoreConfig<BaseDataEntity, T> {
    throw new Error("Function not implemented.");
  },
  transformSnapshotStoreConfig: function <T extends BaseDataEntity>(
    config: SnapshotStoreConfig<BaseDataEntity, T>): SnapshotStoreConfig<BaseDataEntity, T> {
    throw new Error("Function not implemented.");
  },
  setSnapshotData: function (
    data: Map<string, Snapshot<T, BaseDataEntity>>,
    subscribers: Subscriber<any, any>[],
    snapshotData: Partial<SnapshotStoreConfig<T, BaseDataEntity>>
  ): void {
    throw new Error("Function not implemented.");
  },
  setSnapshots: function (
    snapshots: Snapshots<Data<T>>): void {
    throw new Error("Function not implemented.");
  },
  setSnapshotStoress: function (
    snapshots: SnapshotStore<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>[]): void {
    throw new Error("Function not implemented.");
  },
  clearSnapshot: function (): void {
    throw new Error("Function not implemented.");
  },
  mergeSnapshots: function (snapshots: Snapshots<BaseDataEntity>): void {
    throw new Error("Function not implemented.");
  },
  reduceSnapshots: function (): void {
    throw new Error("Function not implemented.");
  },
  sortSnapshots: function (): void {
    throw new Error("Function not implemented.");
  },
  filterSnapshots: function (): void {
    throw new Error("Function not implemented.");
  },
  mapSnapshots: function (): void {
    throw new Error("Function not implemented.");
  },
  findSnapshot: function (): void {
    throw new Error("Function not implemented.");
  },
  getSubscribers: function (subscribers: Subscriber<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>[],
    snapshots: Snapshots<BaseDataEntity>
  ): Promise<{
    subscribers: Subscriber<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>[];
    snapshots: Snapshots<BaseDataEntity>;
  }> {
    throw new Error("Function not implemented.");
  },
  notify: function (
    id: string,
    message: string,
    content: any, date: Date,
    type: NotificationType,
    notificationPosition?: NotificationPosition | undefined
  ): void {
    throw new Error("Function not implemented.");
  },
  notifySubscribers: function (subscribers: Subscriber<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>[], data: Partial<SnapshotStoreConfig<BaseDataEntity, any>>): Subscriber<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>[] {
    throw new Error("Function not implemented.");
  },
  subscribe: function (): void {
    throw new Error("Function not implemented.");
  },
  unsubscribe: function (): void {
    throw new Error("Function not implemented.");
  },
  fetchSnapshot: function (
    snapshotId: string,
    category?: Category,    timestamp: Date,
    snapshot: Snapshot<BaseDataEntity>,
    data: BaseDataEntity, 
    delegate: SnapshotStoreConfig<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>[]
  ): Promise<{ id: any; category: symbol | string | Category | undefined; timestamp: any; snapshot: Snapshot<BaseDataEntity>; data: BaseDataEntity; getItem?: (snapshot: Snapshot<BaseDataEntity>) => Snapshot<BaseDataEntity> | undefined; }> {
    throw new Error("Function not implemented.");
  },
  fetchSnapshotSuccess: (
    snapshotData: (
      snapshotManager: SnapshotManager<T, BaseDataEntity>,
      subscribers: Subscriber<T, BaseDataEntity>[],
      snapshot: Snapshot<T, BaseDataEntity>
    ) => void
  ) => {
    throw new Error("Function not implemented.");
  },
  fetchSnapshotFailure: function (
    snapshotId: string,
    snapshotManager: SnapshotManager<T, BaseDataEntity>,
    snapshot: Snapshot<T, BaseDataEntity>,
    date: Date | undefined,
    payload: { error: Error }
  ): void {
    throw new Error("Function not implemented.");
  },
  getSnapshots: function (category: string, data: Snapshots<BaseDataEntity>): void {
    throw new Error("Function not implemented.");
  },
  getAllSnapshots: function (
    data: (
      subscribers: Subscriber<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>[], 
      snapshots: Snapshots<BaseDataEntity>
    ) => Promise<Snapshots<BaseDataEntity>>
  ): void {
    throw new Error("Function not implemented.");
  },
  generateId: function (): string {
    throw new Error("Function not implemented.");
  },
  batchFetchSnapshots: function (
    subscribers: Subscriber<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>[],
    snapshots: Snapshots<BaseDataEntity>): void {
    throw new Error("Function not implemented.");
  },
  batchTakeSnapshotsRequest: function (
    criteria: Criteria,
    snapshotData: (
      snapshotIds: string[],
      snapshots: Snapshots<U, K, Meta>,
      subscribers: Subscriber<WrappedU, WrappedU, Meta, ExcludedFields>[]
    ) => Promise<{ subscribers: Subscriber<WrappedU, WrappedU, Meta, ExcludedFields>[] }>
  ): Promise<void> {
    throw new Error("Function not implemented.");
  },
  batchUpdateSnapshotsRequest: function (
    snapshotData: (
    subscribers: Subscriber<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>[]) => Promise<{
    subscribers: Subscriber<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>[];
    snapshots: Snapshots<BaseDataEntity>;
  }>): void {
    throw new Error("Function not implemented.");
  },
  batchFetchSnapshotsSuccess: function (subscribers: Subscriber<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>[], snapshots: Snapshots<BaseDataEntity>): void {
    throw new Error("Function not implemented.");
  },
  batchFetchSnapshotsFailure: function (
    date: Date,
    snapshotManager: SnapshotManager<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>, 
    snapshot: Snapshot<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>, 
    payload: { error: Error; }): void {
    throw new Error("Function not implemented.");
  },
  batchUpdateSnapshotsSuccess: function (subscribers: Subscriber<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>[], snapshots: Snapshots<BaseDataEntity>): void {
    throw new Error("Function not implemented.");
  },
  batchUpdateSnapshotsFailure: function (
    date: Date, 
    snapshotId: string, 
    snapshotManager: SnapshotManager<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>, 
    snapshot: Snapshot<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>, payload: { error: Error; }
  ): void {
    throw new Error("Function not implemented.");
  },
  batchTakeSnapshot: function (
    snapshotId: string,
    snapshotStore: SnapshotStore<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>,
    snapshots: Snapshots<BaseDataEntity>
  ): Promise<{ snapshots: Snapshots<BaseDataEntity>; }> {
    throw new Error("Function not implemented.");
  },
  handleSnapshotSuccess: handleSnapshotSuccess,
  [Symbol.iterator]: function (): IterableIterator<Snapshot<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>> {
    // implement iterator
    const snapshots = Array.from(this.data?.values() ?? []);
    let index = 0;
    return {
      next: () => {
        if (index < snapshots.length) {
          return {
            value: snapshots[index++] as Snapshot<BaseDataEntity>,
            done: false
          };
        } else {
          return {
            value: undefined,
            done: true
          };
        }
      },
      [Symbol.iterator]: function () { return this; }
    };
  }
};

export { data };
export type { SearchCriteriaBase, SnapshotWithCriteria, SnapshotWithCriteriaConfig, SnapshotWithCriteriaContract };

// Add example data to the store


// // Example usage
const baseData: BaseDataEntity = exampleSnapshotWithCriteria.data as BaseDataEntity;
console.log(baseData);





const newSnapshot: Snapshot<
  SnapshotEntity,
  SnapshotK,
  SnapshotMeta,
  SnapshotAttachment,
  SnapshotExcludedFields,
  SnapshotIncludedFields> = {
    data: baseData,
    meta: exampleSnapshotWithCriteria.meta,
    events: exampleSnapshotWithCriteria.events,
    snapshotStore: exampleSnapshotWithCriteria.snapshotStore,
    // snapshot: undefined,
    dataItems: [],
    newData: null,
    unsubscribe: exampleSnapshotWithCriteria.unsubscribe,
    fetchSnapshot: exampleSnapshotWithCriteria.fetchSnapshot,
    handleSnapshot: exampleSnapshotWithCriteria.handleSnapshot,
    getSnapshotId: exampleSnapshotWithCriteria.getSnapshotId,
    compareSnapshotState: exampleSnapshotWithCriteria.compareSnapshotState,
    snapshotStoreConfig: null,
    getSnapshotItems: undefined,
    defaultSubscribeToSnapshots: undefined,
    versionInfo: null,
    transformSubscriber: undefined,
    transformDelegate: undefined,
    initializedState: undefined,
    getAllKeys: undefined,
    getAllItems: undefined,
    addDataStatus: undefined,
    removeData: undefined,
    updateData: undefined,
    updateDataTitle: undefined,
    updateDataDescription: undefined,
    updateDataStatus: undefined,
    addDataSuccess: undefined,
    getDataVersions: undefined,
    updateDataVersions: undefined,
    getBackendVersion: undefined,
    getFrontendVersion: undefined,
    fetchData: undefined,
    defaultSubscribeToSnapshot: undefined,
    handleSubscribeToSnapshot: undefined,
    removeItem: undefined,
    getSnapshot: undefined,
    getSnapshotSuccess: undefined,
    setItem: undefined,
    getDataStore: async () => {},
    addSnapshotSuccess: undefined,
    deepCompare: undefined,
    shallowCompare: undefined,
    getDataStoreMethods: undefined,
    getDelegate: undefined,
    determineCategory: undefined,
    determinePrefix: function <T extends Data>(snapshot: T | null | undefined, category: string): string {
        throw new Error("Function not implemented.");
    },
    removeSnapshot: undefined,
    addSnapshotItem: undefined,
    addNestedStore: undefined,
    clearSnapshots: undefined,
    addSnapshot: undefined,
    createSnapshot: undefined,
    createInitSnapshot: undefined,
    setSnapshotSuccess: undefined,
    setSnapshotFailure: undefined,
    updateSnapshots: undefined,
    updateSnapshotsSuccess: undefined,
    updateSnapshotsFailure: undefined,
    initSnapshot: undefined,
    takeSnapshot: undefined,
    takeSnapshotSuccess: undefined,
    takeSnapshotsSuccess: undefined,
    flatMap: function <U extends Iterable<any>>(callback: (value: SnapshotStoreConfig<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>, index: number, array: SnapshotStoreConfig<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>[]) => U): U extends (infer I)[] ? I[] : U[] {
        throw new Error("Function not implemented.");
    },
    getState: undefined,
    setState: undefined,
    validateSnapshot: undefined,
    handleActions: undefined,
    setSnapshot: undefined,
    transformSnapshotConfig: function <T extends BaseDataEntity>(config: SnapshotStoreConfig<BaseDataEntity, T>): SnapshotStoreConfig<BaseDataEntity, T> {
        throw new Error("Function not implemented.");
    },
    setSnapshots: undefined,
    clearSnapshot: undefined,
    mergeSnapshots: undefined,
    reduceSnapshots: function <U>(callback: (acc: U, snapshot: Snapshot<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>) => U, initialValue: U): U | undefined {
        throw new Error("Function not implemented.");
    },
    sortSnapshots: undefined,
    filterSnapshots: undefined,
    findSnapshot: undefined,
    getSubscribers: undefined,
    notify: undefined,
    notifySubscribers: undefined,
    getSnapshots: undefined,
    getAllSnapshots: undefined,
    generateId: undefined,
    batchFetchSnapshots: undefined,
    batchTakeSnapshotsRequest: undefined,
    batchUpdateSnapshotsRequest: undefined,
    filterSnapshotsByStatus: undefined,
    filterSnapshotsByCategory: undefined,
    filterSnapshotsByTag: undefined,
    batchFetchSnapshotsSuccess: undefined,
    batchFetchSnapshotsFailure: undefined,
    batchUpdateSnapshotsSuccess: undefined,
    batchUpdateSnapshotsFailure: undefined,
    batchTakeSnapshot: undefined,
    handleSnapshotSuccess: undefined,
    eventRecords: null,
    getParentId: undefined,
    getChildIds: undefined,
    addChild: undefined,
    removeChild: undefined,
    getChildren: undefined,
    hasChildren: undefined,
    isDescendantOf: undefined,
    timestamp: undefined,
    getInitialState: undefined,
    getConfigOption: undefined,
    getTimestamp: undefined,
    getStores: undefined,
    getData: undefined,
    setData: undefined,
    addData: undefined,
    stores: null,
    getStore: undefined,
    addStore: undefined,
    mapSnapshot: undefined,
    mapSnapshots: undefined,
    removeStore: undefined,
    addSnapshotFailure: undefined,
    configureSnapshotStore: undefined,
    updateSnapshotSuccess: undefined,
    createSnapshotFailure: undefined,
    createSnapshotSuccess: undefined,
    createSnapshots: undefined,
    onSnapshot: undefined,
    onSnapshots: undefined,
    label: undefined
};



console.log(newSnapshot);
