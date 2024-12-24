// // SnapshotContext.ts
import { Category } from "@/app/components/libraries/categories/generateCategoryProperties";
import { BaseData, } from "@/app/components/models/data/Data";
import { SnapshotData } from '@/app/components/snapshots';
import { SnapshotStoreOptions } from '@/app/components/snapshots/SnapshotStoreOptions';
import { createContext, ReactNode, useContext, useState } from "react";
import {
    Snapshot,
} from "../components/snapshots/LocalStorageSnapshotStore";

import { SnapshotStoreProps } from '@/app/components/snapshots/useSnapshotStore';
import { useMemo } from 'react';
import { createSnapshotInstance } from "../components/snapshots/createSnapshotInstance";
import SnapshotStore from "../components/snapshots/SnapshotStore";
import { StructuredMetadata } from "../configs/StructuredMetadata";

const fetchSnapshotFromAPI = async <T extends BaseData<any> = BaseData<any, any>, K extends T = T>(id: string) => {
  try {
    const response = await fetch(`/api/snapshots/${id}`);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching snapshot:", error);
    throw error;
  }
};

interface SnapshotContextType<
    T extends BaseData<any> = BaseData<any, any>, 
    K extends T = T,
    Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>
> {
  snapshot: Snapshot<T, K> | null;
  snapshots: Snapshot<T, K>[]; // Using generic types
  createSnapshot: (
    id: string,
    snapshotData: SnapshotData<any, T>,
    category: string
  ) => void;
  fetchSnapshot: (id: string) => Promise<Snapshot<T, K>>;
  snapshotStore: SnapshotStore<T, K>;
  snapshotMap: Map<string, Snapshot<T, K>>; // Add this property
}


// Create the context with default values
export const SnapshotContext = createContext<
  SnapshotContextType<any, any> | undefined
>(undefined);

export const SnapshotProvider = <
  T extends BaseData<any>,
  K extends T = T, 
  Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>,
  ExcludedFields extends keyof T = never
>({
  children,
}: {
  children: ReactNode;
}) => {
  const [snapshot, setSnapshot] = useState<Snapshot<T, K> | null>(null);
  const [snapshots, setSnapshots] = useState<Snapshot<T, K>[]>([]);


  // Initialize the snapshotMap from the snapshots array
  const snapshotMap = useMemo(() => {
    const map = new Map<string, Snapshot<T, K>>();


    if (!snapshots || snapshots.length === 0) {
      return map;
    }
  
    snapshots.forEach((snapshot) => {
      if (snapshot.id !== undefined) {
        map.set(snapshot.id?.toString() ?? 'undefined-id', snapshot);
      } else {
        // Handle snapshots with undefined IDs, optionally log a warning or use a fallback ID
        console.warn("Snapshot has undefined id", snapshot);
      }
    });

    return map
  }, [snapshots]);

  

  // Function to create a new snapshot using Promise with resolve and reject
  const createSnapshot = (
    id: string,
    snapshotData: SnapshotData<T, K>,
    category: Category,
    storeProps?: SnapshotStoreProps<T, K>, // Optional parameter
    storeOptions?: SnapshotStoreOptions<T, K, Meta, ExcludedFields> // Optional parameter
  ): Promise<Snapshot<T, K>> => {
    return new Promise(async (resolve, reject) => {
      // Check if storeProps is defined before destructuring
      if (storeProps) {
        const {
          storeId,
          name,
          schema,
          config,
          initialState,
          operation,
          expirationDate,
          payload,
          callback,
          endpointCategory,
        } = storeProps;
  
        try {
          const newSnapshot = createSnapshotInstance(
            snapshotData.data as T,
            new Map<string, Snapshot<T, K>>(), // Pass a new or existing metadata map
            id,
            category,
            null, // Pass a `snapshotStore` if applicable
            null, // Pass a `snapshotManager` if applicable
            null, // Pass a `snapshotStoreConfig` if applicable
            {
              id,
              category,
              storeId,
              name,
              schema,
              config,
              initialState,
              operation,
              expirationDate,
              payload,
              callback,
              storeProps, // Pass the entire storeProps here if needed
              endpointCategory,
              data: snapshotData.data ?? undefined,
              createdAt: new Date() ?? '', // Ensure proper fallback for createdAt
            },
            {
              id,
              storeId,


              delegate, getDelegate, getCategory, initSnapshot,
              createSnapshotStore, configureSnapshot, configureSnapshotStore, getDataStoreMethods,
              getSnapshotConfig, createSnapshot, configureSnap,
              


              baseURL: 'https://example.com/api', // Ensure this is properly set
              enabled: true, // Required boolean property
              maxRetries: 3,
              retryDelay: 1000, // Example retry delay in milliseconds
              maxAge: '30d',
              staleWhileRevalidate: 600, // Example: 10 minutes
              cacheKey: `snapshot_${id}`,
              initialState: initialState || {}, // Provide a proper initial state
              eventRecords: {},
              records: [],
              category,
              date: new Date(), // Provide a valid date
              type: 'snapshot-type', // Example placeholder, adjust as needed
              metadata: {},
              criteria: {},
              callbacks: {}, // Define callbacks if necessary
              snapshotMethods: [], // Example placeholder, adjust as needed
              simulatedDataSource: null, // Placeholder
              subscribeToSnapshots: "",
              subscribeToSnapshot: "",
              unsubscribeToSnapshots: "",
              unsubscribeToSnapshot: "",
              handleSnapshotOperation, handleSnapshotStoreOperation, displayToast, addToSnapshotList,
              getSnapshotConfig, createSnapshot, configureSnap,


            } as SnapshotStoreOptions<T, K>, // Ensure correct type casting // Example `storeOptions`, pass necessary options here
          );
  
          // Resolve with the newly created snapshot
          resolve(newSnapshot);
  
          // Perform any additional logic if needed with the created snapshot
          console.log("New Snapshot Created:", newSnapshot);
  
        } catch (error: any) {
          // Reject with error message if something goes wrong
          reject(new Error(`Failed to create snapshot: ${error.message}`));
        }
      } else {
        // If storeProps is undefined, you can handle this case, 
        // for example, by logging an error or returning a default value.
        reject(new Error("storeProps is required but was not provided"));
      }
    });
  };
}

