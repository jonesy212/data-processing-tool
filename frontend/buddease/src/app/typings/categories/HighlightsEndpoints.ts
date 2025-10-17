// HighlightsEndpoints.ts
import { EndpointConfig } from '@/config/EndpointConfig';

export interface HighlightsEndpoints {
  list: EndpointConfig;
  add: EndpointConfig;
  getSpecific: EndpointConfig;
  update: EndpointConfig;
  delete: EndpointConfig;
  backend: EndpointConfig;
  frontend: EndpointConfig;
}