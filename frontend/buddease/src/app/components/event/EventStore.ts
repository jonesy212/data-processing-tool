import { UnifiedMetaDataOptions } from '@/app/configs/database/MetaDataOptions';
import { CategoryProperties } from '@/app/pages/personas/ScenarioBuilder';
import { CriteriaType } from '@/app/pages/searchs/CriteriaType';
import { CombinedEvents } from '../hooks/useSnapshotManager';
import { Category } from "../libraries/categories/generateCategoryProperties";
import { Data } from "../models/data/Data";
import { RealtimeDataItem } from "../models/realtime/RealtimeData";
import { DataStoreMethods } from '../projects/DataAnalysisPhase/DataProcessing/ DataStoreMethods';
import { EventRecord } from "../projects/DataAnalysisPhase/DataProcessing/DataStore";
import { Snapshot, SnapshotConfig, SnapshotData, SnapshotDataType, SnapshotStoreProps, SnapshotWithCriteria, SubscriberCollection, UpdateSnapshotPayload } from "../snapshots";
import SnapshotStore from "../snapshots/SnapshotStore";
import CalendarManagerStoreClass from "../state/stores/CalendarEvent";

// EventStore.ts
export type EventStore<T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T> = {
    eventRecords: Record<string, EventRecord<T, Meta, K>[]> | null;
    callbacks: Record<string, Array<(snapshot: Snapshot<T, Meta, K>) => void>>;
    subscribers: SubscriberCollection<T, Meta, K>;
    eventIds: string[];
    initialConfig: SnapshotConfig<T, Meta, K>;
  
    onSnapshotAdded: (
      event: string,
      snapshot: Snapshot<T, Meta, K>,
      snapshotId: string,
      subscribers: SubscriberCollection<T, Meta, K>,
      snapshotStore: SnapshotStore<T, Meta, K>,
      dataItems: RealtimeDataItem[],
      subscriberId: string,
      criteria: SnapshotWithCriteria<T, Meta, K>,
      category: Category
    ) => void;
  
    onSnapshotRemoved: (
      event: string,
      snapshot: Snapshot<T, Meta, K>,
      snapshotId: string,
      subscribers: SubscriberCollection<T, Meta, K>,
      snapshotStore: SnapshotStore<T, Meta, K>,
      dataItems: RealtimeDataItem[],
      criteria: SnapshotWithCriteria<T, Meta, K>,
      category: Category
    ) => void;
  
    removeSubscriber: (
      event: string,
      snapshotId: string,
      snapshot: Snapshot<T, Meta, K>,
      snapshotStore: SnapshotStore<T, Meta, K>,
      dataItems: RealtimeDataItem[],
      criteria: SnapshotWithCriteria<T, Meta, K>,
      category: Category
    ) => void;
  
    onError: (
      event: string,
      error: Error,
      snapshot: Snapshot<T, Meta, K>,
      snapshotId: string,
      snapshotStore: SnapshotStore<T, Meta, K>,
      dataItems: RealtimeDataItem[],
      criteria: SnapshotWithCriteria<T, Meta, K>,
      category: Category
    ) => void;
  
    onInitialize: () => void;
  
    onSnapshotUpdated: (
      event: string,
      snapshotId: string,
      snapshot: Snapshot<T, Meta, K>,
      data: Map<string, Snapshot<T, Meta, K>>,
      events: Record<string, CalendarManagerStoreClass<T, Meta, K>[]>,
      snapshotStore: SnapshotStore<T, Meta, K>,
      dataItems: RealtimeDataItem[],
      newData: Snapshot<T, Meta, K>,
      payload: UpdateSnapshotPayload<T>,
      store: SnapshotStore<any, Meta, K>
    ) => void;
  
    on: (
      event: string,
      callback: (snapshot: Snapshot<T, Meta, K>) => void
    ) => void;
  
    off: (
      event: string,
      callback: (snapshot: Snapshot<T, Meta, K>) => void
    ) => void;
  
    emit: (
      event: string,
      snapshot: Snapshot<T, Meta, K>,
      snapshotId: string,
      subscribers: SubscriberCollection<T, Meta, K>,
      snapshotStore: SnapshotStore<T, Meta, K>,
      dataItems: RealtimeDataItem[],
      criteria: SnapshotWithCriteria<T, Meta, K>,
      category: Category,
      snapshotData: SnapshotData<T, Meta, K>
    ) => void;
  
    once: (
      event: string,
      callback: (snapshot: Snapshot<T, Meta, K>) => void
    ) => void;
  
    addRecord: (
      event: string,
      record: CalendarManagerStoreClass<T, Meta, K>,
      callback: (snapshot: CalendarManagerStoreClass<T, Meta, K>) => void
    ) => void;
  
    removeAllListeners: (event?: string) => void;
  
    subscribe: (
      event: string,
      callback: (snapshot: Snapshot<T, Meta, K>) => void
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
      callback: (snapshot: Snapshot<T, Meta, K>) => void
    ) => void;
  
    trigger: (
      event: string,
      snapshot: Snapshot<T, Meta, K>,
      snapshotId: string,
      subscribers: SubscriberCollection<T, Meta, K>
    ) => void;
  
    eventsDetails?: CalendarManagerStoreClass<T, Meta, K>[] | undefined;
  };
  

  


  // Define the default event store
