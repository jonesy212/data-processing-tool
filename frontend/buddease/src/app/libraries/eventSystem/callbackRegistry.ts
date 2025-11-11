import { EventHandler, EventFilter } from '@/app/typings/eventHandlers/eventTypes';
import UniqueIDGenerator from '@/app/generators/GenerateUniqueIds';

export interface RegisteredCallback<T = any> {
  id: string;
  eventType: string;
  handler: EventHandler<T>;
  filter?: EventFilter<T>;
  priority: number;
  context?: any;
  isActive: boolean;
}

export class CallbackRegistry {
  private callbacks: Map<string, RegisteredCallback<any>[]> = new Map();
  private callbackById: Map<string, RegisteredCallback<any>> = new Map();

  register<T>(
    eventType: string,
    handler: EventHandler<T>,
    options: {
      filter?: EventFilter<T>;
      priority?: number;
      context?: any;
      id?: string;
    } = {}
  ): string {
    const callbackId = options.id || UniqueIDGenerator.generateId("callback");
    const priority = options.priority || 0;

    const callback: RegisteredCallback<T> = {
      id: callbackId,
      eventType,
      handler,
      filter: options.filter,
      priority,
      context: options.context,
      isActive: true
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

  getCallbacks<T>(eventType: string): RegisteredCallback<T>[] {
    return this.callbacks.get(eventType)?.filter(cb => cb.isActive) || [];
  }

  getCallback(callbackId: string): RegisteredCallback<any> | undefined {
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
  async executeCallbacks<T>(eventType: string, eventData: T): Promise<void> {
    const callbacks = this.getCallbacks<T>(eventType);
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
      return this.getCallbacks(eventType).length;
    }
    return this.callbackById.size;
  }

  getCallbacksByStore(storeName: string): RegisteredCallback<any>[] {
    const allCallbacks: RegisteredCallback<any>[] = [];
    for (const callbacks of this.callbacks.values()) {
      allCallbacks.push(...callbacks.filter(cb => cb.store === storeName));
    }
    return allCallbacks;
  }

  unregisterByStore(storeName: string): void {
    for (const [eventType, callbacks] of this.callbacks.entries()) {
      const filteredCallbacks = callbacks.filter(cb => cb.store !== storeName);
      this.callbacks.set(eventType, filteredCallbacks);
      
      // Also remove from callbackById
      callbacks
        .filter(cb => cb.store === storeName)
        .forEach(cb => this.callbackById.delete(cb.id));
    }
  }
}



// Create a global instance
export const globalCallbackRegistry = new CallbackRegistry();
