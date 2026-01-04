TasksEndpoints.ts
import { EndpointCategoryConfig, EndpointConfig } from '@/core/config/EndpointConfig';


export interface TasksEndpoints extends EndpointCategoryConfig {
  list: EndpointConfig;
  single: (taskId: number) => EndpointConfig;
  add: EndpointConfig;
  remove: (taskId: number) => EndpointConfig;
  update: (taskId: number) => EndpointConfig;
  completeAll: EndpointConfig;
  toggle: (taskId: number) => EndpointConfig;
  removeMultiple: EndpointConfig;
  toggleMultiple: EndpointConfig;
  assign: (taskId: number, teamId: number) => EndpointConfig;
  unassign: (taskId: number) => EndpointConfig;
  initializeUserData: EndpointConfig;
  handleQuestionnaireSubmit: EndpointConfig;
  bulkAssign: EndpointConfig;
  bulkUnassign: EndpointConfig;
  filter: (status: string, dueDate: string, assignedUser: string) => EndpointConfig;
  setFilterOptions: EndpointConfig;
  clearFilter: EndpointConfig;
  applyFilter: EndpointConfig;
  updateFilterOptions: EndpointConfig;
  getFilterOptions: EndpointConfig;
  saveFilterOptions: EndpointConfig;
  deleteFilterOptions: EndpointConfig;
  getFilteredData: EndpointConfig;
  addFilterCriteria: EndpointConfig;
  removeFilterCriteria: EndpointConfig;
  setSortOptions: EndpointConfig;
  applySort: EndpointConfig;
  updateSortOptions: EndpointConfig;
  getSortOptions: EndpointConfig;
  saveSortOptions: EndpointConfig;
  deleteSortOptions: EndpointConfig;
  getFilteredAndSortedData: EndpointConfig;
  resetFilterAndSort: EndpointConfig;
  applyPagination: EndpointConfig;
  updatePaginationOptions: EndpointConfig;
  markInProgress: (taskId: number) => EndpointConfig;
}