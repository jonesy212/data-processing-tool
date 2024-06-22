// LocalStorageSnapshotStore.tsx

import { endpoints } from "@/app/api/ApiEndpoints";
import { CategoryProperties } from "@/app/pages/personas/ScenarioBuilder";
import { Content } from "../models/content/AddContent";
import { Data } from "../models/data/Data";
import { PriorityTypeEnum, ProjectPhaseTypeEnum } from "../models/data/StatusType";
import { Task } from "../models/tasks/Task";
import { Tag } from "../models/tracker/Tag";
import { Phase } from "../phases/Phase";
import { AllStatus } from "../state/stores/DetailsListStore";
import { Subscription } from "../subscriptions/Subscription";
import { NotificationTypeEnum } from "../support/NotificationContext";
import { Subscriber } from "../users/Subscriber";
import { AuditRecord, SnapshotStoreConfig, snapshotConfig } from "./SnapshotConfig";
import SnapshotStore, { defaultCategory, initialState } from "./SnapshotStore";
import { snapshot } from "./snapshot";
import { delegate, subscribeToSnapshots } from "./snapshotHandlers";
import { generateSnapshotId } from "../utils/snapshotUtils";


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
  interface UpdateSnapshotPayload<Data> {
    snapshotId: string;
    newData: Data;
  }
  
  interface CustomSnapshotData extends Data {
    timestamp: string | Date | undefined;
    value: number;
  }
  
  const SNAPSHOT_URL = endpoints.snapshots;

  type Snapshots = Snapshot<Data>[] | Snapshot<CustomSnapshotData>[];
  
  interface Snapshot<T extends Data | undefined> {
    _id?: string;
    id?: string | number;
    data?: T | null |undefined;
    name?: string;
    timestamp?: string | Date;
    title?: string;
    
    createdBy?: string;
    description?: string | null;
    tags?: Tag[] | string[];
    subscriberId?: string;
    length?: number;
    category?: string;
    topic?: string;
    priority?: string;
    key?: string;
    subscription?: Subscription | null;
    config?: SnapshotStoreConfig<Snapshot<any>, any>[] | null
    status?: string;
    metadata?: any;
    content?: T | string | Content | undefined;
    message?: string;
    type?: string;
    phases?: ProjectPhaseTypeEnum;
    phase?: Phase | null;
    isCompressed?: boolean;
    isEncrypted?: boolean;
    isSigned?: boolean;
    expirationDate?: Date | string;
    ownerId?: string;
    auditTrail?: AuditRecord[];
    subscribers?: Subscriber<CustomSnapshotData | Data>[];
    delegate?:  SnapshotStoreConfig<Snapshot<T>, T>[]
    value?: number;
    store?: SnapshotStore<T>;
    state?: Snapshot<T> | null;
    todoSnapshotId?: string;
    initialState?: Snapshot<Data> | null;
    // Implement the `then` function using the reusable function
    then?: (callback: (newData: Snapshot<Data>) => void) => void | undefined;
    setSnapshotData?: (data: Data) => void;

  }
// Example implementation of LocalStorageSnapshotStore
const snapshotType = (snapshot: Snapshot<Data>) => {
  const newSnapshot = snapshot;
  newSnapshot.id = snapshot.id || generateSnapshotId;
  newSnapshot.title = snapshot.title || "";
  newSnapshot.timestamp = snapshot.timestamp || new Date();
  newSnapshot.subscriberId = snapshot.subscriberId || "";
  newSnapshot.category = snapshot.category || defaultCategory;
  newSnapshot.length = snapshot.length || 0;
  newSnapshot.content = snapshot.content || "";
  newSnapshot.data = snapshot.data || undefined;
  newSnapshot.value = snapshot.value || 0;
  newSnapshot.key = snapshot.key || "";
  newSnapshot.subscription = snapshot.subscription || null;
  newSnapshot.config = snapshot.config || null;
  newSnapshot.status = snapshot.status || "";
  newSnapshot.metadata = snapshot.metadata || {};
  newSnapshot.delegate = snapshot.delegate || [];
  newSnapshot.store = snapshot.store || new SnapshotStore<Data>(
    newSnapshot.data,
    newSnapshot.category,
    newSnapshot.date,
    newSnapshot.type,
    newSnapshot.initialState,
    newSnapshot.snapshotConfig,
    newSnapshot.subscribeToSnapshots,
    newSnapshot.delegate
  );
  newSnapshot.state = snapshot.state || null;
  newSnapshot.todoSnapshotId = snapshot.todoSnapshotId || "";
  newSnapshot.initialState = snapshot.initialState || null;
  return newSnapshot;
}
class LocalStorageSnapshotStore<T extends Data | undefined> extends SnapshotStore<T> {
    
  private storage: Storage;
  constructor(storage: Storage, category: CategoryProperties = {
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
    brandMessage: ""
  }) {
    super(
      snapshot,
      category,
      new Date(),
      snapshotType,
      initialState,
      snapshotConfig,
      subscribeToSnapshots,
      delegate
      );
      this.storage = storage;
    }
  
    setItem(key: string, value: T): void {
      this.storage.setItem(key, JSON.stringify(value));
    }
  
    getItem(key: string): T | null {
      const item = this.storage.getItem(key);
      return item ? JSON.parse(item) : null;
    }
  
    removeItem(key: string): void {
      this.storage.removeItem(key);
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
    data: [],
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



  export type { CustomSnapshotData, Payload, Snapshot, Snapshots, UpdateSnapshotPayload };
