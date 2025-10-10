// filteringConfig.ts
import { FilteringEndpoints } from '../types/categories/FilteringEndpoints';

export const filteringConfig: FilteringEndpoints = {
  filterTasks: { path: "/api/filtering/tasks", method: "POST" },
};