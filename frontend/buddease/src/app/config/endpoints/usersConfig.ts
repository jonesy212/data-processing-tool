// usersConfig.ts
import { UsersEndpoints } from '@/app/typings/categories/UsersEndpoints';

export const usersConfig: UsersEndpoints = {
  list: { 
    path: "/users", 
    method: "GET", 
    cacheable: true,
    requiresAuth: true 
  },
  
  single: (userId: number) => ({ 
    path: `/users/${userId}`, 
    method: "GET", 
    cacheable: true,
    requiresAuth: true 
  }),

  add: { path: "/users", method: "POST" },
  remove: (userId: number) => ({ path: `/users/${userId}`, method: "DELETE" }),
  update: (userId: number) => ({ path: `/users/${userId}`, method: "PUT" }),
  updateList: { path: "/users/update-list", method: "POST" },
  search: { path: "/users/search", method: "POST" },
  updateRole: (userId: number) => ({ path: `/users/${userId}/update-role`, method: "PUT" }),
  updateRoles: (userIds: number[]) => ({ 
    path: `/users/${userIds.join(",")}/update-roles`, 
    method: "PUT" 
  }),
  
  singleByUsername: (username: string) => ({ 
    path: `/users/username/${username}`, 
    method: "GET",
    requiresAuth: true 
  }),

  assignRole: (userId: number) => ({ 
    path: `/users/${userId}/assign-role`, 
    method: "POST" 
  }),
  
  bulkUpdateRoles: { 
    path: "/users/bulk-update-roles", 
    method: "PUT",
    requiresAuth: true,
    timeout: 10000 // 10 seconds timeout
  },
  
  assignProjectOwner: (userId: number, projectId: string) => ({ 
    path: `/users/${userId}/projects/${projectId}/assign-owner`, 
    method: "POST",
    requiresAuth: true,
    retryable: true,
    retryAttempts: 3
  }),
};