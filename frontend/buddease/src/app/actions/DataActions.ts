// DataActions.ts
// data/DataActions.ts
import { SnapshotForActions } from '@/app/actions/AppActionTypes';
import { createSnapshot } from '@/app/snapshots/createSnapshot';
import { AppSnapshot } from '@/app/typings/entities/AppEntity';
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

  // If you still need async thunks
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
});
