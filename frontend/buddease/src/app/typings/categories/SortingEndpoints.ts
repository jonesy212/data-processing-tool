// SortingEndpoints.ts
import { EndpointConfig } from '@/config/EndpointConfig';

export interface SortingEndpoints {
  sortEvents: EndpointConfig;
  sortMessages: EndpointConfig;
  snapshots: EndpointConfig;
}