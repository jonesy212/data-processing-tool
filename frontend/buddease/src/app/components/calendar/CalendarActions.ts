// CalendarActions.ts
import { createAction } from "@reduxjs/toolkit";
import { CalendarEvent } from "../state/stores/CalendarStore";

export const CalendarActions = {
  // Standard actions
  addEvent: createAction<CalendarEvent>("addEvent"),
  removeEvent: createAction<string>("removeEvent"),
  updateEventTitle: createAction<{ id: string; newTitle: string }>(
    "updateEventTitle"
  ),

  // Async actions
  fetchCalendarEventsRequest: createAction("fetchCalendarEventsRequest"),
  fetchCalendarEventsSuccess: createAction<{ events: CalendarEvent[] }>("fetchCalendarEventsSuccess"),
  fetchCalendarEventsFailure: createAction<{ error: string }>("fetchCalendarEventsFailure"),

  updateCalendarEventRequest: createAction<{ id: string, newEvent: CalendarEvent }>("updateCalendarEventRequest"),
  updateCalendarEventSuccess: createAction<{ event: CalendarEvent }>("updateCalendarEventSuccess"),
  updateCalendarEventFailure: createAction<{ error: string }>("updateCalendarEventFailure"),

  removeCalendarEventRequest: createAction<string>("removeCalendarEventRequest"),
  removeCalendarEventSuccess: createAction<string>("removeCalendarEventSuccess"),
  removeCalendarEventFailure: createAction<{ error: string }>("removeCalendarEventFailure"),

  // Add more actions as needed

  // Bulk actions for batching services
  batchUpdateCalendarEventsRequest: createAction<{ ids: string[], newEvent: CalendarEvent }>("batchUpdateCalendarEventsRequest"),
  batchUpdateCalendarEventsSuccess: createAction<{ events: CalendarEvent[] }>("batchUpdateCalendarEventsSuccess"),
  batchUpdateCalendarEventsFailure: createAction<{ error: string }>("batchUpdateCalendarEventsFailure"),

  batchRemoveCalendarEventsRequest: createAction<string[]>("batchRemoveCalendarEventsRequest"),
  batchRemoveCalendarEventsSuccess: createAction<string[]>("batchRemoveCalendarEventsSuccess"),
  batchRemoveCalendarEventsFailure: createAction<{ error: string }>("batchRemoveCalendarEventsFailure"),
  
};
