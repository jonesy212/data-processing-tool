// CalendarEntity.ts
import AttendeeStatus from '@/core/pages/AccessDenied'
import type { CalendarEvent } from '@/core/calendar/CalendarEvent';
import type { Attendee } from "@/core/components/calendar/Attendee";
import { CalendarStatus } from "@/core/models/data/StatusType";
import type { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from "@/core/config/BaseConfig";
import type { Attachment } from '@/core/documents/attachment/Attachment';
import { defaultCategoryProperties } from '@/core/pages/personas/ScenarioBuilder';
import type { Reminder } from '@/core/settings/Reminder';
import type { SnapshotsArray } from '@/core/snapshots/LocalStorageSnapshotStore';
import type { Snapshot } from '@/core/snapshots/Snapshot';
import type { SnapshotConfigParams } from '@/core/snapshots/SnapshotConfigBuilder';
import type { SnapshotData } from '@/core/snapshots/SnapshotData';
import SnapshotStore from "@/core/snapshots/SnapshotStore";
import type { SnapshotStoreConfig } from "@/core/snapshots/SnapshotStoreConfig";
import type { SnapshotWithCriteria } from "@/core/snapshots/SnapshotWithCriteria";
import type { SubscriberCollection } from "@/core/subscribers/SubscriberCollection";
import type { RealtimeDataItem } from "@/core/typings/realtimeTypes";

export interface CalendarVisibility {
  type: 'public' | 'private' | 'shared' | 'team-only' | 'department-only' | 'custom';
  // Optional fields based on type
  sharedWith?: string[]; // User IDs or emails
  teamIds?: string[]; // Team IDs for team-only visibility
  departmentIds?: string[]; // Department IDs for department-only
  permissions?: {
    canView: boolean;
    canEdit: boolean;
    canDelete: boolean;
    canInvite: boolean;
  };
  accessLevel?: 'view-only' | 'edit' | 'admin';
}

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
  status: CalendarStatus;
  visibility: CalendarVisibility;
  
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

// For the sensitive event:
const sensitiveEvent: CalendarEntity = {
  id: "event-confidential-456",
  title: "Executive Compensation Review",
  startDate: new Date("2024-01-20T14:00:00"),
  endDate: new Date("2024-01-20T15:30:00"),
  timeZone: "America/New_York",
  description: "Confidential discussion about executive compensation packages and bonus structures for 2024.",
  
  // Status
  status: CalendarStatus.Approved,
  
  // Strict visibility - private
  visibility: {
    type: "private",
    permissions: {
      canView: true,
      canEdit: false,
      canDelete: false,
      canInvite: false
    },
    accessLevel: 'view-only',
    sharedWith: [] // Empty array for truly private
  },
  
  location: "Executive Board Room",
  isAllDay: false,
  
  // Updated attendees with teamId, roleInTeam, and status
  attendees: [
    {
      id: "user-ceo",
      name: "Alex Johnson",
      email: "alex@company.com",
      teamId: "executive-team",
      roleInTeam: "CEO",
      status: AttendeeStatus.ACCEPTED,
      role: "organizer", // For backward compatibility
      avatar: "/avatars/alex.jpg"
    },
    {
      id: "user-cfo", 
      name: "Maria Garcia",
      email: "maria@company.com",
      teamId: "executive-team",
      roleInTeam: "CFO",
      status: AttendeeStatus.ACCEPTED,
      role: "required",
      avatar: "/avatars/maria.jpg"
    },
    {
      id: "user-chairman",
      name: "Robert Chen",
      email: "robert@company.com",
      teamId: "board-team",
      roleInTeam: "Chairman",
      status: AttendeeStatus.TENTATIVE,
      role: "required",
      avatar: "/avatars/robert.jpg"
    },
    {
      id: "user-hr-director",
      name: "Sarah Williams",
      email: "sarah@company.com",
      teamId: "hr-team",
      roleInTeam: "HR Director",
      status: AttendeeStatus.PENDING,
      role: "optional"
    }
  ],

  // Sensitive fields marked explicitly
  organizerPersonalNotes: "HIGHLY CONFIDENTIAL - Do not discuss outside this meeting. Salary figures attached.",
  internalMeetingId: "EXEC-COMP-2024-001",
  attendeeEmails: ["alex@company.com", "maria@company.com", "robert@company.com"],
  
  reminders: [
    {
      id: "reminder-confidential-1",
      trigger: "before_start",
      method: "email",
      reminderType: "standard", // Assuming ReminderType has this
      customMessage: "CONFIDENTIAL: Executive Compensation Review in 2 days",
      isActive: true,
      sent: false,
      minutes: 2880, // 2 days in minutes
      customActions: [
        {
          id: "action-encrypt",
          type: "encrypt_email",
          label: "Encrypt email content"
        }
      ]
    },
    {
      id: "reminder-confidential-2",
      trigger: "before_start",
      method: "in-app",
      reminderType: "urgent",
      customMessage: "High-priority confidential meeting",
      isActive: true,
      sent: false,
      minutes: 60, // 1 hour before
      customActions: [
        {
          id: "action-verify",
          type: "identity_verification",
          label: "Require biometric verification"
        }
      ]
    }
  ],
  
  // BaseDataEntity fields
  createdAt: new Date(),
  updatedAt: new Date(),
  version: 1,
  metadata: {
    tags: ["confidential", "executive", "compensation"],
    priority: "critical",
    securityLevel: "top-secret",
    customFields: {
      classification: "strictly-confidential",
      retentionPeriod: "7_years",
      ndaRequired: true
    }
  }
};


const sharedEvent: CalendarEntity = {
  id: "event-shared-101",
  title: "Project Kickoff",
  startDate: new Date("2024-01-18T09:00:00"),
  endDate: new Date("2024-01-18T10:00:00"),
  timeZone: "America/New_York",
  description: "Kickoff meeting for the Aurora project.",
  
  status: CalendarStatus.Tentative,
  
  visibility: {
    type: "shared",
    sharedWith: [
      "user-pm-001",
      "user-dev-002", 
      "user-designer-003"
    ],
    permissions: {
      canView: true,
      canEdit: true,
      canDelete: false,
      canInvite: true
    },
    accessLevel: 'edit'
  },
  
  // ... other fields
};

const departmentEvent: CalendarEntity = {
  id: "event-dept-202",
  title: "Engineering Sync",
  startDate: new Date("2024-01-17T10:00:00"),
  endDate: new Date("2024-01-17T10:30:00"),
  timeZone: "America/New_York",
  description: "Daily engineering team sync.",
  
  status: CalendarStatus.Approved,
  
  visibility: {
    type: "department-only",
    departmentIds: ["dept-engineering", "dept-qa"],
    permissions: {
      canView: true,
      canEdit: true,
      canDelete: true,
      canInvite: true
    },
    accessLevel: 'admin'
  },
  
  // ... other fields
};
// Public version automatically excludes sensitive fields
const publicEvent: PublicCalendarEvent = createPublicCalendarEvent(sensitiveEvent);
// publicEvent only contains: id, title, description, startDate, endDate, location, status, visibility, categories