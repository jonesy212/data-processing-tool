// Payload.ts
import { CalendarEvent } from '@/app/components/calendar/CalendarEvent';
import { SnapshotActions } from '@/app/components/snapshots/SnapshotActions';
import { useNotification } from '@/app/components/support/NotificationContext';
import { addToSnapshotList, category } from '@/app/components/utils/snapshotUtils';
import { StructuredMetadata } from "@/app/configs/StructuredMetadata";
import { LiveEvent } from '@refinedev/core';
import { useDispatch } from 'react-redux';
import { SubscriptionPayload } from "../actions/SubscriptionActions";
import useSubscription from '../hooks/useSubscription';
import { Category } from "../libraries/categories/generateCategoryProperties";
import { SnapshotLogger } from '../logging/Logger';
import { BaseData, Data } from "../models/data/Data";
import { K, T } from '../models/data/dataStoreMethods';
import { StatusType } from "../models/data/StatusType";
import { RealtimeDataItem } from "../models/realtime/RealtimeData";
import { Snapshot } from "../snapshots/LocalStorageSnapshotStore";
import { AllStatus } from "../state/stores/DetailsListStore";
import { NotificationTypeEnum } from "../support/NotificationContext";
import { Subscriber } from "../users/Subscriber";
import { logActivity, notifyEventSystem, triggerIncentives, updateProjectState } from '../utils/applicationUtils';
import * as subscriptionApi from "./../../api/subscriberApi";


interface ExtendedBaseDataPayload<T extends  BaseData<any>,  K extends T = T, Meta extends {} = StructuredMetadata<T, K>> extends BaseData<T, K, Meta> {
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
      optionalData: any;
      data: any;
    } | undefined
  }
  
  interface CreateSnapshotsPayload<T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>> {
    data: Map<string, Snapshot<T, K>>;
    events: Record<string, CalendarEvent<T, K>[]>;
    dataItems: RealtimeDataItem[];
    newData: Snapshot<T, K>;
    category?: string | symbol | Category;
  }
  
  
  interface CreateSnapshotStoresPayload <T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>> {
    snapshotId: string;
    title: string;
    description: string;
    createdAt: Date | undefined;
    updatedAt: Date | undefined;
    status: "active" | "inactive" | "archived";
    category: string;
    data: T | Map<string, Snapshot<T, K>> | null | undefined;
    events: Record<string, CalendarEvent<T, K>[]>;
    dataItems: RealtimeDataItem[];
    newData: Snapshot<T, K>;
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
    snapshots: Map<string, Snapshot<T, K>>; // Adding snapshots
  }
  
  
  interface UpdateSnapshotPayload<T> extends Payload {
    snapshotId: Promise<string | number | undefined> | null;
    title: string;
    description: string;
    newData: T;
    createdAt: Date | undefined;
    updatedAt: Date | undefined;
    status: StatusType | undefined,
    category: string;
  }
  


const { notify } = useNotification()
const subscribers = await subscriptionApi.getSubscribersAPI()
const { setSnapshots } = SnapshotActions<T, K<T>>();

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

    const dispatch = useDispatch();
    const snapshot = payload.data;

    // Determine the type of operation based on the scenario (e.g., replacing or appending)
    const isAppendingSnapshot = true; // This can be set based on your app's logic
    const snapshotsArray = [snapshot]; // Single snapshot to be added

    if (isAppendingSnapshot) {
      // Conditionally dispatch based on the expected behavior of setSnapshots
      dispatch(setSnapshots((prevSnapshots) => [...prevSnapshots, ...snapshotsArray]));
    } else {
      // If we're replacing the entire snapshot list, just dispatch the new snapshots
      dispatch(setSnapshots(snapshotsArray)); 
    }

    // If you need to update the snapshot list with subscribers
    addToSnapshotList(snapshot, subscribers); 
  },
  enabled: true, // Enable subscription
});



  const payload: Partial<SubscriptionPayload<Data<any>>> = {
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
  
  export type { CreateSnapshotsPayload, CreateSnapshotStoresPayload, ExtendedBaseDataPayload, Payload, UpdateSnapshotPayload };

    export { payload };
