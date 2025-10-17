//CalendarEvent.ts
import { Label } from '@/app/branding/BrandingSettings';
import { Team } from "@/app/components/models/teams/Team";
import { Member } from "@/app/components/models/teams/TeamMembers";
import { NotificationType } from '@/app/context/NotificationContext';
import { Attachment } from '@/app/documents/attachment/Attachment';
import { DocumentOptions } from "@/app/documents/DocumentOptions";
import { CommonData } from "@/app/models/CommonData";
import { BaseData } from '@/app/models/data/Data';
import { Phase, PhaseData } from "@/app/models/phases/Phase";
import { fetchUserAreaDimensions } from '@/app/pages/layouts/fetchUserAreaDimensions';
import { CalendarEventWithCriteria } from "@/app/pages/searches/FilterCriteria";
import { ReminderSettings } from '@/app/settings/Reminder';
import { Snapshot } from "@/app/snapshots/Snapshot";
import { data, TagsRecord } from "@/app/snapshots/SnapshotWithCriteria";
import { WritableDraft } from "@/app/state/redux/ReducerGenerator";
import { CommonEvent } from "@/app/state/stores/CommonEvent";
import { AllStatus } from "@/app/state/stores/DetailsListStore";
import { AppStructuredMetadata, AppUnifiedMetadata } from "@/app/typings/entities/AppMetadataEntity";
import { CalendarEntity, CalendarK, CalendarMeta, CalendarAttachment, CalendarExcludedFields, CalendarIncludedFields } from "@/app/typings/entities/CalendarEntity";
import { createLatestVersion } from '@/app/versions/createLatestVersion';
import { BaseDataEntity, DefaultExcludedFields, DefaultIncludedFields, DefaultMeta } from '@/config/BaseConfig';
import { UnifiedMetadata } from "@/config/MetaDataOptions";
import { StructuredMetadata } from "@/config/StructuredMetadata";
import { useMeta } from "@/config/useMeta";
import { useMetadata } from "@/config/useMetadata";
import { Attendee } from "./Attendee";

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



// Sensitive fields that should never be exposed
type CalendarExcludedFields = 
  | DefaultExcludedFields<CalendarEventBase> 
  | 'attendeeEmails'
  | 'organizerPersonalNotes'
  | 'internalMeetingId'
  | 'recurrenceRule' // Hide complex recurrence logic
  | 'reminders'; // Keep reminder logic internal



type CalendarEventEntity = CalendarEvent<
  CalendarEntity,                              // T
  CalendarK,                                   // K
  CalendarMeta,                                // Meta
  CalendarAttachment,                          // AttachmentType
  CalendarExcludedFields,                      // ExcludedFields
  CalendarIncludedFields                       // IncludedFields
>;

// Only expose safe, public-facing fields by default
type CalendarIncludedFields = 
  | 'id'
  | 'title'
  | 'description'
  | 'startDate'
  | 'endDate'
  | 'location'
  | 'status'
  | 'visibility'
  | 'categories';

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
  category?: string;
  date: string;
  description?: string;

  highlights: string[];
  load?: () => void;
  files: any[];
  type?: NotificationType;
  locked?: boolean;
  action?: string;
  changes?: string[];
  date: string | Date | undefined;
  tags?: TagsRecord<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | string[] | undefined; 
  meta: UnifiedMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined;

  options?: {
    // ...
    additionalOptions: readonly string[] | string | number | any[] | undefined;
    additionalDocumentOptions?: DocumentOptions;
    additionalOptionsLabel?: string;
    // ...  
  };
  documentPhase?: WritableDraft<Phase<PhaseData<BaseData<any, any, StructuredMetadata<any, any>, Attachment>, BaseData<any, any, StructuredMetadata<any, any>, Attachment>>>>;   // Add more properties if needed
  status?: AllStatus;
  isCompleted?: boolean;
  isActive?: boolean;
  rsvpStatus: "yes" | "no" | "maybe" | "notResponded";
  priority?: AllStatus;
  location?: string;
  host?: boolean | Member;
  guestSpeakers?: Member[];
  participants: Member[];
  hosts?: Member[];
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
const { latestVersion = createLatestVersion<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>(), ...rest } = data;
const area = fetchUserAreaDimensions().toString()
const currentMetadata: AppUnifiedMetadata = useMetadata('calendar-event-area')
const currentMeta: AppStructuredMetadata = useMeta(area)


const calendarEvent: CalendarEventEntity = {
  date: undefined,
  meta: undefined,
  rsvpStatus: "notResponded",
  participants: [],
  teamMemberId: "",
  id: "",
  title: "",
  content: "",
  topics: [],
  highlights: [],
  files: [],
  label: {} as Label,
  createdBy: undefined,
  currentMeta: currentMeta, 
  currentMetadata: currentMetadata,
  latestVersion
}

export { calendarEvent };
export type { CalendarEvent };

