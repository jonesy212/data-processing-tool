// Function to add or update a snapshot in the map

import { BaseData } from '@/app/components/models/data/Data';
import { SnapshotData } from '@/app/components/snapshots';
import { UnifiedMetaDataOptions } from "@/app/configs/database/MetaDataOptions";
import { StructuredMetadata } from "@/app/configs/StructuredMetadata";
import { CategoryProperties } from "@/app/pages/personas/ScenarioBuilder";
import { Category } from "../libraries/categories/generateCategoryProperties";
import { DataStoreMethods } from "../projects/DataAnalysisPhase/DataProcessing/ DataStoreMethods";
import { DataStore } from "../projects/DataAnalysisPhase/DataProcessing/DataStore";
import { Subscription } from "../subscriptions/Subscription";
import { Snapshot } from "./LocalStorageSnapshotStore";
import { SnapshotConfig } from "./SnapshotConfig";
import { SnapshotContainer } from "./SnapshotContainer";
import SnapshotStore from "./SnapshotStore";
import { SnapshotStoreConfig } from "./SnapshotStoreConfig";
import { SnapshotStoreProps } from "./useSnapshotStore";

// Function to remove a snapshot from the map
function removeSnapshotFromMap<T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(
  map: Map<string, Snapshot<T, K>>,
  key: string
): Map<string, Snapshot<T, K>> {
  map.delete(key);
  return map;
}

// Function to get a snapshot from the map
function getSnapshotFromMap<T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(
  map: Map<string, Snapshot<T, K>>,
  key: string
): Snapshot<T, K> | undefined {
  return map.get(key);
}


// Implementation of the getSnapshot method
function getSnapshot<T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(
  this: SnapshotContainer<T, K>
): Snapshot<T, K> | null {
  return convertSnapshotContainer(this.snapshotContainer);
}

// Function to batch update multiple snapshots
function batchUpdateSnapshots<T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(
  existingMap: Map<string, Snapshot<T, K>>,
  updates: Map<string, Snapshot<T, K>>
): Map<string, Snapshot<T, K>> {
  // Use the spread operator to merge existing map with updates
  return new Map([...existingMap, ...updates]);
}

// Function to validate a snapshot before adding or updating
function validateSnapshot<T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(snapshot: Snapshot<T, K>): boolean {
  // Implement validation logic here (e.g., check for required fields)
  return snapshot.id !== undefined && snapshot.data !== undefined;
}

// Function to safely update snapshots
function safeUpdateSnapshots<T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(
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
const existingSnapshots = new Map<string, Snapshot<any, any>>();
// Populate existingSnapshots with initial data

const updates = new Map<string, Snapshot<any, any>>();
// Populate updates with new or modified data

const updatedSnapshots = batchUpdateSnapshots(existingSnapshots, updates);

const snapshotsMap = new Map<string, Snapshot<any, any>>();
// Populate snapshotsMap with initial data

const newSnapshot: Snapshot<any, any> = {
  ...snapshot,
  // Include necessary fields here
};

safeUpdateSnapshots(snapshotsMap, 'newKey', newSnapshot);
 


// #review 
/**
 * Adds or updates a snapshot in the given map.
 * @param map - The existing map of snapshots.
 * @param key - The key for the snapshot to add or update.
 * @param snapshot - The snapshot to add or update.
 * @returns A new map with the added or updated snapshot.
 */
function updateSnapshotMap<T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(
  map: Map<string, Snapshot<T, K>>,
  key: string,
  snapshot: Snapshot<T, K>
): Map<string, Snapshot<T, K>> {
  map.set(key, snapshot);
  return map;
}

function isSnapshotFunction<T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(
  snapshot: any
): snapshot is (
  id: string | number | undefined,
  snapshotId: string | null,
  snapshotData: SnapshotData<T, K>,
  category: Category,
  categoryProperties: CategoryProperties | undefined,
  callback: (snapshotStore: SnapshotStore<T, K> | null) => void,
  dataStore: DataStore<T, K>,
  dataStoreMethods: DataStoreMethods<T, K>,
  metadata: UnifiedMetaDataOptions<T, K, Meta, ExcludedFields>,
  subscriberId: string,
  endpointCategory: string | number,
  storeProps: SnapshotStoreProps<T, K>,
  snapshotConfigData: SnapshotConfig<T, K>,
  subscription: Subscription<T, K>,
  snapshotStoreConfigData?: SnapshotStoreConfig<T, K>,
  snapshotContainer?: SnapshotContainer<T, K>
) => Promise<{ snapshot: Snapshot<T, K> }> {
  return typeof snapshot === "function";
}


export { getSnapshot, isSnapshotFunction, updateSnapshotMap };

