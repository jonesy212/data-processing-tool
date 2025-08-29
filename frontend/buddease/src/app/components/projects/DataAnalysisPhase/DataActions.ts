// data/DataActions.ts
import { Snapshot } from "@/app/components/snapshots";
import { createAction, PayloadAction } from "@reduxjs/toolkit";
import { StatusType } from "../../models/data/StatusType";
import { DataProcessing, DataProcessingResult } from "./DataProcessing/DataProcessingService";

/**
 * Factory function that creates a set of strongly-typed Redux actions for data management.
 * 
 * @template T - The base data type, must extend BaseData<any>
 * @template K - The extended data type (defaults to T)
 * 
 * @returns {object} An object containing action creators for data operations with proper type safety
 * 
 * @example
 * // Create actions for specific data type
 * const UserActions = DataActions<UserData>();
 * 
 * // Dispatch actions with type safety
 * dispatch(UserActions.addData(userSnapshot));
 * dispatch(UserActions.fetchDataSuccess({ data: userList }));
 */

export const DataActions = <T extends YourDataType = YourDataType>() => ({
   
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
 
   addData: createAction<Snapshot<T, K>>("addData"),
   addDataSuccess: createAction<{ data: T }>("addDataSuccess"),
   addDataFailure: createAction<{ error: string }>("addDataFailure"),
   updateData: createAction<{id: number, newData: Snapshot<T, K>}>("updateData"),
   
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