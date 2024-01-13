// CalendarStore.ts
import { makeAutoObservable } from 'mobx';
import useRealtimeData from '../../hooks/commHooks/useRealtimeData';
import NOTIFICATION_MESSAGES from '../../support/NotificationMessages';
import { AssignEventStore, useAssignEventStore } from './AssignEventStore';
import SnapshotStore from "./SnapshotStore";

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  date: Date;
  startTime?: string;
  endTime?: string;
  recurring?: boolean;
  recurrenceRule?: string;
  category?: string;
  status?: "tentative" | "inProgress"  | "confirmed" | "cancelled" | "scheduled" | "completed";
}

export interface CalendarManagerStore {
  events: Record<string, CalendarEvent[]>;
  eventTitle: string;
  eventDescription: string;
  eventStatus: "scheduled" | "inProgress" | "tentative" | "confirmed" | "cancelled" | "completed" | undefined;
  assignedEventStore: AssignEventStore;
  snapshotStore: SnapshotStore<Record<string, CalendarEvent[]>>;
  NOTIFICATION_MESSAGE: string;
  NOTIFICATION_MESSAGES: typeof NOTIFICATION_MESSAGES;
  updateEventTitle: (title: string) => void;
  updateEventDescription: (description: string) => void;
  updateEventStatus: (status: "scheduled" | "inProgress" | "tentative" | "confirmed" | "cancelled" | "completed" | undefined) => void;
  updateEventDate: (eventId: string, eventDate: Date) => void;
  addEvent: () => void;
  addEvents: (eventsToAdd: CalendarEvent[]) => void;
  removeEvent: (eventId: string) => void;
  removeEvents: (eventIds: string[]) => void;
  reassignEvent: (eventId: string, oldUserId: string, newUserId: string) => void;

  addEventSuccess: (payload: { event: CalendarEvent }) => void;
  fetchEventsSuccess: (payload: { calendarEvents: CalendarEvent[] }) => void;
  fetchEventsFailure: (payload: { error: string }) => void;
  fetchEventsRequest: () => void;
  completeAllEventsSuccess: () => void;
  completeAllEvents: () => void;
  completeAllEventsFailure: (payload: { error: string }) => void;
  setDynamicNotificationMessage: (message: string) => void;
}

class CalendarManagerStoreClass implements CalendarManagerStore {
  events: Record<string, CalendarEvent[]> = {
    scheduled: [],
    inProgress: [],
    completed: [],
  };
  eventTitle = "";
  eventDescription = "";
  eventStatus: "scheduled" | "inProgress" | "tentative" | "confirmed" | "cancelled" | "completed" | undefined = undefined;
  assignedEventStore: AssignEventStore;
  snapshotStore: SnapshotStore<Record<string, CalendarEvent[]>> = new SnapshotStore<Record<string, CalendarEvent[]>>({});
  NOTIFICATION_MESSAGE = "";
  NOTIFICATION_MESSAGES = NOTIFICATION_MESSAGES;

  useRealtimeDataInstance: ReturnType<typeof useRealtimeData>;

  constructor() {
    this.assignedEventStore = useAssignEventStore();
    this.useRealtimeDataInstance = useRealtimeData(this.events, this.handleRealtimeUpdate);
    makeAutoObservable(this);
  }

  updateEventTitle(title: string): void {
    this.eventTitle = title;
  }

  updateEventDescription(description: string): void {
    this.eventDescription = description;
  }

  updateEventStatus(status: "scheduled" | "inProgress" | "tentative" | "confirmed" | "cancelled" | "completed" | undefined): void {
    this.eventStatus = status;
  }

  addEventSuccess(payload: { event: CalendarEvent }): void {
    const { event } = payload;
    
    // Assuming 'event' has a valid 'status' property
    const status:
      "scheduled" | "inProgress"
      | "tentative" | "confirmed"
      | "cancelled" | "completed"
      | undefined = event.status || "scheduled";

    this.events = {
      ...this.events,
      [status]: [...(this.events[status] || []), event],
    };

    // Optionally, you can trigger notifications or perform other actions on success
    this.setDynamicNotificationMessage(NOTIFICATION_MESSAGES.OperationSuccess.DEFAULT);
  }

