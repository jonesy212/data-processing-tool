// sagas/snapshotSagas.ts
import { Data } from '@/app/models/data/Data';
import { Snapshot } from '@/app/snapshots/Snapshot';
import { SnapshotActions } from '@/app/snapshots/SnapshotActions';
import { YourResponseType } from '@/app/components/typings/types';
import { call, put, takeLatest } from 'redux-saga/effects';

// Replace with the actual API endpoints or functions
const api = new Api();

// Worker saga for handling fetching snapshots
function* handleFetchSnapshots() {
  try {
    // Replace 'fetchSnapshots' with your actual API call to fetch snapshots
    const response = yield call(api.fetchSnapshots);
    yield put(SnapshotActions.batchFetchSnapshotsSuccess({ snapshots: response.data }));
  } catch (error) {
    yield put(SnapshotActions.batchFetchSnapshotsFailure({ error: error.message }));
  }
}

// Worker saga for handling updating snapshots
function* handleUpdateSnapshots(action: ReturnType<typeof SnapshotActions.batchUpdateSnapshotsSuccess>) {
  try {
    // Replace 'updateSnapshots' with your actual API call to update snapshots
    const response: YourResponseType   = yield call(api.updateSnapshots, action.payload);
    yield put(SnapshotActions.batchUpdateSnapshotsSuccess({ snapshots: response.data }));
  } catch (error) {
    yield put(SnapshotActions.batchUpdateSnapshotsFailure({ error: error.message }));
  }
}


// Worker saga for handling removing snapshots
function* handleRemoveSnapshots(action: ReturnType<typeof SnapshotActions.batchFetchSnapshotsSuccess>) {
  try {
    // Replace 'removeSnapshots' with your actual API call to remove snapshots
    const response = yield call(api.removeSnapshots, action.payload);
    yield put(SnapshotActions.batchRemoveSnapshotsSuccess(action.payload as Snapshot<Data, Data>));
  } catch (error) {
    yield put(SnapshotActions.batchRemoveSnapshotsFailure({ error: error.message }));
  }
}

// Watcher saga to watch for corresponding actions
export function* watchSnapshotSagas() {
  yield takeLatest(SnapshotActions.batchFetchSnapshotsRequest.type, handleFetchSnapshots);
  yield takeLatest(SnapshotActions.batchUpdateSnapshotsRequest.type, handleUpdateSnapshots);
  yield takeLatest(SnapshotActions.batchRemoveSnapshotsRequest.type, handleRemoveSnapshots);

}


export function* snapshotSagas() {
  yield watchSnapshotSagas();
}