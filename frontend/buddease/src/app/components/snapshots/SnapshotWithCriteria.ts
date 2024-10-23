import { Callback, SnapshotConfig, SnapshotData, SnapshotStoreProps } from '@/app/components/snapshots';
import { useDataContext } from "@/app/context/DataContext";
import { CategoryProperties } from "../../pages/personas/ScenarioBuilder";
import { CombinedEvents, SnapshotManager, SnapshotStoreOptions } from "../hooks/useSnapshotManager";
import { BaseData, Data } from "../models/data/Data";
import { NotificationPosition, StatusType } from "../models/data/StatusType";
import { Tag } from "../models/tracker/Tag";
import { AnalysisTypeEnum } from "../projects/DataAnalysisPhase/AnalysisType";
import { DataStore } from "../projects/DataAnalysisPhase/DataProcessing/DataStore";
import { SearchCriteria } from "../routing/SearchCriteria";
import CalendarManagerStoreClass, { CalendarEvent } from "../state/stores/CalendarEvent";
import { NotificationType } from "../support/NotificationContext";
import { Subscriber } from "../users/Subscriber";
import { Payload, Snapshot, Snapshots } from "./LocalStorageSnapshotStore";
import { handleSnapshotSuccess } from "./snapshotHandlers";
import SnapshotStore, { SubscriberCollection } from "./SnapshotStore";

import { FilterCriteria } from "@/app/pages/searchs/FilterCriteria";
import { SchemaField } from "../database/SchemaField";
import { ModifiedDate } from "../documents/DocType";
import { Category } from "../libraries/categories/generateCategoryProperties";
import { RealtimeDataItem } from '../models/realtime/RealtimeData';
import Version from "../versions/Version";
import { SnapshotOperation } from "./SnapshotActions";
import { SnapshotEvents } from './SnapshotEvents';
import { SnapshotStoreConfig } from "./SnapshotStoreConfig";
import { UnifiedMetaDataOptions } from '@/app/configs/database/MetaDataOptions';
import { Meta } from '../models/data/dataStoreMethods';
// Define BaseData interface

interface TagsRecord {
  [key: string]: Tag;
}

// Define SnapshotWithCriteria type
type SnapshotWithCriteria<T extends Data = Data, Meta extends UnifiedMetaDataOptions = UnifiedMetaDataOptions, K extends Data = T
> = Snapshot<Data, Meta, Data> & Omit<SearchCriteria, 'analysisType'> & {
  criteria: FilterCriteria;
  analysisType?: AnalysisTypeEnum;
  events?: CombinedEvents<Data, Meta, Data>;  // Update as needed based on your schema
  subscribers?: SubscriberCollection<Data, Meta, Data>[];  // Update as needed based on your schema
   tags?: TagsRecord | string[] | undefined;   // Update as needed based on your schema
  timestamp: string | number | Date | undefined
};



export class SnapshotStoreWithCriteria<T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T> extends SnapshotStore<Data, Meta, Data> {
  config: Promise<SnapshotStoreConfig<Data, Meta, Data> | null>
  constructor(
    storeId: string,
    name: string,
    version: Version,
    schema: Record<string, SchemaField>,
    options: SnapshotStoreOptions<Data, Meta, Data>,
    category: symbol | string | Category | undefined,
    config: Promise<SnapshotStoreConfig<Data, Meta, Data> | null>,
    operation: SnapshotOperation,
    expirationDate: Date,
    payload: Payload,
    callback: (data: T) => void,
    storeProps: SnapshotStoreProps<Data, Meta, Data>,
    endpointCategory: string
  ) {
    // Create a converted callback that performs the type guard
    const convertedCallback = (data: Data) => {
      if (isCompatibleWithT(data)) {
        // Call the original callback with data cast to T
        callback(data as T);
      } else {
        // Handle cases where data is not compatible with T
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
      endpointCategory
    });
    this.config = config;


    const isCompatibleWithT = (data: Data): data is T => {
      // Basic property checks
      const hasId = typeof data.id === "string";
      const hasName = typeof data.title === "string";
      const hasType = data.type !== undefined;
      
      // Check for a nested property
      const hasDetails = data.details && typeof data.details === "object";
      const hasItemsArray = Array.isArray(data.items) && data.items.length > 0;

      // Combine all checks
      return hasId && hasName && hasType && hasDetails && hasItemsArray;
    };
  }
}


