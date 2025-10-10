// blogsConfig.ts
import { BlogsEndpoints } from '../types/categories/BlogsEndpoints';
import { BASE_URL } from './baseUrl';

export const blogsConfig: BlogsEndpoints = {
  list: { path: `${BASE_URL}/blogs`, method: "GET" },
  single: (blogId: string) => ({ path: `${BASE_URL}/blogs/${blogId}`, method: "GET" }),
  add: { path: `${BASE_URL}/blogs`, method: "POST" },
  remove: (blogId: string) => ({ path: `${BASE_URL}/blogs/${blogId}`, method: "DELETE" }),
  update: (blogId: string) => ({ path: `${BASE_URL}/blogs/${blogId}`, method: "PUT" }),
};