// SampleSnapshot.ts
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { StructuredMetadata } from "@/app/config/StructuredMetadata";
import { Attachment } from '@/app/documents/attachment/Attachment';
import { CombinedEvents } from "@/app/hooks/useSnapshotManager";
import type {  Snapshot } from '@/app/snapshots/Snapshot';

// Define SampleSnapshot implementing Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
class SampleSnapshot<
  T extends BaseDataEntity = SnapshotEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> implements Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  
  id: string;
  data: Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>;
  meta: StructuredMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  events: CombinedEvents<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  mappedMeta?: Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>;
  mappedSnapshot?: Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>;
  
  // Add CallbackRegistry for callback management
  private callbackRegistry: CallbackRegistry = new CallbackRegistry();

  constructor(
    id: string,
    data: Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
    meta: StructuredMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    events?: CombinedEvents<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ) {
    this.id = id;
    this.data = data;
    this.meta = meta;
    this.events = events ?? {
      subscribers: new Map(),
      trigger: () => {},
      onSnapshotAdded: () => {},
      onSnapshotRemoved: () => {},
      onSnapshotUpdated: () => {},
      removeSubscriber: () => {},
      onError: () => {},
      once: () => {},
      addRecord: () => {},
      unsubscribe: () => {},
    };
  }

  // Use CallbackRegistry for callback management
  registerCallback(
    eventType: string,
    handler: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void,
    options?: { priority?: number; id?: string }
  ): string {
    return this.callbackRegistry.register(eventType, handler, options);
  }

  unregisterCallback(callbackId: string): boolean {
    return this.callbackRegistry.unregister(callbackId);
  }

  executeCallbacks(eventType: string, snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): Promise<void> {
    return this.callbackRegistry.executeCallbacks(eventType, snapshot);
  }

  // Your existing method - now uses CallbackRegistry
  callbacks(snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): { snapshots: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] } {
    console.log("callback called");
    
    // Execute any registered callbacks for this snapshot
    this.executeCallbacks('snapshotUpdate', snapshot).catch(error => {
      console.error('Error executing callbacks:', error);
    });
    
    return { snapshots: [snapshot] };
  }

  // Example implementation of setData
  setData(id: string, newData: Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>): void {
    this.id = id;
    this.data = newData;
    
    // Trigger callbacks when data changes
    this.executeCallbacks('dataChanged', this as any).catch(console.error);
  }
}