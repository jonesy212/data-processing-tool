// BaseSnapshotProps.ts
import { Version } from '@/app/components/versions/Version';
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/app/configs/BaseConfig';
import { StructuredMetadata } from '@/app/configs/StructuredMetadata';
import { BaseDataRoot } from "@/configs/BaseConfig";
import { Snapshot } from '.';
import { SnapshotStoreConfig } from "./SnapshotStoreConfig";
import { SnapshotStoreMethod } from "./SnapshotStoreMethod";

interface BaseSnapshotProps<
  T extends BaseDataEntity = BaseDataRoot,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>
> {
  id: string;
  baseId: string;
  baseConfig: Partial<SnapshotStoreConfig<T>>;
  version?: string | Version<T, K, Meta, ExcludedFields>;

  // Any other shared properties
  meta: StructuredMetadata<T, K>;
  config: Promise<SnapshotStoreConfig<T, K, Meta, ExcludedFields> | null>;
  convertKeyToT: (key: string) => T;
  dataStoreConfig: Record<string, any>;
  initializeState?: (id: string, snapshot: Snapshot<T, K, Meta, ExcludedFields>) => void;
  snapshotMethods: SnapshotStoreMethod<T, K, Meta, ExcludedFields>[];
  subscribers: string;
  [key: string]: any;
  // Additional shared properties and methods
}

export type { BaseSnapshotProps };

