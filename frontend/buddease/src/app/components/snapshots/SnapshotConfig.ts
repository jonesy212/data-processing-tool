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
import { CategoryProperties } from "@/app/pages/personas/ScenarioBuilder";
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
import useSnapshotManager from "../hooks/useSnapshotManager";
import { generateSnapshotId } from "../utils/snapshotUtils";
import { fetchCategoryByName } from "@/app/api/CategoryApi";
import determineFileCategory, {
  fetchSnapshotData,
} from "../libraries/categories/determineFileCategory";
import { snapshotType } from "../typings/YourSpecificSnapshotType";
import { config } from "@fortawesome/fontawesome-svg-core";

type T = BaseData;
type K = any;
type Subscribers = Subscriber<CustomSnapshotData | Data>[];
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
  id?: any;
  snapshotId: string;
  taskIdToAssign?: string;
  clearSnapshots?: any;
  key?: string;
  topic?: string;
  initialState: Map<string, T> | null;

  configOption?: SnapshotStoreConfig<T, K> | null;
  subscription?: Subscription | null;
  initialConfig?: SnapshotStoreConfig<T, K> | null;
  config?: SnapshotStoreConfig<BaseData, any>[] | null;
  category: string | CategoryProperties | undefined;
  timestamp: string | Date | undefined;
  store?: SnapshotStoreConfig<T, K> | null;
  data?: T | SnapshotStoreConfig<T, K> | null;
  set?: (type: string, event: Event) => void | null;
  removeSubscriber?: (subscriber: Subscriber<BaseData>) => void;
  handleSnapshot: (
    snapshot: Snapshot<T> | null,
    snapshotId: string
  ) => void | null;
  state: Snapshot<BaseData>[] | Snapshot<T>[] | null;
  snapshots: SnapshotStore<BaseData>[];
  onInitialize?: () => void;
  subscribers: Subscriber<T>[];
  onError?: (error: Payload) => void;
  snapshot: (
    id: string,
    snapshotData: SnapshotStoreConfig<any, K>,
    category: string | CategoryProperties | undefined,
    callback: (snapshot: Snapshot<Data>) => void
  ) => Promise<{
    snapshot: SnapshotStore<T>;
  }>;

  actions?: {
    takeSnapshot: (
      snapshot: SnapshotStore<T>,
      data: SnapshotStoreConfig<T, K>
    ) => Promise<Snapshot<T>>;

    updateSnapshot: (
      snapshot: SnapshotStore<T>,
      data: SnapshotStoreConfig<T, K>
    ) => Promise<Snapshot<T>>;

    deleteSnapshot: (
      snapshot: SnapshotStore<T>,
      data: SnapshotStoreConfig<T, K>
    ) => Promise<Snapshot<T>>;
  };

  addSnapshotFailure?: (error: Error) => void;

  setSnapshot?: (snapshot: SnapshotStore<T>) => void;
  createSnapshot: (
    id: string,
    snapshotData: SnapshotStoreConfig<any, Data>,
    category: string | CategoryProperties | undefined,
    callback: (snapshot: Snapshot<Data>) => void
  ) => void;
  configureSnapshotStore: (snapshot: SnapshotStore<T>) => void;
  createSnapshotSuccess: (snapshot: Snapshot<T>) => void;
  createSnapshotFailure: (
    snapshot: Snapshot<BaseData>,
    error: any
  ) => Promise<void>;
  batchTakeSnapshot: (
    snapshot: SnapshotStore<T>,
    snapshots: Snapshots<T>
  ) => Promise<{
    snapshots: Snapshots<T>;
  }>;
  onSnapshot: (snapshot: SnapshotStore<T>) => void | undefined;
  onSnapshots: Snapshots<T> | null;
  snapshotData: (snapshot: SnapshotStore<T>) => {
    snapshot: Snapshots<T>;
  };
  initSnapshot: (
    snapshotConfig: SnapshotStoreConfig<T, K>, // Use K instead of T for snapshotConfig
    snapshotData: SnapshotStore<T> // Ensure snapshotData matches SnapshotStore<T>
  ) => void;
  clearSnapshot: () => void;
  handleSnapshotOperation: (
    snapshot: SnapshotStore<T>,
    data: SnapshotStoreConfig<T, K>
  ) => Promise<void>;
  displayToast: (message: string) => void;
  addToSnapshotList: (
    snapshotStore: SnapshotStore<any>,
    subscribers: Subscriber<Data | CustomSnapshotData>[]
  ) => void;
  fetchInitialSnapshotData: () => Promise<Snapshot<Data>[]>;
  updateSnapshot: (
    snapshotId: string,
    data: SnapshotStore<T>,
    events: Record<string, CalendarEvent[]>,
    snapshotStore: SnapshotStore<T>,
    dataItems: RealtimeDataItem[],
    newData: T,
    payload: UpdateSnapshotPayload<T>,
    store: SnapshotStore<any>
  ) => Promise<{ snapshot: Snapshot<Data> }>;

  getSnapshots: (
    category: string,
    snapshots: Snapshots<T>
  ) => Promise<{
    snapshots: Snapshots<T>;
  }>;

  takeSnapshot: (snapshot: SnapshotStore<T>) => Promise<{
    snapshot: SnapshotStore<T>;
  }>;

  addSnapshot: (snapshot: T, subscribers: Subscriber<BaseData>[]) => void;

  addSnapshotSuccess: (
    snapshot: T,
    subscribers: Subscriber<BaseData>[]
  ) => void;

  removeSnapshot: (snapshotToRemove: SnapshotStore<T>) => void;

  getSubscribers: (
    subscribers: Subscriber<BaseData>[],
    snapshots: Snapshots<K>
  ) => Promise<{
    subscribers: Subscriber<BaseData>[];
    snapshots: Snapshots<T>;
  }>;

  addSubscriber: (
    subscriber: Subscriber<BaseData>,
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
          snapshot: SnapshotStore<BaseData>;
          data: T;
        }>
      | undefined
  ): Promise<SnapshotStore<BaseData>>;

  getAllSnapshots: (
    data: (
      subscribers: Subscriber<BaseData>[],
      snapshots: Snapshots<T>
    ) => Promise<Snapshots<T>>
  ) => Promise<Snapshots<T>>;

  takeSnapshotSuccess: (snapshot: SnapshotStore<T>) => void;
  updateSnapshotFailure: (payload: { error: string }) => void;
  takeSnapshotsSuccess: (snapshots: T) => void;
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
    snapshot: SnapshotStore<T>,
    subscribers: ((data: Snapshot<T>) => void)[]
  ) => void;
  setSnapshotFailure: (error: any) => void;
  updateSnapshotSuccess: () => void;
  updateSnapshotsSuccess: (
    snapshotData: (
      subscribers: Subscriber<BaseData>[],
      snapshot: Snapshots<T>
    ) => void
  ) => void;
  fetchSnapshotSuccess: (
    snapshotData: (
      subscribers: Subscriber<BaseData>[],
      snapshot: Snapshots<T>
    ) => void
  ) => void;

  updateSnapshotForSubscriber: (
    subscriber: Subscriber<BaseData>,
    snapshots: Snapshots<T>
  ) => Promise<{
    subscribers: Subscriber<BaseData>[];
    snapshots: T[];
  }>;

  updateMainSnapshots: (snapshots: Snapshots<T>) => Promise<Snapshots<T>>;

  batchUpdateSnapshots: (
    subscribers: Subscriber<BaseData>[],
    snapshots: Snapshots<T>
  ) => Promise<{ snapshots: Snapshots<T> }[]>; // Corrected return type

  batchFetchSnapshotsRequest: (snapshotData: {
    subscribers: Subscriber<BaseData>[];
    snapshots: Snapshots<T>;
  }) => Promise<{
    subscribers: Subscriber<BaseData>[];
    snapshots: T[];
  }>;

  batchTakeSnapshotsRequest: (snapshotData: any) => Promise<{
    snapshots: Snapshots<T>;
  }>;

  batchUpdateSnapshotsSuccess?: (
    subscribers: Subscriber<BaseData>[],
    snapshots: Snapshots<T>
  ) => {
    snapshots: Snapshots<T>;
  }[];

  batchUpdateSnapshotsRequest: (
    snapshotData: (subscribers: Subscriber<BaseData>[]) => Promise<{
      subscribers: Subscriber<BaseData>[];
      snapshots: Snapshots<T>;
    }>
  ) => {
    subscribers: Subscriber<BaseData>[];
    snapshots: Snapshots<T>;
  };

  batchFetchSnapshots: (
    subscribers: Subscriber<BaseData>[],
    snapshots: Snapshots<T>
  ) => Promise<{
    subscribers: Subscriber<BaseData>[];
    snapshots: Snapshots<T>;
  }>;

  getData: (data: Snapshot<T> | Snapshot<CustomSnapshotData>) => Promise<{
    data: Snapshots<T>;
  }>;

  batchFetchSnapshotsSuccess: (
    subscribers: Subscriber<BaseData>[],
    snapshots: Snapshots<T>
  ) => Snapshots<T>;

  batchFetchSnapshotsFailure: (payload: { error: Error }) => void;
  batchUpdateSnapshotsFailure: (payload: { error: Error }) => void;
  notifySubscribers: (
    subscribers: Subscriber<CustomSnapshotData | T>[],
    data: Snapshot<T>
  ) => Subscriber<BaseData>[];

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

  setSnapshots: (snapshots: SnapshotStore<BaseData>[]) => void;
  mergeSnapshots: (snapshots: T[]) => void;
  reduceSnapshots: () => void;
  sortSnapshots: () => void;
  filterSnapshots: () => void;
  mapSnapshots: () => void;
  findSnapshot: () => void;
  subscribe: () => void;
  unsubscribe: () => void;
  fetchSnapshotFailure: () => void;
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
        snapshotData: SnapshotStoreConfig<any, any>, // Adjust as per your definition
        category: string | CategoryProperties | undefined,
        callback: (snapshot: Snapshot<Data>) => void
      ): BaseData => {
        // Adjust as per your definition
        console.log(
          `Creating snapshot with ID: ${id} in category: ${category}`,
          snapshotData
        );

        // Return a Snapshot<Data> object
        return {
          id,
          data: snapshotData, // Ensure snapshotData is of type Data
          category,
          store: {} as SnapshotStore<any>,
          // other properties if any
        };
      },

      configureSnapshotStore: (snapshot: SnapshotStore<T>) => {
        console.log("Configuring snapshot store:", snapshot);
      },
      batchTakeSnapshot: async (
        snapshot: SnapshotStore<T>,
        snapshots: Snapshots<T>
      ) => {
        console.log("Batch taking snapshots:", snapshot, snapshots);
        return { snapshots };
      },
      onSnapshot: (snapshot: SnapshotStore<T>) => {
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
        data: SnapshotStore<BaseData>,
        events: Record<string, CalendarEvent[]>,
        snapshotStore: SnapshotStore<T>,
        dataItems: RealtimeDataItem[],
        newData: Snapshot<Data>,
        payload: UpdateSnapshotPayload<T>,
        store: SnapshotStore<any>
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

      takeSnapshot: async (snapshot: SnapshotStore<T>) => {
        console.log("Taking snapshot:", snapshot);
        return { snapshot: snapshot }; // Adjust according to your snapshot logic
      },

      addSnapshot: (snapshot: Snapshot<T>) => {
        console.log("Adding snapshot:", snapshot);
      },

      removeSnapshot: (snapshotToRemove: SnapshotStore<T>) => {
        console.log("Removing snapshot:", snapshotToRemove);
      },

      getSubscribers: async (
        subscribers: Subscriber<T>[],
        snapshots: Snapshots<T>
      ) => {
        console.log("Getting subscribers:", subscribers, snapshots);
        return { subscribers, snapshots };
      },
      addSubscriber: (subscriber: Subscriber<T>) => {
        console.log("Adding subscriber:", subscriber);
      },

      // Implementing the snapshot function
      snapshot: async (
        id: string,
        snapshotData: SnapshotStoreConfig<any, any>,
        category: string | CategoryProperties | undefined,
        callback: (snapshot: Snapshot<Data>) => void
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

            const { snapshot: newSnapshot } = await snapshotConfig[0].snapshot(
              id,
              snapshotData,
              resolvedCategory,
              callback
            );

            return { snapshot: newSnapshot };
          } else {
            throw new Error("Category is undefined");
          }
        } catch (error) {
          console.error("Error creating snapshot:", error);
          throw error;
        }
      },
    },

    setSnapshot: (snapshot: SnapshotStore<T>) => {
      return Promise.resolve({ snapshot });
    },

    createSnapshot: (
      id: string,
      snapshotData: SnapshotStoreConfig<any, any>,
      category: string | CategoryProperties | undefined
      // store?: SnapshotStore<any>
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

    configureSnapshotStore: (snapshotStore: SnapshotStore<BaseData>) => {},

    createSnapshotSuccess: () => {},

    createSnapshotFailure: async (
      snapshot: Snapshot<BaseData>,
      error: Error
    ) => {
      const snapshotManager = await useSnapshotManager();
      const snapshotStore: SnapshotStore<BaseData>[] =
        snapshotManager.state as SnapshotStore<BaseData>[]; // Ensure state matches the type

      if (snapshotStore && snapshotStore.length > 0) {
        // Generate snapshot ID
        const generatedSnapshotId = generateSnapshotId; // Call generateSnapshotId as a function

        const config = {} as SnapshotStoreConfig<BaseData, any>[];
        const configOption = {} as SnapshotStoreConfig<BaseData, any>;
        // Example: Transforming snapshot.data (Map<string, BaseData>) to initialState (SnapshotStore<BaseData> | Snapshot<BaseData>)
        const initialState: SnapshotStore<BaseData> = {
          id: generatedSnapshotId,
          key: "key",
          topic: "topic",
          date: new Date(),
          configOption: configOption,
          config: config,
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
            determineCategory: determineFileCategory,
          },
          // Add other required properties here
        };

        const updatedSnapshotData: Snapshot<BaseData> = {
          id: generatedSnapshotId,
          data: snapshot.data,
          timestamp: new Date(),
          category: "update",
        };

        // Check if snapshotStore[0] is defined and has the method setSnapshotData
        if (snapshotStore[0] && snapshotStore[0].setSnapshotData) {
          snapshotStore[0].setSnapshotData(updatedSnapshotData); // Update the snapshot data using the setSnapshotData method
        }

        // Check if snapshotStore is an array
        if (Array.isArray(snapshotStore)) {
          snapshotStore.unshift(updatedSnapshotData); // Add the updated snapshot to the beginning of the snapshot store
        }

        // Update the snapshot store through a setter method if available
        // Example: await setSnapshotManager(newState); // Ensure this method exists and correctly updates state
      }
    }, // Change 'any' to 'Error' if you handle specific error types
    batchTakeSnapshot: async (
      snapshotStore: SnapshotStore<BaseData>,
      snapshots: Snapshots<Snapshot<Data>>
    ) => {
      return { snapshots: [] };
    },
    onSnapshot: (snapshotStore: SnapshotStore<BaseData>) => {},
    snapshotData: (snapshot: SnapshotStore<BaseData>) => {
      return { snapshot: [] };
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
        const snapshotData = (await fetchSnapshotData(
          category
        )) as SnapshotData;

        // Check if snapshotData is defined
        if (!snapshotData) {
          throw new Error("Snapshot data is undefined.");
        }

        // Create a new SnapshotStore instance
        const snapshotStore = new SnapshotStore<BaseData>(
          snapshotData.snapshot,
          snapshotData.category,
          snapshotData.timestamp,
          initialState,
          snapshotConfig,
          snapshotType,
          snapshotData.data,
          delegate,
          dataStoreMethods
        );

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
      data: SnapshotStore<T>,
      events: Record<string, CalendarEvent[]>,
      snapshotStore: SnapshotStore<T>,
      dataItems: RealtimeDataItem[],
      newData: T,
      payload: UpdateSnapshotPayload<T>,
      store: SnapshotStore<any>
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
      snapshots: Snapshots<Snapshot<Data>>
    ) => {
      return { snapshots };
    },
    takeSnapshot: async (snapshot: SnapshotStore<BaseData>) => {
      return { snapshot: snapshot };
    },

    getAllSnapshots: async (
      data: (
        subscribers: Subscriber<BaseData>[],
        snapshots: Snapshots<T>
      ) => Promise<Snapshots<T>>
    ) => {
      // Implement your logic here
      const subscribers: Subscriber<BaseData>[] = []; // Example
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
      subscribers: Subscriber<BaseData>[],
      snapshots: Snapshots<Data>
    ) => {
      return {
        subscribers: [],
        snapshots: [],
      };
    },

    batchUpdateSnapshots: async (
      subscribers: Subscriber<BaseData>[],
      snapshots: Snapshots<Data>
    ) => {
      // Perform batch update logic
      return [
        { snapshots: [] }, // Example empty array, adjust as per your logic
      ];
    },

    batchFetchSnapshotsRequest: async (snapshotData: {
      subscribers: Subscriber<BaseData>[];
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
            timestamp: snapshot.timestamp,
            category: snapshot.category,
            message: snapshot.message,
            content: snapshot.content,
            data: snapshot.data, // Ensure data is directly assigned if it's already in the correct format
            store: snapshot.store,
            metadata: snapshot.metadata,
            initialState: new Map(), // Adjust this based on your actual data structure
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
      subscriber: Subscriber<K | undefined>,
      snapshots: Snapshots<Snapshot<Data>>
    ): Promise<{
      subscribers: Subscriber<any | any>[];
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
      subscribers: Subscriber<BaseData>[],
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
        const snapshotWithValidTimestamp: SnapshotStore<BaseData> = {
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
          data: snapshot.data,
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
      subscribers: Subscriber<BaseData>[],
      snapshots: Snapshots<Data>
    ): Promise<{
      subscribers: Subscriber<BaseData>[];
      snapshots: Snapshots<BaseData>[];
    }> => {
      const data = Object.entries(snapshots)
        .map(([category, categorySnapshots]) => {
          const subscribersForCategory = subscribers.filter(
            (subscriber) => subscriber.getData()?.category === category
          );
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
        })
        .flat();

      return {
        subscribers,
        snapshots: data,
      };
    },

    addSubscriber: function <T extends Data | CustomSnapshotData>(
      subscriber: Subscriber<BaseData>,
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
            snapshot: SnapshotStore<BaseData>;
            data: Data;
          }>
        | undefined
    ): Promise<SnapshotStore<BaseData>> {
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
      snapshotConfig: SnapshotStoreConfig<BaseData, Data>[]
    ): Promise<SnapshotStore<BaseData>> {
      try {
        const snapshot = snapshotConfig.find(
          (config) => config.snapshotId === snapshotId
        );
        if (!snapshot) {
          throw new Error("Snapshot not found");
        }
        return snapshot;
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
      subscribers: Subscriber<BaseData>[],
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
): Promise<{ snapshot: SnapshotStore<Snapshot<Data>> }> => {
  const currentConfig = snapshotConfig.find(
    (config) => (config.snapshotId as string) === id
  );

  return new Promise<{ snapshot: SnapshotStore<Snapshot<Data>> }>(
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
  triggerIncentives
);

// Example of asynchronous function using async/await
const updateSubscribersAndSnapshots = async (
  subscribers: Subscriber<BaseData>[],
  snapshots: Snapshots<Data>
): Promise<{
  subscribers: Subscriber<BaseData>[];
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
    const updatedSubscribers = await Promise.all(
      subscribers.map(async (subscriber) => {
        // Update each snapshot in the subscriber
        const updatedSnapshots = await Promise.all(
          subscriber.snapshots.map(async (snapshot) => {
            return {
              ...snapshot,
              data: { ...snapshot.data }, // Ensure data is cloned correctly if needed
            };
          })
        );

        // Create a new Subscriber object with updated data
        const subscriberObj: Subscriber<BaseData> = {
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
          ): SnapshotStore<BaseData>[] | undefined => {
            // Implement logic to convert subscriber data to SnapshotStore instance
            return undefined; // Replace with actual implementation
          },
          processNotification: async (
            id: string,
            message: string,
            snapshotContent: Snapshot<Data>,
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
