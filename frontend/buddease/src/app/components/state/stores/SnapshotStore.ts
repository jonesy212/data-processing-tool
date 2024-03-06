import { NotificationContextProps, NotificationType, NotificationTypeEnum, useNotification } from "@/app/components/support/NotificationContext";
import { makeAutoObservable } from "mobx";
import { useAuth } from "../../auth/AuthContext";
import { Data } from "../../models/data/Data";
import { Task } from "../../models/tasks/Task";
import NOTIFICATION_MESSAGES from "../../support/NotificationMessages";
import { showToast } from "../../models/display/ShowToast";
import { notificationStore } from "../../support/NotificationProvider";


const { notify } = useNotification()


interface SnapshotStoreConfig<T> {
  clearSnapshots: any;
  key: string;
  initialState: T;
  snapshots: (
    subscribers: (data: Data) => void,
    snapshot: Snapshot<Snapshot<Data>>[]
  ) => void;
  onSnapshot?: (snapshot: T) => void;
  snapshot?: () => void;
  initSnapshot: () => void;
  updateSnapshot: (snapshot: Snapshot<Data>) => void;
  takeSnapshot: (snapshot: T) => void;
  getSnapshot: (snapshot: string) => Promise<Snapshot<Data>>;
  getSnapshots: () => Snapshot<Snapshot<Data>>[];
  getAllSnapshots: (
    data: (data: Data) => void,
    snapshot: Snapshot<Snapshot<Data>>[]
  ) => Snapshot<Snapshot<Data>>[] | Snapshot<Snapshot<Data>>[];

  clearSnapshot: () => void;
  configureSnapshotStore: (snapshot: Snapshot<Data>) => void;
  // Updated method signatures
  takeSnapshotSuccess: (snapshot: Snapshot<Data>) => void;
  updateSnapshotFailure: (payload: { error: string }) => void;
  takeSnapshotsSuccess: (snapshots: Snapshot<Data>[]) => void;

  fetchSnapshot: (snapshotId: Snapshot<Data>) => void;
  // getLatestSnapshot: () => Snapshot<Data>;

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
  timestamp:  Date;
  data: T;
}

//todo update Implementation
const setNotificationMessage = (message: string) => {
  // Implementation of setNotificationMessage
  // Check if the notification context is available
  if (notificationStore && notificationStore.notify) {
    // Notify with the provided message
    notificationStore.notify(
      "privateSetNotificationMessageId",
      message,
      new Date(),
      NotificationTypeEnum.OperationSuccess
    );
  }

};











class SnapshotStore<T extends Snapshot<Data>> {
  key: string;
  state: T;
  onSnapshot?: (snapshot: T) => void;
  snapshot?: () => void;
  private snapshots: Snapshot<Snapshot<Data>>[] = [];
  private subscribers: ((data: Data) => void)[] = [];
  private readonly notify: (message: string, content: any, date: Date, type: NotificationType) => void;
  public configureSnapshotStore: (snapshot: SnapshotStoreConfig<SnapshotStore<Snapshot<Data>>>) => void;

  private setNotificationMessage(message: string, notificationStore: NotificationContextProps) {
    // Check if the notification context is available
    if (notificationStore && notificationStore.notify) {
      // Notify with the provided message
      notificationStore.notify(
        "privateSetNotificationMessageId",
        message,
        NOTIFICATION_MESSAGES.Notifications.NOTIFICATION_SENT,
        new Date,
        NotificationTypeEnum.OperationSuccess
      )
    } else {
      // If the notification context is not available, log an error
      console.error("Notification context is not available.");
    }
  }
  
  
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

  constructor(config: SnapshotStoreConfig<T>,
    notify: (message: string, content: any, date: Date, type: NotificationType) => void) {
    this.key = config.key;
    this.state = config.initialState;
    this.onSnapshot = config.onSnapshot;
    this.notify = notify;
    this.configureSnapshotStore = configureSnapshotStore
    // Bind 'this' explicitly
    makeAutoObservable(this);
  }

