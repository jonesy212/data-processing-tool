import { SnapshotData } from '@/app/components/snapshots';
// snapshotOperations.ts
// import { getSnapshot } from "@/app/api/SnapshotApi"
import { CategoryProperties } from "@/app/pages/personas/ScenarioBuilder";

import { UnifiedMetaDataOptions } from "@/app/configs/database/MetaDataOptions";
import { CriteriaType } from "@/app/pages/searchs/CriteriaType";
import { SnapshotContainer, SnapshotStoreProps, SubscriberCollection } from ".";
import { SnapshotManager } from "../hooks/useSnapshotManager";
import { Category } from "../libraries/categories/generateCategoryProperties";
import { Content } from "../models/content/AddContent";
import { BaseData, Data } from "../models/data/Data";
import { Meta } from '../models/data/dataStoreMethods';
import { RealtimeDataItem } from "../models/realtime/RealtimeData";
import { DataStoreMethods } from "../projects/DataAnalysisPhase/DataProcessing/ DataStoreMethods";
import CalendarManagerStoreClass from "../state/stores/CalendarEvent";
import { convertSnapshotContainerToStore } from "../typings/YourSpecificSnapshotType";
import { Subscriber } from "../users/Subscriber";
import { createVersionInfo } from "../versions/createVersionInfo";
import { Snapshot, Snapshots, SnapshotsArray, SnapshotUnion, UpdateSnapshotPayload } from "./LocalStorageSnapshotStore";
import { SnapshotItem } from "./SnapshotList";
import SnapshotStore from "./SnapshotStore";
import { SnapshotStoreConfig } from "./SnapshotStoreConfig";



interface SnapshotOperations<T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T> {
  // Existing methods
  mapSnapshot: (snapshot: Snapshot<T, Meta, K>) => any;
  mapSnapshotWithDetails: (snapshot: Snapshot<T, Meta, K>) => any;
  removeStore: (id: string) => void;
  fetchSnapshot: (id: string) => Promise<Snapshot<T, Meta, K>>;
  fetchSnapshotSuccess: (snapshot: Snapshot<T, Meta, K>) => void;
  updateSnapshotFailure: (snapshot: Snapshot<T, Meta, K>, error: Error) => void;
  fetchSnapshotFailure: (id: string, error: Error) => void;
  configureSnapshotStore: (options: any) => void;
  onSnapshot: (snapshot: Snapshot<T, Meta, K>) => void;
  onSnapshots: (snapshots: Snapshots<Data, Meta>) => void;
  events: any[];
  parentId: string;
  childIds: string[];

