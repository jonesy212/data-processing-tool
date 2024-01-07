// SnapshotStore.ts
import { makeAutoObservable } from "mobx";

export interface Snapshot<T> {
  [x: string]: any;
  timestamp: number;
  data: T;
  snapshot: T;
  snapshots: Snapshot<T>[];
  initSnapShot: (snapshot: T) => void;
  takeSnapShot: (data: T) => void;
  updateSnapshot: (snapshot: Snapshot<T>) => void;
}

class SnapshotStore<T> {
  onSnapshot(callback: (snapshotData: T) => void) {
    callback(this.snapshot);
  }
  snapshot: T;
  private snapshots: Snapshot<T>[] = [];

  constructor(initialSnapshot: T) {
    this.snapshot = initialSnapshot;
    makeAutoObservable(this);
  }

  initSnapShot(snapshot: T) {
    this.takeSnapshot(snapshot);
  }

  updateSnapshot(newSnapshot: T) {
    this.snapshot = newSnapshot;
  }

  takeSnapshot(data: T) {
    const timestamp = Date.now();
    this.snapshots.push({
      timestamp,
      data,
      snapshots: [],
      initSnapShot: function (snapshot: T): void {
        this.takeSnapshot(snapshot);
      },
      takeSnapShot: function (data: T): void {
        this.snapshot = data;
      },
      snapshot: {} as T,
      updateSnapshot: function (snapshot: Snapshot<T>): void {
        const currentSnapshot = snapshot;
        const previousSnapshot = this.snapshots[this.snapshots.length - 1];
        previousSnapshot.snapshots.push(currentSnapshot);
      },
    });
  }

  getSnapshots() {
    return this.snapshots;
  }

  clearSnapshots() {
    this.snapshots = [];
  }
}

export default SnapshotStore;
