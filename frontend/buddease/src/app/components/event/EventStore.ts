// EventStore.ts
import { BaseData } from '@/app/components/models/data/Data';
import metadata from '@/app/layout';
import StoreConfig from "@/app/shoppingCenter/ShoppingCenterConfig";
import { InitializedData } from '@/app/components/snapshots/SnapshotStoreOptions';
import { EventManager, InitializedState } from "@/app/components/projects/DataAnalysisPhase/DataProcessing/DataStore";
import { DataStore } from '@/app/components/projects/DataAnalysisPhase/DataProcessing/DataStore';
import { UnifiedMetaDataOptions } from '@/app/configs/database/MetaDataOptions';
import { SnapshotStoreConfig } from '@/app/components/snapshots/SnapshotStoreConfig';
import { fetchAndCreateSnapshot } from '@/app/components/snapshots/defaultSnapshotSubscribeFunctions';
import CalendarManagerStoreClass from "@/app/components/state/stores/CalendarManagerStore";
import { CategoryProperties } from '@/app/pages/personas/ScenarioBuilder';
import { CriteriaType } from '@/app/pages/searchs/CriteriaType';
import { CombinedEvents } from '../hooks/useSnapshotManager';
import { Category } from "../libraries/categories/generateCategoryProperties";
import { Data } from "../models/data/Data";
import { SubscriberCollection } from '@/app/components/users/SubscriberCollection';
import { RealtimeDataItem } from "../models/realtime/RealtimeData";
import { DataStoreMethods } from '../projects/DataAnalysisPhase/DataProcessing/ DataStoreMethods';
import { EventRecord } from "../projects/DataAnalysisPhase/DataProcessing/DataStore";
import { Snapshot, SnapshotConfig, SnapshotData, SnapshotDataType, SnapshotStoreProps, SnapshotWithCriteria, } from "../snapshots";
import SnapshotStore from "../snapshots/SnapshotStore";
import { UpdateSnapshotPayload } from '../database/Payload';
import * as snapshotApi from '@/app/api/SnapshotApi';
import { Subscription } from '../subscriptions/Subscription';
import { useSecureUserId } from '../utils/useSecureUserId';
import { AllTypes } from '../typings/PropTypes';
import { StructuredMetadata } from "@/app/configs/StructuredMetadata";
import { CustomSnapshotData } from "@/app/components/snapshots/SnapshotData";
import { ExcludedFields } from '@/app/components/routing/Fields';
import { SnapshotEvents } from '@/app/components/snapshots/SnapshotEvents';
import { Subscriber } from "@/app/components/users/Subscriber";


