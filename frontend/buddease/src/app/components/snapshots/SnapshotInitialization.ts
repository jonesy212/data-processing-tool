import { Data } from "../models/data/Data";
import { InitializedState } from "../projects/DataAnalysisPhase/DataProcessing/DataStore";
import { InitializedConfig } from "./SnapshotStoreConfig";

interface SnapshotInitialization<T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T> {
  initialState: InitializedState<T, Meta, K> | {};
  initialConfig: InitializedConfig | {};
  onInitialize: () => void;
}


export type { SnapshotInitialization };
