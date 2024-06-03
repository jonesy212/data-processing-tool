// // SnapshotConfig.ts

// import { Data } from "../models/data/Data";
// import { SnapshotState } from "../state/redux/slices/SnapshotSlice";
// import { NotificationType } from "../support/NotificationContext";
// import SnapshotStore, { Payload, Snapshot, Snapshots, snapshotStore } from "./SnapshotStore";
// import * as snapshotApi from "./../../api/SnapshotApi";
// import SnapshotList from "./SnapshotList";
// import { useDispatch } from "react-redux";
// import { SnapshotActions } from "./SnapshotActions";
// import { Member } from "../models/teams/TeamMembers";
// import { Subscriber } from "../users/Subscriber";
// import { Subscription } from "../subscriptions/Subscription";
// import { fetchData } from "@/app/api/ApiData";
// import { endpoints } from "@/app/api/ApiEndpoints";
// import { target } from "@/app/api/EndpointConstructor";
// import { batchFetchSnapshotsRequest } from "./snapshotHandlers";
// // Define the SnapshotStoreConfig interface

// interface SnapshotStoreConfig<T, Data> {
//   id?: any;
//   clearSnapshots?: any;
//   key?: string;
//   configOption?: SnapshotStoreConfig<T, Data> | null;
//   subscription?: Subscription | null;
//   initialState: SnapshotStore<T, Data> | Snapshot<Data> | null | undefined;
//   category: string;
//   timestamp: Date;
//   set?: (type: string, event: Event) => void | null;
//   data: Data | SnapshotStoreConfig<SnapshotStore<Snapshot<Data>, Data>, Data> | null;
//   store: SnapshotStoreConfig<SnapshotStore<Snapshot<Data>, Data>, Data> | null;
//   handleSnapshot: (snapshot: Snapshot<Data> | null, snapshotId: string) => void | null;
//   state: Snapshot<Data> | null;
//   snapshots: T[];
//   onInitialize?: () => void;
//   onError?: (error: Payload) => void;
//   snapshot: (
//     id: string,
//     snapshotData: SnapshotStoreConfig<Data | SnapshotStoreConfig<SnapshotStore<Snapshot<Data>, Data>, Data> | null, string>,
//     category: string
//   ) => Promise<{
//     snapshot: SnapshotStore<Snapshot<Data>, Data>;
//   }>;
//   subscribers: Subscriber<Snapshot<Data>>[];

//   setSnapshot: (snapshot: SnapshotStore<Snapshot<Data>, Data> ) => {
//     snapshot: SnapshotStore<Snapshot<Data>, Data>;
//   };
//   createSnapshot: (additionalData: any) => void;
//   configureSnapshotStore: (
//     snapshot: SnapshotStoreConfig<SnapshotStore<Snapshot<Data>, Data>, Data>
//   ) => void;
//   createSnapshotSuccess: () => void;
//   createSnapshotFailure: (error: Error) => void;
//   batchTakeSnapshot: (
//     snapshot: SnapshotStore<Snapshot<Data>, Data>,
//     snapshots: Snapshots<Data>
//   ) => Promise<{
//     snapshots: Snapshots<Data>;
//   }>;
//   onSnapshot: (snapshot: SnapshotStore<Snapshot<Data>, Data>) => void | undefined;
//   onSnapshots: Snapshots<Data>;
//   snapshotData: (snapshot: SnapshotStore<Snapshot<Data>, Data>) => {
//     snapshot: Snapshots<Data>;
//   };
//   initSnapshot: () => void;
//   clearSnapshot: () => void;
//   updateSnapshot: (snapshot: SnapshotStore<Snapshot<Data>, Data>) => Promise<{
//     snapshot: Snapshots<Data>;
//   }>;
//   getSnapshots: (snapshots: Snapshots<Data>, category: string) => Promise<Snapshots<Data>>;
//   takeSnapshot: (snapshot: SnapshotStore<Snapshot<Data>, Data>) => Promise<{
//     snapshot: Snapshots<Data>;
//   }>;
//   addSnapshot: (snapshot: SnapshotStore<Snapshot<Data>, Data>) => void;
//   removeSnapshot: (snapshotToRemove: SnapshotStore<Snapshot<Data>, Data>) => void;