// Custom hook to use the SnapshotContext
export const useSnapshot = <
  T extends BaseData<any> = BaseData<any, any>,
  K extends T = T,
  Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>,
  ExcludedFields extends keyof T = never
>(): { snapshotMap: Map<string, Snapshot<T, K, Meta, ExcludedFields>> } => {
  const context = useContext(SnapshotContext);

  if (!context) {
    throw new Error("useSnapshot must be used within a SnapshotProvider");
  }

  return {
    snapshotMap: context.snapshotMap as Map<string, Snapshot<T, K, Meta, ExcludedFields>>,
  };
};


// function fetchSnapshotFromAPI<T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(
//   id: string
// ): Promise<Snapshot<T, K>> {
//   return new Promise((resolve, reject) => {
//     // Wrapping async logic in a Promise
//     fetch(`/api/snapshots/${id}`)
//       .then((response) => {
//         if (!response.ok) {
//           throw new Error(
//             `Failed to fetch snapshot with ID: ${id}. Status: ${response.status}`
//           );
//         }
//         return response.json(); // Parse the JSON response
//       })
//       .then((data) => {
        
//       // Use type assertion to ensure the data fits the expected structure
//       const fetchedData = data as FetchedSnapshotStore<T, K>;

//         // Ensure the data fits the Snapshot<T, K> type
//         const fetchedSnapshot: Snapshot<T, K> = {
//           id: fetchedData.snapshotStore.id,
//           data: fetchedData.data,
//           storeId: fetchedData.snapshotStore.storeId,
//           timestamp: new Date(fetchedData.snapshotStore.timestamp), // Assuming timestamp is returned as a string
//           category: fetchedData.snapshotStore.category,
//           topic: fetchedData.snapshotStore.topic,
//           meta: fetchedData.snapshotStore.meta,
//           snapshotStoreConfig: fetchedData.snapshotStore.snapshotStoreConfig,
//           getSnapshotItems: fetchedData.snapshotStore.getSnapshotItems,
//           defaultSubscribeToSnapshots: fetchedData.snapshotStore.defaultSubscribeToSnapshots,
//           versionInfo: fetchedData.snapshotStore.versionInfo,
//           initialState: fetchedData.snapshotStore.initialState,
//           isCore: fetchedData.snapshotStore.isCore,

//           transformSubscriber: fetchedData.snapshotStore.snapshotConfig.transformSubscriber,
//           taskIdToAssign: fetchedData.snapshotStore.snapshotConfig.taskIdToAssign,
//           schema: fetchedData.snapshotStore.snapshotConfig.schema,

//           currentCategory: fetchedData.snapshotStore.currentCategory,
//           generateId: fetchedData.snapshotStore.generateId,
//           config: fetchedData.snapshotStore.getConfig(),
//           subscribe: fetchedData.snapshotStore.subscribe,

//           items: fetchedData.snapshotStore.getItems(),

//           stores: fetchedData.snapshotStore.stores,

//           fetchSnapshotSuccess: fetchedData.snapshotStore.fetchSnapshotSuccess,

//           childIds: fetchedData.snapshotStore.snapshotConfig.childIds,

//           getParentId: fetchedData.snapshotStore.getParentId,
//           getChildIds: fetchedData.snapshotStore.getChildIds,
//           addChild: fetchedData.snapshotStore.addChild,
//           removeChild: fetchedData.snapshotStore.removeChild,

