// SnapshotHandling.ts
import { CategoryProperties } from '@/app/components/pages/personas/ScenarioBuilder';
import { Category } from '@/app/libraries/categories/generateCategoryProperties';
import { Data } from '@/app/models/data/Data';
import SnapshotStore from '@/app/snapshots/SnapshotStore';
import { SnapshotStoreConfig } from '@/app/snapshots/SnapshotStoreConfig';
import { Snapshot, Snapshots, SnapshotsArray, SnapshotsObject } from '@/LocalStorageSnapshotStore';


interface SnapshotHandling<T extends BaseDataEntity, K extends T = T, Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>> {
    mapSnapshots(
        storeIds: number[],
        snapshotId: string,
        category?: Category,
        categoryProperties: CategoryProperties | undefined,
        snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
        timestamp: string | number | Date | undefined,
        type: string,
        event: SnapshotEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
        id: number,
        snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
        data: Data,
        callback: (
          storeIds: number[],
          snapshotId: string,
          category?: Category,          categoryProperties: CategoryProperties | undefined,
          snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
          timestamp: string | number | Date | undefined,
          type: string,
          event: SnapshotEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
          id: number,
          snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
          data: T,
          index: number
        ) => SnapshotsObject<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
      ): Promise<SnapshotsArray<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>    

      createSnapshotStore: (
        id: string,
        storeId: number,
        snapshotId: string,
        snapshotStoreData: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
        category?: Category,
        categoryProperties: CategoryProperties | undefined,
        callback?: (snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void,
        snapshotDataConfig?: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]
      ) => Promise<SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null>;
    
      updateSnapshotStore: (
        id: string,
        snapshotId: number,
        snapshotStoreData: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
        category?:  Category,
        callback?: (snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void,
        snapshotDataConfig?: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]
      ) => Promise<SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null>;
    

  initSnapshot: (
    snapshot: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null,
    snapshotId: string | null,
    snapshotData: SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, // Ensure snapshotData matches SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
    category?: Category,    snapshotConfig: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, // Use K instead of T for snapshotConfig
    callback: (snapshotStore: SnapshotStore<any, any>) => void
  ) => void;

  deleteSnapshot: (id: string) => void;

  reduceSnapshots: <U>(callback: (acc: U, snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => U, initialValue: U) => U;
  sortSnapshots: (compareFn: (a: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, b: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => number) => void;
  filterSnapshots: (predicate: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => boolean) => Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
  
  mergeSnapshots: (snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, category: string) => Promise<void>;
}
