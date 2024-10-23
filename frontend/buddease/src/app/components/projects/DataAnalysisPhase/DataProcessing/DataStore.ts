// DataStore.ts
import * as snapshotApi from "@/app/api/SnapshotApi";
import axiosInstance from '@/app/api/axiosInstance';
import { endpoints } from '@/app/api/endpointConfigurations';
import headersConfig from '@/app/api/headers/HeadersConfig';
import { currentAppVersion } from '@/app/api/headers/authenticationHeaders';
import { CreateSnapshotStoresPayload } from '@/app/components/database/Payload';
import { UnsubscribeDetails } from '@/app/components/event/DynamicEventHandlerExample';
import { InitializedData, InitializedDataStore } from '@/app/components/hooks/SnapshotStoreOptions';
import { SnapshotManager } from '@/app/components/hooks/useSnapshotManager';
import { getCategoryProperties } from '@/app/components/libraries/categories/CategoryManager';
import { Category } from '@/app/components/libraries/categories/generateCategoryProperties';
import { BaseData, Data } from "@/app/components/models/data/Data";
import { allCategories } from '@/app/components/models/data/DataStructureCategories';
import { NotificationPosition, StatusType } from '@/app/components/models/data/StatusType';
import { RealtimeDataItem } from '@/app/components/models/realtime/RealtimeData';
import { SearchCriteria } from '@/app/components/routing/SearchCriteria';
import { ConfigureSnapshotStorePayload, SnapshotConfig, snapshotContainer, SnapshotData, SnapshotItem, SnapshotStoreMethod, SnapshotStoreProps } from '@/app/components/snapshots';
import { FetchSnapshotPayload } from '@/app/components/snapshots/FetchSnapshotPayload';
import { Payload, Snapshot, Snapshots, SnapshotsArray, SnapshotsObject, SnapshotUnion, UpdateSnapshotPayload } from "@/app/components/snapshots/LocalStorageSnapshotStore";
import { SnapshotContainer, SnapshotDataType } from '@/app/components/snapshots/SnapshotContainer';
import { SnapshotEvents } from '@/app/components/snapshots/SnapshotEvents';
import SnapshotStore, { SubscriberCollection } from '@/app/components/snapshots/SnapshotStore';
import { SnapshotStoreConfig } from '@/app/components/snapshots/SnapshotStoreConfig';
import { SnapshotWithCriteria } from '@/app/components/snapshots/SnapshotWithCriteria';
import { isSnapshot } from '@/app/components/snapshots/createSnapshotStoreOptions';
import { Callback } from '@/app/components/snapshots/subscribeToSnapshotsImplementation';
import transformDataToSnapshot from '@/app/components/snapshots/transformDataToSnapshot';
import CalendarManagerStoreClass from '@/app/components/state/stores/CalendarEvent';
import { NotificationType } from '@/app/components/support/NotificationContext';
import { convertMapToSnapshot, convertSnapshotStoreToSnapshot, isSnapshotStore } from '@/app/components/typings/YourSpecificSnapshotType';
import { Subscriber } from '@/app/components/users/Subscriber';
import { isSnapshotOfType } from '@/app/components/utils/snapshotUtils';
import { getCurrentAppInfo } from '@/app/components/versions/VersionGenerator';
import { StructuredMetadata } from '@/app/configs/StructuredMetadata';
import { UnifiedMetaDataOptions } from '@/app/configs/database/MetaDataOptions';
import { DataContext } from '@/app/context/DataContext';
import { CategoryProperties } from '@/app/pages/personas/ScenarioBuilder';
import { MixedCriteria } from '@/app/pages/searchs/CriteriaOptions';
import { CriteriaType } from '@/app/pages/searchs/CriteriaType';
import { FilterCriteria } from '@/app/pages/searchs/FilterCriteria';
import { IHydrateResult } from 'mobx-persist';
import { useContext } from 'react';
import { useDispatch } from "react-redux";
import * as apiData from "../../../../api//ApiData";
import { DataActions } from "../DataActions";
import { DataStoreMethods } from './ DataStoreMethods';

const dispatch = useDispatch()


interface CommonDataStoreMethods <T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T> {
  getSnapshotByKey(key: string): Snapshot<T, Meta, K> | undefined;
  mapSnapshotStore(): Map<string, Snapshot<T, Meta, K>>;
  getSubscribers(): SubscriberCollection<T, Meta, K>;
  getDataWithSearchCriteria(criteria: FilterCriteria): T[];
  getDataWithSearchCriteria(criteria: SearchCriteria): T[];
  getDataWithSearchCriteria(criteria: MixedCriteria): T[];  // Mixed criteria
}


export interface DataStore<T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T> {
  id: string | number | undefined
  data?: InitializedData | null;
  metadata: {} | StructuredMetadata<T, Meta, K> | undefined;
  dataStore?: InitializedDataStore | undefined
  storage?: SnapshotStore<T, Meta, K>[] | undefined;
  config: Promise<SnapshotStoreConfig<T, Meta, K> | null>;
  
 // Add convertKeyToT method
 convertKeyToT: (key: string) => T; // Adjust as necessary
 
  getSubscribers: () => Promise<Subscriber<T, Meta, K>[]>;
  getSnapshotByKey: (
    storeId: number,
    snapshotKey: string
  ) => Promise<Snapshot<T, Meta, K> | null | undefined>;

  mapSnapshot: (
    storeId: number,
    snapshotStore: SnapshotStore<T, Meta, K>,
    snapshotContainer: SnapshotContainer<T, Meta, K>,
    snapshotId: string,
    criteria: CriteriaType,
    snapshot: Snapshot<T, Meta, K>,
    type: string,
    event: Event
  ) => Promise<Snapshot<T, Meta, K> | null | undefined>;
  
  mapSnapshots: (
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
    data: T,
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
      data: K,
      index: number
    ) => SnapshotsObject<T, Meta, K>
  ) => Promise<SnapshotsArray<T, Meta>>

  mapSnapshotStore: (
    storeId: number,
    snapshotId: string,
    category: symbol | string | Category | undefined,
    categoryProperties: CategoryProperties | undefined,
    snapshot: Snapshot<any, any>,
    timestamp: string | number | Date | undefined,
    type: string,
    event: Event,
    id: number,
    snapshotStore: SnapshotStore<any, any>,
    data: any,
    // snapshotsArray: SnapshotsArray<any>,
    // snapshotsObject: SnapshotsObject<any>
  ) => Promise<SnapshotContainer<T, Meta, K> | undefined>;
  

  // mapSnapshotStores: (
  //   storeId: number,
    // snapshotId: string,
    // category: symbol | string | Category | undefined,
    // categoryProperties: CategoryProperties | undefined,
    // snapshot: Snapshot<any, any>,
    // timestamp: string | number | Date | undefined,
    // type: string,
    // event: Event,
    // id: number,
    // snapshotStore: SnapshotStore<any, any>,
  //   data: Data
  // ) => Promise<SnapshotStore<T>[]>;


  getSuubscribers: (
    snapshotId: string,
    category: symbol | string | Category | undefined,
    categoryProperties: CategoryProperties | undefined,
    snapshot: Snapshot<T, Meta, K>,
    timestamp: string | number | Date | undefined,
    type: string,
    event: Event,
    id: number,
    snapshotStore: SnapshotStore<T, Meta, K>,
    data: T
  ) => Promise<Subscriber<T, Meta, K>[]>;

  determineSnapshotStoreCategory: (
    storeId: number,
    snapshotStore: SnapshotStore<T, Meta, K>,
    configs: SnapshotStoreConfig<T, Meta, K>[]
  ) => string;

  getDataWithSearchCriteria: (id: number) => Promise<SnapshotWithCriteria<T, Meta, K> | undefined>;
  
  initializedState: InitializedState<T, Meta, K> | null
  getStoreData: (id: number) => Promise<SnapshotStore<T, Meta, K>[]>;
  getItem: (key: T, id: number) => Promise<Snapshot<T, Meta, K> | undefined>;
  updateStoreData: (
    data: Data,
    id: number,
    newData: SnapshotStore<T, Meta, K>
  ) => void;

  getAllData: () => Promise<Snapshot<T, Meta, K>[]>;
  updateDataTitle: (id: number, title: string) => void;
  updateDataDescription: (id: number, description: string) => void;
  addDataStatus: (id: number, status: StatusType | undefined) => void;
  updateDataStatus: (id: number, status: StatusType | undefined) => void;
  addDataSuccess: (payload: { data: Snapshot<T, Meta, K>[] }) => void;
  getDataVersions: (id: number) => Promise<Snapshot<T, Meta, K>[] | undefined>;
  updateDataVersions: (id: number, versions: Snapshot<T, Meta, K>[]) => void;
  // getBackendVersion: () => Promise<string | undefined>;


  getBackendVersion: () => IHydrateResult<number> | Promise<string> | undefined
  getFrontendVersion: () => IHydrateResult<number> | Promise<string> | undefined;

  getAllKeys: (
    storeId: number,
    snapshotId: string,
    category: symbol | string | Category | undefined,
    categoryProperties: CategoryProperties | undefined,
    snapshot: Snapshot<SnapshotUnion<BaseData, Meta>, K> | null,
    timestamp: string | number | Date | undefined,
    type: string,
    event: Event,
    id: number,
    snapshotStore: SnapshotStore<T, Meta, K>,
    data: T,
  ) => Promise<string[] | undefined> | undefined;

  fetchData: (id: number) => Promise<SnapshotStore<T, Meta, K>>;
  defaultSubscribeToSnapshot: (snapshotId: string, callback: Callback<Snapshot<T, Meta, K>>, snapshot: Snapshot<T, Meta, K>) => void;
  handleSubscribeToSnapshot: (
    snapshotId: string,
    callback: Callback<Snapshot<T, Meta, K>>,
    snapshot: Snapshot<T, Meta, K>
  ) => void;
  setItem: (id: string, item: Snapshot<T, Meta, K>) => Promise<void>;
  removeItem: (key: string) => Promise<void>
  getAllItems: (
    storeId: number,
    snapshotId: string,
    category: symbol | string | Category | undefined,
    categoryProperties: CategoryProperties | undefined,
    snapshot: Snapshot<SnapshotUnion<BaseData, Meta>, K> | null,
    timestamp: string | number | Date | undefined,
    type: string,
    event: Event,
    id: number,
    snapshotStore: SnapshotStore<T, Meta, K>,
    data: T
  ) => Promise<Snapshot<T, Meta, K>[]> | undefined;

  getDelegate: (context: {
    useSimulatedDataSource: boolean;
    simulatedDataSource: SnapshotStoreConfig<T, Meta, K>[]
  }) => Promise<SnapshotStoreConfig<T, Meta, K>[]>;


  updateDelegate: (
    delegate: SnapshotStoreConfig<T, Meta, K>[]
  ) => Promise<SnapshotStoreConfig<T, Meta, K>[]>;

  getSnapshot: (
    snapshot: (id: string | number) =>
      | Promise<{
        snapshotId: number;
        snapshotData: SnapshotData<T, Meta, K>;
        category: Category | undefined;
        categoryProperties: CategoryProperties;
        dataStoreMethods: DataStore<T, Meta, K>;
        timestamp: string | number | Date | undefined;
        id: string | number | undefined;
        snapshot: Snapshot<T, Meta, K>;
        snapshotStore: SnapshotStore<T, Meta, K>;
        data: T;
      }>
      | undefined
  ) => Promise<Snapshot<T, Meta, K> | undefined>;

  getSnapshotWithCriteria: (
    category: symbol | string | Category | undefined,
    timestamp: any,
    id: number,
    snapshot: Snapshot<T, Meta, K>,
    snapshotStore: SnapshotStore<T, Meta, K>,
    data: T,
  ) => Promise<SnapshotWithCriteria<T, Meta, K> | undefined>;

  getSnapshotContainer: (
    category: string, // Adjusted to more specific type
    timestamp: string, // Adjusted to more specific type
    id: number,
    snapshot: Snapshot<T, Meta, K>,
    snapshotStore: SnapshotStore<T, Meta, K>,
    snapshotData: SnapshotData<T, Meta, K>,
    data: Data,
    snapshotsArray: SnapshotsArray<T, Meta>,
    snapshotsObject: SnapshotsObject<T, Meta, K>
  ) => Promise<SnapshotContainer<T, Meta, K> | undefined>
  snapshotMethods?: SnapshotStoreMethod<T, Meta, K>[] | undefined;
  snapshotStoreConfig?: SnapshotStoreConfig<T, Meta, K>[] | undefined;
  getSnapshotVersions: (
    category: symbol | string | Category | undefined,
    timestamp: any,
    id: number,
    snapshot: Snapshot<T, Meta, K>,
    snapshotStore: SnapshotStore<T, Meta, K>,
    data: T,
  ) => Promise<Snapshot<T, Meta, K>[] | undefined>;
  // storage: SnapshotStore<T> | undefined;
  getSnapshotWithCriteriaVersions: (
    category: symbol | string | Category | undefined,
    timestamp: any,
    id: number,
    snapshot: Snapshot<T, Meta, K>,
    snapshotStore: SnapshotStore<T, Meta, K>,
    data: T
  ) => Promise<SnapshotWithCriteria<T, Meta, K>[] | undefined>
  dataStoreConfig: DataStore<T, Meta, K> | undefined
}



