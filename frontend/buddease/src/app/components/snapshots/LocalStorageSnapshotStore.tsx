// LocalStorageSnapshotStore.tsx

import { endpoints } from "@/app/api/ApiEndpoints";
import { getSubscriberId } from "@/app/api/subscriberApi";
import { CategoryProperties } from "@/app/pages/personas/ScenarioBuilder";
import { FC } from "react";
import { Order } from "../crypto/Orders";
import { ModifiedDate } from "../documents/DocType";
import { SnapshotStoreOptions } from "../hooks/useSnapshotManager";
import { Content } from "../models/content/AddContent";
import { BaseData, Data } from "../models/data/Data";
import {
  PriorityTypeEnum,
  ProjectPhaseTypeEnum,
  SubscriberTypeEnum,
  SubscriptionTypeEnum,
} from "../models/data/StatusType";
import { displayToast } from "../models/display/ShowToast";
import { Task, TaskData } from "../models/tasks/Task";
import { Tag } from "../models/tracker/Tag";
import { Phase } from "../phases/Phase";
import { DataStoreWithSnapshotMethods } from "../projects/DataAnalysisPhase/DataProcessing/ DataStoreMethods";
import {
  DataStore,
  useDataStore,
} from "../projects/DataAnalysisPhase/DataProcessing/DataStore";
import { AllStatus } from "../state/stores/DetailsListStore";
import { Subscription } from "../subscriptions/Subscription";
import { NotificationTypeEnum } from "../support/NotificationContext";
import {
  getCommunityEngagement,
  getMarketUpdates,
  getTradeExecutions,
} from "../trading/TradingUtils";
import { convertSnapshot } from "../typings/YourSpecificSnapshotType";
import { Subscriber } from "../users/Subscriber";
import {
  logActivity,
  notifyEventSystem,
  portfolioUpdates,
  triggerIncentives,
  unsubscribe,
  updateProjectState,
} from "../utils/applicationUtils";
import { addToSnapshotList, generateSnapshotId } from "../utils/snapshotUtils";
import {
  AuditRecord,
  K,
  SnapshotStoreConfig,
  T,
  snapshotConfig,
} from "./SnapshotConfig";
import { SnapshotStoreMethod } from "./SnapshotStorMethods";
import SnapshotStore, {
  defaultCategory,
  defaultSubscribeToSnapshot,
  defaultSubscribeToSnapshots,
  handleSnapshotOperation
} from "./SnapshotStore";
import {
  Callback,
  subscribeToSnapshotImpl,
  subscribeToSnapshotsImpl,
} from "./subscribeToSnapshotsImplementation";

interface Payload {
  error: string;
  meta: {
    name: string;
    timestamp: Date;
    type: NotificationTypeEnum;
    startDate: Date;
    endDate: Date;
    status: AllStatus;
    // title: string;
    // message: string;
    id: string;
    // position: NotificationPosition;
    // duration: number;
    isSticky: boolean;
    isDismissable: boolean;
    isClickable: boolean;
    isClosable: boolean;
    isAutoDismiss: boolean;
    isAutoDismissable: boolean;
    isAutoDismissOnNavigation: boolean;
    isAutoDismissOnAction: boolean;
    isAutoDismissOnTimeout: boolean;
    isAutoDismissOnTap: boolean;
    optionalData: any;
    data: any;
  };
}

interface UpdateSnapshotPayload<T> {
  snapshotId: string;
  title: string;
  description: string;
  newData: T;
  createdAt: Date | undefined;
  updatedAt: Date | undefined;
  status: "active" | "inactive" | "archived";
  category: string;
}

const SNAPSHOT_URL = endpoints.snapshots;
type Snapshots<T extends BaseData> = Array<Snapshot<T, any>>;
const SNAPSHOT_STORE_CONFIG = snapshotConfig;

interface CustomSnapshotData extends Data {
  timestamp: string | number | Date | undefined;
  value?: string | number | undefined;
  orders?: Order[];
}

