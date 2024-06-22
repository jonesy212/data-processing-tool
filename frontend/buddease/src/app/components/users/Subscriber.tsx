import { addSnapshot } from "@/app/api/SnapshotApi";
import { ModifiedDate } from "../documents/DocType";
import { Data } from "../models/data/Data";

import {
    NotificationStatus,
    SubscriberTypeEnum,
    SubscriptionTypeEnum
} from "../models/data/StatusType";
import { RealtimeDataItem } from "../models/realtime/RealtimeData";
import { Payload, Snapshot, UpdateSnapshotPayload } from "../snapshots/LocalStorageSnapshotStore";
import { SnapshotStoreConfig } from "../snapshots/SnapshotConfig";
import SnapshotStore, { SnapshotStoreSubset } from "../snapshots/SnapshotStore";
import {
    addSnapshotSuccess,
    createSnapshot,
    createSnapshotFailure,
    createSnapshotSuccess,
    subscribeToSnapshots,
    updateSnapshot
} from "../snapshots/snapshotHandlers";
import {
    clearSnapshots,
    removeSnapshot,
} from "../state/redux/slices/SnapshotSlice";
import { CalendarEvent } from "../state/stores/CalendarEvent";
import { Subscription } from "../subscriptions/Subscription";
import {
    NotificationType,
    NotificationTypeEnum,
} from "../support/NotificationContext";
import { YourSpecificSnapshotType } from "../typings/YourSpecificSnapshotType";
import { sendNotification } from "./UserSlice";

type SnapshotStoreDelegate<T extends Data | undefined> = (
  snapshot: Snapshot<T>,
  initialState: Snapshot<T>,
  snapshotConfig: SnapshotStoreConfig<Snapshot<Data>, Data>[]
) => void;

const delegateFunction: SnapshotStoreDelegate<CustomSnapshotData> = (
  snapshot: Snapshot<CustomSnapshotData>,
  initialState: Snapshot<CustomSnapshotData>,
  snapshotConfig: SnapshotStoreConfig<Snapshot<Data>, Data>[]
) => {
  console.log("Delegate function called with snapshot:", snapshot);
  console.log("Initial state:", initialState);
  console.log("Snapshot config:", snapshotConfig);
};

interface CustomSnapshotData extends Data {
  timestamp: string | Date | undefined;
  value: number;
}

class Subscriber<T extends Data | undefined> {
  private readonly id: string;
  private readonly name: string;
  private subscription: Subscription;
  private subscriberId: string;
  private subscribers: ((data: Snapshot<T>) => void)[] = [];
  private onSnapshotCallbacks: ((snapshot: Snapshot<T>) => void)[] = [];
  private onErrorCallbacks: ((error: Error) => void)[] = [];
  private onUnsubscribeCallbacks: ((
    callback: (data: Snapshot<T>) => void
  ) => void)[] = [];
  private state?: T | null = null;
  private notifyEventSystem: Function;
  private updateProjectState: Function;
  private logActivity: Function;
  private triggerIncentives: Function;
  private optionalData: CustomSnapshotData | null;
  private data: Data | null;
  private email: string = "";
  private snapshotIds: string[] = [];
  private readonly payload: T;
  private async fetchSnapshotIds(): Promise<string[]> {
    // Simulate an asynchronous operation to fetch snapshot IDs
    return new Promise<string[]>((resolve, reject) => {
      setTimeout(() => {
        // Example: Fetching snapshot IDs from an API or database
        const fetchedSnapshotIds = ["snapshot1", "snapshot2", "snapshot3"];

        // Resolve with fetched snapshot IDs
        resolve(fetchedSnapshotIds);
      }, 1000); // Simulating a delay of 1 second (adjust as needed)
    });
  }

  constructor(
    id: string,
    name: string,
    subscription: Subscription,
    subscriberId: string,
    notifyEventSystem: Function,
    updateProjectState: Function,
    logActivity: Function,
    triggerIncentives: Function,
    optionalData: CustomSnapshotData | null = null,
    data: Data | null = null,
    payload: T | null = null
  ) {
    this.id = id;
    this.name = name;
    this.subscription = subscription;
    this.subscriberId = subscriberId;
    this.notifyEventSystem = () => {};
    this.updateProjectState = updateProjectState;
    this.logActivity = logActivity;
    this.triggerIncentives = triggerIncentives;
    this.optionalData = optionalData;
    this.data = data;
    this.payload = payload !== null ? payload : (optionalData as unknown as T);
  }

