// DevEndpoints.ts
import type { EndpointCategoryConfig, EndpointConfig } from '@/core/config/EndpointConfig';

export interface DevEndpoints extends EndpointCategoryConfig {
  getMockData: EndpointConfig;
  generateMockResponse: EndpointConfig;
  list: EndpointConfig;
  create: EndpointConfig;
  delete: EndpointConfig;
  update: EndpointConfig;
}