interface CoreSnapshot<T extends BaseData, K extends BaseData> {
  id?: string | number;
  data: T | Map<string, Snapshot<T, K>> | null | undefined;
  name?: string;
  timestamp?: string | number | Date | undefined;
  orders?: any;
  createdBy?: string;
  subscriberId?: string;
  length?: number;
  category?: string | CategoryProperties | undefined;
  date?: string | number | string | number | Date;
  status?: string;
  content?: string | Content | undefined;
  message?: string;
  type?: string | null | undefined;
  phases?: ProjectPhaseTypeEnum;
  phase?: Phase | null;
  ownerId?: string;
  store?: SnapshotStore<T, K> | null;
  state?: Snapshot<T> | null; // Ensure state matches Snapshot<T> or null/undefined
  dataStore?: DataStore<T, K>;
  initialState?: SnapshotStore<T, K> | Snapshot<T, K> | null | undefined;
  setSnapshotData?: (data: Data) => void;
  snapshotConfig?: SnapshotStoreConfig<BaseData, BaseData>[];
  subscribeToSnapshots?: (
    snapshotId: string,
    callback: (snapshots: Snapshots<T>) => void
  ) => void;
  getItem?: (key: T) => T | undefined;
}

interface SnapshotData<T extends BaseData, K extends BaseData = T> {
  // id: string
  _id?: string;
  snapshotIds?: string[];
  title?: string;
  description?: string | null;
  tags?: Tag[] | string[];
  key?: string;
  topic?: string;
  priority?: string | PriorityTypeEnum;
  subscription?: Subscription<T> | null;
  config?: SnapshotStoreConfig<BaseData, any>[] | null;
  metadata?: any;
  isExpired?: boolean;
  isCompressed?: boolean;
  isEncrypted?: boolean;
  isSigned?: boolean;
  expirationDate?: Date | string;
  auditTrail?: AuditRecord[];
  subscribers?: Subscriber<BaseData, K>[];
  delegate?: SnapshotStoreConfig<T, K>[];
  value?: number | string | undefined;
  todoSnapshotId?: string;
  dataStoreMethods?: DataStore<T, K> | null;
  createdAt?: Date;
  updatedAt?: Date;
  then?: (callback: (newData: Snapshot<Data>) => void) => void | undefined;
}

interface Snapshot<T extends BaseData, K
  extends BaseData = T> extends CoreSnapshot<T, K>,
  SnapshotData<T> {
    data: T | Map<string, Snapshot<T, K>> | null | undefined
    store?: SnapshotStore<T, K> | null;
}

