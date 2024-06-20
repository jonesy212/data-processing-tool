// LocalStorageSnapshotStore.tsx

import { Tag } from "../models/tracker/Tag";
import { Content } from "../models/content/AddContent";
import { Subscriber } from "../users/Subscriber";
import { Data } from "../models/data/Data";
import { PriorityTypeEnum, ProjectPhaseTypeEnum } from "../models/data/StatusType";
import { Task } from "../models/tasks/Task";
import { Phase } from "../phases/Phase";
import { AllStatus } from "../state/stores/DetailsListStore";
import { NotificationTypeEnum } from "../support/NotificationContext";
import { AuditRecord } from "./SnapshotConfig";
import SnapshotStore from "./SnapshotStore";
import { endpoints } from "@/app/api/ApiEndpoints";


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
    timestamp: Date | string | undefined;
    value: number;
  }
  
  const SNAPSHOT_URL = endpoints.snapshots;

  type Snapshots = Snapshot<Data>[] | Snapshot<CustomSnapshotData>[];
  
  interface Snapshot<T extends Data | undefined> {
    _id?: string;
    id?: string | number;
    data?: T | undefined;
    name?: string;
    timestamp?: Date | string;
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
    value?: number;
    store?: SnapshotStore<T>;
    state?: Snapshot<T> | null;
    todoSnapshotId?: string;
    initialState?: Snapshot<Data> ;
    // Implement the `then` function using the reusable function
    then?: (callback: (newData: Snapshot<Data>) => void) => void;
    setSnapshotData?: (data: Data) => void;
    
  }
// Example implementation of LocalStorageSnapshotStore
class LocalStorageSnapshotStore<T extends Data | undefined> implements SnapshotStore<T> {
    private storage: Storage;
  
    constructor(storage: Storage) {
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
    then: function (onFulfill: (newData: Snapshot<Data>) => void): unknown {
      const store = new LocalStorageSnapshotStore<Data>(window.localStorage);
      setTimeout(() => {
        onFulfill({
          data: this as Data,
          store: store,
        });
      }, 1000);
      return this;
    },
  };



  export type {UpdateSnapshotPayload, Payload, CustomSnapshotData, Snapshot, Snapshots}