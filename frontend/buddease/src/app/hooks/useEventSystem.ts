// useEventSystem.ts
import { useCallback, useRef, useEffect } from 'react';
import { SnapshotEventHandlers } from '@/app/libraries/eventSystem/eventHandlers';
import { Snapshot } from '@/app/snapshots/Snapshot';
import { CallbackRegistry } from '@/app/libraries/eventSystem/callbackRegistry';
import { 
  EventContext, 
  EventHandler,
  SnapshotEvent,
  ErrorEvent
} from '@/app/typings/eventHandlers/eventTypes'
import { BaseDataEntity, DefaultMeta, DefaultExcludedFields } from '@/config/BaseConfig';
import { Attachment } from '@/app/documents/attachment/Attachment';

export const useEventSystem = <
  T extends BaseDataEntity = BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>() => {
  const eventHandlersRef = useRef<SnapshotEventHandlers<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null>(null);
  const callbackRegistryRef = useRef<CallbackRegistry | null>(null);
  const contextRef = useRef<Partial<EventContext<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>>({});

  // Initialize event system
  useEffect(() => {
    eventHandlersRef.current = new SnapshotEventHandlers<
      T, K, Meta, AttachmentType, ExcludedFields, IncludedFields
    >();
    callbackRegistryRef.current = new CallbackRegistry();

    // Set up default context
    contextRef.current = {
      timestamp: new Date(),
      eventId: `system-${Date.now()}`,
      source: 'useEventSystem'
    };

    return () => {
      // Cleanup on unmount
      eventHandlersRef.current?.removeAllListeners();
      callbackRegistryRef.current?.unregisterAll();
    };
  }, []);

  // Update context
  const updateContext = useCallback((
    updates: Partial<EventContext<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>
  ) => {
    contextRef.current = { ...contextRef.current, ...updates };
  }, []);

  // Event emission methods that match your generic structure
  const emitSnapshotAdded = useCallback(async (
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    customContext?: Partial<EventContext<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>
  ) => {
    const context = { 
      ...contextRef.current, 
      ...customContext, 
      timestamp: new Date() 
    };
    
    await eventHandlersRef.current?.emitSnapshotAdded(snapshot, context);
    
    // Execute registered callbacks
    await callbackRegistryRef.current?.executeCallbacks('snapshot:added', {
      type: 'snapshot:added',
      snapshot,
      context: context as EventContext<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
    });
  }, []);

  const emitSnapshotUpdated = useCallback(async (
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    previousState: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    customContext?: Partial<EventContext<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>
  ) => {
    const context = { 
      ...contextRef.current, 
      ...customContext, 
      timestamp: new Date() 
    };
    
    await eventHandlersRef.current?.emitSnapshotUpdated(snapshot, previousState, context);
    
    await callbackRegistryRef.current?.executeCallbacks('snapshot:updated', {
      type: 'snapshot:updated',
      snapshot,
      context: context as EventContext<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      previousState
    });
  }, []);

  const emitError = useCallback(async (
    error: Error,
    customContext?: Partial<EventContext<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
    recoveryAttempt?: number
  ) => {
    const context = { 
      ...contextRef.current, 
      ...customContext, 
      timestamp: new Date() 
    };
    
    await eventHandlersRef.current?.emitError(error, context, recoveryAttempt);
    
    await callbackRegistryRef.current?.executeCallbacks('error:occurred', {
      type: 'error:occurred',
      error,
      context: context as EventContext<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      recoveryAttempt
    });
  }, []);

  // Event listener registration
  const onSnapshotAdded = useCallback((
    handler: EventHandler<SnapshotEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>
  ) => {
    return eventHandlersRef.current?.onSnapshotAdded(handler) || '';
  }, []);

  const onError = useCallback((
    handler: EventHandler<ErrorEvent>
  ) => {
    return eventHandlersRef.current?.onError(handler) || '';
  }, []);

  // Your mapSnapshotData function with proper event integration
const mapSnapshotData = useCallback(async (
  snapshotData: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  mappingOptions: {
    transform?: (data: T) => T;
    filter?: (data: T) => boolean;
    validate?: (data: T) => boolean;
  } = {}
) => {
  try {
    // Your mapping logic
    let mappedData = { ...snapshotData };
    
    // Apply transformations if provided
    if (mappingOptions.transform) {
      mappedData.data = mappingOptions.transform(snapshotData.data);
    }
    
    // Apply filters if provided
    if (mappingOptions.filter && !mappingOptions.filter(snapshotData.data)) {
      throw new Error('Snapshot data does not pass filter criteria');
    }
    
    // Apply validation if provided
    if (mappingOptions.validate && !mappingOptions.validate(snapshotData.data)) {
      throw new Error('Snapshot data validation failed');
    }
    
    // Update timestamp
    mappedData.timestamp = new Date();
    
    const eventSystem = useEventSystem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>()
    // Emit events as needed
    await eventSystem.emitSnapshotMapped(mappedData, {
      operation: 'mapSnapshotData',
      userId: userId,
      timestamp: new Date().toISOString(),
      source: 'mapSnapshotData',
      mappingOptions
    });
    
    // Return mapped data
    return mappedData;
  } catch (error) {
    await eventSystem.emitError(error as Error, {
      operation: 'mapSnapshotData',
      userId: userId,
      timestamp: new Date().toISOString(),
      snapshotId: snapshotData.id,
      mappingOptions
    });
    throw error;
  }
}, [eventSystem, userId]);

  return {
    // Event emission
    emitSnapshotAdded,
    emitSnapshotUpdated,
    emitSnapshotRemoved: eventHandlersRef.current?.emitSnapshotRemoved.bind(eventHandlersRef.current),
    emitBatchSnapshot: eventHandlersRef.current?.emitBatchSnapshot.bind(eventHandlersRef.current),
    emitError,
    emitStoreInitialized: eventHandlersRef.current?.emitStoreInitialized.bind(eventHandlersRef.current),

    // Event listening
    onSnapshotAdded,
    onSnapshotUpdated: eventHandlersRef.current?.onSnapshotUpdated.bind(eventHandlersRef.current),
    onSnapshotRemoved: eventHandlersRef.current?.onSnapshotRemoved.bind(eventHandlersRef.current),
    onError,
    onStoreInitialized: eventHandlersRef.current?.onStoreInitialized.bind(eventHandlersRef.current),

    // Your specific function
    mapSnapshotData,

    // Utility
    updateContext,
    removeListener: eventHandlersRef.current?.removeListener.bind(eventHandlersRef.current),
    removeAllListeners: eventHandlersRef.current?.removeAllListeners.bind(eventHandlersRef.current),
    getListenerCount: eventHandlersRef.current?.getListenerCount.bind(eventHandlersRef.current),

    // Direct access
    eventHandlers: eventHandlersRef.current,
    callbackRegistry: callbackRegistryRef.current
  };
};