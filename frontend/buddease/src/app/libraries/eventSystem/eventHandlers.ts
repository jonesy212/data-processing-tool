// eventHandlers.ts
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { Attachment } from '@/app/documents/attachment/Attachment';
import { EventEmitter } from '@/app/libraries/eventSystem/eventEmitter'
import { EventHandler } from '@/app/typings/eventHandlers/eventTypes'
import { 
  SnapshotEvent, 
  BatchSnapshotEvent, 
  ErrorEvent, 
  SubscriptionEvent,
  EventContext,
} from '@/app/typings/snapshotTypes'
import { Snapshot } from '@/app/snapshots/Snapshot';
import { Snapshots } from '@/app/snapshots/LocalStorageSnapshotStore';
import { Subscriber } from '@/app/subscribers/Subscriber';



export interface EventHandlers<
  T,
  K,
  Meta,
  AttachmentType,
  ExcludedFields,
  IncludedFields
> {
  /* ---------- Emitters ---------- */
  emitSnapshotAdded(
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    context: EventContext<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    previousState?: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ): Promise<void>;

  emitSnapshotUpdated(
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    context: EventContext<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    previousState: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ): Promise<void>;

  emitSnapshotRemoved(
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    context: EventContext<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ): Promise<void>;

  emitBatchSnapshot(
    snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    context: EventContext<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ): Promise<void>;

  emitSubscriptionAdded(
    subscriber: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    context: EventContext<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ): Promise<void>;

  emitSubscriptionRemoved(
    subscriber: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    context: EventContext<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ): Promise<void>;

  emitError(
    error: Error,
    context: EventContext<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    recoveryAttempt?: number
  ): Promise<void>;

  emitStoreInitialized(
    context: EventContext<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ): Promise<void>;

  emitStoreDisposed(
    context: EventContext<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ): Promise<void>;

  /* ---------- Listeners ---------- */
  onSnapshotAdded(
    handler: EventHandler<SnapshotEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>
  ): string;

  onSnapshotRemoved(
    handler: EventHandler<SnapshotEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>
  ): string;

  onSnapshotUpdated(
    handler: EventHandler<SnapshotEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>
  ): string;

  onError(
    handler: EventHandler<ErrorEvent>
  ): string;

  onStoreInitialized(
    handler: EventHandler<{ context: EventContext<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> }>
  ): string;

  /* ---------- Utilities ---------- */
  removeListener(
    event: keyof SnapshotEventMap<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    listenerId: string
  ): boolean;

  removeAllListeners(
    event?: keyof SnapshotEventMap<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ): void;

  getListenerCount(
    event?: keyof SnapshotEventMap<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ): number;
}

export interface  SnapshotEventMap<
  T extends BaseDataEntity = BaseDataRoot,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {
  'snapshot:added': SnapshotEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  'snapshot:updated': SnapshotEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  'snapshot:removed': SnapshotEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  'snapshot:batch': BatchSnapshotEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  'subscription:added': SubscriptionEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  'subscription:removed': SubscriptionEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  'error:occurred': ErrorEvent;
  'store:initialized': { context: EventContext<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> };
  'store:disposed': { context: EventContext<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> };
}

export class SnapshotEventHandlers<
  T extends BaseDataEntity = BaseDataRoot,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {
  private eventEmitter: EventEmitter<SnapshotEventMap<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>;

  constructor() {
    this.eventEmitter = new EventEmitter({
      maxListeners: 100,
      enableErrorHandling: true,
      enablePerformanceMonitoring: true
    });
  }

  // Snapshot lifecycle events
  async emitSnapshotAdded(
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    context: EventContext<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    previousState?: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ): Promise<void> {
    await this.eventEmitter.emit('snapshot:added', {
      type: 'snapshot:added',
      snapshot,
      context,
      previousState
    });
  }

  async emitSnapshotUpdated(
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    context: EventContext<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    previousState: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ): Promise<void> {
    await this.eventEmitter.emit('snapshot:updated', {
      type: 'snapshot:updated',
      snapshot,
      context,
      previousState
    });
  }

  async emitSnapshotRemoved(
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    context: EventContext<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ): Promise<void> {
    await this.eventEmitter.emit('snapshot:removed', {
      type: 'snapshot:removed',
      snapshot,
      context
    });
  }

  async emitBatchSnapshot(
    snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    context: EventContext<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ): Promise<void> {
    await this.eventEmitter.emit('snapshot:batch', {
      type: 'snapshot:batch',
      snapshots,
      context
    });
  }

  // Subscription events
  async emitSubscriptionAdded(
    subscriber: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    context: EventContext<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ): Promise<void> {
    await this.eventEmitter.emit('subscription:added', {
      type: 'subscription:added',
      subscriber,
      context,
      action: 'subscribe'
    });
  }

  async emitSubscriptionRemoved(
    subscriber: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    context: EventContext<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ): Promise<void> {
    await this.eventEmitter.emit('subscription:removed', {
      type: 'subscription:removed',
      subscriber,
      context,
      action: 'unsubscribe'
    });
  }

  // Error events
  async emitError(
    error: Error,
    context: EventContext<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    recoveryAttempt?: number
  ): Promise<void> {
    await this.eventEmitter.emit('error:occurred', {
      type: 'error:occurred',
      error,
      context,
      recoveryAttempt
    });
  }

  // Store lifecycle events
  async emitStoreInitialized(
    context: EventContext<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ): Promise<void> {
    await this.eventEmitter.emit('store:initialized', { context });
  }

  async emitStoreDisposed(
    context: EventContext<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ): Promise<void> {
    await this.eventEmitter.emit('store:disposed', { context });
  }

  // Event registration methods
  onSnapshotAdded(handler: EventHandler<SnapshotEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>): string {
    return this.eventEmitter.on('snapshot:added', handler);
  }

  onSnapshotUpdated(handler: EventHandler<SnapshotEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>): string {
    return this.eventEmitter.on('snapshot:updated', handler);
  }

  onError(handler: EventHandler<ErrorEvent>): string {
    return this.eventEmitter.on('error:occurred', handler);
  }

  onStoreInitialized(handler: EventHandler<{ context: EventContext<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> }>): string {
    return this.eventEmitter.on('store:initialized', handler);
  }

  // Utility methods
  removeListener(event: keyof SnapshotEventMap<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, listenerId: string): boolean {
    return this.eventEmitter.off(event, listenerId);
  }

  removeAllListeners(event?: keyof SnapshotEventMap<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): void {
    this.eventEmitter.offAll(event);
  }

  getListenerCount(event?: keyof SnapshotEventMap<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): number {
    return this.eventEmitter.listenerCount(event);
  }

  // Get the underlying event emitter for advanced usage
  getEventEmitter(): EventEmitter<SnapshotEventMap<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> {
    return this.eventEmitter;
  }
}