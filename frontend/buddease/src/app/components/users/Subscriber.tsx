//Subscriber.tsx

import { Snapshot } from "../snapshots/SnapshotStore";
import { NotificationTypeEnum } from "../support/NotificationContext";
import { sendNotification } from "./UserSlice";

class Subscriber<T> {
  private subscribers: ((data: Snapshot<T>) => void)[] = [];
  private subscription: any; // Define the subscription variable

  subscribe(callback: (data: Snapshot<T>) => void) {
    this.subscribers.push(callback);
  }

  unsubscribe(callback: (data: Snapshot<T>) => void) { 
    const index = this.subscribers.indexOf(callback);
    if (index !== -1) {
      this.subscribers.splice(index, 1);
    }
  }

  notify(data: Snapshot<T>) {
    this.subscribers.forEach(callback => callback(data));
    // Send a notification after notifying subscribers
    sendNotification(NotificationTypeEnum.DataLoading); // Adjust the notification type as needed
  }
}

export { Subscriber };
