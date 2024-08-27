import { useDataContext } from "@/app/context/DataContext";
import { CategoryProperties } from "../../pages/personas/ScenarioBuilder";
import { CombinedEvents, SnapshotManager, SnapshotStoreOptions } from "../hooks/useSnapshotManager";
import { BaseData, Data } from "../models/data/Data";
import { NotificationPosition, StatusType } from "../models/data/StatusType";
import { Tag } from "../models/tracker/Tag";
import { AnalysisTypeEnum } from "../projects/DataAnalysisPhase/AnalysisType";
import { DataStore } from "../projects/DataAnalysisPhase/DataProcessing/DataStore";
import { SearchCriteria } from "../routing/SearchCriteria";
import { CalendarEvent } from "../state/stores/CalendarEvent";
import { NotificationType } from "../support/NotificationContext";
import { Subscriber } from "../users/Subscriber";
import { Snapshot, Snapshots, SnapshotUnion } from "./LocalStorageSnapshotStore";
import { handleSnapshotSuccess } from "./snapshotHandlers";
import SnapshotStore, { SubscriberCollection } from "./SnapshotStore";

import { ModifiedDate } from "../documents/DocType";
import { SnapshotStoreConfig } from "./SnapshotStoreConfig";
import { FilterCriteria } from "@/app/pages/searchs/FilterCriteria";
import { Category } from "../libraries/categories/generateCategoryProperties";
import { SnapshotOperation } from "./SnapshotActions";
// Define BaseData interface

interface TagsRecord {
  [key: string]: Tag;
}

// Define SnapshotWithCriteria type
type SnapshotWithCriteria<T extends Data = Data, K extends Data = T
> = Snapshot<T, K> & Omit<SearchCriteria, 'analysisType'> & {
  criteria: FilterCriteria;
  analysisType?: AnalysisTypeEnum;
  events?: CombinedEvents<T, K>;  // Update as needed based on your schema
  subscribers?: SubscriberCollection<T, K>;  // Update as needed based on your schema
  tags?: TagsRecord;  // Update as needed based on your schema
  timestamp: string | number | Date | undefined
};



export class SnapshotStoreWithCriteria<T extends Data, K extends Data> extends SnapshotStore<T, K> {
  config: SnapshotStoreConfig<T, K>

