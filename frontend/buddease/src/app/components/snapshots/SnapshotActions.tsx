//snapshots/SnapshotActions.ts

import { createAction } from '@reduxjs/toolkit';
import { Data } from '../models/data/Data';
import { SnapshotStoreConfig } from './SnapshotStore';

export const SnapshotActions = {
    add: createAction<SnapshotStoreConfig<Data>>('addSnapshot'),
    removeSnapshot: createAction<string>("removeSnapshot"),
    updateSnapshot: createAction<{ id: string, newData: any }>("updateSnapshot"),
  
    // Batch actions for fetching snapshots
    batchFetchSnapshotsRequest: createAction("batchFetchSnapshotsRequest"),
    batchFetchSnapshotsSuccess: createAction<{ snapshots: SnapshotStoreConfig<Data>[] }>("batchFetchSnapshotsSuccess"),
    batchFetchSnapshotsFailure: createAction<{ error: string }>("batchFetchSnapshotsFailure"),
  
    // Batch actions for updating snapshots
    batchUpdateSnapshotsRequest: createAction<{ ids: string[], newData: any[] }>("batchUpdateSnapshotsRequest"),
    batchUpdateSnapshotsSuccess: createAction<{ snapshots: SnapshotStoreConfig<Data>[] }>("batchUpdateSnapshotsSuccess"),
    batchUpdateSnapshotsFailure: createAction<{ error: string }>("batchUpdateSnapshotsFailure"),
  
    // Batch actions for removing snapshots
    batchRemoveSnapshotsRequest: createAction<string[]>("batchRemoveSnapshotsRequest"),
    batchRemoveSnapshotsSuccess: createAction<string[]>("batchRemoveSnapshotsSuccess"),
    batchRemoveSnapshotsFailure: createAction<{ error: string }>("batchRemoveSnapshotsFailure"),
}