  takeSnapshot(data: T) {
    const timestamp = new Date;
    const snapshot: Snapshot<T> = {
      timestamp,
      data,
    };
    this.snapshots.push(snapshot);
    // Use this.notify instead of this.notify.notify
    this.notify(
      `Snapshot taken at ${new Date(timestamp)}.`,
      NOTIFICATION_MESSAGES.Logger.LOG_INFO_SUCCESS,
      new Date(),
     NotificationTypeEnum.OperationSuccess
    );
    
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

  getLatestSnapshot(): Snapshot<T> {
    // Return the latest snapshot's data property
    const latestSnapshot = this.snapshots[this.snapshots.length - 1];
    return {
      timestamp: latestSnapshot.timestamp,
      data: latestSnapshot.data as T, // Cast data to type T
    };
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
    timestamp: new Date,
    data: {} as Data,
  };
};

// Function to set a dynamic notification message
const setDynamicNotificationMessage = (message: string) => {
  setNotificationMessage(message);
};
const { state: authState } = useAuth();

// const snapshotStoreInstance = new SnapshotStore<Snapshot<Data>>({
//   key: "snapshots",
//   onSnapshot: handleSnapshot,
//   initialState: getDefaultState(),
//   initSnapshot: () => {
//     snapshotStoreInstance.createSnapshot(getDefaultState(), {
//       timestamp: Date.now(),
//       data: getDefaultState(),
//     });
//   },

//   takeSnapshot: (data: Snapshot<Data>) => {
//     snapshotStoreInstance.createSnapshot(data, {
//       timestamp: Date.now(),
//       data,
//     });
//   },

//   updateSnapshot: (newSnapshot: Snapshot<Data>) => {
//     snapshotStoreInstance.state = newSnapshot;
//     snapshotStoreInstance.notifySubscribers(newSnapshot.data);
//   },

//   updateSnapshotsSuccess: (snapshots: Snapshot<Data>[]) => {
//     snapshots.forEach(async (snapshot) => {
//       // Assuming snapshot.data is of type Snapshot<Snapshot<Data>>
//       const snapshotData = await snapshot.data; // Wait for snapshot.data to resolve
//       // Check if snapshotData is of type Snapshot<Snapshot<Data>>
//       if (snapshotData.data.timestamp) {
//         // Assuming snapshotData.data is of type Snapshot<Data>
//         snapshotStoreInstance.updateSnapshot(await snapshotData.data);
//       } else {
//         // Assuming snapshotData.data is of type Data
//         snapshotStoreInstance.updateSnapshot(await snapshotData.data);
//       }
//       // Check if snapshotData.data is of type Snapshot<Data>
//       snapshotStoreInstance.updateSnapshot(await snapshotData.data);
//     });
//   },

//   clearSnapshot: () => {},

//   configureSnapshotStore: (snapshot: Snapshot<Data>) => {
//     // Configure the snapshot store
//     // Example configuration:
//     // 1. Set up listeners
//     snapshotStoreInstance.initSnapshot(snapshot);
//     snapshotStoreInstance.onSnapshot = handleSnapshot;
//     // 2. Initialize default state
//     snapshotStoreInstance.updateSnapshot(getDefaultState());
//     // 3. Configure middleware

//     // 4. Connect to external services
//     // 5. Any other initialization or configuration steps
//   },

//   takeSnapshotSuccess: (snapshot: Snapshot<Data>) => {
//     snapshotStoreInstance.createSnapshot(snapshot, {
//       timestamp: Date.now(),
//       data: snapshot,
//     });
//   },

//   updateSnapshotFailure: (payload: { error: string }) => {
//     console.error(payload.error);
//   },

//   fetchSnapshot: (snapshotId: Snapshot<Data>) => {
//     snapshotStoreInstance.setSnapshot(snapshotId);
//   },

  

//   getSnapshot(): Promise<Snapshot<Data>> {
//     // Return the latest snapshot's data property
//     const snapshot = this.getLatestSnapshot();
//     return Promise.resolve(snapshot);
//   },

//   getSnapshots(): Snapshot<Snapshot<Data>>[] {
//     // Call the 'snapshots' function with empty subscribers and an empty snapshot array
//     const snaps = this.getSnapshots();
//     return snaps
//       .map((snapshot) => snapshot)
//       .filter((snapshot) => snapshot.data.timestamp);
//   },

//   getAllSnapshots(
//     data: (data: Data) => void,
//     snapshot: Snapshot<Snapshot<Data>>[]
//   ): Snapshot<Snapshot<Data>>[] {
//     // Return the snapshots directly
//     const snaps = this.getSnapshots();

//     return snaps;
//   },

//   takeSnapshotsSuccess: (snapshots: Snapshot<Data>[]) => {
//     const transformedSnapshots: Snapshot<Snapshot<Data>>[] = snapshots.map(
//       (snapshot) => ({
//         timestamp: snapshot.timestamp,
//         data: snapshot,
//       })
//     );
//     snapshotStoreInstance.setSnapshots(transformedSnapshots);
//     snapshotStoreInstance.notifySubscribers();
//   },

//   updateSnapshotSuccess: (snapshot: Snapshot<Data>[]) => {
//     const updatedSnapshots: Snapshot<Snapshot<Data>>[] = snapshot.map(
//       (snap) => ({
//         timestamp: Date.now(),
//         data: {
//           timestamp: snap.timestamp,
//           data: snap.data,
//         },
//       })
//     );

//     snapshotStoreInstance.setSnapshots(
//       updatedSnapshots.concat(snapshotStoreInstance.getSnapshots())
//     );
//     updatedSnapshots.forEach((snap: any) =>
//       snapshotStoreInstance.notifySubscribers(snap.data)
//     );
//   },

//   fetchSnapshotSuccess: async (snapshot: Snapshot<Data>[]) => {
//     const snapshotData: Snapshot<Data> | undefined = snapshot
//       .map((snap) => ({
//         timestamp: snap.timestamp,
//         data: snap.data,
//       }))
//       .find((snap) => snap.data.id === snapshot[0].data.id);
//     snapshotStoreInstance.setSnapshot(snapshotData ?? getDefaultState());
//   },

//   createSnapshotSuccess: async (snapshot: Snapshot<Data>[]) => {
//     // Access the data property of each snapshot object
//     const updatedSnapshots: Snapshot<Snapshot<Data>>[] = snapshot.map(
//       (singleSnapshot) => {
//         const data: Data = singleSnapshot.data;

//         // Create a new Snapshot<Snapshot<Data>> object using the timestamp and data
//         return {
//           timestamp: singleSnapshot.timestamp,
//           data: { timestamp: data.timestamp, data },
//         };
//       }
//     );

//     // Get the current snapshots using the getSnapshot method
//     const currentSnapshots = await snapshotStoreInstance.getSnapshot(snapshot[0]);

//     // Update the snapshots property using the updatedSnapshots and currentSnapshots
//     const mergedSnapshots = [...updatedSnapshots, ...currentSnapshots];

//     // Notify subscribers about the updated snapshots
//     snapshotStoreInstance.batchUpdateSnapshotsSuccess(mergedSnapshots);
//   },

//   createSnapshotFailure: (error: string) => {
//     console.error(error);
//   },

//   batchUpdateSnapshotsSuccess: (snapshotData: Snapshot<Data>[]) => {
//     const currentSnapshots = snapshotStoreInstance.getSnapshots(); // Retrieve current snapshots
//     const updatedSnapshots: Snapshot<Snapshot<Data>>[] = [
//       ...snapshotData.map((snapshot) => ({
//         timestamp: snapshot.timestamp,
//         data: snapshot,
//       })),
//       ...currentSnapshots,
//     ]; // Merge new snapshots with current ones
//     snapshotStoreInstance.setSnapshots(updatedSnapshots); // Update snapshots in the store

//     // Extract data from one of the snapshots in updatedSnapshots array
//     const updatedData: Data = updatedSnapshots[0].data.data;

//     // Notify subscribers with the updated data
//     snapshotStoreInstance.notifySubscribers(updatedData);
//   },

//   batchFetchSnapshotsRequest: async (snapshotData: Snapshot<Data>[]) => {
//     // Retrieve updated snapshots asynchronously from the store
//     const updatedSnapshots = await Promise.all(
//       snapshotData.map((snapshot) => snapshotStoreInstance.getSnapshot(snapshot))
//     );
//     // Flatten the array of arrays into a single array of snapshots
//     const flattenedSnapshots = updatedSnapshots.flat();
//     // Call batchUpdateSnapshotsSuccess with the updated snapshots
//     snapshotStoreInstance.batchUpdateSnapshotsSuccess(flattenedSnapshots);
//   },

//   batchFetchSnapshotsSuccess: (snapshotData: Snapshot<Data>[]) => {
//     // Call updateSnapshotsSuccess with the fetched snapshots
//     snapshotStoreInstance.updateSnapshotsSuccess(
//       snapshotData.map((snapshot) => ({
//         timestamp: snapshot.timestamp,
//         data: { timestamp: snapshot.data.timestamp, data: snapshot.data },
//       }))
//     );
//   },

//   batchFetchSnapshotsFailure: (payload: { error: string }) => {
//     console.error(payload.error);
//   },

//   batchUpdateSnapshotsFailure: ({ error }: { error: any }) => {
//     console.error("Batch update snapshots failure:", error);
//     setDynamicNotificationMessage(
//       NOTIFICATION_MESSAGES.Snapshot.UPDATING_SNAPSHOTS
//     );
//   },
//   *[Symbol.iterator]() {
//     for (const snapshot of this.snapshots) {
//       yield snapshot;
//     }
//   },

//   snapshots(
//     subscribers: (data: Data) => void,
//     snapshot: Snapshot<Snapshot<Data>>[]
//   ) {
//     // Clear existing snapshots
//     this.clearSnapshots;

//     // Iterate through the provided snapshots
//     snapshot.forEach((snapshotItem) => {
//       // Validate each snapshot
//       if (snapshotItem && snapshotItem.timestamp && snapshotItem.data) {
//         // Add the validated snapshot to the internal snapshots array
//         snapshotStoreInstance.validateSnapshot;
//       } else {
//         console.error("Invalid snapshot:", snapshotItem);
//       }
//     });

//     // Notify subscribers about the updated snapshots
//     this.notifySubscribers(subscribers);
//   },

//   notifySubscribers(subscribers: (data: Data) => void) {
//     // Iterate through the subscribers array
//     subscribers.forEach((subscriber: Subscriber) => {
//       // Call the subscriber function with the latest snapshot
//       subscriber(snapshotStoreInstance.getSnapshot());
//     });
//   },
//   clearSnapshots(): void {
//     // Clear the snapshots array
//     this.snapshots = [];
//   },
// });




const updateSnapshot = (snapshot: Snapshot<Data>) => {
  snapshotStoreInstance.setSnapshot(snapshot);
};


const takeSnapshot = (snapshot: any) => {};

const getSnapshot = async (snapshotId: string): Promise<Snapshot<Data>> => {
  // Implementation logic here
  const snapshot = await getSnapshot(snapshotId);
  return snapshot;
};

const getSnapshots = () => snapshotStoreInstance.getSnapshots();
const getAllSnapshots = () => snapshotStoreInstance.getAllSnapshots();

const clearSnapshot = (): void => {
  // Implementation logic here
  snapshotStoreInstance.clearSnapshot();
};

// Adjust the method signature to accept a SnapshotStoreConfig parameter
const configureSnapshotStore = (config: SnapshotStoreConfig<SnapshotStore<Snapshot<Data>>>): void => {
  // Implementation logic here
  snapshotStoreInstance.configureSnapshotStore(config);
};


const takeSnapshotSuccess = (snapshot: Snapshot<Data>): void => {
  // Assuming you have access to the snapshot store instance
  // You can perform actions based on the successful snapshot here
  console.log("Snapshot taken successfully:", snapshot);

  // Display a toast message
  showToast({ content: "Snapshot taken successfully" });

  // Notify with a message
  notify("Snapshot taken successfully");
};



const updateSnapshotFailure = (payload: { error: string }): void => {
  // Log the error message or handle it in any way necessary
  console.error("Update snapshot failed:", payload.error);

  // You can also display a notification to the user or perform any other actions
  // For example:
  showErrorMessage(payload.error);
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

const updateSnapshotsSuccess = (snapshots: Snapshot<Data>[]) => {
      snapshots.forEach(async (snapshot) => {
        // Assuming snapshot.data is of type Snapshot<Snapshot<Data>>
        const snapshotData = await snapshot.data; // Wait for snapshot.data to resolve
        // Check if snapshotData is of type Snapshot<Snapshot<Data>>
        if (snapshotData.data.timestamp) {
          // Assuming snapshotData.data is of type Snapshot<Data>
          snapshotStoreInstance.updateSnapshot(await snapshotData.data);
        } else {
          // Assuming snapshotData.data is of type Data
          snapshotStoreInstance.updateSnapshot(await snapshotData.data);
        }
        // Check if snapshotData.data is of type Snapshot<Data>
        snapshotStoreInstance.updateSnapshot(await snapshotData.data);
      });
    }

const fetchSnapshotSuccess = (snapshot: Snapshot<Data>[]): void => {
  // Implementation logic here
};

const createSnapshotSuccess = (snapshot: Snapshot<Data>[]): void => {
  // Implementation logic here
};

const createSnapshotFailure = (error: string): void => {
  // Implementation logic here
};

const setTasks = (updateFunction: (prevTasks: Task) => any) => {
  // Update tasks using the provided update function
  const updatedTasks = updateFunction(prevTasks);
  
  // Further logic to handle the updated tasks
};

const batchFetchSnapshotsRequest = (snapshotData: Snapshot<Data>[]): void => {
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

const batchUpdateSnapshotsSuccess = (snapshotData: Snapshot<Data>[]): void => {
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


const notifyFunction = (message: string, content: any, date: Date, type: NotificationType) => {
  // Implementation logic for sending notifications
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
    return snapshotStoreInstance.getSnapshots();
  },
};

const config = {
  ...snapshotStoreConfig,
  onSnapshot: handleSnapshot,
  // other properties as needed...
};

const snapshotStoreInstance = new SnapshotStore<Snapshot<Data>>(config, notifyFunction);
export const snapshotStore = {
  ...snapshotStoreInstance,
  async getSnapshot(): Promise<Snapshot<Data>> {
    // Return the latest snapshot's data property
    const latestSnapshot = snapshotStoreInstance.getLatestSnapshot();
    const snapshotData = latestSnapshot.data;
    return Promise.resolve({
      timestamp: latestSnapshot.timestamp,
      data: snapshotData.data,
    });
  },
}



export default SnapshotStore;
export type { Snapshot, SnapshotStoreConfig };
