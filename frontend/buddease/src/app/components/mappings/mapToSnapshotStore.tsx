import { StructuredMetadata } from "@/app/configs/StructuredMetadata";
import SnapshotStore from "../snapshots/SnapshotStore";
import { Snapshot } from "./../snapshots/LocalStorageSnapshotStore";
import { BaseData } from '@/app/components/models/data/Data';

type AsyncOperation<T> = (snapshotId: string, criteria: CriteriaType) => Promise<T>;


export function mapToSnapshotStore <T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(
  map: Map<string, Snapshot<T, K> | null>
): Partial<SnapshotStore<T, K>> {
  // Filter out undefined values and map entries to a new Map
  if (map === null) {
    return {
      data: null
    };
  }

  // Check if `map` is a Map
  if (map instanceof Map) {
    // Filter out undefined values and map entries to a new Map
    const filteredEntries: [string, Snapshot<T, K>][] = Array.from(map.entries())
      .filter((entry): entry is [string, Snapshot<T, K>] => entry[1] !== null);

    return {
      data: new Map(filteredEntries)
    };
  } 

  // If `map` is not a Map, assume it's of type `T`
  return {
    data: map
  };
}


// Core logic used by both functions
function mapSnapshotCore<T, K>(
  snapshot: Snapshot<T, K>,
  mapFn: (item: T) => T,
  callback: (snapshot: Snapshot<T, K>) => void
): Snapshot<T, K> | null {
  const mappedData = mapFn(snapshot.data);
  if (mappedData) {
    const newSnapshot = { ...snapshot, data: mappedData };
    callback(newSnapshot);
    return newSnapshot;
  }
  return null;
}

// Asynchronous version
async function mapSnapshotAsync<T, K>(
  snapshot: Snapshot<T, K>,
  snapshotId: string,
  criteria: CriteriaType,
  mapFn: (item: T) => T,
  callback: (snapshot: Snapshot<T, K>) => void
): Promise<string | undefined> | null {
  try {
    const result = await someAsyncOperation(snapshotId, criteria); // Example async task
    if (result) {
      mapSnapshotCore(snapshot, mapFn, callback);
      return result; // Return string or undefined
    }
    return null;
  } catch (error) {
    console.error(error);
    return null;
  }
}

// Synchronous version
function mapSnapshotSync<T, K>(
  snapshot: Snapshot<T, K>,
  mapFn: (item: T) => T,
  callback: (snapshot: Snapshot<T, K>) => void
): Snapshot<T, K> | null {
  return mapSnapshotCore(snapshot, mapFn, callback);
}



// Asynchronous version
async function mapSnapshotAsync<T, K>(
  snapshot: Snapshot<T, K>,
  snapshotId: string,
  criteria: CriteriaType,
  mapFn: (item: T) => T,
  callback: (snapshot: Snapshot<T, K>) => void
): Promise<string | undefined> | null {
  try {
    const result = await someAsyncOperation(snapshotId, criteria); // Example async task
    if (result) {
      mapSnapshotCore(snapshot, mapFn, callback);
      return result; // Return string or undefined
    }
    return null;
  } catch (error) {
    console.error(error);
    return null;
  }
}

// Synchronous version
function mapSnapshotSync<T, K>(
  snapshot: Snapshot<T, K>,
  mapFn: (item: T) => T,
  callback: (snapshot: Snapshot<T, K>) => void
): Snapshot<T, K> | null {
  return mapSnapshotCore(snapshot, mapFn, callback);
}


const someAsyncOperation: AsyncOperation<string | undefined> = async (
  snapshotId,
  criteria
) => {
  try {
    // Generic async logic, e.g., logging or checking permissions
    console.log("Processing criteria for:", snapshotId, criteria);
    return criteria.isValid ? snapshotId : undefined;
  } catch (error) {
    console.error("Error in generic async operation:", error);
    return undefined;
  }
};


export { mapSnapshotCore, mapSnapshotAsync
  mapSnapshotSync }

  export type { AsyncOperation }