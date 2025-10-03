// loggingMiddleware.ts
import { MiddlewareFunction, MiddlewareContext } from '../types';

export const loggingMiddleware: MiddlewareFunction = async (context, next) => {
  const { operation, payload, timestamp, store } = context;
  const startTime = performance.now();
  
  const logContext = {
    operation,
    storeId: store?.storeId,
    timestamp: timestamp.toISOString(),
    payloadSize: payload ? JSON.stringify(payload).length : 0,
    userId: context.userId
  };
  
  console.log(`[Logging Middleware] Starting operation:`, logContext);
  
  try {
    const result = await next(context);
    const endTime = performance.now();
    
    console.log(`[Logging Middleware] Completed operation:`, {
      ...logContext,
      duration: `${(endTime - startTime).toFixed(2)}ms`,
      success: true
    });
    
    return result;
  } catch (error) {
    const endTime = performance.now();
    
    console.error(`[Logging Middleware] Failed operation:`, {
      ...logContext,
      duration: `${(endTime - startTime).toFixed(2)}ms`,
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false
    });
    
    throw error;
  }
};