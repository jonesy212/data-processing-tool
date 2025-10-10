// communityInteractionConfig.ts
import { CommunityInteractionEndpoints } from '../types/categories/CommunityInteractionEndpoints';
import { BASE_URL } from './baseUrl';

export const communityInteractionConfig: CommunityInteractionEndpoints = {
  createPost: { path: `${BASE_URL}/api/community-interaction/create-post`, method: "POST" },
  getPosts: { path: `${BASE_URL}/api/community-interaction/posts`, method: "GET" },
  getPostDetails: (postId: string) => ({ path: `${BASE_URL}/api/community-interaction/posts/${postId}`, method: "GET" }),
  updatePost: (postId: string) => ({ path: `${BASE_URL}/api/community-interaction/posts/${postId}`, method: "PUT" }),
  deletePost: (postId: string) => ({ path: `${BASE_URL}/api/community-interaction/posts/${postId}`, method: "DELETE" }),
};