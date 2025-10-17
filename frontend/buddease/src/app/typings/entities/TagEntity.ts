// TagEntity.ts
import { StructuredMetadata } from '@/config/StructuredMetadata';
import { Attachment } from "@/app/documents/attachment/Attachment";
import SnapshotStore from "@/app/snapshots/SnapshotStore";
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/config/BaseConfig';
import { SnapshotStoreConfig } from "@/app/snapshots/SnapshotStoreConfig";
import { UnifiedMetadata } from "@/config/MetaDataOptions";
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


export type { 
  TagEntity,
  TagK,
  TagMeta,
  TagAttachment,
  TagIncludedFields,
  TagExcludedFields,

  TagBaseParams,
  TagUnifiedMetadata,
  TagStructuredMetadata,
  TagEntityStore,
  TagEntityStoreConfig,
  TagEntitySnapshotsArray
}