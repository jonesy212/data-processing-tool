userRolesConfig.ts
import { BASE_URL } from '@/core/api/baseUrl';
import { UserRolesEndpoints } from '@/core/typings/categories/UserRolesEndpoints';

export const userRolesConfig: UserRolesEndpoints = {
  list: { path: `${BASE_URL}/api/user-roles`, method: "GET" },
  single: (roleId: number) => ({ path: `${BASE_URL}/api/user-roles/${roleId}`, method: "GET" }),
  add: { path: `${BASE_URL}/api/user-roles`, method: "POST" },
  remove: (roleId: number) => ({ path: `${BASE_URL}/api/user-roles/${roleId}`, method: "DELETE" }),
  update: (roleId: number) => ({ path: `${BASE_URL}/api/user-roles/${roleId}`, method: "PUT" }),
};