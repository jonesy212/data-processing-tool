import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from "@/config/s/BaseConfig";
import { InitializedState } from "@/app/projects/DataAnalysisPhase/DataProcessing/DataStore";
import { Attachment } from "@/components/documents/Attachment/attachment";
import { InitializedConfig } from "./SnapshotStoreConfig";

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
