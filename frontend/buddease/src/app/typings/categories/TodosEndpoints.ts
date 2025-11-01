// TodosEndpoints.ts
import { EndpointCategoryConfig, EndpointConfig } from '@/app/config/EndpointConfig';

export interface TodosEndpoints extends EndpointCategoryConfig {
  create: EndpointConfig;
  list: EndpointConfig;
  single: (todoId: number) => EndpointConfig;
  add: EndpointConfig;
  remove: (todoId: number) => EndpointConfig;
  toggle: (todoId: number, entityType: string) => EndpointConfig;
  removeMultiple: EndpointConfig;
  toggleMultiple: EndpointConfig;
  update: (todoId: number) => EndpointConfig;
  delete: (todo: number) => EndpointConfig;
  process: EndpointConfig;
  complete: (todoId: number) => EndpointConfig;
  uncomplete: (todoId: number) => EndpointConfig;
  fetch: EndpointConfig;
  assign: (todoId: number, teamId: number) => EndpointConfig;
  reassign: (todoId: number, newTeamId: number) => EndpointConfig;
  unassign: (todoId: number) => EndpointConfig;
  search: EndpointConfig;
  bulkAssign: EndpointConfig;
  bulkUnassign: EndpointConfig;
}