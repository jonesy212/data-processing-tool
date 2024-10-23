// data/DataActions.ts
import { UnifiedMetaDataOptions } from "@/app/configs/database/MetaDataOptions";
import { createAction, PayloadAction } from "@reduxjs/toolkit";
import { Data } from "../../models/data/Data";
import { StatusType } from "../../models/data/StatusType";
import { Snapshot } from "../../snapshots/LocalStorageSnapshotStore";
import { DataProcessing, DataProcessingResult } from "./DataProcessing/DataProcessingService";

export const DataActions = <T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T>() => ({  // Actions for data processing
   
   updateDataFrame: createAction<{ id: string; frame: any }>('data/updateDataFrame'),
   deleteDataFrame: createAction<{ id: string }>('data/deleteDataFrame'),
   updateDataTitle: createAction<{ id: string; title: string }>('data/updateDataTitle'),
   removeData: createAction<{ id: string }>('data/removeData'),
   fetchDataFrame: createAction<{ id: string }>('data/fetchDataFrame'),
   setDataFrame: createAction<{ id: string; frame: any }>('data/setDataFrame'),
   loadDataAndProcessRequest: createAction<T>("loadDataAndProcessRequest"),
   loadDataAndProcessSuccess: createAction<DataProcessingResult>("loadDataAndProcessSuccess"),
   loadDataAndProcessFailure: createAction<{ error: string }>("loadDataAndProcessFailure"),
 
   // Actions for data management
   fetchDataRequest: createAction("fetchDataRequest"),
   fetchDataSuccess: createAction<{ data: T[] }>("fetchDataSuccess"),
   fetchDataFailure: createAction<{ error: string }>("fetchDataFailure"),
 
   addData: createAction<Snapshot<T, Meta, K>>("addData"),
   addDataSuccess: createAction<{ data: T }>("addDataSuccess"),
   addDataFailure: createAction<{ error: string }>("addDataFailure"),
   updateData: createAction<{id: number, newData: Snapshot<T, Meta, K>}>("updateData"),
   
   updateDataTitleSuccess: createAction<{ id: number; title: string }>("updateDataTitleSuccess"),
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