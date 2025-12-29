// ServerSnapshotTypes.ts
// Server-specific types and interfaces
import { BaseDataEntity, BaseDataRoot, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import { UnifiedMetadata } from "@/core/config/MetaDataOptions";
import { CreateSnapshotsPayload } from '@/core/interfaces/payload/payloadTypes';

import { Attachment } from '@/core/documents/attachment/Attachment';

export interface ServerSnapshotConfig<
  T extends BaseDataEntity = BaseDataRoot,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {
  // Server-specific configuration
  databaseConfig: any;
  apiEndpoints: string[];
  serverMetadata: UnifiedMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  payloadHandlers: ServerPayloadHandlers<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
}

export interface ServerPayloadHandlers<
  T extends BaseDataEntity = BaseDataRoot,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {
  handleCreateSnapshots: (payload: CreateSnapshotsPayload<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => Promise<void>;
  handleBatchOperations: (criteria: any) => Promise<any>;
  processServerMetadata: (metadata: UnifiedMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => any;
}

export interface ServerSnapshotStoreOptions<
  T extends BaseDataEntity = BaseDataRoot,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {
  serverConfig: ServerSnapshotConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  databaseConnections: any[];
  cacheStrategies: any[];
  apiRateLimiting: any;
}