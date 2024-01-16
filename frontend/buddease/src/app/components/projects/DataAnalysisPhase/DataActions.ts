// data/DataActions.ts
import { createAction, PayloadAction } from "@reduxjs/toolkit";
import { Data } from "../../models/data/Data";

export const DataActions = {
  fetchDataRequest: createAction("fetchDataRequest"),
  fetchDataSuccess: createAction<{ data: Data[] }>("fetchDataSuccess"),
  fetchDataFailure: createAction<{ error: string }>("fetchDataFailure"),

  addData: createAction<Data>("addData"),
  removeData: createAction<number>("removeData"),
  updateData: createAction<{ id: number, newData: Data }>("updateData"),
    updateDataTitleSuccess: createAction<{ id: number, title: string }>("updateDataTitleSuccess"),
  
  // Batch actions for fetching
  batchFetchDataRequest: createAction("batchFetchDataRequest"),
  batchFetchDataSuccess: createAction<{ data: Data[] }>("batchFetchDataSuccess"),
  batchFetchDataFailure: createAction<{ error: string }>("batchFetchDataFailure"),

  // Batch actions for updating
  batchUpdateDataRequest: createAction<{ ids: number[], newDatas: Data[] }>("batchUpdateDataRequest"),
  batchUpdateDataSuccess: createAction<{ data: Data[] }>("batchUpdateDataSuccess"),
  batchUpdateDataFailure: createAction<{ error: string }>("batchUpdateDataFailure"),

  // Batch actions for removing
  batchRemoveDataRequest: createAction<number[]>("batchRemoveDataRequest"),
  batchRemoveDataSuccess: createAction<number[]>("batchRemoveDataSuccess"),
  batchRemoveDataFailure: createAction<{ error: string }>("batchRemoveDataFailure"),

  // Additional actions similar to TaskSlice
  updateDataTitle: createAction<PayloadAction<string>>("updateDataTitle"),
  updateDataDescription: createAction<PayloadAction<string>>("updateDataDescription"),
};
