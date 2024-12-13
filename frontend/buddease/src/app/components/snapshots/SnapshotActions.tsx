// snapshots/SnapshotActions.ts
import { SnapshotStoreConfig } from '@/app/components/snapshots/SnapshotStoreConfig';
import { StructuredMetadata } from "@/app/configs/StructuredMetadata";
import { CriteriaType } from "@/app/pages/searchs/CriteriaType";
import { ActionCreatorWithPayload, createAction } from '@reduxjs/toolkit';
import { useDispatch } from 'react-redux';
import { BaseData } from '../models/data/Data';
import { Snapshot } from './LocalStorageSnapshotStore';

const dispatch = useDispatch()

interface TaskData extends BaseData {
  title: string;
  description: string;
}

interface SubtaskData extends BaseData {
  parentId: string;
  title: string;
  isCompleted: boolean;
}


interface CallbackAction {
  request?: () => void;
  success?: () => void;
  failure?: (error: Error) => void;
}

type CallbackActionsMap<T> = {
  [key: string]: CallbackAction;
};



export enum SnapshotOperationType {
  CreateSnapshot = 'createSnapshot',
  UpdateSnapshot = 'updateSnapshot',
  DeleteSnapshot =  'deleteSnapshot',
  FindSnapshot = 'findSnapshot',
  MapSnapshot = 'mapSnapshot',
  Map = 'map',

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
  TeamManagerSnapshot = 'teamManagerSnapshot'
}


type SnapshotOperation<T extends BaseData<any>, K extends T = T> = {
  // The type of operation being performed
  operationType: SnapshotOperationType;

  // The query function to filter or retrieve snapshots based on criteria
  query?: (snapshot: Snapshot<T, K>, criteria: any) => Promise<Snapshot<T, K>[]>;

  // Actions to perform before or after the operation
  action?: {
    preDelete?: (id: string, config: SnapshotStoreConfig<T, K> | undefined) => Promise<void>;
    postDelete?: (id: string) => Promise<void>;
    preUpdate?: (snapshot: Snapshot<T, K>) => Promise<void>;
    postUpdate?: (snapshot: Snapshot<T, K>) => Promise<void>;
    preCreate?: (snapshot: Snapshot<T, K>) => Promise<void>;
    postCreate?: (snapshot: Snapshot<T, K>) => Promise<void>;
  };

  // Additional properties as needed
  criteria?: CriteriaType
  description?: string; // Optional description of the operation
 
}



// Define generic action types
interface SnapshotActionsTypes<T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>> {
  setSnapshots: ActionCreatorWithPayload<Snapshot<T, K>[]>;

  addSnapshot: ActionCreatorWithPayload<Snapshot<T, K>>;
  removeSnapshot: ActionCreatorWithPayload<string>;
  updateSnapshot: ActionCreatorWithPayload<{ snapshotId: string; newData: any }>;
  fetchSnapshotData: ActionCreatorWithPayload<string>;
  handleSnapshotSuccess: ActionCreatorWithPayload<{ snapshot: Snapshot<T, K>; snapshotId: string }>;
  handleSnapshotFailure: ActionCreatorWithPayload<string>;
  handleTaskSnapshotSuccess: ActionCreatorWithPayload<{message: string,
    snapshot: Snapshot<T, K> | null,
    snapshotId: string
  }, string>;

  // Add the `updateSnapshots` action to handle batch updates
  updateSnapshots: ActionCreatorWithPayload<Snapshot<T, K>[]>,
}


// // Define action types with generics
// interface SnapshotStoreActionsTypes<T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>> {
//   addSnapshotToStore: ActionCreatorWithPayload<Snapshot<T, K>>;
//   removeSnapshotFromStore: ActionCreatorWithPayload<string>; // Snapshot ID
//   updateSnapshotInStore: ActionCreatorWithPayload<{ snapshotId: string; newData: any }>;
//   fetchSnapshotStoreData: ActionCreatorWithPayload<string>; // Store ID
//   handleSnapshotStoreSuccess: ActionCreatorWithPayload<{
//     snapshotStore: SnapshotStore<T, K>;
//     snapshot: Snapshot<T, K>;
//     snapshotId: string;
//     operation: SnapshotOperation<T, K>,
//     operationType: SnapshotOperationType,
//   }>;
//   handleSnapshotStoreFailure: ActionCreatorWithPayload<string>;
// }


