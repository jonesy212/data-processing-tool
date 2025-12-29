// CommonData.tsx
import { MeetingData } from "@/core/calendar/MeetingData";
import { ScheduledData } from "@/core/calendar/ScheduledData";
import { TradeData } from "@/core/components/trading/TradeData";
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import { UnifiedMetadata } from "@/core/config/MetaDataOptions";
import { CryptoData } from "@/core/dataIntegration/parseData";
import { ModifiedDate } from "@/core/documents/DocType";
import { NotificationType } from '@/core/features/support/UnifiedNotificationTypes';
import { Category } from "@/core/libraries/categories/generateCategoryProperties";
import { Taggable } from '@/core/models/tracker/Tag';
import { SharedMetadata } from '@/core/shared/SharedMetadata';

import { SharedIdentifiers, SharedTimestamps } from '@/core/documents/RelatedProps';
import { Attachment } from '@/core/documents/attachment/Attachment';
import { DocumentData } from "@/core/documents/editing/DocumentBuilder";
import { FakeData } from "@/core/intelligence/FakeDataGenerator";
import { CollaborationOptions } from "@/core/interfaces/options/CollaborationOptions";
import AnimationTypeEnum from "@/core/libraries/animations/AnimationLibrary";
import { CommunityData } from "@/core/models/CommunityData";
import { LogData } from "@/core/models/LogData";
import { BaseData, DataDetails, DataWithOmittedFields } from "@/core/models/data/Data";
import { BookmarkStatus, CalendarStatus, DataStatus, NotificationStatus, PriorityTypeEnum, TaskStatus, TeamStatus, TodoStatus } from "@/core/models/data/StatusType";
import { Member } from "@/core/models/members/Member";
import { ProjectData } from "@/core/models/projects/Project";
import { Task } from "@/core/models/tasks/Task";
import { TeamData } from "@/core/models/teams/TeamData";
import { Participant } from "@/core/pages/management/ParticipantManagementPage";
import type { Snapshot } from '@/core/snapshots/Snapshot';
import { AllStatus, DetailsItem } from "@/core/state/stores/DetailsListStore";
import { Todo } from "@/core/todos/Todo";
import { AllTypes } from "@/core/typings/PropTypes";
import { DocumentTypeEnum } from "@/core/typings/documentTypes";
import { UserData } from "@/core/users/User";
import AccessHistory from "@/core/versions/AccessHistory";
import { DappProps } from "@/utils/web3/dAppAdapter/DAppAdapterConfig";
import React from "react";
import FolderData from "./data/FolderData";
;
 
interface Timestamped {
  timestamp?: string | number | Date | undefined;
  startDate?: string | Date;
  endDate?: string | Date;
  date: string | Date | undefined;
  documentCreationDate?: Date;
  documentLastModifiedDate?: Date;
  lastModifiedDate?: ModifiedDate;
}

interface StatusTrackable {
  status?: AllStatus | null;
  documentStatus?: string;
  todoStatus?: TodoStatus | null;
  taskStatus?: TaskStatus | null;
  teamStatus?: TeamStatus | null;
  dataStatus?: DataStatus | null;
  calendarStatus?: CalendarStatus | null;
  notificationStatus?: NotificationStatus | null;
  bookmarkStatus?: BookmarkStatus | null;
  priorityType?: PriorityTypeEnum | null;
}

interface CounterTrackable {
  viewsCount?: number;
  likesCount?: number;
  commentsCount?: number;
}

interface Identifiable {
  id?: string | number | undefined;
  _id?: string;
}

interface UserOwned<
  T extends BaseDataEntity,
  K extends T = T
> extends SharedTimestamps,
  SharedIdentifiers<T, K> {
  assignedUser?: string | null;
  documentOwner?: string;
}



interface Describable {
  title?: string;
  description?: string;
}

