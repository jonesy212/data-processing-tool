// // LocalStorageSnapshotStore.tsx
// import * as snapshotApi from "@/app/api/SnapshotApi";
// import { endpoints } from "@/app/api/endpointConfigurations";
// import { getSubscriberId } from "@/app/api/subscriberApi";
// import { SnapshotItem } from "@/app/components/snapshots/SnapshotList";
// import {
//     SnapshotCRUD,
//     SnapshotSubscriberManagement,
// } from "@/app/components/snapshots/SnapshotSubscriberManagement";
// import { CategoryProperties } from "@/app/pages/personas/ScenarioBuilder";
// import { IHydrateResult } from "mobx-persist";
// import { FC } from "react";
// import { Payload, UpdateSnapshotPayload } from "../database/Payload";
// import { ModifiedDate } from "../documents/DocType";
import { BaseData, Data, DataDetails } from "../models/data/Data";
// import {
//     PriorityTypeEnum,
//     ProjectPhaseTypeEnum,
//     StatusType,
//     SubscriberTypeEnum,
//     SubscriptionTypeEnum,
// } from "../models/data/StatusType";
// import { Meta } from "../models/data/dataStoreMethods";
// import { Task, TaskData } from "../models/tasks/Task";
// import { DataStoreMethods } from "../projects/DataAnalysisPhase/DataProcessing/ DataStoreMethods";
// import {
//     DataStore,
//     InitializedState,
// } from "../projects/DataAnalysisPhase/DataProcessing/DataStore";
// import { Subscription } from "../subscriptions/Subscription";
// import { NotificationTypeEnum } from "../support/NotificationContext";
// import {
//     getCommunityEngagement,
//     getMarketUpdates,
//     getTradeExecutions,
// } from "../trading/TradingUtils";
// import { Subscriber } from "../users/Subscriber";
// import {
//     logActivity,
//     notifyEventSystem,
//     portfolioUpdates,
//     triggerIncentives,
//     unsubscribe,
//     updateProjectState,
// } from "../utils/applicationUtils";
// import {
//     CustomSnapshotData,
//     SnapshotData,
//     SnapshotRelationships,
// } from "./SnapshotData";

// import { Category } from "../libraries/categories/generateCategoryProperties";
// import { ExtendedVersionData } from "../versions/VersionData";
// import { CoreSnapshot } from "./CoreSnapshot";

// import SnapshotStore, {
//     InitializableWithData,
//     SubscriberCollection,
// } from "./SnapshotStore";
// import {
//     InitializedConfig,
//     snapshotStoreConfig,
//     SnapshotStoreConfig,
// } from "./SnapshotStoreConfig";
import { SnapshotWithCriteria } from "./SnapshotWithCriteria";
// import createSnapshotOptions from "./createSnapshotOptions";
// import { Callback } from "./subscribeToSnapshotsImplementation";
// import { RealtimeDataItem } from "/Users/dixiejones/data_analysis/frontend/buddease/src/app/components/models/realtime/RealtimeData";
// import CalendarManagerStoreClass from "/Users/dixiejones/data_analysis/frontend/buddease/src/app/components/state/stores/CalendarEvent";

// import {
//     SnapshotContainer,
//     snapshotContainer,
//     SnapshotDataType,
// } from "./SnapshotContainer";

import { UnifiedMetaDataOptions } from "@/app/configs/database/MetaDataOptions";
// import { getCachedSnapshotData } from "@/app/generators/snapshotCache";
// import { CriteriaType } from "@/app/pages/searchs/CriteriaType";
// import { SchemaField } from "../database/SchemaField";
// import { UnsubscribeDetails } from "../event/DynamicEventHandlerExample";
// import { InitializedDataStore } from "../hooks/SnapshotStoreOptions";
// import { storeProps } from "../hooks/YourComponent";
// import { K, T } from "../models/data/dataStoreMethods";
// import { isSnapshotDataType } from "../utils/snapshotUtils";
// import { SnapshotActionType } from "./SnapshotActionType";
// import { SnapshotConfig } from "./SnapshotConfig";
// import { SnapshotEvents } from "./SnapshotEvents";
// import { SnapshotInitialization } from "./SnapshotInitialization";
// import { SnapshotMethods } from "./SnapshotMethods";
// import { isSnapshot } from "./createSnapshotStoreOptions";
// import snapshotDelegate from "./snapshotDelegate";
// import { SnapshotStoreProps } from "./useSnapshotStore";

// const SNAPSHOT_URL = endpoints.snapshots;

// // Define SnapshotUnion without needing K
type SnapshotUnion<T extends Data, Meta extends UnifiedMetaDataOptions> =
  | Snapshot<T, Meta, Data>
  | (SnapshotWithCriteria<T, Meta, BaseData> & T);

// // Update SnapshotStoreUnion to use K
// type SnapshotStoreUnion<T extends BaseData, Meta extends UnifiedMetaDataOptions, K extends Data = T> =
//   | SnapshotStoreObject<T, Meta, K>
//   | SnapshotStoreObject<T, Meta, K>
//   | Snapshots<T, Meta, K>;

// // Update Snapshots to use K
// type Snapshots<T extends BaseData, Meta extends UnifiedMetaDataOptions, K extends Data = T> =
//   SnapshotsArray<T, Meta> | SnapshotsObject<T, Meta, K>;

// Update SnapshotsObject to use K
type SnapshotsObject<T extends BaseData, Meta extends UnifiedMetaDataOptions, K extends Data = T> = {
  [key: string]: SnapshotUnion<T, Meta>;
};

// // SnapshotsArray remains unchanged
// type SnapshotsArray<T extends BaseData, Meta extends UnifiedMetaDataOptions> = Array<SnapshotUnion<T, Meta>>;

// // Update SnapshotStoreObject to use K
// type SnapshotStoreObject<T extends BaseData, Meta extends UnifiedMetaDataOptions, K extends Data = T> = {
//   [key: string]: SnapshotStoreUnion<T, Meta, K>;
// };

// // Define the snapshot function correctly
// const snapshotFunction = <T extends Data,
//   Meta extends UnifiedMetaDataOptions, K extends Data = T>(
//   id: string | number | undefined,
//   snapshotData: SnapshotData<T, Meta, K>,
//   category: symbol | string | Category | undefined,
//   callback: (snapshot: SnapshotStore<Data, Meta, Data>) => void,
//   criteria: CriteriaType,
//   snapshotId?: string | number | null,
//   snapshotStoreConfigData?: SnapshotStoreConfig<
//     SnapshotWithCriteria<any, Meta, BaseData>,
//    Meta, K
//   >,
//   snapshotContainerData?: SnapshotStore<T, Meta, K> | Snapshot<T, Meta, K> | null,
// ): Promise<SnapshotData<T, Meta, K>> => {
//   // Your logic for handling the snapshot goes here

//   // If snapshotData is already a Promise or has a then method, return it directly
//   if (typeof (snapshotData as any)?.then === "function") {
//     return Promise.resolve(snapshotData); // snapshotData might already be a promise-like object
//   }

//   // Otherwise, return a resolved Promise with snapshotData
//   return Promise.resolve(snapshotData);
// };

// const criteria = await snapshotApi.getSnapshotCriteria(
//   snapshotContainer as unknown as SnapshotContainer<T, Meta, K>,
//   snapshotFunction
// );

// const snapshotObj = {} as Snapshot<Data, Meta, Data>;
// const options = createSnapshotOptions(snapshotObj, snapshotFunction);
// const snapshotId = await snapshotApi.getSnapshotId(criteria);
// const storeId = await snapshotApi.getSnapshotStoreId(String(snapshotId));
// // const snapshotStoreConfig = snapshotApi.getSnapshotStoreConfig(null, {} as SnapshotContainer<Data, Meta, Data>, {}, storeId)
// const SNAPSHOT_STORE_CONFIG: SnapshotStoreConfig<Data, Meta, Data> =
//   snapshotStoreConfig as SnapshotStoreConfig<Data, Meta, Data>;

