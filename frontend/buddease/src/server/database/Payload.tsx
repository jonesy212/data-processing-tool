// Payload.ts
import { SubscriptionPayload } from "@/app/actions/SubscriptionActions";
import addSnapshot from "@/app/api/SnapshotApi";
import * as subscriptionApi from "@/app/api/subscriberApi";
import { useNotification } from '@/app/context/NotificationContext';
import useSubscription from "@/app/hooks/useSubscription";
import { Category } from "@/app/libraries/categories/generateCategoryProperties";
import { SnapshotLogger } from "@/app/libraries/logging/Logger";
import { BaseData } from "@/app/models/data/Data";
import { StatusType } from "@/app/models/data/StatusType";
import { SnapshotActions } from "@/app/snapshots/SnapshotActions";
import { CustomSnapshotData } from "@/app/snapshots/SnapshotData";
import {
  addToSnapshotList,
  category,
} from "@/app/utils/snapshotUtils";
import {
  logActivity,
  notifyEventSystem,
  triggerIncentives,
  updateProjectState,
} from "@/app/utils/web3/applicationUtils";


import { StructuredMetadata } from "@/config/StructuredMetadata";
import { LiveEvent } from "@refinedev/core";
import { AppState } from "react-native";
import { useDispatch, useSelector } from "react-redux";

const { notify } = useNotification();
const subscribers = await subscriptionApi.getSubscribersAPI();
const { setSnapshots } = SnapshotActions<T, K>();
const { subscribe, unsubscribe } = useSubscription({
  channel: "your_channel_here",
  onLiveEvent: (event: LiveEvent) => {
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
      (state: AppState) => state.snapshots.snapshotsArray
    );

    const dispatch = useDispatch();

    // Determine the type of operation based on the scenario (e.g., replacing or appending)
    const isAppendingSnapshot = true; // This can be set based on your app's logic

    if (isAppendingSnapshot) {
      // Option 1: Use addSnapshot action if available (recommended)
      dispatch(addSnapshot(snapshot));

      // Option 2: Or use setSnapshots with the updated array
      // dispatch(setSnapshots([...currentSnapshots, snapshot]));
    } else {
      // If we're replacing the entire snapshot list
      dispatch(setSnapshots([snapshot]));
    }

    // If you need to update the snapshot list with subscribers
    addToSnapshotList(snapshot, subscribers);
  },
  enabled: true, // Enable subscription
});

const payload: Partial<
  SubscriptionPayload<
    BaseData<any>, // T
    BaseData<any>, // K (extends T)
    never, // ExcludedFields
    CustomSnapshotData<BaseData<any>, BaseData<any>>, // S
    StructuredMetadata<BaseData<any>, BaseData<any>> // Meta
  >
> = {
  id: "unique_id",
  subscriberId: "unique_id",
  email: "<EMAIL>",
  value: 100,
  category: category,
  notify: notify,
  notifyEventSystem: notifyEventSystem,
  updateProjectState: updateProjectState,
  logActivity: logActivity,
  triggerIncentives: triggerIncentives,
  subscribe: subscribe,
  unsubscribe: unsubscribe,
  // Optional properties are not required to be defined
};

export type {
  CreateSnapshotsPayload,
  CreateSnapshotStoresPayload,
  ExtendedBaseDataPayload,
  Payload,
  UpdateSnapshotPayload
};

  export { payload };

