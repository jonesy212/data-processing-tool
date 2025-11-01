// apiEndpointConfig.ts
import { BASE_URL } from '@/app/api/baseUrl';
import { ApiConfigEndpoints } from '@/app/typings/categories/ApiConfigEndpoints';

export const apiEndpointConfig: ApiConfigEndpoints = {
  getUserApiConfig: { path: `${BASE_URL}/api/user/api-config`, method: "GET" },
  updateUserApiConfig: { path: `${BASE_URL}/api/user/api-config`, method: "PUT" },
  aquaConfig: { path: `${BASE_URL}/api/aqua-config`, method: "GET" },
};