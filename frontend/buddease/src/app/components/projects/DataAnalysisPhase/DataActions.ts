// data/DataActions.ts
import { createAction, PayloadAction } from "@reduxjs/toolkit";
import { Data } from "../../models/data/Data";
import { DataProcessing, DataProcessingResult } from "./DataProcessing/DataProcessingService";

export const DataActions = {
   // Actions for data processing
   loadDataAndProcessRequest: createAction<Data>("loadDataAndProcessRequest"),
   loadDataAndProcessSuccess: createAction<DataProcessingResult>("loadDataAndProcessSuccess"),
   loadDataAndProcessFailure: createAction<{ error: string }>("loadDataAndProcessFailure"),
 
   // Actions for data management
   fetchDataRequest: createAction("fetchDataRequest"),
   fetchDataSuccess: createAction<{ data: Data[] }>("fetchDataSuccess"),
   fetchDataFailure: createAction<{ error: string }>("fetchDataFailure"),
 
   addData: createAction<Data>("addData"),
   removeData: createAction<number>("removeData"),
   fetchDataFrame: createAction<number>("fetchDataFrame"),
   setDataFrame: createAction<Data>("setDataFrame"),
   updateData: createAction<{ id: number; newData: Data }>("updateData"),
   updateDataTitleSuccess: createAction<{ id: number; title: string }>("updateDataTitleSuccess"),
   updateDataTitle: createAction<{ id: number; title: string }>("updateDataTitle"),
   updateDataFrame: createAction<{ id: number; newDataFrame: Data }>("updateDataFrame"),
   deleteDataFrame: createAction<number>("deleteDataFrame"),
 
   processDataForAnalysis: createAction<DataProcessing>("processDataForAnaysis"),
   processDataForAnalysisSuccess: createAction<DataProcessingResult>("processDataForAnalysisSuccess"),
   processDataForAnalysisFailure: createAction<{ error: string }>("processDataForAnalysisFailure"),
   // Batch actions for fetching, updating, and removing
   batchFetchDataRequest: createAction("batchFetchDataRequest"),
   batchFetchDataSuccess: createAction<{ data: Data[] }>("batchFetchDataSuccess"),
   batchFetchDataFailure: createAction<{ error: string }>("batchFetchDataFailure"),
 
   batchUpdateDataRequest: createAction<{ ids: number[]; newDatas: Data[] }>("batchUpdateDataRequest"),
   batchUpdateDataSuccess: createAction<{ data: Data[] }>("batchUpdateDataSuccess"),
   batchUpdateDataFailure: createAction<{ error: string }>("batchUpdateDataFailure"),
 
   batchRemoveDataRequest: createAction<number[]>("batchRemoveDataRequest"),
   batchRemoveDataSuccess: createAction<number[]>("batchRemoveDataSuccess"),
   batchRemoveDataFailure: createAction<{ error: string }>("batchRemoveDataFailure"),
 
   // Additional actions similar to TaskSlice
   updateDataDescription: createAction<PayloadAction<string>>("updateDataDescription"),
   updateDataStatus: createAction<PayloadAction<"pending" | "inProgress" | "completed">>("updateDataStatus"),
   updateDataDetails: createAction<PayloadAction<Data>>("updateDataDetails"),
 
   // Bulk Data Actions
   bulkUpdateData: createAction<any[]>("data/bulkUpdateData"),
   bulkRemoveData: createAction<string[]>("data/bulkRemoveData")
};
