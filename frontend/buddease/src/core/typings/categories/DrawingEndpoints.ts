DrawingEndpoints.ts
import { EndpointCategoryConfig, EndpointConfig } from '@/core/config/EndpointConfig';

export interface DrawingEndpoints extends EndpointCategoryConfig {
  fetch: EndpointConfig;
  fetchById: EndpointConfig;
  create: EndpointConfig;
  update: EndpointConfig;
  save: EndpointConfig;
  delete: EndpointConfig;
}