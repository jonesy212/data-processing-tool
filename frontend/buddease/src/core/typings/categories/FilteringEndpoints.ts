FilteringEndpoints.ts
import { EndpointCategoryConfig, EndpointConfig } from '@/core/config/EndpointConfig';

export interface FilteringEndpoints extends EndpointCategoryConfig {
  filterTasks: EndpointConfig;
}