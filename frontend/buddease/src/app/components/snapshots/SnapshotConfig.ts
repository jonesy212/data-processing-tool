import { generateDID } from './../../utils/web3/didUtils';
 // SnapshotConfig.ts
import { defineConfig } from "vite";

import { Data } from "../models/data/Data";
import { SnapshotState } from "../state/redux/slices/SnapshotSlice";
import { NotificationType, NotificationTypeEnum } from "../support/NotificationContext";
import SnapshotStore, { Payload, Snapshot, Snapshots, snapshotStore } from "./SnapshotStore";
import * as snapshotApi from "./../../api/SnapshotApi";
import SnapshotList from "./SnapshotList";
import { useDispatch } from "react-redux";
import { SnapshotActions } from "./SnapshotActions";
import { Member } from "../models/teams/TeamMembers";
import { Subscriber } from "../users/Subscriber";
import { Subscription } from "../subscriptions/Subscription";
import { fetchData } from "@/app/api/ApiData";
import { endpoints } from "@/app/api/ApiEndpoints";
import { target } from "@/app/api/EndpointConstructor";
import { batchFetchSnapshotsRequest } from "./snapshotHandlers";
import SnapshotComponent from "../libraries/ui/components/SnapshotComponent";
import UniqueIDGenerator from "@/app/generators/GenerateUniqueIds";
import { SubscriptionTypeEnum } from '../models/data/StatusType';

type T = Snapshot<any>; // Define T as Snapshot<any>

// Define the SnapshotStoreConfig interface
export interface SnapshotStoreConfig<Data> {
  id?: any;
  clearSnapshots?: any;
  key?: string;
  configOption?: SnapshotStoreConfig<Data> | null;
  subscription?: Subscription | null;
  initialState?: SnapshotStore<Data> | Snapshot<Data> | null | undefined;
  category: string;
  timestamp: Date;
  set?: (type: string, event: Event) => void | null;
  data?: Data | SnapshotStoreConfig<Data> | null;
  store?: SnapshotStoreConfig<Data> | null;
  handleSnapshot: (
    snapshot: Snapshot<Data> | null,
    snapshotId: string
  ) => void | null;
  state: Snapshot<Data> | null;
  snapshots: T[];
  onInitialize?: () => void;
  onError?: (error: Payload) => void;
  snapshot: (
    id: string,
    snapshotData: SnapshotStoreConfig<any>,
    category: string
  ) => Promise<{
    snapshot: Snapshot<Data>;
  }>;
  subscribers: Subscriber<Snapshot<Data>>[];

  setSnapshot?: (snapshot: SnapshotStore<Data>) => void;
  createSnapshot: (id: string, snapshotData: SnapshotStoreConfig<any>, category: string) => void;
  configureSnapshotStore: (snapshot: SnapshotStore<Data>) => void;
  createSnapshotSuccess: () => void;
  createSnapshotFailure: (error: Error) => void;
  batchTakeSnapshot: (
    snapshot: SnapshotStore<Data>,
    snapshots: Snapshots<Data>
  ) => Promise<{
    snapshots: Snapshots<Data>;
  }>;
  onSnapshot: (snapshot: SnapshotStore<Data>) => void | undefined;
  onSnapshots: Snapshots<Data>;
  snapshotData: (snapshot: SnapshotStore<Data>) => {
    snapshot: Snapshots<Data>;
  };
  initSnapshot: () => void;
  clearSnapshot: () => void;
  updateSnapshot: (snapshot: SnapshotStore<Data>) => Promise<{
    snapshot: Snapshots<Data>;
  }>;
  getSnapshots: (
    category: string,
    snapshots: Snapshots<Data>
  ) => Promise<{
      snapshots: Snapshots<Data>;
  }>;
    
  takeSnapshot: (snapshot: SnapshotStore<Data>) => Promise<{
    snapshot: Snapshots<Data>;
  }>;
    addSnapshot: (snapshot: SnapshotStore<Data>) => void;
    
  removeSnapshot: (snapshotToRemove: SnapshotStore<Data>) => void;

