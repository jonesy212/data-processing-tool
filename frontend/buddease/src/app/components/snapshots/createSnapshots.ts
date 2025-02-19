// import CalendarManagerStoreClass from "@/app/components/state/stores/CalendarManagerStore";
// import { CreateSnapshotStoresPayload } from "../database/Payload";
// import { SnapshotManager } from "../hooks/useSnapshotManager";
// import { Category } from "../libraries/categories/generateCategoryProperties";
// import { Data } from "../models/data/Data";
// import { defaultSubscribeToSnapshots } from "./defaultSubscribeToSnapshots";
// import { Snapshot } from "./LocalStorageSnapshotStore";
// import { SnapshotConfig } from "./SnapshotConfig";
// import { getSnapshotItems } from "./snapshotOperations";

// // createSnapshots.ts
// const createSnapshots = <T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(
//     id: string,
//     snapshotId: string,
//     snapshot: Snapshot<T, K>,
//     snapshotManager: SnapshotManager<T, K>,
//     payload: CreateSnapshotStoresPayload<T, K>,
//     callback: (snapshots: Snapshot<T, K>[]) => void | null,
//     snapshotConfig?: SnapshotConfig<T, K>[],
//     category?: string | symbol | Category | undefined,
//   ): Snapshot<T, K>[] | null => {
//     const { data, events, dataItems, newData } = payload;
    
//     // Example logic to create multiple snapshots
//     const snapshots: Snapshot<T, K>[] = [];
  
//     const eventRecords: Record<string, CalendarManagerStoreClass<T, K>[]> = (events && typeof events === 'object') 
//     ? events 
//       : {};
  
