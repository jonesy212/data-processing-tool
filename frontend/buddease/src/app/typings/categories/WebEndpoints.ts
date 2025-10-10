// WebEndpoints.ts
import { EndpointConfig } from '../EndpointConfigurations';

export interface WebEndpoints {
  send: EndpointConfig;
  get: EndpointConfig;
  update: EndpointConfig;
  delete: EndpointConfig;
}