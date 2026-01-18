// FilteringEndpoints.ts
import type { EndpointCategoryConfig, EndpointConfig } from '@/core/config/EndpointConfig';

export interface FilteringEndpoints extends EndpointCategoryConfig {
  filterTasks: EndpointConfig;
}