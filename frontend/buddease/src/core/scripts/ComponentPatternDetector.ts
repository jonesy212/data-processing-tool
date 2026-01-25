// ComponentPatternDetector.ts
import type {
    BaseDataEntity,
    DefaultExcludedFields,
    DefaultMeta
} from '@/core/config/BaseConfig';
import type { Attachment } from '@/core/documents/attachment/Attachment';
import type { SnapshotStoreConfig } from '@/core/snapshots/SnapshotStoreConfig';

/* ---------- Supported component patterns ---------- */
export type ComponentPatternType =
  | 'CRUD'
  | 'Form'
  | 'Table'
  | 'List'
  | 'Detail'
  | 'Modal'
  | 'Chart'
  | 'Generic';

/* ---------- Shared base contract ---------- */
export interface ComponentPattern<T extends BaseDataEntity = BaseDataEntity> {
  pattern: ComponentPatternType;
  componentName: string;

  /* ---------- Data ---------- */
  fields?: (keyof T)[];           // ← was string[]
  
  /* ---------- Feature flags ---------- */
  usesSnapshotStore?: boolean;
  usesDebugInfo?: boolean;
  usesMeta?: boolean;
  usesComponentConfig?: boolean;
  usesErrorHandling?: boolean;
  usesNotificationService?: boolean;
  requiresAuth?: boolean;
  
  /* ---------- Configuration ---------- */
  configKeys?: (keyof T)[];       // ← was string[]
  
  /* ---------- Snapshot typing (optional override) ---------- */
  snapshotConfigType?: SnapshotStoreConfig<
    T,
    T,
    DefaultMeta<T, T>,
    Attachment,
    DefaultExcludedFields<T>,
    keyof T
  >[];
}
