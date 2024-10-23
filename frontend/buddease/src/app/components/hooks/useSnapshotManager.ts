// useSnapshotManager.ts
import { getStoreId } from '@/app/api/ApiData';
import * as snapshotApi from '@/app/api/SnapshotApi';
import {
    useNotification
} from "@/app/components/support/NotificationContext";
import { UnifiedMetaDataOptions } from '@/app/configs/database/MetaDataOptions';
import { CategoryProperties } from "@/app/pages/personas/ScenarioBuilder";
import { CriteriaType } from '@/app/pages/searchs/CriteriaType';
import { useEffect, useState } from "react";
import { Category, generateOrVerifySnapshotId } from '../libraries/categories/generateCategoryProperties';
import { Content } from "../models/content/AddContent";
import { BaseData, Data } from "../models/data/Data";
import { displayToast } from '../models/display/ShowToast';
import { DataStoreMethods, DataStoreWithSnapshotMethods } from "../projects/DataAnalysisPhase/DataProcessing/ DataStoreMethods";
import { DataStore, useDataStore } from "../projects/DataAnalysisPhase/DataProcessing/DataStore";
import { createSnapshotInstance, CustomSnapshotData, processSnapshot, SnapshotConfig, SnapshotContainer, SnapshotData, SnapshotStoreProps, SnapshotWithCriteria, SubscriberCollection } from '../snapshots';
import {
    Snapshot,
    SnapshotsArray
} from "../snapshots/LocalStorageSnapshotStore";
import { SnapshotOperation, SnapshotOperationType } from "../snapshots/SnapshotActions";
import { BaseSnapshotEvents, SnapshotEvents } from '../snapshots/SnapshotEvents';
import SnapshotStore from "../snapshots/SnapshotStore";
import { SnapshotStoreConfig } from "../snapshots/SnapshotStoreConfig";
import { handleSnapshotOperation } from '../snapshots/handleSnapshotOperation';
import handleSnapshotStoreOperation from '../snapshots/handleSnapshotStoreOperation';
import { subscribeToSnapshot, subscribeToSnapshots } from "../snapshots/snapshotHandlers";
import { addToSnapshotList, isSnapshotStoreConfig, isSnapshotWithCriteria } from '../utils/snapshotUtils';
import { SnapshotStoreOptions } from './SnapshotStoreOptions';
import { LibraryAsyncHook } from "./useAsyncHookLinker";
import { Subscription } from '../subscriptions/Subscription';
const { notify } = useNotification();



interface CombinedEvents<
  T extends Data,
  Meta extends UnifiedMetaDataOptions,
  K extends Data = T
>
  extends BaseSnapshotEvents<T, Meta, K> {
  subscribers: SubscriberCollection<T, Meta, K>,
  trigger: (
    event: string | CombinedEvents<T, Meta, K> | SnapshotEvents<T, Meta, K>,
    snapshot: Snapshot<T, Meta, K>,
    snapshotId: string,
    subscribers: SubscriberCollection<T, Meta, K>,
    type: string,
    snapshotData: SnapshotData<T, Meta, K>
  ) => void;
}


