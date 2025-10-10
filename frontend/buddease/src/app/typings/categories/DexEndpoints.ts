// DexEndpoints.ts
import { EndpointConfig } from '../EndpointConfigurations';

export interface DexEndpoints {
  list: EndpointConfig;
  single: (dexId: string) => EndpointConfig;
  add: EndpointConfig;
  remove: (dexId: string) => EndpointConfig;
  update: (dexId: string) => EndpointConfig;
}