// dataProvidersConfig.ts
import { BASE_URL } from '@/app/api/baseUrl';
import { DataProvidersEndpoints } from '@/app/typings/categories/DataProvidersEndpoints';

export const dataProvidersConfig: DataProvidersEndpoints = {
  list: { path: `${BASE_URL}/api/data-providers`, method: "GET" },
  single: (providerId: string) => ({ path: `${BASE_URL}/api/data-providers/${providerId}`, method: "GET" }),
  create: { path: `${BASE_URL}/api/data-providers/create`, method: "POST" },
  update: (providerId: string) => ({ path: `${BASE_URL}/api/data-providers/update/${providerId}`, method: "PUT" }),
  delete: (providerId: string) => ({ path: `${BASE_URL}/api/data-providers/delete/${providerId}`, method: "DELETE" }),
  getMany: { path: `${BASE_URL}/api/data-providers/getBatchDataProviders`, method: "GET" },
  createMany: { path: `${BASE_URL}/api/data-providers/createBatchDataProviders`, method: "POST" },
  updateMany: { path: `${BASE_URL}/api/data-providers/updateBatchDataProviders`, method: "PUT" },
  deleteMany: { path: `${BASE_URL}/api/data-providers/deleteBatchDataProviders`, method: "DELETE" },
};