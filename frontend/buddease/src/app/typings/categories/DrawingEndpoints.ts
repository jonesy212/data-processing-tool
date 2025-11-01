// DrawingEndpoints.ts
import { EndpointCategoryConfig, EndpointConfig } from '@/app/config/EndpointConfig';

export interface DrawingEndpoints extends EndpointCategoryConfig {
  fetch: EndpointConfig;
  fetchById: EndpointConfig;
  create: EndpointConfig;
  update: EndpointConfig;
  save: EndpointConfig;
  delete: EndpointConfig;
}