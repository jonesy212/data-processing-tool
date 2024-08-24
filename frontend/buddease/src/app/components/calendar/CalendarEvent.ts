import StructuredMetadata, { ProjectMetadata } from "@/app/configs/StructuredMetadata";
import { Data } from "../models/data/Data";
import { DocumentOptions } from "../documents/DocumentOptions";
import { CommonData } from "../models/CommonDetails";
import { BaseData } from "../models/data/Data";
import { Team } from "../models/teams/Team";
import { Member } from "../models/teams/TeamMembers";
import { Phase } from "../phases/Phase";
import { TagsRecord, Snapshot } from "../snapshots";
import SnapshotStore from "../snapshots/SnapshotStore";
import { WritableDraft } from "../state/redux/ReducerGenerator";
import CommonEvent from "../state/stores/CommonEvent";
import { AllStatus } from "../state/stores/DetailsListStore";
import { NotificationType } from "../support/NotificationContext";
import { Attendee } from "./Attendee";

//CalendarEvent.t
interface CalendarEvent<T extends Data = BaseData, K extends Data = BaseData>
  extends CommonEvent,
    CommonData {
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
  tags?: TagsRecord
  meta: Data | undefined;

  options?: {
    // ...
    additionalOptions: readonly string[] | string | number | any[] | undefined;
    additionalDocumentOptions?: DocumentOptions;
    additionalOptionsLabel?: string;
    // ...
  };
  documentPhase?: WritableDraft<Phase>;
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
  metadata?: StructuredMetadata | ProjectMetadata 
  getSnapshotStoreData?: () => Promise<SnapshotStore<CalendarEvent, K>[]>;

  
  getData?: () => Promise<
    Snapshot<T, K>
  >;

  then?: <T extends Data, K extends Data>(
    callback: (newData: Snapshot<T, K>) => void
  ) => Snapshot<T, K> | undefined;
}
export type {  CalendarEvent}