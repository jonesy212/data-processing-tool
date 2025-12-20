// CalendarActionPayload.ts
import { CalendarEvent } from "@/app/calendar/CalendarEvent";
import { AllStatus } from "@/app/state/stores/DetailsListStore";
import { BaseData } from '@/app/models/data/Data';

// Define possible actions for the CalendarManager
type CalendarActionType =
  | 'ADD_EVENT'
  | 'UPDATE_EVENT'
  | 'REMOVE_EVENT'
  | 'SET_EVENT_STATUS';

// Define the payloads for different actions
interface AddEventPayload<T extends  BaseData<any>,  K extends T = T,  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>> {
  event: CalendarEvent<T, K>;
}

interface UpdateEventPayload<T extends  BaseData<any>,  K extends T = T,  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>> {
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
type CalendarActionPayload<T extends  BaseData<any>,  K extends T = T,  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>> =
  | AddEventPayload<T, K>
  | UpdateEventPayload<T, K>
  | RemoveEventPayload
  | SetEventStatusPayload;


export type {
    AddEventPayload, CalendarActionPayload, CalendarActionType, RemoveEventPayload, SetEventStatusPayload, UpdateEventPayload
};

