import { BaseData } from '@/app/components/models/data/Data';
import { SnapshotStoreConfig } from '@/app/components/snapshots/SnapshotStoreConfig';
import { StructuredMetadata } from '@/app/configs/StructuredMetadata';
//determineSnapshotStoreCategory.ts
function determineSnapshotStoreCategory<T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(
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
