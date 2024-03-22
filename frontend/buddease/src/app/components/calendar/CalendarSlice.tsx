import { NotificationTypeEnum } from '@/app/components/support/NotificationContext';
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

import { useDispatch } from 'react-redux';
import { Theme } from '../libraries/ui/theme/Theme';
import { WritableDraft } from '../state/redux/ReducerGenerator';
import { CalendarEvent } from "../state/stores/CalendarEvent";
import { dispatchNotification, NotificationData } from "../support/NofiticationsSlice";
import { useNotification } from "../support/NotificationContext";
import NOTIFICATION_MESSAGES from "../support/NotificationMessages";
import { Attachment } from '../todos/Todo';
import CalendarEventViewingDetailsProps from './CalendarEventViewingDetails';
import DefaultCalendarEventViewingDetails from './DefaultCalendarEventViewingDetails';
import EventDetailsComponent from './EventDetailsComponent';
import { fetchData } from '@/app/api/ApiData';


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
}

// Define a function to return the default value
const getDefaultViewingEventDetails = (): React.FC<CalendarEventViewingDetailsProps> | null => {
  return DefaultCalendarEventViewingDetails;
};

const initialState: CalendarManagerState = {
  entities: {} as Record<string, CalendarEvent>,
  events: {} as  Record<string, CalendarEvent[]>,
  milestones: {} as Record<string, Milestone>,
  notifications: {} as Record<string, NotificationData>,
  loading: false,
  filteredEvents: {} as CalendarEvent[],
  sharedEvents: {} as Record<string, CalendarEvent>,
  sharedEvent: undefined,
  viewingEventDetails: getDefaultViewingEventDetails(),
  searchedEvents: [],
  sortedEvents: []
}



const { notify } = useNotification();
const dispatch = useDispatch();

// Define the handleViewEventDetails function to dispatch the action with the correct payload
const handleViewEventDetails = (eventDetails: CalendarEventViewingDetailsProps, eventId: string) => {
  dispatch(viewCalendarEventDetails({ eventDetails, eventId }) as any); // Explicitly cast the action type to 'any'
};           





