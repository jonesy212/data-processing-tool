// import { Snapshots } from '@/app/components/snapshots/SnapshotStore';
import { RealtimeDataItem } from "@/app/components/models/realtime/RealtimeData";
import {
  NotificationType,
  NotificationTypeEnum,
  useNotification
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
import { DataStore, useDataStore } from "../projects/DataAnalysisPhase/DataProcessing/DataStore";
import { CalendarEvent } from "../state/stores/CalendarEvent";
import { AllStatus } from "../state/stores/DetailsListStore";
import { Subscription } from "../subscriptions/Subscription";
import { convertSnapshotStoreToSnapshot, snapshotType } from "../typings/YourSpecificSnapshotType";
import { Subscriber } from "../users/Subscriber";
import { CustomSnapshotData, Payload, Snapshot, Snapshots, UpdateSnapshotPayload } from './LocalStorageSnapshotStore';
import { SnapshotActions } from "./SnapshotActions";
import {
  AuditRecord,
  RetentionPolicy,
  SnapshotStoreConfig,
} from "./SnapshotConfig";
import { snapshot } from "./snapshot";
import { useSnapshotStore } from "./useSnapshotStore";
import { BaseDatabaseService } from "@/app/configs/DatabaseConfig";
import { AxiosError } from "axios";
import { handleApiError } from "@/app/api/ApiLogs";
import { getSnapshotId } from "@/app/api/SnapshotApi";
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

export const defaultCategory: CategoryProperties = {
  name: "DefaultCategory",
  description: "",
  icon: "",
  color: "",
  iconColor: "",
  isActive: true,
  isPublic: true,
  isSystem: true,
  isDefault: true,
  isHidden: false,
  isHiddenInList: false,
  UserInterface: [],
  DataVisualization: [],
  Forms: undefined,
  Analysis: [],
  Communication: [],
  TaskManagement: [],
  Crypto: [],
  brandName: "",
  brandLogo: "",
  brandColor: "",
  brandMessage: "",
};
 

const defaultSubscribeToSnapshots = (snapshotId: string, callback: (snapshot: Snapshot<BaseData>) => void): void => {
  // Dummy implementation
};

const defaultDelegate: SnapshotStoreConfig<BaseData, BaseData>[] = [];

const defaultDataStoreMethods: DataStore<BaseData> = {
  data: new Map<string, BaseData>(),
  addData: (data: BaseData) => { },
  addDataStatus: (id: number, status: "pending" | "inProgress" | "completed") => { },
  updateData: (id: number, newData: BaseData) => { },
  removeData: (id: number) => { },
  updateDataTitle: (id: number, title: string) => { },
  updateDataDescription: (id: number, description: string) => { },
  updateDataStatus: (id: number, status: "pending" | "inProgress" | "completed") => { },
  getItem: async (key: string) => undefined,
  setItem: async (id: string, item: BaseData) => { },
  removeItem: async (key: string) => { },
  getAllKeys: async () => [],
  getAllItems: async () => [],
  getDataVersions: async (id: number): Promise<BaseData[] | undefined> => {
    return undefined;
  },
  // addDataSuccess: async (data: BaseData, subscribers: Subscriber<BaseData>[]) => { },
  updateDataVersions: async (id: number, newData: BaseData) => { },
  getBackendVersion: async (): Promise<string > => {
    return "0.0.0";
  },
  getFrontendVersion: async (): Promise<string> => {
      return "0.0.0";
  },
  addDataSuccess: async (payload: { data: BaseData[] }) => { },
  fetchData: async (): Promise<SnapshotStore<BaseData>[]> => {
    return [];
  }

};




interface SnapshotStoreSubset<T extends BaseData> {
  snapshotId: string;
  taskIdToAssign: Snapshot<T> | undefined;
  addSnapshot: (snapshot: Omit<Snapshot<Data>, "id">, subscribers: Subscriber<BaseData>[]) => void;
  onSnapshot: (snapshot: Snapshot<T>, config: SnapshotStoreConfig<BaseData, Data>[]) => void;
  addSnapshotSuccess: (snapshot: Snapshot<T>, subscribers: Subscriber<BaseData>[]) => void;
  updateSnapshot: (snapshotId: string, data: SnapshotStore<BaseData>, events: Record<string, CalendarEvent[]>, snapshotStore: SnapshotStore<T>, dataItems: RealtimeDataItem[], newData: Data, payload: UpdateSnapshotPayload<T>) => void;
  removeSnapshot: (snapshotId: string) => void;
  clearSnapshots: () => void;
  createSnapshot: (snapshotData: SnapshotStore<BaseData> | Snapshot<BaseData> | null | undefined) => void;
  createSnapshotSuccess: (snapshot: Snapshot<T>) => void;
  createSnapshotFailure: (snapshot: Snapshot<T>, error: any) => Promise<void>;
  updateSnapshots: (snapshot: Snapshot<T>) => Promise<any>;
  updateSnapshotSuccess: (snapshot: Snapshot<Data>) => Promise<{ id: string; data: { createdAt: Date; updatedAt: Date; category?: string | CategoryProperties | undefined; getData?: () => Promise<T | undefined>; }; timestamp: Date; category: string; length: number; content: undefined; } | undefined>;
  updateSnapshotFailure: (error: Payload) => void;
  updateSnapshotsSuccess: () => void;
  updateSnapshotsFailure: (error: Payload) => void;
  initSnapshot: (snapshotStore: SnapshotStoreConfig<BaseData, BaseData>, snapshotData: Snapshot<BaseData>) => void;
  takeSnapshot: (updatedSnapshots: SnapshotStore<BaseData>) => Promise<BaseData[] | null>;
  takeSnapshotSuccess: (snapshot: SnapshotStore<BaseData>) => void;
  takeSnapshotsSuccess: (snapshots: Snapshot<T>[]) => void;
  configureSnapshotStore: (snapshotConfigStore: SnapshotStoreConfig<T, Data>) => void;
  getData: () => Data | null;
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
  notifySubscribers: (subscribers: Subscriber<BaseData>[], data: CustomSnapshotData | Snapshot<BaseData>) => Promise<T>;
  subscribe: () => void;
  unsubscribe: () => void;
  fetchSnapshot: () => void;
  fetchSnapshotSuccess: (snapshot: Snapshot<Data> | null, snapshotId: string) => void;
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

type BaseSnapshotMap<T> = T & Map<string, Snapshot<any>>;
 
interface SnapshotData extends BaseData {
  createdAt: Date;
  updatedAt: Date;
  id: string;
  title: string;
  description: string;
  status: "active" | "inactive" | "archived";
  category: string;
}

class SnapshotStore<T extends BaseData> implements DataStore<T> {
  id: string | number = '';
  key: string = '';
  topic: string = '';
  date: Date | undefined;
  configOption: SnapshotStoreConfig<BaseData, T> | null = null;
  config: SnapshotStoreConfig<BaseData, any>[] | null | undefined = null;
  subscription?: Subscription | null = null;
  category: string | CategoryProperties | undefined;
  timestamp: string | Date | undefined;
  type: string | undefined | null = '';
  subscribers: Subscriber<BaseData>[] = [];
  set: ((type: string, event: Event) => void | null) | undefined;
  data?: Map<string, T> = new Map<string, T>();
  state: SnapshotStore<any>[] | null = null;
  snapshots: SnapshotStore<BaseData>[] = [];
  subscribeToSnapshots: (snapshotId: string, callback: (snapshot: Snapshot<T>) => void) => void;
  snapshotConfig: SnapshotStoreConfig<BaseData, BaseData>[] = [];
  expirationDate?: Date;
  priority?: AllStatus;
  tags?: Tag[];
  metadata?: Record<string, any>;
  status?: "active" | "inactive" | "archived";
  isCompressed?: boolean;
  private initialState: Map<string, T>

  public dataStore: Map<string, T> = new Map();

  private dataStoreMethods: DataStore<T>;

  delegate: SnapshotStoreConfig<BaseData, T>[] = [];
  subscriberId: string = ''; // Added missing property
  length: number = 0; // Added missing property
  content: string = ''; // Added missing property
  value: number = 0; // Added missing property
  todoSnapshotId: string = ''; // Added missing property

  constructor(
    initialState: Map<string, T> | null,
    category: CategoryProperties,
    date: Date,
    type: string | null,
    snapshotConfig: SnapshotStoreConfig<BaseData, BaseData>[],
    subscribeToSnapshots: (snapshotId: string, callback: (snapshot: Snapshot<T>) => void) => void,
    delegate: SnapshotStoreConfig<BaseData, T>[],
    dataStoreMethods: DataStore<T>,
  ) {
    this.timestamp = new Date();
    const prefix = this.determinePrefix(snapshot, category.toString());
    this.id = UniqueIDGenerator.generateID(
      prefix,
      snapshot?.id || snapshot?.name || snapshot?.title || snapshot?.description || "",
      NotificationTypeEnum.GeneratedID
    );
    this.initialState = initialState ?? new Map<string, T>();
    if (initialState) {
      this.data = initialState;
    }
    this.key = "";
    this.topic = "";
    this.date = date;
    this.type = type;
    this.config = null;
    this.configOption = null;
    this.subscription = null;
    this.category = category;
    this.timestamp = new Date();
    this.set = undefined;
    this.snapshots = [];
    this.state = null;
    this.subscribers = [];
    this.snapshotConfig = snapshotConfig;
    this.subscribeToSnapshots = subscribeToSnapshots;
    this.data = new Map<string, T>();
    this.delegate = delegate;
    this.dataStore = this.initialState;
    this.dataStoreMethods = dataStoreMethods;
    this.subscriberId = '';
    this.length = 0;
    this.content = '';
    this.value = 0;
    this.todoSnapshotId = '';
  }

  getAllKeys(): Promise<string[]> {
    return this.dataStoreMethods.getAllKeys();
  }

  getAllItems(): Promise<T[]> {
    return this.dataStoreMethods.getAllItems();
  }

  addData(data: T): void {
    this.dataStoreMethods.addData(data);
  }

  addDataStatus(id: number, status: "pending" | "inProgress" | "completed"): void {
    this.dataStoreMethods.addDataStatus(id, status);
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

  updateDataDescription(id: number, description: string): void {
    this.dataStoreMethods.updateDataDescription(id, description);
  }

  updateDataStatus(id: number, status: "pending" | "inProgress" | "completed"): void {
    this.dataStoreMethods.updateDataStatus(id, status);
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

  getBackendVersion(): Promise<string | undefined> {
    return this.dataStoreMethods.getBackendVersion();
  }

  getFrontendVersion(): Promise<string | undefined> {
    return this.dataStoreMethods.getFrontendVersion();
  }

  fetchData(id: number): Promise<SnapshotStore<BaseData>[]> {
    return this.dataStoreMethods.fetchData(id);
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
      this.initialState,
      category as CategoryProperties, // Type assertion to CategoryProperties
      new Date(),
      null, // Type can be set appropriately
      [], // Placeholder for snapshotConfig, it should be an empty array if no specific config is provided
      (snapshotId: string, callback: (snapshot: Snapshot<T>) => void) => {
        this.subscribeToSnapshots(snapshotId, (snapshot: Snapshot<T>) => {
          callback(snapshot); // Ensure callback receives Snapshot<T>
        });
      },
      [], // Placeholder for delegate
      dataStoreMethods,
    );
    return { snapshot: newSnapshot };
  };
  
  removeItem(key: string): Promise<void> {
    return this.dataStoreMethods.removeItem(key);
  }

  getSnapshot(
    snapshot: () => Promise<{
      category: any;
      timestamp: any;
      id: any;
      snapshot: SnapshotStore<BaseData>;
      data: T;
    }> | undefined
  ): Promise<SnapshotStore<BaseData>> {
    return this.delegate[0].getSnapshot(snapshot);
  }

  getItem(key: string): Promise<T | undefined> {
    if (this.dataStore) {
      return Promise.resolve(this.dataStore.get(key));
    }
  
    const snapshotId = ''; // Define snapshotId correctly
  
    return this.fetchSnapshot(
      snapshotId,
      this.category as string,
      this.timestamp as Date,
      this.snapshot as unknown as Snapshot<T>,
      this.data as unknown as T,
      this.delegate
    ).then((snapshot) => {
      if (snapshot) {
        const item = snapshot.getItem ? snapshot.getItem(key) : snapshot.data.get(key);
        return item as T | undefined; // Ensure item is of type T | undefined
      } else {
        return undefined;
      }
    }).catch((error: Error) => {
      console.error('Error fetching snapshot:', error);
      return undefined;
    });
  }
  

  setItem(key: string, value: T): Promise<void> {
    this.dataStore.set(key, value)
    return Promise.resolve();
  }
 
  addSnapshotFailure(date: Date, error: Error): void {
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
    snapshot: T,
    subscribers: Subscriber<BaseData>[]
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


  getDelegate(): SnapshotStoreConfig<BaseData, BaseData>[] {
    return this.delegate;
  }

  determineCategory(snapshot: Snapshot<T> | null | undefined): string {
    if (snapshot && snapshot.store) {
      return snapshot.store.toString();
    }
    return "";
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
    data: SnapshotStore<BaseData>,
    events: Record<string, CalendarEvent[]>,
    snapshotStore: SnapshotStore<BaseData>,
    dataItems: RealtimeDataItem[],
    newData: Snapshot<T>,
    payload: UpdateSnapshotPayload<T>,
    store: SnapshotStore<any>
  ): Promise<void> {
    try {
      // Create updated snapshot data
      const updatedSnapshotData: Snapshot<BaseData> = {
        id: snapshotId,
        data: {
          ...(snapshotStore.data || new Map<string, T>()), // Ensure default empty map if data is undefined
          ...newData,
        },
        timestamp: new Date(),
        category: "update",
        length: 0,
        content: undefined as undefined,
        initialState: null
      };
    
      // Assign updated snapshot data back to snapshotStore.data
      snapshotStore.data = new Map<string, BaseData>(); // Initialize if needed
      snapshotStore.data.set(snapshotId.toString(), updatedSnapshotData as BaseData);
    
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

  removeSnapshot(snapshotToRemove: SnapshotStore<BaseData>): void {
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
    subscribers: Subscriber<BaseData | T>[]
  ): Promise<void> {
    const snapshotData: Snapshot<T> = {
      // initialState: this.initialState,
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
      snapshot,
      this.category!.toString()
    );
    const id = `${prefix}_${this.generateId()}`;
    snapshotData.id = id;

    const snapshotStoreData: SnapshotStore<T> = {
      id: snapshotData.id,
      snapshots: [
        {
          data: snapshotData.data as Map<string, T> ,
          id: snapshotData.id,
          timestamp: snapshotData.timestamp as Date,
          category: snapshotData.category,
          key: "",
          topic: "",
          date: undefined,
          configOption: null,
          config: undefined,
          subscription: null,
          initialState: null,
          set: undefined,
          state: null,
          snapshots: [],
          type: "",
          dataStore: new Map<string, BaseData>(),
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
            callback: (snapshot: Snapshot<BaseData>) => void
          ): void {
            defaultImplementation();
          },
          subscribers: [],
          snapshotConfig: [],
          delegate: {} as SnapshotStoreConfig<BaseData, BaseData>[],

          
         
          getItem(key: string): Promise<T | undefined> {
            if (this.snapshots.length === 0) {
              return Promise.resolve(undefined);
            }

            const snapshotId = ''; // Define snapshotId correctly

            return this.getSnapshot(
              () => this.fetchSnapshot(snapshotId)
            ).then((snapshot: T | undefined) => {
              if (snapshot) {
                const item = snapshot.getItem(key);
                return item as T | undefined;
              } else {
                return undefined;
              }
            }).catch((error: Error) => {
              console.error('Error fetching snapshot:', error);
              return undefined;
            });
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
          addSnapshotFailure: function (date: Date, error: Error) {
            notify(
              `${error.message}`,
              `Snapshot added failed fully.`,
              "Error",
              new Date(),
              NotificationTypeEnum.Error,
              NotificationPosition.TopRight
            )
          },

          addSnapshotSuccess(
            snapshot: BaseData,
            subscribers: Subscriber<BaseData>[]
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
                  snapshotStore.state as Snapshot<BaseData> | null,
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
            data: SnapshotStore<BaseData>,
            events: Record<string, CalendarEvent[]>,
            snapshotStore: SnapshotStore<BaseData>,
            dataItems: RealtimeDataItem[],
            newData: Snapshot<BaseData>
          ): Promise<void> {
            const snapshot = this.snapshots.find(
              (snapshot) => snapshot.id === snapshotId
            );
            if (snapshot) {
              snapshot.data = data;
              snapshot.events = events;
              snapshot.snapshotStore = snapshotStore;
              snapshot.dataItems = dataItems;
              snapshot.newData = newData;
              return Promise.resolve();
            } else {
              return Promise.reject(
                new Error(`Snapshot ${snapshotId} not found.`)
              );
            }
          },
          updateSnapshotSuccess: function () {
            defaultImplementation();
          },
          updateSnapshotFailure: function (error: Payload) {
            defaultImplementation();
          },
          removeSnapshot: function (
            snapshotToRemove: SnapshotStore<BaseData>
          ) {
            defaultImplementation();
          },
          clearSnapshots: function () {
            defaultImplementation();
          },
          addSnapshot: async function (
            snapshot: Data | undefined,
            subscribers: Subscriber<BaseData | CustomSnapshotData>[]
          ) {
            snapshotStore.addSnapshot(snapshot, subscribers)
            return new Promise((resolve, reject) => {
              resolve(snapshotStore.getSnapshot(snapshot.id));
            });

          },
          createSnapshot: function (
            id: string,
            snapshotData: SnapshotStoreConfig<any, BaseData>,
            category: string
          ): Snapshot<Data> {
            defaultImplementation();
            return {} as Snapshot<Data>;
          },
          createSnapshotSuccess: function (snapshot: Snapshot<Data>) {
            defaultImplementation();
          },
          createSnapshotFailure: async function (snapshot: Snapshot<BaseData>, error: Error): Promise<void> {
            notify(
              "createSnapshotFailure",
              `Error creating snapshot: ${error.message}`,
              "",
              new Date(),
              NotificationTypeEnum.Error,
              NotificationPosition.TopRight
            );

            // Assuming this.delegate[0].createSnapshotFailure expects a snapshot and error
            await this.delegate[0].createSnapshotFailure(snapshot, error);
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
            snapshotStoreConfig: SnapshotStoreConfig<BaseData, BaseData>,
            snapshotData: Snapshot<BaseData>
          ) {
            defaultImplementation();
          },
         
          takeSnapshot: function (
            snapshot: SnapshotStoreConfig<T, BaseData>
          ): Promise<{
            snapshot: Snapshot<BaseData>
          }> {
            defaultImplementation();
            return Promise.reject(new Error("Function not implemented."));
          },
          takeSnapshotSuccess: function (
            snapshot: SnapshotStore<BaseData>
          ) {
            defaultImplementation();
          },
          takeSnapshotsSuccess: function (
            snapshots: Snapshot<BaseData>[]
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
            snapshot: SnapshotStore<BaseData>
          ) {
            const snapshotStore = snapshot;
           
          },
          setSnapshots: function (
            snapshots: Snapshot<BaseData>[]
          ) {
            defaultImplementation();
          },
          clearSnapshot: function (snapshotId: string) {
            defaultImplementation();
          },
          mergeSnapshots: function (
            snapshots: Snapshot<BaseData>[]
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
            subscribers: Subscriber<BaseData>[],
            data: CustomSnapshotData | Snapshot<BaseData>
          ): Subscriber<BaseData>[] {
            // Notify each subscriber with the provided data
            const notifiedSubscribers = subscribers.map(subscriber =>
              subscriber.notify ? (data) : subscriber
            );
            return notifiedSubscribers;
          },
          subscribe: function () {
            defaultImplementation();
          },
          unsubscribe: function () {
            defaultImplementation();
          },
          fetchSnapshot(
            id: any,
            category: string | CategoryProperties | undefined,
            timestamp: any,
            snapshot: Snapshot<BaseData>,
            data: Map<string, T>,
            delegate: SnapshotStoreConfig<BaseData, T>[]
          ): Promise<{
            id: any;
            category: string | CategoryProperties | undefined;
            timestamp: any;
            snapshot: Snapshot<T>;
            data: Map<string, T>;
            delegate: SnapshotStoreConfig<BaseData, T>[]
          }> {
            return Promise.resolve({
              id,
              category,
              timestamp,
              snapshot: data as Snapshot<T>,
              data: data,
              delegate: delegate
            });

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
            snapshot: SnapshotStore<BaseData>,
            snapshots: Snapshots<T>
          ): Promise<{ snapshots: Snapshots<T> }> {
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
            Snapshot<BaseData>
          > {
            defaultImplementation();
            return {} as IterableIterator<Snapshot<BaseData>>;
          },
          [Symbol.asyncIterator]: function (): AsyncIterableIterator<
            Snapshot<BaseData>> {
            defaultImplementation();
            return {} as AsyncIterableIterator<Snapshot<BaseData>>;
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

  setSnapshotSuccess(snapshotData: SnapshotStore<BaseData>, subscribers: ((data: Snapshot<BaseData>) => void)[]): void { 
    this.delegate[0].setSnapshotSuccess(snapshotData, subscribers);
  }

  setSnapshotFailure(error: Error): void {
    this.delegate[0].setSnapshotFailure(error);
  }

  createSnapshotFailure(snapshot: Snapshot<BaseData>,error: Error): void {
    notify(
      "createSnapshotFailure",
      `Error creating snapshot: ${error.message}`,
      "",
      new Date(),
      NotificationTypeEnum.Error,
      NotificationPosition.TopRight
    );
    this.delegate[0].createSnapshotFailure(snapshot, error);
  }

   // Example method similar to updateSnapshots
  updateSnapshots(): void {
    this.delegate[0].updateSnapshots();
  }

  // Example method similar to updateSnapshotsSuccess
  updateSnapshotsSuccess(
    snapshotData: (subscribers: Subscriber<BaseData>[], snapshot: Snapshots<T>)=>void ): void {
    if (this.delegate.length > 0 && typeof this.delegate[0].updateSnapshotsSuccess === 'function') {
      this.delegate[0].updateSnapshotsSuccess(snapshotData);
    }
  }

  updateSnapshotsFailure(error: Payload): void {
    this.delegate[0].updateSnapshotsFailure(error);
  }

  initSnapshot(snapshotConfig: SnapshotStoreConfig<T, K>, snapshotData: SnapshotStore<T>): void {
    return this.delegate[0].initSnapshot(snapshotConfig, snapshotData);
  }

  

  async takeSnapshot(
    snapshot: SnapshotStore<BaseData>,
    subscribers: Subscriber<Data | CustomSnapshotData>[]
  ): Promise<{ snapshot: SnapshotStore<BaseData> }> {
    try {
      // Perform snapshot logic here
      const result = await this.delegate[0].takeSnapshot(snapshot); // Assuming this.delegate[0] handles the snapshot logic
  
      // Assuming result is an array and you want the first element
      if (result !== null && Array.isArray(result)) {
        const snapshotStoreWrapper: SnapshotStore<BaseData> = {
          ...result[0],
          data: result[0].data as BaseData,
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
    } catch (error) {
      handleApiError(error as AxiosError<unknown>, "Failed to take snapshot");
      throw error;
    }
  }
  

  takeSnapshotSuccess(snapshot: SnapshotStore<BaseData>): void {
    this.delegate[0].takeSnapshotSuccess(snapshot);
  }

  takeSnapshotsSuccess(snapshots: T): void {
    this.delegate[0].takeSnapshotsSuccess(snapshots);
  }

  configureSnapshotStore(
    snapshot: SnapshotStore<BaseData>
  ): void {
    this.delegate[0].configureSnapshotStore(snapshot);
  }

  public async getData<T extends Data>(data: Snapshot<BaseData> | Snapshot<CustomSnapshotData>): Promise<{
    data: (Snapshot<T> | Snapshot<CustomSnapshotData>)[],
    getDelegate: SnapshotStore<BaseData>,
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
    value: SnapshotStoreConfig<BaseData, T>,
    index: number,
    array: SnapshotStoreConfig<BaseData, T>[]
  ): void {
    this.delegate.forEach((delegateItem, i, arr) => {
      // Ensure the value type matches the delegateItem type
      const valueAsExpectedType = value as SnapshotStoreConfig<BaseData, BaseData>;

      // Handle type compatibility for the array as well
      const arrayAsExpectedType = array as SnapshotStoreConfig<BaseData, BaseData>[];

      delegateItem.flatMap(
        valueAsExpectedType,
        index,
        arrayAsExpectedType
      );
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

  validateSnapshot(snapshot: Snapshot<BaseData>): boolean {
    return this.delegate[0].validateSnapshot(snapshot);
  }

  handleSnapshot(
    snapshot: Snapshot<BaseData> | null,
    snapshotId: string
  ): void {
    this.delegate[0].handleSnapshot(snapshot, snapshotId);
  }

  handleActions(): void {
    this.delegate[0].handleActions();
  }

  setSnapshot(snapshot: SnapshotStore<BaseData>): void {
    if (this.delegate[0]) {
      this.delegate[0].setSnapshot?(snapshot) : null;
    }
}
  setSnapshotData(snapshotData: Partial<SnapshotStore<BaseData>>): void {
    const currentSnapshot = this.delegate[0];
    if (currentSnapshot) {
      const updatedSnapshot: SnapshotStoreConfig<T, T> = {
        ...currentSnapshot,
        ...snapshotData,
        configOption: currentSnapshot.configOption,
        state: currentSnapshot.state ? currentSnapshot.state.filter((snapshot): snapshot is Snapshot<BaseData> => snapshot.type !== null) : [],
      };
      this.delegate[0] = updatedSnapshot;
    }
  }
  

  setSnapshots(snapshots: SnapshotStore<BaseData>[]): void {
    this.delegate[0].setSnapshots(snapshots);
  }

  clearSnapshot(): void {
    this.delegate[0].clearSnapshot();
  }

  mergeSnapshots(snapshots: T[]): void {
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
    subscribers: Subscriber<BaseData>[],
    snapshots: Snapshots<T>
  ): Promise<{
    subscribers: Subscriber<BaseData>[];
    snapshots: Snapshots<T>
  }> {
   return this.delegate[0].getSubscribers(subscribers, snapshots);
  }

  notify(
    id: string,
    message: string,
    content: any,
    date: Date,
    type: NotificationType,
    notificationPosition?: NotificationPosition | undefined
  ):
  void {
    this.delegate[0].notify(
      message,
      content,
      new Date(),
      type
    );
  }

  notifySubscribers(
    subscribers: Subscriber<BaseData>[],
    data: Snapshot<BaseData>
  ): Subscriber<BaseData>[] {
    return this.delegate[0].notifySubscribers(subscribers, data);
  }

  subscribe(): void {
    this.delegate[0].subscribe();
  }

  unsubscribe(): void {
    this.delegate[0].unsubscribe();
  }

 
  async fetchSnapshot(
    snapshotId: string,
    category: string | CategoryProperties | undefined,
    timestamp: Date,
    snapshot: Snapshot<T>,
    data: T,
    delegate: SnapshotStoreConfig<BaseData, T>[]
  ): Promise<{
    id: any;
    category: string | CategoryProperties | undefined;
    timestamp: any;
    snapshot: Snapshot<T>;
    data: T;
    getItem?: (snapshot: Snapshot<T>) => Snapshot<T> | undefined;
  }> {
    const fetchedSnapshot = await delegate[0].fetchSnapshot(
      snapshotId,
      category,
      timestamp,
      snapshot,
      data as BaseData,
      delegate as SnapshotStoreConfig<BaseData, any>[]
    );

    return {
      id: fetchedSnapshot.id,
      category: fetchedSnapshot.category,
      timestamp: fetchedSnapshot.timestamp,
      snapshot: fetchedSnapshot.snapshot,
      data: fetchedSnapshot.data as T,
    };
  }
  
  fetchSnapshotSuccess(
    snapshotData: (
      subscribers: Subscriber<BaseData>[],
      snapshot: Snapshots<BaseData>) => void
  ): void {
    this.delegate[0].fetchSnapshotSuccess(snapshotData);
  }

  fetchSnapshotFailure(): void {
    this.delegate[0].fetchSnapshotFailure();
  }

  getSnapshots(
    category: string,
    data: Snapshots<T>
  ): void {
    this.delegate[0].getSnapshots(category, data);
  }

  getAllSnapshots(
    data: (
      subscribers: Subscriber<BaseData>[],
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

  batchFetchSnapshots(
    subscribers: Subscriber<BaseData>[],
    snapshots: Snapshots<T>
  ): void {
    this.delegate[0].batchFetchSnapshots(subscribers, snapshots);
  }

  batchTakeSnapshotsRequest(
    snapshotData: SnapshotData
  ): void {
    this.delegate[0].batchTakeSnapshotsRequest(snapshotData);
  }
  
  batchUpdateSnapshotsRequest(
    snapshotData: (
      subscribers: Subscriber<BaseData>[]
    ) => Promise<{
      subscribers: Subscriber<BaseData>[];
      snapshots: Snapshots<T>;
    }>
  ): void {
  snapshotData(this.subscribers).then(({ snapshots }) => {
      this.delegate[0].batchUpdateSnapshotsRequest(async (subscribers) => {
  const { snapshots } = await snapshotData(subscribers);
  return { subscribers, snapshots };
      });
    });
  }

  batchFetchSnapshotsSuccess(
    subscribers: Subscriber<BaseData>[],
    snapshots: Snapshots<T>
  ): void {
    this.delegate[0].batchFetchSnapshotsSuccess(subscribers, snapshots);
  }

  batchFetchSnapshotsFailure(
    payload: { error: Error }
  ): void {
    this.delegate[0].batchFetchSnapshotsFailure(payload);
  }

  batchUpdateSnapshotsSuccess(
    subscribers: Subscriber<BaseData>[],
    snapshots: Snapshots<T>
  ): void {
    const delegate = this.delegate[0];
    if (delegate && delegate.batchUpdateSnapshotsSuccess) {
      delegate.batchUpdateSnapshotsSuccess(subscribers, snapshots);
    } else {
      // Handle the case where delegate or batchUpdateSnapshotsSuccess is undefined, if needed
      console.error('Delegate or batchUpdateSnapshotsSuccess is undefined. Cannot perform batch update.');
      // Or handle the error in a way that fits your application's error handling strategy
    }
  }
  

  batchUpdateSnapshotsFailure(
   payload: { error: Error }
  ): void {
    this.delegate[0].batchUpdateSnapshotsFailure(payload);
  }

  batchTakeSnapshot(
    snapshotStore: SnapshotStore<BaseData>,
    snapshots: Snapshots<Snapshot<T>>
  ): Promise<{ snapshots: Snapshots<Snapshot<T>> }> {
    return new Promise((resolve) => {
      const result = this.delegate[0].batchTakeSnapshot(snapshotStore, snapshots);
      resolve(result);
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
    const snapshotIterator = this.snapshots.values();

    // Create a custom iterator that maps each item to Snapshot<T>
    const iterator: IterableIterator<Snapshot<T>> = {
      [Symbol.iterator]: function() { return this; },
      next: function() {
        const next = snapshotIterator.next();
        if (next.done) {
          return { done: true, value: undefined as any };
        }

        // Handle the conversion to Snapshot<BaseData> if necessary
        let snapshot: Snapshot<BaseData>;
        if (next.value instanceof SnapshotStore) {
          snapshot = convertSnapshotStoreToSnapshot(next.value);
        } else {
          snapshot = next.value as Snapshot<BaseData>;
        }

        // Convert Snapshot<BaseData> to Snapshot<T> using snapshotType function
        const value: Snapshot<T> = snapshotType(snapshot);
        return { done: false, value };
      }
    };

    return iterator;
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
// Function to add snapshot to the list
const addToSnapshotList = (snapshotStore: SnapshotStore<any>, subscribers: Subscriber<Data | CustomSnapshotData>[]) => {
  // Logic to handle adding snapshot to the list in your UI
  console.log("SnapshotStore:", snapshotStore);
  console.log("Subscribers:", subscribers);

  // Assuming snapshotStore contains the snapshot data you need
  const snapshot = snapshotStore.snapshot;
  if (snapshot) {
    console.log("Snapshot added to list:", snapshot);
    // Add the snapshot to the list in your UI
  }
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
      data: new Map([
        ["exampleData", {
          // Include properties of Data type here
          /* exampleData properties */
        }]
      ]),
      timestamp: new Date(),
      category: "Initial Category 1",
      type: "",
      store: {} as SnapshotStore<BaseData>,
      initialState: null
    },
    {
      id: "2",
      data: new Map([
        ["exampleData", {
          // Include properties of Data type here
          /* exampleData properties */
        }]
      ]),
      timestamp: new Date(),
      category: "Initial Category 2",
      type: "",
      store: {} as SnapshotStore<BaseData>,
      initialState: null
    },
  ];
}


// Usage example:
// const snapshotId = await SnapshotActions.takeSnapshot(
//   // snapshotData,
//   // snapshotType,
//   // category,
//   // handleSnapshotOperation,
//   // displayToast,
//   // addToSnapshotList,
//   // dataStoreMethods
// );
const category = process.argv[3] as keyof CategoryProperties ?? "isHiddenInList"
const dataStoreMethods = {}
// const snapshotId = "exampleSnapshotId";
const data = new SnapshotStore<BaseData>(
  initialState,
  snapshot,
  category as unknown as CategoryProperties,
  new Date(),
  snapshotType,
  handleSnapshotOperation,
  displayToast,
  addToSnapshotList,
  dataStoreMethods
  // delegate
  // fetchInitialSnapshotData,
  // fetch
);
const events: Record<string, CalendarEvent[]> = {};
const snapshotStore = new SnapshotStore<BaseData>(
  this.initialState ? this.initialState : {},
  // snapshot,
  category,
  new Date(),
  snapshotType,
  handleSnapshotOperation,
  displayToast,
  addToSnapshotList,
  dataStoreMethods
);
const dataItems: RealtimeDataItem[] = [];
const newData: Data = {
  /* new data properties */

};


const snapshotId = (await getSnapshotId(snapshot)).toString();

const payload: UpdateSnapshotPayload<Data> = {
  snapshotId: snapshotId, // Assign snapshotId here
  newData: newData,
  title: "",
  description: "",
  createdAt: undefined,
  updatedAt: undefined,
  status: "active",
  category: ""
};

// Example component update call
const component = <YourComponent apiConfig={/* your apiConfig */} />;

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
  initialState: {} as Map<string, any>,
  handleSnapshotOperation: handleSnapshotOperation,
  displayToast: displayToast,
  handleSnapshot: handleSnapshot,
  addToSnapshotList: addToSnapshotList,
  fetchInitialSnapshotData: fetchInitialSnapshotData,
  // fetch: fetch,
};

export default SnapshotStore;
export { handleSnapshotOperation, initialState, initializeData, snapshotStoreConfig };
export type {
  SnapshotStoreSubset, SnapshotData
};

