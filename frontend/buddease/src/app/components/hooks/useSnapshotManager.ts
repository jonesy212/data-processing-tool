// useSnapshotManager.ts
import { getStoreId } from '@/app/api/ApiData';
import { fetchEventId } from '@/app/api/ApiEvent';
import * as snapshotApi from '@/app/api/SnapshotApi';
import { UpdateSnapshotPayload } from "@/app/components/database/Payload";
import { getCategoryProperties } from '@/app/components/libraries/categories/CategoryManager';
import { BaseData } from '@/app/components/models/data/Data';
import { ConfigurableSnapshotStore } from '@/app/components/projects/DataAnalysisPhase/DataStore';
import { ExcludedFields } from '@/app/components/routing/Fields';
import { processSnapshot, SnapshotConfig, SnapshotContainer, SnapshotData, SnapshotStoreProps } from '@/app/components/snapshots';
import { Snapshots } from '@/app/components/snapshots/LocalStorageSnapshotStore';
import { ConfigureSnapshotStorePayload } from "@/app/components/snapshots/SnapshotConfig";
import { CustomSnapshotData } from "@/app/components/snapshots/SnapshotData";
import { storeProps } from '@/app/components/snapshots/SnapshotStoreProps';
import { SnapshotWithCriteria } from '@/app/components/snapshots/SnapshotWithCriteria';
import { createSnapshotInstance } from '@/app/components/snapshots/createSnapshotInstance';
import {
  useNotification
} from "@/app/components/support/NotificationContext";
import { SubscriberCollection } from '@/app/components/users/SubscriberCollection';
import { StructuredMetadata } from '@/app/configs/StructuredMetadata';
import { UnifiedMetaDataOptions } from '@/app/configs/database/MetaDataOptions';
import { CategoryProperties } from "@/app/pages/personas/ScenarioBuilder";
import { CriteriaType } from '@/app/pages/searchs/CriteriaType';
import { useEffect, useState } from "react";
import { createMetadata } from '../../configs/metadata/createMetadata';
import { UnsubscribeDetails } from '../event/DynamicEventHandlerExample';
import { Category, generateOrVerifySnapshotId } from '../libraries/categories/generateCategoryProperties';
import { Content } from "../models/content/AddContent";
import { displayToast } from '../models/display/ShowToast';
import { RealtimeDataItem } from "../models/realtime/RealtimeData";
import { DataStoreMethods, DataStoreWithSnapshotMethods } from "../projects/DataAnalysisPhase/DataProcessing/ DataStoreMethods";
import { DataStore, useDataStore } from "../projects/DataAnalysisPhase/DataProcessing/DataStore";
import {
  Snapshot,
  SnapshotsArray
} from "../snapshots/LocalStorageSnapshotStore";
import { SnapshotOperation, SnapshotOperationType } from "../snapshots/SnapshotActions";
import { BaseSnapshotEvents, SnapshotEvents } from '../snapshots/SnapshotEvents';
import SnapshotStore from "../snapshots/SnapshotStore";
import { SnapshotStoreConfig } from "../snapshots/SnapshotStoreConfig";
import { InitializedDelegate, SnapshotStoreOptions } from '../snapshots/SnapshotStoreOptions';
import { handleSnapshotOperation } from '../snapshots/handleSnapshotOperation';
import handleSnapshotStoreOperation from '../snapshots/handleSnapshotStoreOperation';
import { subscribeToSnapshot, subscribeToSnapshots } from "../snapshots/snapshotHandlers";
import CalendarManagerStoreClass from "../state/stores/CalendarManagerStore";
import { SubscriberCallbackType, Subscription } from '../subscriptions/Subscription';
import { addToSnapshotList, isSnapshotStoreConfig, isSnapshotWithCriteria } from '../utils/snapshotUtils';
import { LibraryAsyncHook } from "./useAsyncHookLinker";

const { notify } = useNotification();


interface CombinedEvents<
  T extends  BaseData<any>,
  K extends T = T,
  Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>
