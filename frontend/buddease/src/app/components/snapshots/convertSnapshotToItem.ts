import { Data } from "../models/data/Data";
import { Snapshot } from "./LocalStorageSnapshotStore";
import { SnapshotItem } from "./SnapshotList";

// convertSnapshotToItem.ts
function convertSnapshotToItem<T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T>(
  snapshot: Snapshot<T, Meta, K>,
  id: string
): SnapshotItem<T, Meta, K> {
  return {
    id,
    user: snapshot.user,
    label: snapshot.label,
    data: snapshot.data ?? new Map<string, Snapshot<T, Meta, K>>(),
    metadata: snapshot.metadata,
    message: snapshot.message,
    value: snapshot.value,
    category: snapshot.category,
    timestamp: snapshot.timestamp,
    type: snapshot.type,
    status: snapshot.status,
  };
}
