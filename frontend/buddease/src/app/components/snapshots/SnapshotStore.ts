import { Snapshots } from '@/app/components/snapshots/SnapshotStore';
import { endpoints } from "@/app/api/ApiEndpoints";
import { RealtimeDataItem } from "@/app/components/models/realtime/RealtimeData";
import {
  NotificationTypeEnum,
  useNotification,
} from "@/app/components/support/NotificationContext";
import UniqueIDGenerator from "@/app/generators/GenerateUniqueIds";
import { useDispatch } from "react-redux";
import { SnapshotLogger } from "../logging/Logger";
import { Content } from "../models/content/AddContent";
import { Data } from "../models/data/Data";
import {
  NotificationPosition,
  ProjectPhaseTypeEnum,
} from "../models/data/StatusType";
import { Tag } from "../models/tracker/Tag";
import { Phase } from "../phases/Phase";
import { CalendarEvent } from "../state/stores/CalendarEvent";
import { AllStatus } from "../state/stores/DetailsListStore";
import { Subscription } from "../subscriptions/Subscription";
import { Subscriber } from "../users/Subscriber";
import { SnapshotActions } from "./SnapshotActions";
import {
  AuditRecord,
  RetentionPolicy,
  SnapshotStoreConfig,
} from "./SnapshotConfig";
import { useSnapshotStore } from "./useSnapshotStore";
import { callback } from "node_modules/chart.js/dist/helpers/helpers.core";
import { deleteSnapshot } from './snapshotHandlers';
import { CustomSnapshotData, Payload, Snapshot, UpdateSnapshotPayload } from './LocalStorageSnapshotStore';
import YourComponent from "../hooks/YourComponent";

const { notify } = useNotification();
const dispatch = useDispatch();
const notificationContext = useNotification();


const initializeData = (): Data => {
  return {
    id: "initial-id",
    name: "Initial Name",
    value: "Initial Value",
    timestamp: new Date(),
    category: "Initial Category",
  };
};

const defaultCategory = "defaultCategory";
const initialState = {
  id: "",
  category: defaultCategory,
  timestamp: new Date(),
  length: 0,
  content: undefined,
  data: undefined,
};
interface SnapshotStoreSubset<T extends Data | undefined> {
  snapshotId: string;
  taskIdToAssign: Snapshot<T> | undefined;
  addSnapshot: (
    snapshot: Snapshot<T>,
    subscribers: Subscriber<CustomSnapshotData | T>[]
  ) => void;
  onSnapshot: (
    snapshot: Snapshot<T>,
    config: SnapshotStoreConfig<Snapshot<Data>, Data>[]
  ) => void;

  addSnapshotSuccess: (
    snapshot: Snapshot<T>,
    subscribers: Subscriber<CustomSnapshotData | T>[]
  ) => void;
  updateSnapshot: (
    snapshotId: string,
    data: SnapshotStore<Snapshot<T>>,
    events: Record<string, CalendarEvent[]>,
    snapshotStore: SnapshotStore<T>,
    dataItems: RealtimeDataItem[],
    newData: Data,
    payload: UpdateSnapshotPayload<T>
  ) => void;
  removeSnapshot: (snapshotId: string) => void;
  clearSnapshots: () => void;
  createSnapshot: (
    snapshotData:
      | SnapshotStore<Snapshot<Snapshot<T>>>
      | Snapshot<Snapshot<Snapshot<T>>>
      | null
      | undefined
  ) => void;
  createSnapshotSuccess: (snapshot: Snapshot<T>) => void;
  createSnapshotFailure: (error: Payload) => void;
  updateSnapshots: () => void;
  updateSnapshotSuccess: () => void;
  updateSnapshotFailure: (error: Payload) => void;
  updateSnapshotsSuccess: () => void;
  updateSnapshotsFailure: (error: Payload) => void;
  initSnapshot: (
    snapshotStore: SnapshotStoreConfig<Snapshot<Snapshot<T>>, Snapshot<T>>,
    snapshotData: Snapshot<Snapshot<T>>
  ) => void;
  takeSnapshot: (
    updatedSnapshots: SnapshotStore<Snapshot<T>>
  ) => Promise<Snapshot<T>[] | null>;
  takeSnapshotSuccess: (snapshot: SnapshotStore<Snapshot<T>>) => void;
  takeSnapshotsSuccess: (snapshots: Snapshot<T>[]) => void;
  configureSnapshotStore: (
    snapshotConfigStore: SnapshotStoreConfig<T, Data>
  ) => void;
  getData: () => Data | null;
  flatMap: () => void;
  setData: (data: Data) => void;
  getState: () => any;
  setState: (state: any) => void;
  validateSnapshot: (snapshot: Snapshot<Data>) => boolean;
  handleSnapshot: (snapshot: Snapshot<Data> | null, snapshotId: string) => void;
  handleActions: () => void;
  setSnapshot: (snapshot: Snapshot<T>) => void;
  setSnapshots: (snapshots: Snapshot<T>[]) => void;
  clearSnapshot: (snapshotId: string) => void;
  mergeSnapshots: (snapshots: Snapshot<T>[]) => void;
  reduceSnapshots: () => void;
  sortSnapshots: () => void;
  filterSnapshots: () => void;
  mapSnapshots: () => void;
  findSnapshot: () => void;
  getSubscribers: () => void;
  notify: () => void;
  notifySubscribers: () => void;
  subscribe: () => void;
  unsubscribe: () => void;
  fetchSnapshot: () => void;
  fetchSnapshotSuccess: (
    snapshot: Snapshot<Data> | null,
    snapshotId: string
  ) => void;
  fetchSnapshotFailure: () => void;
  getSnapshot: () => void;
  getSnapshots: () => void;
  
