// DexEndpoints.ts
import { EndpointConfig } from '@/config/EndpointConfig';

export interface DexEndpoints {
  list: EndpointConfig;
  single: (dexId: string) => EndpointConfig;
  add: EndpointConfig;
  remove: (dexId: string) => EndpointConfig;
  update: (dexId: string) => EndpointConfig;
}