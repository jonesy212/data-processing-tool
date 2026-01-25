// SnapshotContext.tsx
import type { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import type { Attachment } from '@/core/documents/attachment/Attachment';
import useSecureStoreId from "@/core/hooks/useSecureStoreId";
import { useSnapshotManager } from "@/core/hooks/useSnapshotManager";
import { Category } from "@/core/libraries/categories/generateCategoryProperties";
import { createSnapshot } from '@/core/snapshots/createSnapshot';
import type { Snapshot } from '@/core/snapshots/Snapshot';
import { SnapshotData } from '@/core/snapshots/SnapshotData';
import { fetchSnapshot } from '@/core/snapshots/snapshotHandlers';
import { storeProps } from '@/core/snapshots/SnapshotStoreProps';
import type { useDataStore } from '@/core/state/stores/DataStore';
import { SubscriberCollection } from '@/core/subscribers/SubscriberCollection';
import { addToSnapshotList } from '@/utils/snapshotUtils';
import { createContext, ReactNode, useContext, useMemo, useState } from "react";
;

const fetchSnapshotFromAPI = async <  
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(id: string): Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> => {
  try {
    const response = await fetch(`/api/snapshots/${id}`);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    return data
  } catch (error) {
    console.error("Error fetching snapshot:", error);
    throw error;
  }
};

export interface SnapshotContextType<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {
  snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null;
  snapshots: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
  
  // Make createSnapshot return Promise
  createSnapshot: (
    id: string,
    snapshotData: SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    category: string
  ) => Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>;
  
  // Keep the correct return type with both snapshot and subscribers
  fetchSnapshot: (
    id: string
  ) => Promise<{
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
    subscribers: SubscriberCollection<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  }>;
  
  snapshotMap: Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>;
  setSnapshot: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null) => void;
  setSnapshots: (snapshots: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]) => void;
}


// Create the context with default values
export const SnapshotContext = createContext<
  SnapshotContextType<any, any, any, any, any, any> | undefined
>(undefined);

export const SnapshotProvider = <
  T extends BaseDataEntity = BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>({
  children,
}: {
  children: ReactNode;
}) => {
  const [snapshot, setSnapshot] = useState<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null>(null);
  const [snapshots, setSnapshots] = useState<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>([]);

  // Initialize the snapshotMap
  const snapshotMap = useMemo(() => {
    const map = new Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>();
    
    if (!snapshots || snapshots.length === 0) {
      return map;
    }
    
    snapshots.forEach((snapshot) => {
      if (snapshot.id !== undefined) {
        map.set(snapshot.id?.toString() ?? 'undefined-id', snapshot);
      }
    });
    
    return map;
  }, [snapshots]);

  // Create snapshot function
  const createNewSnapshot = async (
    id: string,
    snapshotData: SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    category: string
  ): Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> => {
    try {

      const secureStoreResult = useSecureStoreId();
      
      // Extract just the storeId number from the result object
      const storeId = secureStoreResult.storeId;
      
      if (storeId === null) {
        throw new Error("Store id is null");
      }
      
      // Create a default baseMeta Map as required by the function
      const baseMeta = new Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>();
      
      // Create a default snapshotStore
      const snapshotStore = await useSnapshotStore(addToSnapshotList, storeProps)
      
      // Create a default snapshotManager
      const snapshotManager = await useSnapshotManager(storeId, storeProps);
      
      // Create a default snapshotStoreConfig      
      const snapshotStoreConfig = useDataStore().snapshotStoreConfig
      
      // Call createSnapshot with ALL required parameters
      const newSnapshot = await createSnapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>(
        snapshotData.data, // baseData (parameter 1)
        baseMeta, // baseMeta (parameter 2) - Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>
        id, // snapshotId (parameter 3)
        snapshotStore, // snapshotStore (parameter 4)
        snapshotManager, // snapshotManager (parameter 5)
        snapshotStoreConfig, // snapshotStoreConfig (parameter 6)
        false, // isSubscribed (parameter 7) - optional
        category as Category, // category (parameter 8) - optional
        undefined, // storeProps (parameter 9) - optional
        undefined, // storeOptions (parameter 10) - optional
        undefined, // categoryProperties (parameter 11) - optional
        undefined, // dataStore (parameter 12) - optional
        undefined, // dataStoreMethods (parameter 13) - optional
        snapshotData.metadata as Meta, // metadata (parameter 14) - optional
        undefined, // subscriberId (parameter 15) - optional
        undefined, // endpointCategory (parameter 16) - optional
        undefined, // subscription (parameter 17) - optional
        undefined, // snapshotConfigData (parameter 18) - optional
        undefined // snapshotContainer (parameter 19) - optional
      );
      
      setSnapshots(prev => [...prev, newSnapshot]);
      return newSnapshot;
    } catch (error: any) {
      console.error('Error creating snapshot:', error);
      throw new Error(`Failed to create snapshot: ${error.message}`);
    }
  };

  // Working fetch snapshot implementation
  const fetchSnapshotFromAPI = async (
    id: string,
    options: {
      category?: Category;
      subscriberCallback?: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;
    } = {}
  ): Promise<{
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
    subscribers: SubscriberCollection<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  }> => {
    try {
      // Create baseMeta object (this was the missing parameter!)
      const baseMeta = {
        id: `meta-${id}`,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system',
        version: '1.0.0',
        status: 'active'
      };
      
      // Call the original fetchSnapshot with all required parameters
      const result = await (fetchSnapshot as any)(
        id, // snapshotId
        {
          storeId: 1,
          category: options.category,
          timestamp: new Date(),
          additionalHeaders: {},
          subscriberCallback: options.subscriberCallback
        },
        undefined, // payload
        undefined, // snapshotStore
        undefined, // payloadData
        undefined, // categoryProperties
        new Date(), // timestamp
        {} as T, // data
        [] as any[], // delegate
        options.category, // category
        undefined, // snapshotContainer
        undefined, // snapshotStoreConfig
        baseMeta, // baseMeta - THIS WAS MISSING!
        undefined, // parentSnapshot
        undefined, // parentSnapshotStore
        undefined, // content
        undefined, // snapshotCategory
        undefined // subscriberId
      );
      
      return {
        snapshot: result.snapshot,
        subscribers: result.subscribers
      };
    } catch (error) {
      console.error("Error fetching snapshot:", error);
      throw error;
    }
  };

  // Context value
  const contextValue = useMemo(() => ({
    snapshot,
    snapshots,
    snapshotMap,
    createSnapshot: createNewSnapshot,
    fetchSnapshot: (id: string) => fetchSnapshotFromAPI(id, {}),
    setSnapshot,
    setSnapshots,
  }), [snapshot, snapshots, snapshotMap]) as SnapshotContextType<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;

  return (
    <SnapshotContext.Provider value={contextValue}>
      {children}
    </SnapshotContext.Provider>
  );
};

