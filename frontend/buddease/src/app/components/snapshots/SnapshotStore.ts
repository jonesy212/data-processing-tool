import {
  NotificationType,
  NotificationTypeEnum,
  useNotification,
} from "@/app/components/support/NotificationContext";
import { Message } from "@/app/generators/GenerateChatInterfaces";
import { retrieveSnapshotData } from "@/app/utils/retrieveSnapshotData";
import { isEqual } from "lodash";
import { MutableRefObject, useRef } from "react";
import { useAuth } from "../auth/AuthContext";
import { handleSorting } from "../event/DynamicEventHandlerExample";
import { Data } from "../models/data/Data";
import { SortingType } from "../models/data/StatusType";
import { showErrorMessage, showToast } from "../models/display/ShowToast";
import { Task } from "../models/tasks/Task";
import { Member } from "../models/teams/TeamMembers";
import {
  SnapshotState,
  batchFetchSnapshotsFailure,
} from "../state/redux/slices/SnapshotSlice";
import NOTIFICATION_MESSAGES from "../support/NotificationMessages";
import { notificationStore } from "../support/NotificationProvider";
import { Subscriber } from "../users/Subscriber";
import SnapshotStoreConfig, { snapshotConfig } from "./SnapshotConfig";
import { Tag } from "../models/tracker/Tag";
import { initSnapshot } from "./snapshotHandlers";
import { Subscription } from "../subscriptions/Subscription";

const { notify } = useNotification();

// Define a helper function to create a typed snapshot object
interface Payload {
  error: string;
}

type Snapshots = Snapshot<Data>[];

interface Snapshot<T> {
  length?: number;
  category: any;
  id?: string;
  timestamp: Date | undefined;
  content: SnapshotStoreConfig<SnapshotStore<Snapshot<Data>>> | undefined;
  tags?: Tag[];
  data?: T | undefined;
}


