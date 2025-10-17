// NewsEndpoints.ts
import { EndpointConfig } from '@/config/EndpointConfig';

export interface NewsEndpoints {
  list: EndpointConfig;
  single: (newsId: number) => EndpointConfig;
  add: EndpointConfig;
  update: (newsId: number) => EndpointConfig;
  remove: (newsId: number) => EndpointConfig;
  search: EndpointConfig;
  publish: (newsId: number) => EndpointConfig;
  unpublish: (newsId: number) => EndpointConfig;
}