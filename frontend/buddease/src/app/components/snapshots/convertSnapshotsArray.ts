
// convertSnapshotsArray.ts

import { BaseData, Data } from "../models/data/Data";
import { K, T } from "../models/data/dataStoreMethods";
import { Snapshot, SnapshotsArray } from "./LocalStorageSnapshotStore";
import SnapshotStore from "./SnapshotStore";

// Utility function to convert Snapshot<BaseData, T>[] to Snapshots<T>
function convertSnapshotsArray<T extends Data, K extends Data>(
  snapshotsArray: Snapshot<T, K>[]
): SnapshotsArray<T> {
    return snapshotsArray.map((snapshot) => {
      const convertedSnapshot: Snapshot<T, K> = {
        ...snapshot,
        data: snapshot.data as T,
        snapshots: snapshot.snapshots as SnapshotsArray<T>,
        compareSnapshotState: snapshot.compareSnapshotState,
        eventRecords: snapshot.eventRecords,
      };
      return convertedSnapshot;
    }) as unknown as SnapshotsArray<T>;
  }
  
  // Example usage of the conversion function
  const filteredSnapshots: Snapshot<T, K>[] = [/* your snapshots array */];
  const convertedSnapshots: SnapshotsArray<T> = convertSnapshotsArray<T, BaseData>(filteredSnapshots);
  
  // Now use the converted snapshots in your createDefaultSnapshot function
  const createDefaultSnapshot = (snapshot: SnapshotStore<BaseData, K>): Snapshot<BaseData, K> => {
    return {
      ...snapshot,
      data: snapshot.data,
      snapshots: convertedSnapshots,
      compareSnapshotState: snapshot.compareSnapshotState,
      eventRecords: snapshot.eventRecords || null,
      isCore: snapshot.isCore,
      initialConfig: snapshot.initialConfig,
      removeSubscriber: snapshot.removeSubscriber,
      onInitialize: snapshot.onInitialize,
      onError: snapshot.onError,
      taskIdToAssign: snapshot.taskIdToAssign,
      setCategory: snapshot.setCategory,
      applyStoreConfig: snapshot.applyStoreConfig,
      generateId: snapshot.generateId,
      snapshotData: snapshot.snapshotData,
      getSnapshotItems: snapshot.getSnapshotItems,
      defaultSubscribeToSnapshots: snapshot.defaultSubscribeToSnapshots,
      schema: snapshot.schema,
      currentCategory: snapshot.currentCategory,
      mappedSnapshotData: snapshot.mappedSnapshotData,
      notify: snapshot.notify,
      notifySubscribers: snapshot.notifySubscribers,
      getAllSnapshots: snapshot.getAllSnapshots,
      getSubscribers: snapshot.getSubscribers,
      versionInfo: snapshot.versionInfo,
      
      transformSubscriber: snapshot.transformSubscriber,
      transformDelegate: snapshot.transformDelegate,
      initializedState: snapshot.initializedState,
      getAllKeys: snapshot.getAllKeys,
      getAllValues: snapshot.getAllValues,
      getAllItems: snapshot.getAllItems,
      getSnapshotEntries: snapshot.getSnapshotEntries,
      getAllSnapshotEntries: snapshot.getAllSnapshotEntries,
      addDataStatus: snapshot.addDataStatus,
      removeData: snapshot.removeData,
      updateData: snapshot.updateData,
      updateDataTitle: snapshot.updateDataTitle,
      
      updateDataDescription: snapshot.updateDataDescription,
      updateDataStatus: snapshot.updateDataStatus,
      addDataSuccess: snapshot.addDataSuccess,
      getDataVersions: snapshot.getDataVersions,
      updateDataVersions: snapshot.updateDataVersions,
      getBackendVersion: snapshot.getBackendVersion,
      getFrontendVersion: snapshot.getFrontendVersion,
      fetchData: snapshot.fetchData,
      defaultSubscribeToSnapshot: snapshot.defaultSubscribeToSnapshot,
      handleSubscribeToSnapshot: snapshot.handleSubscribeToSnapshot,
      removeItem: snapshot.removeItem,
      getSnapshot: snapshot.getSnapshot,
      
      getSnapshotSuccess: snapshot.getSnapshotSuccess,
      setItem: snapshot.setItem,
      getItem: snapshot.getItem,
      getDataStore: snapshot.getDataStore,
      addSnapshotSuccess: snapshot.addSnapshotSuccess,
      deepCompare: snapshot.deepCompare,
      shallowCompare: snapshot.shallowCompare,
      getDataStoreMethods: snapshot.getDataStoreMethods,
      getDelegate: snapshot.getDelegate,
      determineCategory: snapshot.determineCategory,
      determinePrefix: snapshot.determinePrefix,
      removeSnapshot: snapshot.removeSnapshot,
      addSnapshotItem: snapshot.addSnapshotItem,
      addNestedStore: snapshot.addNestedStore,
      clearSnapshots: snapshot.clearSnapshots,
      addSnapshot: snapshot.addSnapshot,
     
    };
  };
  