// SnapshotInitialization.ts
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { Attachment } from '@/app/documents/attachment/Attachment';
import { InitializedState } from "@/app/state/stores/DataStore";
import { InitializedConfig } from "@/app/snapshots/SnapshotStoreConfig";

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
