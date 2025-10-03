import { Snapshot } from "@/app/snapshots";
import { SnapshotOperation, SnapshotOperationType } from "./SnapshotActions";
import SnapshotStore from "./SnapshotStore";

// Ensure T and K are imported or defined if necessary
const handleSnapshotStoreOperation = async <T extends BaseDataEntity, K extends T = T, Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>>(
  snapshotId: string,
  snapshotStore: SnapshotStore<T, K, Meta, ExcludedFields>,
  snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, 
  operation: SnapshotOperation<T, K, Meta, ExcludedFields>,
  operationType: SnapshotOperationType,
  callback: (snapshotStore: SnapshotStore<T, K, Meta, ExcludedFields>) => void
): Promise<SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null> => {
  // Log the operation for debugging
  console.log("SnapshotStore operation handled:", snapshotStore, snapshotId);

  // Example logic to handle the snapshot store operation
  // You may want to update internal state, notify subscribers, etc.
  SnapshotStoreActions<T, K, Meta, ExcludedFields>().handleSnapshotStoreSuccess({
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
