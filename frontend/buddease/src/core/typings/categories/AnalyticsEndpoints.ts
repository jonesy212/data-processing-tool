// AnalyticsEndpoints.ts
import { EndpointCategoryConfig, EndpointConfig } from '@/core/config/EndpointConfig';

export interface AnalyticsEndpoints extends EndpointCategoryConfig {
  dashboard: EndpointConfig;
  reports: EndpointConfig;
  metrics: (metricId: string) => EndpointConfig;
  userActivity: (userId: string, timeframe: string) => EndpointConfig;
}

