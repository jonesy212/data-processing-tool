// RootSagas.ts
// RootSaga.ts
import { calendarSagas } from '@/core/components/calendar/Calendar';
import { detailsSagas } from '@/core/components/models/data/Details';
import { teamSagas } from '@/core/components/teams/Team';
import NOTIFICATION_MESSAGES from '@/core/features/support/NotificationMessages';
import { NotificationTypeEnum } from '@/core/features/support/UnifiedNotificationTypes';
import { useNotification } from '@/core/state/context/NotificationContext';
import { apiSagas } from '@/core/state/redux/sagas/apiSagas';
import { clientSagas } from '@/core/state/redux/sagas/clientSaga';
import { dataAnalysisSagas } from '@/core/state/redux/sagas/dataAnalysisSagas';
import { dataSagas } from '@/core/state/redux/sagas/dataSaga';
import { documentSagas } from '@/core/state/redux/sagas/documentSagas';
import { markerSagas } from '@/core/state/redux/sagas/markerSagas';
import { phaseSagas } from '@/core/state/redux/sagas/personaSagas/phaseSaga';
import promptSagas from '@/core/state/redux/sagas/promptSagas';
import { snapshotSagas } from '@/core/state/redux/sagas/snapshotSagas';
import { taskSagas } from '@/core/state/redux/sagas/taskSagas';
import { tenantSagas } from '@/core/state/redux/sagas/tenantSags';
import { todoSagas } from '@/core/state/redux/sagas/todoSagas';
import { undoRedoSagas } from '@/core/state/redux/sagas/UndoRedoSaga';
import { userSagas } from '@/core/state/redux/sagas/userSagas';
import { videoSagas } from '@/core/state/redux/sagas/videoSagas';
import { all, fork } from 'redux-saga/effects';

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
      fork(videoSagas),
      fork(clientSagas),
      fork(promptSagas),
      fork(markerSagas),
      fork(teamSagas),
      fork(tenantSagas),
      fork(documentSagas),
      fork(undoRedoSagas)
      // Add more sagas here...
    ]);
  } catch (error) {
    console.error('Error in rootSaga:', error);
    notify({
      message: "Error in rootSaga",  // Changed from "rootSagaError"
      content: NOTIFICATION_MESSAGES.Sagas.ROOT_SAGA_ERROR,  // Changed from "Error in rootSaga"
      timestamp: new Date(),
      type: NotificationTypeEnum.OPERATION_ERROR,
      // Add other required properties based on NotificationOptions interface
    });
  }
}
