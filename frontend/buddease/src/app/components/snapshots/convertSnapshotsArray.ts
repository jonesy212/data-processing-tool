import { SnapshotData } from '@/app/components/snapshots';

// convertSnapshotsArray.ts

import { useSnapshotManager } from '../hooks/useSnapshotManager';
import { BaseData, Data } from "../models/data/Data";
import { K, T } from "../models/data/dataStoreMethods";
import useSecureStoreId from '../utils/useSecureStoreId';
import { Snapshot, SnapshotsArray } from "./LocalStorageSnapshotStore";
import SnapshotStore from "./SnapshotStore";

// Utility function to convert Snapshot<BaseData, T>[] to Snapshots<T, Meta>
function convertSnapshotsArray<T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T>(
  snapshotsArray: Snapshot<T, Meta, K>[]
): SnapshotsArray<T, Meta> {
    return snapshotsArray.map((snapshot) => {
      const convertedSnapshot: Snapshot<T, Meta, K> = {
        ...snapshot,
        data: snapshot.data as T,
        snapshots: snapshot.snapshots as SnapshotsArray<T, Meta>,
        compareSnapshotState: snapshot.compareSnapshotState,
        eventRecords: snapshot.eventRecords,
      };
      return convertedSnapshot;
    }) as unknown as SnapshotsArray<T, Meta>;
  }
  
  // Example usage of the conversion function
  const filteredSnapshots: Snapshot<T, Meta, K>[] = [/* your snapshots array */];
  const convertedSnapshots: SnapshotsArray<T, Meta> = convertSnapshotsArray<T, Meta, BaseData>(filteredSnapshots);
  
  const storeId = useSecureStoreId()
  if(!storeId){
    throw new Error("storeId is not defined");
  }
  const { snapshotManager, snapshotStore} = await useSnapshotManager<Data, Data>(storeId);
  
  
  if (!snapshotStore) {
    throw new Error("snapshotStore is not available");
  }
    
  // Assuming that you want to use snapshotManager or snapshotStore to derive config
  const config = snapshotManager ? snapshotManager.config : snapshotStore.getConfig();

  const convertMapToSnapshotData = (map: Map<string, Snapshot<T, Meta, K>>): SnapshotData<T, Meta, K> => {
    
    const configPromise = config instanceof Promise
    ? config // If config is already a promise, use it directly
    : Promise.resolve(config ? config : null); // Otherwise, wrap it in a Promise
    
    // Convert the map to a format that satisfies the SnapshotData<T, Meta, K> type
    return {
      storeId: storeId,
      config: configPromise,
      isExpired: () => false, 
      subscribers: [], 
      snapshots: Array.from(map.values()), 
      snapshotStore, data, timestamp, setSnapshotCategory,
      
      // Add other required properties here...
    };
  };

  // Now use the converted snapshots in your createDefaultSnapshot function
  const createDefaultSnapshot = (snapshotStore: SnapshotStore<BaseData, Meta, K>): Snapshot<BaseData, Meta, K> => {
    return {
      ...snapshotStore,
      data: snapshotStore.data,
      snapshots: convertedSnapshots,
      compareSnapshotState: snapshotStore.compareSnapshotState,
      eventRecords: snapshotStore.eventRecords || null,
      isCore: snapshotStore.isCore,
      initialConfig: snapshotStore.initialConfig,
      removeSubscriber: snapshotStore.removeSubscriber,
      onInitialize: snapshotStore.onInitialize,
      onError: snapshotStore.onError,
      taskIdToAssign: snapshotStore.taskIdToAssign,
      setCategory: snapshotStore.setCategory,
      applyStoreConfig: snapshotStore.applyStoreConfig,
      generateId: snapshotStore.generateId,
      snapshotStoreData: snapshotStore.snapshotStoreData,
      getSnapshotItems: snapshotStore.getSnapshotItems,
      defaultSubscribeToSnapshots: snapshotStore.defaultSubscribeToSnapshots,
      schema: snapshotStore.getSchema(),
      currentCategory: snapshotStore.currentCategory,
      mappedSnapshotData: snapshotStore.mappedSnapshotData,
      notify: snapshotStore.notify,
      notifySubscribers: snapshotStore.notifySubscribers,
      getAllSnapshots: snapshotStore.getAllSnapshots,
      getSubscribers: snapshotStore.getSubscribers,
      versionInfo: snapshotStore.versionInfo,
      
      transformSubscriber: snapshotStore.transformSubscriber,
      transformDelegate: snapshotStore.transformedDelegate,
      initializedState: snapshotStore.initializedState,
      getAllKeys: snapshotStore.getAllKeys,
      getAllValues: snapshotStore.getAllValues,
      getAllItems: snapshotStore.getAllItems,
      getSnapshotEntries: snapshotStore.getSnapshotEntries,
      getAllSnapshotEntries: snapshotStore.getAllSnapshotEntries,
      addDataStatus: snapshotStore.addDataStatus,
      removeData: snapshotStore.removeData,
      updateData: snapshotStore.updateData,
      updateDataTitle: snapshotStore.updateDataTitle,
      
      updateDataDescription: snapshotStore.updateDataDescription,
      updateDataStatus: snapshotStore.updateDataStatus,
      addDataSuccess: snapshotStore.addDataSuccess,
      getDataVersions: snapshotStore.getDataVersions,
      updateDataVersions: snapshotStore.updateDataVersions,
      getBackendVersion: snapshotStore.getBackendVersion,
      getFrontendVersion: snapshotStore.getFrontendVersion,
      fetchData: snapshotStore.fetchData,
      defaultSubscribeToSnapshot: snapshotStore.defaultSubscribeToSnapshot,
      handleSubscribeToSnapshot: snapshotStore.handleSubscribeToSnapshot,
      removeItem: snapshotStore.removeItem,
      getSnapshot: snapshotStore.getSnapshot,
      
      getSnapshotSuccess: snapshotStore.getSnapshotSuccess,
      setItem: snapshotStore.setItem,
      getItem: snapshotStore.getItem,
      getDataStore: snapshotStore.getDataStore,
      addSnapshotSuccess: snapshotStore.addSnapshotSuccess,
      deepCompare: snapshotStore.deepCompare,
      shallowCompare: snapshotStore.shallowCompare,
      getDataStoreMethods: snapshotStore.getDataStoreMethods,
      getDelegate: snapshotStore.getDelegate,
      determineCategory: snapshotStore.determineCategory,
      determinePrefix: snapshotStore.determinePrefix,
      removeSnapshot: snapshotStore.removeSnapshot,
      addSnapshotItem: snapshotStore.addSnapshotItem,
      addNestedStore: snapshotStore.addNestedStore,
      clearSnapshots: snapshotStore.clearSnapshots,
      addSnapshot: snapshotStore.addSnapshot,
     
    };
  };  

  export { convertMapToSnapshotData, createDefaultSnapshot };
