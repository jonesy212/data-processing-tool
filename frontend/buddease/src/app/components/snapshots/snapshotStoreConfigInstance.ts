import { SubscriberCollection } from '@/app/components/snapshots/SnapshotStore';
import { Meta } from "@/app/components/models/data/dataStoreMethods";

// snapshotStoreConfigInstance.ts
import { fetchCategoryByName } from "@/app/api/CategoryApi";
import { endpoints } from "@/app/api/endpointConfigurations";
import * as snapshotApi from '@/app/api/SnapshotApi';
import { UnifiedMetaDataOptions } from "@/app/configs/database/MetaDataOptions";
import { CategoryProperties } from "@/app/pages/personas/ScenarioBuilder";
import { CustomSnapshotData, SnapshotData, SnapshotStoreProps, SnapshotWithCriteria } from ".";
import { CalendarEvent } from "../calendar/CalendarEvent";
import { CreateSnapshotStoresPayload } from "../database/Payload";
import { ModifiedDate } from "../documents/DocType";
import { FileCategory } from "../documents/FileType";
import { SnapshotManager, useSnapshotManager } from "../hooks/useSnapshotManager";
import determineFileCategory, { fetchFileSnapshotData } from "../libraries/categories/determineFileCategory";
import { Category } from "../libraries/categories/generateCategoryProperties";
import { BaseData, Data } from "../models/data/Data";
import { K, T } from "../models/data/dataStoreMethods";
import { NotificationPosition, StatusType } from "../models/data/StatusType";
import { RealtimeDataItem } from "../models/realtime/RealtimeData";
import { DataStoreWithSnapshotMethods } from "../projects/DataAnalysisPhase/DataProcessing/ DataStoreMethods";
import { DataStore } from "../projects/DataAnalysisPhase/DataProcessing/DataStore";
import CalendarManagerStoreClass from "../state/stores/CalendarEvent";
import { NotificationType, NotificationTypeEnum } from "../support/NotificationContext";
import { getCommunityEngagement, getMarketUpdates, getTradeExecutions } from "../trading/TradingUtils";
import { AuditRecord, Subscriber } from "../users/Subscriber";
import { portfolioUpdates, triggerIncentives } from "../utils/applicationUtils";
import { generateSnapshotId } from "../utils/snapshotUtils";
import { ExtendedVersionData } from "../versions/VersionData";
import { FetchSnapshotPayload } from "./FetchSnapshotPayload";
import { Payload, Snapshot, Snapshots, SnapshotsArray, UpdateSnapshotPayload } from "./LocalStorageSnapshotStore";
import { ConfigureSnapshotStorePayload, SnapshotConfig } from "./SnapshotConfig";
import { batchFetchSnapshotsFailure, batchFetchSnapshotsSuccess, batchTakeSnapshot, batchTakeSnapshotsRequest, batchUpdateSnapshotsFailure, batchUpdateSnapshotsRequest, batchUpdateSnapshotsSuccess, handleSnapshotSuccess } from "./snapshotHandlers";
import SnapshotList, { SnapshotItem } from "./SnapshotList";
import SnapshotStore from "./SnapshotStore";
import { SnapshotStoreConfig } from "./SnapshotStoreConfig";
import SnapshotStoreSubset from "./SnapshotStoreSubset";
import { subscribeToSnapshotImpl } from "./subscribeToSnapshotsImplementation";


function createSnapshotStoreConfig<T extends BaseData>(
  config: Omit<SnapshotStoreConfig<T, any>, 'tempData'> // Omit properties that need to be set dynamically
): SnapshotStoreConfig<T, any> {
  return {
    ...config,
    tempData: undefined, // or handle tempData based on T and any
  };
}


