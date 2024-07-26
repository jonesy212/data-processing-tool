// import { Snapshots } from '@/app/components/snapshots/SnapshotStore';
import { handleApiError } from "@/app/api/ApiLogs";
import { getSnapshotId, getSnapshots, mergeSnapshots } from "@/app/api/SnapshotApi";
import headersConfig from "@/app/api/headers/HeadersConfig";
import { RealtimeDataItem } from "@/app/components/models/realtime/RealtimeData";
import {
  NotificationType,
  NotificationTypeEnum,
  useNotification
} from "@/app/components/support/NotificationContext";
import UniqueIDGenerator from "@/app/generators/GenerateUniqueIds";
import { CategoryProperties } from "@/app/pages/personas/ScenarioBuilder";
import { AxiosError } from "axios";
import { subscribe } from "graphql";
import { flatMap } from "lodash";
import { IHydrateResult } from "mobx-persist";
import { useDispatch } from "react-redux";
import defaultImplementation from "../event/defaultImplementation";
import YourComponent from "../hooks/YourComponent";
import { SnapshotManager, SnapshotStoreOptions } from "../hooks/useSnapshotManager";
import { mapToSnapshotStore } from "../mappings/mapToSnapshotStore";
import { BaseData, Data } from "../models/data/Data";
import {
  NotificationPosition
} from "../models/data/StatusType";
import { Tag } from "../models/tracker/Tag";
import { DataStoreMethods, DataStoreWithSnapshotMethods } from "../projects/DataAnalysisPhase/DataProcessing/ DataStoreMethods";
import { DataStore } from "../projects/DataAnalysisPhase/DataProcessing/DataStore";
import { initialState } from "../state/redux/slices/FilteredEventsSlice";
import { clearSnapshot, removeSnapshot } from "../state/redux/slices/SnapshotSlice";
import { CalendarEvent } from "../state/stores/CalendarEvent";
import { AllStatus } from "../state/stores/DetailsListStore";
import { Subscription } from "../subscriptions/Subscription";
import { convertSnapshotStoreToMap, convertSnapshotStoreToSnapshot, snapshotType } from "../typings/YourSpecificSnapshotType";
import { Subscriber } from "../users/Subscriber";
import { unsubscribe } from "../utils/applicationUtils";
import { isSnapshot } from "../utils/snapshotUtils";
import { CoreSnapshot, CustomSnapshotData, Payload, Snapshot, Snapshots, UpdateSnapshotPayload } from './LocalStorageSnapshotStore';
import { SnapshotActions } from "./SnapshotActions";
import {
  AuditRecord,
  K,
  RetentionPolicy,
  SnapshotStoreConfig,
  T,
} from "./SnapshotConfig";
import { dataObject, snapshot } from "./snapshot";
import {
  addSnapshotSuccess, batchFetchSnapshotsFailure,
  batchFetchSnapshotsRequest, batchFetchSnapshotsSuccess, batchTakeSnapshot, batchTakeSnapshotsRequest, batchUpdateSnapshots,
  batchUpdateSnapshotsFailure,
  batchUpdateSnapshotsRequest,
  createSnapshot, createSnapshotFailure, createSnapshotSuccess, delegate, getAllSnapshots, initSnapshot, notifySubscribers, updateSnapshot, updateSnapshotFailure, updateSnapshotSuccess, updateSnapshots, updateSnapshotsSuccess
} from "./snapshotHandlers";
import { Callback } from "./subscribeToSnapshotsImplementation";
import { useSnapshotStore } from "./useSnapshotStore";
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
 

export const defaultSubscribeToSnapshots= <T extends BaseData>(
  snapshotId: string,
  callback: (snapshots: Snapshots<BaseData>) => Subscriber<BaseData, T> | null,
  snapshot: Snapshot<BaseData, K> | null = null
) => {
  console.warn('Default subscription to snapshots is being used.');

  // Dummy implementation of subscribing to snapshots
  console.log(`Subscribed to snapshot with ID: ${snapshotId}`);

  // Simulate receiving a snapshot update
  setTimeout(() => {
    const snapshot: Snapshot<BaseData, any> = {
      id: snapshotId,
      initialState: {
        id: snapshotId,
        data: dataObject,
        timestamp: new Date(),
      },
      data: new Map<string, BaseData>().set("data1", {
        id: "data1",
        title: "Sample Data",
        description: "Sample description",
        timestamp: new Date(),
        category: "Sample category",
        startDate: new Date(),
        endDate: new Date(),
        scheduled: true,
        status: "Pending",
        isActive: true,
        tags: [{ id: "1", name: "Important", color: "red" }],
      }),
      snapshotConfig: [],
      // other properties...
    };

    // Define a variable of type Snapshots<BaseData> and assign the single snapshot store to it
    const snapshots: Snapshots<BaseData> = [snapshot];
    callback(snapshots);
  }, 1000); // Simulate a delay before receiving the update
}



export const defaultSubscribeToSnapshot = (
  snapshotId: string,
  callback: (snapshot: Snapshot<BaseData>) => void
): void => {
  // Dummy implementation of subscribing to a single snapshot
  console.log(`Subscribed to single snapshot with ID: ${snapshotId}`);

  // Simulate receiving a snapshot update
  setTimeout(() => {
    const snapshot: CoreSnapshot<BaseData, BaseData> = {
      id: snapshotId,

      data: new Map<string, BaseData>().set("data1", {
        id: "data1",
        title: "Sample Data",
        description: "Sample description",
        timestamp: new Date(),
        category: "Sample category",
        startDate: new Date(),
        endDate: new Date(),
        scheduled: true,
        status: "Pending",
        isActive: true,
        tags: [{ id: "1", name: "Important", color: "red" }],
      }),
      name: "Sample Snapshot",
      timestamp: new Date(),
      orders: [],
      createdBy: "User",
      subscriberId: "sub123",
      length: 1,
      category: "Sample category",
      date: new Date(),
    };

    callback(snapshot); // Send as a single snapshot
  }, 1000); // Simulate a delay before receiving the update
};

export const defaultDelegate: SnapshotStoreConfig<BaseData, BaseData>[] = [];

