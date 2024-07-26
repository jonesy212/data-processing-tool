// SnapshotStorMethods.ts

import { CategoryProperties } from "@/app/pages/personas/ScenarioBuilder";
import { BaseData } from "../models/data/Data";
import { SnapshotStoreConfig } from "./SnapshotConfig";
import { Snapshots } from "./LocalStorageSnapshotStore";

// Define the necessary types
interface SnapshotStoreMethod<T extends BaseData, K extends BaseData> {
  snapshot: (
    id: string,
    snapshotData: SnapshotStoreConfig<any, K>,
    category: string | CategoryProperties | undefined,
    callback: (snapshots: Snapshots<T>) => void
  ) => void;
  // Add other required properties here
}

export type { SnapshotStoreMethod };
