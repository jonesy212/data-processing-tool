// WebEndpoints.ts
import { EndpointConfig } from '@/config/EndpointConfig';

export interface WebEndpoints {
  send: EndpointConfig;
  get: EndpointConfig;
  update: EndpointConfig;
  delete: EndpointConfig;
}