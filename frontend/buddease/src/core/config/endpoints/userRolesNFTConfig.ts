// userRolesNFTConfig.ts
import { BASE_URL } from '@/core/api/baseUrl';
import { UserRolesNFTEndpoints } from '@/core/typings/categories/UserRolesNFTEndpoints';

export const userRolesNFTConfig: UserRolesNFTEndpoints = {
  list: { path: `${BASE_URL}/api/user-roles-nft`, method: "GET" },
  single: (roleId: number) => ({ path: `${BASE_URL}/api/user-roles-nft/${roleId}`, method: "GET" }),
  add: { path: `${BASE_URL}/api/user-roles-nft`, method: "POST" },
  remove: (roleId: number) => ({ path: `${BASE_URL}/api/user-roles-nft/${roleId}`, method: "DELETE" }),
  update: (roleId: number) => ({ path: `${BASE_URL}/api/user-roles-nft/${roleId}`, method: "PUT" }),
};