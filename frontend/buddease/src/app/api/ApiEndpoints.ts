// apiEndpoints.ts
const BASE_URL = 'https://your-api-base-url';

export const endpoints = {
  tasks: {
    list: `${BASE_URL}/api/tasks`,
    single: (taskId: number) => `${BASE_URL}/api/tasks/${taskId}`,
    add: `${BASE_URL}/api/tasks`,
    remove: (taskId: number) => `${BASE_URL}/api/tasks/${taskId}`,
    update: (taskId: number) => `${BASE_URL}/api/tasks/${taskId}`,
    completeAll: `${BASE_URL}/api/tasks/complete-all`,
    toggle: (taskId: number) => `${BASE_URL}/api/tasks/${taskId}/toggle`,
    removeMultiple: `${BASE_URL}/api/tasks/remove-multiple`,
    toggleMultiple: `${BASE_URL}/api/tasks/toggle-multiple`,
  },
  todos: {
    // Define todo endpoints here
  },
  calendar: {
    events: `${BASE_URL}/api/calendar/events`,
    singleEvent: (eventId: string) => `${BASE_URL}/api/calendar/events/${eventId}`,
    completeAllEvents: `${BASE_URL}/api/calendar/events/complete-all`,
    reassignEvent: (eventId: string) => `${BASE_URL}/api/calendar/events/${eventId}/reassign`,
  },
  users: {
    // Define users endpoints here
  },
  projectManagement: {

  },


  // Add more sections as needed
};
