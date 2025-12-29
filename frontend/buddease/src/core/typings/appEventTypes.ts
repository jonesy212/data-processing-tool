// appEventTypes.ts
import { SnapshotOperationType } from "@/core/actions/SnapshotActions";
import { EventAttendance } from '@/core/components/calendar/AttendancePrediction';
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import { Attachment } from '@/core/documents/attachment/Attachment';
import { BaseCustomEvent, CustomEventExtension } from '@/core/events/BaseCustomEvent';
import { BaseEvent, CustomEventType, SystemEvent } from '@/core/events/BaseEvent';
import { Category } from '@/core/libraries/categories/generateCategoryProperties';
import { CoreSnapshot } from "@/core/snapshots/CoreSnapshot";
import { handleSnapshotEvent } from '@/core/snapshots/FetchableDataStore';
import { Snapshot, SnapshotData } from "@/core/snapshots/Snapshot";
import SnapshotStore from '@/core/snapshots/SnapshotStore';
import { SnapshotWithCriteria } from '@/core/snapshots/SnapshotWithCriteria';
import { EventManager } from '@/core/state/stores/DataStore';
import { SubscriberCollection } from "@/core/subscribers/SubscriberCollection";
import { SnapshotEvents } from '@/core/typings/snapshotTypes';

interface SharedSnapshotEvent<
  T extends BaseDataEntity = BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> extends BaseEvent {
  snapshotId?: string | number | null;
  snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  error?: any
}

interface UserEvent<
  T extends BaseDataEntity, 
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>
  extends BaseEvent, SharedSnapshotEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  eventType: "user";
  userId: string;
  action: string; // "login", "logout", "create_task", etc.
  metadata?: Record<string, any>; // Optional additional data about the action
}

interface TaskEvent<
  T extends BaseDataEntity, 
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>
  extends BaseEvent, SharedSnapshotEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  eventType: "task";
  taskId: string;
  action: "create" | "update" | "complete" | "delete";
  userId: string; // Who performed the action
  changes?: Record<string, any>; // Details about what was changed
}

interface ProjectEvent<
  T extends BaseDataEntity, 
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>
  extends BaseEvent, SharedSnapshotEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  eventType: "project";
  projectId: string;
  action: "create" | "update" | "archive" | "delete";
  userId: string;
  changes?: Record<string, any>;
}

interface ErrorEvent<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>
  extends BaseEvent, SharedSnapshotEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  eventType: "error";
  errorCode: string;
  errorMessage: string;
  userId?: string; // Optional, if the error is user-related
}

interface IntegrationEvent<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>
  extends BaseEvent, SharedSnapshotEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  eventType: "integration";
  integrationId: string;
  action: "triggered" | "completed" | "failed";
  metadata?: Record<string, any>; // Details about the integration event
}

interface FileEvent<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>
  extends BaseEvent, SharedSnapshotEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  eventType: "file";
  fileId: string;
  action: "upload" | "download" | "edit" | "delete";
  userId: string;
  fileName: string;
}

interface NotificationEvent<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>
  extends BaseEvent, SharedSnapshotEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  eventType: "notification";
  notificationId: string;
  userId: string; // Recipient
  status: "sent" | "read" | "dismissed";
}

interface MilestoneEvent<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>
  extends BaseEvent, SharedSnapshotEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  eventType: "milestone";
  milestoneId: string;
  projectId: string;
  status: "created" | "achieved" | "updated";
  userId: string;
  description?: string; // Optional milestone description
}

interface CommentEvent<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>
  extends BaseEvent, SharedSnapshotEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  eventType: "comment";
  commentId: string;
  relatedEntityId: string; // Could be taskId, projectId, or fileId
  action: "create" | "delete";
  userId: string;
  content?: string; // Comment content
}

interface MeetingEvent<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>
  extends BaseEvent, SharedSnapshotEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  eventType: "meeting";
  meetingId: string;
  action: "schedule" | "update" | "cancel";
  organizerId: string;
  attendees: string[]; // List of attendee IDs
}


