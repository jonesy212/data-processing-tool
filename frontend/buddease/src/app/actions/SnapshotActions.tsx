// SnapshotActions.tsx
// snapshots/SnapshotActions.ts
import { BaseDataEntity, BaseDataRoot, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { Attachment } from '@/app/documents/attachment/Attachment';
import { NotificationType, NotificationTypeEnum } from '@/app/features/support/UnifiedNotificationTypes';
import UniqueIDGenerator from "@/app/generators/GenerateUniqueIds";
import { SnapshotManager } from "@/app/hooks/useSnapshotManager";
import { CreateSnapshotsPayload, Payload } from '@/app/interfaces/payload/payloadTypes';
import { Category } from "@/app/libraries/categories/generateCategoryProperties";
import { BaseData, Data } from '@/app/models/data/Data';
import { NotificationPosition, PriorityTypeEnum, StatusType } from "@/app/models/data/StatusType";
import { CriteriaType } from "@/app/pages/searches/CriteriaType";
import { DataStoreMethods } from "@/app/projects/DataAnalysisPhase/DataProcessing/DataStoreMethods";
import { Snapshots, SnapshotsObject } from '@/app/snapshots/LocalStorageSnapshotStore';
import { Snapshot } from '@/app/snapshots/Snapshot';
import SnapshotStore from '@/app/snapshots/SnapshotStore';
import { SnapshotStoreConfig } from '@/app/snapshots/SnapshotStoreConfig';
import { createLatestVersion } from "@/app/versions/createLatestVersion";

import { SnapshotData } from "@/app/snapshots/SnapshotData";
import { SnapshotItem } from "@/app/snapshots/SnapshotList";
import CalendarManagerStoreClass from "@/app/state/stores/CalendarManagerStore";
import { Subscriber } from "@/app/subscribers/Subscriber";
import { SubscriberCollection } from '@/app/subscribers/SubscriberCollection';
import { Callback } from "@/app/subscribers/subscribeToSnapshotsImplementation";
import { AppEntity } from "@/app/typings/entities/AppEntity";
import { TaskAttachment, TaskEntity, TaskExcludedFields, TaskIncludedFields, TaskK, TaskMeta, TaskSnapshotsArray, TaskSnapshotStore, TaskSnapshotWithCriteria } from '@/app/typings/entities/TaskEntity';
import { RealtimeDataItem } from "@/app/typings/realtimeTypes";
import { SnapshotEvent } from '@/app/typings/snapshotTypes';
import { ActionCreatorWithPayload, createAction } from '@reduxjs/toolkit';
import { useDispatch } from 'react-redux';
import { FetchSnapshotPayload } from "@/app/snapshots/FetchSnapshotPayload";
import { ConfigureSnapshotStorePayload, SnapshotConfig } from "@/app/snapshots/SnapshotConfig";

const dispatch = useDispatch()

interface CallbackAction {
  request?: () => void;
  success?: () => void;
  failure?: (error: Error) => void;
}

type CallbackActionsMap<T> = {
  [key: string]: CallbackAction;
};



export enum SnapshotOperationType {
  ArchiveSnapshot = 'archiveSnapshot',
  CreateSnapshot = 'createSnapshot',
  UpdateSnapshot = 'updateSnapshot',
  DeleteSnapshot =  'deleteSnapshot',
  FindSnapshot = 'findSnapshot',
  MapSnapshot = 'mapSnapshot',
  publish = 'publishSnapshot',
  Map = 'map',
  ReadSnapshot = 'readSnapshot',
  SortSnapshot = 'sortSnapshot',
  Sort = 'sort',
  CategorizeSnapshot = 'categorizeSnapshot',
  Categorize = 'categorize',
  SearchSnapshot = 'searchSnapshot',
  Search = 'search',
  CalendarSnapshot = 'calendarEvent',
  NewSnapshotResult = 'newSnapshotResult',
  TaskSnapshotReference = 'taskSnapshotReference',
  CategorizeSnapshots = 'categorizeSnapshot',
  HandleSnapshot = 'handleSnapshot',
  FilterSnapshot = 'filterSnapshot',
  TeamManagerSnapshot = 'teamManagerSnapshot',
  ValidateSnapshot = 'validateSnapshot',
  RestoreSnapshot = 'restoreSnapshot',
}


type SnapshotOperation<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> = {
  // The type of operation being performed
  operationType: SnapshotOperationType;

  // The query function to filter or retrieve snapshots based on criteria
  query?: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, criteria: any) => Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>;  

  // Actions to perform before or after the operation
  action?: {
    preDelete?: (id: string, config: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined) => Promise<void>;  
    postDelete?: (id: string) => Promise<void>;
    preUpdate?: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => Promise<void>;  
    postUpdate?: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => Promise<void>;  
    preCreate?: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => Promise<void>;  
    postCreate?: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => Promise<void>;  
  };

  // Additional properties as needed
  criteria?: CriteriaType
  description?: string; // Optional description of the operation
};

// Define generic action types
interface SnapshotActionsTypes<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T 
> {
  setSnapshots: ActionCreatorWithPayload<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>;  

  addSnapshot: ActionCreatorWithPayload<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>;  
  removeSnapshot: ActionCreatorWithPayload<string>;
  updateSnapshot: ActionCreatorWithPayload<{ snapshotId: string; newData: any }>;
  fetchSnapshotData: ActionCreatorWithPayload<string>;
  handleSnapshotSuccess: ActionCreatorWithPayload<{ snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>; snapshotId: string }>;  
  handleSnapshotFailure: ActionCreatorWithPayload<string>;
  handleTaskSnapshotSuccess: ActionCreatorWithPayload<{
    message: string,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null, 
    snapshotId: string
  }, string>;

  // Add the `updateSnapshots` action to handle batch updates
  updateSnapshots: ActionCreatorWithPayload<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>, 
}


// // Define action types with generics
export type SnapshotStoreActionsTypes<
  T extends BaseDataEntity = AppEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> = {
  addSnapshotToStore: ActionCreatorWithPayload<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>; 
  removeSnapshotFromStore: ActionCreatorWithPayload<string>;
  updateSnapshotInStore: ActionCreatorWithPayload<{ snapshotId: string; newData: Partial<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> }>; 
  fetchSnapshotStoreData: ActionCreatorWithPayload<string>;
  handleSnapshotStoreSuccess: ActionCreatorWithPayload<{
    snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>; 
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>; 
    snapshotId: string;
    operation: SnapshotOperation<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>; 
    operationType: SnapshotOperationType;
  }>;
  handleSnapshotStoreFailure: ActionCreatorWithPayload<string>;
};


