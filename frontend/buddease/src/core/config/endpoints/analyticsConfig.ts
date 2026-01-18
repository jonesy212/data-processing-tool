// analyticsConfig.ts
import { AnalyticsEndpoints } from '@/core/typings/categories/AnalyticsEndpoints';

export const analyticsConfig: AnalyticsEndpoints = {
  dashboard: { path: "/api/analytics/dashboard", method: "GET" },
  reports: { path: "/api/analytics/reports", method: "GET" },
  metrics: (metricId: string) => ({ path: `/api/analytics/metrics/${metricId}`, method: "GET" }),
  userActivity: (userId: string, timeframe: string) => ({ 
      path: `/api/analytics/users/${userId}/activity`, 
      method: "GET" 
    }),
};