import * as snapshotApi from '@/app/api/SnapshotApi';
import { addSnapshot } from "@/app/api/SnapshotApi";
import { StructuredMetadata } from '@/app/configs/StructuredMetadata';
import { CategoryProperties } from '@/app/pages/personas/ScenarioBuilder';
import { ModifiedDate } from "../documents/DocType";
import {
  SnapshotStoreOptions,
  convertSnapshotToContent
} from "../hooks/useSnapshotManager";
import { Content } from '../models/content/AddContent';
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
  Snapshots,
  UpdateSnapshotPayload,
  createSnapshotOptions,
} from "../snapshots/LocalStorageSnapshotStore";
import { K, SnapshotStoreConfig } from "../snapshots/SnapshotConfig";
import SnapshotStore, { SnapshotStoreSubset } from "../snapshots/SnapshotStore";
import { snapshot } from "../snapshots/snapshot";
import {
  addSnapshotSuccess,
  createInitSnapshot,
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
  convertMapToSnapshot,
  convertSnapshotToStore
} from "../typings/YourSpecificSnapshotType";
import { isSnapshotStoreConfig } from '../utils/snapshotUtils';
import { sendNotification } from "./UserSlice";

type SnapshotStoreDelegate<T extends BaseData> = (
  snapshot: Snapshot<T, K>,
  initialState: Snapshot<T, K>,
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

function convertSnapshotToSpecificType<T extends BaseData, K extends BaseData>(
  snapshot: Snapshot<T, K>
): Snapshot<T, K> {
  // Define a new Map to store the converted data
  const newData = new Map<string, Snapshot<T, K>>();
  
  // Ensure that the data property is a Map and iterate over it
  if (snapshot.data instanceof Map) {
    snapshot.data.forEach((value: Snapshot<T, K>, key: string) => {
      if (typeof value === 'object' && value !== null) {
        // Use type assertion to convert the value to Snapshot<T, K>
        newData.set(key, value);
      }
    });
  }

  // Convert the store property if it exists
  const newStore = snapshot.store ? convertSnapshotStore<T, K>(snapshot.store as SnapshotStore<T, K>) : null;

  // Handle the case where snapshotItems might be undefined
  const snapshotItems = snapshot.snapshotItems ?? [];
  const mappedSnapshotItems = snapshotItems.map(
    (item: Snapshot<T, K>) => convertSnapshotToSpecificType<T, K>(item)
  );

  // Return the new snapshot with the converted data and correctly typed store
  return {
    ...snapshot,
    data: newData,
    store: newStore,
    snapshotItems: mappedSnapshotItems,
  };
}


function convertSnapshotStore<T extends BaseData, K extends BaseData = T>(store: SnapshotStore<T, K>): SnapshotStore<T, K> {
  // Get the snapshot items array
  const snapshotItems = store.getSnapshotItems();
  
  // Convert items in the snapshot items array
  const newSnapshotItems = snapshotItems.map(item => {
    if (isSnapshotStoreConfig(item)) {
      return convertSnapshotStoreConfig(item) as SnapshotStoreConfig<T, K>;
    } else {
      return item as unknown as Snapshot<T, K>;
    }
  });

  const snapshotStoreIterator = store.getDataStore();

  return {
    ...store,
    snapshotItems: newSnapshotItems,
    getSnapshotItems: () => newSnapshotItems,
    initialState: store.initializedState,
    nestedStores: store.nestedStores,
    dataStoreMethods: store.dataStoreMethods,
    delegate: store.delegate,
    events: store.events,
    getData: store.getData,
    getDataStore: store.getDataStore,
    addSnapshotItem: store.addSnapshotItem,
    addSnapshotItem, 
    addNestedStore: store.addNestedStore, 
    defaultSubscribeToSnapshots: store.defaultSubscribeToSnapshots, 
    defaultCreateSnapshotStores: store.defaultCreateSnapshotStores,
    
    createSnapshotStores: store.createSnapshotStores, 
    subscribeToSnapshots: store.subscribeToSnapshots, 
    transformSubscriber: store.transformSubscriber, 
    transformDelegate: store.transformDelegate,
    
    initializedState: store.initializedState, 
    transformedDelegate: store.transformedDelegate, 
    getAllKeys: store.getAllKeys, 
    mapSnapshot: store.mapSnapshot,
    
    getAllItems: store.getAllItems, 
    addData: store.addData, 
    addDataStatus: store.addDataStatus, 
    removeData: store.removeData,
    
    updateData: store.updateData, 
    updateDataTitle: store.updateDataTitle, 
    updateDataDescription: store.updateDataDescription, 
    updateDataStatus: store.updateDataStatus,
    
    addDataSuccess: store.addDataSuccess, 
    getDataVersions: store.getDataVersions, 
    updateDataVersions: store.updateDataVersions, 
    getBackendVersion: store.getBackendVersion,
    
    getFrontendVersion: store.getFrontendVersion, 
    fetchData: store.fetchData, 
    defaultSubscribeToSnapshot: store.defaultSubscribeToSnapshot, 
    handleSubscribeToSnapshot: store.handleSubscribeToSnapshot,
    
    removeItem: store.removeItem, 
    getSnapshot: store.getSnapshot, 
    getSnapshotSuccess: store.getSnapshotSuccess, 
    getSnapshotId: store.getSnapshotId,
    
    getItem: store.getItem, 
    setItem: store.setItem, 
    addSnapshotFailure: store.addSnapshotFailure, 
    addSnapshotSuccess: store.addSnapshotSuccess,
    
    compareSnapshotState: store.compareSnapshotState, 
    deepCompare: store.deepCompare, 
    shallowCompare: store.shallowCompare, 
    getDataStoreMethods: store.getDataStoreMethods, 
    
    getDelegate: store.getDelegate, 
    determineCategory: store.determineCategory, 
    determinePrefix: store.determinePrefix, 
    updateSnapshot: store.updateSnapshot,
    
    updateSnapshotSuccess: store.updateSnapshotSuccess, 
    updateSnapshotFailure: store.updateSnapshotFailure, 
    removeSnapshot: store.removeSnapshot, 
    clearSnapshots: store.clearSnapshots,
    
    addSnapshot: store.addSnapshot, 
    createInitSnapshot: store.createInitSnapshot, 
    createSnapshotSuccess: store.createSnapshotSuccess, 
    setSnapshotSuccess: store.setSnapshotSuccess, 
    
    setSnapshotFailure: store.setSnapshotFailure, 
    createSnapshotFailure: store.createSnapshotFailure, 
    updateSnapshots: store.updateSnapshots, 
    updateSnapshotsSuccess: store.updateSnapshotsSuccess,
    
    updateSnapshotsFailure: store.updateSnapshotsFailure, 
    initSnapshot: store.initSnapshot, 
    takeSnapshot: store.takeSnapshot, 
    takeSnapshotSuccess: store.takeSnapshotSuccess,
    
    takeSnapshotsSuccess: store.takeSnapshotsSuccess, 
    configureSnapshotStore: store.configureSnapshotStore, 
    flatMap: store.flatMap, 
    setData: store.setData,
    
    getState: store.getState, 
    setState: store.setState, 
    validateSnapshot: store.validateSnapshot, 
    handleSnapshot: store.handleSnapshot,
    
    handleActions: store.handleActions, 
    setSnapshot: store.setSnapshot, 
    transformSnapshotConfig: store.transformSnapshotConfig, 
    setSnapshotData: store.setSnapshotData,
    
    setSnapshots: store.setSnapshots, 
    clearSnapshot: store.clearSnapshot, 
    mergeSnapshots: store.mergeSnapshots, 
    reduceSnapshots: store.reduceSnapshots,
    
    sortSnapshots: store.sortSnapshots, 
    filterSnapshots: store.filterSnapshots, 
    mapSnapshots: store.mapSnapshots, 
    findSnapshot: store.findSnapshot,
    
    getSubscribers: store.getSubscribers, 
    notify: store.notify, 
    notifySubscribers: store.notifySubscribers, 
    subscribe: store.subscribe, 
    unsubscribe: store.unsubscribe,
    
    fetchSnapshot: store.fetchSnapshot, 
    fetchSnapshotSuccess: store.fetchSnapshotSuccess, 
    fetchSnapshotFailure: store.fetchSnapshotFailure,
    
    getSnapshots: store.getSnapshots, 
    getAllSnapshots: store.getAllSnapshots, 
    generateId: store.generateId, 
    batchFetchSnapshots: store.batchFetchSnapshots,
    
    batchTakeSnapshotsRequest: store.batchTakeSnapshotsRequest, 
    batchUpdateSnapshotsRequest: store.batchUpdateSnapshotsRequest, 
    batchFetchSnapshotsSuccess: store.batchFetchSnapshotsSuccess, 
    batchFetchSnapshotsFailure: store.batchFetchSnapshotsFailure,
    
    batchUpdateSnapshotsSuccess: store.batchUpdateSnapshotsSuccess, 
    batchUpdateSnapshotsFailure: store.batchUpdateSnapshotsFailure, 
    batchTakeSnapshot: store.batchTakeSnapshot, 
    handleSnapshotSuccess: store.handleSnapshotSuccess,
    [Symbol.iterator]: snapshotStoreIterator,
    snapshotIds: store.snapshotIds,
    isSnapshotStoreConfig: store.isSnapshotStoreConfig,
    getSnapshotIds: store.getSnapshotIds
  } as SnapshotStore<T, K>;
}




const createSnapshotConfig = <T extends BaseData, K extends BaseData>(
  snapshotStore: SnapshotStore<T, K>,
  snapshotContent?: Snapshot<T, K>
): SnapshotStoreConfig<T, K> => {
  const content = snapshotContent ? convertSnapshotToContent(snapshotContent) : undefined;

  return {
    snapshotStore,
    snapshotId: "initial-id",
    snapshotCategory: "initial-category",
    snapshotSubscriberId: "initial-subscriber",
    timestamp: new Date(),
    snapshotContent: content,
    id: null,
    data: {} as T,
    initialState: null,
    handleSnapshot: (
      snapshotId: string,
      snapshot: Snapshot<T, K> | null,
      snapshots: Snapshots<T>,
      type: string, 
      event: Event
    ) => {
      if (snapshot) {
        console.log(`Handling snapshot with ID: ${snapshotId}`);
      } else {
        console.log(`No snapshot to handle for ID: ${snapshotId}`);
      }
      return null;
    },
    state: null,
    snapshots: [],
    subscribers: [],
    category: "default-category", // Adjust if needed
    getSnapshotId: () => "default-id", // Provide an appropriate implementation
    snapshot: async <T extends BaseData, K extends BaseData>(
      id: string,
      snapshotId: string | null,
      snapshotData: Snapshot<T, K>,
      category: string | CategoryProperties | undefined,
      callback: (snapshot: Snapshot<T, K>) => void,
      snapshotContainer?: SnapshotStore<T, K> | Snapshot<T, K> | null,
      snapshotStoreConfigData?: SnapshotStoreConfig<T, K>,
    ): Promise<{ snapshot: Snapshot<T, K> | null}> => {
      // Create or obtain a SnapshotStore instance as needed
      /* obtain or create your snapshot object */

      const snapshot: Snapshot<T, K> | null = snapshotStoreConfigData?.createSnapshot?.(
        id,
        snapshotData,
        category,
        callback

      ) ?? null;

      if (snapshot) {
        // Call the provided callback function with the snapshot
        callback(snapshot);

        // Convert the snapshot to a SnapshotStore
        const snapshotStore = convertSnapshotToStore(snapshot);

             // Ensure that createSnapshotOptions returns the correct type
      const options: SnapshotStoreOptions<T, K> = createSnapshotOptions<T, K>(snapshotStore);

      const config = Array.isArray(options.snapshotStoreConfig)
        ? options.snapshotStoreConfig[0]
        : options.snapshotStoreConfig;

      // Ensure that SnapshotStore is correctly instantiated
      const newSnapshotStore = new SnapshotStore<T, K>(options, config);

      // Return the result with the snapshot and the snapshotStore
      return {
        snapshot: snapshot,
        snapshotStore: newSnapshotStore,
      };
    } else {
      // Handle the case where the snapshot is null
      console.error('Failed to create snapshot');
      return {
        snapshot: null,
      };
    }
    }, // Adjust if needed
    createSnapshot: () => ({
      id: "default-id",
      data: new Map<string, Snapshot<T, K>>(),
      timestamp: new Date(),
      category: "default-category",
      subscriberId: "default-subscriber-id",
      meta: {} as K,
      events: {} as CombinedEvents<T, K>
      // Adjust as needed
    }) // Provide an appropriate implementation
    // Include other required properties and methods
  };
};


function convertSnapshotStoreConfig<T extends BaseData, K extends BaseData>(
  config: SnapshotStoreConfig<Data, Data>
): SnapshotStoreConfig<T, K> {
  // Map or transform the fields as needed to match T and K types
  return {
    ...config,
    data: config.data as T,
    snapshotContent: config.snapshotContent as K,
    // Ensure all other fields are properly converted or mapped
  };
}


interface SubscriberCallback<T extends BaseData, K extends BaseData> {
  id: string;
  _id: string;
  handleCallback: (data: Snapshot<T, K>) => void;
  snapshotCallback: (data: Snapshot<T, K>) => void; // Ensure this is a function type
} 



class Subscriber<T extends BaseData, K extends BaseData> {
   
  private _id: string | undefined;
  private readonly name: string;
  private subscription: Subscription<T, K>;

  private subscriberId: string;
  private subscribersById: Map<string, Subscriber<T, K>> | undefined = new Map();
  private subscribers: SubscriberCallback<T, K>[] = []; // Use the SubscriberCallback type here
  private onSnapshotCallbacks: ((snapshot: Snapshot<T, K>) => void)[] = [];
  private onErrorCallbacks: ((error: Error) => void)[] = [];
  private onUnsubscribeCallbacks: ((
    callback: (data: Snapshot<T, K>) => void
  ) => void)[] = [];
  private state?: T | null = null;
  private callbackFunction?: (data: Snapshot<T, K>) => void;

  private notifyEventSystem: Function | undefined;
  private updateProjectState: Function | undefined;
  private logActivity: Function | undefined;
  private triggerIncentives: Function | undefined;
  private optionalData: CustomSnapshotData | null;
  public data: Partial<SnapshotStore<T, K>> | undefined = {};
  private email: string = "";
  private enabled= false;
  private tags: string[] = []
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
    subscription: Subscription<T, K>,
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

 
  
  getId(): string | undefined{
    return this.id
  }
  
  set id(value: string | undefined) {
    this.id = value;
  }
  
  get getEnabled(): boolean {
    return this.enabled;
  }

  get getTags(): string[] {
    if (this.tags.length === 0) {
      return this.tags;
     }
     return this.tags;
  }

  get defaultSubscribeToSnapshots(): string[] {
    return this.snapshotIds;
  }

  set defaultSubscribeToSnapshots(value: string[]) {
    this.snapshotIds = value;
  }

  get subscribeToSnapshots(): string[] {
    return this.snapshotIds;
  }

  get getSubscribers(): SubscriberCallback<T, K>[] {
    return this.subscribers;
  }

  get transformSubscribers(): SubscriberCallback<T, K>[]{
    return this.subscribers;
  }

  set setSubscribers(subscribers: SubscriberCallback<T, K>[]) {
    this.subscribers = subscribers;
  }

  get getOnSnapshotCallbacks(): ((snapshot: Snapshot<T, K>) => void)[] {
    return this.onSnapshotCallbacks;
  }

  set setOnSnapshotCallbacks(callbacks: ((snapshot: Snapshot<T, K>) => void)[]) {
    this.onSnapshotCallbacks = callbacks;
  }

  get getOnErrorCallbacks(): ((error: Error) => void)[] {
    return this.onErrorCallbacks;
  }

  set setOnErrorCallbacks(callbacks: ((error: Error) => void)[]) {
    this.onErrorCallbacks = callbacks;
  }

  get getOnUnsubscribeCallbacks(): ((
    callback: (data: Snapshot<T, K>) => void
  ) => void)[] {
    return this.onUnsubscribeCallbacks;
  }

  set setOnUnsubscribeCallbacks(callbacks: ((
    callback: (data: Snapshot<T, K>) => void
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
  handleCallback(data: Snapshot<T, K>): void {
    if (this.callbackFunction) {
      this.callbackFunction(data);
    } else {
      console.warn("No callback function provided.");
    }
  }

  snapshotCallback(data: Snapshot<T, K>): void {
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

  subscribe(callback: (data: Snapshot<T, K>) => void) {
    this.subscribers.push(callback);
  }

  unsubscribe(callback: (data: Snapshot<T, K>) => void) {
    const index = this.subscribers.indexOf(callback);
    if (index !== -1) {
      this.subscribers.splice(index, 1);
      this.onUnsubscribeCallbacks.forEach((cb) => cb(callback));
    }
  }

  getTransformSubscribers(): ((data: Snapshot<T, K>) => void)[] {
    return this.transformSubscribers;
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
  async getDefaultSubscribeToSnapshots(
    snapshotIds: string[]
  ): Promise<Partial<SnapshotStore<T, K>> | null> {
    try {
      // Fetch the latest snapshot IDs
      const newSnapshotIds = await this.fetchSnapshotIds();
      console.log("newSnapshotIds", newSnapshotIds);
      console.log("this.snapshotIds", this.snapshotIds);
  
      // Assuming you process newSnapshotIds and this.snapshotIds to form the result
      const result: Partial<SnapshotStore<T, K>> = {
        snapshotIds: newSnapshotIds, // Example property
        // Add other properties as necessary
      };
  
      return result;
    } catch (error) {
      console.error("Failed to fetch new data:", error);
      return null;
    }
  }
  

  async getSubscribeToSnapshots(): Promise<Partial<SnapshotStore<T, K>> | null> {
    try {
      // Fetch the latest snapshot IDs
      const newSnapshotIds = await this.fetchSnapshotIds();
      console.log("newSnapshotIds", newSnapshotIds);
      console.log("this.snapshotIds", this.snapshotIds);
      // Process the new snapshot IDs (if needed)
      this.snapshotIds = newSnapshotIds;
      // Optionally, fetch and process the latest snapshots based on the new IDs
      const newSnapshots: Snapshot<T, K>[] = await Promise.all(
        newSnapshotIds.map((id): Promise<Snapshot<T, K>> => {
          return snapshotApi.fetchSnapshotById(id)
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
    // Return the processed new data
    
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

  initialData(data: Snapshot<T, K>) {
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

  getDetermineCategory(data: Snapshot<T, K>): Snapshot<T, K> {
    return this.subscription.determineCategory(data);
  }

 
// Assuming the fetchSnapshotById on `this.subscription` accepts a single object argument
fetchSnapshotById(userId: string, snapshotId: string): Promise<Snapshot<T, K>> {
  return new Promise((resolve, reject) => {
    if (this.subscription && typeof this.subscription.fetchSnapshotById === 'function') {
      // Define a way to handle the asynchronous behavior
      
     
      const callback: FetchSnapshotByIdCallback = {
        onSuccess: (snapshot: Snapshot<BaseData, K>) => {
          const specificSnapshot = convertSnapshotToSpecificType<T, K>(snapshot);
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
            const callback = (snapshot: Snapshot<T, K>) => resolve(snapshot);
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
    initialState: Snapshot<T, K> | undefined,
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
          delegate(snapshot.data as Snapshot<T, K>, initialState, config);
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
        createInitSnapshot: createInitSnapshot,
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

  private determineCategory(initialState: Snapshot<T, K>): string {
    if (initialState instanceof YourSpecificSnapshotType) {
      return "SpecificCategory";
    } else {
      return "DefaultCategory";
    }
  }

  getDeterminedCategory(data: Snapshot<T, K>): string {
    return this.subscription.determineCategory(data);
  }

  // Updated processNotification function
  async processNotification(
    id: string,
    message: string,
    snapshotContent: Map<string, Snapshot<T, K>> | null | undefined,
    date: Date,
    type: NotificationType,
    store: SnapshotStore<T, K>
  ): Promise<void> {
    const content = snapshotContent
      ? convertMapToSnapshot(snapshotContent)
      : null;
    return new Promise<void>((resolve, reject) => {
      const snapshotData: Snapshot<T, K> = {
        id,
        message: message,
        initialState: content as Snapshot<T, K> | SnapshotStore<T, K> | null | undefined,
        date: date,
        category: "subscriberCategory",
        content: content ? (content.content as string | Content<T> | undefined) : undefined,
        data: content ? content.data as T | Map<string, Snapshot<T, K>> | null | undefined : new Map<string, Snapshot<T, K>>(),
        type,
        store: store,
        unsubscribe: () => {
          console.log("unsubscribe");
        },
        fetchSnapshot: (
          snapshotId: string,
          payload: FetchSnapshotPayload<K>,
          snapshotStore: SnapshotStore<T, K>,
          payloadData: T | Data,
        ) => {
          console.log("fetchSnapshot");
        },
        handleSnapshot: () => {
          console.log("handleSnapshot");
        },
        meta: content ? content.meta as  Map<string, Snapshot<StructuredMetadata, K>> | undefined,
        events: content ? content.events as Record<string, CalendarEvent[]> | undefined : undefined,
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

  getState(prop: any): T | null {
    return this.state ?? null;
  }

  setEvent(prop: any, value: any): void {
    this.state = value;
    console.log(`Subscriber ${this.id} set event:`, prop, value);
    this.updateProjectState?.(this.id, value);
    this.logActivity?.({
      subscriberId: this.subscriberId,
      action: "SET_EVENT",
      details: { prop, value },
    });
    this.triggerIncentives?.(this.id, value);
    this.notifyEventSystem?.({
      type: "EVENT_SET",
      subscriberId: this.subscriberId,

    });
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

  getSubscription(): Subscription<T, K> {
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

  onUnsubscribe(callback: (callback: (data: Snapshot<T, K>) => void) => void) {
    this.onUnsubscribeCallbacks.push(callback);
  }

  onSnapshot(callback: (snapshot: Snapshot<T, K>) => void | Promise<void>) {
    this.onSnapshotCallbacks.push(callback);
  }

  onSnapshotError(callback: (error: Error) => void) {
    this.onErrorCallbacks.push(callback);
  }

    onSnapshotUnsubscribe(
      callback: (callback: (data: Snapshot<T, K>) => void) => void
    ) {
      this.onUnsubscribeCallbacks.push(callback);
    }

    triggerOnSnapshot(snapshot: Snapshot<T, K>) {
      this.onSnapshotCallbacks.forEach((callback) => callback(snapshot));
    }

  notify?(data: Snapshot<T, K>) {
    this.subscribers.forEach((callback) => {
      // if (typeof callback === 'function') {
        callback(data);
      // }
    });
    if (typeof sendNotification === 'function') {
      sendNotification(NotificationTypeEnum.DataLoading);
    }
  }

  static createSubscriber<
    T extends Data,
    K extends Data,
  >(
    id: string,
    name: string,
    subscription: Subscription<T, K>,
    subscriberId: string,
    notifyEventSystem: Function,
    updateProjectState: Function,
    logActivity: Function,
    triggerIncentives: Function,
    optionalData: T | null = null,
    data: T | null = null
  ) {
    return new Subscriber<T, K>(
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