//   getSubscribers: () => Subscriber<Snapshot<Data>>[];
//   addSubscriber: (subscriber: Subscriber<Snapshot<Data>>) => void;
//   validateSnapshot: (data: Snapshot<Data>) => boolean;
//   getSnapshot: (
//     snapshot: () =>
//       | Promise<{
//           category: any;
//           timestamp: any;
//           id: any;
//           snapshot: SnapshotStore<Snapshot<Data>, Data>;
//           data: Data;
//         }>
//       | undefined
//   ) => Promise<SnapshotStore<Snapshot<Data>, Data>>;
//   getAllSnapshots: (
//     data: (
//       subscribers: Subscriber<Snapshot<Data>>[],
//       snapshots: Snapshots<Data>
//     ) => Promise<Snapshots<Data>>
//   ) => Promise<Snapshots<Data>>;
//   takeSnapshotSuccess: () => void;
//   updateSnapshotFailure: (payload: { error: string }) => void;
//   takeSnapshotsSuccess: (snapshots: Snapshots<Data>) => void;
//   fetchSnapshot: () => void;
//   updateSnapshotSuccess: () => void;
//   updateSnapshotsSuccess: (
//     snapshotData: (
//       subscribers: Subscriber<Snapshot<Data>>[],
//       snapshot: Snapshots<Data>
//     ) => void
//   ) => void;
//   fetchSnapshotSuccess: (
//     snapshotData: (
//       subscribers: Subscriber<Snapshot<Data>>[],
//       snapshot: Snapshots<Data>
//     ) => void
//   ) => void;

//   batchUpdateSnapshots: (
//     subscribers: Subscriber<Snapshot<Data>>[],
//     snapshot: Snapshots<Data>
//   ) => Promise<
//     {
//       snapshot: Snapshots<Data>
//     }[]
//     >;
  
//   batchTakeSnapshotsRequest: (snapshotData: any) => Promise<{
//     snapshots: Snapshots<Data>
//   }>;

//   batchUpdateSnapshotsSuccess?: (
//     subscribers: Subscriber<Snapshot<Data>>[],
//     snapshots: Snapshots<Data>
//   ) => {
//     snapshots: Snapshots<Data>;
//   }[];
  

//   batchUpdateSnapshotsRequest:
//   (snapshotDatas: (
//     subscribers: Subscriber<Snapshot<Data>>[],
//     snapshots: Snapshots<Data>
//   ) => Promise<{
//     subscribers: Subscriber<Snapshot<Data>>[];
//     snapshots: Snapshots<Data>;

//   }>
//   ) => ({ subscribers: [], snapshots: {} }),
  
  
//   batchFetchSnapshots(
//     subscribers: Subscriber<Snapshot<Data>>[],
//     snapshots: Snapshots<Data>
//   ): Promise<{}>;

  
//   getData: () => Promise<Snapshots<Data>>;

//   batchFetchSnapshotsSuccess: (
//     subscribers: Subscriber<Snapshot<Data>>[],
//     snapshots: Snapshots<Data>
//   ) => Snapshots<Data>;
//   batchFetchSnapshotsFailure: (payload: { error: Error }) => void;
//   batchUpdateSnapshotsFailure: (payload: { error: Error }) => void;
//   notifySubscribers: (
//     subscribers: Subscriber<Snapshot<Data>>[],
//     data: Snapshot<Data>
//   ) => Subscriber<Snapshot<Data>>[];

//   notify: (
//     message: string,
//     content: any,
//     date: Date,
//     type: NotificationType
//   ) => void;
//   [Symbol.iterator]: () => IterableIterator<T>;
//   [Symbol.asyncIterator]: () => AsyncIterableIterator<T>;
// }





