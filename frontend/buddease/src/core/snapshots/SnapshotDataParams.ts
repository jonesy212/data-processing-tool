// SnapshotDataParams.ts
import type { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import type { Attachment } from '@/core/documents/attachment/Attachment';
import type { Category } from '@/core/libraries/categories/generateCategoryProperties';
import type { CategoryProperties } from '@/core/pages/personas/ScenarioBuilder';
import type { FilterCriteria } from '@/core/pages/searches/FilterCriteria';
import type { SnapshotsArray } from '@/core/snapshots/LocalStorageSnapshotStore';
import SnapshotStore from '@/core/snapshots/SnapshotStore';
import type { SnapshotStoreConfig } from '@/core/snapshots/SnapshotStoreConfig';
import { Subscriber } from '@/core/subscribers/Subscriber';
import type { SnapshotEvent } from '@/core/typings/snapshotTypes';



interface SnapshotDataParams<
  T extends BaseDataEntity = BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {
  // Required identifiers
  id: string;
  snapshotId: string;
  
  // Snapshot data
  snapshot: T | null;
  snapshotData: SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  
  // Configuration
  category?: Category;
  categoryProperties?: CategoryProperties;
  configUpdate?: Partial<SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>;
  
  // Callback and events
  callback?: (snapshot: T) => void;
  type?: string;
  event?: SnapshotEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  
  // Collections
  snapshots?: SnapshotsArray<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  data?: Map<string, T>;
  subscribers?: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
  
  // Store reference
  snapshotStore?: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  
  // Enhanced options (optional)
  includeRelations?: boolean;
  depth?: number;
  filters?: FilterCriteria;
  sortBy?: string | string[];
  limit?: number;
  offset?: number;
  returnType?: 'map' | 'array' | 'single' | 'all';
  validateOnUpdate?: boolean;
  updateCacheOnly?: boolean;
}

// Then your method becomes much cleaner:


export type { SnapshotDataParams };
