// SnapshotContainer.ts
import { endpoints } from "@/app/api/endpointConfigurations";
import { SnapshotCategory } from "@/app/api/getSnapshotEndpoint";
import * as snapshotApi from "@/app/api/SnapshotApi";
import { apiCall, handleOtherStatusCodes } from "@/app/api/SnapshotApi";
import SnapshotStore, { SubscriberCollection } from '@/app/components/snapshots/SnapshotStore';
import { AppConfig, getAppConfig } from "@/app/configs/AppConfig";
import { UnifiedMetaDataOptions } from '@/app/configs/database/MetaDataOptions';
import { CategoryProperties } from "@/app/pages/personas/ScenarioBuilder";
import { CriteriaType } from '@/app/pages/searchs/CriteriaType';
import { AxiosError } from "axios";
import { ContentItem } from '../cards/DummyCardLoader';
import { InitializedData, SnapshotStoreOptions } from "../hooks/SnapshotStoreOptions";
import { Category } from "../libraries/categories/generateCategoryProperties";
import { Content } from "../models/content/AddContent";
import { BaseData, Data } from "../models/data/Data";
import { K } from '../models/data/dataStoreMethods';
import { DataStore } from "../projects/DataAnalysisPhase/DataProcessing/DataStore";
import axiosInstance from "../security/csrfToken";
import { Subscriber } from "../users/Subscriber";
import Version from "../versions/Version";
import { handleApiError } from "./../../api/ApiLogs";
import { AuthenticationHeaders, createAuthenticationHeaders } from "./../../api/headers/authenticationHeaders";
import createCacheHeaders from "./../../api/headers/cacheHeaders";
import createContentHeaders from "./../../api/headers/contentHeaders";
import generateCustomHeaders from "./../../api/headers/customHeaders";
import createRequestHeaders from "./../../api/headers/requestHeaders";
import configData from "./../../configs/configData";
import { convertStoreId } from './convertSnapshot';
import { Snapshot, Snapshots, SnapshotsArray, SnapshotsObject, SnapshotUnion } from "./LocalStorageSnapshotStore";
import { SnapshotOperation, SnapshotOperationType } from "./SnapshotActions";
import { createSnapshotConfig, SnapshotConfig } from "./SnapshotConfig";
import { CustomSnapshotData, SnapshotData, SnapshotRelationships } from "./SnapshotData";
import { batchUpdateSnapshots } from './snapshotHandlers';
import { SnapshotInitialization } from './SnapshotInitialization';
import { SnapshotMethods } from "./SnapshotMethods";
import { InitializedConfig, SnapshotStoreConfig } from "./SnapshotStoreConfig";
import { SnapshotSubscriberManagement } from './SnapshotSubscriberManagement';
import { TagsRecord } from './SnapshotWithCriteria';
import { SnapshotStoreProps } from './useSnapshotStore';
import { DataStoreMethods } from "../projects/DataAnalysisPhase/DataProcessing/ DataStoreMethods";
import { NotificationType } from "../support/NotificationContext";
import { NotificationPosition } from "../models/data/StatusType";

const API_BASE_URL = endpoints.snapshots


type SnapshotDataType<T extends Data, K extends Data> =
  | Map<string, Snapshot<T, K>>
  | SnapshotData<T, K>
  | undefined;

type ItemUnion = ContentItem | K; // Assuming K extends Data

interface SnapshotCommonProps<T extends Data, K extends Data> {
  criteria?: any; // Define a more specific type if you have one
  category?: string | symbol | Category; // Optional category
  categoryProperties?: CategoryProperties; // Define the type as needed
  delegate?: any; // Specify the type if known
  snapshot?: Snapshot<T, K>; // Optional snapshot
  events?: Event[]; // Specify the type for events if known
  dataItems?: T[]; // Define the type based on your data structure
  newData?: T; // Define what type newData should be
  payload?: any; // Specify the type if known
  store?: SnapshotStore<T, K>; // Optional store to retrieve from
  callback?: (data: T) => void; // Define the callback type as needed
}

interface SnapshotBase<T extends Data, K extends Data> {
  id: string | number | undefined;
  data: InitializedData | null | undefined;
  items: ItemUnion[];
  config: SnapshotStoreConfig<T, K> | null;
  timestamp: string | number | Date | undefined;
  currentCategory: Category | undefined;

