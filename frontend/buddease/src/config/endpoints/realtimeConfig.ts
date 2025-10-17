// realtimeConfig.ts
import { RealtimeEndpoints } from '@/app/types/categories/RealtimeEndpoints';

export const realtimeConfig: RealtimeEndpoints = {
  // Core CRUD
  list: { path: "/api/realtime", method: "GET" },
  single: (realtimeId: number) => ({ path: `/api/realtime/${realtimeId}`, method: "GET" }),
  add: { path: "/api/realtime/add", method: "POST" },
  remove: (realtimeId: number) => ({ path: `/api/realtime/${realtimeId}/remove`, method: "DELETE" }),
  update: (realtimeId: number) => ({ path: `/api/realtime/${realtimeId}/update`, method: "PUT" }),
  updateList: { path: "/api/realtime/updateList", method: "POST" },
  search: { path: "/api/realtime/search", method: "POST" },

  // Role management
  updateRole: (realtimeId: number) => ({ path: `/api/realtime/${realtimeId}/updateRole`, method: "PUT" }),
  updateRoles: (realtimeIds: number[]) => ({ path: "/api/realtime/updateRoles", method: "POST", body: realtimeIds }),

  // Fetching / creation
  fetch: { path: "/api/realtime/fetch", method: "GET" },
  create: { path: "/api/realtime/create", method: "POST" },
  delete: (realtimeId: number) => ({ path: `/api/realtime/${realtimeId}/delete`, method: "DELETE" }),
  fetchById: (realtimeId: number) => ({ path: `/api/realtime/${realtimeId}/fetchById`, method: "GET" }),

  // New endpoints for realtime operations
  connect: { path: "/api/realtime/connect", method: "POST" },
  disconnect: { path: "/api/realtime/disconnect", method: "POST" },
  sendMessage: { path: "/api/realtime/sendMessage", method: "POST" },
  fetchMessages: { path: "/api/realtime/fetchMessages", method: "GET" },
};
