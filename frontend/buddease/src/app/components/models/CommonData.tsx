// CommonDetails.tsx
import React, { useState } from "react";
import { CommunityData } from "../community/CommunityDetails";
import { DocumentData } from "../documents/DocumentBuilder";
import { Todo } from "../todos/Todo";
import { UserData } from "../users/User";
import { TaskData } from "./data/Data";
// Define a generic type for data
interface CommonData<T> {
  data: T;
}

// Define a union type for the supported data types
type SupportedData =
  UserData
  | TaskData
  | DocumentData
  | CommunityData
  | Todo
  | { [key: string]: any };

// Define the DetailsProps interface with the generic CommonData type
interface DetailsProps {
  data: CommonData<SupportedData>;
}

const CommonDetails: React.FC<DetailsProps> = ({ data }) => {
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
          {Object.entries(data.data).map(([key, value]) => (
            <p key={key}>
              {key}: {value}
            </p>
          ))}
        </div>
      )}
    </div>
  );
};


export default CommonDetails;
