import { BaseDataEntity } from "@/app/snapshots/ValidationRule";
import { DefaultExcludedFields, DefaultMeta } from "@/config/BaseConfig";
import { Attachment } from "@/app/features/support/SupportTicketComponent";
import { UnifiedMetadata } from "@/server/database/MetaDataOptions";
import { ApiPagination } from '@/app/typings/apiTypes'

// Base response structure that all API responses should extend
export interface BaseResponseType<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T,
> {
  // Core response metadata
  success: boolean;
  status: number;
  message: string;
  timestamp: Date;
  
  // Pagination support (optional)
  pagination?: ApiPagination;
  
  // Data payload - the main content of the response
  data?: T | T[] | K | K[] | null;
  
  // Error handling
  error?: {
    code: string;
    details?: string;
    validationErrors?: Array<{
      field: string;
      message: string;
    }>;
  };
  
  // Metadata about the response data  
  metadata?: UnifiedMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  
  // Links for HATEOAS-style APIs
  links?: {
    self: string;
    first?: string;
    previous?: string;
    next?: string;
    last?: string;
    related?: string[];
  };
  
  // Cache information
  cache?: {
    cached: boolean;
    expiresAt?: Date;
    etag?: string;
  };
  
  // Rate limiting information
  rateLimit?: {
    limit: number;
    remaining: number;
    resetTime: Date;
  };
  
  // Request context
  requestId: string;
  correlationId?: string;
  
  // Generic metadata that can be extended
  customMetadata?: Record<string, any>;
}

// Helper functions for BaseResponseType
export const createSuccessResponse = <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T  
>(
  data: T | T[] | K | K[],
  message: string = "Success",
  status: number = 200
): BaseResponseType<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> => {
  return {
    success: true,
    status,
    message,
    timestamp: new Date(),
    data,
    requestId: generateRequestId(),
  };
};

export const createErrorResponse = <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  message: string,
  status: number = 500,
  errorCode?: string,
  validationErrors?: Array<{ field: string; message: string }>
): BaseResponseType<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> => {
  return {
    success: false,
    status,
    message,
    timestamp: new Date(),
    data: null,
    error: {
      code: errorCode || `ERR_${status}`,
      details: message,
      validationErrors,
    },
    requestId: generateRequestId(),
  };
};

export const createPaginatedResponse = <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  data: T[] | K[],
  page: number,
  pageSize: number,
  totalItems: number,
  message: string = "Success"
): BaseResponseType<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> => {
  const totalPages = Math.ceil(totalItems / pageSize);
  
  return {
    success: true,
    status: 200,
    message,
    timestamp: new Date(),
    data,
    pagination: {
      page,
      pageSize,
      totalItems,
      totalPages,
      hasNext: page < totalPages,
      hasPrevious: page > 1,
    },
    requestId: generateRequestId(),
  };
};

// Validation functions
export const isValidResponse = <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  response: any
): response is BaseResponseType<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> => {
  return (
    response &&
    typeof response.success === 'boolean' &&
    typeof response.status === 'number' &&
    typeof response.message === 'string' &&
    response.timestamp instanceof Date &&
    typeof response.requestId === 'string'
  );
};

export const isSuccessResponse = <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  response: BaseResponseType<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
): boolean => {
  return response.success && response.status >= 200 && response.status < 300;
};

export const hasData = <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  response: BaseResponseType<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
): boolean => {
  return response.data !== null && response.data !== undefined;
};

// Utility functions
const generateRequestId = (): string => {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Response transformer for consistent formatting
export const transformToBaseResponse = <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  data: any,
  options: {
    success?: boolean;
    status?: number;
    message?: string;
    pagination?: any;
    metadata?: any;
  } = {}
): BaseResponseType<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> => {
  return {
    success: options.success ?? true,
    status: options.status ?? 200,
    message: options.message ?? "Success",
    timestamp: new Date(),
    data,
    pagination: options.pagination,
    metadata: options.metadata,
    requestId: generateRequestId(),
  };
};

// Type guards for specific response types
export const isSingleItemResponse = <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  response: BaseResponseType<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
): response is BaseResponseType<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> & { data: T | K } => {
  return hasData(response) && !Array.isArray(response.data);
};

export const isArrayResponse = <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  response: BaseResponseType<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
): response is BaseResponseType<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> & { data: T[] | K[] } => {
  return hasData(response) && Array.isArray(response.data);
};