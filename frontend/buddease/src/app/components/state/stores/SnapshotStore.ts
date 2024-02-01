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
  configureSnapshotStore: (snapshot: Snapshot<Data>) => void
  [Symbol.iterator]: () => IterableIterator<[string, T[]]>;
}

interface Snapshot<T> {
  timestamp: number;
  data: T
}

class SnapshotStore<T extends Snapshot<Data>> {
  key: string;
  state: T;
  onSnapshot?: (snapshot: T) => void;
  snapshot?: () => void;
  
  private snapshots: Snapshot<T>[] = [];
  private subscribers: ((data: T) => void)[] = [];

  constructor(config: SnapshotStoreConfig<T>) {
    this.key = config.key;
    this.state = config.initialState;
    this.onSnapshot = config.onSnapshot;
    makeAutoObservable(this);
  }

  takeSnapshot(data: T) {
    const timestamp = Date.now();
    const snapshot: Snapshot<T> = {
      timestamp,
      data,
    };
    this.snapshots.push(snapshot);
    this.notifySubscribers(data); // Notify subscribers when a new snapshot is taken

    if (this.onSnapshot) {
      this.onSnapshot(data);
    }
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

  getSnapshot(): T {
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
    return this.snapshots[this.snapshots.length - 1].data;
  }


  // Subscribe to snapshot events
  subscribe(callback: (data: T) => void) {
    this.subscribers.push(callback);
  }

  // Unsubscribe from snapshot events
  unsubscribe(callback: (data: T) => void) {
    const index = this.subscribers.indexOf(callback);
    if (index !== -1) {
      this.subscribers.splice(index, 1);
    }
  }

  // Notify subscribers with the latest snapshot data
  private notifySubscribers(data: T) {
    this.subscribers.forEach(callback => callback(data));
  }
 
}

const { state: authState } = useAuth();
const snapshotStore = new SnapshotStore<Snapshot<Data>>({
  key: "todos",
  initialState: {} as Snapshot<Data>,
  
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
   // Implement the configureSnapshotStore method
  configureSnapshotStore: (snapshot: Snapshot<Data>) => {
    // Configure the snapshot store
      // Example configuration:
    // 1. Set up listeners
    snapshotStore.initSnapshot(snapshot);
    snapshotStore.onSnapshot = handleSnapshot
    // 2. Initialize default state
    snapshotStore.updateSnapshot(getDefaultState());
    // 3. Configure middleware
  // 4. Connect to external services
  // 5. Any other initialization or configuration steps

   },
});


// Define the handleSnapshot function
const handleSnapshot = (snapshot: Snapshot<Data>) => {
  // Handle the snapshot event
  console.log("Snapshot event handled:", snapshot);
};

const getDefaultState = (): Snapshot<Data> => { 
  return {
    timestamp: Date.now(),
    data: {} as Data
  }
}

export default SnapshotStore;
export type { Snapshot, SnapshotStoreConfig };
