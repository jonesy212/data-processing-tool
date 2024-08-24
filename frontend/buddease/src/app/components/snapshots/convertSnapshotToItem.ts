import { Data } from "../models/data/Data";
import { Snapshot } from "./LocalStorageSnapshotStore";
import { SnapshotItem } from "./SnapshotList";

// convertSnapshotToItem.ts
function convertSnapshotToItem<T extends Data, K extends Data>(
  snapshot: Snapshot<T, K>,
  id: string
): SnapshotItem<T, K> {
  return {
    id,
    user: snapshot.user,
    label: snapshot.label,
    data: snapshot.data ?? new Map<string, Snapshot<T, K>>(),
    metadata: snapshot.metadata,
    message: snapshot.message,
    value: snapshot.value,
    category: snapshot.category,
    timestamp: snapshot.timestamp,
    type: snapshot.type,
    status: snapshot.status,
  };
}