//           getChildren: fetchedData.snapshotStore.getChildren,
//           hasChildren: fetchedData.snapshotStore.hasChildren,
//           isDescendantOf: fetchedData.snapshotStore.isDescendantOf,
//           getSnapshotById: fetchedData.snapshotStore.getSnapshotById,

//           transformDelegate: fetchedData.snapshotStore.transformDelegate,
//           initializedState: fetchedData.snapshotStore.initializedState,
//           getAllKeys: fetchedData.snapshotStore.getAllKeys,
//           getAllItems: fetchedData.snapshotStore.getAllItems,
//           addDataStatus: fetchedData.snapshotStore.addDataStatus,
//           removeData: fetchedData.snapshotStore.removeData,
//           updateData: fetchedData.snapshotStore.updateData,
//           updateDataTitle: fetchedData.snapshotStore.updateDataTitle,
//           updateDataDescription: fetchedData.snapshotStore.updateDataDescription,
//           updateDataStatus: fetchedData.snapshotStore.updateDataStatus,
//           addDataSuccess: fetchedData.snapshotStore.addDataSuccess,
//           getDataVersions: fetchedData.snapshotStore.getDataVersions,
//           updateDataVersions: fetchedData.snapshotStore.updateDataVersions,
//           getBackendVersion: fetchedData.snapshotStore.getBackendVersion,
//           getFrontendVersion: fetchedData.snapshotStore.getFrontendVersion,
//           fetchData: fetchedData.snapshotStore.fetchData,
//           defaultSubscribeToSnapshot: fetchedData.snapshotStore.defaultSubscribeToSnapshot,
//           handleSubscribeToSnapshot: fetchedData.snapshotStore.handleSubscribeToSnapshot,
//           removeItem: fetchedData.snapshotStore.removeItem,
//           getSnapshot: fetchedData.snapshotStore.getSnapshot,
//           getSnapshotSuccess: fetchedData.snapshotStore.getSnapshotSuccess,
//           setItem: fetchedData.snapshotStore.setItem,
//           getDataStore: fetchedData.snapshotStore.getDataStore,
//           addSnapshotSuccess: fetchedData.snapshotStore.addSnapshotSuccess,
//           deepCompare: fetchedData.snapshotStore.deepCompare,
//           shallowCompare: fetchedData.snapshotStore.shallowCompare,
//           getDataStoreMethods: fetchedData.snapshotStore.getDataStoreMethods,
//           getDelegate: fetchedData.snapshotStore.getDelegate,
//           determineCategory: fetchedData.snapshotStore.determineCategory,
//           determinePrefix: fetchedData.snapshotStore.determinePrefix,
//           removeSnapshot: fetchedData.snapshotStore.removeSnapshot,
//           addSnapshotItem: fetchedData.snapshotStore.addSnapshotItem,
//           addNestedStore: fetchedData.snapshotStore.addNestedStore,
//           clearSnapshots: fetchedData.snapshotStore.clearSnapshots,
//           addSnapshot: fetchedData.snapshotStore.addSnapshot,
//           createSnapshot: fetchedData.snapshotStore.createSnapshot,
//           createInitSnapshot: fetchedData.snapshotStore.createInitSnapshot,
//           setSnapshotSuccess: fetchedData.snapshotStore.setSnapshotSuccess,
//           setSnapshotFailure: fetchedData.snapshotStore.setSnapshotFailure,
//           updateSnapshots: fetchedData.snapshotStore.updateSnapshots,
//           updateSnapshotsSuccess: fetchedData.snapshotStore.updateSnapshotsSuccess,
//           updateSnapshotsFailure: fetchedData.snapshotStore.updateSnapshotsFailure,
//           initSnapshot: fetchedData.snapshotStore.initSnapshot,
//           takeSnapshot: fetchedData.snapshotStore.takeSnapshot,
//           takeSnapshotSuccess: fetchedData.snapshotStore.takeSnapshotSuccess,
//           takeSnapshotsSuccess: fetchedData.snapshotStore.takeSnapshotsSuccess,
//           flatMap: fetchedData.snapshotStore.flatMap,
//           getState: fetchedData.snapshotStore.getState,
//           setState: fetchedData.snapshotStore.setState,
//           validateSnapshot: fetchedData.snapshotStore.validateSnapshot,
//           handleActions: fetchedData.snapshotStore.handleActions,
//           setSnapshot: fetchedData.snapshotStore.setSnapshot,
//           transformSnapshotConfig: fetchedData.snapshotStore.transformSnapshotConfig,
//           setSnapshots: fetchedData.snapshotStore.setSnapshots,
//           clearSnapshot: fetchedData.snapshotStore.clearSnapshot,
//           mergeSnapshots: fetchedData.snapshotStore.mergeSnapshots,
//           reduceSnapshots: fetchedData.snapshotStore.reduceSnapshots,
//           sortSnapshots: fetchedData.snapshotStore.sortSnapshots,
//           filterSnapshots: fetchedData.snapshotStore.filterSnapshots,
//           findSnapshot: fetchedData.snapshotStore.findSnapshot,
//           getSubscribers: fetchedData.snapshotStore.getSubscribers,
//           notify: fetchedData.snapshotStore.notify,
//           notifySubscribers: fetchedData.snapshotStore.notifySubscribers,
//           getAllSnapshots: fetchedData.snapshotStore.getAllSnapshots,
//           initialConfig: fetchedData.snapshotStore.snapshotConfig.initialConfig,
//           removeSubscriber: fetchedData.snapshotStore.snapshotConfig.removeSubscriber,
//           onInitialize: fetchedData.snapshotStore.snapshotConfig.onInitialize,
//           onError: fetchedData.snapshotStore.snapshotConfig.onError,

