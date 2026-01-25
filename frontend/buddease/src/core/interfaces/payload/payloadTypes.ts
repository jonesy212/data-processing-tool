// payloadTypes.ts
import type { CalendarEvent } from "@/core/calendar/CalendarEvent";
import type { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
    BaseDataEntity,
    DefaultExcludedFields,
    DefaultMeta,
} from '@/core/config/BaseConfig';
import type { Attachment } from '@/core/documents/attachment/Attachment';
import type { NotificationType } from '@/core/features/support/UnifiedNotificationTypes';
import { Category } from '@/core/libraries/categories/generateCategoryProperties';
import type { BaseData } from "@/core/models/data/Data";
import type { StatusType } from "@/core/models/data/StatusType";
import type { Snapshot } from '@/core/snapshots/Snapshot';
import CalendarManagerStoreClass from "@/core/state/stores/CalendarManagerStore";
import type { AllStatus } from "@/core/state/stores/DetailsListStore";
import { Subscriber } from "@/core/subscribers/Subscriber";
import { RealtimeDataItem } from "@/core/typings/realtimeTypes";


interface ExtendedBaseDataPayload<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> extends BaseData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  meta?: {
    name: string;
    timestamp: Date;
    type: NotificationType;
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
        type: NotificationType;
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
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {
  data: Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>;
  events: Record<string, CalendarEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>;
  dataItems: RealtimeDataItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
  newData: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  category?: Category;
}

interface CreateSnapshotStoresPayload<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {
  snapshotId: string;
  title: string;
  description: string;
  createdAt: Date | undefined;
  updatedAt: Date | undefined;
  status: "active" | "inactive" | "archived";
  category: string;
  data: T | Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> | null | undefined;
  events: Record<string, CalendarEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>;
  dataItems: RealtimeDataItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
  newData: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  metadata: any;
  id: string; 
  key: string; 
  topic: string; 
  date: Date; 
  message: string; 
  timestamp: number; 
  createdBy: string; 
  eventRecords: Record<string, CalendarManagerStoreClass<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>,
  type: string; 
  subscribers: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]; // Adding subscribers
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


export type {
    CreateSnapshotsPayload, CreateSnapshotStoresPayload, ExtendedBaseDataPayload, Payload,
    UpdateSnapshotPayload
};