// interface TaskWithSubtasksSnapshotActionsTypes<T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>  {
//   addTaskWithSubtasksSnapshot: ActionCreatorWithPayload<Snapshot<TaskData, SubtaskData>>;
//   removeTaskWithSubtasksSnapshot: ActionCreatorWithPayload<string>;
//   updateTaskWithSubtasksSnapshot: ActionCreatorWithPayload<{ snapshotId: string; newData: any }>;
//   fetchTaskWithSubtasksSnapshotData: ActionCreatorWithPayload<string>;
//   handleTaskWithSubtasksSnapshotSuccess: ActionCreatorWithPayload<{
//     snapshot: Snapshot<TaskData, SubtaskData>;
//     snapshotId: string;
//   }>;
//   handleTaskWithSubtasksSnapshotFailure: ActionCreatorWithPayload<string>;
// }


// Create action creators with generics
export const SnapshotActions = <T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(): SnapshotActionsTypes<T, K> => ({
 // Add the setSnapshots action
  setSnapshots: createAction<Snapshot<T, K>[]>('setSnapshots'),
  addSnapshot: createAction<Snapshot<T, K>>('addSnapshot'),
  removeSnapshot: createAction<string>('removeSnapshot'),
  updateSnapshot: createAction<{ snapshotId: string; newData: any }>('updateSnapshot'),
  fetchSnapshotData: createAction<string>('fetchSnapshotData'),
  handleSnapshotSuccess: createAction<{ snapshot: Snapshot<T, K>; snapshotId: string }>('handleSnapshotSuccess'),
  handleSnapshotFailure: createAction<string>('handleSnapshotFailure'),
  handleTaskSnapshotSuccess: createAction<{ message: string; snapshot: Snapshot<T, K> | null; snapshotId: string; }, string>('handleTaskSnapshotSuccess'),

  // Add the `updateSnapshots` action to handle batch updates
  updateSnapshots: createAction<Snapshot<T, K>[]>('updateSnapshots'),
});



export const SnapshotStoreActions = <T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(): SnapshotStoreActionsTypes<T, K> => ({
  addSnapshotToStore: createAction<Snapshot<T, K>>('addSnapshotToStore'),
  removeSnapshotFromStore: createAction<string>('removeSnapshotFromStore'),
  updateSnapshotInStore: createAction<{ snapshotId: string; newData: any }>('updateSnapshotInStore'),
  fetchSnapshotStoreData: createAction<string>('fetchSnapshotStoreData'),
  handleSnapshotStoreSuccess: createAction<{
    snapshotStore: SnapshotStore<T, K>;
    snapshot: Snapshot<T, K>;
    snapshotId: string;
  }>('handleSnapshotStoreSuccess'),
  handleSnapshotStoreFailure: createAction<string>('handleSnapshotStoreFailure'),
});


// export type SnapshotStoreActionsTypes<T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>> = ReturnType<typeof SnapshotStoreActions<T, K>>;


// Actions for managing task snapshots with subtasks
export const TaskWithSubtasksSnapshotActions = <T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(): TaskWithSubtasksSnapshotActionsTypes<T, K> => ({
  addTaskWithSubtasksSnapshot: createAction<Snapshot<TaskData, SubtaskData>>('addTaskWithSubtasksSnapshot'),
  removeTaskWithSubtasksSnapshot: createAction<string>("removeTaskWithSubtasksSnapshot"),
  updateTaskWithSubtasksSnapshot: createAction<{ snapshotId: string, newData: any }>("updateTaskWithSubtasksSnapshot"),
  fetchTaskWithSubtasksSnapshotData: createAction<string>("fetchTaskWithSubtasksSnapshotData"),
  handleTaskWithSubtasksSnapshotSuccess: createAction<{
    snapshot: Snapshot<TaskData, SubtaskData>;
    snapshotId: string;
  }>("handleTaskWithSubtasksSnapshotSuccess"),
  handleTaskWithSubtasksSnapshotFailure: createAction<string>("handleTaskWithSubtasksSnapshotFailure"),
})






