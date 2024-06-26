// import { Snapshots } from '@/app/components/snapshots/SnapshotStore';
import { RealtimeDataItem } from "@/app/components/models/realtime/RealtimeData";
import {
  NotificationType,
  NotificationTypeEnum,
  useNotification,
} from "@/app/components/support/NotificationContext";
import UniqueIDGenerator from "@/app/generators/GenerateUniqueIds";
import { CategoryProperties } from "@/app/pages/personas/ScenarioBuilder";
import { useDispatch } from "react-redux";
import defaultImplementation from "../event/defaultImplementation";
import YourComponent from "../hooks/YourComponent";
import { BaseData, Data } from "../models/data/Data";
import {
  NotificationPosition
} from "../models/data/StatusType";
import { Tag } from "../models/tracker/Tag";
import { CalendarEvent } from "../state/stores/CalendarEvent";
import { AllStatus } from "../state/stores/DetailsListStore";
import { Subscription } from "../subscriptions/Subscription";
import { Subscriber } from "../users/Subscriber";
import { CustomSnapshotData, Payload, Snapshot, Snapshots, UpdateSnapshotPayload } from './LocalStorageSnapshotStore';
import { SnapshotActions } from "./SnapshotActions";
import {
  AuditRecord,
  RetentionPolicy,
  SnapshotStoreConfig,
} from "./SnapshotConfig";
import { snapshot } from "./snapshot";
import { delegate, subscribeToSnapshots } from "./snapshotHandlers";
import { useSnapshotStore } from "./useSnapshotStore";
import { DataStore, useDataStore } from "../projects/DataAnalysisPhase/DataProcessing/DataStore";
import SnapshotImplementation from "./SnapshotImplementation";
import { snapshotType } from "../typings/YourSpecificSnapshotType";
const { notify } = useNotification();
const dispatch = useDispatch();
const notificationContext = useNotification();


const initializeData = (): Data => {
  return {
    id: "initial-id",
    name: "Initial Name",
    value: "Initial Value",
    timestamp: new Date(),
    category: "Initial Category",
  };
};

export const defaultCategory = "defaultCategory";
const initialState = {
  id: "",
  category: defaultCategory,
  timestamp: new Date(),
  length: 0,
  content: undefined,
  data: undefined,
};
interface SnapshotStoreSubset<T extends BaseData> {
  snapshotId: string;
  taskIdToAssign: Snapshot<T> | undefined;
  addSnapshot: (
    snapshot: Omit<Snapshot<Data>, "id">,
    subscribers: Subscriber<CustomSnapshotData | Snapshot<Data>>[]
  ) => void;
  onSnapshot: (
    snapshot: Snapshot<T>,
    config: SnapshotStoreConfig<Snapshot<Data>, Data>[]
  ) => void;

  addSnapshotSuccess: (
    snapshot: Snapshot<T>,
    subscribers: Subscriber<CustomSnapshotData | T>[]
  ) => void;
  updateSnapshot: (
    snapshotId: string,
    data: SnapshotStore<T>,
    events: Record<string, CalendarEvent[]>,
    snapshotStore: SnapshotStore<T>,
    dataItems: RealtimeDataItem[],
    newData: Data,
    payload: UpdateSnapshotPayload<T>
  ) => void;
  removeSnapshot: (snapshotId: string) => void;
  clearSnapshots: () => void;
  createSnapshot: (
    snapshotData:
      | SnapshotStore<Snapshot<Snapshot<T>>>
      | Snapshot<Snapshot<Snapshot<T>>>
      | null
      | undefined
  ) => void;
  createSnapshotSuccess: (snapshot: Snapshot<T>) => void;
  createSnapshotFailure: (snapshot: Snapshot<T>, error: any) => Promise<void>
  updateSnapshots: (snapshot: Snapshot<T>) => Promise<any>
  updateSnapshotSuccess: (snapshot: Snapshot<Data>) => Promise<{
    id: string;
    data: {
        createdAt: Date;
        updatedAt: Date;
        category?: string | CategoryProperties | undefined;
         getData?: () => Promise<T | undefined>;
    };
    timestamp: Date;
    category: string;
    length: number;
    content: undefined;
} | undefined >;
  updateSnapshotFailure: (error: Payload) => void;
  updateSnapshotsSuccess: () => void;
  updateSnapshotsFailure: (error: Payload) => void;
  initSnapshot: (
    snapshotStore: SnapshotStoreConfig<Snapshot<Snapshot<T>>, Snapshot<T>>,
    snapshotData: Snapshot<Snapshot<T>>
  ) => void;
  takeSnapshot: (
    updatedSnapshots: SnapshotStore<Snapshot<T>>
  ) => Promise<Snapshot<T>[] | null>;
  takeSnapshotSuccess: (snapshot: SnapshotStore<Snapshot<T>>) => void;
  takeSnapshotsSuccess: (snapshots: Snapshot<T>[]) => void;
  configureSnapshotStore: (
    snapshotConfigStore: SnapshotStoreConfig<T, Data>
  ) => void;
  getData: () => Data | null;
  flatMap: () => void;
  setData: (data: Data) => void;
  getState: () => any;
  setState: (state: any) => void;
  validateSnapshot: (snapshot: Snapshot<Data>) => boolean;
  handleSnapshot: (snapshot: Snapshot<Data> | null, snapshotId: string) => void;
  handleActions: () => void;
  setSnapshot: (snapshot: Snapshot<T>) => void;
  setSnapshots: (snapshots: Snapshot<T>[]) => void;
  clearSnapshot: (snapshotId: string) => void;
  mergeSnapshots: (snapshots: Snapshot<T>[]) => void;
  reduceSnapshots: () => void;
  sortSnapshots: () => void;
  filterSnapshots: () => void;
  mapSnapshots: () => void;
  findSnapshot: () => void;
  getSubscribers: () => void;
  notify: () => void;
  notifySubscribers: (
    subscribers: Subscriber<CustomSnapshotData | Snapshot<Snapshot<Snapshot<Snapshot<any>>>>>[],
    data: CustomSnapshotData | Snapshot<Snapshot<Snapshot<Snapshot<any>>>>
  ) => Promise<T>;


  subscribe: () => void;
  unsubscribe: () => void;
  fetchSnapshot: () => void;
  fetchSnapshotSuccess: (
    snapshot: Snapshot<Data> | null,
    snapshotId: string
  ) => void;
  fetchSnapshotFailure: () => void;
  getSnapshot: () => void;
  getSnapshots: () => void;
  
