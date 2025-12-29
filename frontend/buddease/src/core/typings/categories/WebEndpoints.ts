// WebEndpoints.ts
import { EndpointCategoryConfig, EndpointConfig } from '@/core/config/EndpointConfig';

export interface WebEndpoints extends EndpointCategoryConfig {
  send: EndpointConfig;
  get: EndpointConfig;
  update: EndpointConfig;
  delete: EndpointConfig;
}