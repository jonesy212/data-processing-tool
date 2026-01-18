// RandomWalkEndpoints.ts
import type { EndpointCategoryConfig, EndpointConfig } from '@/core/config/EndpointConfig';

export interface RandomWalkEndpoints extends EndpointCategoryConfig {
  list: EndpointConfig;
  single: (walkId: string) => EndpointConfig;
  add: EndpointConfig;
  remove: (walkId: string) => EndpointConfig;
  update: (walkId: string) => EndpointConfig;
}