// Example data to be added to the store
const exampleSnapshotWithCriteria: SnapshotWithCriteria<Data, Meta, Data> = {
  data: {
    id: "1",
    title: "Sample Data",
    description: "Sample description",
    timestamp: new Date(),
    category: "Sample category",
  },
  meta: {
    id: "2",
    title: "Sample Meta",
    description: "Sample meta description",
    timestamp: new Date(),
    category: "Sample meta category",
  },
  startDate: new Date(),
  endDate: new Date(),
  status: StatusType.Scheduled,
  analysisType: AnalysisTypeEnum.DEFAULT, // Adjust as needed
  configOption: "default config option",
  events: {
    subscribers: {},
    trigger: (event: string | CombinedEvents<Data, Meta, Data> | SnapshotEvents<Data, Meta, Data>,
      snapshot: Snapshot<Data, Meta, Data>,
      snapshotId: string,
      subscribers: SubscriberCollection<Data, Meta, Data>,
      type: string,
      snapshotData: SnapshotData<Data, Meta, Data>
    ) => { },
    initialConfig: {} as SnapshotConfig<Data, Meta, Data>,
    records: {} as Record<string, CalendarManagerStoreClass<Data, Meta, Data>[]>,
   
    onInitialize: () => {},
    on: (event: string, callback: (snapshot: Snapshot<Data, Meta, Data>) => void) => {},
    off: (event: string,
      callback: Callback<Snapshot<Data, Meta, Data>>, 
      snapshotId: string,
      subscribers: SubscriberCollection<Data, Meta, Data>,
      type: string,
      snapshotData: SnapshotData<Data, Meta, Data>,
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
      snapshot: Snapshot<Data, Meta, Data>, 
      snapshotId: string,
      subscribers: SubscriberCollection<Data, Meta, Data>, 
      type: string,
      snapshotStore: SnapshotStore<Data, Meta, Data>,
      dataItems: RealtimeDataItem[], 
      criteria: SnapshotWithCriteria<Data, Meta, Data>, 
      category: Category
    ) => { },
   
    subscribe: (event: string, callback: (snapshot: Snapshot<Data, Meta, Data>) => void) => {},
    event: "",
    unsubscribeDetails: {
    userId: "string",
    snapshotId: "string",
    unsubscribeType: "string",
    unsubscribeDate: new Date(),
    unsubscribeReason: "string",
    unsubscribeData: ""
},
    callback: (snapshot: Snapshot<Data, Meta, Data>) => {},
   
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
        record: {} as CalendarManagerStoreClass<Data, Meta, Data>,
        callback: (snapshot: Snapshot<Data, Meta, Data>) => {},
        action: "", 
        timestamp: new Date(),
        
      },
    
    ],
    },
    eventIds: ["1"],
    callbacks: {
      onEventClick: [(snapshot: Snapshot<Data, Meta, Data>) => {
        return (event: CalendarEvent<Data, Meta, Data>) => {
          console.log("onEventClick", event);
        };
      }],
      onEventDoubleClick: [(snapshot: Snapshot<Data, Meta, Data>) => {
        return (event: CalendarEvent<Data, Meta, Data>) => {
          console.log("onEventDoubleClick", event);
        };
      }],
      onEventContextMenu: [(snapshot: Snapshot<Data, Meta, Data>) => {
        return (event: CalendarEvent<Data, Meta, Data>) => {
          console.log("onEventContextMenu", event);
        };
      }],
      onEventDrop: [(snapshot: Snapshot<Data, Meta, Data>) => {
        return (event: CalendarEvent<Data, Meta, Data>) => {
          console.log("onEventDrop", event);
        };
      }],
      onEventResize: [(snapshot: Snapshot<Data, Meta, Data>) => {
        return (event: CalendarEvent<Data, Meta, Data>) => {
          console.log("onEventResize", event);
        };
      }],
      onEventSelect: [(snapshot: Snapshot<Data, Meta, Data>) => {
        return (event: CalendarEvent<Data, Meta, Data>) => {
          console.log("onEventSelect", event);
        };
      }],
      onEventDeselect: [(snapshot: Snapshot<Data, Meta, Data>) => {
        return (event: CalendarEvent<Data, Meta, Data>) => {
          console.log("onEventDeselect", event);
        };
      }],
      onEventCreate: [(snapshot: Snapshot<Data, Meta, Data>) => {
        return (event: CalendarEvent<Data, Meta, Data>) => {
          console.log("onEventCreate", event);
        };
      }],
      onEventRemove: [(snapshot: Snapshot<Data, Meta, Data>) => {
        return (event: CalendarEvent<Data, Meta, Data>) => {
          console.log("onEventRemove", event);
        };
      }],
      onEventReceive: [(snapshot: Snapshot<Data, Meta, Data>) => {
        return (event: CalendarEvent<Data, Meta, Data>) => {
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
        determineCategory: (data: string | Snapshot<Data, Meta, Data> | null | undefined) => {
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
          snapshot: Snapshot<Data, Meta, Data>) => {
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
  const baseData: BaseData = data;
  console.log(baseData);
} else if (data instanceof Map) {
  // Handle the case where `data` is a Map
  console.log("Data is a Map and cannot be assigned directly to BaseData.");
} else {
  // Handle null or undefined cases
  console.log("Data is null or undefined.");
}

// Example of SnapshotStore with SnapshotWithCriteria
const exampleSnapshotStore: SnapshotStore<BaseData, Meta, BaseData> = {
  id: "store1",
  title: "Sample Store",
  description: "This is a sample snapshot store",
  data: new Map<string, Snapshot<BaseData, Meta, BaseData>>(),
  snapshotId: "snapshot1",
  key: "key1",
  topic: "Sample Topic",
  date: new Date(),
  configOption: null,
  config: Promise.resolve(null),
  message: undefined,
  createdBy: "",
  type: undefined,
  subscribers: {} as Subscriber<BaseData, Meta, BaseData>[] & Record<string, Subscriber<BaseData, Meta, BaseData>>,
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
    id: string | number, snapshot: Snapshot<BaseData, Meta, BaseData>
  ): Promise<DataStore<SnapshotWithCriteria<Data, Meta, Data>[], BaseData>> {
    const { dataStore } = useDataContext();
    return Promise.resolve([dataStore]);
  },
  addSnapshotItem: undefined,
  addNestedStore: undefined,
  defaultSubscribeToSnapshots: undefined,
  subscribeToSnapshots: undefined,
  transformSubscriber: undefined,
  transformDelegate: undefined,
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
        dataStoreMethods: DataStore<Data, Meta, Data>;
        timestamp: string | number | Date | undefined;
        id: string | number | undefined;
        snapshot: Snapshot<Data, Meta, Data>;
        snapshotStore: SnapshotStore<Data, Meta, Data>;
        data: T;
      }>
      | undefined
  ): Promise<SnapshotStore<BaseData, Meta, BaseData>> {
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
  determinePrefix: function <T extends Data>(snapshot: T | null | undefined, category: string): string {
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
  flatMap: function <U>(callback: (value: SnapshotStoreConfig<BaseData, Meta, BaseData>, index: number, array: SnapshotStoreConfig<Snapshot<BaseData, Meta, BaseData>, BaseData>[]) => U): U[] {
    throw new Error("Function not implemented.");
  },
  setData: undefined,
  getState: undefined,
  setState: undefined,
  validateSnapshot: undefined,
  handleSnapshot: function (
    id: string,
    snapshotId: string,
    snapshot: Snapshot<Data, Meta, Data> | null,
    snapshotData: T,
    category: symbol | string | Category | undefined,
    callback: (snapshot: T) => void,
    snapshots: Snapshots<Data>,
    type: string,
    event: Event,
    snapshotContainer?: T,
    snapshotStoreConfig?: SnapshotStoreConfig<Data, Meta, Data>,
  ): void {
    throw new Error("Function not implemented.");
  },
  handleActions: function (): void {
    throw new Error("Function not implemented.");
  },
  setSnapshot: function (snapshot: Snapshot<BaseData, Meta, BaseData>): void {
    throw new Error("Function not implemented.");
  },
  transformSnapshotConfig: function <T extends BaseData>(
    config: SnapshotStoreConfig<BaseData, T>): SnapshotStoreConfig<BaseData, T> {
    throw new Error("Function not implemented.");
  },
  transformSnapshotStoreConfig: function <T extends BaseData>(
    config: SnapshotStoreConfig<BaseData, T>): SnapshotStoreConfig<BaseData, T> {
    throw new Error("Function not implemented.");
  },
  setSnapshotData: function (
    data: Map<string, Snapshot<Data, Meta, Data>>,
    subscribers: Subscriber<any, any>[],
    snapshotData: Partial<SnapshotStoreConfig<Data, Meta, Data>>
  ): void {
    throw new Error("Function not implemented.");
  },
  setSnapshots: function (
    snapshots: Snapshots<Data>): void {
    throw new Error("Function not implemented.");
  },
  setSnapshotStoress: function (
    snapshots: SnapshotStore<BaseData, Meta, BaseData>[]): void {
    throw new Error("Function not implemented.");
  },
  clearSnapshot: function (): void {
    throw new Error("Function not implemented.");
  },
  mergeSnapshots: function (snapshots: Snapshots<BaseData>): void {
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
  getSubscribers: function (subscribers: Subscriber<BaseData, Meta, BaseData>[], snapshots: Snapshots<BaseData>): Promise<{ subscribers: Subscriber<BaseData, Meta, BaseData>[]; snapshots: Snapshots<BaseData>; }> {
    throw new Error("Function not implemented.");
  },
  notify: function (id: string, message: string, content: any, date: Date, type: NotificationType, notificationPosition?: NotificationPosition | undefined): void {
    throw new Error("Function not implemented.");
  },
  notifySubscribers: function (subscribers: Subscriber<BaseData, Meta, BaseData>[], data: Partial<SnapshotStoreConfig<BaseData, any>>): Subscriber<BaseData, Meta, BaseData>[] {
    throw new Error("Function not implemented.");
  },
  subscribe: function (): void {
    throw new Error("Function not implemented.");
  },
  unsubscribe: function (): void {
    throw new Error("Function not implemented.");
  },
  fetchSnapshot: function (snapshotId: string, category: symbol | string | Category | undefined, timestamp: Date, snapshot: Snapshot<BaseData>, data: BaseData, delegate: SnapshotStoreConfig<BaseData, Meta, BaseData>[]): Promise<{ id: any; category: symbol | string | Category | undefined; timestamp: any; snapshot: Snapshot<BaseData>; data: BaseData; getItem?: (snapshot: Snapshot<BaseData>) => Snapshot<BaseData> | undefined; }> {
    throw new Error("Function not implemented.");
  },
  fetchSnapshotSuccess: (
    snapshotData: (
      snapshotManager: SnapshotManager<Data, Meta, Data>,
      subscribers: Subscriber<Data, Meta, Data>[],
      snapshot: Snapshot<Data, Meta, Data>) => void
  ): void {
    throw new Error("Function not implemented.");
  },
  fetchSnapshotFailure: function (snapshotId: string,
    snapshotManager: SnapshotManager<Data, Meta, Data>,
    snapshot: Snapshot<Data, Meta, Data>,
    date: Date | undefined,
    payload: { error: Error }): void {
    throw new Error("Function not implemented.");
  },
  getSnapshots: function (category: string, data: Snapshots<BaseData>): void {
    throw new Error("Function not implemented.");
  },
  getAllSnapshots: function (data: (subscribers: Subscriber<BaseData, Meta, BaseData>[], snapshots: Snapshots<BaseData>) => Promise<Snapshots<BaseData>>): void {
    throw new Error("Function not implemented.");
  },
  generateId: function (): string {
    throw new Error("Function not implemented.");
  },
  batchFetchSnapshots: function (subscribers: Subscriber<BaseData, Meta, BaseData>[], snapshots: Snapshots<BaseData>): void {
    throw new Error("Function not implemented.");
  },
  batchTakeSnapshotsRequest: function (snapshotData: SnapshotData): void {
    throw new Error("Function not implemented.");
  },
  batchUpdateSnapshotsRequest: function (snapshotData: (subscribers: Subscriber<BaseData, Meta, BaseData>[]) => Promise<{ subscribers: Subscriber<BaseData, Meta, BaseData>[]; snapshots: Snapshots<BaseData>; }>): void {
    throw new Error("Function not implemented.");
  },
  batchFetchSnapshotsSuccess: function (subscribers: Subscriber<BaseData, Meta, BaseData>[], snapshots: Snapshots<BaseData>): void {
    throw new Error("Function not implemented.");
  },
  batchFetchSnapshotsFailure: function (payload: { error: Error; }): void {
    throw new Error("Function not implemented.");
  },
  batchUpdateSnapshotsSuccess: function (subscribers: Subscriber<BaseData, Meta, BaseData>[], snapshots: Snapshots<BaseData>): void {
    throw new Error("Function not implemented.");
  },
  batchUpdateSnapshotsFailure: function (payload: { error: Error; }): void {
    throw new Error("Function not implemented.");
  },
  batchTakeSnapshot: function (

    snapshotStore: SnapshotStore<BaseData, Meta, BaseData>,
    snapshots: Snapshots<BaseData>
  ): Promise<{ snapshots: Snapshots<BaseData>; }> {
    throw new Error("Function not implemented.");
  },
  handleSnapshotSuccess: handleSnapshotSuccess,
  [Symbol.iterator]: function (): IterableIterator<Snapshot<BaseData,>> {
    // implement iterator
    const snapshots = Array.from(this.data?.values() ?? []);
    let index = 0;
    return {
      next: () => {
        if (index < snapshots.length) {
          return {
            value: snapshots[index++] as Snapshot<BaseData>,
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

export type { SnapshotWithCriteria, TagsRecord };
// // Add example data to the store

// undefined)

// // Example usage
// const baseData: BaseData = exampleSnapshotWithCriteria.data as BaseData;
// console.log(baseData);

// const newSnapshot: Snapshot<BaseData, Meta, BaseData> = {
//     data: baseData,
//     meta: exampleSnapshotWithCriteria.meta,
//     events: exampleSnapshotWithCriteria.events,
//     snapshotStore: exampleSnapshotWithCriteria.snapshotStore,
//     // snapshot: undefined,
//     dataItems: [],
//     newData: null,
//     unsubscribe: exampleSnapshotWithCriteria.unsubscribe,
//     fetchSnapshot: exampleSnapshotWithCriteria.fetchSnapshot,
//     handleSnapshot: exampleSnapshotWithCriteria.handleSnapshot,
//     getSnapshotId: exampleSnapshotWithCriteria.getSnapshotId,
//     compareSnapshotState: exampleSnapshotWithCriteria.compareSnapshotState,
//     snapshotStoreConfig: null,
//     getSnapshotItems: undefined,
//     defaultSubscribeToSnapshots: undefined,
//     versionInfo: null,
//     transformSubscriber: undefined,
//     transformDelegate: undefined,
//     initializedState: undefined,
//     getAllKeys: undefined,
//     getAllItems: undefined,
//     addDataStatus: undefined,
//     removeData: undefined,
//     updateData: undefined,
//     updateDataTitle: undefined,
//     updateDataDescription: undefined,
//     updateDataStatus: undefined,
//     addDataSuccess: undefined,
//     getDataVersions: undefined,
//     updateDataVersions: undefined,
//     getBackendVersion: undefined,
//     getFrontendVersion: undefined,
//     fetchData: undefined,
//     defaultSubscribeToSnapshot: undefined,
//     handleSubscribeToSnapshot: undefined,
//     removeItem: undefined,
//     getSnapshot: undefined,
//     getSnapshotSuccess: undefined,
//     setItem: undefined,
//     getDataStore: {},
//     addSnapshotSuccess: undefined,
//     deepCompare: undefined,
//     shallowCompare: undefined,
//     getDataStoreMethods: undefined,
//     getDelegate: undefined,
//     determineCategory: undefined,
//     determinePrefix: function <T extends Data>(snapshot: T | null | undefined, category: string): string {
//         throw new Error("Function not implemented.");
//     },
//     removeSnapshot: undefined,
//     addSnapshotItem: undefined,
//     addNestedStore: undefined,
//     clearSnapshots: undefined,
//     addSnapshot: undefined,
//     createSnapshot: undefined,
//     createInitSnapshot: undefined,
//     setSnapshotSuccess: undefined,
//     setSnapshotFailure: undefined,
//     updateSnapshots: undefined,
//     updateSnapshotsSuccess: undefined,
//     updateSnapshotsFailure: undefined,
//     initSnapshot: undefined,
//     takeSnapshot: undefined,
//     takeSnapshotSuccess: undefined,
//     takeSnapshotsSuccess: undefined,
//     flatMap: function <U extends Iterable<any>>(callback: (value: SnapshotStoreConfig<BaseData, Meta, BaseData>, index: number, array: SnapshotStoreConfig<BaseData, Meta, BaseData>[]) => U): U extends (infer I)[] ? I[] : U[] {
//         throw new Error("Function not implemented.");
//     },
//     getState: undefined,
//     setState: undefined,
//     validateSnapshot: undefined,
//     handleActions: undefined,
//     setSnapshot: undefined,
//     transformSnapshotConfig: function <T extends BaseData>(config: SnapshotStoreConfig<BaseData, T>): SnapshotStoreConfig<BaseData, T> {
//         throw new Error("Function not implemented.");
//     },
//     setSnapshots: undefined,
//     clearSnapshot: undefined,
//     mergeSnapshots: undefined,
//     reduceSnapshots: function <U>(callback: (acc: U, snapshot: Snapshot<BaseData, Meta, BaseData>) => U, initialValue: U): U | undefined {
//         throw new Error("Function not implemented.");
//     },
//     sortSnapshots: undefined,
//     filterSnapshots: undefined,
//     findSnapshot: undefined,
//     getSubscribers: undefined,
//     notify: undefined,
//     notifySubscribers: undefined,
//     getSnapshots: undefined,
//     getAllSnapshots: undefined,
//     generateId: undefined,
//     batchFetchSnapshots: undefined,
//     batchTakeSnapshotsRequest: undefined,
//     batchUpdateSnapshotsRequest: undefined,
//     filterSnapshotsByStatus: undefined,
//     filterSnapshotsByCategory: undefined,
//     filterSnapshotsByTag: undefined,
//     batchFetchSnapshotsSuccess: undefined,
//     batchFetchSnapshotsFailure: undefined,
//     batchUpdateSnapshotsSuccess: undefined,
//     batchUpdateSnapshotsFailure: undefined,
//     batchTakeSnapshot: undefined,
//     handleSnapshotSuccess: undefined,
//     eventRecords: null,
//     getParentId: undefined,
//     getChildIds: undefined,
//     addChild: undefined,
//     removeChild: undefined,
//     getChildren: undefined,
//     hasChildren: undefined,
//     isDescendantOf: undefined,
//     timestamp: undefined,
//     getInitialState: undefined,
//     getConfigOption: undefined,
//     getTimestamp: undefined,
//     getStores: undefined,
//     getData: undefined,
//     setData: undefined,
//     addData: undefined,
//     stores: null,
//     getStore: undefined,
//     addStore: undefined,
//     mapSnapshot: undefined,
//     mapSnapshots: undefined,
//     removeStore: undefined,
//     addSnapshotFailure: undefined,
//     configureSnapshotStore: undefined,
//     updateSnapshotSuccess: undefined,
//     createSnapshotFailure: undefined,
//     createSnapshotSuccess: undefined,
//     createSnapshots: undefined,
//     onSnapshot: undefined,
//     onSnapshots: undefined,
//     label: undefined
// };
// console.log(newSnapshot);
