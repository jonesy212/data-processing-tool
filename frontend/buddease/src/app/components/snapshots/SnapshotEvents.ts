import { Data } from '@/app/components/models/data/Data';
import { Callback, Snapshot, SnapshotConfig, SnapshotWithCriteria, UpdateSnapshotPayload } from '@/app/components/snapshots';
import SnapshotStore, { SubscriberCollection } from '@/app/components/snapshots/SnapshotStore';
import { Category } from '../libraries/categories/generateCategoryProperties';
import { RealtimeDataItem } from '../models/realtime/RealtimeData';
import CalendarManagerStoreClass from '../state/stores/CalendarEvent';
import { EventRecord } from '../projects/DataAnalysisPhase/DataProcessing/DataStore';

// Step 1: Base Interface for Shared Properties
interface BaseSnapshotEvents<T extends Data, K extends Data> {
  initialConfig: SnapshotConfig<T, K>;
  callbacks: Record<string, Array<(snapshot: Snapshot<T, K>) => void>>;
  subscribers: SubscriberCollection<T, K>;
  eventRecords: Record<string, EventRecord<T, K>[]> | null; // Store events and their callbacks
  records: Record<string, CalendarManagerStoreClass<T, K>[]> | null; // Store calendar records
  eventIds: string[];
  onInitialize: () => void;
  trigger: (
    event: string | SnapshotEvents<T, K>,
    snapshot: Snapshot<T, K>,
    snapshotId: string,
    subscribers: SubscriberCollection<T, K>,
    type: string,
    snapshotData: Snapshot<T, K>,
  ) => void;
  on: (event: string, callback: (snapshot: Snapshot<T, K>) => void) => void;
  off: (event: string,
    callback: Callback<Snapshot<T, K>>,
    unsubscribeDetails?: {
      userId: string;
      snapshotId: string;
      unsubscribeType: string;
      unsubscribeDate: Date;
      unsubscribeReason: string;
      unsubscribeData: any;
    },
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
  subscribe: (event: string, callback: (snapshot: Snapshot<T, K>) => void) => void;
  
  event: string,
  unsubscribeDetails: {
    userId: string;
    snapshotId: string;
    unsubscribeType: string;
    unsubscribeDate: Date;
    unsubscribeReason: string;
    unsubscribeData: any;
  },
  callback: Callback<Snapshot<T, K>>
  eventsDetails?: CalendarManagerStoreClass<T, K>[] | undefined;
}

// Step 2:  Define the common SnapshotEvents interface
interface SnapshotEvents<T extends Data, K extends Data> extends BaseSnapshotEvents<T, K> {
  key: string;
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
  once: (event: string, callback: (snapshot: Snapshot<T, K>) => void) => void;
  addRecord: (
    event: string,
    record: CalendarManagerStoreClass<T, K>,
    callback: (snapshot: CalendarManagerStoreClass<T, K>) => void
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
  removeAllListeners: (event?: string) => void
}



export type { BaseSnapshotEvents, SnapshotEvents };
