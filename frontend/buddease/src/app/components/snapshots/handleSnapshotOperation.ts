import { BaseData } from '@/app/components/models/data/Data';
import { StructuredMetadata } from '@/app/configs/StructuredMetadata';
import { Snapshot } from "./LocalStorageSnapshotStore";
import { SnapshotOperation, SnapshotOperationType } from "./SnapshotActions";
import * as snapshotApi from "@/app/api/SnapshotApi";
import { SnapshotStoreConfig } from "./SnapshotStoreConfig";

function handleMapOperation<
  T extends BaseData<any>, 
  K extends T = T, 
  Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>,
  ExcludedFields extends keyof T = never
  >(
  snapshot: Snapshot<T, K, Meta, ExcludedFields>,
  data: Map<string, Snapshot<T, K, Meta, ExcludedFields>>,
  operationType: SnapshotOperationType
): Snapshot<T, K, Meta, ExcludedFields> {
  let result: Snapshot<T, K, Meta, ExcludedFields> = { ...snapshot };

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
      result = { ...snapshot, data: new Map(data) };
      break;

    case SnapshotOperationType.SortSnapshot:
      console.log('Sorting snapshot');
      if (data instanceof Map) {
        // Narrowing the type to Map
        const sortedEntries = Array.from(data.entries()).sort(/* sorting logic */);
        const sortedData = new Map(sortedEntries);
        result = { ...snapshot, data: sortedData };
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

// handleSnapshotOperation.ts
// Define handleSnapshotOperation
const handleSnapshotOperation = async <T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(
  snapshot: Snapshot<T, K>,
  config: SnapshotStoreConfig<T, K>,
  mappedData: Map<string, SnapshotStoreConfig<T, K>>,
  operation: SnapshotOperation<T, K>,
  operationType: SnapshotOperationType
): Promise<Snapshot<T, K> | null> => {
  try {
    const snapshotId = snapshot.id;

    if (!snapshotId) throw new Error("Snapshot ID must be a defined string.");

    switch (operationType) {
      case SnapshotOperationType.CreateSnapshot:
        const newSnapshot = await snapshotApi.createSnapshot<T, K>(config);
        if (newSnapshot?.id) {
          mappedData.set(newSnapshot.id, config); // Add to mappedData
        } else {
          throw new Error("Failed to retrieve a valid ID for the new snapshot.");
        }
        return newSnapshot;

      case SnapshotOperationType.UpdateSnapshot:
        if (mappedData.has(snapshotId)) {
          const updatedSnapshot = await snapshotApi.updateSnapshot<T, K>(snapshot, config);
          mappedData.set(updatedSnapshot.id, config); // Update mappedData
          return updatedSnapshot;
        } else {
          throw new Error(`Snapshot with ID ${snapshotId} does not exist for update.`);
        }

      case SnapshotOperationType.DeleteSnapshot:
        if (mappedData.has(snapshotId)) {
          await snapshotApi.deleteSnapshot(snapshotId);
          mappedData.delete(snapshotId); // Remove from mappedData
          return null;
        } else {
          throw new Error(`Snapshot with ID ${snapshotId} does not exist for deletion.`);
        }

      case SnapshotOperationType.FindSnapshot:
        if (mappedData.has(snapshotId)) {
          return snapshot;
        } else {
          throw new Error(`Snapshot with ID ${snapshotId} not found.`);
        }

      // Additional cases like Map, Sort, Categorize, Search can be handled here...
      default:
        throw new Error(`Unhandled operation type: ${operationType}`);
    }
  } catch (error) {
    console.error(`Error in handleSnapshotOperation: ${error.message}`);
    return null;
  }
};



function handleSnapshotStoreConfigOperation<T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(
  snapshot: Snapshot<T, K>,
  data: SnapshotStoreConfig<T, K>,
  operationType: SnapshotOperationType
): Snapshot<T, K> {
  let result: Snapshot<T, K> = { ...snapshot };

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
const handleSnapshotStoreOperation = async <T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(
  snapshotId: string,
  snapshotStore: SnapshotStore<T, K>,
  snapshot: Snapshot<T, K>,
  operation: SnapshotOperation<T, K>,
  operationType: SnapshotOperationType,
  callback: (snapshotStore: SnapshotStore<T, K>) => void
): Promise<SnapshotStoreConfig<T, K> | null> => {
  console.log("Handling SnapshotStore operation:", snapshotStore, snapshotId);

  // Ensure snapshot is handled within SnapshotStore
  const config = snapshotStore.getConfig(snapshotId); // Assume getConfig retrieves the specific config for snapshotId

  if (!config) {
    console.error(`No configuration found for snapshot with ID ${snapshotId}`);
    return null;
  }

  const mappedData = snapshotStore.getMappedData(); // Fetch mapped data from snapshot store

  // Use handleSnapshotOperation within handleSnapshotStoreOperation
  const resultSnapshot = handleSnapshotOperation (snapshot, config, mappedData, operation, operationType);

  // Example update for SnapshotStore actions
  if (resultSnapshot) {
    SnapshotStoreActions<T, K>().handleSnapshotStoreSuccess({
      snapshotStore,
      snapshotId,
      snapshot: resultSnapshot,
      operation,
      operationType
    });
  }

  // Callback with updated snapshot store
  callback(snapshotStore);

  return config; // Return the updated configuration for further use if needed
};

  export { handleMapOperation, handleSnapshotOperation, handleSnapshotStoreConfigOperation };

