import { MiddlewareFunction, MiddlewareContext } from '../types';
import { snapshotValidators } from '@/app/utils/snapshotValidators';

export const validationMiddleware: MiddlewareFunction = async (context, next) => {
  const { operation, payload, store } = context;
  
  console.log(`[Validation Middleware] Validating operation: ${operation}`);
  
  try {
    // Validate based on operation type
    switch (operation) {
      case 'addSnapshot':
        await validateAddSnapshot(payload, store);
        break;
        
      case 'updateSnapshot':
        await validateUpdateSnapshot(payload, store);
        break;
        
      case 'removeSnapshot':
        await validateRemoveSnapshot(payload, store);
        break;
        
      default:
        // Generic validation for unknown operations
        if (payload && typeof payload === 'object') {
          await snapshotValidators.validateGeneric(payload);
        }
        break;
    }
    
    context.metadata = {
      ...context.metadata,
      validatedAt: new Date(),
      validator: 'validationMiddleware',
      operation
    };
    
    return await next(context);
    
  } catch (error) {
    console.error(`[Validation Middleware] Validation failed for ${operation}:`, error);
    throw error;
  }
};

async function validateAddSnapshot(payload: any, store: any) {
  if (!payload?.id) {
    throw new Error('Snapshot must have an ID');
  }
  
  if (!payload.timestamp) {
    payload.timestamp = new Date();
  }
  
  // Use your existing validators
  await snapshotValidators.validateSnapshotStructure(payload);
  
  // Validate against store schema if available
  if (store?.getSchema()) {
    await snapshotValidators.validateAgainstSchema(payload, store.getSchema());
  }
}

async function validateUpdateSnapshot(payload: any, store: any) {
  if (!payload?.id) {
    throw new Error('Snapshot ID required for update');
  }
  
  if (!payload.updates || typeof payload.updates !== 'object') {
    throw new Error('Updates object required');
  }
  
  // Check if snapshot exists
  const existing = await store?.findSnapshot(payload.id);
  if (!existing) {
    throw new Error(`Snapshot with ID ${payload.id} not found`);
  }
}

async function validateRemoveSnapshot(payload: any, store: any) {
  if (!payload) {
    throw new Error('Snapshot ID or object required for removal');
  }
  
  const snapshotId = typeof payload === 'string' ? payload : payload.id;
  if (!snapshotId) {
    throw new Error('Valid snapshot identifier required');
  }
}