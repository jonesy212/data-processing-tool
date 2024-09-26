// SnapshotContainer.ts
import { endpoints } from "@/app/api/endpointConfigurations";
import * as snapshotApi from "@/app/api/SnapshotApi";
import { apiCall, handleOtherStatusCodes } from "@/app/api/SnapshotApi";
import { AppConfig, getAppConfig } from "@/app/configs/AppConfig";
import { UnifiedMetaDataOptions } from '@/app/configs/database/MetaDataOptions';
import { CategoryProperties } from "@/app/pages/personas/ScenarioBuilder";
import { CriteriaType } from '@/app/pages/searchs/CriteriaType';
import { AxiosError } from "axios";
import { ContentItem } from '../cards/DummyCardLoader';
import { SnapshotStoreOptions } from "../hooks/SnapshotStoreOptions";
import { Category } from "../libraries/categories/generateCategoryProperties";
import { BaseData, Data } from "../models/data/Data";
import { DataStore } from "../projects/DataAnalysisPhase/DataProcessing/DataStore";
import axiosInstance from "../security/csrfToken";
import { handleApiError } from "./../../api/ApiLogs";
import { AuthenticationHeaders, createAuthenticationHeaders } from "./../../api/headers/authenticationHeaders";
import createCacheHeaders from "./../../api/headers/cacheHeaders";
import createContentHeaders from "./../../api/headers/contentHeaders";
import generateCustomHeaders from "./../../api/headers/customHeaders";
import createRequestHeaders from "./../../api/headers/requestHeaders";
import configData from "./../../configs/configData";
import { Snapshot, SnapshotsArray, SnapshotsObject } from "./LocalStorageSnapshotStore";
import { SnapshotOperation, SnapshotOperationType } from "./SnapshotActions";
import { SnapshotData, SnapshotRelationships } from "./SnapshotData";
import { batchUpdateSnapshots } from './snapshotHandlers';
import { SnapshotMethods } from "./SnapshotMethods";
import SnapshotStore, { SubscriberCollection } from "./SnapshotStore";
import { InitializedConfig, SnapshotStoreConfig } from "./SnapshotStoreConfig";
import { SnapshotStoreProps } from './useSnapshotStore';

const API_BASE_URL = endpoints.snapshots


type SnapshotDataType<T extends Data, K extends Data> = 
  
  | Map<string, Snapshot<T, K>>
  | SnapshotData<T, K>
  | undefined;


interface SnapshotContainer<T extends Data, K extends Data> extends SnapshotData<T, K>,
SnapshotMethods<T, K>, SnapshotRelationships<T, K>
 {
  id: string | number | undefined;
  mappedSnapshotData: Map<string, Snapshot<T, K>>,
  timestamp: string | number | Date | undefined;
  criteria: CriteriaType,
  
  content: ContentItem |  null,
  snapshotCategory: Category,
  snapshotSubscriberId: string | undefined
  taskIdToAssign?: string
  initialConfig: InitializedConfig
  removeSubscriber: any
  onInitialize: any
  onError: any
  snapshot: (
    id: string | number | undefined,
    snapshotId: string | null,
    snapshotData: SnapshotDataType<T, K>,
    category: symbol | string | Category | undefined,
    categoryProperties: CategoryProperties | undefined,
    callback: (snapshotStore: SnapshotStore<T, K>) => void,
    dataStoreMethods: DataStore<T, K>[],
    // dataStoreSnapshotMethods: DataStoreWithSnapshotMethods<T, K>,
    metadata: UnifiedMetaDataOptions,
    subscriberId: string, // Add subscriberId here
    endpointCategory: string | number ,// Add endpointCategory here
    storeProps: SnapshotStoreProps<T, K>,
    snapshotStoreConfigData?: SnapshotStoreConfig<T, K>,
    snapshotContainer?: SnapshotStore<T, K> | Snapshot<T, K> | null,
       
    ) => Snapshot<T, K> | Promise<{ snapshot: Snapshot<T, K>; }>; // Primary or detailed snapshot
  
  snapshotStore: SnapshotStore<T, K> | null;
  snapshotData: SnapshotDataType<T, K>;

  data: T | Map<string, Snapshot<T, K>> | null | undefined;
  snapshotsArray?: SnapshotsArray<T>;
  snapshotsObject?: SnapshotsObject<T>
  
  // New property added for currentCategory
  currentCategory: Category | undefined;
  
  // Updated method to set the current category
  setSnapshotCategory: (id: string, newCategory: string | Category) => void;

  // Method to get the current category
  getSnapshotCategory: (id: string) => Category | undefined;

  // Add other fields as necessary
}

