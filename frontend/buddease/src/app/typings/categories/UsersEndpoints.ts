// UsersEndpoints.ts
import { EndpointConfig } from '../EndpointConfigurations';

export interface UsersEndpoints {
  list: EndpointConfig;
  single: (userId: number) => EndpointConfig;
  add: EndpointConfig;
  remove: (userId: number) => EndpointConfig;
  update: (userId: number) => EndpointConfig;
  updateList: EndpointConfig;
  search: EndpointConfig;
  updateRole: (userId: number) => EndpointConfig;
  updateRoles: (userIds: number[]) => EndpointConfig;
}