interface TaskWithSubtasksSnapshotActionsTypes<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T 
>  {
  addTaskWithSubtasksSnapshot: ActionCreatorWithPayload<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>;  
  removeTaskWithSubtasksSnapshot: ActionCreatorWithPayload<string>;
  updateTaskWithSubtasksSnapshot: ActionCreatorWithPayload<{ snapshotId: string; newData: any }>;
  fetchTaskWithSubtasksSnapshotData: ActionCreatorWithPayload<string>;
  handleTaskWithSubtasksSnapshotSuccess: ActionCreatorWithPayload<{
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;  
    snapshotId: string;
  }>;
  handleTaskWithSubtasksSnapshotFailure: ActionCreatorWithPayload<string>;
}

// Create action creators with generics
export const SnapshotActions = <
  T extends BaseDataEntity = BaseDataRoot,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(): SnapshotActionsTypes<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> => ({
 // Add the setSnapshots action
  setSnapshots: createAction<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>('setSnapshots'),
  addSnapshot: createAction<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>('addSnapshot'),
  removeSnapshot: createAction<string>('removeSnapshot'),
  updateSnapshot: createAction<{ snapshotId: string; newData: any }>('updateSnapshot'),
  fetchSnapshotData: createAction<string>('fetchSnapshotData'),
  handleSnapshotSuccess: createAction<{ snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>; snapshotId: string }>('handleSnapshotSuccess'),
  handleSnapshotFailure: createAction<string>('handleSnapshotFailure'),
  handleTaskSnapshotSuccess: createAction<{ message: string; snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null; snapshotId: string; }, string>('handleTaskSnapshotSuccess'),

  // Add the `updateSnapshots` action to handle batch updates
  updateSnapshots: createAction<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>('updateSnapshots'),
});



const SnapshotStoreActions = <
  T extends BaseDataEntity = BaseDataRoot,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(): SnapshotStoreActionsTypes<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> => ({
  addSnapshotToStore: createAction<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>('snapshotStore/addSnapshotToStore'),
  removeSnapshotFromStore: createAction<string>('snapshotStore/removeSnapshotFromStore'),
  updateSnapshotInStore: createAction<{ 
    snapshotId: string; 
    newData: Partial<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> 
  }>('snapshotStore/updateSnapshotInStore'),
  fetchSnapshotStoreData: createAction<string>('snapshotStore/fetchSnapshotStoreData'),
  handleSnapshotStoreSuccess: createAction<{
    snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
    snapshotId: string;
    operation: SnapshotOperation<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
    operationType: SnapshotOperationType;
  }>('snapshotStore/handleSnapshotStoreSuccess'),
  handleSnapshotStoreFailure: createAction<string>('snapshotStore/handleSnapshotStoreFailure'),
});


// Actions for managing task snapshots with subtasks
export const TaskWithSubtasksSnapshotActions = <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(): TaskWithSubtasksSnapshotActionsTypes<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> => ({
  addTaskWithSubtasksSnapshot: createAction<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>('addTaskWithSubtasksSnapshot'),
  removeTaskWithSubtasksSnapshot: createAction<string>("removeTaskWithSubtasksSnapshot"),
  updateTaskWithSubtasksSnapshot: createAction<{ snapshotId: string, newData: any }>("updateTaskWithSubtasksSnapshot"),
  fetchTaskWithSubtasksSnapshotData: createAction<string>("fetchTaskWithSubtasksSnapshotData"),
  handleTaskWithSubtasksSnapshotSuccess: createAction<{
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
    snapshotId: string;
  }>("handleTaskWithSubtasksSnapshotSuccess"),
  handleTaskWithSubtasksSnapshotFailure: createAction<string>("handleTaskWithSubtasksSnapshotFailure"),
})


const { latestVersion = createLatestVersion(), ...rest } = (data as Record<string, any>) || {};

