// RandomWalkEndpoints.ts
import { EndpointConfig } from '@/config/EndpointConfig';

export interface RandomWalkEndpoints {
  list: EndpointConfig;
  single: (walkId: string) => EndpointConfig;
  add: EndpointConfig;
  remove: (walkId: string) => EndpointConfig;
  update: (walkId: string) => EndpointConfig;
}