>
  extends BaseSnapshotEvents<T, K>, SnapshotEvents<T, K> {
  subscribers: SubscriberCollection<T, K>,
  trigger: (
    event: string | CombinedEvents<T, K> | SnapshotEvents<T, K>,
    snapshot: Snapshot<T, K>,
    eventDate: Date,
    snapshotId: string,
    subscribers: SubscriberCollection<T, K>,
    type: string,
    snapshotData: SnapshotData<T, K>
  ) => void;

  onSnapshotAdded: (event: string, snapshot: Snapshot<T, K>, snapshotId: string, subscribers: SubscriberCollection<T, K>) => void;
  onSnapshotRemoved: (
    event: string,
    snapshot: Snapshot<T, K>,
    snapshotId: string,
    subscribers: SubscriberCollection<T, K>,
    type: string,
    snapshotStore: SnapshotStore<T, K>,
    dataItems: RealtimeDataItem[],
    criteria: SnapshotWithCriteria<T, K>,
    category: Category,
    snapshotData: SnapshotData<T, K>
  ) => void;
  onSnapshotUpdated: (
    event: string,
    snapshotId: string,
    snapshot: Snapshot<T, K>,
    data: Map<string, Snapshot<T, K>>,
    events: Record<string, CalendarManagerStoreClass<T, K>[]>,
    snapshotStore: SnapshotStore<T, K>,
    dataItems: RealtimeDataItem[],
    newData: Snapshot<T, K>,
    payload: UpdateSnapshotPayload<T>,
    store: SnapshotStore<any, K>
  ) => void;
  removeSubscriber: (event: string, snapshotId: string) => void;
  onError: (
    event: string,
    error: Error,
    snapshot: Snapshot<T, K>,
    snapshotId: string,
    snapshotStore: SnapshotStore<T, K>,
    dataItems: RealtimeDataItem[],
    criteria: SnapshotWithCriteria<T, K>,
    category: Category
  ) => void;
  once: (event: string, callback: (snapshot: Snapshot<T, K>) => void) => void;
  addRecord: (
    event: string, 
    record: CalendarManagerStoreClass<T, K>, 
    callback: (snapshot: CalendarManagerStoreClass<T, K>) => void
  ) => void;
  unsubscribe: (
    snapshotId: number,
    unsubscribeDetails: UnsubscribeDetails,
    callback: SubscriberCallbackType<T, K> | null
  ) => void;
}

interface SnapshotManager<
  T extends  BaseData<any>, 
  K extends T = T,
  Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>,
  ExcludedFields extends keyof T = never
  > {
  initSnapshot: (
    snapshotConfig: SnapshotStoreConfig<T, K>[],
    snapshotData: SnapshotData<T, K>
  ) => Promise<void>;
  
  storeIds: number[],
  snapshotId: string,
  category: symbol | string | Category | undefined,
  snapshot: Snapshot<T, K, Meta, ExcludedFields>;
  timestamp: string | number | Date | undefined,
  type: string,
  event: Event,
  id: number,
  snapshotStore: SnapshotStore<T, K>,
  data:  BaseData<any>
  state: SnapshotStore<T, K>[];

  updateSnapshots: (snapshots: Snapshots<T, K>) => void;
}

// Define the async hook configuration
const asyncHook: LibraryAsyncHook = {
  enable: () => { },
  disable: () => { },
  condition: () => Promise.resolve(true),
  asyncEffect: async () => {
    // Implementation logic for async effect
    console.log("Async effect ran!");

    // Return a cleanup function
    return () => {
      console.log("Async effect cleaned up!");
    };
  },
  idleTimeoutId: null, // Initialize idleTimeoutId
  startIdleTimeout: (timeoutDuration: number, onTimeout: () => void) => {
    // Implementation logic for starting idle timeout
    const timeoutId = setTimeout(onTimeout, timeoutDuration);
    if (timeoutId !== null) {
      asyncHook.idleTimeoutId = timeoutId;
    }
  },
  isActive: false,
};

const snapshotMethods = useDataStore().snapshotMethods