//           snapshot: fetchedData.snapshotStore.snapshot,
//           setCategory: fetchedData.snapshotStore.snapshotConfig.setCategory,
//           applyStoreConfig: fetchedData.snapshotStore.snapshotConfig.applyStoreConfig,
//           snapshotData: fetchedData.snapshotStore.snapshotConfig.snapshotData,

//           getItem: fetchedData.snapshotStore.getItem,
//           getDataStoreMap: fetchedData.snapshotStore.getDataStoreMap,
//           emit: fetchedData.snapshotStore.emit,
//           addStoreConfig: fetchedData.snapshotStore.snapshotConfig.addStoreConfig,

//           handleSnapshotConfig: fetchedData.snapshotStore.snapshotConfig.handleSnapshotConfig,
//           getSnapshotConfig: fetchedData.snapshotStore.snapshotConfig.getSnapshotConfig,
//           getSnapshotListByCriteria: fetchedData.snapshotStore.snapshotConfig.getSnapshotListByCriteria,
//           mapSnapshots: fetchedData.snapshotStore.mapSnapshots,

//           takeLatestSnapshot: fetchedData.snapshotStore.snapshotConfig.takeLatestSnapshot,
//           updateSnapshot: fetchedData.snapshotStore.updateSnapshot,
//           addSnapshotSubscriber: fetchedData.snapshotStore.snapshotConfig.addSnapshotSubscriber,
//           removeSnapshotSubscriber: fetchedData.snapshotStore.removeSnapshotSubscriber,

//           getSnapshotConfigItems: fetchedData.snapshotStore.snapshotConfig.getSnapshotConfigItems,
//           subscribeToSnapshots: fetchedData.snapshotStore.subscribeToSnapshots,
//           executeSnapshotAction: fetchedData.snapshotStore.executeSnapshotAction,
//           subscribeToSnapshot: fetchedData.snapshotStore.subscribeToSnapshot,

//           unsubscribeFromSnapshot: fetchedData.snapshotStore.snapshotConfig.unsubscribeFromSnapshot,
//           subscribeToSnapshotsSuccess: fetchedData.snapshotStore.snapshotConfig.subscribeToSnapshotsSuccess,
//           unsubscribeFromSnapshots: fetchedData.snapshotStore.snapshotConfig.unsubscribeFromSnapshots,
//           getSnapshotItemsSuccess: fetchedData.snapshotStore.snapshotConfig.getSnapshotItemsSuccess,

//           getAllSnapshotEntries: fetchedData.snapshotStore.snapshotConfig.getAllSnapshotEntries,

//           setSnapshotCategory: fetchedData.snapshotStore.snapshotConfig.setSnapshotCategory,
//           getSnapshotCategory: fetchedData.snapshotStore.snapshotConfig.getSnapshotCategory,
//           getSnapshotData: fetchedData.snapshotStore.snapshotConfig.getSnapshotData,
//           deleteSnapshot: fetchedData.snapshotStore.snapshotConfig.deleteSnapshot,
//           getSnapshots: fetchedData.snapshotStore.getSnapshots,
//           compareSnapshots: fetchedData.snapshotStore.snapshotConfig.compareSnapshots,
//           compareSnapshotItems: fetchedData.snapshotStore.snapshotConfig.compareSnapshotItems,

//           getSnapshotId: fetchedData.snapshotStore.getSnapshotId,

//           getSnapshotItemSuccess: fetchedData.snapshotStore.snapshotConfig.getSnapshotItemSuccess,
//           getSnapshotKeys: fetchedData.snapshotStore.snapshotConfig.getSnapshotKeys,
//           getSnapshotIdSuccess: fetchedData.snapshotStore.snapshotConfig.getSnapshotIdSuccess,
//           getSnapshotValuesSuccess: fetchedData.snapshotStore.snapshotConfig.getSnapshotValuesSuccess,

