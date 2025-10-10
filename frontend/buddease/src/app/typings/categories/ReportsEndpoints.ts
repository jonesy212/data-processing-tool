// ReportsEndpoints.ts
import { EndpointConfig } from '../EndpointConfigurations';

export interface ReportsEndpoints {
  list: EndpointConfig;
  generate: EndpointConfig;
  download: (reportId: string) => EndpointConfig;
  delete: (reportId: string) => EndpointConfig;
}