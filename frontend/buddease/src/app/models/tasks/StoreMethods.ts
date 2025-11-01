import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';



export interface StoreMethods<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> extends SnapshotStoreMethods<T, K, Meta, Excluded> {
  // Add new or more specific methods here if needed
  archive?(id: string): Promise<void>;
  restore?(id: string): Promise<void>;
  mergeSnapshots?(snapshots: T[]): Promise<SnapshotUnion<T, K, Meta, Excluded>>;
}