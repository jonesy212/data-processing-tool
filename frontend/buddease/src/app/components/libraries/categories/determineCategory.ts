// determinCategory.ts

import { CategoryProperties } from "@/app/pages/personas/ScenarioBuilder";
import { Data } from "../../models/data/Data";
import { Snapshot } from "../../snapshots/LocalStorageSnapshotStore";
import { isCategoryProperties } from "./generateCategoryProperties";

// determineCategory function
function determineCategory<T extends Data>(
  data: Snapshot<T, T> | null | undefined
): string | CategoryProperties | null {
  if (!data) {
    return null; // If data is null or undefined, return null
  }

  // Narrowing the type of data.data
  const snapshotData = data.data;

  if (snapshotData instanceof Map) {
    // Handle Map case if necessary
    return null; // Adjust this based on your logic
  }

  // Now snapshotData is of type T
  const category = (snapshotData as T).category; // Ensure snapshotData is T

  // Return the category if it exists
  if (typeof category === 'string') {
    return category; // If category is a string, return it
  } else if (isCategoryProperties(category)) {
    return category; // If category is CategoryProperties, return it
  } else {
    return null; // Return null if category is not a valid type
  }
}


  
  export { determineCategory };
  