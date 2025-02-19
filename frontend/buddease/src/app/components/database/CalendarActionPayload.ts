// CalendarActionPayload.ts
import { BaseData } from '@/app/components/models/data/Data';
import { StructuredMetadata } from "@/app/configs/StructuredMetadata";
import { CalendarEvent } from "../calendar/CalendarEvent";
import { AllStatus } from "../state/stores/DetailsListStore";

// Define possible actions for the CalendarManager
type CalendarActionType =
  | 'ADD_EVENT'
  | 'UPDATE_EVENT'
  | 'REMOVE_EVENT'
  | 'SET_EVENT_STATUS';

// Define the payloads for different actions
interface AddEventPayload<T extends  BaseData<any>,  K extends T = T,  Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>> {
  event: CalendarEvent<T, K>;
}

interface UpdateEventPayload<T extends  BaseData<any>,  K extends T = T,  Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>> {
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
type CalendarActionPayload<T extends  BaseData<any>,  K extends T = T,  Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>> =
  | AddEventPayload<T, K>
  | UpdateEventPayload<T, K>
  | RemoveEventPayload
  | SetEventStatusPayload;


export type {
    AddEventPayload, CalendarActionPayload, CalendarActionType, RemoveEventPayload, SetEventStatusPayload, UpdateEventPayload
};

