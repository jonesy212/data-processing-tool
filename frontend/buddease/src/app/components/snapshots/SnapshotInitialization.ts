import { Data } from "../models/data/Data";
import { InitializedState } from "../projects/DataAnalysisPhase/DataProcessing/DataStore";
import { InitializedConfig } from "./SnapshotStoreConfig";

interface SnapshotInitialization<T extends Data, K extends Data = T> {
  initialState: InitializedState<T, K> | {};
  initialConfig: InitializedConfig | {};
  onInitialize: () => void;
}


export type {SnapshotInitialization}