const snapshotStoreConfig = useDataStore().snapshotStoreConfig



export const createBaseData = (overrides: Partial<BaseData> = {}): BaseData => ({
  id: 'default-id',
  name: 'Default Name',
  metadata: {},
  ...overrides,
});

const completeDataStoreMethods:  <T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(
  snapshotStoreConfig: SnapshotStoreConfig<T, K>[],
  dataStoreMethods: Partial<DataStoreWithSnapshotMethods<T, K>>
) => Partial<DataStoreWithSnapshotMethods<T, K>> = (
  snapshotStoreConfig,
  dataStoreMethods
) => {
    // Implementation goes here
    return {}
  }

// Function to convert Snapshot<T, K> to Content
// Updated function to convert Snapshot<T, K> to Content
const convertSnapshotToContent =  <T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(
  snapshot: Snapshot<T, K>
): Content<T, K> => {
  // Convert snapshot.data to match SnapshotWithCriteria<T, BaseData>
  let data: SnapshotWithCriteria<T, K> | CustomSnapshotData<T> | null | undefined;

  if (snapshot.data instanceof Map) {
    data = convertMapToCustomSnapshotData(snapshot.data);
  } else if (isSnapshotWithCriteria(snapshot.data)) {
    // Ensure snapshot.data is of type SnapshotWithCriteria<T, BaseData>
    data = snapshot.data as unknown as SnapshotWithCriteria<T, K>;
  } else {
    // Fallback: Handle other cases or convert data if necessary
    data = snapshot.data as CustomSnapshotData<T> | null | undefined;
  }

  return {
    id: snapshot.id ?? "default-id",
    title: snapshot.title ?? "default-title",
    description: snapshot.description ?? "default-description",
    subscriberId: snapshot.subscriberId ?? "default-subscriber-id",
    category: snapshot.category,
    timestamp: snapshot.timestamp ?? new Date(),
    categoryProperties: snapshot.categoryProperties ?? "default-category-properties",
    length: 0,
    data: data,
    items: snapshot.items ?? [],
    contentItems: snapshot.contentItems ?? []
  };
};
// Example conversion function from Map to CustomSnapshotData
const convertMapToCustomSnapshotData =  <T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(map: Map<string, Snapshot<T, K>>

): CustomSnapshotData<T> => {
  // Implement the logic to convert a Map to CustomSnapshotData
  // For example:
  const customData: CustomSnapshotData<T> = {
    id: "custom_map-id", // or some appropriate value
    timestamp: new Date().getTime()
    // other required properties
  };
  return customData;
};



const createSnapshotStore =  <T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(
  snapshotConfig: SnapshotStoreConfig<T, K>,
  snapshotData: SnapshotData<T, K>
): ConfigurableSnapshotStore<T, K> => {
  // Step 1: Validate input parameters
  if (!snapshotConfig || !snapshotData) {
    throw new Error("Invalid snapshotConfig or snapshotData provided");
  }

  // Step 2: Initialize the Snapshot Store
  const initializedStore: SnapshotStore<T, K> = {
    ...snapshotData, // Copy the existing snapshot data
    id: snapshotConfig.id || snapshotData.id, // Use provided ID or default to the data's ID
    criteria: snapshotConfig.criteria || snapshotData.criteria, // Apply criteria from config if available
    data: snapshotConfig.data || snapshotData.data, // Use the provided data or default to existing data
    createdAt: snapshotConfig.createdAt || new Date(), // Set the creation date
    updatedAt: snapshotConfig.updatedAt || new Date(), // Set the update date
    category: snapshotConfig.category || snapshotData.category, // Use category from config if provided
    config: snapshotConfig, // Store the full config in the snapshot store
    restoreSnapshot: snapshotConfig.restoreSnapshot || snapshotData.restoreSnapshot,
    configs: snapshotConfig.configs || snapshotData.configs,
    snapshotStores: snapshotConfig.snapshotStores || snapshotData.snapshotStores,
    name: snapshotConfig.name || snapshotData.name,
    schema: snapshotConfig.schema || snapshotData.schema,
    snapshotItems: snapshotConfig.snapshotItems || snapshotData.snapshotItems,
    nestedStores: snapshotConfig.nestedStores || snapshotData.nestedStores,
    snapshotIds: snapshotConfig.snapshotIds || snapshotData.snapshotIds,
    dataStoreMethods: snapshotConfig.dataStoreMethods || snapshotData.dataStoreMethods,
    delegate: snapshotConfig.delegate || snapshotData.delegate,
    getConfig: snapshotConfig.getConfig || snapshotData.getConfig,
    setConfig: snapshotConfig.setConfig || snapshotData.setConfig,
  };

  // Step 3: Apply any necessary configurations or transformations
  if (snapshotConfig.transform) {
    initializedStore.data = snapshotConfig.transform(snapshotData.data);
  }

  if (snapshotConfig.filter) {
    initializedStore.data = initializedStore.data.filter(snapshotConfig.filter);
  }

  if (snapshotConfig.sort) {
    initializedStore.data = initializedStore.data.sort(snapshotConfig.sort);
  }

  // Step 4: Return the initialized snapshot store
  return initializedStore;
};



