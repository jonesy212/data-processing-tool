// import { Snapshots } from '@/app/components/snapshots/SnapshotStore';
import { handleApiError } from "@/app/api/ApiLogs";
import { RealtimeDataItem } from "@/app/components/models/realtime/RealtimeData";
import {
  NotificationType,
  NotificationTypeEnum,
  useNotification,
} from "@/app/components/support/NotificationContext";
import { StructuredMetadata } from "@/app/configs/StructuredMetadata";
import UniqueIDGenerator from "@/app/generators/GenerateUniqueIds";
import { MessageType } from "@/app/generators/MessaageType";
import { CategoryProperties } from "@/app/pages/personas/ScenarioBuilder";
import operation from "antd/es/transfer/operation";
import { AxiosError } from "axios";
import { error } from "console";
import { IHydrateResult } from "mobx-persist";
import { config } from "process";
import { useDispatch } from "react-redux";
import {
  CodingLanguageEnum,
  LanguageEnum,
} from "../communications/LanguageEnum";
import { DocumentTypeEnum } from "../documents/DocumentGenerator";
import { FileTypeEnum } from "../documents/FileType";
import defaultImplementation from "../event/defaultImplementation";
import FormatEnum from "../form/FormatEnum";
import {
  CombinedEvents,
  SnapshotManager,
  SnapshotStoreOptions,
} from "../hooks/useSnapshotManager";
import AnimationTypeEnum from "../libraries/animations/AnimationLibrary";
import { mapToSnapshotStore } from "../mappings/mapToSnapshotStore";
import { Content } from "../models/content/AddContent";
import { BaseData, Data } from "../models/data/Data";
import {
  BookmarkStatus,
  CalendarStatus,
  DataStatus,
  DevelopmentPhaseEnum,
  NotificationPosition,
  NotificationStatus,
  PriorityTypeEnum,
  PrivacySettingEnum,
  ProjectPhaseTypeEnum,
  StatusType,
  SubscriberTypeEnum,
  SubscriptionTypeEnum,
  TaskStatus,
  TeamStatus,
  TodoStatus,
} from "../models/data/StatusType";
import { ContentManagementPhaseEnum } from "../phases/ContentManagementPhase";
import { FeedbackPhaseEnum } from "../phases/FeedbackPhase";
import { TaskPhaseEnum } from "../phases/TaskProcess";
import { TenantManagementPhaseEnum } from "../phases/TenantManagementPhase";
import { AnalysisTypeEnum } from "../projects/DataAnalysisPhase/AnalysisType";
import {
  DataStoreMethods,
  DataStoreWithSnapshotMethods,
} from "../projects/DataAnalysisPhase/DataProcessing/ DataStoreMethods";
import { DataStore } from "../projects/DataAnalysisPhase/DataProcessing/DataStore";
import { SearchCriteria } from "../routing/SearchCriteria";
import { SecurityFeatureEnum } from "../security/SecurityFeatureEnum";
import { initialState } from "../state/redux/slices/FilteredEventsSlice";
import CalendarManagerStoreClass from "../state/stores/CalendarEvent";
import { Subscription } from "../subscriptions/Subscription";
import {
  convertSnapshotStoreToMap,
  convertSnapshotStoreToSnapshot,
  convertToDataStore,
  isSnapshotStore,
  snapshotType,
} from "../typings/YourSpecificSnapshotType";
import { userId } from "../users/ApiUser";
import { AuditRecord, Subscriber } from "../users/Subscriber";
import { IdeaCreationPhaseEnum } from "../users/userJourney/IdeaCreationPhase";
import { addToSnapshotList, isSnapshot } from "../utils/snapshotUtils";
import {
  Payload,
  Snapshot,
  Snapshots,
  SnapshotsArray,
  SnapshotsObject,
  SnapshotUnion,
  UpdateSnapshotPayload,
} from "./LocalStorageSnapshotStore";
import {
  SnapshotActions,
  SnapshotOperation,
} from "./SnapshotActions";
import {
  ConfigureSnapshotStorePayload,
  RetentionPolicy,
} from "./SnapshotConfig";
import { SnapshotContainer } from "./SnapshotContainer";
import { SnapshotData } from "./SnapshotData";
import { SnapshotItem } from "./SnapshotList";
import { SnapshotStoreConfig } from "./SnapshotStoreConfig";
import { SnapshotStoreMethod } from "./SnapshotStoreMethod";
import { SnapshotWithCriteria, TagsRecord } from "./SnapshotWithCriteria";
import { SnapshotConfig } from "./snapshot";
import { delegate } from "./snapshotHandlers";
import { Callback } from "./subscribeToSnapshotsImplementation";
import { useSnapshotStore } from "./useSnapshotStore";
import {
  CreateSnapshotsPayload,
  CreateSnapshotStoresPayload
} from "../database/Payload";
import Version from "../versions/Version";
import { Category } from "../libraries/categories/generateCategoryProperties";

// const { notify } = useNotification();
// const dispatch = useDispatch();
// const notificationContext = useNotification();

// interface FetchableDataStore<T extends BaseData, K extends BaseData = T> {
//   getData(): Promise<DataStore<T, K>[]>;
// }

// type SubscriberCollection<T extends BaseData, K extends BaseData = T> =
//   | Subscriber<T, K>[]
//   | Record<string, Subscriber<T, K>[]>;

// const initializeData = (): Data => {
//   return {
//     id: "initial-id",
//     name: "Initial Name",
//     value: "Initial Value",
//     timestamp: new Date(),
//     category: "Initial Category",
//   };
// };

// export const defaultCategory: CategoryProperties = {
//   name: "DefaultCategory",
//   description: "",
//   icon: "",
//   color: "",
//   iconColor: "",
//   isActive: true,
//   isPublic: true,
//   isSystem: true,
//   isDefault: true,
//   isHidden: false,
//   isHiddenInList: false,
//   UserInterface: [],
//   DataVisualization: [],
//   Forms: undefined,
//   Analysis: [],
//   Communication: [],
//   TaskManagement: [],
//   Crypto: [],
//   brandName: "",
//   brandLogo: "",
//   brandColor: "",
//   brandMessage: "",
// };