// Define an async thunk for exporting calendar events
export const exportCalendarEventsToExternalSources = createAsyncThunk(
  'calendarEvents/exportCalendarEventsToExternalSources',
  async (eventId: string, { dispatch }: { dispatch: any }) => {
    // Add logic to export calendar events to external sources here
    // For example, you can export events to Google Calendar
    // Simulate async operation
    const event = await fetchEvent(eventId);
    if (event) {
      dispatch(
        useNotification().actions.showSuccessNotification(
          'Calendar events exported to external sources successfully'
        )
      );
    } else {
      dispatch(
        notificationsSlice.actions.showErrorNotification(
          'Error exporting calendar events to external sources'
        )
      );
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
    updateState: (state, action: PayloadAction<Partial<CalendarManagerState>>) => {
      return { ...state, ...action.payload };
    },

    // For "events" action:
    events: (state, action: PayloadAction<WritableDraft<Record<string, CalendarEvent>>>) => {
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
    addCalendarEvent: (state, action: PayloadAction<WritableDraft<CalendarEvent>>) => {
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
    
    removeCalendarEvent: async (state, action: PayloadAction<WritableDraft<CalendarEvent>>) => { 
      const eventId = action.payload.id; // Assuming eventId is a string or number
      const event = await state.entities[eventId];
      if (event) {
        delete state.entities[eventId];
        dispatchNotification(
          "removeCalendarEvent",
          "Calendar event removed successfully",
          "Error removing calendar event",
          dispatch,
          eventId
        );
      }
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

    // Action to send calendar event reminder
    sendCalendarEventReminder: (state, action: PayloadAction<CalendarEvent>) => { 
      const event = state.entities[action.payload.id];
      if (event) {
        dispatchNotification(
          "sendCalendarEventReminder",
          "Calendar event reminder sent successfully",
          "Error sending calendar event reminder",
          dispatch,
          action.payload
        );
      }
    },



    // Update the viewCalendarEventDetails reducer to use EventDetailsComponent
    viewCalendarEventDetails: (state, action: PayloadAction<{ eventId: string; eventDetails: CalendarEventViewingDetailsProps }>) => {
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
        event.teamMemberId = '123456789';
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
    let selectedColor: string;
    if (typeof color === 'string') {
      // If color is a string, use it directly
      selectedColor = color;
    } else {
      // If color is a Theme object, select the appropriate color
      selectedColor = selectColor(color);
    }

    // Define getColor function
    const getColor = (options: Theme): string => {
      // Implementation of getColor function goes here
      return ""; // Placeholder return value, replace with actual implementation
    };

    // Define selectColor function
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

    // Define defaultColor
    const defaultColor: string = getColor(color as Theme);

    // Assign selected color or default color to event.color
    event.color = selectedColor || defaultColor;

    // Dispatch notification
    dispatchNotification(
      "setEventColor",
      "Calendar event color set successfully",
      "Error setting calendar event color",
      dispatch,
      eventId
    );
  }
  // Return the updated state
  return state;
},







    // Update the importCalendarEventViewingDetails action with type assertion
    importCalendarEventViewingDetails: (state, action: PayloadAction<CalendarEventViewingDetailsProps>) => {
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
        console.error('Error: eventDetails.id is null or undefined');
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

    setEventReminder: (state, action: PayloadAction<{ eventId: string; reminder: string }>) => {
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
        event.status = "completed"
      }
    },


    markEventAsIncomplete: (state, action: PayloadAction<string>) => {
      const eventId = action.payload;
      const event = state.entities[eventId];
      if (event) {
        event.status = "tentative"
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
    event.priority = priority; // Update the priority field of the event object
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
      if (event) {
        event.priority = undefined;
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
          event.location = ''; // Assuming location is a string, clear it
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
        event.description = ''; // Clear the event description
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
    setEventCategory: (state, action: PayloadAction<{ eventId: string; category: string }>) => {
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
        event.category = ''; // Clear the event category
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
    setEventTags: (state, action: PayloadAction<{ eventId: string; tags: string[] }>) => {
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
      eventId: string,
      privacy: string
 ): PayloadAction<{ eventId: string; privacy: string }> => ({
      type: 'events/setEventPrivacy',
      payload: { eventId, privacy },
    }),
      
// Action to clear event privacy
clearEventPrivacy: (eventId: string): PayloadAction<string> => ({
  type: 'events/clearEventPrivacy',
  payload: eventId,
}),

// Action to set event access
setEventAccess: (
  eventId: string,
  access: string
): PayloadAction<{ eventId: string; access: string }> => ({
  type: 'events/setEventAccess',
  payload: { eventId, access },
}),

// Action to clear event access
clearEventAccess = (eventId: string): PayloadAction<string> => ({
  type: 'events/clearEventAccess',
  payload: eventId,
}),
    clearAllNotifications: (state) => {
      state.notifications = {};
      // Perform additional actions such as notifying about the clear all operation
      dispatchNotification(
        "clearAllNotifications",
        "All notifications cleared successfully",
        "Error clearing notifications",
        dispatch
      );
      return state;
    },
    
  },





  extraReducers: (builder) => {
    builder.addCase(exportCalendarEventsToExternalSources.pending, (state) => {
      // Handle pending state if needed
    });
    builder.addCase(exportCalendarEventsToExternalSources.fulfilled, (state) => {
      // Handle fulfilled state if needed
    });
    builder.addCase(exportCalendarEventsToExternalSources.rejected, (state) => {
      // Handle rejected state if needed
    });
  },
});
export const {
  // Calendar Events
  addCalendarEvent, // Create Calendar Event
  removeCalendarEvent, // Delete Calendar Event
  updateCalendarEventTitle, // Edit Calendar Event
  sendCalendarEventReminder, // Set Event Reminder
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
  syncCalendarWithExternalCalendars, // Sync Calendar with External Calendars
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
  clearAllNotifications,

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

export default Milestone; useCalendarManagerSlice.reducer; 
export type { CalendarManagerState, ProductMilestone };