  // New methods
  getParentId: (snapshot: Snapshot<T, Meta, K>) => string | null;
  getChildIds: (childSnapshot: Snapshot<T, Meta, K>) => string[];
  clearSnapshotFailure: () => unknown;
  validateSnapshot: (snapshot: Snapshot<T, Meta, K>) => boolean;
  getSnapshot: (id: string) => Promise<Snapshot<T, Meta, K>>;
  takeSnapshot: (snapshot: Snapshot<T, Meta, K>, subscribers: Subscriber<T, Meta, K>[]) => Promise<{ snapshot: Snapshot<T, Meta, K>; }>;
  removeSnapshot: (snapshotToRemove: SnapshotStore<T, Meta, K>) => void;
  updateSnapshot: (
    snapshotId: string,
    data: Map<string, Snapshot<T, Meta, K>>,
    events: Record<string, CalendarManagerStoreClass<T, Meta, K>[]>,
    snapshotStore: SnapshotStore<T, Meta, K>,
    dataItems: RealtimeDataItem[],
    newData: Snapshot<T, Meta, K>,
    payload: UpdateSnapshotPayload<Data>,
    store: SnapshotStore<any, Meta, BaseData>
  ) => Promise<{ snapshot: Snapshot<any, Meta, Data>; }>;
  getSnapshots: (category: string, data: Snapshots<Data, Meta>) => Snapshots<Data, Meta>;
  getSnapshotItems: (category: symbol | string | Category | undefined, snapshots: SnapshotsArray<Data, Meta>) => Promise<{ snapshots: SnapshotItem<T, Meta, K>[]; }>;
  getSnapshotContainer: (
    id: string | number,
    snapshotFetcher: (id: string | number) => Promise<{
      category: string;
      timestamp: string;
      id: string;
      snapshotStore: SnapshotStore<T, Meta, K>;
      snapshot: Snapshot<T, Meta, K>;
      snapshots: Snapshots<Data, Meta>;
      subscribers: Subscriber<T, Meta, K>[];
      data: Data;
      newData: Data;
      unsubscribe: () => void;
      addSnapshotFailure: (snapshotManager: SnapshotManager<T, Meta, K>, snapshot: Snapshot<T, Meta, K>, payload: { error: Error }) => void;
      createSnapshotSuccess: (snapshot: Snapshot<T, Meta, K>) => void;
      createSnapshotFailure: (snapshotManager: SnapshotManager<T, Meta, K>, snapshot: Snapshot<T, Meta, K>, payload: { error: Error }) => void;
      updateSnapshotSuccess: (snapshot: Snapshot<T, Meta, K>) => void;
      batchUpdateSnapshotsSuccess: (snapshots: Snapshots<Data, Meta>) => void;
      batchUpdateSnapshotsFailure: (snapshotManager: SnapshotManager<T, Meta, K>, snapshot: Snapshot<T, Meta, K>, payload: { error: Error }) => void;
      batchUpdateSnapshotsRequest: (snapshots: Snapshots<Data, Meta>) => void;
      createSnapshots: (snapshots: Snapshots<Data, Meta>) => void;
      batchTakeSnapshot: (snapshot: Snapshot<T, Meta, K>) => void;
      batchTakeSnapshotsRequest: (snapshots: Snapshots<Data, Meta>) => void;
      deleteSnapshot: (id: string) => void;
      batchFetchSnapshots: (criteria: any) => Promise<Snapshots<Data, Meta>>;
      batchFetchSnapshotsSuccess: (snapshots: Snapshots<Data, Meta>) => void;
      batchFetchSnapshotsFailure: (snapshotManager: SnapshotManager<T, Meta, K>, snapshot: Snapshot<T, Meta, K>, payload: { error: Error }) => void;
      filterSnapshotsByStatus: (status: string) => Snapshots<Data, Meta>;
      getSnapshotSuccess: (snapshot: Snapshot<T, Meta, K>) => void;
      removeSnapshot: (id: string) => void;
      removeSnapshots: (ids: string[]) => void;
      removeSnapshotsSuccess: (ids: string[]) => void;
      removeSnapshotsFailure: (snapshotManager: SnapshotManager<T, Meta, K>, snapshot: Snapshot<T, Meta, K>, payload: { error: Error }) => void;
      resetSnapshotData: () => void;
    }>
  ) => Promise<{
    category: string;
    timestamp: string;
    id: string;
    snapshotStore: SnapshotStore<T, Meta, K>;
    snapshot: Snapshot<T, Meta, K>;
    snapshots: Snapshots<Data, Meta>;
    subscribers: Subscriber<T, Meta, K>[];
    data: Data;
    newData: Data;
    unsubscribe: () => void;
    addSnapshotFailure: (snapshotManager: SnapshotManager<T, Meta, K>, snapshot: Snapshot<T, Meta, K>, payload: { error: Error }) => void;
    createSnapshotSuccess: (snapshot: Snapshot<T, Meta, K>) => void;
    createSnapshotFailure: (snapshotManager: SnapshotManager<T, Meta, K>, snapshot: Snapshot<T, Meta, K>, payload: { error: Error }) => void;
    updateSnapshotSuccess: (snapshot: Snapshot<T, Meta, K>) => void;
    batchUpdateSnapshotsSuccess: (snapshots: Snapshots<Data, Meta>) => void;
    batchUpdateSnapshotsFailure: (snapshotManager: SnapshotManager<T, Meta, K>, snapshot: Snapshot<T, Meta, K>, payload: { error: Error }) => void;
    batchUpdateSnapshotsRequest: (snapshots: Snapshots<Data, Meta>) => void;
    createSnapshots: (snapshots: Snapshots<Data, Meta>) => void;
    batchTakeSnapshot: (snapshot: Snapshot<T, Meta, K>) => void;
    batchTakeSnapshotsRequest: (snapshots: Snapshots<Data, Meta>) => void;
    deleteSnapshot: (id: string) => void;
    batchFetchSnapshots: (criteria: any) => Promise<Snapshots<Data, Meta>>;
    batchFetchSnapshotsSuccess: (snapshots: Snapshots<Data, Meta>) => void;
    batchFetchSnapshotsFailure: (snapshotManager: SnapshotManager<T, Meta, K>, snapshot: Snapshot<T, Meta, K>, payload: { error: Error }) => void;
    filterSnapshotsByStatus: (status: string) => Snapshots<Data, Meta>;
    getSnapshotSuccess: (snapshot: Snapshot<T, Meta, K>) => void;
    removeSnapshot: (id: string) => void;
    removeSnapshots: (ids: string[]) => void;
    removeSnapshotsSuccess: (ids: string[]) => void;
    removeSnapshotsFailure: (snapshotManager: SnapshotManager<T, Meta, K>, snapshot: Snapshot<T, Meta, K>, payload: { error: Error }) => void;
    resetSnapshotData: () => void;
  }>;


  // New methods from the provided logic
  mapSnapshots: (
    storeIds: number[],
    snapshotId: string,
    category: Category | undefined,
    categoryProperties: CategoryProperties | undefined,
    snapshot: Snapshot<T, Meta, K>,
    timestamp: string | number | Date | undefined,
    type: string,
    event: Event,
    id: number,
    snapshotStore: SnapshotStore<T, Meta, K>,
    data: Data,
    callback: (
      storeIds: number[],
      snapshotId: string,
      category: symbol | string | Category | undefined,
      categoryProperties: CategoryProperties | undefined,
      snapshot: Snapshot<T, Meta, K>,
      timestamp: string | number | Date | undefined,
      type: string,
      event: Event,
      id: number,
      snapshotStore: SnapshotStore<T, Meta, K>,
      data: Data,
      index: number
    ) => SnapshotUnion<Data, Meta>
  ) => Promise<SnapshotsArray<Data, Meta>>;

