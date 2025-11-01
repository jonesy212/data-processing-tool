// SortingEndpoints.ts
import { EndpointCategoryConfig, EndpointConfig } from '@/app/config/EndpointConfig';

export interface SortingEndpoints extends EndpointCategoryConfig {
  sortEvents: EndpointConfig;
  sortMessages: EndpointConfig;
  snapshots: EndpointConfig;
}