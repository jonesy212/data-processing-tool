// useSnapshotManager.ts
import { getStoreId } from '@/app/api/ApiData';
import * as snapshotApi from '@/app/api/SnapshotApi';
import {
  useNotification
} from "@/app/components/support/NotificationContext";
import { CategoryProperties } from "@/app/pages/personas/ScenarioBuilder";
import { useEffect, useState } from "react";
import { Category } from '../libraries/categories/generateCategoryProperties';
import { Content } from "../models/content/AddContent";
import { BaseData, Data } from "../models/data/Data";
import { displayToast } from '../models/display/ShowToast';
import { DataStoreWithSnapshotMethods } from "../projects/DataAnalysisPhase/DataProcessing/ DataStoreMethods";
import { useDataStore } from "../projects/DataAnalysisPhase/DataProcessing/DataStore";
import { CustomSnapshotData, SnapshotContainer, SnapshotWithCriteria } from '../snapshots';
import {
  Snapshot,
  SnapshotsArray
} from "../snapshots/LocalStorageSnapshotStore";
import { SnapshotOperation, SnapshotOperationType } from "../snapshots/SnapshotActions";
import SnapshotStore from "../snapshots/SnapshotStore";
import { SnapshotStoreConfig } from "../snapshots/SnapshotStoreConfig";
import { handleSnapshotOperation } from '../snapshots/handleSnapshotOperation';
import handleSnapshotStoreOperation from '../snapshots/handleSnapshotStoreOperation';
import { delegate, subscribeToSnapshot, subscribeToSnapshots } from "../snapshots/snapshotHandlers";
import CalendarManagerStoreClass from "../state/stores/CalendarEvent";
import { Subscriber } from "../users/Subscriber";
import { addToSnapshotList, isSnapshotWithCriteria } from '../utils/snapshotUtils';
import SnapshotStoreOptions from './SnapshotStoreOptions';
import { LibraryAsyncHook } from "./useAsyncHookLinker";
import { CriteriaType } from '@/app/pages/searchs/CriteriaType';
const { notify } = useNotification();


interface CombinedEvents<T extends Data, K extends Data> {
  eventRecords: Record<string, CalendarManagerStoreClass<T, K>[]> | null;
  callbacks: Record<string, Array<(snapshot: Snapshot<T, K>) => void>>;
  subscribers: Subscriber<T, K>[];
  eventIds: string[];
  on: (
    event: string,
    callback: (snapshot: Snapshot<T, K>) => void
  ) => void;
  off: (
    event: string,
    callback: (snapshot: Snapshot<T, K>) => void
  ) => void;
  subscribe: (
    event: string,
    callback: (snapshot: Snapshot<T, K>) => void

  ) => void;

  unsubscribe: (
    event: string,
    callback: (snapshot: Snapshot<T, K>) => void


  ) => void;
  trigger: (
    event: string,
    snapshot: Snapshot<T, K>
  ) => void; // Method to trigger callbacks for an event
  eventsDetails?: CalendarManagerStoreClass<T, K>[] | undefined
}


