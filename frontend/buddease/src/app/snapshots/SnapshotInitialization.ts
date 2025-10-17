import { InitializedState } from "@/app/projects/DataAnalysisPhase/DataProcessing/DataStore";
import { Attachment } from "@/components/documents/Attachment/attachment";
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/config/BaseConfig';
import { InitializedConfig } from "./SnapshotStoreConfig";

interface SnapshotInitialization<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T  
> {
  initialState: InitializedState<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | {};
  initialConfig: InitializedConfig | {};
  onInitialize: (callback: () => void) => void;
}


export type { SnapshotInitialization };
