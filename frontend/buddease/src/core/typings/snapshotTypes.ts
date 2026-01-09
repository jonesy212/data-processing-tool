// snapshotTypes.ts
import type { DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import type { UnifiedMetadata } from "@/core/config/MetaDataOptions";
import type { Attachment } from '@/core/documents/attachment/Attachment';
import type { Snapshots } from "@/core/snapshots/LocalStorageSnapshotStore";
import SnapshotStore from "@/core/snapshots/SnapshotStore";
import type { Snapshot } from '@/core/snapshots/Snapshot';
import type { BaseEventCallbacks, EventManagement, ExtractContextArgs, RecordManagement, SharedProperties, SnapshotEventBase } from '@/core/snapshots/SnapshotEvents';
import type { SnapshotContext, SnapshotSubscriberManagement } from '@/core/snapshots/SnapshotSubscriberManagement';
import type { BaseDataEntity } from "@/core/snapshots/ValidationRule";
import CalendarManagerStoreClass from '@/core/state/stores/CalendarManagerStore';
import { Subscriber } from '@/core/subscribers/Subscriber';
import type { SubscriberCollection } from '@/core/subscribers/SubscriberCollection';
import type { EventData } from '@/utils/ethereumUtils';
;

// Simplified generic structure to match your function signature
export interface SnapshotEvent<
  T extends BaseDataEntity = BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {
  type: string;
  snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  context: EventContext<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  previousState?: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  timestamp?: Date;
  source?: string;
}

export interface BatchSnapshotEvent<
  T extends BaseDataEntity = BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {
  type: string;
  snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  context: EventContext<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
}

export interface EventContext<
  T extends BaseDataEntity = BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {
  timestamp: Date;
  eventId: string;
  source: string;
  userId?: string;
  metadata?: UnifiedMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  // Add any additional context fields you need
  storeId?: string;
  operation?: string;
}


// Create a comprehensive merged interface
interface MergedSnapshotBase<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> extends SnapshotEventBase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    SnapshotSubscriberManagement<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  subscribers?: SubscriberCollection<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]; // Optional
}

export interface BaseSnapshotEventHandlers<
  T extends BaseDataEntity = BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {
  // Core event handlers with consistent signatures
  onSnapshotAdded: (event: string, ctx: SnapshotContext<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;
  onSnapshotRemoved: (event: string, ctx: SnapshotContext<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> & { type: string }) => void;
  onSnapshotUpdated: (event: string, ctx: SnapshotContext<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> & {
    snapshotId: string;
    data: Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>;
    events: Record<string, CalendarManagerStoreClass<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>;
    store: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  }) => void;
  onError?: (event: string, ctx: SnapshotContext<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> & { error: Error }) => void;
  
  // Optional hooks
  beforeSnapshotAdd?: (event: string, ctx: SnapshotContext<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;
  afterSnapshotRemove?: (event: string, ctx: SnapshotContext<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;
  logSnapshotEvent?: (event: string, ctx: SnapshotContext<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;
}


export interface SnapshotEvents<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> extends MergedSnapshotBase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  BaseEventCallbacks<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  EventManagement<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  BaseSnapshotEventHandlers<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, // Use base instead of full
  RecordManagement<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  SharedProperties<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  
    // Additional event-specific properties
    eventType?: string;
    eventName?: string;
    eventData?: EventData;
    eventTimestamp?: Date;
    eventSource?: string;

    // Use the full typed event handlers internally
    eventHandlers: {
      onSnapshotAdded?: (event: SnapshotEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;
      onSnapshotUpdated?: (event: SnapshotEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;
      onSnapshotRemoved?: (event: SnapshotEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;
      onError?: (event: string, ctx: SnapshotContext<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> & { error: Error }) => void;
    };

    // Trigger methods now share the same tuple
    trigger?: (
      event: string | SnapshotEvents<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      ...args: ExtractContextArgs<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
    ) => void;

    on?: (
      event: string,
      callback: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void,
      ...args: ExtractContextArgs<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
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
      ...args: ExtractContextArgs<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
    ) => void;
    // Event handlers
    onEvent?: (event: Event, ...args: ExtractContextArgs<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;
    beforeEvent?: (event: Event, ...args: ExtractContextArgs<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => boolean | void;
    afterEvent?: (event: Event, ...args: ExtractContextArgs<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;
}


export interface ErrorEvent {
  type: string;
  error: Error;
  context: EventContext<any, any, any, any, any, any>;
  recoveryAttempt?: number;
}

export interface SubscriptionEvent<
  T extends BaseDataEntity = BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
  > {
  type: string;
  subscriber: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  context: EventContext<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  action: 'subscribe' | 'unsubscribe';
}
