// LocalStorageSnapshotStore.tsx
import * as snapshotApi from '@/app/api/SnapshotApi';
import { SnapshotItem } from '@/app/components/snapshots/SnapshotList';

import { endpoints } from '@/app/api/endpointConfigurations';
import { getSubscriberId } from "@/app/api/subscriberApi";
import { CategoryProperties } from "@/app/pages/personas/ScenarioBuilder";
import { IHydrateResult } from "mobx-persist";
import { FC } from "react";
import { Payload, UpdateSnapshotPayload } from '../database/Payload';
import { ModifiedDate } from "../documents/DocType";
import { SnapshotStoreOptions } from "../hooks/useSnapshotManager";
import { BaseData, Data, DataDetails } from "../models/data/Data";
import {
  PriorityTypeEnum,
  ProjectPhaseTypeEnum,
  StatusType,
  SubscriberTypeEnum,
  SubscriptionTypeEnum,
} from "../models/data/StatusType";
import { Task, TaskData } from "../models/tasks/Task";
import { DataStoreMethods } from "../projects/DataAnalysisPhase/DataProcessing/ DataStoreMethods";
import {
  DataStore,
  InitializedState
} from "../projects/DataAnalysisPhase/DataProcessing/DataStore";
import { Subscription } from "../subscriptions/Subscription";
import { NotificationType, NotificationTypeEnum } from "../support/NotificationContext";
import {
  getCommunityEngagement,
  getMarketUpdates,
  getTradeExecutions,
} from "../trading/TradingUtils";
import { Subscriber } from "../users/Subscriber";
import {
  logActivity,
  notifyEventSystem,
  portfolioUpdates,
  triggerIncentives,
  unsubscribe,
  updateProjectState,
} from "../utils/applicationUtils";
import { CustomSnapshotData, SnapshotData, SnapshotRelationships } from "./SnapshotData";

import { Category } from '../libraries/categories/generateCategoryProperties';
import { ExtendedVersionData } from '../versions/VersionData';
import { CoreSnapshot } from './CoreSnapshot';

import SnapshotStore, { SubscriberCollection } from "./SnapshotStore";
import { InitializedConfig, SnapshotStoreConfig } from './SnapshotStoreConfig';
import { SnapshotWithCriteria } from "./SnapshotWithCriteria";
import createSnapshotOptions from './createSnapshotOptions';
import { Callback } from "./subscribeToSnapshotsImplementation";
import { RealtimeDataItem } from "/Users/dixiejones/data_analysis/frontend/buddease/src/app/components/models/realtime/RealtimeData";
import CalendarManagerStoreClass from "/Users/dixiejones/data_analysis/frontend/buddease/src/app/components/state/stores/CalendarEvent";

import { SnapshotContainer, snapshotContainer, SnapshotDataType } from './SnapshotContainer';

import { UnifiedMetaDataOptions } from '@/app/configs/database/MetaDataOptions';
import { CriteriaType } from '@/app/pages/searchs/CriteriaType';
import { SchemaField } from '../database/SchemaField';
import { UnsubscribeDetails } from '../event/DynamicEventHandlerExample';
import { K, T } from '../models/data/dataStoreMethods';
import { SnapshotActionType } from './SnapshotActionType';
import { SnapshotConfig } from './SnapshotConfig';
import { SnapshotMethods } from './SnapshotMethods';

const SNAPSHOT_URL = endpoints.snapshots;


  type SnapshotUnion<T extends Data> =
    Snapshot<T, BaseData> |
    (SnapshotWithCriteria<T, BaseData> & T);

  type SnapshotStoreUnion<T extends BaseData> = 
    | SnapshotStoreObject<T, K>
    | SnapshotStoreObject<T, BaseData>
    | Snapshots<T>;

  //Snapshots type to include the union of the Snapshot types
  type Snapshots<T extends BaseData> = SnapshotsArray<T> | SnapshotsObject<T>;

  //SnapshotsObject to use SnapshotUnion
  type SnapshotsObject<T extends BaseData> = { [key: string]: SnapshotUnion<T> };

  //SnapshotsArray to use SnapshotUnion
  type SnapshotsArray<T extends BaseData> = Array<SnapshotUnion<T>>;

  //SnapshotStoreObject to use SnapshotUnion
   type SnapshotStoreObject<T extends BaseData, K> = { [key: string]: SnapshotStoreUnion<T> };


// Define the snapshot function correctly
const snapshotFunction = <T extends Data, K extends Data>(
  id: string | number | undefined,
  snapshotId: string | null,
  snapshotData: SnapshotData<T, K>,
  category: symbol | string | Category | undefined,
  callback: (snapshot: Snapshot<Data, Data>) => void,
  snapshotStoreConfigData?: SnapshotStoreConfig<SnapshotWithCriteria<any, BaseData>, K>,
  snapshotContainer?: SnapshotStore<Data, Data> | Snapshot<T, K> | null
): Promise<SnapshotData<T, K>> => {
  // Your logic for handling the snapshot goes here
  
  // If snapshotData is already a Promise or has a then method, return it directly
  if (typeof (snapshotData as any)?.then === 'function') {
    return Promise.resolve(snapshotData); // snapshotData might already be a promise-like object
  }

  // Otherwise, return a resolved Promise with snapshotData
  return Promise.resolve(snapshotData);
};



