// CalendarEvent.ts
//CalendarEvent.ts
import { Label } from '@/app/branding/BrandingSettings';
import { Team } from "@/app/components/teams/Team";
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { UnifiedMetadata } from "@/app/config/MetaDataOptions";
import { useMeta } from "@/app/config/useMeta";
import { useMetadata } from "@/app/config/useMetadata";
import { Attachment } from '@/app/documents/attachment/Attachment';
import { DocumentOptions } from "@/app/documents/DocumentOptions";
import { NotificationType } from '@/app/features/support/UnifiedNotificationTypes';
import { Category } from "@/app/libraries/categories/generateCategoryProperties";
import { CommonData } from "@/app/models/CommonData";
import { Member } from '@/app/models/members/Member';
import { Phase } from "@/app/models/phases/Phase";
import { fetchUserAreaDimensions } from '@/app/pages/layouts/fetchUserAreaDimensions';
import { CalendarEventWithCriteria } from "@/app/pages/searches/FilterCriteria";
import { ReminderSettings } from '@/app/settings/Reminder';
import type { Snapshot } from '@/app/snapshots/Snapshot';;
import { data } from "@/app/snapshots/SnapshotWithCriteria";
import { CalendarEventEntity } from './../typings/entities/CalendarEntity';

import { TagsRecord } from '@/app/models/tracker/Tag';
import { WritableDraft } from "@/app/state/redux/ReducerGenerator";
import { CommonEvent } from "@/app/state/stores/CommonEvent";
import { AllStatus } from "@/app/state/stores/DetailsListStore";
import { AppStructuredMetadata, AppUnifiedMetadata } from "@/app/typings/entities/AppMetadataEntity";
import { VersionAttachment, VersionEntity, VersionExcludedFields, VersionIncludedFields, VersionK, VersionMeta } from '@/app/typings/entities/VersionEntity';
import { createLatestVersion } from '@/app/versions/createLatestVersion';
import { Attendee } from "@/app/components/calendar/Attendee";

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
  meta: UnifiedMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined;

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