interface SnapshotManager<T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T> {
  initSnapshot: (
    snapshotConfig: SnapshotStoreConfig<T, Meta, K>[],
    snapshotData: SnapshotData<T, Meta, K>
  ) => Promise<void>;
  storeIds: number[],
  snapshotId: string,
  category: symbol | string | Category | undefined,
  snapshot: Snapshot<T, Meta, K>,
  timestamp: string | number | Date | undefined,
  type: string,
  event: Event,
  id: number,
  snapshotStore: SnapshotStore<T, Meta, K>,
  data: Data
  state: SnapshotStore<T, Meta, K>[];
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


const completeDataStoreMethods:  <T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T>(
  snapshotStoreConfig: SnapshotStoreConfig<T, Meta, K>[],
  dataStoreMethods: Partial<DataStoreWithSnapshotMethods<T, Meta, K>>
) => Partial<DataStoreWithSnapshotMethods<T, Meta, K>> = (
  snapshotStoreConfig,
  dataStoreMethods
) => {
    // Implementation goes here
    return {}
  }

// Function to convert Snapshot<T, Meta, K> to Content
// Updated function to convert Snapshot<T, Meta, K> to Content
const convertSnapshotToContent =  <T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T>(
  snapshot: Snapshot<T, Meta, K>
): Content<T, Meta, K> => {
  // Convert snapshot.data to match SnapshotWithCriteria<T, Meta, BaseData>
  let data: SnapshotWithCriteria<T, Meta, Data> | CustomSnapshotData | null | undefined;

  if (snapshot.data instanceof Map) {
    data = convertMapToCustomSnapshotData(snapshot.data);
  } else if (isSnapshotWithCriteria(snapshot.data)) {
    // Ensure snapshot.data is of type SnapshotWithCriteria<T, Meta, BaseData>
    data = snapshot.data as unknown as SnapshotWithCriteria<T, Meta, BaseData>;
  } else {
    // Fallback: Handle other cases or convert data if necessary
    data = snapshot.data as CustomSnapshotData | null | undefined;
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
    items: snapshot.items ?? []
  };
};
// Example conversion function from Map to CustomSnapshotData
const convertMapToCustomSnapshotData =  <T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T>(map: Map<string, Snapshot<T, Meta, K>>

): CustomSnapshotData => {
  // Implement the logic to convert a Map to CustomSnapshotData
  // For example:
  const customData: CustomSnapshotData = {
    id: "custom_map-id", // or some appropriate value
    timestamp: new Date().getTime()
    // other required properties
  };
  return customData;
};



const createSnapshotStore =  <T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T>(
  snapshotConfig: SnapshotStoreConfig<T, Meta, K>,
  snapshotData: SnapshotData<T, Meta, K>
): SnapshotStore<T, Meta, K> => {
  // Step 1: Validate input parameters
  if (!snapshotConfig || !snapshotData) {
    throw new Error("Invalid snapshotConfig or snapshotData provided");
  }

  // Step 2: Initialize the Snapshot Store
  const initializedStore: SnapshotStore<T, Meta, K> = {
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


const createSnapshotConfig = <T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T>(
  snapshotStore: SnapshotStore<T, Meta, K>,
  snapshotContent?: Snapshot<T, Meta, K>
): SnapshotStoreConfig<T, Meta, K> => {
  const content = snapshotContent ? convertSnapshotToContent(snapshotContent) : undefined;

  return {
    snapshotStore: (store, snapshotId, data, events, dataItems, newData, payload, storeRef, callback) => {
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
      snapshot: Snapshot<T, Meta, K> | null,
      snapshotData: T,
      category: symbol | string | Category | undefined,
      callback: (snapshot: T) => void,
      snapshots: SnapshotsArray<any>,
      type: string,
      event: Event,
      snapshotContainer?: T,
      snapshotStoreConfig?: SnapshotStoreConfig<T, Meta, K> | null, // Change here
    ): Promise<Snapshot<T, Meta, K> | null> => {

      let processedSnapshot: T | null = null; // Declare here

      if (snapshotStoreConfig == undefined) {
        throw new Error("Snapshot store configuration is missing.")
       }
      try {
        if (snapshot) {
          console.log(`Handling snapshot with ID: ${snapshotId}`);

            // Use processSnapshot to process the snapshot
          const transformedSnapshot = processSnapshot({ ...snapshot, ...snapshotData });

          callback(transformedSnapshot);

      
          return Promise.resolve(
            createSnapshotInstance(snapshotId, transformedSnapshot, category, snapshotStore, snapshotStoreConfig)
          );
        } else {
          console.log(`No snapshot to handle for ID: ${snapshotId}`);

          if (snapshotContainer) {
            console.log(`Using snapshot container with ID: ${snapshotContainer.id}`);

            const processedContainer = { ...snapshotContainer, ...snapshotData };

            callback(processedContainer);

            if (!processedSnapshot) {
              processedSnapshot = { ...snapshotContainer, ...snapshotData };
              return Promise.resolve(createSnapshotInstance(snapshotId, processedSnapshot, category, snapshotStore, snapshotStoreConfig));
            }
            return Promise.resolve(createSnapshotInstance(snapshotId, processedSnapshot, category, snapshotStore, snapshotStoreConfig));
          } else {
            console.log(`No snapshot container available for ID: ${snapshotId}`);

            return Promise.resolve(null);
          }
        }
      } catch (error) {
        console.error(`Error handling snapshot with ID: ${snapshotId}`, error);
        return Promise.reject(null);
      }
    },

    state: null,
    snapshots: [],
    subscribers: [],
    category: "default-category",
    getSnapshotId: async () => "default-id",
    snapshot: async (
      id: string | number | undefined,
      snapshotId: string | null,
      snapshotData: SnapshotData<T, Meta, K> | null, // Change here
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
      snapshotConfigData: SnapshotConfig<T, Meta, K>,
      snapshotStoreConfigData?: SnapshotStoreConfig<T, Meta, K>,
      snapshotContainer?: SnapshotContainer<T, Meta, K>,
    ): Promise<{ snapshot: Snapshot<T, Meta, K> | null, snapshotData: SnapshotData<T, Meta, K>; }> => {
    
      // Check if snapshotData is not null
      if (snapshotData !== null) {
        
        // Generate or verify the snapshot ID
        id = generateOrVerifySnapshotId<T, Meta, K>(id, snapshotData, category);

        // Initialize or reuse the snapshot container
        const snapshot: Snapshot<T, Meta, K> | null = snapshotStoreConfigData?.createSnapshot?.(
          id,
          snapshotData,
          category,
          categoryProperties,
          callback
        ) ?? null;
    
        if (snapshot) {

          const { storeId, name, version, options, snapshots, expirationDate, schema,
            payload, callback, endpointCategory
          } = storeProps
          // Callback with the created snapshot
          callback(snapshot);
    
          // Extract the snapshot ID and fetch the store ID
          const snapshotId: string | number | undefined = snapshot?.store?.snapshotId ?? undefined;
          // /const storeId = await snapshotApi.getSnapshotStoreId(String(snapshotId));
    
          // Handle default config
          const defaultConfig: SnapshotStoreConfig<T, Meta, K> = {} as SnapshotStoreConfig<T, Meta, K>;
          const config: SnapshotStoreConfig<T, Meta, K> = snapshotStoreConfigData || defaultConfig;
    
          // Define the snapshot operation
          const operation: SnapshotOperation = {
            operationType: SnapshotOperationType.FindSnapshot
          };
    
          // Initialize the SnapshotStore
          const newSnapshotStore = new SnapshotStore<T, Meta, K>({storeId, name, version, schema, options, category, config, operation,snapshots, expirationDate, payload, callback, storeProps, endpointCategory});
    
          // Callback again with the snapshot
          callback(snapshot);
    
          return {
            snapshot: snapshot,
          };
        } else {
          console.error('Failed to create snapshot');
          return { snapshot: null };
        }
      }
    
      return { snapshot: null }; // If snapshotData is null
    },    
    
    createSnapshot: () => ({
      id: "default-id",
      data: new Map<string, Snapshot<T, Meta, K>>(),
      timestamp: new Date(),
      category: "default-category",
      subscriberId: "default-subscriber-id",
      meta: {} as Map<string, Snapshot<T, Meta, K>>,
      events: {} as CombinedEvents<T, Meta, K>
    })
  }
};

export const useSnapshotManager = async <T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T>(
  initialStoreId: number
) => {
  const [snapshotManager, setSnapshotManager] = useState<SnapshotStoreConfig<T, Meta, K> | null>(null);
  const [snapshotStore, setSnapshotStore] = useState<SnapshotStore<T, Meta, K> | null>(null);

  useEffect(() => {
    const initSnapshotManager = async () => {
      const options: SnapshotStoreOptions<T, Meta, K> = {
        data: new Map<string, Snapshot<T, Meta, K>>(),
        initialState: null,
        snapshotId: "",
        category: {
          name: "initial-category",
          description: "",
          icon: "",
          color: "",
          iconColor: "",
          isActive: false,
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
          brandName: "",
          brandLogo: "",
          brandColor: "",
          brandMessage: "",
        },
        date: new Date(),
        type: "initial-type",
        snapshotConfig: [],
        subscribeToSnapshots,
        subscribeToSnapshot,
        delegate: {} as  SnapshotWithCriteria<T, Meta, K>[],
        dataStoreMethods: {} as DataStoreWithSnapshotMethods<T, Meta, K>,
        snapshotMethods: [],
        eventRecords: null,
        snapshotStoreConfig: undefined,
        unsubscribeToSnapshots: function() {
          throw new Error("Function not implemented.");
        },
        unsubscribeToSnapshot: function() {
          throw new Error("Function not implemented.");
        },
        getCategory: function(snapshotId: string, snapshot: Snapshot<T, Meta, K>, type: string, event: Event) {
          const category = snapshot.category;
          return typeof category === 'object' ? category : undefined;
        },


        getSnapshotConfig: function (
          id: number,
          snapshotId: string | null,
          snapshotContainer: SnapshotContainer<T, Meta, K>,
          criteria: CriteriaType,
          category: symbol | string | Category | undefined,
          categoryProperties: CategoryProperties | undefined,
          subscriberId: string | undefined,
          delegate: SnapshotWithCriteria<T, Meta, K>[],
          snapshotData: SnapshotData<T, Meta, K>,
          snapshot: (
            id: string | number | undefined,
            snapshotId: string | null,
            snapshotData: SnapshotData<T, Meta, K>,
            category: symbol | string | Category | undefined,
            categoryProperties: CategoryProperties,
            callback: (snapshotStore: Snapshot<T, Meta, K>) => void,
            dataStore: DataStore<T, Meta, K>,
            dataStoreMethods: DataStoreMethods<T, Meta, K>,
            // dataStoreSnapshotMethods: DataStoreWithSnapshotMethods<T, Meta, K>,
            metadata: UnifiedMetaDataOptions,
            subscriberId: string, // Add subscriberId here
            endpointCategory: string | number ,// Add endpointCategory here
            storeProps: SnapshotStoreProps<T, Meta, K>,
            snapshotConfigData: SnapshotConfig<T, Meta, K>,
            subscription: Subscription<T, Meta, K>,
            snapshotStoreConfigData?: SnapshotStoreConfig<T, Meta, K>,
            snapshotContainer?: SnapshotStore<T, Meta, K> | Snapshot<T, Meta, K> | null,
          ) => Promise<Snapshot<T, Meta, K>>,
          
        ) {

          // const { data,
          //   events,
          //   dataItems,
          //   newData,
          //   payload,
          //   store,
          //   callback,
          //   endpointCategory,
           
          // } = storeProps as SnapshotStoreProps<T, Meta, K>

          const snapshotStoreConfigData = snapshotApi.getSnapshotConfig(id,
            snapshotId,
            snapshotData,
            criteria,
            category,
            categoryProperties,
            subscriberId,
            delegate,
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

      const operation: SnapshotOperation = {
        operationType: SnapshotOperationType.FindSnapshot
      };

      const storeId = await getStoreId(initialStoreId);

      const snapshotStore = new SnapshotStore<T, Meta, K>({storeId, name, version, schema, options, category, config, operation});
      const snapshotConfig = createSnapshotConfig(snapshotStore);

      setSnapshotManager(snapshotConfig);
      setSnapshotStore(snapshotStore);
    };

    initSnapshotManager();
  }, []);

  return { snapshotManager, snapshotStore };
};




export { completeDataStoreMethods, convertSnapshotToContent, createSnapshotStore };
export type { CombinedEvents, SnapshotManager, SnapshotStoreOptions };


// //  access state with useSnapshotManager
// // Example of accessing state with useSnapshotManager
// const ExampleComponent: React.FC = () => {
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
//     </div>
//   )
// }

// export default ExampleComponent



