// RealtimeEndpoints.ts

export interface RealtimeEndpoints {
  // Core CRUD
  list: { path: string; method: "GET" };
  single: (realtimeId: number) => { path: string; method: "GET" };
  add: { path: string; method: "POST" };
  remove: (realtimeId: number) => { path: string; method: "DELETE" };
  update: (realtimeId: number) => { path: string; method: "PUT" };
  updateList: { path: string; method: "POST" };
  search: { path: string; method: "POST" };
  
  // Role management
  updateRole: (realtimeId: number) => { path: string; method: "PUT" };
  updateRoles: (realtimeIds: number[]) => { path: string; method: "POST"; body: number[] };
  
  // Fetch / creation
  fetch: { path: string; method: "GET" };
  create: { path: string; method: "POST" };
  delete: (realtimeId: number) => { path: string; method: "DELETE" };
  fetchById: (realtimeId: number) => { path: string; method: "GET" };
  
  // Realtime operations
  connect: { path: string; method: "POST" | "GET" };
  disconnect: { path: string; method: "POST" };
  sendMessage: { path: string; method: "POST" };
  fetchMessages: { path: string; method: "GET" };
}