const criteria = await snapshotApi.getSnapshotCriteria(
  snapshotContainer as unknown as SnapshotContainer<T, K>, 
  snapshotFunction
); 

const snapshotObj = {} as Snapshot<Data, Data>
const options = createSnapshotOptions(snapshotObj, snapshotFunction);
const snapshotId = await snapshotApi.getSnapshotId(criteria);
const storeId = await snapshotApi.getSnapshotStoreId(String(snapshotId));
const snapshotStoreConfig = snapshotApi.getSnapshotStoreConfig(null, {} as SnapshotContainer<Data, Data>, {}, storeId)
const SNAPSHOT_STORE_CONFIG: SnapshotStoreConfig<Data, Data> = await snapshotStoreConfig as SnapshotStoreConfig<Data, Data>


interface Snapshot<T extends Data, K extends Data = T>
  extends CoreSnapshot<T, K>, SnapshotData<T, K>, SnapshotMethods<T, K>,
  SnapshotRelationships<T, K> {
    initialState: InitializedState<T, K>;
  isCore: boolean;
  
    initialConfig: InitializedConfig | undefined;
    removeSubscriber: any;
    onInitialize: any;
    onError: any;
    categories?: Category[];
    taskIdToAssign: string | undefined
    schema: Record<string, SchemaField>;
    currentCategory: Category;
    mappedSnapshotData:  Map<string, Snapshot<T, K>>;
    storeId: number
    criteria: CriteriaType
    storeConfig?: SnapshotStoreConfig<T, K>
    additionalData?: CustomSnapshotData
    snapshot: (
      id: string | number | undefined,
      snapshotId: string | null,
      snapshotData: SnapshotDataType<T, K>,
      category: symbol | string | Category | undefined,
      categoryProperties: CategoryProperties | undefined,
      callback: (snapshotStore: SnapshotStore<T, K>) => void,
      dataStoreMethods: DataStore<T, K>[],
      metadata: UnifiedMetaDataOptions,
      subscriberId: string, // Add subscriberId here
      endpointCategory: string | number ,// Add endpointCategory here
      snapshotStoreConfigData?: SnapshotStoreConfig<T, K>,
      snapshotContainer?: SnapshotStore<T, K> | Snapshot<T, K> | null,
    ) => Snapshot<T, K> | Promise<{ snapshot: Snapshot<T, K>; }>;
  
    setCategory: (category: string | Category) => void;
    
    applyStoreConfig: (
      snapshotStoreConfig?: SnapshotStoreConfig<SnapshotUnion<BaseData>, T> | undefined
    ) => void;

 
    generateId: (
      prefix: string,
      name: string,
      type: NotificationTypeEnum,
      id?: string,
      title?: string,
      chatThreadName?: string,
      chatMessageId?: string,
      chatThreadId?: string,
      dataDetails?: DataDetails,
      generatorType?: string
    ) => string

    snapshotData: (
      id: string,
      snapshotData: SnapshotData<T, K>,
      category: Category | undefined,
      categoryProperties: CategoryProperties | undefined,
      dataStoreMethods: DataStore<T, K>
    ) => Promise<SnapshotStore<T, K>>;

    snapshotStoreConfig?: SnapshotStoreConfig<T, K> | null;
    snapshotContainer: SnapshotContainer<T, K> | null;
  getSnapshotItems: () => (
    | SnapshotItem<T, K>
    | SnapshotStoreConfig<T, K> 
    | undefined 
  )[]

    defaultSubscribeToSnapshots: (
      snapshotId: string,
      callback: (snapshots: Snapshots<T>) => Subscriber<T, K> | null,
      snapshot: Snapshot<T, K> | null  
    ) => void;

    notify: (
      id: string,
      message: string,
      data: any,
      date: Date,
      type: NotificationType
    ) => void;

    notifySubscribers: (
      message: string,
      subscribers: Subscriber<T, K>[], 
      data: Partial<SnapshotStoreConfig<SnapshotUnion<BaseData>, K>>
    ) => Subscriber<T, K>[] 

    getAllSnapshots: (
      storeId: number,
      snapshotId: string,
      snapshotData: T,
      timestamp: string,
      type: string,
      event: Event,
      id: number,
      snapshotStore: SnapshotStore<T, K>,
      category: symbol | string | Category | undefined,
      categoryProperties: CategoryProperties | undefined,
      dataStoreMethods: DataStore<T, K>,
      data: T,
      dataCallback?: (
        subscribers: Subscriber<T, K>[],
        snapshots: Snapshots<T>
      ) => Promise<SnapshotUnion<T>[]>
    ) => Promise<Snapshot<T, K>[]>;
  
    getSubscribers: (
      subscribers: Subscriber<T, K>[], 
        snapshots: Snapshots<T>
      )=> Promise<{
        subscribers: Subscriber<T, K>[]; 
        snapshots: Snapshots<T>;
      }>

    versionInfo: ExtendedVersionData | null;

    transformSubscriber: (sub: Subscriber<T, K>) => Subscriber<T, K>;

    transformDelegate: () => SnapshotStoreConfig<T, K>[];

    initializedState: Snapshot<T, K> | SnapshotStore<T, K> | Map<string, Snapshot<T, K>> | null | undefined;

  getAllKeys: (
    storeId: number,
    snapshotId: string,
    category: symbol | string | Category | undefined,
    categoryProperties: CategoryProperties | undefined,
    snapshot: Snapshot<SnapshotUnion<BaseData>, T> | null,
    timestamp: string | number | Date | undefined,
    type: string,
    event: Event,
    id: number,
    snapshotStore: SnapshotStore<T, K>,
    data: T
    ) => Promise<string[] | undefined> | undefined


  // Logic for `getAllValues`
  
    getAllValues: () => SnapshotsArray<T>; // Use SnapshotsArray<T> if it represents an array of snapshots

    getAllItems: () => Promise<Snapshot<T, K>[] | undefined> 


    getSnapshotEntries: (snapshotId: string) => Map<string, T> | undefined;
    getAllSnapshotEntries: () => Map<string, T>[];
  
    addDataStatus: (id: number, status: StatusType | undefined) => void;
    removeData: (id: number) => void;
    updateData: (id: number, newData: Snapshot<T, K>) => void;
    updateDataTitle: (id: number, title: string) => void;
    updateDataDescription: (id: number, description: string) => void;
    updateDataStatus: (id: number, status: StatusType | undefined) => void;

    addDataSuccess: (payload: { data: Snapshot<T, K>[] }) => void;

    getDataVersions: (id: number) => Promise<Snapshot<T, K>[] | undefined>;
    updateDataVersions: (id: number, versions: Snapshot<T, K>[]) => void;

    getBackendVersion: () => Promise<string | undefined>;
    getFrontendVersion: () => Promise<string | IHydrateResult<number>>;

    fetchData: (id: number) => Promise<SnapshotStore<T, K>[]>;

    defaultSubscribeToSnapshot: (
      snapshotId: string, 
      callback: Callback<Snapshot<T, K>>, 
      snapshot: Snapshot<T, K>
    ) => string;

    handleSubscribeToSnapshot: (
      snapshotId: string, 
      callback: Callback<Snapshot<T, K>>, 
      snapshot: Snapshot<T, K>
    ) => void;

    removeItem: (key: string) => Promise<void>;
    
    getSnapshot: (
      snapshot: (id: string) => Promise<{
        snapshotId: number;
        snapshotData: T;
        category: Category | undefined;
        categoryProperties: CategoryProperties;
        dataStoreMethods: DataStore<T, K>
        timestamp: string | number | Date | undefined;
        id: string | number | undefined;
        snapshot: Snapshot<T, K>;
        snapshotStore: SnapshotStore<T, K>;
        data: T;
      }> | undefined
    ) => Promise<Snapshot<T, K> | undefined>;

  getSnapshotSuccess: (snapshot: Snapshot<SnapshotUnion<BaseData>, T>,
    subscribers: Subscriber<T, K>[]
  ) => Promise<SnapshotStore<T, K>>;

    setItem: (key: T, value: T) => Promise<void>;
    getItem: (key: T) => Promise<Snapshot<T, K> | undefined>;

    getDataStore: () => Promise<DataStore<T, K>>;
    getDataStoreMap: () => Promise<Map<string, Snapshot<T, K>>>;

    addSnapshotSuccess: (
      snapshot: Snapshot<T, K>, 
      subscribers: Subscriber<T, K>[]
    ) => void;

    deepCompare: (objA: any, objB: any) => boolean;
    shallowCompare: (objA: any, objB: any) => boolean;

    getDataStoreMethods: () => DataStoreMethods<T, K>;

    getDelegate: (context: {
      useSimulatedDataSource: boolean;
      simulatedDataSource: SnapshotStoreConfig<T, K>[];
    }) => SnapshotStoreConfig<T, K>[];

    determineCategory: (snapshot: Snapshot<T, K> | null | undefined) => string;
    determinePrefix: (snapshot: T | null | undefined, category: string) => string;

    removeSnapshot: (snapshotToRemove: Snapshot<T, K>) => void;
    addSnapshotItem: (item: Snapshot<T, K> | SnapshotStoreConfig<T, K>) => void;
    // addSnapConfig: (config: SnapshotConfig<T, K>) => void;
    addNestedStore: (store: SnapshotStore<T, K>) => void;
    clearSnapshots: () => void;

    addSnapshot: (
      snapshot: Snapshot<T, K>,
      snapshotId: string,
      subscribers: SubscriberCollection<T, K>
    ) => Promise<Snapshot<T, K> | undefined>;

    emit: (
      event: string,
      snapshot: Snapshot<T, K>,
      snapshotId: string, 
      subscribers: SubscriberCollection<T, K>,
      snapshotStore: SnapshotStore<T, K>, 
      dataItems: RealtimeDataItem[],
      criteria: SnapshotWithCriteria<T, K>,
      category: Category
    ) => void;

    createSnapshot: any;

    createInitSnapshot: (
      id: string,
      initialData: T, 
      snapshotStoreConfig: SnapshotStoreConfig<SnapshotUnion<any>, K>,
      category: Category,
    ) => Promise<SnapshotWithCriteria<T, K> > ;

  
  
    addStoreConfig: (config: SnapshotStoreConfig<T, K>) => void;

    handleSnapshotConfig: (config: SnapshotStoreConfig<T, K>) => void;
    getSnapshotConfig: (
      snapshotId: string | null, 
      snapshotContainer: SnapshotContainer<T, K>,
      criteria: CriteriaType,
      category: Category,
      categoryProperties: CategoryProperties | undefined,
      delegate: any, snapshotData: SnapshotStore<T, K>,
      snapshot: (id: string, snapshotId: string | null, 
        snapshotData: Snapshot<T, K>, 
        category: Category,
        ) => void
    ) => SnapshotStoreConfig<T, K>[] | undefined;

    getSnapshotListByCriteria: (
      criteria: SnapshotStoreConfig<T, K>
    ) => Promise<Snapshot<T, K>[]>;

    setSnapshotSuccess: (
      snapshotData: SnapshotStore<T, K>,
      subscribers: SubscriberCollection<T, K>
    ) => void;

    setSnapshotFailure: (error: Error) => void;
    updateSnapshots: () => void;

    updateSnapshotsSuccess: (
      snapshotData: (
        subscribers: Subscriber<T, K>[], 
        snapshot: Snapshots<T>
      ) => void
    ) => void;

    updateSnapshotsFailure: (error: Payload) => void;

    initSnapshot: (
      snapshot: SnapshotStore<T, K> | Snapshot<T, K> | null,
      snapshotId: number,
      snapshotData: SnapshotStore<T, K>,
      category: Category | undefined,
      categoryProperties: CategoryProperties | undefined,
      snapshotConfig: SnapshotStoreConfig<T, K>,
      callback: (snapshotStore: SnapshotStore<any, any>) => void
    ) => void;

    takeSnapshot: (
      snapshot: Snapshot<T, K>, 
      subscribers: Subscriber<T, K>[]
    ) => Promise<{ snapshot: Snapshot<T, K>; }>;

    takeSnapshotSuccess: (snapshot: Snapshot<T, K>) => void;

    takeSnapshotsSuccess: (snapshots: T[]) => void;

    flatMap: <U extends Iterable<any>>(
      callback: (
        value: SnapshotStoreConfig<T, K>, 
        index: number, 
        array: SnapshotStoreConfig<T, K>[]
      ) => U
    ) => U extends (infer I)[] ? I[] : U[];

    getState: () => any;
    setState: (state: any) => void;

    validateSnapshot: (
      snapshotId: string,
      snapshot: Snapshot<T, K>
    ) => boolean;

    handleActions: (action: (selectedText: string) => void) => void;

    setSnapshot: (snapshot: Snapshot<T, K>) => void;

  transformSnapshotConfig: <U extends BaseData>(
    config: SnapshotConfig<U, U>
  ) => SnapshotConfig<U, U>;

    setSnapshots: (snapshots: Snapshots<T>) => void;
    clearSnapshot: () => void;

    mergeSnapshots: (
      snapshots: Snapshots<T>, 
      category: string
    ) => void;

    reduceSnapshots: <U>(
      callback: (acc: U, snapshot: Snapshot<T, K>) => U, 
      initialValue: U
    ) => U | undefined;

    sortSnapshots: () => void;
    filterSnapshots: () => void;

    findSnapshot: (
      predicate: (snapshot: Snapshot<T, K>) => boolean
    ) => Snapshot<T, K> | undefined;

    mapSnapshots: <U>(
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
      data: K,
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
        data: K,
        index: number
      ) => U
    )=> U[];

    takeLatestSnapshot: () => Snapshot<T, K> | undefined;

    updateSnapshot: (
      snapshotId: string,
      data: Map<string, Snapshot<T, K>>,
      events: Record<string, CalendarManagerStoreClass<T, K>[]>,
      snapshotStore: SnapshotStore<T, K>,
      dataItems: RealtimeDataItem[],
      newData: Snapshot<T, K>,
      payload: UpdateSnapshotPayload<T>,
      store: SnapshotStore<any, K>
    ) => void;

    addSnapshotSubscriber: (
      snapshotId: string,
      subscriber: Subscriber<T, K>
    ) => void;

    removeSnapshotSubscriber: (
      snapshotId: string, 
      subscriber: Subscriber<T, K>
    ) => void;

    getSnapshotConfigItems: () => SnapshotStoreConfig<T, K>[];
    
    
  subscribeToSnapshots: (
    snapshotId: string,
    unsubscribe: UnsubscribeDetails, 
    callback: (snapshots: Snapshots<T>) => Subscriber<T, K> | null
  ) => [] | SnapshotsArray<T>;
    
    executeSnapshotAction: (
      actionType: SnapshotActionType, 
      actionData: any
    ) => Promise<void>;

    subscribeToSnapshot: (
      snapshotId: string,
      callback: (snapshot: Snapshot<T, K>) => void
    ) => void;

    unsubscribeFromSnapshot: (
      snapshotId: string,
      callback: (snapshot: Snapshot<T, K>) => void
    ) => void;

    subscribeToSnapshotsSuccess: (
      callback: (snapshots: Snapshots<T>) => void
    ) => string;

    unsubscribeFromSnapshots: (
      callback: (snapshots: Snapshots<T>) => void
    ) => void;

    getSnapshotItemsSuccess: () => SnapshotItem<Data, any>[] | undefined;
    getSnapshotItemSuccess: () => SnapshotItem<Data, any> | undefined;

    getSnapshotKeys: () => string[] | undefined;
    getSnapshotIdSuccess: () => string | undefined;

  getSnapshotValuesSuccess: () => SnapshotItem<Data, any>[] | undefined;
  
    getSnapshotWithCriteria: (
      criteria: SnapshotStoreConfig<T, K>
    ) => SnapshotStoreConfig<T, K>;

    reduceSnapshotItems: (
      callback: (acc: any, snapshot: Snapshot<T, K>) => any, 
      initialValue: any
    ) => any;

    subscribeToSnapshotList: (
      snapshotId: string, 
      callback: (snapshots: Snapshot<T, K>) => void
    ) => void;


}




