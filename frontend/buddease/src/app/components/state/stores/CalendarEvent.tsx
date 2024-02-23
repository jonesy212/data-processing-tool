// CalendarEvent.tsx
import { endpoints } from "@/app/api/ApiEndpoints";
import useModalFunctions from "@/app/pages/dashboards/ModalFunctions";
import ScheduleEventModal from '@/app/ts/ScheduleEventModal';
import { makeAutoObservable } from "mobx";
import { useNotification } from "../../hooks/commHooks/useNotification";
import useRealtimeData from "../../hooks/commHooks/useRealtimeData";
import { Data } from "../../models/data/Data";
import axiosInstance from "../../security/csrfToken";
import NOTIFICATION_MESSAGES from "../../support/NotificationMessages";
import { AssignEventStore, useAssignEventStore } from "./AssignEventStore";
import CalendarSettingsPage from "./CalendarSettingsPage";
import SnapshotStore, { Snapshot, SnapshotStoreConfig } from "./SnapshotStore";


// export type RealTimeCollaborationTool = "google" | "microsoft" | "zoom" | "none";
const API_BASE_URL = endpoints.calendar.events;


const { notify } = useNotification();



interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startDate?: Date
  endDate?: Date
  date: Date;
  startTime?: string;
  endTime?: string;
  recurring?: boolean;
  recurrenceRule?: string;
  category?: string;
  timezone?: string;
  participants?: string[]
  language?: string
  agenda?: string
  collaborationTool?: string
  status?:
    | "tentative"
    | "inProgress"
    | "confirmed"
    | "cancelled"
    | "scheduled"
    | "completed";
}

export interface CalendarManagerStore {
  openScheduleEventModal: (content: JSX.Element) => void;
  openCalendarSettingsPage: () => void;

  events: Record<string, CalendarEvent[]>;
  eventTitle: string;
  eventDescription: string;
  eventStatus:
    | "scheduled"
    | "inProgress"
    | "tentative"
    | "confirmed"
    | "cancelled"
    | "completed"
    | undefined;
  assignedEventStore: AssignEventStore;
  snapshotStore: SnapshotStore<Snapshot<Data>>;
  NOTIFICATION_MESSAGE: string;
  NOTIFICATION_MESSAGES: typeof NOTIFICATION_MESSAGES;
  updateEventTitle: (title: string) => void;
  updateEventDescription: (description: string) => void;
  updateEventStatus: (
    eventId: string,
    status:
      | "scheduled"
      | "inProgress"
      | "tentative"
      | "confirmed"
      | "cancelled"
      | "completed"
      | undefined
  ) => void;
  updateEventDate: (eventId: string, eventDate: Date) => void;
  addEvent: (event: CalendarEvent) => void;
  addEvents: (eventsToAdd: CalendarEvent[]) => void;
  removeEvent: (eventId: string) => void;
  removeEvents: (eventIds: string[]) => void;
  reassignEvent: (
    eventId: string,
    oldUserId: string,
    newUserId: string
  ) => void;

  addEventSuccess: (payload: { event: CalendarEvent }) => void;
  fetchEventsSuccess: (payload: { calendarEvents: CalendarEvent[] }) => void;
  fetchEventsFailure: (payload: { error: string }) => void;
  fetchEventsRequest: (eventIds: string[], events: Record<string, CalendarEvent[]>) => void;

  completeAllEventsSuccess: () => void;
  completeAllEvents: () => void;
  completeAllEventsFailure: (payload: { error: string }) => void;
  setDynamicNotificationMessage: (message: string) => void;
  handleRealtimeUpdate: (
    events: Record<string, CalendarEvent[]>,
    snapshotStore: SnapshotStore<Snapshot<Data>>
  ) => void;
  
}