const createTypedSnapshot = (
  taskId: string,
  tasks: Task[],
  notify: (
    id: string,
    message: string,
    content: any,
    date: Date,
    type: NotificationType
  ) => Promise<void>
): SnapshotStore<Snapshot<Data>> => {
  const initialState: Snapshot<Data> = {
    data: {},
    length: 0,
    category: undefined,
    timestamp: undefined,
    content: undefined,
  };
  
  const snapshotStore = new SnapshotStore<Snapshot<Data>>(notify, initSnapshot, {
    key: "example_key",
    id: "initial-id",
    initialState: initSnapshot,
     // Adding the missing properties
     timestamp: new Date(),
     category: "initial-category",
     clearSnapshots: () => { console.log('Snapshots cleared'); },
     set: (type: string, event: Event) => { console.log(`Set type: ${type}, event: ${event}`); },
     store: {} as SnapshotStoreConfig<SnapshotStore<Snapshot<Data>>> | null,
     state: initSnapshot,
     updateSnapshot: (newSnapshot) => {
       console.log('Snapshot updated:', newSnapshot);
       return Promise.resolve({ snapshot: [newSnapshot] });
     },
    onSnapshot: (snapshot) => { console.log('Snapshot:', snapshot); },
    snapshotData: (snapshot) => ({ snapshot: [snapshot] }),
    takeSnapshotsSuccess: (snapshots) => { console.log('Snapshots taken:', snapshots); },
    createSnapshotFailure: (error) => { console.error('Create snapshot failed:', error); },
    updateSnapshotsSuccess: (snapshotData) => { console.log('Snapshots updated:', snapshotData); },
    updateSnapshotFailure: (payload) => { console.error('Update snapshot failed:', payload.error); },
    fetchSnapshotSuccess: (snapshotData) => { console.log('Fetch snapshot success:', snapshotData); },
    createSnapshotSuccess: () => { console.log('Create snapshot success'); },
    takeSnapshotSuccess: () => { console.log('Take snapshot success'); },
    configureSnapshotStore: (config) => { console.log('Configure snapshot store', config); },
  
   
    getSnapshots: () => {
      console.log('Getting snapshots...');
      return Promise.resolve([]);
    },
    getSnapshot: async (snapshot: () => Promise<{ category: any; timestamp: any; id: any; snapshot: SnapshotStore<Snapshot<Data>>; data: Data; }> | undefined) => {
      console.log('Getting snapshot...');
      if (snapshot) {
        const data = await snapshot();
        if (data) {
          return data.snapshot;
        } else {
          throw new Error('Snapshot data is undefined');
        }
      } else {
        throw new Error('Snapshot function is undefined');
      }
    },
    
    takeSnapshot: async (snapshot: SnapshotStore<Snapshot<Data>>) => {
      try {
        // Logic to process the snapshot and take necessary actions
        console.log('Taking snapshot:', snapshot);
        
        // Assuming some async operation is performed to take the snapshot
        // For example, waiting for some time before resolving the promise
        await new Promise((resolve) => setTimeout(resolve, 1000));
    
        // Returning the updated snapshot or a confirmation message
        return { snapshot: [snapshot] };
      } catch (error) {
        // Handle any errors that occur during the snapshot process
        console.error('Error taking snapshot:', error);
        throw error;
      }
    },

    addSnapshot: (snapshot: SnapshotStore<Snapshot<Data>>) => { 
      console.log('Snapshot added:', snapshot); 
      // Add the provided snapshot to the list of snapshots or perform any other necessary actions
    },
    removeSnapshot: (snapshot: SnapshotStore<Snapshot<Data>>) => {
      console.log('Snapshot removed:', snapshot);
    },
    getSubscribers: () => { return []; },
    addSubscriber: (subscriber: Subscriber<Member>) => { console.log('Subscriber added:', subscriber); },
    notifySubscribers(subscribers: Subscriber<Snapshot<Data>>[]): SnapshotStore<Snapshot<Data>>[] {
      subscribers.forEach(subscriber => {
          // Assuming notify function sends notifications to each subscriber
        subscriber.notify(data);
      })
  
      // Returning the list of subscribers after notification
      return subscribers;
    },
    snapshots: [],
    clearSnapshot: function (): void {
      this.snapshots = [];
    },
    getAllSnapshots: async function (
      data: (
        subscribers: Subscriber<Snapshot<Data>>[],
        snapshots: SnapshotStore<Snapshot<Data>>[]
      ) => Promise<SnapshotStore<Snapshot<Data>>[]>
    ): Promise<SnapshotStore<Snapshot<Data>>[]> {
      return data([], this.snapshots);
    },
    fetchSnapshot: async function (): Promise<void> {
      console.log("Fetch snapshot called");
    },
    updateSnapshotSuccess: function (): void {
      console.log("Update snapshot succeeded");
    },
    batchUpdateSnapshots: async function (
      subscribers: Subscriber<Member>[],
      snapshot: SnapshotStore<Snapshot<Data>>
    ): Promise<{ snapshot: SnapshotStore<Snapshot<Data>>[] }> {
      return { snapshot: [snapshot] };
    },
    batchTakeSnapshotsRequest: async function (
      snapshotData: Subscriber<Member>[]
    ): Promise<{ snapshots: SnapshotStore<Snapshot<Data>>[] }> {
      return { snapshots: this.snapshots };
    },
    batchUpdateSnapshotsSuccess(
      subscribers: Subscriber<Snapshot<Data>>[],
      snapshots: SnapshotStore<Snapshot<Data>>[]
    ): { snapshots: SnapshotStore<Snapshot<Data>>[] } {
      subscribers.forEach(subscriber => snapshots.forEach(snapshot => subscriber.notify(snapshot)));
      return { snapshots };
    },
    batchFetchSnapshotsRequest: function (
      snapshotData: any
    ): { subscribers: any; snapshots: SnapshotStore<Snapshot<Data>>[] } {
      return { subscribers: [], snapshots: this.snapshots };
    },
    batchUpdateSnapshotsRequest: async function (
      snapshotData: any
    ): Promise<{ subscribers: any; snapshots: SnapshotStore<Snapshot<Data>>[] }> {
      return { subscribers: [], snapshots: this.snapshots };
    },
    batchFetchSnapshots: async function (
      subscribers: any,
      snapshots: SnapshotStore<Snapshot<Data>>[]
    ): Promise<void> {
      console.log("Batch fetch snapshots called");
    },
    batchFetchSnapshotsSuccess: function (
      subscribers: any,
      snapshots: SnapshotStore<Snapshot<Data>>[]
    ): SnapshotStore<Snapshot<Data>>[] {
      return snapshots;
    },
    batchFetchSnapshotsFailure: function (payload: { error: string }): void {
      console.error(payload.error);
    },
    batchUpdateSnapshotsFailure: function (payload: { error: string }): void {
      console.error(payload.error);
    },
    setSnapshot: function (snapshot: SnapshotStore<Snapshot<Data>>): void {
      this.snapshots.push(snapshot);
    },
    createSnapshot: function (data: Snapshot<Data>): SnapshotStore<Snapshot<Data>> {
      const newSnapshot = new SnapshotStore<Snapshot<Data>>(this.notify, this.initSnapshot, this.config, data);
      this.snapshots.push(newSnapshot);
      return newSnapshot;
    },
    batchTakeSnapshot: async function (
      snapshot: Snapshot<Data>
    ): Promise<{ snapshots: SnapshotStore<Snapshot<Data>>[] }> {
      this.createSnapshot(snapshot);
      return { snapshots: this.snapshots };
    },
    [Symbol.iterator]: function* (): Iterator<SnapshotStore<Snapshot<Data>>> {
      let index = 0;
      while (index < this.snapshots.length) {
        yield this.snapshots[index++];
      }
    },
    [Symbol.asyncIterator]: async function* (): AsyncIterator<SnapshotStore<Snapshot<Data>>> {
      for (const snapshot of this.snapshots) {
        yield snapshot;
      }
    },
    validateSnapshot: (data: Snapshot<Data>) => { return true; },
    getData: () => Promise.resolve([initSnapshot as SnapshotStore<Snapshot<Data>>]),
    takeSnapshot: async (data) => { console.log('Snapshot taken:', data); return { snapshot: [data] }; },
    handleSnapshot: (snapshotData) => { console.log('Handled snapshot:', snapshotData); }
  });
  

  export const snapshot: SnapshotStore<Snapshot<Data>> = new SnapshotStore<
    Snapshot<Data>
  >(
    notify,
    {
      id: "",
      timestamp: new Date(),
      set: {} as SnapshotStoreConfig<SnapshotStore<Snapshot<Data>>>,
      data: {} as SnapshotStoreConfig<SnapshotStore<Snapshot<Data>>>,
      store: {} as SnapshotStoreConfig<SnapshotStore<Snapshot<Data>>>,
      state: {} as SnapshotState,
      key: "example_key",
      update: "",
      setSnapshot: (snapshot: { snapshot: SnapshotStore<Snapshot<Data>> }) => ({
        snapshot: [snapshot.snapshot],
      }),
      initialState: initialState,
      snapshotData: () => ({ snapshot: [] as SnapshotStore<Snapshot<Data>>[] }),
      createSnapshot: () => {},
      [taskId]: tasks,
      clearSnapshots: () => {},
      snapshots: [],
      subscribers: [],
      notify: (
        message: string,
        content: any,
        date: Date,
        type: NotificationType
      ) => {},
      configureSnapshotStore: (
        config: SnapshotStoreConfig<SnapshotStore<Snapshot<Data>>>
      ) => {},
      createSnapshotSuccess: () => {},
      createSnapshotFailure: (error: any) => {},
      onSnapshot: (snapshot: SnapshotStore<Snapshot<Data>>[]) => {},
      snapshot: () =>
        Promise.resolve({ snapshot: [] as SnapshotStore<Snapshot<Data>>[] }),
      initSnapshot: () => {},
      clearSnapshot: () => {},
      updateSnapshot: () =>
        Promise.resolve({ snapshot: [] as SnapshotStore<Snapshot<Data>>[] }),
      getSnapshots: () =>
        Promise.resolve([{ snapshot: [] as SnapshotStore<Snapshot<Data>>[] }]),
      takeSnapshot: async (snapshot: SnapshotStore<Snapshot<Data>>[]) => ({
        snapshot: [snapshot],
      }),
      getSnapshot: async () => Promise.resolve(snapshot),
      getAllSnapshots: async (
        data: (
          subscribers: Subscriber<Snapshot<Data>>[],
          snapshots: SnapshotStore<Snapshot<Data>>[]
        ) => Promise<SnapshotStore<Snapshot<Data>>[]>
      ) => {
        return new Promise<SnapshotStore<Snapshot<Data>>[]>(
          (resolve, reject) => {
            Promise.resolve(snapshotConfig.snapshots);
          }
        );
      },

      takeSnapshotSuccess: () => {},
      updateSnapshotFailure: (payload: Payload) => {},
      takeSnapshotsSuccess: (snapshots: Snapshots) => {},
      async batchTakeSnapshot(
        snapshot: SnapshotStore<Snapshot<Data>>,
        snapshots: SnapshotStore<Snapshot<Data>>[]
      ): Promise<{ snapshots: SnapshotStore<Snapshot<Data>>[] }> {
        const allSnapshotsTaken: SnapshotStore<Snapshot<Data>>[] = [];
        for (const snapshotToTake of snapshots) {
          const newSnapshot = await this.takeSnapshot(snapshotToTake);
          allSnapshotsTaken.push(newSnapshot.snapshot[0]);
        }
        return { snapshots: allSnapshotsTaken };
      },

      updateSnapshotSuccess: () => {},
      updateSnapshotsSuccess: (
        snapshots: SnapshotStore<Snapshot<Data>>[]
      ) => {},
      fetchSnapshotSuccess: (
        snapshotData: SnapshotStore<Snapshot<Data>>[]
      ) => {},
      batchUpdateSnapshots: async (subscribers, snapshot) => [
        { snapshot: [] as SnapshotStore<Snapshot<Data>>[] },
      ],
      batchTakeSnapshotsRequest: (snapshotData: any) =>
        Promise.resolve({ snapshots: [] as SnapshotStore<Snapshot<Data>>[] }),
      batchUpdateSnapshotsSuccess: (subscribers, snapshots) => [{ snapshots }],
      batchUpdateSnapshotsRequest: (snapshotData: any) => ({
        subscribers: [],
        snapshots: [],
      }),
      batchFetchSnapshotsRequest: (subscribers) => subscribers,
      batchFetchSnapshots: async (
        subscribers: Subscriber<Snapshot<Data>>[],
        snapshots: SnapshotStore<Snapshot<Data>>[]
      ) => Promise.resolve({ subscribers, snapshots }),
      getData: async () => <SnapshotStore<Snapshot<Data>>[]>{},

      batchFetchSnapshotsSuccess: (subscribers, snapshot) => snapshot,
      batchFetchSnapshotsFailure: (payload) => {},
      batchUpdateSnapshotsFailure: (payload) => {},
      category: "",
      notifySubscribers: () => ({} as SnapshotStore<Snapshot<Data>>[]),
      [taskId]: tasks,
      [Symbol.iterator]: function* () {},
      [Symbol.asyncIterator]: async function* () {},
    },
    config
  );

  return snapshot;
};