const snapshotType = <T extends BaseData, K extends BaseData = T>(
  snapshotObj: Snapshot<T, K>,
  snapshot: (
    id: string | number | undefined,
    snapshotId: string | null,
    snapshotData: SnapshotData<T, K>,
    category: symbol | string | Category | undefined,
    callback: (snapshot: Snapshot<T, K>) => void,
    snapshotStoreConfigData?: SnapshotStoreConfig<SnapshotWithCriteria<any, BaseData>, K>,
    snapshotContainer?: SnapshotStore<T, K> | Snapshot<T, K> | null
  ) => Promise<Snapshot<T, K>>,
): Promise<Snapshot<T, K>> => {
  const newSnapshot = { ...snapshotObj }; // Shallow copy of the snapshot

  // Retrieve options for SnapshotStore initialization using the helper function
  const options: SnapshotStoreOptions<T, K> = createSnapshotOptions(snapshotObj, snapshot);

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
    snapshotContainer: SnapshotContainer<T, K>,
    snapshot?: (
    id: string | number | undefined,
    snapshotId: string | null,
    snapshotData: SnapshotData<T, K>,
    category: symbol | string | Category | undefined,
    callback: (snapshot: Snapshot<T, K>) => void,
    criteria: CriteriaType,
    snapshotStoreConfigData?: SnapshotStoreConfig<SnapshotWithCriteria<any, BaseData>, K>,
    snapshotContainerData?: SnapshotStore<T, K> | Snapshot<T, K> | null,
    ) => Promise<SnapshotData<T, K>>,
    snapshotObj?: Snapshot<T, K> | undefined,
  }> => {
    let criteria = await snapshotApi.getSnapshotCriteria(newSnapshot, snapshot);
    const tempSnapshotId = await snapshotApi.getSnapshotId(criteria);
    if (tempSnapshotId === undefined) {
      throw new Error("Failed to get snapshot ID");
    }

    // Retrieve snapshot data here; assuming you have a function to fetch it
    let snapshotData = snapshotApi.getSnapshotData(tempSnapshotId).then((snapshotData) => {
      if (snapshotData) {
        return snapshotData;
      }
      return null;
      })
    
    if (!snapshotData) {
      throw new Error("Failed to get snapshot data");
    }

    const snapshotContainerData = await (snapshotContainer as any)(tempSnapshotId);

    return { 
      criteria, 
      snapshotId: tempSnapshotId.toString(), 
      snapshotData: snapshotData,
      snapshotContainerData
    };
  };

  // Ensure the async operation completes before using the results
  const { criteria, snapshotId, snapshotData, snapshotContainerData } = await getCriteriaAndData();

  // Ensure snapshotContainerData has all required properties for SnapshotContainer
  const completeSnapshotContainerData: SnapshotContainer<T, K> = {
    id: newSnapshot.snapshotId,
    // parentId: newSnapshot.parentId || null,
    // childIds: newSnapshot.childIds || [],
    taskIdToAssign: newSnapshot.taskIdToAssign,
    initialConfig: newSnapshot.initialConfig,
    removeSubscriber: newSnapshot.removeSubscriber,
    onInitialize: newSnapshot.onInitialize,
    onError: newSnapshot.onError,
    snapshot: newSnapshot.snapshot,
    snapshotsArray: [],
    snapshotsObject: {},
    snapshotStore: newSnapshot.snapshotStore || {} as SnapshotStore<T, K>, // Provide a default empty object if null
    mappedSnapshotData: newSnapshot.mappedSnapshotData,
    timestamp: newSnapshot.timestamp,
    snapshotData: newSnapshot.snapshotData,
    data: newSnapshot.data,
   
    currentCategory: newSnapshot.currentCategory,
    setSnapshotCategory: newSnapshot.setSnapshotCategory,
    getSnapshotCategory: newSnapshot.getSnapshotCategory,
    items: newSnapshot.items,
   
    config: newSnapshot.config,
    subscribers: newSnapshot.subscribers,
    getSnapshotData: newSnapshot.getSnapshotData,
    deleteSnapshot: newSnapshot.deleteSnapshot,
   

    // Add any other required properties here
  };

  // Return the newSnapshot as a Promise<Snapshot<T, K>>
  return Promise.resolve({ ...newSnapshot, ...completeSnapshotContainerData, ...snapshotData });
};



