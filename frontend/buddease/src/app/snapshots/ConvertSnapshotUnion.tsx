// ConvertSnapshotUnion.tsx
import { Attachment } from '@/app/documents/attachment/Attachment';
import { ConvertMeta } from '@/app/models/data/dataStoreMethods';
import { SnapshotUnion } from '@/app/snapshots/LocalStorageSnapshotStore';
import { Snapshot } from '@/app/snapshots/Snapshot';
import { SnapshotStoreConfig } from '@/app/snapshots/SnapshotStoreConfig';
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';

type ConvertSnapshotWithCriteria<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> = SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;

type ConvertSnapshotUnion<
  U extends BaseDataEntity,
  K extends U = U,
  Meta extends DefaultMeta<U, K> = DefaultMeta<U, K>,
  ExcludedFields extends keyof U = DefaultExcludedFields<U>,
  IncludedFields extends keyof U = keyof U
> = SnapshotUnion<U, K, ConvertMeta<U, K, Meta, ExcludedFields>>;




function convertToSnapshotUnion<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): SnapshotUnion<T, K, DefaultMeta<T, K>> {
  // Create a proper SnapshotUnion by ensuring it has BaseDataEntity properties
  const snapshotUnion: SnapshotUnion<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = {
    ...snapshot,
    // Ensure BaseDataEntity properties are present
    id: snapshot.id,
    createdAt: snapshot.createdAt || new Date(),
    updatedAt: snapshot.updatedAt || new Date(),
  } as SnapshotUnion<T, K, DefaultMeta<T, K>>;

  return snapshotUnion;
}


export { convertToSnapshotUnion };
export type { ConvertSnapshotUnion, ConvertSnapshotWithCriteria };