const defaultDataStoreMethods: DataStore<BaseData, BaseData> = {
  data: new Map<string, Snapshot<BaseData>>(),
  addData: (data: Snapshot<BaseData, any>) => { },
  addDataStatus: (id: number, status: "pending" | "inProgress" | "completed") => { },
  updateData: (id: number, newData: Snapshot<BaseData>) => { },
  removeData: (id: number) => { },
  updateDataTitle: (id: number, title: string) => { },
  updateDataDescription: (id: number, description: string) => { },
  updateDataStatus: (id: number, status: "pending" | "inProgress" | "completed") => { },
  getItem: async (key: string) => undefined,
  setItem: async (id: string, item: Snapshot<BaseData>) => { },
  removeItem: async (key: string) => { },
  getAllKeys: async () => [],
  getAllItems: async () => [],
  getDataVersions: async (id: number): Promise<Snapshot<BaseData>[] | undefined> => {
    return undefined;
  },
  // addDataSuccess: async (data: BaseData, subscribers: Subscriber<T, K>[]) => { },
  updateDataVersions: async (id: number, newData: Snapshot<BaseData>[]) => { },
  getBackendVersion: async (): Promise<string > => {
    return "0.0.0";
  },
  getFrontendVersion: async (): Promise<string> => {
      return "0.0.0";
  },
  getDelegate: (): SnapshotStoreConfig<BaseData, BaseData>[] => {
    return defaultDelegate;
  },
  addDataSuccess: async (payload: { data: Snapshot<BaseData>[] }) => { },
  fetchData: async (): Promise<SnapshotStore<BaseData, K>[]> => {
    return [];
  },
  snapshotMethods: []
};

interface SnapshotStoreSubset<T extends BaseData> {
  snapshotId: string;
  taskIdToAssign: Snapshot<T> | undefined;
  addSnapshot: (snapshot: Omit<Snapshot<Data>, "id">, subscribers: Subscriber<T, K>[]) => void;
  onSnapshot: (snapshot: Snapshot<T>, config: SnapshotStoreConfig<BaseData, Data>[]) => void;
  addSnapshotSuccess: (snapshot: Snapshot<T>, subscribers: Subscriber<T, K>[]) => void;
  updateSnapshot: (
    snapshotId: string,
    data: SnapshotStore<T, K>,
    events: Record<string, CalendarEvent[]>,
    snapshotStore: SnapshotStore<T, K>,
    dataItems: RealtimeDataItem[],
    newData: Data,
    payload: UpdateSnapshotPayload<T>
  ) => void;
  removeSnapshot: (snapshotId: string) => void;
  clearSnapshots: () => void;
  createSnapshot: (snapshotData: SnapshotStore<T, K> | Snapshot<BaseData> | null | undefined) => void;
  createSnapshotSuccess: (snapshot: Snapshot<T>) => void;
  createSnapshotFailure: (snapshot: Snapshot<T>, error: any) => Promise<void>;
  updateSnapshots: (snapshots: Snapshots<T>) => Promise<any>;
  updateSnapshotSuccess: (snapshot: Snapshot<Data>) => Promise<{ id: string; data: { createdAt: Date; updatedAt: Date; category?: string | CategoryProperties | undefined; getData?: () => Promise<T | undefined>; }; timestamp: Date; category: string; length: number; content: undefined; } | undefined>;
  updateSnapshotFailure: (error: Payload) => void;
  updateSnapshotsSuccess: () => void;
  updateSnapshotsFailure: (error: Payload) => void;
  initSnapshot: (snapshotStore: SnapshotStoreConfig<BaseData, BaseData>, snapshotData: Snapshot<BaseData>) => void;
  takeSnapshot: (updatedSnapshots: Snapshot<T, K>) => Promise<BaseData[] | null>;
  takeSnapshotSuccess: (snapshot: Snapshot<T, K>) => void;
  takeSnapshotsSuccess: (snapshots: Snapshot<T>[]) => void;
  configureSnapshotStore: (snapshotConfigStore: SnapshotStoreConfig<T, Data>) => void;
  getData: () => Data | null;
  setData: (data: Data) => void;
  getState: () => any;
  setState: (state: any) => void;
  validateSnapshot: (snapshot: Snapshot<Data>) => boolean;
  handleSnapshot: (snapshot: Snapshot<Data> | null, snapshotId: string) => void;
  handleActions: (action: any) => void;
  setSnapshot: (snapshot: Snapshot<T>) => void;
  setSnapshots: (snapshots: Snapshot<T>[]) => void;
  clearSnapshot: (snapshotId: string) => void;
  mergeSnapshots: (snapshots: Snapshots<T>) => void;
  reduceSnapshots: <U>(callback: (acc: U, snapshot: Snapshot<any, any>) => U, initialValue: U) => U;
  sortSnapshots: (compareFn: (a: Snapshot<any, any>, b: Snapshot<any, any>) => number) => void;
  filterSnapshots: (predicate: (snapshot: Snapshot<any, any>) => boolean) => Snapshot<any, any>[];
  mapSnapshots: <U>(callback: (snapshot: Snapshot<any, any>) => U) => U[];
  findSnapshot: (predicate: (snapshot: Snapshot<any, any>) => boolean) => Snapshot<any, any> | undefined;
  getSubscribers: (subscribers: Subscriber<T, K>[], snapshots: Snapshot<T>) => void;
  notify: (
    id: string,
    message: string,
    content: any,
    date: Date,
    type: NotificationType
  ) => void;
  notifySubscribers: (subscribers: Subscriber<T, K>[], data: CustomSnapshotData | Snapshot<BaseData>) => Promise<T>;
  subscribe: () => void;
  unsubscribe: () => void;
  fetchSnapshot: (id: string) => Promise<Snapshot<T, any>>; // assuming fetchSnapshot needs an id parameter and returns a Promise
  fetchSnapshotSuccess: (snapshot: Snapshot<Data> | null, snapshotId: string) => void;
  fetchSnapshotFailure: () => void;
  getSnapshot(id: string): Snapshot<T, K> | undefined;
  getSnapshots: (category?: string, filter?: (snapshot: Snapshot<T, any>) => boolean) => Promise<Snapshots<T>>;
  getAllSnapshots: (filter?: (snapshot: Snapshot<T, any>) => boolean) => Promise<Snapshots<T>>;
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

interface SnapshotData extends BaseData {
  createdAt: Date | undefined;
  updatedAt: Date | undefined;
  id: string;
  title: string;
  description: string;
  status: "active" | "inactive" | "archived";
  category: string;
}

class SnapshotStore<T extends BaseData, K extends BaseData = T> implements DataStore<T, K> {
  id: string | number = '';
  snapshotId: string = '';
  key: string = '';
  topic: string = '';
  date: string | number | Date | undefined;
  configOption: SnapshotStoreConfig<BaseData, K> | null = null;
  config: SnapshotStoreConfig<BaseData, any>[] | null | undefined = null;
  title: string = '';
  subscription?: Subscription<T> | null = null;
  description?: string | undefined = '';
  category: string | CategoryProperties | undefined;
  message: string | undefined;
  timestamp: string | number | Date | undefined;
  createdBy: string
  type: string | undefined | null = '';
  subscribers: Subscriber<T, K>[] = [];
  set: ((type: string, event: Event) => void | null) | undefined;
  data?: Map<string, Snapshot<any>>;
  state: Snapshot<T>[] | null = null; // Adjusted to match Snapshot<T> structure
  store: SnapshotStore<any, any>[] | null = null;
  snapshots: Snapshots<T> = [];
  snapshotConfig: SnapshotStoreConfig<T, K>[] = [];
  expirationDate?: Date;
  priority?: AllStatus;
  tags?: string[] | Tag[];
  metadata?: Record<string, any>;
  status?: "active" | "inactive" | "archived";
  isCompressed?: boolean;
  