// interface SnapshotEquality<
//   T extends Data,
//   Meta extends UnifiedMetaDataOptions, 
//  K extends Data = T> {
//   equals(data: Snapshot<T, Meta, K>): boolean | null | undefined;
// }

// interface Snapshot<
//   T extends Data,
//   Meta extends UnifiedMetaDataOptions,
//   K extends T = T,
//   // ExcludedFields extends Data = never
// >
//   extends CoreSnapshot<T, Meta, K>,
//     SnapshotData<T, Meta, K>,
//     SnapshotMethods<T, Meta, K>,
//     SnapshotRelationships<T, Meta, K>,
//     InitializableWithData<T, Meta, K>,
//     SnapshotSubscriberManagement<T, Meta, K>,
//     SnapshotCRUD<T, Meta, K>,
//     SnapshotInitialization<T, Meta, K>,
//     SnapshotEquality<T, Meta, K> {
//   initialState: InitializedState<T, Meta, K> | {};
//   isCore: boolean;
//   initialConfig: InitializedConfig | {};
//   properties?: K;
//   snapshotsArray?: SnapshotsArray<T, Meta>;
//   snapshotsObject?: SnapshotsObject<T, Meta, K>;
//   recentActivity?: { action: string; 
//   timestamp: Date }[];
//   onInitialize: () => void;
//   onError: any;
//   categories?: Category[];
//   taskIdToAssign: string | undefined;
//   schema: string | Record<string, SchemaField>;
//   currentCategory: Category;
//   mappedSnapshotData: Map<string, Snapshot<T, Meta, K>> | undefined;
//   storeId: number;

//   versionInfo: ExtendedVersionData | null;
//   initializedState: InitializedState<T, Meta, K> | {};

//   criteria: CriteriaType | undefined;
//   storeConfig?: SnapshotStoreConfig<T, Meta, K>;
//   additionalData?: CustomSnapshotData;
//   snapshot: (
//     id: string | number | undefined,
//     snapshotId: string | number | null,
//     snapshotData: SnapshotData<T, Meta, K>,
//     category: symbol | string | Category | undefined,
//     categoryProperties: CategoryProperties | undefined,
//     callback: (snapshotStore: SnapshotStore<T, Meta, K>) => void,
//     dataStore: DataStore<T, Meta, K>,
//     dataStoreMethods: DataStoreMethods<T, Meta, K>,
//     metadata: UnifiedMetaDataOptions,
//     subscriberId: string, // Add subscriberId here
//     endpointCategory: string | number, // Add endpointCategory here
//     storeProps: SnapshotStoreProps<T, Meta, K>,
//     snapshotConfigData: SnapshotConfig<T, Meta, K>,
//     subscription: Subscription<T, Meta, K>,

//     snapshotStoreConfigData?: SnapshotStoreConfig<T, Meta, K>,
//     snapshotContainer?: SnapshotStore<T, Meta, K> | Snapshot<T, Meta, K> | null
//   ) => Snapshot<T, Meta, K> | Promise<{ snapshot: Snapshot<T, Meta, K> }>;

//   setCategory: (category: symbol | string | Category | undefined) => void;

//   applyStoreConfig: (
//     snapshotStoreConfig?:
//       | SnapshotStoreConfig<SnapshotUnion<BaseData, Meta>, Meta, K>
//       | undefined
//   ) => void;

//   generateId: (
//     prefix: string,
//     name: string,
//     type: NotificationTypeEnum,
//     id?: string,
//     title?: string,
//     chatThreadName?: string,
//     chatMessageId?: string,
//     chatThreadId?: string,
//     dataDetails?: DataDetails<T, Meta, K>,
//     generatorType?: string
//   ) => string;

//   snapshotData: (
//     id: string | number | undefined,
//     snapshotId: string |number,
//     data: Snapshot<T, Meta, K>,
//     mappedSnapshotData: Map<string, Snapshot<T, Meta, K>> | null | undefined,
//     snapshotData: SnapshotData<T, Meta, K>,
//     snapshotStore: SnapshotStore<T, Meta, K>,
//     category: Category | undefined,
//     categoryProperties: CategoryProperties | undefined,
//     dataStoreMethods: DataStoreMethods<T, Meta, K>,
//     storeProps: SnapshotStoreProps<T, Meta, K>
//   ) => Promise<SnapshotDataType<T, Meta, K>>;

//   snapshotStoreConfig?: SnapshotStoreConfig<T, Meta, any> | null;

//   snapshotStoreConfigSearch?: SnapshotStoreConfig<
//     SnapshotWithCriteria<any, Meta, BaseData>, Meta, K> | null;

//   snapshotContainer: SnapshotContainer<T, Meta, K> | undefined | null;

//   getSnapshotItems: () => (
//     | SnapshotItem<T, Meta, K>
//     | SnapshotStoreConfig<T, Meta, K>
//     | undefined
//   )[];

//   defaultSubscribeToSnapshots: (
//     snapshotId: string,
//     callback: (snapshots: Snapshots<T, Meta>) => Subscriber<T, Meta, K> | null,
//     snapshot: Snapshot<T, Meta, K> | null
//   ) => void;

//   getAllSnapshots: (
//     storeId: number,
//     snapshotId: string,
//     snapshotData: T,
//     timestamp: string,
//     type: string,
//     event: Event,
//     id: number,
//     snapshotStore: SnapshotStore<T, Meta, K>,
//     category: symbol | string | Category | undefined,
//     categoryProperties: CategoryProperties | undefined,
//     dataStoreMethods: DataStore<T, Meta, K>,
//     data: T,
//     filter?: (snapshot: Snapshot<T, Meta, K>) => boolean,
//     dataCallback?: (
//       subscribers: Subscriber<T, Meta, K>[],
//       snapshots: Snapshots<T, Meta>
//     ) => Promise<SnapshotUnion<T, Meta>[]>
//   ) => Promise<Snapshot<T, Meta, K>[]>;

//   transformDelegate: () => Promise<SnapshotStoreConfig<T, Meta, K>[]>;

//   getAllKeys: (
//     storeId: number,
//     snapshotId: string,
//     category: symbol | string | Category | undefined,
//     categoryProperties: CategoryProperties | undefined,
//     snapshot: Snapshot<T, Meta, K> | null,
//     timestamp: string | number | Date | undefined,
//     type: string,
//     event: Event,
//     id: number,
//     snapshotStore: SnapshotStore<T, Meta, K>,
//     data: T
//   ) => Promise<string[] | undefined> | undefined;

//   // Logic for `getAllValues`
//   getAllValues: () => SnapshotsArray<T, Meta>; // Use SnapshotsArray<T, Meta> if it represents an array of snapshots

//   getAllItems: () => Promise<Snapshot<T, Meta, K>[] | undefined>;

//   getSnapshotEntries: (snapshotId: string) => Map<string, T> | undefined;
//   getAllSnapshotEntries: () => Map<string, T>[];

//   addDataStatus: (id: number, status: StatusType | undefined) => void;
//   removeData: (id: number) => void;
//   updateData: (id: number, newData: Snapshot<T, Meta, K>) => void;
//   updateDataTitle: (id: number, title: string) => void;
//   updateDataDescription: (id: number, description: string) => void;
//   updateDataStatus: (id: number, status: StatusType | undefined) => void;

//   addDataSuccess: (payload: { data: Snapshot<T, Meta, K>[] }) => void;