  getEmail(): string {
    return this.email;
  }

  subscribe(callback: (data: Snapshot<T>) => void) {
    this.subscribers.push(callback);
  }

  unsubscribe(callback: (data: Snapshot<T>) => void) {
    const index = this.subscribers.indexOf(callback);
    if (index !== -1) {
      this.subscribers.splice(index, 1);
      this.onUnsubscribeCallbacks.forEach((cb) => cb(callback));
    }
  }

  getOptionalData(): CustomSnapshotData | null {
    return this.optionalData;
  }

  getFetchSnapshotIds(): Promise<string[]> {
    return this.fetchSnapshotIds();
  }

  getSnapshotIds(): string[] {
    return this.snapshotIds;
  }

  getData(): Data | null {
    return this.data;
  }

  getNotifyEventSystem(): Function {
    return this.notifyEventSystem;
  }

  getUpdateProjectState(): Function {
    return this.updateProjectState;
  }

  getLogActivity(): Function {
    return this.logActivity;
  }

  getTriggerIncentives(): Function {
    return this.triggerIncentives;
  }

  initialData(data: Snapshot<T>) {
    this.state = data.state as T;
    this.notifyEventSystem(NotificationTypeEnum.SUBSCRIBER_INITIAL_DATA, {
      subscriberId: this.subscriberId,
      data: data,
    });
  }

  getName(): string {
    return this.name;
  }

  getDetermineCategory(data: Snapshot<T>): Snapshot<T> {
    return this.subscription.determineCategory(data);
  }

  async snapshots(): Promise<string> {
    try {
      // Fetch snapshot IDs asynchronously
      const snapshotIds = await this.fetchSnapshotIds();

      // Convert array of snapshot IDs to a string representation
      const snapshotIdsString = snapshotIds.join(", ");

      return snapshotIdsString;
    } catch (error) {
      console.error("Error fetching snapshot IDs:", error);
      throw new Error("Failed to fetch snapshot IDs");
    }
  }

