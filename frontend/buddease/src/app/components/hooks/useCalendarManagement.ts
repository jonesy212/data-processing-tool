import { useEffect } from "react";
import {
  CalendarEvent,
  useCalendarManagerStore,
} from "../state/stores/CalendarStore";
import NOTIFICATION_MESSAGES from "../support/NotificationMessages";
const useCalendarManagement = () => {
  const calendarManagerStore = useCalendarManagerStore();

  useEffect(() => {
    calendarManagerStore.fetchEventsRequest();

    const fetchCalendarEvents = async () => {
      try {
        const response = await fetch("/api/calendar-events");
        const calendarEventsData = await response.json();
        calendarManagerStore.fetchEventsSuccess({
          calendarEvents: calendarEventsData.calendarEvents,
        });
      } catch (error) {
        console.error("Error fetching calendar events:", error);
        // Use optional chaining to safely access the message property
        const errorMessage = (error as { message?: string })?.message;

        // Use a default error message if the 'message' property is not available
        const defaultErrorMessage =
          NOTIFICATION_MESSAGES.Error.DEFAULT("unknown error");

        calendarManagerStore.fetchEventsFailure({
          error: errorMessage || defaultErrorMessage,
        });
      }
    };

    fetchCalendarEvents();
  }, []);

  const addCalendarEvent = async (newEvent: Omit<CalendarEvent, "id">) => {
    try {
      const response = await fetch("/api/calendar-events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newEvent),
      });

      if (response.ok) {
        const createdEvent: CalendarEvent = await response.json();
        calendarManagerStore.addEventSuccess({ event: createdEvent });
      } else {
        console.error("Failed to add calendar event:", response.statusText);
      }
    } catch (error) {
      console.error("Error adding calendar event:", error);
    }
  };

  // Add more methods as needed

  return { calendarManagerStore, addCalendarEvent };
};

export default useCalendarManagement;
