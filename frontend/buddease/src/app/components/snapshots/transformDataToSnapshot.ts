// // transformDataToSnapshot.ts
// import { SnapshotConfig, SnapshotItem, SnapshotStoreConfig, SnapshotWithCriteria } from ".";
// import { Category } from "../libraries/categories/generateCategoryProperties";
// import { BaseData } from "../models/data/Data";
// import { RealtimeDataItem } from "../models/realtime/RealtimeData";
// import CalendarManagerStoreClass from "../state/stores/CalendarEvent";
// import { CoreSnapshot, Snapshot, SnapshotUnion, UpdateSnapshotPayload } from "./LocalStorageSnapshotStore";
// import SnapshotStore, { SubscriberCollection } from "./SnapshotStore";


// const transformDataToSnapshot = <T extends BaseData, K extends BaseData>(
//   item: CoreSnapshot<T, K>,
//   snapshotConfig: SnapshotConfig<T, K>,
//   snapshotStoreConfig: SnapshotStoreConfig<SnapshotUnion<T>, K> 
// ): Snapshot<T, K> => {
//   const snapshotItem: SnapshotItem<T, K> = {
    
//     id: item.id?.toString() ?? '', // Use nullish coalescing operator to provide default value
//     data: item.data as T | Map<string, Snapshot<T, K>> | null | undefined, // Adjust type to match Snapshot<T, K>
//     initialState: item.initialState as unknown as Snapshot<T, K> | null, // Cast to unknown first, then to Snapshot<T, K> | null
//     timestamp: item.timestamp ? new Date(item.timestamp) : new Date(), // Handle timestamp appropriately
//     events: {
//       eventRecords: item.events?.eventRecords ?? {},
//       callbacks: item.events?.callbacks ?? {}, // Default to empty object matching the Record<string, ((snapshot: Snapshot<T, K>) => void)[]> type
//       subscribers: [], // Ensure this matches the expected type for subscribers
//       eventIds: [],// Ensure this matches the expected type for eventIds
//       onSnapshotAdded: item.events?.onSnapshotAdded ?? ((event: string,
//           snapshot: Snapshot<T, K>,
//           snapshotId: string,
//           subscribers: SubscriberCollection<T, K>,
//           snapshotStore: SnapshotStore<T, K>, 
//           dataItems: RealtimeDataItem[],
//           subscriberId: string,
//           criteria: SnapshotWithCriteria<T, K>,
//           category: Category) => {}),
//       onSnapshotRemoved: item.events?.onSnapshotRemoved ?? ((event: string,
//         snapshot: Snapshot<T, K>,
//         snapshotId: string, 
//         subscribers: SubscriberCollection<T, K>,
//         snapshotStore: SnapshotStore<T, K>, 
//         dataItems: RealtimeDataItem[],
//         criteria: SnapshotWithCriteria<T, K>,
//         category: Category) => {}),
//       onSnapshotUpdated: item.events?.onSnapshotUpdated ?? ((event: string,
//         snapshotId: string,
//         snapshot: Snapshot<T, K>,
//         data: Map<string, Snapshot<T, K>>,
//         events: Record<string, CalendarManagerStoreClass<T, K>[]>,
//         snapshotStore: SnapshotStore<T, K>,
//         dataItems: RealtimeDataItem[],
//         newData: Snapshot<T, K>,
//         payload: UpdateSnapshotPayload<T>,
//         store: SnapshotStore<any, K>) => {}),
//       initialConfig: item.events?.initialConfig ?? {} as SnapshotConfig<T, K>,
//       removeSubscriber: item.events?.removeSubscriber ?? ((event: string,
//         snapshotId: string,
//         snapshot: Snapshot<T, K>,
//         snapshotStore: SnapshotStore<T, K>,
//         dataItems: RealtimeDataItem[],
//         criteria: SnapshotWithCriteria<T, K>,
//         category: Category) => {}),
//       onInitialize: item.events?.onInitialize ?? (() => {}),
//       onError: item.events?.onError ?? (() => {}),
//       on: item.events?.on ?? (() => {}),
//       off: item.events?.off ?? (() => {}),
//       emit: item.events?.emit ?? (() => {}),
//       once: item.events?.once ?? (() => {}),
//       addRecord: item.events?.addRecord ?? (() => {}),
//       removeAllListeners: item.events?.removeAllListeners ?? (() => {}),
//       subscribe: item.events?.subscribe ?? (() => {}),
//       unsubscribe: item.events?.unsubscribe ?? (() => {}),
//       trigger: item.events?.trigger ?? (() => {}),
//     },
//     meta: item.meta,
//     initialConfig: item.events?.initialConfig, 
//     removeSubscriber: item.snapshotStoreConfig?.removeSubscriber,
//     onInitialize: item.events?.onInitialize,
//     // // onError: item.onError,
//     // // snapshot: item.snapshot,
//     // // setCategory: item.setCategory,
//     // // applyStoreConfig: item.applyStoreConfig,
//     // // snapshotData: item.snapshotData,
   