  toSnapshotStore(
    initialState: Snapshot<T> | undefined,
    snapshotConfig: SnapshotStoreConfig<Snapshot<Data>, Data>[],
    delegate: SnapshotStoreDelegate<T>
  ): SnapshotStore<Snapshot<T>> | undefined {
    let snapshotString: string | undefined;
    if (initialState !== undefined) {
      snapshotString = initialState.id?.toString();
    }

    if (initialState && snapshotString !== undefined) {
      // Ensure initialState is defined
      const category = this.determineCategory(initialState);

      const delegateFunction: SnapshotStoreSubset<Snapshot<T>> = {
        onSnapshot: (
          snapshot: Snapshot<Snapshot<T>>,
          config: SnapshotStoreConfig<Snapshot<Data>, Data>[]
        ) => {
          delegate(snapshot.data as Snapshot<T>, initialState, config);
        },
        snapshotId: "",
        taskIdToAssign: undefined,
        addSnapshot: addSnapshot,
        addSnapshotSuccess: addSnapshotSuccess,
        updateSnapshot: updateSnapshot as (
          snapshotId: string,
          data: SnapshotStore<Snapshot<T>>,
          events: Record<string, CalendarEvent[]>,
          snapshotStore: SnapshotStore<Snapshot<T>>,
          dataItems: RealtimeDataItem[],
          newData: T | Data,
          payload: UpdateSnapshotPayload<any>
        ) => void,
        removeSnapshot: removeSnapshot,
        clearSnapshots: clearSnapshots,
        createSnapshot: createSnapshot,
        createSnapshotSuccess: createSnapshotSuccess,
        createSnapshotFailure: createSnapshotFailure,
        // updateSnapshots: updateSnapshots,
        // updateSnapshotSuccess: updateSnapshotSuccess,
        // updateSnapshotFailure: updateSnapshotFailure,
        // updateSnapshotsSuccess: updateSnapshotsSuccess,
        // updateSnapshotsFailure: updateSnapshotsFailure,
        // initSnapshot: initSnapshot,
        // takeSnapshot: takeSnapshot,
        // takeSnapshotSuccess: takeSnapshotSuccess,
        // takeSnapshotsSuccess: takeSnapshotsSuccess,
        // configureSnapshotStore: configureSnapshotStore,
        // getData: this.getData,
        // flatMap: flatMap,
        // setData: setData,
        // getState: getState,
        // setState: setState,
        // validateSnapshot: validateSnapshot,
        // handleSnapshot: handleSnapshot,
        // handleActions: handleActions,
        // setSnapshot: setSnapshot,
        // setSnapshots: setSnapshots,
        // clearSnapshot: clearSnapshot,
        // mergeSnapshots: mergeSnapshots,
        // reduceSnapshots: reduceSnapshots,
        // sortSnapshots: sortSnapshots,
        // filterSnapshots: filterSnapshots,
        // mapSnapshots: mapSnapshots,
        // findSnapshot: findSnapshot,
        // getSubscribers: getSubscribers,
        // notify: notify,
        // notifySubscribers: notifySubscribers,
        // subscribe: subscribe,
        // unsubscribe: unsubscribe,
        // fetchSnapshot: fetchSnapshot,
        // fetchSnapshotSuccess: fetchSnapshotSuccess,
        // fetchSnapshotFailure: fetchSnapshotFailure,
        // getSnapshot: getSnapshot,
        // getSnapshots: getSnapshots,
        // getAllSnapshots: getAllSnapshots,
        // generateId: generateId,
        // batchFetchSnapshots: batchFetchSnapshots,
        // batchTakeSnapshotsRequest: batchTakeSnapshotsRequest,
        // batchUpdateSnapshotsRequest: batchUpdateSnapshotsRequest,
        // batchFetchSnapshotsSuccess: batchFetchSnapshotsSuccess,
        // batchFetchSnapshotsFailure: batchFetchSnapshotsFailure,
        // batchUpdateSnapshotsSuccess: batchUpdateSnapshotsSuccess,
        // batchUpdateSnapshotsFailure: batchUpdateSnapshotsFailure,
        // batchTakeSnapshot: batchTakeSnapshot
      };

      return new SnapshotStore<Snapshot<T>>(
        null,
        category,
        new Date(),
        type,
        initialState,
        snapshotConfig,
        subscribeToSnapshots,
        delegateFunction
      );
    }

    return undefined;
  }

  private determineCategory(initialState: Snapshot<T>): string {
    if (initialState instanceof YourSpecificSnapshotType) {
      return "SpecificCategory";
    } else {
      return "DefaultCategory";
    }
  }

  getDeterminedCategory(data: Snapshot<T>): Snapshot<T> {
    return this.subscription.determineCategory(data);
  }

  getId(): string {
    return this.id;
  }

