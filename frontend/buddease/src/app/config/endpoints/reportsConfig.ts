// reportsConfig.ts
import { BASE_URL } from '@/app/api/baseUrl';
import { ReportsEndpoints } from '@/app/typings/categories/ReportsEndpoints';

export const reportsConfig: ReportsEndpoints = {
  list: { path: `${BASE_URL}/api/reports`, method: "GET" },
  generate: { path: `${BASE_URL}/api/reports/generate`, method: "POST" },
  download: (reportId: string) => ({ path: `${BASE_URL}/api/reports/${reportId}/download`, method: "GET" }),
  delete: (reportId: string) => ({ path: `${BASE_URL}/api/reports/${reportId}`, method: "DELETE" }),
};