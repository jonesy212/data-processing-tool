// CommonData.tsx
// CommonDetails.tsx
import { MeetingData } from "@/app/calendar/MeetingData";
import { ScheduledData } from "@/app/calendar/ScheduledData";
import DetailsProps from "@/app/components/models/data/Details";
import { TradeData } from "@/app/components/trading/TradeData";
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { UnifiedMetadata } from "@/app/config/MetaDataOptions";
import { CryptoData } from "@/app/dataIntegration/parseData";
import { ModifiedDate } from "@/app/documents/DocType";
import { Category } from "@/app/libraries/categories/generateCategoryProperties";
import { Taggable } from '@/app/models/tracker/Tag';
import { SharedMetadata } from '@/app/shared/SharedMetadata';
import { NotificationType } from '@/app/features/support/UnifiedNotificationTypes'

import { SharedIdentifiers, SharedTimestamps } from '@/app/documents/RelatedProps';
import { Attachment } from '@/app/documents/attachment/Attachment';
import { DocumentData } from "@/app/documents/editing/DocumentBuilder";
import { RealtimeDataComponent } from '@/app/components/models/realtime/RealtimeDataComponent'
import { FakeData } from "@/app/intelligence/FakeDataGenerator";
import { CollaborationOptions } from "@/app/interfaces/options/CollaborationOptions";
import AnimationTypeEnum from "@/app/libraries/animations/AnimationLibrary";
import { Member } from "@/app/models/members/Member";
import { ProjectData } from "@/app/models/projects/Project";
import { Participant } from "@/app/pages/management/ParticipantManagementPage";
import { Snapshot } from "@/app/snapshots/Snapshot";
import { AllStatus, DetailsItem } from "@/app/state/stores/DetailsListStore";
import { Todo } from "@/app/todos/Todo";
import { AllTypes } from "@/app/typings/PropTypes";
import { DocumentTypeEnum } from "@/app/typings/documentTypes";
import { UserData } from "@/app/users/User";
import AccessHistory from "@/app/versions/AccessHistory";
import { createDefaultVersionData } from '@/app/versions/VersionData';
import { DappProps } from "@/utils/web3/dAppAdapter/DAppAdapterConfig";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { CommunityData } from "./CommunityData";
import { LogData } from "./LogData";
import { BaseData, DataDetails, DataWithOmittedFields } from "./data/Data";
import FolderData from "./data/FolderData";
import { BookmarkStatus, CalendarStatus, DataStatus, NotificationStatus, PriorityTypeEnum, TaskStatus, TeamStatus, TodoStatus } from "./data/StatusType";
import { Task } from "./tasks/Task";
import { TeamData } from "./teams/TeamData";
 
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

