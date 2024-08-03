import { CategoryProperties } from "@/app/pages/personas/ScenarioBuilder";
import { SnapshotManager } from "../hooks/useSnapshotManager";
import { Data } from "../models/data/Data";
import { CreateSnapshotStoresPayload, Snapshot } from "./LocalStorageSnapshotStore";
import { SnapshotConfig } from "./snapshot";

// createSnapshots.ts
const createSnapshots = <T extends Data, K extends Data = T>(
    id: string,
    snapshotId: string,
    snapshot: Snapshot<T, K>,
    snapshotManager: SnapshotManager<T, K>,
    payload: CreateSnapshotStoresPayload<T, K>,
    callback: (snapshots: Snapshot<T, K>[]) => void | null,
    snapshotDataConfig?: SnapshotConfig<T, K>[],
    category?: string | CategoryProperties
  ): Snapshot<T, K>[] | null => {
    const { data, events, dataItems, newData } = payload;
    
    // Example logic to create multiple snapshots
    const snapshots: Snapshot<T, K>[] = [];
  
    data.forEach((snapshotData, key) => {
      const newSnapshot: Snapshot<T, K> = {
        ...snapshot,
        id: key,
        data: snapshotData,
        eventRecords: events[key] || null,
        newData: newData,
        dataItems: dataItems,
        // ... set other required properties
      };
      
      snapshots.push(newSnapshot);
    });
  
    // Call the callback function with the created snapshots
    if (callback) {
      callback(snapshots);
    }
  
    return snapshots.length > 0 ? snapshots : null;
  };
  