//           getSnapshotWithCriteria: fetchedData.snapshotStore.snapshotConfig.getSnapshotWithCriteria,
//           reduceSnapshotItems: fetchedData.snapshotStore.snapshotConfig.reduceSnapshotItems,
//           subscribeToSnapshotList: fetchedData.snapshotStore.snapshotConfig.subscribeToSnapshotList,
//           label: fetchedData.snapshotStore.snapshotConfig.label,

//           events: fetchedData.snapshotStore.events,
//           restoreSnapshot: fetchedData.snapshotStore.restoreSnapshot,
//           handleSnapshot: fetchedData.snapshotStore.handleSnapshot,
//           subscribers: fetchedData.snapshotStore.subscribers,
//           snapshotStore: fetchedData.snapshotStore.snapshotStore,

//           mappedSnapshotData: fetchedData.snapshotStore.snapshotConfig.mappedSnapshotData,
//           getAllValues: fetchedData.snapshotStore.snapshotConfig.getAllValues,
//           getSnapshotEntries: fetchedData.snapshotStore.snapshotConfig.getSnapshotEntries,
//           batchTakeSnapshot: fetchedData.snapshotStore.batchTakeSnapshot,
//           batchFetchSnapshots: fetchedData.snapshotStore.batchFetchSnapshots,
//           batchTakeSnapshotsRequest: fetchedData.snapshotStore.batchTakeSnapshotsRequest,
//           batchUpdateSnapshotsRequest: fetchedData.snapshotStore.batchUpdateSnapshotsRequest,
//           filterSnapshotsByStatus: fetchedData.snapshotStore.snapshotConfig.filterSnapshotsByStatus,
//           filterSnapshotsByCategory: fetchedData.snapshotStore.snapshotConfig.filterSnapshotsByCategory,
//           filterSnapshotsByTag: fetchedData.snapshotStore.snapshotConfig.filterSnapshotsByTag,
//           batchFetchSnapshotsSuccess: fetchedData.snapshotStore.batchFetchSnapshotsSuccess,
//           batchFetchSnapshotsFailure: fetchedData.snapshotStore.batchFetchSnapshotsFailure,
//           batchUpdateSnapshotsSuccess: fetchedData.snapshotStore.batchUpdateSnapshotsSuccess,
//           batchUpdateSnapshotsFailure: fetchedData.snapshotStore.batchUpdateSnapshotsFailure,
//           handleSnapshotSuccess: fetchedData.snapshotStore.handleSnapshotSuccess,
//           compareSnapshotState: fetchedData.snapshotStore.compareSnapshotState,
//           payload: fetchedData.snapshotStore.snapshotConfig.payload,
//           dataItems: fetchedData.snapshotStore.dataItems,
//           newData: fetchedData.snapshotStore.newData,
//           getInitialState: fetchedData.snapshotStore.getInitialState,
//           getConfigOption: fetchedData.snapshotStore.getConfigOption,
//           getTimestamp: fetchedData.snapshotStore.getTimestamp,
//           getStores: fetchedData.snapshotStore.getStores,
//           getData: fetchedData.snapshotStore.getData,
//           setData: fetchedData.snapshotStore.setData,
//           addData: fetchedData.snapshotStore.addData,
//           getStore: fetchedData.snapshotStore.snapshotConfig.getStore,
//           addStore: fetchedData.snapshotStore.addStore,
//           mapSnapshot: fetchedData.snapshotStore.mapSnapshot,
//           mapSnapshotWithDetails: fetchedData.snapshotStore.snapshotConfig.mapSnapshotWithDetails,
//           removeStore: fetchedData.snapshotStore.removeStore,
//           unsubscribe: fetchedData.snapshotStore.unsubscribe,
//           fetchSnapshot: fetchedData.snapshotStore.fetchSnapshot,
//           updateSnapshotFailure: fetchedData.snapshotStore.updateSnapshotFailure,
//           fetchSnapshotFailure: fetchedData.snapshotStore.fetchSnapshotFailure,
//           addSnapshotFailure: fetchedData.snapshotStore.addSnapshotFailure,
//           configureSnapshotStore: fetchedData.snapshotStore.configureSnapshotStore,
//           updateSnapshotSuccess: fetchedData.snapshotStore.updateSnapshotSuccess,
//           createSnapshotFailure: fetchedData.snapshotStore.createSnapshotFailure,
//           createSnapshotSuccess: fetchedData.snapshotStore.createSnapshotSuccess,
//           createSnapshots: fetchedData.snapshotStore.createSnapshots,
//           onSnapshot: fetchedData.snapshotStore.onSnapshot,
//           onSnapshots: fetchedData.snapshotStore.onSnapshots,
//         };
//         resolve(fetchedSnapshot); // Resolve with the snapshot
//       })
//       .catch((error) => {
//         reject(error); // Reject in case of error
//       });
//   });
// }

