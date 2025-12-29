// ApiEntity.ts
import { BaseDataEntity, DefaultMeta } from '@/core/config/BaseConfig';
import { UnifiedMetaDataOptions } from '@/core/config/MetaDataOptions';
import { StructuredMetadata } from '@/core/config/StructuredMetadata';
import { Task } from "@/core/models/tasks/Task";



// Define your API-specific types
export interface ApiEntity extends BaseDataEntity {
  id: string;
  name: string;
  url: string;
  method: string;
  timeout: number;
  headers?: Record<string, string>;
  // ... other API-specific fields
}

export type ApiK = ApiEntity;
export type ApiMeta = DefaultMeta<ApiEntity, ApiK>; // Or define proper Api metadata type

export type ApiAttachmentType = any; // Or define proper attachment type
export type ApiExcludedFields = never;
export type ApiIncludedFields = keyof ApiEntity;

// Create type aliases for complex types
export type ApiStructuredMetadata = StructuredMetadata<
  ApiEntity,
  ApiK,
  ApiMeta,
  ApiAttachmentType,
  ApiExcludedFields,
  ApiIncludedFields
>;

export type ApiUnifiedMetadataOptions = UnifiedMetaDataOptions<
  ApiEntity,
  ApiK,
  ApiStructuredMetadata,
  ApiAttachmentType,
  ApiExcludedFields,
  ApiIncludedFields
>;

export type ApiTask = Task<
  ApiEntity,
  ApiK,
  ApiStructuredMetadata,
  ApiAttachmentType,
  ApiExcludedFields,
  ApiIncludedFields
>;