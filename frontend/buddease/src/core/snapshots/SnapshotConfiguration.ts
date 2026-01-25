// SnapshotConfiguration.ts
import type { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import type { Attachment } from '@/core/documents/attachment/Attachment';
import { DebugInfo, TempData } from "@/core/models/data/TempData";
import type { SnapshotConfig } from '@/core/snapshots/SnapshotConfig';
import type { SnapshotStoreConfig } from "@/core/snapshots/SnapshotStoreConfig";
import type { UnifiedConfigOption } from '@/core/snapshots/SnapshotStoreOptions';

interface SnapshotConfiguration<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>{
  configOption?: UnifiedConfigOption<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;

  config: Promise<SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null>;
  
  // Property to hold debugging information
  debugInfo?: DebugInfo; // Optional property to hold debugging information

  // Property for storing temporary data
  tempData?: TempData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>; // Optional property to hold temporary data
  
  initialBaseConfig: SnapshotConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  // Load configuration method
  loadConfig(): void;

  // Save configuration method
  saveConfig(newConfig: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): void;
}

export type { SnapshotConfiguration };
