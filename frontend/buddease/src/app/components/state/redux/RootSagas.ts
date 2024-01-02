// RootSaga.ts
import { all } from 'redux-saga/effects';
// import { todoSagas } from './todos/todoSagas';
// import { calendarSagas } from './calendar/calendarSagas';

export function* rootSaga() {
  yield all([
    ...taskSagas,
    // ...todoSagas,
    // ...calendarSagas,
    // Add more sagas as needed
  ]);
}
