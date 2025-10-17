// eventTypes.ts
import { Attachment } from "@/app/documents/attachment/Attachment";
import { Snapshots } from "@/app/snapshots/LocalStorageSnapshotStore";
import { Snapshot } from "@/app/snapshots/Snapshot";
import { BaseDataEntity } from "@/app/snapshots/ValidationRule";
import { Subscriber } from '@/app/subscribers/Subscriber';
import { DefaultMeta } from '@/config/BaseConfig';
import { UnifiedMetadata } from "@/config/MetaDataOptions";

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

interface SnapshotEvents<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> extends SnapshotEventBase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    BaseEventCallbacks<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    EventManagement<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    SnapshotEventHandlers<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    RecordManagement<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    SharedProperties<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    SnapshotSubscriberManagement<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
{
  // Additional event-specific properties
  eventType?: string;
  eventName?: string;
  eventData?: any;
  eventTimestamp?: Date;
  eventSource?: string;

    // Use the full typed event handlers internally
  eventHandlers: {
    onSnapshotAdded?: (event: SnapshotEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;
    onSnapshotUpdated?: (event: SnapshotEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;
    onSnapshotRemoved?: (event: SnapshotEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;
    onError?: (event: ErrorEvent) => void;
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

export type EventHandler<T = any> = (event: T) => void | Promise<void>;
export type EventFilter<T = any> = (event: T) => boolean;

export interface EventListener<T = any> {
  id: string;
  handler: EventHandler<T>;
  filter?: EventFilter<T>;
  once?: boolean;
}

export interface EventEmitterConfig {
  maxListeners?: number;
  enableErrorHandling?: boolean;
  enablePerformanceMonitoring?: boolean;
}