//   getDataVersions: (id: number) => Promise<Snapshot<T, Meta, K>[] | undefined>;
//   updateDataVersions: (id: number, versions: Snapshot<T, Meta, K>[]) => void;

//   getBackendVersion: () => IHydrateResult<number> | Promise<string> | undefined;
//   getFrontendVersion: () =>
//     | IHydrateResult<number>
//     | Promise<string>
//     | undefined;

//   fetchStoreData: (id: number) => Promise<SnapshotStore<T, Meta, K>[]>;
//   fetchData: (endpoint: string, id: number) => Promise<SnapshotStore<T, Meta, K>>;

//   defaultSubscribeToSnapshot: (
//     snapshotId: string,
//     callback: Callback<Snapshot<T, Meta, K>>,
//     snapshot: Snapshot<T, Meta, K>
//   ) => string;

//   handleSubscribeToSnapshot: (
//     snapshotId: string,
//     callback: Callback<Snapshot<T, Meta, K>>,
//     snapshot: Snapshot<T, Meta, K>
//   ) => void;

//   removeItem: (key: string | number) => Promise<void>;

//   getSnapshot: (
//     snapshot: (
//       id: string | number
//     ) =>
//       | Promise<{
//           snapshotId: number;
//           snapshotData: SnapshotData<T, Meta, K>;
//           category: Category | undefined;
//           categoryProperties: CategoryProperties;
//           dataStoreMethods: DataStore<T, Meta, K>;
//           timestamp: string | number | Date | undefined;
//           id: string | number | undefined;
//           snapshot: Snapshot<T, Meta, K>;
//           snapshotStore: SnapshotStore<T, Meta, K>;
//           data: T;
//         }>
//       | undefined
//   ) => Promise<Snapshot<T, Meta, K> | undefined>;

//   getSnapshotSuccess: (
//     snapshot: Snapshot<SnapshotUnion<BaseData, Meta>, Meta, K>,
//     subscribers: Subscriber<T, Meta, K>[]
//   ) => Promise<SnapshotStore<T, Meta, K>>;

//   setItem: (key: T, value: T) => Promise<void>;
//   getItem: (key: T) => Promise<Snapshot<T, Meta, K> | undefined>;

//   getDataStore: () => Promise<InitializedDataStore>;
//   getDataStoreMap: () => Promise<Map<string, DataStore<T, Meta, K>>>;

//   addSnapshotSuccess: (
//     snapshot: Snapshot<T, Meta, K>,
//     subscribers: Subscriber<T, Meta, K>[]
//   ) => void;

//   deepCompare: (objA: any, objB: any) => boolean;
//   shallowCompare: (objA: any, objB: any) => boolean;

//   getDataStoreMethods: () => DataStoreMethods<T, Meta, K>;

//   getDelegate: (context: {
//     useSimulatedDataSource: boolean;
//     simulatedDataSource: SnapshotStoreConfig<T, Meta, K>[];
//   }) => Promise<DataStore<T, Meta, K>[]>;

//   determineCategory: (snapshot: Snapshot<T, Meta, K> | null | undefined) => string;
//   determinePrefix: (snapshot: T | null | undefined, category: string) => string;

//   removeSnapshot: (snapshotToRemove: Snapshot<T, Meta, K>) => void;
//   addSnapshotItem: (item: Snapshot<T, Meta, K> | SnapshotStoreConfig<T, Meta, K>) => void;
//   // addSnapConfig: (config: SnapshotConfig<T, Meta, K>) => void;
//   addNestedStore: (
//     store: SnapshotStore<T, Meta, K>,
//     item: SnapshotStoreConfig<T, Meta, K> | Snapshot<T, Meta, K>
//   ) => void;
//   clearSnapshots: () => void;

//   addSnapshot: (
//     snapshot: Snapshot<T, Meta, K>,
//     snapshotId: string,
//     subscribers: SubscriberCollection<T, Meta, K>
//   ) => Promise<Snapshot<T, Meta, K> | undefined>;

//   emit: (
//     // todo update to use if maeks sense
//     // event: string | CombinedEvents<T, Meta, K> | SnapshotEvents<T, Meta, K>,
//     event: string,
//     snapshot: Snapshot<T, Meta, K>,
//     snapshotId: string,
//     subscribers: SubscriberCollection<T, Meta, K>,
//     type: string,
//     snapshotStore: SnapshotStore<T, Meta, K>,
//     dataItems: RealtimeDataItem[],
//     criteria: SnapshotWithCriteria<T, Meta, K>,
//     category: Category,
//     snapshotData: SnapshotData<BaseData, Meta, BaseData>
//   ) => void;

//   createSnapshot: (
//     id: string,
//     snapshotData: SnapshotData<T, Meta, K>,
//     additionalData: any,
//     category?: string | symbol | Category,
//     callback?: (snapshot: Snapshot<Data, Meta, K>) => void,
//     SnapshotData?: SnapshotStore<T, Meta, K>,
//     snapshotStoreConfig?: SnapshotStoreConfig<SnapshotUnion<any, any>, Meta, K>
//   ) => Snapshot<T, Meta, K> | null;

//   createInitSnapshot: (
//     id: string,
//     initialData: T,
//     snapshotData: SnapshotData<any, Meta, K>,
//     snapshotStoreConfig: SnapshotStoreConfig<SnapshotUnion<any, any>, Meta, K>,
//     category: symbol | string | Category | undefined,
//     additionalData: any
//   ) => Promise<SnapshotWithCriteria<T, Meta, K>>;

//   addStoreConfig: (config: SnapshotStoreConfig<T, Meta, K>) => void;

//   handleSnapshotConfig: (config: SnapshotStoreConfig<T, Meta, K>) => void;
//   getSnapshotConfig: (
//     snapshotId: string | null,
//     snapshotContainer: SnapshotContainer<T, Meta, K>,
//     criteria: CriteriaType,
//     category: Category,
//     categoryProperties: CategoryProperties | undefined,
//     delegate: any,
//     snapshotData: SnapshotData<T, Meta, K>,
//     snapshot: (
//       id: string,
//       snapshotId: string | null,
//       snapshotData: SnapshotData<T, Meta, K>,
//       category: Category
//     ) => void
//   ) => SnapshotStoreConfig<T, Meta, K>[] | undefined;

//   getSnapshotListByCriteria: (
//     criteria: SnapshotStoreConfig<T, Meta, K>
//   ) => Promise<Snapshot<T, Meta, K>[]>;

//   setSnapshotSuccess: (
//     snapshotData: SnapshotData<T, Meta, K>,
//     subscribers: SubscriberCollection<T, Meta, K>
//   ) => void;

//   setSnapshotFailure: (error: Error) => void;
//   updateSnapshots: () => void;

//   updateSnapshotsSuccess: (
//     snapshotData: (
//       subscribers: Subscriber<T, Meta, K>[],
//       snapshot: Snapshots<T, Meta>
//     ) => void
//   ) => void;

//   updateSnapshotsFailure: (error: Payload) => void;

//   initSnapshot: (
//     snapshot: SnapshotStore<T, Meta, K> | Snapshot<T, Meta, K> | null,
//     snapshotId: number,
//     snapshotData: SnapshotData<T, Meta, K>,
//     category: Category | undefined,
//     categoryProperties: CategoryProperties | undefined,
//     snapshotConfig: SnapshotStoreConfig<T, Meta, K>,
//     callback: (snapshotStore: SnapshotStore<any, any>) => void,
//     snapshotStoreConfig: SnapshotStoreConfig<SnapshotWithCriteria<any, Meta, K>, Meta, K>
//   ) => void;

