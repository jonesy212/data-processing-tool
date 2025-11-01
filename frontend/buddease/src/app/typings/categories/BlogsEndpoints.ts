// BlogsEndpoints.ts
import { EndpointCategoryConfig, EndpointConfig } from '@/app/config/EndpointConfig';

export interface BlogsEndpoints extends EndpointCategoryConfig {
  list: EndpointConfig;
  single: (blogId: string) => EndpointConfig;
  add: EndpointConfig;
  remove: (blogId: string) => EndpointConfig;
  update: (blogId: string) => EndpointConfig;
}