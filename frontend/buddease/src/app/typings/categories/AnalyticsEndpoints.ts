// AnalyticsEndpoints.ts
import { EndpointConfig } from '@/config/EndpointConfig';

export interface AnalyticsEndpoints {
  dashboard: EndpointConfig;
  reports: EndpointConfig;
  metrics: (metricId: string) => EndpointConfig;
  userActivity: (userId: string, timeframe: string) => EndpointConfig;
}

