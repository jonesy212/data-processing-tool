reportsConfig.ts
import { BASE_URL } from '@/core/api/baseUrl';
import { ReportsEndpoints } from '@/core/typings/categories/ReportsEndpoints';

export const reportsConfig: ReportsEndpoints = {
  list: { path: `${BASE_URL}/api/reports`, method: "GET" },
  generate: { path: `${BASE_URL}/api/reports/generate`, method: "POST" },
  download: (reportId: string) => ({ path: `${BASE_URL}/api/reports/${reportId}/download`, method: "GET" }),
  delete: (reportId: string) => ({ path: `${BASE_URL}/api/reports/${reportId}`, method: "DELETE" }),
};