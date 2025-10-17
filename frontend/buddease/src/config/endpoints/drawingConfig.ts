// drawingConfig.ts
import { DrawingEndpoints } from '@/app/typings/categories/DrawingEndpoints';
import { BASE_URL } from '@/app/api/baseUrl';

export const drawingConfig: DrawingEndpoints = {
  fetch: { path: `${BASE_URL}/drawing/fetch`, method: "GET" },
  fetchById: { path: `${BASE_URL}/drawing/fetch`, method: "GET" },
  create: { path: `${BASE_URL}/drawing/create`, method: "POST" },
  update: { path: `${BASE_URL}/drawing/update`, method: "PUT" },
  save: { path: `${BASE_URL}/drawing/save`, method: "POST" },
  delete: { path: `${BASE_URL}/drawing/delete`, method: "DELETE" },
};