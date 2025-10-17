// createBaseDataEntity.ts
import { BaseDataEntity, DefaultExcludedFields, DefaultIncludedFields, DefaultMeta } from '@/config/BaseConfig';
import { Attachment } from '@/app/documents/attachment/Attachment';

function createBaseDataEntity<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(): T {
  const timestamp = new Date();
  
  // Create a basic entity with required BaseDataEntity fields
  const baseEntity: BaseDataEntity = {
    id: `entity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: timestamp,
    updatedAt: timestamp,
    version: "1.0.0",
    isActive: true,
    isDeleted: false,
    metadata: {} as any
  };
  
  // Return as the generic type T
  return baseEntity as T;
}

// Alternative version with more customization options
function createBaseDataEntityWithOptions<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(options?: Partial<T>): T {
  const timestamp = new Date();
  
  const baseEntity: BaseDataEntity = {
    id: options?.id || `entity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: options?.createdAt || timestamp,
    updatedAt: options?.updatedAt || timestamp,
    version: options?.version || "1.0.0",
    isActive: options?.isActive !== undefined ? options.isActive : true,
    isDeleted: options?.isDeleted !== undefined ? options.isDeleted : false,
    metadata: options?.metadata || {} as any
  };
  
  // Merge with any additional options
  return { ...baseEntity, ...options } as T;
}

// Simple version for common use cases
function createSimpleBaseDataEntity<T extends BaseDataEntity>(
  id?: string,
  metadata?: any
): T {
  const timestamp = new Date();
  
  return {
    id: id || `entity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: timestamp,
    updatedAt: timestamp,
    version: "1.0.0",
    isActive: true,
    isDeleted: false,
    metadata: metadata || {}
  } as T;
}

export { 
  createBaseDataEntity, 
  createBaseDataEntityWithOptions, 
  createSimpleBaseDataEntity 
};