function createOptions<T extends BaseData, K extends BaseData>(params: {
  initialState: SnapshotStore<T, K> | null;
  date: string | Date;
  snapshotId: string;
  category: CategoryProperties;
  dataStoreMethods: Partial<DataStore<T, K>>;
  snapshotMethods?: SnapshotStoreMethod<T, K>[]; // Make this optional
  type?: string; // Optional, adjust as needed
  snapshotConfig?: any; // Optional, adjust as needed
  subscribeToSnapshots?: (
    snapshotId: string,
    callback: (snapshots: Snapshots<T>) => Subscriber<T, T> | null,
    snapshot: Snapshot<T, K>
  ) => void;
  subscribeToSnapshot?: (
    snapshotId: string,
    callback: Callback<Snapshot<T, K>>,
    snapshot: Snapshot<T, K>
  ) => void;
  delegate?: SnapshotStoreConfig<T, K>[]; // Adjust if needed
}): SnapshotStoreOptions<T, K> {
  // Default implementations for dataStoreMethods
  const defaultDataStoreMethods: DataStore<T, K> = {
    data: new Map<string, Snapshot<T, K>>(),
    addData: (data: Snapshot<T, K>) => {
      /* Default implementation */
    },
    removeData: (id: number) => {
      /* Default implementation */
    },
    updateData: (id: number, data: T) => {
      /* Default implementation */
    },
    addDataStatus: (
      id: number,
      status: "pending" | "inProgress" | "completed"
    ) => {
      /* Default implementation */
    },
    updateDataTitle: (id: number, title: string) => {
      /* Default implementation */
    },
    updateDataDescription: (id: number, description: string) => {
      /* Default implementation */
    },
    updateDataStatus: (
      id: number,
      status: "pending" | "inProgress" | "completed"
    ) => {
      /* Default implementation */
    },
    getItem: async (key: string) => undefined,
    setItem: async (id: string, item: T) => {
      /* Default implementation */
    },
    removeItem: async (key: string) => {
      /* Default implementation */
    },
    getAllKeys: async () => [],
    getAllItems: async () => [],
    getDataVersions: async (id: number): Promise<T[] | undefined> => {
      return undefined;
    },
    updateDataVersions: async (id: number, versions: T[]) => {
      /* Default implementation */
    },
    getBackendVersion: async (): Promise<string> => "0.0.0",
    getFrontendVersion: async (): Promise<string> => "0.0.0",
    addDataSuccess: async (payload: { data: T[] }) => {
      /* Default implementation */
    },
    getDelegate: async (): Promise<SnapshotStoreConfig<T, K>[]> => [],
    fetchData: async (): Promise<SnapshotStore<T, K>[]> => [],
    snapshotMethods: [],
    
  };

  // Merge the provided dataStoreMethods and snapshotMethods with the defaults
  const mergedDataStoreMethods: DataStore<T, K> = {
    ...defaultDataStoreMethods,
    ...params.dataStoreMethods,
    snapshotMethods: params.snapshotMethods
      ? params.snapshotMethods
      : defaultDataStoreMethods.snapshotMethods || [],
  };

  const subscribeToSnapshots =
    params.subscribeToSnapshots ||
    ((
      snapshotId: string,
      callback: (snapshots: Snapshots<T>) => Subscriber<T, T> | null
    ) => {
      // Default implementation
      const dummySnapshots: Snapshots<T> = [];
      callback(dummySnapshots);
    });

  const subscribeToSnapshot =
    params.subscribeToSnapshot ||
    ((
      snapshotId: string,
      callback: (snapshot: Snapshot<T, K>) => void,
      snapshot: Snapshot<T, K>
    ): Promise<Subscriber<T, T> | null> => {
      return new Promise((resolve, reject) => {
        try {
          // Convert the snapshot as needed
          const convertedSnapshot = convertSnapshot(snapshot);

          // Call subscribeToSnapshots with all required arguments
          subscribeToSnapshots(
            snapshotId,
            (snapshots) => {
              if (Array.isArray(snapshots)) {
                snapshots.forEach((snapshot) => {
                  // Ensure `snapshot` is of type `Snapshot<T, K>`
                  const validSnapshot = convertSnapshot(snapshot);
                  callback(validSnapshot);
                });
              } else {
                // Handle the case where `snapshots` is a single `Snapshot<T, K>`
                const validSnapshot = convertSnapshot(snapshots);
                callback(validSnapshot);
              }
              // Resolve with a valid Subscriber<T, T> or null
              resolve(null);
              return null; // Ensure the function matches the return type `Subscriber<T, T> | null`
            },
            convertedSnapshot // Provide the third argument
          );
        } catch (error) {
          reject(error);
        }
      });
    });

  return {
    data: {} as Partial<SnapshotStore<T, K>>,
    date: params.date || new Date(),
    initialState: params.initialState || null,
    snapshotId: params.snapshotId || "",
    category: {
      name: params.category.name || "default-category",
      description: params.category.description || "",
      icon: params.category.icon || "",
      color: params.category.color || "",
      iconColor: params.category.iconColor || "",
      isActive: params.category.isActive || false,
      isPublic: params.category.isPublic || false,
      isSystem: params.category.isSystem || false,
      isDefault: params.category.isDefault || false,
      isHidden: params.category.isHidden || false,
      isHiddenInList: params.category.isHiddenInList || false,
      UserInterface: params.category.UserInterface || [],
      DataVisualization: params.category.DataVisualization || [],
      Forms: params.category.Forms || undefined,
      Analysis: params.category.Analysis || [],
      Communication: params.category.Communication || [],
      TaskManagement: [],
      Crypto: [],
      brandName: "",
      brandLogo: "",
      brandColor: "",
      brandMessage: "",
    },
    dataStoreMethods: mergedDataStoreMethods as DataStoreWithSnapshotMethods<T, K>,
    type: params.type || "default-type", // Provide a default value if necessary
    snapshotConfig: params.snapshotConfig || {}, // Provide a default value if necessary
    subscribeToSnapshots:
      params.subscribeToSnapshots || defaultSubscribeToSnapshots, // Provide a default implementation if necessary
    subscribeToSnapshot:
      params.subscribeToSnapshot || defaultSubscribeToSnapshot, // Provide a default implementation if necessary
    delegate: params.delegate || [], // Provide a default value if necessary
    getDelegate: params.getDelegate || defaultGetDelegate, // Provide a default implementation
  };
}
const getCurrentSnapshotConfigOptions = <
  T extends BaseData,
  K extends BaseData
