// LocalStorageSnapshotStore.tsx
import * as snapshotApi from '@/app/api/SnapshotApi';
import { SnapshotManager } from '@/app/components/hooks/useSnapshotManager';
import { Task, TaskData } from '@/app/components/models/tasks/Task';
import { createSnapshotOptions } from "@/app/components/snapshots/createSnapshotOptions";
import { SnapshotEvents } from '@/app/components/snapshots/SnapshotEvents';
import { SnapshotItem } from "@/app/components/snapshots/SnapshotList";
import {
  SnapshotCRUD,
  SnapshotSubscriberManagement,
} from "@/app/components/snapshots/SnapshotSubscriberManagement";
import { CategoryProperties } from "@/app/pages/personas/ScenarioBuilder";
import { IHydrateResult } from "mobx-persist";
import useSecureStoreId from '../components/utils/useSecureStoreId';
import { Payload, UpdateSnapshotPayload } from "../database/Payload";
import { BaseData, Data, DataDetails } from "../models/data/Data";
import { PriorityTypeEnum, ProjectPhaseTypeEnum, StatusType, SubscriberTypeEnum, SubscriptionTypeEnum } from "../models/data/StatusType";
import { DataStoreMethods } from "../projects/DataAnalysisPhase/DataProcessing/ DataStoreMethods";
import {
  DataStore,
  InitializedState,
  initializeState,
} from "../projects/DataAnalysisPhase/DataProcessing/DataStore";
import { Subscription } from "../subscriptions/Subscription";
import { NotificationTypeEnum } from "../support/NotificationContext";
import { Subscriber } from "../users/Subscriber";
import {
  CustomSnapshotData,
  SnapshotData,
  SnapshotRelationships,
} from "./SnapshotData";

import { Category } from "../libraries/categories/generateCategoryProperties";
import { ExtendedVersionData } from "../versions/VersionData";
import { CoreSnapshot } from "./CoreSnapshot";

import SnapshotStore, {
  InitializableWithData,
  SubscriberCollection,
} from "./SnapshotStore";
import {
  InitializedConfig,
  SnapshotStoreConfig
} from "./SnapshotStoreConfig";
import { SnapshotWithCriteria } from "./SnapshotWithCriteria";
import { Callback } from "./subscribeToSnapshotsImplementation";
import { RealtimeDataItem } from "/Users/dixiejones/data_analysis/frontend/buddease/src/app/components/models/realtime/RealtimeData";
import CalendarManagerStoreClass from "/Users/dixiejones/data_analysis/frontend/buddease/src/app/components/state/stores/CalendarEvent";

import {
  snapshotContainer,
  SnapshotContainer,
  SnapshotDataType
} from "./SnapshotContainer";

import { getSubscriberId } from '@/app/api/subscriberApi';
import { UnifiedMetaDataOptions } from "@/app/configs/database/MetaDataOptions";
import { StructuredMetadata } from '@/app/configs/StructuredMetadata';
import { getCachedSnapshotData } from "@/app/generators/snapshotCache";
import { CriteriaType } from "@/app/pages/searchs/CriteriaType";
import { callback } from 'node_modules/chart.js/dist/helpers/helpers.core';
import { FC } from 'react';
import { SchemaField } from "../database/SchemaField";
import { ModifiedDate } from '../documents/DocType';
import { UnsubscribeDetails } from "../event/DynamicEventHandlerExample";
import { InitializedDataStore } from "../hooks/SnapshotStoreOptions";
import { K, T } from '../models/data/dataStoreMethods';
import { getCommunityEngagement, getMarketUpdates, getTradeExecutions } from '../trading/TradingUtils';
import { logActivity, notifyEventSystem, portfolioUpdates, triggerIncentives, unsubscribe, updateProjectState } from '../utils/applicationUtils';
import { category, isSnapshotDataType } from "../utils/snapshotUtils";
import { createSnapshotInstance } from './createSnapshotInstance';
import { isSnapshot } from "./createSnapshotStoreOptions";
import { SnapshotActionType } from "./SnapshotActionType";
import { SnapshotConfig } from "./SnapshotConfig";
import snapshotDelegate from "./snapshotDelegate";
import { SnapshotInitialization } from "./SnapshotInitialization";
import { SnapshotMethods } from "./SnapshotMethods";
import { storeProps } from './SnapshotStoreProps';
import { SnapshotStoreProps } from "./useSnapshotStore";

// const SNAPSHOT_URL = endpoints.snapshots;

