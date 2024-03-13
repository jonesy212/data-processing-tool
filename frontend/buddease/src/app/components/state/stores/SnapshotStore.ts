import {
  NotificationContextProps,
  NotificationType,
  NotificationTypeEnum,
  useNotification,
} from "@/app/components/support/NotificationContext";
import { Message } from "@/app/generators/GenerateChatInterfaces";
import { makeAutoObservable } from "mobx";
import { useAuth } from "../../auth/AuthContext";
import { Data } from "../../models/data/Data";
import { showToast } from "../../models/display/ShowToast";
import { Task } from "../../models/tasks/Task";
import NOTIFICATION_MESSAGES from "../../support/NotificationMessages";
import { notificationStore } from "../../support/NotificationProvider";

const { notify } = useNotification();

interface SnapshotStoreConfig<T> {
  clearSnapshots: any;
  key: string;
  initialState: T;
  // Adjust the signature of snapshots to match the SnapshotStore class
  snapshots: { snapshot: Snapshot<Snapshot<Data>>[]; }[]

  
  onSnapshot?: (snapshot: SnapshotStore<Snapshot<Data>>) => void;
  snapshot?: () => void;
  initSnapshot: () => void;
  updateSnapshot: (snapshot: Snapshot<Data>) => void;
  takeSnapshot: (snapshot: SnapshotStore<Snapshot<Data>>) => void
  getSnapshot: (snapshot: Snapshot<Data>) => Promise<Snapshot<Snapshot<Data>>[]> 
  getSnapshots: (
    subscribers: (data: Data) => void,
    snapshots: Snapshot<Snapshot<Data>>[]
  ) => Promise<Snapshot<Snapshot<Data>>[]>;
   


  getAllSnapshots: (
    data: (
      subscribers: Snapshot<Snapshot<Data>>[],
      snapshots: Snapshot<Snapshot<Data>>[]) => Snapshot<Snapshot<Data>>[],    
  ) => Snapshot<Snapshot<Data>>[] | Snapshot<Snapshot<Data>>[];

  clearSnapshot: () => void;
  configureSnapshotStore: (snapshot: SnapshotStoreConfig<SnapshotStore<Snapshot<Data>>>)=> void
  // Updated method signatures
  takeSnapshotSuccess: (snapshot: Snapshot<Data>) => void;
  updateSnapshotFailure: (payload: { error: string }) => void;
  takeSnapshotsSuccess: (snapshots: Snapshot<Data>[]) => void;

  fetchSnapshot: (snapshotId: Snapshot<Data>) => void;
  updateSnapshotSuccess: (snapshot: SnapshotStore<Snapshot<Data>>) => void;
  updateSnapshotsSuccess: (snapshotData: (subscribers: Snapshot<Snapshot<Data>>[], snapshot: Snapshot<Snapshot<Data>>[]) => { snapshot: Snapshot<Snapshot<Data>>[]; }) => void;
  fetchSnapshotSuccess: (snapshotData: (subscribers: Snapshot<Snapshot<Data>>[], snapshot: Snapshot<Snapshot<Data>>[]) => { snapshot: Snapshot<Snapshot<Data>>[]; }) => void;

  createSnapshotSuccess:  (subscribers: Snapshot<Snapshot<Data>>[]) => void
  createSnapshotFailure: (error: Error) => void
  //BATCH METHODS
  batchTakeSnapshots: (snapshotData: (subscribers: Snapshot<Snapshot<Data>>[], snapshot: Snapshot<Snapshot<Data>>[]) => { snapshot: Snapshot<Snapshot<Data>>[]; }) => void;
  
  batchUpdateSnapshots: (snapshotData: (subscribers: Snapshot<Snapshot<Data>>[], snapshot: Snapshot<Snapshot<Data>>[]) => { snapshot: Snapshot<Snapshot<Data>>[]; }) => void;
  batchUpdateSnapshotsSuccess: (snapshotData: (subscribers: Snapshot<Snapshot<Data>>[], snapshot: Snapshot<Snapshot<Data>>[]) => { snapshot: Snapshot<Snapshot<Data>>[]; }) => void
  

