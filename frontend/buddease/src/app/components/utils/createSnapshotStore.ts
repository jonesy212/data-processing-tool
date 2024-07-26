import { CategoryProperties } from "./../../pages/personas/ScenarioBuilder";
import { BaseData } from "../models/data/Data";
import { SnapshotStoreConfig } from "../snapshots/SnapshotConfig";
import { Snapshot } from "../snapshots/LocalStorageSnapshotStore";
import SnapshotStore from "../snapshots/SnapshotStore";

// createSnapshotStore.ts
function createSnapshotStore<T extends BaseData, K extends BaseData>(
  id: string,
  snapshotData: SnapshotStoreConfig<T, K>,
  category?: string | CategoryProperties,
  callback?: (snapshotStore: SnapshotStore<T, K>) => void
): Snapshot<T, K> | null {
  // Validate inputs
  if (!id || !snapshotData) {
    console.error('Invalid arguments provided to createSnapshotStore');
    return null;
  }

  // Create a new SnapshotStore instance
  const snapshotStore: SnapshotStore<T, K> = {
    id: id,
    data: snapshotData.initialState || {} as Map<string, T>, // Initialize with given state or empty
    category: category ?? 'default-category',
    // Initialize other properties if needed
    // Provide implementation for methods if necessary
    // ...
  };

  // Call the provided callback if it exists
  if (callback) {
    callback(snapshotStore);
  }

  // Return the Snapshot instance
  return {
    id: snapshotStore.id,
    data: snapshotStore.data,
    category: snapshotStore.category,
    store: snapshotStore,
    // Initialize other properties if needed
    // ...
  };
}
