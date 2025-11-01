// WebEndpoints.ts
import { EndpointCategoryConfig, EndpointConfig } from '@/app/config/EndpointConfig';

export interface WebEndpoints extends EndpointCategoryConfig {
  send: EndpointConfig;
  get: EndpointConfig;
  update: EndpointConfig;
  delete: EndpointConfig;
}