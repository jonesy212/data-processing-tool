//snapshots/SnapshotActions.ts

import { createAction } from '@reduxjs/toolkit';
import { Data } from '../models/data/Data';
import Snapshot from '../state/stores/SnapshotStore';

export const SnapshotActions = {
    add: createAction<Snapshot<Data>>('addSnapshot'),
    removeSnapshot: createAction<string>("removeSnapshot"),
    updateSnapshot: createAction<{ id: string, newData: any }>("updateSnapshot"),
  
    // Batch actions for fetching snapshots
    batchFetchSnapshotsRequest: createAction("batchFetchSnapshotsRequest"),
    batchFetchSnapshotsSuccess: createAction<{ snapshots: Snapshot<Data>[] }>("batchFetchSnapshotsSuccess"),
    batchFetchSnapshotsFailure: createAction<{ error: string }>("batchFetchSnapshotsFailure"),
  
    // Batch actions for updating snapshots
    batchUpdateSnapshotsRequest: createAction<{ ids: string[], newData: any[] }>("batchUpdateSnapshotsRequest"),
    batchUpdateSnapshotsSuccess: createAction<{ snapshots: Snapshot<Data>[] }>("batchUpdateSnapshotsSuccess"),
    batchUpdateSnapshotsFailure: createAction<{ error: string }>("batchUpdateSnapshotsFailure"),
  
    // Batch actions for removing snapshots
    batchRemoveSnapshotsRequest: createAction<string[]>("batchRemoveSnapshotsRequest"),
    batchRemoveSnapshotsSuccess: createAction<string[]>("batchRemoveSnapshotsSuccess"),
    batchRemoveSnapshotsFailure: createAction<{ error: string }>("batchRemoveSnapshotsFailure"),
}