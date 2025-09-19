import { StructuredMetadata } from "@/app/configs/StructuredMetadata";
import { BaseData } from "../models/data/Data";
import { InitializedState } from "../projects/DataAnalysisPhase/DataProcessing/DataStore";
import { InitializedConfig } from "./SnapshotStoreConfig";
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from "../../../data_analysis/frontend/buddease/src/app/configs/BaseConfig";
import { Attachment } from "@/components/documents/Attachment/attachment";

interface SnapshotInitialization<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T  
> {
  initialState: InitializedState<T, K, Meta, ExcludedFields> | {};
  initialConfig: InitializedConfig | {};
  onInitialize: (callback: () => void) => void;
}


export type { SnapshotInitialization };
