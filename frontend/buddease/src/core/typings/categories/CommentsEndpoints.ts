// CommentsEndpoints.ts
import { EndpointCategoryConfig, EndpointConfig } from '@/core/config/EndpointConfig';

export interface CommentsEndpoints extends EndpointCategoryConfig {
  list: EndpointConfig;
  single: (commentId: number) => EndpointConfig;
}
