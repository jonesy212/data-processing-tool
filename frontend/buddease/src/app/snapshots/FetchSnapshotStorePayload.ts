// FetchSnapshotStorePayload.ts
import { Attachment } from '@/app/documents/attachment/Attachment';
import SnapshotStore from '@/app/snapshots/SnapshotStore';
import { BaseDataEntity, DefaultExcludedFields, DefaultIncludedFields, DefaultMeta } from '@/app/config/BaseConfig';

interface FetchedSnapshotStore<  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T> {
    snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
}

export type { FetchedSnapshotStore };