    getSubscribers: (
      subscribers:Subscriber<Snapshot<T>>[],
      snapshots: Snapshots<T>
    ) => Promise<{
      subscribers: Subscriber<Snapshot<Data>>[];
      snapshots: Snapshots<Data>;
  }>
  addSubscriber: (subscriber: Subscriber<Snapshot<Data>>) => void;
  validateSnapshot: (data: Snapshot<Data>) => boolean;
  getSnapshot: (
    snapshot: () =>
      Promise<{
          category: any;
          timestamp: any;
          id: any;
          snapshot: SnapshotStore<Snapshot<Data>>;
          data: Data;
        }>
      | undefined
  ) => Promise<SnapshotStore<Snapshot<Data>>>;
  getAllSnapshots: (
    data: (
      subscribers: Subscriber<Snapshot<Data>>[],
      snapshots: Snapshots<Data>
    ) => Promise<Snapshots<Data>>
  ) => Promise<Snapshots<Data>>;
  takeSnapshotSuccess: () => void;
  updateSnapshotFailure: (payload: { error: string }) => void;
  takeSnapshotsSuccess: (snapshots: Snapshots<Data>) => void;
  fetchSnapshot: () => void;
  updateSnapshotSuccess: () => void;
  updateSnapshotsSuccess: (
    snapshotData: (
      subscribers: Subscriber<Snapshot<Data>>[],
      snapshot: Snapshots<Data>
    ) => void
  ) => void;
  fetchSnapshotSuccess: (
    snapshotData: (
      subscribers: Subscriber<Snapshot<Data>>[],
      snapshot: Snapshots<Data>
    ) => void
  ) => void;

    updateSnapshotForSubscriber: (
        subscriber: Subscriber<T>,
        snapshots: Snapshots<T>
    ) => Promise<{
        subscribers: Subscriber<Snapshot<Data>>[];
        snapshots: T[];
    }>;

  updateMainSnapshots: (snapshots: Snapshots<Data>) => Promise<Snapshots<Data>>;

  batchUpdateSnapshots: (
    subscribers: Subscriber<T>[],
    snapshots: Snapshots<Data>
  ) => Promise<
    {
      snapshots: Snapshots<Data>;
    }[]
  >;

  batchFetchSnapshotsRequest: (snapshotData: {
    subscribers: Subscriber<Snapshot<Data>>[];
      snapshots: Snapshots<Data>;
  }) => Promise<{
    subscribers: Subscriber<Snapshot<Data>>[];
    snapshots: T[];
  }>;
    
  batchTakeSnapshotsRequest: (snapshotData: any) => Promise<{
    snapshots: Snapshots<Data>;
  }>;

  batchUpdateSnapshotsSuccess?: (
    subscribers: Subscriber<Snapshot<Data>>[],
    snapshots: Snapshots<Data>
  ) => {
    snapshots: Snapshots<Data>;
  }[];

  batchUpdateSnapshotsRequest: (
    snapshotDatas: (
      subscribers: Subscriber<Snapshot<Data>>[],
      snapshots: Snapshots<Data>
    ) => Promise<{
      subscribers: Subscriber<Snapshot<Data>>[];
      snapshots: Snapshots<Data>;
    }>
  ) => {
    subscribers: Subscriber<Snapshot<Data>>[];
    snapshots: Snapshots<Data>;
  };

  batchFetchSnapshots(
    subscribers: Subscriber<Snapshot<Data>>[],
    snapshots: Snapshots<Data>
  ): Promise<{
    subscribers: Subscriber<Snapshot<Data>>[];
    snapshots: Snapshots<Data>;
  }>;

  getData: () => Promise<Snapshots<Data>>;

  batchFetchSnapshotsSuccess: (
    subscribers: Subscriber<Snapshot<Data>>[],
    snapshots: Snapshots<Data>
  ) => Snapshots<Data>;

  batchFetchSnapshotsFailure: (payload: { error: Error }) => void;
  batchUpdateSnapshotsFailure: (payload: { error: Error }) => void;
  notifySubscribers: (
    subscribers: Subscriber<Snapshot<Data>>[],
    data: Snapshot<Data>
  ) => Subscriber<Snapshot<Data>>[];

  notify: (
    message: string,
    content: any,
    date: Date,
    type: NotificationType
  ) => void;
  [Symbol.iterator]: () => IterableIterator<T>;
  [Symbol.asyncIterator]: () => AsyncIterableIterator<T>;
}

