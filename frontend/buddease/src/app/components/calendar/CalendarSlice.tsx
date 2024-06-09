import calendarApiService from "@/app/api/ApiCalendar";
import { endpoints } from "@/app/api/ApiEndpoints";
import { fetchEventData } from "@/app/api/ApiEvent";
import { Message } from "@/app/generators/GenerateChatInterfaces";
import UniqueIDGenerator from "@/app/generators/GenerateUniqueIds";
import { initiateDataAnalysis } from "@/app/services/dataAnalysisService";
import ErrorHandler from "@/app/shared/ErrorHandler";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { produce } from "immer";
import { ChangeEvent } from "react";
import { useDispatch } from "react-redux";
import socketIOClient, { io } from "socket.io-client";
import { CalendarActions } from "../actions/CalendarEventActions";
import ChatMessage from "../communications/chat/ChatMessage";
import { Attachment } from "../documents/Attachment/attachment";
import CustomFile from "../documents/File";
import EventCategory from "../event/EventCategory";
import EventSentiment from "../event/EventSentiment";
import useFileUpload from "../hooks/commHooks/useFileUpload";
import TeamCollaborationAnalysis from "../interfaces/options/CollaborationOptions";
import { Theme } from "../libraries/ui/theme/Theme";
import { EventContentAnalysis, EventContentValidationResults, EventImpactAnalysis, ScheduleOptimization } from "../models/data/EventContentAnalysis";
import { EngagementMetrics, EventConflictDetectionResult, EventContent, EventEffectivenessEvaluation, EventFeedbackAnalysis, EventPriorityClassification, EventRiskAssessment, EventRoiAnalysis, EventSuccessPrediction, EventTrendDetectionResult, FollowUpAction, ImpactPrediction, OutcomeVariabilityPrediction, PersonalizedInvitation, RecommendedOptimization } from "../models/data/EventPriorityClassification";
import {
  CalendarStatus,
  PriorityStatus,
  ProjectPhaseTypeEnum,
  StatusType,
} from "../models/data/StatusType";
import { showErrorMessage, showToast } from "../models/display/ShowToast";
import { LogData } from "../models/LogData";
import { Task } from "../models/tasks/Task";
import { Member } from "../models/teams/TeamMembers";
import { Tag } from "../models/tracker/Tag";
import { ChatActions } from "../projects/DataAnalysisPhase/ChatActions";
import { WritableDraft } from "../state/redux/ReducerGenerator";
import { CalendarEvent } from "../state/stores/CalendarEvent";
import CalendarEventAlternative from "../state/stores/CalendarEventAlternative";
import {
  dispatchNotification,
  NotificationData,
  SendStatus,
} from "../support/NofiticationsSlice";
import { NotificationActions } from "../support/NotificationActions";
import {
  NotificationTypeEnum,
  useNotification,
} from "../support/NotificationContext";
import NOTIFICATION_MESSAGES from "../support/NotificationMessages";
import { User } from "../users/User";
import { AttendancePrediction } from "./AttendancePrediction";
import { event, ExtendedAttendeeAvailability, useAttendeeAvailabilityAnalysis } from "./Attendee";
import CalendarEventAgendaItem from "./CalendarEventAgendaItem";
import CalendarEventCategory from "./CalendarEventCategory";
import CalendarEventConflictDetectionResult from "./CalendarEventConflictDetectionResult";
import CalendarEventContentGeneration from "./CalendarEventContentGeneration";
import CalendarEventEffectivenessEvaluation from "./CalendarEventEffectivenessEvaluation";
import CalendarEventEngagementMetrics from "./CalendarEventEngagementMetrics";
import CalendarEventFeedbackAnalysis from "./CalendarEventFeedbackAnalysis";
import CalendarEventFollowUpActionSuggestion from "./CalendarEventFollowUpActionSuggestion";
import CalendarEventImpactPrediction from "./CalendarEventImpactPrediction";
import CalendarEventImprovement from "./CalendarEventImprovement";
import { CalendarEventInvitationPersonalization } from "./CalendarEventInvitationPersonalization";
import CalendarEventOptimizationRecommendation from "./CalendarEventOptimizationRecommendation";
import CalendarEventOutcomeVariabilityPrediction from "./CalendarEventOutcomeVariabilityPrediction";
import CalendarEventPriorityClassification from "./CalendarEventPriorityClassification";
import CalendarEventRiskAssessment from "./CalendarEventRiskAssessment";
import CalendarEventROIAnalysis from "./CalendarEventROIAnalysis";
import CalendarEventSuccessPrediction from "./CalendarEventSuccessPrediction";
import CalendarEventTimingOptimization from "./CalendarEventTimingOptimization";
import CalendarEventTrendDetectionResult from "./CalendarEventTrendDetectionResult";
import CalendarEventViewingDetails, { CalendarEventViewingDetailsProps } from "./CalendarEventViewingDetails";
import { CalendarViewProps } from "./CalendarView";
import DefaultCalendarEventViewingDetails from "./DefaultCalendarEventViewingDetails";
import EventDetailsComponent from "./EventDetailsComponent";
import ExternalCalendarOverlay from "./ExternalCalendarOverlay";
import React from "react";
interface Milestone {
  id: string;
  title: string;
  date: Date;
  dueDate: Date | null;
  startDate: Date | null;
}

// Define the type for ScheduleOptimizationResults
interface ScheduleOptimizationResults {
  eventId: string; // ID of the calendar event
  optimizedSchedule: string[]; // Array of optimized schedule items
  // Add more properties as needed
}

interface EventBudgetOptimizationResults {
  eventId: string;
  optimizedBudget: number[]; // Array of optimized budget items
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
  dueDate: new Date("2023-12-31")
};

export interface ChatRoom {
  id: string;
  creatorId: string;
  // Define properties of ChatRoom here, including 'topics'
  topics: any[]; // Adjust 'any[]' to the actual type of 'topics'
  messages: ChatMessage[]; // Add 'messages' property
  users: User[]; // Add 'users' property
}

