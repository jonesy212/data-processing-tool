// SnapshotStore.ts
import { makeAutoObservable } from "mobx";
import { useAuth } from "../../auth/AuthContext";
import { Data } from "../../models/data/Data";
import { Todo } from "../../todos/Todo";
import { UserData } from "../../users/User";

interface SnapshotStoreConfig<T> {
  [x: string]: any;
  key: string;
  initialState: T;
  onSnapshot?: (snapshot: T) => void;
  snapshot?: () => void;
  initSnapshot: () => void;
  updateSnapshot: (snapshot: T) => void;
  takeSnapshot: (data: T) => void; // Added this line
  // snapshots: () => Record<string, Todo[]>; // Correct the return type
  getSnapshots: (snapshots: Record<string, Record<string, Todo[]>>) => void;
  clearSnapshot: () => void;
}


const snapshotStoreConfig: SnapshotStoreConfig<Record<string, Data[]>> = {
  key: "todos",
  initialState: {},
  onSnapshot: (snapshot) => {
    console.log("Snapshot taken!", snapshot);
  },
  
  snapshot: () => {
    console.log("Snapshot taken!");
    const snapshotValues = Object.values(snapshotStore.state);
    const snapshotRecord: Record<string, Data[]> = {};
    snapshotValues.forEach((value: any) => {
      snapshotRecord[value] = [value];
    });
    snapshotStore.state = snapshotRecord;
  },

  initSnapshot: () => {
    const { state: authState } = useAuth();
    snapshotStore.initSnapShot(authState as unknown as Data);
  },

  updateSnapshot: (snapshot) => {
    snapshotStore.updateSnapshot(
      snapshotStore.getLatestSnapshot(snapshot as Snapshot<Record<string, Data[]>>)
    );
  },

  takeSnapshot: (snapshot) => {
    snapshotStore.takeSnapshot(snapshot as Snapshot<Record<string, Data[]>> & Data);
    snapshotStore.state = snapshot;
  },

  getSnapshot(snapshot: string): Record<string, Todo[]> {
    const { state } = useAuth();
    return this.state[snapshot];
  },

  getSnapshots(snapshots: Record<string, Record<string, Todo[]>>): Record<string, Todo[]>[] {
    return this.snapshots.filter((snapshot: Snapshot<Record<string, Todo[]>>) => {
      return Object.keys(snapshots).includes(snapshot.timestamp.toString());
        }).map((snapshot: Snapshot<Data>) => snapshot.snapshot);
  },

  clearSnapshot: () => {
    snapshotStore.clearSnapshots();
  },

  
};



export interface Snapshot<T> {
  [x: string]: any;
  timestamp: number;
  data: UserData | Data;
  snapshot: T;
  initSnapShot: (snapshot: T) => void;
  takeSnapShot: (data: T) => void;
  updateSnapshot: (snapshot: Snapshot<T>) => void;
}



class SnapshotStore<T> {
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

  initSnapShot(snapshot: Data) {
    this.takeSnapshot(snapshot);
  }

  updateSnapshot(newSnapshot: T) {
    this.state = newSnapshot;
    if (this.snapshot) {
      this.snapshot();
    }
  }

  takeSnapshot(data: Data) {
    const timestamp = Date.now();
    this.snapshots.push({
      timestamp,
      data,
      snapshots: [],
      initSnapShot: function (snapshot: T): void {
        this.takeSnapshot(snapshot);
      },
      // Remove the next line if `this.snapshot` is not used elsewhere
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

  fetchSnapshot(snapshot: Snapshot<T>): void {
    this.snapshots.push(snapshot);
  }

  getSnapshot(snapshot: string) {
    return this.snapshots.find((snap) => snap.id === snapshot);
  }

  getSnapshots(snapshot: string[]): Snapshot<T>[] {
    return snapshot.map((key) => {
      const snapshot = this.getSnapshot(key);
      if (snapshot) return snapshot;
      throw new Error("Snapshot not found");
    });
  }

  clearSnapshots() {
    this.snapshots = [];
  }

  getAllSnapshots() {
    return this.snapshots.map((snapshot) => snapshot.data);
  }

  getLatestSnapshot(snapshot: Snapshot<T>): T {
    return this.snapshots[this.snapshots.length - 1].snapshot;
  }

  takeLatestSnapshot(snapshot: T) {
    const { state: authState } = useAuth();

    this.snapshots = [
      {
        timestamp: Date.now(),
        data: authState as unknown as UserData | Data,
        snapshot,
        snapshots: [],
        initSnapShot: () => {
          const userData: UserData = {
            id: authState.user?.id || 0,
          };
          snapshotStore.initSnapShot(userData as UserData & Data);
        },
        takeSnapShot: (data: T) => {
          this.takeLatestSnapshot(data);
        },
        updateSnapshot(data: Snapshot<T>) {
          const existingSnapshot = this.getSnapshot(data.id);

          if (existingSnapshot) {
            existingSnapshot.snapshots.push(data);
          } else {
            this.snapshots.push(data);
          }
        },
      },
    ];
  }
}

const { state: authState } = useAuth();
const snapshotStore = new SnapshotStore<Record<string, Data[]>>({
  key: "todos",
  initialState: {},
  onSnapshot: (snapshot) => {
    console.log("Snapshot taken!", snapshot);
  },
  snapshot: () => {
    console.log("Snapshot taken!");
    const snapshotValues = Object.values(snapshotStore.state);
    const snapshotRecord: Record<string, Data[]> = {};
    snapshotValues.forEach((value: any) => {
      snapshotRecord[value] = [value];
    });
    snapshotStore.state = snapshotRecord;
  },
  initSnapshot: () => {
    snapshotStore.initSnapShot(authState as unknown as Data);
  },
  updateSnapshot: (snapshot) => {
    snapshotStore.updateSnapshot(
      snapshotStore.getLatestSnapshot(
        snapshot as Snapshot<Record<string, Data[]>>
      )
    );
  },
  takeSnapshot: (snapshot) => {
    snapshotStore.takeSnapshot(
      snapshot as Snapshot<Record<string, Data[]>> & Data
    );
    snapshotStore.state = snapshot;
  },

  getSnapshots: (snapshots: Record<string, Record<string, Data[]>>) => {
    return snapshots;
  },
  clearSnapshot: () => {
    snapshotStore.clearSnapshots();
  },
});

export default SnapshotStore;
export type { SnapshotStoreConfig };
