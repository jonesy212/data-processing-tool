// realtimeConfig.ts
import { BASE_URL } from '@/core/api/baseUrl';
import { RealtimeEndpoints } from '@/core/typings/categories/RealtimeEndpoints';

export const realtimeConfig: RealtimeEndpoints = {
  list: { path: `${BASE_URL}/api/realtime`, method: "GET" },
  single: (realtimeId: number) => ({ path: `${BASE_URL}/api/realtime/${realtimeId}`, method: "GET" }),
  add: { path: `${BASE_URL}/api/realtime`, method: "POST" },
  remove: (realtimeId: number) => ({ path: `${BASE_URL}/api/realtime/${realtimeId}`, method: "DELETE" }),
  update: (realtimeId: number) => ({ path: `${BASE_URL}/api/realtime/${realtimeId}`, method: "PUT" }),
  updateList: { path: `${BASE_URL}/api/realtime/bulk`, method: "POST" },
  search: { path: `${BASE_URL}/api/realtime/search`, method: "POST" },
  
  updateRole: (realtimeId: number) => ({ path: `${BASE_URL}/api/realtime/${realtimeId}/role`, method: "PUT" }),
  updateRoles: (realtimeIds: number[]) => ({ 
    path: `${BASE_URL}/api/realtime/bulk/roles`, 
    method: "POST",
    body: realtimeIds 
  }),
  
  fetch: { path: `${BASE_URL}/api/realtime`, method: "GET" },
  create: { path: `${BASE_URL}/api/realtime`, method: "POST" },
  delete: (realtimeId: number) => ({ path: `${BASE_URL}/api/realtime/${realtimeId}`, method: "DELETE" }),
  fetchById: (realtimeId: number) => ({ path: `${BASE_URL}/api/realtime/${realtimeId}`, method: "GET" }),
  
  connect: { path: `${BASE_URL}/api/realtime/connect`, method: "POST" },
  disconnect: { path: `${BASE_URL}/api/realtime/disconnect`, method: "POST" },
  sendMessage: { path: `${BASE_URL}/api/realtime/message`, method: "POST" },
  fetchMessages: { path: `${BASE_URL}/api/realtime/messages`, method: "GET" },
};




