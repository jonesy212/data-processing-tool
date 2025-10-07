import { getSnapshotId } from "@/app/api/SnapshotApi";
import { CombinedEvents } from "@/app/hooks/useSnapshotManager";
import { Category } from "@/app/libraries/categories/generateCategoryProperties";
import { BaseData, Data, DataDetails } from '@/app/models/data/Data';
import { StatusType } from "@/app/models/data/StatusType";
import { CategoryProperties } from "@/app/pages/personas/ScenarioBuilder";
import { DataStore, InitializedState } from "@/app/projects/DataAnalysisPhase/DataProcessing/DataStore";
import { DataStoreMethods } from "@/app/projects/DataAnalysisPhase/DataProcessing/DataStoreMethods";
import { CustomSnapshotData, InitializedConfig, snapshot, SnapshotContainer, SnapshotData, SnapshotDataType, SnapshotStoreConfig, SnapshotStoreProps, SnapshotWithCriteria } from '@/app/snapshots';
import { CoreSnapshot, Snapshot, Snapshots, SnapshotsArray, SnapshotsObject, SnapshotUnion } from "@/app/snapshots/LocalStorageSnapshotStore";
import { SnapshotConfig } from "@/app/snapshots/SnapshotConfig";
import { default as SnapshotStore } from "@/app/snapshots/SnapshotStore";
import { InitializedData } from '@/app/snapshots/SnapshotStoreOptions';
import { createSnapshotStoreOptions } from '@/app/snapshots/createSnapshotStoreOptions';
import { Subscriber } from '@/app/subscribers/Subscriber';
import { StructuredMetadata } from "@/config/StructuredMetadata";
import { UnifiedMetadata } from "@/server/database/MetaDataOptions";
import { useContext } from "react";

import { CalendarEvent } from "@/app/calendar/CalendarEvent";
import { SnapshotContext } from "@/app/context/SnapshotContext";
import { SnapshotContent } from "@/app/snapshots/SnapshotContent";
import { convertBaseDataToK } from "@/app/snapshots/convertSnapshot";
import {
  Callback
} from "@/app/snapshots/subscribeToSnapshotsImplementation";
import { generateSnapshotId, isSnapshot } from "@/app/utils/snapshotUtils";


import { T } from "@/app/models/data/dataStoreMethods";

import { additionalHeaders } from "@/app/api/headers/generateAllHeaders";
import { CriteriaType } from "@/app/pages/searchs/CriteriaType";
import { ExcludedFields } from "@/app/routing/Fields";
import { SchemaField } from "@/app/server/database/SchemaField";
import { createSnapshotStoreConfig } from "@/app/snapshots/snapshotStoreConfigInstance";
import { ExtendedVersionData } from "@/app/versions/VersionData";
import { Subscription } from "react-redux";
import { YourResponseType } from "./types";



// Define YourSpecificSnapshotTywpe implementing Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
class YourSpecificSnapshotType <
  T extends BaseDataEntity = BaseDataRoot,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>
  implements Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  id: string;
  mappedData: Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>;
  data: InitializedData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined;
  meta: StructuredMetadata<T, K>
  events: CombinedEvents<T, K>
  
  // Additional required properties from Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  dataObject: any = {};
  deleted: boolean = false;
  initialState: InitializedState<T, K> | {} = {};
  isCore: boolean = false;
  initialConfig: InitializedConfig | {} = {};
  properties?: T | K;
  snapshotsArray?: SnapshotsArray<T, K, StructuredMetadata<T, K>>;
  snapshotsObject?: SnapshotsObject<T, K>;
  recentActivity?: { action: string; timestamp: Date }[];
  onInitialize: (callback: () => void) => void = () => {};
  onError: any = null;
  categories?: Category[];
  taskIdToAssign: string | undefined;
  schema: string | Record<string, SchemaField> = {};
  currentCategory: Category = {
    id: "", name: "", 
    description: "",
    properties: {} as CategoryProperties,
    relationships: {},
    icon: "",
    color: "",
    type: "category",

    // iconColor: "",
    // isActive: false,
    // isPublic: false,
    // isSystem: false,
    // isDefault: false,
   };
  mappedSnapshotData: Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> | undefined;
  storeId: number = 0;
  versionInfo: ExtendedVersionData | null = null;
  initializedState: InitializedState<T, K> | {} = {};
  criteria: CriteriaType | undefined;
  relationships?: Map<string, K>;
  storeConfig?: SnapshotStoreConfig<T, K>;
  additionalData?: CustomSnapshotData<T>;
  dataStores?: DataStore<T, K, StructuredMetadata<T, K>>[];
  snapshotStoreConfig?: SnapshotStoreConfig<T, any> | null;
  snapshotStoreConfigSearch?: SnapshotStoreConfig<SnapshotWithCriteria<any, BaseData>, SnapshotWithCriteria<any, BaseData>> | null;
  snapshotContainer: SnapshotContainer<T, K> | undefined | null;

  constructor(
    id: string,
    mappedData: Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
    data: InitializedData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined,
    meta: Meta,
    events?: CombinedEvents<T, K>) {
    this.id = id;
    this.data = data;
    this.meta = meta;
    this.mappedData = mappedData
    this.events = {
      callbacks: events?.callbacks ?? ((snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => {
        console.log("callback called");
        return { snapshots: [snapshot] }
      }),
      eventRecords: events?.eventRecords ?? {},
      subscribers: events?.subscribers ?? [],
      eventIds: events?.eventIds ?? [],
      on: events?.on ?? (() => { }),
      off: events?.off ?? (() => { }),
      eventsDetails: events?.eventsDetails
    };
  }

  // Implement methods required by Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  getId(): string {
    return this.id;
  }

  setData(id: string, data: Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>): void {
    this.data = data;
    // Additional logic if necessary
  }

  snapshot(
    id: string | number | undefined,
    snapshotData: SnapshotData<T, K>,
    category: Category | undefined,    categoryProperties: CategoryProperties | undefined,
    callback: (snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void,
    dataStore: DataStore<T, K>,
    dataStoreMethods: DataStoreMethods<T, K>,
    metadata: UnifiedMetadata<T, K, Meta, ExcludedFields>,
    subscriberId: string,
    endpointCategory: string | number,
    storeProps: SnapshotStoreProps<T, K>,
    snapshotConfigData: SnapshotConfig<T, K>,
    subscription: Subscription<T, K>,
    snapshotId?: string | number | null,
    snapshotStoreConfigData?: SnapshotStoreConfig<T, K>,
    snapshotContainer?: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null
  ): Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | Promise<{ snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> }> {
    // Placeholder implementation
    return Promise.resolve({ snapshot: this });
  }

  setCategory(category: symbol | string | Category | undefined): void {
    // Placeholder implementation
  }

  applyStoreConfig(
    snapshotStoreConfig: SnapshotStoreConfig<T, K, StructuredMetadata<T, K>, never> | undefined
  ): void {
    // Placeholder implementation
  }

  generateId(
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
  ): string {
    // Placeholder implementation
    return `${prefix}-${name}-${type}`;
  }

  
}



function flatMapImplementation<T extends  BaseData<any>, K extends Data, U extends Iterable<any>>(
  array: SnapshotStoreConfig<T, K>[],
  callback: (value: SnapshotStoreConfig<T, K>, index: number, array: SnapshotStoreConfig<T, K>[]) => U
): U extends Iterable<infer I> ? I[] : never {
  const result: any[] = [];
  array.forEach((value, index) => {
    const callbackResult = callback(value, index, array);
    for (const item of callbackResult as any) {
      result.push(item);
    }
  });
  return result as U extends Iterable<infer I> ? I[] : never;
}


// Create specific snapshot with SampleSnapshot
const specificSnapshot = new YourSpecificSnapshotType<T, BaseData>(
  "123",
  new Map([
    ["key", new SampleSnapshot("keyId", new Map(), new Map(), {})],
  ]),
  new Map()
);

// Update data
specificSnapshot.setData(
  new Map([
    ["updatedKey", new SampleSnapshot("updatedId", new Map(), new Map(), {})],
  ])
);

console.log(specificSnapshot.getId()); // Output: '123'
console.log(specificSnapshot.data); // Output: 'updated snapshot data'




