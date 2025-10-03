import { BaseDataEntity, DefaultMeta, DefaultExcludedFields } from '@/config/BaseConfig';
import { Snapshot } from '@/app/snapshots';
import { UnifiedMetadata } from "@/server/database/MetaDataOptions";
import { SnapshotStoreConfig } from '@/app/snapshots/SnapshotStoreConfig';

interface SnapshotStorage<
  T extends BaseDataEntity = BaseDataRoot,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {
  // Storage operations
  storageService: StorageService;
  
  // Container-like properties
  snapshots: Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>;
  metadata: UnifiedMetadata<T, K, Meta, ExcludedFields>;
  config: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  
  // Combined methods
  getSnapshot(key: string): Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null>;
  storeSnapshot(key: string, snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): Promise<void>;
  archiveSnapshot(snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): Promise<ArchiveMetadata>;
  
  // Container management
  addSnapshot(snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): void;
  removeSnapshot(key: string): boolean;
  hasSnapshot(key: string): boolean;
  
  // Lifecycle methods
  initialize(): Promise<void>;
  cleanup(): Promise<void>;
}