// // Define SnapshotUnion without needing K
type SnapshotUnion<T extends  BaseData<T>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>> =
  | Snapshot<T, K>
  | (SnapshotWithCriteria<T, K> & T);

// Update SnapshotStoreUnion to use K
type SnapshotStoreUnion<T extends BaseData, K extends T = T> =
  | SnapshotStoreObject<T, K>
  | Snapshots<T, K>;

// Update Snapshots to use K
type Snapshots<T extends BaseData, K extends T = T> =
  SnapshotsArray<T> | SnapshotsObject<T, K>;

// Update SnapshotsObject to use K
type SnapshotsObject<T extends BaseData, K extends T = T> = {
  [key: string]: SnapshotUnion<T, K>;
};


type SnapshotsArray<T extends BaseData, K extends T = T> = Array<SnapshotUnion<T, K>>;


type SnapshotStoreObject<T extends BaseData, K extends T = T> = {
  [key: string]: SnapshotStoreUnion<T, K>;
};


type Result<T> = { success: true; data: T } | { success: false; error: Error };


// Define the snapshot function correctly
const snapshotFunction = <
    T extends  BaseData<T>,
    K extends T = T>(
  id: string | number | undefined,
  snapshotData: SnapshotData<T, K>,
  category: symbol | string | Category | undefined,
  callback: (snapshot: SnapshotStore<T, K>) => void,
  criteria: CriteriaType,
  snapshotId?: string | number | null,
  snapshotStoreConfigData?: SnapshotStoreConfig<
    SnapshotWithCriteria<any, BaseData>, SnapshotWithCriteria<any, BaseData>
  >,
  snapshotContainerData?: SnapshotStore<T, K> | Snapshot<T, K> | null,
): Promise<SnapshotData<T, K>> => {
  // Your logic for handling the snapshot goes here

  // If snapshotData is already a Promise or has a then method, return it directly
  if (typeof (snapshotData as any)?.then === "function") {
    return Promise.resolve(snapshotData); // snapshotData might already be a promise-like object
  }

  // Otherwise, return a resolved Promise with snapshotData
  return Promise.resolve(snapshotData);
};

const criteria = await snapshotApi.getSnapshotCriteria<Data<BaseData<any>>, K>(
  snapshotContainer as unknown as SnapshotContainer<Data<BaseData<any>>, K>,
  snapshotFunction
);


const snapshotObj = {} as Snapshot<Data<BaseData<any>>, K>;
const options = createSnapshotOptions(snapshotObj, snapshotFunction);
const snapshotId = await snapshotApi.getSnapshotId(criteria);
const storeId = await snapshotApi.getSnapshotStoreId(String(snapshotId));
const snapshotStoreConfig = snapshotApi.getSnapshotStoreConfig(
  snapshotContainer as unknown as SnapshotContainer<T, K>,
  snapshotFunction
);
// const snapshotStoreConfig = snapshotApi.getSnapshotStoreConfig(null, {} as SnapshotContainer<Data<T>, Data<T>>, {}, storeId)
const SNAPSHOT_STORE_CONFIG: SnapshotStoreConfig<Data<BaseData<any>>, K> =
  snapshotStoreConfig as SnapshotStoreConfig<Data<BaseData<any>>, K>;

interface SnapshotEquality<
  T extends  BaseData<T>,
 K extends T = T> {
  equals(data: Snapshot<T, K>): boolean | null | undefined;
}

interface Snapshot<
  T extends BaseData<T>, // Use BaseData for T
  K extends T = T,
  Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>,
  ExcludedFields extends keyof T = never
