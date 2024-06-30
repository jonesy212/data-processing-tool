// LocalStorageSnapshotStore.tsx

import { endpoints } from "@/app/api/ApiEndpoints";
import { getSubscriberId } from "@/app/api/subscriberApi";
import { CategoryProperties } from "@/app/pages/personas/ScenarioBuilder";
import { FC } from "react";
import { ModifiedDate } from "../documents/DocType";
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
  SnapshotStoreConfig,
  snapshotConfig,
} from "./SnapshotConfig";
import SnapshotStore, { defaultCategory, initialState } from "./SnapshotStore";
import { subscribeToSnapshots } from "./snapshotHandlers";

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
  };
}

interface UpdateSnapshotPayload<T> {
  snapshotId: string;
  newData: Data;
}

interface CustomSnapshotData extends Data {
  timestamp: string | Date | undefined;
  value: number | undefined;
}

const SNAPSHOT_URL = endpoints.snapshots;

type Snapshots<T> = Array<Snapshot<Data> | Snapshot<CustomSnapshotData>>;

const SNAPSHOT_STORE_CONFIG = snapshotConfig;

interface CoreSnapshot<T extends BaseData> {
  id?: string | number;
  data?: T | null | undefined;
  name?: string;
  timestamp?: string | Date;
  createdBy?: string;
  subscriberId?: string;
  length?: number;
  category?: string | CategoryProperties | undefined;
  date?: string | Date;
  status?: string;
  content?: T | string | Content | undefined;
  message?: string;
  type?: string;
  phases?: ProjectPhaseTypeEnum;
  phase?: Phase | null;
  ownerId?: string;
  store?: SnapshotStore<T>;
  state?: Snapshot<T> | null | undefined; // Ensure state matches Snapshot<T> or null/undefined
  dataStore?: DataStore<T>;
  initialState: SnapshotStore<BaseData> | Snapshot<BaseData> | null ;
  setSnapshotData?: (data: Data) => void;
  snapshotConfig?: SnapshotStoreConfig<BaseData, BaseData>[];
  subscribeToSnapshots?: (
    snapshotId: string,
    callback: (snapshot: Snapshot<Data>) => void
  ) => void;
}

interface SnapshotData<T extends BaseData> {
  _id?: string;
  title?: string;
  description?: string | null;
  tags?: Tag[] | string[];
  key?: string;
  topic?: string;
  priority?: string | PriorityTypeEnum;
  subscription?: Subscription | null;
  config?: SnapshotStoreConfig<BaseData, any>[] | null;
  metadata?: any;
  isExpired?: boolean;
  isCompressed?: boolean;
  isEncrypted?: boolean;
  isSigned?: boolean;
  expirationDate?: Date | string;
  auditTrail?: AuditRecord[];
  subscribers?: Subscriber<CustomSnapshotData | Data>[];
  delegate?: SnapshotStoreConfig<BaseData, any>[];
  value?: number;
  todoSnapshotId?: string;
  dataStoreMethods?: DataStore<T> | null;
  then?: (callback: (newData: Snapshot<Data>) => void) => void | undefined;
}

interface Snapshot<T extends BaseData>
  extends CoreSnapshot<T>,
    SnapshotData<T> {
  // Additional specific properties
}

// Example implementation of LocalStorageSnapshotStore
const snapshotType = <T extends BaseData>(
  snapshot: Snapshot<T>
): Snapshot<T> => {
  const newSnapshot: Snapshot<T> = { ...snapshot }; // Shallow copy of the snapshot

  newSnapshot.id = snapshot.id || generateSnapshotId;
  newSnapshot.title = snapshot.title || "";
  newSnapshot.timestamp = snapshot.timestamp
    ? new Date(snapshot.timestamp)
    : new Date();
  newSnapshot.subscriberId = snapshot.subscriberId || "";
  newSnapshot.category =
    typeof snapshot.category === "string"
      ? defaultCategory
      : snapshot.category || defaultCategory;
  newSnapshot.length = snapshot.length || 0;
  newSnapshot.content = snapshot.content || "";
  newSnapshot.data = snapshot.data;
  newSnapshot.value = snapshot.value || 0;
  newSnapshot.key = snapshot.key || "";
  newSnapshot.subscription = snapshot.subscription || null;
  newSnapshot.config = snapshot.config || null;
  newSnapshot.status = snapshot.status || "";
  newSnapshot.metadata = snapshot.metadata || {};
  newSnapshot.delegate = snapshot.delegate || [];

  newSnapshot.store =
    (snapshot.store as SnapshotStore<T>) ||
    new SnapshotStore<T>(
      newSnapshot.data || null,
      (newSnapshot.category as CategoryProperties) || defaultCategory,
      newSnapshot.date ? new Date(newSnapshot.date) : new Date(),
      newSnapshot.type ? newSnapshot.type : "new snapshot",
      newSnapshot.initialState ? newSnapshot.initialState : null,
      newSnapshot.snapshotConfig ? newSnapshot.snapshotConfig : snapshotConfig,
      (snapshotId: string, callback: (snapshot: Snapshot<T>) => void) => {},
      newSnapshot.delegate,
      newSnapshot.dataStoreMethods || ({} as DataStore<T>)
    );

  newSnapshot.state = snapshot.state || null;
  newSnapshot.todoSnapshotId = snapshot.todoSnapshotId || "";
  newSnapshot.initialState = snapshot.initialState || null;

  return newSnapshot;
};

