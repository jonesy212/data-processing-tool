// CalendarActionPayload.ts
import { UnifiedMetaDataOptions } from '@/app/configs/database/MetaDataOptions';
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
interface AddEventPayload<T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T> {
  event: CalendarEvent<T, Meta, K>;
}

interface UpdateEventPayload<T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T> {
  eventId: string;
  updatedEvent: Partial<CalendarEvent<T, Meta, K>>;
}

interface RemoveEventPayload {
  eventId: string;
}

interface SetEventStatusPayload {
  eventId: string;
  status: AllStatus;
}

// Define a union type for action payloads
type CalendarActionPayload<T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T> =
  | AddEventPayload<T, Meta, K>
  | UpdateEventPayload<T, Meta, K>
  | RemoveEventPayload
  | SetEventStatusPayload;


export type {
    AddEventPayload, CalendarActionPayload, CalendarActionType, RemoveEventPayload, SetEventStatusPayload, UpdateEventPayload
};