  constructor(
    storeId: number,
    options: SnapshotStoreOptions<T, K>,
    category: Category,
    config: SnapshotStoreConfig<T, K>,
    operation: SnapshotOperation
  ) {
    super(storeId, options, category, config, operation);
    this.config = config;
  }
}
// Example data to be added to the store
const exampleSnapshotWithCriteria: SnapshotWithCriteria<Data, Data> = {
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
    eventRecords: {
      "1": [{
        // id: "1",
        // title: "Sample Event",
        // description: "Sample event description",
        // timestamp: new Date(),
        // category: "Sample event category",
        // status: StatusType.Scheduled,
        // tags: ["Sample", "Event"],
      }],
    },
    eventIds: ["1"],
    callbacks: {
      onEventClick: [(snapshot: Snapshot<Data, Data>) => {
        return (event: CalendarEvent<Data, Data>) => {
          console.log("onEventClick", event);
        };
      }],
      onEventDoubleClick: [(snapshot: Snapshot<Data, Data>) => {
        return (event: CalendarEvent<Data, Data>) => {
          console.log("onEventDoubleClick", event);
        };
      }],
      onEventContextMenu: [(snapshot: Snapshot<Data, Data>) => {
        return (event: CalendarEvent<Data, Data>) => {
          console.log("onEventContextMenu", event);
        };
      }],
      onEventDrop: [(snapshot: Snapshot<Data, Data>) => {
        return (event: CalendarEvent<Data, Data>) => {
          console.log("onEventDrop", event);
        };
      }],
      onEventResize: [(snapshot: Snapshot<Data, Data>) => {
        return (event: CalendarEvent<Data, Data>) => {
          console.log("onEventResize", event);
        };
      }],
      onEventSelect: [(snapshot: Snapshot<Data, Data>) => {
        return (event: CalendarEvent<Data, Data>) => {
          console.log("onEventSelect", event);
        };
      }],
      onEventDeselect: [(snapshot: Snapshot<Data, Data>) => {
        return (event: CalendarEvent<Data, Data>) => {
          console.log("onEventDeselect", event);
        };
      }],
      onEventCreate: [(snapshot: Snapshot<Data, Data>) => {
        return (event: CalendarEvent<Data, Data>) => {
          console.log("onEventCreate", event);
        };
      }],
      onEventRemove: [(snapshot: Snapshot<Data, Data>) => {
        return (event: CalendarEvent<Data, Data>) => {
          console.log("onEventRemove", event);
        };
      }],
      onEventReceive: [(snapshot: Snapshot<Data, Data>) => {
        return (event: CalendarEvent<Data, Data>) => {
          console.log("onEventReceive", event);
        };
      }],
    },
  },
  subscribers: {
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
        determineCategory: (data: string | Snapshot<Data, Data> | null | undefined) => {
          // Implement the logic to determine the category
          return data ? "SomeCategory" : null;
        },
        // Add other required properties here
      }
    },
  },
  tags: {
    "1": {
      id: "1",
      name: "Sample Tag",
      color: "#000000",
      description: "Sample tag description",
      enabled: true,
      tags: ["Sample", "Tag"],
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
        status: Status,
        callbacks: (
          snapshot: Snapshot<Data, Data>) => {
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
const exampleSnapshotStore: SnapshotStore<BaseData, BaseData> = {
  id: "store1",
  title: "Sample Store",
  description: "This is a sample snapshot store",
  data: new Map<string, Snapshot<BaseData, BaseData>>(),
  snapshotId: "snapshot1",
  key: "key1",
  topic: "Sample Topic",
  date: new Date(),
  configOption: null,
  config: undefined,
  message: undefined,
  createdBy: "",
  type: undefined,
  subscribers: {} as Subscriber<BaseData, BaseData>[] & Record<string, Subscriber<BaseData, BaseData>>,
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
  newData: undefined,
  category: undefined,
  timestamp: undefined,
  async getData(): Promise<DataStore<SnapshotWithCriteria<Data, Data>[], K>> {
    const { dataStore } = useDataContext();
    return Promise.resolve([dataStore]);
  },
  addSnapshotItem: exampleSnapshotStore.addSnapshotItem,
  addNestedStore: exampleSnapshotStore.addNestedStore,
  defaultSubscribeToSnapshots: exampleSnapshotStore.defaultSubscribeToSnapshots,
  subscribeToSnapshots: exampleSnapshotStore.subscribeToSnapshots,
  transformSubscriber: exampleSnapshotStore.transformSubscriber,
  transformDelegate: exampleSnapshotStore.transformDelegate,
  initializedState: undefined,
  getAllKeys: exampleSnapshotStore.getAllKeys,
  getAllItems: exampleSnapshotStore.getAllItems,
  addData: exampleSnapshotStore.addData,
  addDataStatus: exampleSnapshotStore.addDataStatus,
  removeData: exampleSnapshotStore.removeData,
  updateData: exampleSnapshotStore.updateData,
  updateDataTitle: exampleSnapshotStore.updateDataTitle,
  updateDataDescription: exampleSnapshotStore.updateDataDescription,
  updateDataStatus: exampleSnapshotStore.updateDataStatus,
  addDataSuccess: exampleSnapshotStore.addDataSuccess,
  getDataVersions: exampleSnapshotStore.getDataVersions,
  updateDataVersions: exampleSnapshotStore.updateDataVersions,
  getBackendVersion: exampleSnapshotStore.getBackendVersion,
  getFrontendVersion: exampleSnapshotStore.getFrontendVersion,
  fetchData: exampleSnapshotStore.fetchData,
  defaultSubscribeToSnapshot: exampleSnapshotStore.defaultSubscribeToSnapshot,
  handleSubscribeToSnapshot: exampleSnapshotStore.handleSubscribeToSnapshot,
  snapshot: undefined,
  removeItem: exampleSnapshotStore.removeItem,

  getSnapshot: function (
    snapshot: (id: string) =>
      | Promise<{
        snapshotId: number;
        snapshotData: T;
        category: Category | undefined;
        categoryProperties: CategoryProperties;
        dataStoreMethods: DataStore<T, K>;
        timestamp: string | number | Date | undefined;
        id: string | number | undefined;
        snapshot: Snapshot<T, K>;
        snapshotStore: SnapshotStore<T, K>;
        data: T;
      }>
      | undefined
  ): Promise<SnapshotStore<BaseData, BaseData>> {
    throw new Error("Function not implemented.");
  },
  getSnapshotSuccess: exampleSnapshotStore.getSnapshotSuccess,
  getSnapshotId: exampleSnapshotStore.getSnapshotId,
  getItem: exampleSnapshotStore.getItem,
  setItem: exampleSnapshotStore.setItem,
  addSnapshotFailure: exampleSnapshotStore.addSnapshotFailure,
  getDataStore: exampleSnapshotStore.getDataStore,
  addSnapshotSuccess: exampleSnapshotStore.addSnapshotSuccess,
  compareSnapshotState: exampleSnapshotStore.compareSnapshotState,
  deepCompare: exampleSnapshotStore.deepCompare,
  shallowCompare: exampleSnapshotStore.shallowCompare,
  getDataStoreMethods: exampleSnapshotStore.getDataStoreMethods,
  getDelegate: exampleSnapshotStore.getDelegate,
  determineCategory: exampleSnapshotStore.determineCategory,
  determinePrefix: function <T extends Data>(snapshot: T | null | undefined, category: string): string {
    throw new Error("Function not implemented.");
  },
  updateSnapshot: exampleSnapshotStore.updateSnapshot,
  updateSnapshotSuccess: exampleSnapshotStore.updateSnapshotSuccess,
  updateSnapshotFailure: exampleSnapshotStore.updateSnapshotFailure,
  removeSnapshot: exampleSnapshotStore.removeSnapshot,
  clearSnapshots: exampleSnapshotStore.clearSnapshots,
  addSnapshot: exampleSnapshotStore.addSnapshot,
  createSnapshot: exampleSnapshotStore.createSnapshot,
  createSnapshotSuccess: exampleSnapshotStore.createSnapshotSuccess,
  setSnapshotSuccess: exampleSnapshotStore.setSnapshotSuccess,
  setSnapshotFailure: exampleSnapshotStore.setSnapshotFailure,
  createSnapshotFailure: exampleSnapshotStore.createSnapshotFailure,
  updateSnapshots: exampleSnapshotStore.updateSnapshots,
  updateSnapshotsSuccess: exampleSnapshotStore.updateSnapshotsSuccess,
  updateSnapshotsFailure: exampleSnapshotStore.updateSnapshotsFailure,
  initSnapshot: exampleSnapshotStore.initSnapshot,
  takeSnapshot: exampleSnapshotStore.takeSnapshot,
  takeSnapshotSuccess: exampleSnapshotStore.takeSnapshotSuccess,
  takeSnapshotsSuccess: exampleSnapshotStore.takeSnapshotsSuccess,
  configureSnapshotStore: exampleSnapshotStore.configureSnapshotStore,
  flatMap: function <U>(callback: (value: SnapshotStoreConfig<BaseData, BaseData>, index: number, array: SnapshotStoreConfig<Snapshot<BaseData, BaseData>, BaseData>[]) => U): U[] {
    throw new Error("Function not implemented.");
  },
  setData: exampleSnapshotStore.setData,
  getState: exampleSnapshotStore.getState,
  setState: exampleSnapshotStore.setState,
  validateSnapshot: exampleSnapshotStore.validateSnapshot,
  handleSnapshot: function (
    id: string,
    snapshotId: string,
    snapshot: Snapshot<T, K> | null,
    snapshotData: T,
    category: string | CategoryProperties | undefined,
    callback: (snapshot: T) => void,
    snapshots: Snapshots<Data>,
    type: string,
    event: Event,
    snapshotContainer?: T,
    snapshotStoreConfig?: SnapshotStoreConfig<T, K>,
  ): void {
    throw new Error("Function not implemented.");
  },
  handleActions: function (): void {
    throw new Error("Function not implemented.");
  },
  setSnapshot: function (snapshot: Snapshot<BaseData, BaseData>): void {
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
    data: Map<string, Snapshot<T, K>>,
    subscribers: Subscriber<any, any>[],
    snapshotData: Partial<SnapshotStoreConfig<T, K>>
  ): void {
    throw new Error("Function not implemented.");
  },
  setSnapshots: function (
    snapshots: Snapshots<Data>): void {
    throw new Error("Function not implemented.");
  },
  setSnapshotStoress: function (
    snapshots: SnapshotStore<BaseData, BaseData>[]): void {
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
  getSubscribers: function (subscribers: Subscriber<BaseData, BaseData>[], snapshots: Snapshots<BaseData>): Promise<{ subscribers: Subscriber<BaseData, BaseData>[]; snapshots: Snapshots<BaseData>; }> {
    throw new Error("Function not implemented.");
  },
  notify: function (id: string, message: string, content: any, date: Date, type: NotificationType, notificationPosition?: NotificationPosition | undefined): void {
    throw new Error("Function not implemented.");
  },
  notifySubscribers: function (subscribers: Subscriber<BaseData, BaseData>[], data: Partial<SnapshotStoreConfig<BaseData, any>>): Subscriber<BaseData, BaseData>[] {
    throw new Error("Function not implemented.");
  },
  subscribe: function (): void {
    throw new Error("Function not implemented.");
  },
  unsubscribe: function (): void {
    throw new Error("Function not implemented.");
  },
  fetchSnapshot: function (snapshotId: string, category: string | CategoryProperties | undefined, timestamp: Date, snapshot: Snapshot<BaseData>, data: BaseData, delegate: SnapshotStoreConfig<BaseData, BaseData>[]): Promise<{ id: any; category: string | CategoryProperties | undefined; timestamp: any; snapshot: Snapshot<BaseData>; data: BaseData; getItem?: (snapshot: Snapshot<BaseData>) => Snapshot<BaseData> | undefined; }> {
    throw new Error("Function not implemented.");
  },
  fetchSnapshotSuccess: (
    snapshotData: (
      snapshotManager: SnapshotManager<T, K>,
      subscribers: Subscriber<T, K>[],
      snapshot: Snapshot<T, K>) => void
  ): void {
    throw new Error("Function not implemented.");
  },
  fetchSnapshotFailure: function (payload: { error: Error; }): void {
    throw new Error("Function not implemented.");
  },
  getSnapshots: function (category: string, data: Snapshots<BaseData>): void {
    throw new Error("Function not implemented.");
  },
  getAllSnapshots: function (data: (subscribers: Subscriber<BaseData, BaseData>[], snapshots: Snapshots<BaseData>) => Promise<Snapshots<BaseData>>): void {
    throw new Error("Function not implemented.");
  },
  generateId: function (): string {
    throw new Error("Function not implemented.");
  },
  batchFetchSnapshots: function (subscribers: Subscriber<BaseData, BaseData>[], snapshots: Snapshots<BaseData>): void {
    throw new Error("Function not implemented.");
  },
  batchTakeSnapshotsRequest: function (snapshotData: SnapshotData): void {
    throw new Error("Function not implemented.");
  },
  batchUpdateSnapshotsRequest: function (snapshotData: (subscribers: Subscriber<BaseData, BaseData>[]) => Promise<{ subscribers: Subscriber<BaseData, BaseData>[]; snapshots: Snapshots<BaseData>; }>): void {
    throw new Error("Function not implemented.");
  },
  batchFetchSnapshotsSuccess: function (subscribers: Subscriber<BaseData, BaseData>[], snapshots: Snapshots<BaseData>): void {
    throw new Error("Function not implemented.");
  },
  batchFetchSnapshotsFailure: function (payload: { error: Error; }): void {
    throw new Error("Function not implemented.");
  },
  batchUpdateSnapshotsSuccess: function (subscribers: Subscriber<BaseData, BaseData>[], snapshots: Snapshots<BaseData>): void {
    throw new Error("Function not implemented.");
  },
  batchUpdateSnapshotsFailure: function (payload: { error: Error; }): void {
    throw new Error("Function not implemented.");
  },
  batchTakeSnapshot: function (

    snapshotStore: SnapshotStore<BaseData, BaseData>,
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
});

export type { SnapshotWithCriteria, TagsRecord };

// // Add example data to the store

// exampleSnapshotStore.data?.set("1", exampleSnapshotWithCriteria)

// // Example usage
// const baseData: BaseData = exampleSnapshotWithCriteria.data as BaseData;
// console.log(baseData);

// const newSnapshot: Snapshot<BaseData, BaseData> = {
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
//     getSnapshotItems: exampleSnapshotStore.getSnapshotItems,
//     defaultSubscribeToSnapshots: exampleSnapshotStore.defaultSubscribeToSnapshots,
//     versionInfo: null,
//     transformSubscriber: exampleSnapshotStore.transformSubscriber,
//     transformDelegate: exampleSnapshotStore.transformDelegate,
//     initializedState: undefined,
//     getAllKeys: exampleSnapshotStore.getAllKeys,
//     getAllItems: exampleSnapshotStore.getAllItems,
//     addDataStatus: exampleSnapshotStore.addDataStatus,
//     removeData: exampleSnapshotStore.removeData,
//     updateData: exampleSnapshotStore.updateData,
//     updateDataTitle: exampleSnapshotStore.updateDataTitle,
//     updateDataDescription: exampleSnapshotStore.updateDataDescription,
//     updateDataStatus: exampleSnapshotStore.updateDataStatus,
//     addDataSuccess: exampleSnapshotStore.addDataSuccess,
//     getDataVersions: exampleSnapshotStore.getDataVersions,
//     updateDataVersions: exampleSnapshotStore.updateDataVersions,
//     getBackendVersion: exampleSnapshotStore.getBackendVersion,
//     getFrontendVersion: exampleSnapshotStore.getFrontendVersion,
//     fetchData: exampleSnapshotStore.fetchData,
//     defaultSubscribeToSnapshot: exampleSnapshotStore.defaultSubscribeToSnapshot,
//     handleSubscribeToSnapshot: exampleSnapshotStore.handleSubscribeToSnapshot,
//     removeItem: exampleSnapshotStore.removeItem,
//     getSnapshot: exampleSnapshotStore.getSnapshot,
//     getSnapshotSuccess: exampleSnapshotStore.getSnapshotSuccess,
//     setItem: exampleSnapshotStore.setItem,
//     getDataStore: {},
//     addSnapshotSuccess: exampleSnapshotStore.addSnapshotSuccess,
//     deepCompare: exampleSnapshotStore.deepCompare,
//     shallowCompare: exampleSnapshotStore.shallowCompare,
//     getDataStoreMethods: exampleSnapshotStore.getDataStoreMethods,
//     getDelegate: exampleSnapshotStore.getDelegate,
//     determineCategory: exampleSnapshotStore.determineCategory,
//     determinePrefix: function <T extends Data>(snapshot: T | null | undefined, category: string): string {
//         throw new Error("Function not implemented.");
//     },
//     removeSnapshot: exampleSnapshotStore.removeSnapshot,
//     addSnapshotItem: exampleSnapshotStore.addSnapshotItem,
//     addNestedStore: exampleSnapshotStore.addNestedStore,
//     clearSnapshots: exampleSnapshotStore.clearSnapshots,
//     addSnapshot: exampleSnapshotStore.addSnapshot,
//     createSnapshot: undefined,
//     createInitSnapshot: exampleSnapshotStore.createInitSnapshot,
//     setSnapshotSuccess: exampleSnapshotStore.setSnapshotSuccess,
//     setSnapshotFailure: exampleSnapshotStore.setSnapshotFailure,
//     updateSnapshots: exampleSnapshotStore.updateSnapshots,
//     updateSnapshotsSuccess: exampleSnapshotStore.updateSnapshotsSuccess,
//     updateSnapshotsFailure: exampleSnapshotStore.updateSnapshotsFailure,
//     initSnapshot: exampleSnapshotStore.initSnapshot,
//     takeSnapshot: exampleSnapshotStore.takeSnapshot,
//     takeSnapshotSuccess: exampleSnapshotStore.takeSnapshotSuccess,
//     takeSnapshotsSuccess: exampleSnapshotStore.takeSnapshotsSuccess,
//     flatMap: function <U extends Iterable<any>>(callback: (value: SnapshotStoreConfig<BaseData, BaseData>, index: number, array: SnapshotStoreConfig<BaseData, BaseData>[]) => U): U extends (infer I)[] ? I[] : U[] {
//         throw new Error("Function not implemented.");
//     },
//     getState: exampleSnapshotStore.getState,
//     setState: exampleSnapshotStore.setState,
//     validateSnapshot: exampleSnapshotStore.validateSnapshot,
//     handleActions: exampleSnapshotStore.handleActions,
//     setSnapshot: exampleSnapshotStore.setSnapshot,
//     transformSnapshotConfig: function <T extends BaseData>(config: SnapshotStoreConfig<BaseData, T>): SnapshotStoreConfig<BaseData, T> {
//         throw new Error("Function not implemented.");
//     },
//     setSnapshots: exampleSnapshotStore.setSnapshots,
//     clearSnapshot: exampleSnapshotStore.clearSnapshot,
//     mergeSnapshots: exampleSnapshotStore.mergeSnapshots,
//     reduceSnapshots: function <U>(callback: (acc: U, snapshot: Snapshot<BaseData, BaseData>) => U, initialValue: U): U | undefined {
//         throw new Error("Function not implemented.");
//     },
//     sortSnapshots: exampleSnapshotStore.sortSnapshots,
//     filterSnapshots: exampleSnapshotStore.filterSnapshots,
//     findSnapshot: exampleSnapshotStore.findSnapshot,
//     getSubscribers: exampleSnapshotStore.getSubscribers,
//     notify: exampleSnapshotStore.notify,
//     notifySubscribers: exampleSnapshotStore.notifySubscribers,
//     getSnapshots: exampleSnapshotStore.getSnapshots,
//     getAllSnapshots: exampleSnapshotStore.getAllSnapshots,
//     generateId: exampleSnapshotStore.generateId,
//     batchFetchSnapshots: exampleSnapshotStore.batchFetchSnapshots,
//     batchTakeSnapshotsRequest: exampleSnapshotStore.batchTakeSnapshotsRequest,
//     batchUpdateSnapshotsRequest: exampleSnapshotStore.batchUpdateSnapshotsRequest,
//     filterSnapshotsByStatus: undefined,
//     filterSnapshotsByCategory: undefined,
//     filterSnapshotsByTag: undefined,
//     batchFetchSnapshotsSuccess: exampleSnapshotStore.batchFetchSnapshotsSuccess,
//     batchFetchSnapshotsFailure: exampleSnapshotStore.batchFetchSnapshotsFailure,
//     batchUpdateSnapshotsSuccess: exampleSnapshotStore.batchUpdateSnapshotsSuccess,
//     batchUpdateSnapshotsFailure: exampleSnapshotStore.batchUpdateSnapshotsFailure,
//     batchTakeSnapshot: exampleSnapshotStore.batchTakeSnapshot,
//     handleSnapshotSuccess: exampleSnapshotStore.handleSnapshotSuccess,
//     eventRecords: null,
//     getParentId: exampleSnapshotStore.getParentId,
//     getChildIds: exampleSnapshotStore.getChildIds,
//     addChild: exampleSnapshotStore.addChild,
//     removeChild: exampleSnapshotStore.removeChild,
//     getChildren: exampleSnapshotStore.getChildren,
//     hasChildren: exampleSnapshotStore.hasChildren,
//     isDescendantOf: exampleSnapshotStore.isDescendantOf,
//     timestamp: undefined,
//     getInitialState: exampleSnapshotStore.getInitialState,
//     getConfigOption: exampleSnapshotStore.getConfigOption,
//     getTimestamp: exampleSnapshotStore.getTimestamp,
//     getStores: exampleSnapshotStore.getStores,
//     getData: exampleSnapshotStore.getData,
//     setData: exampleSnapshotStore.setData,
//     addData: exampleSnapshotStore.addData,
//     stores: null,
//     getStore: exampleSnapshotStore.getStore,
//     addStore: exampleSnapshotStore.addStore,
//     mapSnapshot: exampleSnapshotStore.mapSnapshot,
//     mapSnapshots: exampleSnapshotStore.mapSnapshots,
//     removeStore: exampleSnapshotStore.removeStore,
//     addSnapshotFailure: exampleSnapshotStore.addSnapshotFailure,
//     configureSnapshotStore: exampleSnapshotStore.configureSnapshotStore,
//     updateSnapshotSuccess: exampleSnapshotStore.updateSnapshotSuccess,
//     createSnapshotFailure: exampleSnapshotStore.createSnapshotFailure,
//     createSnapshotSuccess: exampleSnapshotStore.createSnapshotSuccess,
//     createSnapshots: exampleSnapshotStore.createSnapshots,
//     onSnapshot: exampleSnapshotStore.onSnapshot,
//     onSnapshots: exampleSnapshotStore.onSnapshots,
//     label: undefined
// };
// console.log(newSnapshot);