export class LocalStorageSnapshotStore<
  T extends BaseData,
  K extends BaseData
> extends SnapshotStore<T, K> {
  // ... (previous code remains unchanged)

  fetchData(id: number): Promise<SnapshotStore<T, K>[]> {
    // Fetch or create the SnapshotStore instance based on the ID
    // For demonstration, we'll use placeholder logic to simulate fetching data
    const snapshotStore: SnapshotStore<T, K> = {
      id: id.toString(),
      data: new Map<string, any>(), // Replace with actual fetched data
      category: 'default-category', // Replace with actual category if needed
      getSnapshotId: async () => id.toString(),
      compareSnapshotState: () => false, // Implement comparison logic
      snapshot: async (): Promise<{ snapshot: Snapshot<T, K> }> => ({
        snapshot: {
          id: id.toString(),
          data: new Map(),
          category: 'default-category'
        }
      }),
      getSnapshotData: () => new Map(), // Replace with actual data
      getSnapshotCategory: () => 'default-category', // Replace with actual category
      setSnapshotData: (
        snapshotStore: SnapshotStore<T, K>,
        data: Map<string, Snapshot<T, K>>,
        subscribers: Subscriber<T, K>[],
        snapshotData: Partial<SnapshotStoreConfig<T, K>>
      ): Map<string, Snapshot<T, K>> => {
        // Update the snapshotStore's data with the new data
        snapshotStore.data = new Map(data);
      
        // Optional: Update the snapshotStore's configuration if provided
        if (snapshotData.initialState) {
          snapshotStore.data = new Map(snapshotData.initialState);
        }
      
        // Notify subscribers of the data change if needed
        if (subscribers.length > 0) {
          subscribers.forEach((subscriber) => {
            // Implement logic to notify each subscriber about the data change
            subscriber.notify(snapshotStore.data!, callback, subscribers);
          });
        }
      
        // Return the updated data
        return snapshotStore.data;
      },
      setSnapshotCategory: (newCategory: any) => {
        // Implement logic to set snapshot category
      },
      deleteSnapshot: () => {
        // Implement logic to delete snapshot
      },
      restoreSnapshot: (
        id: string,
        snapshot: Snapshot<T, K>,
        snapshotId: string,
        snapshotData: T,
        category: Category | undefined,
        callback: (snapshot: T) => void,
        snapshots: SnapshotsArray<T>,
        type: string,
        event: Event,
        snapshotContainer?: T,
        snapshotStoreConfig?: SnapshotStoreConfig<SnapshotUnion<BaseData>, T> | undefined
      ) => {
        // Implement logic to restore snapshot
      },
      createSnapshot: () => ({
        id: id.toString(),
        data: new Map(),
        category: 'default-category'
      }),
      updateSnapshot: async (
        snapshotId,
        data,
        events,
        snapshotStore,
        dataItems,
        newData,
        payload,
        store
      ): Promise<{ snapshot: Snapshot<T, K> }> => {
        // Implement update logic
        return { snapshot: { id: snapshotId.toString(), data: new Map(), category: 'default-category' } };
      }
      // Add other methods as needed
    };
    return Promise.resolve([snapshotStore]);
  }

  // ... (remaining code unchanged)
}

