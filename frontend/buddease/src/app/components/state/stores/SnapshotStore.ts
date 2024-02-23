import { makeAutoObservable } from "mobx";
import { useAuth } from "../../auth/AuthContext";
import { Data } from "../../models/data/Data";
import NOTIFICATION_MESSAGES from "../../support/NotificationMessages";

interface SnapshotStoreConfig<T> {
  clearSnapshots: any;
  key: string;
  initialState: T;
  snapshots: (subscribers: (data: Data) => void, snapshot: Snapshot<Snapshot<Data>>[]) => void;
  onSnapshot?: (snapshot: T) => void;
  snapshot?: () => void;
  initSnapshot: () => void;
  updateSnapshot: (snapshot: Snapshot<Data>) => void;
  takeSnapshot: (snapshot: T) => void;
  getSnapshot: (snapshot: string) => Promise<Snapshot<Data>>
  getSnapshots: () => Snapshot<Snapshot<Data>>[]; 
  getAllSnapshots: (data: (data: Data) => void, snapshot: Snapshot<Snapshot<Data>>[]) => Snapshot<Snapshot<Data>>[] | Snapshot<Snapshot<Data>>[];

  clearSnapshot: () => void;
  configureSnapshotStore: (snapshot: Snapshot<Data>) => void;
  // Updated method signatures
  takeSnapshotSuccess: (snapshot: Snapshot<Data>) => void;
  updateSnapshotFailure: (payload: { error: string }) => void;
  takeSnapshotsSuccess: (snapshots: Snapshot<Data>[]) => void;

  fetchSnapshot: (snapshotId: Snapshot<Data>) => void;
  getLatestSnapshot: () => Snapshot<Data>;


  updateSnapshotSuccess: (snapshot: Snapshot<Data>[]) => void;
  updateSnapshotsSuccess: (snapshots: Snapshot<Data>[]) => void;
  fetchSnapshotSuccess: (snapshot: Snapshot<Data>[]) => void;

  createSnapshotSuccess: (snapshot: Snapshot<Data>[]) => void;
  createSnapshotFailure: (error: string) => void;
  //BATCH METHODS
  batchUpdateSnapshotsSuccess: (snapshotData: Snapshot<Data>[]) => void; // Updated type
  batchFetchSnapshotsRequest: (snapshotData: Snapshot<Data>[]) => void; // Updated type
  batchFetchSnapshotsSuccess: (snapshotData: Snapshot<Data>[]) => void; // Updated type
  batchFetchSnapshotsFailure: (payload: { error: string }) => void;
  batchUpdateSnapshotsFailure: (payload: { error: string }) => void;
  notifySubscribers: (subscribers: (data: Data) => void) => void;
  [Symbol.iterator]: () => IterableIterator<Snapshot<T>>;
}

interface Snapshot<T> {
  timestamp: number;
  data: T;
}

//todo update Implementation
const setNotificationMessage = (message: string) => {
  // Implementation of setNotificationMessage
};

class SnapshotStore<T extends Snapshot<Data>> {
  key: string;
  state: T;
  onSnapshot?: (snapshot: T) => void;
  snapshot?: () => void;
  private snapshots: Snapshot<Snapshot<Data>>[] = [];
  private subscribers: ((data: Data) => void)[] = [];

  public setSnapshot(newSnapshot: T) {
    this.state = newSnapshot;
  }


  public setSnapshots(newSnapshots: Snapshot<Snapshot<Data>>[]) {
    this.snapshots = newSnapshots as Snapshot<T>[];
  }

  public notifySubscribers(data?: Data) {
    if (data !== undefined) {
      this.subscribers.forEach((callback) => callback(data));
    }
  }


  validateSnapshot(data: Data) {
    if (data.timestamp) {
      return true;
    }
    return false;
  }
  constructor(config: SnapshotStoreConfig<T>) {
    this.key = config.key;
    this.state = config.initialState;
    this.onSnapshot = config.onSnapshot;
    
    // Bind 'this' explicitly
    makeAutoObservable(this);
  }

