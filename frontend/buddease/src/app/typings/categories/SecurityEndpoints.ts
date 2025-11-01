// SecurityEndpoints.ts
import { EndpointCategoryConfig, EndpointConfig } from '@/app/config/EndpointConfig';

export interface SecurityEndpoints extends EndpointCategoryConfig {
  fetchEvents: EndpointConfig;
}