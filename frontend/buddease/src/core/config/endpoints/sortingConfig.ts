// sortingConfig.ts
import type { SortingEndpoints } from '@/core/typings/categories/SortingEndpoints';

export const sortingConfig: SortingEndpoints = {
  sortEvents: { path: "/api/sorting/events", method: "POST" },
  sortMessages: { path: "/api/sorting/messages", method: "POST" },
  snapshots: { path: "/api/sorting/snapshots", method: "POST" },
};