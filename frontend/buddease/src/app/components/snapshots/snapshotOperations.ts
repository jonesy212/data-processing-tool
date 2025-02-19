// snapshotOperations.ts
import { SnapshotData } from '@/app/components/snapshots';
import { CategoryProperties } from "@/app/pages/personas/ScenarioBuilder";

import { UpdateSnapshotPayload } from "@/app/components/database/Payload";
import CalendarManagerStoreClass from "@/app/components/state/stores/CalendarManagerStore";
import { StructuredMetadata } from '@/app/configs/StructuredMetadata';
import { CriteriaType } from "@/app/pages/searchs/CriteriaType";
import { SnapshotContainer, SnapshotStoreProps } from ".";
import { SnapshotManager } from "../hooks/useSnapshotManager";
import { Category } from "../libraries/categories/generateCategoryProperties";
import { Content } from "../models/content/AddContent";
import { BaseData, Data } from "../models/data/Data";
import { Meta } from '../models/data/dataStoreMethods';
import { RealtimeDataItem } from "../models/realtime/RealtimeData";
import { DataStoreMethods } from "../projects/DataAnalysisPhase/DataProcessing/ DataStoreMethods";
import { convertSnapshotContainerToStore } from "../typings/YourSpecificSnapshotType";
import { Subscriber } from "../users/Subscriber";
import { SubscriberCollection } from '../users/SubscriberCollection';
import { createVersionInfo } from "../versions/createVersionInfo";
import { createSnapshotInstance } from './createSnapshotInstance';
import { Snapshot, Snapshots, SnapshotsArray, SnapshotUnion } from "./LocalStorageSnapshotStore";
import { SnapshotItem } from "./SnapshotList";
import SnapshotStore from "./SnapshotStore";
import { SnapshotStoreConfig } from "./SnapshotStoreConfig";
import { InitializedData } from './SnapshotStoreOptions';


interface SnapshotOperations<T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>> {
  // Existing methods
  mapSnapshot: (snapshot: Snapshot<T, K>) => any;
  mapSnapshotWithDetails: (snapshot: Snapshot<T, K>) => any;
  removeStore: (id: string) => void;
  fetchSnapshot: (id: string) => Promise<Snapshot<T, K>>;
  fetchSnapshotSuccess: (snapshot: Snapshot<T, K>) => void;
  updateSnapshotFailure: (snapshot: Snapshot<T, K>, error: Error) => void;
  fetchSnapshotFailure: (id: string, error: Error) => void;
  configureSnapshotStore: (options: any) => void;
  onSnapshot: (snapshot: Snapshot<T, K>) => void;
  onSnapshots: (snapshots: Snapshots< BaseData<any>, Meta>) => void;
  events: any[];
  parentId: string;
  childIds?: K[];

