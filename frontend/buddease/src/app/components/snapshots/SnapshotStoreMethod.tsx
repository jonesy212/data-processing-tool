// // SnapshotStoreMethod.tsx

import { CategoryProperties } from "@/app/pages/personas/ScenarioBuilder";
import { Category } from "../libraries/categories/generateCategoryProperties";
import { Data } from "../models/data/Data";
import { DataStore } from "../projects/DataAnalysisPhase/DataProcessing/DataStore";
import { Snapshot } from "./LocalStorageSnapshotStore";
import SnapshotStore from "./SnapshotStore";
import { SnapshotStoreConfig } from "./SnapshotStoreConfig";

// Define the necessary types
interface SnapshotStoreMethod<T extends Data, K extends Data> {
  snapshot: (
    id: string | number | undefined,
    snapshotId: string | null,
    snapshotData: Snapshot<T, K>,
    category: Category | undefined,
    categoryProperties: CategoryProperties | undefined,
    callback: (snapshotStore: SnapshotStore<T, K>) => void,
    dataStoreMethods: DataStore<T, K>,
    snapshotStoreConfigData?: SnapshotStoreConfig<T, K>,
    snapshotContainer?: SnapshotStore<T, K> | Snapshot<T, K> | null
  ) => Promise<{snapshot: Snapshot<T, K>}>,
  // Add other required properties here
}

export type { SnapshotStoreMethod };
