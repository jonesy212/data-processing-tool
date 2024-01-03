// CalendarStore.ts
import { makeAutoObservable } from 'mobx';
import { useState } from 'react';
import { CalendarEvent } from "../../models/calendar/CalendarEvent";
import NOTIFICATION_MESSAGES from '../../support/NotificationMessages';
import SnapshotStore from "./SnapshotStore";

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  date: Date;
  startTime?: string;
  endTime?: string;
  recurring?: boolean;
  recurrenceRule?: string; // You can use a specific format for recurring rules
  category?: string;
  // Add other properties as needed
}


export interface CalendarManagerStore {
  events: Record<string, CalendarEvent[]>;
  eventTitle: string;
  eventDescription: string;
  eventStatus: "scheduled" | "inProgress" | "completed";
  assignedEventStore: AssignEventStore;
  updateEventTitle: (title: string) => void;
  updateEventDescription: (description: string) => void;
  updateEventStatus: (status: "scheduled" | "inProgress" | "completed") => void;
  updateEventDate: (eventId: string, eventDate: Date) => void;
  addEvent: (event: CalendarEvent) => void;
  addEvents: (events: CalendarEvent[]) => void;
  removeEvent: (eventId: string) => void;
  removeEvents: (eventIds: string[]) => void;
  fetchEventsSuccess: (payload: { events: CalendarEvent[] }) => void;
  fetchEventsFailure: (payload: { error: string }) => void;
  fetchEventsRequest: () => void;
  completeAllEventsSuccess: () => void;
  completeAllEvents: () => void;
  completeAllEventsFailure: (payload: { error: string }) => void;
  NOTIFICATION_MESSAGE: string;
  NOTIFICATION_MESSAGES: typeof NOTIFICATION_MESSAGES;
  setDynamicNotificationMessage: (message: string) => void;
  snapshotStore: SnapshotStore<Record<string, CalendarEvent[]>>; // Include a SnapshotStore for events

  // Add more methods or properties as needed
}


