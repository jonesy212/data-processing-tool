// SnapshotDataParams.ts
import { FilterCriteria } from '@/app/pages/searchs/FilterCriteria';
import { SnapshotsArray } from "."
import { Category } from "@/app/libraries/categories/generateCategoryProperties"
import { DataStore } from "@/app/projects/DataAnalysisPhase/DataProcessing/DataStore"
import { Subscriber } from "@/app/users/Subscriber"
import { BaseDataEntity, DefaultMeta, DefaultExcludedFields } from "@/config/BaseConfig"
import { CategoryProperties } from "@/app/pages/personas/ScenarioBuilder"
import { SnapshotEvent } from "@/app/typings/eventTypes"
import SnapshotStore from "./SnapshotStore"
import { SnapshotStoreConfig } from "./SnapshotStoreConfig"

interface SnapshotDataParams<T extends BaseDataEntity, 
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>
> {
    snapshotId: string,
    snapshot: T | null,
    category: Category | undefined,
    categoryProperties: CategoryProperties | undefined,
    callback: (snapshot: T) => void,
    snapshots: SnapshotsArray<T, K, Meta>,
    type: string,
    event: SnapshotEvent<T, K, Meta, ExcludedFields>,
    snapshotStore: SnapshotStore<T, K, Meta, ExcludedFields>,
    data: Map<string, T>,
    subscribers: Subscriber<T, K, Meta, ExcludedFields>[],
    snapshotData: Partial<SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
    id?: string | number; 

    snapshotDataParam?: T; // ← Missing: snapshotData parameter from method
    dataStoreMethods?: DataStore<T, K, Meta, ExcludedFields>; // ← Missing: dataStoreMethods parameter
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



export type { SnapshotDataParams }