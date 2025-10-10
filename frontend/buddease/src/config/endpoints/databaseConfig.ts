// databaseConfig.ts
import { DatabaseEndpoints } from '../types/categories/DatabaseEndpoints';
import { BASE_URL } from './baseUrl';

export const databaseConfig: DatabaseEndpoints = {
  backend: { path: `${BASE_URL}/api/user/backend`, method: "GET" },
  frontend: { path: `${BASE_URL}/api/user/frontend`, method: "GET" },
};