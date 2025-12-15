// DataState.ts
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { Attachment } from '@/app/documents/attachment/Attachment';
import { SnapshotStoreConfig } from '@/app/snapshots';
import { Snapshot } from '@/app/snapshots/Snapshot';

type DataState<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> =
  | T
  | Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>  
  | SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
    | null;
  
export type { DataState };
