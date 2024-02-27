// RootSaga.ts
import { all, fork } from 'redux-saga/effects';
import { useNotification } from '../../hooks/commHooks/useNotification';
import NOTIFICATION_MESSAGES from '../../support/NotificationMessages';
import { apiSagas } from './sagas/apiSagas';
import { calendarSagas } from './sagas/calendarSagas';
import { dataAnalysisSagas } from './sagas/dataAnalysisSagas';
import { dataSagas } from './sagas/dataSaga';
import { detailsSagas } from './sagas/detailsSaga';
import { phaseSagas } from './sagas/personaSagas/phaseSaga';
import { snapshotSagas } from './sagas/snapshotSagas';
import { taskSagas } from './sagas/taskSagas';
import { todoSagas } from './sagas/todoSagas';
import { userSagas } from './sagas/userSagas';

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
      // Add more sagas here...
    ]);
  } catch (error) {
    console.error('Error in rootSaga:', error);
    notify("Error in rootSaga", NOTIFICATION_MESSAGES.Sagas.ROOT_SAGA_ERROR, new Date, NotificationTypeEnum.OperationError);
  }
}
