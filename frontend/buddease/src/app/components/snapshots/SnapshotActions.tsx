//snapshots/SnapshotActions.ts

import { ActionCreator, ActionCreatorWithPayload, createAction } from '@reduxjs/toolkit';
import { BaseData, Data } from '../models/data/Data';
import { CustomSnapshotData, Snapshot, Snapshots } from './LocalStorageSnapshotStore';
import { ConfigureSnapshotStorePayload, K, SnapshotStoreConfig } from './SnapshotConfig';
import { useDispatch } from 'react-redux';
import SnapshotStore, { SnapshotData } from './SnapshotStore';
import { SnapshotManager } from '../hooks/useSnapshotManager';
import { RealtimeDataItem } from '../models/realtime/RealtimeData';
import { CalendarEvent } from '../state/stores/CalendarEvent';
import { Callback } from './subscribeToSnapshotsImplementation';
import { SubscriberTypeEnum } from '../models/data/StatusType';
import { Subscription } from '../subscriptions/Subscription';
import { NotificationType } from '../support/NotificationContext';
import { Subscriber } from '../users/Subscriber';
import { TriggerIncentivesParams } from '../utils/applicationUtils';
import { getDiffieHellman } from 'crypto';
import { subscribeToRealtimeUpdates } from '../web3/dAppAdapter/functionality/RealtimeUpdates';

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

type Callback<T> = {
  [key: string]: CallbackAction;
};

// Define generic action types
interface SnapshotActionsTypes<T extends Data, K extends Data> {
  addTaskSnapshot: ActionCreatorWithPayload<Snapshot<T, K>>;
  removeTaskSnapshot: ActionCreatorWithPayload<string>;
  updateTaskSnapshot: ActionCreatorWithPayload<{ snapshotId: string; newData: any }>;
  fetchTaskSnapshotData: ActionCreatorWithPayload<string>;
  handleTaskSnapshotSuccess: ActionCreatorWithPayload<{ snapshot: Snapshot<T, K>; snapshotId: string }>;
  handleTaskSnapshotFailure: ActionCreatorWithPayload<string>;
}


// Define action types with generics
interface SnapshotStoreActionsTypes<T extends Data, K extends Data> {
  addSnapshotToStore: ActionCreatorWithPayload<Snapshot<T, K>>;
  removeSnapshotFromStore: ActionCreatorWithPayload<string>; // Snapshot ID
  updateSnapshotInStore: ActionCreatorWithPayload<{ snapshotId: string; newData: any }>;
  fetchSnapshotStoreData: ActionCreatorWithPayload<string>; // Store ID
  handleSnapshotStoreSuccess: ActionCreatorWithPayload<{
    snapshotStore: SnapshotStore<T, K>;
    snapshot: Snapshot<T, K>;
    snapshotId: string;
  }>;
  handleSnapshotStoreFailure: ActionCreatorWithPayload<string>;
}


interface TaskWithSubtasksSnapshotActionsTypes<T extends Data, K extends Data>  {
  addTaskWithSubtasksSnapshot: ActionCreatorWithPayload<Snapshot<TaskData, SubtaskData>>;
  removeTaskWithSubtasksSnapshot: ActionCreatorWithPayload<string>;
  updateTaskWithSubtasksSnapshot: ActionCreatorWithPayload<{ snapshotId: string; newData: any }>;
  fetchTaskWithSubtasksSnapshotData: ActionCreatorWithPayload<string>;
  handleTaskWithSubtasksSnapshotSuccess: ActionCreatorWithPayload<{
    snapshot: Snapshot<TaskData, SubtaskData>;
    snapshotId: string;
  }>;
  handleTaskWithSubtasksSnapshotFailure: ActionCreatorWithPayload<string>;
}