  // New methods
  getParentId: (snapshot: Snapshot<T, K>) => string | null;
  getChildIds(id: string, childSnapshot: Snapshot<T, K>): (string | number | undefined)[]
  clearSnapshotFailure: () => unknown;
  validateSnapshot: (snapshot: Snapshot<T, K>) => boolean;
  getSnapshot: (id: string) => Promise<Snapshot<T, K>>;
  takeSnapshot: (snapshot: Snapshot<T, K>, subscribers: Subscriber<T, K>[]) => Promise<{ snapshot: Snapshot<T, K>; }>;
  removeSnapshot: (snapshotToRemove: SnapshotStore<T, K>) => void;
  updateSnapshot: (
    snapshotId: string,
    data: Map<string, Snapshot<T, K>>,
    events: Record<string, CalendarManagerStoreClass<T, K>[]>,
    snapshotStore: SnapshotStore<T, K>,
    dataItems: RealtimeDataItem[],
    newData: Snapshot<T, K>,
    payload: UpdateSnapshotPayload<Data<T>>,
    store: SnapshotStore<any, BaseData>
  ) => Promise<{ snapshot: Snapshot<any, Data<T>>; }>;
  getSnapshots: (category: string, data: Snapshots< BaseData<any>, Meta>) => Snapshots< BaseData<any>, Meta>;
  getSnapshotItems: (category: symbol | string | Category | undefined, snapshots: SnapshotsArray< BaseData<any>, Meta>) => Promise<{ snapshots: SnapshotItem<T, K>[]; }>;
  getSnapshotContainer: (
    id: string | number,
    snapshotFetcher: (id: string | number) => Promise<{
      category: string;
      timestamp: string;
      id: string;
      snapshotStore: SnapshotStore<T, K>;
      snapshot: Snapshot<T, K>;
      snapshots: Snapshots< BaseData<any>, Meta>;
      subscribers: Subscriber<T, K>[];
      data: Data<T>;
      newData: Data<T>;
      unsubscribe: () => void;
      addSnapshotFailure: (snapshotManager: SnapshotManager<T, K>, snapshot: Snapshot<T, K>, payload: { error: Error }) => void;
      createSnapshotSuccess: (snapshot: Snapshot<T, K>) => void;
      createSnapshotFailure: (snapshotManager: SnapshotManager<T, K>, snapshot: Snapshot<T, K>, payload: { error: Error }) => void;
      updateSnapshotSuccess: (snapshot: Snapshot<T, K>) => void;
      batchUpdateSnapshotsSuccess: (snapshots: Snapshots< BaseData<any>, Meta>) => void;
      batchUpdateSnapshotsFailure: (snapshotManager: SnapshotManager<T, K>, snapshot: Snapshot<T, K>, payload: { error: Error }) => void;
      batchUpdateSnapshotsRequest: (snapshots: Snapshots< BaseData<any>, Meta>) => void;
      createSnapshots: (snapshots: Snapshots< BaseData<any>, Meta>) => void;
      batchTakeSnapshot: (snapshot: Snapshot<T, K>) => void;
      batchTakeSnapshotsRequest: (snapshots: Snapshots< BaseData<any>, Meta>) => void;
      deleteSnapshot: (id: string) => void;
      batchFetchSnapshots: (criteria: any) => Promise<Snapshots< BaseData<any>, Meta>>;
      batchFetchSnapshotsSuccess: (snapshots: Snapshots< BaseData<any>, Meta>) => void;
      batchFetchSnapshotsFailure: (snapshotManager: SnapshotManager<T, K>, snapshot: Snapshot<T, K>, payload: { error: Error }) => void;
      filterSnapshotsByStatus: (status: string) => Snapshots< BaseData<any>, Meta>;
      getSnapshotSuccess: (snapshot: Snapshot<T, K>) => void;
      removeSnapshot: (id: string) => void;
      removeSnapshots: (ids: string[]) => void;
      removeSnapshotsSuccess: (ids: string[]) => void;
      removeSnapshotsFailure: (snapshotManager: SnapshotManager<T, K>, snapshot: Snapshot<T, K>, payload: { error: Error }) => void;
      resetSnapshotData: () => void;
    }>
  ) => Promise<{
    category: string;
    timestamp: string;
    id: string;
    snapshotStore: SnapshotStore<T, K>;
    snapshot: Snapshot<T, K>;
    snapshots: Snapshots< BaseData<any>, Meta>;
    subscribers: Subscriber<T, K>[];
    data: Data<T>;
    newData: Data<T>;
    unsubscribe: () => void;
    addSnapshotFailure: (snapshotManager: SnapshotManager<T, K>, snapshot: Snapshot<T, K>, payload: { error: Error }) => void;
    createSnapshotSuccess: (snapshot: Snapshot<T, K>) => void;
    createSnapshotFailure: (snapshotManager: SnapshotManager<T, K>, snapshot: Snapshot<T, K>, payload: { error: Error }) => void;
    updateSnapshotSuccess: (snapshot: Snapshot<T, K>) => void;
    batchUpdateSnapshotsSuccess: (snapshots: Snapshots< BaseData<any>, Meta>) => void;
    batchUpdateSnapshotsFailure: (snapshotManager: SnapshotManager<T, K>, snapshot: Snapshot<T, K>, payload: { error: Error }) => void;
    batchUpdateSnapshotsRequest: (snapshots: Snapshots< BaseData<any>, Meta>) => void;
    createSnapshots: (snapshots: Snapshots< BaseData<any>, Meta>) => void;
    batchTakeSnapshot: (snapshot: Snapshot<T, K>) => void;
    batchTakeSnapshotsRequest: (snapshots: Snapshots< BaseData<any>, Meta>) => void;
    deleteSnapshot: (id: string) => void;
    batchFetchSnapshots: (criteria: any) => Promise<Snapshots< BaseData<any>, Meta>>;
    batchFetchSnapshotsSuccess: (snapshots: Snapshots< BaseData<any>, Meta>) => void;
    batchFetchSnapshotsFailure: (snapshotManager: SnapshotManager<T, K>, snapshot: Snapshot<T, K>, payload: { error: Error }) => void;
    filterSnapshotsByStatus: (status: string) => Snapshots< BaseData<any>, Meta>;
    getSnapshotSuccess: (snapshot: Snapshot<T, K>) => void;
    removeSnapshot: (id: string) => void;
    removeSnapshots: (ids: string[]) => void;
    removeSnapshotsSuccess: (ids: string[]) => void;
    removeSnapshotsFailure: (snapshotManager: SnapshotManager<T, K>, snapshot: Snapshot<T, K>, payload: { error: Error }) => void;
    resetSnapshotData: () => void;
  }>;