  title?: string;
  description?: string | null;
  tags?: TagsRecord | string[] | undefined;
  key?: string;
  state?: SnapshotsArray<T> | null;
  topic?: string;
  // Category related methods
  setSnapshotCategory: (id: string, newCategory: string | Category) => void;
  getSnapshotCategory: (id: string) => Category | undefined;
}


interface SnapshotContainerData<T extends Data, K extends Data> {
  id: string | number | undefined;
  data: InitializedData | undefined;
  items: ItemUnion[];
  config: Promise<SnapshotStoreConfig<T, K>> | null
  timestamp: string | number | Date | undefined;
  currentCategory: Category;
}

interface SnapshotContainer<T extends Data, K extends Data> extends SnapshotBase<T, K>,
  SnapshotData<T, K>,
  SnapshotMethods<T, K>, SnapshotRelationships<T, K>,
  SnapshotInitialization<T, K>, SnapshotContainerData<T, K> {
  mappedSnapshotData: Map<string, Snapshot<T, K>> | undefined,
  subscriberManagement?: SnapshotSubscriberManagement<T, K>;
  criteria: CriteriaType | undefined,
  content?: string | Content<T, K> | undefined;
  snapshotCategory: SnapshotCategory<T, K> | undefined,
  snapshotSubscriberId: string | undefined
  taskIdToAssign?: string
  initialConfig: InitializedConfig | {}
  removeSubscriber: any
  onError: (error: any) => void
  data: InitializedData | null | undefined
  snapshotsArray?: SnapshotsArray<T>;
  snapshotsObject?: SnapshotsObject<T>

  currentCategory: Category | undefined;
  
  snapshotId: number
  onInitialize: () => void
  snapshot: (
    id: string | number | undefined,
    snapshotId: string | null,
    snapshotData: SnapshotDataType<T, K>,
    category: symbol | string | Category | undefined,
    categoryProperties: CategoryProperties | undefined,
    callback: (snapshotStore: SnapshotStore<T, K>) => void,
    dataStore: DataStore<T, K>,
    dataStoreMethods: DataStoreMethods<T, K>,
    // dataStoreSnapshotMethods: DataStoreWithSnapshotMethods<T, K>,
    metadata: UnifiedMetaDataOptions,
    subscriberId: string, // Add subscriberId here
    endpointCategory: string | number,// Add endpointCategory here
    storeProps: SnapshotStoreProps<T, K>,
    snapshotConfigData: SnapshotConfig<T, K>,
    subscription: Subscription<T, K>,
    snapshotStoreConfigData?: SnapshotStoreConfig<T, K>,
    snapshotContainer?: SnapshotStore<T, K> | Snapshot<T, K> | null,
  ) => Snapshot<T, K> | Promise<{ snapshot: Snapshot<T, K>; }>; // Primary or detailed snapshot

  snapshotStore: SnapshotStore<T, K> | null;

  snapshotData: (
    id: string | number | undefined,
    snapshotId: number,
    snapshotData: Map<string, Snapshot<T, K>> | null | undefined,
    category: Category | undefined,
    categoryProperties: CategoryProperties | undefined,
    dataStoreMethods: DataStore<T, K>,
    storeProps: SnapshotStoreProps<T, K>
  ) => Promise<SnapshotDataType<T, K>>;
  
  // Updated method to set the current category
  setSnapshotCategory: (id: string, newCategory: string | Category) => void;

  // Method to get the current category
  getSnapshotCategory: (id: string) => Category | undefined;

  // Add other fields as necessary
}

