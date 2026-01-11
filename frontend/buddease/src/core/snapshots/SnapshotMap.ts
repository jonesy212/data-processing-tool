// SnapshotMap.ts
// Function to add or update a snapshot in the map
import type { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import type { UnifiedMetadata } from "@/core/config/MetaDataOptions";
import type { Attachment } from '@/core/documents/attachment/Attachment';
import { Category } from "@/core/libraries/categories/generateCategoryProperties";
import { CategoryProperties } from "@/core/pages/personas/ScenarioBuilder";
import type { DataStoreMethods } from "@/core/projects/DataAnalysisPhase/DataProcessing/DataStoreMethods";
import { Snapshot, SnapshotData } from '@/core/snapshots/Snapshot';
import { SnapshotConfig } from "@/core/snapshots/SnapshotConfig";
import { SnapshotContainer } from '@/core/snapshots/SnapshotContainer';
import { SnapshotStoreConfig } from "@/core/snapshots/SnapshotStoreConfig";
import { SnapshotStoreProps } from "@/core/snapshots/SnapshotStoreProps";
import type { DataStore } from "@/core/state/stores/DataStore";
import { Subscription } from "@/core/subscriptions/Subscription";
import SnapshotStore from "./SnapshotStore";

// Function to remove a snapshot from the map
function removeSnapshotFromMap<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  map: Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
  key: string
): Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> {
  map.delete(key);
  return map;
}

// Function to get a snapshot from the map
function getSnapshotFromMap<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T>(
  map: Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
  key: string
): Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined {
  return map.get(key);
}


// Implementation of the getSnapshot method
function getSnapshot<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T>(
  this: SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
): Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null {
  return convertSnapshotContainer(this.snapshotContainer);
}

// Function to batch update multiple snapshots
function batchUpdateSnapshots<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T>(
  existingMap: Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
  updates: Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>
): Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> {
  // Use the spread operator to merge existing map with updates
  return new Map([...existingMap, ...updates]);
}

// Function to validate a snapshot before adding or updating
function validateSnapshot<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T>(snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): boolean {
  // Implement validation logic here (e.g., check for required fields)
  return snapshot.id !== undefined && snapshot.data !== undefined;
}

// Function to safely update snapshots
function safeUpdateSnapshots<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T>(
  map: Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
  key: string,
  snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
): Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> {
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
function updateSnapshotMap<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T>(
  map: Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
  key: string,
  snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
): Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> {
  map.set(key, snapshot);
  return map;
}

function isSnapshotFunction<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T>(
  snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
): snapshot is (
  id: string | number | undefined,
  snapshotId: string | null,
  snapshotData: SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  category: Category,
  categoryProperties: CategoryProperties | undefined,
  callback: (snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null) => void,
  dataStore: DataStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  dataStoreMethods: DataStoreMethods<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  metadata: UnifiedMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  subscriberId: string,
  endpointCategory: string | number,
  storeProps: SnapshotStoreProps<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  snapshotConfigData: SnapshotConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  subscription: Subscription<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  snapshotStoreConfigData?: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  snapshotContainer?: SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
) => Promise<{ snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> }> {
  return typeof snapshot === "function";
}


type SnapshotStoreMap<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> = Map<T, [K, SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>]>;


export type { SnapshotStoreMap };

  export {
        batchUpdateSnapshots, getSnapshot, getSnapshotFromMap, isSnapshotFunction, removeSnapshotFromMap, safeUpdateSnapshots,
        updateSnapshotMap, validateSnapshot
    };

