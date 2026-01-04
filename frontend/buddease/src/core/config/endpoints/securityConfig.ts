securityConfig.ts
import { BASE_URL } from '@/core/api/baseUrl';
import { SecurityEndpoints } from '@/core/typings/categories/SecurityEndpoints';

export const securityConfig: SecurityEndpoints = {
  fetchEvents: { path: `${BASE_URL}/api/security/events`, method: "GET" },
};