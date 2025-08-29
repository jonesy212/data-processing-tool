import { DataStoreMethods } from '@/app/components/projects/DataAnalysisPhase/DataProcessing/ DataStoreMethods';
// SnapshotStoreProps.ts
import { UnsubscribeDetails } from '@/app/components/event/DynamicEventHandlerExample';
import { BaseData } from '@/app/components/models/data/Data';
import { AllStatus } from '@/app/components/state/stores/DetailsListStore';
import { RealtimeDataItem } from '@/app/components/models/realtime/RealtimeData';
import { SnapshotConfig, SnapshotData, SnapshotDataType } from '@/app/components/snapshots';
import { ConfigureSnapshotStorePayload } from "@/app/components/snapshots/SnapshotConfig";
import { CustomSnapshotData } from "@/app/components/snapshots/SnapshotData";
import { data } from '@/app/components/snapshots/SnapshotWithCriteria';
import { convertSnapshotsToRecord } from '@/app/components/snapshots/convertSnapshotsToRecord';
import { createSnapshotInstance } from '@/app/components/snapshots/createSnapshotInstance';
import { fetchSnapshotsForCategory } from '@/app/components/snapshots/fetchSnapshotsForCategory';
import CalendarManagerStoreClass from "@/app/components/state/stores/CalendarManagerStore";
import { isSnapshot } from '@/app/components/utils/snapshotUtils';
import { useSecureUserId } from '@/app/components/utils/useSecureUserId';
import { createLatestVersion } from "@/app/components/versions/createLatestVersion";
import { NotificationTypeEnum } from "@/app/context/NotificationContext";
import { CategoryProperties } from "@/app/pages/personas/ScenarioBuilder";
import { CriteriaType } from '@/app/pages/searchs/CriteriaType';
import { version } from "react";
import { Category } from '../libraries/categories/generateCategoryProperties';
import { Data } from "../models/data/Data";
import { displayToast } from '../models/display/ShowToast';
import { DataStore, InitializedState } from "../projects/DataAnalysisPhase/DataProcessing/DataStore";
import {
    Snapshot,
    Snapshots,
    SnapshotsArray,
    SnapshotUnion
} from "../snapshots/LocalStorageSnapshotStore";
import { SnapshotOperation, SnapshotOperationType } from "../snapshots/SnapshotActions";
import SnapshotStore from "../snapshots/SnapshotStore";
import { SnapshotStoreConfig } from "../snapshots/SnapshotStoreConfig";

import { InitializedData, SnapshotStoreOptions } from '@/app/components/snapshots/SnapshotStoreOptions';
import { Subscriber } from '@/app/components/users/Subscriber';
import { StructuredMetadata } from "@/app/configs/StructuredMetadata";
import { Payload } from "../../../server/database/Payload";
import { SchemaField } from "../../../server/database/SchemaField";
import baseMeta from "../../../server/database/baseMeta";
import { createBaseData } from "../hooks/useSnapshotManager";
import { K, T } from '../models/data/dataStoreMethods';
import { BrowserBehaviorConfig } from "../state/BrowserBehaviorManager";
import { addToSnapshotList } from '../utils/snapshotUtils';
import Version from "../versions/Version";

type SnapshotStoreProps<
  T extends  BaseData<any>,
  K extends T = T,
> = {
  storeId: string | number;
  category: Category | undefined;
  name: string;
  criteria?: CriteriaType;
  timestamp?: string | number | Date | undefined;
  eventRecords?: Record<string, CalendarManagerStoreClass<T, K>[]> | null;
  snapshotStoreConfig?: SnapshotStoreConfig<T, K, StructuredMetadata<T, K>, never>;
  schema: Record<string, SchemaField>;
  options?: SnapshotStoreOptions<T, K>;
  config: Promise<SnapshotStoreConfig<T, K> | null>;
  createdAt?: string | Date | undefined;
  initialState: InitializedState<T, K>;
  operation: SnapshotOperation<T, K>;
  id?: string | number | undefined;
  snapshots?: Snapshots<T, K>;
  snapshotsArray?: SnapshotsArray<T, K>;
  data?: InitializedData<T, K>| null | undefined
  message?: string;
  state?: Snapshot<T, K>[] | null;
  existingConfigs?: Map<string, SnapshotConfig<T, K>>;
  description?: string | undefined; // Could be optional
  priority?: string | undefined;
  version?: string | number | Version<T, K>;
  additionalData?: CustomSnapshotData<T> | undefined; // Custom additional data
  expirationDate: Date;
  localStorage?: Storage; 
  payload: Payload | undefined;
  callback: (snapshotStore: SnapshotStore<T, K, StructuredMetadata<T, K>>) => void;
  storeProps: Partial<SnapshotStoreProps<T, K>>;
  endpointCategory: string | number;
  browserBehaviorConfig?: BrowserBehaviorConfig;
  findIndex?(predicate: (snapshot: SnapshotUnion<T, K, StructuredMetadata<T, K>>) => boolean): number;
}

