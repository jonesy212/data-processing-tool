// SubscriptionActions.ts
import { ActionCreatorWithoutPayload, ActionCreatorWithPayload, createAction } from "@reduxjs/toolkit";
import { Subscriber } from "../users/Subscriber";
import { Data } from "../models/data/Data";
import { CustomSnapshotData } from "../snapshots";

// Define the payload interface for subscription-related actions
interface SubscriptionPayload<T extends Data, K extends CustomSnapshotData> {
  notify: any;
  id: any;
  content: any;
  date: any;
  subscribers: any;
  subscription: any;
  onSnapshotCallbacks: any;
  onSnapshotCallback: any;
  onSnapshotCallbackError: any;
  onSnapshotCallbackRemoved: any;
  onSnapshotCallbackAdded: any;
  onSnapshotCallbackScheduled: any;
  onDisconnectingCallbacks: any;
  onDisconnectCallback: any;
  onDisconnectCallbackError: any;
  onDisconnectCallbackRemoved: any;
  onDisconnectCallbackAdded: any;
  onDisconnectCallbackScheduled: any;
  onReconnectingCallbacks: any;
  onReconnectCallback: any;
  onReconnectCallbackError: any;
  onReconnectCallbackRemoved: any;
  onReconnectCallbackAdded: any;
  onReconnectCallbackScheduled: any;
  onErrorCallbacks: any;
  onUnsubscribeCallbacks: any;
  state: any;
  notifyEventSystem: any;
  updateProjectState: any;
  logActivity: any;
  triggerIncentives: any;
  name: any;
  data: any;
  email: any;
  subscribe: any;
  value: any;
  category: any;
  unsubscribe: any;
  toSnapshotStore: any;
  getId: any;
  getUserId: any
  receiveSnapshot: any;
  getState: any;
  onError: any;
  triggerError: any;
  onUnsubscribe: any;
  onSnapshot: any;
  triggerOnSnapshot: any;
  subscriber: Subscriber<T, K> | undefined;
  message?: string;
  subscriberId: string;
  type?: "info" | "success" | "error" | "warning";
}


export const SubscriptionActions = <T extends Data, K extends CustomSnapshotData>() => {
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

export type { SubscriptionPayload };