  getAllSnapshots: () => void;
  generateId: () => void;
  batchFetchSnapshots: () => void;
  batchTakeSnapshotsRequest: () => void;
  batchUpdateSnapshotsRequest: () => void;
  batchFetchSnapshotsSuccess: () => void;
  batchFetchSnapshotsFailure: () => void;
  batchUpdateSnapshotsSuccess: () => void;
  batchUpdateSnapshotsFailure: () => void;
  batchTakeSnapshot: () => void;
}

class SnapshotStore<T extends Data | undefined>
  implements SnapshotStoreConfig<Snapshot<T>, T>
{
  id: string | number;
  key: string;
  topic: string;
  date: Date | undefined;
  configOption: SnapshotStoreConfig<Snapshot<T>, T> | null;
  config: SnapshotStoreConfig<Snapshot<any>, any>[] | null | undefined;
  subscription: Subscription | null;
  initialState:
    | SnapshotStore<Snapshot<T>>
    | Snapshot<Snapshot<T>>
    | null
    | undefined;
  category: string;
  timestamp: string | Date | undefined;
  type: string;
  subscribers: Subscriber<Snapshot<T>>[]; 
  set: ((type: string, event: Event) => void | null) | undefined;
  data: Snapshot<T> | SnapshotStoreConfig<Snapshot<T>, T> | null;
  state: Snapshot<Snapshot<T>>[] | null;
  snapshots: SnapshotStore<Snapshot<Snapshot<T>>>[];
  subscribeToSnapshots: (
    snapshotId: string,
    callback: (snapshot: Snapshot<T>) => void
  ) => void;
  snapshotConfig: SnapshotStoreConfig<Snapshot<Data>, Data>[] = [];
  expirationDate?: Date;
  priority?: AllStatus;
  tags?: Tag[];
  metadata?: Record<string, any>;
  status?: "active" | "inactive" | "archived";
  isCompressed?: boolean;
  private dataStore: Map<string, T> = new Map();

  constructor(
    snapshot: T | null,
    category: string,
    date: Date,
    type: string,
    initialState:
    SnapshotStore<Snapshot<T>> | Snapshot<Snapshot<T>> 
      | null
      | undefined,
    snapshotConfig: SnapshotStoreConfig<Snapshot<Data>, Data>[],
    subscribeToSnapshots: (
      snapshotId: string,
      callback: (snapshot: Snapshot<T>) => void
    ) => void,
    private delegate: SnapshotStoreConfig<Snapshot<T>, T>[]
  ) {
    this.timestamp = new Date();
    const prefix = this.determinePrefix(snapshot, category);
    this.id = UniqueIDGenerator.generateID(
      prefix,
      snapshot!.id ||
        snapshot!.name ||
        snapshot!.title ||
        snapshot!.description ||
        "",
      NotificationTypeEnum.GeneratedID
    );
    this.key = "";
    this.topic = "";
    this.date = date;
    this.type = type;
    this.config = null;
    this.configOption = null;
    this.subscription = null;
    this.initialState = initialState || null;
    this.category = category;
    this.timestamp = new Date();
    this.set = undefined;
    this.data = null;
    this.state = null;
    this.snapshots = [];
    this.subscribers = [];
    this.delegate = delegate;
    this.snapshotConfig = snapshotConfig;
    this.subscribeToSnapshots = subscribeToSnapshots;
  }

  removeItem(key: string): void {
    this.dataStore.delete(key);
  }

  getItem(key: string): T | null {
    return this.dataStore.get(key) || null;
  }

  setItem(key: string, value: T): void {
    this.dataStore.set(key, value);
  }

  getDelegate(): SnapshotStoreConfig<Snapshot<T>, T>[] {
    return this.delegate;
  }

  addSnapshotFailure(error: Error): void {
    notify(
      `${error.message}`,
      `Snapshot added failed fully.`,
      "Error",
      new Date(),
      NotificationTypeEnum.Error,
      NotificationPosition.TopRight
    );
  }

  getDataStore(): Map<string, T> {
    return this.dataStore;
  }

  addSnapshotSuccess(
    snapshot: Snapshot<T>,
    subscribers: Subscriber<CustomSnapshotData | T>[]
  ): void {
    const index = this.delegate.findIndex(
      (snapshotStore) =>
        snapshotStore.id === snapshot.id &&
        snapshotStore.category === snapshot.category &&
        snapshotStore.key === snapshot.key &&
        snapshotStore.topic === snapshot.topic &&
        snapshotStore.priority === snapshot.priority &&
        snapshotStore.tags === snapshot.tags &&
        snapshotStore.metadata === snapshot.metadata &&
        snapshotStore.status === snapshot.status &&
        snapshotStore.isCompressed === snapshot.isCompressed &&
        snapshotStore.expirationDate === snapshot.expirationDate &&
        snapshotStore.timestamp === snapshot.timestamp &&
        snapshotStore.data === snapshot.data &&
        this.compareSnapshotState(
          snapshotStore.state as Snapshot<T> | null,
          snapshot.state
        )
    );

    if (index !== -1) {
      this.delegate[index].addSnapshotSuccess(snapshot, subscribers);

      notify(
        `${snapshot.id}`,
        `Snapshot ${snapshot.id} added successfully.`,
        "Success",
        new Date(),
        NotificationTypeEnum.Success,
        NotificationPosition.TopRight
      );
    } else {
      // Handle case where snapshotStore matching snapshot is not found
      console.error(`SnapshotStore matching ${snapshot.id} not found.`);
    }
  }

  private compareSnapshotState(
    stateA: Snapshot<T> | Snapshot<T>[] | null | undefined,
    stateB: Snapshot<T> | null | undefined
  ): boolean {
    if (!stateA && !stateB) {
      return true; // Both are null or undefined
    }

    if (!stateA || !stateB) {
      return false; // One is null or undefined while the other is not
    }

    // Helper function to compare snapshot objects
    const compareSnapshot = (
      snapshotA: Snapshot<T>,
      snapshotB: Snapshot<T>
    ): boolean => {
      if (!snapshotA && !snapshotB) {
        return true; // Both are null or undefined
      }

      if (!snapshotA || !snapshotB) {
        return false; // One is null or undefined while the other is not
      }

      // Compare based on available properties
      if (snapshotA._id !== undefined && snapshotB._id !== undefined) {
        return snapshotA._id === snapshotB._id;
      }

      return (
        snapshotA.id === snapshotB.id &&
        snapshotA.data === snapshotB.data &&
        snapshotA.name === snapshotB.name &&
        snapshotA.timestamp === snapshotB.timestamp &&
        snapshotA.title === snapshotB.title &&
        snapshotA.createdBy === snapshotB.createdBy &&
        snapshotA.description === snapshotB.description &&
        snapshotA.tags === snapshotB.tags &&
        snapshotA.subscriberId === snapshotB.subscriberId &&
        snapshotA.store === snapshotB.store &&
        this.compareSnapshotState(snapshotA.state, snapshotB.state) &&
        snapshotA.todoSnapshotId === snapshotB.todoSnapshotId &&
        snapshotA.initialState === snapshotB.initialState
        // Add more properties as needed
      );
    };

    // Compare stateA and stateB appropriately based on your application logic
    if (Array.isArray(stateA) !== Array.isArray(stateB)) {
      return false; // One is an array and the other is not
    }

    if (Array.isArray(stateA)) {
      const arrA = stateA as Snapshot<T>[];
      const arrB = stateB as unknown as Snapshot<T>[];

      if (arrA.length !== arrB.length) {
        return false; // Arrays have different lengths
      }

      for (let i = 0; i < arrA.length; i++) {
        if (!compareSnapshot(arrA[i], arrB[i])) {
          return false; // Arrays differ at index i
        }
      }

      return true; // Arrays are deeply equal
    } else {
      return compareSnapshot(stateA as Snapshot<T>, stateB as Snapshot<T>);
    }
  }

  private deepCompare(objA: any, objB: any): boolean {
    // Basic deep comparison for objects
    const keysA = Object.keys(objA);
    const keysB = Object.keys(objB);

    if (keysA.length !== keysB.length) {
      return false; // Different number of keys
    }

    for (let key of keysA) {
      if (objA[key] !== objB[key]) {
        return false; // Different value for key
      }
    }

    return true; // Objects are deeply equal
  }

  private shallowCompare(objA: any, objB: any): boolean {
    // Basic shallow comparison for objects
    return JSON.stringify(objA) === JSON.stringify(objB);
  }

  private determinePrefix<T extends Data>(
    snapshot: T | null | undefined,
    category: string
  ): string {
    if (category === "user") {
      return "USR";
    } else if (category === "team") {
      return "TM";
    } else if (category === "project") {
      return "PRJ";
    } else if (category === "task") {
      return "TSK";
    } else if (category === "event") {
      return "EVT";
    } else if (category === "file") {
      return "FIL";
    } else if (category === "document") {
      return "DOC";
    } else if (category === "message") {
      return "MSG";
    } else if (category === "location") {
      return "LOC";
    } else if (category === "coupon") {
      return "CPN";
    } else if (category === "video") {
      return "VID";
    } else if (category === "survey") {
      return "SRV";
    } else if (category === "analytics") {
      return "ANL";
    } else if (category === "chat") {
      return "CHT";
    } else if (category === "thread") {
      return "THD";
    } else if (snapshot?.name) {
      // Ensure snapshot is not null or undefined
      return "SNAP";
    } else {
      return "GEN"; // Default prefix
    }
  }

  async updateSnapshot(
    snapshotId: string,
    data: SnapshotStore<Snapshot<T>>,
    events: Record<string, CalendarEvent[]>,
    snapshotStore: SnapshotStore<Snapshot<T>>,
    dataItems: RealtimeDataItem[],
    newData: T,
    payload: UpdateSnapshotPayload<T>
  ): Promise<void> {
    try {
      // Check if snapshotStore.data is not null before proceeding
      if (!snapshotStore.data) {
        throw new Error("SnapshotStore data is null");
      }
  
      // Create updated snapshot data
      const updatedSnapshotData: Snapshot<T> = {
        id: snapshotId,
        data: {
          ...(snapshotStore.data.data || {} as T), // Ensure default empty object if data is undefined
          ...newData,
        },
        timestamp: new Date(),
        category: "update",
        length: 0,
        content: undefined as undefined, // Explicitly assign undefined
      };
  
      // Assign updated snapshot data back to snapshotStore.data
      snapshotStore.data = updatedSnapshotData;
  
      console.log("Snapshot updated successfully:", snapshotStore);
    } catch (error) {
      console.error("Error updating snapshot:", error);
      throw error;
    }
  }
  
  

  updateSnapshotSuccess(): void {
    notify(
      "updateSnapshotSuccess",
      "Snapshot updated successfully.",
      "",
      new Date(),
      NotificationTypeEnum.Success,
      NotificationPosition.TopRight
    );
  }

  updateSnapshotFailure(payload: { error: string }): void {
    notify(
      "updateSnapshotFailure",
      `Error updating snapshot: ${payload.error}`,
      "",
      new Date(),
      NotificationTypeEnum.Error,
      NotificationPosition.TopRight
    );
  }

  removeSnapshot(snapshotToRemove: SnapshotStore<Snapshot<T>>): void {
    this.snapshots = this.snapshots.filter((s) => s.id !== snapshotToRemove.id);
    notify(
      "removeSnapshot",
      `Snapshot ${snapshotToRemove.id} removed successfully.`,
      "",
      new Date(),
      NotificationTypeEnum.Success,
      NotificationPosition.TopRight
    );
  }

  clearSnapshots(): void {
    this.snapshots = [];
    notify(
      "clearSnapshots",
      "All snapshots cleared.",
      "",
      new Date(),
      NotificationTypeEnum.Success,
      NotificationPosition.TopRight
    );
  }

  addSnapshot(
    snapshot: Data | undefined,
    subscribers: Subscriber<CustomSnapshotData | T>[]
  ): void {
    const snapshotData: Snapshot<T> = {
      id: "",
      data: snapshot?.data ?? ({} as T),
      timestamp: new Date(),
      category: this.category,
      subscribers: [],
      delegate: this.delegate,
      key: this.key,
      config: this.config,
      snapshotConfig: this.snapshotConfig,
      set: this.set,
      state: this.state,
      snapshots: this.snapshots,
      topic: this.topic,
      configOption: this.configOption,
      subscription: this.subscription,
      initialState: this.initialState,
      determinePrefix: this.determinePrefix,
      updateSnapshot: this.updateSnapshot,
      updateSnapshotSuccess: this.updateSnapshotSuccess,
      updateSnapshotFailure: this.updateSnapshotFailure,
      removeSnapshot: this.removeSnapshot,
      clearSnapshots: this.clearSnapshots,
      addSnapshot: this.addSnapshot,
      addSnapshotSuccess: this.addSnapshotSuccess,
      addSnapshotFailure: this.addSnapshotFailure,
      notifySubscribers: this.notifySubscribers,
      createSnapshot: this.createSnapshot,
      createSnapshotSuccess: this.createSnapshotSuccess,
      createSnapshotFailure: this.createSnapshotFailure,
      updateSnapshots: this.updateSnapshots,
      updateSnapshotsSuccess: this.updateSnapshotsSuccess,
      updateSnapshotsFailure: this.updateSnapshotsFailure,
      initSnapshot: this.initSnapshot,
      takeSnapshot: this.takeSnapshot,
      takeSnapshotsSuccess: this.takeSnapshotsSuccess,
      configureSnapshotStore: this.configureSnapshotStore,
      getData: this.getData,
      takeSnapshotSuccess: this.takeSnapshotSuccess,
      flatMap: this.flatMap,
      setData: this.setData,
      getState: this.getState,
      setState: this.setState,
      validateSnapshot: this.validateSnapshot,
      handleSnapshot: this.handleSnapshot,
      handleActions: this.handleActions,
      setSnapshot: this.setSnapshot,
      setSnapshots: this.setSnapshots,
      clearSnapshot: this.clearSnapshot,
      mergeSnapshots: this.mergeSnapshots,
      reduceSnapshots: this.reduceSnapshots,
      sortSnapshots: this.sortSnapshots,
      filterSnapshots: this.filterSnapshots,
      mapSnapshots: this.mapSnapshots,
      findSnapshot: this.findSnapshot,
      getSubscribers: this.getSubscribers,
      notify: this.notify,
      subscribe: this.subscribe,
      unsubscribe: this.unsubscribe,
      fetchSnapshot: this.fetchSnapshot,
      fetchSnapshotSuccess: this.fetchSnapshotSuccess,
      fetchSnapshotFailure: this.fetchSnapshotFailure,
      getSnapshot: this.getSnapshot,
      getSnapshots: this.getSnapshots,
      getAllSnapshots: this.getAllSnapshots,
      generateId: this.generateId,
      batchFetchSnapshots: this.batchFetchSnapshots,
      batchTakeSnapshotsRequest: this.batchTakeSnapshotsRequest,
      batchUpdateSnapshotsRequest: this.batchUpdateSnapshotsRequest,
      batchFetchSnapshotsSuccess: this.batchFetchSnapshotsSuccess,
      batchFetchSnapshotsFailure: this.batchFetchSnapshotsFailure,
      batchUpdateSnapshotsSuccess: this.batchUpdateSnapshotsSuccess,
      batchUpdateSnapshotsFailure: this.batchUpdateSnapshotsFailure,
      batchTakeSnapshot: this.batchTakeSnapshot,
      handleSnapshotSuccess: this.handleSnapshotSuccess,
      [Symbol.iterator]: this[Symbol.iterator],
      [Symbol.asyncIterator]: this[Symbol.asyncIterator],
    };

    const prefix = this.determinePrefix(
      snapshot as Snapshot<Data>,
      this.category
    );
    const id = `${prefix}_${this.generateId()}`;
    snapshotData.id = id;

    const snapshotStoreData: SnapshotStore<Snapshot<T>> = {
      id: snapshotData.id,
      snapshots: [
        {
          data: snapshotData.data!,
          id: snapshotData.id,
          timestamp: snapshotData.timestamp as Date,
          category: snapshotData.category as string,
          key: "",
          topic: "",
          date: undefined,
          configOption: null,
          config: undefined,
          subscription: null,
          initialState: undefined,
          set: undefined,
          state: null,
          snapshots: [],
          subscribeToSnapshots: function (
            snapshotId: string,
            callback: (
              snapshot: Snapshot<Snapshot<Snapshot<Snapshot<T>>>>
            ) => void
          ): void {
            throw new Error("Function not implemented.");
          },
          subscribers: [],
          snapshotConfig: [],
          delegate: [],
          getItem: function (): Promise<> {
            throw new Error("Function not implemented.");
          },
          removeItem: function (): Promise<> {
            throw new Error("Function not implemented.");
          },
          compareSnapshotState: function (): boolean {
            throw new Error("Function not implemented.");
          },
          setItem: function (): Promise<> {
            throw new Error("Function not implemented.");
          },
          deepCompare: function (): boolean {
            throw new Error("Function not implemented.");
          },
          shallowCompare: function (): boolean {
            throw new Error("Function not implemented.");
          },
                    getDelegate: function (): SnapshotStoreConfig<
            Snapshot<Snapshot<Snapshot<Snapshot<T>>>>,
            Snapshot<Snapshot<Snapshot<T>>>
          >[] {
            throw new Error("Function not implemented.");
          },
          addSnapshotFailure: function (error: Error): void {
            throw new Error("Function not implemented.");
          },
          addSnapshotSuccess: function (
            snapshot: Snapshot<Snapshot<Snapshot<Snapshot<T>>>>,
            subscribers: Subscriber<
              CustomSnapshotData | Snapshot<Snapshot<Snapshot<T>>>
            >[]
          ): void {
            throw new Error("Function not implemented.");
          },
          determinePrefix: function <T extends Data>(
            snapshot: Snapshot<T>,
            category: string
          ): string {
            throw new Error("Function not implemented.");
          },
          updateSnapshot: function (
            snapshotId: string,
            data: SnapshotStore<Snapshot<Snapshot<Snapshot<Snapshot<T>>>>>,
            events: Record<string, CalendarEvent[]>,
            snapshotStore: SnapshotStore<
              Snapshot<Snapshot<Snapshot<Snapshot<T>>>>
            >,
            dataItems: RealtimeDataItem[],
            newData: Snapshot<Snapshot<Snapshot<T>>>,
            payload: UpdateSnapshotPayload<Snapshot<Snapshot<Snapshot<T>>>>
          ): Promise<void> {
            throw new Error("Function not implemented.");
          },
          updateSnapshotSuccess: function (): void {
            throw new Error("Function not implemented.");
          },
          updateSnapshotFailure: function (error: Payload): void {
            throw new Error("Function not implemented.");
          },
          removeSnapshot: function (
            snapshotToRemove: SnapshotStore<
              Snapshot<Snapshot<Snapshot<Snapshot<T>>>>
            >
          ): void {
            throw new Error("Function not implemented.");
          },
          clearSnapshots: function (): void {
            throw new Error("Function not implemented.");
          },
          addSnapshot: function (
            snapshot: Data | undefined,
            subscribers: Subscriber<
              CustomSnapshotData | Snapshot<Snapshot<Snapshot<T>>>
            >[]
          ): void {
            throw new Error("Function not implemented.");
          },
          createSnapshot: function (
            id: string,
            snapshotData:
              | Snapshot<Data>
              | Snapshot<Snapshot<Data>>
              | null
              | undefined
          ): Snapshot<Data> {
            throw new Error("Function not implemented.");
          },
          createSnapshotSuccess: function (snapshot: Snapshot<Data>): void {
            throw new Error("Function not implemented.");
          },
          createSnapshotFailure: function (error: Error): void {
            throw new Error("Function not implemented.");
          },
          updateSnapshots: function (): void {
            throw new Error("Function not implemented.");
          },
          updateSnapshotsSuccess: function (): void {
            throw new Error("Function not implemented.");
          },
          updateSnapshotsFailure: function (error: Payload): void {
            throw new Error("Function not implemented.");
          },
          initSnapshot: function (
            snapshotStore: SnapshotStoreConfig<
              Snapshot<Snapshot<Snapshot<Snapshot<Snapshot<T>>>>>,
              Snapshot<Snapshot<Snapshot<Snapshot<T>>>>
            >,
            snapshotData: Snapshot<Snapshot<Snapshot<Snapshot<Snapshot<T>>>>>
          ): void {
            throw new Error("Function not implemented.");
          },
          takeSnapshot: function (
            snapshot: SnapshotStore<Snapshot<Snapshot<Snapshot<Snapshot<T>>>>>
          ): Promise<{
            snapshot: Snapshot<Snapshot<Snapshot<Snapshot<Snapshot<T>>>>>;
          }> {
            throw new Error("Function not implemented.");
          },
          takeSnapshotSuccess: function (
            snapshot: SnapshotStore<Snapshot<Snapshot<Snapshot<T>>>>
          ): void {
            throw new Error("Function not implemented.");
          },
          takeSnapshotsSuccess: function (
            snapshots: Snapshot<Snapshot<Snapshot<Snapshot<T>>>>[]
          ): void {
            throw new Error("Function not implemented.");
          },
          configureSnapshotStore: function (): void {
            throw new Error("Function not implemented.");
          },
          getData: function (): Promise<Snapshots<Snapshot<Data>>> {
            throw new Error("Function not implemented.");
          },
          flatMap: function (): void {
            throw new Error("Function not implemented.");
          },
          setData: function (data: Data): void {
            throw new Error("Function not implemented.");
          },
          getState: function () {
            throw new Error("Function not implemented.");
          },
          setState: function (state: any): void {
            throw new Error("Function not implemented.");
          },
          validateSnapshot: function (snapshot: Snapshot<Data>): boolean {
            throw new Error("Function not implemented.");
          },
          handleSnapshot: function (
            snapshot: Snapshot<Data> | null,
            snapshotId: string
          ): void {
            throw new Error("Function not implemented.");
          },
          handleActions: function (): void {
            throw new Error("Function not implemented.");
          },
          setSnapshot: function (
            snapshot: SnapshotStore<Snapshot<Snapshot<Snapshot<Snapshot<T>>>>>
          ): void {
            throw new Error("Function not implemented.");
          },
          setSnapshots: function (
            snapshots: Snapshot<Snapshot<Snapshot<Snapshot<T>>>>[]
          ): void {
            throw new Error("Function not implemented.");
          },
          clearSnapshot: function (snapshotId: string): void {
            throw new Error("Function not implemented.");
          },
          mergeSnapshots: function (
            snapshots: Snapshot<Snapshot<Snapshot<Snapshot<T>>>>[]
          ): void {
            throw new Error("Function not implemented.");
          },
          reduceSnapshots: function (): void {
            throw new Error("Function not implemented.");
          },
          sortSnapshots: function (): void {
            throw new Error("Function not implemented.");
          },
          filterSnapshots: function (): void {
            throw new Error("Function not implemented.");
          },
          mapSnapshots: function (): void {
            throw new Error("Function not implemented.");
          },
          findSnapshot: function (): void {
            throw new Error("Function not implemented.");
          },
          getSubscribers: function (): void {
            throw new Error("Function not implemented.");
          },
          notify: function (): void {
            throw new Error("Function not implemented.");
          },
          notifySubscribers: function (): void {
            throw new Error("Function not implemented.");
          },
          subscribe: function (): void {
            throw new Error("Function not implemented.");
          },
          unsubscribe: function (): void {
            throw new Error("Function not implemented.");
          },
          fetchSnapshot: function (): void {
            throw new Error("Function not implemented.");
          },
          fetchSnapshotSuccess: function (
            snapshot: Snapshot<Data> | null,
            snapshotId: string
          ): void {
            throw new Error("Function not implemented.");
          },
          fetchSnapshotFailure: function (): void {
            throw new Error("Function not implemented.");
          },
          getSnapshot: function (): void {
            throw new Error("Function not implemented.");
          },
          getSnapshots: function (): void {
            throw new Error("Function not implemented.");
          },
          getAllSnapshots: function (): void {
            throw new Error("Function not implemented.");
          },
          generateId: function (): string {
            throw new Error("Function not implemented.");
          },
          batchFetchSnapshots: function (): void {
            throw new Error("Function not implemented.");
          },
          batchTakeSnapshotsRequest: function (): void {
            throw new Error("Function not implemented.");
          },
          batchUpdateSnapshotsRequest: function (): void {
            throw new Error("Function not implemented.");
          },
          batchFetchSnapshotsSuccess: function (): void {
            throw new Error("Function not implemented.");
          },
          batchFetchSnapshotsFailure: function (): void {
            throw new Error("Function not implemented.");
          },
          batchUpdateSnapshotsSuccess: function (): void {
            throw new Error("Function not implemented.");
          },
          batchUpdateSnapshotsFailure: function (): void {
            throw new Error("Function not implemented.");
          },
          batchTakeSnapshot: function (
            snapshot: SnapshotStore<Snapshot<Snapshot<Snapshot<Snapshot<T>>>>>,
            snapshots: Snapshots<Snapshot<Snapshot<Snapshot<Snapshot<T>>>>>
          ): Promise<{
            snapshots: Snapshots<Snapshot<Snapshot<Snapshot<Snapshot<T>>>>>;
          }> {
            throw new Error("Function not implemented.");
          },
          handleSnapshotSuccess: function (
            snapshot: Snapshot<Data> | null,
            snapshotId: string
          ): void {
            throw new Error("Function not implemented.");
          },
          [Symbol.iterator]: function (): IterableIterator<
            Snapshot<Snapshot<Snapshot<T>>>
          > {
            throw new Error("Function not implemented.");
          },
          [Symbol.asyncIterator]: function (): AsyncIterableIterator<
            Snapshot<Snapshot<Snapshot<T>>>
          > {
            throw new Error("Function not implemented.");
          },
        },
      ],
    };

    this.snapshots.push(snapshotStoreData);
    this.addSnapshotSuccess(snapshotData, subscribers);
    this.notifySubscribers(snapshotData, subscribers);
    this.delegate.addSnapshot(snapshotData, subscribers);
    this.delegate.notifySubscribers(snapshotData, subscribers);
  }

  createSnapshot(
    id: string,
    snapshotData: SnapshotStoreConfig<any, T>,
    category: string
  ): Snapshot<Data> {
    if (!snapshotData) {
      throw new Error("snapshotData is null or undefined");
    }

    let data: Data;
    if ("data" in snapshotData && snapshotData.data) {
      data = snapshotData.data;
    } else if (snapshotData.data && "data" in snapshotData.data) {
      data = snapshotData.data.data;
    } else {
      throw new Error("snapshotData does not have a valid 'data' property");
    }

    id =
      typeof data.id === "string"
        ? data.id
        : String(
            UniqueIDGenerator.generateID(
              "SNAP",
              "defaultID",
              NotificationTypeEnum.GeneratedID
            )
          );

    const snapshot: Snapshot<Data> = {
      id,
      data,
      timestamp: snapshotData.timestamp || new Date(),
      category: this.category,
      topic: this.topic,
      
    };

    this.snapshots.push(snapshot);
    this.delegate[0].createSnapshotSuccess(snapshot);

    return snapshot;
  }

  createSnapshotSuccess(snapshot: Snapshot<Data>): void {
    if (snapshot.id !== undefined) {
      notify(
        String(snapshot.id), // Ensure snapshot.id is treated as a string
        `Snapshot ${snapshot.id} created successfully.`,
        "",
        new Date(),
        NotificationTypeEnum.Success,
        NotificationPosition.TopRight
      );
    } else {
      console.error("Snapshot id is undefined.");
      // Optionally handle the case where snapshot.id is undefined
    }
  }

  setSnapshotSuccess(snapshotData: SnapshotStore<Snapshot<T>>, subscribers: ((data: Snapshot<Snapshot<T>>) => void)[]): void { 
    this.delegate[0].setSnapshotSuccess(snapshotData, subscribers);
  }

  private createSnapshotFailure(error: Error): void {
    notify(
      "createSnapshotFailure",
      `Error creating snapshot: ${error.message}`,
      "",
      new Date(),
      NotificationTypeEnum.Error,
      NotificationPosition.TopRight
    );
    this.delegate[0].createSnapshotFailure(error);
  }

   // Example method similar to updateSnapshots
   private updateSnapshots(): void {
    this.delegate[0].updateSnapshots();
  }

  // Example method similar to updateSnapshotsSuccess
  private updateSnapshotsSuccess(
    snapshotData: (subscribers: Subscriber<Snapshot<Snapshot<T>>>[], snapshot: Snapshots<T>)=>void ): void {
    if (this.delegate.length > 0 && typeof this.delegate[0].updateSnapshotsSuccess === 'function') {
      this.delegate[0].updateSnapshotsSuccess(snapshotData);
    }
  }

  private updateSnapshotsFailure(error: Payload): void {
    this.delegate[0].updateSnapshotsFailure(error);
  }

  private initSnapshot(
    snapshotStore: SnapshotStoreConfig<Snapshot<Snapshot<T>>, Snapshot<T>>,
    snapshotData: Snapshot<Snapshot<T>>
  ): void {
    return this.delegate[0].initSnapshot(snapshotStore, snapshotData);
  }

  
  async takeSnapshot(snapshot: SnapshotStore<Snapshot<T>>): Promise<{ snapshot: Snapshot<Snapshot<T>> }> {
    const result = await this.delegate[0].takeSnapshot(snapshot);
    if (result !== null && Array.isArray(result)) {
      const snapshotWrapper: Snapshot<Snapshot<T>> = {
        ...result[0],
        data: result[0].data as Snapshot<T>,
        timestamp: result[0].timestamp,
        type: result[0].type,
        id: result[0].id,
        key: result[0].key,
      };
      return {
        snapshot: snapshotWrapper,
      };
    }
    throw new Error("Failed to take snapshot");
  }

  

  private takeSnapshotSuccess(snapshot: SnapshotStore<Snapshot<T>>): void {
    this.delegate[0].takeSnapshotSuccess(snapshot);
  }

  private takeSnapshotsSuccess(snapshots: Snapshot<T>[]): void {
    this.delegate[0].takeSnapshotsSuccess(snapshots);
  }

  private configureSnapshotStore(
    snapshot: SnapshotStore<Snapshot<T>>
  ): void {
    this.delegate[0].configureSnapshotStore(snapshot);
  }

  private async getData(): Promise<Snapshots<Snapshot<Data>>> {
    // Get data from the first delegate
    const data = await this.delegate[0].getData(undefined as unknown as Snapshots<T>);
    // Return the data in the required format
    return [{ data }];
  }

  public flatMap(
    value: SnapshotStoreConfig<Snapshot<T>, T>,
    index: number,
    array: SnapshotStoreConfig<Snapshot<T>, T>[]
  ): void {
    this.delegate.forEach((delegateItem, i, arr) => {
      // Ensure the value type matches the delegateItem type
      const valueAsExpectedType = value as SnapshotStoreConfig<Snapshot<T>, T>;
      delegateItem.flatMap(valueAsExpectedType, index, array);
    });
  }

  private setData(data: Data): void {
    this.delegate.setData(data);
  }

  private getState(): any {
    return this.delegate.getState();
  }

  private setState(state: any): void {
    this.delegate.setState(state);
  }

  private validateSnapshot(snapshot: Snapshot<Data>): boolean {
    return this.delegate[0].validateSnapshot(snapshot);
  }

  private handleSnapshot(
    snapshot: Snapshot<Data> | null,
    snapshotId: string
  ): void {
    this.delegate.handleSnapshot(snapshot, snapshotId);
  }

  private handleActions(): void {
    this.delegate.handleActions();
  }

  private setSnapshot(snapshot: SnapshotStore<Snapshot<T>>): void {
    this.delegate.setSnapshot(snapshot);
  }

  private setSnapshots(snapshots: Snapshot<T>[]): void {
    this.delegate.setSnapshots(snapshots);
  }

  private clearSnapshot(snapshotId: string): void {
    this.delegate.clearSnapshot(snapshotId);
  }

  private mergeSnapshots(snapshots: Snapshot<T>[]): void {
    this.delegate.mergeSnapshots(snapshots);
  }

  private reduceSnapshots(): void {
    this.delegate.reduceSnapshots();
  }

  private sortSnapshots(): void {
    this.delegate.sortSnapshots();
  }

  private filterSnapshots(): void {
    this.delegate.filterSnapshots();
  }

  private mapSnapshots(): void {
    this.delegate.mapSnapshots();
  }

  private findSnapshot(): void {
    this.delegate.findSnapshot();
  }

  private getSubscribers(): void {
    this.delegate.getSubscribers();
  }

  private notify(): // id: string,
  // message: string,
  // content: any,
  // date: Date,
  // type: NotificationType,
  // notificationPosition?: NotificationPosition | undefined
  void {
    this.delegate.notify();
  }

  private notifySubscribers(): void {
    this.delegate.notifySubscribers();
  }

  private subscribe(): void {
    this.delegate.subscribe();
  }

  private unsubscribe(): void {
    this.delegate.unsubscribe();
  }

  private fetchSnapshot(): void {
    this.delegate.fetchSnapshot();
  }

  private fetchSnapshotSuccess(
    snapshot: Snapshot<Data> | null,
    snapshotId: string
  ): void {
    this.delegate.fetchSnapshotSuccess(snapshot, snapshotId);
  }

  private fetchSnapshotFailure(): void {
    this.delegate.fetchSnapshotFailure();
  }

  private getSnapshot(): void {
    this.delegate.getSnapshot();
  }

  private getSnapshots(): void {
    this.delegate.getSnapshots();
  }

  private getAllSnapshots(): void {
    this.delegate.getAllSnapshots();
  }
  private generateId(): string {
    const delegateWithGenerateId = this.delegate.find((d) => d.generateId);
    const generatedId = delegateWithGenerateId?.generateId();
    return typeof generatedId === "string" ? generatedId : "";
  }

  private batchFetchSnapshots(): void {
    this.delegate.batchFetchSnapshots();
  }

  private batchTakeSnapshotsRequest(): void {
    this.delegate.batchTakeSnapshotsRequest();
  }

  private batchUpdateSnapshotsRequest(): void {
    this.delegate.batchUpdateSnapshotsRequest();
  }

  private batchFetchSnapshotsSuccess(): void {
    this.delegate.batchFetchSnapshotsSuccess();
  }

  private batchFetchSnapshotsFailure(): void {
    this.delegate.batchFetchSnapshotsFailure();
  }

  private batchUpdateSnapshotsSuccess(): void {
    this.delegate.batchUpdateSnapshotsSuccess();
  }

  private batchUpdateSnapshotsFailure(): void {
    this.delegate.batchUpdateSnapshotsFailure();
  }

  private batchTakeSnapshot(
    snapshot: SnapshotStore<Snapshot<T>>,
    snapshots: Snapshots<Snapshot<T>>
  ): Promise<{ snapshots: Snapshots<Snapshot<T>> }> {
    return new Promise((resolve) => {
      const result = this.delegate.batchTakeSnapshot();
      resolve({ snapshots: result });
    });
  }

  handleSnapshotSuccess(
    snapshot: Snapshot<Data> | null,
    snapshotId: string
  ): void {
    // Ensure the snapshot is not null before proceeding
    if (snapshot) {
      // Perform actions required for handling the successful snapshot
      // For example, updating internal state, notifying subscribers, etc.
      SnapshotActions.handleSnapshotSuccess({ snapshot, snapshotId });
      console.log(`Handling success for snapshot ID: ${snapshotId}`);
      // Implement additional logic here based on your application's needs
    }
    // No return statement needed since the method should return void
  }

  // Implementing [Symbol.iterator] method
  [Symbol.iterator](): IterableIterator<Snapshot<T>> {
    return this.snapshots.values() as IterableIterator<Snapshot<T>>;
    // Adjust the return type to match IterableIterator<Snapshot<T>>
  }

  // Implementing [Symbol.asyncIterator] method
  [Symbol.asyncIterator](): AsyncIterableIterator<Snapshot<T>> {
    const asyncIterable: AsyncIterable<Snapshot<T>> = {
      [Symbol.asyncIterator]: async () => this[Symbol.asyncIterator](),
      next: async () => ({ done: true, value: undefined }),
    };

    return asyncIterable[Symbol.asyncIterator]();
    // Adjust the return type to match AsyncIterableIterator<Snapshot<T>>
  }

  isExpired?(): boolean {
    return this.expirationDate ? new Date() > this.expirationDate : false;
  }
  compress?(): void {
    // Implementation here
  }
  isEncrypted?: boolean;
  encrypt?(): void {
    // Implementation here
  }
  decrypt?(): void {
    // Implementation here
  }
  ownerId?: string;
  getOwner?(): string {
    return this.ownerId || "";
  }
  version?: string;
  previousVersionId?: string;
  nextVersionId?: string;
  auditTrail?: AuditRecord[];
  addAuditRecord?(record: AuditRecord): void {
    // Implementation here
  }
  retentionPolicy?: RetentionPolicy;
  dependencies?: string[];
}

