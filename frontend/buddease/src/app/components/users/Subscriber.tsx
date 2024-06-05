import { Data } from "../models/data/Data";
import SnapshotStoreConfig from "../snapshots/SnapshotConfig";
import SnapshotStore, { Snapshot } from "../snapshots/SnapshotStore";
import { Subscription } from "../subscriptions/Subscription";
import {
  NotificationType,
  NotificationTypeEnum,
} from "../support/NotificationContext";
import { sendNotification } from "./UserSlice";
interface CustomSnapshotData extends Data{
  timestamp: Date | string | undefined;
  value: number;
  // Add any other properties as needed
}

// Define Subscriber class
class Subscriber<T extends Data | undefined> {
    snapshots: any;

  private id: string = '';
  private subscriberId: string = '';
  private subscribers: ((data: Snapshot<T>) => void)[] = [];
  private subscription: Subscription;
  private onSnapshotCallbacks: ((snapshot: Snapshot<T>) => void)[] = [];
  private onErrorCallbacks: ((error: Error) => void)[] = [];
  private onUnsubscribeCallbacks: ((callback: (data: Snapshot<T>) => void) => void)[] = [];
  private state: T | null = null;
  private triggerError: Function = () => {}; // Default value is an empty function
  private notifyEventSystem: Function = () => {};
  private updateProjectState: Function = () => {};
  private logActivity: Function = () => {};
  private triggerIncentives: Function = () => {};
  


  
  name: string | undefined;
  data: T | null;
  email: any;

  constructor(
    id: string,
    subscription: Subscription,
    subscriberId: string,
    notifyEventSystem: Function,
    updateProjectState: Function,
    logActivity: Function,
    triggerIncentives: Function,
    data: T | null = null

  ) {
    this.id = id;
    this.subscription = subscription;
    this.subscriberId = subscriberId;
    this.notifyEventSystem = notifyEventSystem;
    this.updateProjectState = updateProjectState;
    this.logActivity = logActivity;
    this.triggerIncentives = triggerIncentives;
    this.data = data;
  }

  subscribe(callback: (data: Snapshot<T>) => void) {
    this.subscribers.push(callback);
  }

  unsubscribe(callback: (data: Snapshot<T>) => void) {
    const index = this.subscribers.indexOf(callback);
    if (index !== -1) {
      this.subscribers.splice(index, 1);
      this.onUnsubscribeCallbacks.forEach(cb => cb(callback));
    }
  }


toSnapshotStore(
    initSnapshot: T,
    snapshotConfig: typeof SnapshotStoreConfig<Snapshot<T>, T>[],
    content: T
  ) {
    return new SnapshotStore(
      async (
        id: string,
        message: string,
        snapshotContent: T,
        date: Date,
        type: NotificationType
      ) => {
        const snapshotData: Snapshot<T> = {
          id,
          timestamp: date,
          category: "subscriberCategory",
          content: snapshotContent,
          data: snapshotContent,
          type,
        };
        try {
          if (this.notify) {
            this.notify(snapshotData);
          }
          if (sendNotification) {
            sendNotification(NotificationTypeEnum.DataLoading);
          }
        } catch (error: any) {
          if (this.triggerError) {
            this.triggerError(error);
          }
        }
      },
      initSnapshot,
      snapshotConfig,
      content
    );
  }

  getId(): string {
    return this.id;
  }

  receiveSnapshot(snapshot: T): void {
    this.state = snapshot;
    console.log(`Subscriber ${this.id} received snapshot:`, snapshot);
    this.notifyEventSystem({ type: 'SNAPSHOT_RECEIVED', subscriberId: this.id, snapshot });
    this.updateProjectState(this.id, snapshot);
    this.logActivity({ subscriberId: this.id, action: 'RECEIVED_SNAPSHOT', details: snapshot });
    this.triggerIncentives(this.id, snapshot);
  }

  // Method to get the current state of the subscriber
  getState(): T | null {
    return this.state;
  }
  // Additional methods to handle errors and unsubscriptions
  onError(callback: (error: Error) => void) {
    this.onErrorCallbacks.push(callback);
  }

  // triggerError?(error: Error) {
  //   this.onErrorCallbacks.forEach((callback) => callback(error));
  // }

  onUnsubscribe(callback: (callback: (data: Snapshot<T>) => void) => void) {
    this.onUnsubscribeCallbacks.push(callback);
  }

  onSnapshot(callback: (snapshot: Snapshot<T>) => void | Promise<void>) {
    this.onSnapshotCallbacks.push(callback);
  }

  triggerOnSnapshot?(snapshot: Snapshot<T>) {
    this.onSnapshotCallbacks.forEach((callback) => callback(snapshot));
  }

  notify?(data: Snapshot<T>) {
    this.subscribers.forEach((callback) => callback(data));
    sendNotification(NotificationTypeEnum.DataLoading);
  }
}



function notifyEventSystem(event: { type: string; subscriberId: string; snapshot: any }) {
  // Implement the logic to notify other parts of the application
  console.log(`Event system notified: ${event.type} for subscriber ${event.subscriberId}`);
  // Additional implementation to integrate with your event system
}

function updateProjectState(subscriberId: string, snapshot: any) {
  // Implement the logic to update project states based on the snapshot
  console.log(`Project state updated for subscriber ${subscriberId}`);
  // Additional implementation to update the state in your project management system
}

function logActivity(activity: { subscriberId: string; action: string; details: any }) {
  // Implement the logic to log activity for data analysis
  console.log(`Activity logged: ${activity.action} by subscriber ${activity.subscriberId}`);
  // Additional implementation to store the activity logs for analysis
}

function triggerIncentives(subscriberId: string, snapshot: any) {
  // Implement the logic to trigger incentives or rewards
  console.log(`Incentives triggered for subscriber ${subscriberId}`);
  // Additional implementation to handle incentives and rewards
}

// Usage example
const subscriber = new Subscriber<CustomSnapshotData>(
  'userId',
  {
    portfolioUpdates: () => {},
    tradeExecutions: () => {},
    marketUpdates: () => {},
    communityEngagement: () => {},
    unsubscribe: () => {},
  },
  'subscriberId',
  notifyEventSystem,
  updateProjectState,
  logActivity,
  triggerIncentives
);

const sampleSnapshot: CustomSnapshotData = {
  timestamp: new Date().toISOString(),
  value: 42,
  category: "sample snapshot"
};

subscriber.receiveSnapshot(sampleSnapshot);

console.log("Subscriber state:", subscriber.getState());

export { Subscriber };
