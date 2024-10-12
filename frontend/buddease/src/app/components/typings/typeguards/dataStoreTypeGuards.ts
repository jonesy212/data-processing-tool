import { BaseData } from "../../models/data/Data";
import { DataStoreWithSnapshotMethods } from "../../projects/DataAnalysisPhase/DataProcessing/ DataStoreMethods";
import { SnapshotStoreMethod } from "../../snapshots";

// Example type guard for checking data store methods
function isDataStoreMethod<U extends BaseData, K extends BaseData,
  Key extends keyof DataStoreWithSnapshotMethods<U, K>>(
  value: any
): value is DataStoreWithSnapshotMethods<U, K>[Key] {
  // Implement type check logic based on your requirements for DataStoreWithSnapshotMethods
  // Here we assume it's either a function or an object with specific properties
  if (typeof value === 'function') {
    return true; // Accept functions
  }

   // If the value should be an array of snapshot methods
   
  // Check if value is an object and perform further checks
  if (typeof value === 'object' && value !== null) {
    // If the value should be an array of snapshot methods
    if (Array.isArray(value)) {
      // Validate if the value contains snapshot methods
      return value.every((item) => typeof item === 'function' || isSnapshotStoreMethod<U, K>(item));
    }

    // Additional checks could be added if `DataStore` has more specific properties
    return true; // Assuming the object matches the expected type
  }

  return false;
}



// Example type guard for `SnapshotStoreMethod`
function isSnapshotStoreMethod<U extends BaseData, K extends BaseData>(
  value: unknown
): value is SnapshotStoreMethod<U, K> {
  // Assuming SnapshotStoreMethod is a function or object with specific properties
  return typeof value === 'function' || (typeof value === 'object' && value !== null);
}


// Example type guard for checking DataStoreWithSnapshotMethods
function isDataStoreWithSnapshotMethods<T extends BaseData, K extends BaseData>(
  value: unknown
): value is DataStoreWithSnapshotMethods<T, K> {
  // Ensure the value is an object and not null
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  // Check if `snapshotMethods` is either undefined or an array of `SnapshotStoreMethod`
  if ('snapshotMethods' in value) {
    const snapshotMethods = (value as DataStoreWithSnapshotMethods<T, K>).snapshotMethods;
    
    if (
      snapshotMethods !== undefined &&
      (!Array.isArray(snapshotMethods) ||
        !snapshotMethods.every((method) => typeof method === 'function'))
    ) {
      return false;
    }
  }

  // If necessary, add additional checks for other properties from DataStore
  return true;
}


  export {isDataStoreMethod, isDataStoreWithSnapshotMethods}