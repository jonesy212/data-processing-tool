// SecurityEndpoints.ts
import { EndpointCategoryConfig, EndpointConfig } from '@/core/config/EndpointConfig';

export interface SecurityEndpoints extends EndpointCategoryConfig {
  fetchEvents: EndpointConfig;
}