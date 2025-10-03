import { BaseCustomEvent, CustomEventExtension } from '@/app/components/event/BaseCustomEvent';
import { BaseEvent, CustomEventType, SystemEvent } from '@/app/components/event/BaseEvent';
import { Category } from '@/app/components/libraries/categories/generateCategoryProperties';
import { Snapshot } from "@/app/snapshots";
import { CoreSnapshot } from "@/app/snapshots/CoreSnapshot";
import { SnapshotOperationType } from "@/app/snapshots/SnapshotActions";
import SnapshotStore, { handleSnapshotEvent } from '@/app/snapshots/SnapshotStore';
import { SnapshotWithCriteria } from '@/app/snapshots/SnapshotWithCriteria';
import { EventAttendance } from '../calendar/AttendancePrediction';
import { EventManager } from '@/app/projects/DataAnalysisPhase/DataProcessing/DataStore';
import { SnapshotData } from "@/app/snapshots";
import { SnapshotEvents } from '@/app/snapshots/SnapshotEvents';
import { SubscriberCollection } from "@/app/users/SubscriberCollection";
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from "./BaseConfig";

interface SharedSnapshotEvent<
  T extends BaseDataEntity = BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = keyof T,
  IncludedFields extends keyof T = keyof T
> extends BaseEvent {
  snapshotId?: string | number | null;
  snapshotStore: SnapshotStore<T, K, Meta, ExcludedFields>
  error?: any
}

interface UserEvent<T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>
>
  extends BaseEvent, SharedSnapshotEvent<T, K, Meta, ExcludedFields> {
  eventType: "user";
  userId: string;
  action: string; // "login", "logout", "create_task", etc.
  metadata?: Record<string, any>; // Optional additional data about the action
}

interface TaskEvent<T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>
>
  extends BaseEvent, SharedSnapshotEvent<T, K, Meta, ExcludedFields> {
  eventType: "task";
  taskId: string;
  action: "create" | "update" | "complete" | "delete";
  userId: string; // Who performed the action
  changes?: Record<string, any>; // Details about what was changed
}

interface ProjectEvent<T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>
>
  extends BaseEvent, SharedSnapshotEvent<T, K, Meta, ExcludedFields> {
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
  ExcludedFields extends keyof T = DefaultExcludedFields<T>
>
  extends BaseEvent, SharedSnapshotEvent<T, K, Meta, ExcludedFields> {
  eventType: "error";
  errorCode: string;
  errorMessage: string;
  userId?: string; // Optional, if the error is user-related
}

interface IntegrationEvent<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>
>
  extends BaseEvent, SharedSnapshotEvent<T, K, Meta, ExcludedFields> {
  eventType: "integration";
  integrationId: string;
  action: "triggered" | "completed" | "failed";
  metadata?: Record<string, any>; // Details about the integration event
}

interface FileEvent<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>
>
  extends BaseEvent, SharedSnapshotEvent<T, K, Meta, ExcludedFields> {
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
  ExcludedFields extends keyof T = DefaultExcludedFields<T>
>
  extends BaseEvent, SharedSnapshotEvent<T, K, Meta, ExcludedFields> {
  eventType: "notification";
  notificationId: string;
  userId: string; // Recipient
  status: "sent" | "read" | "dismissed";
}

interface MilestoneEvent<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>
>
  extends BaseEvent, SharedSnapshotEvent<T, K, Meta, ExcludedFields> {
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
  ExcludedFields extends keyof T = DefaultExcludedFields<T>
>
  extends BaseEvent, SharedSnapshotEvent<T, K, Meta, ExcludedFields> {
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
  ExcludedFields extends keyof T = DefaultExcludedFields<T>
>
  extends BaseEvent, SharedSnapshotEvent<T, K, Meta, ExcludedFields> {
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
  ExcludedFields extends keyof T = DefaultExcludedFields<T>
> =
  | {
    type: "snapshotAdded" | "snapshotUpdated" | "snapshotRemoved";
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
    snapshotStore: SnapshotStore<T, K, Meta, ExcludedFields>;
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
    snapshotStore: SnapshotStore<T, K, Meta, ExcludedFields>;
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
  ExcludedFields extends keyof T = DefaultExcludedFields<T>
> = SnapshotEvents<T, K> & {
  type?: string;
  snapshotId?: string | number | null;
  snapshotStore?: SnapshotStore<T, K, Meta, ExcludedFields>;
  snapshot?: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
};

export type AllEvents<
  T extends BaseDataEntity,
  K extends T = T
> =
  | SnapshotEvent<T, K>
  | BaseCustomEvent
  | CustomEventExtension
  | SnapshotEvents<T, K>
  | EventAttendance
  | SystemEvent<T, K>
  | UserEvent<T, K>
  | TaskEvent<T, K>
  | ProjectEvent<T, K>
  | NotificationEvent<T, K>
  | MilestoneEvent<T, K>
  | FileEvent<T, K>
  | CommentEvent<T, K>
  | MeetingEvent<T, K>
  | IntegrationEvent<T, K>
  | ErrorEvent<T, K>
  | CustomEventType<T, K>
  | ExtendedSnapshotEvents<T, K>;


function isEventAttendance<
  T extends BaseDataEntity,
  K extends T = T
>(
  event: AllEvents<T, K>
): event is EventAttendance {
  return 'eventType' in event && event.eventType === "attendance";
}

function isSystemEvent<
  T extends BaseDataEntity,
  K extends T = T
>(
  event: AllEvents<T, K>
): event is SystemEvent<T, K> {
  return 'eventType' in event && event.eventType === "system";
}



function isTaskEvent<T extends BaseDataEntity,
  K extends T = T
>(
  event: SnapshotEvent<T, K>
): event is SnapshotEvent<T, K> & { category: "Task" } {
  return event.category === "Task";
}



// Universal event handler
function handleEvent<T extends BaseDataEntity,
  K extends T = T
>(
  event: SnapshotEvent<T, K>,
  coreSnapshot: CoreSnapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  subscribers: SubscriberCollection<T, K>,
  snapshotData: SnapshotData<T, K>,
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


function isEventManager<T extends BaseDataEntity,
  K extends T = T
>(
  obj: any
): obj is EventManager<T, K> {
  return obj && Array.isArray(obj.eventRecords);
}


function isSnapshotEvent<T extends BaseDataEntity,
  K extends T = T
>(
  event: AllEvents<T, K>
): event is SnapshotEvent<T, K> {
  if (event.type) {
    return event.type.startsWith("snapshot");
  }
  return false;
}

function isCustomEvent<T extends BaseDataEntity,
  K extends T = T
>(
  event: AllEvents<any>
): event is CustomEventType<T, K> {
  return 'eventType' in event;
}

export { handleEvent, isCustomEvent, isEventAttendance, isEventManager, isSnapshotEvent, isSystemEvent, isTaskEvent };

    export type { BaseEvent, SharedSnapshotEvent };

