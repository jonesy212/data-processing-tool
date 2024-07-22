//  DataStoreMethods.ts
import { BaseData } from "@/app/components/models/data/Data";

export interface DataStoreMethods<T extends BaseData> {
  addSnapshot: (snapshot: T) => void;
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
}

