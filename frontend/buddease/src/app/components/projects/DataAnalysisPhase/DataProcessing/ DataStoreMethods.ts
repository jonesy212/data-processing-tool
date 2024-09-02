//  DataStoreMethods.ts
import { Category } from '@/app/components/libraries/categories/generateCategoryProperties';
import { BaseData } from "@/app/components/models/data/Data";
import { Snapshot, Snapshots, SnapshotsObject } from "@/app/components/snapshots/LocalStorageSnapshotStore";
import SnapshotStore, { SubscriberCollection } from "@/app/components/snapshots/SnapshotStore";
import { Subscriber } from "@/app/components/users/Subscriber";
import { CategoryProperties } from "@/app/pages/personas/ScenarioBuilder";
import { SnapshotStoreMethod } from "@/app/components/snapshots/SnapshotStoreMethod";
import { DataStore } from "./DataStore";

interface DataStoreWithSnapshotMethods<T extends BaseData, K extends BaseData> extends DataStore<T, K> {
  snapshotMethods: SnapshotStoreMethod<T, K>[] | undefined;

}

export interface DataStoreMethods<T extends BaseData, K extends BaseData> 
extends DataStoreWithSnapshotMethods<T, K> {
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
      categoryProperties: CategoryProperties,
      snapshot: Snapshot<T, K>,
      timestamp: string | number | Date | undefined,
      type: string,
      event: Event,
      id: number,
      snapshotStore: SnapshotStore<T, K>,
      data: K,
      index: number
    ) => SnapshotsObject<T>
  )=> SnapshotsObject<T>

  addSnapshot: ( snapshot: Snapshot<T, K>,
    snapshotId: string,
    subscribers: SubscriberCollection<T, K> | undefined
  ) => Promise<Snapshot<T, K> | undefined>;

  addSnapshotSuccess: (snapshot: T, subscribers: Subscriber<T, K>[]) => void;
  getSnapshot: (
    snapshot: (id: string) =>
      | Promise<{
        snapshotId: number;
        snapshotData: T;
        category: Category | undefined;
        categoryProperties: CategoryProperties;
        dataStoreMethods: DataStore<T, K>;
        timestamp: string | number | Date | undefined;
        id: string | number | undefined;
        snapshot: Snapshot<T, K>;
        snapshotStore: SnapshotStore<T, K>;
        data: T;
        }>
      | undefined
  ) => Promise<Snapshot<T, K> | undefined>;
  
  getSnapshotSuccess: (snapshot: T, subscribers: Subscriber<T, K>[]) => void;
  getSnapshotsBySubscriber: (subscriber: string) => Promise<T[]>;
  getSnapshotsBySubscriberSuccess: (snapshots: Snapshots<T>) => void;
  getSnapshotsByTopic: (topic: string) => Promise<Snapshots<T>>;
  getSnapshotsByTopicSuccess: (snapshots: Snapshots<T>) => void;
  getSnapshotsByCategory: (category: string) => Promise<Snapshots<T>>;
  getSnapshotsByCategorySuccess: (snapshots: Snapshots<T>) => void;
  getSnapshotsByKey: (key: string) => Promise<T[]>;
  getSnapshotsByKeySuccess: (snapshots: Snapshots<T>) => void;
  getSnapshotsByPriority: (priority: string) => Promise<Snapshots<T>>;
  getSnapshotsByPrioritySuccess: (snapshots: Snapshots<T>) => void;

  snapshotMethods: SnapshotStoreMethod<T, K>[];
}

export type { DataStoreWithSnapshotMethods };
