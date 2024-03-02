// apiActions.ts
import { createAction } from "@reduxjs/toolkit";
import { ApiConfig } from "../configs/ConfigurationService";

export const ApiActions = {
  // Standard actions
  fetchApiConfigRequest: createAction("fetchApiConfigRequest"),
  fetchApiConfigSuccess: createAction<{ apiConfig: ApiConfig[] }>("fetchApiConfigSuccess"),
  fetchApiConfigFailure: createAction<{ error: string }>("fetchApiConfigFailure"),

  updateApiConfigRequest: createAction<{ id: number, newConfig: ApiConfig }>("updateApiConfigRequest"),
  updateApiConfigSuccess: createAction<{ apiConfig: ApiConfig }>("updateApiConfigSuccess"),
  updateApiConfigFailure: createAction<{ error: string }>("updateApiConfigFailure"),

  removeApiConfigRequest: createAction<number>("removeApiConfigRequest"),
  removeApiConfigSuccess: createAction<number>("removeApiConfigSuccess"),
  removeApiConfigFailure: createAction<{ error: string }>("removeApiConfigFailure"),

  // Missing actions
  fetchApiDataRequest: createAction("fetchApiDataRequest"),
  fetchApiDataSuccess: createAction<{ data: any }>("fetchApiDataSuccess"), // Adjust 'any' to the actual data type
  fetchApiDataFailure: createAction<{ error: unknown }>("fetchApiDataFailure"),

  // Batch actions for fetching
  batchFetchApiDataRequest: createAction("batchFetchApiDataRequest"),
  batchFetchApiDataSuccess: createAction<{ data: any[] }>("batchFetchApiDataSuccess"), // Adjust 'any' to the actual data type
  batchFetchApiDataFailure: createAction<{ error: string }>("batchFetchApiDataFailure"),

  // Batch actions for updating
  batchUpdateApiConfigRequest: createAction<{ ids: number[], newConfigs: ApiConfig[] }>("batchUpdateApiConfigRequest"),
  batchUpdateApiConfigSuccess: createAction<{ apiConfigs: ApiConfig[] }>("batchUpdateApiConfigSuccess"),
  batchUpdateApiConfigFailure: createAction<{ error: string }>("batchUpdateApiConfigFailure"),

  // Batch actions for removing
  batchRemoveApiConfigRequest: createAction<number[]>("batchRemoveApiConfigRequest"),
  batchRemoveApiConfigSuccess: createAction<number[]>("batchRemoveApiConfigSuccess"),
  batchRemoveApiConfigFailure: createAction<{ error: string }>("batchRemoveApiConfigFailure"),

  // Add more actions as needed
};
