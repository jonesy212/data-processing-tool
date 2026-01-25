// databaseConfig.ts
import { BASE_URL } from '@/core/api/baseUrl';
import type { DatabaseEndpoints } from '@/core/typings/categories/DatabaseEndpoints';

export const databaseConfig: DatabaseEndpoints = {
  backend: { path: `${BASE_URL}/api/user/backend`, method: "GET" },
  frontend: { path: `${BASE_URL}/api/user/frontend`, method: "GET" },
};