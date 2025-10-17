// securityConfig.ts
import { BASE_URL } from '@/app/api/baseUrl';
import { SecurityEndpoints } from '@/app/typings/categories/SecurityEndpoints';

export const securityConfig: SecurityEndpoints = {
  fetchEvents: { path: `${BASE_URL}/api/security/events`, method: "GET" },
};