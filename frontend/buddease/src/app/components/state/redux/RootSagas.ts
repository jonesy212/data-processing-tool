// RootSaga.ts
import { all } from 'redux-saga/effects';
import { taskSagas } from './sagas/taskSagas';
// import { calendarSagas } from './calendar/calendarSagas';

export function* rootSaga() {
  yield all([
    ...taskSagas,
    // ...todoSagas,
    // ...calendarSagas,
    // Add more sagas as needed

    
  ]);
}