  addEvent(): void {
    // Ensure the title is not empty before adding an event
    if (this.eventTitle.trim().length === 0) {
      console.error("Event title cannot be empty.");
      return;
    }

    const newEvent: CalendarEvent = {
      id: Date.now().toString(),
      title: this.eventTitle,
      description: this.eventDescription,
      status: this.eventStatus,
      date: new Date(), // You may want to replace this with the actual date logic
    };

    this.events = {
      ...this.events,
      [newEvent.id]: [...(this.events[newEvent.id] || []), newEvent],
    };

    // Reset input fields after adding an event
    this.eventTitle = "";
    this.eventDescription = "";
    this.eventStatus = "scheduled";
  }

  removeEvent(eventId: string): void {
    const updatedEvents = { ...this.events };
    delete updatedEvents[eventId];
    this.events = updatedEvents;
  }

  removeEvents(eventIds: string[]): void {
    const updatedEvents = { ...this.events };
    eventIds.forEach((eventId) => {
      delete updatedEvents[eventId];
    });
    this.events = updatedEvents;
  }

  addEvents(eventsToAdd: CalendarEvent[]): void {
    // Ensure at least one event is passed
    if (eventsToAdd.length === 0) {
      console.error("At least one event must be passed");
      return;
    }

    eventsToAdd.forEach((event) => {
      // Ensure the event has a valid status
      if (event.status && !["scheduled", "inProgress", "completed"].includes(event.status)) {
        console.error(`Invalid status "${event.status}" for event "${event.title}"`);
        return;
      }

      const eventId = event.id;
      this.events = {
        ...this.events,
        [eventId]: [...(this.events[eventId] || []), event],
      };
    });

    // Reset input fields after adding events
    this.eventTitle = "";
    this.eventDescription = "";
    this.eventStatus = undefined; // Set to undefined when resetting
  }


  reassignEvent(eventId: string, oldUserId: string, newUserId: string): void {
    this.assignedEventStore.reassignUser(eventId, oldUserId, newUserId);
    // You can add additional logic or trigger notifications as needed
    this.setDynamicNotificationMessage(NOTIFICATION_MESSAGES.OperationSuccess.DEFAULT);
  }

  fetchEventsSuccess(payload: { calendarEvents: CalendarEvent[] }): void {
    const { calendarEvents: newEvents } = payload;
    this.events = {
      ...this.events,
      ...newEvents.reduce((acc, event) => {
        const eventId = event.id;
        acc[eventId] = [...(this.events[eventId] || []), event];
        return acc;
      }, {} as Record<string, CalendarEvent[]>),
    };
  }

  updateEventDate(eventId: string, eventDate: Date): void {
    const updatedEvents = { ...this.events };

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
    this.events = updatedEvents;
  }

  completeAllEventsSuccess(): void {
    console.log("All Events completed successfully!");
    // You can add additional logic or trigger notifications as needed
    this.setDynamicNotificationMessage(NOTIFICATION_MESSAGES.OperationSuccess.DEFAULT);
  }

  completeAllEvents(): void {
    console.log("Completing all Events...");
    // You can add loading indicators or other UI updates here

    // Simulate asynchronous completion
    setTimeout(() => {
      // Update events to mark all as done
      this.events = Object.keys(this.events).reduce((acc, id) => {
        acc[id] = this.events[id].map((event) => ({
          ...event,
          status: 'completed' as const, // Ensure 'completed' is the only allowed value
        }));
        return acc;
      }, {} as Record<string, CalendarEvent[]>);

      // Trigger success
      this.completeAllEventsSuccess();
    }, 1000);
  }

    // Function to set a dynamic notification message
    setDynamicNotificationMessage = (message: string) => {
      this.setDynamicNotificationMessage(message);
    };
  
  fetchEventsFailure(payload: { error: string }): void {
    console.error("Fetch Events Failure:", payload.error);
    // You can add additional logic or trigger notifications as needed
    this.setDynamicNotificationMessage(NOTIFICATION_MESSAGES.Error.ERROR_FETCHING_DATA);
  }

  fetchEventsRequest(): void {
    console.log("Fetching Events...");
    // todo You can add loading indicators or other UI updates here
    this.setDynamicNotificationMessage(NOTIFICATION_MESSAGES.DataLoading.PAGE_LOADING);
  }

  completeAllEventsFailure(payload: { error: string }): void {
    console.error("Complete All Events Failure:", payload.error);
    // You can add additional error handling or trigger notifications as needed
    this.setDynamicNotificationMessage(NOTIFICATION_MESSAGES.Error.PROCESSING_BATCH);
  }

  // Implement the rest of the methods and properties
}

const useCalendarManagerStore = (): CalendarManagerStore => {
  return new CalendarManagerStoreClass();
};

export { useCalendarManagerStore };