export type EventStore<T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>> = {
    eventRecords: Record<string, EventRecord<T, K>[]> | null;
    callbacks: Record<string, Array<(snapshot: Snapshot<T, K>) => void>>;
    subscribers: SubscriberCollection<T, K>;
    eventIds: string[];
    initialConfig: SnapshotConfig<T, K>;
  
    onSnapshotAdded: (
      event: string,
      snapshot: Snapshot<T, K>,
      snapshotId: string,
      subscribers: SubscriberCollection<T, K>,
      snapshotStore: SnapshotStore<T, K>,
      dataItems: RealtimeDataItem[],
      subscriberId: string,
      criteria: SnapshotWithCriteria<T, K>,
      category: Category
    ) => void;
  
    onSnapshotRemoved: (
      event: string,
      snapshot: Snapshot<T, K>,
      snapshotId: string,
      subscribers: SubscriberCollection<T, K>,
      snapshotStore: SnapshotStore<T, K>,
      dataItems: RealtimeDataItem[],
      criteria: SnapshotWithCriteria<T, K>,
      category: Category
    ) => void;
  
    removeSubscriber: (
      event: string,
      snapshotId: string,
      snapshot: Snapshot<T, K>,
      snapshotStore: SnapshotStore<T, K>,
      dataItems: RealtimeDataItem[],
      criteria: SnapshotWithCriteria<T, K>,
      category: Category
    ) => void;
  
    onError: (
      event: string,
      error: Error,
      snapshot: Snapshot<T, K>,
      snapshotId: string,
      snapshotStore: SnapshotStore<T, K>,
      dataItems: RealtimeDataItem[],
      criteria: SnapshotWithCriteria<T, K>,
      category: Category
    ) => void;
  
    onInitialize: () => void;
  
    onSnapshotUpdated: (
      event: string,
      snapshotId: string,
      snapshot: Snapshot<T, K>,
      data: Map<string, Snapshot<T, K>>,
      events: Record<string, CalendarManagerStoreClass<T, K>[]>,
      snapshotStore: SnapshotStore<T, K>,
      dataItems: RealtimeDataItem[],
      newData: Snapshot<T, K>,
      payload: UpdateSnapshotPayload<T>,
      store: SnapshotStore<any, K>
    ) => void;
  
    on: (
      event: string,
      callback: (snapshot: Snapshot<T, K>) => void
    ) => void;
  
    off: (
      event: string,
      callback: (snapshot: Snapshot<T, K>) => void
    ) => void;
  
    emit: (
      event: string,
      snapshot: Snapshot<T, K>,
      snapshotId: string,
      subscribers: SubscriberCollection<T, K>,
      snapshotStore: SnapshotStore<T, K>,
      dataItems: RealtimeDataItem[],
      criteria: SnapshotWithCriteria<T, K>,
      category: Category,
      snapshotData: SnapshotData<T, K>
    ) => void;
  
    once: (
      event: string,
      callback: (snapshot: Snapshot<T, K>) => void
    ) => void;
  
    addRecord: (
      event: string,
      record: CalendarManagerStoreClass<T, K>,
      callback: (snapshot: CalendarManagerStoreClass<T, K>) => void
    ) => void;
  
    removeAllListeners: (event?: string) => void;
  
    subscribe: (
      event: string,
      callback: (snapshot: Snapshot<T, K>) => void
    ) => void;
  
  unsubscribe: (
    unsubscribeDetails: {
      userId: string; snapshotId: string;
      unsubscribeType: string;
      unsubscribeDate: Date;
      unsubscribeReason: string;
      unsubscribeData: any;
    },
      event: string,
      callback: (snapshot: Snapshot<T, K>) => void
    ) => void;
  
    trigger: (
      event: string,
      snapshot: Snapshot<T, K>,
      snapshotId: string,
      subscribers: SubscriberCollection<T, K>
    ) => void;
  
    eventsDetails?: CalendarManagerStoreClass<T, K>[] | undefined;
  };
  

// Define the default event store
const defaultEventStore = async <
  T extends BaseData<any>,
  K extends T = T,
  Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>