const newTaskSnapshot: Snapshot<TaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields> = {
  id: '1',
  data: {
    id: '1',
    title: 'Task 1',
    description: 'Description of Task 1',
    assignedTo: null,
    assigned: false,
    previouslyAssignedTo: [],
    done: false,
    source: "system",
    assigneeId: '1',
    dueDate: new Date(),
    priority: PriorityTypeEnum.Low,
    startDate: undefined,
    endDate: new Date(),
    isActive: true,
    relatedTags: {},
    createdAt: new Date(),
    updatedAt: new Date(),
    timestamp: Date.now(),
    latestVersion: latestVersion
  },
  createdAt: new Date(),
  updatedAt: new Date(),
  timestamp: Date.now(),
  events: {
    eventRecords: {},
    callbacks: (snapshot: TaskSnapshotsArray) => {},
    subscribers: [],
    eventIds: [],
  },
  mappedSnapshot: new Map<string, Snapshot<TaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields>>(),
  meta: {
    baseConfig, sharedMetadata, sharedBaseData, taggable,
  } as TaskMeta,
  
  getSnapshotId: (key: string | SnapshotData<TaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields>) => {
    if (typeof key === 'string') {
      return UniqueIDGenerator.generateID(
        "snapshotGeneration",
        "snapshot",
      NotificationTypeEnum.SNAPSHOT_GENERATED,
        "SnapshotCreation" as NotificationType
      );
    } else {
      return key._id;
    }
  },

  compareSnapshotState: (
    snapshot1: Snapshot<
      TaskEntity,
      TaskK,
      TaskMeta,
      TaskAttachment,
      TaskExcludedFields,
      TaskIncludedFields
    > | null,
    snapshot2: Snapshot<
      TaskEntity,
      TaskK,
      TaskMeta,
      TaskAttachment,
      TaskExcludedFields,
      TaskIncludedFields
    >
  ): boolean => {
    if (!snapshot1) return false;

    return (
      JSON.stringify(snapshot1.data) ===
      JSON.stringify(snapshot2.data)
    );
  },

  unsubscribe: function(callback: Callback<Snapshot<TaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields>>) {
    if (!this.subscribers || Object.keys(this.subscribers).length === 0) return;
    const filtered = Object.entries(this.subscribers).filter(([_, sub]) => sub.getCallback() !== callback);
    this.subscribers = Object.fromEntries(filtered) as unknown as TaskSubscriber[];
  },
  addSnapshotFailure: function (
    snapshotManager: SnapshotManager<TaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields>,
    snapshot: Snapshot<TaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields>,
    payload: { error: Error }
  ): void {
    throw new Error('Function not implemented.');
  },

  configureSnapshotStore: function (
    snapshotStore: TaskSnapshotStore,
    snapshotId: string,
    data: Map<string, Snapshot<TaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields>>,
    events: Record<string, CalendarManagerStoreClass<TaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields>[]>,
    dataItems: RealtimeDataItem<TaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields>[],
    newData: Snapshot<TaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields>,
    payload: ConfigureSnapshotStorePayload<Data>,
    store: SnapshotStore<any, any>,
    callback: (snapshotStore: TaskSnapshotStore) => void
  ): void | null {
    throw new Error('Function not implemented.');
  },

  updateSnapshotSuccess: function (
    snapshotId: string,
    snapshotManager: SnapshotManager<TaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields>,
    snapshot: Snapshot<TaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields>,
    payload: { error: Error }
  ): void | null {
    throw new Error('Function not implemented.');
  },

  createSnapshotFailure: function (
    date: Date,
    snapshotId: string,
    snapshotManager: SnapshotManager<TaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields>,
    snapshot: Snapshot<TaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields>,
    payload: { error: Error }
  ): Promise<void> {
    throw new Error('Function not implemented.');
  },

  handleSnapshot: function (
    id: string,
    snapshotId: string,
    snapshot: TaskEntity | null,
    snapshotData: TaskEntity,
    snapshots: TaskSnapshotsArray,
    type: string,
    event: SnapshotEvent<TaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields>,
    category?: Category,
    snapshotContainer?: TaskEntity,
    snapshotStoreConfig?: SnapshotStoreConfig<TaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields>
  ): Promise<Snapshot<TaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields> | null> {
    throw new Error('Function not implemented.');
  },

  getParentId: function (): string | null {
    throw new Error('Function not implemented.');
  },

  getChildIds: function (
    id: string, 
    childSnapshot:Snapshot<TaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields>
  ): void {
    throw new Error('Function not implemented.');
  },

  addChild: function (): void {
    throw new Error('Function not implemented.');
  },

  removeChild: function (): void {
    throw new Error('Function not implemented.');
  },

  getChildren: function (
    id: string, 
    childSnapshot:Snapshot<TaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields>
  ): Snapshot<TaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields> {
    throw new Error('Function not implemented.');
  },

  hasChildren: function (): boolean {
    throw new Error('Function not implemented.');
  },

  isDescendantOf: function (): boolean {
    throw new Error('Function not implemented.');
  },

  getStore: function (
    storeId: number,
    snapshotStore: TaskSnapshotStore,
    snapshotId: string,
    snapshot: Snapshot<TaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields>,
    type: string,
    event: Event
  ): TaskSnapshotStore | null {
    throw new Error('Function not implemented.');
  },
  getStores(): Map<number, TaskSnapshotStore>[] {
    // Example implementation
    return [new Map<number, TaskSnapshotStore>()];
  },

  addStore: function (
    storeId: number,
    snapshotId: string,
    snapshotStore: TaskSnapshotStore,
    snapshot: Snapshot<TaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields>,
    type: string,
    event: Event
  ): void {
    try {
      if (typeof storeId !== 'number' || storeId <= 0) throw new Error('Invalid storeId');
      if (!snapshotStore || typeof snapshotStore.addStore !== 'function') throw new Error('Invalid snapshotStore');
      if (!snapshotId || snapshotId.trim() === '') throw new Error('Invalid snapshotId');
      if (!snapshot || typeof snapshot !== 'object') throw new Error('Invalid snapshot');
      if (!type || type.trim() === '') throw new Error('Invalid type');
      if (!event || typeof event !== 'object') throw new Error('Invalid event');

      console.log('Adding store:', { storeId, snapshotId, snapshot, type, event });
      snapshotStore.addStore(storeId, snapshotId, snapshotStore, snapshot, type, event);
      console.log('Store added successfully:', { storeId, snapshotId });
    } catch (error: any) {
      console.error('Failed to add store:', error.message);
    }
  },

  mapSnapshot: function (
    storeId: number,
    snapshotId: string | number,
    snapshotStore: TaskSnapshotStore,
    snapshot: Snapshot<TaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields>,
    type: string,
    event: Event
  ): Promise<string | undefined> | null {
    const store = this.getStore(storeId, snapshotStore, snapshotId, snapshot, type, event);
    if (store) {
      const snap = store.getSnapshotId(snapshotId);
      return snap ?? null;
    }
    return null;
  },

  removeStore: function (): void {
    throw new Error('Function not implemented.');
  },

  snapshotStoreConfig: null,

  getSnapshotItems: function (): (SnapshotStoreConfig<TaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields> | SnapshotItem<TaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields>)[] {
    throw new Error('Function not implemented.');
  },

  defaultSubscribeToSnapshots: function (
    snapshotId: string,
    callback: (snapshots: Snapshots<TaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields>) => Subscriber<TaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields> | null,
    snapshot?: Snapshot<TaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields> | null
  ): void {
    throw new Error('Function not implemented.');
  },

  transformSubscriber: function (
    subscriberId: string,
    sub: Subscriber<TaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields>
  ): Subscriber<TaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields> {
    throw new Error('Function not implemented.');
  },

  transformDelegate: function (delegate: any): Promise<SnapshotStoreConfig<TaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields>[]> {
    throw new Error('Function not implemented.');
  },

  initializedState: undefined,

  getAllKeys: function (): Promise<string[]> | undefined {
    throw new Error('Function not implemented.');
  },

  getAllItems: function (): Promise<Snapshot<TaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields>[]> | undefined {
    throw new Error('Function not implemented.');
  },

  addDataStatus: function (id: number, status: StatusType | undefined): void {
    throw new Error('Function not implemented.');
  },

  removeData: function (id: number): void {
    throw new Error('Function not implemented.');
  },

  updateData: function (id: number, newData: Snapshot<TaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields>): void {
    throw new Error('Function not implemented.');
  },

  updateDataTitle: function (id: number, title: string): void {
    throw new Error('Function not implemented.');
  },

  updateDataDescription: function (id: number, description: string): void {
    throw new Error('Function not implemented.');
  },

  updateDataStatus: function (id: number, status: StatusType | undefined): void {
    throw new Error('Function not implemented.');
  },

  addDataSuccess: function (payload: { data: Snapshot<TaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields>[] }): void {
    throw new Error('Function not implemented.');
  },

  getDataVersions: function (id: number): Promise<Snapshot<TaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields>[] | undefined> {
    throw new Error('Function not implemented.');
  },

  updateDataVersions: function (id: number, versions: Snapshot<TaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields>[]): void {
    throw new Error('Function not implemented.');
  },

  getBackendVersion: function (): Promise<string | undefined> {
    throw new Error('Function not implemented.');
  },

  getFrontendVersion: function (): Promise<string | number | undefined> {
    throw new Error('Function not implemented.');
  },

  fetchData: function (id: number): Promise<TaskSnapshotStore[]> {
    throw new Error('Function not implemented.');
  },

  defaultSubscribeToSnapshot: function (
    snapshotId: string,
    callback: Callback<Snapshot<TaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields>>,
    snapshot: Snapshot<TaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields>
  ): string {
    throw new Error('Function not implemented.');
  },

  handleSubscribeToSnapshot: function (
    snapshotId: string,
    callback: Callback<Snapshot<TaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields>>,
    snapshot: Snapshot<TaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields>
  ): void {
    throw new Error('Function not implemented.');
  },

  removeItem: function (key: string | number): Promise<void> {
    throw new Error('Function not implemented.');
  },

  getSnapshot: function (
    snapshot: (id: string) => Promise<{
      category: Category;
      timestamp: any;
      id: any;
      snapshot: Snapshot<TaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields>;
      snapshotStore: TaskSnapshotStore;
      data: Data;
    }> | undefined
  ): Promise<Snapshot<TaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields>> {
    throw new Error('Function not implemented.');
  },
  getSnapshotSuccess: function (snapshot: Snapshot<TaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields>): Promise<TaskSnapshotStore> {
    throw new Error('Function not implemented.');
  },

  setItem: function (key: string, value: Data): Promise<void> {
    throw new Error('Function not implemented.');
  },

  getDataStore: (): Map<string, Data> => {
    throw new Error('Function not implemented.');
  },

  addSnapshotSuccess: function (snapshot: Data, subscribers: Subscriber<TaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields>[]): void {
    throw new Error('Function not implemented.');
  },

  deepCompare: function (objA: any, objB: any): boolean {
    throw new Error('Function not implemented.');
  },

  shallowCompare: function (objA: any, objB: any): boolean {
    throw new Error('Function not implemented.');
  },

  getDataStoreMethods: function (): DataStoreMethods<TaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields> {
    throw new Error('Function not implemented.');
  },

  getDelegate: function (snapshotStoreConfig: SnapshotStoreConfig<TaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields>[]): SnapshotStoreConfig<TaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields>[] {
    throw new Error('Function not implemented.');
  },

  determineCategory: function (snapshot: Snapshot<TaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields> | null | undefined): string {
    throw new Error('Function not implemented.');
  },

  determinePrefix: function (snapshot: Data | null | undefined, category: string): string {
    throw new Error('Function not implemented.');
  },

  removeSnapshot: function (snapshotToRemove: TaskSnapshotStore): void {
    throw new Error('Function not implemented.');
  },

  addSnapshotItem: function (item: Snapshot<TaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields> | SnapshotStoreConfig<TaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields>): void {
    throw new Error('Function not implemented.');
  },

  addNestedStore: function (store: TaskSnapshotStore): void {
    throw new Error('Function not implemented.');
  },

  clearSnapshots: function (): void {
    throw new Error('Function not implemented.');
  },

  addSnapshot: function (
    snapshot: Snapshot<TaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields>,
    snapshotId: string,
    subscribers: SubscriberCollection<TaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields>
  ): Promise<Snapshot<TaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields> | undefined> {
    throw new Error('Function not implemented.');
  },

  createSnapshot: undefined,

  createInitSnapshot: function (
    id: string, 
    snapshotData: SnapshotData<TaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields>, 
    category: string
  ): Snapshot<TaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields> {
    throw new Error('Function not implemented.');
  },

  setSnapshotSuccess: function (snapshotData: SnapshotData<TaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields>, subscribers: ((data: Subscriber<TaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields>) => void)[]): void {
    throw new Error('Function not implemented.');
  },

  setSnapshotFailure: function (error: Error): void {
    throw new Error('Function not implemented.');
  },

  updateSnapshots: function (): void {
    throw new Error('Function not implemented.');
  },

  updateSnapshotsSuccess: function (snapshotData: (subscribers: Subscriber<TaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields>[], snapshot: Snapshots<TaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields>) => void): void {
    throw new Error('Function not implemented.');
  },

  updateSnapshotsFailure: function (error: Payload): void {
    throw new Error('Function not implemented.');
  },

  initSnapshot: function (snapshotConfig: SnapshotStoreConfig<TaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields>, snapshotData: SnapshotData<TaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields>): void {
    throw new Error('Function not implemented.');
  },

  takeSnapshot: function (snapshot: Snapshot<TaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields>, subscribers: Subscriber<TaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields>[]): Promise<{ snapshot: Snapshot<TaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields> }> {
    throw new Error('Function not implemented.');
  },

  takeSnapshotSuccess: function (snapshot: Snapshot<TaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields>): void {
    throw new Error('Function not implemented.');
  },

  takeSnapshotsSuccess: function (snapshots: Data[]): void {
    throw new Error('Function not implemented.');
  },

  flatMap: function <U extends Iterable<any>>(
    callback: (value: SnapshotStoreConfig<TaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields>, index: number, array: SnapshotStoreConfig<TaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields>[]) => U
  ): U extends (infer I)[] ? I[] : U[] {
    throw new Error('Function not implemented.');
  },

  getState: function () {
    throw new Error('Function not implemented.');
  },

  setState: function (state: any): void {
    throw new Error('Function not implemented.');
  },

  validateSnapshot: function (snapshot: Snapshot<TaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields>): boolean {
    throw new Error('Function not implemented.');
  },

  handleActions: function (action: (selectedText: string) => void): void {
    throw new Error('Function not implemented.');
  },

  setSnapshot: function (snapshot: Snapshot<TaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields>): void {
    throw new Error('Function not implemented.');
  },


transformSnapshotConfig: function <U extends BaseDataEntity>(
  config: SnapshotStoreConfig<BaseData, U>
): SnapshotStoreConfig<BaseData, U> {
  if (!config) throw new Error('transformSnapshotConfig expects a config object');
  // Example normalization / safe defaults:
  // (these are non-destructive — adjust to your real rules)
  (config as any).criteria = (config as any).criteria ?? {};
  (config as any).createdAt = (config as any).createdAt ?? new Date();
  return config;
},


  // Snapshot collections
  setSnapshots: function (snapshots: SnapshotsSnapshot<TaskEntity, TaskEntityExtended, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields>): void {
    throw new Error("Function not implemented.");
  },
  clearSnapshot: function (
    predicate: (
      snapshot: Snapshot<TaskEntity, TaskEntityExtended, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields>
  ) => boolean): Snapshot<TaskEntity, TaskEntityExtended, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields> {
    throw new Error("Function not implemented.");
  },
  mergeSnapshots: function (
    snapshots: Snapshots<TaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields>,
    category: string
  ): void {
    throw new Error("Function not implemented.");
  },

  // Reducers / utilities
  reduceSnapshots: function <U>(
    callback: (acc: U, snapshot: Snapshot<TaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields>) => U,
    initialValue: U
  ): U | undefined {
    throw new Error("Function not implemented.");
  },
  sortSnapshots: function (): void {
    throw new Error("Function not implemented.");
  },
  filterSnapshots: function (): void {
    throw new Error("Function not implemented.");
  },
  findSnapshot: function (): void {
    throw new Error("Function not implemented.");
  },

  // Subscribers & notifications
  getSubscribers: async function (
    subscribers: Subscriber<TaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields>[],
    snapshots: Snapshots<TaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields>
  ): Promise<{
    subscribers: Subscriber<TaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields>[];
    snapshots: Snapshots<TaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields>;
  }> {
    throw new Error("Function not implemented.");
  },
  notify: function (
    id: string,
    message: string,
    content: any,
    date: Date,
    type: NotificationType,
    notificationPosition?: NotificationPosition
  ): void {
    throw new Error("Function not implemented.");
  },
  notifySubscribers: function (
    subscribers: Subscriber<TaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields>[],
    data: Partial<SnapshotStoreConfig<TaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields>>
  ): SubscriberCollection<TaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields> {
    throw new Error("Function not implemented.");
  },

  // Queries
  getSnapshots: function (
    category: string, 
    data: Snapshots<TaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields>
  ): void {
    throw new Error("Function not implemented.");
  },
  getAllSnapshots: async function (
    fetcher: (
      subscribers: Subscriber<TaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields>[],
      snapshots: Snapshots<TaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields>
    ) => Promise<Snapshots<TaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields>>
  ): Promise<void> {
    throw new Error("Function not implemented.");
  },

  // Utility helpers
  generateId: function (): string {
    return `task_${Date.now()}`;
  },



batchFetchSnapshots: function (
  subscribers: Subscriber<TaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields>[],
  snapshots: Snapshots<TaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields>
): void {
  if (!Array.isArray(subscribers) || !snapshots) return;

  subscribers.forEach((s) => {
    try {
      // try common subscriber shapes: callback, getCallback, or function itself
      if (typeof (s as any).callback === 'function') {
        (s as any).callback(snapshots);
      } else if (typeof (s as any).getCallback === 'function') {
        const cb = (s as any).getCallback();
        if (typeof cb === 'function') cb(snapshots);
      } else if (typeof s === 'function') {
        (s as unknown as Function)(snapshots);
      }
    } catch (err) {
      console.error('Error invoking subscriber during batchFetchSnapshots', err);
    }
  });
},

batchTakeSnapshotsRequest: function (snapshotData: any): void {
  try {
    const items = Array.isArray(snapshotData) ? snapshotData : [snapshotData];
    // Simple default: attempt to call a "takeSnapshot" method if present,
    // otherwise just log for later processing.
    items.forEach((item) => {
      if (item && typeof item.takeSnapshot === 'function') {
        try { item.takeSnapshot(); } catch (e) { console.warn('takeSnapshot failed', e); }
      } else {
        // queue/log — placeholder for your queueing logic
        console.debug('batchTakeSnapshotsRequest queued item', item);
      }
    });
  } catch (err) {
    console.error('batchTakeSnapshotsRequest error', err);
  }
},

batchUpdateSnapshotsRequest: function (
  snapshotDataFn: (
    subscribers: Subscriber<TaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields>[]
  ) => Promise<{ subscribers: Subscriber<TaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields>[]; snapshots: Snapshots<TaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields>; }>
): void {
  // Gather current subscribers (best-effort). If you store subscribers differently,
  // adjust this line to pull the correct array.
  const currentSubscribers: Subscriber<TaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields>[] = (this as any).subscribers
    ? Object.values((this as any).subscribers as Record<string, Subscriber<TaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields>>)
    : [];

  snapshotDataFn(currentSubscribers)
    .then(({ subscribers, snapshots }) => {
      // Notify returned subscribers of the new snapshots
      (subscribers || []).forEach((s) => {
        try {
          if (typeof (s as any).callback === 'function') {
            (s as any).callback(snapshots);
          } else if (typeof (s as any).getCallback === 'function') {
            const cb = (s as any).getCallback();
            if (typeof cb === 'function') cb(snapshots);
          } else if (typeof s === 'function') {
            (s as unknown as Function)(snapshots);
          }
        } catch (e) {
          console.error('Error invoking subscriber in batchUpdateSnapshotsRequest', e);
        }
      });
    })
    .catch((err) => {
      console.error('batchUpdateSnapshotsRequest failed', err);
    });
  },
  filterSnapshotsByStatus: undefined,
  filterSnapshotsByCategory: undefined,
  filterSnapshotsByTag: undefined,
    batchFetchSnapshotsSuccess: function (
      subscribers: Subscriber<TaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields>[],
      snapshots: Snapshots<TaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields>
    ): void {
    // Notify all subscribers with the snapshots
    subscribers.forEach((subscriber) => {
      try {
        if (typeof (subscriber as any).callback === "function") {
          (subscriber as any).callback(snapshots);
        }
      } catch (err) {
        console.error("Error notifying subscriber in batchFetchSnapshotsSuccess", err);
      }
    });
    console.log("Batch fetch succeeded with snapshots:", snapshots);
  },

  batchFetchSnapshotsFailure: function (payload: { error: Error }): void {
    console.error("Batch fetch snapshots failed:", payload.error);
    // Optionally: trigger a notification system here
  },

  batchUpdateSnapshotsSuccess: function (
    subscribers: Subscriber<TaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields>[],
    snapshots: Snapshots<TaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields>
  ): void {
    // Same pattern as fetch success
    subscribers.forEach((subscriber) => {
      try {
        if (typeof (subscriber as any).callback === "function") {
          (subscriber as any).callback(snapshots);
        }
      } catch (err) {
        console.error("Error notifying subscriber in batchUpdateSnapshotsSuccess", err);
      }
    });
    console.log("Batch update succeeded with snapshots:", snapshots);
  },

  batchUpdateSnapshotsFailure: function (payload: { error: Error }): void {
    console.error("Batch update snapshots failed:", payload.error);
  },

  batchTakeSnapshot: function (
    snapshotStore: TaskSnapshotStore,
    snapshots: Snapshots<TaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields>
  ): Promise<{
    snapshots: Snapshots<TaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields>;
  }> {
    try {
      // Example: push to the snapshot store
      if (typeof (snapshotStore as any).addSnapshot === "function") {
        (snapshotStore as any).addSnapshot(snapshots);
      }
      console.log("Batch take snapshot completed");
    } catch (err) {
      console.error("Batch take snapshot failed:", err);
    }
    return { snapshots };
  },

  handleSnapshotSuccess: function (
    snapshot: Snapshot<TaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields> | null,
    snapshotId: string
  ): void {
    if (!snapshot) {
      console.warn(`No snapshot found for ID ${snapshotId}`);
      return;
    }
    console.log("Successfully handled snapshot:", { snapshotId, snapshot });
  },

  getInitialState: function ():
    | Snapshot<TaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields>
    | null {
    // Return a placeholder snapshot or null
    return null;
  },

  getTimestamp: function (): Date | undefined {
    return new Date(); // default: return "now"
  },

  getData: function ():
    | Data
    | Map<string, Snapshot<TaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields>>
    | null
    | undefined {
    // Default: return null until a datastore is wired
    return null;
  },

  setData: function (data: Map<string, Snapshot<TaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields>>): void {
    // Example: attach the map to this object for later use
    (this as any)._dataStore = data;
    console.log("Data set successfully:", data);
  },

  addData: function (): void {
    // Default no-op (extend with logic for adding new snapshot data)
    console.log("addData called (not yet implemented)");
  },

  mapSnapshots: function (
    storeIds: number[],
    snapshotId: string,
    timestamp: string | number | Date | undefined,
    type: string,
    event: SnapshotEvent<TaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields>,
    id: number,
    snapshotStore: TaskSnapshotStore,
    data: TaskK,
    callback: (
      storeIds: number[],
      snapshotId: string,
      category?: Category,
      timestamp: string | number | Date | undefined,
      type: string,
      event: SnapshotEvent<TaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields>,
      id: number,
      snapshotStore: TaskSnapshotStore,
      data: TaskK
    ) => SnapshotsObject<TaskK>,
    category?: Category
  ): SnapshotsObject<TaskK> | null {
    throw new Error("Function not implemented.");
  },

  fetchSnapshot: function (
    callback: (
      snapshotId: string,
      payload: FetchSnapshotPayload<any>,
      snapshotStore: TaskSnapshotStore,
      payloadData: TaskEntity,
      data: Data,
      delegate: TaskSnapshotWithCriteria[],
      category?: Category,
    ) => Snapshot<TaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields>
  ): Snapshot<TaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields> {
    throw new Error("Function not implemented.");
  },

  createSnapshotSuccess: function (
    snapshotId: string,
    snapshotManager: SnapshotManager<TaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields>,
    snapshot: Snapshot<TaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields>,
    payload: { error: Error }
  ): void | null {
    throw new Error("Function not implemented.");
  },

  createSnapshots: function (
    id: string,
    snapshotId: string,
    snapshot: Snapshot<TaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields>,
    snapshotManager: SnapshotManager<TaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields>,
    payload: CreateSnapshotsPayload<TaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields>,
    callback: (snapshots: Snapshot<TaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields>[]) => void | null,
    snapshotDataConfig?: SnapshotConfig<TaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields>[] | undefined,
    category?: string | symbol | Category
  ): Snapshot<TaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields>[] | null {
    throw new Error("Function not implemented.");
  },

  onSnapshot: function (
    snapshotId: string,
    snapshot: Snapshot<TaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields>,
    type: string,
    event: SnapshotEvent<TaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields>,
    callback: (snapshot: Snapshot<TaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields>) => void
  ): void {
    throw new Error("Function not implemented.");
  },

  onSnapshots: function (
    snapshotId: string,
    snapshots: Snapshots<TaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields>,
    type: string,
    event: SnapshotEvent<TaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields>,
    callback: (snapshots: Snapshots<TaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields>) => void
  ): void {
    throw new Error("Function not implemented.");
  },
  label: undefined
}


