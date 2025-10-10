// devConfig.ts
import { DevEndpoints } from '../types/categories/DevEndpoints';
import { BASE_URL } from './baseUrl';

export const devConfig: DevEndpoints = {
  getMockData: { path: `${BASE_URL}/mock/data`, method: "GET" },
  generateMockResponse: { path: `${BASE_URL}/mock/generate`, method: "POST" },
  list: { path: `${BASE_URL}/api/dev/mocks`, method: "GET" },
  create: { path: `${BASE_URL}/api/dev/mocks`, method: "POST" },
  delete: { path: `${BASE_URL}/api/dev/mocks/delete`, method: "DELETE" },
  update: { path: `${BASE_URL}/api/dev/mocks/update`, method: "PUT" },
};