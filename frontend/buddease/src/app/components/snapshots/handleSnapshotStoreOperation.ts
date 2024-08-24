import { Data } from "../models/data/Data";
import { Snapshot } from "./LocalStorageSnapshotStore";
import { snapshot } from "./snapshot";
import { SnapshotOperation, SnapshotOperationType, SnapshotStoreActions } from "./SnapshotActions";
import SnapshotStore from "./SnapshotStore";

// Ensure T and K are imported or defined if necessary
const handleSnapshotStoreOperation = async <T extends Data, K extends Data>(
  snapshotId: string,
  snapshotStore: SnapshotStore<T, K>,
  snapshot: Snapshot<T, K>, 
  operation: SnapshotOperation,
  operationType: SnapshotOperationType,
  callback: (snapshotStore: SnapshotStore<T, K>) => void
): Promise<void> => {
  // Log the operation for debugging
  console.log("SnapshotStore operation handled:", snapshotStore, snapshotId);

  // Example logic to handle the snapshot store operation
  // You may want to update internal state, notify subscribers, etc.
  SnapshotStoreActions<T, K>().handleSnapshotStoreSuccess({
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
