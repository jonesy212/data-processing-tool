// convertSnapshotsArray.ts

import { T } from ".";
import { BaseData, Data } from "../models/data/Data";
import { Snapshot, SnapshotsArray } from "./LocalStorageSnapshotStore";
import SnapshotStore from "./SnapshotStore";

// Utility function to convert Snapshot<BaseData, T>[] to Snapshots<T>
function convertSnapshotsArray<T extends Data, K extends Data>(snapshotsArray: Snapshot<T, K>[]): SnapshotsArray<T> {
    return snapshotsArray.map((snapshot) => {
      // Assuming a conversion mechanism to match the type Snapshot<T, K>
      const convertedSnapshot: Snapshot<T, K> = {
        ...snapshot,
        data: snapshot.data as T, // Cast the data to T
        snapshots: snapshot.snapshots as SnapshotsArray<T>,
        compareSnapshotState: snapshot.compareSnapshotState,
        eventRecords: snapshot.eventRecords,
        // Add any other necessary properties or conversions here
      };
      return convertedSnapshot;
    }) as SnapshotsArray<T>;
  }
  
  // Example usage of the conversion function
  const filteredSnapshots: Snapshot<T, BaseData>[] = [/* your snapshots array */];
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
      
    };
  };
  