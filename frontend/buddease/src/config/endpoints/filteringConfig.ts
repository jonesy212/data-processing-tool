// filteringConfig.ts
import { FilteringEndpoints } from '@/app/typings/categories/FilteringEndpoints';

export const filteringConfig: FilteringEndpoints = {
  filterTasks: { path: "/api/filtering/tasks", method: "POST" },
};