// Example usage in a Redux slice or elsewhere
const newTask: Task = {
  _id: "newTaskId2",
  id: "randomTaskId", // generate unique id
  name: "",
  title: "",
  description: "",
  assignedTo: [],
  dueDate: new Date(),
  status: "Pending",
  priority: PriorityTypeEnum.Medium,
  estimatedHours: 0,
  actualHours: 0,
  startDate: new Date(),
  completionDate: new Date(),
  endDate: new Date(),
  isActive: false,
  assigneeId: "",
  payload: {},
  previouslyAssignedTo: [],
  done: false,
  data: {} as TaskData,
  source: "user",
  tags: {},
  dependencies: [],
  then: function (
    onFulfill: (newData: Snapshot<Data>) => void
  ): Snapshot<Data> {
    const store = new LocalStorageSnapshotStore<Data, BaseData>(
      storeId,
      window.localStorage,
      category,
      options,
      config,
      operation
    );
    setTimeout(() => {
      onFulfill({
        data: {} as Map<string, Data>,
        store: store,
        state: null,
      });
    }, 1000);
    return {
      data: {} as Map<string, Data>,
      store: store,
      state: null,
    };
  },
};

export type {
  Payload,
  Snapshot,
  Snapshots,
  UpdateSnapshotPayload
};
// Create a subscription object
const subscription: Subscription<T, K> = {
  name: "subscription-123",
  unsubscribe: () => {},
  portfolioUpdates: () => {},
  tradeExecutions: () => {},
  marketUpdates: () => {},
  triggerIncentives: () => {},
  communityEngagement: () => {},
  subscriberId: "sub-123",
  subscriptionId: "sub-123-id",
  subscriberType: SubscriberTypeEnum.Individual,
  subscriptionType: SubscriptionTypeEnum.STANDARD,
  getPlanName: () => SubscriberTypeEnum.Individual,
  portfolioUpdatesLastUpdated: null,
  getId: () => "id-123",
  determineCategory: (data: string | Snapshot<T, K> | null | undefined): string => {
    if (typeof data === 'object' && data !== null) {
      // Ensure that `data.category` is converted to a string
      return typeof data.category === 'string' ? data.category : "default";
    }
    return "default";
  },
  category: "category-123",
};


