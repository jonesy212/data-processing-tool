// MilestoneExtensions.ts
import type { 
  BaseEntityProperties, 
  SharedIdentifiers, 
  SharedSnapshotProperties 
} from '@/core/documents/RelatedProps';
import type { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import type { Attachment } from '@/core/documents/attachment/Attachment';

// Extend BaseEntityProperties to include milestone properties
export interface ExtendedBaseEntityProperties extends BaseEntityProperties {
  milestoneId?: string;
  milestoneName?: string;
  projectId?: string;
}

// Extend SharedIdentifiers
export interface ExtendedSharedIdentifiers<
  T extends BaseDataEntity,
  K extends T = T
> extends SharedIdentifiers<T, K>, ExtendedBaseEntityProperties {}

// Extend SharedSnapshotProperties
export interface ExtendedSharedSnapshotProperties<
  T extends BaseDataEntity = BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> extends SharedSnapshotProperties<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, 
    ExtendedBaseEntityProperties {}