  getAllSnapshots: () => void;
  generateId: () => void;
  batchFetchSnapshots: () => void;
  batchTakeSnapshotsRequest: () => void;
  batchUpdateSnapshotsRequest: () => void;
  batchFetchSnapshotsSuccess: () => void;
  batchFetchSnapshotsFailure: () => void;
  batchUpdateSnapshotsSuccess: () => void;
  batchUpdateSnapshotsFailure: () => void;
  batchTakeSnapshot: () => void;
}

type BaseSnapshotMap<T> = T & Map<string, Snapshot<any>>

class SnapshotStore<T extends BaseData>
  implements DataStore<T> {
  id: string | number = '';
  key: string = '';
  topic: string = '';
  date: Date | undefined;
  configOption: SnapshotStoreConfig<Snapshot<T>, T> | null = null;
  config: SnapshotStoreConfig<Snapshot<any>, any>[] | null | undefined = null;
  subscription: Subscription | null = null;
  initialState: SnapshotStore<Snapshot<T>> | Snapshot<Snapshot<T>> | null | undefined;
  category: string | CategoryProperties | undefined;
  timestamp: string | Date | undefined;
  type: string | null = '' ;
  subscribers: Subscriber<Snapshot<T>>[] = [];
  set: ((type: string, event: Event) => void | null) | undefined;
  data: Map<string, Snapshot<T>> = new Map<string, Snapshot<T>>();
  state: Snapshot<Snapshot<T>>[] | null = null;
  snapshots: SnapshotStore<Snapshot<Snapshot<T>>>[] = [];
  subscribeToSnapshots: (
    snapshotId: string,
    callback: (snapshot: Snapshot<T>) => void
  ) => void;
  snapshotConfig: SnapshotStoreConfig<Snapshot<BaseData>, BaseData>[] = [];
  expirationDate?: Date;
  priority?: AllStatus;
  tags?: Tag[];
  metadata?: Record<string, any>;
  status?: "active" | "inactive" | "archived";
  isCompressed?: boolean;

  public dataStore: Map<string, T> = new Map();

  private dataStoreMethods: DataStore<T>;

  delegate: SnapshotStoreConfig<Snapshot<T>, T>[] = [];

  constructor(
    snapshot: T | null,
    category: CategoryProperties,
    date: Date,
    type: string | null,
    initialState:
      | SnapshotStore<Snapshot<T>>
      | Snapshot<Snapshot<T>>
      | null
      | undefined,
    snapshotConfig: SnapshotStoreConfig<Snapshot<BaseData>, BaseData>[],
    subscribeToSnapshots: (
      snapshotId: string,
      callback: (snapshot: Snapshot<T>) => void 
    ) => void ,
    delegate: SnapshotStoreConfig<Snapshot<T>, T>[],
    dataStoreMethods: DataStore<T>
  ) {
    this.timestamp = new Date();
    const prefix = this.determinePrefix(snapshot, category.toString());
    this.id = UniqueIDGenerator.generateID(
      prefix,
      snapshot?.id ||
        snapshot?.name ||
        snapshot?.title ||
        snapshot?.description ||
        "",
      NotificationTypeEnum.GeneratedID
    );
    this.key = "";
    this.topic = "";
    this.date = date;
    this.type = type;
    this.config = null;
    this.configOption = null;
    this.subscription = null;
    this.initialState = initialState || null;
    this.category = category;
    this.timestamp = new Date();
    this.set = undefined;
    this.snapshots = [];
    this.state = null;
    this.subscribers = [];
    this.snapshotConfig = snapshotConfig;
    this.subscribeToSnapshots = subscribeToSnapshots;
    this.data = new Map<string, Snapshot<T>>();
    this.dataStoreMethods = useDataStore<T>() as unknown as DataStore<T>;
  }

  addData(data: T): void {
    this.dataStoreMethods.addData(data);
  }

  removeData(id: number): void {
    this.dataStoreMethods.removeData(id);
  }

  updateData(id: number, newData: T): void {
    this.dataStoreMethods.updateData(id, newData);
  }

  updateDataTitle(id: number, title: string): void {
    this.dataStoreMethods.updateDataTitle(id, title);
  }

  updateDataDescription(description: string): void {
    this.dataStoreMethods.updateDataDescription(description);
  }

  updateDataStatus(status: "pending" | "inProgress" | "completed"): void {
    this.dataStoreMethods.updateDataStatus(status);
  }

  addDataSuccess(payload: { data: T[] }): void {
    this.dataStoreMethods.addDataSuccess(payload);
  }

  getDataVersions(id: number): Promise<T[] | undefined> {
    return this.dataStoreMethods.getDataVersions(id);
  }

  updateDataVersions(id: number, versions: T[]): void {
    this.dataStoreMethods.updateDataVersions(id, versions);
  }

  getBackendVersion(): Promise<string> {
    return this.dataStoreMethods.getBackendVersion();
  }

  getFrontendVersion(): Promise<string> {
    return this.dataStoreMethods.getFrontendVersion();
  }

  fetchData(): Promise<SnapshotStore<Snapshot<T>>[]> {
    return this.dataStoreMethods.fetchData();
  }

  // Implement the snapshot method as expected by SnapshotStoreConfig
  snapshot = async (
      id: string,
      snapshotData: SnapshotStoreConfig<any, T>,
      category: string | CategoryProperties,
      dataStoreMethods: DataStore<T>
    ): Promise<{ snapshot: SnapshotStore<T> }> => {
      // Logic to generate and return the snapshot
      const newSnapshot: SnapshotStore<T> = new SnapshotStore<T>(
        null,
        category as CategoryProperties, // Type assertion to CategoryProperties
        new Date(),
        null, // Type can be set appropriately
        null, // Initial state can be set appropriately
        [], // Placeholder for snapshotConfig, it should be an empty array if no specific config is provided
        (snapshotId: string, callback: (snapshot: Snapshot<T>) => void) => {
          this.subscribeToSnapshots(snapshotId, (snapshot: Snapshot<T>) => {
            callback(snapshot); // Ensure callback receives Snapshot<T>
          });
        },
        [], // Placeholder for delegate
        dataStoreMethods
      );
      return { snapshot: newSnapshot };
    };
  
  removeItem(key: string): void {
    this.dataStore.delete(key);
  }

  getItem(key: string): Promise<T | null> {
    return Promise.resolve(this.dataStore.get(key) || null);
  }

  setItem(key: string, value: T): void {
    this.dataStore.set(key, value);
  }


  addSnapshotFailure(error: Error): void {
    notify(
      `${error.message}`,
      `Snapshot added failed fully.`,
      "Error",
      new Date(),
      NotificationTypeEnum.Error,
      NotificationPosition.TopRight
    );
  }

  getDataStore(): Map<string, T> {
    return this.dataStore;
  }

  addSnapshotSuccess(
    snapshot: Snapshot<T>,
    subscribers: Subscriber<CustomSnapshotData | T>[]
  ): void {
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
          snapshotStore.state as Snapshot<T> | null,
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
        NotificationTypeEnum.Success,
        NotificationPosition.TopRight
      );
    } else {
      // Handle case where snapshotStore matching snapshot is not found
      console.error(`SnapshotStore matching ${snapshot.id} not found.`);
    }
  }

  compareSnapshotState(
    stateA: Snapshot<T> | Snapshot<T>[] | null | undefined,
    stateB: Snapshot<T> | null | undefined
  ): boolean {
    if (!stateA && !stateB) {
      return true; // Both are null or undefined
    }

    if (!stateA || !stateB) {
      return false; // One is null or undefined while the other is not
    }

    // Helper function to compare snapshot objects
    const compareSnapshot = (
      snapshotA: Snapshot<T>,
      snapshotB: Snapshot<T>
    ): boolean => {
      if (!snapshotA && !snapshotB) {
        return true; // Both are null or undefined
      }

      if (!snapshotA || !snapshotB) {
        return false; // One is null or undefined while the other is not
      }

      // Compare based on available properties
      if (snapshotA._id !== undefined && snapshotB._id !== undefined) {
        return snapshotA._id === snapshotB._id;
      }

      return (
        snapshotA.id === snapshotB.id &&
        snapshotA.data === snapshotB.data &&
        snapshotA.name === snapshotB.name &&
        snapshotA.timestamp === snapshotB.timestamp &&
        snapshotA.title === snapshotB.title &&
        snapshotA.createdBy === snapshotB.createdBy &&
        snapshotA.description === snapshotB.description &&
        snapshotA.tags === snapshotB.tags &&
        snapshotA.subscriberId === snapshotB.subscriberId &&
        snapshotA.store === snapshotB.store &&
        this.compareSnapshotState(snapshotA.state, snapshotB.state) &&
        snapshotA.todoSnapshotId === snapshotB.todoSnapshotId &&
        snapshotA.initialState === snapshotB.initialState
        // Add more properties as needed
      );
    };

    // Compare stateA and stateB appropriately based on your application logic
    if (Array.isArray(stateA) !== Array.isArray(stateB)) {
      return false; // One is an array and the other is not
    }

    if (Array.isArray(stateA)) {
      const arrA = stateA as Snapshot<T>[];
      const arrB = stateB as unknown as Snapshot<T>[];

      if (arrA.length !== arrB.length) {
        return false; // Arrays have different lengths
      }

      for (let i = 0; i < arrA.length; i++) {
        if (!compareSnapshot(arrA[i], arrB[i])) {
          return false; // Arrays differ at index i
        }
      }

      return true; // Arrays are deeply equal
    } else {
      return compareSnapshot(stateA as Snapshot<T>, stateB as Snapshot<T>);
    }
  }

   deepCompare(objA: any, objB: any): boolean {
    // Basic deep comparison for objects
    const keysA = Object.keys(objA);
    const keysB = Object.keys(objB);

    if (keysA.length !== keysB.length) {
      return false; // Different number of keys
    }

    for (let key of keysA) {
      if (objA[key] !== objB[key]) {
        return false; // Different value for key
      }
    }

    return true; // Objects are deeply equal
  }

  shallowCompare(objA: any, objB: any): boolean {
    // Basic shallow comparison for objects
    return JSON.stringify(objA) === JSON.stringify(objB);
  }


  getDelegate(): SnapshotStoreConfig<Snapshot<T>, T>[] {
    return this.delegate;
  }

  determinePrefix<T extends Data>(
    snapshot: T | null | undefined,
    category: string
  ): string {
    if (category === "user") {
      return "USR";
    } else if (category === "team") {
      return "TM";
    } else if (category === "project") {
      return "PRJ";
    } else if (category === "task") {
      return "TSK";
    } else if (category === "event") {
      return "EVT";
    } else if (category === "file") {
      return "FIL";
    } else if (category === "document") {
      return "DOC";
    } else if (category === "message") {
      return "MSG";
    } else if (category === "location") {
      return "LOC";
    } else if (category === "coupon") {
      return "CPN";
    } else if (category === "video") {
      return "VID";
    } else if (category === "survey") {
      return "SRV";
    } else if (category === "analytics") {
      return "ANL";
    } else if (category === "chat") {
      return "CHT";
    } else if (category === "thread") {
      return "THD";
    } else if (snapshot?.name) {
      // Ensure snapshot is not null or undefined
      return "SNAP";
    } else {
      return "GEN"; // Default prefix
    }
  }

  async updateSnapshot(
    snapshotId: string,
    data: SnapshotStore<Snapshot<T>>,
    events: Record<string, CalendarEvent[]>,
    snapshotStore: SnapshotStore<Snapshot<T>>,
    dataItems: RealtimeDataItem[],
    newData: Snapshot<T>,
    payload: UpdateSnapshotPayload<T>,
    store: SnapshotStore<any>
  ): Promise<void> {
    try {
      // Check if snapshotStore.data is not null before proceeding
      if (!snapshotStore.data) {
        throw new Error("SnapshotStore data is null");
      }
  
      // Create updated snapshot data
      const updatedSnapshotData: Snapshot<BaseData> = {
        id: snapshotId,
        data: {
          ...(snapshotStore.data || {}), // Ensure default empty object if data is undefined
          ...newData,
        },
        timestamp: new Date(),
        category: "update",
        length: 0,
        content: undefined as undefined, // Explicitly assign undefined
      };
  
      // Assign updated snapshot data back to snapshotStore.data
      snapshotStore.data = updatedSnapshotData as Map<string, Snapshot<Snapshot<T>>>
  
      console.log("Snapshot updated successfully:", snapshotStore);
    } catch (error) {
      console.error("Error updating snapshot:", error);
      throw error;
    }
  }
  
  

  updateSnapshotSuccess(): void {
    notify(
      "updateSnapshotSuccess",
      "Snapshot updated successfully.",
      "",
      new Date(),
      NotificationTypeEnum.Success,
      NotificationPosition.TopRight
    );
  }

  updateSnapshotFailure(payload: { error: string }): void {
    notify(
      "updateSnapshotFailure",
      `Error updating snapshot: ${payload.error}`,
      "",
      new Date(),
      NotificationTypeEnum.Error,
      NotificationPosition.TopRight
    );
  }

  removeSnapshot(snapshotToRemove: SnapshotStore<Snapshot<T>>): void {
    this.snapshots = this.snapshots.filter((s) => s.id !== snapshotToRemove.id);
    notify(
      "removeSnapshot",
      `Snapshot ${snapshotToRemove.id} removed successfully.`,
      "",
      new Date(),
      NotificationTypeEnum.Success,
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
      NotificationTypeEnum.Success,
      NotificationPosition.TopRight
    );
  }

  async addSnapshot(
    snapshot: Data | undefined,
    subscribers: Subscriber<CustomSnapshotData | T>[]
  ): Promise<void> {
    const snapshotData: Snapshot<T> = {
      initialState: this.initialState,
      id: "",
      data: snapshot?.data ?? ({} as T),
      timestamp: new Date(),
      category: this.category,
      subscribers: [],
      key: this.key,
      topic: this.topic,
      state: this.state,
      config: this.config,
      delegate: this.delegate,
      subscription: this.subscription,
      
      // snapshotConfig: this.snapshotConfig,
      // set: this.set,
      // snapshots: this.snapshots,
      // configOption: this.configOption,
      // determinePrefix: this.determinePrefix,
      // updateSnapshot: this.updateSnapshot,
      // updateSnapshotSuccess: this.updateSnapshotSuccess,
      // updateSnapshotFailure: this.updateSnapshotFailure,
      // removeSnapshot: this.removeSnapshot,
      // clearSnapshots: this.clearSnapshots,
      // addSnapshot: this.addSnapshot,
      // addSnapshotSuccess: this.addSnapshotSuccess,
      // addSnapshotFailure: this.addSnapshotFailure,
      // notifySubscribers: this.notifySubscribers,
      // createSnapshot: this.createSnapshot,
      // createSnapshotSuccess: this.createSnapshotSuccess,
      // createSnapshotFailure: this.createSnapshotFailure,
      // updateSnapshots: this.updateSnapshots,
      // updateSnapshotsSuccess: this.updateSnapshotsSuccess,
      // updateSnapshotsFailure: this.updateSnapshotsFailure,
      // initSnapshot: this.initSnapshot,
      // takeSnapshot: this.takeSnapshot,
      // takeSnapshotsSuccess: this.takeSnapshotsSuccess,
      // configureSnapshotStore: this.configureSnapshotStore,
      // getData: this.getData,
      // takeSnapshotSuccess: this.takeSnapshotSuccess,
      // flatMap: this.flatMap,
      // setData: this.setData,
      // getState: this.getState,
      // setState: this.setState,
      // validateSnapshot: this.validateSnapshot,
      // handleSnapshot: this.handleSnapshot,
      // handleActions: this.handleActions,
      // setSnapshot: this.setSnapshot,
      // setSnapshots: this.setSnapshots,
      // clearSnapshot: this.clearSnapshot,
      // mergeSnapshots: this.mergeSnapshots,
      // reduceSnapshots: this.reduceSnapshots,
      // sortSnapshots: this.sortSnapshots,
      // filterSnapshots: this.filterSnapshots,
      // mapSnapshots: this.mapSnapshots,
      // findSnapshot: this.findSnapshot,
      // getSubscribers: this.getSubscribers,
      // notify: this.notify,
      // subscribe: this.subscribe,
      // unsubscribe: this.unsubscribe,
      // fetchSnapshot: this.fetchSnapshot,
      // fetchSnapshotSuccess: this.fetchSnapshotSuccess,
      // fetchSnapshotFailure: this.fetchSnapshotFailure,
      // getSnapshot: this.getSnapshot,
      // getSnapshots: this.getSnapshots,
      // getAllSnapshots: this.getAllSnapshots,
      // generateId: this.generateId,
      // batchFetchSnapshots: this.batchFetchSnapshots,
      // batchTakeSnapshotsRequest: this.batchTakeSnapshotsRequest,
      // batchUpdateSnapshotsRequest: this.batchUpdateSnapshotsRequest,
      // batchFetchSnapshotsSuccess: this.batchFetchSnapshotsSuccess,
      // batchFetchSnapshotsFailure: this.batchFetchSnapshotsFailure,
      // batchUpdateSnapshotsSuccess: this.batchUpdateSnapshotsSuccess,
      // batchUpdateSnapshotsFailure: this.batchUpdateSnapshotsFailure,
      // batchTakeSnapshot: this.batchTakeSnapshot,
      // handleSnapshotSuccess: this.handleSnapshotSuccess,
      // [Symbol.iterator]: this[Symbol.iterator],
      // [Symbol.asyncIterator]: this[Symbol.asyncIterator],
    };

    const prefix = this.determinePrefix(
      snapshot as Snapshot<BaseData>,
      this.category!.toString()
    );
    const id = `${prefix}_${this.generateId()}`;
    snapshotData.id = id;

    const snapshotStoreData: SnapshotStore<Snapshot<any>> = {
      id: snapshotData.id,
      snapshots: [
        {
          data: snapshotData.data as BaseSnapshotMap<T>,
          id: snapshotData.id,
          timestamp: snapshotData.timestamp as Date,
          category: snapshotData.category,
          key: "",
          topic: "",
          date: undefined,
          configOption: null,
          config: undefined,
          subscription: null,
          initialState: undefined,
          set: undefined,
          state: null,
          snapshots: [],
          type: "",
          dataStore: new Map<string, Snapshot<Snapshot<any>>>(),
          // Implement getDataStore to return the expected type
          getDataStore: function () {
            return this.dataStore;
          },
          setSnapshotSuccess: function () {
            defaultImplementation();
            return Promise.reject(new Error("Function not implemented."));
          },
          subscribeToSnapshots: function (
            snapshotId: string,
            callback: (snapshot: Snapshot<Snapshot<Snapshot<Snapshot<any>>>>) => void
          ): void {
            defaultImplementation();
          },
          subscribers: [],
          snapshotConfig: [],
          delegate: (await snapshotStore.getData(data)).getDelegate(),
          getItem: function () {
            defaultImplementation();
            return Promise.reject(new Error("Function not implemented."));
          },
          removeItem: function () {
            defaultImplementation();
            return Promise.reject(new Error("Function not implemented."));
          },
          compareSnapshotState: function () {
            defaultImplementation();
            return false;
          },
          setItem: function () {
            defaultImplementation();
            return Promise.reject(new Error("Function not implemented."));
          },
          deepCompare: function () {
            defaultImplementation();
            return false;
          },
          shallowCompare: function () {
            defaultImplementation();
            return false;
          },
          getDelegate: function () {
            defaultImplementation();
            return [];
          },
          addSnapshotFailure: function (error: Error) {
            defaultImplementation();
          },
          addSnapshotSuccess: function (
            snapshot: Snapshot<Snapshot<Snapshot<Snapshot<any>>>>,
            subscribers: Subscriber<CustomSnapshotData | Snapshot<Snapshot<Snapshot<any>>>>[]
          ) {
            defaultImplementation();
          },
          determinePrefix: function <T extends Data>(
            snapshot: T | null | undefined,
            category: string
          ): string {
            defaultImplementation();
            return "";
          },
          updateSnapshot: function (
            snapshotId: string,
            data: SnapshotStore<Snapshot<Snapshot<Snapshot<Snapshot<any>>>>>,
            events: Record<string, CalendarEvent[]>,
            snapshotStore: SnapshotStore<Snapshot<Snapshot<Snapshot<Snapshot<any>>>>>,
            dataItems: RealtimeDataItem[],
            newData: Snapshot<Snapshot<Snapshot<any>>>,
            payload: UpdateSnapshotPayload<Snapshot<Snapshot<Snapshot<any>>>>
          ): Promise<void> {
            defaultImplementation();
            return Promise.reject(new Error("Function not implemented."));
          },
          updateSnapshotSuccess: function () {
            defaultImplementation();
          },
          updateSnapshotFailure: function (error: Payload) {
            defaultImplementation();
          },
          removeSnapshot: function (
            snapshotToRemove: SnapshotStore<Snapshot<Snapshot<Snapshot<Snapshot<any>>>>>
          ) {
            defaultImplementation();
          },
          clearSnapshots: function () {
            defaultImplementation();
          },
          addSnapshot: function (
            snapshot: Data | undefined,
            subscribers: Subscriber<CustomSnapshotData | Snapshot<Snapshot<Snapshot<any>>>>[]
          ) {
            defaultImplementation();
          },
          createSnapshot: function (
            id: string,
            snapshotData: SnapshotStoreConfig<any, Snapshot<Snapshot<Snapshot<any>>>>,
            category: string
          ): Snapshot<Data> {
            defaultImplementation();
            return {} as Snapshot<Data>;
          },
          createSnapshotSuccess: function (snapshot: Snapshot<Data>) {
            defaultImplementation();
          },
          createSnapshotFailure: function (error: Error) {
            defaultImplementation();
          },
          updateSnapshots: function () {
            defaultImplementation();
          },
          updateSnapshotsSuccess: function () {
            defaultImplementation();
          },
          updateSnapshotsFailure: function (error: Payload) {
            defaultImplementation();
          },
          initSnapshot: function (
            snapshotStoreConfig: SnapshotStoreConfig<BaseData, Snapshot<Snapshot<Snapshot<Snapshot<any>>>>>,
            snapshotData: Snapshot<Snapshot<Snapshot<Snapshot<Snapshot<any>>>>>
          ) {
            defaultImplementation();
          },
         
          takeSnapshot: function (
            snapshot:  SnapshotStoreConfig<T, BaseData>
          ): Promise<{
            snapshot: Snapshot<Snapshot<Snapshot<Snapshot<Snapshot<any>>>>>
          }> {
            defaultImplementation();
            return Promise.reject(new Error("Function not implemented."));
          },
          takeSnapshotSuccess: function (
            snapshot: SnapshotStore<Snapshot<Snapshot<Snapshot<any>>>>
          ) {
            defaultImplementation();
          },
          takeSnapshotsSuccess: function (
            snapshots: Snapshot<Snapshot<Snapshot<Snapshot<any>>>>[]
          ) {
            defaultImplementation();
          },
          configureSnapshotStore: function () {
            defaultImplementation();
          },
          getData: function () {
            defaultImplementation();
            return Promise.reject(new Error("Function not implemented."));
          },
          flatMap: function () {
            defaultImplementation();
          },
          setData: function (data: Data) {
            defaultImplementation();
          },
          getState: function () {
            defaultImplementation();
          },
          setState: function (state: any) {
            defaultImplementation();
          },
          validateSnapshot: function (snapshot: Snapshot<Data>): boolean {
            defaultImplementation();
            return false;
          },
          handleSnapshot: function (
            snapshot: Snapshot<Data> | null,
            snapshotId: string
          ) {
            defaultImplementation();
          },
          handleActions: function () {
            defaultImplementation();
          },
          setSnapshot: function (
            snapshot: SnapshotStore<Snapshot<Snapshot<Snapshot<Snapshot<any>>>>>
          ) {
            defaultImplementation();
          },
          setSnapshots: function (
            snapshots: Snapshot<Snapshot<Snapshot<Snapshot<any>>>>[]
          ) {
            defaultImplementation();
          },
          clearSnapshot: function (snapshotId: string) {
            defaultImplementation();
          },
          mergeSnapshots: function (
            snapshots: Snapshot<Snapshot<Snapshot<Snapshot<any>>>>[]
          ) {
            defaultImplementation();
          },
          reduceSnapshots: function () {
            defaultImplementation();
          },
          sortSnapshots: function () {
            defaultImplementation();
          },
          filterSnapshots: function () {
            defaultImplementation();
          },
          mapSnapshots: function () {
            defaultImplementation();
          },
          findSnapshot: function () {
            defaultImplementation();
          },
          getSubscribers: function () {
            defaultImplementation();
          },
          notify: function () {
            defaultImplementation();
          },
          notifySubscribers: function (
            subscribers: Subscriber<CustomSnapshotData
              | Snapshot<Snapshot<Snapshot<Snapshot<any>>>>>[],
            data: CustomSnapshotData | Snapshot<Snapshot<Snapshot<Snapshot<any>>>>
          ): Subscriber<Snapshot<Snapshot<Snapshot<Snapshot<Snapshot<any>>>>>>[]  {
            return Promise.resolve(Subscriber<Snapshot<T>>);
          },
          subscribe: function () {
            defaultImplementation();
          },
          unsubscribe: function () {
            defaultImplementation();
          },
          fetchSnapshot: function (
          snapshot: Snapshot<Data> | null,
          ) {
            defaultImplementation();
          },
          fetchSnapshotSuccess: function (
            snapshot: Snapshot<Data> | null,
            snapshotId: string
          ) {
            defaultImplementation();
          },
          fetchSnapshotFailure: function () {
            defaultImplementation();
          },
          getSnapshot: function () {
            defaultImplementation();
          },
          getSnapshots: function () {
            defaultImplementation();
          },
          getAllSnapshots: function () {
            defaultImplementation();
          },
          generateId: function () {
            defaultImplementation();
            return "";
          },
          batchFetchSnapshots: function () {
            defaultImplementation();
          },
          batchTakeSnapshotsRequest: function () {
            defaultImplementation();
          },
          batchUpdateSnapshotsRequest: function () {
            defaultImplementation();
          },
          batchFetchSnapshotsSuccess: function () {
            defaultImplementation();
          },
          batchFetchSnapshotsFailure: function () {
            defaultImplementation();
          },
          batchUpdateSnapshotsSuccess: function () {
            defaultImplementation();
          },
          batchUpdateSnapshotsFailure: function () {
            defaultImplementation();
          },
          batchTakeSnapshot: function (
            snapshot: SnapshotStore<Snapshot<Snapshot<Snapshot<Snapshot<any>>>>>,
            snapshots: Snapshots
          ): Promise<{ snapshots: Snapshots}> {
            defaultImplementation();
            return Promise.reject(new Error("Function not implemented."));
          },
          handleSnapshotSuccess: function (
            snapshot: Snapshot<Data> | null,
            snapshotId: string
          ) {
            defaultImplementation();
          },
          [Symbol.iterator]: function (): IterableIterator<
            Snapshot<Snapshot<Snapshot<any>>>
          > {
            defaultImplementation();
            return {} as IterableIterator<Snapshot<Snapshot<Snapshot<any>>>>;
          },
          [Symbol.asyncIterator]: function (): AsyncIterableIterator<
            Snapshot<Snapshot<Snapshot<any>>>
          > {
            defaultImplementation();
            return {} as AsyncIterableIterator<Snapshot<Snapshot<Snapshot<any>>>>;
          },

        },

      ],
    }

    this.snapshots.push(snapshotStoreData);
    this.addSnapshotSuccess(snapshotData, subscribers);
    this.notifySubscribers(snapshotData, subscribers);
    this.delegate[0].addSnapshot(snapshotData, subscribers);
    this.delegate[0].notifySubscribers(snapshotData, subscribers);
  }

  createSnapshot(
    id: string,
    snapshotData: SnapshotStoreConfig<any, T>,
    category: string
  ): Snapshot<Data> {
    if (!snapshotData) {
      throw new Error("snapshotData is null or undefined");
    }

    let data: Data;
    if ("data" in snapshotData && snapshotData.data) {
      data = snapshotData.data;
    } else if (snapshotData.data && "data" in snapshotData.data) {
      data = snapshotData.data.data;
    } else {
      throw new Error("snapshotData does not have a valid 'data' property");
    }

    id =
      typeof data.id === "string"
        ? data.id
        : String(
            UniqueIDGenerator.generateID(
              "SNAP",
              "defaultID",
              NotificationTypeEnum.GeneratedID
            )
          );

    const snapshot: Snapshot<Data> = {
      id,
      data,
      timestamp: snapshotData.timestamp || new Date(),
      category: this.category,
      topic: this.topic,
      
    };

    this.snapshots.push(snapshot);
    this.delegate[0].createSnapshotSuccess(snapshot);

    return snapshot;
  }

  createSnapshotSuccess(snapshot: Snapshot<Data>): void {
    if (snapshot.id !== undefined) {
      notify(
        String(snapshot.id), // Ensure snapshot.id is treated as a string
        `Snapshot ${snapshot.id} created successfully.`,
        "",
        new Date(),
        NotificationTypeEnum.Success,
        NotificationPosition.TopRight
      );
    } else {
      console.error("Snapshot id is undefined.");
      // Optionally handle the case where snapshot.id is undefined
    }
  }

  setSnapshotSuccess(snapshotData: SnapshotStore<Snapshot<T>>, subscribers: ((data: Snapshot<Snapshot<T>>) => void)[]): void { 
    this.delegate[0].setSnapshotSuccess(snapshotData, subscribers);
  }

  createSnapshotFailure(error: Error): void {
    notify(
      "createSnapshotFailure",
      `Error creating snapshot: ${error.message}`,
      "",
      new Date(),
      NotificationTypeEnum.Error,
      NotificationPosition.TopRight
    );
    this.delegate[0].createSnapshotFailure(error);
  }

   // Example method similar to updateSnapshots
  updateSnapshots(): void {
    this.delegate[0].updateSnapshots();
  }

  // Example method similar to updateSnapshotsSuccess
  updateSnapshotsSuccess(
    snapshotData: (subscribers: Subscriber<Snapshot<Snapshot<T>>>[], snapshot: Snapshots<T>)=>void ): void {
    if (this.delegate.length > 0 && typeof this.delegate[0].updateSnapshotsSuccess === 'function') {
      this.delegate[0].updateSnapshotsSuccess(snapshotData);
    }
  }

  updateSnapshotsFailure(error: Payload): void {
    this.delegate[0].updateSnapshotsFailure(error);
  }

  initSnapshot(
    snapshotStore: SnapshotStoreConfig<T, BaseData>,
    snapshotData: Snapshot<Snapshot<T>>
  ): void {
    return this.delegate[0].initSnapshot(snapshotStore, snapshotData);
  }

  
  async takeSnapshot(snapshot: SnapshotStore<Snapshot<T>>): Promise<{
    snapshot: SnapshotStore<Snapshot<T>>
  }> {
    const result = await this.delegate[0].takeSnapshot(snapshot);
    if (result !== null && Array.isArray(result)) {
      const snapshotStoreWrapper: SnapshotStore<Snapshot<T>> = {
        ...result[0],
        data: result[0].data as Snapshot<T>,
        timestamp: result[0].timestamp,
        type: result[0].type,
        id: result[0].id,
        key: result[0].key,
      };
      return {
        snapshot: snapshotStoreWrapper,
      };
    }
    throw new Error("Failed to take snapshot");
  }

  

  takeSnapshotSuccess(snapshot: SnapshotStore<Snapshot<T>>): void {
    this.delegate[0].takeSnapshotSuccess(snapshot);
  }

  takeSnapshotsSuccess(snapshots: Snapshot<T>[]): void {
    this.delegate[0].takeSnapshotsSuccess(snapshots);
  }

  configureSnapshotStore(
    snapshot: SnapshotStore<Snapshot<T>>
  ): void {
    this.delegate[0].configureSnapshotStore(snapshot);
  }



  
    public async getData<T extends Data>(data: Snapshot<Data> | Snapshot<CustomSnapshotData>): Promise<{
      data: (Snapshot<Data> | Snapshot<CustomSnapshotData>)[],
      getDelegate: SnapshotStore<Snapshot<T>>,
    }> {
      try {
        const fetchedData = (await this.delegate[0].getData(data)).data
        const getDelegate = (await snapshotStore.getData(data)).getDelegate; 
      
        return {
          data: fetchedData,
          getDelegate
        };
      } catch (error) {
        console.error("Error fetching data:", error);
        throw error;
      }
    }


  public flatMap(
    value: SnapshotStoreConfig<Snapshot<T>, T>,
    index: number,
    array: SnapshotStoreConfig<Snapshot<T>, T>[]
  ): void {
    this.delegate.forEach((delegateItem, i, arr) => {
      // Ensure the value type matches the delegateItem type
      const valueAsExpectedType = value as SnapshotStoreConfig<Snapshot<T>, T>;
      delegateItem.flatMap(valueAsExpectedType, index, array);
    });
  }

  setData(data: T): void {
    this.delegate[0].setData(data);
  }

  getState(): any {
    return this.delegate[0].getState();
  }

  setState(state: any): void {
    this.delegate[0].setState(state);
  }

  validateSnapshot(snapshot: Snapshot<Data>): boolean {
    return this.delegate[0].validateSnapshot(snapshot);
  }

  handleSnapshot(
    snapshot: Snapshot<Data> | null,
    snapshotId: string
  ): void {
    this.delegate[0].handleSnapshot(snapshot, snapshotId);
  }

  handleActions(): void {
    this.delegate[0].handleActions();
  }

  setSnapshot(snapshot: SnapshotStore<Snapshot<T>>): void {
    this.delegate[0].setSnapshot(snapshot);
  }

  setSnapshots(snapshots: Snapshot<T>[]): void {
    this.delegate[0].setSnapshots(snapshots);
  }

  clearSnapshot(snapshotId: string): void {
    this.delegate[0].clearSnapshot(snapshotId);
  }

  mergeSnapshots(snapshots: Snapshot<T>[]): void {
    this.delegate[0].mergeSnapshots(snapshots);
  }

  reduceSnapshots(): void {
    this.delegate[0].reduceSnapshots();
  }

  sortSnapshots(): void {
    this.delegate[0].sortSnapshots();
  }

  filterSnapshots(): void {
    this.delegate[0].filterSnapshots();
  }

  mapSnapshots(): void {
    this.delegate[0].mapSnapshots();
  }

  findSnapshot(): void {
    this.delegate[0].findSnapshot();
  }

  getSubscribers(
    subscribers: Subscriber<Snapshot<T>>[],
    snapshots: Snapshots<T>
  ): Promise<{
    subscribers: Subscriber<Snapshot<Snapshot<T>>>[];
    snapshots: Snapshots<T>
  }> {
   return this.delegate[0].getSubscribers(subscribers, snapshots);
  }

  notify(): // id: string,
  // message: string,
  // content: any,
  // date: Date,
  // type: NotificationType,
  // notificationPosition?: NotificationPosition | undefined
  void {
    this.delegate[0].notify(
      message,
      content,
      new Date(),
      type
    );
  }

  notifySubscribers(
    subscribers: Subscriber<CustomSnapshotData | Snapshot<T>>[],
    data: Snapshot<Snapshot<T>>
  ): Subscriber<Snapshot<Snapshot<T>>>[] {
    return this.delegate[0].notifySubscribers(subscribers, data);
  }

  subscribe(): void {
    this.delegate[0].subscribe();
  }

  unsubscribe(): void {
    this.delegate[0].unsubscribe();
  }

  fetchSnapshot(
    snapshot: SnapshotStore<T> | undefined
  ): Promise<{
    id: any;
    category: any;
    timestamp: any;
    snapshot: SnapshotStore<T>;
    data: Snapshot<T>;
  }>  {
    return this.delegate[0].fetchSnapshot(snapshot);
  }

  fetchSnapshotSuccess(
    snapshot: Snapshot<Data> | null,
    snapshotId: string
  ): void {
    this.delegate.fetchSnapshotSuccess(snapshot, snapshotId);
  }

  fetchSnapshotFailure(): void {
    this.delegate.fetchSnapshotFailure();
  }

  getSnapshot(
    snapshot: SnapshotStore<Snapshot<T>>
  ): void {
    this.delegate[0].getSnapshot(snapshot);
  }

  getSnapshots(
    data: Snapshots<T>
  ): void {
    this.delegate[0].getSnapshots(data);
  }

  getAllSnapshots(
    data: (
      subscribers: Subscriber<Snapshot<Snapshot<T>>>[],
      snapshots: Snapshots<T>
    ) => Promise<Snapshots<T>>
  ): void {
    this.delegate[0].getAllSnapshots(data);
  }
  generateId(): string {
    const delegateWithGenerateId = this.delegate.find((d) => d.generateId);
    const generatedId = delegateWithGenerateId?.generateId();
    return typeof generatedId === "string" ? generatedId : "";
  }

  batchFetchSnapshots(): void {
    this.delegate.batchFetchSnapshots();
  }

  batchTakeSnapshotsRequest(): void {
    this.delegate.batchTakeSnapshotsRequest();
  }

  batchUpdateSnapshotsRequest(): void {
    this.delegate.batchUpdateSnapshotsRequest();
  }

  batchFetchSnapshotsSuccess(): void {
    this.delegate.batchFetchSnapshotsSuccess();
  }

  batchFetchSnapshotsFailure(): void {
    this.delegate.batchFetchSnapshotsFailure();
  }

  batchUpdateSnapshotsSuccess(): void {
    this.delegate.batchUpdateSnapshotsSuccess();
  }

  batchUpdateSnapshotsFailure(): void {
    this.delegate.batchUpdateSnapshotsFailure();
  }

  batchTakeSnapshot(
    snapshot: SnapshotStore<Snapshot<T>>,
    snapshots: Snapshots<Snapshot<T>>
  ): Promise<{ snapshots: Snapshots<Snapshot<T>> }> {
    return new Promise((resolve) => {
      const result = this.delegate.batchTakeSnapshot();
      resolve({ snapshots: result });
    });
  }

  handleSnapshotSuccess(
    snapshot: Snapshot<Data> | null,
    snapshotId: string
  ): void {
    // Ensure the snapshot is not null before proceeding
    if (snapshot) {
      // Perform actions required for handling the successful snapshot
      // For example, updating internal state, notifying subscribers, etc.
      SnapshotActions.handleSnapshotSuccess({ snapshot, snapshotId });
      console.log(`Handling success for snapshot ID: ${snapshotId}`);
      // Implement additional logic here based on your application's needs
    }
    // No return statement needed since the method should return void
  }

  // Implementing [Symbol.iterator] method
  [Symbol.iterator](): IterableIterator<Snapshot<T>> {
    return this.snapshots.values() as IterableIterator<Snapshot<T>>;
    // Adjust the return type to match IterableIterator<Snapshot<T>>
  }

  // Implementing [Symbol.asyncIterator] method
  [Symbol.asyncIterator](): AsyncIterableIterator<Snapshot<T>> {
    const asyncIterable: AsyncIterable<Snapshot<T>> = {
      [Symbol.asyncIterator]: async () => this[Symbol.asyncIterator](),
      next: async () => ({ done: true, value: undefined }),
    };

    return asyncIterable[Symbol.asyncIterator]();
    // Adjust the return type to match AsyncIterableIterator<Snapshot<T>>
  }

  isExpired?(): boolean {
    return !!this.expirationDate && new Date() > this.expirationDate;
  }

  compress?(): void {
    // Implementation here
  }
  isEncrypted?: boolean;
  encrypt?(): void {
    // Implementation here
  }
  decrypt?(): void {
    // Implementation here
  }
  ownerId?: string;
  getOwner?(): string {
    return this.ownerId || "";
  }
  version?: string;
  previousVersionId?: string;
  nextVersionId?: string;
  auditTrail?: AuditRecord[];
  addAuditRecord?(record: AuditRecord): void {
    // Implementation here
  }
  retentionPolicy?: RetentionPolicy;
  dependencies?: string[];
}

