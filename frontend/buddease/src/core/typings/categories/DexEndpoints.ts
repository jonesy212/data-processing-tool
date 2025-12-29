// DexEndpoints.ts
import { EndpointCategoryConfig, EndpointConfig } from '@/core/config/EndpointConfig';

export interface DexEndpoints extends EndpointCategoryConfig {
  list: EndpointConfig;
  single: (dexId: string) => EndpointConfig;
  add: EndpointConfig;
  remove: (dexId: string) => EndpointConfig;
  update: (dexId: string) => EndpointConfig;
}