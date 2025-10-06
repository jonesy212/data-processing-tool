// CommonDetails.tsx
import { MeetingData } from "@/app/calendar/MeetingData";
import { ScheduledData } from "@/app/calendar/ScheduledData";
import { SharedIdentifiers, SharedTimestamps } from '@/app/components/documents/RelatedProps';
import { NotificationType } from '@/app/context/NotificationContext';
import { CryptoData } from "@/app/dataIntegration/parseData";
import { Attachment } from '@/app/documents/Attachment/attachment';
import { ModifiedDate } from "@/app/documents/DocType";
import { DocumentData } from "@/app/documents/DocumentBuilder";
import { FakeData } from "@/app/intelligence/FakeDataGenerator";
import { CollaborationOptions } from "@/app/interfaces/options/CollaborationOptions";
import AnimationTypeEnum from "@/app/libraries/animations/AnimationLibrary";
import { ProjectData } from "@/app/models/projects/Project";
import {  Snapshot } from "@/app/snapshots/Snapshot";
import {  TagsRecord } from "@/app/snapshots/SnapshotWithCriteria";
import { AllStatus, DetailsItem } from "@/app/state/stores/DetailsListStore";
import { Todo } from "@/app/todos/Todo";
import { TradeData } from "@/app/trading/TradeData";
import { AllTypes } from "@/app/typings/PropTypes";
import { DocumentTypeEnum } from "@/app/typings/documents";
import { UserData } from "@/app/users/User";
import { DappProps } from "@/app/utils/web3/dAppAdapter/DAppAdapterConfig";
import AccessHistory from "@/app/versions/AccessHistory";
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/config/BaseConfig';
import { StructuredMetadata } from "@/config/StructuredMetadata";
import { SharedMetadata } from "@/app/shared/MetadataHooks";
import { UnifiedMetadata } from "@/server/database/MetaDataOptions";
import { createDefaultVersionData } from '@/versions/VersionData';
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { CommunityData } from "./CommunityData";
import { LogData } from "./LogData";
import { BaseData, DataDetails, DataWithOmittedFields } from "./data/Data";
import DetailsProps from "@/app/components/models/data/Details";
import FolderData from "./data/FolderData";
import { BookmarkStatus, CalendarStatus, DataStatus, NotificationStatus, PriorityTypeEnum, TaskStatus, TeamStatus, TodoStatus } from "./data/StatusType";
import { RealtimeDataComponent } from "./realtime/RealtimeData";
import { Task } from "./tasks/Task";
import { TeamData } from "./teams/TeamData";
import { Member } from "./teams/TeamMembers";
 
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
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
  > extends SharedTimestamps,
  SharedIdentifiers<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  assignedUser?: string | null;
  documentOwner?: string;
}


interface Taggable<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {
  tags?: TagsRecord<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | string[] | undefined;
  categories?: string[];
  keywords?: string[];
}


interface Describable {
  title?: string;
  description?: string | null | undefined;
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
> = T extends DappProps<T, K, Meta, AttachmentType, ExcludedFields>
  ? CommonData<T, K, Meta, AttachmentType, never, keyof T>  
  : T extends SupportedData<any>
  ? CommonData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> 
  : CommonData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;

// Define a generic type for data
interface CommonData<
  T extends BaseDataEntity = BaseDataEntity,
  K extends T = T,
  Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> extends BaseData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, 
  UserOwned<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  SharedMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  Taggable<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
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
  participants?: Member[];
  members?: Member[];
  metadata?: UnifiedMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  details?: DetailsItem<T>;
  data?: DataWithOmittedFields<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
    
