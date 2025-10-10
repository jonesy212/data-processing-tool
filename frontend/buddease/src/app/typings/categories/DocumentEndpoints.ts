// DocumentEndpoints.ts
import { EndpointConfig } from '../EndpointConfigurations';

export interface DocumentEndpoints {
  list: EndpointConfig;
  single: (documentId: string) => EndpointConfig;
  add: EndpointConfig;
  remove: (documentId: string) => EndpointConfig;
  update: (documentId: string) => EndpointConfig;
}