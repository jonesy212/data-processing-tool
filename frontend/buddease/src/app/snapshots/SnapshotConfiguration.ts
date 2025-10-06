import { SnapshotConfig } from '.';
// SnapshotConfiguration.ts
import { DebugInfo, TempData } from "@/app/models/data/TempData";
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from "@/config/BaseConfig";
import { SnapshotStoreConfig } from "./SnapshotStoreConfig";
import { UnifiedConfigOption } from '@/SnapshotStoreOptions';

interface SnapshotConfiguration<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>
>{
  configOption?: UnifiedConfigOption<T, K, Meta, ExcludedFields>;

  config: Promise<SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null>;
  
  // Property to hold debugging information
  debugInfo?: DebugInfo; // Optional property to hold debugging information

  // Property for storing temporary data
  tempData?: TempData<T, K, Meta, ExcludedFields>; // Optional property to hold temporary data
  
  initialBaseConfig: SnapshotConfig<T, K, Meta, ExcludedFields>;
  // Load configuration method
  loadConfig(): void;

  // Save configuration method
  saveConfig(newConfig: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): void;
}

export type { SnapshotConfiguration };
