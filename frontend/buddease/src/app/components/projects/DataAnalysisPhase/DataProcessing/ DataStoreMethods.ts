//  DataStoreMethods.ts
import { Category } from '@/app/components/libraries/categories/generateCategoryProperties';
import { BaseData } from '@/app/components/models/data/Data';
import { SnapshotContainer, SnapshotData } from '@/app/components/snapshots';
import { Snapshot, Snapshots, SnapshotsArray, SnapshotsObject } from "@/app/components/snapshots/LocalStorageSnapshotStore";
import SnapshotStore from "@/app/components/snapshots/SnapshotStore";
import { SnapshotStoreMethod } from "@/app/components/snapshots/SnapshotStoreMethod";
import { Subscriber } from "@/app/components/users/Subscriber";
import { StructuredMetadata } from '@/app/configs/StructuredMetadata';
import { CategoryProperties } from "@/app/pages/personas/ScenarioBuilder";
import { CriteriaType } from '@/app/pages/searchs/CriteriaType';
import { DataStore } from "./DataStore";


interface DataStoreWithSnapshotMethods <T extends  BaseData<any>,  K extends T = T,  Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>> 
  extends DataStore<T, K> {
  snapshotMethods: SnapshotStoreMethod<T, K>[] | undefined
}

export interface DataStoreMethods <
  T extends BaseData<any>,  
  K extends T = T,
  Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>
  extends DataStoreWithSnapshotMethods<T, K> { 
  mapSnapshot: (
    id: number,
    storeId: string | number,
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
    ) => SnapshotsObject<T, K>
  ) => Promise<SnapshotsArray<T, K>>

  addSnapshot: (snapshot: Snapshot<T, K>,
    snapshotId: string,
    subscribers: SubscriberCollection<T, K> | undefined
  ) => Promise<Snapshot<T, K> | undefined>;

  addSnapshotSuccess: (snapshot: T, subscribers: Subscriber<T, K>[]) => void;

  getSnapshot: (
    snapshot: (id: string | number) =>
      | Promise<{
        snapshotId: number;
        snapshotData: SnapshotData<T, K>;
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

  getSnapshotSuccess: (snapshot: Snapshot<T, K>, subscribers: Subscriber<T, K>[]) => Promise<SnapshotStore<T, K>>;
  
  getSnapshotsByTopic: (topic: string) => Promise<Snapshots<T, K>>;

  getSnapshotsByCategory: (category: string) => Promise<Snapshots<T, K>>;
  getSnapshotsByPriority: (priority: string) => Promise<Snapshots<T, K>>;

  addData: (
    id: string,
    data: T,
    snapshotData: SnapshotData<T, K>, 
    snapshotStore: SnapshotStore<T, K>, 
    category: symbol | string | Category | undefined, 
    categoryProperties: CategoryProperties | undefined,
    dataStoreMethods: DataStoreMethods<T, K>
  ) => Promise<SnapshotStore<T, K>>;

  getData: (
    id: number,
    snapshot: Snapshot<T, K>,
    data: Snapshot<T, K> | Snapshot<T, CustomSnapshotData & T>
  ) => Promise<SnapshotStore<T, K>[] | undefined>;

  removeData: (id: number) => void;

  updateData: (id: number, newData: Snapshot<T, K>) => void;

  getSnapshotsByTopicSuccess: (snapshots: Snapshots<T, K>) => void;
  getSnapshotsByCategorySuccess: (snapshots: Snapshots<T, K>) => void;
  getSnapshotsByKey: (key: string) => Promise<T[]>;
  getSnapshotsByKeySuccess: (snapshots: Snapshots<T, K>) => void;

  getSnapshotsByPrioritySuccess: (snapshots: Snapshots<T, K>) => void;

  snapshotMethods: SnapshotStoreMethod<T, K>[] | undefined;
  // More methods as required...
}

export type { DataStoreWithSnapshotMethods };
