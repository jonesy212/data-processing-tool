// CalendarEvent.tsx
import { endpoints } from "@/app/api/ApiEndpoints";
import { StructuredMetadata } from "@/app/configs/StructuredMetadata";
import { updateCallback } from "@/app/pages/blog/UpdateCallbackUtils";
import useModalFunctions from "@/app/pages/dashboards/ModalFunctions";
import ScheduleEventModal from '@/app/ts/ScheduleEventModal';
import { PayloadAction } from "@reduxjs/toolkit";
import { makeAutoObservable } from "mobx";
import { useDispatch } from "react-redux";
import { DocumentOptions, getDefaultDocumentOptions } from "../../documents/DocumentOptions";
import useRealtimeData from "../../hooks/commHooks/useRealtimeData";
import { CommonData } from "../../models/CommonData";
import { Data } from "../../models/data/Data";
import { CalendarStatus, StatusType } from "../../models/data/StatusType";
import { Team } from "../../models/teams/Team";
import { Member } from "../../models/teams/TeamMembers";
import { Phase } from "../../phases/Phase";
import axiosInstance from "../../security/csrfToken";
import SnapshotStore, { Snapshot, SnapshotStoreConfig } from "../../snapshots/SnapshotStore";
import { NotificationType, NotificationTypeEnum, useNotification } from "../../support/NotificationContext";
import NOTIFICATION_MESSAGES from "../../support/NotificationMessages";
import { VideoData } from "../../video/Video";
import { AssignEventStore, useAssignEventStore } from "./AssignEventStore";
import CalendarSettingsPage from "./CalendarSettingsPage";
import CommonEvent, { implementThen } from "./CommonEvent";
import { AllStatus } from "./DetailsListStore";



// export type RealTimeCollaborationTool = "google" | "microsoft" | "zoom" | "none";
const API_BASE_URL = endpoints.calendar.events;


const { notify } = useNotification();

const notifyPromise = Promise.resolve(
  useNotification().notify("snapshotStore",
    "error",
    NOTIFICATION_MESSAGES.CalendarEvents.DEFAULT,
  new Date,
  "Error" as NotificationType));



// Define a synchronous callback function that wraps the asynchronous operation
const notifyCallback = (): void => {
  notifyPromise.then(() => {
    // This code block will execute when the promise resolves
    // It's important to handle any errors or other logic here
  }).catch(error => {
    // Handle any errors from the promise
    console.error("Error in notifyPromise:", error);
  });
};


interface CalendarEvent extends
  CommonEvent,
  CommonData<Data> {id: string;
  title: string;
  content: string;
  topics: string[];
  highlights: string[];
  load?: () => void;
  files: any[];
  type?: NotificationType;
  locked?: boolean;
  changes?: string[];
  options: DocumentOptions;
  documentPhase?: Phase;
  // Add more properties if needed
  status: AllStatus
  rsvpStatus: "yes" | "no" | "maybe" | "notResponded";
  priority:  AllStatus
  location?: string;
  host: Member;
  hosts?: Member[];
  guestSpeakers?: Member[]
  attendees?: Member[],
  color?: string;
  isImportant?: boolean;
  teamMemberId: Team["id"];
  reminder?: string;
  pinned?: boolean;
  archived?: boolean;
  documentReleased?: boolean;
  metadata?: StructuredMetadata;
  participants: Member[];

}

export interface CalendarManagerStore {
  dispatch: (action: PayloadAction<any, string, any, any>) => void;
  openScheduleEventModal: (content: JSX.Element) => void;
  openCalendarSettingsPage: () => void;
  updateDocumentReleaseStatus: (eventId: string, released: boolean) => void;

  events: Record<string, CalendarEvent[]>;
  eventTitle: string;
  eventDescription: string;
  eventStatus: AllStatus; // Assuming this is the property expecting the mentioned types