// Custom hook to use the SnapshotContext
export const useSnapshot = <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(): { snapshotMap: Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> } => {
  const context = useContext(SnapshotContext);

  if (!context) {
    throw new Error("useSnapshot must be used within a SnapshotProvider");
  }

  return {
    snapshotMap: context.snapshotMap as Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
  };
};





// function fetchSnapshotFromAPI<
//   T extends BaseDataEntity,
//   K extends T = T,
//   Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
//   AttachmentType extends Attachment = Attachment,
//   ExcludedFields extends keyof T = DefaultExcludedFields<T>,
//   IncludedFields extends keyof T = keyof T
// >(
//   id: string
// ): Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> {
//   return new Promise((resolve, reject) => {
//     // Wrapping async logic in a Promise
//     fetch(`/api/snapshots/${id}`)
//       .then((response) => {
//         if (!response.ok) {
//           throw new Error(
//             `Failed to fetch snapshot with ID: ${id}. Status: ${response.status}`
//           );
//         }
//       })
//       .then((data) => {
        
//       // Use type assertion to ensure the data fits the expected structure
//       const fetchedData = data as FetchedSnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;

//         // Ensure the data fits the Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> type
//         const fetchedSnapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = {
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

// function fetchSnapshotStoreFromAPI<
//   T extends BaseDataEntity,
//   K extends T = T,
//   Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
//   AttachmentType extends Attachment = Attachment,
//   ExcludedFields extends keyof T = DefaultExcludedFields<T>,
//   IncludedFields extends keyof T = keyof T>(
//   id: string
// ): Promise<SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> {
//   return new Promise((resolve, reject) => {
//     // Wrapping async logic in a Promise
//     fetch(`/api/snapshotStores/${id}`)
//       .then((response) => {
//         if (!response.ok) {
//           throw new Error(
//             `Failed to fetch snapshot store with ID: ${id}. Status: ${response.status}`
//           );
//         }
//       })
//       .then((data) => {
//         // Use type assertion to ensure the data fits the expected structure
//         const fetchedData = data as FetchedSnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;

//         // Ensure the data fits the SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> type
//         const fetchedSnapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = {
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




