// SnapshotStorageOptionsEntity.ts
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import { Attachment } from '@/core/documents/attachment/Attachment';


// Define specific entity type for snapshot storage
interface SnapshotStorageEntity extends BaseDataEntity {
  baseURL?: string;
  enabled?: boolean;
  maxRetries?: number;
  retryDelay?: number;
  maxAge?: number;
  staleWhileRevalidate?: number;
  cacheKey?: string;
  category?: string;
  date?: Date;
  // Add other snapshot-specific properties as needed
}

type SnapshotStorageK = SnapshotStorageEntity;
type SnapshotStorageMeta = DefaultMeta<SnapshotStorageEntity, SnapshotStorageK>;
type SnapshotStorageAttachment = Attachment;
type SnapshotStorageExcludedFields = DefaultExcludedFields<SnapshotStorageEntity>;
type SnapshotStorageIncludedFields = keyof SnapshotStorageEntity;

// Base parameters
type SnapshotStorageBaseParams = {
  T: SnapshotStorageEntity;
  K: SnapshotStorageK;
  Meta: SnapshotStorageMeta;
  AttachmentType: SnapshotStorageAttachment;
  ExcludedFields: SnapshotStorageExcludedFields;
  IncludedFields: SnapshotStorageIncludedFields;
};

export type {
    SnapshotStorageAttachment, SnapshotStorageBaseParams, SnapshotStorageEntity, SnapshotStorageExcludedFields,
    SnapshotStorageIncludedFields, SnapshotStorageK, SnapshotStorageMeta
};

