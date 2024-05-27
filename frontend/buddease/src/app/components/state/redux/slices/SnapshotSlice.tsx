// snapshots/SnapshotSlice.ts

import { User } from '@/app/components/users/User';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { WritableDraft } from '../ReducerGenerator';

interface Snapshot {
  id: string;
  data:  WritableDraft<{
    assignee: WritableDraft<User>; // Adjust this based on your actual types
    // other properties...
  }>;
  // Add other properties as needed
}

interface SnapshotState {
  snapshots: WritableDraft<Snapshot>[];
  loading: boolean;
  error: string | null;
}

const initialState: SnapshotState = {
    snapshots: {} as Snapshot[],
  loading: false,
  error: null,
};

const snapshotSlice = createSlice({
  name: 'snapshot',
  initialState,
  reducers: {
      addSnapshot: (state,
          
          action: PayloadAction<Snapshot>) => {
      state.snapshots.push(action.payload);
    },
    removeSnapshot: (state, action: PayloadAction<string>) => {
      state.snapshots = state.snapshots.filter(snapshot => snapshot.id !== action.payload);
    },
    updateSnapshot: (state, action: PayloadAction<{ id: string, newData: any }>) => {
      const { id, newData } = action.payload;
      const snapshotToUpdate = state.snapshots.find(snapshot => snapshot.id === id);
      if (snapshotToUpdate) {
        snapshotToUpdate.data = newData;
      }
    },
    batchFetchSnapshotsRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
      batchFetchSnapshotsSuccess: (state, action: PayloadAction<{
        snapshots: WritableDraft<Snapshot>[]      }>) => {
      state.loading = false;
      state.snapshots = action.payload.snapshots;
    },
    batchFetchSnapshotsFailure: (state, action: PayloadAction<{ error: string }>) => {
      state.loading = false;
      state.error = action.payload.error;
    },
    batchUpdateSnapshotsRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
      batchUpdateSnapshotsSuccess: (state, action: PayloadAction<{
        snapshots: WritableDraft<Snapshot>[]      }>) => {
      state.loading = false;
      state.snapshots = action.payload.snapshots;
    },
    batchUpdateSnapshotsFailure: (state, action: PayloadAction<{ error: string }>) => {
      state.loading = false;
      state.error = action.payload.error;
    },
    batchRemoveSnapshotsRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    batchRemoveSnapshotsSuccess: (state, action: PayloadAction<string[]>) => {
        state.loading = false;
        state.snapshots = state.snapshots.filter(snapshot => !action.payload.includes(snapshot.id));
      },
    batchRemoveSnapshotsFailure: (state, action: PayloadAction<{ error: string }>) => {
      state.loading = false;
      state.error = action.payload.error;
    },
  },
});

export const {
  addSnapshot,
  removeSnapshot,
  updateSnapshot,
  batchFetchSnapshotsRequest,
  batchFetchSnapshotsSuccess,
  batchFetchSnapshotsFailure,
  batchUpdateSnapshotsRequest,
  batchUpdateSnapshotsSuccess,
  batchUpdateSnapshotsFailure,
  batchRemoveSnapshotsRequest,
  batchRemoveSnapshotsSuccess,
  batchRemoveSnapshotsFailure,
} = snapshotSlice.actions;

export default snapshotSlice.reducer;
export type { SnapshotState };