const snapshotFunction = (
  subscribers: Subscriber<Snapshot<Data>>[],
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

// Define the SnapshotStore class
class SnapshotStore<T extends Snapshot<Data>> {
  private snapshots: SnapshotStore<Snapshot<Data>>[] = [];
  private subscription: Subscription = Subscription
  private subscribers: Subscriber<Snapshot<Data>> = new Subscriber(subscription);
  public state: SnapshotStore<Snapshot<Data>> | Snapshot<Data> | undefined;
  public data: any;
  public key: string | undefined;
  public id: string | undefined;
  public timestamp: Date | undefined;
  public category: string | undefined;
  content?: SnapshotStoreConfig<SnapshotStore<Snapshot<Data>>>;

  constructor(
    public notify: (
      id: string,
      message: string,
      content: any,
      date: Date,
      type: NotificationType
    ) => Promise<void>,
    private snapshot: T,

    public config: SnapshotStoreConfig<SnapshotStore<Snapshot<Data>>>
  ) {
    this.key = config.key;
    this.state = config.initialState;
    this.subscription = config.subscription;
    this.timestamp = config.timestamp;
    this.notify = notify;
    this.onSnapshot = config.onSnapshot;
    this.snapshotData = config.snapshotData;
    this.takeSnapshotsSuccess = config.takeSnapshotsSuccess;
    this.createSnapshotFailure = config.createSnapshotFailure;
    this.updateSnapshotsSuccess = config.updateSnapshotsSuccess;
    this.updateSnapshotFailure = config.updateSnapshotFailure;
    this.fetchSnapshotSuccess = config.fetchSnapshotSuccess;
    this.createSnapshotSuccess = config.createSnapshotSuccess;
    this.takeSnapshotSuccess = config.takeSnapshotSuccess;
    this.configureSnapshotStore = config.configureSnapshotStore;
  }

    // Add missing properties
    onSnapshot: (snapshot: SnapshotStore<Snapshot<Data>>) => void;
    onSnapshots: (snapshots: SnapshotStore<Snapshot<Data>>[]) => void;
    snapshotData: (snapshot: SnapshotStore<Snapshot<Data>>) => {
      snapshot: SnapshotStore<Snapshot<Data>>[];
    }
    takeSnapshotsSuccess: (snapshots: SnapshotStore<Snapshot<Data>>[]) => void;
    createSnapshotFailure: (error: Error) => void;
    updateSnapshotsSuccess: (
      snapshotData: (
        subscribers: Subscriber<Snapshot<Data>>[],
        snapshot: SnapshotStore<Snapshot<Data>>[]
      ) => { snapshot: SnapshotStore<Snapshot<Data>>[] }
    ) => void;
    updateSnapshotFailure?: (payload: { error: string }) => void;
    fetchSnapshotSuccess?: (
      snapshotData: (
        subscribers: Subscriber<Snapshot<Data>>[],
        snapshot: SnapshotStore<Snapshot<Data>>[]
      ) => { snapshot: SnapshotStore<Snapshot<Data>>[] }
    ) => void;
    createSnapshotSuccess?: () => void;
    takeSnapshotSuccess?: () => void;
    configureSnapshotStore?: (
      config: SnapshotStoreConfig<SnapshotStore<Snapshot<Data>>>
    ) => void;
  
    // Public method to get snapshots
    public getSnapshots(): SnapshotStore<Snapshot<Data>>[] {
      return this.snapshots;
    }
  
    public getSnapshot(): Snapshot<Data> {
      return this.snapshot;
    }
  
    // Public method to add a snapshot
    public addSnapshot(snapshot: SnapshotStore<Snapshot<Data>>): void {
      this.snapshots.push(snapshot);
    }
  
    // Public method to get subscribers
    public getSubscribers(): SnapshotStore<Snapshot<Data>>[] {
      return this.subscribers;
    }
  
    // Public method to add a subscriber
    public addSubscriber(subscriber: SnapshotStore<Snapshot<Data>>): void {
      this.subscribers.push(subscriber);
    }
  
    public clearSnapshots(): void {
      this.snapshots = [];
    }
  

    async notifySubscribers(
      notify: (
        id: string,
        message: string,
        content: any,
        date: Date,
        type: NotificationType
      ) => Promise<void>
    ): Promise<SnapshotStore<Snapshot<Data>>[]> {
      try {
        const allSnapshots = await this.getAllSnapshots(
          (subscribers, snapshots) => {
            return new Promise<SnapshotStore<Snapshot<Data>>[]>(
              (resolve, reject) => {
                const processedSnapshots = snapshots.map(({ data }) => data);
                const convertedSnapshots: SnapshotStore<Snapshot<Data>>[] =
                  processedSnapshots
                    .filter(
                      (snapshot): snapshot is SnapshotStore<Snapshot<Data>> =>
                        snapshot !== undefined
                    )
                    .map(
                      (snapshot) =>
                        new SnapshotStore<Snapshot<Data>>(
                          notify, // Use the provided notify function
                          snapshot, 
                          this.config
                        )
                    );
                resolve(convertedSnapshots);
              }
            );
          },
          this.snapshots
        );
        return allSnapshots;
      } catch (error) {
        console.error("Error occurred while notifying subscribers:", error);
        throw error;
      }
    }
  
    validateSnapshot(data: Data) {
      return !!data.timestamp;
    }
  
    getData(): T {
      return this.data;
    }
  
    updateSnapshot(newSnapshot: SnapshotStore<Snapshot<Data>>) {
      this.state = newSnapshot;
      if (this.onSnapshot) {
        this.onSnapshot(this.state);
      }
    }
  
    getAllSnapshots: (
      data: (
        subscribers: Subscriber<Snapshot<Data>>[],
        snapshots: SnapshotStore<Snapshot<Data>>[]
      ) => Promise<SnapshotStore<Snapshot<Data>>[]>,
      snapshots: SnapshotStore<Snapshot<Data>>[]
    ) => Promise<SnapshotStore<Snapshot<Data>>[]> = async (data, snapshots) => {
      const processedSnapshots = await data(this.subscribers, snapshots);
      return processedSnapshots;
    };
  
    


  clearSnapshot() {
    throw new Error("Method not implemented.");
  }
  getLatestSnapshot() {
    throw new Error("Method not implemented.");
  }
  set(type: string, event: Event) {
    throw new Error("Method not implemented.");
  }
   message: Snapshot<Data> = {
     category: this.category,
    timestamp: this.timestamp,
    content: this.content,
    data,
  };
   onSnapshot?: (snapshot: SnapshotStore<Snapshot<Data>>) => void;
  onSnapshots?: (snapshots: SnapshotStore<Snapshot<Data>>[]) => void;
  snapshotData?: (snapshot: SnapshotStore<Snapshot<Data>>) => {
    snapshot: SnapshotStore<Snapshot<Data>>[];
  };
 
  takeSnapshotsSuccess: (
    snapshots: SnapshotStore<Snapshot<Data>>[]
  ) => void | undefined;
  createSnapshotFailure: (error: Error) => void;
  updateSnapshotsSuccess: (
    snapshotData: (
      subscribers: Subscriber<Snapshot<Data>>[],
      snapshot: SnapshotStore<Snapshot<Data>>[]
    ) => { snapshot: SnapshotStore<Snapshot<Data>>[] }
  ) => void;
  updateSnapshotFailure: (payload: { error: string }) => void;
  fetchSnapshotSuccess: (
    snapshotData: (
      subscribers: Subscriber<Snapshot<Data>>[],
      snapshot: SnapshotStore<Snapshot<Data>>[]
    ) => { snapshot: SnapshotStore<Snapshot<Data>>[] }
  ) => void;
  createSnapshotSuccess: () => void;
  takeSnapshotSuccess: () => void;

  // Public method to get snapshots
  public getSnapshots(): SnapshotStore<Snapshot<Data>>[] {
    return this.snapshots;
  }

  public getSnapshot(): Snapshot<Data> {
    return this.snapshot;
  }
  // Public method to add a snapshot
  public addSnapshot(snapshot: SnapshotStore<Snapshot<Data>>): void {
    this.snapshots.push(snapshot);
  }

  // Public method to get subscribers
  public getSubscribers(): SnapshotStore<Snapshot<Data>>[] {
    return this.subscribers;
  }

  fetchSnapshot(snapshot: SnapshotStore<Snapshot<Data>>): void {
    this.snapshot;
  }

  configureSnapshotStore(
    config: SnapshotStoreConfig<SnapshotStore<Snapshot<Data>>>
  ) {
    this.config = config;
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  // private notifySubscribers(snapshot: Snapshot<T>) {
  //   this.subscribers.forEach((subscriber) => subscriber(snapshot));
  // }

  handleSnapshot(snapshotData: SnapshotStore<Snapshot<Data>>) {
    this.state = snapshotData;
    if (this.onSnapshot) {
      this.onSnapshot(this.state);
    }
  }

  update(snapshotData: T): void {
    this.data = { ...this.data, ...snapshotData };
  }

  creatSnapshot: (additionalData: any) => void = () => {};

  setSnapshot(newSnapshot: SnapshotStore<Snapshot<Data>>) {
    this.state = newSnapshot;
  }

  setSnapshots(
    category: any,
    timestamp: any,
    id: any,
    newSnapshots: SnapshotStore<Snapshot<Data>>[]
  ) {
    for (let snapshot of newSnapshots) {
      this.addSnapshot(category);
    }
    if (this.onSnapshots) {
      this.onSnapshots(this.snapshots);
    }
  }

  removeSnapshot(snapshotToRemove: SnapshotStore<Snapshot<Data>>) {
    this.snapshots = this.snapshots.filter(
      (snapshot) => snapshot !== snapshotToRemove
    );
  }

  
  async takeSnapshot(
    data: SnapshotStore<Snapshot<Data>>
  ): Promise<{ snapshot: SnapshotStore<Snapshot<Data>>[] }> {
    const timestamp = new Date();
    const existingSnapshotIndex = this.snapshots.findIndex((snapshotObj) =>
      snapshotObj.snapshots.some(
        (existingSnapshot) => existingSnapshot.timestamp === data.timestamp
      )
    );
  
    if (existingSnapshotIndex !== -1) {
      this.updateSnapshot(data);
      return { snapshot: [data] };
    }
  
    const newSnapshot: SnapshotStore<Snapshot<Data>> = new SnapshotStore<
      Snapshot<Data>
    >(
      this.notify,
      {
        length: data.snapshot.length,
        category: data.snapshot.category,
        id: data.snapshot.id,
        timestamp: data.snapshot.timestamp,
        content: data.snapshot.content,
        tags: data.snapshot.tags,
        data: data.snapshot.data
      },
      this.config
    );
    this.addSnapshot(newSnapshot);
    return { snapshot: [newSnapshot] };
  }
  
 

  initSnapshot(snapshot: SnapshotStore<Snapshot<Data>>) {
    this.takeSnapshot(snapshot);
  }

  updateSnapshots() {}
  createSnapshot(
    data: SnapshotStore<Snapshot<Data>>,
    snapshot: {
      category: any;
      timestamp: any;
      snapshot: SnapshotStore<Snapshot<Data>>[];
    }
  ) {
    const newSnapshot: SnapshotStore<Snapshot<Data>> = {
      category: snapshot.category,
      timestamp: snapshot.timestamp,
      snapshot: snapshot.snapshot,
      snapshots: snapshot.snapshot,
      setSnapshots: (
        category: any,
        timestamp: any,
        id: any,
        newSnapshots: SnapshotStore<Snapshot<Data>>[]
      ) => {
        // Implement setSnapshots logic here
      },
      clearSnapshot: function (): void {
        throw new Error("Function not implemented.");
      },
      getLatestSnapshot: function (): void {
        throw new Error("Function not implemented.");
      },
      set: function (type: string, event: Event): void {
        throw new Error("Function not implemented.");
      },
      id: undefined,
      key: "",
      state: undefined,
      snapshotData: function (snapshot: SnapshotStore<Snapshot<Data>>): {
        snapshot: SnapshotStore<Snapshot<Data>>[];
      } {
        throw new Error("Function not implemented.");
      },
      data: undefined,
      store: undefined,
      subscribers: [],
      notify: function (
        message: string,
        content: any,
        date: Date,
        type: NotificationType
      ): void {
        throw new Error("Function not implemented.");
      },
      takeSnapshotsSuccess: function (
        snapshots: SnapshotStore<Snapshot<Data>>[]
      ): void {
        throw new Error("Function not implemented.");
      },
      createSnapshotFailure: function (error: Error): void {
        throw new Error("Function not implemented.");
      },
      updateSnapshotsSuccess: function (
        snapshotData: (
          subscribers: Subscriber<Snapshot<Data>>[],
          snapshot: SnapshotStore<Snapshot<Data>>[]
        ) => { snapshot: SnapshotStore<Snapshot<Data>>[] }
      ): void {
        throw new Error("Function not implemented.");
      },
      updateSnapshotFailure: function (payload: { error: string }): void {
        throw new Error("Function not implemented.");
      },
      fetchSnapshotSuccess: function (
        snapshotData: (
          subscribers: Subscriber<Snapshot<Data>>[],
          snapshot: SnapshotStore<Snapshot<Data>>[]
        ) => { snapshot: SnapshotStore<Snapshot<Data>>[] }
      ): void {
        throw new Error("Function not implemented.");
      },
      createSnapshotSuccess: function (): void {
        throw new Error("Function not implemented.");
      },
      takeSnapshotSuccess: function (): void {
        throw new Error("Function not implemented.");
      },
      config: {},
      // snapshot: [],
      configureSnapshotStore: function (
        config: SnapshotStoreConfig<SnapshotStore<Snapshot<Data>>>
      ): void {
        throw new Error("Function not implemented.");
      },
      generateId: function (): string {
        throw new Error("Function not implemented.");
      },
      handleSnapshot: function (
        snapshotData: SnapshotStore<Snapshot<Data>>
      ): void {
        throw new Error("Function not implemented.");
      },
      update: function (snapshotData: Snapshot<Data>): void {
        throw new Error("Function not implemented.");
      },
      creatSnapshot: function (additionalData: any): void {
        throw new Error("Function not implemented.");
      },
      setSnapshot: function (newSnapshot: SnapshotStore<Snapshot<Data>>): void {
        throw new Error("Function not implemented.");
      },
      addSnapshot: function (
        category: any,
        timestamp: any,
        snapshot: SnapshotStore<Snapshot<Data>>,
        id: any,
        data: Snapshot<Data>
      ): void {
        throw new Error("Function not implemented.");
      },
      removeSnapshot: function (
        snapshotToRemove: SnapshotStore<Snapshot<Data>>
      ): void {
        throw new Error("Function not implemented.");
      },
      notifySubscribers: function (
        subscribers: Subscriber<Snapshot<Data>>[]
      ): Promise<SnapshotStore<Snapshot<Data>>[]> {
        throw new Error("Function not implemented.");
      },
      validateSnapshot: function (data: Data): boolean {
        throw new Error("Function not implemented.");
      },
      getData: function (): Snapshot<Data> {
        throw new Error("Function not implemented.");
      },
      getSubscribers: function (): SnapshotStore<Snapshot<Data>>[] {
        throw new Error("Function not implemented.");
      },
      getSnapshots: function (): Promise<{
        data: () => Promise<{ snapshot: SnapshotStore<Snapshot<Data>>[] }>;
        snapshot: SnapshotStore<Snapshot<Data>>[];
      }> {
        throw new Error("Function not implemented.");
      },
      updateSnapshot: function (
        newSnapshot: SnapshotStore<Snapshot<Data>>
      ): void {
        throw new Error("Function not implemented.");
      },
      getAllSnapshots: function (
        data: (
          subscribers: Subscriber<Snapshot<Data>>[],
          snapshots: SnapshotStore<Snapshot<Data>>[]
        ) => Promise<SnapshotStore<Snapshot<Data>>[]>,
        snapshots: SnapshotStore<Snapshot<Data>>[]
      ): Promise<SnapshotStore<Snapshot<Data>>[]> {
        throw new Error("Function not implemented.");
      },
      takeSnapshot: function (
        data: SnapshotStore<Snapshot<Data>>
      ): Promise<{ snapshot: SnapshotStore<Snapshot<Data>>[] }> {
        throw new Error("Function not implemented.");
      },
      initSnapshot: function (snapshot: SnapshotStore<Snapshot<Data>>): void {
        throw new Error("Function not implemented.");
      },
      createSnapshot: function (
        data: SnapshotStore<Snapshot<Data>>,
        snapshot: {
          category: any;
          timestamp: any;
          snapshot: SnapshotStore<Snapshot<Data>>[];
        }
      ): void {
        throw new Error("Function not implemented.");
      },
      applySnapshot: function (
        snapshot: SnapshotStore<Snapshot<Data>>
      ): SnapshotStore<Snapshot<Data>> {
        throw new Error("Function not implemented.");
      },
      sortSnapshots: function (
        snapshots: SnapshotStore<Snapshot<Data>>[]
      ): SnapshotStore<Snapshot<Data>>[] {
        throw new Error("Function not implemented.");
      },
      filterSnapshots: function (
        snapshots: SnapshotStore<Snapshot<Data>>[]
      ): SnapshotStore<Snapshot<Data>>[] {
        throw new Error("Function not implemented.");
      },
      mapSnapshots: function (
        snapshots: SnapshotStore<Snapshot<Data>>[],
        callback: (
          snapshot: SnapshotStore<Snapshot<Data>>
        ) => SnapshotStore<Snapshot<Data>>
      ): SnapshotStore<Snapshot<Data>>[] {
        throw new Error("Function not implemented.");
      },
      findSnapshot: function (
        snapshot: SnapshotStore<Snapshot<Data>>
      ): SnapshotStore<Snapshot<Data>> | undefined {
        throw new Error("Function not implemented.");
      },
      reduceSnapshots: function (): SnapshotStore<Snapshot<Data>>[] {
        throw new Error("Function not implemented.");
      },
      mergeSnapshots: function (
        snapshot1: SnapshotStore<Snapshot<Data>>,
        snapshot2: SnapshotStore<Snapshot<Data>>
      ): SnapshotStore<Snapshot<Data>> {
        throw new Error("Function not implemented.");
      },
      getSnapshot: undefined,
      updateSnapshots: function (): void {
        throw new Error("Function not implemented.");
      },
    };

    this.snapshots.push(newSnapshot);

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
  sortSnapshots(snapshots: SnapshotStore<Snapshot<Data>>[]) {
    return snapshots.sort((a, b) => {
      const aTimestamp =
        Array.isArray(a.snapshots) && a.snapshots.length > 0
          ? new Date(a.snapshots[0]?.timestamp ?? 0).getTime()
          : 0;
      const bTimestamp =
        Array.isArray(b.snapshots) && b.snapshots.length > 0
          ? new Date(b.snapshots[0]?.timestamp ?? 0).getTime()
          : 0;
      return bTimestamp - aTimestamp;
    });
  }

  filterSnapshots(
    snapshots: SnapshotStore<Snapshot<Data>>[]
  ): SnapshotStore<Snapshot<Data>>[] {
    return snapshots.map(({ data }) => data); // Adjusted to use 'data' instead of 'snapshot'
  }

  mapSnapshots(
    snapshots: SnapshotStore<Snapshot<Data>>[],
    callback: (
      snapshot: SnapshotStore<Snapshot<Data>>
    ) => SnapshotStore<Snapshot<Data>>
  ): SnapshotStore<Snapshot<Data>>[] {
    return snapshots.map(callback);
  }

  findSnapshot(
    snapshot: SnapshotStore<Snapshot<Data>>
  ): SnapshotStore<Snapshot<Data>> | undefined {
    return this.snapshots.find(
      (snap) => JSON.stringify(snap.data) === JSON.stringify(snapshot.data)
    );
  }

  reduceSnapshots(): SnapshotStore<Snapshot<Data>>[] {
    const reducedSnapshots: SnapshotStore<Snapshot<Data>>[] = [];
    for (const snapshotObj of this.snapshots) {
      const snapshot = snapshotObj.data; // Change 'snapshotObj.snapshot[0]' to 'snapshotObj.data'
      const existingSnapshotIndex = reducedSnapshots.findIndex(
        (existingSnapshot) => existingSnapshot.timestamp === snapshot.timestamp
      );
      if (existingSnapshotIndex !== -1) {
        reducedSnapshots[existingSnapshotIndex] = this.mergeSnapshots(
          reducedSnapshots[existingSnapshotIndex],
          snapshot
        );
      } else {
        reducedSnapshots.push(snapshot);
      }
    }
    return reducedSnapshots;
  }

  mergeSnapshots(
    snapshot1: SnapshotStore<Snapshot<Data>>,
    snapshot2: SnapshotStore<Snapshot<Data>>
  ): SnapshotStore<Snapshot<Data>> {
    if (snapshot1 && snapshot2) {
      // Remove '.snapshot' from 'snapshot1' and 'snapshot2'
      const mergedSnapshotData = {
        ...(snapshot1.data ?? {}),
        ...(snapshot2.data ?? {}),
      };
      const timestamp1 = snapshot1.timestamp ?? new Date(); // Remove '.snapshot' from 'snapshot1'
      const timestamp2 = snapshot2.timestamp ?? new Date(); // Remove '.snapshot' from 'snapshot2'
      const latestTimestamp = new Date(
        Math.max(timestamp1.getTime(), timestamp2.getTime())
      );

      return {
        ...snapshot1,
        data: mergedSnapshotData,
        timestamp: latestTimestamp,
      } as SnapshotStore<Snapshot<Data>>;
    }
    return snapshot1;
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
    snapshot: {
      category:
        timestamp:,
      content:,
      data
    },
    snapshotData: (
      snapshot: SnapshotStore<Snapshot<Data>>
    ): { snapshot: SnapshotStore<Snapshot<Data>>[] } => {
      return {
        snapshot: [snapshot],
      };
    },


    createSnapshot: () => {},
    updateSnapshots: () => {},
    fetchSnapshot: () => {},
    createSnapshotSuccess: () => {},
    createSnapshotFailure: () => {},
    updateSnapshotsSuccess: () => {},
    fetchSnapshotSuccess: () => {},
    fetchSnapshotFailure: () => {},
    notify: async () => {},
    notifySubscribers: (
      subscribers: Subscriber<Snapshot<Data>>[]
    ): Promise<SnapshotStore<Snapshot<Data>>[]> => {
      return Promise.resolve([]);
    },
    subscribe: () => {},
    unsubscribe: () => {},
    getState(): SnapshotStore<Snapshot<Data>> {
      return this.state;
    },
    setState(state: SnapshotStore<Snapshot<Data>>) {
      if (state) {
        this.state = state;
      }
    },
    handleActions: () => {},
    clearSnapshots: () => {},
    clearSnapshot: () => {},
    getSnapshot: (
      snapshot: (snapshot: {
        category: any;
        timestamp: any;
        id: any;
        snapshot: SnapshotStore<Snapshot<Data>>;
        data: Data;
      }) => Promise<{
        category: any;
        timestamp: any;
        id: any;
        snapshot: SnapshotStore<Snapshot<Data>>;
        data: Data;
      }>
    ) => Promise<SnapshotStore<Snapshot<Data>>>,
    getSnapshots: () => {
      if (!this.state) {
        return [];
      }
      return this.state.snapshots || [];
    },

    setSnapshot: () => {},
    setSnapshots: () => {},
    addSnapshot: () => {},
    removeSnapshot: () => {},
    updateSnapshot: () => {},
    filterSnapshots: (snapshots: SnapshotStore<Snapshot<Data>>[]) => {
      return snapshots;
    },

    sortSnapshots(snapshots: SnapshotStore<Snapshot<Data>>[]) {
      return snapshots.sort((a, b) => {
        const aSnapshot = a.snapshots || [];
        const bSnapshot = b.snapshots || [];
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
          const snapshot = snapshotObj.snapshots;
          if (snapshot && snapshot.length > 0) {
            const existingSnapshotIndex = reducedSnapshots.findIndex(
              (existingSnapshot) => {
                return existingSnapshot?.snapshots[0]?.timestamp === snapshot[0].timestamp;
              }
            );
            if (existingSnapshotIndex !== -1) {
              reducedSnapshots[existingSnapshotIndex] = this.mergeSnapshots(
                reducedSnapshots[existingSnapshotIndex],
                snapshotObj
              );
            } else {
              reducedSnapshots.push(snapshotObj);
            }
          }
        }
      }
      return reducedSnapshots;
    },
    findSnapshot: (snapshot: SnapshotStore<Snapshot<Data>> | undefined) => {
      return this.getSnapshots().find(
        (storedSnapshot: SnapshotStore<Snapshot<Data>>) => {
          return (
            storedSnapshot?.key === snapshot?.key &&
            isEqual(storedSnapshot?.snapshots, snapshot?.snapshots)
          );
        }
      );
    },
  };
};

// Function to set a dynamic notification message
const setDynamicNotificationMessage = (message: string) => {
  setNotificationMessage(message);
};

const { state: authState } = useAuth();

const updateSnapshot = async (
  snapshot: SnapshotStore<Snapshot<Data>>[]
): Promise<{ snapshot: SnapshotStore<Snapshot<Data>>[] }> => {
  snapshotConfig.getSnapshot(snapshot);
  // Assuming you want to return an array of snapshots after updating
  const updatedSnapshots: SnapshotStore<Snapshot<Data>>[] = [snapshot]; // Adjust this line based on your actual implementation
  return { snapshot: updatedSnapshots };
};

const convertToSnapshotStore = (
  snapshotData: (snapshotStore: SnapshotStore<Snapshot<Data>>) => {
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
    applySnapshot: (snapshot: SnapshotStore<Snapshot<Data>>) =>
      SnapshotStore<Snapshot<Data>>,
    // Add remaining missing properties
  };
};

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

const getSnapshot = async (
  snapshot: SnapshotStore<Snapshot<Data>>
): Promise<SnapshotStore<Snapshot<Data>>[]> => {
  // Implementation logic here
  const snapshotArray: SnapshotStore<Snapshot<Data>>[] = [snapshot];
  return snapshotArray;
};

const getSnapshots = () => snapshotStoreInstance.getSnapshots();
const getAllSnapshots = () =>
  snapshotStoreInstance.getAllSnapshots(data, snapshots);

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
    const fetchedSnapshot = createTypedSnapshot(taskId, tasks, notifyFunction);

    // Push the fetched snapshot into the array
    fetchedSnapshots.push(fetchedSnapshot);
  });

  // Further processing logic with the fetched snapshots
};

