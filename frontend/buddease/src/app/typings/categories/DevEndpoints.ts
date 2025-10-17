// DevEndpoints.ts
import { EndpointConfig } from '@/config/EndpointConfigurations';

export interface DevEndpoints {
  getMockData: EndpointConfig;
  generateMockResponse: EndpointConfig;
  list: EndpointConfig;
  create: EndpointConfig;
  delete: EndpointConfig;
  update: EndpointConfig;
}