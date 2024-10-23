import { UnifiedMetaDataOptions } from "@/app/configs/database/MetaDataOptions";
import { Data } from "../models/data/Data";
import { Snapshot } from "./LocalStorageSnapshotStore";
import { SnapshotOperation, SnapshotOperationType } from "./SnapshotActions";
import { SnapshotStoreConfig } from "./SnapshotStoreConfig";
import { determineCategory } from "../libraries/categories/determineCategory";
import { generateUniqueApiId } from "@/app/generators/generateNewApiConfig";
import { generateSnapshotId } from "../utils/snapshotUtils";

function handleMapOperation<T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T>(
  snapshot: Snapshot<T, Meta, K>,
  data: Map<string, Snapshot<T, Meta, K>>,
  operationType: SnapshotOperationType
): Snapshot<T, Meta, K> {
  let result: Snapshot<T, Meta, K> = { ...snapshot };

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
const handleSnapshotOperation = <T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T>(
  snapshot: Snapshot<T, Meta, K>,
  data: Map<string, Snapshot<T, Meta, K>> | SnapshotStoreConfig<T, Meta, K>,
  operation: SnapshotOperation,
  operationType: SnapshotOperationType
  ): Promise<Snapshot<T, Meta, K>> => {
    return new Promise((resolve, reject) => {
      try {
        let result: Snapshot<T, Meta, K> = { ...snapshot };
  
        switch (operationType) {
          case SnapshotOperationType.CreateSnapshot:
            // Logic for creating a snapshot
            console.log('Creating snapshot');
            // Example: Add a new snapshot to the existing data
            if (data instanceof Map) {
              const newSnapshot = { ...snapshot, id: generateSnapshotId() }; // Assume generateUniqueId is a utility function
              data.set(newSnapshot.id, newSnapshot);
              result = newSnapshot;
            } else {
              console.warn('Data is not a Map, cannot perform create operation.');
            }
            break;

          case SnapshotOperationType.UpdateSnapshot:
            // Logic for updating a snapshot
            console.log('Updating snapshot');
            // Example: Update a specific snapshot in the map
            if (data instanceof Map && data.has(snapshot.id)) {
              const existingSnapshot = data.get(snapshot.id);
              if (existingSnapshot) {
                const updatedSnapshot = { ...existingSnapshot, ...snapshot }; // Merging existing with updated values
                data.set(snapshot.id, updatedSnapshot);
                result = updatedSnapshot;
              }
            } else {
              console.warn('Snapshot not found or data is not a Map.');
            }
            break;

          case SnapshotOperationType.DeleteSnapshot:
            // Logic for deleting a snapshot
            console.log('Deleting snapshot');
            // Example: Remove the snapshot from the map
            if (data instanceof Map && data.has(snapshot.id)) {
              data.delete(snapshot.id);
              result = { ...snapshot, deleted: true }; // Mark the snapshot as deleted
            } else {
              console.warn('Snapshot not found or data is not a Map.');
            }
            break;

          case SnapshotOperationType.FindSnapshot:
            // Logic for finding a snapshot
            console.log('Finding snapshot');
            // Example: Search for the snapshot by ID or some other criteria
            if (data instanceof Map && data.has(snapshot.id)) {
              result = data.get(snapshot.id) || snapshot;
            } else {
              console.warn('Snapshot not found or data is not a Map.');
            }
            break;

          case SnapshotOperationType.MapSnapshot:
            // Logic for mapping over snapshots
            console.log('Mapping snapshot');
            if (data instanceof Map) {
              // Example: Perform a transformation on each snapshot in the map
              const mappedData = new Map<string, Snapshot<T, Meta, K>>();
              data.forEach((value, key) => {
                const mappedSnapshot = { ...value, modified: true }; // Example modification
                mappedData.set(key, mappedSnapshot);
              });
              result = { ...snapshot, data: mappedData };
            } else {
              console.warn('Data is not a Map, cannot perform map operation.');
            }
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
            
            case SnapshotOperationType.CategorizeSnapshot:
              // Logic for categorizing snapshots
              console.log('Categorizing snapshot');
              if (data instanceof Map) {
                const categorizedData = new Map<string, Snapshot<T, Meta, K>>();
                data.forEach((value, key) => {
                  const category = determineCategory(value); // Assume determineCategory is a utility function
                  if (!categorizedData.has(category)) {
                    categorizedData.set(category, []);
                  }
                  categorizedData.get(category).push(value);
                });
                result = { ...snapshot, data: categorizedData };
              } else {
                console.warn('Data is not a Map, cannot perform categorize operation.');
              }
              break;
        
            case SnapshotOperationType.SearchSnapshot:
              // Logic for searching snapshots
              console.log('Searching snapshot');
              if (data instanceof Map && criteria) {
                const searchResults = new Map<string, Snapshot<T, Meta, K>>();
                data.forEach((value, key) => {
                  if (matchesCriteria(value, criteria)) { // Assume matchesCriteria is a utility function for search criteria
                    searchResults.set(key, value);
                  }
                });
                result = { ...snapshot, data: searchResults };
              } else {
                console.warn('Data is not a Map or criteria is missing, cannot perform search operation.');
              }
              break;
        
            case SnapshotOperationType.FilterSnapshot:
              // Logic for filtering snapshots
              console.log('Filtering snapshot');
              if (data instanceof Map && criteria) {
                const filteredData = new Map<string, Snapshot<T, Meta, K>>();
                data.forEach((value, key) => {
                  if (matchesCriteria(value, criteria)) { // Filter based on the criteria
                    filteredData.set(key, value);
                  }
                });
                result = { ...snapshot, data: filteredData };
              } else {
                console.warn('Data is not a Map or criteria is missing, cannot perform filter operation.');
              }
              break;
        
            case SnapshotOperationType.MapSnapshot:
              // Logic for mapping over snapshots
              console.log('Mapping snapshot');
              if (data instanceof Map) {
                const mappedData = new Map<string, Snapshot<T, Meta, K>>();
                data.forEach((value, key) => {
                  const mappedSnapshot = { ...value, modified: true }; // Example transformation
                  mappedData.set(key, mappedSnapshot);
                });
                result = { ...snapshot, data: mappedData };
              } else {
                console.warn('Data is not a Map, cannot perform map operation.');
              }
              break;
        
            default:
              throw new Error('Unknown operation type');
          }
  
        resolve(result);
      } catch (error) {
        reject(error);
      }
    });
  }


function handleSnapshotStoreConfigOperation<T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T>(
  snapshot: Snapshot<T, Meta, K>,
  data: SnapshotStoreConfig<T, Meta, K>,
  operationType: SnapshotOperationType
): Snapshot<T, Meta, K> {
  let result: Snapshot<T, Meta, K> = { ...snapshot };

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


  export { handleMapOperation, handleSnapshotOperation, handleSnapshotStoreConfigOperation };