>(
  snapshotId: string,
  storeId: number,
  additionalHeaders?: Record<string, string>,
  storeProps?: SnapshotStoreProps<T, K>
): Promise<EventStore<T, K>> => {
  // Fetch the snapshot data using fetchAndCreateSnapshot
  const coreSnapshot = await fetchAndCreateSnapshot<T, K>(snapshotId, storeId, additionalHeaders);
  const { category, config, expirationDate, payload, callback, endpointCategory } = storeProps || {};

  // Define the initialConfig object
  const initialConfig = {
    id: "snapshot-1",
    description: "Description of the snapshot",
    category: {} as Category,
    metadata: {} as UnifiedMetaDataOptions<T, K, Meta, ExcludedFields<T, K>>,
    snapshotCriteria: {} as SnapshotWithCriteria<T, K>,
    criteria: {} as CriteriaType,
    priority: "high",
    version: 1,
    data: {} as InitializedData<T>,
    subscribers: [],
    storeConfig: {} as StoreConfig,
    initialState: {} as InitializedState<T, K>,
    isCore: true,
    additionalData: {} as CustomSnapshotData<T, K, Meta>,
    snapshotData: coreSnapshot.snapshotData,
    snapshotId: coreSnapshot.snapshotId || '',
    snapshot: coreSnapshot.snapshot || {} as Snapshot<T, K>, // Safely access `snapshot` with a fallback
    snapshotStore: {} as SnapshotStore<T, K>,
    dataItems: coreSnapshot.dataItems,
    events: {} as CombinedEvents<T, K>,
    newData: {} as Snapshot<T, K>,
    payload: {} as UpdateSnapshotPayload<T>,
    eventRecords: {} as Record<string, CalendarManagerStoreClass<T, K>[]>,
    store: {} as SnapshotStore<any, K>,
  };

  // Define event handlers (mocked or implemented as needed)
  const eventHandlers: SnapshotEvents<T, K> = {
    onSnapshotAdded: (
      event: string,
      snapshot: Snapshot<T, K>,
      snapshotId: string,
      subscribers: SubscriberCollection<T, K>,
      snapshotStore: SnapshotStore<T, K>,
      dataItems: RealtimeDataItem[],
      subscriberId: string,
      criteria: SnapshotWithCriteria<T, K>,
      category: Category
    ) => {
      // Implementation...
    },
    onSnapshotRemoved: (
      event: string,
      snapshot: Snapshot<T, K>,
      snapshotId: string,
      subscribers: SubscriberCollection<T, K>,
      snapshotStore: SnapshotStore<T, K>,
      dataItems: RealtimeDataItem[],
      criteria: SnapshotWithCriteria<T, K>,
      category: Category
    ) => {
      // Implementation...
    },
    onError: (
      event: string,
      error: Error,
      snapshot: Snapshot<T, K>,
      snapshotId: string,
      snapshotStore: SnapshotStore<T, K>,
      dataItems: RealtimeDataItem[],
      criteria: SnapshotWithCriteria<T, K>,
      category: Category
    ) => {
      // Implementation...
    },
    onSnapshotUpdated: (
      event: string,
      snapshotId: string,
      snapshot: Snapshot<T, K>,
      data: Map<string, Snapshot<T, K>>,
      events: Record<string, CalendarManagerStoreClass<T, K>[]>,
      snapshotStore: SnapshotStore<T, K>,
      dataItems: RealtimeDataItem[],
      newData: Snapshot<T, K>,
      payload: UpdateSnapshotPayload<T>,
      store: SnapshotStore<any, K>
    ) => {
      // Implementation...
    },
    emit: (
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
    ) => {
      // Implementation...
    },
    once: (event: string, callback: (snapshot: Snapshot<T, K>) => void) => {
      // Implementation...
    },
    addRecord: (
      event: string,
      record: CalendarManagerStoreClass<T, K>,
      callback: (snapshot: CalendarManagerStoreClass<T, K>) => void
    ) => {
      // Implementation...
    },
    removeSubscriber: (
      event: string,
      snapshotId: string,
      snapshot: Snapshot<T, K>,
      snapshotStore: SnapshotStore<T, K>,
      dataItems: RealtimeDataItem[],
      criteria: SnapshotWithCriteria<T, K>,
      category: Category
    ) => {
      // Implementation...
    },
    removeAllListeners: (event?: string) => {
      // Implementation...
    },
    subscribe: (
      subscriber: Subscriber<T, K>,
      callback: (snapshot: Snapshot<T, K>) => void
    ) => {
      // Implementation...
    },
    unsubscribe: (
      subscriber: Subscriber<T, K>,
      callback: (snapshot: Snapshot<T, K>) => void
    ) => {
      // Implementation...
    },
    trigger: (event: string, snapshot: Snapshot<T, K>) => {
      // Implementation...
    },
    eventsDetails: {}, // Add actual event details if needed
  };

  // Return the final object
  return {
    initialConfig, // Define `initialConfig` only once
    eventRecords: {},
    callbacks: {},
    subscribers: {} as SubscriberCollection<T, K>,
    eventIds: [],
    ...eventHandlers, // Spread all event handlers into the returned object
  };
};

export { defaultEventStore };
