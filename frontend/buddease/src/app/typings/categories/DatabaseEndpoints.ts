// DatabaseEndpoints.ts
import { EndpointCategoryConfig, EndpointConfig } from '@/app/config/EndpointConfig';

export interface DatabaseEndpoints extends EndpointCategoryConfig {
  backend: EndpointConfig;
  frontend: EndpointConfig;
}