import { Category } from "../libraries/categories/generateCategoryProperties";
import { Data } from "../models/data/Data";
import { RealtimeDataItem } from "../models/realtime/RealtimeData";
import { Snapshot, SnapshotConfig, SnapshotWithCriteria, SubscriberCollection, UpdateSnapshotPayload } from "../snapshots";
import SnapshotStore from "../snapshots/SnapshotStore";
import CalendarManagerStoreClass from "../state/stores/CalendarEvent";

// EventStore.ts
export type EventStore<T extends Data, K extends Data> = {
    eventRecords: Record<string, EventRecord<T, K>[]> | null;;
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
      category: Category
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
const defaultEventStore = <T extends Data, K extends Data>(): EventStore<T, K> => ({
  initialConfig: {
      // Provide a default initialConfig or modify according to your needs
      criteria: {}, 
      subscribers: {} as SubscriberCollection<T, K>,
  },
  eventRecords: {},
  callbacks: {},
  subscribers: {} as SubscriberCollection<T, K>,
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

  event: string, callback: (snapshot: Snapshot<T, K>) => void) => { /* default implementation */ },
  trigger: () => { /* default implementation */ },
  eventsDetails: [], // or undefined if you don't have a default value
});


export { defaultEventStore };
