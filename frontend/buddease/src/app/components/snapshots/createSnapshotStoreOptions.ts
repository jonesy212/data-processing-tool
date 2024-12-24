// createSnapshotStoreOptions.ts
import { getCurrentSnapshot } from '@/app/api/SnapshotApi';
import { fetchUserAreaDimensions } from '@/app/pages/layouts/fetchUserAreaDimensions';
import { getSubscribersAPI } from '@/app/api/subscriberApi';
import { CombinedEvents, SnapshotManager, SnapshotStoreOptions, useSnapshotManager } from '@/app/components/hooks/useSnapshotManager';
import { Category } from '@/app/components/libraries/categories/generateCategoryProperties';
import { DataStore, InitializedState, useDataStore } from '@/app/components/projects/DataAnalysisPhase/DataProcessing/DataStore';
import { Callback, createSnapshotConfig, CustomSnapshotData, SnapshotConfig, SnapshotContainer, SnapshotData, SnapshotStoreConfig, SnapshotStoreProps, SnapshotWithCriteria, subscribeToSnapshotImpl } from '@/app/components/snapshots';
import handleSnapshotStoreOperation from '@/app/components/snapshots/handleSnapshotStoreOperation';
import { subscribeToSnapshotsImpl } from '@/app/components/snapshots/subscribeToSnapshotsImplementation';
import { Subscriber } from "@/app/components/users/Subscriber";
import { versionData } from '@/app/components/versions/Version';
import { createLatestVersion } from '@/app/components/versions/createLatestVersion';
import { baseConfig } from '@/app/configs/BaseConfig';
import { StructuredMetadata } from "@/app/configs/StructuredMetadata";
import { UnifiedMetaDataOptions } from '@/app/configs/database/MetaDataOptions';
import { CategoryProperties } from '@/app/pages/personas/ScenarioBuilder';
import { CriteriaType } from "@/app/pages/searchs/CriteriaType";
import { Subscription } from 'react-redux';
import { Tag } from 'sanitize-html';
import { SnapshotWithData } from '../calendar/CalendarApp';
import { CalendarEvent } from '../calendar/CalendarEvent';
import { LanguageEnum } from '../communications/LanguageEnum';
import { CreateSnapshotsPayload } from '../database/Payload';
import { UnsubscribeDetails } from '../event/DynamicEventHandlerExample';
import { getCategoryProperties } from '../libraries/categories/CategoryManager';
import { BaseData, Data } from "../models/data/Data";
import { allCategories } from '../models/data/DataStructureCategories';
import { StatusType } from '../models/data/StatusType';
import { K } from '../models/data/dataStoreMethods';
import { displayToast } from '../models/display/ShowToast';
import { DataStoreMethods, DataStoreWithSnapshotMethods } from '../projects/DataAnalysisPhase/DataProcessing/ DataStoreMethods';
import { ExcludedFields } from '../routing/Fields';
import {
    Snapshot,
    SnapshotsArray,
    SnapshotUnion
} from "../snapshots/LocalStorageSnapshotStore";
import { getSubscription } from '../subscriptions/SubscriptionService';
import { SubscriberCollection } from '../users/SubscriberCollection';
import { convertToSubscriberCollection } from '../utils/SubscriberUtils';
import { addToSnapshotList, generateSnapshotId, isSnapshot } from "../utils/snapshotUtils";
import useSecureStoreId from '../utils/useSecureStoreId';
import { useSecureUserId } from '../utils/useSecureUserId';
import Version from '../versions/Version';
import { createDefaultVersionData } from '../versions/VersionData';
import { FetchSnapshotPayload } from './FetchSnapshotPayload';
import { Snapshots } from "./LocalStorageSnapshotStore";
import SnapshotStore from "./SnapshotStore";
import { InitializedData } from './SnapshotStoreOptions';
import { storeProps } from './SnapshotStoreProps';
import { handleSnapshotOperation } from './handleSnapshotOperation';
import { getCategory } from './snapshotContainerUtils';



// const generateSnapshotId = (): string => {
//   return UniqueIDGenerator.generateSnapshotID();
// };

