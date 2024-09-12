import { Data } from '@/app/components/models/data/Data';
import { Snapshot, SnapshotConfig, SnapshotWithCriteria, UpdateSnapshotPayload } from '@/app/components/snapshots';
import SnapshotStore, { SubscriberCollection } from '@/app/components/snapshots/SnapshotStore';
import { Category } from '../libraries/categories/generateCategoryProperties';
import { RealtimeDataItem } from '../models/realtime/RealtimeData';
import CalendarManagerStoreClass from '../state/stores/CalendarEvent';
// Step 1: Define the common SnapshotEvents interface
interface SnapshotEvents<T extends Data, K extends Data> {
  initialConfig: SnapshotConfig<T, K>;
  eventRecords: Record<string, CalendarManagerStoreClass<T, K>[]> | null;
  callbacks: Record<string, Array<(snapshot: Snapshot<T, K>) => void>>;
  subscribers: SubscriberCollection<T, K>; // Ensure this is correct
  eventIds: string[];
  onInitialize: () => void;
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
  on: (event: string, callback: (snapshot: Snapshot<T, K>) => void) => void;
  off: (event: string, callback: (snapshot: Snapshot<T, K>) => void) => void;
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
  removeAllListeners: (event?: string) => void;
  subscribe: (event: string, callback: (snapshot: Snapshot<T, K>) => void) => void;
  unsubscribe: (event: string, callback: (snapshot: Snapshot<T, K>) => void) => void;
  trigger: (
    event: string,
    snapshot: Snapshot<T, K>,
    snapshotId: string,
    subscribers: SubscriberCollection<T, K>
  ) => void;
  eventsDetails?: CalendarManagerStoreClass<T, K>[] | undefined;
}

export type {SnapshotEvents}