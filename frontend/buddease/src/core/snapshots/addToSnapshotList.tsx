// import type { Attachment } from '@/core/documents/attachment/Attachment'

// import type { BaseDataEntity, BaseDataRoot, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';

// import { IHydrateResult } from "mobx-persist";
// import { useState } from "react";
// import { BaseData } from '@/core/models/data/Data';
// import { displayToast } from "@/core/models/display/ShowToast";
// import type {  Snapshot } from '@/core/snapshots/Snapshot';
// import { SnapshotActions } from "@/core/actions/SnapshotActions";
// import SnapshotStore from "./SnapshotStore";
// import { SnapshotStoreConfig } from "@/core/snapshots/SnapshotStoreConfig";
// import { SnapshotWithCriteria } from "@/core/snapshots/SnapshotWithCriteria";
// import { Subscriber } from "@/core/subscribers/Subscriber";

// // addToSnapshotList.ts
// const addToSnapshotList = async  <  
// T extends BaseDataEntity,
  // K extends T = T,
  // Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  // AttachmentType extends Attachment = Attachment,
  // ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  // IncludedFields extends keyof T = keyof T>(
//   snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
//   subscribers: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]
// ) => {
//   // Logic to handle adding snapshot to the list in your UI
//   console.log("SnapshotStore:", snapshotStore);
//   console.log("Subscribers:", subscribers);

//   // Assuming snapshotStore contains the snapshot data you need
//   try {
//     const snapshotResult = await snapshotStore.snapshot(
//       "some-id", // Provide actual id
//       [], // Provide actual SnapshotStoreConfig array
//       "some-category", // Provide actual category
//       {
//         mapSnapshot: snapshotStore.mapSnapshot,
//         addData: snapshotStore.addData,
//         getData: snapshotStore.getData,
//         getStoreData: snapshotStore.getStoreData,
//         getItem: snapshotStore.getItem,
//         removeData: snapshotStore.removeData,
//         updateData: snapshotStore.updateData,
//         updateStoreData: snapshotStore.updateStoreData,
//         updateDataTitle: snapshotStore.updateDataTitle,
//         updateDataDescription: snapshotStore.updateDataDescription,
//         addDataStatus: snapshotStore.addDataStatus,
//         updateDataStatus: snapshotStore.updateDataStatus,
//         addDataSuccess: snapshotStore.addDataSuccess,
//         getDataVersions: snapshotStore.getDataVersions,
//         updateDataVersions: snapshotStore.updateDataVersions,
//         getBackendVersion: snapshotStore.getBackendVersion,
//         getFrontendVersion: snapshotStore.getFrontendVersion,
//         getAllKeys: snapshotStore.getAllKeys,
//         fetchData: snapshotStore.fetchData,
//         setItem: snapshotStore.setItem,
//         removeItem: snapshotStore.removeItem,
//         getAllItems: snapshotStore.getAllItems,
//         getDelegate: function (context: {
//           useSimulatedDataSource: boolean;
//           simulatedDataSource: SnapshotStoreConfig<SnapshotWithCriteria<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, K>[];
//         }): Promise<SnapshotStoreConfig<SnapshotWithCriteria<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, K>[]> {
//           return new Promise((resolve, reject) => {
//             try {
//               // Example logic to handle context and simulate data retrieval
//               const { simulatedDataSource } = context;

//               if (simulatedDataSource) {
//                 resolve(simulatedDataSource);
//               } else {
//                 resolve([]); // Return an empty array if no simulated data source is provided
//               }
//             } catch (error) {
//               reject(error); // Handle any errors that may occur
//             }
//           });
//         },
//         updateDelegate: function (config: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]): Promise<SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]> {
//           throw new Error("Function not implemented.");
//         },

//         getSnapshot: function (
//           category?: Category,//           timestamp: any,
//           id: number,
//           snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
//           snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
//           data: T)
//           : Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined> {
//           throw new Error("Function not implemented.");
//         },
//         getSnapshotContainer: function (
//           category?: Category,//           timestamp: any,
//           id: number,
//           snapshot: Snapshot<BaseData, K>,
//           snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
//           data: T): Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] | undefined> {
//           throw new Error("Function not implemented.");
//         },
//         getSnapshotVersions: function (category: symbol | string | Category | undefined, timestamp: any, id: number, snapshot: Snapshot<BaseData, K>, snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, data: T): Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] | undefined> {
//           throw new Error("Function not implemented.");
//         }
//       } // Provide actual DataStoreMethods
//     );

//     const snapshot = snapshotResult.snapshot as Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>; // Type assertion

//     console.log("Snapshot added to list:", snapshot);

//     // Add the snapshot to the list in your UI
//     // You can use a state management library like React Context or Redux to manage the list
//     // For example, using React Context:
//     const [snapshotList, setSnapshotList] = useState<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>([]);

//     setSnapshotList((prevList) => [...prevList, snapshot]);
//     console.log("Snapshot added to list:", snapshotList);

//     // Display a toast message
//     displayToast("Snapshot added successfully!");
//     console.log("Toast message:", "Snapshot added successfully!");

//     // Implement additional logic here based on your application's needs
//     // For example, updating internal state, notifying subscribers, etc.

//     SnapshotActions.handleTaskSnapshotSuccess({ snapshot, snapshotId: snapshot.id });
//     console.log(`Handling success for snapshot ID: ${snapshot.id}`);
    
//     // Implement additional logic here based on your application's needs
//   } catch (error) {
//     console.error("Error adding snapshot to list:", error);
//     // Handle the error appropriately
//   }
// };
