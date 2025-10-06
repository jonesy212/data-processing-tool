// auditMiddleware.ts
import { MiddlewareFunction, MiddlewareContext } from '@/types';
import { AuditEntry, BaseDataEntity, DefaultMeta } from '@/config//ConfigurationService';
import { User } from '@/app/models/data/Data'; // Adjust import path as needed

export interface AuditMiddlewareConfig<
  T extends BaseDataEntity = any,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>
> {
  enabled: boolean;
  logLevel?: 'info' | 'debug' | 'warn' | 'error';
  includePayload?: boolean;
  includeResult?: boolean;
  maxPayloadSize?: number;
  captureChanges?: boolean;
  auditService?: {
    log: (entry: AuditEntry<T, K, Meta>) => Promise<void>;
  };
  // User context provider
  getUserContext?: (context: MiddlewareContext<any, any, any, any, any, any>) => Promise<User | { id: string; name?: string }>;
  // Entity type resolver
  resolveEntityType?: (operation: string, payload: any) => string;
  // Change detector
  detectChanges?: (operation: string, payload: any, result: any, context: MiddlewareContext<any, any, any, any, any, any>) => 
    Promise<Partial<Record<keyof any, { from: any; to: any }>>>;
}

export const createAuditMiddleware = <
  T extends BaseDataEntity = any,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>
