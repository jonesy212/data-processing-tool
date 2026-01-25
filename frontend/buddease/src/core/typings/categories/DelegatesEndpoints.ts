// DelegatesEndpoints.ts
import type { EndpointCategoryConfig, EndpointConfig } from '@/core/config/EndpointConfig';

export interface DelegatesEndpoints extends EndpointCategoryConfig {
  list: EndpointConfig;
  single: (delegateId: number) => EndpointConfig;
  add: EndpointConfig;
  remove: (delegateId: number) => EndpointConfig;
  update: (delegateId: number) => EndpointConfig;
  updateList: EndpointConfig;
  search: EndpointConfig;
  updateRole: (delegateId: number) => EndpointConfig;
  updateRoles: (delegateIds: number[]) => EndpointConfig;
  fetch: EndpointConfig;
  create: EndpointConfig;
  delete: (delegateId: number) => EndpointConfig;
  fetchById: (delegateId: number) => EndpointConfig;
}