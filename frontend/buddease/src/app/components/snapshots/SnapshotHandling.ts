// SnapshotHandling.ts
import { Data } from '@/app/components/models/data/Data';
import { CategoryProperties } from '../../pages/personas/ScenarioBuilder';
import { Category } from '../libraries/categories/generateCategoryProperties';
import { Snapshot, Snapshots, SnapshotsArray, SnapshotsObject } from './LocalStorageSnapshotStore';
import SnapshotStore from './SnapshotStore';
import { SnapshotStoreConfig } from './SnapshotStoreConfig';


interface SnapshotHandling<T extends BaseDataEntity, K extends T = T, Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>> {
    mapSnapshots(
        storeIds: number[],
        snapshotId: string,
        category: Category | undefined,
        categoryProperties: CategoryProperties | undefined,
        snapshot: Snapshot<T, K, Meta, ExcludedFields>,
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
          snapshot: Snapshot<T, K, Meta, ExcludedFields>,
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
        snapshotDataConfig?: SnapshotStoreConfig<T, K, Meta, ExcludedFields>[]
      ) => Promise<SnapshotStore<T, K, Meta, ExcludedFields> | null>;
    
      updateSnapshotStore: (
        id: string,
        snapshotId: number,
        snapshotStoreData: Snapshots<T, K, Meta, ExcludedFields>,
        category?:  Category,
        callback?: (snapshotStore: SnapshotStore<T, K, Meta, ExcludedFields>) => void,
        snapshotDataConfig?: SnapshotStoreConfig<T, K, Meta, ExcludedFields>[]
      ) => Promise<SnapshotStore<T, K, Meta, ExcludedFields> | null>;
    

  initSnapshot: (
    snapshot: SnapshotStore<T, K, Meta, ExcludedFields> | Snapshot<T, K, Meta, ExcludedFields> | null,
    snapshotId: string | null,
    snapshotData: SnapshotData<T, K, Meta, ExcludedFields>, // Ensure snapshotData matches SnapshotStore<T, K, Meta, ExcludedFields>
    category: Category | undefined,    snapshotConfig: SnapshotStoreConfig<T, K, Meta, ExcludedFields>, // Use K instead of T for snapshotConfig
    callback: (snapshotStore: SnapshotStore<any, any>) => void
  ) => void;

  deleteSnapshot: (id: string) => void;

  reduceSnapshots: <U>(callback: (acc: U, snapshot: Snapshot<T, K, Meta, ExcludedFields>) => U, initialValue: U) => U;
  sortSnapshots: (compareFn: (a: Snapshot<T, K, Meta, ExcludedFields>, b: Snapshot<T, K, Meta, ExcludedFields>) => number) => void;
  filterSnapshots: (predicate: (snapshot: Snapshot<T, K, Meta, ExcludedFields>) => boolean) => Snapshot<T, K, Meta, ExcludedFields>[];
  
  mergeSnapshots: (snapshots: Snapshots<T, K, Meta, ExcludedFields>, category: string) => Promise<void>;
}
