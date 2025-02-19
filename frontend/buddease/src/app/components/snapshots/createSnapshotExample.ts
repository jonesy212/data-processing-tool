// import { SnapshotData, SnapshotStoreConfig } from '@/app/components/snapshots';

// import { Snapshot } from "./LocalStorageSnapshotStore";

// import { Data } from '../models/data/Data';
// import { K, T } from '../models/data/dataStoreMethods';
// import SnapshotStore from "./SnapshotStore";
// import { snapshotStoreConfigInstance } from './snapshotStoreConfigInstance';

// // createSnapshotExample.tsp

// const createSnapshotExample = async (
//   id: string,
//   snapshotData: SnapshotData<any, T>,
//   category: string
// ): Promise<{ snapshot: Snapshot<T, any> }> => {
//   const currentConfig = snapshotStoreConfigInstance.find(
//     (snapshotId: string, config: SnapshotStoreConfig<any, Data>) => config.snapshotId === id
//   );

//   return new Promise<{ snapshot: Snapshot<T, K> }>(
//     (resolve, reject) => {
//       if (currentConfig && typeof currentConfig.createSnapshot === "function") {
//         // Ensure currentConfig.createSnapshot is called with correct arguments
//         currentConfig.createSnapshot(
//           id,
//           snapshotData,
//           category,
//           (snapshot: Snapshot<T, K>) => {
//             // Check if snapshot returned is valid
//             if (snapshot instanceof SnapshotStore) {
//               resolve({ snapshot });
//             } else {
//               reject(new Error("Invalid snapshot returned."));
//             }
//           }
//         );
//       } else {
//         reject(
//           new Error(
//             "Snapshot configuration not found or createSnapshot method not callable."
//           )
//         );
//       }
//     }
//   );

// };

// // Call the example
// createSnapshotExample("snapshot1", snapshot[0], "category1").then(
//   (result) => {
//     console.log("Snapshot creation result:", result);
//   }
// );