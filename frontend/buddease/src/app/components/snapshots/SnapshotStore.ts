import {
  NotificationContextProps,
  NotificationType,
  NotificationTypeEnum,
  useNotification,
} from "@/app/components/support/NotificationContext";
import { Message } from "@/app/generators/GenerateChatInterfaces";
import { retrieveSnapshotData } from "@/app/utils/retrieveSnapshotData";
import { makeAutoObservable } from "mobx";
import { MutableRefObject, useRef } from "react";
import { useAuth } from "../auth/AuthContext";
import { Data } from "../models/data/Data";
import { showErrorMessage, showToast } from "../models/display/ShowToast";
import { Task } from "../models/tasks/Task";
import NOTIFICATION_MESSAGES from "../support/NotificationMessages";
import { notificationStore } from "../support/NotificationProvider";
import SnapshotStoreConfig, { snapshotConfig } from "./SnapshotConfig";
import { SnapshotActions } from '@/app/components/snapshots/SnapshotActions';
  
const { notify } = useNotification();

// Define a helper function to create a typed snapshot object
const createTypedSnapshot = (
  taskId: string,
  tasks: Task[],
  notify: (
    message: string,
    content: any,
    date: Date | undefined,
    type: NotificationType
  ) => void
): SnapshotStore<Snapshot<Data>> => {
  const snapshot: SnapshotStore<Snapshot<Data>> = new SnapshotStore<
    Snapshot<Data>
  >(
    {
      key: "example_key",
      initialState: {} as SnapshotStore<Snapshot<Data>>,
      snapshotData: () => ({ snapshot: [] }),
      createSnapshot: () => {},
      [taskId]: tasks,
      clearSnapshots: () => {},
      snapshots: [{ snapshot: [] }],
      subscribers: [],
      notify: notify,
      configureSnapshotStore: (config) => {},
      createSnapshotSuccess: () => {},
      createSnapshotFailure: (error) => {},
      onSnapshot: (snapshot) => {},
      snapshot: () => Promise.resolve({ snapshot: [] }),
      initSnapshot: () => {},
      clearSnapshot: () => {},
      updateSnapshot: () => Promise.resolve({ snapshot: [] }),
      getSnapshots: () => Promise.resolve([{ snapshot: [] }]),
      takeSnapshot: async (snapshot) => ({ snapshot: [snapshot] }),
      getSnapshot: async (snapshot) => snapshot,
      getAllSnapshots: (data, snapshots) => Promise.resolve(snapshots),
      takeSnapshotSuccess: () => {},
      updateSnapshotFailure: (payload) => {},
      takeSnapshotsSuccess: (snapshots) => {},
      fetchSnapshot: () => {},
      updateSnapshotSuccess: () => {},
      updateSnapshotsSuccess: (snapshots) => {},
      fetchSnapshotSuccess: (snapshotData) => {},
      batchUpdateSnapshots: async (subscribers, snapshot) => [{ snapshot: [] }],
      batchUpdateSnapshotsSuccess: (subscribers, snapshots) => [{ snapshots }],
      batchUpdateSnapshotsRequest: (snapshotData: any) => ({
        subscribers: [],
        snapshots: [],
      }),
      batchFetchSnapshotsRequest: (subscribers) => subscribers,
      batchFetchSnapshots: async (
        subscribers: SnapshotStore<Snapshot<Data>>[],
        snapshots: SnapshotStore<Snapshot<Data>>[]
      ) => Promise.resolve({ subscribers, snapshots }),

      batchFetchSnapshotsSuccess: (subscribers, snapshot) => snapshot,
      batchFetchSnapshotsFailure: (payload) => {},
      batchUpdateSnapshotsFailure: (payload) => {},
      notifySubscribers: () => ({} as SnapshotStore<Snapshot<Data>>[]),
      [Symbol.iterator]: () =>
        ({} as IterableIterator<Snapshot<SnapshotStore<Snapshot<Data>>>>),
    },
    notify
  );

  return snapshot;
};


const snapshotFunction = (
  subscribers: SnapshotStore<Snapshot<Data>>[],
  snapshot: SnapshotStore<Snapshot<Data>>[]
) => {
  snapshot.forEach((s) => {
    subscribers.forEach((sub) => {
      // Assuming you have a method or property called `getData()` on the `SnapshotStore` class
      const data = sub.getData(); // Adjust this line according to the actual method or property
      // Now you can use `data` as needed
    });
  });
};


interface Snapshot<T> {
  id?: string;
  timestamp: Date;
  data: T;
}