//   takeSnapshot: (
//     snapshot: Snapshot<T, Meta, K>,
//     subscribers: Subscriber<T, Meta, K>[]
//   ) => Promise<{ snapshot: Snapshot<T, Meta, K> }>;

//   takeSnapshotSuccess: (snapshot: Snapshot<T, Meta, K>) => void;

//   takeSnapshotsSuccess: (snapshots: T[]) => void;

//   flatMap: <R extends Iterable<any>>(
//     callback: (
//       value: SnapshotStoreConfig<R, Meta, K>,
//       index: number,
//       array: SnapshotStoreConfig<R, Meta, K>[]
//     ) => R
//   ) => R extends (infer I)[] ? I[] : R[];

//   getState: () => any;
//   setState: (state: any) => void;

//   validateSnapshot: (snapshotId: string, snapshot: Snapshot<T, Meta, K>) => boolean;

//   handleActions: (action: (selectedText: string) => void) => void;

//   setSnapshot: (snapshot: Snapshot<T, Meta, K>) => void;

//   transformSnapshotConfig: <U extends BaseData>(
//     config: SnapshotConfig<U, Meta, U>
//   ) => SnapshotConfig<U, Meta, U>;

//   setSnapshots: (snapshots: SnapshotStore<T, Meta, K>[]) => void;
//   clearSnapshot: () => void;

//   mergeSnapshots: (snapshots: Snapshots<T, Meta>, category: string) => void;

//   reduceSnapshots: <T extends BaseData>(
//     callback: (acc: T, snapshot: Snapshot<T, Meta, T>) => T,
//     initialValue: T
//   ) => T | undefined;

//   sortSnapshots: () => void;
//   filterSnapshots: () => void;

//   findSnapshot: (
//     predicate: (snapshot: Snapshot<T, Meta, K>) => boolean
//   ) => Snapshot<T, Meta, K> | undefined;

//   mapSnapshots: <U, V>(
//     storeIds: number[],
//     snapshotId: string,
//     category: symbol | string | Category | undefined,
//     categoryProperties: CategoryProperties | undefined,
//     snapshot: Snapshot<T, Meta, K>,
//     timestamp: string | number | Date | undefined,
//     type: string,
//     event: Event,
//     id: number,
//     snapshotStore: SnapshotStore<T, Meta, K>,
//     data: K,
//     callback: (
//       storeIds: number[],
//       snapshotId: string,
//       category: symbol | string | Category | undefined,
//       categoryProperties: CategoryProperties | undefined,
//       snapshot: Snapshot<T, Meta, K>,
//       timestamp: string | number | Date | undefined,
//       type: string,
//       event: Event,
//       id: number,
//       snapshotStore: SnapshotStore<T, Meta, K>,
//       data: V, // Use V for the callback data type
//       index: number
//     ) => U // Return type of the callback
//   ) => U[];

//   takeLatestSnapshot: () => Snapshot<T, Meta, K> | undefined;

//   updateSnapshot: (
//     snapshotId: string,
//     data: Map<string, Snapshot<T, Meta, K>>,
//     events: Record<string, CalendarManagerStoreClass<T, Meta, K>[]>,
//     snapshotStore: SnapshotStore<T, Meta, K>,
//     dataItems: RealtimeDataItem[],
//     newData: Snapshot<T, Meta, K>,
//     payload: UpdateSnapshotPayload<T>,
//     store: SnapshotStore<any, Meta, K>
//   ) => void;

//   getSnapshotConfigItems: () => SnapshotStoreConfig<T, Meta, K>[];

//   subscribeToSnapshots: (
//     snapshotStore: SnapshotStore<T, Meta, K>,
//     snapshotId: string,
//     snapshotData: SnapshotData<T, Meta, K>,
//     category: Category | undefined,
//     snapshotConfig: SnapshotStoreConfig<T, Meta, K>,
//     callback: (
//       snapshotStore: SnapshotStore<any, any>
//     ) => Subscriber<T, Meta, K> | null,
//     snapshots: SnapshotsArray<T, Meta>,
//     unsubscribe?: UnsubscribeDetails
//   ) => [] | SnapshotsArray<T, Meta>;

//   executeSnapshotAction: (
//     actionType: SnapshotActionType,
//     actionData: any
//   ) => Promise<void>;

//   getSnapshotItemsSuccess: () => SnapshotItem<Data, any>[] | undefined;
//   getSnapshotItemSuccess: () => SnapshotItem<Data, any> | undefined;

//   getSnapshotKeys: () => string[] | undefined;
//   getSnapshotIdSuccess: () => string | undefined;

//   getSnapshotValuesSuccess: () => SnapshotItem<Data, any>[] | undefined;

//   getSnapshotWithCriteria: (
//     criteria: SnapshotStoreConfig<T, Meta, K>
//   ) => SnapshotStoreConfig<T, Meta, K>;

//   reduceSnapshotItems: (
//     callback: (acc: any, snapshot: Snapshot<T, Meta, K>) => any,
//     initialValue: any
//   ) => any;
// }

// const snapshotType = <T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T>(
//   snapshotObj: Snapshot<T, Meta, K>,
//   snapshot: (
//     id: string | number | undefined,
//     snapshotData: SnapshotData<T, Meta, K>,
//     category: symbol | string | Category | undefined,
//     callback: (snapshot: Snapshot<T, Meta, K>) => void,
//     criteria: CriteriaType,
//     snapshotId?: string | number | null,
//     snapshotStoreConfigData?: SnapshotStoreConfig<SnapshotWithCriteria<any, Meta, BaseData>, Meta, K>,
//     snapshotContainer?: SnapshotStore<T, Meta, K> | Snapshot<T, Meta, K> | null
//   ) => Promise<Snapshot<T, Meta, K>>
// ): Promise<Snapshot<T, Meta, K>> => {
//   const newSnapshot = { ...snapshotObj }; // Shallow copy of the snapshot

//   // Handle SnapshotStore<BaseData> or Snapshot<BaseData>
//   if (snapshotObj.initialState && "store" in snapshotObj.initialState) {
//     newSnapshot.initialState = snapshotObj.initialState;
//   } else if (snapshotObj.initialState && "data" in snapshotObj.initialState) {
//     newSnapshot.initialState = snapshotObj.initialState;
//   } else {
//     newSnapshot.initialState = null; // Handle null or undefined case
//   }

//   const config = newSnapshot.config || [];

//   // Async function to get criteria and snapshot data
//   const getCriteriaAndData = async (): Promise<{
//     snapshotContainer: SnapshotContainer<T, Meta, K>;
//     snapshotId: string | number | null;
//     snapshotData: SnapshotData<T, Meta, K>;
//     snapshot?: (
//       id: string | number | null | undefined,
//       snapshotId: string | null,
//       snapshotData: SnapshotData<T, Meta, K>,
//       category: symbol | string | Category | undefined,
//       callback: (snapshot: Snapshot<T, Meta, K>) => void,
//       criteria: CriteriaType,
//       snapshotStoreConfigData?: SnapshotStoreConfig<
//         SnapshotWithCriteria<any, Meta, BaseData>, Meta, K>,
//       snapshotContainerData?: SnapshotStore<T, Meta, K> | Snapshot<T, Meta, K> | null
//     ) => Promise<SnapshotData<T, Meta, K>>;
//     snapshotObj?: Snapshot<T, Meta, K> | undefined;
//   }> => {
//     if (
//       newSnapshot.snapshotId === undefined) {
//       throw new Error("can't find snapshotId");
//     }

//     let criteria = await snapshotApi.getSnapshotCriteria(newSnapshot, snapshot);
//     const tempSnapshotId = await snapshotApi.getSnapshotId(criteria);
//     if (tempSnapshotId === undefined) {
//       throw new Error("Failed to get snapshot ID");
//     }

