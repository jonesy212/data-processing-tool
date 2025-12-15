// RootSagas.ts
// RootSaga.ts
import { useNotification } from '@/app/state/context/NotificationContext';
import { useNotification } from '@/app/state/context/NotificationContext';
import { NotificationTypeEnum } from '@/app/features/support/UnifiedNotificationTypes';
import { all, fork } from 'redux-saga/effects';
import NOTIFICATION_MESSAGES from '@/app/features/support/NotificationMessages';
import { apiSagas } from '@/app/state/redux/sagas/apiSagas'
import { calendarSagas } from '@/app/state/redux/sagas/calendarSagas';
import { clientSagas } from '@/app/state/redux/sagas/clientSaga';
import { dataAnalysisSagas } from '@/app/state/redux/sagas/dataAnalysisSagas';
import { dataSagas } from '@/app/state/redux/sagas/dataSaga';
import { detailsSagas } from '@/app/state/redux/sagas/detailsSaga';
import { documentSagas } from '@/app/state/redux/sagas/documentSagas';
import { markerSagas } from '@/app/state/redux/sagas/markerSagas';
import { phaseSagas } from '@/app/state/redux/sagas/personaSagas/phaseSaga';
import promptSagas from '@/app/state/redux/sagas/promptSagas';
import { snapshotSagas } from '@/app/state/redux/sagas/snapshotSagas';
import { taskSagas } from '@/app/state/redux/sagas/taskSagas';
import { teamSagas } from '@/app/state/redux/sagas/teamSagas';
import { tenantSagas } from '@/app/state/redux/sagas/tenantSags';
import { todoSagas } from '@/app/state/redux/sagas/todoSagas';
import { undoRedoSagas } from '@/app/state/redux/sagas/UndoRedoSaga';
import { userSagas } from '@/app/state/redux/sagas/userSagas';
import { videoSagas } from '@/app/state/redux/sagas/videoSagas';

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
    notify.useNotification({
      "rootSagaError",
      "Error in rootSaga",
      NOTIFICATION_MESSAGES.Sagas.ROOT_SAGA_ERROR,
      new Date,
      NotificationTypeEnum.OPERATION_ERROR
    });
  }
}