const subscriberId = getSubscriberId.toString();

const subscriber = new Subscriber<T, K>(
  "_id",
  "John Doe",
  subscription,
  subscriberId,
  notifyEventSystem,
  updateProjectState,
  logActivity,
  triggerIncentives,
  undefined,
  {}
)

subscriber.id = subscriberId

// Example snapshot object with correct type alignment
const snapshots: CoreSnapshot<BaseData, BaseData>[] = [
   {
    id: "1",
    data: {
      /* your data */
    } as Map<string, Data>,

    // name: "Snapshot 1",
    timestamp: new Date(),
    createdBy: "User123",
    subscriberId: "Sub123",
    length: 100,
    category: "update",
    status: StatusType.Active,
    content: "Snapshot content",
    message: "Snapshot message",
    type: "type1",
    phases: ProjectPhaseTypeEnum.Development,
    phase: {
      id: "1",
      name: "Phase 1",
      startDate: new Date(),
      endDate: new Date(),
      // progress: 0,
      status: "In Progress",
      type: "type1",

      // Additional metadata
      _id: "abc123",
      title: "Snapshot Title",
      description: "Detailed description",
      subPhases: [
        {
          id: "1",
          name: "Subphase 1",
          startDate: new Date(),
          endDate: new Date(),
          status: "In Progress",
          type: "type1",
          duration: 0,
          subPhases: [],
          component: {} as FC<{}>,
        },
      ],
      tags: {
        "1": {
          id: "1",
          name: "Tag 1",
          color: "red",
          description: "Tag 1 description",
          relatedTags: [],
          isActive: true,
        },
      } 
    },

    ownerId: "Owner123",
    store: null,
    state: null,
    initialState: null,
    setSnapshotData(
      snapshotStore: SnapshotStore<BaseData, BaseData>,
      data: Map<string, Snapshot<Data, any>>, 
      subscribers: Subscriber<any, any>[],
      snapshotData: Partial<SnapshotStoreConfig<BaseData, BaseData>>
    ) {
      // If the config array already exists, update it with the new snapshotData
      if (this.config) {
        this.config.forEach((config) => {
          Object.assign(config, snapshotData);
        });
      } else {
        // If no config array exists, create a new one with the provided snapshotData
        this.config = [
          {
            ...snapshotData,
            id: 
            subscribers: subscribers as Subscriber<BaseData, BaseData>[], // Ensure correct type
          } as SnapshotStoreConfig<BaseData, BaseData>,
        ];
      }
    },
    // Additional metadata
    // _id: "abc123",
    // title: "Snapshot Title",
    description: "Detailed description",
    tags: {
      "1": {
        id: "1",
        name: "Tag 1",
        color: "red",
        description: "Tag 1 description",
        relatedTags: [],
        isActive: true,
      },
    },
    topic: "Topic",
    priority: PriorityTypeEnum.High,
    key: "unique-key",
    subscription: {
      unsubscribe: unsubscribe,
      portfolioUpdates: portfolioUpdates,
      tradeExecutions: getTradeExecutions,
      marketUpdates: getMarketUpdates,
      triggerIncentives: triggerIncentives,
      communityEngagement: getCommunityEngagement,
      portfolioUpdatesLastUpdated: {
        value: new Date(),
        isModified: false,
      } as ModifiedDate,
      determineCategory: (snapshotCategory: any) => {
        return snapshotCategory;
      },
      // id: "sub123",
      name: "Subscriber 1",
      subscriberId: "sub123",
      subscriberType: SubscriberTypeEnum.FREE,
      // subscriberName: "User 1",
      // subscriberEmail: "user1@example.com",
      // subscriberPhone: "123-456-7890",
      // subscriberStatus: "active",
      // subscriberRole: "admin",
      // subscriberCreatedAt: new Date(),
      // subscriberUpdatedAt: new Date(),
      // subscriberLastSeenAt: new Date(),
      // subscriberLastActivityAt: new Date(),
      // subscriberLastLoginAt: new Date(),
      // subscriberLastLogoutAt: new Date(),
      // subscriberLastPasswordChangeAt: new Date(),
      // subscriberLastPasswordResetAt: new Date(),
      // subscriberLastPasswordResetToken: "random-token",
      // subscriberLastPasswordResetTokenExpiresAt: new Date(),
      // subscriberLastPasswordResetTokenCreatedAt: new Date(),
      // subscriberLastPasswordResetTokenCreatedBy: "user123",
    },
    config: null,
    metadata: {
      /* additional metadata */
    },
    isCompressed: true,
    isEncrypted: false,
    isSigned: true,
    expirationDate: new Date(),
    auditTrail: [
      {
        userId: "user123",
        timestamp: new Date(),
        action: "update",
        details: "Snapshot updated",
      },
    ],
    subscribers: [subscriber],
    value: 50,
    todoSnapshotId: "todo123",
    // then: (callback: (newData: Snapshot<Data>) => void) => {
    //   /* implementation */
    // },
  },
]


