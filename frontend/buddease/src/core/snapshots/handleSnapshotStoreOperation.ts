// handleSnapshotStoreOperation.ts
import type { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import type { Attachment } from '@/core/documents/attachment/Attachment';
import type { Snapshot } from '@/core/snapshots/Snapshot';
import type { SnapshotOperation, SnapshotOperationType } from "@/core/snapshots/index";
import SnapshotStore from "./SnapshotStore";

// Ensure T and K are imported or defined if necessary
const handleSnapshotStoreOperation = async <  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T>(
  snapshotId: string,
  snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, 
  operation: SnapshotOperation<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  operationType: SnapshotOperationType,
  callback: (snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void
): Promise<SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null> => {
  // Log the operation for debugging
  console.log("SnapshotStore operation handled:", snapshotStore, snapshotId);

  // Example logic to handle the snapshot store operation
  // You may want to update internal state, notify subscribers, etc.
  SnapshotStoreActions<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>().handleSnapshotStoreSuccess({
    snapshotStore,
    snapshotId,
    snapshot,
    operation,
    operationType
  });

  // Invoke the callback with the updated snapshot store
  callback(snapshotStore);
};

export default handleSnapshotStoreOperation;
