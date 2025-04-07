import { UnsubscribeDetails } from '@/app/components/event/DynamicEventHandlerExample';
import { BaseData } from '@/app/components/models/data/Data';
import { Snapshot, SnapshotData, SnapshotWithCriteria } from '@/app/components/snapshots';
import SnapshotStore from '@/app/components/snapshots/SnapshotStore';
import { SnapshotSubscriberManagement } from "@/app/components/snapshots/SnapshotSubscriberManagement";
import CalendarManagerStoreClass from "@/app/components/state/stores/CalendarManagerStore";
import { StructuredMetadata } from "@/app/configs/StructuredMetadata";
import { UpdateSnapshotPayload } from '../../../server/database/Payload';
import { Category } from '../libraries/categories/generateCategoryProperties';
import { RealtimeDataItem } from '../models/realtime/RealtimeData';
import { EventRecord } from '../projects/DataAnalysisPhase/DataProcessing/DataStore';
import { SubscriberCallbackType } from "../subscriptions/Subscription";
import { SubscriberCollection } from '../users/SubscriberCollection';

interface BaseEventCallbacks<T extends BaseData<any>, K extends T = T> {
  onInitialize?: () => void;
  on?: (
    event: string,
    callback: (snapshot: Snapshot<T, K>) => void,
    snapshotId: string,
    subscribers: SubscriberCollection<T, K>,
    type: string,
    snapshotData: SnapshotData<T, K>
  ) => void;
  off?: (
    event: string,
    callback: (snapshot: Snapshot<T, K>) => void,
    snapshotId: string,
    subscribers: SubscriberCollection<T, K>,
    type: string,
    snapshotData: SnapshotData<T, K>,
    unsubscribeDetails?: {
      userId: string;
      snapshotId: string;
      unsubscribeType: string;
      unsubscribeDate: Date;
      unsubscribeReason: string;
      unsubscribeData: any;
    },
  ) => void;
  trigger?: (
    event: string | SnapshotEvents<T, K>,
    snapshot: Snapshot<T, K>,
    eventDate: Date,
    snapshotId: string,
    subscribers: SubscriberCollection<T, K>,
    type: string,
    snapshotData: SnapshotData<T, K>,
  ) => void;
}

interface EventManagement<T extends BaseData<any>, K extends T = T> {
  // Global event subscription
  subscribe: (
    event: string,
    callback: (snapshot: Snapshot<T, K>) => void
  ) => void;
  
  unsubscribe: (
    snapshotId: number,
    unsubscribeDetails: UnsubscribeDetails,
    callback: SubscriberCallbackType<T, K> | null
  ) => void;

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
  ) => void;
  once: (event: string, callback: (snapshot: Snapshot<T, K>) => void) => void;
  removeAllListeners: (event?: string) => void,
}

interface SnapshotEventHandlers<T extends BaseData<any>, K extends T = T> {
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
    type: string,
    snapshotStore: SnapshotStore<T, K>,
    dataItems: RealtimeDataItem[],
    criteria: SnapshotWithCriteria<T, K>,
    category: Category,
    snapshotData: SnapshotData<T, K>
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
}

interface RecordManagement<T extends BaseData<any>, K extends T = T> {
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
}

interface SharedProperties<
  T extends BaseData<any>,
  K extends T = T,
  Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>
> {
  eventRecords: Record<string, EventRecord<T, K, Meta>[]> | null;
  records: Record<string, CalendarManagerStoreClass<T, K>[]> | null;
  eventIds: string[];
  eventsDetails?: Record<string, any>;
}

// Step 2:  Define the common SnapshotEvents interface
interface SnapshotEvents<
  T extends BaseData<any>,
  K extends T = T,
  Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>
  extends BaseEventCallbacks<T, K>,
          EventManagement<T, K>,
          SnapshotEventHandlers<T, K>,
          RecordManagement<T, K>,
  SharedProperties<T, K>,
  SnapshotSubscriberManagement<T, K, Meta>
{
  key?: string;
  target?: EventTarget; // Event target
  snapshotData?: SnapshotData<T, K>;
  dataItems?: RealtimeDataItem[];
}

export type { SharedProperties, SnapshotEvents };

