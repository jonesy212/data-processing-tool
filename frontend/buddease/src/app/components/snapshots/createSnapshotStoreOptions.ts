// createSnapshotStoreOptions.ts

import { versionData } from "@/app/configs/DocumentBuilderConfig";
import { StructuredMetadata } from "@/app/configs/StructuredMetadata";
import { AppStructureItem } from "@/app/configs/appStructure/AppStructure";
import { UnifiedMetaDataOptions } from "@/app/configs/database/MetaDataOptions";
import { CriteriaType } from "@/app/pages/searchs/CriteriaType";
import { CustomSnapshotData } from ".";
import { CategoryProperties } from "../../../app/pages/personas/ScenarioBuilder";
import { LanguageEnum } from "../communications/LanguageEnum";
import { SnapshotStoreOptions } from "../hooks/useSnapshotManager";
import { Category } from "../libraries/categories/generateCategoryProperties";
import { BaseData, Data } from "../models/data/Data";
import { allCategories } from "../models/data/DataStructureCategories";
import { displayToast } from "../models/display/ShowToast";
import { DataStoreWithSnapshotMethods } from "../projects/DataAnalysisPhase/DataProcessing/ DataStoreMethods";
import { DataStore, InitializedState } from "../projects/DataAnalysisPhase/DataProcessing/DataStore";
import { Subscriber } from "../users/Subscriber";
import { addToSnapshotList, isSnapshot } from "../utils/snapshotUtils";
import Version from "../versions/Version";
import { VersionHistory } from "../versions/VersionData";
import { Snapshot, Snapshots, SnapshotsArray, SnapshotUnion } from "./LocalStorageSnapshotStore";
import { createSnapshotConfig, SnapshotConfig } from "./SnapshotConfig";
import SnapshotStore from "./SnapshotStore";
import { SnapshotStoreConfig } from "./SnapshotStoreConfig";
import { handleSnapshotOperation } from "./handleSnapshotOperation";
import handleSnapshotStoreOperation from "./handleSnapshotStoreOperation";
import { Callback, subscribeToSnapshotImpl, subscribeToSnapshotsImpl } from "./subscribeToSnapshotsImplementation";

