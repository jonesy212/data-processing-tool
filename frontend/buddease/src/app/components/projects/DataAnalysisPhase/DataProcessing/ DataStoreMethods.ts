//  DataStoreMethods.ts
import { Category } from '@/app/components/libraries/categories/generateCategoryProperties';
import { SnapshotContainer } from '@/app/components/snapshots';
import { Snapshot, Snapshots, SnapshotsArray, SnapshotsObject } from "@/app/components/snapshots/LocalStorageSnapshotStore";
import SnapshotStore, { SubscriberCollection } from "@/app/components/snapshots/SnapshotStore";
import { SnapshotStoreMethod } from "@/app/components/snapshots/SnapshotStoreMethod";
import { Subscriber } from "@/app/components/users/Subscriber";
import { CategoryProperties } from "@/app/pages/personas/ScenarioBuilder";
import { CriteriaType } from '@/app/pages/searchs/CriteriaType';
import { DataStore } from "./DataStore";


interface DataStoreWithSnapshotMethods <T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T> extends DataStore<T, Meta, K> {
  snapshotMethods: SnapshotStoreMethod<T, Meta, K>[] | undefined;
}





export interface DataStoreMethods <T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T>
  extends DataStoreWithSnapshotMethods<T, Meta, K> {
  mapSnapshot: (
    id: number,
    storeId: string,
    snapshotStore: SnapshotStore<T, Meta, K>,
    snapshotContainer: SnapshotContainer<T, Meta, K>,
    snapshotId: string,
    criteria: CriteriaType,
    snapshot: Snapshot<T, Meta, K>,
    type: string,
    event: Event
  ) => Promise<Snapshot<T, Meta, K> | null | undefined>;


  mapSnapshots: (
    storeIds: number[],
    snapshotId: string,
    category: symbol | string | Category | undefined,
    categoryProperties: CategoryProperties | undefined,

    snapshot: Snapshot<T, Meta, K>,
    timestamp: string | number | Date | undefined,
    type: string,
    event: Event,
    id: number,
    snapshotStore: SnapshotStore<T, Meta, K>,
    data: T,
    callback: (
      storeIds: number[],
      snapshotId: string,
      category: symbol | string | Category | undefined,
      categoryProperties: CategoryProperties | undefined,
      snapshot: Snapshot<T, Meta, K>,
      timestamp: string | number | Date | undefined,
      type: string,
    event: Event,
      id: number,
      snapshotStore: SnapshotStore<T, Meta, K>,
      data: K,
      index: number
    ) => SnapshotsObject<T, Meta, K>
  ) => Promise<SnapshotsArray<T, Meta>>

  addSnapshot: (snapshot: Snapshot<T, Meta, K>,
    snapshotId: string,
    subscribers: SubscriberCollection<T, Meta, K> | undefined
  ) => Promise<Snapshot<T, Meta, K> | undefined>;

  addSnapshotSuccess: (snapshot: T, subscribers: Subscriber<T, Meta, K>[]) => void;

  getSnapshot: (
    snapshot: (id: string | number) =>
      | Promise<{
        snapshotId: number;
        snapshotData: SnapshotData<T, Meta, K>;
        category: Category | undefined;
        categoryProperties: CategoryProperties | undefined;
        dataStoreMethods: DataStore<T, Meta, K> | null;
        timestamp: string | number | Date | undefined;
        id: string | number | undefined;
        snapshot: Snapshot<T, Meta, K>;
        snapshotStore: SnapshotStore<T, Meta, K>;
        data: T;
      }>
      | undefined
  ) => Promise<Snapshot<T, Meta, K> | undefined>;

  getSnapshotSuccess: (snapshot: Snapshot<T, Meta, K>, subscribers: Subscriber<T, Meta, K>[]) => void;
  
  getSnapshotsByTopic: (topic: string) => Promise<Snapshots<T, Meta>>;

  getSnapshotsByCategory: (category: string) => Promise<Snapshots<T, Meta>>;
  getSnapshotsByPriority: (priority: string) => Promise<Snapshots<T, Meta>>;

  addData: (
    id: string,
    data: T,
    snapshotData: SnapshotData<T, Meta, K>, 
    snapshotStore: SnapshotStore<T, Meta, K>, 
    category: symbol | string | Category | undefined, 
    categoryProperties: CategoryProperties | undefined,
    dataStoreMethods: DataStoreMethods<T, Meta, K>
  ) => Promise<SnapshotStore<T, Meta, K>>;

  getData: (id: number, snapshot: Snapshot<T, Meta, K>) => Promise<SnapshotStore<T, Meta, K>[] | undefined>;
  removeData: (id: number) => void;

  updateData: (id: number, newData: Snapshot<T, Meta, K>) => void;

  getSnapshotsByTopicSuccess: (snapshots: Snapshots<T, Meta>) => void;
  getSnapshotsByCategorySuccess: (snapshots: Snapshots<T, Meta>) => void;
  getSnapshotsByKey: (key: string) => Promise<T[]>;
  getSnapshotsByKeySuccess: (snapshots: Snapshots<T, Meta>) => void;

  getSnapshotsByPrioritySuccess: (snapshots: Snapshots<T, Meta>) => void;

  snapshotMethods: SnapshotStoreMethod<T, Meta, K>[] | undefined;
  // More methods as required...
}

export type { DataStoreWithSnapshotMethods };
