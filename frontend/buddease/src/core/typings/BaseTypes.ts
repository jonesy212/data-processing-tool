// BaseTypes.ts
import type { BaseDataRoot } from '@/core/config/BaseConfig';
BaseTypes.ts - Central type definitions that work with your entity system

import type { Attachment } from '@/core/documents/attachment/Attachment';

// Core base type that all entities extend from
export interface BaseSnapshotType {
  id: string | number;
  timestamp?: Date | string | number;
  createdAt?: Date | string | number;
  updatedAt?: Date | string | number;
  status?: string;
  category?: string;
  metadata?: Record<string, any>;
}

// Simplified generic parameter structure for common use cases
export interface BaseTypeParams<T extends BaseDataEntity = BaseDataEntity> {
  T: T;
  K: T;
  Meta: DefaultMeta<T, T>;
  AttachmentType: Attachment;
  ExcludedFields: DefaultExcludedFields<T>;
  IncludedFields: keyof T;
}

// Factory for creating consistent type parameters
export const createBaseTypeParams = <T extends BaseDataEntity>(): BaseTypeParams<T> => ({
  T: {} as T,
  K: {} as T,
  Meta: {} as DefaultMeta<T, T>,
  AttachmentType: {} as Attachment,
  ExcludedFields: {} as DefaultExcludedFields<T>,
  IncludedFields: {} as keyof T,
});

// Utility to extract entity types from your existing structure
export type ExtractEntityTypes<T extends BaseDataEntity> = {
  entity: T;
  keyType: T;
  metaType: DefaultMeta<T, T>;
  attachmentType: Attachment;
  excludedFields: DefaultExcludedFields<T>;
  includedFields: keyof T;
};

// Common type combinations for your entities
export type EntityTypeCombinations = {
  task: ExtractEntityTypes<import('@/core/typings/entities/TaskEntity').TaskEntity>;
  project: ExtractEntityTypes<import('@/core/typings/entities/ProjectEntity').ProjectEntity>;
  user: ExtractEntityTypes<import('@/core/typings/entities/UserEntity').UserEntity>;
  team: ExtractEntityTypes<import('@/core/typings/entities/TeamEntity').TeamEntity>;
  snapshot: ExtractEntityTypes<import('@/core/typings/entities/SnapshotEntity').SnapshotEntity>;
  app: ExtractEntityTypes<import('@/core/typings/entities/AppEntity').AppEntity>;
};

// Helper to get specific entity types
export type GetEntityTypes<K extends keyof EntityTypeCombinations> = EntityTypeCombinations[K];