  async processNotification(
    id: string,
    message: string,
    snapshotContent: Snapshot<Data> | T,
    date: Date,
    type: NotificationType,
    store: SnapshotStore<T>
  ): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const snapshotData: Snapshot<T> = {
        id,
        category: "subscriberCategory",
        content: snapshotContent!.toString(),
        data: snapshotContent as T,
        type,
        store: store,
      };
      try {
        if (this.notify) {
          this.notify(snapshotData);
        }
        if (sendNotification) {
          sendNotification(NotificationTypeEnum.DataLoading);
        }
        resolve();
      } catch (error: any) {
        console.error("Error occurred:", error);
        reject(error);
      }
    });
  }

  receiveSnapshot(snapshot: T): void {
    this.state = snapshot;
    console.log(`Subscriber ${this.id} received snapshot:`, snapshot);
    this.notifyEventSystem({
      type: "SNAPSHOT_RECEIVED",
      subscriberId: this.id,
      snapshot,
    });
    this.updateProjectState(this.id, snapshot);
    this.logActivity({
      subscriberId: this.id,
      action: "RECEIVED_SNAPSHOT",
      details: snapshot,
    });
    this.triggerIncentives(this.id, snapshot);
  }

  getState(): T | null {
    return this.state ?? null;
  }

  onError(callback: (error: Error) => void) {
    this.onErrorCallbacks.push(callback);
  }

  getSubscriberId(): string {
    return this.subscriberId;
  }

  getSubscriptionId?(): string {
    return this.subscription.getId ? this.subscription.getId() : "";
  }

  getSubscriberType?(): SubscriberTypeEnum | undefined {
    return this.subscription?.getPlanName
      ? this.subscription.getPlanName()
      : undefined;
  }

  onUnsubscribe(callback: (callback: (data: Snapshot<T>) => void) => void) {
    this.onUnsubscribeCallbacks.push(callback);
  }

  onSnapshot(callback: (snapshot: Snapshot<T>) => void | Promise<void>) {
    this.onSnapshotCallbacks.push(callback);
  }

  onSnapshotError(callback: (error: Error) => void) {
    this.onErrorCallbacks.push(callback);
  }

  onSnapshotUnsubscribe(
    callback: (callback: (data: Snapshot<T>) => void) => void
  ) {
    this.onUnsubscribeCallbacks.push(callback);
  }

  triggerOnSnapshot(snapshot: Snapshot<T>) {
    this.onSnapshotCallbacks.forEach((callback) => callback(snapshot));
  }

  notify?(data: Snapshot<T>) {
    this.subscribers.forEach((callback) => callback(data));
    sendNotification(NotificationTypeEnum.DataLoading);
  }

  static createSubscriber<T extends CustomSnapshotData | undefined>(
    id: string,
    name: string,
    subscription: Subscription,
    subscriberId: string,
    notifyEventSystem: Function,
    updateProjectState: Function,
    logActivity: Function,
    triggerIncentives: Function,
    data: T | null = null
  ) {
    return new Subscriber<T>(
      id,
      name,
      subscription,
      subscriberId,
      notifyEventSystem,
      updateProjectState,
      logActivity,
      triggerIncentives,
      data
    );
  }
}

function notifyEventSystem(event: {
  type: string;
  subscriberId: string;
  snapshot: any;
}) {
  console.log(
    `Event system notified: ${event.type} for subscriber ${event.subscriberId}`
  );
}

function updateProjectState(subscriberId: string, snapshot: any) {
  console.log(`Project state updated for subscriber ${subscriberId}`);
}

function logActivity(activity: {
  subscriberId: string;
  action: string;
  details: any;
}) {
  console.log(
    `Activity logged: ${activity.action} by subscriber ${activity.subscriberId}`
  );
}

function triggerIncentives(subscriberId: string, snapshot: any) {
  console.log(`Incentives triggered for subscriber ${subscriberId}`);
}

const payload: Payload = {
  error: "Error occurred",
  meta: {
    id: "1",
    name: "Subscriber Name",
    timestamp: new Date(),
    type: NotificationTypeEnum.DataLoading,
    startDate: new Date(),
    endDate: new Date(),
    status: NotificationStatus.ERROR,
    isSticky: false,
    isDismissable: false,
    isClickable: false,
    isClosable: false,
    isAutoDismiss: false,
    isAutoDismissable: false,
    isAutoDismissOnNavigation: false,
    isAutoDismissOnAction: false,
    isAutoDismissOnTimeout: false,
    isAutoDismissOnTap: false,
  },
};

const subscriber = new Subscriber<CustomSnapshotData>(
  payload.meta.id,
  // Assuming payload.name is a string, replace with your actual data structure
  payload.meta.name,
  {
    subscriberId: "1",
    subscriberType: SubscriberTypeEnum.STANDARD,
    subscriptionType: SubscriptionTypeEnum.PortfolioUpdates,
    getPlanName: () => SubscriberTypeEnum.STANDARD,
    portfolioUpdates: () => {},
    tradeExecutions: () => {},
    triggerIncentives: () => {},
    marketUpdates: () => {},
    determineCategory: (data: any) => data.category,
    communityEngagement: () => {},
    unsubscribe: () => {},
    portfolioUpdatesLastUpdated: {} as ModifiedDate,
    getId: () => "1",
  },
  "subscriberId",
  notifyEventSystem,
  updateProjectState,
  logActivity,
  triggerIncentives
);

const sampleSnapshot: CustomSnapshotData = {
  timestamp: new Date().toISOString(),
  value: 42,
};

subscriber.receiveSnapshot(sampleSnapshot);

console.log("Subscriber state:", subscriber.getState());

export { Subscriber, subscriber };
