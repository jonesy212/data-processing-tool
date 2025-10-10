// usersConfig.ts
import { UsersEndpoints } from '../types/categories/UsersEndpoints';
import { BASE_URL } from './baseUrl';

export const usersConfig: UsersEndpoints = {
  list: { path: "/users", method: "GET" },
  single: (userId: number) => ({ path: `/users/${userId}`, method: "GET" }),
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
};