import { Data } from "../components/models/data/Data";
import { SnapshotDataType } from "../components/snapshots";

// processSnapshotData.ts
function processSnapshotData<T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T>(
  snapshotDataType: SnapshotDataType<T, Meta, K>
): void {
  if (snapshotDataType === undefined) {
    console.log("No snapshot data available.");
    return;
  }

  if (snapshotDataType instanceof Map) {
    snapshotDataType.forEach((snapshot, key) => {
      console.log(`Processing snapshot with key: ${key}`, snapshot);
      // Process each Snapshot<T, Meta, K>
    });
  } else {
    // Handle SnapshotData<T, Meta, K>
    console.log("Processing SnapshotData", snapshotDataType);
    // Process SnapshotData<T, Meta, K>
  }
}


export { processSnapshotData };
