// Payload.ts
import { addSnapshot } from "@/app/api/SnapshotApi";
import { SubscriptionPayload } from "@/app/app/actions/SubscriptionActions";
import * as subscriptionApi from "@/app/app/api/subscriberApi";
import { Category } from "@/app/app/components/libraries/categories/generateCategoryProperties";
import { BaseData } from "@/app/app/components/models/data/Data";
import { K, T } from "@/app/app/components/models/data/dataStoreMethods";
import { StatusType } from "@/app/app/components/models/data/StatusType";
import { RealtimeDataItem } from "@/app/app/components/models/realtime/RealtimeData";
import { AllStatus } from "@/app/app/components/state/stores/DetailsListStore";
import useSubscription from "@/app/app/hooks/useSubscription";
import { CalendarEvent } from "@/app/calendar/CalendarEvent";
import { useNotification } from '@/app/context/NotificationContext';
import { SnapshotLogger } from "@/app/libraries/logging/Logger";
import { Snapshot } from '@/app/snapshots/Snapshot';
import { SnapshotActions } from "@/app/snapshots/SnapshotActions";
import { CustomSnapshotData } from "@/app/snapshots/SnapshotData";
import { Subscriber } from "@/app/subscribers/Subscriber";
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
import {
  BaseDataEntity,
  DefaultExcludedFields,
  DefaultMeta,
} from "@/config/BaseConfig";
import { StructuredMetadata } from "@/config/StructuredMetadata";
import { LiveEvent } from "@refinedev/core";
import { AppState } from "react-native";
import { useDispatch, useSelector } from "react-redux";

interface ExtendedBaseDataPayload<
  T extends BaseData<any>,
  K extends T = T,
  Meta extends {} = StructuredMetadata<T, K>
> extends BaseData<T, K, StructuredMetadata<T, K>> {
  meta?: {
    name: string;
    timestamp: Date;
    type: NotificationTypeEnum;
    startDate: Date;
    endDate: Date;
    status: AllStatus;
    id: string;
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
    optionalData: any;
    data: any;
  };
}

interface Payload {
  error: string | undefined;
  meta:
    | {
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
        optionalData: any;
        data: any;
      }
    | undefined;
}

interface CreateSnapshotsPayload<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>
> {
  data: Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>;
  events: Record<string, CalendarEvent<T, K>[]>;
  dataItems: RealtimeDataItem<T, K, Meta, ExcludedFields>[];
  newData: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  category?: Category;
}

interface CreateSnapshotStoresPayload<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>
> {
  snapshotId: string;
  title: string;
  description: string;
  createdAt: Date | undefined;
  updatedAt: Date | undefined;
  status: "active" | "inactive" | "archived";
  category: string;
  data: T | Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> | null | undefined;
  events: Record<string, CalendarEvent<T, K>[]>;
  dataItems: RealtimeDataItem<T, K, Meta, ExcludedFields>[];
  newData: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  metadata: any;
  id: string; // Adding id
  key: string; // Adding key
  topic: string; // Adding topic
  date: Date; // Adding date
  message: string; // Adding message
  timestamp: number; // Adding timestamp
  createdBy: string; // Adding createdBy
  eventRecords: Record<string, any>; // Adding eventRecords
  type: string; // Adding type
  subscribers: Subscriber<T, K>[]; // Adding subscribers
  snapshots: Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>; // Adding snapshots
}

interface UpdateSnapshotPayload<T> extends Payload {
  snapshotId: Promise<string | number | undefined> | null;
  title: string;
  description: string;
  newData: T;
  createdAt: Date | undefined;
  updatedAt: Date | undefined;
  status: StatusType | undefined;
  category: string;
}

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

