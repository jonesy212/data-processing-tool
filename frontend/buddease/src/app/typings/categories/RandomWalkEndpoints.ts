// RandomWalkEndpoints.ts
import { EndpointConfig } from '../EndpointConfigurations';

export interface RandomWalkEndpoints {
  list: EndpointConfig;
  single: (walkId: string) => EndpointConfig;
  add: EndpointConfig;
  remove: (walkId: string) => EndpointConfig;
  update: (walkId: string) => EndpointConfig;
}