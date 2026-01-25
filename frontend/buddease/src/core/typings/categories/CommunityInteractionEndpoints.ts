// CommunityInteractionEndpoints.ts
import type { EndpointCategoryConfig, EndpointConfig } from '@/core/config/EndpointConfig';

export interface CommunityInteractionEndpoints extends EndpointCategoryConfig {
  createPost: EndpointConfig;
  getPosts: EndpointConfig;
  getPostDetails: (postId: string) => EndpointConfig;
  updatePost: (postId: string) => EndpointConfig;
  deletePost: (postId: string) => EndpointConfig;
}