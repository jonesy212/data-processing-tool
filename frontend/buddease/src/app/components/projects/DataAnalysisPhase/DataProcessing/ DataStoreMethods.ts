//  DataStoreMethods.ts
import { Category } from '@/app/components/libraries/categories/generateCategoryProperties';
import { BaseData } from "@/app/components/models/data/Data";
import { Snapshot, Snapshots, SnapshotsArray, SnapshotsObject } from "@/app/components/snapshots/LocalStorageSnapshotStore";
import SnapshotStore, { SubscriberCollection } from "@/app/components/snapshots/SnapshotStore";
import { Subscriber } from "@/app/components/users/Subscriber";
import { CategoryProperties } from "@/app/pages/personas/ScenarioBuilder";
import { SnapshotStoreMethod } from "@/app/components/snapshots/SnapshotStoreMethod";
import { DataStore } from "./DataStore";
import { SnapshotContainer, SnapshotDataType } from '@/app/components/snapshots';
import { CriteriaType } from '@/app/pages/searchs/CriteriaType';


interface DataStoreWithSnapshotMethods<T extends BaseData, K extends BaseData> extends DataStore<T, K> {
  snapshotMethods: SnapshotStoreMethod<T, K>[] | undefined;
}





export interface DataStoreMethods<T extends BaseData, K extends BaseData>
  extends DataStoreWithSnapshotMethods<T, K> {
  mapSnapshot: (
    id: number,
    storeId: string,
    snapshotStore: SnapshotStore<T, K>,
    snapshotContainer: SnapshotContainer<T, K>,
    snapshotId: string,
    criteria: CriteriaType,
    snapshot: Snapshot<T, K>,
    type: string,
    event: Event
  ) => Promise<Snapshot<T, K> | null | undefined>;


  mapSnapshots: (
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
      data: K,
      index: number
    ) => SnapshotsObject<T>
  ) => Promise<SnapshotsArray<T>>

  addSnapshot: (snapshot: Snapshot<T, K>,
    snapshotId: string,
    subscribers: SubscriberCollection<T, K> | undefined
  ) => Promise<Snapshot<T, K> | undefined>;

  addSnapshotSuccess: (snapshot: T, subscribers: Subscriber<T, K>[]) => void;

  getSnapshot: (
    snapshot: (id: string | number) =>
      | Promise<{
        snapshotId: number;
        snapshotData: SnapshotDataType<T, K>;
        category: Category | undefined;
        categoryProperties: CategoryProperties | undefined;
        dataStoreMethods: DataStore<T, K> | null;
        timestamp: string | number | Date | undefined;
        id: string | number | undefined;
        snapshot: Snapshot<T, K>;
        snapshotStore: SnapshotStore<T, K>;
        data: T;
      }>
      | undefined
  ) => Promise<Snapshot<T, K> | undefined>;

  getSnapshotSuccess: (snapshot: Snapshot<T, K>, subscribers: Subscriber<T, K>[]) => void;
  
  getSnapshotsByTopic: (topic: string) => Promise<Snapshots<T>>;

  getSnapshotsByCategory: (category: string) => Promise<Snapshots<T>>;
  getSnapshotsByPriority: (priority: string) => Promise<Snapshots<T>>;

  addData: (data: Snapshot<T, K>) => void;

  getData: (id: number, snapshot: Snapshot<T, K>) => Promise<SnapshotStore<T, K>[] | undefined>;
  removeData: (id: number) => void;

  updateData: (id: number, newData: Snapshot<T, K>) => void;

  getSnapshotsByTopicSuccess: (snapshots: Snapshots<T>) => void;
  getSnapshotsByCategorySuccess: (snapshots: Snapshots<T>) => void;
  getSnapshotsByKey: (key: string) => Promise<T[]>;
  getSnapshotsByKeySuccess: (snapshots: Snapshots<T>) => void;

  getSnapshotsByPrioritySuccess: (snapshots: Snapshots<T>) => void;

  snapshotMethods: SnapshotStoreMethod<T, K>[] | undefined;
  // More methods as required...
}

export type { DataStoreWithSnapshotMethods };