  takeSnapshot(data: T) {
    const timestamp = Date.now();
    const snapshot: Snapshot<T> = {
      timestamp,
      data,
    };
    this.snapshots.push(snapshot);
    this.notifySubscribers(data.data);

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
  }

  // Updated to use setSnapshot internally
  fetchSnapshot(snapshot: T): void {
    this.setSnapshot(snapshot);
  }

  async getSnapshot(
    snapshot: Snapshot<Data>
  ): Promise<Snapshot<Snapshot<Data>>[]> {
    const foundSnapshot = this.snapshots.find(
      async (s) => s.data === (await snapshot.data)
    );
    return foundSnapshot ? [foundSnapshot] : [];
  }

  getSnapshots(): Snapshot<Snapshot<Data>>[] {
    // Adjusted return type
    return this.snapshots; // Assuming this.snapshots is of type Snapshot<Snapshot<Data>>[]
  }

  updateSnapshotSuccess(snapshot: Snapshot<T>) {
    const { state } = useAuth();
    this.state = snapshot.data;
    return this.state;
  }

  clearSnapshot() {
    this.snapshots = [];
  }

  getAllSnapshots(): Snapshot<Snapshot<Data>>[] {
    // Return the snapshots directly
    return this.snapshots;
  }

  getLatestSnapshot(): T {
    // Return the latest snapshot's data property
    return this.snapshots[this.snapshots.length - 1].data as T;
  }

  // Subscribe to snapshot events
  subscribe(callback: (data: Data) => void) {
    this.subscribers.push(callback);
  }

  // Unsubscribe from snapshot events
  unsubscribe(callback: (data: Data) => void) {
    const index = this.subscribers.indexOf(callback);
    if (index !== -1) {
      this.subscribers.splice(index, 1);
    }
  }

  batchUpdateSnapshotsSuccess(snapshotData: Snapshot<T>[]) {
    // Update the snapshots
    this.snapshots = snapshotData;
    this.notifySubscribers();
  }

  updateSnapshotsSuccess(snapshot: Snapshot<T>[]) {
    // Update the snapshots
    this.snapshots = snapshot;
    this.notifySubscribers();
  }
}

// Define the handleSnapshot function
const handleSnapshot = (snapshot: Snapshot<Data>) => {
  // Handle the snapshot event
  console.log("Snapshot event handled:", snapshot);
};

const getDefaultState = (): Snapshot<Data> => {
  return {
    timestamp: Date.now(),
    data: {} as Data,
  };
};

