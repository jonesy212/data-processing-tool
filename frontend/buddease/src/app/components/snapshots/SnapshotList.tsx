import { Snapshot } from '@/app/components/snapshots/SnapshotStore';
import { Data } from "../models/data/Data";

interface SnapshotItem {
  value: Snapshot<Data>
  label: string;
  // Define properties of a snapshot item
}

class SnapshotList {
  private snapshots: SnapshotItem[];

  constructor() {
    this.snapshots = [];
  }

  // Methods to manipulate snapshot items
  addSnapshot(snapshot: SnapshotItem) {
    this.snapshots.push(snapshot);
  }

  removeSnapshot(snapshotId: string) {
    // Find the index of the snapshot with the specified ID
    const index = this.snapshots.findIndex(snapshot => snapshot.value.id === snapshotId);
    
    // If the snapshot is found, remove it from the array
    if (index !== -1) {
      this.snapshots.splice(index, 1);
    }
  }
  

  // Implementing the Iterable interface
  [Symbol.iterator]() {
    let index = 0;
    const snapshots = this.snapshots;

    return {
      next(): IteratorResult<Snapshot<Data>> {
        if (index < snapshots.length) {
          const value = snapshots[index++];
          // Assuming `value` contains a `Snapshot<Data>` object
          return { value: value.value, done: false }; // Return `value.value` instead of `value`
        } else {
          return { value: undefined, done: true };
        }
      },
    };
  }

  toArray(): SnapshotItem[] {
    return this.snapshots;
  }
  // Other methods as needed
}

export default SnapshotList;
export type { SnapshotItem };

