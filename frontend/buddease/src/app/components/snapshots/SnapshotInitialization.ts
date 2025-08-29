import { StructuredMetadata } from "@/app/configs/StructuredMetadata";
import { BaseData } from "../models/data/Data";
import { InitializedState } from "../projects/DataAnalysisPhase/DataProcessing/DataStore";
import { InitializedConfig } from "./SnapshotStoreConfig";
import { BaseDataEntity, DefaultMeta } from "../../../data_analysis/frontend/buddease/src/app/configs/BaseConfig";

interface SnapshotInitialization<
  T extends BaseDataEntity, 
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>
> {
  initialState: InitializedState<T, K> | {};
  initialConfig: InitializedConfig | {};
  onInitialize: (callback: () => void) => void;
}


export type { SnapshotInitialization };
