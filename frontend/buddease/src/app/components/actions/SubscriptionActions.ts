// SubscriptionActions.ts
import { createAction } from "@reduxjs/toolkit";
import { Subscriber } from "../users/Subscriber";
import { CustomSnapshotData } from "../snapshots/LocalStorageSnapshotStore";

// Define the payload interface for subscription-related actions
interface SubscriptionPayload {
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
  subscriber: Subscriber<CustomSnapshotData> | undefined;
  message?: string;
  subscriberId: string;
  type?: "info" | "success" | "error" | "warning";
}

// Define the actions for subscription management
export const SubscriptionActions = {
  // Action to add a new subscriber
  subscribe: createAction<SubscriptionPayload>("subscribe"),

  // Action to remove a subscriber
  unsubscribe: createAction<string>("unsubscribe"), // Assuming you're passing the subscriber ID

  // Action to fetch initial subscriptions
  fetchInitialSubscriptions: createAction<void>("fetchInitialSubscriptions"),

  // Action to handle successful subscription
  subscriptionSuccess: createAction<string>("subscriptionSuccess"),

  // Action to handle failed subscription
  subscriptionFailure: createAction<string>("subscriptionFailure"),
};
export type { SubscriptionPayload };
