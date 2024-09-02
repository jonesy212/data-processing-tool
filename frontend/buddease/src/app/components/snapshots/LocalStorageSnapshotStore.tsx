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
import { DataStoreMethods, DataStoreWithSnapshotMethods } from "../projects/DataAnalysisPhase/DataProcessing/ DataStoreMethods";
import {
  DataStore,
  InitializedState,
  initializeState,
  useDataStore,
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
import { SnapshotData, SnapshotRelationships } from "./SnapshotData";

import { Category } from '../libraries/categories/generateCategoryProperties';
import { ExtendedVersionData } from '../versions/VersionData';
import { CoreSnapshot } from './CoreSnapshot';
import { SnapshotOperation } from './SnapshotActions';
import { K, T } from "./SnapshotConfig";
import SnapshotStore, { SubscriberCollection } from "./SnapshotStore";
import { SnapshotStoreConfig } from './SnapshotStoreConfig';
import { SnapshotWithCriteria } from "./SnapshotWithCriteria";
import createSnapshotOptions from './createSnapshotOptions';
import { Callback } from "./subscribeToSnapshotsImplementation";
import { RealtimeDataItem } from "/Users/dixiejones/data_analysis/frontend/buddease/src/app/components/models/realtime/RealtimeData";
import CalendarManagerStoreClass from "/Users/dixiejones/data_analysis/frontend/buddease/src/app/components/state/stores/CalendarEvent";

import { SnapshotContainer, snapshotContainer } from './SnapshotContainer';

import { UnsubscribeDetails } from '../event/DynamicEventHandlerExample';
import { SnapshotActionType } from './SnapshotActionType';
import { SnapshotMethods } from './SnapshotMethods';
import useSubscription from '../hooks/useSubscription';

const SNAPSHOT_URL = endpoints.snapshots;


type SnapshotUnion<T extends Data> =
  Snapshot<T, BaseData> |
  (SnapshotWithCriteria<T, BaseData> & T);

type SnapshotStoreUnion<T extends BaseData> = 
  | SnapshotStoreObject<T, any>
  | SnapshotStoreObject<T, BaseData>
  | Snapshots<T>;

//Snapshots type to include the union of the Snapshot types
type Snapshots<T extends BaseData> = SnapshotsArray<T> | SnapshotsObject<T>;

//SnapshotsObject to use SnapshotUnion
type SnapshotsObject<T extends BaseData> = { [key: string]: SnapshotUnion<T> };

//SnapshotsArray to use SnapshotUnion
type SnapshotsArray<T extends BaseData> = Array<SnapshotUnion<T>>;

//SnapshotStoreObject to use SnapshotUnion
type SnapshotStoreObject<T extends BaseData, K> = { [key: string]: SnapshotUnion<T> };


const snapshot = ""
 
const criteria = await snapshotApi.getSnapshotCriteria(
  snapshotContainer as unknown as SnapshotContainer<T, K>, 
  snapshot
); 

const snapshotObj = {} as Snapshot<Data, Data>
const options = createSnapshotOptions(snapshotObj, snapshot);
const snapshotId = await snapshotApi.getSnapshotId(criteria);
const storeId = await snapshotApi.getSnapshotStoreId(Number(snapshotId));
const snapshotStoreConfig = snapshotApi.getSnapshotStoreConfig(null, {} as SnapshotContainer<Data, Data>, {}, storeId)
const SNAPSHOT_STORE_CONFIG: SnapshotStoreConfig<Data, Data> = await snapshotStoreConfig as SnapshotStoreConfig<Data, Data>


interface Snapshot<T extends Data, K extends Data = T>
  extends CoreSnapshot<T, K>, SnapshotData<T, K>, SnapshotMethods<T, K>,
  SnapshotRelationships<T, K> {
    initialState: InitializedState<T, K>;
    isCore: boolean;
    initialConfig: any;
    removeSubscriber: any;
    onInitialize: any;
    onError: any;
    categories?: Category[];
    taskIdToAssign: string | undefined
    
    currentCategory: Category;
    mappedSnapshotData:  Map<string, Snapshot<T, K>>
    snapshot: (
      id: string | number | undefined,
      snapshotId: number,
      snapshotData: SnapshotData<T, K>,
      category: symbol | string | Category | undefined,
      categoryProperties: CategoryProperties | undefined,
      dataStoreMethods: DataStore<T, K>[]
    ) => Promise<{ snapshot: Snapshot<T, K>}> | Snapshot<T, K>;
    
    setCategory: (category: string | Category) => void;
    
    applyStoreConfig: (
      snapshotStoreConfig: SnapshotStoreConfig<T, K>
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
      snapshotData: T,
      category: Category | undefined,
      categoryProperties: CategoryProperties | undefined,
      dataStoreMethods: DataStore<T, K>
    ) => Promise<SnapshotStore<T, K>>;

    snapshotStoreConfig?: SnapshotStoreConfig<T, any> | null;

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
      data: Partial<SnapshotStoreConfig<T, any>>
    ) => Subscriber<T, K>[] 

    getAllSnapshots: (
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
      ) => Promise<Snapshots<T>>
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
    snapshot: Snapshot<T, K>,
    timestamp: string | number | Date | undefined,
    type: string,
    event: Event,
    id: number,
    snapshotStore: SnapshotStore<T, K>,
    data: T
    ) => Promise<string[] | undefined>;


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

    getSnapshotSuccess: (snapshot: Snapshot<T, K>) => Promise<SnapshotStore<T, K>>;

    setItem: (key: T, value: T) => Promise<void>;
    getItem: (key: T) => Promise<Snapshot<T, K> | undefined>;

    getDataStore: () => Promise<DataStore<T, K>>;
    getDataStoreMap: () => Promise<Map<string, Snapshot<T, K>>>;

    addSnapshotSuccess: (
      snapshot: T, 
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
      snapshotStoreConfig: SnapshotStoreConfig<T, K>,
      category: Category
    ) => Promise<Snapshot<Data, K>> ;

    addStoreConfig: (config: SnapshotStoreConfig<T, any>) => void;

    handleSnapshotConfig: (config: SnapshotStoreConfig<T, any>) => void;
    getSnapshotConfig: () => SnapshotStoreConfig<T, any>[];

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
      snapshotId: string | null,
      snapshotData: SnapshotStore<T, K>,
      category: symbol | string | Category | undefined,
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

    transformSnapshotConfig: <T extends BaseData>(
      config: SnapshotStoreConfig<T, T>
    ) => SnapshotStoreConfig<T, T>;

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
      categoryProperties: CategoryProperties,
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
        categoryProperties: CategoryProperties,
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
    snapshotId: number,
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
    snapshotData: Snapshot<T, K>,
    category: symbol | string | Category | undefined,
    callback: (snapshot: Snapshot<T, K>) => void,
    snapshotStoreConfigData?: SnapshotStoreConfig<T, K>,
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
    snapshotId: number,
    snapshotData: Snapshot<T, K>,
    criteria: any;
    snapshotContainerData: SnapshotContainer<T, K>
  }> => {
    const criteria = await snapshotApi.getSnapshotCriteria(newSnapshot, snapshot);
    const tempSnapshotId = await snapshotApi.getSnapshotId(criteria);
    if (tempSnapshotId === undefined) {
      throw new Error("Failed to get snapshot ID");
    }

    // Retrieve snapshot data here; assuming you have a function to fetch it
    const snapshotData = await snapshotApi.getSnapshotData(tempSnapshotId);
    if (!snapshotData) {
      throw new Error("Failed to get snapshot data");
    }

    const snapshotContainerData = await (snapshotContainer as any)(tempSnapshotId);

    return { 
      criteria, 
      snapshotId: tempSnapshotId, 
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
    // Add any other required properties here
  };

  // Return the newSnapshot as a Promise<Snapshot<T, K>>
  return Promise.resolve({ ...newSnapshot, ...completeSnapshotContainerData, ...snapshotData });
};




