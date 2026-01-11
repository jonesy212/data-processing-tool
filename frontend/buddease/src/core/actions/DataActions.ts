// DataActions.ts
// data/DataActions.ts
import type { SnapshotForActions } from '@/core/actions/AppActionTypes';
import type { AppSnapshot } from '@/core/typings/entities/AppEntity';
import { createSnapshot } from '@/core/snapshots/createSnapshot';
import { createAction, createAsyncThunk } from "@reduxjs/toolkit";


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


export const DataActions = () => ({
  addData: createAction<SnapshotForActions>("addData"),

  updateData: createAction<{
    id: number;
    newData: SnapshotForActions;
  }>("updateData"),

  updateDataVersions: createAction<{ id: number; versions: SnapshotForActions[] }>("updateDataVersions"),

  bulkUpdateData: createAction<SnapshotForActions[]>("data/bulkUpdateData"),
  bulkRemoveData: createAction<string[]>("data/bulkRemoveData"),

   loadDataAndProcessSuccess: createAction<{ result: DataProcessingResult }>("loadDataAndProcessSuccess"),
  loadDataAndProcessFailure: createAction<{ error: string }>("loadDataAndProcessFailure"),
  processDataForAnalysisSuccess: createAction<{ result: DataProcessingResult }>("processDataForAnalysisSuccess"),
  processDataForAnalysisFailure: createAction<{ error: string }>("processDataForAnalysisFailure"),

  // Async thunks
  createAndAddSnapshot: createAsyncThunk(
    'snapshot/createAndAddSnapshot',
    async (entity: AppSnapshot, thunkAPI) => {
      try {
        const baseSnapshot = await createSnapshot(
          entity,
          new Map(),
          'mock-snapshot-id',
          undefined,
          null,
          null,
          null,
          false,
          undefined,
          undefined
        );
        return baseSnapshot as SnapshotForActions;
      } catch (error) {
        return thunkAPI.rejectWithValue(error);
      }
    }
  ),
  
  // NEW: Async thunks for data processing
  loadDataAndProcess: createAsyncThunk(
    'data/loadDataAndProcess',
    async (data: DataProcessing, thunkAPI) => {
      try {
        // This would call your actual API
        const response = await axios.post(
          `${API_BASE_URL}`,
          data
        );
        return response.data as DataProcessingResult;
      } catch (error) {
        return thunkAPI.rejectWithValue(error);
      }
    }
  ),
  
  processDataForAnalysis: createAsyncThunk(
    'data/processDataForAnalysis',
    async (data: DataProcessing, thunkAPI) => {
      try {
        const response = await axios.post(
          `${API_BASE_URL}/process`,
          data
        );
        return response.data as DataProcessingResult;
      } catch (error) {
        return thunkAPI.rejectWithValue(error);
      }
    }
  ),
});
