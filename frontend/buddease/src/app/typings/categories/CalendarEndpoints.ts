// CalendarEndpoints.ts
import { EndpointConfig } from '@/config/EndpointConfig';

export interface CalendarEndpoints {
  events: EndpointConfig;
  singleEvent: (eventId: string) => EndpointConfig;
  completeAllEvents: EndpointConfig;
  reassignEvent: (eventId: string) => EndpointConfig;
  updateEvent: (eventId: string) => EndpointConfig;
  removeEvent: (eventId: string) => EndpointConfig;
  search: EndpointConfig;
  eventDetails: (eventId: string) => EndpointConfig;
  setEventReminder: EndpointConfig;
  deleteEvent: (eventId: string) => EndpointConfig;
  filterEventsByCategory: EndpointConfig;
  searchEvents: EndpointConfig;
  exportCalendar: EndpointConfig;
  undoAction: EndpointConfig;
  redoAction: EndpointConfig;
  viewEventDetails: (eventId: string) => EndpointConfig;
  bulkEditEvents: EndpointConfig;
  createRecurringEvent: EndpointConfig;
  setCustomEventNotifications: EndpointConfig;
  addEventComment: EndpointConfig;
  attachEventFile: EndpointConfig;
  toggleShowTasks: EndpointConfig;
}