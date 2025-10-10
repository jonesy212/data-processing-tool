// CommunityInteractionEndpoints.ts
import { EndpointConfig } from '../EndpointConfigurations';

export interface CommunityInteractionEndpoints {
  createPost: EndpointConfig;
  getPosts: EndpointConfig;
  getPostDetails: (postId: string) => EndpointConfig;
  updatePost: (postId: string) => EndpointConfig;
  deletePost: (postId: string) => EndpointConfig;
}