  projectId?: string;
  categories?: string[];
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
  folders?: FolderData[];
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
  then?: <T extends BaseDataEntity,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>
    >(callback: (newData: Snapshot<BaseDataEntity, K>) => void
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
  ExcludedFields extends keyof T = DefaultExcludedFields<T>
> = 
  | UserData<T, K>
  | Todo<T, K, Meta>
  | Task<T, K, Meta>
  | LogData<T, K, Meta>
  | DataDetails<T, K, Meta>;



// Group other types into their own union for flexibility
type AdditionalDataTypes<
  T extends BaseDataEntity = BaseDataEntity,
  K extends T = T,
  Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> = 
| CommunityData
| ProjectData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
| TeamData<T, K, Meta>
| ScheduledData<T>
| MeetingData
| CryptoData
| TradeData
| FakeData;



// Combining common types and additional types using intersection
type SupportedData<
  T extends BaseDataEntity = BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>
> =
  CommonDataTypes<T, K, Meta, ExcludedFields> & // Apply intersection to ensure core data is present
  AdditionalDataTypes<T, K, Meta, ExcludedFields> & // Include additional data types with flexibility
  DocumentData<T, K, Meta> & // DocumentData can be part of the intersection, ensuring it's always there
  {
    [key: string]: any; // Allow additional dynamic properties
    type?: AllTypes; // Include the 'type' property with AllTypes union
  };
// Define the DetailsProps interface with the generic CommonData type



const CommonDetails = <
  T extends SupportedData<BaseData<any, any>>,
  K extends T = T,
>({
  data,
  details,
  customizations,
}: DetailsProps<BaseData<any, any, StructuredMetadata<any, any>>>) => {
  const [showDetails, setShowDetails] = useState(false);
  const userId = localStorage.getItem("id") || "";
  const timestamp = new Date().toISOString();
  const dispatch = useDispatch();

  const toggleDetails = () => {
    setShowDetails((prev) => !prev);
  };

  return (
    <div>
      <button onClick={toggleDetails}>Toggle Details</button>
      {showDetails && (
        <div>
          <h3>Details</h3>
          {data && (
            <div>
              <h4>Data Details</h4>
              {Object.entries(data).map(([key, value]) => (
                <p key={key}>
                  {key}: {String(value)}
                </p>
              ))}
            </div>
          )}
          {details && (
            <div>
              <h4>Additional Details</h4>
              {Object.entries(details).map(([key, value]) => (
                <p key={key}>
                  {key}: {String(value)}
                </p>
              ))}
            </div>
          )}
          {/* Render specific properties in a structured manner */}
          {data && (
            <div>
              <h4>Structured Rendering</h4>
              {data.tags && (
                <div>
                  <p>Tags:</p>
                  <ul>
                    {Object.entries(data.tags).map(([key, value]) => (
                      <li key={key}>
                        {key}: {String(value)}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {data.title && <p>Title: {data.title}</p>}
              {data.description && <p>Description: {data.description}</p>}
              {data.startDate && data.endDate && (
                <p>
                  Date: {new Date(data.startDate).toLocaleDateString()} to{" "}
                  {new Date(data.endDate).toLocaleDateString()}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {showDetails && data && (
        <div>
          <h3>Details</h3>
          {/* Handle different data types here */}
          {Object.entries(data).map(([key, value]) => {
            // Check if a customization function exists for this key
            const renderFunction = customizations && customizations[key];
            if (renderFunction) {
              return renderFunction(value);
            } else {
              // Default rendering if no customization function is provided
              return (
                <p key={key}>
                  {key}: {String(value)}
                </p>
              );
            }
          })}
        </div>
      )}

      {/* Include RealtimeData component */}
      <RealtimeDataComponent
        id={data?.id ? data?.id.toString() : ""} // Updated from `_id` to `id` to match the property (`BaseRealtimeData.id: string`)
        name={data?.name || ""} // Match `RealtimeDataItem.name: string`
        date={data?.date ? new Date(data.date) : new Date()} // Handles both `string` and `Date`
        userId={userId}
        dispatch={dispatch}
        value={data?.value || ""} // Match `RealtimeDataItem.value: string`
        eventId={data?.eventId || ""} // Match `EventData.eventId: string`
        type={data?.type || {} as AllTypes} // Correct `AllTypes` type assignment
        timestamp={data?.timestamp ? new Date(data.timestamp) : new Date()}  // Handles both `string` and `Date`
        blockNumber={data?.blockNumber != null ? data.blockNumber.toString() : ""} // Convert `string | number | bigint | undefined` to `string`
        transactionHash={data?.transactionHash || ""} // Add fallback value `""` if `transactionHash` is `undefined`
        event={data?.event || ""} // Add fallback value `""` if `event` is `undefined`
        signature={data?.signature || ""} // Add fallback value `""` if `signature` is `undefined`
        latestVersion={data?.latestVersion || createDefaultVersionData<BaseData<any>, BaseData<any, any, StructuredMetadata<any, any>, Attachment>>()}
        schema={data?.schema || {}}
      />
    </div>
  );
};                                                            
export default CommonDetails;
export type { CommonData, ConditionalCommonData, Customizations, DocumentContent, SharedTimestamps, StatusTrackable, SupportedData, Taggable, Timestamped };