>(config: AuditMiddlewareConfig<T, K, Meta> = {
  enabled: true,
  logLevel: 'info',
  includePayload: true,
  includeResult: false,
  maxPayloadSize: 10000,
  captureChanges: true
}): MiddlewareFunction => {
  
  // Default implementations
  const defaultGetUserContext = async (context: MiddlewareContext<any, any, any, any, any, any>): Promise<User | { id: string; name?: string }> => {
    return {
      id: context.userId || 'system',
      name: 'System User'
    };
  };

  const defaultResolveEntityType = (operation: string, payload: any): string => {
    if (operation.includes('Snapshot')) return 'Snapshot';
    if (operation.includes('Task')) return 'Task';
    if (operation.includes('User')) return 'User';
    if (operation.includes('Project')) return 'Project';
    return 'Entity';
  };

  const defaultDetectChanges = async (
    operation: string, 
    payload: any, 
    result: any, 
    context: MiddlewareContext<any, any, any, any, any, any>
  ): Promise<Partial<Record<keyof any, { from: any; to: any }>>> => {
    const changes: Partial<Record<keyof any, { from: any; to: any }>> = {};

    if (operation === 'updateSnapshot' && payload?.updates && result) {
      // Detect changes between existing and updated data
      for (const [key, newValue] of Object.entries(payload.updates)) {
        const oldValue = result.data?.[key as keyof any];
        if (oldValue !== newValue) {
          changes[key as keyof any] = {
            from: oldValue,
            to: newValue
          };
        }
      }
    } else if (operation === 'addSnapshot') {
      // For create operations, track all initial values
      if (payload && typeof payload === 'object') {
        for (const [key, value] of Object.entries(payload)) {
          changes[key as keyof any] = {
            from: undefined,
            to: value
          };
        }
      }
    }

    return changes;
  };

  const defaultAuditService = {
    log: async (entry: AuditEntry<T, K, Meta>): Promise<void> => {
      const level = entry.action === 'delete' ? 'warn' : config.logLevel;
      
      const logEntry = {
        level,
        message: `Audit: ${entry.entityType} ${entry.action} - ${entry.entityId}`,
        entry,
        timestamp: new Date().toISOString()
      };

      // Log to console with appropriate level
      switch (level) {
        case 'error':
          console.error('[Audit Middleware]', logEntry);
          break;
        case 'warn':
          console.warn('[Audit Middleware]', logEntry);
          break;
        case 'debug':
          console.debug('[Audit Middleware]', logEntry);
          break;
        default:
          console.log('[Audit Middleware]', logEntry);
      }

      // Example: Send to external audit service
      // await fetch('/api/audit', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(entry)
      // });
    }
  };

  const auditService = config.auditService || defaultAuditService;
  const getUserContext = config.getUserContext || defaultGetUserContext;
  const resolveEntityType = config.resolveEntityType || defaultResolveEntityType;
  const detectChanges = config.detectChanges || defaultDetectChanges;

  const sanitizeData = (data: any, maxSize?: number): any => {
    if (!data) return data;
    
    try {
      const stringified = JSON.stringify(data);
      
      // Truncate if exceeds max size
      if (maxSize && stringified.length > maxSize) {
        return {
          _truncated: true,
          originalSize: stringified.length,
          maxSize,
          preview: stringified.substring(0, 1000) + '...'
        };
      }
      
      return JSON.parse(stringified);
    } catch {
      return { _serializationError: true, type: typeof data };
    }
  };

  const generateAuditId = (): string => {
    return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const mapOperationToAction = (operation: string): string => {
    const actionMap: Record<string, string> = {
      'addSnapshot': 'create',
      'createSnapshot': 'create',
      'updateSnapshot': 'update',
      'removeSnapshot': 'delete',
      'deleteSnapshot': 'delete',
      'assignSnapshot': 'assign',
      'completeSnapshot': 'complete',
      'takeSnapshot': 'create',
      'filterSnapshots': 'read',
      'findSnapshot': 'read',
      'getSnapshot': 'read'
    };

    return actionMap[operation] || operation;
  };

  const extractEntityId = (operation: string, payload: any, result: any): string => {
    if (payload?.id) return payload.id;
    if (result?.id) return result.id;
    if (typeof payload === 'string') return payload; // ID passed directly
    return 'unknown';
  };

  const extractSnapshotId = (operation: string, payload: any, result: any): string | undefined => {
    if (operation.includes('Snapshot')) {
      return extractEntityId(operation, payload, result);
    }
    return undefined;
  };

  const extractTaskId = (operation: string, payload: any, result: any): string | undefined => {
    if (operation.includes('Task')) {
      return extractEntityId(operation, payload, result);
    }
    if (payload?.taskId) return payload.taskId;
    if (result?.taskId) return result.taskId;
    return undefined;
  };

  return async (context, next) => {
    const { operation, payload, timestamp, store } = context;
    
    if (!config.enabled) {
      return await next(context);
    }

    const startTime = performance.now();
    const auditId = generateAuditId();

    try {
      console.log(`[Audit Middleware] Starting audit for: ${operation}`, { auditId });

      const result = await next(context);
      const endTime = performance.now();

      // Build the audit entry using your interface
      const performedBy = await getUserContext(context);
      const entityType = resolveEntityType(operation, payload);
      const action = mapOperationToAction(operation);
      const entityId = extractEntityId(operation, payload, result);
      
      const auditEntry: AuditEntry<T, K, Meta> = {
        id: auditId,
        action,
        entityType,
        entityId,
        performedBy,
        timestamp: new Date(timestamp),
        duration: endTime - startTime,
        success: true,
        
        // Optional fields
        snapshotId: extractSnapshotId(operation, payload, result),
        taskId: extractTaskId(operation, payload, result),
        notes: `Operation: ${operation}, Duration: ${(endTime - startTime).toFixed(2)}ms`,
        context: {
          storeId: store?.storeId,
          operation,
          source: 'middleware'
        }
      };

      // Add changes if captureChanges is enabled
      if (config.captureChanges && (action === 'create' || action === 'update')) {
        const changes = await detectChanges(operation, payload, result, context);
        if (Object.keys(changes).length > 0) {
          auditEntry.changes = changes as Partial<Record<keyof T, { from: any; to: any }>>;
        }
      }

      // Add payload and result if configured
      if (config.includePayload) {
        auditEntry.context = {
          ...auditEntry.context,
          payload: sanitizeData(payload, config.maxPayloadSize)
        };
      }

      if (config.includeResult) {
        auditEntry.context = {
          ...auditEntry.context,
          result: sanitizeData(result, config.maxPayloadSize)
        };
      }

      // Add metadata from the context
      if (context.metadata) {
        auditEntry.metadata = context.metadata as Meta;
      }

      // Log the audit entry
      await auditService.log(auditEntry);

      console.log(`[Audit Middleware] Audited successful operation: ${operation}`, {
        auditId,
        action,
        entityType,
        entityId,
        duration: `${(endTime - startTime).toFixed(2)}ms`
      });

      return result;

    } catch (error) {
      const endTime = performance.now();

      // Build error audit entry
      const performedBy = await getUserContext(context);
      const entityType = resolveEntityType(operation, payload);
      const action = mapOperationToAction(operation);
      const entityId = extractEntityId(operation, payload, null);

      const auditEntry: AuditEntry<T, K, Meta> = {
        id: auditId,
        action,
        entityType,
        entityId,
        performedBy,
        timestamp: new Date(timestamp),
        duration: endTime - startTime,
        success: false,
        notes: `Operation failed: ${operation}, Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        context: {
          storeId: store?.storeId,
          operation,
          source: 'middleware',
          error: error instanceof Error ? error.message : 'Unknown error',
          errorType: error instanceof Error ? error.constructor.name : typeof error
        }
      };

      // Add payload for error analysis
      if (config.includePayload) {
        auditEntry.context = {
          ...auditEntry.context,
          payload: sanitizeData(payload, config.maxPayloadSize)
        };
      }

      // Log the failed audit entry
      await auditService.log(auditEntry);

      console.error(`[Audit Middleware] Audited failed operation: ${operation}`, {
        auditId,
        action,
        entityType,
        entityId,
        error: auditEntry.context.error,
        duration: `${(endTime - startTime).toFixed(2)}ms`
      });

      throw error;
    }
  };
};

// Default audit middleware with your AuditEntry interface
export const auditMiddleware: MiddlewareFunction = createAuditMiddleware({
  enabled: true,
  logLevel: 'info',
  includePayload: true,
  includeResult: false,
  maxPayloadSize: 5000,
  captureChanges: true
});

// Specialized audit middleware for different entity types
export const createSnapshotAuditMiddleware = (): MiddlewareFunction => {
  return createAuditMiddleware({
    enabled: true,
    logLevel: 'info',
    includePayload: true,
    includeResult: true,
    captureChanges: true,
    resolveEntityType: (operation: string, payload: any) => 'Snapshot',
    getUserContext: async (context) => {
      // Enhanced user context for snapshots
      return {
        id: context.userId || 'system',
        name: 'Snapshot User'
      };
    }
  });
};

export const createTaskAuditMiddleware = (): MiddlewareFunction => {
  return createAuditMiddleware({
    enabled: true,
    logLevel: 'info',
    includePayload: true,
    includeResult: false,
    captureChanges: true,
    resolveEntityType: (operation: string, payload: any) => 'Task'
  });
};

// Audit middleware with external service integration
export const createExternalAuditMiddleware = (externalService: any): MiddlewareFunction => {
  return createAuditMiddleware({
    enabled: true,
    logLevel: 'info',
    includePayload: false, // Be careful with external services
    includeResult: false,
    captureChanges: true,
    auditService: {
      log: async (entry: AuditEntry<any, any, any>) => {
        // Send to external audit service
        await externalService.logAuditEvent(entry);
        
        // Also log locally for redundancy
        console.log('[External Audit]', entry);
      }
    }
  });
};