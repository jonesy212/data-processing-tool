import { SortingEndpoints } from '@/app/typings/categories/SortingEndpoints';

export const sortingConfig: SortingEndpoints = {
  sortEvents: { path: "/api/sorting/events", method: "POST" },
  sortMessages: { path: "/api/sorting/messages", method: "POST" },
  snapshots: { path: "/api/sorting/snapshots", method: "POST" },
};