// TagEntity.ts
import type { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import type { UnifiedMetadata } from "@/core/config/MetaDataOptions";
import type { StructuredMetadata } from '@/core/config/StructuredMetadata';
import type { Attachment } from '@/core/documents/attachment/Attachment';
import type { RoadmapAudience } from '@/core/server/repository/roadmapMapper';
import type { SnapshotsArray } from '@/core/snapshots/LocalStorageSnapshotStore';
import SnapshotStore from "@/core/snapshots/SnapshotStore";
import type { SnapshotStoreConfig } from "@/core/snapshots/SnapshotStoreConfig";
// --- Core Tag Type Definitions ---

type TagEntity = BaseDataEntity;

type TagK = TagEntity;

type TagMeta = DefaultMeta<TagEntity, TagK>;

type TagAttachment = Attachment;

type TagExcludedFields = DefaultExcludedFields<TagEntity>;

type TagIncludedFields = keyof TagEntity;

// --- Parameter Container for Tag ---
type TagBaseParams = {
  T: TagEntity;
  K: TagK;
  Meta: TagMeta;
  AttachmentType: TagAttachment;
  ExcludedFields: TagExcludedFields;
  IncludedFields: TagIncludedFields;
};


type TagUnifiedMetadata = UnifiedMetadata<
  TagBaseParams['T'],
  TagBaseParams['K'],
  TagBaseParams['Meta'],
  TagBaseParams['AttachmentType'],
  TagBaseParams['ExcludedFields'],
  TagBaseParams['IncludedFields']
>;

type TagStructuredMetadata = StructuredMetadata<
  TagBaseParams['T'],
  TagBaseParams['K'],
  TagBaseParams['Meta'],
  TagBaseParams['AttachmentType'],
  TagBaseParams['ExcludedFields'],
  TagBaseParams['IncludedFields']
>;



type TagEntityStore = SnapshotStore<
  TagBaseParams['T'],
  TagBaseParams['K'],
  TagBaseParams['Meta'],
  TagBaseParams['AttachmentType'],
  TagBaseParams['ExcludedFields'],
  TagBaseParams['IncludedFields']
>;

type TagEntityStoreConfig = SnapshotStoreConfig<
  TagBaseParams['T'],
  TagBaseParams['K'],
  TagBaseParams['Meta'],
  TagBaseParams['AttachmentType'],
  TagBaseParams['ExcludedFields'],
  TagBaseParams['IncludedFields']
>;

type TagEntitySnapshotsArray = SnapshotsArray<
  TagBaseParams['T'],
  TagBaseParams['K'],
  TagBaseParams['Meta'],
  TagBaseParams['AttachmentType'],
  TagBaseParams['ExcludedFields'],
  TagBaseParams['IncludedFields']
>;


// Semantic extension for roadmap and audience logic
export interface TagSemantic {
  label?: string;
  color?: string;
  phase?: string;
  domain?: 'project' | 'crypto' | 'community' | 'global';
  description?: string;

  // Semantic rule-based relationships
  includes?: string[];
  excludes?: string[];
  synonyms?: string[];

  // Audience visibility
  audiences?: RoadmapAudience[];
  hiddenFor?: RoadmapAudience[];
}

export type TagWithRules = TagEntity & {
  metadata?: {
    taggable?: {
      semantic?: TagSemantic
    }
  }
};

export type {
    TagAttachment, TagBaseParams, TagEntity, TagEntitySnapshotsArray, TagEntityStore,
    TagEntityStoreConfig, TagExcludedFields, TagIncludedFields, TagK,
    TagMeta, TagStructuredMetadata, TagUnifiedMetadata
};