// Example usage of the Snapshot interface
const takeSnapshot = async () => {
  const snapshotData = await fetchInitialSnapshotData();
  const { takeSnapshot } = useSnapshotStore(addToSnapshotList);
  const snapshot = await takeSnapshot(snapshotData);
  console.log(snapshot);
};

// Example functions for adding snapshots to the UI and displaying toast messages
const addToSnapshotList = (snapshot: Snapshot<Data>) => {
  // Assuming you have a function to add the snapshot to a list in your UI
  console.log("Snapshot added to list:", snapshot);
};

const displayToast = (message: string) => {
  // Assuming you have a function to display toast messages in your UI
  console.log("Toast message:", message);
};

const handleSnapshotOperation = async (
  
  snapshot: SnapshotStore<any>,
  data: SnapshotStoreConfig<any, any>
  
  // snapshot: Snapshot<Data> | null,
  // snapshotId: string
) => {
  // Assuming you have a function to handle the snapshot operation in your UI
  console.log("Snapshot operation handled:", snapshot, snapshotId);
  // Implement additional logic here based on your application's needs
  // For example, updating internal state, notifying subscribers, etc.
  SnapshotActions.handleSnapshotSuccess({ snapshot, snapshotId });
  // No return statement needed since the method should return void
};

// Example functions for fetching initial snapshot data and current data
const fetchInitialSnapshotData = async (): Promise<Snapshot<Data>[]> => {
  await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate delay of 1 second

  // Return initial snapshot data as an array of Snapshot<Data> objects
  return [
    {
      id: "1",
      data: {
        exampleData: "Initial snapshot data 1",
        timestamp: undefined,
        category: "",
      },
      timestamp: new Date(),
      category: "Initial Category 1",
      type: "",
      store: {} as SnapshotStore<Snapshot<Data>>,
    },
    {
      id: "2",
      data: {
        exampleData: "Initial snapshot data 2",
        timestamp: undefined,
        category: "",
      },
      timestamp: new Date(),
      category: "Initial Category 2",
      type: "",
      store: {} as SnapshotStore<Snapshot<Data>>,
    },
  ];
};

