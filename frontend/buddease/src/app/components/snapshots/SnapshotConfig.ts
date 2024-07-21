import {
  SnapshotData,
  SnapshotStoreSubset,
  initialState,
} from "@/app/components/snapshots/SnapshotStore";
// SnapshotConfig.ts
import { fetchData } from "@/app/api/ApiData";
import { endpoints } from "@/app/api/ApiEndpoints";
import { RealtimeDataItem } from "@/app/components/models/realtime/RealtimeData";
import UniqueIDGenerator from "@/app/generators/GenerateUniqueIds";
import {
  CategoryProperties,
  convertToCategoryProperties,
} from "@/app/pages/personas/ScenarioBuilder";
import { useParams } from "next/navigation";
import {
  UserConfigExport,
  UserConfig as ViteUserConfig,
  defineConfig,
} from "vite";
import { ModifiedDate } from "../documents/DocType";
import { BaseData, Data } from "../models/data/Data";
import {
  SubscriberTypeEnum,
  SubscriptionTypeEnum,
} from "../models/data/StatusType";
import { Tag, tag1, tag2 } from "../models/tracker/Tag";
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
import * as snapshotApi from "./../../api/SnapshotApi";
import {
  getCommunityEngagement,
  getMarketUpdates,
  getPortfolioUpdatesLastUpdated,
  getTradeExecutions,
} from "./../../components/trading/TradingUtils";
import { sendNotification } from "./../../components/users/UserSlice";
import {
  CustomSnapshotData,
  Payload,
  Snapshot,
  Snapshots,
  UpdateSnapshotPayload,
} from "./LocalStorageSnapshotStore";
import SnapshotList, { SnapshotItem } from "./SnapshotList";
import SnapshotStore from "./SnapshotStore";
import useSnapshotManager, { options } from "../hooks/useSnapshotManager";
import { generateSnapshotId } from "../utils/snapshotUtils";
import { fetchCategoryByName } from "@/app/api/CategoryApi";
import determineFileCategory, {
  fetchFileSnapshotData,
} from "../libraries/categories/determineFileCategory";
import { ChosenSnapshotState, snapshotType } from "../typings/YourSpecificSnapshotType";
import { config } from "@fortawesome/fontawesome-svg-core";
import { FileCategory } from "../documents/FileType";
import { useSecureUserId } from "../utils/useSecureUserId";
import { Content } from "../models/content/AddContent";

export type T = BaseData;
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
  snapshotConfig?: SnapshotStoreConfig<T, Data>[];
}

export interface SnapshotStoreConfig<T extends BaseData, K extends BaseData> {
  id: string | number | null;
  name?: string;
  title?: string;
  description?: string
  data: T;
  timestamp: string | Date | undefined;
  snapshotId: string;
  snapshotStore: SnapshotStore<T, K>;
  taskIdToAssign?: string;
  clearSnapshots?: any;
  key?: string;
  topic?: string;
  category: string | CategoryProperties | undefined;
  initialState:  ChosenSnapshotState
  configOption?: SnapshotStoreConfig<T, K> | null;
  subscription?: Subscription | null;
  initialConfig?: SnapshotStoreConfig<T, K> | null;
  config?: SnapshotStoreConfig<BaseData, any>[] | null;
  snapshotConfig?: UserConfig['snapshotConfig'];
  snapshotCategory: string | CategoryProperties | undefined;
  snapshotSubscriberId: string;
  snapshotContent: string | Content | undefined;
  store?: SnapshotStoreConfig<T, K> | null;
  set?: (type: string, event: Event) => void | null;
  removeSubscriber?: (subscriber: Subscriber<T,K>) => void;
  handleSnapshot: (
    snapshot: Snapshot<T> | null,
    snapshotId: string
  ) => void | null;
  state: Snapshot<T>[] | null;
  snapshots: SnapshotStore<T, K>[];
  onInitialize?: () => void;
  subscribers: Subscriber<T, K>[];
  onError?: (error: Payload) => void;
  getSnapshotId: (data: SnapshotData) => string;
  snapshot: (
    id: string,
    snapshotData: SnapshotStoreConfig<any, K>,
    category: string | CategoryProperties | undefined,
    callback: (snapshotStore: SnapshotStore<any,any>) => void
  ) => Promise<{
    snapshotStore: SnapshotStore<T, K>;
  }>;