// function fetchSnapshotStoreFromAPI<T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(
//   id: string
// ): Promise<SnapshotStore<T, K>> {
//   return new Promise((resolve, reject) => {
//     // Wrapping async logic in a Promise
//     fetch(`/api/snapshotStores/${id}`)
//       .then((response) => {
//         if (!response.ok) {
//           throw new Error(
//             `Failed to fetch snapshot store with ID: ${id}. Status: ${response.status}`
//           );
//         }
//         return response.json(); // Parse the JSON response
//       })
//       .then((data) => {
//         // Use type assertion to ensure the data fits the expected structure
//         const fetchedData = data as FetchedSnapshotStore<T, K>;

//         // Ensure the data fits the SnapshotStore<T, K> type
//         const fetchedSnapshotStore: SnapshotStore<T, K> = {
//           id: fetchedData.snapshotStore.id,
//           snapshots: fetchedData.snapshotStore.snapshots,
//           snapshotCount: fetchedData.snapshotStore.snapshots.length, // Adding snapshotCount
//           lastUpdated:
//             fetchedData.snapshotStore.snapshots.length > 0
//               ? new Date(
//                   Math.max(
//                     ...fetchedData.snapshotStore.snapshots.map((snapshot) =>
//                       new Date(snapshot.updatedAt ?? 0).getTime()
//                     )
//                   )
//                 ).toISOString()
//               : null,
//           snapshotTitles: fetchedData.snapshotStore.snapshots.map(
//             (snapshot) => snapshot.title
//           ),
//           activeSnapshots: fetchedData.snapshotStore.snapshots.filter(
//             (snapshot) => snapshot.isActive
//           ),
//           snapshotCategories: Array.from(
//             new Set(
//               fetchedData.snapshotStore.snapshots.map(
//                 (snapshot) => snapshot.category
//               )
//             )
//           ),
//           snapshotSummary: {
//             count: fetchedData.snapshotStore.snapshots.length,
//             totalSize: fetchedData.snapshotStore.snapshots.reduce(
//               (acc, snapshot) => acc + (snapshot.size || 0),
//               0
//             ),
//           },
//           isEmpty: fetchedData.snapshotStore.snapshots.length === 0,
//           recentSnapshotCount: fetchedData.snapshotStore.snapshots.filter(
//             (snapshot) => {
//               const createdAt = new Date(snapshot.createdAt);
//               return (
//                 new Date().getTime() - createdAt.getTime() <=
//                 30 * 24 * 60 * 60 * 1000
//               );
//             }
//           ).length,
//           // snapshotData: fetchedData.snapshotData,
//           category: fetchedData.snapshotStore.category,
//           topic: fetchedData.snapshotStore.topic,
//           meta: fetchedData.snapshotStore.meta,
//           snapshotStoreConfig: fetchedData.snapshotStore.snapshotStoreConfig,
//           addSnapshot: fetchedData.snapshotStore.addSnapshot,
//           removeSnapshot: fetchedData.snapshotStore.removeSnapshot,
//           updateSnapshot: fetchedData.snapshotStore.updateSnapshot,
//           // getSnapshotById: fetchedData.getSnapshotById,
//           findSnapshot: fetchedData.snapshotStore.findSnapshot,
//           filterSnapshots: fetchedData.snapshotStore.filterSnapshots,
//           sortSnapshots: fetchedData.snapshotStore.sortSnapshots,
//           mapSnapshots: fetchedData.snapshotStore.mapSnapshots,
//           reduceSnapshots: fetchedData.snapshotStore.reduceSnapshots,
//           clearSnapshots: fetchedData.snapshotStore.clearSnapshots,
//           // getSnapshotData: fetchedData.getSnapshotData,
//           notifySubscribers: fetchedData.notifySubscribers,
//           subscribeToSnapshots: fetchedData.subscribeToSnapshots,
//           unsubscribe: fetchedData.unsubscribe,
//           configureSnapshotStore: fetchedData.configureSnapshotStore,
//           getAllSnapshots: fetchedData.getAllSnapshots,
//           // getConfigOption: fetchedData.getConfigOption,
//           // getTimestamp: fetchedData.getTimestamp,
//           // getStores: fetchedData.getStores,
//           getStore: fetchedData.getStore,
//           addStore: fetchedData.addStore,
//           removeStore: fetchedData.removeStore,
//           handleSnapshot: fetchedData.handleSnapshot,
//           setSnapshot: fetchedData.setSnapshot,
//           getData: fetchedData.getData,
//           setData: fetchedData.setData,
//           addData: fetchedData.addData,
//           removeData: fetchedData.removeData,
//           updateData: fetchedData.updateData,
//           fetchSnapshot: fetchedData.fetchSnapshot,
//           initSnapshot: fetchedData.initSnapshot,
//           takeSnapshot: fetchedData.takeSnapshot,
//           validateSnapshot: fetchedData.validateSnapshot,
//           mergeSnapshots: fetchedData.mergeSnapshots,
//           batchUpdateSnapshotsRequest: fetchedData.batchUpdateSnapshotsRequest,
//           batchUpdateSnapshotsSuccess: fetchedData.batchUpdateSnapshotsSuccess,
//           batchUpdateSnapshotsFailure: fetchedData.batchUpdateSnapshotsFailure,
//           batchTakeSnapshot: fetchedData.batchTakeSnapshot,
//           batchFetchSnapshots: fetchedData.batchFetchSnapshots,
//           batchFetchSnapshotsSuccess: fetchedData.batchFetchSnapshotsSuccess,
//           batchFetchSnapshotsFailure: fetchedData.batchFetchSnapshotsFailure,
//           batchTakeSnapshotsRequest: fetchedData.batchTakeSnapshotsRequest,
//           handleSnapshotSuccess: fetchedData.handleSnapshotSuccess,
//           getSnapshotId: fetchedData.getSnapshotId,
//           compareSnapshotState: fetchedData.compareSnapshotState,
//           eventRecords: fetchedData.eventRecords,
//           snapshotStore: fetchedData.snapshotStore,
//           getParentId: fetchedData.getParentId,
//           getChildIds: fetchedData.getChildIds,
//           // addChild: fetchedData.addChild,
//           // removeChild: fetchedData.removeChild,
//           // getChildren: fetchedData.getChildren,
//           // hasChildren: fetchedData.hasChildren,
//           // isDescendantOf: fetchedData.isDescendantOf,
//           dataItems: fetchedData.dataItems,
//           newData: fetchedData.newData,
//           // getInitialState: fetchedData.getInitialState,
//           getBackendVersion: fetchedData.getBackendVersion,
//           getFrontendVersion: fetchedData.getFrontendVersion,
//           flatMap: fetchedData.flatMap,
//           getAllKeys: fetchedData.getAllKeys,
//           getAllItems: fetchedData.getAllItems,
//           mapSnapshot: fetchedData.mapSnapshot,
//           getState: fetchedData.getState,
//           setState: fetchedData.setState,
//           // label: fetchedData.label,
//           events: fetchedData.events,
//           notify: fetchedData.notify,
//           addSnapshotSuccess: fetchedData.addSnapshotSuccess,
//           addSnapshotFailure: fetchedData.addSnapshotFailure,
//           createSnapshot: fetchedData.createSnapshot,
//           // createSnapshots: fetchedData.createSnapshots,
//           createSnapshotSuccess: fetchedData.createSnapshotSuccess,
//           createSnapshotFailure: fetchedData.createSnapshotFailure,
//           onSnapshot: fetchedData.onSnapshot,
//           onSnapshots: fetchedData.onSnapshots,
//           handleActions: fetchedData.handleActions,
//           findIndex: fetchedData.findIndex,
//           splice: fetchedData.splice,
//           key: "",
//           keys: [],
//           date: undefined,
//           config: null,
//           title: "",
//           message: undefined,
//           timestamp: undefined,
//           createdBy: "",
//           type: undefined,
//           subscribers: [],
//           store: undefined,
//           stores: null,
//           snapshotConfig: undefined,
//           snapshotMethods: undefined,
//           getSnapshotsBySubscriber: undefined,
//           getSnapshotsBySubscriberSuccess: undefined,
//           getSnapshotsByTopic: undefined,
//           getSnapshotsByTopicSuccess: undefined,
//           getSnapshotsByCategory: undefined,
//           getSnapshotsByCategorySuccess: undefined,
//           getSnapshotsByKey: undefined,
//           getSnapshotsByKeySuccess: undefined,
//           getSnapshotsByPriority: undefined,
//           getSnapshotsByPrioritySuccess: undefined,
//           getStoreData: undefined,
//           updateStoreData: undefined,
//           updateDelegate: undefined,
//           getSnapshotContainer: undefined,
//           getSnapshotVersions: undefined,
//           deleteSnapshot: undefined,
//           getSnapshotItems: fetchedData.getSnapshotItems,
//           dataStore: undefined,
//           snapshotStores: undefined,
//           initialState: undefined,
//           snapshotItems: [],
//           nestedStores: [],
//           snapshotIds: [],
//           dataStoreMethods: undefined,
//           delegate: undefined,
//           findSnapshotStoreById: fetchedData.findSnapshotStoreById,
//           saveSnapshotStore: fetchedData.saveSnapshotStore,
//           subscriberId: undefined,
//           length: undefined,
//           content: undefined,
//           value: null,
//           todoSnapshotId: undefined,
//           storeId: 0,
//           handleSnapshotOperation: fetchedData.handleSnapshotOperation,
//           getCustomStore: fetchedData.getCustomStore,
//           addSCustomStore: fetchedData.addSCustomStore,
//           getDataStore: fetchedData.getDataStore,
//           addSnapshotToStore: fetchedData.addSnapshotToStore,
//           addSnapshotItem: fetchedData.addSnapshotItem,
//           addNestedStore: fetchedData.addNestedStore,
//           defaultSubscribeToSnapshots: fetchedData.defaultSubscribeToSnapshots,
//           defaultCreateSnapshotStores: fetchedData.defaultCreateSnapshotStores,
//           createSnapshotStores: fetchedData.createSnapshotStores,
//           subscribeToSnapshot: fetchedData.subscribeToSnapshot,
//           defaultOnSnapshots: fetchedData.defaultOnSnapshots,
//           transformSubscriber: fetchedData.transformSubscriber,
//           isSnapshotStoreConfig: fetchedData.isSnapshotStoreConfig,
//           transformDelegate: fetchedData.transformDelegate,
//           initializedState: undefined,
//           transformedDelegate: [],
//           getSnapshotIds: [],
//           getNestedStores: [],
//           getFindSnapshotStoreById: undefined,
//           addDataStatus: fetchedData.addDataStatus,
//           updateDataTitle: fetchedData.updateDataTitle,
//           updateDataDescription: fetchedData.updateDataDescription,
//           updateDataStatus: fetchedData.updateDataStatus,
//           addDataSuccess: fetchedData.addDataSuccess,
//           getDataVersions: fetchedData.getDataVersions,
//           updateDataVersions: fetchedData.updateDataVersions,
//           fetchData: fetchedData.fetchData,
//           defaultSubscribeToSnapshot: fetchedData.defaultSubscribeToSnapshot,
//           handleSubscribeToSnapshot: fetchedData.handleSubscribeToSnapshot,
//           snapshot: fetchedData.snapshot,
//           removeItem: fetchedData.removeItem,
//           getSnapshot: fetchedData.getSnapshot,
//           getSnapshotSuccess: fetchedData.getSnapshotSuccess,
//           getSnapshotArray: fetchedData.getSnapshotArray,
//           getItem: fetchedData.getItem,
//           setItem: fetchedData.setItem,
//           deepCompare: fetchedData.deepCompare,
//           shallowCompare: fetchedData.shallowCompare,
//           getDataStoreMethods: fetchedData.getDataStoreMethods,
//           getDelegate: fetchedData.getDelegate,
//           determineCategory: fetchedData.determineCategory,
//           determineSnapshotStoreCategory:
//             fetchedData.determineSnapshotStoreCategory,
//           determinePrefix: fetchedData.determinePrefix,
//           updateSnapshotSuccess: fetchedData.updateSnapshotSuccess,
//           updateSnapshotFailure: fetchedData.updateSnapshotFailure,
//           createInitSnapshot: fetchedData.createInitSnapshot,
//           clearSnapshotSuccess: fetchedData.clearSnapshotSuccess,
//           clearSnapshotFailure: fetchedData.clearSnapshotFailure,
//           setSnapshotSuccess: fetchedData.setSnapshotSuccess,
//           setSnapshotFailure: fetchedData.setSnapshotFailure,
//           updateSnapshots: fetchedData.updateSnapshots,
//           updateSnapshotsSuccess: fetchedData.updateSnapshotsSuccess,
//           updateSnapshotsFailure: fetchedData.updateSnapshotsFailure,
//           takeSnapshotSuccess: fetchedData.takeSnapshotSuccess,
//           takeSnapshotsSuccess: fetchedData.takeSnapshotsSuccess,
//           transformSnapshotConfig: fetchedData.transformSnapshotConfig,
//           setSnapshotData: fetchedData.setSnapshotData,
//           setSnapshots: fetchedData.setSnapshots,
//           clearSnapshot: fetchedData.clearSnapshot,
//           mapSnapshotsAO: fetchedData.mapSnapshotsAO,
//           getSubscribers: fetchedData.getSubscribers,
//           subscribe: fetchedData.subscribe,
//           fetchSnapshotSuccess: fetchedData.fetchSnapshotSuccess,
//           fetchSnapshotFailure: fetchedData.fetchSnapshotFailure,
//           getSnapshots: fetchedData.getSnapshots,
//           getSnapshotStoreData: fetchedData.getSnapshotStoreData,
//           generateId: fetchedData.generateId,
//           [Symbol.iterator]: data[Symbol.iterator],
//         };
//         resolve(fetchedSnapshotStore); // Resolve with the snapshot store
//       })
//       .catch((error) => {
//         reject(error); // Reject in case of error
//       });
//   });
// }