//     // getSnapshotItems: item.getSnapshotItems,
//     // defaultSubscribeToSnapshots: item.defaultSubscribeToSnapshots,
//     // versionInfo: item.versionInfo,
//     // transformSubscriber: item.transformSubscriber,
   
//     // transformDelegate: item.transformDelegate,
//     // initializedState: item.initializedState,
//     // getAllKeys: item.getAllKeys,
//     // getAllItems: item.getAllItems,
    
//     // addDataStatus: item.addDataStatus,
//     // removeData: item.removeData,
//     // updateData: item.updateData,
//     // updateDataTitle: item.updateDataTitle,
   
//     // updateDataDescription: item.updateDataDescription,
//     // updateDataStatus: item.updateDataStatus,
//     // addDataSuccess: item.addDataSuccess,
//     // getDataVersions: item.getDataVersions,
   
//     // updateDataVersions: item.updateDataVersions,
//     // getBackendVersion: item.getBackendVersion,
//     // getFrontendVersion: item.getFrontendVersion,
//     // fetchData: item.fetchData,
   
//     // defaultSubscribeToSnapshot: item.defaultSubscribeToSnapshot,
//     // handleSubscribeToSnapshot: item.handleSubscribeToSnapshot,
//     // removeItem: item.removeItem,
//     // getSnapshot: item.getSnapshot,
   
//     // getSnapshotSuccess: item.getSnapshotSuccess,
//     setItem: item.setItem,
//     // getItem: item.getItem,
//     getDataStore: item.getDataStore,
   
//     getDataStoreMap: item.getDataStoreMap,
//     addSnapshotSuccess: item.addSnapshotSuccess,
//     deepCompare: item.deepCompare,
//     shallowCompare: item.shallowCompare,
    
//     getDataStoreMethods: item.getDataStoreMethods,
//     getDelegate: item.getDelegate,
//     determineCategory: item.determineCategory,
//     determinePrefix: item.determinePrefix,
   
//     removeSnapshot: item.removeSnapshot,
//     addSnapshotItem: item.addSnapshotItem,
//     addNestedStore: item.addNestedStore,
//     clearSnapshots: item.clearSnapshots,
   
//     addSnapshot: item.addSnapshot,
//     emit: item.emit,
//     createSnapshot: item.createSnapshot,
//     createInitSnapshot: item.createInitSnapshot,
   
//     addStoreConfig: item.addStoreConfig,
//     handleSnapshotConfig: item.handleSnapshotConfig,
//     getSnapshotConfig: item.getSnapshotConfig,
//     getSnapshotListByCriteria: item.getSnapshotListByCriteria,
   
//     setSnapshotSuccess: item.setSnapshotSuccess,
//     setSnapshotFailure: item.setSnapshotFailure,
//     updateSnapshots: item.updateSnapshots,
//     updateSnapshotsSuccess: item.updateSnapshotsSuccess,
   
//     updateSnapshotsFailure: item.updateSnapshotsFailure,
//     initSnapshot: item.initSnapshot,
//     takeSnapshot: item.takeSnapshot,
//     takeSnapshotSuccess: item.takeSnapshotSuccess,
   
//     takeSnapshotsSuccess: item.takeSnapshotsSuccess,
//     flatMap: item.flatMap,
//     getState: item.getState,
//     setState: item.setState,
   
