// databaseConfig.ts
import { BASE_URL } from '@/app/api/baseUrl';
import { DatabaseEndpoints } from '@/app/typings/categories/DatabaseEndpoints';

export const databaseConfig: DatabaseEndpoints = {
  backend: { path: `${BASE_URL}/api/user/backend`, method: "GET" },
  frontend: { path: `${BASE_URL}/api/user/frontend`, method: "GET" },
};