class CalendarManagerStoreClass implements CalendarManagerStore {
    events: Record<string, CalendarEvent[]> = {
    scheduled: [],
    inProgress: [],
    completed: [],
  };
  eventTitle = "";
  eventDescription = "";
  eventStatus:
    | "scheduled"
    | "inProgress"
    | "tentative"
    | "confirmed"
    | "cancelled"
    | "completed"
    | undefined = undefined;
  assignedEventStore: AssignEventStore;
  snapshotStore: SnapshotStore<Snapshot<Data>> = new SnapshotStore<
    Snapshot<Data>
  >({} as SnapshotStoreConfig<Snapshot<Data>>);
  NOTIFICATION_MESSAGE = "";
  NOTIFICATION_MESSAGES = NOTIFICATION_MESSAGES;
  useRealtimeDataInstance: ReturnType<typeof useRealtimeData>;
  handleRealtimeUpdate: (
    events: Record<string, CalendarEvent[]>,
    snapshotStore: SnapshotStore<Snapshot<Data>>
  ) => void;

  openCalendarSettingsPage: () => void;
  openScheduleEventModal: (content: JSX.Element) => void;
  constructor() {
    this.assignedEventStore = useAssignEventStore();
    this.handleRealtimeUpdate = (
      events: Record<string, CalendarEvent[]>,
      snapshotStore: SnapshotStore<Snapshot<Data>>
    ) => {
      this.events = events;
      this.snapshotStore = snapshotStore; // Use the provided snapshotStore
    };

    this.openCalendarSettingsPage = () => {
      this.openScheduleEventModal(<CalendarSettingsPage />);
    };
    this.openScheduleEventModal = useModalFunctions().setModalContent;
    this.useRealtimeDataInstance = useRealtimeData(this.events, updateCallback);
    makeAutoObservable(this);
  }

  updateEventTitle(title: string): void {
    this.eventTitle = title;
  }

  updateEventDescription(description: string): void {
    this.eventDescription = description;
  }

  updateEventStatus(
    eventId: string,
    status:
      | "scheduled"
      | "inProgress"
      | "tentative"
      | "confirmed"
      | "cancelled"
      | "completed"
      | undefined
  ): void {
    if (status !== undefined) {
      this.eventStatus = status;
      this.assignedEventStore.updateEventStatus(eventId, status);
    } else {
      this.eventStatus = undefined;
      console.error("Event status cannot be undefined.");
     }
  }