>
  extends CoreSnapshot<T, K>,
    SnapshotData<T, K, Meta, ExcludedFields>,
    SnapshotMethods<T, K, Meta>,
    SnapshotRelationships<T, K, Meta>,
    InitializableWithData<T, K>,
    SnapshotSubscriberManagement<T, K, Meta>,
    SnapshotCRUD<T, K>,
    SnapshotInitialization<T, K, Meta>,
    SnapshotEquality<T, K> {

    deleted: boolean;
    initialState: InitializedState<T, K> | {};
    isCore: boolean;
    
    initialConfig: InitializedConfig | {};
    properties?: K;
    snapshotsArray?: SnapshotsArray<T>;
    snapshotsObject?: SnapshotsObject<T, K>;
    recentActivity?: { action: string; 
    timestamp: Date }[];
    onInitialize: () => void;
    onError: any;
    categories?: Category[];
    taskIdToAssign: string | undefined;
    schema: string | Record<string, SchemaField>;
    currentCategory: Category;
    mappedSnapshotData: Map<string, Snapshot<T, K>> | undefined;
    storeId: number;

    versionInfo: ExtendedVersionData | null;
    initializedState: InitializedState<T, K> | {};

    criteria: CriteriaType | undefined;
    storeConfig?: SnapshotStoreConfig<T, K>;
    additionalData?: CustomSnapshotData<T>;
    snapshot: (
      id: string | number | undefined,
      snapshotData: SnapshotData<T, K>,
      category: symbol | string | Category | undefined,
      categoryProperties: CategoryProperties | undefined,
      callback: (snapshotStore: SnapshotStore<T, K>) => void,
      dataStore: DataStore<T, K>,
      dataStoreMethods: DataStoreMethods<T, K>,
      metadata: UnifiedMetaDataOptions<T, K, Meta, ExcludeKeys>,
      subscriberId: string, // Add subscriberId here
      endpointCategory: string | number, // Add endpointCategory here
      storeProps: SnapshotStoreProps<T, K>,
      snapshotConfigData: SnapshotConfig<T, K>,
      subscription: Subscription<T, K>,
      snapshotId?: string | number | null,
      snapshotStoreConfigData?: SnapshotStoreConfig<T, K>,
      snapshotContainer?: SnapshotStore<T, K> | Snapshot<T, K> | null
    ) => Snapshot<T, K> | Promise<{ snapshot: Snapshot<T, K> }>;

    setCategory: (category: symbol | string | Category | undefined) => void;

    applyStoreConfig: (
      snapshotStoreConfig?:
        | SnapshotStoreConfig<T, K>
        | undefined
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
      dataDetails?: DataDetails<T, K>,
      generatorType?: string
    ) => string;

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
    ) => Promise<SnapshotDataType<T, K>>;

    snapshotStoreConfig?: SnapshotStoreConfig<T, any> | null;

    snapshotStoreConfigSearch?: SnapshotStoreConfig<
      SnapshotWithCriteria<any, BaseData>,
      SnapshotWithCriteria<any, BaseData>
    > | null;

    snapshotContainer: SnapshotContainer<T, K> | undefined | null;

    getSnapshotItems: () => (
      | SnapshotItem<T, K>
      | SnapshotStoreConfig<T, K>
      | undefined
    )[];

    defaultSubscribeToSnapshots: (
      snapshotId: string,
      callback: (snapshots: Snapshots<T>) => Subscriber<T, K> | null,
      snapshot: Snapshot<T, K> | null
    ) => void;

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
      filter?: (snapshot: Snapshot<T, K>) => boolean,
      dataCallback?: (
        subscribers: Subscriber<T, K>[],
        snapshots: Snapshots<T>
      ) => Promise<SnapshotUnion<T>[]>
    ) => Promise<Snapshot<T, K>[]>;

    transformDelegate: () => Promise<SnapshotStoreConfig<T, K>[]>;

    getAllKeys: (
      storeId: number,
      snapshotId: string,
      category: symbol | string | Category | undefined,
      categoryProperties: CategoryProperties | undefined,
      snapshot: Snapshot<T, K> | null,
      timestamp: string | number | Date | undefined,
      type: string,
      event: Event,
      id: number,
      snapshotStore: SnapshotStore<T, K>,
      data: T
    ) => Promise<string[] | undefined> | undefined;

    // Logic for `getAllValues`
    getAllValues: () => SnapshotsArray<T>; // Use SnapshotsArray<T> if it represents an array of snapshots

    getAllItems: () => Promise<Snapshot<T, K>[] | undefined>;

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

    getBackendVersion: () => IHydrateResult<number> | Promise<string> | undefined;
    getFrontendVersion: () =>
      | IHydrateResult<number>
      | Promise<string>
      | undefined;

    fetchStoreData: (id: number) => Promise<SnapshotStore<T, K>[]>;
    fetchData: (endpoint: string, id: number) => Promise<SnapshotStore<T, K>>;

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

    removeItem: (key: string | number) => Promise<void>;

    getSnapshot: (
      snapshot: (
        id: string | number
      ) =>
        | Promise<{
            snapshotId: string | number;
            snapshotData: SnapshotData<T, K>;
            category: Category | undefined;
            categoryProperties: CategoryProperties;
            dataStoreMethods: DataStore<T, K>;
            timestamp: string | number | Date | undefined;
            id: string | number | undefined;
            snapshot: Snapshot<T, K>;
            snapshotStore: SnapshotStore<T, K>;
            data: T;
          }>
        | undefined
    ) => Promise<Snapshot<T, K> | undefined>;

    getSnapshotSuccess: (
      snapshot: Snapshot<T, K>,
      subscribers: Subscriber<T, K>[]
    ) => Promise<SnapshotStore<T, K>>;

    setItem: (key: T, value: T) => Promise<void>;
    getItem: (key: T) => Promise<Snapshot<T, K> | undefined>;

    getDataStore: () => Promise<InitializedDataStore<T>>;
    getDataStoreMap: () => Promise<Map<string, DataStore<T, K>>>;

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
    }) => Promise<DataStore<T, K>[]>;

    determineCategory: (snapshot: Snapshot<T, K> | null | undefined) => string;
    determinePrefix: (snapshot: T | null | undefined, category: string) => string;

    removeSnapshot: (snapshotToRemove: Snapshot<T, K>) => void;
    addSnapshotItem: (item: Snapshot<T, K> | SnapshotStoreConfig<T, K>) => void;
    // addSnapConfig: (config: SnapshotConfig<T, K>) => void;
    addNestedStore: (
      store: SnapshotStore<T, K>,
      item: SnapshotStoreConfig<T, K> | Snapshot<T, K>
    ) => void;
    clearSnapshots: () => void;

    addSnapshot: (
      snapshot: Snapshot<T, K>,
      snapshotId: string,
      subscribers: SubscriberCollection<T, K>
    ) => Promise<Snapshot<T, K> | undefined>;

    emit: (
      // todo update to use if maeks sense
      // event: string | CombinedEvents<T, K> | SnapshotEvents<T, K>,
      event: string,
      snapshot: Snapshot<T, K>,
      snapshotId: string,
      subscribers: SubscriberCollection<T, K>,
      type: string,
      snapshotStore: SnapshotStore<T, K>,
      dataItems: RealtimeDataItem[],
      criteria: SnapshotWithCriteria<T, K>,
      category: Category,
      snapshotData: SnapshotData<BaseData, BaseData>
    ) => void;

    createSnapshot: (
      id: string,
      snapshotData: SnapshotData<T, K>,
      additionalData: any,
      category?: string | symbol | Category,
      callback?: (snapshot: Snapshot<T, K>) => void,
      SnapshotData?: SnapshotStore<T, K>,
      snapshotStoreConfig?: SnapshotStoreConfig<T, K>
    ) => Snapshot<T, K> | null;

    createInitSnapshot: (
      id: string,
      initialData: T,
      snapshotData: SnapshotData<any, K>,
      snapshotStoreConfig: SnapshotStoreConfig<T, K>,
      category: symbol | string | Category | undefined,
      additionalData: any
    ) => Promise<Result<Snapshot<T, K, never>>>;

    addStoreConfig: (config: SnapshotStoreConfig<T, K>) => void;

    handleSnapshotConfig: (config: SnapshotStoreConfig<T, K>) => void;
    getSnapshotConfig: (
      snapshotId: string | null,
      snapshotContainer: SnapshotContainer<T, K>,
      criteria: CriteriaType,
      category: Category,
      categoryProperties: CategoryProperties | undefined,
      delegate: any,
      snapshotData: SnapshotData<T, K>,
      snapshot: (
        id: string,
        snapshotId: string | null,
        snapshotData: SnapshotData<T, K>,
        category: Category
      ) => void
    ) => SnapshotStoreConfig<T, K>[] | undefined;

    getSnapshotListByCriteria: (
      criteria: SnapshotStoreConfig<T, K>
    ) => Promise<Snapshot<T, K>[]>;

    setSnapshotSuccess: (
      snapshotData: SnapshotData<T, K>,
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
      snapshotId: string | number,
      snapshotData: SnapshotData<T, K>,
      category: Category | undefined,
      categoryProperties: CategoryProperties | undefined,
      snapshotConfig: SnapshotStoreConfig<T, K>,
      callback: (snapshotStore: SnapshotStore<any, any>) => void,
      snapshotStoreConfig: SnapshotStoreConfig<T, K>,
      snapshotStoreConfigSearch: SnapshotStoreConfig<
      SnapshotWithCriteria<any, K>,
      SnapshotWithCriteria<any, K>>
    ) => void;

    takeSnapshot: (
      snapshot: Snapshot<T, K>,
      subscribers: Subscriber<T, K>[]
    ) => Promise<{ snapshot: Snapshot<T, K> }>;

    takeSnapshotSuccess: (snapshot: Snapshot<T, K>) => void;

    takeSnapshotsSuccess: (snapshots: T[]) => void;

    flatMap: <R extends Iterable<any>>(
      callback: (
        value: SnapshotStoreConfig<R, any>,
        index: number,
        array: SnapshotStoreConfig<R, any>[]
      ) => R
    ) => R extends (infer I)[] ? I[] : R[];

    getState: () => any;
    setState: (state: any) => void;

    validateSnapshot: (snapshotId: string, snapshot: Snapshot<T, K>) => boolean;

    handleActions: (action: (selectedText: string) => void) => void;

    setSnapshot: (snapshot: Snapshot<T, K>) => void;

    transformSnapshotConfig: <U extends BaseData>(
      config: SnapshotStoreConfig<U, U>
    ) => SnapshotStoreConfig<U, U>;

    setSnapshots: (snapshots: SnapshotStore<T, K>[]) => void;
    clearSnapshot: () => void;

    mergeSnapshots: (snapshots: Snapshots<T>, category: string) => void;

    reduceSnapshots: <R>(
      callback: (acc: R, snapshot: Snapshot<T, K>) => R,
      initialValue: R
    ) => R | undefined;

    sortSnapshots: () => void;
    filterSnapshots: () => void;

    findSnapshot: (
      predicate: (snapshot: Snapshot<T, K>) => boolean
    ) => Snapshot<T, K> | undefined;

    mapSnapshots: <U, V>(
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
        data: V, // Use V for the callback data type
        index: number
      ) => U // Return type of the callback
    ) => U[];

    takeLatestSnapshot: () => Snapshot<T, K> | undefined;

    updateSnapshot: (
      snapshotId: string,
      data: Map<string, Snapshot<T, K>>,
      snapshotManager: SnapshotManager<T, K>,
      events: Record<string, CalendarManagerStoreClass<T, K>[]>,
      snapshotStore: SnapshotStore<T, K>,
      dataItems: RealtimeDataItem[],
      newData: Snapshot<T, K>,
      timestamp: Date, 
      payload: UpdateSnapshotPayload<T>,
      category: symbol | string | Category | undefined,
      payloadData: T | K,
      mappedSnapshotData: Map<string, Snapshot<T, K>>,
      delegate: SnapshotWithCriteria<T, K>[]
    ) => Snapshot<T, K>;

    getSnapshotConfigItems: () => SnapshotStoreConfig<T, K>[];

    subscribeToSnapshots: (
      snapshotStore: SnapshotStore<T, K>,
      snapshotId: string,
      snapshotData: SnapshotData<T, K>,
      category: Category | undefined,
      snapshotConfig: SnapshotStoreConfig<T, K>,
      callback: (
        snapshotStore: SnapshotStore<any, any>
      ) => Subscriber<T, K> | null,
      snapshots: SnapshotsArray<T>,
      unsubscribe?: UnsubscribeDetails
    ) => [] | SnapshotsArray<T>;

    executeSnapshotAction: (
      actionType: SnapshotActionType,
      actionData: any
    ) => Promise<void>;

    getSnapshotItemsSuccess: () => SnapshotItem<T, K>[] | undefined;
    getSnapshotItemSuccess: () => SnapshotItem<T, K> | undefined;

    getSnapshotKeys: () => string[] | undefined;
    getSnapshotIdSuccess: () => string | undefined;

    getSnapshotValuesSuccess: () => SnapshotItem<T, K>[] | undefined;

    getSnapshotWithCriteria: (
      criteria: SnapshotStoreConfig<T, K>
    ) => SnapshotStoreConfig<T, K>;

    reduceSnapshotItems: (
      callback: (acc: any, snapshot: Snapshot<T, K>) => any,
      initialValue: any
    ) => any;
  }

  const snapshotType = <T extends  BaseData<T>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(
    snapshotObj: Snapshot<T, K>,
    snapshot: (
      id: string | number | undefined,
      snapshotData: SnapshotData<T, K>,
      category: symbol | string | Category | undefined,
      callback: (snapshot: Snapshot<T, K>) => void,
      criteria: CriteriaType,
      snapshotId?: string | number | null,
      snapshotStoreConfigData?: SnapshotStoreConfig<SnapshotWithCriteria<any, BaseData>,
      SnapshotWithCriteria<any, BaseData<any, any, any>>>,
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
          SnapshotWithCriteria<any, BaseData>, SnapshotWithCriteria<any, BaseData<any, any>>>,
        snapshotContainerData?: SnapshotStore<T, K> | Snapshot<T, K> | null
      ) => Promise<SnapshotData<T, K>>;
      snapshotObj?: Snapshot<T, K> | undefined;
    }> => {
      if (
        newSnapshot.snapshotId === undefined) {
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
      
      
      const storeId = useSecureStoreId()
      const snapshotStoreConfig = snapshotApi.getSnapshotStoreConfig(
        null,
        {} as SnapshotContainer<SnapshotUnion<T>>,
        {},
        storeId
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
            if (isSnapshotDataType<T, K>(fetchedData) && snapshotData !== undefined) {
              snapshotData = fetchedData; // Safe to assign now
            } else {
              throw new Error("Fetched data is not of type SnapshotDataType<T, K>.");
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

      if(snapshotData === undefined){
        throw new Error("Snapshot data is undefined");
      }
      
      return {
        snapshotContainer,
        snapshotId: tempSnapshotId.toString(),
        snapshotData: snapshotData,
      };
    };
    // Ensure the async operation completes before using the results
    const { snapshotContainer, criteria, snapshotData, snapshotContainerData } = await getCriteriaAndData();

    // Ensure snapshotContainerData has all required properties for SnapshotContainer
    const completeSnapshotContainerData: SnapshotContainer<T, K> = {

      getSnapshot: newSnapshot.getSnapshot 
      ? newSnapshot.getSnapshot 
      : async (snapshotId: string | number, storeId: number, additionalHeaders?: Record<string, string>) => {
          // Return a rejected promise or handle the error as appropriate
          return Promise.reject(new Error("getSnapshot not implemented"));
        },
      handleSnapshotFailure: newSnapshot.handleSnapshotFailure ? newSnapshot.handleSnapshotFailure : (() => {}),
      getDataVersions: newSnapshot.getDataVersions 
      ? newSnapshot.getDataVersions 
      : async (id: number) => {
          // Return a rejected promise or handle the error as appropriate
          return Promise.resolve(undefined); // or some sensible default
      },
      updateDataVersions: newSnapshot.updateDataVersions ? newSnapshot.updateDataVersions : (() => {}),
    
      removeData: newSnapshot.removeData ? newSnapshot.removeData : (() => {}),
      updateData: newSnapshot.updateData ? newSnapshot.updateData : (() => {}),
      initialState: newSnapshot.initialState ? newSnapshot.initialState : (() => {}),
    

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
        getSnapshotsBySubscriberSuccess: newSnapshot.getSnapshotsBySubscriberSuccess,
      

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
    }
  );
};



export class LocalStorageSnapshotStore<
  T extends BaseData,
  K extends T = T
> extends SnapshotStore<T, K> {
  constructor(props: SnapshotStoreProps<T, K>) {
    super(props);
    // Additional setup for LocalStorageSnapshotStore, if needed
  }
  
  fetchStoreData(id: number): Promise<SnapshotStore<T, K>[]> {
    const snapshotStore: SnapshotStore<T, K> = {
      id: id.toString(),
      data: new Map<string, any>(), // Placeholder; replace with fetched data
      category: "default-category", // Replace with actual category if needed
      getSnapshotId: async () => id.toString(),
      compareSnapshotState: () => false, // Implement comparison logic as needed
      snapshot: async (): Promise<{ snapshot: Snapshot<T, K> }> => ({
        snapshot: this.createSnapshotObject(id.toString()),
      }),
      getSnapshotData: () => new Map(),
      getSnapshotCategory: () => "default-category",
      setSnapshotData: this.setSnapshotData,
      setSnapshotCategory: (newCategory: any) => {
        // Implement logic to set snapshot category
      },
      deleteSnapshot: () => {
        // Implement logic to delete snapshot
      },
      restoreSnapshot: this.restoreSnapshot,
      createSnapshot: () => this.createSnapshotObject(id.toString()),
      updateSnapshot: this.updateSnapshot,
    };
    return Promise.resolve([snapshotStore]);
  }

  private createSnapshotObject(id: string): Snapshot<T, K> {
    return {
      id,
      data: new Map(),
      category: "default-category",
      initialState: {},
      isCore: false,
      initialConfig: {},
      onInitialize: () => {},
    };
  }

  private setSnapshotData(
    snapshotStore: SnapshotStore<T, K>,
    data: Map<string, Snapshot<T, K>>,
    subscribers: Subscriber<T, K>[],
    snapshotData: Partial<SnapshotStoreConfig<T, K>>
  ): Map<string, Snapshot<T, K>> {
    snapshotStore.data = new Map(data);

    if (snapshotData.initialState) {
      snapshotStore.data = new Map(snapshotData.initialState);
    }

    if (subscribers.length > 0) {
      subscribers.forEach((subscriber) => {
        subscriber.notify(snapshotStore.data!, callback, subscribers);
      });
    }
    return snapshotStore.data;
  }

  private restoreSnapshot(
    id: string,
    snapshot: Snapshot<T, K>,
    snapshotId: string,
    snapshotData: SnapshotData<T, K>,
    savedState: SnapshotStore<T, K>,
    category: Category | undefined,
    callback: (snapshot: T) => void,
    snapshots: SnapshotsArray<T>,
    type: string,
    event: string | SnapshotEvents<T, K>,
    subscribers: SubscriberCollection<T, K>,
    snapshotContainer?: T,
    snapshotStoreConfig?: SnapshotStoreConfig<T, K>
  ): void {
    // Implement logic to restore snapshot
  }

  private async updateSnapshot(
    snapshotId?: string | number | null,
    data: Map<string, Snapshot<T, K>>,
    events: Record<string, CalendarManagerStoreClass<T, K>[]>,
    snapshotStore: SnapshotStore<T, K>,
    dataItems: RealtimeDataItem[],
    newData: Snapshot<T, K>,
    payload: UpdateSnapshotPayload<T>,
    store: SnapshotStore<any, K>
  ): Promise<{ snapshot: Snapshot<T, K> }> {
    const snapshot = await this.fetchOrCreateSnapshot(
      snapshotId,
      data,
      snapshotStore,
      store
    );

    const updatedSnapshot = this.mergeSnapshotData(snapshot, newData);
    this.handleEventsAndDataItems(snapshotId, updatedSnapshot, events, dataItems);

    data.set(snapshotId?.toString() || "", updatedSnapshot);
    return { snapshot: updatedSnapshot };
  }

  private async fetchOrCreateSnapshot(
    snapshotId?: string | number | null,
    data: Map<string, Snapshot<T, K>>,
    snapshotStore: SnapshotStore<T, K>,
    store: SnapshotStore<any, K>
  ): Promise<Snapshot<T, K>> {
    if (snapshotId && data.has(snapshotId.toString())) {
      return data.get(snapshotId.toString()) as Snapshot<T, K>;
    }
    return await createSnapshotInstance(
      snapshotId,
      data,
      "default-category",
      snapshotStore,
      store.config
    );
  }

  private mergeSnapshotData(
    snapshot: Snapshot<T, K>,
    newData: Snapshot<T, K>
  ): Snapshot<T, K> {
    return {
      ...snapshot,
      ...newData,
      lastUpdated: new Date(),
    };
  }

  private handleEventsAndDataItems(
    snapshotId?: string | number | null,
    snapshot: Snapshot<T, K>,
    events: Record<string, CalendarManagerStoreClass<T, K>[]>,
    dataItems: RealtimeDataItem[]
  ): void {
    const snapshotIdStr = snapshotId?.toString() || "default";

    if (events[snapshotIdStr]) {
      events[snapshotIdStr].forEach((manager) => manager.updateCalendarEvent(snapshot));
    }

    dataItems.forEach((item) => {
      if (item.relatedSnapshotId === snapshotId) {
        item.updateWithSnapshot(snapshot);
      }
    });
  }
}

// Example usage in a Redux slice or elsewhere
const newTask: Task<TaskData> = {
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
  storeProps: {},
  then: function (
    onFulfill: (newData: Snapshot<Data<T>, Data<T>>) => void
  ): Snapshot<Data<T>, Data<T>> {
    const { storeId, name, version, schema, options, category, config, operation, expirationDate, localStorage, snapshot,  payload, callback, endpointCategory} = storeProps
    const store = new LocalStorageSnapshotStore<Data, BaseData>({
      storeId: storeProps.storeId,
      name: storeProps.name,
      version: storeProps.version,
      schema: storeProps.schema,
      options: storeProps.options,
      category: storeProps.category,
      config: storeProps.config,
      operation: storeProps.operation,
      expirationDate: storeProps.expirationDate,
      storeProps: storeProps.storeProps,
      localStorage: window.localStorage,
      payload: storeProps.payload,
      callback: storeProps.callback,
      endpointCategory: storeProps.endpointCategory,
    });
    setTimeout(() => {
      onFulfill({
        snapshot,

        data: {} as Map<string, Data>,

        store: store,

        state: null,
      });
    }, 1000);
    return {
      ...snapshot,
      data: {} as Map<string, Data<BaseData>>,
      store: store,
      state: null,
    };
  },
};

export type {
  CoreSnapshot, Result, Snapshot,
  Snapshots,
  SnapshotsArray,
  SnapshotsObject,
  SnapshotUnion
};

 export { createSnapshotOptions, snapshots };



// Create a subscription object
const subscription: Subscription<T, K> = {
  name: "subscription-123",
  category: "category-123",
  subscribers: [],
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
  determineCategory: (
    data: string | Snapshot<T, K> | null | undefined
  ): string => {
    if (typeof data === "object" && data !== null) {
      // Ensure that `data.category` is converted to a string
      return typeof data.category === "string" ? data.category : "default";
    }
    return "default";
  },
  data: {} as Snapshot<Data<T>, Data<T>>, 
  getSubscriptionLevel: () => {
    return SubscriberTypeEnum.Individual;
  }
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
);

subscriber.id = subscriberId;

// Example snapshot object with correct type alignment
const snapshots: CoreSnapshot<Data<AddReportType>, Data<AddReportType>>[] = [
  {
    id: "1",
    data: new Map<string, Data<T>>([["key", { /* your data */ }]]),
    name: "Snapshot 1",
    timestamp: new Date(),
    createdBy: "User123",
    subscriberId: "Sub123",
    length: 100,
    category: "update",
    status: StatusType.Active,
    description: "Detailed description",
    content: "Snapshot content" || {},
    message: "Snapshot message",
    type: "type1",
    phases: ProjectPhaseTypeEnum.Development,
    phase: {
      id: "1",
      name: "Phase 1",
      startDate: new Date(),
      endDate: new Date(),
      label: {}, 
      date: new Date(), 
      createdBy: "Your Name",
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
          label: {}, 
          date: new Date(), 
          createdBy: "",
          startDate: new Date(),
          endDate: new Date(),
          status: "In Progress",
          type: "type1",
          description: "",
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
      },
    },
    ownerId: "Owner123",
    store: null,
    state: null,
    initialState: null,

    setSnapshotData(
      snapshotStore: SnapshotStore<BaseData, BaseData>,
      data: Map<string, Snapshot<Data<T>, any>>,
      subscribers: Subscriber<any, any>[],
      snapshotData: Partial<SnapshotStoreConfig<BaseData, BaseData>>,
      id?: string
    ): Map<string, Snapshot<Data<T>, Data<T>>> {
      // If the config array already exists, update it with the new snapshotData
      if (this.configs) {
        this.configs.forEach((config) => {
          Object.assign(config, snapshotData);
        });
      } else {
        // If no config array exists, create a new one with the provided snapshotData
        this.configs = [
          {
            ...snapshotData,
            id: snapshotData.id,
            subscribers: subscribers as Subscriber<BaseData, BaseData>[], // Ensure correct type
          } as SnapshotStoreConfig<BaseData, BaseData>,
        ];
      }

      // Return the updated data
      return data;
    },

    // Additional metadata
    _id: "abc123",
    title: "Snapshot Title",

    tags: {
      tag1: {
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
      subscribers, getSubscriptionLevel: getSubscriptionLevel,
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
    config: Promise.resolve(null),
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
    // then: (callback: (newData: Snapshot<Data<T>, Data<T>>) => void) => {
    //   /* implementation */
    // },
  },
];

// Example initial state
const initialState: InitializedState<BaseData, BaseData> = {};

const snapshot: Snapshot<BaseData, BaseData> = {
  id: "",
  category: category,
  timestamp: new Date(),
  createdBy: "",
  description: "",
  tags: {},
  metadata: {},
  data: new Map<string, Snapshot<T, K>>(),
  initialState: initializeState(initialState),
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
      type: string,
      snapshotStore: SnapshotStore<T, K>,
      dataItems: RealtimeDataItem[],
      criteria: SnapshotWithCriteria<T, K>,
      category: Category,
      snapshotData: SnapshotData<T, K>
    ) {
      this.emit(
        "snapshotRemoved",
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
      // event: string,
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