  batchFetchSnapshotsRequest: (snapshotData: (subscribers: Snapshot<Snapshot<Data>>[], snapshot: Snapshot<Snapshot<Data>>[]) => { snapshot: Snapshot<Snapshot<Data>>[]; }) => void
  batchFetchSnapshotsSuccess: (snapshotData: (subscribers: Snapshot<Snapshot<Data>>[], snapshot: Snapshot<Snapshot<Data>>[]) => Snapshot<Snapshot<Data>>[]) => void
  batchFetchSnapshotsFailure: (payload: { error: Error }) => void;
  batchUpdateSnapshotsFailure: (payload: { error: Error; }) => void
  notifySubscribers: (subscribers: Snapshot<Snapshot<Data>>[]) => { snapshot: { snapshot: Snapshot<Snapshot<Data>>[]; }[]; }
  [Symbol.iterator]: () => IterableIterator<Snapshot<T>>;
  notify: (message: string, content: any, date: Date, type: NotificationType) => void;
}


interface Snapshot<T> {
  id?: string
  timestamp: Date;
  data: T;
}


type SubscriberFunction = (data: Snapshot<Data> | Data) => void;

//todo update Implementation
const setNotificationMessage = (message: string) => {
  // Implementation of setNotificationMessage
  // Check if the notification context is available
  if (notificationStore && notificationStore.notify) {
    // Notify with the provided message
    notificationStore.notify(
      "privateSetNotificationMessageSuccess",
      message,
      new Date(),
      NotificationTypeEnum.OperationSuccess
    );
  }
};

class SnapshotStore<T extends Snapshot<Data>> {
  key: string;
  state: T;
  onSnapshot?: (snapshot: SnapshotStore<Snapshot<Data>>) => void; // Adjust the parameter type
  snapshot?: () => void;
  timestamp?: Date;

  private snapshots: { snapshot: Snapshot<Snapshot<Data>>[] }[] = [];

  // Change the type of 'snapshots' property to an array of Snapshot<Snapshot<Data>>
  //  private snapshots: Snapshot<Snapshot<Data>>[] = [];

  private subscribers: Snapshot<Snapshot<Data>>[] = [];

  private readonly notify: (
    message: string,
    content: any,
    date: Date,
    type: NotificationType
  ) => void;

 
  public takeSnapshotsSuccess: (snapshots: Snapshot<Data>[]) => void;
  public updateSnapshotFailure: (payload: { error: string }) => void;
  public takeSnapshotSuccess: (snapshot: Snapshot<Data>) => void;
  public configureSnapshotStore: (
    snapshot: SnapshotStoreConfig<SnapshotStore<Snapshot<Data>>>
  ) => void;

  private setNotificationMessage(
    message: string,
    notificationStore: NotificationContextProps
  ) {
    // Check if the notification context is available
    if (notificationStore && notificationStore.notify) {
      // Notify with the provided message
      notificationStore.notify(
        "privateSetNotificationMessageId",
        message,
        NOTIFICATION_MESSAGES.Notifications.NOTIFICATION_SENT,
        new Date(),
        NotificationTypeEnum.OperationSuccess
      );
    } else {
      // If the notification context is not available, log an error
      console.error("Notification context is not available.");
    }
  }

  public setSnapshot(newSnapshot: T) {
    this.state = newSnapshot;
  }

    public setSnapshots(
    newSnapshots: {
      snapshot: Snapshot<Snapshot<Data>>[];
    }[]
  ) {
    this.snapshots = newSnapshots;
  }

  
  

  public notifySubscribers(subscribers: Snapshot<Snapshot<Data>>[]) {
    // Utilize the 'subscribers' parameter
    // For example, you can log it to indicate it's being used
    console.log("Subscribers:", subscribers);
    // Return the snapshot array within an object
    return {
      snapshot: this.snapshots,
    };
  }

  validateSnapshot(data: Data) {
    if (data.timestamp) {
      return true;
    }
    return false;
  }

