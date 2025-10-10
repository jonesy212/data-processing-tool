// SortingEndpoints.ts
import { EndpointConfig } from '../EndpointConfigurations';

export interface SortingEndpoints {
  sortEvents: EndpointConfig;
  sortMessages: EndpointConfig;
  snapshots: EndpointConfig;
}