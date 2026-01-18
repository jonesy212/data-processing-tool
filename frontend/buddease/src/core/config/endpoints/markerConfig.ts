// markerConfig.ts
import { BASE_URL } from '@/core/api/baseUrl';
import { MarkerEndpoints } from '@/core/typings/categories/MarkerEndpoints';

export const markerConfig: MarkerEndpoints = {
  list: { path: `${BASE_URL}/api/markers`, method: "GET" },
  fetchMarkers: { path: "/api/markers", method: "GET" },
  addMarker: { path: "/api/markers/add", method: "POST" },
  removeMarker: (markerId: number) => ({ path: `/api/markers/${markerId}/remove`, method: "DELETE" }),
};