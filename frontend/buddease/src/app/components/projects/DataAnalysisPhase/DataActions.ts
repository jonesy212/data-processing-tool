// data/DataActions.ts
import { createAction, PayloadAction } from "@reduxjs/toolkit";
import { Data } from "../../models/data/Data";
import { DataProcessing, DataProcessingResult } from "./DataProcessing/DataProcessingService";
import { StatusType } from "../../models/data/StatusType";
import { Snapshot } from "../../snapshots/LocalStorageSnapshotStore";
import { CustomSnapshotData } from "../../snapshots/SnapshotData";
export const DataActions = <T extends Data, K extends Data>() => ({  // Actions for data processing
   loadDataAndProcessRequest: createAction<T>("loadDataAndProcessRequest"),
   loadDataAndProcessSuccess: createAction<DataProcessingResult>("loadDataAndProcessSuccess"),
   loadDataAndProcessFailure: createAction<{ error: string }>("loadDataAndProcessFailure"),
 
   // Actions for data management
   fetchDataRequest: createAction("fetchDataRequest"),
   fetchDataSuccess: createAction<{ data: T[] }>("fetchDataSuccess"),
   fetchDataFailure: createAction<{ error: string }>("fetchDataFailure"),
 
   addData: createAction<T>("addData"),
   addDataSuccess: createAction<{ data: T }>("addDataSuccess"),
   addDataFailure: createAction<{ error: string }>("addDataFailure"),
   updateData: createAction<{id: number, newData: Snapshot<T, K>}>("updateData"),
   removeData: createAction<number>("removeData"),
   fetchDataFrame: createAction<number>("fetchDataFrame"),
   setDataFrame: createAction<T>("setDataFrame"),
    updateDataTitleSuccess: createAction<{ id: number; title: string }>("updateDataTitleSuccess"),
   updateDataTitle: createAction<{ id: number; title: string }>("updateDataTitle"),
   updateDataFrame: createAction<{ id: number; newDataFrame: T }>("updateDataFrame"),
   deleteDataFrame: createAction<number>("deleteDataFrame"),
 
   processDataForAnalysis: createAction<DataProcessing>("processDataForAnaysis"),
   processDataForAnalysisSuccess: createAction<DataProcessingResult>("processDataForAnalysisSuccess"),
   processDataForAnalysisFailure: createAction<{ error: string }>("processDataForAnalysisFailure"),
   
   // Batch actions for fetching, updating, and removing
   batchFetchDataRequest: createAction("batchFetchDataRequest"),
   batchFetchDataSuccess: createAction<{ data: T[] }>("batchFetchDataSuccess"),
   batchFetchDataFailure: createAction<{ error: string }>("batchFetchDataFailure"),
 
   batchUpdateDataRequest: createAction<{ ids: number[]; newDatas: T[] }>("batchUpdateDataRequest"),
   batchUpdateDataSuccess: createAction<{ data: T[] }>("batchUpdateDataSuccess"),
   batchUpdateDataFailure: createAction<{ error: string }>("batchUpdateDataFailure"),
 
   batchRemoveDataRequest: createAction<number[]>("batchRemoveDataRequest"),
   batchRemoveDataSuccess: createAction<number[]>("batchRemoveDataSuccess"),
   batchRemoveDataFailure: createAction<{ error: string }>("batchRemoveDataFailure"),
 
   // Additional actions similar to TaskSlice
   updateDataDescription: createAction<PayloadAction<string>>("updateDataDescription"),
   updateDataStatus: createAction<PayloadAction<StatusType | undefined>>("updateDataStatus"),
   updateDataDetails: createAction<PayloadAction<T>>("updateDataDetails"),
 
   updateDataVersions: createAction<PayloadAction<{ id: number, versions: T[] }>>("updateDataVersions"),
   
   // Bulk Data Actions
   bulkUpdateData: createAction<any[]>("data/bulkUpdateData"),
   bulkRemoveData: createAction<string[]>("data/bulkRemoveData")
});