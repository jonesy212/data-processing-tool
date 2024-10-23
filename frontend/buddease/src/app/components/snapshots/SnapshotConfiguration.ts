// SnapshotConfiguration.ts

import { Data } from "../models/data/Data";
import { DebugInfo, TempData } from "../models/data/TempData";
import { InitializedState } from "../projects/DataAnalysisPhase/DataProcessing/DataStore";
import { SnapshotStoreConfig } from "./SnapshotStoreConfig";

interface SnapshotConfiguration<T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T>{
    initialState: InitializedState<T, Meta, K> | {};
    configOption?: string | SnapshotStoreConfig<T, Meta, K> | null;

    config: SnapshotStoreConfig<T, Meta, K> | null;
  
  // Property to hold debugging information
  debugInfo?: DebugInfo; // Optional property to hold debugging information

  // Property for storing temporary data
  tempData?: TempData<T, Meta, K>; // Optional property to hold temporary data

    // initialState: Map<string, Snapshot<T, Meta, K>> | SnapshotStore<T, Meta, K> | Snapshot<T, Meta, K> | null;
    initialConfig?: SnapshotStoreConfig<T, Meta, K> | null;


    // Load configuration method
    loadConfig(): void;

    // Save configuration method
    saveConfig(newConfig: SnapshotStoreConfig<T, Meta, K>): void;
}

export type { SnapshotConfiguration };