export const snapshotContainer = (
  snapshotId: string,
  storeId: number 
): Promise<SnapshotContainer<Data, Data>> => {
  return new Promise(async (resolve, reject) => {
    try {
      // Step 1: Initialize the snapshotContainer object
      const snapshotContainer: SnapshotContainer<Data, Data> = {
        timestamp: undefined,
        find: () => {
          // Logic for finding a snapshot within the container
        },
        initialState: {}, // Initial state if needed
        data: new Map(), // Initializing data with a Map or your required data structure
        snapshotStore: null, // This can be set dynamically later
        criteria: {}, // Define criteria if needed, otherwise set to an empty object
        content: null, // Placeholder for snapshot content
        snapshotCategory: undefined, // Set dynamically or as needed
        snapshotSubscriberId: undefined, // Initialize or set dynamically
        snapshotContent: undefined, // Placeholder for snapshot content to be populated later
  
        
        currentCategory: undefined, // Assuming this should be initialized
        mappedSnapshotData: new Map<string, Snapshot<Data, Data>>(),
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
          snapshotData: SnapshotDataType<Data, Data>,
          category: symbol | string | Category | undefined,
          categoryProperties: CategoryProperties | undefined,
          callback: (snapshotStore: SnapshotStore<Data, Data>) => void,
          dataStoreMethods: DataStore<Data, Data>[],
          // dataStoreSnapshotMethods: DataStoreWithSnapshotMethods<T, K>,
          metadata: UnifiedMetaDataOptions,
          subscriberId: string, // Add subscriberId here
          endpointCategory: string | number, // Add endpointCategory here
          storeProps: SnapshotStoreProps<Data, Data>
        ): Promise<{ snapshot: Snapshot<Data, Data> }> => {

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
            onSnapshotCreate: (snapshot: Snapshot<Data, Data>) => {
              console.log("Snapshot created:", snapshot);
            },
            onSnapshotError: (error: Error) => {
              console.error("Snapshot error:", error);
            }
          };

          // Snapshot configuration that could include additional settings
          const snapshotConfig = {
            
            snapshotId,
            storeId,
            type,
            date
          };

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

            create: (snapshotData: SnapshotDataType<Data, Data>): Promise<Snapshot<Data, Data>> => {
              console.log("Creating snapshot...");
          
              return apiCall<Data, Data>(
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
          
            update: (snapshotId: string | number, updatedData: SnapshotDataType<Data, Data>): Promise<Snapshot<Data, Data>> => {
              console.log("Updating snapshot...");
          
              return apiCall<Data, Data>(
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
          
            delete: (snapshotId: string | number): Promise<Snapshot<Data, Data>> => {
              console.log("Deleting snapshot...");
          
              return apiCall<Data, Data>(
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
            snapshotStore: SnapshotStore<Data, Data>,
            snapshot: Snapshot<Data, Data>,
            operation: SnapshotOperation,
            operationType: SnapshotOperationType,
            callback: (snapshotStore: SnapshotStore<Data, Data>) => void,
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
          const addToSnapshotList = (snapshot: Snapshot<Data, Data>) => {
            console.log("Adding to snapshot list:", snapshot);
          };


          const validateSnapshot = (snapshot: Snapshot<Data, Data>) => {
            console.log("Validating snapshot:", snapshot);
          }


            // Find the subscriber
            const subscriber = await snapshotApi.findSubscriberById(subscriberId, category, endpointCategory);

            // Use the flexible type SubscriberCollection
            const subscribers: SubscriberCollection<BaseData, BaseData> = [subscriber]; // Or a Record<string, Subscriber<T, K>[]> if applicable

      
          
          
            // Fetch snapshots for the subscriber
            const snapshots = await snapshotApi.findSnapshotsBySubscriber(subscriberId, category, endpointCategory, snapshotConfig);
            // Use the imported `batchUpdateSnapshots` function with proper arguments
            const batchUpdateSnapshotsResult = await batchUpdateSnapshots(
              subscribers,
              snapshots // Array of snapshots
            );
  

          // Simulated data source that might represent a mock or testing data set
          const simulatedDataSource = metadata?.simulatedDataSource || {};

          // Use the properties like timestamp, criteria, etc., as needed
          const { timestamp, criteria, snapshotStore, content, snapshotCategory, snapshotSubscriberId } = snapshotContainer;

        
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

          const options: SnapshotStoreOptions<Data, Data> = {
            id: id,
            data: snapshotData,
            metadata: metadata,
            criteria: {},
            storeId,
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

          const {
           
            name,
            version,
            schema,
            config,
            operation,
          } = storeProps;
        
          // Check for missing required fields
          if (!name || !version || !operation) {
            throw new Error("Name, operation and version are required for SnapshotStore");
          }
          
          if (!snapshotStore) {
            const snapshotStore = new SnapshotStore<Data, Data>({
              storeId,
              name,
              version,
              schema,
              options,
              category,
              snapshotStoreConfig,
              'createSnapshot': SnapshotOperationType
          }
            );
            return {snapshot: {} as Snapshot<Data, Data>}
          }

          return {
            snapshot: await snapshotStore.createSnapshot()
          };
        },        
        
        snapshotData: (
          id: string | number | undefined,
          snapshotId: number,
          snapshotData: T,
          category: Category | undefined,
          categoryProperties: CategoryProperties | undefined,
          dataStoreMethods: DataStore<T, K>,
          storeProps: SnapshotStoreProps<T, K>
        ): Promise<SnapshotDataType<T, K>> => {
          const { storeId, name, version, schema, options,config, operation} = storeProps
          return new SnapshotStore<T, K>({storeId, name, version, schema, options, category, config, operation, 'createSnapshot': SnapshotOperationType});
        },
        data: null,
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

export type { SnapshotContainer, SnapshotDataType };
