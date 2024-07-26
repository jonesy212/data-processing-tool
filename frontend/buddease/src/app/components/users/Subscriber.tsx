import * as snapshotApi from '@/app/api/SnapshotApi';
import { addSnapshot } from "@/app/api/SnapshotApi";
import { ModifiedDate } from "../documents/DocType";
import {
  SnapshotStoreOptions
} from "../hooks/useSnapshotManager";
import { BaseData, Data } from "../models/data/Data";
import {
  NotificationStatus,
  SubscriberTypeEnum,
  SubscriptionTypeEnum,
} from "../models/data/StatusType";
import { RealtimeDataItem } from "../models/realtime/RealtimeData";
import {
  CustomSnapshotData,
  Payload,
  Snapshot,
  UpdateSnapshotPayload,
  createSnapshotOptions,
} from "../snapshots/LocalStorageSnapshotStore";
import { K, SnapshotStoreConfig } from "../snapshots/SnapshotConfig";
import SnapshotStore, { SnapshotStoreSubset } from "../snapshots/SnapshotStore";
import { snapshot } from "../snapshots/snapshot";
import {
  addSnapshotSuccess,
  createSnapshot,
  createSnapshotFailure,
  createSnapshotSuccess,
  updateSnapshot,
  updateSnapshotFailure,
  updateSnapshotSuccess,
  updateSnapshots
} from "../snapshots/snapshotHandlers";
import {
  clearSnapshots,
  removeSnapshot,
} from "../state/redux/slices/SnapshotSlice";
import { CalendarEvent } from "../state/stores/CalendarEvent";
import { FetchSnapshotByIdCallback, Subscription } from "../subscriptions/Subscription";
import {
  NotificationType,
  NotificationTypeEnum,
} from "../support/NotificationContext";
import {
  YourSpecificSnapshotType,
  convertMapToSnapshot
} from "../typings/YourSpecificSnapshotType";
import { sendNotification } from "./UserSlice";

type SnapshotStoreDelegate<T extends BaseData> = (
  snapshot: Snapshot<T>,
  initialState: Snapshot<T>,
  snapshotConfig: SnapshotStoreConfig<BaseData, Data>[]
) => void;

const delegateFunction: SnapshotStoreDelegate<CustomSnapshotData> = (
  snapshot: Snapshot<CustomSnapshotData>,
  initialState: Snapshot<CustomSnapshotData>,
  snapshotConfig: SnapshotStoreConfig<BaseData, Data>[]
) => {
  console.log("Delegate function called with snapshot:", snapshot);
  console.log("Initial state:", initialState);
  console.log("Snapshot config:", snapshotConfig);
};

function convertSnapshotToSpecificType<T extends BaseData>(snapshot: Snapshot<BaseData, BaseData>): Snapshot<T, T> {
  // Implement the logic to convert from Snapshot<BaseData, BaseData> to Snapshot<T, T>
  const newData = new Map<string, T>();
  snapshot.data?.forEach((value, key) => {
    if (typeof value === 'object' && value !== null) {
      newData.set(key, value as T);
    }
  });

  return {
    ...snapshot,
    data: newData,
  };
}



class Subscriber<T extends BaseData, K extends BaseData> {
  getId() {
    throw new Error("Method not implemented.");
  }
  private _id: string | undefined;
  private readonly name: string;
  private subscription: Subscription<T>;

  private subscriberId: string;
  private subscribersById: Map<string, Subscriber<T, K>> = new Map();
  private subscribers: ((data: Snapshot<T>) => void)[] = [];
  private onSnapshotCallbacks: ((snapshot: Snapshot<T>) => void)[] = [];
  private onErrorCallbacks: ((error: Error) => void)[] = [];
  private onUnsubscribeCallbacks: ((
    callback: (data: Snapshot<T>) => void
  ) => void)[] = [];
  private state?: T | null = null;
  private callbackFunction?: (data: Snapshot<T, T>) => void;

  private notifyEventSystem: Function | undefined;
  private updateProjectState: Function | undefined;
  private logActivity: Function | undefined;
  private triggerIncentives: Function | undefined;
  private optionalData: CustomSnapshotData | null;
  public data: Partial<SnapshotStore<T, K>> = {};
  private email: string = "";
  private snapshotIds: string[] = [];
  private readonly payload: T | undefined;
  private async fetchSnapshotIds(): Promise<string[]> {
    // Simulate an asynchronous operation to fetch snapshot IDs
    return new Promise<string[]>((resolve, reject) => {
      setTimeout(async() => {
        // Example: Fetching snapshot IDs from an API or database
        const fetchedSnapshotIds = await snapshotApi.fetchSnapshotIds(this.id);

        // Resolve with fetched snapshot IDs
        resolve(fetchedSnapshotIds);
      }, 1000); // Simulating a delay of 1 second (adjust as needed)
    });
  }

