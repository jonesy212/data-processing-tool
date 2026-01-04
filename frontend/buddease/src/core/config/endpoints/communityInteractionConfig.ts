// communityInteractionConfig.ts
import { BASE_URL } from '@/core/api/baseUrl';
import type { CommunityInteractionEndpoints } from '@/core/typings/categories/CommunityInteractionEndpoints';

export const communityInteractionConfig: CommunityInteractionEndpoints = {
  createPost: { path: `${BASE_URL}/api/community-interaction/create-post`, method: "POST" },
  getPosts: { path: `${BASE_URL}/api/community-interaction/posts`, method: "GET" },
  getPostDetails: (postId: string) => ({ path: `${BASE_URL}/api/community-interaction/posts/${postId}`, method: "GET" }),
  updatePost: (postId: string) => ({ path: `${BASE_URL}/api/community-interaction/posts/${postId}`, method: "PUT" }),
  deletePost: (postId: string) => ({ path: `${BASE_URL}/api/community-interaction/posts/${postId}`, method: "DELETE" }),
};