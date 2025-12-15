// app/state/sagas/syncSagas.ts
import { put, call, takeLatest, select, takeEvery } from 'redux-saga/effects';
import { HybridSyncService } from '@/app/services/HybridSyncService';
import { entitySyncing, entitySynced, entityFailed } from '../slices/syncSlice';

export function* syncSagas() {
  yield takeLatest('SYNC/ENTITY_QUEUED', syncEntitySaga);
  yield takeLatest('SYNC/NETWORK_ONLINE', bulkSyncSaga);
  yield takeEvery('SYNC/BULK_SYNC', bulkSyncSaga);
}

function* syncEntitySaga(action: any) {
  const { entity } = action.payload;
  
  // Mark as syncing
  yield put(entitySyncing({ entityId: entity.id }));
  
  try {
    const service = new HybridSyncService(yield select());
    yield call([service.sqlRepo, 'save'], entity);
    yield call([service, 'markSynced'], entity.id);
    
    // Mark as synced
    yield put(entitySynced({ entityId: entity.id }));
    
  } catch (error: any) {
    yield put(entityFailed({ 
      entityId: entity.id, 
      error: error.message 
    }));
  }
}

function* bulkSyncSaga() {
  try {
    const service = new HybridSyncService(yield select());
    const result = yield call([service, 'syncPending']);
    
    yield put({
      type: 'NOTIFICATIONS/SHOW',
      payload: {
        type: 'success',
        message: `Synced ${result.success} items, ${result.failed} failed`
      }
    });
    
  } catch (error: any) {
    yield put({
      type: 'NOTIFICATIONS/SHOW',
      payload: {
        type: 'error',
        message: `Bulk sync failed: ${error.message}`
      }
    });
  }
}