  // New methods from the provided logic
  mapSnapshots: (
    storeIds: number[],
    snapshotId: string,
    category: Category | undefined,
    categoryProperties: CategoryProperties | undefined,
    snapshot: Snapshot<T, K>,
    timestamp: string | number | Date | undefined,
    type: string,
    event: Event,
    id: number,
    snapshotStore: SnapshotStore<T, K>,
    data:  BaseData<any>,
    callback: (
      storeIds: number[],
      snapshotId: string,
      category: symbol | string | Category | undefined,
      categoryProperties: CategoryProperties | undefined,
      snapshot: Snapshot<T, K>,
      timestamp: string | number | Date | undefined,
      type: string,
      event: Event,
      id: number,
      snapshotStore: SnapshotStore<T, K>,
      data:  BaseData<any>,
      index: number
    ) => SnapshotUnion< BaseData<any>, Meta>
  ) => Promise<SnapshotsArray< BaseData<any>, Meta>>;

  getSnapshotById: (
    fetchSnapshot: (id: string) => Promise<{
      category: Category;
      timestamp: string | number | Date | undefined;
      id: string | number | undefined;
      snapshotStore: SnapshotStore<T, K>;
      data: Data<T>;
    } | undefined>,
    id: string,
    snapshotProvider: (data: {
      id: string | number | undefined;
      category: Category;
      timestamp: string | number | Date | undefined;
      snapshotStore: SnapshotStore<T, K>;
      data: Data<T>;
    }) => Snapshot<T, K>
  ) => Promise<Snapshot<T, K> | null>;

  handleSnapshot: (
    id: string,
    snapshotId: string,
    data: Data<T, K, Meta> | null,
    snapshot: Snapshot<T, K> | null,
    snapshotData:  BaseData<any>,
    category: Category | undefined,
    callback: (snapshot: Data<T>) => void,
    snapshots: SnapshotsArray<any, Meta>,
    type: string,
    event: Event,
    snapshotContainer?: SnapshotContainer<T, K> | undefined,
    snapshotStoreConfig?: SnapshotStoreConfig<T, K, StructuredMetadata<T, K>, never>  | null
  ) => Promise<Snapshot<T, K> | null>;


  configureSnapshot: <T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(
    id: string,
    snapshotData: SnapshotData<T, K>,
    category?: string | symbol | Category,
    callback?: ((snapshot: Snapshot<T, K>) => void) | undefined,
    snapshotData?: SnapshotStore<T, K> | undefined,
    snapshotStoreConfig?: SnapshotStoreConfig<T, K, StructuredMetadata<T, K>, never>  | undefined,
    subscribers?: SubscriberCollection<T, K> | undefined
  ) => Snapshot<T, K> | null;


  preDelete?: (id: string, config: SnapshotStoreConfig<T, K> | undefined) => Promise<void>;
  postDelete?: (id: string) => Promise<void>;
}


const getParentId = (
  id: string, 
  snapshot: Snapshot< BaseData<any, any>, BaseData>
): string | null => {
  return snapshot.parentId || null;
};

const getChildIds = (
  id: string, 
  childSnapshot: Snapshot< BaseData<any, any>, BaseData>
): BaseData<any, any, StructuredMetadata<any, any>>[] => {
  return childSnapshot.childIds || [];
};

