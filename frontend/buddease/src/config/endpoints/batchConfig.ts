// batchConfig.ts
import { BASE_URL } from '@/app/api/baseUrl';
import { BatchEndpoints } from '@/app/typings/categories/BatchEndpoints';

export const batchConfig: BatchEndpoints = {
  fetchVideos: { path: `${BASE_URL}/api/videos/batch`, method: "GET" },
  uploadVideos: { path: `${BASE_URL}/api/videos/batch/upload`, method: "POST" },
  addVideos: { path: `${BASE_URL}/api/videos/batch/add`, method: "POST" },
  removeVideos: { path: `${BASE_URL}/api/videos/batch/remove`, method: "DELETE" },
  updateVideos: { path: `${BASE_URL}/api/videos/batch/update`, method: "PUT" },
};