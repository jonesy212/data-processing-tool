import { SnapshotStoreSubset, Snapshots } from '@/app/components/snapshots/SnapshotStore';
// SnapshotConfig.ts
import { fetchData } from "@/app/api/ApiData";
import { endpoints } from "@/app/api/ApiEndpoints";
import { RealtimeDataItem } from "@/app/components/models/realtime/RealtimeData";
import UniqueIDGenerator from "@/app/generators/GenerateUniqueIds";
import { CategoryProperties } from '@/app/pages/personas/ScenarioBuilder';
import { useParams } from "next/navigation";
import {
  UserConfigExport,
  UserConfig as ViteUserConfig,
  defineConfig,
} from "vite";
import { ModifiedDate } from "../documents/DocType";
import { Data } from "../models/data/Data";
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
  triggerIncentives,
  updateProjectState,
} from "../utils/applicationUtils";
import * as snapshotApi from "./../../api/SnapshotApi";
import {
  getCommunityEngagement,
  getMarketUpdates,
  getTradeExecutions,
} from "./../../components/trading/TradingUtils";
import { sendNotification } from "./../../components/users/UserSlice";
import { CustomSnapshotData, Payload, Snapshot, UpdateSnapshotPayload } from "./LocalStorageSnapshotStore";
import SnapshotList from "./SnapshotList";
import SnapshotStore from "./SnapshotStore";
import { snapshot } from "./snapshot";
import { delegate, subscribeToSnapshots } from './snapshotHandlers';

type T = Snapshot<any>;
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

export interface SnapshotStoreConfig<
  T extends Data | undefined,
  K extends Data | undefined