const batchUpdateSnapshotsFailure = (payload: { error: string }): void => {
  // Implementation logic here
};

const notifySubscribers = (
  subscribers: Subscriber<Snapshot<Data>>[]
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
  category: "snapshots",
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

const config = {} as SnapshotStoreConfig<SnapshotStore<Snapshot<Data>>>;

const snapshotStoreInstance = new SnapshotStore<Snapshot<Data>>(
  id,
  notifyFunction,
  config
);
const sortingType = {} as SortingType;

export const snapshotStore = {
  ...snapshotStoreInstance,

  async getSnapshot(): Promise<Snapshot<Data> | undefined> {
    const latestSnapshot = snapshotStoreInstance.getLatestSnapshot();
    const snapshotData = latestSnapshot.data;
    if (!snapshotData) return undefined;

    return {
      timestamp: latestSnapshot.timestamp,
      data: snapshotData.data || [],
      category: snapshotData.category,
      // length: (snapshotData.data || []).length,
      content: snapshotData.content
    };
  },

  addSnapshot(
    category: any,
    timestamp: any,
    snapshot: SnapshotStore<Snapshot<Data>>,
    id: any,
    data: any
  ) {
    // Logic to add the snapshot to the snapshots array
    const newSnapshot: Snapshot<Snapshot<Data>> = {
      data: data,
      length: snapshot.snapshots.length,
      category: category,
      timestamp: timestamp,
    };

    this.snapshots.push(snapshot);
  },

  setSnapshots(
    category: any,
    timestamp: any,
    id: any,
    newSnapshots: SnapshotStore<Snapshot<Data>>[]
  ) {
    for (let snapshot of newSnapshots) {
      this.addSnapshot(category, timestamp, snapshot, id, snapshot.data);
    }

    if (this.onSnapshots) {
      this.onSnapshots(this.snapshots);
    }
  },

  snapshots() {},

  updateSnapshotData(id: string, newData: any) {
    const snapshot = this.snapshots.find((snapshot) => snapshot.id === id);
    if (snapshot) {
      snapshot.data = newData;
      snapshot.timestamp = new Date(); // Update timestamp to reflect modification time
    } else {
      throw new Error(`Snapshot with id ${id} not found`);
    }
  },

  set(snapshot: SnapshotStore<Snapshot<Data>>, event: Event) {
    snapshot.set(event.type, event);
    handleSorting(
      event as unknown as React.MouseEvent<HTMLButtonElement, MouseEvent>,
      sortingType
    );
    return snapshot;
  },
};

export default SnapshotStore;
export type { Snapshot };
// export const snapshotStore = {} as SnapshotStore