  // config: SnapshotStoreConfig<SnapshotStore<Snapshot<Data>>> = {} as SnapshotStoreConfig<SnapshotStore<Snapshot<Data>>>;
  constructor(
    config: SnapshotStoreConfig<Snapshot<Data>>,
    notify: (
      message: string,
      content: any,
      date: Date,
      type: NotificationType
    ) => void
  ) {
    this.key = config.key;
    this.state = config.initialState as T; // Explicitly cast initialState to type T
    this.onSnapshot = config.onSnapshot;
    this.notify = notify;
    this.takeSnapshotsSuccess = config.takeSnapshotsSuccess;
    this.updateSnapshotFailure = config.updateSnapshotFailure;
    this.takeSnapshotSuccess = config.takeSnapshotSuccess;
    this.configureSnapshotStore = (snapshotConfig: SnapshotStoreConfig<SnapshotStore<Snapshot<Data>>>) => {
      snapshotConfig.clearSnapshot(); // Call clearSnapshot method instead of checking its existence
      snapshotConfig.initSnapshot(); // Call initSnapshot method instead of checking its existence
      this.key = snapshotConfig.key;
      this.state = config.initialState as T; // Explicitly cast initialState to type T
      this.onSnapshot = snapshotConfig.onSnapshot;
      this.snapshots = snapshotConfig.snapshots;
      this.configureSnapshotStore = snapshotConfig.configureSnapshotStore;
      this.takeSnapshot = snapshotConfig.takeSnapshot;
      this.getSnapshot = snapshotConfig.getSnapshot;
      this.getSnapshots = snapshotConfig.getSnapshots;
      this.getAllSnapshots = snapshotConfig.getAllSnapshots;
      this.clearSnapshot = snapshotConfig.clearSnapshot;
      this.configureSnapshotStore = snapshotConfig.configureSnapshotStore;
      this.takeSnapshotSuccess = snapshotConfig.takeSnapshotSuccess;
      this.updateSnapshotFailure = snapshotConfig.updateSnapshotFailure;
      this.takeSnapshotsSuccess = snapshotConfig.takeSnapshotsSuccess;
      this.fetchSnapshot = snapshotConfig.fetchSnapshot;
      this.updateSnapshotSuccess = snapshotConfig.updateSnapshotSuccess;
      this.updateSnapshotsSuccess = snapshotConfig.updateSnapshotsSuccess;
      this.fetchSnapshotSuccess = snapshotConfig.fetchSnapshotSuccess;
      this.createSnapshotSuccess = snapshotConfig.createSnapshotSuccess;
      this.createSnapshotFailure = snapshotConfig.createSnapshotFailure;
      this.batchUpdateSnapshots = snapshotConfig.batchUpdateSnapshots;
      this.batchUpdateSnapshotsSuccess = snapshotConfig.batchUpdateSnapshotsSuccess;
      this.batchFetchSnapshotsRequest = snapshotConfig.batchFetchSnapshotsRequest;
      this.batchFetchSnapshotsSuccess = snapshotConfig.batchFetchSnapshotsSuccess;
      this.batchFetchSnapshotsFailure = snapshotConfig.batchFetchSnapshotsFailure;
      this.batchUpdateSnapshotsFailure = snapshotConfig.batchUpdateSnapshotsFailure;
      this.notifySubscribers = snapshotConfig.notifySubscribers;
    };

    // Bind 'this' explicitly
    makeAutoObservable(this);
  }

