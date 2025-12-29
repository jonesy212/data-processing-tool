// UserRolesEndpoints.ts
import { EndpointCategoryConfig, EndpointConfig } from '@/core/config/EndpointConfig';

export interface UserRolesEndpoints extends EndpointCategoryConfig {
  list: EndpointConfig;
  single: (roleId: number) => EndpointConfig;
  add: EndpointConfig;
  remove: (roleId: number) => EndpointConfig;
  update: (roleId: number) => EndpointConfig;
}