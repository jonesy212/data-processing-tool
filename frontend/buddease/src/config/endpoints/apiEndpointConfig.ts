// apiEndpointConfig.ts
import { ApiConfigEndpoints } from '../types/categories/ApiConfigEndpoints';
import { BASE_URL } from './baseUrl';

export const apiEndpointConfig: ApiConfigEndpoints = {
  getUserApiConfig: { path: `${BASE_URL}/api/user/api-config`, method: "GET" },
  updateUserApiConfig: { path: `${BASE_URL}/api/user/api-config`, method: "PUT" },
  aquaConfig: { path: `${BASE_URL}/api/aqua-config`, method: "GET" },
};