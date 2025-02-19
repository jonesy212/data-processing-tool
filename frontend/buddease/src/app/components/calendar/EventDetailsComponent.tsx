import ProjectEventEmitter from "@/app/ts/EventEmitter";
import React, { useEffect, useState } from "react";
import { enhancePromptWithEntities } from "../intelligence/EventEmitterIntegration";
import {
    CalendarEventViewingDetailsProps,
    EventDetails,
} from "./CalendarEventViewingDetails";
// Assuming you have a function named fetchEventDetails that fetches event details
// and eventId is available in the scope where you use EventDetailsComponent
const eventDetailsFunction = async () => {
  try {
    const response = await fetchEventDetails(eventId);
    return response.data; // Assuming response.data contains the event details
  } catch (error) {
    console.error("Error fetching event details:", error);
    return {}; // Return empty object in case of an error
  }
};


const EventDetailsComponent: React.FC<CalendarEventViewingDetailsProps>  = ({
  eventId,
  eventDetails,
}) => {
  const [details, setDetails] = useState<EventDetails>({} as EventDetails);

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        // Assuming eventDetails is a function that fetches details
        const newDetails = await eventDetails(); 
        setDetails(newDetails);
      } catch (error) {
        console.error("Error fetching event details:", error);
      }
    };

    fetchEventDetails();
  }, [eventDetails]);

  const updateEventDetails = (newDetails: EventDetails) => {
    setDetails(newDetails);
    // Emit a project-specific event when event details are updated
    ProjectEventEmitter.emitProjectEvent({
      projectId: "exampleProjectId",
      eventName: "eventDetailsUpdated",
      eventData: newDetails,
    });
  };

  // Define a sample prompt and entities
  const samplePrompt = "Schedule a meeting with {entity1} for {activeDashboard}.";
  const sampleEntities = { entity1: "John Doe" };
  const sampleUserContext = { activeDashboard: "Team Meeting" };

  // Call the enhancePromptWithEntities function
  const enhancedPrompt = enhancePromptWithEntities(
    samplePrompt,
    sampleEntities,
    sampleUserContext
  );

  // Log the enhanced prompt
  console.log("Enhanced Prompt:", enhancedPrompt);

  return (
    <div>
      <h3>Event Details for Event ID: {eventId}</h3>
      <p>Title: {details.title}</p>
      <p>Description: {details.description}</p>
      <p>Status: {details.status}</p>
      <p>Date: {details.date}</p>
      <p>Start Time: {details.startTime}</p>
      <p>End Time: {details.endTime}</p>
      {/* Render additional event details as needed */}
      
    </div>
  );
};

export default EventDetailsComponent;

// exampe usage:

// Render EventDetailsComponent and pass the eventDetailsFunction as a prop
{/* <EventDetailsComponent eventId={eventId} eventDetails={eventDetailsFunction} /> */}