  // public data: Map<string, T> = new Map();
  public dataStore: Map<string, T> | undefined = new Map();

  private initialState: SnapshotStore<T, K> | Snapshot<T, K> | null | undefined;

  private snapshotItems: (Snapshot<any, any> | SnapshotStoreConfig<T, K>)[] = [];

  // Use this property if you need to manage nested SnapshotStores
  private nestedStores: SnapshotStore<T, K>[] = [];

  private dataStoreMethods: DataStoreWithSnapshotMethods<T, K> 

  private delegate: SnapshotStoreConfig<T, K>[] = [];

  subscriberId: string = ''; // Added missing property
  length: number = 0; // Added missing property
  content: string = ''; // Added missing property
  value: number = 0; // Added missing property
  todoSnapshotId: string = ''; // Added missing property
  events: Record<string, CalendarEvent[]>| undefined= {};
  snapshotStore: SnapshotStore<T, K> | null = null;
  dataItems: RealtimeDataItem[] = []
  newData: Snapshot<BaseData> | undefined = {
    id: '',
    name: '',
    title: '',
    description: '',
    status: '',
    category: '',
    createdAt: new Date(),
    updatedAt: new Date(),
    data: {} as Map<string, BaseData>,
  }

  

  constructor(options: SnapshotStoreOptions<T, K>) {
    Object.assign(this, options.data); // Initialize properties from options.data if provided
    this.timestamp = new Date(); // Initialize timestamp
    const prefix = this.determinePrefix(options.snapshotConfig, options.category?.toString() ?? "");
    this.id = UniqueIDGenerator.generateID(
      prefix,
      (options.snapshotId || options.configOption?.id || options.configOption?.name || options.configOption?.title || options.configOption?.description || "").toString(),
      NotificationTypeEnum.GeneratedID
    );

    this.initialState = options.initialState;

    if (options.initialState instanceof SnapshotStore) {
      this.dataStore = convertSnapshotStoreToMap(options.initialState);
    } else if (isSnapshot(options.initialState)) {
      this.dataStore = options.initialState.data as Map<string, T>;
    } else {
      this.dataStore = new Map<string, T>();
    }

    this.category = options.category;
    this.date = options.date;
    this.type = options.type;
    this.snapshotConfig = options.snapshotConfig;
    this.subscribeToSnapshots = options.subscribeToSnapshots ? options.subscribeToSnapshots : this.subscribeToSnapshots;
    this.subscribeToSnapshot = options.subscribeToSnapshot;
    this.delegate = options.delegate;
    this.dataStoreMethods = options.dataStoreMethods;

    this.data = new Map<string, Snapshot<T, K>>();
    this.key = "";
    this.topic = "";
 
    this.config = null;
    this.configOption = null;
    this.subscription = null;
    this.category = options.category;
    this.createdBy = "";
    this.timestamp = new Date();
    this.set = undefined;
    this.snapshots = [];
    this.state = null;
    this.subscribers = [];
    this.subscriberId = '';
    this.length = 0;
    this.content = '';
    this.value = 0;
    this.todoSnapshotId = '';
  }


  // Method to handle snapshots and configurations
  addSnapshotItem(item: Snapshot<any, any> | SnapshotStoreConfig<T, K>): void {
    this.snapshotItems.push(item);
  }

  // Method to handle nested stores
  addNestedStore(store: SnapshotStore<T, K>): void {
    this.nestedStores.push(store);
  }

  defaultSubscribeToSnapshots(
    snapshotId: string,
    callback: (snapshots: Snapshots<T>) => Subscriber<T, T> | null,
    snapshot: Snapshot<T, K> | null = null
  ): void {
    console.warn('Default subscription to snapshots is being used.');
  
    // Dummy implementation of subscribing to snapshots
    console.log(`Subscribed to snapshot with ID: ${snapshotId}`);
  
    // Simulate receiving a snapshot update
    setTimeout(() => {
      const data: BaseData = {
        id: "data1", // Ensure this matches the expected structure of BaseData
        title: "Sample Data",
        description: "Sample description",
        timestamp: new Date(),
        category: "Sample category",
        startDate: new Date(),
        endDate: new Date(),
        scheduled: true,
        status: "Pending",
        isActive: true,
        tags: [{ id: "1", name: "Important", color: "red" }],
      };
  
      const snapshot: Snapshot<T, any> = {
        id: snapshotId,
        data: data as T,
        timestamp: new Date(),
      };
  
      callback([snapshot]);
    }, 1000); // Simulate a delay before receiving the update
  }

  subscribeToSnapshots(
    snapshotId: string,
    callback: (snapshots: Snapshots<T>) => Subscriber<T, T> | null,
    snapshot: Snapshot<T, K> | null = null
  ) {
    if (this.subscribeToSnapshots) {
      this.subscribeToSnapshots(snapshotId, callback, snapshot);
    } else {
      console.warn('subscribeToSnapshots method is not defined.');
      this.defaultSubscribeToSnapshots(snapshotId, callback, snapshot);
    }
  }

