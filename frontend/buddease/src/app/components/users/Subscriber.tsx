import { Data } from "../models/data/Data";
import SnapshotStoreConfig from "../snapshots/SnapshotConfig";
import SnapshotStore, { Snapshot } from "../snapshots/SnapshotStore";
import { Subscription } from "../subscriptions/Subscription";
import {
  NotificationType,
  NotificationTypeEnum,
} from "../support/NotificationContext";
import { sendNotification } from "./UserSlice";

class Subscriber<T> {
  private subscribers: ((data: Snapshot<T>) => void)[] = [];
  private subscription: Subscription; // Define the subscription variable
  private onSnapshotCallbacks: ((snapshot: Snapshot<T>) => void)[] = []; // Array to store onSnapshot callbacks

  constructor(subscription: Subscription) {
    this.subscription = subscription;
  }

  subscribe(callback: (data: Snapshot<T>) => void) {
    this.subscribers.push(callback);
  }

  unsubscribe(callback: (data: Snapshot<T>) => void) {
    const index = this.subscribers.indexOf(callback);
    if (index !== -1) {
      this.subscribers.splice(index, 1);
    }
  }

  
  toSnapshotStore(
    initSnapshot: Snapshot<Data>,
    snapshotConfig: SnapshotStoreConfig<SnapshotStore<Snapshot<Data>>>) {
    return new SnapshotStore<Snapshot<Data>>(
      async (
        id: string,
        message: string,
        content: T,
        date: Date,
        type: NotificationType
      ) => {
        const snapshotData: Snapshot<T> = {
          id,
          timestamp: date,
          category: "subscriberCategory",
          content: undefined,
          data: content,
        };
        this.notify(snapshotData);
        sendNotification(NotificationTypeEnum.DataLoading);
      },
      initSnapshot,
      snapshotConfig
    );
  }

  // Define the onSnapshot method
  onSnapshot(callback: (snapshot: Snapshot<T>) =>Promise<void>) {
    // Add the callback to the array of onSnapshot callbacks
    this.onSnapshotCallbacks.push(callback);
  }

  // Method to trigger all onSnapshot callbacks
  triggerOnSnapshot(snapshot: Snapshot<T>) {
    this.onSnapshotCallbacks.forEach((callback) => callback(snapshot));
  }
  notify(data: Snapshot<T>) {
    this.subscribers.forEach((callback) => callback(data));
    // Send a notification after notifying subscribers
    sendNotification(NotificationTypeEnum.DataLoading); // Adjust the notification type as needed
  }
}

export { Subscriber };
