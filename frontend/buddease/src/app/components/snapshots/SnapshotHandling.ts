// SnapshotHandling.ts
import { Data } from '@/app/components/models/data/Data';
import { StructuredMetadata } from "@/app/configs/StructuredMetadata";
import { CategoryProperties } from '../../pages/personas/ScenarioBuilder';
import { BaseData } from '../data/Data';
import { Category } from '../libraries/categories/generateCategoryProperties';
import { Snapshot, Snapshots, SnapshotsArray, SnapshotsObject } from './LocalStorageSnapshotStore';
import SnapshotStore from './SnapshotStore';
import { SnapshotStoreConfig } from './SnapshotStoreConfig';


interface SnapshotHandling<T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>> {
    mapSnapshots(
        storeIds: number[],
        snapshotId: string,
        category: Category | undefined,
        categoryProperties: CategoryProperties | undefined,
        snapshot: Snapshot<T, K>,
        timestamp: string | number | Date | undefined,
        type: string,
        event: Event,
        id: number,
        snapshotStore: SnapshotStore<T, K>,
        data: Data,
        callback: (
          storeIds: number[],
          snapshotId: string,
          category: symbol | string | Category | undefined,
          categoryProperties: CategoryProperties | undefined,
          snapshot: Snapshot<T, K>,
          timestamp: string | number | Date | undefined,
          type: string,
          event: Event,
          id: number,
          snapshotStore: SnapshotStore<T, K>,
          data: T,
          index: number
        ) => SnapshotsObject<T, K>
      ): Promise<SnapshotsArray<T, K>>    

      createSnapshotStore: (
        id: string,
        storeId: number,
        snapshotId: string,
        snapshotStoreData: SnapshotStore<T, K>[],
        category: Category | undefined,
        categoryProperties: CategoryProperties | undefined,
        callback?: (snapshotStore: SnapshotStore<T, K>) => void,
        snapshotDataConfig?: SnapshotStoreConfig<T, K>[]
      ) => Promise<SnapshotStore<T, K> | null>;
    
      updateSnapshotStore: (
        id: string,
        snapshotId: number,
        snapshotStoreData: Snapshots<T, K>,
        category?: string | symbol | Category,
        callback?: (snapshotStore: SnapshotStore<T, K>) => void,
        snapshotDataConfig?: SnapshotStoreConfig<T, K>[]
      ) => Promise<SnapshotStore<T, K> | null>;
    

  initSnapshot: (
    snapshot: SnapshotStore<T, K> | Snapshot<T, K> | null,
    snapshotId: string | null,
    snapshotData: SnapshotData<T, K>, // Ensure snapshotData matches SnapshotStore<T, K>
    category: symbol | string | Category | undefined,
    snapshotConfig: SnapshotStoreConfig<T, K>, // Use K instead of T for snapshotConfig
    callback: (snapshotStore: SnapshotStore<any, any>) => void
  ) => void;

  deleteSnapshot: (id: string) => void;

  reduceSnapshots: <U>(callback: (acc: U, snapshot: Snapshot<T, K>) => U, initialValue: U) => U;
  sortSnapshots: (compareFn: (a: Snapshot<T, K>, b: Snapshot<T, K>) => number) => void;
  filterSnapshots: (predicate: (snapshot: Snapshot<T, K>) => boolean) => Snapshot<T, K>[];
  
  mergeSnapshots: (snapshots: Snapshots<T, K>, category: string) => Promise<void>;
}
