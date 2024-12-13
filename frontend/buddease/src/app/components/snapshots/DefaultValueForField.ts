import { StructuredMetadata } from "@/app/configs/StructuredMetadata";
import { BaseData } from '../data/Data';
import { SnapshotStoreConfig } from "./SnapshotStoreConfig";

// Assume you have a way to get default values based on type U
function getDefaultValueForField<T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(
    field: keyof SnapshotStoreConfig<T, K>
  ): T | K | string | number | boolean | null {
    switch (field) {
      case 'id':
        return null; // Default for ID
      case 'storeId':
        return 0; // Default for storeId
      case 'name':
        return ''; // Default for name
      case 'description':
        return null; // Default for description
      case 'data':
        return null; // Default for data (could also be a new instance of T)
      case 'createdAt':
      case 'updatedAt':
        return new Date().toISOString(); // Default for date fields
      case 'autoSave':
        return false; // Default for autoSave
      case 'syncInterval':
        return 5 * 60 * 1000; // Default to sync every 5 minutes
      case 'snapshotLimit':
        return 100; // Default for snapshot limit
      case 'category':
        return 'default'; // Default category
      // Add other fields as necessary
      default:
        throw new Error(`No default value defined for field: ${field}`);
    }
  }
  