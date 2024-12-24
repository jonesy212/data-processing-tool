import { Data } from '@/app/components/models/data/Data';
import { BaseData } from "../../models/data/Data";
import { DataStoreWithSnapshotMethods } from "../../projects/DataAnalysisPhase/DataProcessing/ DataStoreMethods";
import { SnapshotStoreMethod } from "../../snapshots";
import { StructuredMetadata } from '@/app/configs/StructuredMetadata';
// Example type guard for checking data store methods
function isDataStoreMethod<
  U extends BaseData,
  K extends Data,
  Key extends keyof DataStoreWithSnapshotMethods<U, any, K>,
  ExcludedFields extends keyof T = never
>(
  value: any
): value is DataStoreWithSnapshotMethods<U, any, K>[Key] {
  // Check if the value is a function (valid method)
  if (typeof value === 'function') {
    return true;
  }

  // Check if the value is an array of snapshot methods
  if (Array.isArray(value)) {
    return value.every(
      (item) => typeof item === 'function' || isSnapshotStoreMethod<U, any, K>(item)
    );
  }

  // Check if the value is an object and perform further checks
  if (typeof value === 'object' && value !== null) {
    // Optionally check for required properties or structure
    // For example, if your DataStoreWithSnapshotMethods object must have certain keys or properties
    return Object.values(value).every(
      (item) => typeof item === 'function' || isSnapshotStoreMethod<U, any, K>(item)
    );
  }

  // If the value does not match any of the expected types, return false
  return false;
}

// Example of a type guard for SnapshotStore methods (assuming you have this function)
function isSnapshotStoreMethod<
  U extends BaseData,
  Meta extends StructuredMetadata<U, K>,
  K extends Data
>(value: any): value is SnapshotStore<U, K, Meta> {
  // Implement logic to check if the value is a valid SnapshotStore method or object
  return typeof value === 'function' || (value && typeof value === 'object');
}



// Example type guard for `SnapshotStoreMethod`
function isSnapshotStoreMethod<U extends BaseData,   K extends Data>(
  value: unknown, K extends
): value is SnapshotStoreMethod<U, K, Meta> {
  // Assuming SnapshotStoreMethod is a function or object with specific properties
  return typeof value === 'function' || (typeof value === 'object' && value !== null);
}


// Example type guard for checking DataStoreWithSnapshotMethods
function isDataStoreWithSnapshotMethods <T extends  BaseData<any>,  K extends T = T,  Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(
  value: unknown, K extends
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


  export { isDataStoreMethod, isDataStoreWithSnapshotMethods };
