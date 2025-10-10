// randomWalkConfig.ts
import { RandomWalkEndpoints } from '../types/categories/RandomWalkEndpoints';
import { BASE_URL } from './baseUrl';

export const randomWalkConfig: RandomWalkEndpoints = {
  list: { path: `${BASE_URL}/api/random-walks`, method: "GET" },
  single: (walkId: string) => ({ path: `${BASE_URL}/api/random-walks/${walkId}`, method: "GET" }),
  add: { path: `${BASE_URL}/api/random-walks`, method: "POST" },
  remove: (walkId: string) => ({ path: `${BASE_URL}/api/random-walks/${walkId}`, method: "DELETE" }),
  update: (walkId: string) => ({ path: `${BASE_URL}/api/random-walks/${walkId}`, method: "PUT" }),
};