export class LocalStorageSnapshotStore<
  T extends BaseData,
  K extends BaseData
> extends SnapshotStore<T, K> {
  private storage: Storage;
  private category: Category;
  private dataStore: DataStore<T, K>;
  private dataStoreMethods: DataStoreWithSnapshotMethods<T, K> | null | undefined = null;
  private operation: SnapshotOperation;
  constructor(
    storage: Storage,
    category: symbol | string | Category | undefined,
    options: SnapshotStoreOptions<T, K>,
    config: SnapshotStoreConfig<T, K>,
    initialState: SnapshotStore<T, K> | Snapshot<T, K> | null = null,
    operation: SnapshotOperation,
    datastore: DataStore<T, K>
  ) {

    super(storeId, options, category, config, operation);
    this.storage = storage;
    this.category = category;
    this.operation = operation;
    this.dataStore = datastore
    this.dataStoreMethods = this.getDataStoreMethods();
    this.createDataStoreMethods();
  }
  
  private getDataStoreMethods(): DataStoreMethods<T, K> {
    return {
      
      data: new Map<string, Snapshot<T, K>>(),
      addSnapshot: this.addSnapshot.bind(this),
      addData: (data: Snapshot<T, K>) => {
        if (data.id !== undefined) {
          this.storage.setItem(data.id.toString(), JSON.stringify(data));
        }
      },
      getItem: (key: T, id: number): Promise<Snapshot<T, K> | undefined> => {
        const item = this.storage.getItem(id);
        return item ? Promise.resolve(JSON.parse(item)) : Promise.resolve(undefined);
      },
      removeData: (id: number) => {
        this.storage.removeItem(id.toString());
      },
      updateData: (id: number, newData: Snapshot<T, K>) => {
        const item = this.storage.getItem(id.toString());
        if (item) {
          const parsedItem = JSON.parse(item);
          const updatedItem = { ...parsedItem, ...newData };
          this.storage.setItem(id.toString(), JSON.stringify(updatedItem));
        }
      },
      getAllData: (): Promise<Snapshot<T, K>[]> => {
        const items: Snapshot<T, K>[] = [];
        for (let i = 0; i < this.storage.length; i++) {
          const key = this.storage.key(i);
          if (key !== null) {
            const item = this.storage.getItem(key);
            if (item) {
              items.push(JSON.parse(item));
            }
          }
        }
        return Promise.resolve(items);
      }
    };
  }
  
  private createDataStoreMethods(): DataStore<T, K> {
    return {
      id: this.id,
      data: new Map<string, Snapshot<T, K>>(),

      addData: (data: Snapshot<T, K>) => {
        if (data.id !== undefined) {
          this.storage.setItem(data.id.toString(), JSON.stringify(data));
        }
      },

      getItem: (id: string): Promise<Snapshot<T, K> | undefined> => {
        const item = this.storage.getItem(id);

        return item ? Promise.resolve(JSON.parse(item)) : Promise.resolve(undefined);
      },

      removeData: (id: number) => {
        this.storage.removeItem(id.toString());
      },

      updateData: (id: number, newData: Snapshot<T, K>) => {
        const item = this.storage.getItem(id.toString());
        if (item) {
          const data = JSON.parse(item);
          Object.assign(data, newData);
          this.storage.setItem(id.toString(), JSON.stringify(data));
        }
      },

      updateDataTitle: (id: number, title: string) => {
        const item = this.storage.getItem(id.toString());
        if (item) {
          const data = JSON.parse(item);
          data.title = title;
          this.storage.setItem(id.toString(), JSON.stringify(data));
        }
      },

      updateDataDescription: (id: number, description: string) => {
        const item = this.storage.getItem(id.toString());
        if (item) {
          const data = JSON.parse(item);
          data.description = description;
          this.storage.setItem(id.toString(), JSON.stringify(data));
        }
      },

      addDataStatus: (
        id: number,
        status: StatusType | undefined
      ) => {
        const item = this.storage.getItem(id.toString());
        if (item) {
          const data = JSON.parse(item);
          data.status = status;
          this.storage.setItem(id.toString(), JSON.stringify(data));
        }
      },

      updateDataStatus: (
        id: number,
        status: StatusType | undefined
      ) => {
        const item = this.storage.getItem(id.toString());
        if (item) {
          const data = JSON.parse(item);
          data.status = status;
          this.storage.setItem(id.toString(), JSON.stringify(data));
        }
      },

      addDataSuccess: (payload: { data: Snapshot<T, K>[]; }) => {
        payload.data.forEach((item) => {
          if (item.id !== undefined) {
            this.storage.setItem(item.id.toString(), JSON.stringify(item));
          }
        });
      },

      getDataVersions: async (id: number): Promise<Snapshot<T, K>[] | undefined> => {
        const item = this.storage.getItem(id.toString());
        return item ? [JSON.parse(item)] : undefined;
      },

      updateDataVersions: (id: number, versions: Snapshot<T, K>[]) => {
        versions.forEach((version) => {
          if ('id' in version && version.id !== undefined) {
            this.storage.setItem(version.id.toString(), JSON.stringify(version));
          }
        });
      },

          

      getAllKeys: this.getAllKeys,
      fetchData: this.fetchData,
      setItem: this.setItem,
      removeItem: this.removeItem,
      getAllItems: this.getAllItems,
      getBackendVersion: () => useDataStore().getBackendVersion(),
      getFrontendVersion: () => useDataStore().getFrontendVersion()
    };
  }

  fetchData(id: number): Promise<SnapshotStore<T, K>[]> {
    // Fetch or create the SnapshotStore instance based on the ID
    // For demonstration, we'll use placeholder logic to simulate fetching data
    const snapshotStore: SnapshotStore<T, K> = {
      id: id.toString(),
      data: new Map<string, any>(), // Replace with actual fetched data
      category: 'default-category', // Replace with actual category if needed
      getSnapshotId: async () => id.toString(),
      compareSnapshotState: () => false, // Implement comparison logic
      snapshot: async () => ({
        snapshot: {
          id: id.toString(),
          data: new Map(), // Replace with actual data
          category: 'default-category' // Replace with actual category
        }
      }),
      getSnapshotData: () => new Map(), // Replace with actual data
      getSnapshotCategory: () => 'default-category', // Replace with actual category
      setSnapshotData: (
        snapshotStore: SnapshotStore<T, K>,
        data: Map<string, Snapshot<T, K>>,
        subscribers: Subscriber<T, K>[],
        snapshotData: Partial<SnapshotStoreConfig<T, K>>
      ): Map<string, Snapshot<T, K>> => { // Changed return type to Map<string, T>
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
        return snapshotStore.data; // Return the updated Map<string, T>
      },
      setSnapshotCategory: (newCategory: any) => {
        // Implement logic to set snapshot category
      },
      deleteSnapshot: () => {
        // Implement logic to delete snapshot
      },
      restoreSnapshot: (
        snapshot: Snapshot<T, K>,
        snapshotId: number,
        snapshotData: T,
        category: Category | undefined,
        callback: (snapshot: T) => void,
        snapshots: SnapshotsArray<T>,
        type: string,
        event: Event,
        snapshotContainer?: T,
        snapshotStoreConfig?: SnapshotStoreConfig<T, K>
      ) => {
        // Implement logic to restore snapshot
      },
      createSnapshot: () => ({
        id: id.toString(),
        data: new Map(), // Replace with actual data
        category: 'default-category' // Replace with actual category
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
        return { snapshotId, data, events, snapshotStore, dataItems, newData, payload, store };
      }
      // Add other methods as needed
    };
    return 
  }

  async getItem(key: string): Promise<T | undefined> {
    const item = this.storage.getItem(key);
    return item ? (JSON.parse(item) as T) : undefined;
  }

  setItem(key: string, value: Snapshot<T, K>): Promise<void> {
    this.storage.setItem(key, JSON.stringify(value));
    return Promise.resolve();
  }

  removeItem(key: string): Promise<void> {
    this.storage.removeItem(key);
    return Promise.resolve();
  }

  async getAllKeys(): Promise<string[]> {
    const keys: string[] = [];
    for (let i = 0; i < this.storage.length; i++) {
      const key = this.storage.key(i);
      if (key) {
        keys.push(key);
      }
    }
    return keys;
  }

  async getAllItems(): Promise<Snapshot<T, K>[]> {
    const keys = await this.getAllKeys();
    const items: Snapshot<T, K>[] = [];
    keys.forEach((key) => {
      const item = this.storage.getItem(key);
      if (item) {
        items.push(JSON.parse(item));
      }
    });
    return items;
  }
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
    _id: "abc123",
    title: "Snapshot Title",
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

