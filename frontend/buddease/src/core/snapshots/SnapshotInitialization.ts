// SnapshotInitialization.ts
import type { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import type { Attachment } from '@/core/documents/attachment/Attachment';
import type { InitializedConfig } from "@/core/snapshots/SnapshotStoreConfig";
import type { InitializedState } from "@/core/state/stores/DataStore";

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
