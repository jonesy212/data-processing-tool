import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Draft , produce} from "immer";
import calendarApiService from "@/app/api/ApiCalendar";
import { fetchEventData } from "@/app/api/ApiEvent";
import { useDispatch } from "react-redux";
import { Theme } from "../libraries/ui/theme/Theme";
import { WritableDraft } from "../state/redux/ReducerGenerator";
import { CalendarEvent } from "../state/stores/CalendarEvent";
import {
  dispatchNotification,
  NotificationData,
} from "../support/NofiticationsSlice";
import { NotificationActions } from "../support/NotificationActions";
import {
  NotificationTypeEnum,
  useNotification,
} from "../support/NotificationContext";
import NOTIFICATION_MESSAGES from "../support/NotificationMessages";
import { Attachment } from "../todos/Todo";
import CalendarEventViewingDetailsProps from "./CalendarEventViewingDetails";
import DefaultCalendarEventViewingDetails from "./DefaultCalendarEventViewingDetails";
import EventDetailsComponent from "./EventDetailsComponent";
import { CalendarActions } from "../actions/CalendarEventActions";
import ExternalCalendarOverlay from "./ExternalCalendarOverlay";
import { CalendarStatus, PriorityStatus, StatusType } from "../models/data/StatusType";
import { Task } from "../models/tasks/Task";

interface Milestone {
  id: string;
  title: string;
  date: Date;
}

interface ProductMilestone extends Milestone {
  productId: string;
  // Add any additional properties specific to ProductMilestone
}

// Example usage:
const productMilestone: ProductMilestone = {
  id: "1",
  title: "Product Launch",
  date: new Date(),
  productId: "ABC123",
};

interface CalendarManagerState {
  entities: Record<string, CalendarEvent>;
  events: Record<string, CalendarEvent[]>;
  milestones: Record<string, Milestone>;
  notifications: Record<string, NotificationData>;
  loading: boolean;
  filteredEvents: CalendarEvent[];
  searchedEvents: CalendarEvent[];
  sortedEvents: CalendarEvent[];
  viewingEventDetails: React.FC<CalendarEventViewingDetailsProps> | null;
  sharedEvents: Record<string, CalendarEvent>;
  sharedEvent: CalendarEvent | undefined;
  pendingAction: string | null;
  isLoading: boolean;
  error: string | undefined;
  exportedEvents: Record<string, CalendarEvent[]>;
  externalCalendarsOverlays: ExternalCalendarOverlay[];
}

export const exportCalendarEvents = async (
  eventId: string
): Promise<boolean> => {
  try {
    // Simulate fetching calendar events
    const events = await fetchCalendarEvents(eventId);

    // Simulate exporting events to Google Calendar
    await simulateExportToGoogleCalendar(events);

    // Return true to indicate success
    return true;
  } catch (error) {
    // Handle errors
    console.error("Error exporting calendar events:", error);
    return false; // Return false to indicate failure
  }
};

export const simulateSendReminder = async (event: CalendarEvent) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log("Reminder sent for event:", event);
      resolve(event); // Change 'value' to 'event'
    }, 2000);
  });
};

export const sendReminderToExternalService = async (event: CalendarEvent) => {
  // Simulate sending reminder to external service
  await simulateSendReminder(event);
};

// Call useNotification() outside of createAsyncThunk
const notificationContext = useNotification();

// Define createAsyncThunk with the thunk action creator
export const sendCalendarEventReminder = createAsyncThunk(
  "calendarEvents/sendCalendarEventReminder",
  async (event: CalendarEvent, { dispatch }) => {
    try {
      // Perform asynchronous operation, such as sending a reminder
      await sendReminderToExternalService(event);

      // Dispatch a success notification if showSuccessNotification is defined
      notificationContext.actions?.showSuccessNotification?.(
        "",
        "Calendar event reminder sent successfully",
        NOTIFICATION_MESSAGES.CalendarEvents.EVENT_REMINDER_SUCCESS,
        new Date()
      );
    } catch (error: any) {
      // Dispatch an error notification if showErrorNotification is defined
      notificationContext.actions?.showErrorNotification?.(
        "Error sending calendar event reminder",
        error.message,
        new Date()
      );
    }
  }
);

const simulateRemoveCalendarEvent = async (eventId: string) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log("Event removed from service:", eventId);
      resolve(eventId);
    }, 2000);
  });
};

export const removeCalendarEventFromService = async (eventId: string) => {
  // Simulate removing event from external service
  await simulateRemoveCalendarEvent(eventId);
};
export const removeCalendarEventAsync = createAsyncThunk(
  "calendarEvents/removeCalendarEvent",
  async (eventId: string, { dispatch }) => {
    try {
      // Perform asynchronous operation, such as removing the event
      await removeCalendarEventFromService(eventId);

      // Dispatch a success notification if showSuccessNotification is defined
      notificationContext.actions?.showSuccessNotification?.(
        "",
        "Calendar event removed successfully",
        NOTIFICATION_MESSAGES.CalendarEvents.EVENT_REMOVED_SUCCESS,
        new Date()
      );
    } catch (error: any) {
      // Dispatch an error notification if showErrorNotification is defined
      notificationContext.actions?.showErrorNotification?.(
        "Error removing calendar event",
        error.message,
        new Date()
      );
    }
  }
);