// Example initial state
const initialState: InitializedState<Data, BaseData> ={

}



// const snapshot: Snapshot<Data, Data> = {
//   id: "",
//   category: category,
//   timestamp: new Date(),
//   createdBy: "",
//   description: "",
//   tags: {},
//   metadata: {},
//   data: new Map<string, Snapshot<T, K>>(),
//   initialState: initializeState(initialState),
//   events: {
//     eventRecords: {},
//     subscribers: [], // Assuming this is correctly typed elsewhere
//     eventIds: [],
//     callbacks: {
//       snapshotAdded: [
//         (snapshot: Snapshot<T, K>) => {
//           console.log("Snapshot added:", snapshot);
//         },
//       ],
//       snapshotRemoved: [
//         (snapshot: Snapshot<T, K>) => {
//           console.log("Snapshot removed:", snapshot);
//         },
//       ],
//       // Add more event keys and their corresponding callback arrays as needed
//     } as Record<string, ((snapshot: Snapshot<T, K>) => void)[]>, // Ensure the correct type
  
//     // Method to handle snapshot added event
//     onSnapshotAdded: function (
//       event: string,
//       snapshot: Snapshot<T, K>,
//       snapshotId: string,
//       subscribers: SubscriberCollection<T, K>,
//       snapshotStore: SnapshotStore<T, K>, 
//       dataItems: RealtimeDataItem[],
//       subscriberId: string,
//       criteria: SnapshotWithCriteria<T, K>,
//       category: Category
//     ) {
//       // const snapshotId = getSnapshotId(criteria)
//       this.emit(
//         "snapshotAdded",
//         snapshot, 
//         String(snapshotId), 
//         subscribers, 
//         snapshotStore,
//         dataItems,
//         criteria,
//         category
//       );
//     },
  
