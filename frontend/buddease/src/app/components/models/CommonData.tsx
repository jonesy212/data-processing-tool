// CommonDetails.tsx
import { CacheData } from "@/app/generators/GenerateCache";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import RealtimeData from "../../../../models/realtime/RealtimeData";
import { FakeData } from "../Inteigents/FakeDataGenerator";
import { ScheduledData } from "../calendar/ScheduledData";
import { DocumentData } from "../documents/DocumentBuilder";
import { ProjectData } from "../projects/Project";
import { Todo } from "../todos/Todo";
import { UserData } from "../users/User";
import { CommunityData } from "./CommunityData";
import LogData from "./LogData";
import { Data } from "./data/Data";
import { Task } from "./tasks/Task";
import TeamData from "./teams/TeamData";

// Define a generic type for data
interface CommonData<T> {
  title?: React.ReactNode;
  description?: React.ReactNode;
  data?: T;
}

interface Customizations<T> {
  [key: string]: (value: any) => React.ReactNode;
}

// Define a union type for the supported data types
type SupportedData = UserData &
  Data &
  Todo &
  Task &
  CommunityData &
  DocumentData &
  ProjectData &
  TeamData &
  CacheData &
  ScheduledData &
  LogData &
  FakeData & { [key: string]: any };

// Define the DetailsProps interface with the generic CommonData type
interface DetailsProps<T> {
  data: CommonData<T>;
  customizations?: Customizations<T>;
}
const CommonDetails: React.FC<DetailsProps<SupportedData>> = ({
  data,
  customizations,
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const userId = localStorage.getItem("id");
  const dispatch = useDispatch();

  const toggleDetails = () => {
    setShowDetails((prev) => !prev);
  };

  return (
    <div>
      <button onClick={toggleDetails}>Toggle Details</button>
      {showDetails && data.data && (
        <div>
          <h3>Details</h3>
          {/* Handle different data types here */}
          {Object.entries(data.data).map(([key, value]) => {
            if (React.isValidElement(value)) {
              return (
                <p key={key}>
                  {key}: {value}
                </p>
              );
            } else {
              return (
                <p key={key}>
                  {key}: {String(value)}
                </p>
              );
            }
          })}

          {showDetails && data.data && (
            <div>
              <h3>Details</h3>
              {/* Handle different data types here */}
              {Object.entries(data.data).map(([key, value]) => {
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
        </div>
      )}

      {/* Include RealtimeData component */}
      <RealtimeData userId={userId} dispatch={dispatch} />
    </div>
  );
};

export default CommonDetails;
export type { CommonData, DetailsProps, SupportedData };
