// RootSaga.ts
import { all } from 'redux-saga/effects';
import { apiSagas } from './sagas/apiSagas';
import { dataAnalysisSagas } from './sagas/dataAnalysisSagas';
import { dataSagas } from './sagas/dataSaga';
import { taskSagas } from './sagas/taskSagas';
import { todoSagas } from './sagas/todoSagas';
// import { calendarSagas } from './calendar/calendarSagas';

export function* rootSaga() {
  yield all([
    ...taskSagas,
    ...todoSagas,
    ...calendarSagas,
    ...apiSagas,
    ...dataSagas,
    ...dataAnalysisSagas,
    ...userSaga
    // Add more sagas as needed

    
  ]);
}