// Function to set a dynamic notification message
const setDynamicNotificationMessage = (message: string) => {
  setNotificationMessage(message);
};
const { state: authState } = useAuth();
const snapshotStore = new SnapshotStore<Snapshot<Data>>({
  key: "snapshots",
  onSnapshot: handleSnapshot,
  initialState: getDefaultState(),
  initSnapshot: () => {
    snapshotStore.createSnapshot(getDefaultState(), {
      timestamp: Date.now(),
      data: getDefaultState(),
    });
  },

  takeSnapshot: (data: Snapshot<Data>) => {
    snapshotStore.createSnapshot(data, {
      timestamp: Date.now(),
      data,
    });
  },

  updateSnapshot: (newSnapshot: Snapshot<Data>) => {
    snapshotStore.state = newSnapshot;
    snapshotStore.notifySubscribers(newSnapshot.data);
  },

  updateSnapshotsSuccess: (snapshots: Snapshot<Data>[]) => {
    snapshots.forEach(async (snapshot) => {
      // Assuming snapshot.data is of type Snapshot<Snapshot<Data>>
      const snapshotData = await snapshot.data; // Wait for snapshot.data to resolve
      // Check if snapshotData is of type Snapshot<Snapshot<Data>>
      if (snapshotData.data.timestamp) {
        // Assuming snapshotData.data is of type Snapshot<Data>
        snapshotStore.updateSnapshot(await snapshotData.data);
      } else {
        // Assuming snapshotData.data is of type Data
        snapshotStore.updateSnapshot(await snapshotData.data);
      }
      // Check if snapshotData.data is of type Snapshot<Data>
      snapshotStore.updateSnapshot(await snapshotData.data);
    });
  },

  clearSnapshot: () => {},

  configureSnapshotStore: (snapshot: Snapshot<Data>) => {
    // Configure the snapshot store
    // Example configuration:
    // 1. Set up listeners
    snapshotStore.initSnapshot(snapshot);
    snapshotStore.onSnapshot = handleSnapshot;
    // 2. Initialize default state
    snapshotStore.updateSnapshot(getDefaultState());
    // 3. Configure middleware

    // 4. Connect to external services
    // 5. Any other initialization or configuration steps
  },

  takeSnapshotSuccess: (snapshot: Snapshot<Data>) => {
    snapshotStore.createSnapshot(snapshot, {
      timestamp: Date.now(),
      data: snapshot,
    });
  },

  updateSnapshotFailure: (payload: { error: string }) => {
    console.error(payload.error);
  },

  fetchSnapshot: (snapshotId: Snapshot<Data>) => {
    snapshotStore.setSnapshot(snapshotId);
  },

  
  getLatestSnapshot(): Snapshot<Data> { 
    // Return the latest snapshot's data property
    const snapshot = this.getLatestSnapshot();
    return snapshot;
  },

  getSnapshot(): Promise<Snapshot<Data> >{ 
    // Return the latest snapshot's data property
    const snapshot = this.getLatestSnapshot();
    return Promise.resolve(snapshot);
  },
  
  getSnapshots(): Snapshot<Snapshot<Data>>[] {
    // Call the 'snapshots' function with empty subscribers and an empty snapshot array
    const snaps = this.getSnapshots();
    return snaps.map(snapshot => snapshot ).filter(snapshot => snapshot.data.timestamp);
  },

  getAllSnapshots(data: (data: Data) => void, snapshot: Snapshot<Snapshot<Data>>[]): Snapshot<Snapshot<Data>>[] {
    // Return the snapshots directly
    const snaps = this.getSnapshots();

    return snaps;
  },

  takeSnapshotsSuccess: (snapshots: Snapshot<Data>[]) => {
    const transformedSnapshots: Snapshot<Snapshot<Data>>[] = snapshots.map(
      (snapshot) => ({
        timestamp: snapshot.timestamp,
        data: snapshot,
      })
    );
    snapshotStore.setSnapshots(transformedSnapshots);
    snapshotStore.notifySubscribers();
  },

  updateSnapshotSuccess: (snapshot: Snapshot<Data>[]) => {
    const updatedSnapshots: Snapshot<Snapshot<Data>>[] = snapshot.map(
      (snap) => ({
        timestamp: Date.now(),
        data: {
          timestamp: snap.timestamp,
          data: snap.data,
        },
      })
    );

    snapshotStore.setSnapshots(
      updatedSnapshots.concat(snapshotStore.getSnapshots())
    );
    updatedSnapshots.forEach((snap: any) =>
      snapshotStore.notifySubscribers(snap.data)
    );
  },

  fetchSnapshotSuccess: async (snapshot: Snapshot<Data>[]) => {
    const snapshotData: Snapshot<Data> | undefined = snapshot
      .map((snap) => ({
        timestamp: snap.timestamp,
        data: snap.data,
      }))
      .find((snap) => snap.data.id === snapshot[0].data.id);
    snapshotStore.setSnapshot(snapshotData ?? getDefaultState());
  },

  createSnapshotSuccess: async (snapshot: Snapshot<Data>[]) => {
    // Access the data property of each snapshot object
    const updatedSnapshots: Snapshot<Snapshot<Data>>[] = snapshot.map(
      (singleSnapshot) => {
        const data: Data = singleSnapshot.data;

        // Create a new Snapshot<Snapshot<Data>> object using the timestamp and data
        return {
          timestamp: singleSnapshot.timestamp,
          data: { timestamp: data.timestamp, data },
        };
      }
    );

    // Get the current snapshots using the getSnapshot method
    const currentSnapshots = await snapshotStore.getSnapshot(snapshot[0]);

    // Update the snapshots property using the updatedSnapshots and currentSnapshots
    const mergedSnapshots = [...updatedSnapshots, ...currentSnapshots];

    // Notify subscribers about the updated snapshots
    snapshotStore.batchUpdateSnapshotsSuccess(mergedSnapshots);
  },

  createSnapshotFailure: (error: string) => {
    console.error(error);
  },

  batchUpdateSnapshotsSuccess: (snapshotData: Snapshot<Data>[]) => {
    const currentSnapshots = snapshotStore.getSnapshots(); // Retrieve current snapshots
    const updatedSnapshots: Snapshot<Snapshot<Data>>[] = [
      ...snapshotData.map((snapshot) => ({
        timestamp: snapshot.timestamp,
        data: snapshot,
      })),
      ...currentSnapshots,
    ]; // Merge new snapshots with current ones
    snapshotStore.setSnapshots(updatedSnapshots); // Update snapshots in the store

    // Extract data from one of the snapshots in updatedSnapshots array
    const updatedData: Data = updatedSnapshots[0].data.data;

    // Notify subscribers with the updated data
    snapshotStore.notifySubscribers(updatedData);
  },

  batchFetchSnapshotsRequest: async (snapshotData: Snapshot<Data>[]) => {
    // Retrieve updated snapshots asynchronously from the store
    const updatedSnapshots = await Promise.all(
      snapshotData.map((snapshot) => snapshotStore.getSnapshot(snapshot))
    );
    // Flatten the array of arrays into a single array of snapshots
    const flattenedSnapshots = updatedSnapshots.flat();
    // Call batchUpdateSnapshotsSuccess with the updated snapshots
    snapshotStore.batchUpdateSnapshotsSuccess(flattenedSnapshots);
  },

  batchFetchSnapshotsSuccess: (snapshotData: Snapshot<Data>[]) => {
    // Call updateSnapshotsSuccess with the fetched snapshots
    snapshotStore.updateSnapshotsSuccess(
      snapshotData.map((snapshot) => ({
        timestamp: snapshot.timestamp,
        data: { timestamp: snapshot.data.timestamp, data: snapshot.data },
      }))
    );
  },

  batchFetchSnapshotsFailure: (payload: { error: string }) => {
    console.error(payload.error);
  },

  batchUpdateSnapshotsFailure: ({ error }: { error: any }) => {
    console.error("Batch update snapshots failure:", error);
    setDynamicNotificationMessage(
      NOTIFICATION_MESSAGES.Snapshot.UPDATING_SNAPSHOTS
    );
  },
  [Symbol.iterator]: function* () {
   // Iterate through the snapshots array
    for (const snapshot of this.getSnapshots()) {
      // Yield each snapshot
      yield snapshot;
    }
  },

  snapshots(subscribers: (data: Data) => void, snapshot: Snapshot<Snapshot<Data>>[]) {
    // Clear existing snapshots
    this.clearSnapshots
    
    // Iterate through the provided snapshots
    snapshot.forEach((snapshotItem) => {
      // Validate each snapshot
      if (snapshotItem && snapshotItem.timestamp && snapshotItem.data) {
        // Add the validated snapshot to the internal snapshots array
        snapshotStore.validateSnapshot
      } else {
        console.error('Invalid snapshot:', snapshotItem);
      }
    });
    
    // Notify subscribers about the updated snapshots
    this.notifySubscribers(subscribers);
  },

  notifySubscribers(subscribers: (data: Data) => void) { 
    // Iterate through the subscribers array
    subscribers.forEach((subscriber: Subsc) => {
      // Call the subscriber function with the latest snapshot
      subscriber(snapshotStore.getSnapshot());
    });
  },
  clearSnapshots(): void {
    // Clear the snapshots array
    this.snapshots = [];
  }

});
















