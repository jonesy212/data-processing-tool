//CalendarEvent.ts
import { Label } from '@/app/components/projects/branding/BrandingSettings';
import { createLatestVersion } from '@/app/components/versions/createLatestVersion';
import { UnifiedMetadata } from "@/app/configs/database/MetaDataOptions";
import { StructuredMetadata } from "@/app/configs/StructuredMetadata";
import { NotificationType } from '@/app/context/NotificationContext';
import { useMetadata } from "@/app/configs/useMetadata";
import { PhaseData } from "@/app/components/phases/Phase";
import { useMeta } from "@/app/configs/useMeta";
import { fetchUserAreaDimensions } from '@/app/pages/layouts/fetchUserAreaDimensions';
import { CalendarEventWithCriteria } from "@/app/pages/searchs/FilterCriteria";
import { DocumentOptions } from "../documents/DocumentOptions";
import { CommonData } from "../models/CommonData";
import { BaseData } from "../models/data/Data";
import { Team } from "../models/teams/Team";
import { Member } from "../models/teams/TeamMembers";
import { Phase } from "../phases/Phase";
import { Snapshot, TagsRecord } from "../snapshots";
import { WritableDraft } from "../state/redux/ReducerGenerator";
import { CommonEvent } from "../state/stores/CommonEvent";
import { AllStatus } from "../state/stores/DetailsListStore";
import { Attendee } from "./Attendee";
import { data } from '@/app/components/snapshots/SnapshotWithCriteria';
import { T, K } from "@/app/components/models/data/dataStoreMethods";
import { Attachment } from '../documents/Attachment/attachment';
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/configs/BaseConfig';


type CalendarEventEntity = CalendarEvent<
  BaseDataEntity,                              // T
  BaseDataEntity,                              // K
  DefaultMeta<BaseDataEntity, BaseDataEntity>, // Meta
  DefaultExcludedFields<BaseDataEntity>        // ExcludedFields
>;

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
  highlights: string[];
  load?: () => void;
  files: any[];
  type?: NotificationType;
  locked?: boolean;
  action?: string;
  changes?: string[];
  date: string | Date | undefined;
  tags?: TagsRecord<T, K> | string[] | undefined; 
  meta: UnifiedMetadata<T, K> | undefined;

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
  teamMemberId: Team["id"];

  reminder?: string;
  pinned?: boolean;
  archived?: boolean;
  documentReleased?: boolean;
  metadata?: UnifiedMetadata<T, K>
  getSnapshotStoreData?: () => Promise<CalendarEventWithCriteria[]> ;

  getData?: () => Promise<Snapshot<T, K, Meta, ExcludedFields>>;

  then?: <  
    T extends BaseDataEntity, 
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>  
  >(
    callback: (newData: Snapshot<T, K, Meta, ExcludedFields>) => void
  ) => Snapshot<T, K, Meta, ExcludedFields> | undefined;
}

// Destructure `latestVersion` with a default value
const { latestVersion = createLatestVersion<T, K>(), ...rest } = data;
const area = fetchUserAreaDimensions().toString()
const currentMetadata: UnifiedMetadata<T, K> = useMetadata<T, K>(area)
const currentMeta: StructuredMetadata<T, K> = useMeta<T, K>(area)


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