export const snapshotContainer = <T extends Data, K extends Data>(
  snapshotId: string,
  storeId: number,
  storeConfig: SnapshotStoreConfig<T, K> // Add storeConfig here
): Promise<SnapshotContainer<T, K>> => {
  return new Promise(async (resolve, reject) => {
    try {


      // Step 1: Initialize the snapshotContainer object
      const snapshotContainer: SnapshotContainer<T, K> = {
        timestamp: undefined,
        find: () => {
          // Logic for finding a snapshot within the container
        },
        initialState: {}, // Initial state if needed

        data: new Map(), // Initializing data with a Map or your required data structure
        snapshotStore: null, // This can be set dynamically later
        criteria: {}, // Define criteria if needed, otherwise set to an empty object
        content: undefined, // Placeholder for snapshot content
        snapshotCategory: undefined, // Set dynamically or as needed
        snapshotSubscriberId: undefined, // Initialize or set dynamically
        snapshotContent: undefined, // Placeholder for snapshot content to be populated later


        currentCategory: undefined, // Assuming this should be initialized
        mappedSnapshotData: new Map<string, Snapshot<T, K>>(),
        // snapshottData: 
        setSnapshotCategory: (id: string, newCategory: string | Category) => {
          // Implementation needed
        },

        getSnapshotCategory: (id: string): Category | undefined => {
          // Implementation needed
          return undefined;
        },

        snapshot: async (
          id: string | number | null | undefined,
          snapshotId: string | null,
          snapshotData: SnapshotDataType<T, K>,
          category: symbol | string | Category | undefined,
          categoryProperties: CategoryProperties | undefined,
          callback: (snapshotStore: SnapshotStore<T, K>) => void,
          dataStore: DataStore<T, K>,
          dataStoreMethods: DataStoreMethods<T, K>,
          // dataStoreSnapshotMethods: DataStoreWithSnapshotMethods<T, K>,
          metadata: UnifiedMetaDataOptions,
          subscriberId: string, // Add subscriberId here
          endpointCategory: string | number, // Add endpointCategory here
          storeProps: SnapshotStoreProps<T, K>
        ): Promise<{ snapshot: Snapshot<T, K> }> => {

          // Logic for generating or retrieving `storeId`
          const storeId = id ? `store-${id}` : "defaultStoreId";

          // Define the base URL, this could be retrieved from a config file or environment variable
          const baseURL = process.env.BASE_URL || "https://api.example.com";

          // Enable or disable features based on conditions (e.g., environment or metadata)
          const enabled = metadata?.enableSnapshot || true;

          // Set retry-related properties based on system configurations
          const maxRetries = metadata?.maxRetries || 5;
          const retryDelay = metadata?.retryDelay || 1000; // in milliseconds

          // Determine the max age and stale while revalidate timeframes based on metadata
          const maxAge = metadata?.maxAge || 3600; // Default to 1 hour
          const staleWhileRevalidate = metadata?.staleWhileRevalidate || 600; // Default to 10 minutes

          // Cache key logic based on category or snapshotId
          const cacheKey = `${typeof category === 'symbol' ? String(category) : category || "default"}-snapshot-${snapshotId}`;

          // Event records could be something like logs or metrics
          const eventRecords = metadata?.eventRecords || [];

          // Date and type logic based on the snapshot or system context
          const date = new Date(); // Current timestamp
          const type = "snapshot"; // Or dynamically determine based on context

          // Callback functions that might be used within the snapshot process
          const callbacks = {
            onSnapshotCreate: (snapshot: Snapshot<T, K>) => {
              console.log("Snapshot created:", snapshot);
            },
            onSnapshotError: (error: Error) => {
              console.error("Snapshot error:", error);
            }
          };


          // Use the properties like timestamp, criteria, etc., as needed
          const { timestamp, criteria, snapshotStore, content, snapshotCategory, snapshotSubscriberId, description,
            isCore,
            initialState,
            data,
            onInitialize
          } = snapshotContainer;

          if (criteria === undefined && description === undefined) {
            throw new Error("You must define a criteria")
          }
          // const description: string | undefined = storeProps.description; // Could be optional
          const priority: string | undefined = storeProps.priority; // Optional
          const version: Version | undefined = storeProps.version; // Optional versioning
          const additionalData: CustomSnapshotData | undefined = storeProps.additionalData; // Custom additional data

          // Define or retrieve `existingConfigs` from somewhere in your system
          const existingConfigs: Map<string, SnapshotConfig<T, K>> = storeProps.existingConfigs || new Map();

          // Snapshot configuration that could include additional settings
          const snapshotConfig = createSnapshotConfig(String(snapshotId), existingConfigs, snapshotData, category, criteria, storeConfig, isCore,
          onInitialize,
          Number(storeId), description, metadata, priority, version, additionalData)

          // Subscription management logic
          const subscribeToSnapshots = () => {
            console.log("Subscribed to snapshots");
          };

          const subscribeToSnapshot = () => {
            console.log("Subscribed to a specific snapshot");
          };

          const unsubscribeToSnapshots = () => {
            console.log("Unsubscribed from snapshots");
          };

          const unsubscribeToSnapshot = () => {
            console.log("Unsubscribed from a specific snapshot");
          };

          // Delegate logic to handle operations
          const delegate = {
            execute: (operation: string) => {
              console.log(`Executing operation: ${operation}`);
            }
          };

          const getDelegate = () => delegate;

          const getCategory = () => category;

          const getSnapshotConfig = () => snapshotConfig;

          const getDataStoreMethods = () => dataStoreMethods;
          const snapshotMethods = {

            create: (snapshotData: SnapshotDataType<T, K>): Promise<Snapshot<T, K>> => {
              console.log("Creating snapshot...");

              return apiCall<T, K>(
                `${API_BASE_URL}/snapshot`,
                'POST',
                snapshotData
              )
                .then((createdSnapshot) => {
                  if (!createdSnapshot) {
                    return Promise.reject(new Error("Snapshot creation failed"));
                  }

                  console.log("Snapshot created successfully:", createdSnapshot);
                  return createdSnapshot;
                })
                .catch((error) => {
                  console.error("Error creating snapshot:", error);
                  throw error;
                });
            },

            update: (snapshotId: string | number, updatedData: SnapshotDataType<T, K>): Promise<Snapshot<T, K>> => {
              console.log("Updating snapshot...");

              return apiCall<T, K>(
                `${API_BASE_URL}/snapshot/${snapshotId}`,
                'PUT',
                updatedData
              )
                .then((updatedSnapshot) => {
                  if (!updatedSnapshot) {
                    return Promise.reject(new Error("Snapshot update failed"));
                  }

                  console.log("Snapshot updated successfully:", updatedSnapshot);
                  return updatedSnapshot;
                })
                .catch((error) => {
                  console.error("Error updating snapshot:", error);
                  throw error;
                });
            },

            delete: (snapshotId: string | number): Promise<Snapshot<T, K>> => {
              console.log("Deleting snapshot...");

              return apiCall<T, K>(
                `${API_BASE_URL}/snapshot/${snapshotId}`,
                'DELETE'
              )
                .then((deletedSnapshot) => {
                  if (!deletedSnapshot) {
                    return Promise.reject(new Error("Snapshot deletion failed"));
                  }

                  console.log("Snapshot deleted successfully:", deletedSnapshot);
                  return deletedSnapshot;
                })
                .catch((error) => {
                  console.error("Error deleting snapshot:", error);
                  throw error;
                });
            }
          }


          // Handling snapshot operations (e.g., map, sort, categorize)
          const handleSnapshotOperation = (operationType: string) => {
            switch (operationType) {
              case "map":
                console.log("Mapping snapshot data...");
                break;
              case "sort":
                console.log("Sorting snapshot data...");
                break;
              case "categorize":
                console.log("Categorizing snapshot data...");
                break;
              default:
                console.log(`Unhandled operation: ${operationType}`);
            }
          };

          // Handling snapshot store operations similarly
          const handleSnapshotStoreOperation = (
            snapshotId: string,
            snapshotStore: SnapshotStore<T, K>,
            snapshot: Snapshot<T, K>,
            operation: SnapshotOperation,
            operationType: SnapshotOperationType,
            callback: (snapshotStore: SnapshotStore<T, K>) => void,
          ) => {
            switch (operationType) {
              case "createSnapshot":
                console.log("Creating snapshot store...");
                break;
              case "updateSnapshot":
                console.log("Updating snapshot store...");
                break;
              case "deleteSnapshot":
                console.log("Deleting snapshot store...");
                break;
              case "findSnapshot":
                console.log("Finding snapshot store...");
                break;
              case "mapSnapshot":
                console.log("Mapping snapshot store data...");
                break;
              case "sortSnapshot":
                console.log("Sorting snapshot store data...");
                break;
              case "searchSnapshot":
                console.log("Searching snapshot store data...");
                break;
              case "calendarEvent":
                console.log("Creating calendar event...");
                break;
              case "categorizeSnapshot":
                console.log("Categorizing snapshot store data...");
                break;
              default:
                console.log(`Unhandled store operation: ${operationType}`);
            }
          };

          // Display toast notifications if needed
          const displayToast = (message: string) => {
            console.log(`Toast: ${message}`);
          };

          // Add to snapshot list logic
          const addToSnapshotList = (snapshot: Snapshot<T, K>) => {
            console.log("Adding to snapshot list:", snapshot);
          };


          const validateSnapshot = (snapshot: Snapshot<T, K>) => {
            console.log("Validating snapshot:", snapshot);
          }

          // Find the subscriber
          const subscriber = await snapshotApi.findSubscriberById(subscriberId, category, endpointCategory);

          // Use the flexible type SubscriberCollection
          const subscribers: SubscriberCollection<BaseData, BaseData> = [subscriber];

          // Fetch snapshots for the subscriber
          const snapshots = await snapshotApi.findSnapshotsBySubscriber(subscriberId, category, endpointCategory, snapshotConfig);

          // Convert snapshots to Snapshot<BaseData, BaseData> type
          const convertedSnapshots: Snapshot<BaseData, BaseData>[] = snapshots.map(
            (snapshot) => snapshot as unknown as Snapshot<BaseData, BaseData>
          );

          // Use the imported `batchUpdateSnapshots` function with proper arguments
          const batchUpdateSnapshotsResult = await batchUpdateSnapshots(
            subscribers,
            convertedSnapshots
          );

          // Simulated data source that might represent a mock or testing data set
          const simulatedDataSource = metadata?.simulatedDataSource || {};




          const {
            name,
            schema,
            config,
            operation,
            expirationDate,
            payload,
          } = storeProps;

          // Configuration settings for the snapshot store
          const snapshotStoreConfig = {
            storeId,
            category,
            cacheKey,
            snapshotId,
            maxAge,
            staleWhileRevalidate,
            enabled,
            delegate,
            subscribeToSnapshots,
            handleSnapshotOperation,
            displayToast,
            batchUpdateSnapshotsResult,
            addToSnapshotList,
            validateSnapshot,
            snapshotMethods,

            id,
            timestamp,
            find,
            initialState,
            data,
            snapshotStore,
            criteria,
            content,
            snapshotCategory,
            snapshotSubscriberId,
            snapshotContent,

            snapshots,
            getParentId,
            getChildIds,
            clearSnapshotFailure,
            mapSnapshots,
            state,
            getSnapshotById,
            handleSnapshot,
            subscribers,
            getSnapshotId,
            snapshot,
            createSnapshot,
            createSnapshotStore,
            updateSnapshotStore,
            configureSnapshot,
            configureSnapshotStore,
            createSnapshotSuccess,
            createSnapshotFailure,
            batchTakeSnapshot,
            onSnapshot,
            onSnapshots,
            onSnapshotStore,
            snapshotData,
            mapSnapshot,
            createSnapshotStores,
            initSnapshot,
            clearSnapshot,
            clearSnapshotSuccess,
            addToSnapshotStoreList,
            fetchInitialSnapshotData,
            updateSnapshot,
            getSnapshots,
            getSnapshotItems,
            takeSnapshot,
            takeSnapshotStore,

            addSnapshot,
            addSnapshotSuccess,
            removeSnapshot,
            getSubscribers,
            addSubscriber,
            getSnapshot,
            getSnapshotContainer,
            getSnapshotVersions,
            fetchData,
            getAllSnapshots,
            getSnapshotStoreData,
            takeSnapshotSuccess,
            updateSnapshotFailure,
            takeSnapshotsSuccess,
            fetchSnapshot,
            addSnapshotToStore,
            getSnapshotSuccess,
            setSnapshotSuccess,
            setSnapshotFailure,
            updateSnapshotSuccess,
            updateSnapshotsSuccess,
            fetchSnapshotSuccess,
            updateSnapshotForSubscriber,
            updateMainSnapshots,
            batchProcessSnapshots,
            batchFetchSnapshotsRequest,
            batchTakeSnapshotsRequest,
            batchUpdateSnapshotsRequest,
            batchFetchSnapshots,
            getData,
            batchFetchSnapshotsSuccess,
            batchFetchSnapshotsFailure,
            batchUpdateSnapshotsFailure,
            notifySubscribers,
            notify,
            getCategory,
            updateSnapshots,
            updateSnapshotsFailure,

            flatMap,
            setData,
            getState,
            setState,
            handleActions,
            setSnapshots,
            mergeSnapshots,

            reduceSnapshots,
            sortSnapshots,
            filterSnapshots,
            findSnapshot,

            subscribe,
            unsubscribe,
            fetchSnapshotFailure,
            generateId,
            useSimulatedDataSource,
            simulatedDataSource,
            // [Symbol.iterator],
            // [Symbol.asyncIterator],

          }

          const options: SnapshotStoreOptions<T, K> = {
            id: id,
            data: snapshotData,
            metadata: metadata,
            criteria: {},
            storeId: convertStoreId(storeId),
            baseURL,
            enabled,
            maxRetries,
            retryDelay,
            maxAge,
            staleWhileRevalidate,
            cacheKey,
            eventRecords,
            category,
            date,
            type,
            snapshotId,
            snapshotStoreConfig,
            callbacks,
            snapshotConfig,
            subscribeToSnapshots,
            subscribeToSnapshot,
            unsubscribeToSnapshots,
            unsubscribeToSnapshot,
            delegate,
            getDelegate,
            getCategory,
            getSnapshotConfig,
            dataStoreMethods,
            getDataStoreMethods,
            snapshotMethods,
            handleSnapshotOperation,
            handleSnapshotStoreOperation,
            displayToast,
            batchUpdateSnapshotsResult,
            addToSnapshotList,
            simulatedDataSource
          };


          // const operation: SnapshotOperation = {
          //   operationType: SnapshotOperationType.CreateSnapshot
          // }

          // Check for missing required fields
          if (!name || !version || !operation) {
            throw new Error("Name, operation and version are required for SnapshotStore");
          }

          if (!snapshotStore) {
            const snapshotStore = new SnapshotStore<T, K>({
              storeId,
              name,
              version,
              schema,
              options,
              category,
              config,
              operation,
              expirationDate,
              payload, callback, storeProps, endpointCategory,
            }
            );
            return { snapshot: {} as Snapshot<T, K> }
          }

          return {
            snapshot: await snapshotStore.createSnapshot()
          };
        },


        // Step 2: Update the snapshotData method to use T and K generics
        snapshotData: (
          id: string | number | undefined,
          snapshotId: number,
          snapshotData: Map<string, Snapshot<T, K>> | null | undefined,
          category: Category | undefined,
          categoryProperties: CategoryProperties | undefined,
          dataStoreMethods: DataStore<T, K>,
          storeProps: SnapshotStoreProps<T, K>
        ): Promise<SnapshotDataType<T, K>> => {
          // Destructure storeProps for relevant properties
          const { storeId, name, version, schema, options, config, operation, expirationDate ,
            payload, callback, endpointCategory
          } = storeProps;

          return new Promise<SnapshotDataType<T, K>>(async (resolve, reject) => {
            try {


              // Create new SnapshotStore using constructor
              const snapshotStore = new SnapshotStore<T, K>({
                storeId,
                name,
                version,
                schema,
                options,
                category,
                config,
                operation,
                expirationDate,
                payload, callback, storeProps, endpointCategory
              });




              // Initialize missing properties
              const timestamp = new Date().getTime(); // Example of using current time
              const isCore = true; // Example, could be set dynamically
              const notify = (id: string, message: string, content: any, date: Date, type: NotificationType, notificationPosition?: NotificationPosition) => {
                // Implement the logic for notifying here
              };


              const items: ContentItem[] = []; // Assuming items is an array of type T
              const configOption = {}; // Example placeholder for config option

              const subscribers: SubscriberCollection<T, K> = []; // Assuming a specific type for your subscribers
              let data = snapshotData; // Example, using passed snapshotData
              const stores: SnapshotStore<T, K>[] = []; // Assuming stores is an array of SnapshotStore with T and K types

              // Helper functions
              const notifySubscribers = (
                message: string,
                subscribers: Subscriber<T, K>[],
                data: Partial<SnapshotStoreConfig<T, K>>
              ): Subscriber<T, K>[] => {
                // Implement notification logic
                return subscribers.map(subscriber => {
                  // Logic to notify each subscriber
                  return subscriber;
                });
              };

              const getSnapshots = () => [snapshotStore]; // Example: returning array with current store
              const getAllSnapshots = async (
                storeId: number,
                snapshotId: string,
                snapshotData: T,
                timestamp: string,
                type: string,
                event: Event,
                id: number,
                snapshotStore: SnapshotStore<T, K>,
                category: Category,
                categoryProperties: CategoryProperties | undefined,
                dataStoreMethods: DataStore<T, K>,
                data: T,
                dataCallback?: (subscribers: Subscriber<T, K>[], snapshots: Snapshots<T>) => Promise<SnapshotUnion<T>[]>
              ): Promise<Snapshot<T, K>[]> => {
                // Logic to fetch all snapshots
                const snapshots = await snapshotStore.getAllSnapshots(
                  storeId, snapshotId, snapshotData, timestamp, type, event, id, snapshotStore, category, categoryProperties, dataStoreMethods, data, dataCallback,
                );
                return Promise.resolve(snapshots); // Ensure it returns a promise
              };

              const generateId = () => `${Date.now()}`; // Example: generating an ID based on timestamp

              const compareSnapshots = (
                snapshotA: Snapshot<T, K>,
                snapshotB: Snapshot<T, K>
              ) => {
                const differences: Record<string, { snapshot1: any; snapshot2: any }> = {};
                // Compare snapshots and populate differences

                const versionHistory = {
                  snapshot1Version: snapshotA.version,
                  snapshot2Version: snapshotB.version,
                }

                return {
                  snapshot1: snapshotA,
                  snapshot2: snapshotB,
                  differences,
                  versionHistory,
                };
              };

              const compareSnapshotItems = <
                T extends Data,
                K extends Data,
                Key extends keyof Snapshot<T, K>
              >(
                snap1: Snapshot<T, K>,
                snap2: Snapshot<T, K>,
                keys: Key[]
              ) => {
                const itemDifferences: Record<string, any> = {};

                keys.forEach((key) => {
                  if (snap1[key] !== snap2[key]) {
                    itemDifferences[key] = {
                      snapshot1: snap1[key],
                      snapshot2: snap2[key],
                      differences: {
                        value1: snap1[key],
                        value2: snap2[key],
                      },
                    };
                  }
                });

                if (Object.keys(itemDifferences).length === 0) {
                  return null; // No differences
                }

                return { itemDifferences };
              };

              const getStore = (storeId: string) => stores.find(store => store.storeId === storeId); // Get store by ID
              const addStore = (store: SnapshotStore<T, K>) => stores.push(store); // Add new store

              // Batch functions (placeholder implementations)
              const batchTakeSnapshot = async (
                snapshotId: string,
                snapshotStore: SnapshotStore<T, K>,
                snapshots: Snapshots<T>
              ): Promise<{ snapshots: Snapshots<T> }> => {
                // Perform snapshot taking logic
                // Assume some logic modifies the snapshots
                const updatedSnapshots = snapshots; // Your logic to update snapshots

                return { snapshots: updatedSnapshots };
              };

              const batchFetchSnapshots = async () => { /* Batch fetch logic */ };
              const batchTakeSnapshotsRequest = async () => { /* Batch take request logic */ };
              const batchUpdateSnapshotsRequest = async () => { /* Batch update request logic */ };
              const batchFetchSnapshotsSuccess = () => { /* Success handler for fetch */ };
              const batchFetchSnapshotsFailure = () => { /* Failure handler for fetch */ };
              const batchUpdateSnapshotsSuccess = () => { /* Success handler for update */ };
              const batchUpdateSnapshotsFailure = () => { /* Failure handler for update */ };

              // Filtering snapshots
              const filterSnapshotsByStatus = (status: string) => stores.filter(store => store.status === status);
              const filterSnapshotsByCategory = (category: Category) => stores.filter(store => store.category === category);
              const filterSnapshotsByTag = (tag: string) => stores.filter(store => store.tags.includes(tag));

              // Snapshot operation handlers
              const handleSnapshotSuccess = () => { /* Handle successful snapshot */ };
              const getSnapshotId = () => snapshotId; // Return current snapshot ID
              const compareSnapshotState = () => { /* Implement state comparison */ };
              const getInitialState = () => { /* Return initial state */ };
              const getConfigOption = () => configOption;
              const getTimestamp = () => timestamp;
              const getStores = () => stores;
              const getData = () => data;
              const setData = (newData: T) => { data = newData; };
              const addData = (newData: T) => { data = { ...data, ...newData }; };
              const mapSnapshot = () => { /* Implement snapshot mapping */ };
              const mapSnapshotWithDetails = () => { /* Implement snapshot mapping with details */ };
              const removeStore = (storeId: number) => stores.filter(store => store.storeId !== storeId);
              const unsubscribe = () => { /* Implement unsubscribe logic */ };
              const fetchSnapshot = async () => { /* Implement fetch logic */ };
              const fetchSnapshotSuccess = () => { /* Success handler for fetch */ };
              const updateSnapshotFailure = () => { /* Failure handler for update */ };
              const fetchSnapshotFailure = () => { /* Failure handler for fetch */ };
              const addSnapshotFailure = () => { /* Failure handler for add */ };
              const configureSnapshotStore = () => { /* Implement configuration logic */ };
              const updateSnapshotSuccess = () => { /* Success handler for update */ };
              const createSnapshotFailure = () => { /* Failure handler for creation */ };
              const createSnapshotSuccess = () => { /* Success handler for creation */ };
              const createSnapshots = () => { /* Implement creation logic */ };

              // Ensure the return value satisfies SnapshotDataType<T, K>
              const snapshotDataResult: SnapshotDataType<T, K> = {
                snapshotStore: snapshotStore,  // Or some other relevant structure,
                setSnapshotCategory: (newCategory: Category) => {
                  snapshotStore.category = newCategory;
                },
                getSnapshotCategory: () => snapshotStore.category,
                getSnapshotData: () => snapshotData,  // or some transformation of snapshotData
                deleteSnapshot: async () => {
                  // Implement logic for deleting snapshot
                },
                id,
                items,
                config,
                subscribers,
                data,
                timestamp,
                isCore,
                notify,

                notifySubscribers,
                getSnapshots,
                getAllSnapshots,
                generateId,

                compareSnapshots,
                compareSnapshotItems,
                batchTakeSnapshot,
                batchFetchSnapshots,

                batchTakeSnapshotsRequest,
                batchUpdateSnapshotsRequest,
                filterSnapshotsByStatus,
                filterSnapshotsByCategory,

                filterSnapshotsByTag,
                batchFetchSnapshotsSuccess,
                batchFetchSnapshotsFailure,
                batchUpdateSnapshotsSuccess,

                batchUpdateSnapshotsFailure,
                snapshot,
                handleSnapshotSuccess,
                getSnapshotId,

                compareSnapshotState,
                payload,
                dataItems,
                newData,
                getInitialState,
                getConfigOption,
                getTimestamp,
                getStores,

                getData,
                setData,
                addData,
                stores,
                getStore,
                addStore,
                mapSnapshot,
                mapSnapshotWithDetails,

                removeStore,
                unsubscribe,
                fetchSnapshot,
                fetchSnapshotSuccess,
                updateSnapshotFailure,
                fetchSnapshotFailure,
                addSnapshotFailure,
                configureSnapshotStore,

                updateSnapshotSuccess,
                createSnapshotFailure,
                createSnapshotSuccess,
                createSnapshots,

                storeId,
                snapConfig,
                onSnapshot,
                onSnapshots,
                events
                // Add other methods or properties that are required by SnapshotDataType<T, K>
              };


              // If you need to resolve with the snapshotStore instead of SnapshotDataType
              resolve(snapshotDataResult);

            } catch (error: any) {
              const errorMessage = `Failed to get specific snapshot data for ${name}`;
              handleApiError(error, errorMessage);
              reject(error);
            }
          });
        },

        snapshotsArray: undefined,
        snapshotsObject: undefined,
      };

      // Step 2: Prepare headers
      const accessToken = localStorage.getItem("accessToken");
      const userId = localStorage.getItem("userId");
      const currentAppVersion = configData.currentAppVersion;

      const authenticationHeaders: AuthenticationHeaders =
        createAuthenticationHeaders(accessToken, userId, currentAppVersion);
      const headersArray = [
        authenticationHeaders,
        createCacheHeaders(),
        createContentHeaders(),
        generateCustomHeaders({}),
        createRequestHeaders(accessToken || ""),
        // Add other header objects as needed
      ];
      const headers = Object.assign({}, ...headersArray);

      // Step 3: Make the API request
      const response = await axiosInstance.get<SnapshotContainer<T, K>>(
        `${API_BASE_URL}/${snapshotId}/container`,
        {
          headers: headers as Record<string, string>,
        }
      );

      if (response.status === 200) {
        // Step 4: Merge the response data into snapshotContainer
        Object.assign(snapshotContainer, response.data);
      } else {
        const appConfig: AppConfig = getAppConfig();
        handleOtherStatusCodes(appConfig, response.status);
        reject(new Error(`Unhandled response status: ${response.status}`));
        return;
      }

      // Step 5: Resolve the Promise with the updated snapshotContainer
      resolve(snapshotContainer);
    } catch (error) {
      const errorMessage = "Failed to get snapshot container";
      handleApiError(error as AxiosError<unknown>, errorMessage);
      reject(error);
    }
  });
};

export type { ItemUnion, SnapshotBase, SnapshotContainer, SnapshotContainerData, SnapshotDataType, SnapshotCommonProps };

