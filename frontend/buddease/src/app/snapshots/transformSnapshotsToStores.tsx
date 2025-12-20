// transformSnapshotsToStores.tsx
// import { initialSnapshot } from "@/app/models/cypto/exchangeIntegration";
// import { BaseData } from '@/app/models/data/Data';
// import { snapshotType } from "@/app/typings/YourSpecificSnapshotType";
// import { data } from "@/app/snapshots/SnapshotWithCriteria";
// import { Snapshot } from '@/app/snapshots/Snapshot';
// import { SnapshotStoreConfig, snapshotConfig } from "@/app/snapshots/SnapshotStoreConfig";
// import SnapshotStore from "./SnapshotStore";
// import { delegate, subscribeToSnapshots } from "@/app/snapshots/index";

// function transformSnapshotsToStores(snapshots: Snapshot<BaseData>[] | null): SnapshotStore<any>[] | null {
//     if (!snapshots) return null;
  
//     return snapshots.map(snapshot => new SnapshotStore<any>(
//         {
//             data: snapshot.data,
//             category: snapshot.category,
//             date: typeof snapshot.date === 'string' ? new Date(snapshot.date) : snapshot.date || new Date(),
//             type: snapshotType,
//             subscribers: [],
//             snapshots: [],
//             subscribeToSnapshots: subscribeToSnapshots,
//             snapshotConfig: snapshotConfig,
//             delegate: delegate,
//             dataStoreMethods: dataStoreMethods,
//         },
//         snapshot.initialState,
//         snapshot.category,
//         snapshot.date || new Date(),
//         snapshotType,
//         snapshotConfig,
//         subscribeToSnapshots,
//         delegate,
//         dataStoreMethods,
//     ));
// }

 
























// //   {
// //     id: snapshot.id,
// //     key: '', 
// //     topic: '',
// //     date: typeof snapshot.date === 'string' ? new Date(snapshot.date) : snapshot.date, // Convert string to Date
// //     configOption: null,
// //     config: null,
// //     subscription: null,
// //     category: undefined,
// //     timestamp: typeof snapshot.date === 'string' ? new Date(snapshot.date) : snapshot.date, // Convert string to Date
// //     type: '',
// //     subscribers: [],
// //     set: undefined,
// //     data: new Map([[String(snapshot.id), snapshot.data]]), // Convert id to string
// //     state: null,
// //     initialState: new Map<string, any>(), // Initialize initialState here as needed
// //     snapshots: [],
// //     subscribeToSnapshots: () => {},
// //     snapshotConfig: {},
// //     dataStore: undefined,
// //     dataStoreMethods: {},
// //     delegate: [],
// //     subscriberId: '',
// //     length: 0,
// //     content: '',
// //     value: '',
// //     todoSnapshotId: '',
// //     getAllKeys: () => [],
// //     getAllItems: () => [],
// //     addData: () => {},
// //     addDataStatus: '',
// //     removeData: () => {},
// //     updateData: () => {},
// //     updateDataTitle: () => {},
// //     updateDataDescription: () => {},
// //     updateDataStatus: () => {},
// //     addDataSuccess: () => {},
// //     getDataVersions: () => [],
// //     updateDataVersions: () => {},
// //     getBackendVersion: () => '',
// //     getFrontendVersion: () => '',
// //     fetchData: () => {},
// //     snapshot: {},
// //     removeItem: () => {},
// //     getSnapshot: () => {},
// //     getSnapshotId: () => '',
// //     getItem: () => {},
// //     setItem: () => {},
// //     addSnapshotFailure: () => {},
// //     getDataStore: () => {},
// //     addSnapshotSuccess: () => {},
// //     compareSnapshotState: () => false,
// //     deepCompare: () => false,
// //     shallowCompare: () => false,
// //     getDelegate: () => [],
// //     determineCategory: () => '',
// //     determinePrefix: () => '',
// //     updateSnapshot: () => {},
// //     updateSnapshotSuccess: () => {},
// //     updateSnapshotFailure: () => {},
// //     removeSnapshot: () => {},
// //     clearSnapshots: () => {},
// //     addSnapshot: () => {},
// //     createSnapshot: () => {},
// //     createSnapshotSuccess: () => {},
// //     setSnapshotSuccess: () => {},
// //     setSnapshotFailure: () => {},
// //     createSnapshotFailure: () => {},
// //     updateSnapshots: () => {},
// //     updateSnapshotsSuccess: () => {},
// //     updateSnapshotsFailure: () => {},
// //     initSnapshot: () => {},
// //     takeSnapshot: () => {},
// //     takeSnapshotSuccess: () => {},
// //     takeSnapshotsSuccess: () => {},
// //     configureSnapshotStore: () => {},
// //     getData: () => ({}),
// //     flatMap: () => [],
// //     setData: () => {},
// //     getState: () => null,
// //     setState: () => {},
// //     validateSnapshot: () => false,
// //     handleSnapshot: () => {},
// //     handleActions: () => {},
// //     setSnapshot: () => {},
// //     transformSnapshotConfig: () => ({}),
// //     setSnapshotData: () => {},
// //     setSnapshots: () => {},
// //     clearSnapshot: () => {},
// //     mergeSnapshots: () => [],
// //     reduceSnapshots: () => {},
// //     sortSnapshots: () => [],
// //     filterSnapshots: () => [],
// //     mapSnapshots: () => [],
// //     findSnapshot: () => ({}),
// //     getSubscribers: () => [],
// //     notify: () => {},
// //     notifySubscribers: () => {},
// //     subscribe: () => {},
// //     unsubscribe: () => {},
// //     fetchSnapshot: () => {},
// //     fetchSnapshotSuccess: () => {},
// //     fetchSnapshotFailure: () => {},
// //     getSnapshots: () => [],
// //     getAllSnapshots: () => [],
// //     generateId: () => '',
// //     batchFetchSnapshots: () => {},
// //     batchTakeSnapshotsRequest: () => {},
// //     batchUpdateSnapshotsRequest: () => {},
// //     batchFetchSnapshotsSuccess: () => {},
// //     batchFetchSnapshotsFailure: () => {},
// //     batchUpdateSnapshotsSuccess: () => {},
// //     batchUpdateSnapshotsFailure: () => {},
// //     batchTakeSnapshot: () => {},
// //     handleSnapshotSuccess: () => {},
// //     [Symbol.iterator]: function* () {
// //       yield* this.data;
// //     }
// //   }