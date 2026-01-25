// SnapshotWithCriteria.ts
import { BaseData } from '@/core/models/data/Data';
import { FetchSnapshotPayload } from '@/core/snapshots/FetchSnapshotPayload';
import { processSnapshot, Snapshot } from '@/core/snapshots/Snapshot';
import type { SubscriberCallbackType } from "@/core/subscriptions/Subscription";
import { UnsubscribeDetails } from '@/core/typings/eventHandlers/eventTypes';
import { RealtimeDataItem } from '@/core/typings/realtimeTypes';
import { SnapshotEvent } from '@/core/typings/snapshotTypes';

import { CalendarEvent } from '@/core/calendar/CalendarEvent';
import { BaseConfig, BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import { createMeta } from "@/core/config/metadata/createMeta";
import { createMetadata } from '@/core/config/metadata/createMetadata';
import { SchemaField } from "@/core/config/metadata/SchemaField";
import { sharedMetadata } from '@/core/config/MetadataStateManager';
import { MetadataEntriesType } from '@/core/config/StructuredMetadata';
import { Attachment } from '@/core/documents/attachment/Attachment';
import type { ModifiedDate } from "@/core/documents/DocType";
import type { NotificationType } from '@/core/features/support/UnifiedNotificationTypes';
import { CombinedEvents, SnapshotManager } from "@/core/hooks/useSnapshotManager";
import { UpdateSnapshotPayload } from '@/core/interfaces/payload/payloadTypes';
import { Category } from "@/core/libraries/categories/generateCategoryProperties";
import { T } from '@/core/models/data/dataStoreMethods';
import { NotificationPosition, StatusType } from "@/core/models/data/StatusType";
import { Taggable } from '@/core/models/tracker/Tag';
import { CategoryProperties } from "@/core/pages/personas/ScenarioBuilder";
import { CriteriaType } from '@/core/pages/searches/CriteriaType';
import { FilterCriteria } from "@/core/pages/searches/FilterCriteria";
import { SearchCriteria } from "@/core/pages/searches/SearchCriteria";
import { handleSnapshotSuccess } from '@/core/snapshots/index';
import { Snapshots, SnapshotsArray } from '@/core/snapshots/LocalStorageSnapshotStore';
import { SnapshotConfig } from '@/core/snapshots/SnapshotConfig';
import { SnapshotData } from '@/core/snapshots/SnapshotData';
import { SnapshotItem } from "@/core/snapshots/SnapshotList";
import SnapshotStore from "@/core/snapshots/SnapshotStore";
import { SnapshotStoreConfig } from "@/core/snapshots/SnapshotStoreConfig";
import { InitializedDelegate, SnapshotStoreOptions } from '@/core/snapshots/SnapshotStoreOptions';
import { SnapshotStoreProps } from '@/core/snapshots/SnapshotStoreProps';
import { SnapshotStoreReference } from "@/core/snapshots/SnapshotStoreReference";
import { SnapshotContext } from '@/core/snapshots/SnapshotSubscriberManagement';
import { useDataContext } from "@/core/state/context/DataContext";
import CalendarManagerStoreClass from "@/core/state/stores/CalendarManagerStore";
import { InitializedState } from '@/core/state/stores/DataStore';
import { Subscriber } from "@/core/subscribers/Subscriber";
import { SubscriberCollection } from '@/core/subscribers/SubscriberCollection';
import { Callback } from "@/core/subscribers/subscribeToSnapshotsImplementation";
import { AnalysisTypeEnum } from "@/core/typings/AnalysisType";
import {
    SnapshotAttachment,
    SnapshotEntity,
    SnapshotEntityData,
    SnapshotEntityWithCriteria,
    SnapshotExcludedFields,
    SnapshotIncludedFields,
    SnapshotK,
    SnapshotMeta
} from "@/core/typings/entities/SnapshotEntity";
import { createLatestVersion } from '@/core/versions/createLatestVersion';
import { Version } from "@/core/versions/Version";
import { VersionData } from '@/core/versions/VersionData';

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
  T extends BaseDataEntity = BaseDataEntity,
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
  tags?: TagsRecord<T> | string[] | undefined;   // Update as needed based on your schema
  timestamp: string | number | Date | undefined;
  snapshots?: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  snapshotStores?: Map<number, SnapshotStoreReference<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>; // not a Map
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



// Define the example with proper typing
const exampleSnapshotWithCriteria: SnapshotEntityWithCriteria = {
  deleted: false,
  initialState: {},
  isCore: false,
  initialConfig: {},
  onInitialize: () => { },
  taskIdToAssign: "",
  schema: {},
  currentCategory: "Sample Category",
  startDate: new Date(),
  endDate: new Date(),
  status: StatusType.Scheduled,
  analysisType: AnalysisTypeEnum.DEFAULT,
  configOption: "default config option",
  subscribers: [],

  data: {
    id: "1",
    name: "Sample Snapshot",
    description: "Sample description",
    timestamp: new Date(),
    category: "Sample category",
  } as SnapshotEntityData,

  meta: createMeta<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>({
    id: "2",
    name: "Sample Meta",
    description: "Sample meta description",
    timestamp: new Date(),
    category: "Sample meta category",
    author: "",
    keywords: [],
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


  events: {
    onSnapshotAdded: (
      event: string,
      ctx: SnapshotContext<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>
    ) => {
      // Extract data from context if needed
      const { snapshot, snapshotId, subscribers, snapshotStore, dataItems, criteria, category } = ctx;
      console.log("Snapshot added:", { 
        event, 
        snapshotId, 
        category,
        snapshotTitle: snapshot?.title,
        storeId: snapshotStore?.id
      });
    },

    onSnapshotRemoved: (
      event: string,
      ctx: SnapshotContext<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields> & { 
        type: string;
        snapshotData: SnapshotData<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>;
      }
    ) => {
      // Extract data from context
      const { snapshot, snapshotId, subscribers, snapshotStore, dataItems, criteria, category, type, snapshotData } = ctx;
      console.log("Snapshot removed:", { 
        event, 
        snapshotId, 
        type,
        category,
        snapshotTitle: snapshot?.title
      });
    },

    onSnapshotUpdated: (
      event: string,
      ctx: SnapshotContext<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields> & {
        snapshotId: string;
        data: Map<string, Snapshot<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>>;
        events: Record<string, CalendarManagerStoreClass<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>[]>;
        store: SnapshotStore<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>;
        newData: Snapshot<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>;
        payload: UpdateSnapshotPayload<SnapshotEntity>;
      }
    ) => {
      // Extract data from context
      const { snapshotId, data, events, store, newData, payload } = ctx;
      console.log("Snapshot updated:", { 
        event, 
        snapshotId, 
        payload: payload?.type,
        storeId: store?.id,
        dataSize: data?.size
      });
    },

    removeSubscriber: (
      event: string,
      snapshotId: string,
      subscriberId: Snapshot<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>
    ) => {
      // Note: removeSubscriber doesn't follow the BaseSnapshotEventHandlers pattern
      // You might need to adapt this or create a separate handler
      console.log("Subscriber removed:", { event, snapshotId });
    },
    onError: (
      event: string,
      error: Error,
      snapshot: Snapshot<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>,
      snapshotId: string,
      snapshotStore: SnapshotStore<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>,
      dataItems: RealtimeDataItem<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>[],
      criteria: SnapshotWithCriteria<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>,
      category: Category
    ) => {
      console.error("Snapshot error:", { event, error, snapshotId });
    },

    once: (
      event: string,
      callback: (snapshot: Snapshot<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>) => void
    ) => {
      console.log("Once event registered:", event);
    },

    addRecord: (
      event: string,
      record: CalendarManagerStoreClass<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>,
      callback: (snapshot: CalendarManagerStoreClass<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>) => void
    ) => {
      console.log("Record added:", { event, record });
      if (callback) callback(record);
    },

    unsubscribeSimple: (
      snapshotId: string,
      unsubscribeDetails: UnsubscribeDetails,
      callback: SubscriberCallbackType<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields> | null,
      ctx?: SnapshotContext<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>
    ) => {
      console.log("Unsubscribed:", { snapshotId, unsubscribeDetails });
      if (callback) callback({ snapshotId, ...unsubscribeDetails });
    },


    trigger: (
      event: string,
      snapshot: Snapshot<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>,
      snapshotId: string,
      subscribers: SubscriberCollection<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>,
      type: string,
      snapshotData: SnapshotData<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>
    ) => {
      console.log("Event triggered:", { event, snapshotId, type });
    },

    initialConfig: {} as SnapshotConfig<
      SnapshotEntity,
      SnapshotK,
      SnapshotMeta,
      SnapshotAttachment,
      SnapshotExcludedFields,
      SnapshotIncludedFields
    >,

    records: {},

    onInitialize: () => {
      console.log("Events initialized");
    },

    on: (
      event: string,
      callback: (snapshot: Snapshot<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>) => void
    ) => {
      console.log("Event listener added:", event);
    },

    off: (
      event: string,
      callback: (snapshot: Snapshot<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>) => void,
      snapshotId: string,
      subscribers: SubscriberCollection<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>,
      type: string,
      snapshotData: SnapshotData<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>,
      unsubscribeDetails: UnsubscribeDetails
    ) => {
      console.log("Event listener removed:", event);
    },

    emit: (
      event: string,
      snapshot: Snapshot<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>,
      snapshotId: string,
      subscribers: SubscriberCollection<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>,
      type: string,
      snapshotStore: SnapshotStore<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>,
      dataItems: RealtimeDataItem<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>[],
      criteria: SnapshotWithCriteria<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>,
      category: Category
    ) => {
      console.log("Event emitted:", { event, snapshotId, type });
    },

    subscribe: (
      event: string,
      callback: (snapshot: Snapshot<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>) => void
    ) => {
      console.log("Subscribed to event:", event);
      return () => console.log("Unsubscribed from:", event);
    },

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
          callback: () => {
            console.log("Callback executed");
          },
          action: "sample-action",
          timestamp: new Date(),
        },
      ],
    },

    eventIds: ["1"],

    callbacks: {
      onEventClick: [
        (_snapshot: Snapshot<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>) =>
          (event: CalendarEvent<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>) => console.log("onEventClick", event)
      ],
      onEventDoubleClick: [
        (_snapshot: Snapshot<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>) =>
          (event: CalendarEvent<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>) => console.log("onEventDoubleClick", event)
      ],
      onEventContextMenu: [
        (_snapshot: Snapshot<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>) =>
          (event: CalendarEvent<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>) => console.log("onEventContextMenu", event)
      ],
      onEventDrop: [
        (snapshot: Snapshot<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>) =>
          (event: CalendarEvent<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>) => {
            console.log("onEventDrop", event);
            // Actually use the snapshot
            if (snapshot.category === 'important') {
              // Special handling for important snapshots
              console.log("Important snapshot dropped!");
            }
          }
      ],
      onEventResize: [
        (_snapshot: Snapshot<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>) =>
          (event: CalendarEvent<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>) => console.log("onEventResize", event)
      ],
      onEventSelect: [
        (snapshot: Snapshot<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>) =>
          (event: CalendarEvent<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>) => {
            console.log("onEventSelect", event);
            // Update selected state in snapshot
            console.log("Selected snapshot:", snapshot.id);
          }
      ],
      onEventDeselect: [
        (_snapshot: Snapshot<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>) =>
          (event: CalendarEvent<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>) => console.log("onEventDeselect", event)
      ],
      onEventCreate: [
        (_snapshot: Snapshot<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>) =>
          (event: CalendarEvent<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>) => console.log("onEventCreate", event)
      ],
      onEventRemove: [
        (snapshot: Snapshot<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>) =>
          (event: CalendarEvent<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>) => {
            console.log("onEventRemove", event);
            // Clean up snapshot resources
            console.log("Cleaning up snapshot:", snapshot.id);
          }
      ],
      onEventReceive: [
        (_snapshot: Snapshot<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>) =>
          (event: CalendarEvent<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>) => console.log("onEventReceive", event)
      ],
    },
  },

  subscribers: [
    {
      "1": {
        id: "1",
        name: "Sample Subscriber",
        email: "sample@example.com",
        enabled: true,
        tags: ["Sample", "Subscriber"],
        subscription: {
          unsubscribe: () => console.log("Unsubscribed"),
          portfolioUpdates: () => console.log("Portfolio updates sent"),
          tradeExecutions: () => console.log("Trade executions sent"),
          marketUpdates: () => console.log("Market updates sent"),
          triggerIncentives: () => console.log("Trigger incentives sent"),
          communityEngagement: () => console.log("Community engagement sent"),
          portfolioUpdatesLastUpdated: {
            value: new Date(),
            isModified: false,
          } as ModifiedDate,
          determineCategory: (data: SnapshotEntityData) => data ? "SomeCategory" : null,
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
      type: "custom",
      nulltype: "none",
      createdBy: "system",
      timestamp: Date.now(),
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
        callbacks: (snapshot: Snapshot<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>) => ({
          onEventAdded: (event: CalendarEvent<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>) => console.log("Event added:", event),
          onEventUpdated: (event: CalendarEvent<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>) => console.log("Event updated:", event),
          onEventDeleted: (event: CalendarEvent<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>) => console.log("Event deleted:", event),
          onEventMoved: (event: CalendarEvent<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>) => console.log("Event moved:", event),
        }),
      },
    },
  },
};

// Also fix the snapshotHandler function to avoid implicit 'any' types
const snapshotHandler = (
  id: string | number,
  snapshotId: string | null,
  snapshot: Snapshot<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields> | null,
  snapshotData: SnapshotEntity,
  callback: (snapshot: SnapshotEntity) => void,
  snapshots: SnapshotsArray<SnapshotEntity>,
  type: string,
  event: Event,
  category?: Category,
  snapshotContainer?: SnapshotEntity,
  snapshotStoreConfig?: SnapshotStoreConfig<SnapshotEntity, SnapshotK, StructuredMetadata<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>, never> | null
): Promise<Snapshot<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields> | null> => {

  // Dynamically create metadata for the current area
  const metaData = createMetadata<SnapshotEntity, SnapshotK, SnapshotMeta, ExcludeKeys<SnapshotEntity, SnapshotK>>({
    area: type === 'create' ? 'dashboard' : 'profile',
    tags: [],
    overrides: {
      updatedAt: new Date(),
      updatedBy: 'event-handler',
    },
  });

  if (!snapshotStoreConfig) {
    throw new Error('Snapshot store configuration is missing.');
  }

  try {
    if (snapshot) {
      const transformedSnapshot = processSnapshot<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>({
        ...snapshot,
        ...snapshotData
      });

      callback(transformedSnapshot);

      return Promise.resolve(
        createSnapshot(
          snapshotData,
          metaData,
          snapshotId,
          transformedSnapshot,
          category,
          null, // snapshotStore parameter - should be provided from context
          snapshotStoreConfig
        )
      );
    } else {
      // Handle case when snapshot is null
      console.log("No snapshot provided, handling snapshot container");
      if (snapshotContainer) {
        callback(snapshotContainer);
      }
    }
  } catch (error) {
    console.error(`Error handling snapshot: ${error}`);
    return Promise.reject(new Error("Failed to handle snapshot"));
  }
  return Promise.resolve(null);
};

// Also fix the notify usage issue
const { notify } = useNotification();
// Use notify with proper types
const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
  notify({
    message,
    type,
    duration: 3000,
  });
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
  data: {} as Data<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>,
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
    
    try {
      const { dataStore } = useDataContext();
      
      // Safely extract data from dataStore, checking if it's iterable
      let sourceData: [string, any][] = [];
      
      if (dataStore.data && typeof dataStore.data[Symbol.iterator] === 'function') {
        // If data is iterable (like Map), convert to array
        sourceData = Array.from(dataStore.data as Iterable<[string, any]>);
      } else if (dataStore.data && typeof dataStore.data === 'object' && !Array.isArray(dataStore.data)) {
        // If data is a plain object, convert to entries
        sourceData = Object.entries(dataStore.data);
      } else {
        // Fallback: create empty array
        console.warn("dataStore.data is not iterable or is null/undefined");
        sourceData = [];
      }

      // Transform the data to match the required type
      const transformedData: [string, SnapshotWithCriteria<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>][] =
        sourceData.map(([key, value]) => [
          key,
          {
            ...value,
            criteria: [], // Add criteria logic here
            // Ensure all required properties for SnapshotWithCriteria are present
            ...(value.id ? { id: value.id } : {}),
            ...(value.timestamp ? { timestamp: value.timestamp } : {}),
            ...(value.category ? { category: value.category } : {}),
            // Add missing required properties for Data type
            latestVersion: value.latestVersion || createLatestVersion<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>(),
            // Add other required Data properties if needed
            ...(value.data ? { data: value.data } : {}),
            ...(value.meta ? { meta: value.meta } : {}),
            ...(value.delegate ? { delegate: value.delegate } : {}),
            ...(value.events ? { events: value.events } : {}),
            ...(value.subscribers ? { subscribers: value.subscribers } : {}),
            ...(value.tags ? { tags: value.tags } : {}),
            ...(value.snapshots ? { snapshots: value.snapshots } : {}),
            ...(value.snapshotStores ? { snapshotStores: value.snapshotStores } : { snapshotStores: new Map() }),
            analysisType: value.analysisType || AnalysisTypeEnum.DEFAULT,
          } as SnapshotWithCriteria<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>,
        ]);

      // Create the transformed data store with all required Data properties
      const transformedDataStore: DataStore<
        SnapshotWithCriteria<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>[],
        SnapshotWithCriteria<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>[]
      > = {
        ...dataStore,
        // Ensure data has the proper Data type structure
        data: {
          // Spread any existing data properties
          ...(typeof dataStore.data === 'object' && dataStore.data !== null ? dataStore.data : {}),
          // Create the Map with transformed data
          entries: new Map(transformedData),
          // Add the required latestVersion property
          latestVersion: dataStore.data?.latestVersion || createLatestVersion<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>(),
          // Add other required Data properties
          id: dataStore.data?.id || 'default-data-id',
          timestamp: dataStore.data?.timestamp || new Date(),
          category: dataStore.data?.category || 'default-category',
          // Ensure the data has Symbol.iterator
          [Symbol.iterator]: function() {
            const entries = Array.from(this.entries || []);
            let index = 0;
            return {
              next: () => {
                if (index < entries.length) {
                  return { value: entries[index++], done: false };
                }
                return { value: undefined, done: true };
              }
            };
          }
        } as Data<SnapshotWithCriteria<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>[],
            SnapshotWithCriteria<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>[],
            DefaultMeta<SnapshotWithCriteria<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>[],
            SnapshotWithCriteria<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>[]>,
            Attachment,
            never,
            keyof SnapshotWithCriteria<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>[]
          >,
      };

      return Promise.resolve(transformedDataStore);
    } catch (error) {
      console.error("Error in getData:", error);
      
      // Return a default/fallback DataStore
      const defaultData: Data<SnapshotWithCriteria<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>[],
        SnapshotWithCriteria<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>[],
        DefaultMeta<SnapshotWithCriteria<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>[],
        SnapshotWithCriteria<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>[]>,
        Attachment,
        never,
        keyof SnapshotWithCriteria<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>[]
      > = {
        id: 'default-data-id',
        timestamp: new Date(),
        category: 'default-category',
        latestVersion: createLatestVersion<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>(),
        entries: new Map<string, SnapshotWithCriteria<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>>(),
        [Symbol.iterator]: function() {
          const entries = Array.from(this.entries || []);
          let index = 0;
          return {
            next: () => {
              if (index < entries.length) {
                return { value: entries[index++], done: false };
              }
              return { value: undefined, done: true };
            }
          };
        }
      };

      const fallbackDataStore: DataStore<
        SnapshotWithCriteria<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>[],
        SnapshotWithCriteria<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>[]
      > = {
        data: defaultData,
        // Add other required DataStore properties
        id: 'fallback-store-id',
        storeId: 0,
        name: 'Fallback Store',
        version: { major: 1, minor: 0, patch: 0 } as Version<SnapshotWithCriteria<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>>,
        schema: {},
        options: {} as SnapshotStoreOptions<SnapshotWithCriteria<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>>,
        snapshots: [],
        snapshotConfig: [],
        snapshotItems: [],
        nestedStores: [],
        delegate: {} as InitializedDelegate<SnapshotWithCriteria<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>>,
        initialState: undefined,
        getData: async () => ({ data: defaultData } as any),
        addData: () => {},
        removeData: () => {},
        updateData: () => {},
        // Add other required methods with stub implementations
      };

      return Promise.resolve(fallbackDataStore);
    }
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
            payloadData: SnapshotEntity | BaseData<any>,
            category: symbol | string | Category | undefined,
            categoryProperties: CategoryProperties | undefined,
            timestamp: Date,
            data: SnapshotEntity,
            delegate: SnapshotWithCriteria<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>[]
          ) => Snapshot<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>
        ): void {
          console.log("Stub fetch snapshot");
        },


        handleSnapshot: function (
          id: string,
          snapshotId: string | number | null,
          snapshot: Snapshot<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>,
          categoryProperties: CategoryProperties | undefined,
          callback: (snapshot: Snapshot<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>) => void,
          snapshots: SnapshotsArray<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>,
          type: string,
          event: SnapshotEvent<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>,
          category?: Category,
          snapshotContainer?: BaseDataEntity,
          snapshotStoreConfig?: SnapshotStoreConfig<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields> | null,
          storeConfigs?: SnapshotStoreConfig<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>[]
        ): Promise<Snapshot<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields> | null> {
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
        dataStoreMethods: DataStore<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>;
        timestamp: string | number | Date | undefined;
        id: string | number | undefined;
        snapshot: Snapshot<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>;
        snapshotStore: SnapshotStore<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>;
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
  determinePrefix: function <T extends BaseDataEntity>(
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
  flatMap: function <U>(callback: (value: SnapshotStoreConfig<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>, index: number, array: SnapshotStoreConfig<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>[]) => U): U[] {
    throw new Error("Function not implemented.");
  },
  setData: undefined,
  getState: undefined,
  setState: undefined,
  vacidateSnapshot: (snapshotId: string, snapshot: Snapshot<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>) => false,
  handleSnapshot: function (
    id: string,
    snapshotId: string,
    snapshot: Snapshot<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields> | null,
    snapshotData: T,
    callback: (snapshot: T) => void,
    snapshots: Snapshots<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>,
    type: string,
    event: SnapshotEvent<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>,
    category?: Category,
    snapshotContainer?: T,
    snapshotStoreConfig?: SnapshotStoreConfig<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>,
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
    data: Map<string, Snapshot<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>>,
    subscribers: Subscriber<any, any>[],
    snapshotData: Partial<SnapshotStoreConfig<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>>
  ): void {
    throw new Error("Function not implemented.");
  },
  setSnapshots: function (
    snapshots: Snapshots<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>): void {
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
    snapshots: Snapshots<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>
  ): Promise<{
    subscribers: Subscriber<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>[];
    snapshots: Snapshots<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>;
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
    timestamp: Date,
    snapshot: Snapshot<BaseDataEntity>,
    data: BaseDataEntity,
    delegate: SnapshotStoreConfig<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>[],
    category?: Category, 
  ): Promise<{ id: any; category: symbol | string | Category | undefined; timestamp: any; snapshot: Snapshot<BaseDataEntity>; data: BaseDataEntity; getItem?: (snapshot: Snapshot<BaseDataEntity>) => Snapshot<BaseDataEntity> | undefined; }> {
    throw new Error("Function not implemented.");
  },
  fetchSnapshotSuccess: (
    snapshotData: (
      snapshotManager: SnapshotManager<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>,
      subscribers: Subscriber<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>[],
      snapshot: Snapshot<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>
    ) => void
  ) => {
    throw new Error("Function not implemented.");
  },
  fetchSnapshotFailure: function (
    snapshotId: string,
    snapshotManager: SnapshotManager<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>,
    snapshot: Snapshot<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>,
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
      snapshots: Snapshots<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>
    ) => Promise<Snapshots<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>>
  ): void {
    throw new Error("Function not implemented.");
  },
  generateId: function (): string {
    throw new Error("Function not implemented.");
  },
  batchFetchSnapshots: function (
    subscribers: Subscriber<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>[],
    snapshots: Snapshots<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>): void {
    throw new Error("Function not implemented.");
  },
  batchTakeSnapshotsRequest: function (
    criteria: CriteriaType,
    snapshotData: (
      snapshotIds: string[],
      snapshots: Snapshots<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>,
      subscribers: Subscriber<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>[]
    ) => Promise<{ subscribers: Subscriber<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>[] }>
  ): Promise<void> {
    throw new Error("Function not implemented.");
  },
  batchUpdateSnapshotsRequest: function (
    snapshotData: (
      subscribers: Subscriber<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>[]) => Promise<{
        subscribers: Subscriber<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>[];
        snapshots: Snapshots<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>;
      }>): void {
    throw new Error("Function not implemented.");
  },
  batchFetchSnapshotsSuccess: function (subscribers: Subscriber<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>[], snapshots: Snapshots<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>): void {
    throw new Error("Function not implemented.");
  },
  batchFetchSnapshotsFailure: function (
    date: Date,
    snapshotManager: SnapshotManager<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>,
    snapshot: Snapshot<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>,
    payload: { error: Error; }): void {
    throw new Error("Function not implemented.");
  },
  batchUpdateSnapshotsSuccess: function (subscribers: Subscriber<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>[], snapshots: Snapshots<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>): void {
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
    snapshots: Snapshots<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>
  ): Promise<{ snapshots: Snapshots<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>; }> {
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
            value: snapshots[index++] as Snapshot<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>,
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

