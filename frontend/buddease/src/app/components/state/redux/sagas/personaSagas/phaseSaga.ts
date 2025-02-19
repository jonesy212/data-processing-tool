// phaseSaga.ts

import { PhaseActions } from '@/app/components/phases/PhaseActions';
import NOTIFICATION_MESSAGES from '@/app/components/support/NotificationMessages';
import { call, put, takeLatest } from 'redux-saga/effects';
import PhaseService from '../../../../phases/PhaseService';

// Worker Saga: Fetch Phase
function* fetchPhaseSaga(action: any) {
  try {
    const phaseId = action.payload;
    const phase = yield call(PhaseService.fetchPhase, phaseId); // Adjust the service method accordingly
    yield put(PhaseActions.fetchPhaseSuccess({ phase }));
  } catch (error) {
    yield put(
      PhaseActions.fetchPhaseFailure({
        error: NOTIFICATION_MESSAGES.Phase.FETCH_PHASE_ERROR,
      })
    );
  }
}

// Worker Saga: Update Phase
function* updatePhaseSaga(action: any) {
  try {
    const { phaseId, phaseData } = action.payload;
    const updatedPhase = yield call(PhaseService.updatePhase, phaseId, phaseData); // Adjust the service method accordingly
    yield put(PhaseActions.updatePhaseSuccess({ phase: updatedPhase }));
  } catch (error) {
    yield put(
      PhaseActions.updatePhaseFailure({
        error: NOTIFICATION_MESSAGES.Phase.UPDATE_PHASE_ERROR,
      })
    );
  }
}

// Watcher Saga: Watches for the fetch and update phase actions
function* watchPhaseSagas() {
  yield takeLatest(PhaseActions.fetchPhaseRequest.type, fetchPhaseSaga);
  yield takeLatest(PhaseActions.updatePhaseRequest.type, updatePhaseSaga);
}

// Export the phase saga
export function* phaseSagas() {
  yield watchPhaseSagas();
}