const snapshotStoreConfigInstance = createSnapshotStoreConfig<T>({

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
          id: number,
          snapshotId: string | null,
          snapshot: T | null,
          snapshotData: T,
          category: symbol | string | Category | undefined,
          callback: (snapshot: T) => void,
          snapshots: SnapshotsArray<T, Meta>,
          type: string,
          event: Event,
          snapshotContainer?: T,
          snapshotStoreConfig?: SnapshotStoreConfig<T, Meta, K>
        ): Promise<Snapshot<T, Meta, K> | null> => {
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
                } as Snapshot<T, Meta, K>);
              } else {
                console.log(`Creating a new snapshot with ID: ${snapshotId}`);
        

                if (!snapshot) {
                  throw new Error("Invalid snapshot provided");
                }
              
                // Create a new snapshot based on the provided snapshotData
                const newSnapshot: Snapshot<T, Meta, K> = {
                  id: id,
                  data: snapshotData,
                  category: category || "default",
                  createdAt: new Date().toISOString(),
                  snapshotStoreConfig: snapshotStoreConfig,
                  versionInfo: {} as ExtendedVersionData,
                  
                    getSnapshotItems: () => [],
                      defaultSubscribeToSnapshots: () => {
                        // Implement the logic for defaultSubscribeToSnapshots
                      },
                    transformSubscriber: (sub: Subscriber<any, any>) => {
                        // Implement the logic for transformSubscriber
                        return sub
                      },
                      transformDelegate: snapshot.
                    // Add any other properties needed for your Snapshot
                };
        
                // If there's a snapshot store config, we may need to save the snapshot to the store
                if (snapshotStoreConfig) {
                  console.log("Using snapshot store config", snapshotStoreConfig);
        
                  // Optionally, add the new snapshot to the snapshot store
                  snapshots.push(newSnapshot);
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
          snapshotData: SnapshotData<T, Meta, K>, // Use Snapshot instead of Map
          category: symbol | string | Category | undefined,
          categoryProperties: CategoryProperties | undefined,
          callback?: (snapshot: Snapshot<T, Meta, K>) => void,
          SnapshotData?: SnapshotStore<T, Meta, K>,
          snapshotStoreConfig?: SnapshotStoreConfig<T, any> | null,
          snapshotStoreConfigSearch?: SnapshotStoreConfig<SnapshotWithCriteria<any, BaseData>, any>
        ): Snapshot<T, Meta, K> | null => {
          console.log(

            `Creating snapshot with ID: ${id} in category: ${String(category)}`,
            SnapshotData
          );
  
          // Define event handling
          const eventHandlers: { [event: string]: ((snapshot: Snapshot<T, Meta, K>) => void)[] } = {};
  
          // Return a Snapshot object
          return {
            id,
            data: snapshotData, // Ensure snapshotData is of type Snapshot<T, Meta, K>
            category,
            snapshotItems: [],
            meta: {} as Map<string, Snapshot<Data, any>>,
            configOption: snapshotStoreConfig?.configOption, // Ensure snapshotDataConfig is of type SnapshotStoreConfig<any, any>
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
                categoryProperties: CategoryProperties | undefined,
                callback: (snapshot: T) => void,
                snapshots: Snapshots<Data>,
                type: string,
                event: Event,
                snapshotContainer?: T,
                snapshotStoreConfig?: SnapshotStoreConfig<T, any> | null,
              ): Promise<Snapshot<Data, any> | null> => {
                return new Promise((resolve, reject) => {
                  // Ensure SnapshotData is defined before accessing getSnapshot
                  if (!SnapshotData) {
                    reject(new Error("SnapshotData is not defined"));
                    return;
                  }
              
                  // Use the snapshotApi to fetch the snapshot by ID
                  snapshotApi.fetchSnapshotById(id)
                    .then(snapshotResult => {

                      if (!snapshotResult) {
                        // Handle the case where snapshotResult is undefined
                        console.error('Snapshot not found for ID:', id);
                        return; // or handle the error as appropriate
                      }
                      
                      // Separate the logic for retrieving the snapshot
                      const getSnapshotResult = {
                        category: snapshotResult.category,
                        timestamp: snapshotResult.timestamp,
                        id: snapshotResult.id,
                        snapshot: snapshotResult.snapshot,
                        snapshotStore: snapshotResult.snapshotStore,
                        data: snapshotResult.data,
                        snapshotId: snapshotResult.snapshotId,
                        snapshotData: snapshotResult.snapshotData,
                        categoryProperties: snapshotResult.categoryProperties,
                        dataStoreMethods: snapshotResult.dataStoreMethods as DataStore<T, Meta, K> | null, 
                      };
              
                      // Now, call the getSnapshot method and pass the result
                      return SnapshotData.getSnapshot(async () => getSnapshotResult);
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
              on: (event: string, callback: (snapshot: Snapshot<T, Meta, K>) => void) => {
                if (!eventHandlers[event]) {
                  eventHandlers[event] = [];
                }
                eventHandlers[event].push(callback);
                console.log(`Event '${event}' registered.`);
              },
              off: (event: string, callback: (snapshot: Snapshot<T, Meta, K>) => void) => {
                if (eventHandlers[event]) {
                  eventHandlers[event] = eventHandlers[event].filter(cb => cb !== callback);
                  console.log(`Event '${event}' unregistered.`);
                }
              }
            },
            getSnapshotId: (
              snapshotData: SnapshotData<T, Meta, K>,
            ) => {
              console.log("Getting snapshot ID");
  
              console.log("Snapshot data:", snapshotData);
              return null;
            },
            compareSnapshotState: (snapshot: Snapshot<T, Meta, K>) => {
              console.log("Comparing snapshot state:", snapshot);
              return null;
            },
            eventRecords: {
              add: [],
              remove: [],
              update: [],
            },
            snapshotStore: null,
            subscribe: (callback: (snapshot: Snapshot<T, Meta, K>) => void) => {
              console.log("Subscribed to snapshot:", callback);
            },
            unsubscribe: (callback: (snapshot: Snapshot<T, Meta, K>) => void) => {
              console.log("Unsubscribed from snapshot:", callback);
            },
            fetchSnapshotFailure: (
              snapshotManager: SnapshotManager<T, Meta, K>,
              snapshot: Snapshot<T, Meta, K>,
              payload: { error: Error }
            ) => {
              console.log("Fetching snapshot:", snapshot);
              console.error("Error fetching snapshot:", payload.error);
            },
            fetchSnapshotSuccess: (
              snapshotManager: SnapshotManager<T, Meta, K>,
              snapshot: Snapshot<T, Meta, K>,
            ) => {
              console.log("Fetching snapshot:", snapshot);
            },
  
            fetchSnapshot: (
              snapshotId: string,
                callback: (
                  snapshotId: string,
                  payload: FetchSnapshotPayload<K>,
                  snapshotStore: SnapshotStore<T, Meta, K>,
                  payloadData: T | Data,
                  category: symbol | string | Category | undefined,
                  timestamp: Date,
                  data: T,
                  delegate: SnapshotWithCriteria<T, Meta, K>[]            ) => void
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
                    callbacks: (snapshots: Snapshots<T, Meta>) => {
                      console.log("Fetching snapshot:", snapshots);
                      return snapshots;
                    },
                  },
                  eventIds: [],
                  on: (event: string, callback: (snapshot: Snapshot<T, Meta, K>) => void) => {
                    if (!eventHandlers[event]) {
                      eventHandlers[event] = [];
                    }
                    eventHandlers[event].push(callback);
                    console.log(`Event '${event}' registered.`);
                  },
                  getSnapshotId: () => { },
                  compareSnapshotState: (snapshot: Snapshot<T, Meta, K>) => {
                    console.log("Comparing snapshot state:", snapshot);
                    return null;
                  },
                  eventRecords: {
                    add: [],
                    remove: [],
                    update: [],
                  },
                  snapshotStore: null,
                  unsubscribe: (callback: (snapshot: Snapshot<T, Meta, K>) => void) => {
                    console.log("Unsubscribed from snapshot:", callback);
                  },
  
                  configureSnapshotStore: (
                    snapshotStore: SnapshotStore<T, Meta, K>,
                    snapshotId: string,
                    data: Map<string, Snapshot<Data, any>>,
                    events: Record<string, CalendarEvent<T, Meta, K>[]>,
                    dataItems: RealtimeDataItem[],
                    newData: Snapshot<T, Meta, K>,
                    payload: ConfigureSnapshotStorePayload<T>,
                    store: SnapshotStore<any, Meta, K>
                  ) => {
                    console.log("Configuring snapshot store:", snapshotStore);
                    snapshotStore.configureSnapshotStore(snapshotStore, snapshotId, data, events, dataItems, newData, payload, store, callback);
                  },
  
                  updateSnapshotSuccess: (
                    snapshotId: string,
                    snapshotManager: SnapshotManager<T, Meta, K>,
                    snapshot: Snapshot<T, Meta, K>) => {
                    console.log("Updating snapshot:", snapshotId, snapshot);
                  },
                  createSnapshotFailure: (
                    snapshotId: string,
                    snapshotManager: SnapshotManager<Data, any>,
                    snapshot: Snapshot<T, Meta, K>
                  ): Promise<void> => {
                    console.log("Creating snapshot failure:", snapshotId, snapshotManager, snapshot);
                    return Promise.resolve();
                  },
                  getParentId: () => "",
                  getChildIds: () => [],
                  addChild: (snapshot: Snapshot<T, Meta, K>) => {
                    console.log("Adding snapshot:", snapshot);
                  },
                  removeChild: (snapshot: Snapshot<T, Meta, K>) => {
                    console.log("Removing snapshot:", snapshot);
                  },
                  getChildren: () => [],
                  hasChildren: () => false,
                  isDescendantOf: (snapshot: Snapshot<T, Meta, K>) => false,
                  getStore: (
                    storeId: number,
                    snapshotId: string,
                    snapshot: Snapshot<T, Meta, K>,
                    type: string,
                    event: Event
                  ) => null,
                  addStore: (
                    storeId: number,
                    store: SnapshotStore<T, Meta, K>,
                    snapshotId: string,
                    snapshot: Snapshot<T, Meta, K>,
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
                  ): Snapshot<T, Meta, K> {
                    console.log("Mapping snapshot:", snapshot);
                    return snapshot;
                  },
                  removeStore(
                    storeId: number,
                    store: SnapshotStore<T, Meta, K>,
                    snapshotId: string,
                    snapshot: Snapshot<T, Meta, K>,
                    type: string,
                    event: Event
                  ): Snapshot<T, Meta, K> {
                    console.log("Removing store:", storeId, store, snapshotId, snapshot, type, event);
                    return snapshot;
                  },
                })
              }
            },
            configureSnapshotStore: (
              snapshotStore: SnapshotStore<T, Meta, K>,
              snapshotId: string,
              data: Map<string, Snapshot<T, Meta, K>>,
              events: Record<string, CalendarEvent<T, Meta, K>[]>,
              dataItems: RealtimeDataItem[],
              newData: Snapshot<T, Meta, K>,
              payload: ConfigureSnapshotStorePayload<T>,
              store: SnapshotStore<any, Meta, K>
            ) => {
              console.log("Configuring snapshot store:", snapshotStore);
            },
            updateSnapshot: (
              snapshotId: string,
              // oldSnapshot: Snapshot<T, Meta, K>,
              data: Map<string, Snapshot<T, Meta, K>>,
              events: Record<string, CalendarEvent<T, Meta, K>[]>,
              snapshotStore: SnapshotStore<T, Meta, K>,
              dataItems: RealtimeDataItem[],
              newData: Snapshot<T, Meta, K>,
              payload: UpdateSnapshotPayload<T>,
              store: SnapshotStore<any, Meta, K>
            ) => {
              console.log("Updating snapshot:", newData);
            },
            updateSnapshotFailure: (
              snapshotManager: SnapshotManager<T, Meta, K>,
              snapshot: Snapshot<BaseData, Meta, BaseData>,
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
            updateSnapshotItem: (snapshotItem: SnapshotItem<T, Meta, K>) => {
              console.log("Updating snapshot item:", snapshotItem);
            },
            // other properties if any
          };
        },
      },
  
      createSnapshotStores(
        id: string,
        snapshotId: string,
        snapshot: Snapshot<T, Meta, K>,
        snapshotStore: SnapshotStore<T, Meta, K>,
        snapshotManager: SnapshotManager<T, Meta, K>,
        payload: CreateSnapshotStoresPayload<T, Meta, K>,
        callback: (snapshotStore: SnapshotStore<T, Meta, K>[]) => void | null,
        snapshotStoreData?: SnapshotStore<T, Meta, K>[],
        category?: string | symbol | Category,
        snapshotDataConfig?: SnapshotStoreConfig<T, Meta, K>[]
      ): SnapshotStore<T, Meta, K>[] | null {
        console.log(`Creating snapshot stores with ID: ${id} in category: ${category}`, snapshotDataConfig);
  
        // Example logic to create snapshot stores
        const newSnapshotStores: SnapshotStore<T, Meta, K>[] = snapshotStoreData ?? [];
  
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
        snapshotStoreData: SnapshotStore<T, Meta, K>[], // Array of Snapshotstore objects
        category: Category | undefined,
        categoryProperties: CategoryProperties | undefined,
        callback?: (snapshotStore: SnapshotStore<T, Meta, K>) => void,
        snapshotDataConfig?: SnapshotStoreConfig<T, Meta, K>[] // Array of SnapshotStoreConfig objects
      ): Promise<SnapshotStore<T, Meta, K> | null> => {
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
      snapshotStore: SnapshotStore<T, Meta, K>,
      snapshotId: string,
      data: Map<string, Snapshot<T, Meta, K>>,
      events: Record<string, CalendarEvent<T, Meta, K>[]>,
      dataItems: RealtimeDataItem[],
      newData: Snapshot<T, Meta, K>,
      payload: ConfigureSnapshotStorePayload<T>,
      store: SnapshotStore<any, Meta, K>,
      callback: (snapshotStore: SnapshotStore<T, Meta, K>) => void
      ): Promise<SnapshotStore<T, Meta, K>> => {
      console.log("Configuring snapshot store:", snapshotStore, "with ID:", snapshotId);
      
      },
  
      batchTakeSnapshot: async (
        snapshotStore: SnapshotStore<T, Meta, K>,
        snapshots: Snapshots<T, Meta>
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
        snapshot: SnapshotStore<T, Meta, K> | Snapshot<T, Meta, K> | null,
        snapshotId: string | null,
        snapshotData: SnapshotData<T, Meta, K>,
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
        data: Map<string, Snapshot<T, Meta, K>>,
        events: Record<string, CalendarManagerStoreClass<T, Meta, K>[]>,
        snapshotStore: SnapshotStore<T, Meta, K>,
        dataItems: RealtimeDataItem[],
        newData: Snapshot<T, Meta, K>,
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
      snapshots: SnapshotsArray<T, Meta>
      ) => {
        console.log(`Getting snapshots in category: ${String(category)}`, snapshots);
        return { snapshots };
      },
  
      takeSnapshot: async (snapshot: Snapshot<T, Meta, K>) => {
        console.log("Taking snapshot:", snapshot);
        return { snapshot: snapshot }; // Adjust according to your snapshot logic
      },
  
      addSnapshot: (snapshot: Snapshot<T, Meta, K>) => {
        console.log("Adding snapshot:", snapshot);
      },
  
      removeSnapshot: (snapshotToRemove: SnapshotStore<T, Meta, K>) => {
        console.log("Removing snapshot:", snapshotToRemove);
      },
  
      getSubscribers: async (
        subscribers: Record<string, Subscriber<any, any>[]>,
        snapshots: Snapshots<BaseData>
      ) => {
        console.log("Getting subscribers:", subscribers, snapshots);
        return { subscribers, snapshots };
      },
      addSubscriber: (subscriber: Subscriber<BaseData, Meta, K>) => {
        console.log("Adding subscriber:", subscriber);
      },
  
      // Implementing the snapshot function
      snapshot: async (
        id: string | number | undefined,
        snapshotId: string | null,
        snapshotData: SnapshotData<T, Meta, K> | null,
        category: symbol | string | Category | undefined,
        categoryProperties: CategoryProperties | undefined,
        callback: (snapshot: Snapshot<T, Meta, K> | null) => void,
        dataStore: DataStore<T, Meta, K>,
dataStoreMethods: DataStoreMethods<T, Meta, K>,
        // dataStoreSnapshotMethods: DataStoreWithSnapshotMethods<T, Meta, K>,
        metadata: UnifiedMetaDataOptions,
        subscriberId: string, // Add subscriberId here
        endpointCategory: string | number ,// Add endpointCategory here
        storeProps: SnapshotStoreProps<T, Meta, K>,
        snapshotStoreConfigData?: SnapshotStoreConfig<T, Meta, K>,
        snapshotContainer?: SnapshotStore<T, Meta, K> | Snapshot<T, Meta, K> | null,
      
      ) => {
        try {
          let resolvedCategory: CategoryProperties | undefined;
          let snapshotConfig: SnapshotConfig<T, Meta, K>[] | undefined
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
  
      setSnapshot: (snapshot: Snapshot<T, Meta, K>) => {
        return Promise.resolve({ snapshot });
      },
  
      createSnapshot: (
        id: string,
        snapshotData: SnapshotData<T, Meta, K>,
        category: symbol | string | Category | undefined,
        // snapshotStore?: SnapshotStore<any,any>
      ): Snapshot<T, Meta, K> | null => {
        console.log(
          `Creating snapshot with ID: ${id} in category: ${category}`,
          snapshotData
        );
  
        // Return a Snapshot<Data, Meta, Data> object
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
          //   callbacks: (snapshot: Snapshot<Data, Meta, Data>) => {
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
  
      configureSnapshotStore: (snapshotStore: SnapshotStore<BaseData, Meta, K>

      ): Promise<SnapshotStore<any, any>> => { 
        return Promise.resolve(snapshotStore);
      },
  
      createSnapshotSuccess: (): Promise<void> => {
        return Promise.resolve();
       },
  
      createSnapshotFailure: async (
        snapshotId: string,
        snapshotManager: SnapshotManager<T, Meta, K>,
        snapshot: Snapshot<any, any>,
        payload: { error: Error; }
      ) => {
        // const snapshotManager = await useSnapshotManager();
        const snapshotStore: SnapshotStore<BaseData, Meta, K>[] =
          snapshotManager.state as SnapshotStore<T, Meta, K>[];
  
        if (snapshotStore && snapshotStore.length > 0) {
          const generatedSnapshotId = generateSnapshotId; // Assuming generateSnapshotId returns a string
  
          const config = {} as SnapshotStoreConfig<T, any>[]; // Placeholder for config
          const configOption = {} as SnapshotStoreConfig<T, any>; // Placeholder for configOption
  
          // Example: Transforming snapshot.data (Map<string, Snapshot<T, Meta, K>>) to initialState (SnapshotStore<BaseData, Meta, K> | Snapshot<BaseData>)
          const initialState: SnapshotStoreConfig<T, Meta, K> = {
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
              data: Map<string, Snapshot<T, Meta, K>>,
              subscribers: Subscriber<any, any>[],
              snapshotData: Partial<SnapshotStoreConfig<T, Meta, K>>
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
              callback: (snapshots: Snapshots<T, Meta>) => Snapshot<T, Meta, K> | null,
              snapshot: Snapshot<T, Meta, K> | null = null
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
            addData: function (data: Snapshot<T, Meta, K>): void {
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
              snapshot: (id: string) =>
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
            
            getSnapshotId: async function (
              key: SnapshotData<T, Meta, K>
          ): Promise<string> {
              return initialState.getSnapshot(key).then((snapshot) => {
                  // Check if snapshot.data is not null and is of type T
                  if (snapshot.data && typeof snapshot.data !== 'object' && !Array.isArray(snapshot.data)) {
                      return snapshot.data.id; // Assuming T has an id property
                  } 
                  
                  // Handle the case where data is a Map
                  if (snapshot.data instanceof Map) {
                      // Assuming you want to extract the id from the first Snapshot in the Map
                      const firstSnapshot = Array.from(snapshot.data.values())[0];
                      if (firstSnapshot) {
                          return firstSnapshot.id; // Assuming Snapshot has an id property
                      }
                  }
                  
                  throw new Error("Snapshot data is invalid or does not contain an id.");
              });
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
            getDataStore: function (): Map<string, Snapshot<T, Meta, K>> {
              throw new Error("Function not implemented.");
            },
            addSnapshotSuccess: function (
              snapshot: T,
              subscribers: SubscriberCollection<T, Meta, K>
            ): void {
              throw new Error("Function not implemented.");
            },
            compareSnapshotState: function (
              stateA:
                | Snapshot<BaseData, Meta, BaseData>
                | Snapshot<BaseData, Meta, BaseData>[]
                | null
                | undefined,
              stateB: Snapshot<BaseData, Meta, BaseData> | null | undefined
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
                simulatedDataSource: SnapshotStoreConfig<T, Meta, K>[];
              }
            ): SnapshotStoreConfig<T, Meta, K>[] {
              throw new Error("Function not implemented.");
            },
            determineCategory: function (
              snapshot: Snapshot<BaseData, Meta, BaseData> | null | undefined
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
              data: Map<string, Snapshot<T, Meta, K>>,
              events: Record<string, CalendarManagerStoreClass<BaseData, Meta, BaseData>[]>,
              snapshotStore: SnapshotStore<BaseData, Meta, BaseData>, 
              dataItems: RealtimeDataItem[],
              newData: Snapshot<BaseData, Meta, BaseData>,
              payload: UpdateSnapshotPayload<BaseData>,
              store: any
            ): Promise<{ snapshot: Snapshot<BaseData, any> }> {
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
              snapshoConfigtData: SnapshotStoreConfig<any, BaseData>,
              category: string
            ): Snapshot<Data, Meta, Data> {
              throw new Error("Function not implemented.");
            },
            createSnapshotSuccess: function (
              snapshot: Snapshot<Data, Meta, Data>
            ): void {
              throw new Error("Function not implemented.");
            },
            setSnapshotSuccess: function (
              snapshotData: any,
              subscribers: ((data: Snapshot<BaseData, Meta, BaseData>) => void)[]
            ): void {
              throw new Error("Function not implemented.");
            },
            setSnapshotFailure: function (error: Error): void {
              throw new Error("Function not implemented.");
            },
            createSnapshotFailure: function (
              snapshotId: string,
              snapshotManager: SnapshotManager<T, Meta, K>,
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
              snapshotData: SnapshotData<BaseData, any>
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
              snapshot: SnapshotStore<T, Meta, K>
            ): void {
              throw new Error("Function not implemented.");
            },
            getData: function <T extends Data>(
              data:
                | Snapshot<BaseData, Meta, K>
                | Snapshot<CustomSnapshotData, K>
            ): Promise<{
              data: (
                | Snapshot<CustomSnapshotData, K>
                | Snapshot<T, Meta, K>
              )[]; // Implement logic to convert subscriber data to SnapshotStore instance
              // Implement logic to convert subscriber data to SnapshotStore instance
              getDelegate: SnapshotStore<T, any>;
            }> {
              throw new Error("Function not implemented.");
            },
            flatMap: function (
              snapshot: Snapshot<BaseData, Meta, K>,
              subscribers: Subscriber<BaseData, any>[]
                | Subscriber<CustomSnapshotData, any>[]
            ): Promise<{
              snapshot: Snapshot<BaseData, Meta, BaseData>;
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
              snapshot: Snapshot<BaseData, Meta, BaseData>
            ): boolean {
              throw new Error("Function not implemented.");
            },
            handleSnapshot: function (
              id: string,
            snapshotId: string,
            snapshot: Snapshot<T, Meta, K> | null,
            snapshotData: T,
            category: symbol | string | Category | undefined,
            callback: (snapshot: T) => void,
            snapshots: Snapshots<Data>,
            type: string,
            event: Event,
            snapshotContainer?: T,
            snapshotStoreConfig?: SnapshotStoreConfig<T, Meta, K>,
   
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
                snapshotStore: SnapshotStore<T, Meta, K>,
                payloadData: T | Data,
                category: symbol | string | Category | undefined,
                timestamp: Date,
                data: T,
                delegate: SnapshotWithCriteria<T, Meta, K>[]
              ) => void
            ): Promise<{
              id: any;
              category: symbol | string | Category | undefined;
              timestamp: any;
              snapshot: Snapshot<BaseData, Meta, BaseData>;
              data: BaseData;
              getItem?:
              | ((
                snapshot: Snapshot<BaseData, Meta, BaseData>
              ) => Snapshot<BaseData, Meta, BaseData> | undefined)
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
              Snapshot<BaseData, Meta, BaseData>
            > {
              throw new Error("Function not implemented.");
            },
          }
  
          const updatedSnapshotData: Partial<
            SnapshotStoreConfig<BaseData, Meta, BaseData>
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
        snapshotStore: SnapshotStore<BaseData, Meta, K>,
        snapshots: Snapshots<T, Meta>
      ) => {
        return { snapshots: [] };
      },
      onSnapshot: (snapshotStore: SnapshotStore<BaseData, Meta, K>) => { },
      snapshotData: (snapshot: SnapshotStore<any, any>) => {
        return { snapshots: [] };
      },
      initSnapshot: () => { },
      // Implementation of fetchSnapshot function
  
      fetchSnapshot:  (
        id: string,
        category: symbol | string | Category | undefined,
        timestamp: Date,
        snapshot: Snapshot<T, Meta, K>,
        data: T,
        delegate: SnapshotStoreConfig<Data, any>[]
      ): Promise<{
        id: any;
        category: symbol | string | Category | undefined;
        timestamp: any;
        snapshot: Snapshot<T, Meta, K>;
        data: T;
        delegate: SnapshotStoreConfig<Data, any>[];
      }> => {
        try {
          // Example implementation fetching snapshot data
          const snapshotData = (await fetchFileSnapshotData(
            category as FileCategory,
            snapshotId
          )) as SnapshotData<T,K>;
  
          // Check if snapshotData is defined
          if (!snapshotData) {
            throw new Error("Snapshot data is undefined.");
          }
  
          // Create a new SnapshotStore instance
          const snapshotStore = new SnapshotStore<BaseData, Meta, K>(storeId, options, category, config, operation);
  
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
        data: Map<string, Snapshot<T, Meta, K>>,
        events: Record<string, CalendarEvent<T, Meta, K>[]>,
        snapshotStore: SnapshotStore<T, Meta, K>,
        dataItems: RealtimeDataItem[],
        newData: Snapshot<BaseData, any>,
        payload: UpdateSnapshotPayload<T>,
        store: SnapshotStore<any, any>
      ): Promise<{ snapshot: Snapshot<BaseData> }> => {
        // Example implementation logic (adjust as per your actual implementation)
  
        // Assuming you update some data in snapshotStore
        snapshotStore.addData(newData);
  
        // Convert snapshotStore to Snapshot<BaseData>
        const snapshotData: SnapshotData<BaseData> = {
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
  
      getSnapshots: async (category: string, snapshots: Snapshots<T, Meta>) => {
        return { snapshots };
      },
      takeSnapshot: async (snapshot: SnapshotStore<BaseData, Meta, K>) => {
        return { snapshot: snapshot };
      },
  
      getAllSnapshots: async (
        data: (
          subscribers: Subscriber<BaseData, Meta, K>[],
          snapshots: Snapshots<T, Meta>
        ) => Promise<Snapshots<T, Meta>>
      ) => {
        // Implement your logic here
        const subscribers: Subscriber<BaseData, Meta, K>[] = []; // Example
        const snapshots: Snapshots<T, Meta> = []; // Example
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
        snapshots: Snapshots<T, Meta>
      ): Promise<Snapshots<T, Meta>> => {
        try {
          const updatedSnapshots: Snapshots<T, Meta> = snapshots.map((snapshot) => ({
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
        subscribers: Subscriber<BaseData, Meta, K>[],
        snapshots: Snapshots<Data>
      ) => {
        return {
          subscribers: [],
          snapshots: [],
        };
      },
  
      batchUpdateSnapshots: async (
        subscribers: Subscriber<BaseData, Meta, K>[],
        snapshots: Snapshots<Data>
      ) => {
        // Perform batch update logic
        return [
          { snapshots: [] }, // Example empty array, adjust as per your logic
        ];
      },
      batchFetchSnapshotsRequest: async (snapshotData: {
        subscribers: Subscriber<T, Meta, K>[];
        snapshots: Snapshots<T, Meta>;
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
  
          const fetchedSnapshots: SnapshotList | Snapshots<T, Meta> =
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
        subscriber: Subscriber<T, Meta, K>,
        snapshots: Snapshots<T, Meta>
      ): Promise<{
        subscribers: Subscriber<T, Meta, K>[];
        snapshots: Snapshot<Data, Meta, Data>[];
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
          const updatedSnapshot: Snapshot<Data, Meta, Data> = {
            ...snapshotData,
            message: "Updated for subscriber",
          };
  
          // Find the index of the snapshot in the array
          const snapshotIndex = snapshots.findIndex(
            (snapshot: Snapshot<Data, Meta, Data>) => snapshot.id === subscriberId
          );
  
          // Create a new array with the updated snapshot
          const updatedSnapshots: Snapshot<Data, Meta, Data>[] = [...snapshots];
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
        subscribers: Subscriber<BaseData, Meta, K>[],
        data: Snapshot<Data, Meta, Data>
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
      addSnapshot: function (snapshot: Snapshot<Data, Meta, Data>) {
        if (
          "data" in snapshot &&
          "timestamp" in snapshot &&
          "category" in snapshot &&
          typeof snapshot.category === "string"
        ) {
          const snapshotWithValidTimestamp: SnapshotStore<BaseData, Meta, K> = {
            ...snapshot,
            timestamp: new Date(snapshot.timestamp as unknown as string),
            // Ensure all required properties of SnapshotStore<Snapshot<T, Meta, K>> are included
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
        subscribers: Subscriber<BaseData, Meta, K>[],
        snapshots: Snapshots<Data>
      ): Promise<{
        subscribers: Subscriber<BaseData, Meta, K>[];
        snapshots: Snapshots<BaseData>[];
      }> => {
        const data = Object.entries(snapshots)
          .map(([category, categorySnapshots]) => {
            const subscribersForCategory = subscribers.filter(
              (subscriber) => subscriber.getData()?.category === category
            );
            if (Array.isArray(categorySnapshots)) {
              const snapshotsForCategory = categorySnapshots.map(
                (snapshot: Snapshot<Data, Meta, Data>) => {
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
        subscriber: Subscriber<BaseData, Meta, K>,
        data: T,
        snapshotConfig: SnapshotStoreConfig<BaseData, T>[],
        delegate: SnapshotStoreSubset<BaseData>,
        sendNotification: (type: NotificationTypeEnum) => void
      ): void { },
  
      validateSnapshot: function (snapshot: Snapshot<Data, Meta, Data>): boolean {
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
            snapshot: SnapshotStore<BaseData, Meta, K>;
            data: Data;
          }>
          | undefined
      ): Promise<SnapshotStore<BaseData, Meta, K>> {
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
      ): Promise<SnapshotStore<BaseData, Meta, K> | undefined> {
        try {
          const config = snapshotConfig.find(
            (config) => config.snapshotId === snapshotId
          );
  
          if (!config) {
            throw new Error("Snapshot configuration not found");
          }
  
          // Here, assuming `config` is of type `SnapshotStoreConfig <Data, Data>`
          // and you need to create or access a `SnapshotStore<BaseData, Meta, K>` instance
          const snapshotStore: SnapshotStore<BaseData, Meta, K> = {
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
        subscribers: Subscriber<BaseData, Meta, K>[],
        snapshots: Snapshots<T, Meta>
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
    });  
  

  export { snapshotStoreConfigInstance };