interface SnapshotManager<T extends BaseData, K extends BaseData> {
  initSnapshot: (
    snapshotConfig: SnapshotStoreConfig<T, K>[],
    snapshotData: SnapshotStore<T, K>
  ) => Promise<void>;
  storeIds: number[],
  snapshotId: string,
  category: symbol | string | Category | undefined,
  snapshot: Snapshot<T, K>,
  timestamp: string | number | Date | undefined,
  type: string,
  event: Event,
  id: number,
  snapshotStore: SnapshotStore<Data, any>,
  data: Data
  state: SnapshotStore<T, K>[];
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


const completeDataStoreMethods: <T extends BaseData, K extends BaseData>(
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
const convertSnapshotToContent = <T extends BaseData, K extends BaseData>(
  snapshot: Snapshot<T, K>
): Content<T> => {
  // Convert snapshot.data to match SnapshotWithCriteria<T, BaseData>
  let data: SnapshotWithCriteria<T, BaseData> | CustomSnapshotData | null | undefined;

  if (snapshot.data instanceof Map) {
    data = convertMapToCustomSnapshotData(snapshot.data);
  } else if (isSnapshotWithCriteria(snapshot.data)) {
    // Ensure snapshot.data is of type SnapshotWithCriteria<T, BaseData>
    data = snapshot.data as unknown as SnapshotWithCriteria<T, BaseData>;
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
    data: data
  };
};
// Example conversion function from Map to CustomSnapshotData
const convertMapToCustomSnapshotData = <T extends BaseData, K extends BaseData>(map: Map<string, Snapshot<T, K>>

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



const createSnapshotStore = <T extends BaseData, K extends BaseData>(
  snapshotConfig: SnapshotStoreConfig<T, K>,
  snapshotData: SnapshotStore<T, K>
): SnapshotStore<T, K> => {
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


const createSnapshotConfig = <T extends BaseData, K extends BaseData>(
  snapshotStore: SnapshotStore<T, K>,
  snapshotContent?: Snapshot<T, K>
): SnapshotStoreConfig<T, K> => {
  const content = snapshotContent ? convertSnapshotToContent(snapshotContent) : undefined;

  return {
    snapshotStore,
    snapshotId: "initial-id",
    snapshotCategory: "initial-category",
    snapshotSubscriberId: "initial-subscriber",
    timestamp: new Date(),
    snapshotContent: content,
    id: null,
    data: {} as T,
    initialState: null,
    handleSnapshot: (
      id: string,
      snapshotId: string,
      snapshot: T | null,
      snapshotData: T,
      category: symbol | string | Category | undefined,
      callback: (snapshot: T) => void,
      snapshots: SnapshotsArray<any>,
      type: string,
      event: Event,
      snapshotContainer?: T,
      snapshotStoreConfig?: SnapshotStoreConfig<T, K>,
    ): Promise<Snapshot<T, K> | null> => {

      try {
        if (snapshot) {
          console.log(`Handling snapshot with ID: ${snapshotId}`);

          const processedSnapshot = { ...snapshot, ...snapshotData };

          callback(processedSnapshot);

          return Promise.resolve({
            id: snapshotId,
            data: processedSnapshot,
            category: category,
            timestamp: new Date(),
            snapshotStore: snapshotStoreConfig,
          } as Snapshot<T, K>);
        } else {
          console.log(`No snapshot to handle for ID: ${snapshotId}`);

          if (snapshotContainer) {
            console.log(`Using snapshot container with ID: ${snapshotContainer.id}`);

            const processedContainer = { ...snapshotContainer, ...snapshotData };

            callback(processedContainer);

            return Promise.resolve({
              id: snapshotId,
              data: processedContainer,
              category: category,
              timestamp: new Date(),
              snapshotStore: snapshotStoreConfig,
            } as Snapshot<T, K>);
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
    getSnapshotId: () => "default-id",
    snapshot: async (
      id: string,
      snapshotId: string | null,
      snapshotData: Snapshot<T, K> | null,
      category: symbol | string | Category | undefined,
      categoryProperties: CategoryProperties,
      callback: (snapshot: Snapshot<T, K> | null) => void,
      snapshotContainer?: T | null | undefined,
      snapshotStoreConfigData?: SnapshotStoreConfig<T, K>,
    ): Promise<{ snapshot: Snapshot<T, K> | null }> => {
      if(snapshotData !== null){
        
        const snapshot: Snapshot<T, K> | null = snapshotStoreConfigData?.createSnapshot?.(
          id,
          snapshotData,
          category,
          categoryProperties,
          callback
        ) ?? null;
        
        if (snapshot) {
          callback(snapshot);
          
          const snapshotId: string | number | undefined = snapshot?.store?.snapshotId ?? undefined;
          const storeId = await snapshotApi.getSnapshotStoreId(Number(snapshotId));
          
          const defaultConfig: SnapshotStoreConfig<T, K> = {} as SnapshotStoreConfig<T, K>;
          const config: SnapshotStoreConfig<T, K> = snapshotStoreConfig ? snapshotStoreConfig[0] || defaultConfig : defaultConfig;
          const operation: SnapshotOperation = {
            operationType: SnapshotOperationType.FindSnapshot
          };
          
          const newSnapshotStore = new SnapshotStore<T, K>(storeId, options, category, config, operation);
          
          callback(snapshot);
          
        }
          return {
            snapshot: snapshot,
          };
        } else {
          console.error('Failed to create snapshot');
        return { snapshot: null };
      }
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
  };
};

export const useSnapshotManager = async <T extends Data, K extends Data>(
  initialStoreId: number
) => {
  const [snapshotManager, setSnapshotManager] = useState<SnapshotStoreConfig<T, K> | null>(null);
  const [snapshotStore, setSnapshotStore] = useState<SnapshotStore<T, K> | null>(null);

  useEffect(() => {
    const initSnapshotManager = async () => {
      const options: SnapshotStoreOptions<T, K> = {
        data: new Map<string, Snapshot<T, K>>(),
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
        delegate: () => Promise.resolve([]),
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
        getCategory: function(snapshotId: string, snapshot: Snapshot<T, K>, type: string, event: Event) {
          const category = snapshot.category;
          return typeof category === 'object' ? category : undefined;
        },
        getSnapshotConfig: function(
          snapshotId: number | null,
          snapshotContainer: SnapshotContainer<T, K>,
          criteria: CriteriaType,
          category: symbol | string | Category | undefined,
          categoryProperties: CategoryProperties,
          delegate: any,
          snapshotData: SnapshotStore<T, K>,
          snapshot:
            ( id: string,
              snapshotId: number | null,
              snapshotData: Snapshot<T, K>, 
              category: Category,
              callback: (snapshotStore: Snapshot<T, K>) => void,
              snapshotStoreConfigData?: SnapshotStoreConfig<T, K>
            ) => void,
          // storeConfig: SnapshotStoreConfig<T, K>,
          
        ) {
          const snapshotConfig = createSnapshotConfig(snapshotStore);
          return snapshotConfig;
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
      const snapshotStore = new SnapshotStore<T, K>(Number(storeId), options, category, config, operation);
      const snapshotConfig = createSnapshotConfig(snapshotStore);

      setSnapshotManager(snapshotConfig);
      setSnapshotStore(snapshotStore);
    };

    initSnapshotManager();
  }, []);

  return { snapshotManager, snapshotStore };
};
export { completeDataStoreMethods, convertSnapshotToContent };
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



