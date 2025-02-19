// SubscriptionActions.ts
import { Content } from '@/app/components/models/content/AddContent';
import { BaseData, Data } from '@/app/components/models/data/Data';
import { Project } from '@/app/components/projects/Project';
import { LogActivityParams } from '@/app/components/utils/applicationUtils';
import { category } from '@/app/components/utils/snapshotUtils';
import { ActionCreatorWithoutPayload, ActionCreatorWithPayload, createAction } from "@reduxjs/toolkit";
import { NotificationPosition, ProjectStateEnum } from '../models/data/StatusType';
import { Callback, CustomSnapshotData, Snapshot, SnapshotContainerData } from "../snapshots";
import { NotificationType, NotificationTypeEnum } from "../support/NotificationContext";
import { Subscriber } from "../users/Subscriber";
import { TriggerIncentivesParams } from '../utils/applicationUtils';
import { StructuredMetadata } from '@/app/configs/StructuredMetadata';
 
interface SubscriptionPayload<
  // ExcludedFields extends keyof T = never,
  T extends  BaseData<any> = BaseData<any, any>, 
  K extends T = T,
  ExcludedFields extends Data<T> = never,
  S extends CustomSnapshotData<T, K> = CustomSnapshotData<T, K>,  Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>
> {
  error: string | undefined;
  meta: {
    name: string,
    timestamp: Date,
    type: NotificationTypeEnum.Info,
    startDate: Date,
    endDate: Date,
    status: string,
    id: string,
    isSticky: boolean,
    isDismissable: boolean,
    isClickable: boolean,
    isClosable: boolean,
    isAutoDismiss: boolean,
    isAutoDismissable: boolean,
    isAutoDismissOnNavigation: boolean,
    isAutoDismissOnAction: boolean,
    isAutoDismissOnTimeout: boolean,
    isAutoDismissOnTap: boolean,
    optionalData: K,
    data: T
  },
  notify: (id: string, 
    message: string,
    content: any,
    date: Date,
    type: NotificationType,
    notificationPosition?: NotificationPosition | undefined
  ) => void;  // assuming notify is a function that sends notifications
  id: string;  // assuming id is a string
  content: string | object;  // assuming content can be a string or an object
  date: Date;  // assuming date is a Date object
  subscribers: Array<Subscriber<T, K>>;  // assuming subscribers is an array of Subscriber objects
  subscription: {
    active: boolean;
    plan: string;
  };  // example structure for subscription
  onSnapshotCallbacks: Array<(snapshot: T) => void>;  // assuming it's an array of functions
  onSnapshotCallback: (snapshot: T) => void;  // single callback function
  onSnapshotCallbackError: (error: Error) => void;  // callback for snapshot errors
  onSnapshotCallbackRemoved: (snapshot: T) => void;  // callback when a snapshot is removed
  onSnapshotCallbackAdded: (snapshot: T) => void;  // callback when a snapshot is added
  onSnapshotCallbackScheduled: (time: Date) => void;  // callback for scheduled snapshot actions
  onDisconnectingCallbacks: Array<() => void>;  // assuming it's an array of disconnecting callbacks
  onDisconnectCallback: () => void;  // single disconnect callback
  onDisconnectCallbackError: (error: Error) => void;  // callback for disconnect errors
  onDisconnectCallbackRemoved: () => void;  // callback when a disconnect is removed
  onDisconnectCallbackAdded: () => void;  // callback when a disconnect is added
  onDisconnectCallbackScheduled: (time: Date) => void;  // callback for scheduled disconnect actions
  onReconnectingCallbacks: Array<() => void>;  // array of reconnecting callbacks
  onReconnectCallback: () => void;  // single reconnect callback
  onReconnectCallbackError: (error: Error) => void;  // callback for reconnect errors
  onReconnectCallbackRemoved: () => void;  // callback when a reconnect is removed
  onReconnectCallbackAdded: () => void;  // callback when a reconnect is added
  onReconnectCallbackScheduled: (time: Date) => void;  // callback for scheduled reconnect actions
  onErrorCallbacks: Array<(error: Error) => void>;  // array of error callbacks
  onUnsubscribeCallbacks: Array<() => void>;  // array of unsubscribe callbacks
  state: string;  // assuming state is a string representing the current state
  notifyEventSystem: (eventType: string, eventData: any, source: string, event: Event) => void;  // assuming it's a function to notify the event system
  updateProjectState: ( stateType: ProjectStateEnum,
    projectId: string,
    newState: Project,
    content: Content<T, K>,
    state: object
  ) => void;  // function to update project state
  logActivity: ({ activityType, action, userId, date, snapshotId, description, data, }: LogActivityParams) => void;  // function to log activities
  triggerIncentives: ({ userId, incentiveType, params, }: TriggerIncentivesParams) => void;  // function to trigger incentives
  name: string;  // name of the subscription
  data: T;  // generic data, should be of type T
  email: string;  // email address for notifications
  subscribe: () => void;  // function to handle subscribe action
  value: number;  // value associated with the subscription
  category: string;  // category for filtering subscriptions
  unsubscribe: (
    subscriberId: string,
    unsubscribeDetails: {
      userId: string; 
      snapshotId: string; 
      unsubscribeType: string; 
      unsubscribeDate: Date; 
      unsubscribeReason: string; 
      unsubscribeData: any;
    },
    callback: Callback<Snapshot<SnapshotContainerData<T, K, ExcludedFields>,
    SnapshotContainerData<T, K, ExcludedFields>>> | null
  ) => void;  // function to handle unsubscribe action
  toSnapshotStore: (snapshot: T) => void;  // function to handle snapshot storage
  getId: () => string;  // function to get the ID
  getUserId: () => string;  // function to get the user ID
  receiveSnapshot: (snapshot: T) => void;  // function to handle receiving a snapshot
  getState: () => string;  // function to get the current state
  onError: (error: Error) => void;  // function to handle errors
  triggerError: (error: Error) => void;  // function to trigger errors
  onUnsubscribe: () => void;  // callback when unsubscribed
  onSnapshot: (snapshot: T) => void;  // callback when a snapshot is received
  triggerOnSnapshot: (snapshot: T) => void;  // function to trigger snapshot actions
  subscriber: Subscriber<T, K> | undefined;  // specific Subscriber type, can be undefined
  message?: string;  // optional message property
  subscriberId: string;  // subscriber ID
  type?: "info" | "success" | "error" | "warning";  // type for message categorization
}



