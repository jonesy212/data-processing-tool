// ConvertSnapshotUnion.tsx
import { Attachment } from '@/app/components/documents/Attachment/attachment';
import { SnapshotUnion } from '@/app/components/snapshots/LocalStorageSnapshotStore';
import { SnapshotStoreConfig } from '@/app/components/snapshots/SnapshotStoreConfig';
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from "@/app/configs/BaseConfig";
import { BaseData } from '../../../data_analysis/frontend/buddease/src/app/components/models/data/Data';
import { ConvertMeta } from '../../../data_analysis/frontend/buddease/src/app/components/models/data/dataStoreMethods';
import { StructuredMetadata } from '../../../data_analysis/frontend/buddease/src/app/configs/StructuredMetadata';
import { Snapshot } from './Snapshot';
import { SnapshotWithCriteriaAsBase } from "./SnapshotStoreOptions";

type ConvertSnapshotWithCriteria<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  ExcludedFields extends keyof BaseDataEntity = never
> = SnapshotStoreConfig<
  BaseDataEntity,
  SnapshotWithCriteriaAsBase<T, K, Meta, ExcludedFields>,
  StructuredMetadata<BaseData<any, any, Meta, Attachment>, SnapshotWithCriteriaAsBase<T, K, Meta, ExcludedFields>>,
  ExcludedFields
>;

type ConvertSnapshotUnion<
  U extends BaseDataEntity,
  K extends U = U,
  Meta extends DefaultMeta<U, K> = DefaultMeta<U, K>,
  ExcludedFields extends keyof U = DefaultExcludedFields<U>
> = SnapshotUnion<U, K, ConvertMeta<U, K, Meta, ExcludedFields>>;




function convertToSnapshotUnion<
  T extends BaseDataEntity, 
  K extends T = T
>(snapshot: Snapshot<T, K, Meta, ExcludedFields>): SnapshotUnion<T, K, DefaultMeta<T, K>> {
  // Create a proper SnapshotUnion by ensuring it has BaseDataEntity properties
  const snapshotUnion: SnapshotUnion<T, K, DefaultMeta<T, K>> = {
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
