// determinCategory.ts
import { BaseData } from '@/app/components/models/data/Data';
import { StructuredMetadata } from '@/app/configs/StructuredMetadata';
import { CategoryProperties } from "@/app/pages/personas/ScenarioBuilder";
import { Snapshot } from "../../snapshots/LocalStorageSnapshotStore";
import { isCategoryProperties } from "./generateCategoryProperties";

// determineCategory function
function determineCategory<T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(
  data: Snapshot<T, K> | null | undefined
): string | CategoryProperties | null {
  if (!data) {
    return null; // If data is null or undefined, return null
  }

  const snapshotData = data.data; // Narrow the type of data.data
  
  if (snapshotData instanceof Map) {
    // Handle the Map case if necessary
    return null; // Adjust this based on your logic
  }

  const category = (snapshotData as T).category; // Ensure snapshotData is of type T

  if (typeof category === 'string') {
    return category; // If category is a string, return it
  } else if (isCategoryProperties(category)) {
    return category; // If category is CategoryProperties, return it
  } else {
    return null; // Return null if category is not a valid type
  }
}

export { determineCategory };
  