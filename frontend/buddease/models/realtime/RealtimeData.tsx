import useRealtimeData from "@/app/components/hooks/commHooks/useRealtimeData";
import { CalendarEvent } from "@/app/components/state/stores/CalendarEvent";
import React, { useEffect } from "react";



interface RealtimeDataItem {
  id: string;
  name: string;
  forEach: (callback: (item: RealtimeDataItem) => void) => void;
  // Add other properties of RealtimeDataItem here
}

interface RealtimeData {
  id: string; // Example property
  name: string; // Example property
  // Define other properties of RealtimeData here
}

interface RealtimeDataProps {
  userId: any; // Define the type of userId here
  dispatch: (action: any) => void; // Assuming dispatch is a function that takes an action
}

const RealtimeData: React.FC<RealtimeDataProps> = ({ userId, dispatch }) => {
  // Initial data can be an empty array or any initial state you want
  const initialData: any[] = [];

  // Custom update callback function
  // Adjust the type of updateCallback to match the expected signature
  const updateCallback: (events: Record<string, CalendarEvent[]>) => void = (events: Record<string, CalendarEvent[]>) => {
    // Your update logic here
    // For example, you can directly use the updated events data
    Object.keys(events).forEach((eventId: string) => {
      const calendarEvents = events[eventId];
      // Perform actions based on each calendar event
      calendarEvents.forEach((event: CalendarEvent) => {
        // Example: Update UI or trigger notifications based on the event
        console.log(`Updated event with ID ${eventId}:`, event);
      });
    });
  };




  // Get realtime data and fetchData function from the hook
  const { realtimeData, fetchData } = useRealtimeData(
    initialData,
    updateCallback
  );

  // You can use useEffect to perform any side effects related to the realtime data
  useEffect(() => {
    // Example of fetching data on component mount
    fetchData(userId, dispatch);
  }, []);

  return (
    <div>
      {/* Display your realtime data in the component */}
      {realtimeData.map((dataItem: any, index: any) => (
        <div key={index}>
          {/* Display each data item */}
          {/* Example: <p>{dataItem}</p> */}
        </div>
      ))}
    </div>
  );
};

export default RealtimeData;