  takeSnapshot(data: SnapshotStore<Snapshot<Data>>) {
    const timestamp = new Date();
    const snapshot: Snapshot<Snapshot<Data>>[] = {
      timestamp,
      data,
    };
    const snapshotObj = { snapshot: [snapshot] }; // Wrap the snapshot in an object with a 'snapshot' property
    this.snapshots.push(snapshotObj); // Push the snapshot object to the snapshots array
    // Use this.notify instead of this.notify.notify
    this.notify(
      `Snapshot taken at ${new Date(timestamp)}.`,
      NOTIFICATION_MESSAGES.Logger.LOG_INFO_SUCCESS,
      new Date(),
      NotificationTypeEnum.OperationSuccess
    );
  
    this.notifySubscribers(snapshot)
  
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




  // Iterate over each snapshot to find a match
  async getSnapshot(snapshot: Snapshot<Data>): Promise<Snapshot<Snapshot<Data>>[]> {
    let foundSnapshot: Snapshot<Snapshot<Data>> | undefined;
  
    // Access the snapshot data directly
    this.snapshots([], this.snapshots).forEach((snapshot: (subscribers: Snapshot<Snapshot<Data>>[], snapshot: Snapshot<Snapshot<Data>>[]) => { snapshot: Snapshot<Snapshot<Data>>[]; }) => {
      if (snapshotStore.state.data.timestamp === snapshotStore.state.timestamp) {
        foundSnapshot = snapshot;
      }
    });

    return foundSnapshot ? [foundSnapshot] : [];
  }


  async getSnapshots(
    subscribers: (data: Data) => Promise<Snapshot<Snapshot<Data>>[]>,
    snapshots: Snapshot<Snapshot<Data>>[]) {
    // Iterate over each snapshot in the provided array
    for (const snapshot of snapshots) {
      // Extract the 'data' property from the nested snapshot
      const data: Data = snapshot.data.data;
      
      // Process each snapshot data and pass it to the subscribers
      (await subscribers(data)).forEach(() => {
        subscribers(data);
      });
    }
  
    // Return the original array of snapshots
    return snapshots;
  }

  updateSnapshotSuccess(snapshot: SnapshotStore<Snapshot<Data>>) {
    this.notify(
      `Snapshot updated successfully.`,
      NOTIFICATION_MESSAGES.Logger.LOG_INFO_SUCCESS,
      new Date(),
      NotificationTypeEnum.OperationSuccess
    );
    this.notifySubscribers(snapshot)
    if (this.onSnapshot) {
      this.onSnapshot(snapshot);
    }
  }

  clearSnapshot() {
    return
  }


  
  getAllSnapshots: (
    data: (subscribers: Snapshot<Snapshot<Data>>[], snapshots: Snapshot<Snapshot<Data>>[]) => Snapshot<Snapshot<Data>>[],
    snapshots: Snapshot<Snapshot<Data>>[]
  ) => Snapshot<Snapshot<Data>>[]
    = (subscribers: Snapshot<Snapshot<Data>>[], snapshots: Snapshot<Snapshot<Data>>[]) => {
      // Iterate over each snapshot in the provided array
      for (const snapshot of snapshots) {
        // Extract the 'data' property from the nested snapshot
        const data: Data = snapshot.data.data;

        // Process each snapshot data and pass it to the subscribers
        subscribers(data);
      }
      // Return the original array of snapshots
      return snapshots;
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
  subscribe(callback: Snapshot<Snapshot<Data>>[]) {
    this.subscribers.push(callback);
  }

  // Unsubscribe from snapshot events
  unsubscribe(callback: Snapshot<Snapshot<Data>>[]) {
    const index = this.subscribers.indexOf(callback);
    if (index !== -1) {
      this.subscribers.splice(index, 1);
    }
  }
  
  batchUpdateSnapshots(snapshotData: (subscribers: Snapshot<Snapshot<Data>>[], snapshot: Snapshot<Snapshot<Data>>[]) => { snapshot: Snapshot<Snapshot<Data>>[]; }) { 
    // Update the snapshots
    const newSnapshots = snapshotData(this.subscribers, this.snapshots);
    this.snapshots = newSnapshots;
    this.notifySubscribers(this.subscribers);
  }
  
batchUpdateSnapshotsSuccess(snapshotData: (subscribers: Snapshot<Snapshot<Data>>[], snapshot: Snapshot<Snapshot<Data>>[]) => { snapshot: Snapshot<Snapshot<Data>>[]; }) {
    // Update the snapshots
    const newSnapshots = snapshotData(this.subscribers, this.snapshots);
    this.snapshots = newSnapshots;
    this.notifySubscribers(this.subscribers);
}
  
batchFetchSnapshotsRequest(snapshotData: (subscribers: Snapshot<Snapshot<Data>>[], snapshot: Snapshot<Snapshot<Data>>[]) => { snapshot: Snapshot<Snapshot<Data>>[]; }) {
    // Update the snapshots
    const newSnapshots = snapshotData(this.subscribers, this.snapshots);
    this.snapshots = newSnapshots;
    this.notifySubscribers(this.subscribers);
}
  
batchFetchSnapshotsSuccess(snapshotData: (subscribers: Snapshot<Snapshot<Data>>[], snapshot: Snapshot<Snapshot<Data>>[]) => Snapshot<Snapshot<Data>>[]) {
    // Update the snapshots
    const newSnapshots = snapshotData(this.subscribers, this.snapshots);
    this.snapshots = newSnapshots;
    this.notifySubscribers(this.subscribers);
}
  
  batchFetchSnapshotsFailure(payload: { error: Error; }) {
    this.notify(
      `Snapshot fetch failed.`,
      NOTIFICATION_MESSAGES.Logger.LOG_INFO_FAILURE,
      new Date(),
      NotificationTypeEnum.OperationError
    );
  }

  batchUpdateSnapshotsFailure(payload: { error: Error; }) { 
    this.notify(
      `Snapshot update failed.`,
      NOTIFICATION_MESSAGES.Logger.LOG_INFO_FAILURE,
      new Date(),
      NotificationTypeEnum.OperationError
    );
  }
  

  
  createSnapshotSuccess(
    subscribers: Snapshot<Snapshot<Data>>[]): void { 
    this.notify(
      `Snapshot created successfully.`,
      NOTIFICATION_MESSAGES.Logger.LOG_INFO_SUCCESS,
      new Date(),
      NotificationTypeEnum.OperationSuccess
    );
    this.notifySubscribers(subscribers);
  }

  createSnapshotFailure(error: Error) { 
    this.notify(
      `Snapshot creation failed.`,
      NOTIFICATION_MESSAGES.Logger.LOG_INFO_FAILURE,
      new Date(),
      NotificationTypeEnum.OperationError
    );
  }

  

  updateSnapshotsSuccess(snapshotData: (subscribers: Snapshot<Snapshot<Data>>[],
    snapshot: Snapshot<Snapshot<Data>>[]) => { snapshot: Snapshot<Snapshot<Data>>[] }) {
    // Update the snapshots
    this.snapshots = snapshotData;
    this.notifySubscribers(this.subscribers);
  }
  

  fetchSnapshotSuccess(
    snapshotData: (subscribers: Snapshot<Snapshot<Data>>[],
      snapshot: Snapshot<Snapshot<Data>>[]) => {
        snapshot: Snapshot<Snapshot<Data>>[];
      }): void {
    // Update the snapshots
    this.snapshots = snapshotData;
    
    // Notify subscribers about the successful fetch of snapshots
    snapshotData.forEach(snapshot => {
      const subscribers = snapshot.subscribers;
      this.notifySubscribers(subscribers);
    });
  }
  
  fetchSnapshotFailure(error: Error) { 
    this.notify(
      `Failed to fetch snapshot.`,
      NOTIFICATION_MESSAGES.Logger.LOG_INFO_FAILURE,
      new Date(),
      NotificationTypeEnum.OperationError
    );
  }
}







  // Define the handleSnapshot function
  const handleSnapshot = (snapshot: Snapshot<Data>) => {
    // Handle the snapshot event
    console.log("Snapshot event handled:", snapshot);
  };

  const getDefaultState = (): Snapshot<Data> => {
    return {
      timestamp: new Date(),
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
const configureSnapshotStore = (
  config: SnapshotStoreConfig<SnapshotStore<Snapshot<Data>>>,
  snapshot: Snapshot<Data>
): void => {
  // Implementation logic here

  snapshotStoreInstance.configureSnapshotStore(config);
};

const takeSnapshotSuccess = (snapshot: Snapshot<Data>): void => {
  // Assuming you have access to the snapshot store instance
  // You can perform actions based on the successful snapshot here
  console.log("Snapshot taken successfully:", snapshot);

  // Display a toast message
  const message: Message = {
    id: "snapshot-taken" as string,
    content: "Snapshot taken successfully:",
    timestamp: new Date(),
  } as Message;

  showToast(message);

  // Notify with a message
  notify("takeSnapshotSucces", "Snapshot taken successfully", NOTIFICATION_MESSAGES.Snapshot.SNAPSHOT_TAKEN,new Date, NotificationTypeEnum.CreationSuccess);
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

const notifyFunction = (
  message: string,
  content: any,
  date: Date,
  type: NotificationType
) => {
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

const snapshotStoreInstance = new SnapshotStore<Snapshot<Data>>(
  config,
  notifyFunction
);
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
};

export default SnapshotStore;
export type { Snapshot, SnapshotStoreConfig };
