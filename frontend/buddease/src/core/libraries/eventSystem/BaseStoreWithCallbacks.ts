// BaseStoreWithCallbacks.ts
import { CallbackRegistry, globalCallbackRegistry } from '@/core/libraries/eventSystem/callbackRegistry';
import { EventHandler } from '@/core/typings/eventHandlers/eventTypes';

export abstract class BaseStoreWithCallbacks {
  protected storeName: string;
  protected callbackRegistry: CallbackRegistry;
  private registeredCallbackIds: Set<string> = new Set();

  constructor(storeName: string, registry: CallbackRegistry = globalCallbackRegistry) {
    this.storeName = storeName;
    this.callbackRegistry = registry;
  }

  // Method to register callbacks from this store
  protected registerCallback<T>(
    eventType: string,
    handler: EventHandler<T>,
    options: {
      filter?: any;
      priority?: number;
      context?: any;
      id?: string;
    } = {},
  ): string {
    const callbackId = this.callbackRegistry.register(eventType, handler, {
      ...options,
      storeName: this.storeName
    });
    this.registeredCallbackIds.add(callbackId);
    return callbackId;
  }

  // Method to handle incoming actions/dispatches
  public callback(action: any): void {
    // Execute callbacks for this specific action type
    this.callbackRegistry.executeCallbacks(action.type, action)
      .catch(error => {
        console.error(`Error executing callbacks for action ${action.type} in ${this.storeName}:`, error);
      });
  }

  // Clean up all callbacks registered by this store
  public dispose(): void {
    for (const callbackId of this.registeredCallbackIds) {
      this.callbackRegistry.unregister(callbackId);
    }
    this.registeredCallbackIds.clear();
  }

  // Get all callbacks registered by this store
  public getRegisteredCallbacks() {
    return this.callbackRegistry.getCallbacksByStore(this.storeName);
  }
}