const getSnapshot =  async (snapshotId: string): Promise<Snapshot<Data>> => { 
  // Implementation logic here
  const snapshot = await getSnapshot(snapshotId);
  return snapshot
}

const getSnapshots = () => snapshotStore.getSnapshots();
const getAllSnapshots = () => snapshotStore.getAllSnapshots();


const clearSnapshot = (): void => {
  // Implementation logic here
  snapshotStore.clearSnapshot()
};

const configureSnapshotStore = (snapshot: Snapshot<Data>): void => {
  // Implementation logic here
  snapshotStore.configureSnapshotStore(snapshot)
};

const takeSnapshotSuccess = (snapshot: Snapshot<Data>): void => {
  // Implementation logic here
};

const updateSnapshotFailure = (payload: { error: string }): void => {
  // Implementation logic here
};



const takeSnapshotsSuccess = (snapshots: Snapshot<Data>[]): void => {
  // Implementation logic here
};

const fetchSnapshot = (snapshotId: Snapshot<Data>): void => {
  // Implementation logic here
};

const updateSnapshotSuccess = (snapshot: Snapshot<Data>[]): void => {
  // Implementation logic here
};

const updateSnapshotsSuccess = (snapshots: Snapshot<Data>[]): void => {
  // Implementation logic here
};

