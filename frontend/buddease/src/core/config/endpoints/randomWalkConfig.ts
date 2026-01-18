// randomWalkConfig.ts
import { BASE_URL } from '@/core/api/baseUrl';
import { RandomWalkEndpoints } from '@/core/typings/categories/RandomWalkEndpoints';

export const randomWalkConfig: RandomWalkEndpoints = {
  list: { path: `${BASE_URL}/api/random-walks`, method: "GET" },
  single: (walkId: string) => ({ path: `${BASE_URL}/api/random-walks/${walkId}`, method: "GET" }),
  add: { path: `${BASE_URL}/api/random-walks`, method: "POST" },
  remove: (walkId: string) => ({ path: `${BASE_URL}/api/random-walks/${walkId}`, method: "DELETE" }),
  update: (walkId: string) => ({ path: `${BASE_URL}/api/random-walks/${walkId}`, method: "PUT" }),
};