import { Data } from "../../models/data/Data";
import { SnapshotStoreConfig } from "../../snapshots/SnapshotStoreConfig";

//determineSnapshotStoreCategory.ts
function determineSnapshotStoreCategory<T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T>(
  storeConfigs: SnapshotStoreConfig<T, Meta, K>[]
): string {
  // Example category mappings based on storeConfig properties
  const categoryMappings: { [key: string]: (config: SnapshotStoreConfig<T, Meta, K>) => boolean } = {
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
