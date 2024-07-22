// LocalStorageSnapshotStore.tsx

import { endpoints } from "@/app/api/ApiEndpoints";
import { getSubscriberId } from "@/app/api/subscriberApi";
import { CategoryProperties } from "@/app/pages/personas/ScenarioBuilder";
import { FC } from "react";
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
import { Task, TaskData } from "../models/tasks/Task";
import { Tag } from "../models/tracker/Tag";
import { Phase } from "../phases/Phase";
import { DataStore } from "../projects/DataAnalysisPhase/DataProcessing/DataStore";
import { AllStatus } from "../state/stores/DetailsListStore";
import { Subscription } from "../subscriptions/Subscription";
import { NotificationTypeEnum } from "../support/NotificationContext";
import { Subscriber } from "../users/Subscriber";
import {
  logActivity,
  notifyEventSystem,
  triggerIncentives,
  updateProjectState,
} from "../utils/applicationUtils";
import { generateSnapshotId } from "../utils/snapshotUtils";
import {
  AuditRecord,
  K,
  SnapshotStoreConfig,
  T,
  snapshotConfig,
} from "./SnapshotConfig";
import SnapshotStore, { defaultCategory, defaultDelegate, defaultSubscribeToSnapshots, defaultSubscribeToSnapshot } from "./SnapshotStore";
import { snapshot } from "./snapshot";
import { Callback } from "./subscribeToSnapshotsImplementation";

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


interface CustomSnapshotData extends Data {
  timestamp?: string | Date | undefined;
  value?: string | undefined;
}

const SNAPSHOT_URL = endpoints.snapshots;


type Snapshots<T extends BaseData> = Array<SnapshotStore<T, any>>; 

const SNAPSHOT_STORE_CONFIG = snapshotConfig;

  interface CoreSnapshot<T extends BaseData, K extends BaseData> {
  id?: string | number;
  data?: Map<string, T> | null | undefined
  name?: string;
  timestamp?: string | Date;
  createdBy?: string;
  subscriberId?: string;
  length?: number;
  category?: string | CategoryProperties | undefined;
  date?: string | Date;
  status?: string;
  content?:  string | Content | undefined;
  message?: string;
  type?: string;
  phases?: ProjectPhaseTypeEnum;
  phase?: Phase | null;
  ownerId?: string;
  store?: SnapshotStore<T, K>;
  state?: Snapshot<T> | null; // Ensure state matches Snapshot<T> or null/undefined
  dataStore?: DataStore<T, K>;
  initialState?:
  | SnapshotStore<T, K>
  | Snapshot<T, K>
  | null
  | undefined;
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
  subscribers?: Subscriber<T, K>[];
  delegate?: SnapshotStoreConfig<T, K>[];
  value?: number | string | undefined;
  todoSnapshotId?: string;
  dataStoreMethods?: DataStore<T, K> | null;
  createdAt?: Date;
  updatedAt?: Date;
  then?: (callback: (newData: Snapshot<Data>) => void) => void | undefined;
}

interface Snapshot<T extends BaseData, K extends BaseData = T>
  extends CoreSnapshot<T, K>,
  SnapshotData<T> {
  // Additional specific properties
}