>(
  snapshot: (
    id: string,
    snapshotData: SnapshotStoreConfig<any, K>,
    category: string | CategoryProperties | undefined,
    callback: (snapshotStore: SnapshotStore<any, any>) => void
  ) => Promise<any>, // Adjust type as needed
  category: keyof CategoryProperties,
  initSnapshot: (
    snapshot: SnapshotStore<T, K> | Snapshot<T, T> | null,
    snapshotId: string | null,
    snapshotData: SnapshotStore<T, K>,
    category: string | CategoryProperties | undefined,
    snapshotConfig: SnapshotStoreConfig<T, K>,
    callback: (snapshotStore: SnapshotStore<T, K>) => void
  ) => void, // Adjust type as needed
  subscribeToSnapshots: (
    snapshot: SnapshotStore<T, K>,
    snapshotId: string,
    snapshotData: SnapshotStore<T, K>,
    category: string | CategoryProperties | undefined,
    snapshotConfig: SnapshotStoreConfig<T, K>,
    callback: (snapshotStore: SnapshotStore<any, any>) => void
  ) => void, // Adjust type as needed
  delegate: any, // Adjust type as needed
  snapshotData: Snapshot<T, K>
): SnapshotStoreConfig<T, K> => {
  return {
    id: snapshotData.id || '',
    timestamp: snapshotData.timestamp || new Date().toISOString(),
    snapshotId: snapshotData.id !== undefined && snapshotData.id !== null 
    ? snapshotData.id.toString() 
      : '',
    snapshotStore: {} as SnapshotStore<T, K>,
    snapshot,
    category,
    initSnapshot,
    subscribeToSnapshots,
    delegate,
    data: {
      ...snapshotData.data,
      priority: snapshotData.data?.priority?.toString(),
    } as T,
    // Add other required properties with default values
    // type: 'default',
    name: '',
    description: '',
    tags: [],
    metadata: {},
    config: [],
    // options: {},
    // permissions: {},
    version: '1.0',
    // createdAt: new Date().toISOString(),
    // updatedAt: new Date().toISOString(),
    // createdBy: '',
    // updatedBy: '',
    // isActive: true,
    // isArchived: false,
    // isDeleted: false,
    initialState: snapshotData.initialState || null,
    snapshotCategory: snapshotData.category || undefined,
    snapshotSubscriberId: snapshotData.subscriberId || null,
    snapshotContent: snapshotData.content || undefined,
    handleSnapshot: snapshotData.handleSnapshot || null,
    state: snapshotData.state,
    snapshots: [],
    subscribers: [],
    // Add any other missing properties here
  };
};

