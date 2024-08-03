import {
  SnapshotData,
  SnapshotStoreSubset,
} from "@/app/components/snapshots/SnapshotStore";
// SnapshotConfig.ts
import { fetchData } from "@/app/api/ApiData";
import { endpoints } from "@/app/api/ApiEndpoints";
import { fetchCategoryByName } from "@/app/api/CategoryApi";
import { RealtimeDataItem } from "@/app/components/models/realtime/RealtimeData";
import UniqueIDGenerator from "@/app/generators/GenerateUniqueIds";
import { CategoryProperties } from "@/app/pages/personas/ScenarioBuilder";
import { useParams } from "next/navigation";
import {
  UserConfigExport,
  UserConfig as ViteUserConfig,
  defineConfig,
} from "vite";
import { ModifiedDate } from "../documents/DocType";
import { FileCategory } from "../documents/FileType";
import {
  SnapshotManager,
  useSnapshotManager,
} from "../hooks/useSnapshotManager";
import determineFileCategory, {
  fetchFileSnapshotData,
} from "../libraries/categories/determineFileCategory";
import { Content } from "../models/content/AddContent";
import { BaseData, Data } from "../models/data/Data";
import {
  NotificationPosition,
  SubscriberTypeEnum,
  SubscriptionTypeEnum,
} from "../models/data/StatusType";
import { Tag, tag1, tag2 } from "../models/tracker/Tag";
import { DataStore } from "../projects/DataAnalysisPhase/DataProcessing/DataStore";
import { CalendarEvent } from "../state/stores/CalendarEvent";
import { AllStatus } from "../state/stores/DetailsListStore";
import { Subscription } from "../subscriptions/Subscription";
import {
  NotificationType,
  NotificationTypeEnum,
} from "../support/NotificationContext";
import { Subscriber, payload } from "../users/Subscriber";
import {
  logActivity,
  notifyEventSystem,
  portfolioUpdates,
  triggerIncentives,
  unsubscribe,
  updateProjectState,
} from "../utils/applicationUtils";
import { addToSnapshotList, generateSnapshotId } from "../utils/snapshotUtils";
import * as snapshotApi from "./../../api/SnapshotApi";
import {
  getCommunityEngagement,
  getMarketUpdates,
  getTradeExecutions,
} from "./../../components/trading/TradingUtils";
import {
  CustomSnapshotData,
  getCurrentSnapshotConfigOptions,
  Payload,
  Snapshot,
  Snapshots,
  UpdateSnapshotPayload,
} from "./LocalStorageSnapshotStore";
import {
  batchFetchSnapshotsFailure,
  batchFetchSnapshotsSuccess,
  batchTakeSnapshot,
  batchUpdateSnapshotsFailure,
  batchUpdateSnapshotsRequest,
  batchUpdateSnapshotsSuccess,
  handleSnapshotSuccess,
} from "./snapshotHandlers";
import SnapshotList, { SnapshotItem } from "./SnapshotList";
import SnapshotStore from "./SnapshotStore";
import { subscribeToSnapshotImpl } from "./subscribeToSnapshotsImplementation";
import { useSnapshotStore } from "./useSnapshotStore";
import { SnapshotConfig } from "./snapshot";
import {CreateSnapshotStoresPayload} from "./LocalStorageSnapshotStore";
export type T = Data;
export type K = any;

type Subscribers = Subscriber<CustomSnapshotData, Data>[];
interface AuditRecord {
  timestamp: Date;
  userId: string;
  action: string;
  details: string;
}

interface RetentionPolicy {
  retentionPeriod: number; // in days
  cleanupOnExpiration: boolean;
  retainUntil: Date;
}

interface UserConfig extends ViteUserConfig {
  snapshotConfig?: SnapshotConfig<BaseData, Data>[];
  snapshotStoreConfig?: SnapshotStoreConfig<BaseData, Data>[];
}


interface ConfigureSnapshotStorePayload<T> {
  snapshotStore: SnapshotStore<BaseData, Data>;
  snapshotId: string;
  snapshotData: T;
  timestamp: Date;
  snapshotStoreConfig: SnapshotStoreConfig<BaseData, Data>;
}

export interface SnapshotStoreConfig<T extends BaseData, K extends BaseData> {
  mapSnapshots(): unknown | undefined;
  id: string | number | null;
  name?: string;
  title?: string;
  description?: string;
  data: T;
  timestamp: string | number | Date | undefined;
  snapshotId: string;
  snapshotStore: SnapshotStore<T, K>;
  taskIdToAssign?: string;
  clearSnapshots?: any;
  key?: string;
  topic?: string;
  dataStoreMethods?: DataStore<T, K>;
  category: string | CategoryProperties | undefined;
  length?: number
  content: string | Content<T> | undefined;
  initialState: Map<string, Snapshot<T, K>> | SnapshotStore<T, K> | Snapshot<T, K> | null;
  configOption?: string | SnapshotStoreConfig<T, K> | null;
  subscription?: Subscription<T, K> | null;
  initialConfig?: SnapshotStoreConfig<T, K> | null;
  config?: SnapshotStoreConfig<BaseData, any>[] | null;

  snapshotConfig?: UserConfig["snapshotConfig"];
  snapshotCategory: string | CategoryProperties | undefined;
  snapshotSubscriberId: string | null;
  snapshotContent: string | Content<T> | undefined;
  store?: SnapshotStoreConfig<T, K> | null;
  snapshots: Snapshots<BaseData>

  set?: (data: T | Map<string, Snapshot<T, K>>, type: string, event: Event) => void | null;
  setStore?: (data: T | Map<string, SnapshotStore<T, K>>, type: string, event: Event) => void | null

  state: any;
  onInitialize?: () => void;
  removeSubscriber?: (subscriber: Subscriber<T, K>) => void;
  handleSnapshot: (
    snapshotId: string,
    snapshot: Snapshot<T, K> | null,
    snapshots: Snapshots<T>,
    type: string,
    event: Event
  ) => void | null;
  subscribers: Subscriber<T, K>[];
  onError?: (error: Payload) => void;
  getSnapshotId: (data: SnapshotData<T, K>) => string;

  snapshot: (
    id: string,
    snapshotId: string | null,
    snapshotData: Snapshot<T, K>,
    category: string | CategoryProperties | undefined,
    callback: (snapshot: Snapshot<T, K>) => void,
    snapshotContainer?: SnapshotStore<T, K> | Snapshot<T, K> | null,
    snapshotStoreConfigData?: SnapshotStoreConfig<T, K>,
  ) => Promise<{
    snapshot: Snapshot<T, K> | null }>;
  delegate: SnapshotStoreConfig<T, K>[] | null;

  createSnapshot(
    id: string,
    snapshotData: Snapshot<T, K>,
    category?: string | CategoryProperties,
    callback?: (snapshot: Snapshot<T, K>) => void,
    snapshotDataStore?: SnapshotStore<T, K>,
    snapshotStoreConfig?: SnapshotStoreConfig<T, K>, // Adjust as per your definition
  ): Snapshot<T, K> | null;

  createSnapshotStore(
    id: string,
    snapshotStoreData: Snapshots<T>,
    category?: string | CategoryProperties,
    callback?: (snapshotStore: SnapshotStore<T, K>) => void,
    snapshotDataConfig?: SnapshotStoreConfig<T, K>[]
  ): SnapshotStore<T, K> | null

  actions?: {
    takeSnapshot: (
      snapshot: Snapshot<T, K>,
      data: SnapshotStoreConfig<T, K>
    ) => Promise<Snapshot<T, K>>;

    updateSnapshot: (
      snapshot: Snapshot<T, K>,
      data: SnapshotStoreConfig<T, K>
    ) => Promise<Snapshot<T, K>>;

    deleteSnapshot: (
      snapshot: Snapshot<T, K>,
      data: SnapshotStoreConfig<T, K>
    ) => Promise<Snapshot<T, K>>;

    updateSnapshotStore: (
      snapshotStore: SnapshotStore<T, K>,
      data: SnapshotStoreConfig<T, K>
    ) => Promise<SnapshotStore<T, K>>;

    deleteSnapshotStore: (
      snapshotStore: SnapshotStore<T, K>,
      data: SnapshotStoreConfig<T, K>
    ) => Promise<SnapshotStore<T, K>>

  };

  addSnapshotFailure?: (error: Error) => void;

  setSnapshot?: (snapshot: Snapshot<T, K>) => void;
  setSnapshotStore?: (snapshot: SnapshotStore<T, K>) => void;

