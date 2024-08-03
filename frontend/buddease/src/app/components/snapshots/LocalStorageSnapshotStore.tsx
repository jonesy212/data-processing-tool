// LocalStorageSnapshotStore.tsx

import { endpoints } from "@/app/api/ApiEndpoints";
import { fetchSnapshotById } from "@/app/api/SnapshotApi";
import { getSubscriberId } from "@/app/api/subscriberApi";
import { CategoryProperties } from "@/app/pages/personas/ScenarioBuilder";
import { FC } from "react";
import { Order } from "../crypto/Orders";
import { ModifiedDate } from "../documents/DocType";
import {
  CombinedEvents,
  SnapshotManager,
  SnapshotStoreOptions
} from "../hooks/useSnapshotManager";
import { Content } from "../models/content/AddContent";
import { BaseData, Data } from "../models/data/Data";
import {
  PriorityTypeEnum,
  ProjectPhaseTypeEnum,
  SubscriberTypeEnum,
  SubscriptionTypeEnum,
} from "../models/data/StatusType";
import { displayToast } from "../models/display/ShowToast";
import { Task, TaskData } from "../models/tasks/Task";
import { Tag } from "../models/tracker/Tag";
import { Phase } from "../phases/Phase";
import { DataStoreWithSnapshotMethods } from "../projects/DataAnalysisPhase/DataProcessing/ DataStoreMethods";
import {
  DataStore,
  useDataStore,
} from "../projects/DataAnalysisPhase/DataProcessing/DataStore";
import axiosInstance from "../security/csrfToken";
import { AllStatus } from "../state/stores/DetailsListStore";
import { Subscription } from "../subscriptions/Subscription";
import { NotificationTypeEnum } from "../support/NotificationContext";
import {
  getCommunityEngagement,
  getMarketUpdates,
  getTradeExecutions,
} from "../trading/TradingUtils";
import { Subscriber } from "../users/Subscriber";
import {
  logActivity,
  notifyEventSystem,
  portfolioUpdates,
  triggerIncentives,
  unsubscribe,
  updateProjectState,
} from "../utils/applicationUtils";
import { addToSnapshotList, generateSnapshotId } from "../utils/snapshotUtils";
import { DataWithPriority, DataWithVersion } from "../utils/versionUtils";
import {
  AuditRecord,
  ConfigureSnapshotStorePayload,
  K,
  SnapshotStoreConfig,
  T,
  snapshotConfig,
} from "./SnapshotConfig";
import { SnapshotItem } from "./SnapshotList";
import { SnapshotStoreMethod } from "./SnapshotStorMethods";
import SnapshotStore, {
  defaultCategory,
  handleSnapshotOperation,
  handleSnapshotStoreOperation,
  snapshotStoreConfig
} from "./SnapshotStore";
import { createSnapshotSuccess, onSnapshot, onSnapshots } from "./snapshotHandlers";
import {
  Callback,
  subscribeToSnapshotImpl,
  subscribeToSnapshotsImpl,
} from "./subscribeToSnapshotsImplementation";
import { RealtimeDataItem } from "/Users/dixiejones/data_analysis/frontend/buddease/src/app/components/models/realtime/RealtimeData";
import { CalendarEvent } from "/Users/dixiejones/data_analysis/frontend/buddease/src/app/components/state/stores/CalendarEvent";
import { SnapshotWithCriteria } from "./SnapshotWithCriteria";
import { SnapshotConfig } from "./snapshot";

interface Payload {
  error: string;
  meta: {
    name: string;
    timestamp: Date;
    type: NotificationTypeEnum;
    startDate: Date;
    endDate: Date;
    status: AllStatus;
    // title: string;
    // message: string;
    id: string;
    // position: NotificationPosition;
    // duration: number;
    isSticky: boolean;
    isDismissable: boolean;
    isClickable: boolean;
    isClosable: boolean;
    isAutoDismiss: boolean;
    isAutoDismissable: boolean;
    isAutoDismissOnNavigation: boolean;
    isAutoDismissOnAction: boolean;
    isAutoDismissOnTimeout: boolean;
    isAutoDismissOnTap: boolean;
    optionalData: any;
    data: any;
  };
}


interface CreateSnapshotsPayload<T extends Data, K extends Data> {
  data: Map<string, Snapshot<T, K>>;
  events: Record<string, CalendarEvent[]>;
  dataItems: RealtimeDataItem[];
  newData: Snapshot<T, K>;
  category?: string | CategoryProperties;
}


interface CreateSnapshotStoresPayload<T extends BaseData, K extends BaseData> {
  snapshotId: string;
  title: string;
  description: string;
  createdAt: Date | undefined;
  updatedAt: Date | undefined;
  status: "active" | "inactive" | "archived";
  category: string;
  data: T | Map<string, Snapshot<T, K>> | null | undefined;
  events: Record<string, CalendarEvent[]>;
  dataItems: T[];
  newData: T;
  metadata: any;
  id: string; // Adding id
  key: string; // Adding key
  topic: string; // Adding topic
  date: Date; // Adding date
  message: string; // Adding message
  timestamp: number; // Adding timestamp
  createdBy: string; // Adding createdBy
  eventRecords: Record<string, any>; // Adding eventRecords
  type: string; // Adding type
  subscribers: Subscriber<T, K>[]; // Adding subscribers
  snapshots: Map<string, Snapshot<T, K>>; // Adding snapshots
}


interface UpdateSnapshotPayload<T> {
  snapshotId: string;
  title: string;
  description: string;
  newData: T;
  createdAt: Date | undefined;
  updatedAt: Date | undefined;
  status: "active" | "inactive" | "archived";
  category: string;
}

const SNAPSHOT_URL = endpoints.snapshots;
type Snapshots<T extends BaseData> = Array<Snapshot<T, any>>;
const SNAPSHOT_STORE_CONFIG = snapshotConfig;

interface CustomSnapshotData extends Data {
  timestamp: string | number | Date | undefined
  value?: string | number | undefined;
  orders?: Order[];
}

  interface CoreSnapshot<T extends Data, K extends Data> {
    id?: string | number;
    data: T | Map<string, Snapshot<T, K>> | null | undefined;
    name?: string;
    timestamp: string | number | Date | undefined;
    orders?: any;
    createdBy?: string;
    subscriberId?: string;
    length?: number;
    category?: string | CategoryProperties | undefined;
    date?: string | number | string | number | Date;
    status?: string;
    content?: string | Content<T> | undefined;
    message?: string;
    type?: string | null | undefined;
    phases?: ProjectPhaseTypeEnum;
    phase?: Phase | null;
    ownerId?: string;
    store?: SnapshotStore<T, K> | null;
    state?: Snapshot<T, K>[] | null; // Ensure state matches Snapshot<T> or null/undefined
    dataStore?: DataStore<T, K>;
    snapshotId?: string | number;
    configOption?: string | SnapshotStoreConfig<T, K> | null;
    snapshotItems?: Snapshot<T, K>[];
    snapshots?: Snapshots<T>;
    initialState?: SnapshotStore<T, K> | Snapshot<T, K> | null | undefined;
    nestedStores?: SnapshotStore<T, K>[];
    events: Record<string, CalendarEvent[]> | undefined;
    setSnapshotData?: (data: Data) => void;
    event?: Event;
    snapshotConfig?: SnapshotStoreConfig<T, K>[];
  set?: (
    data: T | Map<string, Snapshot<T, K>>,
    type: string,
    event: Event
  ) => void;
  setStore?: (
    data: T | Map<string, SnapshotStore<T, K>>,
    type: string,
    event: Event
  ) => void | null;
  handleSnapshot: (
    snapshotId: string,
    snapshot: Snapshot<T, K> | null,
    snapshots: Snapshots<T>,
    type: string,
    event: Event,
  ) => void  | null;

  subscribeToSnapshots?: (
    snapshotId: string,
    callback: (snapshots: Snapshots<T>) => void
  ) => void;
  getItem?: (key: T) => T | undefined;
  meta: Map<string, Snapshot<T, K>> | undefined;
}

