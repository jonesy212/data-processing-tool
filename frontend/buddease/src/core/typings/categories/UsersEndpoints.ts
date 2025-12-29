// UsersEndpoints.ts
import { EndpointCategoryConfig, EndpointConfig } from '@/core/config/EndpointConfig';

export interface UsersEndpoints extends EndpointCategoryConfig {
  list: EndpointConfig;
  single: (userId: number) => EndpointConfig;
    singleByUsername: (username: string) => EndpointConfig; // Add this

  add: EndpointConfig;
  remove: (userId: number) => EndpointConfig;
  update: (userId: number) => EndpointConfig;
  updateList: EndpointConfig;
  search: EndpointConfig;
  updateRole: (userId: number) => EndpointConfig;
  updateRoles: (userIds: number[]) => EndpointConfig;
  assignRole: (userId: number) => EndpointConfig; // Add this
  bulkUpdateRoles: EndpointConfig; // Add this
  assignProjectOwner: (userId: number, projectId: string) => EndpointConfig; // Add this
}