  addEventSuccess(payload: { event: CalendarEvent }): void {
    const { event } = payload;

    // Assuming 'event' has a valid 'status' property
    const status:
      | "scheduled"
      | "inProgress"
      | "tentative"
      | "confirmed"
      | "cancelled"
      | "completed"
      | undefined = event.status || "scheduled";

    this.events = {
      ...this.events,
      [status]: [...(this.events[status] || []), event],
    };

    // Optionally, you can trigger notifications or perform other actions on success
    this.setDynamicNotificationMessage(
      NOTIFICATION_MESSAGES.OperationSuccess.DEFAULT
    );
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
      date: new Date(),
      startDate: new Date(),
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
      if (
        event.status &&
        !["scheduled", "inProgress", "completed"].includes(event.status)
      ) {
        console.error(
          `Invalid status "${event.status}" for event "${event.title}"`
        );
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
    this.setDynamicNotificationMessage(
      NOTIFICATION_MESSAGES.OperationSuccess.DEFAULT
    );
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
    this.setDynamicNotificationMessage(
      NOTIFICATION_MESSAGES.OperationSuccess.DEFAULT
    );
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
          status: "completed" as const, // Ensure 'completed' is the only allowed value
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
    this.setDynamicNotificationMessage(
      NOTIFICATION_MESSAGES.Error.ERROR_FETCHING_DATA
    );
  }

  fetchEventsRequest(): void {
    console.log("Fetching Events...");

    // Construct the API endpoint based on any internal state or configuration
    const apiUrl = `${API_BASE_URL}?type=default&timeframe=default`;

    // Make the API request using axiosInstance
    axiosInstance
      .get(apiUrl)
      .then((response) => {
        // Handle the successful response from the API
        console.log("Events fetched successfully:", response.data);

        // You can update the state or perform any necessary actions with the fetched events here
      })
      .catch((error) => {
        // Handle errors if the API request fails
        console.error("Error fetching events:", error);

        // You can show an error message to the user or handle the error in any other way
      })
      .finally(() => {
        // Clear the loading indicator or perform any necessary cleanup actions
        this.setDynamicNotificationMessage(
          NOTIFICATION_MESSAGES.Data.PAGE_LOADING
        );
      });
  }

  completeAllEventsFailure(payload: { error: string }): void {
    console.error("Complete All Events Failure:", payload.error);
    // You can add additional error handling or trigger notifications as needed
    this.setDynamicNotificationMessage(
      NOTIFICATION_MESSAGES.Error.PROCESSING_BATCH
    );
  }

  // Implement the rest of the methods and properties
}

const useCalendarManagerStore = (): CalendarManagerStore => {
  return new CalendarManagerStoreClass();
};async function updateCallback(
  events: Record<string, CalendarEvent[]>,
): Promise<void> {
  // Convert events to the appropriate data format if needed
  const eventData: Data = convertEventsToData(events);

  // Use the eventData variable here or anywhere else in the function as needed
  // For example:
  console.log('Event data:', eventData);
}



function* fetchEventsRequest(): Generator<any, void, undefined> {
  yield { type: "CALENDAR_MANAGER/FETCH_EVENTS_REQUEST" };
}



function openCalendarSettingsPage(): void {
  // Open the settings page
  // You can add additional logic or trigger notifications as needed
  useModalFunctions().setIsModalOpen(true);
  
  // Render the CalendarSettingsPage component to a JSX element
  const calendarSettingsPageElement = <CalendarSettingsPage />;
  
  // Pass the JSX element directly to setModalContent
  useModalFunctions().setModalContent(calendarSettingsPageElement);
}

function openScheduleEventModal(eventId: string): void {
  // Open the modal with the eventId
  // You can add additional logic or trigger notifications as needed
  useModalFunctions().setIsModalOpen(true);

  // Render the ScheduleEventModal component to a JSX element
  const modalElement = (
    <ScheduleEventModal
      eventId={eventId}
      visible={true}
      onCancel={() => {
        useModalFunctions().setIsModalOpen(false);
      }}
    />
  );

  // Pass the JSX element directly to setModalContent
  useModalFunctions().setModalContent(modalElement);

  notify(
    "Opening Schedule Event Modal",
    NOTIFICATION_MESSAGES.Data.PAGE_LOADING,
    new Date(),
    "OperationSuccess"
  );
}

// Example function to convert events to the appropriate data format
function convertEventsToData(events: Record<string, CalendarEvent[]>): Data {
  const convertedData: Data = {
    scheduled: false,
    isCompleted: false,
    _id: "",
    id: "",
    title: "",
    status: "pending",
    isActive: false,
    tags: [],
    phase: null,
    then: function (callback: (newData: Snapshot<Data>) => void): void {
      throw new Error("Function not implemented.");
    },
    analysisType: "",
    analysisResults: [],
    videoUrl: "",
    videoThumbnail: "",
    videoDuration: 0,
    videoData: {} as VideoData
  };

  // Iterate over each key-value pair in the events object
  Object.entries(events).forEach(([key, eventArray]) => {
    // Convert each event to the desired format and store it in the convertedData object
    convertedData[key] = eventArray.map(event => ({
      id: event.id,
      title: event.title,
      start: event.startDate,
      end: event.endDate
      // Add other properties as needed
    }));
  });

  return convertedData;
}

// Example usage:
const events: Record<string, CalendarEvent[]> = {
  '2024-02-08': [
    {
      id: '1',
      title: 'Meeting',
      date: new Date('2024-02-08T09:00:00'),
      startDate: new Date('2024-02-08T09:00:00'),
      endDate: new Date('2024-02-08T10:00:00'),
    },
    // Add more events for other dates as needed
  ],
  // Add more dates with corresponding events as needed
};

const convertedData = convertEventsToData(events);
console.log(convertedData);

export { fetchEventsRequest, updateCallback, useCalendarManagerStore };
export default CalendarManagerStoreClass;
export type { CalendarEvent };