// // Initial snapshotConfig implementation
// const snapshotConfig: SnapshotStoreConfig<
//   SnapshotStore<Snapshot<Data>, Data>,
//   Data
// > = {
//   id: null,
//   clearSnapshots: null,
//   key: "",
//   initialState: undefined,
//   category: "",
//   timestamp: new Date(),
//   subscription: null,
//   configOption: {
//     id: null,
//     clearSnapshots: null,
//     key: "",
//     configOption: null,
//     subscription: null,
//     initialState: undefined,
//     category: "",
//     timestamp: new Date(),
//     set: (type: string, event: Event) => {
//       console.log(`Event type: ${type}`);
//       console.log("Event:", event);
//       return null;
//     },
//     data: null,
//     store: null,
//     handleSnapshot: () => {},
//     state: null,
//     snapshots: [],
//     snapshot: async (id, snapshotData, category) => {
//       return { snapshot: new SnapshotStore(id, "", snapshotData, category) };
//     },
//     subscribers: [],
//     setSnapshot: (snapshot) => {
//       return { snapshot: [] };
//     },
//     createSnapshot: (additionalData) => { },
//     configureSnapshotStore: (snapshot) => { },
//     createSnapshotSuccess: () => { },
//     createSnapshotFailure: (error) => { },
//     batchTakeSnapshot: (snapshot, snapshots) => {
//       return Promise.resolve({ snapshots: [] });
//     },
//     onSnapshot: (snapshot: SnapshotStore<Snapshot<Data>, Data>) => { },
//     snapshotData: (snapshot) => {
//       return { snapshot: [] };
//     },
//     initSnapshot: () => { },
//     fetchSnapshot: async () => {
//       return { snapshot: [] };
//     },
//     clearSnapshot: () => { },
//     updateSnapshot: (snapshot) => {
//       return Promise.resolve({ snapshot: [] });
//     },
//     getSnapshots: (category: string) => {
//       return Promise.resolve([{ snapshot: [] }]);
//     },
//     takeSnapshot: (snapshot) => {
//       return Promise.resolve({ snapshot: [] });
//     },
//     getAllSnapshots: async (data) => {
//       return [];
//     },
//     takeSnapshotSuccess: () => { },
//     updateSnapshotFailure: (payload) => { },
//     takeSnapshotsSuccess: () => { },
//     fetchSnapshotSuccess: () => { },
//     updateSnapshotsSuccess: () => { },
//     notify: () => { },
    
//     batchFetchSnapshots: async () => {
//       return {};
//     },
//     batchUpdateSnapshots: async () => {
//       return [];
//     },
  

//     batchFetchSnapshotsRequest: async (
//       snapshotData: (
//         subscribers: Subscriber<Snapshot<Data>>[],
//         snapshots: Snapshots<Data>
//       ) => {
//         subscribers: Subscriber<Snapshot<Data>>[],
//         snapshots: Snapshots<Data>
//       }
//     ) => {
//       console.log("Batch snapshot fetching requested.");

//       try {
//         const target = {
//           endpoint: "https://example.com/api/snapshots/batch",
//           params: {
//             limit: 100,
//             sortBy: "createdAt" // Add missing 'sortBy' property
//           },
//         };

//         const fetchedSnapshots: SnapshotList | SnapshotStore<Snapshot<Data>, Data>[] =
//           await snapshotApi
//             .getSortedList(target)
//             .then((sortedList) => snapshotApi.fetchAllSnapshots(sortedList));

//         const snapshots: SnapshotStore<Snapshot<Data>, Data>[] = Array.isArray(
//           fetchedSnapshots
//         )
//           ? fetchedSnapshots.map(
//               (snapshot: SnapshotStore<Snapshot<Data>, Data>) =>
//                 new SnapshotStore(
//                   snapshot.id,
//                   snapshot.message,
//                   snapshot.content,
//                   snapshot.data 
//                 )
//             )
//           : [];

//         console.log("Fetched snapshots:", snapshots);
//         return Promise.resolve(snapshots);
//       } catch (error) {
//         console.error("Error fetching snapshots in batch:", error);
//         throw error;
//       }
//     },
    
