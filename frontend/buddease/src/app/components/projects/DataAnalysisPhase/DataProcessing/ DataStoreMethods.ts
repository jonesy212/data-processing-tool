//  DataStoreMethods.ts
import { BaseData } from "@/app/components/models/data/Data";
import { SnapshotStoreMethod } from "@/app/components/snapshots/SnapshotStorMethods";
import { DataStore } from "./DataStore";
import { Snapshot, Snapshots } from "@/app/components/snapshots/LocalStorageSnapshotStore";
import { Subscriber } from "@/app/components/users/Subscriber";
import SnapshotStore from "@/app/components/snapshots/SnapshotStore";

interface DataStoreWithSnapshotMethods<T extends BaseData, K extends BaseData> extends DataStore<T, K> {
  snapshotMethods: SnapshotStoreMethod<T, K>[] | undefined;
  
}

export interface DataStoreMethods<T extends BaseData, K extends BaseData> extends DataStoreWithSnapshotMethods<T, K> {
  mapSnapshot: (snapshot: Snapshot<T, K>) => Snapshot<T, K>;
  mapSnapshots: (snapshots: Snapshots<T>) => Snapshots<T>;
  addSnapshot: (snapshot: Snapshot<T, K>, subscribers: Subscriber<T, K>[]) => Promise<void>;
  addSnapshotSuccess: (snapshot: T, subscribers: Subscriber<T, K>[]) => void;
  getSnapshot: (
    category: any,
      timestamp: any,
    id: number,
    snapshot: Snapshot<BaseData, K>,
    snapshotStore: SnapshotStore<T, K>,
    data: T,
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
  getSnapshotsByPrioritySuccess: (snapshots :Snapshots<T>) => void;

  snapshotMethods: SnapshotStoreMethod<T,K>[];
}

export type { DataStoreWithSnapshotMethods };
