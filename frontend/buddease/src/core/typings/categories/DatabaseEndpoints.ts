// DatabaseEndpoints.ts
import type { EndpointCategoryConfig, EndpointConfig } from '@/core/config/EndpointConfig';

export interface DatabaseEndpoints extends EndpointCategoryConfig {
  backend: EndpointConfig;
  frontend: EndpointConfig;
}