//     // Retrieve snapshot data here; assuming you have a function to fetch it
//     let snapshotData: SnapshotDataType<T, Meta, K> | undefined;

//     if (!snapshotData && isSnapshot(snapshotData)) {
//       // snapshotData is guaranteed to be of type Snapshot<T, Meta, K> here
//     } else {
//       throw new Error(
//         "Failed to get snapshot data or data is not in the expected format"
//       );
//     }

//     if (snapshot === undefined) {
//       throw new Error("Snapshot is undefined");
//     }
//     // Mock of a cached data check (replace with your actual caching mechanism)
//     const cachedData = getCachedSnapshotData(String(snapshotId)) as
//       | SnapshotData<T, Meta, K>
//       | undefined;
    
    
//     const snapshotStoreConfig = snapshotApi.getSnapshotStoreConfig(
//       null,
//       {} as SnapshotContainer<SnapshotUnion<Data, Meta>, Meta, K>,
//       {},
//       storeId
//     );

//     try {
//       if (cachedData) {
//         // If cached data is available, use it
//         console.log("Using cached data");
//         snapshotData = cachedData;
//       } else {
//         // If no cached data, fetch from an API
//         console.log("Fetching data from API");
//         const endpoint = "/api/snapshot";
//         const id = 123;

//         // Check if the snapshotDelegate returns a non-empty array
//         const configs = snapshotDelegate(snapshotStoreConfig);
//         if (configs.length > 0) {
//           // Use the first configuration to fetch the data
//           const fetchedData = configs[0].fetchSnapshotData(endpoint, id);

//           // Assuming `fetchSnapshotData` returns data in the format `SnapshotStore<T, Meta, K>`
//           if (isSnapshotDataType<T, Meta, K>(fetchedData) && snapshotData !== undefined) {
//             snapshotData = fetchedData; // Safe to assign now
//           } else {
//             throw new Error("Fetched data is not of type SnapshotDataType<T, Meta, K>.");
//           }
//         } else {
//           throw new Error("No SnapshotStoreConfig found.");
//         }
//       }
//     } catch (error) {
//       // Handle the error and provide a fallback
//       console.error(
//         "Failed to fetch data, falling back to default value",
//         error
//       );
//       snapshotData = new Map<string, Snapshot<T, Meta, K>>();
//     }

//     if(snapshotData === undefined){
//       throw new Error("Snapshot data is undefined");
//     }
    
//     return {
//       snapshotContainer,
//       snapshotId: tempSnapshotId.toString(),
//       snapshotData: snapshotData,
//     };
//   };
//   // Ensure the async operation completes before using the results
//   const { snapshotContainer, criteria, snapshotData, snapshotContainerData } =
//     await getCriteriaAndData();

//   // Ensure snapshotContainerData has all required properties for SnapshotContainer
//   const completeSnapshotContainerData: SnapshotContainer<T, Meta, K> = {

//     name: newSnapshot.name ? newSnapshot.name : "",
//     snapshots: newSnapshot.snapshots ? newSnapshot.snapshots : [],
//     find: newSnapshot.find,
//     isExpired: newSnapshot.isExpired,
    

//     id: newSnapshot.id,
//     // parentId: newSnapshot.parentId || null,
//     // childIds: newSnapshot.childIds || [],
//     mapSnapshotWithDetails: newSnapshot.mapSnapshotWithDetails,

//     taskIdToAssign: newSnapshot.taskIdToAssign,
//     initialConfig: newSnapshot.initialConfig || {},
//     removeSubscriber: newSnapshot.removeSubscriber,
//     onInitialize: newSnapshot.onInitialize,
//     onError: newSnapshot.onError,
//     snapshot: newSnapshot.snapshot,
//     snapshotsArray: [],
//     snapshotsObject: {},
//     snapshotStore: newSnapshot.snapshotStore || ({} as SnapshotStore<T, Meta, K>), // Provide a default empty object if null
//     mappedSnapshotData: newSnapshot.mappedSnapshotData || undefined,
//     timestamp: newSnapshot.timestamp,
//     snapshotData: newSnapshot.snapshotData || undefined,
//     data: newSnapshot.data,

//     currentCategory: newSnapshot.currentCategory,
//     setSnapshotCategory: newSnapshot.setSnapshotCategory,
//     getSnapshotCategory: newSnapshot.getSnapshotCategory,
//     items: newSnapshot.items,

//     config: newSnapshot.config,
//     subscribers: newSnapshot.subscribers,
//     getSnapshotData: newSnapshot.getSnapshotData,
//     deleteSnapshot: newSnapshot.deleteSnapshot,

//     criteria: newSnapshot.criteria,
//     content: newSnapshot.content,
//     snapshotCategory: newSnapshot.snapshotCategory,
//     snapshotSubscriberId: newSnapshot.snapshotSubscriberId,

//     isCore: newSnapshot.isCore,
//     subscriberManagement: {
//       notify: newSnapshot.notify,
//       notifySubscribers: newSnapshot.notifySubscribers,
//       subscribers: newSnapshot.subscribers,
//       snapshotSubscriberId: newSnapshot.snapshotSubscriberId,
//       isSubscribed: newSnapshot.isSubscribed,
//       getSubscribers: newSnapshot.getSubscribers,
//       subscribe: newSnapshot.subscribe,
//       subscribeToSnapshot: newSnapshot.subscribeToSnapshot,
//       subscribeToSnapshotList: newSnapshot.subscribeToSnapshotList,
//       unsubscribeFromSnapshot: newSnapshot.unsubscribeFromSnapshot,
     
//       // setSnapshotCategory: newSnapshot.setSnapshotCategory,
//       // getSnapshotCategory: newSnapshot.getSnapshotCategory,
//       // getSnapshotData: newSnapshot.getSnapshotData,
//       // deleteSnapshot: newSnapshot.deleteSnapshot,
     
//       subscribeToSnapshotsSuccess: newSnapshot.subscribeToSnapshotsSuccess,
//       unsubscribeFromSnapshots: newSnapshot.unsubscribeFromSnapshots,
//       unsubscribe: newSnapshot.unsubscribe,
//       subscribeToSnapshots: newSnapshot.subscribeToSnapshots,
      
//       clearSnapshot: newSnapshot.clearSnapshot,
//       clearSnapshotSuccess: newSnapshot.clearSnapshotSuccess,
//       addToSnapshotList: newSnapshot.addToSnapshotList,
//       removeSubscriber: newSnapshot.removeSubscriber,
     
//       addSnapshotSubscriber: newSnapshot.addSnapshotSubscriber,
//       removeSnapshotSubscriber: newSnapshot.removeSnapshotSubscriber,
//       transformSubscriber: newSnapshot.transformSubscriber,
//       defaultSubscribeToSnapshots: newSnapshot.defaultSubscribeToSnapshots,
//       getSnapshotsBySubscriber: newSnapshot.getSnapshotsBySubscriber,
//       getSnapshotsBySubscriberSuccess: newSnapshot.getSnapshotsBySubscriberSuccess,
     

//     },
//     getSnapshots: newSnapshot.getSnapshots,

//     getAllSnapshots: newSnapshot.getAllSnapshots,
//     generateId: newSnapshot.generateId,
//     compareSnapshots: newSnapshot.compareSnapshots,
//     compareSnapshotItems: newSnapshot.compareSnapshotItems,

//     batchTakeSnapshot: newSnapshot.batchTakeSnapshot,
//     batchFetchSnapshots: newSnapshot.batchFetchSnapshots,
//     batchTakeSnapshotsRequest: newSnapshot.batchTakeSnapshotsRequest,
//     batchUpdateSnapshotsRequest: newSnapshot.batchUpdateSnapshotsRequest,

