// RootSaga.ts
import { all } from 'redux-saga/effects';
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

  // import { calendarSagas } from './calendar/calendarSagas';

// import { calendarSagas } from './calendar/calendarSagas';

export function* rootSaga() {
  yield all([
    taskSagas,
    todoSagas,
    calendarSagas,
    apiSagas,
    dataSagas,
    dataAnalysisSagas,
    userSagas,
    snapshotSagas,
    detailsSagas,
    phaseSagas,
     
    // Add more sagas as needed

    
  ]);
}