> {
  id?: any;
  snapshotId: string;
  taskIdToAssign?: string;
  clearSnapshots?: any;
  key?: string;
  topic?: string;
  initialState:
    | SnapshotStore<T>
    | Snapshot<T>
    | null
    | undefined;
  configOption?: SnapshotStoreConfig<T, K> | null;
  subscription?: Subscription | null;
  initialConfig?: SnapshotStoreConfig<T, K> | null;
  config?: SnapshotStoreConfig<Snapshot<any>, any>[] | null;
  category: string;
  timestamp: string | Date | undefined;
  set?: (type: string, event: Event) => void | null;
  data?: T | SnapshotStoreConfig<T, K> | null;
  store?: SnapshotStoreConfig<T, K> | null;
  removeSubscriber?: (subscriber: Subscriber<Snapshot<T>>) => void;
  handleSnapshot: (
    snapshot: Snapshot<T> | null,
    snapshotId: string
  ) => void | null;
  state: Snapshot<Snapshot<T>>[] | Snapshot<T>[] | null;
  snapshots: SnapshotStore<Snapshot<T>>[];
  onInitialize?: () => void;
  subscribers: Subscriber<T>[];
  onError?: (error: Payload) => void;
  snapshot: (
    id: string,
    snapshotData: SnapshotStoreConfig<any, K>,
    category: string
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
    snapshotData: SnapshotStoreConfig<any, K>,
    category: string
  ) => Snapshot<Data>;
  configureSnapshotStore: (snapshot: SnapshotStore<T>) => void;
  createSnapshotSuccess: (snapshot: Snapshot<T>) => void;
  createSnapshotFailure: (error: Error) => void;
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
    snapshotStore: SnapshotStoreConfig<Snapshot<T>, T>,
    snapshotData: Snapshot<T>
  ) => void;
  clearSnapshot: () => void;
  handleSnapshotOperation: (
    snapshot: SnapshotStore<T>,
    data: SnapshotStoreConfig<T, K>
  ) => Promise<void>
  
  updateSnapshot: (
    snapshotId: string,
    data: SnapshotStore<T>,
    events: Record<string, CalendarEvent[]>,
    snapshotStore: SnapshotStore<T>,
    dataItems: RealtimeDataItem[],
    newData: K,
    payload: UpdateSnapshotPayload<K>,
    store: SnapshotStore<any>
  ) => void;
  getSnapshots: (
    category: string,
    snapshots: Snapshots<T>
  ) => Promise<{
    snapshots: Snapshots<T>;
  }>;

  takeSnapshot: (snapshot: SnapshotStore<T>) => Promise<{
    snapshot: SnapshotStore<T>;
  }>; 

  addSnapshot: (
    snapshot: T,
    subscribers: Subscriber<K | CustomSnapshotData>[]
  ) => void;

  addSnapshotSuccess: (
    snapshot: T,
    subscribers: Subscriber<K | CustomSnapshotData>[]
  ) => void;

  removeSnapshot: (snapshotToRemove: SnapshotStore<T>) => void;

  getSubscribers: (
    subscribers: Subscriber<Snapshot<K>>[],
    snapshots: Snapshots<K>
  ) => Promise<{
    subscribers: Subscriber<Snapshot<T>>[];
    snapshots: Snapshots<T>;
  }>;
  addSubscriber: (
    subscriber: Subscriber<Snapshot<T>>,
    data: T,
    snapshotConfig: SnapshotStoreConfig<Snapshot<T>, T>[],
    delegate: SnapshotStoreSubset<T>,
    sendNotification: (type: NotificationTypeEnum) => void
  ) => void;
  validateSnapshot: (data: Snapshot<T>) => boolean;
  getSnapshot: (
    snapshot: () =>
      | Promise<{
          category: any;
          timestamp: any;
          id: any;
          snapshot: SnapshotStore<Snapshot<T>>;
          data: T;
        }>
      | undefined
  ) => Promise<SnapshotStore<Snapshot<T>>>;

  getAllSnapshots: (
    data: (
      subscribers: Subscriber<Snapshot<T>>[],
      snapshots: Snapshots<T>
    ) => Promise<Snapshots<T>>
  ) => Promise<Snapshots<T>>;

  takeSnapshotSuccess: (snapshot: SnapshotStore<T>) => void;
  updateSnapshotFailure: (payload: { error: string }) => void;
  takeSnapshotsSuccess: (snapshots: Snapshots<T>) => void;
  fetchSnapshot: (
    snapshot: () =>
      | Promise<{
        id: any;
          category: any;
          timestamp: any;
          snapshot: SnapshotStore<Snapshot<T>>;
          data: T;
        }>
      | undefined
    ) => Promise<SnapshotStore<Snapshot<T>>>;
  setSnapshotSuccess: (snapshot: SnapshotStore<T>,  subscribers: ((data: Snapshot<T>) => void)[]) => void;
  updateSnapshotSuccess: () => void;
  updateSnapshotsSuccess: (
    snapshotData: (
      subscribers: Subscriber<Snapshot<T>>[],
      snapshot: Snapshots<T>
    ) => void
  ) => void;
  fetchSnapshotSuccess: (
    snapshotData: (
      subscribers: Subscriber<Snapshot<T>>[],
      snapshot: Snapshots<T>
    ) => void
  ) => void;

  updateSnapshotForSubscriber: (
    subscriber: Subscriber<K | undefined>,
    snapshots: Snapshots<T>
  ) => Promise<{
    subscribers: Subscriber<K | undefined>[];
    snapshots: T[];
  }>;

  updateMainSnapshots: (snapshots: Snapshots<T>) => Promise<Snapshots<T>>;

  batchUpdateSnapshots: (
    subscribers: Subscriber<K | undefined>[],
    snapshots: Snapshots<T>
  ) => Promise<{ snapshots: Snapshots<T> }[]>; // Corrected return type

  batchFetchSnapshotsRequest: (snapshotData: {
    subscribers: Subscriber<Snapshot<T>>[];
    snapshots: Snapshots<T>;
  }) => Promise<{
    subscribers: Subscriber<Snapshot<T>>[];
    snapshots: T[];
  }>;

  batchTakeSnapshotsRequest: (snapshotData: any) => Promise<{
    snapshots: Snapshots<T>;
  }>;

  batchUpdateSnapshotsSuccess?: (
    subscribers: Subscriber<Snapshot<T>>[],
    snapshots: Snapshots<T>
  ) => {
    snapshots: Snapshots<T>;
  }[];

  batchUpdateSnapshotsRequest: (
    snapshotDatas: (
      subscribers: Subscriber<Snapshot<T>>[],
      snapshots: Snapshots<T>
    ) => Promise<{
      subscribers: Subscriber<Snapshot<T>>[];
      snapshots: Snapshots<T>;
    }>
  ) => {
    subscribers: Subscriber<Snapshot<T>>[];
    snapshots: Snapshots<T>;
  };

  batchFetchSnapshots: (
    subscribers: Subscriber<Snapshot<T>>[],
    snapshots: Snapshots<T>
  ) => Promise<{
    subscribers: Subscriber<Snapshot<T>>[];
    snapshots: Snapshots<T>;
  }>;

  getData: (data: Snapshots<T>) => Promise<{
    data: Snapshots<T>;
  }>;

  batchFetchSnapshotsSuccess: (
    subscribers: Subscriber<Snapshot<T>>[],
    snapshots: Snapshots<T>
  ) => Snapshots<T>;

  batchFetchSnapshotsFailure: (payload: { error: Error }) => void;
  batchUpdateSnapshotsFailure: (payload: { error: Error }) => void;
  notifySubscribers: (
    subscribers: Subscriber<CustomSnapshotData | T>[],
    data: Snapshot<T>
  ) => Subscriber<Snapshot<T>>[];

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
  isExpired?: () => boolean;
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
    value: SnapshotStoreConfig<Snapshot<T>, T>,
    index: number,
    array: SnapshotStoreConfig<Snapshot<T>, T>[]
  ) => void;

  setData: (data: K) => void;
  getState: () => any;
  setState: (state: any) => void;
  handleActions: () => void;

  setSnapshots: (snapshots: T[]) => void;
  mergeSnapshots: (snapshots: T[]) => void;
  reduceSnapshots: () => void;
  sortSnapshots: () => void;
  filterSnapshots: () => void;
  mapSnapshots: () => void;
  findSnapshot: () => void;
  subscribe: () => void;
  unsubscribe: () => void;
  fetchSnapshotFailure: () => void;
  generateId: () => void;
}

