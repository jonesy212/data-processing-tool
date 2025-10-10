// HighlightsEndpoints.ts
import { EndpointConfig } from '../EndpointConfigurations';

export interface HighlightsEndpoints {
  list: EndpointConfig;
  add: EndpointConfig;
  getSpecific: EndpointConfig;
  update: EndpointConfig;
  delete: EndpointConfig;
  backend: EndpointConfig;
  frontend: EndpointConfig;
}