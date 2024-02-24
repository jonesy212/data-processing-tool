import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CalendarEvent } from "../state/stores/CalendarEvent";
import { Notification } from "../support/NofiticationsSlice";
import { useNotification } from "../support/NotificationContext";
import NOTIFICATION_MESSAGES from "../support/NotificationMessages";
interface Milestone {
  id: string;
  title: string;
  date: Date;
}

interface CalendarManagerState {
  entities: Record<string, CalendarEvent>;
  milestones: Record<string, Milestone>;
  notifications: Record<string, Notification>;
  loading: boolean; // Example: Loading state
}

const initialState: CalendarManagerState = {
  entities: {} as Record<string, CalendarEvent>,
  milestones: {} as Record<string, Milestone>,
  notifications: {} as Record<string, Notification>,
  loading: false,
};
const { notify } = useNotification();

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
    events: (state, action: PayloadAction<Record<string, CalendarEvent>>) => {
      state.entities = action.payload;
      notify(
        "Events updated successfully",
        NOTIFICATION_MESSAGES.CalendarEvents.EVENTS_UPDATE_SUCCESS,
        new Date(),
        "Info"
      );
    },
    milestones: (state, action: PayloadAction<Record<string, Milestone>>) => {
      state.milestones = action.payload;
      notify(
        "Milestones updated successfully",
        NOTIFICATION_MESSAGES.CalendarEvents.MILESTONES_UPDATE_SUCCESS,
        new Date(),
        "Info"
      );
    },
    addCalendarEvent: (state, action: PayloadAction<CalendarEvent>) => {
      state.entities[action.payload.id] = action.payload;
      notify(
        "Calendar event added successfully",
        NOTIFICATION_MESSAGES.CalendarEvents.ADD_EVENT_SUCCESS,
        new Date(),
        "CalendarEvent"
      );
    },
    removeCalendarEvent: (state, action: PayloadAction<string>) => {
      delete state.entities[action.payload];
      notify(
        "Calendar event removed successfully",
        NOTIFICATION_MESSAGES.CalendarEvents.REMOVE_EVENT_SUCCESS,
        new Date(),
        "CalendarEvent"
      );
    },
    updateCalendarEvent: (state, action: PayloadAction<CalendarEvent>) => {
      const event = state.entities[action.payload.id];
      if (event) {
        event.title = action.payload.title;
        event.startTime = action.payload.startTime;
        event.endTime = action.payload.endTime;
        notify(
          "Calendar event updated successfully",
          NOTIFICATION_MESSAGES.CalendarEvents.UPDATE_EVENT_SUCCESS,
          new Date(),
          "CalendarEvent"
        );
      }
    },
    updateCalendarEventTitle: (
      state,
      action: PayloadAction<{ id: string; newTitle: string }>
    ) => {
      const event = state.entities[action.payload.id];
      if (event) {
        event.title = action.payload.newTitle;
        notify(
          "Calendar event title updated successfully",
          NOTIFICATION_MESSAGES.CalendarEvents.UPDATE_EVENT_TITLE_SUCCESS,
          new Date(),
          "CalendarEvent"
        );
      }
    },
    addMilestone: (state, action: PayloadAction<Milestone>) => {
      state.milestones[action.payload.id] = action.payload;

      const { notify } = useNotification();
      notify(
        "Milestone added successfully",
        NOTIFICATION_MESSAGES.Milestones.ADD_SUCCESS,
        new Date(),
        "Milestone"
      );
    },

    removeMilestone: (state, action: PayloadAction<string>) => {
      delete state.milestones[action.payload];

      const { notify } = useNotification();
      notify(
        "Milestone removed successfully",
        NOTIFICATION_MESSAGES.Milestones.REMOVE_SUCCESS,
        new Date(),
        "Milestone"
      );
    },

    addNotification: (state, action: PayloadAction<Notification>) => {
      state.notifications[action.payload.id] = action.payload;

      const { notify } = useNotification();
      notify(
        "Notification added successfully",
        NOTIFICATION_MESSAGES.Notifications.ADD_SUCCESS,
        new Date(),
        "CalendarNotification"
      );
    },

    removeNotification: (state, action: PayloadAction<string>) => {
      delete state.notifications[action.payload];

      const { notify } = useNotification();
      notify(
        "Notification removed successfully",
        NOTIFICATION_MESSAGES.Notifications.REMOVE_SUCCESS,
        new Date(),
        "CalendarNotification"
      );
    },

    sendCalendarEventReminder: (
      state,
      action: PayloadAction<{ eventId: string }>
    ) => {
      const event = state.entities[action.payload.eventId];
      if (event) {
        // Logic to send reminder...
        const { notify } = useNotification();
        notify(
          "Calendar event reminder sent successfully",
          NOTIFICATION_MESSAGES.CalendarEvents.EVENT_REMINDER_SUCCESS,
          new Date(),
          "CalendarEvent"
        );
      }
    },

    // Action to view calendar event details
    viewCalendarEventDetails: (state, action: PayloadAction<string>) => {
      const eventId = action.payload;
      // Add logic to view calendar event details here
      // For example, you can set a flag in the state to indicate that the event details are being viewed
      state.viewingEventDetails = eventId;
    },

    // Action to share calendar event
    shareCalendarEvent: (state, action: PayloadAction<string>) => {
      const eventId = action.payload;
      // Add logic to share calendar event here
      // For example, you can open a modal or trigger a sharing functionality
      state.sharedEvent = eventId;
    },

    // Action to RSVP to calendar event
    rsvpToCalendarEvent: (state, action: PayloadAction<string>) => {
      const eventId = action.payload;
      // Add logic to RSVP to calendar event here
      // For example, you can update the RSVP status of the event in the state
      const event = state.entities[eventId];
      if (event) {
        event.rsvpStatus = "Attending"; // Update RSVP status to 'Attending'
      }
    },

    // Action to filter calendar events
    filterCalendarEvents: (state, action: PayloadAction<string>) => {
      const filterCriteria = action.payload;
      // Add logic to filter calendar events here
      // For example, you can filter events based on the provided criteria and update the state accordingly
      const filteredEvents = state.entities.filter(
        (event) => event.category === filterCriteria
      );
      state.filteredEvents = filteredEvents;
    },

    updateMilestoneTitle: (
      state,
      action: PayloadAction<{ id: string; newTitle: string }>
    ) => {
      const milestone = state.milestones[action.payload.id];
      if (milestone) {
        milestone.title = action.payload.newTitle;
        notify(
          "Milestone title updated successfully",
          NOTIFICATION_MESSAGES.Milestones.UPDATE_TITLE_SUCCESS,
          new Date(),
          "Milestone"
        );
      }
    },

    clearAllNotifications: (state) => {
      state.notifications = {};
      notify(
        "All notifications cleared successfully",
        NOTIFICATION_MESSAGES.Notifications.CLEAR_ALL_SUCCESS,
        new Date(),
        "CalendarNotification"
      );
    },

    toggleLoadingState: (state) => {
      state.loading = !state.loading;
    },

    updateNotificationMessage: (
      state,
      action: PayloadAction<{ id: string; newMessage: string }>
    ) => {
      const notification = state.notifications[action.payload.id];
      if (notification) {
        notification.message = action.payload.newMessage;
        notify(
          "Notification message updated successfully",
          NOTIFICATION_MESSAGES.Notifications.UPDATE_MESSAGE_SUCCESS,
          new Date(),
          "CalendarNotification"
        );
      }
    },

    setEntities: (
      state,
      action: PayloadAction<Record<string, CalendarEvent>>
    ) => {
      state.entities = action.payload;
      notify(
        "Entities set successfully",
        NOTIFICATION_MESSAGES.Entities.SET_SUCCESS,
        new Date(),
        "CalendarEvent"
      );
    },

    clearAllMilestones: (state) => {
      state.milestones = {};
      notify(
        "All milestones cleared successfully",
        NOTIFICATION_MESSAGES.Milestones.CLEAR_ALL_SUCCESS,
        new Date(),
        "Milestone"
      );
    },
    // Add other actions as needed
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
  exportCalendarEventsToExternalSources, // Export Calendar Events to External Sources
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
  // // AI Recommendations and Suggestions
  // suggestEventLocation, // Suggest Event Location using AI
  // recommendEventDuration, // Recommend Event Duration using AI
  // suggestEventTheme, // Suggest Event Theme using AI
  // proposeEventAlternatives, // Propose Event Alternatives using AI
  // suggestEventImprovements, // Suggest Event Improvements using AI
  // recommendEventCollaborators, // Recommend Event Collaborators using AI
  // recommendEventEngagementStrategies, // Recommend Event Engagement Strategies using AI
  // recommendEventMarketingChannels, // Recommend Event Marketing Channels using AI
  // suggestEventPartnerships, // Suggest Event Partnerships using AI
  // recommendEventTags, // Recommend Event Tags using AI

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
