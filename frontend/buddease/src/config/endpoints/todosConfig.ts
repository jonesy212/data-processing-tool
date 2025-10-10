// todosConfig.ts
import { TodosEndpoints } from '../types/categories/TodosEndpoints';
import { BASE_URL } from './baseUrl';

export const todosConfig: TodosEndpoints = {
  create: `${BASE_URL}/api/todos/create`,
  list: { path: "/api/todos", method: "GET" },
  single: (todoId: number) => `${BASE_URL}/api/todos/${todoId}`,
  add: { path: "/api/todos/add", method: "POST" },
  remove: (todoId: number) => `${BASE_URL}/api/todos/${todoId}/remove`,
  process: { path: "/api/todos/process", method: "POST" },
  update: (todoId: number) => `${BASE_URL}/api/todos/${todoId}/update`,
  delete: (todoId: number) => `${BASE_URL}/api/todos/${todoId}/delete`,
  complete: (todoId: number) => `${BASE_URL}/api/todos/${todoId}/complete`,
  uncomplete: (todoId: number) => `${BASE_URL}/api/todos/${todoId}/uncomplete`,
  fetch: `${BASE_URL}/api/todos`,
  assign: (todoId: number, teamId: number) => `${BASE_URL}/api/todos/${todoId}/assign/${teamId}`,
  reassign: (todoId: number, newTeamId: number) => `${BASE_URL}/api/todos/${todoId}/reassign/${newTeamId}`,
  unassign: (todoId: number) => `${BASE_URL}/api/todos/${todoId}/unassign`,
  toggle: (entityId: number, entityType: string) => `${BASE_URL}/api/toggle/${entityType}/${entityId}`,
  search: `${BASE_URL}/api/todos/search`,
  bulkAssign: `${BASE_URL}/api/todos/bulk-assign`,
  bulkUnassign: `${BASE_URL}/api/todos/bulk-unassign`,
  removeMultiple: { path: "/api/todos/removeMultiple", method: "POST" },
  toggleMultiple: { path: "/api/todos/toggleMultiple", method: "POST" },
};