// Usage example:
const snapshotId = useSnapshotStore(addToSnapshotList);
const category = process.argv[3] as keyof CategoryProperties ?? "isHiddenInList"
const dataStoreMethods = {}
// const snapshotId = "exampleSnapshotId";
const data = new SnapshotStore<Snapshot<Data>>(
  snapshot,
  category,
  new Date(),
  snapshotType,
  initialState,
  handleSnapshotOperation,
  displayToast,
  addToSnapshotList,
  dataStoreMethods
  // delegate
  // fetchInitialSnapshotData,
  // fetch
);
const events: Record<string, CalendarEvent[]> = {};
const snapshotStore = new SnapshotStore<Snapshot<Data>>(
  snapshot,
  category,
  new Date(),
  snapshotType,
  initialState,
  handleSnapshotOperation,
  displayToast,
  addToSnapshotList,
  dataStoreMethods
);
const dataItems: RealtimeDataItem[] = [];
const newData: Data = {
  /* new data properties */

};
const payload: UpdateSnapshotPayload<Data> = {
  /* payload properties */
  snapshotId: snapshotId,
  newData: newData,
};

const component = new YourComponent<Data>();

component
  .updateSnapshot(
    snapshotId,
    data,
    events,
    snapshotStore,
    dataItems,
    newData,
    payload
  )
  .then(() => {
    console.log("Snapshot update completed.");
  })
  .catch((error: any) => {
    console.error("Error during snapshot update:", error);
  });

const snapshotStoreConfig: SnapshotStoreConfig<any, any> = {
  snapshotId: "exampleSnapshotId",
  category: "exampleCategory",
  initialState: {
    title: "Initial snapshot data",
    timestamp: undefined,
    category: "",
  },
  handleSnapshotOperation: handleSnapshotOperation,
  displayToast: displayToast,
  addToSnapshotList: addToSnapshotList,
  fetchInitialSnapshotData: fetchInitialSnapshotData,
  fetch: fetch,
};

export default SnapshotStore;
export { handleSnapshotOperation, initialState, initializeData, snapshotStoreConfig };
export type {
  SnapshotStoreSubset
};