//     data?.forEach((snapshotData: T, key: string) => {
//        // Ensure eventRecords is of type Record<string, CalendarEvent<T, K>[]> or null
//       const newSnapshot: Snapshot<T, K> = {
//         // ...snapshot,
//         id: key,
//         data: snapshotData,
//         eventRecords: eventRecords,
//         newData: newData,
//         dataItems: dataItems,
//         snapshotStoreConfig: null,
//         getSnapshotItems: getSnapshotItems ?? (() => {}),
//         defaultSubscribeToSnapshots: defaultSubscribeToSnapshots,
//         transformSubscriber: transformSubscriber,
//         transformDelegate: transformDelegate,
//         initializedState: undefined,
//         getAllKeys: getAllKeys,
//         getAllItems: getAllItems,
//         addDataStatus: addDataStatus,
//         removeData: removeData,
//         updateData: updateData,
//         updateDataTitle: updateDataTitle,
//         updateDataDescription: updateDataDescription,
//         updateDataStatus: updateDataStatus,
//         addDataSuccess: addDataSuccess,
//         getDataVersions: getDataVersions,
//         updateDataVersions: updateDataVersions,
//         getBackendVersion: getBackendVersion,
//         getFrontendVersion: getFrontendVersion,
//         fetchData: fetchData,
//         defaultSubscribeToSnapshot: defaultSubscribeToSnapshot,
//         handleSubscribeToSnapshot: handleSubscribeToSnapshot,
//         removeItem: removeItem,
//         getSnapshot: getSnapshot,
//         getSnapshotSuccess: getSnapshotSuccess,
//         setItem: setItem,
//         getDataStore: {},
//         addSnapshotSuccess: addSnapshotSuccess,
//         deepCompare: deepCompare,
//         shallowCompare: shallowCompare,
//         getDataStoreMethods: getDataStoreMethods,
//         getDelegate: getDelegate,
//         determineCategory: determineCategory,
//         determinePrefix: determinePrefix,
//         removeSnapshot: removeSnapshot,
//         addSnapshotItem: addSnapshotItem,
//         addNestedStore: addNestedStore,
//         clearSnapshots: clearSnapshots,
//         addSnapshot: addSnapshot,
//         createSnapshot: null,
//         createInitSnapshot: createInitSnapshot,
//         setSnapshotSuccess: setSnapshotSuccess,
//         setSnapshotFailure: setSnapshotFailure,
//         updateSnapshots: updateSnapshots,
//         updateSnapshotsSuccess: updateSnapshotsSuccess,
//         updateSnapshotsFailure: updateSnapshotsFailure,
//         initSnapshot: initSnapshot,
//         takeSnapshot: takeSnapshot,
//         takeSnapshotSuccess: takeSnapshotSuccess,
//         takeSnapshotsSuccess: takeSnapshotsSuccess,
//         flatMap: flatMap,
//         getState: getState,
//         setState: setState,
//         validateSnapshot: validateSnapshot,
//         handleActions: handleActions,
//         setSnapshot: setSnapshot,
//         transformSnapshotConfig: transformSnapshotConfig,
//         setSnapshots: setSnapshots,
//         clearSnapshot: clearSnapshot,
//         mergeSnapshots: mergeSnapshots,
//         reduceSnapshots: reduceSnapshots,
//         sortSnapshots: sortSnapshots,
//         filterSnapshots: filterSnapshots,
//         findSnapshot: findSnapshot,
//         getSubscribers: getSubscribers,
//         notify: notify,
//         notifySubscribers: notifySubscribers,
//         getSnapshots: getSnapshots,
//         getAllSnapshots: getAllSnapshots,
//         generateId: generateId,
//         batchFetchSnapshots: batchFetchSnapshots,
//         batchTakeSnapshotsRequest: batchTakeSnapshotsRequest,
//         batchUpdateSnapshotsRequest: batchUpdateSnapshotsRequest,
//         filterSnapshotsByStatus: undefined,
//         filterSnapshotsByCategory: undefined,
//         filterSnapshotsByTag: undefined,
//         batchFetchSnapshotsSuccess: batchFetchSnapshotsSuccess,
//         batchFetchSnapshotsFailure: batchFetchSnapshotsFailure,
//         batchUpdateSnapshotsSuccess: batchUpdateSnapshotsSuccess,
//         batchUpdateSnapshotsFailure: batchUpdateSnapshotsFailure,
//         batchTakeSnapshot: batchTakeSnapshot,
//         handleSnapshotSuccess: handleSnapshotSuccess,
//         getSnapshotId: getSnapshotId,
//         compareSnapshotState: compareSnapshotState,
//         snapshotStore: null,
//         getParentId: getParentId,
//         getChildIds: getChildIds,
//         addChild: addChild,
//         removeChild: removeChild,
//         getChildren: getChildren,
//         hasChildren: hasChildren,
//         isDescendantOf: isDescendantOf,
//         timestamp: undefined,
//         getInitialState: getInitialState,
//         getConfigOption: getConfigOption,
//         getTimestamp: getTimestamp,
//         getStores: getStores,
//         getData: getData,
//         setData: setData,
//         addData: addData,
//         stores: null,
//         getStore: getStore,
//         addStore: addStore,
//         mapSnapshot: mapSnapshot,
//         mapSnapshots: mapSnapshots,
//         removeStore: removeStore,
//         unsubscribe: unsubscribe,
//         fetchSnapshot: fetchSnapshot,
//         addSnapshotFailure: addSnapshotFailure,
//         configureSnapshotStore: configureSnapshotStore,
//         updateSnapshotSuccess: updateSnapshotSuccess,
//         createSnapshotFailure: createSnapshotFailure,
//         createSnapshotSuccess: createSnapshotSuccess,
//         createSnapshots: createSnapshots,
//         onSnapshot: onSnapshot,
//         onSnapshots: onSnapshots,
//         label: undefined,
//         events: {
//           callbacks: callbacks,
//           eventRecords: null
//         },
//         handleSnapshot: handleSnapshot,
//         meta: {}
//       };
      
//       snapshots.push(newSnapshot);
//     });
  
//     // Call the callback function with the created snapshots
//     if (callback) {
//       callback(snapshots);
//     }
  
//     return snapshots.length > 0 ? snapshots : null;
//   };
  