// RootSaga.ts
import { NotificationTypeEnum, useNotification } from '@/app/components/support/NotificationContext';
import { all, fork } from 'redux-saga/effects';
import NOTIFICATION_MESSAGES from '../../support/NotificationMessages';
import { apiSagas } from './sagas/apiSagas';
import { calendarSagas } from './sagas/calendarSagas';
import { clientSagas } from './sagas/clientSaga';
import { dataAnalysisSagas } from './sagas/dataAnalysisSagas';
import { dataSagas } from './sagas/dataSaga';
import { detailsSagas } from './sagas/detailsSaga';
import { documentSagas } from './sagas/documentSagas';
import { markerSagas } from './sagas/markerSagas';
import { phaseSagas } from './sagas/personaSagas/phaseSaga';
import promptSagas from './sagas/promptSagas';
import { snapshotSagas } from './sagas/snapshotSagas';
import { taskSagas } from './sagas/taskSagas';
import { teamSagas } from './sagas/teamSagas';
import { tenantSagas } from './sagas/tenantSags';
import { todoSagas } from './sagas/todoSagas';
import { userSagas } from './sagas/userSagas';
import { videoSagas } from './sagas/videoSagas';
import { undoRedoSagas } from './sagas/UndoRedoSaga';

// Add more sagas as needed...

const { notify } = useNotification()

export function* rootSaga() {
  try {
    yield all([
      fork(taskSagas),
      fork(todoSagas),
      fork(calendarSagas),
      fork(apiSagas),
      fork(dataSagas),
      fork(dataAnalysisSagas),
      fork(userSagas),
      fork(snapshotSagas),
      fork(detailsSagas),
      fork(phaseSagas),
      fork(userSagas),
      fork(videoSagas),
      fork(clientSagas),
      fork(promptSagas),
      fork(markerSagas),
      fork(teamSagas),
      fork(tenantSagas),
      fork(snapshotSagas),
      fork(documentSagas),
      fork(undoRedoSagas)
      // Add more sagas here...
    ]);
  } catch (error) {
    console.error('Error in rootSaga:', error);
    notify(
      "rootSagaError",
      "Error in rootSaga",
      NOTIFICATION_MESSAGES.Sagas.ROOT_SAGA_ERROR,
      new Date,
      NotificationTypeEnum.OperationError);
  }
}
