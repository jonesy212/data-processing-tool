//determineSnapshotStoreCategory.ts
import { BaseDataEntity, BaseDataRoot, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';

import { Attachment } from '@/app/documents/attachment/Attachment';

import { BaseData } from '@/app/models/data/Data';
import { SnapshotStoreConfig } from '@/app/snapshots/SnapshotStoreConfig';
import { StructuredMetadata } from '@/app/config/StructuredMetadata';
function determineSnapshotStoreCategory<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T>(
  storeConfigs: SnapshotStoreConfig<T, K>[]
): string {
  // Example category mappings based on storeConfig properties
  const categoryMappings: { [key: string]: (config: SnapshotStoreConfig<T, K>) => boolean } = {
    "financial": (config) => config.dataType === "financial" && config.priority === "high",
    "healthcare": (config) => config.dataType === "healthcare" && config.privacy === "strict",
    "default": (config) => true, // Default mapping if no other criteria are met
  };

  // Iterate through the provided storeConfigs to determine the category
  for (const config of storeConfigs) {
    for (const [category, matchFunction] of Object.entries(categoryMappings)) {
      if (matchFunction(config)) {
        return category;
      }
    }
  }

  // If no specific category is determined, return a default category
  return "defaultCategory";
}


export { determineSnapshotStoreCategory };