//     filterSnapshotsByStatus: newSnapshot.filterSnapshotsByStatus,
//     filterSnapshotsByCategory: newSnapshot.filterSnapshotsByCategory,
//     filterSnapshotsByTag: newSnapshot.filterSnapshotsByTag,
//     batchFetchSnapshotsSuccess: newSnapshot.batchFetchSnapshotsSuccess,

//     batchFetchSnapshotsFailure: newSnapshot.batchFetchSnapshotsFailure,
//     batchUpdateSnapshotsSuccess: newSnapshot.batchUpdateSnapshotsSuccess,
//     batchUpdateSnapshotsFailure: newSnapshot.batchUpdateSnapshotsFailure,
//     handleSnapshotSuccess: newSnapshot.handleSnapshotSuccess,

//     getSnapshotId: newSnapshot.getSnapshotId,
//     compareSnapshotState: newSnapshot.compareSnapshotState,
//     payload: newSnapshot.payload,
//     dataItems: newSnapshot.dataItems,

//     newData: newSnapshot.newData,
//     getInitialState: newSnapshot.getInitialState,
//     getConfigOption: newSnapshot.getConfigOption,
//     getTimestamp: newSnapshot.getTimestamp,

//     getStores: newSnapshot.getStores,
//     getData: newSnapshot.getData,
//     setData: newSnapshot.setData,
//     addData: newSnapshot.addData,

//     stores: newSnapshot.stores,
//     getStore: newSnapshot.getStore,
//     addStore: newSnapshot.addStore,
//     mapSnapshot: newSnapshot.mapSnapshot,

//     removeStore: newSnapshot.removeStore,
//     unsubscribe: newSnapshot.unsubscribe,
//     fetchSnapshot: newSnapshot.fetchSnapshot,

//     fetchSnapshotSuccess: newSnapshot.fetchSnapshotSuccess,
//     updateSnapshotFailure: newSnapshot.updateSnapshotFailure,
//     fetchSnapshotFailure: newSnapshot.fetchSnapshotFailure,
//     addSnapshotFailure: newSnapshot.addSnapshotFailure,

//     configureSnapshotStore: newSnapshot.configureSnapshotStore,
//     updateSnapshotSuccess: newSnapshot.updateSnapshotSuccess,
//     createSnapshotFailure: newSnapshot.createSnapshotFailure,
//     createSnapshotSuccess: newSnapshot.createSnapshotSuccess,

//     createSnapshots: newSnapshot.createSnapshots,
//     storeId: newSnapshot.storeId,
//     snapConfig: newSnapshot.snapConfig,
//     onSnapshot: newSnapshot.onSnapshot,
//     onSnapshots: newSnapshot.onSnapshots,
//     events: newSnapshot.events,
//     childIds: newSnapshot.childIds,
//     getParentId: newSnapshot.getParentId,

//     getChildIds: newSnapshot.getChildIds,
//     addChild: newSnapshot.addChild,
//     removeChild: newSnapshot.removeChild,
//     getChildren: newSnapshot.getChildren,

//     hasChildren: newSnapshot.hasChildren,
//     isDescendantOf: newSnapshot.isDescendantOf,
//     getSnapshotById: newSnapshot.getSnapshotById,

//     // Add any other required properties here
//   };

//   // Return the newSnapshot as a Promise<Snapshot<T, Meta, K>>
//   return Promise.resolve({
//     ...newSnapshot,
//     ...completeSnapshotContainerData,
//     ...snapshotData,
//   });
// };

// export class LocalStorageSnapshotStore<
//   T extends BaseData,
//   K extends Data
// > extends SnapshotStore<T, Meta, K> {
//   // ... (previous code remains unchanged)

//   fetchStoreData(id: number): Promise<SnapshotStore<T, Meta, K>[]> {
//     // Fetch or create the SnapshotStore instance based on the ID
//     // For demonstration, we'll use placeholder logic to simulate fetching data
//     const snapshotStore: SnapshotStore<T, Meta, K> = {
//       id: id.toString(),
//       data: new Map<string, any>(), // Replace with actual fetched data
//       category: "default-category", // Replace with actual category if needed
//       getSnapshotId: async () => id.toString(),
//       compareSnapshotState: () => false, // Implement comparison logic
//       snapshot: async (): Promise<{ snapshot: Snapshot<T, Meta, K> }> => ({
//         snapshot: {
//           id: id.toString(),
//           data: new Map(),
//           category: "default-category",
//           initialState: {},
//           isCore: false,
//           initialConfig: {},
//           onInitialize: () => {},
//         },
//       }),
//       getSnapshotData: () => new Map(), // Replace with actual data
//       getSnapshotCategory: () => "default-category", // Replace with actual category
//       setSnapshotData: (
//         snapshotStore: SnapshotStore<T, Meta, K>,
//         data: Map<string, Snapshot<T, Meta, K>>,
//         subscribers: Subscriber<T, Meta, K>[],
//         snapshotData: Partial<SnapshotStoreConfig<T, Meta, K>>
//       ): Map<string, Snapshot<T, Meta, K>> => {
//         // Update the snapshotStore's data with the new data
//         snapshotStore.data = new Map(data);

//         // Optional: Update the snapshotStore's configuration if provided
//         if (snapshotData.initialState) {
//           snapshotStore.data = new Map(snapshotData.initialState);
//         }

//         // Notify subscribers of the data change if needed
//         if (subscribers.length > 0) {
//           subscribers.forEach((subscriber) => {
//             // Implement logic to notify each subscriber about the data change
//             subscriber.notify(snapshotStore.data!, callback, subscribers);
//           });
//         }

//         // Return the updated data
//         return snapshotStore.data;
//       },
//       setSnapshotCategory: (newCategory: any) => {
//         // Implement logic to set snapshot category
//       },
//       deleteSnapshot: () => {
//         // Implement logic to delete snapshot
//       },
//       restoreSnapshot: (
//         id: string,
//         snapshot: Snapshot<T, Meta, K>,
//         snapshotId: string,
//         snapshotData: SnapshotData<T, Meta, K>,
//         savedState: SnapshotStore<T, Meta, K>,
//         category: Category | undefined,
//         callback: (snapshot: T) => void,
//         snapshots: SnapshotsArray<T, Meta>,
//         type: string,
//         event: string | SnapshotEvents<T, Meta, K>,
//         subscribers: SubscriberCollection<T, Meta, K>,
//         snapshotContainer?: T,
//         snapshotStoreConfig?:
//           | SnapshotStoreConfig<SnapshotUnion<BaseData, Meta>, K>
//           | undefined
//       ) => {
//         // Implement logic to restore snapshot
//       },
//       createSnapshot: () => ({
//         id: id.toString(),
//         data: new Map(),
//         category: "default-category",
//       }),
//       updateSnapshot: async (
//         snapshotId,
//         data,
//         events,
//         snapshotStore,
//         dataItems,
//         newData,
//         payload,
//         store
//       ): Promise<{ snapshot: Snapshot<T, Meta, K> }> => {
//         // Implement update logic
//         return {
//           snapshot: {
//             id: snapshotId.toString(),
//             data: new Map(),
//             category: "default-category",
//           },
//         };
//       },
//       // Add other methods as needed
//     };
//     return Promise.resolve([snapshotStore]);
//   }

//   // ... (remaining code unchanged)
// }