  getSnapshotById: (
    fetchSnapshot: (id: string) => Promise<{
      category: Category;
      timestamp: string | number | Date | undefined;
      id: string | number | undefined;
      snapshotStore: SnapshotStore<T, Meta, K>;
      data: Data;
    } | undefined>,
    id: string,
    snapshotProvider: (data: {
      id: string | number | undefined;
      category: Category;
      timestamp: string | number | Date | undefined;
      snapshotStore: SnapshotStore<T, Meta, K>;
      data: Data;
    }) => Snapshot<T, Meta, K>
  ) => Promise<Snapshot<T, Meta, K> | null>;

  handleSnapshot: (
    id: string,
    snapshotId: string,
    snapshot: Data | null,
    snapshotData: Data,
    category: Category | undefined,
    callback: (snapshot: Data) => void,
    snapshots: SnapshotsArray<any, Meta>,
    type: string,
    event: Event,
    snapshotContainer?: SnapshotContainer<T, Meta, K> | undefined,
    snapshotStoreConfig?: SnapshotStoreConfig<T, Meta, K> | null
  ) => Promise<Snapshot<T, Meta, K> | null>;


  configureSnapshot: <T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T>(
    id: string,
    snapshotData: SnapshotData<T, Meta, K>,
    category?: string | symbol | Category,
    callback?: ((snapshot: Snapshot<T, Meta, K>) => void) | undefined,
    SnapshotData?: SnapshotStore<T, Meta, K> | undefined,
    snapshotStoreConfig?: SnapshotStoreConfig<T, Meta, K> | undefined,
    subscribers?: SubscriberCollection<T, Meta, K> | undefined
  ) => Snapshot<T, Meta, K> | null;
}



const getParentId = (snapshot: Snapshot<Data, Meta, BaseData>): string | null => {
  return snapshot.parentId || null;
};
const getChildIds = (childSnapshot: Snapshot<Data, Meta, BaseData>): string[] => {
  return childSnapshot.childIds || [];
};

const clearSnapshotFailure = (): unknown => {
  return { success: true };
};

const mapSnapshots = async (
  storeIds: number[],
  snapshotId: string,
  category: Category | undefined,
  categoryProperties: CategoryProperties | undefined,
  snapshot: Snapshot<Data, Meta, BaseData>,
  timestamp: string | number | Date | undefined,
  type: string,
  event: Event,
  id: number,
  snapshotStore: SnapshotStore<Data, Meta, BaseData>,
  data: Data,
  callback: (
    storeIds: number[],
    snapshotId: string,
    category: symbol | string | Category | undefined,
    categoryProperties: CategoryProperties | undefined,
    snapshot: Snapshot<Data, Meta, BaseData>,
    timestamp: string | number | Date | undefined,
    type: string,
    event: Event,
    id: number,
    snapshotStore: SnapshotStore<Data, Meta, BaseData>,
    data: Data,
    index: number
  ) => SnapshotUnion<Data, Meta>
): Promise<SnapshotsArray<Data, Meta>> => {
  const snapshotsArray: SnapshotsArray<Data, Meta> = [];

  for (let i = 0; i < storeIds.length; i++) {
    const snapshotObject = callback(
      storeIds,
      snapshotId,
      category,
      categoryProperties,
      snapshot,
      timestamp,
      type,
      event,
      id,
      snapshotStore,
      data,
      i
    );
    snapshotsArray.push(snapshotObject);
  }

  return snapshotsArray;
};


const getSnapshotById = (
  fetchSnapshot: (id: string) => Promise<{
    category: Category;
    timestamp: string | number | Date | undefined;
    id: string | number | undefined;
    snapshotStore: SnapshotStore<Data, Meta, BaseData>;
    data: Data;
  } | undefined>,
  id: string,
  snapshotProvider: (data: {
    id: string | number | undefined;
    category: Category;
    timestamp: string | number | Date | undefined;
    snapshotStore: SnapshotStore<Data, Meta, BaseData>;
    data: Data;
  }) => Snapshot<Data, Meta, BaseData> // This provider generates Snapshot instances
): Promise<Snapshot<Data, Meta, BaseData> | null> => {
  // Ensure fetchSnapshot is defined
  if (!fetchSnapshot) {
    console.error("fetchSnapshot is undefined");
    return Promise.resolve(null); // Return null immediately
  }

  return fetchSnapshot(id)
    .then(snapshotData => {
      // Check if snapshotData is defined and properly typed
      if (!snapshotData) return null;

      // Check that snapshotProvider is a valid function
      if (typeof snapshotProvider !== 'function') {
        console.error("snapshotProvider is not a function");
        return null;
      }

      // Use the snapshotProvider to create a Snapshot instance
      return snapshotProvider({
        id: snapshotData.id,
        category: snapshotData.category,
        timestamp: snapshotData.timestamp,
        snapshotStore: snapshotData.snapshotStore,
        data: snapshotData.data,
      });
    })
    .catch(error => {
      console.error("Error fetching snapshot:", error);
      return null;
    });
};


