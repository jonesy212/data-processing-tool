// SnapshotDataParams.ts
import { Attachment } from '@/app/documents/attachment/Attachment';
import { Category } from "@/app/libraries/categories/generateCategoryProperties";
import { CategoryProperties } from "@/app/pages/personas/ScenarioBuilder";
import { FilterCriteria } from '@/app/pages/searches/FilterCriteria';
import { DataStore } from "@/app/projects/DataAnalysisPhase/DataProcessing/DataStore";
import { SnapshotsArray } from "@/app/snapshots/LocalStorageSnapshotStore";
import { Subscriber } from "@/app/subscribers/Subscriber";
import { SnapshotEvent } from "@/app/typings/eventTypes";
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/config/BaseConfig';
import SnapshotStore from "./SnapshotStore";
import { SnapshotStoreConfig } from "./SnapshotStoreConfig";

import { BaseDataRoot } from '@/config/BaseConfig';


interface SnapshotDataParams<
  T extends BaseDataEntity = BaseDataRoot,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {
    snapshotId: string,
    snapshot: T | null,
    category?: Category,
    categoryProperties: CategoryProperties | undefined,
    callback: (snapshot: T) => void,
    snapshots: SnapshotsArray<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    type: string,
    event: SnapshotEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    data: Map<string, T>,
    subscribers: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
    snapshotData: Partial<SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
    id?: string | number; 

    snapshotDataParam?: T; // ← Missing: snapshotData parameter from method
    dataStoreMethods?: DataStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>; // ← Missing: dataStoreMethods parameter
    snapshotIdNumber?: number; // ← Missing: snapshotId as number (current snapshotId is string)
    returnType?: 'map' | 'array' | 'single' | 'all'; // ← For flexibility
    includeRelations?: boolean; // ← Whether to include related snapshots
    depth?: number; // ← How deep to traverse relationships
    filters?: FilterCriteria; // ← Filtering options
    sortBy?: string | string[]; // ← Sorting options
    limit?: number; // ← Result limit
    offset?: number; // ← Pagination offset
  // ... other properties
}



export type { SnapshotDataParams };