// Example usage of the Snapshot interface
const takeSnapshot = async () => {
  const snapshotData = await fetchInitialSnapshotData();
  const { takeSnapshot } = useSnapshotStore(addToSnapshotList);
  const snapshot = await takeSnapshot(snapshotData);
  console.log(snapshot);
};

// Example functions for adding snapshots to the UI and displaying toast messages
const addToSnapshotList = (snapshot: Snapshot<Data>) => {
  // Assuming you have a function to add the snapshot to a list in your UI
  console.log("Snapshot added to list:", snapshot);
};

const displayToast = (message: string) => {
  // Assuming you have a function to display toast messages in your UI
  console.log("Toast message:", message);
};

const handleSnapshotOperation = async (
  snapshot: Snapshot<Data> | null,
  snapshotId: string
) => {
  // Assuming you have a function to handle the snapshot operation in your UI
  console.log("Snapshot operation handled:", snapshot, snapshotId);
  // Implement additional logic here based on your application's needs
  // For example, updating internal state, notifying subscribers, etc.
  SnapshotActions.handleSnapshotSuccess({ snapshot, snapshotId });
  // No return statement needed since the method should return void
};

// Example functions for fetching initial snapshot data and current data
const fetchInitialSnapshotData = async (): Promise<Snapshot<Data>[]> => {
  await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate delay of 1 second

  // Return initial snapshot data as an array of Snapshot<Data> objects
  return [
    {
      id: "1",
      data: {
        exampleData: "Initial snapshot data 1",
        timestamp: undefined,
        category: "",
      },
      timestamp: new Date(),
      category: "Initial Category 1",
      type: "",
      store: {} as SnapshotStore<Snapshot<Data>>,
    },
    {
      id: "2",
      data: {
        exampleData: "Initial snapshot data 2",
        timestamp: undefined,
        category: "",
      },
      timestamp: new Date(),
      category: "Initial Category 2",
      type: "",
      store: {} as SnapshotStore<Snapshot<Data>>,
    },
  ];
};

