// CalendarEntity.ts
import { CalendarEvent } from '@/app/calendar/CalendarEvent';
import { Attendee } from "@/app/components/calendar/Attendee";
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from "@/app/config/BaseConfig";
import { Attachment } from '@/app/documents/attachment/Attachment';
import { defaultCategoryProperties } from '@/app/pages/personas/ScenarioBuilder';
import { Reminder } from '@/app/settings/Reminder';
import { SnapshotsArray } from '@/app/snapshots/LocalStorageSnapshotStore';
import type {  Snapshot } from '@/app/snapshots/Snapshot';
import { SnapshotConfigParams } from '@/app/snapshots/SnapshotConfigBuilder';
import { SnapshotData } from '@/app/snapshots/SnapshotData';
import SnapshotStore from "@/app/snapshots/SnapshotStore";
import { SnapshotStoreConfig } from "@/app/snapshots/SnapshotStoreConfig";
import { SnapshotWithCriteria } from "@/app/snapshots/SnapshotWithCriteria";
import { SubscriberCollection } from "@/app/subscribers/SubscriberCollection";
import { RealtimeDataItem } from "@/app/typings/realtimeTypes";


// 1. Unified Base Calendar Entity
export interface CalendarEntity extends BaseDataEntity {
  // Calendar-specific properties only
  title: string;
  startDate: Date;
  endDate: Date;
  location?: string;
  isAllDay?: boolean;
  recurrenceRule?: string;
  timeZone: string;
  attendees?: Attendee[];
  status: 'scheduled' | 'cancelled' | 'completed' | 'tentative';
  visibility: 'public' | 'private' | 'shared';
  
  // Sensitive calendar-specific fields
  organizerPersonalNotes?: string;
  internalMeetingId?: string;
  attendeeEmails?: string[];
  reminders?: Reminder[];
}

// 2. Sensitive fields that should never be exposed
type CalendarExcludedFields = 
  | DefaultExcludedFields<CalendarEntity> 
  | 'attendeeEmails'
  | 'organizerPersonalNotes'
  | 'internalMeetingId'
  | 'recurrenceRule' // Hide complex recurrence logic
  | 'reminders'; // Keep reminder logic internal

// 3. Only expose safe, public-facing fields by default
type CalendarIncludedFields = Exclude<keyof CalendarEntity, CalendarExcludedFields> & string;

// 4. Generic type definitions
export type CalendarK = CalendarEntity;
export type CalendarMeta = DefaultMeta<CalendarEntity, CalendarK>;
export type CalendarAttachment = Attachment;

// 5. Complete Calendar Event with all 6 parameters
export type CalendarEventEntity = CalendarEntity;

// 6. Parameters container
export type CalendarBaseParams = {
  T: CalendarEntity;
  K: CalendarK;
  Meta: CalendarMeta;
  AttachmentType: CalendarAttachment;
  ExcludedFields: CalendarExcludedFields;
  IncludedFields: CalendarIncludedFields;
};

// 7. Snapshot types 
export type CalendarSnapshot = Snapshot<CalendarEntity, CalendarK, CalendarMeta, CalendarAttachment, CalendarExcludedFields, CalendarIncludedFields>;
export type CalendarSnapshotData = SnapshotData<CalendarEntity, CalendarK, CalendarMeta, CalendarAttachment, CalendarExcludedFields, CalendarIncludedFields>;
export type CalendarSnapshotStore = SnapshotStore<CalendarEntity, CalendarK, CalendarMeta, CalendarAttachment, CalendarExcludedFields, CalendarIncludedFields>;
export type CalendarSnapshotWithCriteria = SnapshotWithCriteria<CalendarEntity, CalendarK, CalendarMeta, CalendarAttachment, CalendarExcludedFields, CalendarIncludedFields>;
export type CalendarSubscriberCollection = SubscriberCollection<CalendarEntity, CalendarK, CalendarMeta, CalendarAttachment, CalendarExcludedFields, CalendarIncludedFields>;
export type CalendarRealtimeDataItem = RealtimeDataItem<CalendarEntity, CalendarK, CalendarMeta, CalendarAttachment, CalendarExcludedFields, CalendarIncludedFields>;

// 8. Configuration types 
export type CalendarSnapshotStoreConfig = SnapshotStoreConfig<CalendarEntity, CalendarK, CalendarMeta, CalendarAttachment, CalendarExcludedFields, CalendarIncludedFields>;
export type CalendarSnapshotsArray = SnapshotsArray<CalendarEntity, CalendarK, CalendarMeta, CalendarAttachment, CalendarExcludedFields, CalendarIncludedFields>;

