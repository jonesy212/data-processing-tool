// // SnapshotStoreMethod.tsx
import { UnifiedMetaDataOptions } from "@/app/configs/database/MetaDataOptions";
import { CategoryProperties } from "@/app/pages/personas/ScenarioBuilder";
import { Category } from "../libraries/categories/generateCategoryProperties";
import { Data } from "../models/data/Data";
import { DataStoreMethods } from "../projects/DataAnalysisPhase/DataProcessing/ DataStoreMethods";
import { DataStore } from "../projects/DataAnalysisPhase/DataProcessing/DataStore";
import { Subscription } from "../subscriptions/Subscription";
import { Snapshot } from "./LocalStorageSnapshotStore";
import { SnapshotConfig } from "./SnapshotConfig";
import { SnapshotData } from "./SnapshotData";
import SnapshotStore from "./SnapshotStore";
import { SnapshotStoreConfig } from "./SnapshotStoreConfig";
import { SnapshotStoreProps } from "./useSnapshotStore";




// Define the necessary types
interface SnapshotStoreMethod<T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T> {
  snapshot: (
    id: string | number | undefined,
    snapshotId: string | null,
    snapshotData: SnapshotData<T, Meta, K>,
    category: symbol | string | Category | undefined,
    categoryProperties: CategoryProperties | undefined,
    callback: (snapshotStore: SnapshotStore<T, Meta, K>) => void,
    dataStore: DataStore<T, Meta, K>,
    dataStoreMethods: DataStoreMethods<T, Meta, K>,
    // dataStoreSnapshotMethods: DataStoreWithSnapshotMethods<T, Meta, K>,
    metadata: UnifiedMetaDataOptions,
    subscriberId: string, // Add subscriberId here
    endpointCategory: string | number,// Add endpointCategory here
    storeProps: SnapshotStoreProps<T, Meta, K>,
    snapshotConfigData: SnapshotConfig<T, Meta, K>,
    subscription: Subscription<T, Meta, K>,
    snapshotStoreConfigData?: SnapshotStoreConfig<T, Meta, K>,
    snapshotContainer?: SnapshotStore<T, Meta, K> | Snapshot<T, Meta, K> | null,
  ) => Promise<{snapshot: Snapshot<T, Meta, K>}>,
  // Add other required properties here
}

export type { SnapshotStoreMethod };
