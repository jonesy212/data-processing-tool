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
import { showErrorMessage, showToast } from "../../models/display/ShowToast";
import { Task } from "../../models/tasks/Task";
import NOTIFICATION_MESSAGES from "../../support/NotificationMessages";
import { notificationStore } from "../../support/NotificationProvider";
import { implementThen } from "./CommonEvent";
import { Phase } from "../../phases/Phase";
import { VideoData } from "../../video/Video";
import { DataAnalysisResult } from "../../projects/DataAnalysisPhase/DataAnalysisResult";
import { SnapshotItem } from "../../snapshots/SnapshotList";

const { notify } = useNotification();

interface SnapshotStoreConfig<T> {
  clearSnapshots: any;
  key: string;
  initialState: T;
  snapshots: { snapshot: SnapshotStore<Snapshot<Data>>[] }[];

  createSnapshot: (additionalData: any) => void;
  configureSnapshotStore: (
    snapshot: SnapshotStoreConfig<SnapshotStore<Snapshot<Data>>>
  ) => void;
  createSnapshotSuccess: () => void; // No need for snapshot reference
  createSnapshotFailure: (error: Error) => void; // No need for snapshot reference

  onSnapshot?: (snapshot: SnapshotStore<Snapshot<Data>>) => void;
  snapshotData: (snapshot: SnapshotStore<Snapshot<Data>>) => {
    snapshot: SnapshotStore<Snapshot<Data>>[];
  };

  snapshot?: () => void;
  initSnapshot: () => void;
  clearSnapshot: () => void;

  updateSnapshot: () => void;
  getSnapshots: () => { snapshot: SnapshotStore<Snapshot<Data>>[] }[];
  takeSnapshot: (snapshot: SnapshotStore<Snapshot<Data>>) => Promise<void>;
  // Updated signature for getSnapshots method
  getSnapshot: (
    snapshot: SnapshotStore<Snapshot<Data>>
  ) => Promise<SnapshotStore<Snapshot<Data>>[]>;
  getAllSnapshots: (
    data: (
      subscribers: SnapshotStore<Snapshot<Data>>[],
      snapshots: SnapshotStore<Snapshot<Data>>[]
    ) => SnapshotStore<Snapshot<Data>>[],
    snapshots: SnapshotStore<Snapshot<Data>>[]
  ) => SnapshotStore<Snapshot<Data>>[];

  // Adjusted method signatures for consistency
  takeSnapshotSuccess: () => void; // No need for snapshot reference
  updateSnapshotFailure: (payload: { error: string }) => void; // No need for snapshot reference
  takeSnapshotsSuccess: (snapshots: SnapshotStore<Snapshot<Data>>[]) => void;

  // No need for snapshot reference in the following functions
  fetchSnapshot: () => void;
  updateSnapshotSuccess: () => void;
  updateSnapshotsSuccess: (
    snapshotData: (
      subscribers: SnapshotStore<Snapshot<Data>>[],
      snapshot: SnapshotStore<Snapshot<Data>>[]
    ) => { snapshot: SnapshotStore<Snapshot<Data>>[] }
  ) => void;
  fetchSnapshotSuccess: (
    snapshotData: (
      subscribers: SnapshotStore<Snapshot<Data>>[],
      snapshot: SnapshotStore<Snapshot<Data>>[]
    ) => { snapshot: SnapshotStore<Snapshot<Data>>[] }
  ) => void;

  //BATCH METHODS

  batchUpdateSnapshots: (
    subscribers: SnapshotStore<Snapshot<Data>>[],
    snapshot: SnapshotStore<Snapshot<Data>>
  ) => Promise<{ snapshot: SnapshotStore<Snapshot<Data>>[] }[]>;

  batchUpdateSnapshotsSuccess: (
    subscribers: SnapshotStore<Snapshot<Data>>[],
    snapshots: SnapshotStore<Snapshot<Data>>[]
  ) => {
    snapshots: SnapshotStore<Snapshot<Data>>[];
  }[];

