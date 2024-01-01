// SnapshotStore.ts
import { makeAutoObservable } from "mobx";

export interface Snapshot<T> {
  timestamp: number;
  data: T;
}

class SnapshotStore<T> {
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
    this.snapshots.push({ timestamp, data });
  }

  getSnapshots() {
    return this.snapshots;
  }

  clearSnapshots() {
    this.snapshots = [];
  }
}

export default SnapshotStore;
