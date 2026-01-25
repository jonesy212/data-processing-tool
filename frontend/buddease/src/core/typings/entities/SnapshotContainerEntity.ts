// SnapshotContainerEntity.ts


import type { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
    BaseDataEntity,
    DefaultExcludedFields,
    DefaultMeta
} from "@/core/config/BaseConfig";
import type { Attachment } from '@/core/documents/attachment/Attachment';
import { SnapshotContainer } from '@/core/snapshots/SnapshotContainer';
import type { SnapshotEntityDataInterface } from '@/core/typings/entities/SnapshotEntity';

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