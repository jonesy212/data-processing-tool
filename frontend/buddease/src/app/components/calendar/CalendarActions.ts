// CalendarActions.ts
import { createAction } from "@reduxjs/toolkit";
import { Theme } from "../libraries/ui/theme/Theme";
import { CalendarEvent } from "../state/stores/CalendarEvent";


// Define the action using createAction
export const setEventColor = createAction<{ eventId: string; color: Theme }>(
  "setEventColor"
);



export const CalendarActions = {
  // Standard actions
  addEvent: createAction<CalendarEvent>("addEvent"),
  removeEvent: createAction<string>("removeEvent"),
  updateEventTitle: createAction<{ id: string; newTitle: string }>(
    "updateEventTitle"
  ),

  updateEventDate: createAction<{ id: string; newDate: Date }>(
    "updateEventDate"
  ),
  updateEventDescription: createAction<{ id: string; newDescription: string }>(
    "updateEventDescription"
  ),
  updateEventLocation: createAction<{ id: string; newLocation: string }>(
    "updateEventLocation"
  ),
  updateEventParticipants: createAction<{
    id: string;
    newParticipants: string[];
  }>("updateEventParticipants"),

  // Async actions
  fetchCalendarEventsRequest: createAction("fetchCalendarEventsRequest"),
  fetchCalendarEventsSuccess: createAction<{ events: CalendarEvent[] }>(
    "fetchCalendarEventsSuccess"
  ),
  fetchCalendarEventsFailure: createAction<{ error: string }>(
    "fetchCalendarEventsFailure"
  ),

  updateCalendarEventRequest: createAction<{
    id: string;
    newEvent: CalendarEvent;
  }>("updateCalendarEventRequest"),
  updateCalendarEventSuccess: createAction<{ event: CalendarEvent }>(
    "updateCalendarEventSuccess"
  ),
  updateCalendarEventFailure: createAction<{ error: string }>(
    "updateCalendarEventFailure"
  ),

  removeCalendarEventRequest: createAction<string>(
    "removeCalendarEventRequest"
  ),
  removeCalendarEventSuccess: createAction<string>(
    "removeCalendarEventSuccess"
  ),
  removeCalendarEventFailure: createAction<{ error: string }>(
    "removeCalendarEventFailure"
  ),

  shareEventSuccess: createAction<{ eventId: "view" | "edit" | "comment" }>("shareEventSuccess"),
  shareEventFailure: createAction<{ error: string }>("shareEventFailure"),




  shareCalendar: createAction<string[]>("shareCalendar"),
  syncCalendar: createAction("syncCalendar"),
  exportCalendar: createAction<string>("exportCalendar"),
  importCalendar: createAction<string>("importCalendar"),
  recurringEvents: createAction<{ id: string; recurrence: string }>(
    "recurringEvents"
  ),
  searchEvents: createAction<string>("searchEvents"),
  eventNotifications: createAction<{
    eventId: string;
    notificationType: "email" | "sms" | "push";
    // Additional parameters like notification time, recurrence, etc.
  }>("eventNotifications"),
  eventCategoriesTags: createAction<{
    eventId: string;
    categories: string[];
    tags: string[];
  }>("eventCategoriesTags"),
  eventPrivacy: createAction<{
    eventId: string;
    privacyType: "public" | "private" | "shared";
  }>("eventPrivacy"),
  eventAttachments: createAction<{
    eventId: string;
    attachments: string[];
  }>("eventAttachments"),

  createRecurringEvent:createAction<{
    frequency: "daily" | "weekly" | "monthly" | "custom";
    interval?: number; // For custom frequency
    // Additional parameters as needed
  }>("createRecurringEvent"),



  setEventReminder: createAction<{
    eventId: string;
    reminderType: "email" | "push" | "inApp";
    // Additional parameters like reminder time, recurrence, etc.
  }>("setEventReminder"),

  categorizeEvent: createAction<{
    eventId: string;
    category: string;
    // Additional parameters as needed
  }>("categorizeEvent"),

  shareEvent: createAction<{
    eventId: string;
    recipients: string[]; // User IDs or emails
    permission: "view" | "edit" | "comment";
    // Additional parameters as needed
  }>("shareEvent"),

  syncEvent: createAction<string>("syncEvent"),
  syncEventSuccess: createAction<{ eventId: string }>("syncEventSuccess"),
  attachFileToEvent: createAction<{
    eventId: string;
    attachment: File | string; // File object or URL
    // Additional parameters as needed
  }>("attachFileToEvent"),

  setEventVisibility: createAction<{
    eventId: string;
    visibility: "public" | "private" | "restricted";
    // Additional parameters as needed
  }>("setEventVisibility"),

  provideEventFeedback: createAction<{
    eventId: string;
    rating: number; // Rating out of 5 stars
    feedback: string;
    // Additional parameters as needed
  }>("provideEventFeedback"),

  scheduleMeeting: createAction<{
    participants: string[]; // User IDs or emails
    dateTime: Date;
    duration: number; // Duration in minutes
    // Additional parameters as needed
  }>("scheduleMeeting"),

  

  dragAndDropEvent: createAction<{
    eventId: string;
    newDateTime: Date;
    // Additional parameters as needed
  }>("dragAndDropEvent"),

  createEventTemplate: createAction<{
    templateName: string;
    eventData: CalendarEvent;
    // Additional parameters as needed
  }>("createEventTemplate"),

  importEvents: createAction<File>("importEvents"),
  exportEvents: createAction("exportEvents"),

  viewEventHistory: createAction<string>("viewEventHistory"),
  revertEventChanges: createAction<string>("revertEventChanges"),

  setTimeZone: createAction<string>("setTimeZone"),

  resolveEventConflict: createAction<string>("resolveEventConflict"),

  duplicateEvent: createAction<string>("duplicateEvent"),

  setEventColor: createAction<{
    eventId: string;
    color: string;
    // Additional parameters as needed
  }>("setEventColor"),

  addEventComment: createAction<{
    eventId: string;
    comment: string;
    // Additional parameters as needed
  }>("addEventComment"),

  setEventPermissions: createAction<{
    eventId: string;
    permissions: { userId: string; accessLevel: "view" | "edit" | "delete" };
    // Additional parameters as needed
  }>("setEventPermissions"),

  createEventCategory: createAction<string>("createEventCategory"),
  assignEventCategory: createAction<{
    eventId: string;
    categoryId: string;
    // Additional parameters as needed
  }>("assignEventCategory"),



  setEventPriority: createAction<{
    eventId: string;
    priority: "low" | "medium" | "high";
    // Additional parameters as needed
  }>("setEventPriority"),

  editRecurringEventInstance: createAction<{
    eventId: string;
    newEventData: CalendarEvent;
    // Additional parameters as needed
  }>("editRecurringEventInstance"),

  sendEventCollaborationInvitation: createAction<{
    eventId: string;
    invitees: string[]; // User IDs or emails
    // Additional parameters as needed
  }>("sendEventCollaborationInvitation"),

  setEventLabels: createAction<{
    eventId: string;
    labels: string[];
    // Additional parameters as needed
  }>("setEventLabels"),

  respondToEventRSVP: createAction<{
    eventId: string;
    response: "attending" | "maybe" | "notAttending";
    comment?: string;
    // Additional parameters as needed
  }>("respondToEventRSVP"),

  shareEventExternally: createAction<{
    eventId: string;
    platform: "email" | "facebook" | "twitter";
    // Additional parameters as needed
  }>("shareEventExternally"),

  suggestEventLocation: createAction<string>("suggestEventLocation"),

  customizeEventView: createAction<{
    userId: string;
    preferences: {
      layout: "dayView" | "weekView" | "monthView";
      timeFormat: "12Hour" | "24Hour";
      timeZone: string;

      // Additional preferences as needed
    };
    // Additional parameters as needed
  }>("customizeEventView"),

  createEventLabel: createAction<string>("createEventLabel"),
  assignEventLabel: createAction<{
    eventId: string;
    labelId: string;
    // Additional parameters as needed
  }>("assignEventLabel"),

  createEventTag: createAction<string>("createEventTag"),
  assignEventTag: createAction<{ eventId: string; labelId: string }>("assignEventTag"),
  
  // Bulk actions for batching services
  batchUpdateCalendarEventsRequest: createAction<{
    ids: string[];
    newEvent: CalendarEvent;
  }>("batchUpdateCalendarEventsRequest"),
  batchUpdateCalendarEventsSuccess: createAction<{ events: CalendarEvent[] }>(
    "batchUpdateCalendarEventsSuccess"
  ),
  batchUpdateCalendarEventsFailure: createAction<{ error: string }>(
    "batchUpdateCalendarEventsFailure"
  ),

  batchRemoveCalendarEventsRequest: createAction<string[]>(
    "batchRemoveCalendarEventsRequest"
  ),
  batchRemoveCalendarEventsSuccess: createAction<string[]>(
    "batchRemoveCalendarEventsSuccess"
  ),
  batchRemoveCalendarEventsFailure: createAction<{ error: string }>(
    "batchRemoveCalendarEventsFailure"
  ),
};
