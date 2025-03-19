// SnapshotType.ts
import {
    snapshotContainer,
    SnapshotContainer,
    SnapshotDataType,
  } from "./SnapshotContainer";
  import { StructuredMetadata } from "@/app/configs/StructuredMetadata";

import { CriteriaType } from "@/app/pages/searchs/CriteriaType";
import { Snapshot } from "@/app/components/snapshots/LocalStorageSnapshotStore";

const snapshotType = <
  T extends BaseData<any>,
  K extends T = T,
  Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>,
  ExcludedFields extends keyof T = never
>(
  snapshotObj: Snapshot<T, K>,
  snapshot: (
    id: string | number | undefined,
    snapshotData: SnapshotData<T, K>,
    category: symbol | string | Category | undefined,
    callback: (snapshot: Snapshot<T, K>) => void,
    criteria: CriteriaType,
    snapshotId?: string | number | null,
    snapshotStoreConfigData?: SnapshotStoreConfig<T, K>,
    snapshotContainer?: SnapshotStore<T, K> | Snapshot<T, K> | null
  ) => Promise<Snapshot<T, K>>
): Promise<Snapshot<T, K>> => {
  const newSnapshot = { ...snapshotObj }; // Shallow copy of the snapshot

  // Handle SnapshotStore<BaseData> or Snapshot<BaseData>
  if (snapshotObj.initialState && "store" in snapshotObj.initialState) {
    newSnapshot.initialState = snapshotObj.initialState;
  } else if (snapshotObj.initialState && "data" in snapshotObj.initialState) {
    newSnapshot.initialState = snapshotObj.initialState;
  } else {
    newSnapshot.initialState = null; // Handle null or undefined case
  }

  const config = newSnapshot.config || [];

  // Async function to get criteria and snapshot data
  const getCriteriaAndData = async (): Promise<{
    snapshotContainer: SnapshotContainer<T, K>;
    snapshotId?: string | number | null;
    snapshotData: SnapshotData<T, K>;
    snapshot?: (
      id: string | number | null | undefined,
      snapshotId: string | null,
      snapshotData: SnapshotData<T, K>,
      category: symbol | string | Category | undefined,
      callback: (snapshot: Snapshot<T, K>) => void,
      criteria: CriteriaType,
      snapshotStoreConfigData?: SnapshotStoreConfig<
        SnapshotWithCriteria<any, BaseData>,
        SnapshotWithCriteria<any, BaseData<any, any>>
      >,
      snapshotContainerData?: SnapshotStore<T, K> | Snapshot<T, K> | null
    ) => Promise<SnapshotData<T, K>>;
    snapshotObj?: Snapshot<T, K> | undefined;
  }> => {
    if (newSnapshot.snapshotId === undefined) {
      throw new Error("can't find snapshotId");
    }

    let criteria = await snapshotApi.getSnapshotCriteria(newSnapshot, snapshot);
    const tempSnapshotId = await snapshotApi.getSnapshotId(criteria);
    if (tempSnapshotId === undefined) {
      throw new Error("Failed to get snapshot ID");
    }

    // Retrieve snapshot data here; assuming you have a function to fetch it
    let snapshotData: SnapshotDataType<T, K> | undefined;

    if (!snapshotData && isSnapshot(snapshotData)) {
      // snapshotData is guaranteed to be of type Snapshot<T, K> here
    } else {
      throw new Error(
        "Failed to get snapshot data or data is not in the expected format"
      );
    }

    if (snapshot === undefined) {
      throw new Error("Snapshot is undefined");
    }

    // Mock of a cached data check (replace with your actual caching mechanism)
    const cachedData = getCachedSnapshotData(String(snapshotId)) as
      | SnapshotData<T, K>
      | undefined;

    const storeId = useSecureStoreId();
    const snapshotStoreConfig = snapshotApi.getSnapshotStoreConfig(
      null,
      {} as SnapshotContainer<T, K>,
      {},
      Number(storeId),
      snapshotFunction
    );

    try {
      if (cachedData) {
        // If cached data is available, use it
        console.log("Using cached data");
        snapshotData = cachedData;
      } else {
        // If no cached data, fetch from an API
        console.log("Fetching data from API");
        const endpoint = "/api/snapshot";
        const id = 123;

        // Check if the snapshotDelegate returns a non-empty array
        const configs = snapshotDelegate(snapshotStoreConfig);
        if (configs.length > 0) {
          // Use the first configuration to fetch the data
          const fetchedData = configs[0].fetchSnapshotData(endpoint, id);

          // Assuming `fetchSnapshotData` returns data in the format `SnapshotStore<T, K>`
          if (
            isSnapshotDataType<T, K>(fetchedData) &&
            snapshotData !== undefined
          ) {
            snapshotData = fetchedData; // Safe to assign now
          } else {
            throw new Error(
              "Fetched data is not of type SnapshotDataType<T, K>."
            );
          }
        } else {
          throw new Error("No SnapshotStoreConfig found.");
        }
      }
    } catch (error) {
      // Handle the error and provide a fallback
      console.error(
        "Failed to fetch data, falling back to default value",
        error
      );
      snapshotData = new Map<string, Snapshot<T, K>>();
    }

    if (snapshotData === undefined) {
      throw new Error("Snapshot data is undefined");
    }

    return {
      snapshotContainer,
      snapshotId: tempSnapshotId.toString(),
      snapshotData: snapshotData,
    };
  };
  // Ensure the async operation completes before using the results
  const { snapshotContainer, criteria, snapshotData, snapshotContainerData } =
    await getCriteriaAndData();

  // Ensure snapshotContainerData has all required properties for SnapshotContainer
  const completeSnapshotContainerData: SnapshotContainer<T, K> = {
    getSnapshot: newSnapshot.getSnapshot
      ? newSnapshot.getSnapshot
      : async (
          snapshotId: string | number | null,
          storeId: number,
          additionalHeaders?: Record<string, string>
        ) => {
          // Return a rejected promise or handle the error as appropriate
          return Promise.reject(new Error("getSnapshot not implemented"));
        },
    handleSnapshotFailure: newSnapshot.handleSnapshotFailure
      ? newSnapshot.handleSnapshotFailure
      : () => {},
    getDataVersions: newSnapshot.getDataVersions
      ? newSnapshot.getDataVersions
      : async (id: number) => {
          // Return a rejected promise or handle the error as appropriate
          return Promise.resolve(undefined); // or some sensible default
        },
    updateDataVersions: newSnapshot.updateDataVersions
      ? newSnapshot.updateDataVersions
      : () => {},

    removeData: newSnapshot.removeData ? newSnapshot.removeData : () => {},
    updateData: newSnapshot.updateData ? newSnapshot.updateData : () => {},
    initialState: newSnapshot.initialState
      ? newSnapshot.initialState
      : () => {},

    name: newSnapshot.name ? newSnapshot.name : "",
    snapshots: newSnapshot.snapshots ? newSnapshot.snapshots : [],
    find: newSnapshot.find,
    isExpired: newSnapshot.isExpired,

    id: newSnapshot.id,
    // parentId: newSnapshot.parentId || null,
    // childIds: newSnapshot.childIds || [],
    mapSnapshotWithDetails: newSnapshot.mapSnapshotWithDetails,

    taskIdToAssign: newSnapshot.taskIdToAssign,
    initialConfig: newSnapshot.initialConfig || {},
    removeSubscriber: newSnapshot.removeSubscriber,
    onInitialize: newSnapshot.onInitialize,
    onError: newSnapshot.onError,
    snapshot: newSnapshot.snapshot,
    snapshotsArray: [],
    snapshotsObject: {},
    snapshotStore: newSnapshot.snapshotStore || ({} as SnapshotStore<T, K>), // Provide a default empty object if null
    mappedSnapshotData: newSnapshot.mappedSnapshotData || undefined,
    timestamp: newSnapshot.timestamp,
    snapshotData: newSnapshot.snapshotData || undefined,
    data: newSnapshot.data,

    currentCategory: newSnapshot.currentCategory,
    setSnapshotCategory: newSnapshot.setSnapshotCategory,
    getSnapshotCategory: newSnapshot.getSnapshotCategory,
    items: newSnapshot.items,

    config: newSnapshot.config,
    subscribers: newSnapshot.subscribers,
    getSnapshotData: newSnapshot.getSnapshotData,
    deleteSnapshot: newSnapshot.deleteSnapshot,

    criteria: newSnapshot.criteria,
    content: newSnapshot.content,
    snapshotCategory: newSnapshot.snapshotCategory,
    snapshotSubscriberId: newSnapshot.snapshotSubscriberId,

    isCore: newSnapshot.isCore,
    subscriberManagement: {
      notify: newSnapshot.notify,
      notifySubscribers: newSnapshot.notifySubscribers,
      subscribers: newSnapshot.subscribers,
      snapshotSubscriberId: newSnapshot.snapshotSubscriberId,
      isSubscribed: newSnapshot.isSubscribed,
      getSubscribers: newSnapshot.getSubscribers,
      subscribe: newSnapshot.subscribe,
      subscribeToSnapshot: newSnapshot.subscribeToSnapshot,
      subscribeToSnapshotList: newSnapshot.subscribeToSnapshotList,
      unsubscribeFromSnapshot: newSnapshot.unsubscribeFromSnapshot,

      // setSnapshotCategory: newSnapshot.setSnapshotCategory,
      // getSnapshotCategory: newSnapshot.getSnapshotCategory,
      // getSnapshotData: newSnapshot.getSnapshotData,
      // deleteSnapshot: newSnapshot.deleteSnapshot,
      manageSubscription: newSnapshhot.manageSubscription,
      subscribeToSnapshotsSuccess: newSnapshot.subscribeToSnapshotsSuccess,
      unsubscribeFromSnapshots: newSnapshot.unsubscribeFromSnapshots,
      unsubscribe: newSnapshot.unsubscribe,
      subscribeToSnapshots: newSnapshot.subscribeToSnapshots,

      clearSnapshot: newSnapshot.clearSnapshot,
      clearSnapshotSuccess: newSnapshot.clearSnapshotSuccess,
      addToSnapshotList: newSnapshot.addToSnapshotList,
      removeSubscriber: newSnapshot.removeSubscriber,

      addSnapshotSubscriber: newSnapshot.addSnapshotSubscriber,
      removeSnapshotSubscriber: newSnapshot.removeSnapshotSubscriber,
      transformSubscriber: newSnapshot.transformSubscriber,
      defaultSubscribeToSnapshots: newSnapshot.defaultSubscribeToSnapshots,
      getSnapshotsBySubscriber: newSnapshot.getSnapshotsBySubscriber,
      getSnapshotsBySubscriberSuccess:
        newSnapshot.getSnapshotsBySubscriberSuccess,
    },
    getSnapshots: newSnapshot.getSnapshots,

    getAllSnapshots: newSnapshot.getAllSnapshots,
    generateId: newSnapshot.generateId,
    compareSnapshots: newSnapshot.compareSnapshots,
    compareSnapshotItems: newSnapshot.compareSnapshotItems,

    batchTakeSnapshot: newSnapshot.batchTakeSnapshot,
    batchFetchSnapshots: newSnapshot.batchFetchSnapshots,
    batchTakeSnapshotsRequest: newSnapshot.batchTakeSnapshotsRequest,
    batchUpdateSnapshotsRequest: newSnapshot.batchUpdateSnapshotsRequest,

    filterSnapshotsByStatus: newSnapshot.filterSnapshotsByStatus,
    filterSnapshotsByCategory: newSnapshot.filterSnapshotsByCategory,
    filterSnapshotsByTag: newSnapshot.filterSnapshotsByTag,
    batchFetchSnapshotsSuccess: newSnapshot.batchFetchSnapshotsSuccess,

    batchFetchSnapshotsFailure: newSnapshot.batchFetchSnapshotsFailure,
    batchUpdateSnapshotsSuccess: newSnapshot.batchUpdateSnapshotsSuccess,
    batchUpdateSnapshotsFailure: newSnapshot.batchUpdateSnapshotsFailure,
    handleSnapshotSuccess: newSnapshot.handleSnapshotSuccess,

    getSnapshotId: newSnapshot.getSnapshotId,
    compareSnapshotState: newSnapshot.compareSnapshotState,
    payload: newSnapshot.payload,
    dataItems: newSnapshot.dataItems,

    newData: newSnapshot.newData,
    getInitialState: newSnapshot.getInitialState,
    getConfigOption: newSnapshot.getConfigOption,
    getTimestamp: newSnapshot.getTimestamp,

    getStores: newSnapshot.getStores,
    getData: newSnapshot.getData,
    setData: newSnapshot.setData,
    addData: newSnapshot.addData,

    stores: newSnapshot.stores,
    getStore: newSnapshot.getStore,
    addStore: newSnapshot.addStore,
    mapSnapshot: newSnapshot.mapSnapshot,

    removeStore: newSnapshot.removeStore,
    unsubscribe: newSnapshot.unsubscribe,
    fetchSnapshot: newSnapshot.fetchSnapshot,

    fetchSnapshotSuccess: newSnapshot.fetchSnapshotSuccess,
    updateSnapshotFailure: newSnapshot.updateSnapshotFailure,
    fetchSnapshotFailure: newSnapshot.fetchSnapshotFailure,
    addSnapshotFailure: newSnapshot.addSnapshotFailure,

    configureSnapshotStore: newSnapshot.configureSnapshotStore,
    updateSnapshotSuccess: newSnapshot.updateSnapshotSuccess,
    createSnapshotFailure: newSnapshot.createSnapshotFailure,
    createSnapshotSuccess: newSnapshot.createSnapshotSuccess,

    createSnapshots: newSnapshot.createSnapshots,
    storeId: newSnapshot.storeId,
    snapConfig: newSnapshot.snapConfig,
    onSnapshot: newSnapshot.onSnapshot,
    onSnapshots: newSnapshot.onSnapshots,
    events: newSnapshot.events,
    childIds: newSnapshot.childIds,
    getParentId: newSnapshot.getParentId,

    getChildIds: newSnapshot.getChildIds,
    addChild: newSnapshot.addChild,
    removeChild: newSnapshot.removeChild,
    getChildren: newSnapshot.getChildren,

    hasChildren: newSnapshot.hasChildren,
    isDescendantOf: newSnapshot.isDescendantOf,
    getSnapshotById: newSnapshot.getSnapshotById,

    // Add any other required properties here
  };

  // Return the newSnapshot as a Promise<Snapshot<T, K>>
  return Promise.resolve({
    ...newSnapshot,
    ...completeSnapshotContainerData,
    ...snapshotData,
  });
}


export snapshotType