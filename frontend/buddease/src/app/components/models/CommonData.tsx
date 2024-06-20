// CommonDetails.tsx
import React from "react";

import { StructuredMetadata } from "@/app/configs/StructuredMetadata";
import { CacheData } from "@/app/generators/GenerateCache";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { MeetingData } from "../calendar/MeetingData";
import { ScheduledData } from "../calendar/ScheduledData";
import { CryptoData } from "../crypto/parseData";
import { DocumentData } from "../documents/DocumentBuilder";
import { DocumentTypeEnum } from "../documents/DocumentGenerator";
import { FakeData } from "../intelligence/FakeDataGenerator";
import { CollaborationOptions } from "../interfaces/options/CollaborationOptions";
import AnimationTypeEnum from "../libraries/animations/AnimationLibrary";
import { ProjectData } from "../projects/Project";
import { AllStatus, DetailsItem } from "../state/stores/DetailsListStore";
import { NotificationType } from "../support/NotificationContext";
import { Todo } from "../todos/Todo";
import { TradeData } from "../trading/TradeData";
import { AllTypes } from "../typings/PropTypes";
import { UserData } from "../users/User";
import { CommunityData } from "./CommunityData";
import { LogData } from "./LogData";
import { Data, DataDetails } from "./data/Data";
import DetailsProps from "./data/Details";
import { RealtimeDataComponent } from "./realtime/RealtimeData";
import { Task } from "./tasks/Task";
import TeamData from "./teams/TeamData";
import { Member } from "./teams/TeamMembers";
import { Tag } from "./tracker/Tag";
import { Snapshot } from "../snapshots/LocalStorageSnapshotStore";
// Define a generic type for data
interface CommonData{
  id: string;
  _id?: string;
  title?: string;
  type?: AllTypes;

  email?: string;
  username?: string;
  description?: string | null | undefined;
  startDate?: Date;
  endDate?: Date;
  status?: AllStatus;
  collaborationOptions?: CollaborationOptions[] | undefined;
  participants?: Member[];
  metadata?: StructuredMetadata;
  details?: DetailsItem<DataDetails>
  // data?: T extends CommonData<infer R> ? R : never;
  projectId?: string;
  tags?: string[] | Tag[];
  categories?: string[];
  documentType?: string;
  documentStatus?: string;
  documentOwner?: string;
  documentAccess?: string;
  documentSharing?: string;
  documentSecurity?: string;
  documentRetention?: string;
  documentLifecycle?: string;
  documentWorkflow?: string;
  documentIntegration?: string;
  documentReporting?: string;
  documentBackup?: string;
  date?: Date | undefined;
  completed?: boolean;
  then?: (callback: (newData: Snapshot<Data>) => void) => void | undefined

}

interface Customizations<T> {
  [key: string]: (value: any) => React.ReactNode;
}




export type DataType = NotificationType | string | DocumentTypeEnum | AnimationTypeEnum;
export type TaskType = "addTask" | "removeTask" | "bug" | "feature" | "epic" | "story" | "task";

// Define a union type for the supported data types
type SupportedData = UserData &
  Data &
  Todo &
  Task &
  TaskType & 
  CommunityData &
  DocumentData &
  ProjectData &
  TeamData &
  CacheData &
  ScheduledData &
  MeetingData &
  CryptoData &
  LogData &
  DataDetails &
  DataType &
  TradeData &
  CommonData &
  // BugType & 
  FakeData & {
  [key: string]: any
  type?: AllTypes; // Include the 'type' property with the DataType union type

  };

// Define the DetailsProps interface with the generic CommonData type

const CommonDetails = <T extends SupportedData>({
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
                  {key}: {value as React.ReactNode}
                </p>
              ))}
            </div>
          )}
          {details && (
            <div>
              <h4>Additional Details</h4>
              {Object.entries(details).map(([key, value]) => (
                <p key={key}>
                  {key}: {value as React.ReactNode}
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
                    {data.tags &&
                      data.tags.map((tag, index) => (
                        <li key={index}>
                          {typeof tag === "string" ? tag : tag.getOptions.name}
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
                  {key}: {value as React.ReactNode}
                </p>
              );
            }
          })}
        </div>
      )}

      {/* Include RealtimeData component */}
      <RealtimeDataComponent
        id={data?._id || ""}
        name={data?.username || ""}
        date={data?.startDate || "No date"}
        userId={userId}
        dispatch={dispatch}
        value={""}
        eventId={"realtimeId"}
        type={"realtimeType"}
        timestamp={timestamp}
      />
    </div>
  );
};

export default CommonDetails;
export type { CommonData, Customizations, SupportedData };
