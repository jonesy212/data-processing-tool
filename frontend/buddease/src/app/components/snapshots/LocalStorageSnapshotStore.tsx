// LocalStorageSnapshotStore.tsx
import React from 'react'
import * as snapshotApi from '@/app/api/SnapshotApi';
import { SnapshotItem } from '@/app/components/snapshots/SnapshotList';
import { getSnapshotId } from '@/app/api/SnapshotApi';
import { endpoints } from '@/app/api/endpointConfigurations';
import { getSubscriberId } from "@/app/api/subscriberApi";
import { CategoryProperties } from "@/app/pages/personas/ScenarioBuilder";
import { IHydrateResult } from "mobx-persist";
import { FC } from "react";
import { CreateSnapshotsPayload, Payload, UpdateSnapshotPayload } from '../database/Payload';
import { ModifiedDate } from "../documents/DocType";
import {
  SnapshotManager,
  SnapshotStoreOptions
} from "../hooks/useSnapshotManager";
import { BaseData, Data, DataDetails } from "../models/data/Data";
import {
  NotificationPosition,
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
import { generateSnapshotId } from "../utils/snapshotUtils";
import { ExtendedVersionData } from '../versions/VersionData';
import { CoreSnapshot } from './CoreSnapshot';
import {
  ConfigureSnapshotStorePayload,
} from "./SnapshotConfig";
import { SnapshotData } from './SnapshotData';
import SnapshotStore, {
  defaultCategory,
  SubscriberCollection
} from "./SnapshotStore";
import { snapshotStoreConfig, SnapshotStoreConfig } from './SnapshotStoreConfig';
import { SnapshotWithCriteria } from "./SnapshotWithCriteria";
import createSnapshotOptions from './createSnapshotOptions';
import { SnapshotConfig } from "./snapshot";
import {
  Callback
} from "./subscribeToSnapshotsImplementation";
import { RealtimeDataItem } from "/Users/dixiejones/data_analysis/frontend/buddease/src/app/components/models/realtime/RealtimeData";
import CalendarManagerStoreClass, { CalendarEvent } from "/Users/dixiejones/data_analysis/frontend/buddease/src/app/components/state/stores/CalendarEvent";
import { Category } from '../libraries/categories/generateCategoryProperties';
import { SnapshotOperation, SnapshotOperationType } from './SnapshotActions';
import SnapshotImplementation from './SnapshotImplementation';
import { SnapshotContainer, snapshotContainer } from './SnapshotContainer';
import FetchSnapshotPayload from './FetchSnapshotPayload';
import { SnapshotActionType } from './SnapshotActionType';
import { SnapshotMethods } from './SnapshotMethods';
import UniqueIDGenerator from '@/app/generators/GenerateUniqueIds';

const SNAPSHOT_URL = endpoints.snapshots;


type SnapshotUnion<T extends Data> = 
  Snapshot<T, any>
  | SnapshotWithCriteria<T, BaseData>;


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

const SNAPSHOT_STORE_CONFIG = snapshotStoreConfig


interface Snapshot<T extends Data, K extends Data = T>
  extends CoreSnapshot<T, K>, SnapshotData<T, K>, SnapshotMethods<T, K> {
    
    initialConfig: any;
    removeSubscriber: any;
    onInitialize: any;
    onError: any;
    categories?: Category[];
    
    snapshot: (
      id: string | number | undefined,
      snapshotData: T,
      category: Category | undefined,
      categoryProperties: CategoryProperties | undefined,
      dataStoreMethods: DataStore<T, K>
    ) => Promise<{
      snapshot: Snapshot<T, K>;
    }> | Snapshot<T, K>;
    
    setCategory: (category: Category) => void;
    
    applyStoreConfig: (
      snapshotStoreConfig: SnapshotStoreConfig<SnapshotUnion<T>, K>
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

    snapshotStoreConfig?: SnapshotStoreConfig<SnapshotUnion<T>, any> | null;

    getSnapshotItems: () => (SnapshotStoreConfig<SnapshotUnion<T>, any> | SnapshotItem<Data, any>)[] | undefined;

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
      subscribers: Subscriber<T, K>[], 
      data: Partial<SnapshotStoreConfig<BaseData, any>>
    ) => Subscriber<T, K>[] 

    getAllSnapshots: (
      snapshotId: string,
      snapshotData: T,
      timestamp: string,
      type: string,
      event: Event,
      id: number,
      snapshotStore: SnapshotStore<T, K>,
      category: string | Category | undefined,
      categoryProperties: CategoryProperties | undefined,
      dataStoreMethods: DataStore<T, K>,
      data: T,
      dataCallback?: (
        subscribers: Subscriber<T, K>[],
        snapshots: Snapshots<T>
      ) => Promise<Snapshots<T>>
    ) => Promise<SnapshotUnion<T>[]>;
  
    getSubscribers: (
      subscribers: Subscriber<T, K>[], 
        snapshots: Snapshots<T>
      )=> Promise<{
        subscribers: Subscriber<T, K>[]; 
        snapshots: Snapshots<T>;
      }>

    versionInfo: ExtendedVersionData | null;

    transformSubscriber: (sub: Subscriber<T, K>) => Subscriber<T, K>;

    transformDelegate: () => SnapshotStoreConfig<SnapshotUnion<T>, K>[];

    initializedState: Snapshot<T, K> | SnapshotStore<T, K> | Map<string, Snapshot<T, K>> | null | undefined;

  getAllKeys: (
    storeId: number,
    snapshotId: string,
    category: string | CategoryProperties | undefined,
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

    getAllItems: () => Promise<Snapshot<T, K>[]> | undefined;


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
        snapshotId: string;
        snapshotData: T;
        category: Category | undefined;
        dataStoreMethods: DataStore<T, K>
        timestamp: any;
        id: any;
        snapshot: Snapshot<T, K>;
        snapshotStore: SnapshotStore<T, K>;
        data: T;
      }> | undefined
    ) => Promise<Snapshot<T, K>>;

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
      simulatedDataSource: SnapshotStoreConfig<SnapshotUnion<T>, K>[];
    }) => SnapshotStoreConfig<SnapshotUnion<T>, K>[];

    determineCategory: (snapshot: Snapshot<T, K> | null | undefined) => string;
    determinePrefix: (snapshot: T | null | undefined, category: string) => string;

    removeSnapshot: (snapshotToRemove: Snapshot<T, K>) => void;
    addSnapshotItem: (item: Snapshot<T, K> | SnapshotStoreConfig<SnapshotUnion<T>, K>) => void;

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
      category: K
    ) => SnapshotWithCriteria<T, K>;

    addStoreConfig: (config: SnapshotStoreConfig<SnapshotUnion<T>, any>) => void;

    handleSnapshotConfig: (config: SnapshotStoreConfig<SnapshotUnion<T>, any>) => void;
    getSnapshotConfig: () => SnapshotStoreConfig<SnapshotUnion<T>, any>[];

    getSnapshotListByCriteria: (
      criteria: SnapshotStoreConfig<SnapshotUnion<T>, K>
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
      category: Category,
      snapshotConfig: SnapshotStoreConfig<SnapshotUnion<T>, K>,
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
        value: SnapshotStoreConfig<SnapshotUnion<T>, K>, 
        index: number, 
        array: SnapshotStoreConfig<SnapshotUnion<T>, K>[]
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
      config: SnapshotStoreConfig<SnapshotUnion<T>, T>
    ) => SnapshotStoreConfig<SnapshotUnion<T>, T>;

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
      category: string | CategoryProperties | undefined,
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
        category: string | CategoryProperties | undefined,
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
      newSnapshot: Snapshot<T, K>
    ) => void;

    addSnapshotSubscriber: (
      snapshotId: string,
      subscriber: Subscriber<T, K>
    ) => void;

    removeSnapshotSubscriber: (
      snapshotId: string, 
      subscriber: Subscriber<T, K>
    ) => void;

    getSnapshotConfigItems: () => SnapshotStoreConfig<SnapshotUnion<T>, K>[];
    
    
  subscribeToSnapshots: (
    snapshotId: string,
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
      criteria: SnapshotStoreConfig<SnapshotUnion<T>, K>
    ) => SnapshotStoreConfig<SnapshotUnion<T>, K>;

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
    category: Category,
    callback: (snapshot: Snapshot<T, K>) => void,
    snapshotStoreConfigData?: SnapshotStoreConfig<SnapshotUnion<T>, K>,
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
    criteria: any;
    snapshotId: string;
    snapshotContainerData: SnapshotContainer<T, K> }> => {
    const criteria = await snapshotApi.getSnapshotCriteria(newSnapshot, snapshot);
    const tempSnapshotId = await snapshotApi.getSnapshotId(criteria);
    if (tempSnapshotId === undefined) {
      throw new Error("Failed to get snapshot ID");
    }
    const snapshotContainerData = await (snapshotContainer as any)(tempSnapshotId);

    return { 
      criteria, 
      snapshotId: tempSnapshotId, 
      snapshotContainerData 
    };
  };

  // Ensure the async operation completes before using the results
  const { criteria, snapshotId, snapshotContainerData } = await getCriteriaAndData();

  const storeId = snapshotApi.getSnapshotStoreId(Number(snapshotId));


  // Ensure snapshotContainerData has all required properties for SnapshotContainer
  const completeSnapshotContainerData: SnapshotContainer<T, K> = {
    id: newSnapshot.snapshotId,
    parentId: newSnapshot.parentId || null,
    childIds: newSnapshot.childIds || [],
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
  return Promise.resolve({ ...newSnapshot, ...completeSnapshotContainerData });
};