const createSnapshotStoreOptions =  <T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T>({
  initialState,
  snapshotId,
  category,
  dataStoreMethods,
}: {
  initialState: InitializedState<T, Meta, K>
  snapshotId: string | number | null | undefined;
  category: symbol | string | Category | undefined,
  categoryProperties: CategoryProperties | undefined;
  dataStoreMethods: Partial<DataStoreWithSnapshotMethods<T, Meta, K>>;
}): SnapshotStoreOptions<T, Meta, K> => {

  // Initialize the configs map, this could be loaded from some external source or API
  const existingConfigsMap = new Map<string, SnapshotConfig<T, Meta, K>>();

  // Initialize structured metadata, this could also come from some external source

  const structuredMetadata: StructuredMetadata = {
    metadataEntries: {
      'file1': {
        originalPath: '/path/to/file1',
        alternatePaths: ['/path/alt/file1', '/backup/path/file1'],
        author: 'Author Name',
        timestamp: new Date(),
        fileType: 'pdf',
        title: 'Sample Title',
        description: 'A sample file description',
        keywords: ['sample', 'example'],
        authors: ['Author Name'],
        contributors: ['Contributor Name'],
        publisher: 'Sample Publisher',
        copyright: 'Sample Copyright',
        license: 'Sample License',
        links: ['http://example.com'],
        tags: ['sample', 'test']
      },
      // Additional file entries can be added here
    },
    apiEndpoint: 'https://api.example.com',
    apiKey: 'YOUR_API_KEY_HERE',
    timeout: 5000,
    retryAttempts: 3,
    name: 'Metadata Configuration',
    description: 'Sample Description', // Optional property, can be omitted if not needed
  };


    // Define criteria that might be used to filter or find snapshots
    const criteria: CriteriaType = {
      filterBy: 'category',
      value: category && typeof category === 'object' && 'name' in category ? category.name : '',
    };
  

  // Define the version, this could be optional or come from snapshot data
  const version: Version = {
    versionData: versionData,
    name: "",
    url: "",
    versionNumber: "",
    documentId: "",
    draft: false,
    userId: "",
    content: "",
    description: "",
    buildNumber: "",
    metadata: undefined,
    versions: null,
    appVersion: "",
    checksum: "",
    id: 0,
    parentId: null,
    parentType: "",
    parentVersion: "",
    parentTitle: "",
    parentContent: "",
    parentName: "",
    parentUrl: "",
    parentChecksum: "",
    parentAppVersion: "",
    parentVersionNumber: "",
    isLatest: false,
    isPublished: false,
    publishedAt: null,
    source: "",
    status: "",
    workspaceId: "",
    workspaceName: "",
    workspaceType: "",
    workspaceUrl: "",
    workspaceViewers: [],
    workspaceAdmins: [],
    workspaceMembers: [],
    data: [],
    _structure: {} as Record<string, AppStructureItem[]>,
    versionHistory: {} as VersionHistory,
    getVersionNumber: function (): string {
      throw new Error("Function not implemented.");
    }
  };


  // Define custom snapshot data, which could include any additional fields
  const customSnapshotData: CustomSnapshotData = {
    extraField: 'extra value',
  };

  // Ensure initialState is correctly typed before proceeding
  let validatedInitialState: SnapshotStore<T, Meta, K> | Snapshot<T, Meta, K> | null = null;
  let data: T;

  // Access or define snapshotData. This would typically be passed into the function
  // Access or define snapshotData. This would typically be passed into the function
const snapshotData: SnapshotData<T, Meta, K> = {
  subscribers: {}, // Empty object, initialize as needed
  config: null, // Assuming no initial configuration
  metadata: structuredMetadata, // Predefined metadata
  items: [], // Assuming an empty list of items
  snapshotStore: null, // No initial store, this might be populated later
  data: new Map<string, Snapshot<T, Meta, K>>(), // Initialize as an empty map or assign actual data
  timestamp: new Date(), // Current timestamp
  setSnapshotCategory: (id: string, newCategory: Category) => {
    // Logic to set the snapshot category
  },
  getSnapshotCategory: (id: string): Category | undefined => {
    // Logic to return the snapshot category
    return undefined; // Placeholder
  },
  getSnapshotData: (
    id: string | number | undefined,
    snapshotId: number,
    snapshotData: T,
    category: Category | undefined,
    categoryProperties: CategoryProperties | undefined,
    dataStoreMethods: DataStore<T, Meta, K>
  ): Map<string, Snapshot<T, Meta, K>> | null | undefined => {
    // Logic to get snapshot data
    return new Map(); // Placeholder
  },
  deleteSnapshot: (id: string) => {
    // Logic to delete a snapshot
  },
  isCore: false, // Assuming this value is initially false
  notify: (event: string, data: any) => {
    // Logic to notify subscribers
  },
  notifySubscribers: (
    message: string, 
    subscribers: Subscriber<T, Meta, K>[], 
    data: Partial<SnapshotStoreConfig<T, any>>
  ): Subscriber<T, Meta, K>[] => {
    // Iterate through each subscriber
    subscribers.forEach((subscriber) => {
      // Assuming that each subscriber has a `notify` method or equivalent
      if (subscriber.notify) {
        try {
          subscriber.notify(
            {
              message,
              data: new Map(Object.entries(data)), // Convert partial config data to Map
              timestamp: new Date().toISOString(), // Add a timestamp to the notification
              category: data.category ?? 'General', // Ensure category is passed
            } as Snapshot<T, Meta, K>,
            () => {}, // Provide a default empty callback as placeholder
            subscribers // Pass subscribers list to notify method
          );
        } catch (error) {
          console.error(`Failed to notify subscriber with ID ${subscriber.id}:`, error);
        }
      } else {
        console.warn(`Subscriber with ID ${subscriber.id} does not have a notify method.`);
      }
    });  
    // Return the updated subscriber list (if needed for further chaining)
    return subscribers;
  },
  
  
  getSnapshots: () => {
    return []; // Logic to get all snapshots, returning empty array for now
  },


  getAllSnapshots: async (
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
  ): Promise<Snapshot<T, Meta, K>[]> => {
    try {
      // Log the event type and timestamp for tracking
      console.log(`Event ${type} occurred at ${timestamp}`);
  
      // Safely cast the category from the command line argument
      const categoryArg = process.argv[3];
      const convertedCategory =  categoryArg as keyof typeof allCategories;

      // Step 1: Fetch all snapshots from the snapshot store
      const allSnapshots = snapshotStore.getSnapshots(`${convertedCategory}`, data); 
  
        // Step 2: Filter snapshots based on category if provided
    let filteredSnapshots: Snapshot<T, Meta, K>[] = allSnapshots || [];
      if (category && Array.isArray(filteredSnapshots)) {
        // Safely filter the snapshots by the provided category
        filteredSnapshots = filteredSnapshots.filter(snapshot => snapshot.category === category);
      }
  
  
      // Step 3: Optionally perform some processing with the provided callback
      if (dataCallback) {
        const subscribers = snapshotStore.getSubscribers(subscribers, snapshots);
        const processedSnapshots = await dataCallback(subscribers, filteredSnapshots);
        
        // Step 4: Return the processed snapshots (if callback modifies them)
        return processedSnapshots as Snapshot<T, Meta, K>[];
      }
  
      // If no callback, return the filtered snapshots
      return filteredSnapshots as Snapshot<T, Meta, K>[];
    } catch (error) {
      console.error(`Error fetching snapshots: ${error}`);
      return [];
    }
  },
  generateId: () => {    return 'newId'; // Generate and return an ID
  },
  compareSnapshots: (snapshot1: Snapshot<T, Meta, K>, snapshot2: Snapshot<T, Meta, K>) => {
    // Logic to compare snapshots
  },
  compareSnapshotItems: (item1: ContentItem, item2: ContentItem) => {
    // Logic to compare snapshot items
  },
  batchTakeSnapshot: () => {
    // Logic for batch-taking snapshots
  },
  batchFetchSnapshots: () => {
    // Logic to fetch multiple snapshots
  },
  batchTakeSnapshotsRequest: () => {
    // Logic to handle snapshot request in batches
  },
  batchUpdateSnapshotsRequest: () => {
    // Logic to update snapshots in batches
  },
  filterSnapshotsByStatus: (status: StatusType) => {
    // Logic to filter snapshots by status
  },
  filterSnapshotsByCategory: (category: Category) => {
    // Logic to filter snapshots by category
  },
  filterSnapshotsByTag: (tag: string) => {
    // Logic to filter snapshots by tags
  },
  batchFetchSnapshotsSuccess: (snapshots: Snapshot<T, Meta, K>[]) => {
    // Logic for success handling of snapshot fetch in batch
  },
  batchFetchSnapshotsFailure: (error: any) => {
    // Logic for failure handling of snapshot fetch in batch
  },
  batchUpdateSnapshotsSuccess: (subscribers: Subscriber<T, Meta, K>[], snapshots: Snapshots<T, Meta>) => {
    // Logic for success handling of snapshot update in batch
  },
  batchUpdateSnapshotsFailure: (error: any) => {
    // Logic for failure handling of snapshot update in batch
  },
  snapshot: null, // Assuming no initial snapshot
  handleSnapshotSuccess: (snapshot: Snapshot<T, Meta, K>) => {
    // Logic to handle snapshot success
  },
  getSnapshotId: () => {
    return 'snapshotId'; // Return the snapshot ID
  },
  compareSnapshotState: (state1: Snapshot<T, Meta, K>, state2: Snapshot<T, Meta, K>) => {
    // Logic to compare snapshot state
  },
  payload: {}, // Assuming an empty payload, update accordingly
  dataItems: [], // Assuming an empty array of data items
  newData: {}, // New data to be populated, initialize as needed
  getInitialState: () => {
    return {}; // Logic to get initial state
  },
  getConfigOption: () => {
    return null; // Return config option
  },
  getTimestamp: () => {
    return new Date(); // Return current timestamp
  },
  getStores: () => {
    return []; // Logic to get all stores
  },
  getData: () => {
    return null; // Logic to get data
  },
  setData: (newData: T) => {
    // Logic to set data
  },
  addData: (data: T) => {
    // Logic to add data
  },
  stores: [], // Assuming an empty list of stores
  getStore: (
    storeId: number,
    snapshotStore: SnapshotStore<T, Meta, K>,
    snapshotId: string | null,
    snapshot: Snapshot<T, Meta, K>,
    snapshotStoreConfig: SnapshotStoreConfig<T, Meta, K>,
    type: string,
    event: Event
  ) => {
    return null; // Logic to get store by ID
  },
  addStore: (store: SnapshotStore<T, Meta, K>) => {
    // Logic to add a store
  },
  mapSnapshot: (snapshot: Snapshot<T, Meta, K>) => {
    // Logic to map a snapshot
  },
  mapSnapshotWithDetails: (snapshot: Snapshot<T, Meta, K>, details: any) => {
    // Logic to map a snapshot with details
  },
  removeStore: (storeId: string) => {
    // Logic to remove a store by ID
  },
  unsubscribe: () => {
    // Logic to unsubscribe
  },
  fetchSnapshot: (snapshotId: string) => {
    // Logic to fetch a snapshot
  },
  fetchSnapshotSuccess: (snapshot: Snapshot<T, Meta, K>) => {
    // Logic to handle successful snapshot fetch
  },
  updateSnapshotFailure: (error: any) => {
    // Logic to handle snapshot update failure
  },
  fetchSnapshotFailure: (error: any) => {
    // Logic to handle snapshot fetch failure
  },
  addSnapshotFailure: (error: any) => {
    // Logic to handle snapshot addition failure
  },
  configureSnapshotStore: (config: SnapshotStoreConfig<T, Meta, K>) => {
    // Logic to configure snapshot store
  },
  updateSnapshotSuccess: (snapshot: Snapshot<T, Meta, K>) => {
    // Logic to handle successful snapshot update
  },
  createSnapshotFailure: (error: any) => {
    // Logic to handle snapshot creation failure
  },
  createSnapshotSuccess: (snapshot: Snapshot<T, Meta, K>) => {
    // Logic to handle successful snapshot creation
  },
  createSnapshots: (snapshots: Snapshot<T, Meta, K>[]) => {
    // Logic to create multiple snapshots
  },
  onSnapshot: (snapshot: Snapshot<T, Meta, K>) => {
    // Logic to handle a single snapshot event
  },
  onSnapshots: (snapshots: Snapshot<T, Meta, K>[]) => {
    // Logic to handle multiple snapshots events
  },
  events: [], // Placeholder for event handlers or listeners
};



  if (initialState instanceof SnapshotStore) {
    validatedInitialState = initialState;
  } else if (initialState && typeof initialState === 'object' && 'snapshotId' in initialState) {
    validatedInitialState = initialState as Snapshot<T, Meta, K>;
  } else if (initialState === null) {
    validatedInitialState = null;
  } else {
    // Handle the case where initialState is of an unexpected type
    throw new Error('initialState is not of type SnapshotStore<T, Meta, K> or Snapshot<T, Meta, K>');
  }

  // const snapshotId = UniqueIDGenerator.generateSnapshotByID(snapshotID)
  const snapshotConfig = createSnapshotConfig(
    snapshotId?.toString() ?? '', // Convert snapshotId to string or use empty string if undefined
    existingConfigsMap, // Map of existing configs
    snapshotData, // Snapshot data
    'snapshot category', // Category
    criteria, // Criteria
    'A description for the snapshot', // Optional description
    structuredMetadata, // Optional metadata
    'High', // Priority
    version, // Optional version
    customSnapshotData // Additional data if needed
  );


  return {
    id: snapshotId?.toString() ?? 'default-id', // Convert snapshotId to string or use default value
    storeId: Math.random(), // Generate a unique storeId, e.g., with Math.random() or a specific generator
    baseURL: '/api/snapshot', // Example base URL for the store
    enabled: true, // Set this to true or false depending on your requirements
    maxRetries: 3, // Example retry configuration
    retryDelay: 1000, // Delay in ms between retries
    maxAge: 3600, // Cache expiration in seconds
    staleWhileRevalidate: 600, // Stale time before revalidation in seconds
    cacheKey: `snapshot_${snapshotId}`, // Cache key based on snapshotId
    metadata: {
      version: '1.0', // Metadata version
      name: 'Snapshot Name', // Example name
      structuredMetadata: {
        name: 'Snapshot Name', // Example name
        metadataEntries: {},
        apiEndpoint: '/api/data',
        apiKey: 'your-api-key',
        timeout: 5000,
        retryAttempts: 3
      },
     
      metadataEntries: {}, // Example empty array for metadata entries
      apiEndpoint: '/api/data', // Example API endpoint
      apiKey: 'your-api-key', // Example API key
      timeout: 5000, // Timeout in milliseconds
      retryAttempts: 3, // Number of retry attempts
      description: 'Project Snapshot Metadata', // Example description
      startDate: new Date('2024-01-01'), // Example start date
      endDate: new Date('2024-12-31'), // Example end date
      budget: 100000, // Example budget value
      status: 'active', // Example status
      teamMembers: ['Alice', 'Bob'], // Example team members
      tasks: ['Task 1', 'Task 2'], // Example tasks
      milestones: ['Milestone 1', 'Milestone 2'], // Example milestones
      videos: [{
        title: 'Introduction to TypeScript',  // Example title
        url: 'http://video-url-1.com',  // Example URL
        duration: 3600,  // Duration in seconds (1 hour)
        resolution: '1080p',  // Video resolution
        sizeInBytes: 500000000,  // Size in bytes (500MB)
        format: 'mp4',  // Video format
        uploadDate: new Date('2024-01-01'),  // Example upload date
        uploader: 'John Doe',  // Uploader name
        tags: ['TypeScript', 'Programming', 'Tutorial'],  // Example tags
        categories: ['Education', 'Development'],  // Example categories
        language: LanguageEnum.English,  // Assuming LanguageEnum has 'EN' for English
        location: 'USA',  // Example location
        data: {
          // Assuming `Data` is a custom data type; you can add the properties accordingly
          someProperty: 'exampleValue'
        } ,// Example Data object
        views: 0,
        likes: 0,
        comments: 0,
      }]
    } as UnifiedMetaDataOptions,

    criteria: {}, // Example criteria object, update with specific criteria
    callbacks: {},
    data: new Map<string, Snapshot<T, Meta, K>>(), // Changed to a new Map instance
    initialState: validatedInitialState,
    snapshotId,
    category,
    date: new Date(),
    type: "default-type",
    snapshotConfig: [], // Adjust as needed
    subscribeToSnapshots: (
      snapshotId: string,
      callback: (snapshots: Snapshots<T, Meta>) => Subscriber<T, Meta, K> | null,
      snapshots: SnapshotsArray<T, Meta>
    ): SnapshotsArray<T, Meta> => {
      const convertedSnapshots = convertToArray(snapshots);
      subscribeToSnapshotsImpl(snapshotId, callback, convertedSnapshots);
      return convertedSnapshots;
    },

    subscribeToSnapshot: (
      snapshotId: string,
      callback: (snapshot: Snapshot<T, Meta, K>) => Subscriber<T, Meta, K> | null,
      snapshot: Snapshot<T, Meta, K>
    ): Subscriber<T, Meta, K> | null => {
      const convertedSnapshot = convertToArray(snapshot)[0]; // Convert single snapshot to array and take the first element
      return subscribeToSnapshotImpl(snapshotId, callback, convertedSnapshot);
    },

    getDelegate: ({ useSimulatedDataSource, simulatedDataSource }: {
      useSimulatedDataSource: boolean,
      simulatedDataSource: SnapshotStoreConfig<T, Meta, K>[]
    }) => {
      return useSimulatedDataSource ? simulatedDataSource : [];
    },
    getCategory: getCategory,
    getSnapshotConfig: () => snapshotConfig,
    getDataStoreMethods: () => dataStoreMethods as DataStoreWithSnapshotMethods<T, Meta, K>,
    snapshotMethods: [],
    delegate: async () => [], // Adjust as needed
    dataStoreMethods: dataStoreMethods as DataStoreWithSnapshotMethods<T, Meta, K>,
    handleSnapshotOperation: handleSnapshotOperation,
    displayToast: displayToast,
    addToSnapshotList: addToSnapshotList,
    eventRecords: {},
    snapshotStoreConfig: snapshotStoreConfig,
    unsubscribeToSnapshots: (
      snapshotId: string,
      snapshot: Snapshot<T, Meta, K>,
      type: string,
      event: Event,
      callback: (snapshot: Snapshot<T, Meta, K>) => void
    ) => { },
    unsubscribeToSnapshot: (
      snapshotId: string,
      snapshot: Snapshot<T, Meta, K>,
      type: string,
      event: Event,
      callback: (snapshot: Snapshot<T, Meta, K>) => void
    ) => { },
    handleSnapshotStoreOperation: handleSnapshotStoreOperation,
    simulatedDataSource: [],
  };

}; const isSnapshotStoreOptions =  <T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T>(obj: any): obj is SnapshotStoreOptions<T, Meta, K> => {  return obj && typeof obj === 'object' && 'data' in obj && 'initialState' in obj;
};

