// notificationMiddleware.ts
import { MiddlewareFunction } from '@/app/middleware/core/types';

export const notificationMiddleware: MiddlewareFunction = async (context, next) => {
  const { operation, payload, store } = context;
  
  console.log(`[Notification Middleware] Preparing notifications for: ${operation}`);
  
  const result = await next(context);
  
  // Emit notifications based on operation result
  if (store?.eventSystem && result) {
    try {
      const eventContext = {
        source: 'middleware',
        operation,
        timestamp: new Date().toISOString(),
        userId: context.userId,
        storeId: store.storeId
      };
      
      switch (operation) {
        case 'addSnapshot':
          await store.eventSystem.emitSnapshotAdded(result, eventContext);
          break;
          
        case 'updateSnapshot':
          await store.eventSystem.emitSnapshotUpdated(result, eventContext);
          break;
          
        case 'removeSnapshot':
          await store.eventSystem.emitSnapshotRemoved(
            typeof payload === 'string' ? payload : payload.id, 
            eventContext
          );
          break;
          
        default:
          // Emit generic operation event
          await store.eventSystem.emitOperationCompleted(operation, result, eventContext);
          break;
      }
    } catch (error) {
      console.warn('Notification middleware failed to emit event:', error);
      // Don't throw - notification failures shouldn't break the operation
    }
  }
  
  return result;
};