interface VersionedData <T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T> {
  versionNumber: string;
  appVersion: string;
  content: any;
  getData: (id: number) => Promise<SnapshotStore<T, Meta, K>[]>;
}

const useVersionedData =  <T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T>(
  data: Map<string, T>,
  fetchData: () => Promise<SnapshotStore<T, Meta, K>[]>,
): VersionedData<T, Meta, K> => {
  const { versionNumber } = getCurrentAppInfo();
  return {
    versionNumber: versionNumber,
    appVersion: currentAppVersion,
    content: {}, // Provide appropriate values
    getData: fetchData, // Provide appropriate values
  };
};



interface CallbackItem<T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T> extends SnapshotItem<T, Meta, K> {
  callback: (snapshot: Snapshot<T, Meta, K>) => void;
}

type InitializedState <T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T> =
  | T
  | Snapshot<T extends BaseData ? T : BaseData, K extends Data ? K : BaseData>
  | SnapshotStore<T extends BaseData ? T : BaseData, K extends Data ? K : BaseData>
  | Map<string, Snapshot<T extends BaseData ? T : BaseData, K extends Data ? K : BaseData>>
  | Snapshot<T extends BaseData ? T : BaseData, K extends Data ? K : BaseData>[] 
  | null 
  | undefined;


const initializeState = <T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T>(
  initialState: InitializedState<T, Meta, K>
): InitializedState<T, Meta, K> => {
  if (isSnapshot(initialState)) {
    return initialState;
  } else if (isSnapshotStore(initialState)) {
    return initialState;
  } else if (initialState instanceof Map) {
    return initialState;
  } else if (Array.isArray(initialState)) {
    return initialState; // Handle array of snapshots
  } else if (initialState === null || initialState === undefined) {
    return initialState; // Explicitly handle null or undefined
  } else {
    throw new Error("Invalid initial state type");
  }
};


interface EventManager<T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T> {
  eventRecords: {
    [key: string]: EventRecord<T, Meta, K>[]; // Index signature to allow string keys
  };
}

interface EventRecord<T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T> {
  record: CalendarManagerStoreClass<T, Meta, K>;  // Adjust as necessary
  records?: CalendarManagerStoreClass<T, Meta, K>[];  // Adjust as necessary
  callback: (snapshot: Snapshot<T, Meta, K>) => void;
  action: string; // Add 'action' if it's a string, adjust type if necessary
  timestamp: Date; // Add 'timestamp', adjust type if necessary
  snapshotRecords?: Record<string, Snapshot<T, Meta, K>[]>; // Add snapshotRecords to store snapshots 
}


class ConfigurableSnapshotStore<T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T> extends SnapshotStore<T, Meta, K> {
  public configure(config: SnapshotStoreConfig<T, Meta, K>): void {
    this.setConfig(config); // Now we can call the protected method
  }
}

