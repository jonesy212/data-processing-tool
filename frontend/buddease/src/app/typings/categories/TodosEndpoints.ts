// TodosEndpoints.ts
import { EndpointConfig } from '@/config/EndpointConfig';

export interface TodosEndpoints {
  create: string;
  list: EndpointConfig;
  single: (todoId: number) => string;
  add: EndpointConfig;
  remove: (todoId: number) => string;
  toggle: (todoId: number, entityType: string) => string;
  removeMultiple: EndpointConfig;
  toggleMultiple: EndpointConfig;
  update: (todoId: number) => string;
  delete: (todo: number) => string;
  process: EndpointConfig;
  complete: (todoId: number) => string;
  uncomplete: (todoId: number) => string;
  fetch: string;
  assign: (todoId: number, teamId: number) => string;
  reassign: (todoId: number, newTeamId: number) => string;
  unassign: (todoId: number) => string;
  search: string;
  bulkAssign: string;
  bulkUnassign: string;
}