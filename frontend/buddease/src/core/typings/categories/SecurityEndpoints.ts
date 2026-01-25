// SecurityEndpoints.ts
import type { EndpointCategoryConfig, EndpointConfig } from '@/core/config/EndpointConfig';

export interface SecurityEndpoints extends EndpointCategoryConfig {
  fetchEvents: EndpointConfig;
}