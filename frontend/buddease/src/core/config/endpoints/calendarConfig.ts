// calendarConfig.ts
import { BASE_URL } from '@/core/api/baseUrl';
import type { CalendarEndpoints } from '@/core/typings/categories/CalendarEndpoints';

export const calendarConfig: CalendarEndpoints = {
  events: { path: `${BASE_URL}/api/calendar/events`, method: "GET" },
  singleEvent: (eventId: string) => ({ path: `${BASE_URL}/api/calendar/events/${eventId}`, method: "GET" }),
  completeAllEvents: { path: `${BASE_URL}/api/calendar/events/complete-all`, method: "POST" },
  reassignEvent: (eventId: string) => ({ path: `${BASE_URL}/api/calendar/events/${eventId}/reassign`, method: "POST" }),
  updateEvent: (eventId: string) => ({ path: `${BASE_URL}/api/calendar/events/${eventId}`, method: "PUT" }),
  removeEvent: (eventId: string) => ({ path: `${BASE_URL}/api/calendar/events/${eventId}`, method: "DELETE" }),
  search: { path: `${BASE_URL}/api/calendar/events/search`, method: "POST" },
  eventDetails: (eventId: string) => ({ path: `${BASE_URL}/api/calendar/events/${eventId}/details`, method: "GET" }),
  setEventReminder: { path: `${BASE_URL}/api/calendar/events/set-reminder`, method: "POST" },
  deleteEvent: (eventId: string) => ({ path: `${BASE_URL}/api/calendar/events/${eventId}/delete`, method: "DELETE" }),
  filterEventsByCategory: { path: `${BASE_URL}/api/calendar/events/filter-by-category`, method: "POST" },
  searchEvents: { path: `${BASE_URL}/api/calendar/events/search`, method: "POST" },
  exportCalendar: { path: `${BASE_URL}/api/calendar/export`, method: "GET" },
  undoAction: { path: `${BASE_URL}/api/calendar/undo`, method: "POST" },
  redoAction: { path: `${BASE_URL}/api/calendar/redo`, method: "POST" },
  viewEventDetails: (eventId: string) => ({ path: `${BASE_URL}/api/calendar/events/${eventId}/details`, method: "GET" }),
  bulkEditEvents: { path: `${BASE_URL}/api/calendar/events/bulk-edit`, method: "POST" },
  createRecurringEvent: { path: `${BASE_URL}/api/calendar/events/create-recurring`, method: "POST" },
  setCustomEventNotifications: { path: `${BASE_URL}/api/calendar/events/set-custom-notifications`, method: "POST" },
  addEventComment: { path: `${BASE_URL}/api/calendar/events/add-comment`, method: "POST" },
  attachEventFile: { path: `${BASE_URL}/api/calendar/events/attach-file`, method: "POST" },
  toggleShowTasks: { path: `${BASE_URL}/api/calendar/toggle-show-tasks`, method: "POST" },
};