  constructor(
    id: string,
    name: string,
    subscription: Subscription<T>,
    subscriberId: string,
    notifyEventSystem: Function,
    updateProjectState: Function,
    logActivity: Function,
    triggerIncentives: Function,
    optionalData: CustomSnapshotData | null = null,
    // data: Partial<SnapshotStore<T, K>>,
    payload: T | null = null
  ) {
    this.id = id;
    this.name = name;
    this.subscription = subscription;
    this.subscriberId = subscriberId;
    this.notifyEventSystem = notifyEventSystem;
    this.updateProjectState = updateProjectState;
    this.logActivity = logActivity;
    this.triggerIncentives = triggerIncentives;
    this.optionalData = optionalData;
    // this.data = data;
    this.payload = payload !== null ? payload : (optionalData as unknown as T);
  }

  get id(): string | undefined {
    return this._id;
  }

  set id(value: string | undefined) {
    this._id = value;
  }


  get getSubscribers(): ((data: Snapshot<T>) => void)[] {
    return this.subscribers;
  }

  set setSubscribers(subscribers: ((data: Snapshot<T>) => void)[]) {
    this.subscribers = subscribers;
  }

  get getOnSnapshotCallbacks(): ((snapshot: Snapshot<T>) => void)[] {
    return this.onSnapshotCallbacks;
  }

  set setOnSnapshotCallbacks(callbacks: ((snapshot: Snapshot<T>) => void)[]) {
    this.onSnapshotCallbacks = callbacks;
  }

  get getOnErrorCallbacks(): ((error: Error) => void)[] {
    return this.onErrorCallbacks;
  }

  set setOnErrorCallbacks(callbacks: ((error: Error) => void)[]) {
    this.onErrorCallbacks = callbacks;
  }

  get getOnUnsubscribeCallbacks(): ((
    callback: (data: Snapshot<T>) => void
  ) => void)[] {
    return this.onUnsubscribeCallbacks;
  }

  set setOnUnsubscribeCallbacks(callbacks: ((
    callback: (data: Snapshot<T>) => void
  ) => void)[]) {
    this.onUnsubscribeCallbacks = callbacks;
  }

 

  set setNotifyEventSystem(func: Function | undefined) {
    this.notifyEventSystem = func;
  }

  set setUpdateProjectState(func: Function | undefined) {
    this.updateProjectState = func;
  }

  

  set setLogActivity(func: Function | undefined) {
    this.logActivity = func;
  }

  

  set setTriggerIncentives(func: Function | undefined) {
    this.triggerIncentives = func;
  }


  set setOptionalData(data: CustomSnapshotData | null) {
    this.optionalData = data;
  }


  set setEmail(email: string) {
    this.email = email;
  }

  

  set setSnapshotIds(ids: string[]) {
    this.snapshotIds = ids;
  }

  get getPayload(): T | undefined {
    return this.payload;
  }

