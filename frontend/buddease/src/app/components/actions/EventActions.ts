// EventActions.ts
import { createAction } from "@reduxjs/toolkit";

export const EventActions = {

  userLoggedIn: createAction<any>('userLoggedIn'),
  userLoggedOut: createAction<any>('userLoggedOut'),
  notificationReceived: createAction<any>('notificationReceived'),
  checkAuthentication: createAction('checkAuthentication'), // New action for checking authentication
// Events related to data processing
  dataProcessingRequested: createAction("dataProcessingRequested"),
  dataProcessingSucceeded: createAction("dataProcessingSucceeded"),
  dataProcessingFailed: createAction<{ error: string }>("dataProcessingFailed"),


  fetchEvents: createAction('fetchEvents'),
  analyzeEvents: createAction<any>('analyzeEvents'),
  // Events related to data management
  dataFetchingRequested: createAction("dataFetchingRequested"),
  dataFetchingSucceeded: createAction<{ data: any[] }>("dataFetchingSucceeded"),
  dataFetchingFailed: createAction<{ error: string }>("dataFetchingFailed"),

  dataAddingRequested: createAction("dataAddingRequested"),
  dataRemovingRequested: createAction("dataRemovingRequested"),
  dataUpdatingRequested: createAction("dataUpdatingRequested"),
  dataTitleUpdatingRequested: createAction("dataTitleUpdatingRequested"),
  dataProcessingForAnalysisRequested: createAction("dataProcessingForAnalysisRequested"),

  // Batch events for fetching, updating, and removing data
  batchDataFetchingRequested: createAction("batchDataFetchingRequested"),
  batchDataUpdatingRequested: createAction("batchDataUpdatingRequested"),
  batchDataRemovingRequested: createAction("batchDataRemovingRequested"),

  // Additional events similar to TaskSlice
  dataDescriptionUpdatingRequested: createAction("dataDescriptionUpdatingRequested"),
  dataStatusUpdatingRequested: createAction("dataStatusUpdatingRequested"),
  dataDetailsUpdatingRequested: createAction("dataDetailsUpdatingRequested"),

  dataVersionsUpdatingRequested: createAction("dataVersionsUpdatingRequested"),

  // Bulk data actions
  bulkDataUpdatingRequested: createAction("bulkDataUpdatingRequested"),
  bulkDataRemovingRequested: createAction("bulkDataRemovingRequested"),
};
