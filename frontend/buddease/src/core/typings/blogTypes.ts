// blogTypes.ts
// app/types/blog.ts
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import { Content } from '@/core/models/content/AddContent';
import { Data, SharedRelationshipData } from '@/core/models/data/Data';
import type { Snapshot } from '@/core/snapshots/Snapshot';

import { Attachment } from '@/core/documents/attachment/Attachment';

export interface BlogData<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T 
> extends SharedRelationshipData<K> {
  _id: string;
  id: string;
  title?: string;
  content: string | Content<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>  | undefined;
  author: string;
  date: string | Date | undefined;
  subtitle: string;
  description?: string;
  data?: Content<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>  | Snapshot<Data<T>, Meta>;
  startDate: Date;
}