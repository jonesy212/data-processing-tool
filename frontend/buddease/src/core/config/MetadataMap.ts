// MetadataMap.ts
import type { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import type { BaseData } from '@/core/models/data/Data';
import type { Snapshot } from '@/core/snapshots/Snapshot';

import type { Attachment } from '@/core/documents/attachment/Attachment';

type MetadataMap<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> = Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> & BaseData<any, any, any>;


export type { MetadataMap };
