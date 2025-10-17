// VideoEntity.ts

import { StructuredMetadata } from '@/config/StructuredMetadata';
import { Attachment } from '@/app/documents/attachment/Attachment';
import SnapshotStore from '@/app/snapshots/SnapshotStore';
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/config/BaseConfig';
import { SnapshotStoreConfig } from '@/app/snapshots/SnapshotStoreConfig';
import { UnifiedMetadata } from '@/config/MetaDataOptions';
import { SnapshotsArray } from '@/app/snapshots/LocalStorageSnapshotStore';
import { Category } from '@/app/libraries/categories/generateCategoryProperties';

// --- Core Video Type Definitions ---

interface VideoEntity extends BaseDataEntity {
  title: string;
  description?: string;
  url: string;
  duration?: number; // seconds
  resolution?: string; // e.g., "1080p", "4K"
  category?: Category;
  tags?: string[];
  thumbnailUrl?: string;
  attachments?: Attachment[];
}

// --- Type Mapping for Generics ---
type VideoK = VideoEntity;

type VideoMeta = DefaultMeta<VideoEntity, VideoK>;

type VideoAttachment = Attachment;

type VideoExcludedFields = DefaultExcludedFields<VideoEntity>;

type VideoIncludedFields = keyof VideoEntity;

// --- Parameter Container for Video ---
type VideoBaseParams = {
  T: VideoEntity;
  K: VideoK;
  Meta: VideoMeta;
  AttachmentType: VideoAttachment;
  ExcludedFields: VideoExcludedFields;
  IncludedFields: VideoIncludedFields;
};

// --- Metadata Types ---
type VideoUnifiedMetadata = UnifiedMetadata<
  VideoBaseParams['T'],
  VideoBaseParams['K'],
  VideoBaseParams['Meta'],
  VideoBaseParams['AttachmentType'],
  VideoBaseParams['ExcludedFields'],
  VideoBaseParams['IncludedFields']
>;

type VideoStructuredMetadata = StructuredMetadata<
  VideoBaseParams['T'],
  VideoBaseParams['K'],
  VideoBaseParams['Meta'],
  VideoBaseParams['AttachmentType'],
  VideoBaseParams['ExcludedFields'],
  VideoBaseParams['IncludedFields']
>;

// --- Snapshot Store & Config Types ---
type VideoEntityStore = SnapshotStore<
  VideoBaseParams['T'],
  VideoBaseParams['K'],
  VideoBaseParams['Meta'],
  VideoBaseParams['AttachmentType'],
  VideoBaseParams['ExcludedFields'],
  VideoBaseParams['IncludedFields']
>;

type VideoEntityStoreConfig = SnapshotStoreConfig<
  VideoBaseParams['T'],
  VideoBaseParams['K'],
  VideoBaseParams['Meta'],
  VideoBaseParams['AttachmentType'],
  VideoBaseParams['ExcludedFields'],
  VideoBaseParams['IncludedFields']
>;

type VideoEntitySnapshotsArray = SnapshotsArray<
  VideoBaseParams['T'],
  VideoBaseParams['K'],
  VideoBaseParams['Meta'],
  VideoBaseParams['AttachmentType'],
  VideoBaseParams['ExcludedFields'],
  VideoBaseParams['IncludedFields']
>;

// --- Exports ---
export type {
  VideoEntity,
  VideoK,
  VideoMeta,
  VideoAttachment,
  VideoExcludedFields,
  VideoIncludedFields,
  VideoBaseParams,
  VideoUnifiedMetadata,
  VideoStructuredMetadata,
  VideoEntityStore,
  VideoEntityStoreConfig,
  VideoEntitySnapshotsArray
};
