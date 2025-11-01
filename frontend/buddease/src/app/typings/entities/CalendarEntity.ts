// CalendarEntity.ts
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from "@/app/config/BaseConfig";
import { Attachment } from "@/app/documents/attachment/Attachment";
import { RealtimeDataItem } from "@/app/typings/realtimeTypes";
import { SubscriberCollection } from "@/app/subscribers/SubscriberCollection";
// Combined Calendar Entity System

// 1. Unified Base Calendar Entity
export interface CalendarEntity extends BaseDataEntity {
  title: string;
  startDate: Date;
  endDate: Date;
  description?: string;
  location?: string;
  isAllDay?: boolean;
  recurrenceRule?: string;
  timeZone: string;
  attendees?: string[];
  category?: string;
  status: 'scheduled' | 'cancelled' | 'completed' | 'tentative';
  visibility: 'public' | 'private' | 'shared';
  categories: string[];
  organizerPersonalNotes?: string; // Sensitive
  internalMeetingId?: string; // Sensitive
  attendeeEmails?: string[]; // Sensitive
  reminders?: any[]; // Sensitive - internal logic
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

// 7. Field filtering utility
export type PublicCalendarEvent = Pick<CalendarEntity, CalendarIncludedFields>;
export type SensitiveCalendarEvent = Omit<CalendarEntity, CalendarIncludedFields>;

// 8. Realtime calendar data items
export type CalendarEntityRealtimeDataItem = RealtimeDataItem<
  CalendarBaseParams['T'],
  CalendarBaseParams['K'],
  CalendarBaseParams['Meta'],
  CalendarBaseParams['AttachmentType'],
  CalendarBaseParams['ExcludedFields'],
  CalendarBaseParams['IncludedFields']
>;

// 9. Subscriber collection type
export type CalendarEntitySubscriberCollection = SubscriberCollection<
  CalendarBaseParams['T'],
  CalendarBaseParams['K'],
  CalendarBaseParams['Meta'],
  CalendarBaseParams['AttachmentType'],
  CalendarBaseParams['ExcludedFields'],
  CalendarBaseParams['IncludedFields']
>;

// 10. Factory function for creating safe calendar events
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


// 11. Type guard for safe data exposure
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

// 12. Complete type exports
export type {
  CalendarExcludedFields,
  CalendarIncludedFields
};

// Usage example:
const sensitiveEvent: CalendarEntity = {
  id: "event-123",
  title: "Team Meeting",
  startDate: new Date("2024-01-15T10:00:00Z"),
  endDate: new Date("2024-01-15T11:00:00Z"),
  description: "Quarterly planning",
  location: "Conference Room A",
  status: "scheduled",
  visibility: "private",
  categories: ["work", "planning"],
  timeZone: "UTC",
  // Sensitive fields (will be excluded by default)
  organizerPersonalNotes: "Discuss layoffs",
  internalMeetingId: "int-789",
  attendeeEmails: ["ceo@company.com", "hr@company.com"],
  reminders: [{ type: "email", minutes: 15 }]
};

// Public version automatically excludes sensitive fields
const publicEvent: PublicCalendarEvent = createPublicCalendarEvent(sensitiveEvent);
// publicEvent only contains: id, title, description, startDate, endDate, location, status, visibility, categories