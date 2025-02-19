import { CalendarEvent } from '@/app/components/calendar/CalendarEvent';
import useRealtimeData from "@/app/components/hooks/commHooks/useRealtimeData";
import { Data } from "@/app/components/models/data/Data";
import { Snapshot } from "@/app/components/snapshots/LocalStorageSnapshotStore";
import SnapshotStore from "@/app/components/snapshots/SnapshotStore";
import { useEffect, useState } from "react";

export const PersonaBuilderUtils = () => {
  const [realtimeData, setRealtimeData] = useState<any>(null); // Change the initialData type to any

  // Call the useRealtimeData hook with the initialData and updateCallback
  const { realtimeData: updatedRealtimeData, fetchData } = useRealtimeData(
    realtimeData,
    updateCallback
  );

  useEffect(() => {
    setRealtimeData(updatedRealtimeData); // Update the state with the updated realtimeData
  }, [updatedRealtimeData]);

  // Function to add a new calendar event
  const addCalendarEvent = async (newEvent: CalendarEvent) => {
    try {
      // Your logic to add the new calendar event
      console.log("Adding new calendar event:", newEvent);

      // Example: Call an API to add the event to the backend
      // Replace this with your actual API call
      const response = await fetch("your-backend-api-url/calendar/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newEvent),
      });

      if (!response.ok) {
        throw new Error("Failed to add calendar event");
      }

      // Optionally, handle success response
      const data = await response.json();
      console.log("New calendar event added successfully:", data);
    } catch (error) {
      console.error("Error adding calendar event:", error);
      throw error;
    }
  };

  return { realtimeData, fetchData, addCalendarEvent, handleSnapshotUpdate };
};



  // Function to handle snapshot updates with specific data type
  const handleSnapshotUpdate = (snapshot: Snapshot<Data, Data> | undefined) => {
    try {

      if (snapshot) {
        // Access specific data properties from the snapshot directly
        const snapshotData = snapshot.data
        console.log("Snapshot data:", snapshotData);
      }

      // Example: Access specific data properties from the snapshot
      const snapshotData = snapshot?.data
      console.log("Snapshot data:", snapshotData);

      // Example: Perform actions based on the snapshot data
      // Replace this with your actual logic
      if (snapshotData) {
        // Perform actions based on snapshot data properties
      } else {
        // Handle the case when snapshot data is null or undefined
      }
    } catch (error) {
      console.error("Error handling snapshot update:", error);
      // Handle errors or throw them further as needed
      throw error;
    }
  };


// Define your update callback function
const updateCallback = (
  events: Record<string, CalendarEvent[]>,
  snapshotStore: SnapshotStore<Snapshot<Data, Data>>
) => {
  // Your update logic here

  // Perform any additional logic based on the updated events data
  // For example, you can iterate through the events and perform specific actions
  Object.keys(events).forEach((eventId) => {
    const calendarEvents = events[eventId];
    // Perform actions based on each calendar event
    calendarEvents.forEach((event) => {
      // Example: Update UI or trigger notifications based on the event
      console.log(`Updated event with ID ${eventId}:`, event);
    });
  });

  // Perform any additional logic based on the updated snapshotStore
  // For example, you can update the snapshotStore or trigger other actions
  const snapshot = snapshotStore.getSnapshot(snapshot);
  handleSnapshotUpdate(snapshot); // Call the handleSnapshotUpdate function
};

export default PersonaBuilderUtils;