//     // Method to handle snapshot removed event
//     onSnapshotRemoved: function (
//       event: string,
//       snapshot: Snapshot<T, K>,
//       snapshotId: string, 
//       subscribers: SubscriberCollection<T, K>,
//       snapshotStore: SnapshotStore<T, K>, 
//       dataItems: RealtimeDataItem[],
//       criteria: SnapshotWithCriteria<T, K>,
//       category: Category
//     ) {
//       this.emit("snapshotRemoved",
//       snapshot, 
//         String(snapshotId), 
//         subscribers, 
//         snapshotStore,
//         dataItems,
//         criteria,
//         category);
//     },
  
//     // Method to handle snapshot updated event
//     onSnapshotUpdated: function(
//       snapshotId: string,
//       data: Map<string, Snapshot<T, K>>,
//       events: Record<string, CalendarManagerStoreClass<T, K>[]>,
//       snapshotStore: SnapshotStore<T, K>,
//       dataItems: RealtimeDataItem[],
//       newData: Snapshot<T, K>,
//       payload: UpdateSnapshotPayload<T>,
//       store: SnapshotStore<any, K>
//     ) {
//       console.log("Snapshot updated:", {
//         snapshotId,
//         data,
//         events,
//         snapshotStore,
//         dataItems,
//         newData,
//         payload,
//         store,
//       });
//     },
  
//     // Method to subscribe to an event
//     on: function(event: string, callback: (snapshot: Snapshot<T, K>) => void) {
//       if (!this.callbacks[event]) {
//         this.callbacks[event] = [];
//       }
//       this.callbacks[event].push(callback);
//     },
  
//     // Method to unsubscribe from an event
//     off: function(event: string, callback: (snapshot: Snapshot<T, K>) => void) {
//       if (this.callbacks[event]) {
//         this.callbacks[event] = this.callbacks[event].filter(cb => cb !== callback);
//       }
//     },
  
//     // Method to emit (trigger) an event
//     emit: function(event: string, snapshot: Snapshot<T, K>) {
//       if (this.callbacks[event]) {
//         this.callbacks[event].forEach(callback => callback(snapshot));
//       }
//     },
  
//     // Method to subscribe to an event once
//     once: function(event: string, callback: (snapshot: Snapshot<T, K>) => void) {
//       const onceCallback = (snapshot: Snapshot<T, K>) => {
//         callback(snapshot);
//         this.off(event, onceCallback);
//       };
//       this.on(event, onceCallback);
//     },
//     addRecord: function(
//       event: string,
//       record: CalendarManagerStoreClass<T, K>,
//       callback: (snapshot: CalendarManagerStoreClass<T, K>) => void
//     ) {
//       // Ensure eventRecords is not null
//       if (this.eventRecords === null) {
//         this.eventRecords = {}; // Initialize eventRecords if it is null
//       }
    
//       if (!this.eventRecords[event]) {
//         this.eventRecords[event] = [];
//       }
    
//       this.eventRecords[event].push(record);
//       callback(record);
//     },
    
//     // Method to remove all event listeners
//     removeAllListeners: function(event?: string) {
//       if (event) {
//         delete this.callbacks[event];
//       } else {
//         this.callbacks = {} as Record<string, ((snapshot: Snapshot<T, K>) => void)[]>;
//       }
//     },
  
//     // Method to subscribe to an event (alias for on)
//     subscribe: function(event: string, callback: (snapshot: Snapshot<T, K>) => void) {
//       this.on(event, callback);
//     },
  
//     // Method to unsubscribe from an event (alias for off)
//     unsubscribe: function(event: string, callback: (snapshot: Snapshot<T, K>) => void) {
//       this.off(event, callback);
//     },
  
//     // Method to trigger an event (alias for emit)
//     trigger: function (
//       event: string, 
//       snapshot: Snapshot<T, K>, 
//       snapshotId: string,
//       subscribers: SubscriberCollection<T, K>
//     ) {
//       this.emit(event, snapshot, snapshotId, subscribers);
//     },
//   },
//   meta: {} as Map<string, Snapshot<T, K>>,   

// }




export { createSnapshotOptions, snapshots };
export type {
  CoreSnapshot, SnapshotsArray, SnapshotsObject, SnapshotStoreObject, SnapshotStoreUnion, SnapshotUnion
};

