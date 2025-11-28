// loggingMiddleware.ts
import { MiddlewareFunction, MiddlewareContext, MiddlewareNext } from '@/app/middleware/types';
import { Logger } from '@/app/logger/Logger';
import { BaseDataEntity, DefaultMeta } from '@/app/config/BaseConfig';
import { Attachment } from '@/app/documents/attachment/Attachment';

/**
 * Logging Middleware
 * 
 * Responsibilities:
 * - Logs the start and end of each operation in the middleware pipeline.
 * - Measures duration of the operation for performance monitoring.
 * - Captures errors and ensures they are rethrown while logging details.
 * - Uses async fire-and-forget logging to avoid slowing down the pipeline.
 */
export const loggingMiddleware: MiddlewareFunction = async <
  T extends BaseDataEntity = BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = never,
  IncludedFields extends keyof T = keyof T
>(
  context: MiddlewareContext<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  next: MiddlewareNext
) => {
  const { operation, payload, timestamp, store, userId, plugins } = context;
  const startTime = performance.now();

  const logContext = {
    operation,
    storeId: store?.storeId,
    timestamp: timestamp.toISOString(),
    payloadSize: payload ? JSON.stringify(payload).length : 0,
    userId,
    plugins
  };

  // Fire-and-forget start log
  Logger.logWithPayload('Middleware Operation', 'Starting operation', logContext, userId)
    .catch(err => console.error('Logger failed', err));

  try {
    const result = await next(context);
    const endTime = performance.now();

    // Fire-and-forget completion log
    Logger.logWithPayload('Middleware Operation', 'Completed operation', {
      ...logContext,
      duration: `${(endTime - startTime).toFixed(2)}ms`,
      success: true
    }, userId).catch(err => console.error('Logger failed', err));

    return result;
  } catch (error) {
    const endTime = performance.now();

    // Fire-and-forget error log
    Logger.logWithPayload('Middleware Operation', 'Failed operation', {
      ...logContext,
      duration: `${(endTime - startTime).toFixed(2)}ms`,
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false
    }, userId).catch(err => console.error('Logger failed', err));

    throw error;
  }
};
