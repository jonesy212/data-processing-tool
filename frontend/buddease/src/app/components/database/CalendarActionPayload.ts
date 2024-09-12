// CalendarActionPayload.ts

import { CalendarEvent } from "../calendar/CalendarEvent";
import { Data } from "../models/data/Data";
import { AllStatus } from "../state/stores/DetailsListStore";

// Define possible actions for the CalendarManager
type CalendarActionType =
  | 'ADD_EVENT'
  | 'UPDATE_EVENT'
  | 'REMOVE_EVENT'
  | 'SET_EVENT_STATUS';

// Define the payloads for different actions
interface AddEventPayload<T extends Data, K extends Data> {
  event: CalendarEvent<T, K>;
}

interface UpdateEventPayload<T extends Data, K extends Data> {
  eventId: string;
  updatedEvent: Partial<CalendarEvent<T, K>>;
}

interface RemoveEventPayload {
  eventId: string;
}

interface SetEventStatusPayload {
  eventId: string;
  status: AllStatus;
}

// Define a union type for action payloads
type CalendarActionPayload<T extends Data, K extends Data> =
  | AddEventPayload<T, K>
  | UpdateEventPayload<T, K>
  | RemoveEventPayload
  | SetEventStatusPayload;


export type {
    AddEventPayload, CalendarActionPayload, CalendarActionType, RemoveEventPayload, SetEventStatusPayload, UpdateEventPayload
};