// 9. PARAMS type 
export type CalendarParams = SnapshotConfigParams<CalendarEntity, CalendarK, CalendarMeta, CalendarAttachment, CalendarExcludedFields, CalendarIncludedFields>;

// 10. Utility to pick or omit fields dynamically 
export type ApplyCalendarFieldFilters<
  T extends BaseDataEntity,
  Excluded extends keyof T = never,
  Included extends Exclude<keyof T, Excluded> = Exclude<keyof T, Excluded>
> = Pick<Omit<T, Excluded>, Included>;

// 11. Field filtering utility
export type PublicCalendarEvent = Pick<CalendarEntity, CalendarIncludedFields>;
export type SensitiveCalendarEvent = Omit<CalendarEntity, CalendarIncludedFields>;

// 12. Realtime calendar data items
export type CalendarEntityRealtimeDataItem = RealtimeDataItem<
  CalendarBaseParams['T'],
  CalendarBaseParams['K'],
  CalendarBaseParams['Meta'],
  CalendarBaseParams['AttachmentType'],
  CalendarBaseParams['ExcludedFields'],
  CalendarBaseParams['IncludedFields']
>;

// 13. Subscriber collection type
export type CalendarEntitySubscriberCollection = SubscriberCollection<
  CalendarBaseParams['T'],
  CalendarBaseParams['K'],
  CalendarBaseParams['Meta'],
  CalendarBaseParams['AttachmentType'],
  CalendarBaseParams['ExcludedFields'],
  CalendarBaseParams['IncludedFields']
>;

// 14. Factory function for creating safe calendar events
export const createPublicCalendarEvent = (
  event: Partial<CalendarEntity>
): PublicCalendarEvent => {
  const {
    attendeeEmails,
    organizerPersonalNotes,
    internalMeetingId,
    recurrenceRule,
    reminders,
    ...publicEvent
  } = event as CalendarEntity;
  
  return publicEvent as PublicCalendarEvent;
};

// 15. Type guard for safe data exposure
export const isPublicCalendarField = (
  field: string
): field is CalendarIncludedFields => {
  const publicFields: CalendarIncludedFields[] = [
    'id', 'title', 'description', 'startDate', 'endDate', 
    'location', 'status', 'visibility', 'categories', 'isAllDay',
    'timeZone', 'attendees', 'category', 'createdAt', 'updatedAt'
  ];
  return publicFields.includes(field as CalendarIncludedFields);
};


export type AppCalendarEvent = CalendarEvent<
  CalendarEntity,
  CalendarK,
  CalendarMeta,
  CalendarAttachment,
  CalendarExcludedFields,
  CalendarIncludedFields
>;

// Complete type exports
export type {
    CalendarExcludedFields,
    CalendarIncludedFields
};

const sensitiveEvent: CalendarEntity = {
  id: "event-123",
  title: "Team Meeting",
  startDate: new Date("2024-01-15T10:00:00Z"),
  endDate: new Date("2024-01-15T11:00:00Z"),
  description: "Quarterly planning",
  location: "Conference Room A",
  status: "scheduled",
  visibility: "private",
  categories: [defaultCategoryProperties], // Add the category object
  timeZone: "UTC",
  isAllDay: false, // Add missing required field
  // Sensitive fields (will be excluded by default)
  organizerPersonalNotes: "Discuss layoffs",
  internalMeetingId: "int-789",
  attendeeEmails: ["ceo@company.com", "hr@company.com"],
  reminders: [{
    id: "rem-1",
    method: "email", // Fix: 'email' goes to method, not type
    minutes: 15,
    trigger: { type: "time_before_event", minutesBefore: 15 }, // Add trigger
    isActive: true,
    sent: false,
    reminderType: {
      id: "email-reminder",
      category: "reminder",
      severity: "info",
      defaultSettings: {
        method: "email",
        timing: 15,
        template: "Reminder: {event.title} in {minutes} minutes"
      }
    }
  }],
  attendees: [] // Add missing required field
};
// Public version automatically excludes sensitive fields
const publicEvent: PublicCalendarEvent = createPublicCalendarEvent(sensitiveEvent);
// publicEvent only contains: id, title, description, startDate, endDate, location, status, visibility, categories