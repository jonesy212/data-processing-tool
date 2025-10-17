// app/types/blog.ts
import { Content } from '@/app/models/content/AddContent';
import { Data, SharedRelationshipData } from '@/app/models/data/Data';
import { Snapshot } from '@/app/snapshots/Snapshot';

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
  content: string | Content<T, K> | undefined;
  author: string;
  date: string | Date | undefined;
  subtitle: string;
  description?: string | undefined;
  data?: Content<T, K> | Snapshot<Data<T>, Meta>;
  startDate: Date;
}