  actions?: {
    takeSnapshot: (
      snapshot: SnapshotStore<T, K>,
      data: SnapshotStoreConfig<T, K>
    ) => Promise<Snapshot<T>>;

    updateSnapshot: (
      snapshot: SnapshotStore<T, K>,
      data: SnapshotStoreConfig<T, K>
    ) => Promise<Snapshot<T>>;

    deleteSnapshot: (
      snapshot: SnapshotStore<T, K>,
      data: SnapshotStoreConfig<T, K>
    ) => Promise<Snapshot<T>>;
  };

  addSnapshotFailure?: (error: Error) => void;

  setSnapshot?: (snapshot: SnapshotStore<T, K>) => void;
  createSnapshot: (
    id: string,
    snapshotData: SnapshotStoreConfig<any, Data>,
    category: string | CategoryProperties | undefined,
    callback: (snapshotStore: SnapshotStore<any,any>) => void
  ) => void;
  configureSnapshotStore: (snapshot: SnapshotStore<T, K>) => void;
  createSnapshotSuccess: (snapshot: Snapshot<T>) => void;
  createSnapshotFailure: (
    snapshot: Snapshot<BaseData>,
    error: any
  ) => Promise<void>;
  batchTakeSnapshot: (
    snapshotStore: SnapshotStore<T, K>,
    snapshots: Snapshots<T>
  ) => Promise<{
    snapshots: Snapshots<T>;
  }>;
  onSnapshot: (snapshot: SnapshotStore<T, K>) => void | undefined;
  onSnapshots: Snapshots<T> | null;
  snapshotData: (snapshot: SnapshotStore<T, K>) => {
    snapshots: Snapshots<T>;
  };
  initSnapshot: (
    snapshotConfig: SnapshotStoreConfig<T, K>, // Use K instead of T for snapshotConfig
    snapshotData: SnapshotStore<T, K> // Ensure snapshotData matches SnapshotStore<T, K>
  ) => void;
  
  clearSnapshot: () => void;
  handleSnapshotOperation: (
    snapshot: SnapshotStore<T, K>,
    data: SnapshotStoreConfig<T, K>
  ) => Promise<void>;
  displayToast: (message: string) => void;
  addToSnapshotList: (
    snapshotStore: SnapshotStore<any,any>,
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
    store: SnapshotStore<any,any>
  ) => Promise<{ snapshot: Snapshot<Data> }>;

  getSnapshots: (
    category: string,
    snapshots: Snapshots<T>
  ) => Promise<{
    snapshots: Snapshots<T>;
  }>;

  takeSnapshot: (snapshot: SnapshotStore<T, K>) => Promise<{
    snapshot: SnapshotStore<T, K>;
  }>;