  configureSnapshot: (
    id: string,
    snapshotData: Snapshot<T, K>,
    category?: string | CategoryProperties,
    callback?: (snapshot: Snapshot<T, K>) => void,
    snapshotDataStore?: SnapshotStore<T, K>,
    snapshotStoreConfig?: SnapshotStoreConfig<T, K>
  ) => Snapshot<T, K> | null,


  configureSnapshotStore: (
    snapshotStore: SnapshotStore<T, K>,
    snapshotId: string,
    data: Map<string, Snapshot<T, K>>,
    events: Record<string, CalendarEvent[]>,
    dataItems: RealtimeDataItem[],
    newData: Snapshot<T, K>,
    payload: ConfigureSnapshotStorePayload<T>,
    store: SnapshotStore<any, K>,
    callback: (snapshotStore: SnapshotStore<T, K>) => void
  ) => void | null;

  createSnapshotSuccess: (snapshot: Snapshot<T, K>) => void;
  createSnapshotFailure: (
    snapshotId: string, 
    
    snapshotManager: SnapshotManager<T, K>,
    snapshot: Snapshot<T, K>,
    payload: {error: Error}
  ) => Promise<void>;
  batchTakeSnapshot: (
    snapshotStore: SnapshotStore<T, K>,
    snapshots: Snapshots<T>
  ) => Promise<{
    snapshots: Snapshots<T>;
  }>;
  onSnapshot: (
    snapshotId: string,
    snapshot: Snapshot<T, K>,
    type: string,
    event: Event,
    callback: (snapshot: Snapshot<T, K>) => void
  ) => Promise<void> | undefined;


  onSnapshots: (
    snapshotId: string,
    snapshots: Snapshots<T>,
    type: string,
    event: Event,
    callback: (snapshots: Snapshots<T>) => void
  ) => Promise<void> | undefined;

  onSnapshotStore: (
    snapshotId: string,
    snapshots: Snapshots<T>,
    type: string, event: Event,
    callback: (snapshots: Snapshots<T>) => void
  ) => void | undefined;
  
  snapshotData: (snapshot: SnapshotStore<T, K>) => {
    snapshots: Snapshots<T>;
  };

  mapSnapshot: (snapshotId: string, 
    snapshot: Snapshot<T, K>, 
    type: string,
    event: Event
  )=> SnapshotStore<T, K> | undefined

  createSnapshotStores: (
    id: string,
    snapshotId: string,
    snapshot: Snapshot<T, K>,
    snapshotStore: SnapshotStore<T, K>,
    snapshotManager: SnapshotManager<T, K>,
    payload: CreateSnapshotStoresPayload<T, K>,
    callback: (snapshotStore: SnapshotStore<T, K>[]) => void | null,
    snapshotStoreData?: SnapshotStore<T, K>[],
    category?: string | CategoryProperties,
    snapshotDataConfig?: SnapshotStoreConfig<T, K>[]
  )=> void | null
  initSnapshot: (
    snapshot: SnapshotStore<T, K> | Snapshot<T, K> | null,
    snapshotId: string | null,
    snapshotData: SnapshotStore<T, K>, // Ensure snapshotData matches SnapshotStore<T, K>
    category: string | CategoryProperties | undefined,
    snapshotConfig: SnapshotStoreConfig<T, K>, // Use K instead of T for snapshotConfig
    callback: (snapshotStore: SnapshotStore<any, any>) => void
  ) => void;
  subscribeToSnapshots: (
    snapshot: SnapshotStore<T, K>,
    snapshotId: string,
    snapshotData: SnapshotStore<T, K>,
    category: string | CategoryProperties | undefined,
    snapshotConfig: SnapshotStoreConfig<T, K>,
    callback: (snapshotStore: SnapshotStore<any, any>) => void
  ) => void;
  clearSnapshot: () => void;
  handleSnapshotOperation: (
    snapshot: Snapshot<T, K>,
    data: SnapshotStoreConfig<T, K>
  ) => Promise<void>;
  displayToast: (message: string) => void;
  addToSnapshotList: (
    snapshots: Snapshot<T, K>,
    subscribers: Subscriber<Data, CustomSnapshotData>[]
  ) => void;

  addToSnapshotStoreList: (
    snapshotStore: SnapshotStore<any, any>,
    subscribers: Subscriber<Data, CustomSnapshotData>[]
  ) => void;

  fetchInitialSnapshotData: () => Promise<Snapshot<Data>[]>;
  updateSnapshot: (
    snapshotId: string,
    data: Map<string, BaseData>,
    events: Record<string, CalendarEvent[]>,
    snapshotStore: SnapshotStore<T, K>,
    dataItems: RealtimeDataItem[],
    newData: T,
    payload: UpdateSnapshotPayload<T>,
    store: SnapshotStore<any, any>
  ) => Promise<{ snapshot: Snapshot<Data> }>;

  getSnapshots: (
    category: string,
    snapshots: Snapshots<T>
  ) => Promise<{
    snapshots: Snapshots<T>;
  }>;

  takeSnapshot: (snapshot: Snapshot<T, K>) => Promise<{
    snapshot: Snapshot<T, K>;
  }>;

  takeSnapshotStore: (snapshot: SnapshotStore<T, K>) => Promise<{
    snapshot: SnapshotStore<T, K>;
  }>;

  addSnapshot: (snapshot: T, subscribers: Subscriber<BaseData, K>[]) => void;

  addSnapshotSuccess: (
    snapshot: T,
    subscribers: Subscriber<BaseData, K>[]
  ) => void;

  removeSnapshot: (snapshotToRemove: SnapshotStore<T, K>) => void;

  getSubscribers: (
    subscribers: Subscriber<BaseData, K>[],
    snapshots: Snapshots<K>
  ) => Promise<{
    subscribers: Subscriber<BaseData, K>[];
    snapshots: Snapshots<T>;
  }>;

  addSubscriber: (
    subscriber: Subscriber<BaseData, K>,
    data: T,
    snapshotConfig: SnapshotStoreConfig<BaseData, T>[],
    delegate: SnapshotStoreSubset<T, K>,
    sendNotification: (type: NotificationTypeEnum) => void
  ) => void;
  validateSnapshot: (data: Snapshot<T, K>) => boolean;
  getSnapshot(
    snapshot: (
      id: string
    ) =>
      | Promise<{
        category: any;
        timestamp: any;
        id: any;
        snapshot: Snapshot<T, K>;
        data: T;
      }>
      | undefined
  ): Promise<Snapshot<T, K>>;

  getAllSnapshots: (
    data: (
      subscribers: Subscriber<T, K>[],
      snapshots: Snapshots<T>
    ) => Promise<Snapshots<T>>
  ) => Promise<Snapshots<T>>;

  takeSnapshotSuccess: (snapshot: Snapshot<T, K>) => void;
  updateSnapshotFailure: (payload: { error: string }) => void;
  takeSnapshotsSuccess: (snapshots: T[]) => void;
  fetchSnapshot: (
    id: string,
    category: string | CategoryProperties | undefined,
    timestamp: Date,
    snapshot: Snapshot<T, K>,
    data: T,
    delegate: SnapshotStoreConfig<T, K>[] | null,
  ) => Promise<{
    id: any;
    category: string | CategoryProperties | undefined;
    timestamp: any;
    snapshot: Snapshot<T, K>;
    data: T;
    delegate: SnapshotStoreConfig<T, K>[] | null;
  }>;

addSnapshotToStore: (
  snapshotStore: SnapshotStore<any, any>,
  subscribers: Subscriber<Data, CustomSnapshotData>[]
) => void;

  getSnapshotSuccess(snapshot: Snapshot<T, K>): Promise<SnapshotStore<T, K>>;
  setSnapshotSuccess: (
    snapshot: SnapshotStore<T, K>,
    subscribers: ((data: Subscriber<T, K>) => void)[]
  ) => void;
  setSnapshotFailure: (error: any) => void;
  updateSnapshotSuccess: (
    snapshotId: string,
    snapshotManager: SnapshotManager<T, K>,
    snapshot: Snapshot<T, K>,
    payload: { error: Error; }
  ) => void | null

  updateSnapshotsSuccess: (
    snapshotData: (
      subscribers: Subscriber<BaseData, K>[],
      snapshot: Snapshots<T>
    ) => void
  ) => void;
  fetchSnapshotSuccess: (
    snapshotData: (
      subscribers: Subscriber<T, K>[],
      snapshot: Snapshot<T, K>
    ) => void
  ) => void;

  updateSnapshotForSubscriber: (
    subscriber: Subscriber<BaseData, K>,
    snapshots: Snapshots<T>
  ) => Promise<{
    subscribers: Subscriber<BaseData, K>[];
    snapshots: T[];
  }>;

  updateMainSnapshots: (snapshots: Snapshots<T>) => Promise<Snapshots<T>>;

