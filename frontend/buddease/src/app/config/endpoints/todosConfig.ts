// todosConfig.ts
import { BASE_URL } from '@/app/api/baseUrl';
import { TodosEndpoints } from '@/app/typings/categories/TodosEndpoints';

export const todosConfig: TodosEndpoints = {
  // EndpointConfig objects (not strings)
  create: { path: `${BASE_URL}/api/todos/create`, method: "POST" },
  list: { path: `${BASE_URL}/api/todos`, method: "GET" },
  
  // Functions returning EndpointConfig
  single: (todoId: number) => ({ 
    path: `${BASE_URL}/api/todos/${todoId}`, 
    method: "GET" 
  }),
  
  add: { path: `${BASE_URL}/api/todos/add`, method: "POST" },
  
  remove: (todoId: number) => ({ 
    path: `${BASE_URL}/api/todos/${todoId}/remove`, 
    method: "DELETE" 
  }),
  
  process: { path: `${BASE_URL}/api/todos/process`, method: "POST" },
  
  update: (todoId: number) => ({ 
    path: `${BASE_URL}/api/todos/${todoId}/update`, 
    method: "PUT" 
  }),
  
  delete: (todo: number) => ({  // Note: parameter name should match interface (todoId)
    path: `${BASE_URL}/api/todos/${todo}/delete`, 
    method: "DELETE" 
  }),
  
  complete: (todoId: number) => ({ 
    path: `${BASE_URL}/api/todos/${todoId}/complete`, 
    method: "POST" 
  }),
  
  uncomplete: (todoId: number) => ({ 
    path: `${BASE_URL}/api/todos/${todoId}/uncomplete`, 
    method: "POST" 
  }),
  
  fetch: { path: `${BASE_URL}/api/todos`, method: "GET" },
  
  assign: (todoId: number, teamId: number) => ({ 
    path: `${BASE_URL}/api/todos/${todoId}/assign/${teamId}`, 
    method: "POST" 
  }),
  
  reassign: (todoId: number, newTeamId: number) => ({ 
    path: `${BASE_URL}/api/todos/${todoId}/reassign/${newTeamId}`, 
    method: "PUT" 
  }),
  
  unassign: (todoId: number) => ({ 
    path: `${BASE_URL}/api/todos/${todoId}/unassign`, 
    method: "DELETE" 
  }),
  
  toggle: (todoId: number, entityType: string) => ({ 
    path: `${BASE_URL}/api/toggle/${entityType}/${todoId}`, 
    method: "POST" 
  }),
  
  search: { path: `${BASE_URL}/api/todos/search`, method: "GET" },
  
  bulkAssign: { path: `${BASE_URL}/api/todos/bulk-assign`, method: "POST" },
  
  bulkUnassign: { path: `${BASE_URL}/api/todos/bulk-unassign`, method: "POST" },
  
  removeMultiple: { path: `${BASE_URL}/api/todos/removeMultiple`, method: "POST" },
  
  toggleMultiple: { path: `${BASE_URL}/api/todos/toggleMultiple`, method: "POST" },
};