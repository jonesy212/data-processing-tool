// DevEndpoints.ts
import { EndpointCategoryConfig, EndpointConfig } from '@/app/config/EndpointConfig';

export interface DevEndpoints extends EndpointCategoryConfig {
  getMockData: EndpointConfig;
  generateMockResponse: EndpointConfig;
  list: EndpointConfig;
  create: EndpointConfig;
  delete: EndpointConfig;
  update: EndpointConfig;
}