const createSnapshotConfig = <
  T extends BaseData<any>,
  K extends T = T, 
  Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>,
  ExcludedFields extends keyof T = never
  >(
  snapshotStore: SnapshotStore<T, K>,
  snapshotContent?: Snapshot<T, K>,
  storeOptions?: SnapshotStoreOptions<T, K>
): SnapshotStoreConfig<T, K> => {
  const content = snapshotContent ? convertSnapshotToContent(snapshotContent) : undefined;

  if(storeOptions === undefined) {
    throw new Error("storeProps is undefined");
  }
  const { store, snapshotId, data, events, dataItems, newData, payload, storeRef, callback } = storeOptions
  return {

    snapshotStore: (
      store: "",
      snapshotId: "",
      data: "",
      events: "",
      dataItems: "",
      newData: "",
      payload: "",
      storeRef: "",
      callback: ""
    ) => {
      // Validate inputs
      if (!store || !snapshotId) {
        throw new Error("Store or snapshotId is missing.");
      }

      // Log incoming parameters for debugging
      console.log("snapshotId:", snapshotId);
      console.log("data:", data);
      console.log("events:", events);
      console.log("dataItems:", dataItems);
      console.log("newData:", newData);
      console.log("payload:", payload);

      // If a new snapshot is being added, you may want to check if it already exists
      if (data.has(snapshotId)) {
        // If it exists, update the existing snapshot
        const existingSnapshot = data.get(snapshotId);
        if (existingSnapshot) {
          // Merge new data into the existing snapshot
          const updatedSnapshot = {
            ...existingSnapshot,
            ...newData,
            // You can also include any other merging logic here
          };

          // Store the updated snapshot back into the data map
          data.set(snapshotId, updatedSnapshot);
          console.log(`Updated snapshot with ID ${snapshotId}:`, updatedSnapshot);
        }
      } else {
        // If the snapshot does not exist, create a new snapshot
        const newSnapshot = {
          ...newData,
          id: snapshotId,
          // Include any additional properties necessary for the new snapshot
        };

        // Add the new snapshot to the data map
        data.set(snapshotId, newSnapshot);
        console.log(`Created new snapshot with ID ${snapshotId}:`, newSnapshot);
      }

      // If events are provided, you can process them accordingly
      if (events) {
        const eventId = fetchEventId(events);
        // Process each event
        for (const eventKey in events) {
          const eventHandlers = events[eventKey];
          // Call each event handler with the snapshot
          eventHandlers.forEach(handler => {
            if (typeof handler === 'function') {
              handler(eventId, newData);
            } else if (typeof handler.handleEvent === 'function') {
              handler.handleEvent(eventId, newData); // Use the appropriate method
            }
          });
        }
      }

      // If dataItems are provided, you can update the store based on those items
      if (dataItems) {
        dataItems.forEach(item => {
          // Implement your logic for handling each RealtimeDataItem
          console.log("Processing data item:", item);
          // For example, you might want to update the snapshot based on the item
        });
      }

      // Call the callback function with the store
      if (callback) {
        callback(store);
      }
    },
    snapshotId: "initial-id",
    snapshotCategory: "initial-category",
    snapshotSubscriberId: "initial-subscriber",
    timestamp: new Date(),
    snapshotContent: content,
    id: null,
    data: {} as T,
    initialState: null,
    handleSnapshot: (
      id: string | number,
      snapshotId: string  | null,
      snapshot: Snapshot<T, K> | null,
      snapshotData: T,
      category: symbol | string | Category | undefined,
      callback: (snapshot: T) => void,
      snapshots: SnapshotsArray<any>,
      type: string,
      event: Event,
      snapshotContainer?: T,
      snapshotStoreConfig?: SnapshotStoreConfig<T, K, StructuredMetadata<T, K>, never>  | null, // Change here
    ): Promise<Snapshot<T, K> | null> => {

      let processedSnapshot: T | null = null;

      // Dynamically create metadata for the current area
      const metaData = createMetadata<T, K, Meta, ExcludeKeys<T, K>>({
        area: type === 'create' ? 'dashboard' : 'profile',
        tags: [],
        overrides: {
          updatedAt: new Date(),
          updatedBy: 'event-handler',
        },
      });
    
      if (!snapshotStoreConfig) {
        throw new Error('Snapshot store configuration is missing.');
      }
    
      try {
        if (snapshot) {
          const transformedSnapshot = processSnapshot<T, K>({ ...snapshot, ...snapshotData });
    
          callback(transformedSnapshot);
    
          return Promise.resolve(
            createSnapshotInstance(
              snapshotData,
              metaData, // Use dynamic metadata
              snapshotId,
              transformedSnapshot,
              category,
              snapshotStore,
              snapshotStoreConfig
            )
          );
        } else {
          // Handle snapshotContainer or other logic here
        }
      } catch (error) {
        console.error(`Error handling snapshot: ${error}`);
        return Promise.reject(null);
      }
      return Promise.resolve(null);
    },

    state: null,
    snapshots: [],
    subscribers: [],
    category: "default-category",
    getSnapshotId: async () => "default-id",
    snapshot: async (
      id: string | number | undefined,
      snapshotId: string | null,
      snapshotData: SnapshotData<T, K> | null, // Change here
      category: symbol | string | Category | undefined,
      categoryProperties: CategoryProperties | undefined,
      callback: (snapshot: Snapshot<T, K> | null) => void,
      dataStore: DataStore<T, K>,
      dataStoreMethods: DataStoreMethods<T, K>,
      // dataStoreSnapshotMethods: DataStoreWithSnapshotMethods<T, K>,
      metadata: UnifiedMetaDataOptions<T, K, Meta, ExcludedFields>,
      subscriberId: string, // Add subscriberId here
      endpointCategory: string | number,// Add endpointCategory here
      storeProps: SnapshotStoreProps<T, K>,
      snapshotConfigData: SnapshotConfig<T, K>,
      snapshotStoreConfigData?: SnapshotStoreConfig<T, K>,
      snapshotContainer?: SnapshotContainer<T, K>,
    ): Promise<{ snapshot: Snapshot<T, K> | null, snapshotData: SnapshotData<T, K>; }> => {
      const { storeId, name, version, options, snapshots, expirationDate, schema,
        payload, 
      } = storeProps
      
      // Check if snapshotData is not null
      if (snapshotData !== null) {
        
        // Generate or verify the snapshot ID
        id = generateOrVerifySnapshotId<T, K>(id, snapshotData, category);

        // Initialize or reuse the snapshot container
        const snapshot: Snapshot<T, K> | null = snapshotStoreConfigData?.createSnapshot?.(
          id,
          snapshotData,
          category,
          categoryProperties,
          callback
        ) ?? null;
    
        if (snapshot) {

          
          // Callback with the created snapshot
          callback(snapshot);
    
          // Extract the snapshot ID and fetch the store ID
          const snapshotId: string | number | undefined = snapshot?.store?.snapshotId ?? undefined;
          // /const storeId = await snapshotApi.getSnapshotStoreId(String(snapshotId));
    
          // Handle default config
          const defaultConfig: SnapshotStoreConfig<T, K> = {} as SnapshotStoreConfig<T, K>;
          const config: SnapshotStoreConfig<T, K> = snapshotStoreConfigData || defaultConfig;
    
          // Define the snapshot operation
          const operation: SnapshotOperation<T, K> = {
            operationType: SnapshotOperationType.FindSnapshot
          };
    
          // Initialize the SnapshotStore
          const newSnapshotStore = new SnapshotStore<T, K>({storeId, name, version, schema, options, category, config, operation,snapshots, expirationDate, payload, callback, storeProps, endpointCategory});
    
          // Callback again with the snapshot
          callback(snapshot);
    
          return {
            snapshot: snapshot,
            snapshotData: snapshotData
          };
        } else {
          console.error('Failed to create snapshot');
          return { snapshot: null, snapshotData: snapshotData };
        }
      }
    
      return { snapshot: null, snapshotData: {} as SnapshotData<T, K> };
    },    
    
    createSnapshot: () => ({
      id: "default-id",
      data: new Map<string, Snapshot<T, K>>(),
      timestamp: new Date(),
      category: "default-category",
      subscriberId: "default-subscriber-id",
      meta: {} as Map<string, Snapshot<T, K>>,
      events: {} as CombinedEvents<T, K>
    })
  }
};