//     batchUpdateSnapshotsRequest: async (
//       snapshotData: {
//         subscribers: Subscriber<Snapshot<Data>>[];
//         snapshots: Snapshots<Data>;
//       }
//     ) => {
//       for (const subscriber of snapshotData.subscribers) {
//         const updatedSnapshot = await updateSnapshotForSubscriber(subscriber, snapshotData.snapshots);
//         subscriber.receiveSnapshot(updatedSnapshot);
//       }
    
//       const updatedSnapshots = await updateMainSnapshots(snapshotData.snapshots);
    
//       return {
//         subscribers: snapshotData.subscribers,
//         snapshots: updatedSnapshots,
//       };
//     },
    
//     batchFetchSnapshotsSuccess: () => {
//       return [];
//     },
//     batchFetchSnapshotsFailure: (payload) => { },
//     batchUpdateSnapshotsFailure: (payload) => { },
//     notifySubscribers: () => {
//       return [];
//     },
//     removeSnapshot: function (
//       snapshotToRemove: SnapshotStore<Snapshot<Data>, Data>
//     ): void {
//       this.snapshots = this.snapshots.filter(
//         (snapshot) => snapshot !== snapshotToRemove
//       );
//     },
//     addSnapshot: function (snapshot: SnapshotStore<Snapshot<Data>, Data>): void {
//       this.snapshots.push(snapshot);
//     },
//     getSubscribers: function (): Subscriber<Snapshot<Data>>[] {
//       return this.subscribers;
//     },
//     addSubscriber: function (subscriber: Subscriber<Snapshot<Data>>): void {
//       this.subscribers.push(subscriber);
//     },
//     validateSnapshot: function (snapshot: Snapshot<Data>): boolean {
//       if (!snapshot.id || typeof snapshot.id !== 'string') {
//         console.error("Invalid snapshot ID");
//         return false;
//       }
//       if (!(snapshot.timestamp instanceof Date)) {
//         console.error("Invalid timestamp");
//         return false;
//       }
//       if (!snapshot.data) {
//         console.error("Data is required");
//         return false;
//       }
//       return true;
//     },
//     getSnapshot: async function (
//       snapshot: () => Promise<{
//         category: any;
//         timestamp: any;
//         id: any;
//         snapshot: SnapshotStore<Snapshot<Data>, Data>;
//         data: Data;
//       }> | undefined
//     ): Promise<SnapshotStore<Snapshot<Data>, Data>> {
//       try {
//         const result = await snapshot();
//         if (!result) {
//           throw new Error("Snapshot not found");
//         }
//         const { category, timestamp, id, snapshot: storeSnapshot, data } = result;
//         return storeSnapshot;
//       } catch (error) {
//         console.error("Error fetching snapshot:", error);
//         throw error;
//       }
//     },
//     batchTakeSnapshotsRequest: (snapshotData: any) => {
//       console.log("Batch snapshot taking requested.");
//       return Promise.resolve({ snapshots: [] });
//     },
//     updateSnapshotSuccess: () => {
//       console.log("Snapshot updated successfully.");
//     },
//     batchUpdateSnapshotsSuccess: (
//       subscribers: Subscriber<Snapshot<Data>>[],
//       snapshots: Snapshots<Data>
//     ) => {
//       try {
//         console.log("Batch snapshots updated successfully.");
//         return [{ snapshots }];
//       } catch (error) {
//         console.error("Error in batch snapshots update:", error);
//         throw error;
//       }
//     },
//     getData: async () => {
//       try {
//         const data = await fetchData(String(endpoints));
//         if (data && data.data) {
//           return data.data.map((snapshot: any) => ({
//             ...snapshot,
//             data: snapshot.data as Data,
//           }));
//         }
//         return [];
//       } catch (error) {
//         console.error("Error fetching data:", error);
//         throw error;
//       }
//     },
//     [Symbol.iterator]: function* () { },
//     [Symbol.asyncIterator]: async function* () { },
//   },
// };

// export { snapshotConfig };
// export default SnapshotStoreConfig;
