import { snapshot } from '.';
// Function to add or update a snapshot in the map

import { Snapshot } from "./LocalStorageSnapshotStore";
import { T, K } from "./SnapshotConfig";

// Function to remove a snapshot from the map
function removeSnapshotFromMap(
  map: Map<string, Snapshot<T, K>>,
  key: string
): Map<string, Snapshot<T, K>> {
  map.delete(key);
  return map;
}

// Function to get a snapshot from the map
function getSnapshotFromMap(
  map: Map<string, Snapshot<T, K>>,
  key: string
): Snapshot<T, K> | undefined {
  return map.get(key);
}


// Function to batch update multiple snapshots
function batchUpdateSnapshots(
  existingMap: Map<string, Snapshot<T, K>>,
  updates: Map<string, Snapshot<T, K>>
): Map<string, Snapshot<T, K>> {
  // Use the spread operator to merge existing map with updates
  return new Map([...existingMap, ...updates]);
}


// Function to validate a snapshot before adding or updating
function validateSnapshot(snapshot: Snapshot<T, K>): boolean {
  // Implement validation logic here (e.g., check for required fields)
  return snapshot.id !== undefined && snapshot.data !== undefined;
}

// Function to safely update snapshots
function safeUpdateSnapshots(
  map: Map<string, Snapshot<T, K>>,
  key: string,
  snapshot: Snapshot<T, K>
): Map<string, Snapshot<T, K>> {
  if (validateSnapshot(snapshot)) {
    map.set(key, snapshot);
  } else {
    console.error(`Invalid snapshot data for key: ${key}`);
  }
  return map;
}



// Example usage
const existingSnapshots = new Map<string, Snapshot<T, K>>();
// Populate existingSnapshots with initial data

const updates = new Map<string, Snapshot<T, K>>();
// Populate updates with new or modified data

const updatedSnapshots = batchUpdateSnapshots(existingSnapshots, updates);



// Example usage
const snapshotsMap = new Map<string, Snapshot<T, K>>();
// Populate snapshotsMap with initial data

const newSnapshot: Snapshot<T, K> = {
  ...snapshot,

}
safeUpdateSnapshots(snapshotsMap, 'newKey', newSnapshot);
// #review 
/**
 * Adds or updates a snapshot in the given map.
 * @param map - The existing map of snapshots.
 * @param key - The key for the snapshot to add or update.
 * @param snapshot - The snapshot to add or update.
 * @returns A new map with the added or updated snapshot.
 */
function updateSnapshotMap(
  map: Map<string, Snapshot<T, K>>,
  key: string,
  snapshot: Snapshot<T, K>
): Map<string, Snapshot<T, K>> {
  map.set(key, snapshot);
  return map;
}
