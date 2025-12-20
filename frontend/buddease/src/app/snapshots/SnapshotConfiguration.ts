// SnapshotConfiguration.ts
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { Attachment } from '@/app/documents/attachment/Attachment';
import { DebugInfo, TempData } from "@/app/models/data/TempData";
import { SnapshotConfig } from '@/app/snapshots/SnapshotConfig';
import { UnifiedConfigOption } from '@/app/snapshots/SnapshotStoreOptions';
import { SnapshotStoreConfig } from "@/app/snapshots/SnapshotStoreConfig";

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
