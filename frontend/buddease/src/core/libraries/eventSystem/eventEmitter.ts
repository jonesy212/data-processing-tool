eventEmitter.ts
import UniqueIDGenerator from '@/core/generators/GenerateUniqueIds';
import {
    EventEmitterConfig,
    EventFilter,
    EventHandler,
    EventListener
} from '@/core/typings/eventHandlers/eventTypes';

export class EventEmitter<T extends Record<string, any>> {
  private listeners: Map<keyof T, EventListener<T[keyof T]>[]> = new Map();
  private config: EventEmitterConfig;
  private isEmitting: Set<keyof T> = new Set();

  constructor(config: EventEmitterConfig = {}) {
    this.config = {
      maxListeners: 50,
      enableErrorHandling: true,
      enablePerformanceMonitoring: false,
      ...config
    };
  }

  on<K extends keyof T>(
    event: K, 
    handler: EventHandler<T[K]>, 
    filter?: EventFilter<T[K]>,
    id?: string
  ): string {
    const listenerId = id || UniqueIDGenerator.generateId("listener");
    const listener: EventListener<T[K]> = {
      id: listenerId,
      handler,
      filter
    };

    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }

    const eventListeners = this.listeners.get(event)!;
    
    // Check max listeners
    if (eventListeners.length >= (this.config.maxListeners || 50)) {
      console.warn(`Event ${String(event)} has reached maximum listeners (${this.config.maxListeners})`);
    }

    eventListeners.push(listener);
    return listenerId;
  }

  once<K extends keyof T>(
    event: K, 
    handler: EventHandler<T[K]>, 
    filter?: EventFilter<T[K]>
  ): string {
    const listenerId = id || UniqueIDGenerator.generateId("listener");

    const onceHandler: EventHandler<T[K]> = (eventData) => {
      this.off(event, listenerId);
      return handler(eventData);
    };

    return this.on(event, onceHandler, filter, listenerId);
  }

  off<K extends keyof T>(event: K, listenerId: string): boolean {
    const eventListeners = this.listeners.get(event);
    if (!eventListeners) return false;

    const initialLength = eventListeners.length;
    this.listeners.set(
      event, 
      eventListeners.filter(listener => listener.id !== listenerId)
    );

    return initialLength !== this.listeners.get(event)!.length;
  }

  offAll(event?: keyof T): void {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }

  async emit<K extends keyof T>(event: K, data: T[K]): Promise<void> {
    if (this.isEmitting.has(event)) {
      console.warn(`Recursive emission detected for event: ${String(event)}`);
      return;
    }

    this.isEmitting.add(event);
    
    try {
      const eventListeners = this.listeners.get(event) || [];
      const executionPromises: Promise<void>[] = [];

      for (const listener of eventListeners) {
        // Apply filter if present
        if (listener.filter && !listener.filter(data)) {
          continue;
        }

        // Execute handler
        try {
          const result = listener.handler(data);
          if (result instanceof Promise) {
            executionPromises.push(result);
          }
        } catch (error) {
          if (this.config.enableErrorHandling) {
            await this.handleHandlerError(error, event, listener.id, data);
          } else {
            throw error;
          }
        }
      }

      // Wait for all async handlers to complete
      if (executionPromises.length > 0) {
        await Promise.allSettled(executionPromises);
      }
    } finally {
      this.isEmitting.delete(event);
    }
  }

  private async handleHandlerError(
    error: any, 
    event: keyof T, 
    listenerId: string, 
    data: any
  ): Promise<void> {
    console.error(`Error in event handler for ${String(event)} (listener: ${listenerId}):`, error);
    
    // Emit error event if there are listeners for it
    if (this.listeners.has('error' as keyof T)) {
      await this.emit('error' as keyof T, {
        error,
        event: String(event),
        listenerId,
        data
      } as any);
    }
  }

  listenerCount(event?: keyof T): number {
    if (event) {
      return this.listeners.get(event)?.length || 0;
    }
    
    return Array.from(this.listeners.values()).reduce(
      (total, listeners) => total + listeners.length, 0
    );
  }

  getEventNames(): (keyof T)[] {
    return Array.from(this.listeners.keys());
  }

  // Batch emission for performance
  async emitBatch<K extends keyof T>(events: Array<{ event: K; data: T[K] }>): Promise<void> {
    for (const { event, data } of events) {
      await this.emit(event, data);
    }
  }
}