export type SnapshotEvent<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> =
  | {
    type: "snapshotAdded" | "snapshotUpdated" | "snapshotRemoved";
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
    snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
    criteria: SnapshotWithCriteria<T, K>;
    category: Category;
    title?: string;
    snapshotId?: string | number | null;
    operationType?: SnapshotOperationType; // Add this
    categoryId?: string;    // Add this
  }
  | {
    type: "error";
    error: Error;
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
    snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
    criteria: SnapshotWithCriteria<T, K>;
    category: Category;
    title?: string;
    snapshotId?: string | number | null;
    operationType?: SnapshotOperationType; // Add this
    categoryId?: string;    // Add this
  };

type ExtendedSnapshotEvents<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> = SnapshotEvents<T, K> & {
  type?: string;
  snapshotId?: string | number | null;
  snapshotStore?: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  snapshot?: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
};

export type AllEvents<  
  T extends BaseDataEntity, 
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> =
  | SnapshotEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  | BaseCustomEvent
  | CustomEventExtension
  | SnapshotEvents<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  | EventAttendance
  | SystemEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  | UserEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  | TaskEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  | ProjectEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  | NotificationEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  | MilestoneEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  | FileEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  | CommentEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  | MeetingEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  | IntegrationEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  | ErrorEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  | CustomEventType<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  | ExtendedSnapshotEvents<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;


function isEventAttendance<  
  T extends BaseDataEntity, 
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  event: AllEvents<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
): event is EventAttendance {
  return 'eventType' in event && event.eventType === "attendance";
}

function isSystemEvent<  T
   extends BaseDataEntity, 
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  event: AllEvents<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
): event is SystemEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  return 'eventType' in event && event.eventType === "system";
}



function isTaskEvent<
  T extends BaseDataEntity, 
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  event: SnapshotEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
): event is SnapshotEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> & { category: "Task" } {
  return event.category === "Task";
}



// Universal event handler
function handleEvent<
  T extends BaseDataEntity, 
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  event: SnapshotEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  coreSnapshot: CoreSnapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  subscribers: SubscriberCollection<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  snapshotData: SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  snapshotId?: string | number | null,
): void {
  switch (event.type) {
    case "snapshotAdded":
    case "snapshotUpdated":
    case "snapshotRemoved":
      console.log(`Handling snapshot event: ${event.type}`);
      console.log(event.snapshotId, event.snapshotStore);

      // Pass the snapshot event to handleSnapshotEvent
      handleSnapshotEvent(
        coreSnapshot,
        event.type,
        snapshot,
        new Date(),
        snapshotData,
        subscribers,
        event.snapshotId,
      );
      break;

    case "error":
      if ('error' in event) {
        console.error("Error occurred:", event.error);
      } else {
        console.error("Unknown error event type", event);
      }
      break;

    default:
    // Cast to unknown first, then check for properties
    const unknownEvent = event as unknown;
    
    if (typeof unknownEvent === 'object' && unknownEvent !== null) {
        const eventObj = unknownEvent as Record<string, unknown>;
        
        if ('startDate' in eventObj) {
            // Type assertion for BaseCustomEvent
            const baseEvent = unknownEvent as BaseCustomEvent;
            console.log(`Handling BaseCustomEvent: ${baseEvent.title}`);
        } else if ('bubbles' in eventObj) {
            console.log("Handling CustomEventExtension");
        } else {
            console.log("Unknown event type");
        }
    } else {
        console.log("Unknown event type");
    }
  }
}


function isEventManager<
  T extends BaseDataEntity, 
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  obj: any
): obj is EventManager<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  return obj && Array.isArray(obj.eventRecords);
}


function isSnapshotEvent<
  T extends BaseDataEntity, 
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  event: AllEvents<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
): event is SnapshotEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  if (event.type) {
    return event.type.startsWith("snapshot");
  }
  return false;
}

function isCustomEvent<
  T extends BaseDataEntity, 
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  event: AllEvents<any, any, any, any, any, any>
): event is CustomEventType<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  return 'eventType' in event;
}

export { handleEvent, isCustomEvent, isEventAttendance, isEventManager, isSnapshotEvent, isSystemEvent, isTaskEvent };

    export type { BaseEvent, SharedSnapshotEvent };

