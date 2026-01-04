DatabaseEndpoints.ts
import { EndpointCategoryConfig, EndpointConfig } from '@/core/config/EndpointConfig';

export interface DatabaseEndpoints extends EndpointCategoryConfig {
  backend: EndpointConfig;
  frontend: EndpointConfig;
}