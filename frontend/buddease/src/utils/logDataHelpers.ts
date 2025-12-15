// logDataHelpers.ts
// utils/logDataHelpers.ts
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { Attachment } from '@/app/documents/attachment/Attachment';
import { LogData } from '@/app/models/LogData';

/**
 * Creates a minimal LogData object with required defaults
 */
export const createLogData = <
  T extends BaseDataEntity = BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  partialData: Partial<LogData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> & {
    message: string;
    level: string;
  }
): LogData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> => {
  const now = new Date();
  
  return {
    // Required fields with defaults
    date: now,
    timestamp: now.getTime(),
    level: partialData.level,
    message: partialData.message,
    user: null,
    content: '',
    createdAt: now,
    endpoint: '',
    method: '',
    status: '',
    response: null,
    sent: now,
    isSent: true,
    isDelivered: false,
    delivered: null,
    opened: null,
    clicked: null,
    responded: false,
    responseTime: null,
    topics: [],
    highlights: [],
    eventData: null,
    files: [],
    meta: null,
    
    // Spread the partial data to override defaults
    ...partialData,
    
    // Ensure BaseData properties are included if needed
    id: partialData.id || 0, // or generate a proper ID
    // Add other BaseData properties as required
  } as LogData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
};

/**
 * Creates a success log entry
 */
export const createSuccessLog = (
  message: string,
  additionalData?: Partial<LogData>
): LogData => {
  return createLogData({
    level: 'info',
    message,
    ...additionalData,
  });
};

/**
 * Creates an error log entry
 */
export const createErrorLog = (
  message: string,
  error?: Error,
  additionalData?: Partial<LogData>
): LogData => {
  return createLogData({
    level: 'error',
    message: error ? `${message}: ${error.message}` : message,
    response: error ? { error: error.message, stack: error.stack } : null,
    ...additionalData,
  });
};

/**
 * Creates a warning log entry
 */
export const createWarningLog = (
  message: string,
  additionalData?: Partial<LogData>
): LogData => {
  return createLogData({
    level: 'warning',
    message,
    ...additionalData,
  });
};

/**
 * Creates a debug log entry
 */
export const createDebugLog = (
  message: string,
  additionalData?: Partial<LogData>
): LogData => {
  return createLogData({
    level: 'debug',
    message,
    ...additionalData,
  });
};