// Create action creators with generics
export const SnapshotActions = <T extends Data, K extends Data>(): SnapshotActionsTypes<T, K> => ({
  addTaskSnapshot: createAction<Snapshot<T, K>>('addTaskSnapshot'),
  removeTaskSnapshot: createAction<string>('removeTaskSnapshot'),
  updateTaskSnapshot: createAction<{ snapshotId: string; newData: any }>('updateTaskSnapshot'),
  fetchTaskSnapshotData: createAction<string>('fetchTaskSnapshotData'),
  handleTaskSnapshotSuccess: createAction<{ snapshot: Snapshot<T, K>; snapshotId: string }>('handleTaskSnapshotSuccess'),
  handleTaskSnapshotFailure: createAction<string>('handleTaskSnapshotFailure'),
});


export const SnapshotStoreActions = <T extends Data, K extends Data>(): SnapshotStoreActionsTypes<T, K> => ({
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


// Actions for managing task snapshots with subtasks
export const TaskWithSubtasksSnapshotActions = <T extends Data, K extends Data>(): TaskWithSubtasksSnapshotActionsTypes<T, K> => ({
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





const newTaskSnapshot: Snapshot<Data, K> = {
  id: '1',
  data: {
    id: '1',
    title: 'Task 1',
    description: 'Description of Task 1',
    createdAt: new Date(),
    updatedAt: new Date(),
    timestamp: new Date().getTime(),
  },
  createdAt: new Date(),
  updatedAt: new Date(),
  events: {
    eventRecords: {},
    callbacks: [(snapshot: Snapshot<Data, K>) => { } ],
    subscribers: [],
    eventIds: []
  },
  meta: new Map<string, Snapshot<Data, any>>(),
  getSnapshotId: function (key: string | SnapshotData): unknown {
    throw new Error('Function not implemented.');
  },
  compareSnapshotState: function (arg0: Snapshot<Data, any> | null, state: any): unknown {
    throw new Error('Function not implemented.');
  },
  eventRecords: null,
  snapshotStore: null,
  dataItems: null,
  newData: undefined,
  stores: null,
  unsubscribe: function (callback: Callback<Snapshot<Data, any>>): void {
    throw new Error('Function not implemented.');
  },
  addSnapshotFailure: function (snapshotManager: SnapshotManager<Data, any>, snapshot: Snapshot<Data, any>, payload: { error: Error; }): void {
    throw new Error('Function not implemented.');
  },
  configureSnapshotStore: function (snapshotStore: SnapshotStore<Data, any>, snapshotId: string, data: Map<string, BaseData>, events: Record<string, CalendarEvent[]>, dataItems: RealtimeDataItem[], newData: Snapshot<Data, any>, payload: ConfigureSnapshotStorePayload<Data>, store: SnapshotStore<any, any>, callback: (snapshotStore: SnapshotStore<Data, any>) => void): void | null {
    throw new Error('Function not implemented.');
  },
  updateSnapshotSuccess: function (snapshotId: string, snapshotManager: SnapshotManager<Data, any>, snapshot: Snapshot<Data, any>, payload: { error: Error; }): void | null {
    throw new Error('Function not implemented.');
  },
  createSnapshotFailure: function (snapshotId: string, snapshotManager: SnapshotManager<Data, any>, snapshot: Snapshot<Data, any>, payload: { error: Error; }): Promise<void> {
    throw new Error('Function not implemented.');
  },
  timestamp: undefined,
  handleSnapshot: function (snapshotId: string, snapshot: Snapshot<Data, any> | null, snapshots: Snapshots<Data>, type: string, event: Event): void | null {
    throw new Error('Function not implemented.');
  },
  getParentId: function (): string | null {
    throw new Error('Function not implemented.');
  },
  getChildIds: function (): void {
    throw new Error('Function not implemented.');
  },
  addChild: function (): void {
    throw new Error('Function not implemented.');
  },
  removeChild: function (): void {
    throw new Error('Function not implemented.');
  },
  getChildren: function (): void {
    throw new Error('Function not implemented.');
  },
  hasChildren: function (): boolean {
    throw new Error('Function not implemented.');
  },
  isDescendantOf: function (): boolean {
    throw new Error('Function not implemented.');
  },
  getStore: function (
    storeId: string,
    snapshotId: string,
    snapshot: Snapshot<Data, any>,
    type: string,
    event: Event,
  ): SnapshotStore<Data, any> | null {
    throw new Error('Function not implemented.');
  },
  addStore: function (
    storeId: string,
    store: SnapshotStore<Data, K>,
    snapshotId: string,
    snapshot: Snapshot<Data, K>,
    type: string,
    event: Event
  ): void {
    throw new Error('Function not implemented.');
  },
  mapSnapshot: function (snapshotId: string, snapshot: Snapshot<Data, any>, type: string, event: Event): void {
    throw new Error('Function not implemented.');
  },
  removeStore: function (): void {
    throw new Error('Function not implemented.');
  }
};

 
const subscriber = new Subscriber('1', 'Subscriber Name', {} as Subscription<TaskData, SubtaskData>);

const newTaskWithSubtasksSnapshot: Snapshot<TaskData, SubtaskData> = {
  id: '2',
  data: {
    id: '2',
    title: 'Task 2',
    description: 'Description of Task 2',
    createdAt: new Date(),
    updatedAt: new Date(),
    timestamp: new Date().getTime(),
  },
  snapshotStore: {
    _id: snapshotStoreConfig.getId
    id: '2',
    key: 'key2',
    topic: 'subtask',
    date: new Date(),
    // config: {},
    title: 'snapshot store',
    category: 'subtask category',
    message: 'snapshot store',
    timestamp: new Date().getTime(),
    createdBy: 'user1',
    eventRecords: {},
    type: 'snapshot',
    subscribers: [{
      _id: subscriber.getUniqueId(),
      name: '',
      subscription: {
        unsubscribe: function (userId: string, snapshotId: string, unsubscribeType: string, unsubscribeDate: Date, unsubscribeReason: string, unsubscribeData: any): void {
          throw new Error('Function not implemented.');
        },
        portfolioUpdates: function ({ userId, snapshotId }: { userId: string; snapshotId: string; }): void {
          throw new Error('Function not implemented.');
        },
        tradeExecutions: function ({ userId, snapshotId }: { userId: string; snapshotId: string; }): void {
          throw new Error('Function not implemented.');
        },
        marketUpdates: function ({ userId, snapshotId }: { userId: string; snapshotId: string; }): void {
          throw new Error('Function not implemented.');
        },
        triggerIncentives: function ({ userId, incentiveType, params }: TriggerIncentivesParams): void {
          throw new Error('Function not implemented.');
        },
        communityEngagement: function ({ userId, snapshotId }: { userId: string; snapshotId: string; }): void {
          throw new Error('Function not implemented.');
        },
        subscriberId: undefined,
        subscriptionId: undefined,
        subscriberType: undefined,
        subscriptionType: undefined,
        getPlanName: undefined,
        portfolioUpdatesLastUpdated: null,
        getId: undefined,
        determineCategory: function (data: Snapshot<TaskData, SubtaskData> | null | undefined): string {
          throw new Error('Function not implemented.');
        },
        category: undefined,
        fetchSnapshotById: undefined,
        fetchSnapshotByIdCallback: undefined
      },
      subscriberId: '',
      subscribersById: undefined,
      subscribers: [],
      onSnapshotCallbacks: [],
      onErrorCallbacks: [],
      onUnsubscribeCallbacks: [],
      notifyEventSystem: undefined,
      updateProjectState: undefined,
      logActivity: undefined,
      triggerIncentives: undefined,
      optionalData: null,
      data: undefined,
      email: '',
      enabled: false,
      tags: [],
      snapshotIds: [],
      payload: undefined,
      fetchSnapshotIds: function (): Promise<string[]> {
        throw new Error('Function not implemented.');
      },
      getId: function (): string | undefined {
        throw new Error('Function not implemented.');
      },
      id: undefined,
      defaultSubscribeToSnapshots: [],
      subscribeToSnapshots: [],
      getSubscribers: [],
      transformSubscribers: [],
      setSubscribers: [],
      getOnSnapshotCallbacks: [],
      setOnSnapshotCallbacks: [],
      getOnErrorCallbacks: [],
      setOnErrorCallbacks: [],
      getOnUnsubscribeCallbacks: [],
      setOnUnsubscribeCallbacks: [],
      setNotifyEventSystem: undefined,
      setUpdateProjectState: undefined,
      setLogActivity: undefined,
      setTriggerIncentives: undefined,
      setOptionalData: null,
      setEmail: '',
      setSnapshotIds: [],
      getPayload: undefined,
      handleCallback: function (data: Snapshot<TaskData, SubtaskData>): void {
        throw new Error('Function not implemented.');
      },
      snapshotCallback: function (data: Snapshot<TaskData, SubtaskData>): void {
        throw new Error('Function not implemented.');
      },
      getEmail: function (): string {
        throw new Error('Function not implemented.');
      },
      subscribe: function (callback: (data: Snapshot<TaskData, SubtaskData>) => void): void {
        throw new Error('Function not implemented.');
      },
      unsubscribe: function (callback: (data: Snapshot<TaskData, SubtaskData>) => void): void {
        throw new Error('Function not implemented.');
      },
      getTransformSubscribers: function (): ((data: Snapshot<TaskData, SubtaskData>) => void)[] {
        throw new Error('Function not implemented.');
      },
      getOptionalData: function (): CustomSnapshotData | null {
        throw new Error('Function not implemented.');
      },
      getFetchSnapshotIds: function (): Promise<string[]> {
        throw new Error('Function not implemented.');
      },
      getSnapshotIds: function (): string[] {
        throw new Error('Function not implemented.');
      },
      getData: function (): Partial<SnapshotStore<TaskData, SubtaskData>> | null {
        throw new Error('Function not implemented.');
      },
      getNewData: function (): Promise<Partial<SnapshotStore<TaskData, SubtaskData>> | null> {
        throw new Error('Function not implemented.');
      },
      getNotifyEventSystem: function (): Function | undefined {
        throw new Error('Function not implemented.');
      },
      getUpdateProjectState: function (): Function | undefined {
        throw new Error('Function not implemented.');
      },
      getLogActivity: function (): Function | undefined {
        throw new Error('Function not implemented.');
      },
      getTriggerIncentives: function (): Function | undefined {
        throw new Error('Function not implemented.');
      },
      initialData: function (data: Snapshot<TaskData, SubtaskData>): void {
        throw new Error('Function not implemented.');
      },
      getName: function (): string {
        throw new Error('Function not implemented.');
      },
      getDetermineCategory: function (data: Snapshot<TaskData, SubtaskData>): Snapshot<TaskData, SubtaskData> {
        throw new Error('Function not implemented.');
      },
      fetchSnapshotById: function (userId: string, snapshotId: string): Promise<Snapshot<TaskData, SubtaskData>> {
        throw new Error('Function not implemented.');
      },
      snapshots: function (): Promise<SnapshotStoreConfig<BaseData, Data>[]> {
        throw new Error('Function not implemented.');
      },
      toSnapshotStore: function (initialState: Snapshot<TaskData, SubtaskData> | undefined, snapshotConfig: SnapshotStoreConfig<BaseData, Data>[], delegate: (snapshot: Snapshot<TaskData, any>, initialState: Snapshot<TaskData, any>, snapshotConfig: SnapshotStoreConfig<BaseData, Data>[]) => void): SnapshotStore<TaskData, SubtaskData>[] | undefined {
        throw new Error('Function not implemented.');
      },
      determineCategory: function (initialState: Snapshot<TaskData, SubtaskData>): string {
        throw new Error('Function not implemented.');
      },
      getDeterminedCategory: function (data: Snapshot<TaskData, SubtaskData>): string {
        throw new Error('Function not implemented.');
      },
      processNotification: function (id: string, message: string, snapshotContent: Map<string, Snapshot<TaskData, SubtaskData>> | null | undefined, date: Date, type: NotificationType, store: SnapshotStore<TaskData, SubtaskData>): Promise<void> {
        throw new Error('Function not implemented.');
      },
      receiveSnapshot: function (snapshot: TaskData): void {
        throw new Error('Function not implemented.');
      },
      getState: function (prop: any): TaskData | null {
        throw new Error('Function not implemented.');
      },
      setEvent: function (prop: any, value: any): void {
        throw new Error('Function not implemented.');
      },
      onError: function (callback: (error: Error) => void): void {
        throw new Error('Function not implemented.');
      },
      getSubscriberId: function (): string {
        throw new Error('Function not implemented.');
      },
      getSubscribersById: function (): Map<string, Subscriber<TaskData, SubtaskData>> {
        throw new Error('Function not implemented.');
      },
      getSubscribersWithSubscriptionPlan: function (userId: string, snapshotId: string): SubscriberTypeEnum | undefined {
        throw new Error('Function not implemented.');
      },
      getSubscription: function (): Subscription<TaskData, SubtaskData> {
        throw new Error('Function not implemented.');
      },
      onUnsubscribe: function (callback: (callback: (data: Snapshot<TaskData, SubtaskData>) => void) => void): void {
        throw new Error('Function not implemented.');
      },
      onSnapshot: function (callback: (snapshot: Snapshot<TaskData, SubtaskData>) => void | Promise<void>): void {
        throw new Error('Function not implemented.');
      },
      onSnapshotError: function (callback: (error: Error) => void): void {
        throw new Error('Function not implemented.');
      },
      onSnapshotUnsubscribe: function (callback: (callback: (data: Snapshot<TaskData, SubtaskData>) => void) => void): void {
        throw new Error('Function not implemented.');
      },
      triggerOnSnapshot: function (snapshot: Snapshot<TaskData, SubtaskData>): void {
        throw new Error('Function not implemented.');
      }
    }],
    store: null,
    stores: null,

    data: new Map<string, Snapshot<TaskData, SubtaskData>>([
      ['subtask1', {
        id: 'subtask1',
        data: {
          id: 'subtask1',
          parentId: '2',
          title: 'Subtask 1',
          isCompleted: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          description: 'Subtask 1 description',
          timestamp: Date.now()
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        events: {
          eventRecords: {},
          callbacks: [],
          subscribers: [],
          eventIds: []
        },
        meta: new Map(),
        getSnapshotId: (key) => 'subtask1',
        compareSnapshotState: (other, state) => false,
        snapshotStore: null,
        getParentId: () => '2',
        getChildIds: () => ['subtask1'],
        addChild: () => {},
        removeChild: () => {},
        getChildren: () => ['subtask1'],
        hasChildren: () => false,
        isDescendantOf: () => false,
        eventRecords: {},
        dataItems: [],
        newData: undefined,
        stores: [],
        getStore: (snapshotId, snapshot, type, event) => null,
        addStore: (snapshotStore, snapshotId, snapshot, type, event) => {},
        mapSnapshot: (snapshotId, snapshot, type, event) => {},
        removeStore: () => {},
        subscribe: (callback) => {},
        unsubscribe: (callback) => {},
        handleSnapshot: (snapshotId, snapshot, snapshots, type, event) => {},
        fetchSnapshotFailure: (snapshotManager, snapshot, payload) => { },
        addSnapshotFailure: (snapshotManager, snapshot, payload) => {},
        configureSnapshotStore: (snapshotStore, snapshotId, data, events, dataItems, newData, payload, store, callback) => {},
        fetchSnapshotSuccess: (snapshotManager, snapshot) => {},
        updateSnapshotFailure: (snapshotManager, snapshot, payload) => {},
        updateSnapshotSuccess: (snapshotId, snapshotManager, snapshot, payload) => {},
        createSnapshotFailure: async (snapshotId, snapshotManager, snapshot, payload) => {},
        updateSnapshot: (snapshotId, data, events, snapshotStore, dataItems, newData, payload, store) => {},
        updateSnapshotItem: (snapshotItem) => {},
        timestamp: new Date().getTime()
      }],
      ['subtask2', {
        id: 'subtask2',
        data: {
          id: 'subtask2',
          parentId: '2',
          title: 'Subtask 2',
          isCompleted: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          description: 'Subtask 2 description',
          timestamp: Date.now()
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        events: {
          eventRecords: {},
          callbacks: [],
          subscribers: [],
          eventIds: []
        },
        meta: new Map(),
        getSnapshotId: (key) => 'subtask2',
        compareSnapshotState: (other, state) => false,
        snapshotStore: null,
        getParentId: () => '2',
        getChildIds: () => ['subtask2'],
        addChild: () => {},
        removeChild: () => {},
        getChildren: () => ['subtask2'],
        hasChildren: () => false,
        isDescendantOf: () => false,
        eventRecords: {},
        dataItems: [],
        newData: undefined,
        stores: [],
        getStore: (snapshotId, snapshot, type, event) => null,
        addStore: (snapshotStore, snapshotId, snapshot, type, event) => {},
        mapSnapshot: (snapshotId, snapshot, type, event) => {},
        removeStore: () => {},
        subscribe: (callback) => {},
        handleSnapshot: (snapshotId, snapshot, snapshots, type, event) => {},
        unsubscribe: (callback) => { },
        fetchSnapshotFailure: (snapshotManager, snapshot, payload) => {},
        addSnapshotFailure: (snapshotManager, snapshot, payload) => {},
        configureSnapshotStore: (snapshotStore, snapshotId, data, events, dataItems, newData, payload, store, callback) => {},
        fetchSnapshotSuccess: (snapshotManager, snapshot) => {},
        updateSnapshotFailure: (snapshotManager, snapshot, payload) => {},
        updateSnapshotSuccess: (snapshotId, snapshotManager, snapshot, payload) => {},
        createSnapshotFailure: async (snapshotId, snapshotManager, snapshot, payload) => {},
        updateSnapshot: (snapshotId, data, events, snapshotStore, dataItems, newData, payload, store) => {},
        updateSnapshotItem: (snapshotItem) => {},
        timestamp: new Date().getTime()
      }]
    ]),
  },
  eventRecords: {},
  store: null,
  snapshots: {
    'subtask1': {
      id: 'subtask1',
      data: {
        id: 'subtask1',
        parentId: '2',
        title: 'Subtask 1',
        isCompleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        description: 'Subtask 1 description',
        timestamp: Date.now()
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      events: {
        eventRecords: {},
        callbacks: [],
        subscribers: [],
        eventIds: []
      },
      meta: new Map(),
      getSnapshotId: (key) => 'subtask1',
      compareSnapshotState: (other, state) => false,
      snapshotStore: null,
      getParentId: () => '2',
      getChildIds: () => ['subtask1'],
      addChild: () => {},
      removeChild: () => {},
      getChildren: () => ['subtask1'],
      hasChildren: () => false,
      isDescendantOf: () => false,
      eventRecords: {},
      dataItems: [],
      newData: undefined,
      stores: [],
      getStore: (snapshotId, snapshot, type, event) => null,
      addStore: (snapshotStore, snapshotId, snapshot, type, event) => {},
      mapSnapshot: (snapshotId, snapshot, type, event) => {},
      removeStore: () => {},
      subscribe: (callback) => {},
      unsubscribe: (callback) => {},
      fetchSnapshotFailure: (snapshotManager, snapshot, payload) => {},
      addSnapshotFailure: (snapshotManager, snapshot, payload) => {},
      configureSnapshotStore: (snapshotStore, snapshotId, data, events, dataItems, newData, payload, store, callback) => {},
      fetchSnapshotSuccess: (snapshotManager, snapshot) => {},
      updateSnapshotFailure: (snapshotManager, snapshot, payload) => {},
      updateSnapshotSuccess: (snapshotId, snapshotManager, snapshot, payload) => {},
      createSnapshotFailure: async (snapshotId, snapshotManager, snapshot, payload) => {},
      updateSnapshot: (snapshotId, data, events, snapshotStore, dataItems, newData, payload, store) => {},
      updateSnapshotItem: (snapshotItem) => {},
      timestamp: new Date().getTime()
    },
    'subtask2': {
      id: 'subtask2',
      data: {
        id: 'subtask2',
        parentId: '2',
        title: 'Subtask 2',
        isCompleted: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        description: 'Subtask 2 description',
        timestamp: Date.now()
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      events: {
        eventRecords: {},
        callbacks: [],
        subscribers: [],
        eventIds: []
      },
      meta: new Map(),
      getSnapshotId: (key) => 'subtask2',
      compareSnapshotState: (other, state) => false,
      snapshotStore: null,
      getParentId: () => '2',
      getChildIds: () => ['subtask2'],
      addChild: () => {},
      removeChild: () => {},
      getChildren: () => ['subtask2'],
      hasChildren: () => false,
      isDescendantOf: () => false,
      eventRecords: {},
      dataItems: [],
      newData: undefined,
      stores: [],
      getStore: (snapshotId, snapshot, type, event) => null,
      addStore: (snapshotStore, snapshotId, snapshot, type, event) => {},
      mapSnapshot: (snapshotId, snapshot, type, event) => {},
      removeStore: () => {},
      subscribe: (callback) => {},
      unsubscribe: (callback) => {},
      fetchSnapshotFailure: (snapshotManager, snapshot, payload) => {},
      addSnapshotFailure: (snapshotManager, snapshot, payload) => {},
      configureSnapshotStore: (snapshotStore, snapshotId, data, events, dataItems, newData, payload, store, callback) => {},
      fetchSnapshotSuccess: (snapshotManager, snapshot) => {},
      updateSnapshotFailure: (snapshotManager, snapshot, payload) => {},
      updateSnapshotSuccess: (snapshotId, snapshotManager, snapshot, payload) => {},
      createSnapshotFailure: async (snapshotId, snapshotManager, snapshot, payload) => {},
      updateSnapshot: (snapshotId, data, events, snapshotStore, dataItems, newData, payload, store) => {},
      updateSnapshotItem: (snapshotItem) => {},
      timestamp: new Date().getTime()
    }
  },
  getSnapshotId: (key) => '2',
  compareSnapshotState: (other, state) => false,
  getParentId: () => '0',
  getChildIds: () => ['subtask1', 'subtask2'],
  addChild: () => {},
  removeChild: () => {},
  getChildren: () => ['subtask1', 'subtask2'],
  hasChildren: () => true,
  isDescendantOf: () => false,
  eventRecords: {},
  dataItems: [],
  newData: undefined,
  stores: [],
  getStore: (snapshotId, snapshot, type, event) => null,
  addStore: (snapshotStore, snapshotId, snapshot, type, event) => {},
  mapSnapshot: (snapshotId, snapshot, type, event) => {},
  removeStore: () => {},
  subscribe: (callback) => {},
  unsubscribe: (callback) => {},
  fetchSnapshotFailure: (snapshotManager, snapshot, payload) => {},
  addSnapshotFailure: (snapshotManager, snapshot, payload) => {},
  configureSnapshotStore: (snapshotStore, snapshotId, data, events, dataItems, newData, payload, store, callback) => {},
  fetchSnapshotSuccess: (snapshotManager, snapshot) => {},
  updateSnapshotFailure: (snapshotManager, snapshot, payload) => {},
  updateSnapshotSuccess: (snapshotId, snapshotManager, snapshot, payload) => {},
  createSnapshotFailure: async (snapshotId, snapshotManager, snapshot, payload) => {},
  updateSnapshot: (snapshotId, data, events, snapshotStore, dataItems, newData, payload, store) => {},
  updateSnapshotItem: (snapshotItem) => {},
  timestamp: new Date().getTime()
};



dispatch(SnapshotActions().addTaskSnapshot(newTaskSnapshot));
dispatch(TaskWithSubtasksSnapshotActions().addTaskWithSubtasksSnapshot(newTaskWithSubtasksSnapshot));
