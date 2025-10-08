// handleSnapshotOperation.ts
import * as snapshotApi from "@/app/api/SnapshotApi";
import { ExcludedFields } from "@/app/components/routing/Fields";
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from "@/config//BaseConfig";
import { Snapshot } from '@/app/snapshots/Snapshot';
import { SnapshotStoreActions } from "@/app/snapshots/SnapshotActions";
import { InitializedData } from '@/app/snapshots/SnapshotStoreOptions';
import { SnapshotOperation, SnapshotOperationType } from "./SnapshotActions";
import SnapshotStore from "./SnapshotStore";
import { SnapshotStoreConfig } from "./SnapshotStoreConfig";
import { Attachment } from "@/app/documents/attachment/Attachment";


// First, extract the sorting logic to a shared utility function
const sortByTimestamp = <T extends { timestamp?: string | Date }>(
  items: T[],
  direction: 'asc' | 'desc' = 'asc'
): T[] => {
  return [...items].sort((a, b) => {
    const aTimestamp = a.timestamp ? new Date(a.timestamp).getTime() : 0;
    const bTimestamp = b.timestamp ? new Date(b.timestamp).getTime() : 0;
    return direction === 'asc' ? aTimestamp - bTimestamp : bTimestamp - aTimestamp;
  });
};

function handleMapOperation<
  T extends BaseDataEntity, 
  K extends T = T, 
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>
>(
  snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  data: InitializedData<T, K, Meta, ExcludedFields> | undefined,
  operationType: SnapshotOperationType
): Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  // Create a new instance preserving the prototype chain
  const result = Object.assign(Object.create(Object.getPrototypeOf(snapshot)), snapshot);
  
  switch (operationType) {
    case SnapshotOperationType.CreateSnapshot:
      console.log('Creating snapshot');
      // Add creation logic here
      break;

    case SnapshotOperationType.UpdateSnapshot:
      console.log('Updating snapshot');
      // Add update logic here
      break;

    case SnapshotOperationType.DeleteSnapshot:
      console.log('Deleting snapshot');
      // Add deletion logic here
      break;

    case SnapshotOperationType.FindSnapshot:
      console.log('Finding snapshot');
      // Add finding logic here
      break;

    case SnapshotOperationType.MapSnapshot:
      console.log('Mapping snapshot');
      result.data = new Map(data);
      break;

    case SnapshotOperationType.SortSnapshot:
      console.log('Sorting snapshot');
      if (data instanceof Map) {
        // Convert Map entries to array, sort them, then convert back to Map
        const entriesArray = Array.from(data.entries());
        const sortedEntries = sortByTimestamp(
          entriesArray.map(([key, value]) => ({ key, value, timestamp: value.timestamp })),
          'asc'
        ).map(item => [item.key, item.value]);
        
        result.data = new Map(sortedEntries);
      } else {
        console.warn('Data is not a Map, sorting cannot be performed.');
      }
        
      break;

    case SnapshotOperationType.FilterSnapshot:
      console.log('Filtering snapshot');
      // Add filtering logic here
      break;

    default:
      throw new Error('Unknown operation type for Map');
  }

  return result;
}