const createSnapshotStoreOptions =  <T extends BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>({
  initialState,
  snapshotId,
  category,
  dataStoreMethods,
}: {
  initialState: InitializedState<T, K>
  snapshotId?: string | number | null;
  category: symbol | string | Category | undefined,
  categoryProperties: CategoryProperties | undefined;
  dataStoreMethods: Partial<DataStoreWithSnapshotMethods<T, K>>;
}): SnapshotStoreOptions<T, K> => {
  const snapshotStoreConfig = useDataStore().snapshotStoreConfig

      
  const storeId = useSecureStoreId()
    if (storeId === undefined || storeId === null) {
      throw new Error('snapshotId must be defined');
    }

  const { snapshotStore } = await useSnapshotManager(Number(storeId));

  // Initialize the configs map, this could be loaded from some external source or API
  const existingConfigsMap = new Map<string, SnapshotConfig<T, K>>();
 
  const defaultVersion: Version<T, K> = version

  // Initialize structured metadata, this could also come from some external source
  const structuredMetadata: StructuredMetadata<T, K> = {
    ...baseConfig,
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
      version: baseConfig.version ?? defaultVersion, 
      // Additional file entries can be added here
    },
    apiEndpoint: 'https://api.example.com',
    apiKey: 'YOUR_API_KEY_HERE',
    timeout: 5000,
    retryAttempts: 3,
    name: 'Metadata Configuration',
    description: 'Sample Description', // Optional property, can be omitted if not needed

    childIds: [], // Add this property
    relatedData: [], // Add this property
    versionData: createDefaultVersionData(),
    latestVersion: createLatestVersion(),
    keywords: []
  };

  // Define criteria that might be used to filter or find snapshots
  const criteria: CriteriaType = {
    filterBy: 'category',
    value: category && typeof category === 'object' && 'name' in category ? category.name : '',
  };
  


  const area = `${fetchUserAreaDimensions().width}x${fetchUserAreaDimensions().height}`;
  const currentMetadata: UnifiedMetaDataOptions<T, K<T>> = useMetadata<T, K<T>>(area)

  const version: Version<T, K> = {
    id: 1,
    versionData: null,
    buildVersions: undefined,
    isActive: true,
    releaseDate: new Date(),
    major: 1,
    minor: 0,
    patch: 0,
    name: "Initial Release",
    url: "https://example.com/version/1",
    versionNumber: "1.0.0",
    documentId: "doc123",
    draft: false,
    userId: "user456",
    content: "This is the content of the version.",
    description: "This is the initial release version.",
    buildNumber: "build_001",
    metadata: {
      area: area,
      currentMeta: currentMeta, 
      metadataEntries: {}
    },
    versions: null,
    appVersion: "1.0.0",
    checksum: "abc123",
    parentId: null,
    parentType: "document",
    parentVersion: "0.0.1",
    parentTitle: "Parent Document Title",
    parentContent: "Parent document content.",
    parentName: "Parent Name",
    parentUrl: "https://example.com/parent",
    parentChecksum: "def456",
    parentAppVersion: "0.0.1",
    parentVersionNumber: "0.0.1",
    parentMetadata: {},
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: undefined,
    isLatest: true,
    isPublished: true,
    publishedAt: new Date(),
    source: "web",
    status: "active",
    workspaceId: "workspace789",
    workspaceName: "Workspace Name",
    workspaceType: "standard",
    workspaceUrl: "https://example.com/workspace",
    workspaceViewers: [],
    workspaceAdmins: [],
    workspaceMembers: [],
    data: versionData,
    _structure: {},
  
    versionHistory: {
      versionData: versionData,
    },
  
    // Method to generate a version number string
    getVersionNumber: function () {
      return `${this.major}.${this.minor}.${this.patch}`;
    },
  
    // Method to update the hash of the structure
    updateStructureHash: async function () {
      this.currentHash = this.calculateHash();
      console.log(`Structure hash updated to: ${this.currentHash}`);
    },
  
    // Method to set the structure data
    setStructureData: function (newData: string) {
      this.structureData = newData;
      console.log("Structure data set to:", newData);
    },
  
    // Sample hash function, ideally use a secure hashing algorithm here
    hash: function (value: string): string {
      // Basic example using a simple hash, replace with a robust hashing algorithm as needed
      let hash = 0;
      for (let i = 0; i < value.length; i++) {
        hash = (hash << 5) - hash + value.charCodeAt(i);
        hash |= 0;
      }
      return hash.toString();
    },
  
    // Calculate hash based on structureData or other relevant fields
    calculateHash: function () {
      return this.hash(this.structureData || "");
    },
  
    currentHash: "", // Initialized to empty; will be set by `updateStructureHash`
    structureData: "", // Will be populated with actual data when needed
  };


  // Define custom snapshot data, which could include any additional fields
    const customSnapshotData: CustomSnapshotData<T> = {
      timestamp: undefined,
      value: undefined,
      orders: [],
     };

  // Ensure initialState is correctly typed before proceeding
  let validatedInitialState: SnapshotStore<T, K> | Snapshot<T, K> | null = null;
  let data: InitializedData<T>;

  const userId = useSecureUserId() 
  if (snapshotId === undefined || snapshotId === null) {
    throw new Error('snapshotId must be defined');
  }

  const { subscription, subscriber } = getSubscription<T, K>(userId.toString(), snapshotId.toString());
  
 

  // Access or define snapshotData. This would typically be passed into the function
  const newData = useSnapshotManager<T, K>(storeId)
  
  const snapshotData: SnapshotData<T, K> = {
    subscribers: subscriber ? convertToSubscriberCollection(subscriber.getSubscribers) : [],
    config: Promise.resolve(null), // Assuming no initial configuration
    metadata: structuredMetadata, // Predefined metadata
    items: [], // Assuming an empty list of items
    snapshotStore: null, // No initial store, this might be populated later
    data: {} as InitializedData<T> | undefined, // Initialize as an empty map or assign actual data
    // mappedData: new Map<string, Snapshot<T, K>>(), // Initialize as an empty map or assign actual data
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
      dataStoreMethods: DataStore<T, K>
    ): Map<string, Snapshot<T, K>> | null | undefined => {
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
      subscribers: Subscriber<T, K>[],
      data: Partial<SnapshotStoreConfig<T, any>>
    ): Subscriber<T, K>[] => {
      // Iterate through each subscriber
      subscribers.forEach((subscriber) => {
        // Assuming that each subscriber has a `notify` method or equivalent
        if (subscriber.subscriberManagement.notify) {
          try {
            subscriber.notify(
              {
                message,
                data: new Map(Object.entries(data)), // Convert partial config data to Map
                timestamp: new Date().toISOString(), // Add a timestamp to the notification
                category: data.category ?? 'General', // Ensure category is passed
              } as Snapshot<T, K>,
              () => { }, // Provide a default empty callback as placeholder
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
      snapshotStore: SnapshotStore<T, K>,
      category: symbol | string | Category | undefined,
      categoryProperties: CategoryProperties | undefined,
      dataStoreMethods: DataStore<T, K>,
      data: T,
      filter?: (snapshot: Snapshot<T, K>) => boolean,
      dataCallback?: (
        subscribers: Subscriber<T, K>[],
        snapshots: Snapshots<T, K>
      ) => Promise<SnapshotUnion<T, K>[]>
    ): Promise<Snapshot<T, K>[]> => {
      try {
        // Log the event type and timestamp for tracking
        console.log(`Event ${type} occurred at ${timestamp}`);
  
        // Safely cast the category from the command line argument
        const categoryArg = process.argv[3];
        const convertedCategory = categoryArg as keyof typeof allCategories;
  
        // Step 1: Fetch all snapshots from the snapshot store
        const allSnapshots = snapshotStore.getSnapshots(`${convertedCategory}`, data);
  
        // Step 2: Filter snapshots based on category if provided
        let filteredSnapshots: Snapshot<T, K>[] = allSnapshots || [];
        if (category && Array.isArray(filteredSnapshots)) {
          // Safely filter the snapshots by the provided category
          filteredSnapshots = filteredSnapshots.filter(snapshot => snapshot.category === category);
        }
  
        // Step 3: Optionally perform some processing with the provided callback
        if (dataCallback) {
          const subscribers = await getSubscribersAPI();
          const foundSubscribers = snapshotStore.getSubscribers(subscribers, filteredSnapshots);
          const processedSnapshots = await dataCallback(foundSubscribers, filteredSnapshots as unknown as Snapshots<T, K>);
        
          // Step 4: Return the processed snapshots (if callback modifies them)
          return processedSnapshots as unknown as Snapshot<T, K>[];
        }
  
        // If no callback, return the filtered snapshots
        return filteredSnapshots as Snapshot<T, K>[];
      } catch (error) {
        console.error(`Error fetching snapshots: ${error}`);
        return [];
      }
    },

    generateId: () => {
      return 'newId'; // Generate and return an ID
    },

    compareSnapshots: (
      snap1: Snapshot<T, K>,
      snap2: Snapshot<T, K>
    ): {
      snapshot1: Snapshot<T, K>;
      snapshot2: Snapshot<T, K>;
      differences: Record<string, { snapshot1: any; snapshot2: any }>;
      versionHistory: {
        snapshot1Version?: string | number | Version;
        snapshot2Version?: string | number | Version;
      };
    } => {
      const differences: Record<string, { snapshot1: any; snapshot2: any }> = {};
  
      for (const key in snap1) {
        if (snap1.hasOwnProperty(key) && snap2.hasOwnProperty(key)) {
          const value1 = (snap1 as any)[key];
          const value2 = (snap2 as any)[key];
          if (value1 !== value2) {
            differences[key] = { snapshot1: value1, snapshot2: value2 };
          }
        }
      }
  
      return {
        snapshot1: snap1,
        snapshot2: snap2,
        differences,
        versionHistory: {
          snapshot1Version: snap1.version,
          snapshot2Version: snap2.version
        }
      };
    },

    compareSnapshotItems: (
      snap1: Snapshot<T, K>,
      snap2: Snapshot<T, K>,
      keys: (keyof Snapshot<T, K>)[]
    ): { itemDifferences: Record<string, { snapshot1: any; snapshot2: any; differences: { [key: string]: { value1: any; value2: any } } }>; } | null => {
      const itemDifferences: Record<string, { snapshot1: any; snapshot2: any; differences: Record<string, { value1: any; value2: any }> }> = {};

      keys.forEach((key) => {
        const value1 = snap1[key];
        const value2 = snap2[key];

        // If there is a difference between the values
        if (value1 !== value2) {
          itemDifferences[key] = {
            snapshot1: value1,
            snapshot2: value2,
            differences: {
              [key]: { value1, value2 }, // Record the specific difference
            },
          };
        }
      });

      // If there are differences, return them, otherwise return null
      return Object.keys(itemDifferences).length > 0
        ? { itemDifferences }
        : null;
    },

    batchTakeSnapshot: (
      id: number,
      snapshotId: string,
      snapshot: Snapshot<T, K>,
      snapshotStore: SnapshotStore<T, K>,
      snapshots: Snapshots<T, K>
    ): Promise<{ snapshots: Snapshots<T, K>; }> => {
      return new Promise((resolve, reject) => {
        try {
          // Update the snapshot in the snapshot store
          snapshotStore.updateSnapshot(snapshotId, snapshot);
  
          // Assuming snapshots is an array, check if push is allowed
          if (Array.isArray(snapshots)) {
            snapshots.push(snapshot);  // Adds snapshot to the array
          } else {
            throw new Error("Snapshots is not an array and cannot use push.");
          }
  
          resolve({ snapshots });
        } catch (error) {
          reject(error);
        }
      });
    },
  


    batchFetchSnapshots: (
      criteria: CriteriaType,
      snapshotData: (
        snapshotIds: string[],
        subscribers: SubscriberCollection<T, K>,
        snapshots: Snapshots<T, K>
      ) => Promise<{
        subscribers: SubscriberCollection<T, K>;
        snapshots: Snapshots<T, K>; // Include snapshots here for consistency
      }>
    ): Promise<Snapshots<T, K>> => {
      return new Promise(async (resolve, reject) => {
        try {
          // Fetch the snapshots using the provided function
          const { subscribers, snapshots } = await snapshotData(
            [], // Pass the snapshot IDs as needed
            [], // Pass the subscribers collection as needed
            [] // Pass the snapshots collection as needed
          );

          // Return the fetched snapshots
          resolve(snapshots);
        } catch (error) {
          reject(error);
        }
      });
    },

    batchTakeSnapshotsRequest: (
      criteria: CriteriaType,
      snapshotData: (
        snapshotIds: string[],
        snapshots: Snapshots<T, K>,
        subscribers: Subscriber<T, K>[]
      ) => Promise<{
        subscribers: Subscriber<T, K>[]
      }>
    ): Promise<void> => {
      return new Promise(async (resolve, reject) => {
        try {
          // Execute the snapshot data function with the necessary parameters
          await snapshotData([], [], []); // Adjust with proper data

          // No return value, just resolve to indicate success
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    },

    batchUpdateSnapshotsRequest: (
      snapshotData: (subscribers: SubscriberCollection<T, K>) => Promise<{
        subscribers: SubscriberCollection<T, K>;
        snapshots: Snapshots<T, K>
      }>,
      snapshotManager: SnapshotManager<T, K>
    ): Promise<void> => {
      return new Promise(async (resolve, reject) => {
        try {
          // Update snapshots based on the subscribers collection
          const { subscribers, snapshots } = await snapshotData([]);

          // Optionally update the snapshotManager with new data
          snapshotManager.updateSnapshots(snapshots);

          // Resolve after completing the update
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    },

      // Function to filter snapshots by status
      filterSnapshotsByStatus: (status: StatusType): Snapshots<T, K> => {
      // Check if `this.snapshots` exists, otherwise default to an empty array
      return (this.snapshots ?? []).filter(
        (snapshot: Snapshot<T, K>) => snapshot.status === status
      );
    },

    // Function to filter snapshots by category
    filterSnapshotsByCategory: (category: Category): Snapshots<T, K> => {
      return (this.snapshots ?? []).filter(
        (snapshot: Snapshot<T, K>) => snapshot.category === category
      );
    },

    filterSnapshotsByTag: (tag: Tag<T, K>): Snapshots<T, K> => {
      return this.snapshots ? this.snapshots.filter((snapshot: Snapshot<T, K>) => {
        if (snapshot.tags && typeof snapshot.tags !== 'object') {
          // Check if tags is a TagsRecord
          if (Array.isArray(snapshot.tags)) {
            // If tags is an array of strings, check if `tag` is in the array
            return snapshot.tags.includes(tag);
          } else {
            // If tags is a TagsRecord, check for relatedTags within each Tag
            return Object.values(snapshot.tags).some((t) => t.relatedTags.includes(tag));
          }
        }
        return false; // If no tags, or if tags is a simple string, return false
      }) : [];
    },

    batchFetchSnapshotsSuccess: (subscribers: SubscriberCollection<T, K>[], snapshots: Snapshots<T, K>) => {
      // Logic for success handling of snapshot fetch in batch
    },
    batchFetchSnapshotsFailure: (error: any) => {
      // Logic for failure handling of snapshot fetch in batch
    },
    batchUpdateSnapshotsSuccess: (subscribers: SubscriberCollection<T, K>, snapshots: Snapshots<T, K>) => {
      // Logic for success handling of snapshot update in batch
    },
    batchUpdateSnapshotsFailure: (error: any) => {
      // Logic for failure handling of snapshot update in batch
    },
    snapshot: async (
      id: string | number | undefined,
      snapshotId: string | number | null | undefined,
      snapshotData: SnapshotData<T, K>,
      category: Category | undefined,
      categoryProperties: CategoryProperties | undefined,
      callback: (snapshotStore: SnapshotStore<T, K>) => void,
      dataStore: DataStore<T, K>,
      dataStoreMethods: DataStoreMethods<T, K>,
      metadata: UnifiedMetaDataOptions<T, K, Meta, ExcludedFields>,
      subscriberId: string,
      endpointCategory: string | number,
      storeProps: SnapshotStoreProps<T, K>,
      snapshotConfigData: SnapshotConfig<T, K>,
      subscription: Subscription<T, K>,
      snapshotId?: string | number | null,
      snapshotStoreConfigData?: SnapshotStoreConfig<T, K>,
      snapshotContainer?: SnapshotStore<T, K> | Snapshot<T, K> | null
    ): Promise<{ snapshot: Snapshot<T, K> }> => {
      try {
        // Example logic to create or fetch a snapshot
        let snapshot: Snapshot<T, K>;

        // You can create the snapshot based on your application logic
        // For now, let's assume it's created or fetched from a snapshot store
        if (snapshotContainer) {
          snapshot = snapshotContainer; // Use the provided snapshotContainer if available
        } else {
          // If no snapshotContainer, create a new snapshot (this is just an example, adjust as necessary)
          snapshot = {
            id: snapshotId || id || '', // or any logic to set the snapshot's ID
            data: data, // or logic to pull the snapshot data
            metadata: metadata, // Attach metadata
            version: '1.0', // Set an example version, or fetch it based on your system
            category: category, // Attach category if available
            categoryProperties: categoryProperties, // Attach categoryProperties if available
          };
        }

        // Execute the callback with the snapshotStore (could be part of your logic)
        if (callback) {
          const snapshotStore = new SnapshotStore<T, K>(storeProps); // Create or use existing SnapshotStore
          callback(snapshotStore);
        }

        // Return the snapshot in the expected format
        return Promise.resolve({ snapshot });
      } catch (error) {
        return Promise.reject(error); // Handle errors appropriately
      }
    }, // Assuming no initial snapshot
    handleSnapshotSuccess: (
      message: string,
      snapshot: Snapshot<T, K> | null,
      snapshotId: string
    ) => {
      // Logic to handle snapshot success
    },
    getSnapshotId: () => {
      return 'snapshotId'; // Return the snapshot ID
    },
    compareSnapshotState: (state1: Snapshot<T, K> | null, state2: Snapshot<T, K>): boolean => {
      // Logic to compare snapshot state
    },
    payload: {
      error: "",
      meta: {} || undefined
    }, // Assuming an empty payload, update accordingly
    dataItems: () => null, // Assuming an empty array of data items
    newData: newData,
    // New data to be populated, initialize as needed
    getInitialState: (): Snapshot<T, K> | null => {
      return {} as Snapshot<T, K>; // Logic to get initial state
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
    setData: (id: string, data: Map<string, Snapshot<T, K>>) => {
      // Logic to set data
    },
    addData: (id: string, data: Partial<Snapshot<T, K>>) => {
      // Logic to add data
    },

    stores: (storeProps: SnapshotStoreProps<T, K>): SnapshotStore<T, K>[] => {
      const stores: SnapshotStore<T, K>[] = [];
      const { name, version, options, snapshots, expirationDate, schema,
        payload, } = storeProps
      // Example logic: Check if a certain event has occurred
      if (events.has('specificEventOccurred')) {  // Replace with actual event logic
        stores.push(new SnapshotStore<T, K>({
          storeId, name, version, options, snapshots, expirationDate, schema,
          payload
        }));
      }
  
      return stores;
    }, // Assuming an empty list of stores
    getStore: (
      storeId: number,
      snapshotStore: SnapshotStore<T, K>,
      snapshotId: string | null,
      snapshot: Snapshot<T, K>,
      snapshotStoreConfig: SnapshotStoreConfig<T, K>,
      type: string,
      event: Event
    ) => {
      return null; // Logic to get store by ID
    },
    addStore: (store: SnapshotStore<T, K>) => {
      // Logic to add a store
    },

    mapSnapshot: (id: number,
      storeId: string | number,
      snapshotStore: SnapshotStore<T, K>,
      snapshotContainer: SnapshotContainer<T, K>,
      snapshotId: string,
      criteria: CriteriaType,
      snapshot: Snapshot<T, K>,
      type: string,
      event: Event,
      callback: (snapshot: Snapshot<T, K>) => void,
      mapFn: (item: T) => T
    ): Snapshot<T, K> | null => {
      // Find the snapshot in the store by ID
      const snapshotToMap = snapshotStore.get(id);
      if (!snapshotToMap) {
        console.error(`Snapshot with ID ${id} not found in store.`);
        return null;
      }

      // Apply the mapping function to each item in the snapshot's data
      snapshotToMap.data = snapshotToMap.data.map(mapFn);

      // Optionally invoke callback for post-processing
      callback(snapshotToMap);
     
      // Return the mapped snapshot
      return snapshotToMap;
    },

    mapSnapshotWithDetails: (
      storeId: number,
      snapshotStore: SnapshotStore<T, K>,
      snapshotId: string,
      snapshot: Snapshot<T, K>,
      type: string,
      event: Event,
      callback: (snapshot: Snapshot<T, K>) => void,
      details: any
    ): SnapshotWithData<T, K> | null => {
      // Logic to map a snapshot with details
      const snapshotToMap = snapshotStore.getSnapshot(snapshotId);
      if (!snapshotToMap) {
        console.error(`Snapshot with ID ${snapshotId} not found.`);
        return null;
      }


      // Combine the snapshot with additional details
      const snapshotWithDetails: SnapshotWithData<T, K> = {
        ...snapshotToMap,   // Spread the original snapshot properties
        details             // Add the additional details
      };

      // Ensure that snapshotWithDetails is compatible with Snapshot<T, K>
      const snapshotWithFullDetails: Snapshot<T, K> = {
        ...snapshotWithDetails, // Spread the snapshot with details
        deleted: false,         // Default value for 'deleted', adjust as needed
        initialState: {},       // Initialize 'initialState', adjust as needed
        isCore: false,          // Initialize 'isCore', adjust as needed
        initialConfig: {},      // Initialize 'initialConfig', adjust as needed
      };

      // Invoke the callback with the enriched snapshot
      callback(snapshotWithFullDetails);

      // Return the enriched snapshot
      return snapshotWithFullDetails;
    },

    removeStore: (
      storeId: number,
      store: SnapshotStore<T, K>,
      snapshotId: string,
      snapshot: Snapshot<T, K>,
      type: string,
      event: Event
    ) => {
      // Logic to remove a store by ID
    },
    unsubscribe: (
      unsubscribeDetails: {
        userId: string;
        snapshotId: string;
        unsubscribeType: string;
        unsubscribeDate: Date;
        unsubscribeReason: string;
        unsubscribeData: any;
      },
      callback: Callback<Snapshot<T, K>> | null
    ) => {
      // Logic to unsubscribe
    },

    fetchSnapshot: async (
      snapshotId: string,
      callback: (
        snapshotId: string,
        payload: FetchSnapshotPayload<T> | undefined,
        snapshotStore: SnapshotStore<T, K>,
        payloadData: T | Data<T>,
        category: Category | undefined,
        categoryProperties: CategoryProperties | undefined,
        timestamp: Date,
        data: T,
        delegate: SnapshotWithCriteria<T, K>[]
      ) => Snapshot<T, K>
    ): Promise<{
      id: string;
      category: Category;
      categoryProperties: CategoryProperties;
      timestamp: Date;
      snapshot: Snapshot<T, K>;
      data: BaseData<any, any, any>;
      delegate: SnapshotWithCriteria<T, K>[];
    }> => {
      try {
        // Fetch the snapshot (this would typically be an async operation)
        const snapshot = await getCurrentSnapshot<T, K>(snapshotId, storeId);
    
        if (!snapshot) {
          console.error(`No snapshot found for ID ${snapshotId}`);
          return;
        }
    
        // Simulate a fetch payload and other required data
      const payload: FetchSnapshotPayload<T> = {
          metadata: snapshot.metadata,
          id: snapshot.id,
          key: snapshot.key,
          topic: snapshot.topic,
          data: snapshot.data,
          title: snapshot.title,
          description: snapshot.description ? snapshot.description : undefined,
          createdAt: typeof snapshot.createdAt === 'string' ? new Date(snapshot.createdAt) : snapshot.createdAt,
          updatedAt: snapshot.updatedAt,
          status: snapshot.status,
          events: (snapshot.events as Record<string, CalendarEvent<T, T>[]>) ?? {},
          dataItems: snapshot.dataItems,
          newData: snapshot.newData,
        };
    
        if (category === undefined) {
          throw new Error("Category is undefined");
        }
    
        const categoryProperties = getCategoryProperties(category);
        const timestamp = new Date();
        const delegate = useDataStore()?.snapshotStoreConfig?.find(config => config.delegate)?.delegate ?? null;
    
        // Execute the callback with the fetched data
        callback(snapshotId, payload, snapshotStore, snapshot.data, category, categoryProperties, timestamp, snapshot.data, delegate);
    
        // Return the data in the expected format
        return {
          id: snapshotId,
          category,
          categoryProperties,
          timestamp,
          snapshot,
          data: snapshot.data,
          delegate,
        };
      } catch (error) {
        console.error("Error fetching snapshot:", error);
        throw error;
      }
    },
    
    fetchSnapshotSuccess: async (
      id: number,
      snapshotId: string,
      snapshotStore: SnapshotStore<T, K>,
      payload: FetchSnapshotPayload<T, K> | undefined,
      snapshot: Snapshot<T, K>,
      data: T,
      delegate: SnapshotWithCriteria<T, K>[],
      snapshotData: (
        snapshotManager: SnapshotManager<T, K>,
        subscribers: Subscriber<T, K>[],
        snapshot: Snapshot<T, K>
      ) => void
    ): Promise<SnapshotWithCriteria<T, K>[]> => {
      console.log(`Snapshot with ID ${snapshotId} fetched successfully.`);
    
      // Provide the initial store ID
      const storeId = 1;
    
      try {
        const { snapshotManager, snapshotStore } = await useSnapshotManager<T, K>(storeId);
    
        // Use snapshotData to process the snapshot
        snapshotData(snapshotManager, subscribers, snapshot);
    
        // Return delegates or any other processed data
        return delegate;
      } catch (error) {
        console.error("Error in fetchSnapshotSuccess:", error);
        throw error;
      }
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
    configureSnapshotStore: (config: SnapshotStoreConfig<T, K>) => {
      // Logic to configure snapshot store
    },
    updateSnapshotSuccess: (snapshotId: string, snapshotManager: SnapshotManager<T, K, undefined>, snapshot: Snapshot<T, K>, payload?: { data?: Error | undefined; } | undefined) => {
      // Logic to handle successful snapshot update
    },
    createSnapshotFailure: (error: any) => {
      // Logic to handle snapshot creation failure
    },
    createSnapshotSuccess: (snapshotId: string | number | null, snapshotManager: SnapshotManager<T, K, undefined>, snapshot: Snapshot<T, K>, payload?: { data?: any; } | undefined) => {
      // Logic to handle successful snapshot creation
    },
    createSnapshots: (
      id: string,
      snapshotId: string | number | null,
      snapshots: Snapshot<T, K>[], // Use Snapshot<T, K>[] here
      snapshotManager: SnapshotManager<T, K>,
      payload: CreateSnapshotsPayload<T, K>,
      callback: (snapshots: Snapshot<T, K>[]) => void | null,
      snapshotDataConfig?: SnapshotConfig<T, K>[] | undefined,
      category?: string | Category,
      categoryProperties?: string | CategoryProperties
    ): Snapshot<T, K>[] => {
      const createdSnapshots: Snapshot<T, K>[] = [];

      // Logic to create multiple snapshots
      for (let i = 0; i < snapshots.length; i++) {
        const snapshot = snapshots[i];
        // Implement the logic for creating a snapshot, possibly modifying it using payload and config

        // Add the snapshot to the createdSnapshots array
        createdSnapshots.push(snapshot);
      }

      // Optionally invoke the callback if provided
      if (callback) {
        callback(createdSnapshots);
      }

      // Return the array of created snapshots
      return createdSnapshots;
    },
    onSnapshot: (
      snapshotId: string,
      snapshot: Snapshot<T, K>,
      type: string, event: Event,
      callback: (snapshot: Snapshot<T, K>) => void
    ) => {
      // Logic to handle a single snapshot event
    },
    onSnapshots: (snapshotId: string,
      snapshots: Snapshots<T, K>,
      type: string,
      event: Event,
      callback: (snapshots: Snapshots<T, K>) => void
    ) => {
      // Logic to handle multiple snapshots events
    },
    events: {} as CombinedEvents<T, K>, // Placeholder for event handlers or listeners
  }

  const { subscribers, snapshots } = await snapshotData(
    [], // Pass the snapshot IDs as needed
    [], // Pass the subscribers collection as needed
    [] // Pass the snapshots collection as needed
  );
  
  if (initialState instanceof SnapshotStore) {
    validatedInitialState = initialState;
  } else if (initialState && typeof initialState === 'object' && 'snapshotId' in initialState) {
    validatedInitialState = initialState as Snapshot<T, K>;
  } else if (initialState === null) {
    validatedInitialState = null;
  } else {
    // Handle the case where initialState is of an unexpected type
    throw new Error('initialState is not of type SnapshotStore<T, K> or Snapshot<T, K>');
  }

  const {
    prefix,
    name,
    type,
   
    storeConfig,
    isCore,
    onInitialize,
    currentCategory,
    description, // Optional description
   
  } = storeProps

  const generatedSnapshotId = generateSnapshotId();
  const snapshotConfig = createSnapshotConfig(
    snapshotId?.toString() ? generatedSnapshotId : '', // Convert snapshotId to string or use empty string if undefined
    prefix,
    name,
    type,
    existingConfigsMap, // Map of existing configs
    snapshotData, // Snapshot data
    category, // Category
    criteria, // Criteria
    storeConfig,
    isCore,
    onInitialize,
    storeId,
    currentCategory,
    description, // Optional description
    structuredMetadata, // Optional metadata
    priority, // Priority
    version, // Optional version
    additionalData // Additional data if needed
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
    } as UnifiedMetaDataOptions<T, K, Meta, ExcludedFields>,

    criteria: {}, // Example criteria object, update with specific criteria
    callbacks: {},
    data: new Map<string, Snapshot<T, K>>(), // Changed to a new Map instance
    initialState: validatedInitialState,
    snapshotId,
    category,
    date: new Date(),
    type: "default-type",
    snapshotConfig: [], // Adjust as needed
      subscribeToSnapshots: (
        snapshotStore: SnapshotStore<T, K>,
        snapshotId: string,
        snapshotData: SnapshotData<T, K>,
        category: symbol | string | Category | undefined,    
        snapshotConfig: SnapshotStoreConfig<T, K>,
        callback: (
          snapshotStore: SnapshotStore<T, K>, 
          snapshots: SnapshotsArray<T, K>
        ) => Subscriber<T, K> | null,
        snapshots: SnapshotsArray<T, K>,
        unsubscribe?: UnsubscribeDetails,
      ): SnapshotsArray<T, K> => {
        const convertedSnapshots = convertToArray(snapshotStore, snapshots);
        subscribeToSnapshotsImpl(snapshotId, callback, snapshotStore, convertedSnapshots);
        return convertedSnapshots;
      },

    subscribeToSnapshot: (
      snapshotId: string,
      callback: (snapshot: Snapshot<T, K>) => Subscriber<T, K> | null,
      snapshot: Snapshot<T, K>
    ): Subscriber<T, K> | null => {
      if(snapshotStore === null){
        throw new Error("Snapshot store is null");
      }
      const convertedSnapshot = convertToArray(snapshotStore, snapshot)[0]; // Convert single snapshot to array and take the first element
      return subscribeToSnapshotImpl(snapshotId, callback, convertedSnapshot);
    },

    getDelegate: ({ useSimulatedDataSource, simulatedDataSource }: {
      useSimulatedDataSource: boolean,
      simulatedDataSource: SnapshotStoreConfig<T, K>[]
    }) => {
      return useSimulatedDataSource ? simulatedDataSource : [];
    },
    getCategory: getCategory,
    getSnapshotConfig: () => snapshotConfig,
    getDataStoreMethods: () => dataStoreMethods as DataStoreWithSnapshotMethods<T, K>,
    snapshotMethods: [],
    delegate: async () => [], // Adjust as needed
    dataStoreMethods: dataStoreMethods as DataStoreWithSnapshotMethods<T, K>,
    handleSnapshotOperation: handleSnapshotOperation,
    displayToast: displayToast,
    addToSnapshotList: addToSnapshotList,
    eventRecords: {},
    snapshotStoreConfig: snapshotStoreConfig ? snapshotStoreConfig : undefined,
    unsubscribeToSnapshots: (
      snapshotId: string,
      snapshot: Snapshot<T, K>,
      type: string,
      event: Event,
      callback: (snapshot: Snapshot<T, K>) => void
    ) => { },
    unsubscribeToSnapshot: (
      snapshotId: string,
      snapshot: Snapshot<T, K>,
      type: string,
      event: Event,
      callback: (snapshot: Snapshot<T, K>) => void
    ) => { },
    handleSnapshotStoreOperation: handleSnapshotStoreOperation,
    simulatedDataSource: [],
  };

}; 




const isSnapshotStoreOptions =  <T extends BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(obj: any): obj is SnapshotStoreOptions<T, K> => {  
  return obj && typeof obj === 'object' && 'data' in obj && 'initialState' in obj;
};

const getCurrentSnapshotStoreOptions =  <T extends BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(
  snapshotStoreOptions: any
): SnapshotStoreOptions<T, K> | null => {
  return isSnapshotStoreOptions<T, K>(snapshotStoreOptions) ? snapshotStoreOptions : null;
};

const convertToArray = <
  T extends BaseData<any>,
  K extends T = T,
  Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(
  snapshotStore: SnapshotStore<T, K>,
  snapshot: Snapshot<T, K> | Snapshots<T, K> | SnapshotsArray<T, K>
): SnapshotsArray<T, K> => {
  return Array.isArray(snapshot) ? snapshot as SnapshotsArray<T, K> : [snapshot] as SnapshotsArray<T, K>;
};

// const handleSingleSnapshot = <T extends BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(
//   snapshot: Snapshot<T, K>,
//   callback: Callback<Snapshot<T, K>>
// ) => {
//   if (snapshot.type !== null && snapshot.type !== undefined && snapshot.timestamp !== undefined) {
//     callback({
//       ...snapshot,
//       type: snapshot.type as string,
//       timestamp: typeof snapshot.timestamp === 'number' ? new Date(snapshot.timestamp) : snapshot.timestamp,
//       store: snapshot.store,
//       dataStore: snapshot.dataStore,
//       events: snapshot.events ?? undefined,
//       meta: snapshot.meta ?? {},
//       data: snapshot.data ?? ({} as T),
//       initialState: snapshot.initialState as InitializedState<T, K>,
//       mappedSnapshotData: new Map(
//         Array.from(snapshot.mappedSnapshotData || []).map(([key, value]) => [
//           key,
//           {
//             ...value,
//             initialState: value.initialState as InitializedState<T, K>,
//           },
//         ])
//       ),
//     } as unknown as Snapshot<T, K>);
//   } else {
//     callback(snapshot);
//   }
// };

// const handleSnapshotsArray =  <T extends BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(
//   snapshots: SnapshotsArray<T, K>,
//   callback: Callback<Snapshot<T, K>>
// ) => {
//   snapshots.forEach((snap) => {
//     if (snap.type !== null && snap.type !== undefined && snap.timestamp !== undefined) {
//       callback({
//         ...snap,
//         type: snap.type as string,
//         timestamp: typeof snap.timestamp === 'number' ? new Date(snap.timestamp) : snap.timestamp,
//         store: snap.store,
//         dataStore: snap.dataStore,
//         events: snap.events ?? undefined,
//         meta: snap.meta ?? {},
//         data: snap.data ?? ({} as T),
//         initialState: snap.initialState as InitializedState<T, K>,
//         mappedSnapshotData: new Map(
//           Array.from(snap.mappedSnapshotData || []).map(([key, value]) => [
//             key,
//             {
//               ...value,
//               initialState: value.initialState as InitializedState<T, K>,
//             },
//           ])
//         ),
//       } as unknown as Snapshot<T, K>);
//     } else {
//       callback(snap as unknown as Snapshot<T, K>);
//     }
//   });
// };



function isSnapshotsArray<T extends BaseData>(
  obj: any
): obj is SnapshotsArray<T, K> {
  return Array.isArray(obj) && obj.every(item => isSnapshot(item));
}




// Renamed function to avoid conflict
const isSnapshotArrayState = <T extends BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(state: any): state is Snapshot<T, K>[] => {
  // Logic to determine if it's a Snapshot array
  return Array.isArray(state) && state.every((item: any) => isSnapshot(item));
};


function toSnapshotsArray<T extends BaseData<any>, K extends T = T>(snapshots: Snapshot<T, K>[]): SnapshotsArray<T, K> {
  // Transform if needed, or validate each snapshot type
  return snapshots as SnapshotsArray<T, K>;
}


function isCompatibleSnapshot <T extends BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(
  snapshot: Snapshot<T, K>
): snapshot is Snapshot<T, K> & { storeConfig: { tempData: any } } {
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

// Define the type guard to check if an object is of type SnapshotUnion<T, T>
function isSnapshotUnion<T extends BaseData<any>, K extends T>(
  obj: any
): obj is SnapshotUnion<T, T> {
  // Check for required properties in SnapshotUnion<T, T>
  return (
    typeof obj === "object" &&
    obj !== null &&
    "deleted" in obj &&
    "initialState" in obj &&
    "isCore" in obj &&
    "initialConfig" in obj
    // Add other essential properties checks if needed
  );
}


function convertSnapshotsObjectToArray<T extends BaseData, K extends T = T>(
  snapshotsObject: SnapshotsObject<T, K>
): SnapshotsArray<T, K> {
  const snapshotsArray = Object.values(snapshotsObject).map((snapshot) => {
    // Use isCompatibleSnapshot to check compatibility
    if (isSnapshotUnion(snapshot)) {
      return snapshot;
    }
    // Perform any conversion needed to ensure compatibility
    return {
      ...snapshot,
      deleted: false, // Example default value, set appropriately
      initialState: snapshot, // Adjust as necessary
      isCore: true, // Example default value, set appropriately
      initialConfig: {}, // Example default config, replace with actual
    } as SnapshotUnion<T, K>;
  });
  return snapshotsArray;
}



export {
    convertSnapshotsObjectToArray, convertToArray, createSnapshotStoreOptions, getCurrentSnapshotStoreOptions,
    isCompatibleSnapshot, isSnapshotArrayState, isSnapshotsArray,
    isSnapshotStoreOptions, isSnapshotUnion, toSnapshotsArray
};

