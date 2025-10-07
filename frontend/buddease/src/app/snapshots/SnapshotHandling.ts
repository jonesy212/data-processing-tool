// SnapshotHandling.ts
import { Data } from '@/app/models/data/Data';
import { CategoryProperties } from '@/app/components/pages/personas/ScenarioBuilder';
import { Category } from '@/app/libraries/categories/generateCategoryProperties';
import { Snapshot, Snapshots, SnapshotsArray, SnapshotsObject } from '@/LocalStorageSnapshotStore';
import SnapshotStore from '@/app/snapshots/SnapshpshotStore';
import { SnapshotStoreConfig } from '@/app/snapshots/SnapshpshotStoreConfig';


interface SnapshotHandling<T extends BaseDataEntity, K extends T = T, Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>> {
    mapSnapshots(
        storeIds: number[],
        snapshotId: string,
        category: Category | undefined,
        categoryProperties: CategoryProperties | undefined,
        snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
        timestamp: string | number | Date | undefined,
        type: string,
        event: SnapshotEvent<T, K, Meta, ExcludedFields>,
        id: number,
        snapshotStore: SnapshotStore<T, K, Meta, ExcludedFields>,
        data: Data,
        callback: (
          storeIds: number[],
          snapshotId: string,
          category: Category | undefined,          categoryProperties: CategoryProperties | undefined,
          snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
          timestamp: string | number | Date | undefined,
          type: string,
          event: SnapshotEvent<T, K, Meta, ExcludedFields>,
          id: number,
          snapshotStore: SnapshotStore<T, K, Meta, ExcludedFields>,
          data: T,
          index: number
        ) => SnapshotsObject<T, K, Meta, ExcludedFields>
      ): Promise<SnapshotsArray<T, K, Meta>>    

      createSnapshotStore: (
        id: string,
        storeId: number,
        snapshotId: string,
        snapshotStoreData: SnapshotStore<T, K, Meta, ExcludedFields>[],
        category: Category | undefined,
        categoryProperties: CategoryProperties | undefined,
        callback?: (snapshotStore: SnapshotStore<T, K, Meta, ExcludedFields>) => void,
        snapshotDataConfig?: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]
      ) => Promise<SnapshotStore<T, K, Meta, ExcludedFields> | null>;
    
      updateSnapshotStore: (
        id: string,
        snapshotId: number,
        snapshotStoreData: Snapshots<T, K, Meta, ExcludedFields>,
        category?:  Category,
        callback?: (snapshotStore: SnapshotStore<T, K, Meta, ExcludedFields>) => void,
        snapshotDataConfig?: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]
      ) => Promise<SnapshotStore<T, K, Meta, ExcludedFields> | null>;
    

  initSnapshot: (
    snapshot: SnapshotStore<T, K, Meta, ExcludedFields> | Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null,
    snapshotId: string | null,
    snapshotData: SnapshotData<T, K, Meta, ExcludedFields>, // Ensure snapshotData matches SnapshotStore<T, K, Meta, ExcludedFields>
    category: Category | undefined,    snapshotConfig: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, // Use K instead of T for snapshotConfig
    callback: (snapshotStore: SnapshotStore<any, any>) => void
  ) => void;

  deleteSnapshot: (id: string) => void;

  reduceSnapshots: <U>(callback: (acc: U, snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => U, initialValue: U) => U;
  sortSnapshots: (compareFn: (a: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, b: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => number) => void;
  filterSnapshots: (predicate: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => boolean) => Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
  
  mergeSnapshots: (snapshots: Snapshots<T, K, Meta, ExcludedFields>, category: string) => Promise<void>;
}
