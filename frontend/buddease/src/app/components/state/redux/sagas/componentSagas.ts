//componentSagas.ts

import { call, put } from "redux-saga/effects";

// Saga function to handle fetching a component
function* fetchComponentSaga(action) {
  try {
    // Call your API function to fetch the component
    const response = yield call(api.fetchComponent, action.payload);
    // Dispatch success action if the request is successful
    yield put(ComponentActions.fetchComponentSuccess(response.data));
  } catch (error) {
    // Dispatch failure action if there's an error
    yield put(ComponentActions.fetchComponentFailure(error.message));
  }
}

// Saga function to handle updating a component success
function* updateComponentSuccessSaga(action) {
  try {
    // Perform any additional logic needed for update success
    yield put(ComponentActions.updateComponentSuccessAdditionalLogic(action.payload));
  } catch (error) {
    // Handle error if additional logic fails
    yield put(ComponentActions.updateComponentFailure(error.message));
  }
}

// Saga function to handle updating a component failure
function* updateComponentFailureSaga(action) {
  try {
    // Perform any additional logic needed for update failure
    yield put(ComponentActions.updateComponentFailureAdditionalLogic(action.payload));
  } catch (error) {
    // Handle error if additional logic fails
    yield put(ComponentActions.updateComponentFailure(error.message));
  }
}

// Watcher saga to listen for specific actions and run corresponding sagas
export function* watchComponentActions() {
  yield takeLatest(ComponentActions.addComponent.type, addComponentSaga);
  yield takeLatest(ComponentActions.removeComponent.type, removeComponentSaga);
  yield takeLatest(ComponentActions.updateComponent.type, updateComponentSaga);
  yield takeLatest(ComponentActions.fetchComponentRequest.type, fetchComponentSaga);
  yield takeLatest(ComponentActions.updateComponentSuccess.type, updateComponentSuccessSaga);
  yield takeLatest(ComponentActions.updateComponentFailure.type, updateComponentFailureSaga);
}