// Example function to map SnapshotStoreConfig to DataStore
const convertToDataStore = <
  T extends BaseDataEntity = BaseDataRoot,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  config: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]
): Promise<DataStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]> => {
  return Promise.resolve(
    config.map(c => ({
    // Snapshot mapping methods
    mapSnapshot: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => snapshot,
    mapSnapshots: (snapshots: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]) => snapshots,
    mapSnapshotStore: (store: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => store,

    // Core properties
    id: c.id ?? undefined,
    data: c.data,
    snapshots: c.snapshots,
    state: c.state,
    snapshotId: c.snapshotId,
    set: c.set,
    configOption: c.configOption,
    initialState: c.initialState,
    snapshotStore: c.snapshotStore,
    snapshotItems: c.getSnapshotItems,
    nestedStores: c.getNestedStores,
    events: c.events,
    dataItems: c.dataItems,
    newData: c.newData,
    stores: c.stores,
    snapshotStoreConfig: c.snapshotStoreConfig,
    snapshotIds: c.snapshotIds,

    // Methods for handling data
    getSnapshotItems: c.getSnapshotItems,
    dataStoreMethods: c.dataStoreMethods,
    transformSubscriber: c.transformSubscriber,
    transformDelegate: c.transformDelegate,

    // Data manipulation methods
    addSnapshotItem: c.addSnapshotItem,
    delegate: c.delegate,
    getData: c.getData,
    dataStore: c.dataStore,

    // Metadata and default methods
    metadata: {},
    addData: () => { },
    getStoreData: () => null,
    getItem: () => null,
    setItem: () => { },
    removeItem: () => { },
    clear: () => { },
    keys: () => [],
    values: () => [],
    entries: () => [],
    forEach: () => { },
    size: 0,
    has: () => false,
    delete: () => false,
    get: () => null,
    set: () => ({} as DataStore<T, K>),
    getAll: () => [],
    setAll: () => { },
    removeAll: () => { },
    clearAll: () => { },
    keysAll: () => [],
    valuesAll: () => [],
    entriesAll: () => [],
    forEachAll: () => { },
    sizeAll: 0,
    hasAll: () => false,
    deleteAll: () => false,
    getDataStore: () => ({} as DataStore<T, K>),
    setDataStore: () => { },

    // Data update and management methods
    removeData: () => {},
    updateData: () => {},
    updateStoreData: () => {},
    updateDataTitle: () => {},
    updateDataDescription: () => {},
    addDataStatus: () => {},
    updateDataStatus: () => {},
    addDataSuccess: () => {},
    getDataVersions: () => {},
    updateDataVersions: () => {},
    getBackendVersion: () => {},
    getFrontendVersion: () => {},

    // Snapshot management methods
    determineSnapshotStoreCategory: c.determineSnapshotStoreCategory,
    getDataWithSearchCriteria: c.getDataWithSearchCriteria,
    initializedState: c.initializedState,
    getAllData: c.getAllData,
    getAllKeys: c.getAllKeys,
    fetchData: c.fetchData,
    defaultSubscribeToSnapshot: c.defaultSubscribeToSnapshot,
    handleSubscribeToSnapshot: c.handleSubscribeToSnapshot,
    getAllItems: c.getAllItems,
    getDelegate: c.getDelegate,
    updateDelegate: c.updateDelegate,
    getSnapshot: c.getSnapshot,
    getSnapshotWithCriteria: c.getSnapshotWithCriteria,
    getSnapshotContainer: c.getSnapshotContainer,
    getSnapshotVersions: c.getSnapshotVersions,
    getSnapshotWithCriteriaVersions: c.getSnapshotWithCriteriaVersions,
    dataStoreConfig: c.dataStoreConfig,
    config: c.config,

    // Subscribers and retrieval methods
    getSubscribers: c.getSubscribers,
    getSnapshotByKey: c.getSnapshotByKey,
    getSuubscribers: c.getSuubscribers,



    }))
  );
};




function convertToSnapshotStoreConfig <  
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
): SnapshotStoreConfig<T, any> {
  const mappedSnapshots: Snapshots<T, K> =
    snapshotStore.snapshots.map((s: Snapshot<T, any>) => ({
      ...s,
      ...snapshotStore,
      snapshotId: s.snapshotId || '',
      set: s.set || new Set(),
      snapshots: s.snapshots || [],
      schema: s.schema,  
      config: s.config || {},
      items: s.items || [],
      snapshotItems: s.snapshotItems || [],
      configOption: s.configOption || {},
      initialState: s.initialState || null,
      nestedStores: s.nestedStores || [],
      events: s.events || [],
      snapshotStore: s.snapshotStore || null,
      dataItems: s.dataItems || [],
      newData: s.newData,
      stores: s.stores || [],
      snapshotStoreConfig: s.snapshotStoreConfig || null,
      getSnapshotItems: s.getSnapshotItems || [],
      snapshotIds: s.snapshotIds || [],
      dataStoreMethods: s.dataStoreMethods || null,
      transformSubscriber: s.transformSubscriber || null,
      transformDelegate: s.transformDelegate || null,
      addSnapshotItem: s.addSnapshotItem || null,
      delegate: s.delegate || [],
      getData: s.getData || (() => null),
      dataStore: s.dataStore,
      set: s.set,
      // Add other required properties here
    }));

  const mappedState: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] | null = snapshotStore.state
    ? snapshotStore.state.map((
      snapshot: SnapshotUnion<T, K, Meta>
    ) => ({
      ...snapshot,
      store: snapshot.store
        ? convertToSnapshotStoreConfig(snapshot.store)
        : undefined,
      set: snapshot.set || new Set(),
      snapshots: snapshot.snapshots || [],
      snapshotItems: snapshot.snapshotItems || [],
      configOption: snapshot.configOption || {},
      date: snapshot.date || null,
      message: snapshot.message || '',
      createdBy: snapshot.createdBy || '',
      type: snapshot.type || '',
    }))
    : null;

  function isSubscriber <T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(
    obj: any
  ): obj is Subscriber<T, K> {
    return (
      obj &&
      typeof obj === "object" &&
      "getId" in obj &&
      "_id" in obj &&
      "name" in obj &&
      "subscription" in obj
    );
  }

  const mappedSubscribers: Subscriber<BaseData, any>[] =
    snapshotStore.subscribers.map((s) => {
      if (isSubscriber<BaseData, any>(s)) {
        return {
          ...s,
          getId: s.getId,
          name: s.getName(),
          _id: s.getId(),
          subscriberId: s.getSubscriberId(),
          subscription: s.getSubscription(),
          subscribers: s.getSubscribers ? s.getSubscribers : [],
          onSnapshotCallbacks: s.getOnSnapshotCallbacks ? s.getOnSnapshotCallbacks : [],
          onErrorCallbacks: s.getOnErrorCallbacks ? s.getOnErrorCallbacks : [],
          onUnsubscribeCallbacks: s.getOnUnsubscribeCallbacks ? s.getOnUnsubscribeCallbacks : [],
          notifyEventSystem: s.getNotifyEventSystem ? s.getNotifyEventSystem() : () => { },
          updateProjectState: s.getUpdateProjectState ? s.getUpdateProjectState() : () => { },
          logActivity: s.getLogActivity ? s.getLogActivity() : () => { },
          triggerIncentives: s.getTriggerIncentives ? s.getTriggerIncentives() : () => { },
          newData: s.getNewData ? s.getNewData() : null,
          defaultSubscribeToSnapshots: s.getDefaultSubscribeToSnapshots ? s.getDefaultSubscribeToSnapshots : () => { },
          subscribeToSnapshots: s.getSubscribeToSnapshots ? s.getSubscribeToSnapshots() : () => { },
          transformSubscriber: s.getTransformSubscriber ? s.getTransformSubscriber() : () => { },
          optionalData: s.getOptionalData ? s.getOptionalData() : null,
          email: s.getEmail ? s.getEmail() : '',
          snapshotIds: s.getSnapshotIds ? s.getSnapshotIds() : [],
          payload: s.getPayload ? s.getPayload : {},
          fetchSnapshotIds: s.getFetchSnapshotIds ? s.getFetchSnapshotIds() : () => Promise.resolve([]),
          id: s.id || '',
          getEmail: s.getEmail || (() => ''),
          getOptionalData: s.getOptionalData || (() => null),
          getFetchSnapshotIds: s.getFetchSnapshotIds || (() => Promise.resolve([])),
          getSnapshotIds: s.getSnapshotIds || (() => []),
          getNotifyEventSystem: s.getNotifyEventSystem || (() => { }),
          getUpdateProjectState: s.getUpdateProjectState || (() => { }),
          getLogActivity: s.getLogActivity || (() => { }),
          getTriggerIncentives: s.getTriggerIncentives || (() => { }),
          getName: s.getName || (() => ''),
          snapshots: s.snapshots || [],
          determineCategory: s.getDetermineCategory ? s.getDetermineCategory : () => '',
          getSubscriberId: s.getSubscriberId || (() => ''),
          subscribersById: s.getSubscribersById ? s.getSubscribersById() : {},
          getSubscribers: s.getSubscribers || (() => []),
          setSubscribers: s.setSubscribers || (() => { }),
          getOnSnapshotCallbacks: s.getOnSnapshotCallbacks || (() => []),
          setOnSnapshotCallbacks: s.setOnSnapshotCallbacks || (() => { }),
          getOnErrorCallbacks: s.getOnErrorCallbacks || (() => []),
          setOnErrorCallbacks: s.setOnErrorCallbacks || (() => { }),
          getOnUnsubscribeCallbacks: s.getOnUnsubscribeCallbacks || (() => []),
          setOnUnsubscribeCallbacks: s.setOnUnsubscribeCallbacks || (() => { }),
          setNotifyEventSystem: s.setNotifyEventSystem || (() => { }),
          setUpdateProjectState: s.setUpdateProjectState || (() => { }),
          setLogActivity: s.setLogActivity || (() => { }),
          setTriggerIncentives: s.setTriggerIncentives || (() => { }),
          setOptionalData: s.setOptionalData || (() => { }),
          setEmail: s.setEmail || (() => { }),
          setSnapshotIds: s.setSnapshotIds || (() => { }),
          getPayload: s.getPayload || (() => ({})),
          handleCallback: s.handleCallback || (() => { }),
          snapshotCallback: s.snapshotCallback || (() => { }),
          subscribe: s.subscribe || (() => { }),
          unsubscribe: s.unsubscribe || (() => { }),
          getData: s.getData || (() => null),
          getDetermineCategory: s.getDetermineCategory || (() => ''),
          initialData: s.initialData || null,
          fetchSnapshotById: s.fetchSnapshotById || (() => Promise.resolve(null)),
          toSnapshotStore: s.toSnapshotStore || (() => null),
          getDeterminedCategory: s.getDeterminedCategory || (() => ''),
          processNotification: s.processNotification || (() => { }),
          receiveSnapshot: s.receiveSnapshot || (() => { }),
          getState: s.getState || (() => null),
          onError: s.onError || (() => { }),
          getSubscribersById: s.getSubscribersById || (() => ({})),
          getSubscribersWithSubscriptionPlan: s.getSubscribersWithSubscriptionPlan || (() => []),
          getSubscription: s.getSubscription || (() => null),
          onUnsubscribe: s.onUnsubscribe || (() => { }),
          onSnapshot: s.onSnapshot || (() => { }),
          onSnapshotError: s.onSnapshotError || (() => { }),
          triggerOnSnapshot: s.triggerOnSnapshot || (() => { }),
          onSnapshotUnsubscribe: s.onSnapshotUnsubscribe || (() => { }),
          getNewData: s.getNewData || (() => null),
          enabled: s.getEnabled || false,
          tags: s.getTags || [],
          transformSubscribers: s.getTransformSubscribers ? s.getTransformSubscribers() : null,
          getTransformSubscribers: s.getTransformSubscribers || (() => null),
          setEvent: s.setEvent,
          getUniqueId: s.getUniqueId || (() => null),
          getEnabled: s.getEnabled || false,
          getTags: s.getTags || null,
          fetchTransformSubscribers: s.fetchTransformSubscribers || (() => null),
        };
      } else {
        throw new Error("Invalid subscriber type");
      }
    }).filter((s): s is Subscriber<T, any> => s !== null);

  return {
    id: snapshotStore.id,
    snapshotId: snapshotStore.snapshotId,
    key: snapshotStore.key,
    priority: snapshotStore.priority,
    topic: snapshotStore.topic,
    status: snapshotStore.status,
    category: snapshotStore.category,
    timestamp: snapshotStore.date,
    state: mappedState,
    snapshots: mappedSnapshots,
    subscribers: mappedSubscribers,
    subscription: snapshotStore.subscription
      ? {
        unsubscribe: snapshotStore.subscription.unsubscribe ?? (() => { }),
        portfolioUpdates:
          snapshotStore.subscription.portfolioUpdates ?? (() => { }),
        tradeExecutions:
          snapshotStore.subscription.tradeExecutions ?? (() => { }),
        marketUpdates: snapshotStore.subscription.marketUpdates ?? (() => { }),
        triggerIncentives:
          snapshotStore.subscription.triggerIncentives ?? (() => { }),
        communityEngagement:
          snapshotStore.subscription.communityEngagement ?? (() => { }),
        portfolioUpdatesLastUpdated:
          snapshotStore.subscription.portfolioUpdatesLastUpdated ?? 0,
        determineCategory:
          snapshotStore.subscription.determineCategory ?? (() => { }),
      }
      : null,
    initialState: snapshotStore.initializedState,
    clearSnapshots: snapshotStore.clearSnapshots,
    isCompressed: snapshotStore.isCompressed,
    expirationDate: snapshotStore.expirationDate,
    tags: snapshotStore.tags,
    metadata: snapshotStore.metadata,
    configOption: snapshotStore.configOption,
    setSnapshotData: snapshotStore.setSnapshotData,
  };
}

