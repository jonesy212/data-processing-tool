Payload.tsx
Payload.ts

import { SnapshotActions } from "@/core/actions/SnapshotActions";
import { SubscriptionPayload } from "@/core/actions/SubscriptionActions";
import addSnapshot from "@/core/api/SnapshotApi";
import * as subscriptionApi from "@/core/api/subscriberApi";
import useSubscription from "@/core/hooks/useSubscription";
import { SnapshotLogger } from "@/core/logging/Logger";
import { useNotification } from "@/core/state/context/NotificationContext";
import { AppState } from "@/core/state/redux/slices/AppSlice";
import { AppEntity } from "@/core/typings/entities/AppEntity";
import { SnapshotEntity, SnapshotK } from "@/core/typings/entities/SnapshotEntity";
import { SubscriptionEntityTemplate } from "@/core/typings/entities/SubscriptionEntity";
import { addToSnapshotList } from "@/utils/snapshotUtils";
import { LiveEvent } from "@refinedev/core";
import { useDispatch, useSelector } from "react-redux";

const { notify } = useNotification();
const subscribers = await subscriptionApi.getSubscribersAPI();
const { setSnapshots } = SnapshotActions<SnapshotEntity, SnapshotK>();

const { subscribe, unsubscribe } = useSubscription({
  channel: "your_channel_here",
  onLiveEvent: async (event: LiveEvent) => {
    const payload = event.payload;

    // Handle errors in the payload
    if (payload.error) {
      const errorLogType = "Error";
      const errorMessage = `Received error in payload: ${payload.error}`;
      SnapshotLogger.log(errorLogType, errorMessage);
      return;
    }

    // Log the payload
    const payloadLogType = "Payload";
    const payloadMessage = "Received new snapshot payload";
    SnapshotLogger.log(payloadLogType, payloadMessage, payload);

    const snapshot = payload.data;

    // Get current snapshots from Redux store
    const currentSnapshots = useSelector(
      (state: AppState<AppEntity>) => state.snapshots.snapshotsArray
    );

    const dispatch = useDispatch();

    // Determine the type of operation based on the scenario
    const isAppendingSnapshot = true;

    try {
      if (isAppendingSnapshot) {
        // ✅ Clean, direct API call - perfect for real-time
        const result = await addSnapshot(snapshot);
        console.log("Snapshot added successfully:", result);

        // Option 1: If you need to update Redux store after successful API call
        dispatch(setSnapshots([...currentSnapshots, result]));

        // Option 2: Or let the subscription service handle updates via the API response
        // The notify in addSnapshot API will likely trigger updates
      } else {
        // If we're replacing the entire snapshot list
        dispatch(setSnapshots([snapshot]));
      }

      // If you need to update the snapshot list with subscribers
      addToSnapshotList(snapshot, subscribers);
    } catch (error) {
      console.error("Failed to add snapshot:", error);
      SnapshotLogger.log("Error", "Failed to process snapshot", error);

      // Optional: Show user notification
      notify({
        type: "error",
        message: "Failed to save snapshot",
        description: "Please try again later",
      });
    }
  },
  enabled: true, // Enable subscription
});

// ------------------------------
6️⃣ Example SubscriptionPayload using the template
// ------------------------------
const payload: SubscriptionPayload<
  SubscriptionEntityTemplate["T"]
  > = {
  error: undefined,
  meta: subscriptionData.meta,
  notify: (id, message, content, date, type, notificationPosition) => {
    console.log("Notification:", {
      id,
      message,
      content,
      date,
      type,
      notificationPosition,
    });
  },
  id: "payload-001",
  content: "Subscription payload content",
  date: new Date(),
  subscribers: [],
  subscription: subscriptionData.subscription,
  onSnapshotCallbacks: [],
  onSnapshotCallback: (snapshot) => console.log("Snapshot:", snapshot),
  onSnapshotCallbackError: (error) => console.error("Snapshot error:", error),
  onSnapshotCallbackRemoved: (snapshot) =>
    console.log("Snapshot removed:", snapshot),
  onSnapshotCallbackAdded: (snapshot) =>
    console.log("Snapshot added:", snapshot),
  onSnapshotCallbackScheduled: (time) =>
    console.log("Snapshot scheduled:", time),
  onDisconnectingCallbacks: [],
  onDisconnectCallback: () => console.log("Disconnected"),
  onDisconnectCallbackError: (error) =>
    console.error("Disconnect error:", error),
  onDisconnectCallbackRemoved: () => console.log("Disconnect removed"),
  onDisconnectCallbackAdded: () => console.log("Disconnect added"),
  onDisconnectCallbackScheduled: (time) =>
    console.log("Disconnect scheduled:", time),
  onReconnectingCallbacks: [],
  onReconnectCallback: () => console.log("Reconnected"),
  onReconnectCallbackError: (error) => console.error("Reconnect error:", error),
  onReconnectCallbackRemoved: () => console.log("Reconnect removed"),
  onReconnectCallbackAdded: () => console.log("Reconnect added"),
  onReconnectCallbackScheduled: (time) =>
    console.log("Reconnect scheduled:", time),
  onErrorCallbacks: [],
  onUnsubscribeCallbacks: [],
  state: "active",
  notifyEventSystem: (eventType, eventData, source, event) => {
    console.log("Event system notified:", {
      eventType,
      eventData,
      source,
      event,
    });
  },
  updateProjectState: (stateType, projectId, newState, content, state) => {
    console.log("Project state updated:", {
      stateType,
      projectId,
      newState,
      content,
      state,
    });
  },
  logActivity: (params) => console.log("Activity logged:", params),
  triggerIncentives: (params) => console.log("Incentives triggered:", params),
  name: "Subscription Payload",
  data: subscriptionData,
  email: "user@example.com",
  subscribe: () => console.log("Subscribed"),
  value: 99.99,
  category: {
    name: "Premium",
    id: "cat-premium",
    type: "subscription",
    description: "Premium subscription category",
    icon: "premium",
    color: "#FFD700",
    iconColor: "#FFD700",
    isActive: true,
    isPublic: false,
    isSystem: true,
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
    brandName: "Premium",
    brandLogo: "",
    brandColor: "#FFD700",
    brandMessage: "Premium subscription features",
    chartType: "bar",
    dataProperties: [],
    formFields: []
  },
  unsubscribe: (subscriberId, unsubscribeDetails, callback) => {
    console.log("Unsubscribed:", {
      subscriberId,
      unsubscribeDetails,
      callback,
    });
  },
  toSnapshotStore: (snapshot) =>
    console.log("Stored in snapshot store:", snapshot),
  getId: () => "payload-001",
  getUserId: () => "user-123",
  receiveSnapshot: (snapshot) => console.log("Received snapshot:", snapshot),
  getState: () => "active",
  onError: (error) => console.error("Error:", error),
  triggerError: (error) => console.error("Triggered error:", error),
  onUnsubscribe: () => console.log("Unsubscribed callback"),
  onSnapshot: (snapshot) => console.log("Snapshot callback:", snapshot),
  triggerOnSnapshot: (snapshot) => console.log("Triggered snapshot:", snapshot),
  subscriber: undefined,
  message: "Subscription payload message",
  subscriberId: "sub-12345",
  type: "success",
};

export { payload };
