// EventUtils.ts
import { EventAttendance } from '@/core/components/calendar/AttendancePrediction';
import type { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import type { Attachment } from '@/core/documents/attachment/Attachment';
import { CustomEventType, SystemEvent } from '@/core/events/BaseEvent';


// Check if the event is a Task Event
function isTaskEvent<
  T extends BaseDataEntity, 
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(event: BaseEvent): event is TaskEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  return event.eventType === "task";
}

// Check if the event is a User Event
// Assuming UserEvent follows similar pattern
function isUserEvent<
  T extends BaseDataEntity, 
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(event: BaseEvent): event is UserEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  return event.eventType === "user";
}

// Check if the event is an Event Attendance Event
// EventAttendance might not need all these generic parameters
function isEventAttendance(event: BaseEvent): event is EventAttendance {
  return event.eventType === "attendance";
}

// Check if the event is a System Event
// Assuming SystemEvent follows similar pattern
function isSystemEvent<
  T extends BaseDataEntity, 
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(event: BaseEvent): event is SystemEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  return event.eventType === "system";
}

// Add type guard for CustomEventType
function isCustomEvent<
  T extends BaseDataEntity, 
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(event: BaseEvent): event is CustomEventType<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  return event.eventType === "custom";
}

export { isCustomEvent, isEventAttendance, isSystemEvent, isTaskEvent, isUserEvent };