const handleSnapshot = <T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T>(
  id: string,
  snapshotId: string,
  snapshot: T | null,
  snapshotData: Data,
  category: Category | undefined,
  callback: (snapshot: Data) => void,
  snapshots: SnapshotsArray<any, Meta>,
  type: string,
  event: Event,
  snapshotContainer?: SnapshotContainer<T, Meta, K> | undefined,
  snapshotStoreConfig?: SnapshotStoreConfig<T, Meta, K> | null,
  storeProps?: SnapshotStoreProps<T, Meta, K>
): Promise<Snapshot<T, Meta, K> | null> => {

  try {
    if (snapshot) {
      callback(snapshot);
    }

    // Ensure snapshotStore is a SnapshotStore<T, Meta, K>
    let snapshotStore: SnapshotStore<T, Meta, K>;

    if (storeProps === undefined) {
      throw new Error("cannot find store properties")
    }
    const { storeId, name, version, schema, options, category, config, expirationDate,
      payload, callback, endpointCategory,
      operation,

    } = storeProps;

    if (snapshotContainer) {
      // Ensure snapshotContainer is of the correct type, otherwise use a default instance
      snapshotStore = convertSnapshotContainerToStore<T, Meta, K>(snapshotContainer);

    } else if (snapshotStoreConfig && snapshotStoreConfig.config !== null) {
      const versionInfo = createVersionInfo(snapshotStoreConfig.version || '0.0.0');


      // Create a new SnapshotStore with provided configuration
      snapshotStore = new SnapshotStore<T, Meta, K>({
        storeId, name, version, schema, options, category, config, expirationDate,
        operation, storeProps,
        payload, callback, endpointCategory
      });
    } else {
      // Fallback to a default or empty instance
      snapshotStore = new SnapshotStore<T, Meta, K>({
        storeId: storeId,
        name,
        version: version || (snapshotStoreConfig && snapshotStoreConfig.version ? createVersionInfo(snapshotStoreConfig.version) : undefined),
        schema, options, category, config, expirationDate,
        operation, storeProps,
        payload, callback, endpointCategory
      });
    }

    // Create an object that conforms to the Snapshot interface
    const processedSnapshot: Snapshot<T, Meta, K> = {
      id,
      category: category ?? undefined,
      timestamp: new Date(),
      snapshotStore,
      data: snapshotData,
      initialState: snapshotData,
      isCore: false,
      initialConfig: "",
      removeSubscriber: () => { },
      onInitialize: () => { },
      onError: () => { },
      taskIdToAssign: "",
      schema: {},
      currentCategory: "",
      mappedSnapshotData: new Map(),
      applyStoreConfig: () => { },
      generateId: () => "",
      snaPpshotData: (
        id: string,
        snapshotData: Data,
        category: Category | undefined,
        categoryProperties: CategoryProperties | undefined,
        dataStoreMethods: DataStoreMethods<T, Meta, K>
      ): Promise<SnapshotStore<T, Meta, K>> => {
        return Promise.resolve(snapshotStore);
      },
      getSnapshotItems: () => [],

      snapshot: (
        id,
        snapshotId,
        snapshotData,
        category,
        categoryProperties,
        callback,
        dataStore,
        dataStoreMethods,
        snapshotStoreConfigData,
        snapshotContainer,
      ) => {
        // Check if all required parameters are provided
        if (!id || !snapshotId || !snapshotData || !category) {
          throw new Error('Required parameters missing');
        }

        // Process the snapshot data, this could include fetching data from the store
        const snapshot = {
          id: id.toString() || id || undefined,
          snapshotId: snapshotId,
          data: snapshotData,
          category,
          properties: categoryProperties || {}, // Use default empty object if properties are undefined
          createdAt: new Date(),
          updatedAt: new Date()
        };

        // Store the snapshot using the callback method (or do something else with the snapshot)
        if (callback) {
          callback({
            snapshot: snapshot,
            dataStoreMethods,
            snapshotStoreConfigData
          });
        }

        // Return the newly created snapshot
        return Promise.resolve({
          snapshot: snapshot
        });
      },
      setCategory: (category: Category) => {
        if (!category) {
          throw new Error('Category is required to set');
        }

        // Logic to update the category
        processedSnapshot.category = category;

        // Update any other references related to the category if needed
        console.log('Category set to:', category);

        // Optionally, trigger some update or callback after setting the category
      },

    };

    return Promise.resolve(processedSnapshot);
  } catch (error) {
    return Promise.resolve(null);
  }
}


const validateSnapshot = (snapshot: Snapshot<Data, Meta, BaseData>): boolean => {
  return snapshot.id !== undefined && snapshot.data !== undefined;
}


const getSnapshot = (snapshot: (id: string) => Promise<{
  category: any; timestamp: any;
  id: any; snapshot: Snapshot<Data, Meta, BaseData>;
  data: Data;
}> | undefined
): Promise<Snapshot<Data, Meta, BaseData>> => {
  throw new Error("Function not implemented.");
}


const takeSnapshot = async (
  snapshot: Snapshot<Data, Meta, BaseData>,
  subscribers: Subscriber<Data, Meta, BaseData>[]
): Promise<{ snapshot: Snapshot<Data, Meta, BaseData>; }> => {
  subscribers.forEach(subscriber => {
    subscriber.update(snapshot);
  });

  return { snapshot };
};
const removeSnapshot = (snapshotToRemove: SnapshotStore<Data, Meta, BaseData>): void => {
  snapshotToRemove.clearSnapshot();
};

