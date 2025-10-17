// CommentsEndpoints.ts
import { EndpointConfig } from '@/config/EndpointConfig';

export interface CommentsEndpoints {
  list: EndpointConfig;
  single: (commentId: number) => EndpointConfig;
}
