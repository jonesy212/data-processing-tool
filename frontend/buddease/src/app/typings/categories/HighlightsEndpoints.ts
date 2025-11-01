// HighlightsEndpoints.ts
import { EndpointCategoryConfig, EndpointConfig } from '@/app/config/EndpointConfig';

export interface HighlightsEndpoints extends EndpointCategoryConfig {
  list: EndpointConfig;
  add: EndpointConfig;
  getSpecific: EndpointConfig;
  update: EndpointConfig;
  delete: EndpointConfig;
  backend: EndpointConfig;
  frontend: EndpointConfig;
}