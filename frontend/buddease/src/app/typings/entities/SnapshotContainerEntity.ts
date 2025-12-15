// SnapshotContainerEntity.ts


import {
  BaseDataEntity,
  DefaultExcludedFields,
  DefaultMeta
} from "@/app/config/BaseConfig";
import { Attachment } from '@/app/documents/attachment/Attachment';
import { SnapshotContainer } from '@/app/snapshots/SnapshotContainer';
import { SnapshotEntityDataInterface } from '@/app/typings/entities/SnapshotEntity';

export type SnapshotContainerEntity<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> = SnapshotContainer<
  SnapshotEntityDataInterface<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
>;