type SubscriberFunction = SnapshotStore<Snapshot<Data>>;

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
  
  handleSnapshot(snapshotData: SnapshotStore<Snapshot<Data>>) {
    this.state = snapshotData;
    if (this.onSnapshot) {
      this.onSnapshot(this.state);
    }
  }
  
  key: string;
  state: SnapshotStore<Snapshot<Data>>;
  onSnapshot?: (snapshot: SnapshotStore<Snapshot<Data>>) => void; // Adjust the parameter type
  onSnapshots?: (snapshots: { snapshot: SnapshotStore<Snapshot<Data>>[] }[]) => void;

  snapshotData: (snapshot: SnapshotStore<Snapshot<Data>>) => {
    snapshot: SnapshotStore<Snapshot<Data>>[];
  };

  update(snapshotData: T): void {
    // Update the snapshot data with the provided snapshotData
    this.data = { ...this.data, ...snapshotData };
  }



  


  creatSnapshot: (additionalData: any) => void = () => { };
  snapshot?: () => {
    timestamp: Date;
    data: T;
  }
  timestamp?: Date;
  
  private snapshots: { snapshot: SnapshotStore<Snapshot<Data>>[] }[] = [];

  private subscribers: SnapshotStore<Snapshot<Data>>[] = [];

  private readonly notify: (
    message: string,
    content: any,
    date: Date,
    type: NotificationType
  ) => void;


  public takeSnapshotsSuccess: (
    snapshots: SnapshotStore<Snapshot<Data>>[]
  ) => void;
  public updateSnapshotFailure: (payload: { error: string }) => void;
  public takeSnapshotSuccess: (snapshot: SnapshotStore<Snapshot<Data>>) => void;
  public configureSnapshotStore: (
    snapshotConfig: SnapshotStoreConfig<SnapshotStore<Snapshot<Data>>>
  ) => void;
  data: any;
  store: any;

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

  public setSnapshot(newSnapshot: SnapshotStore<Snapshot<Data>>) {
    this.state = newSnapshot;
  }

  public setSnapshots(newSnapshots: SnapshotStore<Snapshot<Data>>[]) {

    for (let snapshot of newSnapshots) {
      this.addSnapshot([snapshot]);
    }


    if (this.onSnapshots) {
      this.onSnapshots(this.snapshots);
    }
  }


  public addSnapshot(snapshot: SnapshotStore<Snapshot<Data>>[]): void {
    this.snapshots.push({
      snapshot: snapshot
    })
  }


  public removeSnapshot(snapshotToRemove: SnapshotStore<Snapshot<Data>>[]) {
    this.snapshots = this.snapshots.filter((snapshot) => {
      return snapshot.snapshot !== snapshotToRemove;
    });
  }

  public async notifySubscribers(
    subscribers: SnapshotStore<Snapshot<Data>>[]
  ): Promise<SnapshotStore<Snapshot<Data>>[]> {
    console.log("Subscribers:", subscribers);

    try {
      // Get all snapshots using the getAllSnapshots method
      const allSnapshots = await this.getAllSnapshots((subscribers, snapshots) => {
        // Process each snapshot data and pass it to the subscribers
        return new Promise<SnapshotStore<Snapshot<Data>>[]>((resolve, reject) => {
          // Logic to process snapshots goes here
          const processedSnapshots = snapshots.map(({ snapshot }) => snapshot);
          resolve(processedSnapshots);
        });
      }, this.snapshots);

      return allSnapshots;
    } catch (error) {
      // Handle error if getAllSnapshots fails
      console.error("Error occurred while notifying subscribers:", error);
      throw error; // Rethrow the error
    }
  }


  validateSnapshot(data: Data) {
    if (data.timestamp) {
      return true;
    }
    return false;
  }

  getData(): T {
    // Implement logic to retrieve and return the data from the snapshot
    return this.data; // Assuming `data` is the property storing the snapshot data
  }

  // Method to provide indirect access to subscribers
  getSubscribers(): SnapshotStore<Snapshot<Data>>[] {
    return this.subscribers;
  }

  getSnapshots(): Promise<{ snapshot: SnapshotStore<Snapshot<Data>>[] }[]> {
    return Promise.resolve(this.snapshots);
  }

  updateSnapshot(newSnapshot: SnapshotStore<Snapshot<Data>>) {
    // Logic to update snapshot
    this.state = newSnapshot;

    if (this.onSnapshot) {
      this.onSnapshot(this.state);
    }
  }

  getAllSnapshots: (
    data: (
      subscribers: SnapshotStore<Snapshot<Data>>[],
      snapshots: SnapshotStore<Snapshot<Data>>[]
    ) => Promise<SnapshotStore<Snapshot<Data>>[]>, // Updated to return a Promise
    snapshots: SnapshotStore<Snapshot<Data>>[]
  ) => Promise<SnapshotStore<Snapshot<Data>>[]> = (
    data: (
      subscribers: SnapshotStore<Snapshot<Data>>[],
      snapshots: SnapshotStore<Snapshot<Data>>[]
    ) => Promise<SnapshotStore<Snapshot<Data>>[]>, // Updated to return a Promise
    snapshots: SnapshotStore<Snapshot<Data>>[]
  ) => {
      // Return a Promise that resolves with the processed snapshots
      return new Promise((resolve, reject) => {
        // Iterate over each snapshot in the provided array
        for (const snapshot of snapshots) {
          // Extract the 'data' property from the nested snapshot
          const extractedData: Data = snapshot.data.data;
  
          // Process each snapshot data and pass it to the subscribers
          data(this.subscribers, snapshots)
            .then((processedSnapshots) => {
              // Resolve the Promise with the processed snapshots
              resolve(processedSnapshots);
            })
            .catch((error) => {
              // Reject the Promise if an error occurs
              reject(error);
            });
        }
      });
    };
  
  
  

  constructor(
    config: SnapshotStoreConfig<SnapshotStore<Snapshot<Data>>>,
    notify: (
      message: string,
      content: any,
      date: Date,
      type: NotificationType
    ) => void
  ) {
    this.key = config.key;
    this.state = config.initialState; // Adjusted assignment here
    this.notify = notify; // Assign the notify function

    this.onSnapshot = config.onSnapshot;
    this.snapshotData = config.snapshotData;
    this.notify = notify;
    // Initialize snapshotData function

    this.takeSnapshotsSuccess = config.takeSnapshotsSuccess;
    this.createSnapshotFailure = config.createSnapshotFailure;
    this.updateSnapshotsSuccess = config.updateSnapshotsSuccess;
    this.updateSnapshotFailure = config.updateSnapshotFailure;
    this.fetchSnapshotSuccess = config.fetchSnapshotSuccess;
    this.createSnapshotSuccess = config.createSnapshotSuccess;
    this.takeSnapshotSuccess = config.takeSnapshotSuccess;
    this.configureSnapshotStore = (
      snapshotConfig: SnapshotStoreConfig<SnapshotStore<Snapshot<Data>>>
    ) => {
      snapshotConfig.clearSnapshot(); // Call clearSnapshot method instead of checking its existence
      snapshotConfig.initSnapshot(); // Call initSnapshot method instead of checking its existence
      this.key = snapshotConfig.key;
      this.state = config.initialState as unknown as SnapshotStore<Snapshot<Data>>;
      this.onSnapshot = snapshotConfig.onSnapshot;
      this.snapshots = snapshotConfig.snapshots;
      this.createSnapshot = config.createSnapshot;
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
      this.batchUpdateSnapshotsSuccess =
        snapshotConfig.batchUpdateSnapshotsSuccess;
      this.batchUpdateSnapshotsRequest =
        snapshotConfig.batchUpdateSnapshotsRequest;

      this.batchFetchSnapshotsRequest =
        snapshotConfig.batchFetchSnapshotsRequest;
      this.batchFetchSnapshotsSuccess =
        snapshotConfig.batchFetchSnapshotsSuccess;
      this.batchFetchSnapshotsFailure =
        snapshotConfig.batchFetchSnapshotsFailure;
      this.batchUpdateSnapshotsFailure =
        snapshotConfig.batchUpdateSnapshotsFailure;
      this.notifySubscribers = snapshotConfig.notifySubscribers;
    };

    // Bind 'this' explicitly
    makeAutoObservable(this);
  }

  async takeSnapshot(data: SnapshotStore<Snapshot<Data>>): Promise<{
    snapshot: SnapshotStore<Snapshot<Data>>[];
  
  }> {
    


    {
      const timestamp = new Date();

      // Check if there are existing snapshots with the same timestamp
      const existingSnapshotIndex = this.snapshots.findIndex((snapshotObj) =>
        snapshotObj.snapshot.some(
          async (existingSnapshot) =>
            existingSnapshot.timestamp === (await data).timestamp
        )
      );

      if (existingSnapshotIndex !== -1) {
        // If a snapshot with the same timestamp exists, update it instead of creating a new one
        this.updateSnapshot(data);
        return Promise.resolve({ snapshot: [data] });
      }

      // Initialize snapshot
      const newSnapshot = {
        ...data,
        timestamp,
      } as SnapshotStore<Snapshot<Data>>;

      const snapshotObj = {
        snapshot: [newSnapshot], // Adjusted structure here, removed unnecessary object nesting
      };

      this.snapshots.push(snapshotObj); // Push the snapshot object to the snapshots array

      this.notify(
        `Snapshot taken at ${new Date(timestamp)}.`,
        NOTIFICATION_MESSAGES.Logger.LOG_INFO_SUCCESS,
        new Date(),
        NotificationTypeEnum.OperationSuccess
      );

      this.notifySubscribers([newSnapshot]); // Pass the new snapshot object

      if (this.onSnapshot) {
        this.onSnapshot(data);
      }
    }
    return {
      snapshot: []
    };
  }
  initSnapshot(snapshot: SnapshotStore<Snapshot<Data>>) {
    this.takeSnapshot(snapshot);
  }

  createSnapshot(
    data: SnapshotStore<Snapshot<Data>>,
    snapshot: { snapshot: SnapshotStore<Snapshot<Data>>[] }
  ) {
    this.snapshots.push(snapshot);
    if (this.onSnapshot) {
      this.onSnapshot(data);
    }
  }


  applySnapshot(snapshot: SnapshotStore<Snapshot<Data>>) {
    this.state = snapshot;

    if (this.onSnapshot) {
      this.onSnapshot(snapshot);
    }
    return snapshot;
  }

  // updateSnapshot(newSnapshot: SnapshotStore<Snapshot<Data>>) {
  //   this.state = newSnapshot;
  // }

  sortSnapshots(
    snapshots: SnapshotStore<Snapshot<Data>>[]) {
    return snapshots.sort((a, b) => {
      const aSnapshot = a.snapshot;
      const bSnapshot = b.snapshot;
      const aTimestamp = Array.isArray(aSnapshot) ? aSnapshot[0]?.timestamp : 0;
      const bTimestamp = Array.isArray(bSnapshot) ? bSnapshot[0]?.timestamp : 0;
      return aTimestamp - bTimestamp;
    });
  }
  

  filterSnapshots(snapshots: SnapshotStore<Snapshot<Data>>[]): SnapshotStore<Snapshot<Data>>[] {
    return this.snapshots.map(({ snapshot }) => snapshot[0]);
  }
  
  mapSnapshots(
    snapshots: SnapshotStore<Snapshot<Data>>[],
    callback: (snapshot: SnapshotStore<Snapshot<Data>>) => SnapshotStore<Snapshot<Data>>
  ): SnapshotStore<Snapshot<Data>>[] {
    return snapshots.map(callback);
  }


  findSnapshot(
    snapshot: SnapshotStore<Snapshot<Data>>
  ): SnapshotStore<Snapshot<Data>>[] | undefined {
    return this.snapshots.find(
      (snap) =>
        JSON.stringify(snap.snapshot) === JSON.stringify(snapshot.snapshot)
    )?.snapshot;
  }

  reduceSnapshots(): SnapshotStore<Snapshot<Data>>[] {
    // Initialize an empty array to store the reduced snapshots
    const reducedSnapshots: SnapshotStore<Snapshot<Data>>[] = [];
  
    // Iterate over each snapshot in this.snapshots
    for (const snapshotObj of this.snapshots) {
      // Retrieve the first snapshot from the snapshot object
      const snapshot = snapshotObj.snapshot[0];
  
      // Check if the reducedSnapshots array already contains a snapshot with the same timestamp
      const existingSnapshotIndex = reducedSnapshots.findIndex((existingSnapshot) => {
        return existingSnapshot.timestamp === snapshot.timestamp;
      });
  
      // If a snapshot with the same timestamp exists, merge the data with the existing snapshot
      if (existingSnapshotIndex !== -1) {
        // Perform the merging operation (e.g., merge data properties)
        // For demonstration purposes, let's assume we have a merge function
        reducedSnapshots[existingSnapshotIndex] = this.mergeSnapshots(reducedSnapshots[existingSnapshotIndex], snapshot);
      } else {
        // If no snapshot with the same timestamp exists, add the snapshot to the reducedSnapshots array
        reducedSnapshots.push(snapshot);
      }
    }
  
    // Return the array of reduced snapshots
    return reducedSnapshots;
  }
  
  // Example merge function (replace this with your actual merging logic)
  mergeSnapshots(
    snapshot1: SnapshotStore<Snapshot<Data>>,
    snapshot2: SnapshotStore<Snapshot<Data>>
  ): SnapshotStore<Snapshot<Data>> {
    if (snapshot1.snapshot && snapshot2.snapshot) {
      const mergedSnapshotData = {
        ...(snapshot1.snapshot()?.data ?? {}),
        ...(snapshot2.snapshot()?.data ?? {}),
      };

      // Extract timestamps from snapshots or default to new Date() if not present
      const timestamp1 = snapshot1.snapshot()?.timestamp ?? new Date();
      const timestamp2 = snapshot2.snapshot()?.timestamp ?? new Date();

      // Choose the latest timestamp
      const latestTimestamp = new Date(
        Math.max(timestamp1.getTime(), timestamp2.getTime())
      );

      // Return a new merged snapshot
      return new SnapshotStore<Snapshot<Data>>(
        {
          key: "merged_key",
          initialState: {} as SnapshotStore<Snapshot<Data>>,
          snapshotData: () => ({
            snapshot: [],
          }),
          createSnapshot: () => { },
          clearSnapshots: () => { },
          initSnapshot: () => { },
          snapshot: (snapshot: SnapshotStore<Snapshot<Data>>) => Promise<{ snapshot: SnapshotStore<Snapshot<Data>>[]; }>
          getSnapshots: () => Promise.resolve([{ snapshot: this.snapshots }]),
          takeSnapshot: (snapshot: SnapshotStore<Snapshot<Data>>) =>
            Promise.resolve([{ snapshot: [snapshot] }]),
          getSnapshot: () => Promise.resolve(this.state),
          getAllSnapshots: () => Promise.resolve(this.snapshots),
          snapshots: [],
          clearSnapshot: () => { },
          updateSnapshot: (snapshot) => {
            return Promise.resolve([{ snapshot: [snapshot] }]);
          },
          subscribers: [],
          notify: (message, content, date, type) => { },
          configureSnapshotStore: (config) => { },
          createSnapshotSuccess: () => { },
          createSnapshotFailure: (error) => { },
          updateSnapshotFailure: (error) => { },
          fetchSnapshotSuccess: (snapshotData) => { },
          updateSnapshotSuccess: () => { },
          updateSnapshotsSuccess: (snapshotData) => { },
          batchUpdateSnapshotsSuccess: (subscribers, snapshots) => [
            { snapshots },
          ],
          batchFetchSnapshots: async (subscribers, snapshots) => ({
            subscribers,
            snapshots,
          }),

          batchUpdateSnapshotsRequest: (snapshotData) => snapshotData([], []),
          batchFetchSnapshotsRequest: (subscribers) => subscribers,
          takeSnapshotSuccess: () => { }, // No need for logic, just an empty function
          takeSnapshotsSuccess: (snapshots) => { }, // No need for logic, just an empty function
          fetchSnapshot: () => { }, // No need for logic, just an empty function
          batchUpdateSnapshots: (
            snapshot: SnapshotStore<Snapshot<Data>>[],
            snapshots
          ) =>
            Promise.resolve([
              {
                snapshot,
                snapshots,
              },
            ]), // No need for logic, just resolve with snapshots
          // Resolves with the updated snapshots
          batchFetchSnapshotsSuccess: (subscribers, snapshot) => snapshot,
          batchFetchSnapshotsFailure: (payload) => { },
          batchUpdateSnapshotsFailure: (payload) => { },
          notifySubscribers: (subscribers) => subscribers,
          [Symbol.iterator]: () =>
            ({} as IterableIterator<Snapshot<SnapshotStore<Snapshot<Data>>>>),
        },
        snapshot1.notify
      );
    }
    return snapshot1;
  }
  
  
  
  

  updateSnapshots(newSnapshots: SnapshotStore<Snapshot<Data>>[]) {
    // Wrap newSnapshots inside an array with a snapshot property
    const wrappedSnapshots = [{ snapshot: newSnapshots }];

    // Assign the wrapped snapshots to the snapshots property
    this.snapshots = wrappedSnapshots;

    // Notify subscribers or perform other operations
  }
  

  // Updated to use setSnapshot internally
  fetchSnapshot(snapshot: SnapshotStore<Snapshot<Data>>): void {
    this.setSnapshot(snapshot);
  }

  // Iterate over each snapshot to find a match
  async getSnapshot(
    snapshot: SnapshotStore<Snapshot<Data>>[]
  ): Promise<SnapshotStore<Snapshot<Data>>> {
    {
      let foundSnapshot: SnapshotStore<Snapshot<Data>> | undefined;

      // Access the snapshot data directly
      this.snapshots.forEach((snapshotObj) => {
        snapshotObj.snapshot.forEach((snapshotData) => {
          if (snapshotData.timestamp === snapshot.timestamp) {
            foundSnapshot = snapshotData;
          }
        });
      });

      return foundSnapshot ? [foundSnapshot] : [];
    }
  }
    updateSnapshotSuccess(snapshot: SnapshotStore<Snapshot<Data>>) {
      this.notify(
        `Snapshot updated successfully.`,
        NOTIFICATION_MESSAGES.Logger.LOG_INFO_SUCCESS,
        new Date(),
        NotificationTypeEnum.OperationSuccess
      );
      if (Array.isArray(snapshot) && snapshot.length > 0) {
        this.notifySubscribers(snapshot[0].snapshot); // Assuming notifySubscribers expects an array of snapshots
      } else {
        console.error("Snapshot array is empty or not properly formatted.");
      }

      if (this.onSnapshot) {
        // Pass the snapshot parameter directly to onSnapshot
        this.onSnapshot(snapshot);
      }
    }

    clearSnapshot() {
      return;
    }

    getAllSnapshots: (
      data: (
        subscribers: SnapshotStore<Snapshot<Data>>[],
        snapshots: SnapshotStore<Snapshot<Data>>[]
      ) => Promise<SnapshotStore<Snapshot<Data>>[]>, // Updated to return a Promise
      snapshots: SnapshotStore<Snapshot<Data>>[]
    ) => Promise<SnapshotStore<Snapshot<Data>>[]> = (
      data: (
        subscribers: SnapshotStore<Snapshot<Data>>[],
        snapshots: SnapshotStore<Snapshot<Data>>[]
      ) => Promise<SnapshotStore<Snapshot<Data>>[]>, // Updated to return a Promise
      snapshots: SnapshotStore<Snapshot<Data>>[]
    ) => {
      // Return a Promise that resolves with the processed snapshots
      return new Promise((resolve, reject) => {
        // Iterate over each snapshot in the provided array
        for (const snapshot of snapshots) {
          // Extract the 'data' property from the nested snapshot
          const extractedData: Data = snapshot.data.data;
  
          // Process each snapshot data and pass it to the subscribers
          data(this.subscribers, snapshots)
            .then((processedSnapshots) => {
              // Resolve the Promise with the processed snapshots
              resolve(processedSnapshots);
            })
            .catch((error) => {
              // Reject the Promise if an error occurs
              reject(error);
            });
        }
      });
    }
  

    getLatestSnapshot(): Snapshot < T > {
      // Return the latest snapshot's data property
      const latestSnapshot = this.snapshots[this.snapshots.length - 1];

      // Check if latestSnapshot is not undefined and contains the data property
      if(
        latestSnapshot &&
      "timestamp" in latestSnapshot &&
      latestSnapshot &&
      "data" in latestSnapshot
    ) {
      return {
        timestamp: latestSnapshot.timestamp as Date,
        data: latestSnapshot.data as T, // Cast data to type T
      };
    } else {
      // Handle the case where latestSnapshot is undefined or doesn't have the data property
      throw new Error("Latest snapshot is invalid or does not contain data.");
    }
  }

  // Subscribe to snapshot events
  subscribe(callback: SubscriberFunction): void {
    // Push the callback function directly into the subscribers array
    this.subscribers.push(callback);
  }

  unsubscribe(callback: SubscriberFunction): void {
    // Find the index of the callback function in the subscribers array
    const index = this.subscribers.indexOf(callback);
    // If found, remove the callback function from the subscribers array
    if (index !== -1) {
      this.subscribers.splice(index, 1);
    }
  }


  getState(): SnapshotStore<Snapshot<Data>> {
    return this.state;
  }

  setState(newState: SnapshotStore<Snapshot<Data>>) { 
    this.state = newState;
  }

  handleActions(action: typeof SnapshotActions) {};
  clearSnapshots() {}

  batchUpdateSnapshotsRequest(
    snapshotData: (
      subscribers: SnapshotStore<Snapshot<Data>>[],
      snapshots: SnapshotStore<Snapshot<Data>>[]
    ) => {
      subscribers: SnapshotStore<Snapshot<Data>>[];
      snapshots: SnapshotStore<Snapshot<Data>>[];
    }
  ): {
    subscribers: SnapshotStore<Snapshot<Data>>[];
    snapshots: SnapshotStore<Snapshot<Data>>[];
  } {
    this.notify(
      `Snapshot update started.`,
      NOTIFICATION_MESSAGES.Logger.LOG_INFO_START,
      new Date(),
      NotificationTypeEnum.OperationStart
    );

    return snapshotData([], []); // Call the snapshotData function with empty arrays
  }

  async batchUpdateSnapshots(
    subscribers: SnapshotStore<Snapshot<Data>>[],
    snapshot: SnapshotStore<Snapshot<Data>>
  ): Promise<{ snapshot: SnapshotStore<Snapshot<Data>>[] }[]> {
    // Initialize an array to store results
    const updatedSnapshots: { snapshot: SnapshotStore<Snapshot<Data>>[] }[] =
      [];

    // Iterate over each subscriber in the provided array
    for (const subscriber of subscribers) {
      // Extract the 'data' property from the nested subscriber
      const innerSnapshot: Data = subscriber.data.data;

      // Wrap the inner data into another Snapshot object
      const data = {
        timestamp: new Date(), // Add timestamp or use existing one
        data: innerSnapshot, // Assign the inner data
      } as SnapshotStore<Snapshot<Data>>;

      // Process each snapshot data and pass it to the subscribers
      this.notifySubscribers([data]);

      // Store the updated snapshot, if necessary
      // You might need to modify this part based on your requirements
      updatedSnapshots.push({ snapshot: [snapshot] });
    }

    // Return the array of updated snapshots
    return updatedSnapshots;
  }

  batchUpdateSnapshotsSuccess(
    subscribers: SnapshotStore<Snapshot<Data>>[],
    snapshots: SnapshotStore<Snapshot<Data>>[]
  ): { snapshots: SnapshotStore<Snapshot<Data>>[] }[] {
    this.notify(
      `Snapshot update completed.`,
      NOTIFICATION_MESSAGES.Logger.LOG_INFO_SUCCESS,
      new Date(),
      NotificationTypeEnum.OperationSuccess
    );
    if (Array.isArray(subscribers) && subscribers.length > 0) {
      this.notifySubscribers(subscribers); // Updated to use 'subscribers' instead of 'snapshot'
    }
    if (this.onSnapshots) {
      this.onSnapshots(snapshots);
    }
    // Return the updated snapshots
    return [{ snapshots }];
  }

  batchFetchSnapshotsRequest(
    snapshotData: (
      subscribers: SnapshotStore<Snapshot<Data>>[],
      snapshots: SnapshotStore<Snapshot<Data>>[]
    ) => {
      subscribers: SnapshotStore<Snapshot<Data>>[];
      snapshots: SnapshotStore<Snapshot<Data>>[];
    }
  ): (
    subscribers: SnapshotStore<Snapshot<Data>>[],
    snapshots: SnapshotStore<Snapshot<Data>>[]
  ) => {
    subscribers: SnapshotStore<Snapshot<Data>>[];
    snapshots: SnapshotStore<Snapshot<Data>>[];
  } {
    this.notify(
      `Snapshot fetch started.`,
      NOTIFICATION_MESSAGES.Logger.LOG_INFO_START,
      new Date(),
      NotificationTypeEnum.OperationStart
    );
    return snapshotData;
  }

  batchFetchSnapshotsSuccess(
    subscribers: SnapshotStore<Snapshot<Data>>[],
    snapshot: SnapshotStore<Snapshot<Data>>
  ): SnapshotStore<Snapshot<Data>> {
    this.notify(
      `Snapshot fetch completed.`,
      NOTIFICATION_MESSAGES.Logger.LOG_INFO_SUCCESS,
      new Date(),
      NotificationTypeEnum.OperationSuccess
    );
    if (Array.isArray(subscribers) && subscribers.length > 0) {
      this.notifySubscribers(subscribers);
    }
    if (this.onSnapshot) {
      this.onSnapshot(snapshot);
    }
    return snapshot;
  }

  batchFetchSnapshotsFailure(payload: { error: Error }) {
    this.notify(
      `Snapshot fetch failed.`,
      NOTIFICATION_MESSAGES.Logger.LOG_INFO_FAILURE,
      new Date(),
      NotificationTypeEnum.OperationError
    );
  }

  batchUpdateSnapshotsFailure(payload: { error: Error }) {
    this.notify(
      `Snapshot update failed.`,
      NOTIFICATION_MESSAGES.Logger.LOG_INFO_FAILURE,
      new Date(),
      NotificationTypeEnum.OperationError
    );
  }

  createSnapshotSuccess(subscribers: SnapshotStore<Snapshot<Data>>[]): void {
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

  updateSnapshotsSuccess(
    snapshotData: (
      subscribers: SnapshotStore<Snapshot<Data>>[],
      snapshot: SnapshotStore<Snapshot<Data>>[]
    ) => { snapshot: SnapshotStore<Snapshot<Data>>[] }
  ) {
    // Update the snapshots
  }

  fetchSnapshotSuccess(
    snapshotData: (
      subscribers: SnapshotStore<Snapshot<Data>>[],
      snapshot: SnapshotStore<Snapshot<Data>>[]
    ) => {
      snapshot: SnapshotStore<Snapshot<Data>>[];
    }
  ): void {
    // Update the snapshots
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

}
// Define the handleSnapshot function
const handleSnapshot = (snapshot: SnapshotStore<Snapshot<Data>>) => {
  // Handle the snapshot event
  console.log("Snapshot event handled:", snapshot);
};

const getDefaultState = (): SnapshotStore<Snapshot<Data>> => {
  return {
    key: "",
    state: {} as SnapshotStore<Snapshot<Data>>,
    snapshot: undefined,
    snapshotData: (
      snapshot: SnapshotStore<Snapshot<Data>>
    ): { snapshot: SnapshotStore<Snapshot<Data>>[] } => {
      return {
        snapshot: [snapshot],
      };
    },
    createSnapshot: () => { },
    updateSnapshots: () => { },
    fetchSnapshot: () => { },
    createSnapshotSuccess: () => { },
    createSnapshotFailure: () => { },
    updateSnapshotsSuccess: () => { },
    fetchSnapshotSuccess: () => { },
    fetchSnapshotFailure: () => { },
    notify: () => { },
    notifySubscribers: (subscribers: SnapshotStore<Snapshot<Data>>[]) => {
      return subscribers;
    },
    subscribe: () => { },
    unsubscribe: () => { },
    getState(): SnapshotStore<Snapshot<Data>> {
      return this.state;
    },
    setState(state: SnapshotStore<Snapshot<Data>>) {
      if (state) {
        this.state = state;
      }
    },
    handleActions: () => { },
    clearSnapshots: () => { },
    clearSnapshot: () => { },
    getSnapshot: (snapshot: Snapshot<Data>): Promise<SnapshotStore<Snapshot<Data>>> => {
      return Promise.resolve(snapshot);
    },
    getSnapshots: async () => [{ snapshot: [] }],
    setSnapshot: () => { },
    setSnapshots: () => { },
    addSnapshot: () => { },
    removeSnapshot: () => { },
    updateSnapshot: () => { },
    filterSnapshots: (snapshots: SnapshotStore<Snapshot<Data>>[]) => {
      return snapshots;
    },

    sortSnapshots(snapshots: SnapshotStore<Snapshot<Data>>[]) {
      return snapshots.sort((a, b) => {
        const aSnapshot = a.snapshot || [];
        const bSnapshot = b.snapshot || [];
        const aTimestamp = aSnapshot.length > 0 ? aSnapshot[0].timestamp : 0;
        const bTimestamp = bSnapshot.length > 0 ? bSnapshot[0].timestamp : 0;
        return aTimestamp - bTimestamp;
      });
    },
    mapSnapshots: (
      snapshots: SnapshotStore<Snapshot<Data>>[],
      callback: (
        snapshot: SnapshotStore<Snapshot<Data>>
      ) => SnapshotStore<Snapshot<Data>>
    ) => {
      return snapshots.map((snapshot) => {
        return callback(snapshot);
      });
    },
    reduceSnapshots: () => {
      const snapshots: SnapshotStore<Snapshot<Data>>[] = [];
      const reducedSnapshots: SnapshotStore<Snapshot<Data>>[] = [];
    
      for (const snapshotObj of snapshots) {
        if (snapshotObj) {
          const snapshot = snapshotObj.snapshot;
          if (snapshot) {
            const existingSnapshotIndex = reducedSnapshots.findIndex(
              (existingSnapshot) => {
                return existingSnapshot?.timestamp === snapshot.timestamp;
              }
            );
            if (existingSnapshotIndex !== -1) {
              // Assuming this.mergeSnapshots requires the existingSnapshot parameter
              // to be of type SnapshotStore<Snapshot<Data>>
              reducedSnapshots[existingSnapshotIndex] = this.mergeSnapshots(
                reducedSnapshots[existingSnapshotIndex],
                snapshot
              );
            } else {
              reducedSnapshots.push(snapshot);
            }
          }
        }
      }
      return reducedSnapshots;
    },
    findSnapshot: (
      snapshot: SnapshotStore<Snapshot<Data>>) => {
      return this.getSnapshots().find(
        (storedSnapshot) => {
          return (
            storedSnapshot.key === snapshot.key &&
            isEqual(storedSnapshot.snapshot, snapshot.snapshot)
          );
        })
    },
    
  };
}

// Function to set a dynamic notification message
const setDynamicNotificationMessage = (message: string) => {
  setNotificationMessage(message);
};

const { state: authState } = useAuth();




const updateSnapshot = async (snapshot: SnapshotStore<Snapshot<Data>>): Promise<{ snapshot: SnapshotStore<Snapshot<Data>>[] }> => {
  snapshotConfig.setSnapshot(snapshot);
  // Assuming you want to return an array of snapshots after updating
  const updatedSnapshots: SnapshotStore<Snapshot<Data>>[] = [snapshot]; // Adjust this line based on your actual implementation
  return { snapshot: updatedSnapshots };
};



const convertToSnapshotStore = (
  snapshotData: (
    snapshotStore: SnapshotStore<Snapshot<Data>>) => {
      snapshot: SnapshotStore<Snapshot<Data>>[];
    }
): SnapshotStore<Snapshot<Data>> => {
  return {
    data: snapshotData,
    store: snapshotConfig,
    key: "",
    state: getDefaultState(),
    snapshotData: snapshotData,
    createSnapshot: () => {},
    applySnapshot: (snapshot: SnapshotStore<Snapshot<Data>>) => SnapshotStore<Snapshot<Data>>,
    // Add remaining missing properties
  };
}



const takeSnapshot = async (): Promise<{
  snapshot: SnapshotStore<Snapshot<Data>>[];
}> => {
  // Logic to retrieve snapshot
  const id = authState.user?.id; // Add optional chaining

  const retrievedSnapshot = await retrieveSnapshotData(String(id)); // Example function to retrieve snapshot data

  if (retrievedSnapshot) {
    const snapshotStore = convertToSnapshotStore(retrievedSnapshot);
    return { snapshot: [snapshotStore] }; // Return an array with the retrieved snapshot
  } else {
    return { snapshot: [] }; // Return an empty array if no snapshot is available
  }
};



const getSnapshot = async (snapshot: SnapshotStore<Snapshot<Data>>): Promise<SnapshotStore<Snapshot<Data>>[]> => {
  // Implementation logic here
  const snapshotArray: SnapshotStore<Snapshot<Data>>[] = [snapshot];
  return snapshotArray;
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

const takeSnapshotSuccess = (snapshot: SnapshotStore<Snapshot<Data>>): void => {
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
  notify(
    "takeSnapshotSucces",
    "Snapshot taken successfully",
    NOTIFICATION_MESSAGES.Snapshot.SNAPSHOT_TAKEN,
    new Date(),
    NotificationTypeEnum.CreationSuccess
  );
};

const updateSnapshotFailure = (payload: { error: string }): void => {
  // Log the error message or handle it in any way necessary
  console.error("Update snapshot failed:", payload.error);

  // You can also display a notification to the user or perform any other actions
  // For example:
  showErrorMessage(payload.error);
};

const takeSnapshotsSuccess = (
  snapshots: SnapshotStore<Snapshot<Data>>[]
): void => {
  // Implementation logic here
};

const fetchSnapshot = (snapshotId: SnapshotStore<Snapshot<Data>>): void => {
  // Implementation logic here
};

const updateSnapshotSuccess = (
  snapshot: SnapshotStore<Snapshot<Data>>[]
): void => {
  // Implementation logic here
};

const updateSnapshotsSuccess = (snapshots: SnapshotStore<Snapshot<Data>>[]) => {
  snapshots.forEach(async (snapshot) => {
    // Assuming snapshot.data is of type SnapshotStore<Snapshot<Data>>
    const snapshotData = await snapshot.data; // Wait for snapshot.data to resolve
    // Check if snapshotData is of type SnapshotStore<Snapshot<Data>>
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

const fetchSnapshotSuccess = (snapshots: Snapshot<Data>[]): void => {
  if (snapshots.length === 0) {
    console.log("No snapshots fetched.");
    return;
  }

  console.log("Snapshots fetched successfully:");
  snapshots.forEach((snapshot, index) => {
    console.log(`Snapshot ${index + 1}:`);
    console.log("Timestamp:", snapshot.timestamp);
    console.log("Data:", snapshot.data);
    console.log("----------------------");
  });
};


const createSnapshotSuccess = (snapshot: Snapshot<Data>[]): void => {
  // Implementation logic here
};

const createSnapshotFailure = (error: string): void => {
  // Implementation logic here
};

const prevTasks = useRef<MutableRefObject<{ [key: string]: Task[] }>>({
  // Initial tasks state
  current: {},
});
const setTasks = (
  updateFunction: (
    prevTasks: MutableRefObject<{ [key: string]: Task[] }>
  ) => any
) => {
  // Update tasks using the provided update function
  const updatedTasks = updateFunction(prevTasks.current);

  // Further logic to handle the updated tasks
};

const batchFetchSnapshotsRequest = (
  snapshotData: SnapshotStore<Snapshot<Data>>[]
): void => {
  const snapshots = Object.values(snapshotData);

  snapshots.forEach(async (snapshot) => {
    const taskId = Object.keys(snapshot)[0] as string;
    const tasks = Object.values(snapshot)[0];

    setTasks((prevTasks: MutableRefObject<{ [key: string]: Task[] }>) => {
      return {
        ...prevTasks.current, // Access the 'current' property of the MutableRefObject
        [taskId]: [...(prevTasks.current[taskId] || []), ...tasks],
      };
    });
  });
};

const batchUpdateSnapshotsSuccess = (
  snapshotData: SnapshotStore<Snapshot<Data>>[]
): void => {
  // Check if snapshotData array is not empty
  if (snapshotData.length === 0) {
    console.error("Snapshot data array is empty.");
    return;
  }
  // Iterate over each snapshot data in the array
  snapshotData.forEach((snapshot) => {
    // Extract necessary information from the snapshot data
    const { timestamp, data } = snapshot;

    // Perform any necessary processing with the snapshot data
    console.log(`Processing snapshot taken at ${timestamp}:`, data);
  });

  // Notify subscribers or perform any other action as needed
  console.log(
    "Batch update snapshots success: Notifying subscribers or performing other actions."
  );
};


const batchFetchSnapshotsSuccess = (
  snapshotData: SnapshotStore<Snapshot<Data>>[]
): void => {
  // Initialize an array to store all fetched snapshots
  const fetchedSnapshots: SnapshotStore<Snapshot<Data>>[] = [];

  // Iterate over each snapshot data in the provided array
  snapshotData.forEach((snapshot) => {
    // Extract the snapshot's task ID and tasks
    const taskId = Object.keys(snapshot)[0] as string;
    const tasks = Object.values(snapshot)[0];

    // Create a new typed snapshot object with the fetched tasks
    const fetchedSnapshot = createTypedSnapshot(
      taskId,
      tasks,
      notifyFunction
    );

    // Push the fetched snapshot into the array
    fetchedSnapshots.push(fetchedSnapshot);
  });

  // Further processing logic with the fetched snapshots
};

const batchUpdateSnapshotsFailure = (payload: { error: string }): void => {
  // Implementation logic here
};

const notifySubscribers = (
  subscribers: SnapshotStore<Snapshot<Data>>[]
): void => {
  // Implementation logic here
};

const notifyFunction = (
  message: string,
  content: any,
  date: Date | undefined,
  type: NotificationType
) => {
  // Implementation logic for sending notifications
};

const snapshotStoreConfig: SnapshotStoreConfig<Snapshot<Data>> = {
  key: "your_key",
  clearSnapshots: undefined,
  initialState: getDefaultState(),
  initSnapshot: () => {},
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
export type { Snapshot };