  assignedEventStore: AssignEventStore;
  snapshotStore: SnapshotStore<Snapshot<Data>>;
  NOTIFICATION_MESSAGE: string;
  NOTIFICATION_MESSAGES: typeof NOTIFICATION_MESSAGES;
  updateEventTitle: (title: string) => void;
  updateEventDescription: (description: string) => void;
  updateEventStatus: (
    eventId: string,
    status: AllStatus
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


    dispatch: (action: PayloadAction<any, string, any, any>) => void;
    events: Record<string, CalendarEvent[]> = {
    scheduled: [],
    inProgress: [],
    completed: [],
  };
  eventTitle = "";
  eventDescription = "";
  eventStatus: AllStatus = StatusType.Pending

  assignedEventStore: AssignEventStore;
  snapshotStore: SnapshotStore<Snapshot<Data>> = new SnapshotStore<Snapshot<Data>>(
    {} as SnapshotStoreConfig<SnapshotStore<Snapshot<Data>>>,
    notifyCallback // Use the synchronous callback function here
  );;
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
    this.dispatch = useDispatch()
    this.assignedEventStore = useAssignEventStore();
    this.setDocumentReleaseStatus = this.setDocumentReleaseStatus.bind(this);
    this.updateDocumentReleaseStatus = this.updateDocumentReleaseStatus.bind(this);
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





  setDocumentReleaseStatus: (
    eventId: string,
    released: boolean
  ) => PayloadAction<{ eventId: string; released: boolean }> = (
    eventId: string,
    released: boolean
  ) => {
    // Assuming you have access to a Redux store or similar mechanism to dispatch actions
    // Dispatch an action to set the document release status
    return {
      type: "SET_DOCUMENT_RELEASE_STATUS",
      payload: { eventId, released },
    };
  };


  updateDocumentReleaseStatus(eventId: string, released: boolean): void {
    // Instead of updating the entire 'events' object, let's update the specific event's 'documentReleased' property
    const eventsArray = this.events[eventId];
    if (eventsArray && eventsArray.length > 0) {
      const event = eventsArray[0]; // Accessing the first event in the array
      event.documentReleased = released;
    }
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
    AllStatus
  ): void {
    const eventsArray = this.events[eventId];
    if (eventsArray && eventsArray.length > 0) {
      const event = eventsArray[0]; // Accessing the first event in the array
      event.status = status;

    }
    if(status === CalendarStatus.Completed){
      this.completeAllEvents();
    }
    else{
      this.setDynamicNotificationMessage(
        NOTIFICATION_MESSAGES.OperationSuccess.DEFAULT
      );
    }
    if(status === CalendarStatus.Scheduled){
      this.setDynamicNotificationMessage(
        NOTIFICATION_MESSAGES.OperationSuccess.DEFAULT
      );
    }
    if(status === CalendarStatus.InProgress){
      this.setDynamicNotificationMessage(
        NOTIFICATION_MESSAGES.OperationSuccess.DEFAULT
      );
    }
    if(status === CalendarStatus.Tentative){
      this.setDynamicNotificationMessage(
        NOTIFICATION_MESSAGES.OperationSuccess.DEFAULT
      );
    }

    this.eventStatus = status
  }

  addEventSuccess(payload: { event: CalendarEvent }): void {
    const { event } = payload;

    // Assuming 'event' has a valid 'status' property
    const status: AllStatus
      | undefined = event.status || CalendarStatus.Scheduled;

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

    const defaultStatus: "pending" = "pending"; // Provide a default value for status if it's undefined

    const newEvent: CalendarEvent = {
      id: Date.now().toString(),
      title: this.eventTitle,
      description: this.eventDescription,
      status: this.eventStatus || defaultStatus, // Use defaultStatus if this.eventStatus is undefined
      date: new Date(),
      startDate: new Date(),
      metadata: {} as StructuredMetadata,
      rsvpStatus: "yes",
      host: {} as Member,
      hosts: {} as Member[],
      attendees: [] as Member[],
      color: "",
      isImportant: false,
      teamMemberId: '0',
      priority: {} as AllStatus,
      _id: "",
      isActive: false,
      tags: [],
      phase: null,
      then: implementThen,
      analysisType: {} as AnalysisTypeEnum,
      analysisResults: [],
      videoData: {} as VideoData,
      participants: [],
      content: "",
      topics: [],
      highlights: [],
      files: [],
      options: getDefaultDocumentOptions(),
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
    this.eventStatus = `undefined` // Set to undefined when resetting
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
};




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
    "Modal content set",
    "Opening Schedule Event Modal",
    NOTIFICATION_MESSAGES.Data.PAGE_LOADING,
    new Date(),
    NotificationTypeEnum.OperationSuccess
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
    then: implementThen,
    analysisType: {} as AnalysisTypeEnum,
    analysisResults: [],
    videoUrl: "",
    videoThumbnail: "",
    videoDuration: 0,
    videoData: {} as VideoData,
    ideas: []
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
export const events: Record<string, CalendarEvent[]> = {
  '2024-02-08': [
    {
      _id: "",
      id: '1',
      title: 'Meeting',
      date: new Date('2024-02-08T09:00:00'),
      startDate: new Date(),
      endDate: new Date(),
      metadata: {} as StructuredMetadata,
      rsvpStatus: "notResponded",
      host: {} as Member,
      color: "",
      isImportant: false,
      teamMemberId: '0',
      status: "pending",
      isCompleted: false,
      isActive: false,
      tags: [],
      priority: {} as AllStatus,
      phase: null,
      participants: [],
      then: (callback: (newData: Snapshot<Data>) => void) => {
        // Implement logic to handle the snapshot of data
        const newData: Snapshot<Data> = {
          timestamp: new Date(),
          data: convertedData,
        };
        callback(newData);
      },
      analysisType: {} as AnalysisTypeEnum,
      analysisResults: [],
      videoData: {} as VideoData,
      content:'content',
       topics: [],
       highlights: [],
       files: [],
       options: getDefaultDocumentOptions(),
    },
    // Add more events for other dates as needed
  ],
  // Add more dates with corresponding events as needed
};



export const calendarEvent: CalendarEvent = {} as CalendarEvent;
//  


export const convertedData = convertEventsToData(events);
console.log(convertedData);

export { fetchEventsRequest, updateCallback, useCalendarManagerStore };
export default CalendarManagerStoreClass;
export type { CalendarEvent };
