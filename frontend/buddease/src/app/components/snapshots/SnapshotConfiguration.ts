// SnapshotConfiguration.ts

import { Data } from "../models/data/Data";
import { DebugInfo, TempData } from "../models/data/TempData";
import { InitializedState } from "../projects/DataAnalysisPhase/DataProcessing/DataStore";
import { SnapshotStoreConfig } from "./SnapshotStoreConfig";

interface SnapshotConfiguration<T extends Data, K extends Data>{
    initialState: InitializedState<T, K> | {};
    configOption?: string | SnapshotStoreConfig<T, K> | null;

    config: SnapshotStoreConfig<T, K> | null;
  
  // Property to hold debugging information
  debugInfo?: DebugInfo; // Optional property to hold debugging information

  // Property for storing temporary data
  tempData?: TempData<T, K>; // Optional property to hold temporary data

    // initialState: Map<string, Snapshot<T, K>> | SnapshotStore<T, K> | Snapshot<T, K> | null;
    initialConfig?: SnapshotStoreConfig<T, K> | null;


    // Load configuration method
    loadConfig(): void;

    // Save configuration method
    saveConfig(newConfig: SnapshotStoreConfig<T, K>): void;
}

export type {SnapshotConfiguration}