function convertSnapshotStoreConfig<T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(config: SnapshotStoreConfig<any, any>): SnapshotStoreConfig<T, K> {
  // Implement conversion logic for SnapshotStoreConfig
  // This is a placeholder; adjust according to your actual conversion logic
  return config as SnapshotStoreConfig<T, K>;
}

function convertSnapshotToStore <T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(
  snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
): SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  // Manually convert snapshot to snapshot store
  return {
    snapshotId: snapshot.id,
    conifigOption: {}, // Populate appropriately
    set: snapshot.set,
    snapshots: [], // Initialize or populate
    state: [], // Initialize or populate
    id: "", // Add placeholder values for required properties
    key: "",
    topic: "",
    date: new Date(),
    configOption: snapshot.configOption,
    config: snapshot.config,
    title: snapshot.title || "",
    category: snapshot.category,
    message: snapshot.message,
    timestamp: snapshot.timestamp,
    createdBy: snapshot.createdBy || "",
    type: snapshot.type,
    data: snapshot.data || null,
    subscribers: snapshot.subscribers,
    snapshotConfig: snapshot.snapshotConfig,
    store: snapshot.store,
    dataStore: snapshot.dataStore,
    initialState: snapshot.initialState || {},
    dataStoreMethods: snapshot.dataStoreMethods,
    delegate: snapshot.delegate || undefined,
    subscriberId: snapshot.subscriberId,
    length: snapshot.length,
    content: snapshot.content,
    value: snapshot.value,

    todoSnapshotId: snapshot.todoSnapshotId,
    events: snapshot.events,
    snapshotStore: snapshot.snapshotStore,
    dataItems: snapshot.dataItems || null,

    newData: snapshot.newData,
    defaultSubscribeToSnapshots: snapshot.defaultSubscribeToSnapshots,
    subscribeToSnapshots: snapshot.subscribeToSnapshots,
    transformSubscriber: snapshot.transformedSubscriber,

    transformDelegate: snapshot.transformDelegate,
    initializedState: snapshot.initializedState,
    getAllKeys: snapshot.getAllKeys,
    getAllItems: snapshot.getAllItems,

    addData: snapshot.addData,
    addDataStatus: snapshot.addDataStatus,
    removeData: snapshot.removeData,
    updateData: snapshot.updateData,

    updateDataTitle: snapshot.updateDataTitle,
    updateDataDescription: snapshot.updateDataDescription,
    updateDataStatus: snapshot.updateDataStatus,
    addDataSuccess: snapshot.addDataSuccess,

    getDataVersions: snapshot.getDataVersions,
    updateDataVersions: snapshot.updateDataVersions,
    getBackendVersion: snapshot.getBackendVersion,
    getFrontendVersion: snapshot.getFrontendVersion,

    fetchData: snapshot.fetchData,
    defaultSubscribeToSnapshot: snapshot.defaultSubscribeToSnapshot,
    handleSubscribeToSnapshot: snapshot.handleSubscribeToSnapshot,


    removeItem: snapshot.removeItem,
    getSnapshot: snapshot.getSnapshot,
    getSnapshotSuccess: snapshot.getSnapshotSuccess,
    getSnapshotId: snapshot.getSnapshotId,

    getItem: snapshot.getItem,
    setItem: snapshot.setItem,
    addSnapshotFailure: snapshot.addSnapshotFailure,
    getDataStore: snapshot.getDataStore,

    addSnapshotSuccess: snapshot.addSnapshotSuccess,
    compareSnapshotState: snapshot.compareSnapshotState,
    deepCompare: snapshot.deepCompare,
    shallowCompare: snapshot.shallowCompare,

    getDataStoreMethods: snapshot.getDataStoreMethods,
    getDelegate: snapshot.getDelegate,
    determineCategory: snapshot.determineCategory,
    determinePrefix: snapshot.determinePrefix,

    updateSnapshot: snapshot.updateSnapshot,
    updateSnapshotSuccess: snapshot.updateSnapshotSuccess,
    updateSnapshotFailure: snapshot.updateSnapshotFailure,
    removeSnapshot: snapshot.removeSnapshot,

    snapshotItems: snapshot.snapshotItems,
    snapshotItems: snapshot.snapshotItems.nestedStores,
    nestedStores: snapshot.nestedStores,
    addSnapshotItem: snapshot.addSnapshotItem,
    addNestedStore: snapshot.addNestedStore,
    getData: snapshot.getData,
    getData: snapshot.getData,
    clearSnapshots: snapshot.clearSnapshots,
    addSnapshot: snapshot.addSnapshot,
    createSnapshot: snapshot.createSnapshot,
    snapshotStoreConfig: snapshot.snapshotStoreConfig,
    meta: snapshot.meta,
    getSnapshotItems: snapshot.getSnapshotItems,
    createInitSnapshot: snapshot.createInitSnapshot,

    createSnapshotSuccess: snapshot.createSnapshotSuccess,
    setSnapshotSuccess: snapshot.setSnapshotSuccess,
    setSnapshotFailure: snapshot.setSnapshotFailure,
    createSnapshotFailure: snapshot.createSnapshotFailure,

    updateSnapshots: snapshot.updateSnapshots,
    updateSnapshotsSuccess: snapshot.updateSnapshotsSuccess,
    updateSnapshotsFailure: snapshot.updateSnapshotsFailure,
    initSnapshot: snapshot.initSnapshot,

    takeSnapshot: snapshot.takeSnapshot,
    takeSnapshotSuccess: snapshot.takeSnapshotSuccess,
    takeSnapshotsSuccess: snapshot.takeSnapshotsSuccess,
    configureSnapshotStore: snapshot.configureSnapshotStore,

    flatMap: snapshot.flatMap,
    setData: snapshot.setData,
    getState: snapshot.getState,
    setState: snapshot.setState,

    validateSnapshot: snapshot.validateSnapshot,
    handleSnapshot: snapshot.handleSnapshot,
    handleActions: snapshot.handleActions,
    setSnapshot: snapshot.setSnapshot,

    transformSnapshotConfig: snapshot.transformSnapshotConfig,
    setSnapshotData: snapshot.setSnapshotData,
    setSnapshots: snapshot.setSnapshots,
    clearSnapshot: snapshot.clearSnapshot,

    mergeSnapshots: snapshot.mergeSnapshots,
    reduceSnapshots: snapshot.reduceSnapshots,
    sortSnapshots: snapshot.sortSnapshots,
    filterSnapshots: snapshot.filterSnapshots,

    mapSnapshots: snapshot.mapSnapshots,
    findSnapshot: snapshot.findSnapshot,
    getSubscribers: snapshot.getSubscribers,
    notify: snapshot.notify,

    notifySubscribers: snapshot.notifySubscribers,
    subscribe: snapshot.subscribe,
    unsubscribe: snapshot.unsubscribe,
    fetchSnapshot: snapshot.fetchSnapshot,

    fetchSnapshotSuccess: snapshot.fetchSnapshotSuccess,
    fetchSnapshotFailure: snapshot.fetchSnapshotFailure,
    getSnapshots: snapshot.getSnapshots,
    getAllSnapshots: snapshot.getAllSnapshots,

    generateId: snapshot.generateId,
    batchFetchSnapshots: snapshot.batchFetchSnapshots,
    batchTakeSnapshotsRequest: snapshot.batchTakeSnapshotsRequest,
    batchUpdateSnapshotsRequest: snapshot.batchUpdateSnapshotsRequest,

    filterSnapshotsByStatus: snapshot.filterSnapshotsByStatus,
    filterSnapshotsByCategory: snapshot.filterSnapshotsByCategory,
    filterSnapshotsByTag: snapshot.filterSnapshotsByTag,

    batchFetchSnapshotsSuccess: snapshot.batchFetchSnapshotsSuccess,
    batchFetchSnapshotsFailure: snapshot.batchFetchSnapshotsFailure,
    batchUpdateSnapshotsSuccess: snapshot.batchUpdateSnapshotsSuccess,
    batchUpdateSnapshotsFailure: snapshot.batchUpdateSnapshotsFailure,

    batchTakeSnapshot: snapshot.batchTakeSnapshot,
    handleSnapshotSuccess: snapshot.handleSnapshotSuccess,

    [Symbol.iterator]: () => {
      return {
        next: () => {
          return {
            value: snapshot,
            done: false,
          };
        },
      };
      // other properties from SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
    }
  }
}

