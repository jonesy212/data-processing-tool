import React from'react';
import { endpoints } from "@/app/api/ApiEndpoints";
import { useEffect, useState } from "react";
import axiosInstance from "../security/csrfToken";

const BASE_API_URL = endpoints.calendar.events;

const None = () => {
  return <></>; // Return an appropriate JSX element
};

// Define interface for event details
interface EventDetails extends CalendarEventViewingDetailsProps {
  title: string;
  description: string;
  status: string;
  date: string;
  startTime: string;
  endTime: string;

  // Add more properties as needed
}

interface CalendarEventViewingDetailsProps {
  // Define props here if needed
  eventId: string;
  title?: string;
  None?: () => JSX.Element;
  date?: string;
  productId?: string;
  eventDetails: React.FunctionComponent<CalendarEventViewingDetailsProps>;
}

const CalendarEventViewingDetails: React.FC<CalendarEventViewingDetailsProps> = ({ None , eventId}) => {
  const [eventDetails, setEventDetails] = useState<EventDetails>({} as EventDetails);
  const [isLoading, setIsLoading] = useState(true);
  
  
  useEffect(() => {
    // Fetch event details from the server
    const fetchEventDetails = async () => {
      // Declare the function as async
      try {
        const response = await axiosInstance.get(`${BASE_API_URL}`);
        setEventDetails(response.data);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching event details:", error);
        setIsLoading(false);
      }
    };

    fetchEventDetails(); // Call the async function
  }, []); // Empty dependency array to run useEffect only once

  return (
    <div className="event-details-container">
      {isLoading ? (
        <div className="loading-spinner"></div>
      ) : (
        <div className="event-details">
          <h2>{eventDetails.title}</h2>
          <p>{eventDetails.description}</p>
          <p>Status: {eventDetails.status}</p>
          <p>Date: {eventDetails.date}</p>
          <p>Start Time: {eventDetails.startTime}</p>
          <p>End Time: {eventDetails.endTime}</p>
          {/* Add more event details as needed */}
        </div>
      )}
    </div>
  );
};

export type { CalendarEventViewingDetailsProps, EventDetails };
export default CalendarEventViewingDetails;