  // Method to handle the callback
  handleCallback(data: Snapshot<T, T>): void {
    if (this.callbackFunction) {
      this.callbackFunction(data);
    } else {
      console.warn("No callback function provided.");
    }
  }
  snapshotCallback(data: Snapshot<T, T>): void {
    console.log("Snapshot callback called with data:", data);

    // Safely assign state
    if (data.data instanceof Map) {
      // Assuming the Map's first value is the relevant data
      this.state = Array.from(data.data.values())[0] || null;
    } else {
      this.state = data.data || null;
    }

    // Provide default values for potentially undefined properties
    this.snapshotIds = data.snapshotIds || [];

    // Safely invoke functions if they are defined
    if (this.notifyEventSystem) {
      this.notifyEventSystem(data);
    }

    if (this.updateProjectState) {
      this.updateProjectState(data);
    }

    if (this.logActivity) {
      this.logActivity(data);
    }

    if (this.triggerIncentives) {
      this.triggerIncentives(data);
    }
    // Ensure subscribers and onSnapshotCallbacks are arrays
    this.subscribers.forEach((subscriber) => subscriber(data));
    this.onSnapshotCallbacks.forEach((cb) => cb(data));
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

  getData(): Partial<SnapshotStore<T, K>> | null {
    return this.data;
  }
 
  // New method to fetch and process new data
  async getNewData(): Promise<Partial<SnapshotStore<T, K>> | null> {
    try {
      // Fetch the latest snapshot IDs
      const newSnapshotIds = await this.fetchSnapshotIds();

      // Process the new snapshot IDs (if needed)
      this.snapshotIds = newSnapshotIds;

      // Optionally, fetch and process the latest snapshots based on the new IDs
      const newSnapshots: Snapshot<T, K>[] = await Promise.all(
        newSnapshotIds.map((id): Promise<Snapshot<T, K>> => {
          return  snapshotApi.fetchSnapshotById(id)
        })
      );

      // Update the subscriber's data with the new snapshots
      const newData: Partial<SnapshotStore<T, K>> = {
        ...this.data,
        snapshots: newSnapshots,
      };

      // Return the processed new data
      return newData;
    } catch (error) {
      console.error("Failed to fetch new data:", error);
      return null;
    }
  }

  getNotifyEventSystem(): Function | undefined {
    return this.notifyEventSystem;
  }

  getUpdateProjectState(): Function | undefined {
    return this.updateProjectState;
  }

  getLogActivity(): Function | undefined {
    return this.logActivity;
  }

  getTriggerIncentives(): Function | undefined {
    return this.triggerIncentives;
  }

  initialData(data: Snapshot<T>) {
    this.state = data.state as T | null | undefined;
    if (this.notifyEventSystem) {
      this.notifyEventSystem(NotificationTypeEnum.SUBSCRIBER_INITIAL_DATA, {
        subscriberId: this.subscriberId,
        data: data,
      });
    }
  }

  getName(): string {
    return this.name;
  }

  getDetermineCategory(data: Snapshot<T>): Snapshot<T> {
    return this.subscription.determineCategory(data);
  }

 
// Assuming the fetchSnapshotById on `this.subscription` accepts a single object argument
fetchSnapshotById(userId: string, snapshotId: string): Promise<Snapshot<T, T>> {
  return new Promise((resolve, reject) => {
    if (this.subscription && typeof this.subscription.fetchSnapshotById === 'function') {
      // Define a way to handle the asynchronous behavior
      
     
      const callback: FetchSnapshotByIdCallback = {
        onSuccess: (snapshot: Snapshot<BaseData, BaseData>) => {
          const specificSnapshot = convertSnapshotToSpecificType<T>(snapshot);
          resolve(specificSnapshot);
        },
        onError: (error: any) => reject(error),
      };
      try {
        // Call fetchSnapshotById with a single argument
        this.subscription.fetchSnapshotById({ userId, snapshotId });
        // If this subscription fetch method takes callback functions, 
        // ensure that these are set correctly and this method supports this callback pattern.
        this.subscription.fetchSnapshotByIdCallback?.({ userId, snapshotId },callback);
      } catch (error) {
        reject(error);
      }
    } else {
      reject(new Error("fetchSnapshotById is not defined or not a function"));
    }
  });
}

  
  
  


  async snapshots(): Promise<SnapshotStoreConfig<BaseData, Data>[]> {
    try {
      // Fetch snapshot IDs asynchronously
      const snapshotIds = await this.fetchSnapshotIds();
  
      // Fetch snapshot data based on the IDs
      const snapshotData = await Promise.all(
        snapshotIds.map(async (id: string) => {
          return new Promise((resolve, reject) => {
            // Define a way to handle the asynchronous behavior
            const callback = (snapshot: Snapshot<T, T>) => resolve(snapshot);
            const errorCallback = (error: any) => reject(error);
            // Ensure fetchSnapshotById method returns a valid promise
            const snapshot = this.fetchSnapshotById(this.email, id);
            return snapshot;
          })
        })
      );
  
      return snapshotData as SnapshotStoreConfig<BaseData, Data>[]; // Ensure the correct type is returned
    } catch (error) {
      console.error("Error fetching snapshot IDs:", error);
      throw new Error("Failed to fetch snapshot IDs");
    }
  }
  
  
  

  toSnapshotStore(
    initialState: Snapshot<T> | undefined,
    snapshotConfig: SnapshotStoreConfig<BaseData, Data>[],
    delegate: SnapshotStoreDelegate<T>
  ): SnapshotStore<T, K>[] | undefined {
    let snapshotString: string | undefined;
    if (initialState !== undefined) {
      snapshotString = initialState.id?.toString();
    }

    if (initialState && snapshotString !== undefined) {
      // Ensure initialState is defined
      const category = this.determineCategory(initialState);
      // Retrieve options for SnapshotStore initialization using the helper function
      const options: SnapshotStoreOptions<T, K> = createSnapshotOptions(snapshot as Snapshot<T, K>);

      const delegateFunction: SnapshotStoreSubset<BaseData> = {
        onSnapshot: (
          snapshot: Snapshot<BaseData>,
          config: SnapshotStoreConfig<BaseData, Data>[]
        ) => {
          delegate(snapshot.data as Snapshot<T>, initialState, config);
        },
        snapshotId: "",
        taskIdToAssign: undefined,
        addSnapshot: addSnapshot,
        addSnapshotSuccess: addSnapshotSuccess,
        updateSnapshot: updateSnapshot as (
          snapshotId: string,
          data: SnapshotStore<BaseData, any>,
          events: Record<string, CalendarEvent[]>,
          snapshotStore: SnapshotStore<BaseData, any>,
          dataItems: RealtimeDataItem[],
          newData: T | Data,
          payload: UpdateSnapshotPayload<any>
        ) => void,
        removeSnapshot: removeSnapshot,
        clearSnapshots: clearSnapshots,
        createSnapshot: createSnapshot,
        createSnapshotSuccess: createSnapshotSuccess,
        createSnapshotFailure: createSnapshotFailure,
        updateSnapshots: updateSnapshots,
        updateSnapshotSuccess: updateSnapshotSuccess,
        updateSnapshotFailure: updateSnapshotFailure,
        updateSnapshotsSuccess: updateSnapshotsSuccess,
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

      return [new SnapshotStore<T, K>(options)];
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

  // Updated processNotification function
  async processNotification(
    id: string,
    message: string,
    snapshotContent: Map<string, T> | null | undefined,
    date: Date,
    type: NotificationType,
    store: SnapshotStore<T, T>
  ): Promise<void> {
    const content = snapshotContent
      ? convertMapToSnapshot(snapshotContent)
      : undefined;
    return new Promise<void>((resolve, reject) => {
      const snapshotData: Snapshot<BaseData, BaseData> = {
        id,
        message: message,
        initialState: content,
        date: date,
        category: "subscriberCategory",
        content: content ? content.content : "",
        data: content ? content.data : new Map<string, BaseData>(),
        type,
        store: store as unknown as SnapshotStore<BaseData, BaseData>, // Ensure this cast is safe
      };

      // Handle the promise resolution
      resolve();
    });
  }

  receiveSnapshot(snapshot: T): void {
    this.state = snapshot;
    console.log(`Subscriber ${this.id} received snapshot:`, snapshot);
    this.notifyEventSystem?.({
      type: "SNAPSHOT_RECEIVED",
      subscriberId: this.id,
      snapshot,
    });
    this.updateProjectState?.(this.id, snapshot);
    this.logActivity?.({
      subscriberId: this.id,
      action: "RECEIVED_SNAPSHOT",
      details: snapshot,
    });
    this.triggerIncentives?.(this.id, snapshot);
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

  getSubscribersById(): Map<string, Subscriber<T, K>> {
    return this.subscribersById;
  }

  getSubscribersWithSubscriptionPlan(
    userId: string,
    snapshotId: string
  ): SubscriberTypeEnum | undefined {
    return this.subscription?.getPlanName
      ? this.subscription.getPlanName({ userId, snapshotId })
      : undefined;
  }

  getSubscription(): Subscription<T> {
    return this.subscription;
  }

  getSubscriptionId?(): string {
    return this.subscription.getId ? this.subscription.getId() : "";
  }

  getSubscriberType?(
    userId: string,
    snapshotId: string
  ): SubscriberTypeEnum | undefined {
    return this.subscription?.getPlanName
      ? this.subscription.getPlanName({ userId, snapshotId })
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

  static createSubscriber<
    T extends CustomSnapshotData | undefined,
    K extends BaseData
  >(
    id: string,
    name: string,
    subscription: Subscription<T>,
    subscriberId: string,
    notifyEventSystem: Function,
    updateProjectState: Function,
    logActivity: Function,
    triggerIncentives: Function,
    optionalData: T | null = null,
    data: T | null = null
  ) {
    return new Subscriber<BaseData, K>(
      id,
      name,
      subscription,
      subscriberId,
      notifyEventSystem,
      updateProjectState,
      logActivity,
      triggerIncentives,
      optionalData,
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

export const payload: Payload = {
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
    optionalData: {},
    data: {},
  },
};

const subscription = {
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
};

const subscriber = new Subscriber<BaseData, K>(
  payload.meta.id,
  payload.meta.name,
  subscription,
  subscription.getId ? subscription.getId() : "defaultSubscriberId", // Ensure subscriberId is correctly obtained
  notifyEventSystem,
  updateProjectState,
  logActivity,
  triggerIncentives,
  payload.meta.optionalData,
  payload.meta.data
);

const sampleSnapshot: CustomSnapshotData = {
  timestamp: new Date().toISOString(),
  value: "42",
};

subscriber.receiveSnapshot(sampleSnapshot);

console.log("Subscriber state:", subscriber.getState());

export { Subscriber, subscriber };
