// components/Details.tsx
import { observer } from "mobx-react-lite";
import React from "react";
import { DetailsItem } from "../../state/stores/DetailsListStore";
import { CommonData, Customizations } from "../CommonData";
import { Data } from "./Data";


interface DetailsProps<T> {
  data?: CommonData<T>; // Make data prop optional
  details: DetailsItem<T>;
  customizations?: Customizations<T>;
}




const Details: React.FC<DetailsProps<Data>> = observer(({ details }) => {
  return (
    <div>
      <h3>{details.title}</h3>
      <p>Phase Description: {details.phase.description}</p>
      <p>Phase Name: {details.phase.name}</p>
      <p>
        Team Members: {details.teamMembers?.join(", ") || "No team members"}
      </p>
      <p>
        Start Date:{" "}
        {details.phase.startDate
          ? new Date(details.phase.startDate).toLocaleDateString()
          : "N/A"}
      </p>
      <p>
        End Date:{" "}
        {details.phase.endDate
          ? new Date(details.phase.endDate).toLocaleDateString()
          : "N/A"}
      </p>
      <div>
        <strong>Communication:</strong>
        <ul>
          {/* Update the logic based on the structure of details.communication */}
          {/* For example, if details.communication represents a specific action, access its properties accordingly */}
          <li>
            Audio:{" "}
            {details.communication && "audio" in details.communication
              ? details.communication.audio
              : "N/A"}
          </li>
          <li>
            Video:{" "}
            {details.communication && "video" in details.communication
              ? details.communication.video
              : "N/A"}
          </li>
          <li>
            Text:{" "}
            {details.communication && "text" in details.communication
              ? details.communication.text
              : "N/A"}
          </li>
        </ul>
      </div>
      <div>
        <strong>Collaboration Options:</strong>
        <ul>
          {/* Ensure collaborationOptions exists before mapping over it */}
          {details.data?.collaborationOptions?.map(
            (option: any, index: any) => (
              <li key={index}>{option}</li>
            )
          )}
        </ul>
      </div>
    </div>
  );
});
  
export default DetailsProps; Details;
