// EventStore.ts
import { BaseData } from '@/app/components/models/data/Data';
import { metadata } from '@/app/layout';
import snapshotUtils from '@/app/components/utisnapshot/utils/snapshotUtils'
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
const defaultEventStore = <T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(
  snapshotId: string,
  storeId: number,
  additionalHeaders?: Record<string, string>
): EventStore<T, K> => {
  // Fetch the snapshot data using fetchAndCreateSnapshot
  const coreSnapshot = await fetchAndCreateSnapshot<T, K>(snapshotId, storeId, additionalHeaders);


return {
  initialConfig: {
    // Provide a default initialConfig or modify according to your needs
    id: "snapshot-1",
    description: "Description of the snapshot",
    category: category, // Replace with a valid Category instance
    metadata: metadata, // Replace with structured metadata
    snapshotCriteria: snapshotCriteria,
    criteria: criteria,
    priority: "high",
    version: 1,
    data: initializedData, // Ensure this is of type InitializedData
    subscribers: [], // Appropriate subscriber list
    storeConfig: someStoreConfig, // If applicable
    initialState: someInitializedState, // Ensure type matches InitializedState<T, K>
    isCore: true,
    additionalData: customSnapshotData,
    
    subscribers: {} as SubscriberCollection<T, K>[],
    snapshotData: coreSnapshot.snapshotData,
    snapshotId: '',
    snapshot: coreSnapshot.snapshot,   
    snapshotStore: {} as SnapshotStore<T, K>,
    dataItems: coreSnapshot.dataItems,
    isCore: true,
    category: {} as Category,
    data: {} as Map<string, Snapshot<T, K>>,
    events: {} as CombinedEvents<T, K>,
    newData: {} as Snapshot<T, K>,
    payload: {} as UpdateSnapshotPayload<T>,
      criteria: {} as CriteriaType,
      snapshotCriteria: {} as SnapshotWithCriteria<T, K>,
      eventRecords: {} as Record<string, CalendarManagerStoreClass<T, K>[]>,
      store: {} as SnapshotStore<any, K>,
  },

  eventRecords: {},
  callbacks: {},
  subscribers: {} as SubscriberCollection<T, K>,
  eventIds: [],
  onSnapshotAdded: coreSnapshot.onSnapshotAdded, // Using the default implementation or as required
  onSnapshotRemoved: coreSnapshot.onSnapshotRemoved,
  removeSubscriber: coreSnapshot.removeSubscriber,
  onError: coreSnapshot.onError,
  onInitialize: coreSnapshot.onInitialize,
  onSnapshotUpdated: coreSnapshot.onSnapshotUpdated,
  on: coreSnapshot.on,
  off: coreSnapshot.off,
  emit: coreSnapshot.emit,
  once: coreSnapshot.once,
  addRecord: coreSnapshot.addRecord,
  removeAllListeners: coreSnapshot.removeAllListeners,
  subscribe: coreSnapshot.subscribe,
  unsubscribe: coreSnapshot.unsubscribe,
  trigger: coreSnapshot.trigger,
  eventsDetails: coreSnapshot.eventsDetails, // or undefined if you don't have a default value
  }
};


export { defaultEventStore };
