// components/Details.tsx
import ListGenerator from "@/app/generators/ListGenerator";
import { observer } from "mobx-react-lite";
import React from "react";
import CommonEvent from "../../state/stores/CommonEvent";
import { DetailsItem } from "../../state/stores/DetailsListStore";
import { CommonData, Customizations } from "../CommonData";
import { Data } from "./Data";

export type DataAndEventDetails = Data | CommonEvent;

interface DetailsProps<T> {
  data?: CommonData<T>; // Make data prop optional
  details: DetailsItem<T>;
  customizations?: Customizations<T>;
  collaborationOptions?: CollaborationOptions;
}

const Details: React.FC<DetailsProps<DataAndEventDetails>> = observer(
  ({ details, data, collaborationOptions }) => {
    return (
      <div>
        <h3>{details.title}</h3>
        {details.phase && ( // Check if details.phase is not null or undefined
          <div>
            <p>Phase Description: {details.phase.description || "N/A"}</p>
            <p>Phase Name: {details.phase.name || "N/A"}</p>
          </div>
        )}
        <p>
          Team Members: {details.teamMembers?.join(", ") || "No team members"}
        </p>
        {/* Update the rendering of Start Date and End Date */}
        <p>
          Start Date:{" "}
          {details.phase?.startDate &&
          typeof details.phase.startDate !== "boolean"
            ? new Date(Number(details.phase.startDate)).toLocaleDateString()
            : "N/A"}
        </p>
        <p>
          End Date:{" "}
          {details.phase?.endDate && typeof details.phase.endDate !== "boolean"
            ? new Date(Number(details.phase.endDate)).toLocaleDateString()
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
            {/* Ensure collaborationOptions is an array and then map over it */}
            <ul>
              {/* Use ListGenerator component to render collaborationOptions */}
              <ListGenerator
                items={
                  Array.isArray(collaborationOptions)
                    ? collaborationOptions
                    : []
                }
              />
            </ul>
          </ul>
        </div>
        {/* Display cryptocurrency event details */}
        <div>
          <h4>Cryptocurrency Event Details</h4>
          <p>Event Title: {data?.title}</p>
          <p>Description: {data?.description}</p>
          <p>
            Start Date:{" "}
            {details.phase?.startDate
              ? new Date(details.phase.startDate).toLocaleDateString()
              : "N/A"}
          </p>
          <p>
            End Date:{" "}
            {details.phase?.endDate
              ? new Date(details.phase.endDate).toLocaleDateString()
              : "N/A"}
          </p>

          {/* Add more properties as needed */}
        </div>
      </div>
    );
  }
);

export default DetailsProps;
Details;
