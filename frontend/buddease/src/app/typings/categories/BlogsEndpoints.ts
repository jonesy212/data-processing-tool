// BlogsEndpoints.ts
import { EndpointConfig } from '@/config/EndpointConfig';

export interface BlogsEndpoints {
  list: EndpointConfig;
  single: (blogId: string) => EndpointConfig;
  add: EndpointConfig;
  remove: (blogId: string) => EndpointConfig;
  update: (blogId: string) => EndpointConfig;
}