// const subscriber = new Subscriber(
//   '1',
//   'Subscriber Name',
//   {} as Subscription<TaskEntity, SubtaskData>,
//   'subscriberId',
//   (data: Snapshot<TaskEntity, SubtaskData>) => { console.log('Event System:', data); },
//   (data: Snapshot<TaskEntity, SubtaskData>) => { console.log('Update Project State:', data); },
//   (data: Snapshot<TaskEntity, SubtaskData>) => { console.log('Log Activity:', data); },
//   (data: Snapshot<TaskEntity, SubtaskData>) => { console.log('Trigger Incentives:', data); },
//   null, // or provide an appropriate CustomSnapshotData if available
//   null  // or provide appropriate TaskEntity if available
// );

// const newTaskWithSubtasksSnapshot: Snapshot<TaskEntity, SubtaskData> = {
//   id: '2',
//   data: {
//     id: '2',
//     title: 'Task 2',
//     description: 'Description of Task 2',
//     createdAt: new Date(),
//     updatedAt: new Date(),
//     timestamp: new Date().getTime(),
//   },
//   snapshotStore: {
//     // _id: 'snapshotStoreId',
//     id: '2',
//     key: 'key2',
//     topic: 'subtask',
//     date: new Date(),
//     title: 'snapshot store',
//     category: 'subtask category',
//     message: 'snapshot store',
//     timestamp: new Date().getTime(),
//     createdBy: 'user1',
//     eventRecords: {},
//     type: 'snapshot',
//     subscribers: [
//       // Subscriber as an array entry
//       new Subscriber<TaskEntity, SubtaskData>(
//         subscriber?.getUniqueId ?? '',
//         '',
//         {
//           unsubscribe: unsubscribe,
//           portfolioUpdates: portfolioUpdates,
//           tradeExecutions: getTradeExecutions,
//           marketUpdates: getMarketUpdates,
//           triggerIncentives: triggerIncentives,
//           communityEngagement: getCommunityEngagement,
//           portfolioUpdatesLastUpdated: portfolioUpdatesLastUpdated,
//           determineCategory: determineFileCategory
//         } as Subscription<TaskEntity, SubtaskData>,
//         '',
//         (data: Snapshot<TaskEntity, SubtaskData>) => { throw new Error('Function not implemented.'); },
//         (data: Snapshot<TaskEntity, SubtaskData>) => { throw new Error('Function not implemented.'); },
//         (data: Snapshot<TaskEntity, SubtaskData>) => { throw new Error('Function not implemented.'); },
//         (data: Snapshot<TaskEntity, SubtaskData>) => { throw new Error('Function not implemented.'); },
//         null,
//         undefined
//       )
//     ],
//   },