  batchFetchSnapshotsRequest: (
    snapshotData: (
      subscribers: SnapshotStore<Snapshot<Data>>[],
      snapshots: SnapshotStore<Snapshot<Data>>[]
    ) => {
      subscribers: SnapshotStore<Snapshot<Data>>[];
      snapshots: SnapshotStore<Snapshot<Data>>[];
    }
  ) => (
    subscribers: SnapshotStore<Snapshot<Data>>[],
    snapshots: SnapshotStore<Snapshot<Data>>[]
  ) => {
    subscribers: SnapshotStore<Snapshot<Data>>[];
    snapshots: SnapshotStore<Snapshot<Data>>[];
  };

  batchUpdateSnapshotsRequest: (
    snapshotData: (
      subscribers: SnapshotStore<Snapshot<Data>>[],
      snapshots: SnapshotStore<Snapshot<Data>>[]
    ) => {
      subscribers: SnapshotStore<Snapshot<Data>>[];
      snapshots: SnapshotStore<Snapshot<Data>>[];
    }
  ) => {
    subscribers: SnapshotStore<Snapshot<Data>>[];
    snapshots: SnapshotStore<Snapshot<Data>>[];
  };

  batchFetchSnapshots: (
    snapshotData: (
      subscribers: SnapshotStore<Snapshot<Data>>[],
      snapshot: SnapshotStore<Snapshot<Data>>[]
    ) => { snapshot: SnapshotStore<Snapshot<Data>>[] }
  ) => void;

  batchFetchSnapshotsSuccess: (
    subscribers: SnapshotStore<Snapshot<Data>>[],
    snapshot: SnapshotStore<Snapshot<Data>>
  ) => SnapshotStore<Snapshot<Data>>;

