// userRolesConfig.ts
import { UserRolesEndpoints } from '../types/categories/UserRolesEndpoints';
import { BASE_URL } from './baseUrl';

export const userRolesConfig: UserRolesEndpoints = {
  list: { path: `${BASE_URL}/api/user-roles`, method: "GET" },
  single: (roleId: number) => ({ path: `${BASE_URL}/api/user-roles/${roleId}`, method: "GET" }),
  add: { path: `${BASE_URL}/api/user-roles`, method: "POST" },
  remove: (roleId: number) => ({ path: `${BASE_URL}/api/user-roles/${roleId}`, method: "DELETE" }),
  update: (roleId: number) => ({ path: `${BASE_URL}/api/user-roles/${roleId}`, method: "PUT" }),
};