const useCalendarManagerStore = (): CalendarManagerStore => {
  const [events, setEvents] = useState<Record<string, CalendarEvent[]>>({
    scheduled: [],
    inProgress: [],
    completed: [],
  });
  const [eventTitle, setEventTitle] = useState<string>("");
  const [eventDescription, setEventDescription] = useState<string>("");
  const [eventStatus, setEventStatus] = useState<
    "scheduled" | "inProgress" | "completed"
  >("scheduled");
  const [NOTIFICATION_MESSAGE, setNotificationMessage] = useState<string>(''); // Initialize it with an empty string

  // Include the AssignEventStore
  const assignedEventStore = useAssignEventStore();
  // Initialize SnapshotStore
  const snapshotStore = new SnapshotStore<Record<string, CalendarEvent[]>>();

  // Method to reassign an event to a new user
  const reassignEvent = (eventId: string, oldUserId: string, newUserId: string) => {
    assignedEventStore.reassignUser(eventId, oldUserId, newUserId);
    // You can add additional logic or trigger notifications as needed
    setDynamicNotificationMessage(NOTIFICATION_MESSAGES.OperationSuccess.DEFAULT);
  };

  const updateEventTitle = (title: string) => {
    setEventTitle(title);
  };

  const updateEventDescription = (description: string) => {
    setEventDescription(description);
  };

  const updateEventStatus = (status: "scheduled" | "inProgress" | "completed") => {
    setEventStatus(status);
  };

  const addEvent = () => {
    // Ensure the title is not empty before adding an event
    if (eventTitle.trim().length === 0) {
      console.error("Event title cannot be empty.");
      return;
    }

    const newEvent: CalendarEvent = {
      id: Date.now().toString(),
      title: eventTitle,
      description: eventDescription,
      status: eventStatus,
      date: new Date(), // You may want to replace this with the actual date logic
    };

    setEvents((prevEvents) => {
      const eventId = newEvent.id;
      return { ...prevEvents, [eventId]: [...(prevEvents[eventId] || []), newEvent] };
    });

    // Reset input fields after adding an event
    setEventTitle("");
    setEventDescription("");
    setEventStatus("scheduled");
  };

  const removeEvent = (eventId: string) => {
    setEvents((prevEvents: Record<string, CalendarEvent[]>) => {
      const updatedEvents = { ...prevEvents };
      delete updatedEvents[eventId];
      return updatedEvents;
    });
  };

  const removeEvents = (eventIds: string[]) => {
    setEvents((prevEvents) => {
      const updatedEvents = { ...prevEvents };
      eventIds.forEach((eventId) => {
        delete updatedEvents[eventId];
      });
      return updatedEvents;
    });
  };

  const addEvents = (eventsToAdd: CalendarEvent[]) => {
    // Ensure at least one event is passed
    if (eventsToAdd.length === 0) {
      console.error("At least one event must be passed");
      return;
    }

    setEvents((prevEvents) => {
      eventsToAdd.forEach((event) => {
        const eventId = event.id;
        prevEvents[eventId] = [...(prevEvents[eventId] || []), event];
      });
      return prevEvents;
    });

    // Reset input fields after adding events
    setEventTitle("");
    setEventDescription("");
    setEventStatus("scheduled");
  };

  const fetchEventsSuccess = (payload: { events: CalendarEvent[] }) => {
    const { events: newEvents } = payload;
    setEvents((prevEvents) => {
      const updatedEvents = { ...prevEvents };

      newEvents.forEach((event) => {
        if (!prevEvents[event.id]) {
          prevEvents[event.id] = [];
        }
        prevEvents[event.id].push(event);
      });

      return updatedEvents;
    });
  };

  const updateEventDate = (eventId: string, eventDate: Date) => {
    const updatedEvents = { ...events };

    // Find the event and update its date
    const eventToUpdate = updatedEvents.scheduled.find(
      (event: CalendarEvent) => event.id === eventId
    );

    if (eventToUpdate) {
      eventToUpdate.date = eventDate;
    } else {
      // Event not found, throw error or handle gracefully
    }

    // Update the events in the store
    setEvents(updatedEvents);
  };

  const completeAllEventsSuccess = () => {
    console.log("All Events completed successfully!");
    // You can add additional logic or trigger notifications as needed
    setDynamicNotificationMessage(NOTIFICATION_MESSAGES.OperationSuccess.DEFAULT);
  };

  const completeAllEvents = () => {
    console.log("Completing all Events...");
    // You can add loading indicators or other UI updates here

    // Simulate asynchronous completion
    setTimeout(() => {
      // Update events to mark all as done
      setEvents((prevEvents: Record<string, CalendarEvent[]>) => {
        const updatedEvents = { ...prevEvents };
        Object.keys(updatedEvents).forEach((id) => {
          updatedEvents[id] = prevEvents[id].map((event) => ({
            ...event,
            status: 'completed',
          }));
        });
        return updatedEvents;
      });

      // Trigger success
      completeAllEventsSuccess();
    }, 1000);
  };

  const fetchEventsFailure = (payload: { error: string }) => {
    console.error("Fetch Events Failure:", payload.error);
    // You can add additional logic or trigger notifications as needed
    setDynamicNotificationMessage(NOTIFICATION_MESSAGES.Error.ERROR_FETCHING_DATA);
  };

  const fetchEventsRequest = () => {
    console.log("Fetching Events...");
    // You can add loading indicators or other UI updates here
    setDynamicNotificationMessage(NOTIFICATION_MESSAGES.DataLoading.PAGE_LOADING);
  };

  const completeAllEventsFailure = (payload: { error: string }) => {
    console.error("Complete All Events Failure:", payload.error);
    // You can add additional error handling or trigger notifications as needed
    setDynamicNotificationMessage(NOTIFICATION_MESSAGES.Error.PROCESSING_BATCH);
  };

  // Function to set a dynamic notification message
  const setDynamicNotificationMessage = (message: string) => {
    setNotificationMessage(message);
  };

  // Add more methods or properties as needed

  makeAutoObservable({
    events,
    eventTitle,
    eventDescription,
    eventStatus,
    assignedEventStore,
    updateEventTitle,
    updateEventDescription,
    updateEventStatus,
    updateEventDate,
    addEvent,
    addEvents,
    removeEvent,
    removeEvents,
    reassignEvent,
    fetchEventsSuccess,
    fetchEventsFailure,
    fetchEventsRequest,
    completeAllEventsSuccess,
    completeAllEvents,
    completeAllEventsFailure,
    NOTIFICATION_MESSAGE,
    NOTIFICATION_MESSAGES,
    setDynamicNotificationMessage,
  });

  return {
    events,
    eventTitle,
    eventDescription,
    eventStatus,
    assignedEventStore,
    snapshotStore,
    NOTIFICATION_MESSAGE,
    NOTIFICATION_MESSAGES,
    updateEventTitle,
    updateEventDescription,
    updateEventStatus,
    updateEventDate,
    addEvent,
    addEvents,
    removeEvent,
    removeEvents,
    fetchEventsSuccess,
    fetchEventsFailure,
    fetchEventsRequest,
    completeAllEventsSuccess,
    completeAllEvents,
    completeAllEventsFailure,
    setDynamicNotificationMessage,
    // Add more methods or properties as needed
  };
};

export { useCalendarManagerStore };
