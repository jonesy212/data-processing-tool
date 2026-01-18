// SortingEndpoints.ts
import type { EndpointCategoryConfig, EndpointConfig } from '@/core/config/EndpointConfig';

export interface SortingEndpoints extends EndpointCategoryConfig {
  sortEvents: EndpointConfig;
  sortMessages: EndpointConfig;
  snapshots: EndpointConfig;
}