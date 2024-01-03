// CalendarActions.ts
import { createAction } from "@reduxjs/toolkit";
import { CalendarEvent } from "../state/stores/CalendarStore";

export const CalendarActions = {
  addEvent: createAction<CalendarEvent>("addEvent"),
  removeEvent: createAction<string>("removeEvent"),
  updateEventTitle: createAction<{ id: string; newTitle: string }>(
    "updateEventTitle"
  ),
  // Add other actions as needed
};
