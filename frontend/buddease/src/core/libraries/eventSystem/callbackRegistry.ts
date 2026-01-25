// callbackRegistry.ts
import type { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import type { Attachment } from '@/core/documents/attachment/Attachment';
import UniqueIDGenerator from '@/core/generators/GenerateUniqueIds';
import SnapshotStore from '@/core/snapshots/SnapshotStore';
import type { EventFilter, EventHandler } from '@/core/typings/eventHandlers/eventTypes';


export interface RegisteredCallback<
  T extends BaseDataEntity = BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {
  id: string;
  eventType: string;
  handler: EventHandler<T>; // Always receives T
  filter?: EventFilter<T>;
  priority: number;
  context?: any;
  isActive: boolean;
  storeName?: string;
  store?: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
}

export class CallbackRegistry {
  private callbacks: Map<string, RegisteredCallback<any, any, any, any, any, any>[]> = new Map();
  private callbackById: Map<string, RegisteredCallback<any, any, any, any, any, any>> = new Map();

  register<
    T extends BaseDataEntity = BaseDataEntity,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T
  >(
    eventType: string,
    handler: EventHandler<T>,
    options: {
      filter?: EventFilter<T>;
      priority?: number;
      context?: any;
      id?: string;
      storeName?: string;
      store?: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
    } = {}
  ): string {
    const callbackId = options.id || UniqueIDGenerator.generateId("callback");
    const priority = options.priority || 0;

    const callback: RegisteredCallback<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = {
      id: callbackId,
      eventType,
      handler,
      filter: options.filter,
      priority,
      context: options.context,
      isActive: true,
      storeName: options.storeName,
      store: options.store
    };

    if (!this.callbacks.has(eventType)) {
      this.callbacks.set(eventType, []);
    }

    const eventCallbacks = this.callbacks.get(eventType)!;
    eventCallbacks.push(callback);
    
    // Sort by priority (higher priority first)
    eventCallbacks.sort((a, b) => b.priority - a.priority);

    this.callbackById.set(callbackId, callback);
    return callbackId;
  }

  unregister(callbackId: string): boolean {
    const callback = this.callbackById.get(callbackId);
    if (!callback) return false;

    const eventCallbacks = this.callbacks.get(callback.eventType);
    if (eventCallbacks) {
      this.callbacks.set(
        callback.eventType,
        eventCallbacks.filter(cb => cb.id !== callbackId)
      );
    }

    this.callbackById.delete(callbackId);
    return true;
  }

  unregisterAll(eventType?: string): void {
    if (eventType) {
      const eventCallbacks = this.callbacks.get(eventType) || [];
      eventCallbacks.forEach(callback => {
        this.callbackById.delete(callback.id);
      });
      this.callbacks.delete(eventType);
    } else {
      this.callbacks.clear();
      this.callbackById.clear();
    }
  }

  getCallbacks<
    T extends BaseDataEntity = BaseDataEntity,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T
  >(eventType: string): RegisteredCallback<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] {
    const callbacks = this.callbacks.get(eventType);
    return callbacks?.filter(cb => cb.isActive) || [];
  }

  getCallback<
    T extends BaseDataEntity = BaseDataEntity,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T
  >(callbackId: string): RegisteredCallback<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined {
    return this.callbackById.get(callbackId);
  }

  setCallbackActive(callbackId: string, isActive: boolean): boolean {
    const callback = this.callbackById.get(callbackId);
    if (callback) {
      callback.isActive = isActive;
      return true;
    }
    return false;
  }

  // Execute callbacks for an event
  async executeCallbacks<
    T extends BaseDataEntity = BaseDataEntity,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T
  >(eventType: string, eventData: T): Promise<void> {
    const callbacks = this.getCallbacks<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>(eventType);
    const executionPromises: Promise<void>[] = [];

    for (const callback of callbacks) {
      if (!callback.isActive) continue;

      // Apply filter if present
      if (callback.filter && !callback.filter(eventData)) {
        continue;
      }

      try {
        const result = callback.handler(eventData);
        if (result instanceof Promise) {
          executionPromises.push(result);
        }
      } catch (error) {
        console.error(`Error in callback ${callback.id} for event ${eventType}:`, error);
        // Continue with other callbacks even if one fails
      }
    }

    if (executionPromises.length > 0) {
      await Promise.allSettled(executionPromises);
    }
  }

  getRegisteredEventTypes(): string[] {
    return Array.from(this.callbacks.keys());
  }

  getCallbackCount(eventType?: string): number {
    if (eventType) {
      const callbacks = this.callbacks.get(eventType);
      return callbacks?.filter(cb => cb.isActive).length || 0;
    }
    
    // Count only active callbacks
    let count = 0;
    for (const callbacks of this.callbacks.values()) {
      count += callbacks.filter(cb => cb.isActive).length;
    }
    return count;
  }

  getCallbacksByStore<
    T extends BaseDataEntity = BaseDataEntity,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T
  >(storeName: string): RegisteredCallback<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] {
    const allCallbacks: RegisteredCallback<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] = [];
    
    for (const callbacks of this.callbacks.values()) {
      allCallbacks.push(
        ...callbacks.filter(cb => cb.storeName === storeName)
      );
    }
    
    return allCallbacks;
  }

  getCallbacksByStoreInstance<
    T extends BaseDataEntity = BaseDataEntity,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T
  >(store: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): RegisteredCallback<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] {
    const allCallbacks: RegisteredCallback<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] = [];
    
    for (const callbacks of this.callbacks.values()) {
      allCallbacks.push(
        ...callbacks.filter(cb => cb.store === store)
      );
    }
    
    return allCallbacks;
  }

  unregisterByStore(storeName: string): void {
    for (const [eventType, callbacks] of this.callbacks.entries()) {
      const filteredCallbacks = callbacks.filter(cb => cb.storeName !== storeName);
      this.callbacks.set(eventType, filteredCallbacks);
      
      // Also remove from callbackById
      callbacks
        .filter(cb => cb.storeName === storeName)
        .forEach(cb => this.callbackById.delete(cb.id));
    }
  }

  unregisterByStoreInstance<
    T extends BaseDataEntity = BaseDataEntity,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T
  >(store: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): void {
    for (const [eventType, callbacks] of this.callbacks.entries()) {
      const filteredCallbacks = callbacks.filter(cb => cb.store !== store);
      this.callbacks.set(eventType, filteredCallbacks);
      
      // Also remove from callbackById
      callbacks
        .filter(cb => cb.store === store)
        .forEach(cb => this.callbackById.delete(cb.id));
    }
  }

  // Get all active callbacks for a specific store (both by name and instance)
  getAllCallbacksForStore<
    T extends BaseDataEntity = BaseDataEntity,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T
  >(storeNameOrInstance: string | SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): RegisteredCallback<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] {
    const isInstance = typeof storeNameOrInstance !== 'string';
    
    if (isInstance) {
      return this.getCallbacksByStoreInstance(storeNameOrInstance as any);
    } else {
      return this.getCallbacksByStore(storeNameOrInstance as string);
    }
  }

  // Clear all callbacks (for cleanup)
  clear(): void {
    this.callbacks.clear();
    this.callbackById.clear();
  }

  // Get stats about the registry
  getStats(): {
    totalCallbacks: number;
    activeCallbacks: number;
    eventTypes: number;
    stores: Set<string>;
  } {
    const stores = new Set<string>();
    let activeCallbacks = 0;
    let totalCallbacks = 0;

    for (const callbacks of this.callbacks.values()) {
      totalCallbacks += callbacks.length;
      activeCallbacks += callbacks.filter(cb => cb.isActive).length;
      
      callbacks.forEach(cb => {
        if (cb.storeName) {
          stores.add(cb.storeName);
        }
      });
    }

    return {
      totalCallbacks,
      activeCallbacks,
      eventTypes: this.callbacks.size,
      stores
    };
  }
}

// Create a global instance
export const globalCallbackRegistry = new CallbackRegistry();