import { UnifiedMetaDataOptions } from "@/app/configs/database/MetaDataOptions";
import { CalendarEventWithCriteria } from "@/app/pages/searchs/FilterCriteria";
import { DocumentOptions } from "../documents/DocumentOptions";
import { CommonData } from "../models/CommonDetails";
import { BaseData, Data } from "../models/data/Data";
import { Team } from "../models/teams/Team";
import { Member } from "../models/teams/TeamMembers";
import { Phase } from "../phases/Phase";
import { Snapshot, TagsRecord } from "../snapshots";
import { WritableDraft } from "../state/redux/ReducerGenerator";
import CommonEvent from "../state/stores/CommonEvent";
import { AllStatus } from "../state/stores/DetailsListStore";
import { NotificationType } from "../support/NotificationContext";
import { Attendee } from "./Attendee";

//CalendarEvent.t
interface CalendarEvent<T extends Data = BaseData,
  Meta extends UnifiedMetaDataOptions = UnifiedMetaDataOptions,
  K extends Data = T>
  extends CommonEvent,
    CommonData<T> {
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
  date: Date | undefined;
  tags?: TagsRecord | string[] | undefined; 
  meta: Data | undefined;

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
  metadata?: UnifiedMetaDataOptions;
  getSnapshotStoreData?: () => Promise<CalendarEventWithCriteria[]> ;

  
  getData?: () => Promise<
    Snapshot<T, Meta, K>
  >;

  then?: <T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T>(
    callback: (newData: Snapshot<T, Meta, K>) => void
  ) => Snapshot<T, Meta, K> | undefined;
}
export type { CalendarEvent };
