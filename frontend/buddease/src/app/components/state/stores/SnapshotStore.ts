import { UserData } from "@/app/components/users/User";
import { makeAutoObservable } from "mobx";
import { useAuth } from "../../auth/AuthContext";
import { Data } from "../../models/data/Data";

interface SnapshotStoreConfig<T> {
  key: string;
  initialState: T;
  onSnapshot?: (snapshot: T) => void;
  snapshot?: () => void;
  initSnapshot: () => void;
  updateSnapshot: (snapshot: T) => void;
  takeSnapshot: (data: T) => void;
  getSnapshots: (snapshots: Record<string, T>) => void;
  clearSnapshot: () => void;
  [Symbol.iterator]: () => IterableIterator<[string, T[]]>;
}

interface Snapshot<T> {
  timestamp: number;
  data: UserData | Data;
  snapshot: T;
  snapshots: Snapshot<T>[];
  initSnapshot: (snapshot: T) => void;
  takeSnapshot: (data: T) => void;
  updateSnapshot: (snapshot: Snapshot<T>) => void;
}

class SnapshotStore<T extends UserData | Data> {
  key: string;
  state: T;
  onSnapshot?: (snapshot: T) => void;
  snapshot?: () => void;
  private snapshots: Snapshot<T>[] = [];

  constructor(config: SnapshotStoreConfig<T>) {
    this.key = config.key;
    this.state = config.initialState;
    this.onSnapshot = config.onSnapshot;
    this.snapshot = config.snapshot;
    makeAutoObservable(this);
  }

  takeSnapshot(data: T) {
    const timestamp = Date.now();
    const snapshot: Snapshot<T> = {
      // Create snapshot object
      timestamp,
      data,
      snapshot: {} as T,
      snapshots: this.snapshots, // Access 'snapshots' from class
      initSnapshot: function (snapshot: T): void {
        this.takeSnapshot(snapshot);
      },
      takeSnapshot: function (data: T): void {
        this.snapshot = data;
      },
      updateSnapshot: function (snapshot: Snapshot<T>): void {
        const currentSnapshot = snapshot;
        const previousSnapshot = this.snapshots[this.snapshots.length - 2];
        previousSnapshot.snapshot = currentSnapshot.snapshot; // Assign the 'snapshot' property of 'currentSnapshot'
      },
    };
    this.snapshots.push(snapshot); // Push snapshot to 'snapshots' array
  }

  initSnapshot(snapshot: T) {
    this.takeSnapshot(snapshot);
  }

  createSnapshot(data: T, snapshot: Snapshot<T>) {
    this.snapshots.push(snapshot);
    if (this.onSnapshot) {
      this.onSnapshot(data);
    }
  }

  updateSnapshot(newSnapshot: T) {
    this.state = newSnapshot;
    if (this.snapshot) {
      this.snapshot();
    }
  }

  fetchSnapshot(snapshot: Snapshot<T>): void {
    this.snapshots.push(snapshot);
  }

  getSnapshot(snapshot: string): T {
    const { state } = useAuth();
    return this.state;
  }

  getSnapshots(snapshots: Record<string, T>): Record<string, T> {
    return snapshots;
  }

  clearSnapshot() {
    this.snapshots = [];
  }

  getAllSnapshots() {
    return this.snapshots.map((snapshot) => snapshot.data);
  }

  getLatestSnapshot(): T {
    return this.snapshots[this.snapshots.length - 1].snapshot;
  }
}

const { state: authState } = useAuth();
const snapshotStore = new SnapshotStore<Data>({
  key: "todos",
  initialState: {} as Data,
  onSnapshot: (snapshot) => {
    console.log("Snapshot taken!", snapshot);
  },
  initSnapshot: () => {
    // Correct usage without parameters
    snapshotStore.takeSnapshot(snapshotStore.state);
  },
  updateSnapshot: (snapshot) => {
    snapshotStore.updateSnapshot(snapshot);
  },
  takeSnapshot: (snapshot) => {
    snapshotStore.takeSnapshot(snapshot);
  },
  getSnapshots: (snapshots) => {
    return snapshots;
  },
  clearSnapshot: () => {
    snapshotStore.clearSnapshot();
  },
  [Symbol.iterator]: function* () {
    // Placeholder implementation
    yield ["string", []]; // Example value
  },
});

export default SnapshotStore;
export type { Snapshot, SnapshotStoreConfig };
