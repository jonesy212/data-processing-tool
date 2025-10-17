// DrawingEndpoints.ts
import { EndpointConfig } from '@/config/EndpointConfig';

export interface DrawingEndpoints {
  fetch: EndpointConfig;
  fetchById: EndpointConfig;
  create: EndpointConfig;
  update: EndpointConfig;
  save: EndpointConfig;
  delete: EndpointConfig;
}