// CommentsEndpoints.ts
import { EndpointConfig } from '../EndpointConfigurations';

export interface CommentsEndpoints {
  list: EndpointConfig;
  single: (commentId: number) => EndpointConfig;
}
