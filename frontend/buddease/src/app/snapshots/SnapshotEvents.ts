import { UnsubscribeDetails } from '@/app/components/event/DynamicEventHandlerExample';
import { ExcludedFields } from '@/app/components/routing/Fields';
import { Callback, Snapshot, SnapshotCoreBase, SnapshotData, SnapshotsArray, SnapshotWithCriteria } from '@/app/snapshots';
import SnapshotStore from '@/app/snapshots/SnapshotStore';
import { SnapshotContext, SnapshotSubscriberManagement } from "@/app/snapshots/SnapshotSubscriberManagement";
import CalendarManagerStoreClass from "@/app/state/stores/CalendarManagerStore";
import { Attachment } from '@/app/documents/attachment/Attachment';

import { BaseDataEntity, BaseDataRoot, DefaultExcludedFields, DefaultMeta } from '@/config/BaseConfig';
import { Category } from '@/app/libraries/categories/generateCategoryProperties';
import { RealtimeDataItem } from '@/models/realtime/RealtimeData';
import { EventRecord } from '@/app/projects/DataAnalysisPhase/DataProcessing/DataStore';
import { SubscriberCallbackType } from "@/app/subscriptions/Subscription";
import { Subscriber } from '@/users/Subscriber';
import { SubscriberCollection } from '@/users/SubscriberCollection';

interface BaseEventCallbacks<
  T extends BaseDataEntity = BaseDataRoot,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {
  onInitialize?: () => void;

  on?: (
    event: string,
    callback: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void,
    ...args: ExtractContextArgs<T, K, Meta, ExcludedFields>
  ) => void;

  off?: (
    event: string,
    callback: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void,
    unsubscribeDetails?: {
      userId: string;
      snapshotId: string;
      unsubscribeType: string;
      unsubscribeDate: Date;
      unsubscribeReason: string;
      unsubscribeData: any;
    },
    ...args: ExtractContextArgs<T, K, Meta, ExcludedFields>
  ) => void;

  trigger?: (
    event: string | SnapshotEvents<T, K, Meta, ExcludedFields>,
    eventDate: Date,
    ...args: ExtractContextArgs<T, K, Meta, ExcludedFields>
  ) => void;
}



type ExtractContextArgs<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> =
  | [
      Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      string,
      SubscriberCollection<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      RealtimeDataItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
      Category?,
      string?,
      SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>? 
    ];


interface EventManagement<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {
  // Global event subscription
  subscribe: (
    snapshotId: string,
    unsubscribe: UnsubscribeDetails,
    subscriber: Subscriber<T, K, Meta, ExcludedFields> | null,
    data: T,
    event: string | Event,
    callback: Callback<SnapshotContext<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
    value: T
  ) => [] | SnapshotsArray<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  
  
  unsubscribe: (
    snapshotId: string,
    unsubscribeDetails: UnsubscribeDetails,
    callback: SubscriberCallbackType<T, K, Meta, ExcludedFields> | null,
    ctx?: SnapshotContext<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ) => void;

   emit: (
    event: string,
    ...args: ExtractContextArgs<T, K, Meta, ExcludedFields>
  ) => void;


  once: (event: string, callback: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void) => void;
  removeAllListeners: (event?: string) => void,
}

export interface SnapshotEventHandlers<
  T extends BaseDataEntity = BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = keyof T,
  IncludedFields extends keyof T = keyof T
> {
  onSnapshotAdded: (event: string, ctx: SnapshotContext<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;
  onSnapshotRemoved: (event: string, ctx: SnapshotContext<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> & { type: string }) => void;
  onSnapshotUpdated: (event: string, ctx: SnapshotContext<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> & {
    snapshotId: string;
    data: Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>;
    events: Record<string, CalendarManagerStoreClass<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>;
    store: SnapshotStore<any, K>;
  }) => void;
  onError: (event: string, ctx: SnapshotContext<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> & { error: Error }) => void;

  // Optional hooks
  beforeSnapshotAdd?: (event: string, ctx: SnapshotContext<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;
  afterSnapshotRemove?: (event: string, ctx: SnapshotContext<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;
  logSnapshotEvent?: (event: string, ctx: SnapshotContext<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;
}

interface RecordManagement<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>
> {
  addRecord: (
    event: string,
    record: CalendarManagerStoreClass<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    callback: (snapshot: CalendarManagerStoreClass<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void
  ) => void;
  removeSubscriber: (
    event: string,
    snapshotId: string,
    ...args: ExtractContextArgs<T, K, Meta, ExcludedFields>
  ) => void;
}

interface SharedProperties<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {
  eventRecords: Record<string, EventRecord<T, K, Meta>[]> | null;
  records: Record<string, CalendarManagerStoreClass<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]> | null;
  eventIds: string[];
  eventsDetails?: Record<string, any>;
}

interface SnapshotEventBase<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>
> extends SnapshotCoreBase<T, K, Meta, ExcludedFields> {
  key?: string;
  target?: EventTarget;
  snapshotData?: SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  dataItems?: RealtimeDataItem<T, K, Meta, ExcludedFields>[];
}


interface SnapshotEvents<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> extends SnapshotEventBase<T, K, Meta, ExcludedFields>,
    BaseEventCallbacks<T, K, Meta>,
    EventManagement<T, K, Meta, ExcludedFields>,
    SnapshotEventHandlers<T, K, Meta>,
    RecordManagement<T, K, Meta>,
    SharedProperties<T, K, Meta, ExcludedFields>,
    SnapshotSubscriberManagement<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
{
  // Additional event-specific properties
  eventType?: string;
  eventName?: string;
  eventData?: any;
  eventTimestamp?: Date;
  eventSource?: string;

  // Event handlers
  onEvent?: (event: Event, ...args: ExtractContextArgs<T, K, Meta, ExcludedFields>) => void;
  beforeEvent?: (event: Event, ...args: ExtractContextArgs<T, K, Meta, ExcludedFields>) => boolean | void;
  afterEvent?: (event: Event, ...args: ExtractContextArgs<T, K, Meta, ExcludedFields>) => void;

  // Trigger methods now share the same tuple
  trigger?: (
    event: string | SnapshotEvents<T, K, Meta, ExcludedFields>,
    ...args: ExtractContextArgs<T, K, Meta, ExcludedFields>
  ) => void;

  on?: (
    event: string,
    callback: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void,
    ...args: ExtractContextArgs<T, K, Meta, ExcludedFields>
  ) => void;

  off?: (
    event: string,
    callback: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void,
    unsubscribeDetails?: {
      userId: string;
      snapshotId: string;
      unsubscribeType: string;
      unsubscribeDate: Date;
      unsubscribeReason: string;
      unsubscribeData: any;
    },
    ...args: ExtractContextArgs<T, K, Meta, ExcludedFields>
  ) => void;
}



function createContextArgs<  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>
>(
  ...args: ExtractContextArgs<T, K, Meta, ExcludedFields>
) {
  return args;
}

export type { SharedProperties, SnapshotEvents };

export { createContextArgs }

