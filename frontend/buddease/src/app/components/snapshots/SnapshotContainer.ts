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
import { SnapshotManager } from "../hooks/useSnapshotManager";
import { Category } from "../libraries/categories/generateCategoryProperties";
import { Content } from "../models/content/AddContent";
import { BaseData, Data } from "../models/data/Data";
import { K } from '../models/data/dataStoreMethods';
import { NotificationPosition } from "../models/data/StatusType";
import { RealtimeDataItem } from "../models/realtime/RealtimeData";
import { DataStoreMethods } from "../projects/DataAnalysisPhase/DataProcessing/ DataStoreMethods";
import { DataStore } from "../projects/DataAnalysisPhase/DataProcessing/DataStore";
import axiosInstance from "../security/csrfToken";
import CalendarManagerStoreClass from "../state/stores/CalendarEvent";
import { Subscription } from "../subscriptions/Subscription";
import { NotificationType } from "../support/NotificationContext";
import { Subscriber } from "../users/Subscriber";
import { isSnapshotDataType } from "../utils/snapshotUtils";
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
import { createSnapshotInstance } from "./snapshot";
import { SnapshotOperation, SnapshotOperationType } from "./SnapshotActions";
import { ConfigureSnapshotStorePayload, createSnapshotConfig, SnapshotConfig } from "./SnapshotConfig";
import { CustomSnapshotData, SnapshotData, SnapshotRelationships } from "./SnapshotData";
import { batchUpdateSnapshots } from './snapshotHandlers';
import { SnapshotInitialization } from './SnapshotInitialization';
import { SnapshotMethods } from "./SnapshotMethods";
import { InitializedConfig, SnapshotStoreConfig } from "./SnapshotStoreConfig";
import { SnapshotSubscriberManagement } from './SnapshotSubscriberManagement';
import { TagsRecord } from './SnapshotWithCriteria';
import { SnapshotStoreProps } from './useSnapshotStore';

const API_BASE_URL = endpoints.snapshots


type SnapshotDataType<T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T,
  ExcludedFields extends Data = never> =
  | Map<string, Snapshot<T, Meta, K>>
  | SnapshotData<T, Meta, K>
  | SnapshotStore<T, Meta, K>
  | Map<string, SnapshotStore<T, Meta, K>>
  | Promise<{ snapshot: Snapshot<T, Meta, K> }> // Add this option
  | undefined;

type ItemUnion = ContentItem | K; // Assuming K extends Data

interface SnapshotCommonProps<T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T> {
  criteria?: any; // Define a more specific type if you have one
  category?: string | symbol | Category; // Optional category
  categoryProperties?: CategoryProperties; // Define the type as needed
  delegate?: any; // Specify the type if known
  snapshot?: Snapshot<T, Meta, K>; // Optional snapshot
  events?: Event[]; // Specify the type for events if known
  dataItems?: T[]; // Define the type based on your data structure
  newData?: T; // Define what type newData should be
  payload?: any; // Specify the type if known
  store?: SnapshotStore<T, Meta, K>; // Optional store to retrieve from
  callback?: (data: T) => void; // Define the callback type as needed
}

interface SnapshotBase<T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T> {
  id: string | number | undefined;
  data: InitializedData | null | undefined;
  items: ItemUnion[];
  config: Promise<SnapshotStoreConfig<T, Meta, K> | null>;
  timestamp: string | number | Date | undefined;
  currentCategory: Category | undefined;

  title?: string;
  description?: string | null;
  tags?: TagsRecord | string[] | undefined;
  key?: string;
  state?: SnapshotsArray<T, Meta> | null;
  topic?: string;
  find: (id: string) => SnapshotStore<T, Meta, K> | undefined;
  // Category related methods
  setSnapshotCategory: (id: string, newCategory: string | Category) => void;
  getSnapshotCategory: (id: string) => Category | undefined;
}


interface SnapshotContainerData<T, Meta, K extends Data = T, ExcludedFields extends Data = never> {
  id: string | number | undefined;
  data: InitializedData | undefined;
  items: ItemUnion[];
  config: Promise<SnapshotStoreConfig<T, Meta, K> | null>;
  timestamp: string | number | Date | undefined;
  currentCategory: Category;
}

