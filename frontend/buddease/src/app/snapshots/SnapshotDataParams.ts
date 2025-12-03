// SnapshotDataParams.ts
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { Attachment } from '@/app/documents/attachment/Attachment';
import { Category } from '@/app/libraries/categories/generateCategoryProperties';
import { CategoryProperties } from '@/app/pages/personas/ScenarioBuilder';
import { FilterCriteria } from '@/app/pages/searches/FilterCriteria';
import { SnapshotsArray } from '@/app/snapshots/LocalStorageSnapshotStore';
import { DataStore } from '@/app/state/stores/DataStore';
import { Subscriber } from '@/app/subscribers/Subscriber';
import { SnapshotEvent } from '@/app/typings/snapshotTypes';
import SnapshotStore from '@/app/snapshots/SnapshotStore';
import { SnapshotStoreConfig } from './SnapshotStoreConfig';

import { BaseDataRoot } from '@/app/config/BaseConfig';


interface SnapshotDataParams<
  T extends BaseDataEntity = BaseDataRoot,
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
