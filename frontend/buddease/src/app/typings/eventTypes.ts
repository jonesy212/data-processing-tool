import { BaseEvent, CustomEventType, SystemEvent } from '@/app/components/event/BaseEvent';
import { CoreSnapshot } from "@/app/components/snapshots/CoreSnapshot";

import { BaseCustomEvent, CustomEventExtension } from '@/app/components/event/BaseCustomEvent';
import { Category } from '@/app/components/libraries/categories/generateCategoryProperties';
import { BaseData } from '@/app/components/models/data/Data';
import { Snapshot } from "@/app/components/snapshots/LocalStorageSnapshotStore";
import SnapshotStore, { handleSnapshotEvent } from '@/app/components/snapshots/SnapshotStore';
import { SnapshotWithCriteria } from '@/app/components/snapshots/SnapshotWithCriteria';
import { EventAttendance } from '../components/calendar/AttendancePrediction';
import { SnapshotData } from "../components/snapshots";
import { SnapshotEvents } from '../components/snapshots/SnapshotEvents';
import { SubscriberCollection } from "../components/users/SubscriberCollection";
import { EventManager } from '../components/projects/DataAnalysisPhase/DataProcessing/DataStore';



interface SharedSnapshotEvent<T extends BaseData<any>, K extends T = T> extends BaseEvent {
    snapshotId?: string | number | null;
    snapshotStore: SnapshotStore<T, K>
    error?: any
  }

  
interface UserEvent<T extends BaseData<any>, K extends T = T>
    extends BaseEvent, SharedSnapshotEvent<T, K> {
    eventType: "user";
    userId: string;
    action: string; // "login", "logout", "create_task", etc.
    metadata?: Record<string, any>; // Optional additional data about the action
}

interface TaskEvent <T extends BaseData<any>, K extends T = T>
    extends BaseEvent, SharedSnapshotEvent<T, K> {
    eventType: "task";
    taskId: string;
    action: "create" | "update" | "complete" | "delete";
    userId: string; // Who performed the action
    changes?: Record<string, any>; // Details about what was changed
}


interface ProjectEvent <T extends BaseData<any>, K extends T = T>
    extends BaseEvent, SharedSnapshotEvent<T, K> {
    eventType: "project";
    projectId: string;
    action: "create" | "update" | "archive" | "delete";
    userId: string;
    changes?: Record<string, any>;
}


interface ErrorEvent <T extends BaseData<any>, K extends T = T>
    extends BaseEvent, SharedSnapshotEvent<T, K> {
    eventType: "error";
    errorCode: string;
    errorMessage: string;
    userId?: string; // Optional, if the error is user-related
}


interface IntegrationEvent <T extends BaseData<any>, K extends T = T>
    extends BaseEvent, SharedSnapshotEvent<T, K> {
    eventType: "integration";
    integrationId: string;
    action: "triggered" | "completed" | "failed";
    metadata?: Record<string, any>; // Details about the integration event
}

interface FileEvent <T extends BaseData<any>, K extends T = T>
    extends BaseEvent, SharedSnapshotEvent<T, K> {
    eventType: "file";
    fileId: string;
    action: "upload" | "download" | "edit" | "delete";
    userId: string;
    fileName: string;
}

interface NotificationEvent <T extends BaseData<any>, K extends T = T>
    extends BaseEvent, SharedSnapshotEvent<T, K> {
    eventType: "notification";
    notificationId: string;
    userId: string; // Recipient
    status: "sent" | "read" | "dismissed";
}


interface MilestoneEvent <T extends BaseData<any>, K extends T = T>
    extends BaseEvent, SharedSnapshotEvent<T, K> {
    eventType: "milestone";
    milestoneId: string;
    projectId: string;
    status: "created" | "achieved" | "updated";
    userId: string;
    description?: string; // Optional milestone description
}


interface CommentEvent <T extends BaseData<any>, K extends T = T>
    extends BaseEvent, SharedSnapshotEvent<T, K> {
    eventType: "comment";
    commentId: string;
    relatedEntityId: string; // Could be taskId, projectId, or fileId
    action: "create" | "delete";
    userId: string;
    content?: string; // Comment content
}


interface MeetingEvent <T extends BaseData<any>, K extends T = T>
    extends BaseEvent, SharedSnapshotEvent<T, K> {
    eventType: "meeting";
    meetingId: string;
    action: "schedule" | "update" | "cancel";
    organizerId: string;
    attendees: string[]; // List of attendee IDs
}

export type SnapshotEvent<T extends BaseData<any>, K extends T = T> =
    | {
        type: "snapshotAdded" | "snapshotUpdated" | "snapshotRemoved";
        snapshot: Snapshot<T, K>;
        snapshotStore: SnapshotStore<T, K>;
        criteria: SnapshotWithCriteria<T, K>;
        category: Category;
        snapshotId?: string | number | null;
    }
    | {
        type: "error";
        error: Error;
        snapshot: Snapshot<T, K>;
        snapshotStore: SnapshotStore<T, K>;
        criteria: SnapshotWithCriteria<T, K>;
        category: Category;
        snapshotId?: string | number | null;
    };


export type AllEvents<T extends BaseData<any>, K extends T = T> =
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
    | CustomEventType<T, K>;


function isEventAttendance<T extends BaseData<any>, K extends T = T>(
    event: AllEvents<T, K>
): event is EventAttendance {
    return 'eventType' in event && event.eventType === "attendance";
}

function isSystemEvent<T extends BaseData<any>, K extends T = T>(
    event: AllEvents<T, K>
): event is SystemEvent<T, K>{
    return 'eventType' in event && event.eventType === "system";
}



function isTaskEvent<T extends BaseData<any>, K extends T = T>(
    event: SnapshotEvent<T, K>
): event is SnapshotEvent<T, K> & { category: "Task" } {
    return event.category === "Task";
}



// Universal event handler
function handleEvent<T extends BaseData<any>, K extends T = T>(
    event: AllEvents<T, K>,
    coreSnapshot: CoreSnapshot<T, K>,
    snapshot: Snapshot<T, K>,
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
            if ("startDate" in event) {
                console.log(`Handling BaseCustomEvent: ${event.title}`);
            } else if ("bubbles" in event) {
                console.log("Handling CustomEventExtension");
            } else {
                console.log("Unknown event type");
            }
    }
}


function isEventManager<T extends BaseData<any>, K extends T = T>(
    obj: any
  ): obj is EventManager<T, K> {
    return obj && Array.isArray(obj.eventRecords);
}
  

function isSnapshotEvent<T extends BaseData<any>, K extends T = T>(
    event: AllEvents<T, K>
): event is SnapshotEvent<T, K> {
    if (event.type) {
        return event.type.startsWith("snapshot");
    }
    return false;
}

function isCustomEvent<T extends BaseData<any>, K extends T = T>(
    event: AllEvents<any>
): event is CustomEventType<T, K> {
    return 'eventType' in event;
}

export { handleEvent, isCustomEvent, isEventManager, isEventAttendance, isSnapshotEvent, isSystemEvent, isTaskEvent };

export type { BaseEvent, SharedSnapshotEvent };