  subscribeToSnapshot?(
    snapshotId: string,
    callback: Callback<Snapshot<T, T>>,
    snapshot: Snapshot<T, K>
  ) {
    if (this.subscribeToSnapshot) {
      this.subscribeToSnapshot(snapshotId, callback, snapshot);
    } else {
      console.warn('subscribeToSnapshot method is not defined.');
      // Optionally, you can provide a default behavior here
      this.defaultSubscribeToSnapshot(snapshotId, callback, snapshot);
    }
  }


  private transformSubscriber(sub: Subscriber<T, K>): Subscriber<BaseData, K> {
    return {
      ...sub,
      data: sub.getData ? sub.getData()!.data : undefined,
    };
  }


  private transformDelegate(): SnapshotStoreConfig<T, K>[] {
  return this.delegate.map(config => ({
    ...config,
    data: config.data,
    subscribers: config.subscribers.map(sub => this.transformSubscriber(sub)) as Subscriber<BaseData, K>[],
    configOption: config.configOption ? {
      ...config.configOption,
      data: config.configOption.data,
      subscribers: config.configOption.subscribers.map(sub => this.transformSubscriber(sub)) as Subscriber<BaseData, K>[]
    } : null
  }));
}

  get initializedState(): SnapshotStore<T, K> | Snapshot<T, K> | null | undefined {
    return this.initialState;
  }

  getAllKeys(): Promise<string[]> {
    return this.dataStoreMethods.getAllKeys();
  }

  getAllItems(): Promise<T[]> {
    return this.dataStoreMethods.getAllItems();
  }
  
  addData(data: Snapshot<T, K>): void {
    this.dataStoreMethods.addData(data); // Ensure type safety here
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

  getFrontendVersion(): Promise<string | IHydrateResult<number>> {
    return this.dataStoreMethods.getFrontendVersion();
  }

  fetchData(id: number): Promise<SnapshotStore<T, K>[]> {
    return this.dataStoreMethods.fetchData(id);
  }

  defaultSubscribeToSnapshot(
    snapshotId: string,
    callback: Callback<Snapshot<T, T>>,
    snapshot: Snapshot<T, K>
  ): void {
    // Add the subscriber to the subscribers array
    this.subscribers.push({
      id: snapshotId,
      handleCallback: callback,
      snapshotCallback: snapshot
    });
    // Call the callback with the snapshot
    callback(snapshot);
    // Return the subscriberId
    return this.subscriberId;
  }


  // Method to handle the subscription
  handleSubscribeToSnapshot(
    snapshotId: string,
    callback: Callback<Snapshot<T, T>>,
    snapshot: Snapshot<T, K>
  ): void {
    // Check if subscribeToSnapshot is defined
    if (this.subscribeToSnapshot) {
      this.subscribeToSnapshot(snapshotId, callback, snapshot);
    } else {
      console.warn('subscribeToSnapshot method is not defined.');
      // Optionally, you can provide a default behavior here
      this.defaultSubscribeToSnapshot(snapshotId, callback, snapshot);
    }
  }

  // Implement the snapshot method as expected by SnapshotStoreConfig
  snapshot = async (
    id: string,
    snapshotData: SnapshotStoreConfig<any, K>[],
    category: string | CategoryProperties,
    dataStoreMethods: DataStore<T, K>
  ): Promise<{ snapshot: SnapshotStore<T, K> }> => {

    // Convert the Map to the appropriate format
    const convertedData = mapToSnapshotStore(this.data) as Partial<SnapshotStore<T, K>>;

    // Logic to generate and return the snapshot

    const newSnapshot: SnapshotStore<T, K> = new SnapshotStore<T, K>({
      initialState: this,
      category: category,
      snapshotId: this.snapshotId,
      data: convertedData,
      date: new Date(),
      type: "snapshot",
      snapshotConfig: snapshotData,
      subscribeToSnapshots: this.subscribeToSnapshots,
      subscribeToSnapshot: this.subscribeToSnapshot,
      delegate: this.transformDelegate(),
      dataStoreMethods: dataStoreMethods as DataStoreWithSnapshotMethods<T, K>,
      getDelegate: this.getDelegate,
      getDataStoreMethods: getDataStoreMethods,
      snapshotMethods: snapshotMethods,
      handleSnapshotOperation: handleSnapshotOperation

    });
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
      snapshotStore: SnapshotStore<T, K>;
      data: T;
    }> | undefined
  ): Promise<SnapshotStore<T, K>> {
    return this.delegate[0].getSnapshot(snapshot);
  }

  getSnapshotSuccess(
    snapshot: Snapshot<T, K>
  ): Promise<SnapshotStore<T, K>> {
    const delegateConfig = this.delegate[0]; // Assuming you want to call the first delegate's method
    if (delegateConfig) {
      return delegateConfig.getSnapshotSuccess(snapshot);
    } else {
      throw new Error("Delegate config is not available");
    }
  }

  getSnapshotId(key: SnapshotData): Promise<string | undefined> {
    return Promise.resolve(this.delegate[0].getSnapshotId(key))
  }