// Initial snapshotConfig implementation
const snapshotConfig: SnapshotStoreConfig<Snapshot<Data>> = {
  id: null,
  clearSnapshots: null,
  key: "",
  initialState: undefined,
  category: "",
  timestamp: new Date(),
  subscription: null,
  configOption: {
    id: null,
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
    handleSnapshot: () => { },
    state: null,
    snapshots: [],
    snapshot: async (id, snapshotData, category) => {
      try {
        // Create a new snapshot using the createSnapshot function from snapshotConfig
        await snapshotConfig.createSnapshot(id, snapshotData, category);
        const { snapshot: newSnapshot } = await snapshotConfig.snapshot(id, snapshotData, category);
        return { snapshot: newSnapshot };
      } catch (error) {
        console.error('Error creating snapshot:', error);
        throw error; // Rethrow the error
      }
    },
  },
    subscribers: [],
    setSnapshot: (snapshot) => {
      return { snapshot: [] };
    },
    createSnapshot: (additionalData) => {},
    configureSnapshotStore: (snapshot) => {},
    createSnapshotSuccess: () => {},
    createSnapshotFailure: (error) => {},
    batchTakeSnapshot: (snapshot, snapshots) => {
      return Promise.resolve({ snapshots: [] });
    },
    onSnapshot: (snapshot: SnapshotStore<Snapshot<Data>>) => {},
    snapshotData: (snapshot) => {
      return { snapshot: [] };
    },
    initSnapshot: () => {},
    fetchSnapshot: async () => {
      return { snapshot: [] };
    },
    clearSnapshot: () => {},
    updateSnapshot: (snapshot) => {
      return Promise.resolve({ snapshot: [] });
    },
    getSnapshots: (category: string, snapshots: T[]) => {
      return Promise.resolve({snapshots});
    },
    takeSnapshot: (snapshot) => {
      return Promise.resolve({ snapshot: [] });
    },
    getAllSnapshots: async (data) => {
      return [];
    },
    takeSnapshotSuccess: () => {},
    updateSnapshotFailure: (payload) => {},
    takeSnapshotsSuccess: () => {},
    fetchSnapshotSuccess: () => {},
    updateSnapshotsSuccess: () => {},
    notify: () => {},

    updateMainSnapshots: async (snapshots: T[]) => {
      try {
        // Logic to update the main snapshots
        const updatedSnapshots: T[] = snapshots.map(
          (snapshot) => ({
            ...snapshot,
            message: "Main snapshot updated",
            content: "Updated main content",
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
      subscribers: Subscriber<Snapshot<Data>>[],
      snapshots: Snapshots<Data>
    ) => {
      return [];
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
            // If fetchedSnapshots is an array, it's already in the desired format
            snapshots = fetchedSnapshots.map(snapshot => ({
              id: snapshot.id,
              timestamp: snapshot.timestamp,
              category: snapshot.category,
              message: snapshot.message,
              content: snapshot.content,
              data: snapshot.data,
            }));
          } else {
            // If fetchedSnapshots is a SnapshotList, convert it to the desired format
            snapshots = fetchedSnapshots.getSnapshots().map(snapshot => ({
              id: snapshot.id,
              timestamp: snapshot.timestamp,
              category: snapshot.category,
              message: snapshot.value.message,
              content: snapshot.value.content,
              data: snapshot.value.data,
            }));
          }
      
          // Correcting the type of snapshots to match Snapshots<Data>
          snapshots = snapshots.map(snapshot => ({
            id: snapshot.id,
            timestamp: snapshot.timestamp,
            category: snapshot.category,
            message: snapshot.message,
            content: snapshot.content,
            data: { ...snapshot.data }
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
        subscriber: Subscriber<Snapshot<Snapshot<Data>>>,
        snapshots: T[]
      ): Promise<{
        subscribers: Subscriber<Snapshot<Snapshot<Data>>>[];
        snapshots: T[]
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
          const updatedSnapshot: Snapshot<Snapshot<Data>> = {
            id: subscriberId,
            message: "Updated for subscriber",
            content: snapshotData.content,
            data: snapshotData.data,
            timestamp: snapshotData.timestamp,
            category: snapshotData.category,
          };
      
          // Find the index of the snapshot in the array
          const snapshotIndex = snapshots.findIndex(
            (snapshot) => snapshot.id === subscriberId
          );
      
          // Create a new array with the updated snapshot
          const updatedSnapshots: Snapshot<Snapshot<Snapshot<Data>>>[] = [...snapshots];
          updatedSnapshots[snapshotIndex] = updatedSnapshot as Snapshot<Snapshot<Snapshot<Data>>>;
      
          // Return the updated snapshot wrapped in the expected structure
          return {
            subscribers: [subscriber],
            snapshots: updatedSnapshots, // Update to use the array of snapshots
          };
        } catch (error) {
          console.error("Error updating snapshot for subscriber:", error);
          throw error;
        }
      },
      
      

    batchFetchSnapshotsSuccess: () => {
      return [];
    },
    batchFetchSnapshotsFailure: (payload) => {},
    batchUpdateSnapshotsFailure: (payload) => {},
    notifySubscribers: () => {
      return [];
    },

removeSnapshot: function (
  snapshotToRemove: SnapshotStore<Snapshot<Data>>
): void {
  this.snapshots = this.snapshots.filter(
    (snapshot) => snapshot.id !== snapshotToRemove.snapshotId
  );
},



  addSnapshot: function (snapshot: SnapshotStore<Snapshot<Data>>): void {
    // Ensure that the snapshot parameter has the necessary properties
    if (
      "data" in snapshot &&
      "timestamp" in snapshot &&
      "category" in snapshot &&
      typeof snapshot.category === "string"
    ) {
      // Cast the timestamp property to Date
      const snapshotWithValidTimestamp = {
        ...snapshot,
        timestamp: new Date(snapshot.timestamp as string),
      };
      this.snapshots.push(snapshotWithValidTimestamp);
    } else {
      console.error("Invalid snapshot format");
    }
  },
    
      

    getSubscribers: async function (
        subscribers: Subscriber<Snapshot<Snapshot<Data>>>[],
        snapshots: Snapshots<Snapshot<Data>>
    ): Promise<{
        subscribers: Subscriber<Snapshot<Snapshot<Data>>>[];
        snapshots: Snapshots<Snapshot<Data>>;
    }> {
        const generateUniqueId = UniqueIDGenerator.generateID('snap', 'subscriber', NotificationTypeEnum.Snapshot);
        const generateSubscriptionId = UniqueIDGenerator.generateID('snap', 'subscription', NotificationTypeEnum.Snapshot);
  


      
        return {
            subscribers: subscribers.map(subscriber => {
                const updatedSnapshots = subscriber.snapshots.map((snapshot: Snapshot<Data>) => ({
                    ...snapshot,
                    data: {
                        ...snapshot.data,
                    },
                }));
          
                // Create a new object that matches the Subscriber<Snapshot<Snapshot<Data>>> type
                const subscriberObj: Subscriber<Snapshot<Snapshot<Data>>> = {
                    ...subscriber,
                    snapshots: updatedSnapshots,
                    subscriberId: subscriber.getSubscriberId(),
                    subscribers: [],
                    subscription: {
                        // subscriptionId: generateSubscriptionId,                        
                        subscriberId: subscriber.getSubscriberId(),
                        subscriberType: subscriber.getSubscriberType(),
                        subscriptionId: generateSubscriptionId,
                        subscriptionType: SubscriptionTypeEnum.CommunityEngagement,
                        portfolioUpdates: () => subscriber,
                        // portfolioUpdatesCount:() => subscriber.getPortfolioUpdatesCount(),
                      portfolioUpdatesLastUpdated: null,
                      unsubscribe: () => subscriber,
                      tradeExecutions: () => getTradeExecutions(),
                      marketUpdates: () => getMarketUpdates(),
                      communityEngagement: () => getCommunityEngagement(),
                    },
                    getId: () => subscriber.getId(),
                    subscribe: () => { },
                    unsubscribe: () => { },
                    onSnapshotCallbacks: [],
                    onErrorCallbacks: [],
                    onUnsubscribeCallbacks: [],
                    state: null,
                    getSubscriberId: () => subscriber.getSubscriberId(),
                    notifyEventSystem: () => { },
                    updateProjectState: () => { },
                    logActivity: () => { },
                    triggerIncentives: () => { },
                    toSnapshotStore: () => { },
                    receiveSnapshot: () => { },
                    getState: () => null,
                    onError: () => { },
                    triggerError: () => { },
                    onUnsubscribe: () => { },
                    onSnapshot: () => { },
                    onSnapshotError: () => { },
                    onSnapshotUnsubscribe: () => { },
                };
          
                return subscriberObj;
            }),
            snapshots: snapshots.map(snapshot => ({
                ...snapshot,
                data: {
                    ...snapshot.data,
                },
            })),
        };
    },
    
      
      
    addSubscriber: function (
      subscriber: Subscriber<Snapshot<Snapshot<Data>>>
    ): void {
      this.subscribers.push(subscriber);
    },
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
        snapshot: () => Promise<{
          category: any;
          timestamp: any;
          id: any;
          snapshot: SnapshotStore<Snapshot<Snapshot<Data>>>;
          data: Data;
        }> | undefined
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
      snapshots: T[]
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

    [Symbol.iterator]: function* () {},
    [Symbol.asyncIterator]: async function* () {},
  
};

// Function to get the project ID from an environment variable or use a default value
function getProjectId() {
  return process.env.PROJECT_ID || "defaultProject";
}

const projectId = getProjectId();

export default defineConfig({
  snapshotConfig,
});





// // Example usage
const johnSubscriber = new Subscriber("1234567890", "ABCDEF123456", undefined, undefined, undefined, () => {});

// Accessing subscriberId and subscriptionId
console.log("Subscriber ID:", johnSubscriber.getSubscriberId());
console.log("Subscription ID:", johnSubscriber.getSubscriptionId());