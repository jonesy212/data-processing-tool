// securityConfig.ts
import { SecurityEndpoints } from '../types/categories/SecurityEndpoints';
import { BASE_URL } from './baseUrl';

export const securityConfig: SecurityEndpoints = {
  fetchEvents: { path: `${BASE_URL}/api/security/events`, method: "GET" },
};