  async getItem(key: string): Promise<T | undefined> {
    if (this.dataStore) {
      const item = this.dataStore.get(key);
      return item;
    }
  
    const snapshotId = await this.getSnapshotId({
      key,
      createdAt: undefined,
      updatedAt: undefined,
      id: "",
      title: "",
      description: "",
      status: "active",
      category: ""
    });
    if (typeof snapshotId !== 'string') {
      return undefined;
    }
  
    try {
      const transformedDelegate = this.transformDelegate();
      const snapshot = await this.fetchSnapshot(
        snapshotId,
        this.category,
        new Date(),
        {} as Snapshot<BaseData>,
        {} as T,
        transformedDelegate
      );

      if (snapshot) {
        const item = snapshot.getItem ? snapshot.getItem(key) : snapshot.data?.get(key);
        return item;
      }
    } catch (error) {
      console.error('Error fetching snapshot:', error);
    }
    return undefined;
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
    subscribers: Subscriber<T, K>[]
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

  getDataStoreMethods(): DataStoreMethods<T,K> {
    return {
      addData: this.addData.bind(this),
      getItem: this.getItem.bind(this),
      removeData:this.removeData.bind(this),
      category:this.category.bind(this),
      dataStoreMethods:this.dataStoreMethods.bind(this),
      initialState:this.initialState.bind(this),
      updateData:this.updateData.bind(this),
      updateDataTitle:this.updateDataTitle.bind(this),
      updateDataDescription:this.updateDataDescription.bind(this),
      addDataStatus:this.addDataStatus.bind(this),
      updateDataStatus:this.updateDataStatus.bind(this),
      addDataSuccess:this.addDataSuccess.bind(this),
      getDataVersions:this.getDataVersions.bind(this),
      updateDataVersions:this.updateDataVersions.bind(this),
      getBackendVersion:this.getBackendVersion.bind(this),
      getFrontendVersion:this.getFrontendVersion.bind(this),
      getAllKeys:this.getAllKeys.bind(this),
      fetchData:this.fetchData.bind(this),
      setItem:this.setItem.bind(this),
      removeItem:this.removeItem.bind(this),
      getAllItems:this.getAllItems.bind(this),
      
      addSnapshot: this.addSnapshot.bind(this),
      addSnapshotSuccess: this.addSnapshotSuccess.bind(this),
      getSnapshot: this.getSnapshot.bind(this),
      getSnapshotSuccess: this.getSnapshotSuccess.bind(this),
      getSnapshotsBySubscriber: this.getSnapshotsBySubscriber.bind(this),
      getSnapshotsBySubscriberSuccess: this.getSnapshotsBySubscriberSuccess.bind(
        this
      ),
      getSnapshotsByTopic: this.getSnapshotsByTopic.bind(this),
      getSnapshotsByTopicSuccess: this.getSnapshotsByTopicSuccess.bind(this),
      getSnapshotsByCategory: this.getSnapshotsByCategory.bind(this),
      getSnapshotsByCategorySuccess: this.getSnapshotsByCategorySuccess.bind(
        this
      ),
      getSnapshotsByKey: this.getSnapshotsByKey.bind(this),
      getSnapshotsByKeySuccess: this.getSnapshotsByKeySuccess.bind(this),
      getSnapshotsByPriority: this.getSnapshotsByPriority.bind(this),
      getSnapshotsByPrioritySuccess: this.getSnapshotsByPrioritySuccess.bind(
        this
      ),
      snapshotMethods: this.snapshotMethods,
      getDelegate: this.getDelegate
    }  as DataStoreMethods<T,K>;
  }


  getDelegate(): SnapshotStoreConfig<T, T>[] {
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
    data: Map<string, BaseData>,
    events: Record<string, CalendarEvent[]>,
    snapshotStore: SnapshotStore<T, K>,
    dataItems: RealtimeDataItem[],
    newData: Snapshot<T>,
    payload: UpdateSnapshotPayload<T>,
    store: SnapshotStore<any, K>
  ): Promise<{ snapshot: SnapshotStore<T, K>; }> {
    try {
      // Create updated snapshot data
      const updatedSnapshotData: Snapshot<T> = {
        id: snapshotId,
        data: {
          ...(snapshotStore.data || new Map<string, T>()), // Ensure default empty map if data is undefined
          ...newData.data, // Merge with new data
        },
        timestamp: new Date(),
        category: "update",
        length: 0,
        content: undefined,
        initialState: null,
        // Ensure other required properties are included
      };
  
      // Update snapshotStore with the new data
      snapshotStore.data = new Map<string, T>(); // Initialize if needed
      snapshotStore.data.set(snapshotId.toString(), updatedSnapshotData as unknown as T);
  
      console.log("Snapshot updated successfully:", snapshotStore);
  
      // Return the updated snapshot store
      return { snapshot: snapshotStore };
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

  
  removeSnapshot(
    snapshotToRemove: SnapshotStore<T, K>
  ): void {
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
  snapshot: Snapshot<T, K>, 
  subscribers: Subscriber<BaseData, K>[]
): Promise<void> {
  const snapshotData: Snapshot<T, K> = {
    id: snapshot.id || "",
    data: snapshot?.data ?? ({} as T),
    timestamp: new Date(),
    category: snapshot.category || this.category,
    subscribers: subscribers || [],
    key: snapshot.key || this.key,
    topic: snapshot.topic || this.topic,
    state: snapshot.state || this.state,
    config: snapshot.config || this.config,
    delegate: snapshot.delegate || this.delegate,
    subscription: snapshot.subscription || this.subscription,
    length: snapshot.length || 0,
    metadata: snapshot.metadata || {},
    store: snapshot.store || null,
      
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

    const snapshotStoreData: SnapshotStore<T, K> = {
      id: snapshotData.id,
      snapshots: [
        {
          data: snapshotData.data as Map<string, Snapshot<T, K>>,
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

          
         
          async getItem(key: string | SnapshotData): Promise<T | undefined> {
            if (this.snapshots.length === 0) {
              return undefined;
            }


          
            try {
              const snapshotId = await this.getSnapshotId(key).toString();
              const snapshot = await this.fetchSnapshot(snapshotId, category, timestamp, snapshot as SnapshotStore<BaseData>, data, delegate);
          
              if (snapshot) {
                const item = snapshot.getItem(key);
                return item as T | undefined;
              } else {
                return undefined;
              }
            } catch (error) {
              console.error('Error fetching snapshot:', error);
              return undefined;
            }
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
            subscribers: Subscriber<T, K>[]
          ): void {
            const index = this.delegate?.findIndex(
              (snapshotStore) =>
                snapshotStore.id === snapshot.id &&
                snapshotStore.snapshotCategory === snapshot.category &&
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
            data: Map<string, BaseData>,
            events: Record<string, CalendarEvent[]>,
            snapshotStore: SnapshotStore<BaseData>,
            dataItems: RealtimeDataItem[],
            newData: Snapshot<BaseData>
          ): Promise<{ snapshot: SnapshotStore<BaseData> }> {
            const snapshot = this.snapshots.find(
              (snapshot) => snapshot.id === snapshotId
            );
            if (snapshot) {
              snapshot.data = data;
              snapshot.events = events;
              snapshot.snapshotStore = snapshotStore;
              snapshot.dataItems = dataItems;
              snapshot.newData = newData;
              return Promise.resolve({ snapshot: snapshot });
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
            snapshotToRemove: SnapshotStore<T,K>,
          ) {
            //compare state to find snapshot
           const index = this.delegate.findIndex(
              (snapshotStore) =>
                snapshotStore.id === snapshotToRemove.id &&
                snapshotStore.snapshotCategory === snapshotToRemove.category &&
                snapshotStore.key === snapshotToRemove.key &&
                snapshotStore.topic === snapshotToRemove.topic &&
                snapshotStore.priority === snapshotToRemove.priority &&
                snapshotStore.tags === snapshotToRemove.tags &&
                snapshotStore.metadata === snapshotToRemove.metadata &&
                snapshotStore.status === snapshotToRemove.status &&
                snapshotStore.isCompressed === snapshotToRemove.isCompressed &&
                snapshotStore.expirationDate === snapshotToRemove.expirationDate &&
                snapshotStore.timestamp === snapshotToRemove.timestamp &&
                snapshotStore.data === snapshotToRemove.data &&
                this.compareSnapshotState(
                  snapshotStore.state as Snapshot<BaseData> | null,
                  snapshotToRemove.state
                )
           );
            if (index!== -1) {
              this.delegate.splice(index, 1);
            }
            notify(
              `${snapshotToRemove.id}`,
              `Snapshot ${snapshotToRemove.id} removed successfully.`,
              "Success",
              new Date(),
              NotificationTypeEnum.Success,
              NotificationPosition.TopRight
            );
          },
          clearSnapshots: function () {
            defaultImplementation();
          },
          addSnapshot: async function (
            snapshot: SnapshotStore<any, K>,
            subscribers: Subscriber<BaseData, K>[]
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
          createSnapshotFailure: async function (
            snapshotManager: SnapshotManager<T, T>,
            snapshot: Snapshot<BaseData>,
            error: Error): Promise<void> {
            notify(
              "createSnapshotFailure",
              `Error creating snapshot: ${error.message}`,
              "",
              new Date(),
              NotificationTypeEnum.Error,
              NotificationPosition.TopRight
            );

            // Assuming this.delegate[0].createSnapshotFailure expects a snapshot and error
            await this.delegate[0].createSnapshotFailure(snapshotManager, snapshot, error);
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
            snapshotStoreConfig: SnapshotStoreConfig<T, K>,
            snapshotData: SnapshotStore<T, K>
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
            snapshot: SnapshotStore<T, K>
          ) {
            const snapshotStore = snapshot;
           
          },
          setSnapshots: function (
            snapshots: SnapshotStore<T, K>[]
          ) {
            // set snapshots
            const snapshotStore = snapshots;

          },

          clearSnapshot: function ( ) {
            defaultImplementation();
          },
          mergeSnapshots: function (
            snapshots: T[]
          ) {
          
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
          getSubscribers(
            subscribers: Subscriber<T, K>[],
            snapshots: Snapshots<T>
          ): Promise<{ subscribers: Subscriber<T, K>[]; snapshots: Snapshots<T> }> {
            return this.delegate[0].getSubscribers(subscribers, snapshots);
          },
          notify: function () {
            defaultImplementation();
          },
          notifySubscribers(
            subscribers: Subscriber<T, K>[],
            data: Snapshot<BaseData>
          ): Subscriber<T, K>[] {
            // Notify each subscriber with the provided data
            const notifiedSubscribers = subscribers.map(subscriber =>
              subscriber.notify ? subscriber.notify(data) : subscriber
            );
            return notifiedSubscribers as Subscriber<T, K>[];
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
            snapshot: Snapshot<BaseData, BaseData>,
            data: T,
            delegate: SnapshotStoreConfig<BaseData, T>[]
          ): Promise<{
            id: any;
            category: string | CategoryProperties | undefined;
            timestamp: any;
            snapshot:Snapshot<BaseData, BaseData>;
            data: T;
            delegate: SnapshotStoreConfig<BaseData, T>[]
          }> {
            return Promise.resolve({
              id,
              category,
              timestamp,
              snapshot: data as Snapshot<BaseData>,
              data: data,
              delegate: delegate
            });

          },
          fetchSnapshotSuccess: function (
            snapshotData: (
              subscribers: Subscriber<T, K>[],
              snapshot: Snapshots<BaseData>) => void
          ) {
            return snapshotData;
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
            snapshot: SnapshotStore<T,K>,
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
            Snapshot<T, T>
          > {
             return {} as IterableIterator<Snapshot<T, T>>;
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

  setSnapshotSuccess(
    snapshotData: SnapshotStore<T, K>,
    subscribers: ((data: Subscriber<T, T>) => void)[]
  ): void { 
    this.delegate[0].setSnapshotSuccess(snapshotData, subscribers);
  }

  setSnapshotFailure(error: Error): void {
    this.delegate[0].setSnapshotFailure(error);
  }

  createSnapshotFailure(
    snapshotManager: SnapshotManager<T, T>,
    snapshot: Snapshot<BaseData>, error: Error): void {
    notify(
      "createSnapshotFailure",
      `Error creating snapshot: ${error.message}`,
      "",
      new Date(),
      NotificationTypeEnum.Error,
      NotificationPosition.TopRight
    );
    this.delegate[0].createSnapshotFailure(snapshotManager, snapshot, error);
  }

   // Example method similar to updateSnapshots
  updateSnapshots(): void {
    this.delegate[0].updateSnapshots();
  }

  // Example method similar to updateSnapshotsSuccess
  updateSnapshotsSuccess(
    snapshotData: (subscribers: Subscriber<T, K>[], snapshot: Snapshots<T>)=>void ): void {
    if (this.delegate.length > 0 && typeof this.delegate[0].updateSnapshotsSuccess === 'function') {
      this.delegate[0].updateSnapshotsSuccess(snapshotData);
    }
  }

  updateSnapshotsFailure(error: Payload): void {
    this.delegate[0].updateSnapshotsFailure(error);
  }

  initSnapshot(snapshotConfig: SnapshotStoreConfig<T, K>, snapshotData: SnapshotStore<T, K>): void {
    return this.delegate[0].initSnapshot(snapshotConfig, snapshotData);
  }

  

  async takeSnapshot(
    snapshot: Snapshot<T, K>,
    subscribers: Subscriber<T,K>[]
  ): Promise<{ snapshot: Snapshot<T, K> }> {
    try {
      // Perform snapshot logic here
      const result = await this.delegate[0].takeSnapshot(snapshot); // Assuming this.delegate[0] handles the snapshot logic
  
      // Assuming result is an array and you want the first element
      if (result !== null && Array.isArray(result)) {
        const snapshotWrapper: Snapshot<BaseData> = {
          ...result[0],
          data: result[0].data as BaseData,
          timestamp: result[0].timestamp,
          type: result[0].type,
          id: result[0].id,
          key: result[0].key,
        };
  
        return {
          snapshot: snapshotWrapper,
        };
      }
  
      throw new Error("Failed to take snapshot");
    } catch (error) {
      handleApiError(error as AxiosError<unknown>, "Failed to take snapshot");
      throw error;
    }
  }
  

  takeSnapshotSuccess(snapshot: Snapshot<T, K>): void {
    this.delegate[0].takeSnapshotSuccess(snapshot);
  }

  takeSnapshotsSuccess(snapshots: T[]): void {
    this.delegate[0].takeSnapshotsSuccess(snapshots);
  }

  configureSnapshotStore(
    snapshot: SnapshotStore<T, K>
  ): void {
    this.delegate[0].configureSnapshotStore(snapshot);
  }

  public async getData<T extends Data>(data: Snapshot<T> | Snapshot<CustomSnapshotData>): Promise<{
    data: (Snapshot<T> | Snapshot<CustomSnapshotData>)[],
    getDelegate: SnapshotStore<T, K>,
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

  
  public flatMap<U>(
    callback: (value: SnapshotStoreConfig<Snapshot<T>, K>, index: number, array: SnapshotStoreConfig<Snapshot<T>, K>[]) => U
  ): U[] {
    const result: U[] = [];
    this.snapshotConfig.forEach((delegateItem, i, arr) => {
      const mappedValues = callback(delegateItem, i, arr);
      result.push(...mappedValues);
    });
    return result;
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

  validateSnapshot(snapshot: Snapshot<T>): boolean {
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

  setSnapshot(snapshot: Snapshot<T, K>): void {
    if (this.delegate[0]) {
      this.delegate[0].setSnapshot?(snapshot) : null;
    }
  }
  
  
  transformSnapshotConfig<T extends BaseData>(config: SnapshotStoreConfig<BaseData, T>): SnapshotStoreConfig<BaseData, T> {
    const { initialState, configOption, ...rest } = config;
  
    const transformedConfigOption = configOption
      ? {
          ...configOption,
          initialState: configOption.initialState ? new Map([...configOption.initialState.entries()]) as Map<string, T> : null,
        }
      : undefined;
  
    // Handle initialState based on its type
    let transformedInitialState: SnapshotStore<BaseData> | Snapshot<BaseData> | null;
    if (initialState instanceof SnapshotStore || initialState instanceof Snapshot || initialState === null) {
      transformedInitialState = initialState;
    } else {
      transformedInitialState = null; // or handle default case as necessary
    }
  
    return {
      ...rest,
      initialState: transformedInitialState,
      configOption: transformedConfigOption ? transformedConfigOption : undefined,
    };
  }

    // Combined method
    setSnapshotData(
      subscribers: Subscriber<any, any>[],
      snapshotData: Partial<SnapshotStoreConfig<BaseData, T>>
    ): void {
      // Handle updating the config
      if (this.config) {
        this.config = this.config.map(configItem => ({
          ...configItem,
          ...snapshotData,
        }));
      } else {
        this.config = [{ ...snapshotData } as SnapshotStoreConfig<BaseData, T>];
      }
  
      // Handle updating the delegate
      if (this.delegate.length > 0) {
        const currentSnapshot = this.delegate[0];
        const updatedSnapshot: SnapshotStoreConfig<BaseData, T> = {
          ...currentSnapshot,
          ...snapshotData,
          state: currentSnapshot.state
            ? currentSnapshot.state.filter((snapshot): snapshot is Snapshot<T> => snapshot.type !== null)
            : [],
        };
  
        // Transform the updated snapshot to ensure type compatibility
        const transformedSnapshot = this.transformSnapshotConfig(updatedSnapshot);
  
        this.delegate[0] = transformedSnapshot;
  
        // Notify subscribers or trigger updates if necessary
        this.notifySubscribers(subscribers, snapshotData);
      }
    }
  
  
  setSnapshots(snapshots: SnapshotStore<BaseData, T>[]): void {
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
    subscribers: Subscriber<T, K>[],
    snapshots: Snapshots<T>
  ): Promise<{
    subscribers: Subscriber<T, K>[];
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
      id,
      message,
      content,
      new Date(),
      type
    );
  }

  notifySubscribers(
    subscribers: Subscriber<T, K>[],
    data: Partial<SnapshotStoreConfig<BaseData, any>>
  ): Subscriber<BaseData, K>[] {
    // Example implementation
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
    snapshot: Snapshot<BaseData>,
    data: T,
    delegate: SnapshotStoreConfig<BaseData, T>[]
  ): Promise<{
    id: any;
    category: string | CategoryProperties | undefined;
    timestamp: any;
    snapshot: Snapshot<BaseData>;
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
      subscribers: Subscriber<T, K>[],
      snapshot: Snapshots<BaseData>) => void
  ): void {
    this.delegate[0].fetchSnapshotSuccess(snapshotData);
  }

  fetchSnapshotFailure(payload: { error: Error }): void {
    this.delegate[0].fetchSnapshotFailure(payload);
  }

  getSnapshots(
    category: string,
    data: Snapshots<T>
  ): void {
    this.delegate[0].getSnapshots(category, data);
  }

  getAllSnapshots(
    data: (
      subscribers: Subscriber<T, K>[],
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
    subscribers: Subscriber<T, K>[],
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
      subscribers: Subscriber<T, K>[]
    ) => Promise<{
      subscribers: Subscriber<T, K>[];
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
    subscribers: Subscriber<T, K>[],
    snapshots: Snapshots<T>
  ): void {
    this.delegate[0].batchFetchSnapshotsSuccess(subscribers, snapshots);
  }

  batchFetchSnapshotsFailure(payload: { error: Error }): void {
    this.delegate[0].batchFetchSnapshotsFailure(payload);
  }

  batchUpdateSnapshotsSuccess(
    subscribers: Subscriber<T, K>[],
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
    snapshotStore: SnapshotStore<T,K>,
    snapshots: Snapshots<T>
  ): Promise<{ snapshots: Snapshots<T> }> {
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
const addToSnapshotList = (snapshotStore: SnapshotStore<any, any>, subscribers: Subscriber<T,K>[]) => {
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
  
  snapshot: SnapshotStore<any, any>,
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


const category = process.argv[3] as keyof CategoryProperties ?? "isHiddenInList"
const dataStoreMethods = {}
// const snapshotId = "exampleSnapshotId";
const data = new SnapshotStore<T, K>(
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

const snapshotStoreOptions: SnapshotStoreOptions<BaseData, K> = {
  initialState: this.initialState ?? {},
  snapshot,
  category,
  timestamp: new Date(),
  snapshotType,
  handleSnapshotOperation,
  displayToast,
  addToSnapshotList,
  dataStoreMethods: {} as DataStoreWithSnapshotMethods<BaseData, any>[]
  // delegate, // Uncomment and provide if needed
  // fetchInitialSnapshotData, // Uncomment and provide if needed
  // fetch, // Uncomment and provide if needed
};
const events: Record<string, CalendarEvent[]> = {};
const snapshotStore = new SnapshotStore<BaseData, K>(snapshotStoreOptions);
const dataItems: RealtimeDataItem[] = [];
const newData: Data = {
  /* new data properties */

};


const snapshotId = (await getSnapshotId(snapshot)).toString();
const baseURL = "https://example.com";
const enabled = true;
const maxRetries = 3;
const retryDelay = 1000;
const maxAge = 1000;
const staleWhileRevalidate = 1000;
const cacheKey = await fetchCacheKey();
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
const component = <YourComponent
  apiConfig={{
    name: "exampleName",
    baseURL: baseURL,
    timeout: 1000,
    headers: headersConfig,
    retry: {
      enabled: enabled,
      maxRetries: maxRetries,
      retryDelay: retryDelay
    },
    cache: {
      enabled: enabled,
      maxAge: maxAge,
      staleWhileRevalidate: staleWhileRevalidate,
      cacheKey: cacheKey
    },
    responseType: "json",
    withCredentials: false
  }}
  children={[]}
/>;

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
  timestamp: undefined,
  state: null,
  snapshots: [],
  subscribers: [],
  getSnapshotId: getSnapshotId,
  snapshot: snapshot,
  createSnapshot: createSnapshot,
  configureSnapshotStore: configureSnapshotStore,
  createSnapshotSuccess: createSnapshotSuccess,
  createSnapshotFailure: createSnapshotFailure,
  batchTakeSnapshot: batchTakeSnapshot,
  onSnapshot: onSnapshot,
  onSnapshots: null,
  snapshotData: snapshotData,
  initSnapshot: initSnapshot,
  clearSnapshot: clearSnapshot,
  updateSnapshot: updateSnapshot,
  getSnapshots: getSnapshots,
  takeSnapshot: takeSnapshot,

  addSnapshotSuccess: addSnapshotSuccess,
  removeSnapshot: removeSnapshot,
  getSubscribers: getSubscribers,
  addSubscriber: addSubscriber,
  validateSnapshot: validateSnapshot,
  getSnapshot: getSnapshot,
  getAllSnapshots: getAllSnapshots,
  takeSnapshotSuccess: takeSnapshotSuccess,
  updateSnapshotFailure: updateSnapshotFailure,
  takeSnapshotsSuccess: takeSnapshotsSuccess,
  fetchSnapshot: fetchSnapshot,
  setSnapshotSuccess: setSnapshotSuccess,
  setSnapshotFailure: setSnapshotFailure,
  updateSnapshotSuccess: updateSnapshotSuccess,
  updateSnapshotsSuccess: updateSnapshotsSuccess,
  fetchSnapshotSuccess: fetchSnapshotSuccess,
  updateSnapshotForSubscriber: updateSnapshotForSubscriber,
  updateMainSnapshots: updateMainSnapshots,
  batchUpdateSnapshots: batchUpdateSnapshots,
  batchFetchSnapshotsRequest: batchFetchSnapshotsRequest,
  batchTakeSnapshotsRequest: batchTakeSnapshotsRequest,
  batchUpdateSnapshotsRequest: batchUpdateSnapshotsRequest,
  batchFetchSnapshots: batchFetchSnapshots,
  getData: getData,
  batchFetchSnapshotsSuccess: batchFetchSnapshotsSuccess,
  batchFetchSnapshotsFailure: batchFetchSnapshotsFailure,
  batchUpdateSnapshotsFailure: batchUpdateSnapshotsFailure,
  notifySubscribers: notifySubscribers,
  notify: notify,
  updateSnapshots: updateSnapshots,
  updateSnapshotsFailure: updateSnapshotsFailure,
  flatMap: flatMap,
  setData: setData,
  getState: getState,
  setState: setState,
  handleActions: handleActions,
  setSnapshots: setSnapshots,
  mergeSnapshots: mergeSnapshots,
  reduceSnapshots: reduceSnapshots,
  sortSnapshots: sortSnapshots,
  filterSnapshots: filterSnapshots,
  mapSnapshots: mapSnapshots,
  findSnapshot: findSnapshot,
  subscribe: subscribe,
  unsubscribe: unsubscribe,
  fetchSnapshotFailure: fetchSnapshotFailure,
  generateId: generateId,
  [Symbol.iterator]: function (): IterableIterator<any> {
    const snapshotStore = this;
    return snapshotStore[Symbol.iterator]();
  },
  [Symbol.asyncIterator]: function (): AsyncIterableIterator<any> {
    const snapshotStore = this;
    return snapshotStore[Symbol.asyncIterator]();
  }
};

export { handleSnapshotOperation, initialState, initializeData, snapshotStoreConfig };
export type { SnapshotData, SnapshotStoreSubset };
export type { SnapshotData, SnapshotStoreSubset };