interface SnapshotData<T extends Data, K extends Data = T> {
  _id?: string;
  snapshotIds?: string[];
  title?: string;
  description?: string | null;
  tags?: Tag[] | string[];
  key?: string;
  topic?: string;
  priority?: string | PriorityTypeEnum;
  subscription?: Subscription<T, K> | null;
  config?: SnapshotStoreConfig<T, K>[] | null;
  metadata?: any;
  isExpired?: boolean;
  isCompressed?: boolean;
  isEncrypted?: boolean;
  isSigned?: boolean;
  expirationDate?: Date | string;
  auditTrail?: AuditRecord[];
  subscribers?: Subscriber<T, K>[];
  delegate?: SnapshotStoreConfig<T, K>[];
  value?: number | string | undefined;
  todoSnapshotId?: string;
  dataStoreMethods?: DataStore<T, K> | null;
  createdAt?: Date;
  updatedAt?: Date;
  then?: <T extends Data, K extends Data>(
    callback: (newData: Snapshot<BaseData, K>) => void
  ) => Snapshot<Data, T> | undefined;
}

interface Snapshot<T extends Data, K extends Data = T>
  extends CoreSnapshot<T, K>,
    SnapshotData<T, K> {
  getSnapshotId(key: string | SnapshotData<T, K>): unknown;
  compareSnapshotState(arg0: Snapshot<T, K> | null, state: any): unknown;
  eventRecords: Record<string, CalendarEvent[]> | null;
  snapshotStore: SnapshotStore<T, K> | null;
  getParentId: () => string | null,
  getChildIds: () => void,
  addChild: (snapshot: Snapshot<T, K>) => void,
  removeChild: (snapshot: Snapshot<T, K>) => void,
  getChildren: () => void,
  hasChildren: () => boolean,
  isDescendantOf: (snapshot: Snapshot<T, K>) => boolean,
  dataItems: RealtimeDataItem[] | null;
  newData: Snapshot<T, K> | undefined;
  data: T | Map<string, Snapshot<T, K>> | null | undefined;
  store?: SnapshotStore<T, K> | null;
  snapshots?: Snapshots<T>
  stores: SnapshotStore<T, K>[] | null;
  
  getStore: (
   
    storeId: string,
    snapshotId: string,
    snapshot: Snapshot<T, K>,
    type: string,
    event: Event
  ) => SnapshotStore<T, K> | null;
  
  addStore: (
    storeId: string,
    snapshotStore: SnapshotStore<T, K>,
    snapshotId: string,
    snapshot: Snapshot<T, K>,
    type: string,
    event: Event
  ) => void;


  mapSnapshot: (
    snapshotId: string,
    snapshot: Snapshot<T, K>,
    type: string,
    event: Event
  ) => void
  
  removeStore: (
    storeId: string,
    store: SnapshotStore<T, K>,
    snapshotId: string,
    snapshot: Snapshot<T, K>,
    type: string,
    event: Event
  ) => void;
  
  subscribe?: (
    arg0: Subscriber<T, K> | null,
    arg1: T,
    arg2: Event,
    callback: Callback<Snapshot<T, K>> ,
    value: T,
  ) => void;

  unsubscribe: (callback: Callback<Snapshot<T, K>>) => void;

  fetchSnapshotFailure?: (
    snapshotManager: SnapshotManager<Data, any>,
    snapshot: Snapshot<BaseData, BaseData>,
    payload: { error: Error }
  ) => void;

 fetchSnapshot: (
   callback: (
      snapshotId: string,
      snapshot: Snapshot<T, K> | undefined) => void
    ) => void;
  

  addSnapshotFailure: (
    snapshotManager: SnapshotManager<T, K>,
    snapshot: Snapshot<T, K>,
    payload: { error: Error }
  ) => void

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

  fetchSnapshotSuccess?: (
    snapshotManager: SnapshotManager<T, K>,
    snapshot: Snapshot<T, K>) => void;
 
  updateSnapshotFailure?: (
    snapshotManager: SnapshotManager<T, K>,
    snapshot: Snapshot<T, K>,
    payload: { error: Error; }
  ) => void;
  
  updateSnapshotSuccess: (
    snapshotId: string,
    snapshotManager: SnapshotManager<T, K>,
    snapshot: Snapshot<T, K>,
    payload: { error: Error; }
  ) => void | null;

  createSnapshotFailure: (
    snapshotId: string,
    snapshotManager: SnapshotManager<T, K>,
    snapshot: Snapshot<T, K>,
    payload: { error: Error; }
  ) => Promise<void>,

  createSnapshotSuccess: (
    snapshotId: string,
    snapshotManager: SnapshotManager<T, K>,
    snapshot: Snapshot<T, K>,
    payload: { error: Error; }
  ) => void | null;
  
  createSnapshots(
    id: string,
    snapshotId: string,
    snapshot: Snapshot<T, K>,
    snapshotManager: SnapshotManager<T, K>,
    payload: CreateSnapshotsPayload<T, K>,
    callback: (snapshots: Snapshot<T, K>[]) => void | null,
    snapshotDataConfig?: SnapshotConfig<T, K>[],
    category?: string | CategoryProperties
  ): Snapshot<T, K>[] | null;
  
  onSnapshot(
    snapshotId: string,
    snapshot: Snapshot<T, K>,
    type: string,
    event: Event,
    callback: (snapshot: Snapshot<T, K>) => void
  ): void;

  onSnapshots(
    snapshotId: string,
    snapshots: Snapshots<T>,
    type: string,
    event: Event,
    callback: (snapshots: Snapshots<T>) => void
  ): void;
  
  updateSnapshot?: (
    snapshotId: string,
    data: Map<string, Snapshot<T, K>>,
    events: Record<string, CalendarEvent[]>,
    snapshotStore: SnapshotStore<T, K>,
    dataItems: RealtimeDataItem[],
    newData: Snapshot<T, K>,
    payload: UpdateSnapshotPayload<T>,
    store: SnapshotStore<any, K>
  ) => void;
  updateSnapshotItem?: (snapshotItem: SnapshotItem) => void;
}