const updateSnapshot = (
  snapshotId: string,
  data: Map<string, Snapshot<Data, Meta, BaseData>>,
  events: Record<string, CalendarManagerStoreClass<Data, Meta, BaseData>[]>,
  snapshotStore: SnapshotStore<Data, Meta, BaseData>,
  dataItems: RealtimeDataItem[],
  newData: Snapshot<Data, Meta, BaseData>,
  payload: UpdateSnapshotPayload<Data>,
  store: SnapshotStore<any, Meta, BaseData> // Ensure the correct type here
): Promise<{ snapshot: Snapshot<any, Meta, Data>; }> => {
  return store.updateSnapshot(
    snapshotId,
    data,
    events,
    snapshotStore,
    dataItems,
    newData,
    payload,
    store
  );
};

const getSnapshots = (category: string, data: Snapshots<Data, Meta>): Snapshots<Data, Meta> => {
  return Array.isArray(data) ? data.filter(snapshot => snapshot.category === category) : [];
};

const getSnapshotItems = async (
  category: symbol | string | Category | undefined,
  snapshots: SnapshotsArray<Data, Meta>
): Promise<{ snapshots: SnapshotItem<Data, Meta, BaseData>[] }> => {
  const snapshotItems: SnapshotItem<Data, Meta, BaseData>[] = snapshots
    .filter(snapshot => snapshot.category === category)
    .map(snapshot => {
      // Ensure content aligns with the expected type in SnapshotItem
      const content: Content<Data, Meta, BaseData> | undefined =
        typeof snapshot.content === 'string'
          ? undefined // Or handle string content conversion if needed
          : snapshot.content;
      return {
        ...snapshot,
        content // This now is either undefined or Content<Data, Meta, BaseData>
      } as SnapshotItem<Data, Meta, BaseData>; // Cast to ensure TypeScript understands this is a SnapshotItem
    });

  return { snapshots: snapshotItems };
};