class LocalStorageSnapshotStore<T extends BaseData> extends SnapshotStore<T> {
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
    dataStoreMethods: DataStore<T> = {
      data: undefined,
      addData: (data: T) => {},
      updateData: (id: number, newData: T) => {},
      removeData: (id: number) => {},
      updateDataTitle: (id: number, title: string) => {},
      updateDataDescription: (id: number, description: string) => {},
      addDataStatus: (
        id: number,
        status: "pending" | "inProgress" | "completed"
      ) => {},
      // removeDataStatus: (id: number) => { },
      updateDataStatus: (
        id: number,
        status: "pending" | "inProgress" | "completed"
      ) => {},
      addDataSuccess: (payload: { data: T[] }) => {},
      getDataVersions: async (id: number) => {
        // Implement logic to fetch data versions from a data source
        return undefined;
      },
      updateDataVersions: (id: number, versions: T[]) => Promise.resolve(),
      getBackendVersion: () => Promise.resolve(undefined),
      getFrontendVersion: () => Promise.resolve(undefined),
      fetchData: (id: number) => Promise.resolve([]),
      getItem: (key: string): Promise<T | undefined> => {
        return new Promise((resolve, reject) => {
          const item = this.storage.getItem(key);
          if (item) {
            resolve(JSON.parse(item));
          } else {
            resolve(undefined);
          }
        });
      },

      setItem: (id: string, item: T): Promise<void> => {
        return new Promise((resolve, reject) => {
          this.storage.setItem(id, JSON.stringify(item));
          resolve();
        });
      },
      removeItem: async (key: string): Promise<void> => {
        await this.removeItem(key);
      },

      getAllKeys: async (): Promise<string[]> => {
        const keys: string[] = [];
        for (let i = 0; i < this.storage.length; i++) {
          const key = this.storage.key(i);
          if (key) {
            keys.push(key);
          }
        }
        return keys;
      },

      async getAllItems(): Promise<T[]> {
        return new Promise(async (resolve, reject) => {
          try {
            const keys = await this.getAllKeys();
            const items = await Promise.all(
              keys.map((key) => {
                return this.getItem(key).then((item) => {
                  if (item) {
                    const snapshot = new snapshotType(item.initialState);
                    snapshot.initialState = item.initialState;
                    return snapshot;
                  }
                  return undefined;
                });
              })
            );

            const filteredItems = items.filter(
              (item): item is Snapshot<T> => item !== undefined
            );
            resolve(filteredItems);
          } catch (error) {
            reject(error);
          }
        });
      },
    }
  ) {
    super(
      snapshot,
      category,
      new Date(),
      snapshotType.toString(),
      initialState,
      snapshotConfig,
      subscribeToSnapshots,
      [], // Default empty delegate, to be populated asynchronously
      dataStoreMethods
    );
    this.storage = storage;
  }

  setItem(key: string, value: T): void {
    this.storage.setItem(key, JSON.stringify(value));
  }

  getItem(key: string): Snapshot<T> | undefined {
    const item = this.storage.getItem(key);
    return item ? JSON.parse(item) : null;
  }

  removeItem(key: string): void {
    this.storage.removeItem(key);
  }

  getAllKeys(): Promise<string[]> {
    const keys: string[] = [];
    for (let i = 0; i < this.storage.length; i++) {
      const key = this.storage.key(i);
      if (key) {
        keys.push(key);
      }
    }
    return Promise.resolve(keys);
  }

  getAllItems(): Snapshot<T>[] {
    const items: Snapshot<T>[] = [];
    for (let i = 0; i < this.storage.length; i++) {
      const key = this.storage.key(i);
      if (key) {
        const value = this.storage.getItem(key);
        if (value) {
          items.push(JSON.parse(value));
        }
      }
    }
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
  then: function (onFulfill: (newData: Snapshot<Data>) => void): void {
    const store = new LocalStorageSnapshotStore<Data>(window.localStorage);
    setTimeout(() => {
      onFulfill({
        data: this as Data,
        store: store,
      });
    }, 1000);
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
const subscriber = new Subscriber(
  "_id",
  "John Doe",
  subscription,
  subscriberId,
  notifyEventSystem,
  updateProjectState,
  logActivity,
  triggerIncentives,
  undefined,
  () => {}
);
subscriber.id = "new-id"; // Set the private property using the setter method

const snapshots: Snapshots<Data> = [
  {
    id: "1",
    data: {
      /* your data */
    },
    name: "Snapshot 1",
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
    store: undefined,
    state: null,
    initialState: null,
    setSnapshotData: (data: Data) => {
      /* set data */
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
