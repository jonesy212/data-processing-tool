// determinCategory.ts

import { Data } from "../../models/data/Data";
import { Snapshot } from "../../snapshots/LocalStorageSnapshotStore";

// determineCategory function
function determineCategory<T extends Data, K>(
    data: string | Snapshot<T, K> | null | undefined
  ): string | Snapshot<Data, any> | null | undefined {
    if (typeof data === 'string') {
      // If data is a string, return it as the category
      return data;
    } else if (data && typeof data === 'object' && 'data' in data) {
      const snapshotData = data.data;
      
      if (snapshotData && typeof snapshotData === 'object' && !('get' in snapshotData)) {
        // If snapshotData is an object and not a Map, try to return the category
        return (snapshotData as T).category || null;
      } else {
        // If snapshotData is a Map or doesn't have a category, return null
        return null;
      }
    } else {
      // If data is null or undefined, return null or undefined
      return null;
    }
  }
  
  export { determineCategory };
  