interface ShareFilesPayload {
  eventId?: string;
  calendarEventId: string;
  files: CustomFile[];
  handleInputChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

type CalendarViewType =
  | "day"
  | "week"
  | "month"
  | "quarter"
  | "year"
  | React.FC<CalendarViewProps>;


interface CalendarManagerState {
  entities: Record<string, CalendarEvent> | undefined;
  events: Record<string, CalendarEvent[]> | undefined;
  milestones: Record<string, Milestone> | undefined;
  notifications: Record<string, NotificationData> | undefined;
  loading: boolean;
  filteredEvents: CalendarEvent[];
  searchedEvents: CalendarEvent[];
  sortedEvents: CalendarEvent[];
  viewingEventDetails: React.FC<CalendarEventViewingDetailsProps> | null;
  sharedEvents: Record<string, CalendarEvent> | undefined;
  sharedEvent: CalendarEvent | undefined;
  pendingAction: string | null;
  isLoading: boolean;
  error: string | undefined;
  calendarEvent: CalendarEvent | undefined;
  calendarEventEditing: CalendarEvent | null;
  currentView: CalendarViewType | null;
  exportedEvents: Record<string, CalendarEvent[]> | undefined;
  externalCalendarsOverlays: ExternalCalendarOverlay[];
  chatRooms: Record<string, ChatRoom> | undefined; // Updated to remove the array
  chatRoom: ChatRoom | undefined;
  user: User | null;
  suggestedLocation: string | null;
  suggestedDuration: number | null;
  suggestedTheme: Theme | null;
  suggestedAlternatives: CalendarEventAlternative[];
  eventImprovements: CalendarEventImprovement[];
  suggestedImprovements: CalendarEventImprovement[];
  suggestedCollaborators: Contact[];
  suggestedEngagementStrategies: CalendarEventEngagementStrategy[];
  suggestedMarketingChannels: MarketingChannel[];
  suggestEventPartnerships: CalendarEventPartnership[];
  suggestedPartnerships: CalendarEventPartnership[];
  suggestedTags: Tag[];
  suggestedTimingOptimization: CalendarEventTimingOptimization[];
  suggestedLocations: Location[];
  eventContentAnalysis: EventContentAnalysis | null;
  generatedPrompt: string | null;
  detectedSentiment: typeof EventSentiment | null;
  classifiedCategory: typeof EventCategory | null;
  generatedSummary: string | null;
  enhancedDetails: typeof CalendarEventViewingDetails | null;
  contentValidationResults: EventContentValidationResults | null;
  impactAnalysis: EventImpactAnalysis | null;
  budgetOptimization: EventBudgetOptimizationResults | null;
  teamCollaborationAnalysis: TeamCollaborationAnalysis | null;
  scheduleOptimization: ScheduleOptimization | null;
  optimizedEventSchedule: ScheduleOptimizationResults | null;
  suggestedAgenda: WritableDraft<CalendarEventAgendaItem>[];
  eventConflictDetectionResult: EventConflictDetectionResult | null;
  eventPriorityClassification: EventPriorityClassification | null;
  eventFeedbackAnalysis: EventFeedbackAnalysis | null;
  successPrediction: EventSuccessPrediction | null;
  effectivenessEvaluation: EventEffectivenessEvaluation | null;
  eventTrendDetectionResult: EventTrendDetectionResult | null;
  eventRoiAnalysis: EventRoiAnalysis | null;
  outcomeVariabilityPrediction: OutcomeVariabilityPrediction | null;
  eventRiskAssessment: EventRiskAssessment | null;
  generatedEventContent: EventContent | undefined;
  personalizedInvitations: PersonalizedInvitation[];
  engagementMetrics: EngagementMetrics[];
  
