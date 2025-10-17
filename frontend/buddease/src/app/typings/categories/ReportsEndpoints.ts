// ReportsEndpoints.ts
import { EndpointConfig } from '@/config/EndpointConfig';

export interface ReportsEndpoints {
  list: EndpointConfig;
  generate: EndpointConfig;
  download: (reportId: string) => EndpointConfig;
  delete: (reportId: string) => EndpointConfig;
}