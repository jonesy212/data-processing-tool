// snapshotStoreConfigInstance.ts
import { fetchCategoryByName } from "@/app/api/CategoryApi";
import { endpoints } from "@/app/api/endpointConfigurations";
import { addSnapshot } from "@/app/api/SnapshotApi";
import { CategoryProperties } from "@/app/pages/personas/ScenarioBuilder";
import operation from "antd/es/transfer/operation";
import { Subscriber } from "ethers";
import { fetchData } from "pdfjs-dist";
import { config } from "process";
import { string } from "prop-types";
import { options } from "sanitize-html";
import { Data } from "./components/models/data/Data";
import { SnapshotWithCriteria, SnapshotData, CustomSnapshotData, SnapshotStoreProps } from ".";
import { CalendarEvent } from "../calendar/CalendarEvent";
import { CreateSnapshotStoresPayload } from "../database/Payload";
import { ModifiedDate } from "../documents/DocType";
import { FileCategory } from "../documents/FileType";
import { SnapshotManager, useSnapshotManager } from "../hooks/useSnapshotManager";
import determineFileCategory, { fetchFileSnapshotData } from "../libraries/categories/determineFileCategory";
import { Category } from "../libraries/categories/generateCategoryProperties";
import { BaseData } from "../models/data/Data";
import { T, K } from "../models/data/dataStoreMethods";
import { NotificationPosition, StatusType } from "../models/data/StatusType";
import { RealtimeDataItem } from "../models/realtime/RealtimeData";
import { DataStoreWithSnapshotMethods } from "../projects/DataAnalysisPhase/DataProcessing/ DataStoreMethods";
import { clearSnapshot } from "../state/redux/slices/SnapshotSlice";
import CalendarManagerStoreClass from "../state/stores/CalendarEvent";
import { NotificationType, NotificationTypeEnum } from "../support/NotificationContext";
import { getTradeExecutions, getMarketUpdates, getCommunityEngagement } from "../trading/TradingUtils";
import { AuditRecord } from "../users/Subscriber";
import { portfolioUpdates, triggerIncentives } from "../utils/applicationUtils";
import { generateSnapshotId, notify } from "../utils/snapshotUtils";
import { VersionHistory } from "../versions/VersionData";
import { FetchSnapshotPayload } from "./FetchSnapshotPayload";
import { SnapshotsArray, Snapshot, Snapshots, UpdateSnapshotPayload, Payload } from "./LocalStorageSnapshotStore";
import { ConfigureSnapshotStorePayload, SnapshotConfig } from "./SnapshotConfig";
import { batchTakeSnapshotsRequest, batchUpdateSnapshotsRequest, batchFetchSnapshotsSuccess, batchFetchSnapshotsFailure, batchUpdateSnapshotsSuccess, batchUpdateSnapshotsFailure, batchTakeSnapshot, handleSnapshotSuccess, onSnapshot, initSnapshot, fetchSnapshot, getAllSnapshots, updateSnapshotFailure, updateSnapshotsSuccess, batchFetchSnapshots, batchUpdateSnapshots, batchFetchSnapshotsRequest, notifySubscribers, updateSnapshotSuccess } from "./snapshotHandlers";
import SnapshotList, { SnapshotItem } from "./SnapshotList";
import { getSnapshots, takeSnapshot, removeSnapshot } from "./snapshotOperations";
import SnapshotStore, { initialState } from "./SnapshotStore";
import { SnapshotStoreConfig } from "./SnapshotStoreConfig";
import SnapshotStoreSubset from "./SnapshotStoreSubset";
import { subscribeToSnapshotImpl, updateSnapshot } from "./subscribeToSnapshotsImplementation";
import { UnifiedMetaDataOptions } from "@/app/configs/database/MetaDataOptions";
import { DataStore } from "../projects/DataAnalysisPhase/DataProcessing/DataStore";