  batchProcessSnapshots: (
    subscribers: Subscriber<BaseData, K>[],
    snapshots: Snapshots<T>
  ) => Promise<{ snapshots: Snapshots<T> }[]>;
  
  batchUpdateSnapshots: (
    subscribers: Subscriber<BaseData, K>[],
    snapshots: Snapshots<T>
  ) => Promise<{ snapshots: Snapshots<T> }[]>;

  batchFetchSnapshotsRequest: (snapshotData: {
    subscribers: Subscriber<BaseData, K>[];
    snapshots: Snapshots<T>;
  }) => Promise<{
    subscribers: Subscriber<BaseData, K>[];
    snapshots: Snapshots<T>;
  }>;

  batchTakeSnapshotsRequest: (snapshotData: any) => Promise<{
    snapshots: Snapshots<T>;
  }>;

  batchUpdateSnapshotsSuccess?: (
    subscribers: Subscriber<BaseData, K>[],
    snapshots: Snapshots<T>
  ) => {
    snapshots: Snapshots<T>;
  }[];

  batchUpdateSnapshotsRequest: (
    snapshotData: (subscribers: Subscriber<T, K>[]) => Promise<{
      subscribers: Subscriber<T, K>[];
      snapshots: Snapshots<T>;
    }>
  ) => {
    subscribers: Subscriber<BaseData, K>[];
    snapshots: Snapshots<T>;
  };

  batchFetchSnapshots: (
    subscribers: Subscriber<BaseData, K>[],
    snapshots: Snapshots<T>
  ) => Promise<{
    subscribers: Subscriber<BaseData, K>[];
    snapshots: Snapshots<T>;
  }>;

  getData: (data: Snapshot<T, K> | Snapshot<CustomSnapshotData>) => Promise<{
    data: Snapshot<T, K>;
  }>;

  batchFetchSnapshotsSuccess: (
    subscribers: Subscriber<BaseData, K>[],
    snapshots: Snapshots<T>
  ) => Snapshots<T>;

  batchFetchSnapshotsFailure: (payload: { error: Error }) => void;
  batchUpdateSnapshotsFailure: (payload: { error: Error }) => void;
  notifySubscribers: (
    subscribers: Subscriber<T, K>[],
    data: Partial<SnapshotStoreConfig<BaseData, any>>
  ) => Subscriber<BaseData, K>[];

  notify: (
    id: string,
    message: string,
    content: any,
    date: Date,
    type: NotificationType
  ) => void;
  [Symbol.iterator]: () => IterableIterator<T>;
  [Symbol.asyncIterator]: () => AsyncIterableIterator<T>;

  getCategory: (
    category: string | CategoryProperties | undefined
  ) => string;
  // New properties
  expirationDate?: Date;
  isExpired?: (() => boolean) | undefined;
  priority?: AllStatus;
  tags?: string[] | Tag[];
  metadata?: Record<string, any>;
  status?: "active" | "inactive" | "archived";
  isCompressed?: boolean;
  compress?: () => void;
  isEncrypted?: boolean;
  encrypt?: () => void;
  decrypt?: () => void;
  ownerId?: string;
  getOwner?: () => string;
  version?: string;
  previousVersionId?: string;
  nextVersionId?: string;
  auditTrail?: AuditRecord[];
  addAuditRecord?: (record: AuditRecord) => void;
  retentionPolicy?: RetentionPolicy;
  dependencies?: string[];

  updateSnapshots: () => void;
  updateSnapshotsFailure: (error: Payload) => void;

  flatMap: <U>(
    callback: (snapshot: Snapshot<T, K> | SnapshotStoreConfig<T, K>, index: number, array: (Snapshot<T, K> | SnapshotStoreConfig<T, K>)[]) => U
  ) => U[] | void;

  setData: (data: K) => void;
  getState: () => any;
  setState: (state: any) => void;
  handleActions: (action: any) => void;
  setSnapshots: (snapshots: Snapshots<T>) => void;
  mergeSnapshots: (snapshots: Snapshots<T>, category: string) => Promise<void>;
  reduceSnapshots: <U>(callback: (acc: U, snapshot: Snapshot<T, K>) => U, initialValue: U) => U;
  sortSnapshots: (compareFn: (a: Snapshot<T, K>, b: Snapshot<T, K>) => number) => void;
  filterSnapshots: (predicate: (snapshot: Snapshot<T, K>) => boolean) => Snapshot<T, K>[];
  findSnapshot: (predicate: (snapshot: Snapshot<T, K>) => boolean) => Snapshot<T, K> | undefined;
  subscribe: (callback: (snapshot: Snapshot<T, K>) => void) => void;
  unsubscribe: (callback: (snapshot: Snapshot<T, K>) => void) => void;
  fetchSnapshotFailure: (payload: { error: Error }) => void;
  generateId: () => string;

  [Symbol.iterator]: () => IterableIterator<T>;
  [Symbol.asyncIterator]: () => AsyncIterableIterator<T>;

}

