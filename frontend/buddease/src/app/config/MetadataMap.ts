// MetadataMap.ts
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { BaseData } from '@/app/models/data/Data';
import type {  Snapshot } from '@/app/snapshots/Snapshot';

import { Attachment } from '@/app/documents/attachment/Attachment';

type MetadataMap<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> = Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> & BaseData<any, any, any>;


export type { MetadataMap };
