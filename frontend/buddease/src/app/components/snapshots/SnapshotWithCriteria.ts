import { createLatestVersion } from '@/app/components/versions/createLatestVersion';
import { SnapshotContext } from './SnapshotSubscriberManagement';

import { CalendarEvent } from '@/app/components/calendar/CalendarEvent';
import { UnsubscribeDetails } from '@/app/components/event/DynamicEventHandlerExample';
import { Taggable } from '@/app/components/models/CommonData';
import { Tag } from '@/app/components/models/tracker/Tag';
import { InitializedState } from "@/app/components/projects/DataAnalysisPhase/DataProcessing/DataStore";
import { Callback, SnapshotConfig, SnapshotData, SnapshotItem, SnapshotStoreProps } from '@/app/components/snapshots';
import CalendarManagerStoreClass from "@/app/components/state/stores/CalendarManagerStore";
import { BaseConfig, BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/app/configs/BaseConfig';
import { createMetadata } from '@/app/configs/metadata/createMetadata';
import { sharedMetadata } from "@/app/configs/metadata/createMetadataState";
import { MetadataEntriesType } from "@/app/configs/StructuredMetadata";
import { useDataContext } from "@/app/context/DataContext";
import { NotificationType } from '@/app/context/NotificationContext';
import { Payload, UpdateSnapshotPayload } from '@/server/database/Payload';
import { CategoryProperties } from "../../pages/personas/ScenarioBuilder";
import { CombinedEvents, SnapshotManager } from "../hooks/useSnapshotManager";
import { Data } from "../models/data/Data";
import { NotificationPosition, StatusType } from "../models/data/StatusType";
import { AnalysisTypeEnum } from "../projects/DataAnalysisPhase/AnalysisType";
import { DataStore } from "../projects/DataAnalysisPhase/DataProcessing/DataStore";
import { SearchCriteria } from "../routing/SearchCriteria";
import { InitializedDelegate, SnapshotStoreOptions } from '../snapshots/SnapshotStoreOptions';
import { Subscriber } from "../users/Subscriber";
import { Snapshots, SnapshotsArray } from "./LocalStorageSnapshotStore";
import { Snapshot } from "./Snapshot";
import { handleSnapshotSuccess } from "./snapshotHandlers";
import SnapshotStore, { SnapshotStoreReference } from "./SnapshotStore";

import { K, Meta, T } from "@/app/components/models/data/dataStoreMethods";
import { StructuredMetadata } from '@/app/configs/StructuredMetadata';
import { FilterCriteria } from "@/app/pages/searchs/FilterCriteria";
import { SchemaField } from "@/server/database/SchemaField";
import { Attachment } from '../documents/Attachment/attachment';
import { ModifiedDate } from "../documents/DocType";
import { Category } from "../libraries/categories/generateCategoryProperties";
import { RealtimeDataItem } from '../models/realtime/RealtimeData';
import { ExcludedFields } from '../routing/Fields';
import { SubscriberCallbackType } from '../subscriptions/Subscription';
import { SubscriberCollection } from '../users/SubscriberCollection';
import Version from "../versions/Version";
import { VersionData } from '../versions/VersionData';
import { SnapshotOperation } from "./SnapshotActions";
import { SnapshotEvents } from './SnapshotEvents';
import { SnapshotStoreConfig } from "./SnapshotStoreConfig";


export type SortDirection = "asc" | "desc";

export interface SortSpec<T = string> {
  field: T;              // the property/key to sort on
  direction?: SortDirection; // default "asc" if not specified
  priority?: number;     // optional for multi-field sorts (lower = higher priority)
  nulls?: "first" | "last"; // control null/undefined ordering
}

// Define BaseData interface
interface TagsRecord<
  T extends BaseDataEntity = BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>
> {
  [key: string]: Tag<T, K, Meta, AttachmentType, ExcludedFields>;
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
  delegate: InitializedDelegate<T, K, Meta, ExcludedFields>;
  analysisType?: AnalysisTypeEnum;
  events: CombinedEvents<T, K, Meta, ExcludedFields>;
  subscribers?: SubscriberCollection<T, K, Meta, ExcludedFields>[];
  tags?: TagsRecord<T, K, Meta, AttachmentType, ExcludedFields> | string[] | undefined;
  timestamp: string | number | Date | undefined;
  snapshots?: Snapshots<T, K, Meta, ExcludedFields, IncludedFields>;
  snapshotStoreArray?: SnapshotStoreReference<T, K, Meta>[];
}

// Define SnapshotWithCriteria type
type SnapshotWithCriteria<
  T extends BaseDataEntity, 
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>
> = Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> & Omit<SearchCriteria, 'analysisType'> & {
  criteria: FilterCriteria;
  delegate: InitializedDelegate<T, K, Meta, ExcludedFields>;
  analysisType?: AnalysisTypeEnum;
  events?: CombinedEvents<T, K, Meta, ExcludedFields>;  // Update as needed based on your schema
  subscribers?: SubscriberCollection<T, K, Meta, ExcludedFields>[];  // Update as needed based on your schema
  tags?: TagsRecord<T, K, Meta, ExcludedFields> | string[] | undefined;   // Update as needed based on your schema
  timestamp: string | number | Date | undefined;
  snapshots?: Snapshots<T, K, Meta, ExcludedFields, IncludedFields>;
  snapshotStores?: Map<number, SnapshotStoreReference<T, K, Meta>>; // not a Map
}

export class SnapshotStoreWithCriteria<
  T extends  BaseDataEntity,  
  K extends T = T,  
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
> extends SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  config: Promise<SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null>
  constructor(
    storeId: string,
    name: string,
    version: Version<T, K, Meta, ExcludedFields>,
    schema: Record<string, SchemaField>,
    options: SnapshotStoreOptions<T, K, Meta, ExcludedFields>,
    category: Category | undefined,    config: Promise<SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null>,
    operation: SnapshotOperation<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    expirationDate: Date,
    payload: Payload,
    callback: (data: T) => void,
    storeProps: SnapshotStoreProps<T, K, Meta, ExcludedFields>,
    endpointCategory: string,
    initialState: InitializedState<T, K, Meta, ExcludedFields>
  ) {
    // Create a converted callback that performs the type guard
    const convertedCallback = (data: Data<T, K, Meta>) => {
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
      category,
      config,
      operation,
      expirationDate,
      payload,
      callback: convertedCallback,
      storeProps,
      endpointCategory,
      initialState
    });
    this.config = config;

    // Fix type predicate - check if data is compatible with Data<T, K, Meta>
    const isCompatibleWithT = (data: Data<T, K, Meta>): data is Data<T, K, Meta> => {
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
const exampleSnapshotWithCriteria: SnapshotWithCriteria<T, K, Meta, ExcludedFields> = {
  deleted, initialState, isCore, initialConfig, 
  onInitialize, taskIdToAssign, schema, currentCategory,




  data: {
    id: "1",
    title: "Sample Data",
    description: "Sample description",
    timestamp: new Date(),
    category: "Sample category",
  },
  
  meta: createMetadata<BaseDataEntity, BaseDataEntity>({
    id: "2",
    title: "Sample Meta",
    description: "Sample meta description",
    timestamp: new Date(),
    category: "Sample meta category",
    author: "",
    keywords: [],
    permissions: [],
    customFields: [],
    versionData: {} as VersionData<T, K, Meta, ExcludedFields>,
    latestVersion: createLatestVersion<T, K, Meta, ExcludedFields>(),
    baseConfig: {} as BaseConfig<T, K, StructuredMetadata<T, K>, ExcludedFields>,
    sharedMetadata: sharedMetadata,
    sharedBaseData: {},
    taggable: {} as Taggable<T, K, Meta, ExcludedFields>,
    metadataEntries: {} as MetadataEntriesType<T, K, Meta, ExcludedFields>,

  }),
  startDate: new Date(),
  endDate: new Date(),
  status: StatusType.Scheduled,
  analysisType: AnalysisTypeEnum.DEFAULT, // Adjust as needed
  configOption: "default config option",
  events: {
    onSnapshotAdded: (
      event: string,
      snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      snapshotId: string,
      subscribers: SubscriberCollection<T, K, Meta, ExcludedFields>
    ) => {},
    
    onSnapshotRemoved: (
        event: string,
        snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
        snapshotId: string,
        subscribers: SubscriberCollection<T, K, Meta, ExcludedFields>,
        type: string,
        snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
        dataItems: RealtimeDataItem<T, K, Meta, ExcludedFields>[],
        criteria: SnapshotWithCriteria<T, K, Meta, ExcludedFields>,
        category: Category,
        snapshotData: SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
      ) => {},
    onSnapshotUpdated: (
        event: string,
        snapshotId: string,
        snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
        data: Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
        events: Record<string, CalendarManagerStoreClass<T, K, Meta, ExcludedFields>[]>,
        snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
        dataItems: RealtimeDataItem<T, K, Meta, ExcludedFields>[],
        newData: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
        payload: UpdateSnapshotPayload<T>,
        store: SnapshotStore<any, K>
      ) => {},
    removeSubscriber: (
      event: string,
      snapshotId: string,
      subscriberId: string
    ) => { },
    
    onError: (
      event: string,
      error: Error,
      snapshot: Snapshot<T, K, StructuredMetadata<T, K>, never>,
      snapshotId: string,
      snapshotStore: SnapshotStore<T, K, StructuredMetadata<T, K>, never>,
      dataItems: RealtimeDataItem<T, K, Meta, ExcludedFields>[],
      criteria: SnapshotWithCriteria<T, K, Meta, ExcludedFields>,
      category: Category) => { },
    once: (
      event: string,
      callback: (snapshot: Snapshot<T, K, StructuredMetadata<T, K>, never>
    ) => void) => {},
    addRecord: (
      event: string,
      record: CalendarManagerStoreClass<T, K, Meta, ExcludedFields>,
      callback: (snapshot: CalendarManagerStoreClass<T, K, Meta, ExcludedFields>) => void
    ) => {
      
    },
    unsubscribeSimple: (
    snapshotId: string,
    unsubscribeDetails: UnsubscribeDetails,
    callback: SubscriberCallbackType<T, K, Meta, ExcludedFields> | null,
    ctx?: SnapshotContext<T, K, Meta, ExcludedFields>
    ) => {

    },
   
    subscribers: {},
    trigger: (event: string | CombinedEvents<T, K, Meta, ExcludedFields> | SnapshotEvents<T, K, Meta, ExcludedFields>,
      snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      snapshotId: string,
      subscribers: SubscriberCollection<T, K, Meta, ExcludedFields>,
      type: string,
      snapshotData: SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
    ) => { },
    initialConfig: {} as SnapshotConfig<T, K, Meta, ExcludedFields>,
    records: {} as Record<string, CalendarManagerStoreClass<T, K, Meta, ExcludedFields>[]>,
   
    onInitialize: () => {},
    on: (event: string, callback: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void) => {},
    off: (event: string | number,
      callback: Callback<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>, 
      snapshotId: string,
      subscribers: SubscriberCollection<T, K, Meta, ExcludedFields>,
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
    ) => { },

    emit: (
      event: string,
      snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, 
      snapshotId: string,
      subscribers: SubscriberCollection<T, K, Meta, ExcludedFields>, 
      type: string,
      snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      dataItems: RealtimeDataItem<T, K, Meta, ExcludedFields>[], 
      criteria: SnapshotWithCriteria<T, K, Meta, ExcludedFields>, 
      category: Category
    ) => { },
   
    subscribe: (event: string, callback: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void) => {},
    event: "",
    unsubscribeDetails: {
    userId: "string",
    snapshotId: "string",
    unsubscribeType: "string",
    unsubscribeDate: new Date(),
    unsubscribeReason: "string",
    unsubscribeData: ""
  },
    callback: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => {},
   
    eventRecords: {
      "1": [{
        // id: "1",
        // title: "Sample Event",
        // description: "Sample event description",
        // timestamp: new Date(),
        // category: "Sample event category",
        // status: StatusType.Scheduled,
        // tags: ["Sample", "Event"],

        // todo properly update the record
        record: {} as CalendarManagerStoreClass<T, K, Meta, ExcludedFields>,
        callback: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => {},
        action: "", 
        timestamp: new Date(),
        
      },
    
    ],
    },
    eventIds: ["1"],
    callbacks: {
      onEventClick: [(snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => {
        return (event: CalendarEvent<T, K, Meta, ExcludedFields>) => {
          console.log("onEventClick", event);
        };
      }],
      onEventDoubleClick: [(snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => {
        return (event: CalendarEvent<T, K, Meta, ExcludedFields>) => {
          console.log("onEventDoubleClick", event);
        };
      }],
      onEventContextMenu: [(snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => {
        return (event: CalendarEvent<T, K, Meta, ExcludedFields>) => {
          console.log("onEventContextMenu", event);
        };
      }],
      onEventDrop: [(snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => {
        return (event: CalendarEvent<T, K, Meta, ExcludedFields>) => {
          console.log("onEventDrop", event);
        };
      }],
      onEventResize: [(snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => {
        return (event: CalendarEvent<T, K, Meta, ExcludedFields>) => {
          console.log("onEventResize", event);
        };
      }],
      onEventSelect: [(snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => {
        return (event: CalendarEvent<T, K, Meta, ExcludedFields>) => {
          console.log("onEventSelect", event);
        };
      }],
      onEventDeselect: [(snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => {
        return (event: CalendarEvent<T, K, Meta, ExcludedFields>) => {
          console.log("onEventDeselect", event);
        };
      }],
      onEventCreate: [(snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => {
        return (event: CalendarEvent<T, K, Meta, ExcludedFields>) => {
          console.log("onEventCreate", event);
        };
      }],
      onEventRemove: [(snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => {
        return (event: CalendarEvent<T, K, Meta, ExcludedFields>) => {
          console.log("onEventRemove", event);
        };
      }],
      onEventReceive: [(snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => {
        return (event: CalendarEvent<T, K, Meta, ExcludedFields>) => {
          console.log("onEventReceive", event);
        };
      }],
    },
  },
  subscribers: [{
    "1": {
      id: "1",
      name: "Sample Subscriber",
      email: "<EMAIL>",
      enabled: true,
      tags: ["Sample", "Subscriber"],
      subscription: {
        unsubscribe: () => { },
        portfolioUpdates: () => { },
        tradeExecutions: () => { },
        marketUpdates: () => { },
        triggerIncentives: () => { },
        communityEngagement: () => { },
        portfolioUpdatesLastUpdated: {
          value: new Date(),
          isModified: false,
        } as ModifiedDate,
        determineCategory: (data: string | Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null | undefined) => {
          // Implement the logic to determine the category
          return data ? "SomeCategory" : null;
        },
        // Add other required properties here
      }
    },
  }],
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
      timestamp: 0
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
        status: StatusType,
        callbacks: (
          snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => {
          return {
            onEventAdded: (event: CalendarEvent) => {
              console.log("Event added: ", event);
            },
            onEventUpdated: (event: CalendarEvent) => {
              console.log("Event updated: ", event);
            },
            onEventDeleted: (event: CalendarEvent) => {
              console.log("Event deleted: ", event);
            },
            onEventMoved: (event: CalendarEvent) => {
              console.log("Event moved: ", event);
            }

          }
        }
      }
    }
  }
}

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
const exampleSnapshotStore: SnapshotStore<BaseDataEntity, BaseDataEntity> = {
  id: "store1",
  title: "Sample Store",
  description: "This is a sample snapshot store",
  data: new Map<string, Snapshot<BaseDataEntity, BaseDataEntity>>(),
  snapshotId: "snapshot1",
  key: "key1",
  topic: "Sample Topic",
  date: new Date(),
  configOption: null,
  config: Promise.resolve(null),
  message: undefined,
  createdBy: "",
  type: undefined,
  subscribers: {} as Subscriber<BaseDataEntity, BaseDataEntity>[] & Record<string, Subscriber<BaseDataEntity, BaseDataEntity>>,
  set: undefined,
  state: null,
  store: null,
  snapshots: [],
  snapshotConfig: [],
  dataStore: undefined,
  initialState: undefined,
  snapshotItems: [],
  nestedStores: [],
  dataStoreMethods: undefined,
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
    snapshot: Snapshot<BaseDataEntity, BaseDataEntity>
  ): Promise<DataStore<SnapshotWithCriteria<BaseDataEntity, BaseDataEntity>[],
    SnapshotWithCriteria<BaseDataEntity, BaseDataEntity>[]>> {
    const { dataStore } = useDataContext();

    // Transform the dataStore's data to match the required type
    const transformedData: [string, SnapshotWithCriteria<BaseDataEntity, BaseDataEntity>][] =
      [...dataStore.data].map(([key, value]) => [
        key,
        {
          ...value,
          criteria: [], // Add criteria logic here
        } as SnapshotWithCriteria<BaseDataEntity, BaseDataEntity>,
      ]);

    const transformedDataStore: DataStore<
      SnapshotWithCriteria<BaseDataEntity, BaseDataEntity>[],
      SnapshotWithCriteria<BaseDataEntity, BaseDataEntity>[]
    > = {
      ...dataStore,
      data: new Map(transformedData), // Ensure transformed data is properly assigned
    };

    return Promise.resolve(transformedDataStore);
  },
  // Implement the required methods
  addSnapshotItem: function (item: SnapshotItem<BaseDataEntity, BaseDataEntity> | SnapshotStoreConfig<BaseDataEntity, BaseDataEntity>): void {
    console.log("Adding snapshot item:", item);
    // Add logic to handle the snapshot item
  },

  addNestedStore: function (store: SnapshotStore<BaseDataEntity, BaseDataEntity>): void {
    console.log("Adding nested store:", store);
    // Add logic to handle the nested store
  },

  defaultSubscribeToSnapshots: function (
    snapshotId: string,
    callback: (snapshots: Snapshots<BaseDataEntity, BaseDataEntity>) => Subscriber<BaseDataEntity, BaseDataEntity> | null,
    snapshot: Snapshot<BaseDataEntity, BaseDataEntity> | null = null
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

      const snapshot: Snapshot<BaseDataEntity, BaseDataEntity> = {
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
          callback: Callback<Snapshot<BaseDataEntity, BaseDataEntity>>
        ): void {
          console.log("Unsubscribing from snapshot:", unsubscribeDetails);
        },

        fetchSnapshot: function (
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
          ) =>  Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
        ): void {
          console.log("Fetching snapshot:", snapshotId);
        },

        handleSnapshot: function (
          id: string,
          snapshotId: string | number | null,
          snapshot: BaseDataEntity,
          category: Category | undefined,
          categoryProperties: CategoryProperties | undefined,
          callback: (snapshot: BaseDataEntity) => void,
          snapshots: SnapshotsArray<BaseDataEntity, BaseDataEntity>,
          type: string,
          event: SnapshotEvent<T, K, Meta, ExcludedFields>,
          snapshotContainer?: BaseDataEntity,
          snapshotStoreConfig?: SnapshotStoreConfig<BaseDataEntity, BaseDataEntity> | null,
          storeConfigs?: SnapshotStoreConfig<BaseDataEntity, BaseDataEntity>[]
        ): Promise<Snapshot<BaseDataEntity, BaseDataEntity> | null> {
          console.log("Handling snapshot:", snapshotId);
          return Promise.resolve(null);
        },
        events: undefined,
        meta: {} as StructuredMetadata<BaseDataEntity, BaseDataEntity>,
      };

      callback([snapshot]);
    }, 1000); // Simulate a delay before receiving the update
  },

  // Other required properties and methods
  subscribeToSnapshots: function (
    snapshotId: string,
    callback: (snapshots: Snapshots<BaseDataEntity, BaseDataEntity>) => Subscriber<BaseDataEntity, BaseDataEntity> | null,
    snapshot: Snapshot<BaseDataEntity, BaseDataEntity> | null = null
  ): void {
    console.log("Subscribing to snapshots:", snapshotId);
  },

  transformSubscriber: function (subscriber: Subscriber<BaseDataEntity, BaseDataEntity>): Subscriber<BaseDataEntity, BaseDataEntity> {
    console.log("Transforming subscriber:", subscriber);
    return subscriber;
  },

  transformDelegate: function (delegate: SnapshotStoreConfig<BaseDataEntity, BaseDataEntity>): SnapshotStoreConfig<BaseDataEntity, BaseDataEntity> {
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
        category: Category | undefined;
        categoryProperties: CategoryProperties;
        dataStoreMethods: DataStore<T, BaseDataEntity>;
        timestamp: string | number | Date | undefined;
        id: string | number | undefined;
        snapshot: Snapshot<T, BaseDataEntity>;
        snapshotStore: SnapshotStore<T, BaseDataEntity>;
        data: T;
      }>
      | undefined
  ): Promise<SnapshotStore<BaseDataEntity, BaseDataEntity>> {
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
  flatMap: function <U>(callback: (value: SnapshotStoreConfig<BaseDataEntity, BaseDataEntity>, index: number, array: SnapshotStoreConfig<Snapshot<BaseDataEntity, BaseDataEntity>, BaseDataEntity>[]) => U): U[] {
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
    category: Category | undefined,    callback: (snapshot: T) => void,
    snapshots: Snapshots<T, BaseDataEntity>,
    type: string,
    event: SnapshotEvent<T, K, Meta, ExcludedFields>,
    snapshotContainer?: T,
    snapshotStoreConfig?: SnapshotStoreConfig<T, BaseDataEntity>,
  ): void {
    throw new Error("Function not implemented.");
  },
  handleActions: function (): void {
    throw new Error("Function not implemented.");
  },
  setSnapshot: function (snapshot: Snapshot<BaseDataEntity, BaseDataEntity>): void {
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
    snapshots: SnapshotStore<BaseDataEntity, BaseDataEntity>[]): void {
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
  getSubscribers: function (subscribers: Subscriber<BaseDataEntity, BaseDataEntity>[],
    snapshots: Snapshots<BaseDataEntity>
  ): Promise<{
    subscribers: Subscriber<BaseDataEntity, BaseDataEntity>[];
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
  notifySubscribers: function (subscribers: Subscriber<BaseDataEntity, BaseDataEntity>[], data: Partial<SnapshotStoreConfig<BaseDataEntity, any>>): Subscriber<BaseDataEntity, BaseDataEntity>[] {
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
    category: Category | undefined,    timestamp: Date,
    snapshot: Snapshot<BaseDataEntity>,
    data: BaseDataEntity, 
    delegate: SnapshotStoreConfig<BaseDataEntity, BaseDataEntity>[]
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
      subscribers: Subscriber<BaseDataEntity, BaseDataEntity>[], 
      snapshots: Snapshots<BaseDataEntity>
    ) => Promise<Snapshots<BaseDataEntity>>
  ): void {
    throw new Error("Function not implemented.");
  },
  generateId: function (): string {
    throw new Error("Function not implemented.");
  },
  batchFetchSnapshots: function (
    subscribers: Subscriber<BaseDataEntity, BaseDataEntity>[],
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
    subscribers: Subscriber<BaseDataEntity, BaseDataEntity>[]) => Promise<{
    subscribers: Subscriber<BaseDataEntity, BaseDataEntity>[];
    snapshots: Snapshots<BaseDataEntity>;
  }>): void {
    throw new Error("Function not implemented.");
  },
  batchFetchSnapshotsSuccess: function (subscribers: Subscriber<BaseDataEntity, BaseDataEntity>[], snapshots: Snapshots<BaseDataEntity>): void {
    throw new Error("Function not implemented.");
  },
  batchFetchSnapshotsFailure: function (
    date: Date,
    snapshotManager: SnapshotManager<T, K, Meta, ExcludedFields>, 
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, 
    payload: { error: Error; }): void {
    throw new Error("Function not implemented.");
  },
  batchUpdateSnapshotsSuccess: function (subscribers: Subscriber<BaseDataEntity, BaseDataEntity>[], snapshots: Snapshots<BaseDataEntity>): void {
    throw new Error("Function not implemented.");
  },
  batchUpdateSnapshotsFailure: function (
    date: Date, 
    snapshotId: string, 
    snapshotManager: SnapshotManager<T, K, Meta, ExcludedFields>, 
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, payload: { error: Error; }
  ): void {
    throw new Error("Function not implemented.");
  },
  batchTakeSnapshot: function (
    snapshotId: string,
    snapshotStore: SnapshotStore<BaseDataEntity, BaseDataEntity>,
    snapshots: Snapshots<BaseDataEntity>
  ): Promise<{ snapshots: Snapshots<BaseDataEntity>; }> {
    throw new Error("Function not implemented.");
  },
  handleSnapshotSuccess: handleSnapshotSuccess,
  [Symbol.iterator]: function (): IterableIterator<Snapshot<BaseDataEntity, BaseDataEntity>> {
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
export type { SearchCriteriaBase, SnapshotWithCriteria, SnapshotWithCriteriaContract, TagsRecord };

// Add example data to the store


// // Example usage
const baseData: BaseDataEntity = exampleSnapshotWithCriteria.data as BaseDataEntity;
console.log(baseData);





const newSnapshot: Snapshot<BaseDataEntity, BaseDataEntity> = {
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
    flatMap: function <U extends Iterable<any>>(callback: (value: SnapshotStoreConfig<BaseDataEntity, BaseDataEntity>, index: number, array: SnapshotStoreConfig<BaseDataEntity, BaseDataEntity>[]) => U): U extends (infer I)[] ? I[] : U[] {
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
    reduceSnapshots: function <U>(callback: (acc: U, snapshot: Snapshot<BaseDataEntity, BaseDataEntity>) => U, initialValue: U): U | undefined {
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