const snapshotConfig: SnapshotStoreConfig<any, any>[] = [
  {
    id: null,
    snapshotId: "snapshot1",
    key: "key1",
    priority: "active",
    topic: "topic1",
    status: "active",
    category: "category1",
    timestamp: new Date(),
    state: null,
    snapshots: [],
    subscribers: [],
    subscription: null,
    initialState: null,
    clearSnapshots: null,
    isCompressed: false,
    expirationDate: new Date(),
    tags: [tag1, tag2],
    metadata: {
      creator: "admin",
      environment: "production",
    },
    configOption: {
      id: null,
      snapshotId: "snapshot1",
      subscribers: [],
      onSnapshots: null,
      clearSnapshots: null,
      key: "",
      configOption: null,
      subscription: null,
      initialState: null,
      category: "",
      timestamp: new Date(),
      set: (data: any, type: string, event: Event) => {
        console.log(`Event type: ${type}`);
        console.log("Event:", event);
        return null;
      },
      data: null,
      store: null,
      state: null,
      snapshots: [],

      handleSnapshot: (
        snapshotId: string,
        snapshot: Snapshot<BaseData> | null,
      ) => {
        console.log(`Handling snapshot with ID: ${snapshotId}`, snapshot);
      },
      onInitialize: () => {
        console.log("Snapshot store initialized.");
      },
      onError: (error: any) => {
        console.error("Error in snapshot store:", error);
      },

      createSnapshot: (
        id: string,
        snapshotData: Snapshot<T, K>, // Use Snapshot instead of Map
        category: string | CategoryProperties | undefined,
        callback: (snapshot: Snapshot<T, K>) => void,
        snapshotDataStore?: SnapshotStore<any, any> | undefined,
        snapshotDataConfig?: string | SnapshotStoreConfig<any, any> | null, // Adjust as per your definition
      ): Snapshot<T, K> | null => {
        console.log(
          `Creating snapshot with ID: ${id} in category: ${category}`,
          snapshotDataConfig
        );

        // Define event handling
        const eventHandlers: { [event: string]: ((snapshot: Snapshot<T, K>) => void)[] } = {};

        // Return a Snapshot object
        return {
          id,
          data: snapshotData, // Ensure snapshotData is of type Snapshot<T, K>
          category,
          snapshotItems: [],
          meta: {} as Map<string, Snapshot<Data, any>>,
          configOption: snapshotDataConfig, // Ensure snapshotDataConfig is of type SnapshotStoreConfig<any, any>
          dataItems: [],
          newData: undefined,
          stores: [],
          timestamp: new Date(),
          handleSnapshot: (snapshotId: string, snapshot: Snapshot<T, K> | null) => {
            console.log(`Handling snapshot with ID: ${snapshotId}`, snapshot);
            if (snapshot) {
              console.log("Snapshot:", snapshot);
            }
          },
          events: {
            eventRecords: {
              add: [],
              remove: [],
              update: [],
            },
            callbacks: [],
            subscribers: [],
            eventIds: [],
            on: (event: string, callback: (snapshot: Snapshot<T, K>) => void) => {
              if (!eventHandlers[event]) {
                eventHandlers[event] = [];
              }
              eventHandlers[event].push(callback);
              console.log(`Event '${event}' registered.`);
            },
            off: (event: string, callback: (snapshot: Snapshot<T, K>) => void) => {
              if (eventHandlers[event]) {
                eventHandlers[event] = eventHandlers[event].filter(cb => cb !== callback);
                console.log(`Event '${event}' unregistered.`);
              }
            }
          },
          getSnapshotId: (
            snapshotData: Snapshot<T, K>,
          ) => {
            console.log("Getting snapshot ID");

            console.log("Snapshot data:", snapshotData);
            return null;
          },
          compareSnapshotState: (snapshot: Snapshot<T, K>) => {
            console.log("Comparing snapshot state:", snapshot);
            return null;
          },
          eventRecords: {
            add: [],
            remove: [],
            update: [],
          },
          snapshotStore: null,
          subscribe: (callback: (snapshot: Snapshot<T, K>) => void) => {
            console.log("Subscribed to snapshot:", callback);
          },
          unsubscribe: (callback: (snapshot: Snapshot<T, K>) => void) => {
            console.log("Unsubscribed from snapshot:", callback);
          },
          fetchSnapshotFailure: (
            snapshotManager: SnapshotManager<T, K>,
              snapshot: Snapshot<T, K>,
              payload: { error: Error }
            ) => {
              console.log("Fetching snapshot:", snapshot);
              console.error("Error fetching snapshot:", payload.error);
          },
          fetchSnapshotSuccess: (
            snapshotManager: SnapshotManager<T, K>,
            snapshot: Snapshot<T, K>,
          ) => {
            console.log("Fetching snapshot:", snapshot);
          },

          fetchSnapshot: (
            snapshotId: string,
            callback: (
              snapshot: Snapshot<T, K>
            ) => void
          ) => {
            console.log("Fetching snapshot with ID:", snapshotId);
            if (snapshotId === "snapshot1") {
              callback({
                id: "snapshot1",
                data: {
                  name: "John Doe",
                  age: 30,
                  timestamp: new Date().getTime(),
                },
                category: "user",
                snapshotItems: [],
                meta: new Map(),
                configOption: null,
                dataItems: [],
                newData: undefined,
                stores: [],
                timestamp: new Date(),
                handleSnapshot: (snapshotId: string, snapshot: Snapshot<T, K> | null) => {
                  console.log(`Handling snapshot with ID: ${snapshotId}`, snapshot);
                  if (snapshot) {
                    console.log("Snapshot:", snapshot);
                  }
                },
                events: {
                  eventRecords: {
                    add: [],
                    remove: [],
                    update: [],
                  },
                  callbacks: [],
                  subscribers: [],
                  eventIds: [],
                  on: (event: string, callback: (snapshot: Snapshot<T, K>) => void) => {
                    if (!eventHandlers[event]) {
                      eventHandlers[event] = [];
                    }
                    eventHandlers[event].push(callback);
                    console.log(`Event '${event}' registered.`);
                  }
                },
                getSnapshotId: () => { },
                compareSnapshotState: (snapshot: Snapshot<T, K>) => {
                  console.log("Comparing snapshot state:", snapshot);
                  return null;
                },
                eventRecords: {
                  add: [],
                  remove: [],
                  update: [],
                },
                snapshotStore: null,
                unsubscribe: (callback: (snapshot: Snapshot<T, K>) => void) => {
                  console.log("Unsubscribed from snapshot:", callback);
                },

                configureSnapshotStore: (
                  snapshotStore: SnapshotStore<T, K>,
                  snapshotId: string,
                  data: Map<string, BaseData>,
                  events: Record<string, CalendarEvent[]>,
                  dataItems: RealtimeDataItem[],
                  newData: Snapshot<T, K>,
                  payload: ConfigureSnapshotStorePayload<T>,
                  store: SnapshotStore<any, K>
                ) => {
                  console.log("Configuring snapshot store:", snapshotStore);
                  snapshotStore.configureSnapshotStore(snapshotStore, snapshotId, data, events, dataItems, newData, payload, store, callback);
                },

                updateSnapshotSuccess: (
                  snapshotId: string,
                  snapshotManager: SnapshotManager<T, K>,
                  snapshot: Snapshot<T, K>) => {
                  console.log("Updating snapshot:", snapshotId, snapshot);
                                  },
                createSnapshotFailure: (
                  snapshotId: string,
                  snapshotManager: SnapshotManager<Data, any>,
                  snapshot: Snapshot<T, K>
                ): Promise<void> => {
                  console.log("Creating snapshot failure:", snapshotId, snapshotManager, snapshot);
                  return Promise.resolve();
                },
                getParentId: () => "",
                getChildIds: () => [],
                addChild: (snapshot: Snapshot<T, K>) => {
                  console.log("Adding snapshot:", snapshot);
                },
                removeChild: (snapshot: Snapshot<T, K>) => {
                  console.log("Removing snapshot:", snapshot);
                },
                getChildren: () => [],
                hasChildren: () => false,
                isDescendantOf: (snapshot: Snapshot<T, K>) => false,
                getStore: (
                  storeId: string,
                  snapshotId: string,
                  snapshot: Snapshot<T, K>,
                  type: string,
                  event: Event
                ) => null,
                addStore: (
                  storeId: string,
                  store: SnapshotStore<T, K>,
                  snapshotId: string,
                  snapshot: Snapshot<T, K>,
                  type: string,
                  event: Event
                ) => {
                  console.log("Adding store:", storeId, store, snapshotId, snapshot, type, event);
                  return store;
                },
                mapSnapshot(
                  snapshotId: string,
                  snapshot: Snapshot<Data, any>,
                  type: string, event: Event
                ): Snapshot<T, K> {
                  console.log("Mapping snapshot:", snapshot);
                  return snapshot;
                },
                removeStore(
                  storeId: string,
                  store: SnapshotStore<T, K>,
                  snapshotId: string,
                  snapshot: Snapshot<T, K>,
                  type: string,
                  event: Event
                ): Snapshot<T, K>{
                  console.log("Removing store:", storeId, store, snapshotId, snapshot, type, event);
                  return snapshot;
                },
              })
            }
          },
          configureSnapshotStore: (
            snapshotStore: SnapshotStore<T, K>,
            snapshotId: string,
            data: Map<string, BaseData>,
            events: Record<string, CalendarEvent[]>,
            dataItems: RealtimeDataItem[],
            newData: Snapshot<T, K>,
            payload: ConfigureSnapshotStorePayload<T>,
            store: SnapshotStore<any, K>
          ) => {
            console.log("Configuring snapshot store:", snapshotStore);
          },
          updateSnapshot: (
            snapshotId: string,
            // oldSnapshot: Snapshot<T, K>,
            data: Map<string, BaseData>,
            events: Record<string, CalendarEvent[]>,
            snapshotStore: SnapshotStore<T, K>,
            dataItems: RealtimeDataItem[],
            newData: Snapshot<T, K>,
            payload: UpdateSnapshotPayload<T>,
            store: SnapshotStore<any, K>
          ) => {
            console.log("Updating snapshot:", newData);
          },
          updateSnapshotFailure: (
            snapshotManager: SnapshotManager<T, K>,
            snapshot: Snapshot<BaseData, BaseData>,
            payload: { error: Error }
          ) => {
            console.log("Error in updating snapshot:", payload);
          },
          updateSnapshotSuccess: (snapshot: Snapshot<T, K>) => {
            console.log("Updated snapshot:", snapshot);
          },
          updateSnapshotItem: (snapshotItem: SnapshotItem) => {
            console.log("Updating snapshot item:", snapshotItem);
          },
          // other properties if any
        };
      },
    },

    createSnapshotStores(
      id: string,
      snapshotId: string,
      snapshot: Snapshot<T, K>,
      snapshotStore: SnapshotStore<T, K>,
      snapshotManager: SnapshotManager<T, K>,
      payload: CreateSnapshotStoresPayload<T, K>,
      callback: (snapshotStore: SnapshotStore<T, K>[]) => void | null,
      snapshotStoreData?: SnapshotStore<T, K>[],
      category?: string | CategoryProperties,
      snapshotDataConfig?: SnapshotStoreConfig<T, K>[]
    ): SnapshotStore<T, K>[] | null {
      console.log(`Creating snapshot stores with ID: ${id} in category: ${category}`, snapshotDataConfig);
    
      // Example logic to create snapshot stores
      const newSnapshotStores: SnapshotStore<T, K>[] = snapshotStoreData ?? [];
    
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
      category: string | CategoryProperties | undefined,
      callback: (snapshotStores: SnapshotStore<any, any>[]) => void,
      snapshotDataConfig?: SnapshotStoreConfig<any, any>[] // Adjust as per your definition
    ): SnapshotStore<any, any>[] | null => {
      console.log(`Creating snapshot with ID: ${id} in category: ${category}`, snapshotDataConfig);
    
      // Call the callback function with the snapshotStoresData
      callback(snapshotStoresData);
    
      // Return the array of SnapshotStore objects
      return snapshotStoresData;
    };
    
    
    createSnapshotStore: <T extends Data, K extends Data>(
      id: string,
      snapshotStoreData: Snapshot<T, K>[], // Array of Snapshot objects
      category: string | CategoryProperties | undefined,
      callback: (snapshotStore: SnapshotStore<T, K>) => void,
      snapshotDataConfig?: SnapshotStoreConfig<T, K>[] // Array of SnapshotStoreConfig objects
    ): SnapshotStore<T, K> | null => {
      console.log(
        `Creating snapshot with ID: ${id} in category: ${category}`,
        snapshotDataConfig
      );

      // fetch snapshotId:
      const snapshotId = snapshotDataConfig?.[0]?.snapshotId; // Assuming the first config contains the snapshotId
      // Return a SnapshotStore object
      return {
        id,
        category,
        store: snapshotStoreData, // This is an array of Snapshot objects
        snapshotId: snapshotId || 'defaultSnapshotId', // Provide a default value if snapshotId is undefined
        // other properties if any
      };
    },


    configureSnapshotStore: (snapshotId: string, snapshotStore: SnapshotStore<T, K>) => {
      console.log("Configuring snapshot store:", snapshotStore, "with ID:", snapshotId);
    },

    batchTakeSnapshot: async (
      snapshotStore: SnapshotStore<T, K>,
      snapshots: Snapshots<T>
    ) => {
      console.log("Batch taking snapshots:", snapshotStore, snapshots);
      return { snapshots };
    },

    onSnapshot: (snapshot: SnapshotStore<T, K>) => {
      console.log("Snapshot taken:", snapshot);
    },

    initSnapshot: (
      snapshot: SnapshotStore<T, K> | Snapshot<T, K> | null,
      snapshotId: string | null,
      snapshotData: SnapshotStore<T, K>,
      category: string | CategoryProperties | undefined,
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
      data: Map<string, BaseData>,
      events: Record<string, CalendarEvent[]>,
      snapshotStore: SnapshotStore<T, K>,
      dataItems: RealtimeDataItem[],
      newData: Snapshot<Data>,
      payload: UpdateSnapshotPayload<T>,
      store: SnapshotStore<any, any>
    ) => {
      console.log(
        `Updating snapshot with ID: ${snapshotId}`,
        newData,
        payload
      );
      return { snapshot: newData };
    },
    getSnapshots: async (category: string, snapshots: Snapshots<T>) => {
      console.log(`Getting snapshots in category: ${category}`, snapshots);
      return { snapshots };
    },

    takeSnapshot: async (snapshot: SnapshotStore<T, K>) => {
      console.log("Taking snapshot:", snapshot);
      return { snapshot: snapshot }; // Adjust according to your snapshot logic
    },

    addSnapshot: (snapshot: Snapshot<T, K>) => {
      console.log("Adding snapshot:", snapshot);
    },

    removeSnapshot: (snapshotToRemove: SnapshotStore<T, K>) => {
      console.log("Removing snapshot:", snapshotToRemove);
    },

    getSubscribers: async (
      subscribers: Subscriber<BaseData, K>[],
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
      id: string,
      snapshotId: string | null,
      snapshotData: Snapshot<T, K>,
      category: string | CategoryProperties | undefined,
      callback: (snapshotStore: Snapshot<T, K>) => void
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

    setSnapshot: (snapshot: SnapshotStore<T, K>) => {
      return Promise.resolve({ snapshot });
    },

    createSnapshot: (
      id: string,
      snapshotData: Snapshot<T, K>,
      category: string | CategoryProperties | undefined,
      // snapshotStore?: SnapshotStore<any,any>
    ): Snapshot<T, K> | null => {
      console.log(
        `Creating snapshot with ID: ${id} in category: ${category}`,
        snapshotData
      );

      // Return a Snapshot<Data> object
      return {
        id,
        data: snapshotData, // Ensure snapshotData is of type Data
        category,
        timestamp: new Date(),
        dataItems: [],
        newData: snapshotData,
        // store: snapshotStore,
        // // unsubscribe: unsubscribe,
        // getSnapshotId: getSnapshotId,
        // compareSnapshotState: compareSnapshotState,
        // snapshot: snapshot,
        // snapshotStore: snapshotStore,
        // handleSnapshot: handleSnapshot,
        // unsubscribe: unsubscribe,
        // events: {
        //   eventRecords,
        //   callbacks: (snapshot: Snapshot<Data>) => {
        //     return {
        //       snapshot: snapshot,
        //       events: snapshot.meta.events,
        //       callbacks: snapshot.meta.callbacks,
        //       subscribers: snapshot.store.subscribers,
        //       eventIds: snapshot.meta.eventIds
        //     };
        //   },
        //   subscribers: [],
        //   eventIds: []
        // },
        // meta: meta,
        // fetchSnapshot: () => Promise.resolve(snapshotData),
        // other properties if any
      };
    },

    configureSnapshotStore: (snapshotStore: SnapshotStore<BaseData, K>) => { },

    createSnapshotSuccess: () => { },

    createSnapshotFailure: async (
      snapshotManager: SnapshotManager<BaseData, K>,
      snapshot: Snapshot<BaseData>,
      error: Error
    ) => {
      // const snapshotManager = await useSnapshotManager();
      const snapshotStore: SnapshotStore<BaseData, K>[] =
        snapshotManager.state as SnapshotStore<BaseData, K>[];

      if (snapshotStore && snapshotStore.length > 0) {
        const generatedSnapshotId = generateSnapshotId; // Assuming generateSnapshotId returns a string

        const config = {} as SnapshotStoreConfig<BaseData, any>[]; // Placeholder for config
        const configOption = {} as SnapshotStoreConfig<BaseData, any>; // Placeholder for configOption

        // Example: Transforming snapshot.data (Map<string, BaseData>) to initialState (SnapshotStore<BaseData, K> | Snapshot<BaseData>)
        const initialState: SnapshotStore<BaseData, K> = {
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
            unsubscribe: (
              userId: string,
              snapshotId: string,
              unsubscribeType: string,
              unsubscribeDate: Date,
              unsubscribeReason: string,
              unsubscribeData: any
            ) => {
              unsubscribe(
                userId,
                snapshotId,
                unsubscribeType,
                unsubscribeDate,
                unsubscribeReason,
                unsubscribeData
              );
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
            determineCategory: determineFileCategory,
          },

          setSnapshotData(
            subscribers: Subscriber<BaseData, K>[],
            data: Partial<SnapshotStoreConfig<BaseData, any>>
          ) {
            const self = this as SnapshotStore<BaseData, any>;

            if (data) {
              if (data.id) {
                self.id = data.id as string; // Ensure data.id is of type string
              }
              if (data.timestamp) {
                self.timestamp = data.timestamp;
              }
              if (data.data) {
                self.data = { ...self.data, ...data.data };
              }
              // Notify subscribers or trigger updates if necessary
              self.notifySubscribers(subscribers, data);
            }
          },
          title: "defaultTitle", // Example placeholder
          type: "defaultType", // Example placeholder
          subscribeToSnapshots: () => { },
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
          dataStoreMethods: {} as DataStore<BaseData, any>,
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
          transformSubscriber: transformSubscriber,
          transformDelegate: transformDelegate,
          initializedState: undefined,
          getAllKeys: function (): Promise<string[]> {
            throw new Error("Function not implemented.");
          },
          getAllItems: function (): Promise<BaseData[]> {
            throw new Error("Function not implemented.");
          },
          addData: function (data: Snapshot<T, K>): void {
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
          ): Promise<SnapshotStore<BaseData, any>[]> {
            throw new Error("Function not implemented.");
          },
          snapshot: undefined,
          removeItem: function (key: string): Promise<void> {
            throw new Error("Function not implemented.");
          },
          getSnapshot: function (
            snapshot: () =>
              | Promise<{
                category: any;
                timestamp: any;
                id: any;
                snapshot: Snapshot<BaseData, any>;
                snapshotStore: SnapshotStore<BaseData, any>;
                data: BaseData;
              }>
              | undefined
          ): Promise<SnapshotStore<BaseData, any>> {
            throw new Error("Function not implemented.");
          },
          getSnapshotSuccess: this.getSnapshotSuccess,
          getSnapshotId: function (
            key: SnapshotData
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
          getDataStore: function (): Map<string, BaseData> {
            throw new Error("Function not implemented.");
          },
          addSnapshotSuccess: function (
            snapshot: BaseData,
            subscribers: Subscriber<BaseData, any>[]
          ): void {
            throw new Error("Function not implemented.");
          },
          compareSnapshotState: function (
            stateA:
              | Snapshot<BaseData, BaseData>
              | Snapshot<BaseData, BaseData>[]
              | null
              | undefined,
            stateB: Snapshot<BaseData, BaseData> | null | undefined
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
          getDelegate: function (): SnapshotStoreConfig<BaseData, BaseData>[] {
            throw new Error("Function not implemented.");
          },
          determineCategory: function (
            snapshot: Snapshot<BaseData, BaseData> | null | undefined
          ): string {
            throw new Error("Function not implemented.");
          },
          determinePrefix: function <T extends Data>(
            snapshot: T | null | undefined,
            category: string
          ): string {
            throw new Error("Function not implemented.");
          },
          updateSnapshot: function (
            snapshotId: string,
            data: Map<string, BaseData>,
            events: Record<string, CalendarEvent[]>,
            snapshotStore: any,
            dataItems: RealtimeDataItem[],
            newData: Snapshot<BaseData, BaseData>,
            payload: UpdateSnapshotPayload<BaseData>,
            store: any
          ): Promise<{ snapshot: SnapshotStore<BaseData, any> }> {
            throw new Error("Function not implemented.");
          },
          updateSnapshotSuccess: function (): void {
            throw new Error("Function not implemented.");
          },
          updateSnapshotFailure: function (payload: { error: string }): void {
            throw new Error("Function not implemented.");
          },
          removeSnapshot: function (snapshotToRemove: any): void {
            throw new Error("Function not implemented.");
          },
          clearSnapshots: function (): void {
            throw new Error("Function not implemented.");
          },
          addSnapshot: function (
            snapshot: Snapshot<BaseData, any>,
            subscribers: Subscriber<BaseData, any>[]
          ): Promise<void> {
            throw new Error("Function not implemented.");
          },
          createSnapshot: function (
            id: string,
            snapshotData: SnapshotStoreConfig<any, BaseData>,
            category: string
          ): Snapshot<Data, Data> {
            throw new Error("Function not implemented.");
          },
          createSnapshotSuccess: function (
            snapshot: Snapshot<Data, Data>
          ): void {
            throw new Error("Function not implemented.");
          },
          setSnapshotSuccess: function (
            snapshotData: any,
            subscribers: ((data: Snapshot<BaseData, BaseData>) => void)[]
          ): void {
            throw new Error("Function not implemented.");
          },
          setSnapshotFailure: function (error: Error): void {
            throw new Error("Function not implemented.");
          },
          createSnapshotFailure: function (
            snapshot: Snapshot<BaseData, BaseData>,
            error: Error
          ): void {
            throw new Error("Function not implemented.");
          },
          updateSnapshots: function (): void {
            throw new Error("Function not implemented.");
          },
          updateSnapshotsSuccess: function (
            snapshotData: (
              subscribers: Subscriber<BaseData, any>[],
              snapshot: Snapshots<BaseData>
            ) => void
          ): void {
            throw new Error("Function not implemented.");
          },
          updateSnapshotsFailure: function (error: Payload): void {
            throw new Error("Function not implemented.");
          },
          initSnapshot: function (
            snapshotConfig: SnapshotStoreConfig<BaseData, any>,
            snapshotData: SnapshotStore<BaseData, any>
          ): void {
            throw new Error("Function not implemented.");
          },
          takeSnapshot: function (
            snapshot: SnapshotStore<BaseData, any>,
            subscribers: any[]
          ): Promise<{ snapshot: SnapshotStore<BaseData, any> }> {
            throw new Error("Function not implemented.");
          },
          takeSnapshotSuccess: function (
            snapshot: SnapshotStore<BaseData, any>
          ): void {
            throw new Error("Function not implemented.");
          },
          takeSnapshotsSuccess: function (snapshots: BaseData[]): void {
            throw new Error("Function not implemented.");
          },
          configureSnapshotStore: function (
            snapshot: SnapshotStore<T, K>
          ): void {
            throw new Error("Function not implemented.");
          },
          getData: function <T extends Data>(
            data:
              | Snapshot<BaseData, K>
              | Snapshot<CustomSnapshotData, K>
          ): Promise<{
            data: (
              | Snapshot<CustomSnapshotData, K>
              | Snapshot<T, K>
            )[]; // Implement logic to convert subscriber data to SnapshotStore instance
            // Implement logic to convert subscriber data to SnapshotStore instance
            getDelegate: SnapshotStore<T, any>;
          }> {
            throw new Error("Function not implemented.");
          },
          flatMap: function (
            snapshot: Snapshot<BaseData, K>,
            subscribers: Subscriber<BaseData, any>[]
              | Subscriber<CustomSnapshotData, any>[]
          ): Promise<{
            snapshot: Snapshot<BaseData, BaseData>;
            subscribers: Subscriber<BaseData, any>[];
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
            snapshot: Snapshot<BaseData, BaseData>
          ): boolean {
            throw new Error("Function not implemented.");
          },
          handleSnapshot: function (
            snapshot: Snapshot<BaseData, BaseData> | null,
            snapshotId: string
          ): void {
            throw new Error("Function not implemented.");
          },
          handleActions: function (): void {
            throw new Error("Function not implemented.");
          },
          setSnapshot: function (snapshot: SnapshotStore<BaseData, any>): void {
            throw new Error("Function not implemented.");
          },
          transformSnapshotConfig: function <T extends BaseData>(
            config: SnapshotStoreConfig<BaseData, T>
          ): SnapshotStoreConfig<BaseData, T> {
            throw new Error("Function not implemented.");
          },
          setSnapshots: function (
            snapshots: SnapshotStore<BaseData, any>[]
          ): void {
            throw new Error("Function not implemented.");
          },
          clearSnapshot: function (): void {
            throw new Error("Function not implemented.");
          },
          mergeSnapshots: function (snapshots: BaseData[]): void {
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
          getSubscribers: function (
            subscribers: Subscriber<BaseData, any>[],
            snapshots: Snapshots<BaseData>
          ): Promise<{
            subscribers: Subscriber<BaseData, any>[];
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
            subscribers: Subscriber<BaseData, any>[],
            data: Partial<SnapshotStoreConfig<BaseData, any>>
          ): Subscriber<BaseData, any>[] {
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
            category: string | CategoryProperties | undefined,
            timestamp: Date,
            snapshot: Snapshot<BaseData, BaseData>,
            data: BaseData,
            delegate: SnapshotStoreConfig<BaseData, BaseData>[]
          ): Promise<{
            id: any;
            category: string | CategoryProperties | undefined;
            timestamp: any;
            snapshot: Snapshot<BaseData, BaseData>;
            data: BaseData;
            getItem?:
            | ((
              snapshot: Snapshot<BaseData, BaseData>
            ) => Snapshot<BaseData, BaseData> | undefined)
            | undefined;
          }> {
            throw new Error("Function not implemented.");
          },
          fetchSnapshotSuccess: function (
            snapshotData: (
              subscribers: Subscriber<BaseData, any>[],
              snapshot: Snapshot<BaseData, any>
            ) => void
          ): void {
            throw new Error("Function not implemented.");
          },
          fetchSnapshotFailure: function (payload: { error: Error }): void {
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
              subscribers: Subscriber<BaseData, any>[],
              snapshots: Snapshots<BaseData>
            ) => Promise<Snapshots<BaseData>>
          ): void {
            throw new Error("Function not implemented.");
          },
          generateId: function (): string {
            throw new Error("Function not implemented.");
          },
          batchFetchSnapshots: function (
            subscribers: Subscriber<BaseData, any>[],
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
            Snapshot<BaseData, BaseData>
          > {
            throw new Error("Function not implemented.");
          },
        }

        const updatedSnapshotData: Partial<
          SnapshotStoreConfig<BaseData, BaseData>
        > = {
          id: generatedSnapshotId.toString(),
          data: snapshot.data ?? undefined,
          timestamp: new Date(),
          snapshotId: generatedSnapshotId.toString(),
          category: "update" as any, // Adjust according to your actual category type
          // Ensure other required properties are included
        };

        const subscribers: Subscriber<BaseData, any>[] = [];

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

        const snapshotManager = await useSnapshotManager();
        // Update the snapshot store through a setter method if available
        await snapshotManager.setSnapshotManager(newState); // Ensure this method exists and correctly updates state
      }
    }, // Change 'any' to 'Error' if you handle specific error types

    batchTakeSnapshot: async (
      snapshotStore: SnapshotStore<BaseData, K>,
      snapshots: Snapshots<T>
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
      category: string | CategoryProperties | undefined,
      timestamp: Date,
      snapshot: Snapshot<T, K>,
      data: T,
      delegate: SnapshotStoreConfig<BaseData, any>[]
    ): Promise<{
      id: any;
      category: string | CategoryProperties | undefined;
      timestamp: any;
      snapshot: Snapshot<T, K>;
      data: T;
      delegate: SnapshotStoreConfig<BaseData, any>[];
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
      data: Map<string, BaseData>,
      events: Record<string, CalendarEvent[]>,
      snapshotStore: SnapshotStore<T, K>,
      dataItems: RealtimeDataItem[],
      newData: Snapshot<BaseData, any>,
      payload: UpdateSnapshotPayload<T>,
      store: SnapshotStore<any, any>
    ): Promise<{ snapshot: Snapshot<BaseData> }> => {
      // Example implementation logic (adjust as per your actual implementation)

      // Assuming you update some data in snapshotStore
      snapshotStore.addData(newData);

      // Convert snapshotStore to Snapshot<BaseData>
      const snapshotData: Snapshot<BaseData> = {
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

    getSnapshots: async (category: string, snapshots: Snapshots<T>) => {
      return { snapshots };
    },
    takeSnapshot: async (snapshot: SnapshotStore<BaseData, K>) => {
      return { snapshot: snapshot };
    },

    getAllSnapshots: async (
      data: (
        subscribers: Subscriber<BaseData, K>[],
        snapshots: Snapshots<T>
      ) => Promise<Snapshots<T>>
    ) => {
      // Implement your logic here
      const subscribers: Subscriber<BaseData, K>[] = []; // Example
      const snapshots: Snapshots<T> = []; // Example
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

    updateMainSnapshots: async <T extends BaseData>(
      snapshots: Snapshots<T>
    ): Promise<Snapshots<T>> => {
      try {
        const updatedSnapshots: Snapshots<T> = snapshots.map((snapshot) => ({
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
      subscribers: Subscriber<BaseData, K>[],
      snapshots: Snapshots<Data>
    ) => {
      return {
        subscribers: [],
        snapshots: [],
      };
    },

    batchUpdateSnapshots: async (
      subscribers: Subscriber<BaseData, K>[],
      snapshots: Snapshots<Data>
    ) => {
      // Perform batch update logic
      return [
        { snapshots: [] }, // Example empty array, adjust as per your logic
      ];
    },
    batchFetchSnapshotsRequest: async (snapshotData: {
      subscribers: Subscriber<BaseData, K>[];
      snapshots: Snapshots<Data>;
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

        const fetchedSnapshots: SnapshotList | Snapshots<Data> =
          await snapshotApi
            .getSortedList(target)
            .then((sortedList) => snapshotApi.fetchAllSnapshots(sortedList));

        let snapshots: Snapshots<CustomSnapshotData>;

        if (Array.isArray(fetchedSnapshots)) {
          snapshots = fetchedSnapshots.map((snapshot) => ({
            id: snapshot.id,
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
            initialState: new Map(),
            // Adjust this based on your actual data structure
          }));
        } else {
          snapshots = fetchedSnapshots
            .getSnapshots()
            .map((snapshot: SnapshotItem) => ({
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
      subscriber: Subscriber<T, K>,
      snapshots: Snapshots<T>
    ): Promise<{
      subscribers: Subscriber<T, K>[];
      snapshots: Snapshot<Data>[];
    }> => {
      try {
        const subscriberId = subscriber.id;
        const snapshotData = snapshots[Number(subscriberId)];

        if (!snapshotData) {
          throw new Error(
            `No snapshot data found for subscriber ID: ${subscriberId}`
          );
        }

        // Logic to update the snapshot for a specific subscriber
        const updatedSnapshot: Snapshot<Data> = {
          ...snapshotData,
          message: "Updated for subscriber",
        };

        // Find the index of the snapshot in the array
        const snapshotIndex = snapshots.findIndex(
          (snapshot: Snapshot<Data>) => snapshot.id === subscriberId
        );

        // Create a new array with the updated snapshot
        const updatedSnapshots: Snapshot<Data>[] = [...snapshots];
        updatedSnapshots[snapshotIndex] = updatedSnapshot;

        // Return the updated snapshot wrapped in the expected structure
        return {
          subscribers: [subscriber],
          snapshots: updatedSnapshots,
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
      subscribers: Subscriber<BaseData, K>[],
      data: Snapshot<Data>
    ) => {
      return subscribers;
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
    addSnapshot: function (snapshot: Snapshot<Data>) {
      if (
        "data" in snapshot &&
        "timestamp" in snapshot &&
        "category" in snapshot &&
        typeof snapshot.category === "string"
      ) {
        const snapshotWithValidTimestamp: SnapshotStore<BaseData, K> = {
          ...snapshot,
          timestamp: new Date(snapshot.timestamp as unknown as string),
          // Ensure all required properties of SnapshotStore<Snapshot<T, K>> are included
          id: snapshot.id!.toString(),
          snapshotId: snapshot.snapshotId!.toString(),
          taskIdToAssign: snapshot.taskIdToAssign,
          clearSnapshots: snapshot.clearSnapshots,
          key: snapshot.key!,
          topic: snapshot.topic!,
          initialState: snapshot.initialState as SnapshotStore<BaseData, any>
            | Snapshot<BaseData, any> | null | undefined,
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
      subscribers: Subscriber<BaseData, K>[],
      snapshots: Snapshots<Data>
    ): Promise<{
      subscribers: Subscriber<BaseData, K>[];
      snapshots: Snapshots<BaseData>[];
    }> => {
      const data = Object.entries(snapshots)
        .map(([category, categorySnapshots]) => {
          const subscribersForCategory = subscribers.filter(
            (subscriber) => subscriber.getData()?.category === category
          );
          if (Array.isArray(categorySnapshots)) {
            const snapshotsForCategory = categorySnapshots.map(
              (snapshot: Snapshot<Data>) => {
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
      snapshotConfig: SnapshotStoreConfig<BaseData, T>[],
      delegate: SnapshotStoreSubset<BaseData>,
      sendNotification: (type: NotificationTypeEnum) => void
    ): void { },

    validateSnapshot: function (snapshot: Snapshot<Data>): boolean {
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
      snapshotId: string,
      snapshotConfig: SnapshotStoreConfig<BaseData, any>[] // Adjust the type for Data as per your needs
    ): Promise<SnapshotStore<BaseData, K> | undefined> {
      try {
        const config = snapshotConfig.find(
          (config) => config.snapshotId === snapshotId
        );

        if (!config) {
          throw new Error("Snapshot configuration not found");
        }

        // Here, assuming `config` is of type `SnapshotStoreConfig<BaseData, Data>`
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
          timestamp: new Date(), // Example, adjust as per your logic

          // Ensure to include other necessary properties
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
      subscribers: Subscriber<BaseData, K>[],
      snapshots: Snapshots<T>
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
    [Symbol.iterator]: function* () { },
    [Symbol.asyncIterator]: async function* () { },
    [Symbol.toStringTag]: "SnapshotStore",
  },
];

const createSnapshotExample = async (
  id: string,
  snapshotData: SnapshotStoreConfig<any, Data>,
  category: string
): Promise<{ snapshot: Snapshot<Data, Data> }> => {
  const currentConfig = snapshotConfig.find(
    (config) => (config.snapshotId as string) === id
  );

  return new Promise<{ snapshot: Snapshot<Data, Data> }>(
    (resolve, reject) => {
      if (currentConfig && typeof currentConfig.createSnapshot === "function") {
        // Ensure currentConfig.createSnapshot is called with correct arguments
        currentConfig.createSnapshot(
          id,
          snapshotData,
          category,
          (snapshot: Snapshot<Data>) => {
            // Check if snapshot returned is valid
            if (snapshot instanceof SnapshotStore) {
              resolve({ snapshot });
            } else {
              reject(new Error("Invalid snapshot returned."));
            }
          }
        );
      } else {
        reject(
          new Error(
            "Snapshot configuration not found or createSnapshot method not callable."
          )
        );
      }
    }
  );
};

// Function to get the project ID from an environment variable or use a default value
function getProjectId() {
  return process.env.PROJECT_ID || "defaultProject";
}

const projectId = getProjectId();

export default defineConfig({
  data: snapshotConfig,
  payload: {
    projectId,
    userId: "1234567890",
  },
} as UserConfigExport);
// Example usage
const johnSubscriber = new Subscriber<CustomSnapshotData>(
  payload.meta.id,
  // Assuming payload.name is a string, replace with your actual data structure
  payload.meta.name,

  {
    subscriberId: "1",
    subscriberType: SubscriberTypeEnum.STANDARD,
    subscriptionType: SubscriptionTypeEnum.PortfolioUpdates,
    getPlanName: () => SubscriberTypeEnum.STANDARD,
    portfolioUpdates: () => { },
    tradeExecutions: () => { },
    marketUpdates: () => { },
    communityEngagement: () => { },
    unsubscribe: () => { },
    portfolioUpdatesLastUpdated: {} as ModifiedDate,
    getId: () => "1",
    triggerIncentives: () => { },
    determineCategory: (data: any) => data.category,
  },
  "subscriberId",
  notifyEventSystem,
  updateProjectState,
  logActivity,
  triggerIncentives,
  payload.meta.optionalData,
  payload.meta.data
);

// Example of asynchronous function using async/await
const updateSubscribersAndSnapshots = async (
  subscribers: Subscriber<BaseData, K>[],
  snapshots: Snapshots<Data>
): Promise<{
  subscribers: Subscriber<BaseData, K>[];
  snapshots: Snapshots<BaseData>;
}> => {
  // Generate a subscription ID using a utility function
  const generateSubscriptionId = UniqueIDGenerator.generateID(
    "snap",
    "subscription",
    NotificationTypeEnum.Snapshot
  );

  try {
    // Update each subscriber asynchronously
    const subscribersArray: Subscriber<BaseData, K>[] = subscribers;

    const updatedSubscribers = await Promise.all(
      subscribersArray.map(async (subscriber: Subscriber<BaseData, K>) => {
        // Ensure snapshots is an array and get the data from the method if necessary
        const snapshotsArray = await subscriber.snapshots(); // Call the function if it's a method

        // Function to get snapshots based on category and filter them
        const filterSnapshotsByCategory = (
          snapshots: SnapshotStoreConfig<BaseData, Data>[],
          targetCategory: string
        ): SnapshotStoreConfig<BaseData, Data>[] => {
          return snapshots.filter(snapshot => {
            const category = determineCategory(snapshot);
            return category === targetCategory;
          });
        };

        // Use the function to update and filter snapshots
        const updatedSnapshots = Object.fromEntries(
          Object.entries(snapshots).map(([category, _]) => [
            category,
            filterSnapshotsByCategory(
              snapshotsArray,
              category
            ).map(snapshot => ({
              ...snapshot,
              data: snapshot.content, // Example of mapping data to content property
            }))
          ])
        );


        // // Return the updated subscriber with the updated snapshots

        // Create a new Subscriber object with updated data
        const subscriberObj: Subscriber<BaseData, K> = {
          ...subscriber,
          // Assign properties or methods as needed
          data: {
            ...subscriber.data,
            snapshots: updatedSnapshots,
          },
          // Example of defining methods or properties
          subscription: {
            subscriberId: subscriber.getSubscriberId() ??
              SubscriberTypeEnum.PortfolioUpdates,
            subscriberType: subscriber.getSubscriberType!() ??
              SubscriberTypeEnum.PortfolioUpdates,
            subscriptionId: generateSubscriptionId,
            subscriptionType: SubscriptionTypeEnum.CommunityEngagement,
            // Example methods
            portfolioUpdates: () => subscriber,
            tradeExecutions: () => getTradeExecutions(),
            marketUpdates: () => getMarketUpdates(),
            communityEngagement: () => getCommunityEngagement(),
            triggerIncentives: () => triggerIncentives({
              userId: subscriber.getSubscriberId(),
              incentiveType: SubscriberTypeEnum.PortfolioUpdates,
              params: useParams(),
            }),
            determineCategory: () => subscriber.getDetermineCategory(data),
            unsubscribe: () => {
              /* Unsubscribe logic */
            },
            portfolioUpdatesLastUpdated: {} as ModifiedDate,
          },
          // Example methods
          toSnapshotStore: (
            initialState: Snapshot<BaseData>,
            snapshotConfig: SnapshotStoreConfig<BaseData, Data>[]
          ): SnapshotStore<BaseData, K>[] | undefined => {
            // Implement logic to convert subscriber data to SnapshotStore instance
            return undefined; // Replace with actual implementation
          },
          processNotification: async (
            id: string,
            message: string,
            snapshotContent: Map<string, BaseData>,
            date: Date,
            type: NotificationType
          ): Promise<void> => {
            // Process notification logic
          },
          // Example methods
          getState: () => null,
          onError: () => {
            /* Error handling logic */
          },
          getId: function (): void {
            throw new Error("Function not implemented.");
          },
          _id: undefined,
          name: "",
          subscriberId: "",
          subscribers: [],
          onSnapshotCallbacks: [],
          onErrorCallbacks: [],
          onUnsubscribeCallbacks: [],
          notifyEventSystem: undefined,
          updateProjectState: undefined,
          logActivity: undefined,
          triggerIncentives: undefined,
          optionalData: null,
          email: "",
          snapshotIds: [],
          payload: undefined,
          fetchSnapshotIds: function (): Promise<string[]> {
            throw new Error("Function not implemented.");
          },
          id: undefined,
          getEmail: function (): string {
            throw new Error("Function not implemented.");
          },
          subscribe: function (
            callback: (data: Snapshot<BaseData, BaseData>) => void
          ): void {
            throw new Error("Function not implemented.");
          },
          unsubscribe: function (
            callback: (data: Snapshot<BaseData, BaseData>) => void
          ): void {
            throw new Error("Function not implemented.");
          },
          getOptionalData: function (): CustomSnapshotData | null {
            throw new Error("Function not implemented.");
          },
          getFetchSnapshotIds: function (): Promise<string[]> {
            throw new Error("Function not implemented.");
          },
          getSnapshotIds: function (): string[] {
            throw new Error("Function not implemented.");
          },
          getData: function (): Partial<SnapshotStore<BaseData, any>> | null {
            throw new Error("Function not implemented.");
          },
          getNotifyEventSystem: function (): Function | undefined {
            throw new Error("Function not implemented.");
          },
          getUpdateProjectState: function (): Function | undefined {
            throw new Error("Function not implemented.");
          },
          getLogActivity: function (): Function | undefined {
            throw new Error("Function not implemented.");
          },
          getTriggerIncentives: function (): Function | undefined {
            throw new Error("Function not implemented.");
          },
          initialData: function (data: Snapshot<BaseData, BaseData>): void {
            throw new Error("Function not implemented.");
          },
          getName: function (): string {
            throw new Error("Function not implemented.");
          },
          getDetermineCategory: function (
            data: Snapshot<BaseData, BaseData>
          ): Snapshot<BaseData, BaseData> {
            throw new Error("Function not implemented.");
          },
          snapshots: function (): Promise<string> {
            throw new Error("Function not implemented.");
          },
          determineCategory: function (
            initialState: Snapshot<BaseData, BaseData>
          ): string {
            throw new Error("Function not implemented.");
          },
          getDeterminedCategory: function (
            data: Snapshot<BaseData, BaseData>
          ): Snapshot<BaseData, BaseData> {
            throw new Error("Function not implemented.");
          },
          receiveSnapshot: function (snapshot: BaseData): void {
            throw new Error("Function not implemented.");
          },
          getSubscriberId: function (): string {
            throw new Error("Function not implemented.");
          },
          getSubscription: function (): Subscription<BaseData> {
            throw new Error("Function not implemented.");
          },
          onUnsubscribe: function (
            callback: (
              callback: (data: Snapshot<BaseData, BaseData>) => void
            ) => void
          ): void {
            throw new Error("Function not implemented.");
          },
          onSnapshot: function (
            callback: (
              snapshot: Snapshot<BaseData, BaseData>
            ) => void | Promise<void>
          ): void {
            throw new Error("Function not implemented.");
          },
          onSnapshotError: function (callback: (error: Error) => void): void {
            throw new Error("Function not implemented.");
          },
          onSnapshotUnsubscribe: function (
            callback: (
              callback: (data: Snapshot<BaseData, BaseData>) => void
            ) => void
          ): void {
            throw new Error("Function not implemented.");
          },
          triggerOnSnapshot: function (
            snapshot: Snapshot<BaseData, BaseData>
          ): void {
            throw new Error("Function not implemented.");
          },
          handleCallback: function (data: Snapshot<BaseData, BaseData>): void {
            throw new Error("Function not implemented.");
          },
          snapshotCallback: function (data: Snapshot<BaseData, BaseData>): void {
            throw new Error("Function not implemented.");
          }
        };

        return subscriberObj; // Return updated subscriber object
      })
    );




    // Return updated subscribers and snapshots
    return {
      subscribers: updatedSubscribers,
      snapshots: updatedSnapshots,
    };
  } catch (error) {
    console.error("Error occurred:", error); // Handle or log errors as needed
    throw error; // Re-throw error to propagate or handle higher up
  }
};

// Accessing subscriberId and subscriptionId
console.log("Subscriber ID:", johnSubscriber.getSubscriberId());
console.log("Subscription ID:", johnSubscriber.getSubscriberId());

// Call the example
createSnapshotExample("snapshot1", snapshotConfig[0], "category1").then(
  (result) => {
    console.log("Snapshot creation result:", result);
  }
);

export { snapshotConfig };
export type { AuditRecord, RetentionPolicy, Subscribers, ConfigureSnapshotStorePayload };

