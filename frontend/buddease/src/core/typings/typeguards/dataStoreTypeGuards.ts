// dataStoreTypeGuards.ts
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import { StructuredMetadata } from '@/core/config/StructuredMetadata';
import { Attachment } from '@/core/documents/attachment/Attachment';
import { Data } from '@/core/models/data/Data';
import { DataStoreWithSnapshotMethods } from "@/core/projects/DataAnalysisPhase/DataProcessing/DataStoreMethods";
import { SnapshotStoreMethods } from "@/core/snapshots/SnapshotStoreMethods";
// Example type guard for checking data store methods
function isDataStoreMethod<
  U extends BaseData,
  K extends Data,
  Key extends keyof DataStoreWithSnapshotMethods<U, any, K>,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>
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
      (item) => typeof item === 'function' || isSnapshotStoreMethods<U, any, K>(item)
    );
  }

  // Check if the value is an object and perform further checks
  if (typeof value === 'object' && value !== null) {
    // Optionally check for required properties or structure
    // For example, if your DataStoreWithSnapshotMethods object must have certain keys or properties
    return Object.values(value).every(
      (item) => typeof item === 'function' || isSnapshotStoreMethods<U, any, K>(item)
    );
  }

  // If the value does not match any of the expected types, return false
  return false;
}

// Example of a type guard for SnapshotStore methods (assuming you have this function)
function isSnapshotStoreMethods<
  U extends BaseData,
  Meta extends StructuredMetadata<U, K>,
  K extends Data
>(value: any): value is SnapshotStore<U, K, Meta> {
  // Implement logic to check if the value is a valid SnapshotStore method or object
  return typeof value === 'function' || (value && typeof value === 'object');
}



// Example type guard for `SnapshotStoreMethods`
function isSnapshotStoreMethods<U extends BaseData, K extends Data>(
  value: unknown,
): value is SnapshotStoreMethods<U, K, Meta> {
  // Assuming SnapshotStoreMethods is a function or object with specific properties
  return typeof value === 'function' || (typeof value === 'object' && value !== null);
}

function isSnapshotStoreMethods<
  U extends BaseDataEntity,
  K extends U = U,
  Meta extends DefaultMeta<U, K> = DefaultMeta<U, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof U = DefaultExcludedFields<U>,
  IncludedFields extends keyof U = keyof U
>(
  value: unknown,
): value is SnapshotStoreMethods<U, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  // Check if value is an object and not null
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const val = value as SnapshotStoreMethods<U, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  
  // Check for required methods/properties
  return (
    typeof val.addStore === 'function' &&
    typeof val.getStore === 'function' &&
    typeof val.createSnapshot === 'function'
    // Add checks for other required methods as needed
  );
}



function isDataStoreWithSnapshotMethods<
  U extends BaseDataEntity,
  K extends U = U,
  Meta extends DefaultMeta<U, K> = DefaultMeta<U, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof U = DefaultExcludedFields<U>,
  IncludedFields extends keyof U = keyof U
>(
  value: unknown,
): value is DataStoreWithSnapshotMethods<U, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const val = value as DataStoreWithSnapshotMethods<U, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  
  // Check if snapshotMethods exists and matches the expected type
  if ('snapshotMethods' in val) {
    const snapshotMethods = val.snapshotMethods;
    
    // snapshotMethods can be undefined or an array of SnapshotStoreMethods
    if (snapshotMethods !== undefined) {
      if (!Array.isArray(snapshotMethods)) {
        return false;
      }
      
      // Verify each item in the array is a SnapshotStoreMethods
      return snapshotMethods.every(method => 
        isSnapshotStoreMethods<U, K, Meta, AttachmentType, ExcludedFields, IncludedFields>(method)
      );
    }
  }

  // Optionally check for other DataStore properties
  const requiredDataStoreProps = [
    'id',
    'name',
    'data',
    'metadata'
  ] as const;

  return requiredDataStoreProps.every(prop => prop in val);
}

  export { isDataStoreMethod, isDataStoreWithSnapshotMethods };