//     validateSnapshot: item.validateSnapshot,
//     handleActions: item.handleActions,
//     setSnapshot: item.setSnapshot,
//     transformSnapshotConfig: item.transformSnapshotConfig,
   
//     setSnapshots: item.setSnapshots,
//     clearSnapshot: item.clearSnapshot,
//     mergeSnapshots: item.mergeSnapshots,
//     reduceSnapshots: item.reduceSnapshots,
   
//     sortSnapshots: item.sortSnapshots,
//     filterSnapshots: item.filterSnapshots,
//     findSnapshot: item.findSnapshot,
//     getSubscribers: item.getSubscribers,
   
//     notify: item.notify,
//     notifySubscribers: item.notifySubscribers,
//     getSnapshots: item.getSnapshots,
//     getAllSnapshots: item.getAllSnapshots,
   
//     generateId: item.generateId,
//     batchFetchSnapshots: item.batchFetchSnapshots,
//     batchTakeSnapshotsRequest: item.batchTakeSnapshotsRequest,
//     batchUpdateSnapshotsRequest: item.batchUpdateSnapshotsRequest,
   
//     filterSnapshotsByStatus: item.filterSnapshotsByStatus,
//     filterSnapshotsByCategory: item.filterSnapshotsByCategory,
//     filterSnapshotsByTag: item.filterSnapshotsByTag,
//     batchFetchSnapshotsSuccess: item.batchFetchSnapshotsSuccess,
   
//     batchFetchSnapshotsFailure: item.batchFetchSnapshotsFailure,
//     batchUpdateSnapshotsSuccess: item.batchUpdateSnapshotsSuccess,
//     batchUpdateSnapshotsFailure: item.batchUpdateSnapshotsFailure,
//     batchTakeSnapshot: item.batchTakeSnapshot,
    
//     handleSnapshotSuccess: item.handleSnapshotSuccess,
//     getSnapshotId: item.getSnapshotId,
//     compareSnapshotState: item.compareSnapshotState,
//     eventRecords: item.eventRecords,
   
//     snapshotStore: item.snapshotStore,
//     getParentId: item.getParentId,
//     getChildIds: item.getChildIds,
//     addChild: item.addChild,
   
//     removeChild: item.removeChild,
//     getChildren: item.getChildren,
//     hasChildren: item.hasChildren,
//     isDescendantOf: item.isDescendantOf,
    
//     dataItems: item.dataItems,
//     payload: item.payload,
//     newData: item.newData,
//     getInitialState: item.getInitialState,
   
//     getConfigOption: item.getConfigOption,
//     getTimestamp: item.getTimestamp,
//     getStores: item.getStores,
//     getData: item.getData,
    
//     setData: item.setData,
//     addData: item.addData,
//     stores: item.stores,
//     getStore: item.getStore,
   
//     addStore: item.addStore,
//     mapSnapshot: item.mapSnapshot,
//     mapSnapshots: item.mapSnapshots,
//     removeStore: item.removeStore,
    
//     subscribe: item.subscribe,
//     unsubscribe: item.unsubscribe,
//     fetchSnapshotFailure: item.fetchSnapshotFailure,
//     fetchSnapshot: item.fetchSnapshot,
   
//     addSnapshotFailure: item.addSnapshotFailure,
//     configureSnapshotStore: item.configureSnapshotStore,
//     fetchSnapshotSuccess: item.fetchSnapshotSuccess,
//     updateSnapshotFailure: item.updateSnapshotFailure,
    
//     updateSnapshotSuccess: item.updateSnapshotSuccess,
//     createSnapshotFailure: item.createSnapshotFailure,
//     createSnapshotSuccess: item.createSnapshotSuccess,
//     // createSnapshot: item.creatSnapshot,
//     // createSnapshots: item.createSnapshots,
//     onSnapshot: item.onSnapshot,
//     onSnapshots: item.onSnapshots,
//     updateSnapshot: item.updateSnapshot,
   
//     label: item.label,
//     restoreSnapshot: item.restoreSnapshot,
//     handleSnapshot: item.handleSnapshot,
//     subscribeToSnapshots: item.subscribeToSnapshots,
//     // subscribersts: item.subscribersts,
   
//   };

//   return snapshotItem;
// };

// export default transformDataToSnapshot;

