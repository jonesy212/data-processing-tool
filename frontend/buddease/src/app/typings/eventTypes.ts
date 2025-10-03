// eventTypes.ts
import { Snapshots } from "@/app/snapshots/LocalStorageSnapshotStore";
import { Snapshot } from "@/app/snapshots/Snapshot";
import { BaseDataEntity } from "@/app/snapshots/ValidationRule";
import { Subscriber } from '@/app/users/Subscriber';
import { DefaultMeta } from "@/config/BaseConfig";
import { Attachment } from "@/documents/Attachment/attachment";
import { UnifiedMetadata } from "@/server/database/MetaDataOptions";

// Simplified generic structure to match your function signature
export interface SnapshotEvent<
  T extends BaseDataEntity = BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = keyof T,
  IncludedFields extends keyof T = keyof T
> {
  type: string;
  snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  context: EventContext<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  previousState?: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
}

export interface BatchSnapshotEvent<
  T extends BaseDataEntity = BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = keyof T,
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
  ExcludedFields extends keyof T = keyof T,
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

// Simplified interface for your specific SnapshotEvents type
export interface SnapshotEvents<
  T extends BaseDataEntity = BaseDataEntity,
  K extends T = T
> {
  onSnapshotAdded?: (event: SnapshotEvent<T, K>) => void;
  onSnapshotUpdated?: (event: SnapshotEvent<T, K>) => void;
  onSnapshotRemoved?: (event: SnapshotEvent<T, K>) => void;
  onError?: (event: ErrorEvent) => void;
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
  ExcludedFields extends keyof T = keyof T,
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