interface SnapshotContainer<T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T> extends SnapshotBase<T, Meta, K>,
  SnapshotData<T, Meta, K>,
  SnapshotMethods<T, Meta, K>, SnapshotRelationships<T, Meta, K>,
  SnapshotInitialization<T, Meta, K>, SnapshotContainerData<T, Meta, K> {
  name: string | undefined;
  mappedSnapshotData: Map<string, Snapshot<T, Meta, K>> | undefined;
  subscriberManagement?: SnapshotSubscriberManagement<T, Meta, K>;
  criteria: CriteriaType | undefined,
  content?: string | Content<T, Meta, K> | undefined;
  snapshotCategory: SnapshotCategory<T, Meta, K> | undefined,
  snapshotSubscriberId: string | null | undefined;
  taskIdToAssign?: string;
  initialConfig: InitializedConfig | {};
  removeSubscriber: any;
  onError: (error: any) => void;
  data: InitializedData | null | undefined;
  snapshotsArray?: SnapshotsArray<T, Meta>;
  snapshotsObject?: SnapshotsObject<T, Meta, K>;
  snapshots?: Snapshots<T, Meta>
  currentCategory: Category | undefined;
  snapshotContent?: string | Content<T, Meta, K> | undefined; // Add snapshotContent if needed

  snapshotId?: string | number | undefined | null;
  onInitialize: () => void;
  snapshot: (
    id: string | number | undefined,
    snapshotId: string | number | null,
    snapshotData: SnapshotData<T, Meta, K>, // Updated to SnapshotData<T, Meta, K>
    category: symbol | string | Category | undefined,
    categoryProperties: CategoryProperties | undefined,
    callback: (snapshotStore: SnapshotStore<T, Meta, K>) => void,
    dataStore: DataStore<T, Meta, K>,
    dataStoreMethods: DataStoreMethods<T, Meta, K>,
    // dataStoreSnapshotMethods: DataStoreWithSnapshotMethods<T, Meta, K>,
    metadata: UnifiedMetaDataOptions,
    subscriberId: string, // Add subscriberId here
    endpointCategory: string | number,// Add endpointCategory here
    storeProps: SnapshotStoreProps<T, Meta, K>,
    snapshotConfigData: SnapshotConfig<T, Meta, K>,
    subscription: Subscription<T, Meta, K>,
    snapshotStoreConfigData?: SnapshotStoreConfig<T, Meta, K>,
    snapshotContainer?: SnapshotStore<T, Meta, K> | Snapshot<T, Meta, K> | null,
  ) => Snapshot<T, Meta, K> | Promise<{ snapshot: Snapshot<T, Meta, K>; }>; // Primary or detailed snapshot

  snapshotStore: SnapshotStore<T, Meta, K> | null;

  snapshotContainer?: SnapshotStore<T, Meta, K> | Snapshot<T, Meta, K> | null;

  snapshotData: (
    id: string | number | undefined,
    snapshotId: number,
    data: Snapshot<T, Meta, K>,
    mappedSnapshotData: Map<string, Snapshot<T, Meta, K>> | null | undefined,
    snapshotData: SnapshotData<T, Meta, K>,
    snapshotStore: SnapshotStore<T, Meta, K>,
    category: Category | undefined,
    categoryProperties: CategoryProperties | undefined,
    // dataStore: DataStore<T, Meta, K>,
    dataStoreMethods: DataStoreMethods<T, Meta, K>,
    storeProps: SnapshotStoreProps<T, Meta, K>,
    storeId?: number
  ) => Promise<SnapshotDataType<T, Meta, K>>;
  
  // Method to convert and retrieve the appropriate snapshot
  getSnapshot: (
    snapshotId: string | number,
    storeId: number,
    additionalHeaders?: Record<string, string>
  ) => Promise<Snapshot<T, Meta, K>> {
  // Updated method to set the current category
 // Updated method to set the current category
 setSnapshotCategory: (id: string, newCategory: string | Category) => void;


  // Method to get the current category
  getSnapshotCategory: (id: string) => Category | undefined;

  // Add other fields as necessary
  }
}

