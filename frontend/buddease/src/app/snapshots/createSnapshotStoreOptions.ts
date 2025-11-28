// createSnapshotStoreOptions.ts

import { Subscription } from '@/app/subscriptions/Subscription';
import { isBaseData } from '@/app/utils/snapshotUtils'
import { Tag } from '@/app/models/tracker/Tag';
import { isInitializedSnapshot } from "@/app/api/ApiDataAnalysis";
import getCurrentSnapshot from '@/app/api/SnapshotApi';
import { getSubscribersAPI } from '@/app/api/subscriberApi';
import { LanguageEnum } from '@/app/communications/LanguageEnum';
import { RealtimeDataItem } from '@/app/typings/realtimeTypes';
import { baseConfig, BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { UnifiedMetadata } from "@/app/config/MetaDataOptions";
import { StructuredMetadata } from "@/app/config/StructuredMetadata";
import { createMeta } from "@/app/config/metadata/createMeta";
import { useMeta } from '@/app/config/useMeta';
import { useMetadata } from "@/app/config/useMetadata";
import { Attachment } from '@/app/documents/attachment/Attachment';
import { UnsubscribeDetails } from '@/app/typings/eventHandlers/eventTypes';
import useSecureStoreId from '@/app/hooks/useSecureStoreId';
import { useSecureUserId } from '@/app/hooks/useSecureUserId';
import { CombinedEvents, SnapshotManager, SnapshotStoreOptions, useSnapshotManager } from '@/app/hooks/useSnapshotManager';
import { getCategoryProperties } from "@/app/libraries/categories/CategoryManager";
import { Category } from '@/app/libraries/categories/generateCategoryProperties';
import { BaseData, Data } from '@/app/models/data/Data';
import { allCategories } from '@/app/models/data/DataStructureCategories';
import { StatusType } from "@/app/models/data/StatusType";
import { fetchUserAreaDimensions } from '@/app/pages/layouts/fetchUserAreaDimensions';
import { CategoryProperties } from '@/app/pages/personas/ScenarioBuilder';
import { CriteriaType } from "@/app/pages/searches/CriteriaType";
import { DataStoreMethods, DataStoreWithSnapshotMethods } from '@/app/projects/DataAnalysisPhase/DataProcessing/DataStoreMethods';
import { CreateSnapshotsPayload } from '@/app/server/database/Payload';
import baseMeta from '@/app/server/database/baseMeta';
import { createSnapshotConfig, CustomSnapshotData, SnapshotConfig, SnapshotContainer, SnapshotData, SnapshotStoreConfig, SnapshotStoreProps, SnapshotWithCriteria, subscribeToSnapshotImpl } from '@/app/snapshots';
import { Callback } from "@/app/subscribers/subscribeToSnapshotsImplementation";
import { FetchSnapshotPayload } from '@/app/snapshots/FetchSnapshotPayload';
import {
  Snapshots,
  SnapshotsArray,
  SnapshotsObject,
  SnapshotUnion
} from "@/app/snapshots/LocalStorageSnapshotStore";
import { Snapshot } from "@/app/snapshots/Snapshot";
import { SnapshotContainerType } from '@/app/snapshots/SnapshotContainer';
import { InitializedData } from '@/app/snapshots/SnapshotStoreOptions';
import { storeProps } from '@/app/snapshots/SnapshotStoreProps';
import handleSnapshotStoreOperation from '@/app/snapshots/handleSnapshotStoreOperation';
import { getCategory } from '@/app/snapshots/snapshotContainerUtils';
import { DataStore, InitializedState, useDataStore } from '@/app/state/stores/DataStore';
import { Subscriber } from "@/app/subscribers/Subscriber";
import { subscribeToSnapshotsImpl } from '@/app/subscribers/subscribeToSnapshotsImplementation';
import { getSubscription } from '@/app/subscriptions/subscriptionServiceInstance';
import { SnapshotEvent } from '@/app/typings/snapshotTypes';
import { Version, versionData } from '@/app/versions/Version';
import { createDefaultVersionData } from '@/app/versions/VersionData';
import { createLatestVersion } from '@/app/versions/createLatestVersion';
import { SnapshotWithData } from '@/app/components/calendar/CalendarApp';
import { CalendarEvent } from '@/app/calendar/CalendarEvent';
import { BaseDataRoot } from '@/app/config/BaseeConfig';
import { UnifiedMetaDataOptions } from '@/app/config/database/MetaDataOptions';
import {
  createBasicSnapshot,
  createCompleteSnapshot
} from '@/app/snapshots/createSnapshot';
import { handleSnapshotOperation } from '@/app/snapshots/handleSnapshotOperation';
import { displayToast } from '@/models/display/ShowToast';
import { SubscriberCollection } from '@/app/subscribers/SubscriberCollection';
import { convertToSubscriberCollection } from '@/utils/SubscriberUtils';
import { addToSnapshotList, generateSnapshotId, isSnapshot } from "@/utils/snapshotUtils";
import { Tag } from 'sanitize-html';
import SnapshotStore from "./SnapshotStore";


interface Difference<T> {
  snapshot1: T;
  snapshot2: T;
  differences: Record<string, { value1: T; value2: T }>;
}



const compareSnapshots = <T extends Record<keyof T, any>>(
  snapshot1: T,
  snapshot2: T
): Record<string, Difference<any>> => {
  const itemDifferences: Record<string, Difference<any>> = {};

  (Object.keys(snapshot1) as Array<keyof T>).forEach((key) => {
    const value1 = snapshot1[key];
    const value2 = snapshot2[key];

    if (value1 !== value2) {
      const stringKey = String(key);
      itemDifferences[stringKey] = {
        snapshot1: value1,
        snapshot2: value2,
        differences: {
          [stringKey]: { value1, value2 },
        },
      };
    }
  });

  return itemDifferences;
};



function useMetaHandler<  
  T extends BaseDataEntity = BaseDataRoot,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(area?: string, config?: MetaConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) {
  try {
    const defaultArea = fetchUserAreaDimensions().toString();
    const currentArea = area || defaultArea;

    const existingMeta = useMeta<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>(currentArea);
    if (existingMeta) return existingMeta;

    return createMeta<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>({
      id: config?.id || `meta-${currentArea}`,
      description: config?.description || `Metadata for ${currentArea}`,
      ...config?.customProps
    });

  } catch (error) {
    console.error('Meta initialization failed:', error);

    return createMeta<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>({
      id: 'fallback-meta',
      description: 'Fallback Metadata',
      ...config?.customProps
    });
  }
}

const createSnapshotStoreOptions = <
  T extends BaseDataEntity = BaseDataRoot,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>({
  initialState,
  snapshotId,
  category,
  dataStoreMethods,
}: {
  initialState: InitializedState<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  snapshotId?: string | number | null;
  category?: Category,
  categoryProperties: CategoryProperties | undefined;
  dataStoreMethods: Partial<DataStoreWithSnapshotMethods<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>;
}): Promise<SnapshotStoreOptions<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> => {
  return new Promise(async (resolve, reject) => {

    // Define the context type
    type StoreContext = {
      snapshots?: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
    };

    // Store a reference to the expected context
    const context: StoreContext = this || {};

    try {
      const snapshotStoreConfig = useDataStore().snapshotStoreConfig

      const storeId = useSecureStoreId()
      if (storeId === undefined || storeId === null) {
        throw new Error('snapshotId must be defined');
      }

      const { snapshotStore } = await useSnapshotManager(Number(storeId), storeProps);

      // Initialize the configs map, this could be loaded from some external source or API
      const existingConfigsMap = new Map<string, SnapshotConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>();


      const area = `${fetchUserAreaDimensions().width}x${fetchUserAreaDimensions().height}`;
      const currentMetadata: UnifiedMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = useMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>(area)
      const { latestVersion = createLatestVersion(), ...rest } = (data as Record<string, any>) || {};

      const categoryProperties = getCategoryProperties(category);

      // Use the meta handler with proper typing
      const currentMeta = useMetaHandler<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>(area, {
        id: `snapshot-store-${storeId}`,
        description: `Metadata for snapshot store ${storeId}`,
        customProps: {
          storeId,
          category,
          ...categoryProperties
        }
      });

      const version: Version<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = {
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
        data: data,
        _structure: {},

        versionHistory: {
          versions, 
          currentVersionIndex,
          versionData: versionData,
          latestVersion,
          timestamp: new Date()
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


      const defaultVersion: Version<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = version

      // Initialize structured metadata, this could also come from some external source
      const structuredMetadata: StructuredMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = {
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
            contributors: {
              memberName: 'Contributor Name',
              contributions: 0,
            },
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

        childIds: [],
        relatedData: [],
        versionData: createDefaultVersionData(),
        latestVersion: createLatestVersion<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>(),
        keywords: []
      };

      // Define criteria that might be used to filter or find snapshots
      const criteria: CriteriaType = {
        filterBy: 'category',
        value: category && typeof category === 'object' && 'name' in category ? category.name : '',
      };


      // Define custom snapshot data, which could include any additional fields
      const customSnapshotData: CustomSnapshotData<T> = {
        timestamp: undefined,
        value: undefined,
        orders: [],
      };

      // Ensure initialState is correctly typed before proceeding
      let validatedInitialState: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null = null;
      let data: Data<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;

      const userId = useSecureUserId()
      if (snapshotId === undefined || snapshotId === null) {
        throw new Error('snapshotId must be defined');
      }

      const { subscription, subscriber } = getSubscription<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>(userId.toString(), snapshotId.toString());

      // Access or define snapshotData. This would typically be passed into the function
      const newData = useSnapshotManager<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>(storeId, storeProps)

      const snapshotData: SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = {
        subscribers: subscriber ? convertToSubscriberCollection(subscriber.getSubscribers) : [],
        config: Promise.resolve(null), // Assuming no initial configuration
        metadata: structuredMetadata, // Predefined metadata
        items: [], // Assuming an empty list of items
        snapshotStore: null, // No initial store, this might be populated later
        data: {} as Data<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined, // Initialize as an empty map or assign actual data
        // mappedData: new Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>(), // Initialize as an empty map or assign actual data
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
          categoryProperties: CategoryProperties | undefined,
          dataStoreMethods: DataStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
          category?: Category,
        ): Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> | null | undefined => {
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
          subscribers: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
          data: Partial<SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>
        ): Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] => {
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
                    deleted, initialState, isCore, initialConfig, 
                  } as Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
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
          event: SnapshotEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
          id: number,
          snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
          category?: Category, categoryProperties: CategoryProperties | undefined,
          dataStoreMethods: DataStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
          data: T,
          filter?: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => boolean,
          dataCallback?: (
            subscribers: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
            snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
          ) => Promise<SnapshotUnion<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>
        ): Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]> => {
          try {
            // Log the event type and timestamp for tracking
            console.log(`Event ${type} occurred at ${timestamp}`);

            // Safely cast the category from the command line argument
            const categoryArg = process.argv[3];
            const convertedCategory = categoryArg as keyof typeof allCategories;

            // Step 1: Fetch all snapshots from the snapshot store
            const allSnapshots = snapshotStore.getSnapshots(`${convertedCategory}`, data);

            // Step 2: Filter snapshots based on category if provided
            let filteredSnapshots: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] = allSnapshots || [];
            if (category && Array.isArray(filteredSnapshots)) {
              // Safely filter the snapshots by the provided category
              filteredSnapshots = filteredSnapshots.filter(snapshot => snapshot.category === category);
            }

            // Step 3: Optionally perform some processing with the provided callback
            if (dataCallback) {
              const subscribers = await getSubscribersAPI();
              const foundSubscribers = snapshotStore.getSubscribers(subscribers, filteredSnapshots);
              const processedSnapshots = await dataCallback(foundSubscribers, filteredSnapshots as unknown as Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>);

              // Step 4: Return the processed snapshots (if callback modifies them)
              return processedSnapshots as unknown as Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
            }

            // If no callback, return the filtered snapshots
            return filteredSnapshots as Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
          } catch (error) {
            console.error(`Error fetching snapshots: ${error}`);
            return [];
          }
        },

        generateId: () => {
          return 'newId'; // Generate and return an ID
        },

        compareSnapshots: (
          snap1: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
          snap2: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
        ): {
          snapshot1: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
          snapshot2: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
          differences: Record<string, { snapshot1: any; snapshot2: any }>;
          versionHistory: {
            snapshot1Version?: string | number | Version<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null;
            snapshot2Version?: string | number | Version<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null;
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
          snap1: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
          snap2: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
          keys: (keyof Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>)[]
        ): { itemDifferences: Record<string, { snapshot1: any; snapshot2: any; differences: { [key: string]: { value1: any; value2: any } } }>; } | null => {
          const itemDifferences: Record<string, { snapshot1: any; snapshot2: any; differences: Record<string, { value1: any; value2: any }> }> = {};

          keys.forEach((key) => {
            const value1 = snap1[key];
            const value2 = snap2[key];

            // If there is a difference between the values
            const stringKey = String(key); // Convert to string first
            itemDifferences[stringKey] = {
              snapshot1: value1,
              snapshot2: value2,
              differences: {
                [stringKey]: { value1, value2 },
              },
            };
          });

          // If there are differences, return them, otherwise return null
          return Object.keys(itemDifferences).length > 0
            ? { itemDifferences }
            : null;
        },

        batchTakeSnapshot: (
          id: number,
          snapshotId: string,
          snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
          snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
          snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
        ): Promise<{ snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>; }> => {
          return new Promise((resolve, reject) => {
            try {
              // Update the snapshot in the snapshot store
              snapshotStore.updateSnapshot(snapshotId, snapshot);

              // Assuming snapshots is an array, check if push is allowed
              if (Array.isArray(snapshots)) {
                snapshots.push(isInitializedSnapshot(snapshot));  // Adds snapshot to the array
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
            subscribers: SubscriberCollection<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
            snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
          ) => Promise<{
            subscribers: SubscriberCollection<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
            snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>; // Include snapshots here for consistency
          }>
        ): Promise<Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> => {
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
            snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
            subscribers: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]
          ) => Promise<{
            subscribers: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]
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
          snapshotData: (subscribers: SubscriberCollection<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => Promise<{
            subscribers: SubscriberCollection<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
            snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
          }>,
          snapshotManager: SnapshotManager<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
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
        filterSnapshotsByStatus: (status: StatusType): Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> => {
          return (context.snapshots ?? []).filter(
            (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => snapshot.status === status
          );
        },

        // Function to filter snapshots by category
        filterSnapshotsByCategory: (category: Category): Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> => {
          return (context.snapshots ?? []).filter(
            (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => snapshot.category === category
          );
        },

        filterSnapshotsByTag: (tag: Tag<T>): Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> => {
          const snapshots = context.snapshots ?? [];
          return snapshots.filter((snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => {
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
          });
        },

        batchFetchSnapshotsSuccess: (subscribers: SubscriberCollection<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[], snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => {
          // Logic for success handling of snapshot fetch in batch
        },
        batchFetchSnapshotsFailure: (error: any) => {
          // Logic for failure handling of snapshot fetch in batch
        },
        batchUpdateSnapshotsSuccess: (subscribers: SubscriberCollection<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => {
          // Logic for success handling of snapshot update in batch
        },
        batchUpdateSnapshotsFailure: (error: any) => {
          // Logic for failure handling of snapshot update in batch
        },
        snapshot: async (
          id: string | number | undefined,
          snapshotData: SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
          categoryProperties: CategoryProperties | undefined,
          callback: (snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void,
          dataStore: DataStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
          dataStoreMethods: DataStoreMethods<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
          metadata: UnifiedMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
          subscriberId: string,
          endpointCategory: string | number,
          storeProps: SnapshotStoreProps<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
          snapshotConfigData: SnapshotConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
          subscription: Subscription<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
          category?: Category,
          snapshotId?: string | number | null,
          snapshotStoreConfigData?: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
          snapshotContainer?: SnapshotContainerType<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
        ): Promise<{ snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> }> => {
          try {
            // Example logic to create or fetch a snapshot
            let snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;

            // You can create the snapshot based on your application logic
            // For now, let's assume it's created or fetched from a snapshot store
            if (snapshotContainer) {
              snapshot = snapshotContainer; // Use the provided snapshotContainer if available
            } else {
              // If no snapshotContainer, create a new snapshot (this is just an example, adjust as necessary)
              snapshot = createBasicSnapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>({
                id: snapshotId || id || '',
                data: data,
                metadata: metadata,
                version: '1.0',
                category: category,
                categoryProperties: categoryProperties,
                initialState: initialState,
                isCore: isCore,
              });

              const baseData = isBaseData
              // For complex cases with all the bells and whistles:
              snapshot = await createCompleteSnapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>(
                baseData,
                baseMeta,
                snapshotId,
                category,
                snapshotStore,
                snapshotManager,
                snapshotStoreConfig,
                isSubscribed,
                storeProps,
                storeOptions
              );

            }

            // Execute the callback with the snapshotStore (could be part of your logic)
            if (callback) {
              const snapshotStore = new SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>(storeProps); // Create or use existing SnapshotStore
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
          snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null,
          snapshotId: string
        ) => {
          // Logic to handle snapshot success
        },
        getSnapshotId: () => {
          return 'snapshotId'; // Return the snapshot ID
        },
        compareSnapshotState: (state1: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null, state2: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): boolean => {
          // Logic to compare snapshot state
        },
        payload: {
          error: "",
          meta: {} || undefined
        }, // Assuming an empty payload, update accordingly
        dataItems: () => null, // Assuming an empty array of data items
        newData: newData,
        // New data to be populated, initialize as needed
        getInitialState: (): Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null => {
          return {} as Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>; // Logic to get initial state
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
        setData: (id: string, data: Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>) => {
          // Logic to set data
        },
        addData: (id: string, data: Partial<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>) => {
          // Logic to add data
        },

        stores: (storeProps: SnapshotStoreProps<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] => {
          const stores: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] = [];
          const { name, version, options, snapshots, expirationDate, schema,
            payload, } = storeProps
          // Example logic: Check if a certain event has occurred
          if (events.has('specificEventOccurred')) {  // Replace with actual event logic
            stores.push(new SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>({
              storeId,
              name,
              version,
              schema,
              options,
              category,
              config,
              operation,
              expirationDate,
              payload, callback, storeProps, endpointCategory, initialState
            }));
          }

          return stores;
        }, // Assuming an empty list of stores
        getStore: (
          storeId: number,
          snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
          snapshotId: string | null,
          snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
          snapshotStoreConfig: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
          type: string,
          event: Event
        ) => {
          return null; // Logic to get store by ID
        },
        addStore: (store: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => {
          // Logic to add a store
        },

        mapSnapshot: (id: number,
          storeId: string | number,
          snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
          snapshotContainer: SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
          snapshotId: string,
          criteria: CriteriaType,
          snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
          type: string,
          event: SnapshotEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
          callback: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void,
          mapFn: (item: T) => T
        ): Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null => {
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
          snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
          snapshotId: string,
          snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
          type: string,
          event: SnapshotEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
          callback: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void,
          details: any
        ): SnapshotWithData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null => {
          // Logic to map a snapshot with details
          const snapshotToMap = snapshotStore.getSnapshot(snapshotId);
          if (!snapshotToMap) {
            console.error(`Snapshot with ID ${snapshotId} not found.`);
            return null;
          }


          // Combine the snapshot with additional details
          const snapshotWithDetails: SnapshotWithData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = {
            ...snapshotToMap,   // Spread the original snapshot properties
            details             // Add the additional details
          };

          // Ensure that snapshotWithDetails is compatible with Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
          const snapshotWithFullDetails: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = {
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
          store: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
          snapshotId: string,
          snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
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
          callback: Callback<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> | null
        ) => {
          // Logic to unsubscribe
        },

        fetchSnapshot: async (
          snapshotId: string,
          callback: (
            snapshotId: string,
            payload: FetchSnapshotPayload<T> | undefined,
            snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
            payloadData: T | Data<T>,
            category?: Category,
            categoryProperties: CategoryProperties | undefined,
            timestamp: Date,
            data: T,
            delegate: SnapshotWithCriteria<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]
          ) => Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
        ): Promise<{
          id: string;
          category: Category;
          categoryProperties: CategoryProperties;
          timestamp: Date;
          snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
          data: BaseData<any, any, any>;
          delegate: SnapshotWithCriteria<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
        }> => {
          try {
            // Fetch the snapshot (this would typically be an async operation)
            const snapshot = await getCurrentSnapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>(snapshotId, storeId);

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
          snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
          payload: FetchSnapshotPayload<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined,
          snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
          data: T,
          delegate: SnapshotWithCriteria<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
          snapshotData: (
            snapshotManager: SnapshotManager<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
            subscribers: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
            snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
          ) => void
        ): Promise<SnapshotWithCriteria<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]> => {
          console.log(`Snapshot with ID ${snapshotId} fetched successfully.`);

          // Provide the initial store ID
          const storeId = 1;

          try {
            const { snapshotManager, snapshotStore } = useSnapshotManager<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>(Number(storeId), storeProps);

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
        configureSnapshotStore: (
          snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
          snapshotId: string,
          data: Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
          events: Record<string, CalendarEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>,
          dataItems: RealtimeDataItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
          newData: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
          store: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
          callback: (
            snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
          ) => void,
          payload: ConfigureSnapshotStorePayload<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
        ) => {
          // Logic to configure snapshot store
        },
        updateSnapshotSuccess: (
          snapshotId: string, 
          snapshotManager: SnapshotManager<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, 
          snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, 
          payload?: { data?: Error | undefined; } | undefined
        ) => {
          // Logic to handle successful snapshot update
        },
        createSnapshotFailure: (error: any) => {
          // Logic to handle snapshot creation failure
        },
        createSnapshotSuccess: (snapshotId: string | number | null, snapshotManager: SnapshotManager<T, K, undefined>, snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, payload?: { data?: any; } | undefined) => {
          // Logic to handle successful snapshot creation
        },
        createSnapshots: (
          id: string,
          snapshotId: string | number | null,
          snapshots: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[], // Use Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] here
          snapshotManager: SnapshotManager<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
          payload: CreateSnapshotsPayload<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
          callback: (snapshots: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]) => void | null,
          category?: string | Category,
          snapshotDataConfig?: SnapshotConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] | undefined,
           categoryProperties?: CategoryProperties,
        ): Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] => {
          const createdSnapshots: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] = [];

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
          snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
          type: string, event: SnapshotEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
          callback: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void
        ) => {
          // Logic to handle a single snapshot event
        },
        onSnapshots: (snapshotId: string,
          snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
          type: string,
          event: SnapshotEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
          callback: (snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void
        ) => {
          // Logic to handle multiple snapshots events
        },
        events: {} as CombinedEvents<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, // Placeholder for event handlers or listeners
      }

      const { subscribers, snapshots } = await snapshotData(
        [], // Pass the snapshot IDs as needed
        [], // Pass the subscribers collection as needed
        [] // Pass the snapshots collection as needed
      );

      if (initialState instanceof SnapshotStore) {
        validatedInitialState = initialState;
      } else if (initialState && typeof initialState === 'object' && 'snapshotId' in initialState) {
        validatedInitialState = initialState as Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
      } else if (initialState === null) {
        validatedInitialState = null;
      } else {
        // Handle the case where initialState is of an unexpected type
        throw new Error('initialState is not of type SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> or Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>');
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

      const options: SnapshotStoreOptions<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = {
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
          area: "SnapshotStore Options",
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
            },// Example Data object
            views: 0,
            likes: 0,
            comments: 0,
          }]
        } as UnifiedMetaDataOptions<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,

        criteria: {}, // Example criteria object, update with specific criteria
        callbacks: {},
        data: new Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>(), // Changed to a new Map instance
        initialState: validatedInitialState,
        snapshotId,
        category,
        date: new Date(),
        type: "default-type",
        snapshotConfig: [], // Adjust as needed
        subscribeToSnapshots: (
          snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
          snapshotId: string,
          snapshotData: SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
          category: symbol | string | Category | undefined,
          snapshotConfig: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
          callback: (
            snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
            snapshots: SnapshotsArray<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
          ) => Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null,
          snapshots: SnapshotsArray<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
          unsubscribe?: UnsubscribeDetails,
        ): SnapshotsArray<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> => {

          const convertedSnapshots = convertToArray(snapshotStore, snapshots);
          subscribeToSnapshotsImpl(snapshotId, callback, snapshotStore, convertedSnapshots);
          return convertedSnapshots;
        },

        subscribeToSnapshot: (
          snapshotId: string,
          callback: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null,
          snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
        ): Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null => {
          if (snapshotStore === null) {
            throw new Error("Snapshot store is null");
          }
          const convertedSnapshot = convertToArray(snapshotStore, snapshot)[0]; // Convert single snapshot to array and take the first element
          return subscribeToSnapshotImpl(snapshotId, callback, convertedSnapshot);
        },

        getDelegate: ({ useSimulatedDataSource, simulatedDataSource }: {
          useSimulatedDataSource: boolean,
          simulatedDataSource: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]
        }) => {
          return useSimulatedDataSource ? simulatedDataSource : [];
        },
        getCategory: getCategory,
        getSnapshotConfig: () => snapshotConfig,
        getDataStoreMethods: () => dataStoreMethods as DataStoreWithSnapshotMethods<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
        snapshotMethods: [],
        delegate: async () => [], // Adjust as needed
        dataStoreMethods: dataStoreMethods as DataStoreWithSnapshotMethods<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
        handleSnapshotOperation: handleSnapshotOperation,
        displayToast: displayToast,
        addToSnapshotList: addToSnapshotList,
        eventRecords: {},
        snapshotStoreConfig: snapshotStoreConfig ? snapshotStoreConfig : undefined,
        unsubscribeToSnapshots: (
          snapshotId: string,
          snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
          type: string,
          event: SnapshotEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
          callback: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void
        ) => { },
        unsubscribeToSnapshot: (
          snapshotId: string,
          snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
          type: string,
          event: SnapshotEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
          callback: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void
        ) => { },
        handleSnapshotStoreOperation: handleSnapshotStoreOperation,
        simulatedDataSource: [],
        categoryProperties,
        snapshotStore
      }
      resolve(options);
    } catch (error) {
      console.error('Error creating snapshot store options:', error);
      reject(error);
    }
  });
};




const isSnapshotStoreOptions = <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T 
>(obj: any): obj is SnapshotStoreOptions<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> => {
  return obj && typeof obj === 'object' && 'data' in obj && 'initialState' in obj;
};

const getCurrentSnapshotStoreOptions = <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T  
>(
  snapshotStoreOptions: any
): SnapshotStoreOptions<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null => {
  return isSnapshotStoreOptions<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>(snapshotStoreOptions) ? snapshotStoreOptions : null;
};

const convertToArray = <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T 
>(
    snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | SnapshotsArray<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ): SnapshotsArray<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> => {
  return Array.isArray(snapshot) ? snapshot as SnapshotsArray<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> : [snapshot] as SnapshotsArray<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
};

// const handleSingleSnapshot = <
  // T extends BaseDataEntity,
  // K extends T = T,
  // Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  // AttachmentType extends Attachment = Attachment,
  // ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  // IncludedFields extends keyof T = keyof T
  // >(
//   snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
//   callback: Callback<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>
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
//       initialState: snapshot.initialState as InitializedState<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
//       mappedSnapshotData: new Map(
//         Array.from(snapshot.mappedSnapshotData || []).map(([key, value]) => [
//           key,
//           {
//             ...value,
//             initialState: value.initialState as InitializedState<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
//           },
//         ])
//       ),
//     } as unknown as Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>);
//   } else {
//     callback(snapshot);
//   }
// };

// const handleSnapshotsArray =  <
  // T extends BaseDataEntity,
  // K extends T = T,
  // Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  // AttachmentType extends Attachment = Attachment,
  // ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  // IncludedFields extends keyof T = keyof T
// >(
//   snapshots: SnapshotsArray<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
//   callback: Callback<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>
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
//         initialState: snap.initialState as InitializedState<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
//         mappedSnapshotData: new Map(
//           Array.from(snap.mappedSnapshotData || []).map(([key, value]) => [
//             key,
//             {
//               ...value,
//               initialState: value.initialState as InitializedState<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
//             },
//           ])
//         ),
//       } as unknown as Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>);
//     } else {
//       callback(snap as unknown as Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>);
//     }
//   });
// };



function isSnapshotsArray<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
   obj: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
): obj is SnapshotsArray<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  return Array.isArray(obj) && obj.every(item => isSnapshot(item));
}

// Renamed function to avoid conflict
const isSnapshotArrayState = <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T 
>(state: any): state is Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] => {
  // Logic to determine if it's a Snapshot array
  return Array.isArray(state) && state.every((item: any) => isSnapshot(item));
};


function toSnapshotsArray<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(snapshots: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]): SnapshotsArray<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  // Transform if needed, or validate each snapshot type
  return snapshots as SnapshotsArray<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
}


function isCompatibleSnapshot<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T 
>(
  snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
): snapshot is Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> & { storeConfig: { tempData: any } } {
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
function isSnapshotUnion<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  obj: any
): obj is SnapshotUnion<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
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


function convertSnapshotsObjectToArray<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
  >(
  snapshotsObject: SnapshotsObject<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
): SnapshotsArray<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
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
    } as SnapshotUnion<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  });
  return snapshotsArray;
}



export {
  convertSnapshotsObjectToArray, convertToArray, createSnapshotStoreOptions, getCurrentSnapshotStoreOptions,
  isCompatibleSnapshot, isSnapshotArrayState, isSnapshotsArray,
  isSnapshotStoreOptions, isSnapshotUnion, toSnapshotsArray
};

