// CommonDetails.tsx
import { Label } from "@/app/components/projects/branding/BrandingSettings";
import { StructuredMetadata } from "@/app/configs/StructuredMetadata";
import { CacheData } from "@/app/generators/GenerateCache";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { MeetingData } from "../calendar/MeetingData";
import { ScheduledData } from "../calendar/ScheduledData";
import { CryptoData } from "../crypto/parseData";
import { ModifiedDate } from "../documents/DocType";
import { DocumentData } from "../documents/DocumentBuilder";
import { DocumentTypeEnum } from "../documents/DocumentGenerator";
import { FakeData } from "../intelligence/FakeDataGenerator";
import { CollaborationOptions } from "../interfaces/options/CollaborationOptions";
import AnimationTypeEnum from "../libraries/animations/AnimationLibrary";
import { Category } from "../libraries/categories/generateCategoryProperties";
import { ProjectData } from "../projects/Project";
import { TagsRecord } from "../snapshots";
import { Snapshot } from "../snapshots/LocalStorageSnapshotStore";
import { AllStatus, DetailsItem } from "../state/stores/DetailsListStore";
import { NotificationType } from "../support/NotificationContext";
import { Todo } from "../todos/Todo";
import { TradeData } from "../trading/TradeData";
import { AllTypes } from "../typings/PropTypes";
import { UserData } from "../users/User";
import AccessHistory from "../versions/AccessHistory";
import { CommunityData } from "./CommunityData";
import { LogData } from "./LogData";
import { BaseData, Data, DataDetails } from "./data/Data";
import DetailsProps from "./data/Details";
import FolderData from "./data/FolderData";
import { RealtimeDataComponent } from "./realtime/RealtimeData";
import { Task } from "./tasks/Task";
import TeamData from "./teams/TeamData";
import { Member } from "./teams/TeamMembers";
import { TodoStatus, TaskStatus, TeamStatus, DataStatus, CalendarStatus, NotificationStatus, BookmarkStatus, PriorityTypeEnum } from "./data/StatusType";
import { T, K } from "./data/dataStoreMethods";


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

interface UserOwned {
  createdBy: string | undefined;
  assignedUser?: string | null;
  documentOwner?: string;
}


interface Taggable {
  tags?: TagsRecord<T, K<T>> | string[] | undefined;
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


// Define a generic type for data
interface CommonData<
  T extends BaseData<T>,
  K extends T = T,
  Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>> 
  extends Identifiable,
  UserOwned,
  Describable,
  Timestamped,
  Taggable,
  DocumentContent,
  AccessControlled,
  CounterTrackable {
    _id?: string;
    id?: string | number | undefined;
    title?: string;
    type?: AllTypes;
    label: Label;
    timestamp?: string | number | Date | undefined;
    blockNumber?: number | undefined
    transactionHash?: string | undefined
    event?: string;
    signature?: string;
    email?: string;
    username?: string;
    name?: string
    description?: string | null | undefined;
    startDate?: Date;
    value?: any
    eventId?: string | null | undefined;
    endDate?: Date;
    status?: AllStatus | null;
    collaborationOptions?: CollaborationOptions[] | undefined;
    participants?: Member[];
    metadata?: StructuredMetadata<T, K> | undefined;
    details?: DetailsItem<T>
    // data?: T extends CommonData<infer R> ? R : never;
    projectId?: string;
    tags?: TagsRecord<T, K> | string[] | undefined; 
    categories?: string[];
    documentType?: DocumentTypeEnum | string | null;
    documentStatus?: string;
    documentOwner?: string;
    documentCreationDate?: Date;
    documentLastModifiedDate?: Date;
    documentVersion?: number;
    documentContent?: string;
    keywords?: string[];
    options?: {
      // ...
      additionalOptions: readonly string[] | string | number | any[] | undefined;
      // documentOptions: DocumentOptions
      // ...
    };
    folderPath?: string;
    previousMetadata?: StructuredMetadata<T, K>;
    currentMetadata?: StructuredMetadata<T, K>;
    accessHistory?: AccessHistory[];
    folders?: FolderData[];
    lastModifiedDate?: ModifiedDate;
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
    then?: <T extends  BaseData<T>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(callback: (newData: Snapshot<BaseData, K>) => void) => Snapshot<T, K> | undefined;
    // then?: <T extends  BaseData<T>, K extends keyof BaseData = keyof BaseData>(callback: (newData: Snapshot<BaseData, K>) => void) => Snapshot<Data, K> | undefined;

    // Moved from VideoCommonData
    createdBy: string | undefined; // Moved to common data
    updatedAt?: Date; // Moved to common data
    viewsCount?: number; // Could be generalized if relevant across content types
    likesCount?: number; // Could be generalized if relevant across content types
    commentsCount?: number; // Could be generalized if relevant across content types
    category?: symbol | string | Category | undefined,
    isPrivate?: boolean; // General property
    isUnlisted?: boolean; // General property
    isLicensedContent?: boolean; // General property
    isFamilyFriendly?: boolean; // General property
    isEmbeddable?: boolean; // General property
    isDownloadable?: boolean; // General property
}
interface Customizations<T> {
  [key: string]: (value: any) => React.ReactNode;
}
 
export type DataType = NotificationType | string | DocumentTypeEnum | AnimationTypeEnum;
export type TaskType = "addTask" | "removeTask" | "bug" | "feature" | "epic" | "story" | "task";

// Define a union type for the supported data types
type SupportedData<
  T extends  BaseData<T>,
  K extends T = T,

> = UserData &
  Data<T> &
  Todo<T, K> &
  Task<T, K> &
  // TaskType & 
  CommunityData &
  DocumentData<T, K> &
  ProjectData &
  TeamData<T, K> &
  CacheData &
  ScheduledData &
  MeetingData &
  CryptoData &
  LogData &
  DataDetails<T, K> &
  DataType &
  TradeData &
  CommonData<T> &
  // BugType & 
  FakeData & {
  [key: string]: any
  type?: AllTypes; // Include the 'type' property with the DataType union type
  };

// Define the DetailsProps interface with the generic CommonData type

const CommonDetails = <T extends SupportedData<T>>({
  data,
  details,
  customizations,
}: DetailsProps<T>) => {
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
                  Date: {data.startDate.toLocaleDateString()} to{" "}
                  {data.endDate.toLocaleDateString()}
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
         date={data?.date ? new Date(data.date).toString() : new Date().toString()} // Handles both `string` and `Date`
         userId={userId}
         dispatch={dispatch}
         value={data?.value || ""} // Match `RealtimeDataItem.value: string`
         eventId={data?.eventId || ""} // Match `EventData.eventId: string`
         type={data?.type || {} as AllTypes} // Correct `AllTypes` type assignment
         timestamp={data?.timestamp ? new Date(data.timestamp).toString() : new Date().toString()} // Handles both `string` and `Date`
         blockNumber={data?.blockNumber != null ? data.blockNumber.toString() : ""} // Convert `string | number | bigint | undefined` to `string`
         transactionHash={data?.transactionHash || ""} // Add fallback value `""` if `transactionHash` is `undefined`
         event={data?.event || ""} // Add fallback value `""` if `event` is `undefined`
         signature={data?.signature || ""} // Add fallback value `""` if `signature` is `undefined`
      />
    </div>
  );
};

export default CommonDetails;
export type { CommonData, Customizations, StatusTrackable, SupportedData, Timestamped };