const snapshotStoreConfigInstance: SnapshotStoreConfig<any, any>[] = [
    {
      id: null,
      snapshotId: "snapshot1",
      key: "key1",
      priority: "active",
      topic: "topic1",
      status: StatusType.Inactive,
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
    //
    tags: [
        //   tagName: "tag1",
        //   attribs: {},
        //   id: '',
        //   name: '',
        //   color: '',
        //   relatedTags: []
      // 
    ],
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
          id: string,
          snapshotId: string,
          snapshot: T | null,
          snapshotData: T,
          category: symbol | string | Category | undefined,
          callback: (snapshot: T) => void,
          snapshots: SnapshotsArray<T>,
          type: string,
          event: Event,
          snapshotContainer?: T,
          snapshotStoreConfig?: SnapshotStoreConfig<T, K>
        ): Promise<Snapshot<T, K> | null> => {
          return new Promise((resolve, reject) => {
            try {
              // Log event type and details
              console.log(`Event type: ${type}`);
              console.log("Event:", event);
        
              // Check if the snapshot already exists
              if (snapshot) {
                console.log(`Handling existing snapshot with ID: ${snapshotId}`, snapshot);
        
                // Optionally, process or update the existing snapshot
                if (snapshotContainer) {
                  // Assuming snapshotContainer might be used to update or merge with the existing snapshot
                  console.log("Merging snapshot with container", snapshotContainer);
                  Object.assign(snapshot, snapshotContainer);
                }
        
                // Callback with the existing snapshot
                callback(snapshot);
        
                // Resolve with the updated snapshot
                resolve({
                  ...snapshot,
                  snapshotStoreConfig: snapshotStoreConfig || snapshot.snapshotStoreConfig,
                } as Snapshot<T, K>);
              } else {
                console.log(`Creating a new snapshot with ID: ${snapshotId}`);
        
                // Create a new snapshot based on the provided snapshotData
                const newSnapshot: Snapshot<T, K> = {
                  id: snapshotId,
                  data: snapshotData,
                  category: category || "default",
                  createdAt: new Date().toISOString(),
                  snapshotStoreConfig: snapshotStoreConfig || snapshot.snapshotStoreConfig,
                    versionInfo: {} as VersionHistory,
                  
                    getSnapshotItems: () => [],
                      defaultSubscribeToSnapshots: () => {
                        // Implement the logic for defaultSubscribeToSnapshots
                      },
                    transformSubscriber: (sub: Subscriber<any, any>) => {
                        // Implement the logic for transformSubscriber
                        return sub
                      },
                      transformDelegate: () => {
                        // Implement the logic for transformDelegate
                      },
                    // Add any other properties needed for your Snapshot
                };
        
                // If there's a snapshot store config, we may need to save the snapshot to the store
                if (snapshotStoreConfig) {
                  console.log("Using snapshot store config", snapshotStoreConfig);
        
                  // Optionally, add the new snapshot to the snapshot store
                  snapshots.set(snapshotId, newSnapshot);
                }
        
                // Callback with the new snapshot
                callback(snapshotData);
        
                // Resolve with the new snapshot
                resolve(newSnapshot);
              }
            } catch (error) {
              console.error("Error handling snapshot:", error);
              reject(error);
            }
          });
        },
  
        onInitialize: () => {
          console.log("Snapshot store initialized.");
          return null;
        },
        onError: (error: any) => {
          console.error("Error in snapshot store:", error);
        },
  
        createSnapshot: (
          id: string,
          snapshotData: Snapshot<T, K>, // Use Snapshot instead of Map
          category: symbol | string | Category | undefined,
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
            newData: null,
            stores: [],
            timestamp: new Date(),
            handleSnapshot: (
                id: string,
                snapshotId: string,
                snapshot: T | null,
                snapshotData: T,
                category: symbol | string | Category | undefined,
                callback: (snapshot: T) => void,
                snapshots: Snapshots<Data>,
                type: string,
                event: Event,
                snapshotContainer?: T,
                snapshotStoreConfig?: SnapshotStoreConfig<T, K>,
              ): Promise<Snapshot<Data, any> | null> => {
                return new Promise((resolve, reject) => {
                  // Ensure snapshotDataStore is defined before accessing getSnapshot
                  if (!snapshotDataStore) {
                    reject(new Error("snapshotDataStore is not defined"));
                    return;
                  }
              
                  // Use the snapshotApi to fetch the snapshot by ID
                  snapshotApi.fetchSnapshotById(id)
                    .then(snapshotResult => {
                      // Separate the logic for retrieving the snapshot
                      const getSnapshotResult = {
                        category: snapshotResult.category,
                        timestamp: snapshotResult.timestamp,
                        id: snapshotResult.id,
                        snapshot: snapshotResult.snapshots,
                        snapshotStore: snapshotResult.snapshotStore,
                        data: snapshotResult.data,
                      };
              
                      // Now, call the getSnapshot method and pass the result
                      return snapshotDataStore.getSnapshot(async () => getSnapshotResult);
                    })
                    .then(snapshot => {
                      if (snapshot) {
                        // Handle the snapshot
                        return snapshot.handleSnapshot(snapshotId, snapshot, snapshots, type, event)
                          .then(() => resolve(snapshot));
                      } else {
                        reject(new Error(`Snapshot with ID '${snapshotId}' not found.`));
                      }
                    })
                    .catch(error => {
                      reject(error);
                    });
                });
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
                  snapshotId: string,
                  payload: FetchSnapshotPayload<K>,
                  snapshotStore: SnapshotStore<T, K>,
                  payloadData: T | Data,
                  category: symbol | string | Category | undefined,
                  timestamp: Date,
                  data: T,
                  delegate: SnapshotWithCriteria<T, K>[]            ) => void
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
                  newData: null,
                  stores: [],
                  timestamp: new Date(),
                  handleSnapshot: (
                    snapshotId: string,
                    snapshot: Snapshot<Data, any> | null,
                    snapshots: Snapshots<Data>,
                    type: string,
                    event: Event
                  ): Promise<Snapshot<Data, any> | null> => {
                    return new Promise((resolve, reject) => {
                      try{
                        console.log(`Handling snapshot with ID: ${snapshotId}`, snapshot);
                      if (snapshot) {
                        console.log("Snapshot:", snapshot);
                      }
                      resolve(snapshot);
                      } catch (error) {
                        reject(error);
                      }
                     })
  
                  },
                  events: {
                    eventRecords: {
                      add: [],
                      remove: [],
                      update: [],
                    },
                    callbacks: (snapshots: Snapshots<T>) => {
                      console.log("Fetching snapshot:", snapshots);
                      return snapshots;
                    },
                  },
                  eventIds: [],
                  on: (event: string, callback: (snapshot: Snapshot<T, K>) => void) => {
                    if (!eventHandlers[event]) {
                      eventHandlers[event] = [];
                    }
                    eventHandlers[event].push(callback);
                    console.log(`Event '${event}' registered.`);
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
                    data: Map<string, Snapshot<Data, any>>,
                    events: Record<string, CalendarEvent<T, K>[]>,
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
                    storeId: number,
                    snapshotId: string,
                    snapshot: Snapshot<T, K>,
                    type: string,
                    event: Event
                  ) => null,
                  addStore: (
                    storeId: number,
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
                    storeId: number,
                    store: SnapshotStore<T, K>,
                    snapshotId: string,
                    snapshot: Snapshot<T, K>,
                    type: string,
                    event: Event
                  ): Snapshot<T, K> {
                    console.log("Removing store:", storeId, store, snapshotId, snapshot, type, event);
                    return snapshot;
                  },
                })
              }
            },
            configureSnapshotStore: (
              snapshotStore: SnapshotStore<T, K>,
              snapshotId: string,
              data: Map<string, Snapshot<T, K>>,
              events: Record<string, CalendarEvent<T, K>[]>,
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
              data: Map<string, Snapshot<T, K>>,
              events: Record<string, CalendarEvent<T, K>[]>,
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
            updateSnapshotSuccess: (
              snapshotId: string,
              snapshotManager: SnapshotManager<T, T>,
              snapshot: Snapshot<T, T>,
               payload?: { data?: any; } | undefined
            ) => {
              console.log("Updated snapshot:", snapshot);
            },
            updateSnapshotItem: (snapshotItem: SnapshotItem<T, K>) => {
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
        category: symbol | string | Category | undefined,
        callback: (snapshotStores: SnapshotStore<any, any>[]) => void,
        snapshotDataConfig?: SnapshotStoreConfig<any, any>[] // Adjust as per your definition
      ): SnapshotStore<any, any>[] | null => {
        console.log(`Creating snapshot with ID: ${id} in category: ${category}`, snapshotDataConfig);
  
        // Call the callback function with the snapshotStoresData
        callback(snapshotStoresData);
  
        // Return the array of SnapshotStore objects
        return snapshotStoresData;
      },
    
  
  
      createSnapshotStore: (
        id: string,
        storeId: number,
        snapshotStoreData: SnapshotStore<T, K>[], // Array of Snapshotstore objects
        category: Category | undefined,
        categoryProperties: CategoryProperties | undefined,
        callback?: (snapshotStore: SnapshotStore<T, K>) => void,
        snapshotDataConfig?: SnapshotStoreConfig<T, K>[] // Array of SnapshotStoreConfig objects
      ): Promise<SnapshotStore<T, K> | null> => {
        console.log(
          `Creating snapshot with ID: ${id} in category: ${String(category)}`,
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
  
  
    configureSnapshotStore: (
      snapshotStore: SnapshotStore<T, K>,
      snapshotId: string,
      data: Map<string, Snapshot<T, K>>,
      events: Record<string, CalendarEvent<T, K>[]>,
      dataItems: RealtimeDataItem[],
      newData: Snapshot<T, K>,
      payload: ConfigureSnapshotStorePayload<T>,
      store: SnapshotStore<any, K>,
      callback: (snapshotStore: SnapshotStore<T, K>) => void
      ): Promise<SnapshotStore<T, K>> => {
      console.log("Configuring snapshot store:", snapshotStore, "with ID:", snapshotId);
      
      },
  
      batchTakeSnapshot: async (
        snapshotStore: SnapshotStore<T, K>,
        snapshots: Snapshots<T>
      ) => {
        console.log("Batch taking snapshots:", snapshotStore, snapshots);
        return { snapshots };
      },
  
      onSnapshot: (
        snapshotId: string,
        snapshot: Snapshot<any, any>,
        type: string, event: Event,
        callback: (snapshot: Snapshot<any, any>
  
        ) => void) => {
        console.log("Snapshot taken:", snapshot, "Type:", type, "Event:", event);
      },
  
      initSnapshot: (
        snapshot: SnapshotStore<T, K> | Snapshot<T, K> | null,
        snapshotId: string | null,
        snapshotData: SnapshotStore<T, K>,
        category: symbol | string | Category | undefined,
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
        data: Map<string, Snapshot<T, K>>,
        events: Record<string, CalendarManagerStoreClass<T, K>[]>,
        snapshotStore: SnapshotStore<T, K>,
        dataItems: RealtimeDataItem[],
        newData: Snapshot<T, K>,
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
    getSnapshots: async (
      category: symbol | string | Category | undefined, 
      snapshots: SnapshotsArray<T>
      ) => {
        console.log(`Getting snapshots in category: ${String(category)}`, snapshots);
        return { snapshots };
      },
  
      takeSnapshot: async (snapshot: Snapshot<T, K>) => {
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
        subscribers: Record<string, Subscriber<any, any>[]>,
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
        id: string | number | undefined,
        snapshotId: string | null,
        snapshotData: Snapshot<T, K> | null,
        category: symbol | string | Category | undefined,
        categoryProperties: CategoryProperties | undefined,
        callback: (snapshot: Snapshot<T, K> | null) => void,
        dataStoreMethods: DataStore<T, K>[],
        // dataStoreSnapshotMethods: DataStoreWithSnapshotMethods<T, K>,
        metadata: UnifiedMetaDataOptions,
        subscriberId: string, // Add subscriberId here
        endpointCategory: string | number ,// Add endpointCategory here
        storeProps: SnapshotStoreProps<T, K>,
        snapshotStoreConfigData?: SnapshotStoreConfig<T, K>,
        snapshotContainer?: SnapshotStore<T, K> | Snapshot<T, K> | null,
      
      ) => {
        try {
          let resolvedCategory: CategoryProperties | undefined;
          let snapshotConfig: SnapshotConfig<T, K>[] | undefined
          if (typeof category === "string") {
            resolvedCategory = await fetchCategoryByName(category);
          } else {
            resolvedCategory = category;
          }
  
          if (resolvedCategory) {
            if(snapshotConfig === undefined)
            {
              return "snapshotConfig not available"
            }
            snapshotConfig[0].createSnapshot(
              id,
              snapshotData,
              resolvedCategory,
              
              callback
            );
  
            const { snapshotStore: newSnapshot } =
              await snapshotConfig[0].snapshot(
                id,
                snapshotId,
                snapshotData,
                resolvedCategory,
                categoryProperties,
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
  
      setSnapshot: (snapshot: Snapshot<T, K>) => {
        return Promise.resolve({ snapshot });
      },
  
      createSnapshot: (
        id: string,
        snapshotData: Snapshot<T, K>,
        category: symbol | string | Category | undefined,
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
  
      configureSnapshotStore: (snapshotStore: SnapshotStore<BaseData, K>

      ): Promise<SnapshotStore<any, any>> => { 
        return Promise.resolve(snapshotStore);
      },
  
      createSnapshotSuccess: (): Promise<void> => {
        return Promise.resolve();
       },
  
      createSnapshotFailure: async (
        snapshotId: string,
        snapshotManager: SnapshotManager<T, K>,
        snapshot: Snapshot<any, any>,
        payload: { error: Error; }
      ) => {
        // const snapshotManager = await useSnapshotManager();
        const snapshotStore: SnapshotStore<BaseData, K>[] =
          snapshotManager.state as SnapshotStore<T, K>[];
  
        if (snapshotStore && snapshotStore.length > 0) {
          const generatedSnapshotId = generateSnapshotId; // Assuming generateSnapshotId returns a string
  
          const config = {} as SnapshotStoreConfig<T, any>[]; // Placeholder for config
          const configOption = {} as SnapshotStoreConfig<T, any>; // Placeholder for configOption
  
          // Example: Transforming snapshot.data (Map<string, Snapshot<T, K>>) to initialState (SnapshotStore<BaseData, K> | Snapshot<BaseData>)
          const initialState: SnapshotStoreConfig<T, K> = {
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
              unsubscribe: (unsubscribeDetails:
                {
                  userId: string;
                  snapshotId: string;
                  unsubscribeType: string;
                  unsubscribeDate: Date;
                  unsubscribeReason: string;
                  unsubscribeData: any;
                }
              ) => {
                // 1. Validate the unsubscribeDetails
                if (
                  !unsubscribeDetails.userId ||
                  !unsubscribeDetails.snapshotId ||
                  !unsubscribeDetails.unsubscribeType ||
                  !unsubscribeDetails.unsubscribeDate ||
                  !unsubscribeDetails.unsubscribeReason
                ) {
                  throw new Error("Invalid unsubscribe details: missing required fields.");
                }

                // 2. Check if the unsubscribeDetails match some existing subscription
                // Example: Let's assume you have a method to get the subscription based on snapshotId and userId
                const existingSubscription = getSubscription(
                  unsubscribeDetails.userId,
                  unsubscribeDetails.snapshotId
                );

                if (!existingSubscription) {
                  throw new Error("No matching subscription found.");
                }

                // 3. Perform the unsubscribe action
                // Example: Let's assume you have a method to remove the subscription
                removeSubscription(
                  unsubscribeDetails.userId,
                  unsubscribeDetails.snapshotId
                );

                // 4. Log the unsubscribe action (optional)
                console.log(`Unsubscribed user ${unsubscribeDetails.userId} from snapshot ${unsubscribeDetails.snapshotId} on ${unsubscribeDetails.unsubscribeDate}. Reason: ${unsubscribeDetails.unsubscribeReason}`);

                // 5. Return a success message or result
                return {
                  success: true,
                  message: `Successfully unsubscribed user ${unsubscribeDetails.userId}.`,
                };
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
              data: Map<string, Snapshot<T, K>>,
              subscribers: Subscriber<any, any>[],
              snapshotData: Partial<SnapshotStoreConfig<T, K>>
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
            subscribeToSnapshots: (
              snapshotId: string,
              callback: (snapshots: Snapshots<T>) => Snapshot<T, K> | null,
              snapshot: Snapshot<T, K> | null = null
            ) => { },
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
            dataStoreMethods: {} as DataStoreWithSnapshotMethods<BaseData, any>,
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
              key: SnapshotData<T,K><T, K>
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
            getDataStore: function (): Map<string, Snapshot<T, K>> {
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
            getDelegate: function (
              context: {
                useSimulatedDataSource: boolean;
                simulatedDataSource: SnapshotStoreConfig<T, K>[];
              }
            ): SnapshotStoreConfig<T, K>[] {
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
              data: Map<string, Snapshot<T, K>>,
              events: Record<string, CalendarEvent<T, K>[]>,
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
              snapshotId: string,
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
              snapshotId: string,
              snapshotManager: SnapshotManager<T, K>,
              snapshot: Snapshot<any, any>,
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
              id: string,
            snapshotId: string,
            snapshot: Snapshot<T, K> | null,
            snapshotData: T,
            category: symbol | string | Category | undefined,
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
              callback: (
                snapshotId: string,
                payload: FetchSnapshotPayload<K>,
                snapshotStore: SnapshotStore<T, K>,
                payloadData: T | Data,
                category: symbol | string | Category | undefined,
                timestamp: Date,
                data: T,
                delegate: SnapshotWithCriteria<T, K>[]
              ) => void
            ): Promise<{
              id: any;
              category: string | Category | undefined;
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
  
      fetchSnapshot:  (
        id: string,
        category: symbol | string | Category | undefined,
        timestamp: Date,
        snapshot: Snapshot<T, K>,
        data: T,
        delegate: SnapshotStoreConfig<BaseData, any>[]
      ): Promise<{
        id: any;
        category: string | Category | undefined;
        timestamp: any;
        snapshot: Snapshot<T, K>;
        data: T;
        delegate: SnapshotStoreConfig<BaseData, any>[];
      }> => {
        try {
          // Example implementation fetching snapshot data
          const snapshotData = (await fetchFileSnapshotData(
            category as FileCategory
          )) as SnapshotData<T,K>;
  
          // Check if snapshotData is defined
          if (!snapshotData) {
            throw new Error("Snapshot data is undefined.");
          }
  
          // Create a new SnapshotStore instance
          const snapshotStore = new SnapshotStore<BaseData, K>(storeId, options, category, config, operation);
  
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
        data: Map<string, Snapshot<T, K>>,
        events: Record<string, CalendarEvent<T, K>[]>,
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
        subscribers: Subscriber<T, K>[];
        snapshots: Snapshots<T>;
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
  
          const fetchedSnapshots: SnapshotList | Snapshots<T> =
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
              initialState: snapshot.initialState,
              snapshot: snapshot.snapshot,
              getSnapshotId: snapshot.getSnapshotId,
              compareSnapshotState: snapshot.compareSnapshotStat,
              eventRecords: snapshot.eventRecord,
              snapshotStore: snapshot.snapshotStore,
              getParentId: snapshot.getParentI,
              getChildIds: snapshot.getChildId,
              addChild: snapshot.addChild,
              removeChild: snapshot.removeChild,
              getChildren: snapshot.getChildren,
              hasChildren: snapshot.hasChildren,
              isDescendantOf: snapshot.isDescendantOf,
              dataItems: snapshot.dataItem,
              newData: snapshot.newDate,
              getInitialState: snapshot.getInitialState,
              getConfigOption: snapshot.getConfigOption,
              stores: snapshot.stores,
              getStore: snapshot.getStore,
              addStore: snapshot.addStore,
              mapSnapshot: snapshot.mapSnapshot,
              removeStore: snapshot.removeStore,
              unsubscribe: snapshot.unsubscribe,
              fetchSnapshot: snapshot.fetchSnapshot,
              addSnapshotFailure: snapshot.addSnapshotFailure,
              configureSnapshotStore: snapshot.configureSnapshotStore,
              updateSnapshotSuccess: snapshot.updateSnapshotSuccess,
              createSnapshotFailure: snapshot.createSnapshotFailure,
              createSnapshotSuccess: snapshot.createSnapshotSuccess,
              createSnapshots: snapshot.createSnapshots,
              onSnapshot: snapshot.onSnapshot,
              onSnapshots: snapshot.onSnapshots,
              handleSnapshot: snapshot.handleSnapshot,
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
  

  export { snapshotStoreConfigInstance };