  addSnapshot: (snapshot: T,
    subscribers: Subscriber<BaseData, K>[]) => void;

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
    delegate: SnapshotStoreSubset<T>,
    sendNotification: (type: NotificationTypeEnum) => void
  ) => void;
  validateSnapshot: (data: Snapshot<T>) => boolean;
  getSnapshot(
    snapshot: () =>
      | Promise<{
          category: any;
          timestamp: any;
          id: any;
          snapshotStore: SnapshotStore<BaseData, K>;
          data: T;
        }>
      | undefined
  ): Promise<SnapshotStore<BaseData, K>>;

  getAllSnapshots: (
    data: (
      subscribers: Subscriber<BaseData, K>[],
      snapshots: Snapshots<T>
    ) => Promise<Snapshots<T>>
  ) => Promise<Snapshots<T>>;

  takeSnapshotSuccess: (snapshot: SnapshotStore<T, K>) => void;
  updateSnapshotFailure: (payload: { error: string }) => void;
  takeSnapshotsSuccess: (snapshots: T[]) => void;
  fetchSnapshot: (
    id: string,
    category: string | CategoryProperties | undefined,
    timestamp: Date,
    snapshot: Snapshot<T>,
    data: T,
    delegate: SnapshotStoreConfig<T, any>[]
  ) => Promise<{
    id: any;
    category: string | CategoryProperties | undefined;
    timestamp: any;
    snapshot: Snapshot<T>;
    data: T;
    delegate: SnapshotStoreConfig<T, any>[];
  }>;
  setSnapshotSuccess: (
    snapshot: SnapshotStore<T, K>,
    subscribers: ((data: Snapshot<T>) => void)[]
  ) => void;
  setSnapshotFailure: (error: any) => void;
  updateSnapshotSuccess: () => void;
  updateSnapshotsSuccess: (
    snapshotData: (
      subscribers: Subscriber<BaseData, K>[],
      snapshot: Snapshots<T>
    ) => void
  ) => void;
  fetchSnapshotSuccess: (
    snapshotData: (
      subscribers: Subscriber<BaseData, K>[],
      snapshot: Snapshots<T>
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

  batchUpdateSnapshots: (
    subscribers: Subscriber<BaseData, K>[],
    snapshots: Snapshots<T>
  ) => Promise<{ snapshots: Snapshots<T> }[]>;

  batchFetchSnapshotsRequest: (snapshotData: {
    subscribers: Subscriber<BaseData, K>[];
    snapshots: Snapshots<T>;
  }) => Promise<{
    subscribers: Subscriber<BaseData, K>[];
    snapshots: T[];
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
    snapshotData: (subscribers: Subscriber<BaseData, K>[]) => Promise<{
      subscribers: Subscriber<BaseData, K>[];
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

  getData: (data: Snapshot<T> | Snapshot<CustomSnapshotData>) => Promise<{
    data: Snapshots<T>;
  }>;

  batchFetchSnapshotsSuccess: (
    subscribers: Subscriber<BaseData, K>[],
    snapshots: Snapshots<T>
  ) => Snapshots<T>;

  batchFetchSnapshotsFailure: (payload: { error: Error }) => void;
  batchUpdateSnapshotsFailure: (payload: { error: Error }) => void;
  notifySubscribers: (
    subscribers: Subscriber<T, T>[],
    data: Partial<SnapshotStoreConfig<BaseData, any>>
  ) => Subscriber<BaseData, K>[];

  notify: (
    message: string,
    content: any,
    date: Date,
    type: NotificationType
  ) => void;
  [Symbol.iterator]: () => IterableIterator<T>;
  [Symbol.asyncIterator]: () => AsyncIterableIterator<T>;

  // New properties
  expirationDate?: Date;
  isExpired?: (() => boolean) | undefined;
  priority?: AllStatus;
  tags?: Tag[];
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

  flatMap: (
    value: SnapshotStoreConfig<BaseData, T>,
    index: number,
    array: SnapshotStoreConfig<BaseData, T>[]
  ) => void;

  setData: (data: K) => void;
  getState: () => any;
  setState: (state: any) => void;
  handleActions: () => void;

  setSnapshots: (snapshots: SnapshotStore<BaseData, K>[]) => void;
  mergeSnapshots: (snapshots: T[]) => void;
  reduceSnapshots: () => void;
  sortSnapshots: () => void;
  filterSnapshots: () => void;
  mapSnapshots: () => void;
  findSnapshot: () => void;
  subscribe: () => void;
  unsubscribe: () => void;
  fetchSnapshotFailure: (payload: { error: Error }) => void;
  generateId: () => string;
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
      set: (type: string, event: Event) => {
        console.log(`Event type: ${type}`);
        console.log("Event:", event);
        return null;
      },
      data: null,
      store: null,
      state: null,
      snapshots: [],

      handleSnapshot: (snapshot: Snapshot<T> | null, snapshotId: string) => {
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
        snapshotDataConfig: SnapshotStoreConfig<any, any>, // Adjust as per your definition
        category: string | CategoryProperties | undefined,
        callback: (snapshotStore: SnapshotStore<any,any>) => void
      ): BaseData => {
        // Adjust as per your definition
        console.log(
          `Creating snapshot with ID: ${id} in category: ${category}`,
          snapshotDataConfig
        );

        // Return a SnapshotStore<any,any> object
        return {
          id,
          data: snapshotDataConfig, // Ensure snapshotData is of type Data
          category,
          store: {} as SnapshotStore<any,any>,
          // other properties if any
        };
      },

      configureSnapshotStore: (snapshotStore: SnapshotStore<T, K>) => {
        console.log("Configuring snapshot store:", snapshotStore);
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
      initSnapshot: () => {
        console.log("Initializing snapshot.");
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
        store: SnapshotStore<any,any>
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

      addSnapshot: (snapshot: Snapshot<T>) => {
        console.log("Adding snapshot:", snapshot);
      },

      removeSnapshot: (snapshotToRemove: SnapshotStore<T, K>) => {
        console.log("Removing snapshot:", snapshotToRemove);
      },

      getSubscribers: async (
        subscribers: Subscriber<T, K>[],
        snapshots: Snapshots<T>
      ) => {
        console.log("Getting subscribers:", subscribers, snapshots);
        return { subscribers, snapshots };
      },
      addSubscriber: (subscriber: Subscriber<T, K>) => {
        console.log("Adding subscriber:", subscriber);
      },

      // Implementing the snapshot function
      snapshot: async (
        id: string,
        snapshotData: SnapshotStoreConfig<any, K>,
        category: string | CategoryProperties | undefined,
        callback: (snapshotStore: SnapshotStore<any,any>) => void
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
    },

    setSnapshot: (snapshot: SnapshotStore<T, K>) => {
      return Promise.resolve({ snapshot });
    },

    createSnapshot: (
      id: string,
      snapshotData: SnapshotStoreConfig<any, any>,
      category: string | CategoryProperties | undefined
      // store?: SnapshotStore<any,any>
    ): BaseData => {
      console.log(
        `Creating snapshot with ID: ${id} in category: ${category}`,
        snapshotData
      );

      // Return a Snapshot<Data> object
      return {
        id,
        data: snapshotData, // Ensure snapshotData is of type Data
        category,

        // other properties if any
      };
    },

    configureSnapshotStore: (snapshotStore: SnapshotStore<BaseData, K>) => {},

    createSnapshotSuccess: () => {},

    createSnapshotFailure: async (
      snapshot: Snapshot<BaseData>,
      error: Error
    ) => {
      const snapshotManager = await useSnapshotManager();
      const snapshotStore: SnapshotStore<BaseData, K>[] = snapshotManager.state as SnapshotStore<BaseData, K>[];

      if (snapshotStore && snapshotStore.length > 0) {
        const generatedSnapshotId = generateSnapshotId; // Assuming generateSnapshotId returns a string

        const config = {} as SnapshotStoreConfig<BaseData, any>[]; // Placeholder for config
        const configOption = {} as SnapshotStoreConfig<BaseData, any>; // Placeholder for configOption
        const userId = useSecureUserId()!.toString(); // Assuming useSecureUserId() returns a string
        const snapshotId = (await snapshotApi.getSnapshotId(generatedSnapshotId)).toString();

        // Example: Transforming snapshot.data (Map<string, BaseData>) to initialState (SnapshotStore<BaseData, K> | Snapshot<BaseData>)
        const initialState: SnapshotStore<BaseData, K> = {
          id: generatedSnapshotId,
          key: "key",
          topic: "topic",
          date: new Date(),
          configOption: configOption,
          config: config,
          subscription: {
            unsubscribe: (
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
          subscribeToSnapshots: () => {}, // Example placeholder
          // Add other required properties here
        };

        const updatedSnapshotData: Partial<SnapshotStoreConfig<BaseData, BaseData>> = {
          id: generatedSnapshotId.toString(),
          data: snapshot.data ?? undefined,
          timestamp: new Date(),
          snapshotId: generatedSnapshotId.toString(),
          category: "update" as any, // Adjust according to your actual category type
          // Ensure other required properties are included
        };

        // Check if snapshotStore[0] is defined and has the method setSnapshotData
        if (snapshotStore[0] && typeof snapshotStore[0].setSnapshotData === 'function') {
          snapshotStore[0].setSnapshotData(updatedSnapshotData);
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
    onSnapshot: (snapshotStore: SnapshotStore<BaseData, K>) => {},
    snapshotData: (snapshot: SnapshotStore<any,any>) => {
      return {  snapshots: []};
    },
    initSnapshot: () => {},
    // Implementation of fetchSnapshot function

    fetchSnapshot: async (
      id: string,
      category: string | CategoryProperties | undefined,
      timestamp: Date,
      snapshot: Snapshot<T>,
      data: T,
      delegate: SnapshotStoreConfig<BaseData, any>[]
    ): Promise<{
      id: any;
      category: string | CategoryProperties | undefined;
      timestamp: any;
      snapshot: Snapshot<T>;
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
          // dataStoreMethods: snapshotData.getDataStoreMethods(),
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

    clearSnapshot: () => {},

    updateSnapshot: async (
      snapshotId: string,
      data: Map<string, BaseData>,
      events: Record<string, CalendarEvent[]>,
      snapshotStore: SnapshotStore<T, K>,
      dataItems: RealtimeDataItem[],
      newData: T,
      payload: UpdateSnapshotPayload<T>,
      store: SnapshotStore<any,any>
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

    getSnapshots: async (
      category: string,
      snapshots: Snapshots<T>
    ) => {
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

    takeSnapshotSuccess: () => {},
    updateSnapshotFailure: (payload: { error: string }) => {
      console.log("Error updating snapshot:", payload);
    },
    takeSnapshotsSuccess: () => {},
    fetchSnapshotSuccess: () => {},
    updateSnapshotsSuccess: () => {},
    notify: () => {},

    updateMainSnapshots: async <T>(
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
            dataStoreMethods: snapshot.getDataStoreMethods(),
            delegate: snapshot.getDelegate(),
            subscriberId: snapshot.subscriberId,
            length: snapshot.length,

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
      subscriber: Subscriber<T,K>,
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
    batchFetchSnapshotsFailure: (payload: { error: Error }) => {},

    batchUpdateSnapshotsFailure: (payload: { error: Error }) => {},

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
          // Ensure all required properties of SnapshotStore<Snapshot<T>> are included
          id: snapshot.id!.toString(),
          snapshotId: this.snapshotId,
          taskIdToAssign: this.taskIdToAssign,
          clearSnapshots: this.clearSnapshots,
          key: this.key!,
          topic: this.topic!,
          initialState: this.initialState,
          configOption: this.configOption!,
          subscription: this.subscription!,
          initialConfig: this.initialConfig,
          config: this.config,
          category: snapshot.category,
          set: this.set,
          data: snapshot.data || undefined,
          store: this.store!,
          removeSubscriber: this.removeSubscriber,
          handleSnapshot: this.handleSnapshot,
          state: this.state,
          snapshots: this.snapshots,
          onInitialize: this.onInitialize,
          subscribers: this.subscribers,
          onError: this.onError,
          snapshot: this.snapshot,
          setSnapshot: this.setSnapshot!,
          createSnapshot: this.createSnapshot,
          configureSnapshotStore: this.configureSnapshotStore,
          createSnapshotSuccess: this.createSnapshotSuccess,
          createSnapshotFailure: this.createSnapshotFailure,
          batchTakeSnapshot: this.batchTakeSnapshot,
          onSnapshot: this.onSnapshot,
          snapshotData: this.snapshotData,
          initSnapshot: this.initSnapshot,
          clearSnapshot: this.clearSnapshot,
          updateSnapshot: this.updateSnapshot,
          getSnapshots: this.getSnapshots,
          takeSnapshot: this.takeSnapshot,
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
    ): void {},

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
      snapshots: Snapshots<any>
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
    [Symbol.iterator]: function* () {},
    [Symbol.asyncIterator]: async function* () {},
    [Symbol.toStringTag]: "SnapshotStore",
  },
];

const createSnapshotExample = async (
  id: string,
  snapshotData: SnapshotStoreConfig<any, Data>,
  category: string
): Promise<{ snapshot: SnapshotStore<BaseData, K> }> => {
  const currentConfig = snapshotConfig.find(
    (config) => (config.snapshotId as string) === id
  );

  return new Promise<{ snapshot: SnapshotStore<BaseData, K> }>(
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
    portfolioUpdates: () => {},
    tradeExecutions: () => {},
    marketUpdates: () => {},
    communityEngagement: () => {},
    unsubscribe: () => {},
    portfolioUpdatesLastUpdated: {} as ModifiedDate,
    getId: () => "1",
    triggerIncentives: () => {},
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
        // Update each snapshot in the subscriber
        const updatedSnapshots = await Promise.all(
          subscriber.snapshots.map(async (snapshot: Snapshot<BaseData>) => {
            return {
              ...snapshot,
              data: { ...snapshot.data }, // Ensure data is cloned correctly if needed
            };
          })
        );

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
            subscriberId:
              subscriber.getSubscriberId() ??
              SubscriberTypeEnum.PortfolioUpdates,
            subscriberType:
              subscriber.getSubscriberType!() ??
              SubscriberTypeEnum.PortfolioUpdates,
            subscriptionId: generateSubscriptionId,
            subscriptionType: SubscriptionTypeEnum.CommunityEngagement,
            // Example methods
            portfolioUpdates: () => subscriber,
            tradeExecutions: () => getTradeExecutions(),
            marketUpdates: () => getMarketUpdates(),
            communityEngagement: () => getCommunityEngagement(),
            triggerIncentives: () =>
              triggerIncentives({
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
          // Other methods and properties as needed
        };

        return subscriberObj; // Return updated subscriber object
      })
    );

    // Update and filter snapshots based on category and content
    const updatedSnapshots = Object.fromEntries(
      Object.entries(snapshots).map(([category, categorySnapshots]) => [
        category,
        categorySnapshots.flatMap((snapshot) =>
          Array.isArray(snapshot)
            ? snapshot.map((s) => ({
                ...s,
                data: s.content, // Example of mapping data to content property
              }))
            : []
        ),
      ])
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
export type { AuditRecord, RetentionPolicy, Subscribers };
