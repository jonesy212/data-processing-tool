//  DataStoreMethods.ts
import { BaseData } from "@/app/components/models/data/Data";
import { SnapshotStoreMethod } from "@/app/components/snapshots/SnapshotStorMethods";
import { DataStore } from "./DataStore";
import { Snapshot } from "@/app/components/snapshots/LocalStorageSnapshotStore";
import { Subscriber } from "@/app/components/users/Subscriber";

interface DataStoreWithSnapshotMethods<T extends BaseData, K extends BaseData> extends DataStore<T, K> {
  snapshotMethods: SnapshotStoreMethod<T, K>[];
}
export interface DataStoreMethods<T extends BaseData, K extends BaseData> extends DataStoreWithSnapshotMethods<T, K> {
  addSnapshot: (snapshot: Snapshot<T, K>, subscribers: Subscriber<T, K>[]) => Promise<void>;
  addSnapshotSuccess: (snapshot: T) => void;
  getSnapshot: (id: string) => Promise<T | undefined>;
  
  getSnapshotSuccess: (snapshot: T) => void;
  getSnapshotsBySubscriber: (subscriber: string) => Promise<T[]>;
  getSnapshotsBySubscriberSuccess: (snapshots: T[]) => void;
  getSnapshotsByTopic: (topic: string) => Promise<T[]>;
  getSnapshotsByTopicSuccess: (snapshots: T[]) => void;
  getSnapshotsByCategory: (category: string) => Promise<T[]>;
  getSnapshotsByCategorySuccess: (snapshots: T[]) => void;
  getSnapshotsByKey: (key: string) => Promise<T[]>;
  getSnapshotsByKeySuccess: (snapshots: T[]) => void;
  getSnapshotsByPriority: (priority: string) => Promise<T[]>;
  getSnapshotsByPrioritySuccess: (snapshots: T[]) => void;

  snapshotMethods: SnapshotStoreMethod<T,K>[];
}

export type { DataStoreWithSnapshotMethods };
