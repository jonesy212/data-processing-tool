// BaseSnapshotProps.ts
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/config/BaseConfig';
import { StructuredMetadata } from '@/config/StructuredMetadata';
import { Version } from '@/app/versions/Version';
import { BaseDataRoot } from "@/config/BaseConfig";
import { Snapshot } from '@/app/snapshots/Snapshot';
import { SnapshotStoreConfig } from "@/app/snapshots/SnapshotStoreConfig";
import { SnapshotStoreMethods } from "@/app/snapshots/SnapshotStoreMethods";

interface BaseSnapshotProps<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {
  id: string;
  baseId: string;
  baseConfig: Partial<SnapshotStoreConfig<T>>;
  version?: string | Version<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;

  // Any other shared properties
  meta: StructuredMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  config: Promise<SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null>;
  convertKeyToT: (key: string) => T;
  dataStoreConfig: Record<string, any>;
  initializeState?: (id: string, snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;
  snapshotMethods: SnapshotStoreMethods<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
  subscribers: string;
  [key: string]: any;
  // Additional shared properties and methods
}

export type { BaseSnapshotProps };

