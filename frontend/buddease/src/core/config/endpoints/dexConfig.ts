// dexConfig.ts
import { BASE_URL } from '@/core/api/baseUrl';
import type { DexEndpoints } from '@/core/typings/categories/DexEndpoints';

export const dexConfig: DexEndpoints = {
  list: { path: `${BASE_URL}/api/dex`, method: "GET" },
  single: (dexId: string) => ({ path: `${BASE_URL}/api/dex/${dexId}`, method: "GET" }),
  add: { path: `${BASE_URL}/api/dex`, method: "POST" },
  remove: (dexId: string) => ({ path: `${BASE_URL}/api/dex/${dexId}`, method: "DELETE" }),
  update: (dexId: string) => ({ path: `${BASE_URL}/api/update/${dexId}`, method: "PUT" }),
};