  impactPrediction: ImpactPrediction | undefined;
  suggestedFollowUpActions: FollowUpAction[];
  recommendedOptimizations: RecommendedOptimization[];
  attendancePrediction: AttendancePrediction | undefined;
  attendeeAvailabilityAnalysis: ExtendedAttendeeAvailability & {
    event: CalendarEvent | null;
    analyze: () => void
  };

  
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

export const sendMessageToChatRoom = async (
  state: any,
  action: PayloadAction<{
    calendarEvent: CalendarEvent;
    calendarEventId: string;
    chatRoomId: string;
  }>
): Promise<CalendarManagerState> => {
  try {
    // Get calendar event
    const calendarEvent = state.entities[action.payload.calendarEventId];

    // Get chat room
    const chatRoom = state.chatRooms[action.payload.chatRoomId];

    // Assuming chatRoom is an array of ChatRoom objects, ensure it's not empty before accessing its first element
    if (Array.isArray(chatRoom) && chatRoom.length > 0) {
      // Generate message
      const message: Partial<Message & ChatMessage> = {
        id: UniqueIDGenerator.generateMessageID(),
        channelId: chatRoom[0].id,
        content: `Discussion about calendar event "${calendarEvent.title}" (${action.payload.calendarEventId})`,
        isRead: false,
        timestamp: new Date(),
        text: `Discussion about calendar event "${calendarEvent.title}" (${action.payload.calendarEventId})`,
        senderId: String(state.user?.id),
        senderName: state.user?.username,
        // Add any additional properties needed for the message
      };

      // Add message to chat room
      chatRoom[0].addMessage(message as ChatMessage);

      // Dispatch notification
      dispatch(
        CalendarActions.dispatchNotification({
          id: UniqueIDGenerator.generateChatID(),
          createdAt: new Date(),
          date: new Date(),
          content: `Discussion about calendar event "${calendarEvent.title}" (${action.payload.calendarEventId}) sent successfully to chat room`,
          message: "Message sent to chat room successfully",
          sendStatus: "Success" as SendStatus,
          completionMessageLog: {} as LogData,
          type: NotificationTypeEnum.ChatID,
        })
      );
    } else {
      // Handle the case where chatRoom is not an array or it's empty
      // This could involve logging an error, throwing an exception, or any other appropriate action
      console.error("Invalid chat room:", chatRoom);
      // Additional error handling logic goes here
    }
  } catch (error: any) {
    // Handle errors
    console.error("Error sending message to chat room:", error);
    dispatchNotification(
      "addMessage",
      `Error sending message to chat room: ${error.message}`,
      "Invalid payload for milestones action",
      dispatch,
      action.payload
    );
    return {
      ...state,
      error: error.message || undefined,
    };
  }
  return {
    ...state,
    error: undefined,
  };
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

// Action to invite team members to a calendar event
export const inviteTeamMembersToCalendarEvent = createAsyncThunk(
  "calendar/inviteTeamMembersToEvent",
  async ({
    eventId,
    teamMembers,
  }: {
    eventId: string;
    teamMembers: string[];
  }) => {
    // Add logic to invite team members to the calendar event asynchronously
    // For example, you can make an API call to invite team members
    const response = await fetch(`/api/calendar/${eventId}/invite`, {
      method: "POST",
      body: JSON.stringify({ teamMembers }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    return data; // Return any relevant data from the API response
  }
);

// Action to comment on a calendar event
export const commentOnCalendarEvent = createAsyncThunk(
  "calendar/commentOnEvent",
  async ({ eventId, comment }: { eventId: string; comment: string }) => {
    // Add logic to comment on the calendar event asynchronously
    // For example, you can make an API call to add a comment
    const response = await fetch(`/api/calendar/${eventId}/comment`, {
      method: "POST",
      body: JSON.stringify({ comment }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    return data; // Return any relevant data from the API response
  }
);

// Action to assign tasks within a calendar event
export const assignTasksWithinCalendarEvent = createAsyncThunk(
  "calendar/assignTasksWithinEvent",
  async ({ eventId, tasks }: { eventId: string; tasks: Task[] }) => {
    // Add logic to assign tasks within the calendar event asynchronously
    // For example, you can make an API call to assign tasks
    const response = await fetch(`/api/calendar/${eventId}/assign-tasks`, {
      method: "POST",
      body: JSON.stringify({ tasks }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    return data; // Return any relevant data from the API response
  }
);

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
  calendarEvent: {} as CalendarEvent,
  calendarEventEditing: null as CalendarEvent | null,
  chatRooms: {} as Record<string, ChatRoom>,
  chatRoom: {} as ChatRoom,
  user: null,
  currentView: "day",
  suggestedLocation: null,
  suggestedDuration: null,
  suggestedTheme: null,
  suggestedAlternatives: [] as CalendarEventAlternative[],
  eventImprovements: [] as CalendarEventImprovement[],
  suggestedImprovements: [] as CalendarEventImprovement[],
  suggestedCollaborators: [] as Contact[],
  suggestedEngagementStrategies: [] as CalendarEventEngagementStrategy[],
  suggestedMarketingChannels: [] as MarketingChannel[],
  suggestEventPartnerships: [] as CalendarEventPartnership[],
  suggestedPartnerships: [] as CalendarEventPartnership[],
  suggestedTags: [] as Tag[],
  suggestedLocations: [] as Location[],
  suggestedTimingOptimization: [],
  eventContentAnalysis: {} as EventContentAnalysis,
  generatedPrompt: "",
  detectedSentiment: {} as typeof EventSentiment,
  classifiedCategory: {} as typeof EventCategory,
  generatedSummary: "",
  enhancedDetails: null,
  contentValidationResults: null,
  impactAnalysis: null,
  scheduleOptimization: null,
  optimizedEventSchedule: null,
  budgetOptimization: null,
  teamCollaborationAnalysis: null,
  suggestedAgenda: [],
  attendeeAvailabilityAnalysis: useAttendeeAvailabilityAnalysis(event),
  attendancePrediction: {} as AttendancePrediction,
  eventConflictDetectionResult: null,
  eventPriorityClassification: null,
  eventFeedbackAnalysis: null,
  successPrediction: null,
  effectivenessEvaluation: null,
  eventTrendDetectionResult: null,
  eventRoiAnalysis: null,
  outcomeVariabilityPrediction: null,
  eventRiskAssessment: null,
  generatedEventContent: {
    eventId: "",
    title: "",
    summary: "",
    content: "",
  },
  personalizedInvitations: [],
  engagementMetrics: [],
  impactPrediction: {
    eventId: "",

    predictedImpact: 0,
    confidenceScore: 0,
  },
  suggestedFollowUpActions: [],
  recommendedOptimizations: []
};

const { notify } = useNotification();
const dispatch = useDispatch();
const CALENDAR_API_URL = endpoints.calendar;
const CHAT_SERVER_URL = endpoints.chat;

// Define the handleViewEventDetails function to dispatch the action with the correct payload
const handleViewEventDetails = (
  eventDetails: CalendarEventViewingDetailsProps,
  eventId: string
) => {
  dispatch(viewCalendarEventDetails({ eventDetails, eventId }) as any); // Explicitly cast the action type to 'any'
};

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
      action: PayloadAction<
        Partial<WritableDraft<Record<string, CalendarEvent>>>
      >
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

    calendarEvent: (
      state,
      action: PayloadAction<WritableDraft<CalendarEvent>>
    ) => {
      const updatedEvent = action.payload;

      if (state.entities) {
        state.entities[updatedEvent.id] = updatedEvent;
      }

      dispatchNotification(
        "calendarEvent",
        "Calendar event updated successfully",
        "Invalid payload for calendarEvent action",
        dispatch,
        updatedEvent
      );

      if (
        updatedEvent.phase &&
        updatedEvent.phase.name === ProjectPhaseTypeEnum.DataAnalysis &&
        updatedEvent.status === StatusType.Completed
      ) {
        initiateDataAnalysis(updatedEvent as CalendarEvent);
      }
    },

    // For "addCalendarEvent" action:
    addCalendarEvent: (
      state,
      action: PayloadAction<WritableDraft<CalendarEvent>>
    ) => {
      if (state.entities) {
        state.entities[action.payload.id] = action.payload;
      }
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
      if (state.entities) {
        delete state.entities?.[eventId];
      }
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
      const event = state.entities?.[action.payload.id];
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
      const event = state.entities?.[action.payload.id];
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
      const milestones = state.milestones || {};
      milestones[action.payload.id] = action.payload;
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
      const milestones = state.milestones || {};
      const milestone = milestones[action.payload.id];
      if (milestone) {
        delete milestones[action.payload.id];
        dispatchNotification(
          "removeMilestone",
          "Milestone removed successfully",
          "Error removing milestone",
          dispatch,
          action.payload
        );
      }
    },

    addNotification: (
      state,
      action: PayloadAction<WritableDraft<NotificationData>>
    ) => {
      const notifications = state.notifications || {};
      notifications[action.payload.id] = action.payload;
      state.notifications = notifications;
      dispatchNotification(
        "addNotification",
        "Notification added successfully",
        "Error adding notification",
        dispatch,
        action.payload
      );
    },

    // For "removeNotification" action:
    removeNotification: (state, action: PayloadAction<string>) => {
      const notifications = state.notifications || {};
      delete notifications[action.payload];
      dispatchNotification(
        "removeNotification",
        "Notification removed successfully",
        "Error removing notification",
        dispatch,
        action.payload
      );
    },

    updateNotificationMessage: (
      state,
      action: PayloadAction<{ notificationId: string; newMessage: string }>
    ) => {
      const notifications = state.notifications || {};
      const notification = notifications[action.payload.notificationId];
      if (notification) {
        notification.message = action.payload.newMessage;
        dispatchNotification(
          "updateNotificationMessage",
          "Notification message updated successfully",
          "Error updating notification message",
          dispatch,
          action.payload
        );
      }
      return state;
    },

    toggleLoadingState: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    setEntities: (
      state,
      action: PayloadAction<Record<string, WritableDraft<CalendarEvent>>>
    ) => {
      state.entities = action.payload;
    },

    clearAllMilestones: (state) => {
      state.milestones = {};
    },

    suggestEventLocation: (state, action: PayloadAction<string>) => {
      const draftState = state as WritableDraft<CalendarManagerState>;
      draftState.suggestedLocation = action.payload;
    },

    recommendEventDuration: (state, action: PayloadAction<number>) => {
      const draftState = state as WritableDraft<CalendarManagerState>;
      draftState.suggestedDuration = action.payload;
      return state;
    },

    suggestEventTheme: (state, action: PayloadAction<WritableDraft<Theme>>) => {
      const draftState = state as WritableDraft<CalendarManagerState>;
      draftState.suggestedTheme = action.payload;
    },

    proposeEventAlternatives: (
      state,
      action: PayloadAction<CalendarEventAlternative[]>
    ) => {
      const draftState = state as WritableDraft<CalendarManagerState>;
      draftState.suggestedAlternatives = action.payload;
    },

    suggestEventImprovements: (
      state,
      action: PayloadAction<CalendarEventImprovement[]>
    ) => {
      const draftState = state as WritableDraft<CalendarManagerState>;
      draftState.suggestedImprovements = action.payload;
      return {
        ...state,
        suggestedImprovements: action.payload,
      };
    },


    recommendEventCollaborators: (
      state,
      action: PayloadAction<WritableDraft<Contact>[]>
    ) => {
      const draftState = state as WritableDraft<CalendarManagerState>;
      draftState.suggestedCollaborators = action.payload;

      dispatchNotification(
        "recommendEventCollaborators",
        "Event collaborators recommended successfully",
        "Error recommending event collaborators",
        dispatch,
        action.payload
      );

    },


    recommendEventEngagementStrategies: (
      state,
      action: PayloadAction<CalendarEventEngagementStrategy[]>
    ) => {
      const draftState = state as WritableDraft<CalendarManagerState>;
      draftState.suggestedEngagementStrategies = action.payload;
      return state;
    },

    recommendEventMarketingChannels: (
      state,
      action: PayloadAction<WritableDraft<MarketingChannel>[]>
    ) => {
      const draftState = state as WritableDraft<CalendarManagerState>;
      draftState.suggestedMarketingChannels = action.payload;
      return state;
    },

    suggestEventPartnerships: (
      state,
      action: PayloadAction<WritableDraft<CalendarEventPartnership>[]>
    ) => {
      const draftState = state as WritableDraft<CalendarManagerState>;
      draftState.suggestedPartnerships = action.payload;
      return state;
    },

    recommendEventTags: (
      state,
      action: PayloadAction<WritableDraft<Tag>[]>
    ) => {
      const draftState = state as WritableDraft<CalendarManagerState>;
      draftState.suggestedTags = action.payload;
      return state;
    },

    optimizeEventTiming: (
      state,
      action: PayloadAction<WritableDraft< CalendarEventTimingOptimization[] >>
    ) => {
      const draftState = state as WritableDraft<CalendarManagerState>;
      draftState.suggestedTimingOptimization = action.payload;

      // Log optimization event
      dispatchNotification(
        "optimizeEventTiming",
        "Event timing optimized successfully",
        "Error optimizing event timing",
        dispatch
      );
      
      console.log('Event timing optimized');

      return state;
    
    },
 
    analyzeAttendeeAvailability: (
      state,
      action: PayloadAction<
        WritableDraft<ExtendedAttendeeAvailability & {  event: CalendarEvent | null; analyze: () => void }>
      >
    ) => {
      const draftState = state as WritableDraft<CalendarManagerState>;
      draftState.attendeeAvailabilityAnalysis = action.payload;
      // Log availability analysis event
      dispatchNotification(
        "analyzeAttendeeAvailability",
        "Attendee availability analyzed successfully",
        "Error analyzing attendee availability",
        dispatch
      );
    },

    predictEventAttendance: (
      state,
      action: PayloadAction<WritableDraft<AttendancePrediction>>
    ) => {
      const draftState = state as WritableDraft<CalendarManagerState>;
      draftState.attendancePrediction = action.payload;
    
      return state;
    },
    
    generateEventAgenda: (
      state,
      action: PayloadAction<WritableDraft<CalendarEventAgendaItem[]>>
    ) => {
      const draftState = state as WritableDraft<CalendarManagerState>;
      draftState.suggestedAgenda = action.payload;
      return state;
    },


    detectEventConflicts: (
      state,
      action: PayloadAction<CalendarEventConflictDetectionResult>
    ) => {
      const draftState = state as WritableDraft<CalendarManagerState>;
      draftState.eventConflictDetectionResult = action.payload;
      // Log conflict detection event
      dispatchNotification(
        "detectEventConflicts",
        "Event conflicts detected successfully",
        "Error detecting event conflicts",
        dispatch
      );
    },


    classifyEventPriority: (
      state,
      action: PayloadAction<CalendarEventPriorityClassification>
    ) => {
      const draftState = state as WritableDraft<CalendarManagerState>;
      draftState.eventPriorityClassification = action.payload;

      // Log priority classification event
      dispatchNotification(
        "classifyEventPriority",
        "Event priority classified successfully",
        "Error classifying event priority",
        dispatch
      );

      return state;
    },

    analyzeEventFeedback: (
      state,
      action: PayloadAction<CalendarEventFeedbackAnalysis>
    ) => {
      const draftState = state as WritableDraft<CalendarManagerState>;
      draftState.eventFeedbackAnalysis = action.payload;

      // Log feedback analysis event
      dispatchNotification(
        "analyzeEventFeedback",
        "Event feedback analyzed successfully",
        "Error analyzing event feedback",
        dispatch
      );

      return state;
    },

    predictEventSuccess: (
      state,
      action: PayloadAction<CalendarEventSuccessPrediction>
    ) => {
      const draftState = state as WritableDraft<CalendarManagerState>;
      draftState.successPrediction = action.payload;

      // Log success prediction event
      dispatchNotification(
        "predictEventSuccess",
        "Event success predicted successfully",
        "Error predicting event success",
        dispatch
      );

      return state;
    },

    evaluateEventEffectiveness: (
      state,
      action: PayloadAction<CalendarEventEffectivenessEvaluation>
    ) => {
      const draftState = state as WritableDraft<CalendarManagerState>;
      draftState.effectivenessEvaluation = action.payload;

      // Log effectiveness evaluation event
      dispatchNotification(
        "evaluateEventEffectiveness",
        "Event effectiveness evaluated successfully",
        "Error evaluating event effectiveness",
        dispatch
      );

      return state
    },


    detectEventTrends: (
      state,
      action: PayloadAction<CalendarEventTrendDetectionResult>
    ) => {
      const draftState = state as WritableDraft<CalendarManagerState>;
      draftState.eventTrendDetectionResult = action.payload;

      // Log trend detection event
      dispatchNotification(
        "detectEventTrends",
        "Event trends detected successfully",
        "Error detecting event trends",
        dispatch
      );

      return state;
    
    },

    analyzeEventROI: (
      state,
      action: PayloadAction<CalendarEventROIAnalysis>
    ) => {
      const draftState = state as WritableDraft<CalendarManagerState>;
      draftState.eventRoiAnalysis = action.payload;

      // Log ROI analysis event
      dispatchNotification(
        "analyzeEventROI",
        "Event ROI analyzed successfully",
        "Error analyzing event ROI",
        dispatch
      );

      return state;
    },

    predictEventOutcomeVariability: (
      state,
      action: PayloadAction<CalendarEventOutcomeVariabilityPrediction>
    ) => {
      const draftState = state as WritableDraft<CalendarManagerState>;
      draftState.outcomeVariabilityPrediction = action.payload;

      // Log outcome variability prediction event
      dispatchNotification(
        "predictEventOutcomeVariability",
        "Event outcome variability predicted successfully",
        "Error predicting event outcome variability",
        dispatch
      );

      return state;
    },



    assessEventRisk: (
      state,
      action: PayloadAction<CalendarEventRiskAssessment>
    ) => {
      const draftState = state as WritableDraft<CalendarManagerState>;
      draftState.eventRiskAssessment = action.payload;

      // Log risk assessment event
      dispatchNotification(
        "assessEventRisk",
        "Event risk assessed successfully",
        "Error assessing event risk",
        dispatch
      );

      return state;
    },

    generateEventContent: (
      state,
      action: PayloadAction<CalendarEventContentGeneration>
    ) => {
      const draftState = state as WritableDraft<CalendarManagerState>;
      draftState.generatedEventContent = action.payload;

      // Log content generation event
      dispatchNotification(
        "generateEventContent",
        "Event content generated successfully",
        "Error generating event content",
        dispatch
      );
    },


    personalizeEventInvitations: (
      state,
      action: PayloadAction<CalendarEventInvitationPersonalization[]>
    ) => {
      const draftState = state as WritableDraft<CalendarManagerState>;
      draftState.personalizedInvitations = action.payload;

      // Log invitation personalization event
      dispatchNotification(
        "personalizeEventInvitations",
        "Event invitations personalized successfully",
        "Error personalizing event invitations",
        dispatch
      );

      return state;
    },


    analyzeEventEngagementMetrics: (
      state,
      action: PayloadAction<CalendarEventEngagementMetrics>
    ) => {
      const draftState = state as WritableDraft<CalendarManagerState>;
      draftState.engagementMetrics = action.payload;

      // Log engagement metrics event
      dispatchNotification(
        "analyzeEventEngagementMetrics",
        "Event engagement metrics analyzed successfully",
        "Error analyzing event engagement metrics",
        dispatch
      );

      return state;
    },

    predictEventImpact: (
      state,
      action: PayloadAction<CalendarEventImpactPrediction>
    ) => {
      const draftState = state as WritableDraft<CalendarManagerState>;
      draftState.impactPrediction = action.payload;

      // Log impact prediction event
      dispatchNotification(
        "predictEventImpact",
        "Event impact predicted successfully",
        "Error predicting event impact",
        dispatch
      );

      return state;
    },

    suggestEventFollowUpActions: (
      state,
      action: PayloadAction<CalendarEventFollowUpActionSuggestion[]>
    ) => {
      const draftState = state as WritableDraft<CalendarManagerState>;
      draftState.suggestedFollowUpActions = action.payload;

      // Log follow up action suggestion event
      dispatchNotification(
        "suggestEventFollowUpActions",
        "Event follow up actions suggested successfully",
        "Error suggesting event follow up actions",
        dispatch
      )
      return state;
    },
    recommendEventOptimization: (
      state,
      action: PayloadAction<CalendarEventOptimizationRecommendation[]>
    ) => {
      const draftState = state as WritableDraft<CalendarManagerState>;
      draftState.recommendedOptimizations = action.payload;

      // Log optimization recommendation event
      dispatchNotification(
        "recommendEventOptimization",
        "Event optimization recommended successfully",
        "Error recommending event optimization",
        dispatch
      )
      return state;
    },

    

    analyzeEventContent: (
      state,
      action: PayloadAction<{
        event: CalendarEvent;
        analysis: EventContentAnalysis;
      }>
    ) => {
      const draftState = state as WritableDraft<CalendarManagerState>;
      draftState.eventContentAnalysis = action.payload.analysis;
    },

    generateEventPrompt: (state, action: PayloadAction<string>) => {
      const draftState = state as WritableDraft<CalendarManagerState>;
      draftState.generatedPrompt = action.payload;
      return state;
    },

    detectEventSentiment: (
      state,
      action: PayloadAction<typeof EventSentiment>
    ) => {
      const draftState = state as WritableDraft<CalendarManagerState>;
      draftState.detectedSentiment = action.payload;
      return state;
    },

    classifyEventCategory: (
      state,
      action: PayloadAction<typeof EventCategory>
    ) => {
      const draftState = state as WritableDraft<CalendarManagerState>;
      draftState.classifiedCategory = action.payload;
      return state;
    },

    generateEventSummary: (
      state,
      action: PayloadAction<string>
    ) => {
      const draftState = state as WritableDraft<CalendarManagerState>;
      draftState.generatedSummary = action.payload;
      return state;
    },

    improveEventDetails: (
      state,
      action: PayloadAction<typeof CalendarEventViewingDetails>
    ) => {
      const draftState = state as WritableDraft<CalendarManagerState>;
      draftState.enhancedDetails = action.payload;
      return state;
    },

    validateEventContent: (
      state,
      action: PayloadAction<{
        event: CalendarEvent;
        validationResults: EventContentValidationResults
      }>
    ) => {
      const draftState = state as WritableDraft<CalendarManagerState>;
      draftState.contentValidationResults = action.payload.validationResults
      return state
    },

    optimizedEventSchedule: (
      state,
      action: PayloadAction<ScheduleOptimization>
    ) => {
      const draftState = state as WritableDraft<CalendarManagerState>;
      draftState.scheduleOptimization = action.payload;
    
      return {
        ...state,
        scheduleOptimization: action.payload
      }
    },
  
    evaluateEventImpact: (
      state,
      action: PayloadAction<EventImpactAnalysis>
    ) => {
      const draftState = state as WritableDraft<CalendarManagerState>;
      draftState.impactAnalysis = action.payload;
      return state;
    }, 
    optimizeEventBudget: (
      state,
      action: PayloadAction<WritableDraft<EventBudgetOptimizationResults>>
    ) => {
      const draftState = state as WritableDraft<CalendarManagerState>;
      draftState.budgetOptimization = action.payload;

      return {
        ...state,
        budgetOptimization: action.payload
      }
    },

    analyzeTeamCollaboration: (
      state,
      action: PayloadAction<TeamCollaborationAnalysis>
    ) => {
      const draftState = state as WritableDraft<CalendarManagerState>;
      draftState.teamCollaborationAnalysis = action.payload;
      return state;
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

    setCalendarView: (
      state,
      action: PayloadAction<"day" | "week" | "month" | "quarter" | "year">
    ) => {
      state.currentView = action.payload;
    },

    // Action to share calendar event
    shareCalendarEvent: (
      state, // Specify the correct type for state
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
      const event = state.entities?.[eventId];
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
    filterCalendarEvents: (
  state,
  action: PayloadAction<{
    filter: string;
    category: CalendarEventCategory;
  }>
) => {
  const filterCriteria = action.payload;

  // Filter events based on the provided category
  const filteredEvents = Object.values(state.entities || {}).filter(
    (event) => event && event.category === filterCriteria.category
  );

  // Update the state with the filtered events
  state.filteredEvents = filteredEvents;

  // Assuming dispatchNotification is a function defined elsewhere
  dispatchNotification(
    "filterCalendarEvents",
    "Calendar events filtered successfully",
    "Error filtering calendar events",
    dispatch
  );
},
    

    searchCalendarEvents: (state, action: PayloadAction<string>) => {
      const searchCriteria = action.payload;
      const entitiesArray: WritableDraft<CalendarEvent>[] = Object.values(
        state.entities || {}
      );

      const searchedEvents = entitiesArray.filter(
        (event) => event && event.title.includes(searchCriteria)
      );

      state.searchedEvents = searchedEvents;
},
    

    sortCalendarEvents: (state, action: PayloadAction<string>) => {
      const sortCriteria = action.payload;
      const entitiesArray: WritableDraft<CalendarEvent>[] = Object.values(
        state.entities || {}
      );

      const sortedEvents = entitiesArray.sort(
        (a: WritableDraft<CalendarEvent>, b: WritableDraft<CalendarEvent>) => {
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
      const event = state.entities?.[eventId];
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
      const event = state.entities?.[eventId];
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
      const event = state.entities?.[eventId];
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
      const event = state.entities?.[eventId];
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
      return state;
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
      state,
      action: PayloadAction<ExternalCalendarOverlay[]>
    ): WritableDraft<CalendarManagerState> {
      return produce(state, (draftState: CalendarManagerState) => {
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

    collaborativeEditingOfCalendarEventDetails: (
      state,
      action: PayloadAction<CalendarEventViewingDetailsProps>
    ) => {
      // Collaborative editing logic
      const { eventDetails } = action.payload;
      // Collaborative editing logic
      // For example, update event details in realtime database
      // And notify other users about the change
      const UpdatedEventDetailsComponent: React.FC<
        CalendarEventViewingDetailsProps
      > = (props) => {
        // Return JSX representing the updated event details component
        return (
          // Example JSX representing the updated event details component
          <div>{/* Your updated event details component */}</div>
        );
      };

      // Update event details in state
      state.viewingEventDetails = UpdatedEventDetailsComponent;
      // Notify other users about the change
      dispatch(
        CalendarActions.collaborativeEditingOfCalendarEventDetails({
          eventId: "12345", // Example eventId
          updatedProperties: {
            /* Updated properties */
          },
        })
      );
    },

    // Action to notify users in real-time about calendar event updates
    
    realTimeNotificationsForCalendarEventUpdates: (
      state,
      action: PayloadAction<CalendarEvent>
    ) => {
      const updatedEvent = action.payload;
      try {
        // Get updated event from action payload
        // Update event in state
        if (state.entities) {
          state.entities[updatedEvent.id] = {
            ...updatedEvent,
            host: updatedEvent.host
              ? produce(updatedEvent.host, (draft) => {})
              : ({} as WritableDraft<Member>), // Ensure host is a WritableDraft<Member>
            options: {
              ...updatedEvent.options,
              additionalOptions: updatedEvent.options?.additionalOptions
                ? [...(updatedEvent.options.additionalOptions as any[])]
                : [],
            },
          };
        }
        // Notify users about the update in real-time
        const socket = socketIOClient(CALENDAR_API_URL);
        socket.emit("calendarEventUpdated", updatedEvent);
      } catch (error) {
        // Dispatch notification
        dispatchNotification(
          "realTimeNotificationsForCalendarEventUpdates",
          "Calendar event updated successfully",
          "Error updating calendar event",
          dispatch,
          updatedEvent.id
        );
      }
    },



    updateMilestoneTitle: (
      state,
      action: PayloadAction<{ id: string; newTitle: string }>
    ) => {
      const milestone = state.milestones?.[action.payload.id];
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

    // Inside discussCalendarEventInChatRoom function
    discussCalendarEventInChatRoom: (
      state,
      action: PayloadAction<{
        eventId: string;
        chatRoomId: string;
        chatRoom: ChatRoom;
        calendarEventId: string;
      }>
    ) => {
      const {
        chatRoom: chatRoomPayload,
        eventId,
        chatRoomId: room_id,
      } = action.payload;
      let error: any;

      try {
        const chatRoom = state.chatRooms?.[room_id];
        if (!chatRoom) {
          console.error("Chat room not found:", room_id);
          return state;
        }

        const event = state.entities?.[eventId];
        if (!event) {
          console.error("Calendar event not found:", eventId);
          return state;
        }

        const socket = socketIOClient(CALENDAR_API_URL);
        socket.emit("discussCalendarEvent", { eventId, chatRoomId: room_id });
        socket.emit("discussCalendarEventInChatRoom", {
          eventId,
          chatRoomId: room_id,
          message: `Discussing event: ${event.title}`,
        });

        const joinChatRoom = (roomId: string) => {
          const socket = io(CHAT_SERVER_URL);
          socket.emit("join", { room: roomId, user: { id: socket.id } });
        };
        joinChatRoom(room_id);

        ChatActions.sendMessageToChatRoom({
          room_id,
          payload: {
            type: "calendarEventDiscussionStarted",
            calendarEventId: eventId,
          },
        });

        discussCalendarEvent(eventId, room_id);

        function discussCalendarEvent(
          calendarEventId: string,
          chatRoomId: string
        ) {
          ChatActions.sendMessageToChatRoom({
            chatRoomId,
            payload: {
              type: "calendarEventDetails",
              calendarEvent: state.entities?.[calendarEventId],
            },
          });

          ChatActions.sendMessageToChatRoom({
            chatRoomId,
            payload: {
              type: "addComment",
              text: "New comment",
              calendarEventId,
            },
          });
        }

        return state;
      } catch (err) {
        error = err;
        dispatchNotification(
          "discussCalendarEventInChatRoom",
          "Error discussing calendar event in chat room",
          "Calendar event discussed successfully in chat room",
          dispatch,
          error
        );

        const userChatGeneratedId = UniqueIDGenerator.generateChatID();
        const user: Partial<Member> = {
          _id: userChatGeneratedId,
          id: chatRoomPayload.creatorId || "",
          username: "Bot",
        };

        if (user.id !== undefined) {
          chatRoomPayload.users.push(user as Member);
        }
        const calendarEvent = state.entities?.[action.payload.calendarEventId];

        chatRoomPayload.messages.push({
          message: `Discussing event: ${calendarEvent?.title}`,
          user: { id: chatRoomPayload.creatorId, name: "Bot" },
          id: "",
          sender: "",
          senderId: "",
          senderName: "",
          content: "",
          timestamp: new Date(),
          isRead: false,
          messageType: "",
        });

        return {
          ...state,
          chatRooms: { ...state.chatRooms, [room_id]: chatRoomPayload },
          error: error.message,
        };
      }
    },

    shareFilesWithinCalendarEvent: (
      state,
      action: PayloadAction<ShareFilesPayload>
    ): WritableDraft<CalendarManagerState> => {
      try {
        const { eventId, calendarEventId, files, handleInputChange } =
          action.payload;

        // Define a function to handle file uploads
        const handleFileUpload = async (
          files: CustomFile[],
          handleInputChange: (
            event: React.ChangeEvent<HTMLInputElement>
          ) => void
        ) => {
          const uploadedFiles: CustomFile[] = [];

          for (const file of files) {
            // Perform the file upload and handle the result
            const result = await useFileUpload({
              inputValue: "file",
              handleInputChange: handleInputChange,
            }).uploadFile();

            // Check if the result is an error or a successful upload
            if ("error" in result) {
              // Handle error
              console.error("Error uploading file:", result.error);
            } else {
              // Add the uploaded file to the list
              uploadedFiles.push(result.uploadedFile);
            }
          }

          return uploadedFiles;
        };

        // Call handleFileUpload with handleInputChange
        handleFileUpload(files, handleInputChange).then((uploadedFiles) => {
          if (eventId !== undefined) {
            dispatch(
              CalendarActions.shareFilesWithinCalendarEvent({
                eventId,
                calendarEventId,
                files: uploadedFiles,
                recipients: [],
              })
            );
          }
        });

        return state;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },

    setEventReminder: (
      state,
      action: PayloadAction<{ eventId: string; reminder: string }>
    ) => {
      const { eventId, reminder } = action.payload;
      const event = state.entities?.[eventId];
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
      const event = state.entities?.[eventId];
      if (event) {
        event.pinned = true;
      }
    },
    unpinEvent: (state, action: PayloadAction<string>) => {
      const eventId = action.payload;
      const event = state.entities?.[eventId];
      if (event) {
        event.pinned = false;
      }
    },
    markEventAsComplete: (state, action: PayloadAction<string>) => {
      const eventId = action.payload;
      const event = state.entities?.[eventId];
      if (event) {
        event.status = StatusType.Completed;
      }
    },

    markEventAsIncomplete: (state, action: PayloadAction<string>) => {
      const eventId = action.payload;
      const event = state.entities?.[eventId];
      if (event) {
        event.status = StatusType.Tentative;
      }
    },

    archiveEvent: (state, action: PayloadAction<string>) => {
      const eventId = action.payload;
      const event = state.entities?.[eventId];
      if (event) {
        event.archived = true;
      }
    },
    unarchiveEvent: (state, action: PayloadAction<string>) => {
      const eventId = action.payload;
      const event = state.entities?.[eventId];
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
      const event = state.entities?.[eventId];
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
      const event = state.entities?.[eventId];
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
      const event = state.entities?.[eventId];
      if (event) {
        event.location = location;
      }
    },

    // For "clearEventLocation" action:
    clearEventLocation: (state, action: PayloadAction<string>) => {
      const eventId = action.payload;
      const event = state.entities?.[eventId];
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
      const event = state.entities?.[eventId];
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
      const event = state.entities?.[eventId];
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
      const event = state.entities?.[eventId];
      if (event) {
        event.description = description;
      }
    },

    // Action to clear event description
    clearEventDescription: (state, action: PayloadAction<string>) => {
      const eventId = action.payload;
      const event = state.entities?.[eventId];
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
      const event = state.entities?.[eventId];
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
      const event = state.entities?.[eventId];
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
      const event = state.entities?.[eventId];
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
      const event = state.entities?.[eventId];
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
      const event = state.entities?.[eventId];
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
      const event = state.entities?.[eventId];
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
      const event = state.entities?.[eventId];
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
      const event = state.entities?.[eventId];
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
      const event = state.entities?.[eventId];
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
      const event = state.entities?.[eventId];
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
        state.isLoading = true;
        state.pendingAction = action.meta.arg;
        state.error = undefined;
        console.log("Exporting calendar events to external sources...");
      }
    );
    builder.addCase(
      exportCalendarEventsToExternalSources.fulfilled,
      (state, action) => {
        state.isLoading = false;
        if (typeof action.payload !== "undefined") {
          state.exportedEvents = action.payload;
          console.log(
            "Calendar events successfully exported to external sources:",
            action.payload
          );
        } else {
          console.error("Payload is void. Unable to update exportedEvents.");
        }
        state.pendingAction = null;
      }
    );

    builder.addCase(
      exportCalendarEventsToExternalSources.rejected,
      (state, action) => {
        state.isLoading = false;
        const errorMessage = action.error.message;
        state.error = errorMessage;
        state.pendingAction = null;
        console.error(
          "Error exporting calendar events to external sources:",
          errorMessage
        );
      }
    );

    builder
      .addCase(inviteTeamMembersToCalendarEvent.fulfilled, (state, action) => {
        try {
          if (
            action.payload &&
            action.payload.success &&
            action.payload.invitedMembers
          ) {
            if (state.calendarEvent) {
              // If the calendar event exists in the state, add the invited members to its participants list
              state.calendarEvent.participants = [
                ...state.calendarEvent.participants,
                ...action.payload.invitedMembers,
              ];
            } else {
              // Handle the case where the calendar event does not exist in the state
              // For a real scenario, you might fetch the calendar event again from the server
              console.error(
                "Calendar event does not exist in the state. Refetching the event..."
              );
              dispatch(
                CalendarActions.fetchCalendarEvent({
                  calendarEventId: action.payload.calendarEventId,
                })
              );
            }
          } else {
            // Handle the case where the invitation was not successful or no invited members
            // For a real scenario, you might display an error message to the user or implement retry logic
            console.error(
              "Invitation was not successful or no invited members."
            );
            showErrorMessage("Invitation failed. Please try again later.");
          }
        } catch (error: any) {
          // Log the error using the error handler
          ErrorHandler.logError(error, { componentStack: null });

          // Handle the error gracefully
          // For a real scenario, you might display a generic error message to the user
          console.error(
            "An error occurred while handling the invitation:",
            error
          );
          showErrorMessage("An error occurred. Please try again later.");
        }
      })

      .addCase(commentOnCalendarEvent.fulfilled, (state, action) => {
        try {
          if (action.payload && action.payload.success) {
            if (state.calendarEvent && state.calendarEvent.comments) {
              state.calendarEvent.comments.push(action.payload.comment);
            }
          } else {
            // Handle the case where the comment was not successful
            console.error("Comment was not successful.");

            // For a real scenario, you might display an error message to the user or implement retry logic
            showErrorMessage("Comment failed. Please try again later.");
          }
        } catch (error: any) {
          ErrorHandler.logErrorWithRetry(error, { componentStack: null });
        }
      })
      .addCase(assignTasksWithinCalendarEvent.fulfilled, (state, action) => {
        try {
          // Check if the action payload contains valid data
          if (action.payload && action.payload.success) {
            // Update the state based on the successful task assignment
            if (state.calendarEvent) {
              state.calendarEvent.tasks = [
                ...state.calendarEvent.tasks,
                ...action.payload.assignedTasks,
              ];
              // For example, you might update the tasks list within the calendar event

              // with the newly assigned tasks from the payload
              if (state.calendarEvent && action.payload.assignedTasks) {
                state.calendarEvent.tasks = action.payload.assignedTasks;
              }
              // show message that tasks were assigned successfully

              // Display a toast message
              const message: Message = {
                id: "task assigned" as string,
                content: "Tasks assigned successfully:",
                timestamp: new Date(),
              } as Message;

              showToast(message);
            } else {
              // Handle the case where the task assignment was not successful
              // For example, you might display an error message or handle retry logic
              console.error("Task assignment was not successful.");
              showErrorMessage(
                "Task assignment failed. Please try again later."
              );
            }
          }
        } catch (error: any) {
          // Log any errors that occur during the process
          ErrorHandler.logErrorWithRetry(error, { componentStack: null });
        }
      });
  },
});

export const {
  // Calendar Events
  calendarEvent,
  addCalendarEvent, // Create Calendar Event
  removeCalendarEvent, // Delete Calendar Event
  updateCalendarEventTitle, // Edit Calendar Event

  // New actions for calendar events
  setCalendarView,
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
  optimizeEventTiming, // Optimize Event Timing using AI
  analyzeAttendeeAvailability, // Analyze Attendee Availability using AI
  predictEventAttendance, // Predict Event Attendance using AI
  generateEventAgenda, // Generate Event Agenda using AI
  detectEventConflicts, // Detect Event Conflicts using AI
  classifyEventPriority, // Classify Event Priority using AI
  analyzeEventFeedback, // Analyze Event Feedback using AI
  predictEventSuccess, // Predict Event Success using AI
  evaluateEventEffectiveness, // Evaluate Event Effectiveness using AI
  detectEventTrends, // Detect Event Trends using AI
  analyzeEventROI, // Analyze Event Return on Investment using AI
  predictEventOutcomeVariability, // Predict Event Outcome Variability using AI
  assessEventRisk, // Assess Event Risk using AI
  generateEventContent, // Generate Event Content using AI
  personalizeEventInvitations, // Personalize Event Invitations using AI
  analyzeEventEngagementMetrics, // Analyze Event Engagement Metrics using AI
  predictEventImpact, // Predict Event Impact using AI
  suggestEventFollowUpActions, // Suggest Event Follow-Up Actions using AI

  // // AI Integration with Spacy and Prompting
  // optimizeEventTiming,
  analyzeEventContent, // Analyze Event Content using Spacy
  generateEventPrompt, // Generate Prompt for Event using AI
  detectEventSentiment, // Detect Sentiment of Event using AI
  classifyEventCategory, // Classify Event Category using AI
  generateEventSummary, // Generate Event Summary using AI
  improveEventDetails, // Improve Event Details using AI
  validateEventContent, // Validate Event Content using AI
  evaluateEventImpact, // Evaluate Event Impact using AI
  optimizedEventSchedule, // Optimize Event Schedule using AI
  analyzeTeamCollaboration, // Analyze Team Collaboration using AI
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