const fetchSnapshotSuccess = (snapshot: Snapshot<Data>[]): void => {
  // Implementation logic here
};

const createSnapshotSuccess = (snapshot: Snapshot<Data>[]): void => {
  // Implementation logic here
};

const createSnapshotFailure = (error: string): void => {
  // Implementation logic here
};




const batchFetchSnapshotsRequest = (snapshotData: Snapshot<Data>[]
): void => {
  const snapshots = Object.values(snapshotData);

  snapshots.forEach(async (snapshot) => {
    const taskId = Object.keys(snapshot)[0];
    const tasks = Object.values(snapshot)[0];

    setTasks((prevTasks) => {
      return {
        ...prevTasks,
        [taskId]: [...(prevTasks[taskId] || []), ...tasks],
      };
    });
  });
};


const batchUpdateSnapshotsSuccess = (
  snapshotData: Snapshot<Data>[]
): void => {
  // Implementation logic here
};

const batchFetchSnapshotsSuccess = (snapshotData: Snapshot<Data>[]): void => {
  // Implementation logic here
};

const batchFetchSnapshotsFailure = (payload: { error: string }): void => {
  // Implementation logic here
};

const batchUpdateSnapshotsFailure = (payload: { error: string }): void => {
  // Implementation logic here
};

const notifySubscribers = (subscribers: (data: Data) => void): void => {
  // Implementation logic here
};

const snapshotStoreConfig: SnapshotStoreConfig<Snapshot<Data>> = {
  key: "your_key",
  clearSnapshots: undefined,
  initialState: getDefaultState(),

  snapshots: function (
    subscribers: (data: Data) => void,
    snapshot: Snapshot<Snapshot<Data>>[]
  ): void {
    snapshot.forEach((snapshot) => {
      subscribers(snapshot.data.data);
    });
  },

  initSnapshot,
  updateSnapshot,
  takeSnapshot,
  getSnapshot,
  getSnapshots,
  getAllSnapshots,
  clearSnapshot,
  configureSnapshotStore,
  takeSnapshotSuccess,
  updateSnapshotFailure,
  takeSnapshotsSuccess,
  fetchSnapshot,
  updateSnapshotSuccess,
  updateSnapshotsSuccess,
  fetchSnapshotSuccess,
  createSnapshotSuccess,
  createSnapshotFailure,
  batchUpdateSnapshotsSuccess,
  batchFetchSnapshotsRequest,
  batchFetchSnapshotsSuccess,
  batchFetchSnapshotsFailure,
  batchUpdateSnapshotsFailure,
  notifySubscribers,
  [Symbol.iterator]: function* () {
    return snapshotStore.getSnapshots()
   }
};



export default SnapshotStore;
export type { Snapshot, SnapshotStoreConfig };
