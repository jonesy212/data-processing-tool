// DefaultValueForField.ts
import { Attachment } from '@/app/documents/attachment/Attachment';
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { SnapshotStoreConfig } from "./SnapshotStoreConfig";

// Assume you have a way to get default values based on type U
function getDefaultValueForField<  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T>(
    field: keyof SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
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
  