function createOptions<T extends BaseData, K extends BaseData>(
  params: {
    initialState: SnapshotStore<T, K> | null;
    date: string | Date;
    snapshotId: string;
    category: CategoryProperties;
    dataStoreMethods: Partial<DataStore<T, K>>;
    type?: string; // Optional, adjust as needed
    snapshotConfig?: any; // Optional, adjust as needed
    subscribeToSnapshots?: (snapshotId: string, callback: (snapshots: Snapshots<T>) => void) => void;
    subscribeToSnapshot?: (snapshotId: string, callback: Callback<Snapshot<T, K>>, snapshot: Snapshot<T, K>) => void;
    delegate?: SnapshotStoreConfig<T, K>[]; // Adjust if needed
  }
): SnapshotStoreOptions<T, K> {
  // Default implementations for dataStoreMethods
  const defaultDataStoreMethods: DataStore<T, K> = {
    data: new Map<string, T>(),
    addData: (data: T) => { /* Default implementation */ },
    removeData: (id: number) => { /* Default implementation */ },
    updateData: (id: number, data: T) => { /* Default implementation */ },
    addDataStatus: (id: number, status: "pending" | "inProgress" | "completed") => { /* Default implementation */ },
    updateDataTitle: (id: number, title: string) => { /* Default implementation */ },
    updateDataDescription: (id: number, description: string) => { /* Default implementation */ },
    updateDataStatus: (id: number, status: "pending" | "inProgress" | "completed") => { /* Default implementation */ },
    getItem: async (key: string) => undefined,
    setItem: async (id: string, item: T) => { /* Default implementation */ },
    removeItem: async (key: string) => { /* Default implementation */ },
    getAllKeys: async () => [],
    getAllItems: async () => [],
    getDataVersions: async (id: number): Promise<T[] | undefined> => {
      return undefined;
    },
    updateDataVersions: async (id: number, versions: T[]) => { /* Default implementation */ },
    getBackendVersion: async (): Promise<string> => "0.0.0",
    getFrontendVersion: async (): Promise<string> => "0.0.0",
    addDataSuccess: async (payload: { data: T[] }) => { /* Default implementation */ },
    fetchData: async (): Promise<SnapshotStore<T, K>[]> => [],
    // Ensure all required methods are provided
    ...params.dataStoreMethods // Override defaults with provided implementations
  };

  const subscribeToSnapshots = params.subscribeToSnapshots || ((snapshotId: string, callback: (snapshots: Snapshot<T, K>[]) => void) => {
    // Default implementation
    const dummySnapshots: Snapshot<T, K>[] = [];
    callback(dummySnapshots);
  });

  const subscribeToSnapshot = params.subscribeToSnapshot || ((
    snapshotId: string,
    callback: (snapshot: Snapshot<T, K>) => void
  ) => {
    subscribeToSnapshots(snapshotId, (snapshots) => {
      if (Array.isArray(snapshots)) {
        snapshots.forEach(snapshot => {
          // Ensure `snapshot` is of type `Snapshot<T, K>`
          callback(snapshot as Snapshot<T, K>);
        });
      } else {
        // Handle the case where `snapshots` is a single `Snapshot<T, K>`
        callback(snapshots as Snapshot<T, K>);
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
      brandMessage: ""
    },
    dataStoreMethods: defaultDataStoreMethods,
    type: params.type || "default-type", // Provide a default value if necessary
    snapshotConfig: params.snapshotConfig || {}, // Provide a default value if necessary
    subscribeToSnapshots: params.subscribeToSnapshots || defaultSubscribeToSnapshots, // Provide a default implementation if necessary
    subscribeToSnapshot: params.subscribeToSnapshot || defaultSubscribeToSnapshot, // Provide a default implementation if necessary
    delegate: params.delegate || [], // Provide a default value if necessary
  };
}


function createSnapshotOptions<T extends BaseData, K extends BaseData>(
  snapshot: Snapshot<T, K>
): SnapshotStoreOptions<T, K> {
  return {
    data: {} as Partial<SnapshotStore<T, K>>,
    initialState: snapshot.initialState || null,
    snapshotId: snapshot.id || "",
    category: {
      name: typeof snapshot.category === "string"
        ? snapshot.category : "default-category",
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
      brandMessage: ""
    },
    date: new Date(),
    type: "default-type",
    snapshotConfig: [], // Adjust as needed
    subscribeToSnapshots: (snapshotId, callback) => {
      // Implement subscribeToSnapshots function
    },
    subscribeToSnapshot: (snapshotId, callback, snapshot) => {
      // Implement subscribeToSnapshot function
    },
    delegate: [], // Adjust as needed
    dataStoreMethods: {} as DataStore<T, K> // Provide actual data store methods
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
    store: snapshot.store as SnapshotStore<T, K> || new SnapshotStore<T, K>(options),

    state: snapshot.state || null,
    todoSnapshotId: snapshot.todoSnapshotId || "",
    initialState: snapshot.initialState || null,
  };

  return result;
};

class LocalStorageSnapshotStore<T extends BaseData, K extends BaseData> extends SnapshotStore<T, T> {
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
    initialState: SnapshotStore<T, K> | Snapshot<T, K> | null = null,
  ) {

      // Construct a snapshot object with default values
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
  
    // Use createSnapshotOptions to create the options object
    const options = createSnapshotOptions(snapshot);


    super(options);
    this.storage = storage;
    
  }


  async getItem(key: string): Promise<T | undefined> {
    const item = this.storage.getItem(key);
    return item ? JSON.parse(item) as T : undefined;
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
    keys.forEach(key => {
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
  then: function (onFulfill: (newData: Snapshot<Data>) => void): Snapshot<Data> {
    const store = new LocalStorageSnapshotStore<Data, BaseData>(window.localStorage);
    setTimeout(() => {
      onFulfill({
        data: {} as Map<string, Data>,
        store: store,
        state: null
      });
    }, 1000);
    return {
      data: {} as Map<string, Data>,
      store: store,
      state: null
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
const subscription: Subscription = {
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
  {} as Partial<SnapshotStore<BaseData, CustomSnapshotData>>
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
        this.config = [{
          ...snapshotData,
          subscribers: subscribers as Subscriber<T, K>[] // Set the subscribers in the config
        } as SnapshotStoreConfig<T, K>];
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
      unsubscribe: () => {
        /* unsubscribe */
      },
      portfolioUpdates: () => {
        /* subscribe to portfolio updates */
      },
      tradeExecutions: () => {
        /* subscribe to trade executions */
      },
      marketUpdates: () => {
        /* subscribe to market updates */
      },
      triggerIncentives: () => {
        /* subscribe to trigger incentives */
      },
      communityEngagement: () => {
        /* subscribe to community engagement */
      },
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


export {snapshots, createSnapshotOptions}