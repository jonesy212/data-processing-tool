// blogsConfig.ts
import { BASE_URL } from '@/app/api/baseUrl';
import { BlogsEndpoints } from '@/app/typings/categories/BlogsEndpoints';

export const blogsConfig: BlogsEndpoints = {
  list: { path: `${BASE_URL}/blogs`, method: "GET" },
  single: (blogId: string) => ({ path: `${BASE_URL}/blogs/${blogId}`, method: "GET" }),
  add: { path: `${BASE_URL}/blogs`, method: "POST" },
  remove: (blogId: string) => ({ path: `${BASE_URL}/blogs/${blogId}`, method: "DELETE" }),
  update: (blogId: string) => ({ path: `${BASE_URL}/blogs/${blogId}`, method: "PUT" }),
};