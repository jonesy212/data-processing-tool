// UserRolesEndpoints.ts
import { EndpointConfig } from '@/config/EndpointConfig';

export interface UserRolesEndpoints {
  list: EndpointConfig;
  single: (roleId: number) => EndpointConfig;
  add: EndpointConfig;
  remove: (roleId: number) => EndpointConfig;
  update: (roleId: number) => EndpointConfig;
}