  batchFetchSnapshotsFailure: (payload: { error: Error }) => void;
  batchUpdateSnapshotsFailure: (payload: { error: Error }) => void;
  notifySubscribers: (
    subscribers: SnapshotStore<Snapshot<Data>>[]
  ) => SnapshotStore<Snapshot<Data>>[];
  [Symbol.iterator]: () => IterableIterator<Snapshot<T>>;
  notify: (
    message: string,
    content: any,
    date: Date,
    type: NotificationType
  ) => void;
}

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
  key: string;
  state: SnapshotStore<Snapshot<Data>>;
  onSnapshot?: (snapshot: SnapshotStore<Snapshot<Data>>) => void; // Adjust the parameter type
  snapshotData: (snapshot: SnapshotStore<Snapshot<Data>>) => {
    snapshot: SnapshotStore<Snapshot<Data>>[];
  };
  creatSnapshot: (additionalData: any) => void = () => {};
  snapshot?: () => SnapshotStore<Snapshot<Data>>;
  timestamp?: Date;

  private snapshots: { snapshot: SnapshotStore<Snapshot<Data>>[] }[] = [];

  private subscribers: SnapshotStore<Snapshot<Data>>[] = [];

  private readonly notify: (
    message: string,
    content: any,
    date: Date,
    type: NotificationType
  ) => void;

  // // Accessor method to retrieve snapshots
  // public getSnapshots(): { snapshot: SnapshotStore<Snapshot<Data>>[] }[] {
  //   return this.snapshots;
  // }

  public takeSnapshotsSuccess: (
    snapshots: SnapshotStore<Snapshot<Data>>[]
  ) => void;
  public updateSnapshotFailure: (payload: { error: string }) => void;
  public takeSnapshotSuccess: (snapshot: SnapshotStore<Snapshot<Data>>) => void;
  public configureSnapshotStore: (
    snapshotConfig: SnapshotStoreConfig<SnapshotStore<Snapshot<Data>>>
  ) => void;
  data: any;

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

  public setSnapshots(
    newSnapshots: {
      snapshot: SnapshotStore<Snapshot<Data>>[];
    }[]
  ) {
    this.snapshots = newSnapshots;
  }

  public notifySubscribers(
    subscribers: SnapshotStore<Snapshot<Data>>[]
  ): SnapshotStore<Snapshot<Data>>[] {
    // Utilize the 'subscribers' parameter
    // For example, you can log it to indicate it's being used
    console.log("Subscribers:", subscribers);

    // Construct an array of snapshots with timestamps and data from this.snapshots
    const snapshots: SnapshotStore<Snapshot<Data>>[] = this.snapshots.map(
      (snapshotObj) => snapshotObj.snapshot[0]
    );

    return snapshots;
  }

  validateSnapshot(data: Data) {
    if (data.timestamp) {
      return true;
    }
    return false;
  }

  // Method to provide indirect access to subscribers
  getSubscribers(): SnapshotStore<Snapshot<Data>>[] {
    return this.subscribers;
  }

  getSnapshots(): { snapshot: SnapshotStore<Snapshot<Data>>[] }[] {
    return this.snapshots;
  }
  

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
    this.state = config.initialState as SnapshotStore<Snapshot<Data>>; // Adjust the type casting
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
      this.state = config.initialState as unknown as SnapshotStore<
        Snapshot<Data>
      >;
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


  

  async takeSnapshot(data: SnapshotStore<Snapshot<Data>>): Promise<void> {
    const timestamp = new Date();

    // Check if there are existing snapshots with the same timestamp
    const existingSnapshotIndex = this.snapshots.findIndex((snapshotObj) =>
      snapshotObj.snapshot.some(
        async (snapshot) => snapshot.timestamp === (await data).timestamp
      )
    );

    if (existingSnapshotIndex !== -1) {
      // If a snapshot with the same timestamp exists, update it instead of creating a new one
      this.updateSnapshot(data);
      return;
    }
    
    // Initialize snapshot
    const snapshot = {
      timestamp: timestamp,
      state: data,
      key: this.key,
      getSubscribers: this.getSubscribers, 
      getSnapshots: this.getSnapshots,
      fetchSnapshotSuccess: this.fetchSnapshotSuccess,
      // ...other methods
    };

    const snapshotObj: { snapshot: SnapshotStore<Snapshot<Data>>[] } = {
      snapshot: [snapshot],
    };


    
    this.snapshots.push(snapshotObj); // Push the snapshot object to the snapshots array

    this.notify(
      `Snapshot taken at ${new Date(timestamp)}.`,
      NOTIFICATION_MESSAGES.Logger.LOG_INFO_SUCCESS,
      new Date(),
      NotificationTypeEnum.OperationSuccess
    );

    // Push the snapshot object into an array
    this.snapshots.push(snapshotObj);

    this.notifySubscribers([snapshot]);

    if (this.onSnapshot) {
      this.onSnapshot(data);
    }
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

  updateSnapshot(newSnapshot: SnapshotStore<Snapshot<Data>>) {
    this.state = newSnapshot;
  }

  // Updated to use setSnapshot internally
  fetchSnapshot(snapshot: SnapshotStore<Snapshot<Data>>): void {
    this.setSnapshot(snapshot);
  }

  // Iterate over each snapshot to find a match
  async getSnapshot(
    snapshot: SnapshotStore<Snapshot<Data>>
  ): Promise<SnapshotStore<Snapshot<Data>>[]> {
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
    ) => SnapshotStore<Snapshot<Data>>[],
    snapshots: SnapshotStore<Snapshot<Data>>[]
  ) => SnapshotStore<Snapshot<Data>>[] = (
    data: (
      subscribers: SnapshotStore<Snapshot<Data>>[],
      snapshots: SnapshotStore<Snapshot<Data>>[]
    ) => SnapshotStore<Snapshot<Data>>[],
    snapshots: SnapshotStore<Snapshot<Data>>[]
  ) => {
    // Iterate over each snapshot in the provided array
    for (const snapshot of snapshots) {
      // Extract the 'data' property from the nested snapshot
      const extractedData: Data = snapshot.data.data;

      // Process each snapshot data and pass it to the subscribers
      data(this.subscribers, snapshots);
    }
    // Return the original array of snapshots
    return snapshots;
  };

  getLatestSnapshot(): Snapshot<T> {
    // Return the latest snapshot's data property
    const latestSnapshot = this.snapshots[this.snapshots.length - 1];

    // Check if latestSnapshot is not undefined and contains the data property
    if (
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

    return snapshotData;
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
      const data: SnapshotStore<Snapshot<Data>> = {
        timestamp: new Date(), // Add timestamp or use existing one
        data: innerSnapshot, // Assign the inner data
      };

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
  ): {
    snapshots: SnapshotStore<Snapshot<Data>>[];
  }[] {
    this.notify(
      `Snapshot update completed.`,
      NOTIFICATION_MESSAGES.Logger.LOG_INFO_SUCCESS,
      new Date(),
      NotificationTypeEnum.OperationSuccess
    );
    if (Array.isArray(subscribers) && subscribers.length > 0) {
      this.notifySubscribers(subscribers); // Updated to use 'subscribers' instead of 'snapshot'
    }
    if (this.onSnapshot) {
      this.onSnapshot(snapshots);
    }
    // Return the updated snapshots
    return snapshots;
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


















const snapshot: SnapshotStore<Snapshot<Data>> = {
  key: "snapshotKey", // Provide a valid key for the snapshot
  state: {
    timestamp: new Date(),
  } as SnapshotStore<Snapshot<Data>>,
  snapshotData: () => {
    return { snapshot: [] }; // Adjust based on your logic
  },
  createSnapshot: () => { }, // Provide implementation for the createSnapshot function
  getSubscribers: () => [], // Provide implementation for the getSubscribers function
  getSnapshots: () => [], // Provide implementation for the getSnapshots function
  fetchSnapshotSuccess: () => { },
  creatSnapshot: function (additionalData: any): void {
    throw new Error("Function not implemented.");
  },
  snapshots: [],
  subscribers: [],
  notify: function (message: string, content: any, date: Date, type: NotificationType): void {
    throw new Error("Function not implemented.");
  },
  takeSnapshotsSuccess: function (snapshots: SnapshotStore<Snapshot<Data>>[]): void {
    throw new Error("Function not implemented.");
  },
  updateSnapshotFailure: function (payload: { error: string; }): void {
    throw new Error("Function not implemented.");
  },
  takeSnapshotSuccess: function (snapshot: SnapshotStore<Snapshot<Data>>): void {
    throw new Error("Function not implemented.");
  },
  configureSnapshotStore: function (snapshotConfig: SnapshotStoreConfig<SnapshotStore<Snapshot<Data>>>): void {
    throw new Error("Function not implemented.");
  },
  setNotificationMessage: function (message: string, notificationStore: NotificationContextProps): void {
    throw new Error("Function not implemented.");
  },
  setSnapshot: function (newSnapshot: SnapshotStore<Snapshot<Data>>): void {
    throw new Error("Function not implemented.");
  },
  setSnapshots: function (newSnapshots: { snapshot: SnapshotStore<Snapshot<Data>>[]; }[]): void {
    throw new Error("Function not implemented.");
  },
  notifySubscribers: function (subscribers: SnapshotStore<Snapshot<Data>>[]): SnapshotStore<Snapshot<Data>>[] {
    throw new Error("Function not implemented.");
  },
  validateSnapshot: function (data: Data): boolean {
    throw new Error("Function not implemented.");
  },
  takeSnapshot: function (data: SnapshotStore<Snapshot<Data>>): Promise<void> {
    throw new Error("Function not implemented.");
  },
  initSnapshot: function (snapshot: SnapshotStore<Snapshot<Data>>): void {
    throw new Error("Function not implemented.");
  },
  updateSnapshot: function (newSnapshot: SnapshotStore<Snapshot<Data>>): void {
    throw new Error("Function not implemented.");
  },
  fetchSnapshot: function (snapshot: SnapshotStore<Snapshot<Data>>): void {
    throw new Error("Function not implemented.");
  },
  getSnapshot: function (snapshot: SnapshotStore<Snapshot<Data>>): Promise<SnapshotStore<Snapshot<Data>>[]> {
    throw new Error("Function not implemented.");
  },
  updateSnapshotSuccess: function (snapshot: SnapshotStore<Snapshot<Data>>): void {
    throw new Error("Function not implemented.");
  },
  clearSnapshot: function (): void {
    throw new Error("Function not implemented.");
  },
  getAllSnapshots: function (data: (subscribers: SnapshotStore<Snapshot<Data>>[], snapshots: SnapshotStore<Snapshot<Data>>[]) => SnapshotStore<Snapshot<Data>>[], snapshots: SnapshotStore<Snapshot<Data>>[]): SnapshotStore<Snapshot<Data>>[] {
    throw new Error("Function not implemented.");
  },
  getLatestSnapshot: function (): Snapshot<Snapshot<Data>> {
    throw new Error("Function not implemented.");
  },
  subscribe: function (callback: SubscriberFunction): void {
    throw new Error("Function not implemented.");
  },
  unsubscribe: function (callback: SubscriberFunction): void {
    throw new Error("Function not implemented.");
  },
  batchUpdateSnapshotsRequest: function (snapshotData: (subscribers: SnapshotStore<Snapshot<Data>>[], snapshots: SnapshotStore<Snapshot<Data>>[]) => { subscribers: SnapshotStore<Snapshot<Data>>[]; snapshots: SnapshotStore<Snapshot<Data>>[]; }): { subscribers: SnapshotStore<Snapshot<Data>>[]; snapshots: SnapshotStore<Snapshot<Data>>[]; } {
    throw new Error("Function not implemented.");
  },
  batchUpdateSnapshots: function (subscribers: SnapshotStore<Snapshot<Data>>[], snapshot: SnapshotStore<Snapshot<Data>>): Promise<{ snapshot: SnapshotStore<Snapshot<Data>>[]; }[]> {
    throw new Error("Function not implemented.");
  },
  batchUpdateSnapshotsSuccess: function (subscribers: SnapshotStore<Snapshot<Data>>[], snapshots: SnapshotStore<Snapshot<Data>>[]): { snapshots: SnapshotStore<Snapshot<Data>>[]; }[] {
    throw new Error("Function not implemented.");
  },
  batchFetchSnapshotsRequest: function (snapshotData: (subscribers: SnapshotStore<Snapshot<Data>>[], snapshots: SnapshotStore<Snapshot<Data>>[]) => { subscribers: SnapshotStore<Snapshot<Data>>[]; snapshots: SnapshotStore<Snapshot<Data>>[]; }): (subscribers: SnapshotStore<Snapshot<Data>>[], snapshots: SnapshotStore<Snapshot<Data>>[]) => { subscribers: SnapshotStore<Snapshot<Data>>[]; snapshots: SnapshotStore<Snapshot<Data>>[]; } {
    throw new Error("Function not implemented.");
  },
  batchFetchSnapshotsSuccess: function (subscribers: SnapshotStore<Snapshot<Data>>[], snapshot: SnapshotStore<Snapshot<Data>>): SnapshotStore<Snapshot<Data>> {
    throw new Error("Function not implemented.");
  },
  batchFetchSnapshotsFailure: function (payload: { error: Error; }): void {
    throw new Error("Function not implemented.");
  },
  batchUpdateSnapshotsFailure: function (payload: { error: Error; }): void {
    throw new Error("Function not implemented.");
  },
  createSnapshotSuccess: function (subscribers: SnapshotStore<Snapshot<Data>>[]): void {
    throw new Error("Function not implemented.");
  },
  createSnapshotFailure: function (error: Error): void {
    throw new Error("Function not implemented.");
  },
  updateSnapshotsSuccess: function (snapshotData: (subscribers: SnapshotStore<Snapshot<Data>>[], snapshot: SnapshotStore<Snapshot<Data>>[]) => { snapshot: SnapshotStore<Snapshot<Data>>[]; }): void {
    throw new Error("Function not implemented.");
  },
  fetchSnapshotFailure: function (error: Error): void {
    throw new Error("Function not implemented.");
  },
  data: undefined
};





















// Define the handleSnapshot function
const handleSnapshot = (snapshot: SnapshotStore<Snapshot<Data>>) => {
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

const updateSnapshot = (snapshot: SnapshotStore<Snapshot<Data>>) => {
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

const batchFetchSnapshotsRequest = (
  snapshotData: SnapshotStore<Snapshot<Data>>[]
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
  // Implementation logic here
};

const batchFetchSnapshotsFailure = (payload: { error: string }): void => {
  // Implementation logic here
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
    subscribers: SnapshotStore<Snapshot<Data>>[],
    snapshot: SnapshotStore<Snapshot<Data>>[]
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
