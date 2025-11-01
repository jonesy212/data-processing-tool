// CommentsEndpoints.ts
import { EndpointCategoryConfig, EndpointConfig } from '@/app/config/EndpointConfig';

export interface CommentsEndpoints extends EndpointCategoryConfig {
  list: EndpointConfig;
  single: (commentId: number) => EndpointConfig;
}
