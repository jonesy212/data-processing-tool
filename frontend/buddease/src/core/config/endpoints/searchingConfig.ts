// searchingConfig.ts
import type { SearchingEndpoints } from '@/core/typings/categories/SearchingEndpoints';

export const searchingConfig: SearchingEndpoints = {
  searchMessages: { path: "/api/searching/messages", method: "POST" },
  searchDelegates: { path: "/api/searching/delegates", method: "POST" },
  searchTasks: { path: "/api/searching/tasks", method: "POST" },
  searchContent: { path: "/api/searching/content", method: "POST" },
  searchData: { path: "/api/searching/data", method: "POST" },
  searchHighlights: { path: "/api/searching/highlights", method: "POST" },
  searchTodos: { path: "/api/searching/todos", method: "POST" },
};