function createSnapshotOptions<T extends BaseData, K extends BaseData>(
  snapshot: Snapshot<T, K>
): SnapshotStoreOptions<T, K> {
  return {
    data: {} as Partial<SnapshotStore<T, K>>,
    initialState: snapshot.initialState || null,
    snapshotId: snapshot.id || "",
    category: {
      name:
        typeof snapshot.category === "string"
          ? snapshot.category
          : "default-category",
      description: "",
      icon: "",
      color: "",
      iconColor: "",
      isActive: false,
      isPublic: false,
      isSystem: false,
      isDefault: false,
      isHidden: false,
      isHiddenInList: false,
      UserInterface: [],
      DataVisualization: [],
      Forms: undefined,
      Analysis: [],
      Communication: [],
      TaskManagement: [],
      Crypto: [],
      brandName: "",
      brandLogo: "",
      brandColor: "",
      brandMessage: "",
    },
    date: new Date(),
    type: "default-type",
    snapshotConfig: [], // Adjust as needed
    subscribeToSnapshots: subscribeToSnapshotsImpl,
    subscribeToSnapshot: subscribeToSnapshotImpl,
    delegate: [], // Adjust as needed
    getDelegate: [],
    dataStoreMethods: {} as DataStoreWithSnapshotMethods<T, K>, // Provide actual data store methods
    getDataStoreMethods: () => ({} as DataStoreWithSnapshotMethods<T, K>[]),
    snapshotMethods: [], // Provide appropriate default or derived snapshotMethods
    configOption: null, // Provide default or derived configOption
  
    handleSnapshotOperation: handleSnapshotOperation, // Added handleSnapshotOperation
    displayToast: displayToast, // Added displayToast
    addToSnapshotList: addToSnapshotList, // Added addToSnapshotList
 
  };
}

// Example implementation of snapshotType function
const snapshotType = <T extends BaseData, K extends BaseData = T>(
  snapshot: Snapshot<T, K>
): Snapshot<T, K> => {
  const newSnapshot = { ...snapshot }; // Shallow copy of the snapshot

  // Retrieve options for SnapshotStore initialization using the helper function
  const options: SnapshotStoreOptions<T, K> = createSnapshotOptions(snapshot);

  // Handle SnapshotStore<BaseData> or Snapshot<BaseData>
  if (snapshot.initialState && "store" in snapshot.initialState) {
    newSnapshot.initialState = snapshot.initialState;
  } else if (snapshot.initialState && "data" in snapshot.initialState) {
    newSnapshot.initialState = snapshot.initialState;
  } else {
    newSnapshot.initialState = null; // Handle null or undefined case
  }

  // Cast newSnapshot to Snapshot<T> to satisfy TypeScript requirements
  const result: Snapshot<T, K> = {
    id: snapshot.id || generateSnapshotId,
    title: snapshot.title || "",
    timestamp: snapshot.timestamp ? new Date(snapshot.timestamp) : new Date(),
    subscriberId: snapshot.subscriberId || "",
    category:
      typeof snapshot.category === "string"
        ? defaultCategory
        : snapshot.category || defaultCategory,
    length: snapshot.length || 0,
    content: snapshot.content || "",
    data: snapshot.data,
    value: snapshot.value || 0,
    key: snapshot.key || "",
    subscription: snapshot.subscription || null,
    config: snapshot.config || null,
    status: snapshot.status || "",
    metadata: snapshot.metadata || {},
    delegate: snapshot.delegate || [],
    store:
      (snapshot.store as SnapshotStore<T, K>) ||
      new SnapshotStore<T, K>(options),

    state: snapshot.state || null,
    todoSnapshotId: snapshot.todoSnapshotId || "",
    initialState: snapshot.initialState || null,
  };

  return result;
};
class LocalStorageSnapshotStore<
  T extends BaseData,
  K extends BaseData
