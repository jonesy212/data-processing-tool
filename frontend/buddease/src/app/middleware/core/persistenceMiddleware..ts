// persistenceMiddleware.ts
import { MiddlewareFunction, MiddlewareContext } from '@/types';

export const persistenceMiddleware: MiddlewareFunction = async (context, next) => {
  const { operation, payload, store } = context;
  
  // Skip if no store or persistence not enabled
  if (!store || !store.options?.persistence?.enabled) {
    return await next(context);
  }
  
  console.log(`[Persistence Middleware] Handling operation: ${operation}`);
  
  try {
    // Pre-persistence logic
    if (operation === 'addSnapshot' && store.options.persistence.strategy === 'autoSave') {
      context.metadata = {
        ...context.metadata,
        persistenceLayer: store.options.persistence.strategy,
        autoSave: true
      };
    }
    
    const result = await next(context);
    
    // Post-persistence logic
    if (operation.includes('Snapshot') && store.getDataStore) {
      const dataStore = await store.getDataStore();
      if (dataStore?.persist) {
        await dataStore.persist(operation, result);
      }
    }
    
    return result;
    
  } catch (error) {
    console.error(`[Persistence Middleware] Persistence failed for ${operation}:`, error);
    // Don't throw - persistence failures shouldn't break the operation
    return await next(context);
  }
};