// Function to process fetched events and update application's calendar data
async function processGoogleCalendarEvents(events: any[]): Promise<void> {
  // Logic to process fetched events and update application's calendar data
  // This could involve adding, updating, or removing events in your application's calendar
  // Implement according to your application's requirements

  try {
    // Example: Update application's calendar with fetched events
    calendarApiService.updateCalendarWithGoogleEvents(events);
  } catch (error) {
    console.error("Error processing Google Calendar events:", error);
    throw error;
  }
}

// Function to synchronize with Google Calendar
async function synchronizeWithGoogleCalendar(): Promise<void> {
  try {
    // Fetch events from Google Calendar
    const googleCalendarEvents =
      await calendarApiService.fetchGoogleCalendarEvents();

    // Process the fetched events and update the application's calendar data
    await processGoogleCalendarEvents(googleCalendarEvents);

    console.log("Google Calendar synchronized successfully");
  } catch (error) {
    console.error("Error synchronizing with Google Calendar:", error);
    throw error;
  }
}

// Define the syncCalendarWithExternalCalendars async thunk action creator
export const syncCalendarWithExternalCalendars = createAsyncThunk(
  "calendar/syncCalendarWithExternalCalendars",
  async (_, { dispatch }) => {
    try {
      // Simulate the synchronization process with an external calendar (e.g., Google Calendar)
      // Replace this with actual code to interact with the external calendar API

      // Example: Call a function to synchronize calendar events
      await synchronizeWithGoogleCalendar(); // Assuming synchronizeWithGoogleCalendar is an asynchronous function

      // Dispatch a success notification
      dispatch(
        NotificationActions.showSuccessNotification({
          message: "Calendar successfully synced with external calendars",
          type: "syncCalendarWithExternalCalendars",
        })
      );
    } catch (error) {
      // If an exception occurs during synchronization, handle the error and dispatch an error notification
      console.error("Error syncing calendar with external calendars:", error);
      dispatch(
        NotificationActions.showErrorNotification({
          message: "Error syncing calendar with external calendars",
          type: "syncCalendarWithExternalCalendars",
        })
      );
    }
  }
);

// Add the reducer logic for handling the fulfilled and rejected actions of syncCalendarWithExternalCalendars if needed

const fetchCalendarEvents = async (eventId: string): Promise<any[]> => {
  // Simulate fetching calendar events from a server or API
  return new Promise<any[]>((resolve) => {
    setTimeout(() => {
      // Simulated calendar events
      const events = [
        { id: "1", title: "Event 1", date: "2024-04-10" },
        { id: "2", title: "Event 2", date: "2024-04-15" },
        { id: "3", title: "Event 3", date: "2024-04-20" },
      ];
      resolve(events);
    }, 2000); // Simulate a delay of 2 seconds
  });
};

const simulateExportToGoogleCalendar = async (events: any[]) => {
  // Simulate exporting events to Google Calendar
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      console.log("Events exported to Google Calendar:", events);
      resolve();
    }, 3000); // Simulate a delay of 3 seconds
  });
};

// Define a function to return the default value
const getDefaultViewingEventDetails =
  (): React.FC<CalendarEventViewingDetailsProps> | null => {
    return DefaultCalendarEventViewingDetails;
  };

const initialState: CalendarManagerState = {
  entities: {} as Record<string, CalendarEvent>,
  events: {} as Record<string, CalendarEvent[]>,
  milestones: {} as Record<string, Milestone>,
  notifications: {} as Record<string, NotificationData>,
  loading: false,
  filteredEvents: {} as CalendarEvent[],
  sharedEvents: {} as Record<string, CalendarEvent>,
  sharedEvent: undefined,
  viewingEventDetails: getDefaultViewingEventDetails(),
  searchedEvents: [],
  sortedEvents: [],
  pendingAction: null,
  isLoading: false,
  error: undefined,
  exportedEvents: {} as Record<string, CalendarEvent[]>,
  externalCalendarsOverlays: {} as ExternalCalendarOverlay[],

};

const { notify } = useNotification();
const dispatch = useDispatch();

// Define the handleViewEventDetails function to dispatch the action with the correct payload
const handleViewEventDetails = (
  eventDetails: CalendarEventViewingDetailsProps,
  eventId: string
) => {
  dispatch(viewCalendarEventDetails({ eventDetails, eventId }) as any); // Explicitly cast the action type to 'any'
};

// Define an async thunk for exporting calendar events
// Define an async thunk for exporting calendar events
export const exportCalendarEventsToExternalSources = createAsyncThunk(
  "calendarEvents/exportCalendarEventsToExternalSources",
  async (eventId: string, { dispatch }: { dispatch: any }) => {
    try {
      // Add logic to export calendar events to external sources here
      // For example, you can export events to Google Calendar
      // Simulate an async operation

      // Fetch event data based on eventId
      const event = await fetchEventData(eventId);

      // Check if event data is successfully fetched
      if (event) {
        // Dispatch a success notification if notification context is defined
        const notificationContext = useNotification();
        if (notificationContext) {
          dispatch(
            notificationContext.actions?.showSuccessNotification(
              "",
              "Calendar events exported to external sources successfully",
              new Date()
            )
          );
        } else {
          console.error("Notification context is undefined");
        }
      } else {
        // If event data cannot be fetched, dispatch an error notification
        const errorDetails = "Failed to connect to the external API";
        dispatch(
          useNotification()?.actions?.showErrorNotification(
            "Error exporting calendar events to external sources",
            errorDetails,
            new Date()
          )
        );
      }
    } catch (error) {
      console.error("Error exporting calendar events:", error);
      // Optionally, you can handle and dispatch error actions here
    }
  }
);

