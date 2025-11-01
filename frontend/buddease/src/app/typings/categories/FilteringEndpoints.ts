// FilteringEndpoints.ts
import { EndpointCategoryConfig, EndpointConfig } from '@/app/config/EndpointConfig';

export interface FilteringEndpoints extends EndpointCategoryConfig {
  filterTasks: EndpointConfig;
}