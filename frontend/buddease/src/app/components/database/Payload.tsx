// Payload.ts
import { Category } from "../libraries/categories/generateCategoryProperties";
import { BaseData, Data } from "../models/data/Data";
import { StatusType } from "../models/data/StatusType";
import { RealtimeDataItem } from "../models/realtime/RealtimeData";
import { Snapshot } from "../snapshots/LocalStorageSnapshotStore";
import CalendarEvent from "../state/stores/CalendarEvent";
import { AllStatus } from "../state/stores/DetailsListStore";
import { NotificationTypeEnum } from "../support/NotificationContext";
import { Subscriber } from "../users/Subscriber";


interface ExtendedBaseDataPayload extends BaseData {
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
  
  
  interface CreateSnapshotsPayload<T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T> {
    data: Map<string, Snapshot<T, Meta, K>>;
    events: Record<string, CalendarEvent<T, Meta, K>[]>;
    dataItems: RealtimeDataItem[];
    newData: Snapshot<T, Meta, K>;
    category?: string | symbol | Category;
  }
  
  
  interface CreateSnapshotStoresPayload <T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T> {
    snapshotId: string;
    title: string;
    description: string;
    createdAt: Date | undefined;
    updatedAt: Date | undefined;
    status: "active" | "inactive" | "archived";
    category: string;
    data: T | Map<string, Snapshot<T, Meta, K>> | null | undefined;
    events: Record<string, CalendarEvent<T, Meta, K>[]>;
    dataItems: RealtimeDataItem[];
    newData: Snapshot<T, Meta, K>;
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
    subscribers: Subscriber<T, Meta, K>[]; // Adding subscribers
    snapshots: Map<string, Snapshot<T, Meta, K>>; // Adding snapshots
  }
  
  
  interface UpdateSnapshotPayload<T> {
    snapshotId: Promise<string | number | undefined> | null;
    title: string;
    description: string;
    newData: T;
    createdAt: Date | undefined;
    updatedAt: Date | undefined;
    status: StatusType | undefined,
    category: string;
  }
  
  
  export type { CreateSnapshotsPayload, CreateSnapshotStoresPayload, ExtendedBaseDataPayload, Payload, UpdateSnapshotPayload };