const { latestVersion = createLatestVersion<T, K>(), ...rest } = (data as Record<string, any>) || {};


// Initialize storeProps with meaningful values
const storeProps: SnapshotStoreProps<T, K> = {
    category: "storeProp-category",  // Assuming category can be a string
    expirationDate: new Date(),
  
   payload: { 
        error: undefined,  // Provide a valid error value (e.g., `null` or an error object)
        meta: {
          name: "Sample Notification",
          timestamp: new Date(),
          type: NotificationTypeEnum.Info, // Replace with the appropriate enum value
          startDate: new Date(),
          endDate: new Date(),
          status: StatusType.ACTIVE, // Replace with the appropriate status
          id: "unique-notification-id",
          isSticky: false,
          isDismissable: true,
          isClickable: true,
          isClosable: true,
          isAutoDismiss: true,
          isAutoDismissable: true,
          isAutoDismissOnNavigation: false,
          isAutoDismissOnAction: false,
          isAutoDismissOnTimeout: true,
          isAutoDismissOnTap: false,
          optionalData: null, // Adjust if needed
          data: {}
      }
    },

    storeId: "yourStoreId",
    name: "MySnapshotStore", // Provide a valid name
    version: {
  
            isActive: true,
      releaseDate: "2023-07-20",
      updateStructureHash: async () => {},
      setStructureData: (newData: string) => { },
     
      hash: (value: string) => "",
      currentHash: "",
      structureData: "",
      calculateHash: () => "",
     
  
      id: 1,
      versionNumber: '1.0.0',
      major: 1,
      minor: 0,
      patch: 0,
      appVersion: '1.0.0',
      name: 'Initial version',
      url: '/versions/1',
      documentId: 'doc123',
      draft: false,
      userId: 'user1',
      content: 'Version content',
      metadata: {
        author: 'Author Name',
        area: 'snapshot store area',
        metadataEntries: {}, 
        schema: {},
        timestamp: new Date(),
        latestVersion
      },
            versions: null,
      checksum: 'abc123',
      isLatest: true,
      isPublished: true,
      publishedAt: new Date(),
      source: 'initial',
      status: 'active',
      workspaceId: 'workspace1',
      workspaceName: 'Main Workspace',
      workspaceType: 'document',
      workspaceUrl: '/workspace/1',
      workspaceViewers: ['viewer1', 'viewer2'],
      workspaceAdmins: ['admin1'],
      workspaceMembers: ['member1', 'member2'],
      data: [],
      versionHistory: {
        versionData: {},
        latestVersion: latestVersion,
        history: [],
        timestamp: new Date()
      },
      _structure: {}, // Structure of the version
      versionData: {
        id: "1", // Required property
        name: "Version Name", // Add required property
        url: "/version-url", // Add required property
        versionNumber: "1.0.0", // Add required property
        documentId: "document1", // Add required property
        draft: false, // Add required property
        userId: "user1", // Add required property
        
        content: "Version content goes here.", // Add required property
        
        major: 1, // Add required property
        minor: 0, // Add required property
        patch: 0, // Add required property
        checksum: "checksum123", // Add required property
        parentId: null, // or provide a valid ID
        parentType: "document", // or whatever type it should be
        parentVersion: "1.0.0", // Required property
        parentTitle: "Parent Document Title", // Required property
        parentContent: "Content of the parent document.", // Required property
        parentName: "Parent Document", // Required property
        parentUrl: "/parent-document", // Required property
        parentChecksum: "abc123", // Required property
        parentAppVersion: "1.0.0", // Required property
        parentVersionNumber: "1.0.0", // Required property
        isLatest: true, // Required property
        isPublished: false, // Required property
        publishedAt: null, // or a valid Date
        source: "initial", // Required property
        status: "active", // Required property
        version: version, // Required property
        timestamp: new Date(), // Required property
        user: "user1", // Required property
        changes: [], // Required property
        comments: [], // Required property
        workspaceId: "workspace1", // Required property
        workspaceName: "Main Workspace", // Required property
        workspaceType: "document", // Required property
        workspaceUrl: "/workspace/1", // Required property
        workspaceViewers: ["viewer1", "viewer2"], // Required property
        workspaceAdmins: ["admin1"], // Required property
        workspaceMembers: ["member1", "member2"], // Required property
        createdAt: new Date(), // Optional property
        updatedAt: new Date(), // Optional property
        _structure: {}, // Optional property, adjust as needed
        frontendStructure: Promise.resolve([]), // Optional property, adjust as needed
        backendStructure: Promise.resolve([]), // Optional property, adjust as needed
        data: undefined, // Adjust as per actual usage
        backend: undefined, // Adjust as per actual usage
        frontend: undefined, // Adjust as per actual usage
        isActive: true, // Optional property
        releaseDate: "2023-01-01", // Optional property
        setServices: (services: Record<string, any>) => {
            
          },
        notes: [],
        latestVersion,
        schema: {},
        metadata: {
          author: "Author Name", // Provide a valid author name
          timestamp: new Date(), // Provide a valid timestamp; can be Date, string, or number
          revisionNotes: "Initial version created.", // Optional property
          area: 'storeProps area',
          metadataEntries: {},
          latestVersion,
          schema: {}
        }, // Add required property
      },
      description: "Version description", // Description of the version
      buildNumber: "1", // Build number
      parentId: null, // Parent ID of the version
      parentType: "document", // Type of the parent document
      parentVersion: "1.0.0", // Parent version number
      parentTitle: "Parent Document Title", // Title of the parent version
      parentContent: "Content of the parent document.", // Content of the parent version
      parentName: "Parent Document", // Name of the parent
      parentUrl: "/parent-document", // URL of the parent
      parentChecksum: "parent-checksum", // Checksum of the parent
      parentAppVersion: "1.0.0", // App version of the parent
      parentVersionNumber: "1.0.0", // Version number of the parent
      getVersionNumber: () => ""
    },
    // Example version
    schema: {}, // Provide a valid schema or mock
    options: {
      id: 0,
      storeId: 0,
      baseURL: "https://example.com",
      enabled: true,
      maxRetries: 3,
      retryDelay: 1000,
      maxAge: 0,
      staleWhileRevalidate: 1000,
      cacheKey: "exampleCacheKey",
      
      initialState: {},
      eventRecords: {},
      records: [],
      category: "",
      
      date: new Date(),
      type: "",
      snapshotId: "",
      snapshotStoreConfig: undefined,
      criteria: {},
      callbacks: {},
      subscribeToSnapshots: (
        snapshotStore: SnapshotStore<T, K>,
        snapshotId: string,
        snapshotData: SnapshotData<T, K>,
        category: Category | undefined,
        snapshotConfig: SnapshotStoreConfig<T, K>,
        callback: (
          snapshotStore: SnapshotStore<T, K>, 
          snapshots: SnapshotsArray<T, K, StructuredMetadata<T, K>>
        ) => Subscriber<T, K> | null,
        snapshots: SnapshotsArray<T, K, StructuredMetadata<T, K>>,
        unsubscribe?: UnsubscribeDetails, 
      ): SnapshotsArray<T, K, StructuredMetadata<T, K>> | [] => {
        // Implement your logic here
        return snapshots; // or modify the snapshots as needed
      },
      subscribeToSnapshot: (
        snapshotId: string,
        callback: (snapshot: Snapshot<T, K>) => Subscriber<T, K> | null,
        snapshot: Snapshot<T, K>
      ):Subscriber<T, K> | null  => {
        // Implement your logic here
        return null; // or return a Subscriber if necessary
      },
      unsubscribeToSnapshots: (
        snapshotId: string,
        snapshot: Snapshot<T, K>,
        type: string,
        event: Event,
        callback: (snapshot: Snapshot<T, K>) => void  
      ) => {
        // Implement your logic here
      },
      unsubscribeToSnapshot: (snapshotId: string,
        snapshot: Snapshot<T, K>,
        type: string,
        event: Event,
        callback: (snapshot: Snapshot<T, K>) => void
      ) => {
        // Implement your logic here
      },
      delegate: null,
      getDelegate: async (context) => {
        const { useSimulatedDataSource, simulatedDataSource } = context;
  
        if (useSimulatedDataSource) {
          const stores = simulatedDataSource.map(() => {
            const { store } = createDataStore<T, K>();
            return store;
          });
  
          return stores;
        }
  
        return [];
      },
      getCategory: async <T extends BaseDataEntity, K extends T = T>(
        snapshotId: string,
        snapshot: Snapshot<T, K>,
        type: string,
        event: Event,
        snapshotConfig: SnapshotConfig<T, K>,
        category?: Category,
        additionalHeaders?: Record<string, string>
      ): Promise<{ 
        categoryProperties: CategoryProperties; 
        snapshots: SnapshotsArray<T, K> 
      }> => {
        
        // Type guard with proper typing
        const isCategoryProperties = (cat: unknown): cat is CategoryProperties => {
          return typeof cat === 'object' && cat !== null && 'name' in cat;
        };
      
        // Default properties with complete typing
        const defaultProperties: CategoryProperties = {
          id: snapshotId,
          type: type || 'default',
          name: 'Unnamed Category',
          description: '',
          icon: 'default-icon',
          color: '#000000',
          iconColor: '#FFFFFF',
          isActive: true,
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
          brandName: '',
          brandLogo: '',
          brandColor: '',
          brandMessage: '',
          chartType: 'bar',
          dataProperties: [],
          formFields: [],
          componentDescription: undefined
        };
      
        // Fetch snapshots with proper error handling
        let snapshots: SnapshotsArray<T, K> = [];
        try {
          snapshots = await fetchSnapshotsForCategory<T, K>(
            snapshotId,
            type,
            category
          );
        } catch (error) {
          console.error('Failed to fetch snapshots:', error);
          // Return empty array but you could also throw or handle differently
        }
      
        // Process category properties
        const categoryProperties: CategoryProperties = (() => {
          if (!category) return defaultProperties;
          
          if (isCategoryProperties(category)) {
            return { ...defaultProperties, ...category };
          }
          
          // Handle string/symbol case
          return {
            ...defaultProperties,
            name: typeof category === 'symbol' ? 
              category.description || 'Symbol Category' : 
              category,
            id: category.toString()
          };
        })();
      
        return {
          categoryProperties,
          snapshots
        };
      },
      configureSnap: (
        id: string,
        storeId: number,
        snapshotId: string,
        snapshotData: SnapshotData<T, K>,
        dataStoreMethods: DataStore<T, K>,
        category?:  Category,
        categoryProperties?: CategoryProperties,
        callback?: (snapshot: Snapshot<T, K>) => void,
        snapshotStore?: SnapshotStore<T, K>,
        snapshotStoreConfig?: SnapshotStoreConfig<T, K, StructuredMetadata<T, K>, never>
      ): SnapshotConfig<T, K> | undefined => {
        // Implement your configuration logic here
        const config: SnapshotConfig<T, K> = {
          // Required properties from SnapshotConfig interface
          id,
          storeId,
          snapshotId,
          snapshotData: (
            snapshotId: string | number | null,
            data: Snapshot<T, K>,
            mappedSnapshotData: Map<string, Snapshot<T, K>> | null | undefined,
            snapshotData: SnapshotData<T, K>,
            snapshotStore: SnapshotStore<T, K>,
            category: Category | undefined,
            categoryProperties: CategoryProperties | undefined,
            dataStoreMethods: DataStoreMethods<T, K>,
            storeProps: SnapshotStoreProps<T, K>,
        ): Promise<SnapshotDataType<T, K>> => {
            return new Promise(async (resolve, reject) => {
              try {
                // Implement the logic of snapshotData here
                const result = await snapshotData(
                  snapshotId ?? data.id, // Use the snapshot id if provided
                  data,                   // The snapshot data
                  mappedSnapshotData,     // The mapped snapshot data (can be null or undefined)
                  snapshotData,           // Additional snapshot data
                  snapshotStore,          // The snapshot store
                  category,               // The category (optional)
                  categoryProperties,     // Category properties (optional)
                  dataStoreMethods,       // Data store methods
                  snapshotStore.getStoreProps?.() ?? {}, // Store properties (fallback to empty object)
                  snapshotId              // The snapshot id (optional)
                );
                resolve(result); // Resolve with the result
              } catch (error) {
                reject(error); // Reject if an error occurs
              }
            });
          },
          dataStoreMethods,
          category,
          categoryProperties: categoryProperties || {
          id: snapshotId,
          type: 'default',
          name: typeof category === 'object' ? category.name : String(category),
          description: '',
          icon: 'default',
          color: '#000000',
          iconColor: '#FFFFFF',        // Default value
          isActive: true,              // Default value
          isPublic: false,             // Default value
          isSystem: false,             // Default value
          isDefault: false,            // Default value
          isHidden: false,             // Default value
          isHiddenInList: false,      // Default value
          UserInterface: [],           // Default value
          DataVisualization: [],       // Default value
          Forms: undefined,            // Default value
          Analysis: [],                // Default value
          Communication: [],           // Default value
          TaskManagement: [],          // Default value
          Crypto: [],                  // Default value
          brandName: '',               // Default value
          brandLogo: '',               // Default value
          brandColor: '#000000',       // Default value
          brandMessage: '',            // Default value
          chartType: 'bar',            // Default value
          dataProperties: [],          // Default value
          formFields: [], 
            // ... all other required CategoryProperties fields
          },
          // Optional properties
          callback,
          snapshotStore,
          metadata: snapshotStoreConfig?.metadata,
          // Include any other required SnapshotConfig properties
        };

        // Execute callback if provided
        if (callback) {
          const createdSnapshot: Snapshot<T, K> = {
            id: snapshotId,
            data: snapshotData.data,
            timestamp: new Date().toISOString(),
            // ... other required Snapshot properties
          };
          callback(createdSnapshot);
        }

        return config;
      },
      initSnapshot: (
        snapshot,
        snapshotId,
        snapshotData,
        category,
        snapshotConfig,
        callback
      ) => {
        // Implement your logic here
      },
      createSnapshot: (
        id,
        snapshotData,
        category,
        categoryProperties,
        callback,
        snapshotStore,
        snapshotStoreConfig
      ) => {
        // Implement your logic here
        return null; // or return the created Snapshot
      },
      createSnapshotStore: async (
        id,
        storeId,
        snapshotId,
        snapshotStoreData,
        category,
        categoryProperties,
        callback,
        snapshotDataConfig
      ) => {
        // Implement your logic here
        return Promise.resolve(null); // or return the created SnapshotStore
      },
      configureSnapshot: (
        id: string,
        storeId: number,
        snapshotId: string,
        snapshotData: SnapshotData<T, Data<T>>,
        dataStoreMethods: DataStore<T, Data<T>>,
        category?:  Category,
        categoryProperties?: CategoryProperties,
        callback?: (snapshotStore: SnapshotStore<T, Data<T>>) => void,
        snapshotStoreConfig?: SnapshotStoreConfig<T, Data<T>>
      ): Promise<Snapshot<T, K> | null> => {
          const baseData: BaseData = createBaseData({ ...snapshotData });
          
          // Your implementation logic<T>
          const newSnapshot: Snapshot<T, K> = createSnapshotInstance(baseData, baseMeta, snapshotId, transformedSnapshot, category, snapshotStore, snapshotStoreConfig)
          
          // Call callback if provided
          callback?.(newSnapshot);
  
          return Promise.resolve(newSnapshot); // Resolve with the created Snapshot
      },
      configureSnapshotStore: (
        snapshotStore: SnapshotStore<T, K>,
        snapshotId: string,
        data: Map<string, Snapshot<T, K>>,
        events: Record<string, any>,
        dataItems: RealtimeDataItem[],
        newData: Snapshot<T, K>,
        payload: ConfigureSnapshotStorePayload<T, K>,
        store: SnapshotStore<T, K>,
        callback?: (snapshotStore: SnapshotStore<T, K>) => void
      ): Promise<{
        snapshotStore: SnapshotStore<T, K>, 
        storeConfig: SnapshotStoreConfig<T, K>,
        updatedStore?: SnapshotStore<T, K>
      }> => {
          // Step 1: Update the snapshot data
          if (snapshotId && newData) {
              // Update or add new snapshot data to the store
              data.set(snapshotId, newData);
          }
      
          // Step 2: Handle events (optional)
          // If events need to trigger some changes in the snapshotStore or data processing, handle them here
          if (events) {
              // For example, you could update metadata or trigger some event-specific logic
              for (const eventKey in events) {
                  // Perform some action based on the event key and its data
                  const eventData = events[eventKey];
                  console.log(`Handling event: ${eventKey}`, eventData);
              }
          }
      
          // Step 3: Process dataItems if necessary
          if (dataItems && dataItems.length > 0) {
              // Example: Update snapshotStore based on the real-time data items
              dataItems.forEach((item) => {
                  // Logic to update snapshotStore or snapshot data based on real-time data item
                  console.log(`Processing data item: ${item.id}`, item);
              });
          }
      
          // Step 4: Update snapshotStore configuration based on the payload
          const storeConfig: SnapshotStoreConfig<T, K> = {
            // Populate the configuration based on the payload and other provided parameters
            id: snapshotId,
            records: convertSnapshotsToRecord(Array.from(data.values())), // Transform the array to the expected Record type
            options: payload.options || {}, // Use options from the payload if available
            metadata: payload.metadata || {}, // Use metadata from the payload if available
            category: payload.category, // Optionally set a category from the payload
            getSnapshotManager: payload.getSnapshotManager,
            find: payload.find,
            callback: payload.callback,
            storeId: payload.storeId,
            isCore: payload.isCore,
            configId: payload.configId,
            operation: payload.operation,
            data: payload.data,
          };
      
          // Step 5: Optionally, call the callback if provided
          if (callback) {
              callback(snapshotStore);
          }
      
          // Step 6: Return the updated snapshotStore and the new storeConfig
          return Promise.resolve({
              snapshotStore,
              storeConfig,
          });
      },  
      getDataStoreMethods: (
        snapshotStoreConfig,
        dataStoreMethods
      ) => {
        // Implement your logic here
        return {}; // or the appropriate Partial<DataStoreWithSnapshotMethods<T, K>>
      },
      // Array of SnapshotStoreMethod<T, K>
      snapshotMethods: [],
      handleSnapshotOperation: (
        snapshot: Snapshot<T, K>,
        data: SnapshotStoreConfig<T, K>,
        mappedData: Map<string, SnapshotStoreConfig<T, K>>,
        operation: SnapshotOperation<T, K>, // Ensure you use this in your logic
        operationType: SnapshotOperationType
      ): Promise<Snapshot<T, K> | null> => {
        return new Promise((resolve) => {
  
          // Use useSecureUserId to get the current user's ID and ensure the user is authenticated
          const { userId, error: userError } = useSecureUserId();
  
          if (userError || !userId) {
            console.error("User validation failed:", userError);
            resolve(null);
            return;
          }
  
          // Check if data is valid
          if (!data || !data.records) {
            resolve(null); // Resolve with null if data is invalid
            return; // Exit the function early
          }
          // Use the isSnapshot type guard to validate the snapshot
          const isValidSnapshot = isSnapshot<T, K>(snapshot);
          
          if (!isValidSnapshot) {
            resolve(null); // Resolve with null if the snapshot is invalid
            return;
          }
          // Check if a snapshot with the requested properties exists
          const existingSnapshot = data.records.find(
            (record: CalendarManagerStoreClass<T, K>) => record.id === snapshot.id
          );
          if (!existingSnapshot) {
            console.warn("No matching snapshot found for the provided properties.");
            resolve(null);
            return;
          }
      

          
          // If all conditions are met, create a new snapshot instance using createSnapshotInstance
          const newSnapshot = createSnapshotInstance<Data<BaseData<any>>, Data<BaseData<any>>>(
            snapshot.baseData,
            snapshot.baseMeta,
            snapshot.id,           
            snapshot.category,     
            snapshotStore || null, 
            snapshotManager || null,
            snapshotStoreConfig || null,
          );
      
          resolve(newSnapshot); 
        });
      },
      
      handleSnapshotStoreOperation: (
        snapshotId,
        snapshotStore,
        snapshot,
        operation,
        operationType,
        callback
      ): Promise<SnapshotStoreConfig<T, K> | null> => {
        // Implement your logic here
      },
      displayToast: displayToast,
      addToSnapshotList: addToSnapshotList,
      isAutoDismiss: false,
      isAutoDismissable: false,
      isAutoDismissOnNavigation: false,
      isAutoDismissOnAction: false,
      isAutoDismissOnTimeout: false,
      isAutoDismissOnTap: false,
      isClickable: true,
      isClosable: true,
      optionalData: {},
      useSimulatedDataSource: false,
      simulatedDataSource: {}, 
      // Update as per your requirements
     
    }, 
    
    config: Promise.resolve(null), // Set a valid config or null
    operation: {
      operationType: SnapshotOperationType.CreateSnapshot
    }, // Example operation
    id: "someId",
    snapshots: [], // Optional snapshots array
    timestamp: new Date(), // Optional timestamp
    message: "Some message", // Optional message
    state: null, // Optional state
    eventRecords: null // Optional event records
};


  
export { storeProps };