class SnapshotStore<T extends BaseData, K extends BaseData = T>
  implements DataStore<T, K>, SnapshotWithCriteria<T, K>
{
  id: string | number = "";
  snapshotId?: string | number | undefined = undefined;
  key: string = "";
  keys: string[] = [];
  topic: string = "";
  date: string | number | Date | undefined;
  configOption?:
    | string
    | SnapshotStoreConfig<SnapshotWithCriteria<any, BaseData>, K>
    | null = null;
  config:
    | SnapshotStoreConfig<SnapshotWithCriteria<any, BaseData>, K>[]
    | null
    | undefined = undefined;
  operation: SnapshotOperation;
  title: string = "";
  subscription?: Subscription<T, K> | null = null;
  description?: string | undefined = "";
  category: Category | undefined;
  categoryProperties: CategoryProperties | undefined;
  message: string | undefined;
  timestamp: string | number | Date | undefined;
  createdBy: string;
  eventRecords: Record<string, CalendarManagerStoreClass<BaseData, any>[]> | null = null;
  type: string | undefined | null = "";

  subscribers: SubscriberCollection<T, K>;
  set?: (
    data: T | Map<string, Snapshot<T, K>>,
    type: string,
    event: Event
  ) => void | null;
  setStore?: (
    data: T | Map<string, SnapshotStore<T, K>>,
    type: string,
    event: Event
  ) => void | null;
  data?: T | Map<string, Snapshot<T, K>> | null = null;
  state?: Snapshot<T, K>[] | null = null; // Adjusted to match Snapshot<T, K> structure
  store: SnapshotStore<T, K> | undefined | null = null;
  stores: SnapshotStore<T, K>[] | null = null;
  snapshots: SnapshotsArray<T> = [];
  snapshotConfig: any;
  expirationDate?: Date;
  priority?: PriorityTypeEnum | undefined;
  tags?: TagsRecord;
  metadata?: StructuredMetadata | undefined;
  meta: Map<string, Snapshot<T, K>> | {} = {};
  status?: StatusType | undefined;
  isCompressed?: boolean;
  snapshotMethods: SnapshotStoreMethod<T, K>[] | undefined;

  getSnapshotsBySubscriber: any;
  getSnapshotsBySubscriberSuccess: any;
  getSnapshotsByTopic: any;
  getSnapshotsByTopicSuccess: any;
  getSnapshotsByCategory: any;
  getSnapshotsByCategorySuccess: any;
  getSnapshotsByKey: any;
  getSnapshotsByKeySuccess: any;
  getSnapshotsByPriority: any;
  getSnapshotsByPrioritySuccess: any;
  getStoreData: any;
  updateStoreData: any;
  updateDelegate: any;
  getSnapshotContainer: any;
  getSnapshotVersions: any;
  createSnapshot: any;
  restoreSnapshot(): (
    snapshot: Snapshot<T, K>,
    snapshotData: Snapshot<T, any>,
    category: Category | undefined,
    callback: (snapshot: T) => void,
    snapshots: SnapshotsArray<T>,
    type: string,
    event: Event,
    snapshotContainer?: T,
    snapshotStoreConfig?: SnapshotStoreConfig<SnapshotWithCriteria<any, BaseData>, K>
  ) => void {
    return (
      snapshot,
      snapshotData,
      category,
      callback,
      snapshots,
      type,
      event,
      snapshotContainer,
      snapshotStoreConfig
    ) => {
      // Step 1: Update the snapshot data with the provided snapshotData
      
       // Step 1: Handle `this.id` being potentially undefined
       if (!this.id) {
        throw new Error('SnapshotStore ID is undefined');
      }

      // Step 2: Ensure `this.id` is a number if required by `updateData`
      const idAsNumber = typeof this.id === 'string' ? parseInt(this.id, 10) : this.id;

      if (isNaN(idAsNumber)) {
        throw new Error('SnapshotStore ID could not be converted to a number');
      }

      snapshot.updateData(idAsNumber, snapshotData);

  
      // Step 2: If a category is provided, assign the snapshot to that category
      if (category) {
        snapshot.setCategory(category);
      }
  
      // Step 3: Perform an action based on the type (e.g., "restore", "revert")
      switch (type) {
        case 'restore':
          // Add the snapshot to the snapshots array if not already present
          if (!snapshots.includes(snapshotData)) {
            snapshots.push(snapshotData);
          }
          break;
        case 'revert':
          // Remove the snapshot from the snapshots array if present
          const index = snapshots.indexOf(snapshotData);
          if (index !== -1) {
            snapshots.splice(index, 1);
          }
          break;
        default:
          console.warn(`Unknown type: ${type}`);
      }
  
      // Step 4: If a snapshotContainer is provided, update its data with the snapshotData
      if (snapshotContainer) {
        Object.assign(snapshotContainer, snapshotData);
      }
  
      // Step 5: If a snapshotStoreConfig is provided, use it to configure the snapshot
      if (snapshotStoreConfig) {
        // Update the snapshot store configuration with the provided config
        snapshot.applyStoreConfig(snapshotStoreConfig);
      }
  
      // Step 6: Invoke the callback function with the updated snapshotData
      callback(snapshotData);
  
      // Step 7: Trigger any necessary event actions
      if (event && typeof event.trigger === 'function') {
        event.trigger(type, snapshotData);
      }
    };
  }
  
  snapshotStoreConfig: any;
  // Getter for snapshotItems
  public getSnapshotItems(): (
    | SnapshotItem<T, K>
    | SnapshotStoreConfig<SnapshotUnion<T>, K>
  )[] {
    return this.snapshotItems; // Use Snapshot<T, K> if that's the correct type
  }

  // Ensure dataStore matches the expected type
  public dataStore: T | DataStore<T, K> | Map<string, SnapshotStore<T, K>> | SnapshotStore<T, K> | null | undefined;
  public mapDataStore: T | Map<string, DataStore<T, K>> | null | undefined;
  // public dataStore: Map<string, SnapshotStore<T, K>> | Map<string, Snapshot<T, K>> | null | undefined

  private snapshotStores: Map<number, SnapshotStore<T, K>> = new Map(); // In-memory storage for snapshot stores

  public initialState: Snapshot<T, K> | null | undefined;

  private snapshotItems: SnapshotItem<T, K>[] = [];

  // Use this property if you need to manage nested SnapshotStores
  private nestedStores: SnapshotStore<T, K>[] = [];

  private snapshotIds: string[] = [];

  protected dataStoreMethods:
    | DataStoreWithSnapshotMethods<T, K>
    | undefined
    | null = null;

  private delegate:
    | SnapshotStoreConfig<SnapshotWithCriteria<any, BaseData>, K>[]
    | undefined = [];

  private handleDelegate<T extends (...args: any[]) => any, R = ReturnType<T>>(
    method: (delegate: any) => T,
    ...args: Parameters<T>
  ): R | undefined {
    if (this.delegate && this.delegate.length > 0) {
      for (const delegate of this.delegate) {
        const func = method(delegate);
        if (func && typeof func === "function") {
          return func(...args);
        } else {
          console.error("Method is not a function on delegate");
        }
      }
    } else {
      console.error("Delegate is undefined or empty");
      return undefined;
    }
  }

  private notifySuccess(message: string): void {
    notify(
      "clearSnapshotSuccess",
      message,
      "",
      new Date(),
      NotificationTypeEnum.Success,
      NotificationPosition.TopRight
    );
  }

  private notifyFailure(message: string): void {
    notify(
      "clearSnapshotFailure",
      message,
      "",
      new Date(),
      NotificationTypeEnum.Error,
      NotificationPosition.TopRight
    );
  }

  // Placeholder methods to illustrate the implementation
  private findSnapshotStoreById(storeId: number): SnapshotStore<T, K> | null {
    console.log(`Looking for snapshot store with ID: ${storeId}`);

    const store = this.snapshotStores.get(storeId);

    if (store) {
      console.log(`Snapshot store found:`, store);
      return store;
    } else {
      console.log(`Snapshot store with ID ${storeId} not found.`);
      return null;
    }
  }


  // Implement the defaultSaveSnapshotStore method
  private async defaultSaveSnapshotStore(store: SnapshotStore<T, K>): Promise<void> {
    try {
      console.log(`Saving snapshot store with ID: ${store.storeId} (default method)`);
      this.snapshotStores.set(store.storeId, store);
      console.log(`Snapshot store saved successfully using default method.`);
    } catch (error) {
      console.error(`Failed to save snapshot store using default method:`, error);
    }
  }

  // Placeholder method to save or update the snapshot store
  private async saveSnapshotStore(store: SnapshotStore<T, K>): Promise<void> {
    try {
      console.log(`Saving snapshot store with ID: ${store.storeId}`);
      this.snapshotStores.set(store.storeId, store);
      console.log(`Snapshot store saved successfully.`);
    } catch (error) {
      console.error(`Failed to save snapshot store:`, error);
    }
  }

  // Method to find the index of a snapshot that matches the criteria
  findIndex(predicate: (snapshot: Snapshot<T, K>) => boolean): number {
    if (Array.isArray(this.snapshots)) {
      return this.snapshots.findIndex(predicate);
    } else {
      // Cast values to Snapshot<T, K> array
      const snapshotArray: Snapshot<T, K>[] = Object.values(
        this.snapshots
      ) as Snapshot<T, K>[];
      return snapshotArray.findIndex(predicate);
    }
  }

  // Method to splice snapshots from the array
  splice(index: number, count: number): void {
    if (Array.isArray(this.snapshots)) {
      this.snapshots.splice(index, count);
    } else {
      throw new Error("Cannot splice an object. Convert to array first.");
    }
  }

  events:
    | ({
        callbacks: Callback<Snapshots<T>>;
        eventRecords: Record<string, CalendarManagerStoreClass<T, K>[]>;
        emit: (event: string, snapshot: Snapshot<T, K>) => void;
        once: (
          event: string,
          callback: (snapshot: Snapshot<T, K>) => void
        ) => void;
        removeAllListeners: (event?: string | undefined) => void;
        onSnapshotAdded: (snapshot: Snapshot<T, K>) => void;
        onSnapshotRemoved: (snapshot: Snapshot<T, K>) => void;
        onSnapshotUpdated: (
          snapshotId: string,
          data: Map<string, Snapshot<T, K>>,
          events: Record<string, CalendarManagerStoreClass<T, K>[]>,
          snapshotStore: SnapshotUnion<T>,
          dataItems: RealtimeDataItem[],
          newData: Snapshot<T, K>,
          payload: UpdateSnapshotPayload<T>,
          store: SnapshotStore<any, K>
        ) => void;
        addRecord: (
          event: string,
          record: CalendarManagerStoreClass<T, K>,
          callback: (snapshot: CalendarManagerStoreClass<T, K>) => void
        ) => void;
      } & CombinedEvents<T, K>)
    | undefined = undefined;

  subscriberId: string | undefined = ""; // Added missing property
  length: number | undefined = 0; // Added missing property
  content: string | Content<T> | undefined = ""; // Added missing property
  value: string | number | Snapshot<T, K> | undefined = 0; // Added missing property
  todoSnapshotId: string | undefined = ""; // Added missing property

  snapshotStore: SnapshotStore<T, K> | null = null;
  dataItems: RealtimeDataItem[] = [];
  newData: Snapshot<T, K> | null = {
    id: "",
    name: "",
    title: "",
    description: "",
    status: undefined,
    category: "",
    createdAt: new Date(),
    updatedAt: new Date(),
    data: {} as T | Map<string, Snapshot<T, K>>,
    meta: {} as Map<string, any>,
    set: () => {},
    snapshotItems: [],
    configOption: {} as SnapshotStoreConfig<
      SnapshotWithCriteria<any, BaseData>,
      K
    >,
  };

  constructor(
    private storeId: number,
    options: SnapshotStoreOptions<T, K>,
    category: Category,
    config: SnapshotStoreConfig<SnapshotUnion<T>, K>,
    operation: SnapshotOperation
  ) {
    Object.assign(this, options.data); // Initialize properties from options.data if provided
    this.timestamp = new Date(); // Initialize timestamp
    const prefix = this.determinePrefix(
      options.snapshotConfig,
      options.category?.toString() ?? ""
    );
    this.category = options.category,
    this.operation = operation,
    this.id = UniqueIDGenerator.generateID(
      prefix,
      (
        options.snapshotId ||
        options.configOption?.id ||
        options.configOption?.name ||
        options.configOption?.title ||
        options.configOption?.description ||
        ""
      ).toString(),
      NotificationTypeEnum.GeneratedID
    );

    const eventRecords: Record<string, CalendarManagerStoreClass<T, K>[]> = {}; // Initialize as an empty object
    const callbacks: Record<string, ((snapshot: Snapshot<T, K>) => void)[]> =
      {}; // Provide a default no-op callback
    const subscribers: Subscriber<T, K>[] = [];
    const eventIds: string[] = [];
    const on = (subscriber: Subscriber<T, K>): void => {
      subscribers.push(subscriber);
    };

    const off = (subscriber: Subscriber<T, K>): void => {
      const index = subscribers.indexOf(subscriber);
      if (index !== -1) {
        subscribers.splice(index, 1);
      }
    };

    const subscribe = (subscriber: Subscriber<T, K>): void => {
      subscribers.push(subscriber);
    };

    const unsubscribe = (subscriber: Subscriber<T, K>): void => {
      const index = subscribers.indexOf(subscriber);
      if (index !== -1) {
        subscribers.splice(index, 1);
      }
    };

    const trigger = (snapshot: Snapshot<T, K>): void => {
      // Iterate over the subscribers and trigger the callback
      subscribers.forEach((subscriber) => {
        // Assuming the subscriber has a method or function to handle the snapshot
        subscriber.handleSnapshot(snapshot);
      });
    };

    const combinedEvents: CombinedEvents<T, K> = {
      eventRecords,
      callbacks,
      subscribers,
      eventIds,
      on,
      off,
      subscribe,
      unsubscribe,
      trigger,
    };
    // Assigning the correct type
    this.events = combinedEvents as Record<
      string,
      CalendarManagerStoreClass<T, K>[]
    > &
      CombinedEvents<T, K>;

    if (config.initialState instanceof SnapshotStore) {
      this.dataStore = convertSnapshotStoreToMap(config.initialState);
    } else if (isSnapshot(options.initialState)) {
      this.dataStore = options.initialState.data as Map<string, Snapshot<T, K>>;
    } else {
      this.dataStore = new Map<string, Snapshot<T, K>>();
    }
    this.initialState = config.initialState;
    this.category = options.category;
    this.date = options.date;
    this.type = options.type;
    this.snapshotStoreConfig = options.snapshotStoreConfig;
    this.subscribeToSnapshots = options.subscribeToSnapshots
      ? options.subscribeToSnapshots
      : this.subscribeToSnapshots;
    this.subscribeToSnapshot = options.subscribeToSnapshot;
    this.delegate = options.delegate;
    this.dataStoreMethods = options.dataStoreMethods;

    this.data = new Map<string, Snapshot<T, K>>();
    this.key = "";
    this.topic = "";

    this.config = null;
    this.configOption = null;
    this.subscription = null;
    this.category = options.category;
    this.createdBy = "";
    this.timestamp = new Date();
    this.set = undefined;
    this.snapshots = [];
    this.state = null;
    this.subscribers = {} as SubscriberCollection<T, K>;
    this.subscriberId = "";
    this.length = 0;
    this.content = "";
    this.value = 0;
    this.todoSnapshotId = "";
  }

  // todo verify is this is upposed to be here
  // handleSnapshotOperation: (
  //   snapshot: Snapshot<T, K>,
  //   data: Map<string, Snapshot<T, K>>,
  //   operation: SnapshotOperation,
  //   operationType: SnapshotOperationType
  // ) => Promise<Snapshot<T, K>> | null = (snapshot, data, operation, operationType) => {
  //   switch (operationType) {
  //     case SnapshotOperationType.CreateSnapshot:
  //       return this.createSnapshot(snapshot, data);
  //     case SnapshotOperationType.UpdateSnapshot:
  //       return this.updateSnapshot(
  //         snapshotId,
  //         data,
  //         events,
  //         snapshotStore,
  //         dataItems,
  //         newData,
  //         payload,
  //         store
  //       );
  //     case SnapshotOperationType.DeleteSnapshot:
  //       return this.deleteSnapshot(snapshot, data);
  //     case SnapshotOperationType.FindSnapshot:
  //       return this.findSnapshot(snapshot, data);
  //     default:
  //       return null;

  //   }
  // }

  getStore: (storeId: number) => SnapshotStore<T, K> | null = (storeId) => {
    return this.stores.get(storeId);
  };

  // handleSnapshotOperation: (
  //   snapshot: Snapshot<T, K>,
  //   data: Map<string, Snapshot<T, K>>,
  //   operation: SnapshotOperation,
  //   operationType: SnapshotOperationType
  // ): Promise<Snapshot<T, K>> | null = (snapshot, data, operation, operationType) => {
  //   switch (operationType) {
  //     case SnapshotOperationType.CreateSnapshot:
  //       return this.createSnapshot(snapshot, data);
  //     case SnapshotOperationType.UpdateSnapshot
  //       return this.updateSnapshot(
  //       snapshotId,
  //       data,
  //       events,
  //       snapshotStore,
  //       dataItems,
  //       newData,
  //       payload,
  //       store
  //     );
  //     case SnapshotOperationType.DeleteSnapshot:
  //       return this.deleteSnapshot(snapshot, data);
  //     case SnapshotOperationType.FindSnapshot:
  //       return this.findSnapshot(snapshot, data);
  //     default:
  //       return null;
  //   }
  // }

  addStore: (
    storeId: number,
    snapshotId: string,
    snapshotStore: SnapshotStore<T, K>,
    snapshot: Snapshot<T, K>,
    type: string,
    event: Event
  ) => SnapshotStore<T, K> | SnapshotStore<T, K> = (
    storeId,
    snapshotId,
    snapshot,
    type,
    event
  ) => {
    const store = this.stores.get(storeId);
    if (store) {
      return store;
    } else {
      const newStore = new SnapshotStore<T, K>(
        storeId,
        snapshotId,
        snapshot,
        type,
        event
      );
      this.stores.set(storeId, newStore);
      return newStore;
    }
  };

  getCustomStore: (
    storeId: number,
    snapshotId: string,
    snapshot: Snapshot<T, K>,
    type: string,
    event: Event
  ) => Promise<SnapshotStore<T, K>> | null = (
    storeId,
    snapshotId,
    snapshot,
    type,
    event
  ) => {
    const store = this.stores.get(storeId);
    if (store) {
      return store;
    } else {
      const newStore = new SnapshotStore<T, K>(
        snapshotId,
        snapshot,
        type,
        event
      );
      this.stores.set(storeId, newStore);
      return newStore;
    }
  };

  addSCustomStore: (
    storeId: number,
    snapshotStore: SnapshotStore<T, K>,
    snapshotId: string,
    snapshot: Snapshot<T, K>,
    type: string,
    event: Event
  ) => void | null;
  removeStore: (
    storeId: number,
    store: SnapshotStore<T, K>,
    snapshotId: string,
    snapshot: Snapshot<T, K>,
    type: string,
    event: Event
  ) => void | null;
  onSnapshot: (
    snapshotId: string,
    snapshot: Snapshot<T, K>,
    type: string,
    event: Event,
    callback: (snapshot: Snapshot<T, K>) => void
  ) => Snapshot<T, K> = {
    //
  };

  getData(id: number): Promise<SnapshotWithCriteria<T, K> | undefined> {
    return new Promise((resolve, reject) => {
      try {
        const event = this.events[id];
        if (!event) {
          resolve(undefined);
          return;
        }

        const data: SnapshotWithCriteria<T, K> = {
          id: event.id,
          getSnapshotId: (parameter: string) => event.id,
          eventRecords: {},
          analysisType: undefined,
          events: {
            callbacks: (snapshot: Snapshots<T>) => {
              return snapshot;
            },
            eventRecords: {},
            subscribers: [],
            eventIds: [],
          },
          subscribers: [],
          tags: undefined,
          timestamp: new Date(),
        };

        resolve(data);
      } catch (error) {
        reject(error);
      }
    });
  }

  getDataStore(): Promise<DataStore<T, K>[]> {
    return new Promise((resolve, reject) => {
      try {
        // Your logic to retrieve data goes here
        const data: SearchCriteria[] = [
          {
            // description: "This is a sample event",
            startDate: new Date("2024-06-01"),
            endDate: new Date("2024-06-05"),
            status: StatusType.Scheduled,
            priority: PriorityTypeEnum.High,
            assignedUser: "John Doe",
            todoStatus: TodoStatus.Completed,
            taskStatus: TaskStatus.InProgress,
            teamStatus: TeamStatus.Active,
            dataStatus: DataStatus.Processed,
            calendarStatus: CalendarStatus.Approved,
            notificationStatus: NotificationStatus.READ,
            bookmarkStatus: BookmarkStatus.Saved,
            priorityType: PriorityTypeEnum.Urgent,
            projectPhase: ProjectPhaseTypeEnum.Planning,
            developmentPhase: DevelopmentPhaseEnum.CODING,
            subscriberType: SubscriberTypeEnum.PREMIUM,
            subscriptionType: SubscriptionTypeEnum.Monthly,
            analysisType: AnalysisTypeEnum.STATISTICAL,
            documentType: DocumentTypeEnum.PDF,
            fileType: FileTypeEnum.Document,
            tenantType: TenantManagementPhaseEnum.TenantA,
            ideaCreationPhaseType: IdeaCreationPhaseEnum.IDEATION,
            securityFeatureType: SecurityFeatureEnum.Encryption,
            feedbackPhaseType: FeedbackPhaseEnum.FEEDBACK_REVIEW,
            contentManagementType: ContentManagementPhaseEnum.CONTENT_CREATION,
            taskPhaseType: TaskPhaseEnum.EXECUTION,
            animationType: AnimationTypeEnum.TwoD,
            languageType: LanguageEnum.English,
            codingLanguageType: CodingLanguageEnum.JavaScript,
            formatType: FormatEnum.PDF,
            privacySettingsType: PrivacySettingEnum.Public,
            messageType: MessageType.Text,
            id: "event1",
            title: "Sample Event",
            content: "This is a sample event content",
            topics: [],
            highlights: [],
            files: [],
            rsvpStatus: "yes",
            then: function <T extends Data, K extends Data>(
              callback: (newData: Snapshot<T, K>) => void
            ): Snapshot<Data, Data> | undefined {
              // Implement the then function here
              callback({
                description: "This is a sample event",
                // startDate: new Date("2024-06-01"),
                // endDate: new Date("2024-06-05"),
                status: "scheduled",
                priority: "high",
                assignedUser: "John Doe",
                todoStatus: "completed",
                taskStatus: "in progress",
                teamStatus: "active",
                dataStatus: "processed",
                calendarStatus: "approved",
                notificationStatus: "read",
                bookmarkStatus: "saved",
                priorityType: "urgent",
                projectPhase: "planning",
                developmentPhase: "coding",
                subscriberType: "premium",
                subscriptionType: "monthly",
                analysisType: AnalysisTypeEnum.STATISTICAL,
                documentType: "pdf",
                fileType: "document",
                tenantType: "tenantA",
                ideaCreationPhaseType: "ideation",
                securityFeatureType: "encryption",
                feedbackPhaseType: "review",
                contentManagementType: "content",
                taskPhaseType: "execution",
                animationType: "2d",
                languageType: "english",
                codingLanguageType: "javascript",
                formatType: "json",
                privacySettingsType: "public",
                messageType: "email",
                id: "event1",
                title: "Sample Event",
                content: "This is a sample event content",
                topics: [],
                highlights: [],
                files: [],
                rsvpStatus: "yes",
              });
              return undefined;
            },
          },
        ]; // Example data, replace with actual logic

        // Resolve the promise with the data
        resolve(data);
      } catch (error) {
        // In case of an error, you can call reject with an error message
        reject(new Error("Something went wrong"));
      }
    });
  }

  async addSnapshotToStore(
    storeId: number,
    snapshot: Snapshot<T, K>,
    snapshotStore: SnapshotStore<T, K>,
    snapshotStoreData: SnapshotStore<T, K>,
    category: Category | undefined,
    categoryProperties: CategoryProperties,
    subscribers: SubscriberCollection<T, K>
  ): Promise<{ snapshotStore: SnapshotStore<T, K> }> {
    try {
      // Find the snapshot store by storeId if necessary
      // Assuming you have a way to find a snapshot store by its ID, if needed
      // This is just a placeholder and might not be needed if you already have the snapshotStore instance
      const store = this.findSnapshotStoreById(storeId);
      if (!store) {
        throw new Error(`Snapshot store with ID ${storeId} not found`);
      }

      // Add the snapshot to the store's snapshots
      store.snapshots.push(snapshot);

      // Update the store's category if provided
      if (category) {
        store.category = category;
      }

      // Update the store's subscribers if provided
      if (subscribers) {
        store.subscribers = subscribers;
      }

      // Perform any additional logic needed with snapshotStoreData
      // Assuming snapshotStoreData is used for some additional processing or validation

      // Save or update the snapshot store
      await this.saveSnapshotStore(store);

      // Return the updated snapshot store
      return { snapshotStore: store };
    } catch (error) {
      // Handle errors appropriately
      console.error("Error adding snapshot to store:", error);
      throw new Error("Failed to add snapshot to store");
    }
  }

  // Method to handle snapshots and configurations
  addSnapshotItem(
    item:
      | SnapshotItem<T, K>
      | SnapshotStoreConfig<SnapshotWithCriteria<any, BaseData>, K>
  ): void {
    this.snapshotItems.push(item);
  }

  // Method to handle nested stores
  addNestedStore(store: SnapshotStore<T, K>): void {
    this.nestedStores.push(store);
  }

  defaultSubscribeToSnapshots(
    snapshotId: string,
    callback: (snapshots: Snapshots<T>) => Subscriber<T, K> | null,
    snapshot: Snapshot<T, K> | null = null
  ): void {
    console.warn("Default subscription to snapshots is being used.");

    // Dummy implementation of subscribing to snapshots
    console.log(`Subscribed to snapshot with ID: ${snapshotId}`);

    // Simulate receiving a snapshot update
    setTimeout(() => {
      const data: BaseData = {
        id: "data1", // Ensure this matches the expected structure of BaseData
        title: "Sample Data",
        description: "Sample description",
        timestamp: new Date(),
        category: "Sample category",
        startDate: new Date(),
        endDate: new Date(),
        scheduled: true,
        status: "Pending",
        isActive: true,
        tags: [
          {
            id: "1",
            name: "Important",
            color: "red",
            tags: [],
            description: "",
            enabled: false,
            type: "",
          },
        ],
      };

      const snapshot: Snapshot<T, any> = {
        id: snapshotId,
        data: data as T,
        timestamp: new Date(),
        unsubscribe: function (callback: Callback<Snapshot<T, any>>): void {
          throw new Error("Function not implemented.");
        },
        fetchSnapshot: function (
          snapshotId: string,
          callback: (snapshot: Snapshot<T, any>) => void
        ): void {
          throw new Error("Function not implemented.");
        },
        handleSnapshot: function (
          snapshotId: string,
          snapshot: Snapshot<T, any> | null,
          type: string,
          event: Event
        ): void {
          throw new Error("Function not implemented.");
        },
        events: undefined,
        meta: undefined,
      };

      callback([snapshot]);
    }, 1000); // Simulate a delay before receiving the update
  }

  defaultCreateSnapshotStores(
    id: string,
    snapshotId: string,
    snapshot: Snapshot<T, K>,
    snapshotStore: SnapshotStore<T, K>,
    snapshotManager: SnapshotManager<T, K>,
    payload: CreateSnapshotStoresPayload<T, K>,
    callback: (snapshotStore: SnapshotStore<T, K>[]) => void | null,
    snapshotStoreData?: SnapshotStore<T, K>[],
    category?: string | CategoryProperties,
    snapshotDataConfig?: SnapshotStoreConfig<
      SnapshotWithCriteria<any, BaseData>,
      K
    >[]
  ): SnapshotStore<T, K>[] | null {
    console.warn("Default create snapshot stores is being used.");
    // Dummy implementation of creating snapshot stores
    console.log(`Created snapshot stores with ID: ${id}`);
    // use snapshotApi to receive a snapshot update
    setTimeout(() => {
      const data: BaseData = {
        id: "data1", // Ensure this matches the expected structure of BaseData
        title: "Sample Data",
        description: "Sample description",
        timestamp: new Date(),
        category: "Sample category",
        startDate: new Date(),
        endDate: new Date(),
        scheduled: true,
        status: "Pending",
        isActive: true,
        tags: [
          {
            id: "1",
            name: "Important",
            color: "red",
            description: "This is a sample description",
            enabled: true,
            type: "tag",
            tags: [],
          },
        ],
      };

      const snapshot: Snapshot<T, any> = {
        id: snapshotId,
        data: data as T,
        timestamp: new Date(),
        unsubscribe: function (callback: Callback<Snapshot<T, any>>): void {
          throw new Error("Function not implemented.");
        },
        fetchSnapshot: function (
          snapshotId: string,
          callback: (snapshot: Snapshot<T, any>) => void
        ): void {
          throw new Error("Function not implemented.");
        },
        handleSnapshot: function (
          snapshotId: string,
          snapshot: Snapshot<T, any> | null,
          type: string,
          event: Event
        ): void {
          throw new Error("Function not implemented.");
        },
        events: undefined,
        meta: undefined,
        category: category,
        snapshotDataConfig: snapshotDataConfig || [
          {
            id: "data1",
            title: "Sample Data",
            description: "Sample description",
            timestamp: new Date(),
            category: "Sample category",
            startDate: new Date(),
            endDate: new Date(),
            scheduled: true,
            status: "Pending",
            isActive: true,
            tags: [{ id: "1", name: "Important", color: "red" }],
          },
          {
            id: "data2",
            title: "Sample Data",
            description: "Sample description",
            timestamp: new Date(),
            category: "Sample category",
            startDate: new Date(),
            endDate: new Date(),
            scheduled: true,
            status: "Pending",
            isActive: true,
            tags: [{ id: "1", name: "Important", color: "red" }],
          },
          {
            id: "data3",
            title: "Sample Data",
            description: "Sample description",
            timestamp: new Date(),
            category: "Sample category",
            startDate: new Date(),
            endDate: new Date(),
            scheduled: true,
            status: "Pending",
            isActive: true,
            tags: [{ id: "1", name: "Important", color: "red" }],
          },
        ],
      };
    });
    return null;
  }

  createSnapshotStores(
    id: string,
    snapshotId: string,
    snapshot: Snapshot<T, K>,
    snapshotStore: SnapshotStore<T, K>,
    snapshotManager: SnapshotManager<T, K>,
    payload: CreateSnapshotStoresPayload<T, K>,
    callback: (snapshotStore: SnapshotStore<T, K>[]) => void | null,
    snapshotStoreData?: SnapshotStore<T, K>[],
    category?: string | CategoryProperties,
    snapshotDataConfig?: SnapshotStoreConfig<
      SnapshotWithCriteria<any, BaseData>,
      K
    >[]
  ) {
    if (this.createSnapshotStores) {
      this.createSnapshotStores(
        id,
        snapshotId,
        snapshot,
        snapshotStore,
        snapshotManager,
        payload,
        callback,
        snapshotStoreData,
        category,
        snapshotDataConfig
      );
    } else {
      console.warn("createSnapshotStores method is not defined.");
      this.defaultCreateSnapshotStores(
        id,
        snapshotId,
        snapshot,
        snapshotStore,
        snapshotManager,
        payload,
        callback,
        snapshotStoreData,
        category,
        snapshotDataConfig
      );
    }
  }

  subscribeToSnapshots(
    snapshotId: string,
    callback: (snapshots: Snapshots<T>) => Snapshot<T, K> | null,
    snapshot: Snapshot<T, K> | null = null
  ) {
    if (this.subscribeToSnapshots) {
      this.subscribeToSnapshots(snapshotId, callback, snapshot);
    } else {
      console.warn("subscribeToSnapshots method is not defined.");
      this.defaultSubscribeToSnapshots(snapshotId, callback, snapshot);
    }
    return null;
  }

  subscribeToSnapshot(
    snapshotId: string,
    callback: Callback<Snapshot<T, K>>,
    snapshot: Snapshot<T, K>
  ) {
    if (this.subscribeToSnapshot) {
      this.subscribeToSnapshot(snapshotId, callback, snapshot);
    } else {
      console.warn("subscribeToSnapshot method is not defined.");
      // Optionally, you can provide a default behavior here
      this.defaultSubscribeToSnapshot(snapshotId, callback, snapshot);
    }
  }

  defaultOnSnapshots(
    snapshotId: string,
    snapshots: Snapshots<T>,
    type: string,
    event: Event,
    callback: (snapshots: Snapshots<T>) => void
  ) {
    console.log("onSnapshots called with snapshotId:", snapshotId);
    console.log("snapshots:", snapshots);
    console.log("type:", type);
    console.log("event:", event);
    console.log("callback:", callback);
    callback(snapshots);
  }

  onSnapshots(
    snapshotId: string,
    snapshots: Snapshots<T>,
    type: string,
    event: Event,
    callback: (snapshots: Snapshots<T>) => void
  ): Promise<void | null> {
    if (this.onSnapshots) {
      // Ensure to wrap the call in a Promise to match the return type
      return Promise.resolve(
        this.onSnapshots(snapshotId, snapshots, type, event, callback)
      );
    } else {
      console.warn("onSnapshots method is not defined.");
      // Optionally, you can provide a default behavior here
      this.defaultOnSnapshots(snapshotId, snapshots, type, event, callback);
      return Promise.resolve(); // Return a resolved promise to match the return type
    }
  }

  private transformSubscriber(sub: Subscriber<T, K>): Subscriber<BaseData, K> {
    return {
      ...sub,
      data: sub.getData ? sub.getData()!.data : undefined,
    };
  }

  private isSnapshotStoreConfig(
    item: any
  ): item is SnapshotStoreConfig<SnapshotWithCriteria<any, BaseData>, K> {
    // Add checks for required properties of SnapshotStoreConfig
    return (
      item &&
      typeof item === "object" &&
      "id" in item &&
      "title" in item &&
      // Add more property checks as needed
      true
    );
  }

  private transformDelegate(): SnapshotStoreConfig<
    SnapshotWithCriteria<any, BaseData>,
    K
  >[] {
    return this.delegate?.map((config) => ({
      ...config,
      data: config.data,
      subscribers: config.subscribers.map((sub) =>
        this.transformSubscriber(sub)
      ) as Subscriber<BaseData, K>[],
      configOption:
        config.configOption && typeof config.configOption !== "string"
          ? {
              ...config.configOption,
              data: config.configOption.data,
              subscribers: config.configOption.subscribers.map((sub) =>
                this.transformSubscriber(sub)
              ) as Subscriber<BaseData, K>[],
            }
          : config.configOption,
    }));
  }

  get getSaveSnapshotStore(): (
    id: string,
    snapshotId: string,
    snapshot: Snapshot<T, K>,
    snapshotStore: SnapshotStore<T, K>,
    snapshotManager: SnapshotManager<T, K>,
    payload: CreateSnapshotStoresPayload<T, K>,
    callback: (snapshotStore: SnapshotStore<T, K>[]) => void | null,
    snapshotStoreData?: SnapshotStore<T, K>[],
    category?: string | CategoryProperties,
    snapshotDataConfig?: SnapshotStoreConfig<
      SnapshotWithCriteria<any, BaseData>,
      K
    >[]
  ) => void {
    return this.saveSnapshotStore
     ? this._saveSnapshotStore.bind(this)
      : this.defaultSaveSnapshotStore.bind(this);
      
  }

  get getSaveSnapshotStores(): (
    id: string,
    snapshotId: string,
    snapshot: Snapshot<T, K>,
    snapshotStore: SnapshotStore<T, K>,
    snapshotManager: SnapshotManager<T, K>,
    payload: CreateSnapshotStoresPayload<T, K>,
    callback: (snapshotStore: SnapshotStore<T, K>[]) => void | null,
    snapshotStoreData?: SnapshotStore<T, K>[],
    category?: string | CategoryProperties,
    snapshotDataConfig?: SnapshotStoreConfig<
      SnapshotWithCriteria<any, BaseData>,
      K
    >[]
  ) => void {
    return this._saveSnapshotStores
      ? this._saveSnapshotStores.bind(this)
      : this.defaultSaveSnapshotStores.bind(this);
  }

  get initializedState():
    | SnapshotStore<T, K>
    | Map<string, Snapshot<T, K>>
    | Snapshot<T, K>
    | null
    | undefined {
    return this.initialState;
  }

  get transformedDelegate(): SnapshotStoreConfig<
    SnapshotWithCriteria<any, BaseData>,
    K
  >[] {
    return this.transformDelegate();
  }

  get transformedSubscriber(): (sub: Subscriber<T, K>) => Subscriber<BaseData, K> {
    return this.transformSubscriber(sub);
  }

  get getSnapshotIds(): SnapshotStoreConfig<
    SnapshotWithCriteria<any, BaseData>,
    K
  >[] {
    if (
      this.transformedDelegate &&
      Array.isArray(this.transformedDelegate) &&
      this.transformedDelegate.every(
        (item) => item instanceof SnapshotStoreConfig
      )
    ) {
      return this.transformedDelegate;
    }
    return [];
  }

  get getNestedStores(): SnapshotStore<T, K>[] {
    return this.nestedStores;
  }

  get getFindSnapshotStoreById(): SnapshotStore<T, K> | undefined {
    return this.findSnapshotStoreById;
  }

  getAllKeys(): Promise<string[]> | undefined {
    return this.dataStoreMethods?.getAllKeys();
  }

  mapSnapshot(
    storeId: number,
    snapshotStore: SnapshotStore<T, K>,
    snapshotId: string,
    snapshot: Snapshot<T, K>,
    type: string,
    event: Event
  ): Promise<Snapshot<T, K> | null> {
    return new Promise((resolve, reject) => {
      // Ensure type safety here
      if (this.dataStoreMethods === undefined && this.dataStoreMethods === null) {
        return Promise.resolve(this.dataStore);
      }
      if (this.dataStoreMethods) {
        return this.dataStoreMethods.mapSnapshot(
          storeId,
          snapshotStore,
          snapshotId,
          snapshot,
          type,
          event,
          // initialConfig, 
          // removeSubscriber, 
          // onInitialize, 
          // onError,
        );
      }
      return {
  
      }

    })
  }

  getAllItems(): Promise<Snapshot<T, K>[]> | undefined {
    if (this.dataStoreMethods === undefined) {
      return undefined;
    }
    if (this.dataStoreMethods) {
      return this.dataStoreMethods.getAllItems();
    }
    return undefined;
  }

  addData(data: Snapshot<T, K>): void {
    // Ensure dataStoreMethods is defined and has the addData method
    this.dataStoreMethods?.addData(data);

    // Ensure data.id is a number before passing to addDataStatus
    const idAsNumber =
      typeof data.id === "string" ? parseInt(data.id, 10) : data.id;

    // Add a check to handle NaN cases if needed
    if (!isNaN(idAsNumber)) {
      this.dataStoreMethods?.addDataStatus(idAsNumber, StatusType.Pending);
    } else {
      console.error("Invalid ID: Not a number");
    }
  }

  addDataStatus(id: number, status: StatusType | undefined): void {
    this.dataStoreMethods?.addDataStatus(id, status);
  }

  removeData(id: number): void {
    this.dataStoreMethods?.removeData(id);
  }

  updateData(id: number, newData: Snapshot<T, K>): void {
    this.dataStoreMethods?.updateData(id, newData);
  }

  updateDataTitle(id: number, title: string): void {
    this.dataStoreMethods?.updateDataTitle(id, title);
  }

  updateDataDescription(id: number, description: string): void {
    this.dataStoreMethods?.updateDataDescription(id, description);
  }

  updateDataStatus(id: number, status: StatusType | undefined): void {
    this.dataStoreMethods?.updateDataStatus(id, status);
  }

  addDataSuccess(payload: { data: Snapshot<T, K>[] }): void {
    this.dataStoreMethods?.addDataSuccess(payload);
  }

  getDataVersions(id: number): Promise<Snapshot<T, K>[] | undefined> {
    return this.dataStoreMethods?.getDataVersions(id);
  }

  updateDataVersions(id: number, versions: Snapshot<T, K>[]): void {
    this.dataStoreMethods?.updateDataVersions(id, versions);
  }

  getBackendVersion(): IHydrateResult<number> | Promise<string> {
    return this.dataStoreMethods?.getBackendVersion();
  }

  getFrontendVersion(): Promise<string | IHydrateResult<number>> {
    return this.dataStoreMethods?.getFrontendVersion();
  }

  fetchData(id: number): Promise<SnapshotStore<T, K>[]> {
    return this.dataStoreMethods?.fetchData(id);
  }

  defaultSubscribeToSnapshot(
    snapshotId: string,
    callback: Callback<Snapshot<T, K>>,
    snapshot: Snapshot<T, K>
  ): string {
    // Add the subscriber to the subscribers array
    this.subscribers.push({
      id: snapshotId,
      _id: this.subscriberId,
      handleCallback: callback,
      snapshotCallback: snapshot,
    });
    // Call the callback with the snapshot
    callback(snapshot);
    // Return the subscriberId
    return this.subscriberId;
  }

  // Method to handle the subscription
  handleSubscribeToSnapshot(
    snapshotId: string,
    callback: Callback<Snapshot<T, K>>,
    snapshot: Snapshot<T, K>
  ): void {
    // Check if subscribeToSnapshot is defined
    if (this.subscribeToSnapshot) {
      this.subscribeToSnapshot(snapshotId, callback, snapshot);
    } else {
      console.warn("subscribeToSnapshot method is not defined.");
      // Optionally, you can provide a default behavior here
      this.defaultSubscribeToSnapshot(snapshotId, callback, snapshot);
    }
  }

  // Implement the snapshot method as expected by SnapshotStoreConfig
  snapshot = async (
    id: string,
    snapshotData: SnapshotStoreConfig<any, K>[],
    category: string | CategoryProperties,
    dataStoreMethods: DataStore<T, K>
  ): Promise<{ snapshot: SnapshotStore<T, K> }> => {
    // Convert the Map to the appropriate format
    if (this.data === undefined) {
      this.data = new Map<string, Snapshot<T, K>>();
    }

    if (this.data !== undefined) {
      const convertedData = mapToSnapshotStore(this.data) as Partial<
        SnapshotStore<T, K>
      >;

      // Logic to generate and return the snapshot
      const newSnapshot: SnapshotStore<T, K> = new SnapshotStore<T, K>(
        storeId,
        options,
        config,
        operation
      );
      return { snapshot: newSnapshot };
    }
    return Promise.reject("Snapshot is not available");
  };

  async removeItem(key: string): Promise<void> {
    if (this.dataStoreMethods === undefined || this.dataStoreMethods === null) {
      return Promise.reject(new Error("DataStoreMethods is undefined or null"));
    }
    try {
      await this.dataStoreMethods.removeItem(key);
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(new Error("Failed to remove item"));
    }
  }

  getSnapshot(
    snapshot: (id: string) =>
      | Promise<{
          category: Category | undefined;
          categoryProperties: CategoryProperties;
          timestamp: string | number | Date | undefined;
          id: string | number | undefined;
          snapshot: Snapshot<T, K>;
          snapshotStore: SnapshotStore<T, K>;
          data: T;
        }>
      | undefined
  ): Promise<Snapshot<SnapshotWithCriteria<any, BaseData>, K>> {
    // Check if the delegate array exists and is not empty
    if (this.delegate && this.delegate.length > 0) {
      const firstDelegate = this.delegate.find(
        (del) => typeof del.getSnapshot === "function"
      );

      if (firstDelegate) {
        // Call getSnapshot on the first valid delegate found
        return firstDelegate.getSnapshot(snapshot);
      } else {
        // Handle the case where no valid delegate is found
        throw new Error("No valid delegate found with getSnapshot method");
      }
    } else {
      // Handle the case where the delegate array is undefined or empty
      throw new Error("Delegate is undefined or empty");
    }
  }

  getSnapshotById(
    snapshot: (id: string) =>
      | Promise<{
          category: Category | undefined;
          categoryProperties: CategoryProperties;
          timestamp: string | number | Date | undefined;
          id: string | number | undefined;
          snapshot: Snapshot<T, K>;
          snapshotStore: SnapshotStore<T, K>;
          data: T;
        }>
      | undefined
  ): Promise<Snapshot<T, K> | null> {
    // Check if the delegate array exists and is not empty
    if (this.delegate && this.delegate.length > 0) {
      const firstDelegate = this.delegate.find(
        (del) => typeof del.getSnapshotById === "function"
      );
      if (firstDelegate) {
        // Call getSnapshot on the first valid delegate found
        return firstDelegate.getSnapshotById(snapshot);
      } else {
        // Handle the case where no valid delegate is found
        throw new Error("No valid delegate found with getSnapshotById method");
      }
    }
    return Promise.reject(new Error("Delegate is undefined or empty"));
  }

  getSnapshotSuccess(snapshot: Snapshot<SnapshotWithCriteria<any, BaseData>, K>): Promise<SnapshotStore<T, K>> {
    if (this.delegate && this.delegate.length > 0) {
      for (const delegateConfig of this.delegate) {
        if (
          delegateConfig &&
          typeof delegateConfig.getSnapshotSuccess === "function"
        ) {
          return delegateConfig.getSnapshotSuccess(snapshot);
        }
      }
      throw new Error("No valid delegate found for getSnapshotSuccess");
    } else {
      throw new Error("Delegate is undefined or empty");
    }
  }

  getSnapshotId(key: SnapshotData<T, K>): Promise<string | undefined> {
    if (this.delegate && this.delegate.length > 0) {
      for (const delegateConfig of this.delegate) {
        if (
          delegateConfig &&
          typeof delegateConfig.getSnapshotId === "function"
        ) {
          return Promise.resolve(delegateConfig.getSnapshotId(key));
        }
      }
      throw new Error("No valid delegate found for getSnapshotId");
    } else {
      throw new Error("Delegate is undefined or empty");
    }
  }

  async getSnapshotArray(): Promise<Array<Snapshot<T, K>>> {
    if (this.delegate && this.delegate.length > 0) {
      for (const delegateConfig of this.delegate) {
        if (
          delegateConfig &&
          typeof delegateConfig.getSnapshots === "function"
        ) {
          // Extract the array from the object
          const result = delegateConfig.getSnapshots(category, this.snapshots);
          if (result && Array.isArray((await result).snapshots)) {
            return Promise.resolve(
              (await result).snapshots as Array<Snapshot<T, K>>
            );
          } else {
            throw new Error("Unexpected format of snapshots from delegate");
          }
        }
      }
      throw new Error("No valid delegate found for getSnapshotArray");
    } else {
      throw new Error("Delegate is undefined or empty");
    }
  }

  async getItem(key: string): Promise<Snapshot<T, K> | undefined> {
    // Check if the dataStore is available and try to get the item from it
    if (this.dataStore) {
      const item = this.dataStore.get(key);
      if (item) {
        return item;
      }
    }

    // If dataStore is not available, try to fetch the snapshot from delegate
    try {
      const snapshotId = await this.getSnapshotId({
        key,
        createdAt: undefined,
        updatedAt: undefined,
        // id: "",
        title: "",
        description: "",
        status: StatusType.Active,
        category: currentCategory,
        timestamp: undefined,
        subscribers: [],
        snapshotStore: this,
        data: undefined,
      });

      if (typeof snapshotId !== "string") {
        return undefined;
      }

      const transformedDelegate = this.transformDelegate();
      const snapshot = await this.fetchSnapshot(snapshotId, callback);

      if (snapshot) {
        const item = snapshot.getItem
          ? snapshot.getItem(key)
          : snapshot.data?.get(key);
        return item as Snapshot<T, K> | undefined;
      }
    } catch (error) {
      console.error("Error fetching snapshot:", error);
    }

    // Return undefined if item is not found or an error occurred
    return undefined;
  }

  setItem(key: string, value: Snapshot<T, K>): Promise<void> {
    this.dataStore.set(key, value);
    return Promise.resolve();
  }

  addSnapshotFailure(
    date: Date,
    snapshotManager: SnapshotManager<T, K>,
    snapshot: Snapshot<T, K>,
    payload: { error: Error }
  ): void {
    notify(
      `${error.message}`,
      `Snapshot added failed fully.`,
      "Error",
      new Date(),
      NotificationTypeEnum.Error,
      NotificationPosition.TopRight
    );
  }

  // getDataStore(): Map<string, T> {
  //   return this.dataStore;
  // }

  addSnapshotSuccess(
    snapshot: T,
    subscribers: SubscriberCollection<T, K>
  ): void {
    if (!this.delegate) {
      console.error("Delegate is undefined or empty.");
      return;
    }

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
          snapshotStore.state as Snapshot<T, K> | null,
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

  getParentId(snapshot: Snapshot<T, K>): string | null {
    if (this.delegate && this.delegate.length > 0) {
      for (const delegateConfig of this.delegate) {
        if (
          delegateConfig &&
          typeof delegateConfig.getParentId === "function"
        ) {
          return delegateConfig.getParentId(snapshot);
        }
      }
      throw new Error("No valid delegate found for getParentId");
    } else {
      throw new Error("Delegate is undefined or empty");
    }
  }

  getChildIds(childSnapshot: Snapshot<T, K>): string[] {
    if (this.delegate && this.delegate.length > 0) {
      for (const delegateConfig of this.delegate) {
        if (
          delegateConfig &&
          typeof delegateConfig.getChildIds === "function"
        ) {
          return delegateConfig.getChildIds(childSnapshot);
        }
      }
      throw new Error("No valid delegate found for getChildIds");
    } else {
      throw new Error("Delegate is undefined or empty");
    }
  }

  compareSnapshotState(
    stateA: Snapshot<T, K> | Snapshot<T, K>[] | null | undefined,
    stateB: Snapshot<T, K> | null | undefined
  ): boolean {
    if (!stateA && !stateB) {
      return true; // Both are null or undefined
    }

    if (!stateA || !stateB) {
      return false; // One is null or undefined while the other is not
    }

    // Helper function to compare snapshot objects
    const compareSnapshot = (
      snapshotA: Snapshot<T, K>,
      snapshotB: Snapshot<T, K>
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
      const arrA = stateA as Snapshot<T, K>[];
      const arrB = stateB as unknown as Snapshot<T, K>[];

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
      return compareSnapshot(
        stateA as Snapshot<T, K>,
        stateB as Snapshot<T, K>
      );
    }
  }

  deepCompare(objA: any, objB: any): boolean {
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

  shallowCompare(objA: any, objB: any): boolean {
    // Basic shallow comparison for objects
    return JSON.stringify(objA) === JSON.stringify(objB);
  }

  getDataStoreMethods(): DataStoreMethods<T, K> {

    return {
      addData: this.addData.bind(this),
      getItem: this.getItem.bind(this),
      removeData: this.removeData.bind(this),
      category: this.category as string,
      dataStoreMethods: this.dataStoreMethods as DataStoreMethods<T, K>,
      initialState: this.initialState ? this.initialState  : null,
      updateData: this.updateData.bind(this),
      updateDataTitle: this.updateDataTitle.bind(this),
      updateDataDescription: this.updateDataDescription.bind(this),
      addDataStatus: this.addDataStatus.bind(this),
      updateDataStatus: this.updateDataStatus.bind(this),
      addDataSuccess: this.addDataSuccess.bind(this),
      getDataVersions: this.getDataVersions.bind(this),
      updateDataVersions: this.updateDataVersions.bind(this),
      getBackendVersion: this.getBackendVersion.bind(this),
      getFrontendVersion: this.getFrontendVersion.bind(this),
      getAllKeys: this.getAllKeys.bind(this),
      fetchData: this.fetchData.bind(this),
      setItem: this.setItem.bind(this),
      removeItem: this.removeItem.bind(this),
      getAllItems: this.getAllItems.bind(this),
      getData: this.getData.bind(this),
      addSnapshot: this.addSnapshot.bind(this),
      addSnapshotSuccess: this.addSnapshotSuccess.bind(this),
      getSnapshot: this.getSnapshot.bind(this),
      getSnapshotSuccess: this.getSnapshotSuccess.bind(this),
      getSnapshotsBySubscriber: this.getSnapshotsBySubscriber.bind(this),
      getSnapshotsBySubscriberSuccess:
        this.getSnapshotsBySubscriberSuccess.bind(this),
      getSnapshotsByTopic: this.getSnapshotsByTopic.bind(this),
      getSnapshotsByTopicSuccess: this.getSnapshotsByTopicSuccess.bind(this),
      getSnapshotsByCategory: this.getSnapshotsByCategory.bind(this),
      getSnapshotsByCategorySuccess:
        this.getSnapshotsByCategorySuccess.bind(this),
      getSnapshotsByKey: this.getSnapshotsByKey.bind(this),
      getSnapshotsByKeySuccess: this.getSnapshotsByKeySuccess.bind(this),
      getSnapshotsByPriority: this.getSnapshotsByPriority.bind(this),
      getSnapshotsByPrioritySuccess:
        this.getSnapshotsByPrioritySuccess.bind(this),
      snapshotMethods: this.snapshotMethods,
      getDelegate: this.getDelegate,
      getStoreData: this.getStoreData.bind(this),

      updateStoreData: this.updateStoreData.bind(this),
      updateDelegate: this.updateDelegate.bind(this),
      getSnapshotContainer: this.getSnapshotContainer.bind(this),
      getSnapshotVersions: this.getSnapshotVersions.bind(this),
      mapSnapshots: this.mapSnapshots.bind(this),
    };
  }

  getDelegate(context: {
    useSimulatedDataSource: boolean;
    simulatedDataSource: SnapshotStoreConfig<
      SnapshotWithCriteria<any, BaseData>,
      K
    >[];
  }): DataStore<T, K>[] {
    // Convert SnapshotStoreConfig to DataStore
    return convertToDataStore(context.simulatedDataSource);
  }
  determineCategory(
    snapshot: string | Snapshot<T, K> | null | undefined
  ): string {
    if (snapshot && snapshot.store) {
      return snapshot.store.toString();
    }
    return "";
  }

  determineSnapshotStoreCategory(
    configs: SnapshotStoreConfig<SnapshotWithCriteria<any, BaseData>, K>[]
  ): string {
    // Check if configs array is empty
    if (configs.length === 0) {
      return "";
    }

    // Example logic: Determine category based on the majority category in configs
    const categoryCount: Record<string, number> = {};

    configs.forEach((config) => {
      const category =
        typeof config.category === "string"
          ? config.category
          : (config.category as CategoryProperties)?.name;
      if (category) {
        categoryCount[category] = (categoryCount[category] || 0) + 1;
      }
    });

    // Find the category with the highest count
    let maxCategory = "";
    let maxCount = 0;

    for (const category in categoryCount) {
      if (categoryCount[category] > maxCount) {
        maxCount = categoryCount[category];
        maxCategory = category;
      }
    }

    return maxCategory;
  }


  determinePrefix<T extends Data>(
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
    data: Map<string, Snapshot<T, K>>,
    events: Record<string, CalendarManagerStoreClass<T, K>[]>,
    snapshotStore: SnapshotStore<T, K>,
    dataItems: RealtimeDataItem[],
    newData: Snapshot<T, K>,
    payload: UpdateSnapshotPayload<T>,
    store: SnapshotStore<any, K>
  ): Promise<{ snapshot: Snapshot<T, K> }> {
    try {
      // Create updated snapshot data
      const updatedSnapshotData: Snapshot<T, K> = {
        id: snapshotId,
        events: undefined,
        meta: {},
        data: {
          ...(snapshotStore.data || new Map<string, Snapshot<T, K>>()), // Ensure default empty map if data is undefined
          ...newData.data, // Merge with new data
        },
        timestamp: new Date(),
        category: "update",
        length: 0,
        content: undefined,
        initialState: null,
        getSnapshotId: function (key: string | SnapshotData<T, K>): unknown {
          throw new Error("Function not implemented.");
        },
        compareSnapshotState: function (
          arg0: Snapshot<T, K> | null,
          state: any
        ): unknown {
          throw new Error("Function not implemented.");
        },
        eventRecords: null,
        snapshotStore: null,
        getParentId: function (): string | null {
          throw new Error("Function not implemented.");
        },
        getChildIds: function (): void {
          throw new Error("Function not implemented.");
        },
        addChild: function (snapshot: Snapshot<T, K>): void {
          throw new Error("Function not implemented.");
        },
        removeChild: function (snapshot: Snapshot<T, K>): void {
          throw new Error("Function not implemented.");
        },
        getChildren: function (): void {
          throw new Error("Function not implemented.");
        },
        hasChildren: function (): boolean {
          throw new Error("Function not implemented.");
        },
        isDescendantOf: function (snapshot: Snapshot<T, K>): boolean {
          throw new Error("Function not implemented.");
        },
        dataItems: null,
        newData: undefined,
        stores: null,
        getStore: function (
          storeId: number,
          snapshotStore: SnapshotStore<T, K>,
          snapshotId: string,
          snapshot: Snapshot<T, K>,
          type: string,
          event: Event
        ): SnapshotStore<T, K> | null {
          throw new Error("Function not implemented.");
        },

        addStore: function (
          storeId: number,
          snapshotStore: SnapshotStore<T, K>,
          snapshotId: string,
          snapshot: Snapshot<T, K>,
          type: string,
          event: Event
        ): SnapshotStore<T, K> | null {
          throw new Error("Function not implemented.");
        },
        mapSnapshot: function (
          storeId: number,
          snapshotStore: SnapshotStore<T, K>,
          snapshotId: string,
          snapshot: Snapshot<T, K>,
          type: string,
          event: Event
        ): Snapshot<T, K> | null {
          throw new Error("Function not implemented.");
        },
        removeStore: function (
          storeId: number,
          store: SnapshotStore<T, K>,
          snapshotId: string,
          snapshot: Snapshot<T, K>,
          type: string,
          event: Event
        ): void {
          throw new Error("Function not implemented.");
        },
        unsubscribe: function (unsubscribeDetails: {
          userId: string;
          snapshotId: string;
          unsubscribeType: string;
          unsubscribeDate: Date;
          unsubscribeReason: string;
          unsubscribeData: any;
        }): void {
          throw new Error("Function not implemented.");
        },
        fetchSnapshot: function (
          callback: (
            snapshotId: string,
            payload: FetchSnapshotPayload<K> | undefined,
            snapshotStore: SnapshotStore<T, K>,
            payloadData: T | Data,
            category: Category | undefined,
            categoryProperties: CategoryProperties,
            timestamp: Date,
            data: T,
            delegate: SnapshotWithCriteria<T, K>[]
          ) => Snapshot<T, K>
        ): Snapshot<T, K> | undefined {
          throw new Error("Function not implemented.");
        },
        addSnapshotFailure: function (
          snapshotManager: SnapshotManager<T, K>,
          snapshot: Snapshot<T, K>,
          payload: { error: Error }
        ): void {
          throw new Error("Function not implemented.");
        },
        configureSnapshotStore: function (
          snapshotStore: SnapshotStore<T, K>,
          snapshotId: string,
          data: Map<string, Snapshot<T, K>>,
          events: Record<string, CalendarManagerStoreClass<T, K>[]>,
          dataItems: RealtimeDataItem[],
          newData: Snapshot<T, K>,
          payload: ConfigureSnapshotStorePayload<T>,
          store: SnapshotStore<any, K>,
          callback: (snapshotStore: SnapshotStore<T, K>) => void
        ): void | null {
          throw new Error("Function not implemented.");
        },
        updateSnapshotSuccess: function (
          snapshotId: string,
          snapshotManager: SnapshotManager<T, K>,
          snapshot: Snapshot<T, K>,
          payload: { error: Error }
        ): void | null {
          throw new Error("Function not implemented.");
        },
        createSnapshotFailure: function (
          snapshotId: string,
          snapshotManager: SnapshotManager<T, K>,
          snapshot: Snapshot<T, K>,
          payload: { error: Error }
        ): Promise<void> {
          throw new Error("Function not implemented.");
        },
        createSnapshotSuccess: function (
          snapshotId: string,
          snapshotManager: SnapshotManager<T, K>,
          snapshot: Snapshot<T, K>,
          payload: { error: Error }
        ): void | null {
          throw new Error("Function not implemented.");
        },
        createSnapshots: function (
          id: string,
          snapshotId: string,
          snapshot: Snapshot<T, K>,
          snapshotManager: SnapshotManager<T, K>,
          payload: CreateSnapshotsPayload<T, K>,
          callback: (snapshots: Snapshot<T, K>[]) => void | null,
          snapshotDataConfig?: SnapshotConfig<T, K>[] | undefined,
          category?: string | CategoryProperties
        ): Snapshot<T, K>[] | null {
          throw new Error("Function not implemented.");
        },
        onSnapshot: function (
          snapshotId: string,
          snapshot: Snapshot<T, K>,
          type: string,
          event: Event,
          callback: (snapshot: Snapshot<T, K>) => void
        ): void {
          throw new Error("Function not implemented.");
        },
        onSnapshots: function (
          snapshotId: string,
          snapshots: Snapshots<T>,
          type: string,
          event: Event,
          callback: (snapshots: Snapshots<T>) => void
        ): void {
          throw new Error("Function not implemented.");
        },
        handleSnapshot: function (
          id: string,
          snapshotId: string,
          snapshot: T | null,
          snapshotData: T,
          category: Category | undefined,
          categoryProperties: CategoryProperties,
          callback: (snapshot: T) => void,
          snapshots: SnapshotsArray<T>,
          type: string,
          event: Event,
          snapshotContainer?: T,
          snapshotStoreConfig?: SnapshotStoreConfig<
            SnapshotWithCriteria<any, BaseData>,
            K
          >
        ): Promise<Snapshot<T, K> | null> {
          throw new Error("Function not implemented.");
        },
      };

      // Update snapshotStore with the new data
      snapshotStore.data = new Map<string, Snapshot<T, K>>(); // Initialize if needed
      snapshotStore.data.set(
        snapshotId.toString(),
        updatedSnapshotData as unknown as Snapshot<T, K>
      );

      console.log("Snapshot updated successfully:", snapshotStore);

      // Return the updated snapshot store
      return { snapshot: snapshotStore };
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

  updateSnapshotFailure({
    snapshotManager,
    snapshot,
    date,
    payload,
  }: {
    snapshotManager: SnapshotManager<T, K>;
    snapshot: Snapshot<T, K>;
    date: Date | undefined;
    payload: { error: Error };
  }): void {
    notify(
      "updateSnapshotFailure",
      `Failed to update snapshot: ${payload.error}`,
      "",
      new Date(),
      NotificationTypeEnum.Error,
      NotificationPosition.TopRight
    );
  }

  removeSnapshot(snapshotToRemove: Snapshot<T, K>): void {
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

  async addSnapshot(
    snapshot: Snapshot<T, K>,
    snapshotId: string,
    subscribers: SubscriberCollection<T, K> | undefined
  ): Promise<void> {
    const snapshotData: Snapshot<T, K> = {
      id: snapshot.id || "",
      data: snapshot?.data ?? ({} as T),
      timestamp: new Date(),
      category: snapshot.category || this.category,
      subscribers: subscribers || [],
      key: snapshot.key || this.key,
      topic: snapshot.topic || this.topic,
      state: snapshot.state || this.state,
      config: snapshot.config || this.config,
      delegate: snapshot.delegate || this.delegate,
      subscription: snapshot.subscription || this.subscription,
      length: snapshot.length || 0,
      metadata: snapshot.metadata || {},
      store: snapshot.store || null,
      getSnapshotId: snapshot.getSnapshotId || this.getSnapshotId,
      compareSnapshotState:
        snapshot.compareSnapshotState || this.compareSnapshotState,
      snapshotStore: this.snapshotStore,
      snapshotConfig: this.snapshotConfig,
      set: this.set,
      snapshots: this.snapshots,
      configOption: this.configOption,
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
      createInitSnapshot: this.createInitSnapshot,
      createSnapshotSuccess: this.createSnapshotSuccess,
      createSnapshotFailure: this.createSnapshotFailure,
      // updateSnapshots: this.updateSnapshots,
      // updateSnapshotsSuccess: this.updateSnapshotsSuccess,
      // updateSnapshotsFailure: this.updateSnapshotsFailure,
      // initSnapshot: this.initSnapshot,
      // takeSnapshot: this.takeSnapshot,
      // takeSnapshotsSuccess: this.takeSnapshotsSuccess,
      // configureSnapshotStore: this.configureSnapshotStore,
      // getData: this.getData,
      // takeSnapshotSuccess: this.takeSnapshotSuccess,
      // flatMap: this.flatMap,
      // setData: this.setData,
      // getState: this.getState,
      // setState: this.setState,
      // validateSnapshot: this.validateSnapshot,
      // handleSnapshot: this.handleSnapshot,
      // handleActions: this.handleActions,
      // setSnapshot: this.setSnapshot,
      // setSnapshots: this.setSnapshots,
      // clearSnapshot: this.clearSnapshot,
      // mergeSnapshots: this.mergeSnapshots,
      // reduceSnapshots: this.reduceSnapshots,
      // sortSnapshots: this.sortSnapshots,
      // filterSnapshots: this.filterSnapshots,
      // mapSnapshots: this.mapSnapshots,
      // findSnapshot: this.findSnapshot,
      // getSubscribers: this.getSubscribers,
      // notify: this.notify,
      // subscribe: this.subscribe,
      // unsubscribe: this.unsubscribe,
      // fetchSnapshot: this.fetchSnapshot,
      // fetchSnapshotSuccess: this.fetchSnapshotSuccess,
      // fetchSnapshotFailure: this.fetchSnapshotFailure,
      // getSnapshot: this.getSnapshot,
      // getSnapshots: this.getSnapshots,
      // getAllSnapshots: this.getAllSnapshots,
      // generateId: this.generateId,
      // batchFetchSnapshots: this.batchFetchSnapshots,
      // batchTakeSnapshotsRequest: this.batchTakeSnapshotsRequest,
      // batchUpdateSnapshotsRequest: this.batchUpdateSnapshotsRequest,
      // batchFetchSnapshotsSuccess: this.batchFetchSnapshotsSuccess,
      // batchFetchSnapshotsFailure: this.batchFetchSnapshotsFailure,
      // batchUpdateSnapshotsSuccess: this.batchUpdateSnapshotsSuccess,
      // batchUpdateSnapshotsFailure: this.batchUpdateSnapshotsFailure,
      // batchTakeSnapshot: this.batchTakeSnapshot,
      // handleSnapshotSuccess: this.handleSnapshotSuccess,
      // [Symbol.iterator]: this[Symbol.iterator],
      // [Symbol.asyncIterator]: this[Symbol.asyncIterator],
    };

    const prefix = this.determinePrefix(snapshot, this.category!.toString());
    const id = `${prefix}_${this.generateId()}`;
    snapshotData.id = id;

    const snapshotStoreData: SnapshotStore<T, K> = {
      id: snapshotData.id,
      snapshots: [
        {
          data: snapshotData.data as Map<string, Snapshot<T, K>>,
          id: snapshotData.id,
          timestamp: snapshotData.timestamp as Date,
          category: snapshotData.category,
          key: "",
          topic: "",
          date: undefined,
          configOption: null,
          config: undefined,
          subscription: null,
          initialState: null,
          set: undefined,
          state: null,
          snapshots: [],
          type: "",
          dataStore: this.dataStore,
          // Implement getDataStore to return the expected type
          getDataStore: function () {
            return this.dataStore;
          },
          setSnapshotSuccess: function () {
            defaultImplementation();
            return Promise.reject(new Error("Function not implemented."));
          },
          swubscribeToSnapshots: function (
            snapshotId: string,
            unsubscribeType: string,
            unsubscribeDate: Date,
            unsubscribeReason: string,
            unsubscribeData: any,
            callback: (snapshots: Snapshots<T>) => Snapshot<T, K> | null
          ): Snapshot<T, K> {
            if (this.subscription) {
              this.subscription.unsubscribe(
                userId!.toString(),
                snapshotId,
                unsubscribeType,
                unsubscribeDate,
                unsubscribeReason,
                unsubscribeData
              );
            }
            this.subscription = this.subscribe(
              snapshotId,
              callback,
              this.snapshots
            );
            this.subscription.subscribe();
            return;
          },
          subscribers: [],
          snapshotConfig: [],
          delegate: {} as SnapshotStoreConfig<SnapshotWithCriteria<any, BaseData>, BaseData>[],

          async getItem(key: string | SnapshotData): Promise<T | undefined> {
            if (this.snapshots.length === 0) {
              return undefined;
            }

            try {
              const snapshotId = await this.getSnapshotId(key).toString();
              const snapshot = await this.fetchSnapshot(
                snapshotId,
                category,
                timestamp,
                snapshot as SnapshotStore<BaseData>,
                data,
                delegate
              );

              if (snapshot) {
                const item = snapshot.getItem(key);
                return item as T | undefined;
              } else {
                return undefined;
              }
            } catch (error) {
              console.error("Error fetching snapshot:", error);
              return undefined;
            }
          },

          removeItem: function () {
            defaultImplementation();
            return Promise.reject(new Error("Function not implemented."));
          },
          compareSnapshotState: function () {
            defaultImplementation();
            return false;
          },
          setItem: function () {
            defaultImplementation();
            return Promise.reject(new Error("Function not implemented."));
          },
          deepCompare: function () {
            defaultImplementation();
            return false;
          },
          shallowCompare: function () {
            defaultImplementation();
            return false;
          },
          getDelegate: function () {
            defaultImplementation();
            return [];
          },
          addSnapshotFailure: function (date: Date, error: Error) {
            notify(
              `${error.message}`,
              `Snapshot added failed fully.`,
              "Error",
              new Date(),
              NotificationTypeEnum.Error,
              NotificationPosition.TopRight
            );
          },

          addSnapshotSuccess(
            snapshot: BaseData,
            subscribers: Subscriber<T, K>[]
          ): void {
            const index = this.delegate?.findIndex(
              (snapshotStore) =>
                snapshotStore.id === snapshot.id &&
                snapshotStore.snapshotCategory === snapshot.category &&
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
                this.compareSnapshotState(snapshotStore.state, snapshot.state)
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
          },
          determinePrefix: function <T extends Data>(
            snapshot: T | null | undefined,
            category: string
          ): string {
            defaultImplementation();
            return "";
          },
          updateSnapshot: function (
            snapshotId: string,
            data: Map<string, Snapshot<T, any>>,
            events: Record<string, CalendarManagerStoreClass<T, K>[]>,
            snapshotStore: SnapshotUnion<T>,
            dataItems: RealtimeDataItem[],
            newData: Snapshot<T, any>,
            payload: UpdateSnapshotPayload<T>,
            store: SnapshotUnion<T>
          ): Promise<{ snapshot: SnapshotUnion<T>}> {


             // Check if this.snapshots is defined and is an array
            if (!this.snapshots || !Array.isArray(this.snapshots)) {
              return Promise.reject(new Error("Snapshots collection is undefined or not an array."));
            }
            
            const snapshot = this.snapshots.find(
              (snapshot: SnapshotUnion<T>) => snapshot.id === snapshotId
            );
            if (snapshot) {
              snapshot.data = data;
              snapshot.events = events;
              snapshot.snapshotStore = snapshotStore;
              snapshot.dataItems = dataItems;
              snapshot.newData = newData;
              return Promise.resolve({ snapshot: snapshot });
            } else {
              return Promise.reject(
                new Error(`Snapshot ${snapshotId} not found.`)
              );
            }
          },
          updateSnapshotSuccess: function () {
            defaultImplementation();
          },

          updateSnapshotFailure(
            snapshotManager: SnapshotManager<T, K>,
            snapshot: Snapshot<T, K>,
            date: Date | undefined,
            payload: { error: Error }
          ): void {
            notify(
              "updateSnapshotFailure",
              `Failed to update snapshot: ${payload.error.message}`,
              "",
              new Date(),
              NotificationTypeEnum.Error,
              NotificationPosition.TopRight
            );
          },
          removeSnapshot: function (snapshotToRemove: Snapshot<T, K>) {
            if (!this.delegate) {
              // Handle the case where delegate is undefined
              console.warn("Delegate is not defined");
              return;
            }
            //compare state to find snapshot
            const index = this.delegate.findIndex(
              (snapshotStore) =>
                snapshotStore.id === snapshotToRemove.id &&
                snapshotStore.snapshotCategory === snapshotToRemove.category &&
                snapshotStore.key === snapshotToRemove.key &&
                snapshotStore.topic === snapshotToRemove.topic &&
                snapshotStore.priority === snapshotToRemove.priority &&
                snapshotStore.tags === snapshotToRemove.tags &&
                snapshotStore.metadata === snapshotToRemove.metadata &&
                snapshotStore.status === snapshotToRemove.status &&
                snapshotStore.isCompressed === snapshotToRemove.isCompressed &&
                snapshotStore.expirationDate ===
                  snapshotToRemove.expirationDate &&
                snapshotStore.timestamp === snapshotToRemove.timestamp &&
                snapshotStore.data === snapshotToRemove.data &&
                this.compareSnapshotState(
                  snapshotStore.state,
                  snapshotToRemove.state
                )
            );
            if (index !== -1) {
              this.delegate.splice(index, 1);
            }
            notify(
              `${snapshotToRemove.id}`,
              `Snapshot ${snapshotToRemove.id} removed successfully.`,
              "Success",
              new Date(),
              NotificationTypeEnum.Success,
              NotificationPosition.TopRight
            );
          },
          clearSnapshots: function () {
            this.delegate = [];
          },

          addSnapshot: async function (
            snapshot: Snapshot<T, K>,
            snapshotId: string,
            subscribers: SubscriberCollection<T, K>
          ): Promise<Snapshot<T, K> | undefined> {
            // Ensure snapshotStore is defined before proceeding
            if (!this.snapshotStore) {
              return Promise.reject(new Error("SnapshotStore is not defined."));
            }

            try {
              // Add the snapshot to the snapshot store
              await this.snapshotStore.addSnapshot(
                snapshot,
                snapshotId,
                subscribers
              );

              // Retrieve the snapshot from the snapshot store
              const result = await this.snapshotStore.getSnapshot(snapshotId);

              // Return the snapshot or undefined if not found
              return result;
            } catch (error) {
              // Handle errors appropriately
              return Promise.reject(
                new Error(`Failed to add snapshot: ${error.message}`)
              );
            }
          },

          createInitSnapshot: function (
            id: string,
            snapshotData: SnapshotStoreConfig<any, T>,
            category: string
          ): Snapshot<Data, K> {
            defaultImplementation();
            return {} as Snapshot<Data, K>;
          },
          createSnapshotSuccess: function (snapshot: Snapshot<Data, K>) {
            defaultImplementation();
          },
          createSnapshotFailure: async function (
            snapshotId: string,
            snapshotManager: SnapshotManager<T, K>,
            snapshot: Snapshot<BaseData>,
            error: Error
          ): Promise<void> {
            notify(
              "createSnapshotFailure",
              `Error creating snapshot: ${error.message}`,
              "",
              new Date(),
              NotificationTypeEnum.Error,
              NotificationPosition.TopRight
            );
            if (this.delegate && this.delegate.length > 0) {
              for (const delegateConfig of this.delegate) {
                if (
                  delegateConfig &&
                  typeof delegateConfig.createSnapshotFailure === "function"
                ) {
                  await delegateConfig.createSnapshotFailure(
                    snapshotManager,
                    snapshot,
                    error
                  );
                  return;
                }
              }
              throw new Error(
                "No valid delegate found for createSnapshotFailure"
              );
            } else {
              throw new Error("Delegate is undefined or empty");
            }
          },
          updateSnapshots: function () {
            defaultImplementation();
          },
          updateSnapshotsSuccess: function () {
            defaultImplementation();
          },
          updateSnapshotsFailure: function (error: Payload) {
            defaultImplementation();
          },
          initSnapshot: function (
            snapshotStoreConfig: SnapshotStoreConfig<
              SnapshotWithCriteria<any, BaseData>,
              K
            >,
            snapshotData: SnapshotStore<T, K>
          ) {
            defaultImplementation();
          },

          takeSnapshot: function (snapshot: Snapshot<T, BaseData>): Promise<{
            snapshot: Snapshot<BaseData>;
          }> {
            defaultImplementation();
            return Promise.reject(new Error("Function not implemented."));
          },
          takeSnapshotSuccess: function (snapshot: SnapshotStore<BaseData>) {
            defaultImplementation();
          },
          takeSnapshotsSuccess: function (snapshots: Snapshot<BaseData>[]) {
            defaultImplementation();
          },
          configureSnapshotStore: function () {
            defaultImplementation();
          },
          getData: function () {
            defaultImplementation();
            return Promise.reject(new Error("Function not implemented."));
          },
          flatMap: function () {
            defaultImplementation();
          },
          setData: function (data: Data) {
            defaultImplementation();
          },
          getState: function () {
            defaultImplementation();
          },
          setState: function (state: any) {
            defaultImplementation();
          },
          validateSnapshot: function (
            snapshotId: string,

            snapshot: Snapshot<T, K>
          ): boolean {
            defaultImplementation();
            return false;
          },
          handleSnapshot: function (
            id: string,
            snapshotId: string,
            snapshot: T | null,
            snapshotData: T,
            category: Category | undefined,
            categoryProperties: CategoryProperties,
            callback: (snapshot: T) => void,
            snapshots: SnapshotsArray<T>,
            type: string,
            event: Event,
            snapshotContainer?: T,
            snapshotStoreConfig?: SnapshotStoreConfig<
              SnapshotWithCriteria<any, BaseData>,
              K
            >
          ): Promise<Snapshot<T, K> | null> {
            return new Promise((resolve, reject) => {});
          },
          handleActions: function () {
            defaultImplementation();
          },
          setSnapshot: function (snapshot: SnapshotStore<T, K>) {
            const snapshotStore = snapshot;
          },
          setSnapshots: function (snapshots: SnapshotStore<T, K>[]) {
            // set snapshots
            const snapshotStore = snapshots;
          },

          clearSnapshot: function () {
            defaultImplementation();
          },
          mergeSnapshots: function (snapshots: T[]) {},
          reduceSnapshots: function () {
            defaultImplementation();
          },
          sortSnapshots: function () {
            defaultImplementation();
          },
          filterSnapshots: function () {
            defaultImplementation();
          },
          mapSnapshots: function () {
            defaultImplementation();
          },
          findSnapshot: (
            predicate: (snapshot: Snapshot<T, K>) => boolean
          ): Snapshot<T, K> | undefined => {
            if (!this.delegate) {
              return undefined;
            }

            for (const delegate of this.delegate) {
              const foundSnapshot = delegate.findSnapshot(predicate);
              if (foundSnapshot) {
                return foundSnapshot;
              }
            }

            return undefined;
          },
          getSubscribers(
            subscribers: Subscriber<T, K>[],
            snapshots: Snapshots<T>
          ): Promise<{
            subscribers: Subscriber<T, K>[];
            snapshots: Snapshots<T>;
          }> {
            if (this.delegate && this.delegate.length > 0) {
              for (const delegateConfig of this.delegate) {
                if (
                  delegateConfig &&
                  typeof delegateConfig.getSubscribers === "function"
                ) {
                  return delegateConfig.getSubscribers(subscribers, snapshots);
                }
              }
              throw new Error("No valid delegate found for getSubscribers");
            } else {
              throw new Error("Delegate is undefined or empty");
            }
          },
          notify: function () {
            defaultImplementation();
          },

          notifySubscribers(
            data: Snapshot<T, K>,
            callback: (data: Snapshot<T, K>) => Subscriber<T, K>,
            subscribers: Subscriber<T, K>[]
          ): Subscriber<T, K>[] {
            // Notify each subscriber with the provided data
            const notifiedSubscribers = subscribers.map((subscriber) =>
              subscriber.notify
                ? subscriber.notify(data, callback, subscribers)
                : subscriber
            );
            return notifiedSubscribers as Subscriber<T, K>[];
          },
          subscribe: function () {
            defaultImplementation();
          },
          unsubscribe: function () {
            defaultImplementation();
          },
          fetchSnapshot(
            id: any,
            category: Category | undefined,
            categoryProperties: CategoryProperties,
            timestamp: any,
            snapshot: Snapshot<BaseData, BaseData>,
            data: T,
            delegate: SnapshotStoreConfig<SnapshotWithCriteria<any, BaseData>, T>[]
          ): Promise<{
            id: any;
            category: Category | undefined;
            categoryProperties: CategoryProperties;
            timestamp: any;
            snapshot: Snapshot<BaseData, BaseData>;
            data: T;
            delegate: SnapshotStoreConfig<SnapshotWithCriteria<any, BaseData>, T>[];
          }> {
            return Promise.resolve({
              id,
              category,
              categoryProperties,
              timestamp,
              snapshot: snapshot,
              data: data,
              delegate: delegate,
            });
          },
          fetchSnapshotSuccess: function (
            snapshotData: (
              subscribers: Subscriber<T, K>[],
              snapshot: Snapshots<BaseData>
            ) => void
          ) {
            return snapshotData;
          },
          fetchSnapshotFailure: function () {
            defaultImplementation();
          },
          getSnapshot: function (
            snapshot: (id: string) =>
              | Promise<{
                  category: any;
                  timestamp: any;
                  id: any;
                  snapshot: Snapshot<T, any>;
                  snapshotStore: SnapshotStore<T, K>;
                  data: T;
                }>
              | undefined
          ): Promise<Snapshot<T, K>> {
            return Promise.resolve({
              category: "",
              timestamp: "",
              id: "",
              snapshot: {} as T,
              snapshotStore: {} as SnapshotStore<T, K>,
              data: {} as T,
            });
          },
          getSnapshots: function () {
            defaultImplementation();
          },
          getAllSnapshots: function () {
            defaultImplementation();
          },
          generateId: function () {
            defaultImplementation();
            return "";
          },
          batchFetchSnapshots: function () {
            defaultImplementation();
          },
          batchTakeSnapshotsRequest: function () {
            defaultImplementation();
          },
          batchUpdateSnapshotsRequest: function () {
            defaultImplementation();
          },
          batchFetchSnapshotsSuccess: function () {
            defaultImplementation();
          },
          batchFetchSnapshotsFailure: function () {
            defaultImplementation();
          },
          batchUpdateSnapshotsSuccess: function () {
            defaultImplementation();
          },
          batchUpdateSnapshotsFailure: function () {
            defaultImplementation();
          },
          batchTakeSnapshot: function (
            snapshot: SnapshotStore<T, K>,
            snapshots: Snapshots<T>
          ): Promise<{ snapshots: Snapshots<T> }> {
            defaultImplementation();
            return Promise.reject(new Error("Function not implemented."));
          },
          handleSnapshotSuccess: function (
            snapshot: Snapshot<Data, K> | null,
            snapshotId: string
          ) {
            defaultImplementation();
          },
          [Symbol.iterator]: function (): IterableIterator<Snapshot<T, K>> {
            return {} as IterableIterator<Snapshot<T, K>>;
          },
          [Symbol.asyncIterator]: function (): AsyncIterableIterator<
            Snapshot<BaseData>
          > {
            defaultImplementation();
            return {} as AsyncIterableIterator<Snapshot<BaseData>>;
          },
        },
      ],
    };

    this.snapshots.push(snapshotStoreData);
    this.addSnapshotSuccess(snapshotData, subscribers);
    this.notifySubscribers(snapshotData, subscribers);
    if (this.delegate && this.delegate.length > 0) {
      for (const delegateConfig of this.delegate) {
        if (
          delegateConfig &&
          typeof delegateConfig.addSnapshot === "function"
        ) {
          await delegateConfig.addSnapshot(snapshotData, subscribers);
          if (typeof delegateConfig.notifySubscribers === "function") {
            await delegateConfig.notifySubscribers(snapshotData, subscribers);
          }
          return;
        }
      }
      throw new Error("No valid delegate found for addSnapshot");
    } else {
      throw new Error("Delegate is undefined or empty");
    }
  }

  async createInitSnapshot(
    id: string,
    snapshotData: SnapshotStoreConfig<any, T>,
    category: string
  ): Promise<Snapshot<Data, K>> {
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

    const snapshot: Snapshot<T, K> = {
      id,
      data,
      timestamp: snapshotData.timestamp || new Date(),
      category: this.category,
      topic: this.topic,
      unsubscribe: function (callback: Callback<Snapshot<T, K>>): void {
        throw new Error("Function not implemented.");
      },
      fetchSnapshot: function (
        snapshotId: string,
        callback: (snapshot: Snapshot<T, K>) => void
      ): void {
        throw new Error("Function not implemented.");
      },
      handleSnapshot: function (
        snapshotId: string,
        snapshot: Snapshot<T, K> | null,
        type: string,
        event: Event
      ): void {
        throw new Error("Function not implemented.");
      },
      events: undefined,
      meta: undefined,
    };

    this.snapshots.push(snapshot);
    if (this.delegate && this.delegate.length > 0) {
      for (const delegateConfig of this.delegate) {
        if (
          delegateConfig &&
          typeof delegateConfig.createSnapshotSuccess === "function"
        ) {
          await delegateConfig.createSnapshotSuccess(
            snapshotManager,
            snapshot,
            error
          );
          return;
        }
      }
      throw new Error("No valid delegate found for createSnapshotFailure");
    } else {
      throw new Error("Delegate is undefined or empty");
    }
  }

  createSnapshotSuccess(
    snapshotId: string,
    snapshotManager: SnapshotManager<T, K>,
    snapshot: Snapshot<T, K>,
    payload: { error: Error }
  ): void {
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

  clearSnapshotSuccess: () => void = () => {
    this.getDelegate().clearSnapshotSuccess();
    this.notifySuccess("Snapshot cleared successfully.");
  };

  clearSnapshotFailure: () => void = () => {
    this.getDelegate().clearSnapshotFailure();
    this.notifyFailure("Error clearing snapshot.");
  };

  createSnapshotFailure(
    snapshotId: string,
    snapshotManager: SnapshotManager<T, K>,
    snapshot: Snapshot<T, K>,
    payload: { error: Error }
  ): void {
    notify(
      "createSnapshotFailure",
      `Error creating snapshot: ${payload.error.message}`,
      "",
      new Date(),
      NotificationTypeEnum.Error,
      NotificationPosition.TopRight
    );
  }

  setSnapshotSuccess(
    snapshotData: SnapshotStore<T, K>,
    subscribers: ((data: Subscriber<T, K>) => void)[]
  ): void {
    this.handleDelegate(
      (delegate) => delegate.setSnapshotSuccess.bind(delegate),
      snapshotData,
      subscribers
    );
  }

  setSnapshotFailure(error: Error): void {
    this.handleDelegate(
      (delegate) => delegate.setSnapshotFailure.bind(delegate),
      error
    );
  }

  async createSnapshotFailure(
    snapshotId: string,
    snapshotManager: SnapshotManager<T, K>,
    snapshot: Snapshot<T, K>,
    payload: { error: Error }
  ): Promise<void> {
    notify(
      "createSnapshotFailure",
      `Error creating snapshot: ${payload.error.message}`,
      "",
      new Date(),
      NotificationTypeEnum.Error,
      NotificationPosition.TopRight
    );

    await this.handleDelegate(
      (delegate) => delegate.createSnapshotFailure.bind(delegate),
      snapshotId,
      snapshotManager,
      snapshot,
      payload
    );

    return Promise.reject(payload.error);
  }

  updateSnapshots(): void {
    this.handleDelegate((delegate) => delegate.updateSnapshots.bind(delegate));
  }

  updateSnapshotsSuccess(
    snapshotData: (
      subscribers: Subscriber<T, K>[],
      snapshot: Snapshots<T>
    ) => void
  ): void {
    this.handleDelegate(
      (delegate) => delegate.updateSnapshotsSuccess.bind(delegate),
      snapshotData
    );
  }

  updateSnapshotsFailure(error: Payload): void {
    this.handleDelegate(
      (delegate) => delegate.updateSnapshotsFailure.bind(delegate),
      error
    );
  }

  initSnapshot(
    snapshot: SnapshotStore<T, K> | Snapshot<T, K> | null,
    snapshotId: string | null,
    snapshotData: SnapshotStore<T, K>,
    category: Category | undefined,
    categoryProperties: CategoryProperties,
    snapshotConfig: SnapshotStoreConfig<SnapshotWithCriteria<any, BaseData>, K>,
    callback: (snapshotStore: SnapshotStore<any, any>) => void
  ): void {
    this.handleDelegate(
      (delegate) => delegate.initSnapshot.bind(delegate),
      snapshot,
      snapshotId,
      snapshotData,
      category,
      snapshotConfig,
      callback
    );
  }

  async takeSnapshot(
    snapshot: Snapshot<T, K>,
    subscribers?: Subscriber<T, K>[]
  ): Promise<{ snapshot: Snapshot<T, K> }> {
    try {
      const result = await this.handleDelegate(
        (delegate) => delegate.takeSnapshot.bind(delegate),
        snapshot
      );

      if (result !== null && Array.isArray(result)) {
        const snapshotWrapper: Snapshot<T, K> = {
          ...result[0],
          data: result[0].data as BaseData, // Ensure data type matches BaseData
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
    } catch (error) {
      handleApiError(error as AxiosError<unknown>, "Failed to take snapshot");
      throw error;
    }
  }

  takeSnapshotSuccess(snapshot: Snapshot<T, K>): void {
    this.handleDelegate(
      (delegate) => delegate.takeSnapshotSuccess.bind(delegate),
      snapshot
    );
  }

  takeSnapshotsSuccess(snapshots: T[]): void {
    this.handleDelegate(
      (delegate) => delegate.takeSnapshotsSuccess.bind(delegate),
      snapshots
    );
  }

  configureSnapshotStore(
    snapshotStore: SnapshotStore<T, K>,
    snapshotId: string,
    data: Map<string, Snapshot<T, K>>,
    events: Record<string, CalendarManagerStoreClass<T, K>[]>,
    dataItems: RealtimeDataItem[],
    newData: Snapshot<T, K>,
    payload: ConfigureSnapshotStorePayload<T>,
    store: SnapshotStore<any, K>,
    callback: (snapshotStore: SnapshotStore<T, K>) => void
  ): void {
    this.handleDelegate(
      (delegate) => delegate.configureSnapshotStore.bind(delegate),
      snapshotStore,
      snapshotId,
      data,
      events,
      dataItems,
      newData,
      payload,
      store,
      callback
    );
  }

  updateSnapshotStore(
    snapshotStore: SnapshotStore<T, K>, // Current snapshot store
    snapshotId: string,
    data: Map<string, Snapshot<T, K>>,
    events: Record<string, CalendarManagerStoreClass<T, K>[]>,
    dataItems: RealtimeDataItem[],
    newData: Snapshot<T, K>, // New snapshot data
    payload: ConfigureSnapshotStorePayload<T>,
    store: SnapshotStore<any, K>, // New snapshot store after update
    callback: (snapshotStore: SnapshotStore<T, K>) => void
  ): void {
    if (
      this.delegate &&
      Array.isArray(this.delegate) &&
      this.delegate.length > 0
    ) {
      const delegate = this.delegate.find(
        (
          d
        ): d is SnapshotStoreConfig<SnapshotWithCriteria<any, BaseData>, K> & {
          snapshotStore: Function;
        } => d != null && typeof d.snapshotStore === "function"
      );

      if (delegate) {
        delegate.snapshotStore(
          snapshotStore, // Passing the current snapshot store
          snapshotId,
          data,
          events,
          dataItems,
          newData, // Passing the new snapshot data
          payload,
          store, // Passing the new snapshot store after update
          callback
        );
      } else {
        console.error("No valid delegate found for snapshotStore.");
      }
    } else {
      console.error("Delegate is undefined or empty.");
    }
  }

  // New flatMap method
  public flatMap<U extends Iterable<any>>(
    callback: (
      value: SnapshotStoreConfig<SnapshotWithCriteria<any, BaseData>, K>,
      index: number,
      array: SnapshotStoreConfig<SnapshotWithCriteria<any, BaseData>, K>[]
    ) => U
  ): U extends (infer I)[] ? I[] : U[] {
    const result = [] as unknown as U extends (infer I)[] ? I[] : U[];
    if (this.snapshotStoreConfig) {
      this.snapshotStoreConfig.forEach(
        (
          delegateItem: SnapshotStoreConfig<
            SnapshotWithCriteria<any, BaseData>,
            K
          >,
          i: number,
          arr: SnapshotStoreConfig<SnapshotWithCriteria<any, BaseData>, K>[]
        ) => {
          const mappedValues = callback(delegateItem, i, arr);
          result.push(
            ...(mappedValues as unknown as (U extends (infer I)[] ? I : U)[])
          );
        }
      );
    } else {
      console.error("snapshotStoreConfig is undefined");
    }
    return result;
  }

  setData(data: Map<string, Snapshot<T, K>>): void {
    this.handleDelegate((delegate) => delegate.setData, data);
  }

  getState(): any {
    const result = this.handleDelegate((delegate) => delegate.getState);
    return result !== undefined ? result : undefined;
  }

  setState(state: any): void {
    this.handleDelegate((delegate) => delegate.setState, state);
  }

  validateSnapshot(snapshotId: string, snapshot: Snapshot<T, K>): boolean {
    const result = this.handleDelegate(
      (delegate) => delegate.validateSnapshot,
      snapshotId,
      snapshot
    );
    return result !== undefined ? result : false;
  }

  handleSnapshot(
    id: string,
    snapshotId: string,
    snapshot: T | null,
    snapshotData: T,
    category: Category | undefined,
    categoryProperties: CategoryProperties,
    callback: (snapshot: T) => void,
    snapshots: SnapshotsArray<T>,
    type: string,
    event: Event,
    snapshotContainer?: T,
    snapshotStoreConfig?: SnapshotStoreConfig<
      SnapshotWithCriteria<any, BaseData>,
      K
    >
  ): Promise<Snapshot<T, K> | null> {
    const result = this.handleDelegate(
      (delegate) => delegate.handleSnapshot,
      id,
      snapshotId,
      snapshot,
      snapshotData,
      category,
      callback,
      snapshots,
      type,
      event,
      snapshotContainer,
      snapshotStoreConfig
    );

    return result !== undefined ? result : Promise.resolve(null);
  }

  handleActions(action: (selectedText: string) => void): void {
    const firstDelegate = this.delegate?.[0];
    if (firstDelegate && typeof firstDelegate.handleActions === "function") {
      firstDelegate.handleActions(action);
    } else {
      console.error("No valid delegate found to handle actions.");
    }
  }

  setSnapshot(snapshot: Snapshot<T, K>): void {
    const firstDelegate = this.delegate?.[0];
    if (firstDelegate && typeof firstDelegate.setSnapshot === "function") {
      firstDelegate.setSnapshot(snapshot);
    } else {
      console.error("No valid delegate found to set snapshot.");
    }
  }

  transformSnapshotConfig<T extends BaseData>(
    config: SnapshotStoreConfig<SnapshotWithCriteria<any, BaseData>, T>
  ): SnapshotStoreConfig<SnapshotWithCriteria<any, BaseData>, T> {
    const { initialState, configOption, ...rest } = config;

    // Safely transform configOption and its initialState
    const transformedConfigOption =
      typeof configOption === "object" &&
      configOption !== null &&
      "initialState" in configOption
        ? {
            ...configOption,
            initialState:
              configOption.initialState instanceof Map
                ? new Map<string, Snapshot<BaseData, T>>([
                    ...configOption.initialState.entries(),
                  ])
                : null,
          }
        : undefined;

    // Safely handle initialState based on its type
    let transformedInitialState:
      | SnapshotStore<BaseData, T>
      | Snapshot<BaseData, T>
      | Map<string, Snapshot<BaseData, T>>
      | null;
    if (
      isSnapshotStore(initialState) ||
      isSnapshot(initialState) ||
      initialState instanceof Map ||
      initialState === null
    ) {
      transformedInitialState = initialState;
    } else {
      transformedInitialState = null; // Handle any other case as necessary
    }

    return {
      ...rest,
      initialState: transformedInitialState,
      configOption: transformedConfigOption
        ? transformedConfigOption
        : undefined,
    };
  }

  setSnapshotData(
    data: Map<string, Snapshot<T, K>>,
    subscribers: Subscriber<any, any>[],
    snapshotData: Partial<
      SnapshotStoreConfig<SnapshotWithCriteria<any, BaseData>, K>
    >
  ): void {
    // Update the config with the provided snapshot data
    if (this.config) {
      this.config = this.config.map((configItem) => ({
        ...configItem,
        ...snapshotData,
        initialState:
          snapshotData.initialState !== undefined
            ? snapshotData.initialState
            : configItem.initialState !== undefined
            ? configItem.initialState
            : null, // Handle undefined explicitly
      }));
    } else {
      this.config = [
        {
          ...snapshotData,
          initialState:
            snapshotData.initialState !== null
              ? snapshotData.initialState
              : null,
        },
      ];
    }

    // Retrieve the current snapshot using the delegate
    const currentSnapshot = this.handleDelegate((delegate) => delegate);

    if (currentSnapshot) {
      // Create a new SnapshotStoreConfig object with updated state and snapshot data
      const updatedSnapshot: SnapshotStoreConfig<SnapshotWithCriteria<any, BaseData>, K> = {
        ...currentSnapshot,
        ...snapshotData,
        initialState:
          snapshotData.initialState !== undefined
            ? snapshotData.initialState
            : currentSnapshot.initialState !== undefined
            ? currentSnapshot.initialState
            : null, // Handle undefined explicitly
        state: currentSnapshot.state
          ? this.filterInvalidSnapshots(currentSnapshot.state)
          : null,
      };

      // Transform the updated snapshot to ensure it matches the expected type
      const transformedSnapshot = this.transformSnapshotConfig(updatedSnapshot);

      // Safely update the first element of the delegate array if it exists
      if (this.delegate && this.delegate.length > 0) {
        this.delegate[0] = transformedSnapshot;
      } else {
        // If the delegate array is empty, initialize it with the transformed snapshot
        this.delegate = [transformedSnapshot];
      }

      // Notify subscribers of the update, passing the relevant snapshot data
      this.notifySubscribers(subscribers, snapshotData);
    }
  }

  private filterInvalidSnapshots(
    state: Map<string, Snapshot<T, K>>
  ): Map<string, Snapshot<T, K>> {
    return new Map(
      [...state.entries()].filter(([_, snapshot]) =>
        this.validateSnapshot(snapshot)
      )
    );
  }

  setSnapshots(snapshots: Snapshots<T>): void {
    this.handleDelegate((delegate) => delegate.setSnapshots, snapshots);
  }

  clearSnapshot(): void {
    this.handleDelegate((delegate) => delegate.clearSnapshot);
  }

  mergeSnapshots(snapshots: Snapshots<T>, category: string): void {
    this.handleDelegate(
      (delegate) => delegate.mergeSnapshots,
      snapshots,
      category
    );
  }

  reduceSnapshots<U>(
    callback: (acc: U, snapshot: Snapshot<T, K>) => U,
    initialValue: U
  ): U | undefined {
    return this.handleDelegate(
      (delegate) => delegate.reduceSnapshots,
      callback,
      initialValue
    );
  }

  sortSnapshots(): void {
    this.handleDelegate((delegate) => delegate.sortSnapshots);
  }

  filterSnapshots(): void {
    this.handleDelegate((delegate) => delegate.filterSnapshots);
  }

  async mapSnapshotsAO(
    storeIds: number[],
    snapshotId: string,
    category: Category | undefined,
    categoryProperties: CategoryProperties,
    snapshot: Snapshot<T, K>,
    timestamp: string | number | Date | undefined,
    type: string,
    event: Event,
    id: number,
    snapshotStore: SnapshotStore<T, K>,
    data: T
  ): Promise<SnapshotContainer<T, K>> {
    try {
      const snapshotMap = new Map<string, Snapshot<T, K>>();
      snapshotMap.set(snapshotId, snapshot);

      const snapshotsArray: SnapshotsArray<T> = Array.from(
        snapshotMap.values()
      );
      const snapshotsObject: SnapshotsObject<T> = Object.fromEntries(
        snapshotMap.entries()
      );

      return {
        id: snapshotId,
        category: category as string,
        timestamp:
          timestamp instanceof Date
            ? timestamp.toISOString()
            : timestamp?.toString() || "",
        snapshot: snapshotMap.get(snapshotId) as Snapshot<T, K>,
        snapshotStore,
        snapshotData: snapshotStore, // Assuming this is similar to snapshotStore; adjust if needed
        data,
        snapshotsArray,
        snapshotsObject,
      };
    } catch (error) {
      console.error("Error mapping snapshots:", error);
      throw new Error("Failed to map snapshots");
    }
  }

  mapSnapshots: (
    storeIds: number[],
    snapshotId: string,
    category: Category | undefined,
    categoryProperties: CategoryProperties,
    snapshot: Snapshot<T, K>,
    timestamp: string | number | Date | undefined,
    type: string,
    event: Event,
    id: number,
    snapshotStore: SnapshotStore<T, K>,
    data: T,
    callback: (
      storeIds: number[],
      snapshotId: string,
      category: Category | undefined,
      categoryProperties: CategoryProperties,
      snapshot: Snapshot<T, K>,
      timestamp: string | number | Date | undefined,
      type: string,
      event: Event,
      id: number,
      snapshotStore: SnapshotStore<T, K>,
      data: T
    ) => Promise<SnapshotsArray<T>>
  ) => Promise<SnapshotsArray<T>> = (
    storeIds,
    snapshotId,
    category,
    snapshot,
    timestamp,
    type,
    event,
    id,
    snapshotStore,
    data
    // callback
  ) => {
    if (!this.delegate || this.delegate.length === 0) {
      return Promise.resolve([]);
    }

    // Delegate the call to the first delegate in the list
    return this.delegate[0].mapSnapshots(
      storeIds,
      snapshotId,
      category,
      snapshot,
      timestamp,
      type,
      event,
      id,
      snapshotStore,
      data,
      callback
    );
  };

  findSnapshot(
    predicate: (snapshot: Snapshot<T, K>) => boolean
  ): Snapshot<T, K> | undefined {
    // Ensure that this.delegate is defined before iterating
    if (!this.delegate) {
      return undefined;
    }

    // Iterate over each delegate to find a matching snapshot
    for (const delegate of this.delegate) {
      const foundSnapshot = delegate.findSnapshot(predicate);
      if (foundSnapshot) {
        return foundSnapshot;
      }
    }

    // Return undefined if no matching snapshot is found
    return undefined;
  }

  getSubscribers(
    subscribers: Subscriber<T, K>[],
    snapshots: Snapshots<T>
  ): Promise<{
    subscribers: Subscriber<T, K>[];
    snapshots: Snapshots<T>;
  }> {
    return this.delegate[0].getSubscribers(subscribers, snapshots);
  }

  notify(
    id: string,
    message: string,
    content: any,
    date: Date,
    type: NotificationType,
    notificationPosition?: NotificationPosition | undefined
  ): void {
    this.delegate[0].notify(id, message, content, new Date(), type);
  }

  notifySubscribers(
    subscribers: Subscriber<T, K>[],
    data: Partial<SnapshotStoreConfig<SnapshotWithCriteria<any, BaseData>, any>>
  ): Subscriber<T, K>[] {
    // Example implementation
    return this.delegate[0].notifySubscribers(subscribers, data);
  }

  subscribe(): void {
    this.delegate[0].subscribe();
  }

  unsubscribe(): void {
    this.delegate[0].unsubscribe();
  }
  fetchSnapshot(
    callback: (
      snapshotId: string,
      payload: FetchSnapshotPayload<K>,
      snapshotStore: SnapshotStore<T, K>,
      payloadData: T | Data,
      category: Category | undefined,
      categoryProperties: CategoryProperties,
      timestamp: Date,
      data: T,
      delegate: SnapshotWithCriteria<T, K>[]
    ) => void
  ): Promise<{
    id: any;
    category: Category | undefined;
    categoryProperties: CategoryProperties;
    timestamp: any;
    snapshot: Snapshot<T, K>;
    data: T;
    getItem?: (snapshot: Snapshot<T, K>) => Snapshot<T, K> | undefined;
  }> {
    try {
      // Assuming 'delegate' is an array of snapshot criteria or similar, and we need to fetch a snapshot
      // Here 'fetchSnapshot' is called on the delegate, modify as per your actual fetching logic
  
      const fetchedSnapshot = await delegate[0].fetchSnapshot(
        snapshotId,
        category,
        timestamp,
        callback,
        data
      );
  
      // Return the required object structure
      return {
        id: fetchedSnapshot.id,
        category: fetchedSnapshot.category,
        categoryProperties: categoryProperties,
        timestamp: fetchedSnapshot.timestamp,
        snapshot: fetchedSnapshot.snapshot,
        data: fetchedSnapshot.data as T,
        getItem: fetchedSnapshot.getItem,
      };
    } catch (error) {
      console.error("Error fetching snapshot:", error);
      throw error; // Handle or propagate the error as needed
    }
  }
  

  fetchSnapshotSuccess(
    snapshotData: (
      snapshotManager: SnapshotManager<T, K>,
      subscribers: Subscriber<T, K>[],
      snapshot: Snapshot<T, K>
    ) => void
  ): void {
    this.delegate[0].fetchSnapshotSuccess(snapshotData);
  }

  fetchSnapshotFailure(payload: { error: Error }): void {
    this.delegate[0].fetchSnapshotFailure(payload);
  }

  getSnapshots(category: string, data: Snapshots<T>): void {
    this.delegate[0].getSnapshots(category, data);
  }

  getAllSnapshots(
    data: (
      subscribers: Subscriber<T, K>[],
      snapshots: Snapshots<T>
    ) => Promise<Snapshots<T>>
  ): void {
    this.delegate[0].getAllSnapshots(data);
  }

  getSnapshotStoreData(
    snapshotStore: SnapshotStore<T, K>,
    snapshot: Snapshot<T, K>,
    snapshotId: string,
    snapshotData: SnapshotStore<T, K>
  ): SnapshotStore<T, K> {
    this.delegate[0].getSnapshotStoreData(
      snapshotStore,
      snapshot,
      snpshotId,
      snapshotData
    );
  }

  generateId(): string {
    const delegateWithGenerateId = this.delegate?.find((d) => d.generateId);
    const generatedId = delegateWithGenerateId?.generateId();
    return typeof generatedId === "string" ? generatedId : "";
  }

  batchFetchSnapshots(
    subscribers: Subscriber<T, K>[],
    snapshots: Snapshots<T>
  ): void {
    this.delegate[0].batchFetchSnapshots(subscribers, snapshots);
  }

  batchTakeSnapshotsRequest(snapshotData: SnapshotData<T, K>): void {
    this.delegate[0].batchTakeSnapshotsRequest(snapshotData);
  }

  batchUpdateSnapshotsRequest(
    snapshotData: (subscribers: Subscriber<T, K>[]) => Promise<{
      subscribers: Subscriber<T, K>[];
      snapshots: Snapshots<T>;
    }>
  ): void {
    snapshotData(this.subscribers).then(({ snapshots }) => {
      this.delegate[0].batchUpdateSnapshotsRequest(async (subscribers) => {
        const { snapshots } = await snapshotData(subscribers);
        return { subscribers, snapshots };
      });
    });
  }

  batchFetchSnapshotsSuccess(
    subscribers: Subscriber<T, K>[],
    snapshots: Snapshots<T>
  ): void {
    this.delegate[0].batchFetchSnapshotsSuccess(subscribers, snapshots);
  }

  batchFetchSnapshotsFailure(payload: { error: Error }): void {
    this.delegate[0].batchFetchSnapshotsFailure(payload);
  }

  batchUpdateSnapshotsSuccess(
    subscribers: Subscriber<T, K>[],
    snapshots: Snapshots<T>
  ): void {
    const delegate = this.delegate[0];
    if (delegate && delegate.batchUpdateSnapshotsSuccess) {
      delegate.batchUpdateSnapshotsSuccess(subscribers, snapshots);
    } else {
      // Handle the case where delegate or batchUpdateSnapshotsSuccess is undefined, if needed
      console.error(
        "Delegate or batchUpdateSnapshotsSuccess is undefined. Cannot perform batch update."
      );
      // Or handle the error in a way that fits your application's error handling strategy
    }
  }

  batchUpdateSnapshotsFailure(payload: { error: Error }): void {
    this.delegate[0].batchUpdateSnapshotsFailure(payload);
  }

  batchTakeSnapshot(
    snapshotStore: SnapshotStore<T, K>,
    snapshots: Snapshots<T>
  ): Promise<{ snapshots: Snapshots<T> }> {
    return new Promise((resolve) => {
      const result = this.delegate[0].batchTakeSnapshot(
        snapshotStore,
        snapshots
      );
      resolve(result);
    });
  }

  handleSnapshotSuccess(
    snapshot: Snapshot<Data, Data> | null,
    snapshotId: string
  ): void {
    // Ensure the snapshot is not null before proceeding
    if (snapshot) {
      // Perform actions required for handling the successful snapshot
      // For example, updating internal state, notifying subscribers, etc.
      SnapshotActions.handleTaskSnapshotSuccess({ snapshot, snapshotId });
      console.log(`Handling success for snapshot ID: ${snapshotId}`);
      // Implement additional logic here based on your application's needs
    }
    // No return statement needed since the method should return void
  }

  // Implementing [Symbol.iterator] method
  [Symbol.iterator](): IterableIterator<Snapshot<T, K>> {
    const snapshotIterator = this.snapshots.values();

    // Create a custom iterator that maps each item to Snapshot<T, K>
    const iterator: IterableIterator<Snapshot<T, K>> = {
      [Symbol.iterator]: function () {
        return this;
      },
      next: function () {
        const next = snapshotIterator.next();
        if (next.done) {
          return { done: true, value: undefined as any };
        }

        // Handle the conversion to Snapshot<BaseData, BaseData> if necessary
        let snapshot: Snapshot<T, K>;
        if (next.value instanceof SnapshotStore) {
          snapshot = convertSnapshotStoreToSnapshot(next.value);
        } else {
          snapshot = next.value;
        }

        // Convert Snapshot<BaseData> to Snapshot<T, K> using snapshotType function
        const value: Snapshot<T, K> = snapshotType(snapshot);
        return { done: false, value };
      },
    };

    return iterator;
  }

  isExpired(): boolean | undefined {
    return !!this.expirationDate && new Date() > this.expirationDate;
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
  version?: Version;
  previousVersionId?: string;
  nextVersionId?: string;
  auditTrail?: AuditRecord[];
  addAuditRecord?(record: AuditRecord): void {
    // Implementation here
  }
  retentionPolicy?: RetentionPolicy;
  dependencies?: string[];
}

// // Example usage of the Snapshot interface
// const takeSnapshot = async () => {
//   const snapshotData = await fetchInitialSnapshotData();
//   const { createSnapshot } = useSnapshotStore(addToSnapshotList);
//   const snapshot = await takeSnapshot();
//   console.log(snapshot);
// };


// const category = (process.argv[3] as keyof CategoryProperties) ?? "isHiddenInList";
// const dataStoreMethods = {};

// // export default SnapshotStore
// export { initializeData, initialState };
// export type { SubscriberCollection };

// export default SnapshotStore;
