// newsConfig.ts
import { NewsEndpoints } from '@/app/typings/categories/NewsEndpoints';

export const newsConfig: NewsEndpoints = {
  list: { path: "/news", method: "GET" },
  single: (newsId: number) => ({ path: `/news/${newsId}`, method: "GET" }),
  add: { path: "/news", method: "POST" },
  update: (newsId: number) => ({ path: `/news/${newsId}`, method: "PUT" }),
  remove: (newsId: number) => ({ path: `/news/${newsId}`, method: "DELETE" }),
  search: { path: "/news/search", method: "POST" },
  publish: (newsId: number) => ({ path: `/news/${newsId}/publish`, method: "PUT" }),
  unpublish: (newsId: number) => ({ path: `/news/${newsId}/unpublish`, method: "PUT" }),
};