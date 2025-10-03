// FilterActions.tsx
import { Filter } from "@/app/pages/searchs/Filter";
import { createAction } from "@reduxjs/toolkit";

export const FilterActions = {
  // Standard actions
  addFilter: createAction<Filter>("addFilter"),
  removeFilter: createAction<number>("removeFilter"),
  updateFilter: createAction<{ filterId: number, filter: Filter, newName?: string }>("updateFilter"),
  validateFilter: createAction<Filter>("validateFilter"),
  createFilter: createAction<Filter>("createFilter"),
  fetchFiltersRequest: createAction("fetchFiltersRequest"),
  fetchFiltersByUserId: createAction<{
    userId: string,
    filters: string[],
  }>("fetchFiltersByUserId"),
  fetchFiltersSuccess: createAction<{ filters: Filter[] }>("fetchFiltersSuccess"),
  fetchFiltersFailure: createAction<{ error: string }>("fetchFiltersFailure"),
  
  // Additional actions for updating filters
  updateFilterSuccess: createAction<{ filter: Filter }>("updateFilterSuccess"),
  updateFiltersSuccess: createAction<{ filters: Filter[] }>("updateFiltersSuccess"),
  updateFilterFailure: createAction<{ error: string }>("updateFilterFailure"),
  
  // Additional actions for removing filters
  removeFilterSuccess: createAction<number>("removeFilterSuccess"),
  removeFiltersSuccess: createAction<{ filters: Filter[] }>("removeFiltersSuccess"),
  removeFilterFailure: createAction<{ error: string }>("removeFilterFailure"),

  selectFilteredEventsAction: createAction<string[]>("selectFilteredEvents"),
  // Other filter-related actions
  applyFilter: createAction<{ filterId: number }>("applyFilter"),
  clearFilter: createAction("clearFilter"),
  filterTasks: createAction<{
    userId: { operation: string; value: string | number };
    query: { operation: string; value: string | number }
  }>("filterTasks")
  // Add more actions as needed
};
