// TagEntity.ts
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { UnifiedMetadata } from "@/app/config/MetaDataOptions";
import { StructuredMetadata } from '@/app/config/StructuredMetadata';
import { Attachment } from '@/app/documents/attachment/Attachment';
import { SnapshotsArray } from '@/app/snapshots';
import SnapshotStore from "@/app/snapshots/SnapshotStore";
import { SnapshotStoreConfig } from "@/app/snapshots/SnapshotStoreConfig";
import { RoadmapAudience } from '@/app/typings/roadmap';
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