export const useCalendarManagerSlice = createSlice({
  name: "calendarEvents",
  initialState: {
    entities: {},
    milestones: {},
    notifications: {},
  } as CalendarManagerState,
  reducers: {
    // Define reducers here if needed
    updateState: (
      state,
      action: PayloadAction<Partial<CalendarManagerState>>
    ) => {
      return { ...state, ...action.payload };
    },

    // For "events" action:
    events: (
      state,
      action: PayloadAction<WritableDraft<Record<string, CalendarEvent>>>
    ) => {
      state.entities = action.payload;
      dispatchNotification(
        "events",
        "Events updated successfully",
        "Invalid payload for events action",
        dispatch,
        action.payload
      );
    },

    // For "milestones" action:
    milestones: (state, action: PayloadAction<Record<string, Milestone>>) => {
      state.milestones = action.payload;
      dispatchNotification(
        "milestones",
        "Milestones updated successfully",
        "Invalid payload for milestones action",
        dispatch,
        action.payload
      );
    },

    // For "addCalendarEvent" action:
    addCalendarEvent: (
      state,
      action: PayloadAction<WritableDraft<CalendarEvent>>
    ) => {
      state.entities[action.payload.id] = action.payload;
      dispatchNotification(
        "addCalendarEvent",
        "Calendar event added successfully",
        "Failed to add calendar event",
        dispatch,
        action.payload
      );
    },

    // For "removeCalendarEvent" action:
    removeCalendarEvent: (state, action: PayloadAction<string>) => {
      const eventId = action.payload;
      delete state.entities[eventId];
      dispatchNotification(
        "removeCalendarEvent",
        "Calendar event removed successfully",
        "Failed to remove calendar event",
        dispatch,
        eventId
      );
    },

    // For "updateCalendarEvent" action:
    updateCalendarEvent: (state, action: PayloadAction<CalendarEvent>) => {
      const event = state.entities[action.payload.id];
      if (event) {
        event.title = action.payload.title;
        event.startTime = action.payload.startTime;
        event.endTime = action.payload.endTime;
        dispatchNotification(
          "updateCalendarEvent",
          "Calendar event updated successfully",
          "Error updating calendar event",
          dispatch,
          action.payload
        );
      }
    },

    // For "updateCalendarEventTitle" action:
    updateCalendarEventTitle: (
      state,
      action: PayloadAction<{ id: string; newTitle: string }>
    ) => {
      const event = state.entities[action.payload.id];
      if (event) {
        event.title = action.payload.newTitle;
        dispatchNotification(
          "updateCalendarEventTitle",
          "Calendar event title updated successfully",
          "Error updating calendar event title",
          dispatch,
          action.payload
        );
      }
    },

    // For "addMilestone" action:
    addMilestone: (state, action: PayloadAction<Milestone>) => {
      state.milestones[action.payload.id] = action.payload;
      dispatchNotification(
        "addMilestone",
        "Milestone added successfully",
        "Error adding milestone",
        dispatch,
        action.payload
      );
    },

    // For "removeMilestone" action:
    removeMilestone: (state, action: PayloadAction<Milestone>) => {
      const milestone = state.milestones[action.payload.id];
      if (milestone) {
        delete state.milestones[action.payload.id];
        dispatchNotification(
          "removeMilestone",
          "Milestone removed successfully",
          "Error removing milestone",
          dispatch,
          action.payload
        );
      }
    },

    // For "removeNotification" action:
    removeNotification: (state, action: PayloadAction<string>) => {
      delete state.notifications[action.payload];
      dispatchNotification(
        "removeNotification",
        "Notification removed successfully",
        "Error removing notification",
        dispatch,
        action.payload
      );
    },

    // Update the viewCalendarEventDetails reducer to use EventDetailsComponent
    viewCalendarEventDetails: (
      state,
      action: PayloadAction<{
        eventId: string;
        eventDetails: CalendarEventViewingDetailsProps;
      }>
    ) => {
      const { eventId } = action.payload;
      // Update state with EventDetailsComponent
      state.viewingEventDetails = EventDetailsComponent;

      // Perform additional actions such as updating UI state or triggering side effects here
      dispatchNotification(
        "viewCalendarEventDetails",
        "Calendar event details viewed successfully",
        "Error viewing calendar event details",
        dispatch,
        eventId
      );
    },

    // Action to share calendar event
    shareCalendarEvent: (
      state: WritableDraft<CalendarManagerState>, // Specify the correct type for state
      action: PayloadAction<WritableDraft<CalendarEvent>>
    ) => {
      const event = action.payload;
      state.sharedEvent = event;

      // Perform additional actions such as opening a modal or triggering a sharing functionality
      dispatchNotification(
        "shareCalendarEvent",
        "Calendar event shared successfully",
        "Error sharing calendar event",
        dispatch,
        event.id
      );
    },

    // Action to RSVP to calendar event
    rsvpToCalendarEvent: (
      state,
      action: PayloadAction<WritableDraft<CalendarEvent>>
    ) => {
      const eventId = action.payload.id;
      const event = state.entities[eventId];
      if (event) {
        event.rsvpStatus = "notResponded"; // Update RSVP status to 'Attending'
        // Perform additional actions such as updating the RSVP status in the state
        dispatchNotification(
          "rsvpToCalendarEvent",
          "RSVP to calendar event updated successfully",
          "Error updating RSVP",
          dispatch,
          eventId
        );
      }
    },

    // Action to filter calendar events
    filterCalendarEvents: (state, action: PayloadAction<string>) => {
      const filterCriteria = action.payload;
      // Add logic to filter calendar events here
      // For example, you can filter events based on the provided criteria and update the state accordingly
      const filteredEvents = Object.values(state.entities).filter(
        (event: CalendarEvent) => event.category === filterCriteria
      );
      state.filteredEvents = filteredEvents;

      // Perform additional actions if needed
    },

    searchCalendarEvents: (state, action: PayloadAction<string>) => {
      const searchCriteria = action.payload;
      // Add logic to search calendar events here
      // For example, you can search events based on the provided criteria and update the state accordingly
      const searchedEvents = Object.values(state.entities).filter(
        (event: CalendarEvent) => event.title.includes(searchCriteria)
      );
      state.searchedEvents = searchedEvents;
    },

    sortCalendarEvents: (state, action: PayloadAction<string>) => {
      const sortCriteria = action.payload;
      // Add logic to sort calendar events here
      // For example, you can sort events based on the provided criteria and update the state accordingly
      const sortedEvents = Object.values(state.entities).sort(
        (a: CalendarEvent, b: CalendarEvent) => {
          if (a.title < b.title) {
            return -1;
          }
          if (a.title > b.title) {
            return 1;
          }
          return 0;
        }
      );
      state.sortedEvents = sortedEvents;
    },

    markCalendarEventAsImportant: (state, action: PayloadAction<string>) => {
      const eventId = action.payload;
      const event = state.entities[eventId];
      if (event) {
        event.isImportant = true;
        dispatchNotification(
          "markCalendarEventAsImportant",
          "Calendar event marked as important successfully",
          "Error marking calendar event as important",
          dispatch,
          eventId
        );
      }
      // Perform additional actions if needed
    },

    assignCalendarEventToTeamMember: (state, action: PayloadAction<string>) => {
      const eventId = action.payload;
      const event = state.entities[eventId];
      if (event) {
        event.teamMemberId = "123456789";
        dispatchNotification(
          "assignCalendarEventToTeamMember",
          "Calendar event assigned to team member successfully",
          "Error assigning calendar event to team member",
          dispatch,
          eventId
        );
      }
      // Perform additional actions if needed
    },

    markCalendarEventAsNotImportant: (state, action: PayloadAction<string>) => {
      const eventId = action.payload;
      const event = state.entities[eventId];
      if (event) {
        event.isImportant = false;
        dispatchNotification(
          "markCalendarEventAsNotImportant",
          "Calendar event marked as not important successfully",
          "Error marking calendar event as not important",
          dispatch,
          eventId
        );
      }
      // Perform additional actions if needed
    },

    // Define the reducer function to handle setEventColor action
    setEventColor: (
      state,
      action: PayloadAction<{ eventId: string; color: Theme | string }>
    ) => {
      const { eventId, color } = action.payload;
      const event = state.entities[eventId];
      if (event) {
        // Define selectColor function before it's used
        const selectColor = (color: Theme): string => {
          if (color.primaryColor) {
            return color.primaryColor;
          }
          if (color.borderColorFocus) {
            return color.borderColorFocus;
          }
          if (color.themeColor) {
            return color.themeColor;
          }
          if (color.defaultColor) {
            return color.defaultColor;
          }
          return ""; // Placeholder return value, replace with appropriate handling
        };

        // Declare selectedColor variable
        let selectedColor: string = ""; // Initialize with a default value

        if (typeof color === "string") {
          // If color is a string, use it directly
          selectedColor = color;
        } else {
          if (color.primaryColor) {
            // If color is a Theme object, select the appropriate color
            selectedColor = selectColor(color);
          }

          // Define getColor function
          const getColor = (options: Theme): string => {
            // Implementation of getColor function goes here
            return ""; // Placeholder return value, replace with actual implementation
          };

          // Define defaultColor
          const defaultColor: string = getColor(color as Theme);

          // Assign selected color or default color to event.color
          selectedColor = selectedColor || defaultColor;

          // Dispatch notification
          dispatchNotification(
            "setEventColor",
            "Calendar event color set successfully",
            "Error setting calendar event color",
            dispatch,
            eventId
          );
        }
        // Assign selected color to event.color
        event.color = selectedColor;

        // Return the updated state
        return state;
      }
    },

    // Update the syncCalendarWithExternalCalendars reducer to dispatch the asyncThunk action
    syncCalendarWithExternalCalendars: (
      state,
      action: PayloadAction<void>
    ): void => {
      try {
        // Dispatch the asyncThunk action to synchronize calendar events
        dispatch(CalendarActions.syncCalendarWithExternalCalendars());
      } catch (error) {
        // If an exception occurs during dispatching, handle the error
        console.error("Error dispatching asyncThunk action:", error);
        // Dispatch an error notification
        dispatchNotification(
          "syncCalendarWithExternalCalendars",
          "Error syncing calendar with external calendars",
          NotificationTypeEnum.Error,
          dispatch
        );
      }
    },

    // Action to import calendar events from external sources
    importCalendarEventsFromExternalSources: (
      state,
      action: PayloadAction<void>
    ): void => {
      // Add logic to import calendar events from external sources here
      // For example, you can implement importing events from Google Calendar
      // After successful import, update the state or dispatch notifications as needed
      // Replace the placeholder messages with appropriate success and error messages
      dispatchNotification(
        "importCalendarEventsFromExternalSources",
        "Calendar events imported successfully from external sources",
        "Error importing calendar events from external sources",
        dispatch
      );
    },

    // Update the importCalendarEventViewingDetails action with type assertion
    importCalendarEventViewingDetails: (
      state,
      action: PayloadAction<CalendarEventViewingDetailsProps>
    ) => {
      const { eventDetails } = action.payload;

      // Use type assertion to inform TypeScript that eventDetails.id exists
      if (!isNullOrUndefined((eventDetails as any).id)) {
        state.viewingEventDetails = eventDetails;
        dispatchNotification(
          "importCalendarEventViewingDetails",
          "Calendar event details imported successfully",
          "Error importing calendar event details",
          dispatch,
          (eventDetails as any).id
        );
      } else {
        console.error("Error: eventDetails.id is null or undefined");
      }
    },

    addExternalCalendarsOverlay(
      state: CalendarManagerState,
      action: PayloadAction<ExternalCalendarOverlay[]>
    ): CalendarManagerState {
      return produce(state,
        (draftState: CalendarManagerState) => {
        const overlay = action.payload;
        const existingOverlayIndex =
          draftState.externalCalendarsOverlays.findIndex(
            (o) => o.id === overlay[0].id
          );
        if (existingOverlayIndex !== -1) {
          draftState.externalCalendarsOverlays[existingOverlayIndex] = {
            ...overlay[0],
            events: [
              ...draftState.externalCalendarsOverlays[existingOverlayIndex]
                .events,
              ...overlay[0].events.map((event) => ({
                ...event,
                options: {
                  ...event.options,
                  additionalOptions: Array.isArray(
                    event.options?.additionalOptions
                  )
                    ? [...event.options.additionalOptions]
                    : [],
                },
              })),
            ],
          };
        } else {
          draftState.externalCalendarsOverlays.push(overlay[0]);
        }
      });
    },


    // Action to invite team members to a calendar event
inviteTeamMembersToCalendarEvent: (
  state,
  action: PayloadAction<{ eventId: string; teamMembers: string[] }>
) => {
  const { eventId, teamMembers } = action.payload;
  const event = state.entities[eventId];
  if (event) {
    // Add logic to invite team members to the calendar event
    // For example, you can update the event object to include the invited team members
    // and dispatch notifications accordingly
    dispatchNotification(
      "inviteTeamMembersToCalendarEvent",
      "Team members invited to calendar event successfully",
      "Error inviting team members to calendar event",
      dispatch,
      eventId
    );
  }
},

// Action to comment on a calendar event
commentOnCalendarEvent: (
  state,
  action: PayloadAction<{ eventId: string; comment: string }>
) => {
  const { eventId, comment } = action.payload;
  const event = state.entities[eventId];
  if (event) {
    // Add logic to add a comment to the calendar event
    // For example, you can update the event object to include the comment
    // and dispatch notifications accordingly
    dispatchNotification(
      "commentOnCalendarEvent",
      "Comment added to calendar event successfully",
      "Error adding comment to calendar event",
      dispatch,
      eventId
    );
  }
},

// Action to assign tasks within a calendar event
assignTasksWithinCalendarEvent: (
  state,
  action: PayloadAction<{ eventId: string; tasks: Task[] }>
) => {
  const { eventId, tasks } = action.payload;
  const event = state.entities[eventId];
  if (event) {
    // Add logic to assign tasks within the calendar event
    // For example, you can update the event object to include the assigned tasks
    // and dispatch notifications accordingly
    dispatchNotification(
      "assignTasksWithinCalendarEvent",
      "Tasks assigned within calendar event successfully",
      "Error assigning tasks within calendar event",
      dispatch,
      eventId
    );
  }
},

    // Action to update milestone title
    updateMilestoneTitle: (
      state,
      action: PayloadAction<{ id: string; newTitle: string }>
    ) => {
      const milestone = state.milestones[action.payload.id];
      if (milestone) {
        milestone.title = action.payload.newTitle;
        // Perform additional actions such as notifying about the title update
        dispatchNotification(
          "updateMilestoneTitle",
          "Milestone title updated successfully",
          "Error updating milestone title",
          dispatch,
          action.payload.id
        );
      }
    },

    setEventReminder: (
      state,
      action: PayloadAction<{ eventId: string; reminder: string }>
    ) => {
      const { eventId, reminder } = action.payload;
      const event = state.entities[eventId];
      if (event) {
        event.reminder = reminder;
        dispatchNotification(
          "setEventReminder",
          "Calendar event reminder set successfully",
          "Error setting calendar event reminder",
          dispatch,
          eventId
        );
      }
      // Perform additional actions if needed
      return state;
    },

    pinEvent: (state, action: PayloadAction<string>) => {
      const eventId = action.payload;
      const event = state.entities[eventId];
      if (event) {
        event.pinned = true;
      }
    },
    unpinEvent: (state, action: PayloadAction<string>) => {
      const eventId = action.payload;
      const event = state.entities[eventId];
      if (event) {
        event.pinned = false;
      }
    },
    markEventAsComplete: (state, action: PayloadAction<string>) => {
      const eventId = action.payload;
      const event = state.entities[eventId];
      if (event) {
        event.status = StatusType.Completed;
      }
    },

    markEventAsIncomplete: (state, action: PayloadAction<string>) => {
      const eventId = action.payload;
      const event = state.entities[eventId];
      if (event) {
        event.status = StatusType.Tentative;
      }
    },

    archiveEvent: (state, action: PayloadAction<string>) => {
      const eventId = action.payload;
      const event = state.entities[eventId];
      if (event) {
        event.archived = true;
      }
    },
    unarchiveEvent: (state, action: PayloadAction<string>) => {
      const eventId = action.payload;
      const event = state.entities[eventId];
      if (event) {
        event.archived = false;
      }
    },

    // For "setEventPriority" action:
    setEventPriority: (
      state,
      action: PayloadAction<{ eventId: string; priority: string }>
    ) => {
      const { eventId, priority } = action.payload;
      const event = state.entities[eventId];
      if (event) {
        event.priority = priority as PriorityStatus; // Update the priority field of the event object
        dispatchNotification(
          "setEventPriority",
          "Event priority set successfully",
          "Error setting event priority",
          dispatch,
          eventId
        );
      }
      // Perform additional actions if needed
      return state;
    },

    // For "clearEventPriority" action:
    clearEventPriority: (state, action: PayloadAction<string>) => {
      const eventId = action.payload;
      const event = state.entities[eventId];
      if (event && event !== undefined) {
        event.priority = CalendarStatus.IMPORTING;
        dispatchNotification(
          "clearEventPriority",
          "Event priority cleared successfully",
          "Error clearing event priority",
          dispatch,
          eventId
        );
      }
      // Perform additional actions if needed
      return state;
    },

    // For "setEventLocation" action:
    setEventLocation: (
      state,
      action: PayloadAction<{ eventId: string; location: string }>
    ) => {
      const { eventId, location } = action.payload;
      const event = state.entities[eventId];
      if (event) {
        event.location = location;
      }
    },

    // For "clearEventLocation" action:
    clearEventLocation: (state, action: PayloadAction<string>) => {
      const eventId = action.payload;
      const event = state.entities[eventId];
      if (event) {
        event.location = ""; // Assuming location is a string, clear it
      }
    },

    // For "addEventAttachment" action:
    addEventAttachment: (
      state,
      action: PayloadAction<{ eventId: string; attachment: Attachment }>
    ) => {
      const { eventId, attachment } = action.payload;
      const event = state.entities[eventId];
      if (event) {
        event.attachments?.push(attachment);
      }
    },

    // For "removeEventAttachment" action:
    removeEventAttachment: (
      state,
      action: PayloadAction<{ eventId: string; attachmentId: string }>
    ) => {
      const { eventId, attachmentId } = action.payload;
      const event = state.entities[eventId];
      if (event) {
        event.attachments = event.attachments?.filter(
          (attachment) => attachment.id !== attachmentId
        );
      }
    },

    // For "editEventDescription" action:
    editEventDescription: (
      state,
      action: PayloadAction<{ eventId: string; description: string }>
    ) => {
      const { eventId, description } = action.payload;
      const event = state.entities[eventId];
      if (event) {
        event.description = description;
      }
    },

    // Action to clear event description
    clearEventDescription: (state, action: PayloadAction<string>) => {
      const eventId = action.payload;
      const event = state.entities[eventId];
      if (event) {
        event.description = ""; // Clear the event description
        dispatchNotification(
          "clearEventDescription",
          "Event description cleared successfully",
          "Error clearing event description",
          dispatch,
          eventId
        );
      }
    },

    // Action to set event category
    setEventCategory: (
      state,
      action: PayloadAction<{ eventId: string; category: string }>
    ) => {
      const { eventId, category } = action.payload;
      const event = state.entities[eventId];
      if (event) {
        event.category = category; // Set the event category
        dispatchNotification(
          "setEventCategory",
          "Event category set successfully",
          "Error setting event category",
          dispatch,
          eventId
        );
      }
    },

    // Action to clear event category
    clearEventCategory: (state, action: PayloadAction<string>) => {
      const eventId = action.payload;
      const event = state.entities[eventId];
      if (event) {
        event.category = ""; // Clear the event category
        dispatchNotification(
          "clearEventCategory",
          "Event category cleared successfully",
          "Error clearing event category",
          dispatch,
          eventId
        );
      }
    },

    // Action to set event tags
    setEventTags: (
      state,
      action: PayloadAction<{ eventId: string; tags: string[] }>
    ) => {
      const { eventId, tags } = action.payload;
      const event = state.entities[eventId];
      if (event) {
        event.tags = tags; // Set the event tags
        dispatchNotification(
          "setEventTags",
          "Event tags set successfully",
          "Error setting event tags",
          dispatch,
          eventId
        );
      }
    },

    // Action to clear event tags
    clearEventTags: (state, action: PayloadAction<string>) => {
      const eventId = action.payload;
      const event = state.entities[eventId];
      if (event) {
        event.tags = []; // Clear the event tags
        dispatchNotification(
          "clearEventTags",
          "Event tags cleared successfully",
          "Error clearing event tags",
          dispatch,
          eventId
        );
      }
    },

    // Action to set event privacy
    setEventPrivacy: (
      state,
      action: PayloadAction<{ eventId: string; privacy: string }>
    ): void => {
      const { eventId, privacy } = action.payload;
      const event = state.entities[eventId];
      if (event) {
        event.privacy = privacy;
        dispatchNotification(
          "setEventPrivacy",
          "Event privacy set successfully",
          "Error setting event privacy",
          dispatch,
          eventId
        );
      }
    },

    clearEventPrivacy: (state, action: PayloadAction<string>): void => {
      const eventId = action.payload;
      const event = state.entities[eventId];
      if (event && event !== undefined) {
        event.privacy = ""; // Clear the event privacy
        dispatchNotification(
          "clearEventPrivacy",
          "Event privacy cleared successfully",
          "Error clearing event privacy",
          dispatch,
          eventId
        );
      }
    },

    // Action to set event access
    setEventAccess: (
      state,
      action: PayloadAction<{ eventId: string; access: string }>
    ): void => {
      const { eventId, access } = action.payload;
      const event = state.entities[eventId];
      if (event) {
        // Update the event's access property
        event.access = access;
        dispatchNotification(
          "setEventAccess",
          "Event access set successfully",
          "Error setting event access",
          dispatch,
          eventId
        );
      }
    },

    // Action to clear event access
    clearEventAccess: (state, action: PayloadAction<string>): void => {
      const eventId = action.payload;
      const event = state.entities[eventId];
      if (event) {
        // Clear the event's access property
        event.access = "";
        dispatchNotification(
          "clearEventAccess",
          "Event access cleared successfully",
          "Error clearing event access",
          dispatch,
          eventId
        );
      }
    },

    // Action to set event recurring
    setEventRecurring: (
      state,
      action: PayloadAction<{ eventId: string; recurring: boolean }>
    ): void => {
      const { eventId, recurring } = action.payload;
      const event = state.entities[eventId];
      if (event) {
        // Update the event's recurring property
        event.recurring = recurring;
        dispatchNotification(
          "setEventRecurring",
          "Event recurring set successfully",
          "Error setting event recurring",
          dispatch,
          eventId
        );
      }
    },

    // Action to clear event recurring
    clearEventRecurring: (state, action: PayloadAction<string>): void => {
      const eventId = action.payload;
      const event = state.entities[eventId];
      if (event && event !== undefined) {
        event.recurring = false; // Clear the event recurring
        dispatchNotification(
          "clearEventRecurring",
          "Event recurring cleared successfully",
          "Error clearing event recurring",
          dispatch,
          eventId
        );
      }
    },
  },

  extraReducers: (builder) => {
    builder.addCase(
      exportCalendarEventsToExternalSources.pending,
      (state, action) => {
        // Set loading state to indicate that the export process is pending
        // This helps to visually indicate to the user that something is happening in the background
        state.isLoading = true;

        // You can also update other state properties if needed
        // For example, you might want to store information about the pending action
        // This can be useful for tracking the progress of specific requests
        state.pendingAction = action.meta.arg;

        // Additionally, you might want to clear any previous error messages when a new request starts
        // This ensures that the user isn't confused by stale error messages
        state.error = undefined;

        // You can also log the pending action for debugging or tracking purposes
        // This can be useful for diagnosing issues or monitoring the behavior of your application
        console.log("Exporting calendar events to external sources...");

        // If necessary, you can trigger side effects here, such as sending analytics events or performing additional actions
        // For example, you might want to track how often calendar events are exported or send usage data to analytics services
        // These side effects can help you gain insights into user behavior and improve your application over time
      }
    );
    builder.addCase(
      exportCalendarEventsToExternalSources.fulfilled,
      (state, action) => {
        // Set loading state to indicate that the export process is no longer pending
        state.isLoading = false;

        // Check if action.payload is not void
        if (typeof action.payload !== "undefined") {
          // Update state with the payload data
          state.exportedEvents = action.payload;

          // display a success message or trigger additional side effects
          console.log(
            "Calendar events successfully exported to external sources:",
            action.payload
          );
        } else {
          // Handle the case where action.payload is void
          console.error("Payload is void. Unable to update exportedEvents.");

          // Optionally, dispatch an error or display a notification to the user
          // dispatch(exportCalendarEventsError(errorMessage));
        }

        // Reset any pending action information
        state.pendingAction = null;
      }
    );

    builder.addCase(
      exportCalendarEventsToExternalSources.rejected,
      (state, action) => {
        // Set loading state to indicate that the export process is no longer pending
        state.isLoading = false;

        // Optionally, you can extract and handle the error message from the action payload
        const errorMessage = action.error.message;

        // Update state to reflect the rejected state, such as displaying an error message
        // For example, you might want to set an error flag or store the error message for display in the UI
        state.error = errorMessage;

        // You can also reset any pending action information, as the action has been rejected
        state.pendingAction = null;

        // Optionally, you can log the error for debugging purposes or to track failed export attempts
        console.error(
          "Error exporting calendar events to external sources:",
          errorMessage
        );

        // If necessary, trigger additional side effects here, such as logging the error or notifying the user
        // These side effects can help you diagnose issues, track failures, or provide feedback to the user about the failed export
      }
    );
  },
});