//     store: null,    stores: null,

//     data: new Map<string, Snapshot<TaskEntity, SubtaskData>>([
//         [
//           'subtask1',
//         {
//         id: 'subtask1',
//         data: {
//           id: 'subtask1',
//           parentId: '2',
//           title: 'Subtask 1',
//           isCompleted: false,
//           createdAt: new Date(),
//           updatedAt: new Date(),
//           description: 'Subtask 1 description',
//           timestamp: Date.now(),
//         },
//         createdAt: new Date(),
//         updatedAt: new Date(),
//         events: {
//           eventRecords: {},
//           callbacks: [],
//           subscribers: [],
//           eventIds: [],
//         },
//         meta: new Map(),
//         getSnapshotId: (key) => 'subtask1',
//         compareSnapshotState: (other, state) => false,
//         snapshotStore: null,
//         getParentId: () => '2',
//         getChildIds: () => ['subtask1'],
//         addChild: () => {},
//         removeChild: () => {},
//         getChildren: () => ['subtask1'],
//         hasChildren: () => false,
//         isDescendantOf: () => false,
//           eventRecords: {
//         },
//         dataItems: [],
//         newData: undefined,
//         stores: [],
//         getStore: (snapshotId, snapshot, type, event) => null,
//         addStore: (snapshotStore, snapshotId, snapshot, type, event) => {},
//         mapSnapshot: (snapshotId, snapshot, type, event) => {},
//         removeStore: () => {},
//         subscribe: (callback) => {},
//         unsubscribe: (callback) => {},
//         handleSnapshot: (snapshotId, snapshot, snapshots, type, event) => {},
//         fetchSnapshotFailure: (snapshotManager, snapshot, payload) => {},
//         addSnapshotFailure: (snapshotManager, snapshot, payload) => {},
//         configureSnapshotStore: (snapshotStore, snapshotId, data, events, dataItems, newData, payload, store, callback) => {},
//         fetchSnapshotSuccess: (snapshotManager, snapshot) => {},
//         updateSnapshotFailure: (snapshotManager, snapshot, payload) => {},
//         updateSnapshotSuccess: (snapshotId, snapshotManager, snapshot, payload) => {},
//         createSnapshotFailure: async (snapshotId, snapshotManager, snapshot, payload) => {},
//         updateSnapshot: (snapshotId, data, events, snapshotStore, dataItems, newData, payload, store) => {},
//         updateSnapshotItem: (snapshotItem) => {},
//         timestamp: Date.now(),
//         snapshotStoreConfig: null,
//         getSnapshotItems: [],
//         defaultSubscribeToSnapshots: "",
//         transformSubscriber: "",
//         transformDelegate: "",
//         initializedState: "",
//         getAllKeys: "",
//         getAllItems: "",
//         addDataStatus: "",
//         removeData: "",
//         updateData: "",
//         updateDataTitle: "",
//         updateDataDescription: "",
//         updateDataStatus: "",
//         addDataSuccess: "",
//         getDataVersions: "",
//         updateDataVersions: "",
//         getBackendVersion: "",
//         getFrontendVersion: "",
//         fetchData: "",
//         defaultSubscribeToSnapshot: "",
//         handleSubscribeToSnapshot: "",
//         removeItem: "",
//         getSnapshot: "",
//         getSnapshotSuccess: "",
//         setItem: "",
//         getDataStore: "",
//         addSnapshotSuccess: "",
//         deepCompare: "",
//         shallowCompare: "",
//         getDataStoreMethods: "",
//         getDelegate: "",
//         determineCategory: "",
//         determinePrefix: "",
//         removeSnapshot: "",
//         addSnapshotItem: "",
//         addNestedStore: "",
//         clearSnapshots: "",
//         addSnapshot: "",
//         createSnapshot: "",
//         createInitSnapshot: "",
//         setSnapshotSuccess: "",
//         setSnapshotFailure: "",
//         updateSnapshots: "",
//         updateSnapshotsSuccess: "",
//         updateSnapshotsFailure: "",
//         initSnapshot: "",
//         takeSnapshot: "",
//         takeSnapshotSuccess: "",
//         takeSnapshotsSuccess: "",
//         flatMap: "",
//         getState: "",
//         setState: "",
//         validateSnapshot: "",
//         handleActions: "",
//         setSnapshot: "",
//         transformSnapshotConfig: "",
//         setSnapshots: "",
//         clearSnapshot: "",
//         mergeSnapshots: "",
//         reduceSnapshots: "",
//         sortSnapshots: "",
//         filterSnapshots: "",
//         findSnapshot: "",
//         getSubscribers: "",
//         notify: "",
//         notifySubscribers: "",
//         getSnapshots: "",
//         getAllSnapshots: "",
//         generateId: "",
//         batchFetchSnapshots: "",
//         batchTakeSnapshotsRequest: "",
//         batchUpdateSnapshotsRequest: "",
//         filterSnapshotsByStatus: "",
//         filterSnapshotsByCategory: "",
//         filterSnapshotsByTag: "",
//         batchFetchSnapshotsSuccess: "",
//         batchFetchSnapshotsFailure: "",
//         batchUpdateSnapshotsSuccess: "",
//         batchUpdateSnapshotsFailure: "",
//         batchTakeSnapshot: "",
//         handleSnapshotSuccess: "",
//         getInitialState: "",
//         getConfigOption: "",
//         getTimestamp: "",
//         getStores: "",
//         getData: "",
//         setData: "",
//         addData: "",
//         mapSnapshots: "",
//         fetchSnapshot: "",
//         createSnapshotSuccess: "",
//         createSnapshots: "",
//         onSnapshot: "",
//         onSnapshots: "",
//           label: "",
//           versionInfo, 
//           getItem, 
//           getDataStoreMap,
//           payload: "",
//           subscribeToSnapshots: []
//           subscribers: [],
//           }
//         ]
//     ]),
//   eventRecords: {},
//   store: null,
//   snapshots: {
//     'subtask1': {
//       id: 'subtask1',
//       data: {
//         id: 'subtask1',
//         parentId: '2',
//         title: 'Subtask 1',
//         isCompleted: false,
//         createdAt: new Date(),
//         updatedAt: new Date(),
//         description: 'Subtask 1 description',
//         timestamp: Date.now()
//       },
//       createdAt: new Date(),
//       updatedAt: new Date(),
//       events: {
//         eventRecords: {},
//         callbacks: [],
//         subscribers: [],
//         eventIds: []
//       },
//       meta: new Map(),
//       getSnapshotId: (key) => 'subtask1',
//       compareSnapshotState: (other, state) => false,
//       snapshotStore: null,
//       getParentId: () => '2',
//       getChildIds: () => ['subtask1'],
//       addChild: () => {},
//       removeChild: () => {},
//       getChildren: () => ['subtask1'],
//       hasChildren: () => false,
//       isDescendantOf: () => false,
//       eventRecords: {},
//       dataItems: [],
//       newData: undefined,
//       stores: [],
//       getStore: (snapshotId, snapshot, type, event) => null,
//       addStore: (snapshotStore, snapshotId, snapshot, type, event) => {},
//       mapSnapshot: (snapshotId, snapshot, type, event) => {},
//       removeStore: () => {},
//       subscribe: (callback) => {},
//       unsubscribe: (callback) => {},
//       fetchSnapshotFailure: (snapshotManager, snapshot, payload) => {},
//       addSnapshotFailure: (snapshotManager, snapshot, payload) => {},
//       configureSnapshotStore: (snapshotStore, snapshotId, data, events, dataItems, newData, payload, store, callback) => {},
//       fetchSnapshotSuccess: (snapshotManager, snapshot) => {},
//       updateSnapshotFailure: (snapshotManager, snapshot, payload) => {},
//       updateSnapshotSuccess: (snapshotId, snapshotManager, snapshot, payload) => {},
//       createSnapshotFailure: async (
//         snapshotId,
//         snapshotManager,
//         snapshot,
//         payload) => { },
//       updateSnapshot: (snapshotId, data, events, snapshotStore, dataItems, newData, payload, store) => {},
//       updateSnapshotItem: (snapshotItem) => {},
//       timestamp: new Date().getTime()
//     },
//     'subtask2': {
//       id: 'subtask2',
//       data: {
//         id: 'subtask2',
//         parentId: '2',
//         title: 'Subtask 2',
//         isCompleted: true,
//         createdAt: new Date(),
//         updatedAt: new Date(),
//         description: 'Subtask 2 description',
//         timestamp: Date.now()
//       },
//       createdAt: new Date(),
//       updatedAt: new Date(),
//       events: {
//         eventRecords: {},
//         callbacks: [],
//         subscribers: [],
//         eventIds: []
//       },
//       meta: new Map(),
//       getSnapshotId: (key) => 'subtask2',
//       compareSnapshotState: (other, state) => false,
//       snapshotStore: null,
//       getParentId: () => '2',
//       getChildIds: () => ['subtask2'],
//       addChild: () => {},
//       removeChild: () => {},
//       getChildren: () => ['subtask2'],
//       hasChildren: () => false,
//       isDescendantOf: () => false,
//       eventRecords: {},
//       dataItems: [],
//       newData: undefined,
//       stores: [],
//       getStore: (snapshotId, snapshot, type, event) => null,
//       addStore: (snapshotStore, snapshotId, snapshot, type, event) => {},
//       mapSnapshot: (snapshotId, snapshot, type, event) => {},
//       removeStore: () => {},
//       subscribe: (callback) => {},
//       unsubscribe: (callback) => {},
//       fetchSnapshotFailure: (snapshotManager, snapshot, payload) => {},
//       addSnapshotFailure: (snapshotManager, snapshot, payload) => {},
//       configureSnapshotStore: (snapshotStore, snapshotId, data, events, dataItems, newData, payload, store, callback) => {},
//       fetchSnapshotSuccess: (snapshotManager, snapshot) => {},
//       updateSnapshotFailure: (snapshotManager, snapshot, payload) => {},
//       updateSnapshotSuccess: (snapshotId, snapshotManager, snapshot, payload) => {},
//       createSnapshotFailure: async (snapshotId, snapshotManager, snapshot, payload) => {},
//       updateSnapshot: (
//         snapshotId: "",
//         data: "",
//         events: "",
//         snapshotStore: "",
//         dataItems: "",
//         newData: "",
//         payload: "",
//         store: ""
//       ) => { },
//       updateSnapshotItem: (snapshotItem: "") => {},
//       timestamp: new Date().getTime()
//     }
//   },
//   getSnapshotId: (key) => '2',
//   compareSnapshotState: (other, state) => false,
//   getParentId: () => '0',
//   getChildIds: () => ['subtask1', 'subtask2'],
//   addChild: () => {},
//   removeChild: () => {},
//   getChildren: () => ['subtask1', 'subtask2'],
//   hasChildren: () => true,
//   isDescendantOf: () => false,
//   // eventRecords: {},
//   dataItems: [],
//   newData: null,
//   stores: [],
//   getStore: (snapshotId, snapshot, type, event) => null,
//   addStore: (snapshotStore, snapshotId, snapshot, type, event) => {},
//   mapSnapshot: (snapshotId, snapshot, type, event) => {},
//   removeStore: () => {},
//   subscribe: (callback) => {},
//   unsubscribe: (callback) => {},
//   fetchSnapshotFailure: (snapshotManager, snapshot, payload) => {},
//   addSnapshotFailure: (snapshotManager, snapshot, payload) => {},
//   configureSnapshotStore: (snapshotStore, snapshotId, data, events, dataItems, newData, payload, store, callback) => {},
//   fetchSnapshotSuccess: (snapshotManager, snapshot) => {
//     return snapshot
//     // const { id, data, createdAt, updatedAt, events, meta } = snapshot;
//     // const { id: dataId, parentId, title, isCompleted, createdAt: dataCreatedAt, updatedAt: dataUpdatedAt, description, timestamp } = data;
//     // const { eventRecords, callbacks, subscribers, eventIds } = events;
//     // const { timestamp: metaTimestamp } = meta;
//     // const { id: metaId, parentId: metaParentId, title: metaTitle, isCompleted: metaIsCompleted

//   },
//   updateSnapshotFailure: (snapshotManager, snapshot, payload) => {},
//   updateSnapshotSuccess: (snapshotId, snapshotManager, snapshot, payload) => {},
//   createSnapshotFailure: async (snapshotId, snapshotManager, snapshot, payload) => {},
//   updateSnapshot: (snapshotId, data, events, snapshotStore, dataItems, newData, payload, store) => {},
//   updateSnapshotItem: (snapshotItem) => {},
//   timestamp: new Date().getTime()
// };



// dispatch(SnapshotActions().addTaskSnapshot(newTaskSnapshot));
// dispatch(TaskWithSubtasksSnapshotActions().addTaskWithSubtasksSnapshot(newTaskWithSubtasksSnapshot));
export type { SnapshotOperation, SnapshotStoreActions };