// Usage example:
const snapshotId = useSnapshotStore(addToSnapshotList);
// const snapshotId = "exampleSnapshotId";
const data = new SnapshotStore<Snapshot<Data>>(
  snapshotId,
  caategory,
  initialState,
  handleSnapshotOperation,
  displayToast,
  addToSnapshotList,
  delegate
  // fetchInitialSnapshotData,
  // fetch
);
const events: Record<string, CalendarEvent[]> = {};
const snapshotStore = new SnapshotStore<Snapshot<Data>>();
const dataItems: RealtimeDataItem[] = [];
const newData: Data = {
  /* new data properties */
};
const payload: UpdateSnapshotPayload<Data> = {
  /* payload properties */
};

const component = new YourComponent<Data>();

component
  .updateSnapshot(
    snapshotId,
    data,
    events,
    snapshotStore,
    dataItems,
    newData,
    payload
  )
  .then(() => {
    console.log("Snapshot update completed.");
  })
  .catch((error: any) => {
    console.error("Error during snapshot update:", error);
  });

const snapshotStoreConfig: SnapshotStoreConfig<any, any> = {
  snapshotId: "exampleSnapshotId",
  category: "exampleCategory",
  initialState: {
    title: "Initial snapshot data",
    timestamp: undefined,
    category: "",
    store: {
      id: "exampleSnapshotId",
      key: "exampleSnapshotId",
      topic: "exampleSnapshotId",
      data: {}, // Adjust this according to your actual structure
    },
  },
  handleSnapshotOperation: handleSnapshotOperation,
  displayToast: displayToast,
  addToSnapshotList: addToSnapshotList,
  fetchInitialSnapshotData: fetchInitialSnapshotData,
  fetch: fetch,
};

export default SnapshotStore;
export { handleSnapshotOperation, initialState, snapshotStoreConfig };
export type {
  SnapshotStoreSubset,
};
