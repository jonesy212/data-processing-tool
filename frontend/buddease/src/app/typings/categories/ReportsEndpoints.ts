// ReportsEndpoints.ts
import { EndpointCategoryConfig, EndpointConfig } from '@/app/config/EndpointConfig';

export interface ReportsEndpoints extends EndpointCategoryConfig {
  list: EndpointConfig;
  generate: EndpointConfig;
  download: (reportId: string) => EndpointConfig;
  delete: (reportId: string) => EndpointConfig;
}