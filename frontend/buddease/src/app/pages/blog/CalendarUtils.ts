// CalendarUtils.ts

import { CalendarEvent } from "@/app/components/state/stores/CalendarEvent";
import { useState } from "react";





// Define a custom hook to manage calendar events
export const useCalendarEvents = () => {
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);

  // Function to set calendar events
  const setEvents = (events: CalendarEvent[]) => {
    setCalendarEvents(events);
  };

  return {
    calendarEvents,
    setEvents,
  };
};

// Function to add events to the calendar
export const setCalendarEvents = async (events: CalendarEvent[]) => {
  try {
    // Your logic to update the calendar state with new events
    // For example, if you're using a state management library like Redux:
    // dispatch({ type: 'SET_CALENDAR_EVENTS', payload: events });
    // Or if you're using component state:
    // setCalendarEvents(events);
    console.log("Calendar events updated successfully.");
  } catch (error) {
    console.error("Error setting calendar events:", error);
    throw error; // Optionally rethrow the error for error handling in the caller
  }
};
