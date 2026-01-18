// CommentsEndpoints.ts
import type { EndpointCategoryConfig, EndpointConfig } from '@/core/config/EndpointConfig';

export interface CommentsEndpoints extends EndpointCategoryConfig {
  list: EndpointConfig;
  single: (commentId: number) => EndpointConfig;
}