// Utility method to initialize properties of SnapshotContainer
function initializeSnapshotContainer<T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T>(
  snapshotContainer: Partial<SnapshotContainer<T, Meta, K>>,
  initialValues: Partial<SnapshotContainer<T, Meta, K>>
): SnapshotContainer<T, Meta, K> {
  // Iterate over each key in the initialValues and assign it to snapshotContainer
  for (const key in initialValues) {
    if (initialValues.hasOwnProperty(key)) {
      // Using dot notation to set the value
      snapshotContainer[key as keyof SnapshotContainer<T, Meta, K>] = initialValues[key as keyof SnapshotContainer<T, Meta, K>];
    }
  }
  
  // Cast to SnapshotContainer to return the initialized container
  return snapshotContainer as SnapshotContainer<T, Meta, K>;
}


// Example of initializing SnapshotContainer within a method
function configureSnapshotContainer<T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T>(
  container: Partial<SnapshotContainer<T, Meta, K>>,
  config: Partial<SnapshotContainer<T, Meta, K>>
): SnapshotContainer<T, Meta, K> {
  // Use the initializeSnapshotContainer utility to set the properties
  return initializeSnapshotContainer(container, config);
}





export const snapshotContainer = <T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T>(
  snapshotId: string,
  storeId: number,
  storeConfig: SnapshotStoreConfig<T, Meta, K> // Add storeConfig here
): Promise<SnapshotContainer<T, Meta, K>> => {
  return new Promise(async (resolve, reject) => {
    try {


      // Step 1: Initialize the snapshotContainer object
      const snapshotContainer: SnapshotContainer<T, Meta, K> = {
        name: "",
        initialConfig: {},
        removeSubscriber: () => {},
        onError: (error: any) => {},
        snapshots: [],
        onInitialize: () => {},
        id: "",
        items: [],
        config: Promise.resolve(storeConfig), // Assign the promise correctly for config
        storeId,
        isExpired:() => false, // Assuming this is a boolean; adjust as needed
        subscribers: [],
        getSnapshotData: (
          id: string | number | undefined,
          snapshotId: number,
          snapshotData: T,
          category: Category | undefined,
          categoryProperties: CategoryProperties | undefined,
          dataStoreMethods: DataStore<T, Meta, K>
        ): Map<string, Snapshot<T, Meta, K>> | null | undefined => {},
        deleteSnapshot: (id: string) => {},
        isCore: false,
        snapConfig: storeConfig, // Directly use the storeConfig

        getSnapshots: (category: string, data: Snapshots<T, Meta>) => {},
        getAllSnapshots: (
          storeId: number,
          snapshotId: string,
          snapshotData: T,
          timestamp: string,
          type: string,
          event: Event,
          id: number,
          snapshotStore: SnapshotStore<T, Meta, K>,
          category: symbol | string | Category | undefined,
          categoryProperties: CategoryProperties | undefined,
          dataStoreMethods: DataStore<T, Meta, K>,
          data: T,
          dataCallback?: (
            subscribers: Subscriber<T, Meta, K>[],
            snapshots: Snapshots<T, Meta>
          ) => Promise<SnapshotUnion<T, Meta>[]>
        ): Promise<Snapshot<T, Meta, K>[]> =>{},
      
        generateId: "",
        
        compareSnapshots: (snap1: Snapshot<T, Meta, K>, snap2: Snapshot<T, Meta, K>) => {
          const differences: Record<string, { snapshot1: any; snapshot2: any }> = {};
          let hasDifferences = false;

          // Compare each property in the snapshots
          for (const key in snap1) {
            if (snap1[key] !== snap2[key]) {
              differences[key] = {
                snapshot1: snap1[key],
                snapshot2: snap2[key],
              };
              hasDifferences = true;
            }
          }

          if (!hasDifferences) {
            return null; // Return null if no differences are found
          }

          return {
            snapshot1: snap1,
            snapshot2: snap2,
            differences,
            versionHistory: {
              snapshot1Version: snap1.version, // Assuming `version` is a property on the snapshot
              snapshot2Version: snap2.version,
            },
          };
        },
        
       
        // Provide functional or placeholder implementations for these properties
        compareSnapshotItems: (
          snap1: Snapshot<T, Meta, K>,
          snap2: Snapshot<T, Meta, K>,
          keys: (keyof Snapshot<T, Meta, K>)[]
        ) => {
          const itemDifferences: Record<string, {
            snapshot1: any;
            snapshot2: any;
            differences: { [key: string]: { value1: any; value2: any } };
          }> = {};
        
          // Compare each key and check for differences
          keys.forEach((key) => {
            const value1 = snap1[key];
            const value2 = snap2[key];
            if (value1 !== value2) {
              itemDifferences[String(key)] = {
                snapshot1: value1,
                snapshot2: value2,
                differences: {
                  [String(key)]: { value1, value2 },
                },
              };
            }
          });
        
          // Return null if there are no differences
          return Object.keys(itemDifferences).length > 0 ? { itemDifferences } : null;
        },

        batchTakeSnapshot: async (
          id: number,
          snapshotId: string,
          snapshotStore: SnapshotStore<T, Meta, K>,
          snapshots: Snapshots<T, Meta>
        ) => {
          // Placeholder logic for taking a snapshot
          const updatedSnapshots = [...snapshots, { id: snapshotId, data: snapshotStore } as Snapshot<T, Meta, K>];
        
          // Return the modified snapshots array wrapped in an object
          return {
            snapshots: updatedSnapshots,
          };
        },
        
        batchTakeSnapshot: async (
          id: number,
          snapshotId: string,
          snapshotStore: SnapshotStore<T, Meta, K>,
          snapshots: Snapshots<T, Meta>
        ): Promise<{ snapshots: Snapshots<T, Meta> }> => {
          // Await the promise to get data
          const fetchedData = await snapshotApi.getSnapshotData<T, Meta, K>(snapshotId);
        
          // Check if fetchedData is of type SnapshotDataType<T, Meta, K>
          if (!isSnapshotDataType(fetchedData)) {
            throw new Error(`Data for snapshot ID: ${snapshotId} is not a valid SnapshotDataType.`);
          }
        
          // We can safely assign fetchedData to data as it is confirmed to be of type SnapshotDataType<T, Meta, K>
          const data: SnapshotDataType<T, Meta, K> = fetchedData;
        
          if (data === undefined) {
            throw new Error("SnapshotDataType not converted to Data ");
          }
        
          // Ensure that data is assignable to the expected type
          const category: symbol | string | Category | undefined = undefined; // Replace with actual logic
          const snapshotStoreConfig: SnapshotStoreConfig<T, Meta, K> | null = null; // Or populate as needed
        
          // Create a new snapshot instance
          const newSnapshot = createSnapshotInstance(
            snapshotId,
            data as unknown as T, // Cast to T, ensuring T conforms to Data
            category,
            snapshotStore,
            snapshotStoreConfig
          );
        
          // Ensure updatedSnapshots is of type Snapshots<T, Meta>
          const updatedSnapshots: Snapshots<T, Meta> = [
            ...(snapshots as SnapshotsArray<T, Meta>), 
            newSnapshot
          ];
        
          // Return the modified snapshots array wrapped in an object
          return {
            snapshots: updatedSnapshots,
          };
        },
        
        
        batchTakeSnapshotsRequest: async (
          criteria: CriteriaType,
          snapshotData: (snapshotIds: string[], snapshots: Snapshots<T, Meta>, subscribers: Subscriber<T, Meta, K>[]) => Promise<{ subscribers: Subscriber<T, Meta, K>[] }>
        ) => {
          // Example: Process criteria and use snapshotData function
          await snapshotData([], [], []);
        
          // No explicit return type is required
        },
        
        batchUpdateSnapshotsRequest: "",
        filterSnapshotsByStatus: "",
        filterSnapshotsByCategory: "",
        filterSnapshotsByTag: "",
       
        batchFetchSnapshotsSuccess: "",
        batchFetchSnapshotsFailure: "",
        batchUpdateSnapshotsSuccess: "",
        batchUpdateSnapshotsFailure: "",
       
        handleSnapshotSuccess: "",
        handleSnapshotFailure: "",
        getSnapshotId: "",
        compareSnapshotState: "",
        
        payload: "",
        dataItems: "",
        newData: "",
        getInitialState: "",
        payload: "",
        dataItems: "",
        newData: "",
        getInitialState: "",
       
        getConfigOption: "",
        getTimestamp: "",
        getStores: "",
        getData: "",
        getDataVersions: "",
        updateDataVersions: "",
        setData: "",
        addData: "",
       
        removeData: "",
        updateData: "",
        stores: "",
        getStore: "",
        addStore: "",
        mapSnapshot: "",
        mapSnapshotWithDetails: "",
        removeStore: "",
       
        unsubscribe: "",
        fetchSnapshot: "",
        fetchSnapshotSuccess: "",
        updateSnapshotFailure: "",
       
        fetchSnapshotFailure: (snapshotId: string, snapshotManager: SnapshotManager<T, Meta, K>, snapshot: Snapshot<T, Meta, K>, date: Date | undefined, payload: { error: Error; }) =>{},
        addSnapshotFailure: (
          date: Date, 
          snapshotManager: SnapshotManager<T, Meta, K>, 
          snapshot: Snapshot<T, Meta, K>, 
          payload: { error: Error; }
        ) => { },
        // Example usage within one of the SnapshotMethods
        configureSnapshotStore: (
          snapshotStore: SnapshotStore<T, Meta, K>,
          storeId: number,
          data: Map<string, Snapshot<T, Meta, K>>,
          events: Record<string, CalendarManagerStoreClass<T, Meta, K>[]>,
          dataItems: RealtimeDataItem[],
          newData: Snapshot<T, Meta, K>,
          payload: ConfigureSnapshotStorePayload<T, Meta, K>,
          store: SnapshotStore<any, Meta, K>,
          callback: (snapshotStore: SnapshotStore<T, Meta, K>) => void,
          config: SnapshotStoreConfig<T, Meta, K>
        ) => {
          // Initialize the SnapshotContainer
          const snapshotContainer = configureSnapshotContainer({}, {
            snapshotStore,
            storeId,
            data,
            events,
            dataItems,
            newData,
            payload,
            store,
            config
          });

          // Proceed with other operations using snapshotContainer
          callback(snapshotStore);
        },
        updateSnapshotSuccess: (snapshotId: string, 
          snapshotManager: SnapshotManager<T, Meta, K>,
          snapshot: Snapshot<T, Meta, K>,
          payload?: { data?: Error | undefined; } | undefined
        ) => { },
       
        createSnapshotFailure: (date: Date,
          snapshotId: string, 
          snapshotManager: SnapshotManager<T, Meta, K>, 
          snapshot: Snapshot<T, Meta, K>, 
          payload: { error: Error; }) =>{},
        createSnapshotSuccess: (
          snapshotId: string, 
          snapshotManager: SnapshotManager<T, Meta, K>, snapshot: Snapshot<T, Meta, K>, 
          payload?: {
          data?: any;
      }) => {},
        createSnapshots: (
          id: string,
          snapshotId: string,
          snapshots: Snapshot<T, Meta, K>[], // Use Snapshot<T, Meta, K>[] here
          snapshotManager: SnapshotManager<T, Meta, K>,
          payload: CreateSnapshotsPayload<T, Meta, K>,
          callback: (snapshots: Snapshot<T, Meta, K>[]) => void | null,
          snapshotDataConfig?: SnapshotConfig<T, Meta, K>[] | undefined,
          category?: string | Category,
          categoryProperties?: string | CategoryProperties
        ): Snapshot<T, Meta, K>[] | null => {},
        onSnapshot: (snapshotId: string,
          snapshot: Snapshot<T, Meta, K>, 
          type: string, 
          event: Event, 
          callback: (snapshot: Snapshot<T, Meta, K>
        ) => void) => {},
       
        onSnapshots: (id: string,
          snapshot: Snapshot<SnapshotUnion<BaseData, Meta>, T>

        ): string | null => {},
        events: {},
        childIds: [],
        getParentId: (id: string, 
          snapshot: Snapshot<SnapshotUnion<BaseData, Meta>, T>

        ): string | null =>{},
        mappedSnapshotData: "",
        criteria: "",
        snapshotCategory: "",
        snapshotSubscriberId: "",
       
   
        // Corrected getChildIds method
        getChildIds: (id: string, childSnapshot: Snapshot<T, Meta, K>): (string | number | undefined)[] => {
          // Logic to retrieve child IDs from the childSnapshot
          return []; // Return an empty array for demonstration
        },
        addChild: (
          parentId: string, 
          childId: string, 
          childSnapshot: CoreSnapshot<T, Meta, K>

        ) => {},
        removeChild: (
          childId: string,
          parentId: string, 
          parentSnapshot: CoreSnapshot<T, Meta, K>, 
          childSnapshot: CoreSnapshot<T, Meta, K>
        ) => {},
        getChildren: (id: string, childSnapshot: Snapshot<T, Meta, K>): CoreSnapshot<T, Meta, K>[] => {},
        hasChildren: (id: string): boolean => {},
        isDescendantOf: (childId: string, parentId: string, parentSnapshot: Snapshot<T, Meta, K>, childSnapshot: Snapshot<T, Meta, K>): boolean => {},
        getSnapshotById: (id: string): Snapshot<T, Meta, K> | null => {},
       

        timestamp: undefined,
        find: (id: string): SnapshotStore<T, Meta, K> | undefined => {
          // Logic for finding a snapshot within the container
          // If snapshots is an array
          return snapshotContainer.snapshots.find(snapshot => snapshot.id === id);
        },
        initialState: {}, // Initial state if needed

        data: new Map(), // Initializing data with a Map or your required data structure
        snapshotStore: null, // This can be set dynamically later
        criteria: {}, // Define criteria if needed, otherwise set to an empty object
        content: undefined, // Placeholder for snapshot content
        snapshotCategory: undefined, // Set dynamically or as needed
        snapshotSubscriberId: undefined, // Initialize or set dynamically
        snapshotContent: undefined, // Snapshot content to be populated later

        currentCategory: undefined, // Assuming this should be initialized
        mappedSnapshotData: new Map<string, Snapshot<T, Meta, K>>(),
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
          snapshotId: string | number | null,
          snapshotData: SnapshotData<T, Meta, K>,
          category: symbol | string | Category | undefined,
          categoryProperties: CategoryProperties | undefined,
          callback: (snapshotStore: SnapshotStore<T, Meta, K>) => void,
          dataStore: DataStore<T, Meta, K>,
          dataStoreMethods: DataStoreMethods<T, Meta, K>,
          // dataStoreSnapshotMethods: DataStoreWithSnapshotMethods<T, Meta, K>,
          metadata: UnifiedMetaDataOptions,
          subscriberId: string, // Add subscriberId here
          endpointCategory: string | number, // Add endpointCategory here
          storeProps: SnapshotStoreProps<T, Meta, K>
        ): Promise<{ snapshot: Snapshot<T, Meta, K> }> => {

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
            onSnapshotCreate: (snapshot: Snapshot<T, Meta, K>) => {
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
          const version: string | Version | undefined = storeProps.version; // Optional versioning
          const additionalData: CustomSnapshotData | undefined = storeProps.additionalData; // Custom additional data

          // Define or retrieve `existingConfigs` from somewhere in your system
          const existingConfigs: Map<string, SnapshotConfig<T, Meta, K>> = storeProps.existingConfigs || new Map();

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

            create: (snapshotData: SnapshotData<T, Meta, K>): Promise<Snapshot<T, Meta, K>> => {
              console.log("Creating snapshot...");

              return apiCall<T, Meta, K>(
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

            update: (snapshotId: string | number, updatedData: SnapshotDataType<T, Meta, K>): Promise<Snapshot<T, Meta, K>> => {
              console.log("Updating snapshot...");

              return apiCall<T, Meta, K>(
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

            delete: (snapshotId: string | number): Promise<Snapshot<T, Meta, K>> => {
              console.log("Deleting snapshot...");

              return apiCall<T, Meta, K>(
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
            snapshotStore: SnapshotStore<T, Meta, K>,
            snapshot: Snapshot<T, Meta, K>,
            operation: SnapshotOperation,
            operationType: SnapshotOperationType,
            callback: (snapshotStore: SnapshotStore<T, Meta, K>) => void,
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
          const addToSnapshotList = (snapshot: Snapshot<T, Meta, K>) => {
            console.log("Adding to snapshot list:", snapshot);
          };


          const validateSnapshot = (snapshot: Snapshot<T, Meta, K>) => {
            console.log("Validating snapshot:", snapshot);
          }

          // Find the subscriber
          const subscriber = await snapshotApi.findSubscriberById(subscriberId, category, endpointCategory);

          // Use the flexible type SubscriberCollection
          const subscribers: SubscriberCollection<BaseData, Meta, BaseData> = [subscriber];

          // Fetch snapshots for the subscriber
          const snapshots = await snapshotApi.findSnapshotsBySubscriber(subscriberId, category, endpointCategory, snapshotConfig);

          // Convert snapshots to Snapshot<BaseData, Meta, BaseData> type
          const convertedSnapshots: Snapshot<BaseData, Meta, BaseData>[] = snapshots.map(
            (snapshot) => snapshot as unknown as Snapshot<BaseData, Meta, BaseData>
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

          const options: SnapshotStoreOptions<T, Meta, K> = {
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
            const snapshotStore = new SnapshotStore<T, Meta, K>({
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
            return { snapshot: {} as Snapshot<T, Meta, K> }
          }

          return {
            snapshot: await snapshotStore.createSnapshot()
          };
        },


        // Step 2: Update the snapshotData method to use T and K generics
        snapshotData: (
          id: string | number | undefined,
          snapshotId: string | number | null,
          data: Snapshot<T, Meta, K>,
          mappedSnapshotData: Map<string, Snapshot<T, Meta, K>> | null | undefined,
          snapshotData: SnapshotData<T, Meta, K>,
          snapshotStore: SnapshotStore<T, Meta, K>,
          category: Category | undefined,
          categoryProperties: CategoryProperties | undefined,
          dataStoreMethods: DataStore<T, Meta, K>,
          storeProps: SnapshotStoreProps<T, Meta, K>
        ): Promise<SnapshotDataType<T, Meta, K>> => {
          // Destructure storeProps for relevant properties
          const { storeId, name, version, schema, options, config, operation, expirationDate ,
            payload, callback, endpointCategory
          } = storeProps;

          return new Promise<SnapshotDataType<T, Meta, K>>(async (resolve, reject) => {
            try {


              // Create new SnapshotStore using constructor
              const snapshotStore = new SnapshotStore<T, Meta, K>({
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

              const subscribers: SubscriberCollection<T, Meta, K> = []; // Assuming a specific type for your subscribers
              let data = snapshotData; // Example, using passed snapshotData
              const stores: SnapshotStore<T, Meta, K>[] = []; // Assuming stores is an array of SnapshotStore with T and K types

              // Helper functions
              const notifySubscribers = (
                message: string,
                subscribers: Subscriber<T, Meta, K>[],
                data: Partial<SnapshotStoreConfig<T, Meta, K>>
              ): Subscriber<T, Meta, K>[] => {
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
                snapshotStore: SnapshotStore<T, Meta, K>,
                category: Category,
                categoryProperties: CategoryProperties | undefined,
                dataStoreMethods: DataStore<T, Meta, K>,
                data: T,
                dataCallback?: (subscribers: Subscriber<T, Meta, K>[], snapshots: Snapshots<T, Meta>) => Promise<SnapshotUnion<T, Meta>[]>
              ): Promise<Snapshot<T, Meta, K>[]> => {
                // Logic to fetch all snapshots
                const snapshots = await snapshotStore.getAllSnapshots(
                  storeId, snapshotId, snapshotData, timestamp, type, event, id, snapshotStore, category, categoryProperties, dataStoreMethods, data, dataCallback,
                );
                return Promise.resolve(snapshots); // Ensure it returns a promise
              };

              const generateId = () => `${Date.now()}`; // Example: generating an ID based on timestamp

              const compareSnapshots = (
                snapshotA: Snapshot<T, Meta, K>,
                snapshotB: Snapshot<T, Meta, K>
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
                Key extends keyof Snapshot<T, Meta, K>
              >(
                snap1: Snapshot<T, Meta, K>,
                snap2: Snapshot<T, Meta, K>,
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
              const addStore = (store: SnapshotStore<T, Meta, K>) => stores.push(store); // Add new store

              // Batch functions (placeholder implementations)
              const batchTakeSnapshot = async (
                snapshotId: string,
                snapshotStore: SnapshotStore<T, Meta, K>,
                snapshots: Snapshots<T, Meta>
              ): Promise<{ snapshots: Snapshots<T, Meta> }> => {
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

              // Ensure the return value satisfies SnapshotDataType<T, Meta, K>
              const snapshotDataResult: SnapshotDataType<T, Meta, K> = {
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
                // Add other methods or properties that are required by SnapshotDataType<T, Meta, K>
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
      const response = await axiosInstance.get<SnapshotContainer<T, Meta, K>>(
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

export type { ItemUnion, SnapshotBase, SnapshotCommonProps, SnapshotContainer, SnapshotContainerData, SnapshotDataType };

