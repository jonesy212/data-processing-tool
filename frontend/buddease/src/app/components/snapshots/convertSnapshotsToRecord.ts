// import CalendarManagerStoreClass from "@/app/components/state/stores/CalendarManagerStore";
// import { Snapshot } from "@/app/components/snapshots/LocalStorageSnapshotStore";
// import { Data } from "../models/data/Data";

// // convertSnapshotsToRecord.ts
// function convertSnapshotsToRecord<
//     T extends  BaseData<any>,
//     K extends T = T>(
//     snapshots: Snapshot<T, K>[]
//   ): Record<string, CalendarManagerStoreClass<T, K>[]> {
//     const record: Record<string, CalendarManagerStoreClass<T, K>[]> = {};
  
//     snapshots.forEach((snapshot, index) => {
//       // Assuming `id` or a unique key is available in each snapshot
//       const key = snapshot.id || `snapshot_${index}`;
  
//       // Add the snapshot (casted) to the record under a unique key
//       record[key] = [snapshot as unknown as CalendarManagerStoreClass<T, K>];
//     });
  
//     return record;
//   }
  
//   export { convertSnapshotsToRecord }