export const SubscriptionActions = <
  T extends BaseData<any> = BaseData<any, any>,
  K extends T & CustomSnapshotData<T, K, Meta> = T & CustomSnapshotData<T, T>,
  Meta extends StructuredMetadata<T, any> = StructuredMetadata<T, any>,
>() => {
  const actions = {
    // Action to add a new subscriber
    subscribe: createAction<SubscriptionPayload<T, K>>("subscribe"),

    // Action to remove a subscriber
    unsubscribe: createAction<string>("unsubscribe"),

    // Action to fetch initial subscriptions
    fetchInitialSubscriptions: createAction("fetchInitialSubscriptions"),

    // Action to handle successful subscription
    subscriptionSuccess: createAction<string>("subscriptionSuccess"),

    // Action to handle failed subscription
    subscriptionFailure: createAction<string>("subscriptionFailure"),
  };

  return actions as {
    subscribe: ActionCreatorWithPayload<SubscriptionPayload<T, K>>;
    unsubscribe: ActionCreatorWithPayload<string>;
    fetchInitialSubscriptions: ActionCreatorWithoutPayload;
    subscriptionSuccess: ActionCreatorWithPayload<string>;
    subscriptionFailure: ActionCreatorWithPayload<string>;
  };
}


export const createSubscriptionPayload = <T extends BaseData<any>, K extends T = T>(
  overrides: Partial<SubscriptionPayload<T, K>> = {}
): SubscriptionPayload<T, K> => {

  return {
    error: undefined,
    email: "default@example.com", // Default value for email
    value: 0,
    category: category,
    meta: {
      name: "Subscription Notification",
      timestamp: new Date(),
      type: NotificationTypeEnum.Info,
      startDate: new Date(),
      endDate: new Date(),
      status: "ACTIVE",
      id: "sub_001",
      isSticky: true,
      isDismissable: false,
      isClickable: true,
      isClosable: true,
      isAutoDismiss: false,
      isAutoDismissable: true,
      isAutoDismissOnNavigation: true,
      isAutoDismissOnAction: false,
      isAutoDismissOnTimeout: false,
      isAutoDismissOnTap: true,
      optionalData: {} as K,
      data: {} as T,
    },
    notify: (message: string) => console.log(message),
    id: "sub_001",
    content: "",
    date: new Date(),
    subscribers: [],
    subscription: { active: true, plan: "Premium" },
    onSnapshotCallbacks: [],
    onSnapshotCallback: (snapshot) => console.log("Snapshot received:", snapshot),
    onSnapshotCallbackError: (error) => console.error("Error in snapshot:", error),
    onSnapshotCallbackRemoved: (snapshot) => console.log("Snapshot removed:", snapshot),
    onSnapshotCallbackAdded: (snapshot) => console.log("Snapshot added:", snapshot),
    onSnapshotCallbackScheduled: (time) => console.log("Snapshot scheduled for:", time),
    onDisconnectingCallbacks: [],
    onDisconnectCallback: () => console.log("Disconnected"),
    onDisconnectCallbackError: (error) => console.error("Disconnect error:", error),
    onDisconnectCallbackRemoved: () => console.log("Disconnect callback removed"),
    onDisconnectCallbackAdded: () => console.log("Disconnect callback added"),
    onDisconnectCallbackScheduled: (time) => console.log("Disconnect scheduled for:", time),
    onReconnectingCallbacks: [],
    onReconnectCallback: () => console.log("Reconnected"),
    onReconnectCallbackError: (error) => console.error("Reconnect error:", error),
    onReconnectCallbackRemoved: () => console.log("Reconnect callback removed"),
    onReconnectCallbackAdded: () => console.log("Reconnect callback added"),
    onReconnectCallbackScheduled: (time) => console.log("Reconnect scheduled for:", time),
    onErrorCallbacks: [],
    onUnsubscribeCallbacks: [],
    state: "active",
    notifyEventSystem: (event) => console.log("Event:", event),
    updateProjectState: (state) => console.log("Project state updated:", state),
    logActivity: (activity) => console.log("Activity logged:", activity),
    triggerIncentives: () => console.log("Incentives triggered"),
    name: "User Subscription",
    data: {} as T,  // Placeholder for T
    subscribe: () => console.log("Subscribed"),
    unsubscribe: () => console.log("Unsubscribed"),
    toSnapshotStore: (snapshot) => console.log("Snapshot stored:", snapshot),
    getId: () => "sub_001",
    getUserId: () => "user_001",
    receiveSnapshot: (snapshot) => console.log("Received snapshot:", snapshot),
    getState: () => "active",
    onError: (error) => console.error("Error:", error),
    triggerError: (error) => console.error("Error triggered:", error),
    onUnsubscribe: () => console.log("Unsubscribed"),
    onSnapshot: (snapshot) => console.log("Snapshot:", snapshot),
    triggerOnSnapshot: (snapshot) => console.log("Triggered snapshot:", snapshot),
    subscriber: undefined,
    message: "Welcome to your subscription",
    subscriberId: "user_001",
    type: "info",
    ...overrides,
  }
};

export type { SubscriptionPayload };
