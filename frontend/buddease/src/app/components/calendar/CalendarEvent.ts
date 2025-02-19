//CalendarEvent.ts
import { Label } from '@/app/components/projects/branding/BrandingSettings';
import { UnifiedMetaDataOptions } from "@/app/configs/database/MetaDataOptions";
import { StructuredMetadata } from "@/app/configs/StructuredMetadata";
import { CalendarEventWithCriteria } from "@/app/pages/searchs/FilterCriteria";
import { DocumentOptions } from "../documents/DocumentOptions";
import { CommonData } from "../models/CommonDetails";
import { BaseData } from "../models/data/Data";
import { Team } from "../models/teams/Team";
import { Member } from "../models/teams/TeamMembers";
import { Phase } from "../phases/Phase";
import { Snapshot, TagsRecord } from "../snapshots";
import { WritableDraft } from "../state/redux/ReducerGenerator";
import CommonEvent from "../state/stores/CommonEvent";
import { AllStatus } from "../state/stores/DetailsListStore";
import { NotificationType } from "../support/NotificationContext";
import { Attendee } from "./Attendee";

interface CalendarEvent<
  T extends  BaseData<any> = BaseData,
  K extends T = T>
  extends CommonEvent,
    CommonData<T, K> {
  id: string;
  title: string;
  content: string;
  topics: string[];
  highlights: string[];
  load?: () => void;
  files: any[];
  type?: NotificationType;
  locked?: boolean;
  action?: string;
  changes?: string[];
  date: string | Date | undefined;
  tags?: TagsRecord<T, K> | string[] | undefined; 
  meta: T | undefined;

  options?: {
    // ...
    additionalOptions: readonly string[] | string | number | any[] | undefined;
    additionalDocumentOptions?: DocumentOptions;
    additionalOptionsLabel?: string;
    // ...  
  };
  documentPhase?: WritableDraft<Phase<T>>;
  // Add more properties if needed
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
  teamMemberId: Team["id"];

  reminder?: string;
  pinned?: boolean;
  archived?: boolean;
  documentReleased?: boolean;
  metadata?: UnifiedMetaDataOptions<T, K>
  getSnapshotStoreData?: () => Promise<CalendarEventWithCriteria[]> ;

  
  getData?: () => Promise<
    Snapshot<T, K>
  >;

  then?: <
    T extends BaseData<any>,
    K extends T = T,
    Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(
    callback: (newData: Snapshot<T, K>) => void
  ) => Snapshot<T, K> | undefined;
}


const calendarEvent: CalendarEvent = {
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
  currentMetadata: currentMetadata
}

export { calendarEvent };
export type { CalendarEvent };