// Define handleSnapshotOperation
const handleSnapshotOperation = <T extends BaseDataEntity, K extends T = T, Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>>(
  snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  config: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  mappedData: Map<string, SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
  operation: SnapshotOperation<T, K, Meta, ExcludedFields>,
  operationType: SnapshotOperationType
): Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null> => {
  const snapshotId = snapshot.id;

  if (!snapshotId) {
    return Promise.reject(new Error("Snapshot ID must be a defined string."));
  }

  switch (operationType) {
    case SnapshotOperationType.CreateSnapshot:
      return snapshotApi.createSnapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>(config)
        .then(newSnapshot => {
          if (newSnapshot?.id) {
            mappedData.set(newSnapshot.id, config);
            return newSnapshot;
          }
          throw new Error("Failed to retrieve a valid ID for the new snapshot.");
        });

    case SnapshotOperationType.UpdateSnapshot:
      if (!mappedData.has(snapshotId)) {
        return Promise.reject(new Error(`Snapshot with ID ${snapshotId} does not exist for update.`));
      }
      return snapshotApi.updateSnapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>(snapshot, config)
        .then(updatedSnapshot => {
          mappedData.set(updatedSnapshot.id, config);
          return updatedSnapshot;
        });

    case SnapshotOperationType.DeleteSnapshot:
      if (!mappedData.has(snapshotId)) {
        return Promise.reject(new Error(`Snapshot with ID ${snapshotId} does not exist for deletion.`));
      }
      return snapshotApi.deleteSnapshot(snapshotId)
        .then(() => {
          mappedData.delete(snapshotId);
          return null;
        });

    case SnapshotOperationType.FindSnapshot:
      if (mappedData.has(snapshotId)) {
        return Promise.resolve(snapshot);
      }
      return Promise.reject(new Error(`Snapshot with ID ${snapshotId} not found.`));

    default:
      return Promise.reject(new Error(`Unhandled operation type: ${operationType}`));
  }
};


function handleSnapshotStoreConfigOperation< T extends BaseDataEntity, 
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>  
>(
  snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  data: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  operationType: SnapshotOperationType
): Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
 // Create a new instance preserving the prototype chain
 const result = Object.assign(Object.create(Object.getPrototypeOf(snapshot)), snapshot);
 
  switch (operationType) {
    case SnapshotOperationType.CreateSnapshot:
      console.log('Creating snapshot in store config');
      // Add creation logic here
      break;

    case SnapshotOperationType.UpdateSnapshot:
      console.log('Updating snapshot in store config');
      // Add update logic here
      break;

    case SnapshotOperationType.DeleteSnapshot:
      console.log('Deleting snapshot in store config');
      // Add deletion logic here
      break;

    case SnapshotOperationType.FindSnapshot:
      console.log('Finding snapshot in store config');
      // Add finding logic here
      break;

    case SnapshotOperationType.CategorizeSnapshot:
      console.log('Categorizing snapshot');
      // Add categorization logic here
      break;

    case SnapshotOperationType.SearchSnapshot:
      console.log('Searching snapshot');
      // Add searching logic here
      break;

    default:
      throw new Error('Unknown operation type for SnapshotStoreConfig');
  }

  return result;
}



// Define handleSnapshotStoreOperation
const handleSnapshotStoreOperation = async <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  snapshotId: string,
  snapshotStore: SnapshotStore<T, K, Meta, ExcludedFields>,
  snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  operation: SnapshotOperation<T, K, Meta, ExcludedFields>,
  operationType: SnapshotOperationType,
  callback: (snapshotStore: SnapshotStore<T, K, Meta, ExcludedFields>) => void
): Promise<SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null> => {
  console.log("Handling SnapshotStore operation:", snapshotStore, snapshotId);

  // Ensure snapshot is handled within SnapshotStore
  const config = snapshotStore.getSnapshotConfig(snapshotId);

  if (!config) {
    console.error(`No configuration found for snapshot with ID ${snapshotId}`);
    return null;
  }

  // ✅ FIXED: Replace snapshotStore.() with the actual method you need
  const mappedData = snapshotStore.getMappedData(); // or whatever method exists

  // Use handleSnapshotOperation within handleSnapshotStoreOperation
  const resultSnapshot = await handleSnapshotOperation(snapshot, config, mappedData, operation, operationType);

  // Example update for SnapshotStore actions
  if (resultSnapshot) {
    SnapshotStoreActions<T, K, Meta, ExcludedFields>().handleSnapshotStoreSuccess({
      snapshotStore,
      snapshotId,
      snapshot: resultSnapshot,
      operation,
      operationType
    });
  }

  // Callback with updated snapshot store
  callback(snapshotStore);

  return config;
};

  export { handleMapOperation, handleSnapshotOperation, handleSnapshotStoreConfigOperation, handleSnapshotStoreOperation, sortByTimestamp };

