// NewsEndpoints.ts
import type { EndpointCategoryConfig, EndpointConfig } from '@/core/config/EndpointConfig';

export interface NewsEndpoints extends EndpointCategoryConfig {
  list: EndpointConfig;
  single: (newsId: number) => EndpointConfig;
  add: EndpointConfig;
  update: (newsId: number) => EndpointConfig;
  remove: (newsId: number) => EndpointConfig;
  search: EndpointConfig;
  publish: (newsId: number) => EndpointConfig;
  unpublish: (newsId: number) => EndpointConfig;
}