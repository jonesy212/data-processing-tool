// ContentDetails.ts
import React from "react";
import { CollaborationOptions } from "../../interfaces/options/CollaborationOptions";
import EventDetailsComponent from '../../calendar/EventDetailsComponent';
import ListGenerator from "@/app/generators/ListGenerator";
import { CalendarEventViewingDetailsProps } from "../../calendar/CalendarEventViewingDetails";

interface ContentDetails {
  title: string;
  description: string;
  status: string;
  startDate?: string | Date;
  endDate: string;
  phaseName: string;
  phaseDescription: string;
  teamMembers: string[];
  communication: {
    audio: string;
    video: string;
    text: string;
  };
  collaborationOptions: CollaborationOptions[];

  eventDetails: React.FC<CalendarEventViewingDetailsProps>; // Use the props type of EventDetailsComponent
  cryptocurrencyEventDetails?: {
    title: string;
    description: string;
    startDate?: string | Date;
    endDate: string;
    // Add more properties as needed
  };

}

interface ContentDetailsProps {
  details: ContentDetails;
}

const ContentDetails: React.FC<ContentDetailsProps> = ({ details }) => {
  return (
    <div>
      <h3>{details.title}</h3>
      <p>Description: {details.description}</p>
      <p>Status: {details.status}</p>
      <p>Start Date: {details.startDate}</p>
      <p>End Date: {details.endDate}</p>
      <div>
        <strong>Phase:</strong>
        <p>Name: {details.phaseName}</p>
        <p>Description: {details.phaseDescription}</p>
      </div>
      <p>Team Members: {details.teamMembers.join(", ")}</p>
      <div>
        <strong>Communication:</strong>
        <ul>
          <li>Audio: {details.communication.audio}</li>
          <li>Video: {details.communication.video}</li>
          <li>Text: {details.communication.text}</li>
        </ul>
      </div>
      <div>
        <strong>Collaboration Options:</strong>
        <ul>
          <ListGenerator items={details.collaborationOptions} />
        </ul>
      </div>
      <div>
        <h4>Cryptocurrency Event Details</h4>
        <p>Title: {details.cryptocurrencyEventDetails?.title}</p>
        <p>Description: {details.cryptocurrencyEventDetails?.description}</p>
        <p>Start Date: {details.cryptocurrencyEventDetails?.startDate}</p>
        <p>End Date: {details.cryptocurrencyEventDetails?.endDate}</p>
        {/* Add more details for cryptocurrency event as needed */}
      </div>
    </div>
  );
};

export default ContentDetails;