// const newTaskSnapshot: Snapshot<Task, any> = {
//   id: '1',
//   data: {
//     id: '1',
//     title: 'Task 1',
//     description: 'Description of Task 1',
//     assignedTo: null,
//     assigned: false,
//     previouslyAssignedTo: [],
//     done: false,
//     source: "system",
//     assigneeId: '1',
//     dueDate: new Date(),
//     priority: PriorityTypeEnum.Low,
//     startDate: undefined,
//     endDate: new Date(),
//     isActive: true,
//     relatedTags: {},
//     createdAt: new Date(),
//     updatedAt: new Date(),
//     timestamp: new Date().getTime(),
//   },
//   createdAt: new Date(),
//   updatedAt: new Date(),
//   eventRecords: null,
//   snapshotStore: null,
//   dataItems: null,
//   newData: null,
//   stores: null,
//   timestamp: undefined,
//   events: {
//     eventRecords: {},
//     callbacks: (snapshot: Snapshots<Task>): void => { },
//     subscribers: [],
//     eventIds: [],
    
//   },
//   meta: new Map<string, Snapshot<Task, K>>(),
//   getSnapshotId: <T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(
//     key: string | SnapshotData<T, K>
//   ): unknown => {
//     if (typeof key === 'string') {
//       // If key is a string, use it to generate a new snapshot ID
//       // Generate ID using UniqueIDGenerator
//       return UniqueIDGenerator.generateID(
//         "snapshotGeneration",
//         "snapshot",
//         NotificationTypeEnum.Event,
//         "SnapshotCreation" as NotificationType
//       );
//     } else {
//       // If key is SnapshotData<T, K>, extract and return the ID from the snapshot data
//       return key._id;
//     }
//   },
//   compareSnapshotState: function (arg0: Snapshot<Task, any> | null, state: any): unknown {
//     if (arg0 === null) {
//       console.warn('Provided snapshot is null.');
//       return null;
//     }

//     // Implement comparison logic here
//     const snapshotState = arg0.data; // or any other property that represents the state


//     // Example comparison logic (customize as needed)
//     if (JSON.stringify(snapshotState) === JSON.stringify(state)) {
//       return 'States are identical';
//     } else {
//       return 'States are different';
//     }
//   },

//   unsubscribe: function (callback: Callback<Snapshot<Task, any>>): void {
//     if (!this.subscribers || Object.keys(this.subscribers).length === 0) {
//       console.warn('No subscribers to unsubscribe.');
//       return;
//     }

//     const filteredSubscribers = Object.entries(this.subscribers).filter(([key, sub]) => sub.getCallback !== callback);

//     this.subscribers = {
//       ...Object.fromEntries(filteredSubscribers),
//       length: filteredSubscribers.length,
//     } as Subscriber<Task, any>[] & Record<string, Subscriber<Task, any>>;

//     console.log('Callback unsubscribed successfully.');
//   },

//   addSnapshotFailure: function (
//     snapshotManager: SnapshotManager<Task, any>,
//     snapshot: Snapshot<Task, any>,
//      payload: { error: Error; }
//     ): void {
//     throw new Error('Function not implemented.');
//   },
//   configureSnapshotStore: function (
//     snapshotStore: SnapshotStore<Task, TaskData>,
//     snapshotId: string,
//     data: Map<string, Snapshot<Task, any>>,
//     events: Record<string, CalendarManagerStoreClass<Task, K>[]>,
//     dataItems: RealtimeDataItem[],
//     newData: Snapshot<Task, any>,
//     payload: ConfigureSnapshotStorePayload<Data>,
//     store: SnapshotStore<any, any>,
//     callback: (snapshotStore: SnapshotStore<Task, any>) => void): void | null {
//     throw new Error('Function not implemented.');
//   },
//   updateSnapshotSuccess: function (
//     snapshotId: string,
//     snapshotManager: SnapshotManager<Task, any>,
//     snapshot: Snapshot<Task, any>,
//     payload: { error: Error; }): void | null {
//     throw new Error('Function not implemented.');
//   },
//   createSnapshotFailure: function (snapshotId: string,
//     snapshotManager: SnapshotManager<Task, any>,
//     snapshot: Snapshot<Task, any>,
//     payload: { error: Error; }): Promise<void> {
//     throw new Error('Function not implemented.');
//   },
//   handleSnapshot: function (
//     id: string,
//     snapshotId: string,
//     snapshot:Task | null,
//     snapshotData:Task,
//     category: symbol | string | Category | undefined,
//     callback: (snapshot: Task) => void,
//     snapshots: SnapshotsArray<Task>,
//     type: string,
//     event: Event,
//     snapshotContainer?:Task,
//     snapshotStoreConfig?: SnapshotStoreConfig<Task, K>,
 