const clearSnapshotFailure = (): unknown => {
  return { success: true };
};

const mapSnapshots = async <
  T extends BaseData<any>, 
  K extends T = T,
  Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>
>(
  storeIds: number[],
  snapshotId: string,
  category: Category | undefined,
  categoryProperties: CategoryProperties | undefined,
  snapshot: Snapshot<T, K>,
  timestamp: string | number | Date | undefined,
  type: string,
  event: Event,
  id: number,
  snapshotStore: SnapshotStore<T, K>,
  data: T,
  callback: (
    storeIds: number[],
    snapshotId: string,
    category: symbol | string | Category | undefined,
    categoryProperties: CategoryProperties | undefined,
    snapshot: Snapshot<T, K>,
    timestamp: string | number | Date | undefined,
    type: string,
    event: Event,
    id: number,
    snapshotStore: SnapshotStore<T, K>,
    data: T,
    index: number
  ) => SnapshotUnion<T, K, Meta>
): Promise<SnapshotsArray<T, K, Meta>> => {
  const snapshotsArray: SnapshotsArray<T, K, Meta> = [];

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

const getSnapshotById = <
  T extends BaseData<any> = BaseData<any, any>, 
// K extends T = T,
// Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>
>(
  fetchSnapshot: (id: string) => Promise<{
    category: Category;
    timestamp: string | number | Date | undefined;
    id: string | number | undefined;
    snapshotStore: SnapshotStore< BaseData<any>, BaseData>;
    data: Data<T>;
  } | undefined>,
  id: string,
  snapshotProvider: (data: {
    id: string | number | undefined;
    category: Category;
    timestamp: string | number | Date | undefined;
    snapshotStore: SnapshotStore< BaseData<any>, BaseData>;
    data: Data<T>;
  }) => Snapshot< BaseData<any>, BaseData> // This provider generates Snapshot instances
): Promise<Snapshot< BaseData<any>, BaseData> | null> => {
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


const handleSnapshot = <T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(
  id: string,
  snapshotId: string,
  data: T | null,
  snapshot: Snapshot<T, K, Meta> | null,
  snapshotData:  BaseData<any>,
  category: Category | undefined,
  callback: (snapshot: SnapshotStore<T, K>) => void,
  snapshots: SnapshotsArray<any, Meta>,
  type: string,
  event: Event,
  snapshotContainer?: SnapshotContainer<T, K> | undefined,
  snapshotStoreConfig?: SnapshotStoreConfig<T, K, StructuredMetadata<T, K>, never>  | null,
  storeProps?: SnapshotStoreProps<T, K>
): Promise<Snapshot<T, K> | null> => {

  try {

    // Ensure snapshot is not null and process it into the expected format
    if (snapshot === null) return Promise.resolve(null);

    // Ensure snapshotStore is a SnapshotStore<T, K>
    let snapshotStore: SnapshotStore<T, K>;
    
    if (storeProps === undefined) {
      throw new Error("cannot find store properties")
    }
    const { storeId, name, version, schema, options, category, config, expirationDate,
      payload, callback, endpointCategory,
      operation,
      
    } = storeProps;
    
    if (snapshot) {
      callback(snapshot);
    }
    
    if (snapshotContainer) {
      // Ensure snapshotContainer is of the correct type, otherwise use a default instance
      snapshotStore = convertSnapshotContainerToStore<T, K>(snapshotContainer);

    } else if (snapshotStoreConfig && snapshotStoreConfig.config !== null) {
      const versionInfo = createVersionInfo(snapshotStoreConfig.version || '0.0.0');


      // Create a new SnapshotStore with provided configuration
      snapshotStore = new SnapshotStore<T, K>({
        storeId, name, version, schema, options, category, config, expirationDate,
        operation, storeProps,
        payload, callback, endpointCategory
      });
    } else {
      // Fallback to a default or empty instance
      snapshotStore = new SnapshotStore<T, K>({
        storeId: storeId,
        name,
        version: version || (snapshotStoreConfig && snapshotStoreConfig.version ? createVersionInfo(snapshotStoreConfig.version) : undefined),
        schema, options, category, config, expirationDate,
        operation, storeProps,
        payload, callback, endpointCategory
      });
    }

    // Create an object that conforms to the Snapshot interface
    const processedSnapshot: Snapshot<T, K> = {
      ...snapshot, 
      id,
      category: category ?? undefined,
      timestamp: new Date(),
      snapshotStore,
      data: snapshotData as InitializedData<T>,
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
      snapshotData: (
        id: string | number | undefined,
        data: Snapshot<T, K>,
        mappedSnapshotData: Map<string, Snapshot<T, K>> | null | undefined,
        snapshotData: SnapshotData<T, K>,
        snapshotStore: SnapshotStore<T, K>,
        category: Category | undefined,
        categoryProperties: CategoryProperties | undefined,
        dataStoreMethods: DataStoreMethods<T, K>,
        storeProps: SnapshotStoreProps<T, K>,
        snapshotId?: string | number | null,
      ): Promise<SnapshotStore<T, K>> => {
        return Promise.resolve(snapshotStore);
      },
      getSnapshotItems: () => [],

      snapshot: (
        id,
        snapshotData,
        category,
        categoryProperties,
        callback,
        dataStore,
        dataStoreMethods,
        metadata,
        subscriberId,
        endpointCategory,
        storeProps,
        snapshotConfigData,
        subscription,
        snapshotId,
        snapshotStoreConfigData,
        snapshotContainer,
      ): Snapshot<T, K> | Promise<{ snapshot: Snapshot<T, K> }> => {
        // Check if all required parameters are provided
        if (!id || !snapshotId || !snapshotData || !category) {
          throw new Error('Required parameters missing');
        }

        const baseData: BaseData = createBaseData({ ...snapshotData });
        const baseMeta

        // Call createSnapshotInstance to generate the snapshot
        const snapshotInstance = createSnapshotInstance<T, K>(
          baseData,
          baseMeta,
          id.toString() || id,  // ID should be a string
          snapshotData,
          category,
          categoryProperties || {}, // Use default empty object if properties are undefined
          snapshotId,
          subscriberId,
          snapshotStoreConfigData,
          snapshotContainer
        );
        // Process the snapshot data, this could include fetching data from the store
        const snapshot = {
          ...snapshotInstance,
          createdAt: new Date(),
          updatedAt: new Date(),
          deleted: false,
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


const validateSnapshot = (snapshot: Snapshot< BaseData<any>, BaseData>): boolean => {
  return snapshot.id !== undefined && snapshot.data !== undefined;
}


const getSnapshot = (snapshot: (id: string) => Promise<{
  category: any; timestamp: any;
  id: any; snapshot: Snapshot< BaseData<any>, BaseData>;
  data: Data<T>;
}> | undefined
): Promise<Snapshot< BaseData<any>, BaseData>> => {
  throw new Error("Function not implemented.");
}


const takeSnapshot = async (
  snapshot: Snapshot< BaseData<any>, BaseData>,
  subscribers: Subscriber< BaseData<any>, BaseData>[]
): Promise<{ snapshot: Snapshot< BaseData<any>, BaseData>; }> => {
  subscribers.forEach(subscriber => {
    subscriber.update(snapshot);
  });

  return { snapshot };
};
const removeSnapshot = (snapshotToRemove: SnapshotStore< BaseData<any>, BaseData>): void => {
  snapshotToRemove.clearSnapshot();
};

const updateSnapshot = (
  snapshotId: string,
  data: Map<string, Snapshot< BaseData<any>, BaseData>>,
  events: Record<string, CalendarManagerStoreClass< BaseData<any>, BaseData>[]>,
  snapshotStore: SnapshotStore< BaseData<any>, BaseData>,
  dataItems: RealtimeDataItem[],
  newData: Snapshot< BaseData<any>, BaseData>,
  payload: UpdateSnapshotPayload<Data>,
  store: SnapshotStore<any, BaseData> // Ensure the correct type here
): Promise<{ snapshot: Snapshot<any, Data>; }> => {
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

const getSnapshots = (category: string, data: Snapshots< BaseData<any>, Meta>): Snapshots< BaseData<any>, Meta> => {
  return Array.isArray(data) ? data.filter(snapshot => snapshot.category === category) : [];
};

const getSnapshotItems = async (
  category: symbol | string | Category | undefined,
  snapshots: SnapshotsArray<Data<BaseData<any>>>
): Promise<{ snapshots: SnapshotItem< BaseData<any>, BaseData>[] }> => {
  const snapshotItems: SnapshotItem< BaseData<any>, BaseData>[] = snapshots
    .filter(snapshot => snapshot.category === category)
    .map(snapshot => {
      // Ensure content aligns with expected type in SnapshotItem
      const content: Content< BaseData<any>, BaseData> | undefined =
        typeof snapshot.content === 'string'
          ? undefined // Or handle string content conversion if needed
          : snapshot.content;
      return {
        ...snapshot,
        content, // Now either undefined or Content< BaseData<any>, BaseData>
      } as SnapshotItem< BaseData<any>, BaseData>; // Casting to ensure this is a SnapshotItem
    });

  return { snapshots: snapshotItems };
};

const getSnapshotContainer = <T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(
  id: string | number,
  snapshotFetcher: (id: string | number) => Promise<{
    category: string;
    timestamp: string;
    id: string;
    snapshotStore: SnapshotStore<T, K>;
    snapshot: Snapshot<T, K>;
    snapshots: Snapshots< BaseData<any>, Meta>;
    subscribers: Subscriber<T, K>[];
    data: Data<T>;
    newData: Data<T>;
    unsubscribe: () => void;
    addSnapshotFailure: (snapshotManager: SnapshotManager<T, K>, snapshot: Snapshot<T, K>, payload: { error: Error }) => void;
    createSnapshotSuccess: (snapshot: Snapshot<T, K>) => void;
    createSnapshotFailure: (snapshotManager: SnapshotManager<T, K>, snapshot: Snapshot<T, K>, payload: { error: Error }) => void;
    updateSnapshotSuccess: (snapshot: Snapshot<T, K>) => void;
    batchUpdateSnapshotsSuccess: (snapshots: Snapshots< BaseData<any>, Meta>) => void;
    batchUpdateSnapshotsFailure: (snapshotManager: SnapshotManager<T, K>, snapshot: Snapshot<T, K>, payload: { error: Error }) => void;
    batchUpdateSnapshotsRequest: (snapshots: Snapshots< BaseData<any>, Meta>) => void;
    createSnapshots: (snapshots: Snapshots< BaseData<any>, Meta>) => void;
    batchTakeSnapshot: (snapshot: Snapshot<T, K>) => void;
    batchTakeSnapshotsRequest: (snapshots: Snapshots< BaseData<any>, Meta>) => void;
    deleteSnapshot: (id: string) => void;
    batchFetchSnapshots: (criteria: any) => Promise<Snapshots< BaseData<any>, Meta>>;
    batchFetchSnapshotsSuccess: (snapshots: Snapshots< BaseData<any>, Meta>) => void;
    batchFetchSnapshotsFailure: (snapshotManager: SnapshotManager<T, K>, snapshot: Snapshot<T, K>, payload: { error: Error }) => void;
    filterSnapshotsByStatus: (status: string) => Snapshots< BaseData<any>, Meta>;
    getSnapshotSuccess: (snapshot: Snapshot<T, K>) => void;
    removeSnapshot: (id: string) => void;
    removeSnapshots: (ids: string[]) => void;
    removeSnapshotsSuccess: (ids: string[]) => void;
    removeSnapshotsFailure: (snapshotManager: SnapshotManager<T, K>, snapshot: Snapshot<T, K>, payload: { error: Error }) => void;
    resetSnapshotData: () => void;
    // New Methods
    mapSnapshot: (snapshot: Snapshot<T, K>) => any;
    mapSnapshotWithDetails: (snapshot: Snapshot<T, K>) => any;
    removeStore: (id: string) => void;
    fetchSnapshot: (id: string) => Promise<Snapshot<T, K>>;
    fetchSnapshotSuccess: (snapshot: Snapshot<T, K>) => void;
    updateSnapshotFailure: (snapshot: Snapshot<T, K>, error: Error) => void;
    fetchSnapshotFailure: (id: string, error: Error) => void;
    configureSnapshotStore: (options: any) => void;
    onSnapshot: (snapshot: Snapshot<T, K>) => void;
    onSnapshots: (snapshots: Snapshots< BaseData<any>, Meta>) => void;
    getSnapshotStore: (storeId: number,
      snapshotContainer: SnapshotContainer<T, K>,
      criteria: CriteriaType
    ) => Promise<SnapshotStore<T, K>>
    events: any[];
    parentId: string;
    childIds?: K[];
    getParentId: () => string;
    getChildIds: () => string[];
    addChild: (id: string) => void;
    removeChild: (id: string) => void;
    getChildren: () => string[];
    hasChildren: (id: string) => boolean;
    isDescendantOf: (id: string) => boolean;
    getSnapshotById: (id: string) => Snapshot<T, K> | undefined;
    mappedSnapshotData: any;
    snapshotData: any;
    currentCategory: string;
    setSnapshotCategory: (category: string) => void;
    getSnapshotCategory: () => string;
    config: any;
    getSnapshotData: () => Data<T>;
    isCore: boolean;
    notify: () => void;
    notifySubscribers: () => void;
    getSnapshots: () => Snapshots< BaseData<any>, K>;
    getAllSnapshots: () => Snapshots< BaseData<any>, K>;
    generateId: () => string;
    compareSnapshots: (snapshot1: Snapshot<T, K>, snapshot2: Snapshot<T, K>) => number;
    compareSnapshotItems: (item1: any, item2: any) => number;
    filterSnapshotsByCategory: (category: string) => Snapshots< BaseData<any>, Meta>;
    filterSnapshotsByTag: (tag: string) => Snapshots< BaseData<any>, Meta>;
    handleSnapshotSuccess: (snapshot: Snapshot<T, K>) => void;
    getSnapshotId: (snapshot: Snapshot<T, K>) => string;
    compareSnapshotState: (state1: Snapshot<T, K> | null, state2: Snapshot<T, K>) => boolean;
    payload: any;
    dataItems: any[];
    getInitialState: () => any;
    getConfigOption: (option: string) => any;
    getTimestamp: () => string;
    getStores: () => any[];
    getData: () => Data<T>;
    setData: (data: Data<T>) => void;
    addData: (data: Data<T>) => void;
    stores: any[];
    getStore: (id: string) => any | undefined;
    addStore: (storId: number) => SnapshotStore<T, K>
  }>
): Promise<{
  category: string;
  timestamp: string;
  id: string;
  snapshotStore: SnapshotStore<T, K>;
  snapshot: Snapshot<T, K>;
  snapshots: Snapshots< BaseData<any>, Meta>;
  subscribers: Subscriber<T, K>[];
  data: Data<T>;
  newData: Data<T>;

  unsubscribe: () => void;
  addSnapshotFailure: (snapshotManager: SnapshotManager<T, K>, snapshot: Snapshot<T, K>, payload: { error: Error }) => void;
  createSnapshotSuccess: (snapshot: Snapshot<T, K>) => void;
  createSnapshotFailure: (snapshotManager: SnapshotManager<T, K>, snapshot: Snapshot<T, K>, payload: { error: Error }) => void;
  updateSnapshotSuccess: (snapshot: Snapshot<T, K>) => void;
  batchUpdateSnapshotsSuccess: (snapshots: Snapshots< BaseData<any>, Meta>) => void;
  batchUpdateSnapshotsFailure: (snapshotManager: SnapshotManager<T, K>, snapshot: Snapshot<T, K>, payload: { error: Error }) => void;
  batchUpdateSnapshotsRequest: (snapshots: Snapshots< BaseData<any>, Meta>) => void;
  createSnapshots: (snapshots: Snapshots< BaseData<any>, Meta>) => void;
  batchTakeSnapshot: (snapshot: Snapshot<T, K>) => void;
  batchTakeSnapshotsRequest: (snapshots: Snapshots< BaseData<any>, Meta>) => void;
  deleteSnapshot: (id: string) => void;
  batchFetchSnapshots: (criteria: any) => Promise<Snapshots< BaseData<any>, Meta>>;
  batchFetchSnapshotsSuccess: (snapshots: Snapshots< BaseData<any>, Meta>) => void;
  batchFetchSnapshotsFailure: (snapshotManager: SnapshotManager<T, K>, snapshot: Snapshot<T, K>, payload: { error: Error }) => void;
  filterSnapshotsByStatus: (status: string) => Snapshots< BaseData<any>, Meta>;
  getSnapshotSuccess: (snapshot: Snapshot<T, K>) => void;
  removeSnapshot: (id: string) => void;
  removeSnapshots: (ids: string[]) => void;
  removeSnapshotsSuccess: (ids: string[]) => void;
  removeSnapshotsFailure: (snapshotManager: SnapshotManager<T, K>, snapshot: Snapshot<T, K>, payload: { error: Error }) => void;
  resetSnapshotData: () => void;
  // New Methods
  mapSnapshot: (snapshot: Snapshot<T, K>) => any;
  mapSnapshotWithDetails: (snapshot: Snapshot<T, K>) => any;
  removeStore: (id: string) => void;
  fetchSnapshot: (id: string) => Promise<Snapshot<T, K>>;
  fetchSnapshotSuccess: (snapshot: Snapshot<T, K>) => void;
  updateSnapshotFailure: (snapshot: Snapshot<T, K>, error: Error) => void;
  fetchSnapshotFailure: (id: string, error: Error) => void;
  configureSnapshotStore: (options: any) => void;
  onSnapshot: (snapshot: Snapshot<T, K>) => void;
  onSnapshots: (snapshots: Snapshots< BaseData<any>, Meta>) => void;
  events: any[];
  parentId: string;
  childIds?: K[];
  getParentId: () => string;
  getChildIds: () => string[];
  addChild: (id: string) => void;
  removeChild: (id: string) => void;
  getChildren: () => string[];
  hasChildren: (id: string) => boolean;
  isDescendantOf: (id: string) => boolean;
  getSnapshotById: (id: string) => Snapshot<T, K> | undefined;
  mappedSnapshotData: any;
  snapshotData: any;
  currentCategory: string;
  setSnapshotCategory: (category: string) => void;
  getSnapshotCategory: () => string;
  config: any;
  getSnapshotData: () => Data<T>;
  isCore: boolean;
  notify: () => void;
  notifySubscribers: () => void;
  getSnapshots: () => Snapshots< BaseData<any>, Meta>;
  getAllSnapshots: () => Snapshots< BaseData<any>, Meta>;
  generateId: () => string;
  compareSnapshots: (snapshot1: Snapshot<T, K>, snapshot2: Snapshot<T, K>) => number;
  compareSnapshotItems: (item1: any, item2: any) => number;
  filterSnapshotsByCategory: (category: string) => Snapshots< BaseData<any>, Meta>;
  filterSnapshotsByTag: (tag: string) => Snapshots< BaseData<any>, Meta>;
  handleSnapshotSuccess: (snapshot: Snapshot<T, K>) => void;
  getSnapshotId: (snapshot: Snapshot<T, K>) => string;
  compareSnapshotState: (state1: Snapshot<T, K> | null, state2: Snapshot<T, K>) => boolean;
  payload: any;
  dataItems: any[];
  getInitialState: () => any;
  getConfigOption: (option: string) => any;
  getTimestamp: () => string;
  getStores: () => any[];
  getData: () => Data<T>;
  setData: (data: Data<T>) => void;
  addData: (data: Data<T>) => void;
  stores: any[];
  getStore: (id: string) => any | undefined;
  addStore: (storeId: number) => SnapshotStore<T, K>
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

const configureSnapshot = <T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(
  id: string,
  snapshotData: SnapshotData<T, K>,
  category?: string | symbol | Category,
  callback?: ((snapshot: Snapshot<T, K>) => void) | undefined,
  snapshotData?: SnapshotStore<T, K> | undefined,
  snapshotStoreConfig?: SnapshotStoreConfig<T, K, StructuredMetadata<T, K>, never>  | undefined,
  subscribers?: SubscriberCollection<T, K> | undefined // Added this as an argument
): Snapshot<T, K> | null => {
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
    clearSnapshotFailure, configureSnapshot, getChildIds, getParentId, getSnapshot, getSnapshotById,
    getSnapshotContainer, getSnapshotItems, getSnapshots, handleSnapshot, mapSnapshots, removeSnapshot,
    takeSnapshot, updateSnapshot, validateSnapshot
};
export type { SnapshotOperations };

