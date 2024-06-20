//snapshots/SnapshotActions.ts

import { createAction } from '@reduxjs/toolkit';
import { Data } from '../models/data/Data';
import { SnapshotStoreConfig } from './SnapshotConfig';
import { Snapshot } from './SnapshotStore';

export const SnapshotActions = {
    add: createAction<Snapshot<Data>>('addSnapshot'),
    removeSnapshot: createAction<string>("removeSnapshot"),
    updateSnapshot: createAction<{ id: string, newData: any }>("updateSnapshot"),
    fetchSnapshotData: createAction<string>("fetchSnapshotData"),
    batchTakeSnapshots: createAction<{
        snapshots: {
             snapshots: Snapshot<Data>[]
        }        
    }>('batchTakeSnapshots'),    // Batch actions for fetching snapshots
    batchFetchSnapshotsRequest: createAction("batchFetchSnapshotsRequest"),
    batchFetchSnapshotsSuccess: createAction<{ snapshots: SnapshotStoreConfig<Data, Data>[] }>("batchFetchSnapshotsSuccess"),
    batchFetchSnapshotsFailure: createAction<{ error: string }>("batchFetchSnapshotsFailure"),
    handleSnapshotSuccess: createAction<Snapshot<Data>, string>("handleSnapshotSuccess"),
    handleSnapshotFailure: createAction<string>("handleSnapshotFailure"),
    // Batch actions for updating snapshots
    batchUpdateSnapshotsRequest: createAction<{ ids: string[], newData: any[] }>("batchUpdateSnapshotsRequest"),
    batchUpdateSnapshotsSuccess: createAction<{ snapshots: SnapshotStoreConfig<Data, Data>[] }>("batchUpdateSnapshotsSuccess"),
    batchUpdateSnapshotsFailure: createAction<{ error: string }>("batchUpdateSnapshotsFailure"),
  
    // Batch actions for removing snapshots
    batchRemoveSnapshotsRequest: createAction<string[]>("batchRemoveSnapshotsRequest"),
    batchRemoveSnapshotsSuccess: createAction<string[]>("batchRemoveSnapshotsSuccess"),
    batchRemoveSnapshotsFailure: createAction<{ error: string }>("batchRemoveSnapshotsFailure"),
}