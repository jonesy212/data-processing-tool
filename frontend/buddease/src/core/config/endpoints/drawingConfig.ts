drawingConfig.ts
import { BASE_URL } from '@/core/api/baseUrl';
import { DrawingEndpoints } from '@/core/typings/categories/DrawingEndpoints';

export const drawingConfig: DrawingEndpoints = {
  fetch: { path: `${BASE_URL}/drawing/fetch`, method: "GET" },
  fetchById: { path: `${BASE_URL}/drawing/fetch`, method: "GET" },
  create: { path: `${BASE_URL}/drawing/create`, method: "POST" },
  update: { path: `${BASE_URL}/drawing/update`, method: "PUT" },
  save: { path: `${BASE_URL}/drawing/save`, method: "POST" },
  delete: { path: `${BASE_URL}/drawing/delete`, method: "DELETE" },
};