//   ): Promise<Snapshot<Task, any> | null> {
//     throw new Error('Function not implemented.');
//   },
//   getParentId: function (): string | null {
//     throw new Error('Function not implemented.');
//   },
//   getChildIds: function (): void {
//     throw new Error('Function not implemented.');
//   },
//   addChild: function (): void {
//     throw new Error('Function not implemented.');
//   },
//   removeChild: function (): void {
//     throw new Error('Function not implemented.');
//   },
//   getChildren: function (): void {
//     throw new Error('Function not implemented.');
//   },
//   hasChildren: function (): boolean {
//     throw new Error('Function not implemented.');
//   },
//   isDescendantOf: function (): boolean {
//     throw new Error('Function not implemented.');
//   },
//   getStore: function (
//     storeId: number,
//     snapshotStore: SnapshotStore<Task, any>,
//     snapshotId: string,
//     snapshot: Snapshot<Task, any>,
//     type: string,
//     event: Event
//   ): SnapshotStore<Task, any> | null {
//     throw new Error('Function not implemented.');
//   },


//   getStores(): Map<number, SnapshotStore<Task, K>>[] {
//     // Example implementation
//     // Adjust based on your application's store management logic
//     return [
//       new Map<number, SnapshotStore<Task, K>>()
//       // Populate with your SnapshotStore instances
//     ];
//   },
//   addStore: function (
//     storeId: number,
//     snapshotId: string,
//     snapshotStore: SnapshotStore<Task, K>,
//     snapshot: Snapshot<Task, K>,
//     type: string,
//     event: Event
//   ): void {
//     try {
//       // Validate input parameters
//       if (typeof storeId !== 'number' || storeId <= 0) {
//         throw new Error('Invalid storeId: Must be a positive number.');
//       }

//       if (!snapshotStore || typeof snapshotStore.addStore !== 'function') {
//         throw new Error('Invalid snapshotStore: Must be a valid SnapshotStore instance with an addStore method.');
//       }

//       if (typeof snapshotId !== 'string' || snapshotId.trim() === '') {
//         throw new Error('Invalid snapshotId: Must be a non-empty string.');
//       }

//       if (!snapshot || typeof snapshot !== 'object') {
//         throw new Error('Invalid snapshot: Must be a valid Snapshot object.');
//       }

//       if (typeof type !== 'string' || type.trim() === '') {
//         throw new Error('Invalid type: Must be a non-empty string.');
//       }

//       // Optional: Validate the event if necessary
//       if (!event || typeof event !== 'object') {
//         throw new Error('Invalid event: Must be a valid Event object.');
//       }

//       // Log inputs for debugging purposes
//       console.log('Adding store with parameters:', {
//         storeId,
//         snapshotId,
//         snapshot,
//         type,
//         event
//       });

//       // Call the addStore method on the snapshotStore
//       snapshotStore.addStore(storeId, snapshotId, snapshotStore, snapshot, type, event);

//       // Log success
//       console.log('Store added successfully:', {
//         storeId,
//         snapshotId
//       });

//     } catch (error: any) {
//       // Handle errors gracefully
//       console.error('Failed to add store:', error.message);
//       // Consider whether to rethrow the error or handle it based on your application’s needs
//     }
//   },


//   mapSnapshot: function (
//     storeId: number,
//     snapshotStore: SnapshotStore<Task, any>,
//     snapshotId: string,
//     snapshot: Snapshot<Task, K>,
//     type: string,
//     event: Event
//   ): Promise<string | undefined> | null {
//     const store = this.getStore(storeId, snapshotStore, snapshotId, snapshot, type, event);
//     if (store) {
//       // Assuming store contains a method to get a snapshot by ID
//       const snapshot = store.getSnapshotId(snapshotId);
//       return snapshot ?? null;
//     }
//     return null;
//   },

