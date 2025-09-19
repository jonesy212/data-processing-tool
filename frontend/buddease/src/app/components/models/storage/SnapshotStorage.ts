import { BaseDataEntity, DefaultMeta, DefaultExcludedFields } from '@/app/configs/BaseConfig';
import { Snapshot } from '@/app/components/snapshots';
import { UnifiedMetadata } from "@/app/configs/database/MetaDataOptions";
import { SnapshotStoreConfig } from '@/app/components/snapshots/SnapshotStoreConfig';

interface SnapshotStorage<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>
> {
  // Storage operations
  storageService: StorageService;
  
  // Container-like properties
  snapshots: Map<string, Snapshot<T, K, Meta, ExcludedFields>>;
  metadata: UnifiedMetadata<T, K, Meta, ExcludedFields>;
  config: SnapshotStoreConfig<T, K, Meta, ExcludedFields>;
  
  // Combined methods
  getSnapshot(key: string): Promise<Snapshot<T, K, Meta, ExcludedFields> | null>;
  storeSnapshot(key: string, snapshot: Snapshot<T, K, Meta, ExcludedFields>): Promise<void>;
  archiveSnapshot(snapshot: Snapshot<T, K, Meta, ExcludedFields>): Promise<ArchiveMetadata>;
  
  // Container management
  addSnapshot(snapshot: Snapshot<T, K, Meta, ExcludedFields>): void;
  removeSnapshot(key: string): boolean;
  hasSnapshot(key: string): boolean;
  
  // Lifecycle methods
  initialize(): Promise<void>;
  cleanup(): Promise<void>;
}