const snapshotConfig: SnapshotStoreConfig<T, Data>[] = [
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
    initialState: undefined,
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
      initialState: undefined,
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
        category: string
      ): Snapshot<any> => { // Adjust as per your definition
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

      updateSnapshot: (
        snapshotId: string,
        data: SnapshotStore<Snapshot<T>>,
        events: Record<string, CalendarEvent[]>,
        snapshotStore: SnapshotStore<T>,
        dataItems: RealtimeDataItem[],
        newData: Data,
        payload: UpdateSnapshotPayload<T>,
        store: SnapshotStore<any>
      ) => {
        console.log(
          `Updating snapshot with ID: ${snapshotId}`,
          newData,
          payload,
        );
      },
      getSnapshots: async (category: string, snapshots: Snapshots<T>) => {
        console.log(`Getting snapshots in category: ${category}`, snapshots);
        return { snapshots };
      },

      takeSnapshot: async (snapshot: SnapshotStore<T> ) => {
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
        subscribers: Subscriber<Snapshot<Data>>[],
        snapshots: Snapshots<T>
      ) => {
        console.log("Getting subscribers:", subscribers, snapshots);
        return { subscribers, snapshots };
      },
      addSubscriber: (subscriber: Subscriber<T>) => {
        console.log("Adding subscriber:", subscriber);
      },
      snapshot: async (
        id: string,
        snapshotData: SnapshotStoreConfig<any, Data>,
        category: string
      ) => {
        try {
          snapshotConfig[0].createSnapshot(id, snapshotData, category);
          const { snapshot: newSnapshot } = await snapshotConfig[0].snapshot(
            id,
            snapshotData,
            category
          );
          return { snapshot: newSnapshot };
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
      category: string,
      // store?: SnapshotStore<any>
    ): Snapshot<any> => {
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

    configureSnapshotStore: (
      snapshotStore: SnapshotStore<Snapshot<Data>>
    ) => { },
   
    createSnapshotSuccess: () => {},
    createSnapshotFailure: (error: Error) => {}, // Change 'any' to 'Error' if you handle specific error types
    batchTakeSnapshot: async (
      snapshotStore: SnapshotStore<Snapshot<Data>>,
      snapshots: Snapshots<Snapshot<Data>>
    ) => {
      return { snapshots: [] };
    },
    onSnapshot: (snapshotStore: SnapshotStore<Snapshot<Data>>) => {},
    snapshotData: (snapshot: SnapshotStore<Snapshot<Data>>) => {
      return { snapshot: [] };
    },
    initSnapshot: () => {},
    fetchSnapshot: async () => {
      const snapshotData = await snapshot(); // Assuming snapshot is a function returning a promise
    
      return {
        id: snapshotData.id, // Assuming id is part of the snapshot data
        key: snapshotData.key, // Example: Replace with actual properties
        topic: snapshotData.topic,
        date: new Date(), // Example: Replace with actual date logic
        // Include other required properties here
    
        category: snapshotData.category,
        timestamp: snapshotData.timestamp,
        snapshot: snapshotData.snapshot,
        data: snapshotData.data,
      };
    },
    clearSnapshot: () => {},
    updateSnapshot: async (
      snapshotId: string,
      data: SnapshotStore<Snapshot<T>>,
      events: Record<string, CalendarEvent[]>,
      snapshotStore: SnapshotStore<T>,
      dataItems: RealtimeDataItem[],
      newData: Data,
      payload: UpdateSnapshotPayload<T>
    ) => {
      return { snapshot: [] };
    },
    getSnapshots: async (
      category: string,
      snapshots: Snapshots<Snapshot<Data>>
    ) => {
      return { snapshots };
    },
    takeSnapshot: async (snapshot: SnapshotStore<Snapshot<Data>>) => {
      return { snapshot: snapshot };
    },

    getAllSnapshots: async (
      data: (
        subscribers: Subscriber<Snapshot<T>>[],
        snapshots: Snapshots<T>
      ) => Promise<Snapshots<T>>
    ) => {
      // Implement your logic here
      const subscribers: Subscriber<Snapshot<T>>[] = []; // Example
      const snapshots: Snapshots<T> = []; // Example
      return data(subscribers, snapshots);
    },

    takeSnapshotSuccess: () => {},
    updateSnapshotFailure: (
      payload: { error: string }) => {
      console.log("Error updating snapshot:", payload);
    },
    takeSnapshotsSuccess: () => {},
    fetchSnapshotSuccess: () => {},
    updateSnapshotsSuccess: () => {},
    notify: () => {},

    updateMainSnapshots: async (snapshots: Snapshots<Snapshot<Data>>) => {
      try {
        const updatedSnapshots: Snapshots<Snapshot<Data>> = snapshots.map(
          (snapshot) => ({
            ...snapshot,
            message: "Main snapshot updated",
            content: "Updated main content",
            description: snapshot.description || undefined,
          })
        );
        return Promise.resolve(updatedSnapshots);
      } catch (error) {
        console.error("Error updating main snapshots:", error);
        throw error;
      }
    },

    batchFetchSnapshots: async (
      subscribers: Subscriber<Snapshot<Snapshot<Data>>>[],
      snapshots: Snapshots<Data>
    ) => {
      return {
        subscribers: [],
        snapshots: [],
      };
    },

    batchUpdateSnapshots: async (
      subscribers: Subscriber<Data | undefined>[],
      snapshots: Snapshots<Data>
    ) => {
      // Perform batch update logic
      return [
        { snapshots: [] }, // Example empty array, adjust as per your logic
      ];
    },

    batchFetchSnapshotsRequest: async (snapshotData: {
      subscribers: Subscriber<Snapshot<Snapshot<Data>>>[];
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

        let snapshots: Snapshots<Data> = [];
        if (Array.isArray(fetchedSnapshots)) {
          snapshots = fetchedSnapshots.map((snapshot) => ({
            id: snapshot.id,
            timestamp: snapshot.timestamp,
            category: snapshot.category,
            message: snapshot.message,
            content: snapshot.content,
            data: snapshot.data,
            store: snapshot.store,
          }));
        } else {
          snapshots = fetchedSnapshots.getSnapshots().map((snapshot: Snapshot<Data>) => ({
            id: snapshot.id,
            timestamp: snapshot.timestamp,
            category: snapshot.category,
            message: snapshot.message,
            content: snapshot.content,
            data: snapshot.data,
            store: snapshot.store
          }));
        }

        snapshots = snapshots.map((snapshot: Snapshot<Data>) => ({
          id: snapshot.id,
          timestamp: snapshot.timestamp,
          category: snapshot.category,
          message: snapshot.message,
          content: snapshot.content,
          data: { ...snapshot.data },
          store: snapshot.store
        }));

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
        const subscriberId = subscriber.getId();
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
      subscribers: Subscriber<Snapshot<Data>>[],
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
      const subscriberId = subscriber.getId();
      if (subscriberId !== undefined) {
        const currentConfig = snapshotConfig.find(
          (config) => config.snapshotId === "snapshot1" // Adjust the condition to match your use case
        );
        if (currentConfig && currentConfig.subscribers) {
          const filteredSubscribers = currentConfig.subscribers.filter(
            (sub) => sub.getId() !== subscriberId
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
        const snapshotWithValidTimestamp: SnapshotStore<Snapshot<T>> = {
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
          data: snapshot.data!,
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
          createSnapshot: this.createSnapshot!,
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
      subscribers: Subscriber<Snapshot<Data>>[],
      snapshots: Snapshot<Data>[] 
        ): Promise<{
      subscribers: Subscriber<Snapshot<Snapshot<Data>>>[];
      snapshots: Snapshot<Snapshot<Data>>[] 
      
    }> => {
      const data = Object.entries(snapshots).map(
        ([category, categorySnapshots]) => {
          const subscribersForCategory = subscribers.filter(
            (subscriber) => subscriber.getData()?.category === category
          );
          return {
            category,
            subscribers: subscribersForCategory,
            snapshots: categorySnapshots,
          };
        }
      );
      
      const generateSubscriptionId = UniqueIDGenerator.generateID(
        "snap",
        "subscription",
        NotificationTypeEnum.Snapshot
      );

      const params = useParams()

      const updatedSubscribers = await Promise.all(
        
        subscribers.map(async (subscriber) => {
          const updatedSnapshots = await Promise.all(
            subscriber.snapshots.map(async (snapshot: Snapshot<Data>) => {
              return {
                ...snapshot,
                data: { ...snapshot.data },
              };
            })
          );

          const subscriberObj: Subscriber<Snapshot<Snapshot<Data>>> = {
            ...subscriber,
            id: subscriber.getId(),
            optionalData: subscriber.getOptionalData(),
            fetchSnapshotIds: subscriber.getFetchSnapshotIds(),
            snapshotIds: subscriber.getSnapshotIds(),
            getEmail: subscriber.getEmail(),
            getOptionalData: subscriber.getOptionalData(),
            getData: subscriber.getData(),
            getName: subscriber.getName(),
            determineCategoryts: subscriber.getDetermineCategory(data),

            name: "subscriber",
            data: {
              ...subscriber.getId,
              snapshots: updatedSnapshots,
            },
            email: updatedSnapshots[0].data.email,
            snapshots: updatedSnapshots,
            subscriberId: subscriber.getSubscriberId(),
            subscribers: [],
            subscription: {
              subscriberId:
                subscriber.getSubscriberId() ??
                SubscriberTypeEnum.PortfolioUpdates,
              subscriberType:
                subscriber.getSubscriberType!() ??
                SubscriberTypeEnum.PortfolioUpdates,
              subscriptionId: generateSubscriptionId,
              subscriptionType: SubscriptionTypeEnum.CommunityEngagement,
              portfolioUpdates: () => subscriber,
              portfolioUpdatesLastUpdated: null,
              unsubscribe: () => subscriber,
              tradeExecutions: () => getTradeExecutions(),
              marketUpdates: () => getMarketUpdates(),
              communityEngagement: () => getCommunityEngagement(),
              triggerIncentives: () =>
                triggerIncentives({
                  userId: subscriber.getSubscriberId(),
                  incentiveType: SubscriberTypeEnum.PortfolioUpdates,
                  params
                }),
                determineCategory: () => subscriber.getDetermineCategory(data),
            },
            getId: () => subscriber.getId(),
            subscribe: () => {},
            unsubscribe: () => {},
            onSnapshotCallbacks: [],
            onErrorCallbacks: [],
            onUnsubscribeCallbacks: [],
            state: null,
            getSubscriberId: () => subscriber.getSubscriberId(),
            notifyEventSystem: () => {},
            updateProjectState: () => {},
            logActivity: () => {},
            triggerIncentives: () => {},
            toSnapshotStore: (
              initialState: Snapshot<Snapshot<Data>>,
              snapshotConfig: SnapshotStoreConfig<
                Snapshot<Snapshot<Data>>,
                Snapshot<Data>
              >[]
            ):
              | SnapshotStore<Snapshot<Snapshot<Snapshot<Data>>>>
              | undefined => {
              let snapshotString: string | undefined;
              if (initialState !== undefined) {
                snapshotString = initialState._id?.toString();
              }

              if (snapshotString !== undefined) {
                const category = process.argv[3] as keyof CategoryProperties;

                return new SnapshotStore<Snapshot<Snapshot<Snapshot<Data>>>>(
                  snapshot,
                  category,
                  new Date(),
                  type, 
                  initialState,
                  snapshotConfig,
                  subscribeToSnapshots,
                  delegate,
                );
              }

              // Handle the case where 'initialState' is undefined or cannot be converted to a string
              return undefined;
            },
            receiveSnapshot: () => {},
            getState: () => null,
            onError: () => {},
            // triggerError: () => { },
            onUnsubscribe: () => {},
            onSnapshot: () => {},
            onSnapshotError: () => {},
            triggerOnSnapshot: () => {},
            onSnapshotUnsubscribe: () => {},

            async processNotification(
              id: string,
              message: string,
              snapshotContent: Snapshot<Data>,
              date: Date,
              type: NotificationType
            ): Promise<void> {
              return new Promise<void>((resolve, reject) => {
                const snapshotData: Snapshot<Snapshot<Data>> = {
                  id,
                  timestamp: date,
                  category: "subscriberCategory",
                  content: snapshotContent,
                  data: snapshotContent,
                  type,
                };
                try {
                  if (this.notify) {
                    this.notify(snapshotData);
                  }
                  if (sendNotification) {
                    sendNotification(NotificationTypeEnum.DataLoading);
                  }
                  resolve();
                } catch (error: any) {
                  console.error("Error occurred:", error);
                  reject(error);
                }
              });
            },
          };

          return subscriberObj;
        })
      );

      const updatedSnapshots = Object.fromEntries(
        
        Object.entries(snapshots).map(([category, categorySnapshots]) => [
          category,
          categorySnapshots
            .filter((snapshot): snapshot is Array<Snapshot<Data>> =>
              isArray(snapshot)
            )
            .flatMap((snapshot: Snapshot<Data>[]) =>
              snapshot.map((s) => ({
                ...s,
                data: s.content,
              }))
            ),
        ])
      );

      return {
        subscribers: updatedSubscribers,
        snapshots: updatedSnapshots,
      };
    },

    addSubscriber: function <T extends Data | CustomSnapshotData>(
      subscriber: Subscriber<Snapshot<T>>,
      data: T,
      snapshotConfig: SnapshotStoreConfig<Snapshot<T>, T>[],
      delegate: SnapshotStoreSubset<Snapshot<T>, T>,
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
            snapshot: SnapshotStore<Snapshot<Snapshot<Data>>>;
            data: Data;
          }>
        | undefined
    ): Promise<SnapshotStore<Snapshot<Snapshot<Data>>>> {
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
    batchTakeSnapshotsRequest: (snapshotData: any) => {
      console.log("Batch snapshot taking requested.");
      return Promise.resolve({ snapshots: [] });
    },
    updateSnapshotSuccess: () => {
      console.log("Snapshot updated successfully.");
    },
    batchUpdateSnapshotsSuccess: (
      subscribers: Subscriber<Snapshot<Snapshot<Data>>>[],
      snapshots: Data[]
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

// Example usage
const createSnapshotExample = async (
  id: string,
  snapshotData: SnapshotStoreConfig<any, Data>,
  category: string
) => {
  const currentConfig = snapshotConfig.find(
    (config) => (config.snapshotId as unknown as string) === id
  );

  if (currentConfig && currentConfig.createSnapshot) {
    try {
      await currentConfig.createSnapshot(id, snapshotData, category);
      const { snapshot: newSnapshot } = await currentConfig.snapshot(
        id,
        snapshotData,
        category
      );
      return { snapshot: newSnapshot };
    } catch (error) {
      console.error("Error creating snapshot:", error);
      throw error;
    }
  } else {
    throw new Error("Snapshot configuration not found.");
  }
  
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
  }
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
    triggerIncentives: () => { },
    determineCategory: (data: any) => data.category,
  },
  "subscriberId",
  notifyEventSystem,
  updateProjectState,
  logActivity,
  triggerIncentives,
);

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

