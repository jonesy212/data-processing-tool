// SnapshotStore Context Type
import {
  BaseDataEntity,
  DefaultExcludedFields,
  DefaultMeta,
} from '@/app/config/BaseConfig';
import { Attachment } from '@/app/documents/attachment/Attachment';
import SnapshotStore from "@/app/snapshots/SnapshotStore";

export interface SnapshotStoreContextType<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {
  snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null;
  initializeStore: (options: any) => Promise<void>;
  resetStore: () => void;
  storeStatus: {
    isInitialized: boolean;
    isLoading: boolean;
    error: string | null;
  };
}