export class LocalStorageSnapshotStore<
  T extends BaseData,
  K extends BaseData
> extends SnapshotStore<T, K>, DataStore<T, K> {
  private storage: Storage;
  private category: Category;
  private dataStoreMethods?: Partial<DataStore<T, K>> = {}
  private operation: SnapshotOperation;
  constructor(
    storage: Storage,
    category: Category,
    options: SnapshotStoreOptions<T, K>,
    config: SnapshotStoreConfig<SnapshotUnion<T>, K>,
    initialState: SnapshotStore<T, K> | Snapshot<T, K> | null = null,
    operation: SnapshotOperation,
  ) {

    super(storeId, options, category, config, operation);
    this.storage = storage;
    this.category = category;
    this.operation = operation;
    this.dataStoreMethods = this.getDataStoreMethods();
    this.createDataStoreMethods();
  }
  
  private getDataStoreMethods(): Partial<DataStore<T, K>> {
    return {
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

      getBackendVersion: useDataStore().getBackendVersion(),

      getFrontendVersion: async (): Promise<string> => {
        return "frontend-version"; // Replace with actual logic
      },
    };
  }

  async getItem(key: string): Promise<T | undefined> {
    const item = this.storage.getItem(key);
    return item ? (JSON.parse(item) as T) : undefined;
  }

  setItem(key: string, value: T): Promise<void> {
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

  async getAllItems(): Promise<T[]> {
    const keys = await this.getAllKeys();
    const items: T[] = [];
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
subscriber.id = "new-id"; // Set the private property using the setter method

const snapshots: Snapshots<T> = [
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
      data: Map<string, Snapshot<Data, any>>, 
      subscribers: Subscriber<any, any>[],
      snapshotData: Partial<SnapshotStoreConfig<SnapshotUnion<T>, any>>
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
            subscribers: subscribers as Subscriber<T, K>[], // Set the subscribers in the config
          } as SnapshotStoreConfig<SnapshotUnion<T>, K>,
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
],




const snapshot: Snapshot<T, K> = {
  id: "",
  category: category,
  timestamp: new Date(),
  createdBy: "",
  description: "",
  tags: {},
  metadata: {},
  data: new Map<string, Snapshot<T, K>>(),
  initialState: initialState,
  events: {
    eventRecords: {},
    subscribers: [], // Assuming this is correctly typed elsewhere
    eventIds: [],
    callbacks: {
      snapshotAdded: [
        (snapshot: Snapshot<T, K>) => {
          console.log("Snapshot added:", snapshot);
        },
      ],
      snapshotRemoved: [
        (snapshot: Snapshot<T, K>) => {
          console.log("Snapshot removed:", snapshot);
        },
      ],
      // Add more event keys and their corresponding callback arrays as needed
    } as Record<string, ((snapshot: Snapshot<T, K>) => void)[]>, // Ensure the correct type
  
    // Method to handle snapshot added event
    onSnapshotAdded: function (
      event: string,
      snapshot: Snapshot<T, K>,
      snapshotId: string,
      subscribers: SubscriberCollection<T, K>,
      snapshotStore: SnapshotStore<T, K>, 
      dataItems: RealtimeDataItem[],
      subscriberId: string,
      criteria: SnapshotWithCriteria<T, K>,
      category: Category
    ) {
      // const snapshotId = getSnapshotId(criteria)
      this.emit(
        "snapshotAdded",
        snapshot, 
        String(snapshotId), 
        subscribers, 
        snapshotStore,
        dataItems,
        criteria,
        category
      );
    },
  
    // Method to handle snapshot removed event
    onSnapshotRemoved: function (
      event: string,
      snapshot: Snapshot<T, K>,
      snapshotId: string, 
      subscribers: SubscriberCollection<T, K>,
      snapshotStore: SnapshotStore<T, K>, 
      dataItems: RealtimeDataItem[],
      criteria: SnapshotWithCriteria<T, K>,
      category: Category
    ) {
      this.emit("snapshotRemoved",
      snapshot, 
        String(snapshotId), 
        subscribers, 
        snapshotStore,
        dataItems,
        criteria,
        category);
    },
  
    // Method to handle snapshot updated event
    onSnapshotUpdated: function(
      snapshotId: string,
      data: Map<string, Snapshot<T, K>>,
      events: Record<string, CalendarManagerStoreClass<T, K>[]>,
      snapshotStore: SnapshotStore<T, K>,
      dataItems: RealtimeDataItem[],
      newData: Snapshot<T, K>,
      payload: UpdateSnapshotPayload<T>,
      store: SnapshotStore<any, K>
    ) {
      console.log("Snapshot updated:", {
        snapshotId,
        data,
        events,
        snapshotStore,
        dataItems,
        newData,
        payload,
        store,
      });
    },
  
    // Method to subscribe to an event
    on: function(event: string, callback: (snapshot: Snapshot<T, K>) => void) {
      if (!this.callbacks[event]) {
        this.callbacks[event] = [];
      }
      this.callbacks[event].push(callback);
    },
  
    // Method to unsubscribe from an event
    off: function(event: string, callback: (snapshot: Snapshot<T, K>) => void) {
      if (this.callbacks[event]) {
        this.callbacks[event] = this.callbacks[event].filter(cb => cb !== callback);
      }
    },
  
    // Method to emit (trigger) an event
    emit: function(event: string, snapshot: Snapshot<T, K>) {
      if (this.callbacks[event]) {
        this.callbacks[event].forEach(callback => callback(snapshot));
      }
    },
  
    // Method to subscribe to an event once
    once: function(event: string, callback: (snapshot: Snapshot<T, K>) => void) {
      const onceCallback = (snapshot: Snapshot<T, K>) => {
        callback(snapshot);
        this.off(event, onceCallback);
      };
      this.on(event, onceCallback);
    },
    addRecord: function(
      event: string,
      record: CalendarManagerStoreClass<T, K>,
      callback: (snapshot: CalendarManagerStoreClass<T, K>) => void
    ) {
      // Ensure eventRecords is not null
      if (this.eventRecords === null) {
        this.eventRecords = {}; // Initialize eventRecords if it is null
      }
    
      if (!this.eventRecords[event]) {
        this.eventRecords[event] = [];
      }
    
      this.eventRecords[event].push(record);
      callback(record);
    },
    
    // Method to remove all event listeners
    removeAllListeners: function(event?: string) {
      if (event) {
        delete this.callbacks[event];
      } else {
        this.callbacks = {} as Record<string, ((snapshot: Snapshot<T, K>) => void)[]>;
      }
    },
  
    // Method to subscribe to an event (alias for on)
    subscribe: function(event: string, callback: (snapshot: Snapshot<T, K>) => void) {
      this.on(event, callback);
    },
  
    // Method to unsubscribe from an event (alias for off)
    unsubscribe: function(event: string, callback: (snapshot: Snapshot<T, K>) => void) {
      this.off(event, callback);
    },
  
    // Method to trigger an event (alias for emit)
    trigger: function (
      event: string, 
      snapshot: Snapshot<T, K>, 
      snapshotId: string,
      subscribers: SubscriberCollection<T, K>
    ) {
      this.emit(event, snapshot, snapshotId, subscribers);
    },
  },
  meta: {} as Map<string, Snapshot<T, K>>,      
}






const criteria = await snapshotApi.getSnapshotCriteria(
  snapshotContainer as unknown as SnapshotContainer<T, K>, 
  snapshot
); 
const snapshotObj = {} as SnapshotsObject<T> {} as SnapshotsObject<T, K> 
const options = createSnapshotOptions(snapshotObj, snapshot);
const snapshotId = await snapshotApi.getSnapshotId(criteria);
const storeId = await snapshotApi.getSnapshotStoreId(Number(snapshotId));

return {
  id: "some-id",
  title: "Snapshot Title",
  timestamp: new Date(),
  subscriberId: "some-subscriber-id",
  category: "some-category",
  snapshotId: "some-snapshot-id",
  
  type: "snapshot",
  length: dataMap.size,
  content: dataMap.toString(),
  data: dataMap,
  value: 0,
  key: "some-key",
  subscription: null,
  config: null,
  status: "active",
  metadata: {},
  delegate: [],
  store: null,
  state: null,
  todoSapshotId: "some-todo-id",
  initialState: null,
  snapshotStoreConfig: {} as SnapshotStoreConfig<SnapshotUnion<T>, BaseData>,

  getSnapshotItems: [],
  defaultSubscribeToSnapshots: () => Promise.resolve(),
  transformSubscriber: Subscriber.transformSubscriber,
  // ... Add any other missing properties
}
}

export { createSnapshotOptions, snapshots };
export type {
  CoreSnapshot,SnapshotStoreUnion, SnapshotStoreObject,
  SnapshotsArray, SnapshotsObject, SnapshotUnion
};