const convertSnapshotStoreToSnapshot = <T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(
  store: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
): Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> => {
  const snapshotStoreConfig = store.getConfig();

  return {
    id: store.id,
    title: store.title,
    timestamp: store.timestamp,
    subscriberId: store.subscriberId,
    category: store.category,
    length: store.length,
    content: store.content,
    data: store.data,
    value: store.value,
    key: store.key,
    subscription: store.subscription,
    config: snapshotStoreConfig,
    status: store.status,
    metadata: store.metadata,
    delegate: store.getDelegate({
      useSimulatedDataSource: false,
      simulatedDataSource: []
    }),
    store: store,
    state: store.state,
    todoSnapshotId: store.todoSnapshotId,
    // initialState: store.initializedState,
    meta: store.meta,
    configOption: store.configOption,
    getSnapshotId,
    getParentId: () =>  store.id ? store.id.toString(): undefined, // Convert to string
    getChildIds: () => [], // Example implementation
    addChild: () => { }, // Example implementation
    removeChild: () => { }, // Example implementation
    getChildren: (id: string, childSnapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => { 
      return []
    },
    hasChildren: () => false,
    isDescendantOf: (childId: string, 
      parentId: string, 
      parentSnapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, 
      childSnapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => false,
    dataItems: [],
    compareSnapshotState: store.compareSnapshotState,
    eventRecords: store.eventRecords,
    snapshotStore: store.snapshotStore,
    newData: store.newData,
    stores: store.stores,
    getStore: store.getStore,
    addStore: store.addStore,
    mapSnapshot: store.mapSnapshot,
    removeStore: store.removeStore,
    unsubscribe: store.unsubscribe,
    fetchSnapshot: store.fetchSnapshot,
    addSnapshotFailure: store.addSnapshotFailure,
    configureSnapshotStore: store.configureSnapshotStore,
    updateSnapshotSuccess: store.updateSnapshotSuccess,
    createSnapshotFailure: store.createSnapshotFailure,
    createSnapshotSuccess: store.createSnapshotSuccess,
    updateSnapshotFailure: store.updateSnapshotFailure,
    createSnapshot: store.createSnapshot,
    onSnapshot: store.onSnapshot,
    onSnapshots: store.onSnapshots,
    events: store.events,
    handleSnapshot: store.handleSnapshot,
    updateSnapshot: store.updateSnapshot,
    setSnapshot: store.setSnapshot,
    setSnapshotData: store.setSnapshotData,
    setSnapshotSuccess: store.setSnapshotSuccess,
    setSnapshotFailure: store.setSnapshotFailure,
    createSnapshotFailure: store.createSnapshotFailure,
    createSnapshotSuccess: store.createSnapshotSuccess,
    updateSnapshotFailure: store.updateSnapshotFailure,
    updateSnapshotSuccess: store.updateSnapshotSuccess,
    fetchSnapshotSuccess: store.fetchSnapshotSuccess,
    fetchSnapshotFailure: store.fetchSnapshotFailure,
    getSnapshot: store.getSnapshot,
    getSnapshotData: store.getSnapshotData,
    getSnapshotState: store.getSnapshotState,
    getSnapshotStatus: store.getSnapshotStatus,
    getSnapshotMetadata: store.getSnapshotMetadata,
    getSnapshotDelegate: store.getSnapshotDelegate,
    getSnapshotStore: store.getSnapshotStore,
    getSnapshotStoreConfig: store.getSnapshotStoreConfig,
    getSnapshotStoreConfigData: store.getSnapshotStoreConfigData,

  }
};

// Export the specific snapshot type if needed
export { YourSpecificSnapshotType };

const convertSnapshotData =  <T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(
  snapshotConfigData: SnapshotDataType<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> 
): SnapshotDataType<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> => {
  return snapshotConfigData
};


function convertToDataSnapshot <T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(
  snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
): Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  return {
    ...snapshot,
    data: snapshot.data as unknown as Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
    content: snapshot.content as unknown as SnapshotContent<T, K>,
    mappedSnapshotData: new Map(Object.entries(snapshot.mappedSnapshotData).map(([key, value]) => [key, value as Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>])),
    snapshot: (
      id: string | number | undefined,
      snapshotId: number,
      snapshotData: SnapshotData<T, K>,
      category: Category | undefined,      categoryProperties: CategoryProperties | undefined,
      callback: (snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void,
      dataStore: DataStore<T, K>,
      dataStoreMethods: DataStoreMethods<T, K>,
      metadata: UnifiedMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      subscriberId: string, // Add subscriberId here
      endpointCategory: string | number, // Add endpointCategory here
      storeProps: SnapshotStoreProps<T, K>,
      snapshotConfigData: SnapshotConfig<T, K>,
      subscription: Subscription,
  
      snapshotStoreConfigData?: SnapshotStoreConfig<T, K>,
      snapshotContainer?: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null
    ) => {
      return new Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>(async (resolve, reject) => {
        try {
          const result = await snapshot.snapshot(
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
            snapshotStoreConfigData,
            snapshotContainer,
          );
          resolve(result as unknown as Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>);
        } catch (error) {
          reject(error);
        }
      });
    }
  } as unknown as Snapshot<T, K, Meta>;
}





const convertSnapshoStoretData =  <T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(
  snapshotStoreConfigData: SnapshotStoreConfig<any, K>
): SnapshotStoreConfig<any, K> => {
  return snapshotStoreConfigData
};


const snapshotType =  <T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(
  snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
): Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> => {
  const defaultCategory: Category = "defaultCategory";
  const newSnapshot = { ...snapshot }
  newSnapshot.id = snapshot.id || generateSnapshotId;
  newSnapshot.title = snapshot.title || "";
  newSnapshot.timestamp = snapshot.timestamp
    ? new Date(snapshot.timestamp)
    : new Date();
  newSnapshot.subscriberId = snapshot.subscriberId || "";
   // Handle category assignment
   if (typeof snapshot.category === "string" || typeof snapshot.category === "symbol") {
    newSnapshot.category = snapshot.category as Category;
  } else if (snapshot.category && typeof snapshot.category === "object") {
    // Ensure snapshot.category matches CategoryProperties type if it's an object
    newSnapshot.category = snapshot.category as Category;
  } else {
    // Ensure defaultCategory is a valid Category
    newSnapshot.category = defaultCategory as Category;
  }
  newSnapshot.length = snapshot.length || 0;
  newSnapshot.content = snapshot.content || "";
  newSnapshot.data = snapshot.data;
  newSnapshot.value = snapshot.value || 0;
  newSnapshot.key = snapshot.key || "";
  newSnapshot.subscription = snapshot.subscription || null;
  newSnapshot.config = snapshot.config || null;
  newSnapshot.status = snapshot.status || undefined;
  newSnapshot.metadata = snapshot.metadata || {};
  newSnapshot.delegate = snapshot.delegate
    ? snapshot.delegate.map((delegateConfig) => ({
      ...delegateConfig,
      data: delegateConfig.data,
      snapshotStore: delegateConfig.snapshotStore
    }))
    : [];
  newSnapshot.store = snapshot.store
  newSnapshot.state = snapshot.state
  newSnapshot.todoSnapshotId = snapshot.todoSnapshotId || "";
  newSnapshot.initialState = snapshot.initialState;
  return newSnapshot;
};


const snapshotStoreType = async <T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(
  snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
): Promise<SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> => {
  const defaultCategory: Category = "defaultCategory";
  const context = useContext(SnapshotContext);
  const newSnapshotStore = { ...snapshotStore };
  
  newSnapshotStore.id = snapshotStore.id || generateSnapshotId();
  newSnapshotStore.title = snapshotStore.title || "";
  newSnapshotStore.timestamp = snapshotStore.timestamp
    ? new Date(snapshotStore.timestamp)
    : new Date();
  newSnapshotStore.subscriberId = snapshotStore.subscriberId || "";
  newSnapshotStore.category =
    typeof snapshotStore.category === "string"
      ? snapshotStore.category
      : defaultCategory;
  newSnapshotStore.length = snapshotStore.length || 0;
  newSnapshotStore.content = snapshotStore.content || "";
  newSnapshotStore.data = snapshotStore.data;
  newSnapshotStore.value = snapshotStore.value || 0;
  newSnapshotStore.key = snapshotStore.key || "";
  newSnapshotStore.subscription = snapshotStore.subscription || null;
  newSnapshotStore.config = snapshotStore.getConfig() || null;
  newSnapshotStore.status = snapshotStore.status || undefined;
  newSnapshotStore.metadata = snapshotStore.metadata || {
    metadataEntries: {}
  };

  // Get delegates if available
  const delegate = await snapshotStore.getDelegate(context);
  newSnapshotStore.delegate = delegate
    ? delegate.map((delegateConfig: any) => ({
        ...delegateConfig,
        data: delegateConfig.data as T,
        snapshotStore: delegateConfig.snapshotStore as SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
      }))
    : [];
  
  // Additional assignments
  newSnapshotStore.store = snapshotStore.store;
  newSnapshotStore.state = snapshotStore.state;
  newSnapshotStore.todoSnapshotId = snapshotStore.todoSnapshotId || "";
  newSnapshotStore.initialState = snapshotStore.initialState;
  newSnapshotStore.safeCastSnapshotStore = snapshotStore.safeCastSnapshotStore(snapshotStore);
  newSnapshotStore.getFirstDelegate = snapshotStore.getFirstDelegate();
  newSnapshotStore.getInitialDelegate = snapshotStore.getInitialDelegate();
  newSnapshotStore.transformInitialState = snapshotStore.transformInitialState();

  return newSnapshotStore;
};


// Type guard to check if input is SnapshotStore<BaseData>
function isSnapshotStore<T extends BaseData, K extends T, Meta extends StructuredMetadata<T, K>>(
  data: any
): data is SnapshotStore<T, K, Meta> {
  return (
    data && 
    (data instanceof SnapshotStore || '#snapshotStores' in data)
  );
}


/**
 * Comprehensive type guard for YourResponseType with debugging support
 * @template T - Base data type
 * @template K - Extended data type (defaults to T)
 * @template Meta - Metadata type (defaults to StructuredMetadata<T, K>)
 * @param data - Unknown data to check
 * @param debug - Enable debug logging (default: false)
 * @returns Type predicate indicating if data is YourResponseType<T, K, Meta>
 */
function isYourResponseType<
  T extends BaseData,
  K extends T = T,
  Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>
>(
  data: unknown,
  debug: boolean = false
): data is YourResponseType<T, K, Meta> {
  // Debug initialization
  if (debug) {
    console.groupCollapsed('[isYourResponseType] Type checking');
    console.log('Input data:', data);
  }

  // 1. Primitive type check
  if (typeof data !== 'object' || data === null) {
    if (debug) {
      console.log('❌ Failed: Not an object');
      console.groupEnd();
    }
    return false;
  }

  // 2. Exclusion of other known types
  if (isSnapshotStore<T, K, Meta>(data) || isSnapshot<T, K, Meta>(data)) {
    if (debug) {
      console.log('❌ Failed: Is Snapshot/SnapshotStore');
      console.groupEnd();
    }
    return false;
  }

  // 3. Core array structure validation
  const dataObj = data as Record<string, unknown>;
  const hasValidArrays = (
    ('calendarEvents' in dataObj && Array.isArray(dataObj.calendarEvents)) ||
    ('todos' in dataObj && Array.isArray(dataObj.todos)) ||
    ('tasks' in dataObj && Array.isArray(dataObj.tasks)) ||
    ('snapshotStores' in dataObj && Array.isArray(dataObj.snapshotStores))
  );

  if (!hasValidArrays) {
    if (debug) {
      console.log('❌ Failed: Missing required array fields');
      console.groupEnd();
    }
    return false;
  }

  // 4. Required identifier fields
  const hasIdentifier = (
    ('id' in dataObj && typeof dataObj.id === 'string') ||
    ('comment' in dataObj && typeof dataObj.comment === 'string')
  );

  if (!hasIdentifier) {
    if (debug) {
      console.log('❌ Failed: Missing id or comment field');
      console.groupEnd();
    }
    return false;
  }

  // 5. Nested structure validation
  if ('projectInfo' in dataObj) {
    const projectInfo = dataObj.projectInfo;
    if (projectInfo && (typeof projectInfo !== 'object' || Array.isArray(projectInfo))) {
      if (debug) {
        console.log('❌ Failed: Invalid projectInfo structure');
        console.groupEnd();
      }
      return false;
    }
  }

  // 6. Metadata validation if present
  if ('metadata' in dataObj) {
    const metadata = dataObj.metadata;
    if (metadata && (typeof metadata !== 'object' || metadata === null)) {
      if (debug) {
        console.log('❌ Failed: Invalid metadata structure');
        console.groupEnd();
      }
      return false;
    }
  }

  if (debug) {
    console.log('✅ Passed all checks');
    console.groupEnd();
  }
  return true;
}

// Enrich SnapshotStore with additional metadata
function enrichSnapshotStore<T extends BaseData, K extends T, Meta extends StructuredMetadata<T, K>>(
  store: SnapshotStore<T, K, Meta>
): SnapshotStore<T, K, Meta> {
  return {
    ...store,
    metadata: {
      ...store.metadata,
      enrichedAt: new Date().toISOString(),
      version: '1.0',
      source: 'api-response'
    },
    // Add any additional store-specific transformations
    snapshots: store.snapshots?.map(s => normalizeSnapshot(s))
  };
}

// Normalize snapshot data structure
function normalizeSnapshot<T extends BaseData, K extends T, Meta extends StructuredMetadata<T, K>>(
  snapshot: Snapshot<T, K, Meta>
): Snapshot<T, K, Meta> {
  return {
    ...snapshot,
    // Ensure all dates are properly formatted
    createdAt: snapshot.createdAt ? new Date(snapshot.createdAt).toISOString() : new Date().toISOString(),
    updatedAt: snapshot.updatedAt ? new Date(snapshot.updatedAt).toISOString() : new Date().toISOString(),
    // Normalize nested structures
    data: normalizeSnapshotData(snapshot.data),
    // Add validation flags
    isValid: validateSnapshot(snapshot)
  };
}

// Transform API response to standardized format
function transformResponse<T extends BaseData, K extends T, Meta extends StructuredMetadata<T, K>>(
  response: YourResponseType<T, K, Meta>
): YourResponseType<T, K, Meta> {
  return {
    ...response,
    // Normalize all dates in the response
    ...(response.projectInfo?.metadata && {
      projectInfo: {
        ...response.projectInfo,
        metadata: {
          ...response.projectInfo.metadata,
          createdAt: new Date(response.projectInfo.metadata.createdAt),
          updatedAt: new Date(response.projectInfo.metadata.updatedAt)
        }
      }
    }),
    // Normalize nested arrays
    calendarEvents: response.calendarEvents?.map(event => ({
      ...event,
      start: new Date(event.start),
      end: new Date(event.end)
    })),
    todos: response.todos?.map(todo => ({
      ...todo,
      dueDate: todo.dueDate ? new Date(todo.dueDate) : undefined
    })),
    tasks: response.tasks?.map(task => ({
      ...task,
      createdAt: new Date(task.createdAt),
      updatedAt: new Date(task.updatedAt)
    })),
    // Add computed fields
    totalItems: [response.todos, response.tasks].flat().length
  };
}

// Helper functions used by the main converters
function normalizeSnapshotData<T extends BaseData>(data: T): T {
  return {
    ...data,
    // Normalize any BaseData fields
    createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
    updatedAt: data.updatedAt ? new Date(data.updatedAt) : new Date()
  };
}

function validateSnapshot<T extends BaseData, K extends T, Meta extends StructuredMetadata<T, K>>(
  snapshot: Snapshot<T, K, Meta>
): boolean {
  return !!(
    snapshot.id &&
    snapshot.data &&
    (!snapshot.expiresAt || new Date(snapshot.expiresAt) > new Date())
  );
}


const convertSnapshotStoreItemToT =  <T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(
  item: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
): T => {
  if (item.data) {
    const keysIterator = item.data.keys();
    const firstKey = keysIterator.next().value;
    return {
      id: firstKey,
      // Copy other properties if needed
    } as T;
  } else {
    throw new Error('Item data is null or undefined');
  }
};

const convertSnapshotStoreItemToSnapshot =  <T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(
  item: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
): Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> => {
  return item;
};

// Function to convert SnapshotStore<BaseData> to Map<string, T>
const convertSnapshotStoreToMap =  <T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(
  store: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
): Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> => {
  const dataMap = new Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>();

  // Assuming 'data' is an array or iterable within SnapshotStore<BaseData>
  store.data?.forEach((item: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, key: string) => {
    // Use the conversion function to ensure item is compatible with Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
    const convertedItem = convertSnapshotStoreItemToSnapshot(item);
    dataMap.set(key, convertedItem);
  });

  return dataMap;
};


function convertMapToSnapshotStore<T extends  BaseData<any>, K extends T>(
  map: Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
  timestamp: string | number | Date | undefined,
  storeProps: SnapshotStoreProps<T, K>
): SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {


const { storeId, name, version, schema, options, category, config, operation, snapshots, expirationDate, payload, callback,  endpointCategory, initialState} = storeProps
const snapshotStore = new SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>({ storeId, initialState, name, version, schema, options, category, config, operation, snapshots, expirationDate, payload, callback, storeProps, endpointCategory });
// Populate snapshotStore with map data

  map.forEach(async (value, key) => {
    try {
      // Fetch the snapshot data for each key
      const snapshotData = await snapshotApi.getSnapshot(String(key), Number(storeId), additionalHeaders);

      // Set the retrieved snapshot data in snapshotStore
      snapshotStore.data.set(key, snapshotData);
    } catch (error) {
      console.error(`Failed to fetch snapshot for key ${key}:`, error);
    }
  });

    return snapshotStore;
  }



// Convert Map<string, T> to Snapshot<BaseData, BaseData>
function convertMapToSnapshot<
T extends  BaseData<any>, 
K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>
>(
  map: Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
  timestamp: string | number | Date | undefined
): SnapshotDataType<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null  {
  
  const snapshotMap = new Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>();

  map.forEach((value, key) => {
     // Create a default base snapshot instance
     const baseSnapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = createBasicSnapshot<T, K, Meta>(
      value.data, 
      new Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>(), 
      key, 
      "some-category", 
      null, 
      null, 
      null
    );

    // Spread `baseSnapshot` to keep required properties and override what is needed
    const newSnapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = {
      ...baseSnapshot, // Spread the existing base snapshot to populate missing properties
      id: key,
      title: "Snapshot Title",
      timestamp: new Date(),
      subscriberId: "some-subscriber-id",
      category: "some-category",
      length: 1,
      content: value.data ? value.data.toString() : '',
      data: value.data as T,
      value: 0,
      // Populate with other properties of Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> as needed
    };

    snapshotMap.set(key, snapshot);
  });

  return {
    id: "some-id",
    title: "Snapshot Title",
    timestamp: new Date(),
    subscriberId: "some-subscriber-id",
    category: "some-category",
    length: snapshotMap.size,
    content: snapshotMap.toString(),
    data: snapshotMap, // Ensure the type matches Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
    value: 0,
    key: "some-key",
    subscription: null,
    config: null,
    status: StatusType.Active,
    metadata: {},
    delegate: [],
    store: null,
    state: null,
    todoSnapshotId: "some-todo-id",
    initialState: null,
    snapshotStoreConfig: {} as SnapshotStoreConfig<T, K>,

    defaultSubscribeToSnapshots: () => Promise.resolve(),
    transformSubscriber: (sub: Subscriber<T, K>): Subscriber<T, K> => {
      return {
        name: sub.getName(),
        _id: sub.getUniqueId,
        subscription: sub.getSubscription(),
        subscriberId: sub.getSubscriberId(),
        subscribersById: sub.getSubscribersById(),
        getUniqueId: sub.getUniqueId,
        subscribers: sub.getSubscribers,
        onSnapshotCallbacks: sub.getOnSnapshotCallbacks,
        onErrorCallbacks: sub.getOnErrorCallbacks,
        onUnsubscribeCallbacks: sub.getOnSnapshotCallbacks,
        notifyEventSystem: sub.getNotifyEventSystem(),
        updateProjectState: sub.getUpdateProjectState(),
        logActivity: sub.getLogActivity,
        triggerIncentives: sub.getTriggerIncentives,
        optionalData: sub.getOptionalData,
        data: sub.data,
        email: "",
        enabled: false,
        tags: [],
        snapshotIds: [],
        payload: sub.getPayload,
        getTransformSubscriber: sub.getTransformSubscriber,
        fetchSnapshotIds: sub.getFetchSnapshotIds,
        getId: sub.getId,
        get_Id: sub.getUniqueId,
        id: sub.id,
        getEnabled: sub.getEnabled,
        getTags: sub.getTags,
        defaultSubscribeToSnapshots: sub.defaultSubscribeToSnapshots,
        subscribeToSnapshots: sub.subscribeToSnapshots,
        getSubscribers: sub.getSubscribers,
        transformSubscribers: sub.transformSubscribers,
        setSubscribers: sub.setSubscribers,
        getOnSnapshotCallbacks: sub.getOnSnapshotCallbacks,
        setOnSnapshotCallbacks: sub.setOnSnapshotCallbacks,
        getOnErrorCallbacks: sub.getOnErrorCallbacks,
        setOnErrorCallbacks: sub.setOnErrorCallbacks,
        getOnUnsubscribeCallbacks: sub.getOnUnsubscribeCallbacks,
        setOnUnsubscribeCallbacks: sub.setOnUnsubscribeCallbacks,
        setNotifyEventSystem: sub.setNotifyEventSystem,
        setUpdateProjectState: sub.setUpdateProjectState,
        setLogActivity: sub.setLogActivity,
        setTriggerIncentives: sub.setTriggerIncentives,
        setOptionalData: sub.setOptionalData,
        setEmail: sub.setEmail,
        setSnapshotIds: sub.setSnapshotIds,
        getPayload: sub.getPayload,
        handleCallback: sub.handleCallback,
        snapshotCallback: sub.snapshotCallback,
        getEmail: sub.getEmail,
        subscribe: sub.subscribe,
        unsubscribe: sub.unsubscribe,
        getOptionalData: sub.getOptionalData,
        getFetchSnapshotIds: sub.getFetchSnapshotIds,
        getSnapshotIds: sub.getSnapshotIds,
        getData: sub.getData,
        getInitialData: sub.getInitialData,
        getNewData: sub.getNewData,
        getDefaultSubscribeToSnapshots: sub.getDefaultSubscribeToSnapshots,
        getSubscribeToSnapshots: sub.getSubscribeToSnapshots,
        fetchTransformSubscribers: sub.fetchTransformSubscribers,
        getTransformSubscribers: sub.getTransformSubscribers,
        setTransformSubscribers: sub.setTransformSubscribers,
        getNotifyEventSystem: sub.getNotifyEventSystem,
        getUpdateProjectState: sub.getUpdateProjectState,
        getLogActivity: sub.getLogActivity,
        getTriggerIncentives: sub.getTriggerIncentives,
        initialData: sub.initialData,
        getName: sub.getName,
        getDetermineCategory: sub.getDetermineCategory,
        fetchSnapshotById: sub.fetchSnapshotById,
        snapshots: sub.snapshots,
        toSnapshotStore: sub.toSnapshotStore,
        determineCategory: sub.determineCategory,
        getDeterminedCategory: sub.getDeterminedCategory,
        processNotification: sub.processNotification,
        receiveSnapshot: sub.receiveSnapshot,
        getState: sub.getState,
        setEvent: sub.setEvent,
        onError: sub.onError,
        getSubscriberId: sub.getSubscriberId,
        getSubscribersById: sub.getSubscribersById,
        getSubscribersWithSubscriptionPlan: sub.getSubscribersWithSubscriptionPlan,
        getSubscription: sub.getSubscription,
        onUnsubscribe: sub.onUnsubscribe,
        onSnapshot: sub.onSnapshot,
        onSnapshotError: sub.onSnapshotError,
        onSnapshotUnsubscribe: sub.onSnapshotUnsubscribe,
        triggerOnSnapshot: sub.triggerOnSnapshot,
      };
    },
    transformDelegate: (): SnapshotStoreConfig<T, K>[] => {
      return [
        {
          // Add properties of SnapshotStoreConfig
        }
      ];
    },

    initializedState: null,
    getAllKeys: () => [],
    getAllItems: () => [],

    addData: () => { },
    addDataStatus: () => { },
    removeData: () => { },
    updateData: () => { },

    updateDataTitle: () => { },
    updateDataDescription: () => { },
    updateDataStatus: () => { },
    addDataSuccess: () => { },

    getDataVersions: () => [],
    updateDataVersions: () => { },
    getBackendVersion: () => '',
    getFrontendVersion: () => '',

    fetchData: () => Promise.resolve(),
    defaultSubscribeToSnapshot: () => Promise.resolve(),
    handleSubscribeToSnapshot: () => Promise.resolve(),

    removeItem: () => { },
    getSnapshot: () => ({}) as Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    getSnapshotSuccess: () => { },
    getSnapshotId: () => '',

    getItem: () => ({} as T),
    setItem: () => { },
    addSnapshotFailure: () => { },
    getDataStore: () => ({}),

    addSnapshotSuccess: () => { },
    compareSnapshotState: () => false,
    deepCompare: () => false,
    shallowCompare: () => false,

    getDataStoreMethods: () => ({}),
    getDelegate: () => ({}),
    determineCategory: () => '',
    determinePrefix: () => '',

    updateSnapshot: () => { },
    updateSnapshotSuccess: () => { },
    updateSnapshotFailure: () => { },
    removeSnapshot: () => { },

    snapshotItems: [],
    nestedStores: [],
    addSnapshotItem: () => { },
    addNestedStore: () => { },
    getData: () => null,
    clearSnapshots: () => { },
    addSnapshot: () => { },
    createSnapshot: () => { },
    meta: {},
    getSnapshotItems: () => [],
    createInitSnapshot: () => { },

    createSnapshotSuccess: () => { },
    setSnapshotSuccess: () => { },
    setSnapshotFailure: () => { },
    createSnapshotFailure: () => { },

    updateSnapshots: () => { },
    updateSnapshotsSuccess: () => { },
    updateSnapshotsFailure: () => { },
    initSnapshot: () => { },

    takeSnapshot: () => { },
    takeSnapshotSuccess: () => { },
    takeSnapshotsSuccess: () => { },
    configureSnapshotStore: () => { },
    flatMap: function <U extends Iterable<any>>(
      callback: (value: SnapshotStoreConfig<T, K>, index: number, array: SnapshotStoreConfig<T, K>[]) => U
    ) {
      // Assume we have an array of SnapshotStoreConfig<T, K>
      const snapshotStoreConfigArray: SnapshotStoreConfig<T, K>[] = []; // Populate this as necessary
      return flatMapImplementation(snapshotStoreConfigArray, callback);
    },
    setData: (data: Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>) => { },
    getState: () => ({}),
    setState: () => { },

    validateSnapshot: () => false,
    handleSnapshot: (
      id: string,
      snapshotId: number,
      snapshot: T | null,
      snapshotData: T,
      category: Category | undefined,
      callback: (snapshot: T) => void,
      snapshots: SnapshotsArray<T, K, Meta>,
      type: string,
      event: Event,
      snapshotContainer?: T,
      snapshotStoreConfig?: SnapshotStoreConfig<T, any> | null,
    ): Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null> => { 
      return new Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null>(async (resolve, reject) => {
        try {
          // Validate input parameters
          if (!id || !snapshotId || !snapshotData) {
            throw new Error('Missing required parameters.');
          }
    
          // Initialize snapshot
          let currentSnapshot: T;
    
          if (snapshot) {
            // Use existing snapshot
            currentSnapshot = snapshot;
          } else {
            // Create a new snapshot if not provided
            currentSnapshot = snapshotData;
          }
    
          // Apply snapshot data
          if (snapshotContainer) {
            // Update the container with new snapshot data
            Object.assign(snapshotContainer, snapshotData);
          }
    
          // Update snapshots array based on type
          switch (type) {
            case 'create':
              snapshots.push(currentSnapshot);
              break;
            case 'update':
              const index = snapshots.findIndex(s => s.id === snapshotId);
              if (index !== -1) {
                snapshots[index] = currentSnapshot;
              } else {
                throw new Error('Snapshot not found for update.');
              }
              break;
            case 'delete':
              const deleteIndex = snapshots.findIndex(s => s.id === snapshotId);
              if (deleteIndex !== -1) {
                snapshots.splice(deleteIndex, 1);
              } else {
                throw new Error('Snapshot not found for deletion.');
              }
              break;
            default:
              throw new Error('Unsupported snapshot type.');
          }
    
          // Apply snapshot store configuration if provided
          if (snapshotStoreConfig) {
            // Update snapshot store based on configuration
            // Implementation depends on specific configuration details
          }
    
          // Execute callback with updated snapshot
          callback(currentSnapshot);
    
          // Handle event
          // Implement event handling logic as needed
    
          // Return the updated snapshot
          resolve({
            id,
            data: new Map<string, T>(), // Replace with actual snapshot data if needed
            category,
            store: {} as SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, // Replace with actual SnapshotStore instance if needed
            getSnapshotId: async () => id,
            compareSnapshotState: () => false, // Implement comparison logic
            snapshot: async () => ({
              snapshot: {
                id,
                data: new Map<string, T>(), // Replace with actual snapshot data if needed
                category,
              }
            }),
            getSnapshotData: () => new Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>(), // Replace with actual snapshot data if needed
            getSnapshotCategory: () => category,
            setSnapshotData: () => {}, // Implement logic to set snapshot data
            setSnapshotCategory: () => {}, // Implement logic to set snapshot category
            deleteSnapshot: () => {}, // Implement deletion logic
            restoreSnapshot: () => {}, // Implement restoration logic
            createSnapshot: () => ({
              id,
              data: new Map<string, T>(), // Replace with actual snapshot data if needed
              category,
            }),
            updateSnapshot: async () => ({
              snapshotId,
              data: new Map<string, T>(), // Replace with actual snapshot data if needed
              // Include other return values as needed
            }),
            // Add additional properties and methods if needed
          });
        } catch (error) {
          console.error('Error handling snapshot:', error);
          // Handle error as needed, e.g., notify user or log error
          resolve(null); // Resolve with null on error
        }
      });
    },
    handleActions: () => { },
    setSnapshot: () => { },

    transformSnapshotConfig: (config: SnapshotStoreConfig<any, T>
    ): SnapshotStoreConfig<any, T> => {
      // Transform the provided config as needed
      // This example assumes you might want to modify or return the config directly
  
      // Example implementation: Returning the config unchanged
      return config;
    },
    setSnapshotData: (
      snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      data: Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
      subscribers: Subscriber<T, K>[],
      snapshotData: Partial<
        SnapshotStoreConfig<T, K>
      >
    ) => { },
    setSnapshots: () => { },
    clearSnapshot: () => { },

    mergeSnapshots: () => [],
    reduceSnapshots: () => [],
    sortSnapshots: () => [],
    filterSnapshots: () => [],

    mapSnapshots: () => { },
    findSnapshot: () => ({} as Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>),
    getSubscribers: () => [],
    notify: () => { },

    notifySubscribers: (
      subscribers: Subscriber<T, K>[],
      data: Partial<SnapshotStoreConfig<BaseData, any>>
    ): Subscriber<BaseData, K>[] => {
      // Implement the logic to notify subscribers
      return subscribers;
    },
    subscribe: () => { },
    unsubscribe: () => { },
    fetchSnapshot: () => Promise.resolve(),

    fetchSnapshotSuccess: () => { },
    fetchSnapshotFailure: () => { },
    getSnapshots: () => [],
    getAllSnapshots: () => [],

    generateId: () => '',
    batchFetchSnapshots: () => [],
    batchTakeSnapshotsRequest: () => [],
    batchUpdateSnapshotsRequest: () => [],

    filterSnapshotsByStatus: () => [],
    filterSnapshotsByCategory: () => [],
    filterSnapshotsByTag: () => [],

    batchFetchSnapshotsSuccess: () => { },
    batchFetchSnapshotsFailure: () => { },
    batchUpdateSnapshotsSuccess: () => { },
    batchUpdateSnapshotsFailure: () => { },

    batchTakeSnapshot: (
      snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      snapshots: Snapshots<T, K>
    ): Promise<{ snapshots: Snapshots<T, K>; }> => {
      // Implement the logic to batch take snapshots
      return Promise.resolve({ snapshots });
    },

    handleSnapshotSuccess: () => { },
    handleSnapshotFailure: () => { },
    eventRecords: {},

    getBackendVersion: async () => "",
    snapshotStore: {} as SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    getParentId: () => '',
    getChildIds: () => [],

    addChild: () => { },
    removeChild: () => { },
    getChildren: () => [],
    hasChildren: () => false,

    isDescendantOf: () => false,
    dataItems: [],
    newData: null,
    getInitialState: () => null,

    getConfigOption: () => ({} as SnapshotStoreConfig<T, K>),
    getTimestamp: () => new Date(),
    stores: [],
    getStore: () => ({} as SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>),

    addStore: (): SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null => { },
    mapSnapshot: () => ({} as Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>),
    removeStore: () => { },
    createSnapshots: () => [],

    onSnapshot: () => { },
    onSnapshots: () => { },
    events: {
      callbacks: {} as Callback<Snapshots<T, K>>,
      eventRecords: {} as Record<string, CalendarEvent[]>
    },

    defaultActionHandler: () => { },
    handleActionSuccess: () => { },
    handleActionFailure: () => { },
    configureSnapshot: () => { },

    sortStores: () => [],
    mapStores: () => [],
    filterStores: () => [],
    mapNestedStores: () => [],

    getStoreKeys: () => [],
    getStoreItems: () => [],
    mergeStore: () => { },
    setStoreData: () => { },

    handleTransformSnapshotConfig: () => ({}),
    handleTransformSnapshot: () => ({}),
    addSnapshotStore: () => { },
    handleTransformStores: () => [],

    sortData: () => [],
    mapData: () => [],
    filterData: () => [],
    reduceData: () => [],

    findData: () => null,
    getStoreData: () => { },
    getStoreSnapshot: () => ({} as Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>),
    fetchStoreSnapshots: () => [],

    transformSnapshot: () => ({} as Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>),
    flattenSnapshot: () => { },
    batchSnapshots: [],
    batchStores: [],

    getAllSnapshotStores: () => [],
    getAllSnapshotItems: () => [],
    getSnapshotConfig: () => ({} as SnapshotStoreConfig<T, K>),
    eventStore: [],

    getEventStore: () => [],
    filterStoreEvents: () => [],
    mapStoreEvents: () => [],
    reduceStoreEvents: () => [],

    findStoreEvent: () => null,
    snapshotState: {},
    storeState: {},
    initialStoreState: {},

    configureStore: () => { },
    configureState: () => { },
    getStateStore: () => { },
    getStateData: () => { },

    getSnapshotEvent: () => null,
    getEvent: () => null,
    notifyStore: () => { },
    notifyStoreEvents: () => { },

    getSubscriptionId: () => '',
    getSnapshotEventStore: () => [],
    addSnapshotEvent: () => { },
    updateSnapshotEvent: () => { },

    removeSnapshotEvent: () => { },
    filterSnapshotEvents: () => [],
    mapSnapshotEvents: () => [],
    reduceSnapshotEvents: () => [],

    findSnapshotEvent: () => null,
    eventState: {},
    getInitialState: (): T => {
      return {} as T
    },
    getStoreItem: () => ({}),

    setStoreItem: () => { },
    removeStoreItem: () => { },
    addStoreItem: () => { },
    updateStoreItem: () => { },

    getStoreKeys: () => [],
    getStoreValues: () => [],
    getStoreItems: () => [],
    createStoreItem: () => ({}),

    batchFetchStoreItems: () => [],
    batchTakeStoreItems: () => [],
    batchUpdateStoreItems: () => [],
    addStoreEvent: () => { },

    updateStoreEvent: () => { },
    removeStoreEvent: () => { },
    notifyStoreEvent: () => { },
    fetchStoreEvent: () => Promise.resolve(),

    fetchStoreEventSuccess: () => { },
    fetchStoreEventFailure: () => { },
    fetchStoreEvents: () => [],
    fetchStoreEventsSuccess: () => { },

    fetchStoreEventsFailure: () => { },
    getStoreEvent: () => null,
    findStoreEvent: () => null,
    notifyAllStoreEvents: () => { },

    fetchStoreEventList: () => [],
    batchFetchStoreEventList: () => [],
    batchTakeStoreEventList: () => [],
    batchUpdateStoreEventList: () => [],
  };
}

function convertSnapshotContent<T extends BaseData>(
  snapshotContent: Map<string, T>
): Map<string, BaseData> {
  const content = new Map<string, BaseData>();

  snapshotContent.forEach((value, key) => {
    content.set(key, value as BaseData); // Assuming T can be safely cast to BaseData
  });

  return content;
}

function convertSnapshotToMap<T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(
  snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
): Map<string, any> {
  const map = new Map<string, any>();

  if (snapshot && snapshot.data) {
    // Check if snapshot.data is an object and not a Map
    if (typeof snapshot.data === 'object' && !(snapshot.data instanceof Map)) {
      Object.keys(snapshot.data as T).forEach(key => {
        // Ensure the key exists on the data object
        if (snapshot.data && key in snapshot.data) {
          map.set(key, (snapshot.data as T)[key]);
        }
      });
    } else if (snapshot.data instanceof Map) {
      // If snapshot.data is a Map, merge it directly into the new map
      snapshot.data.forEach((value, key) => {
        map.set(key, value);
      });
    }
  }

  return map;
}


const convertSnapshotContainerToStore = <T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(
  snapshotContainer: SnapshotContainer<T, K>
): SnapshotStore<Data, BaseData> => {
  return {
    storeId: snapshotContainer.storeId || '', // Or use a default/fallback value
    name: snapshotContainer.name || '',
    version: snapshotContainer.version || new Version('0.0.0'),
    schema: snapshotContainer.schema || {},
    options: snapshotContainer.options || {},
    category: snapshotContainer.category || '',
    config: snapshotContainer.config || {},
    operation: snapshotContainer.operation || 'defaultOperation',
    id: snapshotContainer.id,
    key: snapshotContainer.key,
    keys: snapshotContainer.keys,
    topic: snapshotContainer.topic,
   
    date: snapshotContainer.date,
    title: snapshotContainer.title,
    categoryProperties: snapshotContainer.categoryProperties,
    message: snapshotContainer.message,
   
    timestamp: snapshotContainer.timestamp,
    createdBy: snapshotContainer.createdBy,
    eventRecords: snapshotContainer.eventRecords,
    type: snapshotContainer.type,
   
    subscribers: snapshotContainer.subscribers,
    createdAt: snapshotContainer.createdAt,
    store: snapshotContainer.store,
    stores: snapshotContainer.stores,
   
    snapshots: snapshotContainer.snapshots,
    snapshotConfig: snapshotContainer.snapshotConfig,
    meta: snapshotContainer.meta,
    snapshotMethods: snapshotContainer.snapshotMethods,
   
    getSnapshotsBySubscriber: snapshotContainer.getSnapshotsBySubscriber,
    getSnapshotsBySubscriberSuccess: snapshotContainer.getSnapshotsBySubscriberSuccess,
    getSnapshotsByTopic: snapshotContainer.getSnapshotsByTopic,
    getSnapshotsByTopicSuccess: snapshotContainer.getSnapshotsByTopicSuccess,
   
    getSnapshotsByCategory: snapshotContainer.getSnapshotsByCategory,
    getSnapshotsByCategorySuccess: snapshotContainer.getSnapshotsByCategorySuccess,
    getSnapshotsByKey: snapshotContainer.getSnapshotsByKey,
    getSnapshotsByKeySuccess: snapshotContainer.getSnapshotsByKeySuccess,
   
    getSnapshotsByPriority: snapshotContainer.getSnapshotsByPriority,
    getSnapshotsByPrioritySuccess: snapshotContainer.getSnapshotsByPrioritySuccess,
    getStoreData: snapshotContainer.getStoreData,
    updateStoreData: snapshotContainer.updateStoreData,
   
    updateDelegate: snapshotContainer.updateDelegate,
    getSnapshotContainer: snapshotContainer.getSnapshotContainer,
    getSnapshotVersions: snapshotContainer.getSnapshotVersions,
    createSnapshot: snapshotContainer.createSnapshot,
   
    maxAge: snapshotContainer.maxAge,
    expirationDate: snapshotContainer.expirationDate,
    criteria: snapshotContainer.criteria,
    initializeWithData: snapshotContainer.initializeWithData,
    hasSnapshots: snapshotContainer.hasSnapshots,
    getDataStoreMap: snapshotContainer.getDataStoreMap,
    emit: snapshotContainer.emit,
    removeChild: snapshotContainer.removeChild,
   
    structuredMetadata: snapshotContainer.structuredMetadata,
    snapshotStoreConfig: snapshotContainer.snapshotStoreConfig,
    getChildren: snapshotContainer.getChildren,
    hasChildren: snapshotContainer.hasChildren,
   
    get: snapshotContainer.get,
    isSubscribed: snapshotContainer.isSubscribed,
    addToSnapshotList: snapshotContainer.addToSnapshotList,
    handleSnapshotFailure: snapshotContainer.handleSnapshotFailure,
    
    getEventsAsRecord: snapshotContainer.getEventsAsRecord,
    isDescendantOf: snapshotContainer.isDescendantOf,
    getInitialState: snapshotContainer.getInitialState,
    getConfigOption: snapshotContainer.getConfigOption,
   
    getAllSnapshots: snapshotContainer.getAllSnapshots,
    getTimestamp: snapshotContainer.getTimestamp,
    getStore: snapshotContainer.getStore,
    getStores: snapshotContainer.getStores,
    getData: snapshotContainer.getData,
    addStore: snapshotContainer.addStore,
    removeStore: snapshotContainer.removeStore,
    createSnapshots: snapshotContainer.createSnapshots,
   
    states: snapshotContainer.states,
    currentState: snapshotContainer.currentState,
    updateState: snapshotContainer.updateState,
    getCurrentState: snapshotContainer.getCurrentState,
   

    // Map other propertiwes as needed
  } as SnapshotStore<Data, BaseData>;
};


const convertToSnapshot = <T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(
  id: string | number | undefined,
  snapshotId: string | null,
  snapshotData: SnapshotData<T, K>,
  category: Category | undefined,  categoryProperties: CategoryProperties | undefined,
  metadata: UnifiedMetadata<T, K, Meta, ExcludedFields>,
  subscriberId: string,
  endpointCategory: string | number,
  storeProps: SnapshotStoreProps<T, K>,
  snapshotConfigData: SnapshotConfig<T, K>,
  subscription: Subscription<T, K>,
  snapshotContainer?: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null,
): Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> => {
  // Create a Snapshot object from the parameters
  const snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = {
    id, // Assign the id
    snapshotId, // Assign the snapshotId
    snapshotData, // Assign the snapshotData
    category, // Assign the category
    categoryProperties, // Assign the categoryProperties
    metadata, // Assign metadata
    subscriberId, // Assign the subscriberId
    endpointCategory, // Assign endpointCategory
    storeProps, // Assign storeProps
    snapshotConfigData, // Assign snapshotConfigData
    subscription, // Assign subscription
    snapshotContainer, // Assign snapshotContainer if provided
    // Include additional properties if needed
  };

  return snapshot;
};




function convertSnapshotMap <T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(
  dataMap: Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>
): Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> {
  const convertedMap = new Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>();

  dataMap.forEach((snapshot, key) => {
    const convertedSnapshot = convertBaseDataToK(snapshot) as unknown as Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
    convertedMap.set(key, convertedSnapshot);
  });

  return convertedMap;
}

function isCoreSnapshot<T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(
  snapshot: any
): snapshot is CoreSnapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  return snapshot && Array.isArray(snapshot.children) && typeof snapshot.id === 'string';
}


export {
  convertMapToSnapshot, convertMapToSnapshotStore, convertSnapshoStoretData, convertSnapshotContainerToStore, convertSnapshotContent,
  convertSnapshotData, convertSnapshotMap, convertSnapshotStoreConfig,
  convertSnapshotStoreItemToT,
  convertSnapshotStoreToMap, convertSnapshotStoreToSnapshot, convertSnapshotToMap, convertSnapshotToStore, convertToDataSnapshot, convertToDataStore, convertToSnapshot, convertToSnapshotStoreConfig,
  createSnapshotStoreConfig, createSnapshotStoreOptions, enrichSnapshotStore, isCoreSnapshot, isSnapshotStore, isYourResponseType, normalizeSnapshot, snapshotType, transformResponse
};