// // Example usage in a Redux slice or elsewhere
// const newTask: Task = {
//   _id: "newTaskId2",
//   id: "randomTaskId", // generate unique id
//   name: "",
//   title: "",
//   description: "",
//   assignedTo: [],
//   dueDate: new Date(),
//   status: "Pending",
//   priority: PriorityTypeEnum.Medium,
//   estimatedHours: 0,
//   actualHours: 0,
//   startDate: new Date(),
//   completionDate: new Date(),
//   endDate: new Date(),
//   isActive: false,
//   assigneeId: "",
//   payload: {},
//   previouslyAssignedTo: [],
//   done: false,
//   data: {} as TaskData,
//   source: "user",
//   tags: {},
//   dependencies: [],
//   storeProps: {},
//   then: function (
//     onFulfill: (newData: Snapshot<Data, Meta, Data>) => void
//   ): Snapshot<Data, Meta, Data> {
//     // const { storeId, name, version, schema, options, category, config, operation, expirationDate, localStorage, snapshot,  payload, callback, endpointCategory} = storeProps
//     const store = new LocalStorageSnapshotStore<Data, Meta, BaseData>({
//       storeId: storeProps.storeId,
//       name: storeProps.name,
//       version: storeProps.version,
//       schema: storeProps.schema,
//       options: storeProps.options,
//       category: storeProps.category,
//       config: storeProps.config,
//       operation: storeProps.operation,
//       expirationDate: storeProps.expirationDate,
//       storeProps: storeProps.storeProps,
//       localStorage: window.localStorage,
//       payload: storeProps.payload,
//       callback: storeProps.callback,
//       endpointCategory: storeProps.endpointCategory,
//     });
//     setTimeout(() => {
//       onFulfill({
//         snapshot,

//         data: {} as Map<string, Data>,

//         store: store,

//         state: null,
//       });
//     }, 1000);
//     return {
//       ...snapshot,
//       data: {} as Map<string, Data>,
//       store: store,
//       state: null,
//     };
//   },
// };

export type {
//     CoreSnapshot, Payload, Snapshot, Snapshots, SnapshotsArray,
    SnapshotsObject,
//     SnapshotStoreObject,
//     SnapshotStoreUnion,
//     SnapshotUnion, UpdateSnapshotPayload
};

//  export { createSnapshotOptions, snapshots };



// // Create a subscription object
// const subscription: Subscription<T, Meta, K> = {
//   name: "subscription-123",
//   category: "category-123",
//   subscribers: [],
//   unsubscribe: () => {},
//   portfolioUpdates: () => {},
//   tradeExecutions: () => {},
//   marketUpdates: () => {},
//   triggerIncentives: () => {},
//   communityEngagement: () => {},
//   subscriberId: "sub-123",
//   subscriptionId: "sub-123-id",
//   subscriberType: SubscriberTypeEnum.Individual,
//   subscriptionType: SubscriptionTypeEnum.STANDARD,
//   getPlanName: () => SubscriberTypeEnum.Individual,
//   portfolioUpdatesLastUpdated: null,
//   getId: () => "id-123",
//   determineCategory: (
//     data: string | Snapshot<T, Meta, K> | null | undefined
//   ): string => {
//     if (typeof data === "object" && data !== null) {
//       // Ensure that `data.category` is converted to a string
//       return typeof data.category === "string" ? data.category : "default";
//     }
//     return "default";
//   },
//   data: {} as Snapshot<Data, Meta, Data>, 
//   getSubscriptionLevel: () => {
//     return SubscriberTypeEnum.Individual;
//   }
// };

// const subscriberId = getSubscriberId.toString();

// const subscriber = new Subscriber<T, Meta, K>(
//   "_id",
//   "John Doe",
//   subscription,
//   subscriberId,
//   notifyEventSystem,
//   updateProjectState,
//   logActivity,
//   triggerIncentives,
//   undefined,
//   {}
// );

// subscriber.id = subscriberId;

// // Example snapshot object with correct type alignment
// const snapshots: CoreSnapshot<Data, Meta, Data>[] = [
//   {
//     id: "1",
//     data: {
//       /* your data */
//     } as Map<string, Data>,

//     // name: "Snapshot 1",
//     timestamp: new Date(),
//     createdBy: "User123",
//     subscriberId: "Sub123",
//     length: 100,
//     category: "update",
//     status: StatusType.Active,
//     description: "Detailed description",
//     content: "Snapshot content" || {},
//     message: "Snapshot message",
//     type: "type1",
//     phases: ProjectPhaseTypeEnum.Development,
//     phase: {
//       id: "1",
//       name: "Phase 1",
//       startDate: new Date(),
//       endDate: new Date(),
//       // progress: 0,
//       status: "In Progress",
//       type: "type1",

//       // Additional metadata
//       _id: "abc123",
//       title: "Snapshot Title",
//       description: "Detailed description",
//       subPhases: [
//         {
//           id: "1",
//           name: "Subphase 1",
//           startDate: new Date(),
//           endDate: new Date(),
//           status: "In Progress",
//           type: "type1",
//           description: "",
//           duration: 0,
//           subPhases: [],
//           component: {} as FC<{}>,
//         },
//       ],
//       tags: {
//         "1": {
//           id: "1",
//           name: "Tag 1",
//           color: "red",
//           description: "Tag 1 description",
//           relatedTags: [],
//           isActive: true,
//         },
//       },
//     },
//     ownerId: "Owner123",
//     store: null,
//     state: null,
//     initialState: null,

//     setSnapshotData(
//       snapshotStore: SnapshotStore<BaseData, Meta, BaseData>,
//       data: Map<string, Snapshot<Data, any>>,
//       subscribers: Subscriber<any, any>[],
//       snapshotData: Partial<SnapshotStoreConfig<BaseData, Meta, BaseData>>,
//       id?: string
//     ): Map<string, Snapshot<T, Meta, K>> {
//       // If the config array already exists, update it with the new snapshotData
//       if (this.configs) {
//         this.configs.forEach((config) => {
//           Object.assign(config, snapshotData);
//         });
//       } else {
//         // If no config array exists, create a new one with the provided snapshotData
//         this.configs = [
//           {
//             ...snapshotData,
//             id: snapshotData.id,
//             subscribers: subscribers as Subscriber<BaseData, Meta, BaseData>[], // Ensure correct type
//           } as SnapshotStoreConfig<BaseData, Meta, BaseData>,
//         ];
//       }

//       // Return the updated data
//       return data;
//     },

//     // Additional metadata
//     // _id: "abc123",
//     // title: "Snapshot Title",

//     tags: {
//       tag1: {
//         id: "1",
//         name: "Tag 1",
//         color: "red",
//         description: "Tag 1 description",
//         relatedTags: [],
//         isActive: true,
//       },
//     },
//     topic: "Topic",
//     priority: PriorityTypeEnum.High,
//     key: "unique-key",
//     subscription: {
//       unsubscribe: unsubscribe,
//       portfolioUpdates: portfolioUpdates,
//       tradeExecutions: getTradeExecutions,
//       marketUpdates: getMarketUpdates,
//       triggerIncentives: triggerIncentives,
//       communityEngagement: getCommunityEngagement,
//       portfolioUpdatesLastUpdated: {
//         value: new Date(),
//         isModified: false,
//       } as ModifiedDate,
//       determineCategory: (snapshotCategory: any) => {
//         return snapshotCategory;
//       },
//       // id: "sub123",
//       name: "Subscriber 1",
//       subscriberId: "sub123",
//       subscriberType: SubscriberTypeEnum.FREE,
//       // subscriberName: "User 1",
//       // subscriberEmail: "user1@example.com",
//       // subscriberPhone: "123-456-7890",
//       // subscriberStatus: "active",
//       // subscriberRole: "admin",
//       // subscriberCreatedAt: new Date(),
//       // subscriberUpdatedAt: new Date(),
//       // subscriberLastSeenAt: new Date(),
//       // subscriberLastActivityAt: new Date(),
//       // subscriberLastLoginAt: new Date(),
//       // subscriberLastLogoutAt: new Date(),
//       // subscriberLastPasswordChangeAt: new Date(),
//       // subscriberLastPasswordResetAt: new Date(),
//       // subscriberLastPasswordResetToken: "random-token",
//       // subscriberLastPasswordResetTokenExpiresAt: new Date(),
//       // subscriberLastPasswordResetTokenCreatedAt: new Date(),
//       // subscriberLastPasswordResetTokenCreatedBy: "user123",
//     },
//     config: Promise.resolve(null),
//     metadata: {
//       /* additional metadata */
//     },
//     isCompressed: true,
//     isEncrypted: false,
//     isSigned: true,
//     expirationDate: new Date(),
//     auditTrail: [
//       {
//         userId: "user123",
//         timestamp: new Date(),
//         action: "update",
//         details: "Snapshot updated",
//       },
//     ],
//     subscribers: [subscriber],
//     value: 50,
//     todoSnapshotId: "todo123",
//     // then: (callback: (newData: Snapshot<Data, Meta, Data>) => void) => {
//     //   /* implementation */
//     // },
//   },
// ];

