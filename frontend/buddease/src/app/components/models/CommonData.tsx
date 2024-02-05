// CommonDetails.tsx
import React, { useState } from "react";
import { DocumentData } from "../documents/DocumentBuilder";
import { ProjectData } from "../projects/Project";
import { Todo } from "../todos/Todo";
import { UserData } from "../users/User";
import { CommunityData } from "./CommunityData";
import { Data } from "./data/Data";
import { Task } from "./tasks/Task";
import TeamData from "./teams/TeamData";


// Define a generic type for data
interface CommonData<T> {
  title?: React.ReactNode
  description?: React.ReactNode;
  data: T;
}

// Define a union type for the supported data types
type SupportedData =
  UserData
  | Data
  | Todo
  | Task
  | CommunityData
  | DocumentData
  | ProjectData
  | TeamData
  | { [key: string]: any };



// Define the DetailsProps interface with the generic CommonData type
interface DetailsProps<T> {
  data: CommonData<T>;
}

const CommonDetails: React.FC<DetailsProps<SupportedData>> = ({ data }) => {
  const [showDetails, setShowDetails] = useState(false);

  const toggleDetails = () => {
    setShowDetails((prev) => !prev);
  };

  return (
    <div>
      <button onClick={toggleDetails}>Toggle Details</button>
      {showDetails && (
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
        </div>
      )}
    </div>
  );
};



export default CommonDetails;
export type { CommonData, DetailsProps, SupportedData };

