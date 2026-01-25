// contentConfig.ts
import type { ContentEndpoints } from '@/core/typings/categories/ContentEndpoints';

export const contentConfig: ContentEndpoints = {
  fetchContent: { path: "/api/content/fetch", method: "GET" },
  createContent: { path: "/api/content/create", method: "POST" },
  updateContent: { path: "/api/content/update", method: "PUT" },
  deleteContent: { path: "/api/content/delete", method: "DELETE" },
  publishContent: { path: "/api/content/publish", method: "POST" },
  unpublishContent: { path: "/api/content/unpublish", method: "POST" },
  searchContent: { path: "/api/content/search", method: "POST" },
};