const getSnapshotContainer = <T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T>(
  id: string | number,
  snapshotFetcher: (id: string | number) => Promise<{
    category: string;
    timestamp: string;
    id: string;
    snapshotStore: SnapshotStore<T, Meta, K>;
    snapshot: Snapshot<T, Meta, K>;
    snapshots: Snapshots<Data, Meta>;
    subscribers: Subscriber<T, Meta, K>[];
    data: Data;
    newData: Data;
    unsubscribe: () => void;
    addSnapshotFailure: (snapshotManager: SnapshotManager<T, Meta, K>, snapshot: Snapshot<T, Meta, K>, payload: { error: Error }) => void;
    createSnapshotSuccess: (snapshot: Snapshot<T, Meta, K>) => void;
    createSnapshotFailure: (snapshotManager: SnapshotManager<T, Meta, K>, snapshot: Snapshot<T, Meta, K>, payload: { error: Error }) => void;
    updateSnapshotSuccess: (snapshot: Snapshot<T, Meta, K>) => void;
    batchUpdateSnapshotsSuccess: (snapshots: Snapshots<Data, Meta>) => void;
    batchUpdateSnapshotsFailure: (snapshotManager: SnapshotManager<T, Meta, K>, snapshot: Snapshot<T, Meta, K>, payload: { error: Error }) => void;
    batchUpdateSnapshotsRequest: (snapshots: Snapshots<Data, Meta>) => void;
    createSnapshots: (snapshots: Snapshots<Data, Meta>) => void;
    batchTakeSnapshot: (snapshot: Snapshot<T, Meta, K>) => void;
    batchTakeSnapshotsRequest: (snapshots: Snapshots<Data, Meta>) => void;
    deleteSnapshot: (id: string) => void;
    batchFetchSnapshots: (criteria: any) => Promise<Snapshots<Data, Meta>>;
    batchFetchSnapshotsSuccess: (snapshots: Snapshots<Data, Meta>) => void;
    batchFetchSnapshotsFailure: (snapshotManager: SnapshotManager<T, Meta, K>, snapshot: Snapshot<T, Meta, K>, payload: { error: Error }) => void;
    filterSnapshotsByStatus: (status: string) => Snapshots<Data, Meta>;
    getSnapshotSuccess: (snapshot: Snapshot<T, Meta, K>) => void;
    removeSnapshot: (id: string) => void;
    removeSnapshots: (ids: string[]) => void;
    removeSnapshotsSuccess: (ids: string[]) => void;
    removeSnapshotsFailure: (snapshotManager: SnapshotManager<T, Meta, K>, snapshot: Snapshot<T, Meta, K>, payload: { error: Error }) => void;
    resetSnapshotData: () => void;
    // New Methods
    mapSnapshot: (snapshot: Snapshot<T, Meta, K>) => any;
    mapSnapshotWithDetails: (snapshot: Snapshot<T, Meta, K>) => any;
    removeStore: (id: string) => void;
    fetchSnapshot: (id: string) => Promise<Snapshot<T, Meta, K>>;
    fetchSnapshotSuccess: (snapshot: Snapshot<T, Meta, K>) => void;
    updateSnapshotFailure: (snapshot: Snapshot<T, Meta, K>, error: Error) => void;
    fetchSnapshotFailure: (id: string, error: Error) => void;
    configureSnapshotStore: (options: any) => void;
    onSnapshot: (snapshot: Snapshot<T, Meta, K>) => void;
    onSnapshots: (snapshots: Snapshots<Data, Meta>) => void;
    getSnapshotStore: (storeId: number,
      snapshotContainer: SnapshotContainer<T, Meta, K>,
      criteria: CriteriaType
    ) => Promise<SnapshotStore<T, Meta, K>>
    events: any[];
    parentId: string;
    childIds: string[];
    getParentId: () => string;
    getChildIds: () => string[];
    addChild: (id: string) => void;
    removeChild: (id: string) => void;
    getChildren: () => string[];
    hasChildren: (id: string) => boolean;
    isDescendantOf: (id: string) => boolean;
    getSnapshotById: (id: string) => Snapshot<T, Meta, K> | undefined;
    mappedSnapshotData: any;
    snapshotData: any;
    currentCategory: string;
    setSnapshotCategory: (category: string) => void;
    getSnapshotCategory: () => string;
    config: any;
    getSnapshotData: () => Data;
    isCore: boolean;
    notify: () => void;
    notifySubscribers: () => void;
    getSnapshots: () => Snapshots<Data, Meta>;
    getAllSnapshots: () => Snapshots<Data, Meta>;
    generateId: () => string;
    compareSnapshots: (snapshot1: Snapshot<T, Meta, K>, snapshot2: Snapshot<T, Meta, K>) => number;
    compareSnapshotItems: (item1: any, item2: any) => number;
    filterSnapshotsByCategory: (category: string) => Snapshots<Data, Meta>;
    filterSnapshotsByTag: (tag: string) => Snapshots<Data, Meta>;
    handleSnapshotSuccess: (snapshot: Snapshot<T, Meta, K>) => void;
    getSnapshotId: (snapshot: Snapshot<T, Meta, K>) => string;
    compareSnapshotState: (state1: any, state2: any) => number;
    payload: any;
    dataItems: any[];
    getInitialState: () => any;
    getConfigOption: (option: string) => any;
    getTimestamp: () => string;
    getStores: () => any[];
    getData: () => Data;
    setData: (data: Data) => void;
    addData: (data: Data) => void;
    stores: any[];
    getStore: (id: string) => any | undefined;
    addStore: (storId: number) => SnapshotStore<T, Meta, K>
  }>
): Promise<{
  category: string;
  timestamp: string;
  id: string;
  snapshotStore: SnapshotStore<T, Meta, K>;
  snapshot: Snapshot<T, Meta, K>;
  snapshots: Snapshots<Data, Meta>;
  subscribers: Subscriber<T, Meta, K>[];
  data: Data;
  newData: Data;

  unsubscribe: () => void;
  addSnapshotFailure: (snapshotManager: SnapshotManager<T, Meta, K>, snapshot: Snapshot<T, Meta, K>, payload: { error: Error }) => void;
  createSnapshotSuccess: (snapshot: Snapshot<T, Meta, K>) => void;
  createSnapshotFailure: (snapshotManager: SnapshotManager<T, Meta, K>, snapshot: Snapshot<T, Meta, K>, payload: { error: Error }) => void;
  updateSnapshotSuccess: (snapshot: Snapshot<T, Meta, K>) => void;
  batchUpdateSnapshotsSuccess: (snapshots: Snapshots<Data, Meta>) => void;
  batchUpdateSnapshotsFailure: (snapshotManager: SnapshotManager<T, Meta, K>, snapshot: Snapshot<T, Meta, K>, payload: { error: Error }) => void;
  batchUpdateSnapshotsRequest: (snapshots: Snapshots<Data, Meta>) => void;
  createSnapshots: (snapshots: Snapshots<Data, Meta>) => void;
  batchTakeSnapshot: (snapshot: Snapshot<T, Meta, K>) => void;
  batchTakeSnapshotsRequest: (snapshots: Snapshots<Data, Meta>) => void;
  deleteSnapshot: (id: string) => void;
  batchFetchSnapshots: (criteria: any) => Promise<Snapshots<Data, Meta>>;
  batchFetchSnapshotsSuccess: (snapshots: Snapshots<Data, Meta>) => void;
  batchFetchSnapshotsFailure: (snapshotManager: SnapshotManager<T, Meta, K>, snapshot: Snapshot<T, Meta, K>, payload: { error: Error }) => void;
  filterSnapshotsByStatus: (status: string) => Snapshots<Data, Meta>;
  getSnapshotSuccess: (snapshot: Snapshot<T, Meta, K>) => void;
  removeSnapshot: (id: string) => void;
  removeSnapshots: (ids: string[]) => void;
  removeSnapshotsSuccess: (ids: string[]) => void;
  removeSnapshotsFailure: (snapshotManager: SnapshotManager<T, Meta, K>, snapshot: Snapshot<T, Meta, K>, payload: { error: Error }) => void;
  resetSnapshotData: () => void;
  // New Methods
  mapSnapshot: (snapshot: Snapshot<T, Meta, K>) => any;
  mapSnapshotWithDetails: (snapshot: Snapshot<T, Meta, K>) => any;
  removeStore: (id: string) => void;
  fetchSnapshot: (id: string) => Promise<Snapshot<T, Meta, K>>;
  fetchSnapshotSuccess: (snapshot: Snapshot<T, Meta, K>) => void;
  updateSnapshotFailure: (snapshot: Snapshot<T, Meta, K>, error: Error) => void;
  fetchSnapshotFailure: (id: string, error: Error) => void;
  configureSnapshotStore: (options: any) => void;
  onSnapshot: (snapshot: Snapshot<T, Meta, K>) => void;
  onSnapshots: (snapshots: Snapshots<Data, Meta>) => void;
  events: any[];
  parentId: string;
  childIds: string[];
  getParentId: () => string;
  getChildIds: () => string[];
  addChild: (id: string) => void;
  removeChild: (id: string) => void;
  getChildren: () => string[];
  hasChildren: (id: string) => boolean;
  isDescendantOf: (id: string) => boolean;
  getSnapshotById: (id: string) => Snapshot<T, Meta, K> | undefined;
  mappedSnapshotData: any;
  snapshotData: any;
  currentCategory: string;
  setSnapshotCategory: (category: string) => void;
  getSnapshotCategory: () => string;
  config: any;
  getSnapshotData: () => Data;
  isCore: boolean;
  notify: () => void;
  notifySubscribers: () => void;
  getSnapshots: () => Snapshots<Data, Meta>;
  getAllSnapshots: () => Snapshots<Data, Meta>;
  generateId: () => string;
  compareSnapshots: (snapshot1: Snapshot<T, Meta, K>, snapshot2: Snapshot<T, Meta, K>) => number;
  compareSnapshotItems: (item1: any, item2: any) => number;
  filterSnapshotsByCategory: (category: string) => Snapshots<Data, Meta>;
  filterSnapshotsByTag: (tag: string) => Snapshots<Data, Meta>;
  handleSnapshotSuccess: (snapshot: Snapshot<T, Meta, K>) => void;
  getSnapshotId: (snapshot: Snapshot<T, Meta, K>) => string;
  compareSnapshotState: (state1: any, state2: any) => number;
  payload: any;
  dataItems: any[];
  getInitialState: () => any;
  getConfigOption: (option: string) => any;
  getTimestamp: () => string;
  getStores: () => any[];
  getData: () => Data;
  setData: (data: Data) => void;
  addData: (data: Data) => void;
  stores: any[];
  getStore: (id: string) => any | undefined;
  addStore: (storeId: number) => SnapshotStore<T, Meta, K>
}> => {
  // Your implementation here
  return snapshotFetcher(id).then(snapshotContainer => {
    return {

      // Snapshot Management
      mapSnapshot: snapshotContainer.mapSnapshot,
      mapSnapshotWithDetails: snapshotContainer.mapSnapshotWithDetails,
      fetchSnapshot: snapshotContainer.fetchSnapshot,
      fetchSnapshotSuccess: snapshotContainer.fetchSnapshotSuccess,
      updateSnapshotFailure: snapshotContainer.updateSnapshotFailure,
      fetchSnapshotFailure: snapshotContainer.fetchSnapshotFailure,
      configureSnapshotStore: snapshotContainer.configureSnapshotStore,
      createSnapshotSuccess: snapshotContainer.createSnapshotSuccess,
      createSnapshotFailure: snapshotContainer.createSnapshotFailure,
      updateSnapshotSuccess: snapshotContainer.updateSnapshotSuccess,
      batchUpdateSnapshotsSuccess: snapshotContainer.batchUpdateSnapshotsSuccess,
      batchUpdateSnapshotsFailure: snapshotContainer.batchUpdateSnapshotsFailure,
      batchUpdateSnapshotsRequest: snapshotContainer.batchUpdateSnapshotsRequest,
      createSnapshots: snapshotContainer.createSnapshots,
      batchTakeSnapshot: snapshotContainer.batchTakeSnapshot,
      batchTakeSnapshotsRequest: snapshotContainer.batchTakeSnapshotsRequest,
      deleteSnapshot: snapshotContainer.deleteSnapshot,
      batchFetchSnapshots: snapshotContainer.batchFetchSnapshots,
      batchFetchSnapshotsSuccess: snapshotContainer.batchFetchSnapshotsSuccess,
      batchFetchSnapshotsFailure: snapshotContainer.batchFetchSnapshotsFailure,
      removeSnapshot: snapshotContainer.removeSnapshot,
      removeSnapshots: snapshotContainer.removeSnapshots,
      removeSnapshotsSuccess: snapshotContainer.removeSnapshotsSuccess,
      removeSnapshotsFailure: snapshotContainer.removeSnapshotsFailure,
      resetSnapshotData: snapshotContainer.resetSnapshotData,
      getSnapshotSuccess: snapshotContainer.getSnapshotSuccess,
      addSnapshotFailure: snapshotContainer.addSnapshotFailure,
      getSnapshotId: snapshotContainer.getSnapshotId,
      getSnapshotById: snapshotContainer.getSnapshotById,
      getSnapshots: snapshotContainer.getSnapshots,
      getAllSnapshots: snapshotContainer.getAllSnapshots,
      generateId: snapshotContainer.generateId,
      handleSnapshotSuccess: snapshotContainer.handleSnapshotSuccess,

      // Snapshot Filtering and Comparison
      compareSnapshots: snapshotContainer.compareSnapshots,
      compareSnapshotItems: snapshotContainer.compareSnapshotItems,
      filterSnapshotsByCategory: snapshotContainer.filterSnapshotsByCategory,
      filterSnapshotsByTag: snapshotContainer.filterSnapshotsByTag,
      filterSnapshotsByStatus: snapshotContainer.filterSnapshotsByStatus,
      compareSnapshotState: snapshotContainer.compareSnapshotState,

      // Data Management
      getData: snapshotContainer.getData,
      setData: snapshotContainer.setData,
      addData: snapshotContainer.addData,
      getSnapshotData: snapshotContainer.getSnapshotData,
      payload: snapshotContainer.payload,
      dataItems: snapshotContainer.dataItems,
      getInitialState: snapshotContainer.getInitialState,
      getConfigOption: snapshotContainer.getConfigOption,
      getTimestamp: snapshotContainer.getTimestamp,


      // Store Management
      getStores: snapshotContainer.getStores,
      getStore: snapshotContainer.getStore,
      addStore: snapshotContainer.addStore,
      removeStore: snapshotContainer.removeStore,
      stores: snapshotContainer.stores,


      //  Snapshot Container Info
      id: snapshotContainer.id,
      category: snapshotContainer.category,
      snapshotStore: snapshotContainer.snapshotStore,
      data: snapshotContainer.data,
      newData: snapshotContainer.newData,
      snapshot: snapshotContainer.snapshot,
      snapshots: snapshotContainer.snapshots,
      timestamp: snapshotContainer.timestamp,
      subscribers: snapshotContainer.subscribers,
      unsubscribe: snapshotContainer.unsubscribe,
      events: snapshotContainer.events,
      parentId: snapshotContainer.parentId,
      childIds: snapshotContainer.childIds,
      getParentId: snapshotContainer.getParentId,
      getChildIds: snapshotContainer.getChildIds,
      addChild: snapshotContainer.addChild,
      removeChild: snapshotContainer.removeChild,
      getChildren: snapshotContainer.getChildren,
      hasChildren: snapshotContainer.hasChildren,
      isDescendantOf: snapshotContainer.isDescendantOf,
      mappedSnapshotData: snapshotContainer.mappedSnapshotData,
      snapshotData: snapshotContainer.snapshotData,
      currentCategory: snapshotContainer.currentCategory,
      setSnapshotCategory: snapshotContainer.setSnapshotCategory,
      getSnapshotCategory: snapshotContainer.getSnapshotCategory,
      config: snapshotContainer.config,
      isCore: snapshotContainer.isCore,
      notify: snapshotContainer.notify,
      notifySubscribers: snapshotContainer.notifySubscribers,
      onSnapshot: snapshotContainer.onSnapshot,
      onSnapshots: snapshotContainer.onSnapshots,
      getSnapshotStore: snapshotContainer.getSnapshotStore,
    };
  }).catch(error => {
    console.error("Error fetching snapshot container:", error);
    throw error; // Optionally handle or rethrow the error
  });
};

