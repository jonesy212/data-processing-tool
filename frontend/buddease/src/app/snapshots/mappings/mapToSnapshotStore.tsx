// mapToSnapshotStore.tsx
import { StructuredMetadata } from "@/app/config/StructuredMetadata";
import SnapshotStore from "@/app/snapshots/SnapshotStore";
import { Snapshot } from '@/app/snapshots/Snapshot';
import { CriteriaType } from '@/app/pages/searches'
import {
  BaseDataEntity,
  BaseDataRoot,
  DefaultExcludedFields,
  DefaultMeta
} from '@/app/config/BaseConfig';
import { Attachment } from "@/app/documents/attachment/Attachment";


type AsyncOperation<T> = (snapshotId: string, criteria: CriteriaType) => Promise<T>;

export function mapToSnapshotStore <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T>(
  map: Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null>
): Partial<SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> {
  // Filter out undefined values and map entries to a new Map
  if (map === null) {
    return {
      data: null
    };
  }

  // Check if `map` is a Map
  if (map instanceof Map) {
    // Filter out undefined values and map entries to a new Map
    const filteredEntries: [string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>][] = Array.from(map.entries())
      .filter((entry): entry is [string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>] => entry[1] !== null);

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
function mapSnapshotCore<  
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  mapFn: (item: T) => T,
  callback: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void
): Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null {
  const mappedData = mapFn(snapshot.data);
  if (mappedData) {
    const newSnapshot = { ...snapshot, data: mappedData };
    callback(newSnapshot);
    return newSnapshot;
  }
  return null;
}

// Asynchronous version
async function mapSnapshotAsync<  
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  snapshotId: string,
  criteria: CriteriaType,
  mapFn: (item: T) => T,
  callback: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void
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
function mapSnapshotSync<  
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  mapFn: (item: T) => T,
  callback: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void
): Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null {
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


export { mapSnapshotCore, mapSnapshotAsync, mapSnapshotSync }
export type { AsyncOperation }