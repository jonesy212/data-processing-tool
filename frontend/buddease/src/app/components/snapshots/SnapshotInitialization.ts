import { StructuredMetadata } from "@/app/configs/StructuredMetadata";
import { BaseData, Data } from "../models/data/Data";
import { InitializedState } from "../projects/DataAnalysisPhase/DataProcessing/DataStore";
import { InitializedConfig } from "./SnapshotStoreConfig";

interface SnapshotInitialization<
  T extends BaseData<T>,
  K extends T = T,
  Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>
> {
  initialState: InitializedState<T, K> | {};
  initialConfig: InitializedConfig | {};
  onInitialize: () => void;
}


export type { SnapshotInitialization };
