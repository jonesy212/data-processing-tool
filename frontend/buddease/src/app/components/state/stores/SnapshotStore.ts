// SnapshotStore.ts
import { makeAutoObservable } from "mobx";

export interface Snapshot<T> {
  timestamp: number;
  data: T;
}

class SnapshotStore<T> {
  private snapshots: Snapshot<T>[] = [];

  constructor() {
    makeAutoObservable(this);
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
