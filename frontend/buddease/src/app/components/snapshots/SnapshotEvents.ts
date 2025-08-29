import { BaseDataEntity, BaseDataRoot, DefaultExcludedFields, DefaultMeta } from '@/app/configs/BaseConfig';
import { UnsubscribeDetails } from '@/app/components/event/DynamicEventHandlerExample';
import { BaseData } from '@/app/components/models/data/Data';
import { Callback, Snapshot, SnapshotData, SnapshotsArray, SnapshotWithCriteria } from '@/app/components/snapshots';
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
import { Subscriber } from '../users/Subscriber';
import { SnapshotContext } from '@/app/components/snapshots/SnapshotSubscriberManagement'
import { ExcludedFields } from '@/app/components/routing/Fields';

interface BaseEventCallbacks<
  T extends BaseDataEntity = BaseDataRoot,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
> {
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

interface EventManagement<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
> {
  // Global event subscription
  subscribe: (
    snapshotId: string,
    unsubscribe: UnsubscribeDetails,
    subscriber: Subscriber<T, K> | null,
    data: T,
    event: string | Event,
    callback: Callback<SnapshotContext<T, K, Meta, ExcludedFields>>
  ) => [] | SnapshotsArray<T, K, Meta>;
  
  
  unsubscribe: (
    snapshotId: string,
    unsubscribeDetails: UnsubscribeDetails,
    callback: SubscriberCallbackType<T, K> | null,
    ctx?: SnapshotContext<T, K, Meta, ExcludedFields>
  ) => void;

  emit: (
    event: string,
    ctx: SnapshotContext<T, K, Meta, ExcludedFields> & {
      snapshotId: string;
      type: string;
      dataItems: RealtimeDataItem<T, K, Meta, ExcludedFields>[];
      criteria?: SnapshotWithCriteria<T, K>;
    }
  ) => void;

  once: (event: string, callback: (snapshot: Snapshot<T, K>) => void) => void;
  removeAllListeners: (event?: string) => void,
}

export interface SnapshotEventHandlers<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>
> {
  /** Mainstream / standard snapshot event hooks */
  onSnapshotAdded: (event: string, ctx: SnapshotContext<T, K, Meta>) => void;
  onSnapshotRemoved: (event: string, ctx: SnapshotContext<T, K, Meta> & { type: string }) => void;
  onSnapshotUpdated: (event: string, ctx: SnapshotContext<T, K, Meta> & { snapshotId: string; data: Map<string, Snapshot<T, K>>; events: Record<string, CalendarManagerStoreClass<T, K>[]>; store: SnapshotStore<any, K> }) => void;
  onError: (event: string, ctx: SnapshotContext<T, K, Meta> & { error: Error }) => void;

  /** Optional / alternative event hooks */
  beforeSnapshotAdd?: (event: string, ctx: SnapshotContext<T, K, Meta>) => void;
  afterSnapshotRemove?: (event: string, ctx: SnapshotContext<T, K, Meta>) => void;

  /** Primary sources / context */
  logSnapshotEvent?: (event: string, ctx: SnapshotContext<T, K, Meta>) => void;
}


interface RecordManagement<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>
> {
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
    dataItems: RealtimeDataItem<T, K, Meta, ExcludedFields>[],
    criteria: SnapshotWithCriteria<T, K>,
    category: Category
  ) => void;
}

interface SharedProperties<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>
> {
  eventRecords: Record<string, EventRecord<T, K, Meta>[]> | null;
  records: Record<string, CalendarManagerStoreClass<T, K>[]> | null;
  eventIds: string[];
  eventsDetails?: Record<string, any>;
}

 interface SnapshotEvents<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
> extends
  BaseEventCallbacks<T, K, Meta>,
  EventManagement<T, K, Meta, ExcludedFields>,
  SnapshotEventHandlers<T, K, Meta>,
  RecordManagement<T, K, Meta>,
  SharedProperties<T, K>,
  SnapshotSubscriberManagement<T, K, Meta, ExcludedFields>
{
  key?: string;
  target?: EventTarget; // Event target
  snapshotData?: SnapshotData<T, K>;
  dataItems?: RealtimeDataItem<T, K, Meta, ExcludedFields>[];
}

export type { SharedProperties, SnapshotEvents };