export const useSnapshotManager = async <T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(
  initialStoreId: number
) => {
  const [snapshotManager, setSnapshotManager] = useState<SnapshotStoreConfig<T, K> | null>(null);
  const [snapshotStore, setSnapshotStore] = useState<SnapshotStore<T, K> | null>(null);
  const { storeId, name, version, options, snapshots, expirationDate, schema,
    payload, 
  } = storeProps

  useEffect(() => {
    const initSnapshotManager = async () => {
      const options: SnapshotStoreOptions<T, K> = {
        id: "snapshot-store-123",
        storeId: initialStoreId,
        baseURL: "https://api.example.com/snapshots",
        enabled: true,
        maxRetries: 3,
        retryDelay: 5000, // 5 seconds
        maxAge: "1d", // 1 day
        staleWhileRevalidate: 1800000, // 30 minutes 
        cacheKey: "snapshot_cache_key",
        records: [], // Fetch up to 10 records
        criteria: {},
        callbacks: {},
        getDelegate: [],
        initSnapshot: {},
        createSnapshot: createSnapshotInstance,
        createSnapshotStore: (
          id: string, 
          storeId: number, 
          snapshotId: string, 
          snapshotStoreData: SnapshotStore<T, K>[], 
          category: Category, 
          categoryProperties: CategoryProperties | undefined, 
          callback?: (snapshotStore: SnapshotStore<T, K>) => void, 
          snapshotDataConfig?: SnapshotStoreConfig<T, K>[] | undefined
      ) => {
          const snapshotConfig: SnapshotStoreConfig<T, K> = {
            id: `snapshot-config-${storeId}`, // Example ID generation
            criteria: {}, // Populate with your criteria as needed
            data: {}, // Add any initial data if needed
            createdAt: new Date(),
            updatedAt: new Date(),
            category,
            // ... Add other properties as necessary
          };
  
          const snapshotData: SnapshotData<T, K> = {}; // Define snapshotData as needed
  
          // Call createSnapshotStore function with the defined parameters
          const initializedStore = createSnapshotStore(snapshotConfig, snapshotData);
  
          // Optional: If a callback is provided, invoke it with the initialized store
          if (callback) {
            callback(initializedStore);
          }
  
          return initializedStore; // Return the initialized store
        },
    
        data: new Map<string, Snapshot<T, K>>(),
        initialState: null,
        snapshotId: "initial-snapshot-id",
        category: {
          name: "initial-category",
          description: "This is the initial category for the snapshot store.",
          icon: "folder",
          color: "#ff5733",
          iconColor: "#ffffff",
          isActive: true,
          isPublic: false,
          isSystem: false,
          isDefault: true,
          isHidden: false,
          isHiddenInList: false,
          UserInterface: [],
          DataVisualization: [],
          Forms: undefined,
          Analysis: [],
          Communication: [],
          TaskManagement: [],
          Crypto: [],
          brandName: "Example Brand",
          brandLogo: "https://example.com/logo.png",
          brandColor: "#0000ff",
          brandMessage: "Empowering your data management.",
        },
        date: new Date(),
        type: "initial-type",
        snapshotConfig: [],
        subscribeToSnapshots,
        subscribeToSnapshot,
        delegate: {} as  InitializedDelegate<T, K>,
        dataStoreMethods: {} as DataStoreWithSnapshotMethods<T, K>,
        snapshotMethods: [],
        eventRecords: null,
        snapshotStoreConfig: undefined,
        unsubscribeToSnapshots: function() {
          throw new Error("Function not implemented.");
        },
        unsubscribeToSnapshot: function() {
          throw new Error("Function not implemented.");
        },
        getCategory: async function (
          snapshotId: string,
          snapshot: Snapshot<T, K>,
          type: string,
          event: Event,
          snapshotConfig: SnapshotConfig<T, K>,
          additionalHeaders?: Record<string, string>
        ): Promise<{ categoryProperties?: CategoryProperties; snapshots: Snapshot<T, K>[] }> {
          try {
            // Check if category is available
            const category = snapshot.category;
        
            if (!category) {
              throw new Error(`No category found for snapshot ID: ${snapshotId}`);
            }
        
            // Fetch category properties using a reusable method if available
            let categoryProperties: CategoryProperties | undefined;
            if (typeof category === "string") {
              categoryProperties = await this.fetchCategoryProperties(category, snapshotConfig, additionalHeaders);
            } else if (typeof category === "object") {
              categoryProperties = category as CategoryProperties;
            }
        
            // Retrieve related snapshots using a reusable method if applicable
            const snapshots: Snapshot<T, K>[] = await getCategoryProperties(
              snapshotConfig,
              categoryProperties,
              additionalHeaders
            );
        
            // Return the resolved promise content
            return { categoryProperties, snapshots };
          } catch (error) {
            console.error("Error in getCategory:", error);
            return { snapshots: [] }; // Fallback for errors
          }
        },
        


        getSnapshotConfig: function (
          id: string | number,
          snapshotId: string | null,
          criteria: CriteriaType,
          category: symbol | string | Category | undefined,
          categoryProperties: CategoryProperties | undefined,
          subscriberId: string | undefined,
          delegate: SnapshotWithCriteria<T, K>[],
          snapshotData: SnapshotData<T, K>,
          snapshot: (
            id: string | number | undefined,
            snapshotId: string | null,
            snapshotData: SnapshotData<T, K>,
            category: symbol | string | Category | undefined,
            categoryProperties: CategoryProperties | undefined,
            callback: (snapshotStore: SnapshotStore<T, K> | null) => void,
            dataStore: DataStore<T, K>,
            dataStoreMethods: DataStoreMethods<T, K>,
            // dataStoreSnapshotMethods: DataStoreWithSnapshotMethods<T, K>,
            metadata: UnifiedMetaDataOptions<T, K, Meta, ExcludedFields<T, K>>,
            subscriberId: string, // Add subscriberId here
            endpointCategory: string | number ,// Add endpointCategory here
            storeProps: SnapshotStoreProps<T, K>,
            snapshotConfigData: SnapshotConfig<T, K>,
            subscription: Subscription<T, K>,
            snapshotStoreConfigData?: SnapshotStoreConfig<T, K>,
            snapshotContainer?: SnapshotStore<T, K> | Snapshot<T, K> | null,
          ) => Promise<Snapshot<T, K>>,
          data: Map<string, Snapshot<T, K>>,
          events: Record<string, CalendarManagerStoreClass<T, K>[]>, // Added prop
          dataItems: RealtimeDataItem[], // Added prop
          newData: Snapshot<T, K>, // Added prop
          payload: ConfigureSnapshotStorePayload<T, K>, // Added prop
          store: SnapshotStore<T, K>, // Added prop
          callback: (snapshot: SnapshotStore<T, K>) => void, // Added prop
          storeProps: SnapshotStoreProps<T, K>,
          endpointCategory: string | number,
          snapshotContainer: Promise<SnapshotContainer<T, K>>,
        ) {

          const snapshotStoreConfigData = snapshotApi.getSnapshotConfig(
            id,
            snapshotId,
            criteria,
            category,
            categoryProperties,
            subscriberId,
            delegate,
            snapshotData,
            snapshot,
            data,
            events,
            dataItems,
            newData,
            payload,
            store,
            callback,
            storeProps,
            endpointCategory,
            snapshotContainer,
          );
          // Use the type guard to determine whether snapshotStoreConfigData is of the correct type
          if (snapshotStoreConfigData && isSnapshotStoreConfig(snapshotStoreConfigData)) {
            const snapshotConfig = createSnapshotConfig(snapshotStoreConfigData); // Works with SnapshotConfig
            return snapshotConfig;
          } else {
            // Handle the case where the config is not of type SnapshotConfig
            console.error('Invalid config type');
          }
        },
        handleSnapshotOperation,
        handleSnapshotStoreOperation,
        displayToast,
        addToSnapshotList,
        simulatedDataSource: undefined
      };

      const operation: SnapshotOperation<T, K> = {
        operationType: SnapshotOperationType.FindSnapshot
      };

      const storeId = await getStoreId(initialStoreId);

      const { category, config, expirationDate, payload, callback, endpointCategory} = storeProps
      const snapshotStore = new SnapshotStore<T, K>({storeId, name, version, schema, options, category, config, operation, expirationDate, payload, callback, storeProps, endpointCategory });
      const snapshotConfig = createSnapshotConfig(snapshotStore);

      setSnapshotManager(snapshotConfig);
      setSnapshotStore(snapshotStore);
    };

    initSnapshotManager();
  }, []);
  return { snapshotManager, snapshotStore };
};