const getCurrentSnapshotStoreOptions =  <T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T>(
  snapshotStoreOptions: any
): SnapshotStoreOptions<T, Meta, K> | null => {
  return isSnapshotStoreOptions<T, Meta, K>(snapshotStoreOptions) ? snapshotStoreOptions : null;
};

const convertToArray =  <T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T>(
  snapshot: Snapshot<T, Meta, K> | Snapshots<T, Meta> | SnapshotsArray<T, Meta>
): SnapshotsArray<T, Meta> => {
  return Array.isArray(snapshot) ? snapshot as SnapshotsArray<T, Meta> : [snapshot] as SnapshotsArray<T, Meta>;
};

export { createSnapshotStoreOptions };

const handleSingleSnapshot =  <T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T>(
  snapshot: Snapshot<T, Meta, K>,
  callback: Callback<Snapshot<T, Meta, K>>
) => {
  if (snapshot.type !== null && snapshot.type !== undefined && snapshot.timestamp !== undefined) {
    callback({
      ...snapshot,
      type: snapshot.type as string,
      timestamp: typeof snapshot.timestamp === 'number' ? new Date(snapshot.timestamp) : snapshot.timestamp,
      store: snapshot.store,
      dataStore: snapshot.dataStore,
      events: snapshot.events ?? undefined,
      meta: snapshot.meta ?? {},
      data: snapshot.data ?? ({} as T),
    });
  } else {
    callback(snapshot);
  }
};
const handleSnapshotsArray =  <T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T>(
  snapshots: SnapshotsArray<T, Meta>,
  callback: Callback<Snapshot<T, Meta, K>>
) => {
  snapshots.forEach((snap) => {
    if (snap.type !== null && snap.type !== undefined && snap.timestamp !== undefined) {
      callback({
        ...snap,
        type: snap.type as string,
        timestamp: typeof snap.timestamp === 'number' ? new Date(snap.timestamp) : snap.timestamp,
        store: snap.store,
        dataStore: snap.dataStore,
        events: snap.events ?? undefined,
        meta: snap.meta ?? {},
        data: snap.data ?? ({} as T),
        initialState: snap.initialState as InitializedState<T, Meta, K>,
        mappedSnapshotData: new Map(
          Array.from(snap.mappedSnapshotData || []).map(([key, value]) => [
            key,
            {
              ...value,
              initialState: value.initialState as InitializedState<T, Meta, K>,
            },
          ])
        ),
      } as unknown as Snapshot<T, Meta, K>);
    } else {
      callback(snap as unknown as Snapshot<T, Meta, K>);
    }
  });
};



function isSnapshotsArray<T extends BaseData>(
  obj: any
): obj is SnapshotsArray<T, Meta> {
  return Array.isArray(obj) && obj.every(item => isSnapshot(item));
}




// Renamed function to avoid conflict
const isSnapshotArrayState = <T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T>(state: any): state is Snapshot<T, Meta, K>[] => {
  // Logic to determine if it's a Snapshot array
  return Array.isArray(state) && state.every((item: any) => isSnapshot(item));
};


function isCompatibleSnapshot <T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T>(
  snapshot: Snapshot<T, Meta, K>
): snapshot is Snapshot<T, Meta, K> & { storeConfig: { tempData: any } } {
  if (snapshot.storeConfig === undefined) {
    throw new Error("storeConfig is undefined");
  }
  return (
    'storeConfig' in snapshot &&
    'tempData' in snapshot.storeConfig &&
    // You can add more checks if necessary to ensure compatibility
    typeof snapshot.storeConfig.tempData !== 'undefined'
  );
}


export {
    convertToArray, getCurrentSnapshotStoreOptions, handleSingleSnapshot,
    handleSnapshotsArray, isCompatibleSnapshot, isSnapshot, isSnapshotArrayState, isSnapshotsArray
};