> extends SnapshotStore<T, T> {
  private storage: Storage;

  constructor(
    storage: Storage,
    category: CategoryProperties = {
      name: "LocalStorageSnapshotStore",
      description: "LocalStorageSnapshotStore",
      icon: "fa-solid fa-database",
      color: "bg-blue-500",
      iconColor: "text-white",
      isActive: true,
      isPublic: true,
      isSystem: true,
      isDefault: true,
      isHidden: false,
      isHiddenInList: false,
      UserInterface: [],
      DataVisualization: [],
      Forms: undefined,
      Analysis: [],
      Communication: [],
      TaskManagement: [],
      Crypto: [],
      brandName: "",
      brandLogo: "",
      brandColor: "",
      brandMessage: "",
    },
    dataStoreMethods?: Partial<DataStore<T, K>>,
    initialState: SnapshotStore<T, K> | Snapshot<T, K> | null = null
  ) {
    const snapshot: Snapshot<T, K> = {
      id: "",
      category: category,
      timestamp: new Date(),
      createdBy: "",
      description: "",
      tags: [],
      metadata: {},
      data: new Map<string, T>(),
      initialState: initialState,
    };

    const options = createSnapshotOptions(snapshot);

    super(options, category, dataStoreMethods, initialState);
    this.storage = storage;
    this.dataStoreMethods = this.getDataStoreMethods()
    // this.createDataStoreMethods();
  }

  private createDataStoreMethods(): DataStore<T, K> {
    return {
      data: new Map<string, T>(),

      addData: (data: Snapshot<T, K>) => {
        if (data.id !== undefined) {
          this.storage.setItem(data.id.toString(), JSON.stringify(data));
        }
      },

      getItem: async (id: string): Promise<T | undefined> => {
        const item = this.storage.getItem(id);
        return item ? (JSON.parse(item) as T) : undefined;
      },

      removeData: (id: number) => {
        this.storage.removeItem(id.toString());
      },

      updateData: (id: number, newData: T) => {
        const item = this.storage.getItem(id.toString());
        if (item) {
          const data = JSON.parse(item);
          Object.assign(data, newData);
          this.storage.setItem(id.toString(), JSON.stringify(data));
        }
      },

      updateDataTitle: (id: number, title: string) => {
        const item = this.storage.getItem(id.toString());
        if (item) {
          const data = JSON.parse(item);
          data.title = title;
          this.storage.setItem(id.toString(), JSON.stringify(data));
        }
      },

      updateDataDescription: (id: number, description: string) => {
        const item = this.storage.getItem(id.toString());
        if (item) {
          const data = JSON.parse(item);
          data.description = description;
          this.storage.setItem(id.toString(), JSON.stringify(data));
        }
      },

      addDataStatus: (
        id: number,
        status: "pending" | "inProgress" | "completed"
      ) => {
        const item = this.storage.getItem(id.toString());
        if (item) {
          const data = JSON.parse(item);
          data.status = status;
          this.storage.setItem(id.toString(), JSON.stringify(data));
        }
      },

      updateDataStatus: (
        id: number,
        status: "pending" | "inProgress" | "completed"
      ) => {
        const item = this.storage.getItem(id.toString());
        if (item) {
          const data = JSON.parse(item);
          data.status = status;
          this.storage.setItem(id.toString(), JSON.stringify(data));
        }
      },

      addDataSuccess: (payload: { data: T[] }) => {
        payload.data.forEach((item) => {
          this.storage.setItem(item.id.toString(), JSON.stringify(item));
        });
      },

      getDataVersions: async (id: number): Promise<T[] | undefined> => {
        const item = this.storage.getItem(id.toString());
        return item ? [JSON.parse(item)] : undefined;
      },

      updateDataVersions: (id: number, versions: T[]) => {
        versions.forEach((version) => {
          this.storage.setItem(version.id.toString(), JSON.stringify(version));
        });
      },

      getAllKeys: this.getAllKeys,
      fetchData: this.fetchData,
      setItem: this.setItem,
      removeItem: this.removeItem,
      getAllItems: this.getAllItems,

      getBackendVersion: useDataStore().getBackendVersion(),

      getFrontendVersion: async (): Promise<string> => {
        return "frontend-version"; // Replace with actual logic
      },
    };
  }

  async getItem(key: string): Promise<T | undefined> {
    const item = this.storage.getItem(key);
    return item ? (JSON.parse(item) as T) : undefined;
  }

  setItem(key: string, value: T): Promise<void> {
    this.storage.setItem(key, JSON.stringify(value));
    return Promise.resolve();
  }

  removeItem(key: string): Promise<void> {
    this.storage.removeItem(key);
    return Promise.resolve();
  }

  async getAllKeys(): Promise<string[]> {
    const keys: string[] = [];
    for (let i = 0; i < this.storage.length; i++) {
      const key = this.storage.key(i);
      if (key) {
        keys.push(key);
      }
    }
    return keys;
  }

  async getAllItems(): Promise<T[]> {
    const keys = await this.getAllKeys();
    const items: T[] = [];
    keys.forEach((key) => {
      const item = this.storage.getItem(key);
      if (item) {
        items.push(JSON.parse(item));
      }
    });
    return items;
  }
}