interface DocumentContent {
  documentType?: DocumentTypeEnum | string | null;
  documentContent?: string;
  documentVersion?: number;
  options?: {
    additionalOptions: readonly string[] | string | number | any[] | undefined;
  };
}

interface AccessControlled {
  isPrivate?: boolean;
  isUnlisted?: boolean;
  isLicensedContent?: boolean;
  isFamilyFriendly?: boolean;
  isEmbeddable?: boolean;
  isDownloadable?: boolean;
}

type ConditionalCommonData<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> = T extends DappProps<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ? CommonData<T, K, Meta, AttachmentType, never, keyof T>  
  : T extends SupportedData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ? CommonData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> 
  : CommonData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;


interface CommonData<
  T extends BaseDataEntity = BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> extends BaseData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, 
  SharedMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  UserOwned<T, K>,
  Taggable<T>,
  Identifiable,
  Describable,
  Timestamped,
  DocumentContent,
  AccessControlled,
  CounterTrackable
{  
  // Keep only properties that are truly unique to CommonData
  blockNumber?: number | undefined;
  transactionHash?: string | undefined;
  event?: string;
  signature?: string;
  email?: string;
  username?: string;
  startDate?: string | Date;
  eventId?: string | null | undefined;
  endDate?: string | Date;
  status?: AllStatus | null;
  collaborationOptions?: CollaborationOptions[] | undefined;
  participants?: Participant[];
  members?: Member<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
  metadata?: UnifiedMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  details?: DetailsItem<T>;
  data?: DataWithOmittedFields<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
    
  projectId?: string;
  categories?: Category[];
  documentType?: DocumentTypeEnum | string | null;
  documentStatus?: string;
  documentOwner?: string;
  documentCreationDate?: Date;
  documentLastModifiedDate?: Date;
  documentVersion?: number;
  documentContent?: string;
  options?: {
    additionalOptions: readonly string[] | string | number | any[] | undefined;
  };
  folderPath?: string;
  
  accessHistory?: AccessHistory[];
  folders?: FolderData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
  documentAccess?: string;
  documentSharing?: string;
  documentSecurity?: string;
  documentRetention?: string;
  documentLifecycle?: string;
  documentWorkflow?: string;
  documentIntegration?: string;
  documentReporting?: string;
  documentBackup?: string;
  date: string | Date | undefined;
  completed?: boolean;
  then?: <
    T extends BaseDataEntity = BaseDataEntity,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T
    >(callback: (
      newData: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void
    ) => Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined;

  // Moved from VideoCommonData
  viewsCount?: number;
  likesCount?: number;
  commentsCount?: number;
}


interface Customizations<T> {
  [key: string]: (value: any) => React.ReactNode;
}
 
export type DataType = NotificationType | string | DocumentTypeEnum | AnimationTypeEnum;
export type TaskType = "addTask" | "removeTask" | "bug" | "feature" | "epic" | "story" | "task";


// Group similar data types into unions for flexibility
type CommonDataTypes<
  T extends BaseDataEntity = BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> = 
  | UserData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  | Todo<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  | Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  | LogData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  | DataDetails<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;



// Group other types into their own union for flexibility
type AdditionalDataTypes<
  T extends BaseDataEntity = BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> = 
| CommunityData
| ProjectData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
| TeamData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
| ScheduledData<T>
| MeetingData
| CryptoData
| TradeData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
| FakeData;



// Combining common types and additional types using intersection
type SupportedData<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> =
  CommonDataTypes<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> & // Apply intersection to ensure core data is present
  AdditionalDataTypes<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> & // Include additional data types with flexibility
  DocumentData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> & // DocumentData can be part of the intersection, ensuring it's always there
  {
    [key: string]: any; // Allow additional dynamic properties
    type?: AllTypes; // Include the 'type' property with AllTypes union
  };
// Define the DetailsProps interface with the generic CommonData type


export type { CommonData, ConditionalCommonData, Customizations, DocumentContent, SharedTimestamps, StatusTrackable, SupportedData, Timestamped };

