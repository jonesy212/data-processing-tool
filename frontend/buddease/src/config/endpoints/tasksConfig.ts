// tasksConfig.ts
import { TasksEndpoints } from '../types/categories/TasksEndpoints';

export const tasksConfig: TasksEndpoints = {
  create: { path: "/api/tasks/create", method: "POST" },
  list: { path: "/api/tasks", method: "GET" },
  single: (taskId: number) => `/api/tasks/${taskId}`,
  add: { path: "/api/tasks/add", method: "POST" },
  remove: (taskId: number) => `/api/tasks/${taskId}/remove`,
  process: { path: "/api/tasks/process", method: "POST" },
  completeAll: { path: "/api/tasks/completeAll", method: "POST" },
  toggle: (taskId: number) => `/api/tasks/${taskId}/toggle`,
  removeMultiple: { path: "/api/tasks/removeMultiple", method: "POST" },
  toggleMultiple: { path: "/api/tasks/toggleMultiple", method: "POST" },
  markInProgress: (taskId: number) => `/api/tasks/${taskId}/markInProgress`,
  update: (taskId: number) => `/api/tasks/${taskId}/update`,
};