//   removeStore: function (): void {
//     throw new Error('Function not implemented.');
//   },
//   snapshotStoreConfig: null,
//   getSnapshotItems: function (): (SnapshotStoreConfig<Task, any> | SnapshotItem<Task, any>)[] {
//     throw new Error('Function not implemented.');
//   },
//   defaultSubscribeToSnapshots: function (snapshotId: string, callback: (snapshots: Snapshots<Task>) => Subscriber<Task, any> | null, snapshot?: Snapshot<Task, any> | null | undefined): void {
//     throw new Error('Function not implemented.');
//   },
//   transformSubscriber: function (sub: Subscriber<Task, any>): Subscriber<Task, any> {
//     throw new Error('Function not implemented.');
//   },
//   transformDelegate: function (): SnapshotStoreConfig<Task, any>[] {
//     throw new Error('Function not implemented.');
//   },
//   initializedState: undefined,
//   getAllKeys: function (): Promise<string[]> | undefined {
//     throw new Error('Function not implemented.');
//   },
//   getAllItems: function (): Promise<Snapshot<Task, any>[]> | undefined {
//     throw new Error('Function not implemented.');
//   },
//   addDataStatus: function (id: number, status: StatusType | undefined): void {
//     throw new Error('Function not implemented.');
//   },
//   removeData: function (id: number): void {
//     throw new Error('Function not implemented.');
//   },
//   updateData: function (id: number, newData: Snapshot<Task, any>): void {
//     throw new Error('Function not implemented.');
//   },
//   updateDataTitle: function (id: number, title: string): void {
//     throw new Error('Function not implemented.');
//   },
//   updateDataDescription: function (id: number, description: string): void {
//     throw new Error('Function not implemented.');
//   },
//   updateDataStatus: function (
//     id: number, 
//     status: StatusType | undefined
//   ): void {
//     throw new Error('Function not implemented.');
//   },
//   addDataSuccess: function (payload: { data: Snapshot<Task, any>[]; }): void {
//     throw new Error('Function not implemented.');
//   },
//   getDataVersions: function (id: number): Promise<Snapshot<Task, any>[] | undefined> {
//     throw new Error('Function not implemented.');
//   },
//   updateDataVersions: function (id: number, versions: Snapshot<Task, any>[]): void {
//     throw new Error('Function not implemented.');
//   },
//   getBackendVersion: function (): Promise<string | undefined> {
//     throw new Error('Function not implemented.');
//   },
//   getFrontendVersion: function (): Promise<string | number | undefined> {
//     throw new Error('Function not implemented.');
//   },
//   fetchData: function (id: number): Promise<SnapshotStore<Task, any>[]> {
//     throw new Error('Function not implemented.');
//   },
//   defaultSubscribeToSnapshot: function (snapshotId: string, callback: Callback<Snapshot<Task, any>>, snapshot: Snapshot<Task, any>): string {
//     throw new Error('Function not implemented.');
//   },
//   handleSubscribeToSnapshot: function (snapshotId: string, callback: Callback<Snapshot<Task, any>>, snapshot: Snapshot<Task, any>): void {
//     throw new Error('Function not implemented.');
//   },
//   removeItem: function (key: string): Promise<void> {
//     throw new Error('Function not implemented.');
//   },
//   getSnapshot: function (
//     snapshot: (id: string) => Promise<{
//     category: any;
//     timestamp: any;
//     id: any; 
//     snapshot: Snapshot<Task, any>; 
//     snapshotStore: SnapshotStore<Task, any>;
//     data: Data;
//   }> | undefined
//   ): Promise<Snapshot<Task, any>> {
//     throw new Error('Function not implemented.');
//   },
//   getSnapshotSuccess: function (snapshot: Snapshot<Task, any>): Promise<SnapshotStore<Task, any>> {
//     throw new Error('Function not implemented.');
//   },
//   setItem: function (key: string, value: Data): Promise<void> {
//     throw new Error('Function not implemented.');
//   },
//   getDataStore: (): Map<string, Data> => {
//     throw new Error('Function not implemented.');
//   },
//   addSnapshotSuccess: function (snapshot: Data, subscribers: Subscriber<Task, any>[]): void {
//     throw new Error('Function not implemented.');
//   },
//   deepCompare: function (objA: any, objB: any): boolean {
//     throw new Error('Function not implemented.');
//   },
//   shallowCompare: function (objA: any, objB: any): boolean {
//     throw new Error('Function not implemented.');
//   },
//   getDataStoreMethods: function (): DataStoreMethods<Task, any> {
//     throw new Error('Function not implemented.');
//   },
//   getDelegate: function (snapshotStoreConfig: SnapshotStoreConfig<Task, any>[]): SnapshotStoreConfig<Task, any>[] {
//     throw new Error('Function not implemented.');
//   },
//   determineCategory: function (snapshot: Snapshot<Task, any> | null | undefined): string {
//     throw new Error('Function not implemented.');
//   },
//   determinePrefix: function <T extends Data>(snapshot:Data | null | undefined, category: string): string {
//     throw new Error('Function not implemented.');
//   },
//   removeSnapshot: function (snapshotToRemove: SnapshotStore<Task, any>): void {
//     throw new Error('Function not implemented.');
//   },
//   addSnapshotItem: function (item: Snapshot<any, any> | SnapshotStoreConfig<Task, any>): void {
//     throw new Error('Function not implemented.');
//   },
//   addNestedStore: function (store: SnapshotStore<Task, any>): void {
//     throw new Error('Function not implemented.');
//   },
//   clearSnapshots: function (): void {
//     throw new Error('Function not implemented.');
//   },
//   addSnapshot: function (
//     snapshot: Snapshot<Task, any>,
//     snapshotId: string,
//     subscribers: SubscriberCollection<Task, any>
//   ): Promise<Snapshot<Task, any> | undefined> {
//     throw new Error('Function not implemented.');
//   },
//   createSnapshot: undefined,
//   createInitSnapshot: function (
//     id: string,
//     snapshotData: SnapshotData<any, Task>,
//     category: string
//   ): Snapshot<Task, any> {
//     throw new Error('Function not implemented.');
//   },
//   setSnapshotSuccess: function (
//     snapshotData: SnapshotData<Task, any>,
//     subscribers: ((data: Subscriber<Task, any>) => void)[]
//   ): void {
//     throw new Error('Function not implemented.');
//   },
//   setSnapshotFailure: function (error: Error): void {
//     throw new Error('Function not implemented.');
//   },
//   updateSnapshots: function (): void {
//     throw new Error('Function not implemented.');
//   },
//   updateSnapshotsSuccess: function (snapshotData: (subscribers: Subscriber<Task, any>[], snapshot: Snapshots<Task>) => void): void {
//     throw new Error('Function not implemented.');
//   },
//   updateSnapshotsFailure: function (error: Payload): void {
//     throw new Error('Function not implemented.');
//   },
//   initSnapshot: function (snapshotConfig: SnapshotStoreConfig<Task, any>, snapshotData: SnapshotData<Task, any>): void {
//     throw new Error('Function not implemented.');
//   },
//   takeSnapshot: function (snapshot: Snapshot<Task, any>, subscribers: Subscriber<Task, any>[]): Promise<{ snapshot: Snapshot<Task, any>; }> {
//     throw new Error('Function not implemented.');
//   },
//   takeSnapshotSuccess: function (snapshot: Snapshot<Task, any>): void {
//     throw new Error('Function not implemented.');
//   },
//   takeSnapshotsSuccess: function (snapshots: Data[]): void {
//     throw new Error('Function not implemented.');
//   },
//   flatMap: function <U extends Iterable<any>>(
//     callback: (
//       value: SnapshotStoreConfig<Task, any>,
//     index: number,
//     array: SnapshotStoreConfig<Task, any>[]
//   ) => U): U extends (infer I)[] ? I[] : U[] {
//     throw new Error('Function not implemented.');
//   },
//   getState: function () {
//     throw new Error('Function not implemented.');
//   },
//   setState: function (state: any): void {
//     throw new Error('Function not implemented.');
//   },
//   validateSnapshot: function (snapshot: Snapshot<Task, any>): boolean {
//     throw new Error('Function not implemented.');
//   },
//   handleActions: function (action: (selectedText: string) => void): void {
//     throw new Error('Function not implemented.');
//   },
//   setSnapshot: function (snapshot: Snapshot<Task, any>): void {
//     throw new Error('Function not implemented.');
//   },
//   transformSnapshotConfig: function <T extends BaseData>(config: SnapshotStoreConfig<BaseData, T>): SnapshotStoreConfig<BaseData, T> {
//     throw new Error('Function not implemented.');
//   },
//   setSnapshots: function (snapshots: Snapshots<Task>): void {
//     throw new Error('Function not implemented.');
//   },
//   clearSnapshot: function (): void {
//     throw new Error('Function not implemented.');
//   },
//   mergeSnapshots: function (snapshots: Snapshots<Task>, category: string): void {
//     throw new Error('Function not implemented.');
//   },
//   reduceSnapshots: function <U>(callback: (acc: U, snapshot: Snapshot<Task, any>) => U, initialValue: U): U | undefined {
//     throw new Error('Function not implemented.');
//   },
//   sortSnapshots: function (): void {
//     throw new Error('Function not implemented.');
//   },
//   filterSnapshots: function (): void {
//     throw new Error('Function not implemented.');
//   },
//   findSnapshot: function (): void {
//     throw new Error('Function not implemented.');
//   },
//   getSubscribers: function (subscribers: Subscriber<Task, any>[], snapshots: Snapshots<Task>): Promise<{ subscribers: Subscriber<Task, any>[]; snapshots: Snapshots<Task>; }> {
//     throw new Error('Function not implemented.');
//   },
//   notify: function (id: string, message: string, content: any, date: Date, type: NotificationType, notificationPosition?: NotificationPosition | undefined): void {
//     throw new Error('Function not implemented.');
//   },
//   notifySubscribers: function (
//     subscribers: Subscriber<Task, any>[],
//     data: Partial<SnapshotStoreConfig<BaseData, any>>
//   ): SubscriberCollection<Task, any> {
//     throw new Error('Function not implemented.');
//   },
//   getSnapshots: function (category: string, data: Snapshots<Task>): void {
//     throw new Error('Function not implemented.');
//   },
//   getAllSnapshots: function (data: (subscribers: Subscriber<Task, any>[], snapshots: Snapshots<Task>) => Promise<Snapshots<Task>>): void {
//     throw new Error('Function not implemented.');
//   },
//   generateId: function (): string {
//     throw new Error('Function not implemented.');
//   },
//   batchFetchSnapshots: function (subscribers: Subscriber<Task, any>[], snapshots: Snapshots<Task>): void {
//     throw new Error('Function not implemented.');
//   },
//   batchTakeSnapshotsRequest: function (snapshotData: any): void {
//     throw new Error('Function not implemented.');
//   },
//   batchUpdateSnapshotsRequest: function (snapshotData: (subscribers: Subscriber<Task, any>[]) => Promise<{ subscribers: Subscriber<Task, any>[]; snapshots: Snapshots<Task>; }>): void {
//     throw new Error('Function not implemented.');
//   },
//   filterSnapshotsByStatus: undefined,
//   filterSnapshotsByCategory: undefined,
//   filterSnapshotsByTag: undefined,
//   batchFetchSnapshotsSuccess: function (subscribers: Subscriber<Task, any>[], snapshots: Snapshots<Task>): void {
//     throw new Error('Function not implemented.');
//   },
//   batchFetchSnapshotsFailure: function (payload: { error: Error; }): void {
//     throw new Error('Function not implemented.');
//   },
//   batchUpdateSnapshotsSuccess: function (subscribers: Subscriber<Task, any>[], snapshots: Snapshots<Task>): void {
//     throw new Error('Function not implemented.');
//   },
//   batchUpdateSnapshotsFailure: function (payload: { error: Error; }): void {
//     throw new Error('Function not implemented.');
//   },
//   batchTakeSnapshot: function (snapshotStore: SnapshotStore<Task, any>, snapshots: Snapshots<Task>): Promise<{ snapshots: Snapshots<Task>; }> {
//     throw new Error('Function not implemented.');
//   },
//   handleSnapshotSuccess: function (snapshot: Snapshot<Task, Data> | null, snapshotId: string): void {
//     throw new Error('Function not implemented.');
//   },
//   getInitialState: function (): Snapshot<Task, any> | null {
//     throw new Error('Function not implemented.');
//   },
//   getConfigOption: function (): SnapshotStoreConfig<Task, any> | null {
//     throw new Error('Function not implemented.');
//   },
//   getTimestamp: function (): Date | undefined {
//     throw new Error('Function not implemented.');
//   },
//   getData: function (): Data | Map<string, Snapshot<Task, any>> | null | undefined {
//     throw new Error('Function not implemented.');
//   },
//   setData: function (data: Map<string, Snapshot<Task, any>>): void {
//     throw new Error('Function not implemented.');
//   },
//   addData: function (): void {
//     throw new Error('Function not implemented.');
//   },
//   mapSnapshots: function (
//       storeIds: number[],
//       snapshotId: string,
//       category: symbol | string | Category | undefined,
//       snapshot: Snapshot<Task, K>,
//       timestamp: string | number | Date | undefined,
//       type: string,
//       event: Event,
//       id: number,
//       snapshotStore: SnapshotStore<Task, K>,
//       data: K,
//       callback: (
//         storeIds: number[],
//         snapshotId: string,
//         category: symbol | string | Category | undefined,
//         snapshot: Snapshot<Task, K>,
//         timestamp: string | number | Date | undefined,
//         type: string,
//         event: Event,
//         id: number,
//         snapshotStore: SnapshotStore<Task, K>,
//         data: K
//       ) => SnapshotsObject<K>
//   ): SnapshotsObject<K> | null {
//     throw new Error('Function not implemented.');
//   },
//   fetchSnapshot: function (
//     callback: (snapshotId: string,
//       payload: FetchSnapshotPayload<any>, 
//       snapshotStore: SnapshotStore<Task, any>,
//       payloadData: Task,
//       category: symbol | string | Category | undefined,
//       timestamp: Date,
//       data: Data,
//       delegate: SnapshotWithCriteria<Task, any>[]
//     ) => Snapshot<Task, any>): Snapshot<Task, any> {
//     throw new Error('Function not implemented.');
//   },
//   createSnapshotSuccess: function (
//     snapshotId: string,
//     snapshotManager: SnapshotManager<Task, any>,
//     snapshot: Snapshot<Task, any>,
//     payload: { error: Error; }
//   ): void | null {
//     throw new Error('Function not implemented.');
//   },
//   createSnapshots: function (id: string, snapshotId: string, snapshot: Snapshot<Task, any>, snapshotManager: SnapshotManager<Task, any>, payload: CreateSnapshotsPayload<Task, any>, callback: (snapshots: Snapshot<Task, any>[]) => void | null, snapshotDataConfig?: SnapshotConfig<Task, any>[] | undefined, category?: string | symbol | Category): Snapshot<Task, any>[] | null {
//     throw new Error('Function not implemented.');
//   },
//   onSnapshot: function (snapshotId: string, snapshot: Snapshot<Task, any>, type: string, event: Event, callback: (snapshot: Snapshot<Task, any>) => void): void {
//     throw new Error('Function not implemented.');
//   },
//   onSnapshots: function (snapshotId: string, snapshots: Snapshots<Task>, type: string, event: Event, callback: (snapshots: Snapshots<Task>) => void): void {
//     throw new Error('Function not implemented.');
//   },
//   label: undefined
// };

 
// const subscriber = new Subscriber(
//   '1',
//   'Subscriber Name',
//   {} as Subscription<TaskData, SubtaskData>,
//   'subscriberId',
//   (data: Snapshot<TaskData, SubtaskData>) => { console.log('Event System:', data); },
//   (data: Snapshot<TaskData, SubtaskData>) => { console.log('Update Project State:', data); },
//   (data: Snapshot<TaskData, SubtaskData>) => { console.log('Log Activity:', data); },
//   (data: Snapshot<TaskData, SubtaskData>) => { console.log('Trigger Incentives:', data); },
//   null, // or provide an appropriate CustomSnapshotData if available
//   null  // or provide appropriate TaskData if available
// );

// const newTaskWithSubtasksSnapshot: Snapshot<TaskData, SubtaskData> = {
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
//       new Subscriber<TaskData, SubtaskData>(
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
//         } as Subscription<TaskData, SubtaskData>,
//         '',
//         (data: Snapshot<TaskData, SubtaskData>) => { throw new Error('Function not implemented.'); },
//         (data: Snapshot<TaskData, SubtaskData>) => { throw new Error('Function not implemented.'); },
//         (data: Snapshot<TaskData, SubtaskData>) => { throw new Error('Function not implemented.'); },
//         (data: Snapshot<TaskData, SubtaskData>) => { throw new Error('Function not implemented.'); },
//         null,
//         undefined
//       )
//     ],
//   },

//     store: null,    stores: null,

//     data: new Map<string, Snapshot<TaskData, SubtaskData>>([
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
export type { SnapshotOperation };
export { SnapshotStoreActions }