function createOptions<T extends Data, K extends Data>(params: {
  initialState: SnapshotStore<T, K> | null;
  date: string | Date;
  snapshotId: string;
  category: CategoryProperties;
  dataStoreMethods: Partial<DataStoreWithSnapshotMethods<T, K>>;
  snapshotMethods?: SnapshotStoreMethod<T, K>[]; // Make this optional
  type?: string; // Optional, adjust as needed
  snapshotConfig?: any; // Optional, adjust as needed
  subscribeToSnapshots?: (
    snapshotId: string,
    callback: (snapshots: Snapshots<T>) => Subscriber<T, K> | null,
    snapshot: Snapshot<T, K>
  ) => void;
  subscribeToSnapshot?: (
    snapshotId: string,
    callback: Callback<Snapshot<T, K>>,
    snapshot: Snapshot<T, K>
  ) => void;
  delegate?: () => Promise<SnapshotStoreConfig<T, K>[]>
  eventRecords: Record<string, CalendarEvent[]>;
  useSimulatedDataSource: boolean;
  simulatedDataSource: SnapshotStoreConfig<T, K>[];
  snapshotStoreConfig: SnapshotStoreConfig<T, K>[];
  getDelegate: (
    snapshotStoreConfig: SnapshotStoreConfig<T, K>[] | undefined
  ) => SnapshotStoreConfig<T, K>[];
  getDataStoreMethods: (
    snapshotStoreConfig: SnapshotStoreConfig<T, K>[],
    dataStoreMethods: Partial<DataStoreWithSnapshotMethods<T, K>>
  ) => Partial<DataStoreWithSnapshotMethods<T, K>>;
}): Promise<SnapshotStoreOptions<T, K>> {
  return new Promise<SnapshotStoreOptions<T, K>>((resolve, reject) => {
    const {
      initialState,
      date,
      snapshotId,
      category,
      dataStoreMethods,
      snapshotMethods,
      type,
      snapshotConfig,
      subscribeToSnapshots,
      subscribeToSnapshot,
      delegate,
      eventRecords,
      useSimulatedDataSource,
      simulatedDataSource,
      snapshotStoreConfig,
      getDelegate,
      getDataStoreMethods,
    } = params;

    const {
      isAutoDismiss,
      isAutoDismissable,
      isAutoDismissOnNavigation,
      isAutoDismissOnAction,
      isAutoDismissOnTimeout,
      isAutoDismissOnTap,
      isClickable,
      isClosable,
      optionalData,
      data,
    } = snapshotConfig || {};

    const options: SnapshotStoreOptions<T, K> = {
      initialState,
      date,
      snapshotId,
      category,
      data,
      dataStoreMethods: dataStoreMethods || {}, // Ensure non-null value
      snapshotMethods,
      type,
      snapshotConfig,
      subscribeToSnapshots,
      subscribeToSnapshot,
      delegate: delegate, // Ensure non-null value
      useSimulatedDataSource,
      simulatedDataSource,
      isAutoDismiss,
      isAutoDismissable,
      isAutoDismissOnNavigation,
      isAutoDismissOnAction,
      isAutoDismissOnTimeout,
      isAutoDismissOnTap,
      isClickable,
      isClosable,
      optionalData,
      snapshotStoreConfig,
      getDelegate,
      getDataStoreMethods,
      handleSnapshotOperation,
      handleSnapshotStoreOperation,
      displayToast,
      addToSnapshotList,
      eventRecords,
    };

    // Ensure default implementations for dataStoreMethods
    const defaultDataStoreMethods: DataStore<T, K> = {
      data: new Map<string, Snapshot<T, K>>(),
      addData: async (
        data: Snapshot<T, K>,
        options?: {
          title?: string;
          description?: string;
          status?: "pending" | "inProgress" | "completed";
        }
      ) => {
        const newSnapshot: Snapshot<T, K> = {
          ...data,
          id: Math.floor(Math.random() * 100000000000000000).toString(),
          title: options?.title || "",
          description: options?.description || "",
          status: options?.status || "pending",
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        // Store newSnapshot in dataStore
        defaultDataStoreMethods.data?.set(newSnapshot.id, newSnapshot);
      },
      getData: async (id: number) => {
        // Default implementation
        return defaultDataStoreMethods.data?.get(id.toString());
      },
      getStoreData: async (id: number) => {
        // Default implementation
        return defaultDataStoreMethods.dataStore?.get(id.toString());
      },
      removeData: async (id: number) => {
        // Default implementation
        defaultDataStoreMethods.data?.delete(id.toString());
      },

      updateData: (id: number, data: Snapshot<T, K>) => {
        const snapshot = defaultDataStoreMethods.data?.get(id.toString());
        if (!snapshot) {
          throw new Error("Snapshot not found");
        }
        const updatedSnapshot: Snapshot<T, K> = {
          ...snapshot,
          ...data,
          updatedAt: new Date(),
        };
        defaultDataStoreMethods.data?.set(id.toString(), updatedSnapshot);
        return updatedSnapshot;
      },

      updateStoreData: (id: number, data: SnapshotStore<T, K>) => {
        const snapshot = defaultDataStoreMethods.dataStore?.get(id.toString());
        if (!snapshot) {
          throw new Error("Snapshot not found");
        }
        const updatedSnapshotStore: SnapshotStore<T, K> = {
          ...snapshot,
          ...data,
          updatedAt: new Date(), // Assuming this field exists in SnapshotStore<T, K>
        };
        defaultDataStoreMethods.dataStore?.set(
          id.toString(),
          updatedSnapshotStore
        );
        return updatedSnapshotStore;
      },

      updateDataStatus: async (
        id: number,
        status: "pending" | "inProgress" | "completed"
      ) => {
        const snapshot = defaultDataStoreMethods.data?.get(id.toString());
        if (snapshot) {
          const updatedSnapshot: Snapshot<T, K> = {
            ...snapshot,
            status,
          };
          defaultDataStoreMethods.data?.set(id.toString(), updatedSnapshot);
        }
      },
      addDataStatus: async (
        id: number,
        status: "pending" | "inProgress" | "completed"
      ) => {
        const snapshot = defaultDataStoreMethods.data?.get(id.toString());
        if (snapshot) {
          const updatedSnapshot: Snapshot<T, K> = {
            ...snapshot,
            status,
          };
          defaultDataStoreMethods.data?.set(id.toString(), updatedSnapshot);
        }
      },
      updateDataTitle: async (id: number, title: string) => {
        const snapshot = defaultDataStoreMethods.data?.get(id.toString());
        if (snapshot) {
          const updatedSnapshot: Snapshot<T, K> = {
            ...snapshot,
            title,
          };
          defaultDataStoreMethods.data?.set(id.toString(), updatedSnapshot);
        }
      },
      updateDataDescription: async (id: number, description: string) => {
        const snapshot = defaultDataStoreMethods.data?.get(id.toString());
        if (snapshot) {
          const updatedSnapshot: Snapshot<T, K> = {
            ...snapshot,
            description,
          };
          defaultDataStoreMethods.data?.set(id.toString(), updatedSnapshot);
        }
      },

      getItem: async (key: string) => undefined,
      setItem: async (id: string, item: Snapshot<T, K>) => {
        defaultDataStoreMethods.data?.set(id, item);
      },
      removeItem: async (key: string) => {
        defaultDataStoreMethods.data?.delete(key);
      },
      getAllKeys: async () =>
        Array.from(defaultDataStoreMethods.data?.keys() || []),
      getAllItems: async () =>
        Array.from(defaultDataStoreMethods.data?.values() || []),
      getDataVersions: async (id: number) => undefined,
      updateDataVersions: async (id: number, versions: Snapshot<T, K>[]) => {},
      getBackendVersion: async () => "0.0.0",
      getFrontendVersion: async () => "0.0.0",
      addDataSuccess: async (payload: { data: Snapshot<T, K>[] }) => {},
      getDelegate: async (context: {
        useSimulatedDataSource: boolean;
        simulatedDataSource: SnapshotStoreConfig<T, K>[]
      }) => {
        if (context.useSimulatedDataSource) {
          return context.simulatedDataSource;
        }
        try {
          const API_URL = endpoints.delegates.fetch;
          if (typeof API_URL !== "string") {
            throw new Error("Invalid API URL");
          }
          const response = await axiosInstance.get<SnapshotStoreConfig<T, K>[]>(
            API_URL
          );
          if (response.status === 200) {
            return response.data as SnapshotStoreConfig<T, K>[];
          } else {
            throw new Error(
              `Failed to fetch delegates: ${response.statusText}`
            );
          }
        } catch (error) {
          console.error("Error fetching delegates from API:", error);
          throw error;
        }
      },
      updateDelegate: async (delegate: SnapshotStoreConfig<T, K>[]) => {
        try {
          const updatedDelegates = await Promise.all(
            delegate.map(async (item) => {
              await new Promise<void>((res) => setTimeout(res, 100));
              return { ...item, updatedAt: new Date() };
            })
          );
          return updatedDelegates;
        } catch (error) {
          console.error("Error updating delegates:", error);
          throw error;
        }
      },

      getSnapshot: async (category: any, timestamp: any, id: number) => {
        return new Promise(async (resolve, reject) => {
          console.log("Fetching snapshot for ID:", id);
          try {
            return await new Promise<Snapshot<T, K> | undefined>((resolve) => {
              setTimeout(() => resolve(undefined), 1000);
              const API_URL = endpoints.snapshots.fetch;
              if (typeof API_URL !== "string") {
                throw new Error("Invalid API URL");
              }
            });
          } catch (error) {
            console.error("Error fetching snapshot:", error);
            throw error;
          }
        });
      },

      getSnapshotContainer: async (
        category: any,
        timestamp: any,
        id: number
      ) => {
        return new Promise(async (resolve, reject) => {
          console.log("Fetching snapshot container for ID:", id);
          try {
            return await new Promise<SnapshotStore<T, K> | undefined>(
              (resolve) => {
                setTimeout(() => resolve(undefined), 1000);
                const API_URL = endpoints.snapshots.fetch;
                if (typeof API_URL !== "string") {
                  throw new Error("Invalid API URL");
                }
              }
            );
          } catch (error) {
            console.error("Error fetching snapshot container:", error);
            throw error;
          }
        });
      },
      mapSnapshot: async (
        id: number,
        ) => {
          return new Promise(async (resolve, reject) => {
            console.log("Mapping snapshot for ID:", id);
            try {
              return await new Promise<Snapshot<T, K> | undefined>((resolve) => {
                setTimeout(() => resolve(undefined), 1000);
                const API_URL = endpoints.snapshots.fetch;
                if (typeof API_URL !== "string") {
                  throw new Error("Invalid API URL");
                }
              });
            } catch (error) {
              console.error("Error mapping snapshot:", error);
              
              throw error;
            }
          });
        },
      getSnapshotVersions: async (id: number) => undefined,
      fetchData: async () => [],
      snapshotMethods: [],
    };

    resolve(options);
  });
}

const snapshotContainer = new Map<string, SnapshotStore<any, any>>();

export const getCurrentSnapshotConfigOptions = <T extends Data, K extends Data>(
  snapshot: (
    id: string,
    snapshotId: string | null,
    snapshotData: Snapshot<T, K>,
    category: string | CategoryProperties | undefined,
    callback: (snapshotStore: Snapshot<T, K>) => void,
    snapshotStoreConfigData?: SnapshotStoreConfig<T, K>,
    snapshotContainer?: SnapshotStore<T, K> | Snapshot<T, K> | null
  ) => Promise<any>, // Adjust type as needed

  category: keyof CategoryProperties,

  initSnapshot: (
    snapshot: SnapshotStore<T, K> | Snapshot<T, K> | null,
    snapshotId: string | null,
    snapshotData: SnapshotStore<T, K>,
    category: string | CategoryProperties | undefined,
    snapshotConfig: SnapshotStoreConfig<T, K>,
    callback: (snapshotStore: SnapshotStore<T, K>) => void
  ) => void, // Adjust type as needed

  subscribeToSnapshots: (
    snapshot: SnapshotStore<T, K>,
    snapshotId: string,
    snapshotData: SnapshotStore<T, K>,
    category: string | CategoryProperties | undefined,
    snapshotConfig: SnapshotStoreConfig<T, K>,
    callback: (snapshotStore: SnapshotStore<any, any>) => void
  ) => void,

  createSnapshot: (
    id: string,
    snapshotData: Snapshot<T, K>,
    category?: string | CategoryProperties,
    callback?: (snapshot: Snapshot<T, K>) => void,
    snapshotDataStore?: SnapshotStore<T, K>,
    snapshotStoreConfig?: SnapshotStoreConfig<T, K>
  ) => Snapshot<T, K> | null,

  createSnapshotStore: (
      id: string,
  snapshotStoreData: Snapshots<T>, // Array of SnapshotStore objects
  category?: string | CategoryProperties,
  callback?: (snapshotStore: SnapshotStore<T, K>) => void,
  snapshotDataConfig?: SnapshotStoreConfig<T, K>[] // Array of SnapshotStoreConfig objects

  ) => SnapshotStore<T, K> | null,


  configureSnapshot: (
    id: string,
    snapshotData: Snapshot<T, K>,
    category?: string | CategoryProperties,
    callback?: (snapshot: Snapshot<T, K>) => void,
    snapshotDataStore?: SnapshotStore<T, K>,
    snapshotStoreConfig?: SnapshotStoreConfig<T, K>
  ) => Snapshot<T, K> | null,
  
  delegate: any, // Adjust type as needed
  snapshotData: SnapshotStore<T, K>
): SnapshotStoreConfig<T, K> => {


  const isDataWithPriority = (data: any): data is Partial<DataWithPriority> => {
    return data && typeof data === 'object' && 'priority' in data;
  };

  // Type guard function to check if data is of type Partial<DataWithVersion>
  const isDataWithVersion = (data: any): data is Partial<DataWithVersion> => {
    return data && typeof data === 'object' && 'version' in data;
  }

  
  return {
    
    id: snapshotData.id || "",
    timestamp: snapshotData.timestamp || new Date().toISOString(),
    snapshotId:
      snapshotData.id !== undefined && snapshotData.id !== null
        ? snapshotData.id.toString()
        : "",
        snapshotStore: new SnapshotStore<T, K>(options, config),
      snapshot: (
      id: string,
      snapshotId: string | null,
      snapshotData: Snapshot<T, K>,
      category: string | CategoryProperties | undefined,
      callback: (snapshot: Snapshot<T, K>) => void
    ) => {
      return new Promise(async (resolve, reject) => {
        try {
          const snapshotContainer = await snapshot(
            id,
            snapshotId,
            snapshotData,
            category,
            callback
          );
          if (snapshotContainer !== undefined) {
            resolve(snapshotContainer);
          } else {
            reject(new Error("Snapshot container is undefined"));
          }
        } catch (error) {
          console.error("Error fetching snapshot:", error);
          reject(error);
        }
      });
    },

    category,
    initSnapshot,
    subscribeToSnapshots,
    createSnapshot,
    createSnapshotStore,
    configureSnapshot,
    delegate,
    data: {
      ...(snapshotData.data && typeof snapshotData.data === 'object' ? snapshotData.data : {}),

      priority:
        snapshotData.data &&
        isDataWithPriority(snapshotData.data) &&
        snapshotData.data.priority !== undefined
          ? snapshotData.data.priority.toString()
          : undefined,
    } as T,
    getSnapshotId: () => (snapshotData.id ? snapshotData.id.toString() : ""),

    name: snapshotData.data && (snapshotData.data as any)?.name,
    description: snapshotData.data && (snapshotData.data as any)?.description,
    tags: [],
    metadata: {},
    config: [],

    version:
    snapshotData.data &&
    isDataWithVersion(snapshotData.data) &&
    snapshotData.data.version !== undefined
      ? snapshotData.data.version.toString()
      : "",

    initialState: snapshotData.initializedState ?? null,
    snapshotCategory: snapshotData.category ?? undefined,
    snapshotSubscriberId: snapshotData.subscriberId ?? null,
    snapshotContent: snapshotData.content ?? undefined,
    handleSnapshot: snapshotData.handleSnapshot ?? null,
    state: snapshotData.state ?? undefined,

    configureSnapshotStore: snapshotData.configureSnapshotStore ?? null,

    updateSnapshotSuccess: snapshotData.updateSnapshotSuccess ?? null,
    createSnapshotFailure: snapshotData.createSnapshotFailure ?? null,
    batchTakeSnapshot: (
      snapshotStore: SnapshotStore<T, K>,
      snapshots: Snapshots<T>) => {
      return Promise.resolve({ snapshots });
    },
    snapshots: [],
    subscribers: [],
    mapSnapshot: snapshotData.mapSnapshot ?? null,
    createSnapshotStores: snapshotData.createSnapshotStores ?? null,
    createSnapshotSuccess: snapshotStoreConfig?.createSnapshotSuccess ?? null,
    onSnapshot: snapshotStoreConfig?.onSnapshot ?? null,
    onSnapshots: snapshotStoreConfig?.onSnapshots ?? null,
    snapshotData: snapshotStoreConfig?.snapshotData ?? (() => ({ snapshots: {} as Snapshots<T> })),
    clearSnapshot: snapshotStoreConfig?.clearSnapshot ?? null,
    handleSnapshotOperation: snapshotStoreConfig?.handleSnapshotOperation ?? null,
    mapSnapshots: snapshotStoreConfig?.mapSnapshots,
    content: snapshotStoreConfig?.content,
    onSnapshotStore: snapshotStoreConfig?.onSnapshotStore,
    displayToast: snapshotStoreConfig?.displayToast,
   
    fetchInitialSnapshotData: snapshotStoreConfig?.fetchInitialSnapshotData,
    updateSnapshot: snapshotStoreConfig?.updateSnapshot,
    getSnapshots: snapshotStoreConfig?.getSnapshots,
   
    takeSnapshot: snapshotStoreConfig?.takeSnapshot,
    takeSnapshotStore: snapshotStoreConfig?.takeSnapshotStore,
    addSnapshot: snapshotStoreConfig?.addSnapshot,
   
    addToSnapshotList: snapshotStoreConfig?.addToSnapshotList,
   
    addSnapshotSuccess: snapshotStoreConfig?.addSnapshotSuccess,
    removeSnapshot: snapshotStoreConfig?.removeSnapshot,
    getSubscribers: snapshotStoreConfig?.getSubscribers,
   
    addSubscriber: snapshotStoreConfig?.addSubscriber,
    validateSnapshot: snapshotStoreConfig?.validateSnapshot,
    getSnapshot: snapshotStoreConfig?.getSnapshot,
    getAllSnapshots: snapshotStoreConfig?.getAllSnapshots,
   
    addToSnapshotStoreList: snapshotStoreConfig?.addToSnapshotStoreList,
    takeSnapshotSuccess: snapshotStoreConfig?.takeSnapshotSuccess,
    updateSnapshotFailure: snapshotStoreConfig?.updateSnapshotFailure,
   
    takeSnapshotsSuccess: snapshotStoreConfig?.takeSnapshotsSuccess,
    fetchSnapshot: snapshotStoreConfig?.fetchSnapshot,
    addSnapshotToStore: snapshotStoreConfig?.addSnapshotToStore,
   
    getSnapshotSuccess: snapshotStoreConfig?.getSnapshotSuccess,
    setSnapshotSuccess: snapshotStoreConfig?.setSnapshotSuccess,
    setSnapshotFailure: snapshotStoreConfig?.setSnapshotFailure,
   
    updateSnapshotsSuccess: snapshotStoreConfig?.updateSnapshotsSuccess,
    fetchSnapshotSuccess: snapshotStoreConfig?.fetchSnapshotSuccess,
    updateSnapshotForSubscriber: snapshotStoreConfig?.updateSnapshotForSubscriber,
    
    updateMainSnapshots: snapshotStoreConfig?.updateMainSnapshots,
    batchProcessSnapshots: snapshotStoreConfig?.batchProcessSnapshots,
    batchUpdateSnapshots: snapshotStoreConfig?.batchUpdateSnapshots,
   
    batchFetchSnapshotsRequest: snapshotStoreConfig?.batchFetchSnapshotsRequest,
    batchTakeSnapshotsRequest: snapshotStoreConfig?.batchTakeSnapshotsRequest,
    batchUpdateSnapshotsRequest: snapshotStoreConfig?.batchUpdateSnapshotsRequest,
   
    batchFetchSnapshots: snapshotStoreConfig?.batchFetchSnapshots,
    getData: snapshotStoreConfig?.getData,
    batchFetchSnapshotsSuccess: snapshotStoreConfig?.batchFetchSnapshotsSuccess,
   
    batchFetchSnapshotsFailure: snapshotStoreConfig?.batchFetchSnapshotsFailure,
    batchUpdateSnapshotsFailure: snapshotStoreConfig?.batchUpdateSnapshotsFailure,
    notifySubscribers: snapshotStoreConfig?.notifySubscribers,
   
    notify: snapshotStoreConfig?.notify,
    getCategory: snapshotStoreConfig?.getCategory,
    updateSnapshots: snapshotStoreConfig?.updateSnapshots,
    updateSnapshotsFailure: snapshotStoreConfig?.updateSnapshotsFailure,
    flatMap: snapshotStoreConfig?.flatMap,
    setData: snapshotStoreConfig?.setData,
 
    getState: snapshotStoreConfig?.getState,
    setState: snapshotStoreConfig?.setState,
    handleActions: snapshotStoreConfig?.handleActions,
   
    setSnapshots: snapshotStoreConfig?.setSnapshots,
    mergeSnapshots: snapshotStoreConfig?.mergeSnapshots,
    reduceSnapshots: snapshotStoreConfig?.reduceSnapshots,
    sortSnapshots: snapshotStoreConfig?.sortSnapshots,
    filterSnapshots: snapshotStoreConfig?.filterSnapshots,
    findSnapshot: snapshotStoreConfig?.findSnapshot,
   
    subscribe: snapshotStoreConfig?.subscribe,
    
    unsubscribe: snapshotStoreConfig?.unsubscribe,
   
    fetchSnapshotFailure: snapshotStoreConfig?.fetchSnapshotFailure, 
    generateId: snapshotStoreConfig?.generateId,
    [Symbol.iterator]: function* (): IterableIterator<T> { yield* [] as T[]; },
    [Symbol.asyncIterator]: async function* (): AsyncIterableIterator<T> { yield* [] as T[]; },
  };
};

const snapshotDelegate = <T extends Data, K extends Data>(
  snapshotStoreConfig: SnapshotStoreConfig<Data, any>[]
) => {
  return {
    getSnapshot: (
      category: any,
      timestamp: any,
      id: number
    ): Promise<Snapshot<T, K> | undefined> => {
      return new Promise<Snapshot<T, K> | undefined>((resolve, reject) => {
        console.log("Fetching snapshot for ID:", id);
        try {
          const API_URL = endpoints.snapshots.fetch;
          if (typeof API_URL !== "string") {
            throw new Error("Invalid API URL");
          }
          // Fetch snapshot using the fetchSnapshotById method
          fetchSnapshotById<T, K>(id.toString())
            .then((snapshotData) => {
              if (!snapshotData) {
                resolve(undefined);
                return;
              }
              // Assuming snapshotData is of type Snapshot<T, K>
              const snapshot: Snapshot<T, K> = {
                ...snapshotData,
                data: snapshotData.data,
                events: snapshotData.events,
                meta: snapshotData.meta,
              };
              resolve(snapshot);
            })
            .catch((error) => {
              console.error("Error fetching snapshot:", error);
              reject(error);
            });
        } catch (error) {
          console.error("Error fetching snapshot:", error);
          reject(error);
        }
      });
    },

    getSnapshotContainer: async (category: any, timestamp: any, id: number) => {
      return new Promise(async (resolve, reject) => {
        console.log("Fetching snapshot container for ID:", id);
        try {
          return await new Promise<SnapshotStore<T, K> | undefined>(
            (resolve) => {
              setTimeout(() => resolve(undefined), 1000);
              const API_URL = endpoints.snapshots.fetch;
              if (typeof API_URL !== "string") {
              }
            }
          ).then((snapshotContainer) => {
            if (snapshotContainer !== undefined) {
              resolve(snapshotContainer);
            } else {
              reject(new Error("Snapshot container not found"));
            }
          });
        } catch (error) {
          console.error("Error fetching snapshot container:", error);
          throw error;
        }
      });
    },

    getSnapshotVersions: async (id: number) => undefined,
    fetchData: async () => [],
    snapshotMethods: [],
  };
};

function createSnapshotOptions<T extends BaseData, K extends BaseData>(
  snapshot: Snapshot<T, K>
): SnapshotStoreOptions<T, K> {
  const dataMap = new Map<string, Snapshot<T, K>>();
  // Assuming `snapshot` has a unique identifier or key to be added to the Map
  const snapshotId = snapshot.id ? snapshot.id.toString() : '';
  dataMap.set(snapshotId, snapshot);
  
  return {
    data: dataMap,
    initialState: snapshot.initialState || null,
    snapshotId: snapshot.id ? snapshot.id.toString() : "",
    category: {
      name:
        typeof snapshot.category === "string"
          ? snapshot.category
          : "default-category",
      description: "",
      icon: "",
      color: "",
      iconColor: "",
      isActive: false,
      isPublic: false,
      isSystem: false,
      isDefault: false,
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
    },
    date: new Date(),
    type: "default-type",
    snapshotConfig: [], // Adjust as needed
    subscribeToSnapshots: subscribeToSnapshotsImpl,
    subscribeToSnapshot: subscribeToSnapshotImpl,
    delegate: () => Promise.resolve([]), // Changed to a function returning a Promise
    getDelegate: snapshotDelegate,
    dataStoreMethods: {} as DataStoreWithSnapshotMethods<T, K>, // Provide actual data store methods
    getDataStoreMethods: () => ({} as DataStoreWithSnapshotMethods<T, K>),
    snapshotMethods: [], // Provide appropriate default or derived snapshotMethods
    configOption: null, // Provide default or derived configOption

    handleSnapshotOperation: handleSnapshotOperation, // Added handleSnapshotOperation
    displayToast: displayToast, // Added displayToast
    addToSnapshotList: addToSnapshotList, // Added addToSnapshotList
  };
}

// Example implementation of snapshotType function
const snapshotType = <T extends BaseData, K extends BaseData = T>(
  snapshot: Snapshot<T, K>
): Snapshot<T, K> => {
  const newSnapshot = { ...snapshot }; // Shallow copy of the snapshot

  // Retrieve options for SnapshotStore initialization using the helper function
  const options: SnapshotStoreOptions<T, K> = createSnapshotOptions(snapshot);

  // Handle SnapshotStore<BaseData> or Snapshot<BaseData>
  if (snapshot.initialState && "store" in snapshot.initialState) {
    newSnapshot.initialState = snapshot.initialState;
  } else if (snapshot.initialState && "data" in snapshot.initialState) {
    newSnapshot.initialState = snapshot.initialState;
  } else {
    newSnapshot.initialState = null; // Handle null or undefined case
  }

  // Cast newSnapshot to Snapshot<T> to satisfy TypeScript requirements
  const result: Snapshot<T, K> = {
    id: snapshot.id || generateSnapshotId,
    title: snapshot.title || "",
    timestamp: snapshot.timestamp ? new Date(snapshot.timestamp) : new Date(),
    subscriberId: snapshot.subscriberId || "",
    category:
      typeof snapshot.category === "string"
        ? defaultCategory
        : snapshot.category || defaultCategory,
    length: snapshot.length || 0,
    content: snapshot.content || "",
    data: snapshot.data,
    value: snapshot.value || 0,
    key: snapshot.key || "",
    subscription: snapshot.subscription || null,
    config: snapshot.config || null,
    status: snapshot.status || "",
    metadata: snapshot.metadata || {},
    delegate: snapshot.delegate || [],
    store:
      (snapshot.store as SnapshotStore<T, K>) ||
      new SnapshotStore<T, K>(options),

    state: snapshot.state || null,
    todoSnapshotId: snapshot.todoSnapshotId || "",
    initialState: snapshot.initialState || null,
    getSnapshotId: snapshot.getSnapshotId || "",
    compareSnapshotState: snapshot.compareSnapshotState || "",
    snapshot: snapshot.snapshots || null,
    snapshotStore: snapshot.snapshotStore || null,
    events: snapshot.events || {
      eventRecords: {},
      callbacks: (snapshot: Snapshot<T, K>) => {
        return {
          subscribe: (callback: (snapshot: Snapshot<T, K>) => void) => {
            snapshot.events?.callbacks.subscribe(callback);
          },
          unsubscribe: (callback: (snapshot: Snapshot<T, K>) => void) => {
            snapshot.events?.callbacks.unsubscribe(callback);
          },
        };
      },
      subscribers: [],
      eventIds: [],
    },
  };

  return result;
};
class LocalStorageSnapshotStore<
  T extends BaseData,
  K extends BaseData
> extends SnapshotStore<T, K> {
  private storage: Storage;

  constructor(
    storage: Storage,
    category: CategoryProperties = {
      name: "LocalStorageSnapshotStore",
      description: "LocalStorageSnapshotStore",
      icon: "fa-solid fa-database",
      color: "bg-blue-500",
      iconColor: "text-white",
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
    },
    dataStoreMethods?: Partial<DataStore<T, K>>,
    initialState: SnapshotStore<T, K> | Snapshot<T, K> | null = null
  ) {
    const snapshot: Snapshot<T, K> = {
      id: "",
      category: category,
      timestamp: new Date(),
      createdBy: "",
      description: "",
      tags: [],
      metadata: {},
      data: new Map<string, Snapshot<T, K>>(),
      initialState: initialState,
      events: {
        eventRecords: [],
        callbacks: (snapshot: Snapshot<T, K>) => {
          return {
            onSnapshotAdded: (snapshot: Snapshot<T, K>) => {
              console.log("onSnapshotAdded", snapshot);
            },

            onSnapshotUpdated: (
              snapshotId: string,
              data: Map<string, Snapshot<T, K>>,
              events: Record<string, CalendarEvent[]>,
              snapshotStore: SnapshotStore<T, K>,
              dataItems: RealtimeDataItem[],
              newData: Snapshot<T, K>, 
              payload: UpdateSnapshotPayload<T>,
              store: SnapshotStore<any, K>
            ) => {
              console.log("onSnapshotUpdated", snapshot);
              this.updateSnapshot(
                snapshotId, 
                data, 
                events,
                snapshotStore,
                dataItems,
                newData,
                payload,
                store
              );
            },
            onSnapshotRemoved: (snapshot: Snapshot<T, K>) => {
              console.log("onSnapshotRemoved", snapshot);
            },
          };
        },
        subscribers: [],
        eventIds: [],
      },
      meta: {} as Map<string, Snapshot<T, K>>,
    };

    const options = createSnapshotOptions(snapshot);

    super(options, category, dataStoreMethods, initialState);
    this.storage = storage;
    this.dataStoreMethods = this.getDataStoreMethods();
    // this.createDataStoreMethods();
  }

  private createDataStoreMethods(): DataStore<T, K> {
    return {
      data: new Map<string, Snapshot<T, K>>(),

      addData: (data: Snapshot<T, K>) => {
        if (data.id !== undefined) {
          this.storage.setItem(data.id.toString(), JSON.stringify(data));
        }
      },

      getItem: async (id: string): Promise<T | undefined> => {
        const item = this.storage.getItem(id);
        return item ? (JSON.parse(item) as T) : undefined;
      },

      removeData: (id: number) => {
        this.storage.removeItem(id.toString());
      },

      updateData: (id: number, newData: Snapshot<T, K>) => {
        const item = this.storage.getItem(id.toString());
        if (item) {
          const data = JSON.parse(item);
          Object.assign(data, newData);
          this.storage.setItem(id.toString(), JSON.stringify(data));
        }
      },

      updateDataTitle: (id: number, title: string) => {
        const item = this.storage.getItem(id.toString());
        if (item) {
          const data = JSON.parse(item);
          data.title = title;
          this.storage.setItem(id.toString(), JSON.stringify(data));
        }
      },

      updateDataDescription: (id: number, description: string) => {
        const item = this.storage.getItem(id.toString());
        if (item) {
          const data = JSON.parse(item);
          data.description = description;
          this.storage.setItem(id.toString(), JSON.stringify(data));
        }
      },

      addDataStatus: (
        id: number,
        status: "pending" | "inProgress" | "completed"
      ) => {
        const item = this.storage.getItem(id.toString());
        if (item) {
          const data = JSON.parse(item);
          data.status = status;
          this.storage.setItem(id.toString(), JSON.stringify(data));
        }
      },

      updateDataStatus: (
        id: number,
        status: "pending" | "inProgress" | "completed"
      ) => {
        const item = this.storage.getItem(id.toString());
        if (item) {
          const data = JSON.parse(item);
          data.status = status;
          this.storage.setItem(id.toString(), JSON.stringify(data));
        }
      },

      addDataSuccess: (payload: { data: T[] }) => {
        payload.data.forEach((item) => {
          this.storage.setItem(item.id.toString(), JSON.stringify(item));
        });
      },

      getDataVersions: async (id: number): Promise<T[] | undefined> => {
        const item = this.storage.getItem(id.toString());
        return item ? [JSON.parse(item)] : undefined;
      },

      updateDataVersions: (id: number, versions: T[]) => {
        versions.forEach((version) => {
          this.storage.setItem(version.id.toString(), JSON.stringify(version));
        });
      },

      getAllKeys: this.getAllKeys,
      fetchData: this.fetchData,
      setItem: this.setItem,
      removeItem: this.removeItem,
      getAllItems: this.getAllItems,

      getBackendVersion: useDataStore().getBackendVersion(),

      getFrontendVersion: async (): Promise<string> => {
        return "frontend-version"; // Replace with actual logic
      },
    };
  }

  async getItem(key: string): Promise<T | undefined> {
    const item = this.storage.getItem(key);
    return item ? (JSON.parse(item) as T) : undefined;
  }

  setItem(key: string, value: T): Promise<void> {
    this.storage.setItem(key, JSON.stringify(value));
    return Promise.resolve();
  }

  removeItem(key: string): Promise<void> {
    this.storage.removeItem(key);
    return Promise.resolve();
  }

  async getAllKeys(): Promise<string[]> {
    const keys: string[] = [];
    for (let i = 0; i < this.storage.length; i++) {
      const key = this.storage.key(i);
      if (key) {
        keys.push(key);
      }
    }
    return keys;
  }

  async getAllItems(): Promise<T[]> {
    const keys = await this.getAllKeys();
    const items: T[] = [];
    keys.forEach((key) => {
      const item = this.storage.getItem(key);
      if (item) {
        items.push(JSON.parse(item));
      }
    });
    return items;
  }
}

// Example usage in a Redux slice or elsewhere
const newTask: Task = {
  _id: "newTaskId2",
  id: "randomTaskId", // generate unique id
  name: "",
  title: "",
  description: "",
  assignedTo: [],
  dueDate: new Date(),
  status: "Pending",
  priority: PriorityTypeEnum.Medium,
  estimatedHours: 0,
  actualHours: 0,
  startDate: new Date(),
  completionDate: new Date(),
  endDate: new Date(),
  isActive: false,
  assigneeId: "",
  payload: {},
  previouslyAssignedTo: [],
  done: false,
  data: {} as TaskData,
  source: "user",
  tags: [],
  dependencies: [],
  then: function (
    onFulfill: (newData: Snapshot<Data>) => void
  ): Snapshot<Data> {
    const store = new LocalStorageSnapshotStore<Data, BaseData>(
      window.localStorage
    );
    setTimeout(() => {
      onFulfill({
        data: {} as Map<string, Data>,
        store: store,
        state: null,
      });
    }, 1000);
    return {
      data: {} as Map<string, Data>,
      store: store,
      state: null,
    };
  },
};

export type {
  CustomSnapshotData,
  Payload,
  Snapshot,
  Snapshots,
  UpdateSnapshotPayload,
};

// Create a subscription object
const subscription: Subscription<T, K> = {
  unsubscribe: () => {},
  portfolioUpdates: () => {},
  tradeExecutions: () => {},
  marketUpdates: () => {},
  triggerIncentives: () => {},
  communityEngagement: () => {},
  subscriberId: "sub-123",
  subscriptionId: "sub-123-id",
  subscriberType: SubscriberTypeEnum.Individual,
  subscriptionType: SubscriptionTypeEnum.STANDARD,
  getPlanName: () => SubscriberTypeEnum.Individual,
  portfolioUpdatesLastUpdated: null,
  getId: () => "id-123",
  determineCategory: (data: Snapshot<Data, any> | null | undefined) =>
    data.category,
  category: "category-123",
};
const subscriberId = getSubscriberId.toString();

const subscriber = new Subscriber<T, K>(
  "_id",
  "John Doe",
  subscription,
  subscriberId,
  notifyEventSystem,
  updateProjectState,
  logActivity,
  triggerIncentives,
  undefined,
  {}
);
subscriber.id = "new-id"; // Set the private property using the setter method

const snapshots: Snapshots<T> = [
  {
    id: "1",
    data: {
      /* your data */
    } as Map<string, Data>,

    // name: "Snapshot 1",
    timestamp: new Date(),
    createdBy: "User123",
    subscriberId: "Sub123",
    length: 100,
    category: "update",
    status: "active",
    content: "Snapshot content",
    message: "Snapshot message",
    type: "type1",
    phases: ProjectPhaseTypeEnum.Development,
    phase: {
      id: "1",
      name: "Phase 1",
      startDate: new Date(),
      endDate: new Date(),
      // progress: 0,
      status: "In Progress",
      type: "type1",

      // Additional metadata
      _id: "abc123",
      title: "Snapshot Title",
      description: "Detailed description",
      subPhases: [
        {
          id: "1",
          name: "Subphase 1",
          startDate: new Date(),
          endDate: new Date(),
          status: "In Progress",
          type: "type1",
          duration: 0,
          subPhases: [],
          component: {} as FC<{}>,
        },
      ],
      tags: ["tag1", "tag2"],
    },
    ownerId: "Owner123",
    store: null,
    state: null,
    initialState: null,
    setSnapshotData(
      subscribers: Subscriber<any, any>[],
      snapshotData: Partial<SnapshotStoreConfig<BaseData, any>>
    ) {
      // If the config array already exists, update it with the new snapshotData
      if (this.config) {
        this.config.forEach((config) => {
          Object.assign(config, snapshotData);
        });
      } else {
        // If no config array exists, create a new one with the provided snapshotData
        this.config = [
          {
            ...snapshotData,
            subscribers: subscribers as Subscriber<T, K>[], // Set the subscribers in the config
          } as SnapshotStoreConfig<T, K>,
        ];
      }
    },
    // Additional metadata
    _id: "abc123",
    title: "Snapshot Title",
    description: "Detailed description",
    tags: ["tag1", "tag2"],
    topic: "Topic",
    priority: PriorityTypeEnum.High,
    key: "unique-key",
    subscription: {
      unsubscribe: unsubscribe,
      portfolioUpdates: portfolioUpdates,
      tradeExecutions: getTradeExecutions,
      marketUpdates: getMarketUpdates,
      triggerIncentives: triggerIncentives,
      communityEngagement: getCommunityEngagement,
      portfolioUpdatesLastUpdated: {
        value: new Date(),
        isModified: false,
      } as ModifiedDate,
      determineCategory: (snapshotCategory: any) => {
        return snapshotCategory;
      },
      // id: "sub123",
      // name: "Subscriber 1",
      // subscriberId: "sub123",
      subscriberType: SubscriberTypeEnum.FREE,
      // subscriberName: "User 1",
      // subscriberEmail: "user1@example.com",
      // subscriberPhone: "123-456-7890",
      // subscriberStatus: "active",
      // subscriberRole: "admin",
      // subscriberCreatedAt: new Date(),
      // subscriberUpdatedAt: new Date(),
      // subscriberLastSeenAt: new Date(),
      // subscriberLastActivityAt: new Date(),
      // subscriberLastLoginAt: new Date(),
      // subscriberLastLogoutAt: new Date(),
      // subscriberLastPasswordChangeAt: new Date(),
      // subscriberLastPasswordResetAt: new Date(),
      // subscriberLastPasswordResetToken: "random-token",
      // subscriberLastPasswordResetTokenExpiresAt: new Date(),
      // subscriberLastPasswordResetTokenCreatedAt: new Date(),
      // subscriberLastPasswordResetTokenCreatedBy: "user123",
    },
    config: null,
    metadata: {
      /* additional metadata */
    },
    isCompressed: true,
    isEncrypted: false,
    isSigned: true,
    expirationDate: new Date(),
    auditTrail: [
      {
        userId: "user123",
        timestamp: new Date(),
        action: "update",
        details: "Snapshot updated",
      },
    ],
    subscribers: [subscriber],
    value: 50,
    todoSnapshotId: "todo123",
    then: (callback: (newData: Snapshot<Data>) => void) => {
      /* implementation */
    },
  },
];

export { createSnapshotOptions, snapshots };
export type { CoreSnapshot, CreateSnapshotStoresPayload };

