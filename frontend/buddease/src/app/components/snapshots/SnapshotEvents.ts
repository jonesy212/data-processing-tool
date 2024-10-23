import { Data } from '@/app/components/models/data/Data';
import { Callback, Snapshot, SnapshotConfig, SnapshotData, SnapshotWithCriteria, UpdateSnapshotPayload } from '@/app/components/snapshots';
import SnapshotStore, { SubscriberCollection } from '@/app/components/snapshots/SnapshotStore';
import { UnifiedMetaDataOptions } from '@/app/configs/database/MetaDataOptions';
import { Category } from '../libraries/categories/generateCategoryProperties';
import { RealtimeDataItem } from '../models/realtime/RealtimeData';
import { EventRecord } from '../projects/DataAnalysisPhase/DataProcessing/DataStore';
import CalendarManagerStoreClass from '../state/stores/CalendarEvent';

// Step 1: Base Interface for Shared Properties
interface BaseSnapshotEvents<T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T> {
  initialConfig: SnapshotConfig<T, Meta, K>;
  callbacks: Record<string, Array<(snapshot: Snapshot<T, Meta, K>) => void>>;
  subscribers: SubscriberCollection<T, Meta, K>;
  eventRecords: Record<string, EventRecord<T, Meta, K>[]> | null; // Store events and their callbacks
  records: Record<string, CalendarManagerStoreClass<T, Meta, K>[]> | null; // Store calendar records
  eventIds: string[];
  onInitialize: () => void;
  trigger: (
    event: string | SnapshotEvents<T, Meta, K>,
    snapshot: Snapshot<T, Meta, K>,
    snapshotId: string,
    subscribers: SubscriberCollection<T, Meta, K>,
    type: string,
    snapshotData: SnapshotData<T, Meta, K>,
  ) => void;
  on: (
    event: string,
    callback: (snapshot: Snapshot<T, Meta, K>) => void,
    snapshotId: string,
    subscribers: SubscriberCollection<T, Meta, K>,
    type: string,
    snapshotData: SnapshotData<T, Meta, K>
  ) => void;
  off: (
    event: string,
    callback: Callback<Snapshot<T, Meta, K>>,
    snapshotId: string,
    subscribers: SubscriberCollection<T, Meta, K>,
    type: string,
    snapshotData: SnapshotData<T, Meta, K>,
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
    snapshot: Snapshot<T, Meta, K>,
    snapshotId: string,
    subscribers: SubscriberCollection<T, Meta, K>,
    type: string,
    snapshotStore: SnapshotStore<T, Meta, K>,
    dataItems: RealtimeDataItem[],
    criteria: SnapshotWithCriteria<T, Meta, K>,
    category: Category,
    snapshotData: SnapshotData<T, Meta, K>
  ) => void;
  subscribe: (event: string, callback: (snapshot: Snapshot<T, Meta, K>) => void) => void;
  
  event: string,
  unsubscribeDetails: {
    userId: string;
    snapshotId: string;
    unsubscribeType: string;
    unsubscribeDate: Date;
    unsubscribeReason: string;
    unsubscribeData: any;
  },
  callback: Callback<Snapshot<T, Meta, K>>
  eventsDetails?: CalendarManagerStoreClass<T, Meta, K>[] | undefined;
}

// Step 2:  Define the common SnapshotEvents interface
interface SnapshotEvents<T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T> extends BaseSnapshotEvents<T, Meta, K> {
  key: string;
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
  emit: (
    event: string,
    snapshot: Snapshot<T, Meta, K>,
    snapshotId: string,
    subscribers: SubscriberCollection<T, Meta, K>,
    type: string,
    snapshotStore: SnapshotStore<T, Meta, K>,
    dataItems: RealtimeDataItem[],
    criteria: SnapshotWithCriteria<T, Meta, K>,
    category: Category,
    snapshotData: SnapshotData<T, Meta, K>

  ) => void;
  once: (event: string, callback: (snapshot: Snapshot<T, Meta, K>) => void) => void;
  addRecord: (
    event: string,
    record: CalendarManagerStoreClass<T, Meta, K>,
    callback: (snapshot: CalendarManagerStoreClass<T, Meta, K>) => void
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
  removeAllListeners: (event?: string) => void
}



export type { BaseSnapshotEvents, SnapshotEvents };