// Example usage in a Redux slice or elsewhere
const newTask: Task = {
  _id: "newTaskId2",
  id: "randomTaskId", // generate unique id
  name: "",
  title: "",
  description: "",
  assignedTo: [],
  dueDate: new Date(),
  status: "Pending",
  priority: PriorityTypeEnum.Medium,
  estimatedHours: 0,
  actualHours: 0,
  startDate: new Date(),
  completionDate: new Date(),
  endDate: new Date(),
  isActive: false,
  assigneeId: "",
  payload: {},
  previouslyAssignedTo: [],
  done: false,
  data: {} as TaskData,
  source: "user",
  tags: [],
  dependencies: [],
  then: function (
    onFulfill: (newData: Snapshot<Data>) => void
  ): Snapshot<Data> {
    const store = new LocalStorageSnapshotStore<Data, BaseData>(
      window.localStorage
    );
    setTimeout(() => {
      onFulfill({
        data: {} as Map<string, Data>,
        store: store,
        state: null,
      });
    }, 1000);
    return {
      data: {} as Map<string, Data>,
      store: store,
      state: null,
    };
  },
};

export type {
  CustomSnapshotData,
  Payload,
  Snapshot,
  Snapshots,
  UpdateSnapshotPayload
};

// Create a subscription object
const subscription: Subscription<T> = {
  unsubscribe: () => {},
  portfolioUpdates: () => {},
  tradeExecutions: () => {},
  marketUpdates: () => {},
  triggerIncentives: () => {},
  communityEngagement: () => {},
  subscriberId: "sub-123",
  subscriptionId: "sub-123-id",
  subscriberType: SubscriberTypeEnum.Individual,
  subscriptionType: SubscriptionTypeEnum.STANDARD,
  getPlanName: () => SubscriberTypeEnum.Individual,
  portfolioUpdatesLastUpdated: null,
  getId: () => "id-123",
  determineCategory: (data: any) => ({} as Snapshot<any>),
  category: "category-123",
};
const subscriberId = getSubscriberId.toString();

const subscriber = new Subscriber<T, K>(
  "_id",
  "John Doe",
  subscription,
  subscriberId,
  notifyEventSystem,
  updateProjectState,
  logActivity,
  triggerIncentives,
  undefined,
  {}
);
subscriber.id = "new-id"; // Set the private property using the setter method