export const {
  // Calendar Events
  addCalendarEvent, // Create Calendar Event
  removeCalendarEvent, // Delete Calendar Event
  updateCalendarEventTitle, // Edit Calendar Event
  // New actions for calendar events
  viewCalendarEventDetails, // View Calendar Event Details
  shareCalendarEvent, // Share Calendar Event
  rsvpToCalendarEvent, // RSVP to Calendar Event
  filterCalendarEvents, // Filter Calendar Events
  //todo: update calendar events

  searchCalendarEvents, // Search Calendar Events
  sortCalendarEvents, // Sort Calendar Events
  markCalendarEventAsImportant, // Mark Calendar Event as Important
  assignCalendarEventToTeamMember, // Assign Calendar Event to Team Member
  markCalendarEventAsNotImportant, // Mark Calendar Event as Not Important

  // Event Management
  setEventColor,
  setEventReminder,
  pinEvent,
  unpinEvent,
  markEventAsComplete,
  markEventAsIncomplete,
  archiveEvent,
  unarchiveEvent,
  setEventPriority,
  clearEventPriority,

  // Event Information
  setEventLocation,
  clearEventLocation,
  addEventAttachment,
  removeEventAttachment,
  editEventDescription,
  clearEventDescription,
  setEventCategory,
  clearEventCategory,
  setEventTags,
  clearEventTags,

  // Event Privacy and Access
  setEventPrivacy,
  clearEventPrivacy,
  setEventAccess,
  clearEventAccess,

  // Event Recurrence
  setEventRecurring,
  clearEventRecurring,

  // Calendar Integration
  importCalendarEventsFromExternalSources, // Import Calendar Events from External Sources
  importCalendarEventViewingDetails, // Import Calendar Event Viewing Details
  addExternalCalendarsOverlay, // Add External Calendars Overlay

  // Collaboration
  inviteTeamMembersToCalendarEvent, // Invite Team Members to Calendar Event
  commentOnCalendarEvent, // Comment on Calendar Event
  assignTasksWithinCalendarEvent, // Assign Tasks within Calendar Event
  collaborativeEditingOfCalendarEventDetails, // Collaborative Editing of Calendar Event Details
  realTimeNotificationsForCalendarEventUpdates, // Real-time Notifications for Calendar Event Updates
  discussCalendarEventInChatRoom, // Discuss Calendar Event in Chat Room
  shareFilesWithinCalendarEvent, // Share Files within Calendar Event

  // Milestones
  addMilestone,
  removeMilestone,
  updateMilestoneTitle,

  // Notifications
  addNotification,
  removeNotification,
  updateNotificationMessage, // New action for updating notification messages

  // Loading State
  toggleLoadingState,

  // Entities
  setEntities, // New action for setting entities

  // Clearing Milestones
  clearAllMilestones,

  // //todo implement methods
  // AI Recommendations and Suggestions
  suggestEventLocation, // Suggest Event Location using AI
  recommendEventDuration, // Recommend Event Duration using AI
  suggestEventTheme, // Suggest Event Theme using AI
  proposeEventAlternatives, // Propose Event Alternatives using AI
  suggestEventImprovements, // Suggest Event Improvements using AI
  recommendEventCollaborators, // Recommend Event Collaborators using AI
  recommendEventEngagementStrategies, // Recommend Event Engagement Strategies using AI
  recommendEventMarketingChannels, // Recommend Event Marketing Channels using AI
  suggestEventPartnerships, // Suggest Event Partnerships using AI
  recommendEventTags, // Recommend Event Tags using AI

  // // AI Analysis and Prediction
  // optimizeEventTiming, // Optimize Event Timing using AI
  // analyzeAttendeeAvailability, // Analyze Attendee Availability using AI
  // predictEventAttendance, // Predict Event Attendance using AI
  // generateEventAgenda, // Generate Event Agenda using AI
  // detectEventConflicts, // Detect Event Conflicts using AI
  // classifyEventPriority, // Classify Event Priority using AI
  // analyzeEventFeedback, // Analyze Event Feedback using AI
  // predictEventSuccess, // Predict Event Success using AI
  // evaluateEventEffectiveness, // Evaluate Event Effectiveness using AI
  // detectEventTrends, // Detect Event Trends using AI
  // analyzeEventROI, // Analyze Event Return on Investment using AI
  // predictEventOutcomeVariability, // Predict Event Outcome Variability using AI
  // assessEventRisk, // Assess Event Risk using AI
  // generateEventContent, // Generate Event Content using AI
  // personalizeEventInvitations, // Personalize Event Invitations using AI
  // analyzeEventEngagementMetrics, // Analyze Event Engagement Metrics using AI
  // predictEventImpact, // Predict Event Impact using AI
  // suggestEventFollowUpActions, // Suggest Event Follow-Up Actions using AI

  // // AI Integration with Spacy and Prompting
  // analyzeEventContent, // Analyze Event Content using Spacy
  // generateEventPrompt, // Generate Prompt for Event using AI
  // detectEventSentiment, // Detect Sentiment of Event using AI
  // classifyEventCategory, // Classify Event Category using AI
  // generateEventSummary, // Generate Event Summary using AI
  // improveEventDetails, // Improve Event Details using AI
  // validateEventContent, // Validate Event Content using AI
  // evaluateEventImpact, // Evaluate Event Impact using AI
  // optimizeEventSchedule, // Optimize Event Schedule using AI
  // analyzeTeamCollaboration, // Analyze Team Collaboration using AI
} = useCalendarManagerSlice.actions;
export const selectCalendarEvents = (state: {
  calendarEvents: CalendarManagerState;
}) => state.calendarEvents.entities;

export const selectMilestones = (state: {
  calendarEvents: CalendarManagerState;
}) => state.calendarEvents.milestones;

export const selectNotifications = (state: {
  calendarEvents: CalendarManagerState;
}) => state.calendarEvents.notifications;

export default Milestone;
useCalendarManagerSlice.reducer;
export type { CalendarManagerState, ProductMilestone };