const defaultEventStore = <T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T>(): EventStore<T, Meta, K> => ({
  initialConfig: {
      // Provide a default initialConfig or modify according to your needs
      subscribers: {} as SubscriberCollection<T, Meta, K>[],
      snapshotData:  (
        id: string | number | undefined,
        snapshotId: string |number,
        data: Snapshot<T, Meta, K>,
        mappedSnapshotData: Map<string, Snapshot<T, Meta, K>> | null | undefined,
        snapshotData: SnapshotData<T, Meta, K>,
        snapshotStore: SnapshotStore<T, Meta, K>,
        category: Category | undefined,
        categoryProperties: CategoryProperties | undefined,
        dataStoreMethods: DataStoreMethods<T, Meta, K>,
        storeProps: SnapshotStoreProps<T, Meta, K>
      ): Promise<SnapshotDataType<T, Meta, K>> => {
        return Promise.resolve({} as SnapshotDataType<T, Meta, K>);
      },
      snapshotId: '',
      snapshot: {} as Snapshot<T, Meta, K>,
      snapshotStore: {} as SnapshotStore<T, Meta, K>,
      dataItems: (): RealtimeDataItem[] => {},
      criteria: {} as SnapshotWithCriteria<T, Meta, K>,
      category: {} as Category,
      data: {} as Map<string, Snapshot<T, Meta, K>>,
      events: {} as CombinedEvents<T, Meta, K>,
      newData: {} as Snapshot<T, Meta, K>,
      payload: {} as UpdateSnapshotPayload<T>,
      criteria: {} as CriteriaType,
      snapshotCriteria: {} as SnapshotWithCriteria<T, Meta, K>,
      eventRecords: {} as Record<string, CalendarManagerStoreClass<T, Meta, K>[]>,
      store: {} as SnapshotStore<any, Meta, K>,
  },
  eventRecords: {},
  callbacks: {},
  subscribers: {} as SubscriberCollection<T, Meta, K>,
  eventIds: [],
  onSnapshotAdded: () => { /* default implementation */ },
  onSnapshotRemoved: () => { /* default implementation */ },
  removeSubscriber: () => { /* default implementation */ },
  onError: () => { /* default implementation */ },
  onInitialize: () => { /* default implementation */ },
  onSnapshotUpdated: () => { /* default implementation */ },
  on: () => { /* default implementation */ },
  off: () => { /* default implementation */ },
  emit: () => { /* default implementation */ },
  once: () => { /* default implementation */ },
  addRecord: () => { /* default implementation */ },
  removeAllListeners: () => { /* default implementation */ },
  subscribe: () => { /* default implementation */ },
  unsubscribe: (unsubscribeDetails: {
    userId: string; snapshotId: string;
    unsubscribeType: string;
    unsubscribeDate: Date;
    unsubscribeReason: string;
    unsubscribeData: any;
  },

  event: string, callback: (snapshot: Snapshot<T, Meta, K>) => void) => { /* default implementation */ },
  trigger: () => { /* default implementation */ },
  eventsDetails: [], // or undefined if you don't have a default value
});


export { defaultEventStore };