const snapshots: Snapshots<BaseData> = [
  {
    id: "1",
    data: {
      /* your data */
    } as Map<string, Data>,

    // name: "Snapshot 1",
    timestamp: new Date(),
    createdBy: "User123",
    subscriberId: "Sub123",
    length: 100,
    category: "update",
    status: "active",
    content: "Snapshot content",
    message: "Snapshot message",
    type: "type1",
    phases: ProjectPhaseTypeEnum.Development,
    phase: {
      id: "1",
      name: "Phase 1",
      startDate: new Date(),
      endDate: new Date(),
      // progress: 0,
      status: "In Progress",
      type: "type1",

      // Additional metadata
      _id: "abc123",
      title: "Snapshot Title",
      description: "Detailed description",
      subPhases: [
        {
          id: "1",
          name: "Subphase 1",
          startDate: new Date(),
          endDate: new Date(),
          status: "In Progress",
          type: "type1",
          duration: 0,
          subPhases: [],
          component: {} as FC<{}>,
        },
      ],
      tags: ["tag1", "tag2"],
    },
    ownerId: "Owner123",
    store: null,
    state: null,
    initialState: null,
    setSnapshotData(
      subscribers: Subscriber<any, any>[],
      snapshotData: Partial<SnapshotStoreConfig<BaseData, any>>
    ) {
      // If the config array already exists, update it with the new snapshotData
      if (this.config) {
        this.config.forEach((config) => {
          Object.assign(config, snapshotData);
        });
      } else {
        // If no config array exists, create a new one with the provided snapshotData
        this.config = [
          {
            ...snapshotData,
            subscribers: subscribers as Subscriber<T, K>[], // Set the subscribers in the config
          } as SnapshotStoreConfig<T, K>,
        ];
      }
    },
    // Additional metadata
    _id: "abc123",
    title: "Snapshot Title",
    description: "Detailed description",
    tags: ["tag1", "tag2"],
    topic: "Topic",
    priority: PriorityTypeEnum.High,
    key: "unique-key",
    subscription: {
      unsubscribe: unsubscribe,
      portfolioUpdates: portfolioUpdates,
      tradeExecutions: getTradeExecutions,
      marketUpdates: getMarketUpdates,
      triggerIncentives: triggerIncentives,
      communityEngagement: getCommunityEngagement,
      portfolioUpdatesLastUpdated: {
        value: new Date(),
        isModified: false,
      } as ModifiedDate,
      determineCategory: (snapshotCategory: any) => {
        return snapshotCategory;
      },
      // id: "sub123",
      // name: "Subscriber 1",
      // subscriberId: "sub123",
      subscriberType: SubscriberTypeEnum.FREE,
      // subscriberName: "User 1",
      // subscriberEmail: "user1@example.com",
      // subscriberPhone: "123-456-7890",
      // subscriberStatus: "active",
      // subscriberRole: "admin",
      // subscriberCreatedAt: new Date(),
      // subscriberUpdatedAt: new Date(),
      // subscriberLastSeenAt: new Date(),
      // subscriberLastActivityAt: new Date(),
      // subscriberLastLoginAt: new Date(),
      // subscriberLastLogoutAt: new Date(),
      // subscriberLastPasswordChangeAt: new Date(),
      // subscriberLastPasswordResetAt: new Date(),
      // subscriberLastPasswordResetToken: "random-token",
      // subscriberLastPasswordResetTokenExpiresAt: new Date(),
      // subscriberLastPasswordResetTokenCreatedAt: new Date(),
      // subscriberLastPasswordResetTokenCreatedBy: "user123",
    },
    config: null,
    metadata: {
      /* additional metadata */
    },
    isCompressed: true,
    isEncrypted: false,
    isSigned: true,
    expirationDate: new Date(),
    auditTrail: [
      {
        userId: "user123",
        timestamp: new Date(),
        action: "update",
        details: "Snapshot updated",
      },
    ],
    subscribers: [subscriber],
    value: 50,
    todoSnapshotId: "todo123",
    then: (callback: (newData: Snapshot<Data>) => void) => {
      /* implementation */
    },
  },
];

export { createSnapshotOptions, snapshots };
export type { CoreSnapshot };

