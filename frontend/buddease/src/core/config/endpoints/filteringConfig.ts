// filteringConfig.ts
import { FilteringEndpoints } from '@/core/typings/categories/FilteringEndpoints';

export const filteringConfig: FilteringEndpoints = {
  filterTasks: { path: "/api/filtering/tasks", method: "POST" },
};