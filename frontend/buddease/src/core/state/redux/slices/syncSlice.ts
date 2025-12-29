// syncSlice.ts
// app/state/slices/syncSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SyncState {
  queue: Array<{
    entityId: string;
    timestamp: string;
    status: 'pending' | 'syncing' | 'synced' | 'failed';
    error?: string;
  }>;
  isOnline: boolean;
  lastSync: string | null;
  stats: {
    totalSynced: number;
    totalFailed: number;
    pendingCount: number;
  };
}

const initialState: SyncState = {
  queue: [],
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  lastSync: null,
  stats: {
    totalSynced: 0,
    totalFailed: 0,
    pendingCount: 0
  }
};

const syncSlice = createSlice({
  name: 'sync',
  initialState,
  reducers: {
    entityQueued: (state, action: PayloadAction<{ entityId: string; timestamp: string }>) => {
      state.queue.push({
        entityId: action.payload.entityId,
        timestamp: action.payload.timestamp,
        status: 'pending'
      });
      state.stats.pendingCount++;
    },
    entitySyncing: (state, action: PayloadAction<{ entityId: string }>) => {
      const item = state.queue.find(item => item.entityId === action.payload.entityId);
      if (item) item.status = 'syncing';
    },
    entitySynced: (state, action: PayloadAction<{ entityId: string }>) => {
      const item = state.queue.find(item => item.entityId === action.payload.entityId);
      if (item) {
        item.status = 'synced';
        state.stats.totalSynced++;
        state.stats.pendingCount--;
      }
      state.lastSync = new Date().toISOString();
    },
    entityFailed: (state, action: PayloadAction<{ entityId: string; error: string }>) => {
      const item = state.queue.find(item => item.entityId === action.payload.entityId);
      if (item) {
        item.status = 'failed';
        item.error = action.payload.error;
        state.stats.totalFailed++;
        state.stats.pendingCount--;
      }
    },
    networkStatusChanged: (state, action: PayloadAction<{ isOnline: boolean }>) => {
      state.isOnline = action.payload.isOnline;
    },
    clearQueue: (state) => {
      state.queue = [];
      state.stats.pendingCount = 0;
    }
  }
});

export const {
  entityQueued,
  entitySyncing,
  entitySynced,
  entityFailed,
  networkStatusChanged,
  clearQueue
} = syncSlice.actions;

export default syncSlice.reducer;