// // Example initial state
// const initialState: InitializedState<Data, Meta, BaseData> = {};

// // const snapshot: Snapshot<Data, Meta, Data> = {
// //   id: "",
// //   category: category,
// //   timestamp: new Date(),
// //   createdBy: "",
// //   description: "",
// //   tags: {},
// //   metadata: {},
// //   data: new Map<string, Snapshot<T, Meta, K>>(),
// //   initialState: initializeState(initialState),
// //   events: {
// //     eventRecords: {},
// //     subscribers: [], // Assuming this is correctly typed elsewhere
// //     eventIds: [],
// //     callbacks: {
// //       snapshotAdded: [
// //         (snapshot: Snapshot<T, Meta, K>) => {
// //           console.log("Snapshot added:", snapshot);
// //         },
// //       ],
// //       snapshotRemoved: [
// //         (snapshot: Snapshot<T, Meta, K>) => {
// //           console.log("Snapshot removed:", snapshot);
// //         },
// //       ],
// //       // Add more event keys and their corresponding callback arrays as needed
// //     } as Record<string, ((snapshot: Snapshot<T, Meta, K>) => void)[]>, // Ensure the correct type

// //     // Method to handle snapshot added event
// //     onSnapshotAdded: function (
// //       event: string,
// //       snapshot: Snapshot<T, Meta, K>,
// //       snapshotId: string,
// //       subscribers: SubscriberCollection<T, Meta, K>,
// //       snapshotStore: SnapshotStore<T, Meta, K>,
// //       dataItems: RealtimeDataItem[],
// //       subscriberId: string,
// //       criteria: SnapshotWithCriteria<T, Meta, K>,
// //       category: Category
// //     ) {
// //       // const snapshotId = getSnapshotId(criteria)
// //       this.emit(
// //         "snapshotAdded",
// //         snapshot,
// //         String(snapshotId),
// //         subscribers,
// //         snapshotStore,
// //         dataItems,
// //         criteria,
// //         category
// //       );
// //     },

// //     // Method to handle snapshot removed event
// //     onSnapshotRemoved: function (
// //       event: string,
// //       snapshot: Snapshot<T, Meta, K>,
// //       snapshotId: string,
// //       subscribers: SubscriberCollection<T, Meta, K>,
// //       snapshotStore: SnapshotStore<T, Meta, K>,
// //       dataItems: RealtimeDataItem[],
// //       criteria: SnapshotWithCriteria<T, Meta, K>,
// //       category: Category
// //     ) {
// //       this.emit("snapshotRemoved",
// //       snapshot,
// //         String(snapshotId),
// //         subscribers,
// //         snapshotStore,
// //         dataItems,
// //         criteria,
// //         category);
// //     },

// //     // Method to handle snapshot updated event
// //     onSnapshotUpdated: function(
// //       snapshotId: string,
// //       data: Map<string, Snapshot<T, Meta, K>>,
// //       events: Record<string, CalendarManagerStoreClass<T, Meta, K>[]>,
// //       snapshotStore: SnapshotStore<T, Meta, K>,
// //       dataItems: RealtimeDataItem[],
// //       newData: Snapshot<T, Meta, K>,
// //       payload: UpdateSnapshotPayload<T>,
// //       store: SnapshotStore<any, Meta, K>
// //     ) {
// //       console.log("Snapshot updated:", {
// //         snapshotId,
// //         data,
// //         events,
// //         snapshotStore,
// //         dataItems,
// //         newData,
// //         payload,
// //         store,
// //       });
// //     },

// //     // Method to subscribe to an event
// //     on: function(event: string, callback: (snapshot: Snapshot<T, Meta, K>) => void) {
// //       if (!this.callbacks[event]) {
// //         this.callbacks[event] = [];
// //       }
// //       this.callbacks[event].push(callback);
// //     },

// //     // Method to unsubscribe from an event
// //     off: function(event: string, callback: (snapshot: Snapshot<T, Meta, K>) => void) {
// //       if (this.callbacks[event]) {
// //         this.callbacks[event] = this.callbacks[event].filter(cb => cb !== callback);
// //       }
// //     },

// //     // Method to emit (trigger) an event
// //     emit: function(event: string, snapshot: Snapshot<T, Meta, K>) {
// //       if (this.callbacks[event]) {
// //         this.callbacks[event].forEach(callback => callback(snapshot));
// //       }
// //     },

// //     // Method to subscribe to an event once
// //     once: function(event: string, callback: (snapshot: Snapshot<T, Meta, K>) => void) {
// //       const onceCallback = (snapshot: Snapshot<T, Meta, K>) => {
// //         callback(snapshot);
// //         this.off(event, onceCallback);
// //       };
// //       this.on(event, onceCallback);
// //     },
// //     addRecord: function(
// //       event: string,
// //       record: CalendarManagerStoreClass<T, Meta, K>,
// //       callback: (snapshot: CalendarManagerStoreClass<T, Meta, K>) => void
// //     ) {
// //       // Ensure eventRecords is not null
// //       if (this.eventRecords === null) {
// //         this.eventRecords = {}; // Initialize eventRecords if it is null
// //       }

// //       if (!this.eventRecords[event]) {
// //         this.eventRecords[event] = [];
// //       }

// //       this.eventRecords[event].push(record);
// //       callback(record);
// //     },

// //     // Method to remove all event listeners
// //     removeAllListeners: function(event?: string) {
// //       if (event) {
// //         delete this.callbacks[event];
// //       } else {
// //         this.callbacks = {} as Record<string, ((snapshot: Snapshot<T, Meta, K>) => void)[]>;
// //       }
// //     },

// //     // Method to subscribe to an event (alias for on)
// //     subscribe: function(event: string, callback: (snapshot: Snapshot<T, Meta, K>) => void) {
// //       this.on(event, callback);
// //     },

// //     // Method to unsubscribe from an event (alias for off)
// //     unsubscribe: function(event: string, callback: (snapshot: Snapshot<T, Meta, K>) => void) {
// //       this.off(event, callback);
// //     },

// //     // Method to trigger an event (alias for emit)
// //     trigger: function (
// //       event: string,
// //       snapshot: Snapshot<T, Meta, K>,
// //       snapshotId: string,
// //       subscribers: SubscriberCollection<T, Meta, K>
// //     ) {
// //       this.emit(event, snapshot, snapshotId, subscribers);
// //     },
// //   },
// //   meta: {} as Map<string, Snapshot<T, Meta, K>>,

// // }


