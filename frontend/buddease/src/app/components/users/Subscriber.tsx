//Subscriber.tsx

import { Snapshot } from "../snapshots/SnapshotStore";
import { NotificationTypeEnum } from "../support/NotificationContext";
import { sendNotification } from "./UserSlice";

class Subscriber<T> {
  private subscribers: ((data: Snapshot<T>) => void)[] = [];

  subscribe(callback: (data: Snapshot<T>) => void) {
    this.subscribers.push(callback);
  }


  notify(data: Snapshot<T>) {
    this.subscribers.forEach(callback => callback(data));
    // Send a notification after notifying subscribers
    sendNotification(NotificationTypeEnum.DataLoading); // Adjust the notification type as needed
  }
}

export { Subscriber };
