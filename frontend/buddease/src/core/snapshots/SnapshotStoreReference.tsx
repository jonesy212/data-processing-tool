// SnapshotStoreReference.tsx
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import { Attachment } from '@/core/documents/attachment/Attachment';
import SnapshotStore from '@/core/snapshots/SnapshotStore';


// Define a more abstract interface to represent snapshot stores
interface SnapshotStoreReference<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T 
> extends SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>{
  // Add the specific methods you need here for snapshot store references
}


export type { SnapshotStoreReference };
