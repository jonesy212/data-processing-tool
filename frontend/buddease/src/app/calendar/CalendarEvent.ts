//CalendarEvent.ts
import { Category } from "@/app/libraries/categories/generateCategoryProperties";
import { Label } from '@/app/branding/BrandingSettings';
import { Team } from "@/app/models/teams/Team";
import { NotificationType } from '@/app/context/NotificationContext';
import { VersionEntity, VersionK, VersionMeta, VersionAttachment, VersionExcludedFields, VersionIncludedFields } from '@/app/typings/entities/VersionEntity'
import { Attachment } from '@/app/documents/attachment/Attachment';
import { DocumentOptions } from "@/app/documents/DocumentOptions";
import { CommonData } from "@/app/models/CommonData";
import { BaseData } from '@/app/models/data/Data';
import { Member } from '@/app/models/members/Member';
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
import { CalendarAttachment, CalendarEntity, CalendarExcludedFields, CalendarIncludedFields, CalendarK, CalendarMeta } from "@/app/typings/entities/CalendarEntity";
import { createLatestVersion } from '@/app/versions/createLatestVersion';
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { UnifiedMetadata } from "@/app/config/MetaDataOptions";
import { StructuredMetadata } from "@/app/config/StructuredMetadata";
import { useMeta } from "@/app/config/useMeta";
import { useMetadata } from "@/app/config/useMetadata";
import { Attendee } from "../components/calendar/Attendee";

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

