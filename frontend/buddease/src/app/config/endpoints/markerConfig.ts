// markerConfig.ts
import { BASE_URL } from '@/app/api/baseUrl';
import { MarkerEndpoints } from '@/app/typings/categories/MarkerEndpoints';

export const markerConfig: MarkerEndpoints = {
  list: { path: `${BASE_URL}/api/markers`, method: "GET" },
  fetchMarkers: { path: "/api/markers", method: "GET" },
  addMarker: { path: "/api/markers/add", method: "POST" },
  removeMarker: (markerId: number) => ({ path: `/api/markers/${markerId}/remove`, method: "DELETE" }),
};