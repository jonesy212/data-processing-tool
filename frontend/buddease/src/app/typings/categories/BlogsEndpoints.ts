// BlogsEndpoints.ts
import { EndpointConfig } from '../EndpointConfigurations';

export interface BlogsEndpoints {
  list: EndpointConfig;
  single: (blogId: string) => EndpointConfig;
  add: EndpointConfig;
  remove: (blogId: string) => EndpointConfig;
  update: (blogId: string) => EndpointConfig;
}