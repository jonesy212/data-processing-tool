// CalendarEvent.ts

import type { CalendarStatus } from '@/core/models/data/StatusType'
import { ReminderTypes } from '@/core/typings/ReminderTypes';
import type { AttendeeStatus } from '@/core/models/data/StatusType'
import type { Label } from '@/core/branding/BrandingSettings';
import type { Team } from "@/core/components/teams/Team";
import type { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import type { StructuredMetadata } from '@/core/config/StructuredMetadata';
import type { UnifiedMetadata } from "@/core/config/MetaDataOptions";
import { useMeta } from "@/core/config/useMeta";
import { useMetadata } from "@/core/config/useMetadata";
import type { CalendarEntity } from '@/core/typings/entities/CalendarEntity';
import type { Attachment } from '@/core/documents/attachment/Attachment';
import type { DocumentOptions } from "@/core/documents/DocumentOptions";
import type { NotificationType } from '@/core/features/support/UnifiedNotificationTypes';
import type { Category } from "@/core/libraries/categories/generateCategoryProperties";
import type { CommonData } from "@/core/models/CommonData";
import type { Member } from '@/core/models/members/Member';
import type { Phase } from "@/core/models/phases/Phase";
import { fetchUserAreaDimensions } from '@/core/pages/layouts/fetchUserAreaDimensions';
import type { CalendarEventWithCriteria } from "@/core/pages/searches/FilterCriteria";
import type { ReminderSettings } from '@/core/settings/Reminder';
import type { Snapshot } from '@/core/snapshots/Snapshot';
import { data } from "@/core/snapshots/SnapshotWithCriteria";
import type { CalendarEventEntity } from '@/core/typings/entities/CalendarEntity';


import type { Attendee } from "@/core/components/calendar/Attendee";
import type { TagsRecord } from '@/core/models/tracker/Tag';
import type { WritableDraft } from "@/core/state/redux/ReducerGenerator";
import type { CommonEvent } from "@/core/state/stores/CommonEvent";
import type { AllStatus } from "@/core/state/stores/DetailsListStore";
import type { AppStructuredMetadata, AppUnifiedMetadata } from "@/core/typings/entities/AppMetadataEntity";
import type { VersionAttachment, VersionEntity, VersionExcludedFields, VersionIncludedFields, VersionK, VersionMeta } from '@/core/typings/entities/VersionEntity';
import { createLatestVersion } from '@/core/versions/createLatestVersion';

type CalendarEventBase = BaseDataEntity & {
  title: string;
  startDate: Date;
  endDate: Date;
  description?: string;
  location?: string;
  isAllDay?: boolean;
  recurrenceRule?: string;
  timeZone: string;
};



// Calendar-specific validation: endDate must be after startDate
interface CalendarEventMeta extends DefaultMeta<CalendarEventBase, CalendarEventBase> {
  validation: {
    isDateRangeValid: boolean;
    isWithinBusinessHours: boolean;
    hasNoSchedulingConflicts: boolean;
    isRecurrenceRuleValid: boolean;
    areTimezonesConsistent: boolean;
  };
  scheduling: {
    requiresConfirmation: boolean;
    maxAttendees: number;
    allowedDurations: number[]; // in minutes
    bufferTime: number; // minutes between events
  };
  notifications: {
    sendInvites: boolean;
    sendUpdates: boolean;
    sendCancellations: boolean;
    reminderSettings: ReminderSettings;
  };
}

interface CalendarEvent<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T  
>
  extends CommonEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    CommonData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> 
  {
  id: string;
  title: string;
  content: string;
  topics: string[];
  //remove if conficting
  category?: Category;
  description?: string;

  highlights: string[];
  load?: () => void;
  files: any[];
  type?: NotificationType;
  locked?: boolean;
  action?: string;
  changes?: string[];
  date: string | Date | undefined;
  tags?: string[] | TagsRecord<T>; 
  meta: StructuredMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined;

  options?: {
    // ...
    additionalOptions: readonly string[] | string | number | any[] | undefined;
    additionalDocumentOptions?: DocumentOptions;
    additionalOptionsLabel?: string;
    // ...  
  };
  documentPhase?: WritableDraft<Phase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>;   // Add more properties if needed
  status?: AllStatus;
  isCompleted?: boolean;
  isActive?: boolean;
  rsvpStatus: "yes" | "no" | "maybe" | "notResponded";
  priority?: string | AllStatus | null;
  location?: string;
  host?: boolean | Member<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  guestSpeakers?: Member<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
  participants: Member<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
  hosts?: Member<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
  attendees?: Attendee[];
  color?: string;
  isImportant?: boolean;
  teamMemberId: Team<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>["id"];

  reminder?: string;
  pinned?: boolean;
  archived?: boolean;
  documentReleased?: boolean;
  metadata?: UnifiedMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  getSnapshotStoreData?: () => Promise<CalendarEventWithCriteria[]> ;

  getData?: () => Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>;

  then?: <
    T extends BaseDataEntity,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T  
  >(
    callback: (newData: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void
  ) => Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined;
}

// Destructure `latestVersion` with a default value
const { latestVersion = createLatestVersion<VersionEntity, VersionK,VersionMeta, VersionAttachment, VersionExcludedFields, VersionIncludedFields>(), ...rest } = data;
const area = fetchUserAreaDimensions().toString()
const currentMetadata: AppUnifiedMetadata = useMetadata<VersionEntity, VersionK,VersionMeta, VersionAttachment, VersionExcludedFields, VersionIncludedFields>('calendar-event-area')
const currentMeta: AppStructuredMetadata = useMeta(area)


const calendarEvent: CalendarEntity = {
  // Required date/time fields
  startDate: new Date("2024-01-15T10:00:00"),
  endDate: new Date("2024-01-15T11:00:00"),
  timeZone: "America/New_York",
  
  // Core event information
  id: `calendar-event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  title: "Q1 Planning Meeting",
  description: "Quarterly planning session to discuss Q1 goals, budget allocation, and team objectives. Please come prepared with your department reports.",
  
  // Status and visibility
  status: CalendarStatus.CONFIRMED,
  visibility: {
    type: "team-only",
    teamIds: ["team-sales", "team-marketing"],
    permissions: {
      canView: true,
      canEdit: false,
      canDelete: false,
      canInvite: true
    },
    accessLevel: 'view-only'
  },
  
  // Location and recurrence
  location: "Conference Room A",
  isAllDay: false,
  recurrenceRule: undefined,
  
  // Attendees (converted from participants)
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
      id: "user-sales-lead",
      name: "David Wilson",
      email: "david@company.com",
      teamId: "team-sales",
      roleInTeam: "Sales Lead",
      status: AttendeeStatus.PENDING,
      role: "optional",
      avatar: "/avatars/david.jpg"
    },
    {
      id: "user-marketing-lead",
      name: "Sarah Chen",
      email: "sarah@company.com",
      teamId: "team-marketing",
      roleInTeam: "Marketing Lead",
      status: AttendeeStatus.TENTATIVE,
      role: "optional",
      avatar: "/avatars/sarah.jpg"
    }
  ],
  
  // Attendee emails
  attendeeEmails: [
    "alex@company.com",
    "maria@company.com",
    "david@company.com",
    "sarah@company.com",
    "team-leads@company.com"
  ],
  
  // Sensitive fields
  organizerPersonalNotes: "Make sure to discuss confidential budget projections",
  internalMeetingId: "MTG-Q1-PLANNING-2024",
  teamMemberId: "lead-organizer-001",
  
  // Reminders (converted from currentMetadata.reminders)
  reminders: [
    {
      id: "reminder-q1-24hr",
      trigger: {
        type: 'time_before_event',
        minutesBefore: 1440 // 24 hours
      },
      method: "email",
      reminderType: ReminderTypes.STANDARD,
      customMessage: "Reminder: Q1 Planning Meeting tomorrow. Please bring your department reports.",
      isActive: true,
      sent: false,
      customActions: [
        {
          id: "action-view-agenda",
          label: "View Agenda",
          type: "view_document",
          primary: true,
          onClick: () => {
            console.log("Opening agenda document...");
            // Implementation to open agenda
          }
        },
        {
          id: "action-rsvp",
          label: "RSVP Now",
          type: "rsvp_response",
          secondary: true,
          onClick: () => {
            console.log("Opening RSVP form...");
            // Implementation for RSVP
          }
        }
      ]
    },
    {
      id: "reminder-q1-30min",
      trigger: {
        type: 'time_before_event',
        minutesBefore: 30 // 30 minutes
      },
      method: "push",
      reminderType: ReminderTypes.URGENT,
      customMessage: "Q1 Planning Meeting starts in 30 minutes",
      isActive: true,
      sent: false,
      customActions: [
        {
          id: "action-join",
          label: "Join Meeting",
          type: "join_meeting",
          primary: true,
          onClick: () => {
            console.log("Joining meeting...");
            // Implementation to join meeting
          }
        },
        {
          id: "action-documents",
          label: "View Documents",
          type: "view_documents",
          secondary: true,
          onClick: () => {
            console.log("Opening meeting documents...");
            // Implementation to view documents
          }
        }
      ]
    },
    {
      id: "reminder-q1-followup",
      trigger: {
        type: 'absolute',
        dateTime: new Date("2024-01-15T16:00:00") // 5 hours after meeting
      },
      method: "email",
      reminderType: ReminderTypes.FOLLOW_UP,
      customMessage: "Follow-up: Q1 Planning Meeting action items",
      isActive: true,
      sent: false,
      customActions: [
        {
          id: "action-review",
          label: "Review Notes",
          type: "review_notes",
          primary: true,
          onClick: () => {
            console.log("Opening meeting notes...");
            // Implementation to open notes
          }
        }
      ]
    }
  ],
  
  // BaseDataEntity fields with merged metadata
  createdAt: new Date("2024-01-10T09:00:00"),
  updatedAt: new Date(),
  version: 1,
  metadata: {
    // Moved content field
    content: "Quarterly planning session to discuss Q1 goals, budget allocation, and team objectives. Please come prepared with your department reports.",
    
    // Moved topics and highlights
    topics: ["planning", "quarterly-review", "budget"],
    highlights: ["Budget approval", "Team objectives", "KPI review"],
    
    // Moved label
    label: {
      id: "label-planning",
      name: "Planning",
      color: "#10b981",
      description: "Planning and strategy meetings"
    },
    
    // Moved files
    files: [
      {
        id: "file-q1-plan",
        name: "Q1_Planning_Deck.pdf",
        url: "/documents/2024/q1-planning.pdf",
        type: "application/pdf",
        size: 2048576,
        uploadedAt: new Date().toISOString()
      },
      {
        id: "file-budget",
        name: "Budget_Proposal.xlsx",
        url: "/documents/2024/budget-proposal.xlsx",
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        size: 1048576,
        uploadedAt: new Date().toISOString()
      }
    ],
    
    // Moved agenda and meeting details
    agenda: [
      "Welcome and introductions (5 min)",
      "Q1 Goals Review (15 min)",
      "Budget Discussion (20 min)",
      "Team Objectives (15 min)",
      "Action Items (5 min)"
    ],
    videoCallLink: "https://meet.company.com/q1-planning",
    
    // Additional metadata
    tags: ["quarterly", "planning", "executive"],
    priority: "high",
    source: "calendar-system",
    createdBy: "user-admin",
    
    // Custom fields
    customFields: {
      department: "executive",
      fiscalYear: 2024,
      quarter: "Q1",
      confidential: true,
      meetingType: "strategic-planning",
      expectedDuration: "60_minutes",
      decisionRequired: true
    },
    
    // Version tracking
    latestVersion: {
      version: 1,
      timestamp: new Date().toISOString(),
      changes: ["Initial event creation"],
      changedBy: "user-admin",
      notes: "Created for Q1 planning session"
    },
    
    // CreatedBy user info
    creator: {
      id: "user-admin",
      name: "System Admin",
      email: "admin@company.com",
      role: "administrator"
    }
  }
};

export { calendarEvent };
export type { CalendarEvent };