const configureSnapshot = <T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T>(
  id: string,
  snapshotData: SnapshotData<T, Meta, K>,
  category?: string | symbol | Category,
  callback?: ((snapshot: Snapshot<T, Meta, K>) => void) | undefined,
  SnapshotData?: SnapshotStore<T, Meta, K> | undefined,
  snapshotStoreConfig?: SnapshotStoreConfig<T, Meta, K> | undefined,
  subscribers?: SubscriberCollection<T, Meta, K> | undefined // Added this as an argument
): Snapshot<T, Meta, K> | null => {
  // Validate required parameters
  if (!id || !snapshotData) {
    console.error("Invalid ID or SnapshotData");
    return null;
  }

  // Step 1: Handle category assignment
  if (category) {
    if (typeof category === "string") {
      snapshotData.category = category;
    } else if (typeof category === "object") {
      snapshotData.category = category.name; // Assuming category object has a name property
    }
  }

  // Step 2: Configure snapshot store if provided
  if (SnapshotData && snapshotStoreConfig) {
    try {
      // Add snapshot to the store with snapshotId and subscribers
      SnapshotData.addSnapshot(snapshotData, id, subscribers);
    } catch (error) {
      console.error("Failed to add snapshot to store:", error);
      return null;
    }
  }

  // Step 3: Execute callback if provided
  if (callback) {
    try {
      callback(snapshotData);
    } catch (error) {
      console.error("Callback execution failed:", error);
    }
  }

  // Step 4: Return the configured snapshot
  return snapshotData;
};


export {
    clearSnapshotFailure, configureSnapshot, getChildIds, getParentId, getSnapshot, getSnapshotById, getSnapshotContainer, getSnapshotItems, getSnapshots, handleSnapshot, mapSnapshots, removeSnapshot, takeSnapshot, updateSnapshot, validateSnapshot
};
export type { SnapshotOperations };