export { completeDataStoreMethods, convertMapToCustomSnapshotData, convertSnapshotToContent, createSnapshotStore };
export type { CombinedEvents, SnapshotManager, SnapshotStoreOptions };





// //  access state with useSnapshotManager
// // Example of accessing state with useSnapshotManager
// const ExampleComponent: React.FC = () => {
  // const { metadata, updateMetadata } = useMeta(createMeta({ description: 'Example structured metadata' }));
  // const { options, updateOptions } = useMetadata(createMetadata({ area: 'Example unified metadata' }));

  // // Example updates
  // const handleMetadataUpdate = () => updateMetadata({ isActive: true });
  // const handleOptionsUpdate = () => updateOptions({ tags: ['example', 'metadata'] });

//   const snapshotManager =  useSnapshotManager()

//   // Access specific properties from snapshotManager
//   const { delegate, snapshotStore,  } =  snapshotManager

//   // Use delegate methods
//   const handleSomeAction = () => {
//     delegate.someMethod()
//   }

//   // Access snapshot store methods
//   const getCurrentSnapshot = () => {
//     return snapshotStore.getCurrentSnapshot()
//   }

//   // Render component using the accessed state
//   return (
//     <div>
//       {/* Use the accessed state in your component */}
      // <p>Structured Metadata: {JSON.stringify(metadata)}</p>
      // <p>Unified Metadata Options: {JSON.stringify(options)}</p>
      // <button onClick={handleMetadataUpdate}>Update Metadata</button>
      // <button onClick={handleOptionsUpdate}>Update Options</button>
//     </div>
//   )
// }

// export default ExampleComponent