const useDataStore = <T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T>(
  initialState: InitializedState<T, Meta, K> = null
): DataStore<T, Meta, K> & VersionedData<T, Meta, K> => {
  const data: Map<string, Snapshot<T, Meta, K>> = new Map<string, Snapshot<T, Meta, K>>();
  const context = useContext(DataContext);
  const API_BASE_URL = endpoints.snapshots
  const dispatch = useDispatch();
  // Function to convert a Snapshot<T, Meta, K> into T
  const convertSnapshotToData = (snapshot: Snapshot<T, Meta, K>): T => {
    // Assuming Snapshot<T, Meta, K> has a property 'data' that holds T
    return snapshot.data as T;
  };
  
  const fetchData = async (id: number): Promise<SnapshotStore<T, Meta, K>> => {
    try {
      const dataStore = useDataStore<T, Meta, K>();
      if (!context) {
        throw new Error("Context is undefined");
      }
      const delegateConfigs = await dataStore.getDelegate({
        useSimulatedDataSource: context.useSimulatedDataSource,
        simulatedDataSource: context.simulatedDataSource,
      });
      console.log("Delegate Configs:", delegateConfigs);

      dispatch(DataActions().fetchDataRequest());

      // Fetch the data from the API
      const responseData = await axiosInstance.get<SnapshotStore<T, Meta, K>>(
        endpoints.snapshots.single(id.toString()), // Update this line
        {
          headers: headersConfig, // Assuming you have prepared headers similar to before
        }
      );


      const jsonData = responseData.data;
      // Assuming the response is a single SnapshotStore object

      const snapshotData: SnapshotData<T, Meta, K> = new SnapshotStore<T, Meta, K>(

        {

          setSnapshotCategory: jsonData.setSnapshotCategory,
          getSnapshotCategory: jsonData.getSnapshotCategory,
          getSnapshotData: jsonData.getSnapshotData,
          deleteSnapshot: jsonData.deleteSnapshot,
         

          
          id: jsonData.id,
          key: jsonData.key,
          topic: jsonData.topic,
          date: jsonData.date ? new Date(jsonData.date) : undefined,
          keys: jsonData.keys,
          operation: jsonData.operation,
          title: jsonData.title,
          category: jsonData.category,
          categoryProperties: jsonData.categoryProperties,
          message: jsonData.message,
          timestamp: jsonData.timestamp,
          createdBy: jsonData.createdBy,
          eventRecords: jsonData.eventRecords,
          type: jsonData.type,

          subscribers: jsonData.subscribers,
          createdAt: jsonData.createdAt,
          store: jsonData.store,
          stores: jsonData.stores,

          snapshots: jsonData.snapshots,
          snapshotConfig: jsonData.snapshotConfig,
          meta: jsonData.meta,
          snapshotMethods: jsonData.snapshotMethods,

          getSnapshotsBySubscriber: jsonData.getSnapshotsBySubscriber,
          getSnapshotsBySubscriberSuccess: jsonData.getSnapshotsBySubscriberSuccess,
          getSnapshotsByTopic: jsonData.getSnapshotsByTopic,
          getSnapshotsByTopicSuccess: jsonData.getSnapshotsByTopicSuccess,

          getSnapshotsByCategory: jsonData.getSnapshotsByCategory,
          getSnapshotsByCategorySuccess: jsonData.getSnapshotsByCategorySuccess,
          getSnapshotsByKey: jsonData.getSnapshotsByKey,
          getSnapshotsByKeySuccess: jsonData.getSnapshotsByKeySuccess,

          getSnapshotsByPriority: jsonData.getSnapshotsByPriority,
          getSnapshotsByPrioritySuccess: jsonData.getSnapshotsByPrioritySuccess,
          getStoreData: jsonData.getStoreData,
          updateStoreData: jsonData.updateStoreData,

          updateDelegate: jsonData.updateDelegate,
          getSnapshotContainer: jsonData.getSnapshotContainer,
          getSnapshotVersions: jsonData.getSnapshotVersions,
          createSnapshot: jsonData.createSnapshot,

          criteria: jsonData.criteria,
          getDataStoreMap: jsonData.getDataStoreMap,
          emit: jsonData.emit,
          removeChild: jsonData.removeChild,
          getChildren: jsonData.getChildren,
          hasChildren: jsonData.hasChildren,
          isDescendantOf: jsonData.isDescendantOf,
          getInitialState: jsonData.getInitialState,

          getConfigOption: jsonData.getConfigOption,
          getTimestamp: jsonData.getTimestamp,
          getStores: jsonData.getStores,
          getData: jsonData.getData,
          addStore: jsonData.addStore,
          removeStore: jsonData.removeStore,
          createSnapshots: jsonData.createSnapshots,
          onSnapshot: jsonData.onSnapshot,

          // getFirstDelegate: jsonData.getInitialDelegate(),
          getInitialDelegate: jsonData.getInitialDelegate(),
          transformSnapshot: jsonData.getTransformedSnapshot,
          transformInitialState: jsonData.getTransformedInitialState,
          restoreSnapshot: jsonData.restoreSnapshot,

          snapshotStoreConfig: jsonData.snapshotStoreConfig,
          config: jsonData.getConfig(),
          configs: jsonData.getConfigs(
                snapshotId, snapshot, snapshotStore, snapshotManager, payload, callback, snapshotStoreData, category, snapshotDataConfig
          ),
          items: jsonData.getItems(),

          dataStore: jsonData.dataStore,
          mapDataStore: jsonData.mapDataStore,
          snapshotStores: jsonData.getSnapshotStores(),
          initialState: jsonData.initialState,
          name: jsonData.getName(),
          schema: jsonData.getSchema(),
          snapshotItems: jsonData.getSnapshotItems,
          nestedStores: jsonData.getNestedStores,

          snapshotIds: jsonData.getSnapshotIds,
          dataStoreMethods: jsonData.getDataStoreMethods,
          delegate: jsonData.getDelegate,
          getConfig: jsonData.getConfig,
          // setConfig: jsonData.setConfig,
          ensureDelegate: jsonData.ensureDelegate,
          getSnapshotItems: jsonData.getSnapshotItems,
          handleDelegate: jsonData.getHandleDelegate,
          notifySuccess: jsonData.getNotifySuccess,
          notifyFailure: jsonData.getNotifyFailure,
          findSnapshotStoreById: jsonData.getFindSnapshotStoreById,
          defaultSaveSnapshotStore: jsonData.getDefaultSaveSnapshotStore,
          saveSnapshotStore: jsonData.getSaveSnapshotStore,
          findIndex: jsonData.findIndex,
          splice: jsonData.splice,
          events: jsonData.events,
          subscriberId: jsonData.subscriberId,
          length: jsonData.length,
          content: jsonData.content,
          value: jsonData.value,
          todoSnapshotId: jsonData.todoSnapshotId,
          snapshotStore: jsonData.snapshotStore,
          dataItems: jsonData.dataItems,
          newData: jsonData.newData,
          storeId: jsonData.storeId,
          addSnapshotToStore: jsonData.addSnapshotToStore,
          addSnapshotItem: jsonData.addSnapshotItem,
          addNestedStore: jsonData.addNestedStore,
          defaultSubscribeToSnapshots: jsonData.defaultSubscribeToSnapshots,
          defaultCreateSnapshotStores: jsonData.defaultCreateSnapshotStores,
          createSnapshotStores: jsonData.createSnapshotStores,
          subscribeToSnapshots: jsonData.subscribeToSnapshots,

          subscribeToSnapshot: jsonData.subscribeToSnapshot,
          defaultOnSnapshots: jsonData.defaultOnSnapshots,
          onSnapshots: jsonData.onSnapshots,
          transformSubscriber: jsonData.getTransformSubscriber(),
          isCompatibleSnapshot: jsonData.getIsCompatibleSnapshot(),
          isSnapshotStoreConfig: jsonData.isSnapshotStoreConfig,
          transformDelegate: jsonData.transformDelegate,
          getSaveSnapshotStore: jsonData.getSaveSnapshotStore,
          getConfigs: jsonData.getConfigs,
          getSaveSnapshotStores: jsonData.getSaveSnapshotStores,
          initializedState: jsonData.initializedState,
          transformedDelegate: jsonData.transformedDelegate,
          transformedSubscriber: jsonData.transformedSubscriber,
          getSnapshotIds: jsonData.getSnapshotIds,
          getNestedStores: jsonData.getNestedStores,
          getFindSnapshotStoreById: jsonData.getFindSnapshotStoreById,
          getAllKeys: jsonData.getAllKeys,
          mapSnapshot: jsonData.mapSnapshot,
          getAllItems: jsonData.getAllItems,
          addData: jsonData.addData,
          addDataStatus: jsonData.addDataStatus,
          removeData: jsonData.removeData,
          updateData: jsonData.updateData,
          updateDataTitle: jsonData.updateDataTitle,
          updateDataDescription: jsonData.updateDataDescription,
          updateDataStatus: jsonData.updateDataStatus,
          addDataSuccess: jsonData.addDataSuccess,
          getDataVersions: jsonData.getDataVersions,
          updateDataVersions: jsonData.updateDataVersions,
          getBackendVersion: jsonData.getBackendVersion,
          getFrontendVersion: jsonData.getFrontendVersion,
          fetchData: jsonData.fetchData,

          defaultSubscribeToSnapshot: jsonData.defaultSubscribeToSnapshot,
          handleSubscribeToSnapshot: jsonData.handleSubscribeToSnapshot,
          snapshot: jsonData.snapshot,
          removeItem: jsonData.removeItem,
          getSnapshot: jsonData.getSnapshot,
          getSnapshotById: jsonData.getSnapshotById,
          getSnapshotSuccess: jsonData.getSnapshotSuccess,
          getSnapshotId: jsonData.getSnapshotId,
          getSnapshotArray: jsonData.getSnapshotArray,
          getItem: jsonData.getItem,
          setItem: jsonData.setItem,
          addSnapshotFailure: jsonData.addSnapshotFailure,
          getDataStore: jsonData.getDataStore,
          addSnapshotSuccess: jsonData.addSnapshotSuccess,
          getParentId: jsonData.getParentId,
          getChildIds: jsonData.getChildIds,
          addChild: jsonData.addChild,
          compareSnapshotState: jsonData.compareSnapshotState,
          deepCompare: jsonData.deepCompare,
          shallowCompare: jsonData.shallowCompare,
          getDataStoreMethods: jsonData.getDataStoreMethods,
          getDelegate: jsonData.getDelegate,
          determineCategory: jsonData.determineCategory,
          determineSnapshotStoreCategory: jsonData.determineSnapshotStoreCategory,
          determinePrefix: jsonData.determinePrefix,
          updateSnapshot: jsonData.updateSnapshot,
          updateSnapshotSuccess: jsonData.updateSnapshotSuccess,
          updateSnapshotFailure: jsonData.updateSnapshotFailure,
          removeSnapshot: jsonData.removeSnapshot,
          clearSnapshots: jsonData.clearSnapshots,
          addSnapshot: jsonData.addSnapshot,
          createInitSnapshot: jsonData.createInitSnapshot,
          createSnapshotSuccess: jsonData.createSnapshotSuccess,
          clearSnapshotSuccess: jsonData.clearSnapshotSuccess,
          clearSnapshotFailure: jsonData.clearSnapshotFailure,
          createSnapshotFailure: jsonData.createSnapshotFailure,
          setSnapshotSuccess: jsonData.setSnapshotSuccess,
          setSnapshotFailure: jsonData.setSnapshotFailure,
          updateSnapshots: jsonData.updateSnapshots,
          updateSnapshotsSuccess: jsonData.updateSnapshotsSuccess,
          updateSnapshotsFailure: jsonData.updateSnapshotsFailure,
          initSnapshot: jsonData.initSnapshot,
          takeSnapshot: jsonData.takeSnapshot,
          takeSnapshotSuccess: jsonData.takeSnapshotSuccess,
          takeSnapshotsSuccess: jsonData.takeSnapshotsSuccess,
          configureSnapshotStore: jsonData.configureSnapshotStore,
          updateSnapshotStore: jsonData.updateSnapshotStore,
          flatMap: jsonData.flatMap,
          setData: jsonData.setData,
          getState: jsonData.getState,
          setState: jsonData.setState,
          validateSnapshot: jsonData.validateSnapshot,
          handleSnapshot: jsonData.handleSnapshot,
          handleActions: jsonData.handleActions,
          setSnapshot: jsonData.setSnapshot,
          transformSnapshotConfig: jsonData.transformSnapshotConfig,
          setSnapshotData: jsonData.setSnapshotData,
          filterInvalidSnapshots: jsonData.filterInvalidSnapshots,
          setSnapshots: jsonData.setSnapshots,
          clearSnapshot: jsonData.clearSnapshot,
          mergeSnapshots: jsonData.mergeSnapshots,
          reduceSnapshots: jsonData.reduceSnapshots,
          sortSnapshots: jsonData.sortSnapshots,
          filterSnapshots: jsonData.filterSnapshots,
          mapSnapshotsAO: jsonData.mapSnapshotsAO,
          mapSnapshots: jsonData.mapSnapshots,
          findSnapshot: jsonData.findSnapshot,
          getSubscribers: jsonData.getSubscribers,
          notify: jsonData.notify,
          notifySubscribers: jsonData.notifySubscribers,
          subscribe: jsonData.subscribe,
          unsubscribe: jsonData.unsubscribe,
          fetchSnapshot: jsonData.fetchSnapshot,
          fetchSnapshotSuccess: jsonData.fetchSnapshotSuccess,
          fetchSnapshotFailure: jsonData.fetchSnapshotFailure,
          getSnapshots: jsonData.getSnapshots,
          getAllSnapshots: jsonData.getAllSnapshots,
          getSnapshotStoreData: jsonData.getSnapshotStoreData,
          generateId: jsonData.generateId,
          batchFetchSnapshots: jsonData.batchFetchSnapshots,
          batchTakeSnapshotsRequest: jsonData.batchTakeSnapshotsRequest,
          batchUpdateSnapshotsRequest: jsonData.batchUpdateSnapshotsRequest,
          batchFetchSnapshotsSuccess: jsonData.batchFetchSnapshotsSuccess,
          batchFetchSnapshotsFailure: jsonData.batchFetchSnapshotsFailure,
          batchUpdateSnapshotsSuccess: jsonData.batchUpdateSnapshotsSuccess,
          batchUpdateSnapshotsFailure: jsonData.batchUpdateSnapshotsFailure,
          batchTakeSnapshot: jsonData.batchTakeSnapshot,
          handleSnapshotSuccess: jsonData.handleSnapshotSuccess,
          isExpired: jsonData.isExpired,
          compress: jsonData.compress,
          auditRecords: jsonData.auditRecords,
          encrypt: jsonData.encrypt,
          decrypt: jsonData.decrypt,
          options: jsonData.options,
          initializeWithData: jsonData.initializeWithData,
          hasSnapshots: jsonData.hasSnapshots,
          safeCastSnapshotStore: jsonData.safeCastSnapshotStore,

          getName: jsonData.getName,
          getVersion: jsonData.getVersion,
          getSchema: jsonData.getSchema,
          version: jsonData.getVersion(),
          _saveSnapshotStores: jsonData._saveSnapshotStores,
          defaultSaveSnapshotStores: jsonData.defaultSaveSnapshotStores,
          setSnapshotCategory: jsonData.setSnapshotCategory, 
          getSnapshotCategory: jsonData.getSnapshotCategory, 
          getSnapshotData: jsonData.getSnapshotData, 
          deleteSnapshot: jsonData.deleteSnapshot,
          [Symbol.iterator]: function (this: SnapshotStore<T, Meta, K>): IterableIterator<Snapshot<T, Meta, K>> {
            return (function* (this: SnapshotStore<T, Meta, K>): IterableIterator<Snapshot<T, Meta, K>> {
              for (const snapshot of this.snapshots) {
                yield snapshot as Snapshot<T, Meta, K>; // Ensure the correct type
              }
            }).call(this);
          },
        });

      // Set the configuration after instantiation
      snapshotData.setConfig(jsonData.getConfig()); // Call setConfig here

      return snapshotData;
    } catch (error) {
      console.error("Error fetching data:", error);
      throw error;
    }
  };


  const addData = (newData: Snapshot<T, Meta, K>): void => {
    dispatch(DataActions<T, Meta, K>().addData(newData));
  };


  const removeData = (id: number) => {
    dispatch(DataActions().removeData(id));
  };

  const typeCheck = (snapshot: Snapshot<any, any>): snapshot is Snapshot<any, any> => {
    // Implement actual type checking logic here
    return snapshot && snapshot.id !== undefined;
  };

  const updateData = (id: number, newData: Snapshot<T, Meta, K>): void => {
    if (isSnapshotOfType<T, Meta, K>(newData, typeCheck)) {
      dispatch(DataActions<T, Meta, K>().updateData({ id, newData }));
    }
  };


  // Function to set an item in the data store
  const setItem = (id: string, item: T): Promise<void> => {
    return new Promise((resolve) => {
      const snapshot: Snapshot<T, Meta, K> = {
        data: item,
        // other properties that Snapshot<T, Meta, K> requires
      } as Snapshot<T, Meta, K>;

      data.set(id, snapshot);
      resolve();
    });
  };

  // Function to get an item from the data store
  const getItem = (id: string): Promise<T | undefined> => {
    return new Promise((resolve) => {
      const snapshot = data.get(id);
      if (snapshot) {
        resolve(convertSnapshotToData(snapshot));
      } else {
        resolve(undefined);
      }
    });
  };

  const getAllItems = (): Promise<Snapshot<T, Meta, K>[]> => {
    return new Promise((resolve) => {
      const items = Array.from(data.values());
      resolve(items);
    });
  };

  const removeItem = (key: string | number): Promise<void> => {
    return new Promise((resolve) => {
      data.delete(key);
      resolve();
    });
  };

  const updateDataTitle = (id: number, title: string) => {
    dispatch(DataActions().updateDataTitle({ id, title }));
  };

  const updateDataDescription = (id: number, description: string) => {
    dispatch(
      DataActions().updateDataDescription({
        type: "updateDataDescription",
        payload: description,
      })
    );
  };

  const updateDataStatus = (
    id: number,
    status: StatusType | undefined
  ) => {
    dispatch(
      DataActions().updateDataStatus({
        type: "updateDataStatus",
        payload: status,
      })
    );
  };

  const getDataVersions = async (id: number): Promise<Snapshot<T, Meta, K>[] | undefined> => {
    try {
      const response = await apiData.getDataVersions(id);
      const dataVersions: Snapshot<T, Meta, K>[] = response.map((version): Snapshot<T, Meta, K> => {
        const { id, versionNumber, appVersion, content, ...rest } = version;
        return rest as unknown as Snapshot<T, Meta, K>
      });
      return dataVersions;
    } catch (error) {
      console.error("Error fetching data versions:", error);
      return undefined;
    }
  };



  const addDataSuccess = async (payload: { data: Snapshot<T, Meta, K>[] }): Promise<void> => {
    const { data: newData } = payload;

    for (const item of newData) {
      if ('id' in item && item.id) {
        try {

          const snapshot = await snapshotApi.getSnapshot(item.id, item.storeId);

          if (snapshot) {
            const { id, versionNumber, appVersion, content, ...rest } = snapshot as Record<string, any>;
            const newSnapshot = rest as Snapshot<T, Meta, K>;
            data.set(item.id.toString(), newSnapshot);

            // Safely cast the category from the command line argument
            const categoryArg = process.argv[3];
            const category = categoryArg as keyof typeof allCategories;

            const categoryProperties = getCategoryProperties(category);
            const snapshotStoreConfig = useDataStore().snapshotStoreConfig as SnapshotStoreConfig<any, any>;

            const numericId = typeof item.id === 'string' ? parseInt(item.id, 10) : item.id;

            // Define criteria with empty or null properties
            const criteria: CriteriaType = {
              startDate: undefined,
              filterBy: '',
              value: '',
              endDate: undefined,
              status: null,
              priority: null,
              assignedUser: null,
              notificationType: null,
              todoStatus: null,
              taskStatus: null,
              teamStatus: null,
              dataStatus: null,
              calendarStatus: null,
              notificationStatus: null,
              bookmarkStatus: null,
              priorityType: null,
              projectPhase: null,
              developmentPhase: null,
              subscriberType: null,
              subscriptionType: null,
              analysisType: null,
              documentType: null,
              fileType: null,
              tenantType: null,
              ideaCreationPhaseType: null,
              securityFeatureType: null,
              feedbackPhaseType: null,
              contentManagementType: null,
              taskPhaseType: null,
              animationType: null,
              languageType: null,
              codingLanguageType: null,
              formatType: null,
              privacySettingsType: null,
              messageType: null,
            };


            const delegate = useDataStore()?.snapshotStoreConfig?.delegate ?? null;
            const snapshotId = await snapshot.store.snapshotId;
            if (numericId !== null && !isNaN(numericId)) {
              snapshotApi.getSnapshotConfig(
                String(numericId),

                snapshotId,
                snapshotContainer,
                criteria,
                category,
                categoryProperties,
                delegate,
                snapshot
              ).then((snapshotConfig) => {
                const snapshotItem: Snapshot<T, Meta, K> = transformDataToSnapshot(item, snapshotConfig, snapshotStoreConfig);

                if (snapshotItem.data instanceof Map && item.id !== undefined) {
                  snapshotItem.data.set(item.id.toString(), item);
                }
              }).catch((error) => {
                console.error("Error getting snapshot config for item:", item, error);
              });
            }
          }
        } catch (error) {
          console.error("Error processing item:", item, error);
        }
      }
    }
  }



  const addDataStatus = (
    id: number,
    status: StatusType | undefined,
    updateSnapshot: (id: string, status: StatusType) => void

  ): void => {
    const newData = data.get(id.toString());

    if (newData) {
      let initialState: SnapshotDataType<T, Meta, K> | null | undefined = null;
      let initialConfig: SnapshotConfig<T, Meta, K> | null | undefined = null;
      if (newData.initialState instanceof SnapshotStore) {
        // Convert SnapshotStore to Snapshot
        initialState = convertSnapshotStoreToSnapshot(newData.initialState) as Snapshot<T, Meta, K>;
      } else if (newData.initialState === null || newData.initialState === undefined) {
        initialState = null;
      } else {
        // Convert initialState data to SnapshotStore
        initialState = convertMapToSnapshot(
          newData.initialState.data
            ? new Map<string, Snapshot<T, Meta, K>>(Object.entries(newData.initialState.data))
            : new Map<string, Snapshot<T, Meta, K>>(),
          newData.initialState.timestamp
        );
      }

      const snapshotItem: Snapshot<T, Meta, K> = {
        id: id.toString(),
        data: new Map<string, Snapshot<T, Meta, K>>().set(id.toString(), newData),
        initialState: initialState,
        initialConfig: initialConfig,
        removeSubscriber: removeSubscriber,
        onInitialize: onInitialize,
        onError: onError,
        snapshot: snapshot,

        setCategory: setCategory,
        applyStoreConfig: applyStoreConfig,
        snapshotData: snapshotData,
        getSnapshotItems: getSnapshotItems,

        defaultSubscribeToSnapshots: defaultSubscribeToSnapshots,
        versionInfo: versionInfo,
        transformSubscriber: transformSubscriber,
        transformDelegate: transformDelegate,

        getBackendVersion: getBackendVersion,

        getFrontendVersion: getFrontendVersion,

        fetchData: fetchData,

        defaultSubscribeToSnapshot: defaultSubscribeToSnapshot,
        handleSubscribeToSnapshot: handleSubscribeToSnapshot,
        removeItem: removeItem,
        getSnapshot: getSnapshot,
        getSnapshotSuccess: getSnapshotSuccess,
        setItem: setItem as T,
        getItem: getItem,
        getDataStore: getDataStore,
        getDataStoreMap: getDataStoreMap,

        updateDataStatus: updateDataStatus,
        addDataSuccess: addDataSuccess,
        getDataVersions: getDataVersions,
        updateDataVersions: updateDataVersions,

        initializedState: initializedState,
        getAllKeys: getAllKeys,
        getAllItems: getAllItems,
        addDataStatus: addDataStatus,

        removeData: removeData,
        updateData: updateData,
        updateDataTitle: updateDataTitle,
        updateDataDescription: updateDataDescription,
        eventsDetails: [],

        eventRecords: {},

        timestamp: new Date(),
        events: {
          on: (event: string, callback: (snapshot: Snapshot<T, Meta, K>) => void) => {
            if (snapshotItem.data instanceof Map) {
              snapshotItem.data.forEach((item: Snapshot<T, Meta, K>) => {
                callback(item);
              });

              return () => {
                // Check if events and eventRecords are defined before accessing
                if (snapshotItem.events && snapshotItem.events.eventRecords) {
                  snapshotItem.events.eventRecords[event] = snapshotItem.events.eventRecords[event].filter(
                    (callbackItem: CalendarManagerStoreClass<T, Meta, K>) => callbackItem.callback !== callback
                  );
                } else {
                  console.error("Events or eventRecords are not defined.");
                }
              };
            }
          },

          off: (
            event: string,
            callback: (snapshot: Snapshot<T, Meta, K>,
              unsubscribeDetails?: { // Make this parameter optional
                userId?: string;
                snapshotId?: string;
                unsubscribeType?: string;
                unsubscribeDate?: Date;
                unsubscribeReason?: string;
                unsubscribeData?: any;
            }) => void
          ) => {
            if (!snapshotItem.events || !snapshotItem.events.eventRecords || !snapshotItem.events.eventRecords[event]) return;
            snapshotItem.events.eventRecords[event] = snapshotItem.events.eventRecords[event].filter(
              (record) => record.callback !== callback
            );
          },

          emit: (
            event: string,
            snapshot: Snapshot<T, Meta, K>,
            snapshotId: string,
            subscribers: SubscriberCollection<T, Meta, K>,
            type: string,
            snapshotStore: SnapshotStore<T, Meta, K>,
            dataItems: RealtimeDataItem[],
            criteria: SnapshotWithCriteria<T, Meta, K>,
            category: Category
          ) => {
            if (!snapshotItem.events || !snapshotItem.events.eventRecords || !snapshotItem.events.eventRecords[event]) return;
            snapshotItem.events.eventRecords[event].forEach(record => record.callback(snapshot));
          },

          once: (event: string, callback: (snapshot: Snapshot<T, Meta, K>) => void) => {
            const onceCallback = (snapshot: Snapshot<T, Meta, K>) => {
              callback(snapshot);
              snapshotItem.events?.off(event, onceCallback);
            };
            snapshotItem.events?.on(event, onceCallback);
          },

          addRecord: (
            event: string,
            record: CalendarManagerStoreClass<T, Meta, K>,
            callback: (snapshot: Snapshot<T, Meta, K>) => void
          ) => {
            if (!snapshotItem.events) return;
            if (!snapshotItem.events.eventRecords) {
              snapshotItem.events.eventRecords = {};
            }
            if (!snapshotItem.events.eventRecords[event]) {
              snapshotItem.events.eventRecords[event] = [];
            }

            const eventRecord: EventRecord<T, Meta, K> = { 
              action,
              timestamp,
              record, 
              callback 
          };
            
            snapshotItem.events.eventRecords[event].push(eventRecord);
          },

          removeAllListeners: (event?: string) => {
            if (!snapshotItem.events || !snapshotItem.events.eventRecords) return;
            if (event) {
              delete snapshotItem.events.eventRecords[event];
            } else {
              snapshotItem.events.eventRecords = {};
            }
          },

          subscribe: (event: string, callback: (snapshot: Snapshot<T, Meta, K>) => void) => {
            snapshotItem.events?.on(event, callback);
          },

          unsubscribe: (
            event: string,
            unsubscribeDetails: {
              userId: string;
              snapshotId: string;
              unsubscribeType: string;
              unsubscribeDate: Date;
              unsubscribeReason: string;
              unsubscribeData: any;
            },
            callback: Callback<Snapshot<T, Meta, K>>
          ) => {
            snapshotItem.events?.off(event, unsubscribeDetails, callback);
          },

          trigger: (
            event: string | SnapshotEvents<T, Meta, K>,
            snapshot: Snapshot<T, Meta, K>,
            snapshotId: string,
            subscribers: SubscriberCollection<T, Meta, K>,
            type: string,
            snapshotData: SnapshotData<T, Meta, K>
          ) => {
            // Ensure the event can be used to access the event records
            const eventKey = typeof event === 'string' ? event : event.key; // Adjust to access key as necessary

            if (
              !snapshotItem.events ||
              !snapshotItem.events.eventRecords ||
              !snapshotItem.events.eventRecords[eventKey]
            ) {
              return;
            }
            // Assuming record has a known structure, define its type
            snapshotItem.events.eventRecords[eventKey].forEach((record: { callback: (snapshot: Snapshot<T, Meta, K>) => void }) => {
              record.callback(snapshot);
            });
          },

          callbacks: {
            // Define the `onUpdate` event
            onUpdate: [
              (snapshot: Snapshot<T, Meta, K>) => {
                // Process each snapshot
                if (snapshot.id !== undefined && snapshot.data) {
                  updateDataVersions(
                    Number(snapshot.id),
                    Array.from(snapshot.data.values())
                  );
                  const snapshotData = snapshot.data.get(snapshot.id);
                  if (snapshotData) {
                    updateDataStatus(
                      Number(snapshot.id),
                      snapshotData.status as StatusType | undefined
                    );
                    updateDataTitle(
                      Number(snapshot.id),
                      snapshotData.title as string
                    );
                    updateDataDescription(
                      Number(snapshot.id),
                      snapshotData.description as string
                    );
                    updateData(
                      Number(snapshot.id),
                      snapshotData as Snapshot<T, Meta, K>
                    );
                  }
                }
              }
            ],
          },




          onSnapshotAdded: (event: string, snapshot: Snapshot<T, Meta, K>) => {
            console.log("onSnapshotAdded", snapshot);
            if (updateSnapshot) {
              updateSnapshot(snapshot.id, status);
            } else {
              console.error("updateSnapshot is not defined");
            }
            this.updateSnapshot?.(snapshot.id);

            snapshot.id,
              snapshot.data,
              snapshot.events,
              snapshot.snapshotStore,
              snapshot.dataItems,
              snapshot,
              snapshot.payload,
              snapshot.store

            return snapshot;
          },

          onSnapshotUpdated: (
            snapshotId: string,
            snapshot: Snapshot<T, Meta, K>,
            data: Map<string, Snapshot<T, Meta, K>>,
            events: Record<string, CalendarManagerStoreClass<T, Meta, K>[]>,
            snapshotStore: SnapshotStore<T, Meta, K>,
            dataItems: RealtimeDataItem[],
            newData: Snapshot<T, Meta, K>,
            payload: UpdateSnapshotPayload<T>,
            store: SnapshotStore<any, Meta, K>
          ) => {
            console.log("onSnapshotUpdated", snapshot);

            // Add an explicit check to ensure `updateSnapshot` is defined
            if (this.updateSnapshot) {
              this.updateSnapshot(
                snapshotId,
                data,
                events,
                snapshotStore,
                dataItems,
                newData,
                payload,
                store
              );
            }
          },
          onSnapshotRemoved: (
            event: string,
            snapshot: Snapshot<T, Meta, K>,
            snapshotId: string,
            subscribers: SubscriberCollection<T, Meta, K>,
            snapshotStore: SnapshotStore<T, Meta, K>,
            dataItems: RealtimeDataItem[],
            criteria: SnapshotWithCriteria<T, Meta, K>,
            category: Category
          ) => {
            console.log("onSnapshotRemoved", snapshot);

          },
          subscribers: [],
          eventIds: [],
        },
        meta: new Map<string, Snapshot<T, Meta, K>>(),
      };

      const snapshotData = snapshotItem.data?.get(id.toString());
      if (snapshotData) {
        data.set(id.toString(), snapshotData);
        dispatch(DataActions().addDataSuccess({ data: [snapshotItem] }));
      } else {
        dispatch(DataActions().addDataFailure({ error: "Invalid snapshot data" }));
      }
    } else {
      dispatch(DataActions().addDataFailure({ error: "Invalid data" }));
    }
  };

  const updateDataVersions = (id: number, versions: Snapshot<T, Meta, K>[]) => {
    dispatch(
      DataActions().updateDataVersions({
        payload: {
          id,
          versions,
        },
        type: "updateDataVersions",
      })
    );
  };

  const getBackendVersion = async (): Promise<string> => {
    try {
      const response = await apiData.getBackendVersion();
      return response;
    } catch (error) {
      console.error("Error fetching backend version:", error);
      throw error;
    }
  };

  const getFrontendVersion = async (): Promise<string> => {
    try {
      const response = await apiData.getFrontendVersion();
      return response;
    } catch (error) {
      console.error("Error fetching frontend version:", error);
      throw error;
    }
  };

  const getAllKeys = async (): Promise<string[]> => {
    try {
      const response = await apiData.getAllKeys();
      return response;
    } catch (error) {
      console.error("Error fetching all keys:", error);
      throw error;
    }
  };

  // Define your snapshotMethods array
  const snapshotMethods: SnapshotStoreMethod<T, Meta, K>[] = [
    {
      snapshot: (
        id: string | number | undefined,
        snapshotId: string | null,
        snapshotData: SnapshotData<T, Meta, K>,
        category: symbol | string | Category | undefined,
        categoryProperties: CategoryProperties | undefined,
        callback: (snapshotStore: SnapshotStore<T, Meta, K>) => void,
        dataStore: DataStore<T, Meta, K>,
        dataStoreMethods: DataStoreMethods<T, Meta, K>,
        // dataStoreSnapshotMethods: DataStoreWithSnapshotMethods<T, Meta, K>,
        metadata: UnifiedMetaDataOptions,
        subscriberId: string, // Add subscriberId here
        endpointCategory: string | number,// Add endpointCategory here
        storeProps: SnapshotStoreProps<T, Meta, K>,
        snapshotConfigData: SnapshotConfig<T, Meta, K>,
        subscription: Subscription<T, Meta, K>,
        snapshotStoreConfigData?: SnapshotStoreConfig<T, Meta, K>,
        snapshotContainer?: SnapshotStore<T, Meta, K> | Snapshot<T, Meta, K> | null,
      ): Promise<{ snapshot: Snapshot<T, Meta, K>; }> => {
        try {
          if (id === undefined) {
            throw new Error("Invalid id: id is undefined");
          }
          const item = data.get(String(id));
          const snapshotConfig = snapshotConfigData || {};
          if (item && snapshotStoreConfigData !== undefined) {
            const snapshotItem: Snapshot<T, Meta, K> = transformDataToSnapshot(item, snapshotConfig, snapshotStoreConfigData);

            // Call the callback with snapshotStore
            callback({
              addData: (data: Snapshot<T, Meta, K>) => { }, // Implement addData logic
              getItem: (key: T) => {
                return new Promise<Snapshot<T, Meta, K> | undefined>((resolve, reject) => {
                  try {
                    if (snapshotItem.data) {
                      resolve(snapshotItem.data.get(key)); // Safely access snapshotItem.data
                    } else {
                      resolve(undefined); // Handle case where snapshotItem.data is null or undefined
                    }
                  } catch (error) {
                    reject(error);
                  }
                });
              },
              id: undefined,
              key: '',
              keys: [],
              topic: '',
              date: undefined,
              operation: {
                operationType: "/Users/dixiejones/data_analysis/frontend/buddease/src/app/components/snapshots/SnapshotActions".CreateSnapshot
              },
              title: '',
              category: undefined,
              categoryProperties: undefined,
              message: undefined,
              timestamp: undefined,
              createdBy: '',
              eventRecords: null,
              type: undefined,
              subscribers: [],
              createdAt: undefined,
              store: undefined,
              stores: null,
              snapshots: [],
              snapshotConfig: undefined,
              meta: {},
              snapshotMethods: undefined,
              getSnapshotsBySubscriber: undefined,
              getSnapshotsBySubscriberSuccess: undefined,
              getSnapshotsByTopic: undefined,
              getSnapshotsByTopicSuccess: undefined,
              getSnapshotsByCategory: undefined,
              getSnapshotsByCategorySuccess: undefined,
              getSnapshotsByKey: undefined,
              getSnapshotsByKeySuccess: undefined,
              getSnapshotsByPriority: undefined,
              getSnapshotsByPrioritySuccess: undefined,
              getStoreData: undefined,
              updateStoreData: undefined,
              updateDelegate: undefined,
              getSnapshotContainer: undefined,
              getSnapshotVersions: undefined,
              createSnapshot: undefined,
              criteria: undefined,
              getDataStoreMap: undefined,
              emit: undefined,
              removeChild: undefined,
              getChildren: undefined,
              hasChildren: undefined,
              isDescendantOf: undefined,
              getInitialState: undefined,
              getConfigOption: undefined,
              getTimestamp: undefined,
              getStores: undefined,
              getData: undefined,
              addStore: undefined,
              removeStore: undefined,
              createSnapshots: undefined,
              onSnapshot: undefined,
              getFirstDelegate: function (): SnapshotStoreConfig<T, Meta, K> {
                throw new Error('Function not implemented.');
              },
              getInitialDelegate: function (): SnapshotStoreConfig<T, Meta, K> {
                throw new Error('Function not implemented.');
              },
              transformSnapshot: function <U extends BaseData, T extends BaseData>(snapshot: Snapshot<BaseData, T>): Snapshot<U, U> {
                throw new Error('Function not implemented.');
              },
              transformInitialState: function <U extends BaseData, T extends BaseData>(initialState: InitializedState<BaseData, T>): InitializedState<U, U> {
                throw new Error('Function not implemented.');
              },
              restoreSnapshot: function <R>(
                id: string,
                snapshot: Snapshot<T, Meta, K>,
                snapshotId: string,
                snapshotData: SnapshotData<T, Meta, K>,
                savedState: SnapshotStore<T, Meta, K>,
                category: Category | undefined,
                callback: (snapshot: T) => R, 
                snapshots: SnapshotsArray<T, Meta>,
                type: string,
                event: string | SnapshotEvents<T, Meta, K>,
                subscribers: SubscriberCollection<T, Meta, K>,
                snapshotContainer?: T,
                snapshotStoreConfig?: SnapshotStoreConfig<SnapshotUnion<BaseData, Meta>, T> | undefined
              ): Snapshot<T, Meta, K> | null {
                try {
                  // Logic to restore the snapshot based on the provided snapshotData
                  console.log(`Restoring snapshot with ID: ${snapshotId}`);
          
                  // Check if the snapshot already exists in the array
                  const existingSnapshot = snapshots.find((s) => s.id === snapshotId);
          
                  if (existingSnapshot) {
                    console.log(`Snapshot with ID ${snapshotId} already exists. Restoring...`);
          
                    // Restore the snapshot data
                    const restoredSnapshot = { ...existingSnapshot, ...snapshotData };
          
                    // Optionally, you can update the category if provided
                    if (category) {
                      restoredSnapshot.category = category;
                    }
          
                    // Execute the callback with the restored snapshot data and get the returned value
                    const result = callback(restoredSnapshot.data);
          
                    // Return the restored snapshot
                    return restoredSnapshot;
                  } else {
                    console.warn(`No snapshot found with ID: ${snapshotId}`);
                    return null; // Return null if no snapshot found to restore
                  }
                } catch (error) {
                  console.error('Error restoring snapshot:', error);
                  return null; // Return null in case of an error
                }
              },
              snapshotStoreConfig: undefined,
              config: null,
              configs: [],
              items: [],
              dataStore: undefined,
              mapDataStore: undefined,
              snapshotStores: new Map(),
              initialState: undefined,
              name: '',
              schema: {},
              snapshotItems: [],
              nestedStores: [],
              snapshotIds: [],
              dataStoreMethods: undefined,
              delegate: [],
              getConfig: function (): SnapshotStoreConfig<T, Meta, K> | null {
                throw new Error('Function not implemented.');
              },
              setConfig: function (config: SnapshotStoreConfig<T, Meta, K>): void {
                throw new Error('Function not implemented.');
              },
              ensureDelegate: function (): SnapshotStoreConfig<T, Meta, K> {
                throw new Error('Function not implemented.');
              },
              getSnapshotItems: function (): (SnapshotStoreConfig<T, Meta, K> | SnapshotItem<T, Meta, K> | undefined)[] {
                throw new Error('Function not implemented.');
              },
              handleDelegate: function <T extends (...args: any[]) => any, R = ReturnType<T>>(method: (delegate: any) => T, ...args: Parameters<T>): R | undefined {
                throw new Error('Function not implemented.');
              },
              notifySuccess: function (message: string): void {
                throw new Error('Function not implemented.');
              },
              notifyFailure: function (message: string): void {
                throw new Error('Function not implemented.');
              },
              findSnapshotStoreById: function (storeId: number): SnapshotStore<T, Meta, K> | null {
                throw new Error('Function not implemented.');
              },
              defaultSaveSnapshotStore: function (store: SnapshotStore<T, Meta, K>): Promise<void> {
                throw new Error('Function not implemented.');
              },
              saveSnapshotStore: function (store: SnapshotStore<T, Meta, K>): Promise<void> {
                throw new Error('Function not implemented.');
              },
              findIndex: function (predicate: (snapshot: Snapshot<T, Meta, K>) => boolean): number {
                throw new Error('Function not implemented.');
              },
              splice: function (index: number, count: number): void {
                throw new Error('Function not implemented.');
              },
              events: undefined,
              subscriberId: undefined,
              length: undefined,
              content: undefined,
              value: undefined,
              todoSnapshotId: undefined,
              snapshotStore: null,
              dataItems: [],
              newData: null,
              storeId: 0,
              addSnapshotToStore: function (storeId: number, snapshot: Snapshot<T, Meta, K>, snapshotStore: SnapshotStore<T, Meta, K>, snapshotStoreData: SnapshotStore<T, Meta, K>, category: Category | undefined, categoryProperties: CategoryProperties | undefined, subscribers: SubscriberCollection<T, Meta, K>): Promise<{ snapshotStore: SnapshotStore<T, Meta, K>; }> {
                throw new Error('Function not implemented.');
              },
              addSnapshotItem: function (item: SnapshotStoreConfig<T, Meta, K> | SnapshotItem<T, Meta, K>): void {
                throw new Error('Function not implemented.');
              },
              addNestedStore: function (store: SnapshotStore<T, Meta, K>): void {
                throw new Error('Function not implemented.');
              },
              defaultSubscribeToSnapshots: function (snapshotId: string, callback: (snapshots: Snapshots<T, Meta>) => Subscriber<T, Meta, K> | null, snapshot?: Snapshot<T, Meta, K> | null): void {
                throw new Error('Function not implemented.');
              },
              defaultCreateSnapshotStores: function (id: string, 
                snapshotId: string, snapshot: Snapshot<T, Meta, K>,
                 snapshotStore: SnapshotStore<T, Meta, K>,
                  snapshotManager: SnapshotManager<T, Meta, K>,
                   payload: CreateSnapshotStoresPayload<T, Meta, K>,
                    callback: (snapshotStore: SnapshotStore<T, Meta, K>[]

                    ) => void | null, 
                    snapshotStoreData?: SnapshotStore<T, Meta, K>[] | undefined, 
                category?: string | symbol | Category,
                snapshotDataConfig?: SnapshotStoreConfig<SnapshotWithCriteria<any, Meta, BaseData>, Meta, K>[] | undefined
              ): SnapshotStore<T, Meta, K>[] | null {
                throw new Error('Function not implemented.');
              },
              createSnapshotStores: function (id: string, snapshotId: string, snapshot: Snapshot<T, Meta, K>, snapshotStore: SnapshotStore<T, Meta, K>, snapshotManager: SnapshotManager<T, Meta, K>, payload: CreateSnapshotStoresPayload<T, Meta, K>, callback: (snapshotStore: SnapshotStore<T, Meta, K>[]) => void | null, snapshotStoreData?: SnapshotStore<T, Meta, K>[] | undefined, category?: string | symbol | Category, snapshotDataConfig?: SnapshotStoreConfig<SnapshotWithCriteria<any, Meta, BaseData>, Meta, K>[] | undefined): void {
                throw new Error('Function not implemented.');
              },
              subscribeToSnapshots: function (
                snapshotId: string,
                callback: (snapshots: Snapshots<T, Meta>

                ) => Snapshot<T, Meta, K> | null, snapshot?: Snapshot<T, Meta, K> | null): null {
                throw new Error('Function not implemented.');
              },
              subscribeToSnapshot: function (snapshotId: string, callback: Callback<Snapshot<T, Meta, K>>, snapshot: Snapshot<T, Meta, K>): void {
                throw new Error('Function not implemented.');
              },
              defaultOnSnapshots: function (snapshotId: string, snapshots: Snapshots<T, Meta>, type: string, event: Event, callback: (snapshots: Snapshots<T, Meta>) => void): void {
                throw new Error('Function not implemented.');
              },
              onSnapshots: function (snapshotId: string, snapshots: Snapshots<T, Meta>, type: string, event: Event, callback: (snapshots: Snapshots<T, Meta>) => void): Promise<void | null> {
                throw new Error('Function not implemented.');
              },
              transformSubscriber: function (sub: Subscriber<T, Meta, K>): Subscriber<T, Meta, K> {
                throw new Error('Function not implemented.');
              },
              isCompatibleSnapshot: function (snapshot: any): snapshot is Snapshot<T, Meta, K> {
                throw new Error('Function not implemented.');
              },
              isSnapshotStoreConfig: function (item: any): item is SnapshotStoreConfig<T, Meta, K> {
                throw new Error('Function not implemented.');
              },
              transformDelegate: function (): SnapshotStoreConfig<SnapshotWithCriteria<any, Meta, BaseData>, Meta, K>[] {
                throw new Error('Function not implemented.');
              },
              getSaveSnapshotStore: function (id: string, snapshotId: string, snapshot: Snapshot<T, Meta, K>, snapshotStore: SnapshotStore<T, Meta, K>, snapshotManager: SnapshotManager<T, Meta, K>, payload: CreateSnapshotStoresPayload<T, Meta, K>, callback: (snapshotStore: SnapshotStore<T, Meta, K>[]) => void | null, snapshotStoreData?: SnapshotStore<T, Meta, K>[] | undefined, category?: string | symbol | Category, snapshotDataConfig?: SnapshotStoreConfig<SnapshotWithCriteria<any, Meta, BaseData>, Meta, K>[] | undefined): void {
                throw new Error('Function not implemented.');
              },
              getConfigs: function (snapshotId: string, snapshot: Snapshot<T, Meta, K>, snapshotStore: SnapshotStore<T, Meta, K>, snapshotManager: SnapshotManager<T, Meta, K>, payload: CreateSnapshotStoresPayload<T, Meta, K>, callback: (snapshotStore: SnapshotStore<T, Meta, K>[]) => void | null, snapshotStoreData?: SnapshotStore<T, Meta, K>[] | undefined, category?: string | symbol | Category, snapshotDataConfig?: SnapshotStoreConfig<SnapshotWithCriteria<any, Meta, BaseData>, Meta, K>[] | undefined): void {
                throw new Error('Function not implemented.');
              },
              getSaveSnapshotStores: function (id: string, snapshotId: string, snapshot: Snapshot<T, Meta, K>, snapshotStore: SnapshotStore<T, Meta, K>, snapshotManager: SnapshotManager<T, Meta, K>, payload: CreateSnapshotStoresPayload<T, Meta, K>, callback: (snapshotStore: SnapshotStore<T, Meta, K>[]) => void | null, snapshotStoreData?: SnapshotStore<T, Meta, K>[] | undefined, category?: string | symbol | Category, snapshotDataConfig?: SnapshotStoreConfig<SnapshotWithCriteria<any, Meta, BaseData>, Meta, K>[] | undefined): void {
                throw new Error('Function not implemented.');
              },
              initializedState: undefined,
              transformedDelegate: [],
              transformedSubscriber: function (sub: Subscriber<T, Meta, K>): Subscriber<BaseData, Meta, K> {
                throw new Error('Function not implemented.');
              },
              getSnapshotIds: [],
              getNestedStores: [],
              getFindSnapshotStoreById: undefined,
              getAllKeys: function (storeId: number, snapshotId: string, category: symbol | string | Category | undefined, categoryProperties: CategoryProperties | undefined, snapshot: Snapshot<T, Meta, K>, timestamp: string | number | Date | undefined, type: string, event: Event, id: number, snapshotStore: SnapshotStore<T, Meta, K>, data: T): Promise<string[] | undefined> {
                throw new Error('Function not implemented.');
              },
              mapSnapshot: function (id: number, storeId: string, snapshotStore: SnapshotStore<T, Meta, K>, snapshotContainer: SnapshotContainer<T, Meta, K>, snapshotId: string, criteria: CriteriaType, snapshot: Snapshot<T, Meta, K>, type: string, event: Event): Promise<Snapshot<T, Meta, K> | null> {
                throw new Error('Function not implemented.');
              },
              getAllItems: function (): Promise<Snapshot<T, Meta, K>[]> | undefined {
                throw new Error('Function not implemented.');
              },
              addDataStatus: function (id: number, status: StatusType | undefined): void {
                throw new Error('Function not implemented.');
              },
              removeData: function (id: number): void {
                throw new Error('Function not implemented.');
              },
              updateData: function (id: number, newData: Snapshot<T, Meta, K>): void {
                throw new Error('Function not implemented.');
              },
              updateDataTitle: function (id: number, title: string): void {
                throw new Error('Function not implemented.');
              },
              updateDataDescription: function (id: number, description: string): void {
                throw new Error('Function not implemented.');
              },
              updateDataStatus: function (id: number, status: StatusType | undefined): void {
                throw new Error('Function not implemented.');
              },
              addDataSuccess: function (payload: { data: Snapshot<T, Meta, K>[]; }): void {
                throw new Error('Function not implemented.');
              },
              getDataVersions: function (id: number): Promise<Snapshot<T, Meta, K>[] | undefined> {
                throw new Error('Function not implemented.');
              },
              updateDataVersions: function (id: number, versions: Snapshot<T, Meta, K>[]): void {
                throw new Error('Function not implemented.');
              },
              getBackendVersion: function (): IHydrateResult<number> | Promise<string> {
                throw new Error('Function not implemented.');
              },
              getFrontendVersion: function (): Promise<string | IHydrateResult<number>> {
                throw new Error('Function not implemented.');
              },
              fetchData: function (id: number): Promise<SnapshotStore<T, Meta, K>[]> {
                throw new Error('Function not implemented.');
              },
              defaultSubscribeToSnapshot: function (snapshotId: string, callback: Callback<Snapshot<T, Meta, K>>, snapshot: Snapshot<T, Meta, K>): string {
                throw new Error('Function not implemented.');
              },
              handleSubscribeToSnapshot: function (snapshotId: string, callback: Callback<Snapshot<T, Meta, K>>, snapshot: Snapshot<T, Meta, K>): void {
                throw new Error('Function not implemented.');
              },
              snapshot: undefined,
              removeItem: function (key: string): Promise<void> {
                throw new Error('Function not implemented.');
              },
              getSnapshot: function (
                snapshot: (id: string | number) => Promise<{
                  snapshotId: number;
                  snapshotData: SnapshotData<T, Meta, K>;
                  category: Category | undefined;
                  categoryProperties: CategoryProperties | undefined;
                  dataStoreMethods: DataStore<T, Meta, K> | null;
                  timestamp: string | number | Date | undefined;
                  id: string | number | undefined;
                  snapshot: Snapshot<T, Meta, K>;
                  snapshotStore: SnapshotStore<T, Meta, K>;
                  data: T;
                }> | undefined): Promise<Snapshot<T, Meta, K> | undefined> {
                throw new Error('Function not implemented.');
              },
              getSnapshotById: function (
                snapshot: (id: string) => Promise<{ 
                  category: Category | undefined; 
                  categoryProperties: CategoryProperties; 
                  timestamp: string | number | Date | undefined; 
                  id: string | number | undefined;
                  snapshot: Snapshot<SnapshotUnion<BaseData, Meta>, T>;
                  snapshotStore: SnapshotStore<SnapshotUnion<BaseData, Meta>, T>;
                  data: SnapshotUnion<BaseData, Meta>; 
                }> | undefined
              ): Promise<Snapshot<SnapshotUnion<BaseData, Meta>, T> | null> {
                throw new Error('Function not implemented.');
              },
              getSnapshotSuccess: function (snapshot: Snapshot<SnapshotUnion<BaseData, Meta>, T>, subscribers: Subscriber<T, Meta, K>[]): Promise<SnapshotStore<T, Meta, K>> {
                throw new Error('Function not implemented.');
              },
              getSnapshotId: function (key: string | SnapshotData<T, Meta, K>): Promise<string | undefined> {
                throw new Error('Function not implemented.');
              },
              getSnapshotArray: function (): Promise<Snapshot<T, Meta, K>[]> {
                throw new Error('Function not implemented.');
              },
              setItem: function (key: string, value: Snapshot<T, Meta, K>): Promise<void> {
                throw new Error('Function not implemented.');
              },
              addSnapshotFailure: function (date: Date, snapshotManager: SnapshotManager<T, Meta, K>, snapshot: Snapshot<T, Meta, K>, payload: { error: Error; }): void {
                throw new Error('Function not implemented.');
              },
              getDataStore: function (): Promise<InitializedDataStore> {
                throw new Error('Function not implemented.');
              },
              addSnapshotSuccess: function (snapshot: T, subscribers: SubscriberCollection<T, Meta, K>): void {
                throw new Error('Function not implemented.');
              },
              getParentId: function (id: string, snapshot: Snapshot<SnapshotUnion<Data, Meta>, T>): string | null {
                throw new Error('Function not implemented.');
              },
              getChildIds: function (id: string, childSnapshot: Snapshot<T, Meta, K>): string[] {
                throw new Error('Function not implemented.');
              },
              addChild: function (parentId: string, childId: string, childSnapshot: Snapshot<T, Meta, K>): void {
                throw new Error('Function not implemented.');
              },
              compareSnapshotState: function (stateA: Snapshot<T, Meta, K> | Snapshot<T, Meta, K>[] | null | undefined, stateB: Snapshot<T, Meta, K> | null | undefined): boolean {
                throw new Error('Function not implemented.');
              },
              deepCompare: function (objA: any, objB: any): boolean {
                throw new Error('Function not implemented.');
              },
              shallowCompare: function (objA: any, objB: any): boolean {
                throw new Error('Function not implemented.');
              },
              getDataStoreMethods: function (): DataStoreMethods<T, Meta, K> {
                throw new Error('Function not implemented.');
              },
              getDelegate: function (context: { useSimulatedDataSource: boolean; simulatedDataSource: SnapshotStoreConfig<T, Meta, K>[]; }): Promise<SnapshotStoreConfig<T, Meta, K>[]> {
                throw new Error('Function not implemented.');
              },
              determineCategory: function (snapshot: string | Snapshot<T, Meta, K> | null | undefined): string {
                throw new Error('Function not implemented.');
              },
              determineSnapshotStoreCategory: function (storeId: number, snapshotStore: SnapshotStore<T, Meta, K>, configs: SnapshotStoreConfig<T, Meta, K>[]): string {
                throw new Error('Function not implemented.');
              },
              determinePrefix: function <T extends Data>(snapshot: T | null | undefined, category: string): string {
                throw new Error('Function not implemented.');
              },
              updateSnapshot: function (snapshotId: string, data: Map<string, Snapshot<T, Meta, K>>, events: Record<string, CalendarManagerStoreClass<T, Meta, K>[]>, snapshotStore: SnapshotStore<T, Meta, K>, dataItems: RealtimeDataItem[], newData: Snapshot<T, Meta, K>, payload: UpdateSnapshotPayload<T>, store: SnapshotStore<any, Meta, K>, callback?: ((snapshot: Snapshot<T, Meta, K>) => void) | undefined): Promise<{ snapshot: Snapshot<T, Meta, K>; }> {
                throw new Error('Function not implemented.');
              },
              updateSnapshotSuccess: function (): void {
                throw new Error('Function not implemented.');
              },
              updateSnapshotFailure: function ({ snapshotManager, snapshot, date, payload, }: { snapshotManager: SnapshotManager<T, Meta, K>; snapshot: Snapshot<T, Meta, K>; date: Date | undefined; payload: { error: Error; }; }): void {
                throw new Error('Function not implemented.');
              },
              removeSnapshot: function (snapshotToRemove: Snapshot<T, Meta, K>): void {
                throw new Error('Function not implemented.');
              },
              clearSnapshots: function (): void {
                throw new Error('Function not implemented.');
              },
              addSnapshot: function (snapshot: Snapshot<T, Meta, K>, snapshotId: string, subscribers: SubscriberCollection<T, Meta, K> | undefined): Promise<Snapshot<T, Meta, K> | undefined> {
                throw new Error('Function not implemented.');
              },
              createInitSnapshot: function (id: string, initialData: T, snapshotData: SnapshotData<T, Meta, K>, category: Category): Promise<Snapshot<Data, Meta, K>> {
                throw new Error('Function not implemented.');
              },
              createSnapshotSuccess: function (snapshotId: string, snapshotManager: SnapshotManager<T, Meta, K>, snapshot: Snapshot<T, Meta, K>, payload: { error: Error; }): void {
                throw new Error('Function not implemented.');
              },
              clearSnapshotSuccess: function (context: { useSimulatedDataSource: boolean; simulatedDataSource: SnapshotStoreConfig<T, Meta, K>[]; }): void {
                throw new Error('Function not implemented.');
              },
              clearSnapshotFailure: function (context: { useSimulatedDataSource: boolean; simulatedDataSource: SnapshotStoreConfig<T, Meta, K>[]; }): void {
                throw new Error('Function not implemented.');
              },
              createSnapshotFailure: function (snapshotId: string, snapshotManager: SnapshotManager<T, Meta, K>, snapshot: Snapshot<T, Meta, K>, payload: { error: Error; }): void {
                throw new Error('Function not implemented.');
              },
              setSnapshotSuccess: function (snapshotData: SnapshotData<T, Meta, K>, subscribers: ((data: Subscriber<T, Meta, K>) => void)[]): void {
                throw new Error('Function not implemented.');
              },
              setSnapshotFailure: function (error: Error): void {
                throw new Error('Function not implemented.');
              },
              updateSnapshots: function (): void {
                throw new Error('Function not implemented.');
              },
              updateSnapshotsSuccess: function (snapshotData: (subscribers: Subscriber<T, Meta, K>[], snapshot: Snapshots<T, Meta>) => void): void {
                throw new Error('Function not implemented.');
              },
              updateSnapshotsFailure: function (error: Payload): void {
                throw new Error('Function not implemented.');
              },
              initSnapshot: function (snapshot: Snapshot<T, Meta, K> | SnapshotStore<T, Meta, K> | null, snapshotId: number, snapshotData: SnapshotData<T, Meta, K>, category: Category | undefined, categoryProperties: CategoryProperties | undefined, snapshotConfig: SnapshotStoreConfig<T, Meta, K>, callback: (snapshotStore: SnapshotStore<any, any>) => void): void {
                throw new Error('Function not implemented.');
              },
              takeSnapshot: function (snapshot: Snapshot<T, Meta, K>, subscribers?: Subscriber<T, Meta, K>[] | undefined): Promise<{ snapshot: Snapshot<T, Meta, K>; }> {
                throw new Error('Function not implemented.');
              },
              takeSnapshotSuccess: function (snapshot: Snapshot<T, Meta, K>): void {
                throw new Error('Function not implemented.');
              },
              takeSnapshotsSuccess: function (snapshots: T[]): void {
                throw new Error('Function not implemented.');
              },
              configureSnapshotStore: function (snapshotStore: SnapshotStore<T, Meta, K>, storeId: number, data: Map<string, Snapshot<T, Meta, K>>, events: Record<string, CalendarManagerStoreClass<T, Meta, K>[]>, dataItems: RealtimeDataItem[], newData: Snapshot<T, Meta, K>, payload: ConfigureSnapshotStorePayload<T, Meta, K>, store: SnapshotStore<any, Meta, K>, callback: (snapshotStore: SnapshotStore<T, Meta, K>) => void): void {
                throw new Error('Function not implemented.');
              },
              updateSnapshotStore: function (snapshotStore: SnapshotStore<T, Meta, K>, snapshotId: string, data: Map<string, Snapshot<T, Meta, K>>, events: Record<string, CalendarManagerStoreClass<T, Meta, K>[]>, dataItems: RealtimeDataItem[], newData: Snapshot<T, Meta, K>, payload: ConfigureSnapshotStorePayload<T, Meta, K>, store: SnapshotStore<any, Meta, K>, callback: (snapshotStore: SnapshotStore<T, Meta, K>) => void): void {
                throw new Error('Function not implemented.');
              },
              flatMap: function <U extends Iterable<any>>(callback: (value: SnapshotStoreConfig<T, Meta, K>, index: number, array: SnapshotStoreConfig<T, Meta, K>[]) => U): U extends (infer I)[] ? I[] : U[] {
                throw new Error('Function not implemented.');
              },
              setData: function (data: Map<string, Snapshot<T, Meta, K>>): void {
                throw new Error('Function not implemented.');
              },
              getState: function () {
                throw new Error('Function not implemented.');
              },
              setState: function (state: any): void {
                throw new Error('Function not implemented.');
              },
              validateSnapshot: function (snapshotId: string, snapshot: Snapshot<T, Meta, K>): boolean {
                throw new Error('Function not implemented.');
              },
              handleSnapshot: function (id: string, snapshotId: number, snapshot: T | null, snapshotData: T, category: Category | undefined, categoryProperties: CategoryProperties | undefined, callback: (snapshot: T) => void, snapshots: SnapshotsArray<T, Meta>, type: string, event: Event, snapshotContainer?: T | undefined, snapshotStoreConfig?: SnapshotStoreConfig<T, Meta, K> | undefined): Promise<Snapshot<T, Meta, K> | null> {
                throw new Error('Function not implemented.');
              },
              handleActions: function (action: (selectedText: string) => void): void {
                throw new Error('Function not implemented.');
              },
              setSnapshot: function (snapshot: Snapshot<T, Meta, K>): void {
                throw new Error('Function not implemented.');
              },
              transformSnapshotConfig: function <U extends BaseData>(config: SnapshotConfig<U, U>): SnapshotConfig<U, U> {
                throw new Error('Function not implemented.');
              },
              setSnapshotData: function (snapshotStore: SnapshotStore<T, Meta, K>, data: Map<string, Snapshot<T, Meta, K>>, subscribers: Subscriber<T, Meta, K>[], snapshotData: Partial<SnapshotStoreConfig<T, Meta, K>>): Map<string, Snapshot<T, Meta, K>> {
                throw new Error('Function not implemented.');
              },
              filterInvalidSnapshots: function (snapshotId: string, state: Map<string, Snapshot<T, Meta, K>>): Map<string, Snapshot<T, Meta, K>> {
                throw new Error('Function not implemented.');
              },
              setSnapshots: function (snapshots: Snapshots<T, Meta>): void {
                throw new Error('Function not implemented.');
              },
              clearSnapshot: function (): void {
                throw new Error('Function not implemented.');
              },
              mergeSnapshots: function (snapshots: Snapshots<T, Meta>, category: string): void {
                throw new Error('Function not implemented.');
              },
              reduceSnapshots: function <U>(callback: (acc: U, snapshot: Snapshot<T, Meta, K>) => U, initialValue: U): U | undefined {
                throw new Error('Function not implemented.');
              },
              sortSnapshots: function (): void {
                throw new Error('Function not implemented.');
              },
              filterSnapshots: function (): void {
                throw new Error('Function not implemented.');
              },
              mapSnapshotsAO: function (storeIds: number[], snapshotId: string, category: Category | undefined, categoryProperties: CategoryProperties | undefined, snapshot: Snapshot<T, Meta, K>, timestamp: string | number | Date | undefined, type: string, event: Event, id: number, snapshotStore: SnapshotStore<T, Meta, K>, data: T): Promise<SnapshotContainer<T, Meta, K>> {
                throw new Error('Function not implemented.');
              },
              mapSnapshots: function <U>(storeIds: number[], snapshotId: string, category: Category | undefined, categoryProperties: CategoryProperties | undefined, snapshot: Snapshot<T, Meta, K>, timestamp: string | number | Date | undefined, type: string, event: Event, id: number, snapshotStore: SnapshotStore<T, Meta, K>, data: T, callback: (storeIds: number[], snapshotId: string, category: Category | undefined, categoryProperties: CategoryProperties | undefined, snapshot: Snapshot<T, Meta, K>, timestamp: string | number | Date | undefined, type: string, event: Event, id: number, snapshotStore: SnapshotStore<T, Meta, K>, data: K, index: number) => SnapshotsObject<T, Meta, K>): Promise<SnapshotsArray<T, Meta>> {
                throw new Error('Function not implemented.');
              },
              findSnapshot: function (predicate: (snapshot: Snapshot<T, Meta, K>) => boolean): Snapshot<T, Meta, K> | undefined {
                throw new Error('Function not implemented.');
              },
              getSubscribers: function (subscribers: Subscriber<T, Meta, K>[], snapshots: Snapshots<T, Meta>): Promise<{ subscribers: Subscriber<T, Meta, K>[]; snapshots: Snapshots<T, Meta>; }> {
                throw new Error('Function not implemented.');
              },
              notify: function (id: string, message: string, content: any, date: Date, type: NotificationType, notificationPosition?: NotificationPosition | undefined): void {
                throw new Error('Function not implemented.');
              },
              notifySubscribers: function (message: string, subscribers: Subscriber<T, Meta, K>[], data: Partial<SnapshotStoreConfig<T, Meta, K>>): Subscriber<T, Meta, K>[] {
                throw new Error('Function not implemented.');
              },
              subscribe: function (snapshotId: string, unsubscribe: UnsubscribeDetails, subscriber: Subscriber<T, Meta, K> | null, data: T, event: Event, callback: Callback<Snapshot<T, Meta, K>>): [] | SnapshotsArray<T, Meta> {
                throw new Error('Function not implemented.');
              },
              unsubscribe: function (callback: (snapshot: Snapshot<T, Meta, K>) => void): void {
                throw new Error('Function not implemented.');
              },
              fetchSnapshot: function (callback: (snapshotId: string,
                payload: FetchSnapshotPayload<K, K>,
                snapshotStore: SnapshotStore<T, Meta, K>,
                payloadData: Data | T,
                category: Category | undefined, 
                categoryProperties: CategoryProperties | undefined, 
                timestamp: Date, 
                data: T,
                delegate: SnapshotWithCriteria<T, Meta, K>[]
              ) => void
              ): Promise<{
                id: any; 
                category: Category | undefined; 
                categoryProperties: CategoryProperties; 
                timestamp: any; snapshot: Snapshot<T, Meta, K>; 
                data: T; 
                getItem?: (
                  (snapshot: Snapshot<T, Meta, K>

                ) => Snapshot<T, Meta, K> | undefined
                ) 
                | undefined;
              }> {
                throw new Error('Function not implemented.');
              },
              fetchSnapshotSuccess: function (snapshotData: (snapshotManager: SnapshotManager<T, Meta, K>, subscribers: Subscriber<T, Meta, K>[], snapshot: Snapshot<T, Meta, K>) => void): void {
                throw new Error('Function not implemented.');
              },
              fetchSnapshotFailure: function (snapshotId: string, snapshotManager: SnapshotManager<T, Meta, K>, snapshot: Snapshot<T, Meta, K>, date: Date | undefined, payload: { error: Error; }): void {
                throw new Error('Function not implemented.');
              },
              getSnapshots: function (category: string, data: Snapshots<T, Meta>): void {
                throw new Error('Function not implemented.');
              },
              getAllSnapshots: function (
                snapshotId: string,
                snapshotData: T,
                 timestamp: string,
                  type: string,
                  event: Event, 
                  id: number,
                   snapshotStore: SnapshotStore<T, Meta, K>,
                    category: symbol | string | Category | undefined, 
                    categoryProperties: CategoryProperties | undefined, 
                    dataStoreMethods: DataStore<T, Meta, K>, 
                    data: T, 
                    dataCallback?: ((subscribers: Subscriber<T, Meta, K>[], 
                      snapshots: Snapshots<T, Meta>
                    ) => Promise<Snapshots<T, Meta>>) | undefined): Promise<Snapshot<T, Meta, K>[]> {
                throw new Error('Function not implemented.');
              },
              getSnapshotStoreData: function (
                snapshotStore: SnapshotStore<T, Meta, K>,
                snapshot: Snapshot<T, Meta, K>,
                snapshotId: string,
                snapshotData: SnapshotData<T, Meta, K>
              ): SnapshotStore<T, Meta, K> {
                throw new Error('Function not implemented.');
              },
              generateId: function (): string {
                throw new Error('Function not implemented.');
              },
              batchFetchSnapshots: function (
                criteria: CriteriaType,
              snapshotData: (
                snapshotIds: string[],
                subscribers: SubscriberCollection<T, Meta, K>,
                snapshots: Snapshots<T, Meta>
              ) => Promise<{
                subscribers: SubscriberCollection<T, Meta, K>;
                snapshots: Snapshots<T, Meta>; // Include snapshots here for consistency
              }>): Promise<Snapshot<T, Meta, K>[]> {
                throw new Error('Function not implemented.');
              },
              batchTakeSnapshotsRequest: function (snapshotData: SnapshotData<T, Meta, K>): Promise<void> {
                throw new Error('Function not implemented.');
              },
              batchUpdateSnapshotsRequest: function (
                snapshotData: (subscribers: Subscriber<T, Meta, K>[]
                ) => Promise<{
                  subscribers: Subscriber<T, Meta, K>[]; 
                snapshots: Snapshots<T, Meta>; 
              }>
            ): Promise<void> {
                throw new Error('Function not implemented.');
              },
              batchFetchSnapshotsSuccess: function (subscribers: Subscriber<T, Meta, K>[], snapshots: Snapshots<T, Meta>): void {
                throw new Error('Function not implemented.');
              },
              batchFetchSnapshotsFailure: function (date: Date, snapshotManager: SnapshotManager<T, Meta, K>, snapshot: Snapshot<T, Meta, K>, payload: { error: Error; }): void {
                throw new Error('Function not implemented.');
              },
              batchUpdateSnapshotsSuccess: function (subscribers: Subscriber<T, Meta, K>[], snapshots: Snapshots<T, Meta>): void {
                throw new Error('Function not implemented.');
              },
              batchUpdateSnapshotsFailure: function (date: Date, snapshotId: string, snapshotManager: SnapshotManager<T, Meta, K>, snapshot: Snapshot<T, Meta, K>, payload: { error: Error; }): void {
                throw new Error('Function not implemented.');
              },
              batchTakeSnapshot: function (snapshotId: string, snapshotStore: SnapshotStore<T, Meta, K>, snapshots: Snapshots<T, Meta>): Promise<{ snapshots: Snapshots<T, Meta>; }> {
                throw new Error('Function not implemented.');
              },
              handleSnapshotSuccess: function (
                message: string, 
                snapshot: Snapshot<T, Meta, K> | null,
                snapshotId: string
              ): void {
                throw new Error('Function not implemented.');
              },
              isExpired: function (): boolean | undefined {
                throw new Error('Function not implemented.');
              },
              compress: function (): void {
                throw new Error('Function not implemented.');
              },
              auditRecords: [],
              encrypt: function (): void {
                throw new Error('Function not implemented.');
              },
              decrypt: function (): void {
                throw new Error('Function not implemented.');
              },
              [Symbol.iterator]: function (): IterableIterator<Snapshot<T, Meta, K>> {
                throw new Error('Function not implemented.');
              }
            });
            // Return the snapshotItem
            return Promise.resolve({ snapshot: snapshotItem });
          } else {
            // Handle case where item is not found
            throw new Error("Item not found");
          }
        } catch (error) {
          console.error("Error in snapshot method:", error);
          throw error; // Propagate the error
        }
      },
      // Add other methods and properties as needed
    }
  ];

  const { versionNumber } = getCurrentAppInfo();
  return {
    data,
    fetchData,
    addData,
    removeData,
    updateData,
    getItem,
    setItem,
    removeItem,
    getAllItems,
    updateDataTitle,
    updateDataDescription,
    updateDataStatus,
    addDataSuccess,
    addDataStatus,
    getDataVersions,
    updateDataVersions,
    getBackendVersion,
    getFrontendVersion,
    versionNumber: versionNumber,
    appVersion: currentAppVersion,
    content: {},
    getData: fetchData,
    getAllKeys,
    snapshotMethods
  };
};

export { initializeState, useDataStore };
export type { CommonDataStoreMethods, EventManager, EventRecord, InitializedState, VersionedData };

