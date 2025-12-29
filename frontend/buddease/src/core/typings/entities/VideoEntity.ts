// VideoEntity.ts

import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import { UnifiedMetadata } from '@/core/config/MetaDataOptions';
import { StructuredMetadata } from '@/core/config/StructuredMetadata';
import { Attachment } from '@/core/documents/attachment/Attachment';
import { Category } from '@/core/libraries/categories/generateCategoryProperties';
import { SnapshotsArray } from '@/core/snapshots/LocalStorageSnapshotStore';
import SnapshotStore from '@/core/snapshots/SnapshotStore';
import { SnapshotStoreConfig } from '@/core/snapshots/SnapshotStoreConfig';

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
    VideoAttachment, VideoBaseParams, VideoEntity, VideoEntitySnapshotsArray, VideoEntityStore,
    VideoEntityStoreConfig, VideoExcludedFields,
    VideoIncludedFields, VideoK,
    VideoMeta, VideoStructuredMetadata, VideoUnifiedMetadata
};

