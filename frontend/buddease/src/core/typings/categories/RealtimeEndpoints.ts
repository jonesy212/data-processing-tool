// RealtimeEndpoints.ts
import type { EndpointCategoryConfig, EndpointConfig } from '@/core/config/EndpointConfig';


// Update RealtimeEndpoints to match the pattern
export interface RealtimeEndpoints extends EndpointCategoryConfig {
  // Core CRUD
  list: EndpointConfig;
  single: (realtimeId: number) => EndpointConfig;
  add: EndpointConfig;
  remove: (realtimeId: number) => EndpointConfig;
  update: (realtimeId: number) => EndpointConfig;
  updateList: EndpointConfig;
  search: EndpointConfig;
  
  // Role management
  updateRole: (realtimeId: number) => EndpointConfig;
  updateRoles: (realtimeIds: number[]) => EndpointConfig;
  
  // Fetch / creation
  fetch: EndpointConfig;
  create: EndpointConfig;
  delete: (realtimeId: number) => EndpointConfig;
  fetchById: (realtimeId: number) => EndpointConfig;
  
  // Realtime operations
  connect: EndpointConfig;
  disconnect: EndpointConfig;
  sendMessage: EndpointConfig;
  fetchMessages: EndpointConfig;
}
