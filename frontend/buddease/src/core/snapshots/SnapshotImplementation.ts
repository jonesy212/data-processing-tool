SnapshotImplementation.ts
import { Data } from '@/core/models/data/Data';
import { generateSnapshotId } from "@/utils/snapshotUtils";
import type {  Snapshot } from '@/core/snapshots/Snapshot';

class SnapshotImplementation<T> {
  data: T | null;
  timestamp: Date;
  metadata: Record<string, any>;

  constructor(data: T | null, metadata: Record<string, any> = {}) {
    this.data = data;
    this.timestamp = new Date();
    this.metadata = metadata;
  }
}

 Example usage
const snapshotType = (snapshot: Snapshot<Data, Data>) => {
  const newSnapshot = snapshot;
  newSnapshot.id = snapshot.id || generateSnapshotId;
  // Other initialization logic...
  return newSnapshot;
};


export default SnapshotImplementation